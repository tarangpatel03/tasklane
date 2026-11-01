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
- Files in `docs/design/logo/` (SVG, metadata stripped): `tasklane-mark`, `tasklane-mark-mono`, `tasklane-mark-mono-white`, `tasklane-logo-horizontal`, `tasklane-icon-background`, `tasklane-icon-foreground`, `tasklane-icon-full`. The 1024px PNGs (`*-1024.png`) are in the same folder for the mobile app icon (checkpoint 5.1). The horizontal SVG names the font; convert text to outlines before print use.
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

# Mobile app

Manager and Employee, React Native. Reference screens in `docs/design/mobile/` (open the `.dc.html` files in a browser; role, width and orientation switchers are design-only): `Task App Tokens and Components` (tokens), `Task App Phone Screens` (Tasks, Task detail), `Task App Phone Screens B3` (Login, Create task, Review queue, Profile), `Task App Tablet` (Tasks split pane, portrait), `Task App Tablet B2` (Login, Create task, Review queue, Profile on all three size classes). Where a screen and the token sheet disagree, this section says which wins. Reuses everything above; only mobile-specific values are listed.

## Layout and size classes

- Screen margin 20 (16 at 320 wide), plus safe-area insets. Sticky bottom content sits at 12 + bottom inset. Checked widths 320, 390, 430; tablet 1180 x 820 and 820 x 1180.
- Compact (below 600): phone layouts. Medium (600 to 899): portrait tablet layout. Expanded (900 and up): split pane. The split starts at 900 for both Tasks and Review (`Task App Tablet B2`); this overrides the `rn-responsive-ui` skill's 840. `useWindowClass()` is the only place these numbers live.
- Animation library: `react-native-reanimated`. Greeting text is "Hello,".
- Header wash on every top-level screen: `linear-gradient(160deg, #E4DEFF, #F6F4FD)` (the token sheet shows `#E9E4FF`; the screens use `#E4DEFF`, which wins), bottom radius 32 (40 on Login and Profile).
- Floating bottom nav: 72px pill, white at 94%, L3 shadow, 16px side margin (token sheet; phone screens draw 12, the token sheet wins), 8px inner padding. Items: Tasks, Review (Managers only, red `#C2282D` count badge), Profile. Employees see Tasks and Profile. Active item is a tonal pill (`#E6E1FF`, text `#2F2791`, icon and 13/16 label side by side); inactive items stack icon over an 11/14 label in `#5F5C74`. Icons 22px.
- "New task" button (Managers): 56px pill, right edge at the screen margin, 112 above the bottom (clears the nav). It appears on Tasks and Review.

## Screens

- **Login:** hero wash with the mark (use the Tasklane mark, not the placeholder square in the design), "Welcome back" 34/40, "Sign in with your work email.", Email, Password with a Show/Hide text button (48 tall, inside the field), right-aligned "Forgot password?" text button, Sign in (primary 56). Errors appear after the first submit: 2px `#C2282D` border, icon and text ("Enter a valid email address", "Enter your password").
- **Tasks:** greeting "Hello," 14/20 and the first name 28/34, role pill (24px, white, text `#4338B8`), 48px round refresh button. Four status tiles in a 2 x 2 grid (gap 12, min height 88, radius 24, status icon and label 13/18, count 34/40 tabular). Tapping a tile or chip filters; the active tile gets a 2.5px inset ring in its status colour, and tapping it again clears the filter. Filter chips scroll sideways: All, To Do, Working, In Review, Completed, each "Label · n". List title 20/26 and "n tasks" 13/18. Pull to refresh shows the skeleton.
- **Task card:** priority tag and status badge on the first row, title 18/24 700, then a clock icon with the due text (`#5F5C74`, overdue `#A3262A` and reads "Overdue · Oct 30") and a 32px assignee avatar stack. Press scale .98.
- **Task detail:** wash header with a 48px round back button, "Task detail", priority tag and large status badge (36px), title 26/32 800. Cards (radius 24, padding 20, 16 apart, section titles 17/22 800): Description with Due date and Review rows ("Manager approval required" or "Not required"); People (48px avatars, the Manager has a 3px `#5B4FD6` ring and a "Manager" label in `#4338B8`; a task with no Manager simply omits that row); Comments with a count, 36px avatars, bubbles (`#F6F4FD`, radius 18) and a composer (48px pill input plus a 48px round send button, "No comments yet" when empty); Status history, newest first, with a 14px dot per entry, a 2px `#D5D0EA` line, the badge, "actor · date" and the note.
- **Task actions** are pinned at the foot over a fade from transparent to `#F6F4FD`: Employee Start (primary) or Submit for review (primary) or Complete (Approve green); Manager on an In Review task Reject (tint) next to Approve (green), each 56px. When the viewer has no action, a 56px pill in `#ECEAF3` shows a status line ("Waiting for manager review", "Task completed", "Approve or reject when In Review").
- **Reject sheet:** bottom sheet with the task title, a required multiline field "Reason for rejecting (required)", Cancel (outlined) and Reject task (`#A3262A`, disabled `#ECEAF3` / `#8B889E` until text is entered). Sheet: radius 32 top, handle 40 x 5, scrim `rgba(28,27,46,.42)`, swipe down or tap the scrim to dismiss. The reason is stored in the status history only; it is not also posted as a comment.
- **Manager edit and delete** (not in the design files; modelled on the admin panel): for the task's Manager only, an "Edit" tonal pill (48px) and a "Delete" icon button in `#A3262A` in the detail header row beside the back button. Edit reuses the Create task screen titled "Edit task", prefilled, with Employees (at least one) and without a Manager field; the button reads "Save changes" and is disabled until something changed. Delete opens a bottom sheet in the Reject-sheet style: "Delete task?", the task title, "It disappears from every list. This can't be undone from the app.", Cancel and "Delete task" (`#A3262A`). Snackbars: "Task updated", "Task deleted".
- **Create task** (Manager): close button and "Manager" label in the header, "Create task" 30/36. Fields: Title, Description (3 rows), Priority (three 52px tiles, radius 18, 2px border, the selected one uses its priority colours), Due date (optional, native date input with a clear action), Requires review (72px switch row, 52 x 32 switch, "On" / "Off" and a one-line effect text), Employees (64px rows, radius 20, 40px avatar, name, 28px check circle; selected `#F1EEFF` with a `#5B4FD6` border; "n selected"; no open-task count). The footer button is disabled with the text "Add a title and an Employee" until valid, then "Create task". Success is a full-screen overlay: 96px `#17653F` tile with a check, "Task created", "The selected Employees have been assigned and will see it in their list.", button "Back to review queue".
- **Review queue** (Manager): header "Review queue" 30/36 with "n waiting for your review" (count 22/26 800 in `#8F4A00`). Cards show priority, In Review badge, title, a 40px avatar with "Submitted by Name" and "when · due", then Reject (tint) and Approve (green) 48px buttons. A handled card collapses (max height 300ms, slides 60px right, fades 200ms) and a snackbar confirms. Empty state: "Nothing in review" and "Tasks your team submits for review will appear here."
- **Profile:** 96px avatar (`#2F2791`, white initials, 4px white border), name 26/32, role pill; a card with Name, Email and Role rows (56px each); a 64px "Change password" row with a chevron that opens a bottom sheet with three password fields (placeholders "Current password", "New password", "Confirm new password"; no rule text, the API accepts 8 to 128 characters); an outlined "Log out" button (56px, border `#E7B9B8`, text and icon `#8A1E22`).
- **Snackbar:** `#1C1B2E`, radius 20, min height 48, 14/20 600 white, mint check icon, 108 above the bottom, visible 2.2s, rises 300ms.
- **Empty states:** "No tasks here" with "Nothing matches this status right now." (80px tile) and the review one above (96px tile). Skeleton cards are the card layout in shimmer: 3 on phone and landscape, 4 on portrait tablet.
- **Avatars:** initials on soft pairs (bg / fg): `#C9C1FF / #2F2791`, `#BFE0FF / #12407F`, `#FFD9B8 / #6E3900`, `#C8F0DA / #17653F`, `#FFD0E0 / #7A1E45`; the signed-in Manager's own avatar is `#2F2791` with white text; overflow "+n" is `#ECEAF3 / #3A3752`. Stack overlap is 8px with a 2px white ring.

