# Original Savvas Asset Inventory

Assets extracted from the ClassView source code that should be used in our replica.
Status: **Copied** = in `public/images/`, **Available** = in `docs/` only.

---

## Dashboard Backgrounds

The original uses full-screen gradient backgrounds with constellation/network patterns. These rotate per section or are assigned to specific views.

| File | Description | Status | Use In |
|------|-------------|--------|--------|
| `bg1.jpg` | Cyan-to-magenta constellation network | Copied | Alternative dashboard bg |
| `bg2.jpg` | Pink-to-purple smooth gradient | Copied | Alternative dashboard bg |
| `bg3.jpg` | Dark magenta-to-teal constellation network | Copied | Dashboard layout background (active) |
| `bg4.jpg` | Yellow-teal halftone aircraft scene | Copied | Assignment detail |
| `bg5.jpg` | Purple-pink-cyan constellation | Copied | Alternative dashboard bg |
| `bg6.jpg` | Variant gradient | Copied | Alternative dashboard bg |
| `bg7.jpg` | Solid deep blue | Copied | Fallback |
| `bgnn.png` | Dark carbon-fiber texture pattern | Copied | Already in textures/ |

**Source**: `docs/classview/Webclient/App/media/bg*.jpg`
**Copy to**: `public/images/backgrounds/`
**Priority**: HIGH — the constellation gradients are the signature visual of the dashboard

---

## Notebook Assets

| File | Description | Status | Use In |
|------|-------------|--------|--------|
| `note_book.png` | Skeuomorphic spiral notebook cover (422x605) | Copied | Locked notebook cover |
| `finger_stamp.png` | Green fingerprint scanner (64x85) | Copied | Notebook unlock button |
| `pad_bg.png` | Ruled paper texture (tiny, repeating) | Copied | Journal/notes writing area |
| `notes_rgt_bg.png` | Sidebar edge shadow/gradient (repeating-y) | Copied | Left panel right edge |
| `heading_bg.png` | Subtle heading underline bar (repeating-x) | Copied | Section headings |
| `shadow_bg.png` | Top shadow gradient (repeating-x) | Copied | Content area top shadow |
| `top_bg.png` | Header bar gradient (repeating-x) | Copied | Notebook frame top |
| `lf_bg.png` | Left frame edge (repeating-y) | Copied | Notebook frame left |
| `rtf_bg.png` | Right frame edge (repeating-y) | Copied | Notebook frame right |
| `lading_page_bg.jpg` | Dark textured landing page background | Copied | Behind notebook cover |
| `date_event.jpg` | Timeline/calendar styling bg | Available | Timeline organizer |
| `organize-bg-images.jpg` | Scratched metal texture | Available | Graphic organizer bg |

**Source**: `docs/classview/Webclient/App/media/` and `docs/reference-source/media/`
**Priority**: DONE (core assets), MEDIUM (remaining)

---

## eBook Reader Assets

| File | Description | Status | Use In |
|------|-------------|--------|--------|
| `book_bg.jpg` | Warm wood texture for reader frame | Copied | Reader outer frame |
| `left_border.png` | Left wooden border strip (repeating-y) | Copied | Reader left edge |
| `right_border.png` | Right wooden border strip (repeating-y) | Copied | Reader right edge |
| `pageBottom.png` | Page bottom edge (repeating-x) | Copied | Reader page bottom |
| `pageBottomLeft.png` | Bottom-left corner piece | Copied | Reader corner |
| `pageBottomRight.png` | Bottom-right corner piece | Copied | Reader corner |
| `midlle_bg_ebook.png` | Middle content area bg | Available | Reader center split |
| `marker-pen.png` | Annotation pen icon | Available | Annotation toolbar |
| `screen-mask.png` | Screen mask graphic | Available | Accessibility feature |
| `book_rol.png` | Tiny ruled lines (repeating) | Available | Book notes area |
| `book_rol2.png` | Alternative ruled lines | Available | Book notes area |
| `activate_top_bg.png` | Top toolbar background | Available | Reader toolbar |

**Source**: `docs/classview/Webclient/App/ebookplayer/media/` and `docs/classview/Webclient/App/media/`
**Copy to**: `public/images/reader/`
**Priority**: HIGH — page frame corners would add authenticity

---

## Library Tab Assets

| File | Description | Status | Use In |
|------|-------------|--------|--------|
| `background-Library.jpg` | Sky blue gradient library background | Copied | Library tab background |
| `background-Library.png` | PNG version | Available | Library tab background |
| `carasual-bg.png` | Dark carousel container bg | Copied | Book carousel area |
| `nobook.jpg` | "No cover" placeholder | Copied | Missing book covers |
| `default_book_loader.gif` | Animated book loading spinner | Available | Book loading state |
| `main_page_book.png` | Decorative book graphic | Available | Library decoration |

