import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { http, HttpResponse } from "msw";
import { pageDecorator } from "../../.storybook/decorators";
import { mockUser } from "../storybook/mocks/fixtures";
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

export const Authenticated: Story = {};

export const LoggedOut: Story = {
	parameters: {
		msw: {
			handlers: [
				http.get("/api/auth/session", () => HttpResponse.json({ user: null })),
				http.get("/api/users", () =>
					HttpResponse.json({
						user: null,
						guilds: [],
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

export const WithAvatar: Story = {
	parameters: {
		msw: {
			handlers: [
				http.get("/api/auth/session", () =>
					HttpResponse.json({
						user: { ...mockUser, avatar: "1234abcd" },
					}),
				),
				http.get("/api/users", () =>
					HttpResponse.json({
						user: { ...mockUser, avatar: "1234abcd" },
						guilds: [],
					}),
				),
			],
		},
	},
};
