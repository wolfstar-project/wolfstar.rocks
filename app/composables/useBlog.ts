import type { BadgeProps } from "@nuxt/ui";

/** The published posts, newest first, without their bodies. */
export function useBlog() {
	return useAsyncData<BlogPostSummary[]>(
		"blog-posts",
		() =>
			queryCollection("blog")
				.where("draft", "=", false)
				.select(
					"path",
					"title",
					"description",
					"date",
					"image",
					"category",
					"authors",
					"readingTime",
				)
				.order("date", "DESC")
				.all()
				.then((posts) =>
					posts.map((post) => ({ ...post, authors: post.authors.map(authorWithName) })),
				),
		{ default: () => [] },
	);
}

/**
 * The build fills an author's name from their GitHub account
 * (`config/blog-authors.ts`), so a name is always stored. The schema still
 * allows a frontmatter without one, which the username stands in for.
 */
function authorWithName<T extends { name?: string; username?: string }>(
	author: T,
): T & { name: string } {
	return { ...author, name: author.name ?? author.username ?? "" };
}

const CHANGELOG_KIND_COLORS = {
	fixed: "warning",
	improved: "info",
	new: "success",
} as const satisfies Record<ChangelogKind, BadgeProps["color"]>;

/**
 * The words the blog and the changelog show for a post's category and an
 * entry's kind. Each key is written out, so `i18n:report` can match it.
 */
export function useBlogLabels() {
	const { ts } = useI18n();

	const categoryLabels = computed<Record<BlogCategory, string>>(() => ({
		Announcement: ts("blog.category.announcement"),
		Article: ts("blog.category.article"),
		Release: ts("blog.category.release"),
		Tutorial: ts("blog.category.tutorial"),
	}));

	const categoryTabLabels = computed<Record<BlogCategory, string>>(() => ({
		Announcement: ts("blog.categories.announcement"),
		Article: ts("blog.categories.article"),
		Release: ts("blog.categories.release"),
		Tutorial: ts("blog.categories.tutorial"),
	}));

	const kindBadges = computed<Record<ChangelogKind, BadgeProps>>(() => ({
		fixed: { color: CHANGELOG_KIND_COLORS.fixed, label: ts("changelog.kind.fixed") },
		improved: { color: CHANGELOG_KIND_COLORS.improved, label: ts("changelog.kind.improved") },
		new: { color: CHANGELOG_KIND_COLORS.new, label: ts("changelog.kind.new") },
	}));

	return { categoryLabels, categoryTabLabels, kindBadges };
}
