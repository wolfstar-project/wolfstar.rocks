<template>
	<AppLauncher
		v-if="open"
		ref="rootRef"
		:class="[
			// `discord-app-launcher` is the hook the commands showcase styles the sheet through.
			// AppLauncher has no bottom-sheet layout, so the phone sheet is local.
			'discord-app-launcher font-whitney max-md:relative max-md:h-(--discord-app-launcher-sheet-half) max-md:max-h-(--discord-app-launcher-sheet-full) max-md:max-w-none max-md:rounded-t-[16px] max-md:rounded-b-none max-md:border-0 max-md:shadow-none max-md:transition-[height] max-md:duration-200',
			{
				'max-md:h-(--discord-app-launcher-sheet-full)': sheetSnap === 'full',
				'max-md:transition-none': sheetDragging || effectiveReduceMotion,
			},
		]"
		:data-sheet-snap="sheetSnap"
		:style="sheetStyle"
		aria-modal="true"
		:aria-label="dialogLabel"
		@keydown.escape.prevent.stop="onEscape"
		@keydown.tab="onTab"
	>
		<!-- AppLauncherHandle is a hidden grip; the phone sheet needs a focusable control around it. -->
		<button
			type="button"
			data-slot="sheet-handle"
			class="mb-1.5 hidden shrink-0 cursor-grab touch-none self-center rounded-full border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-newt-text-link active:cursor-grabbing max-md:block"
			:tabindex="isBelowMediumScreen ? 0 : -1"
			:aria-hidden="isBelowMediumScreen ? undefined : 'true'"
			:aria-label="
				isBelowMediumScreen
					? sheetSnap === 'full'
						? ts('discord.launcher.collapse')
						: ts('discord.launcher.expand')
					: undefined
			"
			:aria-expanded="isBelowMediumScreen ? sheetSnap === 'full' : undefined"
			@pointerdown="onHandlePointerDown"
			@keydown.up.prevent="expandSheet"
			@keydown.down.prevent="collapseSheet"
		>
			<AppLauncherHandle class="mt-2.5 h-1.5 w-11 bg-newt-text-muted" />
		</button>

		<template v-if="activeView === null">
			<AppLauncherSearch class="max-md:pt-2">
				<AppLauncherSearchInput
					ref="searchRef"
					:value="searchQuery"
					:placeholder="ts('discord.launcher.search')"
					:aria-label="ts('discord.launcher.search')"
					class="max-md:h-12 max-md:rounded-full"
					@input="onSearchInput"
					@keydown.enter.prevent="onSearchEnter"
				/>
			</AppLauncherSearch>

			<AppLauncherBody :class="[scrollbarClassName, 'max-md:pb-5']">
				<!-- Command hits appear only while searching — never a static /commands page. -->
				<AppLauncherSection
					v-if="filteredCommands.length > 0"
					class="max-md:gap-2.5"
					aria-labelledby="discord-app-launcher-commands-heading"
				>
					<AppLauncherSectionHeader>
						<AppLauncherSectionTitle
							id="discord-app-launcher-commands-heading"
							class="max-md:text-xl max-md:font-bold"
						>
							{{ ts("discord.launcher.commands") }}
						</AppLauncherSectionTitle>
					</AppLauncherSectionHeader>
					<AppLauncherList>
						<DiscordAppLauncherListItem
							v-for="entry of filteredCommands"
							:key="entry.id"
							:name="entry.name"
							:description="entry.description"
							:avatar="entry.avatar"
							:icon="entry.icon"
							:icon-bg="entry.iconBg"
							:show-eye="false"
							@select="selectEntry(entry)"
						/>
					</AppLauncherList>
				</AppLauncherSection>

				<AppLauncherSection
					v-if="filteredRecents.length > 0"
					class="max-md:gap-2.5"
					aria-labelledby="discord-app-launcher-recents-heading"
				>
					<AppLauncherSectionHeader>
						<AppLauncherSectionTitle
							id="discord-app-launcher-recents-heading"
							class="max-md:text-xl max-md:font-bold"
						>
							{{ ts("discord.launcher.views.recents") }}
							<UIcon
								name="ph:caret-down-bold"
								class="hidden size-3.5 max-md:inline-block"
								aria-hidden="true"
							/>
						</AppLauncherSectionTitle>
						<AppLauncherViewMore
							v-if="showRecentsViewMore"
							@click="openListView(recentsListViewId)"
						>
							<span class="max-md:hidden">{{
								ts("discord.launcher.view_more")
							}}</span>
							<span class="hidden max-md:inline">{{
								ts("discord.launcher.view_all")
							}}</span>
						</AppLauncherViewMore>
					</AppLauncherSectionHeader>
					<!-- AppLauncherRecents is a plain div; the list roles keep the count announced. -->
					<AppLauncherRecents role="list" class="max-md:hidden">
						<span v-for="entry of filteredRecents" :key="entry.id" role="listitem">
							<AppLauncherRecent
								:title="entry.name"
								:aria-label="recentTileLabel(entry)"
								:class="{
									'[&>img]:object-contain [&>img]:p-1': isWolfstarEntry(entry),
								}"
								:style="
									entry.iconBg ? { backgroundColor: entry.iconBg } : undefined
								"
								@click="selectEntry(entry)"
							>
								<NuxtImg
									v-if="entry.avatar"
									:src="entry.avatar"
									alt=""
									width="40"
									height="40"
								/>
								<UIcon
									v-else-if="entry.icon"
									:name="entry.icon"
									class="size-6 text-newt-on-accent"
								/>
							</AppLauncherRecent>
						</span>
					</AppLauncherRecents>
					<AppLauncherRecents role="list" :class="MOBILE_CAROUSEL_CLASS">
						<span
							v-for="entry of mobileRecents"
							:key="`mobile-recent-${entry.id}`"
							role="listitem"
							:class="MOBILE_TILE_SLOT_CLASS"
						>
							<DiscordAppLauncherListItem
								:class="MOBILE_TILE_CLASS"
								:name="entry.tileTitle ?? entry.name"
								:description="entry.tileSubtitle"
								:aria-label="recentTileLabel(entry)"
								:avatar="entry.avatar"
								:icon="entry.icon"
								:icon-bg="entry.iconBg"
								round
								:show-eye="false"
								:show-chevron="false"
								@select="selectEntry(entry)"
							/>
						</span>
					</AppLauncherRecents>
				</AppLauncherSection>

				<AppLauncherSection
					v-if="filteredServerApps.length > 0"
					class="max-md:gap-2.5"
					aria-labelledby="discord-app-launcher-server-heading"
				>
					<AppLauncherSectionHeader>
						<AppLauncherSectionTitle
							id="discord-app-launcher-server-heading"
							class="max-md:text-xl max-md:font-bold"
						>
							<span class="max-md:hidden">{{
								ts("discord.launcher.views.server-apps")
							}}</span>
							<span class="hidden max-md:inline">{{
								ts("discord.launcher.in_server")
							}}</span>
						</AppLauncherSectionTitle>
						<AppLauncherViewMore
							v-if="showServerAppsViewMore"
							@click="openListView(serverAppsListViewId)"
						>
							<span class="max-md:hidden">{{
								ts("discord.launcher.view_more")
							}}</span>
							<span class="hidden max-md:inline">{{
								ts("discord.launcher.view_all")
							}}</span>
						</AppLauncherViewMore>
					</AppLauncherSectionHeader>
					<AppLauncherList class="max-md:hidden">
						<DiscordAppLauncherListItem
							v-for="entry of filteredServerApps"
							:key="entry.id"
							:name="entry.name"
							:description="entry.description"
							:avatar="entry.avatar"
							:icon="entry.icon"
							:icon-bg="entry.iconBg"
							:promoted="entry.promoted"
							round
							@select="selectEntry(entry)"
						/>
					</AppLauncherList>
					<AppLauncherRecents role="list" :class="MOBILE_CAROUSEL_CLASS">
						<span
							v-for="entry of mobileServerApps"
							:key="`mobile-server-${entry.id}`"
							role="listitem"
							:class="MOBILE_TILE_SLOT_CLASS"
						>
							<DiscordAppLauncherListItem
								:class="MOBILE_TILE_CLASS"
								:name="entry.name"
								:aria-label="entry.name"
								:avatar="entry.avatar"
								:icon="entry.icon"
								:icon-bg="entry.iconBg"
								round
								:show-eye="false"
								:show-chevron="false"
								@select="selectEntry(entry)"
							/>
						</span>
					</AppLauncherRecents>
				</AppLauncherSection>

				<!-- newt/ui has no promoted card: the cards and their mock art stay local. -->
				<AppLauncherSection
					v-if="filteredPromoted.length > 0 && !searchQuery.trim()"
					class="max-md:gap-2.5"
					aria-labelledby="discord-app-launcher-promoted-heading"
				>
					<AppLauncherSectionHeader>
						<AppLauncherSectionTitle
							id="discord-app-launcher-promoted-heading"
							class="max-md:text-xl max-md:font-bold"
						>
							{{ ts("discord.launcher.promoted") }}
						</AppLauncherSectionTitle>
					</AppLauncherSectionHeader>
					<div class="grid grid-cols-2 gap-2.5 max-md:gap-2">
						<button
							v-for="promo of filteredPromoted"
							:key="promo.id"
							type="button"
							class="flex cursor-pointer flex-col overflow-hidden rounded-[8px] border-0 bg-newt-bg-elevated p-0 text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-newt-text-link max-md:rounded-[12px]"
							:aria-label="promoAriaLabel(promo)"
							@click="emit('selectPromo', promo)"
						>
							<span
								class="promo-art relative flex h-32 w-full shrink-0 items-center justify-center overflow-hidden max-md:h-[6.5rem]"
								:class="`promo-art--${promo.variant}`"
								aria-hidden="true"
							>
								<template v-if="promo.variant === 'wordle'">
									<span class="grid grid-cols-3 gap-[3px]">
										<span
											v-for="(cell, cellIndex) of WordleCells"
											:key="`${cell}-${cellIndex}`"
											class="size-3.5 rounded-[2px]"
											:class="`promo-wordle-cell--${cell}`"
										/>
									</span>
									<span
										class="font-serif text-3xl leading-none font-bold tracking-tight"
										>{{ promo.title }}</span
									>
									<span
										v-if="promo.subtitle"
										class="promo-wordle-subtitle text-[10px] leading-tight font-semibold tracking-[0.04em]"
									>
										{{ promo.subtitle }}
									</span>
								</template>
								<template v-else-if="promo.variant === 'garden'">
									<span
										class="promo-garden-vine absolute -top-7 left-1/2 h-20 w-32 -translate-x-1/2 rounded-[50%]"
									/>
									<span
										class="promo-garden-leaf absolute bottom-[48%] left-[12%] size-7 -rotate-25"
									/>
									<span
										class="promo-garden-leaf absolute right-[10%] bottom-[47%] size-7 scale-85 rotate-28"
									/>
									<span
										class="absolute bottom-[36%] left-1/2 size-14 -translate-x-1/2"
									>
										<span
											class="promo-garden-berry absolute inset-0 rounded-[45%_45%_50%_50%]"
										/>
										<span
											class="promo-garden-face absolute inset-0 z-1 flex items-center justify-center text-sm font-black"
											>•ᴗ•</span
										>
										<span
											class="promo-garden-seed absolute top-[38%] left-[28%] size-1 rounded-full"
										/>
										<span
											class="promo-garden-seed absolute top-[52%] left-[52%] size-1 rounded-full"
										/>
										<span
											class="promo-garden-seed absolute top-[30%] left-[58%] size-1 rounded-full"
										/>
										<span
											class="promo-garden-crown absolute -top-1.5 left-1/2 size-4 -translate-x-1/2 rounded-full"
										/>
									</span>
									<span
										class="promo-garden-flower absolute right-[22%] bottom-[28%] size-3 rounded-full"
									/>
									<span
										class="promo-garden-title absolute right-5 bottom-2 z-1 m-0 -rotate-3 text-center text-lg leading-[0.78] font-black tracking-[-0.04em] uppercase"
									>
										<template
											v-for="(
												line, lineIndex
											) of splitDiscordAppLauncherPromoTitle(promo.title)"
											:key="`${promo.id}-garden-${lineIndex}`"
										>
											<br v-if="lineIndex > 0" />{{ line }}
										</template>
									</span>
								</template>
								<template v-else-if="promo.variant === 'farm'">
									<span
										class="promo-farm-sun absolute top-3 right-5 size-8 rounded-full"
									/>
									<span
										class="promo-farm-field absolute inset-x-0 bottom-0 h-12"
									/>
									<UIcon
										name="ph:plant-fill"
										class="promo-farm-icon relative z-1 ml-5 size-16"
									/>
									<span
										class="promo-farm-title relative z-1 ml-2 -rotate-6 text-xl leading-[0.85] font-black uppercase"
									>
										<template
											v-for="(
												line, lineIndex
											) of splitDiscordAppLauncherPromoTitle(promo.title)"
											:key="`${promo.id}-farm-${lineIndex}`"
										>
											<br v-if="lineIndex > 0" />{{ line }}
										</template>
									</span>
								</template>
								<template v-else>
									<UIcon
										name="ph:youtube-logo-fill"
										class="promo-watch-icon size-12"
									/>
									<span
										class="promo-watch-title text-3xl font-bold tracking-tight"
										>{{ promo.title }}</span
									>
								</template>
							</span>
							<span
								class="flex min-h-14 items-center gap-2.5 px-2.5 py-2 max-md:min-h-0 max-md:gap-0 max-md:bg-newt-bg-base max-md:px-3 max-md:py-2.5"
							>
								<AppLauncherItemIcon
									class="max-md:hidden"
									:style="
										promo.iconBg ? { backgroundColor: promo.iconBg } : undefined
									"
								>
									<UIcon v-if="promo.icon" :name="promo.icon" class="size-5" />
								</AppLauncherItemIcon>
								<span class="flex min-w-0 flex-1 flex-col gap-0.5 max-md:gap-0">
									<span class="flex min-w-0 items-center gap-1">
										<span
											class="truncate text-[15px] leading-tight font-medium text-newt-text-primary max-md:text-[13px] max-md:font-bold"
											>{{ promo.title }}</span
										>
										<UIcon
											name="discord:eye"
											class="size-[18px] shrink-0 text-newt-text-secondary max-md:hidden"
											aria-hidden="true"
										/>
									</span>
									<span
										v-if="promo.description"
										class="truncate text-xs leading-snug text-newt-text-muted max-md:hidden"
									>
										{{ promo.description }}
									</span>
								</span>
							</span>
						</button>
					</div>
				</AppLauncherSection>

				<AppLauncherSection
					v-for="category of filteredCategories"
					:key="category.id"
					class="max-md:gap-2.5"
					:aria-labelledby="`discord-app-launcher-${category.id}-heading`"
				>
					<AppLauncherSectionHeader>
						<AppLauncherSectionTitle
							:id="`discord-app-launcher-${category.id}-heading`"
							class="max-md:text-xl max-md:font-bold"
						>
							{{ viewTitle(category) }}
						</AppLauncherSectionTitle>
						<AppLauncherViewMore
							v-if="shouldShowCategoryViewMore(category)"
							class="max-md:hidden"
							@click="openListView(category.id)"
						>
							{{ ts("discord.launcher.view_more") }}
						</AppLauncherViewMore>
					</AppLauncherSectionHeader>
					<AppLauncherList class="max-md:rounded-[12px]">
						<DiscordAppLauncherListItem
							v-for="entry of categoryPreviewEntries(category)"
							:key="entry.id"
							:name="entry.name"
							:description="entry.description"
							:avatar="entry.avatar"
							:icon="entry.icon"
							:icon-bg="entry.iconBg"
							:promoted="entry.promoted"
							@select="selectEntry(entry)"
						/>
						<!-- Discord mobile keeps the category View More inside the card. -->
						<AppLauncherViewMore
							v-if="shouldShowCategoryViewMore(category)"
							class="hidden w-full py-3.5 text-center max-md:block"
							@click="openListView(category.id)"
						>
							{{ ts("discord.launcher.view_more") }}
						</AppLauncherViewMore>
					</AppLauncherList>
				</AppLauncherSection>

				<aside
					v-if="!normalizedQuery"
					class="flex items-center justify-between gap-4 rounded-[8px] bg-newt-bg-elevated px-4 py-3 max-md:flex-col max-md:rounded-[12px] max-md:px-5 max-md:py-6 max-md:text-center"
				>
					<span class="flex min-w-0 flex-col gap-1 max-md:items-center max-md:gap-2">
						<strong class="text-lg leading-tight font-bold max-md:text-xl">{{
							ts("discord.launcher.help_title")
						}}</strong>
						<span
							class="text-xs leading-snug text-newt-text-primary max-md:text-[15px] max-md:leading-relaxed"
							>{{ ts("discord.launcher.help_body") }}</span
						>
					</span>
					<Button
						class="shrink-0 max-md:min-w-[8.5rem] max-md:rounded-full max-md:px-6 max-md:py-3 max-md:text-base"
						@click="emit('requestHelp')"
					>
						{{ ts("discord.launcher.learn_more") }}
					</Button>
				</aside>
			</AppLauncherBody>
		</template>

		<template v-else>
			<AppLauncherHeader :class="['px-4 max-md:pt-2', VIEW_IN_CLASS]">
				<AppLauncherBack
					ref="backRef"
					:aria-label="ts('discord.launcher.back')"
					@click="returnToMainView"
				>
					<UIcon name="ph:caret-left-bold" class="size-4" aria-hidden="true" />
				</AppLauncherBack>
				<h2 class="m-0 min-w-0 flex-1 truncate text-center text-base font-semibold">
					{{ activeListView ? viewTitle(activeListView) : "" }}
				</h2>
				<span class="size-8 shrink-0" aria-hidden="true" />
			</AppLauncherHeader>

			<AppLauncherBody :class="[scrollbarClassName, 'max-md:px-3', VIEW_IN_CLASS]">
				<AppLauncherList>
					<DiscordAppLauncherListItem
						v-for="entry of filteredActiveEntries"
						:key="entry.id"
						:name="entry.name"
						:description="entry.description"
						:avatar="entry.avatar"
						:icon="entry.icon"
						:icon-bg="entry.iconBg"
						:promoted="entry.promoted"
						@select="selectEntry(entry)"
					/>
				</AppLauncherList>
			</AppLauncherBody>
		</template>
	</AppLauncher>
