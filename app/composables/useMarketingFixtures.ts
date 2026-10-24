import type { LoggingEventDetail, ShowcaseCommand, ShowcaseCommandPart } from "~/types/constants";

/**
 * Translated views over the marketing mock fixtures in `~/utils/constants`.
 *
 * The constants stay English so Storybook (which imports them at module scope,
 * outside any i18n runtime) keeps rendering real copy. These composables map
 * over them and swap the human-readable fields for message-catalog values,
 * matched on the fixture `id` so a copy edit never silently breaks the join.
 *
 * Keys are written out literally: `vue-i18n-extract` fails the `i18n:report`
 * gate on any key it cannot resolve statically.
 */

/** Free-text values inside logging-event details, keyed by their English source. */
function useLoggingDetailText() {
	const { ts } = useI18n();

	const labels = computed<Record<string, string>>(() => ({
		"Account Created": ts("marketing.wolfstar.fixtures.label_account_created"),
		"After": ts("marketing.wolfstar.fixtures.label_after"),
		"Before": ts("marketing.wolfstar.fixtures.label_before"),
		"Changes": ts("marketing.wolfstar.fixtures.label_changes"),
		"Channel": ts("marketing.wolfstar.fixtures.label_channel"),
		"Color": ts("marketing.wolfstar.fixtures.label_color"),
		"Content": ts("marketing.wolfstar.fixtures.label_content"),
		"Created By": ts("marketing.wolfstar.fixtures.label_created_by"),
		"Deleted By": ts("marketing.wolfstar.fixtures.label_deleted_by"),
		"Joined At": ts("marketing.wolfstar.fixtures.label_joined_at"),
		"Moderator": ts("marketing.wolfstar.fixtures.label_moderator"),
		"Reason": ts("marketing.wolfstar.fixtures.label_reason"),
		"Role": ts("marketing.wolfstar.fixtures.label_role"),
		"Roles": ts("marketing.wolfstar.fixtures.label_roles"),
		"Type": ts("marketing.wolfstar.fixtures.label_type"),
		"Updated By": ts("marketing.wolfstar.fixtures.label_updated_by"),
		"User": ts("marketing.wolfstar.fixtures.label_user"),
	}));

	/** Only prose is listed — ids, timestamps and channel names stay verbatim. */
	const contents = computed<Record<string, string>>(() => ({
		"Edited message": ts("marketing.wolfstar.fixtures.text_edited_message"),
		"Name changed from #old-general to #general": ts(
			"marketing.wolfstar.fixtures.text_name_changed",
		),
		"Original message": ts("marketing.wolfstar.fixtures.text_original_message"),
		"Permissions updated": ts("marketing.wolfstar.fixtures.text_permissions_updated"),
		"Text Channel": ts("marketing.wolfstar.fixtures.text_text_channel"),
		"This message has been deleted": ts("marketing.wolfstar.fixtures.text_message_deleted"),
		"Warning": ts("marketing.wolfstar.fixtures.text_warning"),
		"spam": ts("marketing.wolfstar.fixtures.text_spam"),
	}));

	return { contents, labels };
}

