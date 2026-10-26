<template>
	<div class="flex min-w-0 flex-col gap-1">
		<p :id="labelId" class="text-[0.9375rem]">{{ label }}</p>
		<p v-if="description" class="text-[0.8125rem] text-muted">{{ description }}</p>
		<div
			class="mt-1.5 flex flex-wrap items-center gap-2"
			role="group"
			:aria-labelledby="labelId"
		>
			<span v-if="ids.length === 0" class="text-[0.8125rem] text-muted">
				{{ emptyLabel ?? ts("select.nothing_chosen") }}
			</span>
			<span v-for="id in ids" :key="id" class="member-picker-chip">
				<template v-if="known.get(id)">
					<UAvatar
						:src="avatarOf(known.get(id)!)"
						:alt="''"
						size="3xs"
						class="shrink-0"
					/>
					{{ nameOf(known.get(id)!) }}
				</template>
				<template v-else-if="resolving">
					<span class="font-mono text-xs">{{ id }}</span>
				</template>
				<template v-else>
					<span class="font-mono text-xs">{{ id }}</span>
					<span class="text-xs font-normal text-muted">
						{{ ts("guild_member_picker.not_in_server") }}
					</span>
				</template>
				<button
					type="button"
					class="member-picker-remove"
					:data-remove="id"
					:disabled
					:aria-label="ts('select.remove_option', { name: chipName(id) })"
					@click="remove(id)"
				>
					<UIcon name="ic:round-close" class="size-3.5" aria-hidden="true" />
				</button>
			</span>
			<button
				type="button"
				class="member-picker-add"
				:disabled
				:aria-label="ts('guild_member_picker.add_to', { name: label })"
				@click="open = true"
			>
				<UIcon name="ic:round-person-add" class="size-3.5" aria-hidden="true" />
				{{ ts("guild_member_picker.add") }}
			</button>
		</div>

		<UModal
			v-model:open="open"
			:title="ts('guild_member_picker.dialog_title', { name: label })"
			:description="ts('guild_member_picker.dialog_description')"
			:ui="{ content: 'sm:max-w-130', body: 'p-0 sm:p-0' }"
		>
			<template #body>
				<div class="px-5 pt-1 pb-3">
					<UInput
						v-model="query"
						icon="ic:round-search"
						:placeholder="ts('guild_member_picker.search_placeholder')"
						:aria-label="ts('guild_member_picker.search_placeholder')"
						:loading="pending"
						class="w-full"
					/>
				</div>
				<ul class="max-h-[min(60vh,32rem)] overflow-y-auto px-5 pb-4" aria-live="polite">
					<li v-if="query.trim().length === 0" class="py-3 text-[0.8125rem] text-muted">
						{{ ts("guild_member_picker.type_to_search") }}
					</li>
					<li
						v-else-if="!pending && results.length === 0"
						class="py-3 text-[0.8125rem] text-muted"
					>
						{{ ts("select.nothing_matches") }}
					</li>
					<li v-for="member in results" :key="member.id" class="member-picker-row">
						<UAvatar :src="avatarOf(member)" :alt="''" size="sm" class="shrink-0" />
						<span class="min-w-0 flex-auto">
							<span class="block truncate text-sm font-semibold">{{
								nameOf(member)
							}}</span>
							<span class="block truncate text-xs text-muted"
								>@{{ member.user.username }}</span
							>
						</span>
						<UButton
							size="sm"
							variant="soft"
							:disabled="ids.includes(member.id)"
							:aria-label="
								ts('guild_member_picker.add_member', { name: nameOf(member) })
							"
							@click="add(member)"
						>
							{{
								ids.includes(member.id)
									? ts("guild_member_picker.added")
									: ts("guild_member_picker.add")
							}}
						</UButton>
					</li>
				</ul>
			</template>
		</UModal>
	</div>
</template>

<script setup lang="ts">
import type { FlattenedMember } from "#shared/types/discord";
import { resolveGuildMembers } from "~/composables/useGuildMemberSearch";

const {
	ids,
	guildId,
	label,
	description,
	emptyLabel,
	disabled = false,
} = defineProps<{
	/** The picked members, by id. */
	ids: readonly string[];
	guildId: string;
	label: string;
	description?: string;
	emptyLabel?: string;
	disabled?: boolean;
}>();

const emit = defineEmits<{ "update:ids": [value: string[]] }>();

const { ts } = useI18n();

const labelId = useId();
const open = ref(false);
const query = ref("");
const { results, pending } = useGuildMemberSearch(() => guildId, query);

// The picked members whose names were resolved, kept as results add more.
const known = reactive(new Map<string, FlattenedMember>());
const resolving = ref(false);

watch(
	() => [guildId, ids.filter((id) => !known.has(id))] as const,
	async ([id, missing]) => {
		if (missing.length === 0) return;
		resolving.value = true;
		try {
			for (const member of await resolveGuildMembers(id, missing))
				known.set(member.id, member);
		} catch {
			// Shown by id, as members who left are.
		} finally {
			resolving.value = false;
		}
	},
	{ immediate: true },
);

function nameOf(member: FlattenedMember): string {
	return member.user.globalName ?? member.user.username;
}

function avatarOf(member: FlattenedMember): string {
	return avatarURL(member.user, { size: 64 });
}

function chipName(id: string): string {
	const member = known.get(id);
	return member ? nameOf(member) : id;
}

function add(member: FlattenedMember) {
	known.set(member.id, member);
	if (!ids.includes(member.id)) emit("update:ids", [...ids, member.id]);
}

function remove(id: string) {
	emit(
		"update:ids",
		ids.filter((entry) => entry !== id),
	);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.member-picker-chip {
	@apply inline-flex h-7 items-center gap-1.5 rounded-full bg-base-content/8 py-0 pr-1.5 pl-1.5 text-[0.8125rem] font-semibold;
}

.member-picker-remove {
	@apply flex size-5 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 opacity-70;
	color: inherit;
}

.member-picker-remove:hover:not(:disabled) {
	@apply opacity-100;
	background-color: color-mix(in oklab, currentcolor 15%, transparent);
}

.member-picker-add {
	@apply inline-flex h-7 cursor-pointer items-center gap-1 rounded-full bg-transparent px-3 text-[0.8125rem] font-semibold;
	border: 1px dashed var(--field-border);
	color: var(--ui-text-toned);
}

.member-picker-add:hover:not(:disabled) {
	background-color: var(--field-surface);
}

.member-picker-add:disabled,
.member-picker-remove:disabled {
	@apply cursor-default opacity-50;
}

.member-picker-add:focus-visible,
.member-picker-remove:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 1px;
}

.member-picker-row {
	@apply flex items-center gap-3 rounded-md py-2;
}
</style>
