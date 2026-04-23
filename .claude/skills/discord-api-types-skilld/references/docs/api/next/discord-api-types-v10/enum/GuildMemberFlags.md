GuildMemberFlags | API | discord-api-types documentation

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
- GuildMemberFlags

Version: Next

On this page

# GuildMemberFlags

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-flags

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__AutomodQuarantinedBio](#AutomodQuarantinedBio)
- [__AutoModQuarantinedGuildTag](#AutoModQuarantinedGuildTag)
- [__AutomodQuarantinedUsernameOrGuildNickname](#AutomodQuarantinedUsernameOrGuildNickname)
- [__BypassesVerification](#BypassesVerification)
- [__CompletedHomeActions](#CompletedHomeActions)
- [__CompletedOnboarding](#CompletedOnboarding)
- [__DidRejoin](#DidRejoin)
- [__DmSettingsUpsellAcknowledged](#DmSettingsUpsellAcknowledged)
- [__IsGuest](#IsGuest)
- [__StartedHomeActions](#StartedHomeActions)
- [__StartedOnboarding](#StartedOnboarding)

## Enumeration Members [__](#Enumeration Members)

### [__](#AutomodQuarantinedBio) __AutomodQuarantinedBio

__AutomodQuarantinedBio: 256

<dl><dt>**@deprecated**</dt>
<dd>

discord-api-docs#7113

</dd></dl>

### [__](#AutoModQuarantinedGuildTag) __AutoModQuarantinedGuildTag

__AutoModQuarantinedGuildTag: 1024

Member's guild tag is blocked by AutoMod

### [__](#AutomodQuarantinedUsernameOrGuildNickname) __AutomodQuarantinedUsernameOrGuildNickname

__AutomodQuarantinedUsernameOrGuildNickname: 128

Member's username, display name, or nickname is blocked by AutoMod

### [__](#BypassesVerification) __BypassesVerification

__BypassesVerification: 4

Member is exempt from guild verification requirements

### [__](#CompletedHomeActions) __CompletedHomeActions

__CompletedHomeActions: 64

Member has completed Server Guide new member actions

### [__](#CompletedOnboarding) __CompletedOnboarding

__CompletedOnboarding: 2

Member has completed onboarding

### [__](#DidRejoin) __DidRejoin

__DidRejoin: 1

Member has left and rejoined the guild

### [__](#DmSettingsUpsellAcknowledged) __DmSettingsUpsellAcknowledged

__DmSettingsUpsellAcknowledged: 512

Member has dismissed the DM settings upsell

### [__](#IsGuest) __IsGuest

__IsGuest: 16

Member is a guest and can only access the voice channel they were invited to

### [__](#StartedHomeActions) __StartedHomeActions

__StartedHomeActions: 32

Member has started Server Guide new member actions

### [__](#StartedOnboarding) __StartedOnboarding

__StartedOnboarding: 8

Member has started onboarding

Previous GuildHubType Next GuildMFALevel

**Page Options**

Hide Inherited

- [__AutomodQuarantinedBio](#AutomodQuarantinedBio)
- [__AutoModQuarantinedGuildTag](#AutoModQuarantinedGuildTag)
- [__AutomodQuarantinedUsernameOrGuildNickname](#AutomodQuarantinedUsernameOrGuildNickname)
- [__BypassesVerification](#BypassesVerification)
- [__CompletedHomeActions](#CompletedHomeActions)
- [__CompletedOnboarding](#CompletedOnboarding)
- [__DidRejoin](#DidRejoin)
- [__DmSettingsUpsellAcknowledged](#DmSettingsUpsellAcknowledged)
- [__IsGuest](#IsGuest)
- [__StartedHomeActions](#StartedHomeActions)
- [__StartedOnboarding](#StartedOnboarding)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.