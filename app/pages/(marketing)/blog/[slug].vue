<template>
	<UContainer v-if="article">
		<article
			class="mx-auto max-w-3xl pt-10 pb-16 sm:pt-16"
			:class="
				showToc &&
				'xl:grid xl:max-w-none xl:grid-cols-[minmax(0,1fr)_minmax(0,48rem)_minmax(13rem,1fr)] xl:gap-x-12'
			"
		>
			<header class="flex flex-col gap-6 pb-8 xl:col-start-2">
				<p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
					<NuxtLink
						:to="{
							path: '/updates',
							query: { category: blogCategorySlug(post.category) },
						}"
						class="font-medium text-primary hover:text-highlighted focus-visible:outline-2 focus-visible:outline-primary"
					>
						{{ categoryTabLabels[post.category] }}
					</NuxtLink>
					<span aria-hidden="true">·</span>
					<time :datetime="post.date">{{
						formatDateByLocale(locale, post.date, "short")
					}}</time>
					<template v-if="post.readingTime">
						<span aria-hidden="true">·</span>
						<span>{{ ts("blog.reading_time", { minutes: post.readingTime }) }}</span>
					</template>
				</p>

				<div class="flex flex-col gap-4">
					<h1
						class="text-3xl font-bold text-balance text-highlighted sm:text-4xl lg:text-5xl"
					>
						{{ post.title }}
					</h1>
					<p class="text-lg text-pretty text-muted sm:text-xl">
						{{ post.description }}
					</p>
				</div>

				<div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
					<div class="flex items-center gap-2.5 text-sm text-muted">
						<!-- The names follow as text, so the pictures add nothing to read out. -->
						<div aria-hidden="true" class="flex">
							<UAvatarGroup size="sm">
								<UAvatar
									v-for="author in post.authors"
									:key="author.name"
									:src="author.avatar?.src"
									:alt="author.name"
								/>
							</UAvatarGroup>
						</div>
						<span>
							<template v-for="(part, index) in authorParts" :key="index">
								<ULink
									v-if="part.author?.to"
									:to="part.author.to"
									class="font-medium text-highlighted hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
									>{{ part.text }}</ULink
								><span
									v-else-if="part.author"
									class="font-medium text-highlighted"
									>{{ part.text }}</span
								><template v-else>{{ part.text }}</template>
							</template>
						</span>
					</div>

					<div class="flex items-center gap-1.5">
						<BlogPageActions />
						<UDropdownMenu :items="shareItems" :content="{ align: 'end' }">
							<UButton
								icon="i-lucide-share"
								:aria-label="ts('blog.share')"
								color="neutral"
								variant="soft"
								size="sm"
								class="pointer-coarse:size-11 pointer-coarse:justify-center"
								:ui="{ leadingIcon: 'size-3.5' }"
							/>
						</UDropdownMenu>
					</div>
				</div>
			</header>

			<aside v-if="showToc" class="hidden xl:col-start-3 xl:row-start-2 xl:block">
				<UContentToc
					:links="tocLinks"
					:title="ts('blog.toc')"
					:aria-label="ts('blog.toc')"
					highlight
					highlight-variant="circuit"
					class="lg:backdrop-blur-none"
				>
					<template v-if="post.readingTime" #bottom>
						<BlogReadingProgress
							:reading-time="post.readingTime"
							:target="articleBody"
						/>
					</template>
				</UContentToc>
			</aside>

			<div ref="articleBody" class="min-w-0 xl:col-start-2 xl:row-start-2">
				<!-- A command with its arguments has no space to break at: let it wrap inside its chip rather than run off a phone's screen. -->
				<ContentRenderer
					v-if="article.body"
					:value="article"
					class="[&_:not(pre)>code]:max-w-full [&_:not(pre)>code]:wrap-anywhere"
				/>

				<div v-if="editUrl" class="mt-16 border-t border-default pt-6">
					<UButton
						:to="editUrl"
						target="_blank"
						icon="i-lucide-pen"
						:label="ts('blog.edit_article')"
						color="neutral"
						variant="link"
						class="px-0 pointer-coarse:min-h-11"
					/>
				</div>
			</div>
		</article>

		<section
			v-if="surround?.some(Boolean)"
			aria-labelledby="releases-heading"
			class="flex flex-col gap-6 border-t border-default pt-12 pb-24"
		>
			<h2 id="releases-heading" class="text-2xl font-semibold text-highlighted">
				{{ ts("blog.release_history") }}
			</h2>
			<UContentSurround :surround="surround ?? undefined" />
		</section>
	</UContainer>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { kebabCase } from "scule";

