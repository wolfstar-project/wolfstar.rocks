<template>
	<Section
		id="staryl-product"
		labelled-by="staryl-product-heading"
		scroll-margin
		spacing="none"
		class="pb-28"
	>
		<div class="mb-12 max-w-190">
			<p
				class="mb-4 font-mono text-xs font-semibold tracking-(--home-ls-label) text-primary uppercase"
			>
				{{ ts("marketing.staryl.proof.eyebrow") }}
			</p>
			<h2
				id="staryl-product-heading"
				class="text-4xl leading-[1.05] font-bold tracking-(--home-ls-tight) text-base-content md:text-5xl"
			>
				{{ ts("marketing.staryl.proof.title") }}
			</h2>
		</div>

		<!--
			The three cards still describe unshipped work: their copy is deliberately
			vague. Replace the message values in marketing.json once the feature set
			is locked — and only claim behaviour that actually exists.
		-->
		<div class="grid gap-4 md:grid-cols-3">
			<SurfaceCard
				v-for="step of proofSteps"
				:key="step.index"
				tag="article"
				padding="lg"
				class="flex flex-col"
			>
				<div class="flex items-center justify-between">
					<span class="staryl-proof-icon">
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
				<p class="text-base leading-relaxed text-base-content/65">
					{{ step.description }}
				</p>
			</SurfaceCard>
		</div>
	</Section>
</template>

<script setup lang="ts">
const { ts } = useI18n();

const proofSteps = computed(() => [
	{
		description: ts("marketing.staryl.proof.step_1_body"),
		icon: "ph:twitch-logo-duotone",
		index: "01",
		title: ts("marketing.staryl.proof.step_1_title"),
	},
	{
		description: ts("marketing.staryl.proof.step_2_body"),
		icon: "ph:arrow-right",
		index: "02",
		title: ts("marketing.staryl.proof.step_2_title"),
	},
	{
		description: ts("marketing.staryl.proof.step_3_body"),
		icon: "ph:users-three-duotone",
		index: "03",
		title: ts("marketing.staryl.proof.step_3_title"),
	},
]);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.staryl-proof-icon {
	@apply flex size-11 items-center justify-center rounded-lg text-primary;
	background: var(--home-blurple-soft);
}
</style>
