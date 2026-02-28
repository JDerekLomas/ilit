# Interactive Reader (IR) Feature Spec

Comprehensive specification of the Interactive Reader experience -- the core reading feature where students read nonfiction passages with inline comprehension checkpoints.

**Source files:**
- `docs/reference-source/js/assignments.js` (lines 2610-15700+) -- `AssigmentSlides`, `IWTHighlightSlide`, `IWTDndSlide`, `IWTTextAnswerSlide`, `IwtsSummaryView`, `MultipleChoiceView`
- `docs/reference-source/js/constants.js` -- scoring constants, CSS class constants
- `docs/reference-source/css/assignments.css` -- slide wrapper gradient, base typography
- `docs/reference-source/css/assignments_dev.css` -- two-panel layout, highlight colors, DnD, feedback text

**Related specs:**
- `docs/reference-source/assignments-ux-spec.md` covers the Assignment TOC, accordion, and slide container chrome. This spec covers what happens *inside* the slides.
- `docs/interactive-elements.md` covers data structures at a high level. This spec goes deeper into rendering, interaction, scoring, and CSS.

---

## 1. Student Flow Overview

The Interactive Reader (internally called "IWT" -- Interactive Writing Tool) presents a nonfiction passage as a sequence of slides, alternating between reading content and comprehension checkpoints.

### Typical passage flow

```
[Reading Slide 1]  -->  [Highlight Checkpoint]  -->  [Reading Slide 2]  -->
[Drag-and-Drop Checkpoint]  -->  [Reading Slide 3]  -->  [Text Answer]  -->
[Reading Slide 4]  -->  [Multiple Choice]  -->  [Summary Slide]
```

### Student journey through a single checkpoint

1. **Read** -- Student reads passage text on a slide (left panel fills full width)
2. **Tap "Reading Checkpoint"** -- Button at bottom of left panel triggers the interaction
3. **Right panel animates in** -- Slides from left (-200px) to position (0) with opacity transition
4. **Interact** -- Student highlights text, drags words, writes answer, or selects choice
5. **Submit** -- Student taps submit/save button in right panel
6. **Feedback** -- Pass text, fail text, or fail-again text shown; tools are disabled on completion
7. **Advance** -- Sliding engine unfreezes the next slide; student swipes or taps next arrow

### Freeze/unfreeze progression

The parallax sliding engine enforces linear progression:
- Slides ahead of the current "freeze point" cannot be swiped to
- Completing a checkpoint calls `AssigmentSlides.slidingEngine.unFreezeNextSlides()` to advance the freeze point
- On re-entry, `oPrivate.getFreezePosition()` calculates the correct freeze point from attempt data
- Previously completed slides can be revisited freely

---

## 2. Sliding Engine: Parallax vs. Standard Swiper

IWT assignments use a **different** sliding engine from all other assignment types.

| Property | IWT (Interactive Reader) | Other Assignments |
|----------|------------------------|-------------------|
| Engine type | `ASSIGNMENTS.c_s_ASSIGNMENT_PARALLELEX_SLLIDING` | `ASSIGNMENTS.c_s_ASSIGNMENT_SLLIDING` |
| Function | `AssigmentSlides.slidingParallelexEngine()` | `AssigmentSlides.slidingIdangerousEngine()` |
| Library | Custom `Swipe()` wrapper | Standard Swiper |
| CSS class | `.slider_swiper_inner.parallexIwt` | `.slider_swiper_inner` |
| Layout | Left-aligned with centered container | Centered with negative left margin |

**Parallax engine config** (line 5672):
```javascript
AssigmentSlides.slidingEngine = new Swipe(swiperWrapper, {
    continuous: false,
    speed: 1200,
    pagination: '.pagination',
    noScrollClass: 'continent_box_inner',
    onInit: function() { /* restore state, set freeze point */ },
    onSlideChangeStart: function() { /* validate swipe allowed, pause audio */ },
    onSlideChangeEnd: function() { /* update current index, retrieve state, save */ }
});
```

**Key behaviors:**
- `continuous: false` -- no wrap-around; first and last slides are terminal
- `speed: 1200` -- 1.2 second slide transition
- `noScrollClass: 'continent_box_inner'` -- prevents swipe gesture inside scrollable content areas
- On slide change start: checks `AssigmentSlides.allowSwipeStart`, pauses audio, blurs textareas
- On slide change end: clears incremental save timer, updates aria visibility, retrieves slide state, manages freeze point

