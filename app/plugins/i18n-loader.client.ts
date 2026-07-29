import { isAppLocaleCode } from "~/utils/is-app-locale";

export default defineNuxtPlugin({
	enforce: "post",
	env: { islands: false },
	setup() {
		const { $i18n } = useNuxtApp();
		const { locale, setLocale } = $i18n;
		const { preferredLocale } = usePreferredLocale();
		const storedLocale = preferredLocale.value;

		if (storedLocale && isAppLocaleCode(storedLocale) && storedLocale !== locale.value) {
			void setLocale(storedLocale);
		}
	},
});
