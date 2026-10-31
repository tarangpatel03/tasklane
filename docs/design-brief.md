# Design brief

Fill this once per project. Claude reads it before any UI work. Vague answers produce generic UI; specific answers and real references produce distinctive UI.

## Product

- What it is (one sentence):
- Who uses it, and in what context (phone on the move, desk, one hand):
- Platforms: [ ] Android [ ] iOS [ ] Web (desktop + mobile) [ ] Tablet / foldable

## Direction

- 3 mood words (e.g. calm, precise, playful):
- Must NOT look like (apps/sites to avoid resembling):
- References (3-5 links, screenshots or Figma frames, and what to take from each: spacing, type, motion, color):

## Color

- Brand color(s), if any:
- Light, dark, or both:
- Accent usage:

## Typography

- Display font / text font (or "choose and justify in one line"):
- Tone (geometric, humanist, editorial serif, mono accents, ...):

## Shape and motion

- Corner style (sharp / soft / pill):
- Density (airy / compact):
- Motion personality (snappy / smooth / springy):

## Content

- Real copy, names and sample data (paste or describe):
- Logo, icons, images available:

## Must-have screens / sections

-

---

# Brand and shared tokens

Source: the Tasklane design project (`Tasklane Brand`, `Task App Tokens and Components`). Light theme only. Material 3 structure with a violet primary, 24px card radii, pill controls and violet-tinted shadows. Every interactive element is at least 48px tall (44px for dense table controls on the admin panel). Status and priority always pair colour, icon and text.

## Brand

- Name: **Tasklane**. Idea: three lanes that fill from empty to done, matching To Do, Working and Completed.
- Mark (64 x 64 grid): three rounded columns, 14 x 44, radius 7, at x = 7, 25 and 43, y = 10. Column 1 is `#5B4FD6` at 22%. Column 2 is 22% with a 24-tall fill from y = 30 at 62%. Column 3 is solid with a white check, path `M46 33l3.6 3.6 5.8-7`, stroke 3.2, round caps.
- Variants: colour mark on transparent; one-colour dark `#1C1B2E` (outlined lanes, check cut out, flat fill); one-colour white on `#5B4FD6`.
- Horizontal logo: mark plus "Tasklane" in Plus Jakarta Sans 800, tracking -2%, `#1C1B2E`. Clear space of one column width. The check is the first detail to drop at 29px, so use the mark at 20px or larger.
- App icon, 1024 square: background gradient `#6A5EE6` to `#4338B8` (x .2, y 0 to x .8, y 1), full bleed, no rounding. Foreground is white lanes at 30%, 30% and 70% with the check cut out, scaled 10.4x and centred. The farthest corner stays inside the 66% (676px) safe-zone circle. The full icon is both layers combined, square, for iOS and stores. It must survive circle, squircle, rounded-square and square launcher masks.
- Files in `docs/design/logo/` (SVG, metadata stripped): `tasklane-mark`, `tasklane-mark-mono`, `tasklane-mark-mono-white`, `tasklane-logo-horizontal`, `tasklane-icon-background`, `tasklane-icon-foreground`, `tasklane-icon-full`. The 1024px PNGs are not in the repo yet; export them from the design project when the mobile app icon is built (checkpoint 5.1). The horizontal SVG names the font; convert text to outlines before print use.
- Wordmark use: lavender wash `linear-gradient(160deg, #E4DEFF, #F6F4FD)` behind headers and the login hero only.

## Color

| Group            | Token               | Hex                                             |
| ---------------- | ------------------- | ----------------------------------------------- |
| Brand            | Primary             | `#5B4FD6`                                       |
|                  | Primary pressed     | `#4338B8`                                       |
|                  | Primary container   | `#E6E1FF` (text `#2F2791`)                      |
| Surface          | Background          | `#F6F4FD`                                       |
|                  | Surface             | `#FFFFFF`                                       |
|                  | Surface variant     | `#EEEAF8`                                       |
|                  | Outline             | `#D5D0EA`                                       |
| Text             | Primary / secondary | `#1C1B2E` / `#5F5C74` (strong labels `#3A3752`) |
| Status (bg/fg)   | To Do               | `#ECE8FF` / `#4B3FB0`                           |
|                  | Working             | `#DDEBFF` / `#1E58B8`                           |
|                  | In Review           | `#FFE8D1` / `#8F4A00`                           |
|                  | Completed           | `#D5F5E3` / `#17653F`                           |
| Priority (bg/fg) | Low                 | `#E3EAF2` / `#3D4F63`                           |
|                  | Medium              | `#FFEFC2` / `#6B4B00`                           |
|                  | High                | `#FFDAD8` / `#8A1E22`                           |
| Feedback         | Error               | `#C2282D` (text on tint `#A3262A`)              |
|                  | Approve             | `#17653F`                                       |
|                  | Destructive         | `#A3262A`                                       |