</template>

<script lang="ts">
interface AppLauncherProps {
	recents?: readonly DiscordAppLauncherEntry[];
	serverApps?: readonly DiscordAppLauncherEntry[];
	/**
	 * Slash commands for search hits only — idle launcher has no static `/commands`
	 * listing; selecting one emits `select` for the parent execute/send flow.
	 */
	commands?: readonly DiscordAppLauncherEntry[];
	promoted?: readonly DiscordAppLauncherPromo[];
	categories?: readonly DiscordAppLauncherListView[];
	listViews?: readonly DiscordAppLauncherListView[];
	recentsListViewId?: string;
	serverAppsListViewId?: string;
	/** Mobile sheet snap on open (default `half`). */
	initialSheetSnap?: DiscordAppLauncherSheetSnap;
}

interface AppLauncherEmits {
	select: [entry: DiscordAppLauncherEntry];
	selectPromo: [promo: DiscordAppLauncherPromo];
	requestHelp: [];
	close: [];
}

const WordleCells = [
	"correct",
	"present",
	"absent",
	"absent",
	"correct",
	"present",
	"present",
	"absent",
	"correct",
] as const;

/** Phone sheet heights; the pointer drag clamps between them. */
const SHEET_HALF_HEIGHT = "min(55dvh, 22rem)";
/** Nearly the channel column under the header; the parent may hide the composer at full. */
const SHEET_FULL_HEIGHT = "min(92dvh, 40rem)";

