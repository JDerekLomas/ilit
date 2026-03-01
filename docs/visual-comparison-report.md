# Visual Comparison Report — March 2026

## Summary
- Screens compared: 13 (5 dashboard tabs + 5 notebook sub-tabs + IR reading/checkpoint/summary + eBook reader)
- Average fidelity: 7.2/10
- Critical gaps: 4
- Major gaps: 6
- Minor gaps: 8

---

## Per-Screen Results

### Library — 7/10
**Reference**: `docs/screenshots/ref-library.png`
**Replica**: `docs/screenshots/current/library-main.png`

The overall structure is very close: 3D carousel on top, book detail panel below with "Read Aloud Think Aloud" and "My Current Reading" buttons, progress stats in the center.

Gaps:
1. **[MED] Wooden shelf texture missing** — Reference has a wooden bookshelf/shelf surface that books sit on. Our carousel floats books in space against the dark background.
2. **[MED] Book covers are SVG-generated, not original art** — Reference shows actual publisher cover art (photos, illustrations). Ours are text-on-gradient SVGs. This is expected/intentional but visually distinct.
3. **[LOW] Carousel shows too many books** — Reference shows ~8 visible books with 3D perspective. Ours shows ~15-20 visible at once, making each cover smaller.
4. **[LOW] Genre filter bar** — Replica has an extra row of genre filter buttons (Fiction, Adventure, Action, etc.) that the reference doesn't show. Adds visual clutter.
5. **[LOW] "1493 of 1493 titles" counter** — Reference doesn't have this counter. Minor.

### Assignments — 8/10
**Reference**: `docs/screenshots/ref-assignments.png`
**Replica**: `docs/screenshots/current/assignments.png`

Very close match. Same 7 categories, same card layout, same background gradient.

Gaps:
1. **[MED] Badge numbers are different sizes** — Reference uses smaller, more compact red/green circle badges. Ours are slightly larger and all red (no green for Writing=0 which should be green for "complete").
2. **[LOW] Expand chevrons** — Replica has small > chevrons before each category name. Reference doesn't have these.
3. **[LOW] Header gradient** — Replica header is a purple-to-blue gradient bar; reference has a simpler dark band with "Assignments" text.
4. **[LOW] Background gradient direction** — Slightly different pink-to-teal gradient angle, but overall feel is the same.

### Connect — 6/10
**Reference**: `docs/screenshots/ref-connect.png`
**Replica**: `docs/screenshots/current/connect.png`

Structure matches (left comments panel, right star display). But the visual content diverges.

Gaps:
1. **[HIGH] Star style mismatch** — Reference has a large outlined (stroke-only) red/orange star. Replica has a large filled gold/yellow star. Different visual language.
2. **[MED] Pre-populated fake data** — Reference shows "0 stars" empty state. Our replica shows "17 stars" with a populated comments feed (fake demo data). Not a code gap per se, but the default state should probably match the reference's empty state.
3. **[LOW] Refresh button style** — Reference has a bordered "Refresh" button with icon. Ours has a green circle refresh icon.

### Review — 8/10
**Reference**: (original shows "Book Review" gold header modal, "No books available for review", Done button)
**Replica**: `docs/screenshots/current/review.png`

Close match. Replica has a richer review form (star rating, sentiment dropdown, text area, submit button) while the reference just shows the empty state. Our version is actually more feature-complete.

Gaps:
1. **[LOW] Background** — Reference shows the review modal over the constellation gradient background. Replica shows it over a plain dark background.
2. **[LOW] Our replica always shows the review form** — Reference shows "No books available for review" when empty. We always show the form, which is a design choice.

### Notebook — Journal — 7/10
**Reference**: `docs/screenshots/ref-notebook-journal-fresh.png`
**Replica**: `docs/screenshots/current/notebook-journal.png`

Good structural match after the lined-paper fix. Both show: left sidebar with date-stamped entries, spiral binding, right-edge colored tabs, top toolbar, Title + text area.

Gaps:
1. **[MED] Spiral binding only shows halfway down** — Replica's spiral rings stop about 40% of the way down the page. Reference shows full-height spirals from top to bottom.
2. **[MED] Sidebar background** — Reference sidebar has a plain white background. Replica sidebar has a light blue/gray tinted background.
3. **[LOW] Tab label rendering** — Reference has vertical text labels (Journal, Word Bank, Class Notes, My Work, Resources) with distinct background colors. Replica has the same tabs but they appear slightly narrower/shorter.
4. **[LOW] Unit dropdown** — Replica has an "All Units" dropdown filter in the sidebar. Reference has a simple dropdown arrow but it's less prominent.
5. **[LOW] Toolbar icons** — Reference has hamburger, delete, add-new icons in a dark top bar. Replica has similar icons but positioned slightly differently.

