export default defineNuxtPlugin({
	enforce: "post",
	env: { islands: false },
	setup() {
		const { $i18n } = useNuxtApp();
		const { locale, locales, setLocale } = $i18n;
		const { preferredLocale } = usePreferredLocale();
		const storedLocale = preferredLocale.value;

		if (
			storedLocale &&
			locales.value.map((l) => l.code).includes(storedLocale) &&
			storedLocale !== locale.value
		) {
			void setLocale(storedLocale);
		}
	},
});
