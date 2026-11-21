<template>
	<section class="console-card flex flex-col" :aria-labelledby="headingId">
		<div class="flex items-start justify-between gap-3">
			<span
				class="flex size-11 shrink-0 items-center justify-center rounded-lg"
				:class="isOn ? 'bg-primary/15 text-primary' : 'bg-base-content/8 text-muted'"
				aria-hidden="true"
			>
				<UIcon :name="icon" class="size-5.5" />
			</span>
			<div class="flex shrink-0 items-center gap-2.5">
				<UBadge
					v-if="badge"
					:color="isOn ? 'success' : 'neutral'"
					variant="subtle"
					class="font-semibold"
				>
					{{ badge }}
				</UBadge>
				<USwitch
					v-if="status.kind === 'ready'"
					:model-value="status.enabled"
					:disabled="busy"
					class="shrink-0"
					:aria-label="ts('guild_settings.modules.toggle_aria', { title })"
					@update:model-value="emit('toggle', $event)"
				/>
			</div>
		</div>
		<div class="mt-3 min-w-0 flex-1" :class="{ 'opacity-60': !isOn }">
			<h3 :id="headingId" class="text-base font-bold">{{ title }}</h3>
			<p class="mt-1 text-[0.8125rem] leading-snug text-muted">{{ description }}</p>
		</div>
		<div class="mt-4 flex justify-end">
			<UButton
				v-if="status.kind === 'not-installed'"
				color="neutral"
				variant="ghost"
				size="sm"
				:to="status.inviteUrl"
				target="_blank"
				external
			>
				{{ ts("guild_settings.modules.invite", { service }) }}
			</UButton>
			<UButton
				v-else-if="status.kind === 'unavailable'"
				color="neutral"
				variant="ghost"
				size="sm"
				@click="emit('retry')"
			>
				{{ ts("guild_settings.modules.retry", { title }) }}
			</UButton>
			<UButton
				v-else
				color="neutral"
				variant="ghost"
				size="sm"
				:disabled="status.kind === 'loading'"
				@click="emit('configure')"
			>
				{{ ts("guild_settings.modules.configure") }}
			</UButton>
		</div>
	</section>
</template>

<script setup lang="ts">
/**
 * Where a module held by another service stands, as its card shows it. Only
 * `ready` has a switch: the other states say why there is none.
 */
export type ExternalModuleCardStatus =
	| { kind: "loading" }
	/** The dashboard could not reach the service. */
	| { kind: "unavailable" }
	/** The service's bot is not in the server. */
	| { kind: "not-installed"; inviteUrl: string }
	| { kind: "ready"; enabled: boolean; summary: string };

/**
 * The card of a module another service holds, such as Staryl's Social. Its
 * switch is the service's own, so a flip is saved at once and is not staged
 * with the server's settings, as the cards above it are.
 */
const {
	status,
	busy = false,
	service,
} = defineProps<{
	icon: string;
	title: string;
	description: string;
	/** The bot that runs the module, named where the card asks for it. */
	service: string;
	status: ExternalModuleCardStatus;
	/** A flip of the switch is on its way. */
	busy?: boolean;
}>();

const emit = defineEmits<{
	toggle: [enabled: boolean];
	configure: [];
	retry: [];
}>();

const { ts } = useI18n();
const headingId = useId();

const isOn = computed(() => status.kind === "ready" && status.enabled);

const badge = computed(() => {
	switch (status.kind) {
		case "ready": {
			return status.summary;
		}
		case "not-installed": {
			return ts("guild_settings.modules.not_in_server", { service });
		}
		case "unavailable": {
			return ts("guild_settings.modules.unavailable");
		}
		default: {
			return null;
		}
	}
});
</script>
