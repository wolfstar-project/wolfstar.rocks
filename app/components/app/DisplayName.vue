<template>
	<span v-if="!look" class="truncate">{{ name }}</span>
	<span v-else class="dns" :class="look.fontClass" :style="look.vars">
		<span class="dns-text" :class="look.effectClass" :data-name="name">
			<template v-if="look.letters">
				<span class="sr-only">{{ name }}</span>
				<span aria-hidden="true">
					<span
						v-for="(letter, index) of look.letters"
						:key="index"
						:style="letter.colour ? { color: letter.colour } : undefined"
						>{{ letter.text }}</span
					>
				</span>
			</template>
			<template v-else>{{ name }}</template>
		</span>
	</span>
</template>

<script setup lang="ts">
import type { DisplayNameStyles } from "#shared/utils/discord-profile-styles";
import {
	DISPLAY_NAME_BACKGROUNDS,
	DISPLAY_NAME_FONTS,
	DisplayNameEffect,
	displayNameStyleVars,
	ensureContrast,
	intToHex,
} from "#shared/utils/discord-profile-styles";

/**
 * A display name drawn with the font, effect and colours its owner picked on
 * Discord (`display_name_styles`), or as plain text when there are none.
 */
const { name, styles = null } = defineProps<{
	name: string;
	styles?: DisplayNameStyles | null;
}>();

const colorMode = useColorMode();

const EFFECT_CLASSES: Record<number, string> = {
	[DisplayNameEffect.Glow]: "dns-gradient",
	[DisplayNameEffect.Gradient]: "dns-gradient",
	[DisplayNameEffect.Gummy]: "dns-gummy",
	[DisplayNameEffect.Neon]: "dns-neon",
	[DisplayNameEffect.Pop]: "dns-pop",
	[DisplayNameEffect.Prism]: "dns-prism",
	[DisplayNameEffect.Toon]: "dns-toon",
};

