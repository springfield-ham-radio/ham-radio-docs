# License Lookup and Privilege Filtering

Springfield maps a US amateur call sign to a license class so the UI can flag transmit frequencies outside the operator’s privileges.

## Data sources

- **Callook.info** provides a live JSON lookup backed by daily FCC ULS amateur dumps: `https://callook.info/{callsign}/json`
- **`license-classes.json`** and **`bands.json`** in `@springfield/ham-radio-utils` define Springfield license-class IDs and which bands each class may use

Callook is US-only. Club, military, and RACES records often have an empty `operClass` and do not map to a personal ham class.

## Operator class mapping

`operatorClassToLicenseClassId` in `@springfield/ham-radio-utils` maps Callook / FCC operator-class names onto Springfield IDs:

| Callook `operClass` | Springfield license class |
| --- | --- |
| `TECHNICIAN`, `TECHNICIAN PLUS` | Technician |
| `GENERAL` | General |
| `EXTRA`, `AMATEUR EXTRA` | Amateur Extra |
| `ADVANCED` | Advanced (Grandfathered) |
| `NOVICE` | Novice (Grandfathered) |
| empty / unknown | no mapping (`undefined`) |

GMRS, FRS, and Weather Radio classes are not returned by Callook amateur lookups; they remain available for manual assignment when needed.

## Privilege checks

`BandPlan.hasPrivilege(frequencyHz, licenseClassId)` finds the band that contains the frequency and returns whether that band’s `privileges` array includes the license-class ID. Frequencies outside every known band return `false`.

Applications should evaluate **transmit** frequency only. Receive-only allocations (for example weather radio) should not warn based on RX alone.

## Example

```typescript
import { BandPlan, operatorClassToLicenseClassId } from '@springfield/ham-radio-utils';

const licenseClassId = operatorClassToLicenseClassId('TECHNICIAN');
const bandPlan = new BandPlan();

if (licenseClassId) {
  const allowed = bandPlan.hasPrivilege(146_520_000, licenseClassId);
}
```
