# Changelog

## 4.6.0 (2026-03-23)

###  BREAKING CHANGES

* **module:** use `moduleDependencies` to manipulate options (#5384)

### Features

* add standalone Vue REPL playground (#6209) (390c4bd)
* **ChatMessage:** add `files` slot (12d6020)
* **ChatReasoning:** new component (#6175) (6db594e)
* **ChatShimmer:** new component (#6171) (8db9c54)
* **ChatTool:** new component (#6176) (7849534)
* **Checkbox/Switch:** add support for `trueValue` / `falseValue` props (#6150) (91c6356)
* **ContentToc:** add `highlight-variant` prop (#5746) (df080ce)
* **DropdownMenu:** add `filter` prop (#6153) (a529b43)
* **FileUpload:** add `fileImage` prop (#5935) (40f9c2e)
* **Icon:** add global options on Vue-only side (#5354) (566fbee)
* **InputMenu:** add `autocomplete` prop (#6026) (ee8a248)
* **InputTime:** add `range` prop (#6203) (c124f29)
* **locale:** add Icelandic language (#6149) (f3ddc60)
* **module:** use `moduleDependencies` to manipulate options (#5384) (dd3f5c5)
* **Sidebar:** new component (#6038) (51a1f85)
* **Table:** implement row pinning (#6115) (fbd60d9)
* **Tooltip:** support global content configuration via App tooltip prop (#6152) (83afd9c)
* **unplugin:** add support for prose components (#6198) (c58b9b2)

### Bug Fixes

* **Avatar:** use resolved size for image width/height (#6008) (6dd0fc4)
* **ChatShimmer:** handle RTL mode (#6180) (51793a8)
* **ContentNavigation:** prevent toggling disabled parent items (#6122) (0f1074f)
* **ContentSurround:** handle RTL mode (#6148) (6921f13)
* **ContentToc:** reset start margin at lg breakpoint (8f24f79)
* **DashboardSearchButton:** use valid HTML structure for trailing slot (#6194) (578a12f)
* **Editor:** guard `lift` calls for unavailable list extensions (#6100) (065db6b)
* **Error:** support `status` and `statusText` properties (1350d62), closes #6134
* **FileUpload:** make multiple, accept and reset options reactive (#6204) (ae093df)
* **Modal/Slideover/Popover/Drawer:** prevent double `close:prevent` emit (#6226) (9a0d501)
* **module:** only auto-import public composables and allow Vite opt-out (#6197) (886f5fb)
* **NavigationMenu:** improve RTL support for viewport and indicator (#6164) (755867b)
* **NavigationMenu:** propagate disabled state to item in vertical orientation (6d4d651)
* **ProsePre:** move shiki line highlight styles to theme (d663950)

## 4.5.1 (2026-03-02)

### Bug Fixes

* **components:** improve arrow styling with `stroke-default` and `fill-bg` (#6095) (0e9198e)
* **components:** improve slots return types and tests (#6109) (7d1e863)
* **components:** prevent `transformUI` from mutating cached `useComponentUI` value (286738a), closes #6104 #4387
* **ContentToc:** add relative positioning to content slot (fcdb231), closes #6117
* **ContentToc:** use rem units for indicator size calculation (d631853)
* **NavigationMenu:** prevent navigation when clicking trailing area in horizontal orientation (8f84c90), closes #6083
* **Page:** make slot presence reactive for variant computation (082ea41)
* **types:** resolve `isArrayOfArray` type return (#6097) (04292d9)
* **useResizable:** use function declaration to prevent false auto-import (c22ecf4)

## 4.5.0 (2026-02-24)

### Features

* **DashboardSidebar/Header:** add `autoClose` prop (#6089) (2663deb)
* **EditorDragHandle:** proxy  `nested` / `nestedOptions` props and emit `hover` event (#5960) (ed60193)
* **Form:** add HTML5 validation to programmatic submit (#6002) (ed552fc)
* **locale:** add Belarusian language (#5972) (ac9e7b3)
* **module:** add support for taupe / mauve / mist / olive neutral colors (#6081) (bc49d3f)
* **NavigationMenu:** allow tooltip usage in `horizontal` orientation  (#5682) (f46b504)
* **NavigationMenu:** handle `chip` in items (#6064) (401a2c0)
* **ScrollArea:** add `skipMeasurement` virtualize option (#5721) (548b711)
* **Select/SelectMenu:** add hover effects on `outline` and `subtle` variants (94b0c31)
* **Theme:** new component (#4387) (c97047d)
* **Toaster:** prevent duplicate toasts and add pulse animation (3f6581a)

### Bug Fixes

* **BlogPost/ChangelogVersion:** use `ImgHTMLAttributes` type for image prop (#6007) (0185856)
* **ChatMessages:** allow message props to override role defaults (#6000) (f64ec17)
* **ChatMessages:** prevent flash at top before scrolling to bottom on mount (4bdcb83)
* **Checkbox/Switch:** prevent `data-state` conflict when used inside Tooltip (2bb1a8b), closes #3599
* **CheckboxGroup:** update `update:modelValue` emit type (#5927) (64d2e88)
* **ColorModeImage:** add baseURL support for public paths (#6006) (db510f3)
* **components:** add `fixed` prop to prevent responsive text size reduction (#6074) (8f5f44c)
* **components:** nullable and optional type support (#6060) (cd3432b)
* **components:** prevent iOS auto-zoom on input fields with font-size below 16px (#6040) (1262016)
* **ContentNavigation:** pass nested child data to slots (#6043) (e67f77e)
* **defineShortcuts:** add alt key guard (#6020) (8451f45)
* **defineShortcuts:** allow shifted special character shortcuts (08facc0)
* **Drawer/Modal/Popover/Slideover:** prevent unexpected close on touch when interacting with other overlays (#5695) (e2c038c)
* **Editor:** handle placeholder in RTL mode (#5977) (3cc16e3)
* **EditorMentionMenu:** use `char` prop as mention prefix instead of always `@` (0b9b097), closes #6035
* **EditorToolbar:** proxy size prop to dropdown menu (8f8d989)
* **InputMenu/InputNumber/SelectMenu:** proxy `size` to buttons (1ec1698), closes #5958
* **InputMenu/Select/SelectMenu:** exclude cosmetic items from model value type (#6044) (22cf1ea)
* **InputMenu/SelectMenu:** sort filtered items by match relevance (058c66b), closes #4672
* **InputMenu:** prevent focus on trailing button (88073b6)
* **module:** update icon `cssLayer` option from `components` to `base` (#6076) (e8bc322)
* **NavigationMenu:** allow clicking trailing slot in horizontal orientation (7f9996f), closes #5192 #6083
* **NavigationMenu:** unique auto-generated item values for grouped items (7b317d9)
* **PricingPlan:** truncate title (#6041) (8e86c51)
* **Select:** remove useless `by` prop (14dceaf)
* **Table:** improve perfs with `shallowRef` when watch deep is disabled (#6023) (bc06ce2)
* **Toast:** allow `update` to keep toast open and reset duration (82afa0a)
* **Toast:** improve animation smoothness (#6065) (ee2c0a5)
* **types:** improve `DotPathKeys` accuracy and `GetItemKeys` performance (#6077) (6f7af3e)
* **useEditorMenu:** rank filtered results by relevance (f53484a)

## 4.4.0 (2026-01-21)

### Features

* **Calendar:** add `weekNumbers` prop (#4555) (7a1a71b)
* **ChangelogVersions:** handle scroll options in `indicator` prop (#5257) (6a925cd)
* **CommandPalette/InputMenu/SelectMenu/Tree:** handle virtualizer `estimateSize` as function (#5748) (d51b424)
* **CommandPalette:** add `input` prop (#5736) (12052e8)
* **CommandPalette:** add `size` prop (#5878) (3ae04c6)
* **components:** add `by` prop (#5906) (36cd5e5)
* **components:** add `valueKey` prop (#5905) (55646ea)
* **Editor:** add `placeholder.mode` prop (d90acb3), closes #5785
* **Editor:** add `size` prop in menus (#5889) (571d50d)
* **Editor:** add `taskList` handler (#5837) (db04197)
* **Editor:** add support for code inside links (2ed2d5d)
* **Editor:** handle boolean in `image` and `mention` props (b6fa83a), closes #5820
* **EditorMentionMenu:** handle async search with `ignoreFilter` prop (#5880) (f8d1883)
* **InputMenu/Select/SelectMenu:** expose `viewportRef` for infinite scroll (#5836) (f4a945c)
* **InputMenu/SelectMenu:** add `clear` prop (#5643) (ec6b8ec)
* **Link:** support custom navigate function in vue (#5860) (f51e58a)
* **ProseTd/ProseTh:** handle `align` prop (859390e), closes #5795
* **Timeline/Stepper:** add wrapper slot and fix dynamic slot conditions (#5868) (8610d4d)
* **Timeline:** add `select` event (#5826) (8e431be)

### Bug Fixes

* **Banner:** isolate banner visibility using per-instance CSS variables (#5751) (c7332eb)
* **Banner:** prevent XSS via id prop injection (4e334a0)
* **CommandPalette/ContextMenu/DropdownMenu:** keyboard selection on link items (3f5bdb3)
* **CommandPalette:** prevent XSS in search highlight (e12ceb6)
* **ContentSurround:** align next link to right on tablet without prev (#5833) (b3adccc)
* **defineShortcuts:** check shift modifier for special character shortcuts (bd344d7), closes #5911
* **Editor:** set `contentType` when updating value (c37d6f7), closes #5709
* **Editor:** support all heading levels by default (3046c3e)
* **EditorToolbar:** prevent `onClick` from being called twice on items (cbed0cc), closes #5784
* **EditorToolbar:** prevent disabled dropdown when items have no kind (d473f63)
* **Error/Main:** render as `main` instead of `div` (6ccb1f5)
* **FileUpload:** emit null when clearing file (#5892) (1d9a2fd)
* **FileUpload:** keep input visible when preview is disabled with multiple files (597ac29), closes #5875
* **locale:** improve `cs` and `sk` terminology for correct inflection (#5789) (af6f288)
* **module:** only override `primary` color and `md` size default variants (f422de8)
* **ProseCodeTree:** prevent infinite update loop with `expandAll` prop (c79cb77), closes #5828
* **useOverlay:** refine close event argument extraction (#5775) (182af20)

## 4.3.0 (2025-12-17)

### Features

* **AuthForm:** allow all input types (#5565) (1f9009f)
* **ContextMenu/DropdownMenu:** expose `sub` prop on content slots (#5609) (b09e6bc)
* **defineShortcuts:** add `layoutIndependent` option (#4251) (ece0568)
* **Editor:** new component (#5407) (38765c3)
* **extractShortcuts:** add `separator` option (#5642) (4e71271)
* **FormField:** add `orientation` prop (#5632) (b74ec6e)
* **InputMenu/Select/SelectMenu:** add `modelModifiers` prop (#5559) (a92ee7b)
* **locale:** add Basque language (#5689) (748d78f)
* **locale:** add English (United Kingdom) language (#5561) (b0139f0)
* **locale:** add Lao language (#5556) (f5f9885)
* **module:** generate `[@source](https://github.com/source)` for nuxt layers (#5630) (de98a72)
* **ProseCodeTree:** add `items` prop (cb34ca5)
* **ScrollArea:** new component (#5245) (effbb18)
* **Slideover:** add `inset` prop (05bd995)
* **unplugin:** add `router` option to disable router (#5213) (b34cf8a)
* **unplugin:** add `scanPackages` option (#5510) (4e57139)

### Bug Fixes

* **BlogPost/ChangelogVersion/PageFeature/User:** allow tab focus (47d93d3), closes #5635
* **Carousel:** consistent stopOnInteraction behavior (#5489) (36a7861)
* **Carousel:** improve dots focus styles (cc90fb8)
* **ColorModeButton:** improve icon class merging (2ce9af2)
* **ContentSearch/DasboardSearch:** set full height on mobile to prevent jump (70317e5)
* **DashboardResizeHandle:** allow hover over panel with `z-index` (07147f1)
* **EditorDragHandle:** add missing `UButton` import (1b850bb)
* **EditorToolbar:** map dropdown items recursively to support `kind` (feb756d)
* **FormField:** hide error if error prop is false (#5599) (6b7fe25)
* **InputDate/InputTime:** add missing field group variant (#5596) (cb3cec2)
* **PageCard/PageCTA/PageSection:** handle `reverse` prop under lg screens (#5545) (60b430c)
* **ProseA/ProseCallout/ProseCard:** improve focus styles (df5f8c2)
* **Slider:** add `aria-label` to thumb (#5313) (f99ec46)
* **Table:** only forward necessary props (#5527) (b0b209e)
* **Table:** properly position pinned columns based on `size` (e885b0e), closes #4721 #3927

## 4.2.1 (2025-11-21)

### Bug Fixes

* **ChatPromptSubmit:** proxy event to `stop` and `reload` emits (#5400) (736a547)
* **ColorModeButton:** missing icon import (5f30ccf), closes #5486
* **Icon:** improve `name` type (#5498) (b654a77)
* **Link:** define NuxtLinkProps instead of importing from `#app` (#5491) (da8daaa)
* **Link:** ensure consistency across Nuxt, Vue and Inertia (a9ed10d), closes #5012
* **module:** put back `#build/ui.css` alias (#5499) (d9aadc7)

## 4.2.0 (2025-11-18)

###  BREAKING CHANGES

* **components:** consistent exposed refs (#5385)
* **module:** properly export composables from module

### Features

* **components:** add `data-slot` attributes (#5447) (dd81d46)
* **components:** extend native HTML attributes (#5348) (5b17751)
* **FileUpload:** add `preview` prop (#5443) (2af82e7)
* **InputDate:** new component (#5387) (dabc4f8)
* **InputTime:** new component (#5302) (936253f)
* **locale:** add Albanian language (#5461) (3331533)
* **locale:** add Galician language (#5393) (e93bfd4)
* **Modal:** add `scrollable` prop (#5306) (240897e)
* **module:** add `theme.prefix` option (#5341) (7fca5d7)
* **Table:** handle virtualizer `estimateSize` as function (ebc8568)

### Bug Fixes

* **AuthForm:** ensure header is shown with `leading` slot (#5405) (b61127a)
* **AuthForm:** use password input id for aria-controls (#5312) (55ea9be)
* **ChatPrompt:** proxy `disabled` prop (a8f2156), closes #5300
* **CheckboxGroup/RadioGroup/Switch:** consistent disabled styles (ddd8faf), closes #5391
* **ColorModeButton:** use css to display color mode icon (#5394) (1d1c638)
* **CommandPalette/ContentSearch:** improve performances and filtering logic (#5433) (e751b37)
* **components:** calc virtualizer estimateSize based on item description (56ae8e7)
* **components:** clean html attributes extend (fda3c98), closes #5348
* **components:** consistent exposed refs (#5385) (fce2df4)
* **components:** remove `locale` / `dir` props proxy (#5432) (a6efa7a)
* **ContentNavigation/NavigationMenu/Tabs:** ensure proper badge display (e5c11e6)
* **ContentSearchButton/DashboardSearchButton:** hide label and trailing with css when collapsed (3e72bf8)
* **FileUpload:** ensure native validation works with required (#5358) (eb491e1)
* **Form:** refine `nested` prop type handling and simplify logic (#5360) (8d5c26f)
* **inertia:** set serverRendered dynamically to prevent SSR crash (#5396) (c0da1b2)
* **Input/InputNumber/Textarea:** make `modelModifiers` generic (#5361) (5c347af)
* **InputMenu:** prevent change event when selecting create item (418c87b), closes #4664
* **Link:** partial extend for `vue-router` and `inertia` (637ef58)
* **Marquee:** move keyframes into global css (1e6242e)
* **module:** detect lazy components when using `experimental.componentDetection` (5a5ac45)
* **module:** properly export composables from module (cb25902), closes #5370
* **module:** scan layers when using component detection (9872740), closes #5389
* **NavigationMenu:** hide label and trailing with css when collapsed (f004031), closes #4254
* **NavigationMenu:** proxy `modelValue` / `defaultValue` in vertical orientation (cffaaaa), closes #5392
* **ProseCallout:** add `inline-block` class to icon (#5317) (fc36f69)
* **RadioGroup:** update `update:modelValue` emit type (#5349) (4cb0638)
* **Table:** apply styles to `th` based on column meta (#5418) (620defa)
* **types:** export missing utils types (#5448) (5f0a107)
* **vite:** write theme templates (#5355) (411ebcc)
* **vue:** check `import.meta.env.SSR` to support `vite-ssg` (#5347) (8f38c04)

## 4.1.0 (2025-10-23)

###  BREAKING CHANGES

* **CommandPalette:** add `children-icon` prop to use `trailing-icon` in input (#4397)
* **Table:** consistent args order in select event

### Features

* **Calendar:** add `variant` prop (#5138) (bb4f42c)
* **CommandPalette:** add `children-icon` prop to use `trailing-icon` in input (#4397) (edda8a6)
* **CommandPalette:** preserve group order in search results (#5197) (38647a2)
* **components:** expose `ui` in slot props where used (#5207) (63c0a5f)
* **components:** handle `description` in items (#5193) (70cf05f)
* **components:** implement virtualization (#5162) (c744d6f)
* **Empty:** new component (#5200) (6a6de8d)
* **InputNumber:** handle `increment` / `decrement` as booleans (#4805) (1858908)
* **locale:** add Croatian language (#5293) (b84d67b)
* **module:** add `experimental.componentDetection` option (#5222) (f80474c)
* **Popover:** add `close` method in slots (#5176) (53c6508)
* **ProseImg:** improve `zoom` transition (#4998) (d502c30)
* **Tree:** add global event handlers and checkbox example (#5195) (84f87a5)
* **Tree:** expose `$el` for drag and drop example (#5239) (fcf6117)
* **Tree:** provide additional slot props (#5194) (c8b01c9)
* **useToast:** handle `max` global configuration (#5068) (e4c6113)

### Bug Fixes

* **BlogPost/ChangelogVersion:** allow any attrs in`image` prop (9632f99), closes #5276
* **Breadcrumb:** handle `active` in items (cc8cbf3), closes #4771
* **ChatMessage:** ensure left side takes full width (af8c023)
* **ChatMessage:** only apply max-width on right side (a85b0e1)
* **ChatMessage:** reset top and bottom margin (8f9176c)
* **ChatMessages:** allow user scroll with `should-auto-scroll` (#5252) (db73765)
* **ChatMessages:** define user & assistant `ui` prop type (#5234) (240bc1a)
* **CodeTree/Tree:** restore item wrapper with `presentation` role (70aaf4a), closes #4945
* **CommandPalette/ContextMenu/DropdownMenu:** ensure items truncate work (9d13653)
* **components:** add missing `ui` prop in prose proxy components (#5205) (d1afe90)
* **ContentSearch:** de-duplicate description and suffix (8a259e4)
* **ContextMenu/DropdownMenu:** allow item content class override (ab5032d), closes #5277
* **Drawer/Modal/Slideover:** remove close autofocus prevent (#5191) (8099440)
* **Error/Main:** render as `div` instead of `main` (2a09ac0), closes #4955
* **FileUpload:** handle disabling file delete button (08c30cf), closes #5249
* **FileUpload:** stuck focus while tabbing (#5128) (2477d44)
* **FileUpload:** use native img element for blob URLs preview (69906bc), closes #5121 #4824
* **InputMenu/SelectMenu:** enrich reusable template item prop (63074d6)
* **InputMenu:** ensure tag can be removed when number (028538a)
* **Kbd:** return original value and use `uppercase` class (#5238) (4095c9a)
* **NavigationMenu:** display trailing slot when badge not undefined (f24204f), closes #4670
* **Table:** consistent args order in select event (9526a1b)
* **Table:** expose `$el` instead of `rootRef` (c019f8f), closes #5230 #5162

### Reverts

* Revert "chore(readme): add DeepWiki badge (#5291)" (ca489f7), closes #5291

## 4.0.1 (2025-10-02)

### Bug Fixes

* **App:** allow global portal disabling (#5111) (7659fa1)
* **AuthForm:** export type with proper inference for field-specific props (#5106) (344f269)
* **Avatar:** remove redundant `img` role (066b8a1), closes #5044
* **Carousel:** ensure plugins init after client-side navigation (#5117) (21fbe63)
* **Carousel:** invert arrow keys in RTL direction (#5072) (fde53ee)
* **ChatMessages:** ensure content is render before scrolling (0db622a)
* **ChatMessages:** watch deep to handle streaming with `parts` (ff67fa3)
* **components:** add missing `data-orientation` for consistency (a9fe7c6)
* **ContentNavigation:** improve path matching and recursion with `default-open` (22ee075), closes #5112
* **ContentSearch/DashboardSearch:** proxy modal props to support fullscreen (095a0c1)
* **DashboardPanel/DashboardSidebar:** handle RTL mode (#5109) (fface35)
* **Drawer:** prevent unwanted close when dismissible is false (#5085) (2abdc21)
* **Drawer:** use full height/width for snapPoints (#5041) (b145768)
* **locale:** improve `ckb` translations (#5079) (3ee3a5e)
* **locale:** improve typography with ellipsis (#5052) (391f9f5)
* **Pagination:** make ellipsis non-interactive (#5081) (62f64cc)
* **Table:** empty cell value causing hydration errors (#5069) (44a38ea)
* **unplugin:** handle components resolution with subpath (31db8d9)
* **useKbd:** update escape key from `⎋` to `Esc` (#5076) (64d1589)
* **vue:** align `useCookie` stub with nuxt's default value handling (#5089) (f531807)

## 4.0.0 (2025-09-23)

## 4.0.0-beta.0 (2025-09-22)

### Bug Fixes

* **ChatMessages:** wrap indicator with slot (#5036) (c00bf30)
* **CheckboxGroup:** proxy generic to emits (ffa5b23)
* **Form:** flaky reactivity test (#5038) (263015c)
* **Form:** flaky reactivity tests (#5033) (817b902)
* **Form:** improve nested form validation handling (#5024) (77a554e)
* **Form:** remove `joi` and `yup` in favor of @standard-schema/spec (#5035) (723cf36)
* **InputMenu:** ensure to pass a string to items when multiple (9beccbb), closes #5018
* **InputTags:** add blur and focus event handlers on input (#5007) (3fd2614)
* **locale:** improve translations in `pt` locale (#5003) (725ef9b)
* **module:** only inject tailwindcss vite plugin once (#5008) (c2e39dd)
* **ProseImg:** add `w-full` by default (#4997) (de47add)
* **Tabs:** use nullish coalescing on item value (340fc48), closes #4804
* **Tree:** remove `value-key` in favor of `get-key` (#4999) (240ff42)
* **types:** allow arbitrary keys in tv config (#4992) (ae77b69)

## 4.0.0-alpha.2 (2025-09-17)

###  BREAKING CHANGES

* **Form:** don't mutate the form's state if transformations are enabled (#4902)

### Features

* **ContentNavigation:** handle collapsible false with type multiple (c42c2ab)
* **locale:** add Georgian language (#4973) (996478f)
* **locale:** add Swiss German language (#4962) (dcf17bb)

### Bug Fixes

* **Banner:** ensure `actions` slot renders (#4946) (5d6e1fc)
* **CodeTree/Tree:** improve accessibility (#4945) (117b4b3)
* **components:** dot notation type support for `labelKey` and `valueKey` (#4933) (11a0320)
* **components:** proxySlots reactivity (#4969) (3173bee)
* **components:** standardize naming for type interfaces (#4990) (788d2de)
* **FileUpload:** add missing `button` type (f33e43c), closes #4935
* **Form:** don't mutate the form's state if transformations are enabled (#4902) (99dbe81)
* **Form:** handling race condition on `clear` function (#4843) (2269b48)
* **InputMenu/Select/SelectMenu:** show falsy value when model value is falsy (#4882) (073dd14)
* **locale:** improve `id` name (#4890) (1b5d741)
* **Marquee:** handle RTL mode (#4887) (1846079)
* **Progress:** improve `status-position` when 0 (#4994) (0e1e44c)
* **types:** export missing tv types (#4971) (2bf273c)
* **types:** resolve ambient declaration error in `icons` type (#4991) (6ddf899)

### Performance Improvements

* **module:** do not block setup by importing plugin (#4923) (695d9f7)

## 4.0.0-alpha.1 (2025-09-01)

###  BREAKING CHANGES

* **components:** rename `nullify` modifier to `nullable` and add `optional` (#4838)
* **module:** update compatibility to nuxt 4
* **PageAccordion:** remove in favor of `Accordion` (#4734)
* **Marquee:** rename from `PageMarquee` (#4741)
* **FieldGroup:** rename from `ButtonGroup` (#4596)
* **components:** upgrade `ai-sdk` to v5 (#4698)

### Features

* **components:** rename `nullify` modifier to `nullable` and add `optional` (#4838) (83b0306)
* **components:** upgrade `ai-sdk` to v5 (#4698) (de7822f)
* **FieldGroup:** rename from `ButtonGroup` (#4596) (a0963eb)
* **Icon:** allow passing a component instead of a name (#4766) (61b603f)
* import `@nuxt/ui-pro` components (#4675) (5cb65cf)
* **Marquee:** rename from `PageMarquee` (#4741) (b6edce2)
* **module:** update compatibility to nuxt 4 (2aca598)
* **PageAccordion:** remove in favor of `Accordion` (#4734) (f70a3ff)

### Bug Fixes

* **AuthForm:** use `error` from form field (#4738) (00dfb6b)
* **BlogPost:** ensure date slot renders (#4743) (4514880)
* **ChangelogVersion/ChangelogVersions:** handle RTL mode (#4777) (f91c408)
* **ContentSearch/DashboardSearch:** make `ui.modal` work (946c2ec)
* **module:** add `[@source](https://github.com/source)` on components (a16465f), closes #4773
* **PageCard:** improve keyboard accessibility (#4733) (3029568)
* **ProseImg:** ensure unique motion layout id for images (#4720) (9480a0b)
* **unplugin:** handle components overrides in subdirectories (#4781) (69ee75e)

## 4.0.0-alpha.0 (2025-08-15)

###  BREAKING CHANGES

* **PageAccordion:** remove in favor of `Accordion` (#4734)
* **Marquee:** rename from `PageMarquee` (#4741)
* **FieldGroup:** rename from `ButtonGroup` (#4596)
* **components:** upgrade `ai-sdk` to v5 (#4698)

### Features

* **components:** upgrade `ai-sdk` to v5 (#4698) (9545fdd)
* **FieldGroup:** rename from `ButtonGroup` (#4596) (8aa96d1)
* import `@nuxt/ui-pro` components (#4675) (f6ae153)
* **Marquee:** rename from `PageMarquee` (#4741) (0a4d9b4)
* **PageAccordion:** remove in favor of `Accordion` (#4734) (1c63aab)

### Bug Fixes

* **AuthForm:** use `error` from form field (#4738) (314e661)
* **BlogPost:** ensure date slot renders (#4743) (44e0178)
* **ContentSearch/DashboardSearch:** make `ui.modal` work (99d3227)
* **PageCard:** improve keyboard accessibility (#4733) (6606fa3)
* **ProseImg:** ensure unique motion layout id for images (#4720) (841c369)

## 3.3.3 (2025-09-01)

### Features

* **useFormField:** export form errors injection key (#4808) (ec2bc0a)

### Bug Fixes

* **components:** broken types for `update:model-value` event (#4853) (7133f50)
* **Form:** default slot types (#4758) (a32cc37)
* **Form:** update `Form` interface to accept RegExp (#4821) (0c2d390)
* **InputMenu/Select/SelectMenu:** show placeholder when model value is falsy (#4825) (90b5daf)
* **InputMenu:** prevent `focus-outside` event on content (77b6b9a)
* **Link:** ensure target `_blank` is flagged as external for Inertia (#4746) (520b277)
* **Table:** ensure `colspan` calc for `loading` and `empty` states (#4826) (bdcc8c4)

## 3.3.2 (2025-08-14)

## 3.3.1 (2025-08-14)

### Features

* **Form:** support error RegExp in exposed methods (#4608) (b8b74a0)
* **Tree:** add `item-wrapper` slot (#4521) (411d937)
* **useOverlay:** return promise on `open` method (#4592) (58aac86)

### Bug Fixes

* **Drawer:** improve closing animation with `inset` prop (#4676) (9da1527)
* **FileUpload:** handle wildcard in dropzone `dataTypes` (#4671) (729bed4)
* **FileUpload:** improve file removal a11y (#4607) (f90bba0)
* **FileUpload:** open dialog on keyup (#4629) (8e9265e)
* **FileUpload:** prevent default on keydown (#4633) (68d8a98)
* **Input:** incorrect rendering of type `date` / `time` on iOS (#4715) (93cc83c)
* **InputMenu/Select/SelectMenu:** add display value fallback when no items found (#4689) (34ca811)
* **Select/InputMenu:** handle focus via label inside a FormField (#4696) (55dbcd2)
* **Tabs:** add missing Badge import (#4594) (fbec29c)
* **Toast:** add type for progress `ui` prop (#4677) (a8af85c)
* **Tooltip:** render only if `text` or `kbds` are present (#4568) (5e39cbb)

## 3.3.0 (2025-07-24)

### Features

* **CommandPalette:** add `footer` slot (#4457) (63730d6)
* **Drawer:** add `nested` prop (e2695ee), closes #4320
* **FileUpload:** new component (#4564) (35dbe6c)
* **Input/Textarea:** add `default-value` prop (#4404) (fb9e7bb)
* **InputMenu:** emit `remove-tag` event (#4511) (6ca7c8b)
* **InputTags:** add `max-length` prop (b96a1cc), closes #4405
* **Kbd:** add `color` prop & `soft` variant (#4549) (f336600)
* **module:** add `theme.defaultVariants` option (#4400) (35f90b9)
* **Popover:** add `reference` prop (b00e07f)
* **Table:** add `footer` support to display column summary (#4194) (c355cac)
* **Table:** add `style` to table and column `meta` (#4513) (1db21d1)
* **Table:** add row `hover` event (f903ec3), closes #2435
* **Table:** add support for `colspan` and `rowspan` (#4460) (7ef1933)
* **Table:** add support for context menu (f62c5ec), closes #4259
* **Tabs:** add badge on items (#4553) (62ab016)
* **Toast:** progress bar with Progress component (ec569e4)
* **Tooltip:** add `reference` prop (69a7b95), closes #4430

### Bug Fixes

* **Button/Link:** merge `active-class` / `inactive-class` with app config (#4446) (9debce7)
* **Button:** add `active` styles to behave like `hover` on mobile (df8f202), closes #991
* **Carousel/Tree:** add type to button elements for accessibility (#4493) (fc24e03)
* **Carousel:** add `aria-current` attribute to active dot (#4447) (1ba8a55)
* **Carousel:** improve accessibility (55e06e9), closes #4494
* **Carousel:** resolve plugins with page transitions (#4380) (3b67d54)
* **ColorPicker:** update color conversion logic (#4550) (6b6ec8c)
* **CommandPalette:** remove `rtl:space-x-reverse` from label (#4576) (4682ded)
* **defineShortcuts:** allow extra keys to be combined with `shift` (#4456) (772631c)
* **defineShortcuts:** always pass event to shotcut handler (#4516) (ef473c3)
* **FileUpload:** handle RTL mode (#4585) (02161ed)
* **FormField:** improve `error` type with boolean (a4d0ca7), closes #4496
* **FormField:** resolve minor accessibility and rendering issues (#4515) (c64c4cd)
* **InputMenu/SelectMenu:** filter null items in search (488707e)
* **InputMenu/SelectMenu:** improve display value without `valueKey` (4d4234d), closes #4528
* **InputMenu/SelectMenu:** only filter non-null fields (c92f908), closes #4509
* **InputMenu:** reset search term on mounted (cb160e6), closes #3993
* **module:** merge user's options when installing modules (78f92a2)
* **NavigationMenu/Tabs:** display badge when not undefined (b22891a)
* **NavigationMenu/Tabs:** proxy fallthrough attributes (836f748)
* **RadioGroup:** improve type safety for normalizeItem function (#4535) (bb99345)
* **Table:** add `scope` attribute to headers (#4417) (347694b)
* **Table:** handle reactive columns (#4412) (4ce6540)
* **theme:** colors autocomplete in app config (752e2b6)
* **Toast:** only show progress when open (1d052ec), closes #4464
* **Tooltip:** display separator only with `text` and `kbds` (#4570) (63476e5)
* **useLocale:** ensure inject defaults to `en` (df1abf1), closes #4579
* **useLocale:** prevent hydration error when switching locale (15c7991)
* **useOverlay:** don't use `patch` when passing props to `open` (#4497) (5ad7dab)
* **useOverlay:** improve props handling by merging existing and new (#4478) (6519a74)
* **useOverlay:** support infering close argument from complex emits (#4414) (d7aefa5)
* **vue:** handle override when importing from `@nuxt/ui` (57a5037)
* **vue:** stub `clearError` (d8160ba)

## 3.2.0 (2025-06-25)

###  BREAKING CHANGES

* **useOverlay:** correct spelling of `unmount` function (#4051)

### Features

* **Avatar:** add `chip` prop (#4224) (03ac395)
* **Carousel:** allow customization of active dot color (#4229) (2ee1c5a)
* **CommandPalette:** handle `children` in items (#4226) (59c26ec)
* **extendLocale:** new composable (0f558fc), closes #3729
* **Form:** expose loading state to default slot (#4247) (ea0c459)
* **InputTags:** new component (#4261) (54bb228)
* **locale:** add Luxembourgish language (#4264) (43cbb94)
* **Modal/Slideover:** add `actions` slot (#4358) (8156971)
* **Modal/Slideover:** add `close` method in slots (#4219) (5835eb5)
* **Select/SelectMenu/Tabs:** expose trigger refs (7a2bd4e), closes #4292
* **Select/SelectMenu:** handle dynamic `autofocus` (1a4de49), closes #4324
* **Table:** add `body-top` / `body-bottom` slots (#4354) (595fc64)
* **Timeline:** add `reverse` prop (#4316) (5170cfd)
* **Timeline:** new component (#4215) (8017767)

### Bug Fixes

* **Card/Drawer/Modal:** prevent scrollbars overflow (#4368) (c3adc38)
* **components:** remove default `md` size on buttons (#4357) (be41aed)
* **defineShortcuts:** allow `meta_-` shortcut (#4321) (4e7c1c9)
* **Form:** conditionally type form data via `transform` prop (#4188) (37abcc6)
* **Form:** expose reactive fields (#4386) (1a8feb7)
* **InputMenu/SelectMenu:** dynamic `empty` size (ba3c6e8), closes #4377
* **InputTags:** extend emits interface (8781a07)
* **Modal/Slideover:** don't emit `close:prevent` on `closeAutoFocus` (150b334)
* **NavigationMenu:** nested accordion context at every level (#4363) (2fa8db6)
* **NavigationMenu:** set content `max-height` in `horizontal` orientation (62bc7b2), closes #4208
* **Pagination:** match default button `size` (#4350) (4dd56c8)
* **Select/SelectMenu:** display falsy values (7df7ee3)
* **Select/SelectMenu:** prevent empty string display when multiple (483e473)
* **SelectMenu:** dynamic input size (b0364b9)
* **Table:** use `tr` as separator (#4083) (edca3bc)
* **Toast:** calc height on next tick (3bf5acb), closes #4265
* **Toaster:** smoother visibility transition for stacked toasts (#4367) (abfd0ed)
* **useOverlay:** correct spelling of `unmount` function (#4051) (546df57)
* **useOverlay:** set props to original props when `defaultOpen` is set (#4308) (66355ba)
* **useOverlay:** use original props when not provided to `open` (#4269) (bf56e15)

## 3.1.3 (2025-05-26)

###  BREAKING CHANGES

* **NavigationMenu:** revert new `collapsible` field

### Features

* **locale:** add Kyrgyz language (#4189) (4053047)
* **locale:** add Lithuanian language (#4171) (d86956e)
* **locale:** add Malay language (#4160) (c00f6e8)
* **locale:** add Mongolian language (#4214) (44ea02c)
* **Modal/Slideover:** add `after:enter` event (#4187) (d9e9fea)
* **NavigationMenu:** add `tooltip` and `popover` props (f2682fd), closes #4186
* **NavigationMenu:** add `trigger` type in items (9cf9f25)
* **NavigationMenu:** handle `vertical` orientation with Accordion instead of Collapsible (1e2a10b), closes #4072 #3911
* **Popover:** add `anchor` slot (#4119) (473513c)

### Bug Fixes

* **CheckboxGroup/RadioGroup:** variant `table` borders in RTL mode (#4192) (43d281f)
* **CommandPalette:** add `presentation` role to viewport (2ba94db)
* **ContextMenu/DropdownMenu:** wrap groups in a viewport (dcf34a7), closes #3315
* **Drawer:** improve title & description accessibility (41087d4), closes #4199
* **icons:** update `loading` icon (#4163) (fe4e1f8)
* **Input/Textarea:** define model modifiers types (#4195) (3243fb8)
* **InputMenu/Select/SelectMenu:** manual viewport to display scrollbars (f95abf8), closes #4069
* **NavigationMenu:** incorrect hover when disabled and active (d0be599)
* **NavigationMenu:** only display `tooltip` when collapsed (44f536f)
* **NavigationMenu:** remove `font-medium` in popover children (0236399)
* **NavigationMenu:** revert new `collapsible` field (3c78e2f)
* **Textarea:** missing imports (#4207) (6aab62e)
* **theme:** define `old-neutral` color as static (#4193) (dae9f0b)
* **Tooltip:** increase padding for consistency (0634a75)

## 3.1.2 (2025-05-15)

### Features

* **Badge:** add `square` prop (#4008) (894e8a6)
* **CheckboxGroup:** add `table` variant (#3997) (1b6ab27)
* **components:** add `ui` field in items (#4060) (b9adc83)
* **InputNumber:** add `increment-disabled` / `decrement-disabled` props (#4141) (c7fba2e)
* **locale:** add Slovenian language (#4140) (e86dc79)
* **NavigationMenu:** add `collapsible` field in items (2be60cd), closes #3353 #3911
* **NavigationMenu:** handle `tooltip` in items (46c2987), closes #4050
* **Slider:** handle `tooltip` around thumbs (d140acc), closes #1469
* **Toast:** add `progress` prop to hide progress bar (#4125) (92632e9)

### Bug Fixes

* **Badge/Button:** handle zero value in label correctly (#4108) (f244d15)
* **ButtonGroup:** add `z-index` on focused element (204953b)
* **Calendar:** wrong color for today date with `neutral` color (7d51a9e), closes #4084 #3629
* **Checkbox/RadioGroup:** render correct element without `variant` (f2fd778), closes #3998
* **CheckboxGroup:** relative `UCheckbox` import (7551a85), closes #4090
* **ColorPicker:** make thumb touch draggable (#4101) (cc20a26)
* **components:** `class` should have priority over `ui` prop (e6e510b)
* **FormField:** block form field injection after use (#4150) (d79da9d)
* **FormField:** use `div` for `error` and `help` slots (459a041)
* **inertia:** link always render as anchor tag (#3989) (e81464a)
* **inertia:** make `useAppConfig` reactive (12303a8)
* **Input/Textarea:** handle generic types (3c8d6cd), closes nuxt/ui-pro#887
* **InputNumber:** handle inside button group (2e4c308), closes #4155
* **Link:** consistent behavior between nuxt, vue and inertia (#4134) (67da90a)
* **module:** configure `@nuxt/fonts` with default weights (276268d)
* **NavigationMenu:** arrow position conflict (#4137) (0dc4678)
* **Select:** support more primitive types in `value` field (#4105) (09b4699)
* **Slider:** handle generic types (d7a4d02)
* **Stepper:** use `div` tag for `title` & `description` (a57844e), closes #4096
* **Tabs:** prevent trigger truncate without parent width (06e5689), closes #4056
* **Tabs:** set `focus:outline-none` with `link` variant (999a0f8)
* **templates:** dont write unused variants in theme files (d3df3bb)
* **Toaster:** allow `base` slot override (c63d2f3)
* **vue:** make `useAppConfig` reactive (869c070), closes #3952

## 3.1.1 (2025-05-02)

### Features

* **useOverlay:** add `closeAll` method (#3984) (ac4c194)
* **useOverlay:** add `isOpen` method to check overlay state (#4041) (a4f3f6d)

### Bug Fixes

* **Calendar:** add `place-items-center` to grid row (#4034) (8dfdd63)
* **defineShortcuts:** bring back `meta` to `ctrl` convert on non macos platforms (f3b8b17), closes #3869 #3318
* **module:** support `nuxt-nightly` (#3996) (bc0a296)
* **NavigationMenu:** remove `sm:w-auto` from content slot (aebf0b3), closes #3987
* **RadioGroup:** improve items `value` field type (#3995) (195773e)
* **templates:** put back args to watch in dev (#4033) (c5bdec0)
* **theme:** add missing `border-bg` / `divide-bg` utilities (82b5f32)
* **theme:** add missing `ring-offset-*` utilities (#3992) (e5df026)
* **theme:** define default shades for named tailwindcss colors (8acf3c5), closes #3977
* **theme:** improve app config types for `ui` object (591d59f), closes #3579
* **theme:** use `[@theme](https://github.com/theme) inline` to properly reference css variables (6131871), closes #4018
* **useOverlay:** improve types and docs (#4012) (39e29fc)

## 3.1.0 (2025-04-24)

###  BREAKING CHANGES

* **OverlayProvider:** return an overlay instance from `.open()` (#3829)

### Features

* **App:** add global `portal` prop (#3688) (29fa462)
* **Carousel:** add `select` event (#3678) (22edfd7)
* **CheckboxGroup:** new component (#3862) (9c3d53a)
* **components:** add new `content-top` and `content-bottom` slots (#3886) (1a46394)
* **Form:** add `attach` prop to opt-out of nested form attachement (#3939) (1a0d7a3)
* **Form:** export loading state (#3861) (fdee252)
* **InputMenu/SelectMenu:** handle `resetSearchTermOnSelect` (cea881a), closes #3782
* **InputNumber:** add support for `stepSnapping` & `disableWheelChange` props (#3731) (f5e6284)
* **locale:** add Bulgarian language (#3783) (a0c9731)
* **locale:** add Kazakh language (#3875) (43153c4)
* **locale:** add Tajik language (#3850) (f42a79b)
* **locale:** add Uyghur language (#3878) (b7fc69b)
* **Modal/Popover/Slideover:** add `close:prevent` event (#3958) (f486423)
* **module:** define default color shades (#3916) (7ac7aa9)
* **module:** define neutral utilities (#3629) (d49e0da)
* **module:** dynamic `rounded-*` utilities (#3906) (f9737c8)
* **OverlayProvider:** return an overlay instance from `.open()` (#3829) (f3098df)
* **PinInput:** add `autofocus` / `autofocus-delay` props (0456670), closes #3717
* **RadioGroup:** add `card` and `table`  variants (#3178) (4d138ad)
* **Select:** handle `onSelect` field in items (8640831)
* **Table:** conditionally apply classes to `tr` and `td` (#3866) (80dfa88)
* **Tabs:** add `list-leading` and `list-trailing` slots (#3837) (3447a06)
* **Textarea:** add `autoresize-delay` prop (06414d3), closes #3730
* **Textarea:** add `icon`, `loading`, etc. props to match Input (cb193f1)
* **Textarea:** add `resize-none` class with `autoresize` prop (ffafd81)
* **unplugin:** routing support for inertia (#3845) (d059efc)

### Bug Fixes

* **Accordion:** use `div` instead of `h3` for header tag (75e4792), closes #3963
* **Alert/Toast:** display actions when using slots (5086363), closes #3950
* **Carousel:** move arrows inside container on mobile (d339dcb), closes #3813
* **CheckboxGroup:** proxy slots & `ui` prop (bc06185)
* **CommandPalette:** consistent alignement with other components (d25265c)
* **CommandPalette:** increase input font size to avoid zoom (d227a10)
* **CommandPalette:** prevent hover background on disabled items (ba534f1)
* **components:** refactor types after `@nuxt/module-builder` upgrade (#3855) (39c861a)
* **components:** respect `transform-origin` in popper content (#3919) (01d8dc7)
* **ContextMenu/DropdownMenu:** handle RTL mode (#3744) (1ae5cc0)
* **ContextMenuContent/DropdownMenuContent:** remove unwanted `any` (#3741) (97274f1)
* **Form:** input and output type inference (#3938) (f429498)
* **Form:** loses focus on submit (#3796) (8e78eb1)
* **InputMenu/Select/SelectMenu:** add `min-w-fit` to `content` slot (#3922) (f6b3761)
* **InputMenu/SelectMenu:** correctly call `onSelect` events (#3735) (f25fed5)
* **InputMenu/SelectMenu:** prevent `disabled` items to be selected (8435a0f), closes #3474
* **InputMenu/SelectMenu:** remove `valueKey` string case (9ca213b), closes #3949 #3331
* **InputMenu/SelectMenu:** support arbitrary `value` (#3779) (52a97e2)
* **InputMenu:** emit `change` on multiple item removal (9d2fed1), closes #3756
* **Link:** proxy `download` property (#3879) (47cdc2e)
* **NavigationMenu:** add `sm:w-auto` content slot (abe0859), closes #3788
* **Skeleton:** improve accessibility (#3613) (3484832)
* **Stepper:** ui prop override on `icon` and `content` slots (1d45980), closes #3785
* **Table:** improve `data` reactivity (#3967) (6e27304)
* **Table:** pass header `colspan` to `th` (#3926) (122e8ac)
* **Tree:** simplify reusable template types (#3836) (3deed4c)
* **types:** allow color identifiers with dashes (#3896) (e5a1e26)
* **types:** handle `ClassValue` in `ui` prop (eea1415), closes #3860
* **types:** improve dynamic slots (#3857) (8dd9d08)
* **usePortal:** adjust portal target resolution logic (#3954) (db11db6)
* **vite:** vitest skipping nuxt imports transformations (#3925) (c31bffa)

## 3.0.2 (2025-03-28)

### Features

* **Calendar:** allow year and month buttons styling (#3672) (4a2b77d)
* **locale:** add Armenian language (#3664) (c76f590)
* **Table:** add `empty` prop (afff54f)

### Bug Fixes

* **Avatar:** proxy `$attrs` to default slot (#3712) (88f349d)
* **Button:** use `focus:outline-none` instead of `focus:outline-hidden` (c231fe5), closes #3658
* **CommandPalette:** use `group.id` as key (bc61d29)
* **components:** improve generic types (#3331) (b998354)
* **Container:** add `w-full` class (df00149)
* **defineLocale/defineShortcuts:** remove `@__NO_SIDE_EFFECTS__` (82e2665)
* **Drawer:** remove `fadeFromIndex` prop proxy (f7604e5)
* **Form:** clear dirty state after submit (#3692) (3dd88ba)
* **FormField:** add `help` to `aria-describedby` attribute (#3691) (20c3392)
* **InputMenu/SelectMenu:** empty search results (94b6e52)
* **InputMenu:** reset `searchTerm` on `update:open` (3074632), closes #3620
* **Link:** handle `aria-current` like `NuxtLink` / `RouterLink` (c531d02)
* **Link:** prevent `active="true"` binding on html (d73768b)
* **Link:** properly pick all `aria-*` & `data-*` attrs (ade16b7)
* **Link:** proxy `onClick` (370054b), closes #3631
* **NavigationMenu:** add `z-index` on viewport (0095d89), closes #3654
* **Switch:** prevent transition on focus outline (68787b2)
* **Table:** wrong condition on `caption` slot (4ebb94c)
* **Tabs:** remove `focus:outline-hidden` class (1769d5e)
* **types:** add missing export for ButtonGroup (#3709) (e7e6745)
* **useOverlay:** refine `open` method type to infer close emit return type (#3716) (bd99c2d)
* **vue:** mock `nuxtApp.hooks` & `useRuntimeHook` (23bfeb9)

## 3.0.1 (2025-03-21)

###  BREAKING CHANGES

* **Form:** drop explicit support for `zod` and `valibot` (#3617)

### Features

* **components:** handle events in `content` prop (5dec0e1)
* **locale:** add Catalan language (#3550) (53cf1b4)
* **locale:** add Central Kurdish language (#3566) (b2034cc)
* **locale:** add Romanian language (#3587) (0229b0f)
* **locale:** add Urdu language (#3611) (126ba23)
* **locale:** add Uzbek language (#3548) (302e04b)

### Bug Fixes

* **Calendar:** grey out days outside of displayed month (#3639) (a516866)
* **ContextMenu/DropdownMenu:** remove `any` from `proxySlots` (#3623) (764c41a)
* **Modal/Slideover/Toast:** prevent unnecessary close instantiation (f4c417d)
* **module:** handle tailwindcss import without `theme(static)` (#3630) (ecff9ab)
* **module:** mark functions used in exports as pure (#3604) (57efc78)
* **RadioGroup:** handle `disabled` on items (fe0bd83), closes nuxt/ui-pro#911
* **Table:** allow links to be opened when @select is used (#3580) (e80cc15)
* **types:** add missing export for Icon (#3568) (5e62493)
* **unplugin:** include `@compodium/examples` in auto-imports paths (#3585) (cc504b8)
* **useLocale:** unique symbol to use in `@nuxt/ui-pro` (#3603) (dec2730)
* **vue:** missing unhead context (#3589) (0897e9e)

### Code Refactoring

* **Form:** drop explicit support for `zod` and `valibot` (#3617) (9a4bb34)

## 3.0.0 (2025-03-12)

## 3.0.0-beta.4 (2025-03-12)

### Features

* **Form:** global errors (#3482) (6e03d9c)
* **Input/Textarea:** allow `null` value in model (#3415) (cfe9b2e)
* **useLocale:** handle generic messages (#3100) (a9c8eb3)

### Bug Fixes

* **Button:** missing import (21dbf01), closes nuxt/ui#3417
* **Form:** input blur validation on submit (#3504) (97c8098)
* **vue:** prevent calling `useHead` in colors (5ecd227)

## 3.0.0-beta.3 (2025-03-07)

### Features

* **Button:** handle `active` state (bd2d484), closes #3417
* **Table:** add `loading` slot (99e531d), closes #3444

### Bug Fixes

* **InputMenu/SelectMenu:** proxy `required` in root props (60b7e2d)
* **InputMenu:** wrong `required` in multiple mode (01fa230), closes #2741
* **Pagination:** add missing slots (a47c5ff), closes #3441
* **Pagination:** wrong next link (e823022), closes #3008
* **templates:** prevent overriding existing colors (ccbd89c), closes #3426

## 3.0.0-beta.2 (2025-02-28)

### Bug Fixes

* **OverlayProvider:** missing import (c555c16)
* **useOverlay:** missing imports (0e3c63e)

## 3.0.0-beta.1 (2025-02-28)

###  BREAKING CHANGES

* **module:** remove devtools in favor of compodium (#3380)
* **useOverlay:** handle programmatic modals and slideovers (#3279)

### Features

* **Form:** add prop to disable state transformation (#3356) (015ceac)
* **module:** remove devtools in favor of compodium (#3380) (7a8c00c)
* **Table:** add `select` event (#2822) (0668a39)
* **Tree:** new component (#3180) (71728d3)
* **useOverlay:** handle programmatic modals and slideovers (#3279) (108d36f)

### Bug Fixes

* **Avatar:** render on SSR (67e5465)
* **CommandPalette:** wrong ellipsis color (ada04f6)
* **components:** missing `$attrs` bind (#3152) (fb36df5)
* **Drawer/Modal/Slideover:** disable close autofocus (ae30f94), closes #3227
* **Form:** ensure loading state resets to false after an error (#3359) (19d76c8)
* **Link:** improve external links handling in vue (b53f77b)
* **Modal/Slideover:** add wrapper around title & description (bc01136)
* **Modal/Slideover:** fixed header height (d33a83e), closes #3333
* **Modal:** use `dvh` unit (aefa09c)
* **module:** use key when merging modules options (9821894)
* **Tooltip:** bind `$attrs` on trigger (637f5d3), closes #3339 #2897
* **vite:** exclude `@nuxt/ui` from vite pre-optimization (#3352) (09492f7)

## 3.0.0-alpha.13 (2025-02-17)

###  BREAKING CHANGES

* **useToast:** don't return a promise on `add`
* **Toast:** rename `click` to `onClick` for consistency
* **Alert/Toast:** add `orientation` prop

### Features

* **Alert/Toast:** add `orientation` prop (2c192ac)
* **Badge:** add support within button groups (#3224) (10fb843)
* **Card:** add `variant` prop (847d4aa)
* **CommandPalette:** support link props in items (e2b78a7), closes #3190
* **ContextMenu/DropdownMenu/NavigationMenu:** add `external-icon` prop (5846c1e), closes #2996
* **Drawer:** add `inset` prop (6d9b9ed), closes #2994
* **locale:** add Azerbaijani language (#3209) (0fb6753)
* **locale:** add Bengali (বাংলা) language (#3321) (1d09a2a)
* **module:** generate `tailwindcss` theme colors (#2967) (443a0be)
* **Table:** extends core options and support other options like `pagination` (#3177) (4aa3179)
* **Toast:** handle vnodes in `title` and `description` (abd2be1), closes #3226
* **unplugin:** expose options for embedded plugins, throw warnings for duplication  (#3207) (6c20f8a)
* **useToast:** proxy emits (089185f)

### Bug Fixes

* **App:** wrap `ModalProvider` / `SlideoverProvider` inside `TooltipProvider` (cd0a9d3), closes #3236
* **Badge:** missing `UAvatar` import (49dd088), closes #3203
* **Calendar/InputMenu/Textarea:** add missing `PartialString` type on `ui` prop (9d29e0b), closes #3299
* **Card:** remove `shadow-sm` for consistency (8097fff)
* **Link:** allow usage without `vue-router` in vue (f55e869), closes #3001
* **locale:** export `km` (#3201) (995e07d)
* **Modal/Slideover:** improve `title` & `description` accessibility (e419dcb), closes #3267 #3215
* **Modal:** always fullscreen on mobile (#2637) (7641d89)
* **NavigationMenu:** disable collapsible with `collapsed` prop (07e1b4f)
* **NavigationMenu:** remove negative mb causing overflow issues (0e46c3e)
* **NavigationMenu:** wrong `level` compute on `vertical` orientation (c1c9da4)
* **SelectMenu:** wrap content with `FocusScope` (e7e7585), closes #2657
* **Table:** proxy props without `useForwardProps` (f0553eb)
* **Toast:** rename `click` to `onClick` for consistency (533e889)
* **useToast:** don't return a promise on `add` (153f341)

## 3.0.0-alpha.12 (2025-01-27)

###  BREAKING CHANGES

* **ColorPicker:** migrate from `color` to `colortranslator` (#3097)
* **Form:** include nested state in submit data (#3028)

### Features

* **css:** add `light` variant to reverse colors (75f7064)
* **FormField:** set `aria-describedby`  and `aria-invalid`  attributes (#3123) (b95b913)
* **Form:** form validation properties (#3137) (c0b485d)
* **locale:** add Hebrew language (#3181) (f395877)
* **locale:** add Hindi language (#3170) (8e96daa)
* **locale:** add Hungarian language (#3129) (891ba1f)
* **locale:** add Khmer language (#3119) (64421a1)
* **locale:** add Norwegian Bokmål language (#3095) (9ccfe8f)
* **NavigationMenu:** add `collapsed` prop (3fc2210)
* **NavigationMenu:** add `contentOrientation` prop (ac86ee0)
* **NavigationMenu:** handle `label` type in items (27fdc8e), closes #2993

### Bug Fixes

* **Alert:** allow actions wrap (#3083) (e7c10bc)
* **Avatar:** handle loading manually to support `@nuxt/image` (00c5f26), closes nuxt/ui-pro#727
* **Avatar:** hide fallback when image is loaded (36d7402), closes nuxt/ui-pro#727
* **Button:** wrong avatar size with `block` prop (ba1dd13)
* **colors:** move css variables to `base` layer (533ccec), closes #3075
* **components:** prevent multiple `appConfig` identifier import (#3186) (cd16b95)
* **ContextMenu/DropdownMenu:** remove unnecessary bindings in html (9b5a957)
* **Form:** include nested state in submit data (#3028) (de9ecb1)
* **Form:** standard schema validation no longer wrapped in `value` object (#3104) (8f7f579)
* **locale:** remove emoji fallback for Chinese (#3134) (1a95104)
* **locale:** year translation missing `ñ` in `es` (#3090) (1bf370e)
* **NavigationMenu:** handle children recursively in vertical orientation (2b7ff3e), closes #3128
* **NavigationMenu:** highlight open items on `horizontal` orientation only (931211a)
* **useToast:** add in queue and improve unique ids (aafddd8), closes #2686

### Code Refactoring

* **ColorPicker:** migrate from `color` to `colortranslator` (#3097) (51e5e65)

## 3.0.0-alpha.11 (2025-01-13)

###  BREAKING CHANGES

* **Modal/Popover/Slideover:** rename `prevent-close` to `dismissible` + uniformize docs

### Features

* **Badge:** rework sizes (d9967f5)
* **CommandPalette:** add `autofocus` prop (#2942) (1b3c919)
* **locale:** add Danish language (#2952) (e1d385a)
* **locale:** add Estonian language (#3036) (01bf99e)
* **locale:** add Finnish language (#3013) (c770ae1)
* **locale:** add Greek language (#2975) (b326a14)
* **locale:** add Indonesian language (#3024) (a18ad84)
* **locale:** add Swedish language (#3012) (0201a3d)
* **locale:** add Thai language (#2980) (c8cd06e)
* **locale:** add Ukrainian language (#2908) (5efae59)
* **locale:** add Viet language (#2986) (ffba108)
* **module:** allow `tv` customization through `app.config` (#2938) (30ba53e)

### Bug Fixes

* **Accordion/Collapsible/NavigationMenu/Tabs:** define `unmountOnHide` default (4344e36)
* **Avatar:** bind `$attrs` on `AvatarFallback` (#2933) (7f64198)
* **Badge:** reduce radius on `sm` size (f97d2e3)
* **CommandPalette/SelectMenu:** missing translations (#3057) (d5dba0e)
* **components:** enable pointer events on menus (#2881) (f85b098)
* **defineShortcuts:** handle extract when using `onSelect` or `onClick` (#2896) (2e17fb6)
* **DropdownMenu/ContextMenu:** correct bindings of `checkbox` items (#2921) (4c5a4fb)
* **FormField:** restore `eager-validation` prop behavior (#3031) (41dc11c)
* **InputMenu:** removing `tag` does not change `modelValue` (#3054) (5a44394)
* **locale:** improve Traditional Chinese translation (#3051) (5c2c55f)
* **Modal/Popover/Slideover:** rename `prevent-close` to `dismissible` + uniformize docs (6fb426f)
* **NavigationMenu:** `arrow` styles after `reka-ui` migration (9759320)
* **NavigationMenu:** highlight border on children only with `vertical` orientation (e931880)
* **NavigationMenu:** remove `w-full` on root slot (ef7ecd2), closes #3000
* **NavigationMenu:** unbind link on collapsible trigger with `vertical` orientation (82d6344)
* **SelectMenu:** handle `resetSearchTermOnBlur` manually (#3082) (c902a40)
* **Stepper:** correct item `value` type (4f05b1a)
* **Stepper:** wrong `item` in `title` & `description` slots (473194f), closes #2888
* **templates:** allow any string in colors autocomplete (5183582), closes #2143
* **templates:** infer variants types in generated theme (2c99bb8)
* **unplugin:** invalid url schema on windows (#2899) (9b4694f)
* **vue:** head injection (#2929) (7302a84)

### Reverts

* Revert "chore(deps): update `typescript`" (3107039)
* Revert "chore(deps): update `@nuxt/module-builder`" (c79acc1)
* Revert "build: remove `cjs` support" (15b411d)

## 3.0.0-alpha.10 (2024-12-09)

###  BREAKING CHANGES

* **module:** migrate to `reka-ui` (#2448)
* **Form:** resolve async validation in yup & issue directly mutate state (#2702)

### Features

* **Avatar:** add `default` slot for fallback (b741ef3)
* **Calendar:** add `icon` props (#2778) (0f64802)
* **Calendar:** implement component (#2618) (2e9aeb5)
* **ColorPicker:** implement component (#2670) (e475b64)
* **CommandPalette:** add `active` field on items for consistency (3765537)
* **css:** use `color-scheme` utilities on body (a2512f6)
* **i18n:** add Dutch locale (#2728) (3baddfd)
* **i18n:** add Turkish locale (#2716) (de8228e)
* **locale:** add Brazilian Portuguese language (#2825) (b7ff7d8)
* **locale:** add Japanese language (#2794) (ecc4755)
* **locale:** add Portuguese language (#2855) (8b5d412)
* **locale:** add Slovak language (#2821) (68a10f0)
* **locale:** translate Korean (#2703) (2cbf83e)
* **module:** migrate to `reka-ui` (#2448) (81ac076)
* **NavigationMenu:** handle `item.trailingIcon` display (4b653ef)
* **Stepper:** new component (#2733) (6484d01)
* **Table:** handle `meta.class` on `th` and `td` (#2790) (004a577)

### Bug Fixes

* **Breadcrumb:** missing `aria-hidden` on presentation items (a7a1227), closes #2725
* **Calendar:** handle icons in RTL mode (#2770) (e7b69b7)
* **Calendar:** omit `as` / `asChild` props (9478fc0)
* **ColorPicker:** handle RTL mode (#2858) (f98b91c)
* **CommandPalette:** keep `ignoreFilter` groups at their place (#2833) (3b9ca22)
* **components:** apply class on `trigger` instead of `content` when present (a6ecef0), closes #2132
* **components:** specify collisionPadding to all menus (148b024)
* **ContextMenu:** remove close animation (#2798) (ed27222)
* **defineShortcuts:** return `useEventListener` to unregister the listener (80befc1), closes #2031
* **devtools:** error with renderer when `colorMode` is disabled (#2792) (f06fbaf)
* **Form:** resolve async validation in yup & issue directly mutate state (#2702) (c9806da)
* **icons:** make `loading` icon clockwise (#2797) (bc2bcb3)
* **Link:** partial query match for Vue (#2787) (a6c2205)
* **locale:** improve German translation (#2826) (c440c91)
* **Modal:** prevent from going out of screen (b7ba2c7), closes #2711
* **NavigationMenu:** wrong badge class (86f2b48), closes #2766
* **Progress:** handle `horizontal` animation in RTL mode (#2723) (0baa3a0)
* **Stepper:** handle RTL mode (#2844) (198d04d)
* **Stepper:** missing import (816bb69)
* **Table:** handle `loading` animation in RTL mode (#2771) (b1550d5)
* **Tabs:** prevent hover on disabled (a938d24)
* **Tabs:** truncate not working (c1ff978)
* **types:** handle array of strings in AppConfig (#2854) (4b241ba)
* **useLocale:** update locale import to enable tree shaking (#2735) (3bccb67)

## 3.0.0-alpha.9 (2024-11-19)

### Features

* **cli:** add locale command (#2586) (824ba56)
* **css:** add `--ui-bg-muted` / `--ui-border-muted` variables (7f6db45)
* **Form:** apply transformations (#2550) (75c5e87)
* **FormField:** add `error-pattern` prop (#2601) (143612e)
* **InputMenu/SelectMenu:** add `create-item` prop (#2472) (f516d7b)
* **InputNumber:** implement component (#2577) (bd2f077)
* **Link:** allow partial query match for its active state (#2664) (7329900)
* **locale:** add Persian language (#2682) (14fb21b)
* **locale:** add Polish language (#2678) (2fc36c8)
* **locale:** add support for Arabic (#2582) (602a667)
* **locale:** add support for Czech translation (#2593) (4889d30)
* **locale:** add support for Italian (#2583) (4fbbb25)
* **locale:** provide `code` (#2611) (8a8b1ee)
* **locale:** provide `dir` on `defineLocale` (#2620) (937585c)
* **locale:** translate chinese (#2580) (febda5c)
* **locale:** translate Spanish (#2644) (8ed434c)
* **locale:** typing `dir` (#2643) (e55c0e2)
* **module:** support i18n in components (#2553) (2636240)
* **NavigationMenu:** control items `open` & `defaultOpen` on vertical (30218f1), closes #2608
* **PinInput:** implement component (#2570) (95aa6f6)
* **Popover:** add `prevent-close` prop (ea97759), closes #2245
* **SelectMenu:** use `UInput` in search to handle props like icon (ff1e079), closes #2021
* **Table:** add `caption` prop (446f9c1)

### Bug Fixes

* **App:** missing `vue` imports (ddb4690)
* **App:** remove `dir` prop (#2630) (7cc26d0)
* **Breadcrumb/Carousel/Pagination:** handle icons in RTL mode (#2633) (e5119a9)
* **Breadcrumb:** render as `nav` (756f791), closes #2649
* **Button:** improve neutral solid variant hover (8d85498)
* **Carousel:** use `dir` from locale (#2647) (1fbbfe8)
* **ContextMenu/DropdownMenu:** relative imports with prefix (47f58f5)
* **css:** `--font-family-sans` renamed to `--font-sans` (#2680) (b2fa657)
* **css:** remove useless spacing override (8d00265)
* **FormField:** missing conditions to apply container classes (#2631) (9241ba1)
* **Form:** match `error-pattern` on input validation (#2606) (3584a33)
* **InputMenu/SelectMenu:** init `filter` with `labelKey` (18931ac)
* **InputMenu/SelectMenu:** look in `items` only with `value-attribute` (0ceafe1), closes #2464
* **InputMenu/SelectMenu:** multiple not working with generic boolean casting (503f701), closes #2541
* **InputMenu/SelectMenu:** use `isEqual` from `ohash` (f943f88)
* **Link:** missing relative import (#2588) (95a0bbc)
* **locale:** Improve German translation (#2676) (992be91)
* **locale:** it translation (#2623) (73e25ed)
* **locale:** Italian translation (#2584) (d167c9b)
* **Modal/Slideover:** prevent `esc` with `prevent-close` prop (9e2cc5b), closes #2501
* **module:** remove `fast-deep-equal` in favor of custom `isEqual` (37a3597)
* **module:** skip devtools renderer page injection if router integration is disabled (#2571) (afe4003)
* **PinInput:** missing `useFormField` import (601f4b2)
* **Textarea:** `autoresize` does not work when initializing `modelValue` (#2681) (d3a079a)
* **Toaster:** teleport to `body` (b0be26d), closes #2404
* **Toast:** unreachable behind overlays (#2650) (0daac5b)
* **useLocale:** missing import in various components (#2603) (df7a61a)

### Reverts

* Revert "docs(ComponentCode/ComponentExample): use relative imports" (5deadc7)

## 3.0.0-alpha.8 (2024-11-07)

###  BREAKING CHANGES

* **theme:** migrate from `heroicons` to `lucide` (#2540)

### Features

* **Avatar:** infer `width` / `height` on `<img>` based on `size` prop (c9adf33)
* **Avatar:** use `NuxtImg` component when available (f1a14dd), closes nuxt/ui#2078
* **Badge:** handle `icon` and `avatar` props (#2497) (2d52834)
* **components:** improve RTL support (#2433) (94c4918)
* **DropdownMenu/ContextMenu:** handle `color` field in items (#2510) (f66c96e)
* **InputMenu/Select/SelectMenu:** `arrow` prop implementation (#2503) (f26f6c8)
* **Kbd:** special keys for macOS and other systems (#2494) (332c6c0)
* **module:** add support for `vue` using `unplugin` (#2416) (d4a943e)
* **module:** devtools integration (#2196) (701c75a)
* **NavigationMenu:** add `item-content` slot (b5ca0d9)
* **Table:** customize `header` and `cell` through slots (#2457) (ef561e7)
* **theme:** migrate from `heroicons` to `lucide` (#2540) (a6c1a6c)

### Bug Fixes

* **ButtonGroup:** merge class with theme (d980115), closes nuxt/ui#2498
* **Carousel:** add missing `aria-label` on dots (#2489) (03dd1eb)
* **Chip:** proxy attrs to slot (8669553), closes nuxt/ui#2484
* **components:** missing relative imports (1a93d13), closes nuxt/ui#2515
* **InputMenu/Select/SelectMenu:** improve types (#2471) (db8111d)
* **InputMenu/SelectMenu:** `fast-deep-equal` import (309e52f), closes nuxt/ui#2488
* **module:** add `fast-deep-equal` in `optimizeDeps` (0bfe2b6)
* **module:** define `[#build](https://github.com/nuxt/ui/issues/build)/app.config` (12ae20d), closes nuxt/ui#2532
* **NavigationMenu:** add missing `min-w-0` to make truncate work (#2476) (1402436)
* **NavigationMenu:** enforce `data-orientation` (64ad4b6)
* **NavigationMenu:** improve generic types (#2482) (fc2015b)
* **Table:** types in undeclared slots (#2544) (f821e66)
* **Tabs:** same behaviour between `pill` and `link` variants (e592da2), closes #2338
* **templates:** type error in app config (77d18d8), closes nuxt/ui#2481
* **useKbd:** hydration issue (845f85a), closes #2494
* **utils:** improve `escapeRegExp` function (a97c511)

## 3.0.0-alpha.7 (2024-10-23)

###  BREAKING CHANGES

* **components:** rename `select` to `onSelect` on items

### Features

* **Accordion/Breadcrumb/CommandPalette/ContextMenu/DropdownMenu/NavigationMenu/Tabs:** add `labelKey` prop (acfc6ce)
* **Button:** handle `avatar` prop (a54c3e4)
* **CommandPalette:** handle `loading` field in items (49abad2)
* **ContextMenu/DropdownMenu:** handle `checkbox` items type (8ef6e71), closes #2144
* **ContextMenu/DropdownMenu:** handle `loading` field in items (b975235)
* **Form:** add `superstruct` validation (#2363) (5385944)
* **Input/InputMenu/Select/SelectMenu:** handle `avatar` prop (53a3796)
* **InputMenu/RadioGroup/Select/SelectMenu:** handle `labelKey` and use `get` to support dot notation (f6f9823)
* **NavigationMenu:** handle children on `vertical` orientation (#2384) (34bddd4)
* **Table:** implement component (#2364) (b54950e)

### Bug Fixes

* **AvatarGroup:** wrong ring on big sizes (61b2323)
* **Button:** invalid hover on `link` variant (df2013c)
* **Checkbox:** `indeterminate` prop not working (f6631ff)
* **components:** rename `select` to `onSelect` on items (b39c4d1)
* **css:** `font-sans` already applied on <html> (9e03da4)
* **css:** make `[@theme](https://github.com/theme)` default (a2bad2e)
* **Drawer/Modal/Slideover:** no need for `z-index` since its isolated (bcfa4b7), closes nuxt/ui#2347
* **Input/InputMenu/Select/SelectMenu:** uniformize placeholder color (f59844b)
* **InputMenu/SelectMenu:** escape regexp before search (7c21dde)
* **InputMenu/SelectMenu:** improve displayed value (0f9ac87), closes nuxt/ui#2353
* **InputMenu:** emit `focus` event (#2386) (7802aac)
* **module:** stop using tailwind's shorthand arbitrary variable syntax (#2366) (dcce571)
* **Slideover:** set max height on `top` / `bottom` positions (a68016e), closes nuxt/ui#2388

## 3.0.0-alpha.6 (2024-10-09)


###  BREAKING CHANGES

* **module:** implement design system with CSS variables (#2298)

### Features

* **Carousel:** implement component (#2288) (68ee3f1)
* **Form:** add Standard Schema support (#2303) (0955c07)
* **module:** implement `--ui-radius` CSS variable (#2341) (057e86c)
* **module:** set `disableTransition` option on `@nuxtjs/color-mode` (b82af02)


### Bug Fixes

* **Accordion:** use `text-left break-words` instead of `truncate` on label (6c7c2f0)
* **Alert:** default variant to `solid` for consistency (3a7c5c2)
* **Button:** center text with `block` prop (3cf5535), closes nuxt/ui#2317
* **Carousel:** move embla plugins to `dependencies` (bee04ad)


### Code Refactoring

* **module:** implement design system with CSS variables (#2298) (9368c6a)

## 3.0.0-alpha.5 (2024-10-02)


### Features

* **module:** enable `@nuxtjs/color-mode` (9dcf903)
* **module:** override `dark` variant with class strategy (0f86b87)


### Bug Fixes

* **Button:** props specified more than once (66a04ad)

## 3.0.0-alpha.4 (2024-10-01)


### Features

* **Drawer:** handle `direction` + `handle` props (5f77aac)


### Bug Fixes

* **Accordion:** missing `min-w-0` on trigger (6c28597)
* **build.config:** disable mkdist `addRelativeDeclarationExtensions` option (f54f607)
* **CommandPalette:** missing `min-w-0` on root (a61e765)
* **Drawer:** improve max-width on mobile (fac52fa)
* **InputMenu:** missing `group` on trailing (2c7c41b)
* **README:** npm badge link (#2271) (30c33c7)
* **templates:** app config colors type (96c9246)
* **Toast:** improve focus styles (1f9abda)


### Reverts

* Revert "chore(deps): refresh lock" (b83ecc9)

## 3.0.0-alpha.3 (2024-09-18)


### Features

* **module:** move `colors` options into `theme.colors` (2e95446)

## 3.0.0-alpha.2 (2024-09-18)


### Features

* **Button:** loading-auto (#2198) (ed18e74)
* **module:** improve options (5076b8c)
* **module:** install `@nuxt/fonts` by default (8898a5d)


### Bug Fixes

* **Button:** button link not showing disabled classes (#2189) (7c2adf2)
* **Button:** duplicate click handlers (#2213) (dd6bf56)
* **playground:** typecheck (cf92c5f)

## 3.0.0-alpha.1 (2024-09-11)


### Features

* **module:** hard-code css file to be imported anywhere (62a2643)


### Bug Fixes

* **ContextMenu/DropdownMenu:** lint unused var (a03a55c)
* import from `../types/index` (3e28c8f)
* **Link:** only bind necessary slot props (7fe7ff6)
* **NavigationMenu:** handle open state hover effect (84186e5)
* **plugins:** infer type from `[#app](https://github.com/nuxt/ui/issues/app)` to remove build warning (debf9cc)
* **README:** license link (71428da)
* **templates:** augment `@nuxt/schema` rather than `nuxt/schema` (40b3570)
* **types:** no longer need to import types with `/index` suffix (8277167)
* **useButtonGroup:** lint (97d0593)

## 3.0.0-alpha.0 (2024-09-05)


###  BREAKING CHANGES

* **module:** move `primary` and `gray` inside `colors` object
* **Link:** expose `active` instead of `isActive` in default slot

### Features

* **Accordion:** add `body` slot to solve animation flick (85d1723)
* **Accordion:** add `trailingIcon` prop (fc3d42d)
* **Accordion:** new component (a21648a)
* add `transition-colors` on hover effects (633a394)
* **Alert/CommandPalette/Modal/Slideover/Toast:** handle `closeIcon` and uniformize `close` prop (e4eef89)
* **Alert:** add `actions` slot (2d15709)
* **Alert:** new component (1535313), closes #23
* **Avatar:** bind `as` to image to support `NuxtImg` (cff37bf)
* **AvatarGroup:** new component (#71) (def5f7c)
* **Avatar:** new component (978595c)
* **Breacrumb/ContextMenu/DropdownMenu/NavigationMenu:** bind item `class` on link (d13e27e)
* **Breadcrumb:** new component (53a2bc0), closes #22
* **Breadcrumb:** rename `links` to `items` + improve slots (d56d3a1)
* **Button:** add `subtle` variant (1d2e1ca)
* **ButtonGroup:** new component (#88) (43066fd)
* **Button:** use `useComponentIcons` (6e10a09)
* **Card:** new component (78908c3)
* **Checkbox/Progress/RadioGroup/Slider/Switch:** add `black` color (08c91fe)
* **Checkbox:** new component (#67) (bfd5988)
* **Chip:** new component (d6bebd5)
* **cli:** `init` command (cdd9b17)
* **CommandPalette:** handle `filter` false and `postFilter` (1ef977f)
* **CommandPalette:** implement group `filter` function (e29cf79)
* **CommandPalette:** improve theme and performance (20476f4)
* **CommandPalette:** new component (#80) (d0017bf)
* **components:** allow override of sizes through `ui` prop (6aa0ea3)
* **components:** uniformize colors and variants (#141) (c018c23)
* **ContextMenu:** handle `size` prop (#130) (aa832f3)
* **ContextMenu:** new component (65a3b0a), closes #18
* **defineShortcuts:** migrate with reactivity (#72) (80b413a)
* **Drawer:** implement with `vaul-vue` (5e6275f), closes #53
* **DropdownMenu:** add `[#item](https://github.com/nuxt/ui/issues/item)` slot for consistency (1dcc1f5)
* **DropdownMenu:** handle `size` prop (#125) (dfa9936)
* **DropdownMenu:** handle item type `separator` (a5bb25d)
* **DropdownMenu:** new component (#37) (4403350)
* **DropdownMenu:** pass `index` to slots (735f81e)
* expose `open` state to slots (ed2c45a)
* **Form:** `Select` and `InputMenu` integration (#97) (52cf471)
* **Form:** nested form validation (#23) (1671278)
* **Form:** new component (#4) (de62676)
* **Form:** support for `valibot@33` (#132) (20acc92)
* **Icon:** use `@antfu/nuxt-icon-poc` (#76) (142affb)
* **Input/Textarea:** expose ref (74a6bca)
* **Input:** handle icons (de8100a)
* **InputMenu/Select/SelectMenu:** introduce `valueKey` prop (eeec967), closes #108
* **InputMenu:** expose `modelValue` and `open` to slots (659d5e2)
* **InputMenu:** handle `multiple` (fe3ab65), closes #91
* **InputMenu:** handle `size` prop (#131) (18c5ead)
* **InputMenu:** new component (#86) (99f20a4)
* **Input:** set `autocomplete` to `off` by default (eba8b4b)
* **Input:** use `defineModel` (#61) (091f8e9)
* **Kbd:** add `color` prop (2cc41de)
* **Link:** break component in two with `custom` prop (3ed5a08)
* **Link:** style with app config (349780d)
* **Modal:** new component (5d1d5b3)
* **Modal:** open programmatically (#78) (2bf99e1)
* **module:** add `[@source](https://github.com/source)` when `@nuxt/content` is present (8dfac7f)
* **module:** add option to disable transitions (5f4fd97)
* **module:** allow `tailwind.css` customization (8d560bd)
* **module:** move `primary` and `gray` inside `colors` object (ccbaf6e)
* **NavigationMenu:** handle content, `color`, `variant`, etc. (1af449d)
* **NavigationMenu:** improve theme with `line` variant and border (ec6ebba)
* **NavigationMenu:** new component (0d4d86d)
* **NavigationMenu:** pass `index` to slots (0f10d98)
* **NavigationMenu:** rename `links` to `items` + improve slots (ea19a30)
* **NavigationMenu:** replace `line` variant with `highlight` prop (af43b5d)
* **Pagination:** allow using pagination buttons as links (#114) (5c5676e)
* **Pagination:** new component (c36bae4), closes #11
* **Popover:** handle `hover` mode (7b89601)
* **Popover:** new (c131ce9)
* **Progress:** new component (#75) (138cb2d)
* **RadioGroup:** handle `horizontal` orientation (#74) (8144372)
* **RadioGroup:** handle `value-key` prop (850e84c)
* **RadioGroup:** new component (#41) (e29b514)
* **Select/SelectMenu:** handle `size` prop (#133) (b61696c)
* **SelectMenu:** add prop to disable search (db30284)
* **SelectMenu:** handle `multiple` prop (27ffb8d), closes #102
* **SelectMenu:** new component (#103) (7a376b5)
* **Select:** new component (#92) (1942b8e)
* **Separator:** new component (#46) (8d76a8b)
* **Skeleton:** new component (e2fb253)
* **Slideover:** add `top` / `bottom` sides (3e8a992)
* **Slideover:** new component (38eb932)
* **Slideover:** open programmatically (#122) (b886150)
* **Slider:** new component (#57) (78e4560)
* **Switch:** add ` label`  and ` description` props (#60) (2fe91f3)
* **Switch:** form integration (#48) (ebb7c07)
* **Switch:** handle `loading` and `loadingIcon` (8fd3693), closes #65
* **Switch:** new component (cd1073d)
* **Tabs:** handle `avatar` (bf0a04e)
* **Tabs:** handle `color` and `variant` props (82ffc1e), closes #116
* **Tabs:** handle `content` prop as `boolean` (e051ef6)
* **Tabs:** handle `size` prop (#124) (2b69652)
* **Tabs:** handle items `icon` (06ea029)
* **Tabs:** new component (13d389f)
* **Textarea:** new component (#62) (2ca6973)
* **Toast:** actions `color` defaults from prop (9a42338)
* **Toast:** add `actions` slot (51872be)
* **Toast:** implement progress duration (d726e4d), closes #51
* **Toast:** new component (#50) (3da1e1a)
* uniformize components sizes (#68) (f302a15)
* **useComponentIcons:** extract repetitive logic (e4882e6)
* **useKbd:** new composable (#73) (f076019)
* **useToast:** add `clear` method (89ff6b6)


### Bug Fixes

* **Accordion:** dont set a `default-value` (c36940a)
* **Accordion:** handle `disabled` through variants (6236953)
* **Alert:** add missing `close` slot (26491af)
* **Avatar:** bind `$attrs` on image (da42c04)
* **AvatarGroup:** default size to `md` (9620d90)
* **AvatarGroup:** handle deep children (e9832b9)
* **Avatar:** improve sizes (c726f13)
* **Avatar:** increase gray on light mode (fe467da)
* **Badge:** handle `label` as `number` (6cd7c8a)
* **Breadcrumb:** only apply `aria-current="page"` when link is active (e5695e7)
* **Button:** extend now works with compound variants (53755da)
* **ButtonGroup:** define its own `size` variant (0dfd8b3)
* **Button:** invalid icon size for `lg` (f0f8927)
* **Button:** loading on trailing (c8bdb51)
* **Button:** move span with `truncate` inside default slot (561c1fb)
* **Card:** improve body padding (cecfb58)
* **Card:** missing slots definition (02da03b)
* **Checkbox:** icon render (fc50996)
* **Checkbox:** reduce icon size (3c89d6b)
* **Chip:** extend now works with compound variants (6dfd696)
* **Chip:** improve sizes (d5fe5b3)
* **Chip:** size injection (#105) (8baee12)
* **Collapsible:** ensure default slot exists (c85a8cf)
* **CommandPalette/InputMenu/Select/SelectMenu:** adapt chip size (bdc3217)
* **CommandPalette:** ts errors (d558b3e)
* **components:** `ui` prop override with class (#136) (235556d)
* **components:** allow override of `root` through `ui.root` (47ad74d)
* **components:** declare `ui` prop with `PartialString` when arrays in theme slots (5cc4457)
* **Container:** missing slots definition (ab83053)
* **ContextMenu/DropdownMenu:** move `open` and `default-open` props to `Sub` (9af6d7d)
* **ContextMenu:** remove `arrow` prop (4ac7a7e)
* define empty props in slots for `nuxt-component-meta` parsing (369e0b1)
* **Divider:** add `w-full` only on horizontal wrapper (#1565) (bd8b737)
* **DropdownMenu:** add overflow scroll if height is added (80a8c2d)
* **DropdownMenu:** handle disabled with data attribute for links (cd214f9)
* **Dropdown:** missing `mouseenter` event on container (7288953)
* dynamic slots autocomplete (#77) (c6a93f7)
* **FormField:** added a utility type to fix some type errors (#81) (559a8cb)
* **FormField:** allow `error` prop as boolean (a23c314)
* **FormField:** generics (a78b096)
* **Form:** inconsistent validation events for `InputMenu` and `Select` (#123) (a2114c5)
* **fuse:** prevent indices highlight of a single char (7b278b0)
* **Input/SelectMenu:** handle `file` type and `change` events (#1570) (878f707)
* **Input/Textarea:** remove useless gap (67a1568)
* **Input:** invalid `xs` size (4a281b3)
* **InputMenu/Select/SelectMenu:** use `defuFn` to override base slot (2aa4358)
* **InputMenu:** bind `searchTerm` with `defineModel` (ff9fd9f)
* **Input:** missing `file:` selector on dark mode (f9259f6)
* **Input:** use `pl` / `pr` instead of `ps` / `pe` (a31d4cf), closes #32
* **Input:** use `ring` instead of `ring-1` (0920099)
* **Input:** wrong type for `type` prop (3651c7e)
* **Kbd:** optional `value` prop when using default slot (40d17f7)
* **Link:** active class (c384ec9)
* **Link:** add missing `slots` definition (76e3d0b)
* **Link:** allow `ariaLabel` to be picked (c1ac3a9)
* **Link:** expose `active` instead of `isActive` in default slot (46c066d)
* **Link:** improve `type` prop (802a159)
* **module:** add `isolate` class on root node (0c6720b)
* **module:** handle theme HMR on dev (#84) (12ba480)
* **module:** inject options in `nuxt.options.ui` (cf38e7e)
* **module:** prevent `colors` option merge (c4419fa)
* **module:** prevent override of `rootAttrs.class` (3097da4)
* **module:** typo in `fuchsia` color (7fd38a8)
* **module:** use `@tailwindcss/postcss` (cdf6ebd)
* **module:** use relative imports to components / composables (42f4f8d)
* **NavigationMenu:** `highlightColor` defaults to `color` prop (0bdd6df)
* **NavigationMenu:** `label` doesn't need to be typed as `number` (ee1d6ed)
* **NavigationMenu:** add default `highlightColor` (c838b3a)
* **NavigationMenu:** handle `disabled` through variants + `isolate` list + use separator instead of divide (f664f69)
* **NavigationMenu:** handle `truncate` on vertical orientation (298ac68)
* **NavigationMenu:** optional `links` (4301821)
* **NavigationMenu:** prevent err without links (03edad8)
* **NavigationMenu:** use `ULink` with `custom` (c8bedf8)
* **Pagination:** center text when link (440593c)
* **plugins:** add missing `type` (63f752a)
* **plugins:** use `import.meta` (c9f0999)
* **Popover:** ensure default slot exists (5d3ad6b)
* **Popover:** missing `mouseenter` event on container (8517897), closes #1564
* **Popover:** split reactive props with `mode` (7d2d3b9)
* **Popover:** use `scale-in` / `scale-out` animations (f90f7d7)
* **Progress:** initial indicator style when percent is 0 (d2442a1)
* **RadioGroup:** missing `as` prop binding (d3c7991)
* **RadioGroup:** style `legend` based on size (b1bcaab)
* remove `IconProps` usage (6d377d1)
* **SelectMenu:** adapt input size (5c12d42)
* **SelectMenu:** display `modelValue` even if false (813fdfd)
* **SelectMenu:** input before empty (bedb863)
* **Select:** missing comma in `&nbsp;` (c00ec5e)
* **Select:** wrong button group variants (5b2e7d8)
* **Skeleton:** increase gray on light mode (3cdbb27)
* specify pnpm version (#85) (e5f0063)
* **Switch:** improve sizes (3a89661)
* **Tabs:** `force-mount` content (d294931)
* **Tabs:** `horizontal` orientation (1e65933)
* **Tabs:** add missing slots definition (b78ca9c)
* **Tabs:** align `link` variant left when vertical (9d5f9a7)
* **Tabs:** broken design (80a3a0c)
* **Tabs:** improve config (88eb4ca)
* **Tabs:** missing props pick (f086f26)
* **Tabs:** optional `items` (20caea1)
* **Tabs:** specific transition (48ddf39)
* **Tabs:** use `shrink-0` (f8b50a3)
* **Tabs:** use `transition-all` (92e1d09)
* **Tabs:** wrong text color with `pill` colored (f70b639)
* **templates:** add `error` in `AppConfig` type (c7536a7)
* **templates:** dont override `AppConfig` type (e151be4)
* **templates:** export types in dev mode (1eaec0f)
* **templates:** handle `-` in regexp (0a00387)
* **templates:** import from `[#build](https://github.com/nuxt/ui/issues/build)/ui.css` no longer works (eb85fa8)
* **templates:** missing command in keyframes (6a1b97a)
* **templates:** pass options to theme in dev mode (5694823)
* **templates:** unshift css (e1ab903)
* **Textarea:** invalid `xs` size (bed6252)
* **Textarea:** same `size` as input (e398637)
* **Toast:** add missing slots (cfb4cfd)
* **Toaster:** add missing transition on `translate` (239e0a5)
* **Toaster:** increase container height to prevent animation blink (4dcb74e)
* **Toaster:** proxy slot from `App` (4b29828)
* **Toaster:** wrong leave animation when collapsed (c3ed18b)
* **Toast:** prevent progress bar to blink on leave (83049fd)
* **Tooltip:** ensure default slot exists (431255e)
* **Tooltip:** missing conditions on slots (d00084c)
* **Tooltip:** missing root props proxy (be8bf69)
* **Tooltip:** put back close animation (34cf395)
* **Tooltip:** remove content max-width (6c5354e)
* **Tooltip:** use `scale-in` / `scale-out` animations (0450f6b)
* **types:** useless import (5f7872f)
* **useComponentIcons:** reactivity when using `defu` (45454fa)

## 2.18.6 (2024-09-23)


### Bug Fixes

* **components:** accept partial config in `ui` prop (#2235) (eecf4f7)
* **Modal/Slideover:** bind transition class to `TransitionChild` for Vue 3.5 (#2227) (803c20a)
* **SelectMenu:** wrong placeholder color with multiple (#2218) (28ad5cf)
* **Table:** colspan with expand (#2217) (56118c4)
* **Tabs:** handle icon `margin` in RTL mode (#2233) (ea05414)
* **useFormField:** optional property access (#2226) (0a054a5)

## 2.18.5 (2024-09-18)


### Features

* **Form:** add errors slot prop (#2188) (67c6a74)


### Bug Fixes

* **Button:** button link not showing disabled classes (#2185) (e8ea84a)
* **Carousel:** remove trailing space in next button icon (#2088) (1282a5f)
* **FormGroup:** remove id when used with `RadioGroup` (#2152) (7aec42c)
* **Input:** avoid binding value when type is `file` (#2047) (82313e8)
* **module:** allow CSS variables in tailwind colors (#2014) (7f50c70)
* **module:** augment `@nuxt/schema` rather than `nuxt/schema` (#2171) (ead904f)
* **module:** consider user tailwind `configPath` for module as string (#2074) (e4ba4f7)
* **Pagination:** use links on prev and next button (#2179) (c850f85)
* **README:** update license link (#2154) (8d79eea)
* **Slideover:** bind `rounded` class to panel (#2187) (bf32baa)
* **Slideover:** bind `shadow` class to panel (#2201) (d22526c)
* **Table:** checkbox can emit the `[@select](https://github.com/select)` event (#2072) (b1f691f)
* **Table:** select all rows reactivity issue (#2200) (68124de)
* **Tabs:** recalculate marker if items change (#2101) (82c4926)
* **Textarea:** resolve row count calculation errors caused by scrollbar (#2040) (8210936)

## 2.18.4 (2024-08-05)


### Bug Fixes

* **Form:** submit event data (#2012) (4d61936)
* **module:** handle nested colors from ui config (#2008) (1cc7e2a)
* **module:** reduce css bundle size by fixing safelist regex (#2005) (8ac9ca4)
* **module:** suffix types imports with `/index` (7e37668), closes #2018
* **Tabs:** use `nextTick` before marker calc (#2020) (9c04969)
* **useFormGroup:** app config default input size (#2011) (3485092)

## 2.18.3 (2024-07-30)


### Bug Fixes

* **Link:** define `rel` as any (69f605f)
* **types:** only use `.ts` for index (93ddf1d)

## 2.18.2 (2024-07-25)


### Bug Fixes

* **Tabs:** add missing `UIcon` import (4fd1be2)

## 2.18.1 (2024-07-25)


### Bug Fixes

* **components:** use relative imports (ea721a3)

## 2.18.0 (2024-07-25)


###  BREAKING CHANGES

* **Icon:** migrate from `@egoist/tailwindcss-icons` to new `@nuxt/icon` (#1789)

### Features

* **Checkbox/Radio/RadioGroup:** add `help` slot (c3122f7), closes #1957
* **CommandPalette:** handle `static` groups (#1458) (b264ad2)
* **Icon:** migrate from `@egoist/tailwindcss-icons` to new `@nuxt/icon` (#1789) (c904604)
* **module:** improve app config types autocomplete (#1870) (3f8ea5d)
* **RadioGroup:** add `selected` to label slot props (#1587) (d18477d)
* **SelectMenu:** add selected to `label` / `leading` / `trailing` slots props (#1349) (6b216ca)
* **SelectMenu:** handle function in `showCreateOptionWhen` prop (#1853) (7e974b5)
* **Skeleton:** add `as` prop (#1955) (bce94db)
* **Table:** expand row (#1036) (7155318)
* **Table:** handle `rowClass` property in `columns` (#1632) (748e491)
* **Tabs:** handle `icon` in items (#1798) (e8eb394)


### Bug Fixes

* **Accordion:** truncate buttons (5db18c0), closes #1909
* **Alert/Notification:** missing margin on description (2c55fb6), closes #1959
* **Breadcrumb:** use `rotate` on rtl icon (53003fc)
* **ButtonGroup/FormGroup:** pass default sizes to children (#1875) (6b6b03d)
* **Carousel:** remove `mix-blend-overlay` on indicators (#1714) (f74f1df)
* **FormGroup:** don't check for `error` slot so `help` slot can render (#1888) (99c52e5)
* **InputMenu/SelectMenu:** invalid `label` with `value-attribute` and async search (4d5f250), closes #1780
* **InputMenu/SelectMenu:** prevent double filter with async search (e2881d3), closes #1966
* **Link:** allow `ariaLabel` to be picked (720c44d), closes #1934
* **Progress:** pass down attrs to `<progress>` to improve accessibility (#1881) (abd13f1)
* **RadioGroup:** allow boolean in `modelValue` prop (#1913) (8eca5a0)

## 2.17.0 (2024-06-13)


### Features

* **Alert:** add `actions` slot (#1785) (c8dd71c)
* **Form:** update and migrate `valibot` to v0.31.0 (#1848) (1d5bd89)
* **Notification:** allow ring customization with `{color}` (#1830) (3ebff4d)
* **Slideover:** handle `top` and `bottom` side (#1834) (50ad14f)
* **Tabs:** add `content` prop to avoid the render of the HTML markup (#1831) (6e2678d)


### Bug Fixes

* **Alert/Notification:** use `div` for description (e8898d1), closes #1551
* **Alert:** base style not applied on icon (#1859) (f65aefb)
* **Breadcrumb:** allow `aria-current` to be overrideable (ebfb835), closes #1856
* **Carousel:** prevent mouse click when dragging (#1781) (4f0d00f)
* **CommandPalette:** hide `empty-state` when `null` (249bbd4), closes #1787
* **Form:** maintain other errors when using `setErrors` with a path (#1818) (06990be)
* **Input:** hide wrapper when type is `hidden` (#1797) (e7c2f78)
* **Link:** typo in `exactHash` type (581b470), closes #1767
* **SelectMenu:** wrong placeholder color when `modelValue` is an empty string (9b9ccdb), closes #1862
* **Select:** remove defaults for `value` and `text` (6c124bb), closes #1702

## 2.16.0 (2024-05-07)


###  BREAKING CHANGES

* **Input:** redesign `file` type without absolute positioning (#1712)

### Features

* **InputMenu/SelectMenu:** allow lazy search (#1705) (7e6ba78)
* **module:** HMR support with `@nuxtjs/tailwindcss` (#1665) (821e15b)
* **Table:** allow providing a `<caption>` (#1680) (3fca668)
* **useToast:** allow clearing all notifications (#1695) (82d619b)


### Bug Fixes

* **Breadcrumb:** pass `click` event to `ULink` (5481dab)
* **Input:** redesign `file` type without absolute positioning (#1712) (ed5c74d)
* **Notification:** update timer when timeout prop changes (#1673) (cba9ad7)
* **Slideover:** export and clean types (#1692) (bd3fa86)
* **Table:** provide `aria-sort` for sortable table headings (#1675) (6f60fa9)

## 2.15.2 (2024-04-12)


### Features

* **Accordion:** add `unmount` prop to allow lazy mounting for heavy components (#1590) (91e5002)
* **Table:** add `checkbox` ui config (#1409) (8b54660)


### Bug Fixes

* **Breadcrumb:** missing `min-w-0` on wrapper to truncate (9f01145), closes #1650
* **Carousel:** next and prev buttons disabled (#1619) (e909884)
* **Popover/Dropdown:** prevent unintended closure on touchstart in mobile devices (#1609) (2392b4a)
* **Slideover:** remove dynamic component when closing (#1615) (58faa10)
* **Slideover:** wait for transition to complete to reset state (#1624) (07a4d13)

## 2.15.1 (2024-04-02)


### Features

* **Avatar:** add `as` prop to use `NuxtImg` underneath (49b73aa), closes #1577


### Bug Fixes

* **Checkbox:** `[@change](https://github.com/change)` event value (#1580) (c98d6e3)
* **Divider:** add `w-full` only on horizontal wrapper (#1565) (bd8b737)
* **Dropdown:** missing `mouseenter` event on container (7288953)
* **Input/SelectMenu:** handle `file` type and `change` events (#1570) (878f707)
* **Popover:** missing `mouseenter` event on container (8517897), closes #1564

## 2.15.0 (2024-03-26)


###  BREAKING CHANGES

* **forms:** normalize input emits (#1560)

### Features

* **Accordion:** emit `open` event with index (#1559) (224ec3c)
* **Alert:** add `icon` & `avatar` slots (#1401) (cee3e12)
* **Slideover:** open programmatically (#1465) (e769759)
* **Toggle:** add `loading` prop (#1546) (e1e05af)


### Bug Fixes

* **ButtonGroup:** nested group elements (#1530) (7658211)
* **Carousel:** add tab-based ARIA roles (#1516) (e736eca)
* **Checkbox:** bind `data-n-ids` to root element (#1495) (a2b8b70)
* **forms:** normalize input emits (#1560) (92e7362)
* **InputMenu:** trigger alignement on safari (f4a48f6), closes #1505
* opt in to `import.meta.*` properties (#1561) (cc62e34)
* **Popover/Dropdown:** use `[@touchstart](https://github.com/touchstart).passive` instead of `[@touchstart](https://github.com/touchstart).prevent` (#1520) (a563d8f)
* **SelectMenu:** `filteredOptions` might be undefined (#1541) (b0ecac5)
* **SelectMenu:** handle `Boolean` type as model value (#1550) (c49f899)

## 2.14.2 (2024-03-05)


### Bug Fixes

* **Alert:** improve `description` alignment when no title provided (ca4f06a), closes #1408
* **Checkbox:** label interaction without `FormGroup` (#1427) (6e77f1d)
* **Dropdown:** active/inactive dropdown links (#1407) (6a1142b)
* **Dropdown:** improve `hover` mode on touch devices (70bf4a7)
* **HorizontalNavigation:** add `relative` class to icon (0a4a9e3)
* **Modal:** remove `overflow-hidden` (#1460) (002129c)
* **Notification:** improve `description` alignment when no title provided (9cce445)
* **Popover:** improve `hover` mode on touch devices (b50fbcf)
* **RadioGroup:** add missing `fieldset` config (2d64b50), closes #1472
* **SelectMenu:** check `null` model value (4b6e80e), closes #1421
* **Tooltip:** arrow not hidden on mobile (272c19d), closes #1470
* **VerticalNavigation:** add `relative` class to icon (0b29dd4), closes #1245

## 2.14.1 (2024-02-23)


### Bug Fixes

* **module:** revert tailwind config from #1272 (#1404) (ba15add)

## 2.14.0 (2024-02-22)


### Features

* **Carousel:** expose methods to allow autoplay (41ecd2a), closes #1300
* **Divider:** handle `size` prop (#1307) (cbeede6)
* **Form:** use nuxt `useId` to bind input labels (#1211) (27c71fa)
* **Input:** handle type `file` (946a39c), closes #563
* **Modal:** open programmatically (#1319) (6f29c62)
* **Table:** display progress bar when `loading` (#1362) (3fe3521)
* **Tabs:** add `unmount` prop as `false` by default (843a978), closes #663
* **Textarea:** add `maxrows` prop to restrict autoresize (#1302) (f643e7b)


### Bug Fixes

* **Accordion:** style disclosure `div` after #1199 (882247e)
* **Alert:** remove `required` title to prevent warning when using slot (e545b6f)
* **Card:** prevent `body` padding without default slot (f682905)
* **components:** hydration attribute mismatch with vue `3.4` (#1199) (10db144)
* **Form:** improve `validate` path type (#1370) (5266591)
* **Form:** return false when silent validation fails (#1371) (d4b6147)
* **Link:** check `disabled` prop before navigating (#1321) (ac42ec1)
* **Meter:** missing import of `Icon` component (f8b296f), closes #1328
* **module:** prevent tailwind warn with `bun` (bb40c31), closes #809
* **module:** put back `all` option in icons plugin (412cd75), closes #1237
* **Notification:** remove `required` title to prevent warning when using slot (aa2b1ca)
* **Progress:** prevent `NaN` percent display when indeterminate (a55a08a)
* **RadioGroup:** pass `help` prop to radio children (5a5b284), closes #1313
* **SelectMenu:** revert component `is` after #1199 (d0f4530)
* **utils:** prevent merge of `popper` key (9f35297), closes #1393


### Reverts

* Revert "docs: add missing `overflow-hidden` on components" (b893607)

## 2.13.0 (2024-01-30)


###  BREAKING CHANGES

* **VerticalNavigation:** use `Badge` component for consistency

### Features

* **Carousel:** new component (#927) (f37b043)
* **Dropdown:** default delay from config (c4a1c04)
* **Form:** handle multiple paths in `validate` (#1273) (20ac4b3)
* **HorizontalNavigation:** new component (#1279) (b8007ba)
* **InputMenu:** handle `nullable` prop when clearing input (5e49fb8)
* **Modal/Slideover:** emit `close-prevented` event (#1207) (6faf15b)
* **module:** add option to disable global css styles (#1266) (f96eb5e)
* **Popover:** default delay from config (7f5711b)
* **Tooltip:** default delay from config (3400b56)
* **VerticalNavigation:** use `Badge` component for consistency (3e81eee)


### Bug Fixes

* **Breadrumb:** handle truncate (5d3a962)
* **Link:** propagate `active` prop to slot as `isActive` (b76e761)
* **Select:** consistent placeholder with input and textarea (2cb41db), closes #1276
* **Slideover:** handle translate in RTL mode (#1259) (ea58c88)

## 2.12.3 (2024-01-18)


### Bug Fixes

* **link:** import type from `[#vue](https://github.com/nuxt/ui/issues/vue)-router` (79ec3fd), closes #1253

## 2.12.2 (2024-01-18)


### Bug Fixes

* **link:** improve nuxt link `rel` type (05e90aa)

## 2.12.1 (2024-01-18)


### Bug Fixes

* **Button:** inherit nuxt link props without breaking `nuxt-component-meta` (d3e19dc), closes #578
* **Button:** pass-through nuxt link props to `ULink` (a44bfc8)
* **InputMenu:** take `option-attribute` into account to display label (1a93791)
* **Link:** prevent `type` bind on `<a>` (b0df864)
* **SelectMenu:** take `option-attribute` into account to display label (b9fe74b), closes #1151
* **Tooltip:** typo in kbd component (4405d32)

## 2.12.0 (2024-01-09)


###  BREAKING CHANGES

* **Card:** remove `overflow-hidden` on wrapper

### Features

* **Breadcrumb:** handle `labelClass` and merge `iconClass` (f623ec1)
* **Dropdown:** handle `labelClass` and merge `iconClass` (1c9835d), closes #716
* **Dropdown:** handle manual mode (3844714), closes #1143
* **Form:** expose submit function (#1186) (4a25a12)
* **InputMenu:** new component (#1095) (6d8d82a)
* **Pagination:** add `disabled` prop (0976833), closes #1189
* **Popover:** open and close events (#1038) (f32f578)
* **SelectMenu:** add `empty` slot when no options (5d1919a), closes #1089
* **SelectMenu:** allow control of search query (f735db0), closes #1174
* **SelectMenu:** allow creating option despite search (#1080) (0fdc8f7)
* **Table:** add `sort-mode` prop (56e0c9a), closes #1149
* **Table:** add custom sort function to columns (#1075) (4f3af6c)
* **VerticalNavigation:** ability to add dividers (#963) (ffd20b3)
* **VerticalNavigation:** handle `labelClass` and merge `iconClass` (a79f7c0)
* **VerticalNavigation:** improve accessibility (#948) (29e64ca)


### Bug Fixes

* **Alert:** always pass a function to actions click events (5d78111), closes #1197
* **Card:** remove `overflow-hidden` on wrapper (4124406), closes #806 #1034
* **config:** prevent class merge of `avatar` size (b22bd70)
* **Dropdown:** improve placement with `hover` mode (c6aa421), closes #1179
* **Dropdown:** merge item `class` (7151b7b), closes #1157
* **Form:** invalid errors when using `clear` by path (#1165) (97a3975)
* **Form:** memory leak (#1185) (ea2a24b)
* **forms:** dont disable inputs and selects on `loading` (3258167), closes #1117
* **Link:** handle `active` override when value is false (83631cc)
* **Popover:** allow manual mode without blocking normal behaviour (3334e2a)
* **Popover:** improve placement with `hover` mode (bc00f9c), closes #781
* **RadioGroup:** pass `option.disabled` to children (0c8ab9d), closes #1109
* **SelectMenu:** input border focus after `tailwindcss` 3.4 (e8f573b)
* **Table:** display nothing instead of error when key is missing (00d0fd5), closes #1173
* **Table:** respect sort prop updates from parent component (#1208) (c6841d0)
* **Toggle:** add missing `change` event (4c84839), closes #1113
* update vue and fix type issues (#1112) (5c99ae1)
* **useShortcuts:** include `contenteditable="plaintext-only"` elements in `usingInput` (#1159) (648eec3)
* **useShortcuts:** invalid code after #1159 (56e1fed)


### Reverts

* Revert "docs: pull `nuxt/ui-pro` docs from `main` branch" (d0ce8ee)

## 2.11.1 (2023-12-11)


### Bug Fixes

* **Breadcrumb:** handle divider in rtl (#1049) (e53cdea)
* **CommandPalette:** improve performances and avoid multiple recompute (db508b2)
* **CommandPalette:** missing right padding on input with close button (ad33b26)
* **components:** move remaining classes to config (#1039) (e408eab)
* **module:** prevent class merging on `default` children (f07968a), closes #1076
* **Notification:** handle dynamic backgrounds (#1063) (1f0f618)
* **RadioGroup:** props reactivity issues (#1065) (7196d81)
* **types:** favor `Record<string, any>>` instead of `object` (4d72a75)
* **types:** improve with strict mode (#1041) (4a9b66a)
* **types:** workaround for `popper` weak type (5718dfd), closes #644


### Reverts

* Revert "chore(deps): pin `vitest`" (6984989)

## 2.11.0 (2023-11-23)


### Features

* **Breadcrumb:** new component (#506) (a35bfc7)
* **Checkbox:** config `label`, `required` and `help` size (a1b38c4)
* **Chip:** new component (#886) (d4f1b5e)
* **FormGroup:** add eager validation (#992) (d39e2de)
* **Icon:** switch to `nuxt-icon` with `dynamic` prop or app config (#862) (c601fc6)
* **module:** allow options override of `@egoist/tailwindcss-icons` plugin (#1013) (ec58948)
* **Notification:** customize default timeout (#1003) (83c3be7)
* **Popover:** ability to add overlay (#1014) (06d4510)
* **SelectMenu:** allows to clear search query on close (#968) (11ccbbb)
* **Textarea:** add default slot for complex usages (55697e6), closes #971
* **Toggle:** add `size` prop (#950) (3c71bf3)
* **types:** support custom values from `app.config.ts` (#863) (7339324)


### Bug Fixes

* **Alert:** improve config options (91511b9), closes #760
* **Alert:** prevent `gap` when no close button or action (9a1a1b8), closes #831
* **ButtonGroup:** handle components with children (#999) (f4be95d)
* **CommandPalette:** activate first option after async search (#981) (a975939)
* **defineShortcuts:** support minus `-` key (#962) (de38afd)
* **Dropdown:** pass event to `click` function (60fa2be)
* **Dropdown:** use `NuxtLink` with `custom` prop to close on select (f323379), closes #899
* **FormGroup:** hydration mismatch on inputId (#942) (a3046aa)
* **FormGroup:** remove inputId if the input is a fieldset (#914) (e81d5cf)
* **Input/Textarea:** add `v-model` modifiers (#856) (68f6956)
* **Link:** handle `active` state when `to` prop is not provided (6cc77a3), closes #988
* **Link:** reactivity issue with `active` prop (15a40f5), closes nuxt/nuxt.com#1432
* **module:** `boolean` types and bump nuxt to `3.8.2` (#1006) (ca62ce1)
* **module:** use correct alias for `[#ui](https://github.com/nuxt/ui/issues/ui)-colors` (#913) (c84438f)
* **Notification:** improve config options (7cb987d)
* **Notification:** prevent `gap` when no close button or action (ded6a7f)
* **Notifications:** teleport to `body` (#909) (8451f4d)
* **Progress:** percentage calculation (#939) (c55871b)
* **Radio:** prevent `help` text from inlining with label (#894) (a2d70f0)
* **SelectMenu:** fixes non-strings and nested searchable attributes (#967) (37fdf22)

## 2.10.0 (2023-10-31)


### Features

* **CommandPalette:** handle `filter` attribute in groups (#871) (8ba2a79)
* **Divider:** new component (#757) (eb9ce6a)
* **Form:** handle `[@error](https://github.com/error)` event (#718) (e16379f)
* **Input/Textarea:** allow specifying autofocus delay for page transitions (#816) (8bfd359)
* **Meter:** new component (#827) (abbcc37)
* **Pagination:** add first and last page buttons (#842) (c5ce997)
* **Popover:** manual mode & horizontal offset (#781) (92b8618)
* **popper:** `arrow` option & docs consistency across components (#875) (f785ecd)
* **Progress:** new component (#697) (2c5559b)
* **RadioGroup:** configurable label size (#881) (5a2644b)
* **RadioGroup:** new component (#730) (23d5dc7)
* **Range:** add `2xs`, `xs`, `xl` and `2xl` sizes to match progress component (3cb3914), closes #673
* **Table:** add `v-model:sort` prop (#803) (9f4d88e)
* **Tooltip:** adding option to show popper arrow (#868) (4ce2374)


### Bug Fixes

* **Accordion:** toggle correct element when keyboard press (#805) (96296c3)
* **Divider:** display a single border when no content (3c5c338)
* **Dropdown:** use `NuxtLink` instead of `ULink` (#882) (c37ad8b)
* **FormGroup:** ensure size exists in config (#695) (f5f3388)
* **Modal:** remove padding on mobile with `fullscreen` enabled (550ac10), closes #811
* **Notification:** add roles for accessibility (#724) (40f3b16)
* **Table:** enable sorting for nested column keys (#835) (b4f7b03)
* **Table:** prevent `[@select](https://github.com/select)` event call when selecting all rows (#838) (51f4d54)
* **Tabs:** truncate buttons content (ddbb431), closes #796
* **types:** handle sub-objects in `app.config.ts` (button colors) (7be2af7), closes #858
* use explicit type imports (#830) (a8279d1)

## 2.9.0 (2023-10-02)


###  BREAKING CHANGES

* **module:** use `tailwind-merge` for `app.config` & move config to components & type props (#692)

### Features

* **FormGroup:** add slots (#714) (2fc9385)
* **Link:** add `active` prop to override default behaviour (#732) (8257a11)
* **Link:** add `as` prop (#535) (e404912)
* **module:** use `tailwind-merge` for `app.config` & move config to components & type props (#692) (34d2f57)
* remove `lodash-es` (#648) (d6476d1)
* **Table:** add ability to custom style for  `td` and  `tr` (#741) (874447c)


### Bug Fixes

* **Accordion:** close other items in circular order (#735) (6887f73)
* **FormGroup:** prevent input click from propagating to label (#651) (4c58330)
* **FormGroup:** use explicit label instead of implicit label (#638) (681f0e5)
* **module:** move `@headlessui/tailwindcss` to plugins on module install (3e647e4)
* **module:** retain props reactivity through `useUI` (#745) (109ec52)
* **Pagination:** handle `max > 5` and `max` equal total pages (#728) (a071e4b)
* **Range:** fix track pseudo-elements for mozilla (#636) (8955595)
* **SelectMenu:** handle numbers (0544a01), closes #574
* **Table:** add missing classes in `app.config.ts` (a603ea5), closes #655
* **Table:** select all rows without select listener (#652) (83d609d)
* **Tabs:** add visible focus indicator on active tabs (#690) (be734fc)
* **Tabs:** allow custom keys in `TabItem` (#671) (15e418e)
* **Tabs:** prevent focus of `TabPanel` with `tabindex="-1"` (cbb2f28)

## 2.8.1 (2023-09-09)


### Bug Fixes

* **Form:** fix `getValibotError` to avoid importing `safeParseAsync` (#640) (e8daf7f)
* **Form:** fix valibot imports (#617) (1a7eb27)
* **Pagination:** page numbers not clickable (#624) (c1e0654)

## 2.8.0 (2023-09-07)


###  BREAKING CHANGES

* **module:** use `tailwind-merge` for class merging (#509)

### Features

* **Avatar:** add `icon` prop as fallback (df3b202)
* **Avatar:** handle `icon` default from `app.config.ts` (55daed0)
* **ButtonGroup:** add `orientation` prop (#603) (b3bc6e2)
* **Form:** add valibot supprt (#615) (ab5153a)
* **Form:** improve form control and input validation trigger (#487) (6d7973f)
* **Modal:** add `fullscreen` prop (#523) (7e2bebd)
* **module:** add `DEFAULT` shade to `primary` color (#493) (c6056ed)
* **module:** use `tailwind-merge` for class merging (#509) (8880bdc)
* **Table:** support nested keys in columns (#503) (858886a)
* **Tabs:** control selected index (#490) (aaf09ad)


### Bug Fixes

* **Alert:** fix wrong type of `actions` (#507) (b243e8c)
* **AvatarGroup:** add `justify-end` to wrapper to prevent right align (e578b0d)
* **AvatarGroup:** pass default `size` to max avatar (e49c673)
* **AvatarGroup:** use `ui.wrapper` as `inheritAttrs` is not false (eb609b1)
* **Badge:** allow `label` as number (7c157ce)
* **Button:** add missing prop types (#508) (a8a1c15)
* **ButtonGroup:** switch back to `ui` prop (d4e3ab6)
* **Form:** fix wrong type of validate (#496) (3d6839d)
* **FormGroup:** `size` were invalid since default has been removed (7008df0)
* **FormGroup:** add missing `ref` import from vue (39042b3)
* **Form:** use safeParseAsync for zod (#497) (8b19b18)
* **module:** missing `useHead` import (0f252d0)
* **module:** missing `useNuxtApp` import (888effe)
* **Popover:** handle `hover` mode with padding like dropdown (dc951ff)
* **Radio:** put back `id` for label selection (9b3a22e)
* **SelectMenu:** invalid `gap` values (998314e)
* **Table:** empty state is displayed if null (#517) (44ba758)
* **Table:** missing component imports (#608) (d936316)
* **Tabs:** recompute marker position when `v-model` changes (#524) (fdce429)
* **Tooltip:** hide on touch devices (#580) (f1ed007)
* use head instance from plugin (791804b)

## 2.7.0 (2023-08-01)


###  BREAKING CHANGES

* **Link:** rename from `LinkCustom` and add `exact-query` / `exact-hash` props
* **Badge:** add colors and variants (solid has changed)
* **SelectMenu:** invert `ui` and `ui-select` props (#432)

### Features

* **Alert:** new component (#449) (ab2abae)
* **Badge:** add colors and variants (solid has changed) (05503e5)
* **Badge:** rename `outline` to `subtle` + add `soft` variants (5bd5dc2)
* **CommandPalette:** bind active and selected to scoped slot (#441) (b0440f8)
* **FormGroup:** add `size` prop and theme options (#391) (d2a8a07)
* **Form:** new component (#439) (a3aba1a)
* **Link:** rename from `LinkCustom` and add `exact-query` / `exact-hash` props (cefe5a7)
* **Notification:** support html with `title` and `description` slots (#431) (df455db)
* **Range:** increase narrowed surface (#459) (3b183ac)
* **SelectMenu:** add `value-attribute` prop (#429) (959c968)
* **Tabs:** new component (#450) (8298b62)
* **ui:** apply primary bg on `::selection` (09d0ea2)


### Bug Fixes

* **FormGroup:** `required` star display (3dd0492)
* **FormGroup:** err when no prop defined (93aebe6)
* **FormGroup:** missing imports (#470) (dc1979c)
* **FormGroup:** set `size` default to null (c59595f)
* **Form:** return state on validate (#472) (248b0a6)
* **LinkCustom:** `exact` prop wasn't working (82e152b), closes #417
* **LinkCustom:** improve prop binding and prevent error with externals (914d156)
* **Link:** handle `disabled` prop (396aae7), closes #473
* **module:** ensure `red` color is safelisted for form elements (208acca), closes #423 #373
* **module:** omit colors defined as strings (927b63f)
* **module:** safelist all colors for `toast.add` (2cd6208), closes #375 #440
* **module:** smart safelisting for components in snake case (e25be11), closes #461
* **Popover:** hover mode (#453) (10890e6)
* **SelectMenu:** invert `ui` and `ui-select` props (#432) (7cccbcf)
* **Table:** hide data when loading state is active (#460) (2b3dc8d)

## 2.6.0 (2023-07-18)


###  BREAKING CHANGES

* **Avatar:** bind component attributes to img element (#421)

### Features

* **Accordion:** add `multiple` prop and close others by default (#364) (b78fcf9)
* **Accordion:** new component (#301) (e50f377)
* **Avatar:** bind component attributes to img element (#421) (773a23f)
* **Modal:** add `prevent-close` prop (2cc5c0d), closes #303
* **SelectMenu:** handle async search (#426) (5f8fe85)
* **Slideover:** add `prevent-close` prop (d15e816)
* **Table:** add click event for the entire row (#353) (d292706)
* **Table:** allow columns `class` customization (5dffa86), closes #366


### Bug Fixes

* **Accordion:** missing `ref` import from vue (3de6b34)
* **Accordion:** solve the shift between buttons when they are opened (#379) (eaf0043)
* **ButtonGroup:** err when no props on buttons (80a9738), closes #360
* **Button:** missing `disabled` state on some variants (41a5238)
* **Modal:** disabling `transition` prop had no effect (db34665)
* **Range:** `disabled` thumb opacity (c92dc98)
* **Range:** progress style (#385) (a79c165)
* **SelectMenu:** missing `appear` on transition (cbe2b1b), closes #400
* **Table:** fixed row deletion bug on deselect (#425) (46b444a)

## 2.5.0 (2023-06-27)


###  BREAKING CHANGES

* **Radio/Checkbox/Toggle:** handle `color` prop for form elements (#323)

### Features

* **Avatar:** handle `chipText` (#306) (759af05)
* **defineShortcuts:** chained shortcuts + docs update (#282) (a67f691)
* **Radio/Checkbox/Toggle:** handle `color` prop for form elements (#323) (ffb312d)
* **Range:** new component (#290) (97a1c86)
* RTL support (#320) (4ea114a)
* **Table:** pass row index to table cell (#291) (71c2465)
* **Table:** reset sort on third click (1ff11ac), closes #300


### Bug Fixes

* **components:** prefix `@headlessui/vue` components (41b85d5), closes #315
* **defineShortcuts:** missing `ref` import (a880379)
* **defineShortcuts:** missing `useDebounceFn` import (9cd73aa)
* **FormGroup:** prevent overriding `color` of children (6be9290), closes #352
* **Table:** default `sortButton` icon (07b27a2)
* **Table:** missing default sort icon when overriding `sort-button` prop (0f3fe0d)
* **Toggle:** add `opacity-50` when disabled (c2ebb04)
* **Tooltip:** add `color` in config (1b03b8a)

### 2.4.1 (2023-06-21)


### Bug Fixes

* **forms:** precise type assertion for `onInput` event handler (#293) (457b7a9)
* **module:** let `tailwindcss` viewer enabled by default (4023fbe), closes #292
* **module:** safelist aliases for input (f719111)
* **module:** safelist regex when a `:` was present before color (f7e2082)
* **Radio/Checkbox:** remove legacy `custom` (3bac087)


## 2.4.0 (2023-06-13)


###  BREAKING CHANGES

* **forms:** bind `$attrs` to elements (#279)
* **Select:** rename `text-attribute` to `option-attribute` and defaults to `label`

### Features

* **CommandPalette:** handle `empty-state` (#271) (652af93)
* **module:** smart safelisting (#268) (20fa4d2)
* **Pagination:** new component (#257) (f0b24ba)
* **table:** add loading state (#259) (4741532)
* **table:** add slot for empty state (#260) (f7a34c8)


### Bug Fixes

* **ButtonGroup:** invalid `size` validator (a617672)
* **ButtonGroup:** use `-space-x-px` on wrapper (d91c0bb)
* **Button:** same size when no label + uniformize form elements (a6903df)
* **CommandPalette:** input focus after be5f352 (cbc8ef1)
* **deps:** move `@tailwindcss/container-queries` to dependencies (9559d0b)
* **forms:** `padded` prop with `p-0` class (207444f)
* **forms:** bind `$attrs` to elements (#279) (e12e974)
* **module:** deduplicate default safelist as components may share same rules (2cfa1f8)
* **module:** hardcode `gray` safelist instead of deduplicate complex logic (a733c13)
* **module:** only safelist known colors (cdce519)
* **module:** prevent safelisting dynamic `:color` variables (ccd9ca5)
* **module:** transform `vue` files to detect multi-line components (88c1930)
* **module:** use `@tailwindcss/forms` class strategy (#278) (be5f352)
* **Notification:** class priority for icon color (07f7855)
* **Radio/Checkbox:** split preset as `indeterminate` is checkbox only (429791d)
* **SelectMenu:** input focus after `be5f352` (717a514)
* **Table:** colspan of `empty` and `loading` is wrong when selection enabled (#284) (786d776)
* **Toggle:** missing `disabled` prop (fe833eb)


* **Select:** rename `text-attribute` to `option-attribute` and defaults to `label` (b4a96a8)

## 2.3.0 (2023-06-05)


###  BREAKING CHANGES

* **Input:** move pointer class inside its own preset class
* **SelectMenu:** remove `inline-flex` from wrapper to behave like other form elements
* **Notification:** rename to `closeButton` and `actionButton` for consistency
* **CommandPalette:** rename props to `emptyState` and `closeButton` for consistency
* **Toggle:** rename icons to `onIcon` / `offIcon` for consistency

### Features

* add `Table` component (#237) (cce000a)


### Bug Fixes

* **Avatar:** placeholder font size (71edb91)
* **Badge:** remove `console.log` in validator (f9b935f)
* **Button:** invalid padding when using `square` prop (1ebaa5a)
* **CommandPalette:** override of `closeButton` and `emptyState` props (2c673f5)
* **defineShortcuts:** err with input autocomplete that triggers `keydown` (01fa85c)
* **SelectMenu:** disable on loading (8951923)
* **Table:** add missing `text-left` in `th.base` (6bd5142)
* **Table:** missing `ref` import from `vue` (272af9d)
* **Table:** override of `sortButton` and `emptyState` props (192b0e6)
* **Table:** type `sort` prop (3ba0aed)
* use `cloneVNode` when altering props in render functions (5e50eb9), closes #252


* **CommandPalette:** rename props to `emptyState` and `closeButton` for consistency (daca463)
* **Input:** move pointer class inside its own preset class (f59a92c)
* **Notification:** rename to `closeButton` and `actionButton` for consistency (4458656)
* **SelectMenu:** remove `inline-flex` from wrapper to behave like other form elements (ba44c58)
* **Toggle:** rename icons to `onIcon` / `offIcon` for consistency (8ee2ac1)

### 2.2.1 (2023-05-27)


### Bug Fixes

* **FormGroup:** missing `h` import from `vue` (a96dc19), closes #236

## 2.2.0 (2023-05-26)


###  BREAKING CHANGES

* handle color states on form elements (#234)
* **Notification:** rename `progressColor` to `color` and style icon
* **Avatar:** remove `chipVariant` prop
* **VerticalNavigation:** split preset

### Features

* handle color states on form elements (#234) (9ce531a)


### Bug Fixes

* **Notification:** remove default color on icon (1a9dc5c)
* **Radio/Checkbox:** remove ring offset on focus (a56dbea)
* **VerticalNavigation:** badge display (d2ee505), closes #205


* **Avatar:** remove `chipVariant` prop (1f22f84)
* **Notification:** rename `progressColor` to `color` and style icon (1b61ec7)
* **VerticalNavigation:** split preset (19923cb)

## 2.1.0 (2023-05-19)


### Bug Fixes

* **app.config:** trailing space (703fdef)
* **ButtonGroup/AvatarGroup:** allow `v-for` (#173) (3fa10aa)
* **DocsPageHeader:** github component link (#182) (7f00ec6)
* **Input:** expose ref (2ded24b)
* **module:** add `.mjs` extension to tailwind `content` when builded (246449b), closes #172
* **Textarea:** expose ref (ea740bf)

### 2.0.4 (2023-05-15)


### Bug Fixes

* **SelectMenu:** add missing `inline-flex` on wrapper (e8b4654)

### 2.0.3 (2023-05-15)

### 2.0.2 (2023-05-11)


### Bug Fixes

* **LinkCustom:** handle `button` when no `to` prop (c7c78cb)

### 2.0.1 (2023-05-11)


### Bug Fixes

* **app.config:** remove old `u-` classes (939efba)
* **Avatar:** `gray` missing for `chipColor` (fd4c80a)
* **Avatar:** shrink chip ring (ebf5fd6)
* **Button:** `variant` validator takes color into account (d1d8ab3)
* **colors:** missing `useNuxtApp` import (76a0d61)
* **CommandPalette:** expose input ref to template (192bf4c)
* **CommandPalette:** put back searchable on `v-show` to input ref always exists (aacb7e9)
* **CommandPalette:** wrong type usage (4665563)
* **docs:** sticky search button `z-index` (f48ead6)
* **Icon:** missing import (cd430a4)
* **module:** remove `.ts` ext from app.config (a076cae)
* **Notifications:** missing `computed` from vue (9ce43ac)
* prefix imported components (0c69385)
* put back app.config for hmr (626409e)
* remove augmentation of app (#152) (f5c0030)
* revert back to runtime app for hmr (#153) (97b1a85)
* **Select:** move types from template (fa05653)
* **Toggle:** wrong `icon-off` positioning (d5471f4)
* update to fix type issues (#151) (11e00a1)
* **VerticalNavigation:** improve focus (034a95d)
* **VerticalNavigation:** improve stacking context (28ee917)

## 2.0.0 (2023-05-04)


### Features

* rewrite to use app config and rework docs (#143) (6da0db0)

### 1.2.11 (2023-05-04)


### Bug Fixes

* **defineShortcuts:** use `useEventListener` (#150) (59f62d3)

### 1.2.10 (2023-04-07)


### Bug Fixes

* **CommandPalette:** typecheck (cfce152)

### 1.2.9 (2023-04-07)

### 1.2.8 (2023-04-04)

### 1.2.7 (2023-04-04)


### Bug Fixes

* **useTimer:** remaining after pause (aafdfdb)

### 1.2.6 (2023-04-04)

### 1.2.5 (2023-04-04)

### 1.2.4 (2023-04-04)

### 1.2.3 (2023-03-22)

### 1.2.2 (2023-03-20)

### 1.2.1 (2023-03-20)


### Bug Fixes

* **defineShortcuts:** shift + alphabetic character handling (#140) (377b418)

## 1.2.0 (2023-03-09)


### Bug Fixes

* **defineShortcuts:** add missing import (37b2271)
* **Tooltip:** `shortcutsClass` prop type (fa49d52)

### 1.1.4 (2023-03-02)

### 1.1.3 (2023-03-02)

### 1.1.2 (2023-02-28)


### Bug Fixes

* **Tooltip:** truncate (d08e64d)
* **VerticalNavigation:** links `to` type (7970aef)

### 1.1.1 (2023-02-20)

## 1.1.0 (2023-02-17)


### Features

* **CommandPalette:** handle async search for specific groups (efa9674)


### Bug Fixes

* **CommandPalette:** types (4702a4f)

## 1.0.0 (2023-02-17)


### Features

* migrate to `@egoist/tailwindcss-icons` (ee33522)

### 0.2.1 (2023-02-16)

## 0.2.0 (2023-02-16)

### 0.1.39 (2023-02-16)


### Features

* use `nuxt-icon` (f5d068b)


### Bug Fixes

* **SelectCustom:** handle search on string arrays (6018f00)

### 0.1.38 (2023-02-03)

### 0.1.37 (2023-02-03)


### Bug Fixes

* **CommandPalette:** improve accessibility (#129) (bea47b5)

### 0.1.36 (2023-02-02)


### Bug Fixes

* **CommandPalette:** put back cursor on top only when query changes (5bf5a31)

### 0.1.35 (2023-02-01)


### Bug Fixes

* **AvatarGroup:** preset size prop (c90cd9c)
* **Dropdown:** lint (1c4d46e)
* **Dropdown:** prevent panel display when no items (a764486)

### 0.1.34 (2023-01-27)


### Bug Fixes

* **CommandPalette:** typecheck (27717a5)

### 0.1.33 (2023-01-27)

### 0.1.32 (2023-01-23)

### 0.1.31 (2023-01-17)

### 0.1.30 (2023-01-17)

### 0.1.29 (2023-01-17)

### 0.1.28 (2023-01-13)

### 0.1.27 (2023-01-12)

### 0.1.26 (2023-01-09)


### Bug Fixes

* **CommandPalette:** select first item on search changes (#126) (4f56921)

### 0.1.25 (2023-01-09)

### 0.1.24 (2023-01-04)

### 0.1.23 (2022-12-20)

### 0.1.22 (2022-12-19)

### 0.1.21 (2022-12-19)

### 0.1.20 (2022-12-19)


### Bug Fixes

* avoid referring to complex types in props (#123) (ff9f6c2)

### 0.1.19 (2022-12-16)

### 0.1.18 (2022-12-15)

### 0.1.17 (2022-12-06)


### Bug Fixes

* remove stop propagation on mode hover (16fd1c0)

### 0.1.16 (2022-12-06)


### Bug Fixes

* **Popover:** preset from tooltip (0ade69d)

### 0.1.15 (2022-12-02)


### Bug Fixes

* **Dropdown:** better handle item click to preventDefault (#119) (44a78d7)

### 0.1.14 (2022-12-02)

### 0.1.13 (2022-12-01)

### 0.1.12 (2022-11-29)


### Bug Fixes

* **Checkbox:** types (629bb72)

### 0.1.11 (2022-11-29)


### Bug Fixes

* **Checkbox:** revert type fix as it breaks checkboxes (7f18c6b)

### 0.1.10 (2022-11-26)


### Bug Fixes

* default popper options (1ad9606)
* default props for command palette (#116) (952786e)

### 0.1.9 (2022-11-25)


### Bug Fixes

* **Icon:** couldn't load anymore (6321d3e)
* **Icon:** eslint ignore (bc0c168)

### 0.1.8 (2022-11-16)

### 0.1.7 (2022-11-16)

### 0.1.6 (2022-11-15)


### Bug Fixes

* **SelectCustom:** add `w-full` on `ComboboxButton` (3a300f7)

### 0.1.5 (2022-11-08)

### 0.1.4 (2022-11-08)


### Bug Fixes

* **button:** support `RouteLocationRaw` type for `to` (#112) (1b56b50)

### 0.1.3 (2022-11-04)


### Bug Fixes

* **docs:** component input string field (e521e1a)
* **types:** add missing field in command palette type (#111) (28586c3)

### 0.1.2 (2022-10-27)

### 0.1.1 (2022-10-26)


### Bug Fixes

* **CommandPalette:** lint (6fab68b)
* **Dropdown:** close on click item with `to` (#103) (5517cc2)
* **Popover:** avoid crash on mount if ref not loaded (#105) (e9f0224)
* **SelectCustom:** types and lint (ec8bd5c)

## 0.1.0 (2022-10-25)


### Bug Fixes

* `to` prop type (be94fea)
* **CommandPalette:** command icons opacity in dark mode (abb93b5)
* **CommandPalette:** fix groups computed (9302b8d)
* **CommandPalette:** group items spacing (32922de)
* **CommandPalette:** hack for reactivity (b43394d)
* **CommandPalette:** icon color on hover (e4f148e)
* **CommandPalette:** icon inactive opacity on dark mode (5722a3a)
* **CommandPalette:** prevent empty active slot (056ab30)
* **CommandPalette:** prevent shortcuts to disappear on hover (f87252f)
* **CommandPalette:** reactivity issue + improve results (ec9f670), closes #95 #96
* **CommandPalette:** truncate suffix (aa242aa)
* default object options (95c14a4)
* **Dropdown:** increase timeout for hover mode (7291942)
* error in Popover and Dropdown (541ed30)
* **icon:** hydratation warning when loading same icon twice (#99) (d57647a)
* load icons on mount rather than within setup (#82) (62361bf)
* **Modal:** use object for `innerStyle` (72dc0d0)
* **Notification:** improve placement with description (945fec6)
* **Notification:** prevent error without timeout (8a66f5e)
* **Popover:** `inline-flex` on trigger button (593573a)
* **SelectCustom:** avoid submitting to form when closing (#83) (cf1b2cd)

### 0.0.3 (2022-07-18)


### Features

* **AvatarGroup:** preset support (#69) (00b9a08)
* **button:** Add black variant (#34) (46ca8c5)
* **clipboard:** replace `navigator.clipboard` with vueuse `useClipboard` (#33) (4532e09)
* **CommandPalette:** implement component (18dceb7)
* **Dropdown:** add `hover` mode (#45) (77149f0)
* **Icon:** support custom component and emoji (c1a7629)
* migrate to `@nuxtjs/tailwindcss` (#32) (702abf7)
* **module:** handle variants with dynamic colors (5a8b078)
* **plugins:** clipboard (#29) (832ffe4)
* **Popover:** handle hovering mode (#47) (c431f8b)
* **Slideover:** add close button in header (#65) (2f90ce2)
* **Slideover:** allow opening from the right side (#64) (aecfef2)
* **Slideover:** preset support (#68) (5b4e4f8)
* **toast:** add aliases for `info` and `warning` notifications (23deef3)
* **toast:** expose `timeout` to alias methods (#30) (6bd5197)


### Bug Fixes

* **Avatar:** add missing `watch` import (cc01af8)
* **AvatarGroup:** pass all avatar props (723f075)
* **Avatar:** missing `ref` import (eb41b23)
* **Avatar:** placeholder (#31) (1bec8d1)
* **Avatar:** prevent boolean src (da3ed26)
* **Avatar:** remove gradient support (ed499b3)
* **Avatar:** truncate placeholder if too long (#61) (6585bfc)
* **Avatar:** url error handling (#39) (fb3ff2e)
* **Button:** wrong config for icon size class (760da3d)
* **Card:** nullable validator on card roundedClass prop (c4a40b0)
* **Card:** prevent double class (06b07e2)
* **Card:** prevent empty `sm:` class when `rounded-class` is null (dd64637)
* **colors:** hard-code colors as tailwindcss/colors is different (f67fdb7)
* **colors:** move primary to safeColors (3ab0698)
* **CommandPalette:** add missing import (ea293ba)
* **CommandPaletteGroup:** fail replace on items (1495ff9)
* **CommandPaletteGroup:** invalid spacing when no icon (cf65b4a)
* **CommandPalette:** options priority (76ffbf4)
* **CommandPalette:** slice from computed options (503b9a6)
* Dropdown and Popover manual padding (2e09939)
* **Dropdown:** improve disabled state (5fb7f10)
* Hover mode on Dropdown & Popover (#48) (8bc4902)
* **Icon:** missing imports (c3facb1)
* **Icon:** name can be an object (f513ea6)
* **Icon:** reload icon when prop name changes (78021d3)
* **input:** background should go into appearance (33b1176)
* **Link:** `exact` handling (ceedbe0)
* **Link:** add missing `inactive-class` on `button` and `a` (035919a)
* **Link:** handle `isActive` through vue-router (aef1156)
* **Link:** send correct active (d4b6599)
* **Link:** use `exact` (7737242)
* **Modal:** `widthClass` prop and default preset value (#56) (d980176)
* **Modal:** move classes to `DialogPanel` (dfe86f0)
* **Modal:** prevent attrs inherit (850c766)
* **module:** `gradient-avatar` include (85c8210)
* **module:** import `colors` from preset-mini (185273f)
* **module:** move colors utils to runtime dir (93c9fe1)
* **module:** parse presets with mjs ext (b2705fe)
* **module:** presets content (b8dd80d)
* **module:** register typography plugin (bbbe57d)
* **module:** remove safelist on max-w (358387e)
* **module:** resolve runtime dir (65aa169)
* **module:** search in tailwind colors for `primary` and `gray` (10d89d3)
* **module:** use `variants` key for safelist (4c89122)
* **Notifications:** default value in `useState` (af566ab)
* **Notifications:** inexistant `z-55` (60c72a2)
* **package:** update `postbuild:docs` command (8045c7b)
* **plugins:** error in provides (46ea467)
* **Popover:** add missing `onMounted` import (656b6e1)
* **Popover:** add missing `ref` import (2eb2fea)
* **popper:** use `$el` after 1.5 upgrade (9554e80), closes /github.com/tailwindlabs/headlessui/discussions/1125#discussioncomment-2299441
* **preset:** replace avatar wrapper with `inline-flex` (45cf898)
* **presets:** add disabled bg color on nuxt buttons (e1d79d7)
* **presets:** defu merging (e034218)
* **presets:** dropdown avatar position (516e7fa)
* **presets:** support dark ring-offset-color (a9f1d93)
* **SelectCustom:** add default value to placeholder (8492e16)
* **SelectCustom:** add missing `listContainerClass` prop (ae6e8ee)
* **SelectCustom:** add missing `required` prop (619f620)
* **SelectCustom:** add missing `text-sm` class (eb6fbd9)
* **SelectCustom:** add missing bg in list input (da4e8d5)
* **SelectCustom:** add tabindex -1 to hidden input (09aed4b)
* **SelectCustom:** dark mode preset (1e6ad72)
* **SelectCustom:** handle placeholder when value is null (4e0d23e)
* **SelectCustom:** icon name in prop only for now (2e64343)
* **SelectCustom:** improve creatable placeholder (d413cf7)
* **SelectCustom:** missing padding on list (524f841)
* **SelectCustom:** move max-height on base (db39a9c)
* **SelectCustom:** move wrapper on top of `Listbox` (8222d05)
* **SelectCustom:** move wrapper under `Listbox` (936d6a5)
* **SelectCustom:** prop is `icon` instead of `iconName` (6da0c28)
* **SelectCustom:** remove unused import (0e0f3e3)
* **Select:** default value handling (eb00439)
* **Select:** disable placeholder (7723704)
* **Select:** normalizedValue handling Object modelValue (#59) (e419d68)
* **Slideover:** remove useless padding (cf021a5)
* **Textarea:** autoresize (#43) (ba643d9)
* **textarea:** autoresize reactivity (#52) (f0bfe20)
* **toast:** `id` should be a string (7db0ca5)
* **Toggle:** add `v-if` when icon props not defined (90ff1c0)
* **Tooltip:** prevent close when hovering (18c194e)
* **useTimer:** lint rule changed (0e18526)
* **utils:** types (00e0ab3)
* **VerticalNavigation:** `link.avatar` is now an object (d733e25)
* **VerticalNavigation:** remove `avatarSize` prop (f0835cf)

### 0.0.2 (2022-02-01)


### Features

* **AlertDialog:** create component (#26) (71371ac)
* **alert:** Handle link as button (#25) (b218737)
* **components:** Update toggle component (8550c3b)
* module improvements (74bd7bc)
* support presets (#14) (8f09d0c)


### Bug Fixes

* **Badge:** add missing vue import (542ee20)
* **build:** add missing `types` dir (f666ff1)
* **build:** add plugins dir (3d2a5fe)
* **build:** include components (c30041f)
* **Button:** icon import (0de12aa)
* components dir resolution (500b4d6)
* **docs:** module import (84ec25b)
* **forms:** default should use functions (05c8f5d)
* **Input:** import `ref` from `vue` (8d23d8f)
* **Input:** remove ref import (9d70428)
* lint (78013a7)
* **Modal:** add missing `computed` import (11d6cc2)
* **module:** optimize deps for gradient-avatar (09033bb)
* **module:** presets import (97f8f56)
* **module:** use `resolveModule` to import presets (2d31146)
* **Notification:** add missing vue dep (cce650f)
* **Notifications:** add missing imports (4a8dd68)
* path misalignment in build, upgrade unocss (#3) (0b43414)
* provide exports without condition (d87a2c0)
* **Select:** missing vue imports (1755aa8)
* **Textarea:** imports from vue (ce46e58)
* **toast:** types (adbee9c)
* **Toggle:** add missing `computed` import (0f09c9b)
* **Tooltip:** missing `ref` import (b08a8cc)
* **useTimer:** remove log (c6dcbd1)
* **VerticalNavigation:** add `v-if` on label (79d8e08)
