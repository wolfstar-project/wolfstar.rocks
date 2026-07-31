<template>
	<div
		class="mt-2 rounded-md bg-base-200 px-2 pt-2 pb-2 font-whitney text-base-content drop-shadow-lg sm:px-4 sm:pb-4"
	>
		<span class="text-xs font-extrabold uppercase">You've been invited to join a server</span>
		<div class="mt-2 flex">
			<div
				class="h-8 w-8 sm:h-12 sm:w-12 flex flex-none items-center justify-center overflow-hidden rounded-full select-none"
			>
				<NuxtImg
					src="/avatars/wolfstar.png"
					alt="WolfStar Lounge server icon"
					width="48"
					height="48"
					loading="lazy"
					decoding="async"
				/>
			</div>
			<div class="ml-4 grow">
				<nuxt-link class="font-bold" :to="link">WolfStar Lounge</nuxt-link>
				<div class="flex flex-row items-center">
					<span
						class="mr-1 h-1.5 w-1.5 bg-success sm:h-2 sm:w-2 inline-block rounded-full"
					></span>
					<span>{{ online.toLocaleString() }} Online</span>

					<span
						class="mr-1 ml-2 h-1.5 w-1.5 bg-base-content/80 sm:h-2 sm:w-2 md:ml-4 inline-block rounded-full"
					></span>
					<span>{{ members.toLocaleString() }} Members</span>
				</div>
			</div>
			<div>
				<StarButton :to="link" color="error" size="sm" class="sm:text-base"
					>Join</StarButton
				>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
interface InviteProps {
	link: string;
	online?: number;
	members?: number;
}
</script>

<script setup lang="ts">
const { link, online = 0, members = 0 } = defineProps<InviteProps>();
</script>
