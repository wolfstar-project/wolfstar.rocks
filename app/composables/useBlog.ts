import type { BlogArticle } from "#shared/types/blog";

export const useBlog = () => {
	const { data: articles, refresh, status } = useAsyncData<BlogArticle[]>(
		"blog",
		async () => {
			return queryCollection("blog")
				.where("draft", "=", false)
				.order("date", "DESC")
				.all()
				.then(
					(items) => items.filter((article) => article.path !== "/blog") as BlogArticle[],
				);
		},
		{ default: () => [] },
	);

	async function fetchList() {
		// Only trigger a fetch when useAsyncData hasn't run yet. Guarding on the
		// result length would re-fetch on every call for a genuinely empty list
		// (all drafts) and double-fetch on first render, since the default is [].
		if (status.value === "idle") {
			return refresh();
		}
	}

	return {
		articles,
		fetchList,
	};
};
