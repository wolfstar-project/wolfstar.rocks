import { log } from "evlog/client";

type LogLevel = "info" | "warn" | "error" | "debug";

function emit(level: LogLevel, tag: string, args: unknown[]) {
	if (
		args.length === 1 &&
		typeof args[0] === "object" &&
		args[0] !== null &&
		!Array.isArray(args[0])
	) {
		const payload = { tag, ...(args[0] as Record<string, unknown>) };
		log[level](payload);
	} else {
		log[level](tag, args.map(String).join(" "));
	}
}

export const logger = {
	info: (...args: unknown[]) => emit("info", "wolfstar", args),
	warn: (...args: unknown[]) => emit("warn", "wolfstar", args),
	error: (...args: unknown[]) => emit("error", "wolfstar", args),
	debug: (...args: unknown[]) => emit("debug", "wolfstar", args),
};

export function useLogger(tag: string) {
	return {
		info: (...args: unknown[]) => emit("info", tag, args),
		warn: (...args: unknown[]) => emit("warn", tag, args),
		error: (...args: unknown[]) => emit("error", tag, args),
		debug: (...args: unknown[]) => emit("debug", tag, args),
	};
}