---

## 3. Two-Panel Layout

Every IWT slide uses a two-panel layout: the **left panel** shows passage text or interactive content, and the **right panel** shows the checkpoint interaction (question, tools, feedback).

### DOM structure

```
.assignment_slider_wrapper                 /* blue gradient background */
  .slider_swiper_inner.parallexIwt         /* parallax positioning */
    .swiper-container
      .swiper-wrapper
        .swiper-slide [per slide]
          .box_outer_space                 /* 90% of available height */
            .continent_box_space.left      /* LEFT PANEL */
              .continent_box_inner
                .continent_content_inner   /* scrollable passage text */
                [Reading Checkpoint btn]   /* bottom of left panel */
            .continent_edit_box            /* RIGHT PANEL -- hidden initially */
              .edit_box_title              /* question/instruction header */
              .continent_wrap_box          /* scrollable answer area, 83% height */
    .nxtprev#prevBtn                       /* prev arrow */
    .nxtprev#nextBtn                       /* next arrow */
    .pagination                            /* dot indicators */
```

### CSS measurements

**Slide wrapper** (`.assignment_slider_wrapper`):
```css
background: linear-gradient(to bottom, #6cbaf8 0%, #3a8ae1 100%);
```

**Parallax positioning** (`.slider_swiper_inner.parallexIwt`):
```css
width: 100%;
margin-top: 70px;
left: 100%;
margin-left: 0;
```

**Container** (`.parallexIwt .container_space.addclass_for_padd`):
```css
width: 1000px;
margin: 0 auto;
```

**Left panel** (`.continent_box_space`):
```css
height: 515px;  /* base height, dynamically adjusted */
```

**Right panel** (`.continent_edit_box`):
```css
height: 462px;
/* initially hidden */
opacity: 0;
left: -200px;
```

**Right panel hidden state** (`.continent_edit_box.hidden`):
```css
opacity: 0;
```

**Content text** (`.continent_content_inner`):
```css
max-height: 505px;
padding: 17px 15px;
user-select: none;  /* prevents accidental text selection */
```

**Content text font** (`.continent_content_inner span`, `.continent_content_inner p`):
```css
font-size: 20px;
```

**Responsive (smaller screens)**:
```css
/* At smaller breakpoint */
.slider_swiper_inner.parallexIwt .continent_box_space { width: 400px; }
.slider_swiper_inner.parallexIwt .continent_edit_box { width: 390px; }

/* With background image */
.slider_swiper_inner.slide_with_bg_image .continent_box_space { width: 500px; }
.slider_swiper_inner.slide_with_bg_image .continent_edit_box { width: 350px; }

/* Chromebook */
.slider_swiper_inner.chromeapp_ir .continent_box_space.left { width: 500px !important; }
.slider_swiper_inner.chromeapp_ir .continent_edit_box { width: 390px !important; }
```

### Height calculation (HeightManager)

The slide layout uses a `HeightManager` system to dynamically calculate heights (line 13045):

```
Window height
  - header height
  - top gap (50px) x 2
  = base height for .box_outer_space (90% of this)
    .continent_box_space: 100% of parent
      .continent_box_inner: 100%
        .continent_content_inner: parent height minus siblings (dynamic formula)
    .continent_edit_box: parent height - 50px, margin-top: 25px
      .continent_wrap_box: 83% of parent, overflow-y: auto
```

### "Reading Checkpoint" button animation

When the student taps "Reading Checkpoint" (the `inputAnswer` handler at line 7300+):

```javascript
// Animate the right panel into view
nowSlide.find('.continent_edit_box').css('left', '-200px');
nowSlide.find('.continent_edit_box').animate({
    'opacity': '1',
    'left': '0'
});

// Hide the checkpoint button, expand left content to fill freed space
controls.readingCheckPointBtn.parent().hide();
controls.leftContent.animate({
    'max-height': expandedHeight + 'px'
});
```

---

## 4. Navigation

### Next/Prev arrows

```css
.nxtprev {
    outline: none !important;
    border-color: #fff;
    box-shadow: 0 0 15px #000;
    border: 2.5px solid #fff;
}
```

