# PBL Group Builder — Design Review & Redesign Spec

Reviewed against the `ui-ux-pro-max` rule set (Accessibility → Touch → Performance → Style →
Layout → Typography/Color → Animation → Forms → Navigation → Charts). This is a planning
document; nothing here is built yet. It assumes the hard constraints are non-negotiable:
**single self-contained offline `.html`, FERPA-safe, no network, the workbook is the database.**

---

## 1. Current state (after the tabbed-shell pass)

Two top-level tabs (**Roster & data** / **Groups**), an icon transport bar (example / open /
paste / template / undo / redo / export), an editable spreadsheet with sanitized pick-lists,
a heuristic solver, a drag-and-drop board with live re-validation + lock/re-solve, results
write-back, and a print/PDF roster. Light theme, JABSOM green, inline-SVG icons, in-app
confirm dialog. ~80-student example loads by default.

---

## 2. Design review — findings by priority

### 2.1 Accessibility (CRITICAL)
- **Good:** icon buttons now carry `aria-label` + `title`; SVGs are `aria-hidden`; the masthead
  green on white passes contrast; in-app modal uses `role="dialog"`/`aria-modal`.
- **Gaps to fix:**
  - **Focus visibility** — no explicit `:focus-visible` ring on buttons/chips/tabs. Add a 2px
    `--accent` outline (rule `focus-states`).
  - **Keyboard drag alternative** — the board is mouse-only drag-and-drop. Per
    `gesture-alternative`, add a keyboard path: focus a chip → "Move to…" menu or arrow-key
    move between groups. At minimum, a per-chip "Move ▾" select.
  - **Modal focus trap + restore** — trap Tab inside the dialog and return focus to the
    triggering control on close (`escape-routes`, `focus-management`).
  - **Tablist semantics** — app tabs use `role="tab"` but lack `aria-controls`/roving tabindex
    and arrow-key navigation.
  - **Live regions** — validation summary and the scorecard should be `aria-live="polite"` so
    screen readers hear "2 problems" / "all hard rules satisfied" after edits.

### 2.2 Touch & Interaction
- Toggles/buttons meet ~40–44px; **chip lock + row-delete hit areas are < 44px** — pad them
  (`touch-target-size`). Drag-and-drop has no touch equivalent on tablets (`hover-vs-tap`).
- **No drag affordance hint** until you grab — add a grip dot/handle on chips (`swipe-clarity`).

### 2.3 Performance
- Single-file means a large first paint (SheetJS ~ 950 KB + logo). Acceptable per the offline
  mandate, but: **don't recompute the whole board on every keystroke** — `renderResult`
  rebuilds all columns + re-runs `buildIndex`/`priorData` on each drop. Fine at 80 students;
  memoize `idx` per solve if the cohort grows (`reduce-reflows`).
- Logo is a 287 KB rasterized SVG; consider a smaller optimized mark.

### 2.4 Style
- Consistent now (no emoji, one green accent). **Board cards are flat** — a subtle elevation
  scale + a colored top-stripe per group would aid scanning (`elevation-consistent`).
- The scorecard reads as a metrics dump; restyle as **status cards** with plain-language
  sentences (see §3.4).

### 2.5 Layout & Responsive
- **Not yet responsive** — fixed paddings, the board and tables assume desktop. Define
  breakpoints (640 / 1024 / 1440); on narrow widths the transport should collapse into a
  "⋯ More" menu and the board scroll-snap one column at a time.
- The data table can exceed the viewport; it scrolls inside its wrapper (good) but needs a
  **sticky first column** (student name) so you don't lose context while scrolling columns.

### 2.6 Typography & Color
- Base is 16px / 1.6 with a green accent — solid. Missing a **formal type scale + spacing
  scale** as tokens (currently ad-hoc rem values). Define `--step-*` and `--space-*`.
- Add **tabular figures** for the scorecard/counts (partially done) and seat counts.

### 2.7 Forms & Feedback
- **Good:** live validation, inline pick-lists, in-app confirm, undo/redo.
- **Gaps:** errors are listed at the top, not anchored to the offending cell
  (`error-placement`, `error-summary` with jump links). No success toast after Export/Solve
  (`success-feedback`). No empty-state guidance on the Groups tab before the first solve.

