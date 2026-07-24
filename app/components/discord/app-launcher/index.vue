<template>
	<div
		v-if="open"
		ref="rootRef"
		class="discord-app-launcher"
		:class="{
			'discord-app-launcher--sheet-half': sheetSnap === 'half',
			'discord-app-launcher--sheet-full': sheetSnap === 'full',
			'discord-app-launcher--sheet-dragging': sheetDragging,
			'discord-app-launcher--reduce-motion': effectiveReduceMotion,
		}"
		:data-sheet-snap="sheetSnap"
		:style="sheetDragStyle"
		role="dialog"
		aria-modal="true"
		:aria-label="dialogLabel"
		@keydown.escape.prevent.stop="onEscape"
		@keydown.tab="onTab"
	>
		<button
			type="button"
			class="discord-app-launcher-handle"
			:tabindex="isMobileSheet ? 0 : -1"
			:aria-hidden="isMobileSheet ? undefined : 'true'"
			:aria-label="
				isMobileSheet
					? sheetSnap === 'full'
						? 'Collapse Apps sheet'
						: 'Expand Apps sheet'
					: undefined
			"
			:aria-expanded="isMobileSheet ? sheetSnap === 'full' : undefined"
			@pointerdown="onHandlePointerDown"
			@keydown.up.prevent="expandSheet"
			@keydown.down.prevent="collapseSheet"
		/>

		<!-- Main launcher -->
		<template v-if="activeView === null">
			<DiscordScrollbar
				class="discord-app-launcher-main-scroll"
				:min-thumb-height="14"
				:max-thumb-height="124"
				auto-hide
			>
				<div class="discord-app-launcher-main-content">
					<div class="discord-app-launcher-search-sticky">
						<div class="discord-app-launcher-search">
							<UIcon
								name="discord:search"
								class="discord-app-launcher-search-icon"
								aria-hidden="true"
							/>
							<input
								ref="searchRef"
								v-model="searchQuery"
								type="search"
								class="discord-app-launcher-search-input"
								placeholder="Search Apps & Commands"
								aria-label="Search Apps & Commands"
								autocomplete="off"
								spellcheck="false"
								@keydown.enter.prevent="onSearchEnter"
							/>
						</div>
					</div>

					<div class="discord-app-launcher-main-sections">
						<!-- Command hits appear only while searching — never a static /commands page. -->
						<section
							v-if="filteredCommands.length > 0"
							class="discord-app-launcher-section"
							aria-labelledby="discord-app-launcher-commands-heading"
						>
							<div class="discord-app-launcher-section-header">
								<h2
									id="discord-app-launcher-commands-heading"
									class="discord-app-launcher-section-title"
								>
									Commands
								</h2>
							</div>
							<div class="discord-app-launcher-server-list">
								<DiscordAppLauncherListItem
									v-for="(entry, index) of filteredCommands"
									:key="entry.id"
									:class="{
										'discord-app-launcher-server-row-bordered': index > 0,
									}"
									:name="entry.name"
									:description="entry.description"
									:avatar="entry.avatar"
									:icon="entry.icon"
									:icon-bg="entry.iconBg"
									:show-eye="false"
									@select="selectEntry(entry)"
								/>
							</div>
						</section>

						<section
							v-if="filteredRecents.length > 0"
							class="discord-app-launcher-section"
							aria-labelledby="discord-app-launcher-recents-heading"
						>
							<div class="discord-app-launcher-section-header">
								<h2
									id="discord-app-launcher-recents-heading"
									class="discord-app-launcher-section-title"
								>
									Recents
									<UIcon
										name="ph:caret-down-bold"
										class="discord-app-launcher-section-caret"
										aria-hidden="true"
									/>
								</h2>
								<button
									v-if="showRecentsViewMore"
									type="button"
									class="discord-app-launcher-view-more"
									@click="openListView(recentsListViewId)"
								>
									<span class="discord-app-launcher-view-more-desktop"
										>View More</span
									>
									<span class="discord-app-launcher-view-more-mobile"
										>View All</span
									>
								</button>
							</div>
							<!-- Desktop: icon-only horizontal strip -->
							<ul
								class="discord-app-launcher-recents discord-app-launcher-recents-desktop"
								role="list"
							>
								<li v-for="entry of filteredRecents" :key="entry.id">
									<button
										type="button"
										class="discord-app-launcher-recent"
										:title="entry.name"
										:aria-label="recentTileLabel(entry)"
										@click="selectEntry(entry)"
									>
										<span
											class="discord-app-launcher-recent-icon"
											:class="{
												'discord-app-launcher-recent-icon--wolfstar':
													isWolfstarEntry(entry),
											}"
											:style="
												entry.iconBg
													? { backgroundColor: entry.iconBg }
													: undefined
											"
											aria-hidden="true"
										>
											<NuxtImg
												v-if="entry.avatar"
												:src="entry.avatar"
												alt=""
												width="40"
												height="40"
												class="discord-app-launcher-recent-avatar"
												:class="{
													'discord-app-launcher-recent-avatar--wolfstar':
														isWolfstarEntry(entry),
												}"
											/>
											<UIcon
												v-else-if="entry.icon"
												:name="entry.icon"
												class="discord-app-launcher-recent-glyph"
											/>
										</span>
									</button>
								</li>
							</ul>
							<!-- Mobile: command/app tiles matching Discord iOS -->
							<ul
								class="discord-app-launcher-tile-grid discord-app-launcher-recents-mobile"
								role="list"
							>
								<li
									v-for="entry of mobileRecents"
									:key="`mobile-recent-${entry.id}`"
								>
									<button
										type="button"
										class="discord-app-launcher-tile"
										:aria-label="recentTileLabel(entry)"
										@click="selectEntry(entry)"
									>
										<span
											class="discord-app-launcher-tile-icon discord-app-launcher-tile-icon--round"
											:class="{
												'discord-app-launcher-tile-icon--wolfstar':
													isWolfstarEntry(entry),
											}"
											:style="
												entry.iconBg
													? { backgroundColor: entry.iconBg }
													: undefined
											"
											aria-hidden="true"
										>
											<NuxtImg
												v-if="entry.avatar"
												:src="entry.avatar"
												alt=""
												width="40"
												height="40"
												class="discord-app-launcher-tile-avatar"
												:class="{
													'discord-app-launcher-tile-avatar--wolfstar':
														isWolfstarEntry(entry),
												}"
											/>
											<UIcon
												v-else-if="entry.icon"
												:name="entry.icon"
												class="discord-app-launcher-tile-glyph"
											/>
										</span>
										<span class="discord-app-launcher-tile-copy">
											<span class="discord-app-launcher-tile-title">{{
												entry.tileTitle ?? entry.name
											}}</span>
											<span
												v-if="entry.tileSubtitle"
												class="discord-app-launcher-tile-subtitle"
											>
												{{ entry.tileSubtitle }}
											</span>
										</span>
									</button>
								</li>
							</ul>
						</section>

						<section
							v-if="filteredServerApps.length > 0"
							class="discord-app-launcher-section"
							aria-labelledby="discord-app-launcher-server-heading"
						>
							<div class="discord-app-launcher-section-header">
								<h2
									id="discord-app-launcher-server-heading"
									class="discord-app-launcher-section-title"
								>
									<span class="discord-app-launcher-server-title-desktop"
										>Apps in this Server</span
									>
									<span class="discord-app-launcher-server-title-mobile"
										>In This Server</span
									>
								</h2>
								<button
									v-if="showServerAppsViewMore"
									type="button"
									class="discord-app-launcher-view-more"
									@click="openListView(serverAppsListViewId)"
								>
									<span class="discord-app-launcher-view-more-desktop"
										>View More</span
									>
									<span class="discord-app-launcher-view-more-mobile"
										>View All</span
									>
								</button>
							</div>
							<div
								class="discord-app-launcher-server-list discord-app-launcher-server-list-desktop"
							>
								<DiscordAppLauncherListItem
									v-for="(entry, index) of filteredServerApps"
									:key="entry.id"
									:class="{
										'discord-app-launcher-server-row-bordered': index > 0,
									}"
									:name="entry.name"
									:description="entry.description"
									:avatar="entry.avatar"
									:icon="entry.icon"
									:icon-bg="entry.iconBg"
									:promoted="entry.promoted"
									@select="selectEntry(entry)"
								/>
							</div>
							<ul
								class="discord-app-launcher-tile-grid discord-app-launcher-server-mobile"
								role="list"
							>
								<li
									v-for="entry of mobileServerApps"
									:key="`mobile-server-${entry.id}`"
								>
									<button
										type="button"
										class="discord-app-launcher-tile"
										:aria-label="entry.name"
										@click="selectEntry(entry)"
									>
										<span
											class="discord-app-launcher-tile-icon discord-app-launcher-tile-icon--round"
											:class="{
												'discord-app-launcher-tile-icon--wolfstar':
													isWolfstarEntry(entry),
											}"
											:style="
												entry.iconBg
													? { backgroundColor: entry.iconBg }
													: undefined
											"
											aria-hidden="true"
										>
											<NuxtImg
												v-if="entry.avatar"
												:src="entry.avatar"
												alt=""
												width="40"
												height="40"
												class="discord-app-launcher-tile-avatar"
												:class="{
													'discord-app-launcher-tile-avatar--wolfstar':
														isWolfstarEntry(entry),
												}"
											/>
											<UIcon
												v-else-if="entry.icon"
												:name="entry.icon"
												class="discord-app-launcher-tile-glyph"
											/>
										</span>
										<span class="discord-app-launcher-tile-copy">
											<span class="discord-app-launcher-tile-title">{{
												entry.name
											}}</span>
										</span>
									</button>
								</li>
							</ul>
						</section>

						<section
							v-if="filteredPromoted.length > 0 && !searchQuery.trim()"
							class="discord-app-launcher-section"
							aria-labelledby="discord-app-launcher-promoted-heading"
						>
							<div class="discord-app-launcher-section-header">
								<h2
									id="discord-app-launcher-promoted-heading"
									class="discord-app-launcher-section-title"
								>
									Promoted
								</h2>
							</div>
							<div class="discord-app-launcher-promoted-grid">
								<button
									v-for="promo of filteredPromoted"
									:key="promo.id"
									type="button"
									class="discord-app-launcher-promo"
									:class="`discord-app-launcher-promo-${promo.variant}`"
									:aria-label="promoAriaLabel(promo)"
									@click="emit('selectPromo', promo)"
								>
									<span
										class="discord-app-launcher-promo-visual"
										:class="`discord-app-launcher-promo-visual-${promo.variant}`"
										aria-hidden="true"
									>
										<template v-if="promo.variant === 'wordle'">
											<span class="discord-app-launcher-promo-wordle-grid">
												<span
													v-for="(cell, cellIndex) of WordleCells"
													:key="`${cell}-${cellIndex}`"
													class="discord-app-launcher-promo-wordle-cell"
													:class="`discord-app-launcher-promo-wordle-cell-${cell}`"
												/>
											</span>
											<span class="discord-app-launcher-promo-wordle-title">{{
												promo.title
											}}</span>
											<span
												v-if="promo.subtitle"
												class="discord-app-launcher-promo-wordle-subtitle"
											>
												{{ promo.subtitle }}
											</span>
										</template>
										<template v-else-if="promo.variant === 'garden'">
											<span class="discord-app-launcher-promo-garden-vine" />
											<span
												class="discord-app-launcher-promo-garden-leaf discord-app-launcher-promo-garden-leaf-a"
											/>
											<span
												class="discord-app-launcher-promo-garden-leaf discord-app-launcher-promo-garden-leaf-b"
											/>
											<span class="discord-app-launcher-promo-garden-berry">
												<span
													class="discord-app-launcher-promo-garden-berry-body"
												/>
												<span class="discord-app-launcher-promo-garden-face"
													>•ᴗ•</span
												>
												<span
													class="discord-app-launcher-promo-garden-berry-seed discord-app-launcher-promo-garden-berry-seed-1"
												/>
												<span
													class="discord-app-launcher-promo-garden-berry-seed discord-app-launcher-promo-garden-berry-seed-2"
												/>
												<span
													class="discord-app-launcher-promo-garden-berry-seed discord-app-launcher-promo-garden-berry-seed-3"
												/>
												<span
													class="discord-app-launcher-promo-garden-berry-crown"
												/>
											</span>
											<span
												class="discord-app-launcher-promo-garden-flower"
											/>
											<span class="discord-app-launcher-promo-garden-title">
												<template
													v-for="(
														line, lineIndex
													) of splitDiscordAppLauncherPromoTitle(
														promo.title,
													)"
													:key="`${promo.id}-garden-${lineIndex}`"
												>
													<br v-if="lineIndex > 0" />{{ line }}
												</template>
											</span>
										</template>
										<template v-else-if="promo.variant === 'farm'">
											<span class="discord-app-launcher-promo-farm-sun" />
											<span class="discord-app-launcher-promo-farm-field" />
											<UIcon
												name="ph:plant-fill"
												class="discord-app-launcher-promo-farm-icon"
											/>
											<span class="discord-app-launcher-promo-farm-title">
												<template
													v-for="(
														line, lineIndex
													) of splitDiscordAppLauncherPromoTitle(
														promo.title,
													)"
													:key="`${promo.id}-farm-${lineIndex}`"
												>
													<br v-if="lineIndex > 0" />{{ line }}
												</template>
											</span>
										</template>
										<template v-else>
											<UIcon
												name="ph:youtube-logo-fill"
												class="discord-app-launcher-promo-watch-icon"
											/>
											<span class="discord-app-launcher-promo-watch-title">{{
												promo.title
											}}</span>
										</template>
									</span>
									<span class="discord-app-launcher-promo-footer">
										<span
											class="discord-app-launcher-promo-icon"
											:style="
												promo.iconBg
													? { backgroundColor: promo.iconBg }
													: undefined
											"
											aria-hidden="true"
										>
											<UIcon v-if="promo.icon" :name="promo.icon" />
										</span>
										<span class="discord-app-launcher-promo-copy">
											<span class="discord-app-launcher-promo-title-row">
												<span class="discord-app-launcher-promo-title">{{
													promo.title
												}}</span>
												<UIcon
													name="ph:eye-bold"
													class="discord-app-launcher-promo-eye"
													aria-hidden="true"
												/>
											</span>
											<span
												v-if="promo.description"
												class="discord-app-launcher-promo-description"
											>
												{{ promo.description }}
											</span>
										</span>
									</span>
								</button>
							</div>
						</section>

						<section
							v-for="category of filteredCategories"
							:key="category.id"
							class="discord-app-launcher-section discord-app-launcher-category"
							:aria-labelledby="`discord-app-launcher-${category.id}-heading`"
						>
							<div class="discord-app-launcher-section-header">
								<h2
									:id="`discord-app-launcher-${category.id}-heading`"
									class="discord-app-launcher-section-title"
								>
									{{ category.title }}
								</h2>
								<button
									v-if="shouldShowCategoryViewMore(category)"
									type="button"
									class="discord-app-launcher-view-more discord-app-launcher-view-more-header"
									@click="openListView(category.id)"
								>
									View More
								</button>
							</div>
							<div class="discord-app-launcher-server-list">
								<DiscordAppLauncherListItem
									v-for="(entry, index) of categoryPreviewEntries(category)"
									:key="entry.id"
									:class="{
										'discord-app-launcher-server-row-bordered': index > 0,
									}"
									:name="entry.name"
									:description="entry.description"
									:avatar="entry.avatar"
									:icon="entry.icon"
									:icon-bg="entry.iconBg"
									:promoted="entry.promoted"
									@select="selectEntry(entry)"
								/>
							</div>
							<button
								v-if="shouldShowCategoryViewMore(category)"
								type="button"
								class="discord-app-launcher-view-more discord-app-launcher-view-more-footer"
								@click="openListView(category.id)"
							>
								View More
							</button>
						</section>

						<aside v-if="!normalizedQuery" class="discord-app-launcher-help">
							<span>
								<strong>Have Questions?</strong>
								<span
									>Visit our help center to learn more about using and discovering
									apps on Discord.</span
								>
							</span>
							<button type="button" @click="emit('requestHelp')">Learn More</button>
						</aside>
					</div>
				</div>
			</DiscordScrollbar>
		</template>

		<!-- Secondary list view (View More / Chill Together) -->
		<template v-else>
			<header class="discord-app-launcher-list-header">
				<button
					ref="backRef"
					type="button"
					class="discord-app-launcher-back"
					aria-label="Back to Apps"
					@click="returnToMainView"
				>
					<UIcon name="ph:caret-left-bold" class="size-4" aria-hidden="true" />
				</button>
				<h2 class="discord-app-launcher-list-title">{{ activeListView?.title }}</h2>
				<span class="discord-app-launcher-back-spacer" aria-hidden="true" />
			</header>

			<DiscordScrollbar
				class="discord-app-launcher-list-scroll"
				:min-thumb-height="14"
				:max-thumb-height="40"
				auto-hide
			>
				<div class="discord-app-launcher-list-body">
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
				</div>
			</DiscordScrollbar>
		</template>
	</div>
