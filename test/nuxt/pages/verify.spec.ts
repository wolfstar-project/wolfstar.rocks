import type { JoinGuardVerifyPage } from "#shared/utils/join-guard";
import type { JoinGuardPassState } from "~/composables/useJoinGuardVerify";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import VerifyPage from "~/pages/verify/[guild].vue";

const GUILD_ID = "254360814063058944";

const mockLoggedIn = ref(true);
const mockPage = ref<JoinGuardVerifyPage | null>(null);
// What the route answers whoever asks: the guild and its checks.
const mockGuest = ref<Pick<JoinGuardVerifyPage, "guild" | "checks"> | null>(null);
const mockPass = ref<JoinGuardPassState>({ state: "idle" });
const mockStatus = ref<"idle" | "pending" | "success" | "error">("success");
const mockVerify = vi.fn();
const mockError = ref<{ statusCode: number } | null>(null);
const mockSignIn = vi.fn();
const mockRefresh = vi.fn();

mockNuxtImport("useSignIn", () => () => ({
	error: ref(null),
	execute: mockSignIn,
	status: ref("idle"),
}));

mockNuxtImport("useJoinGuardVerify", () => () => ({
	error: mockError,
	guest: computed(() =>
		mockGuest.value ? { checks: mockGuest.value.checks, guild: mockGuest.value.guild } : null,
	),
	page: mockPage,
	pass: mockPass,
	ready: computed(() => true),
	refresh: mockRefresh,
	signedIn: computed(() => mockLoggedIn.value),
	status: mockStatus,
	verify: mockVerify,
}));

function page(overrides: Partial<JoinGuardVerifyPage> = {}): JoinGuardVerifyPage {
	return {
		captchaSiteKey: null,
		checks: { captcha: false, connections: true, sharedBans: true },
		guild: { iconUrl: null, id: GUILD_ID, name: "WolfStar HQ" },
		minimumTrust: 2,
		needsConnections: false,
		state: "waiting",
		trust: { level: 2, linkedAccounts: 1, missing: [] },
		...overrides,
	};
}

// Unmounted after each test, so a page left from an earlier one does not hear
// the window's events of the next.
const mounted: { unmount: () => void }[] = [];

async function mountPage() {
	// The captcha loads Cloudflare's script; the page is tested without it.
	const wrapper = await mountSuspended(VerifyPage, {
		global: { stubs: { VerifyTurnstile: true } },
		route: `/verify/${GUILD_ID}`,
	});
	mounted.push(wrapper);
	await nextTick();
	return wrapper;
}

function verifyButton(wrapper: Awaited<ReturnType<typeof mountPage>>) {
	return wrapper.findAll("button").find((button) => button.text() === "Verify");
}

