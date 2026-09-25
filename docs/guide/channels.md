# Channel library

The **Channels** tab is a portable channel list stored in HamBench’s SQLite database (not in a radio memory file). Rows can be ordinary channels or imported repeaters.

## Groups

The tab menu starts with **All**, which lists every saved channel. **Weather**, **FRS**, and **GMRS** are built in. Other tabs are groups you create.

- Select one or more rows and choose **New group** to put those channels in a new group. The channels stay in **All** and can belong to more than one group.
- Choose **Empty group** to create a group with no channels, switch to that tab, then **Import CSV**. Imported rows are added to the open group and to **All**.
- Choose **Rename** on a group tab to change the name shown on that tab.
- **Remove group** deletes the tab. The channels remain in **All** and in any other groups they belong to.

Weather, FRS, and GMRS cannot be used as names for a group you create.

## Built-in groups

**Weather**, **FRS**, and **GMRS** are standard channel lists. They are not stored in your library, and they do not appear under **All**. You cannot rename, edit, or delete them.

- **Weather** is receive-only: NOAA WX1–WX7 and Environment Canada WX8–WX10.
- **FRS** is channels 1–22.
- **GMRS** is simplex channels 1–7 and 15–22, plus repeater pairs 15–22. A repeater row receives on the output and transmits on the input. FRS-only channels 8–14 are not included.

Select rows and choose **Add to radio** to copy them into unused memory slots. **Export CSV** on one of these tabs exports that list.

Hide any of these tabs under **Preferences → Channels**.

Import and export follow the open tab. **All** imports and exports the whole library. A group you created imports into that group and exports only its channels. A built-in tab exports its channels and does not accept an import.

## Add to a radio

1. On the Radio page, open the radio and load its memory (open a memory file or [import from the radio](/guide/radio)). Each open radio keeps its own memory.
2. On **Channels**, select one or more rows.
3. Choose **Add to radio**, then pick the radio. HamBench fills unused slots on that radio in order. A radio with no loaded memory, or with no unused slots, cannot be selected.
4. Use **Write** on that radio's card to program the device.

Select rows and choose **Delete** to remove those channels from the library and from every group.

On the Radio page, select memory channels and **Save to library** to store them for reuse across radios. **Add from library** on that page copies saved channels into unused slots on the open radio.

## Replace a memory slot

On the Radio page, open a memory channel and choose **Replace from library**. The picker uses the same group tabs as this page. Pick a saved channel to copy its name, frequencies, and tones into that slot. The memory slot number stays the same. Power, mode, scan, and other radio-specific settings stay as they are. Write to the radio to program the device.

## Import CSV

**Import CSV** accepts:

- HamBench library CSV (`name,tx_mhz,rx_mhz,…,kind`)
- RepeaterBook website CSV exports (personal use, registered RepeaterBook account)
- CHIRP CSV exports, including RepeaterBook’s CHIRP export

RepeaterBook and CHIRP rows get a **Repeater** badge. RepeaterBook `Frequency` or `Output Freq` is the downlink (radio receive); `Input Freq` is the uplink (radio transmit). Uplink and downlink tones map to the radio transmit and receive tones. RepeaterBook rows store the repeater call sign in **Call sign**, not in **Name**. Name stays blank so you can label the channel yourself. CHIRP’s name column is still the channel name. Importing the same RepeaterBook file again moves a call sign that was previously stored as the name into **Call sign**.

You can mark or unmark a row as a repeater in the channel editor. Repeater rows also store **Use** (open or closed) and **On-air**. RepeaterBook `Use` and `Op Status` fill those fields when the export includes them. The short CSV does not, so HamBench looks them up from the public RepeaterBook city listing. Export the library as CSV from the same page.
