<template>
	<Section labelled-by="home-dashboard-heading" spacing="none" class="py-22">
		<SectionHeader
			eyebrow="Dashboard"
			title="Manage every member, precisely."
			description="Search, sort, and act on any member without leaving the dashboard."
			heading-id="home-dashboard-heading"
			class="mb-10"
		/>

		<SurfaceCard
			padding="none"
			class="dashboard-preview mx-auto max-w-250 overflow-hidden shadow-glow"
			role="img"
			aria-label="Preview of the WolfStar dashboard member list with roles and statuses"
		>
			<div
				class="dashboard-toolbar flex items-center gap-3 border-b px-6 py-4.5"
				aria-hidden="true"
			>
				<UIcon name="ph:magnifying-glass" class="h-4 w-4 text-muted" />
				<div
					class="dashboard-search flex h-9 flex-1 items-center rounded-md border px-3 text-sm text-muted"
				>
					Search members…
				</div>
				<span class="text-sm whitespace-nowrap text-muted">1,204 members</span>
			</div>
			<div class="px-6 py-1" aria-hidden="true">
				<div
					v-for="member of members"
					:key="member.name"
					class="dashboard-member-row flex items-center gap-3 border-t py-3 first:border-t-0"
				>
					<div
						:class="
							cn(
								'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
								member.avatarClass,
							)
						"
						aria-hidden="true"
					>
						{{ member.initials }}
					</div>
					<div class="flex-1">
						<div :class="cn('text-sm font-semibold', member.nameClass)">
							{{ member.name }}
						</div>
						<div class="text-xs text-muted capitalize">{{ member.status }}</div>
					</div>
					<span :class="cn('badge badge-soft badge-sm', member.badgeClass)">
						{{ member.role }}
					</span>
				</div>
			</div>
		</SurfaceCard>
	</Section>
</template>

<script setup lang="ts">
import { cn } from "cnfast";

const { members } = defineProps<{
	members: HomeDashboardMember[];
}>();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.dashboard-toolbar {
	border-color: var(--home-border-subtle);
}

.dashboard-search {
	border-color: oklch(from var(--color-base-content) l c h / 0.15);
	background-color: var(--color-base-100);
}

.dashboard-member-row {
	border-color: var(--home-border-subtle);
}
</style>
