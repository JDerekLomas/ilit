# ClassView I-LIT Notebook Feature Specification

Complete implementation reference extracted from the production Savvas I-LIT codebase. This document contains everything needed to build the Notebook feature without reading the original source files.

## Source Files

| File | Path | Lines |
|------|------|-------|
| HTML (templates) | `docs/classview/Webclient/App/notebook.html` | ~2258 |
| JavaScript | `docs/classview/Webclient/App/js/notebook.js` | ~4200 |
| CSS (main) | `docs/classview/Webclient/App/css/notebook.css` | ~1930 |
| CSS (overrides) | `docs/classview/Webclient/App/css/notebook_dev.css` | 205 |

---

## 1. DOM Structure

### 1.1 Overall Architecture

The notebook has two states: **closed (landing page)** and **open (tabbed view)**.

```
#notebook_wrapper                          // main container, holds all rendered content
  |
  +-- [Landing Page State]
  |   .notes_landing#default_notes
  |     .notes_book_icon                   // notebook cover image (note_book.png)
  |       button.thumb_stamp               // fingerprint scanner button
  |
  +-- [Open State - varies by tab]
      .notes_wrapper                       // gray shell around the open notebook
        .notes_wrapper_left                // left sidebar panel
        |  .notes_head_title               // colored header (color matches active tab)
        |  |  button.notes_close#closenotebook  // close button (returns to landing)
        |  |  .middle                      // menu title text
        |  .notes_wrapper_content          // scrollable list of entries
        |     .notes_list_wrapper          // UL/LI accordion of units > entries
        |
        .notes_wrapper_right               // right content panel
           .notes_head_title2              // toolbar with action buttons (dark gray)
           |  .btn-inline-block            // each button wrapped in this
           |     button.notes_icn          // action icons (delete, send, add, organize)
           |     .ui-tooltip               // hover tooltip for each button
           .container_notes_wrapper        // main content area
              [content varies by tab]
              .tabbs_name                  // vertical tab strip (absolute positioned right edge)
                 .tabs_s                   // individual tab buttons
```

### 1.2 Template IDs (Underscore.js `<script type="text/template">`)

| Template ID | Lines (HTML) | Purpose |
|-------------|-------------|---------|
| `notesLandingPage` | 1725-1733 | Notebook cover with fingerprint button |
| `journaltemplate` | 818-981 | Journal tab shell (V1 layout reference) |
| `journalInnerTemplate` | 663-724 | Journal content panel V1 |
| `journalInnerTemplateV2` | 727-815 | Journal content panel V2 (with teacher comments) |
| `noteBookJournalEditorPanel` | 580-592 | Journal textarea |
| `noteBookJournalTitlePanel` | 594-607 | Journal title input |
| `wordbanktemplate` | 1221-1266 | Word Bank tab shell |
| `wordbankInnerTemplate` | 984-1099 | Word Bank content V1 |
| `wordbankInnerTemplateV2` | 1102-1214 | Word Bank content V2 |
| `noteBookWordBankEditorPanel` | 609-649 | Word Bank editor fields |
| `classnotestemplate` | 1269-1413 | Class Notes tab shell (with organize menu) |
| `portfoliotemplate` | 1666-1722 | Portfolio/My Work/Resources tab shell |
| `portfolioInnerTemplate` | 1416-1663 | Portfolio content (assignments + resources list) |
| `noteBookLeftPanel` | 152-226 | Left sidebar for Journal/WordBank/ClassNotes |
| `noteBookLeftPanelPortfolio` | 228-385 | Left sidebar for My Work (unit/lesson hierarchy) |
| `notebook-portfolio-left` | 387-558 | Left sidebar for Resources (category groups) |
| `noteBookRightPanel` | 560-579 | Tab strip template |
| `causeneffecttemplate` | 1783-1806 | Cause & Effect graphic organizer |
| `stempbysteptemplate` | 1810-1840 | Step by Step graphic organizer |
| `storymaptemplate` | 1844-1868 | Story Map graphic organizer |
| `columncharttemplate` | 1872-1915 | Two/Three Column Chart graphic organizer |
| `timelineemplate` | 1919-1960 | Timeline graphic organizer |
| `twocolumncharttemplate` | 1964-1997 | Two Column Chart (legacy template) |
| `vendiagramttemplate` | 2001-2037 | Venn Diagram graphic organizer |
| `resourcePopup` | 1737-1765 | Resource popup (image/video lightbox) |
| `resoucesBodyLessonScreen` | 2041-2076 | Resources > Lesson Screens content |
| `resoucesBodyStandards` | 2077-2136 | Resources > Standards content |
| `resoucesBodyRoutineCards` | 2137-2196 | Resources > Routine Cards content |
| `resoucesBodyBookClub` | 2197-2256 | Resources > Book Club content |

---

## 2. Skeuomorphic Elements

### 2.1 Notebook Cover (Landing Page)

The closed notebook is a **PNG image** of a physical notebook, not CSS-generated.

- **Cover image**: `note_book.png` applied as `background` on `.notes_book_icon`
  - Width: 422px, min-height: 605px (CSS line 1867)
  - Dev override: `min-height: 0; background-size: 100% 100%` (dev CSS line 7)
