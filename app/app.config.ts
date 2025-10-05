import { avatar, badge, button, fieldGroup, footer, footerColumns, header, inputMenu, link, navigationMenu, tabs, toaster } from "@/themes/index";

export default defineAppConfig({
  ui: {
    button,
    inputMenu,
    tabs,
    navigationMenu,
    footerColumns,
    link,
    toaster,
    avatar,
    footer,
    fieldGroup,
    badge,
    header,
    container: {
      base: "container mx-auto px-4",
    },
    skeleton: {
      base: "skeleton",
    },
    main: {
      base: "mx-4 flex flex-grow flex-col items-center sm:mx-auto sm:w-5/6 lg:max-w-5xl xl:max-w-7xl",

    },
  },
});