- `.nxtprev.dimmed` -- disabled state (cannot advance past freeze point)
- `#prevBtn` / `#nextBtn` -- positioned at left/right edges of slide container
- After checkpoint submit: `.nxtprev` gets `.disabled` removed (line 13338)

### Pagination dots

Standard swiper pagination with `.pagination` container and `.swiper-pagination-switch` dots:
- Active dot: `.swiper-active-switch`
- Visible dot: `.swiper-visible-switch`

### Save & Exit / Done button

```css
#assignmentPrev:not(.done) span.contentsprite:after {
    content: 'Save & Exit';
}
#assignmentPrev.done {
    background-color: #66CC00;
    font-size: 16px;
}
#assignmentPrev.done span.contentsprite:after {
    content: 'Done';
}
```

When all slides are complete, the "Save & Exit" button turns green and shows "Done".

---

## 5. Slide Types

### 5.1 Reading Slide (passage text)

The simplest slide type. Displays passage text for the student to read.

**Layout:**
- Full-width left panel with passage text (`.continent_content_inner`)
- Optional background image behind text
- "Reading Checkpoint" button at the bottom to trigger the next interactive element
- Right panel is hidden (opacity: 0, left: -200px)

**No interaction required** -- student reads and taps the checkpoint button or swipes to the next slide.

---

### 5.2 Highlight Slide (`iwthighlightslide`)

**Class:** `IWTHighlightSlide` (line 12672+, ~1200 lines)

**Purpose:** Student highlights specific words or sentences in the passage text using yellow and/or red markers.

#### Data model

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

#### Two-panel layout

**Left panel:** The passage text rendered inside `.rangySelection` container. Each word/sentence is wrapped in spans with `seqClass{N}` classes for individual selection.

- `single_word_highlight: true` -- individual words are tappable
- `single_word_highlight: false` -- sentences/phrases are tappable (calls `startSentenceSelection()`)

**Right panel (`.continent_edit_box`):**
```
.edit_box_title                        /* question text header */
.edit_icon_space                       /* tool buttons row */
    button.yellowMarkar                /* yellow highlighter */
    button.redMarkar                   /* red highlighter */
    button.markarEraser                /* eraser tool */
.continent_wrap_box                    /* feedback area */
    .highlight_instrction              /* instruction text */
    .highlight_pass_text               /* shown on correct answer */
    .highlight_fail_text               /* shown on first wrong answer */
    .highlight_fail_again_text         /* shown on second wrong answer */
    button.highlightSubmitButton       /* "Save and Continue" */
```

#### Highlight colors

```css
.highlightYellow {
    background-color: #f4df76;
}
.highlightRed {
    background-color: #f47676;
}
```

Tool button states:
- `.active` -- tool is currently selected
- `.disabled` -- tool is disabled (after completion)
- `.disable_tools` -- parent class that disables all tools

#### Interaction flow

1. Student taps "Reading Checkpoint" -- right panel animates in
2. Student selects yellow or red marker tool
3. Student taps words/sentences in left panel to highlight them
4. Tapping highlighted text with eraser removes the highlight
5. Student taps "Save and Continue" to submit

#### Scoring logic (line 13549+)

The submit handler (`IWTHighlightSlide.submitAnswer`) compares student highlights against correct answer indices:

```javascript
// Correct answers stored as "correct-answer" attribute: "color-startIndex-length"
answerIndexesY = String(currentMarkerY.attr('correct-answer')).split("-");
rightAnswerY = getParticularString(plainText, answerIndexesY[1], answerIndexesY[2]);

// Compare student's yellow-highlighted text against correct answer
if (rightAnswerY === yellowText) {
    results.y = true;
}
// Same check for red highlights
success = results.r && results.y;
```

**Maximum attempts:** 2 (`maximumTry = 2`)

| Attempt | Correct | Result |
|---------|---------|--------|
| 1st | Yes | Show `pass_text`, hide submit, disable tools, unfreeze next |
| 1st | No | Show `fail_text`, keep submit visible, 5-second loader overlay |
| 2nd | Yes | Show `pass_text`, hide submit, disable tools, unfreeze next |
| 2nd | No | Show `fail_again_text`, call `showCorrectAns()` to highlight correct text, hide submit, disable tools, unfreeze next |

