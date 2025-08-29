import type { Ref } from "vue";
import type { UseResizableProps } from "@/composables/useResizable";
import { createContext } from "reka-ui";

export interface DashboardContext extends Pick<UseResizableProps, "storage" | "storageKey" | "persistent" | "unit"> {
  sidebarOpen?: Ref<boolean>;
  sidebarCollapsed?: Ref<boolean>;
  toggleSearch?: () => void;
  toggleSidebar?: () => void;
  collapseSidebar?: (collapsed: boolean) => void;
}

export const [useDashboard, provideDashboardContext] = createContext<DashboardContext>("DashboardGroup");
