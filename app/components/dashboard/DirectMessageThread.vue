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
				<MessageGroup
					v-for="item of group.news"
					:key="item.id"
					as="article"
					class="group/post rounded-[4px] px-1"
				>
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
						<MessageGroupContent v-if="item.content">
							<Markdown
								:content="item.content.trim()"
								:heading-offset="postHeadingOffset(item.content)"
								:resolve-emoji="emojiURL"
								:locale="timeLocale"
								:labels="markdownLabels"
							/>
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
								<Markdown
									:content="embed.description.trim()"
									:heading-offset="postHeadingOffset(embed.description)"
									:resolve-emoji="emojiURL"
									:locale="timeLocale"
									:labels="markdownLabels"
								/>
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
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Divider } from "~/components/ui/divider";
import { Embed, EmbedDescription, EmbedTitle } from "~/components/ui/embed";
import { Markdown, type MarkdownLabels } from "~/components/ui/markdown";
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

// The words newt/ui's markdown writes itself, translated.
const markdownLabels = computed<Partial<MarkdownLabels>>(() => ({
	linkWarningBody: ts("dashboard.dm.markdown.link_warning_body"),
	linkWarningCancel: ts("dashboard.dm.markdown.link_warning_cancel"),
	linkWarningConfirm: ts("dashboard.dm.markdown.link_warning_confirm"),
	linkWarningTitle: ts("dashboard.dm.markdown.link_warning_title"),
	unknownChannel: ts("dashboard.dm.markdown.unknown_channel"),
	unknownRole: ts("dashboard.dm.markdown.unknown_role"),
	unknownUser: ts("dashboard.dm.markdown.unknown_user"),
}));

/** A server emoji's image on Discord's CDN: newt/ui fetches none itself. */
function emojiURL(emoji: { id: string; animated: boolean }): string {
	return `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "webp"}?size=48`;
}
const { thread, markRead, statusOf, reload } = useDirectMessages();
const { isPhone, screen } = usePhoneScreen();

const now = useNow({ scheduler: (cb) => useIntervalFn(cb, 60_000) });
const status = computed(() => (thread.value ? statusOf(thread.value) : "ready"));
const days = computed(() => groupNewsByDay(thread.value?.news ?? []));

function formatDay(day: string): string {
	return new Date(day).toLocaleDateString(locale.value, { dateStyle: "long" });
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
</style>
