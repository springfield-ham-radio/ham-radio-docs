# Sniffer

The sniffer sits between the computer and the radio so you can capture clone-protocol bytes. Use a **debug cable** toward the computer and a **programming cable** toward the radio.

HamBench talks to a separate headless [ham-radio-sniffer](https://github.com/springfield-ham-radio/ham-radio-sniffer) process over HTTP. The desktop app can install, start, and stop that process on this computer or over SSH.

## Connection

1. Open **Preferences → Sniffer**. Set **Host** (default `127.0.0.1`) and **Port** (default `3010`). **Install directory** defaults to `~/ham-radio-sniffer`; **Run command** defaults to `yarn start`.
2. Open **Radio → Sniffer**. **Computer port** is the debug cable; **Radio port** is the programming cable. Turn on **Bridge ports**.
3. Traffic streams into the Traffic panel. **Save capture** writes JSON for offline review.

**Preferences → Serial ports** can hide macOS system devices from these lists and can name a port so the selector shows that name. See [Read and write memory](/guide/radio).

If the bridge is running and byte counts stay at 0, the selected serial device is not receiving. On the sniffer host, `SNIFFER_LOG_LEVEL=debug yarn start` prints every chunk as hex.

You can start the sniffer yourself (`yarn start` after build) and only set Host and Port.

## Install, start, and stop

These controls are in **Preferences → Sniffer** and run only in the desktop app. HamBench does **not** install Node for you.

1. **Install** copies bundled sniffer sources, then runs `yarn install` and `yarn build` so `serialport` matches that machine. Use it again to update.
2. **Running** starts a detached process and waits until `/api/health` responds. If start fails, the error includes `sniffer.log` tails.
3. An older install shows **Update available** when its version is behind the copy bundled in HamBench.

With **Control over SSH** off, commands run on this computer. Loopback binds `127.0.0.1`; any other host binds `0.0.0.0`.

With **Control over SSH** on, the same commands run on **Host** (`192.168.1.10` or `pi@192.168.1.10`). SSH uses key or agent authentication only (`BatchMode=yes`). There is no tunnel; allow the listen port through the host firewall if needed.

Disconnect [CAT](/guide/cat) on a port before sniffing that same serial device.

## Capture files

Saved captures use kind `springfield-ham-radio-sniffer-capture` and include port metadata, coalesced UI frames, and a `log` array in the same `SEND` / `RECV` shape as Radio import/write logs. Prefer `log` when comparing a sniffer capture to a driver serial log.