- **Landing page background**: `lading_page_bg.jpg` (note the typo) applied as `background` on `.notes_landing`
  - Repeating tile pattern, min-height: 550px, padding: 20px 0 14px 0 (CSS line 1863)
- **Fingerprint scanner**: `finger_stamp.png` applied as `background` on `.thumb_stamp`
  - Size: 64px x 85px, positioned absolute right: 42px, top: 50% (CSS line 1872)
  - Cursor: pointer (dev CSS line 5)

### 2.2 Open Notebook Shell

- **Spiral binding**: `notes_rgt_bg.png` applied as `background: url(../media/notes_rgt_bg.png) repeat-y right` on `.notes_wrapper_left`
  - This creates the spiral wire effect on the right edge of the left panel (CSS line 1743)
  - The image repeats vertically to cover the full height
- **Ruled lines / paper texture**: `pad_bg.png` applied as `background: url(../media/pad_bg.png) repeat` on `.notes_book_container`
  - Creates horizontal ruled-line effect on the writing area (CSS line 1804)
- **Paper area**: `.notes_wrapper_content` has white background (#fff) with box-shadow: `0 0 3px 2px #333` and border-radius: `0 0 5px 5px` (CSS line 1748)

### 2.3 Venn Diagram

- Uses an actual **PNG image** `media/venn.png` for the overlapping circles (HTML line 2005)
- Text areas are positioned over the image regions

---

## 3. Tab System

### 3.1 Tab Configuration

Five tabs rendered from the `NOTEBOOK_TABS` array, displayed as vertical side-tabs on the right edge of the notebook:

| Index | Tab Name | Code Constant | Class | Color (bg) | Header Color |
|-------|----------|---------------|-------|------------|--------------|
| 0 | Journal | `c_s_TAB_JOURNAL` | `.journal` / `.tabs1` | `#0b89b7` (teal) | `#0b89b7` |
| 1 | Word Bank | `c_s_TAB_WORDBANK` | `.WordBank` / `.tabs2` | `#1a5479` (dark blue) | `#1a5479` |
| 2 | Class Notes | `c_s_TAB_CLASSNOTES` | `.ClassNotes` / `.tabs3` | `#fc4333` (red) | `#fc4333` |
| 3 | My Work | `c_s_TAB_MYWORK` | `.my_work` / `.tabs4` | `#fd8d00` (orange) | `#FD8D00` |
| 4 | Resources | `c_s_TAB_RESOURCES` | `.resources` / `.tabs5` | `#fcbb02` (amber) | `#FCBB02` |

### 3.2 Tab Layout CSS

```css
.tabbs_name {
    width: 47px;
    position: absolute;
    right: -47px;
    top: 3px;           /* dev override, was 20px */
}

.tabs_s {
    padding: 7px 6px;   /* dev override, was 18px 6px */
    border: 1px solid #363636;
}
```

- Tab text is rendered using **sprite3** background image (`.tabs_s_text`)
- Tab labels are vertically oriented text rendered as sprite images, NOT CSS text-rotation
- Active tab has a CSS triangle arrow pointing left into the content area:

```css
.tabs_s.active .tabs_arrow {
    border-right: 10px solid [tab-color];  /* matches tab bg color */
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    position: absolute;
    left: -10px;
    top: 38%;    /* dev override */
}
```

### 3.3 Tab Switching Logic (JS)

Tab clicks are handled in `NotebookTabsView.bindEvents()` (JS line 455):
1. Clear incremental save timer
2. Determine target tab type from clicked element's `data-value`
3. Call `NotebookView.goToTabs(tabType)` (JS line 192)
4. For Journal/WordBank/ClassNotes: fetch note list via `GetNotelistV2` native call, then render
5. For My Work/Resources: show loader overlay for 2000ms (via `setTimeout`), fetch portfolio data, then render

### 3.4 Resources Tab Visibility

The Resources tab is **hidden** for iLIT 2.0 and WTW product types (JS line ~200). It only appears for the original iLIT product.

---

## 4. Journal Tab

### 4.1 Layout

```
.notes_wrapper
  .notes_wrapper_left.tabs1              // left panel, teal header
    .notes_head_title (bg: #0b89b7)
      button.notes_close#closenotebook   // close notebook
      button.toc_toolls_2 (current book) // "current book" tooltip button
      button.trash_icon#deletejournal    // delete entry
      button.notes_send#sendjournal      // send to teacher (hidden)
      button.notes_add#addnewjournal     // add new entry
    .notes_wrapper_content               // left sidebar entry list
      [rendered by noteBookLeftPanel template]

  .notes_wrapper_right                   // right content area
    .notes_head_title2 (bg: #555350)     // dark gray toolbar (redundant buttons)
    .container_notes_wrapper
      .container_notes_wrapper_title
        .left_title                      // "Title" label
        input.journaltitle               // title input field
      .notes_book_content (bg: #cdd9e2)  // blue-gray content card
        .notes_book_container            // ruled-line paper background
          .note_comments                 // text content area
      .button_bar_wrapper                // save/cancel bar (shown on edit)
        button#cancelNoteBtn             // Cancel
        button#saveNoteBtn               // Save
      .tabbs_name                        // vertical tab strip
```

### 4.2 Left Sidebar (Entry List)

Template: `noteBookLeftPanel` (HTML lines 152-226)

Structure:
- Entries grouped by unit number (sorted by `RefUnitNumber`)
- Each unit is an accordion section: clicking expands/collapses with `slideUp()/slideDown()`
- Format: `Unit [number]` header, then list of entries below
- Each entry shows truncated text (max `NOTEBOOK.c_s_NOTEBOOK_VIEW_MENU_TXT_LENGTH` chars)
- Date display: extracted from `RevisionId` field -- month from `substr(4,2)`, day from `substr(6,2)`, displayed as `MM/DD`
- Active entry has `li.active` class with orange highlight color `#ff8c00` (dev CSS line 149)

### 4.3 Date Format

```javascript
// JS line ~1230 (leftPanelRender)
var month = obj.RevisionId.substr(4, 2);  // positions 4-5
var day = obj.RevisionId.substr(6, 2);    // positions 6-7
// displayed as: month + "/" + day (e.g., "02/28")
```

### 4.4 Journal Editor

- **Title input**: `<input>` with placeholder "Enter title" (from `NOTEBOOK.c_s_NOTEBOOK_EMPTY_TITLE_TXT`), class `.journaltitle`
- **Text area**: `<textarea>` with class `.journaldescription`, inside `.notes_book_container` (which has `pad_bg.png` ruled lines)
  - Dev CSS: width 95%, padding 2%, no border, no background, no resize, min-height 500px, font-size 16px, line-height 26px, font-family Helvetica/Arial/sans-serif
- **Teacher Comment Panel** (V2 only): positioned absolute at bottom, 120px tall box with gray background `#D9DDE1`, border `1px solid #5A6672`, border-radius 5px

### 4.5 Journal Buttons

Located in `.notes_head_title` (header bar, left panel):
- **Close** (`#closenotebook`): `.notes_close.sprite` - background-position `-415px -325px`, 35x35px, bg-color `#000`, border-radius 50%
- **Current Book** (`.toc_toolls_2`): opens a tooltip showing current reading info, 40x40px
- **Delete** (`#deletejournal`): `.trash_icon.sprite` - 35x35px icon
- **Send** (`#sendjournal`): `.notes_send.sprite` - hidden by default (`display:none`)
- **Add New** (`#addnewjournal`): `.notes_add.sprite` - 35x35px icon

Action bar (`.notes_head_title2`, right panel):
- Same buttons repeated (delete, send, add new) -- displayed as inline-block icons

### 4.6 Auto-Save (Incremental Save)

- Timer interval stored in `NotebookView.iSaveAttemptDataTimerInterval` (set from server config)
- Starts on first edit interaction, fires every 30+ seconds
- Calls `NotebookView.incrementalSave()` (JS line 357)
- On each tick: checks if content changed, if so calls the tab's `onSave()` to get data, then calls `NotebookTabsView.saveData()`
- Timer cleared on: tab switch, close, delete, cancel, explicit save

---

## 5. Word Bank Tab

### 5.1 Layout

```
.notes_wrapper
  .notes_wrapper_left.tabs2              // dark blue header
    .notes_head_title (bg: #1a5479)
      button.notes_close#closenotebook
      .middle                            // "Saved Words" or similar menu name
    .notes_wrapper_content               // left sidebar word list

  .notes_wrapper_right
    .notes_head_title2 (bg: #555350)
      button.trash_icon#deletewordbank   // delete word
      button.notes_send#sendwordbank     // send (hidden)
      button.notes_add#addnewwordbank    // add new word
    .container_notes_wrapper
      #innerWordbankDataContainer        // word card content
        .notes_book_content (bg: #cdd9e2)
          .notes_book_lt                 // label column (115px wide)
            "Word" label
          .notes_book_rt.middle          // content column
            div[contenteditable]#wordtitle
          [separator]
          .notes_book_lt
            "Definition" label
          .notes_book_rt.middle
            div[contenteditable]#worddefinition
          [separator]
          .notes_book_lt
            "Sentence" label
          .notes_book_rt.middle
            div[contenteditable]#wordsentence
      .button_bar_wrapper
        button#cancelNoteBtn
        button#saveNoteBtn
      .tabbs_name                        // vertical tabs
```

### 5.2 Add Word Flow

1. User clicks Add New Word button (`#addnewwordbank`)
2. `NotebookView.noteId` set to null, `refUnitNumber` set to current unit
3. Three contenteditable divs cleared: Word, Definition, Sentence
4. Save/Cancel bar appears
5. On save: data collected as JSON: `{datacontent:[{Definition:"...",Sentence:"..."}]}`
6. Word title stored as `NoteTitle`, definition+sentence stored as `NoteText` (JSON string)

### 5.3 Word Card Layout

Three rows, each with a label column (115px, class `.notes_book_lt`, padding-left 10px) and a content column:
- **Word**: `div[contenteditable=true]#wordtitle` -- the word itself
- **Definition**: `div[contenteditable=true]#worddefinition`
- **Sentence**: `div[contenteditable=true]#wordsentence`

### 5.4 Data Format

```json
{
  "datacontent": [
    {
      "Definition": "encoded-definition-text",
      "Sentence": "encoded-sentence-text"
    }
  ]
}
```

The word title is stored separately in `NoteTitle`. All text values are URL-encoded.

---

## 6. Class Notes Tab

### 6.1 Layout

```
.notes_wrapper
  .notes_wrapper_left.tabs3              // red header
    .notes_head_title (bg: #fc4333)
      button.notes_close#closenotebook
      .middle                            // "Saved Notes" menu name
    .notes_wrapper_content               // left sidebar notes list

  .notes_wrapper_right
    .notes_head_title2 (bg: #555350)
      div.notes_organizer                // "Organize" button (dropdown)
      button.trash_icon#deleteclassnote  // delete
      button.notes_send#sendclassnote    // send (hidden)
      button.notes_add#addnewclassnote   // add new note
    .container_notes_wrapper
      .container_notes_wrapper_title
        .left_title                      // "Title" label
        input.classnotestitle            // title input
      .notes_wrapper_content_inner#editable  // contenteditable div (rich text area)
      .button_bar_wrapper
        button#cancelNoteBtn
        button#saveNoteBtn
      .tabbs_name                        // vertical tabs
```

### 6.2 Organize Feature

The "Organize" button (`.notes_organizer`) opens a dropdown tooltip (`#notebook_organize_classnote_tooltip`) with 7 graphic organizer options:

| Organizer | Template ID | ID Attribute | Data Structure |
|-----------|-------------|--------------|----------------|
| Cause & Effect | `causeneffecttemplate` | `actioncauseeffect` | `{causeandeffectdata:[{causetext,effecttext}]}` |
| Step by Step | `stempbysteptemplate` | `actionstepbystep` | `{stepbystepdata:[{step1,step2,step3,step4}]}` |
| Story Map | `storymaptemplate` | `actionstorymap` | `{storymapdata:[{step1..step5}]}` with labels: Characters, Setting, Problem, Event, Solution |
| Three Column Chart | `columncharttemplate` | `actionthreecolumnchart` | `{threecolumndata:[{threecolumntextdata},{threecolumnstepdata}]}` |
| Timeline | `timelineemplate` | `actiontimeline` | `{timelinedata:[{timelinedateinput},{timelineeventinput}]}` with 5 date/event pairs |
| Two Column Chart | `twocolumncharttemplate`/`columncharttemplate` | `actiontwocolumnchart` | `{twocolumndata:[{twocolumntextdata},{twocolumnstepdata}]}` |
| Venn Diagram | `vendiagramttemplate` | `actionvendiagram` | `{vendiagramdata:[{step1,step2,step3}]}` -- left circle, overlap, right circle |

Each organizer:
- Is inserted at cursor position in the contenteditable area (via `putHtmlAtCaret()`, JS line 3737)
- Has a close/remove button (`.closebtn.sprite`)
- Is wrapped in `<span class="portfoliograph" contenteditable="false">` to prevent editing the structure
- Each input field inside the organizer IS editable (textarea or contenteditable div)

### 6.3 Organize Dropdown CSS

```css
.lesson_tooltip {
    border: 1px solid #666666;
    border-radius: 9px;
    width: 250px;           /* was 290px in general, but notebook uses 250px */
    position: absolute;
    top: 44px;              /* below the organize button */
    background: #fff;
    z-index: 5;
    box-shadow: 0 2px 9px 3px rgba(0,0,0,0.2);
}
```

Each dropdown item has icon from `sprite3` (`.icon_lft.sprite3`) and text label.

### 6.4 Class Notes Data Format

Notes are stored as JSON arrays of typed content blocks:

```json
{
  "datacontent": [
    {"editorpaneldata": [{"textcontent": "encoded text"}]},
    {"causeandeffectdata": [{"causetext": "...", "effecttext": "..."}]},
    {"stepbystepdata": [{"step1": "...", "step2": "...", "step3": "...", "step4": "..."}]},
    {"storymapdata": [{"step1": "...", "step2": "...", "step3": "...", "step4": "...", "step5": "..."}]}
  ]
}
```

---

## 7. My Work Tab (Portfolio)

### 7.1 Layout

```
.notes_wrapper
  .notes_wrapper_left.tabs4.portfolio_container  // orange header
    .notes_head_title (bg: #FD8D00)
      button.notes_close#closenotebook
      .tabs_notes                        // "My Work" label
    .notes_wrapper_content               // unit/lesson hierarchy sidebar

  .notes_wrapper_right
    .notes_head_title2 (bg: #555350)
      button.trash_icon (hidden)
      button.notes_send (hidden)
      button.notes_add (hidden)
    .container_notes_wrapper
      #innerPortfolioDataContainer       // assignment list content
        .note_title_head                 // "Unit X Lessons Y-Z" header
        .container_notes_column
          .container_notes_column_content
            ul > li.viewWorkData         // each assignment
              a
                span.upload_icon         // external link icon
                span.percent_score       // "29/36" score
                span.view-feedback-button // "View Feedback" button (if SFB data)
                span.middle              // assignment display name
      .tabbs_name                        // vertical tabs
```

### 7.2 Left Sidebar (Unit Hierarchy)

Template: `noteBookLeftPanelPortfolio` (HTML lines 228-385)

Structure for each unit:
```
ul
  li > a.groups (Unit N header)
    span.nt_arrow      // expand/collapse arrow
  ul.links-cont        // sub-items (hidden by default, shown on click)
    li > a.sub-groups (Lessons header)
      span.nt_arrow
    ul.links-cont
      li > a.links (individual lesson range, e.g. "Lessons 1-5")
    li > a.sub-groups (Benchmark Assessment(s))
    li > a.sub-groups (Weekly Reading Check(s))
```

- Units 1-7 (configurable via `TotalUnits`)
- Each unit accordion: `slideUp()/slideDown()` toggle
- Sub-items: Lessons (grouped by week), Benchmark Assessment(s), Weekly Reading Check(s)
- Active sidebar items: `color: #ff8c00` (dev CSS line 149)
- Arrow icons from sprite: collapsed `-473px -170px`, expanded `-473px -211px` (dev CSS lines 154-155)

### 7.3 Assignment Display

Each scored assignment shows:
- Assignment name (`ItemDisplayName`)
- Score: `FinalScore / ItemMaxScore` (e.g., "29/36")
- For NS (narrative summary) assignments: shows "Finished" instead of score
- External link icon (`.upload_icon.sprite3`) -- opens assignment in iframe
- "View Feedback" button (white text on dark background) -- shown only when `SFB` data exists

### 7.4 View Assignment Popup

When clicking an assignment or its upload icon:
- `#viewAssignmentPopupArea` overlay appears (full screen, z-index 5)
- Contains an iframe loading the assignment content
- Back button (`.resourcebtnBack`) to close

### 7.5 Empty State

When no assignments exist:
- Shows `alert-icon.png` image (34px height)
- Text: `NOTEBOOK.c_s_NOTEBOOK_PORTFOLIO_RECORD_EMPTY_TEXT`

---

## 8. Resources Tab

### 8.1 Layout

Same shell as My Work (uses `portfoliotemplate`), but with `.tabs5` class and amber header `#FCBB02`.

### 8.2 Left Sidebar (Category Hierarchy)

Template: `notebook-portfolio-left` (HTML lines 387-558)

Categories (from JS PortfolioView, line ~4195):
```javascript
var oAvailableGroups = {
    'lessonScreen': 'Lesson Screens',
    'routineCards': 'Routine Cards',
    'bookClub':    'Book Club',
    'standards':   'Standards'
};
```

Structure:
```
ul
  li > a.groups (Category name, e.g. "Lesson Screens")
    span.nt_arrow
  ul.links-cont
    li > a.sub-groups (Sub-category, e.g. "Vocabulary")
      span.nt_arrow
    ul.links-cont
      li > a.links (individual resource, e.g. "Unit 1, Lessons 1-5")
```

### 8.3 Resource Types

- **Lesson Screens**: Sub-types include Vocabulary (per unit/lesson range) and Whole Group Instruction (WGI)
  - Vocabulary items show: `unitNumber.weekNumber.dayNumber word` (e.g., "1.1.3 photosynthesis")
  - WGI items show: "Whole Group Instruction 1", "Whole Group Instruction 2", etc.
- **Routine Cards**: Slides with text and/or images, rendered inline
- **Book Club**: Same format as Routine Cards
- **Standards**: Same format as Routine Cards

### 8.4 Resource Content Display

Each resource type has its own body template:
- `resoucesBodyLessonScreen` (HTML 2041-2076): List of vocabulary/WGI items with external link icons
- `resoucesBodyStandards` (HTML 2077-2136): Renders text slides and image slides inline
- `resoucesBodyRoutineCards` (HTML 2137-2196): Same pattern as Standards
- `resoucesBodyBookClub` (HTML 2197-2256): Same pattern as Standards

For text slides: displays `page_title` as bold header + `text_html` as content.
For image slides: displays `<img>` with `mediaPath + image` URL and `slide_title` as alt text.

### 8.5 Resource Popup (Lightbox)

Template: `resourcePopup` (HTML lines 1737-1765)

- Overlay: `.overley` (z-index 5)
- Lightbox: `.slide_upload_light_box.resource` (z-index 10)
- Close button: `#resource_close_btn` (`.light_box_close.sprite`)
- Content area: `.light_box_content` (margin: 45px 8px 20px 20px, max-height: 450px, overflow: auto)
- For images: `<img>` with source from projection URL
- For videos: HTML5 `<video>` element with video.js player, 600x300px

### 8.6 Visibility Rules

Resources tab is **hidden** when:
- Product code matches `GENERAL.c_s_ILIT_20` (iLIT 2.0)
- Product code matches `GENERAL.c_s_PROD_TYPE_WTW` (Words Their Way)

---

## 9. Colors Reference

### 9.1 Tab Colors

| Element | Hex | Context |
|---------|-----|---------|
| Journal tab bg | `#0b89b7` | Teal/cyan blue |
| Journal header | `#0b89b7` | `.tabs1 .notes_head_title` |
| Word Bank tab bg | `#1a5479` | Dark navy blue |
| Word Bank header | `#1a5479` | `.tabs2 .notes_head_title` |
| Class Notes tab bg | `#fc4333` | Red |
| Class Notes header | `#fc4333` | `.tabs3 .notes_head_title` |
| My Work tab bg | `#fd8d00` | Orange |
| My Work header | `#FD8D00` | `.tabs4 .notes_head_title` (dev override) |
| Resources tab bg | `#fcbb02` | Amber/yellow |
| Resources header | `#FCBB02` | `.tabs5 .notes_head_title` (dev override) |

### 9.2 Structural Colors

| Element | Hex | Context |
|---------|-----|---------|
| Notebook shell | `#6b6a68` | `.notes_wrapper` background |
| Toolbar (right) | `#555350` | `.notes_head_title2` background |
| Content card | `#cdd9e2` | `.notes_book_content` background (blue-gray) |
| Content area | `#ffffff` | `.notes_wrapper_content` background |
| Title underline | `#1a5479` | `.notes_book_title` border-bottom |
| Entry list border | `#e1e1e1` | `.notes_list_wrapper li a` border-bottom |
| Entry text | `#343434` | `.notes_list_wrapper li a` color |
| Tab border | `#363636` | `.tabs_s` border |
| Button bg | `#3444ad` | `button.button7` background (dark blue/purple) |
| Button shadow | `#1a2b96` | `button.button7` inset box-shadow |
| Button hover | `#3d57b4` | `button.button7:hover` |
| Close button bg | `#000000` | `.notes_close` background-color |
| Save/Cancel bar bg | `#eeeeee` | `.button_bar_wrapper` background |
| Save/Cancel bar border | `#d0d0d0` | `.button_bar_wrapper` border-top |
| Active sidebar link | `#ff8c00` | `li.active > a.groups` color (dev override) |
| Dialog overlay | `rgba(0,0,0,0.8)` | `.md-overlay` background |

### 9.3 Header Inset Shadow Pattern

Applied to both `.notes_head_title` and `.notes_head_title2`:
```css
box-shadow: 0 1px 2px 0 rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.15) inset;
```

---

## 10. Animations & Transitions

### 10.1 Landing Page to Open State

No CSS transition defined. The switch is a full DOM replacement:
1. User clicks fingerprint button (`.thumb_stamp`)
2. `NotebookView.showView()` called (JS line 136)
3. Fetches data via native calls
4. Replaces `#notebook_wrapper` innerHTML with the tab template

### 10.2 Tab Switching

No CSS animation. Full DOM replacement:
1. `NotebookView.goToTabs(tabType)` (JS line 192)
2. For Portfolio tabs: shows loading overlay with opacity 0.9, `loader.gif` spinner, 2000ms timeout
3. Replaces entire `#notebook_wrapper` content

### 10.3 Left Sidebar Accordion

jQuery slideUp/slideDown animations:
```javascript
// JS line ~976 (showhidemenupanel)
$('.notes_list_wrapper ul ul').slideUp();     // collapse all
$(clickedUnit).find('ul').slideDown();        // expand clicked
```

### 10.4 Loading Overlay

Applied during data fetch operations:
```javascript
$('.container_notes_wrapper')
    .css({'opacity': '0.9'})
    .append('<div class="notbookoverlay">' +
        '<img src="media/loader.gif" />' +
        '<p>Loading...</p>' +
    '</div>');
```

Overlay CSS (dev CSS lines 16-18):
```css
.notbookoverlay {
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 30; text-align: center; font-size: 13px;
}
.notbookoverlay img { left: 50%; position: absolute; top: 45%; }
.notbookoverlay p { left: 49.4%; position: absolute; top: 50%; }
```

### 10.5 Tooltip Show/Hide

Tooltips use direct jQuery `.show()/.hide()` on focus/blur events. No CSS transitions.

### 10.6 Modal Dialogs

CSS modal animation classes exist but are minimal:
```css
.md-overlay {
    transition: all 0.3s;  /* opacity fade */
}
```

---

## 11. Key CSS Measurements

### 11.1 Landing Page

| Property | Value | Selector |
|----------|-------|----------|
| Cover width | 422px | `.notes_book_icon` |
| Cover min-height | 605px (0 with dev override) | `.notes_book_icon` |
| Landing min-height | 550px | `.notes_landing` |
| Landing padding | 20px 0 14px 0 | `.notes_landing` |
| Fingerprint size | 64px x 85px | `.thumb_stamp` |
| Fingerprint position | right: 42px, top: 50% | `.thumb_stamp` |

### 11.2 Open Notebook Shell

| Property | Value | Selector |
|----------|-------|----------|
| Left panel min-width | 242px | `.notes_wrapper_left` |
| Left panel min-height | 610px | `.notes_wrapper_left` |
| Left panel padding | 10px 60px 10px 10px | `.notes_wrapper_left` |
| Right panel padding | 10px 60px 10px 15px | `.notes_wrapper_right` |
| Content card border-radius | 5px | `.notes_book_content` |
| Content card padding | 10px 0 | `.notes_book_content` |
| Content inner padding | 20px 40px 20px 30px | `.notes_wrapper_content_inner` |
| Paper content padding-bottom | 60px | `.note_comments` |

### 11.3 Header Bars

| Property | Value | Selector |
|----------|-------|----------|
| Header font-size | 18px | `.notes_head_title` |
| Header padding | 8px | `.notes_head_title` |
| Header line-height | 34px | `.notes_head_title` |
| Header border-radius | 5px | `.notes_head_title` |
| Close button size | 35px x 35px | `.notes_close` |
| Close button border-radius | 50% (circle) | `.notes_close` |
| Action icon size | 35px x 35px | `.notes_icn` |
| Action icon border-radius | 5px | `.notes_icn` |

### 11.4 Tab Dimensions

| Property | Value | Selector |
|----------|-------|----------|
| Tab strip width | 47px | `.tabbs_name` |
| Tab strip right offset | -47px | `.tabbs_name` |
| Tab strip top | 3px (dev override from 20px) | `.tabbs_name` |
| Tab padding | 7px 6px (dev override from 18px 6px) | `.tabs_s` |
| Tab border | 1px solid #363636 | `.tabs_s` |
| Tab arrow size | 10px borders | `.tabs_arrow` |

### 11.5 Content Areas

| Property | Value | Selector |
|----------|-------|----------|
| Entry list padding | 10px | `.notes_list_wrapper li a` |
| Entry list font-size | 16px | `.notes_list_wrapper li a` |
| Entry list border | 1px solid #e1e1e1 | `.notes_list_wrapper li a` |
| Title font-size | 26px | `.notes_book_title` |
| Title border-bottom | 1px solid #1a5479 | `.notes_book_title` |
| Title padding | 10px 0 | `.notes_book_title` |
| Label column width | 115px | `.notes_book_lt` |
| Label column padding-left | 10px | `.notes_book_lt` |
| Content line-height | 28px | `.note_comments` |
| Content font-size | 18px | `.note_comments` |
| Textarea font-size | 16px | `.textareaholder textarea` (dev) |
| Textarea line-height | 26px | `.textareaholder textarea` (dev) |
| Textarea min-height | 500px | `.textareaholder textarea` (dev) |

### 11.6 Button Bar

| Property | Value | Selector |
|----------|-------|----------|
| Bar background | #eeeeee | `.button_bar_wrapper` |
| Bar border-top | 1px solid #d0d0d0 | `.button_bar_wrapper` |
| Bar padding | 10px | `.button_bar_wrapper` |
| Button background | #3444ad | `button.button7` |
| Button border-radius | 5px | `button.button7` |
| Button padding | 10px 20px | `button.button7` |
| Button font-size | 15px | `button.button7` |
| Button font-weight | bold | `button.button7` |
| Button min-width | 90px | `button.button7` (dialog variant) |

### 11.7 Dynamic Height Calculation

The notebook uses JavaScript to fill the viewport height (JS resize methods):

```javascript
// JournalView.resize() - JS line 1707
var notesLandingPadding = notes_wrapper_padding + notes_head_title_height
    + container_notes_wrapper_title + save_panel_container
    + editor_panel_container_padding + editor_panel_container + 1;

$(".textareaholder").height($(window).height() - notesLandingPadding);
$(".notes_wrapper_left").height($(window).height() - rightSideFixed);
```

Both left sidebar and right content area are dynamically sized to fill the window, with overflow-y: auto for scrolling.

---

## 12. Media Assets

### 12.1 Background Images

| File | Used By | Purpose |
|------|---------|---------|
| `note_book.png` | `.notes_book_icon` | Notebook cover image (422x605px) |
| `finger_stamp.png` | `.thumb_stamp` | Fingerprint scanner button (64x85px) |
| `lading_page_bg.jpg` | `.notes_landing` | Landing page repeating background texture |
| `notes_rgt_bg.png` | `.notes_wrapper_left` | Spiral binding effect (repeats vertically on right edge) |
| `pad_bg.png` | `.notes_book_container` | Ruled-line paper texture (repeating) |
| `venn.png` | Venn Diagram template | Overlapping circles image |

### 12.2 Sprite Sheets

| File | Classes | Content |
|------|---------|---------|
| `sprite.png` | `.sprite` | Close button, delete/trash icon, send icon, add icon, arrow icons, search icon, close button variants |
| `sprite2.png` | `.sprite2` | Secondary UI elements |
| `sprite3.png` | `.sprite3` | Tab text labels (vertical), upload/external-link icon, graphic organizer icons, step arrows |

### 12.3 UI Assets

| File | Purpose |
|------|---------|
| `alert-icon.png` | Empty state icon (34px height) |
| `loader.gif` | Loading spinner animation |

### 12.4 Sprite Coordinates (Key Icons)

| Icon | Sprite | Background Position |
|------|--------|-------------------|
| Close button | sprite | `-415px -325px` |
| Tab text (Journal) | sprite3 | (varies per tab label) |
| Resources tab text | sprite3 | `-380px -87px` (h:94px) |
| My Work tab text | sprite3 | `-318px -87px` (h:76px) |
| Organize icon | sprite | `.notes_organizer` class |
| Arrow (collapsed) | sprite | `-473px -170px` |
| Arrow (expanded) | sprite | `-473px -211px` |
| Upload/external icon | sprite3 | `.upload_icon` class |
| Step arrow (organizers) | sprite3 | `.step_arrowicon` class |

---

## JavaScript View Architecture

### View Objects

| Object | JS Line | Role |
|--------|---------|------|
| `NotebookView` | 12 | Root controller. Manages landing/open state, tab routing, incremental save |
| `NotebookTabsView` | 402 | Shared tab behavior. Event binding, save/delete/close, accordion, tab switching |
| `JournalView` | 1130 | Journal tab. Renders left panel, inner panel, handles save/delete/add |
| `WordBankView` | 1778 | Word Bank tab. Three-field editor, JSON data format |
| `ClassNotesView` | 2309 | Class Notes tab. Rich text editor with graphic organizer insertion |
| `PortfolioView` | 3987 | My Work + Resources tabs. Unit hierarchy, assignment/resource display |

### Key Methods

| Method | Line | Purpose |
|--------|------|---------|
| `NotebookView.render()` | 76 | Renders landing page with notebook cover |
| `NotebookView.showView()` | 136 | Transitions from landing to open notebook |
| `NotebookView.goToTabs(tabType)` | 192 | Routes to correct tab view |
| `NotebookView.incrementalSave()` | 357 | Auto-save timer callback |
| `NotebookTabsView.bindEvents()` | 455 | Binds tab click, close, paste handlers |
| `NotebookTabsView.saveData()` | 633 | Universal save via `SaveNote` native call |
| `NotebookTabsView.deleteNote()` | ~700 | Delete via `DeleteNote` native call |
| `NotebookTabsView.showhidemenupanel()` | 976 | Left sidebar accordion logic |
| `JournalView.render()` | 1155 | Full journal render |
| `JournalView.innnerPanelRenderV2()` | 1275 | Fetch + render single journal entry |
| `JournalView.onSave()` | 1406 | Collect journal data for save |
| `JournalView.resize()` | 1707 | Dynamic height calculation |
| `WordBankView.render()` | ~1850 | Full word bank render |
| `WordBankView.onSave()` | 2013 | Collect word/definition/sentence as JSON |
| `ClassNotesView.render()` | ~2340 | Full class notes render |
| `ClassNotesView.innnerPanelRenderV2()` | 2864 | Fetch + render single note with organizers |
| `ClassNotesView.onSave()` | 3093 | Serialize contenteditable + organizers to JSON |
| `ClassNotesView.putHtmlAtCaret()` | 3737 | Insert organizer at cursor position |
| `ClassNotesView.saveSelection()` | 3790 | Save cursor position for organizer insertion |
| `ClassNotesView.resize()` | 3876 | Dynamic height calculation |
| `PortfolioView.init()` | 3995 | Initialize portfolio, fetch unit details |
| `PortfolioView.goToTabs()` | 4030 | Route between My Work and Resources |
| `PortfolioView.render()` | 4093 | Full portfolio render |
| `PortfolioView.leftPanelRender()` | 4149 | Render unit hierarchy sidebar |

### Native Bridge Calls

| Method | Purpose | Used By |
|--------|---------|--------|
| `GetNotelistV2` | Fetch all notes for a tab type | Journal, WordBank, ClassNotes |
| `GetNoteInfo` | Fetch single note content by ID | innnerPanelRenderV2 |
| `SaveNote` | Create or update a note | saveData |
| `DeleteNote` | Delete a note by ID | deleteNote |
| `GetUnitDetails` | Fetch unit/week structure | PortfolioView.init |
| `GetGradebookForStudent` | Fetch assignment scores | PortfolioView (legacy) |
| `GetGradebookForStudentV2` | Fetch assignment scores V2 | PortfolioView.getPortfolioDataV2 |
| `GetResourceInfo` | Fetch resource data | PortfolioView.goToTabs (Resources) |

---

## Implementation Notes for Modern Stack

### What to Keep
1. **Skeuomorphic design**: The notebook cover, spiral binding, ruled lines, and fingerprint scanner are core to the identity. Use the original PNG/JPG assets or create modern equivalents.
2. **Five-tab structure**: Journal, Word Bank, Class Notes, My Work, Resources -- keep all five with the same color scheme.
3. **Left sidebar + right content layout**: The two-panel layout with accordion sidebar is the defining pattern.
4. **Graphic organizers in Class Notes**: The 7 organizer types (Cause/Effect, Step by Step, Story Map, Three Column, Timeline, Two Column, Venn Diagram) are pedagogically important.

### What to Modernize
1. **No sprite sheets**: Replace sprite-based icons with SVG or icon libraries.
2. **No jQuery**: Use React state management instead of DOM manipulation.
3. **No native bridge**: Replace `$.nativeCall` with REST API or local state.
4. **Responsive design**: The original is fixed-width (1024px iPad). Make it responsive.
5. **CSS transitions**: Add smooth transitions for tab switching, sidebar accordion, and page state changes where the original has none.
6. **Incremental save**: Replace the timer-based approach with debounced auto-save on input change.
7. **Accessibility**: The original has basic ARIA attributes but inconsistent focus management. Improve keyboard navigation.

### Product-Specific Rules
- **iLIT 2.0**: Resources tab hidden, "Week" used instead of "Unit" for portfolio headers
- **WTW (Words Their Way)**: Resources tab hidden, "Sort" used instead of "Lessons", unit names come from `UnitNameArray`
- **Standard iLIT**: All tabs visible, standard "Unit X Lessons Y-Z" formatting
