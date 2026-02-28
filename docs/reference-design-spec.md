# Savvas I-LIT — Complete Design Specification

Extracted from the production Savvas I-LIT student app (`production.classviewapi.com`) on 2026-02-28 via Chrome DevTools. This document contains every visual detail needed to build a pixel-accurate replica.

**Source files**: `docs/reference-source/` (HTML, CSS, JS, media)
**Screenshots**: `docs/screenshots/` (reference and comparison images)

---

## Color Palette

### Global
| Token | Value | Usage |
|-------|-------|-------|
| Nav bar gradient top | `#404246` | Footer nav background start |
| Nav bar gradient bottom | `#28292b` | Footer nav background end |
| Nav bar border | `#545659` | Top border on footer |
| Nav active bg | `#17191a` | Active tab background |
| Nav text | `#cccccc` | Inactive tab text |
| Nav active text | `#ffffff` | Active tab text |
| Primary blue | `#1c8ed5` | Primary action buttons |
| Action purple | `#3444ad` | "button7" class actions |
| Page background | `#dcdcdc` | Default body bg (light gray) |
| Body text | `#4e4e4e` | Default text color |

### Assignments Tab (7 category gradients)
| Category | Gradient | Usage |
|----------|----------|-------|
| Interactive Reading | `linear-gradient(#208eb7, #0b79a2)` | Teal |
| Study Plan | `linear-gradient(#2d6183, #194b6c)` | Dark blue |
| Vocab/Word Study | `linear-gradient(#772778, #4d104e)` | Purple |
| iPractice | `linear-gradient(#c21661, #ae024e)` | Magenta |
| Writing | `linear-gradient(#f65244, #e33e30)` | Red |
| Monitor Progress | `linear-gradient(#f89317, #e27e03)` | Orange |
| Information | `linear-gradient(#f5c919, #e0b305)` | Yellow |

### Assignments Accents
| Token | Value | Usage |
|-------|-------|-------|
| Title header | `radial-gradient(ellipse at center, #b97311 1%, #b97311 44%, #b45105 100%)` | "Assignments" header bar |
| Badge red | `red` (border + text) | Pending count badge |
| Badge green | `green` (border + text) | Complete count badge |
| Chevron | `#b1b1b1` | Expand/collapse arrow |

### Notebook Tab Colors
| Tab | Background | CSS Class |
|-----|-----------|-----------|
| Journal | `#0b89b7` | `.journal` |
| Word Bank | `#1a5479` | `.WordBank` |
| Class Notes | `#fc4333` | `.ClassNotes` |
| My Work | `#fd8d00` | `.my_work` |
| Resources | `#fcbb02` | `.resources` |

### Book Review
| Token | Value | Usage |
|-------|-------|-------|
| Header bg | `#e8a922` (golden amber) | "Book Review" title bar |
| Overlay bg | `rgba(0,0,0,0.6)` | Dark overlay behind modal |

---

## Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Global base | Helvetica, Arial, sans-serif | 21px | 400 | `#4e4e4e` |
| Nav button labels | Helvetica | 13px | 400 | `#cccccc` / `#fff` active |
| Library filter buttons | Helvetica | 15px | 400 | `#fff` / dark on active |
| Library book title | Helvetica | 32px | 700 | `#ffffff` |
| Library book author | Helvetica | 13px | 400 | `#ffffff` |
| Library stats | Helvetica | 15px | 400 | `#ffffff` |
| Notebook title input | Helvetica | 18px | 400 | dark |
| Notebook textarea | Helvetica | 16px | 400 (line-height: 26px) | dark |
| Assignment category name | Helvetica | ~18px | 600 | `#ffffff` |
| Assignment count badge | Helvetica | ~12px | 700 | red/green |

---

## Global Shell

