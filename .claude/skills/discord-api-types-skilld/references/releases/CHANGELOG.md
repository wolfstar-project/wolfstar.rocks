## 0.38.41 (2026-03-05)


### Features

* application command option allowed channel type (#1548) (5ea94a6)
* **voice:** add close code `4017` (#1538) (1353b59)



## 0.38.40 (2026-02-19)


### Bug Fixes

* export missing properties and use interfaces on GatewayActivityAssets (#1519) (8fd4024)


### Features

* mark guild member role counts endpoint as stable (#1462) (2a9dfd4)



## 0.38.39 (2026-02-13)


### Bug Fixes

* **APIModalSubmitRadioGroupComponent:** nullable value (#1518) (6f6b780)



## 0.38.38 (2026-01-29)


### Features

* radio groups and checkbox in modal (#1495) (18fa946)



## 0.38.37 (2025-12-11)



## 0.38.36 (2025-12-01)



## 0.38.35 (2025-11-27)


### Bug Fixes

* Add missing s/S support to `StyledTimestamp` (#1439) (a8c28ab)



## 0.38.34 (2025-11-17)


### Features

* add `isModalSubmitInteraction()` type guard (#1428) (f883770)



## 0.38.33 (2025-11-09)


### Features

* **PermissionFlagsBits:** add `BypassSlowmode` (#1427) (2736687)



## 0.38.32 (2025-11-03)


### Features

* **globals:** Support new s/S timestamp styles (#1418) (bf4291b)



## 0.38.31 (2025-10-23)


### Bug Fixes

* **APIModalInteractionResponseCallbackComponent:** remove `APIFileUploadComponent` (#1406) (e37f802)
* missing name and size property on APIFileComponent (#1404) (7d6a934)
* tsdoc unstable tag is block not modifier (#1405) (6e5563e)


### Features

* **APIAuditLogChange:** add some missing channel change types (#1409) (ea2b922)
* **GuildFeature:** add `PinPermissionMigrationComplete` (#1407) (c5c0312)
* publishing with OIDC (62e5b4a)
* **Webhooks:** add entitlement update and delete events (#1408) (be8b372)



## 0.38.30 (2025-10-13)


### Features

* Add support for file upload components (#1372) (51b2d4e)



## 0.38.29 (2025-10-06)


### Bug Fixes

* edit self result (#1393) (9665e02)



## 0.38.28 (2025-10-04)


### Bug Fixes

* move `applied_tags` back to thread channels (#1391) (00c4694)



## 0.38.27 (2025-10-04)


### Bug Fixes

* `[@unstable](https://github.com/unstable)` screening (#1389) (95b186d)
* add `RESTPutAPIGuildIncidentActionsResult` (#1388) (0c6d424)
* Narrow thread-related properties for channels (#1377) (18cf4a5)
* **RESTPutAPIGuildIncidentActionsJSONBody:** add `null` (#1387) (6295858)



## 0.38.26 (2025-09-18)


### Bug Fixes

* add guild_id back to GatewayVoiceStateUpdateDispatchData (#1346) (e52ac85)



## 0.38.25 (2025-09-15)


### Features

* add RateLimited gateway event (#1334) (14963d6)



## 0.38.24 (2025-09-10)


### Features

* **RESTPatchAPICurrentGuildMemberJSONBody:** Add `banner`, `avatar`, and `bio` (#1356) (35a4084)
* **RESTPostAPIChannelThreadsResult:** narrow response (#1364) (8eb66a1)
* Update invite types (#1365) (35867c1)



## 0.38.23 (2025-09-05)


### Bug Fixes

* add missing text display in modal submission (#1362) (464a9c8)
* **RESTPatchAPIWebhookWithTokenMessageJSONBody:** add `flags` (#1354) (af3907b)


### Features

* add 400001 (#1352) (ae09e2b)
* More label components and text display in modals (#1351) (fa05a75)



## 0.38.22 (2025-08-29)


### Features

* Support select in modals (#1321) (3659c59)



## 0.38.21 (2025-08-21)


### Features

* guest invites (#1290) (1a37ae3)
* **PermissionFlagsBits:** add `PinMessages` (#1340) (b05df17)



## 0.38.20 (2025-08-14)



## 0.38.19 (2025-08-12)


### Features

* **GatewayActivity:** add url & status display type fields (#1326) (5f9c1e1)



## 0.38.18 (2025-07-31)


### Bug Fixes

* Deprecate API related to guild ownership (#1316) (4afd0c1)


### Features

* **GuildFeature:** add `GUILD_TAGS` (#1315) (03f02a5)



## 0.38.17 (2025-07-24)


### Features

* **auditLog:** add `AUTO_MODERATION_QUARANTINE_USER` (#1310) (a72e454)
* **GuildMemberFlags:** add `AutoModQuarantinedGuildTag` (#1309) (a41e646)



## 0.38.16 (2025-07-13)


### Bug Fixes

* **APIApplicationCommandChannelOption:** exclude directory channels (#1300) (574e5c1)



## 0.38.15 (2025-07-03)


### Bug Fixes

* **CDNRoutes:** correct `guildTagBadge` route (#1291) (1fee633)


### Features

* user guild tags (#1287) (3245f7d)



## 0.38.14 (2025-06-30)


### Features

* role gradient colors (#1281) (7fbb3e3)
* support new pinned messages routes (#1254) (71c6d26)
* **voice:** add close codes 4021 and 4022 (#1283) (6b05db5)



## 0.38.13 (2025-06-23)


### Features

* **APIUser:** add `collectibles` (#1274) (77cb327)



## 0.38.12 (2025-06-16)


### Features

* **APIApplication:** add `approximate_user_authorization_count` (#1272) (91d8516)
* **APIUnfurledMediaItem:** add `attachment_id` (#1273) (b2da18c)



## 0.38.11 (2025-06-04)


### Bug Fixes

* **voice:** add `max_dave_protocol_version` to identify (#1260) (83d34ef)
* **voice:** add clients connect and client disconnect recieve payload (#1261) (121fb47)
* **voice:** fix remaining payload typos (#1262) (d71276c)


### Features

* voice v8 payloads & MLS voice opcodes (#1257) (ebf313c)



## 0.38.10 (2025-06-02)



## 0.38.9 (2025-05-31)


### Bug Fixes

* discriminated thread channel types (#1247) (72b8c83)
* optional `client_id` and `client_secret` in access token data (#1248) (b360b2e)


### Features

* deauthorised webhook events (#1253) (9daac44)



## 0.38.8 (2025-05-15)



## 0.38.7 (2025-05-15)



## 0.38.6 (2025-05-15)


### Bug Fixes

* wrong exports reported by ae (#1239) (a5d949e)


### Features

* experimental new docs gen (#1240) (3af2ae2)



## 0.38.5 (2025-05-12)


### Bug Fixes

* imports (#1237) (c64362a)


### Features

* `APIWebhookSourceChannel` (#1235) (ca20659)
* `APIWebhookSourceGuild` (#1236) (21420c3)
* invite channel (#1232) (0479caf)



## 0.38.4 (2025-05-08)


### Features

* Specific typings for application emojis (#1228) (4b0a3af)



## 0.38.3 (2025-05-05)



## 0.38.2 (2025-05-01)



# 0.38.1 (2025-04-22)


### Features

* components v2 (9f769c3)
* **CDNQuery:** add ImageSize type (527ac2f)

### BREAKING CHANGES

* Certain Component alias types have been renamed (for example APIMessageActionRowComponent is now APIComponentInMessageActionRow



## 0.37.120 (2025-04-10)


### Bug Fixes

* Ensure autocomplete option values resolve to string for numerical types (#1198) (cfac62e)


### Features

* **APIBaseInteraction:** add `attachment_size_limit` (#1214) (5b6f0d4)
* **RPC:** types (#1200) (ac4d59d)
* **webhook:** add `with_components` query param (#1208) (def67db)



## 0.37.119 (2025-02-02)


### Bug Fixes

* route escaping round three (d5cdb37)



## 0.37.118 (2025-01-27)


### Features

* **APIGuild:** add `incidents_data` (#822) (8fe9c07)
* **MessageFlags:** add HasSnapshot (#1141) (d446be5)



## 0.37.117 (2025-01-20)



## 0.37.116 (2025-01-16)


### Features

* **VoiceCloseCodes:** add `BadRequest` (#1191) (d9b6935)



## 0.37.115 (2025-01-02)



## 0.37.114 (2024-12-23)


### Bug Fixes

* reset pattern index after testing an input (ee53ef7), closes /github.com/discordjs/discord-api-types/issues/1181#issuecomment-2558971449



## 0.37.113 (2024-12-22)


### Bug Fixes

* skip encoded url parts from re-encoding (fc4e7be)


### Features

* **ConnectionService:** `Bluesky` and `Mastodon` (#1174) (61592d6)
* **payloads:** add entrypoint command payloads (#1166) (bcb13de)



## 0.37.112 (2024-12-19)


### Features

* **APISubscription:** add `renewal_sku_ids` (#1172) (fb7c6b8)



## 0.37.111 (2024-12-09)



## 0.37.110 (2024-11-28)


### Features

* add Chrunchyroll (#1159) (92b1ce2)



## 0.37.109 (2024-11-26)


### Features

* New entitlement endpoint behaviour (#1145) (079fcd6)



## 0.37.108 (2024-11-25)


### Features

* webhook events (#1128) (ced86e4)



## 0.37.107 (2024-11-21)


### Bug Fixes

* **security:** escape path parameters (1ba3472)



## 0.37.106 (2024-11-21)



## 0.37.105 (2024-11-14)


### Features

* **_interactions:** Support partial guild objects (#1142) (408165e)
* full message object on message update (#1140) (3512262)
* guild member banners (#1057) (3f489f1)



## 0.37.104 (2024-11-07)


### Bug Fixes

* add missing soundboard types (#1134) (88d8bed)
* **isInteractionButton:** handle `ButtonStyle.Premium` (#1135) (736479c)



## 0.37.103 (2024-10-21)


### Features

* audit log change key for boost bar (#1120) (0fe6059)
* soundboard audit log events (#1122) (76fc8f0)



## 0.37.102 (2024-10-14)


### Features

* recurrence rule change key on audit logs (#1112) (4746e8d)
* soundboard (#1113) (8d46830)



## 0.37.101 (2024-09-23)


### Bug Fixes

* **rest/oauth2:** correct string literal types containing bot scope (#1101) (2ae2324)


### Features

* add `VoiceChannelEffectSend` event (#739) (240226f)
* missing subscription dispatch types (#1105) (2b653a0)



## 0.37.100 (2024-09-05)


### Bug Fixes

* **APIMessageSnapshot:** mark `guild_id` as deprecated (#1084) (3f3fe21)
* **GatewayGuildDeleteDispatchData:** make `unavailable` optional (#1092) (258fb72)
* replace deprecated `RESTAPIPollCreate` with `RESTAPIPoll` (#1091) (d3b5187)


### Features

* add subscriptions (#1078) (8f78190)
* **APIMessageSnapshotFields:** add more fields (#1085) (3de4ca8)
* **ConnectionService:** add Amazon Music connection (#1074) (011d439)
* entry point commands and interaction callback response (#1077) (b4b70d8)
* **FormattingPatterns:** `GuildNavigation` and `LinkedRole` (#1089) (0938b66)
* **MessageType:** `PurchaseNotification` and `PollResult` (#1040) (344274b)
* **RESTJSONErrorCodes:** add `40018`, `40019`, and `40094` (#1056) (93e649a)
* **RESTPatchAPIWebhookWithTokenMessageJSONBody:** `poll` (#1067) (f770290)



## 0.37.99 (2024-09-02)


### Features

* **GuildMemberFlags:** `IsGuest` and `DmSettingsUpsellAcknowledged` (#1079) (2803e8d)
* remove unstable from stable fields (#1086) (4b64f84)



## 0.37.98 (2024-08-26)


### Features

* **RESTAPIAttachment:** add more properties (#1073) (f019f0f)



## 0.37.97 (2024-08-22)



## 0.37.96 (2024-08-20)


### Bug Fixes

* nullable `recurrence_rule` on patch (#1063) (19d2aeb)
* nullable fields for scheduled event editing (#1064) (f67043b)



## 0.37.95 (2024-08-19)


### Bug Fixes

* interface name (#1059) (147e459)


### Features

* recurring scheduled events (#1058) (fbfbc6b)
* **RESTJSONErrorCodes:** `UnknownStickerPack` (#1055) (906dd8e)
* **Routes:** voice state endpoint (#1046) (1b1a865)



## 0.37.94 (2024-08-15)


### Features

* add Get Sticker Pack endpoint (#1053) (822956f)
* **APIApplication:** `approximate_user_install_count` (#1052) (d504763)
* **RESTOAuth2:** add RESTPostOAuth2TokenRevocationQuery (#1050) (6ead98b)
* **Routes:** get method on role endpoint (#1051) (ea1a6c3)



## 0.37.93 (2024-07-22)


### Bug Fixes

* **CDNRoutes:** inconsistency in route and wrong JSDoc (#1033) (eb7b3d9)


### Features

* add support for message forwarding (#971) (2c1ff0e)
* application emojis (#1036) (5f22a6b)
* **ConnectionService:** add `Roblox` (#1032) (4f66b4d)
* **RESTAPIPartialCurrentUserGuild:** add `banner` (#1028) (da9496f)



## 0.37.92 (2024-07-04)


### Bug Fixes

* **RESTAPIPollCreate:** optional properties (#1022) (c05998d)



## 0.37.91 (2024-06-27)


### Features

* **APIAttachment:** add `title` (#1015) (897fd90)



## 0.37.90 (2024-06-18)


### Features

* add premium buttons (#1010) (088dbe0)



## 0.37.89 (2024-06-13)


### Features

* Add use external apps permission (#999) (d63bea7)



## 0.37.88 (2024-06-10)


### Bug Fixes

* **APIGuildMember:** make user required and omit in messages (#998) (98544fa)


### Features

* **AuditLogEvent:** home settings events (#1000) (c6a72a5)
* **MessageType:** add incident related types (#1004) (173f9ed)
* **RouteBases:** Add media URL (#1001) (fdc0408)



## 0.37.87 (2024-06-03)


### Bug Fixes

* Correct types for `APIAuditLogChangeKey$Add` and `APIAuditLogChangeKey$Remove` (#955) (f859a96)


### Features

* **AutoModeration:** add blocking words in member profile (#740) (5097460)



## 0.37.86 (2024-05-27)



## 0.37.85 (2024-05-23)


### Features

* add gateway events payload for super reactions (#878) (16a6a46)
* add type query param for get reactions endpoint (#879) (ddb2bde)
* **APIMessage:** add `call` (#983) (79d9875)



## 0.37.84 (2024-05-16)


### Features

* **RESTJSONErrorCodes:** add error code 40333 (#854) (65eebd9)
* support avatar decorations (#834) (7650ce4)
* user-installable apps (#921) (c457b8d)



## 0.37.83 (2024-04-27)


### Features

* **APIAuditLogChange:** add missing keys (#964) (4e37de7)
* one time premium app purchases (#966) (c9f2c5b)



## 0.37.82 (2024-04-25)


### Features

* **APIInvite:** add `type` (#858) (c4ee790)
* **AuditLogEvent:** onboarding events (#795) (fddb225)
* **ConnectionService:** add `domain` (#818) (3ae6d72)



## 0.37.81 (2024-04-22)


### Bug Fixes

* **Polls:** correct APIPollAnswer properties (#962) (308d7d4)



## 0.37.80 (2024-04-22)


### Features

* add support for polls (#925) (a36449a)



## 0.37.79 (2024-04-04)


### Features

* **ConnectionService:** add bungie connection (#907) (22b5f47)



## 0.37.78 (2024-04-01)


### Features

* bot banners (#906) (495148d)
* **Guild:** add `RESTPostAPIGuildBulkBan` result and json body (#910) (61ce329)
* **RESTJSONErrorCodes:** Add `500_000` (#908) (4db44b5)
* **Routes:** Add `guildBulkBan()` route (#909) (7dcad58)



## 0.37.77 (2024-03-28)


### Features

* **APIAuditLogChange:** add `APIAuditLogChangeKeySystemChannelFlags` (#933) (47c9ad0)



## 0.37.76 (2024-03-21)



## 0.37.75 (2024-03-18)



## 0.37.74 (2024-03-14)



## 0.37.73 (2024-03-07)



## 0.37.72 (2024-03-07)



## 0.37.71 (2024-02-26)

### Features

- add initial support for super reactions (#744) (150dc46)

## 0.37.70 (2024-02-15)

### Features

- **RESTPostAPIChannelMessageJSONBody:** add enforce_nonce (#874) (9564941)

## 0.37.69 (2024-02-08)

### Features

- **Locale:** add `SpanishLATAM` (#859) (0cfe05d)

## 0.37.68 (2024-02-05)

### Bug Fixes

- **CDNRoutes:** fix store page wrong extension (#867) (6f541d5)
- **CDNRoutes:** make format optional and default to png (#869) (55efcca)

## 0.37.67 (2023-12-28)

### Bug Fixes

- **GatewayThreadDispatch:** properly type thread create/update/delete dispatches (#861) (819d852)

## 0.37.66 (2023-12-07)

### Features

- **RESTPostAPIWebhookWithTokenJSONBody:** add `applied_tags` (#855) (b4226bb)

## 0.37.65 (2023-11-23)

### Bug Fixes

- **TextChannelType:** Remove forum and media channels (#849) (9574881)

## 0.37.64 (2023-11-20)

### Features

- **PermissionFlagsBits:** split up expressions and events perms (#790) (ca05ee5)

## 0.37.63 (2023-11-09)

### Bug Fixes

- **RESTPutAPIGuildOnboardingJSONBody:** optional keys and flattened emoji (#839) (a8efb19)

## 0.37.62 (2023-10-30)

### Features

- **RESTJSONErrorCodes:** add `40074` and `50057` (#844) (28ed370)

## 0.37.61 (2023-10-23)

### Features

- premium app subscriptions (#833) (ba08061)

## 0.37.60 (2023-10-05)

### Features

- Application patch and new properties (#810) (17f42e0)

## 0.37.59 (2023-10-02)

### Features

- **RESTPostAPIStageInstanceJSONBody:** add `guild_scheduled_event_id` (#656) (ecef5b4)

## 0.37.58 (2023-09-25)

### Bug Fixes

- **RESTPatchAPIChannelJSONBody:** add missing `applied_tags` field (#828) (a4cdbbf)

### Features

- default select menu values (#824) (1290c94)

## 0.37.57 (2023-09-21)

### Features

- **ConnectionService:** support twitter rebrand update (#819) (32ba5ce)

## 0.37.56 (2023-08-31)

### Bug Fixes

- **RESTPostAPIChannelMessageJSONBody:** `number` for attachment ids (#811) (1eb0161)
- standard stickers are now free (#789) (018d889)

### Features

- add support for teams update (#813) (a26629c)
- **APIAuditLogOptions:** add `integration_type` (#809) (31c8549)

## 0.37.55 (2023-08-24)

## 0.37.54 (2023-08-17)

### Bug Fixes

- **Guild:** union with never type (#797) (b919e72)

### Features

- Add Media channels (#777) (138b9f2)

## 0.37.53 (2023-08-14)

### Features

- **GatewayActivityUpdateData:** allow sending state (#801) (e095e09)

## 0.37.52 (2023-08-07)

### Bug Fixes

- **RESTPatchAPIChannelJSONBody:** `available_tags` requires `name` only (#802) (5261124)

## 0.37.51 (2023-07-31)

### Bug Fixes

- **Presence:** cannot receive invisible status (#799) (1071d24)

## 0.37.50 (2023-07-20)

### Features

- onboarding updates, mode field, and error codes (#773) (773556a)

## 0.37.49 (2023-07-17)

### Features

- **APIApplication:** approx guild count and get self application endpoint (#728) (874f135)
- **APIAttachment:** add `flags` (#783) (7f9a7e5)
- **APIRole:** role flags (#782) (488b5ad)
- **APIUser:** add avatar decorations (#664) (f556455)
- **AuditLogEvent:** Add creator monetisation events (#787) (47f78bc)
- **GatewayMessageReactionAddDispatch:** add `message_author_id` (#754) (82d7024)

## 0.37.48 (2023-07-10)

## 0.37.47 (2023-06-29)

### Features

- **Guild:** add join raid and mention raid protection (#677) (844ad56)

## 0.37.46 (2023-06-19)

### Features

- **RESTJSONErrorCodes:** add error `50131` (#753) (300e31b)

## 0.37.45 (2023-06-15)

## 0.37.44 (2023-06-15)

### Features

- guild onboarding (#713) (eced39c)

## 0.37.43 (2023-05-29)

### Features

- **RESTJSONErrorCodes:** add error `50178` (#752) (30fb497)

## 0.37.42 (2023-05-08)

### Bug Fixes

- allow sending empty choices with autocomplete: true (#762) (0e6b19d)

## 0.37.41 (2023-05-01)

### Bug Fixes

- **GatewayGuildMembersChunkDispatchData:** Omit `guild_id` for presences (#761) (5079b16)
- **types:** move `types` condition to the front (#763) (9dce6ed)

## 0.37.40 (2023-04-24)

### Features

- add support for voice messages (#749) (3dac5b9)

## 0.37.39 (2023-04-17)

### Bug Fixes

- **RESTPostAPIChannelMessagesThreadsJSONBody:** mark `auto_archive_duration` as optional (ca6a95d)

### Features

- **APIGuild:** add `max_stage_video_channel_users` (#550) (9a66d21)

## 0.37.38 (2023-04-10)

### Features

- **APIBaseInteraction:** add `channel` (#741) (311b7a2)
- **RESTJSONErrorCodes:** add error `50163` (#725) (9074621)

## 0.37.37 (2023-03-23)

### Bug Fixes

- add missing `RESTGetAPIWebhookWithTokenQuery` (#735) (2a78a51)

### Features

- add various new flags (#733) (4723d29)
- **RESTGetAPICurrentUserGuildsQuery:** add `with_counts` (#641) (0cd9b0d)
- **RESTPostAPIGuildChannelJSONBody:** add `default_thread_rate_limit_per_user` (#730) (8f9370d)

## 0.37.36 (2023-03-13)

### Features

- **AutoModeration:** add `custom_message` field support (#727) (0d47c69)

## 0.37.35 (2023-02-17)

### Bug Fixes

- `StageRaiseHand` should be unstable (#722) (85051ea)

## 0.37.34 (2023-02-16)

### Bug Fixes

- **GuildSystemChannelFlags:** "suppress" typo (#719) (8d37bc5)

### Features

- add `managed` field to `ChannelType.GroupDM` (#698) (8477deb)
- **CDNRoutes:** add `storePageAsset()` (#695) (4cf6fd2)
- **ConnectionService:** add `instagram` (#701) (c65e214)
- **RESTJSONErrorCodes:** add error `30011` (#697) (41b31eb)
- **RESTJSONErrorCodes:** add error `30060` (#720) (20153f6)
- **RESTJSONErrorCodes:** add error `30061` (#717) (d609efc)

## 0.37.33 (2023-02-11)

### Bug Fixes

- **GatewayDispatchPayload:** add missing GuildAuditLogEntry (#715) (602c16e)

## 0.37.32 (2023-02-09)

### Features

- **MessageType:** add `SuppressNotifications` (#710) (b14aea6)

## 0.37.31 (2023-01-30)

## 0.37.30 (2023-01-26)

### Features

- **APIGuildMember:** add support for guild member flags (#700) (e902671)
- **GatewayDispatchEvents:** add `GuildAuditLogEntryCreate` (#692) (31ca234)

## 0.37.29 (2023-01-23)

## 0.37.28 (2023-01-12)

### Bug Fixes

- **GuildIntegration:** `enabled` and `user` are present on bots (#660) (b10e9bb)

### Features

- Add role subscription data and system channel flags (#686) (792c60b)
- **APIRoleTags:** add `guild_connections` (#675) (3dbe985)
- **APIThreadMember:** add support for thread member pagination (#689) (e2fb5ee)
- **ConnectionService:** add TikTok (#632) (af06df6)
- **RESTJSONErrorCodes:** add error `50091` (#671) (8869e92)
- role subscriptions (#665) (0b4058b)
- **StickerFormatType:** add `GIF` (#688) (a6bcb3f)

## 0.37.27 (2023-01-09)

### Features

- **MessageType:** add missing types (#681) (7d55b33)

## 0.37.26 (2023-01-05)

### Features

- add RESTJSONErrorCode `40062` and RESTRateLimit.code (#620) (4a25caf)
- **RESTGetAPIAuditLogQuery:** support `after` (#682) (bb2ef84)
- **RESTJSONErrorCodes:** add error `30058` (#676) (921bffd)
- **RESTJSONErrorCodes:** add error `50067` (#640) (6e4a611)

## 0.37.25 (2022-12-29)

## 0.37.24 (2022-12-19)

### Bug Fixes

- **APIApplicationRoleConnection:** `metadata` values can be numbers (#673) (8df9f14)

## 0.37.23 (2022-12-15)

### Bug Fixes

- **APIChannel:** correctly type present properties based on channel type (#669) (2a5413d)
- **Interactions:** make app_permissions required (#652) (89bc0f4)

### Features

- add role connections (#651) (d7b666c)
- **APIApplicationCommand:** add `nsfw` field (#637) (c3fda99)
- **APIGuildForumChannel:** add `default_forum_layout` (#658) (190242a)
- **Locale:** add Indonesian locale (#643) (2b75d13)

## 0.37.22 (2022-12-12)

### Bug Fixes

- **APIChannel:** correctly type `name` based on channel type (#666) (995126e)

## 0.37.21 (2022-12-05)

## 0.37.20 (2022-11-24)

## 0.37.19 (2022-11-21)

### Bug Fixes

- **APIGuildChannel:** make position of guild channel non optional (#647) (9d72e82)
- **channel:** add missing type aliases (#648) (2695dad)

### Features

- **GuildFeatures:** Add `APPLICATION_COMMAND_PERMISSIONS_V2` (#646) (a1869a6)

## 0.37.18 (2022-11-14)

### Features

- **UserFlags:** add `ActiveDeveloper` (#638) (65da837)

## 0.37.17 (2022-11-07)

### Features

- **APIAutoMod:** add support for regex matching (#603) (88a60f7)

## 0.37.16 (2022-10-31)

### Bug Fixes

- **docs:** update gateway documentation links (#628) (7040d9b)
- export `RESTGetAPIVoiceRegionsResult` with the correct name (#627) (69aa717)
- **UserFlags:** hardcode the value of `Quarantined` (#624) (5091f6e)

## 0.37.15 (2022-10-27)

### Bug Fixes

- `default_thread_rate_limit_per_user` is only for forum channels (#596) (88ce291)
- add missing gateway dispatch payloads to gateway event union (#619) (348dd41)
- **APIGuild:** change type of `afk_timeout` to allowed values (#590) (aaa57b4)

### Features

- add some missing REST types (#612) (8d25f23)
- **Components:** new select menus (#602) (df1452d)
- **GuildFeature:** add `DeveloperSupportServer` (#618) (8c1484e)
- **RESTJSONErrorCodes:** add 50039 error (#607) (131637f)
- **UserPremiumType:** add `NitroBasic` (#616) (9448e9b)

## 0.37.14 (2022-10-15)

### Bug Fixes

- **APIAutoModeration:** export v10 json payloads and correct route types (#608) (bce0795)

### Features

- **RESTJSONErrorCodes:** add error `50073` (#594) (70826ed)

## 0.37.13 (2022-10-14)

### Features

- **APIAutoModeration:** add support for auto moderation (#418) (b216f7a)

## 0.37.12 (2022-10-06)

## 0.37.11 (2022-09-26)

### Features

- **APIGuildForumChannel:** add `default_sort_order` (#589) (143b003)
- **APIGuildForumChannel:** update and add missing features (#575) (0f118d3)

## 0.37.10 (2022-09-15)

### Features

- add `RESTRateLimit` (#585) (f4d3f4d)
- **APIConnection:** add `two_way_link` (#546) (d452f63)
- **APIGuild:** document afk timeout values (#570) (32f5a7b)

## 0.37.9 (2022-09-12)

### Features

- **ConnectionService:** add new connections (#548) (afd3b55)

## 0.37.8 (2022-09-08)

### Features

- **GuildFeature:** add `InvitesDisabled` (#549) (2708cb9)

## 0.37.7 (2022-09-05)

### Bug Fixes

- **ChannelType:** bring back old names (b08f2e3)

## 0.37.6 (2022-09-05)

### Bug Fixes

- **APIModalSubmission:** `components` is not optional (#574) (f69b586)
- **GuildChannelType:** add missing `GuildCategory` type (#579) (815c68f)
- **RESTPatchAPIGuildVoiceStateCurrentMemberJSONBody:** `channel_id` is optional (#547) (b7b855b)

### Features

- **APIGuildIntegration:** add `scopes` (#563) (73d15dd)
- **ApplicationFlags:** add `ApplicationCommandBadge` (#537) (48f0f56)
- **RESTPutAPIGuildBanJSONBody:** add `delete_message_seconds` (#534) (4e362d5)

## 0.37.5 (2022-08-25)

### Features

- **FormattingPatterns:** add `ApplicationCommand` (#525) (0098889)

## 0.37.4 (2022-08-22)

### Features

- add common JSON error types (#568) (956f289)
- **ApplicationCommand:** export base chat input types (#569) (248484e)

## 0.37.3 (2022-08-18)

### Features

- **RESTJSONErrorCodes:** add 240000 (#565) (5bb50ae)

## 0.37.2 (2022-08-11)

### Bug Fixes

- **GatewayGuildMembersChunkDispatchData:** make chunk pagination properties mandatory (#558) (0e03e39)
- **GatewayRequestGuildMembersData:** limit being required with user_ids (#559) (dc3d5df)
- **RESTGetAPIChannelUsersThreadsArchivedResult:** add `has_more` missing field (#543) (796f6d8)

### Features

- add search that might or might not work (f8a9c8b)
- **APIVoiceChannel:** support text in voice, properties `last_message_id` and `rate_limit_per_user` (#544) (4488d8f)
- **GatewayReadyDispatchData:** add `resume_gateway_url` (#552) (9a50367)

## 0.37.1 (2022-08-04)

# 0.37.0 (2022-07-28)

### Code Refactoring

- **RESTJSONErrorCodes:** use `MaximumThreadParticipantsReached` instead in error code 30033 (#540) (cecf17b)

### BREAKING CHANGES

- **RESTJSONErrorCodes:** `MaximumThreadParticipants` was renamed to `MaximumThreadParticipantsReached` for consistency with the rest of the codes

## 0.36.3 (2022-07-21)

### Features

- **APIConnection:** add `ConnectionService` to `type` (#491) (4577ac2)
- **APIThreadChannel:** add fields about new message counter capability (#532) (2b53b20)
- **GatewayGuildCreateDispatchData:** add missing `unavailable` (#504) (59e2477)
- **RESTJSONErrorCodes:** add `ApplicationNotYetAvailable` (#507) (09a1141)
- **RESTJSONErrorCodes:** add error `30034` (#530) (0a2e778)
- **RESTJSONErrorCodes:** add error `50132` (#505) (907d88a)
- **RESTJSONErrorCodes:** add error `50146` (#527) (e78de0c)
- **RESTJSONErrorCodes:** add new errors (#506) (65b672e)

## 0.36.2 (2022-07-14)

### Features

- **RESTJSONErrorCodes:** add error `30032` (#521) (f2c3451)
- **RESTPutAPIApplicationGuildCommandsJSONBody:** add missing `id` (#522) (4af2ea9)

## 0.36.1 (2022-07-04)

### Features

- **APIApplicationCommandStringOption:** add `min_length` and `max_length` (#513) (2cade98)

# 0.36.0 (2022-06-30)

### Features

- **APIBaseInteraction:** add `app_permissions` (#509) (0c65d40)
- **MessageType:** update names (#498) (12072b7)
- **RESTJSONErrorCodes:** add error 20024 (#480) (34908aa)

### BREAKING CHANGES

- **MessageType:** The following message types have been renamed:

* `GuildMemberJoin` -> `UserJoin`
* `UserPremiumGuildSubscription` -> `GuildBoost`
* `UserPremiumGuildSubscriptionTier1` -> `GuildBoostTier1`
* `UserPremiumGuildSubscriptionTier2` -> `GuildBoostTier2`
* `UserPremiumGuildSubscriptionTier3` -> `GuildBoostTier3`

# 0.35.0 (2022-06-23)

### Code Refactoring

- **GatewayIdentifyProperties:** remove `$` prefix from keys (#493) (3b10c60)

### Features

- **APIEmbedVideo:** add missing `proxy_url` property (#496) (56d491f)
- **REST:** add `CDNRoutes` (#502) (0609886)
- **UserFlags:** add `Quarantined` flag (#495) (fc3aa1c)

### BREAKING CHANGES

- **GatewayIdentifyProperties:** The fields for identify no longer use the `$` prefix for the values.

# 0.34.0 (2022-06-13)

### Code Refactoring

- separate `MESSAGE_CREATE` fields from `APIMessage` object (#434) (0bb2204)

### Features

- add guild mfa endpoint and error `50017` (#476) (292c6b5)
- **RESTJSONErrorCodes:** add 220003 error (#466) (20653b3)

### BREAKING CHANGES

- Certain fields that come only through the gateway are now correctly typed as such

## 0.33.5 (2022-06-07)

### Bug Fixes

- **GatewayGuildCreateDispatch:** add missing `GatewayGuildCreateDispatch` (#477) (d268e0b)
- **RESTPostAPIWebhookWithTokenJSONBody:** `thread_name` should be optional (#479) (eff8892)

### Features

- **RESTJSONErrorCodes:** add error `30052` (#469) (d854317)

## 0.33.4 (2022-06-06)

### Features

- **RESTPostAPIWebhookWithTokenJSONBody:** add `thread_name` (#463) (8e5f07e)

## 0.33.3 (2022-06-04)

### Bug Fixes

- **AddUndefinedToPossiblyUndefinedProperties:** recurse down objects (#471) (43c372d)

## 0.33.2 (2022-06-01)

### Bug Fixes

- **docs-site:** website link colors (#457) (51e664d)
- **GatewayGuildCreateDispatch:** add extra fields that were missing (#458) (15fcd1b)
- **RestPostAPIBaseApplicationJSONBody:** make `default_member_permissions` optional (#460) (6a813be)

## 0.33.1 (2022-05-26)

### Bug Fixes

- **RESTPostAPIApplicationGuildCommands:** correct types due to unions (#447) (6d85ad6)

### Features

- **RESTJSONErrorCodes:** add error `50600` (#444) (5ef49f4)
- **RESTPostAPIGuildChannels:** update post body fields (#419) (748db34)

# 0.33.0 (2022-05-16)

### Code Refactoring

- **GuildFeature:** thread archive durations are no longer boost locked (#412) (1737ade)
- separate `GUILD_CREATE` fields from `APIGuild` object (#423) (17f5caa)

### Features

- add support for application command permissions v2 (#415) (d3163ca)
- **OAuth2Scopes:** add new OAuth2 scopes (#435) (8f16f45)
- **rest:** add missing guild routes results (#438) (1afce87)

### BREAKING CHANGES

- APIGuild now correctly shows just the properties that are obtainable through rest/GUILD_UPDATE, while the extra fields have been moved to GatewayGuildCreateDispatchData to correctly represent the data received
- **GuildFeature:** `SevenDayThreadArchive` and `ThreeDayThreadArchive` have been removed as they are no longer valid

## 0.32.1 (2022-05-05)

### Features

- **RESTJSONErrorCodes:** add error `50080` (#408) (43cfbcb)
- **RESTPostAPIGuildForumThreads:** add `message` field (#416) (a28c824)

# 0.32.0 (2022-04-25)

### Bug Fixes

- add `position` property to create channel options (#409) (3fe53ce)

### Code Refactoring

- **APIGuildIntegration:** make `enabled` optional (#406) (1212eb9)

### BREAKING CHANGES

- **APIGuildIntegration:** `enabled` is now properly marked as optional

## 0.31.2 (2022-04-18)

### Features

- **RESTPostAPIGuildChannelJSONBody:** add `default_auto_archive` prop (#400) (6a192b1)

## 0.31.1 (2022-04-11)

### Features

- **APIApplicationCommandInteractionData:** add `guild_id` (#396) (bc6e97f)
- **APIGuildForum:** add support for forums, part 1 (#398) (bf08484)
- student hubs (#215) (69079ee)

# 0.31.0 (2022-04-04)

### Code Refactoring

- **APIGroupDMChannel:** make `name` nullable (#347) (ed0049b)
- remove `summary` from applications (#386) (f0ab4e8)
- remove store channels (#364) (25677ff)

### Features

- add `RESTGetAPIGuildBansQuery` (#391) (b1bf7bf)
- **APIApplication:** app authorization links and tags (#239) (93eab11)
- **APIApplicationCommand:** add missing localization props (#383) (9c12718)
- **APIAuditLogChange:** add `APIAuditLogChangeKeyImageHash` (#379) (f532002)
- **GuildFeatures:** add animated banners (#219) (c23f2ac)
- **RESTPostAPIStageInstanceJSONBody:** add `send_start_notification` (#378) (b764e8d)

### BREAKING CHANGES

- The deprecated `summary` field has been removed
- Store channels have been removed, alongside their types
- **APIGroupDMChannel:** The `name` field is now also nullable for Group DM Channels

# 0.30.0 (2022-03-24)

### Bug Fixes

- **APIGuildIntegrationType:** correct name of type (#366) (fa740eb)

### Features

- **APIApplicationCommand:** add command localization (#370) (f702988)

### Reverts

- fix(GatewayVoiceState): some fields are optional instead of nullable (#367) (e822e45)

### BREAKING CHANGES

- **APIGuildIntegrationType:** `APIGuildInteractionType` is now correctly named `APIGuildIntegrationType`

# 0.29.0 (2022-03-10)

### Bug Fixes

- **GatewayVoiceState:** some fields are optional instead of nullable (#345) (fddff21)
- **RESTJSONErrorCodes:** typo in error `30046` (#362) (854aa36)

### Code Refactoring

- **APIGuildScheduledEventBase:** make `description` nullable (#359) (e5710d0)
- make things optional and nullable where applicable (#361) (10fdeaa)
- **RESTJSONErrorCodes:** update error `50008` key (#338) (9a57848)

### Features

- **APIInviteGuild:** add boost count (#323) (cb92843)
- **APIStageInstance:** add `guild_scheduled_event_id` (#350) (d06d2d6)
- **RESTJSONErrorCodes:** add error `10065` (#336) (e8127b8)

### BREAKING CHANGES

- **RESTJSONErrorCodes:** `MaximumNumberOfEditsToMessagesOlderThanOneHourReached` is no longer mistyped as `MaxmimumNumberOfEditsToMessagesOlderThanOneHourReached`
- **APIGuildScheduledEventBase:** The type for `description` can also be null, not just optional
- **RESTJSONErrorCodes:** The error code `50008` has been renamed from `CannotSendMessagesInVoiceChannel` to `CannotSendMessagesInNonTextChannel`
- The deprecated `asset` field for stickers is correctly marked as optional now. The `image` field for Guild Scheduled Events is now correctly typed as optional.
- **GatewayVoiceState:** `channel_id` and `request_to_speak_timestamp` are correctly typed as optional, not nullable now.

# 0.28.0 (2022-03-07)

### Code Refactoring

- **PermissionFlagsBits:** rename `StartEmbeddedActivities` to `UseEmbeddedActivities` (#342) (3e3acb5)

### Features

- add support for TS module: NodeNext (#356) (e9ee696)
- **MessageComponentInteraction:** export specific interaction aliases (#353) (3503a4f)
- **Utils:** add more typeguard functions to determine the interaction types (#355) (dec7717)

### BREAKING CHANGES

- **PermissionFlagsBits:** The `StartEmbeddedActivities` permission flag has been renamed to `UseEmbeddedActivities`

## 0.27.3 (2022-02-24)

### Bug Fixes

- **APIApplicationCommandAutocompleteInteraction:** make `options` field required for v10 (PR #332 redo) (#339) (8d432f2)

## 0.27.2 (2022-02-17)

### Bug Fixes

- **APIApplicationCommandAutocompleteInteraction:** make `options` field required (#332) (5396daf)
- **APIInteractionResponse:** add `APIModalInteractionResponse` to union (#333) (a8f19e6)

### Features

- api v10 (#331) (8e87b3e)

## 0.27.1 (2022-02-14)

### Bug Fixes

- **APIInteraction:** add modal submit interaction & make `data` required in APIModalSubmit (#321) (f88727b)
- **APIInteractions:** export ApplicationCommandAutocomplete (#309) (5056da5)
- **CI:** skip pull request checks for runs that don't include the token (#327) (0ad06fc)
- make `data` required in autocomplete interaction and add separate dm/guild types (#322) (7abeb2e)

### Features

- **RESTJSONErrorCodes:** add error 40060 (#320) (72e9617)

# 0.27.0 (2022-02-10)

### Bug Fixes

- **GatewayThreadCreateDispatchData:** `newly_created` is optional, and `true` when present (#312) (87b9b08)

### Code Refactoring

- **ActivityType:** change `Game` to `Playing` (#298) (08a8b28)
- **UserFlags:** remove `None` (#308) (8e13cd8)

### Features

- **APIGuildPreview:** add `stickers` (#279) (310c68f)
- **APIInteraction:** add locale props to interactions (#273) (03b8d3f)
- **APIMessageInteraction:** add `member` field (#299) (80ed7ba)
- **APIScheduledEvent:** add `image` prop (#303) (663c4e9)
- **APIThreadMetadata:** add `create_timestamp` field (#301) (d95d956)
- **ApplicationCommand:** attachment application command option type (#272) (71c4e6a)
- **GatewayThreadCreateDispatch:** Add `newly_created` field (#311) (7e54215)
- **Interactions:** add modal and text input interactions (#243) (bf0f66b)
- **Locales:** add locale string enum (#297) (b07d5a0)
- **MessageFlags:** add `FailedToMentionSomeRolesInThread` (#280) (76588d9)
- **RESTPostAPIChannelMessage, RESTPostAPIWebhookMessage:** add flags for creation (#300) (4194bd9)
- **RESTJSONErrorCodes:** add error 30042 (#305) (9c2b185)
- **RESTJSONErrorCodes:** add error 30046 (#304) (56d3975)
- **RESTJSONErrorCodes:** add error 40004 (#314) (269a75c)
- **RESTJSONErrorCodes:** add error 50068 (#302) (7655e20)
- **RESTJSONErrorCodes:** add error code 50086 (#286) (51fb37c)
- **RESTPatchAPIGuildMember:** add `communication_disabled_until` field (#289) (5056b0f)
- **RESTPatchAPIGuildMember:** add modify current member and deprecate nick route (#262) (9a982ff)
- **RouteBases:** add base for guild scheduled events (#293) (83f29b6)
- **UserFlags:** add `Spammer` flag (#294) (03f12d7)

### types

- Add tagged `type` unions for channel types (#200) (2c1fbda)

### BREAKING CHANGES

- **Interactions:** `APIBaseMessageComponent` was renamed to `APIBaseComponent`
- **UserFlags:** The `None` user flag is bye-bye (although I doubt anyone is using it)
- All of the channel types are now split based on their type. As such, you will need to assert the type (either by checking it with the enum or by casting the data as the correct channel) before accessing data.
  _If you encounter any missing properties due to this, please open an issue! This is a big change, and we hope nothing is missing_

- **ActivityType:** `Game` was renamed to `Playing`

## 0.26.1 (2022-01-02)

### Bug Fixes

- **APIApplicationCommandOption:** correct type for integer and number (#284) (fe1f531)

### Features

- **APIAuditLogChangeData:** Add `communication_disabled_until` (#281) (0cf51ab)
- **APIGuildScheduledEvent:** add more precise types for stage instance/voice/external events (#278) (751aee6)
- **ApplicationFlags:** add embedded application flags (#277) (9f4f59c)

# 0.26.0 (2021-12-24)

### Bug Fixes

- **APIInvite:** channel can be null (#182) (c67d426)
- **GatewayStageInstance:** Stage Instance dispatches not included in `GatewayDispatchPayload` (#267) (46db72d)
- **NonDispatchPayload:** `t` & `s` fields are always null on non-dispatch payloads (#259) (315ce35)
- only a partial object is needed when updating attachments (#263) (7ab780b)
- **StickerPack:** Optional `banner_asset_id` (#270) (7eee39d)

### Features

- Add API error code `50055` (#256) (b01716b)
- Add API error code 50109 (#268) (bfc5e46)
- add support for user guild member read oauth2 scope and route (#254) (e9d02a1)
- **APIAuditLog:** add `guild_scheduled_events` prop (#251) (c7efcd5)
- **APIGuildMember:** add guild timeouts (#235) (0bbc972)
- **GatewayThreadMemberUpdateDispatchData:** add `guild_id` extra field (#266) (2c72242)
- **RESTJSONErrorCodes:** add error 20029 (#257) (9e619fc)
- bring in support for TS 4.5's `exactOptionalPropertyTypes` (#275) (c20e5ae)

### Cleanups

- Make application command option union easier to use (#250) (8bbb819)
- **ChatInputCommandOptions:** cleanup chat input options (#274) (7fe78ce)

### BREAKING CHANGES

- **StickerPack:** `banner_asset_id` is now optional. Reference PR: https://github.com/discord/discord-api-docs/pull/4245
- **APIInvite:** this marks the channel property of invites as possibly null
- **ChatInputCommandOptions:** A lot of the options were renamed and split up to clean up internal code.
  All option interfaces that ended in a plural (`*Options`) have had their pluralization removed (`*Option` now).
  `APIApplicationCommandInteractionDataOptionWithValues` has been renamed to `APIApplicationCommandInteractionDataBasicOption`,
  and every `*InteractionDataOptions{Type}` interfaces have been renamed to `*InteractionData{Type}Option`
  (i.e.: `ApplicationCommandInteractionDataOptionString` -> `APIApplicationCommandInteractionDataStringOption`).

## 0.25.2 (2021-11-30)

### Bug Fixes

- **APISelectMenuComponent:** `options` property is required (#248) (51dee6e)

### Features

- **Guild:** boost progress bars (#227) (47382b6)

## 0.25.1 (2021-11-30)

### Bug Fixes

- **deno:** faulty import paths for guild scheduled events (#245) (44c0f05)

# 0.25.0 (2021-11-29)

### Bug Fixes

- **APIApplicationCommandOption:** remove `default` property (#242) (faa8bf4)
- correct types for autocomplete interaction data (#234) (691abb5)
- correct types for REST attachments (#238) (fa54b9d)
- make subcommand options optional (#241) (7379a34)

### Code Refactoring

- **UserFlags:** update flag names (#229) (f2d62e3)

### Features

- add guild scheduled event (#186) (d333962)
- **RESTPostAPIChannelThreadsJSONBody:** add `rate_limit_per_user` (#237) (1e52e0c)
- add max/min option for number-based options (#221) (bc1d03e)
- add maze api error (#228) (7a15c97)
- **ActivityFlags:** add new flags (#207) (0f51d8e)
- **ApplicationFlags:** add message content intent flags (#226) (d189e36)
- **Attachments:** multi uploads and alt text (#223) (fdf133e)
- **GuildSystemChannelFlags:** add suppress member join sticker replies flag (#222) (4021dae)
- **Interactions:** add autocomplete api types (#205) (3b9320d)
- **UserFlags:** add `BOT_HTTP_INTERACTIONS` flag (#212) (a015f96)

### BREAKING CHANGES

- **UserFlags:** All user flags now follow the internal name, with descriptions added for what they represent. This means you'll have to do some minor renaming in your code if you check for flags.
- **APIApplicationCommandOption:** If you were using the `default` property for ApplicationCommandOptions, it has been removed, as Discord wasn't even taking it into account anymore.
- The types for autocomplete interactions have been corrected.

# 0.24.0 (2021-10-16)

### Bug Fixes

- **APISelectMenuComponent:** make options field optional (#209) (0c592a0)

### Code Refactoring

- **APIVoiceRegion:** removed `vip` property (#214) (7db6953)

### Features

- **APIApplicationCommand:** add `channel_types` field to channel options (#198) (77396b5)
- **APIAttachment:** add ephemeral field (#199) (2aee879)
- **APIGuildMember:** add per guild avatars (#208) (0331518)
- **APIRole:** add role icons (#204) (1076822)
- **InteractionResolvedChannels:** add `parent_id` and `thread_metadata` fields to resolved channels (#210) (64e4e52)
- **PermissionFlagBits:** update thread permissions (#181) (68d97ae)
- **PermissionFlagsBits:** add `StartEmbeddedActivities` (#197) (4bbe1ea)
- **RESTJSONErrorCodes:** add error 50101 (#202) (b453d75)
- **Routes:** add missing OAuth2 routes (#218) (9dd3446)

### BREAKING CHANGES

- **APIVoiceRegion:** The `vip` property has been removed.

## 0.23.1 (2021-09-08)

### Bug Fixes

- **RESTPostAPIBaseApplicationCommandsJSONBody:** omit `version` field (#195) (43cc755)

# 0.23.0 (2021-09-07)

### Bug Fixes

- **AuditLog:** correct `nickname` type (#189) (64937e2)
- **Embed:** correct certain optional types as being required (#192) (e628f0f)
- import causing error 404 on deno (#178) (8fcd0f2)

### chore

- **Gateway:** remove `APPLICATION_COMMAND_*` events (#191) (d590caf)

### Features

- **APIApplicationCommand:** add `version` field (#193) (ecbed18)
- **APIUser:** add `banner` and `accent_color` (#183) (b07b903)
- **Interactions:** context menu items (#166) (fdc1c1a)
- **JSONErrorCodes:** add `160002` (#190) (8b49887)
- **MessageType:** add ContextMenuCommand and rename ApplicationCommand to ChatInputCommand (#180) (0024823)
- **Threads:** add `invitable` (#185) (b6babf2)

### BREAKING CHANGES

- **Gateway:** The three Application Command events have been removed
- **Embed:**
  - `APIEmbedAuthor#name` is required, not optional
  - `APIEmbedThumbnail#url` is required, not optional
  - `APIEmbedImage#url` is required, not optional

# 0.22.0 (2021-07-31)

### Bug Fixes

- **Gateway:** thread list sync now sends an array as documented (#174) (a93235c)
- **MessageComponent:** correct type for emoji (#176) (b75b05f)

### chore

- **ApplicationCommandOptionType:** casing changes for subcommands (#175) (f93b6be)

### Features

- thread updates (#167) (47100bc)

### BREAKING CHANGES

- **ApplicationCommandOptionType:** This renames `SubCommand` to `Subcommand`, and `SubCommandGroup` to `SubcommandGroup`
- `Routes#channelJoinedArchivedThreads` is now spelled right (from `Routes#channelJoinedArhivedThreads`)
- **Gateway:** `GatewayThreadListSync#members` is now an array of APIThreadMember instead of a Record of GatewayThreadListSyncMember

# 0.21.0 (2021-07-30)

### Bug Fixes

- change resolved index types to string (#169) (d338409)
- export APIPingInteraction (#168) (ef2a0ae)
- **APIInteraction:** bring back Ping type (#164) (ff75eb3)

### Features

- **ApplicationCommandOptionType:** add Number (10) (#153) (6f15e53)
- **Globals:** revert template bigint type to string type (#171) (f299507)

### Reverts

- fix: change resolved index types to string (#172) (647905e)

### BREAKING CHANGES

- **Globals:** The type for Snowflake and Permissions is reverted from the `${bigint}` template type back to a normal string type

## 0.20.2 (2021-07-21)

### Bug Fixes

- **APIInteraction:** bring back Ping type (#164) (ff75eb3)

## 0.20.1 (2021-07-20)

### Features

- **Interactions:** add interaction response and followup route (#162) (f99f07f)

# 0.20.0 (2021-07-20)

### chore

- Add more missing stuff (#160) (d009554)

### Code Refactoring

- change `xID` to `xId` (#159) (323e531)
- rename `isStyledButton` to `isInteractionButton` (#158) (634f64d)

### Features

- **PermissionFlagsBits:** add `UseExternalStickers` (1n << 37n) (#154) (5dccc6b)
- **RESTJSONErrorCodes:** add sticker errors (#155) (8dbeca0)

### BREAKING CHANGES

- `GatewayGuildMemberUpdateDispatchData#joined_at` is properly marked as nullable now
- In v9, `thread_id` was incorrectly placed in `RESTPostAPIWebhookWithTokenJSONBody` and has been moved to `RESTPostAPIWebhookWithTokenQuery`
- All types that contained the `ID` word in them have had it renamed to `Id` (ex: `APIButtonComponentWithCustomID` is now `APIButtonComponentWithCustomId`)
- The `isStyledButton` util has been renamed to `isInteractionButton`

# 0.19.0 (2021-07-19)

### Bug Fixes

- **FormattingPatterns:** fix StyledTimestamp (#147) (dd12c6a)
- **RESTOAuth2:** correct casing of `OAuth` (#134) (f0b2766)
- **RESTPostAPIWebhookWithTokenJSONBody:** add missing components (#152) (ca933ae)
- fix autopublish CD (#140) (8627c9d)

### chore

- Get up to date _again_ (#156) (86e0736)
- **RESTErrorCodes:** correct casing for OAuth (ca6612e)

### Code Refactoring

- **Enums:** make property casing consistent (#131) (aa5e26d)

### Features

- **Stickers:** sticker packs, sticker routes, and guild stickers (#145) (4a83629)
- add stage instance related typings to audit logs (#151) (836e8fb)
- **APIGuild:** add `nsfw_level` (#149) (5256ac7)
- **Channel:** add embeds to post / patch (#143) (13d483e)
- **FormattingPatterns:** add timestamp (#146) (16eae7e)
- **RESTErrors:** add types for rest errors (#122) (7b47fc9)
- **Threads:** add typed thread creation (#148) (f393ba5)
- add typings for stage instance (#144) (e36ef9e)
- **Interactions:** components and component interactions (#132) (036bb03)
- **Threads:** add default auto archive and minor tweaks (#142) (d2b6276)
- api v9 and threads (#133) (d1498c3)

### BREAKING CHANGES

- `APISelectOption` has been renamed to `APISelectMenuOption`
- APISelectMenuOption#default is now properly marked as optional

- Updated OAuth2 Application types
- `APIApplication#owner` is now marked as optional, per the docs

- Correct APIAuditLogChangeKeyNick's key
- This renames APIAuditLogChangeKeyNick's key from `mute` to `nick`

- Add `application_id` to APIMessage
- Correct type of `id` and `user_id` in APIThreadMember
- The type of `id` and `user_id` in APIThreadMember are now marked as optional; read the TSDoc for when it's actually optional

- Correctly version API route in RouteBases
- This changes the `RouteBases.api` to be versioned based on the API version you're importing. **Make sure to update your code to handle that**

- Added new guild features
  ref: https://github.com/discordjs/discord-api-types/pull/156/commits/4d36e533cffecbcce13e968a7803e5a68e021106

- Cleaned up interaction types
- While this shouldn't be necessary, this is a warning that types for interactions HAVE changed and you may need to update your code. For the most part, the types _should_ be the same, more accurate and strictly typed. You will also see that every type of interaction has a Guild/DM counterpart exported (ex: APIApplicationCommandGuildInteraction vs APIApplicationCommandInteraction, where the former has all the guild properties, while the latter has all properties that depend on context marked as optional).

- Add message property to MessageComponent interactions
- **RESTErrorCodes:** This properly capitalizes certain error codes with the right OAuth capitalization
- **RESTOAuth2:** `RESTGetAPIOauth2CurrentApplicationResult` and `RESTGetAPIOauth2CurrentAuthorizationResult` have been renamed to `RESTGetAPIOAuth2CurrentApplicationResult ` and `RESTGetAPIOAuth2CurrentAuthorizationResult`, to correct the casing of `OAuth`

- **Enums:** Enum keys have been normalized, and they are all PascalCased now (for API v8 and above). API v6 did not receive these changes.

## 0.18.1 (2021-05-03)

### Bug Fixes

- **APIInvite:** `expires_at` is nullable (#128) (44b956a)

### Features

- add new interfaces for interaction-related structures (#129) (bd638b9)
- **APIInvite:** add `expires_at` field and `with_expiration` param (#127) (82ca0ce)
- **ApplicationCommandOptionType:** add `MENTIONABLE` (9) (#126) (91afb0b)

# 0.18.0 (2021-04-18)

### Bug Fixes

- **APIInvite:** `channel` is not optional (#123) (abe0513)

### Code Refactoring

- **Invite:** rename `InviteTargetUserType` to `InviteTargetType` (#124) (bc9ab45)

### BREAKING CHANGES

- **Invite:** `InviteTargetUserType` is renamed to `InviteTargetType`, to match the documentation.
  - Reference: https://github.com/discord/discord-api-docs/pull/2690

# 0.17.0 (2021-04-17)

### Bug Fixes

- **APIChannel:** `rtc_region` is optional (#118) (617f507)

### Code Refactoring

- **APISticker:** remove `preview_asset` (#119) (9817623)

### Features

- **WebhookMessage:** add `GET` route types (#120) (3294fb1)

### BREAKING CHANGES

- **APISticker:** This removes the `preview_asset` property from sticket objects
  - Reference: https://github.com/discord/discord-api-docs/commit/b9b8db2
- **APIChannel:** This corrects the fact that `rtc_region` isn't present on non-voice-like channels

# 0.16.0 (2021-04-14)

### Features

- **Guild:** add `nsfw` property (#116) (21b572b)
- **RESTJSONErrorCode:** add `UnknownInteraction` error code (#115) (ced37d0)

### docs

- **Routes:** add `GET` routes to `webhookMessages` (#114) (6451679)

### BREAKING CHANGES

- **Routes:** possibly a breaking change due to the fact that the messageID is now strictly typed as a Snowflake or `@me`
  - Reference: discord/discord-api-docs#2410

## 0.15.1 (2021-04-12)

### Bug Fixes

- **TypeScript:** imports not working in TypeScript (4738c33)

# 0.15.0 (2021-04-11)

### Bug Fixes

- **APIApplicationCommand:** default_permission (#111) (9420c3e)
- **Scripts:** `await` in `versions` script, log any errors from deno one (9113eb1)

### BREAKING CHANGES

- **APIApplicationCommand:** This renames the `default_permissions` property to `default_permission`, the correct spelling.

# 0.14.0 (2021-04-11)

### Bug Fixes

- **APIMessage:** correct type for `application` (ed2cbe8)
- **GatewayGuildMemberUpdateDispatchData:** correct types (14f14e2)
- **GatewayPresenceUpdateData:** `activities` may not be `null` (bb3cb04)
- **GatewayVoiceServerUpdateDispatchData:** `endpoint` is nullable (e8203a1)
- **GuildWelcomeScreenChannel:** document missing `description` property (238695b)
- **OAuth2:** `scope` can be optional / not required (bbe56a9)
- **OAuth2:** remove invalid parameters from refresh token request (1c02450)
- **RPC:** version `RPC` same as` rest`, export again in `shortcuts` (67e0ba1)
- **Utils:** correct import for deno users (42dd75f)

### chore

- **Gateway:** remove `guild_subscriptions` (ab8b289)
- **GatewayReady:** un-document `private_channels` (457edf4)
- **Integrations:** remove routes that bots can no longer interact with (577c5bd)
- **MessageGetReactions:** remove `before` pagination (0ec26b7)
- **Oauth2Scopes:** remove `rpc.api` (7ee8511)
- **Permissions:** rename `USE_APPLICATION_COMMANDS` to `USE_SLASH_COMMANDS` (2aa7f7a)
- **UserFlags:** un-document `SYSTEM` flag (1774d4c)

### Code Refactoring

- restructure module (81cdfc2)

### Features

- **APIApplication:** document `terms_of_service` and `privacy_policy` (598cbfb)
- **APIAttachment:** add `content_type` (2d432d1)
- **APIChannel:** add `rtc_region` (#108) (07ba907)
- **APIChannel:** add `video_quality_mode` (#106) (d8d7bcc)
- **APIInteraction:** add type-check utilities (3307201)
- **Exports:** add `globals` to the exported sub-modules (5d35f61)
- **Gateway:** add `INTEGRATION_*` events (9c3fab0)
- **GuildWelcomeScreen:** document `welcome-screen` endpoint (169ecde)
- **Interactions:** add batch command create / update (edfe70a)
- **Interactions:** add Slash Command Permissions (f517f35)
- **Invites:** document `target_application` & correct property names (97c8ab3)
- **MessageFlags:** `EPHEMERAL` desc and added `LOADING` (#109) (4462255)
- **PatchAPIWebhookMessage:** add `file` property (fc2f3c5)
- **Webhook:** add & document `url` property (77e5bb6)
- invite reminder system message type and flag (#105) (b90714f)
- stage channels! (#107) (6cd7542)

### BREAKING CHANGES

- **APIInteraction:** This commit removes the `guild_id` property from `APIDMInteraction`
  which allows type-checks to work with the `in` operator.
  Because of that, we also provide utility functions that help with those type checks.
  Use them in your code by importing the `Utils` object, or by directly importing them.
  Check the README for examples
- **OAuth2:** This commit removes parameters that are not expected
  in the refresh token request body

Reference: https://github.com/discord/discord-api-docs/commit/eaa12cbc8f96cf7cfe8c530f88e60582c24ca5dd

- **GatewayReady:** This property has been deprecated for a while, and was
  returning an empty array for bot users. This commit removes it entirely

Reference: https://github.com/discord/discord-api-docs/commit/f36156dbb641f5c4d4f4593f345bfd6e27fdee08

- **Permissions:** This commit brings consistency with the documentation,
  where the permission is documented as `USE_SLASH_COMMANDS`, whereas the
  client has it as `USE_APPLICATION_COMMANDS` internally

Reference: https://github.com/discord/discord-api-docs/commit/c7d25885c5cd80a49b31609a40b70603b35f9dec

- **MessageGetReactions:** This query parameter is not usable and was not respected
  by the API.

Reference: https://github.com/discord/discord-api-docs/commit/f72b084773d4d3989fb19be4fb4d9cf276a1e6b3

- **OAuth2:** This removes the `scope` property from the authorization
  code flow, as it is not expected there.

Reference: https://github.com/discord/discord-api-docs/commit/57965033ab4216a0bb853e85d6912531cd5a9981

- **Gateway:** This removes `guild_subscriptions`, as it has been
  deprecated in favor of `intents`.

Reference: https://github.com/discord/discord-api-docs/commit/8de017436d37e56fab14cb8f68f0448a45ebc731

- **Oauth2Scopes:** This removes the `rpc.api` scope, as it has been removed
  from the documentation.

Reference: https://github.com/discord/discord-api-docs/commit/2641d9808f676e7316483d152cdb37ed1168f968

- **APIMessage:** This removes the `APIMessageApplication` interface, as it has
  been removed from the documentation, being replaced with the OAuth2 application.

Reference: https://github.com/discord/discord-api-docs/commit/ff0c831e424f1bc17dd3cde62da48d5c3d933e88

- **APIApplication:** This renames the `GatewayPresenceLimit` flag to
  `GatewayPresenceLimited`, for consistency with `GatewayGuildMembersLimited`
  and the documented name.

Reference: https://github.com/discord/discord-api-docs/commit/39b254bed1cc396c475e508a3f2bf328815605c9

- **GatewayVoiceServerUpdateDispatchData:** Any code that expects `endpoint` to never be null needs
  to be updated, and the conditions specified in the documentation need
  to be respected regarding that.

Reference: https://github.com/discord/discord-api-docs/commit/e887382fafd4c4417f7ba62963984f25bcb643f6

- **Invites:** This renames `target_user_type` to `target_type`,
  the actual value the API expects.

Reference: https://github.com/discord/discord-api-docs/commit/1b4e363e324eb1f49a47e32cb0108fbe276c8e0e

- **GatewayPresenceUpdateData:** Clearing `activities` is done by setting them to an empty
  array, not by setting them to `null`.

Reference: https://github.com/discord/discord-api-docs/commit/5bf598b864fb89262fce07137f68ce6e7e583432

- **UserFlags:** This removes a flag that bots should not use, as Discord
  said this is an internal flag.

Reference: https://github.com/discord/discord-api-docs/commit/9293f0d490ac6acf9d627e429e5a8131b303b528

- **Integrations:** This removes the 3 routes that bots can no longer access.

Reference: https://github.com/discord/discord-api-docs/commit/efe4e5808b6826d40302e265a5ae9b5b65d92fe7

- **Exports:** Certain objects from this file have been moved to their
  appropriate spot (such as JSON Error Codes)
- Files have been moved around in order to keep them
  organized. Exports might also be missing, so please report if that is the
  case.

## 0.13.3 (2021-03-28)

## 0.13.2 (2021-03-28)

### Bug Fixes

- **ApplicationCommandInteractionDataOptionSubCommandGroup:** typo (#102) (15c171c)

## 0.13.1 (2021-03-27)

### Bug Fixes

- **APIInteractionResponse:** `data` should not always be present (#100) (ffcd95d)

# 0.13.0 (2021-03-27)

### Bug Fixes

- **deno:** replace `const enum` exports in deno with normal `enum`s (#89) (7343fab)
- **RESTPostAPIChannelMessageJSONBody:** mark `tts` as a full boolean (#96) (9d8d090)
- **RESTPostAPIGuildsJSONBody:** make some fields nullable (#91) (ae1900d)

### Features

- **APIApplication:** add ApplicationFlags (#92) (92f76f1)
- **APIApplicationCommandInteractionData:** add `resolved` (#86) (24155ae)
- **APIBaseInteraction:** add application_id (#98) (0582f88)
- **APIInteraction:** DM slash commands and property descriptions (#84) (d0b3106)
- **APIInteractionResponse, APIInteractionResponseType:** update for UI changes (#90) (eafe7ba)
- **APIMessage:** add `interaction` (#93) (0f29b32)
- **APIMessageReferenceSend:** add `fail_if_not_exists` (#82) (855f36d)
- **PermissionFlagsBits:** add `USE_APPLICATION_COMMANDS` (#85) (ceb787b)
- **rest:** api base routes (#87) (466fa95)
- add Application Command events (#75) (da2c2e9)
- add GET single Application Command (#76) (5826da2)
- implement FormatPatterns (#79) (4e4a084)
- **OAuth2:** add `/oauth2/[@me](https://github.com/me)` route (#73) (84759d1)
- **Webhook:** add Edit Webhook Message result and error 50027 (#71) (4c77a5d)

## 0.12.1 (2021-01-05)

### Bug Fixes

- run deno workflow only on branch push (#66) (0ef4620)

### Features

- add Snowflake and Permissions types (#69) (549a6f0)

# 0.12.0 (2021-01-01)

### Bug Fixes

- **APIApplication:** flags should be omitted in REST, not optional everywhere (#57) (664ad80)
- **RESTPatchAPIChannelJSONBody:** add missing bitrate field (#60) (15892ec)

### Features

- **GatewayActivity:** add missing fields (#39) (dccdfe0)

## 0.11.2 (2020-12-20)

## 0.11.1 (2020-12-19)

### Bug Fixes

- **APIAuditLogEntry:** user_id is not nullable (#52) (2b89beb)
- **RESTPostAPIGuildsJSONBody:** system_channel_flags is optional (#53) (ba4c0d7)

# 0.11.0 (2020-12-19)

### Bug Fixes

- **APIGuildMember:** drop nullability of `pending` prop (#49) (c2f0dee)
- **RESTPatchAPIGuildJSONBody:** multiple properties are actually nullable (#48) (018fc4f)

# 0.10.0 (2020-12-09)

### Features

- server templates (#25) (7d873f7)

## 0.9.1 (2020-11-22)

# 0.9.0 (2020-11-22)

### Features

- **Message:** reply updates (#34) (21b9ae4)
- **Message:** Stickers (#32) (39ea1f4)

# 0.8.0 (2020-11-03)

### Bug Fixes

- webhookPlatform route (#36) (666a0c7)
- **GatewayPresence:** correct type for sent activity objects (#30) (61db1ee)

# 0.7.0 (2020-10-18)

### Bug Fixes

- **GatewayHeartbeat:** d is nullable (#26) (0982610)
- **GatewayIdentify:** use correct presence interface (#28) (91c63f0)

### Features

- **APIGuildWidgetMember:** add activity and use proper status type (#24) (f058ed6)

# 0.6.0 (2020-10-04)

### Bug Fixes

- **APIChannel:** position is optional (#21) (061a147)
- **RESTPostAPIGuildsJSONBody:** use correct types (#22) (dcf8ddf)

### Features

- v8 support (#14) (11b95c8)

# 0.5.0 (2020-09-19)

### Bug Fixes

- correct typos (#18) (97c7b4e)
- **APIUser:** premium_type is optional (#19) (8cf1ba3)
- **GatewayIdentifyProperties:** rename `device` to `$device` (#17) (9e5c5b5)

## 0.4.1 (2020-09-18)

### Features

- add oauth2 types (#16) (10fdeba)

# 0.4.0 (2020-09-16)

### Features

- **ActivityType:** add Competing activity type (#11) (94d0a16)

# 0.3.0 (2020-09-14)

### Bug Fixes

- **APIMessage:** Correct APIMessage#mentions type (#9) (fe1868b)

# 0.2.0 (2020-09-10)

### Bug Fixes

- **Readme:** add missing semicolon (#1) (5e3e101)

## 0.1.1 (2020-08-22)

### Bug Fixes

- set target version to ES2020 (767a833)
