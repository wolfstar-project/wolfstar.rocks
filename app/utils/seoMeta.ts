import type { ResolvableValue } from "@unhead/vue";

interface SiteMetadata {
	title?: ResolvableValue<string>;
	description?: ResolvableValue<string>;
	ogSiteName?: string;
	ogType?: "website" | "article" | "profile";
	twitterCard?: "summary" | "summary_large_image";
	twitterSite?: string;
}

export function useSeoMetadata({
	title,
	description,
	ogSiteName,
	ogType = "website",
	twitterCard = "summary_large_image",
	twitterSite,
}: SiteMetadata) {
	const { url, name: siteName } = useSiteConfig();
	const route = useRoute();
	const ogUrl = `${url}${route.fullPath}`;

	useHead({
		meta: [{ content: description, name: "description" }],
	});

	defineOgImage();

	if (import.meta.server) {
		useSeoMeta({
			description,
			ogDescription: description,
			ogSiteName: ogSiteName ?? siteName,
			ogTitle: title,
			ogType,
			ogUrl,
			title,
			twitterCard,
			twitterDescription: description,
			twitterSite,
			twitterTitle: title,
		});
	}
}
