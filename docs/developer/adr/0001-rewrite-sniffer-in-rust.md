# ADR 0001: Rewrite the sniffer in Rust

- **Status:** Accepted
- **Date:** 2026-09-26

## Context

[ham-radio-sniffer](https://github.com/springfield-ham-radio/ham-radio-sniffer) is a headless process that bridges a debug cable and a programming cable so HamBench can capture clone-protocol bytes. HamBench talks to it over HTTP. The desktop app can install, start, and stop it locally or over SSH. See the [Sniffer](/guide/sniffer) user guide.

The process is a Nuxt/Nitro server on Node.js 26. Serial I/O uses `serialport` 13, which depends on `@serialport/bindings-cpp`. The sniffer's `.nvmrc` requires Node.js 26.

HamBench itself does not use that stack for the radio. Import and write go through `tauri-plugin-serialplugin` 3.0.7, which uses the Rust [`serialport`](https://crates.io/crates/serialport) crate (4.10.1 in the desktop app lockfile). A direct UV-5R import on a Raspberry Pi with that path succeeds.

A bridged import on the same Pi fails. The radio and the cables are fine. Picocom on the Pi and SerialTools on the Mac pass bytes in both directions. A direct Python open of the programming cable (`/dev/ttyUSB0`, CH340) gets the UV-5R ACK `06` about 40 ms after the magic `50 BB FF 20 12 07 25`. The sniffer, on Node v26.10.0 (libuv 1.52.1), writes that magic and then does not read the ACK until a later timer wakes the event loop. In one trace the read of `06 FF` landed 4.000 s after the write, on the tick of a 4 s timer. HamBench's exchange timeout is 5 s, so the driver records only the outbound magic and gives up. Once the loop does wake, the sniffer forwards the reply; a listen left open for 15 s received `06 FF` at about 12 s. The GPIO UART back to the computer is not the stall.

This matches an open bug in the native bindings. After a read returns `EAGAIN`, the poller marks the port readable, and the promise that calls `read` waits for a later event-loop turn:

- [serialport/bindings-cpp#239](https://github.com/serialport/bindings-cpp/pull/239), opened 2026-06-29, still open. The patch delivers poller events with `MakeCallback`.
- [serialport/bindings-cpp#243](https://github.com/serialport/bindings-cpp/pull/243), opened 2026-09-09, still open. It extends that patch to Windows completions.
- [serialport/node-serialport#3148](https://github.com/serialport/node-serialport/issues/3148), reported against Node.js 26.4 and later. The Node change is [nodejs/node#62969](https://github.com/nodejs/node/pull/62969).

Nobody maintaining the bindings has given a ship date. The last comment on #239 (2026-08-28) and on #243 (2026-09-10) treats the repository as unmaintained. The last published `@serialport/bindings-cpp` is 13.0.0, from 2024-12-23.

## Decision

Rewrite ham-radio-sniffer in Rust and open serial ports with the `serialport` crate, the same crate the desktop app already uses for a working import.

Ship one static binary. Keep the HTTP API so the Sniffer screen in HamBench stays a client of that process. Update the desktop install and start path when the binary replaces `yarn start`.

## Options considered

**Wait for `@serialport/bindings-cpp`.** The fix exists as an unmerged pull request. There is no release and no ETA, and the sniffer is pinned to the Node version that triggers the bug.

**Fork the native bindings.** Downstream projects have already pointed at patched trees. That still leaves the sniffer on Node 26 and on a native addon we would have to build per machine, which is the current install path.

**Python.** A short Python open of the same CH340 returned the ACK in 40 ms, so the operating system delivers the byte. A Python service would be a second runtime next to a desktop app whose working serial path is already Rust.

**Go, C, or assembly.** Any of those can open a UART. The serial implementation that already imported this radio on this Pi is the Rust `serialport` crate, and the desktop release job already builds Linux ARM64.

## Consequences

- The sniffer no longer depends on Node.js or `node-serialport`. A Raspberry Pi install copies a binary instead of running `yarn install` and `yarn build` on the device.
- CI for ham-radio-sniffer builds and tests the Rust crate, including a Linux ARM64 binary. `/api/health` reports the crate version.
- HamBench's SSH and local start scripts in `ham-radio-ui` launch that binary, still wait on `/api/health`, and still write `sniffer.log` and `sniffer.pid`. The default run command changes from `yarn start`.
- The [Sniffer](/guide/sniffer) user guide is updated in the same change as the install path. Until that lands, the guide still describes the Node process.
- Radio module JSON stays as it is. The UV-5R handshake is not part of this change.

## What the rewrite keeps

The bridge behavior and the HTTP contract stay compatible with the current HamBench client.

- Default listen address `127.0.0.1:3010`. `HOST` and `PORT` override it. Loopback stays on `127.0.0.1`; any other host binds `0.0.0.0`, matching the desktop start script. CORS allows a separate UI origin.
- `GET /` and `GET /api/health` return `{ "ok": true, "service": "ham-radio-sniffer", "version": "<crate version>" }`.
- `GET /api/ports` lists serial ports on the sniffer host.
- `POST /api/sniffer/start` accepts `computerPort`, `radioPort`, optional `baudRate` (default 9600), `logFile`, `rts`, and `dtr`. The two paths are required and must differ. `409` if a bridge is already running. `400` if the body is invalid.
- `POST /api/sniffer/stop` closes both ports and is safe when nothing is running. Packets and the serial log remain readable afterward.
- `GET /api/sniffer` returns session status, including byte counts, `writeErrors`, and whether each port is open.
- `GET /api/sniffer/events` is a server-sent event stream of `status`, `packet`, and `error` objects. Packet `data` is an array of byte values. Direction is `COMPUTER->RADIO` or `RADIO->COMPUTER`.
- `GET /api/sniffer/log` returns status, coalesced packets, and `file.data` in the SerialLogger shape (`metadata` plus `entries` of `SEND` / `RECV`). HamBench stores that payload on captures of kind `springfield-ham-radio-sniffer-capture`.
- Open both ports at 8N1 with RTS/CTS off. Assert RTS and DTR after open unless the request sets them false. Count bytes as soon as the UART delivers them, and forward each read to the other port immediately. Coalesce UI packets on direction change or after 15 ms idle. Group the on-disk `SEND` / `RECV` log on direction change, and flush it when the bridge stops.
- `SNIFFER_LOG_LEVEL` or `LOG_LEVEL` selects `debug`, `info` (default), `warn`, or `error`. Info logs port open and close, the first bytes on each port, and each bridge write. Debug logs every chunk as hex.
- A CLI still lists ports and bridges two paths: computer port, radio port, optional baud, `--log-file`, `--no-rts`, `--no-dtr`.

Reads must complete when the kernel has data. The failure this ADR records is a userspace wake-up bug, so a worker blocked in `read`, or an equivalent poll that runs the read on that wake-up, is the required shape. A timer must not be what delivers the next byte.
