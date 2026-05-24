import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { http, HttpResponse } from "msw";
import { pageDecorator } from "../../.storybook/decorators";
import { mockCommands } from "../storybook/mocks/fixtures";
import CommandsPage from "./commands.vue";

const meta: Meta<typeof CommandsPage> = {
	component: CommandsPage,
	title: "Pages/Commands",
	decorators: [pageDecorator],
	parameters: {
		layout: "fullscreen",
		msw: {
			handlers: [http.get(/\/commands$/, () => HttpResponse.json(mockCommands))],
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCommands: Story = {};

export const Empty: Story = {
	parameters: {
		msw: {
			handlers: [http.get(/\/commands$/, () => HttpResponse.json([]))],
		},
	},
};

export const Loading: Story = {
	parameters: {
		msw: {
			handlers: [
				http.get(/\/commands$/, async () => {
					await new Promise((resolve) => setTimeout(resolve, 60_000));
					return HttpResponse.json(mockCommands);
				}),
			],
		},
	},
};
