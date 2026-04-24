---
number: 1510
title: SubcommandOption types have a required property
type: bug
state: open
created: 2026-01-31
url: "https://github.com/discordjs/discord-api-types/issues/1510"
reactions: 0
comments: 0
labels: "[bug]"
---

# SubcommandOption types have a required property

### Issue description

try to use type `APIApplicationCommandSubcommandOption` or `APIApplicationCommandSubcommandGroupOption`

see that they have a `required` boolean property instead of being never
Discord Docs: https://discord.com/developers/docs/interactions/application-commands#:~:text=all%20but,SUB_COMMAND_GROUP

<img width="703" height="313" alt="Image" src="https://github.com/user-attachments/assets/f17de093-4e06-4237-8259-9e7172453935" />

### Code sample

```typescript
const testSubcommandOption: APIApplicationCommandSubcommandOption = {
	description: 'test',
	name: 'test',
	type: ApplicationCommandOptionType.Subcommand,
	options: [],
	required: true
}
const testSubcommandGroupOption: APIApplicationCommandSubcommandGroupOption = {
	name: 'testGroup',
	description: 'test group',
	type: ApplicationCommandOptionType.SubcommandGroup,
	options: [],
	required: false
}
```...