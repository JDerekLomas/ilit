# Interactive Elements Reference

Comprehensive documentation of all interactive elements in the original Savvas I-LIT app, extracted from the ClassView source code.

Source files: `docs/classview/Webclient/App/` (gitignored, local only)
Key file: `js/assignments.js` (36,206 lines — the master assignment engine)

---

## Assignment Categories

From `constants.js`, the app has 9 assignment categories:

| # | Category | Alias | Description |
|---|----------|-------|-------------|
| 1 | **Interactive Reading** | `iwt` | Nonfiction passages with inline checkpoints |
| 2 | **Study Plan** | `studyplan` | Pre/practice/post-test bundles |
| 3 | **Vocabulary, Word Study, and Academic Texts** | — | Phonics, word sort, word slam, FRS |
| 4 | **iPractice** | `dailyassignment` | Daily practice work |
| 5 | **Writing** | `essay`/`paragraph` | Essay and paragraph assignments |
| 6 | **Monitor Progress** | — | Unit benchmarks, WRC, grade assessments |
| 7 | **Information** | `nsa` | Non-scoreable informational assignments |
| 8 | **Current Reading** | `cr` | Active book reading |
| 9 | **Current Read Aloud Think Aloud** | `crata` | Guided oral reading |

---

## Interactive Reading (IWT) Slide Types

These are the core interactive slides embedded within reading passages. Each passage contains a sequence of slides mixing reading content with checkpoints.

### 1. Reading Slide (passage text)

Plain reading content displayed to the student. May include:
- Background image
- Passage text (HTML formatted)
- "Reading Checkpoint" button to trigger the next interactive element

### 2. Highlight Slide (`iwthighlightslide`)

**Purpose:** Student highlights specific words or sentences in the passage.

**Data structure:**
```json
{
  "type": "iwthighlightslide",
  "interactive_text": "<p>The passage text with HTML...</p>",
  "single_word_highlight": true,
  "highlights": [
    { "color": "y", "index": 42, "length": 15 }
  ],
  "question": "Highlight the main idea in this paragraph.",
  "pass_text": "Correct! That's the main idea.",
  "fail_text": "Try again. Look for the sentence that...",
  "fail_again_text": "The correct answer is highlighted.",
  "background_image": "path/to/image.jpg"
}
```

**UI components:**
- Reading text with selectable words/sentences
- Highlight color buttons (yellow, red, eraser)
- "Reading Checkpoint" button to reveal the question
- Right-side feedback panel (pass/fail messages)
- "Save and Continue" button

**Key CSS classes:** `.highlight`, `.highlight_fail_text`, `.highlight_pass_text`

**Behavior:**
- `single_word_highlight: true` — individual words are selectable
- `single_word_highlight: false` — whole sentences are selectable
- Correct highlights matched by character `index` + `length`
- Color `"y"` = yellow, `"r"` = red

### 3. Drag-and-Drop Slide (`iwtdndslide`)

**Purpose:** Student drags word tiles into correct positions (fill-in-the-blank, categorization).

**Data structure:**
```json
{
  "type": "iwtdndslide",
  "interactive_text": "<p>Text with drag/drop zones...</p>",
  "questions": [
    {
      "question": "Drag the correct word to complete the sentence.",
      "index": 5,
      "length": 8
    }
  ],
  "pass_text": "Well done!",
  "fail_text": "Not quite. Try again.",
  "fail_again_text": "The correct answer has been placed.",
  "background_image": "path/to/image.jpg"
}
```

**UI components:**
- Left side: draggable word tiles in a bank (`.draggable_area`, `.draggable_word`)
- Right side: drop zones (`.dropbox`)
- jQuery UI `draggable()` + `droppable()` for interaction
- Keyboard accessible: TAB between zones, CTRL+arrow to move tiles

**Key files:**
- `assignments.js` — rendering and scoring
- `assignment_accessibility.js` — keyboard/a11y support (`IWTDndSlide.handleKeydown()`)

### 4. Text Answer Slide (`iwttextanswerslide`)

**Purpose:** Student writes a short text response.

**Data structure:**
```json
{
  "type": "iwttextanswerslide",
  "static_text": "<p>Display text above the input...</p>",
  "interactive_text": "<p>Or interactive text...</p>",
  "question": "What is the author's purpose?",
  "pass_text": "Thank you for your response.",
  "background_image": "path/to/image.jpg"
}
```

