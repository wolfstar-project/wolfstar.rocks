import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { http, HttpResponse } from "msw";
import { pageDecorator } from "../../.storybook/decorators";
import { mockGuildList, mockUser } from "../storybook/mocks/fixtures";
import ProfilePage from "./profile.vue";

const meta: Meta<typeof ProfilePage> = {
	component: ProfilePage,
	title: "Pages/Profile",
	decorators: [pageDecorator],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Authenticated: Story = {
	parameters: {
		msw: {
			handlers: [
				http.get("/api/auth/session", () =>
					HttpResponse.json({
						user: mockUser,
					}),
				),
				http.get("/api/users", () =>
					HttpResponse.json({
						user: mockUser,
						guilds: mockGuildList,
						transformedGuilds: mockGuildList,
					}),
				),
			],
		},
	},
};

export const ErrorInternal: Story = {
	parameters: {
		msw: {
			handlers: [
				http.get("/api/auth/session", () => HttpResponse.json({ user: null })),
				http.get("/api/users", () =>
					HttpResponse.json({ error: "Internal Server Error" }, { status: 500 }),
				),
			],
		},
		docs: {
			description: {
				story: "Profile page when the session fetch fails — shows error message.",
			},
		},
	},
};

export const LoggedOut: Story = {
	parameters: {
		msw: {
			handlers: [
				http.get("/api/auth/session", () => HttpResponse.json({ user: null })),
				http.get("/api/users", () =>
					HttpResponse.json({
						user: null,
						guilds: [],
						transformedGuilds: [],
					}),
				),
			],
		},
		docs: {
			description: {
				story: "Profile page when no session is active — shows skeleton placeholder.",
			},
		},
	},
};
