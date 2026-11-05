import type { MyAppealEntry } from "#shared/utils/my-appeals";
import { DashboardMyAppeals } from "#components";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const PIXEL = "234567890123456789";
const GAME = "345678901234567890";
const HOUR = 3_600_000;

function makeEntry(overrides: Partial<MyAppealEntry> & { key: string }): MyAppealEntry {
	return {
		guild: { id: PIXEL, name: "Pixel Parlor", icon: null },
		case: {
			id: 212,
			type: "Ban",
			reason: "Advertising a server in #general",
			createdAt: new Date(Date.now() - 3 * 24 * HOUR).toISOString(),
			duration: null,
			state: "active",
		},
		status: "open",
		appeal: null,
		againAt: null,
		closed: null,
		...overrides,
	};
}

const OPEN = makeEntry({ key: "open" });
const PENDING = makeEntry({
	key: "pending",
	guild: { id: GAME, name: "Game Night", icon: null },
	case: {
		id: 88,
		type: "Timeout",
		reason: "Spam",
		createdAt: new Date(Date.now() - 2 * HOUR).toISOString(),
		duration: 24 * HOUR,
		state: "active",
	},
	status: "pending",
	appeal: {
		formName: "Mute or timeout",
		answers: [
			{
				questionId: "why",
				label: "What would you do differently?",
				value: "Wait, sorry for the spam.",
			},
		],
		createdAt: new Date(Date.now() - HOUR).toISOString(),
		decidedAt: null,
		reason: null,
	},
});
const DENIED = makeEntry({
	key: "denied",
	case: {
		id: 5,
		type: "Mute",
		reason: null,
		createdAt: new Date(Date.now() - 30 * 24 * HOUR).toISOString(),
		duration: null,
		state: "active",
	},
	status: "denied",
	appeal: {
		formName: null,
		answers: [],
		createdAt: new Date(Date.now() - 5 * 24 * HOUR).toISOString(),
		decidedAt: new Date(Date.now() - 4 * 24 * HOUR).toISOString(),
		reason: "Wait a week.",
	},
	againAt: new Date(Date.now() + 3 * 24 * HOUR).toISOString(),
});
const CLOSED = makeEntry({
	key: "closed",
	guild: { id: "456789012345678901", name: "Dev Lab", icon: null },
	case: {
		id: 7,
		type: "Timeout",
		reason: "Pinging",
		createdAt: new Date(Date.now() - 10 * 24 * HOUR).toISOString(),
		duration: HOUR,
		state: "ended",
	},
	status: "closed",
	closed: { reason: "type", detail: null },
});

const COOLDOWN = makeEntry({
	key: "cooldown",
	case: {
		id: 9,
		type: "Ban",
		reason: "Raid",
		createdAt: new Date(Date.now() - 2 * 24 * HOUR).toISOString(),
		duration: null,
		state: "active",
	},
	status: "closed",
	againAt: new Date(Date.now() + 3 * 24 * HOUR).toISOString(),
	closed: { reason: "cooldown", detail: null },
});

const mockEntries = ref<MyAppealEntry[]>([]);
const mockStatus = ref<"idle" | "pending" | "success" | "error">("success");
const mockError = ref<Error | null>(null);
const mockRefresh = vi.fn();
const mockLoadPage = vi.fn();
const mockSubmit = vi.fn();
const mockUseMyAppeals = vi.fn();

mockNuxtImport("useMyAppeals", () => (params: unknown) => {
	mockUseMyAppeals(params);
	return {
		entries: mockEntries,
		error: mockError,
		loadPage: mockLoadPage,
		openCount: computed(
			() => mockEntries.value.filter((entry) => entry.status === "open").length,
		),
		refresh: mockRefresh,
		status: mockStatus,
		submit: mockSubmit,
	};
});

const mounted: { unmount: () => void }[] = [];

async function mount(guildId: string | null = null) {
	const wrapper = await mountSuspended(DashboardMyAppeals, {
		attachTo: document.body,
		props: { guildId },
	});
	mounted.push(wrapper);
	return wrapper;
}

