# Read and write memory

The **Radio** page programs clone-style and live-CAT memories. Live VFO, mode, power, and PTT are on the **CAT** tab when that radio's driver supports live control. See [Live CAT](/guide/cat).

## Your radios

Add each radio you use under **Preferences → Radios**. Give it a name, then choose the manufacturer, model, baud rate when the driver lists more than one, and the serial port that cable usually uses. Install the model first under **Preferences → Drivers**.

On the Radio page, **Add radio** opens one of those radios as a card. Each card keeps its own memory. **Stack** lists cards in a column. **Tile** places them side by side, so two radios on two serial cables can stay open together. Close a card from its header; that does not delete the radio from Preferences.

Import and Write use the radio on that card. The **CAT** tab is on that card only when its driver supports live control. The connect dialog starts on the saved serial port. Pick another port if this cable is plugged into a different adapter. The saved port does not change.

## Import and write

- **Import** reads memory from a connected radio.
- **Write** programs the loaded image back to the radio.
- **Open** and **Save** work with JSON memory files. Save writes the current file when one is open; **File → Save As…** always asks for a destination. Shortcuts: `⌘O` / `Ctrl+O`, `⌘S` / `Ctrl+S`, `⇧⌘S` / `Ctrl+Shift+S`.

Until a memory is loaded, a radio card offers **Import from Radio** and **Open Memory**.

Write uses the radio on that card. Import and Write open on the card's saved serial port and let you choose a different one. Baud rate comes from the radio in Preferences. File → Import and File → Write use the card you last clicked.

**Preferences → Serial ports** hides common macOS system devices from port lists. You can add extra names to hide. You can also give a system port a name, such as `usbserial-A50285BI` as "Kenwood cable". Import, Write, CAT, saved radios, and Sniffer show that name in the serial port selector. The system name stays on the menu item so you can still tell adapters apart.

## CAT-busy ports

While a [CAT](/guide/cat) session holds a serial port, Import and Write will not use that port. The dialogs label CAT-busy ports. Disconnect that session, or pick another adapter.

## Debug

Every import and write captures serial bytes. Inspect traffic on the **Debug** tab, or **Save serial log** if the transfer fails.

The **Driver** tab shows the read/write protocol as a sequence diagram (or syntax-highlighted JSON) and the channel/settings memory maps.

**Radio → Hex Dump** shows the loaded image next to the memory map. Click a mapped byte to select that field.

## Settings

The **Settings** tab shows radio-wide options grouped by the driver. Pick a main group in the list (or the menu on a narrow window). Related fields in that group appear as headed sections in the panel. Groups, sub-groups, labels, and any warnings come from the radio’s memory map. Field and section descriptions appear as a help icon after the label. Boolean settings put the switch on the same row as the label. **Preferences → Appearance → Settings columns** controls how many fields appear per row (1–4; default 2). The same layout is used for radio-specific fields when you edit a channel.

## Channels on the radio

Click a channel in the Radio channels table to edit name, frequencies, tones, and radio-specific settings. Shift-click selects every channel from the last row you clicked through the row you Shift-click. Command-click adds or removes that one channel and leaves the rest of the selection in place. The same gestures work on a row or its checkbox. **Replace from library** copies a saved channel’s name, frequencies, and tones into that memory slot. The picker uses the same group tabs as the Channels page. Power, mode, scan, and other radio-specific settings stay as they are. Drag the grip to move a channel into another occupied slot. **Add channel** programs an unused slot. **Add from library** copies one or more saved channels into unused slots, in the order you select them. Radio-specific settings on those new slots use this radio’s defaults. **Remove** clears slots. **Save to library** copies selected memories into the [channel library](/guide/channels). On the Channels page, **Add to radio** asks which open radio should receive the selected channels.
