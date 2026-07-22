import type { FooterColumn } from "@nuxt/ui";

export const useFooter = () => {
	const { t } = useI18n();

	const columns = computed<FooterColumn[]>(() => [
		{
			children: [
				{
					class: "link-hover",
					label: t("footer.features"),
					to: "/#features",
				},
				{
					class: "link-hover",
					label: t("footer.other_apps"),
					to: "/#apps",
				},
				{
					class: "link-hover",
					label: t("footer.changelog"),
					to: "/changelog",
				},
			],
			label: t("footer.product"),
		},
		{
			children: [
				{
					class: "link-hover",
					label: t("footer.support_server"),
					to: "https://join.wolfstar.rocks",
				},
				{
					class: "link-hover",
					label: t("footer.github"),
					to: "https://repo.wolfstar.rocks",
				},
				{
					class: "link-hover",
					label: t("footer.blog"),
					to: "/blog",
				},
				{
					class: "link-hover",
					label: t("translation_status.title"),
					to: "/translation-status",
				},
			],
			label: t("footer.community"),
		},
		{
			children: [
				{
					class: "link-hover",
					label: t("footer.terms"),
					to: "/terms",
				},
				{
					class: "link-hover",
					label: t("footer.privacy"),
					to: "/privacy",
				},
			],
			label: t("footer.legal"),
		},
	]);

	return { columns };
};