### 2.8 Navigation
- Two tabs are clear. The **"Groups" tab vs the "Groups" data sheet** name collision is a real
  snag (see Open Questions). Consider a 3-step rail: **Roster → Build → Export**.

---

## 3. Redesign spec

### 3.1 Design tokens (formalize what exists)
```
Color    --bg #fff  --surface #f4f7f5  --ink #15201c  --muted #4d5a54  --line #d8e0dc
         --brand #0a7d4f  --brand-deep #024731  --accent #00734a  --accent-soft rgba(0,115,74,.08)
         --danger #c0392b  --warn #b8860b  (gold retired)
Type     scale 12 · 14 · 16(base) · 18 · 22 · 28 ; line-height 1.6 ; weights 400/600/700
Space    4 · 8 · 12 · 16 · 24 · 32 (8px rhythm)
Radius   6 (controls) · 8 (cards) · 12 (modal) · 999 (pills)
Elevation e1 cards · e2 popovers/board-hover · e3 modal
Motion   150–200ms ease-out; respect prefers-reduced-motion
```

### 3.2 Information architecture — a 3-step rail
Replace the 2 tabs with a labeled **stepper rail**: **① Roster → ② Build → ③ Export**, with a
persistent status chip ("✓ 80 students, no problems"). Forward is always one primary button.
This removes the Groups/Groups name clash and makes the path obvious.

### 3.3 Roster step
- A **summary header** card: counts per sheet + validation status; "Edit data" expands the
  grid (collapsed by default for calm).
- Grid gets a **sticky student-name column**, per-cell error highlight with a tooltip, and an
  **"N problems" banner with jump-to-cell links**.
- Sheet sub-tabs relabeled to plain titles (already: History). Consider "Group Slots" for the
  Groups sheet to remove the clash.

### 3.4 Build step (board + scorecard)
- **Scorecard as status cards**, plain language: "Hard rules: all satisfied ✓", "Imi Hoʻōla:
  14/14 groups clean", "Repeat groupmates: 3 pairs", each with a one-line explanation and the
  soft-weight slider inline.
- **Board cards**: group color stripe, tutor row, seat meter (`4/6`), chips with a grip handle,
  red state + tooltip on rule break, lock as a corner toggle. Add a **keyboard "Move to…"**
  control per chip.
- Empty state before first solve: "Pick a unit and press Solve."

### 3.5 Export step
- A short checklist of what's written (Results sheet, appended History) + the two buttons
  (Export workbook, Print/Save PDF), and a **success toast** after each.

### 3.6 Components to standardize
Button (primary/secondary/danger/icon), Pill/Tag, Card, Modal (focus-trapped), Toast,
Stepper, Select, Toggle, Slider, Chip, Board column. All from the tokens above.

---

## 4. Open questions (confirm with the operator — don't guess)
1. **Student "class" / cohort field.** Should `Students` carry a cohort/class-year (e.g.
   "Class of 2028")? Today the tool assumes one cohort per workbook and `Unit` (MD1–MD7) is the
   only time axis. If multiple classes live in one workbook, we'd add a `Cohort` column and
   filter the solver by it. **Recommendation:** add an optional `Cohort` column now (defaults to
   one class), surfaced as a pick-list — low cost, future-proofs multi-class use. *Needs sign-off
   — it changes the schema/spec §2.*
2. **Groups vs Groups naming.** Rename the data sheet's display label to "Group Slots", or the
   build tab to "Builder"?
3. **Schedule-fit model (spec §7.5).** Should `ImiGA` / `HOMEmgr` bind to time slots like
   `Exception:*` does, or stay informational (current behavior)?
4. **Hard-move policy (spec §7.4).** On a manual drag that breaks a hard rule: block it, or
   allow-with-red-flag (current)?
5. **History scope (spec §7.3).** Does repeat-avoidance span all of MD1–MD7, or reset at a
   boundary?

---

## 5. Suggested implementation order
1. **Tokens + a11y baseline** (focus rings, live regions, modal focus trap, hit areas) — low
   risk, high value.
2. **Roster polish** (summary card + collapse, sticky name column, jump-to-error).
3. **Build polish** (status-card scorecard, board affordances, keyboard move).
4. **Stepper rail** replacing the two tabs (do last; it reshuffles the shell).
5. **Responsive pass** + success toasts.

Each step keeps the pure data/solver layer and the headless tests untouched; all changes stay
within the single offline file.