</template>

<script lang="ts">
import type {
	DiscordAppLauncherEntry,
	DiscordAppLauncherListView,
	DiscordAppLauncherPromo,
	DiscordAppLauncherSheetSnap,
} from "~/types/discord";

interface AppLauncherProps {
	/** Recent activity / app icons shown in the horizontal Recents row. */
	recents?: readonly DiscordAppLauncherEntry[];
	/** Vertical “Apps in this Server” list. */
	serverApps?: readonly DiscordAppLauncherEntry[];
	/**
	 * Slash commands searchable from the launcher.
	 * Shown only while the search query is non-empty; selecting one emits `select`
	 * so the parent can run the interactive execute/send flow (no `/commands` page).
	 */
	commands?: readonly DiscordAppLauncherEntry[];
	/** Promoted activity cards. */
	promoted?: readonly DiscordAppLauncherPromo[];
	/** Category previews rendered below Promoted in the main scroll view. */
	categories?: readonly DiscordAppLauncherListView[];
	/** Secondary list destinations opened via View More. */
	listViews?: readonly DiscordAppLauncherListView[];
	/** List view id opened by Recents → View More. */
	recentsListViewId?: string;
	/** List view id opened by Apps in this Server → View More. */
	serverAppsListViewId?: string;
	/** Initial mobile sheet snap when the launcher opens (`half` by default). */
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
</script>

<script setup lang="ts">
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

const emit = defineEmits<AppLauncherEmits>();

const { effectiveReduceMotion } = useReduceMotion();
const isMobileSheet = useMediaQuery("(width < 48rem)");

const rootRef = useTemplateRef<HTMLElement>("rootRef");
const searchRef = useTemplateRef<HTMLInputElement>("searchRef");
const backRef = useTemplateRef<HTMLButtonElement>("backRef");

const searchQuery = ref("");
const activeView = ref<string | null>(null);
const sheetSnap = ref<DiscordAppLauncherSheetSnap>(initialSheetSnap);
const sheetDragging = ref(false);
const sheetDragHeightPx = ref<number | null>(null);
let returnFocusElement: HTMLElement | null = null;

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

let sheetDragSession: SheetDragSession | null = null;

const sheetDragStyle = computed(() => {
	if (sheetDragHeightPx.value === null) return undefined;
	return {
		height: `${sheetDragHeightPx.value}px`,
		maxHeight: "none",
	};
});

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

const dialogLabel = computed(() => (activeListView.value ? activeListView.value.title : "Apps"));

function matchesQuery(entry: DiscordAppLauncherEntry, query: string): boolean {
	if (!query) return true;
	const haystack =
		`${entry.name} ${entry.description ?? ""} ${entry.commandName ?? ""}`.toLowerCase();
	return haystack.includes(query);
}

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase());

