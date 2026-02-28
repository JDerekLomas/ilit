# Visual Comparison Report — 2026-03-01

## Summary
- Screens compared: 7 (Library, Notebook Closed, Notebook Open, Assignments, Connect, Review, Interactive Reader)
- Average fidelity: 6.5/10
- Critical gaps: 4
- Medium gaps: 8
- Minor gaps: 6

---

## Per-Screen Results

### 1. Library Carousel — 7/10
**Reference**: `docs/screenshots/ref-library-hd.png`
**Replica**: `docs/screenshots/current/library-main.png`

Gaps (by impact):
1. **[HIGH] No 3D depth in carousel** — Reference has books at different Z-depths (center book largest, sides recede with `translateZ`). Ours is a flat horizontal strip with all books the same size except a slight scale-up on center.
2. **[MED] Dark wooden bookshelf background missing** — Reference has a very dark, almost black background with subtle bookshelf/wood texture. Ours uses the constellation bg3.jpg showing through, which is colorful rather than dark.
3. **[MED] Book detail panel position** — Reference places the detail panel below the carousel with the selected book cover, stats, and "My Current Reading" button in a horizontal row. Ours matches this layout but the panel background is darker/different.
4. **[LOW] Filter button styling** — Reference has rounded pill buttons (All Titles, My Level, My Books, Recommended, Reviewed, Reserved) in a lighter row. Ours has similar buttons but styling differs slightly.
5. **[LOW] No left/right arrow dimming at carousel bounds**.

### 2. Notebook (Locked) — 5/10
**Reference**: `docs/screenshots/ref-notebook-closed.png`
**Replica**: `docs/screenshots/current/notebook.png` (shows open state — locked state not captured yet)

Gaps (by impact):
1. **[HIGH] Current screenshot shows open notebook, not locked state** — We recently added the locked cover with `note_book.png` and `finger_stamp.png`, but our latest screenshot predates that change. Need fresh screenshot to compare.
2. **[MED] Background** — Reference shows a very dark carbon-fiber/textured background behind the notebook. Ours uses the constellation gradient (bg3.jpg). The original uses `lading_page_bg.jpg` as the landing background.
3. **[LOW] Spiral binding style** — Reference has flat dark square spiral holes. Need to verify our current rendering matches.

### 3. Notebook (Journal Open) — 7/10
**Reference**: `docs/screenshots/ref-notebook-journal.png`
**Replica**: `docs/screenshots/current/notebook-journal.png`

Gaps (by impact):
1. **[MED] Spiral binding rendering** — Reference has 3D-looking dark rectangular spiral holes with shadows. Ours has lighter, rounder oval holes. The original uses image-based spiral binding, not CSS.
2. **[MED] Left sidebar styling** — Reference has a teal/cyan "Notes" header bar with close button (X), a dropdown for units, and entry list below. Ours has a simpler white sidebar with "Notes" header and "+" button.
3. **[MED] Toolbar styling** — Reference has a dark toolbar bar across the top of the content area with hamburger, delete (trash), and add (+) icons. Ours has the title and toolbar integrated into the top of the content area with a lighter style.
4. **[LOW] Tab sizing** — Reference tabs are wider and more prominent on the right edge. Ours are narrower. (We recently updated tab width to 47px, need fresh screenshot.)
5. **[LOW] Ruled line rendering** — Reference uses `pad_bg.png` repeating pattern for ruled lines. We implemented this but screenshot predates the change.

### 4. Assignments — 8/10
**Reference**: `docs/screenshots/assignments-all-expanded.png`
**Replica**: `docs/screenshots/current/assignments.png`

This is one of our closest matches.

Gaps (by impact):
1. **[MED] Constellation background** — Reference shows the constellation network pattern (pink-to-teal gradient with node/line network) behind the white card. Ours shows bg3.jpg which is the right idea but the constellation is less prominent since the card covers most of it. Actually quite close.
2. **[LOW] Header gradient** — Reference has a more pronounced pink-to-purple gradient header bar. Ours has a similar semi-transparent gradient. Close match.
3. **[LOW] Badge styling** — Reference uses filled red circles with white numbers. Ours uses outlined red/green circles. Minor difference but reference style is slightly bolder.
4. **[LOW] Bottom nav styling** — Reference has the active tab (Assignments) with a checkbox-style icon and white text. Ours matches well with the cyan underline indicator.

### 5. Connect Tab — 8/10
**Reference**: `docs/screenshots/ref-connect-tab.png`
**Replica**: `docs/screenshots/current/connect.png`

Very close match.

