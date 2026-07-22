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

			<!-- Title + Description -->
			<div class="flex w-full flex-col items-start">
				<h1
					class="m-0 font-mono text-[80px] leading-none font-extrabold tracking-tight"
					style="display: block; text-overflow: ellipsis"
					:style="{ lineClamp: description ? 2 : 3 }"
				>
					{{ title }}
				</h1>
				<p
					v-if="description"
					class="mt-6 text-[36px] leading-12 font-semibold tracking-wide"
					:class="[colorMode === 'light' ? ['text-gray-600'] : ['text-white/75']]"
					style="display: block; text-overflow: ellipsis"
					:style="{ lineClamp: 2 }"
				>
					{{ description }}
				</p>
			</div>

			<!-- Spacer to balance the vertical layout -->
			<div />
		</div>
	</OgLayout>
</template>

<script setup lang="ts">
import type { ResolvableValue } from "@unhead/vue";
import { useOgImageRuntimeConfig } from "#og-image/app/utils";
import { useSiteConfig } from "#site-config/app/composables";
import { computed } from "vue";

export interface ChangelogOGImageProps {
	colorMode?: "dark" | "light";
	title?: ResolvableValue<string>;
	description?: ResolvableValue<string>;
	theme?: string;
}

const {
	theme = BrandingColors.Secondary,
	title = "Changelog",
	colorMode: propsColorMode,
	description,
} = defineProps<ChangelogOGImageProps>();

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
</script>
