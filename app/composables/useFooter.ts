import type { FooterColumn } from "@nuxt/ui";

export const useFooter = () => {
	const { ts } = useI18n();

	const columns = computed<FooterColumn[]>(() => [
		{
			children: [
				{
					class: "link-hover",
					label: ts("footer.features"),
					to: "/#features",
				},
				{
					class: "link-hover",
					label: ts("footer.other_apps"),
					to: "/#apps",
				},
				{
					class: "link-hover",
					label: ts("footer.changelog"),
					to: "/changelog",
				},
			],
			label: ts("footer.product"),
		},
		{
			children: [
				{
					class: "link-hover",
					label: ts("footer.support_server"),
					to: "https://join.wolfstar.rocks",
				},
				{
					class: "link-hover",
					label: ts("footer.github"),
					to: "https://repo.wolfstar.rocks",
				},
				{
					class: "link-hover",
					label: ts("footer.blog"),
					to: "/blog",
				},
				{
					class: "link-hover",
					label: ts("translation_status.title"),
					to: "/translation-status",
				},
			],
			label: ts("footer.community"),
		},
		{
			children: [
				{
					class: "link-hover",
					label: ts("footer.terms"),
					to: "/terms",
				},
				{
					class: "link-hover",
					label: ts("footer.privacy"),
					to: "/privacy",
				},
			],
			label: ts("footer.legal"),
		},
	]);

	return { columns };
};
