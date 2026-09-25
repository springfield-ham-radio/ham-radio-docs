# License privileges

HamBench flags **transmit** frequencies on a radio's channels that the selected license cannot use.

Add people under **Preferences → Licenses**. Licenses are grouped by person. A person can hold no license, one license, or several — for example an amateur grant and a GMRS grant. Anyone may transmit on FRS, including a person with nothing on file. A person with no license is limited to FRS.

On a radio's **Channels** tab, choose which license to check. The list is grouped by person. Someone with no license appears as FRS. When only one license is saved, that license is selected for every radio that does not already have a choice. A single person with no license is selected the same way, so the radio is checked as FRS.

Amateur lookups use [Callook.info](https://callook.info/) (FCC ULS amateur dumps). Callook is US-only. Club, military, and RACES records often have an empty operator class; choose the class to use for privilege checks. GMRS lookups use the Skywave ULS mirror. An inactive GMRS grant stays on file and is not used for warnings.

Receive-only allocations such as Weather Radio (including Environment Canada WX8–WX10) are flagged from the transmit frequency. Receive frequency alone does not warn.

Developers: see [License lookup API](/developer/license-lookup).
