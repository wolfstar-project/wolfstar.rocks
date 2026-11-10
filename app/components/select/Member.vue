<template>
	<div class="flex min-w-0 flex-col">
		<label v-if="label" :for="fieldId" class="mb-1.5 text-[0.8125rem] font-semibold">
			{{ label }}
		</label>
		<USelectMenu
			:id="fieldId"
			v-model="model"
			v-model:search-term="query"
			v-model:open="open"
			:items
			:multiple
			:disabled
			:size
			value-key="value"
			label-key="label"
			description-key="description"
			ignore-filter
			:loading="pending"
			:reset-search-term-on-select="!multiple"
			:search-input="{ icon: 'ic:round-search', placeholder: searchPlaceholder }"
			:clear="clearable && chosen.length > 0"
			:placeholder="placeholder ?? defaultPlaceholder"
			:aria-label="ariaLabel ?? label ?? defaultAriaLabel"
			:content="{ align }"
			:ui="{
				base: baseClass,
				content:
					'max-h-[min(26rem,var(--reka-combobox-content-available-height,26rem))] w-max min-w-[max(var(--reka-combobox-trigger-width),17.5rem)] max-w-90',
				viewport: 'max-h-75',
				group: 'p-1',
				label: 'px-2 pt-2.5 pb-1 text-xs font-semibold tracking-[0.02em] text-muted uppercase',
				item: 'min-h-11 items-center gap-2.5 px-2 py-1.25 data-[state=checked]:before:bg-primary/14',
				itemLabel: 'flex min-w-0 items-center gap-1.5 text-[0.9375rem] font-semibold',
				itemDescription: 'text-xs text-muted',
				itemTrailingIcon: multiple ? 'hidden' : 'size-4.5 text-primary',
			}"
			@update:open="onOpen"
		>
			<template v-if="chosen.length > 0" #default>
				<span v-if="multiple" class="flex min-w-0 flex-wrap gap-1 py-1">
					<span
						v-for="entry in chips"
						:key="entry.value"
						class="member-select-chip"
						:style="entry.chipStyle"
					>
						<img
							v-if="entry.avatar"
							:src="entry.avatar"
							alt=""
							width="18"
							height="18"
							class="size-4.5 shrink-0 rounded-full object-cover"
						/>
						<UIcon
							v-else
							name="ic:baseline-shield"
							class="size-3.25 shrink-0"
							:style="{ color: entry.color ?? 'var(--ui-text-muted)' }"
							aria-hidden="true"
						/>
						<span class="truncate">{{ entry.label }}</span>
					</span>
					<span v-if="hiddenChips > 0" class="self-center font-mono text-xs text-muted">
						+{{ hiddenChips }}
					</span>
				</span>
				<span v-else-if="first" class="flex min-w-0 items-center gap-2">
					<img
						v-if="first.avatar"
						:src="first.avatar"
						alt=""
						width="24"
						height="24"
						class="size-6 shrink-0 rounded-full object-cover"
					/>
					<span
						v-else
						class="member-select-shield size-6"
						:style="{ backgroundColor: first.shieldBg }"
					>
						<UIcon
							name="ic:baseline-shield"
							class="size-3.25"
							:style="{ color: first.color ?? 'var(--ui-text-muted)' }"
							aria-hidden="true"
						/>
					</span>
					<span
						class="truncate font-semibold"
						:class="{ 'font-mono text-xs': first.unknown }"
						:style="first.color ? { color: first.color } : undefined"
					>
						{{ first.label }}
					</span>
					<span v-if="first.bot" class="member-select-app">
						{{ ts("guild_member_select.app") }}
					</span>
					<span class="shrink-0 text-xs whitespace-nowrap text-muted">
						{{ first.handle }}
					</span>
				</span>
			</template>

			<template #content-top>
				<div
					v-if="roles"
					role="group"
					:aria-label="ts('guild_member_select.show')"
					class="flex gap-1 border-b border-default p-2"
				>
					<button
						v-for="entry in tabs"
						:key="entry.key"
						type="button"
						class="member-select-tab"
						:aria-pressed="tab === entry.key"
						@click="tab = entry.key"
					>
						{{ entry.label }}
						<span class="font-mono text-[0.6875rem] font-medium text-muted">
							{{ entry.count }}
						</span>
					</button>
				</div>
			</template>

			<template #item-leading="{ item }">
				<template v-if="isEntry(item)">
					<span
						v-if="multiple"
						class="member-select-check"
						:class="{ 'member-select-check--on': isPicked(item.value) }"
						aria-hidden="true"
					>
						<UIcon v-if="isPicked(item.value)" name="ic:round-check" class="size-3" />
					</span>
					<img
						v-if="item.avatar"
						:src="item.avatar"
						alt=""
						width="32"
						height="32"
						loading="lazy"
						class="size-8 shrink-0 rounded-full object-cover"
					/>
					<span
						v-else
						class="member-select-shield size-8"
						:style="{ backgroundColor: item.shieldBg }"
					>
						<UIcon
							name="ic:baseline-shield"
							class="size-4.5"
							:style="{ color: item.color ?? 'var(--ui-text-muted)' }"
							aria-hidden="true"
						/>
					</span>
				</template>
			</template>

			<template #item-label="{ item }">
				<template v-if="isEntry(item)">
					<span
						class="truncate"
						:class="{ 'font-mono text-xs': item.unknown }"
						:style="item.color ? { color: item.color } : undefined"
					>
						{{ item.label }}
					</span>
					<span v-if="item.bot" class="member-select-app">
						{{ ts("guild_member_select.app") }}
					</span>
				</template>
			</template>

			<template #empty>
				{{ query.trim() ? ts("select.nothing_matches") : idleHint }}
			</template>

			<template #content-bottom>
				<p
					v-if="!query.trim() && items.length > 0 && tab !== 'roles'"
					class="px-3 pt-1.5 pb-2 text-xs text-muted"
				>
					{{ idleHint }}
				</p>
			</template>
		</USelectMenu>
	</div>
