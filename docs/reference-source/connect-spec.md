# ClassView I-LIT Connect Tab Feature Specification

Complete implementation reference extracted from the production Savvas I-LIT codebase. This document contains everything needed to build the Connect feature without reading the original source files.

## Source Files

| File | Path | Lines |
|------|------|-------|
| HTML (instructor/teacher) | `docs/reference-source/html/connect.html` | ~663 |
| HTML (student) | `docs/reference-source/html/student-connect.html` | ~244 |
| JavaScript (instructor) | `docs/reference-source/js/connect.js` | ~1900 |
| JavaScript (student) | `docs/classview/Webclient/App/js/student_connect.js` | ~173 |
| CSS (connect overrides) | `docs/reference-source/css/connect_dev.css` | ~169 |
| CSS (student connect) | `docs/reference-source/css/student_connect_dev.css` | ~190 |
| CSS (buzz shared) | `docs/classview/Webclient/App/css/buzz.css` | ~460 |
| CSS (buzz overrides) | `docs/classview/Webclient/App/css/buzz_dev.css` | ~460 |
| Constants | `docs/reference-source/js/constants.js` | CONNECT block (lines 1716-1767), STUDENT_CONNECT block (lines 1769-1772) |

---

## 1. Architecture Overview

The Connect feature has **two completely separate views** served from different HTML pages:

1. **Instructor/Teacher View** (`connect.html`) -- Has two sub-modes:
   - **Poll View** (`PollView`): Create, edit, send, and project polls to students
   - **Buzz View** (`BuzzView`): Send comments, pre-authored notes, and star ratings to students

2. **Student View** (`student-connect.html`) -- A single read-only view (`StudentConnectView`) showing:
   - Comments received from the teacher (in a table)
   - Star count with a large star graphic

For our replica, we only implement the **Student View** since we are building the student-facing app.

---

## 2. Student View DOM Structure

### 2.1 Page-Level Containers

```
<body>
  .wrapper                              // fade-in container (opacity 0 -> 1 on load)
    #connectStudent                     // main wrapper, height: 500px
      .backgound_images.bg13            // full-screen background image (bg3.jpg)
      .main_wrapper#toc_inner_container // centered content wrapper
        .buzz_wrapper#studentConnectWrapper  // white card container
          [rendered from studentConnectTemplate]
```

### 2.2 Student Connect Template (`studentConnectTemplate`)

```
.buzz_wrapper_inner
  .buzz_container                       // height: 500px, two-column layout
    .inner_content                      // left column (48% width, float:left)
      h1.heading1.left                  // "Comments" header
      button#buttonConnectRefresh       // refresh icon button (sprite)
        .refresh_icon.rconnect.sprite
      #buttonConnectRefreshTooltip      // tooltip: "Refresh" (shown on focus)
      .comment_show#cmtView             // scrollable comment list area
        [rendered from studentCmtTemplate]

    .buzzDiv#starview                   // right column (48% width, float:right)
      [rendered from studentStarTemplate]
```

### 2.3 Comment List Template (`studentCmtTemplate`)

```
table                                   // standard HTML table
  thead
    tr
      th  "Date"                        // 30% width
      th  "Comments"                    // 70% width
  tbody[aria-label="Comments"]
    tr (for each buzz entry)
      td  "MM/DD/YY"                    // date parsed from RevisionID
      td.comment  [comment text]        // pre-authored or personal comment
```

### 2.4 Star Display Template (`studentStarTemplate`)

```
.heading1                               // "Buzz" (hidden, display:none)
.star                                   // star image container (margin: 55px 0)
  img                                   // star_big_border.png (0 stars) or star_big_fill.png (>0 stars)
.heading2                               // "You have <b>N</b> stars !!!"
```

---

## 3. CSS Details

### 3.1 Page Background

```css
/* Full-screen background image behind the white card */
.bg13 {
    background: url(../media/bg3.jpg) no-repeat center bottom;
    height: 100%;
    background-size: cover;
}

/* The bg3.jpg is a dark gradient with constellation/particle effects */
/* Pink-to-teal gradient with connecting dots pattern */
```

### 3.2 White Card Container

