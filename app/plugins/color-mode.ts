import { ThemeColors } from "~/utils/constants";

export default defineNuxtPlugin(() => {
  const colorMode = useColorMode();
  useHead({
    meta: [{
      id: "theme-color",
      name: "theme-color",
      content: () => colorMode.value === "dark" ? ThemeColors.themeDark : ThemeColors.themeLight,
    }],
  });
});
