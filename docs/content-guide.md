# Content Guide: Original vs. Replica

Where to find real content in the ClassView source, what we've extracted, and what's still missing.

---

## Extracted Content (ready to use)

All extracted content lives in `content/` and is importable by the Next.js app.

### Book Catalog — `content/book-catalog.json` (833 books)

Extracted from `fetchbooklist.js`. Full metadata for every book in the I-LIT library.

| Stat | Value |
|------|-------|
| Total books | 833 |
| Lexile range | 70–2020 |
| Books with Lexile | 667 |
| EPUBs | 503 |
| PDFs | 330 |
| Word count range | 108–655,500 |

**Schema per book:**
```json
{
  "book_id": "e656505b4ac54784a4c7a07125e553cd",
  "title": "I Died Here, BesTellers",
  "author": "George Shea",
  "cover_image": "e656505b4ac54784a4c7a07125e553cd_cover_image.jpeg",
  "genres": ["Short Stories", "Fantasy", "Thriller"],
  "lexile_level": 410,
  "description": "A BAD DREAM COMES TRUE...",
  "file_type": "epub",
  "word_count": 14500
}
```

**Top genres:** Fiction (465), Adventure (287), Action (261), History (180), Mystery (165), Short Stories (153)

**Series:** Adapted Texts (124), Interface Anthology (115), Pacemaker Classic (68), Fastback (63), Double Fastback (55), BesTellers (37)

**Note:** Cover images and page content are NOT in the codebase (API/CDN only). Use this catalog for the library carousel metadata.

### Genres — `content/genres.json` (444 unique tags)

All genre/category tags from the book catalog with frequency counts, sorted by popularity.

### Categories — `content/categories.json` (448 entries)

Category list from the original source's `categorylist` array.

### Embedded Books — `content/embedded-books/` (4 complete)

Full page-by-page content extracted from `page_content.js`. These are the only books with actual readable text.

| Book | Pages | Book ID |
|------|-------|---------|
| Big Dog and Dan | 16 | `ee5a668f53b24935846c1ca70076e35f` |
| Playground | 39 | `f7d64b7ac62b414abe192f7b60e384b8` |
| Flygirl | 37 | `e136925e10a44ea685230c8608945a66` |
| The Chronicles of Vladimir Tod: Ninth Grade Slays | 438 | `d6e4f8e92bd94fa79417a9ee734a3cb1` |

Each file has `pages[]` with `pageNumber`, `html` (original XHTML), and `textContent` (plain text).

### IWT Fixture Passages — `content/iwt-fixtures/` (4 passages)

Real Interactive Reading passages from the CMS Django fixtures, with slide content and checkpoint data.

| Passage | Level | Slides |
|---------|-------|--------|
| The Power to Move | 3 | 9 |
| Mentors Make a Difference | 2 | 7 |
| Having Friends, Making Choices | 1 | 9 |
| Cell Phones: Tools or Troublemakers? | 2 | 1 |

Slides include highlight checkpoints with correct answers, feedback text, and background image refs.

### Lesson — `content/lessons/g8-u1-l11.json`

Complete Grade 8, Unit 1, Lesson 11 with 8 activity types and 26 slides:
- **vocab** (4 slides) — "unfurling" and "sarcastic" with Knowledge Check polls
- **whole_group** (6 slides) — Related Words instruction
- **RATA** (4 slides + 14 passage slides) — "Among the Hidden" chapters 17-18
- **work_time** (7 slides) — Daily assignment, small group, conferencing
- **wrap_up**, **time_to_read**, **dailyassignment**, **classroom_conversations**

### Skills Taxonomy — `content/skills-taxonomy.json` (121 skills)

6 skill groups:
- **Reading Comprehension** (17): Make Inferences, Draw Conclusions, Use Context Clues, Visualize, etc.
- **Vocabulary** (17): Context Clues, Word Parts, Synonyms, Antonyms, Analogies, Word Roots, etc.
- **Writing** (4): Narrative, Explanatory/Informative, Argumentative, Opinion Pieces
- **Spelling** (35): Vowel patterns, consonant patterns, plurals, homophones, etc.
- **Grammar** (15): Nouns, Verbs, Sentence Structure, Punctuation, etc.
- **Phonics** (33): Digraphs, blends, syllable patterns, inflected endings, etc.

Includes color-coded score ranges (red 0-50, yellow 51-80, green 81-100).

### Assignment Categories — `content/assignment-categories.json` (13 categories)

All assignment types with names, aliases, and descriptions. Key categories:
- Interactive Reading (`iwt`), Study Plan (`studyplan`), iPractice (`dailyassignment`)
- Writing (`essay`/`paragraph`), Information (`nsa`), Sort (`interactive_sort`)
- Unit Benchmark Assessment, Weekly Reading Check, GRADE assessment

### Assessment Scores — `content/assessment-scores.json` (grades 3-12)

Stanine score ranges for GRADE standardized assessment. Each grade has fall/spring/winter seasons with form-a/form-b, covering sentence-comprehension, passage-comprehension, and vocabulary subtests.

### Teacher Presets — `content/teacher-presets.json`

- **10 conference notes**: "Good progress", "On track", "Book too difficult", etc.
- **5 comprehension levels**: Inappropriate (0) → Good (4)
- **15 guiding questions**: "Why did you choose this book?", "Tell me what this book is about so far.", etc.
- **12 speaking notes** + **11 listening notes** (for discussion rubrics)
- **16 quick comments** (Connect tab): "Excellent progress", "Great job today", "Please stay on task", etc.

### Review Presets — `content/review-presets.json` (26 presets)

Book review comment options: "I liked it", "It was exciting", "I couldn't put it down", "It captured my imagination", "It was too hard to read", etc.

