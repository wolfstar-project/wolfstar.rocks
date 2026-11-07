<template>
	<div
		class="emoji-panel"
		role="dialog"
		:aria-label="ts('guild_settings.appeals.emoji.dialog_aria')"
	>
		<div class="emoji-header">
			<div class="emoji-search">
				<input
					ref="searchInput"
					v-model="query"
					type="text"
					autocomplete="off"
					spellcheck="false"
					:placeholder="ts('guild_settings.appeals.emoji.search_placeholder')"
					:aria-label="ts('guild_settings.appeals.emoji.search_aria')"
					@keydown.down.prevent="focusFirstCell"
				/>
				<button
					v-if="query"
					type="button"
					class="emoji-search-icon emoji-search-clear"
					:aria-label="ts('guild_settings.appeals.emoji.search_clear')"
					@click="clearQuery"
				>
					<UIcon name="ic:round-close" class="size-4" aria-hidden="true" />
				</button>
				<UIcon
					v-else
					name="ic:round-search"
					class="emoji-search-icon size-4"
					aria-hidden="true"
				/>
			</div>

			<div ref="toneRoot" class="emoji-tone-root">
				<button
					type="button"
					class="emoji-tone-button"
					:aria-label="ts('guild_settings.appeals.emoji.skin_tone')"
					:aria-expanded="showTones"
					@click="showTones = !showTones"
				>
					<Twemoji :emoji="TONE_SAMPLES[tone]" alt="" class="size-6" />
				</button>
				<div
					v-if="showTones"
					class="emoji-tones"
					role="radiogroup"
					:aria-label="ts('guild_settings.appeals.emoji.skin_tone')"
				>
					<button
						v-for="option in EmojiSkinTones"
						:key="option"
						type="button"
						role="radio"
						class="emoji-tone-option"
						:aria-checked="tone === option"
						:aria-label="ts(TONE_KEYS[option])"
						:title="ts(TONE_KEYS[option])"
						@click="pickTone(option)"
					>
						<Twemoji :emoji="TONE_SAMPLES[option]" alt="" class="size-6" />
					</button>
				</div>
			</div>
		</div>

		<div class="emoji-body">
			<nav
				v-if="!searching"
				class="emoji-rail"
				:aria-label="ts('guild_settings.appeals.emoji.categories_aria')"
			>
				<button
					v-for="section in sections"
					:key="section.id"
					type="button"
					class="emoji-rail-button"
					:class="{ 'is-active': activeSectionId === section.id }"
					:aria-label="section.label"
					:title="section.label"
					:aria-current="activeSectionId === section.id ? 'true' : undefined"
					@click="goTo(section.id)"
				>
					<img
						v-if="section.id === 'server' && serverIcon"
						:src="serverIcon"
						alt=""
						class="size-6 rounded-full"
					/>
					<UIcon
						v-else
						:name="SECTION_ICONS[section.id]"
						class="size-5"
						aria-hidden="true"
					/>
				</button>
			</nav>

			<div
				ref="scroller"
				class="emoji-scroll"
				@scroll.passive="onScroll"
				@keydown="onKeydown"
				@mouseleave="hovered = null"
			>
				<p v-if="status === 'pending' && !searching" class="emoji-note" role="status">
					{{ ts("guild_settings.appeals.emoji.loading") }}
				</p>
				<div v-else-if="status === 'error'" class="emoji-note" role="alert">
					<p>{{ ts("guild_settings.appeals.emoji.load_failed") }}</p>
					<UButton color="neutral" variant="outline" size="sm" class="mt-2" @click="load">
						{{ ts("guild_settings.appeals.emoji.retry") }}
					</UButton>
				</div>

				<section
					v-for="section in sections"
					:key="section.id"
					class="emoji-section"
					:data-category="section.id"
				>
					<h3 class="emoji-title console-label">
						<button
							v-if="section.collapsible"
							type="button"
							class="emoji-title-button"
							:aria-expanded="isOpen(section.id)"
							:aria-controls="`${uid}-${section.id}`"
							@click="toggleSection(section.id)"
						>
							<img
								v-if="section.id === 'server' && serverIcon"
								:src="serverIcon"
								alt=""
								class="size-4 shrink-0 rounded-full"
							/>
							<UIcon
								v-else
								:name="SECTION_ICONS[section.id]"
								class="size-4 shrink-0"
								aria-hidden="true"
							/>
							<span class="min-w-0 truncate">{{ section.label }}</span>
							<UIcon
								name="ic:round-expand-more"
								class="emoji-chevron size-4 shrink-0"
								:class="{ 'is-closed': !isOpen(section.id) }"
								aria-hidden="true"
							/>
						</button>
						<template v-else>{{ section.label }}</template>
					</h3>
					<div v-if="isOpen(section.id)" :id="`${uid}-${section.id}`" class="emoji-grid">
						<button
							v-for="cell in section.cells"
							:key="cell.key"
							type="button"
							class="emoji-cell"
							data-cell
							:data-key="cell.key"
							:tabindex="cell.key === tabKey ? 0 : -1"
							:aria-label="cell.label"
							:aria-pressed="cell.value === current"
							@click="pick(cell)"
							@focus="onCellFocus(cell)"
							@mouseenter="hovered = cell"
						>
							<img
								v-if="cell.url"
								:src="cell.url"
								alt=""
								loading="lazy"
								class="size-8"
							/>
							<Twemoji v-else :emoji="cell.glyph ?? ''" alt="" class="size-8" />
						</button>
					</div>
				</section>

				<div
					v-if="searching && results.length === 0 && status !== 'pending'"
					class="emoji-note"
					role="status"
				>
					<Twemoji emoji="😢" alt="" class="mb-3 size-12" />
					<p class="font-semibold text-highlighted">
						{{ ts("guild_settings.appeals.emoji.none") }}
					</p>
					<p>{{ ts("guild_settings.appeals.emoji.none_help") }}</p>
				</div>
			</div>
		</div>

		<div class="emoji-footer" aria-live="polite">
			<template v-if="preview">
				<span class="emoji-preview" aria-hidden="true">
					<img
						v-if="preview.previewUrl"
						:src="preview.previewUrl"
						alt=""
						class="size-8"
					/>
					<Twemoji v-else :emoji="preview.glyph ?? ''" alt="" class="size-8" />
				</span>
				<span class="min-w-0 truncate text-sm font-semibold">{{ preview.shortcode }}</span>
				<span class="ml-auto shrink-0 truncate pl-2 text-xs text-muted">
					{{ preview.where }}
				</span>
			</template>
			<span v-else class="text-sm text-muted">
				{{ ts("guild_settings.appeals.emoji.hint") }}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	EmojiCategories,
	EmojiSkinTones,
	emojiShortcode,
	matchesEmojiQuery,
	parseServerEmojiToken,
	rememberEmoji,
	searchEmojis,
	serverEmojiToken,
	serverEmojiUrl,
	withSkinTone,
	type EmojiCategory,
	type EmojiEntry,
	type EmojiSkinTone,
	type ServerEmoji,
	type UnicodeEmojiCategory,
} from "~/utils/emoji-picker";

