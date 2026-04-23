ChannelFlags | API | discord-api-types documentation

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
- ChannelFlags

Version: Next

On this page

# ChannelFlags

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/resources/channel#channel-object-channel-flags

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__ActiveChannelsRemoved](#ActiveChannelsRemoved)
- [__ClydeAI](#ClydeAI)
- [__GuildFeedRemoved](#GuildFeedRemoved)
- [__HideMediaDownloadOptions](#HideMediaDownloadOptions)
- [__IsGuildResourceChannel](#IsGuildResourceChannel)
- [__IsScheduledForDeletion](#IsScheduledForDeletion)
- [__IsSpam](#IsSpam)
- [__Pinned](#Pinned)
- [__RequireTag](#RequireTag)

## Enumeration Members [__](#Enumeration Members)

### [__](#ActiveChannelsRemoved) __ActiveChannelsRemoved

__ActiveChannelsRemoved: 4

<dl><dt>**@unstable**</dt>
<dd>

This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.

</dd></dl>

### [__](#ClydeAI) __ClydeAI

__ClydeAI: 256

<dl><dt>**@unstable**</dt>
<dd>

This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.

</dd></dl>

### [__](#GuildFeedRemoved) __GuildFeedRemoved

__GuildFeedRemoved: 1

<dl><dt>**@unstable**</dt>
<dd>

This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.

</dd></dl>

### [__](#HideMediaDownloadOptions) __HideMediaDownloadOptions

__HideMediaDownloadOptions: 32768

Whether media download options are hidden.

### [__](#IsGuildResourceChannel) __IsGuildResourceChannel

__IsGuildResourceChannel: 128

<dl><dt>**@unstable**</dt>
<dd>

This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.

</dd></dl>

### [__](#IsScheduledForDeletion) __IsScheduledForDeletion

__IsScheduledForDeletion: 512

<dl><dt>**@unstable**</dt>
<dd>

This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.

</dd></dl>

### [__](#IsSpam) __IsSpam

__IsSpam: 32

<dl><dt>**@unstable**</dt>
<dd>

This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.

</dd></dl>

### [__](#Pinned) __Pinned

__Pinned: 2

This thread is pinned to the top of its parent forum channel

### [__](#RequireTag) __RequireTag

__RequireTag: 16

Whether a tag is required to be specified when creating a thread in a forum channel. Tags are specified in the `applied_tags` field

Previous ButtonStyle Next ChannelType

**Page Options**

Hide Inherited

- [__ActiveChannelsRemoved](#ActiveChannelsRemoved)
- [__ClydeAI](#ClydeAI)
- [__GuildFeedRemoved](#GuildFeedRemoved)
- [__HideMediaDownloadOptions](#HideMediaDownloadOptions)
- [__IsGuildResourceChannel](#IsGuildResourceChannel)
- [__IsScheduledForDeletion](#IsScheduledForDeletion)
- [__IsSpam](#IsSpam)
- [__Pinned](#Pinned)
- [__RequireTag](#RequireTag)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.