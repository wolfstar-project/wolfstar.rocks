RPCCloseEventCodes | API | discord-api-types documentation

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
- RPCCloseEventCodes

Version: Next

On this page

# RPCCloseEventCodes

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/opcodes-and-status-codes#rpc-rpc-close-event-codes

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__CloseAbnormal](#CloseAbnormal)
- [__CloseNormal](#CloseNormal)
- [__CloseUnsupported](#CloseUnsupported)
- [__InvalidClientId](#InvalidClientId)
- [__InvalidEncoding](#InvalidEncoding)
- [__InvalidOrigin](#InvalidOrigin)
- [__InvalidVersion](#InvalidVersion)
- [__RateLimited](#RateLimited)
- [__TokenRevoked](#TokenRevoked)

## Enumeration Members [__](#Enumeration Members)

### [__](#CloseAbnormal) __CloseAbnormal

__CloseAbnormal: 1006

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#CloseNormal) __CloseNormal

__CloseNormal: 1000

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#CloseUnsupported) __CloseUnsupported

__CloseUnsupported: 1003

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#InvalidClientId) __InvalidClientId

__InvalidClientId: 4000

You connected to the RPC server with an invalid client ID.

### [__](#InvalidEncoding) __InvalidEncoding

__InvalidEncoding: 4005

The encoding specified in the connection string was not valid.

### [__](#InvalidOrigin) __InvalidOrigin

__InvalidOrigin: 4001

You connected to the RPC server with an invalid origin.

### [__](#InvalidVersion) __InvalidVersion

__InvalidVersion: 4004

The RPC Server version specified in the connection string was not valid.

### [__](#RateLimited) __RateLimited

__RateLimited: 4002

You are being rate limited.

### [__](#TokenRevoked) __TokenRevoked

__TokenRevoked: 4003

The OAuth2 token associated with a connection was revoked, get a new one!

Previous RoleFlags Next RPCCommands

**Page Options**

Hide Inherited

- [__CloseAbnormal](#CloseAbnormal)
- [__CloseNormal](#CloseNormal)
- [__CloseUnsupported](#CloseUnsupported)
- [__InvalidClientId](#InvalidClientId)
- [__InvalidEncoding](#InvalidEncoding)
- [__InvalidOrigin](#InvalidOrigin)
- [__InvalidVersion](#InvalidVersion)
- [__RateLimited](#RateLimited)
- [__TokenRevoked](#TokenRevoked)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.