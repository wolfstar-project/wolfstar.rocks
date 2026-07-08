<template>
	<Section
		id="apps"
		labelled-by="home-apps-heading"
		scroll-margin
		contained
		spacing="lg"
		class="home-apps-section"
	>
		<SectionHeader
			eyebrow="Other Apps"
			title="Want more? We've got you covered."
			heading-id="home-apps-heading"
			class="mb-10"
		/>

		<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
			<SurfaceCard
				v-for="app of apps"
				:key="app.name"
				tag="article"
				padding="lg"
				class="flex flex-col items-center text-center"
			>
				<NuxtImg
					:src="app.avatar"
					width="64"
					height="64"
					:alt="`${app.name}'s avatar`"
					loading="lazy"
					class="mb-4 h-16 w-16 rounded-xl"
				/>
				<div class="mb-2 flex flex-wrap items-center justify-center gap-2">
					<span class="text-xl font-bold text-base-content">{{ app.name }}</span>
					<span
						v-for="purpose of app.purposes"
						:key="purpose"
						class="badge badge-soft badge-sm badge-primary"
					>
						{{ purpose }}
					</span>
				</div>
				<p class="mb-5 text-sm leading-relaxed text-base-content/60">
					{{ app.description }}
				</p>
				<div class="flex flex-wrap justify-center gap-2">
					<UButton :to="app.explore" color="neutral" variant="soft" size="sm">
						Explore
					</UButton>
					<UButton :to="app.invite" color="primary" size="sm" icon="ph:plus-circle-fill">
						Add App
					</UButton>
				</div>
			</SurfaceCard>

			<div
				class="home-apps-placeholder flex items-center justify-center rounded-xl p-10 text-center"
			>
				<div>
					<div class="mb-1.5 font-semibold text-base-content/80">
						More apps in the works
					</div>
					<div class="text-sm text-muted">
						Follow the
						<NuxtLink to="/blog" class="link-hover underline">blog</NuxtLink> for what's
						next.
					</div>
				</div>
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

.home-apps-section {
	background-color: var(--color-base-300);
}

.home-apps-placeholder {
	border: 1px dashed oklch(from var(--color-base-content) l c h / 0.2);
}
</style>
