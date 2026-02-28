# I-LIT: Reading Intervention App — Implementation Plan

## Context
Build a web-based reading intervention app inspired by Savvas I-LIT, targeting grades 4-8 struggling readers. The app recreates two core experiences: the **Interactive Reader** (adaptive nonfiction passages with embedded comprehension checkpoints) and the **Digital Library** (browsable leveled book collection). All content is static/pre-authored. No AI API dependency.

## Tech Stack
- **Next.js 15** with App Router, TypeScript
- **Tailwind CSS v4** for styling
- **Framer Motion** for transitions/animations
- **localStorage** for student progress (no backend for MVP)
- **Web Speech API** for text-to-speech
- **Vercel** for deployment

## Architecture Overview

```
/app
  /page.tsx                    — Login/student select screen
  /dashboard/page.tsx          — Student hub (bottom nav shell)
  /dashboard/library/page.tsx  — Digital library (book carousel + filters)
  /dashboard/assignments/page.tsx — Assignment categories
  /dashboard/notebook/page.tsx — Journal/writing
  /reader/[bookId]/page.tsx    — Library book reader
  /interactive/[passageId]/page.tsx — Interactive Reader
/components
  /ui/                         — Shared UI (buttons, cards, modals)
  /reader/                     — Library reader components
  /interactive/                — Interactive reader components
  /dashboard/                  — Dashboard shell, bottom nav
/content
  /passages/                   — Interactive Reader JSON files
  /books/                      — Library book JSON files
  /vocabulary/                 — Vocabulary card data
/lib
  /progress.ts                 — localStorage progress tracking
  /types.ts                    — TypeScript types
  /content.ts                  — Content loading utilities
```

---

## Phase 1: Project Scaffolding

**Files:**
- `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`
- `vercel.json` — `{"deploymentProtection":{"deploymentType":"none"}}`
- `app/layout.tsx` — Root layout with fonts (serif for reading, sans for UI)
- `app/globals.css` — Tailwind imports + custom reading typography
- `lib/types.ts` — All TypeScript interfaces

**Key types:**
```ts
interface Passage {
  id: string
  title: string
  author: string
  lexileLevel: number
  backgroundImage: string
  slides: Slide[]
}

interface Slide {
  type: 'reading' | 'checkpoint' | 'summary'
  text: string
  audioUrl?: string
  audioDuration?: number
  checkpoint?: Checkpoint
}

interface Checkpoint {
  type: 'highlight' | 'drag-drop' | 'multiple-choice'
  skill: string           // "Make Inferences", "Main Idea", etc.
  prompt: string
  correctAnswer: string | string[]
  feedback: { correct: string; incorrect: string }
}

interface Book {
  id: string
  title: string
  author: string
  coverImage: string
  lexileLevel: number
  genre: string
  pages: BookPage[]
}

interface BookPage {
  pageNumber: number
  text: string
  image?: string
}

interface StudentProgress {
  currentLexile: number
  totalWords: number
  totalPages: number
  totalBooks: number
  completedPassages: string[]
  bookProgress: Record<string, number>  // bookId -> last page
  highlights: Record<string, Highlight[]>
  bookReviews: Record<string, BookReview>
}
```

---

## Phase 2: Interactive Reader (Core Experience)

This is the centerpiece. Slide-based navigation with full-bleed background images.

### Components

**`/app/interactive/[passageId]/page.tsx`**
- Loads passage data from `/content/passages/`
- Manages slide index, checkpoint state, progress
- Renders current slide with transitions

**`/components/interactive/InteractiveShell.tsx`**
- Full-screen layout: background image fills viewport
- Top bar: "Save & Exit" (left), title (center), audio player (right)
- Left/right arrow navigation
- Dot indicators at bottom
- Slide content area (centered cards)

**`/components/interactive/ReadingSlide.tsx`**
- White card on left side over background image
- Renders passage text with selectable sentences
- "Reading Checkpoint" button at bottom (purple/indigo)
- Text-to-speech integration via audio player