const {
	servers = [],
	current = null,
	serverName = null,
	serverIcon = null,
} = defineProps<{
	/** The emoji of the server, which come first. */
	servers?: readonly ServerEmoji[];
	/** What the form has now, marked in the grid. */
	current?: string | null;
	/** The name of the server, which titles its emoji. */
	serverName?: string | null;
	/** The icon of the server, drawn beside its name. */
	serverIcon?: string | null;
}>();

const emit = defineEmits<{
	/** An emoji was picked: the emoji itself, or `<:name:id>` for one of the server. */
	pick: [value: string];
}>();

const { ts } = useI18n();
const uid = useId();
const { load, sections: unicodeSections, status } = useEmojiData();

/** The sections of the grid: the ones of the categories, the last used, and a search's results. */
type SectionId = EmojiCategory | "recent" | "results";

/** One button of the grid. */
interface Cell {
	/** Unique in the picker: an emoji can be in the last used and in its category. */
	key: string;
	/** What the form stores. */
	value: string;
	/** What the last used list stores: the emoji in its default tone, so the tone picked applies. */
	base: string;
	/** The name the screen readers read. */
	label: string;
	shortcode: string;
	/** Where the emoji is from, at the foot of the picker. */
	where: string;
	/** The emoji, for a Unicode one. */
	glyph?: string;
	/** The image, for one of the server. */
	url?: string;
	/** The image at the foot of the picker: the moving one, for an animated emoji. */
	previewUrl?: string;
}