**Scoring constants** (from `constants.js`):
```
HIGHLIGHT_FIRST_TRIAL_SCORE: "2"
HIGHLIGHT_SECOND_TRIAL_SCORE: "1.5"
```

#### `showCorrectAns()` behavior (line 13726)

When the student fails both attempts, the correct answer is shown by:
1. Reading the `correct-answer` attribute from each marker element
2. Extracting the correct text substring from the passage
3. Wrapping it in `<span class="highlightYellow">` or `<span class="highlightRed">`
4. Replacing the passage HTML with the annotated version
5. Disabling all tool buttons

#### State persistence

Each highlight slide tracks:
```javascript
{
    visited: true,
    isComplete: boolean,
    answerSheetVisible: boolean,    // right panel shown?
    penEnabled: {
        yellow: [true/false per button],
        red: [true/false per button]
    },
    eraserEnabled: boolean,
    selectionSequence: {
        y: [sequenceNumbers],       // which spans are yellow-highlighted
        r: [sequenceNumbers]        // which spans are red-highlighted
    },
    success: boolean,
    attemptCount: 0|1|2
}
```

---

### 5.3 Drag-and-Drop Slide (`iwtdndslide`)

**Class:** `IWTDndSlide` (line 14778+, ~800 lines)

**Purpose:** Student drags word tiles from a bank into a drop zone to complete a sentence or answer a question.

#### Data model

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

#### Two-panel layout

**Left panel:** Passage text with draggable word tiles in a bank area.

```
.continent_box_space.left
    .continent_box_inner
        .continent_content_inner        /* passage text */
        .drag_text_area_container       /* word bank */
            .draggable_area
                .draggable_word [N]     /* individual word tiles */
```

**Right panel:**
```
.continent_edit_box
    .edit_box_title                     /* question text */
    .continent_wrap_box
        .dropbox_instrction             /* instructions */
        .dropbox                        /* drop zone -- "Drag Word Here" */
        .dropbox_pass_text              /* correct feedback */
        .dropbox_fail_text              /* wrong, try again feedback */
        .dropbox_fail_again_text        /* second wrong, shows correct */
        button[submit]                  /* "Save and Continue" */
```

#### CSS for drag/drop elements

```css
.dropbox {
    border: 1px solid #808080;
    font-size: 16px;
    height: 30px;
    line-height: 28px;
    margin-bottom: 10px;
    padding: 5px;
    text-align: center;
}

.drag_text_area_container {
    max-height: 390px;
}

/* Feedback text areas -- all hidden by default */
.dropbox_instrction { margin-bottom: 10px; }
.dropbox_pass_text { margin-bottom: 15px; display: none; }
.dropbox_fail_text { margin-bottom: 10px; display: none; }
.dropbox_fail_again_text { margin-bottom: 15px; display: none; }
```

#### Drag/drop implementation (jQuery UI)

**Making tiles draggable** (`makeTextDraggable`, line 15200+):
```javascript
$('.draggable_word').draggable({
    revert: 'invalid',    // snap back if not dropped on valid target
    zIndex: 9999,
    helper: 'clone',      // drag a clone, leave original in place
    appendTo: 'body',
    scroll: false
});
```

**Making drop zones droppable** (`makeDroppable`, line 15250+):
```javascript
$('.dropbox').droppable({
    accept: '.draggable_word',
    drop: function(event, ui) {
        // Place word text into dropbox
        // Show submit button
        // Update attempt data
    }
});
```

**Default drop zone text:** `"Drag Word Here"` (`c_s_DND_DROPPABLE_DEFAULT_TEXT`)

**Keyboard accessible:** TAB between zones, CTRL+arrow to move tiles (handled in `assignment_accessibility.js`)

#### Scoring logic (`submitAnswerCheck`, line 15440+)

```javascript
correctAnswer = getCorrectAnswer(submitBtn.attr('correct-answer-index'));
userAnswer = dropboxContainer.text().toLowerCase();

if (userAnswer === correctAnswer.toLowerCase()) {
    // Correct
} else {
    // Incorrect
}
```

**Maximum attempts:** 2 (`maximumTry = 2`)

| Attempt | Correct | Result |
|---------|---------|--------|
| 1st | Yes | Show `dropbox_pass_text`, destroy draggable, unfreeze next |
| 1st | No | Show `dropbox_fail_text` + `dropbox_instrction`, show `dropbox` again for retry |
| 2nd | Yes | Show `dropbox_pass_text`, destroy draggable, unfreeze next |
| 2nd | No | Show `dropbox_fail_again_text`, place correct answer in dropbox, destroy draggable, unfreeze next |

