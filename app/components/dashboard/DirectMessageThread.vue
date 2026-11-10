<template>
	<div v-if="thread" class="dm-thread">
		<div
			ref="log"
			role="log"
			class="dm-log"
			:aria-label="ts('dashboard.dm.log_aria', { name: thread.name })"
			:aria-busy="status === 'pending'"
		>
			<div class="flex flex-col items-start gap-1.5 pt-2 pb-5">
				<UAvatar :src="thread.avatar" alt="" size="3xl" class="size-18" />
				<div class="mt-1.5 flex items-center gap-2">
					<h2 class="text-[1.625rem] leading-tight font-bold">{{ thread.name }}</h2>
					<UBadge :label="ts('dashboard.dm.bot_tag')" size="sm" class="font-bold" />
				</div>
				<p class="max-w-130 text-sm leading-normal text-toned">
					{{ ts("dashboard.dm.intro", { name: thread.name }) }}
					{{ ts(thread.introKey) }}
				</p>
			</div>

			<div v-if="status === 'pending'" class="flex flex-col gap-5 py-2">
				<div v-for="row in 3" :key="row" class="flex gap-3.5">
					<USkeleton class="size-10 shrink-0 rounded-full" />
					<div class="flex grow flex-col gap-2">
						<USkeleton class="h-4 w-40" />
						<USkeleton class="h-16 w-full max-w-130" />
					</div>
				</div>
			</div>

			<UAlert
				v-else-if="status === 'error'"
				color="error"
				variant="subtle"
				icon="ic:round-error-outline"
				:title="ts('dashboard.dm.load_failed')"
				:actions="[
					{
						label: ts('common.retry'),
						color: 'error',
						variant: 'outline',
						onClick: () => reload(thread!.id),
					},
				]"
			/>

			<template v-for="group of days" v-else :key="group.day">
				<USeparator
					:label="formatDay(group.day)"
					class="mt-2.5 mb-3.5"
					:ui="{ label: 'font-mono text-[0.6875rem] font-semibold text-muted' }"
				/>
				<UChatMessage
					v-for="item of group.news"
					:id="item.id"
					:key="item.id"
					as="article"
					role="assistant"
					:parts="[]"
					variant="naked"
					side="left"
					:avatar="{ src: thread.avatar, alt: '' }"
					:ui="{ root: 'py-1.5', content: 'w-full min-w-0' }"
				>
					<template #actions>
						<UButton
							:to="item.url"
							target="_blank"
							icon="ic:round-open-in-new"
							color="neutral"
							variant="ghost"
							size="sm"
							:aria-label="ts('dashboard.dm.open_in_discord')"
						/>
					</template>
					<template #content>
						<p class="flex flex-wrap items-center gap-2">
							<span class="text-[0.9375rem] font-semibold">{{ thread.name }}</span>
							<UBadge
								:label="ts('dashboard.dm.bot_tag')"
								size="sm"
								class="font-bold"
							/>
							<time :datetime="item.at" class="font-mono text-[0.6875rem] text-muted">
								{{ formatActivityTime(item.at, now, timeLocale) }}
							</time>
						</p>
						<DashboardDiscordMarkdown
							v-if="item.content"
							:source="item.content"
							class="mt-0.5"
						/>
						<UCard
							v-for="(embed, index) of item.embeds"
							:key="index"
							variant="subtle"
							class="dm-embed"
							:style="{
								borderInlineStartColor: embed.color ?? 'var(--ui-border-accented)',
							}"
							:ui="{ body: 'p-3 sm:p-3.5' }"
						>
							<p v-if="embed.title" class="text-[0.9375rem] font-bold">
								<ULink
									v-if="embed.url"
									:to="embed.url"
									external
									target="_blank"
									class="text-primary hover:underline"
									>{{ embed.title }}</ULink
								>
								<template v-else>{{ embed.title }}</template>
							</p>
							<DashboardDiscordMarkdown
								v-if="embed.description"
								:source="embed.description"
								class="mt-1.5 text-toned"
							/>
							<img
								v-if="embed.image"
								:src="embed.image.url"
								:width="embed.image.width"
								:height="embed.image.height"
								alt=""
								loading="lazy"
								class="mt-3 max-h-75 w-auto max-w-full rounded-md"
							/>
						</UCard>
						<img
							v-for="image of item.images"
							:key="image.url"
							:src="image.url"
							:width="image.width"
							:height="image.height"
							alt=""
							loading="lazy"
							class="mt-1.5 max-h-87.5 w-auto max-w-full rounded-md"
						/>
						<ul
							v-if="item.reactions.length > 0"
							class="mt-1.5 flex flex-wrap gap-1.5"
							:aria-label="ts('dashboard.dm.reactions')"
						>
							<li v-for="reaction of item.reactions" :key="reaction.name">
								<UBadge color="neutral" variant="outline" size="lg" class="gap-1.5">
									<img
										v-if="reaction.image"
										:src="reaction.image"
										:alt="`:${reaction.name}:`"
										width="16"
										height="16"
										class="size-4"
									/>
									<span v-else>{{ reaction.name }}</span>
									<span class="font-semibold">{{ reaction.count }}</span>
								</UBadge>
							</li>
						</ul>
					</template>
				</UChatMessage>
			</template>
		</div>

		<div class="flex shrink-0 flex-col gap-2 px-4 pb-4">
			<slot name="notice"></slot>
			<UAlert
				color="neutral"
				variant="soft"
				icon="ic:round-warning"
				:description="ts('dashboard.dm.no_reply', { name: thread.name })"
				:ui="{ description: 'text-sm text-muted' }"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
/**
 * The open thread of the Home: a bot's posts, read-only. Opening it marks
 * them read.
 */
const { ts } = useI18n();
const { locale, timeLocale } = useAppLocale();
const { thread, markRead, statusOf, reload } = useDirectMessages();

const now = useNow({ scheduler: (cb) => useIntervalFn(cb, 60_000) });
const status = computed(() => (thread.value ? statusOf(thread.value) : "ready"));
const days = computed(() => groupNewsByDay(thread.value?.news ?? []));

function formatDay(day: string): string {
	return new Date(day).toLocaleDateString(locale.value, { dateStyle: "long" });
}

const log = useTemplateRef<HTMLElement>("log");

// A thread opens on its newest post, as a conversation does, and is read.
function openNewest() {
	if (!thread.value) return;
	markRead(thread.value);
	if (log.value) log.value.scrollTop = log.value.scrollHeight;
}

onMounted(openNewest);
watch(() => [thread.value?.id, thread.value?.news.length], openNewest, { flush: "post" });
</script>

<style scoped>
@reference "@/assets/css/main.css";

.dm-thread {
	@apply flex min-h-0 flex-1 flex-col;
}

.dm-log {
	@apply min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6;
}

.dm-embed {
	@apply mt-1.5 max-w-130 rounded-[4px] border-s-4;
}
</style>
