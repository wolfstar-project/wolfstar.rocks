<template>
	<Invite class="mt-2">
		<InviteEyebrow>You've been invited to join a server</InviteEyebrow>
		<InviteBody>
			<InviteIcon
				:as="NuxtImg"
				src="/avatars/wolfstar.png"
				alt="WolfStar Lounge server icon"
				width="48"
				height="48"
				loading="lazy"
				decoding="async"
				class="rounded-full"
			/>
			<InviteInfo>
				<InviteName :as="NuxtLink" :href="link">WolfStar Lounge</InviteName>
				<InviteCounts>
					<InviteCount online>{{ online.toLocaleString() }} Online</InviteCount>
					<InviteCount>{{ members.toLocaleString() }} Members</InviteCount>
				</InviteCounts>
			</InviteInfo>
			<Button :as="NuxtLink" :href="link" variant="success" size="sm">Join</Button>
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
import { NuxtLink } from "#components";
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

// The `as` prop takes a component, and `#components` types NuxtImg as a generic one.
const NuxtImg = resolveComponent("NuxtImg");

const { link, online = 0, members = 0 } = defineProps<InviteProps>();
</script>