**Scoring constants** (from `constants.js`):
```
DND_FIRST_TRIAL_SCORE: "2"
DND_SECOND_TRIAL_SCORE: "1.5"
```

The score is determined by: `ASSIGNMENTS['c_s_DND_' + oScoreIdx[iBtnClickCount] + '_TRIAL_SCORE']` (line 15617).

#### State persistence

```javascript
{
    visited: true,
    isComplete: boolean,
    selectedWord: "word text",     // what's in the dropbox
    slideScore: "0" | "1.5" | "2",
    submitCounter: 0|1|2
}
```

---

### 5.4 Text Answer Slide (`iwttextanswerslide`)

**Class:** `IWTTextAnswerSlide` (line 13851+, ~400 lines)

**Purpose:** Student writes a short text response. This is open-ended -- there is no wrong answer.

#### Data model

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

#### Layout

**Left panel:** Displays `static_text` or `interactive_text` or `question` as the prompt.

**Right panel:**
```
.continent_edit_box
    .edit_box_title                /* question text */
    .text_box_area                 /* textarea wrapper, height: 320px, bg: #fff */
        textarea                   /* student input */
    button[submit]                 /* "Submit" or "Save and Continue" */
```

```css
.text_box_area {
    height: 320px;
    background: #fff;
}
```

#### Interaction flow

1. Student taps "Reading Checkpoint" -- right panel animates in
2. Student types response in textarea
3. Student taps submit
4. `pass_text` is always shown (no scoring for open-ended responses)
5. Slide is marked complete, next slide unfreezes

#### Scoring

Text Answer slides have **no scoring**. They always pass:
- `slideIsCorrect` is always set
- The response text is saved to attempt data but not evaluated

The `submitIWTAssignment` function (line 13969) handles these by simply recording the text content.

#### Controls

Some text answer slides have a "Read Critically" variant with a submit button (`submitButton` property). When this exists, `isComplete` must be explicitly set by submission. Otherwise, the slide is auto-complete on first visit.

---

### 5.5 Summary Slide (`iwtsummaryslide`)

**Class:** `IwtsSummaryView` (line 11117+, ~1500 lines)

**Purpose:** Student writes a summary of the entire passage. Optionally scored by PKT (Pearson Knowledge Technologies) automated essay scoring.

#### Data model

```json
{
    "type": "iwtsummaryslide",
    "question": "Write a summary of the passage.",
    "text": { "text": "Instructions for the summary..." },
    "background_image": "path/to/image.jpg"
}
```

#### Layout

The summary slide uses a different two-panel arrangement than other slides:

**Left panel:** Large textarea (`#txtSummary`) for the summary.

**Right panel:** Tabbed instruction/feedback panel.
```
.continent_edit_box
    [tab buttons]
        #instruction_tab              /* "Instructions" tab */
        #feedback_tab                 /* "Feedback" tab */
    #instruction_content              /* instruction text */
    #feedback_content                 /* PKT feedback display */
    #getFeedback                      /* "Get Feedback" button */
    #btnsubmit_summary                /* "Submit Summary" button */
```

#### Controls (line 11172)

```javascript
controls.emailBtn           // Email summary button
controls.printBtn           // Print summary button
controls.getFeedbackBtn     // #getFeedback -- calls PKT API
controls.submitSummaryBtn   // #btnsubmit_summary
controls.backButton         // #assignmentPrev
controls.typeareaText       // #txtSummary textarea
controls.instructionTab     // Instructions tab
controls.feedbackTab        // Feedback tab
controls.instructionContent // Instruction panel body
controls.feedbackContent    // Feedback panel body
```

#### PKT integration

- **"Get Feedback" button** calls `IwtsSummaryView.getFeedbackCall()` which sends the summary text to the PKT API
- PKT returns: `summaryScore.overallScore`, content scores, wording scores
- Feedback data is decoded with `decodePKTSlideScore()` and displayed in the feedback tab
- **Multiplying factor:** `IwtsSummaryView.iMultiplyingFactor = 3`
- **Summary max score:** `dSummaryMaxScore = 4`, so total = 4 * 3 = **12 points max**