describe("verification page", () => {
	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	beforeEach(() => {
		vi.clearAllMocks();
		mockLoggedIn.value = true;
		mockPage.value = page();
		mockGuest.value = page();
		mockPass.value = { state: "idle" };
		mockStatus.value = "success";
		mockError.value = null;
	});

	it("asks a visitor to sign in with Discord, and comes back here", async () => {
		mockLoggedIn.value = false;
		mockPage.value = null;
		const wrapper = await mountPage();

		expect(wrapper.find("h1").text()).toBe("Verify your account");
		expect(wrapper.text()).toContain("WolfStar HQ checks the accounts that join it.");
		expect(wrapper.text()).toContain("Sign in to verify");
		const signIn = wrapper.findAll("button").find((b) => b.text() === "Sign in with Discord");
		await signIn!.trigger("click");

		expect(mockSignIn).toHaveBeenCalledWith(
			expect.objectContaining({
				callbackURL: `/oauth/callback?next=${encodeURIComponent(`/verify/${GUILD_ID}`)}`,
				provider: "discord",
				// The server counts the linked accounts, so the first sign-in asks for them.
				scopes: ["connections"],
			}),
		);
	});

	it("shows the trust of a waiting member and lets them verify", async () => {
		mockVerify.mockResolvedValue({ state: "done" });
		const wrapper = await mountPage();

		expect(wrapper.text()).toContain("WolfStar HQ");
		expect(wrapper.text()).toContain("Your trust: Trusted.");
		expect(wrapper.find('[aria-current="step"]').text()).toContain("Trusted");

		await verifyButton(wrapper)!.trigger("click");
		expect(mockVerify).toHaveBeenCalledExactlyOnceWith(null);
	});

	it("says what is missing below the minimum, and holds the Verify button", async () => {
		mockPage.value = page({
			needsConnections: true,
			trust: { level: 1, linkedAccounts: 0, missing: ["linkedAccount", "avatar"] },
		});
		const wrapper = await mountPage();

		expect(wrapper.text()).toContain("To reach Trusted:");
		expect(wrapper.text()).toContain("Link a Steam, GitHub, Twitch, X or Reddit account");
		expect(wrapper.text()).toContain("Use an avatar of your own.");
		expect(verifyButton(wrapper)!.attributes("disabled")).toBeDefined();

		const link = wrapper.findAll("button").find((b) => b.text() === "Link your accounts");
		await link!.trigger("click");
		expect(mockSignIn).toHaveBeenCalledWith(
			expect.objectContaining({ scopes: ["connections"] }),
		);
	});

	it("measures the trust again when a member below the minimum fixed it", async () => {
		mockPage.value = page({
			trust: { level: 1, linkedAccounts: 0, missing: ["avatar"] },
		});
		const wrapper = await mountPage();

		const again = wrapper.findAll("button").find((b) => b.text() === "Check again");
		await again!.trigger("click");
		expect(mockRefresh).toHaveBeenCalledTimes(1);

		// Back from Discord in another tab: the page reads the trust again by itself.
		window.dispatchEvent(new Event("focus"));
		expect(mockRefresh).toHaveBeenCalledTimes(2);
	});

	it("does not read the trust again on focus once it is enough", async () => {
		await mountPage();

		window.dispatchEvent(new Event("focus"));
		expect(mockRefresh).not.toHaveBeenCalled();
	});

	it("waits for the captcha before it lets the member verify", async () => {
		mockPage.value = page({
			captchaSiteKey: "1x00000000000000000000AA",
			checks: { captcha: true, connections: false, sharedBans: true },
		});
		const wrapper = await mountPage();

		expect(wrapper.text()).toContain("Solve the captcha first.");
		expect(verifyButton(wrapper)!.attributes("disabled")).toBeDefined();
	});

	it("tells the member they are in once the bot let them in", async () => {
		mockPass.value = { state: "done" };
		const wrapper = await mountPage();

		expect(wrapper.find("h2").text()).toBe("You're in — head back to Discord");
	});

	it("shows the bot's reason when it could not let them in", async () => {
		mockPass.value = {
			error: { code: "RoleNotManageable", detail: "Verified" },
			state: "failed",
		};
		const wrapper = await mountPage();

		expect(wrapper.find('[role="alert"]').text()).toBe(
			"WolfStar couldn't let you in: the pending or verified role is above WolfStar's highest role.",
		);
	});

	it.each([
		["unavailable", "There's no checkpoint here"],
		["notStopped", "You weren't stopped"],
		["verified", "You're already verified"],
		["kicked", "You were removed from the server"],
		["banned", "You were banned from the server"],
		["left", "You left the server"],
	] as const)("words the %s state", async (state, title) => {
		mockPage.value = page({ state, trust: null });
		const wrapper = await mountPage();

		expect(wrapper.find("h2").text()).toBe(title);
		expect(verifyButton(wrapper)).toBeUndefined();
	});

	it("words a refusal of the page by its code", async () => {
		mockPass.value = { code: "sharedBan", state: "refused" };
		const wrapper = await mountPage();

		expect(wrapper.find('[role="alert"]').text()).toContain("shared ban list");
	});

	it("offers a retry when the page cannot load", async () => {
		mockPage.value = null;
		mockGuest.value = null;
		mockStatus.value = "error";
		const wrapper = await mountPage();

		expect(wrapper.find('[role="alert"]').text()).toContain("Couldn't load this page");
	});

	it("says WolfStar is not in a server it does not know", async () => {
		mockPage.value = null;
		mockGuest.value = null;
		mockStatus.value = "error";
		mockError.value = { statusCode: 404 };
		const wrapper = await mountPage();

		expect(wrapper.find("h2").text()).toBe("WolfStar isn't in this server");
	});
});
