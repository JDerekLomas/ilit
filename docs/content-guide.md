# Content Guide: Original vs. Replica

Where to find real content in the ClassView source, what we already have, and what's missing.

---

## Original ClassView Content Sources

### Book Catalog (837 books)

**File:** `docs/classview/Webclient/App/js/fetchbooklist.js` (15,187 lines)
**Duplicate:** `docs/classview/Webclient/App/js/libraryjson.js` (15,109 lines — 832 books)

**Format:** `var booklist = { "bookset": [{ ... }] }`

**Schema per book:**
```javascript
{
  "book_id": "e656505b4ac54784a4c7a07125e553cd",     // UUID
  "book_title": "I Died Here, BesTellers",
  "author_name": "George Shea",
  "book_image": "e656505b4ac54784a4c7a07125e553cd_cover_image.jpeg",
  "book_genre": "Short Stories,Fantasy,Thriller",       // comma-separated
  "book_path": "Content/library/",
  "no_of_page": 410,
  "lexile_level": 410,
  "book_desc": "A BAD DREAM COMES TRUE...",
  "category_id": "",
  "category_name": "",
  "book_type": "",
  "file_type": "epub",                                  // "epub" or "pdf"
  "word_count": 14500
}
```

**Stats:**
- 503 epub, 331 pdf
- Lexile range: 100–1440 (167 books have null Lexile)
- Top genres: Fiction (462), Adventure (287), Action (261), History (180), Mystery (165)
- Series: BesTellers, Fastback, Double Fastback, Pacemaker Classic, Adapted Classic, Interface Anthology

**Cover images:** NOT in codebase. Loaded from CDN: `{mediaPath}{book_id}_cover_image.jpeg`
**Page content:** 4 books embedded in `page_content.js`, rest via API (`GetBookPageContent()`)

### Lesson Content (1 example lesson)

**File:** `docs/classview/Webclient/App/js/lesson_json.js` (2,691 lines)

Contains a complete Grade 8 lesson: "Unit 1, Lesson 11"

**Structure:**
```javascript
{
  "lessionId": "b105b9e975e94772afbd370d8a2503bf",
  "itemDisplayName": "Unit 1, Lesson 11",
  "activities": {
    "vocab": { slides... },         // Vocabulary introduction
    "rata": { slides... },          // Read Aloud Think Aloud
    "passages": { slides... },      // 14 RATA passage slides from "Among the Hidden"
    "worktime": { slides... },      // Work Time activities
    "conversation": { slides... },  // Discussion
    "wrapup": { slides... }         // Wrap-up
  }
}
```

**Vocab words taught:** "unfurling", "sarcastic" (with Knowledge Check questions, examples, synonyms)
**RATA book:** "Among the Hidden" by Margaret Peterson Haddix (14 passage slides with audio files)

### Assignment Categories

**File:** `docs/classview/Webclient/App/js/assignment_category.js`

9 categories with aliases. See `docs/interactive-elements.md` for full list.

### Reading Skills Taxonomy

**File:** `docs/classview/Webclient/App/js/extraAssignments_info.js`

Grade 8 skill taxonomy:
- **Comprehension:** Make Inferences, Draw Conclusions, Use Context Clues, Visualize, Ask Questions, Make Connections, Identify Main Idea, Compare/Contrast, Author's Purpose, Author's Viewpoint, Predict, Generalizations, Fluency, Summarize, Cause & Effect, Evaluate, Acquire Vocabulary
- **Vocabulary:** Context Clues, Word Parts, Synonyms, Antonyms, Base Words, Word Associations, Shades of Meaning, Multiple-Meaning Words, Analogies, Suffixes, Prefixes, Affixes, Word Roots, Related Words

### Grade Assessment Score Tables

**Directory:** `docs/classview/Webclient/App/js/grade-assessment-score/` (10 files, grades 3–12)

Stanine score ranges for GRADE standardized assessment, by season (fall/spring/winter) and subtest.

### Teacher/Conference Data

