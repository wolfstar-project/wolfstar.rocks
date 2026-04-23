InteractionResponseType | API | discord-api-types documentation

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
- InteractionResponseType

Version: Next

On this page

# InteractionResponseType

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-callback-type

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__ApplicationCommandAutocompleteResult](#ApplicationCommandAutocompleteResult)
- [__ChannelMessageWithSource](#ChannelMessageWithSource)
- [__DeferredChannelMessageWithSource](#DeferredChannelMessageWithSource)
- [__DeferredMessageUpdate](#DeferredMessageUpdate)
- [__LaunchActivity](#LaunchActivity)
- [__Modal](#Modal)
- [__Pong](#Pong)
- [__PremiumRequired](#PremiumRequired)
- [__UpdateMessage](#UpdateMessage)

## Enumeration Members [__](#Enumeration Members)

### [__](#ApplicationCommandAutocompleteResult) __ApplicationCommandAutocompleteResult

__ApplicationCommandAutocompleteResult: 8

For autocomplete interactions

### [__](#ChannelMessageWithSource) __ChannelMessageWithSource

__ChannelMessageWithSource: 4

Respond to an interaction with a message

### [__](#DeferredChannelMessageWithSource) __DeferredChannelMessageWithSource

__DeferredChannelMessageWithSource: 5

ACK an interaction and edit to a response later, the user sees a loading state

### [__](#DeferredMessageUpdate) __DeferredMessageUpdate

__DeferredMessageUpdate: 6

ACK a button interaction and update it to a loading state

### [__](#LaunchActivity) __LaunchActivity

__LaunchActivity: 12

Launch the Activity associated with the app.

<dl><dt>**@remarks**</dt>
<dd>

Only available for apps with Activities enabled

</dd></dl>

### [__](#Modal) __Modal

__Modal: 9

Respond to an interaction with an modal for a user to fill-out

### [__](#Pong) __Pong

__Pong: 1

ACK a `Ping`

### [__](#PremiumRequired) __PremiumRequired

__PremiumRequired: 10

Respond to an interaction with an upgrade button, only available for apps with monetization enabled

<dl><dt>**@deprecated**</dt>
<dd>

Send a button with Premium type instead. more here

</dd></dl>

### [__](#UpdateMessage) __UpdateMessage

__UpdateMessage: 7

ACK a button interaction and edit the message to which the button was attached

Previous InteractionContextType Next InteractionType

**Page Options**

Hide Inherited

- [__ApplicationCommandAutocompleteResult](#ApplicationCommandAutocompleteResult)
- [__ChannelMessageWithSource](#ChannelMessageWithSource)
- [__DeferredChannelMessageWithSource](#DeferredChannelMessageWithSource)
- [__DeferredMessageUpdate](#DeferredMessageUpdate)
- [__LaunchActivity](#LaunchActivity)
- [__Modal](#Modal)
- [__Pong](#Pong)
- [__PremiumRequired](#PremiumRequired)
- [__UpdateMessage](#UpdateMessage)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.