### Bottom Navigation Bar
- **Position**: Fixed bottom, full width
- **Height**: ~51px
- **Background**: `linear-gradient(to bottom, #404246 1%, #28292b 100%)`
- **Border**: `1px solid #545659` on top
- **5 buttons**: Review (eye), Library (book), Notebook (notepad), Assignments (checkbox), Connect (star)
- **Button width**: 85px each
- **Button style**: Icon (from sprite.png) above label text
- **Active state**: `background-color: #17191a; color: #fff; box-shadow: 0px 5px 5px 0px #000 inset;`
- **Inactive state**: `color: #cccccc; background: transparent`
- **Overflow menu**: "..." button on far right
- **Class switcher**: Dropdown button on far right

### Background Pattern
- Dashboard views use a gradient background image (`bgnn.png` tiled) — NOT a CSS gradient
- The pink-to-teal constellation pattern on Connect/Assignments is baked into `bg3.jpg` and per-tab `tab_bg1.jpg` through `tab_bg7.jpg`
- Dark gray background (`#dcdcdc`) is fallback

### Icons
- All icons are in `sprite.png` (64KB) — CSS sprite sheet
- Notebook uses additional `sprite3.png` (26KB) for tab label images
- Icon positions defined by `background-position` in CSS

---

## 1. Library Tab

**Reference**: `docs/screenshots/ref-library-loaded.png`, `docs/screenshots/library-main.png`
**Source**: `library.html`, `css/library.css`, `css/library_dev.css`, `js/libraryview.js`

### Page Background
- `background: url(../media/bgnn.png) repeat` — tiled dark texture
- Behind carousel: `url(../media/book_bg.jpg)` — bookshelf wood texture

### Top Filter Bar
- **Layout**: Horizontal bar across top, inside iframe
- **Left group** (segmented buttons): "All Titles" | "My Level" | "My Books"
- **Right group**: "Recommended" | "Reviewed" | "Reserved"
- **Far left**: Grid/list view toggle icon
- **Far right**: Search magnifying glass icon
- **Active button**: `background: rgb(255, 255, 255)` (white fill), dark text
- **Inactive button**: Transparent background, `color: rgb(255, 255, 255)` (white text)
- **Font**: 15px Helvetica
- **Skip link**: "Skip to main content" at top left

### Book Carousel (3D)
- **Container**: `id="mainCarouselArea"`, `width: 1280px`, `height: ~705px`
- **52 book items** in this grade level
- **3D perspective transforms** defined in `css/library.3dflow.css` + `js/ilit_book_shelf_rounder.js`
- **Selected book**: Centered, enlarged, popped forward
- **Adjacent books**: Tilt away at perspective angles
- **Touch/swipe**: Handled by `swipe.js` (33KB)
- **Book covers**: Loaded from CloudFront CDN: `https://d3etodn1cqduev.cloudfront.net/content/ilit/ilit45ica/curriculum/g4/media/{hash}_cover_image.jpeg`

### Selected Book Detail
- **Title**: 32px bold white, centered below carousel
- **Author**: 13px white, centered below title
- **Detail pane**: `width: 903px`, `height: 256px`, `display: flex`
  - **Left card**: "Read Aloud Think Aloud" — book cover + label
  - **Center card**: Progress stats (dark bg):
    - Total Words: 8,818
    - Total Pages: 33
    - Total Books: -
    - IR Lexile Level: 900
    - All stats: 15px white Helvetica
  - **Right card**: "My Current Reading" — book cover + label (launches eBook reader)
- **Border images**: `left_border.png`, `right_border.png`, `top_bg.png` create a decorative frame around the detail pane

---

## 2. Assignments Tab

**Reference**: `docs/screenshots/assignments-all-expanded.png`
**Source**: `assignment.html`, `css/assignments.css`, `css/assignments_dev.css`, `js/assignments.js`

### Page Background
- Uses `bg3.jpg` — the pink-to-teal gradient with constellation/network pattern (509KB JPEG)
- The constellation pattern is NOT CSS — it's baked into the background image

### Title Header
- **"Assignments"** text in a rounded card
- **Background**: `radial-gradient(ellipse at center, #b97311 1%, #b97311 44%, #b45105 100%)` — amber/bronze gradient
- **Border**: Dashed border around card
- **Border radius**: 8px

