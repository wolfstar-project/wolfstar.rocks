OAuth2Scopes | API | discord-api-types documentation

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
- OAuth2Scopes

Version: Next

On this page

# OAuth2Scopes

Types extracted from https://discord.com/developers/docs/topics/oauth2

## Index [__](#Index)

### Enumeration Members

- [__ActivitiesRead](#ActivitiesRead)
- [__ActivitiesWrite](#ActivitiesWrite)
- [__ApplicationCommandsPermissionsUpdate](#ApplicationCommandsPermissionsUpdate)
- [__ApplicationsBuildsRead](#ApplicationsBuildsRead)
- [__ApplicationsBuildsUpload](#ApplicationsBuildsUpload)
- [__ApplicationsCommands](#ApplicationsCommands)
- [__ApplicationsCommandsUpdate](#ApplicationsCommandsUpdate)
- [__ApplicationsEntitlements](#ApplicationsEntitlements)
- [__ApplicationsStoreUpdate](#ApplicationsStoreUpdate)
- [__Bot](#Bot)
- [__Connections](#Connections)
- [__DMChannelsRead](#DMChannelsRead)
- [__Email](#Email)
- [__GroupDMJoins](#GroupDMJoins)
- [__Guilds](#Guilds)
- [__GuildsJoin](#GuildsJoin)
- [__GuildsMembersRead](#GuildsMembersRead)
- [__Identify](#Identify)
- [__MessagesRead](#MessagesRead)
- [__RelationshipsRead](#RelationshipsRead)
- [__RoleConnectionsWrite](#RoleConnectionsWrite)
- [__RPC](#RPC)
- [__RPCActivitiesWrite](#RPCActivitiesWrite)
- [__RPCNotificationsRead](#RPCNotificationsRead)
- [__RPCVoiceRead](#RPCVoiceRead)
- [__RPCVoiceWrite](#RPCVoiceWrite)
- [__Voice](#Voice)
- [__WebhookIncoming](#WebhookIncoming)

## Enumeration Members [__](#Enumeration Members)

### [__](#ActivitiesRead) __ActivitiesRead

__ActivitiesRead: activities.read

Allows your app to fetch data from a user's "Now Playing/Recently Played" list - requires Discord approval

### [__](#ActivitiesWrite) __ActivitiesWrite

__ActivitiesWrite: activities.write

Allows your app to update a user's activity - requires Discord approval (NOT REQUIRED FOR GAMESDK ACTIVITY MANAGER)

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/game-sdk/activities

</dd></dl>

### [__](#ApplicationCommandsPermissionsUpdate) __ApplicationCommandsPermissionsUpdate

__ApplicationCommandsPermissionsUpdate: applications.commands.permissions.update

Allows your app to update permissions for its commands using a Bearer token - client credentials grant only

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/interactions/application-commands

</dd></dl>

### [__](#ApplicationsBuildsRead) __ApplicationsBuildsRead

__ApplicationsBuildsRead: applications.builds.read

Allows your app to read build data for a user's applications

### [__](#ApplicationsBuildsUpload) __ApplicationsBuildsUpload

__ApplicationsBuildsUpload: applications.builds.upload

Allows your app to upload/update builds for a user's applications - requires Discord approval

### [__](#ApplicationsCommands) __ApplicationsCommands

__ApplicationsCommands: applications.commands

Allows your app to use Application Commands in a guild

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/interactions/application-commands

</dd></dl>

### [__](#ApplicationsCommandsUpdate) __ApplicationsCommandsUpdate

__ApplicationsCommandsUpdate: applications.commands.update

Allows your app to update its Application Commands via this bearer token - client credentials grant only

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/interactions/application-commands

</dd></dl>

### [__](#ApplicationsEntitlements) __ApplicationsEntitlements

__ApplicationsEntitlements: applications.entitlements

Allows your app to read entitlements for a user's applications

### [__](#ApplicationsStoreUpdate) __ApplicationsStoreUpdate

__ApplicationsStoreUpdate: applications.store.update

Allows your app to read and update store data (SKUs, store listings, achievements, etc.) for a user's applications

### [__](#Bot) __Bot

__Bot: bot

For oauth2 bots, this puts the bot in the user's selected guild by default

### [__](#Connections) __Connections

__Connections: connections

Allows `/users/@me/connections` to return linked third-party accounts

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/resources/user#get-user-connections

</dd></dl>

### [__](#DMChannelsRead) __DMChannelsRead

__DMChannelsRead: dm_channels.read

Allows your app to see information about the user's DMs and group DMs - requires Discord approval

### [__](#Email) __Email

__Email: email

Enables `/users/@me` to return an `email`

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/resources/user#get-current-user

</dd></dl>

### [__](#GroupDMJoins) __GroupDMJoins

__GroupDMJoins: gdm.join

Allows your app to join users to a group dm

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/resources/channel#group-dm-add-recipient

</dd></dl>

### [__](#Guilds) __Guilds

__Guilds: guilds

Allows `/users/@me/guilds` to return basic information about all of a user's guilds

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/resources/user#get-current-user-guilds

</dd></dl>

### [__](#GuildsJoin) __GuildsJoin

__GuildsJoin: guilds.join

Allows `/guilds/[guild.id]/members/[user.id]` to be used for joining users to a guild

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/resources/guild#add-guild-member

</dd></dl>

### [__](#GuildsMembersRead) __GuildsMembersRead

__GuildsMembersRead: guilds.members.read

Allows /users/@me/guilds/{guild.id}/member to return a user's member information in a guild

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/resources/user#get-current-user-guild-member

</dd></dl>

### [__](#Identify) __Identify

__Identify: identify

Allows `/users/@me` without `email`

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/resources/user#get-current-user

</dd></dl>

### [__](#MessagesRead) __MessagesRead

__MessagesRead: messages.read

For local rpc server api access, this allows you to read messages from all client channels (otherwise restricted to channels/guilds your app creates)

### [__](#RelationshipsRead) __RelationshipsRead

__RelationshipsRead: relationships.read

Allows your app to know a user's friends and implicit relationships - requires Discord approval

### [__](#RoleConnectionsWrite) __RoleConnectionsWrite

__RoleConnectionsWrite: role_connections.write

Allows your app to update a user's connection and metadata for the app

### [__](#RPC) __RPC

__RPC: rpc

For local rpc server access, this allows you to control a user's local Discord client - requires Discord approval

### [__](#RPCActivitiesWrite) __RPCActivitiesWrite

__RPCActivitiesWrite: rpc.activities.write

For local rpc server access, this allows you to update a user's activity - requires Discord approval

### [__](#RPCNotificationsRead) __RPCNotificationsRead

__RPCNotificationsRead: rpc.notifications.read

For local rpc server api access, this allows you to receive notifications pushed out to the user - requires Discord approval

### [__](#RPCVoiceRead) __RPCVoiceRead

__RPCVoiceRead: rpc.voice.read

For local rpc server access, this allows you to read a user's voice settings and listen for voice events - requires Discord approval

### [__](#RPCVoiceWrite) __RPCVoiceWrite

__RPCVoiceWrite: rpc.voice.write

For local rpc server access, this allows you to update a user's voice settings - requires Discord approval

### [__](#Voice) __Voice

__Voice: voice

Allows your app to connect to voice on user's behalf and see all the voice members - requires Discord approval

### [__](#WebhookIncoming) __WebhookIncoming

__WebhookIncoming: webhook.incoming

This generates a webhook that is returned in the oauth token response for authorization code grants

Previous NameplatePalette Next OverwriteType

**Page Options**

Hide Inherited

- [__ActivitiesRead](#ActivitiesRead)
- [__ActivitiesWrite](#ActivitiesWrite)
- [__ApplicationCommandsPermissionsUpdate](#ApplicationCommandsPermissionsUpdate)
- [__ApplicationsBuildsRead](#ApplicationsBuildsRead)
- [__ApplicationsBuildsUpload](#ApplicationsBuildsUpload)
- [__ApplicationsCommands](#ApplicationsCommands)
- [__ApplicationsCommandsUpdate](#ApplicationsCommandsUpdate)
- [__ApplicationsEntitlements](#ApplicationsEntitlements)
- [__ApplicationsStoreUpdate](#ApplicationsStoreUpdate)
- [__Bot](#Bot)
- [__Connections](#Connections)
- [__DMChannelsRead](#DMChannelsRead)
- [__Email](#Email)
- [__GroupDMJoins](#GroupDMJoins)
- [__Guilds](#Guilds)
- [__GuildsJoin](#GuildsJoin)
- [__GuildsMembersRead](#GuildsMembersRead)
- [__Identify](#Identify)
- [__MessagesRead](#MessagesRead)
- [__RelationshipsRead](#RelationshipsRead)
- [__RoleConnectionsWrite](#RoleConnectionsWrite)
- [__RPC](#RPC)
- [__RPCActivitiesWrite](#RPCActivitiesWrite)
- [__RPCNotificationsRead](#RPCNotificationsRead)
- [__RPCVoiceRead](#RPCVoiceRead)
- [__RPCVoiceWrite](#RPCVoiceWrite)
- [__Voice](#Voice)
- [__WebhookIncoming](#WebhookIncoming)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.