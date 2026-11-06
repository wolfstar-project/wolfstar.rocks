<template>
	<div
		class="emoji-panel"
		role="dialog"
		:style="{ '--emoji-font': EMOJI_FONT_FAMILY }"
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
			<button
				type="button"
				class="emoji-tone-button"
				:aria-label="ts('guild_settings.appeals.emoji.skin_tone')"
				:aria-expanded="showTones"
				@click="showTones = !showTones"
			>
				{{ TONE_SAMPLES[tone] }}
			</button>
		</div>

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
				class="emoji-cell emoji-tone"
				:aria-checked="tone === option"
				:aria-label="ts(TONE_KEYS[option])"
				:title="ts(TONE_KEYS[option])"
				@click="pickTone(option)"
			>
				{{ TONE_SAMPLES[option] }}
			</button>
		</div>

		<div class="emoji-body">
			<nav
				v-if="!searching"
				class="emoji-rail"
				:aria-label="ts('guild_settings.appeals.emoji.categories_aria')"
			>
				<button
					v-for="category in categories"
					:key="category.id"
					type="button"
					class="emoji-rail-button"
					:class="{ 'is-active': activeCategory === category.id }"
					:aria-label="ts(CATEGORY_KEYS[category.id])"
					:title="ts(CATEGORY_KEYS[category.id])"
					:aria-current="activeCategory === category.id ? 'true' : undefined"
					@click="goTo(category.id)"
				>
					<UIcon :name="CATEGORY_ICONS[category.id]" class="size-5" aria-hidden="true" />
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

				<template v-if="searching">
					<section v-if="results.length > 0" class="emoji-section">
						<h3 class="emoji-title console-label">
							{{ ts("guild_settings.appeals.emoji.results") }}
						</h3>
						<div class="emoji-grid">
							<button
								v-for="cell in results"
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
								<img v-if="cell.url" :src="cell.url" alt="" loading="lazy" />
								<template v-else>{{ cell.glyph }}</template>
							</button>
						</div>
					</section>
					<div v-else-if="status !== 'pending'" class="emoji-note" role="status">
						<p class="font-semibold text-highlighted">
							{{ ts("guild_settings.appeals.emoji.none") }}
						</p>
						<p>{{ ts("guild_settings.appeals.emoji.none_help") }}</p>
					</div>
				</template>

				<template v-else>
					<section
						v-for="category in categories"
						:key="category.id"
						class="emoji-section"
						:data-category="category.id"
					>
						<h3 class="emoji-title console-label">
							{{ ts(CATEGORY_KEYS[category.id]) }}
						</h3>
						<div class="emoji-grid">
							<button
								v-for="cell in category.cells"
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
								<img v-if="cell.url" :src="cell.url" alt="" loading="lazy" />
								<template v-else>{{ cell.glyph }}</template>
							</button>
						</div>
					</section>
				</template>
			</div>
		</div>

		<div class="emoji-footer" aria-live="polite">
			<template v-if="hovered">
				<span class="emoji-preview" aria-hidden="true">
					<img v-if="hovered.url" :src="hovered.url" alt="" />
					<template v-else>{{ hovered.glyph }}</template>
				</span>
				<span class="min-w-0 truncate text-sm font-semibold">{{ hovered.shortcode }}</span>
			</template>
			<span v-else class="text-sm text-muted">
				{{ ts("guild_settings.appeals.emoji.hint") }}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	EMOJI_FONT_FAMILY,
	EmojiCategories,
	EmojiSkinTones,
	emojiShortcode,
	matchesEmojiQuery,
	searchEmojis,
	serverEmojiToken,
	serverEmojiUrl,
	withSkinTone,
	type EmojiCategory,
	type EmojiEntry,
	type EmojiSkinTone,
	type ServerEmoji,
} from "~/utils/emoji-picker";

const { servers = [], current = null } = defineProps<{
	/** The emoji of the server, which come first. */
	servers?: readonly ServerEmoji[];
	/** What the form has now, marked in the grid. */
	current?: string | null;
}>();

const emit = defineEmits<{
	/** An emoji was picked: the emoji itself, or `<:name:id>` for one of the server. */
	pick: [value: string];
}>();

const { ts } = useI18n();
const { load, sections, status } = useEmojiData();

/** One button of the grid. */
interface Cell {
	key: string;
	/** What the form stores. */
	value: string;
	/** The name the screen readers read. */
	label: string;
	shortcode: string;
	/** The emoji, for a Unicode one. */
	glyph?: string;
	/** The image, for one of the server. */
	url?: string;
}

// Static maps, not keys built from the value: the i18n report only follows
// the keys it can read in the source.
const CATEGORY_KEYS: Record<EmojiCategory, string> = {
	activities: "guild_settings.appeals.emoji.categories.activities",
	food: "guild_settings.appeals.emoji.categories.food",
	nature: "guild_settings.appeals.emoji.categories.nature",
	objects: "guild_settings.appeals.emoji.categories.objects",
	people: "guild_settings.appeals.emoji.categories.people",
	server: "guild_settings.appeals.emoji.categories.server",
	smileys: "guild_settings.appeals.emoji.categories.smileys",
	symbols: "guild_settings.appeals.emoji.categories.symbols",
	travel: "guild_settings.appeals.emoji.categories.travel",
};

