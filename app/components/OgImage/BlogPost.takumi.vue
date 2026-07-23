<template>
	<OgLayout
		:class="[colorMode === 'light' ? ['bg-white', 'text-gray-900'] : ['text-white']]"
		:style="{
			backgroundColor: colorMode === 'dark' ? '#0a0a0a' : '#ffffff',
			backgroundImage:
				colorMode === 'dark'
					? `radial-gradient(circle at 50% 10%, rgba(${themeRgb}, 0.35) 0%, #0a0a0a 60%)`
					: `radial-gradient(circle at 50% 10%, rgba(${themeRgb}, 0.4) 0%, #ffffff 65%)`,
		}"
	>
		<div class="flex h-full w-full flex-col items-start justify-between">
			<!-- Brand -->
			<div class="flex flex-row items-center">
				<IconsWolfstar class="h-14 w-14" aria-hidden="true" />
				<p style="font-size: 32px" class="ml-3 font-bold">
					{{ siteName }}
				</p>
			</div>

			<!-- Date + Title + Description -->
			<div class="flex w-full flex-col items-start">
				<span
					v-if="formattedDate"
					class="mb-4 text-[30px] font-semibold tracking-wide"
					:class="[colorMode === 'light' ? ['text-gray-600'] : ['text-white/75']]"
				>
					{{ formattedDate }}
				</span>
				<h1
					class="m-0 font-mono text-[70px] leading-none font-extrabold tracking-tight"
					style="display: block; text-overflow: ellipsis"
					:style="{ lineClamp: 2 }"
				>
					{{ title }}
				</h1>
				<p
					v-if="description"
					class="mt-6 text-[34px] leading-11 font-semibold tracking-wide"
					:class="[colorMode === 'light' ? ['text-gray-600'] : ['text-white/75']]"
					style="display: block; text-overflow: ellipsis"
					:style="{ lineClamp: 2 }"
				>
					{{ description }}
				</p>
			</div>

			<!-- Authors -->
			<div v-if="authors.length" class="flex flex-row items-center">
				<div class="flex flex-row items-center">
					<span
						v-for="(author, index) in visibleAuthors"
						:key="author.name"
						class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full"
						:class="[colorMode === 'light' ? ['bg-gray-200'] : ['bg-white/15']]"
						:style="{
							marginLeft: index > 0 ? '-20px' : '0',
							border:
								colorMode === 'dark' ? '3px solid #0a0a0a' : '3px solid #ffffff',
						}"
					>
						<img
							v-if="author.avatar"
							:src="author.avatar"
							:alt="author.name"
							width="64"
							height="64"
							style="width: 100%; height: 100%; object-fit: cover"
						/>
						<span v-else class="text-[24px] font-semibold">
							{{ getInitials(author.name) }}
						</span>
					</span>
					<span
						v-if="extraCount > 0"
						class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full text-[24px] font-semibold"
						:class="[colorMode === 'light' ? ['bg-gray-200'] : ['bg-white/15']]"
						:style="{
							marginLeft: '-20px',
							border:
								colorMode === 'dark' ? '3px solid #0a0a0a' : '3px solid #ffffff',
						}"
					>
						+{{ extraCount }}
					</span>
				</div>
				<span
					class="ml-5 text-[30px] font-semibold"
					:class="[colorMode === 'light' ? ['text-gray-700'] : ['text-white/80']]"
				>
					{{ formattedAuthorNames }}
				</span>
			</div>
		</div>
	</OgLayout>
</template>

<script setup lang="ts">
import type { ResolvableValue } from "@unhead/vue";
import { useOgImageRuntimeConfig } from "#og-image/app/utils";
import { useSiteConfig } from "#site-config/app/composables";
import { computed } from "vue";

export interface OgAuthor {
	name: string;
	avatar?: string;
}

export interface BlogPostOGImageProps {
	colorMode?: "dark" | "light";
	title?: ResolvableValue<string>;
	description?: ResolvableValue<string>;
	date?: string;
	authors?: OgAuthor[];
	theme?: string;
}

const {
	theme = BrandingColors.Secondary,
	title = "title",
	colorMode: propsColorMode,
	description,
	date = "",
	authors = [],
} = defineProps<BlogPostOGImageProps>();

const HexRegex = /^#(?:[0-9a-f]{3}){1,2}$/i;

const runtimeConfig = useOgImageRuntimeConfig();

const colorMode = computed(() => propsColorMode || runtimeConfig.colorPreference || "light");

const themeHex = computed(() => {
	if (HexRegex.test(theme)) {
		return theme;
	}

	if (HexRegex.test(`#${theme}`)) {
		return `#${theme}`;
	}

	if (theme.startsWith("rgb")) {
		const rgb = theme
			.replace("rgb(", "")
			.replace("rgba(", "")
			.replace(")", "")
			.split(",")
			.map((v) => Number.parseInt(v.trim(), 10));
		const hex = rgb
			.map((v) => {
				const hex = v.toString(16);
				return hex.length === 1 ? `0${hex}` : hex;
			})
			.join("");
		return `#${hex}`;
	}
	return "#FFFFFF";
});

const themeRgb = computed(() =>
	themeHex.value
		.replace("#", "")
		.match(/.{1,2}/g)
		?.map((v) => Number.parseInt(v, 16))
		.join(", "),
);

const siteConfig = useSiteConfig();
const siteName = computed(() => siteConfig.name);

const formattedDate = computed(() => {
	if (!date) return "";
	const parsed = new Date(date);
	if (Number.isNaN(parsed.getTime())) return date;
	return parsed.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	});
});

const MAX_VISIBLE_AUTHORS = 2;

const getInitials = (name: string) =>
	name
		.trim()
		.split(/\s+/)
		.map((part) => part[0] ?? "")
		.join("")
		.toUpperCase()
		.slice(0, 2);

const visibleAuthors = computed(() =>
	authors.length <= 3 ? authors : authors.slice(0, MAX_VISIBLE_AUTHORS),
);

const extraCount = computed(() => (authors.length <= 3 ? 0 : authors.length - MAX_VISIBLE_AUTHORS));

const formattedAuthorNames = computed(() => {
	const names = authors.map((author) => author.name);
	if (names.length === 0) return "";
	if (names.length === 1) return names[0];
	if (names.length === 2) return `${names[0]} and ${names[1]}`;
	if (names.length === 3) return `${names[0]}, ${names[1]}, and ${names[2]}`;
	const shown = names.slice(0, MAX_VISIBLE_AUTHORS);
	const remaining = names.length - MAX_VISIBLE_AUTHORS;
	return `${shown.join(", ")} and ${remaining} others`;
});
</script>
