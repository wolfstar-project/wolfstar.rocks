<template>
	<FeedbackModal v-model:open="isFeedbackOpen" />
	<UDropdownMenu
		:items="items"
		:content="{ align: 'center', collisionPadding: 12 }"
		:ui="{
			content: collapsed
				? 'w-48 bg-muted/90 border border-muted shadow-md rounded-md'
				: 'w-(--reka-dropdown-menu-trigger-width) bg-muted/90 border border-muted shadow-md rounded-md',
		}"
		:aria-label="ts('user_menu.account_menu')"
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
					? ts('header.user_menu')
					: ts('user_menu.user_menu_for', { name: user?.name ?? '' })
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

const { ts } = useI18n();
const { locale, locales, localeLabel, selectLocale } = useAppLocale();
const isFeedbackOpen = ref(false);
const { preference: colorModePreference, setColorMode } = useAppColorMode();
const { user: authUser, signOut } = useUserSession();

const user = computed(() => {
	const current = authUser.value;
	return {
		avatar: {
			alt: current?.name
				? ts("user_menu.avatar_alt", { name: current.name })
				: ts("user_menu.avatar_fallback"),
			src: current?.image ?? undefined,
		},
		name: current?.name,
	};
});

const languageChildren = computed<DropdownMenuItem[]>(() =>
	locales.value.map((entry) => ({
		checked: locale.value === entry.code,
		label: localeLabel(entry),
		onSelect(e: Event) {
			e.preventDefault();
			void selectLocale(entry.code);
		},
		onUpdateChecked(checked: boolean) {
			if (checked) void selectLocale(entry.code);
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
			label: ts("user_menu.profile"),
			to: "/profile",
		},
		{
			icon: "lucide:bug",
			label: ts("user_menu.report_bug"),
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
			label: ts("common.language"),
		},
		{
			children: [
				{
					checked: colorModePreference.value === "system",
					icon: "lucide:monitor",
					label: ts("common.system"),
					onSelect(e: Event) {
						e.preventDefault();
						setColorMode("system");
					},
					onUpdateChecked(checked: boolean) {
						if (checked) setColorMode("system");
					},
					type: "checkbox",
				},
				{
					checked: colorModePreference.value === "light",
					icon: "lucide:sun",
					label: ts("common.light"),
					onSelect(e: Event) {
						e.preventDefault();
						setColorMode("light");
					},
					onUpdateChecked(checked: boolean) {
						if (checked) setColorMode("light");
					},
					type: "checkbox",
				},
				{
					checked: colorModePreference.value === "dark",
					icon: "lucide:moon",
					label: ts("common.dark"),
					onSelect(e: Event) {
						e.preventDefault();
						setColorMode("dark");
					},
					onUpdateChecked(checked: boolean) {
						if (checked) setColorMode("dark");
					},
					type: "checkbox",
				},
				{
					checked: colorModePreference.value === "midnight",
					icon: "lucide:sparkles",
					label: ts("common.midnight_experimental"),
					onSelect(e: Event) {
						e.preventDefault();
						setColorMode("midnight");
					},
					onUpdateChecked(checked: boolean) {
						if (checked) setColorMode("midnight");
					},
					type: "checkbox",
				},
			],
			icon: "lucide:sun-moon",
			label: ts("common.appearance"),
		},
	],
	[
		{
			icon: "lucide:log-out",
			label: ts("user_menu.sign_out"),
			async onSelect(e: Event) {
				e.preventDefault();
				// `auth.redirects.logout` in nuxt.config sends the user home afterwards.
				await signOut();
			},
		},
	],
]);
</script>
