MessageSearchHasType | API | discord-api-types documentation

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
- MessageSearchHasType

Version: Next

On this page

# MessageSearchHasType

<dl><dt>**@remarks**</dt>
<dd>

All types can be negated by prefixing them with `-`, which means results will not include messages that match the type.

</dd><dt>**@see**</dt>
<dd>

https://docs.discord.com/developers/resources/message#search-guild-messages-search-has-types

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__Embed](#Embed)
- [__File](#File)
- [__Image](#Image)
- [__Link](#Link)
- [__NotEmbed](#NotEmbed)
- [__NotFile](#NotFile)
- [__NotImage](#NotImage)
- [__NotLink](#NotLink)
- [__NotPoll](#NotPoll)
- [__NotSnapshot](#NotSnapshot)
- [__NotSound](#NotSound)
- [__NotSticker](#NotSticker)
- [__NotVideo](#NotVideo)
- [__Poll](#Poll)
- [__Snapshot](#Snapshot)
- [__Sound](#Sound)
- [__Sticker](#Sticker)
- [__Video](#Video)

## Enumeration Members [__](#Enumeration Members)

### [__](#Embed) __Embed

__Embed: embed

Return messages that have an embed

### [__](#File) __File

__File: file

Return messages that have an attachment

### [__](#Image) __Image

__Image: image

Return messages that have an image

### [__](#Link) __Link

__Link: link

Return messages that have a link

### [__](#NotEmbed) __NotEmbed

__NotEmbed: -embed

Return messages that don't have an embed

### [__](#NotFile) __NotFile

__NotFile: -file

Return messages that don't have an attachment

### [__](#NotImage) __NotImage

__NotImage: -image

Return messages that don't have an image

### [__](#NotLink) __NotLink

__NotLink: -link

Return messages that don't have a link

### [__](#NotPoll) __NotPoll

__NotPoll: -poll

Return messages that don't have a poll

### [__](#NotSnapshot) __NotSnapshot

__NotSnapshot: -snapshot

Return messages that don't have a forwarded message

### [__](#NotSound) __NotSound

__NotSound: -sound

Return messages that don't have a sound attachment

### [__](#NotSticker) __NotSticker

__NotSticker: -sticker

Return messages that don't have a sent sticker

### [__](#NotVideo) __NotVideo

__NotVideo: -video

Return messages that don't have a video

### [__](#Poll) __Poll

__Poll: poll

Return messages that have a poll

### [__](#Snapshot) __Snapshot

__Snapshot: snapshot

Return messages that have a forwarded message

### [__](#Sound) __Sound

__Sound: sound

Return messages that have a sound attachment

### [__](#Sticker) __Sticker

__Sticker: sticker

Return messages that have a sent sticker

### [__](#Video) __Video

__Video: video

Return messages that have a video

Previous MessageSearchEmbedType Next MessageSearchSortMode

**Page Options**

Hide Inherited

- [__Embed](#Embed)
- [__File](#File)
- [__Image](#Image)
- [__Link](#Link)
- [__NotEmbed](#NotEmbed)
- [__NotFile](#NotFile)
- [__NotImage](#NotImage)
- [__NotLink](#NotLink)
- [__NotPoll](#NotPoll)
- [__NotSnapshot](#NotSnapshot)
- [__NotSound](#NotSound)
- [__NotSticker](#NotSticker)
- [__NotVideo](#NotVideo)
- [__Poll](#Poll)
- [__Snapshot](#Snapshot)
- [__Sound](#Sound)
- [__Sticker](#Sticker)
- [__Video](#Video)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.