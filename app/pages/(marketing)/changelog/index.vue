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
							:parser-options="headingIdParserOptions(version.tag)"
						/>
						<ChangelogContributors
							v-if="version.contributors.length"
							:id-prefix="version.tag"
							:contributors="version.contributors"
						/>
					</template>
				</UChangelogVersion>
			</UChangelogVersions>

			<p v-else class="text-muted">No releases have been published yet.</p>
		</UPageBody>
	</UContainer>
</template>

<script setup lang="ts">
import type {
	ChangelogContributorItem,
	ReleaseContributor,
} from "~/utils/parse-release-contributors";
import { parseReleaseContributors } from "~/utils/parse-release-contributors";

interface UnghRelease {
	tag: string;
	name: string;
	publishedAt: string;
	markdown: string;
	author?: string;
}

interface UnghContributor {
	username: string;
	contributions: number;
}

const REPO = "wolfstar-project/wolfstar.rocks";
const site = useSiteConfig();

/**
 * Release notes render one `<MDC>` per version, each with a fresh slugger, so
 * shared section headings ("Fixes", "Chore", ...) would emit duplicate ids
 * across the page. Scope every release's heading ids by its tag to keep them
 * unique and satisfy html-validate's `no-dup-id` rule during prerender.
 */
function headingIdParserOptions(tag: string) {
	return {
		rehype: {
			plugins: {
				"changelog-heading-ids": {
					instance: rehypeChangelogHeadingIds,
					options: { prefix: tag },
				},
			},
		},
	};
}

function enrichContributors(
	parsed: ReleaseContributor[],
	contributionCounts: Record<string, number>,
): ChangelogContributorItem[] {
	return parsed.map((contributor) => {
		const key = contributor.username.toLowerCase();
		const commits = contributionCounts[key];
		return {
			name: contributor.name,
			username: contributor.username,
			commits: commits ?? 0,
			hasContributed: commits !== undefined,
			avatarSrc: `https://github.com/${contributor.username}.png`,
		};
	});
}

const title = "Changelog";
const description = "Track every release, improvement, and fix across the WolfStar Project.";

const { data: contributionCounts } = await useFetch(`https://ungh.cc/repos/${REPO}/contributors`, {
	key: "changelog-repo-contributors",
	transform: (data: { contributors?: UnghContributor[] }) => {
		const record: Record<string, number> = {};
		for (const contributor of data.contributors ?? []) {
			record[contributor.username.toLowerCase()] = contributor.contributions;
		}
		return record;
	},
	default: () => ({}),
});

const { data: versions } = await useFetch(`https://ungh.cc/repos/${REPO}/releases`, {
	key: "changelog-releases",
	transform: (data: { releases?: UnghRelease[] }) =>
		(data.releases ?? []).map((release) => {
			const { bodyMarkdown, contributors } = parseReleaseContributors(release.markdown ?? "");
			return {
				tag: release.tag,
				title: release.name || release.tag,
				date: release.publishedAt,
				markdown: bodyMarkdown,
				contributors: enrichContributors(contributors, contributionCounts.value ?? {}),
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
			};
		}),
	default: () => [],
});

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
