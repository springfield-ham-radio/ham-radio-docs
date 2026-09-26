# Driver editor

HamBench can draft a radio's protocol from the desktop app. The form builds serial settings, memory segments, and protocol steps. Byte tokens are chosen as hex, one ASCII character, or a placeholder, so the saved JSON stays syntactically valid while the protocol is still incomplete.

The memory-map field layout and the live CAT command profile are still JSON files. See [Protocol DSL](/developer/protocols/dsl) and [Memory-map DSL](/developer/protocols/memory-map).

## Open it

Choose **View → Developer Mode**. The check is remembered. HamBench opens the **Driver** page and adds a Driver tab next to WaveBench.

Turn Developer Mode off to hide that tab. A draft you already started stays on disk until you replace it.

## What the form writes

| Section | JSON |
| --- | --- |
| Identity | `id`, `version`, `description`, `capabilities`, optional schema and memory-map paths |
| Serial | `serialConfig`, including the open baud rate and optional RTS/CTS or line levels |
| Memory | `memoryConfig` segments. `endAddress` is inclusive |
| Read | `readMemory` exchanges, chunked reads, and CAT reads |
| Write | `writeMemory` exchanges, chunked writes, and CAT writes |

**Example** loads a short clone-style driver you can walk through. **Load installed** copies a module that is already installed. **Import** and **Export** read and write a JSON file. **Copy JSON** puts the same document on the clipboard.

## Debug a step

On Read or Write, select a step or use Previous and Next. The guide says what the computer sends and what the radio is expected to answer, and the sequence diagram draws that one step.

Errors name the field that is wrong. A step with an error is left out of the JSON preview so the preview still parses. Warnings, such as a chunked read with no `$data`, stay in the JSON and are called out in the guide.

Placeholders:

| Token | Meaning |
| --- | --- |
| `$address` | Current chunk byte address |
| `$block` | Current chunk index |
| `$chunkSize` | Chunk size as one byte |
| `$length` | Payload length as one byte |
| `$data` | Chunk payload |

## Publish

Export the JSON into a module's `configs/` directory. Add the memory map and schemas beside it, and point the Identity paths at those files. Then follow [Create a radio module](/developer/radio-module-dev) and [Publish a module](/developer/publishing-modules).
