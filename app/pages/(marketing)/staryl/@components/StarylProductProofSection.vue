<template>
	<Section
		id="staryl-product"
		labelled-by="staryl-product-heading"
		scroll-margin
		spacing="none"
		class="pb-28"
	>
		<div class="grid gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20">
			<div>
				<p
					class="mb-4 font-mono text-xs font-semibold tracking-(--home-ls-label) text-primary uppercase"
				>
					What Staryl does
				</p>
				<h2
					id="staryl-product-heading"
					class="max-w-120 text-4xl leading-[1.05] font-bold tracking-(--home-ls-tight) text-base-content md:text-5xl"
				>
					<!-- PLACEHOLDER: replace with Staryl's real product narrative headline. -->
					From source to server, in one hop.
				</h2>
			</div>

			<!--
				PLACEHOLDER CONTENT.
				Each row below describes a step Staryl has not shipped yet. Replace the
				headings, copy, and anchor targets once the feature set is locked — and
				only claim behaviour that actually exists.
			-->
			<div class="staryl-proof-list border-t">
				<article v-for="step of proofSteps" :key="step.index" class="staryl-proof-row">
					<span class="staryl-proof-index" aria-hidden="true">{{ step.index }}</span>
					<div>
						<h3 class="text-xl font-semibold text-base-content">{{ step.title }}</h3>
						<p class="mt-2 max-w-150 text-base leading-relaxed text-base-content/65">
							{{ step.description }}
						</p>
					</div>
				</article>
			</div>
		</div>
	</Section>
</template>

<script setup lang="ts">
const proofSteps = [
	{
		index: "01",
		title: "Pick the source",
		description:
			"Placeholder — describe which platforms Staryl watches once the supported source list is confirmed.",
	},
	{
		index: "02",
		title: "Route the update",
		description:
			"Placeholder — describe how updates reach a channel, and what can be customised per subscription.",
	},
	{
		index: "03",
		title: "Manage it together",
		description:
			"Placeholder — describe what a server team can configure, and where they configure it.",
	},
] as const;
</script>

<style scoped>
@reference "@/assets/css/main.css";

.staryl-proof-list {
	border-color: var(--home-border-subtle);
}

.staryl-proof-row {
	@apply grid grid-cols-[2.5rem_1fr] gap-4 border-b py-7 sm:grid-cols-[3.5rem_1fr] sm:gap-6;
	border-color: var(--home-border-subtle);
}

.staryl-proof-index {
	@apply pt-1 font-mono text-xs text-muted;
}
</style>
