# Channel library

The **Channels** tab is a portable channel list stored in HamBench’s SQLite database (not in a radio memory file). Rows can be ordinary channels or imported repeaters.

## Add to a radio

1. Open a memory file or [import from a radio](/guide/radio).
2. On **Channels**, select one or more rows.
3. Choose **Add to radio**. HamBench fills unused slots in order.
4. Use **Write** on the Radio page to program the device.

On the Radio page, select memory channels and **Save to library** to store them for reuse across radios.

## Import CSV

**Import CSV** accepts:

- HamBench library CSV (`name,tx_mhz,rx_mhz,…,kind`)
- RepeaterBook website CSV exports (personal use, registered RepeaterBook account)
- CHIRP CSV exports, including RepeaterBook’s CHIRP export

RepeaterBook and CHIRP rows get a **Repeater** badge. RepeaterBook `Frequency` is the downlink (radio receive); `Input Freq` is the uplink (radio transmit). Data courtesy of RepeaterBook.com when that export is used.

You can mark or unmark a row as a repeater in the channel editor. Export the library as CSV from the same page.