### Category Accordion
- **Container**: White background, rounded corners (8px)
- **7 categories**, each with:
  - **Color-coded left gradient bar** (tabs1-tabs7, see colors above)
  - **Category name**: Bold white text on gradient
  - **Count badge**: Circular, 22x22px
    - Red: `color: red; border: 2px solid red` (pending items)
    - Green: `color: green; border: 2px solid green` (all complete)
  - **Chevron**: `>` arrow, `color: #b1b1b1`, rotates on expand
- **Expanded state**: Items listed below category header
  - Each item is a clickable row with title text
  - Clicking launches the relevant experience (IR, iPractice, etc.)

### Animation
- **3D slit animation** for modals/transitions:
  ```css
  @keyframes slit {
    50% { transform: translateZ(-250px) rotateY(89deg); opacity: 1; }
    100% { transform: translateZ(0) rotateY(0deg); opacity: 1; }
  }
  ```

### Categories Content
1. **Interactive Reading** (7): Bomb Dogs, Turn It Down!, Newspapers for Students, Ready or Not, Safer Energy, Hidden Ads, Apps for Health
2. **Study Plan** (1)
3. **Vocabulary, Word Study, and Reading Comprehension** (5): Long Vowels CVCe, Word Slam, Phonics: Words with oa and ow, Phonics Reader: Hobby Talk, Word Slam
4. **iPractice** (8): Plan a Multimedia Presentation, Write a Poem, Elements of Drama, Gather Information from Sources, Rubric for a Multimedia Presentation, Characteristics of Poetry, Figurative Language, Rubric for Presenting a Poem
5. **Writing** (0) — green badge
6. **Monitor Progress** (2): GRADE Level A — Middle of the Year, Reading Check 7
7. **Information** (2): Learning Objectives Unit 3 Week 1, Learning Objectives Unit 5 Week 1

---

## 3. Notebook Tab

**Reference**: `docs/screenshots/ref-notebook-closed.png`, `ref-notebook-journal.png`, `ref-notebook-wordbank.png`, `ref-notebook-classnotes.png`, `ref-notebook-mywork.png`, `ref-notebook-resources.png`
**Source**: `notebook.html`, `css/notebook.css`, `css/notebook_dev.css`

### Closed State (Fingerprint Scanner)
- **Background**: Dark gray/charcoal
- **Notebook cover**: `url(../media/note_book.png)` — 189KB PNG image
- **Spiral binding**: Visible on right edge (part of cover image)
- **Fingerprint button**: `url(../media/finger_stamp.png)` — 11KB PNG, centered on cover
- **Text**: "NOTEBOOK" in small caps below fingerprint
- **Animation on open**: 3D slit animation (`.7s ease-out`):
  ```css
  @keyframes slit {
    50% { transform: translateZ(-250px) rotateY(89deg); }
    100% { transform: translateZ(0) rotateY(0deg); }
  }
  ```

### Open State — General Layout
- **Full viewport**: 1280x~794px
- **Outer container bg**: `rgb(107, 106, 104)` — warm gray
- **Spiral binding**: `url(../media/notes_rgt_bg.png)` repeating vertically on right side of sidebar
  - This is a PNG image of spiral rings, NOT CSS shapes
  - Width of spiral area: ~60px (sidebar padding-right)
- **Ruled lines**: `url(../media/pad_bg.png)` repeating on content area
  - Lines spaced at 26px intervals (matching textarea `line-height: 26px`)
- **White content area**: Main writing/display area

### Left Sidebar
- **Width**: ~248px (including 60px spiral padding)
- **Background**: Uses `notes_rgt_bg.png` repeat-y on right edge
- **Header bar**: Color matches active tab
  - Journal: teal/cyan `#0b89b7`
  - Word Bank: dark navy `#1a5479`
  - Class Notes: red `#fc4333`
  - My Work: orange `#fd8d00`
  - Resources: gold `#fcbb02`
- **Close button**: X icon in header bar top-left
- **Content**: Varies per tab (entry list, unit tree, resource tree)