#### Submit behavior

After submission:
- Submit button gets `.btndisabled.disabled` classes and `aria-disabled=true`
- "Get Feedback" button gets `.btndisabled.disabled`
- Textarea gets `readonly` attribute
- If text is empty, submit stays disabled
- `IwtsSummaryView.isSummarySubmitted = true`

#### State persistence

```javascript
{
    visited: true,
    isComplete: boolean,
    summary: "URL-encoded student summary text"
}
```

The summary text is URL-encoded via `encodeURIComponent()` before storage.

---

### 5.6 Multiple Choice Slide (`multiplechoiceslide`)

**Class:** `MultipleChoiceView` (line 10938+, ~80 lines)

**Purpose:** Standard multiple choice comprehension question.

#### Rendering

Uses an Underscore.js template with:
```javascript
_.template($("#multiplechoiceslide_template").html(), {
    data: model,
    partIdx: slideIdx,
    referenceKey: referenceKey,
    savedData: previousAttemptData,
    mediaPath: mediaPath,
    isIlit20: productCode.startsWith("ilit20"),
    ShowGradeExamWithAllMedia: boolean
});
```

#### Audio support

- Questions can include audio playback buttons (`.playPauseButton`)
- `MultipleChoiceView.maxPlayCount = 2` -- audio can be played max 2 times
- Audio handler: `Assessment.audioPlayerHandler()`

#### Layout

```css
.multiplechoiceslide.media_content {
    max-height: window_height - (study_plain_title + header + assessment_footer + assessment_bench_mark);
}
```

---

### 5.7 Multiple Choice with Passage (`multichoicepassageslide`)

**Class:** `MultiChoicePassagesView` (line 11018+, ~100 lines)

Same as multiple choice but displays a passage excerpt alongside the question for reference. Also supports instructional audio.

---

## 6. IWT Scoring Model

### Per-slide scoring

The `submitIWTAssignment()` function (line 13969) computes the total IWT score:

```javascript
dReadingCheckPointMaxScore = 2.0;     // max per checkpoint (highlight or DnD)
dSummaryMaxScore = 4;                  // raw summary max
iMultiplyingFactor = 3;                // summary multiplier

// For each slide:
switch (slideType) {
    case 'iwthighlightslide':
    case 'iwtdndslide':
        dReadingCheckPointScore += slideScore;    // 0, 1.5, or 2
        dReadingCheckPointTotalScore += 2.0;      // add max possible
        break;
    case 'iwtsummaryslide':
        dSummaryScore += slideScore;              // from PKT
        dMaxScore += 4 * 3;                       // = 12
        break;
}
```

### Score constants

| Slide Type | 1st Trial Correct | 2nd Trial Correct | Both Wrong |
|-----------|-------------------|-------------------|------------|
| Highlight | 2.0 | 1.5 | 0 |
| Drag-and-Drop | 2.0 | 1.5 | 0 |
| Text Answer | N/A (always passes) | -- | -- |
| Summary | 0-12 (PKT score * 3) | -- | -- |
| Multiple Choice | See assignments spec | -- | -- |

---

## 7. Student Attempt Data Model

### Top-level structure

```javascript
{
    itemId: "assignment_item_id",
    itemSlides: [
        {
            slideID: "slide_id",
            slideType: "iwthighlightslide",
            slideAttempt: 1,              // number of submission attempts
            slideIsCorrect: "" | true,
            slideScore: "" | "1.5" | "2",
            slideInputData: { ... }       // type-specific state
        }
    ],
    submitStatus: "" | "submitted",
    reAssignedStatus: "",
    itemType: "iwt"
}
```

### Per-type `slideInputData`

**Highlight slide:**
```javascript
{
    visited: true,
    isComplete: true,
    answerSheetVisible: true,
    penEnabled: { yellow: [true], red: [false] },
    eraserEnabled: false,
    selectionSequence: { y: ["3", "4"], r: ["7"] },
    success: true,
    attemptCount: 1
}
```

**Drag-and-Drop slide:**
```javascript
{
    visited: true,
    isComplete: true,
    selectedWord: "photosynthesis",
    slideScore: "2",
    submitCounter: 1
}
```

**Text Answer slide:**
```javascript
{
    visited: true,
    isComplete: true,
    textAnswer: "Student's typed response here"
}
```

