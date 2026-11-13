<template>
	<!-- A failed load is not an empty list: saying "no servers" would send the
	     admin looking for a permission problem that does not exist. -->
	<div v-if="!pending && error" class="servers-notice servers-notice--error" role="alert">
		<UIcon name="ic:round-error" class="size-5 shrink-0 text-error" aria-hidden="true" />
		<p class="grow">{{ ts("dashboard.picker.error") }}</p>
		<UButton
			color="neutral"
			variant="outline"
			size="sm"
			icon="ic:round-refresh"
			:loading="retrying"
			@click="retry"
		>
			{{ ts("common.retry") }}
		</UButton>
	</div>
	<div v-else-if="!pending && !hasManageable" class="servers-notice" role="status">
		<UIcon name="ic:round-info" class="size-5 shrink-0 text-info" aria-hidden="true" />
		<p class="grow">{{ ts("dashboard.picker.empty") }}</p>
	</div>
</template>

<script setup lang="ts">
/**
 * What the Home says about the server list when the rail has nothing to show:
 * the servers failed to load, with a retry, or there is none to manage.
 */
const { ts } = useI18n();
const { user } = useUserSession();
const { guilds, status, error, refresh } = useUser(user);

const retrying = ref(false);
// While a retry runs the error stays up with a busy button.
const pending = computed(
	() => !retrying.value && (status.value === "idle" || status.value === "pending"),
);
const hasManageable = computed(() => guilds.value.some((guild) => guild.manageable));

async function retry() {
	retrying.value = true;
	try {
		await refresh();
	} finally {
		retrying.value = false;
	}
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.servers-notice {
	@apply flex items-center gap-3 rounded-[8px] px-3.5 py-3 text-sm leading-normal;
	background-color: color-mix(in oklab, var(--color-info) 10%, transparent);
	border: 1px solid color-mix(in oklab, var(--color-info) 30%, transparent);
	color: var(--ui-text-toned);
}

.servers-notice--error {
	background-color: color-mix(in oklab, var(--color-error) 10%, transparent);
	border-color: color-mix(in oklab, var(--color-error) 30%, transparent);
}
</style>
