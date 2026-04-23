ChannelType | API | discord-api-types documentation

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
- ChannelType

Version: Next

On this page

# ChannelType

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/resources/channel#channel-object-channel-types

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__AnnouncementThread](#AnnouncementThread)
- [__DM](#DM)
- [__GroupDM](#GroupDM)
- [__GuildAnnouncement](#GuildAnnouncement)
- [__GuildCategory](#GuildCategory)
- [__GuildDirectory](#GuildDirectory)
- [__GuildForum](#GuildForum)
- [__GuildMedia](#GuildMedia)
- [__GuildNews](#GuildNews)
- [__GuildNewsThread](#GuildNewsThread)
- [__GuildPrivateThread](#GuildPrivateThread)
- [__GuildPublicThread](#GuildPublicThread)
- [__GuildStageVoice](#GuildStageVoice)
- [__GuildText](#GuildText)
- [__GuildVoice](#GuildVoice)
- [__PrivateThread](#PrivateThread)
- [__PublicThread](#PublicThread)

## Enumeration Members [__](#Enumeration Members)

### [__](#AnnouncementThread) __AnnouncementThread

__AnnouncementThread: 10

A temporary sub-channel within a Guild Announcement channel

### [__](#DM) __DM

__DM: 1

A direct message between users

### [__](#GroupDM) __GroupDM

__GroupDM: 3

A direct message between multiple users

### [__](#GuildAnnouncement) __GuildAnnouncement

__GuildAnnouncement: 5

A channel that users can follow and crosspost into their own guild

<dl><dt>**@see**</dt>
<dd>

https://support.discord.com/hc/articles/360032008192

</dd></dl>

### [__](#GuildCategory) __GuildCategory

__GuildCategory: 4

An organizational category that contains up to 50 channels

<dl><dt>**@see**</dt>
<dd>

https://support.discord.com/hc/articles/115001580171

</dd></dl>

### [__](#GuildDirectory) __GuildDirectory

__GuildDirectory: 14

The channel in a Student Hub containing the listed servers

<dl><dt>**@see**</dt>
<dd>

https://support.discord.com/hc/articles/4406046651927

</dd></dl>

### [__](#GuildForum) __GuildForum

__GuildForum: 15

A channel that can only contain threads

### [__](#GuildMedia) __GuildMedia

__GuildMedia: 16

A channel like forum channels but contains media for server subscriptions

<dl><dt>**@see**</dt>
<dd>

https://creator-support.discord.com/hc/articles/14346342766743

</dd></dl>

### [__](#GuildNews) __GuildNews

__GuildNews: 5

A channel that users can follow and crosspost into their own guild

<dl><dt>**@deprecated**</dt>
<dd>

This is the old name for ChannelType.GuildAnnouncement

</dd><dt>**@see**</dt>
<dd>

https://support.discord.com/hc/articles/360032008192

</dd></dl>

### [__](#GuildNewsThread) __GuildNewsThread

__GuildNewsThread: 10

A temporary sub-channel within a Guild Announcement channel

<dl><dt>**@deprecated**</dt>
<dd>

This is the old name for ChannelType.AnnouncementThread

</dd></dl>

### [__](#GuildPrivateThread) __GuildPrivateThread

__GuildPrivateThread: 12

A temporary sub-channel within a Guild Text channel that is only viewable by those invited and those with the Manage Threads permission

<dl><dt>**@deprecated**</dt>
<dd>

This is the old name for ChannelType.PrivateThread

</dd></dl>

### [__](#GuildPublicThread) __GuildPublicThread

__GuildPublicThread: 11

A temporary sub-channel within a Guild Text channel

<dl><dt>**@deprecated**</dt>
<dd>

This is the old name for ChannelType.PublicThread

</dd></dl>

### [__](#GuildStageVoice) __GuildStageVoice

__GuildStageVoice: 13

A voice channel for hosting events with an audience

<dl><dt>**@see**</dt>
<dd>

https://support.discord.com/hc/articles/1500005513722

</dd></dl>

### [__](#GuildText) __GuildText

__GuildText: 0

A text channel within a guild

### [__](#GuildVoice) __GuildVoice

__GuildVoice: 2

A voice channel within a guild

### [__](#PrivateThread) __PrivateThread

__PrivateThread: 12

A temporary sub-channel within a Guild Text channel that is only viewable by those invited and those with the Manage Threads permission

### [__](#PublicThread) __PublicThread

__PublicThread: 11

A temporary sub-channel within a Guild Text or Guild Forum channel

Previous ChannelFlags Next ComponentType

**Page Options**

Hide Inherited

- [__AnnouncementThread](#AnnouncementThread)
- [__DM](#DM)
- [__GroupDM](#GroupDM)
- [__GuildAnnouncement](#GuildAnnouncement)
- [__GuildCategory](#GuildCategory)
- [__GuildDirectory](#GuildDirectory)
- [__GuildForum](#GuildForum)
- [__GuildMedia](#GuildMedia)
- [__GuildNews](#GuildNews)
- [__GuildNewsThread](#GuildNewsThread)
- [__GuildPrivateThread](#GuildPrivateThread)
- [__GuildPublicThread](#GuildPublicThread)
- [__GuildStageVoice](#GuildStageVoice)
- [__GuildText](#GuildText)
- [__GuildVoice](#GuildVoice)
- [__PrivateThread](#PrivateThread)
- [__PublicThread](#PublicThread)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.