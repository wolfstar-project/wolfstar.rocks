ApplicationFlags | API | discord-api-types documentation

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
- ApplicationFlags

Version: Next

On this page

# ApplicationFlags

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/resources/application#application-object-application-flags

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__ApplicationAutoModerationRuleCreateBadge](#ApplicationAutoModerationRuleCreateBadge)
- [__ApplicationCommandBadge](#ApplicationCommandBadge)
- [__Embedded](#Embedded)
- [__EmbeddedFirstParty](#EmbeddedFirstParty)
- [__EmbeddedIAP](#EmbeddedIAP)
- [__EmbeddedReleased](#EmbeddedReleased)
- [__GatewayGuildMembers](#GatewayGuildMembers)
- [__GatewayGuildMembersLimited](#GatewayGuildMembersLimited)
- [__GatewayMessageContent](#GatewayMessageContent)
- [__GatewayMessageContentLimited](#GatewayMessageContentLimited)
- [__GatewayPresence](#GatewayPresence)
- [__GatewayPresenceLimited](#GatewayPresenceLimited)
- [__GroupDMCreate](#GroupDMCreate)
- [__ManagedEmoji](#ManagedEmoji)
- [__RPCHasConnected](#RPCHasConnected)
- [__VerificationPendingGuildLimit](#VerificationPendingGuildLimit)

## Enumeration Members [__](#Enumeration Members)

### [__](#ApplicationAutoModerationRuleCreateBadge) __ApplicationAutoModerationRuleCreateBadge

__ApplicationAutoModerationRuleCreateBadge: 64

Indicates if an app uses the Auto Moderation API

### [__](#ApplicationCommandBadge) __ApplicationCommandBadge

__ApplicationCommandBadge: 8388608

Indicates if an app has registered global commands

### [__](#Embedded) __Embedded

__Embedded: 131072

Indicates if an app is embedded within the Discord client (currently unavailable publicly)

### [__](#EmbeddedFirstParty) __EmbeddedFirstParty

__EmbeddedFirstParty: 1048576

<dl><dt>**@unstable**</dt>
<dd>

This application flag is currently not documented by Discord but has a known value which we will try to keep up to date.

</dd></dl>

### [__](#EmbeddedIAP) __EmbeddedIAP

__EmbeddedIAP: 8

<dl><dt>**@unstable**</dt>
<dd>

This application flag is currently not documented by Discord but has a known value which we will try to keep up to date.

</dd></dl>

### [__](#EmbeddedReleased) __EmbeddedReleased

__EmbeddedReleased: 2

<dl><dt>**@unstable**</dt>
<dd>

This application flag is currently not documented by Discord but has a known value which we will try to keep up to date.

</dd></dl>

### [__](#GatewayGuildMembers) __GatewayGuildMembers

__GatewayGuildMembers: 16384

Intent required for bots in 100 or more servers to receive member-related events like `guild_member_add`.

<dl><dt>**@see**</dt>
<dd>

List of member-related events `GUILD_MEMBERS`

</dd></dl>

### [__](#GatewayGuildMembersLimited) __GatewayGuildMembersLimited

__GatewayGuildMembersLimited: 32768

Intent required for bots in under 100 servers to receive member-related events like `guild_member_add`, found in Bot Settings.

<dl><dt>**@see**</dt>
<dd>

List of member-related events `GUILD_MEMBERS`

</dd></dl>

### [__](#GatewayMessageContent) __GatewayMessageContent

__GatewayMessageContent: 262144

Intent required for bots in 100 or more servers to receive content

### [__](#GatewayMessageContentLimited) __GatewayMessageContentLimited

__GatewayMessageContentLimited: 524288

Intent required for bots in under 100 servers to receive content, found in Bot Settings

### [__](#GatewayPresence) __GatewayPresence

__GatewayPresence: 4096

Intent required for bots in 100 or more servers to receive `presence_update` events

### [__](#GatewayPresenceLimited) __GatewayPresenceLimited

__GatewayPresenceLimited: 8192

Intent required for bots in under 100 servers to receive `presence_update` events, found in Bot Settings

### [__](#GroupDMCreate) __GroupDMCreate

__GroupDMCreate: 16

<dl><dt>**@unstable**</dt>
<dd>

This application flag is currently not documented by Discord but has a known value which we will try to keep up to date.

</dd></dl>

### [__](#ManagedEmoji) __ManagedEmoji

__ManagedEmoji: 4

<dl><dt>**@unstable**</dt>
<dd>

This application flag is currently not documented by Discord but has a known value which we will try to keep up to date.

</dd></dl>

### [__](#RPCHasConnected) __RPCHasConnected

__RPCHasConnected: 2048

<dl><dt>**@unstable**</dt>
<dd>

This application flag is currently not documented by Discord but has a known value which we will try to keep up to date.

</dd></dl>

### [__](#VerificationPendingGuildLimit) __VerificationPendingGuildLimit

__VerificationPendingGuildLimit: 65536

Indicates unusual growth of an app that prevents verification

Previous ApplicationCommandType Next ApplicationIntegrationType

**Page Options**

Hide Inherited

- [__ApplicationAutoModerationRuleCreateBadge](#ApplicationAutoModerationRuleCreateBadge)
- [__ApplicationCommandBadge](#ApplicationCommandBadge)
- [__Embedded](#Embedded)
- [__EmbeddedFirstParty](#EmbeddedFirstParty)
- [__EmbeddedIAP](#EmbeddedIAP)
- [__EmbeddedReleased](#EmbeddedReleased)
- [__GatewayGuildMembers](#GatewayGuildMembers)
- [__GatewayGuildMembersLimited](#GatewayGuildMembersLimited)
- [__GatewayMessageContent](#GatewayMessageContent)
- [__GatewayMessageContentLimited](#GatewayMessageContentLimited)
- [__GatewayPresence](#GatewayPresence)
- [__GatewayPresenceLimited](#GatewayPresenceLimited)
- [__GroupDMCreate](#GroupDMCreate)
- [__ManagedEmoji](#ManagedEmoji)
- [__RPCHasConnected](#RPCHasConnected)
- [__VerificationPendingGuildLimit](#VerificationPendingGuildLimit)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.