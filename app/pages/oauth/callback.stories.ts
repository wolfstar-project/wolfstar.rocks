import type { Meta, StoryObj } from "@storybook-vue/nuxt";

/**
 * The callback page hydrates the OAuth session and redirects immediately.
 * Stories use inline render functions to display each visual state statically,
 * without mounting the full page and triggering navigation.
 */
const meta: Meta = {
	title: "Pages/OAuth/Callback",
	parameters: {
		layout: "padded",
		chromatic: { disableSnapshot: true },
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NoCode: Story = {
	render: () => ({
		template: `
			<div>
				<h1 class="sr-only">OAuth Callback</h1>
				<OauthStatusPanel
					tone="warning"
					title="Login Required"
					icon="heroicons:exclamation-triangle"
				>
					<template #description>
						This page can't be accessed directly. Please
						<StarLink to="/login" class="font-medium underline">sign in</StarLink>
						to continue.
					</template>
					<template #actions>
						<StarButton color="primary" to="/login" size="sm" class="w-full sm:w-auto">
							Go to Login
						</StarButton>
					</template>
				</OauthStatusPanel>
			</div>
		`,
	}),
};

export const SigningIn: Story = {
	render: () => ({
		template: `
			<div>
				<OauthStatusPanel
					tone="info"
					loading
					title="Signing You In"
					icon="ph:discord-logo-fill"
				>
					<template #description>Connecting to Discord...</template>
				</OauthStatusPanel>
			</div>
		`,
	}),
};

export const SignInError: Story = {
	render: () => ({
		template: `
			<div>
				<OauthStatusPanel
					tone="error"
					title="Sign-In Failed"
					icon="heroicons:x-circle"
				>
					<template #description>
						The authorization code was invalid or expired. Please try signing in again.
					</template>
					<template #actions>
						<StarButton color="primary" to="/login" size="sm" class="w-full sm:w-auto">
							Try Again
						</StarButton>
					</template>
				</OauthStatusPanel>
			</div>
		`,
	}),
};

export const SessionNotFound: Story = {
	render: () => ({
		template: `
			<div>
				<OauthStatusPanel
					tone="error"
					title="Session Not Found"
					icon="heroicons:x-circle"
				>
					<template #description>
						Your login session could not be loaded. Please sign in again.
					</template>
					<template #actions>
						<StarButton color="primary" to="/login" size="sm" class="w-full sm:w-auto">
							Try Again
						</StarButton>
					</template>
				</OauthStatusPanel>
			</div>
		`,
	}),
};

export const SignInSuccess: Story = {
	render: () => ({
		template: `
			<div>
				<OauthStatusPanel
					tone="success"
					title="Welcome redstar!"
					icon="heroicons:check-circle"
				>
					<template #description>Redirecting you to the dashboard...</template>
				</OauthStatusPanel>
			</div>
		`,
	}),
};