const { ts } = useI18n();
const { locale } = useAppLocale();
const { categoryTabLabels } = useBlogLabels();
const route = useRoute();
const site = useSiteConfig();
const { copy } = useClipboard();

const { data: article } = await useAsyncData(kebabCase(route.path), () =>
	queryCollection("blog").path(route.path).first(),
);

// A draft is for whoever writes it: `pnpm dev` shows it, a deployed site does not.
if (!article.value || (article.value.draft && !import.meta.dev)) {
	throw createError({ statusCode: 404, statusMessage: "Article not found", fatal: true });
}

const post = article.value as BlogArticle;

// Releases follow one another, so a release links to the one before and after
// it. Other posts stand alone.
const { data: surround } = await useAsyncData(`${kebabCase(route.path)}-surround`, async () =>
	post.category === "Release"
		? queryCollectionItemSurroundings("blog", route.path, { fields: ["description"] })
				.where("draft", "=", false)
				.where("category", "=", "Release")
				.order("date", "DESC")
		: null,
);

const articleBody = useTemplateRef<HTMLElement>("articleBody");
const url = `${site.url}${post.path}`;

const tocLinks = computed(() => post.body?.toc?.links ?? []);
const showToc = computed(() => tocLinks.value.length > 1);

/** The authors as a sentence in the reader's language: "Ada, Grace and Linus". */
const authorParts = computed(() => {
	let next = 0;
	return new Intl.ListFormat(locale.value, { style: "long", type: "conjunction" })
		.formatToParts(post.authors.map((author) => author.name))
		.map((part) => ({
			author: part.type === "element" ? post.authors[next++] : undefined,
			text: part.value,
		}));
});

useSeoMeta({
	titleTemplate: "%s · WolfStar Blog",
	title: post.title,
	description: post.description,
	ogDescription: post.description,
	ogTitle: `${post.title} · WolfStar Blog`,
	ogType: "article",
	ogUrl: url,
	...(post.image ? { ogImage: `${site.url}${post.image}` } : {}),
});

if (!post.image) {
	defineOgImage("BlogPost", {
		title: post.title,
		description: post.description,
		date: post.date,
		authors: post.authors.map((author) => ({
			name: author.name,
			avatar: author.avatar?.src,
		})),
	});
}

if (import.meta.server) {
	useSchemaOrg([
		defineArticle({
			"@type": "BlogPosting",
			"author": post.authors.map((author) => ({ name: author.name, url: author.to })),
			"datePublished": post.date,
			"description": post.description,
			"headline": post.title,
			"image": post.image,
		}),
	]);
}

function copyLink() {
	void copy(url, {
		title: ts("blog.link_copied"),
		icon: "i-lucide-copy-check",
	});
}

const shareItems = computed<DropdownMenuItem[]>(() => {
	const handle = post.authors[0]?.twitter;
	const text = `${post.title}${handle ? ` by @${handle}` : ""}\n\n${url}`;

	return [
		{ icon: "i-lucide-link", label: ts("blog.copy_url"), onSelect: copyLink },
		{
			icon: "i-simple-icons-linkedin",
			label: "LinkedIn",
			target: "_blank",
			to: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
		},
		{
			icon: "i-simple-icons-bluesky",
			label: "Bluesky",
			target: "_blank",
			to: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${post.title}

${url}`)}`,
		},
		{
			icon: "i-simple-icons-x",
			label: "X",
			target: "_blank",
			to: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`,
		},
	];
});

const editUrl = computed(() =>
	post.stem
		? `https://github.com/wolfstar-project/wolfstar.rocks/edit/main/content/${post.stem}.md`
		: undefined,
);
</script>
