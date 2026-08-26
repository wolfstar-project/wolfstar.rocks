<template>
	<Section
		id="dashboard"
		labelled-by="home-dashboard-heading"
		scroll-margin
		spacing="none"
		class="py-28"
	>
		<div
			class="grid items-start gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(28rem,1.2fr)] lg:gap-20"
		>
			<div class="lg:sticky lg:top-28">
				<p
					class="mb-4 font-mono text-xs font-semibold tracking-(--home-ls-label) text-primary uppercase"
				>
					{{ t("marketing.wolfstar.dashboard.eyebrow") }}
				</p>
				<h2
					id="home-dashboard-heading"
					class="text-4xl leading-[1.05] font-bold tracking-(--home-ls-tight) text-base-content md:text-5xl"
				>
					{{ t("marketing.wolfstar.dashboard.title") }}
				</h2>
				<p class="mt-5 max-w-135 text-base leading-relaxed text-base-content/65">
					{{ t("marketing.wolfstar.dashboard.subtitle") }}
				</p>
				<div class="mt-7 flex flex-col gap-3 sm:flex-row">
					<UButton
						to="/oauth/login"
						color="primary"
						size="lg"
						class="justify-center"
						icon="ic:round-discord"
					>
						{{ t("marketing.wolfstar.dashboard.sign_in") }}
					</UButton>
					<UButton
						to="/commands"
						color="neutral"
						variant="outline"
						size="lg"
						class="justify-center"
					>
						{{ t("marketing.wolfstar.dashboard.browse_commands") }}
					</UButton>
				</div>
			</div>

			<div class="dashboard-index border-t">
				<div class="dashboard-index-header">
					<span class="font-mono text-xs tracking-(--home-ls-label) text-muted uppercase">
						{{ t("marketing.wolfstar.dashboard.index_label") }}
					</span>
					<span class="font-mono text-xs text-muted">{{
						t("marketing.wolfstar.dashboard.views_count")
					}}</span>
				</div>
				<ol>
					<li class="dashboard-index-row">
						<span class="dashboard-index-number">01</span>
						<div>
							<h3>{{ t("marketing.wolfstar.dashboard.row_1_title") }}</h3>
							<p>{{ t("marketing.wolfstar.dashboard.row_1_body") }}</p>
						</div>
					</li>
					<li class="dashboard-index-row">
						<span class="dashboard-index-number">02</span>
						<div>
							<h3>{{ t("marketing.wolfstar.dashboard.row_2_title") }}</h3>
							<p>{{ t("marketing.wolfstar.dashboard.row_2_body") }}</p>
						</div>
					</li>
					<li class="dashboard-index-row">
						<span class="dashboard-index-number">03</span>
						<div>
							<h3>{{ t("marketing.wolfstar.dashboard.row_3_title") }}</h3>
							<p>{{ t("marketing.wolfstar.dashboard.row_3_body") }}</p>
						</div>
					</li>
					<li class="dashboard-index-row">
						<span class="dashboard-index-number">04</span>
						<div>
							<h3>{{ t("marketing.wolfstar.dashboard.row_4_title") }}</h3>
							<p>{{ t("marketing.wolfstar.dashboard.row_4_body") }}</p>
						</div>
					</li>
				</ol>
			</div>
		</div>
	</Section>
</template>

<script setup lang="ts">
const { ts: t } = useI18n();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.dashboard-index {
	border-color: var(--home-border-subtle);
}

.dashboard-index-header {
	@apply flex items-center justify-between border-b py-4;
	border-color: var(--home-border-subtle);
}

.dashboard-index-row {
	@apply grid grid-cols-[2.5rem_1fr] gap-4 border-b py-7 sm:grid-cols-[3.5rem_1fr] sm:gap-6;
	border-color: var(--home-border-subtle);
}

.dashboard-index-number {
	@apply pt-1 font-mono text-xs text-primary;
}

.dashboard-index-row h3 {
	@apply text-lg font-semibold text-base-content;
}

.dashboard-index-row p {
	@apply mt-1.5 text-base leading-relaxed text-base-content/60;
}
</style>
