<template>
	<UContainer class="mx-auto max-w-3xl space-y-8 px-4 py-12">
		<header class="space-y-2">
			<h1 class="text-3xl font-bold text-base-content">
				{{ ts("translation_status.title") }}
			</h1>
			<p class="text-base-content/70">
				{{ ts("translation_status.description") }}
			</p>
			<p v-if="status?.generatedAt" class="text-sm text-muted">
				<i18n-t keypath="translation_status.generated_at" tag="span" scope="global">
					<template #date>
						<NuxtTime
							:locale
							:datetime="status.generatedAt"
							date-style="long"
							time-style="medium"
						/>
					</template>
				</i18n-t>
			</p>
		</header>

		<section
			v-if="status"
			class="space-y-4"
			:aria-label="ts('translation_status.progress_by_locale')"
		>
			<p class="text-sm text-muted">
				{{ ts("translation_status.source_locale") }}:
				<strong class="text-base-content">
					{{ status.sourceLocale.label }} ({{ status.sourceLocale.lang }})
				</strong>
				— {{ status.sourceLocale.totalKeys }} keys
			</p>

			<ul class="space-y-3">
				<li
					v-for="localeStatus of status.locales"
					:key="localeStatus.lang"
					class="rounded-lg border border-base-200 bg-base-200/30 p-4"
					:lang="localeStatus.lang"
					:dir="localeStatus.dir"
				>
					<div class="mb-2 flex flex-wrap items-center justify-between gap-2">
						<div>
							<strong class="text-base-content">{{ localeStatus.label }}</strong>
							<span class="ms-2 text-sm text-muted">{{ localeStatus.lang }}</span>
						</div>
						<span class="text-sm text-muted">
							{{ localeStatus.completedKeys }} / {{ localeStatus.totalKeys }} ({{
								localeStatus.percentComplete
							}}%)
						</span>
					</div>
					<div
						class="h-2 overflow-hidden rounded-full bg-base-300"
						role="progressbar"
						:aria-valuenow="localeStatus.percentComplete"
						aria-valuemin="0"
						aria-valuemax="100"
						:aria-label="`${localeStatus.label}: ${localeStatus.percentComplete}%`"
					>
						<div
							class="h-full rounded-full bg-primary transition-[width]"
							:style="{ width: `${localeStatus.percentComplete}%` }"
						/>
					</div>
					<div class="mt-3 flex flex-wrap gap-3 text-sm">
						<UButton
							:to="localeStatus.githubEditUrl"
							target="_blank"
							rel="noopener noreferrer"
							size="xs"
							color="neutral"
							variant="soft"
							:label="ts('i18n.edit_on_github')"
						/>
						<span class="text-muted">
							{{ tc("i18n.missing_keys", localeStatus.missingKeys.length) }}
						</span>
					</div>
				</li>
			</ul>
		</section>

		<p v-else class="text-base-content/70">
			{{ ts("translation_status.no_data") }}
		</p>
	</UContainer>
</template>

<script setup lang="ts">
const { ts, tc } = useI18n();
const { locale } = useAppLocale();
const { status } = useI18nStatus();

useSeoMeta({
	title: () => ts("translation_status.title"),
	description: () => ts("translation_status.description"),
});
</script>
