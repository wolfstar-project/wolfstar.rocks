import { describe, expect, it } from "vitest";

describe("useFooter", () => {
	it("should return an object with a columns computed property", () => {
		const { columns } = useFooter();
		expect(columns).toBeDefined();
		expect(columns.value).toBeInstanceOf(Array);
	});

	it("should have three columns", () => {
		const { columns } = useFooter();
		expect(columns.value).toHaveLength(3);
	});

	it("should have Links as the first column", () => {
		const { columns } = useFooter();
		expect(columns.value[0].label).toBe("Links");
	});

	it("should have Donate as the second column", () => {
		const { columns } = useFooter();
		expect(columns.value[1].label).toBe("Donate");
	});

	it("should have Legal as the third column", () => {
		const { columns } = useFooter();
		expect(columns.value[2].label).toBe("Legal");
	});

	it("should have 3 children in the Links column", () => {
		const { columns } = useFooter();
		expect(columns.value[0].children).toHaveLength(3);
	});

	it("should have 3 children in the Donate column", () => {
		const { columns } = useFooter();
		expect(columns.value[1].children).toHaveLength(3);
	});

	it("should have 2 children in the Legal column", () => {
		const { columns } = useFooter();
		expect(columns.value[2].children).toHaveLength(2);
	});

	it("should include Support Server in Links", () => {
		const { columns } = useFooter();
		const labels = columns.value[0].children!.map((c: any) => c.label);
		expect(labels).toContain("Support Server");
	});

	it("should include Terms of Use in Legal", () => {
		const { columns } = useFooter();
		const labels = columns.value[2].children!.map((c: any) => c.label);
		expect(labels).toContain("Terms of Use");
	});

	it("should include Privacy Policy in Legal", () => {
		const { columns } = useFooter();
		const labels = columns.value[2].children!.map((c: any) => c.label);
		expect(labels).toContain("Privacy Policy");
	});
});
