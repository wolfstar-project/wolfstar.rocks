import type { ResolvableValue } from "@unhead/vue";
import type { OGImageProps } from "~/components/OgImage/Page.takumi.vue";

interface SiteMetadata {
	title?: ResolvableValue<string | undefined>;
	description?: ResolvableValue<string | undefined>;
	ogSiteName?: ResolvableValue<string | undefined>;
	ogType?: ResolvableValue<"website" | "article" | "profile" | undefined>;
	twitterCard?: ResolvableValue<"summary" | "summary_large_image" | undefined>;
	twitterSite?: ResolvableValue<string | undefined>;
	shouldOgImage?: boolean;
	ogImage?: OGImageProps;
}

export function useSeoMetadata({
	title,
	description,
	ogImage,
	ogSiteName,
	ogType = "website",
	twitterCard = "summary_large_image",
	twitterSite,
	shouldOgImage = false,
}: SiteMetadata) {
	const { url, name: siteName } = useSiteConfig();
	const route = useRoute();
	const ogUrl = `${url}${route.fullPath}`;

	useHead({
		meta: [{ content: description, name: "description" }],
	});

	if (shouldOgImage) {
		defineOgImage("Page", {
			description: ogImage?.description ?? description,
			title: ogImage?.title ?? title,
			...ogImage,
		});
	}

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
