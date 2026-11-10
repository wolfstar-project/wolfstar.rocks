<template>
	<section class="rule-discord" :aria-labelledby="titleId">
		<div class="flex items-start gap-3 px-4 py-3.5">
			<span class="rule-discord-tile" aria-hidden="true">
				<UIcon name="ic:round-discord" class="size-4.5" />
			</span>
			<div class="min-w-0 flex-1">
				<component
					:is="switchable ? 'label' : 'p'"
					:id="titleId"
					:for="switchable ? switchId : undefined"
					class="block text-sm font-bold"
				>
					{{ ts("guild_settings.command_rules.discord.title") }}
				</component>
				<p :id="hintId" class="mt-0.5 text-xs leading-normal text-muted">
					{{ ts("guild_settings.command_rules.discord.description", { name }) }}
				</p>
			</div>
			<USwitch
				v-if="switchable"
				:id="switchId"
				v-model="on"
				:disabled="disabled || state.kind !== 'registered'"
				:aria-describedby="hintId"
			/>
		</div>

		<div v-if="state.kind === 'unregistered'" class="px-4 pb-3.5">
			<UAlert
				color="info"
				variant="subtle"
				icon="ic:round-info"
				:description="ts('guild_settings.command_rules.discord.not_registered')"
			/>
		</div>

		<div v-else-if="state.kind === 'failed'" class="rule-discord-details">
			<p class="text-[0.8125rem]">
				{{ ts("guild_settings.command_rules.discord.load_failed") }}
			</p>
			<UButton
				class="self-start"
				size="sm"
				color="neutral"
				variant="outline"
				@click="emit('retry')"
			>
				{{ ts("guild_settings.command_rules.editor.retry") }}
			</UButton>
		</div>

		<div v-else-if="state.kind === 'registered' && hasDetails" class="rule-discord-details">
			<template v-if="on">
				<span class="font-mono text-xs text-muted">
					{{
						ts("guild_settings.command_rules.discord.count", {
							count,
							max: MAXIMUM_COMMAND_OVERWRITES,
						})
					}}
				</span>
				<p v-if="every" class="text-xs leading-normal text-muted">
					{{ ts("guild_settings.command_rules.discord.every_note") }}
				</p>
				<p v-if="roleOrderGap" class="text-xs leading-normal text-muted">
					{{ ts("guild_settings.command_rules.discord.role_order") }}
				</p>
			</template>
			<UAlert
				v-if="state.different"
				color="warning"
				variant="subtle"
				icon="ic:round-warning-amber"
				:description="ts('guild_settings.command_rules.discord.different', { name })"
			/>
			<UAlert
				v-if="state.scopeMissing"
				color="warning"
				variant="subtle"
				icon="ic:round-lock"
				:description="ts('guild_settings.command_rules.discord.scope_needed')"
				:actions="[
					{
						label: ts('guild_settings.command_rules.discord.authorize'),
						to: authorizeUrl,
						external: true,
						size: 'sm',
						icon: 'ic:round-lock-open',
					},
				]"
			/>
			<UAlert
				v-if="state.missingPermission"
				color="warning"
				variant="subtle"
				icon="ic:round-warning-amber"
				:description="
					ts('guild_settings.command_rules.discord.missing', {
						permission: state.missingPermission,
					})
				"
			/>
			<UAlert
				v-if="over"
				color="error"
				variant="subtle"
				icon="ic:round-error-outline"
				:description="
					ts('guild_settings.command_rules.discord.over', {
						max: MAXIMUM_COMMAND_OVERWRITES,
					})
				"
			/>
			<UAlert
				v-if="failure"
				role="alert"
				color="error"
				variant="subtle"
				icon="ic:round-error-outline"
				:title="ts('guild_settings.command_rules.discord.failed_title')"
				:description="failure"
			/>
		</div>
	</section>
</template>

<script lang="ts">
/** What the editor knows of a command's permissions in Discord. */
export type RuleDiscordState =
	| { kind: "reading" }
	| { kind: "failed" }
	/** Discord has no such command here: only WolfStar applies its rules. */
	| { kind: "unregistered" }
	| {
			kind: "registered";
			/** Discord's permissions, as read, are not the rules as stored. */
			different: boolean;
			/** A save would write to Discord, and the sign-in cannot. */
			scopeMissing: boolean;
			/** A save would write to Discord, and the member lacks this permission. */
			missingPermission: string | null;
	  };
</script>

<script setup lang="ts">
/**
 * The "Also in Discord" part of a command's rule editor: whether the rules are
 * written as Discord's own permissions of the command too, and what stands in
 * the way of it.
 */
const on = defineModel<boolean>("on", { required: true });

const {
	name,
	every = false,
	state,
	count,
	roleOrderGap = false,
	disabled = false,
	authorizeUrl,
	failure = null,
} = defineProps<{
	/** The command as a sentence names it: `/ban`, or every command. */
	name: string;
	/** Whether the rules are the ones of every command, Discord's app default. */
	every?: boolean;
	state: RuleDiscordState;
	/** How many permissions the rules make in Discord. */
	count: number;
	/** The rules allow a role and ignore another, which Discord does not rank. */
	roleOrderGap?: boolean;
	disabled?: boolean;
	/** Where the sign-in that grants the command permissions scope starts. */
	authorizeUrl: string;
	/** Why Discord refused the last save, if it did. */
	failure?: string | null;
}>();

const emit = defineEmits<{ retry: [] }>();

const { ts } = useI18n();
const titleId = useId();
const hintId = useId();
const switchId = useId();

const switchable = computed(() => state.kind !== "unregistered");
const over = computed(() => on.value && count > MAXIMUM_COMMAND_OVERWRITES);
const hasDetails = computed(
	() =>
		state.kind === "registered" &&
		(on.value ||
			state.different ||
			state.scopeMissing ||
			state.missingPermission !== null ||
			failure !== null),
);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.rule-discord {
	@apply overflow-hidden rounded-[10px];
	border: 1px solid var(--home-border-subtle);
	background-color: var(--console-input);
}

.rule-discord-tile {
	@apply flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-primary text-primary-content;
}

.rule-discord-details {
	@apply flex flex-col gap-2.5 px-4 pt-2.5 pb-3.5;
	border-top: 1px solid var(--home-border-subtle);
}
</style>
