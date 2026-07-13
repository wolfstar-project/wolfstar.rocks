<template>
	<div v-if="loggedIn && user">
		<LazyUDropdownMenu
			:items
			arrow
			:content="{
				align: 'start',
				side: 'bottom',
				sideOffset: 8,
			}"
			:ui="{
				content: 'w-48',
			}"
		>
			<div
				class="flex cursor-pointer items-center gap-2"
				role="button"
				aria-label="User menu"
				aria-haspopup="menu"
				tabindex="0"
			>
				<LazyUAvatar
					:src="src"
					icon="lucide:image"
					size="2xs"
					style="view-transition-name: user-avatar"
				/>
				<span class="hidden font-semibold sm:inline">{{ user?.name }}</span>
			</div>
		</LazyUDropdownMenu>
	</div>
	<div v-else>
		<UButton
			size="md"
			color="primary"
			variant="subtle"
			to="/login"
			block
			class="md:hidden"
			icon="ic:round-discord"
			aria-label="Sign in with Discord"
		/>
		<UButton
			label="Sign in"
			size="md"
			color="primary"
			variant="subtle"
			to="/login"
			block
			class="hidden md:inline-flex"
			icon="ic:round-discord"
			aria-label="Sign in with Discord"
		/>
	</div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const { loggedIn, user, logout, fetch: fetchSession } = useAuth();

onMounted(() => {
	const loadSession = () => {
		void fetchSession();
	};

	if (typeof window.requestIdleCallback === "function") {
		window.requestIdleCallback(loadSession, { timeout: 5000 });
	} else {
		setTimeout(loadSession, 1);
	}
});

const items = ref<DropdownMenuItem[]>([
	{
		icon: "lucide:user",
		label: "Profile",
		to: "/profile",
	},
	{
		icon: "lucide:log-out",
		label: "Sign out",
		onSelect: logout,
		ui: {
			itemLeadingIcon: "text-error",
		},
	},
]);

const src = computed(() => user.value?.image ?? undefined);
</script>
