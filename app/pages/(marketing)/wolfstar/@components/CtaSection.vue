<template>
	<Section labelled-by="home-cta-heading" :contained="false" spacing="none">
		<div
			class="home-cta relative overflow-hidden bg-primary py-16 text-center text-primary-content sm:py-20"
		>
			<IconsWolfstar
				class="pointer-events-none absolute -top-10 -right-10 h-56 w-56 text-primary-content opacity-10"
				aria-hidden="true"
			/>
			<Container class="relative">
				<h2
					id="home-cta-heading"
					class="mb-3 text-4xl leading-[1.1] font-bold tracking-[-0.02em]"
				>
					Liking what you see?
				</h2>
				<p class="mb-8 text-lg text-primary-content/85">
					Add WolfStar to your server in seconds, or drop by the support server first.
				</p>
				<div class="flex flex-col justify-center gap-3 sm:flex-row">
					<UButton
						:to="inviteUrl"
						color="neutral"
						size="lg"
						class="justify-center sm:min-w-44"
					>
						Invite WolfStar
					</UButton>
					<UButton
						to="https://join.wolfstar.rocks"
						color="neutral"
						variant="outline"
						size="lg"
						class="home-cta-outline justify-center sm:min-w-44"
					>
						Support Server
					</UButton>
				</div>
			</Container>
		</div>
	</Section>
</template>

<script setup lang="ts">
defineProps<{
	inviteUrl: string;
}>();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.home-cta-outline {
	border-color: oklch(from var(--color-primary-content) l c h / 0.35);
	color: var(--color-primary-content);
}
</style>
