GatewayDispatchEvents | API | discord-api-types documentation

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
- GatewayDispatchEvents

Version: Next

On this page

# GatewayDispatchEvents

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/gateway-events#receive-events

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__ApplicationCommandPermissionsUpdate](#ApplicationCommandPermissionsUpdate)
- [__AutoModerationActionExecution](#AutoModerationActionExecution)
- [__AutoModerationRuleCreate](#AutoModerationRuleCreate)
- [__AutoModerationRuleDelete](#AutoModerationRuleDelete)
- [__AutoModerationRuleUpdate](#AutoModerationRuleUpdate)
- [__ChannelCreate](#ChannelCreate)
- [__ChannelDelete](#ChannelDelete)
- [__ChannelPinsUpdate](#ChannelPinsUpdate)
- [__ChannelUpdate](#ChannelUpdate)
- [__EntitlementCreate](#EntitlementCreate)
- [__EntitlementDelete](#EntitlementDelete)
- [__EntitlementUpdate](#EntitlementUpdate)
- [__GuildAuditLogEntryCreate](#GuildAuditLogEntryCreate)
- [__GuildBanAdd](#GuildBanAdd)
- [__GuildBanRemove](#GuildBanRemove)
- [__GuildCreate](#GuildCreate)
- [__GuildDelete](#GuildDelete)
- [__GuildEmojisUpdate](#GuildEmojisUpdate)
- [__GuildIntegrationsUpdate](#GuildIntegrationsUpdate)
- [__GuildMemberAdd](#GuildMemberAdd)
- [__GuildMemberRemove](#GuildMemberRemove)
- [__GuildMembersChunk](#GuildMembersChunk)
- [__GuildMemberUpdate](#GuildMemberUpdate)
- [__GuildRoleCreate](#GuildRoleCreate)
- [__GuildRoleDelete](#GuildRoleDelete)
- [__GuildRoleUpdate](#GuildRoleUpdate)
- [__GuildScheduledEventCreate](#GuildScheduledEventCreate)
- [__GuildScheduledEventDelete](#GuildScheduledEventDelete)
- [__GuildScheduledEventUpdate](#GuildScheduledEventUpdate)
- [__GuildScheduledEventUserAdd](#GuildScheduledEventUserAdd)
- [__GuildScheduledEventUserRemove](#GuildScheduledEventUserRemove)
- [__GuildSoundboardSoundCreate](#GuildSoundboardSoundCreate)
- [__GuildSoundboardSoundDelete](#GuildSoundboardSoundDelete)
- [__GuildSoundboardSoundsUpdate](#GuildSoundboardSoundsUpdate)
- [__GuildSoundboardSoundUpdate](#GuildSoundboardSoundUpdate)
- [__GuildStickersUpdate](#GuildStickersUpdate)
- [__GuildUpdate](#GuildUpdate)
- [__IntegrationCreate](#IntegrationCreate)
- [__IntegrationDelete](#IntegrationDelete)
- [__IntegrationUpdate](#IntegrationUpdate)
- [__InteractionCreate](#InteractionCreate)
- [__InviteCreate](#InviteCreate)
- [__InviteDelete](#InviteDelete)
- [__MessageCreate](#MessageCreate)
- [__MessageDelete](#MessageDelete)
- [__MessageDeleteBulk](#MessageDeleteBulk)
- [__MessagePollVoteAdd](#MessagePollVoteAdd)
- [__MessagePollVoteRemove](#MessagePollVoteRemove)
- [__MessageReactionAdd](#MessageReactionAdd)
- [__MessageReactionRemove](#MessageReactionRemove)
- [__MessageReactionRemoveAll](#MessageReactionRemoveAll)
- [__MessageReactionRemoveEmoji](#MessageReactionRemoveEmoji)
- [__MessageUpdate](#MessageUpdate)
- [__PresenceUpdate](#PresenceUpdate)
- [__RateLimited](#RateLimited)
- [__Ready](#Ready)
- [__Resumed](#Resumed)
- [__SoundboardSounds](#SoundboardSounds)
- [__StageInstanceCreate](#StageInstanceCreate)
- [__StageInstanceDelete](#StageInstanceDelete)
- [__StageInstanceUpdate](#StageInstanceUpdate)
- [__SubscriptionCreate](#SubscriptionCreate)
- [__SubscriptionDelete](#SubscriptionDelete)
- [__SubscriptionUpdate](#SubscriptionUpdate)
- [__ThreadCreate](#ThreadCreate)
- [__ThreadDelete](#ThreadDelete)
- [__ThreadListSync](#ThreadListSync)
- [__ThreadMembersUpdate](#ThreadMembersUpdate)
- [__ThreadMemberUpdate](#ThreadMemberUpdate)
- [__ThreadUpdate](#ThreadUpdate)
- [__TypingStart](#TypingStart)
- [__UserUpdate](#UserUpdate)
- [__VoiceChannelEffectSend](#VoiceChannelEffectSend)
- [__VoiceServerUpdate](#VoiceServerUpdate)
- [__VoiceStateUpdate](#VoiceStateUpdate)
- [__WebhooksUpdate](#WebhooksUpdate)

## Enumeration Members [__](#Enumeration Members)

### [__](#ApplicationCommandPermissionsUpdate) __ApplicationCommandPermissionsUpdate

__ApplicationCommandPermissionsUpdate: APPLICATION_COMMAND_PERMISSIONS_UPDATE

### [__](#AutoModerationActionExecution) __AutoModerationActionExecution

__AutoModerationActionExecution: AUTO_MODERATION_ACTION_EXECUTION

### [__](#AutoModerationRuleCreate) __AutoModerationRuleCreate

__AutoModerationRuleCreate: AUTO_MODERATION_RULE_CREATE

### [__](#AutoModerationRuleDelete) __AutoModerationRuleDelete

__AutoModerationRuleDelete: AUTO_MODERATION_RULE_DELETE

### [__](#AutoModerationRuleUpdate) __AutoModerationRuleUpdate

__AutoModerationRuleUpdate: AUTO_MODERATION_RULE_UPDATE

### [__](#ChannelCreate) __ChannelCreate

__ChannelCreate: CHANNEL_CREATE

### [__](#ChannelDelete) __ChannelDelete

__ChannelDelete: CHANNEL_DELETE

### [__](#ChannelPinsUpdate) __ChannelPinsUpdate

__ChannelPinsUpdate: CHANNEL_PINS_UPDATE

### [__](#ChannelUpdate) __ChannelUpdate

__ChannelUpdate: CHANNEL_UPDATE

### [__](#EntitlementCreate) __EntitlementCreate

__EntitlementCreate: ENTITLEMENT_CREATE

### [__](#EntitlementDelete) __EntitlementDelete

__EntitlementDelete: ENTITLEMENT_DELETE

### [__](#EntitlementUpdate) __EntitlementUpdate

__EntitlementUpdate: ENTITLEMENT_UPDATE

### [__](#GuildAuditLogEntryCreate) __GuildAuditLogEntryCreate

__GuildAuditLogEntryCreate: GUILD_AUDIT_LOG_ENTRY_CREATE

### [__](#GuildBanAdd) __GuildBanAdd

__GuildBanAdd: GUILD_BAN_ADD

### [__](#GuildBanRemove) __GuildBanRemove

__GuildBanRemove: GUILD_BAN_REMOVE

### [__](#GuildCreate) __GuildCreate

__GuildCreate: GUILD_CREATE

### [__](#GuildDelete) __GuildDelete

__GuildDelete: GUILD_DELETE

### [__](#GuildEmojisUpdate) __GuildEmojisUpdate

__GuildEmojisUpdate: GUILD_EMOJIS_UPDATE

### [__](#GuildIntegrationsUpdate) __GuildIntegrationsUpdate

__GuildIntegrationsUpdate: GUILD_INTEGRATIONS_UPDATE

### [__](#GuildMemberAdd) __GuildMemberAdd

__GuildMemberAdd: GUILD_MEMBER_ADD

### [__](#GuildMemberRemove) __GuildMemberRemove

__GuildMemberRemove: GUILD_MEMBER_REMOVE

### [__](#GuildMembersChunk) __GuildMembersChunk

__GuildMembersChunk: GUILD_MEMBERS_CHUNK

### [__](#GuildMemberUpdate) __GuildMemberUpdate

__GuildMemberUpdate: GUILD_MEMBER_UPDATE

### [__](#GuildRoleCreate) __GuildRoleCreate

__GuildRoleCreate: GUILD_ROLE_CREATE

### [__](#GuildRoleDelete) __GuildRoleDelete

__GuildRoleDelete: GUILD_ROLE_DELETE

### [__](#GuildRoleUpdate) __GuildRoleUpdate

__GuildRoleUpdate: GUILD_ROLE_UPDATE

### [__](#GuildScheduledEventCreate) __GuildScheduledEventCreate

__GuildScheduledEventCreate: GUILD_SCHEDULED_EVENT_CREATE

### [__](#GuildScheduledEventDelete) __GuildScheduledEventDelete

__GuildScheduledEventDelete: GUILD_SCHEDULED_EVENT_DELETE

### [__](#GuildScheduledEventUpdate) __GuildScheduledEventUpdate

__GuildScheduledEventUpdate: GUILD_SCHEDULED_EVENT_UPDATE

### [__](#GuildScheduledEventUserAdd) __GuildScheduledEventUserAdd

__GuildScheduledEventUserAdd: GUILD_SCHEDULED_EVENT_USER_ADD

### [__](#GuildScheduledEventUserRemove) __GuildScheduledEventUserRemove

__GuildScheduledEventUserRemove: GUILD_SCHEDULED_EVENT_USER_REMOVE

### [__](#GuildSoundboardSoundCreate) __GuildSoundboardSoundCreate

__GuildSoundboardSoundCreate: GUILD_SOUNDBOARD_SOUND_CREATE

### [__](#GuildSoundboardSoundDelete) __GuildSoundboardSoundDelete

__GuildSoundboardSoundDelete: GUILD_SOUNDBOARD_SOUND_DELETE

### [__](#GuildSoundboardSoundsUpdate) __GuildSoundboardSoundsUpdate

__GuildSoundboardSoundsUpdate: GUILD_SOUNDBOARD_SOUNDS_UPDATE

### [__](#GuildSoundboardSoundUpdate) __GuildSoundboardSoundUpdate

__GuildSoundboardSoundUpdate: GUILD_SOUNDBOARD_SOUND_UPDATE

### [__](#GuildStickersUpdate) __GuildStickersUpdate

__GuildStickersUpdate: GUILD_STICKERS_UPDATE

### [__](#GuildUpdate) __GuildUpdate

__GuildUpdate: GUILD_UPDATE

### [__](#IntegrationCreate) __IntegrationCreate

__IntegrationCreate: INTEGRATION_CREATE

### [__](#IntegrationDelete) __IntegrationDelete

__IntegrationDelete: INTEGRATION_DELETE

### [__](#IntegrationUpdate) __IntegrationUpdate

__IntegrationUpdate: INTEGRATION_UPDATE

### [__](#InteractionCreate) __InteractionCreate

__InteractionCreate: INTERACTION_CREATE

### [__](#InviteCreate) __InviteCreate

__InviteCreate: INVITE_CREATE

### [__](#InviteDelete) __InviteDelete

__InviteDelete: INVITE_DELETE

### [__](#MessageCreate) __MessageCreate

__MessageCreate: MESSAGE_CREATE

### [__](#MessageDelete) __MessageDelete

__MessageDelete: MESSAGE_DELETE

### [__](#MessageDeleteBulk) __MessageDeleteBulk

__MessageDeleteBulk: MESSAGE_DELETE_BULK

### [__](#MessagePollVoteAdd) __MessagePollVoteAdd

__MessagePollVoteAdd: MESSAGE_POLL_VOTE_ADD

### [__](#MessagePollVoteRemove) __MessagePollVoteRemove

__MessagePollVoteRemove: MESSAGE_POLL_VOTE_REMOVE

### [__](#MessageReactionAdd) __MessageReactionAdd

__MessageReactionAdd: MESSAGE_REACTION_ADD

### [__](#MessageReactionRemove) __MessageReactionRemove

__MessageReactionRemove: MESSAGE_REACTION_REMOVE

### [__](#MessageReactionRemoveAll) __MessageReactionRemoveAll

__MessageReactionRemoveAll: MESSAGE_REACTION_REMOVE_ALL

### [__](#MessageReactionRemoveEmoji) __MessageReactionRemoveEmoji

__MessageReactionRemoveEmoji: MESSAGE_REACTION_REMOVE_EMOJI

### [__](#MessageUpdate) __MessageUpdate

__MessageUpdate: MESSAGE_UPDATE

### [__](#PresenceUpdate) __PresenceUpdate

__PresenceUpdate: PRESENCE_UPDATE

### [__](#RateLimited) __RateLimited

__RateLimited: RATE_LIMITED

### [__](#Ready) __Ready

__Ready: READY

### [__](#Resumed) __Resumed

__Resumed: RESUMED

### [__](#SoundboardSounds) __SoundboardSounds

__SoundboardSounds: SOUNDBOARD_SOUNDS

### [__](#StageInstanceCreate) __StageInstanceCreate

__StageInstanceCreate: STAGE_INSTANCE_CREATE

### [__](#StageInstanceDelete) __StageInstanceDelete

__StageInstanceDelete: STAGE_INSTANCE_DELETE

### [__](#StageInstanceUpdate) __StageInstanceUpdate

__StageInstanceUpdate: STAGE_INSTANCE_UPDATE

### [__](#SubscriptionCreate) __SubscriptionCreate

__SubscriptionCreate: SUBSCRIPTION_CREATE

### [__](#SubscriptionDelete) __SubscriptionDelete

__SubscriptionDelete: SUBSCRIPTION_DELETE

### [__](#SubscriptionUpdate) __SubscriptionUpdate

__SubscriptionUpdate: SUBSCRIPTION_UPDATE

### [__](#ThreadCreate) __ThreadCreate

__ThreadCreate: THREAD_CREATE

### [__](#ThreadDelete) __ThreadDelete

__ThreadDelete: THREAD_DELETE

### [__](#ThreadListSync) __ThreadListSync

__ThreadListSync: THREAD_LIST_SYNC

### [__](#ThreadMembersUpdate) __ThreadMembersUpdate

__ThreadMembersUpdate: THREAD_MEMBERS_UPDATE

### [__](#ThreadMemberUpdate) __ThreadMemberUpdate

__ThreadMemberUpdate: THREAD_MEMBER_UPDATE

### [__](#ThreadUpdate) __ThreadUpdate

__ThreadUpdate: THREAD_UPDATE

### [__](#TypingStart) __TypingStart

__TypingStart: TYPING_START

### [__](#UserUpdate) __UserUpdate

__UserUpdate: USER_UPDATE

### [__](#VoiceChannelEffectSend) __VoiceChannelEffectSend

__VoiceChannelEffectSend: VOICE_CHANNEL_EFFECT_SEND

### [__](#VoiceServerUpdate) __VoiceServerUpdate

__VoiceServerUpdate: VOICE_SERVER_UPDATE

### [__](#VoiceStateUpdate) __VoiceStateUpdate

__VoiceStateUpdate: VOICE_STATE_UPDATE

### [__](#WebhooksUpdate) __WebhooksUpdate

__WebhooksUpdate: WEBHOOKS_UPDATE

Previous GatewayCloseCodes Next GatewayIntentBits

**Page Options**

Hide Inherited

- [__ApplicationCommandPermissionsUpdate](#ApplicationCommandPermissionsUpdate)
- [__AutoModerationActionExecution](#AutoModerationActionExecution)
- [__AutoModerationRuleCreate](#AutoModerationRuleCreate)
- [__AutoModerationRuleDelete](#AutoModerationRuleDelete)
- [__AutoModerationRuleUpdate](#AutoModerationRuleUpdate)
- [__ChannelCreate](#ChannelCreate)
- [__ChannelDelete](#ChannelDelete)
- [__ChannelPinsUpdate](#ChannelPinsUpdate)
- [__ChannelUpdate](#ChannelUpdate)
- [__EntitlementCreate](#EntitlementCreate)
- [__EntitlementDelete](#EntitlementDelete)
- [__EntitlementUpdate](#EntitlementUpdate)
- [__GuildAuditLogEntryCreate](#GuildAuditLogEntryCreate)
- [__GuildBanAdd](#GuildBanAdd)
- [__GuildBanRemove](#GuildBanRemove)
- [__GuildCreate](#GuildCreate)
- [__GuildDelete](#GuildDelete)
- [__GuildEmojisUpdate](#GuildEmojisUpdate)
- [__GuildIntegrationsUpdate](#GuildIntegrationsUpdate)
- [__GuildMemberAdd](#GuildMemberAdd)
- [__GuildMemberRemove](#GuildMemberRemove)
- [__GuildMembersChunk](#GuildMembersChunk)
- [__GuildMemberUpdate](#GuildMemberUpdate)
- [__GuildRoleCreate](#GuildRoleCreate)
- [__GuildRoleDelete](#GuildRoleDelete)
- [__GuildRoleUpdate](#GuildRoleUpdate)
- [__GuildScheduledEventCreate](#GuildScheduledEventCreate)
- [__GuildScheduledEventDelete](#GuildScheduledEventDelete)
- [__GuildScheduledEventUpdate](#GuildScheduledEventUpdate)
- [__GuildScheduledEventUserAdd](#GuildScheduledEventUserAdd)
- [__GuildScheduledEventUserRemove](#GuildScheduledEventUserRemove)
- [__GuildSoundboardSoundCreate](#GuildSoundboardSoundCreate)
- [__GuildSoundboardSoundDelete](#GuildSoundboardSoundDelete)
- [__GuildSoundboardSoundsUpdate](#GuildSoundboardSoundsUpdate)
- [__GuildSoundboardSoundUpdate](#GuildSoundboardSoundUpdate)
- [__GuildStickersUpdate](#GuildStickersUpdate)
- [__GuildUpdate](#GuildUpdate)
- [__IntegrationCreate](#IntegrationCreate)
- [__IntegrationDelete](#IntegrationDelete)
- [__IntegrationUpdate](#IntegrationUpdate)
- [__InteractionCreate](#InteractionCreate)
- [__InviteCreate](#InviteCreate)
- [__InviteDelete](#InviteDelete)
- [__MessageCreate](#MessageCreate)
- [__MessageDelete](#MessageDelete)
- [__MessageDeleteBulk](#MessageDeleteBulk)
- [__MessagePollVoteAdd](#MessagePollVoteAdd)
- [__MessagePollVoteRemove](#MessagePollVoteRemove)
- [__MessageReactionAdd](#MessageReactionAdd)
- [__MessageReactionRemove](#MessageReactionRemove)
- [__MessageReactionRemoveAll](#MessageReactionRemoveAll)
- [__MessageReactionRemoveEmoji](#MessageReactionRemoveEmoji)
- [__MessageUpdate](#MessageUpdate)
- [__PresenceUpdate](#PresenceUpdate)
- [__RateLimited](#RateLimited)
- [__Ready](#Ready)
- [__Resumed](#Resumed)
- [__SoundboardSounds](#SoundboardSounds)
- [__StageInstanceCreate](#StageInstanceCreate)
- [__StageInstanceDelete](#StageInstanceDelete)
- [__StageInstanceUpdate](#StageInstanceUpdate)
- [__SubscriptionCreate](#SubscriptionCreate)
- [__SubscriptionDelete](#SubscriptionDelete)
- [__SubscriptionUpdate](#SubscriptionUpdate)
- [__ThreadCreate](#ThreadCreate)
- [__ThreadDelete](#ThreadDelete)
- [__ThreadListSync](#ThreadListSync)
- [__ThreadMembersUpdate](#ThreadMembersUpdate)
- [__ThreadMemberUpdate](#ThreadMemberUpdate)
- [__ThreadUpdate](#ThreadUpdate)
- [__TypingStart](#TypingStart)
- [__UserUpdate](#UserUpdate)
- [__VoiceChannelEffectSend](#VoiceChannelEffectSend)
- [__VoiceServerUpdate](#VoiceServerUpdate)
- [__VoiceStateUpdate](#VoiceStateUpdate)
- [__WebhooksUpdate](#WebhooksUpdate)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.