interface Section {
	id: SectionId;
	label: string;
	cells: Cell[];
	/** A search's results stay open: they are the only thing in the grid. */
	collapsible: boolean;
}

// Static maps, not keys built from the value: the i18n report only follows
// the keys it can read in the source.
const CATEGORY_KEYS: Record<EmojiCategory | "recent", string> = {
	activities: "guild_settings.appeals.emoji.categories.activities",
	food: "guild_settings.appeals.emoji.categories.food",
	nature: "guild_settings.appeals.emoji.categories.nature",
	objects: "guild_settings.appeals.emoji.categories.objects",
	people: "guild_settings.appeals.emoji.categories.people",
	recent: "guild_settings.appeals.emoji.categories.recent",
	server: "guild_settings.appeals.emoji.categories.server",
	smileys: "guild_settings.appeals.emoji.categories.smileys",
	symbols: "guild_settings.appeals.emoji.categories.symbols",
	travel: "guild_settings.appeals.emoji.categories.travel",
};

const SECTION_ICONS: Record<SectionId, string> = {
	activities: "ic:round-sports-soccer",
	food: "ic:round-emoji-food-beverage",
	nature: "ic:round-emoji-nature",
	objects: "ic:round-emoji-objects",
	people: "ic:round-emoji-people",
	recent: "ic:round-access-time",
	results: "ic:round-search",
	server: "ic:round-dns",
	smileys: "ic:round-emoji-emotions",
	symbols: "ic:round-emoji-symbols",
	travel: "ic:round-emoji-transportation",
};

const TONE_KEYS: Record<EmojiSkinTone, string> = {
	0: "guild_settings.appeals.emoji.tones.default",
	1: "guild_settings.appeals.emoji.tones.light",
	2: "guild_settings.appeals.emoji.tones.medium_light",
	3: "guild_settings.appeals.emoji.tones.medium",
	4: "guild_settings.appeals.emoji.tones.medium_dark",
	5: "guild_settings.appeals.emoji.tones.dark",
};

/** The waving hand in each tone, which is what the tone button shows, as Discord's does. */
const TONE_SAMPLES: Record<EmojiSkinTone, string> = {
	0: "👋",
	1: "👋🏻",
	2: "👋🏼",
	3: "👋🏽",
	4: "👋🏾",
	5: "👋🏿",
};

const query = ref("");
const tone = ref<EmojiSkinTone>(0);
const showTones = ref(false);
const hovered = ref<Cell | null>(null);
const activeKey = ref<string | null>(null);
const collapsed = ref<SectionId[]>([]);
// Until the grid is scrolled, the rail marks the first section.
const scrolledTo = ref<SectionId | null>(null);

// The emoji used last, on this browser and for every server.
const storedRecent = useLocalStorage<string[]>("wolfstar-emoji-recent", []);
// What a browser holds under that key is not always the list this wrote.
const recent = computed(() =>
	Array.isArray(storedRecent.value)
		? storedRecent.value.filter((value) => typeof value === "string")
		: [],
);

const searchInput = useTemplateRef<HTMLInputElement>("searchInput");
const scroller = useTemplateRef<HTMLElement>("scroller");
const toneRoot = useTemplateRef<HTMLElement>("toneRoot");

onClickOutside(toneRoot, () => {
	showTones.value = false;
});

const searching = computed(() => query.value.trim().length > 0);
const activeSectionId = computed(() => scrolledTo.value ?? sections.value[0]?.id);
const serverLabel = computed(() => serverName ?? ts(CATEGORY_KEYS.server));

