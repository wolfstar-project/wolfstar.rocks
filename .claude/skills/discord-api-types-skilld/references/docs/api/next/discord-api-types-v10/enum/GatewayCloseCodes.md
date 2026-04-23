GatewayCloseCodes | API | discord-api-types documentation

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
- GatewayCloseCodes

Version: Next

On this page

# GatewayCloseCodes

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__AlreadyAuthenticated](#AlreadyAuthenticated)
- [__AuthenticationFailed](#AuthenticationFailed)
- [__DecodeError](#DecodeError)
- [__DisallowedIntents](#DisallowedIntents)
- [__InvalidAPIVersion](#InvalidAPIVersion)
- [__InvalidIntents](#InvalidIntents)
- [__InvalidSeq](#InvalidSeq)
- [__InvalidShard](#InvalidShard)
- [__NotAuthenticated](#NotAuthenticated)
- [__RateLimited](#RateLimited)
- [__SessionTimedOut](#SessionTimedOut)
- [__ShardingRequired](#ShardingRequired)
- [__UnknownError](#UnknownError)
- [__UnknownOpcode](#UnknownOpcode)

## Enumeration Members [__](#Enumeration Members)

### [__](#AlreadyAuthenticated) __AlreadyAuthenticated

__AlreadyAuthenticated: 4005

You sent more than one identify payload. Don't do that!

### [__](#AuthenticationFailed) __AuthenticationFailed

__AuthenticationFailed: 4004

The account token sent with your identify payload is incorrect

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/gateway-events#identify

</dd></dl>

### [__](#DecodeError) __DecodeError

__DecodeError: 4002

You sent an invalid payload to us. Don't do that!

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/gateway#sending-events

</dd></dl>

### [__](#DisallowedIntents) __DisallowedIntents

__DisallowedIntents: 4014

You sent a disallowed intent for a Gateway Intent. You may have tried to specify an intent that you have not enabled or are not whitelisted for

<dl><dt>**@see**</dt>
<dd>

- https://discord.com/developers/docs/topics/gateway#gateway-intents
- https://discord.com/developers/docs/topics/gateway#privileged-intents

</dd></dl>

### [__](#InvalidAPIVersion) __InvalidAPIVersion

__InvalidAPIVersion: 4012

You sent an invalid version for the gateway

### [__](#InvalidIntents) __InvalidIntents

__InvalidIntents: 4013

You sent an invalid intent for a Gateway Intent. You may have incorrectly calculated the bitwise value

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/gateway#gateway-intents

</dd></dl>

### [__](#InvalidSeq) __InvalidSeq

__InvalidSeq: 4007

The sequence sent when resuming the session was invalid. Reconnect and start a new session

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/gateway-events#resume

</dd></dl>

### [__](#InvalidShard) __InvalidShard

__InvalidShard: 4010

You sent us an invalid shard when identifying

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/gateway#sharding

</dd></dl>

### [__](#NotAuthenticated) __NotAuthenticated

__NotAuthenticated: 4003

You sent us a payload prior to identifying

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/gateway-events#identify

</dd></dl>

### [__](#RateLimited) __RateLimited

__RateLimited: 4008

Woah nelly! You're sending payloads to us too quickly. Slow it down! You will be disconnected on receiving this

### [__](#SessionTimedOut) __SessionTimedOut

__SessionTimedOut: 4009

Your session timed out. Reconnect and start a new one

### [__](#ShardingRequired) __ShardingRequired

__ShardingRequired: 4011

The session would have handled too many guilds - you are required to shard your connection in order to connect

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/gateway#sharding

</dd></dl>

### [__](#UnknownError) __UnknownError

__UnknownError: 4000

We're not sure what went wrong. Try reconnecting?

### [__](#UnknownOpcode) __UnknownOpcode

__UnknownOpcode: 4001

You sent an invalid Gateway opcode or an invalid payload for an opcode. Don't do that!

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/gateway-events#payload-structure

</dd></dl>

Previous ForumLayoutType Next GatewayDispatchEvents

**Page Options**

Hide Inherited

- [__AlreadyAuthenticated](#AlreadyAuthenticated)
- [__AuthenticationFailed](#AuthenticationFailed)
- [__DecodeError](#DecodeError)
- [__DisallowedIntents](#DisallowedIntents)
- [__InvalidAPIVersion](#InvalidAPIVersion)
- [__InvalidIntents](#InvalidIntents)
- [__InvalidSeq](#InvalidSeq)
- [__InvalidShard](#InvalidShard)
- [__NotAuthenticated](#NotAuthenticated)
- [__RateLimited](#RateLimited)
- [__SessionTimedOut](#SessionTimedOut)
- [__ShardingRequired](#ShardingRequired)
- [__UnknownError](#UnknownError)
- [__UnknownOpcode](#UnknownOpcode)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.