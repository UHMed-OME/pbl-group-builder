# Scheduling — feature & UX assessment

Assessment of the clock-time + block-out scheduling feature (commit `d7f8dc9`) and concrete
suggestions to improve the operator experience. Method: walked the end-to-end flow against the
code (`groupsForUnit`, `scheduleFits`, `renderSchedule`, the Groups editor) and the passing
core/DOM tests; judged with fresh eyes against the ui-ux-pro-max heuristics.

## What works well
- **Right model.** Group `Day/Start/End` + per-`Subject` block-outs (role *or* unit) is the correct
  abstraction; the overlap rule in `scheduleFits` is simple and correct, and unit blocks cleanly
  generalize "a course meets then → nobody in that unit is free."
- **Calendar is direct.** Click an hourly Mon–Fri cell to block/unblock; keyboard-operable
  (role=button, Enter/Space); subjects grouped Roles vs Units. Round-trips via the `Blockouts` sheet.
- **Honest solving.** Schedule breaks are a hard rule surfaced in the scorecard; over-constrained
  cases are flagged, not fudged. Verified by role-block and unit-block tests.

## Issues & suggestions (prioritized)

| # | Severity | Issue | Suggested fix |
|---|----------|-------|---------------|
| 1 | 🟠 High | **The calendar is "blind" to groups.** When blocking a role/unit you can't see *where the unit's groups actually meet*, so you can't tell whether a block will collide with a group (or leave it fine). | Overlay this unit's group meeting times on the same grid (faint cell markers + a tutor/group label on hover). Pick the unit at the top of the Schedule tab. Turns guesswork into a visual. |
| 2 | 🟠 High | **Two disconnected places to set times.** Group times live in the Groups data grid (Day/Start/End dropdowns); block-outs live on the Schedule calendar. The operator mentally joins them. | At minimum, link them: show group times on the calendar (#1) and add a one-line hint. Longer term, allow placing/dragging a group's meeting block directly on the calendar. |
| 3 | 🟡 Med | **No sense of impact.** After blocking you must re-solve to learn the effect; a block that empties a group (lost seats) only shows up as violations later. | On the Schedule tab, show a live line per subject: "blocks N student(s) from M group(s)"; warn when a *unit* block disables a group whose seats are needed (capacity check). |
| 4 | 🟡 Med | **Block-out editing is click-per-cell.** A 3-hour course = 3 clicks; removing a multi-hour block is cell-by-cell. | Add **drag-to-paint** (mousedown→drag sets/clears a run) and a **"Clear all for this subject"** button. |
| 5 | 🟡 Med | **Hourly only.** Real PBL/courses are often 90 min (9:00–10:30); the grid and the Start/End dropdowns can't express half-hours. | Offer 30-min granularity (grid rows + `:30` options). Was an explicit choice — revisit if half-hours are common. |
| 6 | 🟢 Low | **Vestigial `Tutors.Availability`.** The old AM/PM column is now unused by the solver but still shown, which is confusing next to clock times. | Remove it, or repurpose as the tutor's own weekly availability (and have auto-built groups use it for times instead of being time-less). |
| 7 | 🟢 Low | **Schedule-break tooltip is generic.** A flagged chip says "Schedule fit … a block-out overlaps Group N"; it doesn't name the offending block (which subject/day/time). | Include the specific overlap in the detail ("MD2 course Wed 13:00–15:00"). |
| 8 | 🟢 Low | **Calendar keyboard nav is Tab-only.** Tabbing through 50 cells is tedious; no arrow-key movement within the grid. | Add roving arrow-key navigation across the day/hour grid. |
| 9 | 🟢 Low | **Discoverability + which subjects have blocks.** "Schedule" sits among the data sub-tabs; the subject dropdown doesn't indicate which roles/units already have block-outs. | Mark subjects that have blocks (e.g. a dot/count), and add a short "Schedule" intro line. |

## Recommended next step (quick, high-value)
Do **#1 (+#2 link)**, **#4 (drag + clear)**, and **#3 (impact/affected counts + capacity warning)** together —
they're the difference between "edit a grid and hope" and "see the schedule and its consequences."
#1 is the single biggest win: render the unit's group times under the block-out cells.

## Notes / verification
- Auto-built groups (no Groups rows) are **time-less**, so block-outs don't constrain them — a real gap
  if an operator relies on auto-build *and* scheduling. Resolving #6 (tutor availability → auto group
  times) would also close this.
- Tests cover the solver rules (role block, unit block, round-trip) and that the Schedule tab renders;
  the calendar *interaction* (click/drag, overlay) is only smoke-tested headlessly — needs a real-browser
  pass.
