<template>
	<footer ref="card" class="account-card" :class="{ 'account-card--floating': floating }">
		<!-- The nameplate the account bought on Discord, painted behind it the way
		     Discord does: over its palette's gradient, faded under the name. -->
		<div v-if="nameplate" class="account-nameplate" :style="nameplateStyle" aria-hidden="true">
			<video
				v-if="animate"
				:src="nameplate.clip"
				:poster="nameplate.still"
				class="account-nameplate-art"
				autoplay
				loop
				muted
				playsinline
			></video>
			<img v-else :src="nameplate.still" alt="" class="account-nameplate-art" />
		</div>
		<button
			type="button"
			class="account-user"
			:aria-label="ts('dashboard.user_settings_for', { name })"
			@click="openPreferences()"
		>
			<span ref="nameBlock" class="flex min-w-0 items-center gap-2.5">
				<AppUserAvatar :src="avatar" :decoration size="md" />
				<AppDisplayName :name :styles="nameStyles" class="min-w-0" />
			</span>
		</button>
		<UButton
			color="neutral"
			variant="ghost"
			size="md"
			icon="ic:round-settings"
			:aria-label="ts('dashboard.user_preferences')"
			:title="ts('dashboard.user_preferences')"
			@click="openPreferences()"
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
	 * console design does; otherwise it stays in the flow.
	 */
	floating?: boolean;
}>();

const { ts } = useI18n();
const { signOut } = useUserSession();
const colorMode = useColorMode();
// What the account wears on Discord; animated pieces go still when motion is reduced.
const { animate, avatar, decoration, name, nameStyles, nameplate } = useDiscordAccount();

// Discord fades the nameplate to 30% under the avatar and the name, measured
// from the card's edge as they lay out, and tints it with its palette.
const card = useTemplateRef<HTMLElement>("card");
const nameBlock = useTemplateRef<HTMLElement>("nameBlock");
const { left: cardLeft } = useElementBounding(card);
const { right: nameRight } = useElementBounding(nameBlock);
const nameplateStyle = computed(() => {
	const plate = nameplate.value;
	if (!plate) return undefined;
	const mask = nameplateMask(nameRight.value - cardLeft.value);
	return {
		background:
			nameplateBackground(plate.palette, colorMode.value === "light" ? "light" : "dark") ??
			undefined,
		maskImage: mask,
		WebkitMaskImage: mask,
	};
});
const { open: openPreferences } = usePreferencesDialog();
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* The account sits in a card of its own, held off the sidebar's edges, so it
   reads as the person using the dashboard rather than part of the server or
   the conversation beside it. */
.account-card {
	@apply relative m-2 flex shrink-0 items-center gap-1 overflow-hidden rounded-[10px] p-1.5;
	/* Solid: the card floats over the rail and the sidebar, which must not show through it. */
	background-color: var(--console-solid);
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

/* The phone's list gives the sidebar the whole width the rail leaves: the card spans it. */
@variant max-sm {
	.account-card--floating {
		width: calc(100% - 1rem);
	}
}

.account-nameplate {
	@apply pointer-events-none absolute inset-0;
}

.account-nameplate-art {
	@apply h-full w-full object-cover object-right;
}

.account-card > :not(.account-nameplate) {
	@apply relative;
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
