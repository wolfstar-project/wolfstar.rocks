<template>
	<footer class="account-card" :class="{ 'account-card--floating': floating }">
		<!-- The nameplate the account bought on Discord, painted behind it. -->
		<video
			v-if="nameplate && animateCollectibles"
			:src="nameplate.clip"
			:poster="nameplate.still"
			class="account-nameplate"
			autoplay
			loop
			muted
			playsinline
			aria-hidden="true"
		></video>
		<img v-else-if="nameplate" :src="nameplate.still" alt="" class="account-nameplate" />
		<button
			type="button"
			class="account-user"
			:aria-label="ts('dashboard.user_settings_for', { name: account.name })"
			@click="openSettings"
		>
			<span class="relative shrink-0">
				<UAvatar :src="account.avatar" alt="" size="md" icon="ic:round-person" />
				<img
					v-if="avatarDecoration"
					:src="avatarDecoration"
					alt=""
					class="account-avatar-decoration"
				/>
			</span>
			<span class="truncate">{{ account.name }}</span>
		</button>
		<UButton
			color="neutral"
			variant="ghost"
			size="md"
			icon="ic:round-settings"
			:aria-label="ts('dashboard.user_preferences')"
			:title="ts('dashboard.user_preferences')"
			@click="openSettings"
		/>
		<UButton
			color="neutral"
			variant="ghost"
			size="md"
			icon="ic:round-logout"
			:aria-label="ts('dashboard.user_sign_out')"
			:title="ts('dashboard.user_sign_out')"
			@click="signOut()"
		/>
	</footer>
</template>

<script setup lang="ts">
/**
 * The signed-in account at the foot of the dashboard's sidebar, with what it
 * wears on Discord, and the way into the settings and out of the session.
 */
const { floating = false } = defineProps<{
	/**
	 * Lays the card over the server rail and the foot of the sidebar, as the
	 * console design does; in the drawer it stays in the flow.
	 */
	floating?: boolean;
}>();

const emit = defineEmits<{
	/** The settings were opened, so a drawer holding the card can close. */
	navigate: [];
}>();

const { ts } = useI18n();
const { user: authUser, signOut } = useUserSession();
// The session carries no picture of its own; the Discord account does.
const { user: discordUser } = useUser(authUser);
const account = computed(() => ({
	avatar:
		authUser.value?.image ??
		(discordUser.value ? avatarURL(discordUser.value, { size: 64 }) : undefined),
	name: discordUser.value?.global_name ?? authUser.value?.name ?? "",
}));
// What the account wears on Discord: the frame around the avatar and the
// nameplate behind the name. Both are still when motion is reduced.
const { effectiveReduceMotion } = useReduceMotion();
const animateCollectibles = computed(() => !effectiveReduceMotion.value);
const avatarDecoration = computed(() => {
	const decoration = discordUser.value?.avatar_decoration_data;
	return decoration
		? avatarDecorationURL(decoration, { animated: animateCollectibles.value })
		: null;
});
const nameplate = computed(() => {
	const plate = discordUser.value?.collectibles?.nameplate;
	return plate
		? { clip: nameplateURL(plate, { animated: true }), still: nameplateURL(plate) }
		: null;
});
const { open: openPreferences } = usePreferencesDialog();

// In the drawer the sidebar sits in a dialog of its own: it is closed first, so
// the settings do not open stacked on top of it.
function openSettings() {
	emit("navigate");
	openPreferences();
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* The account sits in a card of its own, held off the sidebar's edges, so it
   reads as the person using the dashboard rather than part of the server or
   the conversation beside it. */
.account-card {
	@apply relative m-2 flex shrink-0 items-center gap-1 overflow-hidden rounded-[10px] p-1.5;
	background-color: var(--console-rail);
	border: 1px solid var(--console-border);
	box-shadow: var(--console-shadow-low);
}

/* Over the rail and the sidebar's foot, as wide as both less the margins. The
   widths are the layout's variables, so the card follows every breakpoint. */
.account-card--floating {
	@apply absolute bottom-2 left-2 z-30 m-0;
	width: calc(var(--console-rail-width) + var(--console-sidebar-width) - 1rem);
	box-shadow: var(--popover-shadow);
}

.account-nameplate {
	@apply pointer-events-none absolute inset-0 h-full w-full object-cover object-right;
}

.account-card > :not(.account-nameplate) {
	@apply relative;
}

/* The frame sits a little outside the avatar, as on Discord. */
.account-avatar-decoration {
	@apply pointer-events-none absolute -inset-[10%] h-[120%] w-[120%] max-w-none;
}

.account-user {
	@apply flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-[6px] border-0 bg-transparent px-1.5 py-1 text-left text-sm font-semibold;
	color: var(--ui-text-highlighted);
}

.account-user:hover {
	background-color: var(--console-hover);
}

.account-user:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: -2px;
}
</style>
