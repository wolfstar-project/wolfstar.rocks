import type { FooterColumn } from "@nuxt/ui";

export const useFooter = () => {
	const columns = computed<FooterColumn[]>(() => [
		{
			children: [
				{
					class: "link-hover",
					icon: "ph:discord-logo-duotone",
					label: "Support Server",
					to: "https://chat.wolfstar.rocks",
					ui: { linkLeadingIcon: "bg-indigo-500" },
				},
				{
					class: "link-hover",
					icon: "ph:twitter-logo-duotone",
					label: "Twitter",
					to: "https://social.wolfstar.rocks/twitter",
					ui: { linkLeadingIcon: "bg-sky-400" },
				},
				{
					class: "link-hover",
					icon: "ph:github-logo-duotone",
					label: "GitHub",
					to: "https://repo.wolfstar.rocks",
					ui: { linkLeadingIcon: "bg-indigo-500" },
				},
				{
					class: "link-hover",
					icon: "ph:newspaper-clipping-duotone",
					label: "Blog",
					to: "https://blog.wolfstar.rocks",
					ui: { linkLeadingIcon: "bg-primary" },
				},
			],
			label: "Links",
		},
		{
			children: [
				{
					class: "link-hover",
					icon: "ph:patreon-logo-duotone",
					label: "Patreon",
					to: "https://donate.wolfstar.rocks/patreon",
					ui: { linkLeadingIcon: "bg-rose-600" },
				},
				{
					class: "link-hover",
					icon: "ph:paypal-logo-duotone",
					label: "PayPal",
					to: "https://donate.wolfstar.rocks/paypal",
					ui: { linkLeadingIcon: "bg-sky-600" },
				},
				{
					class: "link-hover",
					icon: "ph:coffee-duotone",
					label: "Ko-fi",
					to: "https://donate.wolfstar.rocks/ko-fi",
					ui: { linkLeadingIcon: "bg-pink-500" },
				},
			],
			label: "Donate",
		},
		{
			children: [
				{
					class: "link-hover",
					icon: "ph:file-text-fill",
					label: "Terms of Use",
					to: "/terms",
					ui: { linkLeadingIcon: "bg-warning" },
				},
				{
					class: "link-hover",
					icon: "ph:shield-check-fill",
					label: "Privacy Policy",
					to: "/privacy",
					ui: { linkLeadingIcon: "bg-warning" },
				},
			],
			label: "Legal",
		},
	]);

	return { columns };
};
