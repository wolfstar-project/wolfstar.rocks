<template>
	<StarTooltip
		v-model:open="open"
		:text="cardLabel"
		:delay-duration="200"
		:content="{ side: 'top', align: 'start', sideOffset: 8 }"
		:ui="{ content: 'h-auto max-w-xs items-start p-0' }"
	>
		<StarButton
			:to="profileUrl"
			target="_blank"
			rel="noopener noreferrer"
			variant="link"
			class="text-base-content underline decoration-dotted underline-offset-2 transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
		>
			{{ name }} (@{{ username }})
		</StarButton>

		<template #content>
			<div class="not-prose w-72 p-3" role="group" :aria-label="cardLabel">
				<div class="flex items-start gap-3">
					<StarAvatar :src="avatarSrc" :alt="`${name} avatar`" size="lg" />
					<div class="min-w-0 flex-1">
						<p class="truncate font-semibold text-base-content">
							{{ name }}
						</p>
						<p class="truncate text-sm text-base-content/60">@{{ username }}</p>
					</div>
				</div>

				<dl
					class="divide-base-200 mt-3 grid grid-cols-3 divide-x border-t border-base-200 pt-3 text-center"
				>
					<div class="px-1.5">
						<dt class="text-xs leading-tight text-base-content/60">Commits</dt>
						<dd class="mt-1 text-sm font-semibold text-base-content tabular-nums">
							{{ formattedCommits }}
						</dd>
					</div>
					<div class="px-1.5">
						<dt class="text-xs leading-tight text-base-content/60">On this repo</dt>
						<dd class="mt-1 text-sm font-semibold text-base-content tabular-nums">
							{{ formattedCommits }}
						</dd>
					</div>
					<div class="px-1.5">
						<dt class="text-xs leading-tight text-base-content/60">Contributed here</dt>
						<dd
							class="mt-1 text-sm font-semibold"
							:class="hasContributed ? 'text-success' : 'text-base-content/60'"
						>
							{{ hasContributed ? "Yes" : "No" }}
						</dd>
					</div>
				</dl>
			</div>
		</template>
	</StarTooltip>
</template>

<script setup lang="ts">
const props = defineProps<{
	name: string;
	username: string;
	commits: number;
	hasContributed: boolean;
	avatarSrc: string;
}>();

const open = defineModel<boolean>("open", { default: false });

const profileUrl = computed(() => `https://github.com/${props.username}`);
const cardLabel = computed(() => `${props.name} (@${props.username}) contributor details`);
const formattedCommits = computed(() =>
	new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(props.commits),
);
</script>
