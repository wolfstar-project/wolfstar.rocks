<template>
	<section
		class="home-hero relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-30"
		aria-labelledby="home-hero-heading"
	>
		<Container>
			<div class="grid items-end gap-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
				<div class="max-w-190 animate-fade-in-up-safe">
					<p class="home-hero-kicker mb-6 font-mono text-sm font-medium text-primary">
						{{ ts("marketing.wolfstar.hero.kicker") }}
					</p>

					<h1 id="home-hero-heading" class="home-hero-title text-balance">
						{{ ts("marketing.wolfstar.hero.title") }}
					</h1>

					<p class="home-hero-subtitle mt-7 max-w-165 text-pretty">
						{{ ts("marketing.wolfstar.hero.subtitle") }}
					</p>

					<div class="mt-9 flex flex-col gap-3 sm:flex-row">
						<UButton
							:to="inviteUrl"
							size="xl"
							color="primary"
							class="justify-center sm:min-w-48"
							icon="ph:plus-circle-fill"
						>
							{{ ts("marketing.wolfstar.hero.invite") }}
						</UButton>
						<UButton
							to="#showcase"
							:locale="false"
							size="xl"
							color="neutral"
							variant="outline"
							class="hero-outline-btn justify-center sm:min-w-48"
							trailing-icon="ph:arrow-down"
						>
							{{ ts("marketing.wolfstar.hero.see_work") }}
						</UButton>
					</div>

					<p class="mt-6 text-sm text-muted">
						{{ ts("marketing.wolfstar.hero.release", { version: buildVersion }) }} ·
						<NuxtTime
							:datetime="buildTime"
							month="short"
							day="numeric"
							year="numeric"
						/>
						·
						<NuxtLink
							to="https://github.com/wolfstar-project/wolfstar.rocks"
							target="_blank"
							rel="noopener noreferrer"
							class="font-medium text-base-content underline decoration-base-content/25 underline-offset-4 hover:decoration-base-content"
						>
							{{ ts("marketing.wolfstar.hero.view_source") }}
						</NuxtLink>
					</p>
				</div>

				<aside
					class="home-hero-brief animate-fade-in-up-safe [animation-delay:0.08s]"
					:aria-label="ts('marketing.wolfstar.hero.brief_aria')"
				>
					<div class="home-hero-brief-header">
						<IconsWolfstar class="size-11 text-primary" aria-hidden="true" />
						<span
							class="font-mono text-xs tracking-(--home-ls-label) text-muted uppercase"
						>
							{{ ts("marketing.wolfstar.hero.brief_label") }}
						</span>
					</div>
					<dl>
						<div class="home-hero-brief-row">
							<dt>{{ ts("marketing.wolfstar.hero.automod_term") }}</dt>
							<dd>{{ ts("marketing.wolfstar.hero.automod_value") }}</dd>
						</div>
						<div class="home-hero-brief-row">
							<dt>{{ ts("marketing.wolfstar.hero.history_term") }}</dt>
							<dd>{{ ts("marketing.wolfstar.hero.history_value") }}</dd>
						</div>
						<div class="home-hero-brief-row">
							<dt>{{ ts("marketing.wolfstar.hero.dashboard_term") }}</dt>
							<dd>{{ ts("marketing.wolfstar.hero.dashboard_value") }}</dd>
						</div>
					</dl>
				</aside>
			</div>
		</Container>
	</section>
</template>

<script setup lang="ts">
const { buildTime, buildVersion, inviteUrl } = defineProps<{
	buildTime: Date;
	buildVersion: string;
	inviteUrl: string;
}>();

const { ts } = useI18n();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.home-hero-title {
	font-size: clamp(3.25rem, 8vw, 6.75rem);
	@apply max-w-190 leading-[0.95] font-bold;
	letter-spacing: var(--home-ls-tight);
}

.home-hero-subtitle {
	@apply text-lg leading-relaxed font-normal text-base-content/70 md:text-xl;
}

.home-hero-kicker::before {
	display: inline-block;
	width: 2.5rem;
	height: 1px;
	margin-right: 0.75rem;
	vertical-align: middle;
	background: currentColor;
	content: "";
}

.hero-outline-btn {
	border-color: oklch(from var(--color-base-content) l c h / 0.2);
	color: var(--color-base-content);
}

.home-hero-brief {
	border-block: 1px solid var(--home-border-subtle);
}

.home-hero-brief-header {
	@apply flex items-center gap-4 py-5;
}

.home-hero-brief-row {
	@apply grid gap-2 border-t py-5 sm:grid-cols-[6.5rem_1fr];
	border-color: var(--home-border-subtle);
}

.home-hero-brief-row dt {
	@apply font-mono text-sm font-semibold text-base-content;
}

.home-hero-brief-row dd {
	@apply text-base leading-relaxed text-base-content/65;
}
</style>
