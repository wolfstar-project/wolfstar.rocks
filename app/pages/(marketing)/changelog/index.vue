<template>
	<UContainer>
		<div class="lg:grid lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-x-16">
			<header
				class="border-b border-default py-12 sm:py-16 lg:sticky lg:top-(--ui-header-height) lg:self-start lg:border-b-0 lg:py-24"
			>
				<h1 class="text-4xl font-bold tracking-tight text-highlighted sm:text-5xl">
					{{ ts("changelog.title") }}
				</h1>
				<p class="mt-4 text-lg/7 text-pretty text-muted">
					{{ ts("changelog.description") }}
				</p>

				<div class="-ms-2.5 mt-8 flex flex-wrap items-center gap-1">
					<UButton
						:to="RELEASES_URL"
						target="_blank"
						icon="i-simple-icons-github"
						:label="ts('changelog.github_releases')"
						variant="ghost"
						color="neutral"
						class="pointer-coarse:min-h-11"
					/>
					<UButton
						to="/updates"
						icon="i-lucide-newspaper"
						:label="ts('updates.title')"
						variant="ghost"
						color="neutral"
						class="pointer-coarse:min-h-11"
					/>
					<UButton
						to="/changelog/rss.xml"
						external
						target="_blank"
						icon="i-lucide-rss"
						:label="ts('blog.rss')"
						variant="ghost"
						color="neutral"
						class="pointer-coarse:min-h-11"
					/>
				</div>
			</header>

			<section :aria-label="ts('changelog.entries')" class="min-w-0">
				<!-- The date and the dot of an entry sit in a column of their own, beside its text: the column is narrower than the one Nuxt UI centres the text in. -->
				<UChangelogVersions
					v-if="entries.length"
					:indicator-motion="false"
					:ui="{ root: 'py-12 sm:py-16 lg:py-24', indicator: 'inset-y-0' }"
				>
					<UChangelogVersion
						v-for="entry in entries"
						:id="changelogEntryAnchor(entry.path)"
						:key="entry.path"
						:title="entry.title"
						:date="entry.date"
						:badge="{ ...kindBadges[entry.kind], variant: 'subtle' }"
						:image="
							entry.image
								? { alt: '', height: 378, src: entry.image, width: 672 }
								: undefined
						"
						:authors="entry.authors"
						:ui="{
							root: 'scroll-mt-[calc(var(--ui-header-height)+2rem)] lg:flex lg:items-start lg:gap-x-8',
							indicator: 'relative shrink-0',
							container: 'mx-0 w-full min-w-0 max-w-2xl',
							title: 'text-2xl tracking-tight sm:text-3xl',
						}"
					>
						<template #body>
							<ContentRenderer
								v-if="entry.body"
								:value="entry"
								class="mt-4 [&_:not(pre)>code]:max-w-full [&_:not(pre)>code]:wrap-anywhere"
							/>
						</template>
					</UChangelogVersion>
				</UChangelogVersions>

				<UEmpty
					v-else
					icon="i-lucide-history"
					:title="ts('changelog.empty')"
					:actions="[
						{
							color: 'neutral',
							label: ts('changelog.github_releases'),
							target: '_blank',
							to: RELEASES_URL,
							variant: 'subtle',
						},
					]"
					class="my-12 lg:my-24"
				/>
			</section>
		</div>
	</UContainer>
</template>

<script setup lang="ts">
const RELEASES_URL = "https://github.com/wolfstar-project/wolfstar.rocks/releases";

const { ts } = useI18n();
const { kindBadges } = useBlogLabels();

useSeoMetadata({
	description: () => ts("changelog.description"),
	title: () => ts("changelog.title"),
});

defineOgImage("Changelog", {
	description: ts("changelog.description"),
	title: ts("changelog.title"),
});

useHead({
	link: [
		{
			href: "/changelog/rss.xml",
			rel: "alternate",
			title: ts("blog.feed_changelog"),
			type: "application/rss+xml",
		},
	],
});

const { data: entries } = await useAsyncData(
	"changelog-entries",
	() => queryCollection("changelog").order("date", "DESC").all(),
	{ default: () => [] },
);
</script>