### Notebook — Word Bank — 6/10
**Reference**: `docs/screenshots/ref-notebook-wordbank.png`
**Replica**: `docs/screenshots/current/notebook-wordbank.png`

Biggest divergence among notebook tabs.

Gaps:
1. **[HIGH] Layout completely different** — Reference shows a blank white page with just a "+" button (same layout as other notebook tabs — sidebar + content). Replica shows a dedicated "My Words" header bar with an "+ Add Word" button and a centered empty-state message. The replica has its own distinct UI rather than matching the notebook metaphor.
2. **[MED] No sidebar** — Reference Word Bank has the same Notes sidebar as Journal. Replica has no sidebar, just the My Words header + content area.
3. **[LOW] Spiral binding truncated** — Same issue as Journal.

### Notebook — Class Notes — 8/10
**Reference**: `docs/screenshots/ref-notebook-classnotes-fresh.png`
**Replica**: `docs/screenshots/current/notebook-classnotes.png`

Good match after the sidebar addition. Both show: "Saved Notes" header (pink/red), sidebar, Title + text area, toolbar icons.

Gaps:
1. **[MED] Header color** — Reference has a salmon/pink "Saved Notes" header. Replica has a red "Saved Notes" header. Close but not exact.
2. **[LOW] Placeholder text** — Replica has "Take notes during class..." placeholder. Reference has "Insert Title Here" for the title field but no visible body placeholder.
3. **[LOW] Spiral binding truncated** — Same issue.

### Notebook — My Work — 7/10
**Reference**: `docs/screenshots/ref-notebook-mywork.png`
**Replica**: `docs/screenshots/current/notebook-mywork.png`

Good structural match with the expandable units sidebar. Both show: Units 1-5+ in sidebar, expandable sub-sections (Lessons, Benchmark Assessment(s), Weekly Reading Check(s)), content area with assignment titles and scores.

Gaps:
1. **[MED] Content area header style** — Reference shows "Unit 1 Lessons 1-5" as a heading. Replica shows "Unit 1 Lessons" as a heading. Different grouping label.
2. **[MED] Sidebar doesn't expand fully** — Reference shows expanded Unit 1 with all three sub-sections visible. Replica shows the same structure but the sub-section buttons look like small pills rather than full-width text items.
3. **[LOW] Score format** — Reference shows "29 / 36" with a "View Feedback" button. Replica shows "29/36" with "View Feedback" link. Close.
4. **[LOW] External link icons** — Both have external link icons, but styled slightly differently.

### Notebook — Resources — 7/10
**Reference**: `docs/screenshots/ref-notebook-resources.png`
**Replica**: `docs/screenshots/current/notebook-resources.png`

Good match. Both have a left sidebar tree with categories (Lesson Screens > Vocabulary, Skills Practice > Reading Comprehension, Vocabulary, Writing, etc.) and a right content panel.

Gaps:
1. **[MED] Sidebar header color** — Reference shows a red "Resources" header. Replica matches with a goldenrod shade.
2. **[LOW] Tree depth/structure** — Reference shows categories like Writing, Spelling, Grammar, Phonics, Whole Group Instruction. Replica has the same categories. Close match.
3. **[LOW] Content items** — Both show "Unit 1, Lessons 1-5" with vocabulary items. Close match.

### Interactive Reader — Reading Slide — 8/10
**Reference**: `docs/screenshots/ref-ir-reading.png`
**Replica**: `docs/screenshots/current/ir-reading.png`

Strong match. Both show: left panel with passage text in a white card, dark background with passage-specific imagery, vocab words highlighted, top bar with title/audio/nav.

Gaps:
1. **[MED] Background images** — Reference has actual Savvas photos. Replica uses AI-generated art (German Shepherd painting). Expected difference but visually distinct.
2. **[LOW] Text panel width** — Replica text panel is slightly narrower, showing more background. Reference panel takes up about 50% of width.
3. **[LOW] Vocab highlight style** — Reference uses blue underline for vocab. Replica uses teal/dotted underline.

### Interactive Reader — Highlight Checkpoint — 8/10
**Reference**: `docs/screenshots/ref-ir-checkpoint.png`
**Replica**: `docs/screenshots/current/ir-checkpoint.png`

Good match. Both show: left reading panel + right checkpoint panel, topic heading, highlighting tools at bottom.

