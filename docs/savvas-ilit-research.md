# Savvas I-LIT — Full Research & UI Documentation

## What is I-LIT?
Savvas I-LIT (Interactive Literacy Intervention) is a fully digital reading intervention program for struggling readers. Originally developed by Pearson, now published by Savvas Learning Company. Designed to accelerate reading growth by two years in a single school year.

### Variants
- **iLit 45**: Full 45-minute class period intervention, Grades 6+
- **iLit ELL**: For English Language Learners, Grades 4-12
- **iLit 20**: Supplemental 15-20 min daily, Grades 6+

### Target: Grades 4-8 middle school struggling readers for our build

---

## App Structure (from screenshots)

### Bottom Navigation (5 tabs)
1. **Review** — eye icon
2. **Library** — book icon (default view)
3. **Notebook** — notepad icon (journal/writing)
4. **Assignments** — checkbox icon
5. **Connect** — star icon

### Assignments View
Dark header card "Assignments" on gradient background (pink-to-teal with network/constellation pattern).

Categories (expandable, with count badges):
- **Interactive Reading** (7) — red badge = pending
- **Study Plan** (1)
- **Vocabulary, Word Study, and Reading Comprehension** (5)
- **iPractice** (8)
- **Writing** (0) — green badge = complete
- **Monitor Progress** (2)
- **Information** (2)

Expanding "Interactive Reading" reveals passage titles:
- Bomb Dogs: Canine Heroes
- Turn It Down!
- Newspapers for Students
- Ready or Not: Learning from Weather Disasters
- Safer Energy
- Hidden Ads
- Apps for Health

---

## Interactive Reader (Core Reading Experience)

### Layout
- **Full-bleed background image** fills the entire viewport (related to passage topic)
- **Text panel**: White card overlaid on the left portion of the screen
- **Slide-based navigation**: Dot indicators at bottom center, left/right arrow buttons on edges
- **Top bar**:
  - Left: "Save & Exit" button (blue/purple pill)
  - Center: Passage title (e.g., "Bomb Dogs: Canine Heroes")
  - Right: Accessibility icon + Audio player (play button, time 0:00/0:37, scrubber, volume icon)

### Reading Slides
- Text displayed in a white card with generous padding
- Large, readable serif-like font
- Multiple paragraphs per slide
- At bottom of text card: **"Reading Checkpoint"** button (purple/indigo pill)
- Clicking advances to checkpoint interaction

### Reading Checkpoint — Highlight Interaction
- **Split view**: Text card (left) + Question card (right)
- Question card shows:
  - **Skill name** in bold (e.g., "Make Inferences")
  - **Prompt text** (e.g., "You can infer from this passage that some dogs do not have the right personality to become bomb dogs. Highlight the sentence that supports this inference.")
- **Text card** becomes interactive — each sentence is independently selectable
- **Highlighter tools**: Two marker icons at bottom of question panel (yellow and pink)
- Student clicks a sentence → it gets highlighted with dashed blue outline (selecting), then solid yellow/pink highlight (confirmed)
- **"Save & Continue"** button appears

### Feedback States
- **Correct**: "YOU GOT IT! You correctly identified the sentence." — bold header, simple text
- **Incorrect**: Corrective feedback (not captured in screenshots but documented in research)
- Highlighted sentence stays visible with yellow highlight after correct answer

### Checkpoint Types (from accessibility instructions)
1. **Highlight slides**: Select markers/eraser, navigate sentences, select sentence
2. **Drag & Drop slides**: Navigate words, drop words, Alt+arrow to move between panels

### Audio Player
- Play/pause button
- Time display: current / total (e.g., "0:00 / 0:37")
- Scrubber bar
- Volume/speaker icon
- Each slide has its own audio duration

