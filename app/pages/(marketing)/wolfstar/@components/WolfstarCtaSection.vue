<template>
	<Section labelled-by="home-cta-heading" spacing="none" class="pb-28">
		<div
			class="home-cta grid overflow-hidden bg-neutral p-8 text-neutral-content sm:p-12 lg:grid-cols-[1fr_auto] lg:items-end lg:p-16"
		>
			<div>
				<div class="mb-8 flex items-center gap-4">
					<IconsWolfstar class="size-12 text-primary" aria-hidden="true" />
					<span
						class="font-mono text-xs tracking-(--home-ls-label) text-neutral-content/60 uppercase"
					>
						{{ ts("marketing.wolfstar.cta.eyebrow") }}
					</span>
				</div>
				<h2
					id="home-cta-heading"
					class="max-w-180 text-4xl leading-[1.02] font-bold tracking-(--home-ls-tight) md:text-5xl"
				>
					{{ ts("marketing.wolfstar.cta.title") }}
				</h2>
				<p class="mt-5 max-w-145 text-base leading-relaxed text-neutral-content/70">
					{{ ts("marketing.wolfstar.cta.subtitle") }}
				</p>
			</div>
			<div class="mt-9 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col">
				<UButton
					:to="inviteUrl"
					color="primary"
					size="xl"
					class="justify-center lg:min-w-52"
					icon="ph:plus-circle-fill"
				>
					{{ ts("marketing.wolfstar.cta.invite") }}
				</UButton>
				<UButton
					to="https://join.wolfstar.rocks"
					color="neutral"
					variant="outline"
					size="xl"
					class="home-cta-outline justify-center lg:min-w-52"
				>
					{{ ts("marketing.wolfstar.cta.ask_in_support") }}
				</UButton>
			</div>
		</div>
	</Section>
</template>

<script setup lang="ts">
defineProps<{
	inviteUrl: string;
}>();

const { ts } = useI18n();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.home-cta-outline {
	border-color: oklch(from var(--color-neutral-content) l c h / 0.3);
	background-color: transparent;
	color: var(--color-neutral-content);
}
</style>
