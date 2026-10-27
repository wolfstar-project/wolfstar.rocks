import { GuildMemberPicker } from "#components";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { getQuery } from "h3";
import { describe, expect, it, vi } from "vitest";

const GUILD_ID = "123456789012345678";
const KNOWN = "200000000000000001";
const GONE = "200000000000000099";

function member(id: string, username: string, globalName: string) {
	return {
		guildId: GUILD_ID,
		id,
		joinedTimestamp: null,
		premiumSinceTimestamp: null,
		roles: [],
		user: { avatar: null, bot: false, discriminator: "0", globalName, id, username },
	};
}

registerEndpoint(`/api/guilds/${GUILD_ID}/members/search`, {
	method: "GET",
	handler: (event) => {
		const ids = String(getQuery(event)["ids"] ?? "").split(",");
		return ids.includes(KNOWN) ? [member(KNOWN, "helper", "Helpful Person")] : [];
	},
});

// Accessibility audits for GuildMemberPicker live in test/nuxt/a11y.spec.ts.
describe("GuildMemberPicker", () => {
	it("shows a picked member by name", async () => {
		const wrapper = await mountSuspended(GuildMemberPicker, {
			props: { ids: [KNOWN], guildId: GUILD_ID, label: "Members" },
		});
		await vi.waitFor(() => expect(wrapper.text()).toContain("Helpful Person"));
	});

	it("keeps a member who left the server, by id", async () => {
		const wrapper = await mountSuspended(GuildMemberPicker, {
			props: { ids: [GONE], guildId: GUILD_ID, label: "Members" },
		});
		await vi.waitFor(() => expect(wrapper.text()).toContain("Not in the server"));
		expect(wrapper.text()).toContain(GONE);
	});

	it("drops a member when their chip is removed", async () => {
		const wrapper = await mountSuspended(GuildMemberPicker, {
			props: { ids: [KNOWN, GONE], guildId: GUILD_ID, label: "Members" },
		});
		await vi.waitFor(() => expect(wrapper.text()).toContain("Helpful Person"));
		await wrapper.get(`button[data-remove="${KNOWN}"]`).trigger("click");
		expect(wrapper.emitted("update:ids")?.at(-1)).toEqual([[GONE]]);
	});
});
