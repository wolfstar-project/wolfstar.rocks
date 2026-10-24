<template>
	<UModal
		v-model:open="open"
		:title="ts('guild_settings.automod.rules.type_picker.title')"
		:description="ts('guild_settings.automod.rules.type_picker.description')"
		:ui="{ content: 'sm:max-w-205' }"
	>
		<template #body>
			<div class="flex flex-col gap-4.5">
				<section v-for="group in groups" :key="group.id" :aria-labelledby="group.headingId">
					<h3 :id="group.headingId" class="mb-2.5 console-label">{{ group.label }}</h3>
					<div class="grid grid-cols-[repeat(auto-fill,minmax(11.75rem,1fr))] gap-2.5">
						<button
							v-for="type in group.types"
							:key="type"
							type="button"
							class="type-card"
							@click="emit('pick', type)"
						>
							<span class="flex items-center gap-2">
								<GuildAutomodTypeIcon :type />
								<span class="truncate text-[0.8125rem] font-bold">
									{{ ts(AUTOMOD_TYPE_NAME_KEYS[type]) }}
								</span>
							</span>
							<span class="font-mono text-[0.625rem] text-muted">{{ type }}</span>
							<span class="text-xs leading-[1.4] text-muted">
								{{ ts(AUTOMOD_TYPE_DESCRIPTION_KEYS[type]) }}
							</span>
						</button>
					</div>
				</section>
			</div>
		</template>

		<template #footer>
			<UButton color="neutral" variant="outline" class="dialog-cancel" @click="open = false">
				{{ ts("guild_settings.automod.rules.editor.cancel") }}
			</UButton>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import {
	AutoModerationRuleTypes,
	getDefaultAutoModerationRuleOptions,
	type AutoModerationRuleType,
} from "#shared/utils/automod-rules";
import { AUTOMOD_TYPE_DESCRIPTION_KEYS, AUTOMOD_TYPE_NAME_KEYS } from "~/utils/automod-rule-labels";

const open = defineModel<boolean>("open", { required: true });

const emit = defineEmits<{
	/** The kind of rule to create; a rule keeps it for good. */
	pick: [type: AutoModerationRuleType];
}>();

const { ts } = useI18n();

// A rule that counts what a member sends over a time period limits a rate; the
// others judge one message by what is in it.
function isRateLimit(type: AutoModerationRuleType): boolean {
	return "timePeriod" in getDefaultAutoModerationRuleOptions(type);
}

const contentHeadingId = useId();
const rateHeadingId = useId();

const groups = computed(() => [
	{
		headingId: contentHeadingId,
		id: "content",
		label: ts("guild_settings.automod.rules.type_picker.content_filters"),
		types: AutoModerationRuleTypes.filter((type) => !isRateLimit(type)),
	},
	{
		headingId: rateHeadingId,
		id: "rate",
		label: ts("guild_settings.automod.rules.type_picker.rate_limits"),
		types: AutoModerationRuleTypes.filter((type) => isRateLimit(type)),
	},
]);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.type-card {
	@apply flex cursor-pointer flex-col gap-1.5 rounded-[10px] p-3 text-left;
	background-color: var(--ink-700);
	border: 1px solid var(--home-border-subtle);
}

.type-card:hover {
	border-color: var(--field-border);
	background-color: color-mix(in oklab, var(--ink-700), white 4%);
}

.type-card:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: -1px;
}

@variant theme-light {
	.type-card,
	.type-card:hover {
		background-color: var(--color-base-200);
	}
}
</style>