### Right Tab Strip
- **Position**: Absolute, right edge of notebook, outside main area
- **Tab width**: 47px, positioned `right: -47px` from notebook edge
- **5 tabs** stacked vertically with colored backgrounds
- **Tab labels**: Sprite images (vertical text), HTML text hidden via `text-indent: -999em`
- **Active tab**: Has pointer/arrow indicator pointing left into content area
- **Tab sizes**:
  - Journal: 68px tall
  - Word Bank: 100px tall
  - Class Notes: ~95px tall
  - My Work: ~68px tall
  - Resources: ~80px tall

### Top Toolbar
- **Dark gray bar** across top of content area
- **Buttons** (right side): Hamburger/organize, Delete (trash), Add new (+)
- **Button style**: Icon-based from sprite sheet

### Journal Tab
- **Sidebar header**: "Notes" on teal bg
- **Unit dropdown**: Selectable (e.g., "Unit 4")
- **Entry list**: Date-stamped entries (e.g., "02/28 Because of Winn-Dix..")
- **Active entry**: Highlighted in link color
- **Main area**:
  - "Title:" label + text input (18px, Helvetica, border: none)
  - Large textarea (16px, line-height: 26px, transparent bg over ruled lines)
  - Content persists per journal entry

### Word Bank Tab
- **Sidebar header**: "Notes" on dark navy bg
- **Empty state**: Blank sidebar
- **Main area**: Empty with "+" add button in toolbar
- **Populated state**: List of vocabulary words collected during reading

### Class Notes Tab
- **Sidebar header**: "Saved Notes" on red bg
- **Toolbar**: Organize button + Add new button
- **Main area**: Title field + text area (same layout as Journal)

### My Work Tab
- **Sidebar header**: "My Work" on orange bg
- **Sidebar content**: Units 1-7 accordion
  - Each unit expands to show: "Lessons 1-5", "Benchmark Assessment(s)", "Weekly Reading Check(s)"
  - Active item highlighted in link color (e.g., "Lessons 1-5" in orange)
- **Main area**: Unit + lesson header (bold, ~24px)
  - Assignment rows with:
    - Title text (e.g., "A Quiet Hero: The Story of Barbara Johns")
    - "View Feedback" button (dark blue pill, white text)
    - Score display (e.g., "29 / 36")
    - External link arrow icon

### Resources Tab
- **Sidebar header**: "Resources" on gold bg
- **Sidebar tree structure**:
  - "Lesson Screens" (expandable, active = orange text)
    - "Vocabulary" (expandable, active = orange text)
      - "Unit 1, Lessons 1 - 5"
      - "Unit 2, Lessons 1 - 5" ... through "Unit 2, Lessons 46 - 50"
      - "Unit 3, Lessons 1 - 5" etc.
    - "Whole Group Instruction"
  - "Routine Cards"
  - "Book Club"
  - "Standards"
- **Main area**: Resource list with external link (arrow) icons
  - e.g., "2.4.18 Vocabulary 1", "2.4.18 Vocabulary 2", etc.
  - Numbered by unit.lesson.item format

---

## 4. Connect Tab

**Reference**: `docs/screenshots/ref-connect-tab.png`, `docs/screenshots/connect-tab.png`

### Layout
- **Background**: Pink-to-teal gradient with constellation pattern (from `bg3.jpg` or similar)
- **White card**: Centered, ~60% viewport width
- **"Comments" header**: Bold, top-left of card
- **Refresh button**: Circular arrow icon, next to header
- **Star graphic**: Large outlined red/orange star, centered in card (~120px)
- **Text**: "You have **0** stars !!!" — "0" is bold
- **Purpose**: Teacher-to-student communication and reward system
- **Simple page**: No complex interactions

---

## 5. Review Tab

**Reference**: `docs/screenshots/ref-review-tab.png`

### Layout
- **Dark overlay**: `rgba(0,0,0,0.6)` or similar — semi-transparent over content
- **Black toolbar**: Top bar with "Done" button (white pill, left-aligned)
- **Modal card**: Centered, ~50% viewport width
  - **Header**: "Book Review" — golden amber bg (`#e8a922`)
  - **Body**: White, centered text
  - **Empty state**: "No books available for review." (bold, `#555` gray)
  - **Border radius**: ~8px on card
  - **Box shadow**: Subtle drop shadow

---

## 6. Interactive Reader

