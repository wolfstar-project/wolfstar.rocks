/**
 * The translation calls the words of the Onboarding section are built with,
 * and the open locale's way to join a list ("a, b and c").
 */
export function useOnboardingText(): OnboardingText {
	const { ts, tc } = useI18n();
	const { locale } = useAppLocale();
	return {
		list: (items) =>
			new Intl.ListFormat(locale.value, { style: "long", type: "conjunction" }).format(items),
		tc,
		ts,
	};
}
