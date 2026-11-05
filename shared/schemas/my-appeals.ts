import { check, object, optional, pipe, string } from "valibot";
import { isSnowflake } from "../utils/snowflake";

/**
 * The query of `GET /api/users/appeals`: the server a banned member comes
 * from, through the bot's direct message, when there is one.
 */
export const MyAppealsQuerySchema = object({
	guild: optional(
		pipe(
			string(),
			check((value) => isSnowflake(value), "Expected a Discord snowflake"),
		),
	),
});