**Reference**: `docs/screenshots/interactive-reader-bombdogs-slide1.png` through `slide10.png`
**Source**: Loaded via iframe from separate URL (not in downloaded HTML)

### Overall Layout
- **Full-bleed background image**: Changes per slide (topic-relevant photography)
- **Top bar**: Dark, semi-transparent
  - Left: "Save & Exit" button (dark pill, white text)
  - Center: Passage title (e.g., "Bomb Dogs: Canine Heroes")
  - Right: Accessibility icon + Audio player
- **Slide dots**: Bottom center (10 dots for this passage)
- **Left/right arrows**: White circles on viewport edges
- **Content panels**: White cards overlaid on background

### Audio Player (top right)
- Play/pause button
- Time display: `current / total` (e.g., "0:00 / 0:37")
- Scrubber bar (slider)
- Volume icon + volume slider
- Duration varies per slide (0:22 to 0:45)
- NOT present on summary writing slides

### Slide Types

#### Reading Slide (slides 3, 5, 7)
- White card on left side, ~40-50% viewport width
- **Section header**: Bold (e.g., "Training a Bomb Dog")
- Multiple paragraphs of passage text
- "Reading Checkpoint" button at bottom (purple/indigo pill) — appears when not yet completed

#### Checkpoint: Drag & Drop (slides 1, 4, 8)
- **Split layout**: Text card (left) + Question card (right)
- Right card:
  - "Check Your Understanding" header
  - Instruction: "Drag and drop a word from the text to complete this sentence."
  - Fill-in-the-blank sentence with underline gap
  - Draggable word token in bordered box below
- **Feedback**: "WAY TO GO! You correctly identified the word that completes the sentence."

#### Checkpoint: Highlight (slides 2, 6)
- **Split layout**: Text card (left) + Feedback card (right)
- Left card: Text with sentences highlighted in **yellow**
- Highlighted sentence in **bold italic**
- Right card:
  - Skill name (e.g., "Make Inferences")
  - Feedback explaining why highlighted sentence is correct
- **Marker tools**: 3 buttons at bottom-right (yellow marker, pink marker, eraser)
- **Feedback**: "YOU GOT IT! You correctly identified the sentence."
- Slide 6 shows TWO simultaneous highlights

#### Summary Writing (slides 9, 10)
- **Split layout**: Writing area (left) + Instruction/Feedback (right)
- Left panel:
  - Instruction text
  - Large textarea (light bg, blue border)
  - "Get Feedback" button (full-width, purple/indigo)
  - "Submit Summary" button (smaller, centered)
- Right panel:
  - Two tabs: "Instruction" (active) | "Feedback"
  - Writing tips with blue hyperlinked terms
- No audio player on this slide

### Passage Structure (Bomb Dogs, 10 slides)
1. Checkpoint: Drag-drop ("battlefields")
2. Checkpoint: Highlight ("Security companies train only calm and gentle dogs...")
3. Reading: "Training a Bomb Dog"
4. Checkpoint: Drag-drop (completed)
5. Reading: "Finding Explosives"
6. Checkpoint: Highlight (two sentences)
7. Reading: "Work and Reward"
8. Checkpoint: Drag-drop (review)
9. Summary writing
10. Summary writing (continuation)

---

## 7. Book Reader (eBook Player)

**Reference**: `docs/screenshots/book-reader-*.png`
**Source**: Loaded via iframe from `App/ebookplayer/player.html`

### Visual Frame
- **Wood-textured background**: Warm brown planks
- **Book frame**: Rounded rectangle with **cyan/blue glow border** (most distinctive visual element)
- **White content area** inside frame
- **Two-column text layout**: Book spread metaphor

### Top Toolbar
- **Left**: Back arrow + Table of Contents icon
- **Center**: Book title in white caps (e.g., "LITTLE BIG TOP")
- **Right** (left to right):
  - Accessibility (person icon)
  - Read-aloud/Screen mask (speech bubble icon)
  - Annotation pen (pencil icon, expandable)
  - "Aa" font resize (bordered pill, expandable)
  - "Translate" (bordered pill, expandable)

