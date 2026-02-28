# ClassView I-LIT Codebase Architecture

Reference documentation for the Savvas I-LIT ClassView student web application.
Covers the global shell, navigation, Connect tab, and Book Review feature.
Written for AI agents implementing replica features.

---

## Table of Contents

1. [Main Shell (student.html)](#1-main-shell)
2. [Bottom Navigation Bar](#2-bottom-navigation-bar)
3. [Class Switcher](#3-class-switcher)
4. [Connect Tab (Student Side)](#4-connect-tab-student-side)
5. [Connect Tab (Teacher Side)](#5-connect-tab-teacher-side)
6. [Book Review](#6-book-review)
7. [Application.js (Tab Switching Logic)](#7-applicationjs)
8. [Constants](#8-constants)
9. [Global Colors](#9-global-colors)
10. [Typography](#10-typography)
11. [Modal/Popup Patterns](#11-modalpopup-patterns)
12. [Loading States](#12-loading-states)
13. [Error States](#13-error-states)

---

## 1. Main Shell

**File:** `Webclient/student.html` (687 lines)

The student shell is the outermost page. It never navigates away -- all tab content loads inside an iframe. The shell owns the footer navigation bar, overlays (survey, broadcast, PDF reader, book review), and the class-switcher popup.

### DOM Structure

```
body
  .wrapper
    .main_wrapper
      header.top_navbar                      (hidden on student, used by instructor)
      .iframeWrap
        iframe#wrapperFrame                  (line 80 -- loads tab HTML pages)
      footer[role="navigation"]              (line 86 -- bottom nav bar)
        .footer_inner#footer-btn-cont        (tab buttons rendered here via template)
        #infoToolTip                         (gear popup: version, switch class, logout)
        button.logout_setting                (line 115 -- gear icon)
    .surveyOverlay                           (line 128 -- full-screen survey overlay)
    .broadcastOverlay                        (line 181 -- broadcast iframe overlay)
    .pdfReaderOverlay                        (line 194 -- PDF reader iframe overlay)
    .bookReviewWrapper                       (line 208 -- book review iframe overlay, display:none)
    .gradeSelect                             (rendered from template -- class list popup)
```

### Key Architecture Points

- **iframe-based tabs**: `#wrapperFrame` (line 80) is the single iframe that loads each tab's HTML.
  When a tab button is clicked, `student.js` line 655-696 replaces the iframe's content via
  `ifr.contentWindow.location.replace('App/<tabname>.html?_=' + cacheFreeValue)`.

- **Book Review is special**: Unlike other tabs, the Review tab does NOT load into `#wrapperFrame`.
  Instead it shows `div.bookReviewWrapper` (line 208) which contains its own iframe `#bookReviewFrame`
  (line 212) loading `App/book_review.html`. See `openPage()` in `student.js` lines 2032-2076.

- **Overlay iframes**: Broadcast (line 189, `#broadcastFrame`) and PDF reader (line 202, `#pdfReaderFrame`)
  each have their own fixed-position overlays with `z-index: 99999`.

- **DevTools prevention**: Lines 490-682 disable right-click, F12, Cmd+Opt+I, and other developer tool shortcuts.

### Templates (Underscore.js)

The shell uses `<script type="text/template">` blocks with Underscore.js `<%= %>` syntax:

| Template ID | Line | Purpose |
|---|---|---|
| `footer-buttons-student` | 251 | Footer tab buttons (Review, Library, Notebook, Assignments, Connect) |
| `class-switcher` | 264 | Class selection popup with overlay |
| `districtListTpl` | 300 | District dropdown for login |
| `tplLoginWrapper` | 317 | Full login form |

### Native Bridge Communication

The shell communicates with the native iOS/Chrome App wrapper via global functions:

- `HideNativeBottomBar(bool)` -- show/hide the native bottom bar
- `CloseWebView()` -- close the current web view on device
- `CloseConnectWindow()` -- close connect window in browser context
- `$.nativeCall({method, inputParams, globalResource, onComplete, ...})` -- async service call pattern
  used throughout the codebase. Polls a global variable at `interval` ms until it is set, then calls `onComplete`.

---

## 2. Bottom Navigation Bar

**Files:**
- Template: `student.html` lines 251-263
- CSS: `Webclient/css/style.css` lines 362-510
- Tab switching: `Webclient/js/student.js` lines 630-706

### Tab Buttons

Five tabs rendered from the `footer-buttons-student` template:

| Tab | CSS Class | Sprite Position | Verb ID | Iframe Target |
|---|---|---|---|---|
| Review | `.Review` | `-55px -526px` | `S-RE` | Opens `bookReviewWrapper` overlay, not `#wrapperFrame` |
| Library | `.Library` | `-196px -61px` | `S-LBTO` | `App/library.html` |
| Notebook | `.Notebooks` | `18px -235px` | `S-NTO` | `App/notebook.html` |
| Assignments | `.Assignments` | `22px -282px` | `S-ATO` | `App/assignment.html` |
| Connect | `.Connect` | `22px -587px` | `S-CO` | `App/student-connect.html` |

Each button has:
- `tabindex="0"` and `aria-label`
- `onkeydown="triggerClickOnThisElem(event, this)"` for keyboard support
- `class="... sprite footerTab valid-activity"`
- `data-verbid` for analytics

### Gear/Settings Button

A sixth button at the right end of the footer (line 115):
```html
<button class="logout_setting sprite right footerTab valid-activity" ...></button>
```
Toggles `#infoToolTip` (lines 93-113) which shows: app version, class name, config info, Switch Class button, Logout button.

### CSS Layout

**Footer bar** (`Webclient/css/style.css`):
- Container: gradient from `#404246` to `#28292b`, border-top `1px solid #545659` (lines 362-375)
- Tab buttons: 85-90px wide, 51px tall, `font-size: 13px`, color `#cccccc` (lines 400-430)
- Active state: `background-color: #17191a`, color `#fff`, `box-shadow: inset` (lines 440-455)
- Hover: `background-color: #17191a`, white text, inset shadow (same block)
- Icons: `background-image: url(../media/sprite.png)`, specific `background-position` per tab

### Tab Switching Logic

In `Webclient/js/student.js` lines 630-706:

```javascript
$('.footer_in button').off('click').on('click', function(e) {
    var buttonName = $.trim($(this).attr('class').toLowerCase());
    $('.footer_in button').removeClass('active');
    $(this).addClass('active');
    switch(true) {
        case (buttonName.indexOf('review') > -1):
            openPage({});  // special: opens bookReviewWrapper overlay
            break;
        case (buttonName.indexOf('library') > -1):
            document.getElementById("wrapperFrame").contentWindow.location.replace('App/library.html?_=' + cacheFreeValue);
            break;
        case (buttonName.indexOf('assignments') > -1):
            document.getElementById("wrapperFrame").contentWindow.location.replace('App/assignment.html?_=' + cacheFreeValue);
            break;
        case (buttonName.indexOf('notebooks') > -1):
            document.getElementById("wrapperFrame").contentWindow.location.replace('App/notebook.html?_=' + cacheFreeValue);
            break;
        case (buttonName.indexOf('connect') > -1):
            document.getElementById("wrapperFrame").contentWindow.location.replace('App/student-connect.html?_=' + cacheFreeValue);
            break;
    }
});
```

Key details:
- Tab detection is by checking if the button's class list contains the tab name (case-insensitive).
- Each switch case sets `sessionStorage` items: `currentTab`, `verbID`.
- Some tabs call `createLog()` for analytics.
- Cache-busting via `getTimeInMs()` appended as query param.

### Review Tab Special Handling

The Review tab does NOT load into `#wrapperFrame`. Instead, `openPage()` (student.js lines 2032-2076):

1. Shows `.bookReviewWrapper` as a full-screen overlay
2. Sets the loader (gray ajax spinner gif, 64px wide)
3. Sets `#bookReviewFrame` iframe src to `App/book_review.html`
4. On iframe load, hides the loader and shows the iframe
5. After showing review, re-activates the previously active tab button

---

## 3. Class Switcher

**Template:** `student.html` lines 264-298 (`#class-switcher`)

### Structure

- Dark overlay: `.selectGradeOverlayUI` -- fixed, black `#000`, opacity 0.7, z-index 1999
- Popup: `.assignments_wrapper` -- fixed, centered via CSS transforms, max-width 615px, z-index 2000
- Title bar: `.assignment_title` -- padding 25px, white text, font-size 30px, text "Select Class"
- Column headers: Class Name, Class ID, Section Name (line 273-276)
- Class list: `ul#classListUL` -- max-height 350px with overflow auto (CSS line 176 of global-style.css)
- Buttons: Cancel (`#btnCancelClassSelect`) and Select (`#btnClassSelect`)

### CSS Colors

From `Webclient/css/style.css` / `docs/reference-source/css/global-style.css`:
- Overlay: `background: #000`, `opacity: 0.7` (line 155 of global-style.css)
- Container: `background: #fff`, `border-radius: 8px` (line 157)
- List items: `font-size: 17px`, `color: #000`, active/hover `background-color: #007afd`, `color: #fff` (lines 165-167)
- Disabled items: `background-color: #9eaab6`, `color: #d2d2d2` (line 168)
- Button area: `padding: 10px 35px`, `border-top: 1px solid #ddd` (line 178)
- Buttons: `.button7` class -- `background: #3444ad`, `color: #fff`, `font-size: 15px`, `font-weight: bold`, `border-radius: 5px`, min-width 90px, width 140px (style.css lines 723-750)

---

## 4. Connect Tab (Student Side)

**Files:**
- HTML: `Webclient/App/student-connect.html` (244 lines)
- JS: `Webclient/App/js/student_connect.js` (173 lines)
- CSS: `Webclient/App/css/connect_dev.css` (169 lines)

### Overview

The student Connect tab is a simple view showing:
1. A "Comments" heading with a refresh button
2. A table of teacher-sent comments with dates
3. A star display showing accumulated stars

### Initialization

`student-connect.html` line 110:
```javascript
Application.init(VIEWTYPE.c_s_STUDENT_CONNECT);
```

This routes through `application.js` lines 140-146 to build the model:
```javascript
case VIEWTYPE.c_s_STUDENT_CONNECT:
    model = {
        "studentBuzzData": objBuzzListData.Content,
        "buzzNotes": objBuzzCommentData
    };
    StudentConnectView.init(model);
```

### Templates

**`studentConnectTemplate`** (lines 162-181): Main wrapper with:
- `<header>` containing "Comments" heading
- `#buttonConnectRefresh` -- refresh button with tooltip
- `#cmtView` -- container for comment list
- `#starview` -- container for star display

**`studentCmtTemplate`** (lines 182-230): Table with Date/Comments columns.
- Iterates over `buzzList` array
- Extracts date from `RevisionID` string (format: `RevisionId_YYYY-M-D_...`)
- Formats as `MM/DD/YYYY`
- Shows comment text from `BuzzCmt` field
- Falls back to `buzzCommentNotes` lookup table for pre-authored comments

**`studentStarTemplate`** (lines 231-243):
```html
<div class="star"><img src="media/<%=starimg%>" alt="<%=imgtext%>"></div>
<div class="heading2">You have <b><%=noOfStars%></b> stars !!!</div>
```
- Uses `star_big_fill.png` when stars > 0, `star_big_border.png` when 0
- Singular "star" when count is 1

### JS Behavior (`student_connect.js`)

**`StudentConnectView.init(model)`** (line 18):
- Renders templates
- Binds refresh button events
- Sets parent document title to include " - Connect"
- Disables browser back button

**`StudentConnectView.renderComments()`** (line 139):
- Reverses the comment list (newest first)
- Renders comment table via `studentCmtTemplate`
- Counts stars: iterates comments from newest, sums `StarCountForCMT` until hitting a system comment (`IsSysCmt === 1` -- this is a reset marker)
- Renders star template via `studentStarTemplate`

**Refresh button** (line 95):
- Calls `$.nativeCall({method: 'GetBuzzCmtDetails', ...})`
- On complete, updates `model.studentBuzzData` and re-renders

### Background

The page body has class `bg13` (line 151 of student-connect.html), which sets a background image from the constellation/gradient backgrounds used across the app.

---

## 5. Connect Tab (Teacher Side)

**Files:**
- HTML: `Webclient/App/connect.html` (663 lines)
- JS: `Webclient/App/js/connect.js` (~2089 lines)
- CSS: `Webclient/App/css/connect_dev.css` (169 lines)

### Overview

The teacher Connect page has two modes, selected based on data:

1. **PollView** -- Create/edit/send polls to students
2. **BuzzView** -- Send stars and comments to students

### Initialization

`connect.html` line 100/129:
```javascript
Application.init(VIEWTYPE.c_s_CONNECT);
```

Routes through `application.js` lines 134-139:
```javascript
case VIEWTYPE.c_s_CONNECT:
    model = { "ConnectData": objConnectData };
```

`ConnectView.init` (connect.js line 26) decides which view:
```javascript
if (model.ConnectData) {
    oSelf.viewType = new PollView(model);
} else {
    oSelf.viewType = new BuzzView(model);
}
```

### PollView (connect.js lines 119-865)

CRUD for teacher polls:
- **Create**: Form with question text (250 char limit) and 2-4 options (100 char limit each)
- **Edit**: Populates form from existing poll data
- **Delete**: Confirmation dialog, then `UpdatePoll` service call with delete flag
- **Send**: `PollSendView` -- project poll to student screens and/or broadcast as survey
- **Results**: Bar graph showing student responses with colors `#aa6bab`, `#ec9c03`, `#207ff3`, `#16e6da`

### BuzzView (connect.js lines 929-2089)

Teacher awards stars and sends comments to students:
- **Student list**: Rendered with checkboxes, sorted by last name
- **Star rating**: Uses jquery.raty with 3 stars (line 1087-1093), NOT 5 (unlike book review)
- **Comments**: Two types -- pre-authored (from `buzzCommentNotes`) and personal (free text, 500 char limit)
- **Validation**: Cannot send both comment types simultaneously (line 1193-1199)
- **Max 3 pre-authored comments** per send (line 1182-1189)
- **"BUZZ!" button** (`#buzzbtn`): Sends stars + comments to selected students
- **"Reset Stars"** (`#resetbuzzbtn`): Confirmation dialog, then resets all stars to 0 with system message
- **"Project Top Stars"** (`#prjbtn`): Shows popup sorted by star count
- **"Done"** (`#donebuzzbtn`): Closes connect window

### Co-Teacher Read-Only Access

Extensive co-teacher restrictions throughout (ILIT-2849):
- Poll options disabled
- Buzz/reset/project buttons disabled (opacity 0.3, cursor default)
- Star rating set to readOnly
- Checked via `objStudentListJsonData.userRoleInClass == 'CT'` and empty group ID

---

## 6. Book Review

**Files:**
- HTML: `Webclient/App/book_review.html` (327 lines)
- JS: `Webclient/App/js/book_review.js` (1005 lines)
- CSS: `Webclient/App/css/book_review.css` (192 lines)

### Overview

Book Review is a multi-step modal flow:
1. **Landing page**: Carousel of book covers to select
2. **Review form**: Star rating + feedback tags
3. **Add comments**: Free-text comment
4. **Preview**: Review summary before submission
5. **Submit**: Sends review to server

### How It Opens

From `student.js` `openPage()` (lines 2032-2076):
1. `.bookReviewWrapper` shown as full-screen overlay
2. Loader displayed (gray ajax spinner, 64px)
3. `#bookReviewFrame` iframe loads `App/book_review.html`
4. On load, loader hides, iframe shows

### Empty State

Template `templateNoRecord` (book_review.html lines 60-69):
```html
<div class="modal-head"><span>Book Review</span></div>
<div class="modal-container"><p>No books available for review.</p></div>
<div class="modal-foot"><!-- empty --></div>
```

### Landing Page

Template `templateLandingPage` (lines 70-125):
- Book cover slider using Swiper (iDangerous), 5 covers per slide
- Covers are 60x91px thumbnails with transparent 5px border; active cover gets white border
- Slider has prev/next navigation arrows
- Selected book shows title, author, and full-size cover image above the slider

### Review Form

Template `templateFormContent` (lines 127-189):

**Star Rating:**
- Uses jquery.raty with 5 stars (book_review.js line 487)
- Rating labels (lines 6-12):
  - 1 = "Did not like it"
  - 2 = "It was okay"
  - 3 = "Liked it"
  - 4 = "Really liked it"
  - 5 = "It was awesome"
- Star images: `star-on.png`, `star-off.png`, `star-half.png`, `cancel-on.png`, `cancel-off.png`
- ReadOnly when book already reviewed (line 488)

**Feedback Tags:**
- Multi-select dropdown, max 3 selections (book_review.js line 687)
- Pre-authored comments by grade band (lines 41-108):
  - `gbp` (gk-g2): "The book was easy to read", "The words were too hard", etc.
  - `gbe` (g3-g5): "This book taught me something new", "I would recommend this book", etc.
  - `gbm` (g6-g8): "This book made me feel ___", "The illustrations were great", etc.
  - `gbh` (g9-g12): "This book held my interest", "The ending of this book was satisfying", etc.
- 26 predefined comment codes (C1-C26, lines 13-40)
- Label shows "Please Choose" by default

### Comment Step

Template `templateAddComment` (lines 219-246):
- Textarea with 150-character limit (enforced in JS, lines 783-787)
- Save and Cancel buttons
- Character count display

### Preview Step

Template `templatePreviewReview` (lines 247-313):
- Shows stars as individual `star-on.png` / `star-off.png` images
- Lists selected feedback tags
- "My Comments" section with user's text
- Submit and Cancel buttons

### Header

Template `bookreviewheaderTemplate` (lines 316-326):
- "Done" button returns to Library tab

### Service Chain (book_review.js)

Sequential async calls (lines 110-285):
1. `importLibraryInfo` -- gets library metadata
2. `importGradeItem` -- gets student grade band
3. `importLibraryBooks` -- gets book list
4. `importLibraryProgress` -- gets reading progress per book
5. `importGetBookReviewFeedback` -- gets pre-authored feedback options
6. `prepareModel4BookReview` -- combines data into view model

### Validation Rules

- Rating AND at least 1 feedback tag required before "Add Comments" (lines 720-729)
- Max 3 feedback tags (line 687)
- Comment max 150 characters (lines 783-787)
- Already-reviewed books: star rating is readOnly, form buttons disabled

### CSS Highlights (`book_review.css`)

| Element | Property | Value |
|---|---|---|
| `.modal-head` | background | `#eeb01c` (gold) |
| `.modal-head` | color | `#fff` |
| `.modal-head` | font-size | 18px |
| `.modal-head` | border-radius | 8px 8px 0 0 |
| `.modal-container` | background | `#fff` |
| `.modal-foot` | background | `#fff` |
| `.modal-foot` | border-radius | 0 0 8px 8px |
| `.Library-wrapper` | background-color | `#585858` |
| `.btn-normal` | background | `#000` |
| `.btn-normal` | color | `#fff` |
| `.btn-normal` | font-size | 13px |
| `.btn-normal` | text-transform | uppercase |
| `.btn-normal` | border-radius | 4px |
| `.book-cover-slide` | size | 60x91px |
| `.book-cover-slide.active` | border | 5px solid white |
| `.book-Library-slider` | background | `#bfbfbf` |
| `.multi-Library-content li.active` | background | `#333` |
| `.multi-Library-content li.active` | color | `#fff` |

---

## 7. Application.js

**File:** `Webclient/App/js/application.js` (268 lines)

Static controller class that initializes the correct view based on the view type constant.

### `Application.init(type)` (line 15)

Sets `Application.mainContainer` to `$('#main_container')`, then calls `Application.callView(type)`.

### `Application.callView(idx)` (line 87)

1. Builds a `model` object from global JSON data variables
2. Instantiates and initializes the correct view class

**View type routing** (lines 22-82):

| VIEWTYPE constant | View class | iframe page |
|---|---|---|
| `c_s_CONNECT` | `ConnectView` | connect.html |
| `c_s_STUDENT_CONNECT` | `StudentConnectView` | student-connect.html |
| `c_s_CAROUSEL` | `LibraryCarouselView` | library.html |
| `c_s_LIBRARYHEADER` | `LibraryHeaderView` | library.html |
| `c_s_LISTVIEW` | `LibraryListView` | library.html |
| `c_s_BOOKPOPUPVIEW` | `BookPopupView` | library.html |
| `c_s_NOTEBOOK` | `NotebookView` | notebook.html |
| `c_s_NOTEBOOK_TABS` | `NotebookTabsView` | notebook.html |
| `c_s_ASSIGNMENT_TOC` | `AssignmentsTocView` | assignment.html |
| `c_s_ASSIGNMENT_SLIDES` | `AssignmentsSlidesView` | assignment.html |
| `c_s_LESSON` | `LessonView` | lesson.html |

### Model Construction (lines 87-222)

Each view type builds its model from global JSON variables set by `$.nativeCall`:

**CONNECT model** (lines 134-139):
```javascript
model = { "ConnectData": objConnectData };
```

**STUDENT_CONNECT model** (lines 140-146):
```javascript
model = {
    "studentBuzzData": objBuzzListData.Content,
    "buzzNotes": objBuzzCommentData
};
```

### Global Data Pattern

The app uses a pattern where `$.nativeCall` sets global variables (e.g., `objBuzzListData`, `objConnectData`, `objLibraryJsonData`) which are then read by `Application.callView()` to build the model. These globals are declared in the HTML pages' inline scripts before `Application.init()` is called.

### `Application.stageItem` (lines 249-258)

Getter/setter for tracking the current stage/view state. Used to track what the user is currently looking at for analytics and state management.

---

## 8. Constants

**File:** `Webclient/App/js/constants.js` (~1860+ lines)

### Key Code Constants (lines 5-15)

```javascript
c_i_ENTER_KEY_CODE = 13;
c_i_SPACE_KEY_CODE = 32;
c_i_TAB_KEY_CODE = 9;
c_i_ESC_KEY_CODE = 27;
c_i_LEFT_ARROW_KEY_CODE = 37;
c_i_UP_ARROW_KEY_CODE = 38;
c_i_RIGHT_ARROW_KEY_CODE = 39;
c_i_DOWN_ARROW_KEY_CODE = 40;
```

### TRACK_EVENT Analytics (lines 90-238)

Verb IDs for all trackable student actions:

| Verb ID | Action |
|---|---|
| `S-RE` | Review tab click |
| `S-LBTO` | Library tab click |
| `S-NTO` | Notebook tab click |
| `S-ATO` | Assignments tab click |
| `S-CO` | Connect tab click |
| `S-RTO` | Review tab opened |
| `S-CTO` | Connect tab opened |
| `S-SL` | Settings (gear) click |

### GENERAL Constants (lines 344-413)

```javascript
GENERAL.c_s_PRODUCT_TYPE_ILIT = "ilit";
GENERAL.c_s_PRODUCT_TYPE_MYELD = "myeld";
GENERAL.c_s_PRODUCT_TYPE_WTW = "wtw";
GENERAL.c_s_SPECIAL_CHARACTERS_BLANK = "";
GENERAL.c_s_USER_TYPE_CO_TEACHER = "CT";
GENERAL.c_i_PERSONAL_COMMENT_CHAR_LIMIT = 500;
```

### VIEWTYPE (lines 448-471)

All view type string constants used by `Application.init()`:

```javascript
VIEWTYPE.c_s_CAROUSEL = "studentCarousel";
VIEWTYPE.c_s_LIBRARYHEADER = "libraryHeader";
VIEWTYPE.c_s_LISTVIEW = "studentList";
VIEWTYPE.c_s_BOOKPOPUPVIEW = "bookPopup";
VIEWTYPE.c_s_ASSIGNMENT_TOC = "assignment_toc";
VIEWTYPE.c_s_ASSIGNMENT_SLIDES = "assignment_slides";
VIEWTYPE.c_s_LESSON = "lesson";
VIEWTYPE.c_s_NOTEBOOK = "notebook";
VIEWTYPE.c_s_NOTEBOOK_TABS = "notebook_tabs";
VIEWTYPE.c_s_CONNECT = "connect";
VIEWTYPE.c_s_STUDENT_CONNECT = "student_connect";
```

### CONNECT Constants (lines 1716-1768)

All UI strings and config for the Connect feature:

```javascript
CONNECT.c_s_COMMENT_TITLE = "Comments";
CONNECT.c_s_PERSONAL_COMMENT_TITLE = "Teacher Comments";
CONNECT.c_s_STUDENT_LIST_TITLE = "Student List";
CONNECT.c_s_BUZZ_TITLE = "BUZZ!";
CONNECT.c_s_ALL_STUDENTS_TXT = "Select All Students";
CONNECT.c_s_RESET_BUZZ_BTN_TXT = "Reset Stars";
CONNECT.c_s_DONE_BUZZ_BTN_TXT = "Done";
CONNECT.c_s_BUZZ_SAVE_RECORD_ALERT = "BUZZ! sent successfully!";
CONNECT.c_s_BUZZ_RESET_RECORD_ALERT = "Stars reset successfully.";
CONNECT.c_s_BUZZ_DATA_RESET_TXT = "I have reset the stars for the class. Let's start again. Good luck.";
CONNECT.c_s_PRJBTN_TXT = "Project Top Stars";
CONNECT.c_s_WRONG_COMMENT_ALERT = "Please select either the Comments or Teacher Comments. Both message types can't be sent.";
CONNECT.c_s_PREAUTHORED_COMMNET_RESTICTION = "Max 3 pre-authored comments can be selected at one time.";
CONNECT.c_s_RESET_STARS_CONFIRM_TXT = "Reset will remove all stars. Do you want to continue?";
CONNECT.c_s_CREATE_POLL_TITLE = "Create Poll";
CONNECT.c_s_EDIT_POLL_TITLE = "Edit Poll";
CONNECT.c_s_CONFIRM_DELETE_MSG = "Are you sure you want to delete?";
CONNECT.c_s_SELECT_STUDENT_ALERT = "Please select student(s)";
CONNECT.c_s_EMPTY_COMMENT_ALERT = "Please add a comment or send a star to the student";
CONNECT.c_s_PERSONALCMT_CHAR_LIMIT = 500;
CONNECT.c_i_POLL_QUES_CHAR_LIMIT = 250;
CONNECT.c_i_POLL_ANS_CHAR_LIMIT = 100;
CONNECT.c_s_MAX_INPUT = 4;  // max poll options
```

### STUDENT_CONNECT Constants (lines 1769-1772)

```javascript
STUDENT_CONNECT.c_s_MAIN_CONTAINER = "main_wrapper";
STUDENT_CONNECT.c_s_CONNECT_REFRESH = "buttonConnectRefresh";
```

---

## 9. Global Colors

### Navigation Bar

| Element | Color | Source |
|---|---|---|
| Footer gradient top | `#404246` | style.css line 365 |
| Footer gradient bottom | `#28292b` | style.css line 365 |
| Footer border-top | `#545659` | style.css line 366 |
| Tab text (inactive) | `#cccccc` | style.css line 420 |
| Tab text (active) | `#ffffff` | style.css line 445 |
| Tab active background | `#17191a` | style.css line 443 |
| Top bar gradient top | `#414347` | style.css line 510 |
| Top bar gradient bottom | `#232426` | style.css line 510 |

### Backgrounds

| Element | Color | Source |
|---|---|---|
| Body background | `#f4f4f4` | global-style.css line 30 |
| Body text | `#4e4e4e` | global-style.css line 27 |
| Book review wrapper | `#585858` | book_review.css line 1 |
| Book review modal head | `#eeb01c` (gold) | book_review.css line 5 |
| Book review modal body | `#ffffff` | book_review.css line 10 |
| Book slider background | `#bfbfbf` | book_review.css line 60 |
| Overlay (class switcher etc.) | `#000000` at 0.7 opacity | global-style.css line 155 |
| Survey overlay text | `#3B41BE` (blue) | style.css line 606 |

### Buttons

| Button | Background | Text | Source |
|---|---|---|---|
| `.button7` (primary) | `#3444ad` | `#ffffff` | style.css lines 724-750 |
| `.button7:hover` | `#3d57b4` | `#ffffff` | style.css line 752 |
| `.button7.active` (connect) | `#50b623` (green) | `#ffffff` | connect_dev.css |
| `.btn-normal` (book review) | `#000000` | `#ffffff` | book_review.css |
| Active class list item | `#007afd` (blue) | `#ffffff` | global-style.css line 167 |
| Disabled class list item | `#9eaab6` | `#d2d2d2` | global-style.css line 168 |

### Login

| Element | Color | Source |
|---|---|---|
| Instructor theme | `#ec6b06` (orange) | global-style.css line 131 |
| Student theme | `#3646B0` (blue) | global-style.css line 132 |
| Login field text | `#999999` | global-style.css line 142 |
| Login field font-size | 13px | global-style.css line 142 |

### Poll Bar Graph Colors (connect_dev.css)

| Bar | Color |
|---|---|
| Bar 1 | `#aa6bab` (purple) |
| Bar 2 | `#ec9c03` (orange) |
| Bar 3 | `#207ff3` (blue) |
| Bar 4 | `#16e6da` (cyan) |

---

## 10. Typography

### Global Font Stack

```css
font-family: Helvetica, Arial, sans-serif;
```

Set in `global-style.css` line 25 (body) and line 125 (buttons, inputs). Also restated in `style.css`.

### Font Sizes by Element

| Element | Size | Weight | Source |
|---|---|---|---|
| Body | 21px | normal | global-style.css line 26 |
| Paragraph line-height | 28px | -- | global-style.css line 52 |
| Footer tab label | 13px | normal | style.css line 420 |
| Primary button (`.button7`) | 15px | bold | style.css line 742 |
| Book review modal head | 18px | normal | book_review.css |
| Book review button (`.btn-normal`) | 13px | normal, uppercase | book_review.css |
| Class switcher title | 30px | normal | global-style.css line 161 |
| Class list items | 17px | normal | global-style.css line 165 |
| Assignment title (new) | 18px | normal | style.css line 640 |
| Question text | 16px-18px | normal | style.css lines 656-708 |
| Connect options | 18px | normal | style.css line 830 |
| Copyright/version | 9px | normal | global-style.css lines 151-152 |
| Alert dialog | 14px | normal | connect_dev.css |
| Alert title bar | 18px | normal | connect_dev.css |
| jQuery UI widgets | 0.99em | normal | style.css line 877 |
| Combobox/autocomplete | 13px | normal | style.css line 896 |

### Font Families in jQuery UI Context

```css
.ui-widget input, .ui-widget select, .ui-widget textarea, .ui-widget button {
    font-family: Verdana, Arial, sans-serif;
}
.ui-menu-item a, .ui-menu .ui-menu-item, .ui-widget .ui-widget {
    font-family: Helvetica, Arial, sans-serif;
}
```

---

## 11. Modal/Popup Patterns

### Pattern 1: Class Switcher Popup

- Fixed overlay (`z-index: 1999`) + centered popup (`z-index: 2000`)
- Overlay: `position: fixed; background: #000; opacity: 0.7; width: 100%; height: 100%`
- Popup: `position: fixed; top: 50%; left: 50%; transform: translateX(-50%) translateY(-50%); max-width: 615px`
- Container: `background: #fff; border-radius: 8px; overflow: hidden; min-height: 500px`
- Title bar: colored background, centered white text, 30px font
- Footer: `padding: 10px 35px; border-top: 1px solid #ddd`
- Buttons: Cancel + action, right-aligned

### Pattern 2: Book Review Modal

- Full-screen wrapper: `.Library-wrapper-modal { position: fixed; width: 100%; height: 100% }`
- Vertical centering: `.vertical-align-center` with display table/table-cell trick
- Header: `.modal-head` gold `#eeb01c`, white text, 18px, rounded top
- Body: `.modal-container` white, content area
- Footer: `.modal-foot` white, rounded bottom, right-aligned buttons

### Pattern 3: Alert/Confirm Dialogs

Uses jQuery UI dialog (`#dialog-message`):
```javascript
oSelf._alert({
    divId: 'dialog-message',
    title: 'Alert!',
    message: CONNECT.c_s_SELECT_STUDENT_ALERT
});

oSelf._confirm({
    divId: 'dialog-message',
    title: 'Alert!',
    message: CONNECT.c_s_RESET_STARS_CONFIRM_TXT,
    yes: function() { /* action */ }
});
```

Alert box CSS (`connect_dev.css`):
- `.Ilit_alert_box`: `border-radius: 8px`, `box-shadow`, `font-size: 14px`, `color: #444`
- Title bar: `background: #eeeeee`, `font-size: 18px`, `color: #000`

### Pattern 4: Overlay iframes

Full-screen overlays for broadcast and PDF reader:
```css
.surveyOverlay, .broadcastOverlay {
    position: fixed; width: 100%; height: 100%;
    bottom: 0; right: 0; left: 0;
    z-index: 99999; background: #fff; display: none;
}
```

### Pattern 5: Info Tooltip (Gear Menu)

`#infoToolTip` (student.html lines 93-113):
- Positioned near the gear button in footer
- White background, rounded corners, drop shadow
- Contains version info, class name, config settings
- Action buttons: `switchClass()`, `checkLogout()`

### Pattern 6: Connect Comment Popup

Positioned dynamically based on click coordinates (connect.js lines 1128-1131):
```javascript
$("#comment_list").css({
    top: e.pageY - 40,
    left: e.pageX + 160
}).toggle();
```

### Pattern 7: Project Top Stars Popup

BuzzView renders a popup listing students sorted by star count (connect.js lines 1775-1786), using the `projectTopstarTemplate` from connect.html.

---

## 12. Loading States

### Main Shell Loader

`student.html` line 89:
```html
<div class="loader stud"></div>
```

CSS (`style.css`):
```css
.loader {
    background: url(../media/ajax_loader_gray_512.gif) no-repeat center center;
    width: 22px;
    height: 22px;
}
```

### Book Review Loader (student.js lines 2044-2054)

When opening the Book Review overlay:
```javascript
$('.bookReviewWrapper .loader')
    .css({
        'width':        '100%',
        'height':       dWindowHeight,
        'line-height':  dWindowHeight + 'px',
        'text-align':   'center',
        'background':   'none',
        'display':      'block'
    })
    .html('<img src="media/ajax_loader_gray_512.gif" width="64" alt="" />');
```
- Gray spinner GIF, 64px wide, centered vertically and horizontally
- Disappears when iframe finishes loading

### In-App Loader (book_review.js lines 931-951)

Used during async service calls within book_review.js:
```javascript
oUtility.showLoader({
    'message': '<img src="media/loader.gif" alt="loading" />',
    'background-color': '#fff',
    'click-to-hide': false,
    'opacity': 0.5
});
```
- White background, 50% opacity
- `loader.gif` image, 80x80px box

### Connect Loader (connect.js)

Same `oUtility.showLoader` pattern used for:
- Loading poll info (line 367-372): background `none`, opacity 0.5
- Loading student list / class groups (line 1715-1720): background `#fff`, opacity 0.5
- Saving buzz data (line 1808-1813): background `none`, opacity 0.5
- Submitting poll (line 621-626): background `none`, opacity 0.5

### Login Loader

```html
<div class="loader login" style="display: none;"></div>
```
Inside the continue/login button, shown during authentication.

---

## 13. Error States

### Empty States

**Book Review -- No books** (book_review.html lines 60-69):
- Gold header "Book Review"
- Message: "No books available for review."
- Rendered when `prepareModel4BookReview` finds no unreviewed books

**Student Connect -- Zero stars**:
- Shows outline star image (`star_big_border.png`)
- Text: "You have 0 stars !!!"

### Validation Alerts

All use jQuery UI dialog pattern via `_alert()` or `_confirm()`:

| Context | Message | Source |
|---|---|---|
| No students selected | "Please select student(s)" | CONNECT.c_s_SELECT_STUDENT_ALERT |
| No comment or star | "Please add a comment or send a star to the student" | CONNECT.c_s_EMPTY_COMMENT_ALERT |
| Both comment types | "Please select either the Comments or Teacher Comments. Both message types can't be sent." | CONNECT.c_s_WRONG_COMMENT_ALERT |
| Too many comments | "Max 3 pre-authored comments can be selected at one time." | CONNECT.c_s_PREAUTHORED_COMMNET_RESTICTION |
| Poll question too long | "Oops, something is not right, try to shorten the question and try again." | CONNECT.c_s_POLL_QUES_MAX_CHAR_ALERT |
| Poll answer too long | "Oops, something is not right, try to shorten the options and try again." | CONNECT.c_s_POLL_ANS_MAX_CHAR_ALERT |
| Delete confirmation | "Are you sure you want to delete?" | CONNECT.c_s_CONFIRM_DELETE_MSG |
| Reset stars confirmation | "Reset will remove all stars. Do you want to continue?" | CONNECT.c_s_RESET_STARS_CONFIRM_TXT |

### Success Alerts

| Context | Message | Source |
|---|---|---|
| Stars reset | "Stars reset successfully." | CONNECT.c_s_BUZZ_RESET_RECORD_ALERT |
| Buzz sent | "BUZZ! sent successfully!" (commented out in code) | CONNECT.c_s_BUZZ_SAVE_RECORD_ALERT |

### Network Error

`student.js` lines 616-617, 777-778:
```javascript
if (typeof window.frames["wrapperFrame"].networkErrorAlert == "function") {
    window.frames["wrapperFrame"].networkErrorAlert(false);
}
```
Each tab page implements a `networkErrorAlert()` function that shows/hides an HTML alert for connectivity issues.

### Generic Fallback

`student.js` line 699:
```javascript
default:
    alert('No Method Found!');
```
Shown if the footer button class doesn't match any known tab name.

---

## Globals.js

**File:** `Webclient/App/js/globals.js` (25 lines)

Simple key-value store:
```javascript
var $GLOBALS = {};
$GLOBALS.set = function(key, value) { $GLOBALS[key] = value; };
$GLOBALS.get = function(key) { return $GLOBALS[key]; };
$GLOBALS.unset = function(key) { delete $GLOBALS[key]; };
```

Used sparingly; most state is in `sessionStorage` or global variables.

---

## Technology Stack Summary

| Technology | Version | Usage |
|---|---|---|
| jQuery | 1.10.2 (shell), 1.11.1 (app pages) | DOM, events, AJAX |
| jQuery UI | (bundled) | Dialogs, draggable, autocomplete |
| Underscore.js | (bundled) | Templates (`<%= %>`), collections |
| jquery.raty | (bundled) | Star ratings (3 stars for buzz, 5 for book review) |
| Swiper (iDangerous) | (bundled) | Book cover carousels |
| jquery.ui.touch-punch | (bundled) | Touch event support for jQuery UI |

### Patterns

- **MVC-like**: `Application.init(VIEWTYPE)` -> `Application.callView()` -> `View.init(model)`
- **iframe isolation**: Each tab runs in `#wrapperFrame`; shell communicates via `window.frames["wrapperFrame"]`
- **Native bridge**: `$.nativeCall()` for async service calls, polling global variables
- **Templates**: Underscore.js `<script type="text/template">` blocks
- **Product branching**: `GENERAL.c_s_PRODUCT_TYPE_ILIT`, `_MYELD`, `_WTW` for different CSS/behavior
- **Analytics**: `data-verbid` attributes + `callLogUserActivity()` + Google Analytics
- **Session state**: `sessionStorage` for `currentTab`, `verbID`, `eventStartTime`
