import type { FooterColumn } from "@nuxt/ui";

export const useFooter = () => {
	const columns = computed<FooterColumn[]>(() => [
		{
			children: [
				{
					class: "link-hover",
					label: "Features",
					to: "/#features",
				},
				{
					class: "link-hover",
					label: "Other Apps",
					to: "/#apps",
				},
				{
					class: "link-hover",
					label: "Changelog",
					to: "https://github.com/wolfstar-project/wolfstar.rocks/releases",
				},
			],
			label: "Product",
		},
		{
			children: [
				{
					class: "link-hover",
					label: "Support Server",
					to: "https://join.wolfstar.rocks",
				},
				{
					class: "link-hover",
					label: "GitHub",
					to: "https://repo.wolfstar.rocks",
				},
				{
					class: "link-hover",
					label: "Blog",
					to: "/blog",
				},
			],
			label: "Community",
		},
		{
			children: [
				{
					class: "link-hover",
					label: "Terms of Use",
					to: "/terms",
				},
				{
					class: "link-hover",
					label: "Privacy Policy",
					to: "/privacy",
				},
			],
			label: "Legal",
		},
	]);

	return { columns };
};
