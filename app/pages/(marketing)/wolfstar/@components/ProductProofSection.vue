<template>
	<Section
		id="product"
		labelled-by="home-product-heading"
		scroll-margin
		spacing="none"
		class="pb-28"
	>
		<div class="grid gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20">
			<div>
				<p
					class="mb-4 font-mono text-xs font-semibold tracking-(--home-ls-label) text-primary uppercase"
				>
					What WolfStar does
				</p>
				<h2
					id="home-product-heading"
					class="max-w-120 text-4xl leading-[1.05] font-bold tracking-(--home-ls-tight) text-base-content md:text-5xl"
				>
					One system from first warning to final review.
				</h2>
			</div>

			<div class="border-t home-proof-list">
				<article class="home-proof-row">
					<span class="home-proof-index" aria-hidden="true">01</span>
					<div>
						<h3 class="text-xl font-semibold text-base-content">Set the rule</h3>
						<p class="mt-2 max-w-150 text-base leading-relaxed text-base-content/65">
							Choose which messages WolfStar should catch, what happens to the message,
							and when repeated infractions become a warning, timeout, kick, or ban.
						</p>
						<UButton
							to="#moderation-tools"
							color="neutral"
							variant="link"
							class="mt-3 px-0"
							trailing-icon="ph:arrow-down-right"
						>
							Test an AutoMod rule
						</UButton>
					</div>
				</article>

				<article class="home-proof-row">
					<span class="home-proof-index" aria-hidden="true">02</span>
					<div>
						<h3 class="text-xl font-semibold text-base-content">Keep the record</h3>
						<p class="mt-2 max-w-150 text-base leading-relaxed text-base-content/65">
							Send live events to Discord and review moderation, warnings, commands, and
							settings activity later in the dashboard.
						</p>
						<UButton
							to="#advanced-logging"
							color="neutral"
							variant="link"
							class="mt-3 px-0"
							trailing-icon="ph:arrow-down-right"
						>
							Inspect the logging flow
						</UButton>
					</div>
				</article>

				<article class="home-proof-row">
					<span class="home-proof-index" aria-hidden="true">03</span>
					<div>
						<h3 class="text-xl font-semibold text-base-content">Review it together</h3>
						<p class="mt-2 max-w-150 text-base leading-relaxed text-base-content/65">
							Manage channels, roles, events, command access, and moderation filters from
							the same authenticated dashboard.
						</p>
						<UButton
							to="#dashboard"
							color="neutral"
							variant="link"
							class="mt-3 px-0"
							trailing-icon="ph:arrow-down-right"
						>
							See the dashboard scope
						</UButton>
					</div>
				</article>
			</div>
		</div>
	</Section>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.home-proof-list {
	border-color: var(--home-border-subtle);
}

.home-proof-row {
	@apply grid grid-cols-[2.5rem_1fr] gap-4 border-b py-7 sm:grid-cols-[3.5rem_1fr] sm:gap-6;
	border-color: var(--home-border-subtle);
}

.home-proof-index {
	@apply pt-1 font-mono text-xs text-muted;
}
</style>
