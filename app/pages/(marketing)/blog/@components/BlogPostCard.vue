<template>
	<UBlogPost
		:to="post.path"
		:title="post.title"
		:image="image"
		variant="naked"
		:ui="{ header: 'shadow-none ring ring-default', body: 'p-0 pt-4 sm:p-0 sm:pt-4' }"
	>
		<template #body>
			<p class="mb-1.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
				<span>{{ categoryLabels[post.category] }}</span>
				<span aria-hidden="true">·</span>
				<time :datetime="post.date">{{
					formatDateByLocale(locale, post.date, "short")
				}}</time>
				<template v-if="post.readingTime">
					<span aria-hidden="true">·</span>
					<span>{{ ts("blog.reading_time", { minutes: post.readingTime }) }}</span>
				</template>
			</p>
			<h3 class="text-lg font-semibold text-pretty text-highlighted">{{ post.title }}</h3>
			<p class="mt-1 line-clamp-2 text-base text-pretty text-muted">
				{{ post.description }}
			</p>
		</template>
	</UBlogPost>
</template>

<script setup lang="ts">
const { post, eager = false } = defineProps<{
	post: BlogPostSummary;
	/** Load the cover with the page: for the cards above the fold. */
	eager?: boolean;
}>();

const { ts } = useI18n();
const { locale } = useAppLocale();
const { categoryLabels } = useBlogLabels();

// The cover repeats the title printed under it, and the card's link is named
// by that title, so the image says nothing more to a screen reader.
const image = computed(() =>
	post.image
		? {
				alt: "",
				height: 360,
				loading: eager ? ("eager" as const) : ("lazy" as const),
				src: post.image,
				width: 640,
			}
		: undefined,
);
</script>
