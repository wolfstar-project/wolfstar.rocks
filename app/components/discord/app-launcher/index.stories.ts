import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { ref } from "vue";
import { discordDecorator } from "../../../../.storybook/decorators";
import DiscordAppLauncher from "./index.vue";

const meta = {
	component: DiscordAppLauncher,
	title: "Components/Discord/AppLauncher",
	decorators: [discordDecorator],
	args: {
		open: true,
	},
} satisfies Meta<typeof DiscordAppLauncher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
	render: (args) => ({
		components: { DiscordAppLauncher },
		setup: () => {
			const open = ref(args.open ?? true);
			return { args, open };
		},
		template: `
			<div class="flex min-h-[46rem] items-end justify-center bg-[oklch(26.65%_0.006_272.93)] p-6">
				<div class="w-full max-w-[31.5rem]">
					<DiscordAppLauncher v-bind="args" v-model:open="open" />
				</div>
			</div>
		`,
	}),
};

export const MobileSheet: Story = {
	parameters: {
		viewport: { defaultViewport: "mobile1" },
	},
	args: {
		initialSheetSnap: "half",
	},
	render: (args) => ({
		components: { DiscordAppLauncher },
		setup: () => {
			const open = ref(args.open ?? true);
			return { args, open };
		},
		template: `
			<div class="flex min-h-[100dvh] items-end justify-center bg-[oklch(26.65%_0.006_272.93)]">
				<div class="w-full max-w-[24rem]">
					<DiscordAppLauncher v-bind="args" v-model:open="open" />
				</div>
			</div>
		`,
	}),
};

export const MobileSheetFull: Story = {
	parameters: {
		viewport: { defaultViewport: "mobile1" },
	},
	args: {
		initialSheetSnap: "full",
	},
	render: (args) => ({
		components: { DiscordAppLauncher },
		setup: () => {
			const open = ref(args.open ?? true);
			return { args, open };
		},
		template: `
			<div class="flex min-h-[100dvh] items-end justify-center bg-[oklch(26.65%_0.006_272.93)]">
				<div class="w-full max-w-[24rem]">
					<DiscordAppLauncher v-bind="args" v-model:open="open" />
				</div>
			</div>
		`,
	}),
};

export const Closed: Story = {
	args: {
		open: false,
	},
	render: (args) => ({
		components: { DiscordAppLauncher },
		setup: () => {
			const open = ref(false);
			return { args, open };
		},
		template: `
			<div class="flex min-h-[12rem] flex-col items-center justify-center gap-3 bg-[oklch(26.65%_0.006_272.93)] p-6">
				<button
					type="button"
					class="rounded bg-[oklch(57.74%_0.2091_273.85)] px-3 py-2 text-sm text-white"
					@click="open = true"
				>
					Open Apps
				</button>
				<DiscordAppLauncher v-bind="args" v-model:open="open" />
			</div>
		`,
	}),
};
