# Spell Compendium Enhancements D&D5e

![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FElfFriend-DnD%2Ffoundryvtt-spell-compendium-5e%2Fmain%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange)
![Latest Release Download Count](https://img.shields.io/badge/dynamic/json?label=Downloads@latest&query=assets%5B1%5D.download_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2FElfFriend-DnD%2Ffoundryvtt-spell-compendium-5e%2Freleases%2Flatest)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fspell-compendium-5e&colorB=4aa94a)
[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fspell-compendium-5e%2Fshield%2Fendorsements)](https://www.foundryvtt-hub.com/package/spell-compendium-5e/)
[![Foundry Hub Comments](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fspell-compendium-5e%2Fshield%2Fcomments)](https://www.foundryvtt-hub.com/package/spell-compendium-5e/)

[![ko-fi](https://img.shields.io/badge/-buy%20me%20a%20coke-%23FF5E5B)](https://ko-fi.com/elffriend)
[![patreon](https://img.shields.io/badge/-patreon-%23FF424D)](https://www.patreon.com/ElfFriend_DnD)

This module adds a variety of enhancements to the Compendium Viewer for compendia that contain only Spell type items.

![image](https://user-images.githubusercontent.com/7644614/156891839-0df40248-37e7-4d6a-8879-c765bd3729f2.png)


## Compatibility

- Core 5e
- Compendium Folders (mostly, there is a subset of functionality in spell-only compendia which have folders)

## Notes about performance
Each compendium is purposefully treated separately, I will not be considering any enhancements which involve searching or displaying the contents of multiple compendia at once with this module. This is largely due to performance concerns.

This module leverages the Foundry Core compendium `index` instead of loading all of the data for a given compendium on load. As a result, the first time a spell compendium is opened per session might take a hot second to load, but will be faster after that first time. This carries very little risk of overloading your server's memory usage as well.
