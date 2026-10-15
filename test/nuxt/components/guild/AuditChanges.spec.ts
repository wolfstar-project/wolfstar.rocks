import type { DashboardAuditEntry } from "#shared/types/audit-log";
import { GuildAuditChanges } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import { MOCK_AUDIT_ENTRY } from "~~/test/mocks/auditLogs";

const SEVERAL_CHANGES: DashboardAuditEntry = {
	...MOCK_AUDIT_ENTRY,
	changes: {
		changed: {
			language: { from: "en-US", to: "it-IT" },
			modulesAutomod: { from: false, to: true },
		},
	},
};

// Accessibility audits for GuildAuditChanges live in test/nuxt/a11y.spec.ts.
describe("GuildAuditChanges", () => {
	it("shows nothing for an entry with a single change", async () => {
		const wrapper = await mountSuspended(GuildAuditChanges, {
			props: { entry: MOCK_AUDIT_ENTRY },
		});

		expect(wrapper.find("button").exists()).toBe(false);
	});

	it("opens a sheet with every change of the entry", async () => {
		const wrapper = await mountSuspended(GuildAuditChanges, {
			props: { entry: SEVERAL_CHANGES },
			attachTo: document.body,
		});

		const button = wrapper.get('button[aria-label="Show all 2 changes"]');
		expect(button.attributes("aria-haspopup")).toBe("dialog");
		await button.trigger("click");

		await vi.waitFor(() => {
			const sheet = document.body.querySelector('[role="dialog"]');
			expect(sheet?.textContent).toContain("2 changes");
			expect(sheet?.querySelectorAll("li")).toHaveLength(2);
			expect(sheet?.textContent).toContain("it-IT");
		});

		wrapper.unmount();
	});
});