## Tablet

- **Expanded (900 and up, design 1180 x 820):** 420px list pane with a 1px `#E6E2F3` right border and 24px padding; tiles 2 columns, cards 1 column; the selected card is `#F1EEFF` with a 2.5px inset `#5B4FD6` ring. Nav pill is 388 wide inside the list pane; the "New task" button sits at the right edge of that pane. The detail pane (`#FBFAFF`) fills the rest: wash header, padding 32, title 30/36, body in two columns (Description and People left; Comments and Status history right), and a 104px action bar at the foot (white, 1px `#EEEAF8` top border, buttons right-aligned, 40px padding). Selecting a card swaps the detail with a 300ms fade and 24px slide. The first task is selected on load in the design; keep the selection across rotation.
- **Medium (600 to 899, design 820 x 1180):** list full width, tiles in one row of four, cards in two columns, nav pill 480 wide centred. A card opens the detail in a 560px side sheet from the right (radius 32 on the left corners, scrim, 450ms emphasized, round close button in the header, single column body). The Reject sheet is 520 wide, centred.
- **Login, Create task, Review queue, Profile** (`Task App Tablet B2`): page margins 20 compact, 40 medium. Login is a centred white card on the lavender wash (max 480, radius 32, padding 32, 20 compact). Create and Edit task are full screen on compact and a centred modal on medium and expanded (max 560 wide, radius 32, max height viewport minus 96, scrim, header with a round close button, scrolling body, fixed white footer with a 1px `#EEEAF8` top border). Profile is a centred column, max 640. Review queue: medium is a single pane whose cards keep inline Reject and Approve; expanded is a 420px queue with the selected card highlighted (`#F1EEFF`, 2.5px inset `#5B4FD6` ring) and the task detail on the right with Reject and Approve in the 104px foot bar; the selection survives size changes; with nothing selected the right pane reads "Nothing in review" and "Select a task from the queue when one arrives."; buttons on a queue card never change the selection. The right-hand detail is the full Task detail (B2 omits Comments and People, the app keeps them). Nav pill: 12px side margins on compact, 480 wide centred on medium, 388 wide inside the list pane on expanded. The Reject sheet is full width on compact and 520 wide centred otherwise.

## Mobile motion

- List cards stagger 40ms each, maximum 8, 300ms emphasized, 16px rise. Detail enters over 450ms emphasized with a 60px slide (phone). Status badge scales 1 to 1.1 to 1 over 300ms while tint and icon cross-fade. Summary counts tick up over 600ms (ease-out cubic) on load and on role or filter change. Filters restagger the list. Sheets 300ms emphasized, scrim 200ms. Queue removal as above. Orientation or width changes resize panes over 450ms emphasized. Reduced motion: no count-up, 100ms fades.
