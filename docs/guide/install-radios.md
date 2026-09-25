# Install radios

HamBench does not bundle every radio. You install **JSON radio modules** for the models you use. The generic driver stays in the app; only configs, schemas, and memory maps are downloaded.

## Official install

1. On first launch (empty catalog), the app opens **Install radios**.
2. It fetches the official catalog from GitHub Pages: `https://springfield-ham-radio.github.io/radio-module-catalog/catalog.json`
3. Select modules and click **Install**.
4. The app downloads each module zip from GitHub Releases, checks `sha256:…` integrity, extracts JSON under the app data directory, and adds radios to the local catalog as source `installed`.

Later, open **Preferences → Drivers**. Installed and available drivers are grouped by manufacturer, with each model listed underneath. The version under an installed model is that radio's driver version. **Install** on a model adds only that radio from the manufacturer zip. Official modules show a marker when a newer zip is in the catalog; **Update** downloads that module.

After a driver is installed, add the radio you own under **Preferences → Radios**: a name, that manufacturer and model, the baud rate when the driver lists more than one, and the serial port you usually use. The Radio page opens those radios as cards.

After a driver update that adds CAT fields, **Update** (or reinstall) the module so the catalog picks up the new `cat` profile.

## Local file (unsupported)

**Install from file…** accepts a module zip (same layout as GitHub Release assets) or a single radio config JSON (with sibling `$ref` files).

The app shows an **at your own risk** warning. Local installs are source `user`, labeled **Unverified**, and are not updated from the official catalog. This still works if the official catalog is unreachable.

## Supported models

| Module | Radios | Memory | Live CAT |
| --- | --- | --- | --- |
| Baofeng | UV-5R (same config covers UV-5RE Plus) | Clone (`S` / `X` blocks) | No |
| Kenwood | TH-F6 | Live CAT memories (`MR` / `MW` / `MNA`) | Yes |
| Kenwood | TH-D74 | Clone (256-byte blocks at 57600) | Yes (same PC port) |
| Kenwood | TM-D710A | Clone (256-byte blocks at 9600, body PC port) | Yes (same PC port) |

Clone vs CAT is independent: a radio can dump EEPROM and still speak Kenwood CAT on the programming cable.