/** Recents and In This Server on phones: two tiles fill the row and the next one peeks in. */
const MOBILE_CAROUSEL_CLASS = "-me-4 hidden gap-2 pe-4 max-md:flex";
const MOBILE_TILE_SLOT_CLASS = "w-[calc(50%-0.25rem)] shrink-0";
const MOBILE_TILE_CLASS = "min-h-15 gap-2.5 rounded-[12px] bg-newt-bg-elevated px-2.5 py-2.5";
const VIEW_IN_CLASS =
	"animate-in fade-in slide-in-from-right-1 duration-120 ease-out motion-reduce:animate-none";

interface SheetDragSession {
	pointerId: number;
	startY: number;
	startHeight: number;
	halfHeight: number;
	fullHeight: number;
	lastY: number;
	lastTime: number;
	velocityY: number;
}
</script>

<script setup lang="ts">
import type {
	DiscordAppLauncherEntry,
	DiscordAppLauncherListView,
	DiscordAppLauncherPromo,
	DiscordAppLauncherSheetSnap,
} from "~/types/discord";
import {
	AppLauncher,
	AppLauncherBack,
	AppLauncherBody,
	AppLauncherHandle,
	AppLauncherHeader,
	AppLauncherItemIcon,
	AppLauncherList,
	AppLauncherRecent,
	AppLauncherRecents,
	AppLauncherSearch,
	AppLauncherSearchInput,
	AppLauncherSection,
	AppLauncherSectionHeader,
	AppLauncherSectionTitle,
	AppLauncherViewMore,
} from "~/components/ui/app-launcher";
import { Button } from "~/components/ui/button";
import { scrollbarClassName } from "~/components/ui/scrollbar";