</template>

<script lang="ts">
import type { DeepReadonly } from "@sapphire/utilities";

/** What a member and role select lists: a member, or a role when `roles` is on. */
interface Entry {
	/** `member:<id>` or `role:<id>`, so one list holds both. */
	value: string;
	label: string;
	/** The row's second line: the @username, or what the role is. */
	description: string;
	/** Text after the name in a single select's field. */
	handle: string;
	/** A member's avatar; a role has none and shows its shield. */
	avatar?: string;
	/** The colour of the name: a member's top role, or the role's own. */
	color?: string;
	/** Background of a role's shield. */
	shieldBg?: string;
	/** Background and text colour of a chip. */
	chipStyle?: Record<string, string>;
	bot?: boolean;
	/** A stored id with nothing behind it any more. */
	unknown?: boolean;
}

/** A group's heading, which Nuxt UI never selects. */
interface Heading {
	type: "label";
	label: string;
	/** Never picked; it only satisfies the menu's `value-key`. */
	value: string;
	description?: string;
}

type Tab = "all" | "members" | "roles";

type SelectGuild = DeepReadonly<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>;
</script>

<script setup lang="ts">
import type { FlattenedMember } from "#shared/types/discord";
import type { MentionableRole } from "~/utils/select-options";
import { isSnowflake } from "#shared/utils/snowflake";
// Named, not auto-imported: knip only follows auto-imports of the `use*` composables.
import { resolveGuildMembers } from "~/composables/useGuildMemberSearch";

// A multi-select shows this many chips and counts the rest.
const VISIBLE_CHIPS = 4;
const MEMBER = "member:";
const ROLE = "role:";

/** The picked members, by user id. */
const memberIds = defineModel<string[]>("memberIds", { default: () => [] });
/** The picked roles, by role id; only filled when `roles` is on. */
const roleIds = defineModel<string[]>("roleIds", { default: () => [] });

const {
	guildId,
	guild,
	label,
	ariaLabel,
	placeholder,
	multiple = false,
	roles = false,
	everyone = true,
	showBots = true,
	size = "md",
	variant = "default",
	align = "start",
	clearable = true,
	disabled = false,
} = defineProps<{
	guildId: string;
	/** Gives the roles and their colours; `undefined` while the guild has not loaded. */
	guild?: SelectGuild;
	label?: string;
	/** Names the field when it has no visible label. */
	ariaLabel?: string;
	placeholder?: string;
	multiple?: boolean;
	/** Offers the roles too, like Discord's mentionable select. */
	roles?: boolean;
	/** With `roles`, keeps `@everyone` in the list. */
	everyone?: boolean;
	/** Lists the apps among the members. */
	showBots?: boolean;
	size?: "sm" | "md";
	/** `field` is the 48px select of a settings page. */
	variant?: "default" | "field";
	/** Which edge of the field the list lines up with. */
	align?: "start" | "end";
	clearable?: boolean;
	disabled?: boolean;
}>();

const { ts } = useI18n();
const fieldId = useId();
const open = ref(false);
const query = ref("");
const tab = ref<Tab>("all");

