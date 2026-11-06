/** What goes wrong when a decision is asked for, to answer with. */
export type AppealQueueErrorCode = "unknown" | "decided" | "noAccess" | "invalid";

export class AppealQueueError extends Error {
	public constructor(public readonly code: AppealQueueErrorCode) {
		super(`Appeal queue error: ${code}`);
	}
}
