---
number: 1486
title: SendSoundboardSound has reversed naming scheme for body and result
type: bug
state: open
created: 2026-01-15
url: "https://github.com/discordjs/discord-api-types/issues/1486"
reactions: 0
comments: 0
labels: "[bug]"
---

# SendSoundboardSound has reversed naming scheme for body and result

### Issue description

The naming for the body and result types of https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound don't match. Renaming the body to `RESTPostAPISendSoundboardSoundJSONBody` seems to be the correct fix (breaking though). 

<img width="702" height="99" alt="Image" src="https://github.com/user-attachments/assets/234fca51-64dc-4229-8ce0-f060f47f7e43" />

<img width="715" height="117" alt="Image" src="https://github.com/user-attachments/assets/332aa21c-edc3-4b7d-b63b-bb54149ada85" />

### Code sample

```typescript

```

### Package version

0.38.37

### Runtime

Bun

### Runtime version

1.3.6

### Priority this issue should have

Low (slightly annoying)