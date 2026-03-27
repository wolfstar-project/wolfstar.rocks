<script setup lang="ts">
const { data: page } = await useAsyncData("blog-landing", () => queryCollection("blog").first());
if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}

const { articles, fetchList } = useBlog();

useSeoMeta({
	titleTemplate: "%s",
	title: page.value.title,
	description: page.value.description,
	ogDescription: page.value.description,
	ogTitle: page.value.title,
});
</script>

<template>
	<UContainer v-if="page">
		<UPageHero :title="page.title" :description="page.description" orientation="horizontal">
		</UPageHero>

		<UPageBody>
			<UContainer>
				<UBlogPosts class="mb-12 md:grid-cols-2 lg:grid-cols-3">
					<h2 class="sr-only">Post</h2>
					<UBlogPost
						v-for="(article, index) in articles"
						:key="article.path"
						:to="article.path"
						:title="article.title"
						:description="article.description"
						:image="
							article.image
								? {
										src: article.image.src,
										alt: article.image.alt,
										width: index === 0 ? 672 : 437,
										height: index === 0 ? 378 : 246,
									}
								: undefined
						"
						:date="
							new Date(article.date).toLocaleDateString('en', {
								year: 'numeric',
								month: 'short',
								day: 'numeric',
							})
						"
						:authors="
							article.authors.map((author) => ({
								...author,
								avatar: author.avatar
									? {
											...author.avatar,
											alt: author.avatar.alt || `${author.name} avatar`,
										}
									: undefined,
							}))
						"
						:badge="article.badge"
						:variant="index === 0 ? 'outline' : 'subtle'"
						:orientation="index === 0 ? 'horizontal' : 'vertical'"
						:class="[index === 0 && 'col-span-full']"
					/>
				</UBlogPosts>
			</UContainer>
		</UPageBody>
	</UContainer>
</template>