/** Commands only surface as search hits — idle launcher has no static commands listing. */
const filteredCommands = computed(() => {
	const query = normalizedQuery.value;
	if (!query || activeView.value !== null) return [];
	return commands.filter((entry) => matchesQuery(entry, query));
});

const filteredRecents = computed(() =>
	recents.filter((entry) => matchesQuery(entry, normalizedQuery.value)).slice(0, 8),
);

/** Mobile Recents strip shows two compact command/app tiles. */
const mobileRecents = computed(() =>
	filteredRecents.value.slice(0, DISCORD_APP_LAUNCHER_MOBILE_TILE_COUNT),
);

const filteredServerApps = computed(() =>
	serverApps.filter((entry) => matchesQuery(entry, normalizedQuery.value)),
);

/** Mobile “In This Server” strip shows two app tiles. */
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
	return entry.avatar === "/avatars/wolfstar.png" || entry.id.startsWith("wolfstar");
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

function resolveSheetHeightBounds(root: HTMLElement): { half: number; full: number } {
	const styles = getComputedStyle(root);
	const halfToken = styles.getPropertyValue("--discord-app-launcher-sheet-half").trim();
	const fullToken = styles.getPropertyValue("--discord-app-launcher-sheet-full").trim();
	const halfProbe = document.createElement("div");
	halfProbe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;height:${halfToken || "min(55dvh, 22rem)"};`;
	const fullProbe = document.createElement("div");
	fullProbe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;height:${fullToken || "min(90dvh, 32rem)"};`;
	document.body.append(halfProbe, fullProbe);
	const half = halfProbe.getBoundingClientRect().height;
	const full = fullProbe.getBoundingClientRect().height;
	halfProbe.remove();
	fullProbe.remove();
	return {
		half: half > 0 ? half : 352,
		full: full > 0 ? full : 512,
	};
}