function serverCell(emoji: ServerEmoji, section: SectionId): Cell {
	const token = serverEmojiToken(emoji);
	const shortcode = `:${emoji.name}:`;
	return {
		key: `${section}|${token}`,
		value: token,
		base: token,
		label: shortcode,
		shortcode,
		where: ts("guild_settings.appeals.emoji.from_server", { server: serverLabel.value }),
		url: serverEmojiUrl(emoji.id, 64),
		previewUrl: serverEmojiUrl(emoji.id, 64, emoji.animated),
	};
}

function unicodeCell(
	entry: EmojiEntry,
	category: UnicodeEmojiCategory,
	section: SectionId,
	glyph = withSkinTone(entry, tone.value),
): Cell {
	return {
		key: `${section}|${entry.emoji}`,
		value: glyph,
		base: entry.emoji,
		label: entry.label,
		shortcode: emojiShortcode(entry.label),
		where: ts(CATEGORY_KEYS[category]),
		glyph,
	};
}

/** Every Unicode emoji by the character, in each of its tones, with the section it is in. */
const entryByEmoji = computed(() => {
	const map = new Map<string, { entry: EmojiEntry; category: UnicodeEmojiCategory }>();
	const data = unicodeSections.value;
	if (!data) return map;
	for (const id of EmojiCategories) {
		if (id === "server") continue;
		for (const entry of data[id]) {
			const found = { entry, category: id };
			map.set(entry.emoji, found);
			for (const skin of entry.skins) map.set(skin, found);
		}
	}
	return map;
});

const serverById = computed(() => new Map(servers.map((emoji) => [emoji.id, emoji])));

const recentCells = computed<Cell[]>(() =>
	recent.value.flatMap((value) => {
		const token = parseServerEmojiToken(value);
		if (token) {
			// Another server's emoji is the member's to use there, not in this form.
			const own = serverById.value.get(token.id);
			return own ? [serverCell(own, "recent")] : [];
		}
		const found = entryByEmoji.value.get(value);
		return found ? [unicodeCell(found.entry, found.category, "recent")] : [];
	}),
);

const results = computed<Cell[]>(() => {
	if (!searching.value) return [];
	const text = query.value;
	const own = servers
		.filter((emoji) => matchesEmojiQuery(emoji.name, [], text))
		.map((emoji) => serverCell(emoji, "results"));
	const data = unicodeSections.value;
	const unicode = data
		? EmojiCategories.flatMap((id) =>
				id === "server"
					? []
					: searchEmojis(data[id], text).map((entry) =>
							unicodeCell(entry, id, "results"),
						),
			)
		: [];
	return [...own, ...unicode];
});

const sections = computed<Section[]>(() => {
	if (searching.value) {
		return results.value.length > 0
			? [
					{
						id: "results",
						label: ts("guild_settings.appeals.emoji.results"),
						cells: results.value,
						collapsible: false,
					},
				]
			: [];
	}

	const list: Section[] = [];
	if (recentCells.value.length > 0)
		list.push({
			id: "recent",
			label: ts(CATEGORY_KEYS.recent),
			cells: recentCells.value,
			collapsible: true,
		});
	if (servers.length > 0)
		list.push({
			id: "server",
			label: serverLabel.value,
			cells: servers.map((emoji) => serverCell(emoji, "server")),
			collapsible: true,
		});
	const data = unicodeSections.value;
	if (data) {
		for (const id of EmojiCategories) {
			if (id === "server") continue;
			list.push({
				id,
				label: ts(CATEGORY_KEYS[id]),
				cells: data[id].map((entry) => unicodeCell(entry, id, id)),
				collapsible: true,
			});
		}
	}
	return list;
});

function isOpen(id: SectionId): boolean {
	return !collapsed.value.includes(id);
}

function toggleSection(id: SectionId) {
	collapsed.value = isOpen(id)
		? [...collapsed.value, id]
		: collapsed.value.filter((item) => item !== id);
}

/** What the form has now, for the foot of the picker while nothing is under the pointer. */
const currentCell = computed<Cell | null>(() => {
	if (!current) return null;
	const token = parseServerEmojiToken(current);
	if (token) {
		const own = serverById.value.get(token.id);
		return own ? serverCell(own, "server") : null;
	}
	const found = entryByEmoji.value.get(current);
	return found ? unicodeCell(found.entry, found.category, found.category, current) : null;
});

