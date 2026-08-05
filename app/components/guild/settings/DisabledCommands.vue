<template>
	<div>
		<GuildSettingsSection
			:title="t('guild_settings.commands.title')"
			:description="t('guild_settings.commands.subtitle')"
		>
			<!-- Unified Form wrapper to match skeleton and content -->
			<div v-if="loading" class="space-y-4">
				<div v-for="i in 3" :key="i" class="space-y-2">
					<!-- Simulated accordion trigger skeleton -->
					<StarSkeleton class="h-12 w-full" />

					<!-- Commands grid skeleton -->
					<div
						class="gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 grid grid-cols-1"
					>
						<div
							v-for="j in 8"
							:key="j"
							class="rounded-lg border-base-200 p-3 flex items-center justify-between border"
						>
							<div class="space-y-2 flex-1">
								<StarSkeleton class="h-5 w-32" />
								<StarSkeleton class="h-4 w-48" />
							</div>
							<StarSkeleton class="h-6 w-11 rounded-full" />
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
				:aria-label="t('guild_settings.commands.form_aria')"
				:aria-busy="loading"
				:aria-disabled="loading"
				@error="onError"
			>
				<div class="space-y-4">
					<StarCollapsible
						v-for="category in categories"
						:key="category"
						:open="isCategoryOpen(category)"
						:unmount-on-hide="false"
						@update:open="() => toggleCategory(category)"
					>
						<template #default="{ open }">
							<StarButton
								color="neutral"
								variant="ghost"
								class="border-base-200 w-full justify-between border-b"
							>
								<span class="text-xl font-medium truncate">{{ category }}</span>

								<template #trailing>
									<Icon
										name="i-heroicons-chevron-down-20-solid"
										class="size-5 ms-auto transform transition-transform duration-200"
										:class="[open && 'rotate-180']"
									/>
								</template>
							</StarButton>
						</template>

						<template #content>
							<div
								class="gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 grid grid-cols-1"
							>
								<div
									v-for="command in getCommandsByCategory(category)"
									:key="command.name"
									class="rounded-lg border-base-200 p-3 flex items-center justify-between border"
								>
									<div class="min-w-0 flex-1">
										<p class="font-medium text-base-content truncate">
											{{ command.name }}
										</p>
										<p class="text-sm text-base-content/60 truncate">
											{{ command.description }}
										</p>
									</div>
									<StarSwitch
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
							<div class="gap-2 p-4 flex flex-wrap items-center justify-end">
								<StarButton
									color="success"
									variant="solid"
									size="sm"
									@click="toggleAllInCategory(category, true)"
								>
									{{ t("guild_settings.commands.enable_all") }}
								</StarButton>
								<StarButton
									color="warning"
									variant="solid"
									size="sm"
									@click="toggleAllInCategory(category, false)"
								>
									{{ t("guild_settings.commands.disable_all") }}
								</StarButton>
								<StarButton
									color="neutral"
									variant="outline"
									size="sm"
									@click="resetCategory(category)"
								>
									{{ t("guild_settings.commands.reset") }}
								</StarButton>
							</div>
						</template>
					</StarCollapsible>
				</div>
			</GuildSettingsForm>
		</GuildSettingsSection>
	</div>
</template>

<script setup lang="ts">
import type { GuildData } from "#server/database";
import type { DisableCommands } from "#shared/types";
import type { FormErrorEvent } from "#shared/types/ui";
import type * as v from "valibot";
// oxlint-disable-next-line typescript/consistent-type-imports
import { disabledCommandsSchema } from "#shared/schemas";
import { isNullOrUndefined } from "@sapphire/utilities/isNullOrUndefined";

const { commands } = defineProps<{
	commands: FlattenedCommand[];
}>();

type Schema = v.InferOutput<typeof disabledCommandsSchema>;

const { t } = useI18n();
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
		description: t("guild_settings.commands.category_reset_description", { category }),
		icon: "i-heroicons-arrow-path",
		title: t("guild_settings.commands.category_reset"),
	});
}

async function onError(event: FormErrorEvent) {
	const element =
		event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({ behavior: "smooth", block: "center" });
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: t("guild_settings.commands.save_failed", {
			message: errorMessage ?? t("guild_settings.please_try_again"),
		}),
		icon: "heroicons:x-circle",
		title: t("guild_settings.save_failed"),
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
