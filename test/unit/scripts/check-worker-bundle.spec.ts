import { describe, expect, it } from "vitest";
import { checkWorkerBundle } from "~~/scripts/check-worker-bundle";

const marker = (path: string) => `// node_modules/.pnpm/${path}\nvar x = 1;\n`;

describe("checkWorkerBundle", () => {
	it("refuses the Node entry of @discordjs/rest and the undici it pulls in", () => {
		const source = [
			marker("undici@6.28.0/node_modules/undici/lib/core/symbols.js"),
			marker("@discordjs+rest@2.6.3/node_modules/@discordjs/rest/dist/index.mjs"),
		].join("");

		const result = checkWorkerBundle([{ path: "_libs/core.mjs", source }]);

		expect(result).toMatchObject({
			_tag: "Forbidden",
			hits: [
				{
					file: "_libs/core.mjs",
					module: expect.stringContaining("/undici/lib/core/symbols.js"),
				},
				{
					file: "_libs/core.mjs",
					module: expect.stringContaining("/@discordjs/rest/dist/index.mjs"),
				},
			],
		});
	});

	it("passes the web entry of @discordjs/rest", () => {
		const source = marker("@discordjs+rest@2.6.3/node_modules/@discordjs/rest/dist/web.mjs");

		expect(checkWorkerBundle([{ path: "index.mjs", source }])).toEqual({
			_tag: "Clean",
			modules: 1,
		});
	});

	it("does not pass a bundle whose modules carry no source comment", () => {
		expect(checkWorkerBundle([{ path: "index.mjs", source: "var a=1;var b=2;" }])).toEqual({
			_tag: "NoModuleMarkers",
		});
	});
});
