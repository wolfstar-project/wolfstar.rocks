<template>
	<BetterAuthState>
		<template #default="{ loggedIn, user }">
			<div v-if="loggedIn && user">
				<LazyStarDropdownMenu
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
						class="gap-2 flex cursor-pointer items-center"
						:class="mobile ? 'w-full' : undefined"
						role="button"
						aria-label="User menu"
						aria-haspopup="menu"
						tabindex="0"
					>
						<LazyStarAvatar
							:src="user.image ?? undefined"
							icon="lucide:image"
							size="2xs"
							style="view-transition-name: user-avatar"
						/>
						<span
							class="font-semibold"
							:class="mobile ? 'inline' : 'sm:inline hidden'"
							>{{ user.name }}</span
						>
					</div>
				</LazyStarDropdownMenu>
			</div>
			<div v-else :class="mobile ? 'flex justify-center' : undefined">
				<StarButton
					label="Sign in"
					size="md"
					color="primary"
					variant="subtle"
					to="/login"
					:class="mobile ? 'rounded-lg' : 'rounded-lg md:inline-flex hidden'"
					icon="ic:round-discord"
					aria-label="Sign in with Discord"
				/>
			</div>
		</template>
		<template #placeholder>
			<div class="gap-2 flex items-center" :class="mobile ? 'justify-center' : undefined">
				<template v-if="mobile">
					<StarSkeleton class="h-10 w-36 rounded-lg" />
				</template>
				<template v-else>
					<StarSkeleton class="size-6 rounded-full" />
					<StarSkeleton class="h-4 w-16 sm:block hidden" />
				</template>
			</div>
		</template>
	</BetterAuthState>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "#shared/types/ui";

const { mobile = false } = defineProps<{
	/** Renders a drawer-friendly variant for the mobile navigation panel. */
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
