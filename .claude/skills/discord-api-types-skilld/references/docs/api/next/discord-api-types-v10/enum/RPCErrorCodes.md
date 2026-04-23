RPCErrorCodes | API | discord-api-types documentation

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
- RPCErrorCodes

Version: Next

On this page

# RPCErrorCodes

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/opcodes-and-status-codes#rpc-rpc-error-codes

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__CaptureShortcutAlreadyListening](#CaptureShortcutAlreadyListening)
- [__GetGuildTimedOut](#GetGuildTimedOut)
- [__InvalidActivityJoinRequest](#InvalidActivityJoinRequest)
- [__InvalidActivitySecret](#InvalidActivitySecret)
- [__InvalidChannel](#InvalidChannel)
- [__InvalidClientId](#InvalidClientId)
- [__InvalidCommand](#InvalidCommand)
- [__InvalidEntitlement](#InvalidEntitlement)
- [__InvalidEvent](#InvalidEvent)
- [__InvalidGiftCode](#InvalidGiftCode)
- [__InvalidGuild](#InvalidGuild)
- [__InvalidInvite](#InvalidInvite)
- [__InvalidOrigin](#InvalidOrigin)
- [__InvalidPayload](#InvalidPayload)
- [__InvalidPermissions](#InvalidPermissions)
- [__InvalidToken](#InvalidToken)
- [__InvalidUser](#InvalidUser)
- [__NoEligibleActivity](#NoEligibleActivity)
- [__OAuth2Error](#OAuth2Error)
- [__PurchaseCanceled](#PurchaseCanceled)
- [__PurchaseError](#PurchaseError)
- [__RateLimited](#RateLimited)
- [__SelectChannelTimedOut](#SelectChannelTimedOut)
- [__SelectVoiceForceRequired](#SelectVoiceForceRequired)
- [__ServiceUnavailable](#ServiceUnavailable)
- [__TransactionAborted](#TransactionAborted)
- [__UnauthorizedForAchievement](#UnauthorizedForAchievement)
- [__UnknownError](#UnknownError)

## Enumeration Members [__](#Enumeration Members)

### [__](#CaptureShortcutAlreadyListening) __CaptureShortcutAlreadyListening

__CaptureShortcutAlreadyListening: 5004

You tried to capture more than one shortcut key at once.

### [__](#GetGuildTimedOut) __GetGuildTimedOut

__GetGuildTimedOut: 5002

An asynchronous `GET_GUILD` command timed out.

### [__](#InvalidActivityJoinRequest) __InvalidActivityJoinRequest

__InvalidActivityJoinRequest: 4012

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#InvalidActivitySecret) __InvalidActivitySecret

__InvalidActivitySecret: 5005

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#InvalidChannel) __InvalidChannel

__InvalidChannel: 4005

Invalid channel ID specified.

### [__](#InvalidClientId) __InvalidClientId

__InvalidClientId: 4007

An invalid OAuth2 application ID was used to authorize or authenticate with.

### [__](#InvalidCommand) __InvalidCommand

__InvalidCommand: 4002

Invalid command name specified.

### [__](#InvalidEntitlement) __InvalidEntitlement

__InvalidEntitlement: 4013

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#InvalidEvent) __InvalidEvent

__InvalidEvent: 4004

Invalid event name specified.

### [__](#InvalidGiftCode) __InvalidGiftCode

__InvalidGiftCode: 4014

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#InvalidGuild) __InvalidGuild

__InvalidGuild: 4003

Invalid guild ID specified.

### [__](#InvalidInvite) __InvalidInvite

__InvalidInvite: 4011

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#InvalidOrigin) __InvalidOrigin

__InvalidOrigin: 4008

An invalid OAuth2 application origin was used to authorize or authenticate with.

### [__](#InvalidPayload) __InvalidPayload

__InvalidPayload: 4000

You sent an invalid payload.

### [__](#InvalidPermissions) __InvalidPermissions

__InvalidPermissions: 4006

You lack permissions to access the given resource.

### [__](#InvalidToken) __InvalidToken

__InvalidToken: 4009

An invalid OAuth2 token was used to authorize or authenticate with.

### [__](#InvalidUser) __InvalidUser

__InvalidUser: 4010

The specified user ID was invalid.

### [__](#NoEligibleActivity) __NoEligibleActivity

__NoEligibleActivity: 5006

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#OAuth2Error) __OAuth2Error

__OAuth2Error: 5000

A standard OAuth2 error occurred; check the data object for the OAuth2 error details.

### [__](#PurchaseCanceled) __PurchaseCanceled

__PurchaseCanceled: 5007

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#PurchaseError) __PurchaseError

__PurchaseError: 5008

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#RateLimited) __RateLimited

__RateLimited: 5010

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#SelectChannelTimedOut) __SelectChannelTimedOut

__SelectChannelTimedOut: 5001

An asynchronous `SELECT_TEXT_CHANNEL`/`SELECT_VOICE_CHANNEL` command timed out.

### [__](#SelectVoiceForceRequired) __SelectVoiceForceRequired

__SelectVoiceForceRequired: 5003

You tried to join a user to a voice channel but the user was already in one.

### [__](#ServiceUnavailable) __ServiceUnavailable

__ServiceUnavailable: 1001

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#TransactionAborted) __TransactionAborted

__TransactionAborted: 1002

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#UnauthorizedForAchievement) __UnauthorizedForAchievement

__UnauthorizedForAchievement: 5009

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#UnknownError) __UnknownError

__UnknownError: 1000

An unknown error occurred.

Previous RPCDeviceType Next RPCEvents

**Page Options**

Hide Inherited

- [__CaptureShortcutAlreadyListening](#CaptureShortcutAlreadyListening)
- [__GetGuildTimedOut](#GetGuildTimedOut)
- [__InvalidActivityJoinRequest](#InvalidActivityJoinRequest)
- [__InvalidActivitySecret](#InvalidActivitySecret)
- [__InvalidChannel](#InvalidChannel)
- [__InvalidClientId](#InvalidClientId)
- [__InvalidCommand](#InvalidCommand)
- [__InvalidEntitlement](#InvalidEntitlement)
- [__InvalidEvent](#InvalidEvent)
- [__InvalidGiftCode](#InvalidGiftCode)
- [__InvalidGuild](#InvalidGuild)
- [__InvalidInvite](#InvalidInvite)
- [__InvalidOrigin](#InvalidOrigin)
- [__InvalidPayload](#InvalidPayload)
- [__InvalidPermissions](#InvalidPermissions)
- [__InvalidToken](#InvalidToken)
- [__InvalidUser](#InvalidUser)
- [__NoEligibleActivity](#NoEligibleActivity)
- [__OAuth2Error](#OAuth2Error)
- [__PurchaseCanceled](#PurchaseCanceled)
- [__PurchaseError](#PurchaseError)
- [__RateLimited](#RateLimited)
- [__SelectChannelTimedOut](#SelectChannelTimedOut)
- [__SelectVoiceForceRequired](#SelectVoiceForceRequired)
- [__ServiceUnavailable](#ServiceUnavailable)
- [__TransactionAborted](#TransactionAborted)
- [__UnauthorizedForAchievement](#UnauthorizedForAchievement)
- [__UnknownError](#UnknownError)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.