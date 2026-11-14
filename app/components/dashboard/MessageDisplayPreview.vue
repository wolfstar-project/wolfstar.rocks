<template>
	<div class="message-preview" aria-hidden="true">
		<MessageGroup
			v-for="message in messages"
			:key="message.id"
			class="rounded-[4px] px-1"
			:class="compact && 'gap-2 py-0.5'"
		>
			<MessageGroupAvatar v-if="!compact">
				<Avatar>
					<AvatarImage :src="wolfstar.avatar" />
				</Avatar>
			</MessageGroupAvatar>
			<MessageGroupBody class="min-w-0 grow">
				<MessageGroupHeader :class="compact && 'mb-0'">
					<MessageGroupAuthor>{{ wolfstar.name }}</MessageGroupAuthor>
					<MessageGroupBotTag :aria-label="ts('dashboard.dm.bot_tag')">
						{{ ts("dashboard.dm.bot_tag") }}
					</MessageGroupBotTag>
					<MessageGroupTime :class="compact && 'order-first'">
						{{ message.time }}
					</MessageGroupTime>
				</MessageGroupHeader>
				<MessageGroupContent class="text-newt-text-message">{{
					message.text
				}}</MessageGroupContent>
			</MessageGroupBody>
		</MessageGroup>
	</div>
</template>

<script setup lang="ts">
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import {
	MessageGroup,
	MessageGroupAuthor,
	MessageGroupAvatar,
	MessageGroupBody,
	MessageGroupBotTag,
	MessageGroupContent,
	MessageGroupHeader,
	MessageGroupTime,
} from "~/components/ui/message-group";

/**
 * Two of WolfStar's messages, drawn as the Home draws its thread, to show what
 * a message display looks like before it is picked, as Discord's settings do.
 * Hidden from assistive technology: the radios above it say the same.
 */
const { compact } = defineProps<{
	compact: boolean;
}>();

const { ts } = useI18n();
const { timeLocale } = useAppLocale();
const { WolfStar: wolfstar } = useApp();

const messages = computed(() => {
	const time = (hours: number, minutes: number) =>
		new Date(2026, 0, 1, hours, minutes).toLocaleTimeString(timeLocale.value, {
			hour: "numeric",
			minute: "2-digit",
		});
	return [
		{ id: 1, text: ts("profile.message_display_preview.first"), time: time(14, 5) },
		{ id: 2, text: ts("profile.message_display_preview.second"), time: time(14, 6) },
	];
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.message-preview {
	@apply mt-4 flex flex-col gap-1 rounded-[8px] p-3;
	background-color: var(--console-input, var(--ink-500));
	border: 1px solid var(--home-border-subtle);
}
</style>
