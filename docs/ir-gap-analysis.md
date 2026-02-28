# Interactive Reader: Gap Analysis (Original vs. Replica)

**Date:** 2026-03-01
**Reference:** Savvas I-LIT ClassView (production.classviewapi.com)
**Replica:** ilit.vercel.app

---

## Executive Summary

The replica captures the core structure well — two-panel layout, slide navigation, checkpoint types, scoring logic. The biggest gaps are in **visual fidelity** (colors, borders, panel sizing), **assessment UX** (interaction feedback, timing, animations), and **missing features** (freeze/unfreeze progression, audio files, eraser tool).

### Priority Tiers

| Priority | Category | Count |
|----------|----------|-------|
| P0 - Critical | Assessment UX & logic | 6 |
| P1 - High | Visual fidelity | 8 |
| P2 - Medium | Features & polish | 5 |
| P3 - Low | Nice-to-have | 4 |

---

## P0 — Critical: Assessment UX & Logic

These affect correctness of the learning experience.

### 1. Freeze/Unfreeze Slide Progression
**Original:** Students cannot swipe past the current checkpoint until it's completed. A "freeze point" prevents skipping ahead. Previously completed slides can be revisited.
**Replica:** All slides are freely navigable via dots and arrows. Students can skip every checkpoint and jump to the summary.
**Impact:** Defeats the purpose of comprehension checks. Students can bypass all assessment.
**Fix:** Track highest-unlocked slide index. Disable forward navigation (arrows + dots) past the freeze point. Unfreeze on checkpoint completion.

### 2. Highlight Checkpoint: Missing Eraser Tool
**Original:** Three tools — Yellow marker, Red marker, Eraser. Eraser lets students undo highlights by clicking highlighted text. Tools are 39x39px buttons with active/disabled states.
**Replica:** Only Yellow and Red marker buttons. No eraser. Students can't undo a highlight except by re-clicking (toggle behavior, which differs from original).
**Impact:** Missing core interaction. Original uses explicit eraser mode, not toggle.
**Fix:** Add eraser button. When eraser is active, clicking a highlighted sentence removes the highlight. Match original tool button sizing (39x39px).

### 3. Highlight: Selection Model (Click vs. Tap-to-select)
**Original:** Each word/sentence is wrapped in `<span>` with sequential class. Tap to highlight with active color. Must select marker tool first. Eraser mode for removal.
**Replica:** Sentence-level click toggles highlight. Color is applied from active highlighter. No explicit select-then-apply flow.
**Impact:** Functional but different interaction model. Original is tool-based (select tool, then apply). Replica is direct-toggle.
**Fix:** Align to tool-based model: select color tool → click sentence to apply → select eraser → click to remove.

