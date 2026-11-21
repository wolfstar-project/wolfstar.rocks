import { describe, expect, it, vi } from "vitest";
import {
	AuthorNameError,
	createAuthorResolver,
	isGitHubLogin,
	resolveAuthor,
} from "../../../config/blog-authors";

const account = { avatar: "https://avatars.githubusercontent.com/u/76824516?v=4", name: "RedStar" };

describe("resolveAuthor", () => {
	it("takes the name, avatar and profile of the GitHub account", async () => {
		const author = await resolveAuthor({ username: "RedStar071" }, async () => account);

		expect(author).toEqual({
			avatar: { src: account.avatar },
			name: "RedStar",
			to: "https://github.com/RedStar071",
			username: "RedStar071",
		});
	});

	it("keeps what the frontmatter sets", async () => {
		const author = await resolveAuthor(
			{ name: "Red", to: "https://x.com/redstar071", username: "RedStar071" },
			async () => account,
		);

		expect(author.name).toBe("Red");
		expect(author.to).toBe("https://x.com/redstar071");
		expect(author.avatar).toEqual({ src: account.avatar });
	});

	it("asks nothing when the frontmatter already has the name and the avatar", async () => {
		const fetchUser = vi.fn(async () => account);

		await resolveAuthor(
			{ avatar: { src: "/me.png" }, name: "Red", username: "RedStar071" },
			fetchUser,
		);

		expect(fetchUser).not.toHaveBeenCalled();
	});

	it("takes GitHub's own avatar of a named author when ungh does not answer", async () => {
		const author = await resolveAuthor(
			{ name: "RedStar", username: "RedStar071" },
			async () => undefined,
		);

		expect(author.avatar).toEqual({ src: "https://github.com/RedStar071.png" });
		expect(author.name).toBe("RedStar");
	});

	it("refuses an author without a name when ungh does not answer", async () => {
		await expect(
			resolveAuthor({ username: "RedStar071" }, async () => undefined),
		).rejects.toThrow(AuthorNameError);
	});

	it("leaves an author without a valid username as written", async () => {
		const fetchUser = vi.fn(async () => account);
		const author = { name: "Someone", username: "not a login" };

		expect(await resolveAuthor(author, fetchUser)).toBe(author);
		expect(fetchUser).not.toHaveBeenCalled();
	});
});

describe("createAuthorResolver", () => {
	it("asks for each account once, whatever its case", async () => {
		const fetchUser = vi.fn(async () => account);
		const resolveAuthors = createAuthorResolver(fetchUser);

		await resolveAuthors([{ username: "RedStar071" }]);
		await resolveAuthors([{ username: "redstar071" }, { username: "RedStar071" }]);

		expect(fetchUser).toHaveBeenCalledTimes(1);
	});

	it("asks again for an account ungh did not answer for", async () => {
		const fetchUser = vi
			.fn<() => Promise<typeof account | undefined>>()
			.mockResolvedValueOnce(undefined)
			.mockResolvedValue(account);
		const resolveAuthors = createAuthorResolver(fetchUser);

		await expect(resolveAuthors([{ username: "RedStar071" }])).rejects.toThrow(AuthorNameError);
		const [author] = await resolveAuthors([{ username: "RedStar071" }]);

		expect(fetchUser).toHaveBeenCalledTimes(2);
		expect(author?.name).toBe("RedStar");
	});
});

describe("isGitHubLogin", () => {
	it.each([
		["RedStar071", true],
		["a-b", true],
		["-start", false],
		["double--hyphen", false],
		["a".repeat(40), false],
		["has space", false],
		[undefined, false],
	])("treats %j as a login: %s", (value, expected) => {
		expect(isGitHubLogin(value)).toBe(expected);
	});
});
