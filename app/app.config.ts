import { avatar, badge, button, fieldGroup, footer, footerColumns, header, inputMenu, kbd, link, navigationMenu, tabs, toaster } from "@/themes/index";

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
    kbd,
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
      slots: {
        base: "mx-4 flex flex-grow flex-col items-center sm:mx-auto sm:w-5/6 lg:max-w-5xl xl:max-w-7xl",
      },
    },
  },
});
