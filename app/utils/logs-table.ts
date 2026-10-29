/** Entries a log table asks the server for, and shows, per page. */
export const LOGS_PAGE_SIZE = 10;

/** The filter select of a log toolbar: the same field as the search beside it. */
export const LOGS_FILTER_UI = {
	base: "h-10 min-w-36.5 rounded-[6px] bg-(--console-input)! px-3 text-sm ring-(--console-border)",
} as const;

/**
 * `UTable` dressed as the console design's log table: a bordered, rounded
 * frame, a tinted header in small capitals, and rows split by a hairline. The
 * columns are fixed so a long reason truncates instead of widening the table,
 * which scrolls sideways below its minimum width.
 */
export const LOGS_TABLE_UI = {
	root: "hidden rounded-[8px] border border-(--console-border) md:block",
	base: "w-full min-w-(--logs-min-width) table-fixed",
	thead: "bg-(--console-active) [&>tr]:after:content-none",
	tbody: "divide-y-0",
	th: "px-3.5 py-2.5 text-[0.6875rem] font-bold tracking-[0.06em] text-muted uppercase",
	td: "h-11.5 overflow-hidden border-t border-(--home-border-subtle) px-3.5 py-1.5 text-[0.8125rem] text-toned",
	separator: "hidden",
} as const;

/** Width of a column, for `UTable`'s `meta.class`; columns without one share the rest. */
export function logsColumnWidth(width: string) {
	return { class: { td: width, th: width } };
}
