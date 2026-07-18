<template>
	<UPopover
		mode="hover"
		enable-touch
		:open-delay="200"
		:close-delay="150"
		:content="{ side: 'top', align: 'start', sideOffset: 8 }"
		:ui="{ content: 'p-0' }"
	>
		<a
			:href="profileUrl"
			target="_blank"
			rel="noopener noreferrer"
			class="text-highlighted underline decoration-dotted underline-offset-2 transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
		>
			{{ name }} (@{{ username }})
		</a>

		<template #content>
			<div class="not-prose w-64 p-3" role="group" :aria-label="cardLabel">
				<div class="flex items-start gap-3">
					<UAvatar :src="avatarSrc" :alt="`${name} avatar`" size="lg" />
					<div class="min-w-0 flex-1">
						<p class="truncate font-semibold text-highlighted">
							{{ name }}
						</p>
						<p class="truncate text-sm text-muted">@{{ username }}</p>
					</div>
				</div>

				<div class="mt-3 flex flex-col gap-2">
					<p class="text-sm text-muted">
						<span class="font-medium text-highlighted">{{ formattedCommits }}</span>
						{{ commits === 1 ? "commit" : "commits" }}
					</p>
					<UBadge
						:color="hasContributed ? 'success' : 'neutral'"
						:variant="hasContributed ? 'subtle' : 'outline'"
						size="sm"
						:icon="hasContributed ? 'i-lucide-check' : 'i-lucide-circle-dashed'"
						class="w-fit"
					>
						{{
							hasContributed
								? "Contributed to this repository"
								: "Not listed as a repository contributor"
						}}
					</UBadge>
				</div>
			</div>
		</template>
	</UPopover>
</template>

<script setup lang="ts">
const props = defineProps<{
	name: string;
	username: string;
	commits: number;
	hasContributed: boolean;
	avatarSrc: string;
}>();

const profileUrl = computed(() => `https://github.com/${props.username}`);
const cardLabel = computed(() => `${props.name} (@${props.username}) contributor details`);
const formattedCommits = computed(() =>
	new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(props.commits),
);
</script>
