<template>
	<section class="console-card" :aria-labelledby="headingId">
		<div class="flex items-center gap-3">
			<h3 :id="headingId" class="text-[1.0625rem] font-semibold whitespace-nowrap">
				{{ ts("guild_settings.general.transfer.title") }}
			</h3>
			<span class="h-px flex-1 bg-base-content/15" aria-hidden="true"></span>
		</div>
		<p class="mt-3 max-w-prose text-[0.8125rem] text-muted">
			{{ ts("guild_settings.general.transfer.description") }}
		</p>

		<div class="mt-4 flex flex-wrap items-center gap-2.5">
			<UButton
				color="neutral"
				variant="outline"
				class="dialog-cancel"
				icon="ic:round-file-download"
				:loading="isExporting"
				:disabled="!activeGuildId || isReading"
				@click="exportFile"
			>
				{{ ts("guild_settings.general.transfer.export") }}
			</UButton>
			<UButton
				color="neutral"
				variant="outline"
				class="dialog-cancel"
				icon="ic:round-file-upload"
				:loading="isReading"
				:disabled="!activeGuildId || hasUnsavedChanges || isExporting"
				aria-describedby="settings-import-note"
				@click="fileInput?.click()"
			>
				{{ ts("guild_settings.general.transfer.import") }}
			</UButton>
			<p v-if="hasUnsavedChanges" id="settings-import-note" class="text-xs text-warning">
				{{ ts("guild_settings.general.transfer.unsaved") }}
			</p>
		</div>
		<input
			ref="fileInput"
			type="file"
			accept="application/json,.json"
			class="hidden"
			tabindex="-1"
			aria-hidden="true"
			@change="onFileChosen"
		/>

		<UModal
			:open="review !== null"
			:title="
				review?.result.ok === false
					? ts('guild_settings.general.transfer.refused_title')
					: ts('guild_settings.general.transfer.review_title')
			"
			:description="
				review?.result.ok === false
					? ts('guild_settings.general.transfer.refused_description', {
							file: review?.fileName ?? '',
						})
					: ts('guild_settings.general.transfer.review_description', {
							file: review?.fileName ?? '',
						})
			"
			:dismissible="!isImporting"
			@update:open="!$event && closeReview()"
		>
			<template #body>
				<ul
					v-if="review?.result.ok === false"
					class="space-y-2 text-sm"
					:aria-label="ts('guild_settings.general.transfer.issues_aria')"
				>
					<li v-for="issue in review.result.issues" :key="issue.path + issue.message">
						<code v-if="issue.path" class="font-mono text-xs text-toned">{{
							issue.path
						}}</code>
						<span class="block text-error">{{ issue.message }}</span>
					</li>
				</ul>

				<div v-else-if="preview" class="space-y-5 text-sm">
					<p v-if="preview.isEmpty" class="text-toned">
						{{ ts("guild_settings.general.transfer.nothing") }}
					</p>

					<section v-if="preview.settings.length > 0">
						<h4 class="mb-2 font-semibold">
							{{
								ts("guild_settings.general.transfer.settings_heading", {
									count: preview.settings.length,
								})
							}}
						</h4>
						<ul class="space-y-1.5">
							<li
								v-for="change in preview.settings"
								:key="change.name"
								class="flex flex-wrap items-baseline gap-x-2"
							>
								<code class="font-mono text-xs text-toned">{{ change.name }}</code>
								<span class="text-muted">{{ formatValue(change.before) }}</span>
								<UIcon
									name="ic:round-arrow-forward"
									class="size-3.5 text-muted"
									aria-hidden="true"
								/>
								<span class="sr-only">{{
									ts("guild_settings.general.transfer.becomes")
								}}</span>
								<span class="font-semibold">{{ formatValue(change.after) }}</span>
							</li>
						</ul>
					</section>

					<section v-if="rulesSummary.length > 0">
						<h4 class="mb-2 font-semibold">
							{{ ts("guild_settings.general.transfer.rules_heading") }}
						</h4>
						<ul class="space-y-1.5">
							<li v-for="line in rulesSummary" :key="line.key">
								<span :class="line.tone">{{ line.label }}</span>
								<span class="text-muted"> {{ line.names }}</span>
							</li>
						</ul>
						<p
							v-if="preview.rules && preview.rules.removed.length > 0"
							class="mt-2 text-xs text-warning"
						>
							{{ ts("guild_settings.general.transfer.rules_warning") }}
						</p>
					</section>

					<p v-if="preview.unsupported.length > 0" class="text-xs text-muted">
						{{
							ts("guild_settings.general.transfer.unsupported", {
								names: preview.unsupported.join(", "),
							})
						}}
					</p>
				</div>
			</template>
			<template #footer>
				<div class="flex w-full justify-end gap-2">
					<UButton
						color="neutral"
						variant="outline"
						class="dialog-cancel"
						:disabled="isImporting"
						@click="closeReview"
					>
						{{ ts("guild_settings.general.transfer.cancel") }}
					</UButton>
					<UButton
						v-if="preview && !preview.isEmpty"
						color="primary"
						:loading="isImporting"
						@click="confirmImport"
					>
						{{ ts("guild_settings.general.transfer.confirm") }}
					</UButton>
				</div>
			</template>
		</UModal>
	</section>
