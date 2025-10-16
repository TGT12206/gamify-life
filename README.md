# Planned Layout
## Timeline
- moments: string\[\] // paths to the moments in this timeline
- tasks: string\[\] // paths to the tasks in this timeline
## Moment
- date (time is optional): Date
- duration (optional): number
- description: string
- people: string\[\] // paths to the person files that were involved in this moment
- media: string\[\] // paths to the media files (image, video, sound) relevant to this moment
- observations: string\[\] // paths to the observation files
- tasks: string\[\] // paths to the tasks that were worked on in this moment
- skill units gained: Gained Skill Unit\[\]
## Observation
- first time observed: Date
- most recently verified time: Date
- description: string
- media: string\[\] // paths to the media files relevant to this observation
- moments observed: string\[\] // paths to the moments where this was observed
- objects of observation: string\[\] // paths to the observables that this observation is about
## Observable (interface)
- observations: Observation\[\]
### Person
- names: string\[\]
- media: string\[\] // paths to the media files
#### Self
- skills: string\[\] // paths to the skills that you're keeping track of with this plugin
## Task
- moments: string\[\] // paths to the moments that form this task
- description: string
## Gained Skill Unit
- skill: string // path to the skill
- units gained: number
## Skill Unit
- name: string
- is time based: boolean
## Skill Milestone
- name: string
- threshold: number
- media: string\[\] // paths to the media files
## Skill
- name: string
- parent skill: string | undefined
- media: string\[\] // paths to the media files
- milestones: Skill Milestone // inherited if there is a parent skill. however, the user is allowed to edit it. a button is provided to reset to the default (the parent milestones)
- subskills: string\[\] // paths to the files of the subskills
- weights: number\[\] // the weight of each subskill
- unit type: Skill Unit // inherited if there is a parent skill. the user is not allowed to edit it if so