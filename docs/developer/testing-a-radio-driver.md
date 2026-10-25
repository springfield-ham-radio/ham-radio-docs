# Test a radio driver

Tests live in the module repository. The release zip is JSON only, so Vitest files, fixtures, and devDependencies stay in git ([ADR 0004](/developer/adr/0004-radio-modules-json-only)).

The examples below are [radio-module-baofeng](https://github.com/springfield-ham-radio/radio-module-baofeng), the same UV-5R module as [Build a radio driver](/developer/build-a-radio-driver). Kenwood's schema test is the second file to copy.

## Fixtures

[ADR 0007](/developer/adr/0007-mit-license-no-chirp-code) is the rule for bytes you commit:

- Project source is MIT unless a file says otherwise.
- Do not paste or adapt CHIRP (GPL-2) or other GPL source. You may read it to learn a layout, then re-express that layout as JSON.
- Binary or image fixtures used in codec and protocol tests must come from your own radio dumps, or from other rights-clear captures by project contributors. They must not come from CHIRP's distributed images or from another GPL fixture bundle.
- The repositories do not run an automated provenance checker. The pull request that adds a binary fixture says where it came from: which radio, who captured it, and which tool.

`radio-module-baofeng` does not commit an image file. Its tests build a `RadioProgram` and a `Uint8Array` in the test. That style does not need a dump. Use it when you can state the bytes yourself.

When a test needs a real capture, store it under something like `test/fixtures/` and name the radio in the file name. [ham-radio-driver](https://github.com/springfield-ham-radio/ham-radio-driver/tree/main/test/fixtures) keeps serial logs this way (`kenwood-th-d74-block-0x01ea-serial.json`). A serial log is not a CHIRP image. Treat a full memory image the same way: your dump, described in the pull request.

The restore file in the hardware checklist below is a HamBench **Save** of a read you just did. It is not a CHIRP `.img`.

## Unit test layout

Baofeng scripts:

| Script | What it runs |
| --- | --- |
| `yarn test` | `yarn test:unit` |
| `yarn test:unit` | `vitest run test/unit` |
| `yarn test:integration` | `vitest run test/integration` |
| `yarn check:driver-versions` | `node scripts/check-driver-versions.mjs` |

Layout:

```
test/unit/codec-factory.test.ts
test/unit/pack-release-zip.test.ts
test/integration/baofeng-module.test.ts
```

`test/unit/codec-factory.test.ts` loads `configs/baofeng-uv5r.json`, checks `codec.type` and the memory-map `$ref`, and constructs `createMemoryMapCodec()` with `MockLogLayer`. `test/integration/baofeng-module.test.ts` encodes and decodes one channel and one settings change through that codec.

Copy the Kenwood check too. `radio-module-kenwood` `test/unit/radio-config-schema.test.ts` reads every `configs/*.json` and expects `new SchemaValidator().validateRadioProtocol(config).valid`. Do the same for the memory map with `validateMemoryMap`.

```typescript
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMemoryMapCodec, SchemaValidator } from '@springfield/ham-radio-utils';
import { MockLogLayer } from 'loglayer';
import { describe, expect, it } from 'vitest';

const rootDirectory = join(dirname(fileURLToPath(import.meta.url)), '../..');

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(join(rootDirectory, relativePath), 'utf8'));
}

describe('UV-5R config', () => {
  it('matches the protocol schema and round-trips a codec', () => {
    const config = readJson('configs/baofeng-uv5r.json') as {
      id: { model: string };
      memoryConfig: never;
      memoryMap: { $ref: string };
    };
    const memoryMap = readJson(join('src/shared/memory-maps', 'uv5r-settings.json'));
    const validator = new SchemaValidator();

    expect(validator.validateRadioProtocol(config).valid).toBe(true);
    expect(validator.validateMemoryMap(memoryMap).valid).toBe(true);

    const codec = createMemoryMapCodec({
      radioModel: config.id.model as never,
      memoryMap: memoryMap as never,
      memoryConfig: config.memoryConfig,
      logger: new MockLogLayer(),
    });

    expect(codec.decode).toBeTypeOf('function');
    expect(codec.encode).toBeTypeOf('function');
  });
});
```

DevDependencies used for that test are `@springfield/ham-radio-utils`, `@springfield/ham-radio-api`, and `loglayer`. They are not files in the zip.

`scripts/check-driver-versions.mjs` fails CI when a config's canonical content changes without a higher `version`. A shared schema change bumps every config that `$ref`s it ([ADR 0006](/developer/adr/0006-per-driver-config-semver)). The catalog version is that same config version ([ADR 0009](/developer/adr/0009-per-radio-modules)).

## Hardware test checklist

Run this on the zip from [Build a radio driver](/developer/build-a-radio-driver) before you publish. Install it with **Preferences → Drivers → Install from file…**. The badge is **Unverified**. That is expected for a file that is not in the catalog yet ([Install radios](/guide/install-radios)).

Use a radio whose memories you can restore. On a borrowed radio, the owner agrees to a read, a write, and a restore before you start. The restore image is the first read, saved, and not edited.

1. **Install.** Install the one-radio zip. Confirm the model id matches `id.model` (UV-5R: `baofeng-uv5r`).
2. **Add the radio.** **Preferences → Radios**: name, manufacturer, model, serial port, baud when the driver lists more than one, and the usual transmit power. [Read and write memory](/guide/radio).
3. **Read.** On the Radio page, open the radio and **Read**. If the transfer fails, **Save serial log** on the Debug tab before you retry.
4. **Save the restore point.** **File → Save As…** to a new file. Do not edit this file. This is the image you will write back.
5. **Change one channel.** Save As a second, working file. Edit one channel: name, receive frequency, and a tone. Leave every other channel as the read left it.
6. **Change one setting.** On the Settings tab, change one radio-wide field in a group you mapped. UV-5R's groups are `basic`, `advanced`, `workmode`, `other`, `dtmf`, and `service`. Confirm the group you edited is one of the map's `groups` ids, with the label from the map.
7. **Write.** Write the working file. If the protocol has `write.skip` ranges, pick a channel and a setting whose bytes sit outside those ranges. UV-5R skips `3312–3327` and `3568–3583` on write. A field inside a skip range will not change on the radio.
8. **Read back.** Read again into a new file. Confirm the channel name, frequency, tone, and the setting. Confirm a channel you did not edit is unchanged.
9. **Restore.** Open the file from step 4 and Write it. Read again. Confirm the channel and the setting match the original read.
10. **Listen.** Confirm the radio still receives on a channel you restored. If you are licensed for the frequency and the owner expects a transmit check, confirm the power and tone you restored match the radio's own menu. Skip transmit when you are not licensed for that frequency or the owner did not ask for it.

Stop if step 8 or step 9 does not match. Fix the protocol or the map, bump `version`, pack again, and repeat from step 1. Do not publish a driver that has not been restored onto the radio you tested.
