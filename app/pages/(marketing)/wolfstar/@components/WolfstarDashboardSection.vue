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
					Dashboard
				</p>
				<h2
					id="home-dashboard-heading"
					class="text-4xl leading-[1.05] font-bold tracking-(--home-ls-tight) text-base-content md:text-5xl"
				>
					The control room is part of the product.
				</h2>
				<p class="mt-5 max-w-135 text-base leading-relaxed text-base-content/65">
					Sign in with Discord, choose a server you manage, and configure WolfStar without
					editing files or memorizing setup commands.
				</p>
				<div class="mt-7 flex flex-col gap-3 sm:flex-row">
					<UButton
						to="/oauth/login"
						color="primary"
						size="lg"
						class="justify-center"
						icon="ic:round-discord"
					>
						Sign in to dashboard
					</UButton>
					<UButton
						to="/commands"
						color="neutral"
						variant="outline"
						size="lg"
						class="justify-center"
					>
						Browse commands
					</UButton>
				</div>
			</div>

			<div class="dashboard-index border-t">
				<div class="dashboard-index-header">
					<span class="font-mono text-xs tracking-(--home-ls-label) text-muted uppercase">
						Inside the dashboard
					</span>
					<span class="font-mono text-xs text-muted">04 views</span>
				</div>
				<ol>
					<li class="dashboard-index-row">
						<span class="dashboard-index-number">01</span>
						<div>
							<h3>Server settings</h3>
							<p>General behavior, channels, roles, events, and command access.</p>
						</div>
					</li>
					<li class="dashboard-index-row">
						<span class="dashboard-index-number">02</span>
						<div>
							<h3>Moderation history</h3>
							<p>Filter by member, moderator, action, date, or search text.</p>
						</div>
					</li>
					<li class="dashboard-index-row">
						<span class="dashboard-index-number">03</span>
						<div>
							<h3>Command history</h3>
							<p>
								Review command names, outcomes, members, dates, and search matches.
							</p>
						</div>
					</li>
					<li class="dashboard-index-row">
						<span class="dashboard-index-number">04</span>
						<div>
							<h3>Settings activity</h3>
							<p>See who changed dashboard-managed settings and what changed.</p>
						</div>
					</li>
				</ol>
			</div>
		</div>
	</Section>
</template>

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
