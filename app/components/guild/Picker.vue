<template>
	<section
		class="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6"
		:aria-label="ts('dashboard.picker.title')"
	>
		<div>
			<h2 class="text-2xl font-bold text-base-content">{{ ts("dashboard.picker.title") }}</h2>
			<p class="mt-1 text-base-content/60">{{ ts("dashboard.picker.description") }}</p>
		</div>

		<div
			v-if="pending"
			class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
			role="status"
			:aria-label="ts('profile.loading_servers')"
		>
			<guild-card v-for="n in 10" :key="n" :loading="true" />
		</div>

		<div
			v-else-if="manageableGuilds.length > 0"
			class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
			role="list"
			:aria-label="ts('profile.servers_list_aria')"
		>
			<guild-card v-for="guild in manageableGuilds" :key="guild.id" :guild role="listitem" />
		</div>

		<div
			v-else
			class="flex flex-col items-center gap-4 rounded-xl border border-base-300/60 py-16 text-center"
			role="status"
		>
			<UIcon name="heroicons:server" class="size-12 text-base-content/30" />
			<p class="max-w-md text-base-content/70">{{ ts("dashboard.picker.empty") }}</p>
			<UButton color="primary" variant="outline" to="/profile">
				{{ ts("profile.servers") }}
			</UButton>
		</div>
	</section>
</template>

<script setup lang="ts">
const { ts } = useI18n();
const { user } = useUserSession();
const { guilds, status } = useUser(user);

const pending = computed(() => status.value === "idle" || status.value === "pending");

// Only servers the admin can manage belong in the picker; the card decides
// between "Manage Server" (WolfStar is in) and "Invite Bot".
const manageableGuilds = computed(() =>
	guilds.value
		.filter((guild) => guild.manageable)
		.toSorted(
			(a, b) =>
				Number(b.wolfstarIsIn) - Number(a.wolfstarIsIn) || a.name.localeCompare(b.name),
		),
);
</script>
