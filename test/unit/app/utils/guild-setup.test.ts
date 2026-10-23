import { describe, expect, it } from "vitest";
import {
	clampSetupStep,
	createSetupDraft,
	SETUP_EVENT_LOG_KEYS,
	SETUP_STEPS,
	setupChanges,
	setupChannelFields,
} from "~/utils/guild-setup";

const CHANNEL = "234567890123456789";
const ROLE = "345678901234567890";

describe("createSetupDraft", () => {
	it("starts on the first step with the recommended modules on", () => {
		const draft = createSetupDraft("it-IT");

		expect(draft).toMatchObject({ language: "it-IT", reached: 1, step: 1 });
		expect(draft.modules).toStrictEqual({
			modulesAutomod: true,
			modulesLogs: true,
			modulesModeration: true,
			modulesRoles: false,
		});
	});
});

describe("setupChannelFields", () => {
	it("asks for the channels of the modules that are on", () => {
		const draft = createSetupDraft("en-US");
		draft.modules.modulesAutomod = false;
		draft.modules.modulesLogs = false;

		expect(setupChannelFields(draft)).toStrictEqual({
			automod: false,
			events: false,
			moderation: true,
		});
	});
});

describe("setupChanges", () => {
	it("writes every module flag, the language and nothing that was left empty", () => {
		expect(setupChanges(createSetupDraft("en-US"))).toStrictEqual({
			language: "en-US",
			modulesAutomod: true,
			modulesLogs: true,
			modulesModeration: true,
			modulesRoles: false,
		});
	});

	it("writes the channels and roles that were chosen", () => {
		const draft = createSetupDraft("de-DE");
		draft.moderationChannel = CHANNEL;
		draft.automodChannel = CHANNEL;
		draft.eventsChannel = CHANNEL;
		draft.admin = [ROLE];
		draft.moderator = [ROLE];
		draft.muted = ROLE;

		const changes = setupChanges(draft);

		expect(changes).toMatchObject({
			automodChannel: CHANNEL,
			moderationChannel: CHANNEL,
			rolesAdmin: [ROLE],
			rolesModerator: [ROLE],
			rolesMuted: ROLE,
		});
		for (const key of SETUP_EVENT_LOG_KEYS) {
			expect(changes[key]).toBe(CHANNEL);
		}
	});

	it("leaves out the channel of a module that was turned off", () => {
		const draft = createSetupDraft("en-US");
		draft.modules.modulesModeration = false;
		draft.moderationChannel = CHANNEL;

		const changes = setupChanges(draft);

		expect(changes).not.toHaveProperty("moderationChannel");
		expect(changes.modulesModeration).toBe(false);
	});

	it("leaves out the event log channel when the Events were turned off", () => {
		const draft = createSetupDraft("en-US");
		draft.modules.modulesLogs = false;
		draft.eventsChannel = CHANNEL;

		const changes = setupChanges(draft);

		for (const key of SETUP_EVENT_LOG_KEYS) {
			expect(changes).not.toHaveProperty(key);
		}
		expect(changes.modulesLogs).toBe(false);
	});
});

describe("clampSetupStep", () => {
	it("keeps a step inside the steps there are", () => {
		expect(clampSetupStep(0)).toBe(1);
		expect(clampSetupStep(3)).toBe(3);
		expect(clampSetupStep(99)).toBe(SETUP_STEPS.length);
	});
});
