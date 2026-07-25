<template>
	<div
		class="discord-channel-info"
		role="dialog"
		aria-modal="true"
		:aria-label="`Channel information for #${name}`"
	>
		<div class="discord-channel-info-toolbar">
			<button
				ref="backButton"
				type="button"
				class="discord-channel-info-toolbar-btn"
				aria-label="Back to channel"
				@click="emit('close')"
			>
				<UIcon name="ph:arrow-left-bold" class="size-5" aria-hidden="true" />
			</button>

			<div class="discord-channel-info-toolbar-actions" aria-hidden="true">
				<span class="discord-channel-info-toolbar-btn">
					<UIcon name="discord:search" class="size-5" />
				</span>
				<span class="discord-channel-info-toolbar-btn">
					<UIcon name="discord:notifications" class="size-5" />
				</span>
				<span class="discord-channel-info-toolbar-btn">
					<UIcon name="ph:gear-six" class="size-5" />
				</span>
			</div>
		</div>

		<div class="discord-channel-info-identity">
			<div class="discord-channel-info-channel-icon" aria-hidden="true">
				<UIcon name="discord:text-channel" class="size-5" />
			</div>
			<div class="discord-channel-info-identity-text">
				<div class="discord-channel-info-name">{{ name }}</div>
				<div class="discord-channel-info-type">Text Channel</div>
			</div>
		</div>

		<div
			class="discord-channel-info-tabs"
			role="tablist"
			aria-label="Channel information sections"
		>
			<button
				v-for="tab of ChannelInfoTabs"
				:id="tabButtonId(tab.id)"
				:key="tab.id"
				type="button"
				role="tab"
				class="discord-channel-info-tab"
				:class="{ 'discord-channel-info-tab-active': activeTab === tab.id }"
				:aria-selected="activeTab === tab.id"
				:aria-controls="tabPanelId(tab.id)"
				:tabindex="activeTab === tab.id ? 0 : -1"
				@click="activeTab = tab.id"
				@keydown="onTabKeydown($event, tab.id)"
			>
				{{ tab.label }}
			</button>
		</div>

		<div
			:id="tabPanelId(activeTab)"
			class="discord-channel-info-panel"
			role="tabpanel"
			:aria-labelledby="tabButtonId(activeTab)"
		>
			<DiscordMemberList
				v-if="activeTab === 'members'"
				class="discord-channel-info-members"
				:online
				:offline
				show-roles
				:label="`Members in #${name}`"
			/>

			<div
				v-else-if="activeTab === 'threads'"
				class="discord-channel-info-empty discord-channel-info-empty-threads"
			>
				<div class="discord-channel-info-empty-icon" aria-hidden="true">
					<UIcon name="discord:threads" class="size-8" />
				</div>
				<p class="discord-channel-info-empty-title">There are no threads.</p>
				<p class="discord-channel-info-empty-body">
					Stay focused on a conversation with a thread - a temporary text channel.
				</p>
				<button type="button" class="discord-channel-info-create-thread" disabled>
					Create Thread
				</button>
			</div>

			<div v-else class="discord-channel-info-empty">
				<p class="discord-channel-info-empty-search">
					We searched far and wide.<br />
					Unfortunately, no results were found.
				</p>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import type { DiscordMemberListMember } from "~/types/discord";

type ChannelInfoTabId = "members" | "media" | "pins" | "threads" | "links" | "files";

interface ChannelInfoTab {
	id: ChannelInfoTabId;
	label: string;
}

interface ChannelInfoProps {
	name: string;
	online: readonly DiscordMemberListMember[];
	offline: readonly DiscordMemberListMember[];
	/** Initial tab — defaults to Members like Discord mobile. */
	initialTab?: ChannelInfoTabId;
}

const ChannelInfoTabs = [
	{ id: "members", label: "Members" },
	{ id: "media", label: "Media" },
	{ id: "pins", label: "Pins" },
	{ id: "threads", label: "Threads" },
	{ id: "links", label: "Links" },
	{ id: "files", label: "Files" },
] as const satisfies readonly ChannelInfoTab[];
</script>

<script setup lang="ts">
const { name, online, offline, initialTab = "members" } = defineProps<ChannelInfoProps>();

const emit = defineEmits<{
	close: [];
}>();

const activeTab = ref<ChannelInfoTabId>(initialTab);
const backButton = useTemplateRef<HTMLButtonElement>("backButton");

function tabButtonId(id: ChannelInfoTabId) {
	return `discord-channel-info-tab-${id}`;
}

function tabPanelId(id: ChannelInfoTabId) {
	return `discord-channel-info-panel-${id}`;
}

function focusTab(id: ChannelInfoTabId) {
	activeTab.value = id;
	void nextTick(() => {
		document.getElementById(tabButtonId(id))?.focus();
	});
}

function onTabKeydown(event: KeyboardEvent, currentId: ChannelInfoTabId) {
	const currentIndex = ChannelInfoTabs.findIndex((tab) => tab.id === currentId);
	if (currentIndex < 0) {
		return;
	}

	let nextIndex: number | undefined;
	if (event.key === "ArrowRight" || event.key === "ArrowDown") {
		nextIndex = (currentIndex + 1) % ChannelInfoTabs.length;
	} else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
		nextIndex = (currentIndex - 1 + ChannelInfoTabs.length) % ChannelInfoTabs.length;
	} else if (event.key === "Home") {
		nextIndex = 0;
	} else if (event.key === "End") {
		nextIndex = ChannelInfoTabs.length - 1;
	}

	if (nextIndex === undefined) {
		return;
	}

	event.preventDefault();
	const nextTab = ChannelInfoTabs[nextIndex];
	if (!nextTab) {
		return;
	}
	focusTab(nextTab.id);
}

