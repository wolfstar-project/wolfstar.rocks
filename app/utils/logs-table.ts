/** Entries a log table asks the server for, and shows, per page. */
export const LOGS_PAGE_SIZE = 10;

/** The filter select of a log toolbar: the same field as the search beside it. */
export const LOGS_FILTER_UI = {
	base: "h-10 min-w-36.5 rounded-[6px] bg-(--console-input)! px-3 text-sm ring-(--console-border)",
} as const;
