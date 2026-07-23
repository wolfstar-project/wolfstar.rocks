<template>
	<BetterAuthState>
		<template #default="{ loggedIn, user }">
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
						:class="mobile ? 'w-full' : undefined"
						role="button"
						aria-label="User menu"
						aria-haspopup="menu"
						tabindex="0"
					>
						<LazyUAvatar
							:src="user.image ?? undefined"
							icon="lucide:image"
							size="2xs"
							style="view-transition-name: user-avatar"
						/>
						<span
							class="font-semibold"
							:class="mobile ? 'inline' : 'hidden sm:inline'"
							>{{ user.name }}</span
						>
					</div>
				</LazyUDropdownMenu>
			</div>
			<div v-else>
				<UButton
					v-if="!mobile"
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
					:class="mobile ? undefined : 'hidden md:inline-flex'"
					icon="ic:round-discord"
					aria-label="Sign in with Discord"
				/>
			</div>
		</template>
		<template #placeholder>
			<div class="flex items-center gap-2">
				<USkeleton class="size-6 rounded-full" />
				<USkeleton class="h-4 w-16" :class="mobile ? undefined : 'hidden sm:block'" />
			</div>
		</template>
	</BetterAuthState>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const { mobile = false } = defineProps<{
	/** Renders a full-width variant suited for the mobile navigation drawer. */
	mobile?: boolean;
}>();

const { signOut } = useUserSession();

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

async function logout() {
	await signOut({
		onSuccess: () => {
			void navigateTo("/");
		},
	});
}
</script>