**Summary slide:**
```javascript
{
    visited: true,
    isComplete: true,
    summary: "URL-encoded%20student%20summary%20text"
}
```

### Incremental save

- Attempt data is saved incrementally during the assignment
- `AssigmentSlides.clearIncrementalSaveTimerData()` is called on slide change
- Minimum save interval: 30 seconds (configurable)
- `AssigmentSlides.setAttemptData()` sends data to the server

---

## 8. Slide Type Routing

When the IWT assignment loads, `AssigmentSlides.init()` sets the type and engine:

```javascript
AssigmentSlides.assignmentType = ASSIGNMENTS.c_s_ASSIGNMENT_IWTS;  // "iwt"
AssigmentSlides.slidingEngineType = ASSIGNMENTS.c_s_ASSIGNMENT_PARALLELEX_SLLIDING;
```

Each slide is rendered via a switch/case in the slide container creation (line 4005):

```javascript
switch (sSlideType) {
    case ASSIGNMENTS.c_s_TYPE_TPL_IWTDNDSLIDE:        // "iwtdndslide"
        IWTDndSlide.init(slideIdx, model);
        break;
    case ASSIGNMENTS.c_s_TYPE_TPL_IWTHIGHLIGHTSLIDE:  // "iwthighlightslide"
        IWTHighlightSlide.init(slideIdx, model);
        break;
    case ASSIGNMENTS.c_s_TYPE_TPL_IWTTEXTANSWERSLIDE:  // "iwttextanswerslide"
        IWTTextAnswerSlide.init(slideIdx, model);
        break;
    case ASSIGNMENTS.c_s_TYPE_TPL_IWTSUMMARYSLIDE:     // "iwtsummaryslide"
        IwtsSummaryView.init(slideIdx, model);
        break;
    case ASSIGNMENTS.c_s_TYPE_TPL_MULTIPLE_CHOICE_SLIDE:  // "multiplechoiceslide"
        MultipleChoiceView.init(slideIdx, model);
        break;
    case ASSIGNMENTS.c_s_TYPE_TPL_MULTI_CHOICE_PASSAGES_SLIDE:  // "multichoicepassageslide"
        MultiChoicePassagesView.init(slideIdx, model);
        break;
}
```

The `getResponsibleObject()` function (line 7568) maps slide types to their view class for state retrieval:

```javascript
switch (sSlideType) {
    case 'iwtdndslide':           return IWTDndSlide;
    case 'iwthighlightslide':     return IWTHighlightSlide;
    case 'iwttextanswerslide':    return IWTTextAnswerSlide;
    case 'iwtsummaryslide':       return IwtsSummaryView;
}
```

---

## 9. State Restoration on Re-entry

When a student returns to a previously started IWT assignment, the parallax engine's `onInit` handler (line 5696+) restores all slide states:

1. Load `studentAttemptData` from server
2. Find `iLastVisitedSlideIndex` -- the furthest slide the student has reached
3. For each slide from 0 to `iLastVisitedSlideIndex`:
   - Look up the slide's `slideInputData` from attempt data
   - Call `slideStatuses[slideId].updateStatusByData(slide, status)` per type
   - This restores: highlights, dropped words, typed text, feedback visibility, tool states
4. Calculate freeze point from completed/incomplete slides
5. Set slider position to `min(lastVisitedIndex, freezePoint)`
6. Call `AssigmentSlides.retrieve()` to refresh the active slide's UI

For each slide type, `retrieveStatus4mData` (e.g., line 13121 for highlights) handles:
- Re-applying highlight colors to the correct spans
- Showing/hiding the right panel based on `answerSheetVisible`
- Restoring feedback text visibility based on `attemptCount` and `success`
- Re-enabling or disabling tool buttons based on completion state

---

## 10. Accessibility

### Keyboard navigation

From `assignment_accessibility.js`:
- **TAB** -- navigate between slides
- **CTRL+Left/Right** -- move DnD tiles between zones
- **Enter/Space** -- activate buttons, select highlights

### ARIA

