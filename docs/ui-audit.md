# I-LIT Student Interface — Comprehensive UI Audit

Reference screenshots saved in `docs/screenshots/`.

---

## Global Shell

### Bottom Navigation Bar (5 tabs + overflow)
- Fixed bottom bar, always visible
- **Review** (eye icon) — Book review writing
- **Library** (book icon) — Default view, digital library
- **Notebook** (notepad icon) — Journal/writing/work
- **Assignments** (checkbox icon) — All assigned work
- **Connect** (star icon) — Teacher communication
- **"..." overflow** — Additional options
- **Class switcher** dropdown (far right)

### Background
- Dashboard views use a pink-to-teal gradient with constellation/network pattern overlay

---

## 1. Library Tab (`library-main.png`)

### Top Filter Bar
- **Left group** (segmented buttons): All Titles (default, pressed) | My Level | My Books
- **Right group**: Recommended | Reviewed | Reserved
- **Grid/list view toggle** (far left)
- **Search** icon (magnifying glass, far right)

### Book Carousel
- Horizontal row of book covers with 3D perspective tilt
- Selected book is centered and enlarged/popped forward
- Adjacent books tilt away at angles
- Carousel is touch-scrollable

### Below Carousel
- **Selected book title** + author (large text, centered)
- **Three cards** in a row:
  - **Left**: "Read Aloud Think Aloud" — book cover + label (teacher-read anchor text)
  - **Center**: Progress card (dark bg) showing:
    - Total Words: 8,818
    - Total Pages: 33
    - Total Books: -
    - IR Lexile Level: 900
  - **Right**: "My Current Reading" — book cover + label (launches reader)

---

## 2. Book Reader (`book-reader-*.png`)

### Visual Design
- **Wood-textured background** (warm brown planks)
- **Book frame**: Rounded rectangle with **cyan/blue glow border** (the most distinctive visual element)
- White content area inside the frame
- **Two-column text layout** (book spread metaphor)

### Top Toolbar
- **Left**: Back arrow + Table of Contents icon
- **Center**: Book title in white caps (e.g., "LITTLE BIG TOP")
- **Right** (left to right):
  - Accessibility (person icon)
  - Read-aloud/Screen mask (speech bubble icon)
  - Annotation pen (pencil icon, expandable)
  - **"Aa"** font resize (bordered pill, expandable)
  - **"Translate"** (bordered pill, expandable)

### Annotation Pen Dropdown (`book-reader-annotation-tools.png`)
- **S** — Strikethrough
- **Cyan** highlight (blue button)
- **Magenta** highlight (pink button)
- **Green** highlight (green button)
- **Eraser** — Remove highlight
- **Collect** — View all highlights summary

### Text Display
- Serif font (Georgia-like), justified text
- Chapter headers: "CHAPTER 2" (small) + "A CANDY BUTCHER" (bold small caps)
- Generous line height, paragraph spacing
- Every word wrapped in individual `<span>` — each word is independently clickable
- Inline illustrations (black and white)

### Navigation
- **Left/right arrow buttons**: Circular, semi-transparent, on viewport edges
- **Page slider**: Bottom bar, draggable, shows page range (e.g., "13-14")
- Slider range: 1 to 137 (this book)

### Table of Contents Panel (`book-reader-toc-panel.png`)
- Overlay on book content area
- Two tabs: **"Table of Contents"** (dark active) | **"Book Notes"** (white inactive)
- Clickable chapter list: Cover, Title Page, Copyright, CONTENTS, 1 JOB HUNTING, etc.

### Texthelp Popup (word interaction)
- Double-click/tap a word → yellow highlight + floating toolbar
- Toolbar buttons: **Speak**, **Translate**, **Notes**, **Copy**
- Core vocabulary support interaction

---

## 3. Interactive Reader (`interactive-reader-bombdogs-*.png`)

### Layout
- **Full-bleed background image** fills entire viewport (topic-related photography)
- Background images change per slide/section
- **Text panel**: White card overlaid on left portion
- **Top bar**:
  - Left: "Save & Exit" button (dark pill with white text)
  - Center: Passage title (e.g., "Bomb Dogs: Canine Heroes")
  - Right: Accessibility icon + Audio player
- **Slide dots** at bottom center (10 dots for this passage)
- **Left/right arrows** on viewport edges (white circles)

