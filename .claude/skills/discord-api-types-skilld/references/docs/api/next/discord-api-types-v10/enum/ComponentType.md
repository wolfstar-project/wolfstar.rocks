ComponentType | API | discord-api-types documentation

[Skip to main content](#__docusaurus_skipToContent_fallback)

 discord-api-types Introduction to the module

API

- next 
- 0.38.42

GitHub

Search

- API v10
  - Enumerations
    - ActivityFlags
    - ActivityLocationKind
    - ActivityPlatform
    - ActivityType
    - AllowedMentionsTypes
    - ApplicationCommandOptionType
    - ApplicationCommandPermissionType
    - ApplicationCommandType
    - ApplicationFlags
    - ApplicationIntegrationType
    - ApplicationRoleConnectionMetadataType
    - ApplicationWebhookEventStatus
    - ApplicationWebhookEventType
    - ApplicationWebhookType
    - AttachmentFlags
    - AuditLogEvent
    - AuditLogOptionsType
    - AutoModerationActionType
    - AutoModerationRuleEventType
    - AutoModerationRuleKeywordPresetType
    - AutoModerationRuleTriggerType
    - BaseThemeType
    - ButtonStyle
    - ChannelFlags
    - ChannelType
    - ComponentType
    - ConnectionService
    - ConnectionVisibility
    - EmbedType
    - EntitlementOwnerType
    - EntitlementType
    - EntryPointCommandHandlerType
    - ForumLayoutType
    - GatewayCloseCodes
    - GatewayDispatchEvents
    - GatewayIntentBits
    - GatewayOpcodes
    - GuildDefaultMessageNotifications
    - GuildExplicitContentFilter
    - GuildFeature
    - GuildHubType
    - GuildMemberFlags
    - GuildMFALevel
    - GuildNSFWLevel
    - GuildOnboardingMode
    - GuildOnboardingPromptType
    - GuildPremiumTier
    - GuildScheduledEventEntityType
    - GuildScheduledEventPrivacyLevel
    - GuildScheduledEventRecurrenceRuleFrequency
    - GuildScheduledEventRecurrenceRuleMonth
    - GuildScheduledEventRecurrenceRuleWeekday
    - GuildScheduledEventStatus
    - GuildSystemChannelFlags
    - GuildVerificationLevel
    - GuildWidgetStyle
    - ImageFormat
    - IntegrationExpireBehavior
    - InteractionContextType
    - InteractionResponseType
    - InteractionType
    - InviteFlags
    - InviteTargetType
    - InviteType
    - Locale
    - MembershipScreeningFieldType
    - MessageActivityType
    - MessageFlags
    - MessageReferenceType
    - MessageSearchAuthorType
    - MessageSearchEmbedType
    - MessageSearchHasType
    - MessageSearchSortMode
    - MessageType
    - NameplatePalette
    - OAuth2Scopes
    - OverwriteType
    - PollLayoutType
    - PresenceUpdateStatus
    - ReactionType
    - RelationshipType
    - RESTJSONErrorCodes
    - RoleFlags
    - RPCCloseEventCodes
    - RPCCommands
    - RPCDeviceType
    - RPCErrorCodes
    - RPCEvents
    - RPCVoiceSettingsModeType
    - RPCVoiceShortcutKeyComboKeyType
    - SelectMenuDefaultValueType
    - SeparatorSpacingSize
    - SKUFlags
    - SKUType
    - SortOrderType
    - StageInstancePrivacyLevel
    - StatusDisplayType
    - StickerFormatType
    - StickerType
    - SubscriptionStatus
    - TeamMemberMembershipState
    - TeamMemberRole
    - TextInputStyle
    - ThreadAutoArchiveDuration
    - ThreadMemberFlags
    - UnfurledMediaItemLoadingState
    - UserFlags
    - UserPremiumType
    - VideoQualityMode
    - VoiceChannelEffectSendAnimationType
    - VoiceConnectionStates
    - WebhookType
  - Interfaces
  - Namespaces
  - References
  - Type Aliases
  - Variables
- API v9
- Global Types
- Voice v4
- Voice v8

This is documentation for an unreleased version. For the latest API, see version **0.38.42**.

- Home page
- API v10
- Enumerations
- ComponentType

Version: Next

On this page

# ComponentType

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/components/reference#component-object-component-types

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__ActionRow](#ActionRow)
- [__Button](#Button)
- [__ChannelSelect](#ChannelSelect)
- [__Checkbox](#Checkbox)
- [__CheckboxGroup](#CheckboxGroup)
- [__Container](#Container)
- [__ContentInventoryEntry](#ContentInventoryEntry)
- [__File](#File)
- [__FileUpload](#FileUpload)
- [__Label](#Label)
- [__MediaGallery](#MediaGallery)
- [__MentionableSelect](#MentionableSelect)
- [__RadioGroup](#RadioGroup)
- [__RoleSelect](#RoleSelect)
- [__Section](#Section)
- [__SelectMenu](#SelectMenu)
- [__Separator](#Separator)
- [__StringSelect](#StringSelect)
- [__TextDisplay](#TextDisplay)
- [__TextInput](#TextInput)
- [__Thumbnail](#Thumbnail)
- [__UserSelect](#UserSelect)

## Enumeration Members [__](#Enumeration Members)

### [__](#ActionRow) __ActionRow

__ActionRow: 1

Container to display a row of interactive components

### [__](#Button) __Button

__Button: 2

Button component

### [__](#ChannelSelect) __ChannelSelect

__ChannelSelect: 8

Select menu for channels

### [__](#Checkbox) __Checkbox

__Checkbox: 23

Single checkbox for binary choice

### [__](#CheckboxGroup) __CheckboxGroup

__CheckboxGroup: 22

Multi-select group of checkboxes

### [__](#Container) __Container

__Container: 17

Container that visually groups a set of components

### [__](#ContentInventoryEntry) __ContentInventoryEntry

__ContentInventoryEntry: 16

<dl><dt>**@unstable**</dt>
<dd>

This component type is currently not documented by Discord but has a known value which we will try to keep up to date.

</dd></dl>

### [__](#File) __File

__File: 13

Displays an attached file

### [__](#FileUpload) __FileUpload

__FileUpload: 19

Component for uploading files

### [__](#Label) __Label

__Label: 18

Container associating a label and description with a component

### [__](#MediaGallery) __MediaGallery

__MediaGallery: 12

Display images and other media

### [__](#MentionableSelect) __MentionableSelect

__MentionableSelect: 7

Select menu for users and roles

### [__](#RadioGroup) __RadioGroup

__RadioGroup: 21

Single-choice set of radio group option

### [__](#RoleSelect) __RoleSelect

__RoleSelect: 6

Select menu for roles

### [__](#Section) __Section

__Section: 9

Container to display text alongside an accessory component

### [__](#SelectMenu) __SelectMenu

__SelectMenu: 3

Select menu for picking from defined text options

<dl><dt>**@deprecated**</dt>
<dd>

This is the old name for ComponentType.StringSelect

</dd></dl>

### [__](#Separator) __Separator

__Separator: 14

Component to add vertical padding between other components

### [__](#StringSelect) __StringSelect

__StringSelect: 3

Select menu for picking from defined text options

### [__](#TextDisplay) __TextDisplay

__TextDisplay: 10

Markdown text

### [__](#TextInput) __TextInput

__TextInput: 4

Text Input component

### [__](#Thumbnail) __Thumbnail

__Thumbnail: 11

Small image that can be used as an accessory

### [__](#UserSelect) __UserSelect

__UserSelect: 5

Select menu for users

Previous ChannelType Next ConnectionService

**Page Options**

Hide Inherited

- [__ActionRow](#ActionRow)
- [__Button](#Button)
- [__ChannelSelect](#ChannelSelect)
- [__Checkbox](#Checkbox)
- [__CheckboxGroup](#CheckboxGroup)
- [__Container](#Container)
- [__ContentInventoryEntry](#ContentInventoryEntry)
- [__File](#File)
- [__FileUpload](#FileUpload)
- [__Label](#Label)
- [__MediaGallery](#MediaGallery)
- [__MentionableSelect](#MentionableSelect)
- [__RadioGroup](#RadioGroup)
- [__RoleSelect](#RoleSelect)
- [__Section](#Section)
- [__SelectMenu](#SelectMenu)
- [__Separator](#Separator)
- [__StringSelect](#StringSelect)
- [__TextDisplay](#TextDisplay)
- [__TextInput](#TextInput)
- [__Thumbnail](#Thumbnail)
- [__UserSelect](#UserSelect)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.