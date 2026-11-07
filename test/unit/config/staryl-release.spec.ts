import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchStarylRelease } from "../../../config/staryl-release";

const MANIFEST_URL = "https://raw.githubusercontent.com/wolfstar-project/staryl/main/package.json";
const LATEST_COMMIT_URL = "https://api.github.com/repos/wolfstar-project/staryl/commits/main";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

/** Answers each URL with its response, or throws its error, as `fetch` would. */
function answer(overrides: Record<string, Response | Error> = {}) {
	const responses: Record<string, Response | Error> = {
		[MANIFEST_URL]: json({ name: "@wolfstar/staryl", version: "1.0.0" }),
		[LATEST_COMMIT_URL]: json({ commit: { committer: { date: "2026-10-28T09:25:24Z" } } }),
		...overrides,
	};
	const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
		const response = responses[url];
		if (response === undefined) throw new Error(`unexpected request to ${url}`);
		if (response instanceof Error) throw response;
		return response;
	});
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

describe("fetchStarylRelease", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("reads Staryl's version from its package.json and the time of its latest commit", async () => {
		answer();

		await expect(fetchStarylRelease()).resolves.toStrictEqual({
			version: "1.0.0",
			time: Date.parse("2026-10-28T09:25:24Z"),
		});
	});

	it("sends the token to GitHub's API only", async () => {
		const fetchMock = answer();

		await fetchStarylRelease({ token: "a-token" });

		const headersFor = (url: string) =>
			new Headers(fetchMock.mock.calls.find(([called]) => called === url)?.[1]?.headers);
		expect(headersFor(LATEST_COMMIT_URL).get("authorization")).toBe("Bearer a-token");
		expect(headersFor(MANIFEST_URL).get("authorization")).toBeNull();
	});

	// The release line is a line of copy: a build never fails over it.
	it.each([
		["GitHub's API refuses", { [LATEST_COMMIT_URL]: json({ message: "rate limit" }, 403) }],
		["the manifest has no version", { [MANIFEST_URL]: json({ name: "@wolfstar/staryl" }) }],
		["the commit has no date", { [LATEST_COMMIT_URL]: json({ commit: {} }) }],
		["the network is down", { [MANIFEST_URL]: new TypeError("fetch failed") }],
	])("returns null when %s", async (_label, overrides) => {
		answer(overrides);

		await expect(fetchStarylRelease()).resolves.toBeNull();
	});
});
