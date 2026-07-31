<template>
	<Section
		id="apps"
		labelled-by="home-apps-heading"
		scroll-margin
		contained
		spacing="none"
		class="py-22"
	>
		<SectionHeader
			eyebrow="Other Apps"
			title="Want more? We've got you covered."
			heading-id="home-apps-heading"
			class="mb-10"
		/>

		<div class="gap-5 md:grid-cols-2 grid grid-cols-1">
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
					class="mb-4 h-16 w-16 rounded-lg"
				/>
				<div class="mb-2 gap-2 flex flex-wrap items-center justify-center">
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
				<div class="gap-2 flex flex-wrap justify-center">
					<StarButton :to="app.explore" color="neutral" variant="outline" size="sm">
						Explore
					</StarButton>
					<StarButton
						:to="app.invite"
						color="primary"
						size="sm"
						icon="ph:plus-circle-fill"
					>
						Add App
					</StarButton>
				</div>
			</SurfaceCard>

			<div
				class="home-apps-placeholder rounded-xl p-10 flex items-center justify-center text-center"
			>
				<div>
					<div class="mb-1.5 text-base font-semibold text-base-content/80">
						More apps in the works
					</div>
					<div class="text-muted text-[13px]">
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
.home-apps-placeholder {
	border: 1px dashed oklch(from var(--color-base-content) l c h / 0.2);
}
</style>