const preview = computed(() => hovered.value ?? currentCell.value);

// One button of the grid is in the tab order, and the arrow keys move among them.
const visibleCells = computed(() =>
	sections.value.filter((section) => isOpen(section.id)).flatMap((section) => section.cells),
);
const tabKey = computed(() => {
	const cells = visibleCells.value;
	return cells.some((cell) => cell.key === activeKey.value) ? activeKey.value : cells[0]?.key;
});

function pick(cell: Cell) {
	storedRecent.value = rememberEmoji(recent.value, cell.base);
	emit("pick", cell.value);
}

function pickTone(next: EmojiSkinTone) {
	tone.value = next;
	showTones.value = false;
}

function clearQuery() {
	query.value = "";
	searchInput.value?.focus();
}

function onCellFocus(cell: Cell) {
	activeKey.value = cell.key;
	hovered.value = cell;
}

function focusFirstCell() {
	scroller.value?.querySelector<HTMLElement>('[data-cell][tabindex="0"]')?.focus();
}

async function goTo(id: SectionId) {
	if (!isOpen(id)) toggleSection(id);
	await nextTick();
	const section = scroller.value?.querySelector<HTMLElement>(`[data-category="${id}"]`);
	if (section && scroller.value) scroller.value.scrollTop = section.offsetTop;
	scrolledTo.value = id;
}

// The rail marks the section whose title is at the top.
function onScroll() {
	const element = scroller.value;
	if (!element) return;

	let current: SectionId | null = null;
	for (const section of element.querySelectorAll<HTMLElement>("[data-category]")) {
		if (section.offsetTop > element.scrollTop + 8) break;
		current = section.dataset.category as SectionId;
	}
	if (current) scrolledTo.value = current;
}

/** The button the arrow key leads to, by where the buttons are on the screen. */
function neighbour(cells: HTMLElement[], index: number, key: string): HTMLElement | undefined {
	if (key === "ArrowRight") return cells[index + 1];
	if (key === "ArrowLeft") return cells[index - 1];
	if (key === "Home") return cells[0];
	if (key === "End") return cells.at(-1);
	if (key !== "ArrowDown" && key !== "ArrowUp") return undefined;

	const from = cells[index]?.getBoundingClientRect();
	if (!from) return undefined;
	const step = key === "ArrowDown" ? 1 : -1;

	// The next row, then the button of it closest to where this one is:
	let rowTop: number | null = null;
	let best: { cell: HTMLElement; distance: number } | undefined;
	for (let position = index + step; position >= 0 && position < cells.length; position += step) {
		const cell = cells[position];
		if (!cell) break;
		const rect = cell.getBoundingClientRect();
		if (Math.abs(rect.top - from.top) < 4) continue;
		rowTop ??= rect.top;
		if (Math.abs(rect.top - rowTop) >= 4) break;
		const distance = Math.abs(rect.left - from.left);
		if (!best || distance < best.distance) best = { cell, distance };
	}
	return best?.cell;
}

function onKeydown(event: KeyboardEvent) {
	const target = event.target;
	if (!(target instanceof HTMLElement) || !target.matches("[data-cell]")) return;

	const cells = [...(scroller.value?.querySelectorAll<HTMLElement>("[data-cell]") ?? [])];
	const next = neighbour(cells, cells.indexOf(target), event.key);
	if (!next) return;

	event.preventDefault();
	next.focus();
	next.scrollIntoView({ block: "nearest" });
}

