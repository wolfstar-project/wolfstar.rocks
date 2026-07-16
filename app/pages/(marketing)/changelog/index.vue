<template>
	<UContainer class="pt-20 sm:pt-24">
		<UPageHero
			title="Changelog"
			:description="description"
			:ui="{ container: 'pb-12 sm:pb-16 lg:pb-20' }"
		>
			<template #description>
				{{ description }}

				<UButton
					to="https://github.com/wolfstar-project/wolfstar.rocks/releases"
					color="neutral"
					external
					icon="i-lucide-github"
					variant="subtle"
					size="xs"
					target="_blank"
				>
					GitHub Releases
				</UButton>
			</template>
		</UPageHero>

		<UPageBody>
			<UChangelogVersions v-if="versions.length">
				<UChangelogVersion
					v-for="version in versions"
					:key="version.tag"
					:title="version.title"
					:date="formatDateByLocale('en', version.date)"
					:authors="version.authors"
				>
					<template #body>
						<MDC
							v-if="version.markdown"
							:value="version.markdown"
							:cache-key="version.tag"
						/>
					</template>
				</UChangelogVersion>
			</UChangelogVersions>

			<p v-else class="text-muted">No releases have been published yet.</p>
		</UPageBody>
	</UContainer>
</template>

<script setup lang="ts">
interface UnghRelease {
	tag: string;
	name: string;
	publishedAt: string;
	markdown: string;
	author?: string;
}

const site = useSiteConfig();

const title = "Changelog";
const description = "Track every release, improvement, and fix across the WolfStar Project.";

const { data: versions } = await useFetch(
	"https://ungh.cc/repos/wolfstar-project/wolfstar.rocks/releases",
	{
		key: "changelog-releases",
		transform: (data: { releases?: UnghRelease[] }) =>
			(data.releases ?? []).map((release) => ({
				tag: release.tag,
				title: release.name || release.tag,
				date: release.publishedAt,
				markdown: release.markdown,
				authors: release.author
					? [
							{
								name: release.author,
								description: `@${release.author}`,
								avatar: { src: `https://github.com/${release.author}.png` },
								to: `https://github.com/${release.author}`,
								target: "_blank",
							},
						]
					: [],
			})),
		default: () => [],
	},
);

useSeoMeta({
	titleTemplate: "%s",
	title,
	description,
	ogTitle: title,
	ogDescription: description,
	ogUrl: `${site.url}/changelog`,
});

defineOgImage("Changelog", {
	title,
	description,
});
</script>