function onHandlePointerDown(event: PointerEvent) {
	if (!isMobileSheet.value || event.button !== 0) return;
	const root = rootRef.value;
	if (!root) return;

	const bounds = resolveSheetHeightBounds(root);
	const startHeight = root.getBoundingClientRect().height;
	sheetDragSession = {
		pointerId: event.pointerId,
		startY: event.clientY,
		startHeight,
		halfHeight: bounds.half,
		fullHeight: bounds.full,
		lastY: event.clientY,
		lastTime: event.timeStamp,
		velocityY: 0,
	};
	sheetDragging.value = true;
	sheetDragHeightPx.value = startHeight;

	if (event.currentTarget instanceof HTMLElement) {
		event.currentTarget.setPointerCapture(event.pointerId);
	}

	window.addEventListener("pointermove", onHandlePointerMove);
	window.addEventListener("pointerup", onHandlePointerUp);
	window.addEventListener("pointercancel", onHandlePointerUp);
}

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

	window.removeEventListener("pointermove", onHandlePointerMove);
	window.removeEventListener("pointerup", onHandlePointerUp);
	window.removeEventListener("pointercancel", onHandlePointerUp);

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
	nextTick(() => {
		backRef.value?.focus();
	});
}

function returnToMainView() {
	activeView.value = null;
	nextTick(() => {
		searchRef.value?.focus();
	});
}

function selectEntry(entry: DiscordAppLauncherEntry) {
	emit("select", entry);
}

/** Enter in search runs the first matching command (interactive send), if any. */
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
	const root = rootRef.value;
	if (!root) return;

	const focusable = Array.from(
		root.querySelectorAll<HTMLElement>(
			'button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
		),
	);
	const first = focusable[0];
	const last = focusable.at(-1);
	if (!first || !last) return;

	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
		return;
	}
	if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}

onClickOutside(rootRef, () => {
	if (open.value) closeLauncher();
});

watch(open, (isOpen, wasOpen) => {
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
	if (document.activeElement instanceof HTMLElement) {
		returnFocusElement = document.activeElement;
	}
	nextTick(() => {
		searchRef.value?.focus();
	});
});

onMounted(() => {
	if (open.value) searchRef.value?.focus();
});

