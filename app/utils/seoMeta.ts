import type { OGImageProps } from "@/components/OgImage/default.vue";

interface SiteMetadata {
  title?: string;
  description?: string;
  ogImage?: string;
  ogSiteName?: string;
  ogType?: "website" | "article" | "profile";
  twitterCard?: "summary" | "summary_large_image";
  twitterSite?: string;
  shouldSeoImage?: boolean;
  seoImage?: OGImageProps;
}

export function useSeoMetadata({
  title,
  description,
  ogImage,
  ogSiteName,
  ogType = "website",
  twitterCard = "summary_large_image",
  twitterSite,
  shouldSeoImage = false,
  seoImage = {},
}: SiteMetadata) {
  const { url, name: siteName } = useSiteConfig();
  const route = useRoute();
  const ogUrl = `${url}${route.fullPath}`;

  useHead({
    titleTemplate: (title) =>
      title
        ? `${title} %separator %siteName`
        : "%siteName: The app for automating your Discord server",
    templateParams: {
      siteName: ogSiteName ?? siteName,
      separator: "·",
    },
    meta: [
      { name: "description", content: description },
    ],
  });

  if (shouldSeoImage) {
    const { title: seoTitle, description: seoDescription, ...seoImageProps } = seoImage;
    defineOgImageComponent("Default", {
      title: seoTitle ?? title,
      description: seoDescription ?? description,
      ...seoImageProps,
    });
  }

  if (import.meta.server) {
    useSeoMeta({
      title,
      titleTemplate: (title) =>
        title
          ? `${title} · ${ogSiteName ?? siteName}`
          : `${ogSiteName ?? siteName}: The app for automating your Discord server`,
      description,
      ogTitle: title,
      ogDescription: description,
      ogImage,
      ogSiteName: ogSiteName ?? siteName,
      ogType,
      ogUrl,
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: ogImage,
      twitterCard,
      twitterSite,
    });
  }
}
