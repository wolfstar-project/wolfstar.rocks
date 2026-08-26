<template>
	<section
		class="relative flex flex-col items-center justify-center gap-6 overflow-hidden rounded-xl border-2 border-base-200 bg-base-200/30 p-8 md:border-4 md:p-12"
		:aria-label="sectionLabel"
	>
		<!-- decorative left accent (sidebar-like) -->
		<div
			class="absolute inset-y-2 left-0 hidden w-1 rounded-r-md bg-primary/40 md:block"
			aria-hidden="true"
		></div>
		<div
			v-if="pending"
			class="flex flex-col items-center justify-center space-y-6"
			aria-busy="true"
		>
			<USkeleton
				class="h-32 w-32 rounded-full ring-2 ring-base-200 ring-offset-4 ring-offset-base-100 md:h-40 md:w-40"
			/>
			<div class="space-y-2 text-center">
				<USkeleton class="h-10 w-48" />
				<USkeleton class="h-7 w-32" />
				<div class="flex items-center justify-center gap-2">
					<USkeleton class="h-6 w-16" />
					<USkeleton class="h-6 w-32 rounded-md" />
				</div>
			</div>
		</div>
		<div
			v-else-if="!user"
			class="flex flex-col items-center justify-center space-y-6 text-center"
		>
			<div
				class="flex size-32 items-center justify-center rounded-full bg-primary/10 ring-2 ring-base-200 ring-offset-4 ring-offset-base-100 md:size-40"
			>
				<UIcon name="lucide:sliders-horizontal" class="size-14 text-primary" />
			</div>
			<div class="space-y-3">
				<h2 class="text-4xl font-bold text-base-content">
					{{ t("profile.settings_title") }}
				</h2>
				<p class="max-w-md text-base text-base-content/70">
					{{ t("profile.guest_tagline") }}
				</p>
				<UButton
					:label="t('header.sign_in')"
					color="primary"
					variant="solid"
					icon="ic:round-discord"
					:to="loginTo"
					:aria-label="t('header.sign_in_discord')"
				/>
			</div>
		</div>
		<template v-else>
			<ProfileAvatar :user="user" :effective-reduce-motion="effectiveReduceMotion" />
			<div class="space-y-2 text-center">
				<h2 class="text-4xl font-bold text-base-content">
					{{ user.name }}
				</h2>
				<p class="text-lg font-medium text-base-content/80">@{{ user.username }}</p>
				<p class="text-sm text-base-content/60">
					{{ t("profile.user_id_label") }}
					<UButton
						variant="outline"
						size="xs"
						color="neutral"
						class="text-sm text-base-content/60 hover:text-base-content"
						@click="$emit('copyUserId')"
					>
						<template #leading>
							<UIcon
								:name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'"
							/>
						</template>
						{{ user.id }}
					</UButton>
				</p>
			</div>
		</template>
	</section>
</template>

<script setup lang="ts">
interface ProfileHeaderProps {
	user: DiscordProfileUser | null | undefined;
	copied?: boolean;
	effectiveReduceMotion?: boolean;
	pending?: boolean;
}

const { pending = false, user } = defineProps<ProfileHeaderProps>();
defineEmits<{ copyUserId: [] }>();

const { ts: t } = useI18n();
const loginTo = "/login?next=/profile";

const sectionLabel = computed(() => {
	if (pending) return t("common.loading");
	if (user) return t("profile.user_profile");
	return t("profile.guest_profile");
});
</script>
