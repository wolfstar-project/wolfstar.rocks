<template>
	<Section
		id="apps"
		labelled-by="home-apps-heading"
		scroll-margin
		contained
		spacing="none"
		class="py-24"
	>
		<SectionHeader
			eyebrow="Other Apps"
			title="Want more? We've got you covered."
			heading-id="home-apps-heading"
			class="mb-10"
		/>

		<div
			v-for="app of apps"
			:key="app.name"
			class="other-app grid items-center gap-8 border-y py-10 md:grid-cols-[auto_1fr_auto] md:gap-10"
		>
			<NuxtImg
				:src="app.avatar"
				width="80"
				height="80"
				:alt="`${app.name} logo`"
				loading="lazy"
				class="size-20 rounded-xl"
			/>
			<div>
				<p
					class="mb-2 font-mono text-xs font-semibold tracking-(--home-ls-label) text-primary uppercase"
				>
					Also from WolfStar Project
				</p>
				<h3 class="text-3xl font-bold text-base-content">
					{{ app.name }}
				</h3>
				<p class="mt-2 max-w-150 text-base leading-relaxed text-base-content/65">
					{{ app.description }}
				</p>
			</div>
			<div class="flex flex-col gap-3 sm:flex-row md:flex-col">
				<UButton
					:to="app.explore"
					color="neutral"
					variant="outline"
					size="lg"
					class="justify-center"
				>
					Explore {{ app.name }}
				</UButton>
				<UButton
					v-if="app.invite !== '#'"
					:to="app.invite"
					color="primary"
					size="lg"
					icon="ph:plus-circle-fill"
					class="justify-center"
				>
					Invite {{ app.name }}
				</UButton>
				<span v-else class="font-mono text-xs text-muted">Invite access coming later</span>
			</div>
		</div>
	</Section>
</template>

<script setup lang="ts">
const { apps } = defineProps<{
	apps: readonly OtherApp[];
}>();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.other-app {
	border-color: var(--home-border-subtle);
}
</style>
