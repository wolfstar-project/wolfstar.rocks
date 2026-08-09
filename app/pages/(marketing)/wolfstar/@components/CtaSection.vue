<template>
	<Section
		labelled-by="home-cta-heading"
		:contained="false"
		spacing="none"
		class="home-cta bg-primary py-20 text-primary-content relative overflow-hidden text-center"
	>
		<IconsWolfstar
			class="-top-10 -right-10 h-55 w-55 text-primary-content pointer-events-none absolute opacity-10"
			aria-hidden="true"
		/>
		<Container class="relative">
			<h2
				id="home-cta-heading"
				class="mb-3 text-4xl font-bold leading-[1.1] tracking-[var(--home-ls-tight)]"
			>
				Liking what you see?
			</h2>
			<p class="mb-8 text-primary-content text-[15px]">
				Add WolfStar to your server in seconds, or drop by the support server first.
			</p>
			<div class="gap-3 sm:flex-row flex flex-col justify-center">
				<StarButton
					:to="inviteUrl"
					color="neutral"
					size="lg"
					class="sm:min-w-45 justify-center"
				>
					Invite WolfStar
				</StarButton>
				<StarButton
					to="https://join.wolfstar.rocks"
					color="neutral"
					variant="outline"
					size="lg"
					class="home-cta-outline sm:min-w-45 justify-center"
				>
					Support Server
				</StarButton>
			</div>
		</Container>
	</Section>
</template>

<script setup lang="ts">
defineProps<{
	inviteUrl: string;
}>();
</script>

<style scoped>
/* Full-bleed out of StarMain's max-width; page overflow clipped on .app-layout */
.home-cta {
	width: 100vw;
	max-width: 100vw;
	margin-inline: calc(50% - 50vw);
}

.home-cta-outline {
	border-color: oklch(from var(--color-primary-content) l c h / 0.35);
	color: var(--color-primary-content);
}
</style>
