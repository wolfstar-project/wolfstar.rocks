<template>
	<section class="prose animate-on-scroll text-center">
		<h2 class="mt-32 text-5xl font-bold">Other Apps</h2>
		<p>You want a feature that WolfStar doesn't have? We got you covered!</p>
	</section>

	<div class="mt-8 grid w-full gap-4 xl:grid-cols-2">
		<div
			v-for="app of apps"
			:key="app.name"
			class="other-apps-layout rounded-xl bg-muted shadow-xl"
		>
			<nuxt-img
				:src="app.avatar"
				width="256"
				height="256"
				:alt="`${app.name}'s avatar`"
				loading="lazy"
				class="other-apps-avatar"
			/>
			<div class="other-apps-title">
				<h3 class="text-xl font-semibold md:text-3xl">
					{{ app.name }}
				</h3>
				<div class="mt-2 flex flex-wrap gap-1">
					<UBadge
						v-for="purpose of app.purposes"
						:key="purpose"
						color="neutral"
						variant="subtle"
					>
						{{ purpose }}
					</UBadge>
				</div>
			</div>
			<div class="other-apps-description">
				<p class="grow">{{ app.description }}</p>
				<UFieldGroup class="mt-4 justify-end">
					<UButton :to="app.explore" color="neutral" variant="solid">
						<UIcon name="ph:magnifying-glass-fill" class="h-5 w-5" aria-hidden="true" />
						Explore
					</UButton>
					<UButton :to="app.invite" color="neutral" variant="solid">
						<UIcon name="ph:plus-circle-fill" class="h-5 w-5" aria-hidden="true" /> Add
						App
					</UButton>
				</UFieldGroup>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const { apps } = defineProps<{ apps: readonly OtherApp[] }>();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.other-apps-layout {
	@apply grid gap-4 p-4;
	grid-template-rows: 230px min-content 1fr;
	grid-template-columns: 1fr;
	grid-template-areas:
		"a"
		"b"
		"c";
}

.other-apps-avatar {
	@apply h-full w-full object-contain max-md:rounded-xl md:rounded-l-xl;
	grid-area: a;
}

.other-apps-title {
	@apply text-3xl font-semibold md:mt-4 md:mr-4 md:text-xl;
	grid-area: b;
}

.other-apps-description {
	@apply flex flex-col md:mr-4 md:mb-4;
	grid-area: c;
}

@media (min-width: 768px) {
	.other-apps-layout {
		@apply p-0;
		grid-template-rows: min-content 1fr;
		grid-template-columns: 256px 1fr;
		grid-template-areas:
			"a b"
			"a c";
	}
}
</style>
