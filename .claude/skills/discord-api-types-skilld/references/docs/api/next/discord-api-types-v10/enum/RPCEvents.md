RPCEvents | API | discord-api-types documentation

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
- RPCEvents

Version: Next

On this page

# RPCEvents

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/rpc#commands-and-events-rpc-events

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__ActivityInvite](#ActivityInvite)
- [__ActivityJoin](#ActivityJoin)
- [__ActivityJoinRequest](#ActivityJoinRequest)
- [__ActivitySpectate](#ActivitySpectate)
- [__ChannelCreate](#ChannelCreate)
- [__CurrentUserUpdate](#CurrentUserUpdate)
- [__EntitlementCreate](#EntitlementCreate)
- [__EntitlementDelete](#EntitlementDelete)
- [__Error](#Error)
- [__GameJoin](#GameJoin)
- [__GameSpectate](#GameSpectate)
- [__GuildCreate](#GuildCreate)
- [__GuildStatus](#GuildStatus)
- [__MessageCreate](#MessageCreate)
- [__MessageDelete](#MessageDelete)
- [__MessageUpdate](#MessageUpdate)
- [__NotificationCreate](#NotificationCreate)
- [__Overlay](#Overlay)
- [__OverlayUpdate](#OverlayUpdate)
- [__Ready](#Ready)
- [__RelationshipUpdate](#RelationshipUpdate)
- [__SpeakingStart](#SpeakingStart)
- [__SpeakingStop](#SpeakingStop)
- [__VoiceChannelSelect](#VoiceChannelSelect)
- [__VoiceConnectionStatus](#VoiceConnectionStatus)
- [__VoiceSettingsUpdate](#VoiceSettingsUpdate)
- [__VoiceSettingsUpdate2](#VoiceSettingsUpdate2)
- [__VoiceStateCreate](#VoiceStateCreate)
- [__VoiceStateDelete](#VoiceStateDelete)
- [__VoiceStateUpdate](#VoiceStateUpdate)

## Enumeration Members [__](#Enumeration Members)

### [__](#ActivityInvite) __ActivityInvite

__ActivityInvite: ACTIVITY_INVITE

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#ActivityJoin) __ActivityJoin

__ActivityJoin: ACTIVITY_JOIN

### [__](#ActivityJoinRequest) __ActivityJoinRequest

__ActivityJoinRequest: ACTIVITY_JOIN_REQUEST

### [__](#ActivitySpectate) __ActivitySpectate

__ActivitySpectate: ACTIVITY_SPECTATE

### [__](#ChannelCreate) __ChannelCreate

__ChannelCreate: CHANNEL_CREATE

### [__](#CurrentUserUpdate) __CurrentUserUpdate

__CurrentUserUpdate: CURRENT_USER_UPDATE

### [__](#EntitlementCreate) __EntitlementCreate

__EntitlementCreate: ENTITLEMENT_CREATE

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#EntitlementDelete) __EntitlementDelete

__EntitlementDelete: ENTITLEMENT_DELETE

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#Error) __Error

__Error: ERROR

### [__](#GameJoin) __GameJoin

__GameJoin: GAME_JOIN

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#GameSpectate) __GameSpectate

__GameSpectate: GAME_SPECTATE

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#GuildCreate) __GuildCreate

__GuildCreate: GUILD_CREATE

### [__](#GuildStatus) __GuildStatus

__GuildStatus: GUILD_STATUS

### [__](#MessageCreate) __MessageCreate

__MessageCreate: MESSAGE_CREATE

Dispatches message objects, with the exception of deletions, which only contains the id in the message object.

### [__](#MessageDelete) __MessageDelete

__MessageDelete: MESSAGE_DELETE

Dispatches message objects, with the exception of deletions, which only contains the id in the message object.

### [__](#MessageUpdate) __MessageUpdate

__MessageUpdate: MESSAGE_UPDATE

Dispatches message objects, with the exception of deletions, which only contains the id in the message object.

### [__](#NotificationCreate) __NotificationCreate

__NotificationCreate: NOTIFICATION_CREATE

This event requires the `rpc.notifications.read` scope.

### [__](#Overlay) __Overlay

__Overlay: OVERLAY

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#OverlayUpdate) __OverlayUpdate

__OverlayUpdate: OVERLAY_UPDATE

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#Ready) __Ready

__Ready: READY

### [__](#RelationshipUpdate) __RelationshipUpdate

__RelationshipUpdate: RELATIONSHIP_UPDATE

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#SpeakingStart) __SpeakingStart

__SpeakingStart: SPEAKING_START

### [__](#SpeakingStop) __SpeakingStop

__SpeakingStop: SPEAKING_STOP

### [__](#VoiceChannelSelect) __VoiceChannelSelect

__VoiceChannelSelect: VOICE_CHANNEL_SELECT

### [__](#VoiceConnectionStatus) __VoiceConnectionStatus

__VoiceConnectionStatus: VOICE_CONNECTION_STATUS

### [__](#VoiceSettingsUpdate) __VoiceSettingsUpdate

__VoiceSettingsUpdate: VOICE_SETTINGS_UPDATE

### [__](#VoiceSettingsUpdate2) __VoiceSettingsUpdate2

__VoiceSettingsUpdate2: VOICE_SETTINGS_UPDATE_2

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#VoiceStateCreate) __VoiceStateCreate

__VoiceStateCreate: VOICE_STATE_CREATE

Dispatches channel voice state objects

### [__](#VoiceStateDelete) __VoiceStateDelete

__VoiceStateDelete: VOICE_STATE_DELETE

Dispatches channel voice state objects

### [__](#VoiceStateUpdate) __VoiceStateUpdate

__VoiceStateUpdate: VOICE_STATE_UPDATE

Dispatches channel voice state objects

Previous RPCErrorCodes Next RPCVoiceSettingsModeType

**Page Options**

Hide Inherited

- [__ActivityInvite](#ActivityInvite)
- [__ActivityJoin](#ActivityJoin)
- [__ActivityJoinRequest](#ActivityJoinRequest)
- [__ActivitySpectate](#ActivitySpectate)
- [__ChannelCreate](#ChannelCreate)
- [__CurrentUserUpdate](#CurrentUserUpdate)
- [__EntitlementCreate](#EntitlementCreate)
- [__EntitlementDelete](#EntitlementDelete)
- [__Error](#Error)
- [__GameJoin](#GameJoin)
- [__GameSpectate](#GameSpectate)
- [__GuildCreate](#GuildCreate)
- [__GuildStatus](#GuildStatus)
- [__MessageCreate](#MessageCreate)
- [__MessageDelete](#MessageDelete)
- [__MessageUpdate](#MessageUpdate)
- [__NotificationCreate](#NotificationCreate)
- [__Overlay](#Overlay)
- [__OverlayUpdate](#OverlayUpdate)
- [__Ready](#Ready)
- [__RelationshipUpdate](#RelationshipUpdate)
- [__SpeakingStart](#SpeakingStart)
- [__SpeakingStop](#SpeakingStop)
- [__VoiceChannelSelect](#VoiceChannelSelect)
- [__VoiceConnectionStatus](#VoiceConnectionStatus)
- [__VoiceSettingsUpdate](#VoiceSettingsUpdate)
- [__VoiceSettingsUpdate2](#VoiceSettingsUpdate2)
- [__VoiceStateCreate](#VoiceStateCreate)
- [__VoiceStateDelete](#VoiceStateDelete)
- [__VoiceStateUpdate](#VoiceStateUpdate)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.