```css
.buzz_wrapper {
    background: #fff;
    padding: 22px 18px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    height: 500px;
}

#connectStudent .main_wrapper {
    margin: 0 auto;
    max-width: 1003px;
    padding-top: 25px;
}
```

### 3.3 Two-Column Layout

```css
#connectStudent .buzz_container .inner_content {
    float: left;
    width: 48%;
}

#connectStudent .buzz_container .buzzDiv {
    float: right;
    width: 48%;
    text-align: center;
}
```

### 3.4 Comments Header

```css
.heading1 {
    text-align: center;
    margin-bottom: 20px;
}

/* In the left column, the "Comments" h1 has class .left which overrides to float:left */
.buzz_container .heading1 {
    padding-top: 9px;
}
```

### 3.5 Refresh Button

```css
.refresh_icon {
    width: 34px;
    height: 34px;
    background-position: -299px -614px;  /* sprite.png position */
    display: block;
    cursor: pointer;
    border: 0;
    padding: 0;
    margin: 0 20px 0 0;
    background-color: #6F9229;           /* olive green background */
}

.buzz_container .refresh_icon {
    background-position: -380px -614px;  /* alternate sprite position */
}
```

### 3.6 Comment Table

```css
#connectStudent table {
    margin-bottom: 20px;
    max-width: 100%;
    width: 100%;
    background-color: transparent;
    border-collapse: collapse;
    border-spacing: 0;
}

#connectStudent table > tbody > tr:nth-of-type(2n+1) {
    background-color: #f9f9f9;           /* zebra striping */
}

#connectStudent table > tbody > tr > td,
#connectStudent table > tbody > tr > th,
#connectStudent table > tfoot > tr > td {
    border: 1px solid #ddd;
}

#connectStudent table > tbody > tr > td,
#connectStudent table > tbody > tr > th {
    border-top: 1px solid #ddd;
    line-height: 1.42857;
    padding: 8px;
    vertical-align: top;
    font-size: 16px;
}

#connectStudent table > thead > tr > th {
    border: 1px solid #ddd;
    text-align: left;
    padding: 8px;
    vertical-align: top;
    font-size: 16px;
}
```

### 3.7 Comment Scroll Area

```css
.comment_show {
    height: 470px;
    overflow: auto;
}
```

### 3.8 Star Section

```css
.star {
    margin: 55px 0;
}

.heading2 {
    font-size: 24px;
}

.heading2 b {
    font-size: 30px;
    font-weight: bold;
}

.buzzDiv .heading1 {
    font-style: italic;
    font-size: 30px;
    font-weight: bold;
}
```

### 3.9 Global Styles

```css
body {
    line-height: 1;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 21px;
    color: #4e4e4e;
    font-weight: normal;
    min-height: 100%;
    background-color: #E0E1E1;
}

.buzz_container li {
    padding: 10px 15px;
    font-size: 17px;
    color: #000;
    cursor: pointer;
}
```

### 3.10 Fade-In Animation

```css
/* On load, the wrapper animates opacity from 0 to 1 over 800ms */
$('.wrapper').animate({'opacity': '1'}, 800);
```

---

## 4. Colors Reference

| Element | Hex | Context |
|---------|-----|---------|
| Page background | `#E0E1E1` | `body` background-color |
| Background image | `bg3.jpg` | Dark gradient with constellation pattern (pink-to-teal) |
| White card bg | `#ffffff` | `.buzz_wrapper` |
| Card shadow | `rgba(0,0,0,0.2)` | `.buzz_wrapper` box-shadow |
| Refresh button bg | `#6F9229` | `.refresh_icon` background-color (olive green) |
| Table border | `#dddddd` | Table cell borders |
| Zebra stripe | `#f9f9f9` | Odd table rows |
| Body text | `#4e4e4e` | Default body color |
| List item text | `#000000` | `.buzz_container li` color |
| Tooltip bg | `#000000` | `.commenttooltip` background |
| Tooltip text | `#ffffff` | `.commenttooltip` color |

---

## 5. Behavior & Interactions

### 5.1 Page Load Sequence

