# Live CAT

The **CAT** page is live computer control for radios whose module sets `capabilities.liveControl` and a Kenwood `cat` block. It is not a memory editor. Import and Write stay on the [Radio](/guide/radio) page.

You can run more than one CAT session at once. Each serial port is its own session, so a TM-D710A on one cable and a TH-F6 on another can both stay connected.

Memory protocol is separate. TH-F6 programs memories with live CAT (`catRead` / `catWrite`). TH-D74 and TM-D710A clone EEPROM and still speak Kenwood CAT on the same PC port. Wake CR, VFO count, `FO` vs `FQ`, and mode/power names come from the radio module `cat` fields.

## Connect

1. Install a radio module that declares live control. Reinstall after a driver update so the catalog picks up the `cat` profile.
2. Open the **CAT** tab (between Radio and Channels) and click **Connect**.
3. Choose manufacturer, model, serial port, and baud when the driver lists more than one speed. Match the radio’s PC-port baud.
4. Plug the programming cable into the computer, then into the radio **PC** jack on the main body (not the control-head COM port on a TM-D710).
5. Confirm **Connect**. HamBench sends `ID` (and a wake CR first when the module sets `wakeCr`) and polls each VFO the module declares.
6. **Connect another** adds a radio on a free serial port. Ports already in a CAT session are omitted.

Radios that set `liveControl` to false, or omit it and have no Kenwood CAT handshake (for example a Baofeng UV-5R), do not appear. A Kenwood module installed before `liveControl` existed is still listed from its protocol or manufacturer until you reinstall it.

## Operate

Each connected radio has a panel with VFO cards. Edit the MHz field and press Enter or leave the field to QSY. Mode and power lists are the names from the radio module. **Log contact** opens the station log with frequency, mode, and band filled in.

**Hold to transmit** sends `TX` while the button is held and `RX` on release. That keys microphone audio on whichever side currently has PTT, not audio from the DATA port. A warning on the Control tab explains this; dismiss it with the close button if you already know.

## Disconnect

**Disconnect** on that radio’s panel leaves other CAT sessions up. Disconnect a port before Import, Write, or Sniffer on **that** serial port. Import and Write label CAT-busy ports and will not use them.

## Debug

The **Debug** tab shows SEND/RECV bytes. Capture is **off** by default so a long session does not fill memory. Connect still records the handshake (wake CR, `ID`, VFO reads), including failed connects. Turn **Capture** on to record live poll and command traffic; turning it off stops recording but keeps what is already on screen. **Clear** drops the buffer without disconnecting.

When more than one session is open, choose the radio (or **Last failed connect**) in the menu. Each frame is hex plus an ASCII preview. **Save serial log** writes the same JSON shape as Radio import/write logs.

A good TM-D710 connect shows `ID\r` → `ID TM-D710\r`, then `BC\r`, `FO 0\r`, and `FO 1\r`. No reply after `ID` usually means the wrong jack, baud, or serial device. Modules that set `wakeCr` also show a wake CR first.
