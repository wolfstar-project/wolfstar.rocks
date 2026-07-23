import AppFooter from "~/components/app/Footer.vue";
import AppHeader from "~/components/app/Header.vue";

/**
 * Wraps a page story with the standard site chrome: AppHeader, main content
 * area, and AppFooter. Use this for any full-page story so the layout stays
 * consistent and changes only need to be made in one place.
 */
export const pageDecorator = () => ({
	components: { AppHeader, AppFooter },
	template: `
    <div class="min-h-screen flex flex-col bg-bg text-fg">
      <AppHeader />
      <div id="main-content" class="flex-1 flex flex-col" tabindex="-1">
        <story />
      </div>
      <AppFooter />
    </div>
  `,
});

/**
 * Pins Discord desktop dark chrome tokens so Discord mock components do not
 * inherit the marketing page’s warm/red DaisyUI base surfaces.
 */
export const discordDecorator = () => ({
	template: `
    <div class="discord-story-chrome p-4 font-whitney text-sm">
      <story />
    </div>
  `,
});