**`/components/interactive/CheckpointSlide.tsx`**
- Split layout: text card (left) + question card (right)
- Question card shows skill name ("Make Inferences") + prompt
- Renders interaction based on checkpoint type

**`/components/interactive/HighlightCheckpoint.tsx`**
- Text is broken into sentences, each clickable
- Two marker tools (yellow, pink) at bottom of question panel
- Selected sentence gets highlighted with chosen color
- "Save & Continue" button
- On submit: shows "YOU GOT IT!" or corrective feedback

**`/components/interactive/DragDropCheckpoint.tsx`**
- Draggable word/phrase tokens
- Drop zones in the question panel
- Touch-friendly (touch drag support)

**`/components/interactive/MultipleChoiceCheckpoint.tsx`**
- Standard A/B/C/D radio buttons
- Immediate feedback on selection

**`/components/interactive/SummarySlide.tsx`**
- Split layout matching checkpoint pattern:
- **Left card**: Instruction text ("Write a summary...") + large textarea (blue border, lavender bg) + "Get Feedback" button (full-width purple) + "Submit Summary" button (smaller purple below)
- **Right card**: Two tabs — "Instruction" | "Feedback"
  - Instruction tab: Explains what a summary is, tips (write topic sentence, tell important ideas, use own words). Key terms are blue hyperlinks that could show definitions.
  - Feedback tab: Shows auto-scored feedback after "Get Feedback" clicked. Pre-authored feedback based on keyword matching (simple rubric checking for key concepts from the passage)
- "Get Feedback" can be clicked multiple times to revise before final "Submit Summary"

**`/components/interactive/AudioPlayer.tsx`**
- Play/pause, scrubber, time display (0:00 / 0:37), volume
- Uses Web Speech API for TTS (no pre-recorded audio needed for MVP)

### UX Flow
1. Student opens passage from Assignments
2. Slide 1: Title slide with background image + intro text
3. Slides 2-N: Reading slides with text panels. Some have "Reading Checkpoint" button
4. Clicking "Reading Checkpoint" transitions to split view (text + question)
5. Student answers, gets immediate feedback
6. Continue through remaining slides
7. Final slide: Summary writing
8. "Save & Exit" returns to dashboard, progress saved

---

## Phase 3: Digital Library

### Components

**`/app/dashboard/library/page.tsx`**
- Top filter bar: All Titles | My Level | My Books || Recommended | Reviewed | Reserved + search
- Book carousel (3D perspective tilt, selected book centered and enlarged)
- Below carousel: selected book title + author
- Three cards: Read Aloud Think Aloud (left), Progress stats (center), My Current Reading (right)

**`/components/dashboard/BookCarousel.tsx`**
- Horizontal scrollable row of book covers
- CSS perspective transform for 3D tilt effect
- Click to select, selected book pops forward
- Filtered by active tab

**`/components/dashboard/ProgressCard.tsx`**
- Dark card showing: Total Words, Total Pages, Total Books, IR Lexile Level
- Data from localStorage

**`/app/reader/[bookId]/page.tsx`**
- Full-screen reader with wood-textured background
- Book-frame container with blue glow border
- Two-column text layout inside the frame
- Page navigation (arrows + slider)

**`/components/reader/ReaderShell.tsx`**
- Wood background texture (CSS gradient or subtle pattern)
- Book frame: rounded corners, subtle shadow, blue/cyan border glow
- Top bar: back + TOC icon (left), title (center), tools (right)

**`/components/reader/ReaderToolbar.tsx`**
- Accessibility button (person icon)
- Read-aloud button (speaker icon) — triggers Web Speech API
- Annotation pen toggle
- "Aa" font size popup (small/medium/large)
- "Translate" button (placeholder for MVP)

