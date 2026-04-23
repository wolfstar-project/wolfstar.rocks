MessageSearchAuthorType | API | discord-api-types documentation

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
- MessageSearchAuthorType

Version: Next

On this page

# MessageSearchAuthorType

<dl><dt>**@remarks**</dt>
<dd>

All types can be negated by prefixing them with `-`, which means results will not include messages that match the type.

</dd><dt>**@see**</dt>
<dd>

https://docs.discord.com/developers/resources/message#search-guild-messages-author-types

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__Bot](#Bot)
- [__NotBot](#NotBot)
- [__NotUser](#NotUser)
- [__NotWebhook](#NotWebhook)
- [__User](#User)
- [__Webhook](#Webhook)

## Enumeration Members [__](#Enumeration Members)

### [__](#Bot) __Bot

__Bot: bot

Return messages sent by bot accounts

### [__](#NotBot) __NotBot

__NotBot: -bot

Return messages not sent by bot accounts

### [__](#NotUser) __NotUser

__NotUser: -user

Return messages not sent by user accounts

### [__](#NotWebhook) __NotWebhook

__NotWebhook: -webhook

Return messages not sent by webhooks

### [__](#User) __User

__User: user

Return messages sent by user accounts

### [__](#Webhook) __Webhook

__Webhook: webhook

Return messages sent by webhooks

Previous MessageReferenceType Next MessageSearchEmbedType

**Page Options**

Hide Inherited

- [__Bot](#Bot)
- [__NotBot](#NotBot)
- [__NotUser](#NotUser)
- [__NotWebhook](#NotWebhook)
- [__User](#User)
- [__Webhook](#Webhook)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.