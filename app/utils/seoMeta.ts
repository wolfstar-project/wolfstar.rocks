import type { ResolvableValue } from "@unhead/vue";
import type { OGImageProps } from "@/components/OgImage/Default.vue";

interface SiteMetadata {
  title?: ResolvableValue<string>;
  description?: ResolvableValue<string>;
  ogSiteName?: string;
  ogType?: "website" | "article" | "profile";
  twitterCard?: "summary" | "summary_large_image";
  twitterSite?: string;
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
    meta: [
      { name: "description", content: description },
    ],
  });

  if (shouldOgImage) {
    defineOgImageComponent("Default", {
      title: ogImage?.title ?? title,
      description: ogImage?.description ?? description,
      ...ogImage,
    });
  }

  if (import.meta.server) {
    useSeoMeta({
      title,
      description,
      ogTitle: title,
      ogDescription: description,
      ogSiteName: ogSiteName ?? siteName,
      ogType,
      ogUrl,
      twitterTitle: title,
      twitterDescription: description,
      twitterCard,
      twitterSite,
    });
  }
}