const look = computed(() => {
	if (!styles || styles.colors.length === 0) return null;
	const effect = styles.effect_id || DisplayNameEffect.Solid;
	const background =
		effect === DisplayNameEffect.Toon
			? DISPLAY_NAME_BACKGROUNDS.toon
			: colorMode.value === "light"
				? DISPLAY_NAME_BACKGROUNDS.light
				: DISPLAY_NAME_BACKGROUNDS.dark;
	const colours = styles.colors.map((value) => ensureContrast(intToHex(value), background));
	const letters =
		effect === DisplayNameEffect.Gummy
			? Array.from(name, (text, index) => ({
					colour: text.trim() ? colours[index % colours.length] : undefined,
					text,
				}))
			: null;
	return {
		effectClass: EFFECT_CLASSES[effect] ?? "dns-solid",
		fontClass: DISPLAY_NAME_FONTS[styles.font_id] ? `dns-font-${styles.font_id}` : undefined,
		letters,
		vars: displayNameStyleVars(effect, colours, [...name].length),
	};
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* Ported from Discord's display name styles; its fonts are replaced by the
   open-source typefaces they are drawn from. */
.dns {
	display: inline-flex;
	max-width: 100%;
	min-width: 0;
	position: relative;
	z-index: 0;
	font-synthesis: none;
}

.dns-text {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.dns-font-1 {
	font-family: "Bangers", var(--font-whitney, sans-serif);
}
.dns-font-2 {
	font-family: "BioRhyme", var(--font-whitney, sans-serif);
}
.dns-font-3 {
	font-family: "Cherry Bomb One", var(--font-whitney, sans-serif);
	letter-spacing: 0.04em;
}
.dns-font-4 {
	font-family: "Chicle", var(--font-whitney, sans-serif);
}
.dns-font-6 {
	font-family: "MuseoModerno", var(--font-whitney, sans-serif);
	letter-spacing: 0.01em;
}
.dns-font-7 {
	font-family: "Pirata One", var(--font-whitney, sans-serif);
	letter-spacing: 0.02em;
}
.dns-font-8 {
	font-family: "Pixelify Sans", var(--font-whitney, sans-serif);
	letter-spacing: 0.02em;
}
.dns-font-10 {
	font-family: "Grenze Gotisch", var(--font-whitney, sans-serif);
	letter-spacing: 0.01em;
}
.dns-font-12 {
	font-family: "Zilla Slab", var(--font-whitney, sans-serif);
	letter-spacing: 0.03em;
}
.dns-font-13 {
	font-family: "Playpen Sans", var(--font-whitney, sans-serif);
}
.dns-font-14 {
	font-family: "Orbitron", var(--font-whitney, sans-serif);
	letter-spacing: 0.03em;
}
.dns-font-15 {
	font-family: "New Rocker", var(--font-whitney, sans-serif);
}
.dns-font-16 {
	font-family: "Kalam", var(--font-whitney, sans-serif);
}

.dns-solid,
.dns-gummy {
	color: var(--dns-main);
}

.dns-gradient {
	background: linear-gradient(to bottom right, var(--dns-gradient-stops));
	background-clip: text;
	background-size: 100% auto;
	-webkit-text-fill-color: transparent;
}

.dns-prism {
	background-image: linear-gradient(90deg, var(--dns-prism-stops));
	background-clip: text;
	background-repeat: repeat;
	background-size: var(--dns-prism-cycle) auto;
	-webkit-text-fill-color: transparent;
}

.dns-neon {
	--dns-neon-radius: calc(4px + 0.12em);
	position: relative;
	z-index: 0;
	margin: calc(var(--dns-neon-radius) * -1);
	padding: var(--dns-neon-radius);
	color: var(--color-white);
	paint-order: stroke fill;
	-webkit-text-stroke: calc(1px + 0.04em) var(--dns-neon-stroke);
	text-shadow: 0 0 var(--dns-neon-radius) var(--dns-main);
}

.dns-toon {
	--dns-toon-stroke-width: calc(1.6px + 0.04em);
	--dns-toon-margin: calc(var(--dns-toon-stroke-width) * -1);
	position: relative;
	margin-inline: var(--dns-toon-margin);
	margin-bottom: var(--dns-toon-margin);
	padding-inline: var(--dns-toon-stroke-width);
	padding-bottom: var(--dns-toon-stroke-width);
	color: var(--dns-toon-stroke);
	paint-order: stroke fill;
	-webkit-text-stroke: var(--dns-toon-stroke-width) var(--dns-toon-stroke);
}

.dns-toon::before {
	position: absolute;
	inset: 0;
	overflow: hidden;
	padding-inline: var(--dns-toon-stroke-width);
	padding-bottom: var(--dns-toon-margin);
	background: linear-gradient(
		180deg,
		var(--color-white) 0,
		var(--dns-light-2) 8%,
		var(--dns-light-1) 15%,
		var(--dns-main) 25%,
		var(--dns-light-2) 45%,
		var(--dns-main) 55%,
		var(--color-white) 75%,
		var(--dns-light-2) 83%,
		var(--dns-light-1) 90%,
		var(--dns-main) 100%
	);
	background-clip: text;
	background-position: 50% 100%;
	background-size: 100% 400%;
	content: attr(data-name);
	text-overflow: ellipsis;
	white-space: nowrap;
	-webkit-text-fill-color: transparent;
	-webkit-text-stroke: 0 transparent;
}

.dns-pop {
	--dns-pop-stroke-width: calc(1.2px + 0.04em);
	--dns-pop-drop: 0.08em;
	position: relative;
	display: inline-block;
	vertical-align: top;
	margin-bottom: calc(var(--dns-pop-stroke-width) * -1 - var(--dns-pop-drop));
	margin-inline-start: calc(var(--dns-pop-stroke-width) * -1);
	padding-bottom: calc(var(--dns-pop-stroke-width) + var(--dns-pop-drop));
	padding-inline-start: var(--dns-pop-stroke-width);
	color: var(--color-white);
	paint-order: stroke fill;
	-webkit-text-stroke: var(--dns-pop-stroke-width) var(--dns-dark-2);
}

.dns-pop::before {
	position: absolute;
	top: 0;
	bottom: calc(var(--dns-pop-drop) * -1 - var(--dns-pop-stroke-width));
	inset-inline-start: var(--dns-pop-stroke-width);
	z-index: -1;
	width: calc(100% - var(--dns-pop-stroke-width));
	overflow: hidden;
	margin-inline-start: calc(var(--dns-pop-stroke-width) * -1);
	padding-inline-start: var(--dns-pop-stroke-width);
	background: linear-gradient(
		to bottom left,
		var(--dns-light-1) 0,
		var(--dns-light-1) 6%,
		var(--dns-main) 20%,
		var(--dns-main) 50%,
		var(--dns-light-1) 56%,
		var(--dns-main) 70%,
		var(--dns-main) 100%
	);
	background-clip: text;
	background-position: 0 100%;
	background-size: 200% 200%;
	color: var(--dns-main);
	content: attr(data-name);
	text-overflow: ellipsis;
	transform: translate3d(0, var(--dns-pop-drop), 0);
	white-space: nowrap;
	-webkit-text-fill-color: transparent;
	-webkit-text-stroke: var(--dns-pop-stroke-width) transparent;
}
</style>