- `IWTHighlightSlide.CtrlAriaHiddSlides(slideIndex)` -- sets `aria-hidden` on non-active slides
- `readThis()` -- screen reader announcements for actions:
  - `AccsHighLightConstant.YELLOW` -- "Yellow highlighter selected"
  - `AccsHighLightConstant.RED` -- "Red highlighter selected"
  - `AccsHighLightConstant.ERASER` -- "Eraser selected"
  - `AccsHighLightConstant.HIGHLIGHT` -- "Text highlighted"
  - `AccsHighLightConstant.NOTHIGHTLIGHT` -- "Highlight removed"
  - `"Correct Answer"` / `"Incorrect. The correct answer is ..."` -- for DnD feedback
- After highlight submit: focus is moved to the feedback text element (`IWTHighlightSlide.PassText()`, `FailText()`, `FailAgainText()`)
- `.nxtprev` buttons have `tabindex="0"` for keyboard access

---

## 11. Dependencies and Libraries

| Library | Usage |
|---------|-------|
| jQuery UI (Draggable + Droppable) | DnD slide tile interaction |
| Underscore.js (_.template) | HTML template rendering for all slide types |
| Swipe.js (custom) | Parallax sliding engine |
| Rangy.js | Text selection for highlight slides (referenced but mostly custom implementation) |

---

## 12. Color Reference

| Element | Color | CSS |
|---------|-------|-----|
| Slide wrapper gradient (top) | Sky blue | `#6cbaf8` |
| Slide wrapper gradient (bottom) | Medium blue | `#3a8ae1` |
| Right panel background | Light gray | `#f7f9f9` |
| Yellow highlight | Pale gold | `#f4df76` |
| Red highlight | Pale red | `#f47676` |
| Body text | Dark gray | `#4e4e4e` |
| Dropbox border | Medium gray | `#808080` |
| "Done" button | Green | `#66CC00` |
| Next/prev border | White | `#fff` |
| Next/prev shadow | Black | `#000` |
| Incorrect text span | Red | `#EC0B45` |
| Correct text span | Green | `green` |
| Active part tab text | Blue | `#3A8AE1` |
| Active part tab bg | White | `#fff` |
| Page background | Light gray | `#E0E1E1` |

---

## 13. Implementation Priority for Replica

Based on student learning impact and interaction complexity:

### Phase 1 (Core reading experience)
1. **Two-panel layout** with reading checkpoint animation
2. **Highlight slide** -- the signature IR interaction
3. **Drag-and-Drop slide** -- engaging and common
4. **Slide navigation** -- parallax engine with freeze/unfreeze

### Phase 2 (Completion)
5. **Text Answer slide** -- simpler (no scoring)
6. **Multiple Choice slide** -- standard UI pattern
7. **Summary slide** -- without PKT (just textarea + submit)
8. **State persistence** -- save/restore attempt data

### Phase 3 (Polish)
9. **PKT summary scoring** -- requires external API or equivalent
10. **Accessibility** -- ARIA, keyboard navigation, screen reader announcements
11. **Responsive layouts** -- Chromebook, smaller screens
12. **Audio integration** -- passage audio, instructional audio

---

## 14. Key Source Code Locations

| Component | File | Lines |
|-----------|------|-------|
| `AssigmentSlides` class | assignments.js | 2610-2810 |
| Slide type routing | assignments.js | 4005-4078 |
| Parallax engine init | assignments.js | 5669-5865 |
| `inputAnswer` (Reading Checkpoint) | assignments.js | 7300-7400 |
| `getResponsibleObject` | assignments.js | 7568-7600 |
| `MultipleChoiceView` | assignments.js | 10938-11017 |
| `MultiChoicePassagesView` | assignments.js | 11018-11115 |
| `IwtsSummaryView` | assignments.js | 11117-13850 |
| `IWTHighlightSlide` | assignments.js | 12672-13850 |
| `IWTTextAnswerSlide` | assignments.js | 13851-14777 |
| `submitIWTAssignment` | assignments.js | 13969-14050 |
| `IWTDndSlide` | assignments.js | 14778-15700 |
| Scoring constants | constants.js | 630-660 |
| Slide wrapper gradient | assignments.css | 1609-1620 |
| Two-panel layout CSS | assignments_dev.css | 43-240 |
| Highlight colors | assignments_dev.css | 123-128 |
| Feedback text CSS | assignments_dev.css | 273-283 |
| DnD dropbox CSS | assignments_dev.css | 53-71 |
| Nav button CSS | assignments_dev.css | 2146-2167 |
