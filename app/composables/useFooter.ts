import type { FooterColumn } from "@nuxt/ui";

export const useFooter = () => {
  const columns = computed<FooterColumn[]>(() => [
    {
      label: "Links",
      children: [
        { label: "Support Server", to: "https://join.wolfstar.rocks", icon: "ph:discord-logo-duotone", class: "link-hover", ui: { linkLeadingIcon: "bg-indigo-500" } },
        { label: "GitHub", to: "https://github.com/wolfstar-project", icon: "ph:github-logo-duotone", class: "link-hover", ui: { linkLeadingIcon: "bg-indigo-500" } },
        { label: "Blog", to: "https://blog.wolfstar.rocks", icon: "ph:newspaper-clipping-duotone", class: "link-hover", ui: { linkLeadingIcon: "bg-primary" } },
      ],
    },
    {
      label: "Donate",
      children: [
        { label: "Patreon", to: "https://donate.wolfstar.rocks/patreon", icon: "ph:patreon-logo-duotone", class: "link-hover", ui: { linkLeadingIcon: "bg-rose-600" } },
        { label: "PayPal", to: "https://donate.wolfstar.rocks/paypal", icon: "ph:paypal-logo-duotone", class: "link-hover", ui: { linkLeadingIcon: "bg-sky-600" } },
        { label: "Ko-fi", to: "https://donate.wolfstar.rocks/ko-fi", icon: "ph:coffee-duotone", class: "link-hover", ui: { linkLeadingIcon: "bg-pink-500" } },
      ],
    },
    {
      label: "Legal",
      children: [
        { label: "Terms of Use", to: "/terms", icon: "ph:file-text-fill", class: "link-hover", ui: { linkLeadingIcon: "bg-warning" } },
        { label: "Privacy Policy", to: "/privacy", icon: "ph:shield-check-fill", class: "link-hover", ui: { linkLeadingIcon: "bg-warning" } },
      ],
    },
  ]);

  return { columns };
};