onMounted(() => {
	void load();
	searchInput.value?.focus();
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* Discord's expression picker: a search field and the skin tone over the
   grid, a rail of sections at its side, and the emoji under the pointer at the
   foot. */
.emoji-panel {
	@apply flex flex-col overflow-hidden text-default;
	width: min(29.5rem, calc(100vw - 2rem));
	height: min(28.5rem, calc(100dvh - 4rem));
}

.emoji-header {
	@apply flex shrink-0 items-center gap-2 p-2.5;
	border-bottom: 1px solid var(--home-border-subtle);
}

.emoji-search {
	@apply relative min-w-0 flex-1;
}

.emoji-search input {
	@apply h-8 w-full rounded-[4px] bg-(--ink-800) pr-9 pl-3 text-sm text-highlighted theme-light:bg-(--field-surface);
	outline: none;
}

.emoji-search input::placeholder {
	color: var(--ui-text-muted);
}

.emoji-search input:focus-visible {
	box-shadow: 0 0 0 2px var(--color-primary);
}

.emoji-search-icon {
	@apply pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted;
}

.emoji-search-clear {
	@apply pointer-events-auto right-1.5 flex size-6 cursor-pointer items-center justify-center rounded-[4px] bg-transparent;
}

.emoji-search-clear:hover {
	@apply bg-base-content/10 text-highlighted;
}

.emoji-tone-root {
	@apply relative shrink-0;
}

.emoji-tone-button {
	@apply flex size-8 cursor-pointer items-center justify-center rounded-[4px] bg-transparent;
}

.emoji-tone-button:hover,
.emoji-tone-button[aria-expanded="true"] {
	@apply bg-base-content/10;
}

/* The six tones in a column over the button, the way Discord lists them. */
.emoji-tones {
	@apply absolute -top-1 -right-1 z-20 flex flex-col gap-0.5 rounded-[6px] p-1;
	background-color: var(--popover-surface);
	border: 1px solid var(--field-border);
	box-shadow: var(--popover-shadow);
}

.emoji-tone-option {
	@apply flex size-8 cursor-pointer items-center justify-center rounded-[4px] bg-transparent;
}

.emoji-tone-option:hover {
	@apply bg-base-content/10;
}

.emoji-tone-option[aria-checked="true"] {
	@apply bg-primary/20;
}

.emoji-body {
	@apply flex min-h-0 flex-1;
}

.emoji-rail {
	@apply flex w-12 shrink-0 flex-col items-center gap-1 overflow-x-hidden overflow-y-auto p-2;
	border-right: 1px solid var(--home-border-subtle);
}

.emoji-rail-button {
	@apply flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[6px] bg-transparent text-muted;
}

.emoji-rail-button:hover {
	@apply bg-base-content/10 text-highlighted;
}

.emoji-rail-button.is-active {
	@apply bg-base-content/12 text-highlighted;
}

.emoji-scroll {
	@apply relative min-w-0 flex-1 overflow-y-auto px-2 pb-2;
	scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
	.emoji-scroll {
		scroll-behavior: auto;
	}
}

.emoji-title {
	@apply sticky top-0 z-10 bg-(--popover-surface) pt-2.5 pb-1.5;
}

.emoji-title-button {
	@apply flex w-full cursor-pointer items-center gap-1.5 rounded-[4px] border-0 bg-transparent px-1 py-0.5 text-left;
	color: inherit;
	font: inherit;
	letter-spacing: inherit;
	text-transform: inherit;
}

.emoji-title-button:hover {
	@apply text-highlighted;
}

.emoji-chevron {
	@apply ml-auto transition-transform duration-150;
}

.emoji-chevron.is-closed {
	transform: rotate(-90deg);
}

@media (prefers-reduced-motion: reduce) {
	.emoji-chevron {
		transition: none;
	}
}

.emoji-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, 2.5rem);
}

.emoji-cell {
	@apply flex size-10 cursor-pointer items-center justify-center rounded-[6px] bg-transparent text-[1.625rem] leading-none;
}

.emoji-cell:hover {
	@apply bg-base-content/10;
}

.emoji-cell[aria-pressed="true"] {
	@apply bg-primary/20;
	box-shadow: inset 0 0 0 2px var(--color-primary);
}

.emoji-panel :is(button, input):focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: -2px;
}

.emoji-search input:focus-visible {
	outline: none;
}

.emoji-note {
	@apply flex flex-col items-center px-4 py-10 text-center text-sm text-muted;
}

.emoji-footer {
	@apply flex h-12 shrink-0 items-center gap-2.5 bg-(--ink-800) px-3.5 theme-light:bg-(--discord-server);
	border-top: 1px solid var(--home-border-subtle);
}

.emoji-preview {
	@apply flex size-8 shrink-0 items-center justify-center;
}
</style>