**UI components:**
- Display area showing the prompt (static_text OR interactive_text OR question)
- Textarea input for student response
- "Submit" button
- Always shows `pass_text` on submit (no wrong answer — it's open-ended)

### 5. Summary Slide (`iwtsummaryslide`)

**Purpose:** Student writes a summary of the passage. Optionally scored by PKT (Pearson Knowledge Technologies).

**Data structure:**
```json
{
  "type": "iwtsummaryslide",
  "question": "Write a summary of the passage.",
  "text": { "text": "Instructions for the summary..." },
  "background_image": "path/to/image.jpg"
}
```

**UI components:**
- Left: large textarea for summary writing
- Right: tabbed panel with "Instructions" and "Feedback" tabs
- "Get Feedback" button (calls PKT API for automated scoring)
- "Submit Summary" button
- Optional: Email/Print buttons

**Key class:** `IwtsSummaryView` in `assignments.js` (lines 11117-12602)
- `IwtsSummaryView.iMultiplyingFactor = 3` — scoring multiplier
- `IwtsSummaryView.submitSummary()` — submit handler
- `IwtsSummaryView.getFeedbackCall()` — PKT API integration

### 6. Multiple Choice Slide (`multiplechoiceslide`)

**Purpose:** Standard multiple choice comprehension question.

**UI components:**
- Question text
- Radio button answer options
- Submit button
- Correct/incorrect feedback

**Key class:** `MultipleChoiceView` in `assignments.js` (line 10938+)

### 7. Multiple Choice with Passage (`multichoicepassageslide`)

Same as multiple choice but displays a passage excerpt alongside the question for reference.

---

## Word Study Slide Types

These appear in the "Vocabulary, Word Study, and Academic Texts" category.

| Slide Type | Description |
|-----------|-------------|
| `phonictextbasedslide` | Phonics practice with text |
| `extendedphonic` | Extended phonics exercises |
| `pluralnouns` | Plural noun formation |
| `digraphs` | Digraph identification |
| `word_families` | Word family grouping |
| `syllables` | Syllable counting/breaking |
| `word_sort` | Word categorization sort |
| `word_slam` | Fast-paced word recognition |
| `sortdndcombinedslide` | Combined sort + drag-and-drop |

### Word Their Way (Interactive Sort)

**File:** `assignment_wtw.js` (2,521 lines)

**Data structure:**
```json
{
  "type": "word_sort_type",
  "answers": {
    "1": {
      "text": "word text",
      "small_image": "path/to/image",
      "example": "0"
    }
  }
}
```

**Rules:**
- Max 5 questions per slide
- Max 35 tiles in the tile bank
- Tiles can have images (for visual vocabulary)
- Example tiles (marked `"example": "1"`) are pre-placed

---

## Fluent Reading System (FRS)

**File:** `assignments_frs.js` (4,102 lines)

Fill-in-the-blank with dropdown options for reading fluency practice.

**Data structure:**
```json
{
  "questions": {
    "0": {
      "drop_options": [
        {
          "prefix": "text before blank",
          "suffix": "text after blank",
          "answer": ["correct_answer_1", "correct_answer_2"]
        }
      ]
    }
  }
}
```

Also includes oral fluency recording integration (microphone).

---

## eBook Reader

**Directory:** `docs/classview/Webclient/App/ebookplayer/`
**Main file:** `player.html`

### Features
- Two-page spread layout with wooden texture frame + cyan border
- Word-level clickable elements (each word wrapped in `<span>`)
- Page slider navigation (e.g., "Page Number 13-14" of 137)

### Toolbar
| Button | Function |
|--------|----------|
| Back | Return to library |
| Table of Contents | Side panel with chapter list + book notes |
| Accessibility | Keyboard navigation instructions |
| Screen Mask | Masks part of screen to reduce visual distraction |
| Annotation Pen | Strikethrough, cyan/magenta/green highlight, remove, collect |
| Resize Font (Aa) | Font size adjustment |
| Translate | 100+ languages (Spanish default) |

### Texthelp Integration
Double-click a word/paragraph to get a floating toolbar:
- **Speak** — text-to-speech
- **Translate** — inline translation
- **Notes** — add annotation
- **Copy** — copy text

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| TAB | Navigate paragraphs |
| W | Navigate words |
| Arrow keys | Move within elements |
| Space | Highlight + open texthelp |
| A | Open annotation tools |

### Key Files
- `script/common.js` (3,683 lines) — Core player logic
- `style/style.css` (710 lines) — Player styles
- `textHelp/` — Platform-specific TTS/texthelp implementations (Windows, iOS)

---

## Student Attempt Data Model

How student responses are stored:

```javascript
{
  "itemSlides": [
    {
      "slideID": 1,
      "slideType": "iwtdndslide",
      "slideInputData": {
        "questionId": "q123",
        "answers": [...]      // DnD: positions, Highlight: ranges, Text: string
      },
      "slideAttempt": 1,
      "slideScore": 100,
      "isComplete": true
    }
  ]
}
```

For summary slides:
```javascript
{
  "slideInputData": {
    "summary": "URL-encoded student summary text"
  }
}
```

---

## Assignment Routing Logic

From `assignments.js`, the slide type determines which view class renders:

```
assignmentType → slide rendering class:
  IWTS → IwtsSummaryView | IWTDndSlide | IWTHighlightSlide | MultipleChoiceView
  PARAGRAPH → ParagraphView (line 15671+)
  ESSAY → EssayView (line 17936+)
  WORD_THEIR_WAY → WordTheirWayView → assignment_wtw.js
  FRS → assignments_frs.js
  STUDY_PLANS → StudyPlanView (pre/practice/post-test routing)
```

---

## Conference Data (Teacher-Student)

**File:** `assignment-content/ilit/curriculum/gr8/conference_info.js`

Predefined teacher notes, comprehension levels, and guiding questions:

**Comprehension levels:** Inappropriate (0), Struggling (1), Fair (2), Satisfactory (3), Good (4)

**Sample guiding questions:**
- Why did you choose this book?
- Is this book easy, just right, or challenging?
- What has happened in the book so far?
- Can you predict what will happen next?
- (15 total)

---

## Priority for Replica

Based on what's most impactful for the student experience:

1. **IWT slides** (highlight, drag-and-drop, text answer, summary) — the core interactive reading experience
2. **eBook reader** — two-page spread with annotations and texthelp
3. **Multiple choice** — simple but essential for checkpoints
4. **Word sort/WTW** — engaging drag-and-drop word study
5. **FRS dropdowns** — fill-in-the-blank fluency practice

Lower priority (can stub initially):
- PKT summary feedback (requires external API)
- Oral fluency recording
- Essay/paragraph scoring
- Study plan routing

---

## Adaptive IR Leveling Algorithm

Source: `docs/classview/CMS/classroom_server/server_tasks.py`

### Three-Level System

I-LIT uses three discrete IR levels — not a continuous Lexile scale:

| Level | Difficulty | Description |
|-------|-----------|-------------|
| **L1** | Hardest | On/above grade level text |
| **L2** | Middle | Default starting level for all students |
| **L3** | Easiest | Below grade level, more scaffolding |

Each IR passage topic exists in up to 3 versions (one per level). The student's current IR level determines which version they see.

### Level Transition Rules

```
Score < 71%  → DEMOTE (one level easier)
Score 71-85% → STAY   (same level)
Score >= 86% → PROMOTE (one level harder)
```

Transitions are capped at boundaries:
- L1 cannot promote (already hardest) → stays L1
- L3 cannot demote (already easiest) → stays L3

```python
ILIT_LEVEL_PROMOTE = {'L1': 'L1', 'L2': 'L1', 'L3': 'L2'}
ILIT_LEVEL_DEMOTE  = {'L1': 'L2', 'L2': 'L3', 'L3': 'L3'}
```

### Score Calculation

Weekly percentage score aggregated from all IR activities:

| Activity | Multiplier Key |
|----------|---------------|
| IWT checkpoints (highlight, drag-drop, MC) | `iwt` |
| Summary writing | `summary_writing` |
| Text answer / critical response | `critical_response` |
| Whole-group polls | `whole_group_poll` |
| SSR conferences | `ssr_conference` |

Formula: `score = Σ(points × multiplier) / Σ(max_points × multiplier) × 100`

The multipliers are configurable per classroom, allowing teachers to weight different activity types differently.

### When Leveling Runs

In the original system:
- Leveling runs **weekly** per classroom via a batch job (`run_student_leveling.py`) on a Mac Mini server
- Only triggers if the student has **completed their IWT assignment** for that week
- Only triggers if there is **scoring data** to evaluate
- Teachers can set a default starting level before any IR assignments are sent

### Our Implementation

In `lib/storage.ts`:
- `getIrLevel(score, currentLevel)` — pure function matching the original algorithm
- `updateIrLevel(passageId)` — called when all checkpoints in a passage are completed
- Calculates score percentage from `passageProgress.totalScore / maxPossibleScore`
- Updates `irLevel` in student progress
- We evaluate per-passage (not weekly) since we don't have a classroom server

### Lexile Mapping for Library

IR levels map to Lexile ranges for the "My Level" library filter:

| Level | Lexile Center | Filter Range |
|-------|--------------|--------------|
| L1 | 1000L | 800–1200L |
| L2 | 700L | 500–900L |
| L3 | 400L | 200–600L |
