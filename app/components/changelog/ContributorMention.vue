<template>
	<UTooltip
		:text="cardLabel"
		:delay-duration="200"
		:content="{ side: 'top', align: 'start', sideOffset: 8 }"
		:ui="{ content: 'h-auto max-w-xs items-start p-0' }"
	>
		<UButton
			:to="profileUrl"
			target="_blank"
			rel="noopener noreferrer"
			variant="link"
			class="text-highlighted underline decoration-dotted underline-offset-2 transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
		>
			{{ name }} (@{{ username }})
		</UButton>

		<template #content>
			<div class="not-prose w-72 p-3" role="group" :aria-label="cardLabel">
				<div class="flex items-start gap-3">
					<UAvatar :src="avatarSrc" :alt="`${name} avatar`" size="lg" />
					<div class="min-w-0 flex-1">
						<p class="truncate font-semibold text-highlighted">
							{{ name }}
						</p>
						<p class="truncate text-sm text-muted">@{{ username }}</p>
					</div>
				</div>

				<dl
					class="mt-3 grid grid-cols-3 divide-x divide-default border-t border-default pt-3 text-center"
				>
					<div class="px-1.5">
						<dt class="text-xs leading-tight text-muted">Commits</dt>
						<dd class="mt-1 text-sm font-semibold text-highlighted tabular-nums">
							{{ formattedCommits }}
						</dd>
					</div>
					<div class="px-1.5">
						<dt class="text-xs leading-tight text-muted">On this repo</dt>
						<dd class="mt-1 text-sm font-semibold text-highlighted tabular-nums">
							{{ formattedCommits }}
						</dd>
					</div>
					<div class="px-1.5">
						<dt class="text-xs leading-tight text-muted">Contributed here</dt>
						<dd
							class="mt-1 text-sm font-semibold"
							:class="hasContributed ? 'text-success' : 'text-muted'"
						>
							{{ hasContributed ? "Yes" : "No" }}
						</dd>
					</div>
				</dl>
			</div>
		</template>
	</UTooltip>
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
