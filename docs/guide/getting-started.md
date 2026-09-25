# Install HamBench

Installers for macOS (Apple Silicon), Windows, and Linux are on [GitHub Releases](https://github.com/springfield-ham-radio/ham-radio-ui/releases).

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
3. Add each radio you own under **Preferences → Radios**, then open it on the Radio page and use **Import** or **Open** to load memory.

See [Install radios](/guide/install-radios) and [Read and write memory](/guide/radio).