Status and priority text colours are the darker tone on each tint and all pairs meet 4.5:1. Status icons: To Do ring, Working half-filled ring, In Review ring with clock hands, Completed filled circle with check. Priority icon is three bars filled 1, 2 or 3 of 3.

## Typography

Plus Jakarta Sans (Google Fonts, weights 500, 600, 700, 800), `system-ui` fallback. Numbers in tiles and counters use tabular figures.

| Style    | Size / line | Weight | Tracking |
| -------- | ----------- | ------ | -------- |
| Display  | 36 / 42     | 800    | -0.02em  |
| Headline | 28 / 34     | 800    | -0.01em  |
| Title L  | 22 / 28     | 800    | 0        |
| Title M  | 18 / 24     | 700    | 0        |
| Body L   | 16 / 24     | 500    | 0        |
| Body M   | 14 / 20     | 500    | 0        |
| Label L  | 14 / 20     | 700    | 0.01em   |
| Label S  | 12 / 16     | 700    | 0.02em   |

## Shape, spacing, elevation

- Radii: XS 10 (tags), S 14, M 18 (inputs), L 24 (cards), XL 32 (sheets), pill (buttons, chips).
- Spacing: 4, 8, 12, 16, 20, 24, 32, 40. Card padding 20. Touch target 48 x 48.
- Elevation: L0 outline `0 0 0 1px #E6E2F3`; L1 `0 1px 2px rgba(60,40,140,.08), 0 2px 6px rgba(60,40,140,.06)` (tiles); L2 `0 6px 20px rgba(60,40,140,.10)` (cards); L3 `0 10px 30px rgba(60,40,140,.22)` (nav, sheets, dialogs).

## Components

- Buttons: primary 56px pill `#5B4FD6` with white text and shadow `0 6px 16px rgba(91,79,214,.32)`; tonal, outlined and text variants 48px; Approve `#17653F`, Reject tint `#FFDAD8` / `#8A1E22`, destructive `#A3262A`; disabled `#ECEAF3` / `#8B889E`. Press: scale .96 over 100ms.
- Filter chip: 48px pill, selected `#5B4FD6` with a check, unselected outlined `#D5D0EA` on white.
- Status badge: 32px pill with icon. Priority tag: 28px, radius 10. Avatar: initials only, 32px in lists, 48px on detail; stack overlaps by 8 to 10px with a 2px white ring.
- Input: 56px, radius 18, border 1.5px `#D5D0EA`, background `#FBFAFF`, visible label above, 16px text. Focus: border `#5B4FD6`, ring `0 0 0 4px rgba(91,79,214,.18)`, white background. Error: 2px `#C2282D` border, icon and text message.
- Task card: radius 24, padding 20, L2. Summary tile: radius 24, status tint with number (34/40, 800) and label.
- Skeleton: shimmer `#EEEAF8` / `#F8F6FD`, 1.4s linear loop. Empty state: geometric mark, one sentence, one optional action.

## Motion

| Name           | Duration | Easing                     | Use                              |
| -------------- | -------- | -------------------------- | -------------------------------- |
| Press          | 100ms    | standard `(.2,0,0,1)`      | buttons, chips, cards            |
| Fade           | 200ms    | standard                   | scrim, status tint, filters      |
| Sheet / badge  | 300ms    | emphasized `(.05,.7,.1,1)` | sheet enter, status change       |
| Shared element | 450ms    | emphasized                 | card to detail, tablet pane swap |
| Exit           | 200ms    | accelerate `(.3,0,.8,.15)` | dismiss, removal                 |

