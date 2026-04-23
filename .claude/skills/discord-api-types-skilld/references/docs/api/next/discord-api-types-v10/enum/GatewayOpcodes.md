GatewayOpcodes | API | discord-api-types documentation

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
- GatewayOpcodes

Version: Next

On this page

# GatewayOpcodes

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__Dispatch](#Dispatch)
- [__Heartbeat](#Heartbeat)
- [__HeartbeatAck](#HeartbeatAck)
- [__Hello](#Hello)
- [__Identify](#Identify)
- [__InvalidSession](#InvalidSession)
- [__PresenceUpdate](#PresenceUpdate)
- [__Reconnect](#Reconnect)
- [__RequestGuildMembers](#RequestGuildMembers)
- [__RequestSoundboardSounds](#RequestSoundboardSounds)
- [__Resume](#Resume)
- [__VoiceStateUpdate](#VoiceStateUpdate)

## Enumeration Members [__](#Enumeration Members)

### [__](#Dispatch) __Dispatch

__Dispatch: 0

An event was dispatched

### [__](#Heartbeat) __Heartbeat

__Heartbeat: 1

A bidirectional opcode to maintain an active gateway connection. Fired periodically by the client, or fired by the gateway to request an immediate heartbeat from the client.

### [__](#HeartbeatAck) __HeartbeatAck

__HeartbeatAck: 11

Sent in response to receiving a heartbeat to acknowledge that it has been received

### [__](#Hello) __Hello

__Hello: 10

Sent immediately after connecting, contains the `heartbeat_interval` to use

### [__](#Identify) __Identify

__Identify: 2

Starts a new session during the initial handshake

### [__](#InvalidSession) __InvalidSession

__InvalidSession: 9

The session has been invalidated. You should reconnect and identify/resume accordingly

### [__](#PresenceUpdate) __PresenceUpdate

__PresenceUpdate: 3

Update the client's presence

### [__](#Reconnect) __Reconnect

__Reconnect: 7

You should attempt to reconnect and resume immediately

### [__](#RequestGuildMembers) __RequestGuildMembers

__RequestGuildMembers: 8

Request information about offline guild members in a large guild

### [__](#RequestSoundboardSounds) __RequestSoundboardSounds

__RequestSoundboardSounds: 31

Request information about soundboard sounds in a set of guilds

### [__](#Resume) __Resume

__Resume: 6

Resume a previous session that was disconnected

### [__](#VoiceStateUpdate) __VoiceStateUpdate

__VoiceStateUpdate: 4

Used to join/leave or move between voice channels

Previous GatewayIntentBits Next GuildDefaultMessageNotifications

**Page Options**

Hide Inherited

- [__Dispatch](#Dispatch)
- [__Heartbeat](#Heartbeat)
- [__HeartbeatAck](#HeartbeatAck)
- [__Hello](#Hello)
- [__Identify](#Identify)
- [__InvalidSession](#InvalidSession)
- [__PresenceUpdate](#PresenceUpdate)
- [__Reconnect](#Reconnect)
- [__RequestGuildMembers](#RequestGuildMembers)
- [__RequestSoundboardSounds](#RequestSoundboardSounds)
- [__Resume](#Resume)
- [__VoiceStateUpdate](#VoiceStateUpdate)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.