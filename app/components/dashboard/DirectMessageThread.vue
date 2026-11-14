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
					<MessageGroupBotTag class="dm-app-tag" :aria-label="ts('dashboard.dm.bot_tag')">
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
				<MessageGroup
					v-for="(item, index) of group.news"
					:key="item.id"
					as="article"
					class="group/post relative rounded-[4px] px-1"
					:class="[
						compact && 'gap-2 py-0.5',
						isContinued(group.news, index) ? 'py-0.5' : !compact && index > 0 && 'mt-3',
					]"
				>
					<!-- Compact, as Discord's: no avatar, the time ahead of the name. -->
					<template v-if="!compact">
						<!-- A post that joins the one before it: its time in the margin. -->
						<MessageGroupTime
							v-if="isContinued(group.news, index)"
							:datetime="item.at"
							class="dm-margin-time"
						>
							{{ formatClock(item.at) }}
						</MessageGroupTime>
						<MessageGroupAvatar v-else>
							<Avatar>
								<AvatarImage :src="thread.avatar" />
							</Avatar>
						</MessageGroupAvatar>
					</template>
					<MessageGroupBody class="min-w-0 grow">
						<Button
							v-if="isContinued(group.news, index)"
							:href="item.url"
							target="_blank"
							rel="noopener noreferrer"
							variant="link"
							size="sm"
							class="dm-open dm-open-floating"
						>
							{{ ts("dashboard.dm.open_in_discord") }}
						</Button>
						<MessageGroupHeader v-else :class="compact && 'mb-0'">
							<MessageGroupAuthor class="text-base font-medium">
								{{ thread.author ?? thread.name }}
							</MessageGroupAuthor>
							<MessageGroupBotTag
								class="dm-app-tag"
								:aria-label="ts('dashboard.dm.bot_tag')"
							>
								{{ ts("dashboard.dm.bot_tag") }}
							</MessageGroupBotTag>
							<MessageGroupTime
								:datetime="item.at"
								class="text-xs"
								:class="compact && 'order-first'"
							>
								{{ formatActivityTime(item.at, now, timeLocale) }}
							</MessageGroupTime>
							<Button
								:href="item.url"
								target="_blank"
								rel="noopener noreferrer"
								variant="link"
								size="sm"
								class="dm-open ms-auto"
							>
								{{ ts("dashboard.dm.open_in_discord") }}
							</Button>
						</MessageGroupHeader>
						<MessageGroupContent v-if="item.content" class="text-base leading-[1.375]">
							<DashboardPostMarkdown :source="item.content" />
						</MessageGroupContent>
						<template v-for="(part, index) of item.components" :key="index">
							<DiscordV2Container
								v-if="part.kind === 'container'"
								:accent-color="part.accent"
							>
								<DashboardPostBlock
									v-for="(block, blockIndex) of part.components"
									:key="blockIndex"
									:block
								/>
							</DiscordV2Container>
							<DashboardPostBlock v-else :block="part" class="mt-1.5" />
						</template>
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
								<DashboardPostMarkdown :source="embed.description" />
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
						<AppInvite v-for="app of item.apps" :key="app.id" class="mt-1.5">
							<AppInviteBanner v-if="app.cover" :src="app.cover" />
							<AppInviteBody>
								<AppInviteHeader>
									<AppInviteIcon v-if="app.icon" :src="app.icon" />
									<AppInviteInfo>
										<AppInviteName>{{ app.name }}</AppInviteName>
										<AppInviteDescription v-if="app.description">
											{{ app.description }}
										</AppInviteDescription>
									</AppInviteInfo>
								</AppInviteHeader>
								<Button
									:href="app.url"
									target="_blank"
									rel="noopener noreferrer"
									variant="secondary"
									class="w-full justify-center"
								>
									{{ ts("dashboard.dm.app_invite", { name: app.name }) }}
								</Button>
							</AppInviteBody>
						</AppInvite>
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
							<Reaction
								v-for="reaction of item.reactions"
								:key="reaction.image ?? reaction.name"
								readonly
								:emoji="reaction.image ? undefined : reaction.name"
								:emoji-src="reaction.image"
								:emoji-alt="reaction.name"
								:count="reaction.count"
								:aria-label="
									tc('dashboard.dm.reaction', {
										count: reaction.count,
										emoji: reaction.name,
									})
								"
							/>
						</MessageGroupReactions>
					</MessageGroupBody>
				</MessageGroup>
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
import type { Announcement } from "#shared/types/announcement";
import {
	AppInvite,
	AppInviteBanner,
	AppInviteBody,
	AppInviteDescription,
	AppInviteHeader,
	AppInviteIcon,
	AppInviteInfo,
	AppInviteName,
} from "~/components/ui/app-invite";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
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
import { Reaction } from "~/components/ui/reaction";
import { Skeleton } from "~/components/ui/skeleton";

