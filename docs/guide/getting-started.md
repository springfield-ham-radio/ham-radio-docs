# Install HamBench

Installers for macOS (Apple Silicon), Windows, and Linux are on [GitHub Releases](https://github.com/springfield-ham-radio/ham-radio-ui/releases). The macOS build is the file whose name includes **macOS** and ends in `.dmg`. Linux files include **Linux** (`.deb`, `.rpm`, or `.AppImage`). Windows files include **Windows**.

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

## First launch

1. Open HamBench.
2. If no drivers are installed, **Install radios** opens so you can pick official modules. Later, manage them under **Preferences → Drivers**.
3. Add each radio you own under **Preferences → Radios**, then open it on the Radio page and use **Import** or **Open** to load memory. To clone a radio you have not added yet, use **Import from Radio** on the empty Radio page.

See [Install radios](/guide/install-radios) and [Read and write memory](/guide/radio).

## Zoom

**View → Zoom In**, **Zoom Out**, and **Zoom to 100%** change the window scale. Each step is 20%, from 20% through 1000%.

On macOS the shortcuts are Command-= (or Command-+), Command-minus, and Command-0. On Windows and Linux they are Control-= (or Control-+), Control-minus, and Control-0. Pinch the trackpad, or hold Control and scroll, to zoom as well. Zoom lasts until you quit.
