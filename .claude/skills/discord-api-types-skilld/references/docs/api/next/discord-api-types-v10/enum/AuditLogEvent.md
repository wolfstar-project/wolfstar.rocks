AuditLogEvent | API | discord-api-types documentation

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
- AuditLogEvent

Version: Next

On this page

# AuditLogEvent

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-audit-log-events

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__ApplicationCommandPermissionUpdate](#ApplicationCommandPermissionUpdate)
- [__AutoModerationBlockMessage](#AutoModerationBlockMessage)
- [__AutoModerationFlagToChannel](#AutoModerationFlagToChannel)
- [__AutoModerationQuarantineUser](#AutoModerationQuarantineUser)
- [__AutoModerationRuleCreate](#AutoModerationRuleCreate)
- [__AutoModerationRuleDelete](#AutoModerationRuleDelete)
- [__AutoModerationRuleUpdate](#AutoModerationRuleUpdate)
- [__AutoModerationUserCommunicationDisabled](#AutoModerationUserCommunicationDisabled)
- [__BotAdd](#BotAdd)
- [__ChannelCreate](#ChannelCreate)
- [__ChannelDelete](#ChannelDelete)
- [__ChannelOverwriteCreate](#ChannelOverwriteCreate)
- [__ChannelOverwriteDelete](#ChannelOverwriteDelete)
- [__ChannelOverwriteUpdate](#ChannelOverwriteUpdate)
- [__ChannelUpdate](#ChannelUpdate)
- [__CreatorMonetizationRequestCreated](#CreatorMonetizationRequestCreated)
- [__CreatorMonetizationTermsAccepted](#CreatorMonetizationTermsAccepted)
- [__EmojiCreate](#EmojiCreate)
- [__EmojiDelete](#EmojiDelete)
- [__EmojiUpdate](#EmojiUpdate)
- [__GuildScheduledEventCreate](#GuildScheduledEventCreate)
- [__GuildScheduledEventDelete](#GuildScheduledEventDelete)
- [__GuildScheduledEventUpdate](#GuildScheduledEventUpdate)
- [__GuildUpdate](#GuildUpdate)
- [__HomeSettingsCreate](#HomeSettingsCreate)
- [__HomeSettingsUpdate](#HomeSettingsUpdate)
- [__IntegrationCreate](#IntegrationCreate)
- [__IntegrationDelete](#IntegrationDelete)
- [__IntegrationUpdate](#IntegrationUpdate)
- [__InviteCreate](#InviteCreate)
- [__InviteDelete](#InviteDelete)
- [__InviteUpdate](#InviteUpdate)
- [__MemberBanAdd](#MemberBanAdd)
- [__MemberBanRemove](#MemberBanRemove)
- [__MemberDisconnect](#MemberDisconnect)
- [__MemberKick](#MemberKick)
- [__MemberMove](#MemberMove)
- [__MemberPrune](#MemberPrune)
- [__MemberRoleUpdate](#MemberRoleUpdate)
- [__MemberUpdate](#MemberUpdate)
- [__MessageBulkDelete](#MessageBulkDelete)
- [__MessageDelete](#MessageDelete)
- [__MessagePin](#MessagePin)
- [__MessageUnpin](#MessageUnpin)
- [__OnboardingCreate](#OnboardingCreate)
- [__OnboardingPromptCreate](#OnboardingPromptCreate)
- [__OnboardingPromptDelete](#OnboardingPromptDelete)
- [__OnboardingPromptUpdate](#OnboardingPromptUpdate)
- [__OnboardingUpdate](#OnboardingUpdate)
- [__RoleCreate](#RoleCreate)
- [__RoleDelete](#RoleDelete)
- [__RoleUpdate](#RoleUpdate)
- [__SoundboardSoundCreate](#SoundboardSoundCreate)
- [__SoundboardSoundDelete](#SoundboardSoundDelete)
- [__SoundboardSoundUpdate](#SoundboardSoundUpdate)
- [__StageInstanceCreate](#StageInstanceCreate)
- [__StageInstanceDelete](#StageInstanceDelete)
- [__StageInstanceUpdate](#StageInstanceUpdate)
- [__StickerCreate](#StickerCreate)
- [__StickerDelete](#StickerDelete)
- [__StickerUpdate](#StickerUpdate)
- [__ThreadCreate](#ThreadCreate)
- [__ThreadDelete](#ThreadDelete)
- [__ThreadUpdate](#ThreadUpdate)
- [__WebhookCreate](#WebhookCreate)
- [__WebhookDelete](#WebhookDelete)
- [__WebhookUpdate](#WebhookUpdate)

## Enumeration Members [__](#Enumeration Members)

### [__](#ApplicationCommandPermissionUpdate) __ApplicationCommandPermissionUpdate

__ApplicationCommandPermissionUpdate: 121

### [__](#AutoModerationBlockMessage) __AutoModerationBlockMessage

__AutoModerationBlockMessage: 143

### [__](#AutoModerationFlagToChannel) __AutoModerationFlagToChannel

__AutoModerationFlagToChannel: 144

### [__](#AutoModerationQuarantineUser) __AutoModerationQuarantineUser

__AutoModerationQuarantineUser: 146

### [__](#AutoModerationRuleCreate) __AutoModerationRuleCreate

__AutoModerationRuleCreate: 140

### [__](#AutoModerationRuleDelete) __AutoModerationRuleDelete

__AutoModerationRuleDelete: 142

### [__](#AutoModerationRuleUpdate) __AutoModerationRuleUpdate

__AutoModerationRuleUpdate: 141

### [__](#AutoModerationUserCommunicationDisabled) __AutoModerationUserCommunicationDisabled

__AutoModerationUserCommunicationDisabled: 145

### [__](#BotAdd) __BotAdd

__BotAdd: 28

### [__](#ChannelCreate) __ChannelCreate

__ChannelCreate: 10

### [__](#ChannelDelete) __ChannelDelete

__ChannelDelete: 12

### [__](#ChannelOverwriteCreate) __ChannelOverwriteCreate

__ChannelOverwriteCreate: 13

### [__](#ChannelOverwriteDelete) __ChannelOverwriteDelete

__ChannelOverwriteDelete: 15

### [__](#ChannelOverwriteUpdate) __ChannelOverwriteUpdate

__ChannelOverwriteUpdate: 14

### [__](#ChannelUpdate) __ChannelUpdate

__ChannelUpdate: 11

### [__](#CreatorMonetizationRequestCreated) __CreatorMonetizationRequestCreated

__CreatorMonetizationRequestCreated: 150

### [__](#CreatorMonetizationTermsAccepted) __CreatorMonetizationTermsAccepted

__CreatorMonetizationTermsAccepted: 151

### [__](#EmojiCreate) __EmojiCreate

__EmojiCreate: 60

### [__](#EmojiDelete) __EmojiDelete

__EmojiDelete: 62

### [__](#EmojiUpdate) __EmojiUpdate

__EmojiUpdate: 61

### [__](#GuildScheduledEventCreate) __GuildScheduledEventCreate

__GuildScheduledEventCreate: 100

### [__](#GuildScheduledEventDelete) __GuildScheduledEventDelete

__GuildScheduledEventDelete: 102

### [__](#GuildScheduledEventUpdate) __GuildScheduledEventUpdate

__GuildScheduledEventUpdate: 101

### [__](#GuildUpdate) __GuildUpdate

__GuildUpdate: 1

### [__](#HomeSettingsCreate) __HomeSettingsCreate

__HomeSettingsCreate: 190

### [__](#HomeSettingsUpdate) __HomeSettingsUpdate

__HomeSettingsUpdate: 191

### [__](#IntegrationCreate) __IntegrationCreate

__IntegrationCreate: 80

### [__](#IntegrationDelete) __IntegrationDelete

__IntegrationDelete: 82

### [__](#IntegrationUpdate) __IntegrationUpdate

__IntegrationUpdate: 81

### [__](#InviteCreate) __InviteCreate

__InviteCreate: 40

### [__](#InviteDelete) __InviteDelete

__InviteDelete: 42

### [__](#InviteUpdate) __InviteUpdate

__InviteUpdate: 41

### [__](#MemberBanAdd) __MemberBanAdd

__MemberBanAdd: 22

### [__](#MemberBanRemove) __MemberBanRemove

__MemberBanRemove: 23

### [__](#MemberDisconnect) __MemberDisconnect

__MemberDisconnect: 27

### [__](#MemberKick) __MemberKick

__MemberKick: 20

### [__](#MemberMove) __MemberMove

__MemberMove: 26

### [__](#MemberPrune) __MemberPrune

__MemberPrune: 21

### [__](#MemberRoleUpdate) __MemberRoleUpdate

__MemberRoleUpdate: 25

### [__](#MemberUpdate) __MemberUpdate

__MemberUpdate: 24

### [__](#MessageBulkDelete) __MessageBulkDelete

__MessageBulkDelete: 73

### [__](#MessageDelete) __MessageDelete

__MessageDelete: 72

### [__](#MessagePin) __MessagePin

__MessagePin: 74

### [__](#MessageUnpin) __MessageUnpin

__MessageUnpin: 75

### [__](#OnboardingCreate) __OnboardingCreate

__OnboardingCreate: 166

### [__](#OnboardingPromptCreate) __OnboardingPromptCreate

__OnboardingPromptCreate: 163

### [__](#OnboardingPromptDelete) __OnboardingPromptDelete

__OnboardingPromptDelete: 165

### [__](#OnboardingPromptUpdate) __OnboardingPromptUpdate

__OnboardingPromptUpdate: 164

### [__](#OnboardingUpdate) __OnboardingUpdate

__OnboardingUpdate: 167

### [__](#RoleCreate) __RoleCreate

__RoleCreate: 30

### [__](#RoleDelete) __RoleDelete

__RoleDelete: 32

### [__](#RoleUpdate) __RoleUpdate

__RoleUpdate: 31

### [__](#SoundboardSoundCreate) __SoundboardSoundCreate

__SoundboardSoundCreate: 130

### [__](#SoundboardSoundDelete) __SoundboardSoundDelete

__SoundboardSoundDelete: 132

### [__](#SoundboardSoundUpdate) __SoundboardSoundUpdate

__SoundboardSoundUpdate: 131

### [__](#StageInstanceCreate) __StageInstanceCreate

__StageInstanceCreate: 83

### [__](#StageInstanceDelete) __StageInstanceDelete

__StageInstanceDelete: 85

### [__](#StageInstanceUpdate) __StageInstanceUpdate

__StageInstanceUpdate: 84

### [__](#StickerCreate) __StickerCreate

__StickerCreate: 90

### [__](#StickerDelete) __StickerDelete

__StickerDelete: 92

### [__](#StickerUpdate) __StickerUpdate

__StickerUpdate: 91

### [__](#ThreadCreate) __ThreadCreate

__ThreadCreate: 110

### [__](#ThreadDelete) __ThreadDelete

__ThreadDelete: 112

### [__](#ThreadUpdate) __ThreadUpdate

__ThreadUpdate: 111

### [__](#WebhookCreate) __WebhookCreate

__WebhookCreate: 50

### [__](#WebhookDelete) __WebhookDelete

__WebhookDelete: 52

### [__](#WebhookUpdate) __WebhookUpdate

__WebhookUpdate: 51

Previous AttachmentFlags Next AuditLogOptionsType

**Page Options**

Hide Inherited

- [__ApplicationCommandPermissionUpdate](#ApplicationCommandPermissionUpdate)
- [__AutoModerationBlockMessage](#AutoModerationBlockMessage)
- [__AutoModerationFlagToChannel](#AutoModerationFlagToChannel)
- [__AutoModerationQuarantineUser](#AutoModerationQuarantineUser)
- [__AutoModerationRuleCreate](#AutoModerationRuleCreate)
- [__AutoModerationRuleDelete](#AutoModerationRuleDelete)
- [__AutoModerationRuleUpdate](#AutoModerationRuleUpdate)
- [__AutoModerationUserCommunicationDisabled](#AutoModerationUserCommunicationDisabled)
- [__BotAdd](#BotAdd)
- [__ChannelCreate](#ChannelCreate)
- [__ChannelDelete](#ChannelDelete)
- [__ChannelOverwriteCreate](#ChannelOverwriteCreate)
- [__ChannelOverwriteDelete](#ChannelOverwriteDelete)
- [__ChannelOverwriteUpdate](#ChannelOverwriteUpdate)
- [__ChannelUpdate](#ChannelUpdate)
- [__CreatorMonetizationRequestCreated](#CreatorMonetizationRequestCreated)
- [__CreatorMonetizationTermsAccepted](#CreatorMonetizationTermsAccepted)
- [__EmojiCreate](#EmojiCreate)
- [__EmojiDelete](#EmojiDelete)
- [__EmojiUpdate](#EmojiUpdate)
- [__GuildScheduledEventCreate](#GuildScheduledEventCreate)
- [__GuildScheduledEventDelete](#GuildScheduledEventDelete)
- [__GuildScheduledEventUpdate](#GuildScheduledEventUpdate)
- [__GuildUpdate](#GuildUpdate)
- [__HomeSettingsCreate](#HomeSettingsCreate)
- [__HomeSettingsUpdate](#HomeSettingsUpdate)
- [__IntegrationCreate](#IntegrationCreate)
- [__IntegrationDelete](#IntegrationDelete)
- [__IntegrationUpdate](#IntegrationUpdate)
- [__InviteCreate](#InviteCreate)
- [__InviteDelete](#InviteDelete)
- [__InviteUpdate](#InviteUpdate)
- [__MemberBanAdd](#MemberBanAdd)
- [__MemberBanRemove](#MemberBanRemove)
- [__MemberDisconnect](#MemberDisconnect)
- [__MemberKick](#MemberKick)
- [__MemberMove](#MemberMove)
- [__MemberPrune](#MemberPrune)
- [__MemberRoleUpdate](#MemberRoleUpdate)
- [__MemberUpdate](#MemberUpdate)
- [__MessageBulkDelete](#MessageBulkDelete)
- [__MessageDelete](#MessageDelete)
- [__MessagePin](#MessagePin)
- [__MessageUnpin](#MessageUnpin)
- [__OnboardingCreate](#OnboardingCreate)
- [__OnboardingPromptCreate](#OnboardingPromptCreate)
- [__OnboardingPromptDelete](#OnboardingPromptDelete)
- [__OnboardingPromptUpdate](#OnboardingPromptUpdate)
- [__OnboardingUpdate](#OnboardingUpdate)
- [__RoleCreate](#RoleCreate)
- [__RoleDelete](#RoleDelete)
- [__RoleUpdate](#RoleUpdate)
- [__SoundboardSoundCreate](#SoundboardSoundCreate)
- [__SoundboardSoundDelete](#SoundboardSoundDelete)
- [__SoundboardSoundUpdate](#SoundboardSoundUpdate)
- [__StageInstanceCreate](#StageInstanceCreate)
- [__StageInstanceDelete](#StageInstanceDelete)
- [__StageInstanceUpdate](#StageInstanceUpdate)
- [__StickerCreate](#StickerCreate)
- [__StickerDelete](#StickerDelete)
- [__StickerUpdate](#StickerUpdate)
- [__ThreadCreate](#ThreadCreate)
- [__ThreadDelete](#ThreadDelete)
- [__ThreadUpdate](#ThreadUpdate)
- [__WebhookCreate](#WebhookCreate)
- [__WebhookDelete](#WebhookDelete)
- [__WebhookUpdate](#WebhookUpdate)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.