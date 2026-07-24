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
			<div class="container mx-auto px-4 py-8">
				<h1 class="sr-only">OAuth Callback</h1>
				<UAlert
					variant="solid"
					color="warning"
					title="Login Required"
					icon="twemoji:warning"
				>
					<template #description>
						This page can't be accessed directly. Please
						<ULink to="/login" class="font-medium underline">sign in</ULink>
						to continue.
					</template>
					<template #actions>
						<UButton color="neutral" variant="ghost" to="/login" size="sm">
							Go to Login
						</UButton>
					</template>
				</UAlert>
			</div>
		`,
	}),
};

export const SigningIn: Story = {
	render: () => ({
		template: `
			<div class="container mx-auto px-4 py-8">
				<UAlert color="info" icon="emojione:hourglass-done" title="Signing You In">
					<template #description>Connecting to Discord...</template>
				</UAlert>
			</div>
		`,
	}),
};

export const SignInError: Story = {
	render: () => ({
		template: `
			<div class="container mx-auto px-4 py-8">
				<UAlert color="error" title="Sign-In Failed" icon="twemoji:cross-mark">
					<template #description>The authorization code was invalid or expired. Please try signing in again.</template>
					<template #actions>
						<UButton color="neutral" variant="ghost" to="/login" size="sm">
							Try Again
						</UButton>
					</template>
				</UAlert>
			</div>
		`,
	}),
};

export const SessionNotFound: Story = {
	render: () => ({
		template: `
			<div class="container mx-auto px-4 py-8">
				<UAlert color="error" title="Session Not Found" icon="twemoji:cross-mark">
					<template #description>
						Your login session could not be loaded. Please sign in again.
					</template>
					<template #actions>
						<UButton color="neutral" variant="ghost" to="/login" size="sm">
							Try Again
						</UButton>
					</template>
				</UAlert>
			</div>
		`,
	}),
};

export const SignInSuccess: Story = {
	render: () => ({
		template: `
			<div class="container mx-auto px-4 py-8">
				<UAlert color="success" icon="twemoji:check-mark" title="Welcome redstar!">
					<template #description>Redirecting you to the dashboard...</template>
				</UAlert>
			</div>
		`,
	}),
};