1. Page loads with `opacity: 0` on `.wrapper`
2. `buzz_info.js` is dynamically loaded (contains pre-authored comment data)
3. `GetBuzzCmtDetails` native call fetches student's buzz/comment data
4. Once data is received, `Application.init(VIEWTYPE.c_s_STUDENT_CONNECT)` initializes
5. `.wrapper` animates opacity to `1` over 800ms

### 5.2 Rendering Comments

`StudentConnectView.renderComments()` processes the buzz data:

1. Reverses the comment list (most recent first)
2. Renders the comment table via `studentCmtTemplate`
3. Calculates total stars: iterates backward through comments until hitting a system comment (`IsSysCmt === 1`), summing `StarCountForCMT` values
4. Renders the star display via `studentStarTemplate`

### 5.3 Date Parsing

Dates are extracted from the `RevisionID` field (a numeric string):

```javascript
var rId = val.RevisionID.toString().substring(0, 8);
var cmtMonth = rId.substring(4, 6);   // positions 4-5: month
var cmtDate = rId.substring(6, 8);    // positions 6-7: day
var cmtYear = rId.substring(2, 4);    // positions 2-3: year (2-digit)
// displayed as: MM/DD/YY
```

### 5.4 Comment Text Extraction

Each buzz entry has a `CMT_BUZZ` field containing a JSON string:

```javascript
var insBuzzCmt = JSON.parse(val.CMT_BUZZ);
// Structure: { comments: "text" | "", personalComments: "text" }
if (insBuzzCmt.comments !== "") {
    insCmt = insBuzzCmt.comments;         // pre-authored comments
} else {
    insCmt = insBuzzCmt.personalComments; // teacher's personal comment
}
```

### 5.5 Star Count Logic

Stars accumulate from the most recent system reset:

```javascript
// Iterate from oldest to newest (reversed array)
for (var i = studentCmt.length - 1; i >= 0; i--) {
    if (studentCmt[i].IsSysCmt === 1) { break; }  // stop at reset
    noOfStars += studentCmt[i].StarCountForCMT;
}
```

- When stars > 0: displays `star_big_fill.png` (filled star)
- When stars === 0: displays `star_big_border.png` (outlined star)
- Text: "You have **N** star(s) !!!" (singular/plural)

### 5.6 Refresh Button

- Calls `GetBuzzCmtDetails` native method to re-fetch comment data
- Re-renders comments and star count on completion
- Shows "Refresh" tooltip on focus, hides on blur
- Supports keyboard activation (Space/Enter keys)
- Has `aria-label="Refresh Button"` for accessibility

### 5.7 Dynamic Resize

```javascript
StudentConnectView.resize = function() {
    var window_height = $(window).height();
    var main_wrapper_padding = parseInt($('.main_wrapper').css('padding-top'))
        + parseInt($('.main_wrapper').css('padding-bottom'));
    var actual_height = window_height - (main_wrapper_padding * 2);
    $('.main_wrapper').height(actual_height);
    $("#connectStudent").height(actual_height);
    $(".buzz_container").height(actual_height);
}
```

The card fills the available viewport height dynamically.

---

## 6. Data Model

### 6.1 Buzz Comment Entry

Each entry in the buzz list (`objBuzzListData.Content`) has:

| Field | Type | Description |
|-------|------|-------------|
| `RevisionID` | string | Timestamp-based ID (e.g., "20260228..."), used for date display |
| `CMT_BUZZ` | string (JSON) | Serialized comment data: `{"comments":"...", "personalComments":"...", "studentIDs":[...]}` |
| `StarCountForCMT` | number | Stars awarded with this particular comment (0-3) |
| `IsSysCmt` | number | `1` if this is a system/reset comment, `0` if teacher comment |

### 6.2 Comment Data Structure (CMT_BUZZ parsed)

```json
{
    "comments": "Pre-authored comment text or empty string",
    "personalComments": "Teacher-written personal comment or empty string",
    "studentIDs": ["studentId1", "studentId2"]
}
```

Only one of `comments` or `personalComments` is non-empty per entry. The system enforces this -- both cannot be sent simultaneously.

### 6.3 Star Rating

