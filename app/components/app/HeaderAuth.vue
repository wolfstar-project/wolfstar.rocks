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
						:aria-label="ts('header.user_menu')"
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
			<div v-else :class="mobile ? 'flex justify-center gap-2' : 'flex items-center gap-2'">
				<UButton
					:label="ts('header.settings')"
					size="md"
					color="neutral"
					variant="ghost"
					:class="mobile ? 'rounded-lg' : 'hidden rounded-lg md:inline-flex'"
					icon="lucide:sliders-horizontal"
					:aria-label="ts('header.settings')"
					@click="openPreferences"
				/>
				<UButton
					:label="ts('header.sign_in')"
					size="md"
					color="primary"
					variant="soft"
					to="/login"
					:class="[
						mobile ? 'rounded-lg' : 'hidden rounded-lg md:inline-flex',
						'theme-dark:text-highlighted',
					]"
					icon="ic:round-discord"
					:aria-label="ts('header.sign_in_discord')"
				/>
			</div>
		</template>
		<template #placeholder>
			<div class="flex items-center gap-2" :class="mobile ? 'justify-center' : undefined">
				<template v-if="mobile">
					<USkeleton class="h-10 w-36 rounded-lg" />
				</template>
				<template v-else>
					<USkeleton class="size-6 rounded-full" />
					<USkeleton class="hidden h-4 w-16 sm:block" />
				</template>
			</div>
		</template>
	</BetterAuthState>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const { mobile = false } = defineProps<{
	/** Renders a drawer-friendly variant for the mobile navigation panel. */
	mobile?: boolean;
}>();

const { ts } = useI18n();
const { signOut } = useUserSession();
const { open: openPreferences } = usePreferencesDialog();

const items = computed<DropdownMenuItem[]>(() => [
	{
		icon: "lucide:layout-dashboard",
		label: ts("header.dashboard"),
		to: "/app",
	},
	{
		icon: "lucide:sliders-horizontal",
		label: ts("header.settings"),
		onSelect: () => openPreferences(),
	},
	{
		icon: "lucide:log-out",
		label: ts("header.sign_out"),
		// `auth.redirects.logout` in nuxt.config sends the user home afterwards.
		onSelect: () => signOut(),
		ui: {
			itemLeadingIcon: "text-error",
		},
	},
]);
</script>
