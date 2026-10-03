# Install HamBench

Installers for macOS (Apple Silicon), Windows, and Linux are on [GitHub Releases](https://github.com/springfield-ham-radio/ham-radio-ui/releases). The macOS build is the file whose name includes **macOS** and ends in `.dmg`. Linux x64 files include **Linux-x64** (`.deb`, `.rpm`, or `.AppImage`). Linux files for a 64-bit Raspberry Pi include **Linux-arm64**. Windows files include **Windows**.

Packaged builds check that feed on launch and every few hours, download updates in the background, and prompt you to restart. Turn this off under **Preferences → Updates**.

## Unsigned builds

Builds are **unsigned** (no Apple notarization or Windows Authenticode yet).

### macOS Gatekeeper

Safari and other browsers quarantine the download. Current macOS often reports that as **“HamBench” is damaged and can’t be opened** instead of an unidentified-developer warning. The file is not corrupt. Do **not** move it to the Trash.

Clear the quarantine, then open the disk image:

```sh
xattr -cr ~/Downloads/HamBench*.dmg
```

If you already copied the app into Applications:

```sh
xattr -cr /Applications/HamBench.app
open /Applications/HamBench.app
```

Right-click → Open often does not dismiss this dialog.

### Windows SmartScreen

Choose **More info** → **Run anyway**.

## Raspberry Pi

On 64-bit Raspberry Pi OS (Pi 3, 4, 5, and Zero 2 W), install the **Linux-arm64** `.deb`. Apt also installs WebKitGTK, which draws the window:

```sh
sudo apt install ./HamBench-*-Linux-arm64.deb
```

A programming cable still needs the `dialout` group. See [Linux serial port](#linux-serial-port).

## Linux serial port

A programming cable shows up as `/dev/ttyUSB0`, or another `ttyUSB` or `ttyACM` name. Linux opens that device only for members of the `dialout` group. Until your user is in the group, HamBench reports permission denied when you select the port.

```sh
sudo usermod -aG dialout "$USER"
```

Reboot so the desktop session picks up the new group. Plug the cable in again, then select that port for Read or Write.

## First launch

1. Open HamBench.
2. If no drivers are installed, **Install radios** opens so you can pick official modules. Later, manage them under **Preferences → Drivers**.
3. Add each radio you own under **Preferences → Radios**, then open it on the Radio page and use **Read** or **Open** to load memory. To clone a radio you have not added yet, use **Read from Radio** on the empty Radio page, or **Radio → Read from Radio…** when no card is open.

See [Install radios](/guide/install-radios) and [Read and write memory](/guide/radio).

## Zoom

**View → Zoom In**, **Zoom Out**, and **Zoom to 100%** change the window scale. Each step is 20%, from 20% through 1000%.

On macOS the shortcuts are Command-= (or Command-+), Command-minus, and Command-0. On Windows and Linux they are Control-= (or Control-+), Control-minus, and Control-0. Pinch the trackpad, or hold Control and scroll, to zoom as well. Zoom lasts until you quit.