### Audio Player (top right)
- Play/pause button
- Time display: current / total (e.g., "0:00 / 0:37")
- Scrubber bar (slider)
- Volume icon + volume slider
- Duration varies per slide (0:22, 0:25, 0:27, 0:37, 0:45)
- **Not present on summary slide**

### Slide Types

#### Reading Slide (`slide3.png`, `slide5.png`, `slide7.png`)
- White card on left side, ~40-50% viewport width
- **Section header** in bold (e.g., "Training a Bomb Dog", "Finding Explosives", "Work and Reward")
- Multiple paragraphs of passage text
- No interaction required, just reading
- "Reading Checkpoint" button appears at bottom (purple/indigo pill) — not visible on already-completed slides

#### Checkpoint: Drag & Drop (`slide1.png`, `slide4.png`, `slide8.png`)
- **Split layout**: Text card (left) + Question card (right)
- Right card shows:
  - Vocabulary definition/context (e.g., "The word that completes the sentence is *battlefields*.")
  - "Check Your Understanding" header
  - Instruction: "Drag and drop a word from the text to complete this sentence."
  - Fill-in-the-blank sentence with underline gap
  - Draggable word token in a bordered box below
- **Feedback variants**: "WAY TO GO! You correctly identified the word that completes the sentence."

#### Checkpoint: Highlight (`slide2.png`, `slide6.png`)
- **Split layout**: Text card (left) + Feedback card (right)
- Left card: Text with one or more sentences highlighted in **yellow**
- Highlighted sentence also shows in **bold italic** style
- Right card shows:
  - Skill name (e.g., "Make Inferences")
  - Feedback text explaining why the highlighted sentence is correct
- **Marker tools**: Three icons at bottom-right of question card (yellow marker, pink marker, eraser) — visible as small circular buttons
- **Feedback**: "YOU GOT IT! You correctly identified the sentence."
- **Multi-highlight**: Slide 6 shows TWO sentences highlighted simultaneously

#### Summary Writing Slide (`slide9.png`, `slide10.png`)
- **Split layout**: Writing area (left) + Instruction/Feedback (right)
- **Left panel**:
  - Instruction: "Write a summary of the text you have just read. Tap on the white space below to type your answer."
  - Large textarea (light background, blue border)
  - **"Get Feedback"** button (full-width, purple/indigo) — disabled until text entered
  - **"Submit Summary"** button (smaller, centered below) — disabled until text entered
- **Right panel**:
  - Two tabs: **"Instruction"** (white/active) | **"Feedback"** (dark)
  - Instruction content:
    - "In a summary, you use your own words to tell what a piece of writing is about..."
    - "The article you read was organized into four sections..."
    - Tips with **blue hyperlinked terms**:
      - "Write a **topic sentence**..." (topic sentence = blue link)
      - "Tell the **important ideas and details**..." (blue link)
      - "Use your own words. Don't copy sentences from the article."
  - Feedback tab: Shows auto-scored feedback after "Get Feedback" clicked
- **No audio player** on this slide
- Darker/moodier background image

### Passage Structure (Bomb Dogs: 10 slides)
1. Checkpoint (drag-drop: "battlefields")
2. Checkpoint (highlight: "Security companies train only calm and gentle dogs...")
3. Reading ("Training a Bomb Dog")
4. Checkpoint (drag-drop, completed)
5. Reading ("Finding Explosives")
6. Checkpoint (highlight: two sentences about training with scents)
7. Reading ("Work and Reward")
8. Checkpoint (drag-drop, appears same as slide 1 — may be review)
9. Summary writing
10. Summary writing (duplicate/continuation)

---

## 4. Assignments Tab (`assignments-*.png`)

### Layout
- "Assignments" header in dark rounded card with dashed border
- Pink-to-teal gradient background with constellation pattern

### Categories (expandable accordion, with count badges)
| Category | Count | Badge Color |
|----------|-------|-------------|
| Interactive Reading | 7 | Red (pending) |
| Study Plan | 1 | Red |
| Vocabulary, Word Study, and Reading Comprehension | 5 | Red |
| iPractice | 8 | Red |
| Writing | 0 | Green (complete) |
| Monitor Progress | 2 | Red |
| Information | 2 | Red |

### Category Contents

**Interactive Reading (7):**
- Bomb Dogs: Canine Heroes
- Turn It Down!
- Newspapers for Students
- Ready or Not: Learning from Weather Disasters
- Safer Energy
- Hidden Ads
- Apps for Health

