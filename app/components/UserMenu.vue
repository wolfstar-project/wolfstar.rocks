<template>
	<FeedbackModal v-model:open="isFeedbackOpen" />
	<UDropdownMenu
		:items="items"
		:content="{ align: 'center', collisionPadding: 12 }"
		:ui="{
			content: collapsed
				? 'w-48 bg-base-200/90 border border-base-200 shadow-md rounded-md'
				: 'w-(--reka-dropdown-menu-trigger-width) bg-base-200/90 border border-base-200 shadow-md rounded-md',
		}"
		:aria-label="t('user_menu.account_menu')"
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
			:aria-label="
				collapsed
					? t('header.user_menu')
					: t('user_menu.user_menu_for', { name: user?.name ?? '' })
			"
			aria-haspopup="true"
		/>
	</UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const { collapsed } = defineProps<{
	collapsed?: boolean;
}>();

const { t, locale, locales, setLocale } = useI18n();
const { setPreferredLocale } = usePreferredLocale();
const isFeedbackOpen = ref(false);
const colorMode = useColorMode();
const { user: authUser, signOut } = useUserSession();

const src = computed(() => authUser.value?.image ?? undefined);

const user = ref({
	avatar: {
		alt: authUser.value?.name
			? t("user_menu.avatar_alt", { name: authUser.value.name })
			: t("user_menu.avatar_fallback"),
		src: src.value,
	},
	name: authUser.value?.name,
});

const languageChildren = computed<DropdownMenuItem[]>(() =>
	locales.value.map((entry) => ({
		checked: locale.value === entry.code,
		label: entry.name ?? entry.code,
		onSelect(e: Event) {
			e.preventDefault();
			setPreferredLocale(entry.code);
			void setLocale(entry.code);
		},
		onUpdateChecked(checked: boolean) {
			if (checked) {
				setPreferredLocale(entry.code);
				void setLocale(entry.code);
			}
		},
		type: "checkbox" as const,
	})),
);

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
			label: t("user_menu.profile"),
			to: "/profile",
		},
		{
			icon: "lucide:bug",
			label: t("user_menu.report_bug"),
			onSelect(e: Event) {
				e.preventDefault();
				isFeedbackOpen.value = true;
			},
		},
	],
	[
		{
			children: languageChildren.value,
			icon: "lucide:languages",
			label: t("common.language"),
		},
		{
			children: [
				{
					checked: colorMode.value === "light",
					icon: "lucide:sun",
					label: t("common.light"),
					onSelect(e: Event) {
						e.preventDefault();

						colorMode.preference = "light";
					},
					type: "checkbox",
				},
				{
					checked: colorMode.value === "dark",
					icon: "lucide:moon",
					label: t("common.dark"),
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
			label: t("common.appearance"),
		},
	],
	[
		{
			icon: "lucide:log-out",
			label: t("user_menu.sign_out"),
			async onSelect(e: Event) {
				e.preventDefault();
				await signOut();
				await navigateTo("/");
			},
		},
	],
]);
</script>
