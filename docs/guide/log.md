# Station log

The **Log** page stores QSO contacts in the app database. Add a contact with **Add contact**, or from **Log contact** on a [CAT](/guide/cat) VFO card, which fills in frequency, mode, band, and the radio you logged from. Frequency is required. When only one radio is saved, **Add contact** selects it and fills **TX power** from that radio. Choosing a radio, or **Log contact** from CAT, does the same. Clearing the radio clears that power. An existing contact keeps the power already saved on it until the radio changes. The antenna is filled from the radio when that radio has one mounted antenna for the band, such as a handheld whip under **Preferences → Radios**. Otherwise the selected station antenna is filled in when one is selected under **Preferences → Stations** and its bands include the frequency. After the frequency is set, the radio menu lists saved radios configured for that band, and the antenna menu lists antennas on the chosen radio and station antennas configured for that band. A radio whose installed driver does not declare bands stays in the list. A selection that does not cover the band is cleared. Choosing a radio fills transmit power and chooses the antenna again.

**Import ADIF** and **Export ADIF** read and write an ADI file. Confirmed cards are `QSL_SENT` and `QSL_RCVD` set to `Y`.

Leaving **Callsign** looks up a US license and fills an empty name, QTH, and grid. The QTH is the license city and state. The grid is the one from that lookup, or the Maidenhead locator for the license mailing address when the lookup has no coordinates. `FN31` in an empty grid field is the example text, not a filled value.

## Summary

A panel on the left counts the contacts in the table:

| Count | Meaning |
| --- | --- |
| QSOs | Contacts listed |
| Unique Calls | Distinct callsigns |
| POTA | Contacts with a park reference |
| QRZ | Contacts uploaded to QRZ.com |

**Bands**, **Modes**, **Radios**, and **Antennas** list how many contacts used each one, busiest first. Radios and antennas count only contacts that have one recorded. A POTA contact is one whose ADIF record has `SIG` `POTA` and `SIG_INFO`, `MY_SIG` `POTA` and `MY_SIG_INFO`, or `POTA_REF` / `MY_POTA_REF`. QRZ counts `QRZCOM_QSO_UPLOAD_STATUS` of `Y` (uploaded) or `M` (uploaded, then edited). Search limits these counts to the contacts that match.

## Table

| Column | Contents |
| --- | --- |
| Local Time | Start time in the computer's timezone. Click the heading to reverse the order. Stored and exported times stay UTC. |
| Call | Callsign |
| Band | ADIF band, such as `40M` or `70CM`. Filled from the frequency when the band is empty. |
| Mode | Mode, with submode after a slash when one is set |
| Freq | Frequency in MHz. Required when logging a contact. |
| RST | RST sent and received |
| Name | Name |
| POTA | Park reference |
| QRZ | A check when the contact is uploaded to QRZ.com, or `M` when it changed after upload |
| Notes | Comment |
| Radio | Saved radio used for the contact. The menu lists saved radios configured for this band. Choosing one fills TX power from that radio. |
| Antenna | Antenna used for the contact. The menu lists antennas mounted on the chosen radio, then station antennas configured for this band. A radio with one mounted antenna for the band fills that in. The label includes manufacturer and model when they are set. |
| Card | QSL card state, same colors as the map |

## Map

**Map** shows a world map above the table. Drag the bar between the map and the table to make the map taller or shorter. That size is remembered. Tiles come from [OpenFreeMap](https://openfreemap.org/), which serves OpenStreetMap data with no account and no API key. The map needs a network connection. By default the basemap follows the app theme: Liberty when the theme is light, Dark when it is dark. **Preferences → Appearance → Map style** can pin it to Liberty, Bright, Positron, Dark, or Fiord instead. That menu shows a small preview of the basemap. MapLibre draws the OpenFreeMap and OpenStreetMap attribution on the map.

A contact is plotted at the center of its Maidenhead grid (**Grid**). Contacts with an empty or invalid grid stay in the table and are counted under the map.

The marker color is the QSL card state from **Card sent** and **Card received** on the contact:

| Color | Meaning |
| --- | --- |
| Gray | No card |
| Amber | Card sent |
| Blue | Card received |
| Green | Both sent and received |
| Violet | Several contacts in the same grid with different card states |

Click a marker to open that contact. When several contacts share a grid, the popup lists them. The **Card** column in the table uses the same states. Search filters both the table and the map.

Stations from **Preferences → Stations** appear as pins when they have a grid or coordinates. A pin uses the station's latitude and longitude when those are set, and otherwise the center of the grid. The nickname is drawn under the pin. Click a pin to see the location. A station with no location is left off the map.
