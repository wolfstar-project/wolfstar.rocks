import type { InjectionKey, Ref } from "vue";

export type SemanticColor =
	| "primary"
	| "secondary"
	| "success"
	| "error"
	| "info"
	| "warning"
	| "accent"
	| "neutral";

export type FormError = { name?: string; message: string; id?: string };
export type FormErrorEvent = { errors: FormError[] };
export type FormSubmitEvent<T> = { data: T };

export interface SelectOption {
	label: string;
	value: string | number | null;
	icon?: string;
	disabled?: boolean;
	avatar?: { src?: string; alt?: string };
}

export type SelectItem = SelectOption | undefined | null | false | SelectItem[];

export interface NavigationMenuItem {
	label?: string;
	icon?: string;
	to?: string;
	href?: string;
	target?: string;
	active?: boolean;
	disabled?: boolean;
	checked?: boolean;
	children?: NavigationMenuItem[];
	onSelect?: (e: Event) => void;
	onUpdateChecked?: (checked: boolean) => void;
	type?: "label" | "separator" | "link" | "checkbox";
	slot?: string;
	class?: string;
	avatar?: { src?: string; alt?: string };
	[key: string]: unknown;
}

export type DropdownMenuItem = NavigationMenuItem & { kbds?: string[] };

export interface TabsItem {
	label: string;
	value: string | number;
	icon?: string;
	slot?: string;
	disabled?: boolean;
}

export interface FooterColumn {
	label?: string;
	children?: Array<{ label: string; to?: string; target?: string; class?: string }>;
}

export type TableColumn<T> = import("@tanstack/vue-table").ColumnDef<T>;

export type ShortcutHandler = (() => void) | false | { handler: () => void } | null | undefined;
export type ShortcutsConfig = Record<string, ShortcutHandler>;

export const dashboardSidebarCollapseKey = Symbol("dashboard-sidebar-collapse") as InjectionKey<{
	collapsed: Ref<boolean>;
	toggle: () => void;
}>;

export const formErrorsKey = Symbol("form-errors") as InjectionKey<Ref<FormError[]>>;
