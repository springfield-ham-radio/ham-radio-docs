# Antennas

HamBench stores **stations** (operating sites) and the antennas at each site. Types are generic; it does not yet ship manufacturer catalogs.

## Add a station

1. Open **Preferences → Stations**.
2. **Home** is created automatically. Click **Add** for Cabin, Portable, or another site.
3. Set a **Nickname**. Optionally enter a **Maidenhead grid** (2, 4, or 6 characters) and/or **latitude** and **longitude** in degrees, minutes, and decimal seconds (N/S and E/W).
4. Editing the grid fills lat/lon with the **cell center**. Editing coordinates keeps that point and derives a 6-character grid.

A Callook license grid is copied onto Home only when Home has no location yet. That FCC mailing-address grid is a starting point, not the shack — you can always overwrite it. You cannot delete the last station. Removing a station also removes its antennas.

## Add an antenna at a station

1. Select the station, then click **Add** in the antennas list.
2. Pick a type (dipole, inverted-V, quarter-wave vertical, 3-element Yagi, magnetic loop, end-fed, dual-band 2 m / 70 cm vertical, 2 m Yagi, or 70 cm Yagi).
3. Set **Height AGL** in meters. For a Yagi or dipole, set **Heading** in true degrees (boom or broadside of maximum radiation). Verticals and loops are omnidirectional and do not use heading.
4. Optionally name it and limit **Bands** (160 m through 70 cm). Empty bands keep the type defaults.
5. For a dipole, inverted-V, or HF Yagi, turn on **Traps** if the antenna uses LC traps for extra HF bands. A tribander Yagi starts trapped (20/15/10, traps at 15 m and 10 m). A single-band 40 m dipole plus traps becomes 80/40. Leave traps off for a fan or parallel-wire dipole.

The same physical antenna at two sites is two records. The list stays on this computer (localStorage). It is not a radio module.

## Use it on Propagation

The Propagation page has an **Antenna** card:

- **Station** — choose the site. Grid and coordinates are shown when set.
- **Owned** — choose an antenna at that site. HamBench shows estimated gain, beamwidth, and takeoff from the type and height.
- **What-if** — try another type, height, heading, bands, or traps without changing Preferences. **Add to station** saves that scratch antenna onto the selected site.

These numbers are catalog estimates. For HF they hint at later skip rings. For 2 m / 70 cm they are line-of-sight (and tropo), not a WWV opening. They are not a VOACAP forecast and not a globe overlay yet.
