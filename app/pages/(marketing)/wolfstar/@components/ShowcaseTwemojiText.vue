<template>
	<span v-if="line.length > 0" class="inline-flex items-center">
		<template v-for="(part, index) in parts" :key="index">
			<template v-if="part.type === 'text'">{{ part.content }}</template>
			<UIcon
				v-else
				:name="part.icon"
				class="mx-0.5 inline-block size-[1.1em] shrink-0 align-[-0.15em]"
				aria-hidden="true"
			/>
		</template>
	</span>
</template>

<script lang="ts">
interface ShowcaseTwemojiTextProps {
	line: string;
}
</script>

<script setup lang="ts">
const { line } = defineProps<ShowcaseTwemojiTextProps>();

const SHOWCASE_TWEMOJI_MAP: Record<string, string> = {
	"✅": "twemoji:check-mark",
	"📁": "twemoji:file-folder",
	"⚙️": "twemoji:gear",
};

interface TextPart {
	type: "text";
	content: string;
}
interface IconPart {
	type: "icon";
	icon: string;
}
type LinePart = TextPart | IconPart;

const parts = computed((): LinePart[] => {
	const emojiPattern = /(✅|📁|⚙️)/g;
	const segments = line.split(emojiPattern);
	const result: LinePart[] = [];

	for (const segment of segments) {
		if (segment.length === 0) continue;
		const icon = SHOWCASE_TWEMOJI_MAP[segment];
		if (icon) {
			result.push({ type: "icon", icon });
		} else {
			result.push({ type: "text", content: segment });
		}
	}

	return result;
});
</script>
