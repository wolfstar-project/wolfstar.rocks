import { describe, expect, it } from "vitest";

describe("useInvites", () => {
	it("should return an object with Staryl and WolfStar keys", () => {
		const invites = useInvites();
		expect(invites).toHaveProperty("Staryl");
		expect(invites).toHaveProperty("WolfStar");
	});

	it("should have Staryl invite as '#'", () => {
		const invites = useInvites();
		expect(invites.Staryl).toBe("#");
	});

	it("should have WolfStar invite as a Discord authorize URL", () => {
		const invites = useInvites();
		expect(invites.WolfStar).toContain("https://discord.com/oauth2/authorize");
	});

	it("should include a client_id in WolfStar invite", () => {
		const invites = useInvites();
		expect(invites.WolfStar).toMatch(/client_id=\w+/);
	});

	it("should include permissions in WolfStar invite", () => {
		const invites = useInvites();
		expect(invites.WolfStar).toContain("permissions=534185897078");
	});

	it("should include scope in WolfStar invite", () => {
		const invites = useInvites();
		expect(invites.WolfStar).toContain("scope=bot%20applications.commands");
	});
});
