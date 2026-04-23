RPCCommands | API | discord-api-types documentation

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
- RPCCommands

Version: Next

On this page

# RPCCommands

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/rpc#commands-and-events-rpc-commands

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__AcceptActivityInvite](#AcceptActivityInvite)
- [__ActivityInviteUser](#ActivityInviteUser)
- [__Authenticate](#Authenticate)
- [__Authorize](#Authorize)
- [__BraintreePopupBridgeCallback](#BraintreePopupBridgeCallback)
- [__BrowserHandoff](#BrowserHandoff)
- [__CloseActivityJoinRequest](#CloseActivityJoinRequest)
- [__ConnectionsCallback](#ConnectionsCallback)
- [__CreateChannelInvite](#CreateChannelInvite)
- [__DeepLink](#DeepLink)
- [__Dispatch](#Dispatch)
- [__GetApplicationTicket](#GetApplicationTicket)
- [__GetChannel](#GetChannel)
- [__GetChannels](#GetChannels)
- [__GetEntitlements](#GetEntitlements)
- [__GetEntitlementTicket](#GetEntitlementTicket)
- [__GetGuild](#GetGuild)
- [__GetGuilds](#GetGuilds)
- [__GetImage](#GetImage)
- [__GetNetworkingConfig](#GetNetworkingConfig)
- [__GetRelationships](#GetRelationships)
- [__GetSelectedVoiceChannel](#GetSelectedVoiceChannel)
- [__GetSkus](#GetSkus)
- [__GetUser](#GetUser)
- [__GetVoiceSettings](#GetVoiceSettings)
- [__GiftCodeBrowser](#GiftCodeBrowser)
- [__GuildTemplateBrowser](#GuildTemplateBrowser)
- [__InviteBrowser](#InviteBrowser)
- [__NetworkingCreateToken](#NetworkingCreateToken)
- [__NetworkingPeerMetrics](#NetworkingPeerMetrics)
- [__NetworkingSystemMetrics](#NetworkingSystemMetrics)
- [__OpenOverlayActivityInvite](#OpenOverlayActivityInvite)
- [__OpenOverlayGuildInvite](#OpenOverlayGuildInvite)
- [__OpenOverlayVoiceSettings](#OpenOverlayVoiceSettings)
- [__Overlay](#Overlay)
- [__SelectTextChannel](#SelectTextChannel)
- [__SelectVoiceChannel](#SelectVoiceChannel)
- [__SendActivityJoinInvite](#SendActivityJoinInvite)
- [__SetActivity](#SetActivity)
- [__SetCertifiedDevices](#SetCertifiedDevices)
- [__SetOverlayLocked](#SetOverlayLocked)
- [__SetUserVoiceSettings](#SetUserVoiceSettings)
- [__SetUserVoiceSettings2](#SetUserVoiceSettings2)
- [__SetVoiceSettings](#SetVoiceSettings)
- [__SetVoiceSettings2](#SetVoiceSettings2)
- [__StartPurchase](#StartPurchase)
- [__Subscribe](#Subscribe)
- [__Unsubscribe](#Unsubscribe)
- [__ValidateApplication](#ValidateApplication)

## Enumeration Members [__](#Enumeration Members)

### [__](#AcceptActivityInvite) __AcceptActivityInvite

__AcceptActivityInvite: ACCEPT_ACTIVITY_INVITE

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#ActivityInviteUser) __ActivityInviteUser

__ActivityInviteUser: ACTIVITY_INVITE_USER

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#Authenticate) __Authenticate

__Authenticate: AUTHENTICATE

Used to authenticate an existing client with your app

### [__](#Authorize) __Authorize

__Authorize: AUTHORIZE

Used to authorize a new client with your app

### [__](#BraintreePopupBridgeCallback) __BraintreePopupBridgeCallback

__BraintreePopupBridgeCallback: BRAINTREE_POPUP_BRIDGE_CALLBACK

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#BrowserHandoff) __BrowserHandoff

__BrowserHandoff: BROWSER_HANDOFF

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#CloseActivityJoinRequest) __CloseActivityJoinRequest

__CloseActivityJoinRequest: CLOSE_ACTIVITY_JOIN_REQUEST

used to reject a Rich Presence Ask to Join request

<dl><dt>**@unstable**</dt>
<dd>

the documented similarly named command `CLOSE_ACTIVITY_REQUEST` does not exist, but `CLOSE_ACTIVITY_JOIN_REQUEST` does

</dd></dl>

### [__](#ConnectionsCallback) __ConnectionsCallback

__ConnectionsCallback: CONNECTIONS_CALLBACK

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#CreateChannelInvite) __CreateChannelInvite

__CreateChannelInvite: CREATE_CHANNEL_INVITE

### [__](#DeepLink) __DeepLink

__DeepLink: DEEP_LINK

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#Dispatch) __Dispatch

__Dispatch: DISPATCH

Event dispatch

### [__](#GetApplicationTicket) __GetApplicationTicket

__GetApplicationTicket: GET_APPLICATION_TICKET

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#GetChannel) __GetChannel

__GetChannel: GET_CHANNEL

Used to retrieve channel information from the client

### [__](#GetChannels) __GetChannels

__GetChannels: GET_CHANNELS

Used to retrieve a list of channels for a guild from the client

### [__](#GetEntitlements) __GetEntitlements

__GetEntitlements: GET_ENTITLEMENTS

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#GetEntitlementTicket) __GetEntitlementTicket

__GetEntitlementTicket: GET_ENTITLEMENT_TICKET

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#GetGuild) __GetGuild

__GetGuild: GET_GUILD

Used to retrieve guild information from the client

### [__](#GetGuilds) __GetGuilds

__GetGuilds: GET_GUILDS

Used to retrieve a list of guilds from the client

### [__](#GetImage) __GetImage

__GetImage: GET_IMAGE

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#GetNetworkingConfig) __GetNetworkingConfig

__GetNetworkingConfig: GET_NETWORKING_CONFIG

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#GetRelationships) __GetRelationships

__GetRelationships: GET_RELATIONSHIPS

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#GetSelectedVoiceChannel) __GetSelectedVoiceChannel

__GetSelectedVoiceChannel: GET_SELECTED_VOICE_CHANNEL

Used to get the current voice channel the client is in

### [__](#GetSkus) __GetSkus

__GetSkus: GET_SKUS

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#GetUser) __GetUser

__GetUser: GET_USER

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#GetVoiceSettings) __GetVoiceSettings

__GetVoiceSettings: GET_VOICE_SETTINGS

Used to retrieve the client's voice settings

### [__](#GiftCodeBrowser) __GiftCodeBrowser

__GiftCodeBrowser: GIFT_CODE_BROWSER

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#GuildTemplateBrowser) __GuildTemplateBrowser

__GuildTemplateBrowser: GUILD_TEMPLATE_BROWSER

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#InviteBrowser) __InviteBrowser

__InviteBrowser: INVITE_BROWSER

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#NetworkingCreateToken) __NetworkingCreateToken

__NetworkingCreateToken: NETWORKING_CREATE_TOKEN

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#NetworkingPeerMetrics) __NetworkingPeerMetrics

__NetworkingPeerMetrics: NETWORKING_PEER_METRICS

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#NetworkingSystemMetrics) __NetworkingSystemMetrics

__NetworkingSystemMetrics: NETWORKING_SYSTEM_METRICS

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#OpenOverlayActivityInvite) __OpenOverlayActivityInvite

__OpenOverlayActivityInvite: OPEN_OVERLAY_ACTIVITY_INVITE

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#OpenOverlayGuildInvite) __OpenOverlayGuildInvite

__OpenOverlayGuildInvite: OPEN_OVERLAY_GUILD_INVITE

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#OpenOverlayVoiceSettings) __OpenOverlayVoiceSettings

__OpenOverlayVoiceSettings: OPEN_OVERLAY_VOICE_SETTINGS

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#Overlay) __Overlay

__Overlay: OVERLAY

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#SelectTextChannel) __SelectTextChannel

__SelectTextChannel: SELECT_TEXT_CHANNEL

Used to join or leave a text channel, group dm, or dm

### [__](#SelectVoiceChannel) __SelectVoiceChannel

__SelectVoiceChannel: SELECT_VOICE_CHANNEL

Used to join or leave a voice channel, group dm, or dm

### [__](#SendActivityJoinInvite) __SendActivityJoinInvite

__SendActivityJoinInvite: SEND_ACTIVITY_JOIN_INVITE

Used to consent to a Rich Presence Ask to Join request

### [__](#SetActivity) __SetActivity

__SetActivity: SET_ACTIVITY

Used to update a user's Rich Presence

### [__](#SetCertifiedDevices) __SetCertifiedDevices

__SetCertifiedDevices: SET_CERTIFIED_DEVICES

Used to send info about certified hardware devices

### [__](#SetOverlayLocked) __SetOverlayLocked

__SetOverlayLocked: SET_OVERLAY_LOCKED

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#SetUserVoiceSettings) __SetUserVoiceSettings

__SetUserVoiceSettings: SET_USER_VOICE_SETTINGS

Used to change voice settings of users in voice channels

### [__](#SetUserVoiceSettings2) __SetUserVoiceSettings2

__SetUserVoiceSettings2: SET_USER_VOICE_SETTINGS_2

### [__](#SetVoiceSettings) __SetVoiceSettings

__SetVoiceSettings: SET_VOICE_SETTINGS

Used to set the client's voice settings

### [__](#SetVoiceSettings2) __SetVoiceSettings2

__SetVoiceSettings2: SET_VOICE_SETTINGS_2

### [__](#StartPurchase) __StartPurchase

__StartPurchase: START_PURCHASE

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

### [__](#Subscribe) __Subscribe

__Subscribe: SUBSCRIBE

Used to subscribe to an RPC event

### [__](#Unsubscribe) __Unsubscribe

__Unsubscribe: UNSUBSCRIBE

Used to unsubscribe from an RPC event

### [__](#ValidateApplication) __ValidateApplication

__ValidateApplication: VALIDATE_APPLICATION

<dl><dt>**@unstable**</dt>
<dd></dd>
</dl>

Previous RPCCloseEventCodes Next RPCDeviceType

**Page Options**

Hide Inherited

- [__AcceptActivityInvite](#AcceptActivityInvite)
- [__ActivityInviteUser](#ActivityInviteUser)
- [__Authenticate](#Authenticate)
- [__Authorize](#Authorize)
- [__BraintreePopupBridgeCallback](#BraintreePopupBridgeCallback)
- [__BrowserHandoff](#BrowserHandoff)
- [__CloseActivityJoinRequest](#CloseActivityJoinRequest)
- [__ConnectionsCallback](#ConnectionsCallback)
- [__CreateChannelInvite](#CreateChannelInvite)
- [__DeepLink](#DeepLink)
- [__Dispatch](#Dispatch)
- [__GetApplicationTicket](#GetApplicationTicket)
- [__GetChannel](#GetChannel)
- [__GetChannels](#GetChannels)
- [__GetEntitlements](#GetEntitlements)
- [__GetEntitlementTicket](#GetEntitlementTicket)
- [__GetGuild](#GetGuild)
- [__GetGuilds](#GetGuilds)
- [__GetImage](#GetImage)
- [__GetNetworkingConfig](#GetNetworkingConfig)
- [__GetRelationships](#GetRelationships)
- [__GetSelectedVoiceChannel](#GetSelectedVoiceChannel)
- [__GetSkus](#GetSkus)
- [__GetUser](#GetUser)
- [__GetVoiceSettings](#GetVoiceSettings)
- [__GiftCodeBrowser](#GiftCodeBrowser)
- [__GuildTemplateBrowser](#GuildTemplateBrowser)
- [__InviteBrowser](#InviteBrowser)
- [__NetworkingCreateToken](#NetworkingCreateToken)
- [__NetworkingPeerMetrics](#NetworkingPeerMetrics)
- [__NetworkingSystemMetrics](#NetworkingSystemMetrics)
- [__OpenOverlayActivityInvite](#OpenOverlayActivityInvite)
- [__OpenOverlayGuildInvite](#OpenOverlayGuildInvite)
- [__OpenOverlayVoiceSettings](#OpenOverlayVoiceSettings)
- [__Overlay](#Overlay)
- [__SelectTextChannel](#SelectTextChannel)
- [__SelectVoiceChannel](#SelectVoiceChannel)
- [__SendActivityJoinInvite](#SendActivityJoinInvite)
- [__SetActivity](#SetActivity)
- [__SetCertifiedDevices](#SetCertifiedDevices)
- [__SetOverlayLocked](#SetOverlayLocked)
- [__SetUserVoiceSettings](#SetUserVoiceSettings)
- [__SetUserVoiceSettings2](#SetUserVoiceSettings2)
- [__SetVoiceSettings](#SetVoiceSettings)
- [__SetVoiceSettings2](#SetVoiceSettings2)
- [__StartPurchase](#StartPurchase)
- [__Subscribe](#Subscribe)
- [__Unsubscribe](#Unsubscribe)
- [__ValidateApplication](#ValidateApplication)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.