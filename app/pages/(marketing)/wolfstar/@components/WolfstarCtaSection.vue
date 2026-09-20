<template>
	<Section labelled-by="home-cta-heading" spacing="none" class="pb-28">
		<div class="home-cta relative overflow-hidden rounded-2xl px-6 py-14 sm:px-14 sm:py-16">
			<IconsWolfstar class="home-cta-watermark" aria-hidden="true" />
			<div class="relative flex flex-col items-center text-center">
				<p class="mb-4 font-mono text-sm font-medium text-primary">
					{{ t("marketing.wolfstar.cta.eyebrow") }}
				</p>
				<h2
					id="home-cta-heading"
					class="max-w-190 text-4xl leading-[1.05] font-bold tracking-(--home-ls-tight) text-base-content md:text-5xl"
				>
					{{ t("marketing.wolfstar.cta.title") }}
				</h2>
				<p class="mt-5 max-w-140 text-base leading-relaxed text-base-content/65">
					{{ t("marketing.wolfstar.cta.subtitle") }}
				</p>
				<div class="mt-7 flex flex-col gap-3 sm:flex-row">
					<UButton
						:to="inviteUrl"
						color="primary"
						size="lg"
						class="justify-center sm:min-w-48"
						icon="ph:plus-circle-fill"
					>
						{{ t("marketing.wolfstar.cta.invite") }}
					</UButton>
					<UButton
						to="https://join.wolfstar.rocks"
						color="neutral"
						variant="outline"
						size="lg"
						class="home-cta-outline justify-center sm:min-w-48"
					>
						{{ t("marketing.wolfstar.cta.ask_in_support") }}
					</UButton>
				</div>
			</div>
		</div>
	</Section>
</template>

<script setup lang="ts">
defineProps<{
	inviteUrl: string;
}>();

const { t } = useI18n();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.home-cta {
	background-color: var(--color-base-300);
	border: 1px solid var(--home-border-subtle);
	/* Brand rule along the top edge, per the redesign canvas. */
	border-top: 3px solid var(--color-primary);
}

.home-cta-watermark {
	@apply pointer-events-none absolute -right-10 -bottom-16 size-80 text-base-content opacity-[0.06];
}

.home-cta-outline {
	border-color: oklch(from var(--color-base-content) l c h / 0.2);
	color: var(--color-base-content);
}
</style>
