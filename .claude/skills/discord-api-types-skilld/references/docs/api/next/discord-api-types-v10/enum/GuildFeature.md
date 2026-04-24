GuildFeature | API | discord-api-types documentation

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
- GuildFeature

Version: Next

On this page

# GuildFeature

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/resources/guild#guild-object-guild-features

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__AnimatedBanner](#AnimatedBanner)
- [__AnimatedIcon](#AnimatedIcon)
- [__ApplicationCommandPermissionsV2](#ApplicationCommandPermissionsV2)
- [__AutoModeration](#AutoModeration)
- [__Banner](#Banner)
- [__Community](#Community)
- [__CreatorMonetizableProvisional](#CreatorMonetizableProvisional)
- [__CreatorStorePage](#CreatorStorePage)
- [__DeveloperSupportServer](#DeveloperSupportServer)
- [__Discoverable](#Discoverable)
- [__EnhancedRoleColors](#EnhancedRoleColors)
- [__Featurable](#Featurable)
- [__GuestsEnabled](#GuestsEnabled)
- [__GuildTags](#GuildTags)
- [__HasDirectoryEntry](#HasDirectoryEntry)
- [__Hub](#Hub)
- [__InvitesDisabled](#InvitesDisabled)
- [__InviteSplash](#InviteSplash)
- [__LinkedToHub](#LinkedToHub)
- [__MemberVerificationGateEnabled](#MemberVerificationGateEnabled)
- [__MonetizationEnabled](#MonetizationEnabled)
- [__MoreSoundboard](#MoreSoundboard)
- [__MoreStickers](#MoreStickers)
- [__News](#News)
- [__Partnered](#Partnered)
- [__PinPermissionMigrationComplete](#PinPermissionMigrationComplete)
- [__PreviewEnabled](#PreviewEnabled)
- [__PrivateThreads](#PrivateThreads)
- [__RaidAlertsDisabled](#RaidAlertsDisabled)
- [__RelayEnabled](#RelayEnabled)
- [__RoleIcons](#RoleIcons)
- [__RoleSubscriptionsAvailableForPurchase](#RoleSubscriptionsAvailableForPurchase)
- [__RoleSubscriptionsEnabled](#RoleSubscriptionsEnabled)
- [__Soundboard](#Soundboard)
- [__TicketedEventsEnabled](#TicketedEventsEnabled)
- [__VanityURL](#VanityURL)
- [__Verified](#Verified)
- [__VIPRegions](#VIPRegions)
- [__WelcomeScreenEnabled](#WelcomeScreenEnabled)

## Enumeration Members [__](#Enumeration Members)

### [__](#AnimatedBanner) __AnimatedBanner

__AnimatedBanner: ANIMATED_BANNER

Guild has access to set an animated guild banner image

### [__](#AnimatedIcon) __AnimatedIcon

__AnimatedIcon: ANIMATED_ICON

Guild has access to set an animated guild icon

### [__](#ApplicationCommandPermissionsV2) __ApplicationCommandPermissionsV2

__ApplicationCommandPermissionsV2: APPLICATION_COMMAND_PERMISSIONS_V2

Guild is using the old permissions configuration behavior

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/change-log#upcoming-application-command-permission-changes

</dd></dl>

### [__](#AutoModeration) __AutoModeration

__AutoModeration: AUTO_MODERATION

Guild has set up auto moderation rules

### [__](#Banner) __Banner

__Banner: BANNER

Guild has access to set a guild banner image

### [__](#Community) __Community

__Community: COMMUNITY

Guild can enable welcome screen, Membership Screening and discovery, and receives community updates

### [__](#CreatorMonetizableProvisional) __CreatorMonetizableProvisional

__CreatorMonetizableProvisional: CREATOR_MONETIZABLE_PROVISIONAL

Guild has enabled monetization

### [__](#CreatorStorePage) __CreatorStorePage

__CreatorStorePage: CREATOR_STORE_PAGE

Guild has enabled the role subscription promo page

### [__](#DeveloperSupportServer) __DeveloperSupportServer

__DeveloperSupportServer: DEVELOPER_SUPPORT_SERVER

Guild has been set as a support server on the App Directory

### [__](#Discoverable) __Discoverable

__Discoverable: DISCOVERABLE

Guild is able to be discovered in the directory

### [__](#EnhancedRoleColors) __EnhancedRoleColors

__EnhancedRoleColors: ENHANCED_ROLE_COLORS

Guild is able to set gradient colors to roles

### [__](#Featurable) __Featurable

__Featurable: FEATURABLE

Guild is able to be featured in the directory

### [__](#GuestsEnabled) __GuestsEnabled

__GuestsEnabled: GUESTS_ENABLED

Guild has access to guest invites

### [__](#GuildTags) __GuildTags

__GuildTags: GUILD_TAGS

Guild has access to set guild tags

### [__](#HasDirectoryEntry) __HasDirectoryEntry

__HasDirectoryEntry: HAS_DIRECTORY_ENTRY

Guild is listed in a directory channel

### [__](#Hub) __Hub

__Hub: HUB

Guild is a Student Hub

<dl><dt>**@see**</dt>
<dd>

https://support.discord.com/hc/articles/4406046651927

</dd><dt>**@unstable**</dt>
<dd>

This feature is currently not documented by Discord, but has known value

</dd></dl>

### [__](#InvitesDisabled) __InvitesDisabled

__InvitesDisabled: INVITES_DISABLED

Guild has disabled invite usage, preventing users from joining

### [__](#InviteSplash) __InviteSplash

__InviteSplash: INVITE_SPLASH

Guild has access to set an invite splash background

### [__](#LinkedToHub) __LinkedToHub

__LinkedToHub: LINKED_TO_HUB

Guild is in a Student Hub

<dl><dt>**@see**</dt>
<dd>

https://support.discord.com/hc/articles/4406046651927

</dd><dt>**@unstable**</dt>
<dd>

This feature is currently not documented by Discord, but has known value

</dd></dl>

### [__](#MemberVerificationGateEnabled) __MemberVerificationGateEnabled

__MemberVerificationGateEnabled: MEMBER_VERIFICATION_GATE_ENABLED

Guild has enabled Membership Screening

### [__](#MonetizationEnabled) __MonetizationEnabled

__MonetizationEnabled: MONETIZATION_ENABLED

Guild has enabled monetization

<dl><dt>**@unstable**</dt>
<dd>

This feature is no longer documented by Discord

</dd></dl>

### [__](#MoreSoundboard) __MoreSoundboard

__MoreSoundboard: MORE_SOUNDBOARD

Guild has increased custom soundboard sound slots

### [__](#MoreStickers) __MoreStickers

__MoreStickers: MORE_STICKERS

Guild has increased custom sticker slots

### [__](#News) __News

__News: NEWS

Guild has access to create news channels

### [__](#Partnered) __Partnered

__Partnered: PARTNERED

Guild is partnered

### [__](#PinPermissionMigrationComplete) __PinPermissionMigrationComplete

__PinPermissionMigrationComplete: PIN_PERMISSION_MIGRATION_COMPLETE

Guild has migrated to the new pin messages permission

<dl><dt>**@unstable**</dt>
<dd>

This feature is currently not documented by Discord, but has known value

</dd></dl>

### [__](#PreviewEnabled) __PreviewEnabled

__PreviewEnabled: PREVIEW_ENABLED

Guild can be previewed before joining via Membership Screening or the directory

### [__](#PrivateThreads) __PrivateThreads

__PrivateThreads: PRIVATE_THREADS

Guild has access to create private threads

### [__](#RaidAlertsDisabled) __RaidAlertsDisabled

__RaidAlertsDisabled: RAID_ALERTS_DISABLED

Guild has disabled alerts for join raids in the configured safety alerts channel

### [__](#RelayEnabled) __RelayEnabled

__RelayEnabled: RELAY_ENABLED

### [__](#RoleIcons) __RoleIcons

__RoleIcons: ROLE_ICONS

Guild is able to set role icons

### [__](#RoleSubscriptionsAvailableForPurchase) __RoleSubscriptionsAvailableForPurchase

__RoleSubscriptionsAvailableForPurchase: ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE

Guild has role subscriptions that can be purchased

### [__](#RoleSubscriptionsEnabled) __RoleSubscriptionsEnabled

__RoleSubscriptionsEnabled: ROLE_SUBSCRIPTIONS_ENABLED

Guild has enabled role subscriptions

### [__](#Soundboard) __Soundboard

__Soundboard: SOUNDBOARD

Guild has created soundboard sounds

### [__](#TicketedEventsEnabled) __TicketedEventsEnabled

__TicketedEventsEnabled: TICKETED_EVENTS_ENABLED

Guild has enabled ticketed events

### [__](#VanityURL) __VanityURL

__VanityURL: VANITY_URL

Guild has access to set a vanity URL

### [__](#Verified) __Verified

__Verified: VERIFIED

Guild is verified

### [__](#VIPRegions) __VIPRegions

__VIPRegions: VIP_REGIONS

Guild has access to set 384kbps bitrate in voice (previously VIP voice servers)

### [__](#WelcomeScreenEnabled) __WelcomeScreenEnabled

__WelcomeScreenEnabled: WELCOME_SCREEN_ENABLED

Guild has enabled the welcome screen

Previous GuildExplicitContentFilter Next GuildHubType

**Page Options**

Hide Inherited

- [__AnimatedBanner](#AnimatedBanner)
- [__AnimatedIcon](#AnimatedIcon)
- [__ApplicationCommandPermissionsV2](#ApplicationCommandPermissionsV2)
- [__AutoModeration](#AutoModeration)
- [__Banner](#Banner)
- [__Community](#Community)
- [__CreatorMonetizableProvisional](#CreatorMonetizableProvisional)
- [__CreatorStorePage](#CreatorStorePage)
- [__DeveloperSupportServer](#DeveloperSupportServer)
- [__Discoverable](#Discoverable)
- [__EnhancedRoleColors](#EnhancedRoleColors)
- [__Featurable](#Featurable)
- [__GuestsEnabled](#GuestsEnabled)
- [__GuildTags](#GuildTags)
- [__HasDirectoryEntry](#HasDirectoryEntry)
- [__Hub](#Hub)
- [__InvitesDisabled](#InvitesDisabled)
- [__InviteSplash](#InviteSplash)
- [__LinkedToHub](#LinkedToHub)
- [__MemberVerificationGateEnabled](#MemberVerificationGateEnabled)
- [__MonetizationEnabled](#MonetizationEnabled)
- [__MoreSoundboard](#MoreSoundboard)
- [__MoreStickers](#MoreStickers)
- [__News](#News)
- [__Partnered](#Partnered)
- [__PinPermissionMigrationComplete](#PinPermissionMigrationComplete)
- [__PreviewEnabled](#PreviewEnabled)
- [__PrivateThreads](#PrivateThreads)
- [__RaidAlertsDisabled](#RaidAlertsDisabled)
- [__RelayEnabled](#RelayEnabled)
- [__RoleIcons](#RoleIcons)
- [__RoleSubscriptionsAvailableForPurchase](#RoleSubscriptionsAvailableForPurchase)
- [__RoleSubscriptionsEnabled](#RoleSubscriptionsEnabled)
- [__Soundboard](#Soundboard)
- [__TicketedEventsEnabled](#TicketedEventsEnabled)
- [__VanityURL](#VanityURL)
- [__Verified](#Verified)
- [__VIPRegions](#VIPRegions)
- [__WelcomeScreenEnabled](#WelcomeScreenEnabled)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.