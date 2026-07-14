<template>
	<section
		class="relative flex flex-col items-center justify-center gap-6 overflow-hidden rounded-xl border-2 border-base-200 bg-base-200/30 p-8 md:flex-row md:border-4 md:p-12"
		aria-label="User profile"
	>
		<!-- decorative left accent (sidebar-like) -->
		<div
			class="absolute inset-y-2 left-0 hidden w-1 rounded-r-md bg-primary/40 md:block"
			aria-hidden="true"
		></div>
		<div v-if="!user" class="flex flex-col items-center justify-center space-y-6">
			<USkeleton
				class="h-24 w-24 rounded-full ring-2 ring-base-200 ring-offset-4 ring-offset-base-100"
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
		<template v-else>
			<ProfileAvatar :user="user" :effective-reduce-motion="effectiveReduceMotion" />
			<div class="space-y-2 text-center">
				<h2 class="text-4xl font-bold text-base-content">
					{{ user.name }}
				</h2>
				<p class="text-lg font-medium text-base-content/80">@{{ user.username }}</p>
				<p class="text-sm text-base-content/60">
					User ID:
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
}

defineProps<ProfileHeaderProps>();
defineEmits<{ copyUserId: [] }>();
</script>
