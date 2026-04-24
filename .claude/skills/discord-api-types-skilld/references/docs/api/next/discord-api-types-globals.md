discord-api-types/globals | API | discord-api-types documentation

[Skip to main content](#__docusaurus_skipToContent_fallback)

 discord-api-types Introduction to the module

API

- next 
- 0.38.42

GitHub

Search

- API v10
- API v9
- Global Types
- Voice v4
- Voice v8

This is documentation for an unreleased version. For the latest API, see version **0.38.42**.

- Home page

Version: Next

On this page

# discord-api-types/globals

## Index [__](#Index)

### Type Aliases

- __Permissions
- __Snowflake

### Variables

- __FormattingPatterns

## Type Aliases [__](#Type Aliases)

### [__](#Permissions) __Permissions

__Permissions: string

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/permissions

</dd></dl>

### [__](#Snowflake) __Snowflake

__Snowflake: string

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/reference#snowflakes

</dd></dl>

## Variables [__](#Variables)

### [__](#FormattingPatterns) __constFormattingPatterns

__FormattingPatterns: {AnimatedEmoji:RegExp;Channel:RegExp;DefaultStyledTimestamp:RegExp;Emoji:RegExp;GuildNavigation:RegExp;LinkedRole:RegExp;Role:RegExp;SlashCommand:RegExp;StaticEmoji:RegExp;StyledTimestamp:RegExp;Timestamp:RegExp;User:RegExp;UserWithNickname:RegExp;UserWithOptionalNickname:RegExp } = ...

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/reference#message-formatting-formats

</dd></dl>

---

#### Type declaration

- ##### readonlyAnimatedEmoji:RegExp Regular expression for matching strictly an animated custom emoji The `animated`, `name` and `id` group properties are present on the `exec` result of this expression
- ##### readonlyChannel:RegExp Regular expression for matching a channel mention The `id` group property is present on the `exec` result of this expression
- ##### readonlyDefaultStyledTimestamp:RegExp Regular expression for matching strictly default styled timestamps The `timestamp` group property is present on the `exec` result of this expression
- ##### readonlyEmoji:RegExp Regular expression for matching a custom emoji, either static or animated The `animated`, `name` and `id` group properties are present on the `exec` result of this expression
- ##### readonlyGuildNavigation:RegExp Regular expression for matching a guild navigation mention The `type` group property is present on the `exec` result of this expression
- ##### readonlyLinkedRole:RegExp Regular expression for matching a linked role mention The `id` group property is present on the `exec` result of this expression
- ##### readonlyRole:RegExp Regular expression for matching a role mention The `id` group property is present on the `exec` result of this expression
- ##### readonlySlashCommand:RegExp Regular expression for matching a application command mention The `fullName` (possibly including `name`, `subcommandOrGroup` and `subcommand`) and `id` group properties are present on the `exec` result of this expression
- ##### readonlyStaticEmoji:RegExp Regular expression for matching strictly a static custom emoji The `name` and `id` group properties are present on the `exec` result of this expression
- ##### readonlyStyledTimestamp:RegExp Regular expression for matching strictly custom styled timestamps The `timestamp` and `style` group properties are present on the `exec` result of this expression
- ##### readonlyTimestamp:RegExp Regular expression for matching a timestamp, either default or custom styled The `timestamp` and `style` group properties are present on the `exec` result of this expression
- ##### readonlyUser:RegExp Regular expression for matching a user mention, strictly without a nickname The `id` group property is present on the `exec` result of this expression
- ##### readonlyUserWithNickname:RegExp Regular expression for matching a user mention, strictly with a nickname The `id` group property is present on the `exec` result of this expression<dl><dt>**@deprecated**</dt><dd>Passing `id` group property is present on the `exec` result of this expression<dl><dt>**@deprecated**</dt><dd>Passing `!` in user mentions is no longer necessary / supported, and future message contents won't have it</dd></dl>

**Page Options**

Hide Inherited

- [__Permissions](#Permissions)
- [__Snowflake](#Snowflake)
- [__FormattingPatterns](#FormattingPatterns)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.