const CATEGORY_ICONS: Record<EmojiCategory, string> = {
	activities: "ic:round-sports-soccer",
	food: "ic:round-emoji-food-beverage",
	nature: "ic:round-emoji-nature",
	objects: "ic:round-emoji-objects",
	people: "ic:round-emoji-people",
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
const activeCategory = ref<EmojiCategory>(servers.length > 0 ? "server" : "smileys");

const searchInput = useTemplateRef<HTMLInputElement>("searchInput");
const scroller = useTemplateRef<HTMLElement>("scroller");

const searching = computed(() => query.value.trim().length > 0);

function serverCell(emoji: ServerEmoji): Cell {
	return {
		key: serverEmojiToken(emoji),
		value: serverEmojiToken(emoji),
		label: `:${emoji.name}:`,
		shortcode: `:${emoji.name}:`,
		url: serverEmojiUrl(emoji.id),
	};
}

function unicodeCell(entry: EmojiEntry): Cell {
	const glyph = withSkinTone(entry, tone.value);
	return {
		key: entry.emoji,
		value: glyph,
		label: entry.label,
		shortcode: emojiShortcode(entry.label),
		glyph,
	};
}

const categories = computed(() => {
	const list: { id: EmojiCategory; cells: Cell[] }[] = [];
	if (servers.length > 0)
		list.push({ id: "server", cells: servers.map((emoji) => serverCell(emoji)) });
	const data = sections.value;
	if (data) {
		for (const id of EmojiCategories) {
			if (id === "server") continue;
			list.push({ id, cells: data[id].map((entry) => unicodeCell(entry)) });
		}
	}
	return list;
});

const results = computed<Cell[]>(() => {
	if (!searching.value) return [];
	const text = query.value;
	const own = servers
		.filter((emoji) => matchesEmojiQuery(emoji.name, [], text))
		.map((emoji) => serverCell(emoji));
	const data = sections.value;
	const unicode = data
		? EmojiCategories.flatMap((id) =>
				id === "server"
					? []
					: searchEmojis(data[id], text).map((entry) => unicodeCell(entry)),
			)
		: [];
	return [...own, ...unicode];
});

// One button of the grid is in the tab order, and the arrow keys move among them.
const visibleCells = computed(() =>
	searching.value ? results.value : categories.value.flatMap((category) => category.cells),
);
const tabKey = computed(() => {
	const cells = visibleCells.value;
	return cells.some((cell) => cell.key === activeKey.value) ? activeKey.value : cells[0]?.key;
});

function pick(cell: Cell) {
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

function goTo(id: EmojiCategory) {
	const section = scroller.value?.querySelector<HTMLElement>(`[data-category="${id}"]`);
	if (section && scroller.value) scroller.value.scrollTop = section.offsetTop;
	activeCategory.value = id;
}

// The rail marks the section whose title is at the top.
function onScroll() {
	const element = scroller.value;
	if (!element) return;

	let current: EmojiCategory | null = null;
	for (const section of element.querySelectorAll<HTMLElement>("[data-category]")) {
		if (section.offsetTop > element.scrollTop + 8) break;
		current = section.dataset.category as EmojiCategory;
	}
	if (current) activeCategory.value = current;
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
	@apply flex h-110 flex-col overflow-hidden text-default;
	width: min(26.5rem, calc(100vw - 2rem));
}

.emoji-header {
	@apply flex shrink-0 items-center gap-2 p-2;
	border-bottom: 1px solid var(--home-border-subtle);
}

.emoji-search {
	@apply relative min-w-0 flex-1;
}

.emoji-search input {
	@apply h-9 w-full rounded-[4px] bg-(--ink-800) pr-9 pl-3 text-sm text-highlighted theme-light:bg-(--field-surface);
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

.emoji-tone-button {
	@apply flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[4px] bg-transparent text-xl leading-none;
	font-family: var(--emoji-font);
}

.emoji-tone-button:hover,
.emoji-tone-button[aria-expanded="true"] {
	@apply bg-base-content/10;
}

.emoji-tones {
	@apply flex shrink-0 items-center justify-center gap-1 p-1.5;
	border-bottom: 1px solid var(--home-border-subtle);
}

.emoji-tone[aria-checked="true"] {
	@apply bg-primary/20;
}

.emoji-body {
	@apply flex min-h-0 flex-1;
}

.emoji-rail {
	@apply flex w-12 shrink-0 flex-col items-center gap-0.5 overflow-x-hidden overflow-y-auto p-2;
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
}

.emoji-title {
	@apply sticky top-0 z-10 bg-(--popover-surface) px-1 pt-3 pb-1.5;
}

.emoji-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, 2.5rem);
}

.emoji-cell {
	@apply flex size-10 cursor-pointer items-center justify-center rounded-[6px] bg-transparent text-[1.625rem] leading-none;
	font-family: var(--emoji-font);
}

.emoji-cell img {
	@apply size-7 object-contain;
}

.emoji-cell:hover {
	@apply bg-base-content/10;
}

.emoji-cell[aria-pressed="true"] {
	@apply bg-primary/20;
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
	@apply flex h-12 shrink-0 items-center gap-2.5 bg-(--ink-800) px-3 theme-light:bg-(--discord-server);
	border-top: 1px solid var(--home-border-subtle);
}

.emoji-preview {
	@apply flex size-8 shrink-0 items-center justify-center text-[1.625rem] leading-none;
	font-family: var(--emoji-font);
}

.emoji-preview img {
	@apply size-8 object-contain;
}
</style>
