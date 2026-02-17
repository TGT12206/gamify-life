# Gamify Life
This plugin allows the user to keep track of a few things about their life with a game-like system. The major ones are:
- [Skills](skills)
- [Moments](moments)
- [Items / Locations](items-locations)
- [Claims](claims)
- [Quests](quests)
This data is all stored in data.json, and the UI can be opened with the ribbon in the sidebar, or with a hotkey.
<img width="2559" height="1439" alt="image" src="https://github.com/user-attachments/assets/8a053ce7-e5ca-46e9-a7a9-eecc270f1e9e" />
## Concepts
Concepts are the basis of all the plugin data.
<img width="2560" height="1440" alt="image" src="https://github.com/user-attachments/assets/9963c1f6-9124-4ab5-bcde-720f18e717a0" />
They contain:
- a list of names (aliases)
- a list of categories. A concept can only have 1 "base" (plugin-defined) category that defines its behavior. All other categories are user defined.
- a list of media files (the highlighted file is used as a "thumbnail" for the concept)
- a description
The following information is also aggregated:
- [claims](claims) (Observations are the deprecated name, will fix later) made about this concept
## Skills
Skills are concepts with a value tracker attached. A custom [unit](units) can be specified to show up in UI elements.
<img width="2560" height="1440" alt="image" src="https://github.com/user-attachments/assets/582611b8-7798-48cd-8ac7-1de5a04267f0" />
<img width="2464" height="550" alt="image" src="https://github.com/user-attachments/assets/019a0a14-acc0-4a3b-8148-96e8c935338f" />
They contain:
- a link to the [unit](units) that is used for ui related to this skill
- a list of [ranks](ranks) that are used to calculate progress
- a list of subskills and the weight assigned to xp earned by each subskills
The following information is also aggregated:
- (bugged) the total number of units earned from all [moments](moments) that have been logged.
- the current rank.
- the progress towards the next rank.
## Units
Units currently contain no special data beyond those found in a normal concept. However, a unit's main name can be used by skills to customize certain ui elements.
## Ranks
A rank is a threshold for a [skill](skills) that can be earned after earning enough xp. The main image of the rank is used for ui purposes.
<img width="2560" height="1440" alt="image" src="https://github.com/user-attachments/assets/82a46dec-c525-4539-b6f9-18f47d265942" />
They contain:
- a threshold value
## Moments
Moments are concepts that represent a moment in time. (Personally I just treat them as diary entries for each day)
<img width="2560" height="1440" alt="image" src="https://github.com/user-attachments/assets/5cd3bda8-b284-406d-b222-d0a8f9244ecf" />
They contain:
- a list of concepts that were involved at this moment. (such as people, locations, etc. but it can be any concept).
- (bugged) a list of [skills](skills) that were used in this moment, and the amount of [xp](units) earned for that skill.
- the starting and ending time and date. You can set them individually, or lock one in place and specify how long the moment lasted (which updates the unlocked time).
## Items / Locations
An item or space is something in the "inventory" or "map", and can contain other items or spaces
<img width="2560" height="1440" alt="image" src="https://github.com/user-attachments/assets/d4ecd1bb-6263-4653-8312-9a5ae0bf3e9b" />
They contain:
- a list of (direct) subspaces / contained item, and an explanation of where that subspace / item can be found.
The following information is also aggregated:
- (planned) A list of all the items contained within, or at least a way to search for an item from a starting location and get directions.
## Claims
Claims are facts or assumptions made by the user about other concepts.
<img width="2560" height="1440" alt="image" src="https://github.com/user-attachments/assets/d7271352-7410-41b6-948e-3723ed8881fd" />
They contain:
- the user's level of confidence in this fact or assumption
- a list of evidence, the level of support they give, an explanation, and a link
	- The following types of evidence have been added: another concept, a media file, and other.
## Quests
Quests are tasks, especially those that repeat.
<img width="2560" height="1440" alt="image" src="https://github.com/user-attachments/assets/1b4e9b2e-14f8-4a97-b386-60433421e157" />
They contain:
- a quest type (one off, daily, weekly, monthly, and yearly)
- the number of intervals before refreshing again. if the quest is daily, then an interval is 1 day, if the quest is yearly, then an interval is 1 year.
- a list of times within active intervals to "refresh" the quest.