### Summary Writing Slide (final slide of passage)
- **Split layout** like checkpoints but different content
- **Left panel** (white card):
  - Instruction text: "Write a summary of the text you have just read. Tap on the white space below to type your answer."
  - **Large textarea** with blue border (light blue/lavender background)
  - **"Get Feedback"** button below textarea (full-width, purple/indigo)
  - **"Submit Summary"** button below that (smaller, purple/indigo, centered)
- **Right panel** (white card with dark header area):
  - **Two tabs**: "Instruction" (white/light) | "Feedback" (dark/active)
  - **Instruction tab content**:
    - "In a summary, you use your own words to tell what a piece of writing is about. A summary is shorter than the original text. It only contains the most important ideas."
    - "The article you read was organized into four sections. Here are tips for summarizing each section of the article:"
    - Bullet: "Write a **topic sentence** that tells what the paragraph or group of paragraphs is about." (topic sentence is a blue hyperlink)
    - Bullet: "Tell the **important ideas and details** you learned from that section. Leave out less important details." (important ideas and details is a blue hyperlink)
    - Bullet: "Use your own words. Don't copy sentences from the article."
  - **Feedback tab**: Shows auto-scored feedback after "Get Feedback" is clicked
- Background: Darker full-bleed image with watermarked/faded text overlay
- Dot indicators show this as second-to-last slide in sequence

### UX Flow Summary
1. Open passage from Assignments
2. Slides 1-N: Reading text with background images
3. Some slides have "Reading Checkpoint" button → opens split view with highlight/drag-drop question
4. Student answers → immediate feedback ("YOU GOT IT!" or corrective)
5. Continue through remaining reading slides
6. Final slide: Summary writing (textarea + instruction/feedback panels)
7. "Get Feedback" → auto-scored feedback appears in Feedback tab
8. "Submit Summary" → saves and returns
9. "Save & Exit" available at any point → returns to dashboard with progress saved

---

## Digital Library

### Library View
- **Dark background** (near black)
- **Top filter bar**:
  - Left group: All Titles | My Level | My Books (segmented control)
  - Right group: Recommended | Reviewed | Reserved (segmented control)
  - Search icon (magnifying glass) far right
- **Book carousel**: Horizontal row of book covers with 3D perspective tilt
  - Selected book is centered and enlarged/popped forward
  - Adjacent books tilt away at angles
  - Visible books from demo: various fiction titles
- **Below carousel**: Selected book title + author (large white text, centered)
- **Three cards below**:
  - Left: "Read Aloud Think Aloud" book cover + label (e.g., "Because of Winn-Dixie")
  - Center: **Progress card** (dark background) showing:
    - Total Words: 8,128
    - Total Pages: 28
    - Total Books: -
    - IR Lexile Level: 900
  - Right: "My Current Reading" book cover + label

### Library Books Visible
- Little Big Top (Doris Hiller) — selected in demo
- The Prince and the Pauper (Mark Twain)
- The Last Book in the Universe (Rodman Philbrig)
- Jungle Jenny
- Dream of the Dead
- Crash Dive
- The Ransom of Red Chief

---

## Library Book Reader

### Visual Design
- **Wood-textured background** (warm brown planks/panels)
- **Book frame**: Rounded rectangle with subtle **blue/cyan glow border**
- Content area is white/cream inside the frame
- **Two-column text layout** (left and right columns, like a real book spread)

### Top Toolbar
- **Left**: Back arrow + Table of Contents list icon
- **Center**: Book title in white caps (e.g., "LITTLE BIG TOP")
- **Right toolbar icons** (left to right):
  - Accessibility (person icon)
  - Read-aloud (speech bubble / speaker icon)
  - Annotation pen (pencil icon)
  - **"Aa"** button (font size, bordered pill)
  - **"Translate"** button (bordered pill)

### Text Display
- **Serif font** (similar to Georgia/Times), justified text
- **Chapter headers**: "CHAPTER 2" (small) + "A CANDY BUTCHER" (bold small caps)
- Generous line height and paragraph spacing
- **Inline illustrations**: Black and white drawings positioned within text flow

