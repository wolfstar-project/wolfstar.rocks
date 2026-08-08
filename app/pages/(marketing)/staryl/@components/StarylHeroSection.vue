<template>
	<section
		class="staryl-hero relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-30"
		aria-labelledby="staryl-hero-heading"
	>
		<Container>
			<div class="grid items-end gap-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
				<div class="max-w-190 animate-fade-in-up-safe">
					<p class="staryl-hero-kicker mb-6 font-mono text-sm font-medium text-primary">
						<!-- PLACEHOLDER: replace with Staryl's real positioning line. -->
						Open-source social notifications
					</p>

					<h1 id="staryl-hero-heading" class="staryl-hero-title text-balance">
						<!-- PLACEHOLDER: replace with Staryl's real headline. -->
						Social updates, where your server already is.
					</h1>

					<p class="staryl-hero-subtitle mt-7 max-w-165 text-pretty">
						<!-- PLACEHOLDER: replace with a description of what Staryl actually does. -->
						Staryl is in development. This page is a placeholder while its notification
						sources and command set are finalised.
					</p>

					<div class="mt-9 flex flex-col gap-3 sm:flex-row">
						<UButton
							v-if="inviteUrl !== '#'"
							:to="inviteUrl"
							size="xl"
							color="primary"
							class="justify-center sm:min-w-48"
							icon="ph:plus-circle-fill"
						>
							Invite Staryl
						</UButton>
						<UButton
							to="#staryl-showcase"
							size="xl"
							color="neutral"
							variant="outline"
							class="staryl-hero-outline-btn justify-center sm:min-w-48"
							trailing-icon="ph:arrow-down"
						>
							See Staryl work
						</UButton>
					</div>

					<p class="mt-6 text-sm text-muted">
						<span
							v-if="inviteUrl === '#'"
							class="font-medium text-base-content/80"
							data-testid="staryl-hero-availability"
						>
							Public invite not available yet
						</span>
						<template v-else>
							Release v{{ buildVersion }} ·
							<NuxtTime
								:datetime="buildTime"
								month="short"
								day="numeric"
								year="numeric"
							/>
						</template>
						·
						<NuxtLink
							to="https://github.com/wolfstar-project/wolfstar.rocks"
							target="_blank"
							rel="noopener noreferrer"
							class="font-medium text-base-content underline decoration-base-content/25 underline-offset-4 hover:decoration-base-content"
						>
							View source
						</NuxtLink>
					</p>
				</div>

				<aside
					class="staryl-hero-brief animate-fade-in-up-safe [animation-delay:0.08s]"
					aria-label="Staryl capability summary"
				>
					<div class="staryl-hero-brief-header">
						<NuxtImg
							src="/avatars/staryl.png"
							width="44"
							height="44"
							alt=""
							aria-hidden="true"
							class="size-11 rounded-lg"
						/>
						<span
							class="font-mono text-xs tracking-(--home-ls-label) text-muted uppercase"
						>
							What your server gets
						</span>
					</div>
					<!-- PLACEHOLDER: replace all three rows with Staryl's real capabilities. -->
					<dl>
						<div class="staryl-hero-brief-row">
							<dt>Sources</dt>
							<dd>Notification sources to be confirmed</dd>
						</div>
						<div class="staryl-hero-brief-row">
							<dt>Routing</dt>
							<dd>Per-channel delivery rules to be confirmed</dd>
						</div>
						<div class="staryl-hero-brief-row">
							<dt>Dashboard</dt>
							<dd>Dashboard scope to be confirmed</dd>
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
</script>

<style scoped>
@reference "@/assets/css/main.css";

.staryl-hero-title {
	font-size: clamp(3.25rem, 8vw, 6.75rem);
	@apply max-w-190 leading-[0.95] font-bold;
	letter-spacing: var(--home-ls-tight);
}

.staryl-hero-subtitle {
	@apply text-lg leading-relaxed font-normal text-base-content/70 md:text-xl;
}

.staryl-hero-kicker::before {
	display: inline-block;
	width: 2.5rem;
	height: 1px;
	margin-right: 0.75rem;
	vertical-align: middle;
	background: currentColor;
	content: "";
}

.staryl-hero-outline-btn {
	border-color: oklch(from var(--color-base-content) l c h / 0.2);
	color: var(--color-base-content);
}

.staryl-hero-brief {
	border-block: 1px solid var(--home-border-subtle);
}

.staryl-hero-brief-header {
	@apply flex items-center gap-4 py-5;
}

.staryl-hero-brief-row {
	@apply grid gap-2 border-t py-5 sm:grid-cols-[6.5rem_1fr];
	border-color: var(--home-border-subtle);
}

.staryl-hero-brief-row dt {
	@apply font-mono text-sm font-semibold text-base-content;
}

.staryl-hero-brief-row dd {
	@apply text-base leading-relaxed text-base-content/65;
}
</style>
