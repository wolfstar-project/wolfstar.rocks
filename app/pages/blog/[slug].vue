<script setup lang="ts">
const route = useRoute();

const { data: post } = await useAsyncData(route.path, () =>
	queryCollection("blog").path(route.path).first(),
);

if (!post.value) {
	throw createError({ statusCode: 404, statusMessage: "Post not found", fatal: true });
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () =>
	queryCollectionItemSurroundings("blog", route.path, {
		fields: ["description"],
	}),
);

const title = post.value.seo?.title || post.value.title;
const description = post.value.seo?.description || post.value.description;

useSeoMeta({
	title,
	ogTitle: title,
	description,
	ogDescription: description,
});

if (post.value.image?.src) {
	defineOgImage({ url: post.value.image.src });
}
</script>

<template>
	<UContainer v-if="post">
		<UPageHeader :title="post.title" :description="post.description">
			<template #headline>
				<UBadge v-if="post.badge" v-bind="post.badge" variant="subtle" />
				<span class="text-muted">&middot;</span>
				<time class="text-muted">
					{{
						new Date(post.date).toLocaleDateString("en", {
							year: "numeric",
							month: "short",
							day: "numeric",
						})
					}}
				</time>
			</template>

			<div v-if="post.authors?.length" class="mt-4 flex flex-wrap items-center gap-3">
				<UButton
					v-for="(author, index) in post.authors"
					:key="index"
					:to="author.to"
					color="neutral"
					variant="subtle"
					target="_blank"
					size="sm"
				>
					<UAvatar
						v-if="author.avatar"
						:src="author.avatar.src"
						:alt="author.avatar.alt"
						size="2xs"
					/>
					{{ author.name }}
				</UButton>
			</div>
		</UPageHeader>

		<UPage>
			<UPageBody>
				<ContentRenderer v-if="post" :value="post" />

				<USeparator v-if="surround?.length" />

				<UContentSurround :surround="surround" />
			</UPageBody>

			<template v-if="post?.body?.toc?.links?.length" #right>
				<UContentToc :links="post.body.toc.links" aria-label="Table of contents" />
			</template>
		</UPage>
	</UContainer>
</template>