Staggered list entrance: 40ms per row, maximum 8 rows. Count-up on summary numbers (600ms ease-out in the token sheet; the admin dashboard uses 800ms). Status change: icon morphs, tint cross-fades over 300ms, badge scales 1 to 1.08 to 1. Reduced motion: skip count-up and use 100ms fades.

# Admin panel

Admin only, React web. Reference screens: `docs/design/admin/Admin Panel.dc.html` (open it in a browser; it has a Responsive preview switcher that is design-only and not part of the product). Reuses everything above; only admin-specific values are listed here.

## Admin tokens

- Layout: sidebar 264px expanded, 92px collapsed (desktop), 288px off-canvas below desktop. Content max width 1280. Page margin 32 (desktop), 24 (tablet), 16 (phone). Page title 36 / 42, 28 / 34 on phone.
- Tables: minimum width 1020 (tasks) and 940 (users). Tasks grid `2.4fr 1.2fr 1fr 1.4fr 1.1fr 1fr 56px`, users grid `2.6fr 1fr 1.2fr .9fr 1.3fr 56px`. Header cells 12 / 16 label, active sort `#4338B8`.
- Popovers: row menu 210px, profile menu 240px. Row menu target 44px.
- Panels: task form drawer 520px, task detail drawer 640px, user form drawer 480px; modals 420 to 480px. Scrim `rgba(28,27,46,.42)`.
- Timing: row stagger 40ms, dashboard tile stagger 70ms, count-up 800ms, page change fade and 10px slide in 160ms, toast auto-dismiss 3.2s.

## Components

- **Sidebar:** logo block (44px mark, "Tasklane" 19 / 22 weight 800, "Admin panel" 12 / 16 weight 600 `#5F5C74`), items Dashboard, Tasks, Users with 22px icons, active item in a tonal pill (`#E6E1FF`, text `#2F2791`). Collapse toggle on desktop; hamburger and scrim below 1024.
- **Top bar:** sidebar toggle, breadcrumb (hidden on phone), profile menu (name, email, Profile, Change password, Log out).
- **Data table:** sortable headers with `aria-sort`, name cells with avatar and two lines, status badge, priority tag, avatar stack, overdue due text in `#A3262A`, row menu, skeleton rows while loading, empty state with "Clear filters", footer "Showing x-y of n" with numbered pagination (44px buttons).
- **Filter bar:** search input plus dropdown filters (status, priority, assignee, due on tasks; role and status on users). A dropdown with an active value turns violet (`#F1EEFF` fill, `#5B4FD6` border). "Clear filters" appears when any filter is active. Changing a filter restaggers the rows.
- **Drawer:** slides from the right in 300ms emphasized, full width on phone, Esc closes. Task form fields: title, description, priority (segmented), due date, requires-review toggle, Manager dropdown, Employee person rows with check. Task detail: badges, due, review rule, people (Manager and Employees with change links), comments with composer, status-history timeline, actions (Delete, Edit, Reject, Approve).
- **Modal and confirm:** centred, scale .94 to 1 with fade. Used for Change Manager, Change assignees, Reject (reason required), Delete task, Deactivate user (lists blocking tasks, "Reassign in Tasks").
- **Toast:** bottom right, full width with 16px margins on phone, dismissible.
- **Login:** split layout, hero with the mark and headline "Keep every task, Manager and Employee in view." on the lavender wash, form card (email, password with show/hide, Forgot password?, Sign in). Note: "Admin accounts only. Managers and Employees sign in on the mobile app."
- **Dashboard:** four status tiles (click through to Tasks filtered by status), overdue list (5 rows), tasks per Manager stacked bars by status, recent activity feed.

## Responsive rules

- **Desktop, 1024 and up:** fixed sidebar (collapsible), tables, tiles `minmax(220px, 1fr)`.
- **Tablet, 640 to 1023:** off-canvas sidebar with scrim, tables become cards in 2 columns, margins 24.
- **Phone, below 640:** cards in 1 column, margins 16, tiles `minmax(140px, 1fr)`, count 44 / 48, hidden breadcrumb and user name, drawers full width, toast full width.
- Build with CSS container or media queries at 640 and 1024; never target device models.
