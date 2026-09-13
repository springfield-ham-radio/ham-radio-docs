# License privileges

HamBench can look up a US amateur call sign and flag **transmit** frequencies outside that operator’s privileges.

Set your call sign in **Preferences**. The app uses [Callook.info](https://callook.info/) (FCC ULS amateur dumps). Callook is US-only. Club, military, and RACES records often have an empty operator class and do not map to a personal ham class.

GMRS, FRS, and Weather Radio (including Environment Canada WX8–WX10) are not returned by Callook amateur lookups; you can still assign those classes manually. Receive-only allocations such as weather radio should not warn based on RX alone.

Developers: see [License lookup API](/developer/license-lookup).