onBeforeUnmount(() => {
	window.removeEventListener("pointermove", onHandlePointerMove);
	window.removeEventListener("pointerup", onHandlePointerUp);
	window.removeEventListener("pointercancel", onHandlePointerUp);
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-app-launcher {
	--discord-app-launcher-bg: rgb(41 40 45);
	--discord-app-launcher-nested: rgb(50 49 54);
	--discord-app-launcher-text: oklch(95% 0.004 272);
	--discord-app-launcher-header: oklch(82% 0.01 272);
	--discord-app-launcher-muted: oklch(68% 0.012 272);
	--discord-app-launcher-link: oklch(72% 0.11 264);
	--discord-app-launcher-focus: oklch(58% 0.21 274);
	--discord-app-launcher-search-bg: oklch(18% 0.005 272);
	--discord-app-launcher-divider: oklch(100% 0 0 / 0.06);
	--discord-app-launcher-icon-bg: oklch(32% 0.01 264);
	--discord-app-launcher-shadow: oklch(0% 0 0 / 0.5);
	--discord-app-launcher-wordle-bg: oklch(93% 0.008 95);
	--discord-app-launcher-wordle-title: oklch(22% 0.02 260);
	--discord-app-launcher-wordle-subtitle: oklch(42% 0.02 260);
	--discord-app-launcher-wordle-correct: oklch(55% 0.14 145);
	--discord-app-launcher-wordle-present: oklch(75% 0.14 95);
	--discord-app-launcher-wordle-absent: oklch(55% 0.02 260);
	--discord-app-launcher-garden-sky-from: oklch(78% 0.12 210);
	--discord-app-launcher-garden-sky-to: oklch(88% 0.1 95);
	--discord-app-launcher-garden-hill: oklch(62% 0.16 145);
	--discord-app-launcher-garden-leaf: oklch(55% 0.18 145);
	--discord-app-launcher-garden-berry: oklch(58% 0.22 25);
	--discord-app-launcher-garden-seed: oklch(95% 0.04 95);
	--discord-app-launcher-garden-flower: oklch(78% 0.16 340);
	--discord-app-launcher-back-bg: oklch(32% 0.01 264);
	--discord-app-launcher-back-hover: oklch(38% 0.012 268);
	--discord-app-launcher-help-bg: rgb(50 49 54);
	--discord-app-launcher-wolfstar-bg: oklch(0% 0 0);

	@apply flex h-[min(42.5rem,calc(100dvh-2rem))] max-h-[42.5rem] w-full max-w-[31.5rem] flex-col overflow-hidden rounded-xl border font-whitney shadow-xl;
	background-color: var(--discord-app-launcher-bg);
	border-color: var(--discord-app-launcher-divider);
	color: var(--discord-app-launcher-text);
	box-shadow: 0 8px 24px var(--discord-app-launcher-shadow);
}

.discord-app-launcher-main-scroll {
	@apply min-h-0 flex-1;
	max-height: 100%;
}

.discord-app-launcher-main-content {
	@apply px-4 pb-4;
}

.discord-app-launcher-search-sticky {
	@apply sticky top-0 z-2 pt-4 pb-4;
	background-color: var(--discord-app-launcher-bg);
}

.discord-app-launcher-main-sections {
	@apply flex flex-col gap-6;
}

.discord-app-launcher-search {
	@apply relative flex items-center;
}

.discord-app-launcher-search-icon {
	@apply pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2;
	color: var(--discord-app-launcher-muted);
}

.discord-app-launcher-search-input {
	@apply h-10 w-full rounded-lg border-2 bg-transparent py-0 pr-3 pl-10 text-[15px] outline-none;
	appearance: none;
	background-color: var(--discord-app-launcher-search-bg);
	border-color: transparent;
	color: var(--discord-app-launcher-text);
}

.discord-app-launcher-search-input:focus,
.discord-app-launcher-search-input:focus-visible {
	border-color: var(--discord-app-launcher-focus);
}

.discord-app-launcher-search-input::placeholder {
	color: var(--discord-app-launcher-muted);
	opacity: 1;
}

.discord-app-launcher-section {
	@apply flex flex-col gap-2;
}

.discord-app-launcher-section-header {
	@apply flex items-center justify-between gap-2 px-0.5;
}

.discord-app-launcher-section-title {
	@apply m-0 inline-flex items-center gap-1 text-sm font-semibold;
	color: var(--discord-app-launcher-header);
}

.discord-app-launcher-section-caret {
	@apply hidden size-3.5;
	color: var(--discord-app-launcher-header);
}

.discord-app-launcher-view-more {
	@apply cursor-pointer border-0 bg-transparent p-0 text-sm font-medium;
	color: var(--discord-app-launcher-link);
}

.discord-app-launcher-view-more:hover {
	text-decoration: underline;
}

.discord-app-launcher-view-more:focus-visible {
	@apply rounded outline-2 outline-offset-2 outline-primary;
}

.discord-app-launcher-view-more-mobile,
.discord-app-launcher-server-title-mobile,
.discord-app-launcher-view-more-footer,
.discord-app-launcher-handle,
.discord-app-launcher-recents-mobile,
.discord-app-launcher-server-mobile {
	display: none;
}

.discord-app-launcher-view-more-desktop,
.discord-app-launcher-server-title-desktop {
	display: inline;
}

.discord-app-launcher-recents {
	@apply m-0 flex list-none gap-3 overflow-x-auto p-0;
	scrollbar-width: none;
}

.discord-app-launcher-recents::-webkit-scrollbar {
	display: none;
}

.discord-app-launcher-recent {
	@apply inline-flex cursor-pointer border-0 bg-transparent p-0;
}

.discord-app-launcher-recent:focus-visible {
	@apply rounded-xl outline-2 outline-offset-2 outline-primary;
}

.discord-app-launcher-recent-icon {
	@apply inline-flex size-12 items-center justify-center overflow-hidden rounded-xl;
	background-color: var(--discord-app-launcher-icon-bg);
	transition: filter 0.12s ease;
}

.discord-app-launcher-recent-icon--wolfstar {
	background-color: var(--discord-app-launcher-wolfstar-bg);
}

.discord-app-launcher-recent:hover .discord-app-launcher-recent-icon {
	filter: brightness(1.1);
}

.discord-app-launcher-recent-avatar {
	@apply size-full object-cover;
}

.discord-app-launcher-recent-avatar--wolfstar {
	@apply object-contain p-1;
}

.discord-app-launcher-recent-glyph {
	@apply size-6 text-white;
}

.discord-app-launcher-server-list {
	@apply flex flex-col overflow-hidden rounded-xl;
	background-color: var(--discord-app-launcher-nested);
}

.discord-app-launcher-server-list :deep(.discord-app-launcher-list-item) {
	@apply rounded-none px-3 py-3;
}

.discord-app-launcher-server-row-bordered {
	position: relative;
	border-top: none;
}

.discord-app-launcher-server-row-bordered::before {
	content: "";
	position: absolute;
	top: 0;
	right: 0;
	left: 3.75rem;
	border-top: 1px solid var(--discord-app-launcher-divider);
}

.discord-app-launcher-promoted-grid {
	@apply grid grid-cols-2 gap-2.5;
}

.discord-app-launcher-promo {
	@apply relative flex h-[7.75rem] cursor-pointer flex-col items-center justify-end overflow-hidden rounded-2xl border-0 p-0 text-left;
}

.discord-app-launcher-promo:focus-visible {
	@apply outline-2 outline-offset-2 outline-primary;
}

.discord-app-launcher-promo-wordle {
	@apply items-center justify-center gap-2 p-3;
	background-color: var(--discord-app-launcher-wordle-bg);
	color: var(--discord-app-launcher-wordle-title);
}

.discord-app-launcher-promo-wordle-mark {
	@apply flex items-center justify-center;
}

.discord-app-launcher-promo-wordle-grid {
	@apply grid grid-cols-3 gap-[3px];
}

.discord-app-launcher-promo-wordle-cell {
	@apply size-3.5 rounded-[2px];
}

.discord-app-launcher-promo-wordle-cell-correct {
	background-color: var(--discord-app-launcher-wordle-correct);
}

.discord-app-launcher-promo-wordle-cell-present {
	background-color: var(--discord-app-launcher-wordle-present);
}

.discord-app-launcher-promo-wordle-cell-absent {
	background-color: var(--discord-app-launcher-wordle-absent);
}

.discord-app-launcher-promo-wordle-copy {
	@apply flex flex-col items-center gap-1 text-center;
}

.discord-app-launcher-promo-wordle-title {
	@apply text-[1.35rem] leading-none font-bold tracking-tight;
	font-family: var(--font-whitney), "Helvetica Neue", Arial, sans-serif;
	letter-spacing: 0.02em;
}

.discord-app-launcher-promo-wordle-subtitle {
	@apply text-[10px] leading-tight font-semibold tracking-[0.04em];
	color: var(--discord-app-launcher-wordle-subtitle);
}

.discord-app-launcher-promo-garden {
	color: oklch(100% 0 0);
}

.discord-app-launcher-promo-garden-scene {
	@apply absolute inset-0 overflow-hidden;
	background-image: linear-gradient(
		180deg,
		var(--discord-app-launcher-garden-sky-from),
		var(--discord-app-launcher-garden-sky-to) 55%,
		var(--discord-app-launcher-garden-hill)
	);
}

.discord-app-launcher-promo-garden-sky {
	@apply absolute inset-x-0 top-0 h-1/2;
}

.discord-app-launcher-promo-garden-hill {
	@apply absolute inset-x-[-10%] bottom-0 h-[48%] rounded-t-[50%];
	background-color: var(--discord-app-launcher-garden-hill);
}

.discord-app-launcher-promo-garden-leaf {
	@apply absolute block size-7 rounded-[40%_60%_55%_45%];
	background-color: var(--discord-app-launcher-garden-leaf);
	transform: rotate(-25deg);
}

.discord-app-launcher-promo-garden-leaf-a {
	bottom: 42%;
	left: 14%;
}

.discord-app-launcher-promo-garden-leaf-b {
	right: 12%;
	bottom: 38%;
	transform: rotate(28deg) scale(0.85);
}

.discord-app-launcher-promo-garden-berry {
	@apply absolute left-1/2 size-11 -translate-x-1/2;
	bottom: 34%;
}

.discord-app-launcher-promo-garden-berry-body {
	@apply absolute inset-0 rounded-[45%_45%_50%_50%];
	background-color: var(--discord-app-launcher-garden-berry);
	box-shadow: inset -4px -6px 0 oklch(0% 0 0 / 0.12);
}

.discord-app-launcher-promo-garden-berry-seed {
	@apply absolute size-1 rounded-full;
	background-color: var(--discord-app-launcher-garden-seed);
}

.discord-app-launcher-promo-garden-berry-seed-1 {
	top: 38%;
	left: 28%;
}

.discord-app-launcher-promo-garden-berry-seed-2 {
	top: 52%;
	left: 52%;
}

.discord-app-launcher-promo-garden-berry-seed-3 {
	top: 30%;
	left: 58%;
}

.discord-app-launcher-promo-garden-berry-crown {
	@apply absolute top-[-6px] left-1/2 size-4 -translate-x-1/2 rounded-full;
	background-color: var(--discord-app-launcher-garden-leaf);
	box-shadow:
		-6px 4px 0 -1px var(--discord-app-launcher-garden-leaf),
		6px 4px 0 -1px var(--discord-app-launcher-garden-leaf);
}

.discord-app-launcher-promo-garden-flower {
	@apply absolute size-3 rounded-full;
	right: 22%;
	bottom: 28%;
	background-color: var(--discord-app-launcher-garden-flower);
	box-shadow: 0 0 0 3px oklch(100% 0 0 / 0.35);
}

.discord-app-launcher-promo-garden-title {
	@apply relative z-1 mb-2.5 text-[11px] font-extrabold tracking-[0.12em] uppercase;
	text-shadow: 0 1px 3px oklch(0% 0 0 / 0.45);
}

.discord-app-launcher-promo {
	@apply h-auto items-stretch justify-start rounded-xl p-0;
	background-color: var(--discord-app-launcher-nested);
}

.discord-app-launcher-promo-wordle {
	@apply gap-0 p-0;
	background-color: var(--discord-app-launcher-nested);
}

.discord-app-launcher-promo-visual {
	@apply relative flex h-32 w-full shrink-0 items-center justify-center overflow-hidden;
}

.discord-app-launcher-promo-visual-wordle {
	@apply flex-col gap-2;
	background-color: var(--discord-app-launcher-wordle-bg);
	color: var(--discord-app-launcher-wordle-title);
}

.discord-app-launcher-promo-wordle-title {
	@apply text-3xl leading-none font-bold tracking-tight;
	font-family: Georgia, "Times New Roman", serif;
}

.discord-app-launcher-promo-visual-garden {
	background-image:
		linear-gradient(
			180deg,
			var(--discord-app-launcher-garden-sky-from),
			var(--discord-app-launcher-garden-sky-to) 54%,
			var(--discord-app-launcher-garden-hill)
		),
		radial-gradient(
			circle at 18% 18%,
			var(--discord-app-launcher-garden-flower),
			transparent 28%
		);
}

.discord-app-launcher-promo-garden-vine {
	@apply absolute -top-7 left-1/2 h-20 w-32 -translate-x-1/2 rounded-[50%];
	border-bottom: 10px solid var(--discord-app-launcher-garden-leaf);
	transform: translateX(-50%) rotate(-7deg);
}

.discord-app-launcher-promo-garden-leaf-a {
	bottom: 48%;
	left: 12%;
}

.discord-app-launcher-promo-garden-leaf-b {
	right: 10%;
	bottom: 47%;
}

.discord-app-launcher-promo-garden-berry {
	@apply size-14;
	bottom: 36%;
}

.discord-app-launcher-promo-garden-face {
	@apply absolute inset-0 z-1 flex items-center justify-center text-sm font-black;
	color: var(--discord-app-launcher-wordle-title);
}

.discord-app-launcher-promo-garden-title {
	@apply absolute right-5 bottom-2 z-1 m-0 -rotate-3 text-center text-lg leading-[0.78] font-black tracking-[-0.04em];
	color: oklch(78% 0.2 90);
	-webkit-text-stroke: 1px oklch(42% 0.2 305);
	text-shadow: 0 2px 0 oklch(42% 0.2 305);
}

.discord-app-launcher-promo-visual-farm {
	@apply justify-start;
	background-image: linear-gradient(
		180deg,
		oklch(83% 0.12 205),
		oklch(88% 0.13 105) 62%,
		oklch(66% 0.18 145)
	);
}

.discord-app-launcher-promo-farm-sun {
	@apply absolute top-3 right-5 size-8 rounded-full;
	background-color: oklch(88% 0.17 85);
}

.discord-app-launcher-promo-farm-field {
	@apply absolute inset-x-0 bottom-0 h-12;
	background-image: repeating-linear-gradient(
		-15deg,
		oklch(57% 0.18 145) 0 10px,
		oklch(67% 0.18 125) 10px 20px
	);
}

.discord-app-launcher-promo-farm-icon {
	@apply relative z-1 ml-5 size-16;
	color: oklch(52% 0.18 145);
	filter: drop-shadow(0 2px 0 oklch(100% 0 0 / 0.65));
}

.discord-app-launcher-promo-farm-title {
	@apply relative z-1 ml-2 -rotate-6 text-xl leading-[0.85] font-black uppercase;
	color: oklch(96% 0.01 95);
	text-shadow: 0 2px 0 oklch(43% 0.16 25);
}

.discord-app-launcher-promo-visual-watch {
	@apply gap-2;
	background-color: oklch(93% 0.004 270);
}

.discord-app-launcher-promo-watch-icon {
	@apply size-12;
	color: oklch(58% 0.22 25);
}

.discord-app-launcher-promo-watch-title {
	@apply text-3xl font-bold tracking-tight;
	color: oklch(28% 0.015 270);
}

.discord-app-launcher-promo-footer {
	@apply flex min-h-14 items-center gap-2.5 px-2.5 py-2;
}

.discord-app-launcher-promo-icon {
	@apply inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-xl;
	color: var(--discord-app-launcher-wordle-title);
}

.discord-app-launcher-promo-copy {
	@apply flex min-w-0 flex-1 flex-col gap-0.5;
}

.discord-app-launcher-promo-title-row {
	@apply flex min-w-0 items-center gap-1;
}

.discord-app-launcher-promo-title {
	@apply truncate text-sm leading-tight font-semibold;
	color: var(--discord-app-launcher-text);
}

.discord-app-launcher-promo-eye {
	@apply size-4 shrink-0;
	color: var(--discord-app-launcher-muted);
}

.discord-app-launcher-promo-description {
	@apply truncate text-xs leading-snug;
	color: var(--discord-app-launcher-muted);
}

.discord-app-launcher-help {
	@apply flex items-center justify-between gap-4 rounded-xl px-4 py-3;
	background-color: var(--discord-app-launcher-help-bg);
}

.discord-app-launcher-help > span {
	@apply flex min-w-0 flex-col gap-1;
}

.discord-app-launcher-help strong {
	@apply text-lg leading-tight font-bold;
}

.discord-app-launcher-help > span > span {
	@apply text-xs leading-snug;
	color: var(--discord-app-launcher-header);
}

.discord-app-launcher-help button {
	@apply shrink-0 cursor-pointer rounded-lg border-0 px-4 py-2.5 text-sm font-semibold text-white;
	background-color: var(--discord-app-launcher-focus);
}

.discord-app-launcher-help button:hover {
	filter: brightness(1.08);
}

.discord-app-launcher-help button:focus-visible {
	@apply outline-2 outline-offset-2 outline-primary;
}

.discord-app-launcher-tile-grid {
	@apply m-0 grid list-none grid-cols-2 gap-2 p-0;
}

.discord-app-launcher-tile {
	@apply flex w-full cursor-pointer items-center gap-2.5 rounded-xl border-0 px-2.5 py-2.5 text-left;
	background-color: var(--discord-app-launcher-nested);
	color: var(--discord-app-launcher-text);
}

.discord-app-launcher-tile:focus-visible {
	@apply outline-2 outline-offset-2 outline-primary;
}

.discord-app-launcher-tile:hover .discord-app-launcher-tile-icon {
	filter: brightness(1.1);
}

.discord-app-launcher-tile-icon {
	@apply inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl;
	background-color: var(--discord-app-launcher-icon-bg);
}

.discord-app-launcher-tile-icon--round {
	@apply rounded-full;
}

.discord-app-launcher-tile-icon--wolfstar {
	background-color: var(--discord-app-launcher-wolfstar-bg);
}

.discord-app-launcher-tile-avatar {
	@apply size-full object-cover;
}

.discord-app-launcher-tile-avatar--wolfstar {
	@apply object-contain p-1;
}

.discord-app-launcher-tile-glyph {
	@apply size-5 text-white;
}

.discord-app-launcher-tile-copy {
	@apply flex min-w-0 flex-1 flex-col gap-0.5;
}

.discord-app-launcher-tile-title {
	@apply truncate text-[15px] leading-tight font-semibold;
	color: var(--discord-app-launcher-text);
}

.discord-app-launcher-tile-subtitle {
	@apply truncate text-[12px] leading-snug;
	color: var(--discord-app-launcher-muted);
}

.discord-app-launcher-list-header {
	@apply grid shrink-0 grid-cols-[2.25rem_1fr_2.25rem] items-center gap-1 px-4 pt-4 pb-2;
	animation: discord-app-launcher-view-in 0.12s ease-out;
}

.discord-app-launcher-back {
	@apply inline-flex size-9 cursor-pointer items-center justify-center rounded-full border-0;
	background-color: var(--discord-app-launcher-back-bg);
	color: var(--discord-app-launcher-text);
}

.discord-app-launcher-back:hover {
	background-color: var(--discord-app-launcher-back-hover);
}

.discord-app-launcher-back:focus-visible {
	@apply outline-2 outline-offset-2 outline-primary;
}

.discord-app-launcher-list-title {
	@apply m-0 text-center text-base font-semibold;
	color: var(--discord-app-launcher-text);
}

.discord-app-launcher-back-spacer {
	@apply size-9;
}

.discord-app-launcher-list-scroll {
	@apply min-h-0 flex-1;
	max-height: 100%;
	animation: discord-app-launcher-view-in 0.12s ease-out;
}

.discord-app-launcher-list-body {
	@apply mx-4 mb-4 flex flex-col overflow-hidden rounded-xl;
	background-color: var(--discord-app-launcher-nested);
}

.discord-app-launcher-list-body :deep(.discord-app-launcher-list-item) {
	@apply rounded-none px-3 py-2.5;
}

.discord-app-launcher-list-body :deep(.discord-app-launcher-list-item:not(:first-child)) {
	border-top: 1px solid var(--discord-app-launcher-divider);
}

@keyframes discord-app-launcher-view-in {
	from {
		opacity: 0;
		transform: translateX(5px);
	}

	to {
		opacity: 1;
		transform: translateX(0);
	}
}

@media (prefers-reduced-motion: reduce) {
	.discord-app-launcher-list-header,
	.discord-app-launcher-list-scroll {
		animation: none;
	}
}

/*
 * Discord mobile App Launcher (< md): bottom sheet with grab handle,
 * compact Recents / In This Server tiles, title-bar Promoted cards,
 * category lists with trailing chevrons + centered View More.
 */
@media (width < 48rem) {
	.discord-app-launcher {
		--discord-app-launcher-bg: oklch(22% 0.006 272);
		--discord-app-launcher-nested: oklch(28% 0.007 272);
		--discord-app-launcher-search-bg: oklch(18% 0.005 272);
		--discord-app-launcher-header: oklch(95% 0.004 272);
		--discord-app-launcher-link: oklch(72% 0.14 264);
		--discord-app-launcher-help-bg: oklch(28% 0.007 272);
		--discord-app-launcher-handle: oklch(62% 0.01 272);
		--discord-app-launcher-handle-shadow: oklch(0% 0 0 / 0.35);
		--discord-app-launcher-sheet-shadow: oklch(0% 0 0 / 0.4);
		--discord-app-launcher-promo-bar: oklch(12% 0.005 272);
		--discord-app-launcher-help-btn: oklch(38% 0.01 272);
		--discord-app-launcher-help-btn-text: oklch(92% 0.004 272);
		--discord-app-launcher-help-btn-shadow: oklch(0% 0 0 / 0.45);
		--discord-app-launcher-sheet-half: min(55dvh, 22rem);
		--discord-app-launcher-sheet-full: min(90dvh, 32rem);

		@apply w-full max-w-none rounded-t-2xl rounded-b-none border-0;
		height: var(--discord-app-launcher-sheet-half);
		max-height: var(--discord-app-launcher-sheet-full);
		box-shadow: 0 -8px 28px var(--discord-app-launcher-sheet-shadow);
		transition: height 0.2s ease;
	}

	.discord-app-launcher--sheet-full {
		height: var(--discord-app-launcher-sheet-full);
		max-height: var(--discord-app-launcher-sheet-full);
	}

	.discord-app-launcher--sheet-dragging {
		transition: none;
	}

	.discord-app-launcher--reduce-motion {
		transition: none;
	}

	.discord-app-launcher-handle {
		@apply mx-auto mt-2.5 mb-1.5 block h-1.5 w-11 shrink-0 cursor-grab rounded-full border-0 p-0;
		background-color: var(--discord-app-launcher-handle);
		box-shadow: 0 1px 2px var(--discord-app-launcher-handle-shadow);
		touch-action: none;
	}

	.discord-app-launcher-handle:active {
		cursor: grabbing;
	}

	.discord-app-launcher-handle:focus-visible {
		@apply outline-2 outline-offset-2 outline-primary;
	}

	.discord-app-launcher-main-content {
		@apply px-3 pb-5;
	}

	.discord-app-launcher-search-sticky {
		@apply pt-2 pb-3;
	}

	.discord-app-launcher-search-input {
		@apply h-11 rounded-full border-0 text-[15px];
	}

	.discord-app-launcher-main-sections {
		@apply gap-5;
	}

	.discord-app-launcher-section {
		@apply gap-2.5;
	}

	.discord-app-launcher-section-title {
		@apply text-[17px] font-bold;
		color: var(--discord-app-launcher-header);
	}

	.discord-app-launcher-section-caret {
		@apply inline-block;
	}

	.discord-app-launcher-view-more-desktop,
	.discord-app-launcher-server-title-desktop,
	.discord-app-launcher-recents-desktop,
	.discord-app-launcher-server-list-desktop,
	.discord-app-launcher-category .discord-app-launcher-view-more-header {
		display: none;
	}

	.discord-app-launcher-view-more-mobile,
	.discord-app-launcher-server-title-mobile {
		display: inline;
	}

	.discord-app-launcher-recents-mobile,
	.discord-app-launcher-server-mobile {
		display: grid;
	}

	.discord-app-launcher-view-more-footer {
		@apply mt-1 block w-full py-2.5 text-center text-[15px] font-semibold;
		color: var(--discord-app-launcher-link);
		text-decoration: none;
	}

	.discord-app-launcher-view-more-footer:hover {
		text-decoration: underline;
	}

	.discord-app-launcher-tile {
		@apply min-h-[3.75rem] gap-3 rounded-[12px] px-3 py-3;
	}

	.discord-app-launcher-tile-icon {
		@apply size-11;
	}

	.discord-app-launcher-tile-title {
		@apply text-[15px] font-bold;
	}

	.discord-app-launcher-promoted-grid {
		@apply gap-2;
	}

	.discord-app-launcher-promo {
		@apply overflow-hidden rounded-[12px];
	}

	.discord-app-launcher-promo-visual {
		@apply h-[6.5rem];
	}

	.discord-app-launcher-promo-footer {
		@apply min-h-0 gap-0 px-3 py-2.5;
		background-color: var(--discord-app-launcher-promo-bar);
	}

	.discord-app-launcher-promo-icon,
	.discord-app-launcher-promo-eye,
	.discord-app-launcher-promo-description {
		display: none;
	}

	.discord-app-launcher-promo-copy {
		@apply gap-0;
	}

	.discord-app-launcher-promo-title {
		@apply text-[13px] font-bold;
	}

	.discord-app-launcher-category .discord-app-launcher-section-header {
		@apply px-0.5;
	}

	.discord-app-launcher-category .discord-app-launcher-server-list {
		@apply rounded-[14px];
	}

	.discord-app-launcher-server-list :deep(.discord-app-launcher-list-item) {
		@apply gap-3 px-3 py-3;
	}

	.discord-app-launcher-help {
		@apply flex-col items-center gap-3 rounded-[14px] px-5 py-6 text-center;
	}

	.discord-app-launcher-help > span {
		@apply items-center gap-2;
	}

	.discord-app-launcher-help strong {
		@apply text-[17px];
	}

	.discord-app-launcher-help > span > span {
		@apply text-[13px] leading-relaxed;
	}

	.discord-app-launcher-help button {
		@apply w-auto min-w-[8.5rem] rounded-full px-5 py-2 text-[14px] font-bold;
		background-color: var(--discord-app-launcher-help-btn);
		color: var(--discord-app-launcher-help-btn-text);
		box-shadow: 0 2px 0 var(--discord-app-launcher-help-btn-shadow);
	}

	.discord-app-launcher-help button:hover {
		filter: brightness(1.06);
	}

	.discord-app-launcher-list-header {
		@apply pt-2;
	}

	.discord-app-launcher-list-body {
		@apply mx-3;
	}

	.discord-app-launcher-list-body :deep(.discord-app-launcher-list-item:not(:first-child)) {
		border-top: none;
	}

	.discord-app-launcher-list-body
		:deep(.discord-app-launcher-list-item:not(:first-child))::before {
		content: "";
		position: absolute;
		top: 0;
		right: 0;
		left: 3.75rem;
		border-top: 1px solid var(--discord-app-launcher-divider);
	}

	.discord-app-launcher-list-body :deep(.discord-app-launcher-list-item) {
		position: relative;
	}
}
</style>
