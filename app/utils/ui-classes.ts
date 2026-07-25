import type { SemanticColor } from "#shared/types/ui";

export type ButtonVariant = "solid" | "outline" | "soft" | "ghost" | "link" | "dash" | "subtle";
export type UiSize = "3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl";

const SEMANTIC_COLORS: readonly SemanticColor[] = [
	"primary",
	"secondary",
	"success",
	"error",
	"info",
	"warning",
	"accent",
	"neutral",
] as const;

export function isSemanticColor(value: string | undefined): value is SemanticColor {
	return value !== undefined && (SEMANTIC_COLORS as readonly string[]).includes(value);
}

export function btnColorClass(color: string | undefined = "primary"): string {
	if (!isSemanticColor(color)) return "btn-primary";
	return `btn-${color}`;
}

export function btnVariantClass(variant: ButtonVariant | undefined = "solid"): string {
	switch (variant) {
		case "outline":
			return "btn-outline";
		case "soft":
		case "subtle":
			return "btn-soft";
		case "ghost":
			return "btn-ghost";
		case "link":
			return "btn-link";
		case "dash":
			return "btn-dash";
		default:
			return "";
	}
}

export function btnSizeClass(size: UiSize | undefined = "md"): string {
	switch (size) {
		case "xs":
		case "2xs":
		case "3xs":
			return "btn-xs";
		case "sm":
			return "btn-sm";
		case "lg":
			return "btn-lg";
		case "xl":
			return "btn-xl";
		default:
			return "";
	}
}

export function badgeColorClass(color: string | undefined = "primary"): string {
	if (!isSemanticColor(color)) return "badge-primary";
	return `badge-${color}`;
}

export function alertColorClass(color: string | undefined = "info"): string {
	switch (color) {
		case "success":
			return "alert-success";
		case "error":
			return "alert-error";
		case "warning":
			return "alert-warning";
		case "info":
		case "primary":
			return "alert-info";
		case "secondary":
		case "accent":
		case "neutral":
			return "alert-soft";
		default:
			return "alert-info";
	}
}

export function avatarSizeClass(size: UiSize | undefined = "md"): string {
	switch (size) {
		case "3xs":
			return "w-4";
		case "2xs":
			return "w-5";
		case "xs":
			return "w-6";
		case "sm":
			return "w-8";
		case "lg":
			return "w-14";
		case "xl":
			return "w-16";
		default:
			return "w-10";
	}
}

export function inputSizeClass(size: UiSize | undefined = "md"): string {
	switch (size) {
		case "xs":
		case "2xs":
		case "3xs":
			return "input-xs";
		case "sm":
			return "input-sm";
		case "lg":
			return "input-lg";
		case "xl":
			return "input-xl";
		default:
			return "input-md";
	}
}
