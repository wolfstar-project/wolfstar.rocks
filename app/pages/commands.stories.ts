import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { http, HttpResponse } from "msw/http";
import { delay } from "msw/utils/delay";
import { pageDecorator } from "../../.storybook/decorators";
import { mockCommands } from "../storybook/mocks/fixtures";
import CommandsPage from "./commands.vue";

const meta: Meta<typeof CommandsPage> = {
	component: CommandsPage,
	title: "Pages/Commands",
	decorators: [pageDecorator],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCommands: Story = {};

export const Empty: Story = {
	beforeEach({ msw }) {
		msw.use(http.get(/\/commands$/, () => HttpResponse.json([])));
	},
};

export const Loading: Story = {
	beforeEach({ msw }) {
		// Keep loading stable throughout snapshot capture.
		msw.use(
			http.get(/\/commands$/, async () => {
				await delay("infinite");
				return HttpResponse.json(mockCommands);
			}),
		);
	},
};
