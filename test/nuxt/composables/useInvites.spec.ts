import { describe, expect, it } from "vitest";

describe("useInvites", () => {
	it("should return an object with Staryl and WolfStar keys", () => {
		const invites = useInvites();
		expect(invites).toHaveProperty("Staryl");
		expect(invites).toHaveProperty("WolfStar");
	});

	it("invites Staryl with only the permissions it posts with", () => {
		const invite = new URL(useInvites().Staryl);
		expect(invite.origin + invite.pathname).toBe("https://discord.com/oauth2/authorize");
		expect(invite.searchParams.get("client_id")).toBe("1489991104672567386");
		// View Channel, Send Messages and Embed Links.
		expect(invite.searchParams.get("permissions")).toBe("19456");
		expect(invite.searchParams.get("scope")).toBe("bot applications.commands");
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

	it("should send the admin to the invited server through the guild page", () => {
		const url = new URL(useInvites().WolfStar);

		expect(url.searchParams.get("redirect_uri")).toBe(guildRedirectURI());
		expect(url.searchParams.get("response_type")).toBe("code");
		expect(url.searchParams.has("prompt")).toBe(false);
	});

	it("should include scope in WolfStar invite", () => {
		const invites = useInvites();
		expect(invites.WolfStar).toContain("scope=bot%20applications.commands");
	});
});
