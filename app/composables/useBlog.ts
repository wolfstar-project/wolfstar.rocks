import type { BlogArticle } from "#shared/types/blog";

export const useBlog = () => {
	const { data: articles, refresh } = useAsyncData<BlogArticle[]>(
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
		if (!articles.value?.length) {
			return refresh();
		}
	}

	return {
		articles,
		fetchList,
	};
};
