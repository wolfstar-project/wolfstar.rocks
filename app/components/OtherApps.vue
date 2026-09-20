<template>
	<Section
		id="apps"
		labelled-by="home-apps-heading"
		scroll-margin
		contained
		spacing="none"
		class="py-24"
	>
		<div
			class="grid items-start gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16"
		>
			<div>
				<p
					class="mb-4 font-mono text-xs font-semibold tracking-(--home-ls-label) text-primary uppercase"
				>
					{{ t("marketing.other_apps.eyebrow") }}
				</p>
				<h2
					id="home-apps-heading"
					class="text-4xl leading-[1.05] font-bold tracking-(--home-ls-tight) text-base-content md:text-5xl"
				>
					{{ t("marketing.other_apps.title") }}
				</h2>
			</div>

			<div class="flex flex-col gap-4">
				<SurfaceCard
					v-for="app of apps"
					:key="app.name"
					tag="article"
					padding="lg"
					class="flex flex-col gap-7 sm:flex-row"
				>
					<NuxtImg
						:src="app.avatar"
						width="96"
						height="96"
						:alt="t('marketing.other_apps.logo_alt', { app: app.name })"
						loading="lazy"
						class="size-24 shrink-0 rounded-[1.25rem]"
					/>
					<div class="flex flex-col gap-2.5">
						<p
							class="font-mono text-xs tracking-(--home-ls-label) text-muted uppercase"
						>
							{{ t("marketing.other_apps.also_from") }}
						</p>
						<h3 class="text-3xl font-bold tracking-(--home-ls-tight) text-base-content">
							{{ app.name }}
						</h3>
						<p class="max-w-150 text-base leading-relaxed text-base-content/65">
							{{ app.description }}
						</p>
						<div
							class="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
						>
							<UButton
								v-if="app.invite !== '#'"
								:to="app.invite"
								color="primary"
								icon="ph:plus-circle-fill"
								class="justify-center"
							>
								{{ t("marketing.other_apps.invite", { app: app.name }) }}
							</UButton>
							<UButton
								:to="app.explore"
								color="neutral"
								variant="soft"
								class="justify-center"
							>
								{{ t("marketing.other_apps.explore", { app: app.name }) }}
							</UButton>
							<span v-if="app.invite === '#'" class="font-mono text-xs text-muted">
								{{ t("marketing.other_apps.invite_pending") }}
							</span>
						</div>
					</div>
				</SurfaceCard>
			</div>
		</div>
	</Section>
</template>

<script setup lang="ts">
const { apps } = defineProps<{
	apps: readonly OtherApp[];
}>();

const { t } = useI18n();
</script>