export function useLoggingEvents() {
	const { ts } = useI18n();
	const { contents, labels } = useLoggingDetailText();

	const copy = computed<Record<string, { action: string; title: string; tooltip: string }>>(
		() => ({
			channel_create: {
				action: ts("marketing.wolfstar.fixtures.channel_create_action"),
				title: ts("marketing.wolfstar.fixtures.channel_create_title"),
				tooltip: ts("marketing.wolfstar.fixtures.channel_create_tooltip"),
			},
			channel_delete: {
				action: ts("marketing.wolfstar.fixtures.channel_delete_action"),
				title: ts("marketing.wolfstar.fixtures.channel_delete_title"),
				tooltip: ts("marketing.wolfstar.fixtures.channel_delete_tooltip"),
			},
			channel_update: {
				action: ts("marketing.wolfstar.fixtures.channel_update_action"),
				title: ts("marketing.wolfstar.fixtures.channel_update_title"),
				tooltip: ts("marketing.wolfstar.fixtures.channel_update_tooltip"),
			},
			member_join: {
				action: ts("marketing.wolfstar.fixtures.member_join_action"),
				title: ts("marketing.wolfstar.fixtures.member_join_title"),
				tooltip: ts("marketing.wolfstar.fixtures.member_join_tooltip"),
			},
			member_leave: {
				action: ts("marketing.wolfstar.fixtures.member_leave_action"),
				title: ts("marketing.wolfstar.fixtures.member_leave_title"),
				tooltip: ts("marketing.wolfstar.fixtures.member_leave_tooltip"),
			},
			message_delete: {
				action: ts("marketing.wolfstar.fixtures.message_delete_action"),
				title: ts("marketing.wolfstar.fixtures.message_delete_title"),
				tooltip: ts("marketing.wolfstar.fixtures.message_delete_tooltip"),
			},
			message_edit: {
				action: ts("marketing.wolfstar.fixtures.message_edit_action"),
				title: ts("marketing.wolfstar.fixtures.message_edit_title"),
				tooltip: ts("marketing.wolfstar.fixtures.message_edit_tooltip"),
			},
			role_create: {
				action: ts("marketing.wolfstar.fixtures.role_create_action"),
				title: ts("marketing.wolfstar.fixtures.role_create_title"),
				tooltip: ts("marketing.wolfstar.fixtures.role_create_tooltip"),
			},
			role_delete: {
				action: ts("marketing.wolfstar.fixtures.role_delete_action"),
				title: ts("marketing.wolfstar.fixtures.role_delete_title"),
				tooltip: ts("marketing.wolfstar.fixtures.role_delete_tooltip"),
			},
			role_update: {
				action: ts("marketing.wolfstar.fixtures.role_update_action"),
				title: ts("marketing.wolfstar.fixtures.role_update_title"),
				tooltip: ts("marketing.wolfstar.fixtures.role_update_tooltip"),
			},
		}),
	);

	return computed<LoggingEventDetail[]>(() =>
		loggingEvents.map((event) => {
			const text = copy.value[event.id];
			return {
				action: text?.action ?? event.action,
				color: event.color,
				details: event.details.map((detail) => ({
					label: labels.value[detail.label] ?? detail.label,
					parts: detail.parts.map((part) =>
						part.type === "text"
							? {
									type: "text" as const,
									content: contents.value[part.content] ?? part.content,
								}
							: part,
					),
				})),
				icon: event.icon,
				id: event.id,
				title: text?.title ?? event.title,
				tooltip: text?.tooltip ?? event.tooltip,
			};
		}),
	);
}

export function useModerationActions() {
	const { ts } = useI18n();

	const names = computed<Record<string, string>>(() => ({
		"Ban": ts("marketing.wolfstar.fixtures.action_ban"),
		"Kick": ts("marketing.wolfstar.fixtures.action_kick"),
		"Mute": ts("marketing.wolfstar.fixtures.action_mute"),
		"Softban": ts("marketing.wolfstar.fixtures.action_softban"),
		"Timeout": ts("marketing.wolfstar.fixtures.action_timeout"),
		"Voice Kick": ts("marketing.wolfstar.fixtures.action_voice_kick"),
		"Voice Mute": ts("marketing.wolfstar.fixtures.action_voice_mute"),
		"Warning": ts("marketing.wolfstar.fixtures.action_warning"),
	}));

	return computed(() =>
		Object.values(ModerationActions).map((action) => ({
			color: action.color,
			name: names.value[action.name] ?? action.name,
			temporary: action.temporary,
			undo: action.undo,
		})),
	);
}

