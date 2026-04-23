RESTJSONErrorCodes | API | discord-api-types documentation

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
- RESTJSONErrorCodes

Version: Next

On this page

# RESTJSONErrorCodes

<dl><dt>**@see**</dt>
<dd>

https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-json-error-codes

</dd></dl>

## Index [__](#Index)

### Enumeration Members

- [__AccessToFileUploadsHasBeenLimitedForThisGuild](#AccessToFileUploadsHasBeenLimitedForThisGuild)
- [__ActionCannotBePerformedDueToSlowmodeRateLimit](#ActionCannotBePerformedDueToSlowmodeRateLimit)
- [__AnEntitlementHasAlreadyBeenGrantedForThisResource](#AnEntitlementHasAlreadyBeenGrantedForThisResource)
- [__AnnouncementEditLimitExceeded](#AnnouncementEditLimitExceeded)
- [__APIResourceOverloaded](#APIResourceOverloaded)
- [__ApplicationCommandWithThatNameAlreadyExists](#ApplicationCommandWithThatNameAlreadyExists)
- [__ApplicationInteractionFailedToSend](#ApplicationInteractionFailedToSend)
- [__ApplicationNotYetAvailable](#ApplicationNotYetAvailable)
- [__BitrateIsTooHighForChannelOfThisType](#BitrateIsTooHighForChannelOfThisType)
- [__BotsCannotUseThisEndpoint](#BotsCannotUseThisEndpoint)
- [__CannotConvertBetweenPremiumEmojiAndNormalEmoji](#CannotConvertBetweenPremiumEmojiAndNormalEmoji)
- [__CannotDeleteChannelRequiredForCommunityGuilds](#CannotDeleteChannelRequiredForCommunityGuilds)
- [__CannotDeleteGuildSubscriptionIntegration](#CannotDeleteGuildSubscriptionIntegration)
- [__CannotEditAPollMessage](#CannotEditAPollMessage)
- [__CannotEditMessageAuthoredByAnotherUser](#CannotEditMessageAuthoredByAnotherUser)
- [__CannotEditStickersWithinMessage](#CannotEditStickersWithinMessage)
- [__CannotEnableOnboardingRequirementsAreNotMet](#CannotEnableOnboardingRequirementsAreNotMet)
- [__CannotExecuteActionOnDMChannel](#CannotExecuteActionOnDMChannel)
- [__CannotExecuteActionOnSystemMessage](#CannotExecuteActionOnSystemMessage)
- [__CannotExecuteActionOnThisChannelType](#CannotExecuteActionOnThisChannelType)
- [__CannotExpireANonPollMessage](#CannotExpireANonPollMessage)
- [__CannotMixSubscriptionAndNonSubscriptionRolesForAnEmoji](#CannotMixSubscriptionAndNonSubscriptionRolesForAnEmoji)
- [__CannotModifyASystemWebhook](#CannotModifyASystemWebhook)
- [__CannotReplyWithoutPermissionToReadMessageHistory](#CannotReplyWithoutPermissionToReadMessageHistory)
- [__CannotSelfRedeemThisGift](#CannotSelfRedeemThisGift)
- [__CannotSendAMessageInAForumChannel](#CannotSendAMessageInAForumChannel)
- [__CannotSendAnEmptyMessage](#CannotSendAnEmptyMessage)
- [__CannotSendMessagesInNonTextChannel](#CannotSendMessagesInNonTextChannel)
- [__CannotSendMessagesToThisUser](#CannotSendMessagesToThisUser)
- [__CannotSendMessagesToThisUserDueToHavingNoMutualGuilds](#CannotSendMessagesToThisUserDueToHavingNoMutualGuilds)
- [__CannotUpdateAFinishedEvent](#CannotUpdateAFinishedEvent)
- [__CannotUpdateOnboardingWhileBelowRequirements](#CannotUpdateOnboardingWhileBelowRequirements)
- [__CannotUseAnEmojiIncludedWithThePoll](#CannotUseAnEmojiIncludedWithThePoll)
- [__ChannelSendRateLimit](#ChannelSendRateLimit)
- [__ChannelVerificationLevelTooHighForYouToGainAccess](#ChannelVerificationLevelTooHighForYouToGainAccess)
- [__CloudflareIsBlockingYourRequest](#CloudflareIsBlockingYourRequest)
- [__CommunityServerChannelsMustBeTextChannels](#CommunityServerChannelsMustBeTextChannels)
- [__ConnectionHasBeenRevoked](#ConnectionHasBeenRevoked)
- [__ExplicitContentCannotBeSentToTheDesiredRecipient](#ExplicitContentCannotBeSentToTheDesiredRecipient)
- [__FailedToBanUsers](#FailedToBanUsers)
- [__FailedToCreateStageNeededForStageEvent](#FailedToCreateStageNeededForStageEvent)
- [__FailedToGenerateUniqueUsername](#FailedToGenerateUniqueUsername)
- [__FailedToResizeAssetBelowTheMaximumSize](#FailedToResizeAssetBelowTheMaximumSize)
- [__FailedToResizeAssetBelowTheMinimumSize](#FailedToResizeAssetBelowTheMinimumSize)
- [__FeatureTemporarilyDisabledServerSide](#FeatureTemporarilyDisabledServerSide)
- [__FileUploadedExceedsMaximumSize](#FileUploadedExceedsMaximumSize)
- [__GeneralError](#GeneralError)
- [__GuildAlreadyHasTemplate](#GuildAlreadyHasTemplate)
- [__GuildPremiumSubscriptionLevelTooLow](#GuildPremiumSubscriptionLevelTooLow)
- [__GuildWidgetDisabled](#GuildWidgetDisabled)
- [__IdTokenJWTAudienceMismatch](#IdTokenJWTAudienceMismatch)
- [__IdTokenJWTExpired](#IdTokenJWTExpired)
- [__IdTokenJWTIssuedTooLongAgo](#IdTokenJWTIssuedTooLongAgo)
- [__IdTokenJWTIssuerMismatch](#IdTokenJWTIssuerMismatch)
- [__IndexNotYetAvailable](#IndexNotYetAvailable)
- [__InteractionHasAlreadyBeenAcknowledged](#InteractionHasAlreadyBeenAcknowledged)
- [__InvalidAccountType](#InvalidAccountType)
- [__InvalidActionOnArchivedThread](#InvalidActionOnArchivedThread)
- [__InvalidActivityAction](#InvalidActivityAction)
- [__InvalidAPIVersion](#InvalidAPIVersion)
- [__InvalidChannelTypeForPollCreation](#InvalidChannelTypeForPollCreation)
- [__InvalidClientSecret](#InvalidClientSecret)
- [__InvalidFileUploaded](#InvalidFileUploaded)
- [__InvalidFormBodyOrContentType](#InvalidFormBodyOrContentType)
- [__InvalidGuild](#InvalidGuild)
- [__InvalidJSONForUploadedLottieFile](#InvalidJSONForUploadedLottieFile)
- [__InvalidMessageType](#InvalidMessageType)
- [__InvalidMFALevel](#InvalidMFALevel)
- [__InvalidOAuth2AccessToken](#InvalidOAuth2AccessToken)
- [__InvalidOAuth2State](#InvalidOAuth2State)
- [__InvalidRecipients](#InvalidRecipients)
- [__InvalidRequestOrigin](#InvalidRequestOrigin)
- [__InvalidRole](#InvalidRole)
- [__InvalidSKU](#InvalidSKU)
- [__InvalidStickerSent](#InvalidStickerSent)
- [__InvalidThreadNotificationSettings](#InvalidThreadNotificationSettings)
- [__InvalidToken](#InvalidToken)
- [__InvalidWebhookToken](#InvalidWebhookToken)
- [__InviteAcceptedToGuildWithoutTheBotBeingIn](#InviteAcceptedToGuildWithoutTheBotBeingIn)
- [__InviteCodeInvalidOrTaken](#InviteCodeInvalidOrTaken)
- [__LottieAnimationMaximumDimensionsExceeded](#LottieAnimationMaximumDimensionsExceeded)
- [__MaximumActiveAnnouncementThreads](#MaximumActiveAnnouncementThreads)
- [__MaximumActiveThreads](#MaximumActiveThreads)
- [__MaximumDailyApplicationCommandCreatesReached](#MaximumDailyApplicationCommandCreatesReached)
- [__MaximumNumberOfAnimatedEmojisReached](#MaximumNumberOfAnimatedEmojisReached)
- [__MaximumNumberOfApplicationCommandsReached](#MaximumNumberOfApplicationCommandsReached)
- [__MaximumNumberOfAttachmentsInAMessageReached](#MaximumNumberOfAttachmentsInAMessageReached)
- [__MaximumNumberOfBanFetchesHasBeenReached](#MaximumNumberOfBanFetchesHasBeenReached)
- [__MaximumNumberOfChannelPermissionOverwritesReached](#MaximumNumberOfChannelPermissionOverwritesReached)
- [__MaximumNumberOfEditsToMessagesOlderThanOneHourReached](#MaximumNumberOfEditsToMessagesOlderThanOneHourReached)
- [__MaximumNumberOfEmojisReached](#MaximumNumberOfEmojisReached)
- [__MaximumNumberOfFriendsReached](#MaximumNumberOfFriendsReached)
- [__MaximumNumberOfGroupDMsReached](#MaximumNumberOfGroupDMsReached)
- [__MaximumNumberOfGuildChannelsReached](#MaximumNumberOfGuildChannelsReached)
- [__MaximumNumberOfGuildRolesReached](#MaximumNumberOfGuildRolesReached)
- [__MaximumNumberOfGuildsReached](#MaximumNumberOfGuildsReached)
- [__MaximumNumberOfGuildWidgetSettingsUpdatesHasBeenReached](#MaximumNumberOfGuildWidgetSettingsUpdatesHasBeenReached)
- [__MaximumNumberOfInvitesReached](#MaximumNumberOfInvitesReached)
- [__MaximumNumberOfNonGuildMemberBansHasBeenExceeded](#MaximumNumberOfNonGuildMemberBansHasBeenExceeded)
- [__MaximumNumberOfPinnedThreadsInForumHasBeenReached](#MaximumNumberOfPinnedThreadsInForumHasBeenReached)
- [__MaximumNumberOfPinsReachedForTheChannel](#MaximumNumberOfPinsReachedForTheChannel)
- [__MaximumNumberOfPremiumEmojisReached](#MaximumNumberOfPremiumEmojisReached)
- [__MaximumNumberOfPruneRequestsHasBeenReached](#MaximumNumberOfPruneRequestsHasBeenReached)
- [__MaximumNumberOfReactionsReached](#MaximumNumberOfReactionsReached)
- [__MaximumNumberOfRecipientsReached](#MaximumNumberOfRecipientsReached)
- [__MaximumNumberOfServerCategoriesReached](#MaximumNumberOfServerCategoriesReached)
- [__MaximumNumberOfServerMembersReached](#MaximumNumberOfServerMembersReached)
- [__MaximumNumberOfSoundboardSoundsReached](#MaximumNumberOfSoundboardSoundsReached)
- [__MaximumNumberOfStickersReached](#MaximumNumberOfStickersReached)
- [__MaximumNumberOfTagsInForumHasBeenReached](#MaximumNumberOfTagsInForumHasBeenReached)
- [__MaximumNumberOfUncompletedGuildScheduledEventsReached](#MaximumNumberOfUncompletedGuildScheduledEventsReached)
- [__MaximumNumberOfWebhooksPerGuildReached](#MaximumNumberOfWebhooksPerGuildReached)
- [__MaximumNumberOfWebhooksReached](#MaximumNumberOfWebhooksReached)
- [__MaximumThreadParticipantsReached](#MaximumThreadParticipantsReached)
- [__MessageBlockedByHarmfulLinksFilter](#MessageBlockedByHarmfulLinksFilter)
- [__MessageCanOnlyBePinnedInTheChannelItWasSentIn](#MessageCanOnlyBePinnedInTheChannelItWasSentIn)
- [__MessageWasBlockedByAutomaticModeration](#MessageWasBlockedByAutomaticModeration)
- [__MissingAccess](#MissingAccess)
- [__MissingPermissions](#MissingPermissions)
- [__MissingRequiredOAuth2Scope](#MissingRequiredOAuth2Scope)
- [__NotAuthorizedToPerformThisActionOnThisApplication](#NotAuthorizedToPerformThisActionOnThisApplication)
- [__NoteWasTooLong](#NoteWasTooLong)
- [__NoUsersWithDiscordTagExist](#NoUsersWithDiscordTagExist)
- [__OAuth2ApplicationDoesNotHaveBot](#OAuth2ApplicationDoesNotHaveBot)
- [__OAuth2ApplicationLimitReached](#OAuth2ApplicationLimitReached)
- [__OneOfTheMessagesProvidedWasTooOldForBulkDelete](#OneOfTheMessagesProvidedWasTooOldForBulkDelete)
- [__OnlyBotsCanUseThisEndpoint](#OnlyBotsCanUseThisEndpoint)
- [__OnlyConsumableSKUsCanBeConsumed](#OnlyConsumableSKUsCanBeConsumed)
- [__OnlyTheOwnerOfThisAccountCanPerformThisAction](#OnlyTheOwnerOfThisAccountCanPerformThisAction)
- [__OpeningDirectMessagesTooFast](#OpeningDirectMessagesTooFast)
- [__OwnerCannotBePendingMember](#OwnerCannotBePendingMember)
- [__OwnershipCannotBeMovedToABotUser](#OwnershipCannotBeMovedToABotUser)
- [__ParameterEarlierThanCreation](#ParameterEarlierThanCreation)
- [__PaymentSourceRequiredToRedeemGift](#PaymentSourceRequiredToRedeemGift)
- [__PollExpired](#PollExpired)
- [__PollVotingBlocked](#PollVotingBlocked)
- [__ProvidedFileDoesNotHaveAValidDuration](#ProvidedFileDoesNotHaveAValidDuration)
- [__ProvidedFileDurationExceedsMaximumLength](#ProvidedFileDurationExceedsMaximumLength)
- [__ProvidedFileIsInvalid](#ProvidedFileIsInvalid)
- [__ProvidedFileTypeIsInvalid](#ProvidedFileTypeIsInvalid)
- [__ProvidedTooFewOrTooManyMessagesToDelete](#ProvidedTooFewOrTooManyMessagesToDelete)
- [__ProvisionalAccountsPermissionNotGranted](#ProvisionalAccountsPermissionNotGranted)
- [__ReactionWasBlocked](#ReactionWasBlocked)
- [__RequestBodyContainsInvalidJSON](#RequestBodyContainsInvalidJSON)
- [__RequestEntityTooLarge](#RequestEntityTooLarge)
- [__SendMessagesHasBeenTemporarilyDisabled](#SendMessagesHasBeenTemporarilyDisabled)
- [__ServerNeedsMonetizationEnabledToPerformThisAction](#ServerNeedsMonetizationEnabledToPerformThisAction)
- [__ServerNeedsMoreBoostsToPerformThisAction](#ServerNeedsMoreBoostsToPerformThisAction)
- [__ServerNotAvailableInYourLocation](#ServerNotAvailableInYourLocation)
- [__ServerSendRateLimit](#ServerSendRateLimit)
- [__ServiceResourceIsBeingRateLimited](#ServiceResourceIsBeingRateLimited)
- [__SpecifiedEmojiIsInvalid](#SpecifiedEmojiIsInvalid)
- [__StageTopicServerNameServerDescriptionOrChannelNamesContainDisallowedWords](#StageTopicServerNameServerDescriptionOrChannelNamesContainDisallowedWords)
- [__StickerAnimationDurationExceedsMaximumOf5Seconds](#StickerAnimationDurationExceedsMaximumOf5Seconds)
- [__StickerFrameCountExceedsMaximumOf1000Frames](#StickerFrameCountExceedsMaximumOf1000Frames)
- [__StickerFramerateIsTooSmallOrTooLarge](#StickerFramerateIsTooSmallOrTooLarge)
- [__StickerMaximumFramerateExceeded](#StickerMaximumFramerateExceeded)
- [__TagNamesMustBeUnique](#TagNamesMustBeUnique)
- [__TagRequiredToCreateAForumPostInThisChannel](#TagRequiredToCreateAForumPostInThisChannel)
- [__TargetUserIsNotConnectedToVoice](#TargetUserIsNotConnectedToVoice)
- [__TheChannelsForThisGuildAreTooLarge](#TheChannelsForThisGuildAreTooLarge)
- [__TheEntityTypeOfTheEventIsDifferentFromTheEntityYouAreTryingToStartTheEventFor](#TheEntityTypeOfTheEventIsDifferentFromTheEntityYouAreTryingToStartTheEventFor)
- [__TheMazeIsntMeantForYou](#TheMazeIsntMeantForYou)
- [__ThereAreNoTagsAvailableThatCanBeSetByNonModerators](#ThereAreNoTagsAvailableThatCanBeSetByNonModerators)
- [__TheStageIsAlreadyOpen](#TheStageIsAlreadyOpen)
- [__TheUserAccountMustFirstBeVerified](#TheUserAccountMustFirstBeVerified)
- [__ThisInteractionHasHitTheMaximumNumberOfFollowUpMessages](#ThisInteractionHasHitTheMaximumNumberOfFollowUpMessages)
- [__ThisMessageWasAlreadyCrossposted](#ThisMessageWasAlreadyCrossposted)
- [__ThreadAlreadyCreatedForMessage](#ThreadAlreadyCreatedForMessage)
- [__ThreadLocked](#ThreadLocked)
- [__TitleWasBlockedByAutomaticModeration](#TitleWasBlockedByAutomaticModeration)
- [__TwoFactorAuthenticationIsRequired](#TwoFactorAuthenticationIsRequired)
- [__Unauthorized](#Unauthorized)
- [__UnderMinimumAge](#UnderMinimumAge)
- [__UnknownAccount](#UnknownAccount)
- [__UnknownApplication](#UnknownApplication)
- [__UnknownApplicationCommand](#UnknownApplicationCommand)
- [__UnknownApplicationCommandPermissions](#UnknownApplicationCommandPermissions)
- [__UnknownAsset](#UnknownAsset)
- [__UnknownBan](#UnknownBan)
- [__UnknownBranch](#UnknownBranch)
- [__UnknownBuild](#UnknownBuild)
- [__UnknownChannel](#UnknownChannel)
- [__UnknownDiscoverableServerCategory](#UnknownDiscoverableServerCategory)
- [__UnknownEmoji](#UnknownEmoji)
- [__UnknownEntitlement](#UnknownEntitlement)
- [__UnknownGiftCode](#UnknownGiftCode)
- [__UnknownGuild](#UnknownGuild)
- [__UnknownGuildMemberVerificationForm](#UnknownGuildMemberVerificationForm)
- [__UnknownGuildScheduledEvent](#UnknownGuildScheduledEvent)
- [__UnknownGuildScheduledEventUser](#UnknownGuildScheduledEventUser)
- [__UnknownGuildTemplate](#UnknownGuildTemplate)
- [__UnknownGuildWelcomeScreen](#UnknownGuildWelcomeScreen)
- [__UnknownIntegration](#UnknownIntegration)
- [__UnknownInteraction](#UnknownInteraction)
- [__UnknownInvite](#UnknownInvite)
- [__UnknownLobby](#UnknownLobby)
- [__UnknownMember](#UnknownMember)
- [__UnknownMessage](#UnknownMessage)
- [__UnknownPermissionOverwrite](#UnknownPermissionOverwrite)
- [__UnknownPremiumServerSubscribeCooldown](#UnknownPremiumServerSubscribeCooldown)
- [__UnknownProvider](#UnknownProvider)
- [__UnknownRedistributable](#UnknownRedistributable)
- [__UnknownRole](#UnknownRole)
- [__UnknownSession](#UnknownSession)
- [__UnknownSKU](#UnknownSKU)
- [__UnknownSound](#UnknownSound)
- [__UnknownStageInstance](#UnknownStageInstance)
- [__UnknownSticker](#UnknownSticker)
- [__UnknownStickerPack](#UnknownStickerPack)
- [__UnknownStoreDirectoryLayout](#UnknownStoreDirectoryLayout)
- [__UnknownStoreListing](#UnknownStoreListing)
- [__UnknownStream](#UnknownStream)
- [__UnknownTag](#UnknownTag)
- [__UnknownToken](#UnknownToken)
- [__UnknownUser](#UnknownUser)
- [__UnknownVoiceState](#UnknownVoiceState)
- [__UnknownWebhook](#UnknownWebhook)
- [__UnknownWebhookService](#UnknownWebhookService)
- [__UploadedFileNotFound](#UploadedFileNotFound)
- [__UploadedLottiesCannotContainRasterizedImages](#UploadedLottiesCannotContainRasterizedImages)
- [__UserBannedFromThisGuild](#UserBannedFromThisGuild)
- [__UserCannotUseBurstReactions](#UserCannotUseBurstReactions)
- [__VerifyYourAccount](#VerifyYourAccount)
- [__VoiceMessagesCannotBeEdited](#VoiceMessagesCannotBeEdited)
- [__VoiceMessagesDoNotSupportAdditionalContent](#VoiceMessagesDoNotSupportAdditionalContent)
- [__VoiceMessagesMustHaveASingleAudioAttachment](#VoiceMessagesMustHaveASingleAudioAttachment)
- [__VoiceMessagesMustHaveSupportingMetadata](#VoiceMessagesMustHaveSupportingMetadata)
- [__WebhooksCanOnlyCreateThreadsInForumChannels](#WebhooksCanOnlyCreateThreadsInForumChannels)
- [__WebhookServicesCannotBeUsedInForumChannels](#WebhookServicesCannotBeUsedInForumChannels)
- [__WebhooksPostedToForumChannelsCannotHaveBothAThreadNameAndThreadId](#WebhooksPostedToForumChannelsCannotHaveBothAThreadNameAndThreadId)
- [__WebhooksPostedToForumChannelsMustHaveAThreadNameOrThreadId](#WebhooksPostedToForumChannelsMustHaveAThreadNameOrThreadId)
- [__YouCannotSendVoiceMessagesInThisChannel](#YouCannotSendVoiceMessagesInThisChannel)
- [__YouCanOnlyDeleteSandboxEntitlements](#YouCanOnlyDeleteSandboxEntitlements)
- [__YouDoNotHavePermissionToSendThisSticker](#YouDoNotHavePermissionToSendThisSticker)

## Enumeration Members [__](#Enumeration Members)

### [__](#AccessToFileUploadsHasBeenLimitedForThisGuild) __AccessToFileUploadsHasBeenLimitedForThisGuild

__AccessToFileUploadsHasBeenLimitedForThisGuild: 400001

### [__](#ActionCannotBePerformedDueToSlowmodeRateLimit) __ActionCannotBePerformedDueToSlowmodeRateLimit

__ActionCannotBePerformedDueToSlowmodeRateLimit: 20016

### [__](#AnEntitlementHasAlreadyBeenGrantedForThisResource) __AnEntitlementHasAlreadyBeenGrantedForThisResource

__AnEntitlementHasAlreadyBeenGrantedForThisResource: 40074

### [__](#AnnouncementEditLimitExceeded) __AnnouncementEditLimitExceeded

__AnnouncementEditLimitExceeded: 20022

### [__](#APIResourceOverloaded) __APIResourceOverloaded

__APIResourceOverloaded: 130000

### [__](#ApplicationCommandWithThatNameAlreadyExists) __ApplicationCommandWithThatNameAlreadyExists

__ApplicationCommandWithThatNameAlreadyExists: 40041

### [__](#ApplicationInteractionFailedToSend) __ApplicationInteractionFailedToSend

__ApplicationInteractionFailedToSend: 40043

### [__](#ApplicationNotYetAvailable) __ApplicationNotYetAvailable

__ApplicationNotYetAvailable: 110001

### [__](#BitrateIsTooHighForChannelOfThisType) __BitrateIsTooHighForChannelOfThisType

__BitrateIsTooHighForChannelOfThisType: 30052

### [__](#BotsCannotUseThisEndpoint) __BotsCannotUseThisEndpoint

__BotsCannotUseThisEndpoint: 20001

### [__](#CannotConvertBetweenPremiumEmojiAndNormalEmoji) __CannotConvertBetweenPremiumEmojiAndNormalEmoji

__CannotConvertBetweenPremiumEmojiAndNormalEmoji: 50145

### [__](#CannotDeleteChannelRequiredForCommunityGuilds) __CannotDeleteChannelRequiredForCommunityGuilds

__CannotDeleteChannelRequiredForCommunityGuilds: 50074

### [__](#CannotDeleteGuildSubscriptionIntegration) __CannotDeleteGuildSubscriptionIntegration

__CannotDeleteGuildSubscriptionIntegration: 50163

### [__](#CannotEditAPollMessage) __CannotEditAPollMessage

__CannotEditAPollMessage: 520003

### [__](#CannotEditMessageAuthoredByAnotherUser) __CannotEditMessageAuthoredByAnotherUser

__CannotEditMessageAuthoredByAnotherUser: 50005

### [__](#CannotEditStickersWithinMessage) __CannotEditStickersWithinMessage

__CannotEditStickersWithinMessage: 50080

### [__](#CannotEnableOnboardingRequirementsAreNotMet) __CannotEnableOnboardingRequirementsAreNotMet

__CannotEnableOnboardingRequirementsAreNotMet: 350000

### [__](#CannotExecuteActionOnDMChannel) __CannotExecuteActionOnDMChannel

__CannotExecuteActionOnDMChannel: 50003

### [__](#CannotExecuteActionOnSystemMessage) __CannotExecuteActionOnSystemMessage

__CannotExecuteActionOnSystemMessage: 50021

### [__](#CannotExecuteActionOnThisChannelType) __CannotExecuteActionOnThisChannelType

__CannotExecuteActionOnThisChannelType: 50024

### [__](#CannotExpireANonPollMessage) __CannotExpireANonPollMessage

__CannotExpireANonPollMessage: 520006

### [__](#CannotMixSubscriptionAndNonSubscriptionRolesForAnEmoji) __CannotMixSubscriptionAndNonSubscriptionRolesForAnEmoji

__CannotMixSubscriptionAndNonSubscriptionRolesForAnEmoji: 50144

### [__](#CannotModifyASystemWebhook) __CannotModifyASystemWebhook

__CannotModifyASystemWebhook: 50073

### [__](#CannotReplyWithoutPermissionToReadMessageHistory) __CannotReplyWithoutPermissionToReadMessageHistory

__CannotReplyWithoutPermissionToReadMessageHistory: 160002

### [__](#CannotSelfRedeemThisGift) __CannotSelfRedeemThisGift

__CannotSelfRedeemThisGift: 50054

### [__](#CannotSendAMessageInAForumChannel) __CannotSendAMessageInAForumChannel

__CannotSendAMessageInAForumChannel: 40058

### [__](#CannotSendAnEmptyMessage) __CannotSendAnEmptyMessage

__CannotSendAnEmptyMessage: 50006

### [__](#CannotSendMessagesInNonTextChannel) __CannotSendMessagesInNonTextChannel

__CannotSendMessagesInNonTextChannel: 50008

### [__](#CannotSendMessagesToThisUser) __CannotSendMessagesToThisUser

__CannotSendMessagesToThisUser: 50007

<dl><dt>**@see**</dt>
<dd>

RESTJSONErrorCodes.CannotSendMessagesToThisUserDueToHavingNoMutualGuilds for a similar error code

</dd></dl>

### [__](#CannotSendMessagesToThisUserDueToHavingNoMutualGuilds) __CannotSendMessagesToThisUserDueToHavingNoMutualGuilds

__CannotSendMessagesToThisUserDueToHavingNoMutualGuilds: 50278

<dl><dt>**@see**</dt>
<dd>

RESTJSONErrorCodes.CannotSendMessagesToThisUser for a similar error code

</dd></dl>

### [__](#CannotUpdateAFinishedEvent) __CannotUpdateAFinishedEvent

__CannotUpdateAFinishedEvent: 180000

### [__](#CannotUpdateOnboardingWhileBelowRequirements) __CannotUpdateOnboardingWhileBelowRequirements

__CannotUpdateOnboardingWhileBelowRequirements: 350001

### [__](#CannotUseAnEmojiIncludedWithThePoll) __CannotUseAnEmojiIncludedWithThePoll

__CannotUseAnEmojiIncludedWithThePoll: 520004

### [__](#ChannelSendRateLimit) __ChannelSendRateLimit

__ChannelSendRateLimit: 20028

### [__](#ChannelVerificationLevelTooHighForYouToGainAccess) __ChannelVerificationLevelTooHighForYouToGainAccess

__ChannelVerificationLevelTooHighForYouToGainAccess: 50009

### [__](#CloudflareIsBlockingYourRequest) __CloudflareIsBlockingYourRequest

__CloudflareIsBlockingYourRequest: 40333

### [__](#CommunityServerChannelsMustBeTextChannels) __CommunityServerChannelsMustBeTextChannels

__CommunityServerChannelsMustBeTextChannels: 50086

### [__](#ConnectionHasBeenRevoked) __ConnectionHasBeenRevoked

__ConnectionHasBeenRevoked: 40012

### [__](#ExplicitContentCannotBeSentToTheDesiredRecipient) __ExplicitContentCannotBeSentToTheDesiredRecipient

__ExplicitContentCannotBeSentToTheDesiredRecipient: 20009

### [__](#FailedToBanUsers) __FailedToBanUsers

__FailedToBanUsers: 500000

### [__](#FailedToCreateStageNeededForStageEvent) __FailedToCreateStageNeededForStageEvent

__FailedToCreateStageNeededForStageEvent: 180002

### [__](#FailedToGenerateUniqueUsername) __FailedToGenerateUniqueUsername

__FailedToGenerateUniqueUsername: 530006

### [__](#FailedToResizeAssetBelowTheMaximumSize) __FailedToResizeAssetBelowTheMaximumSize

__FailedToResizeAssetBelowTheMaximumSize: 50138

### [__](#FailedToResizeAssetBelowTheMinimumSize) __FailedToResizeAssetBelowTheMinimumSize

__FailedToResizeAssetBelowTheMinimumSize: 50138

<dl><dt>**@deprecated**</dt>
<dd>

This name is incorrect. Use RESTJSONErrorCodes.FailedToResizeAssetBelowTheMaximumSize instead

</dd></dl>

### [__](#FeatureTemporarilyDisabledServerSide) __FeatureTemporarilyDisabledServerSide

__FeatureTemporarilyDisabledServerSide: 40006

### [__](#FileUploadedExceedsMaximumSize) __FileUploadedExceedsMaximumSize

__FileUploadedExceedsMaximumSize: 50045

### [__](#GeneralError) __GeneralError

__GeneralError: 0

### [__](#GuildAlreadyHasTemplate) __GuildAlreadyHasTemplate

__GuildAlreadyHasTemplate: 30031

### [__](#GuildPremiumSubscriptionLevelTooLow) __GuildPremiumSubscriptionLevelTooLow

__GuildPremiumSubscriptionLevelTooLow: 20035

### [__](#GuildWidgetDisabled) __GuildWidgetDisabled

__GuildWidgetDisabled: 50004

### [__](#IdTokenJWTAudienceMismatch) __IdTokenJWTAudienceMismatch

__IdTokenJWTAudienceMismatch: 530003

### [__](#IdTokenJWTExpired) __IdTokenJWTExpired

__IdTokenJWTExpired: 530001

### [__](#IdTokenJWTIssuedTooLongAgo) __IdTokenJWTIssuedTooLongAgo

__IdTokenJWTIssuedTooLongAgo: 530004

### [__](#IdTokenJWTIssuerMismatch) __IdTokenJWTIssuerMismatch

__IdTokenJWTIssuerMismatch: 530002

### [__](#IndexNotYetAvailable) __IndexNotYetAvailable

__IndexNotYetAvailable: 110000

### [__](#InteractionHasAlreadyBeenAcknowledged) __InteractionHasAlreadyBeenAcknowledged

__InteractionHasAlreadyBeenAcknowledged: 40060

### [__](#InvalidAccountType) __InvalidAccountType

__InvalidAccountType: 50002

### [__](#InvalidActionOnArchivedThread) __InvalidActionOnArchivedThread

__InvalidActionOnArchivedThread: 50083

### [__](#InvalidActivityAction) __InvalidActivityAction

__InvalidActivityAction: 50039

### [__](#InvalidAPIVersion) __InvalidAPIVersion

__InvalidAPIVersion: 50041

### [__](#InvalidChannelTypeForPollCreation) __InvalidChannelTypeForPollCreation

__InvalidChannelTypeForPollCreation: 520002

### [__](#InvalidClientSecret) __InvalidClientSecret

__InvalidClientSecret: 530007

### [__](#InvalidFileUploaded) __InvalidFileUploaded

__InvalidFileUploaded: 50046

### [__](#InvalidFormBodyOrContentType) __InvalidFormBodyOrContentType

__InvalidFormBodyOrContentType: 50035

### [__](#InvalidGuild) __InvalidGuild

__InvalidGuild: 50055

### [__](#InvalidJSONForUploadedLottieFile) __InvalidJSONForUploadedLottieFile

__InvalidJSONForUploadedLottieFile: 170001

### [__](#InvalidMessageType) __InvalidMessageType

__InvalidMessageType: 50068

### [__](#InvalidMFALevel) __InvalidMFALevel

__InvalidMFALevel: 50017

### [__](#InvalidOAuth2AccessToken) __InvalidOAuth2AccessToken

__InvalidOAuth2AccessToken: 50025

### [__](#InvalidOAuth2State) __InvalidOAuth2State

__InvalidOAuth2State: 50012

### [__](#InvalidRecipients) __InvalidRecipients

__InvalidRecipients: 50033

### [__](#InvalidRequestOrigin) __InvalidRequestOrigin

__InvalidRequestOrigin: 50067

### [__](#InvalidRole) __InvalidRole

__InvalidRole: 50028

### [__](#InvalidSKU) __InvalidSKU

__InvalidSKU: 50057

### [__](#InvalidStickerSent) __InvalidStickerSent

__InvalidStickerSent: 50081

### [__](#InvalidThreadNotificationSettings) __InvalidThreadNotificationSettings

__InvalidThreadNotificationSettings: 50084

### [__](#InvalidToken) __InvalidToken

__InvalidToken: 50014

### [__](#InvalidWebhookToken) __InvalidWebhookToken

__InvalidWebhookToken: 50027

### [__](#InviteAcceptedToGuildWithoutTheBotBeingIn) __InviteAcceptedToGuildWithoutTheBotBeingIn

__InviteAcceptedToGuildWithoutTheBotBeingIn: 50036

### [__](#InviteCodeInvalidOrTaken) __InviteCodeInvalidOrTaken

__InviteCodeInvalidOrTaken: 50020

### [__](#LottieAnimationMaximumDimensionsExceeded) __LottieAnimationMaximumDimensionsExceeded

__LottieAnimationMaximumDimensionsExceeded: 170005

### [__](#MaximumActiveAnnouncementThreads) __MaximumActiveAnnouncementThreads

__MaximumActiveAnnouncementThreads: 160007

### [__](#MaximumActiveThreads) __MaximumActiveThreads

__MaximumActiveThreads: 160006

### [__](#MaximumDailyApplicationCommandCreatesReached) __MaximumDailyApplicationCommandCreatesReached

__MaximumDailyApplicationCommandCreatesReached: 30034

### [__](#MaximumNumberOfAnimatedEmojisReached) __MaximumNumberOfAnimatedEmojisReached

__MaximumNumberOfAnimatedEmojisReached: 30018

### [__](#MaximumNumberOfApplicationCommandsReached) __MaximumNumberOfApplicationCommandsReached

__MaximumNumberOfApplicationCommandsReached: 30032

### [__](#MaximumNumberOfAttachmentsInAMessageReached) __MaximumNumberOfAttachmentsInAMessageReached

__MaximumNumberOfAttachmentsInAMessageReached: 30015

### [__](#MaximumNumberOfBanFetchesHasBeenReached) __MaximumNumberOfBanFetchesHasBeenReached

__MaximumNumberOfBanFetchesHasBeenReached: 30037

### [__](#MaximumNumberOfChannelPermissionOverwritesReached) __MaximumNumberOfChannelPermissionOverwritesReached

__MaximumNumberOfChannelPermissionOverwritesReached: 30060

### [__](#MaximumNumberOfEditsToMessagesOlderThanOneHourReached) __MaximumNumberOfEditsToMessagesOlderThanOneHourReached

__MaximumNumberOfEditsToMessagesOlderThanOneHourReached: 30046

### [__](#MaximumNumberOfEmojisReached) __MaximumNumberOfEmojisReached

__MaximumNumberOfEmojisReached: 30008

### [__](#MaximumNumberOfFriendsReached) __MaximumNumberOfFriendsReached

__MaximumNumberOfFriendsReached: 30002

### [__](#MaximumNumberOfGroupDMsReached) __MaximumNumberOfGroupDMsReached

__MaximumNumberOfGroupDMsReached: 30011

### [__](#MaximumNumberOfGuildChannelsReached) __MaximumNumberOfGuildChannelsReached

__MaximumNumberOfGuildChannelsReached: 30013

### [__](#MaximumNumberOfGuildRolesReached) __MaximumNumberOfGuildRolesReached

__MaximumNumberOfGuildRolesReached: 30005

### [__](#MaximumNumberOfGuildsReached) __MaximumNumberOfGuildsReached

__MaximumNumberOfGuildsReached: 30001

### [__](#MaximumNumberOfGuildWidgetSettingsUpdatesHasBeenReached) __MaximumNumberOfGuildWidgetSettingsUpdatesHasBeenReached

__MaximumNumberOfGuildWidgetSettingsUpdatesHasBeenReached: 30042

### [__](#MaximumNumberOfInvitesReached) __MaximumNumberOfInvitesReached

__MaximumNumberOfInvitesReached: 30016

### [__](#MaximumNumberOfNonGuildMemberBansHasBeenExceeded) __MaximumNumberOfNonGuildMemberBansHasBeenExceeded

__MaximumNumberOfNonGuildMemberBansHasBeenExceeded: 30035

### [__](#MaximumNumberOfPinnedThreadsInForumHasBeenReached) __MaximumNumberOfPinnedThreadsInForumHasBeenReached

__MaximumNumberOfPinnedThreadsInForumHasBeenReached: 30047

### [__](#MaximumNumberOfPinsReachedForTheChannel) __MaximumNumberOfPinsReachedForTheChannel

__MaximumNumberOfPinsReachedForTheChannel: 30003

### [__](#MaximumNumberOfPremiumEmojisReached) __MaximumNumberOfPremiumEmojisReached

__MaximumNumberOfPremiumEmojisReached: 30056

### [__](#MaximumNumberOfPruneRequestsHasBeenReached) __MaximumNumberOfPruneRequestsHasBeenReached

__MaximumNumberOfPruneRequestsHasBeenReached: 30040

### [__](#MaximumNumberOfReactionsReached) __MaximumNumberOfReactionsReached

__MaximumNumberOfReactionsReached: 30010

### [__](#MaximumNumberOfRecipientsReached) __MaximumNumberOfRecipientsReached

__MaximumNumberOfRecipientsReached: 30004

### [__](#MaximumNumberOfServerCategoriesReached) __MaximumNumberOfServerCategoriesReached

__MaximumNumberOfServerCategoriesReached: 30030

### [__](#MaximumNumberOfServerMembersReached) __MaximumNumberOfServerMembersReached

__MaximumNumberOfServerMembersReached: 30019

### [__](#MaximumNumberOfSoundboardSoundsReached) __MaximumNumberOfSoundboardSoundsReached

__MaximumNumberOfSoundboardSoundsReached: 30045

### [__](#MaximumNumberOfStickersReached) __MaximumNumberOfStickersReached

__MaximumNumberOfStickersReached: 30039

### [__](#MaximumNumberOfTagsInForumHasBeenReached) __MaximumNumberOfTagsInForumHasBeenReached

__MaximumNumberOfTagsInForumHasBeenReached: 30048

### [__](#MaximumNumberOfUncompletedGuildScheduledEventsReached) __MaximumNumberOfUncompletedGuildScheduledEventsReached

__MaximumNumberOfUncompletedGuildScheduledEventsReached: 30038

### [__](#MaximumNumberOfWebhooksPerGuildReached) __MaximumNumberOfWebhooksPerGuildReached

__MaximumNumberOfWebhooksPerGuildReached: 30058

### [__](#MaximumNumberOfWebhooksReached) __MaximumNumberOfWebhooksReached

__MaximumNumberOfWebhooksReached: 30007

### [__](#MaximumThreadParticipantsReached) __MaximumThreadParticipantsReached

__MaximumThreadParticipantsReached: 30033

### [__](#MessageBlockedByHarmfulLinksFilter) __MessageBlockedByHarmfulLinksFilter

__MessageBlockedByHarmfulLinksFilter: 240000

### [__](#MessageCanOnlyBePinnedInTheChannelItWasSentIn) __MessageCanOnlyBePinnedInTheChannelItWasSentIn

__MessageCanOnlyBePinnedInTheChannelItWasSentIn: 50019

### [__](#MessageWasBlockedByAutomaticModeration) __MessageWasBlockedByAutomaticModeration

__MessageWasBlockedByAutomaticModeration: 200000

### [__](#MissingAccess) __MissingAccess

__MissingAccess: 50001

### [__](#MissingPermissions) __MissingPermissions

__MissingPermissions: 50013

### [__](#MissingRequiredOAuth2Scope) __MissingRequiredOAuth2Scope

__MissingRequiredOAuth2Scope: 50026

### [__](#NotAuthorizedToPerformThisActionOnThisApplication) __NotAuthorizedToPerformThisActionOnThisApplication

__NotAuthorizedToPerformThisActionOnThisApplication: 20012

### [__](#NoteWasTooLong) __NoteWasTooLong

__NoteWasTooLong: 50015

### [__](#NoUsersWithDiscordTagExist) __NoUsersWithDiscordTagExist

__NoUsersWithDiscordTagExist: 80004

### [__](#OAuth2ApplicationDoesNotHaveBot) __OAuth2ApplicationDoesNotHaveBot

__OAuth2ApplicationDoesNotHaveBot: 50010

### [__](#OAuth2ApplicationLimitReached) __OAuth2ApplicationLimitReached

__OAuth2ApplicationLimitReached: 50011

### [__](#OneOfTheMessagesProvidedWasTooOldForBulkDelete) __OneOfTheMessagesProvidedWasTooOldForBulkDelete

__OneOfTheMessagesProvidedWasTooOldForBulkDelete: 50034

### [__](#OnlyBotsCanUseThisEndpoint) __OnlyBotsCanUseThisEndpoint

__OnlyBotsCanUseThisEndpoint: 20002

### [__](#OnlyConsumableSKUsCanBeConsumed) __OnlyConsumableSKUsCanBeConsumed

__OnlyConsumableSKUsCanBeConsumed: 40018

### [__](#OnlyTheOwnerOfThisAccountCanPerformThisAction) __OnlyTheOwnerOfThisAccountCanPerformThisAction

__OnlyTheOwnerOfThisAccountCanPerformThisAction: 20018

### [__](#OpeningDirectMessagesTooFast) __OpeningDirectMessagesTooFast

__OpeningDirectMessagesTooFast: 40003

### [__](#OwnerCannotBePendingMember) __OwnerCannotBePendingMember

__OwnerCannotBePendingMember: 50131

### [__](#OwnershipCannotBeMovedToABotUser) __OwnershipCannotBeMovedToABotUser

__OwnershipCannotBeMovedToABotUser: 50132

### [__](#ParameterEarlierThanCreation) __ParameterEarlierThanCreation

__ParameterEarlierThanCreation: 50085

### [__](#PaymentSourceRequiredToRedeemGift) __PaymentSourceRequiredToRedeemGift

__PaymentSourceRequiredToRedeemGift: 50070

### [__](#PollExpired) __PollExpired

__PollExpired: 520001

### [__](#PollVotingBlocked) __PollVotingBlocked

__PollVotingBlocked: 520000

### [__](#ProvidedFileDoesNotHaveAValidDuration) __ProvidedFileDoesNotHaveAValidDuration

__ProvidedFileDoesNotHaveAValidDuration: 50192

### [__](#ProvidedFileDurationExceedsMaximumLength) __ProvidedFileDurationExceedsMaximumLength

__ProvidedFileDurationExceedsMaximumLength: 50124

### [__](#ProvidedFileIsInvalid) __ProvidedFileIsInvalid

__ProvidedFileIsInvalid: 50110

### [__](#ProvidedFileTypeIsInvalid) __ProvidedFileTypeIsInvalid

__ProvidedFileTypeIsInvalid: 50123

### [__](#ProvidedTooFewOrTooManyMessagesToDelete) __ProvidedTooFewOrTooManyMessagesToDelete

__ProvidedTooFewOrTooManyMessagesToDelete: 50016

### [__](#ProvisionalAccountsPermissionNotGranted) __ProvisionalAccountsPermissionNotGranted

__ProvisionalAccountsPermissionNotGranted: 530000

### [__](#ReactionWasBlocked) __ReactionWasBlocked

__ReactionWasBlocked: 90001

### [__](#RequestBodyContainsInvalidJSON) __RequestBodyContainsInvalidJSON

__RequestBodyContainsInvalidJSON: 50109

### [__](#RequestEntityTooLarge) __RequestEntityTooLarge

__RequestEntityTooLarge: 40005

### [__](#SendMessagesHasBeenTemporarilyDisabled) __SendMessagesHasBeenTemporarilyDisabled

__SendMessagesHasBeenTemporarilyDisabled: 40004

### [__](#ServerNeedsMonetizationEnabledToPerformThisAction) __ServerNeedsMonetizationEnabledToPerformThisAction

__ServerNeedsMonetizationEnabledToPerformThisAction: 50097

### [__](#ServerNeedsMoreBoostsToPerformThisAction) __ServerNeedsMoreBoostsToPerformThisAction

__ServerNeedsMoreBoostsToPerformThisAction: 50101

### [__](#ServerNotAvailableInYourLocation) __ServerNotAvailableInYourLocation

__ServerNotAvailableInYourLocation: 50095

### [__](#ServerSendRateLimit) __ServerSendRateLimit

__ServerSendRateLimit: 20029

### [__](#ServiceResourceIsBeingRateLimited) __ServiceResourceIsBeingRateLimited

__ServiceResourceIsBeingRateLimited: 40062

### [__](#SpecifiedEmojiIsInvalid) __SpecifiedEmojiIsInvalid

__SpecifiedEmojiIsInvalid: 50151

### [__](#StageTopicServerNameServerDescriptionOrChannelNamesContainDisallowedWords) __StageTopicServerNameServerDescriptionOrChannelNamesContainDisallowedWords

__StageTopicServerNameServerDescriptionOrChannelNamesContainDisallowedWords: 20031

### [__](#StickerAnimationDurationExceedsMaximumOf5Seconds) __StickerAnimationDurationExceedsMaximumOf5Seconds

__StickerAnimationDurationExceedsMaximumOf5Seconds: 170007

### [__](#StickerFrameCountExceedsMaximumOf1000Frames) __StickerFrameCountExceedsMaximumOf1000Frames

__StickerFrameCountExceedsMaximumOf1000Frames: 170004

### [__](#StickerFramerateIsTooSmallOrTooLarge) __StickerFramerateIsTooSmallOrTooLarge

__StickerFramerateIsTooSmallOrTooLarge: 170006

### [__](#StickerMaximumFramerateExceeded) __StickerMaximumFramerateExceeded

__StickerMaximumFramerateExceeded: 170003

### [__](#TagNamesMustBeUnique) __TagNamesMustBeUnique

__TagNamesMustBeUnique: 40061

### [__](#TagRequiredToCreateAForumPostInThisChannel) __TagRequiredToCreateAForumPostInThisChannel

__TagRequiredToCreateAForumPostInThisChannel: 40067

### [__](#TargetUserIsNotConnectedToVoice) __TargetUserIsNotConnectedToVoice

__TargetUserIsNotConnectedToVoice: 40032

### [__](#TheChannelsForThisGuildAreTooLarge) __TheChannelsForThisGuildAreTooLarge

__TheChannelsForThisGuildAreTooLarge: 30061

### [__](#TheEntityTypeOfTheEventIsDifferentFromTheEntityYouAreTryingToStartTheEventFor) __TheEntityTypeOfTheEventIsDifferentFromTheEntityYouAreTryingToStartTheEventFor

__TheEntityTypeOfTheEventIsDifferentFromTheEntityYouAreTryingToStartTheEventFor: 50091

### [__](#TheMazeIsntMeantForYou) __TheMazeIsntMeantForYou

__TheMazeIsntMeantForYou: 20017

### [__](#ThereAreNoTagsAvailableThatCanBeSetByNonModerators) __ThereAreNoTagsAvailableThatCanBeSetByNonModerators

__ThereAreNoTagsAvailableThatCanBeSetByNonModerators: 40066

### [__](#TheStageIsAlreadyOpen) __TheStageIsAlreadyOpen

__TheStageIsAlreadyOpen: 150006

### [__](#TheUserAccountMustFirstBeVerified) __TheUserAccountMustFirstBeVerified

__TheUserAccountMustFirstBeVerified: 50178

### [__](#ThisInteractionHasHitTheMaximumNumberOfFollowUpMessages) __ThisInteractionHasHitTheMaximumNumberOfFollowUpMessages

__ThisInteractionHasHitTheMaximumNumberOfFollowUpMessages: 40094

### [__](#ThisMessageWasAlreadyCrossposted) __ThisMessageWasAlreadyCrossposted

__ThisMessageWasAlreadyCrossposted: 40033

### [__](#ThreadAlreadyCreatedForMessage) __ThreadAlreadyCreatedForMessage

__ThreadAlreadyCreatedForMessage: 160004

### [__](#ThreadLocked) __ThreadLocked

__ThreadLocked: 160005

### [__](#TitleWasBlockedByAutomaticModeration) __TitleWasBlockedByAutomaticModeration

__TitleWasBlockedByAutomaticModeration: 200001

### [__](#TwoFactorAuthenticationIsRequired) __TwoFactorAuthenticationIsRequired

__TwoFactorAuthenticationIsRequired: 60003

### [__](#Unauthorized) __Unauthorized

__Unauthorized: 40001

### [__](#UnderMinimumAge) __UnderMinimumAge

__UnderMinimumAge: 20024

### [__](#UnknownAccount) __UnknownAccount

__UnknownAccount: 10001

### [__](#UnknownApplication) __UnknownApplication

__UnknownApplication: 10002

### [__](#UnknownApplicationCommand) __UnknownApplicationCommand

__UnknownApplicationCommand: 10063

### [__](#UnknownApplicationCommandPermissions) __UnknownApplicationCommandPermissions

__UnknownApplicationCommandPermissions: 10066

### [__](#UnknownAsset) __UnknownAsset

__UnknownAsset: 10021

### [__](#UnknownBan) __UnknownBan

__UnknownBan: 10026

### [__](#UnknownBranch) __UnknownBranch

__UnknownBranch: 10032

### [__](#UnknownBuild) __UnknownBuild

__UnknownBuild: 10030

### [__](#UnknownChannel) __UnknownChannel

__UnknownChannel: 10003

### [__](#UnknownDiscoverableServerCategory) __UnknownDiscoverableServerCategory

__UnknownDiscoverableServerCategory: 10059

### [__](#UnknownEmoji) __UnknownEmoji

__UnknownEmoji: 10014

### [__](#UnknownEntitlement) __UnknownEntitlement

__UnknownEntitlement: 10029

### [__](#UnknownGiftCode) __UnknownGiftCode

__UnknownGiftCode: 10038

### [__](#UnknownGuild) __UnknownGuild

__UnknownGuild: 10004

### [__](#UnknownGuildMemberVerificationForm) __UnknownGuildMemberVerificationForm

__UnknownGuildMemberVerificationForm: 10068

### [__](#UnknownGuildScheduledEvent) __UnknownGuildScheduledEvent

__UnknownGuildScheduledEvent: 10070

### [__](#UnknownGuildScheduledEventUser) __UnknownGuildScheduledEventUser

__UnknownGuildScheduledEventUser: 10071

### [__](#UnknownGuildTemplate) __UnknownGuildTemplate

__UnknownGuildTemplate: 10057

### [__](#UnknownGuildWelcomeScreen) __UnknownGuildWelcomeScreen

__UnknownGuildWelcomeScreen: 10069

### [__](#UnknownIntegration) __UnknownIntegration

__UnknownIntegration: 10005

### [__](#UnknownInteraction) __UnknownInteraction

__UnknownInteraction: 10062

### [__](#UnknownInvite) __UnknownInvite

__UnknownInvite: 10006

### [__](#UnknownLobby) __UnknownLobby

__UnknownLobby: 10031

### [__](#UnknownMember) __UnknownMember

__UnknownMember: 10007

### [__](#UnknownMessage) __UnknownMessage

__UnknownMessage: 10008

### [__](#UnknownPermissionOverwrite) __UnknownPermissionOverwrite

__UnknownPermissionOverwrite: 10009

### [__](#UnknownPremiumServerSubscribeCooldown) __UnknownPremiumServerSubscribeCooldown

__UnknownPremiumServerSubscribeCooldown: 10050

### [__](#UnknownProvider) __UnknownProvider

__UnknownProvider: 10010

### [__](#UnknownRedistributable) __UnknownRedistributable

__UnknownRedistributable: 10036

### [__](#UnknownRole) __UnknownRole

__UnknownRole: 10011

### [__](#UnknownSession) __UnknownSession

__UnknownSession: 10020

### [__](#UnknownSKU) __UnknownSKU

__UnknownSKU: 10027

### [__](#UnknownSound) __UnknownSound

__UnknownSound: 10097

### [__](#UnknownStageInstance) __UnknownStageInstance

__UnknownStageInstance: 10067

### [__](#UnknownSticker) __UnknownSticker

__UnknownSticker: 10060

### [__](#UnknownStickerPack) __UnknownStickerPack

__UnknownStickerPack: 10061

### [__](#UnknownStoreDirectoryLayout) __UnknownStoreDirectoryLayout

__UnknownStoreDirectoryLayout: 10033

### [__](#UnknownStoreListing) __UnknownStoreListing

__UnknownStoreListing: 10028

### [__](#UnknownStream) __UnknownStream

__UnknownStream: 10049

### [__](#UnknownTag) __UnknownTag

__UnknownTag: 10087

### [__](#UnknownToken) __UnknownToken

__UnknownToken: 10012

### [__](#UnknownUser) __UnknownUser

__UnknownUser: 10013

### [__](#UnknownVoiceState) __UnknownVoiceState

__UnknownVoiceState: 10065

### [__](#UnknownWebhook) __UnknownWebhook

__UnknownWebhook: 10015

### [__](#UnknownWebhookService) __UnknownWebhookService

__UnknownWebhookService: 10016

### [__](#UploadedFileNotFound) __UploadedFileNotFound

__UploadedFileNotFound: 50146

### [__](#UploadedLottiesCannotContainRasterizedImages) __UploadedLottiesCannotContainRasterizedImages

__UploadedLottiesCannotContainRasterizedImages: 170002

### [__](#UserBannedFromThisGuild) __UserBannedFromThisGuild

__UserBannedFromThisGuild: 40007

### [__](#UserCannotUseBurstReactions) __UserCannotUseBurstReactions

__UserCannotUseBurstReactions: 90002

### [__](#VerifyYourAccount) __VerifyYourAccount

__VerifyYourAccount: 40002

### [__](#VoiceMessagesCannotBeEdited) __VoiceMessagesCannotBeEdited

__VoiceMessagesCannotBeEdited: 50162

### [__](#VoiceMessagesDoNotSupportAdditionalContent) __VoiceMessagesDoNotSupportAdditionalContent

__VoiceMessagesDoNotSupportAdditionalContent: 50159

### [__](#VoiceMessagesMustHaveASingleAudioAttachment) __VoiceMessagesMustHaveASingleAudioAttachment

__VoiceMessagesMustHaveASingleAudioAttachment: 50160

### [__](#VoiceMessagesMustHaveSupportingMetadata) __VoiceMessagesMustHaveSupportingMetadata

__VoiceMessagesMustHaveSupportingMetadata: 50161

### [__](#WebhooksCanOnlyCreateThreadsInForumChannels) __WebhooksCanOnlyCreateThreadsInForumChannels

__WebhooksCanOnlyCreateThreadsInForumChannels: 220003

### [__](#WebhookServicesCannotBeUsedInForumChannels) __WebhookServicesCannotBeUsedInForumChannels

__WebhookServicesCannotBeUsedInForumChannels: 220004

### [__](#WebhooksPostedToForumChannelsCannotHaveBothAThreadNameAndThreadId) __WebhooksPostedToForumChannelsCannotHaveBothAThreadNameAndThreadId

__WebhooksPostedToForumChannelsCannotHaveBothAThreadNameAndThreadId: 220002

### [__](#WebhooksPostedToForumChannelsMustHaveAThreadNameOrThreadId) __WebhooksPostedToForumChannelsMustHaveAThreadNameOrThreadId

__WebhooksPostedToForumChannelsMustHaveAThreadNameOrThreadId: 220001

### [__](#YouCannotSendVoiceMessagesInThisChannel) __YouCannotSendVoiceMessagesInThisChannel

__YouCannotSendVoiceMessagesInThisChannel: 50173

### [__](#YouCanOnlyDeleteSandboxEntitlements) __YouCanOnlyDeleteSandboxEntitlements

__YouCanOnlyDeleteSandboxEntitlements: 40019

### [__](#YouDoNotHavePermissionToSendThisSticker) __YouDoNotHavePermissionToSendThisSticker

__YouDoNotHavePermissionToSendThisSticker: 50600

Previous RelationshipType Next RoleFlags

**Page Options**

Hide Inherited

- [__AccessToFileUploadsHasBeenLimitedForThisGuild](#AccessToFileUploadsHasBeenLimitedForThisGuild)
- [__ActionCannotBePerformedDueToSlowmodeRateLimit](#ActionCannotBePerformedDueToSlowmodeRateLimit)
- [__AnEntitlementHasAlreadyBeenGrantedForThisResource](#AnEntitlementHasAlreadyBeenGrantedForThisResource)
- [__AnnouncementEditLimitExceeded](#AnnouncementEditLimitExceeded)
- [__APIResourceOverloaded](#APIResourceOverloaded)
- [__ApplicationCommandWithThatNameAlreadyExists](#ApplicationCommandWithThatNameAlreadyExists)
- [__ApplicationInteractionFailedToSend](#ApplicationInteractionFailedToSend)
- [__ApplicationNotYetAvailable](#ApplicationNotYetAvailable)
- [__BitrateIsTooHighForChannelOfThisType](#BitrateIsTooHighForChannelOfThisType)
- [__BotsCannotUseThisEndpoint](#BotsCannotUseThisEndpoint)
- [__CannotConvertBetweenPremiumEmojiAndNormalEmoji](#CannotConvertBetweenPremiumEmojiAndNormalEmoji)
- [__CannotDeleteChannelRequiredForCommunityGuilds](#CannotDeleteChannelRequiredForCommunityGuilds)
- [__CannotDeleteGuildSubscriptionIntegration](#CannotDeleteGuildSubscriptionIntegration)
- [__CannotEditAPollMessage](#CannotEditAPollMessage)
- [__CannotEditMessageAuthoredByAnotherUser](#CannotEditMessageAuthoredByAnotherUser)
- [__CannotEditStickersWithinMessage](#CannotEditStickersWithinMessage)
- [__CannotEnableOnboardingRequirementsAreNotMet](#CannotEnableOnboardingRequirementsAreNotMet)
- [__CannotExecuteActionOnDMChannel](#CannotExecuteActionOnDMChannel)
- [__CannotExecuteActionOnSystemMessage](#CannotExecuteActionOnSystemMessage)
- [__CannotExecuteActionOnThisChannelType](#CannotExecuteActionOnThisChannelType)
- [__CannotExpireANonPollMessage](#CannotExpireANonPollMessage)
- [__CannotMixSubscriptionAndNonSubscriptionRolesForAnEmoji](#CannotMixSubscriptionAndNonSubscriptionRolesForAnEmoji)
- [__CannotModifyASystemWebhook](#CannotModifyASystemWebhook)
- [__CannotReplyWithoutPermissionToReadMessageHistory](#CannotReplyWithoutPermissionToReadMessageHistory)
- [__CannotSelfRedeemThisGift](#CannotSelfRedeemThisGift)
- [__CannotSendAMessageInAForumChannel](#CannotSendAMessageInAForumChannel)
- [__CannotSendAnEmptyMessage](#CannotSendAnEmptyMessage)
- [__CannotSendMessagesInNonTextChannel](#CannotSendMessagesInNonTextChannel)
- [__CannotSendMessagesToThisUser](#CannotSendMessagesToThisUser)
- [__CannotSendMessagesToThisUserDueToHavingNoMutualGuilds](#CannotSendMessagesToThisUserDueToHavingNoMutualGuilds)
- [__CannotUpdateAFinishedEvent](#CannotUpdateAFinishedEvent)
- [__CannotUpdateOnboardingWhileBelowRequirements](#CannotUpdateOnboardingWhileBelowRequirements)
- [__CannotUseAnEmojiIncludedWithThePoll](#CannotUseAnEmojiIncludedWithThePoll)
- [__ChannelSendRateLimit](#ChannelSendRateLimit)
- [__ChannelVerificationLevelTooHighForYouToGainAccess](#ChannelVerificationLevelTooHighForYouToGainAccess)
- [__CloudflareIsBlockingYourRequest](#CloudflareIsBlockingYourRequest)
- [__CommunityServerChannelsMustBeTextChannels](#CommunityServerChannelsMustBeTextChannels)
- [__ConnectionHasBeenRevoked](#ConnectionHasBeenRevoked)
- [__ExplicitContentCannotBeSentToTheDesiredRecipient](#ExplicitContentCannotBeSentToTheDesiredRecipient)
- [__FailedToBanUsers](#FailedToBanUsers)
- [__FailedToCreateStageNeededForStageEvent](#FailedToCreateStageNeededForStageEvent)
- [__FailedToGenerateUniqueUsername](#FailedToGenerateUniqueUsername)
- [__FailedToResizeAssetBelowTheMaximumSize](#FailedToResizeAssetBelowTheMaximumSize)
- [__FailedToResizeAssetBelowTheMinimumSize](#FailedToResizeAssetBelowTheMinimumSize)
- [__FeatureTemporarilyDisabledServerSide](#FeatureTemporarilyDisabledServerSide)
- [__FileUploadedExceedsMaximumSize](#FileUploadedExceedsMaximumSize)
- [__GeneralError](#GeneralError)
- [__GuildAlreadyHasTemplate](#GuildAlreadyHasTemplate)
- [__GuildPremiumSubscriptionLevelTooLow](#GuildPremiumSubscriptionLevelTooLow)
- [__GuildWidgetDisabled](#GuildWidgetDisabled)
- [__IdTokenJWTAudienceMismatch](#IdTokenJWTAudienceMismatch)
- [__IdTokenJWTExpired](#IdTokenJWTExpired)
- [__IdTokenJWTIssuedTooLongAgo](#IdTokenJWTIssuedTooLongAgo)
- [__IdTokenJWTIssuerMismatch](#IdTokenJWTIssuerMismatch)
- [__IndexNotYetAvailable](#IndexNotYetAvailable)
- [__InteractionHasAlreadyBeenAcknowledged](#InteractionHasAlreadyBeenAcknowledged)
- [__InvalidAccountType](#InvalidAccountType)
- [__InvalidActionOnArchivedThread](#InvalidActionOnArchivedThread)
- [__InvalidActivityAction](#InvalidActivityAction)
- [__InvalidAPIVersion](#InvalidAPIVersion)
- [__InvalidChannelTypeForPollCreation](#InvalidChannelTypeForPollCreation)
- [__InvalidClientSecret](#InvalidClientSecret)
- [__InvalidFileUploaded](#InvalidFileUploaded)
- [__InvalidFormBodyOrContentType](#InvalidFormBodyOrContentType)
- [__InvalidGuild](#InvalidGuild)
- [__InvalidJSONForUploadedLottieFile](#InvalidJSONForUploadedLottieFile)
- [__InvalidMessageType](#InvalidMessageType)
- [__InvalidMFALevel](#InvalidMFALevel)
- [__InvalidOAuth2AccessToken](#InvalidOAuth2AccessToken)
- [__InvalidOAuth2State](#InvalidOAuth2State)
- [__InvalidRecipients](#InvalidRecipients)
- [__InvalidRequestOrigin](#InvalidRequestOrigin)
- [__InvalidRole](#InvalidRole)
- [__InvalidSKU](#InvalidSKU)
- [__InvalidStickerSent](#InvalidStickerSent)
- [__InvalidThreadNotificationSettings](#InvalidThreadNotificationSettings)
- [__InvalidToken](#InvalidToken)
- [__InvalidWebhookToken](#InvalidWebhookToken)
- [__InviteAcceptedToGuildWithoutTheBotBeingIn](#InviteAcceptedToGuildWithoutTheBotBeingIn)
- [__InviteCodeInvalidOrTaken](#InviteCodeInvalidOrTaken)
- [__LottieAnimationMaximumDimensionsExceeded](#LottieAnimationMaximumDimensionsExceeded)
- [__MaximumActiveAnnouncementThreads](#MaximumActiveAnnouncementThreads)
- [__MaximumActiveThreads](#MaximumActiveThreads)
- [__MaximumDailyApplicationCommandCreatesReached](#MaximumDailyApplicationCommandCreatesReached)
- [__MaximumNumberOfAnimatedEmojisReached](#MaximumNumberOfAnimatedEmojisReached)
- [__MaximumNumberOfApplicationCommandsReached](#MaximumNumberOfApplicationCommandsReached)
- [__MaximumNumberOfAttachmentsInAMessageReached](#MaximumNumberOfAttachmentsInAMessageReached)
- [__MaximumNumberOfBanFetchesHasBeenReached](#MaximumNumberOfBanFetchesHasBeenReached)
- [__MaximumNumberOfChannelPermissionOverwritesReached](#MaximumNumberOfChannelPermissionOverwritesReached)
- [__MaximumNumberOfEditsToMessagesOlderThanOneHourReached](#MaximumNumberOfEditsToMessagesOlderThanOneHourReached)
- [__MaximumNumberOfEmojisReached](#MaximumNumberOfEmojisReached)
- [__MaximumNumberOfFriendsReached](#MaximumNumberOfFriendsReached)
- [__MaximumNumberOfGroupDMsReached](#MaximumNumberOfGroupDMsReached)
- [__MaximumNumberOfGuildChannelsReached](#MaximumNumberOfGuildChannelsReached)
- [__MaximumNumberOfGuildRolesReached](#MaximumNumberOfGuildRolesReached)
- [__MaximumNumberOfGuildsReached](#MaximumNumberOfGuildsReached)
- [__MaximumNumberOfGuildWidgetSettingsUpdatesHasBeenReached](#MaximumNumberOfGuildWidgetSettingsUpdatesHasBeenReached)
- [__MaximumNumberOfInvitesReached](#MaximumNumberOfInvitesReached)
- [__MaximumNumberOfNonGuildMemberBansHasBeenExceeded](#MaximumNumberOfNonGuildMemberBansHasBeenExceeded)
- [__MaximumNumberOfPinnedThreadsInForumHasBeenReached](#MaximumNumberOfPinnedThreadsInForumHasBeenReached)
- [__MaximumNumberOfPinsReachedForTheChannel](#MaximumNumberOfPinsReachedForTheChannel)
- [__MaximumNumberOfPremiumEmojisReached](#MaximumNumberOfPremiumEmojisReached)
- [__MaximumNumberOfPruneRequestsHasBeenReached](#MaximumNumberOfPruneRequestsHasBeenReached)
- [__MaximumNumberOfReactionsReached](#MaximumNumberOfReactionsReached)
- [__MaximumNumberOfRecipientsReached](#MaximumNumberOfRecipientsReached)
- [__MaximumNumberOfServerCategoriesReached](#MaximumNumberOfServerCategoriesReached)
- [__MaximumNumberOfServerMembersReached](#MaximumNumberOfServerMembersReached)
- [__MaximumNumberOfSoundboardSoundsReached](#MaximumNumberOfSoundboardSoundsReached)
- [__MaximumNumberOfStickersReached](#MaximumNumberOfStickersReached)
- [__MaximumNumberOfTagsInForumHasBeenReached](#MaximumNumberOfTagsInForumHasBeenReached)
- [__MaximumNumberOfUncompletedGuildScheduledEventsReached](#MaximumNumberOfUncompletedGuildScheduledEventsReached)
- [__MaximumNumberOfWebhooksPerGuildReached](#MaximumNumberOfWebhooksPerGuildReached)
- [__MaximumNumberOfWebhooksReached](#MaximumNumberOfWebhooksReached)
- [__MaximumThreadParticipantsReached](#MaximumThreadParticipantsReached)
- [__MessageBlockedByHarmfulLinksFilter](#MessageBlockedByHarmfulLinksFilter)
- [__MessageCanOnlyBePinnedInTheChannelItWasSentIn](#MessageCanOnlyBePinnedInTheChannelItWasSentIn)
- [__MessageWasBlockedByAutomaticModeration](#MessageWasBlockedByAutomaticModeration)
- [__MissingAccess](#MissingAccess)
- [__MissingPermissions](#MissingPermissions)
- [__MissingRequiredOAuth2Scope](#MissingRequiredOAuth2Scope)
- [__NotAuthorizedToPerformThisActionOnThisApplication](#NotAuthorizedToPerformThisActionOnThisApplication)
- [__NoteWasTooLong](#NoteWasTooLong)
- [__NoUsersWithDiscordTagExist](#NoUsersWithDiscordTagExist)
- [__OAuth2ApplicationDoesNotHaveBot](#OAuth2ApplicationDoesNotHaveBot)
- [__OAuth2ApplicationLimitReached](#OAuth2ApplicationLimitReached)
- [__OneOfTheMessagesProvidedWasTooOldForBulkDelete](#OneOfTheMessagesProvidedWasTooOldForBulkDelete)
- [__OnlyBotsCanUseThisEndpoint](#OnlyBotsCanUseThisEndpoint)
- [__OnlyConsumableSKUsCanBeConsumed](#OnlyConsumableSKUsCanBeConsumed)
- [__OnlyTheOwnerOfThisAccountCanPerformThisAction](#OnlyTheOwnerOfThisAccountCanPerformThisAction)
- [__OpeningDirectMessagesTooFast](#OpeningDirectMessagesTooFast)
- [__OwnerCannotBePendingMember](#OwnerCannotBePendingMember)
- [__OwnershipCannotBeMovedToABotUser](#OwnershipCannotBeMovedToABotUser)
- [__ParameterEarlierThanCreation](#ParameterEarlierThanCreation)
- [__PaymentSourceRequiredToRedeemGift](#PaymentSourceRequiredToRedeemGift)
- [__PollExpired](#PollExpired)
- [__PollVotingBlocked](#PollVotingBlocked)
- [__ProvidedFileDoesNotHaveAValidDuration](#ProvidedFileDoesNotHaveAValidDuration)
- [__ProvidedFileDurationExceedsMaximumLength](#ProvidedFileDurationExceedsMaximumLength)
- [__ProvidedFileIsInvalid](#ProvidedFileIsInvalid)
- [__ProvidedFileTypeIsInvalid](#ProvidedFileTypeIsInvalid)
- [__ProvidedTooFewOrTooManyMessagesToDelete](#ProvidedTooFewOrTooManyMessagesToDelete)
- [__ProvisionalAccountsPermissionNotGranted](#ProvisionalAccountsPermissionNotGranted)
- [__ReactionWasBlocked](#ReactionWasBlocked)
- [__RequestBodyContainsInvalidJSON](#RequestBodyContainsInvalidJSON)
- [__RequestEntityTooLarge](#RequestEntityTooLarge)
- [__SendMessagesHasBeenTemporarilyDisabled](#SendMessagesHasBeenTemporarilyDisabled)
- [__ServerNeedsMonetizationEnabledToPerformThisAction](#ServerNeedsMonetizationEnabledToPerformThisAction)
- [__ServerNeedsMoreBoostsToPerformThisAction](#ServerNeedsMoreBoostsToPerformThisAction)
- [__ServerNotAvailableInYourLocation](#ServerNotAvailableInYourLocation)
- [__ServerSendRateLimit](#ServerSendRateLimit)
- [__ServiceResourceIsBeingRateLimited](#ServiceResourceIsBeingRateLimited)
- [__SpecifiedEmojiIsInvalid](#SpecifiedEmojiIsInvalid)
- [__StageTopicServerNameServerDescriptionOrChannelNamesContainDisallowedWords](#StageTopicServerNameServerDescriptionOrChannelNamesContainDisallowedWords)
- [__StickerAnimationDurationExceedsMaximumOf5Seconds](#StickerAnimationDurationExceedsMaximumOf5Seconds)
- [__StickerFrameCountExceedsMaximumOf1000Frames](#StickerFrameCountExceedsMaximumOf1000Frames)
- [__StickerFramerateIsTooSmallOrTooLarge](#StickerFramerateIsTooSmallOrTooLarge)
- [__StickerMaximumFramerateExceeded](#StickerMaximumFramerateExceeded)
- [__TagNamesMustBeUnique](#TagNamesMustBeUnique)
- [__TagRequiredToCreateAForumPostInThisChannel](#TagRequiredToCreateAForumPostInThisChannel)
- [__TargetUserIsNotConnectedToVoice](#TargetUserIsNotConnectedToVoice)
- [__TheChannelsForThisGuildAreTooLarge](#TheChannelsForThisGuildAreTooLarge)
- [__TheEntityTypeOfTheEventIsDifferentFromTheEntityYouAreTryingToStartTheEventFor](#TheEntityTypeOfTheEventIsDifferentFromTheEntityYouAreTryingToStartTheEventFor)
- [__TheMazeIsntMeantForYou](#TheMazeIsntMeantForYou)
- [__ThereAreNoTagsAvailableThatCanBeSetByNonModerators](#ThereAreNoTagsAvailableThatCanBeSetByNonModerators)
- [__TheStageIsAlreadyOpen](#TheStageIsAlreadyOpen)
- [__TheUserAccountMustFirstBeVerified](#TheUserAccountMustFirstBeVerified)
- [__ThisInteractionHasHitTheMaximumNumberOfFollowUpMessages](#ThisInteractionHasHitTheMaximumNumberOfFollowUpMessages)
- [__ThisMessageWasAlreadyCrossposted](#ThisMessageWasAlreadyCrossposted)
- [__ThreadAlreadyCreatedForMessage](#ThreadAlreadyCreatedForMessage)
- [__ThreadLocked](#ThreadLocked)
- [__TitleWasBlockedByAutomaticModeration](#TitleWasBlockedByAutomaticModeration)
- [__TwoFactorAuthenticationIsRequired](#TwoFactorAuthenticationIsRequired)
- [__Unauthorized](#Unauthorized)
- [__UnderMinimumAge](#UnderMinimumAge)
- [__UnknownAccount](#UnknownAccount)
- [__UnknownApplication](#UnknownApplication)
- [__UnknownApplicationCommand](#UnknownApplicationCommand)
- [__UnknownApplicationCommandPermissions](#UnknownApplicationCommandPermissions)
- [__UnknownAsset](#UnknownAsset)
- [__UnknownBan](#UnknownBan)
- [__UnknownBranch](#UnknownBranch)
- [__UnknownBuild](#UnknownBuild)
- [__UnknownChannel](#UnknownChannel)
- [__UnknownDiscoverableServerCategory](#UnknownDiscoverableServerCategory)
- [__UnknownEmoji](#UnknownEmoji)
- [__UnknownEntitlement](#UnknownEntitlement)
- [__UnknownGiftCode](#UnknownGiftCode)
- [__UnknownGuild](#UnknownGuild)
- [__UnknownGuildMemberVerificationForm](#UnknownGuildMemberVerificationForm)
- [__UnknownGuildScheduledEvent](#UnknownGuildScheduledEvent)
- [__UnknownGuildScheduledEventUser](#UnknownGuildScheduledEventUser)
- [__UnknownGuildTemplate](#UnknownGuildTemplate)
- [__UnknownGuildWelcomeScreen](#UnknownGuildWelcomeScreen)
- [__UnknownIntegration](#UnknownIntegration)
- [__UnknownInteraction](#UnknownInteraction)
- [__UnknownInvite](#UnknownInvite)
- [__UnknownLobby](#UnknownLobby)
- [__UnknownMember](#UnknownMember)
- [__UnknownMessage](#UnknownMessage)
- [__UnknownPermissionOverwrite](#UnknownPermissionOverwrite)
- [__UnknownPremiumServerSubscribeCooldown](#UnknownPremiumServerSubscribeCooldown)
- [__UnknownProvider](#UnknownProvider)
- [__UnknownRedistributable](#UnknownRedistributable)
- [__UnknownRole](#UnknownRole)
- [__UnknownSession](#UnknownSession)
- [__UnknownSKU](#UnknownSKU)
- [__UnknownSound](#UnknownSound)
- [__UnknownStageInstance](#UnknownStageInstance)
- [__UnknownSticker](#UnknownSticker)
- [__UnknownStickerPack](#UnknownStickerPack)
- [__UnknownStoreDirectoryLayout](#UnknownStoreDirectoryLayout)
- [__UnknownStoreListing](#UnknownStoreListing)
- [__UnknownStream](#UnknownStream)
- [__UnknownTag](#UnknownTag)
- [__UnknownToken](#UnknownToken)
- [__UnknownUser](#UnknownUser)
- [__UnknownVoiceState](#UnknownVoiceState)
- [__UnknownWebhook](#UnknownWebhook)
- [__UnknownWebhookService](#UnknownWebhookService)
- [__UploadedFileNotFound](#UploadedFileNotFound)
- [__UploadedLottiesCannotContainRasterizedImages](#UploadedLottiesCannotContainRasterizedImages)
- [__UserBannedFromThisGuild](#UserBannedFromThisGuild)
- [__UserCannotUseBurstReactions](#UserCannotUseBurstReactions)
- [__VerifyYourAccount](#VerifyYourAccount)
- [__VoiceMessagesCannotBeEdited](#VoiceMessagesCannotBeEdited)
- [__VoiceMessagesDoNotSupportAdditionalContent](#VoiceMessagesDoNotSupportAdditionalContent)
- [__VoiceMessagesMustHaveASingleAudioAttachment](#VoiceMessagesMustHaveASingleAudioAttachment)
- [__VoiceMessagesMustHaveSupportingMetadata](#VoiceMessagesMustHaveSupportingMetadata)
- [__WebhooksCanOnlyCreateThreadsInForumChannels](#WebhooksCanOnlyCreateThreadsInForumChannels)
- [__WebhookServicesCannotBeUsedInForumChannels](#WebhookServicesCannotBeUsedInForumChannels)
- [__WebhooksPostedToForumChannelsCannotHaveBothAThreadNameAndThreadId](#WebhooksPostedToForumChannelsCannotHaveBothAThreadNameAndThreadId)
- [__WebhooksPostedToForumChannelsMustHaveAThreadNameOrThreadId](#WebhooksPostedToForumChannelsMustHaveAThreadNameOrThreadId)
- [__YouCannotSendVoiceMessagesInThisChannel](#YouCannotSendVoiceMessagesInThisChannel)
- [__YouCanOnlyDeleteSandboxEntitlements](#YouCanOnlyDeleteSandboxEntitlements)
- [__YouDoNotHavePermissionToSendThisSticker](#YouDoNotHavePermissionToSendThisSticker)

Donate

- GitHub Sponsors
- Ko-fi
- Patreon

Our Platforms

- Discord Server
- GitHub Organization



Copyright  2021 - 2026 The discord.js Community and its contributors.