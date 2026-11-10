import { beforeEach, describe, expect, it, vi } from "vitest";

const sentry = vi.hoisted(() => ({
	addIntegration: vi.fn(),
	getClient: vi.fn(),
	getReplay: vi.fn(),
	lazyLoadIntegration: vi.fn(),
}));

vi.mock("@sentry/nuxt", () => sentry);

const { startSessionReplay, stopSessionReplay } = await import("~/utils/session-replay");

const DASHBOARD = "/app";

function createReplay(recording: boolean) {
	const replay = {
		getReplayId: vi.fn(() => (replay.recording ? "replay-id" : undefined)),
		recording,
		start: vi.fn(() => {
			replay.recording = true;
		}),
		stop: vi.fn(async () => {
			replay.recording = false;
		}),
	};
	return replay;
}

describe("session replay", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		sentry.getClient.mockReturnValue({});
		sentry.getReplay.mockReturnValue(undefined);
	});

	it("records again when the visitor turns replay back on in the same visit", () => {
		const replay = createReplay(true);
		sentry.getReplay.mockReturnValue(replay);

		stopSessionReplay();
		expect(replay.stop).toHaveBeenCalledOnce();

		startSessionReplay(DASHBOARD);
		expect(replay.start).toHaveBeenCalledOnce();
	});

	it("leaves a replay that is already recording alone", () => {
		const replay = createReplay(true);
		sentry.getReplay.mockReturnValue(replay);

		startSessionReplay(DASHBOARD);
		expect(replay.start).not.toHaveBeenCalled();
	});

	it("does not add the integration when consent is withdrawn while it loads", async () => {
		let resolveLoad: (integration: () => object) => void = () => {};
		sentry.lazyLoadIntegration.mockReturnValue(
			new Promise((resolve) => {
				resolveLoad = resolve;
			}),
		);

		startSessionReplay(DASHBOARD);
		stopSessionReplay();
		resolveLoad(() => ({ name: "Replay" }));
		await vi.waitFor(() => expect(sentry.lazyLoadIntegration).toHaveBeenCalledOnce());
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(sentry.addIntegration).not.toHaveBeenCalled();
	});

	it("adds the integration once it loads with consent still given", async () => {
		sentry.lazyLoadIntegration.mockResolvedValue(() => ({ name: "Replay" }));

		startSessionReplay(DASHBOARD);

		await vi.waitFor(() => expect(sentry.addIntegration).toHaveBeenCalledOnce());
	});

	it("never loads on marketing pages", () => {
		startSessionReplay("/");
		expect(sentry.lazyLoadIntegration).not.toHaveBeenCalled();
	});
});