**File:** `docs/classview/Webclient/App/js/conference_info.js`
- 10 preset conference notes ("Good progress", "Book too difficult", etc.)
- 5 comprehension levels (Inappropriate → Good)
- 15 guiding questions ("Why did you choose this book?", etc.)

**File:** `docs/classview/Webclient/App/js/buzz_info.js`
- 16 teacher quick-comment presets for Connect tab

### Library Genres & Review Presets

**In:** `docs/classview/Webclient/App/js/libraryview.js`
- 22 genre categories for filtering
- 26 preset book review comments ("I liked it", "It was exciting", "It was too hard to read", etc.)

### What's Only Available via API (not in codebase)

| Content | API Method |
|---------|-----------|
| Book page text (833/837 books) | `GetBookPageContent(pageId, bookId)` |
| Book cover images | CDN: `{mediaPath}{book_id}_cover_image.jpeg` |
| Assignment slide data | `GetAssignmentSlidesInfo(itemId, itemType)` |
| Lesson content (all but 1) | `GetAssignmentSlidesInfo()` |
| Student word bank entries | Per-student API storage |
| Student reading progress | `GetLibraryProgress()` |

---

## Our Replica Content Inventory

### Books — `content/books/` (5 complete, 3 missing)

| Book | File | Lexile | Genre | Status |
|------|------|--------|-------|--------|
| Dream of the Dead | `dream-dead.json` (19KB) | 600 | Mystery | COMPLETE — 3 chapters, 15 pages |
| Crash Dive | `crash-dive.json` (18KB) | 550 | Action | COMPLETE — 3 chapters, 15 pages |
| Jungle Jenny | `jungle-jenny.json` (20KB) | 500 | Adventure | COMPLETE — 2+ chapters, 15+ pages |
| Little Big Top | `little-big-top.json` (23KB) | 550 | Fiction | COMPLETE — 2+ chapters, 20 pages |
| The Prince and the Pauper | `prince-pauper.json` (15KB) | 650 | Classic | COMPLETE — 2+ chapters, 12 pages |
| Storm Chasers | cover only | — | — | MISSING content JSON |
| Robot Revolution | cover only | — | — | MISSING content JSON |
| Lost City | cover only | — | — | MISSING content JSON |
| Ocean Secrets | cover only | — | — | MISSING content JSON |

**Book JSON structure:**
```json
{
  "id": "dream-dead",
  "title": "Dream of the Dead",
  "author": "Sarah Blackwell",
  "coverImage": "/images/covers/dream-dead.jpg",
  "lexileLevel": 600,
  "genre": "Mystery",
  "summary": "...",
  "totalPages": 15,
  "chapters": [
    { "title": "Chapter 1", "pages": [
      { "pageNumber": 1, "text": "...", "image": "/images/illustrations/dream-dead-1.jpg" }
    ]}
  ]
}
```

### Interactive Reading Passages — `content/passages/` (3 complete)

| Passage | File | Lexile | Slides | Checkpoints |
|---------|------|--------|--------|-------------|
| Bomb Dogs: Canine Heroes | `bomb-dogs.json` (12KB) | 500 | 8 | highlight, drag-drop, summary |
| Turn It Down! | `turn-it-down.json` (8KB) | 600 | 7 | drag-drop, highlight, summary |
| Hidden Ads | `hidden-ads.json` (11KB) | 700 | 5+ | multiple-choice |

**Passage JSON structure:**
```json
{
  "id": "bomb-dogs",
  "title": "Bomb Dogs: Canine Heroes",
  "author": "I-LIT Staff",
  "lexileLevel": 500,
  "backgroundImage": "/images/passages/bomb-dogs-bg.jpg",
  "slides": [
    { "type": "reading", "heading": "...", "text": "..." },
    { "type": "checkpoint", "checkpoint": {
      "type": "highlight",
      "skill": "Make Inferences",
      "prompt": "Highlight the sentence that...",
      "correctAnswer": "...",
      "feedback": { "correct": "...", "incorrect": "..." }
    }},
    { "type": "summary", "summaryPrompt": "...", "expectedKeyConcepts": [...] }
  ]
}
```

