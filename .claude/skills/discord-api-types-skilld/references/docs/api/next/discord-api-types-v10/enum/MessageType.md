MessageType | API | discord-api-types documentation

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
- MessageType

Version: Next

On this page

# MessageType

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/resources/message#message-object-message-types

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__AutoModerationAction](#AutoModerationAction)
- [__Call](#Call)
- [__ChannelFollowAdd](#ChannelFollowAdd)
- [__ChannelIconChange](#ChannelIconChange)
- [__ChannelNameChange](#ChannelNameChange)
- [__ChannelPinnedMessage](#ChannelPinnedMessage)
- [__ChatInputCommand](#ChatInputCommand)
- [__ContextMenuCommand](#ContextMenuCommand)
- [__Default](#Default)
- [__GuildApplicationPremiumSubscription](#GuildApplicationPremiumSubscription)
- [__GuildBoost](#GuildBoost)
- [__GuildBoostTier1](#GuildBoostTier1)
- [__GuildBoostTier2](#GuildBoostTier2)
- [__GuildBoostTier3](#GuildBoostTier3)
- [__GuildDiscoveryDisqualified](#GuildDiscoveryDisqualified)
- [__GuildDiscoveryGracePeriodFinalWarning](#GuildDiscoveryGracePeriodFinalWarning)
- [__GuildDiscoveryGracePeriodInitialWarning](#GuildDiscoveryGracePeriodInitialWarning)
- [__GuildDiscoveryRequalified](#GuildDiscoveryRequalified)
- [__GuildIncidentAlertModeDisabled](#GuildIncidentAlertModeDisabled)
- [__GuildIncidentAlertModeEnabled](#GuildIncidentAlertModeEnabled)
- [__GuildIncidentReportFalseAlarm](#GuildIncidentReportFalseAlarm)
- [__GuildIncidentReportRaid](#GuildIncidentReportRaid)
- [__GuildInviteReminder](#GuildInviteReminder)
- [__InteractionPremiumUpsell](#InteractionPremiumUpsell)
- [__PollResult](#PollResult)
- [__PurchaseNotification](#PurchaseNotification)
- [__RecipientAdd](#RecipientAdd)
- [__RecipientRemove](#RecipientRemove)
- [__Reply](#Reply)
- [__RoleSubscriptionPurchase](#RoleSubscriptionPurchase)
- [__StageEnd](#StageEnd)
- [__StageRaiseHand](#StageRaiseHand)
- [__StageSpeaker](#StageSpeaker)
- [__StageStart](#StageStart)
- [__StageTopic](#StageTopic)
- [__ThreadCreated](#ThreadCreated)
- [__ThreadStarterMessage](#ThreadStarterMessage)
- [__UserJoin](#UserJoin)

## Enumeration Members [__](#Enumeration Members)

### [__](#AutoModerationAction) __AutoModerationAction

__AutoModerationAction: 24

### [__](#Call) __Call

__Call: 3

### [__](#ChannelFollowAdd) __ChannelFollowAdd

__ChannelFollowAdd: 12

### [__](#ChannelIconChange) __ChannelIconChange

__ChannelIconChange: 5

### [__](#ChannelNameChange) __ChannelNameChange

__ChannelNameChange: 4

### [__](#ChannelPinnedMessage) __ChannelPinnedMessage

__ChannelPinnedMessage: 6

### [__](#ChatInputCommand) __ChatInputCommand

__ChatInputCommand: 20

### [__](#ContextMenuCommand) __ContextMenuCommand

__ContextMenuCommand: 23

### [__](#Default) __Default

__Default: 0

### [__](#GuildApplicationPremiumSubscription) __GuildApplicationPremiumSubscription

__GuildApplicationPremiumSubscription: 32

### [__](#GuildBoost) __GuildBoost

__GuildBoost: 8

### [__](#GuildBoostTier1) __GuildBoostTier1

__GuildBoostTier1: 9

### [__](#GuildBoostTier2) __GuildBoostTier2

__GuildBoostTier2: 10

### [__](#GuildBoostTier3) __GuildBoostTier3

__GuildBoostTier3: 11

### [__](#GuildDiscoveryDisqualified) __GuildDiscoveryDisqualified

__GuildDiscoveryDisqualified: 14

### [__](#GuildDiscoveryGracePeriodFinalWarning) __GuildDiscoveryGracePeriodFinalWarning

__GuildDiscoveryGracePeriodFinalWarning: 17

### [__](#GuildDiscoveryGracePeriodInitialWarning) __GuildDiscoveryGracePeriodInitialWarning

__GuildDiscoveryGracePeriodInitialWarning: 16

### [__](#GuildDiscoveryRequalified) __GuildDiscoveryRequalified

__GuildDiscoveryRequalified: 15

### [__](#GuildIncidentAlertModeDisabled) __GuildIncidentAlertModeDisabled

__GuildIncidentAlertModeDisabled: 37

### [__](#GuildIncidentAlertModeEnabled) __GuildIncidentAlertModeEnabled

__GuildIncidentAlertModeEnabled: 36

### [__](#GuildIncidentReportFalseAlarm) __GuildIncidentReportFalseAlarm

__GuildIncidentReportFalseAlarm: 39

### [__](#GuildIncidentReportRaid) __GuildIncidentReportRaid

__GuildIncidentReportRaid: 38

### [__](#GuildInviteReminder) __GuildInviteReminder

__GuildInviteReminder: 22

### [__](#InteractionPremiumUpsell) __InteractionPremiumUpsell

__InteractionPremiumUpsell: 26

### [__](#PollResult) __PollResult

__PollResult: 46

### [__](#PurchaseNotification) __PurchaseNotification

__PurchaseNotification: 44

### [__](#RecipientAdd) __RecipientAdd

__RecipientAdd: 1

### [__](#RecipientRemove) __RecipientRemove

__RecipientRemove: 2

### [__](#Reply) __Reply

__Reply: 19

### [__](#RoleSubscriptionPurchase) __RoleSubscriptionPurchase

__RoleSubscriptionPurchase: 25

### [__](#StageEnd) __StageEnd

__StageEnd: 28

### [__](#StageRaiseHand) __StageRaiseHand

__StageRaiseHand: 30

<dl><dt>**@unstable**</dt>
<dd>

https://github.com/discord/discord-api-docs/pull/5927#discussion_r1107678548

</dd></dl>

### [__](#StageSpeaker) __StageSpeaker

__StageSpeaker: 29

### [__](#StageStart) __StageStart

__StageStart: 27

### [__](#StageTopic) __StageTopic

__StageTopic: 31

### [__](#ThreadCreated) __ThreadCreated

__ThreadCreated: 18

### [__](#ThreadStarterMessage) __ThreadStarterMessage

__ThreadStarterMessage: 21

### [__](#UserJoin) __UserJoin

__UserJoin: 7

Previous MessageSearchSortMode Next NameplatePalette

**Page Options**

Hide Inherited

- [__AutoModerationAction](#AutoModerationAction)
- [__Call](#Call)
- [__ChannelFollowAdd](#ChannelFollowAdd)
- [__ChannelIconChange](#ChannelIconChange)
- [__ChannelNameChange](#ChannelNameChange)
- [__ChannelPinnedMessage](#ChannelPinnedMessage)
- [__ChatInputCommand](#ChatInputCommand)
- [__ContextMenuCommand](#ContextMenuCommand)
- [__Default](#Default)
- [__GuildApplicationPremiumSubscription](#GuildApplicationPremiumSubscription)
- [__GuildBoost](#GuildBoost)
- [__GuildBoostTier1](#GuildBoostTier1)
- [__GuildBoostTier2](#GuildBoostTier2)
- [__GuildBoostTier3](#GuildBoostTier3)
- [__GuildDiscoveryDisqualified](#GuildDiscoveryDisqualified)
- [__GuildDiscoveryGracePeriodFinalWarning](#GuildDiscoveryGracePeriodFinalWarning)
- [__GuildDiscoveryGracePeriodInitialWarning](#GuildDiscoveryGracePeriodInitialWarning)
- [__GuildDiscoveryRequalified](#GuildDiscoveryRequalified)
- [__GuildIncidentAlertModeDisabled](#GuildIncidentAlertModeDisabled)
- [__GuildIncidentAlertModeEnabled](#GuildIncidentAlertModeEnabled)
- [__GuildIncidentReportFalseAlarm](#GuildIncidentReportFalseAlarm)
- [__GuildIncidentReportRaid](#GuildIncidentReportRaid)
- [__GuildInviteReminder](#GuildInviteReminder)
- [__InteractionPremiumUpsell](#InteractionPremiumUpsell)
- [__PollResult](#PollResult)
- [__PurchaseNotification](#PurchaseNotification)
- [__RecipientAdd](#RecipientAdd)
- [__RecipientRemove](#RecipientRemove)
- [__Reply](#Reply)
- [__RoleSubscriptionPurchase](#RoleSubscriptionPurchase)
- [__StageEnd](#StageEnd)
- [__StageRaiseHand](#StageRaiseHand)
- [__StageSpeaker](#StageSpeaker)
- [__StageStart](#StageStart)
- [__StageTopic](#StageTopic)
- [__ThreadCreated](#ThreadCreated)
- [__ThreadStarterMessage](#ThreadStarterMessage)
- [__UserJoin](#UserJoin)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.