// Accessibility audits for DashboardMyAppeals live in test/nuxt/a11y.spec.ts.
describe("DashboardMyAppeals", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockEntries.value = [OPEN, PENDING, DENIED, CLOSED];
		mockStatus.value = "success";
		mockError.value = null;
		mockLoadPage.mockReturnValue(new Promise(() => {}));
	});

	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it("shows each case with its server, its type, its number and where it stands", async () => {
		const wrapper = await mount();
		const cards = wrapper.findAll("article");

		expect(cards).toHaveLength(4);
		expect(cards[0]!.text()).toContain("Pixel Parlor");
		expect(cards[0]!.text()).toContain("Case #212");
		expect(cards[0]!.text()).toContain("Banned 3 days ago · Permanent");
		expect(cards[0]!.text()).toContain("Can appeal");
		expect(cards[1]!.text()).toContain("Ends in 22 hours");
		expect(cards[1]!.text()).toContain("with the form Mute or timeout");
		expect(cards[1]!.text()).toContain("Wait, sorry for the spam.");
		expect(cards[2]!.text()).toContain("Denied 4 days ago. You can appeal again in 3 days.");
		expect(cards[2]!.text()).toContain("Wait a week.");
		expect(cards[2]!.text()).toContain("No reason given.");
		expect(cards[3]!.text()).toContain("· Ended");
		expect(cards[3]!.text()).toContain("Dev Lab does not take appeals for timeouts.");
		expect(wrapper.text()).toContain("1 case can be appealed");
	});

	it("says when a recent denial keeps a case closed, and until when", async () => {
		mockEntries.value = [COOLDOWN];
		const wrapper = await mount();

		expect(wrapper.get("article").text()).toContain("You can appeal again in 3 days.");
		expect(wrapper.get("article").text()).toContain("No appeals");
	});

	it("offers to appeal only an open case, and links every server in Discord", async () => {
		const wrapper = await mount();
		const cards = wrapper.findAll("article");

		expect(cards[0]!.find("button").text()).toBe("Appeal");
		expect(
			cards[1]!.findAll("button").filter((button) => button.text() === "Appeal"),
		).toHaveLength(0);
		expect(cards[0]!.get("a").attributes("href")).toBe(`https://discord.com/channels/${PIXEL}`);
	});

	it("filters the cases, with how many each filter holds", async () => {
		const wrapper = await mount();
		const filters = wrapper.findAll("button[aria-pressed]");

		expect(filters.map((button) => button.text())).toStrictEqual([
			"All · 4",
			"Can appeal · 1",
			"Pending · 1",
			"Decided · 2",
		]);
		await filters[3]!.trigger("click");

		expect(filters[3]!.attributes("aria-pressed")).toBe("true");
		expect(wrapper.findAll("article")).toHaveLength(2);
	});

	it("says when a filter holds nothing", async () => {
		mockEntries.value = [CLOSED];
		const wrapper = await mount();
		await wrapper.findAll("button[aria-pressed]")[1]!.trigger("click");

		expect(wrapper.get('[role="status"]').text()).toContain("Nothing here");
	});

	it("shows a skeleton while loading, and a way to try again when it failed", async () => {
		mockStatus.value = "pending";
		const loading = await mount();
		expect(loading.get('[role="status"]').attributes("aria-label")).toBe("Loading your cases");
		loading.unmount();

		mockStatus.value = "error";
		mockError.value = new Error("down");
		const failed = await mount();
		await failed.get('[role="alert"] button').trigger("click");
		expect(mockRefresh).toHaveBeenCalled();
	});

	it("lists the server of the bot's link and opens the dialog on its one open case", async () => {
		await mount(PIXEL);

		expect(mockUseMyAppeals).toHaveBeenCalled();
		const params = mockUseMyAppeals.mock.calls.at(-1)![0] as { guild: () => string | null };
		expect(params.guild()).toBe(PIXEL);
		await vi.waitFor(() =>
			expect(document.querySelector('[role="dialog"]')?.textContent).toContain(
				"Appeal to Pixel Parlor",
			),
		);
		expect(mockLoadPage).toHaveBeenCalledWith(PIXEL);
	});

	it("opens the dialog from a card", async () => {
		const wrapper = await mount();
		await wrapper.findAll("article")[0]!.get("button").trigger("click");

		await vi.waitFor(() =>
			expect(document.querySelector('[role="dialog"]')?.textContent).toContain(
				"Case #212 · Ban · Advertising a server in #general",
			),
		);
	});
});
