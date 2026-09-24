# Channel library

The **Channels** tab is a portable channel list stored in HamBench’s SQLite database (not in a radio memory file). Rows can be ordinary channels or imported repeaters.

## Groups

The tab menu starts with **All**, which lists every saved channel. Other tabs are groups you create.

- Select one or more rows and choose **New group** to put those channels in a new group. The channels stay in **All** and can belong to more than one group.
- Choose **Empty group** to create a group with no channels, switch to that tab, then **Import CSV**. Imported rows are added to the open group and to **All**.
- Choose **Rename** on a group tab to change the name shown on that tab.
- **Remove group** deletes the tab. The channels remain in **All** and in any other groups they belong to.

Import and export follow the open tab. **All** imports and exports the whole library. A group tab imports into that group and exports only its channels.

## Add to a radio

1. Open a memory file or [import from a radio](/guide/radio).
2. On **Channels**, select one or more rows.
3. Choose **Add to radio**. HamBench fills unused slots in order.
4. Use **Write** on the Radio page to program the device.

Select rows and choose **Delete** to remove those channels from the library and from every group.

On the Radio page, select memory channels and **Save to library** to store them for reuse across radios.

## Import CSV

**Import CSV** accepts:

- HamBench library CSV (`name,tx_mhz,rx_mhz,…,kind`)
- RepeaterBook website CSV exports (personal use, registered RepeaterBook account)
- CHIRP CSV exports, including RepeaterBook’s CHIRP export

RepeaterBook and CHIRP rows get a **Repeater** badge. RepeaterBook `Frequency` or `Output Freq` is the downlink (radio receive); `Input Freq` is the uplink (radio transmit). Uplink and downlink tones map to the radio transmit and receive tones. RepeaterBook rows store the repeater call sign in **Call sign**, not in **Name**. Name stays blank so you can label the channel yourself. CHIRP’s name column is still the channel name. Importing the same RepeaterBook file again moves a call sign that was previously stored as the name into **Call sign**.

You can mark or unmark a row as a repeater in the channel editor. Repeater rows also store **Use** (open or closed) and **On-air**. RepeaterBook `Use` and `Op Status` fill those fields when the export includes them. The short CSV does not, so HamBench looks them up from the public RepeaterBook city listing. Export the library as CSV from the same page.
