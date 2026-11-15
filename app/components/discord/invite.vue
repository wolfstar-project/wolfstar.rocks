<template>
	<Invite class="mt-2">
		<InviteEyebrow>You've been invited to join a server</InviteEyebrow>
		<InviteBody>
			<InviteIcon
				src="/avatars/wolfstar.png"
				alt="WolfStar Lounge server icon"
				width="48"
				height="48"
				loading="lazy"
				decoding="async"
				class="rounded-full"
			/>
			<InviteInfo>
				<InviteName :href="link">WolfStar Lounge</InviteName>
				<InviteCounts>
					<InviteCount online>{{ online.toLocaleString() }} Online</InviteCount>
					<InviteCount>{{ members.toLocaleString() }} Members</InviteCount>
				</InviteCounts>
			</InviteInfo>
			<Button :href="link" variant="success" size="sm">Join</Button>
		</InviteBody>
	</Invite>
</template>

<script lang="ts">
interface InviteProps {
	link: string;
	online?: number;
	members?: number;
}
</script>

<script setup lang="ts">
import { Button } from "~/components/ui/button";
import {
	Invite,
	InviteBody,
	InviteCount,
	InviteCounts,
	InviteEyebrow,
	InviteIcon,
	InviteInfo,
	InviteName,
} from "~/components/ui/invite";

const { link, online = 0, members = 0 } = defineProps<InviteProps>();
</script>
