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
				<Avatar size="lg" class="size-18">
					<AvatarImage :src="thread.avatar" />
				</Avatar>
				<div class="mt-1.5 flex items-center gap-2">
					<h2 class="text-[1.625rem] leading-tight font-bold">{{ thread.name }}</h2>
					<MessageGroupBotTag :aria-label="ts('dashboard.dm.bot_tag')">
						{{ ts("dashboard.dm.bot_tag") }}
					</MessageGroupBotTag>
				</div>
				<p class="max-w-130 text-sm leading-normal text-toned">
					{{ ts("dashboard.dm.intro", { name: thread.name }) }}
					{{ ts(thread.introKey) }}
				</p>
			</div>

			<div v-if="status === 'pending'" class="flex flex-col gap-5 py-2">
				<div v-for="row in 3" :key="row" class="flex gap-4">
					<Skeleton class="size-10 shrink-0 rounded-full" />
					<div class="flex grow flex-col gap-2">
						<Skeleton class="h-4 w-40" />
						<Skeleton class="h-16 w-full max-w-130" />
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
				<Divider>{{ formatDay(group.day) }}</Divider>
				<article v-for="item of group.news" :key="item.id" class="group/post">
					<MessageGroup class="rounded-[4px] px-1">
						<MessageGroupAvatar>
							<Avatar>
								<AvatarImage :src="thread.avatar" />
							</Avatar>
						</MessageGroupAvatar>
						<MessageGroupBody class="min-w-0 grow">
							<MessageGroupHeader>
								<MessageGroupAuthor>{{ thread.name }}</MessageGroupAuthor>
								<MessageGroupBotTag :aria-label="ts('dashboard.dm.bot_tag')">
									{{ ts("dashboard.dm.bot_tag") }}
								</MessageGroupBotTag>
								<MessageGroupTime :datetime="item.at">
									{{ formatActivityTime(item.at, now, timeLocale) }}
								</MessageGroupTime>
								<a
									:href="item.url"
									target="_blank"
									rel="noopener noreferrer"
									:class="buttonVariants({ variant: 'link', size: 'sm' })"
									class="dm-open ms-auto"
								>
									{{ ts("dashboard.dm.open_in_discord") }}
								</a>
							</MessageGroupHeader>
							<MessageGroupContent v-if="item.content">
								<DashboardDiscordMarkdown :source="item.content" />
							</MessageGroupContent>
							<Embed
								v-for="(embed, index) of item.embeds"
								:key="index"
								:color="embed.color"
								class="mt-1.5"
							>
								<EmbedTitle v-if="embed.title">
									<a
										v-if="embed.url"
										:href="embed.url"
										target="_blank"
										rel="noopener noreferrer"
										class="hover:underline"
										>{{ embed.title }}</a
									>
									<template v-else>{{ embed.title }}</template>
								</EmbedTitle>
								<EmbedDescription v-if="embed.description">
									<DashboardDiscordMarkdown :source="embed.description" />
								</EmbedDescription>
								<img
									v-if="embed.image"
									:src="embed.image.url"
									:width="embed.image.width"
									:height="embed.image.height"
									alt=""
									loading="lazy"
									class="max-h-75 w-auto max-w-full rounded-[4px]"
								/>
							</Embed>
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
							<MessageGroupReactions
								v-if="item.reactions.length > 0"
								role="group"
								:aria-label="ts('dashboard.dm.reactions')"
							>
								<!-- Discord's counts, read-only: the dashboard cannot react as the reader. -->
								<span
									v-for="reaction of item.reactions"
									:key="reaction.name"
									role="img"
									:aria-label="
										tc('dashboard.dm.reaction', {
											count: reaction.count,
											emoji: reaction.name,
										})
									"
									:class="reactionVariants()"
									class="cursor-default hover:bg-newt-bg-surface"
								>
									<img
										v-if="reaction.image"
										:src="reaction.image"
										alt=""
										width="16"
										height="16"
										loading="lazy"
										class="size-4"
									/>
									<span v-else aria-hidden="true">{{ reaction.name }}</span>
									<span aria-hidden="true" class="text-xs font-semibold">{{
										reaction.count
									}}</span>
								</span>
							</MessageGroupReactions>
						</MessageGroupBody>
					</MessageGroup>
				</article>
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
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { buttonVariants } from "~/components/ui/button";
import { Divider } from "~/components/ui/divider";
import { Embed, EmbedDescription, EmbedTitle } from "~/components/ui/embed";
import {
	MessageGroup,
	MessageGroupAuthor,
	MessageGroupAvatar,
	MessageGroupBody,
	MessageGroupBotTag,
	MessageGroupContent,
	MessageGroupHeader,
	MessageGroupReactions,
	MessageGroupTime,
} from "~/components/ui/message-group";
import { reactionVariants } from "~/components/ui/reaction";
import { Skeleton } from "~/components/ui/skeleton";

/**
 * The open thread of the Home: a bot's posts, read-only, drawn with newt/ui's
 * Discord message parts. Opening it marks them read.
 */
const { ts, tc } = useI18n();
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

/* Shown on the post the pointer or focus is on, as Discord shows its actions. */
.dm-open {
	@apply opacity-0 group-hover/post:opacity-100 focus-visible:opacity-100;
}
</style>