Gaps (by impact):
1. **[MED] Star graphic** — Reference uses a thin red-outlined star (`star_big_border.png`). Ours uses a thicker red-outlined star that's more stylized. Should swap in the actual `star_big_border.png` asset.
2. **[LOW] "Comments" header and Refresh button** — Reference has "Comments" with a circular refresh icon and "Refresh" label to the right. Ours has "Comments" with a smaller refresh icon. Close match.
3. **[LOW] Card positioning** — Reference card is positioned slightly higher and larger relative to the viewport. Ours is centered. Minor.

### 6. Review Tab — 8/10
**Reference**: `docs/screenshots/ref-review-tab.png`
**Replica**: `docs/screenshots/current/review.png`

Close match.

Gaps (by impact):
1. **[MED] Background** — Reference has a dark gray/charcoal background (separate from dashboard gradient). Ours shows the bg3.jpg constellation through a dark overlay. Different but both dark — acceptable.
2. **[LOW] "Done" button** — Reference has "Done" in top-left black header bar. Ours matches.
3. **[LOW] Card shadow** — Reference has a subtle drop shadow on the Book Review card. Ours has a similar shadow. Close.

### 7. Interactive Reader — 6/10
**Reference**: `docs/screenshots/interactive-reader-bombdogs-slide1.png`
**Replica**: `docs/screenshots/current/ir-bombdogs-slide1.png`

Gaps (by impact):
1. **[HIGH] Two-panel layout missing** — Reference slide 1 has TWO panels side by side: left panel (reading passage) and right panel (checkpoint/drag-drop activity). Ours shows only the reading passage in a single panel on the first slide, with checkpoints on separate slides.
2. **[HIGH] Background image** — Reference uses a photographic background (camouflage/military themed for Bomb Dogs). Ours also has a background image but it's different (AI-generated dog photo vs. the original military photo).
3. **[MED] Panel styling** — Reference panels have white backgrounds with subtle shadows and rounded corners. Ours has a single white panel with similar styling but different proportions.
4. **[MED] Dot navigation** — Reference has smaller, more subtle dots. Ours has larger dots. Reference also shows more dots (10 slides vs our fewer).
5. **[LOW] Header bar** — Both have "Bomb Dogs: Canine Heroes" with Save & Exit, accessibility icon, and audio controls. Close match.

---

## Priority Fix List (Ordered by Visual Impact)

### Critical (would make the biggest difference)
1. **Use `lading_page_bg.jpg` for notebook locked state background** — The dark textured background behind the closed notebook is distinctive. Currently showing constellation gradient.
2. **Swap Connect tab star to `star_big_border.png`** — Quick win, use the actual asset.
3. **Library: add dark background specific to library tab** — Use `carasual-bg.png` or darker treatment instead of showing bg3.jpg through.
4. **IR: Two-panel layout for checkpoint slides** — The side-by-side reading+checkpoint layout is a signature interaction. Currently we split these into separate slides.

### Medium (noticeable improvement)
5. **Notebook spiral binding** — Use image-based spiral holes instead of CSS ovals for more authentic look.
6. **Notebook sidebar** — Match the teal header bar with close button and unit dropdown from reference.
7. **Notebook toolbar** — Dark inset toolbar bar across top of content area (we recently added this, need to verify).
8. **Library carousel 3D depth** — Add `translateZ` and perspective to make center book pop forward.
9. **Assignment badge styling** — Use filled red circles instead of outlined.
10. **IR background images** — Source or generate closer-matching background photos for each passage.

### Low (polish)
11. Library filter button pill styling
12. Carousel arrow dimming at bounds
13. Tab sizing tweaks on notebook
14. Connect card positioning
15. Review tab background treatment
16. IR dot navigation sizing

---

## Screens Needing Fresh Screenshots

The notebook was recently rewritten with real Savvas assets (note_book.png, finger_stamp.png, pad_bg.png, spiral binding, dark toolbar). Current screenshots in `docs/screenshots/current/` predate this work and don't reflect the improvements. Need to re-screenshot:
- Notebook locked state (new feature)
- Notebook journal (updated styling)
- Notebook all tabs (updated tabs)

## Overall Assessment

The replica captures the **structure and flow** of every screen well. The biggest visual gaps are:
1. **Background treatments** — each original screen has a specific background (dark texture for notebook, bookshelf for library, constellation for dashboard) but we use bg3.jpg everywhere
2. **IR checkpoint layout** — side-by-side panels vs. separate slides
3. **Asset usage** — we have the original PNG/JPG assets but aren't using them all yet (star graphics, dark backgrounds)

The notebook rewrite (this session) addressed many notebook gaps. Connect, Review, and Assignments are already 8/10 fidelity. Library and IR have the most remaining work.
