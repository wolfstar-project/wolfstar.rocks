<template>
	<UModal
		v-model:open="open"
		:title="ts('guild_settings.command_permissions.preview_title')"
		:description="ts('guild_settings.command_permissions.preview_description')"
	>
		<template #body>
			<UAlert
				color="neutral"
				variant="subtle"
				icon="ic:round-info"
				:description="ts('guild_settings.command_permissions.administrator_note')"
				class="mb-4"
			/>
			<ul class="space-y-4">
				<li v-for="entry in described" :key="entry.commandId">
					<p class="text-sm font-semibold">
						{{ entry.title }}
						<span v-if="!entry.appDefault" class="font-normal text-muted">
							·
							{{
								entry.usesDefault
									? ts("guild_settings.command_permissions.status_default")
									: ts("guild_settings.command_permissions.status_custom")
							}}
						</span>
					</p>
					<dl
						class="mt-1 grid gap-x-3 gap-y-0.5 text-[0.8125rem] sm:grid-cols-[max-content_1fr]"
					>
						<template v-for="group in entry.groups" :key="group.key">
							<dt class="text-muted">{{ group.label }}</dt>
							<dd>{{ group.rows.join(", ") }}</dd>
						</template>
					</dl>
				</li>
			</ul>
		</template>
		<template #footer>
			<div class="flex w-full flex-wrap items-center justify-end gap-2">
				<span
					v-if="progress"
					class="mr-auto text-[0.8125rem] text-muted"
					aria-live="polite"
				>
					{{ progress }}
				</span>
				<UButton variant="ghost" color="neutral" :disabled="sending" @click="open = false">
					{{ ts("guild_settings.command_permissions.keep_editing") }}
				</UButton>
				<UButton data-send icon="ic:round-send" :loading="sending" @click="emit('send')">
					{{ ts("guild_settings.command_permissions.send") }}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { DeepReadonly } from "@sapphire/utilities";
import {
	allChannelsId,
	diffOverwrites,
	everyoneId,
	usesAppDefault,
	type Overwrite,
} from "#shared/utils/command-permissions";
import { ApplicationCommandPermissionType } from "discord-api-types/v10";

export interface PreviewEntry {
	commandId: string;
	title: string;
	before: readonly Overwrite[];
	after: readonly Overwrite[];
	/** The app default has no status of its own: every other command may use it. */
	appDefault?: boolean;
}

const {
	entries,
	guild,
	sending = false,
	progress,
} = defineProps<{
	entries: readonly PreviewEntry[];
	guild:
		| DeepReadonly<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>
		| undefined;
	sending?: boolean;
	progress?: string;
}>();

const open = defineModel<boolean>("open", { required: true });
const emit = defineEmits<{ send: [] }>();

const { ts } = useI18n();

function describeRow(row: Overwrite): string {
	const guildId = guild?.id ?? "";
	const side = row.permission
		? ts("guild_settings.command_permissions.allow")
		: ts("guild_settings.command_permissions.deny");
	let name: string;
	if (row.type === ApplicationCommandPermissionType.Role) {
		name =
			row.id === everyoneId(guildId)
				? "@everyone"
				: (guild?.roles.find((role) => role.id === row.id)?.name ?? row.id);
	} else if (row.type === ApplicationCommandPermissionType.User) {
		name = ts("guild_settings.command_permissions.member", { id: row.id });
	} else if (row.id === allChannelsId(guildId)) {
		name = ts("guild_settings.command_permissions.all_channels");
	} else {
		const channel = guild?.channels.find((entry) => entry.id === row.id)?.name;
		name = channel ? `#${channel}` : row.id;
	}
	return `${name} (${side})`;
}

const described = computed(() =>
	entries.map((entry) => {
		const diff = diffOverwrites(entry.before, entry.after);
		const groups = [
			{
				key: "added",
				label: ts("guild_settings.command_permissions.added"),
				rows: diff.added,
			},
			{
				key: "removed",
				label: ts("guild_settings.command_permissions.removed"),
				rows: diff.removed,
			},
			{
				key: "flipped",
				label: ts("guild_settings.command_permissions.flipped"),
				rows: diff.flipped,
			},
		]
			.filter((group) => group.rows.length > 0)
			.map((group) => ({
				key: group.key,
				label: group.label,
				rows: group.rows.map(describeRow),
			}));
		return {
			commandId: entry.commandId,
			title: entry.title,
			appDefault: entry.appDefault ?? false,
			usesDefault: usesAppDefault(entry.after),
			groups,
		};
	}),
);
</script>