**`/components/reader/BookPage.tsx`**
- Two-column text layout with justified serif text
- Chapter headers (bold, small caps)
- Inline images
- Sentence-level highlighting when annotation mode is active

**`/components/reader/TableOfContents.tsx`**
- Slide-out panel with two tabs: Table of Contents / Book Notes
- Chapter list, clickable to jump

**`/components/reader/PageSlider.tsx`**
- Bottom slider showing current page range (e.g., "25-26")
- Draggable to scrub through book

---

## Phase 4: Student Dashboard & Navigation

**`/app/dashboard/layout.tsx`**
- Bottom navigation bar (fixed): Review, Library, Notebook, Assignments, Connect
- Each tab renders its page content above the nav
- Gradient background (pink-to-teal, matching Savvas aesthetic)

**`/app/dashboard/page.tsx`**
- Redirects to /dashboard/library (Library is the default view)

**`/app/dashboard/assignments/page.tsx`**
- "Assignments" header in dark rounded card
- Expandable category list:
  - Interactive Reading (count badge, red for pending)
  - Study Plan
  - Vocabulary, Word Study, and Reading Comprehension
  - iPractice
  - Writing (green badge when 0 = complete)
  - Monitor Progress
  - Information
- Clicking a category expands to show individual items
- Clicking an item launches the Interactive Reader or relevant view

**`/app/dashboard/notebook/page.tsx`**
- Journal entries list
- Writing prompts
- Simple text editor

**`/app/page.tsx`** (Login)
- Simple student name entry (no real auth for MVP)
- Stores student name in localStorage
- Redirects to dashboard

---

## Phase 5: Sample Content

Create 3 complete Interactive Reader passages with checkpoints:

1. **"Bomb Dogs: Canine Heroes"** (Lexile ~500) — 10 slides, 2 highlight checkpoints, 1 summary
2. **"Turn It Down!"** (Lexile ~600) — About noise/hearing, 8 slides, 1 drag-drop, 1 highlight, 1 summary
3. **"Hidden Ads"** (Lexile ~700) — About advertising to teens, 10 slides, 2 checkpoints, 1 summary

Create 5 library books (shorter, excerpted):
1. "Little Big Top" by Doris Hiller — fiction, circus story, ~30 pages
2. "The Prince and the Pauper" (adapted) — classic fiction, ~20 pages
3. "Jungle Jenny" — adventure fiction, ~25 pages
4. "Dream of the Dead" — mystery, ~20 pages
5. "Crash Dive" — action, ~15 pages

All content will be original/public domain to avoid copyright issues. Stored as JSON in `/content/`.

---

## Phase 6: Vocabulary System

**`/components/interactive/VocabularyCard.tsx`**
- Word displayed large in green/teal
- Example sentence with word italicized + contextual image
- Word parts breakdown: base word + suffix/prefix = full word
- Dismiss with X button

**`/content/vocabulary/`**
- JSON files per unit/lesson group
- Each entry: word, definition, example sentence, image URL, word parts

---

## Phase 7: Polish & Deploy

- Responsive design verification (tablet-first, works on desktop)
- Keyboard accessibility (tab navigation for checkpoints)
- Loading states and transitions (Framer Motion)
- Error boundaries
- `npx tsc --noEmit` pass
- `vercel --prod` deploy

---

## Verification Plan

1. **Login flow**: Enter student name → lands on Library tab
2. **Library**: Browse books, filter by level, see progress stats
3. **Book Reader**: Open a book → navigate pages, use TTS, toggle font size, view TOC
4. **Assignments**: See assignment categories with counts, expand Interactive Reading
5. **Interactive Reader**: Open passage → read slides → hit Reading Checkpoint → highlight correct sentence → get "YOU GOT IT!" → continue → write summary → Save & Exit
6. **Progress**: After completing a passage, progress stats update (words, pages, Lexile)
7. **Mobile/Tablet**: Test at 768px and 1024px widths — UI remains usable
