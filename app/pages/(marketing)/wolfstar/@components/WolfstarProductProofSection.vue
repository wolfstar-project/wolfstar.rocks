<template>
	<Section
		id="product"
		labelled-by="home-product-heading"
		scroll-margin
		spacing="none"
		class="pb-28"
	>
		<div class="mb-12 max-w-190">
			<p
				class="mb-4 font-mono text-xs font-semibold tracking-(--home-ls-label) text-primary uppercase"
			>
				{{ t("marketing.wolfstar.proof.eyebrow") }}
			</p>
			<h2
				id="home-product-heading"
				class="text-4xl leading-[1.05] font-bold tracking-(--home-ls-tight) text-base-content md:text-5xl"
			>
				{{ t("marketing.wolfstar.proof.title") }}
			</h2>
		</div>

		<div class="grid gap-4 md:grid-cols-3">
			<SurfaceCard
				v-for="step of steps"
				:key="step.index"
				tag="article"
				padding="lg"
				class="flex flex-col"
			>
				<div class="flex items-center justify-between">
					<span class="home-proof-icon">
						<UIcon :name="step.icon" class="size-5.5" aria-hidden="true" />
					</span>
					<span class="font-mono text-sm text-muted" aria-hidden="true">{{
						step.index
					}}</span>
				</div>
				<h3
					class="mt-6 mb-2.5 text-xl font-bold tracking-(--home-ls-tight) text-base-content"
				>
					{{ step.title }}
				</h3>
				<p class="text-base leading-relaxed text-base-content/65">{{ step.body }}</p>
				<UButton
					:to="step.to"
					color="primary"
					variant="link"
					class="mt-auto self-start px-0 pt-6"
					trailing-icon="ph:arrow-right"
				>
					{{ step.cta }}
				</UButton>
			</SurfaceCard>
		</div>
	</Section>
</template>

<script setup lang="ts">
const { t } = useI18n();

const steps = computed(() => [
	{
		body: t("marketing.wolfstar.proof.step_1_body"),
		cta: t("marketing.wolfstar.proof.step_1_cta"),
		icon: "ph:shield-check-duotone",
		index: "01",
		title: t("marketing.wolfstar.proof.step_1_title"),
		to: "#moderation-tools",
	},
	{
		body: t("marketing.wolfstar.proof.step_2_body"),
		cta: t("marketing.wolfstar.proof.step_2_cta"),
		icon: "ph:file-text-duotone",
		index: "02",
		title: t("marketing.wolfstar.proof.step_2_title"),
		to: "#advanced-logging",
	},
	{
		body: t("marketing.wolfstar.proof.step_3_body"),
		cta: t("marketing.wolfstar.proof.step_3_cta"),
		icon: "ph:squares-four-duotone",
		index: "03",
		title: t("marketing.wolfstar.proof.step_3_title"),
		to: "#dashboard",
	},
]);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.home-proof-icon {
	@apply flex size-11 items-center justify-center rounded-lg text-primary;
	background: var(--home-blurple-soft);
}
</style>