**Vocabulary, Word Study, and Reading Comprehension (5):**
- Long Vowels CVCe
- Word Slam
- Phonics: Words with oa and ow
- Phonics Reader: Hobby Talk
- Word Slam (duplicate)

**iPractice (8):**
- Plan a Multimedia Presentation
- Write a Poem
- Elements of Drama
- Gather Information from Sources
- Rubric for a Multimedia Presentation
- 01/29/2026 Characteristics of Poetry
- 01/29/2026 Figurative Language, Images, and Descriptive Words
- 01/29/2026 Rubric for Presenting a Poem

**Monitor Progress (2):**
- GRADE Level A — Middle of the Year
- Reading Check 7

**Information (2):**
- Learning Objectives, Unit 3, Week 1
- Learning Objectives, Unit 5, Week 1

### Interaction
- Click category → expands to show items
- Click item → launches the relevant experience (e.g., Interactive Reader)
- Chevron (>) on each category row indicates expandable

---

## 5. Notebook Tab (`notebook-*.png`)

### Entry Animation
- Closed state: Skeuomorphic spiral-bound notebook with fingerprint scanner
- Press/click fingerprint → notebook opens with flip animation

### Notebook Shell
- **Spiral binding** along left edge (realistic metal coils)
- **Ruled lines** on pages (subtle horizontal lines)
- **5 color-coded tabs** on right edge (rotated text):
  - **Journal** (blue/teal)
  - **Word Bank** (dark blue)
  - **Class Notes** (orange)
  - **My Work** (yellow/gold)
  - **Resources** (red/salmon)

### Journal Tab (`notebook-journal.png`)
- **Left sidebar**:
  - "Notes" header (teal background)
  - Unit dropdown selector
  - Date-stamped entry list (e.g., "02/28 Because of Winn-Dix..")
- **Top toolbar**: Close (X), unit selector, delete (trash), add new (+)
- **Main area**:
  - Title field (text input)
  - Large multiline text area
  - Content persists per entry

### My Work Tab (`notebook-mywork-loaded.png`)
- **Left sidebar**: Units 1-7 as expandable accordion
  - Each unit contains: Lessons (e.g., "Lessons 1-5"), Benchmark Assessment(s), Weekly Reading Check(s)
- **Main area**:
  - Unit + lesson header (e.g., "Unit 1 Lessons 1-5")
  - Assignment rows with:
    - Title (e.g., "A Quiet Hero: The Story of Barbara Johns")
    - "View Feedback" button
    - Score (e.g., "29 / 36")
    - External link arrow icon

### Word Bank Tab
- Empty state with (+) button to add words
- Students collect vocabulary during reading

### Class Notes Tab
- "Saved Notes" panel
- Title + text area
- Organize and add new buttons

### Resources Tab
- Categories: Lesson Screens > Vocabulary (per unit/lesson), Whole Group Instruction, Routine Cards, Book Club, Standards
- Each resource has external link icon

---

## 6. Connect Tab (`connect-tab.png`)

### Layout
- Simple centered layout
- "Comments" header with refresh button
- Large outlined star graphic
- "You have **0** stars !!!" — gamification/reward system
- Teachers award stars for participation/achievement
- Teacher comments appear in this view

---

## 7. Review Tab

### Layout
- "Book Review" modal with gold/orange header
- Empty state: "No books available for review."
- "Done" button to dismiss
- Students write reviews after completing library books

---

## Technical Observations

### Architecture
- **iframe-heavy**: Each tab loads in a separate iframe (`library.html`, `assignment.html`, `notebook.html`, etc.)
- **jQuery-era**: DOM manipulation, no modern framework evident
- **Content delivery**: Images served from CloudFront CDN (`d3etodn1cqduev.cloudfront.net`)
- **Audio**: Pre-recorded per slide with specific durations
- **Word-level spans**: Every word in book text is wrapped in its own `<span>` for individual word interaction (texthelp features)

### Accessibility
- ARIA roles used (menubar, menuitem, navigation, complementary, etc.)
- Keyboard navigation documented in accessibility modal
- Live regions for dynamic content updates
- Button descriptions via aria-described-by

### Content URLs
- Book covers: `https://d3etodn1cqduev.cloudfront.net/content/ilit/ilit45ica/curriculum/g4/media/{hash}_cover_image.jpeg`
- Base URL: `https://production.classviewapi.com/webclient/`
- App pages: `App/library.html`, `App/assignment.html`, `App/notebook.html`, `App/student-connect.html`, `App/book_review.html`, `App/ebookplayer/player.html`
