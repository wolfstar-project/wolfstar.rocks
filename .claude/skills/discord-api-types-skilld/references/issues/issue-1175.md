---
number: 1175
title: Autocomplete value is determined based on the command option type
type: bug
state: closed
created: 2024-12-19
url: "https://github.com/discordjs/discord-api-types/issues/1175"
reactions: 0
comments: 0
labels: "[bug]"
---

# Autocomplete value is determined based on the command option type

### Issue description

The value of an autocomplete interaction is dynamic and may be a number. However, this is incorrect. The value of an autocomplete interaction is always a `string`.

### Code sample

```typescript
declare const interaction: APIApplicationCommandAutocompleteInteraction;

if (interaction.data.options[0]?.type === ApplicationCommandOptionType.String) {
	const { value } = interaction.data.options[0]; // String. Correct.
}

if (interaction.data.options[0]?.type === ApplicationCommandOptionType.Integer) {
	const { value } = interaction.data.options[0]; // Number. Incorrect.
}

if (interaction.data.options[0]?.type === ApplicationCommandOptionType.Number) {
	const { value } = interaction.data.options[0]; // Number. Incorrect.
}
```


### Package version

main

...