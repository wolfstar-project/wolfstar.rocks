import { describe, expect, it } from "vitest";
import {
	logChannelChanges,
	logSelectionState,
	sharedLogChannel,
	toggleLogSelection,
} from "~/utils/log-channels";

type Key = "logsA" | "logsB" | "logsC";

const KEYS: readonly Key[] = ["logsA", "logsB", "logsC"];

describe("sharedLogChannel", () => {
	it("is none when no log of the set is logged", () => {
		expect(
			sharedLogChannel<Key>({ logsA: null, logsB: null, logsC: null }, KEYS),
		).toStrictEqual({ kind: "none" });
	});

	it("treats a missing value as not logged", () => {
		expect(sharedLogChannel<Key>({}, KEYS)).toStrictEqual({ kind: "none" });
	});

	it("is none for an empty set of logs", () => {
		expect(sharedLogChannel<Key>({ logsA: "1" }, [])).toStrictEqual({ kind: "none" });
	});

	it("names the channel when every log posts to it", () => {
		expect(sharedLogChannel<Key>({ logsA: "1", logsB: "1", logsC: "1" }, KEYS)).toStrictEqual({
			channel: "1",
			kind: "same",
		});
	});

	it("is mixed when the logs post to different channels", () => {
		expect(sharedLogChannel<Key>({ logsA: "1", logsB: "2", logsC: "1" }, KEYS)).toStrictEqual({
			kind: "mixed",
		});
	});

	it("is mixed when only some of the logs are logged", () => {
		expect(sharedLogChannel<Key>({ logsA: "1", logsB: null, logsC: "1" }, KEYS)).toStrictEqual({
			kind: "mixed",
		});
	});

	it("only looks at the keys it is given", () => {
		expect(
			sharedLogChannel<Key>({ logsA: "1", logsB: "1", logsC: "2" }, ["logsA", "logsB"]),
		).toStrictEqual({ channel: "1", kind: "same" });
	});
});

describe("logChannelChanges", () => {
	it("sets the channel on every log that does not hold it yet", () => {
		expect(
			logChannelChanges<Key>({ logsA: null, logsB: "1", logsC: "2" }, KEYS, "1"),
		).toStrictEqual({ logsA: "1", logsC: "1" });
	});

	it("removes the channel of every logged log", () => {
		expect(
			logChannelChanges<Key>({ logsA: "1", logsB: null, logsC: "2" }, KEYS, null),
		).toStrictEqual({ logsA: null, logsC: null });
	});

	it("leaves keys outside the set alone", () => {
		expect(
			logChannelChanges<Key>({ logsA: null, logsB: null, logsC: null }, ["logsB"], "1"),
		).toStrictEqual({ logsB: "1" });
	});

	it("returns nothing when every log already holds the value", () => {
		expect(
			logChannelChanges<Key>({ logsA: "1", logsB: "1" }, ["logsA", "logsB"], "1"),
		).toStrictEqual({});
	});
});

describe("logSelectionState", () => {
	it("is none when no key of the set is ticked", () => {
		expect(logSelectionState(new Set<Key>(["logsC"]), ["logsA", "logsB"])).toBe("none");
	});

	it("is some when part of the set is ticked", () => {
		expect(logSelectionState(new Set<Key>(["logsA"]), KEYS)).toBe("some");
	});

	it("is all when every key of the set is ticked", () => {
		expect(logSelectionState(new Set<Key>(KEYS), KEYS)).toBe("all");
	});

	it("is none for an empty set of keys", () => {
		expect(logSelectionState(new Set<Key>(KEYS), [])).toBe("none");
	});
});

describe("toggleLogSelection", () => {
	it("adds every key of the set", () => {
		const selected = new Set<Key>(["logsC"]);
		expect(
			[...toggleLogSelection(selected, ["logsA", "logsB"], true)].toSorted(),
		).toStrictEqual(["logsA", "logsB", "logsC"]);
	});

	it("removes every key of the set and keeps the others", () => {
		expect([
			...toggleLogSelection(new Set<Key>(KEYS), ["logsA", "logsB"], false),
		]).toStrictEqual(["logsC"]);
	});

	it("does not change the set it was given", () => {
		const selected = new Set<Key>(["logsA"]);
		toggleLogSelection(selected, ["logsB"], true);
		expect([...selected]).toStrictEqual(["logsA"]);
	});
});
