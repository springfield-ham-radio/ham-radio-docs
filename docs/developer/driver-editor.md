# Driver editor

HamBench can draft a radio's protocol from the desktop app. The form builds serial settings, memory segments, protocol steps, the channel schema, and the channel half of the memory map. Byte tokens are chosen as hex, one ASCII character, or a placeholder, so the saved JSON stays syntactically valid while the protocol is still incomplete.

Radio-wide settings groups and the live CAT command profile are still JSON files. See [Protocol DSL](/developer/protocols/dsl) and [Memory-map DSL](/developer/protocols/memory-map).

## Open it

Choose **View → Developer Mode**. The check is remembered. HamBench opens the **Driver** page and adds a Driver tab next to WaveBench. A warning at the top of the page explains that this edits the programming protocol. Close it to hide it until the next launch.

Turn Developer Mode off to hide that tab. A draft you already started stays on disk until you replace it.

## What the form writes

| Section | JSON |
| --- | --- |
| Setup | Identity (`id`, `version`, `description`, `capabilities`, optional schema and memory-map paths), serial settings (`serialConfig`, including at least one supported baud rate, the default baud rate chosen from those speeds, and optional RTS/CTS or line levels), and `memoryConfig` segments. Segment addresses are hex in the form, shown as `0x0000`; the JSON stores them as numbers. `endAddress` is inclusive |
| Channel | The channel JSON Schema: optional name, receive and transmit frequencies in hertz, and optional CTCSS or DCS tones. The JSON panel is that schema file. The protocol document keeps only its path |
| Memory | Channel bindings and the structs that hold the name, frequencies, and tones. Addresses are hex in the form, shown as `0x0000`; the JSON stores a struct `seek` as `0x0000`. The JSON panel is that memory-map file. The protocol document keeps only its path. Settings groups are not in this file |
| Read | `readMemory` exchanges, chunked reads, and CAT reads |
| Write | `writeMemory` exchanges, chunked writes, and CAT writes. Skip ranges are hex in the form, shown as `0x0000`; the JSON stores those addresses as numbers |

**Example** loads a short clone-style driver you can walk through. **Load installed** copies a module that is already installed. **Import** and **Export** read and write a JSON file. The copy icon at the upper right of the JSON panel puts the same document on the clipboard.

## Debug a step

On Read or Write, the step list, the form, and the guide start at an even split between the form and the guide. Drag the dividers to change those widths. Drag a step or a byte by its handle to change the order. Select a step or use Previous and Next. What the computer sends, and what the radio is expected to answer, sits in its own section, apart from the help text. The sequence diagram draws the whole protocol, the same way the radio Driver tab does, and highlights the step that is open in the form. Choose a step in the diagram to open it.

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

Export the protocol JSON into a module's `configs/` directory. Copy the channel schema and the memory map from their tabs into the files beside it, and point the Setup paths at those files. Then follow [Create a radio module](/developer/radio-module-dev) and [Publish a module](/developer/publishing-modules).
