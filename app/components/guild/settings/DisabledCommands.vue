<template>
	<div>
		<GuildSettingsSection
			title="Commands"
			description="Choose which commands to enable or disable on your server"
		>
			<!-- Unified Form wrapper to match skeleton and content -->
			<div v-if="loading" class="space-y-4">
				<div v-for="i in 3" :key="i" class="space-y-2">
					<!-- Simulated accordion trigger skeleton -->
					<USkeleton class="h-12 w-full" />

					<!-- Commands grid skeleton -->
					<div
						class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
					>
						<div
							v-for="j in 8"
							:key="j"
							class="flex items-center justify-between rounded-lg border border-base-200 p-3"
						>
							<div class="flex-1 space-y-2">
								<USkeleton class="h-5 w-32" />
								<USkeleton class="h-4 w-48" />
							</div>
							<USkeleton class="h-6 w-11 rounded-full" />
						</div>
					</div>
				</div>
			</div>

			<GuildSettingsForm
				v-else
				:state="state"
				:schema="disabledCommandsSchema"
				:map-to-guild-data="mapToGuildData"
				class="space-y-4"
				aria-label="Disabled commands settings form"
				:aria-busy="loading"
				:aria-disabled="loading"
				@error="onError"
			>
				<div class="space-y-4">
					<UCollapsible
						v-for="category in categories"
						:key="category"
						:open="isCategoryOpen(category)"
						:unmount-on-hide="false"
						@update:open="() => toggleCategory(category)"
					>
						<template #default="{ open }">
							<UButton
								color="neutral"
								variant="ghost"
								class="w-full justify-between border-b border-base-200"
							>
								<span class="truncate text-xl font-medium">{{ category }}</span>

								<template #trailing>
									<UIcon
										name="i-heroicons-chevron-down-20-solid"
										class="ms-auto size-5 transform transition-transform duration-200"
										:class="[open && 'rotate-180']"
									/>
								</template>
							</UButton>
						</template>

						<template #content>
							<div
								class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
							>
								<div
									v-for="command in getCommandsByCategory(category)"
									:key="command.name"
									class="flex items-center justify-between rounded-lg border border-base-200 p-3"
								>
									<div class="min-w-0 flex-1">
										<p class="truncate font-medium text-base-content">
											{{ command.name }}
										</p>
										<p class="truncate text-sm text-base-content/60">
											{{ command.description }}
										</p>
									</div>
									<USwitch
										v-if="!isNullOrUndefined(getCommand(command.name))"
										:model-value="getCommand(command.name)?.isEnabled"
										:value="getCommand(command.name)?.name"
										:default-value="true"
										@update:model-value="
											(isEnabled) => toggleCommand(command.name, isEnabled)
										"
									/>
								</div>
							</div>

							<Separator />
							<div class="flex flex-wrap items-center justify-end gap-2 p-4">
								<UButton
									color="success"
									variant="solid"
									size="sm"
									@click="toggleAllInCategory(category, true)"
								>
									Enable all
								</UButton>
								<UButton
									color="warning"
									variant="solid"
									size="sm"
									@click="toggleAllInCategory(category, false)"
								>
									Disable all
								</UButton>
								<UButton
									color="neutral"
									variant="outline"
									size="sm"
									@click="resetCategory(category)"
								>
									Reset
								</UButton>
							</div>
						</template>
					</UCollapsible>
				</div>
			</GuildSettingsForm>
		</GuildSettingsSection>
	</div>
</template>

<script setup lang="ts">
import type { GuildData } from "#server/database";
import type { DisableCommands, FlattenedCommand } from "#shared/types";
import type { FormErrorEvent } from "@nuxt/ui";
import type * as v from "valibot";
// oxlint-disable-next-line typescript/consistent-type-imports
import { disabledCommandsSchema } from "#shared/schemas";
import { isNullOrUndefined } from "@sapphire/utilities/isNullOrUndefined";

const { commands } = defineProps<{
	commands: FlattenedCommand[];
}>();


type Schema = v.InferOutput<typeof disabledCommandsSchema>;


const toast = useToast();
const { guildSettings } = useGuildSettings();


const expandedCategory = ref<string | undefined>(undefined);


const state = reactive<Schema>(
	createDefaultState(commands, guildSettings.value?.disabledCommands as string[]),
);


// Loading state
const loading = computed(() => !commands.length || !guildSettings.value);


const categories = computed(() => {
	const uniqueCategories = new Set<string>();
	for (const command of commands) {
		if (!command.guarded) {
			uniqueCategories.add(command.category || "General");
		}
	}
	return [...uniqueCategories].toSorted();
});


// Helper to create default state from commands and settings
function createDefaultState(
	cmdList: FlattenedCommand[],
	disabledCommands: string[] | undefined,
): Schema {
	const result: Record<string, DisableCommands.Command> = {};


	for (const command of cmdList) {
		if (command.guarded) {
			continue;
		}


		result[command.name] = {
			category: command.category || "General",
			description: command.description,
			isEnabled: !disabledCommands?.includes(command.name),
			name: command.name,
		};
	}


	return result;
}


function mapToGuildData(formState: Schema): Partial<GuildData> {
	const disabledCommands: string[] = [];


	for (const key in formState) {
		const cmd = formState[key];
		if (cmd && !cmd.isEnabled) {
			disabledCommands.push(cmd.name);
		}
	}


	return { disabledCommands };
}


function toggleCommand(name: string, isEnabled: boolean) {
	const cmd = state[name];
	if (cmd) {
		state[name] = { ...cmd, isEnabled };
	}
}


function getCommand(name: string): DisableCommands.Command | undefined {
	const cmd = state[name];
	return cmd ? { ...cmd } : undefined;
}


function getCommandsByCategory(category: string): FlattenedCommand[] {
	return commands.filter((cmd) => (cmd.category || "General") === category && !cmd.guarded);
}


function toggleAllInCategory(category: string, enable: boolean) {
	const commands = getCommandsByCategory(category);
	for (const command of commands) {
		toggleCommand(command.name, enable);
	}
}


function isCategoryOpen(category: string): boolean {
	return expandedCategory.value === category;
}


function toggleCategory(category: string): void {
	expandedCategory.value = isCategoryOpen(category) ? undefined : category;
}


function resetCategory(category: string) {
	const commands = getCommandsByCategory(category);
	for (const command of commands) {
		toggleCommand(command.name, !guildSettings.value?.disabledCommands?.includes(command.name));
	}


	toast.add({
		color: "info",
		description: `${category} commands reverted to saved values.`,
		icon: "i-heroicons-arrow-path",
		title: "Category Reset",
	});
}


async function onError(event: FormErrorEvent) {
	const element =
		event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({ behavior: "smooth", block: "center" });
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: `Could not save command settings. ${errorMessage ?? "Please try again."}`,
		icon: "heroicons:x-circle",
		title: "Save Failed",
	});
}


// Watch for loading state change to hydrate local state (immediate mode)
watch(
	loading,
	(isLoading) => {
		if (!isLoading && guildSettings.value) {
			const newValues = createDefaultState(
				commands,
				guildSettings.value.disabledCommands as string[],
			);

			// Remove stale keys not in new values
			for (const key in state) {
				if (!(key in newValues)) {
					delete state[key];
				}
			}

			// Assign new values
			Object.assign(state, newValues);
		}
	},
	{ immediate: true },
);
</script>
