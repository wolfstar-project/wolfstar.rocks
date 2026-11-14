<template>
	<Section
		id="setup"
		labelled-by="staryl-setup-heading"
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
					{{ ts("marketing.staryl.setup.eyebrow") }}
				</p>
				<h2
					id="staryl-setup-heading"
					class="text-4xl leading-[1.05] font-bold tracking-(--home-ls-tight) text-base-content md:text-5xl"
				>
					{{ ts("marketing.staryl.setup.title") }}
				</h2>
				<p class="mt-5 max-w-135 text-base leading-relaxed text-base-content/65">
					<i18n-t keypath="marketing.staryl.setup.subtitle" tag="span">
						<template #command>
							<code class="staryl-setup-command">/setup</code>
						</template>
					</i18n-t>
				</p>
				<div class="mt-7 flex flex-col gap-3 sm:flex-row">
					<UButton
						:to="inviteUrl"
						color="primary"
						size="lg"
						class="justify-center"
						icon="ph:plus-circle-fill"
					>
						{{ ts("marketing.staryl.cta.invite") }}
					</UButton>
					<UButton
						to="#staryl-showcase"
						:locale="false"
						color="neutral"
						variant="outline"
						size="lg"
						class="justify-center"
					>
						{{ ts("marketing.staryl.setup.see_commands") }}
					</UButton>
				</div>
			</div>

			<!-- The pages of the `/setup` menu (staryl, src/locales/en-US/commands/setup.json). -->
			<div class="staryl-setup-index border-t">
				<div class="staryl-setup-index-header">
					<span class="font-mono text-xs tracking-(--home-ls-label) text-muted uppercase">
						{{ ts("marketing.staryl.setup.index_label") }}
					</span>
					<span class="font-mono text-xs text-muted">{{
						ts("marketing.staryl.setup.pages_count")
					}}</span>
				</div>
				<ol>
					<li v-for="(page, index) of pages" :key="page.title" class="staryl-setup-row">
						<span class="staryl-setup-number">{{
							String(index + 1).padStart(2, "0")
						}}</span>
						<div>
							<h3>{{ page.title }}</h3>
							<p>{{ page.body }}</p>
						</div>
					</li>
				</ol>
			</div>
		</div>
	</Section>
</template>

<script setup lang="ts">
const { inviteUrl } = defineProps<{ inviteUrl: string }>();

const { ts } = useI18n();

const pages = computed(() => [
	{
		title: ts("marketing.staryl.setup.overview_title"),
		body: ts("marketing.staryl.setup.overview_body"),
	},
	{ title: ts("marketing.staryl.setup.add_title"), body: ts("marketing.staryl.setup.add_body") },
	{
		title: ts("marketing.staryl.setup.manage_title"),
		body: ts("marketing.staryl.setup.manage_body"),
	},
	{
		title: ts("marketing.staryl.setup.test_title"),
		body: ts("marketing.staryl.setup.test_body"),
	},
]);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.staryl-setup-command {
	@apply rounded px-1.5 py-0.5 font-mono text-[0.875em];
	background-color: oklch(from var(--color-base-content) l c h / 0.08);
}

.staryl-setup-index {
	border-color: var(--home-border-subtle);
}

.staryl-setup-index-header {
	@apply flex items-center justify-between border-b py-4;
	border-color: var(--home-border-subtle);
}

.staryl-setup-row {
	@apply grid grid-cols-[2.5rem_1fr] gap-4 border-b py-7 sm:grid-cols-[3.5rem_1fr] sm:gap-6;
	border-color: var(--home-border-subtle);
}

.staryl-setup-number {
	@apply pt-1 font-mono text-xs text-primary;
}

.staryl-setup-row h3 {
	@apply text-lg font-semibold text-base-content;
}

.staryl-setup-row p {
	@apply mt-1.5 text-base leading-relaxed text-base-content/60;
}
</style>