const { ts } = useI18n();
const {
	recents = discordAppLauncherRecents,
	serverApps = discordAppLauncherServerApps,
	commands = [],
	promoted = discordAppLauncherPromoted,
	categories = discordAppLauncherCategories,
	listViews = discordAppLauncherListViews,
	recentsListViewId = "recents",
	serverAppsListViewId = "server-apps",
	initialSheetSnap = "half",
} = defineProps<AppLauncherProps>();

const open = defineModel<boolean>("open", { default: false });
/** Mobile sheet snap — parent can hide the composer when this is `full`. */
const sheetSnap = defineModel<DiscordAppLauncherSheetSnap>("sheetSnap", { default: "half" });

const emit = defineEmits<AppLauncherEmits>();

const { effectiveReduceMotion } = useReduceMotion();
const activeElement = useActiveElement();

const rootRef = useTemplateRef("rootRef");
const searchRef = useTemplateRef("searchRef");
const backRef = useTemplateRef("backRef");

const searchQuery = ref("");
const activeView = ref<string | null>(null);
const sheetDragging = ref(false);
const sheetDragHeightPx = ref<number | null>(null);
let returnFocusElement: HTMLElement | null = null;

let sheetDragSession: SheetDragSession | null = null;

const sheetStyle = computed(() => ({
	"--discord-app-launcher-sheet-half": SHEET_HALF_HEIGHT,
	"--discord-app-launcher-sheet-full": SHEET_FULL_HEIGHT,
	...(sheetDragHeightPx.value === null
		? {}
		: { height: `${sheetDragHeightPx.value}px`, maxHeight: "none" }),
}));

