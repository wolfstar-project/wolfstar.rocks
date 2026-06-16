import * as v from "valibot";

export const FeedbackSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, "Name is required")),
	email: v.pipe(v.string(), v.email("Enter a valid email address")),
	message: v.pipe(v.string(), v.minLength(10, "Message must be at least 10 characters")),
});

export type FeedbackState = v.InferInput<typeof FeedbackSchema>;
