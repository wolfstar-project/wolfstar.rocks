<template>
	<StarFooter
		:ui="{
			root: 'p-2 content-visibility-auto bg-base-200',
			top: 'border-default',
		}"
		:aria-label="t('footer.site_footer')"
	>
		<template #top>
			<StarContainer class="relative overflow-hidden">
				<!-- Decorative watermark: keep fully inside the padded brand area so overflow-hidden does not clip it -->
				<icons-wolfstar
					class="bottom-6 left-6 h-56 w-56 pointer-events-none absolute opacity-5"
					role="presentation"
					:aria-label="undefined"
					aria-hidden="true"
				/>
				<div
					class="gap-10 p-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] relative grid grid-cols-1"
				>
					<div>
						<div class="mb-3 gap-3 flex items-center">
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
							class="mt-4 gap-1 flex items-center"
							:aria-label="t('footer.social_links')"
						>
							<StarButton
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
						<div class="mt-6 gap-3 flex flex-col items-start">
							<ClientOnly>
								<PwaInstallPrompt class="xl:hidden" />
							</ClientOnly>
							<StarButton
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
						<div class="gap-2.5 flex flex-col">
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
			</StarContainer>
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
				<StarLocaleSelect
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
	</StarFooter>
</template>

<script setup lang="ts">
import { isAppLocaleCode } from "~/utils/is-app-locale";
import { currentLocales } from "~~/config/i18n";

const { locale, setLocale, t } = useI18n();
const { setPreferredLocale } = usePreferredLocale();
const { buildInfo } = useAppConfig();
const { columns } = useFooter();

const uiLocales = currentLocales.map((appLocale) => ({
	code: appLocale.code,
	name: appLocale.name ?? appLocale.code,
}));

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