const listViewById = computed(() => {
	const map = new Map<string, DiscordAppLauncherListView>();
	for (const view of [...listViews, ...categories]) {
		map.set(view.id, view);
	}
	return map;
});

const activeListView = computed(() => {
	if (activeView.value === null) return undefined;
	return listViewById.value.get(activeView.value);
});

// The list views' titles, by id; an unknown view keeps the title it came with.
const VIEW_TITLE_KEYS: Record<string, string> = {
	"action-games": "discord.launcher.views.action-games",
	"bot-games": "discord.launcher.views.bot-games",
	"card-games": "discord.launcher.views.card-games",
	"chill-together": "discord.launcher.views.chill-together",
	"puzzle-games": "discord.launcher.views.puzzle-games",
	"recents": "discord.launcher.views.recents",
	"server-apps": "discord.launcher.views.server-apps",
	"social-activities": "discord.launcher.views.social-activities",
	"strategy-games": "discord.launcher.views.strategy-games",
};

function viewTitle(view: DiscordAppLauncherListView): string {
	const key = VIEW_TITLE_KEYS[view.id];
	return key ? ts(key) : view.title;
}

const dialogLabel = computed(() =>
	activeListView.value ? viewTitle(activeListView.value) : ts("discord.launcher.apps"),
);

function matchesQuery(entry: DiscordAppLauncherEntry, query: string): boolean {
	if (!query) return true;
	const haystack =
		`${entry.name} ${entry.description ?? ""} ${entry.commandName ?? ""}`.toLowerCase();
	return haystack.includes(query);
}

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase());

