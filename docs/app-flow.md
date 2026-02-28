# I-LIT Application Flow: Complete Logical Specification

This document traces every user path through the Savvas I-LIT student app and maps it to our replica implementation. Written by reading the original ClassView source code and our Next.js replica side by side.

---

## Table of Contents

1. [App Entry and Bootstrap](#1-app-entry-and-bootstrap)
2. [Navigation Structure](#2-navigation-structure)
3. [Library Tab](#3-library-tab)
4. [Assignments Tab](#4-assignments-tab)
5. [Interactive Reader (IR)](#5-interactive-reader-ir)
6. [eBook Reader](#6-ebook-reader)
7. [Notebook Tab](#7-notebook-tab)
8. [Connect Tab](#8-connect-tab)
9. [Review Tab](#9-review-tab)
10. [Data Flow and Persistence](#10-data-flow-and-persistence)
11. [Replica Implementation Status](#11-replica-implementation-status)

---

## 1. App Entry and Bootstrap

### Original (Savvas ClassView)

The student app is an iframe-based shell (`student.html`) that loads each tab as a separate HTML page inside an iframe (`#wrapperFrame`). On load:

1. Student authenticates via ClassView (LTI or direct login).
2. `student.html` renders the bottom navigation bar and a full-screen iframe.
3. The default view is **Library** -- `library.html` is loaded into the iframe.
4. `Application.init(viewType)` is called, which sets up the MVC framework:
   - Determines which View class to instantiate based on `viewType`
   - Calls `Application.getModel()` to load JSON data from server/native bridge
   - Calls `Application.callView()` which invokes the View's `.init(model)` method
5. The native bridge (`$.nativeCall`) communicates with the iOS/Chrome app wrapper for data fetching (e.g., `GetBookList`, `GetUnitWeekDetails`, `GetNotelistV2`).

### Our Replica

- Root URL (`/`) immediately redirects to `/dashboard/library`.
- No authentication -- static content, single anonymous student.
- Data is loaded from static JSON files in `/content/` via `fetch()`.
- Student state is persisted in `localStorage` under key `ilit-student-data`.
- On first load, default student data is created with preset values (Lexile 900, 8404 words, 30 pages).

**Key files:**
- `/Users/dereklomas/ilit/app/page.tsx` -- redirect to `/dashboard/library`
- `/Users/dereklomas/ilit/lib/storage.ts` -- localStorage persistence layer
- `/Users/dereklomas/ilit/lib/types.ts` -- shared TypeScript types

---

## 2. Navigation Structure

### Original

A fixed bottom bar with 5 tabs plus an overflow menu:

| Tab | Icon | Page Loaded | Default? |
|-----|------|------------|----------|
| Review | Eye | `book_review.html` | No |
| Library | Book | `library.html` | Yes (default) |
| Notebook | Notepad | `notebook.html` | No |
| Assignments | Checkbox | `assignment.html` | No |
| Connect | Star | `student-connect.html` | No |
| "..." | Dots | Overflow menu | N/A |

Each tab click replaces the iframe `src`. A class dropdown exists at the far right for students enrolled in multiple classes.

The bottom bar has a dark background (`#000`) and uses sprite-based icons. Active tab is highlighted with white text. The entire dashboard sits on a pink-to-teal gradient background with a constellation/network pattern overlay (`bg3.jpg`).

### Our Replica

Same 5 tabs implemented as Next.js routes under `/dashboard/`:

| Tab | Route | Component |
|-----|-------|-----------|
| Review | `/dashboard/review` | `app/dashboard/review/page.tsx` |
| Library | `/dashboard/library` | `app/dashboard/library/page.tsx` |
| Notebook | `/dashboard/notebook` | `app/dashboard/notebook/page.tsx` |
| Assignments | `/dashboard/assignments` | `app/dashboard/assignments/page.tsx` |
| Connect | `/dashboard/connect` | `app/dashboard/connect/page.tsx` |

Navigation is a shared layout (`app/dashboard/layout.tsx`) with a fixed bottom nav bar. Active tab has white text + a cyan underline indicator. The overflow "..." menu is a placeholder (no functionality).

Background uses `bg3.jpg` served from `/images/backgrounds/`.

---

## 3. Library Tab

### Original Flow

**Entry state:** 3D book carousel with the center book selected, "All Titles" filter active.

**Step-by-step flow:**

1. `library.html` loads and calls `Application.init(VIEWTYPE.c_s_CAROUSEL)`.
2. `LibraryHeaderView.init()` renders the top filter bar.
3. `LibraryCarouselView.preInit()` and `.init()`:
   a. Calls `$.nativeCall('GetBookList')` to fetch the full book catalog.
   b. Calls `$.nativeCall('GetLibraryProgressSummary')` for student's reading history.
   c. Calls `$.nativeCall('GetUserLevel')` for the student's Lexile level.
4. The `ILITBookShelfRounder` jQuery plugin renders the 3D carousel:
   - Default 15 books visible, center book at index 8
   - 3D perspective transforms with easeInOutSine easing
   - Books scale/tilt based on distance from center
   - Touch/swipe gestures via Hammer.js
5. Below the carousel, three info cards appear:
   - **Read Aloud Think Aloud (RATA)** -- anchor text cover on the left
   - **Progress stats** -- Total Words, Total Pages, Total Books, IR Lexile Level (center, dark bg)
   - **My Current Reading** -- current book cover on the right (tapping opens eBook reader)

**Filter tabs and their behavior:**

| Filter | Logic |
|--------|-------|
| All Titles | Shows all books from catalog, loads first 15 into carousel |
| My Level | Filters to books within +/- 25 of student's Lexile level |
| My Books | Shows books the student has started or completed reading |
| Recommended | API call for algorithmically recommended books |
| Reviewed | API call for books with student reviews; shows star ratings |
| Reserved | API call for teacher-reserved books; shows remove (X) button |

**Book selection:**
- Swiping/tapping a book in the carousel centers it and shows its title + author.
- Clicking a centered book opens a full-screen book detail popup (`BookPopupAreaTemplate`).
- From the popup, the student can tap "Read" to open the eBook reader.

**Interest Inventory:**
- On first login (no reading history), an interest inventory modal appears.
- 4 swiper slides: Welcome, pick 5 interest areas (drag-and-drop from categories), background selection, reading level self-assessment.
- This populates the "Recommended" filter.

**Data persisted:**
- `LibraryCarouselView.ActiveTab` -- current filter
- `LibraryCarouselView.middlePointer` -- carousel center index
- Reading progress per book (via `GetLibraryProgressSummary`)
- Book reservations, reviews, recommendations (server-side)

### Our Replica

- Books loaded from `/content/books/catalog.json` (static JSON, no API).
- 26 real Savvas books at Lexile levels 100L-1030L.
- 3D carousel replicated with CSS transforms and Framer Motion.
- Filter tabs work client-side:
  - "My Level" filters within +/- 150 Lexile of student's level (wider band than original's +/- 25).
  - "My Books" filters to books with `bookProgress` entries in localStorage.
  - "Reviewed" filters to books with `bookReviews` entries.
  - "Recommended" and "Reserved" show all books (stubbed).
- Progress stats card shows data from localStorage.
- Tapping "My Current Reading" navigates to `/reader/[bookId]`.
- Search functionality added (original has it but less prominent).

---

## 4. Assignments Tab

### Original Flow

**Entry state:** A centered modal overlay with 7-9 assignment categories in an accordion list.

1. `assignment.html` loads, calls `Application.init(VIEWTYPE.c_s_ASSIGNMENT_TOC)`.
2. `AssignmentsTOCView.render()`:
   a. Iterates `ASSIGNMENT_CATEGORY` constant array (from `constants.js`).
   b. For each category, fetches assigned items from server data.
   c. Builds HTML with count badges (red = pending, green = 0 remaining).
   d. Renders into the centered modal container.

**Categories (in order):**

| Category | Key | Description |
|----------|-----|-------------|
| Interactive Reading | `iwt` | Nonfiction passages with inline checkpoints |
| Study Plan | `studyplan` | Pre/practice/post-test bundles |
| Vocabulary, Word Study, and Reading Comprehension | -- | Phonics, word sort, word slam, FRS |
| iPractice | `dailyassignment` | Daily practice work |
| Writing | `essay`/`paragraph` | Essay and paragraph assignments |
| Monitor Progress | -- | Unit benchmarks, WRC, grade assessments |
| Information | `nsa` | Non-scoreable informational items |

**Accordion behavior:**
- Single-open pattern: clicking one category closes all others.
- jQuery `.slideDown('fast')` / `.slideUp('fast')` animations (~200ms).
- Each category row shows: expand arrow, count badge, category name.
- Each assignment item within shows: arrow, title, optional status icon.

**Clicking an assignment item:**
- For Interactive Reading items: loads the IR experience (`AssigmentSlides`)
- For other types: loads the appropriate slide view (Study Plan, Essay, Paragraph, etc.)
- Each assignment type has its own View class and slide engine.

### Our Replica

- Static list of categories with hardcoded items (matching the original's "Bomb Dogs", "Turn It Down!", etc.).
- Accordion expand/collapse with `Set<string>` state tracking.
- Count badges with red/green colors based on completion state.
- Interactive Reading items navigate to `/interactive/[passageId]`.
- Other item types are not yet interactive (no routing).
- Completion state tracked via `completedAssignments` array in localStorage.

---

## 5. Interactive Reader (IR)

### Original Flow

The Interactive Reader (internally "IWT" -- Interactive Writing Tool) is the core reading experience. Students read nonfiction passages alternating between reading content and comprehension checkpoints.

#### 5.1 Entry

1. Student taps an Interactive Reading assignment from the Assignments tab.
2. `AssigmentSlides.init()` sets:
   - `assignmentType = 'iwt'`
   - `slidingEngineType = ASSIGNMENTS.c_s_ASSIGNMENT_PARALLELEX_SLLIDING`
3. The parallax sliding engine loads with custom `Swipe()` wrapper (not standard Swiper).
4. Each slide's content is rendered based on its type via a switch/case router.

#### 5.2 Typical Passage Structure

```
[Reading Slide 1]  -->  [Highlight Checkpoint]  -->  [Reading Slide 2]  -->
[Drag-and-Drop Checkpoint]  -->  [Reading Slide 3]  -->  [Text Answer]  -->
[Reading Slide 4]  -->  [Multiple Choice]  -->  [Summary Slide]
```

Example (Bomb Dogs: Canine Heroes, 10 slides):
1. Checkpoint (drag-drop: "battlefields")
2. Checkpoint (highlight: "Security companies train only calm and gentle dogs...")
3. Reading ("Training a Bomb Dog")
4. Checkpoint (drag-drop, completed)
5. Reading ("Finding Explosives")
6. Checkpoint (highlight: two sentences about training with scents)
7. Reading ("Work and Reward")
8. Checkpoint (drag-drop)
9. Summary writing
10. Summary writing (continuation)

#### 5.3 Two-Panel Layout

Every IWT slide uses a two-panel layout:

- **Left panel** (`.continent_box_space.left`): Passage text or interactive content. Scrollable. Full-bleed background image behind it.
- **Right panel** (`.continent_edit_box`): Checkpoint interaction (question, tools, feedback). Initially hidden (opacity: 0, left: -200px).

The slide wrapper has a blue gradient background: `linear-gradient(to bottom, #6cbaf8, #3a8ae1)`.

Container width: 1000px centered.

#### 5.4 Slide Progression (Freeze/Unfreeze)

The parallax engine enforces **linear progression**:

- Slides ahead of the current "freeze point" cannot be swiped to.
- Completing a checkpoint calls `AssigmentSlides.slidingEngine.unFreezeNextSlides()` to advance the freeze point.
- On re-entry, `getFreezePosition()` calculates the correct freeze point from saved attempt data.
- Previously completed slides can be revisited freely.

Parallax engine config:
- `continuous: false` -- no wrap-around
- `speed: 1200` -- 1.2 second slide transition
- `noScrollClass: 'continent_box_inner'` -- prevents swipe inside scrollable areas

#### 5.5 Slide Types

**Reading Slide:**
- Full-width left panel with passage text.
- Optional "Reading Checkpoint" button at bottom.
- Tapping the button triggers the right panel to animate in (slides from left: -200px to left: 0, with opacity transition).
- No interaction required beyond reading.

**Highlight Slide (`iwthighlightslide`):**
- Left panel: passage text where words/sentences are selectable (each wrapped in `seqClass{N}` spans).
- Right panel: question header, highlight tools (yellow marker, red marker, eraser), feedback area, "Save and Continue" button.
- `single_word_highlight: true` = individual words tappable; `false` = sentences tappable.
- Highlight colors: yellow (`#f4df76`), red (`#f47676`).
- Maximum 2 attempts:
  - 1st correct: score 2.0, show `pass_text`, disable tools, unfreeze next
  - 1st wrong: score 0, show `fail_text`, 5-second loader, allow retry
  - 2nd correct: score 1.5, show `pass_text`, disable tools, unfreeze next
  - 2nd wrong: score 0, show `fail_again_text`, auto-highlight correct answer, disable tools, unfreeze next

**Drag-and-Drop Slide (`iwtdndslide`):**
- Left panel: passage text + word bank with draggable tiles (`.draggable_word`).
- Right panel: question, drop zone (`.dropbox` with "Drag Word Here"), feedback, "Save and Continue".
- jQuery UI `draggable({revert: 'invalid', helper: 'clone'})` + `droppable({accept: '.draggable_word'})`.
- Keyboard accessible: TAB between zones, CTRL+arrow to move.
- Maximum 2 attempts with same scoring as highlight (2.0 / 1.5 / 0).

**Text Answer Slide (`iwttextanswerslide`):**
- Left panel: display text (prompt).
- Right panel: question header, textarea for student response, submit button.
- **Always passes** -- no scoring for open-ended responses. `pass_text` shown on submit.

**Summary Slide (`iwtsummaryslide`):**
- Left panel: large textarea for summary writing.
- Right panel: tabbed panel with "Instructions" and "Feedback" tabs.
- "Get Feedback" button calls PKT (Pearson Knowledge Technologies) API for automated scoring.
- "Submit Summary" button finalizes.
- Summary max score: 4 * 3 (multiplying factor) = 12 points.
- After submission: textarea becomes readonly, buttons disabled.

**Multiple Choice Slide (`multiplechoiceslide`):**
- Radio button options.
- Submit button.
- Correct/incorrect feedback.
- Can include audio playback (max 2 plays).

#### 5.6 IWT Scoring Model

Per checkpoint:
| Slide Type | 1st Trial Correct | 2nd Trial Correct | Both Wrong |
|-----------|-------------------|-------------------|------------|
| Highlight | 2.0 | 1.5 | 0 |
| Drag-and-Drop | 2.0 | 1.5 | 0 |
| Text Answer | N/A (always passes) | -- | -- |
| Summary | 0-12 (PKT score * 3) | -- | -- |

Total score = sum of all checkpoint scores + summary score.

#### 5.7 State Persistence

Attempt data per slide is saved incrementally (minimum 30-second intervals):

```javascript
{
  itemId: "assignment_item_id",
  itemSlides: [
    {
      slideID: "slide_id",
      slideType: "iwthighlightslide",
      slideAttempt: 1,
      slideIsCorrect: true,
      slideScore: "2",
      slideInputData: { /* type-specific state */ }
    }
  ],
  submitStatus: "submitted",
  itemType: "iwt"
}
```

On re-entry, all slide states are restored: highlights re-applied, dropped words replaced, typed text restored, feedback visibility set, tools enabled/disabled based on completion.

#### 5.8 Navigation

- Left/right arrow buttons on viewport edges (white circles with box-shadow).
- Pagination dots at bottom center.
- "Save & Exit" button (top left) -- saves progress and returns to Assignments.
- When all slides are complete, "Save & Exit" turns green and says "Done".

### Our Replica

**Entry:** Student taps an IR assignment item, navigates to `/interactive/[passageId]`. Passage JSON loaded from `/content/passages/[passageId].json`.

**Components:**
- `InteractiveShell` -- main container, slide navigation, background images, audio controls
- `ReadingSlide` -- passage text display with "Reading Checkpoint" button
- `CheckpointSlide` -- routes to the correct checkpoint type
- `HighlightCheckpoint` -- sentence-level highlighting with yellow marker
- `DragDropCheckpoint` -- word tile drag-and-drop
- `MultipleChoiceCheckpoint` -- radio button choices
- `SummarySlide` -- summary writing textarea
- `VocabPopup` -- tap-to-define vocabulary popup

**Differences from original:**
- No freeze/unfreeze system -- students can navigate freely between slides.
- Checkpoint completion tracked via `Set<number>` state in InteractiveShell.
- Highlight checkpoints use sentence-level selection (pre-split in JSON), not character-index-based.
- Drag-and-drop uses HTML5 drag-and-drop or tap-to-select, not jQuery UI.
- No PKT integration for summary scoring.
- Audio uses browser `SpeechSynthesis` API (text-to-speech) instead of pre-recorded audio files.
- Progress persisted to localStorage via `recordCheckpointScore()`, `markSlideComplete()`, `markPassageComplete()`.
- Framer Motion animations instead of jQuery.animate().

---

## 6. eBook Reader

### Original Flow

#### 6.1 Entry

1. Student taps "My Current Reading" in Library, or opens a book from assignments.
2. `player.html` loads with book data passed via URL hash (pipe-separated):
   ```
   player.html#bookid|||title|||type|||totalWords|||source|||format|||totalPages|||...
   ```
3. Boot sequence:
   a. Parse hash parameters.
   b. Call `GetEbookInfo(bookid)` via native bridge.
   c. Load book content JS file: `{bookPath}/{bookid}.js`.
   d. Call `GetLibraryProgress()` to restore saved page, font size, word count.
   e. Call `init()` in `common.js` to set up the reader.

#### 6.2 Layout

The reader uses a two-page spread layout:

```
[Dark wooden texture background (full bleed)]
  [Outer frame: wooden texture tile (background_bg.png) + cyan border (#24789d)]
    [Inner white panel: two-column text layout]
      [Left page]  |  [Right page]
    [Page slider at bottom]
  [Left/Right arrow buttons on viewport edges]
```

Key CSS:
- Body font: `Times New Roman, Times, serif`, 16px, line-height 22px, color `#4e4e4e`
- Background: `background.jpg` no-repeat, cover
- Outer frame: `background_bg.png` repeating wood grain, border-radius 15px, 2px solid `#24789d`
- Inner panel: white bg, 5px border-radius, inner box-shadow
- Page content max-height: 270px (drives pagination algorithm)

#### 6.3 Pagination

The reader paginates book content dynamically:

1. Book content is loaded as HTML with each word in its own `<span>`.
2. `setPageInfo()` renders content into the page container and checks if it exceeds `max-height: 270px`.
3. When content overflows, a page break is inserted.
4. Two pages are displayed side-by-side (left page + right page).
5. The page slider at bottom shows "Page Number X-Y" out of total pages.

#### 6.4 Toolbar (left to right)

| Button | Function | Details |
|--------|----------|---------|
| Back | Return to library | Saves progress, calls `setLibraryProgress()` |
| Table of Contents | Side panel | Two tabs: "Table of Contents" (chapter list) and "Book Notes" |
| [Book Title] | Centered | Uppercase white text |
| Accessibility | Info panel | Keyboard navigation instructions |
| Screen Mask | Masks part of screen | SpeechStream integration for visual distraction reduction |
| Annotation Pen | Color dropdown | Strikethrough, Cyan, Magenta, Green highlight, Eraser, Collect |
| Font Resize (Aa) | Size dropdown | Multiple size options, saves preference |
| Translate | Language dropdown | 100+ languages, default Spanish |

#### 6.5 Word-Level Interaction (TextHelp)

Every word in the book is individually wrapped in a `<span>`, making each word clickable:

1. Double-click/tap a word triggers yellow highlight + floating TextHelp toolbar.
2. Toolbar offers: **Speak** (TTS), **Translate** (inline translation), **Notes** (add annotation), **Copy**.
3. SpeechStream 3.9.5 handles TTS and translation.

#### 6.6 Annotation Tools

The Annotation Pen dropdown provides:
- **S** (Strikethrough) -- strikes through selected text
- **Cyan** highlight -- `#00bcd4` or similar
- **Magenta** highlight -- pink color
- **Green** highlight -- green color
- **Eraser** -- removes highlights
- **Collect** -- opens a dialog showing all highlights grouped by color

Highlights are persisted per book/page via the native bridge.

#### 6.7 Reading Progress Tracking

The original tracks reading progress at multiple levels:

1. **Page tracking:** Current page saved on every page turn or exit.
2. **Word counting:** A timer-based system counts words read:
   - For iLIT 2.0: word count increments every 10 seconds (assuming ~150 WPM).
   - For standard iLIT: word count increments every 30 seconds.
   - `wordCountTracker()` runs on a `setInterval` while the reader is active.
3. **Book completion:** When the student reaches the last page, the book is marked complete.
4. **Weekly progress:** Word count is tracked per week (using `classStartDate` from URL hash).

All progress is saved via `setLibraryProgress()` native call on page turn, exit, or periodic autosave.

### Our Replica

**Entry:** Student taps a book, navigates to `/reader/[bookId]`. Book JSON loaded from `/content/books/[bookId].json`.

**Components:**
- `ReaderShell` -- main container, page navigation, state management
- `ReaderToolbar` -- top bar with all tool buttons
- `BookPage` -- two-page spread rendering with word-level spans
- `PageSlider` -- jQuery UI slider equivalent at bottom
- `TableOfContents` -- side panel with chapter list + book notes tab
- `CollectedHighlights` -- dialog showing all annotations by color
- `TextHelpToolbar` -- floating toolbar on word tap (speak, translate, copy)
- `AccessibilityPanel` -- keyboard shortcut instructions

**Differences from original:**
- Book content from static JSON instead of dynamically loaded JS files.
- Pagination by page entries in JSON (not dynamic overflow detection).
- 26 real Savvas book titles with actual content.
- Annotations stored in localStorage (`ilit-annotations-{bookId}`) instead of native bridge.
- Book notes stored in localStorage (`ilit-notes-{bookId}`).
- TTS uses browser `SpeechSynthesis` API.
- Reading position saved to localStorage (`bookProgress` in `StudentData`).
- Word-level rendering maintained (each word in its own span for interaction).
- Font size toggle with sm/md/lg options.
- Screen mask, translate, and some annotation features are partially implemented.

---

## 7. Notebook Tab

### Original Flow

The Notebook is a skeuomorphic spiral-bound notebook with a fingerprint scanner entry.

#### 7.1 Entry (Landing Page)

1. `notebook.html` loads, `NotebookView.render()` shows the landing page.
2. Landing page shows a notebook cover image (`note_book.png`, 422x605px) on a textured background (`lading_page_bg.jpg`).
3. A fingerprint scanner button (`finger_stamp.png`, 64x85px) overlays the cover.
4. Student taps the fingerprint -- calls `NotebookView.showView()`.

#### 7.2 Open Notebook

1. `showView()` calls `GetUnitWeekDetails` via native bridge to get current unit/week.
2. Default tab is **Journal** (`NOTEBOOK_TABS[0]`).
3. `goToTabs(tabType)` routes based on tab type:
   - For Journal/WordBank/ClassNotes: calls `GetNotelistV2` to fetch notes, then renders.
   - For My Work/Resources: shows 2-second loading overlay, fetches portfolio/resource data.

#### 7.3 Five Sub-tabs

The open notebook has a two-panel layout (left sidebar + right content) with 5 color-coded tabs on the right edge:

| Tab | Color | Content |
|-----|-------|---------|
| Journal | `#0b89b7` (teal) | Date-stamped journal entries. Title + textarea. CRUD + auto-save. |
| Word Bank | `#1a5479` (dark blue) | Vocabulary cards. Word + Definition + Sentence fields. |
| Class Notes | `#fc4333` (red) | Rich text editor with 7 graphic organizer templates (Cause & Effect, Step by Step, Story Map, Three Column Chart, Timeline, Two Column Chart, Venn Diagram). |
| My Work | `#fd8d00` (orange) | Read-only. Unit/Lesson hierarchy sidebar. Shows assignment scores (e.g., "29/36") and "View Feedback" buttons. |
| Resources | `#fcbb02` (amber) | Read-only. Categories: Lesson Screens, Routine Cards, Book Club, Standards. Hidden for iLIT 2.0 and WTW products. |

**Visual elements:**
- Spiral binding: `notes_rgt_bg.png` repeating vertically on left panel's right edge.
- Ruled lines: `pad_bg.png` repeating as paper texture on writing areas.
- Tab labels are sprite images (not CSS text rotation).
- Active tab has a CSS triangle arrow pointing into the content area.

#### 7.4 Journal Tab Detail

**Left sidebar:**
- Entries grouped by unit number (accordion).
- Each entry shows truncated text + date (MM/DD format, parsed from `RevisionId`).
- Active entry highlighted in orange (`#ff8c00`).

**Right content:**
- Title input field.
- Large textarea with ruled-line background.
- Auto-save every 30+ seconds (configurable via `IncrementalSaveDuration`).
- Save/Cancel buttons appear on edit.
- Close button returns to notebook cover.

**Operations:** Add new entry, delete entry, edit title/body, auto-save.

#### 7.5 Word Bank Tab Detail

Three-field editor for each word:
- **Word** (`contenteditable` div)
- **Definition** (`contenteditable` div)
- **Sentence** (`contenteditable` div)

Data stored as JSON: `{datacontent: [{Definition: "...", Sentence: "..."}]}`. Word title stored separately.

#### 7.6 Class Notes Tab Detail

Rich text area (`contenteditable` div) with graphic organizer insertion at cursor:
- 7 organizer types, each inserted via `putHtmlAtCaret()`.
- Organizers are non-editable wrappers (`contenteditable="false"`) containing editable internal fields.
- "Organize" dropdown button triggers the template picker.

#### 7.7 My Work Tab Detail

**Left sidebar:** Unit 1-7 accordion, each with: Lessons, Benchmark Assessment(s), Weekly Reading Check(s).

**Right content:** Assignment list showing title, score ("29/36"), "View Feedback" button, external link icon. Clicking opens assignment in iframe overlay.

#### 7.8 Data Persistence

All notebook data is persisted via native bridge calls:
- `GetNotelistV2(tabType)` -- fetch note list
- `GetNoteInfo(noteId)` -- fetch single note
- `SaveNote(title, content, ...)` -- create/update
- `DeleteNote(noteId)` -- delete

Auto-save timer: minimum 30 seconds, configurable. Clears on tab switch, close, delete, explicit save.

### Our Replica

- Fingerprint scanner cover with press animation (600ms delay before unlock).
- Five sub-tabs with matching colors from the original spec.
- Spiral binding component (`SpiralBinding`) with CSS-rendered rectangular rings.
- Journal tab: functional with add, edit, delete, title/body fields.
- Word Bank: functional with add/remove saved words.
- Class Notes: basic implementation.
- My Work / Resources: stub views (no real assignment data).
- Data persisted via `journalEntries`, `classNotes`, `savedWords` arrays in localStorage.
- No graphic organizers implemented yet.

---

## 8. Connect Tab

### Original Flow

**Entry state:** A white card with two columns -- comments on the left, star count on the right.

1. `student-connect.html` loads, `StudentConnectView.init()` renders.
2. Data fetched: buzz comments from teacher, star count.
3. **Left column:** "Comments" header + refresh button + table of date/comment rows.
4. **Right column:** Large star image (`star_big_border.png` if 0 stars, `star_big_fill.png` if >0) + "You have **N** stars !!!" text.

**Comment table:**
- Two columns: Date (30%), Comments (70%).
- Date parsed from `RevisionID` as MM/DD/YY.
- Comments include both pre-authored notes (from a code lookup) and personal teacher comments.

**Stars:** A gamification system where teachers award stars for participation and achievement. The star count is a simple integer displayed prominently.

**Refresh button:** Green button with refresh icon, re-fetches comments from server.

### Our Replica

- Matches the two-column layout with a comments table and star display.
- Sample comments hardcoded (5 entries with dates and star awards).
- Star images from `/images/stars/`.
- Refresh button triggers an 800ms animation (no real data fetch).
- Total stars calculated as sum of per-comment star awards.

---

## 9. Review Tab

### Original Flow

**Entry state:** Full-screen overlay with a gold-header modal.

1. `book_review.html` loads as iframe.
2. `BookReview.init()`:
   a. Calls `GetLibraryProgressSummary()` to find completed books.
   b. Calls `GetBookReviewFeedback()` to find already-reviewed books.
   c. If no completed books: shows "No books available for review."
   d. If books exist: shows book slider + review form.

**Review form flow:**

1. Book thumbnail slider at top -- student selects which book to review.
2. **Star rating** -- 1-5 stars (tap to rate).
3. **Feedback tags** -- pick up to 3 from a predefined list of 26 responses:
   - "I liked it", "I didn't like it", "I learned a lot", "It was too hard to read", "It was exciting", "It was boring", "I liked the characters", etc.
   - Selected tags shown with checkmark, highlighted in dark background.
4. **Free-text comment** -- optional textarea, 150 character max.
5. **Preview** -- student sees a read-only preview of their review.
6. **Submit** -- calls `SaveBookReviewFeedback()` to save the review.

**Header bar:** Black background, "Done" button returns to Library.

**Modal styling:** Gold/amber header (`#eeb01c`), white body, centered on dark gray overlay (`#585858`).

### Our Replica

- Full-screen overlay matching the dark gray background.
- "Done" button in header bar linking to `/dashboard/library`.
- Gold header with "Book Review" title.
- Star rating (1-5) with hover states.
- Feedback tags from the original list (15 items, select up to 3).
- Free-text review textarea (150 char limit).
- Submit saves review to localStorage (`bookReviews` in StudentProgress).
- "No books available for review" empty state.
- Post-submit confirmation screen.

---

## 10. Data Flow and Persistence

### Original (Server-Side)

The original app uses a native bridge pattern for all data:

```
Student App (iframe) <-> student.html (shell) <-> Native Bridge ($.nativeCall) <-> ClassView API Server
```

Key data flows:
- **Book catalog:** `GetBookList()` -- returns full library catalog
- **Reading progress:** `GetLibraryProgressSummary()` / `setLibraryProgress()` -- per-book page/word tracking
- **Assignment data:** `GetAssignmentTOCList()` -- assignment categories and items
- **Attempt data:** `setAttemptData()` / `getAttemptData()` -- per-slide checkpoint state
- **Notebook notes:** `GetNotelistV2()` / `SaveNote()` / `DeleteNote()` -- CRUD for journal/word bank/class notes
- **Reviews:** `GetBookReviewFeedback()` / `SaveBookReviewFeedback()`
- **Connect/Stars:** `GetBuzzList()` / `GetStarData()`
- **User level:** `GetUserLevel()` -- student's current Lexile level

All data is stored on ClassView API servers. The native bridge (`$.nativeCall`) handles request/response polling with configurable intervals and timeout.

### Our Replica (localStorage)

All data stored client-side in a single localStorage key: `ilit-student-data`.

```typescript
interface StudentData {
  progress: StudentProgress;      // reading stats, book/passage progress, highlights, reviews
  journalEntries: JournalEntry[];  // notebook journal
  classNotes: ClassNote[];         // notebook class notes
  savedWords: SavedWord[];         // word bank
  completedAssignments: string[];  // assignment completion tracking
}
```

Additional per-book localStorage:
- `ilit-annotations-{bookId}` -- word-level highlight annotations
- `ilit-notes-{bookId}` -- book notes from the reader's TOC panel

**Progress tracking:**
- Passage checkpoint scores: `passageProgress[passageId].checkpointScores[]`
- Passage completion: `completedPassages[]` array
- Book reading position: `bookProgress[bookId]` = last page number
- Book highlights: `highlights[bookId][]` = highlight annotations
- Book reviews: `bookReviews[bookId]` = rating + text + date
- Aggregate stats: `totalWords`, `totalPages`, `totalBooks`, `currentLexile`

---

## 11. Replica Implementation Status

### Fully Implemented

| Feature | Route/Component | Status |
|---------|----------------|--------|
| Navigation bar (5 tabs) | `app/dashboard/layout.tsx` | Complete -- matches tab order, icons, active states |
| Library carousel | `app/dashboard/library/page.tsx` | Complete -- 26 books, filters, search, progress stats |
| Assignments TOC | `app/dashboard/assignments/page.tsx` | Complete -- 7 categories, accordion, badges |
| Interactive Reader shell | `components/interactive/InteractiveShell.tsx` | Complete -- slide nav, dots, background images, audio |
| IR: Reading slides | `components/interactive/ReadingSlide.tsx` | Complete -- text display, "Reading Checkpoint" button |
| IR: Highlight checkpoint | `components/interactive/HighlightCheckpoint.tsx` | Complete -- sentence highlighting, 2-attempt scoring |
| IR: Drag-and-Drop checkpoint | `components/interactive/DragDropCheckpoint.tsx` | Complete -- word tiles, drop zone, scoring |
| IR: Multiple choice | `components/interactive/MultipleChoiceCheckpoint.tsx` | Complete -- radio options, submit, feedback |
| IR: Summary writing | `components/interactive/SummarySlide.tsx` | Complete -- textarea, instructions panel |
| eBook Reader shell | `components/reader/ReaderShell.tsx` | Complete -- two-page spread, navigation, toolbar |
| eBook: Page display | `components/reader/BookPage.tsx` | Complete -- word-level spans, serif font |
| eBook: Toolbar | `components/reader/ReaderToolbar.tsx` | Complete -- all tool buttons |
| eBook: TOC panel | `components/reader/TableOfContents.tsx` | Complete -- chapter list + book notes |
| eBook: Annotations | `components/reader/CollectedHighlights.tsx` | Complete -- highlight by color |
| eBook: Page slider | `components/reader/PageSlider.tsx` | Complete -- page range display |
| eBook: Accessibility | `components/reader/AccessibilityPanel.tsx` | Complete -- keyboard shortcuts |
| Notebook (locked cover) | `app/dashboard/notebook/page.tsx` | Complete -- fingerprint scanner animation |
| Notebook: Journal | `app/dashboard/notebook/page.tsx` | Complete -- CRUD, title/body, date display |
| Notebook: Word Bank | `app/dashboard/notebook/page.tsx` | Complete -- add/remove words |
| Connect tab | `app/dashboard/connect/page.tsx` | Complete -- comments table + star display |
| Review tab | `app/dashboard/review/page.tsx` | Complete -- star rating, feedback tags, submit |
| Progress persistence | `lib/storage.ts` | Complete -- localStorage with all data types |
| IR vocabulary popup | `components/interactive/VocabPopup.tsx` | Complete -- tap-to-define |

### Partially Implemented / Missing

| Feature | Gap | Original Behavior |
|---------|-----|-------------------|
| Freeze/unfreeze slide progression | Students can freely navigate all slides | Linear progression enforced; checkpoints must be completed to advance |
| PKT summary scoring | No automated feedback | External API returns content + wording scores |
| Pre-recorded audio per slide | Browser TTS (SpeechSynthesis) | Specific audio files per slide with scrubber |
| 3D carousel perspective math | CSS transforms + motion | jQuery plugin with easeInOutSine, 3D perspective, scale coefficients |
| Interest inventory | Not implemented | 4-slide onboarding flow with drag-and-drop interest selection |
| Notebook: Class Notes organizers | Not implemented | 7 graphic organizer templates insertable at cursor |
| Notebook: My Work (grades) | Stub view | Shows real assignment scores + "View Feedback" links |
| Notebook: Resources | Stub view | Lesson Screens, Routine Cards, Book Club, Standards |
| Book detail popup (Library) | Direct navigation to reader | Full-screen popup with book info before reader launch |
| Assignment types beyond IR | Not routable | Study Plan, Word Study, iPractice, Writing, Monitor Progress, etc. |
| Teacher communication (Connect) | Static sample data | Real-time buzz comments + stars from teacher |
| Annotation pen dropdown (Reader) | Basic highlight toggle | Full dropdown with Strikethrough, 3 colors, Eraser, Collect |
| Screen mask | Not implemented | Masks part of screen for visual distraction reduction |
| Translation feature | Not implemented | 100+ languages via SpeechStream |
| Word count timer | Not implemented | Timer-based word counting while reading |
| Class switcher | Not implemented | Dropdown for students in multiple classes |

---

## Appendix: Key File Inventory

### Original Source (read from `docs/reference-source/`)

| File | Lines | Purpose |
|------|-------|---------|
| `js/application.js` | 267 | App framework -- tab switching, iframe communication |
| `js/libraryview.js` | 4837 | Library view controller -- book loading, filtering, carousel |
| `js/assignments.js` | 36206 | Assignments engine -- all slide types, scoring, state |
| `js/notebook.js` | 5331 | Notebook controller -- journal, word bank, tabs |
| `js/book_review.js` | 1004 | Book review logic |
| `js/connect.js` | 2089 | Teacher communication + stars |
| `js/constants.js` | -- | App constants and configuration |
| `ebookplayer/script/common.js` | 3683 | Core eBook player logic |

### Our Replica

| File | Purpose |
|------|---------|
| `app/page.tsx` | Root redirect to `/dashboard/library` |
| `app/dashboard/layout.tsx` | Shared bottom navigation bar |
| `app/dashboard/library/page.tsx` | Library carousel + filters |
| `app/dashboard/assignments/page.tsx` | Assignment categories accordion |
| `app/dashboard/notebook/page.tsx` | Notebook (cover + 5 sub-tabs) |
| `app/dashboard/connect/page.tsx` | Connect tab (comments + stars) |
| `app/dashboard/review/page.tsx` | Book review modal |
| `app/interactive/[passageId]/page.tsx` | IR page loader |
| `app/reader/[bookId]/page.tsx` | eBook reader page loader |
| `components/interactive/InteractiveShell.tsx` | IR slide container + navigation |
| `components/interactive/CheckpointSlide.tsx` | Checkpoint type router |
| `components/interactive/HighlightCheckpoint.tsx` | Highlight interaction |
| `components/interactive/DragDropCheckpoint.tsx` | Drag-and-drop interaction |
| `components/interactive/MultipleChoiceCheckpoint.tsx` | Multiple choice |
| `components/interactive/ReadingSlide.tsx` | Reading text display |
| `components/interactive/SummarySlide.tsx` | Summary writing |
| `components/interactive/VocabPopup.tsx` | Vocabulary popup |
| `components/reader/ReaderShell.tsx` | eBook reader container |
| `components/reader/ReaderToolbar.tsx` | Reader toolbar |
| `components/reader/BookPage.tsx` | Two-page spread |
| `components/reader/TableOfContents.tsx` | TOC + book notes panel |
| `components/reader/PageSlider.tsx` | Page navigation slider |
| `components/reader/CollectedHighlights.tsx` | Highlight collection dialog |
| `components/reader/TextHelpToolbar.tsx` | Word tap floating toolbar |
| `components/reader/AccessibilityPanel.tsx` | Keyboard shortcuts |
| `lib/types.ts` | Shared TypeScript types |
| `lib/storage.ts` | localStorage persistence layer |
