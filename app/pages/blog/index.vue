<script setup lang="ts">
const { data: posts } = await useAsyncData("blog-posts", () =>
	queryCollection("blog").order("date", "DESC").all(),
);

useSeoMeta({
	title: "Blog",
	ogTitle: "Blog - WolfStar",
	description: "Latest news, updates, and announcements from the WolfStar Project.",
	ogDescription: "Latest news, updates, and announcements from the WolfStar Project.",
});
</script>

<template>
	<UContainer>
		<UPageHeader
			title="Blog"
			description="Latest news, updates, and announcements from the WolfStar Project."
			class="py-12"
		/>

		<UPageBody>
			<h2 class="sr-only">Posts</h2>
			<UBlogPosts v-if="posts?.length">
				<UBlogPost
					v-for="(post, index) in posts"
					:key="post.path"
					:to="post.path"
					:title="post.title"
					:description="post.description"
					:image="post.image"
					:date="
						new Date(post.date).toLocaleDateString('en', {
							year: 'numeric',
							month: 'short',
							day: 'numeric',
						})
					"
					:authors="post.authors"
					:badge="post.badge"
					:orientation="index === 0 ? 'horizontal' : 'vertical'"
					:class="[index === 0 && 'col-span-full']"
					variant="naked"
					:ui="{ description: 'line-clamp-2' }"
				/>
			</UBlogPosts>

			<div v-else class="py-12 text-center">
				<p class="text-muted">No blog posts yet. Check back soon!</p>
			</div>
		</UPageBody>
	</UContainer>
</template>