/**
 * The open thread of the Home: a bot's posts, read-only, drawn with newt/ui's
 * Discord message parts. Opening it marks them read.
 */
const { ts, tc } = useI18n();
const { locale, timeLocale } = useAppLocale();
const { thread, markRead, statusOf, reload } = useDirectMessages();
const { isPhone, screen } = usePhoneScreen();
// The message display the reader picked in the preferences, as Discord's.
const messageDisplay = useLogDensity();
const compact = computed(() => messageDisplay.value === "compact");

const now = useNow({ scheduler: (cb) => useIntervalFn(cb, 60_000) });
const status = computed(() => (thread.value ? statusOf(thread.value) : "ready"));
const days = computed(() => groupNewsByDay(thread.value?.news ?? []));

function formatDay(day: string): string {
	return new Date(day).toLocaleDateString(locale.value, { dateStyle: "long" });
}

/** The hour and minute alone, for the margin of a post that joins another. */
function formatClock(at: string): string {
	return new Date(at).toLocaleTimeString(timeLocale.value, {
		hour: "2-digit",
		minute: "2-digit",
	});
}

/** Compact posts each keep their own line of time and name, as Discord's. */
function isContinued(news: readonly Announcement[], index: number): boolean {
	const item = news[index];
	return !compact.value && item !== undefined && continuesPost(news[index - 1], item);
}

const log = useTemplateRef<HTMLElement>("log");

// A thread opens on its newest post, as a conversation does, and is read. A
// phone's list keeps the thread mounted but hidden: it is read once shown.
function openNewest() {
	if (!thread.value || (isPhone.value && screen.value !== "page")) return;
	markRead(thread.value);
	if (log.value) log.value.scrollTop = log.value.scrollHeight;
}

onMounted(openNewest);
// The screen and the width both decide whether the thread is shown.
watch(
	() => [thread.value?.id, thread.value?.news.length, screen.value, isPhone.value],
	openNewest,
	{
		flush: "post",
	},
);
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

/* A joined post has no line of its own for the link: it floats over the
   post's top edge, where Discord puts a message's actions. */
.dm-open-floating {
	@apply absolute end-2 -top-3 z-1 rounded-md border border-solid border-newt-border bg-newt-bg-floating px-2 shadow-sm;
}

/* The time of a joined post, in the avatar's column, shown as the link is.
   The column keeps the avatar's width so the text stays aligned; a 12-hour
   time ("12:04 PM") is wider, so it stays on one line and spills evenly to
   both sides, as Discord's does. */
.dm-margin-time {
	@apply flex w-10 shrink-0 justify-center pt-1 leading-5.5 whitespace-nowrap opacity-0 group-focus-within/post:opacity-100 group-hover/post:opacity-100;
}

/* Discord's tag: a little taller than the registry's, its corners rounder. */
.dm-app-tag {
	@apply h-4.5 self-center rounded-[4px] px-1.25 py-0 text-xs leading-none font-bold;
}

/* A Components V2 container as Discord draws it in a channel: a raised
   surface with a hairline border, the accent down its start edge, and the
   size of a message's text. */
.dm-log :deep(.discord-v2-container) {
	@apply max-w-190 gap-2 rounded-lg p-4 text-base leading-[1.375];
	border: 1px solid var(--newt-border);
	background-color: var(--newt-bg-elevated);
}

.dm-log :deep(.discord-v2-container-accented) {
	border-inline-start: 4px solid var(--discord-v2-container-accent);
}

.dm-log :deep(.discord-v2-separator-line) {
	border-color: var(--newt-border);
}
</style>