### Vocabulary — `content/vocabulary/vocabulary.json` (15 words)

| Word | Passage | Image | Word Parts |
|------|---------|-------|------------|
| handler | bomb-dogs | YES | YES |
| explosive | bomb-dogs | no | YES |
| detect | bomb-dogs | no | no |
| alert | bomb-dogs | no | no |
| canine | bomb-dogs | no | no |
| decibel | turn-it-down | YES | YES |
| exposure | turn-it-down | no | YES |
| permanent | turn-it-down | no | no |
| damage | turn-it-down | no | no |
| frequency | turn-it-down | YES | YES |
| sponsor | hidden-ads | YES | no |
| influence | hidden-ads | no | no |
| persuade | hidden-ads | no | no |
| consumer | hidden-ads | no | YES |
| brand | hidden-ads | YES | no |

### Images — `public/images/` (46 files total)

| Category | Count | Status |
|----------|-------|--------|
| Book covers | 9 | All present (real artwork) |
| Book illustrations | 15 | All present, paired with content |
| Passage backgrounds | 13 | All present (bg + variants per passage) |
| Vocabulary images | 5 | 5/15 words have images |
| UI textures | 4 | Borders, backgrounds |

---

## Gap Analysis

### Content that needs authoring

| Gap | Priority | Notes |
|-----|----------|-------|
| 4 books need content JSON | HIGH | storm-chasers, robot-revolution, lost-city, ocean-secrets — covers exist, need story text |
| 10 vocabulary images | LOW | Only 5/15 words have images. Functional without them. |
| Additional IR passages | MEDIUM | Only 3 passages exist. Original had 7+ per grade band. |
| Study Plan assignments | LOW | Placeholder in assignments list |
| Word Study activities | LOW | Placeholder — word sort, word slam, phonics |
| iPractice assignments | LOW | Placeholder — multimedia, poem, drama |
| Monitor Progress tests | LOW | Placeholder — benchmark, reading check |
| Resources data | LOW | Notebook resources tab is empty categories |
| Teacher comments/stars | LOW | Connect tab is a stub |

### Content we could extract from ClassView source

| Content | Source File | Extractable? |
|---------|-----------|--------------|
| 837 book metadata entries | `fetchbooklist.js` | YES — titles, authors, Lexile, genres, descriptions |
| 22 genre categories | `libraryview.js` | YES |
| 26 book review presets | `libraryview.js` | YES |
| Reading skill taxonomy | `extraAssignments_info.js` | YES |
| 15 guiding questions | `conference_info.js` | YES |
| 16 teacher comment presets | `buzz_info.js` | YES |
| 1 complete lesson (G8 U1L11) | `lesson_json.js` | YES — vocab, RATA, activities |
| Grade assessment stanines | `grade-assessment-score/` | YES |

**NOT extractable** (API-only): Book page text (833 books), book covers, assignment slide data, student data.

---

## File Path Quick Reference

```
content/
  books/
    crash-dive.json          # Complete book
    dream-dead.json          # Complete book
    jungle-jenny.json        # Complete book
    little-big-top.json      # Complete book
    prince-pauper.json       # Complete book
  passages/
    bomb-dogs.json           # Complete IR passage
    hidden-ads.json          # Complete IR passage
    turn-it-down.json        # Complete IR passage
  vocabulary/
    vocabulary.json          # 15 words

public/images/
  covers/                    # 9 book covers
  illustrations/             # 15 book illustrations
  passages/                  # 13 passage backgrounds
  vocabulary/                # 5 vocabulary images
  textures/                  # UI assets

docs/classview/Webclient/App/js/
  fetchbooklist.js           # 837 book metadata entries
  libraryjson.js             # 832 book metadata (variant)
  lesson_json.js             # 1 complete lesson (G8 U1L11)
  assignment_category.js     # Assignment category definitions
  extraAssignments_info.js   # Reading skill taxonomy
  conference_info.js         # Teacher conference data
  buzz_info.js               # Teacher quick comments
  grade-assessment-score/    # Stanine tables (grades 3-12)
```
