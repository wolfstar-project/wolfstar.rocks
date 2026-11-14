import type { REPORT_STATUSES } from "../schemas/log-queries";

export type ReportStatus = (typeof REPORT_STATUSES)[number];

/** One member report in the review queue, as `GET /api/guilds/:guild/reports` sends it. */
export interface ReportEntry {
	/** The report number the bot shows, as a string: the column is a `BIGINT`. */
	id: string;
	targetId: string;
	/** The reported member's tag when the report was filed. */
	targetTag: string;
	reason: string;
	status: ReportStatus;
	createdAt: string;
	closedAt: string | null;
}

export interface ReportListResponse {
	entries: ReportEntry[];
	total: number;
}
