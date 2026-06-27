import type { Meta, StoryObj } from "@storybook-vue/nuxt";

/**
 * The login page immediately redirects to Discord OAuth. It contains no
 * visible UI — only sr-only headings. This story documents the page exists
 * and disables Chromatic snapshotting since the redirect fires on mount.
 */
const meta: Meta = {
	title: "Pages/OAuth/Login",
	parameters: {
		layout: "padded",
		chromatic: { disableSnapshot: true },
		docs: {
			description: {
				component:
					"Redirect-only page. On mount, the `login` middleware initiates the Discord OAuth flow. " +
					"There is no visible UI — only screen-reader headings. " +
					"This story exists to document the page in the design system.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => ({
		template: `
			<div class="container mx-auto px-4 py-8">
				<p class="text-muted text-sm italic">
					This page has no visible UI. It redirects to Discord OAuth on mount.
				</p>
			</div>
		`,
	}),
};
