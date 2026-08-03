import type { Meta, StoryObj } from "@storybook-vue/nuxt";

/**
 * The login page initiates Discord OAuth on mount and shows a loading status
 * panel while the browser redirects.
 */
const meta: Meta = {
	title: "Pages/OAuth/Login",
	parameters: {
		layout: "padded",
		chromatic: { disableSnapshot: true },
		docs: {
			description: {
				component:
					"On mount, the page initiates the Discord OAuth flow via Better Auth. " +
					"While redirecting, it shows a centered loading status panel.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => ({
		template: `
			<div>
				<h1 class="sr-only">Login</h1>
				<OauthStatusPanel
					tone="info"
					loading
					title="Redirecting to Discord"
					icon="ph:discord-logo-fill"
				>
					<template #description>
						Opening Discord so you can authorize WolfStar...
					</template>
				</OauthStatusPanel>
			</div>
		`,
	}),
};