const filteredCommands = computed(() => {
	const query = normalizedQuery.value;
	if (!query || activeView.value !== null) return [];
	return commands.filter((entry) => matchesQuery(entry, query));
});

const filteredRecents = computed(() =>
	recents.filter((entry) => matchesQuery(entry, normalizedQuery.value)).slice(0, 8),
);

const mobileRecents = computed(() =>
	filteredRecents.value.slice(0, DISCORD_APP_LAUNCHER_MOBILE_TILE_COUNT),
);

const filteredServerApps = computed(() =>
	serverApps.filter((entry) => matchesQuery(entry, normalizedQuery.value)),
);

const mobileServerApps = computed(() =>
	filteredServerApps.value.slice(0, DISCORD_APP_LAUNCHER_MOBILE_TILE_COUNT),
);

const showRecentsViewMore = computed(() => {
	const listCount = listViewById.value.get(recentsListViewId)?.entries.length ?? 0;
	return (
		shouldShowDiscordAppLauncherViewMore(listCount, filteredRecents.value.length) ||
		shouldShowDiscordAppLauncherViewMore(recents.length, mobileRecents.value.length)
	);
});

const showServerAppsViewMore = computed(() =>
	shouldShowDiscordAppLauncherViewMore(
		filteredServerApps.value.length,
		mobileServerApps.value.length,
	),
);

const filteredPromoted = computed(() => {
	const query = normalizedQuery.value;
	if (!query) return promoted;
	return promoted.filter((promo) => {
		const haystack =
			`${promo.title} ${promo.subtitle ?? ""} ${promo.description ?? ""}`.toLowerCase();
		return haystack.includes(query);
	});
});

const filteredCategories = computed<readonly DiscordAppLauncherListView[]>(() => {
	const query = normalizedQuery.value;
	if (!query) return categories;
	return categories
		.map((category) =>
			Object.assign({}, category, {
				entries: category.entries.filter((entry) => matchesQuery(entry, query)),
			}),
		)
		.filter((category) => category.entries.length > 0);
});

const filteredActiveEntries = computed(() => {
	const entries = activeListView.value?.entries ?? [];
	return entries.filter((entry) => matchesQuery(entry, normalizedQuery.value));
});

function categoryPreviewEntries(
	category: DiscordAppLauncherListView,
): readonly DiscordAppLauncherEntry[] {
	return category.entries.slice(0, DISCORD_APP_LAUNCHER_CATEGORY_PREVIEW_COUNT);
}

function shouldShowCategoryViewMore(category: DiscordAppLauncherListView): boolean {
	return shouldShowDiscordAppLauncherViewMore(
		category.entries.length,
		DISCORD_APP_LAUNCHER_CATEGORY_PREVIEW_COUNT,
	);
}

function isWolfstarEntry(entry: DiscordAppLauncherEntry): boolean {
	return entry.id.startsWith("wolfstar");
}