function onDocumentKeydown(event: KeyboardEvent) {
	if (event.key === "Escape") {
		event.preventDefault();
		emit("close");
	}
}

onMounted(() => {
	document.addEventListener("keydown", onDocumentKeydown);
	void nextTick(() => {
		backButton.value?.focus();
	});
});

onBeforeUnmount(() => {
	document.removeEventListener("keydown", onDocumentKeydown);
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-channel-info {
	--discord-channel-info-bg: oklch(26.65% 0.006 272.93);
	--discord-channel-info-text: oklch(91.56% 0.004 272.93);
	--discord-channel-info-muted: oklch(71.01% 0.01 273.13);
	--discord-channel-info-icon-bg: oklch(32.11% 0.007 272.93);
	--discord-channel-info-accent: oklch(64.78% 0.154 262.35);
	--discord-channel-info-empty-icon-bg: oklch(32.11% 0.007 272.93);
	--discord-channel-info-cta: oklch(57.74% 0.2091 273.85);
	--discord-channel-info-cta-text: oklch(100% 0 0);
	--discord-channel-info-tab-border: oklch(100% 0 0 / 0.06);

	@apply absolute inset-0 z-20 flex flex-col overflow-hidden font-whitney;
	background-color: var(--discord-channel-info-bg);
	color: var(--discord-channel-info-text);
	animation: discord-channel-info-enter 180ms ease-out;
}

@keyframes discord-channel-info-enter {
	from {
		opacity: 0;
		transform: translateX(0.75rem);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}

@media (prefers-reduced-motion: reduce) {
	.discord-channel-info {
		animation: none;
	}
}

.discord-channel-info-toolbar {
	@apply flex shrink-0 items-center justify-between px-2 pt-2;
}

.discord-channel-info-toolbar-actions {
	@apply flex items-center;
}

.discord-channel-info-toolbar-btn {
	@apply inline-flex size-10 shrink-0 items-center justify-center border-0 bg-transparent p-0;
	color: var(--discord-channel-info-text);
}

button.discord-channel-info-toolbar-btn {
	@apply cursor-pointer;
}

button.discord-channel-info-toolbar-btn:focus-visible {
	@apply outline-2 outline-offset-2 outline-primary;
}

.discord-channel-info-identity {
	@apply flex shrink-0 items-center gap-3 px-4 pt-3 pb-4;
}

.discord-channel-info-channel-icon {
	@apply flex size-12 shrink-0 items-center justify-center rounded-2xl;
	background-color: var(--discord-channel-info-icon-bg);
	color: var(--discord-channel-info-text);
}

.discord-channel-info-identity-text {
	@apply min-w-0;
}

.discord-channel-info-name {
	@apply truncate text-xl leading-tight font-semibold;
	color: var(--discord-channel-info-text);
}

.discord-channel-info-type {
	@apply mt-0.5 text-sm;
	color: var(--discord-channel-info-muted);
}

.discord-channel-info-tabs {
	@apply flex shrink-0 gap-5 overflow-x-auto border-b px-4;
	border-color: var(--discord-channel-info-tab-border);
	scrollbar-width: none;
}

.discord-channel-info-tabs::-webkit-scrollbar {
	display: none;
}

.discord-channel-info-tab {
	@apply relative shrink-0 border-0 bg-transparent px-0 pt-1 pb-3 font-whitney text-sm font-medium;
	color: var(--discord-channel-info-muted);
	cursor: pointer;
}

.discord-channel-info-tab-active {
	color: var(--discord-channel-info-accent);
}

.discord-channel-info-tab-active::after {
	content: "";
	@apply absolute inset-x-0 bottom-0 h-0.5 rounded-full;
	background-color: var(--discord-channel-info-accent);
}

.discord-channel-info-tab:focus-visible {
	@apply outline-2 outline-offset-2 outline-primary;
}

.discord-channel-info-panel {
	@apply min-h-0 flex-1 overflow-hidden;
}

.discord-channel-info-members {
	@apply h-full min-h-0 w-full border-0;
}

.discord-channel-info :deep(.discord-channel-info-members.discord-member-list) {
	--discord-member-list-bg: var(--discord-channel-info-bg);
	--discord-member-list-border: transparent;
	--discord-member-list-presence-ring: var(--discord-channel-info-bg);
	width: 100%;
	border: none;
	background-color: var(--discord-channel-info-bg);
}

.discord-channel-info :deep(.discord-channel-info-members .discord-member-list-content) {
	@apply pt-3;
}

.discord-channel-info-empty {
	@apply flex h-full min-h-0 flex-col items-center justify-center px-8 text-center;
}

.discord-channel-info-empty-search {
	@apply m-0 text-sm leading-5;
	color: var(--discord-channel-info-muted);
}

.discord-channel-info-empty-threads {
	@apply gap-3;
}

.discord-channel-info-empty-icon {
	@apply mb-1 flex size-16 items-center justify-center rounded-full;
	background-color: var(--discord-channel-info-empty-icon-bg);
	color: var(--discord-channel-info-text);
}

.discord-channel-info-empty-title {
	@apply m-0 text-lg font-semibold;
	color: var(--discord-channel-info-text);
}

.discord-channel-info-empty-body {
	@apply m-0 max-w-64 text-sm leading-5;
	color: var(--discord-channel-info-muted);
}

.discord-channel-info-create-thread {
	@apply mt-2 rounded-full border-0 px-5 py-2.5 font-whitney text-sm font-medium;
	background-color: var(--discord-channel-info-cta);
	color: var(--discord-channel-info-cta-text);
	cursor: default;
	opacity: 1;
}

.discord-channel-info-create-thread:disabled {
	opacity: 1;
}
</style>