// Discord's search takes no leading `@`; an @username is a name to it.
const searchQuery = computed(() => query.value.trim().replace(/^@/, ""));
const showsMembers = computed(() => !roles || tab.value !== "roles");
const showsRoles = computed(() => roles && tab.value !== "members");

const { results, pending } = useGuildMemberSearch(
	() => (showsMembers.value ? guildId : null),
	searchQuery,
);

// The picked members whose names were resolved, kept as results add more.
const known = reactive(new Map<string, FlattenedMember>());
const resolving = ref(false);

watch(
	() => [guildId, memberIds.value.filter((id) => !known.has(id))] as const,
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

const roleList = computed(() => (roles ? mentionableRoles(guild, { everyone }) : []));
const roleById = computed(() => new Map(roleList.value.map((role) => [role.id, role])));

function memberEntry(member: FlattenedMember): Entry {
	const username = `@${member.user.username}`;
	return {
		avatar: avatarURL(member.user, { size: 64 }),
		bot: member.user.bot === true,
		chipStyle: { backgroundColor: "var(--ui-bg-accented)" },
		color: memberColor(member),
		description: username,
		handle: username,
		label: member.user.globalName ?? member.user.username,
		value: MEMBER + member.id,
	};
}

/** A member id with nobody behind it: still loading, or not in the server. */
function unknownMemberEntry(id: string): Entry {
	const note = resolving.value ? "" : ts("guild_member_picker.not_in_server");
	return {
		avatar: avatarURL({ avatar: null, id }, { size: 64 }),
		chipStyle: { backgroundColor: "var(--ui-bg-accented)" },
		description: note,
		handle: note,
		label: id,
		unknown: true,
		value: MEMBER + id,
	};
}

function roleDescription(role: MentionableRole): string {
	if (role.everyone) return ts("guild_member_select.every_member");
	if (role.managed) return ts("guild_member_select.managed");
	return ts("guild_member_select.role");
}

function roleEntry(role: MentionableRole): Entry {
	const tint: Record<string, string> = role.color
		? {
				backgroundColor: `color-mix(in srgb, ${role.color} 16%, var(--ui-bg-accented))`,
				color: role.color,
			}
		: { backgroundColor: "var(--ui-bg-accented)" };
	return {
		chipStyle: tint,
		color: role.color,
		description: roleDescription(role),
		handle: roleDescription(role),
		label: role.everyone ? "@everyone" : `@${role.name}`,
		shieldBg: role.color
			? `color-mix(in srgb, ${role.color} 18%, transparent)`
			: "var(--ui-bg-accented)",
		value: ROLE + role.id,
	};
}

function unknownRoleEntry(id: string): Entry {
	return {
		chipStyle: { backgroundColor: "var(--ui-bg-accented)" },
		description: ts("select.unknown_role"),
		handle: "",
		label: ts("select.unknown_role"),
		shieldBg: "var(--ui-bg-accented)",
		value: ROLE + id,
	};
}

const chosen = computed<Entry[]>(() => [
	...roleIds.value.map((id) => {
		const role = roleById.value.get(id);
		return role ? roleEntry(role) : unknownRoleEntry(id);
	}),
	...memberIds.value.map((id) => {
		const member = known.get(id);
		return member ? memberEntry(member) : unknownMemberEntry(id);
	}),
]);
const first = computed(() => chosen.value[0]);
const chips = computed(() => chosen.value.slice(0, VISIBLE_CHIPS));
const hiddenChips = computed(() => Math.max(0, chosen.value.length - VISIBLE_CHIPS));

const model = computed<string[] | string | null>({
	get: () => {
		const values = chosen.value.map((entry) => entry.value);
		return multiple ? values : (values[0] ?? null);
	},
	set: (value) => {
		const values = Array.isArray(value) ? value : value ? [value] : [];
		for (const member of results.value) {
			if (values.includes(MEMBER + member.id)) known.set(member.id, member);
		}
		roleIds.value = values
			.filter((entry) => entry.startsWith(ROLE))
			.map((entry) => entry.slice(ROLE.length));
		memberIds.value = values
			.filter((entry) => entry.startsWith(MEMBER))
			.map((entry) => entry.slice(MEMBER.length));
	},
});

function isPicked(value: string): boolean {
	return chosen.value.some((entry) => entry.value === value);
}

const foundRoles = computed(() => {
	if (!showsRoles.value) return [];
	const needle = searchQuery.value.toLowerCase();
	return roleList.value.filter(
		(role) =>
			!needle ||
			role.name.toLowerCase().includes(needle) ||
			(role.everyone && "everyone".includes(needle)) ||
			role.id.startsWith(needle),
	);
});

// Without a query the list shows the picked members, so they can be unticked.
const foundMembers = computed<Entry[]>(() => {
	if (!showsMembers.value) return [];
	if (!searchQuery.value) {
		return chosen.value.filter((entry) => entry.value.startsWith(MEMBER));
	}
	return results.value.filter((member) => showBots || member.user.bot !== true).map(memberEntry);
});

// A pasted id the search did not find still counts, as on Discord.
const byId = computed<Entry | undefined>(() => {
	const id = searchQuery.value;
	if (!showsMembers.value || !isSnowflake(id) || pending.value) return undefined;
	if (results.value.some((member) => member.id === id)) return undefined;
	if (foundRoles.value.some((role) => role.id === id)) return undefined;
	return known.get(id) ? memberEntry(known.get(id)!) : unknownMemberEntry(id);
});

function heading(label: string): Heading {
	return { label, type: "label", value: `group:${label}` };
}

const items = computed<(Entry | Heading)[][]>(() => {
	const groups: (Entry | Heading)[][] = [];
	if (foundRoles.value.length > 0) {
		groups.push([
			heading(ts("guild_member_select.group_roles", { count: foundRoles.value.length })),
			...foundRoles.value.map(roleEntry),
		]);
	}
	if (foundMembers.value.length > 0) {
		groups.push([
			heading(ts("guild_member_select.group_members", { count: foundMembers.value.length })),
			...foundMembers.value,
		]);
	}
	if (byId.value) {
		groups.push([heading(ts("guild_member_select.group_by_id")), byId.value]);
	}
	return groups;
});

const tabs = computed(() => {
	const memberCount = searchQuery.value ? results.value.length : memberIds.value.length;
	const roleCount = roleList.value.length;
	return [
		{ count: memberCount + roleCount, key: "all", label: ts("guild_member_select.tab_all") },
		{ count: memberCount, key: "members", label: ts("guild_member_select.tab_members") },
		{ count: roleCount, key: "roles", label: ts("guild_member_select.tab_roles") },
	] satisfies { count: number; key: Tab; label: string }[];
});

const defaultPlaceholder = computed(() => {
	if (roles) {
		return multiple
			? ts("guild_member_select.pick_mentionables")
			: ts("guild_member_select.pick_mentionable");
	}
	return multiple
		? ts("guild_member_select.pick_members")
		: ts("guild_member_select.pick_member");
});
const defaultAriaLabel = computed(() =>
	roles ? ts("guild_member_select.label_mentionable") : ts("guild_member_select.label_member"),
);
const searchPlaceholder = computed(() =>
	roles
		? ts("guild_member_select.search_mentionables")
		: ts("guild_member_picker.search_placeholder"),
);
const idleHint = computed(() =>
	roles ? ts("guild_member_select.hint_mentionables") : ts("guild_member_select.hint_members"),
);

// Chips may wrap, so a multi-select grows from its size's height.
const baseClass = computed(() => {
	if (multiple) return size === "sm" ? "h-auto min-h-8 py-0" : "h-auto min-h-10 py-0";
	if (size === "sm") return "h-8";
	return variant === "field" ? "h-12 ps-2.5 text-base" : "h-10";
});

function onOpen(value: boolean) {
	if (value) tab.value = "all";
}

function isEntry(item: unknown): item is Entry {
	return typeof item === "object" && item !== null && "value" in item;
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.member-select-chip {
	@apply inline-flex h-6 max-w-full items-center gap-1.25 rounded-full py-0 pr-2 pl-0.75 text-xs font-semibold;
}

.member-select-shield {
	@apply inline-flex shrink-0 items-center justify-center rounded-full;
}

.member-select-app {
	@apply inline-flex h-3.75 shrink-0 items-center rounded-[3px] bg-primary px-1 text-[0.625rem] font-bold tracking-[0.02em] text-primary-content uppercase;
}

.member-select-check {
	@apply flex size-4 shrink-0 items-center justify-center rounded-[4px] border-2 border-(--ink-300) text-white;
}

.member-select-check--on {
	@apply border-primary bg-primary;
}

.member-select-tab {
	@apply inline-flex h-6.5 cursor-pointer items-center gap-1.5 rounded-[5px] border-0 bg-transparent px-2.5 text-[0.8125rem] font-semibold text-muted;
}

.member-select-tab[aria-pressed="true"] {
	@apply bg-accented text-default;
}

.member-select-tab:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 1px;
}
</style>