- Stars are rated 0-3 per buzz (teacher selects 0-3 stars using a raty plugin)
- Stars accumulate until the teacher performs a "Reset Stars" action
- Reset inserts a system comment (`IsSysCmt: 1`) with the text: "I have reset the stars for the class. Let's start again. Good luck."
- Star count is calculated client-side by summing `StarCountForCMT` from the most recent reset forward

### 6.4 Constants (STUDENT_CONNECT)

```javascript
var STUDENT_CONNECT = {
    "c_s_MAIN_CONTAINER": "main_wrapper",
    "c_s_CONNECT_REFRESH": "buttonConnectRefresh"
};
```

### 6.5 Constants (CONNECT -- teacher side, for reference)

```javascript
var CONNECT = {
    "c_s_BUZZ_TITLE": "BUZZ!",
    "c_s_COMMENT_TITLE": "Comments",
    "c_s_PERSONAL_COMMENT_TITLE": "Teacher Comments",
    "c_s_STUDENT_LIST_TITLE": "Student List",
    "c_s_ALL_STUDENTS_TXT": "Select All Students",
    "c_s_RESET_BUZZ_BTN_TXT": "Reset Stars",
    "c_s_DONE_BUZZ_BTN_TXT": "Done",
    "c_s_BUZZ_SAVE_RECORD_ALERT": "BUZZ! sent successfully!",
    "c_s_BUZZ_RESET_RECORD_ALERT": "Stars reset successfully.",
    "c_s_BUZZ_DATA_RESET_TXT": "I have reset the stars for the class. Let's start again. Good luck.",
    "c_s_SELECT_STUDENT_ALERT": "Please select student(s)",
    "c_s_EMPTY_COMMENT_ALERT": "Please add a comment or send a star to the student",
    "c_s_WRONG_COMMENT_ALERT": "Please select either the Comments or Teacher Comments. Both message types can't be sent.",
    "c_s_PREAUTHORED_COMMNET_RESTICTION": "Max 3 pre-authored comments can be selected at one time.",
    "c_s_PERSONALCMT_CHAR_LIMIT": 500
};
```

---

## 7. Media Assets

### 7.1 Background Images

| File | Used By | Purpose |
|------|---------|---------|
| `bg3.jpg` | `.bg13` | Full-page background -- dark gradient with constellation/particle pattern (pink-to-teal) |

### 7.2 Star Images

| File | Used By | Purpose |
|------|---------|---------|
| `star_big_border.png` | `studentStarTemplate` | Large outlined star (shown when 0 stars) |
| `star_big_fill.png` | `studentStarTemplate` | Large filled star (shown when stars > 0) |
| `star-on.png` | Student list (teacher view) | Small filled star icon (16px width) |

### 7.3 Sprite Icons

| File | Classes | Content |
|------|---------|---------|
| `sprite.png` | `.sprite` | Refresh icon, delete icon, check icon, close icon |

### 7.4 Other Assets

| File | Purpose |
|------|---------|
| `multiple_user.png` | "Select All Students" icon (teacher view) |
| `loader.gif` | Loading spinner |

---

## 8. Key CSS Measurements

### 8.1 Card Layout

| Property | Value | Selector |
|----------|-------|----------|
| Card max-width | 1003px | `#connectStudent .main_wrapper` |
| Card padding-top | 25px | `#connectStudent .main_wrapper` |
| Card inner padding | 22px 18px | `.buzz_wrapper` |
| Card height | 500px | `.buzz_wrapper` |
| Card border-radius | 6px | `.buzz_wrapper` |
| Card box-shadow | `0 5px 10px rgba(0,0,0,0.2)` | `.buzz_wrapper` |

### 8.2 Content Columns

| Property | Value | Selector |
|----------|-------|----------|
| Left column width | 48% | `#connectStudent .buzz_container .inner_content` |
| Right column width | 48% | `#connectStudent .buzz_container .buzzDiv` |

### 8.3 Comment Area

| Property | Value | Selector |
|----------|-------|----------|
| Comment scroll height | 470px | `.comment_show` |
| Table cell padding | 8px | `td, th` |
| Table cell font-size | 16px | `td, th` |
| Table cell line-height | 1.42857 | `td` |

### 8.4 Star Area

