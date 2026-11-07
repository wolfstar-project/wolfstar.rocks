import { colorThemeVars, customColorTheme, findColorTheme } from "~/utils/color-themes";

/**
 * Puts the picked theme on `<html>`: `data-shade="dark"` for Discord's darker
 * dark theme, and a colour theme's id and CSS variables. The colour theme only
 * paints the dashboard (`.console`); see `assets/css/color-themes.css`.
 */
export function useAppliedTheme() {
	const { settings } = useSettings();

	const shade = computed(() =>
		settings.value.colorMode === "dark" && settings.value.darkShade === "dark"
			? "dark"
			: undefined,
	);

	const colorTheme = computed(() => {
		const id = settings.value.colorTheme;
		if (!id) return null;
		const custom = settings.value.customTheme;
		const theme = id === "custom" && custom ? customColorTheme(custom) : findColorTheme(id);
		if (!theme) return null;
		const vars = colorThemeVars(theme, id === "custom" ? custom?.intensity : undefined);
		return {
			id,
			style: Object.entries(vars)
				.map(([name, value]) => `${name}: ${value}`)
				.join("; "),
		};
	});

	useHead({
		htmlAttrs: {
			"data-color-theme": computed(() => colorTheme.value?.id),
			"data-shade": shade,
			"style": computed(() => colorTheme.value?.style),
		},
	});
}