**Source**: `docs/classview/Webclient/App/media/` and `docs/reference-source/media/`
**Copy to**: `public/images/library/`
**Priority**: MEDIUM — library background would help, but we have a working dark theme

---

## Star / Reward Assets

| File | Description | Status | Use In |
|------|-------------|--------|--------|
| `star_big_border.png` | Large red-outlined empty star (~240px) | Copied | Connect tab hero star |
| `star_big_fill.png` | Large yellow-filled star (~240px) | Copied | Connect tab earned star |
| `star-on.png` | Small filled star (~32px) | Copied | Star ratings, review |
| `star-off.png` | Small empty star (~32px) | Copied | Star ratings, review |
| `star.png` | Standard star icon | Available | General star usage |

**Source**: `docs/reference-source/media/`
**Priority**: HIGH — Connect tab and Review tab both need these

---

## Sprite Sheets (Icon Collections)

The original packs all toolbar/UI icons into sprite sheets. These contain checkmarks, arrows, play/pause, annotation tools, navigation icons, etc.

| File | Description | Retina | Source |
|------|-------------|--------|--------|
| `sprite.png` | Main icons (~500px wide) | `sprite_ratina.png` | App/media/ |
| `sprite2.png` | Secondary icons (~700x400) | `sprite2_ratina.png` | App/media/ |
| `sprite3.png` | Tertiary icons (~500x500) | `sprite3_ratina.png` | App/media/ |
| `sprite4_ratina.png` | Carousel arrows (retina only) | — | App/media/ |
| ebook `sprite.png` | eBook-specific icons | retina variants | ebookplayer/media/ |

**Priority**: LOW — we use SVG icons instead, but these are useful as visual reference for what icons exist

---

## Audio / Media Controls

| File | Description | Status | Use In |
|------|-------------|--------|--------|
| `microphone.png` | Mic icon (default state) | Available | Voice recording |
| `microphone-start.png` | Mic recording state | Available | Voice recording |
| `microphone-stop.png` | Mic stopped state | Available | Voice recording |
| `microphone-inactive.png` | Mic disabled state | Available | Voice recording |
| `speaker-on.png` | Speaker enabled | Available | Text-to-speech |
| `speaker-off.png` | Speaker muted | Available | Text-to-speech |
| `speaker-filled-audio-tool.png` | Filled speaker icon | Available | Audio toolbar |
| `play.png` / `pause.png` / `stop.png` | Playback controls | Available | Audio/video player |

**Source**: `docs/classview/Webclient/App/media/`
**Priority**: LOW — we'll use SVG equivalents, but useful as visual spec

---

## Misc UI Assets

| File | Description | Status | Use In |
|------|-------------|--------|--------|
| `ilit20-logo.png` | I-LIT 2.0 logo | Available | Reference only (don't use) |
| `help.png` | Help icon | Available | Help tooltips |
| `alert-icon.png` | Alert/warning icon | Available | Error states |
| `rubric-icon.png` / `rubric-btn.png` | Rubric grading UI | Available | My Work feedback |
| `organizer.png` / `organizer-new.png` | Graphic organizer icons | Available | Notebook organizers |
| `venn.png` / `venn@2x.png` | Venn diagram | Available | Notebook organizer |
| `performance_graph.jpg` | Performance chart screenshot | Available | Reference only |
| `grade.png` / `grade_inactive.png` | Grade indicator icons | Available | Assignments |
| `slide_back_bg.jpg` | Slide/IR background | Available | IR slides |
| `black_pattern.png` | Dark repeating pattern | Available | Overlay backgrounds |

---

## Recommended Copy Priority

### Done (copied 2026-03-01)
- All 7 constellation backgrounds (bg1-bg7.jpg) → `public/images/backgrounds/`
- Reader page frame corners (pageBottom*.png) → `public/images/reader/`
- Library background + carousel bg + nobook placeholder → `public/images/library/`
- Notebook landing page bg → `public/images/notebook/`
- Dashboard layout.tsx and assignments page.tsx updated to use bg3.jpg instead of Canvas/SVG

### Do When Implementing Feature
- Audio controls: when adding text-to-speech
- Annotation pen: when building highlight feature
- Screen mask: when building accessibility panel
- Graphic organizer assets: when building notebook organizers
- Rubric/grade assets: when building My Work feedback view