| Property | Value | Selector |
|----------|-------|----------|
| Star margin | 55px 0 | `.star` |
| Star count font-size | 24px | `.heading2` |
| Star count number font-size | 30px | `.heading2 b` |

### 8.5 Refresh Button

| Property | Value | Selector |
|----------|-------|----------|
| Width | 34px | `.refresh_icon` |
| Height | 34px | `.refresh_icon` |
| Background color | #6F9229 | `.refresh_icon` |
| Margin | 0 20px 0 0 | `.refresh_icon` |

---

## 9. Teacher View (Buzz) -- Reference Only

The teacher "Buzz" view is the instructor-facing side. It is NOT needed for the student app, but is documented here for context about the data that flows to students.

### 9.1 Buzz Layout (Teacher)

```
.wrapper
  .assignment_background
    header
      .header_inner#renderBuzzHeaderArea    // Done button + Reset Stars button
    .view_assignment
      .main_wrapper
        .view_container_part
          #renderStudentsArea               // Student list with checkboxes
          #renderCommentsArea               // Pre-authored comments panel
          .Conferencing_part_rgt_panel
            #renderPersonalCommentsArea     // Teacher's personal comment textarea
            #renderBuzzArea                 // Star rating (0-3) + Buzz button
            .prjtopstars                    // "Project Top Stars" button
    #commentspopuparea                      // Comments dropdown popup
    #projectTopStrPopup                     // Top Stars projection popup
```

### 9.2 Buzz Workflow

1. Teacher selects students (individual or "Select All")
2. Teacher writes a personal comment OR selects up to 3 pre-authored comments (not both)
3. Teacher selects 0-3 stars using the raty star widget
4. Teacher clicks "BUZZ!" to send
5. Data is saved via `SetBuzzComment` native call
6. Students see the comment and star count on their Connect tab

### 9.3 Star Rating Widget (raty)

```javascript
$('#score-callback').raty({
    number: 3,
    hints: ['', '', ''],
    score: function() {
        return $(this).attr('data-score');
    }
});
```

- Uses the jQuery Raty plugin
- 3 stars maximum per buzz
- Stars are cumulative (total displayed, not per-message)

---

## 10. Teacher View (Poll) -- Reference Only

The Poll view allows teachers to create and send quick polls/surveys to students.

### 10.1 Poll Layout

```
.wrapper
  .assignment_background
    #headerpanel                           // "Done" button
    .view_assignment
      .main_wrapper
        .view_assignment_container_part
          #pollList                         // List of saved polls (left side)
          #pollForm                         // Poll creation form (right side)
```

### 10.2 Poll Form

- Question textarea (max 250 chars)
- 2-4 option input fields
- "+" button to add options (max 4, green circle `#34AD3C`)
- "-" button to remove options (red circle `#D20A22`)
- "Save & Next" button (disabled until question + 2 options filled)

### 10.3 Poll Sending

After saving, the teacher can:
- "Send Poll" -- broadcasts to students in current group
- "Project" -- shows poll on the projection screen
- Response bar graphs animate with per-option color coding:
  - Option 1: `#aa6bab` (purple)
  - Option 2: `#ec9c03` (orange)
  - Option 3: `#207ff3` (blue)
  - Option 4: `#16e6da` (cyan)
  - Options 5-6: repeat pattern

---

## 11. JavaScript View Architecture

### Student Side

| Object | File | Role |
|--------|------|------|
| `StudentConnectView` | `student_connect.js` | Static singleton. Renders comment table and star count. Handles refresh. |

### Key Methods (Student)

| Method | Purpose |
|--------|---------|
| `StudentConnectView.init(model)` | Initialize with model data, render, bind events |
| `StudentConnectView.render()` | Render main template, comments, resize |
| `StudentConnectView.bindEvents()` | Bind refresh button click/focus/blur/keydown |
| `StudentConnectView.resize()` | Fill viewport height dynamically |
| `StudentConnectView.renderComments()` | Render comment table + star count from buzz data |

### Teacher Side (for reference)