Gaps:
1. **[MED] Checkpoint panel styling** — Reference has a white panel with darker border. Replica matches but the border treatment is slightly different (thicker rounded border).
2. **[LOW] Highlighter tools bar** — Both show colored highlighter buttons at the bottom. Same functionality, minor style differences.
3. **[LOW] Slide dots** — Reference has numbered slide dots at bottom. Replica has similar dot navigation.

### Interactive Reader — Summary Slide — 8/10
**Reference**: `docs/screenshots/ref-ir-reading.png` (shows summary with rubric)
**Replica**: `docs/screenshots/current/ir-summary.png`

Very close match. Both show: left writing panel with textarea + "Get Feedback"/"Submit Summary" buttons, right panel with Instruction/Feedback tabs, rubric score bars.

Gaps:
1. **[LOW] Button styling** — Reference has blue gradient buttons. Replica has purple (#3f3f8f) buttons.
2. **[LOW] Instruction tab content** — Both have bullet-pointed writing tips. Same content, minor formatting differences.

### eBook Reader — 6/10
**Reference**: `docs/screenshots/ref-ebook-reader.png`
**Replica**: `docs/screenshots/current/ebook-reader.png`

Functional match with significant visual differences.

Gaps:
1. **[HIGH] No wooden texture frame** — Reference has a wooden texture border surrounding the book pages. Replica has a plain cream/off-white background with no wood texture.
2. **[HIGH] No cyan/blue border** — Reference has a thick cyan border inside the wooden frame. Replica has no colored border around the reading area.
3. **[MED] Two-page spread feel** — Reference shows a clear two-page spread with a visible center gutter. Replica shows text in two columns but without the distinct "book spread" feel.
4. **[MED] Toolbar layout** — Reference toolbar has: Back, TOC, Title, then tools on the right (Accessibility, Mask, Pen, Aa, Translate). Replica has a different icon order.
5. **[LOW] Page slider** — Reference has a page slider at the bottom left ("1-2"). Replica has a centered bottom page indicator.
6. **[LOW] Cover page rendering** — Reference shows the actual book cover image on the first page. Replica goes straight to Chapter 1 text.

---

## Priority Fix List (by visual impact)

### Critical (would significantly improve demo quality)
1. **eBook reader: wooden texture frame + cyan border** — The single most visually distinctive element of the I-LIT reader. Without it, our reader looks like a plain webpage.
2. **Word Bank: match notebook metaphor** — Should use the same sidebar + content layout as Journal/Class Notes/My Work, not a custom header/card UI.
3. **Connect: star should be outlined, not filled** — Simple CSS change from filled gold to stroke-only red/orange.
4. **Notebook spiral binding: full height** — Spirals should extend the full height of the notebook, not stop partway.

### Major (noticeable improvement)
5. **Library: wooden shelf surface** — Add a wooden shelf texture that the book carousel sits on.
6. **eBook reader: visible center gutter** — Add a subtle line/shadow between left and right pages.
7. **Assignments: badge colors** — Writing (0 items) should show green badge. Match green=complete / red=pending.
8. **Notebook sidebar tint** — Journal sidebar should be white, not blue-tinted.
9. **eBook reader: cover page** — First pages should show the book cover image.
10. **IR background images** — 4 of 7 passages still lack background images.

### Minor (polish)
11. Carousel book count — Show fewer visible books for more focused 3D effect.
12. Genre filter bar — Consider hiding or moving to reduce clutter.
13. Chevrons on assignment categories — Remove the > arrows.
14. Connect refresh button — Match the bordered button style.
15. Tab label sizing on notebook — Slightly wider colored tabs.
16. IR vocab highlight color — Change from teal to blue.
17. Summary button color — Change from purple to blue gradient.
18. eBook toolbar icon order — Reorder to match reference.

---

## Screen-by-Screen Fidelity Scores

| Screen | Score | Key Issue |
|--------|-------|-----------|
| Library | 7/10 | Missing wooden shelf texture |
| Assignments | 8/10 | Badge color logic (green vs red) |
| Connect | 6/10 | Star style (filled vs outlined) |
| Review | 8/10 | Minor background difference |
| Notebook Journal | 7/10 | Spiral binding truncated, sidebar tint |
| Notebook Word Bank | 6/10 | Completely different layout |
| Notebook Class Notes | 8/10 | Header color shade |
| Notebook My Work | 7/10 | Sidebar sub-section styling |
| Notebook Resources | 7/10 | Close match |
| IR Reading | 8/10 | Background image (expected) |
| IR Checkpoint | 8/10 | Close match |
| IR Summary | 8/10 | Close match |
| eBook Reader | 6/10 | Missing wooden frame + cyan border |
| **Average** | **7.2/10** | |
