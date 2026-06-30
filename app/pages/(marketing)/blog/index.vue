<template>
	<UPage>
		<UPageHero title="Blog" description="News and updates from the WolfStar Project." />
		<UPageBody>
			<UBlogPosts>
				<UBlogPost
					v-for="post in posts"
					:key="post.path"
					:title="post.title"
					:description="post.description"
					:date="post.date"
					:authors="[{ name: post.author }]"
					:to="post.path"
				/>
			</UBlogPosts>
		</UPageBody>
	</UPage>
</template>

<script setup lang="ts">
useSeoMeta({ title: "Blog", description: "News and updates from the WolfStar Project." });

const { data: posts } = await useAsyncData("blog-posts", () =>
	queryCollection("blog").where("draft", "=", false).order("date", "DESC").all(),
);
</script>