export function useShowcaseCommands() {
	const { ts } = useI18n();
	const { contents, labels } = useLoggingDetailText();

	const copy = computed<Record<string, { description: string; tooltip: string }>>(() => ({
		ban: {
			description: ts("marketing.wolfstar.fixtures.cmd_ban_description"),
			tooltip: ts("marketing.wolfstar.fixtures.cmd_ban_tooltip"),
		},
		case_archive: {
			description: ts("marketing.wolfstar.fixtures.cmd_case_archive_description"),
			tooltip: ts("marketing.wolfstar.fixtures.cmd_case_archive_tooltip"),
		},
		case_delete: {
			description: ts("marketing.wolfstar.fixtures.cmd_case_delete_description"),
			tooltip: ts("marketing.wolfstar.fixtures.cmd_case_delete_tooltip"),
		},
		case_edit: {
			description: ts("marketing.wolfstar.fixtures.cmd_case_edit_description"),
			tooltip: ts("marketing.wolfstar.fixtures.cmd_case_edit_tooltip"),
		},
		case_list: {
			description: ts("marketing.wolfstar.fixtures.cmd_case_list_description"),
			tooltip: ts("marketing.wolfstar.fixtures.cmd_case_list_tooltip"),
		},
		case_view: {
			description: ts("marketing.wolfstar.fixtures.cmd_case_view_description"),
			tooltip: ts("marketing.wolfstar.fixtures.cmd_case_view_tooltip"),
		},
		kick: {
			description: ts("marketing.wolfstar.fixtures.cmd_kick_description"),
			tooltip: ts("marketing.wolfstar.fixtures.cmd_kick_tooltip"),
		},
		mute: {
			description: ts("marketing.wolfstar.fixtures.cmd_mute_description"),
			tooltip: ts("marketing.wolfstar.fixtures.cmd_mute_tooltip"),
		},
		settings_export: {
			description: ts("marketing.wolfstar.fixtures.cmd_settings_export_description"),
			tooltip: ts("marketing.wolfstar.fixtures.cmd_settings_export_tooltip"),
		},
		settings_menu: {
			description: ts("marketing.wolfstar.fixtures.cmd_settings_menu_description"),
			tooltip: ts("marketing.wolfstar.fixtures.cmd_settings_menu_tooltip"),
		},
		slowmode: {
			description: ts("marketing.wolfstar.fixtures.cmd_slowmode_description"),
			tooltip: ts("marketing.wolfstar.fixtures.cmd_slowmode_tooltip"),
		},
		timeout: {
			description: ts("marketing.wolfstar.fixtures.cmd_timeout_description"),
			tooltip: ts("marketing.wolfstar.fixtures.cmd_timeout_tooltip"),
		},
		warn: {
			description: ts("marketing.wolfstar.fixtures.cmd_warn_description"),
			tooltip: ts("marketing.wolfstar.fixtures.cmd_warn_tooltip"),
		},
	}));

	/** Plain bot replies, keyed by fixture id so the numbers stay translatable. */
	const responses = computed<Record<string, string>>(() => ({
		case_archive: ts("marketing.wolfstar.fixtures.reply_case_archived", { id: 3 }),
		case_delete: ts("marketing.wolfstar.fixtures.reply_case_deleted", { id: 3 }),
		case_edit: ts("marketing.wolfstar.fixtures.reply_case_edited", { id: 3 }),
		case_list: ts("marketing.wolfstar.fixtures.reply_no_cases"),
		settings_export: ts("marketing.wolfstar.fixtures.reply_settings_exported", {
			rules: 3,
			settings: 52,
		}),
		slowmode: ts("marketing.wolfstar.fixtures.reply_slowmode_set", {
			duration: ts("marketing.wolfstar.fixtures.value_ten_seconds"),
		}),
	}));

	/** The moderation actions' reasons, keyed by fixture id. */
	const reasons = computed<Record<string, string>>(() => ({
		ban: ts("marketing.wolfstar.fixtures.reason_repeated_infractions"),
		kick: ts("marketing.wolfstar.fixtures.reason_ignoring_warnings"),
		mute: ts("marketing.wolfstar.fixtures.reason_excessive_noise"),
		timeout: ts("marketing.wolfstar.fixtures.reason_flooding"),
		warn: contents.value.spam ?? "spam",
	}));

	/** Text and embed parts share the same shape; translated in one place. */
	function translateParts(parts: ShowcaseCommandPart[]): ShowcaseCommandPart[] {
		return parts.map((part) =>
			part.type === "text"
				? { type: "text" as const, content: contents.value[part.content] ?? part.content }
				: part,
		);
	}

	return computed<ShowcaseCommand[]>(() =>
		showcaseCommands.map((command) => {
			const text = copy.value[command.id];
			const base = Object.assign({}, command, {
				description: text?.description ?? command.description,
				tooltip: text?.tooltip ?? command.tooltip,
			});

			switch (base.responseType) {
				case "text": {
					return Object.assign({}, base, {
						content: responses.value[base.id] ?? base.content,
					});
				}
				case "moderation": {
					return Object.assign({}, base, {
						reason: reasons.value[base.id] ?? base.reason,
					});
				}
				case "embed": {
					return Object.assign({}, base, {
						embedFooter: ts("marketing.wolfstar.fixtures.embed_case", { id: 3 }),
						embedLines: base.embedLines.map((line) => ({
							label: labels.value[line.label] ?? line.label,
							parts: translateParts(line.parts),
						})),
					});
				}
				default: {
					return Object.assign({}, base, {
						expires: ts("marketing.wolfstar.fixtures.menu_expires", {
							time: ts("marketing.wolfstar.fixtures.value_in_fifteen_minutes"),
						}),
						expiresTime: ts("marketing.wolfstar.fixtures.value_in_fifteen_minutes"),
						heading: ts("marketing.wolfstar.fixtures.menu_heading"),
						intro: ts("marketing.wolfstar.fixtures.menu_intro", {
							guild: "WolfStar HQ",
						}),
						resetDescription: ts("marketing.wolfstar.fixtures.menu_reset_description"),
						resetLabel: ts("marketing.wolfstar.fixtures.button_reset"),
						resetTitle: ts("marketing.wolfstar.fixtures.menu_reset_title"),
						rows: [
							{
								code: "en-US",
								label: ts("marketing.wolfstar.fixtures.menu_language"),
								value: "English (United States)",
							},
							{
								code: "UTC",
								label: ts("marketing.wolfstar.fixtures.menu_time_zone"),
							},
							{
								label: ts("marketing.wolfstar.fixtures.menu_updates_channel"),
								value: ts("marketing.wolfstar.fixtures.value_not_set"),
							},
						],
						selectPlaceholder: ts("marketing.wolfstar.fixtures.select_placeholder"),
					});
				}
			}
		}),
	);
}