### Interest Inventory — `content/interest-inventory.json`

Student reading survey (Beginning of Year / Middle of Year / End of Year). Questions like "Do you enjoy reading?", "How many books have you read?", genre preferences.

### Interest Areas — `content/interest-areas.json`

Reading interest category definitions used for book recommendations.

### Grade Band GLE — `content/grade-band-gle.json`

Grade Level Equivalent bands for assessment scoring.

---

## Pre-Authored Replica Content

### Books — `content/books/` (5 complete, 4 missing)

| Book | Lexile | Genre | Status |
|------|--------|-------|--------|
| Dream of the Dead | 600 | Mystery | COMPLETE — 3 chapters, 15 pages |
| Crash Dive | 550 | Action | COMPLETE — 3 chapters, 15 pages |
| Jungle Jenny | 500 | Adventure | COMPLETE — 2+ chapters, 15+ pages |
| Little Big Top | 550 | Fiction | COMPLETE — 2+ chapters, 20 pages |
| The Prince and the Pauper | 650 | Classic | COMPLETE — 2+ chapters, 12 pages |
| Storm Chasers | — | — | MISSING content JSON (cover exists) |
| Robot Revolution | — | — | MISSING content JSON (cover exists) |
| Lost City | — | — | MISSING content JSON (cover exists) |
| Ocean Secrets | — | — | MISSING content JSON (cover exists) |

### Interactive Reading Passages — `content/passages/` (3 complete)

| Passage | Lexile | Slides | Checkpoints |
|---------|--------|--------|-------------|
| Bomb Dogs: Canine Heroes | 500 | 8 | highlight, drag-drop, summary |
| Turn It Down! | 600 | 7 | drag-drop, highlight, summary |
| Hidden Ads | 700 | 5+ | multiple-choice |

### Vocabulary — `content/vocabulary/vocabulary.json` (15 words)

5 words per passage (bomb-dogs, turn-it-down, hidden-ads). 5/15 have images.

### Images — `public/images/` (46 files)

Book covers (9), illustrations (15), passage backgrounds (13), vocabulary images (5), UI textures (4).

---

## Gap Analysis

### What's still missing

| Gap | Priority | Notes |
|-----|----------|-------|
| 4 books need content JSON | HIGH | storm-chasers, robot-revolution, lost-city, ocean-secrets |
| Book cover images for catalog | HIGH | 833 books have metadata but no covers (CDN-only in original) |
| Book page text | HIGH | Only 4 embedded + 5 authored = 9 readable books out of 833 |
| Additional IR passages | MEDIUM | 3 authored + 4 from fixtures = 7 total. Original had many more. |
| 10 vocabulary images | LOW | 5/15 words have images |
| Study Plan assignments | LOW | Placeholder |
| Word Study activities | LOW | Placeholder — word sort, word slam, phonics |
| iPractice assignments | LOW | Placeholder |
| Monitor Progress tests | LOW | Placeholder |
| Resources data | LOW | Notebook resources tab is empty categories |

### What's NOT extractable (API-only in original)

| Content | API Method |
|---------|-----------|
| Book page text (829 remaining books) | `GetBookPageContent(pageId, bookId)` |
| Book cover images | CDN: `{mediaPath}{book_id}_cover_image.jpeg` |
| Assignment slide data | `GetAssignmentSlidesInfo(itemId, itemType)` |
| Lesson content (all but 1) | `GetAssignmentSlidesInfo()` |
| Student word bank entries | Per-student API storage |
| Student reading progress | `GetLibraryProgress()` |

---

## File Path Quick Reference

```
content/
  book-catalog.json              # 833 books — full metadata catalog
  genres.json                    # 444 genre tags with counts
  categories.json                # 448 category entries
  assignment-categories.json     # 13 assignment types with descriptions
  assessment-scores.json         # Stanine tables, grades 3-12
  skills-taxonomy.json           # 121 skills across 6 groups
  teacher-presets.json           # Conference notes, questions, quick comments
  review-presets.json            # 26 book review comment presets
  interest-inventory.json        # Student reading survey (BOY/MOY/EOY)
  interest-areas.json            # Reading interest categories
  grade-band-gle.json            # Grade Level Equivalent bands
  books/
    crash-dive.json              # Authored book (complete)
    dream-dead.json              # Authored book (complete)
    jungle-jenny.json            # Authored book (complete)
    little-big-top.json          # Authored book (complete)
    prince-pauper.json           # Authored book (complete)
  embedded-books/
    index.json                   # 4 books extracted from page_content.js
    ee5a6...076e35f.json         # Big Dog and Dan (16 pages)
    f7d64...e384b8.json          # Playground (39 pages)
    e1369...945a66.json          # Flygirl (37 pages)
    d6e4f...a3cb1.json           # Vladimir Tod: Ninth Grade Slays (438 pages)
  passages/
    bomb-dogs.json               # Authored IR passage (complete)
    hidden-ads.json              # Authored IR passage (complete)
    turn-it-down.json            # Authored IR passage (complete)
  iwt-fixtures/
    index.json                   # 4 IWT passages from CMS fixtures
    the-power-to-move.json       # Level 3, 9 slides
    mentors-make-a-difference.json # Level 2, 7 slides
    having-friends-making-choices.json # Level 1, 9 slides
    cell-phones-tools-or-troublemakers.json # Level 2, 1 slide
  lessons/
    g8-u1-l11.json               # Complete lesson (8 activities, 26 slides)
  vocabulary/
    vocabulary.json              # 15 vocabulary words

public/images/
  covers/                        # 9 book covers
  illustrations/                 # 15 book illustrations
  passages/                      # 13 passage backgrounds
  vocabulary/                    # 5 vocabulary images
  textures/                      # UI assets
```
