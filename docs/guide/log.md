# Station log

The **Log** page stores QSO contacts in the app database. Add a contact with **Add contact**, or from **Log contact** on a [CAT](/guide/cat) VFO card, which fills in frequency, mode, and band.

**Import ADIF** and **Export ADIF** read and write an ADI file. Confirmed cards are `QSL_SENT` and `QSL_RCVD` set to `Y`.

## Map

**Map** shows a world map above the table. Drag the bar between the map and the table to make the map taller or shorter. That size is remembered. Tiles come from [OpenFreeMap](https://openfreemap.org/), which serves OpenStreetMap data with no account and no API key. The map needs a network connection. MapLibre draws the OpenFreeMap and OpenStreetMap attribution on the map.

A contact is plotted at the center of its Maidenhead grid (**Their grid**). Contacts with an empty or invalid grid stay in the table and are counted under the map.

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
