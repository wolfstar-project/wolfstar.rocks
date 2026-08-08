<template>
	<section
		class="gap-6 rounded-xl border-base-200 bg-base-200/30 p-8 md:border-4 md:p-12 relative flex flex-col items-center justify-center overflow-hidden border-2"
		aria-label="User profile"
	>
		<!-- decorative left accent (sidebar-like) -->
		<div
			class="inset-y-2 left-0 w-1 rounded-r-md bg-primary/40 md:block absolute hidden"
			aria-hidden="true"
		></div>
		<div v-if="!user" class="space-y-6 flex flex-col items-center justify-center">
			<StarSkeleton
				class="h-32 w-32 ring-base-200 ring-offset-base-100 md:h-40 md:w-40 rounded-full ring-2 ring-offset-4"
			/>
			<div class="space-y-2 text-center">
				<StarSkeleton class="h-10 w-48" />
				<StarSkeleton class="h-7 w-32" />
				<div class="gap-2 flex items-center justify-center">
					<StarSkeleton class="h-6 w-16" />
					<StarSkeleton class="h-6 w-32 rounded-md" />
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
					<StarButton
						variant="outline"
						size="xs"
						color="neutral"
						class="text-sm text-base-content/60 hover:text-base-content"
						@click="$emit('copyUserId')"
					>
						<template #leading>
							<StarIcon
								:name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'"
							/>
						</template>
						{{ user.id }}
					</StarButton>
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
