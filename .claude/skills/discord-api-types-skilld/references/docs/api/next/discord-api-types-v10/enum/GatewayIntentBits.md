GatewayIntentBits | API | discord-api-types documentation

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
- GatewayIntentBits

Version: Next

On this page

# GatewayIntentBits

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/gateway#list-of-intents

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__AutoModerationConfiguration](#AutoModerationConfiguration)
- [__AutoModerationExecution](#AutoModerationExecution)
- [__DirectMessagePolls](#DirectMessagePolls)
- [__DirectMessageReactions](#DirectMessageReactions)
- [__DirectMessages](#DirectMessages)
- [__DirectMessageTyping](#DirectMessageTyping)
- [__GuildBans](#GuildBans)
- [__GuildEmojisAndStickers](#GuildEmojisAndStickers)
- [__GuildExpressions](#GuildExpressions)
- [__GuildIntegrations](#GuildIntegrations)
- [__GuildInvites](#GuildInvites)
- [__GuildMembers](#GuildMembers)
- [__GuildMessagePolls](#GuildMessagePolls)
- [__GuildMessageReactions](#GuildMessageReactions)
- [__GuildMessages](#GuildMessages)
- [__GuildMessageTyping](#GuildMessageTyping)
- [__GuildModeration](#GuildModeration)
- [__GuildPresences](#GuildPresences)
- [__Guilds](#Guilds)
- [__GuildScheduledEvents](#GuildScheduledEvents)
- [__GuildVoiceStates](#GuildVoiceStates)
- [__GuildWebhooks](#GuildWebhooks)
- [__MessageContent](#MessageContent)

## Enumeration Members [__](#Enumeration Members)

### [__](#AutoModerationConfiguration) __AutoModerationConfiguration

__AutoModerationConfiguration: 1048576

### [__](#AutoModerationExecution) __AutoModerationExecution

__AutoModerationExecution: 2097152

### [__](#DirectMessagePolls) __DirectMessagePolls

__DirectMessagePolls: 33554432

### [__](#DirectMessageReactions) __DirectMessageReactions

__DirectMessageReactions: 8192

### [__](#DirectMessages) __DirectMessages

__DirectMessages: 4096

### [__](#DirectMessageTyping) __DirectMessageTyping

__DirectMessageTyping: 16384

### [__](#GuildBans) __GuildBans

__GuildBans: 4

<dl><dt>**@deprecated**</dt>
<dd>

This is the old name for GatewayIntentBits.GuildModeration

</dd></dl>

### [__](#GuildEmojisAndStickers) __GuildEmojisAndStickers

__GuildEmojisAndStickers: 8

<dl><dt>**@deprecated**</dt>
<dd>

This is the old name for GatewayIntentBits.GuildExpressions

</dd></dl>

### [__](#GuildExpressions) __GuildExpressions

__GuildExpressions: 8

### [__](#GuildIntegrations) __GuildIntegrations

__GuildIntegrations: 16

### [__](#GuildInvites) __GuildInvites

__GuildInvites: 64

### [__](#GuildMembers) __GuildMembers

__GuildMembers: 2

### [__](#GuildMessagePolls) __GuildMessagePolls

__GuildMessagePolls: 16777216

### [__](#GuildMessageReactions) __GuildMessageReactions

__GuildMessageReactions: 1024

### [__](#GuildMessages) __GuildMessages

__GuildMessages: 512

### [__](#GuildMessageTyping) __GuildMessageTyping

__GuildMessageTyping: 2048

### [__](#GuildModeration) __GuildModeration

__GuildModeration: 4

### [__](#GuildPresences) __GuildPresences

__GuildPresences: 256

### [__](#Guilds) __Guilds

__Guilds: 1

### [__](#GuildScheduledEvents) __GuildScheduledEvents

__GuildScheduledEvents: 65536

### [__](#GuildVoiceStates) __GuildVoiceStates

__GuildVoiceStates: 128

### [__](#GuildWebhooks) __GuildWebhooks

__GuildWebhooks: 32

### [__](#MessageContent) __MessageContent

__MessageContent: 32768

Previous GatewayDispatchEvents Next GatewayOpcodes

**Page Options**

Hide Inherited

- [__AutoModerationConfiguration](#AutoModerationConfiguration)
- [__AutoModerationExecution](#AutoModerationExecution)
- [__DirectMessagePolls](#DirectMessagePolls)
- [__DirectMessageReactions](#DirectMessageReactions)
- [__DirectMessages](#DirectMessages)
- [__DirectMessageTyping](#DirectMessageTyping)
- [__GuildBans](#GuildBans)
- [__GuildEmojisAndStickers](#GuildEmojisAndStickers)
- [__GuildExpressions](#GuildExpressions)
- [__GuildIntegrations](#GuildIntegrations)
- [__GuildInvites](#GuildInvites)
- [__GuildMembers](#GuildMembers)
- [__GuildMessagePolls](#GuildMessagePolls)
- [__GuildMessageReactions](#GuildMessageReactions)
- [__GuildMessages](#GuildMessages)
- [__GuildMessageTyping](#GuildMessageTyping)
- [__GuildModeration](#GuildModeration)
- [__GuildPresences](#GuildPresences)
- [__Guilds](#Guilds)
- [__GuildScheduledEvents](#GuildScheduledEvents)
- [__GuildVoiceStates](#GuildVoiceStates)
- [__GuildWebhooks](#GuildWebhooks)
- [__MessageContent](#MessageContent)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.