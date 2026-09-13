# Read and write memory

The **Radio** page programs clone-style and live-CAT memories.

## Import and write

- **Import** reads memory from a connected radio.
- **Write** programs the loaded image back to the radio.
- **Open** and **Save** work with JSON memory files. Save writes the current file when one is open; **File → Save As…** always asks for a destination. Shortcuts: `⌘O` / `Ctrl+O`, `⌘S` / `Ctrl+S`, `⇧⌘S` / `Ctrl+Shift+S`.

Until a memory is loaded, Radio tabs also offer **Import from Radio** and **Open Memory**.

Write uses the radio type stored in the memory document. You choose the serial port. Import remembers the last manufacturer and model (across restarts, if that radio is still installed). Import and Write remember the last serial port when that device is still present.

If the driver lists more than one programming baud rate, Import and Write let you pick the speed. The driver default is selected until you choose another; the last choice is remembered per radio.

**Preferences → Serial ports** hides common macOS system devices from port lists. You can add extra names to hide.

## CAT-busy ports

While a [CAT](/guide/cat) session holds a serial port, Import and Write will not use that port. The dialogs label CAT-busy ports. Disconnect that session, or pick another adapter.

## Debug

Every import and write captures serial bytes. Inspect traffic on the **Debug** tab, or **Save serial log** if the transfer fails.

**Radio → Driver** shows the read/write protocol as a sequence diagram (or JSON) and the channel/settings memory maps.

**Radio → Hex Dump** shows the loaded image next to the memory map. Click a mapped byte to select that field.

## Settings

The **Settings** tab shows radio-wide options grouped by the driver. Pick a main group in the list (or the menu on a narrow window). Related fields in that group appear as headed sections in the panel. Groups, sub-groups, labels, and any warnings come from the radio’s memory map.

## Channels on the radio

Click a channel in the Radio channels table to edit name, frequencies, tones, and radio-specific settings. Drag the grip to move a channel into another occupied slot. **Add channel** programs an unused slot; **Remove** clears slots. **Save to library** copies selected memories into the [channel library](/guide/channels).
