<template>
	<UDropdownMenu
		:items="items"
		:content="{ align: 'center', collisionPadding: 12 }"
		:ui="{
			content: collapsed
				? 'w-48 bg-base-200/60 border border-base-200 shadow-md rounded-md'
				: 'w-(--reka-dropdown-menu-trigger-width) bg-base-200/60 border border-base-200 shadow-md rounded-md',
		}"
		aria-label="User account menu"
	>
		<UButton
			v-bind="{
				...user,
				label: collapsed ? undefined : user?.name,
				trailingIcon: collapsed ? undefined : 'lucide:chevrons-up-down',
			}"
			color="primary"
			variant="ghost"
			block
			:square="collapsed"
			class="data-[state=open]:bg-primary/10"
			:ui="{
				trailingIcon: 'text-dimmed',
			}"
			:aria-label="collapsed ? 'User menu' : `User menu for ${user?.name}`"
			aria-haspopup="true"
		/>
	</UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const { collapsed } = defineProps<{
	collapsed?: boolean;
}>();

const colorMode = useColorMode();
const { user: authUser, clear } = useAuth();

const src = computed(() => avatarURL(authUser.value!, { size: 64 }));

const user = ref({
	avatar: {
		alt: authUser.value?.name ? `${authUser.value.name}'s avatar` : "User avatar",
		src: src.value,
	},
	name: authUser.value?.name,
});

const items = computed<DropdownMenuItem[][]>(() => [
	[
		{
			avatar: user.value.avatar,
			label: user.value?.name,
			type: "label",
		},
	],
	[
		{
			icon: "lucide:user",
			label: "Profile",
			to: "/profile",
		},
	],
	[
		{
			children: [
				{
					checked: colorMode.value === "light",
					icon: "lucide:sun",
					label: "Light",
					onSelect(e: Event) {
						e.preventDefault();

						colorMode.preference = "light";
					},
					type: "checkbox",
				},
				{
					checked: colorMode.value === "dark",
					icon: "lucide:moon",
					label: "Dark",
					onSelect(e: Event) {
						e.preventDefault();
					},
					onUpdateChecked(checked: boolean) {
						if (checked) {
							colorMode.preference = "dark";
						}
					},
					type: "checkbox",
				},
			],
			icon: "lucide:sun-moon",
			label: "Appearance",
		},
	],
	[
		{
			icon: "lucide:log-out",
			label: "Log out",
			async onSelect(e: Event) {
				e.preventDefault();
				await clear();
				await navigateTo("/");
			},
		},
	],
]);
</script>
