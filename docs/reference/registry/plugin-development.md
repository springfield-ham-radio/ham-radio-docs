# Plugin Development

The Ham Radio Registry supports third-party radio modules distributed via npm. This guide explains how to create, structure, and publish your own radio module.

## 1. Naming and Identification

- **Official modules**: `@springfield/radio-module-{manufacturer}`
- **Third-party modules**: `radio-module-{manufacturer}` or `@scope/radio-module-{manufacturer}`
- Include `radio-module` in your package keywords
- Add a `springfield` field to your `package.json`:

```json
{
  "springfield": {
    "pluginType": "radio-module",
    "manufacturer": "Your Manufacturer Name"
  }
}
```

## 2. Directory Structure

Your module should follow this structure:

```
radio-module-manufacturer/
├── package.json
├── configs/              # One configuration file per radio model
│   ├── model1.json      # Complete configuration with shared references
│   └── model2.json      # Complete configuration with shared references
├── src/                  # Module source code
│   ├── shared/           # Shared components
│   │   ├── schemas/      # Shared schemas
│   │   ├── protocols/    # Shared protocols
│   │   └── codecs/       # Shared codecs
│   ├── index.ts          # Main entry point
│   └── codec-factory.ts  # Codec factory
└── README.md
```

## 3. Configuration Files

Each radio model should have a configuration file in `configs/` that describes its capabilities, memory layout, protocols, and references to shared components.

The top-level `version` field is the module package version, not a separate per-radio schema version. Release tooling stamps it from `package.json`; do not bump it in the JSON by hand.

Example:
```json
{
  "$schema": "https://springfield-ham-radio.com/schemas/radio-config-v1.json",
  "id": {
    "model": "baofeng-uv5r",
    "name": "Baofeng UV-5R",
    "manufacturer": "Baofeng"
  },
  "version": "1.0.0",
  "description": "UV-5R and UV-5RE Plus models",
  "capabilities": {
    "memoryRead": true,
    "memoryWrite": true,
    "channelProgramming": true,
    "settingsProgramming": true,
    "liveControl": false
  },
  "serialConfig": { ... },
  "memoryConfig": { ... },
  "readMemory": [ ... ],
  "writeMemory": [ ... ],
  "settingsSchema": {
    "model": "baofeng-uv5r",
    "settingsSchema": { "$ref": "src/shared/schemas/settings-schema.json" },
    "channelSchema": { "$ref": "src/shared/schemas/channel-schema.json" }
  },
  "codec": {
    "type": "shared",
    "reference": "src/shared/codecs/baofeng-codec.ts",
    "config": { ... }
  },
  "metadata": { ... }
}
```

## 4. Shared Components

Place reusable codecs, schemas, and protocol definitions in the `src/shared/` directory. Reference them in your configuration files using `$ref` or `reference` fields.

## 5. Codec Factory

Implement a codec factory in `src/codec-factory.ts`:

```typescript
import type { RadioCodec, RadioModelId } from '@springfield/ham-radio-api';
import type { ILogLayer } from 'loglayer';
import { BaofengCodec } from './shared/codecs/baofeng-codec.js';

export interface CodecFactory {
  createCodec(modelId: RadioModelId, config: any, logger: ILogLayer): Promise<RadioCodec>;
}

export class BaofengCodecFactory implements CodecFactory {
  async createCodec(modelId: RadioModelId, config: any, logger: ILogLayer): Promise<RadioCodec> {
    return new BaofengCodec(modelId, config, logger);
  }
}

export { BaofengCodecFactory as CodecFactory };
```

## 6. Publishing Your Module

- Publish your module to npm:

```sh
yarn publish --access public
```

- Users can now install your module and the registry will automatically discover it.

## 7. Testing Your Module

- Use the registry's API to validate and test your module locally before publishing.
- Ensure your configuration files and shared components are valid and referenced correctly.

## 8. Security Best Practices

- Validate all configuration files against schemas
- Avoid executing arbitrary code in codecs
- Use sandboxing for custom codecs if possible
- Provide checksums or signatures for critical files

## 9. Resources

- [Architecture](./architecture) - Learn about the registry's technical design
- [API Reference](./api-reference) - Explore the full API
- [Examples](./examples) - See more usage examples 
