# Phone dashboard: list and page

Date: 2026-10-27
Status: implemented
Reference: the "Console — Phone · 390" export (`ConsolePhone.dc.html`, a 390 × 844 artboard with a
`view` prop for each section, `screen` = `list` | `page`, `theme`, `install`, `loading`). Kept outside the
repository at `/home/redstar/scratch/mobile-design/zip/`; captures of every view sit next to it
(`v-<view>-<screen>.png`).

## Purpose

On a phone the dashboard is the desktop console squeezed: a slide-over drawer for the servers and sections,
and a bottom tab bar for four of them. The design replaces both with Discord's own phone pattern: a list
screen to choose where to go, and a page screen that is all content, with one way back.

## Decisions (owner, 2026-10-27)

- Structure and pages: the new list/page shell, and the existing sections restyled to the mockup on a
  phone. No new data: the Overview's counters and chart stay what the site has today.
- Join Guard is left out until its dashboard section exists.
- Pinned and recent sections are kept, in the browser, per server.
- The unpublished phone drawer work (`move/session-work`, the profile sheet) is dropped: this replaces it.

## The two screens

Below the `sm` breakpoint (640px: where the sidebar hid and `DashboardBottomNav` showed) the dashboard
shows one of two screens. At `sm` and above nothing changes.

### List

- Left, the server rail as on desktop (66 px): Home, the servers with their badges, the add button.
- Right, the section list of the open server: `DashboardSidebar` as on desktop. It already draws what
  the reference shows: the server header, Overview and Modules, the collapsible "Modules" group with
  the recent chips, the "Pinned" group, every section with its count or dot, and the pin buttons. On a
  phone its rows get the reference's 46 px height and its pin button shows at 75 % on touch.
- Bottom, floating, the account card (avatar with status, name, `Online · @username`, a settings button).
- With no server open (Home), the right side is the direct messages list as today.

Choosing a section opens the page screen.

### Page

- A sticky header: a back button (to the list), the section's label, and the server's name under it.
- The section, unchanged in behaviour, restyled for the phone (below).
- Bottom, floating, the context card: the section's icon tile, the server's name, and one summary line
  (for example "8 of 9 modules on", "AutoMod · Enabled", "16 cases · 12 commands"). On the right:
    - the module's switch when the section is a module with a switch (AutoMod, Moderation, Roles,
      Appeals, Events), bound to the same staged setting as the section's banner;
    - otherwise a list button that goes back to the list.
- With staged changes the context card becomes the save bar: the status, Save and Reset, as the
  `console-savebar` does today.

The open screen is in the URL: `/app?screen=page` is the page, `/app` the list (`usePhoneScreen()`).
Opening a section on a phone pushes the query, so the browser's back gesture returns to the list and a
reload lands on the same screen; the header's back button goes back in history when the list is the
entry before, and replaces the URL otherwise. The section and the server stay in `useActiveGuild()`,
persisted as before. A change of the query alone never raises the unsaved-changes dialog: the staged
edits stay where they are.

## Pinned and recent

Already built: `useDashboardNavPrefs()` keeps the pinned sections, the recent ones and the open groups,
and `DashboardSidebar` draws them. The phone list reuses both; nothing new is stored.

## Restyling the sections on a phone

Values from the reference, applied under the phone breakpoint only. The sections already use most of
them (14px page padding, a 20px page title, 17px card headings with a hairline); the phone adds:

- Page padding 14 px; the section title (`DashboardPageHeader`) 20 px bold with its description in
  13 px muted, and the header's badge (counts such as "8 of 9 on") on the right of the title.
- Cards: radius 12 px, 1 px border `--field-border`, surface `--popover-surface`, padding 20 px; a card's
  heading 17 px semibold with a hairline that runs to the right edge.
- Fields full width; selects with the clear button inside; switches 40 × 22.
- Lists of rows (rules, cases, log channels): the row layout of the reference (label left, control right,
  56 px minimum height, hairline between rows).
- The content leaves room for the floating card (96 px bottom padding).

Each section keeps its components; the phone rules live with them as `max-md:` utilities or in the
component's scoped style.

## Out of scope

- New counters or charts for the Overview.
- Join Guard.
- Changes to the desktop layout.

## Tests

- `phoneScreen`: opening a section goes to page, back goes to list, persisted and restored.
- Layout: below `md` the list shows the rail, the sections and the account card; the page shows the
  header and the context card; the save bar replaces the context card with staged changes.
- Accessibility audits for the list, the page header and the context card in `test/nuxt/a11y.spec.ts`.
