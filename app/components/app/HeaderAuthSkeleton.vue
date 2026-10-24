<template>
	<!-- Both skeletons are always in the markup, so the prerendered page and the
	     client agree; CSS shows the one the auth hint on <html> asks for. Each
	     is as wide as what replaces it, so the header does not move. -->
	<div
		class="auth-skeleton"
		:class="mobile ? 'justify-center' : undefined"
		role="status"
		:aria-label="ts('header.account_loading')"
	>
		<div class="auth-skeleton-guest" aria-hidden="true">
			<span
				class="skeleton rounded-lg"
				:class="mobile ? 'inline-flex' : 'hidden md:inline-flex'"
			>
				<UButton
					:label="ts('header.settings')"
					size="md"
					color="neutral"
					variant="ghost"
					icon="lucide:sliders-horizontal"
					class="invisible rounded-lg"
					tabindex="-1"
				/>
			</span>
			<span
				class="skeleton rounded-lg"
				:class="mobile ? 'inline-flex' : 'hidden md:inline-flex'"
			>
				<UButton
					:label="ts('header.sign_in')"
					size="md"
					color="primary"
					variant="soft"
					icon="ic:round-discord"
					class="invisible rounded-lg"
					tabindex="-1"
				/>
			</span>
		</div>
		<div class="auth-skeleton-user" aria-hidden="true">
			<USkeleton class="size-5 shrink-0 rounded-full" />
			<span
				class="auth-skeleton-name skeleton rounded"
				:class="mobile ? 'inline' : 'hidden sm:inline'"
			></span>
		</div>
	</div>
</template>

<script setup lang="ts">
/** What the header's account area holds while the session is not known yet. */
const { mobile = false } = defineProps<{
	mobile?: boolean;
}>();

const { ts } = useI18n();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.auth-skeleton {
	@apply flex items-center;
}

.auth-skeleton-guest,
.auth-skeleton-user {
	@apply flex items-center gap-2;
}

/* The name, set in the same type as the real one but unseen, under a block. */
.auth-skeleton-name {
	@apply font-semibold whitespace-nowrap text-transparent;
}

.auth-skeleton-name::before {
	content: var(--auth-name, "");
}

/* The hint script marks <html> when someone was signed in last time. */
:root:not([data-auth="user"]) .auth-skeleton-user,
:root[data-auth="user"] .auth-skeleton-guest {
	display: none;
}
</style>
