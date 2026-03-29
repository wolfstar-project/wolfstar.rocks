<template>
	<OgLayout
		:class="[
			colorMode === 'light' ? ['bg-white', 'text-gray-900'] : ['bg-gray-900', 'text-white'],
		]"
	>
		<div
			class="absolute top-0 -right-full flex"
			:style="{
				width: '200%',
				height: '200%',
				backgroundImage: `radial-gradient(circle, rgba(${themeRgb}, 0.5) 0%,  ${colorMode === 'dark' ? 'rgba(5, 5, 5,0.3)' : 'rgba(255, 255, 255, 0.7)'} 50%, ${colorMode === 'dark' ? 'rgba(5, 5, 5,0)' : 'rgba(255, 255, 255, 0)'} 70%)`,
			}"
		></div>
		<div class="relative h-full w-full justify-between">
			<div class="flex flex-row items-start justify-between">
				<div class="flex w-full max-w-[65%] flex-col">
					<h1
						class="m-0 mb-7.5 text-[75px] font-bold"
						style="display: block; text-overflow: ellipsis"
						:style="{ lineClamp: description ? 2 : 3 }"
					>
						{{ title }}
					</h1>
					<p
						v-if="description"
						class="text-[35px] leading-12"
						:class="[colorMode === 'light' ? ['text-gray-700'] : ['text-gray-300']]"
						style="display: block; line-clamp: 3; text-overflow: ellipsis"
					>
						{{ description }}
					</p>
				</div>
				<div v-if="Boolean(icon)" style="width: 30%" class="flex justify-end">
					<IconComponent :name="icon" size="250px" style="margin: 0 auto; opacity: 0.7" />
				</div>
			</div>
			<div class="flex w-full flex-row items-center justify-center text-left">
				<IconsWolfstar class="h-10 w-10" aria-hidden="true" />
				<p v-if="siteName" style="font-size: 25px" class="font-bold">
					{{ siteName }}
				</p>
			</div>
		</div>
	</OgLayout>
</template>

<script setup lang="ts">
/**
 * @credits Nuxt SEO <https://nuxtseo.com/>
 */

import type { ResolvableValue } from "@unhead/vue";
import { useOgImageRuntimeConfig } from "#og-image/app/utils";
import { useSiteConfig } from "#site-config/app/composables";
import { computed, defineComponent, h, resolveComponent } from "vue";

export interface OGImageProps {
	colorMode?: "dark" | "light";
	title?: ResolvableValue<string>;
	description?: ResolvableValue<string>;
	icon?: string | boolean;
	siteName?: string;
	theme?: string;
}

// Convert to typescript props
const {
	theme = BrandingColors.Secondary,
	siteName: propsSiteName = "Wolfstar",
	title = "title",
	colorMode: propsColorMode,
	description,
	icon,
} = defineProps<OGImageProps>();

const HexRegex = /^#(?:[0-9a-f]{3}){1,2}$/i;

const runtimeConfig = useOgImageRuntimeConfig();

const colorMode = computed(() => propsColorMode || runtimeConfig.colorPreference || "light");

const themeHex = computed(() => {
	// Regex test if valid hex
	if (HexRegex.test(theme)) {
		return theme;
	}

	// If it's hex without the hash, just add the hash
	if (HexRegex.test(`#${theme}`)) {
		return `#${theme}`;
	}

	// If it's rgb or rgba, we convert it to hex
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
const siteName = computed(() => propsSiteName || siteConfig.name);

const IconComponent = runtimeConfig.hasNuxtIcon
	? resolveComponent("Icon")
	: defineComponent({
			render() {
				return h("div", "missing @nuxt/icon");
			},
		});
</script>
