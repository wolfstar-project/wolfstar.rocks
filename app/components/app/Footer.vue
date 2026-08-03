<template>
	<UFooter
		:ui="{
			root: 'p-2 content-visibility-auto bg-base-200',
			top: 'border-default',
		}"
		:aria-label="t('footer.site_footer')"
	>
		<template #top>
			<UContainer class="relative overflow-hidden">
				<!-- Decorative watermark: keep fully inside the padded brand area so overflow-hidden does not clip it -->
				<icons-wolfstar
					class="pointer-events-none absolute bottom-6 left-6 h-56 w-56 opacity-5"
					role="presentation"
					:aria-label="undefined"
					aria-hidden="true"
				/>
				<div
					class="relative grid grid-cols-1 gap-10 p-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"
				>
					<div>
						<div class="mb-3 flex items-center gap-3">
							<div
								class="w-10 rounded-full"
								role="img"
								:aria-label="t('footer.logo')"
							>
								<icons-wolfstar class="h-10 w-10" aria-hidden="true" />
							</div>
							<span class="font-bold">WolfStar</span>
						</div>
						<p class="max-w-70 text-sm leading-relaxed text-base-content/70">
							{{ t("footer.tagline") }}
						</p>
						<nav
							class="mt-4 flex items-center gap-1"
							:aria-label="t('footer.social_links')"
						>
							<UButton
								v-for="social of socialLinks"
								:key="social.label"
								:to="social.to"
								target="_blank"
								rel="noopener noreferrer"
								:icon="social.icon"
								:aria-label="social.ariaLabel"
								color="neutral"
								variant="ghost"
								size="sm"
							/>
						</nav>
						<div class="mt-6 flex flex-col items-start gap-3">
							<ClientOnly>
								<PwaInstallPrompt class="xl:hidden" />
							</ClientOnly>
							<UButton
								:label="t('footer.powered_by_netlify')"
								to="https://www.netlify.com"
								target="_blank"
								rel="noopener noreferrer"
								icon="simple-icons:netlify"
								color="neutral"
								variant="soft"
								:ui="{ leadingIcon: 'bg-success' }"
								:aria-label="t('footer.powered_by_netlify_aria')"
							/>
						</div>
					</div>
					<nav
						v-for="column of columns"
						:key="column.label"
						:aria-label="t('footer.column_links', { label: column.label })"
					>
						<div class="mb-4 text-xs font-bold tracking-wider text-muted uppercase">
							{{ column.label }}
						</div>
						<div class="flex flex-col gap-2.5">
							<NuxtLink
								v-for="link of column.children"
								:key="link.label"
								:to="link.to"
								class="text-sm text-base-content/70 link-hover"
							>
								{{ link.label }}
							</NuxtLink>
						</div>
					</nav>
				</div>
			</UContainer>
		</template>

		<template #left>
			<p class="text-sm text-base-content/80">
				{{ t("footer.copyright", { year: currentYear }) }}
			</p>
		</template>
		<template #right>
			<BuildEnvironment :footer="true" :buildInfo class="mr-2" />
			<!-- ClientOnly avoids Reka portal IDs that fail html-validator on prerender. -->
			<ClientOnly>
				<ULocaleSelect
					:model-value="locale"
					:locales="uiLocales"
					:aria-label="t('common.language')"
					:content="{ side: 'top', align: 'end', sideOffset: 8 }"
					size="sm"
					color="neutral"
					variant="ghost"
					class="min-w-28"
					:ui="{ content: 'min-w-fit' }"
					@update:model-value="selectLocale"
				/>
				<template #fallback>
					<div class="h-8 min-w-28" aria-hidden="true" />
				</template>
			</ClientOnly>
			<ColorModeButton />
		</template>
	</UFooter>
</template>

<script setup lang="ts">
import {
	cs,
	da,
	de,
	el,
	en,
	en_gb,
	es,
	fi,
	fr,
	hi,
	hr,
	hu,
	id,
	it,
	ko,
	lt,
	nl,
	pt,
	ro,
	ru,
	tr,
	uk,
} from "@nuxt/ui/locale";
import { isAppLocaleCode } from "~/utils/is-app-locale";
import { currentLocales } from "~~/config/i18n";

const { locale, setLocale, t } = useI18n();
const { setPreferredLocale } = usePreferredLocale();
const { buildInfo } = useAppConfig();
const { columns } = useFooter();

/** Map app locale codes → Nuxt UI locale packs (codes remapped to match i18n). */
const nuxtUiLocaleByCode: Record<string, typeof en> = {
	"cs": { ...cs, code: "cs" },
	"da": { ...da, code: "da" },
	"de": { ...de, code: "de" },
	"el": { ...el, code: "el" },
	"en-GB": { ...en_gb, code: "en-GB" },
	"en-US": { ...en, code: "en-US" },
	"es-419": { ...es, code: "es-419" },
	"es-ES": { ...es, code: "es-ES" },
	"fi": { ...fi, code: "fi" },
	"fr": { ...fr, code: "fr" },
	"hi": { ...hi, code: "hi" },
	"hr": { ...hr, code: "hr" },
	"hu": { ...hu, code: "hu" },
	"id": { ...id, code: "id" },
	"it": { ...it, code: "it" },
	"ko": { ...ko, code: "ko" },
	"lt": { ...lt, code: "lt" },
	"nl": { ...nl, code: "nl" },
	"pt-BR": { ...pt, code: "pt-BR" },
	"ro": { ...ro, code: "ro" },
	"ru": { ...ru, code: "ru" },
	"tr": { ...tr, code: "tr" },
	"uk": { ...uk, code: "uk" },
};

const uiLocales = currentLocales.map((appLocale) => {
	const pack = nuxtUiLocaleByCode[appLocale.code];
	if (pack) return pack;
	return Object.assign({}, en, {
		code: appLocale.code,
		name: appLocale.name ?? appLocale.code,
	});
});

function selectLocale(code: string) {
	if (!isAppLocaleCode(code)) return;
	setPreferredLocale(code);
	void setLocale(code);
}

const socialLinks = computed(() => [
	{
		ariaLabel: t("footer.github_aria"),
		icon: "simple-icons:github",
		label: t("footer.github"),
		to: "https://repo.wolfstar.rocks",
	},
	{
		ariaLabel: t("footer.discord_aria"),
		icon: "simple-icons:discord",
		label: t("footer.support_server"),
		to: "https://join.wolfstar.rocks",
	},
	{
		ariaLabel: t("footer.x_aria"),
		icon: "simple-icons:x",
		label: "X",
		to: "https://x.com/wolfstarapp",
	},
]);

// Use computed for year to ensure SSR consistency
const currentYear = computed(() => new Date().getFullYear());
</script>