| Object | File | Role |
|--------|------|------|
| `ConnectView` | `connect.js` | Root controller. Routes to Poll or Buzz based on `ConnectData` |
| `PollView` | `connect.js` | Poll CRUD, send, project, response graphs |
| `PollSendView` | `connect.js` | Send/project poll screen with live response bars |
| `BuzzView` | `connect.js` | Student list, comments, star ratings, "BUZZ!" send |

### Native Bridge Calls

| Method | Direction | Purpose |
|--------|-----------|---------|
| `GetBuzzCmtDetails` | Student | Fetch buzz comments and stars for current student |
| `SetBuzzComment` | Teacher | Save buzz comment + stars for selected students |
| `GetPollList` | Teacher | Fetch all polls |
| `GetPollInfo` | Teacher | Fetch single poll details |
| `UpdatePoll` | Teacher | Create/update/delete a poll |
| `SetSurvey` | Teacher | Broadcast poll to students |
| `SetProjectSlide` | Teacher | Project content to classroom screen |

---

## 12. Implementation Notes for Modern Stack

### What to Build (Student View)

The student Connect tab is the **simplest feature** in the entire app. It consists of:

1. **Full-page gradient background** with constellation/particle pattern (matching `bg3.jpg`)
2. **White card** centered on page with rounded corners and shadow
3. **Two-column layout** inside the card:
   - **Left (48%)**: "Comments" heading + refresh button + scrollable comment table
   - **Right (48%)**: Large star image + star count text

### What to Keep

1. **Background**: The dark gradient with constellation pattern is shared across the app (same as assignments background). Replicate or reuse.
2. **White card layout**: Clean card-on-gradient pattern. Keep the rounded corners (6px) and shadow.
3. **Two-column split**: Comments on left, star display on right.
4. **Comment table**: Simple date + comment text table with zebra striping.
5. **Star display**: Large outlined star when 0, filled star when > 0. "You have N stars !!!" text.
6. **Refresh button**: Circular icon button in the header area.

### What to Modernize

1. **No jQuery**: Use React state for comment data and star count.
2. **No sprite sheets**: Replace the refresh icon sprite with an SVG refresh icon.
3. **No native bridge**: Replace `GetBuzzCmtDetails` with local state or mock data. In our static app, pre-populate with sample comments.
4. **Star images**: Replace PNG star images with an SVG star component. Use `stroke-only` for empty, `fill` for awarded.
5. **Responsive layout**: Original is fixed at 1003px max-width. Make the two-column layout stack on narrow screens.
6. **Animations**: Add a subtle fade-in on load (the original does `animate({opacity: 1}, 800)`). Consider adding a pulse animation to the star when stars > 0.
7. **Table styling**: Use Tailwind utility classes instead of raw CSS for the zebra-striped table.

### Static Content Approach

Since our app has no backend:
- Pre-populate with 3-5 sample comments from a "virtual teacher"
- Show a static star count (e.g., 3 stars)
- Refresh button can show a brief loading animation but return the same data
- Comments should feel encouraging and pedagogically appropriate for grades 4-8

### Sample Comment Data

```typescript
interface BuzzComment {
    date: string;        // "MM/DD/YY"
    comment: string;     // teacher comment text
    stars: number;       // 0-3 stars with this comment
    isSystemReset: boolean;  // true if this is a star reset entry
}

// Example data:
const sampleComments: BuzzComment[] = [
    { date: "02/28/26", comment: "Great participation in today's discussion!", stars: 2, isSystemReset: false },
    { date: "02/27/26", comment: "Nice job finishing your reading assignment on time.", stars: 1, isSystemReset: false },
    { date: "02/25/26", comment: "Keep up the excellent work with your vocabulary practice!", stars: 3, isSystemReset: false },
];
```

### Accessibility

The original has some accessibility features worth preserving:
- `aria-label="Refresh Button"` on the refresh button
- `aria-label="Comments"` on the tbody
- `role="tooltip"` on the refresh tooltip
- Keyboard support: Space/Enter to activate refresh button
- `tabindex="0"` on interactive elements

### File Location

Based on project structure: `app/dashboard/connect/page.tsx`

### Shared Layout

The Connect tab is rendered inside the dashboard layout (`app/dashboard/layout.tsx`) which provides the bottom navigation bar with five tabs: Review, Library, Notebook, Assignments, Connect.
