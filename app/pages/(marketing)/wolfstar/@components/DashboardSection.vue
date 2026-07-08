<template>
	<Section labelled-by="home-dashboard-heading" :contained="false">
		<Container>
			<div class="grid items-center gap-12 lg:grid-cols-2">
				<SectionHeader
					eyebrow="Dashboard"
					title="Manage every member, precisely."
					description="Search, sort, and act on any member without leaving the dashboard."
					heading-id="home-dashboard-heading"
					align="start"
				/>

				<SurfaceCard
					padding="none"
					class="overflow-hidden"
					role="img"
					aria-label="Preview of the WolfStar dashboard member list with roles and statuses"
				>
					<div
						class="flex items-center gap-3 border-b border-default px-6 py-4"
						aria-hidden="true"
					>
						<UIcon name="ph:magnifying-glass" class="h-4 w-4 text-muted" />
						<div
							class="flex h-9 flex-1 items-center rounded-lg bg-base-content/5 px-3 text-sm text-muted"
						>
							Search members…
						</div>
						<span class="text-sm whitespace-nowrap text-muted">1,204 members</span>
					</div>
					<div class="px-6 py-1" aria-hidden="true">
						<div
							v-for="member of members"
							:key="member.name"
							class="flex items-center gap-3 border-t border-default/60 py-3 first:border-t-0"
						>
							<div
								:class="
									cn(
										'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
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
			</div>
		</Container>
	</Section>
</template>

<script setup lang="ts">
import { cn } from "cnfast";
const { members } = defineProps<{
	members: HomeDashboardMember[];
}>();
</script>