### Navigation
- **Left/right arrows**: Circular buttons on viewport edges (semi-transparent)
- **Page slider**: Bottom bar spanning full width, with page range indicator (e.g., "25-26" in a pill)
- Draggable to scrub through book

### Table of Contents Panel
- Two tabs: **"Table of Contents"** (active, dark bg) | **"Book Notes"** (inactive, white bg)
- Chapter list with numbered entries:
  - Cover, Title Page, Copyright, CONTENTS
  - 1 JOB HUNTING, 2 A CANDY BUTCHER, 3 FATIMA FLAME, etc.

### Accessibility Modal
- White overlay with keyboard navigation instructions
- Tab to switch paragraphs, W for first word, arrow keys for words
- P to select paragraph, Tab/Shift+Tab for next/prev paragraph
- Space to highlight and open texthelp options
- A to open annotation pen

---

## Vocabulary System

### Vocabulary Card (modal/popup)
- **Word** displayed large in green/teal color at top
- **Example sentence** with the word in bold italic + contextual photo
  - e.g., "Joey made a *decision* to have pizza for lunch." + photo of students choosing food
- **Word parts breakdown** at bottom:
  - `decide` (base word) + `-ion` (suffix) = `decision` (word)
  - Labels: "base word", "suffix", "word"
- Close button (X) in top right

### Vocabulary Navigation
- Left sidebar: Unit/Lesson tree structure
  - Lesson Screens > Vocabulary > Unit 1 Lessons 1-5, Unit 2 Lessons 1-5, etc.
  - Active lesson highlighted in orange/red
  - Whole Group Instruction, Routine Cards, Book Club, Standards sections
- Main area: List of vocabulary items (e.g., "2.4.18 Vocabulary 1", "2.4.18 Vocabulary 2")
- Launch arrows on right side of each item

### Right Side Tabs (vertical, colored)
- **Journal** (red tab)
- **Word Bank** (blue tab)
- **Class Notes** (orange tab)
- **My Work** (yellow/gold tab)
- **Resources** (green tab)

---

## Visual Design System

### Colors
- **Primary accent**: Purple/indigo (#5B5FC7 ish) — used for Interactive Reader buttons
- **Background gradients**: Pink-to-teal (dashboard), dark (library), wood texture (book reader)
- **Text**: White on dark backgrounds, dark on white cards
- **Badges**: Red circles for pending counts, green for complete (0)
- **Vocabulary**: Green/teal for word display
- **Highlights**: Yellow and pink marker colors
- **Book reader glow**: Cyan/blue border

### Typography
- **Reading text**: Large serif font, generous spacing
- **UI text**: Sans-serif
- **Headings**: Bold, sometimes small caps (chapter titles)

### Layout Patterns
- **Full-bleed imagery** for Interactive Reader
- **Card overlays** for text content
- **Split view** for checkpoint interactions
- **Book metaphor** for library reader (wood, frame, two columns)
- **Bottom tab navigation** for student hub
- **Slide-based** with dot indicators for Interactive Reader
- **Page-based** with slider for Library Reader

### Responsive
- Designed tablet-first (iPad landscape appears to be primary)
- Works in browser at various sizes

---

## Workshop Model (Daily Lesson Structure — 45 min)
1. **Time to Read** — Independent reading from digital library
2. **Vocabulary** — Teacher-led word study
3. **Read Aloud, Think Aloud** — Teacher models with grade-level anchor text
4. **Classroom Conversation** — Structured discussion
5. **Whole Group** — Explicit instruction
6. **Work Time** — Interactive Reader, study plans, journal writing
7. **Wrap-Up** — Closure

## Key I-LIT Concepts
- **9 Lexile Level Bands** (100-1400) — students placed by GRADE diagnostic
- **Levels adjust every 1-2 weeks** based on checkpoint/summary performance
- **Staircase model**: Text complexity increases within each band over the year
- **Goal**: 2 grade levels of reading growth in 1 year
