import {
	array,
	maxLength,
	minLength,
	object,
	pipe,
	regex,
	string,
	transform,
	trim,
	union,
} from "valibot";

/** How many members a search returns, and how many ids one lookup resolves. */
export const MEMBER_SEARCH_LIMIT = 25;

const SnowflakeSchema = pipe(string(), regex(/^\d{17,20}$/));

/**
 * The query of `GET /api/guilds/:guild/members/search`: a name (or a pasted
 * id) to search for, or the ids of members already picked, to show their names.
 */
export const MemberSearchQuerySchema = union([
	object({ query: pipe(string(), trim(), minLength(1), maxLength(100)) }),
	object({
		ids: pipe(
			string(),
			transform((value) => value.split(",").filter((id) => id.length > 0)),
			array(SnowflakeSchema),
			minLength(1),
			maxLength(MEMBER_SEARCH_LIMIT),
		),
	}),
]);
