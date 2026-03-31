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
		<div class="relative flex w-full flex-col items-start justify-center text-left">
			<div v-if="Boolean(icon)" class="mb-8 flex items-center justify-start">
				<IconComponent :name="icon" size="120px" style="opacity: 0.85" />
			</div>
			<h1
				class="m-0 text-[75px] leading-none font-extrabold tracking-tight"
				style="display: block; text-overflow: ellipsis"
				:style="{ lineClamp: description ? 2 : 3 }"
			>
				{{ title }}
			</h1>
			<p
				v-if="description"
				class="mt-6 text-[35px] leading-12 font-semibold tracking-wide"
				:class="[colorMode === 'light' ? ['text-gray-600'] : ['text-white/75']]"
				style="display: block; line-clamp: 2; text-overflow: ellipsis"
			>
				{{ description }}
			</p>
		</div>
		<div
			class="absolute bottom-15 flex w-full flex-row items-center justify-center"
			style="left: 0"
		>
			<IconsWolfstar class="h-14 w-14" aria-hidden="true" />
			<p style="font-size: 35px" class="ml-3 font-bold">
				{{ siteName }}
			</p>
		</div>
	</OgLayout>
</template>

<script setup lang="ts">
import type { ResolvableValue } from "@unhead/vue";
import { useOgImageRuntimeConfig } from "#og-image/app/utils";
import { useSiteConfig } from "#site-config/app/composables";

export interface OGImageProps {
	colorMode?: "dark" | "light";
	title?: ResolvableValue<string>;
	description?: ResolvableValue<string>;
	icon?: string | boolean;
	theme?: string;
}
const { name } = useRoute();

// Convert to typescript props
const {
	theme = BrandingColors.Secondary,
	title = name,
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
const siteName = computed(() => siteConfig.name);

const IconComponent = runtimeConfig.hasNuxtIcon
	? resolveComponent("Icon")
	: defineComponent({
			render() {
				return h("div", "missing @nuxt/icon");
			},
		});
</script>
