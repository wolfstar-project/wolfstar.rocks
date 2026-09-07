<template>
	<UContainer>
		<UPage v-if="version">
			<UPageHeader
				:title="version.title"
				:description="version.description"
				:ui="{ headline: 'flex flex-col gap-y-8 items-start' }"
			>
				<template #headline>
					<UBreadcrumb
						:items="[
							{ label: 'Changelog', icon: 'i-lucide-history', to: '/changelog' },
							{ label: version.title },
						]"
						class="max-w-full"
					/>
					<div class="flex items-center gap-2">
						<UBadge v-if="version.badge" v-bind="version.badge" variant="subtle" />
						<time class="text-muted">{{ formatDateByLocale("en", version.date) }}</time>
					</div>
				</template>

				<div v-if="version.authors?.length" class="mt-4 flex flex-wrap items-center gap-6">
					<UUser
						v-for="(author, index) in version.authors"
						:key="index"
						v-bind="author"
						size="sm"
					/>
				</div>
			</UPageHeader>

			<UPageBody>
				<ContentRenderer v-if="version.body" :value="version" />

				<div class="not-prose mt-12 flex items-center justify-between">
					<ULink to="/changelog" class="text-primary"> ← Back to changelog </ULink>
					<UButton icon="i-lucide-link" variant="ghost" color="neutral" @click="copyLink">
						<span class="sr-only">Copy URL</span>
						Copy URL
					</UButton>
				</div>

				<USeparator v-if="surround?.length" />

				<UContentSurround :surround="surround ?? undefined" />
			</UPageBody>
		</UPage>
	</UContainer>
</template>

<script setup lang="ts">
import { kebabCase } from "scule";

const route = useRoute();
const site = useSiteConfig();
const { copy } = useClipboard();

const [{ data: version }, { data: surround }] = await Promise.all([
	useAsyncData(kebabCase(route.path), () =>
		queryCollection("changelogVersions").path(route.path).first(),
	),
	useAsyncData(`${kebabCase(route.path)}-surround`, () =>
		queryCollectionItemSurroundings("changelogVersions", route.path, {
			fields: ["description"],
		}).order("date", "DESC"),
	),
]);

if (!version.value) {
	throw createError({ statusCode: 404, statusMessage: "Changelog entry not found", fatal: true });
}

const post = version.value;
const title = post.title;
const description = post.description;

useSeoMeta({
	titleTemplate: "%s · WolfStar Changelog",
	title,
	description,
	ogDescription: description,
	ogTitle: `${title} · WolfStar Changelog`,
	...(post.image ? { ogImage: `${site.url}${post.image}` } : {}),
});

if (!post.image) {
	defineOgImage("Changelog", { title, description });
}

function copyLink() {
	copy(`${site.url}${post.path}`, {
		title: "Link copied to clipboard",
		icon: "i-lucide-copy-check",
	});
}
</script>
