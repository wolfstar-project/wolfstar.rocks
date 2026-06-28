import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { delay, http, HttpResponse } from "msw";
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
			// Keep the request pending indefinitely so the loading state stays
			// stable for the snapshot. A fixed timeout (e.g. 60s) would either
			// resolve mid-capture or trip Chromatic's per-story capture timeout.
			handlers: [
				http.get(/\/commands$/, async () => {
					await delay("infinite");
					return HttpResponse.json(mockCommands);
				}),
			],
		},
	},
};