### 4. Drag-and-Drop: Actual Drag Interaction
**Original:** jQuery UI Draggable/Droppable. Student physically drags word tiles from bank to drop zone. Clone helper, snap-back on invalid drop. Drag state: dark teal bg (#35484C), white text.
**Replica:** Click-to-place model. Student clicks a word in the bank, it fills the drop zone. No actual dragging.
**Impact:** Fundamentally different interaction. Original builds motor skills and spatial understanding. Click-to-place is simpler but not equivalent.
**Fix:** Implement actual drag-and-drop with HTML5 Drag API or pointer events. Keep click-to-place as touch fallback. Show drag ghost with dark teal styling.

### 5. Checkpoint Feedback: Timing & Overlay
**Original:** On wrong answer: 5-second dark overlay loader, then retry prompt. On 2nd wrong: 3-second overlay, then reveal correct answer. Visual overlay prevents interaction during delay.
**Replica:** Has delays (2000ms first wrong, 3000ms second wrong) with black/30 overlay. Close but timing differs (5s vs 2s for first wrong).
**Impact:** Feedback pacing differs. Original gives more time for reflection.
**Fix:** Align timings: 5000ms for first wrong, 3000ms for second wrong. Match overlay opacity.

### 6. "Reading Checkpoint" Button Behavior
**Original:** Button appears at bottom of left panel on reading slides. Clicking it: (1) hides the button, (2) animates right panel in (opacity 0→1, left -200px→0), (3) reveals the checkpoint interaction. Button uses blue gradient (`#1c8ed5` → `#025e97`).
**Replica:** Button appears but is styled as indigo pill (`bg-indigo-700`). Click sets `showCheckpoint=true` which swaps the entire view to a CheckpointSlide component. No panel slide-in animation — it's a full slide replacement.
**Impact:** Different mental model. Original keeps reading text visible on left while checkpoint slides in on right. Replica replaces the reading slide entirely with a checkpoint slide.
**Fix:** On reading slides with attached checkpoints, keep the reading text visible and animate the checkpoint panel in from the right, overlapping or adjacent to the text panel. This is a significant architectural change.

---

## P1 — High: Visual Fidelity

These are visually noticeable differences that affect perceived quality.

### 7. Panel Borders
**Original:** 6px solid `rgba(0,0,0,0.3)` border on both panels. Right panel has `border-radius: 0 12px 12px 0` (right side rounded only). Left panel is 12px all corners.
**Replica:** No visible borders on panels. Uses `shadow-2xl` and `rounded-xl` for depth. Looks modern but doesn't match original's card-with-border feel.
**Fix:** Add 6px solid semi-transparent dark border to both panels. Match border-radius values.

### 8. Panel Background Colors
**Original:** Left panel: white `#fff`. Right panel: light gray `#f7f9f9`.
**Replica:** Both panels appear white. Right panel has slight gray in some states but not consistently.
**Fix:** Set right panel background to `#f7f9f9`.

### 9. Panel Dimensions
**Original:** Left: 550×515px. Right: 400×462px. Container: 1000px centered. Right panel has -12px left margin (overlaps left border).
**Replica:** Responsive with `md:max-w-[48%]`. Panels are sized by content/flex, not fixed dimensions.
**Impact:** Different proportions. Original has specific pixel sizing.
**Fix:** For desktop, use fixed widths closer to original (550px left, 400px right) with responsive fallback for smaller screens.

### 10. Top Bar / Header
**Original:** Dark semi-transparent bar (~52px). "Save & Exit" as dark pill button on left. Title centered. Accessibility icon + audio player on right. Audio has HTML5 `<audio>` element with scrubber, time display, volume.
**Replica:** Similar layout but uses indigo/teal colors instead of dark. Audio uses browser SpeechSynthesis (TTS) instead of real audio files. Time display shows estimated TTS duration.
**Impact:** TTS sounds robotic vs. real recorded audio. Visual styling differs.
**Fix:**
- Style: Match dark semi-transparent header bar
- Audio: Would need actual audio files (not available from CDN). TTS is acceptable fallback but should be noted.

### 11. Navigation Arrows
**Original:** White circles with border: `2.5px solid #fff`, `box-shadow: 0 0 15px #000`, `background: rgba(0,0,0,0.3)`, 45×45px. Dimmed state: `opacity: 0.5`.
**Replica:** White/90 background, shadow, slightly different sizing. Look similar but not matching.
**Fix:** Match exact CSS: border 2.5px white, box-shadow 15px black spread, rgba(0,0,0,0.3) background, 45px diameter.

### 12. Pagination Dots
**Original:** Small circles (9×9px), dark bg. Active: black with shadow. Inactive: gray #666. Border-radius 10px.
**Replica:** Larger dots with different colors: white (current, scale 150%), green (completed), white/40 (unviewed).
**Impact:** Different visual language. Our green-for-completed is arguably better UX but doesn't match original.
**Fix:** Align dot sizing and colors. Keep green-for-completed as an enhancement.

### 13. Button Styling (Blue Gradient)
**Original:** 3D gradient button: `linear-gradient(to bottom, #1c8ed5 0%, #79bde6 3%, #1c8ed5 5%, #1c8ed5 95%, #025e97 100%)` with inset shadows. Green variant for complete: `#48c05d → #007b14`. Gray for disabled.
**Replica:** Flat `bg-indigo-700` pills. Modern but doesn't match skeuomorphic original.
**Fix:** Create shared button component with 3D gradient matching original. Apply to "Reading Checkpoint", "Save and Continue", "Submit Summary", "Get Feedback" buttons.

### 14. Highlight Tool Colors
**Original:** Yellow: `#f4df76`. Red: `#f47676`. Applied to text: yellow `#ffff33`, red `#f5a9a9`. Tool buttons: 39×39px squares.
**Replica:** Yellow: `#f4df76` (matches). Red: `#f47676` (matches). Tool button styling differs (rounded with labels vs. square color blocks).
**Fix:** Match tool button appearance — 39×39px square color blocks without text labels, with active border state.

---

## P2 — Medium: Features & Polish

### 15. Slide Transition Animation
**Original:** Custom Swipe.js parallax engine. 1200ms transition. Horizontal slide with parallax depth effect on background images.
**Replica:** 3D slit rotate effect (rotateY 90°/-90°) with 1.2s duration. Perspective-based 3D flip.
**Impact:** Different visual feel. Replica's 3D flip is more dramatic. Original is horizontal parallax slide.
**Fix:** Consider switching to horizontal slide transition to match original. The 3D flip is flashy but not faithful.

### 16. Background Images Per Slide
**Original:** Each slide can have a different background image. Images are topic-relevant photography (dogs, military, training scenes). Full-bleed with textured overlay.
**Replica:** Uses a passage-level background image with per-slide brightness filter. Our bg images are AI-generated.
**Impact:** Visual quality differs. Original has curated stock photography per slide.
**Fix:** Accept AI-generated images as our content is different. Ensure per-slide bg switching works.

### 17. Summary: PKT API Feedback vs. Local Algorithm
**Original:** Submits to PKT API for automated scoring. Returns 13-segment color bar (red→green), sub-scores for redundancy, irrelevancy, copying, spelling.
**Replica:** Local keyword-matching algorithm. Checks for key concepts (substring match). Three-tier feedback (great/good/needs more).
**Impact:** Our feedback is much simpler. Original's API-based scoring is more sophisticated.
**Fix:** Our local algorithm is acceptable for the scope. Could enhance with more NLP-like checking later.

### 18. Summary: Email & Print Buttons
**Original:** Has email-to-self and print buttons for the summary.
**Replica:** Missing both.
**Fix:** Low priority but could add print button (window.print for summary panel).

### 19. State Persistence Across Sessions
**Original:** Full state restoration — visited slides, attempt data, highlight selections, text answers all restored on re-entry. 30-second auto-save.
**Replica:** Checkpoint scores and completion status persisted in localStorage. But no mid-passage state restoration — re-entering resets to slide 1 with no prior selections.
**Fix:** Save current slide index and per-slide interaction state to localStorage. Restore on re-entry.

---

## P3 — Low: Nice-to-Have

### 20. Audio Files vs. TTS
**Original:** Pre-recorded audio per slide with precise durations (e.g., 0:25, 0:37). HTML5 audio player with scrubber and volume.
**Replica:** Browser SpeechSynthesis at 0.9x rate. Calculated duration from word count (150 wpm). Custom progress bar.
**Fix:** TTS is a reasonable approximation. Real audio not available. Acceptable gap.

### 21. Accessibility: Screen Reader Announcements
**Original:** `readThis()` function announces actions: "Yellow highlighter selected", "Text highlighted", "Correct Answer", etc.
**Replica:** ARIA alert region exists but not used for interaction announcements.
**Fix:** Add live region announcements for tool selection, highlight application, answer feedback.

### 22. Right Panel: Question Header Bar
**Original:** `.edit_box_title` — light gray `#eeeeee` background, centered text, box-shadow separator.
**Replica:** Text heading without distinct header bar styling.
**Fix:** Add gray header bar with shadow to right panel.

### 23. Keyboard Navigation
**Original:** TAB between elements, CTRL+arrows for DnD, Enter/Space to activate. Full keyboard support.
**Replica:** Basic keyboard support (Enter/Space on buttons). No CTRL+arrow DnD keyboard control.
**Fix:** Add keyboard handlers for DnD and highlight interactions.

---

## What We Do BETTER Than Original

1. **Vocabulary popups** — Our tap-to-define with word parts breakdown, example sentences, and "Add to Word Bank" is richer than the original's basic dictionary.
2. **Summary feedback** — Immediate local feedback loop (no API delay). Key concepts listed upfront.
3. **Score display** — Real-time score in top bar during passage. Original shows scores only after completion.
4. **Mobile responsiveness** — Our layout adapts to mobile. Original is fixed-width desktop.
5. **Modern animations** — Framer Motion provides smoother, more polished micro-interactions.
6. **Green completion dots** — Our pagination dots show completed checkpoints in green. Better UX than original's plain dots.

---

## Implementation Difficulty Ranking

| Gap | Difficulty | Estimate |
|-----|-----------|----------|
| #1 Freeze/unfreeze | Medium | 2-3 hours |
| #2 Eraser tool | Easy | 30 min |
| #3 Highlight selection model | Medium | 1-2 hours |
| #4 Actual drag-and-drop | Hard | 3-4 hours |
| #5 Feedback timing | Easy | 15 min |
| #6 Reading checkpoint → panel slide-in | Hard | 3-4 hours (architectural) |
| #7 Panel borders | Easy | 15 min |
| #8 Panel backgrounds | Easy | 5 min |
| #9 Panel dimensions | Medium | 1 hour |
| #10 Header styling | Medium | 1 hour |
| #11 Nav arrows | Easy | 30 min |
| #12 Pagination dots | Easy | 30 min |
| #13 Button gradients | Medium | 1 hour |
| #14 Highlight tool colors | Easy | 30 min |
| #15 Slide transitions | Medium | 1-2 hours |
| #16 Per-slide backgrounds | Already works | — |
| #17 Summary PKT API | N/A (out of scope) | — |
| #18 Email/print | Easy | 30 min |
| #19 State persistence | Medium | 2-3 hours |
| #20 Audio files | N/A | — |
| #21 A11y announcements | Easy | 1 hour |
| #22 Question header bar | Easy | 15 min |
| #23 Keyboard nav | Medium | 2 hours |

---

## Recommended Implementation Order

### Phase 1: Assessment Logic (P0)
1. Freeze/unfreeze progression (#1)
2. Feedback timing alignment (#5)
3. Reading checkpoint panel slide-in (#6) — or simplified: keep as slide swap but add animation
4. Highlight eraser tool (#2)
5. Highlight selection model alignment (#3)

### Phase 2: Visual Alignment (P1)
6. Panel borders and backgrounds (#7, #8)
7. Panel dimensions (#9)
8. Button gradient styling (#13)
9. Header styling (#10)
10. Navigation arrows (#11)
11. Pagination dots (#12)
12. Highlight tool styling (#14)

### Phase 3: Features & Polish (P2-P3)
13. Slide transition change (#15)
14. State persistence (#19)
15. A11y announcements (#21)
16. Question header bar (#22)
17. Keyboard navigation (#23)
