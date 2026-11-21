<template>
	<UContainer>
		<UPageHeader
			:title="ts('updates.title')"
			:description="ts('updates.description')"
			:ui="{ root: 'border-none pt-12 pb-10 sm:pt-16', description: 'max-w-xl' }"
		/>

		<UPageBody class="mt-0 flex flex-col gap-20 space-y-0">
			<UpdatesChangelogTimeline v-if="timeline.length" :entries="timeline" />

			<section aria-labelledby="posts-heading" class="flex flex-col gap-10">
				<div class="flex flex-col gap-4">
					<h2 id="posts-heading" class="text-2xl font-semibold text-highlighted">
						{{ ts("blog.posts") }}
					</h2>

					<div class="flex items-center justify-between gap-2 border-b border-default">
						<UpdatesCategoryNav :links="filters" :active="category" />

						<UDropdownMenu :items="feeds" :content="{ align: 'end' }">
							<UButton
								icon="i-lucide-rss"
								:aria-label="ts('blog.feeds')"
								color="neutral"
								variant="ghost"
								size="sm"
								class="mb-1.5 shrink-0 pointer-coarse:size-11 pointer-coarse:justify-center"
							/>
						</UDropdownMenu>
					</div>
				</div>

				<UBlogPosts v-if="visiblePosts.length" class="gap-y-12 lg:gap-y-14">
					<UpdatesPostCard
						v-for="(post, index) in visiblePosts"
						:key="post.path"
						:post="post"
						:eager="index < 3"
					/>
				</UBlogPosts>

				<UEmpty
					v-else
					icon="i-lucide-newspaper"
					:title="ts('blog.empty.title')"
					:description="ts('blog.empty.description')"
					:actions="[
						{
							color: 'neutral',
							label: ts('blog.timeline.view_all'),
							to: '/changelog',
							variant: 'subtle',
						},
					]"
				/>
			</section>
		</UPageBody>
	</UContainer>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const ALL_POSTS = "all";

const { ts } = useI18n();
const { categoryTabLabels } = useBlogLabels();
const route = useRoute();
const nuxtApp = useNuxtApp();

useSeoMetadata({
	description: () => ts("updates.description"),
	ogImage: { title: ts("updates.title") },
	shouldOgImage: true,
	title: () => ts("updates.title"),
});

useHead({
	link: [
		{
			href: "/blog/rss.xml",
			rel: "alternate",
			title: ts("blog.feed_blog"),
			type: "application/rss+xml",
		},
		{
			href: "/changelog/rss.xml",
			rel: "alternate",
			title: ts("blog.feed_changelog"),
			type: "application/rss+xml",
		},
	],
});

const [{ data: posts }, { data: timeline }] = await Promise.all([
	useBlog(),
	useAsyncData<ChangelogEntrySummary[]>(
		"changelog-timeline",
		() =>
			queryCollection("changelog")
				.select("path", "title", "description", "date", "kind")
				.order("date", "DESC")
				.limit(CHANGELOG_TIMELINE_LIMIT)
				.all(),
		{ default: () => [] },
	),
]);

// A category gets a link once a post uses it, in the order the schema lists them.
const usedCategories = computed(() =>
	BLOG_CATEGORIES.filter((name) => posts.value.some((post) => post.category === name)),
);

const filters = computed(() => [
	{ label: ts("blog.categories.all"), to: { path: route.path }, value: ALL_POSTS },
	...usedCategories.value.map((name) => ({
		label: categoryTabLabels.value[name],
		to: { path: route.path, query: { category: blogCategorySlug(name) } },
		value: blogCategorySlug(name),
	})),
]);

// The page is prerendered without a query, so the HTML always holds every
// post. Reading `?category=` while that HTML hydrates would build another
// list than the one it holds: the address applies once the page is mounted.
const addressApplies = ref(import.meta.client && !nuxtApp.isHydrating);

onMounted(() => {
	addressApplies.value = true;
});

const category = computed(() => {
	const slug = route.query.category;
	return addressApplies.value && filters.value.some((filter) => filter.value === slug)
		? String(slug)
		: ALL_POSTS;
});

const visiblePosts = computed(() =>
	category.value === ALL_POSTS
		? posts.value
		: posts.value.filter((post) => blogCategorySlug(post.category) === category.value),
);

const feeds = computed<DropdownMenuItem[]>(() => [
	{
		external: true,
		icon: "i-lucide-rss",
		label: ts("blog.feed_blog"),
		target: "_blank",
		to: "/blog/rss.xml",
	},
	{
		external: true,
		icon: "i-lucide-rss",
		label: ts("blog.feed_changelog"),
		target: "_blank",
		to: "/changelog/rss.xml",
	},
]);
</script>