</template>

<script setup lang="ts">
import type { GuildData } from "#server/database";
import {
	ConfigurationFileName,
	MaximumConfigurationFileSize,
	type ConfigurationImportResponse,
	type ConfigurationPreview,
} from "#shared/utils/settings-transfer";

const { ts } = useI18n();
const toast = useToast();
const { activeGuildId } = useActiveGuild();
const { setGuildSettings } = useGuildSettings();
const { guildSettingsChanges } = useGuildSettingsChanges();

const headingId = useId();
const fileInput = useTemplateRef<HTMLInputElement>("fileInput");

// The settings of an import land on top of the draft otherwise, hiding what the
// file changed behind what the admin has not saved yet.
const hasUnsavedChanges = computed(() => Object.keys(guildSettingsChanges.value ?? {}).length > 0);

const isExporting = ref(false);
const isReading = ref(false);
const isImporting = ref(false);

interface Review {
	guildId: string;
	fileName: string;
	text: string;
	result: ConfigurationImportResponse;
}
const review = ref<Review | null>(null);
const preview = computed<ConfigurationPreview | null>(() =>
	review.value?.result.ok ? review.value.result.preview : null,
);

function closeReview() {
	if (!isImporting.value) review.value = null;
}

async function exportFile() {
	const guildId = activeGuildId.value;
	if (!guildId) return;

	isExporting.value = true;
	try {
		const file = await $fetch<unknown>(`/api/guilds/${guildId}/settings/export`);
		const url = URL.createObjectURL(
			new Blob([JSON.stringify(file, null, "\t")], { type: "application/json" }),
		);
		const link = document.createElement("a");
		link.href = url;
		link.download = ConfigurationFileName;
		link.click();
		URL.revokeObjectURL(url);
		toast.add({ title: ts("guild_settings.general.transfer.exported"), color: "success" });
	} catch {
		toast.add({ title: ts("guild_settings.general.transfer.export_failed"), color: "error" });
	} finally {
		isExporting.value = false;
	}
}

function importRequest(guildId: string, text: string, apply: boolean) {
	return $fetch<ConfigurationImportResponse>(`/api/guilds/${guildId}/settings/import`, {
		method: "POST",
		body: { text, apply },
	});
}

async function onFileChosen(event: Event) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	// The same file can be chosen again after a change of the server:
	input.value = "";
	const guildId = activeGuildId.value;
	if (!file || !guildId) return;

	if (file.size > MaximumConfigurationFileSize) {
		toast.add({ title: ts("guild_settings.general.transfer.too_big"), color: "error" });
		return;
	}

	isReading.value = true;
	try {
		const text = await file.text();
		const result = await importRequest(guildId, text, false);
		review.value = { guildId, fileName: file.name, text, result };
	} catch {
		toast.add({ title: ts("guild_settings.general.transfer.import_failed"), color: "error" });
	} finally {
		isReading.value = false;
	}
}

async function confirmImport() {
	const current = review.value;
	if (!current) return;

	isImporting.value = true;
	try {
		const result = await importRequest(current.guildId, current.text, true);
		if (!result.ok) {
			review.value = { ...current, result };
			return;
		}
		if (result.applied) {
			setGuildSettings(result.settings as unknown as GuildData, current.guildId);
			await refreshNuxtData(`guild:${current.guildId}:automod:rules`);
		}
		toast.add({ title: ts("guild_settings.general.transfer.imported"), color: "success" });
		isImporting.value = false;
		review.value = null;
	} catch (error) {
		const stale = (error as { statusCode?: number } | null)?.statusCode === 409;
		toast.add({
			title: ts(
				stale
					? "guild_settings.general.transfer.stale"
					: "guild_settings.general.transfer.import_failed",
			),
			color: "error",
		});
		isImporting.value = false;
		review.value = null;
	}
}

function formatValue(value: unknown) {
	return typeof value === "string" ? value : JSON.stringify(value);
}

const rulesSummary = computed(() => {
	const rules = preview.value?.rules;
	if (!rules) return [];

	const lines: { key: string; label: string; names: string; tone: string }[] = [];
	const add = (key: string, tone: string, label: string, names: string[]) => {
		if (names.length > 0) lines.push({ key, tone, label, names: names.join(", ") });
	};
	add(
		"created",
		"font-semibold text-success",
		ts("guild_settings.general.transfer.rules_created", { count: rules.created.length }),
		rules.created,
	);
	add(
		"updated",
		"font-semibold",
		ts("guild_settings.general.transfer.rules_updated", { count: rules.updated.length }),
		rules.updated.map((rule) => rule.name),
	);
	add(
		"moved",
		"font-semibold",
		ts("guild_settings.general.transfer.rules_moved", { count: rules.moved.length }),
		rules.moved,
	);
	add(
		"removed",
		"font-semibold text-error",
		ts("guild_settings.general.transfer.rules_removed", { count: rules.removed.length }),
		rules.removed,
	);
	return lines;
});
</script>