### Text Display
- **Font**: Serif (Georgia-like), justified text
- **Chapter headers**: "CHAPTER 2" (small) + "A CANDY BUTCHER" (bold small caps)
- **Line height**: Generous
- **Each word**: Wrapped in individual `<span>` — clickable for Texthelp
- **Inline illustrations**: Black and white

### Navigation
- **Prev/Next arrows**: Circular, semi-transparent, on viewport edges
- **Page slider**: Bottom bar, draggable, shows page range (e.g., "13-14")

### Annotation Tools Dropdown
- S — Strikethrough
- Cyan highlight (blue button)
- Magenta highlight (pink button)
- Green highlight (green button)
- Eraser — Remove highlight
- Collect — View all highlights (grouped by color)

### Table of Contents Panel
- Overlay on content area
- Two tabs: "Table of Contents" (dark active) | "Book Notes" (white inactive)
- Clickable chapter list

### Word Interaction (Texthelp Popup)
- Double-click/tap word → yellow highlight + floating toolbar
- Toolbar: Speak, Translate, Notes, Copy

---

## Media Assets Inventory

All downloaded to `docs/reference-source/media/`:

| File | Size | Purpose |
|------|------|---------|
| `bgnn.png` | 29KB | Library/page tiled background |
| `book_bg.jpg` | 41KB | Book shelf/carousel background texture |
| `bg2.png` | 3KB | Library detail area gradient |
| `bg3.jpg` | 509KB | Assignments/Connect constellation pattern bg |
| `sprite.png` | 64KB | Global icon sprite sheet |
| `sprite3.png` | 26KB | Notebook tab label sprite sheet |
| `note_book.png` | 189KB | Notebook closed cover image |
| `finger_stamp.png` | 11KB | Fingerprint scanner button |
| `notes_rgt_bg.png` | 2KB | Spiral binding PNG (repeat-y) |
| `lading_page_bg.jpg` | 1KB | Notebook landing page bg |
| `left_border.png` | 1KB | Library detail pane left border |
| `right_border.png` | 1KB | Library detail pane right border |
| `top_bg.png` | 1KB | Library detail pane top border |
| `shadow_bg.png` | 1KB | Shadow effect image |

### Missing / Not Downloaded
- `pad_bg.png` — Notebook ruled lines background (referenced in CSS, not captured in network requests)
- `tab_bg1.jpg` through `tab_bg7.jpg` — Assignment tab-specific constellation backgrounds
- Individual book cover images (on CloudFront CDN)
- eBook player assets (separate iframe, not captured)

---

## Key Implementation Notes

### What IS CSS vs What Is NOT
- **Spiral binding**: PNG image (`notes_rgt_bg.png`), NOT CSS shapes
- **Ruled lines**: PNG background image (`pad_bg.png`), NOT CSS repeating-linear-gradient
- **Constellation pattern**: Baked into JPEG backgrounds (`bg3.jpg`), NOT CSS
- **Nav bar gradient**: IS actual CSS gradient
- **Assignment category colors**: ARE CSS gradients (tabs1-tabs7)
- **Tab labels**: Sprite images with hidden text, NOT text rotation
- **3D carousel**: CSS transforms + JavaScript (see `ilit_book_shelf_rounder.js`)
- **Book frame glow**: CSS border/shadow effect

### Architecture Pattern
- Each tab loads in a separate **iframe** (`library.html`, `assignment.html`, `notebook.html`, etc.)
- Built with **jQuery** + jQuery UI on .NET backend (IIS/10.0)
- Content served from **CloudFront CDN** (`d3etodn1cqduev.cloudfront.net`)
- Audio pre-recorded per slide with specific durations
- Every word in book text wrapped in individual `<span>` for texthelp features

### Font Scale
The reference app uses these relative font sizes (all Helvetica/Arial/sans-serif):
- `body`: 21px
- Navigation labels: 13px
- Filter buttons: 15px
- Book title: 32px (bold)
- Book author: 13px
- Stats labels: 15px
- Notebook title input: 18px
- Notebook textarea: 16px (line-height: 26px)
- Assignment headers: ~18px
