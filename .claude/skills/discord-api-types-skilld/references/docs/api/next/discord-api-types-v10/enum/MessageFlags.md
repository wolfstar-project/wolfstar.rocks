MessageFlags | API | discord-api-types documentation

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
- MessageFlags

Version: Next

On this page

# MessageFlags

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/resources/message#message-object-message-flags

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__Crossposted](#Crossposted)
- [__Ephemeral](#Ephemeral)
- [__FailedToMentionSomeRolesInThread](#FailedToMentionSomeRolesInThread)
- [__HasSnapshot](#HasSnapshot)
- [__HasThread](#HasThread)
- [__IsComponentsV2](#IsComponentsV2)
- [__IsCrosspost](#IsCrosspost)
- [__IsVoiceMessage](#IsVoiceMessage)
- [__Loading](#Loading)
- [__ShouldShowLinkNotDiscordWarning](#ShouldShowLinkNotDiscordWarning)
- [__SourceMessageDeleted](#SourceMessageDeleted)
- [__SuppressEmbeds](#SuppressEmbeds)
- [__SuppressNotifications](#SuppressNotifications)
- [__Urgent](#Urgent)

## Enumeration Members [__](#Enumeration Members)

### [__](#Crossposted) __Crossposted

__Crossposted: 1

This message has been published to subscribed channels (via Channel Following)

### [__](#Ephemeral) __Ephemeral

__Ephemeral: 64

This message is only visible to the user who invoked the Interaction

### [__](#FailedToMentionSomeRolesInThread) __FailedToMentionSomeRolesInThread

__FailedToMentionSomeRolesInThread: 256

This message failed to mention some roles and add their members to the thread

### [__](#HasSnapshot) __HasSnapshot

__HasSnapshot: 16384

This message has a snapshot (via Message Forwarding)

### [__](#HasThread) __HasThread

__HasThread: 32

This message has an associated thread, which shares its id

### [__](#IsComponentsV2) __IsComponentsV2

__IsComponentsV2: 32768

Allows you to create fully component-driven messages

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/components/overview

</dd></dl>

### [__](#IsCrosspost) __IsCrosspost

__IsCrosspost: 2

This message originated from a message in another channel (via Channel Following)

### [__](#IsVoiceMessage) __IsVoiceMessage

__IsVoiceMessage: 8192

This message is a voice message

### [__](#Loading) __Loading

__Loading: 128

This message is an Interaction Response and the bot is "thinking"

### [__](#ShouldShowLinkNotDiscordWarning) __ShouldShowLinkNotDiscordWarning

__ShouldShowLinkNotDiscordWarning: 1024

<dl><dt>**@unstable**</dt>
<dd>

This message flag is currently not documented by Discord but has a known value which we will try to keep up to date.

</dd></dl>

### [__](#SourceMessageDeleted) __SourceMessageDeleted

__SourceMessageDeleted: 8

The source message for this crosspost has been deleted (via Channel Following)

### [__](#SuppressEmbeds) __SuppressEmbeds

__SuppressEmbeds: 4

Do not include any embeds when serializing this message

### [__](#SuppressNotifications) __SuppressNotifications

__SuppressNotifications: 4096

This message will not trigger push and desktop notifications

### [__](#Urgent) __Urgent

__Urgent: 16

This message came from the urgent message system

Previous MessageActivityType Next MessageReferenceType

**Page Options**

Hide Inherited

- [__Crossposted](#Crossposted)
- [__Ephemeral](#Ephemeral)
- [__FailedToMentionSomeRolesInThread](#FailedToMentionSomeRolesInThread)
- [__HasSnapshot](#HasSnapshot)
- [__HasThread](#HasThread)
- [__IsComponentsV2](#IsComponentsV2)
- [__IsCrosspost](#IsCrosspost)
- [__IsVoiceMessage](#IsVoiceMessage)
- [__Loading](#Loading)
- [__ShouldShowLinkNotDiscordWarning](#ShouldShowLinkNotDiscordWarning)
- [__SourceMessageDeleted](#SourceMessageDeleted)
- [__SuppressEmbeds](#SuppressEmbeds)
- [__SuppressNotifications](#SuppressNotifications)
- [__Urgent](#Urgent)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.