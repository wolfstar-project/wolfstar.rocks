import { describe, expect, it } from "vitest";

describe("useApp", () => {
	it("should return an object with WolfStar and Staryl keys", () => {
		const apps = useApp();
		expect(apps).toHaveProperty("WolfStar");
		expect(apps).toHaveProperty("Staryl");
	});

	it("should have correct WolfStar properties", () => {
		const apps = useApp();
		expect(apps.WolfStar.name).toBe("WolfStar");
		expect(apps.WolfStar.avatar).toBe("/avatars/wolfstar.png");
		expect(apps.WolfStar.explore).toBe("/");
		expect(apps.WolfStar.purposes).toStrictEqual(["Moderation", "Logging"]);
	});

	it("should have correct Staryl properties", () => {
		const apps = useApp();
		expect(apps.Staryl.name).toBe("Staryl");
		expect(apps.Staryl.avatar).toBe("/avatars/staryl.png");
		expect(apps.Staryl.explore).toBe("/staryl");
		expect(apps.Staryl.purposes).toStrictEqual(["Social", "Notification"]);
	});

	it("should have Staryl invite as '#'", () => {
		const apps = useApp();
		expect(apps.Staryl.invite).toBe("#");
	});

	it("should have WolfStar invite containing a client_id", () => {
		const apps = useApp();
		expect(apps.WolfStar.invite).toMatch(/client_id=\w+/);
	});

	it("should have WolfStar invite containing permissions", () => {
		const apps = useApp();
		expect(apps.WolfStar.invite).toContain("permissions=534185897078");
	});

	it("should have descriptions for both apps", () => {
		const apps = useApp();
		expect(apps.WolfStar.description).toBeTruthy();
		expect(apps.Staryl.description).toBeTruthy();
	});
});