function recentTileLabel(entry: DiscordAppLauncherEntry): string {
	const title = entry.tileTitle ?? entry.name;
	const subtitle = entry.tileSubtitle;
	return subtitle ? `${title}, ${subtitle}` : title;
}

function promoAriaLabel(promo: DiscordAppLauncherPromo): string {
	const details = promo.description ?? promo.subtitle;
	return details ? `${promo.title}. ${details}` : promo.title;
}

function focusRef(target: Parameters<typeof unrefElement>[0]) {
	const element = unrefElement(target);
	if (element instanceof HTMLElement) element.focus();
}

// AppLauncherSearchInput has no `v-model`, so the value and its input event are bound by hand.
function onSearchInput(event: Event) {
	if (event.target instanceof HTMLInputElement) searchQuery.value = event.target.value;
}

function expandSheet() {
	sheetSnap.value = "full";
	sheetDragHeightPx.value = null;
}

function collapseSheet() {
	sheetSnap.value = "half";
	sheetDragHeightPx.value = null;
}

function resetSheetSnap() {
	sheetSnap.value = initialSheetSnap;
	sheetDragging.value = false;
	sheetDragHeightPx.value = null;
	sheetDragSession = null;
}

function measureCssHeight(height: string, fallback: number): number {
	const probe = document.createElement("div");
	probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;height:${height};`;
	document.body.append(probe);
	const measured = probe.getBoundingClientRect().height;
	probe.remove();
	return measured > 0 ? measured : fallback;
}

function onHandlePointerDown(event: PointerEvent) {
	if (!isBelowMediumScreen.value || event.button !== 0) return;
	const root = unrefElement(rootRef);
	if (!(root instanceof HTMLElement)) return;

	const startHeight = root.getBoundingClientRect().height;
	sheetDragSession = {
		pointerId: event.pointerId,
		startY: event.clientY,
		startHeight,
		halfHeight: measureCssHeight(SHEET_HALF_HEIGHT, 352),
		fullHeight: measureCssHeight(SHEET_FULL_HEIGHT, 640),
		lastY: event.clientY,
		lastTime: event.timeStamp,
		velocityY: 0,
	};
	sheetDragging.value = true;
	sheetDragHeightPx.value = startHeight;

	if (event.currentTarget instanceof HTMLElement) {
		event.currentTarget.setPointerCapture(event.pointerId);
	}
}

useEventListener(() => (sheetDragging.value ? window : null), "pointermove", onHandlePointerMove);
useEventListener(() => (sheetDragging.value ? window : null), "pointerup", onHandlePointerUp);
useEventListener(() => (sheetDragging.value ? window : null), "pointercancel", onHandlePointerUp);

function onHandlePointerMove(event: PointerEvent) {
	const session = sheetDragSession;
	if (!session || event.pointerId !== session.pointerId) return;

	const deltaY = event.clientY - session.startY;
	const nextHeight = Math.min(
		session.fullHeight,
		Math.max(session.halfHeight, session.startHeight - deltaY),
	);
	sheetDragHeightPx.value = nextHeight;

	const elapsed = Math.max(1, event.timeStamp - session.lastTime);
	session.velocityY = (event.clientY - session.lastY) / elapsed;
	session.lastY = event.clientY;
	session.lastTime = event.timeStamp;
}

function onHandlePointerUp(event: PointerEvent) {
	const session = sheetDragSession;
	if (!session || event.pointerId !== session.pointerId) return;

	const deltaY = event.clientY - session.startY;
	sheetSnap.value = resolveDiscordAppLauncherSheetSnap({
		current: sheetSnap.value,
		deltaY,
		velocityY: session.velocityY,
	});
	sheetDragging.value = false;
	sheetDragHeightPx.value = null;
	sheetDragSession = null;
}

function openListView(id: string) {
	if (!listViewById.value.has(id)) return;
	activeView.value = id;
	searchQuery.value = "";
	nextTick(() => focusRef(backRef));
}

function returnToMainView() {
	activeView.value = null;
	nextTick(() => focusRef(searchRef));
}

function selectEntry(entry: DiscordAppLauncherEntry) {
	emit("select", entry);
}

function onSearchEnter() {
	const firstCommand = filteredCommands.value[0];
	if (firstCommand) {
		selectEntry(firstCommand);
		return;
	}
	const firstApp = filteredServerApps.value[0] ?? filteredRecents.value[0];
	if (firstApp) selectEntry(firstApp);
}

function closeLauncher() {
	open.value = false;
	activeView.value = null;
	searchQuery.value = "";
	resetSheetSnap();
	emit("close");
}

function onEscape() {
	if (activeView.value !== null) {
		returnToMainView();
		return;
	}
	closeLauncher();
}

function onTab(event: KeyboardEvent) {
	const root = unrefElement(rootRef);
	if (!(root instanceof HTMLElement)) return;

	const focusable = Array.from(
		root.querySelectorAll<HTMLElement>(
			'button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
		),
	);
	const first = focusable[0];
	const last = focusable.at(-1);
	if (!first || !last) return;

	if (event.shiftKey && activeElement.value === first) {
		event.preventDefault();
		last.focus();
		return;
	}
	if (!event.shiftKey && activeElement.value === last) {
		event.preventDefault();
		first.focus();
	}
}

onClickOutside(rootRef, () => {
	if (open.value) closeLauncher();
});

watch(
	open,
	(isOpen, wasOpen) => {
		if (!isOpen) {
			activeView.value = null;
			searchQuery.value = "";
			resetSheetSnap();
			if (wasOpen) {
				nextTick(() => {
					returnFocusElement?.focus();
					returnFocusElement = null;
				});
			}
			return;
		}
		resetSheetSnap();
		if (activeElement.value instanceof HTMLElement) {
			returnFocusElement = activeElement.value;
		}
		nextTick(() => focusRef(searchRef));
	},
	// Seed `sheetSnap` from `initialSheetSnap` when stories mount with `open` already true.
	{ immediate: true },
);

onMounted(() => {
	if (open.value) focusRef(searchRef);
});
</script>

<style scoped>
/*
 * Mock art of the promoted cards. It draws other apps' brand art, so its
 * colours are fixed and do not follow the page theme. No newt/ui part covers it.
 */
.promo-art--wordle {
	flex-direction: column;
	gap: 0.5rem;
	background-color: oklch(93% 0.008 95);
	color: oklch(22% 0.02 260);
}

.promo-wordle-cell--correct {
	background-color: oklch(55% 0.14 145);
}

.promo-wordle-cell--present {
	background-color: oklch(75% 0.14 95);
}

.promo-wordle-cell--absent {
	background-color: oklch(55% 0.02 260);
}

.promo-wordle-subtitle {
	color: oklch(42% 0.02 260);
}

.promo-garden-face {
	color: oklch(22% 0.02 260);
}

.promo-art--garden {
	background-image:
		linear-gradient(180deg, oklch(78% 0.12 210), oklch(88% 0.1 95) 54%, oklch(62% 0.16 145)),
		radial-gradient(circle at 18% 18%, oklch(78% 0.16 340), transparent 28%);
}

.promo-garden-vine {
	border-bottom: 10px solid oklch(55% 0.18 145);
	transform: translateX(-50%) rotate(-7deg);
}

.promo-garden-leaf {
	border-radius: 40% 60% 55% 45%;
	background-color: oklch(55% 0.18 145);
}

.promo-garden-berry {
	background-color: oklch(58% 0.22 25);
	box-shadow: inset -4px -6px 0 oklch(0% 0 0 / 0.12);
}

.promo-garden-seed {
	background-color: oklch(95% 0.04 95);
}

.promo-garden-crown {
	background-color: oklch(55% 0.18 145);
	box-shadow:
		-6px 4px 0 -1px oklch(55% 0.18 145),
		6px 4px 0 -1px oklch(55% 0.18 145);
}

.promo-garden-flower {
	background-color: oklch(78% 0.16 340);
	box-shadow: 0 0 0 3px oklch(100% 0 0 / 0.35);
}

.promo-garden-title {
	color: oklch(78% 0.2 90);
	-webkit-text-stroke: 1px oklch(42% 0.2 305);
	text-shadow: 0 2px 0 oklch(42% 0.2 305);
}

.promo-art--farm {
	justify-content: flex-start;
	background-image: linear-gradient(
		180deg,
		oklch(83% 0.12 205),
		oklch(88% 0.13 105) 62%,
		oklch(66% 0.18 145)
	);
}

.promo-farm-sun {
	background-color: oklch(88% 0.17 85);
}

.promo-farm-field {
	background-image: repeating-linear-gradient(
		-15deg,
		oklch(57% 0.18 145) 0 10px,
		oklch(67% 0.18 125) 10px 20px
	);
}

.promo-farm-icon {
	color: oklch(52% 0.18 145);
	filter: drop-shadow(0 2px 0 oklch(100% 0 0 / 0.65));
}

.promo-farm-title {
	color: oklch(96% 0.01 95);
	text-shadow: 0 2px 0 oklch(43% 0.16 25);
}

.promo-art--watch {
	gap: 0.5rem;
	background-color: oklch(93% 0.004 270);
}

.promo-watch-icon {
	color: oklch(58% 0.22 25);
}

.promo-watch-title {
	color: oklch(28% 0.015 270);
}
</style>
