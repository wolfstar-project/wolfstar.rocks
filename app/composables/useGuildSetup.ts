import type { SetupDraft } from "~/utils/guild-setup";
import { clampSetupStep, createSetupDraft, setupChanges } from "~/utils/guild-setup";

export const GUILD_SETUP_STORAGE_KEY = "wolfstar-guild-setup";

/** How an admin left the setup of a server, kept in this browser. */
type SetupStatus = "done" | "skipped";

/**
 * The first setup of a server: the wizard a server with no settings yet opens
 * with, and what is left of it when it is skipped.
 *
 * Whether a server needs setup comes from the API (`setupPending`); whether
 * this browser finished or skipped it is kept here, so a finished setup does
 * not come back while the saved answer is still on its way, and a skipped one
 * is offered again from the overview rather than in the admin's way.
 */
export function useGuildSetup() {
	const { activeGuildId } = useActiveGuild();
	const { guildData } = useGuildData();
	const { guildSettings } = useGuildSettings();
	const { save } = useSaveGuildSettings();
	const { goToSection } = useDashboardNavigation();
	const { ts } = useI18n();
	const toast = useToast();

	const statuses = useLocalStorage<Record<string, SetupStatus>>(
		GUILD_SETUP_STORAGE_KEY,
		{},
		{ mergeDefaults: true },
	);
	// What is open and what was chosen lives in memory, for each server.
	const openGuilds = useState<Record<string, boolean>>("guild:setup-open", () => ({}));
	const drafts = useState<Record<string, SetupDraft>>("guild:setup-drafts", () => ({}));
	const offered = useState<Record<string, boolean>>("guild:setup-offered", () => ({}));
	const saving = useState("guild:setup-saving", () => false);

	const status = computed(() =>
		activeGuildId.value ? statuses.value[activeGuildId.value] : undefined,
	);
	/** The server has no settings yet, and setup was not finished here. */
	const pending = computed(
		() => guildData.value?.setupPending === true && status.value !== "done",
	);
	/** Setup was skipped: the overview offers to pick it up again. */
	const skipped = computed(() => pending.value && status.value === "skipped");
	const open = computed(
		() => (activeGuildId.value ? openGuilds.value[activeGuildId.value] : false) === true,
	);

	const draft = computed<SetupDraft>({
		get: () =>
			(activeGuildId.value ? drafts.value[activeGuildId.value] : undefined) ??
			createSetupDraft(guildSettings.value?.language ?? "en-US"),
		set: (value) => {
			if (activeGuildId.value)
				drafts.value = { ...drafts.value, [activeGuildId.value]: value };
		},
	});

	function setOpen(guildId: string, value: boolean) {
		openGuilds.value = { ...openGuilds.value, [guildId]: value };
	}

	/** Opens the wizard, on the step the draft was left on. */
	function start() {
		const guildId = activeGuildId.value;
		if (!guildId) return;
		if (!drafts.value[guildId]) {
			drafts.value = {
				...drafts.value,
				[guildId]: createSetupDraft(guildSettings.value?.language ?? "en-US"),
			};
		}
		setOpen(guildId, true);
	}

	/** Opens the wizard once for a server that was never set up, and never again for it unprompted. */
	function offer() {
		const guildId = activeGuildId.value;
		if (!guildId || !pending.value || status.value !== undefined || offered.value[guildId]) {
			return;
		}
		offered.value = { ...offered.value, [guildId]: true };
		start();
	}

	function goTo(step: number) {
		const next = clampSetupStep(step);
		draft.value = { ...draft.value, reached: Math.max(draft.value.reached, next), step: next };
	}

	function skip() {
		const guildId = activeGuildId.value;
		if (!guildId) return;
		statuses.value = { ...statuses.value, [guildId]: "skipped" };
		setOpen(guildId, false);
		toast.add({
			color: "info",
			description: ts("guild_settings.setup.skipped_description"),
			icon: "heroicons:information-circle",
			title: ts("guild_settings.setup.skipped_title"),
		});
	}

	async function finish(): Promise<boolean> {
		const guildId = activeGuildId.value;
		if (!guildId || saving.value) return false;

		saving.value = true;
		const saved = await save(guildId, setupChanges(draft.value));
		saving.value = false;

		if (!saved) {
			toast.add(guildSettingsSaveFailureToast(ts));
			return false;
		}

		statuses.value = { ...statuses.value, [guildId]: "done" };
		const { [guildId]: _finished, ...rest } = drafts.value;
		drafts.value = rest;
		setOpen(guildId, false);
		goToSection("");
		toast.add({
			color: "success",
			description: ts("guild_settings.setup.done_description"),
			icon: "heroicons:check-circle",
			title: ts("guild_settings.setup.done_title", { name: guildData.value?.name ?? "" }),
		});
		return true;
	}

	return { draft, finish, goTo, offer, open, pending, saving, setOpen, skip, skipped, start };
}
