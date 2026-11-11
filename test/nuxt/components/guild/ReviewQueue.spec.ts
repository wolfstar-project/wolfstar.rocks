import type { ReportEntry } from "#shared/types/report";
import { GuildReviewQueue } from "#components";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError, getQuery } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";

const GUILD_ID = "123456789012345678";

function report(id: string, status: ReportEntry["status"], targetTag: string): ReportEntry {
	return {
		closedAt: null,
		createdAt: "2026-10-14T12:32:00.000Z",
		id,
		reason: `Reason ${id}`,
		status,
		targetId: "223456789012345678",
		targetTag,
	};
}

const REPORTS = [
	report("412", "Open", "loud-user"),
	report("411", "Actioned", "griefer42"),
	report("409", "Open", "adbot_x"),
];

const requestedStatuses: (string | undefined)[] = [];
const requestedOffsets: number[] = [];
/** How many reports the server says it has, when more than the page it answers with. */
let serverTotal: number | null = null;
let failReads = false;

registerEndpoint(`/api/guilds/${GUILD_ID}/reports`, {
	method: "GET",
	handler: (event) => {
		const status = getQuery(event)["status"] as string | undefined;
		requestedStatuses.push(status);
		if (failReads) throw createError({ statusCode: 500, statusMessage: "Down" });
		requestedOffsets.push(Number(getQuery(event)["offset"] ?? 0));
		const entries = REPORTS.filter((entry) => !status || entry.status === status);
		return { entries, total: serverTotal ?? entries.length };
	},
});

// Accessibility audits for GuildReviewQueue live in test/nuxt/a11y.spec.ts.
describe("GuildReviewQueue", () => {
	beforeEach(() => {
		requestedStatuses.length = 0;
		requestedOffsets.length = 0;
		serverTotal = null;
		failReads = false;
		clearNuxtState();
		clearNuxtData();
		useActiveGuild().selectGuild(GUILD_ID);
		useGuildData().setGuildData(createMockOauthFlattenedGuild({ id: GUILD_ID }));
	});

	// A failure that read as a queue with no report would hide the reports.
	it("says the reports could not be loaded, and loads them again", async () => {
		failReads = true;
		const wrapper = await mountSuspended(GuildReviewQueue);

		await vi.waitFor(() => expect(wrapper.text()).toContain("Could not load the reports."));
		expect(wrapper.find(".review-empty").exists()).toBe(false);

		failReads = false;
		const retry = wrapper.findAll("button").find((button) => button.text() === "Try again");
		await retry!.trigger("click");
		await vi.waitFor(() => expect(wrapper.findAll("tbody tr")).toHaveLength(2));
	});

	it("reaches the older reports a page at a time", async () => {
		serverTotal = 60;
		const wrapper = await mountSuspended(GuildReviewQueue);
		await vi.waitFor(() => expect(wrapper.findAll("tbody tr").length).toBeGreaterThan(0));

		const next = () => wrapper.find('nav button[data-slot="next"]');
		await vi.waitFor(() => expect(next().exists()).toBe(true));
		await next().trigger("click");

		await vi.waitFor(() => expect(requestedOffsets).toContain(25));
	});

	it("opens on the open reports, newest first", async () => {
		const wrapper = await mountSuspended(GuildReviewQueue);

		await vi.waitFor(() => expect(wrapper.findAll("tbody tr")).toHaveLength(2));
		const rows = wrapper.findAll("tbody tr").map((row) => row.text());
		expect(rows[0]).toContain("412");
		expect(rows[0]).toContain("@loud-user");
		expect(rows[1]).toContain("@adbot_x");
		expect(wrapper.get('button[aria-pressed="true"]').text()).toBe("Open");
		expect(requestedStatuses).toContain("Open");
	});

	it("shows every report under All and asks for no status", async () => {
		const wrapper = await mountSuspended(GuildReviewQueue);

		const all = wrapper
			.findAll("button[aria-pressed]")
			.find((button) => button.text() === "All");
		await all!.trigger("click");

		await vi.waitFor(() => expect(wrapper.findAll("tbody tr")).toHaveLength(3));
		expect(wrapper.text()).toContain("Actioned");
		expect(requestedStatuses).toContain(undefined);
	});

	it("says when no report has the status picked", async () => {
		const wrapper = await mountSuspended(GuildReviewQueue);

		const dismissed = wrapper
			.findAll("button[aria-pressed]")
			.find((button) => button.text() === "Dismissed");
		await dismissed!.trigger("click");

		await vi.waitFor(() => expect(wrapper.text()).toContain("Nothing in this bucket"));
		expect(wrapper.find("table").exists()).toBe(false);
	});
});
