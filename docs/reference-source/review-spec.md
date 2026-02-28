# Book Review Feature: Complete Implementation Spec

> Extracted from the production ClassView source code. This document contains every UX-relevant detail needed to implement the Book Review feature without reading the original source files.

**Source files analyzed:**
- `html/book_review.html` (327 lines) -- HTML page + Underscore.js templates
- `js/book_review.js` (1005 lines) -- BookReview constructor, service handler, rendering, event binding
- `css/book_review.css` (192 lines) -- Base reset + component styles
- `css/book_review-dev.css` (145 lines) -- Override/layout styles, header, vertical centering
- `js/libraryview.js` (lines 32-59) -- Duplicate of predefined review comment codes

---

## 1. Overview

The Book Review is a modal-like full-screen overlay where students review books they have finished reading. It is opened from the "Review" tab in the bottom navigation bar. The page loads as an iframe (`bookReviewFrame`) inside the main student shell.

### Flow Summary

1. Student opens Review tab
2. System loads completed books from `GetLibraryProgressSummary()` and prior reviews from `GetBookReviewFeedback()`
3. If no completed books: show "No books available for review." message
4. If completed books exist: show book slider + review form
5. Student selects a book thumbnail, rates it with stars, picks up to 3 predefined feedback tags
6. Student optionally adds a free-text comment (150 char max)
7. Student previews and submits the review via `SaveBookReviewFeedback()`
8. Submitted reviews become read-only

---

## 2. DOM Structure

### Page-Level Containers

```
<body class="Library-wrapper">
  <div id="dynamicTextForSR" aria-live="assertive" class="assistive-text">
    <!-- Screen reader announcements -->
  </div>

  <header id="bookReviewHeader">
    <div class="header_inner" id="renderBookReviewHeaderArea">
      <!-- Rendered from #bookreviewheaderTemplate: "Done" button -->
    </div>
  </header>

  <div class="Library-wrapper-modal vertical-alignment-helper">
    <div class="modal-wrapper vertical-align-center">
      <div class="modal-content-main">
        <div class="modal-content-main-width" id="mainContainer">
          <!-- Rendered from templates based on state -->
        </div>
      </div>
    </div>
  </div>

  <div id="dialog-message" title="Alert!" class="Ilit_alert_box"></div>
  <div id="dialog-message-network" title="Alert!" class="Ilit_alert_box"></div>
</body>
```

### Template IDs (Underscore.js `<script type="text/template">`)

| Template ID | Purpose | Rendered Into |
|---|---|---|
| `bookreviewheaderTemplate` | Top nav bar with "Done" button | `#renderBookReviewHeaderArea` |
| `templateNoRecord` | Empty state: "No books available for review." | `#mainContainer` |
| `templateLandingPage` | Book slider + review form container | `#mainContainer` |
| `templateFormContent` | Star rating + feedback tags + book info | `#formContainer` |
| `templateButtonContent` | "Add Comments" and "Next" buttons | `#buttonContainer` |
| `templateAddComment` | Free-text comment textarea view | `#mainContainer` |
| `templatePreviewReview` | Preview before submit (read-only summary) | `#mainContainer` |

---

## 3. Screens and Layouts

### 3.1 Header Bar

A fixed black nav bar at top with a single "Done" button.

```
.header_inner
  border-bottom: 1px solid #000
  background-color: #000000

.unitname
  font-size: 18px
  color: #fff
  padding: 10px 0
  text-shadow: 0 1px 1px #333

button.button9
  background: #26282b
  border: 1px solid #fff
  color: #fff
  font-size: 15px
  padding: 4px 20px
  border-radius: 5px
  cursor: pointer

button.button9.active       (the "Done" button state)
  background: #fff
  color: #252629

button.button9.left
  margin-left: 10px
```

**Behavior:** Clicking "Done" closes the review iframe. On device, calls `CloseWebView()`. On web, calls `CloseReviewWindow()`. Also hides the native bottom bar.

### 3.2 Empty State

When no completed books exist:

```html
<div class="modal-head">Book Review</div>
<div class="modal-container">
  <div class="modal-block">
    <h1 class="txt_center">No books available for review.</h1>
  </div>
</div>
<div class="modal-foot"></div>
```

### 3.3 Landing Page (Book Slider + Review Form)

#### Modal Container

```
.Library-wrapper
  background-color: #585858

.Library-wrapper-modal
  position: fixed
  left: 0
  top: 0
  width: 100%
  height: 100%

.vertical-alignment-helper
  display: table
  height: 100%
  width: 100%

.vertical-align-center
  display: table-cell
  vertical-align: middle

.modal-content-main-width
  max-width: 600px
  margin: 0 auto

.modal-wrapper
  max-width: 600px      (dev override)
  margin: 20px auto 0
```

#### Gold Header

```
.modal-head
  background-color: #eeb01c
  border-radius: 5px 5px 0 0
  font-size: 18px
  text-align: center
  color: #fff
  font-weight: bold
  padding: 7px 15px
```

Text content: `"Book Review"`

#### Book Thumbnail Slider

Uses the Swiper library (`idangerous.swiper`) with pages of 5 books each.

```
.book-Library-slider
  background-color: #bfbfbf
  padding: 10px 35px
  position: relative

.book-Library-wrapper
  width: 500px
  margin: 0 auto
  overflow: hidden

.book-cover-slide
  width: 60px
  height: 91px
  float: left
  margin: 6px
  border: 5px solid transparent
  border-radius: 4px
  cursor: pointer

.book-cover-slide.active
  border: 5px solid #fff
  border-radius: 4px
  cursor: default

.book-cover-slide img
  height: 91px
```

**Unreviewed indicator:** A red circle with "!" on the top-right corner of unreviewed books:

```
.bookItem .unreviewed
  display: block
  float: right
  position: relative
  top: -106px
  right: -10px
  width: 20px
  height: 20px
  background-color: red
  border-radius: 50px
  color: #fff

.bookItem .unreviewed:before
  content: "!"
```

**Slider navigation arrows:** Sprite-based prev/next buttons positioned absolutely within the slider:

```
.lib-animation
  width: 30px
  height: 30px
  border: 0
  position: absolute
  top: 50%
  margin-top: -15px

.lib-next (prev button)
  background-position: -169px -471px
  left: 10px
  cursor: pointer

.lib-prev (next button)
  background-position: -173px -522px
  right: 10px
  cursor: pointer
```

**Slider behavior:**
- 5 books per page (swiper slide)
- `noSwiping: true` -- no drag swiping, navigation is button-only
- On slide change: first book in new slide auto-selects, review form updates
- Prev/Next buttons hidden at boundaries (first page hides prev, last page hides next, single page hides both)

#### Review Form (templateFormContent)

Left column (150px): Book cover image
Right column: Star rating, feedback tags, and (if reviewed) read-only summary

```
.modal-block
  padding: 10px

.modal-block-right
  padding: 0 10px

.modal-block h2
  font-size: 18px

.modal-block h3
  font-size: 15px

.font-weightnormal
  font-weight: normal
```

**Book info display:**
```
Title : [book_title]        (h2, title label normal weight, value bold)
Authors : [author_name]     (h3, label normal weight, value bold)
```

#### Star Rating (jQuery Raty Plugin)

5-star rating using `star-on.png` and `star-off.png` images:

```
#score-callback img
  width: 35px

.vertical-middle img
  width: 35px

.ratting-comt
  padding: 9px 0 0 10px
  font-weight: bold
  font-size: 14px
```

**Star rating labels** (displayed next to stars after selection):

| Rating | Label |
|---|---|
| 1 | "Did not like it" |
| 2 | "It was okay" |
| 3 | "Liked it" |
| 4 | "Really liked it" |
| 5 | "It was awesome" |

**Behavior:**
- Click a star to set rating
- Screen reader announces: "You have selected N out of 5, which means [label]"
- On hover, screen reader announces: "rating N out of 5"
- Read-only after review is submitted (`is_reviewed == "Y"`)
- Keyboard: Arrow left/right to navigate stars, Enter/Space to select

#### Predefined Feedback Tags

A bordered list where students pick up to 3 options:

```
.multi-Library
  border: 1px solid #ccc
  margin-top: 15px

.multi-Library-title
  font-weight: bold
  font-size: 16px
  padding: 5px 7px
  border-bottom: 1px solid #ccc

.multi-Library-content
  max-height: 150px
  overflow: auto
  margin: 0

.multi-Library-content li
  padding: 5px
  padding-right: 30px
  position: relative
  border-bottom: 1px solid #ddd

.multi-Library-content li:last-child
  border-bottom: 0

.multi-Library-content li.active
  background-color: #333
  color: #fff

.lib-mark                    (checkmark sprite on right side of each li)
  position: absolute
  width: 25px
  height: 25px
  right: 5px
  top: 50%
  margin-top: -12.5px
  background-position: -422px -702px
```

**Custom scrollbar (iOS fix):**
```
#listFeedback::-webkit-scrollbar
  -webkit-appearance: none

#listFeedback::-webkit-scrollbar:vertical
  width: 30px

#listFeedback::-webkit-scrollbar-thumb
  border-radius: 0px
  border: 2px solid #CFCDCD
  background-color: rgba(187, 185, 185, 0.5)

#listFeedback::-webkit-scrollbar-track
  background-color: #E6E4E4
  border-radius: 0px
```

Title text: `"- Please Choose -"`

**Behavior:**
- Maximum 3 selections. If a 4th is clicked, the first selected is deselected (FIFO)
- Toggle: clicking an active item deselects it
- Screen reader announces selection/deselection
- Read-only items (already reviewed) ignore clicks

#### Footer Buttons

```
.modal-foot
  text-align: right
  background-color: #fff
  border-radius: 0 0 5px 5px
  padding: 10px 15px

.btn-normal
  background-color: #000
  border-radius: 4px
  color: #fff
  font-size: 13px
  font-weight: 600
  border: 0
  padding: 7px 10px
  cursor: pointer
  text-transform: uppercase

.btn-normal.disabled
  cursor: default
  opacity: 0.5

.inactive
  opacity: 0.8
  cursor: default

.btn-float-left
  float: left

.margin-left5
  margin-left: 5px
```

Two buttons shown for unreviewed books:
- **"Add Comments"** (`#addComment`) -- right-aligned, navigates to comment textarea
- **"Next"** (`#btnDetail`) -- right of "Add Comments", navigates to preview

**Validation:** Both buttons require a star rating AND at least 1 feedback tag selected. If either is missing, shows alert: `"Please provide Rating & choose Option(s)."`

### 3.4 Add Comment View (templateAddComment)

Full replacement of `#mainContainer`. Shows book cover (left 150px), title/author, and a textarea.

```
.book-lib-textarea
  margin-top: 10px
  width: 100%
  min-height: 150px

.char-limit-label
  font-size: 12px
  line-height: 2px
```

Label text: `"Write your review here (150 characters)."`

**Behavior:**
- Textarea auto-focuses on render
- Character limit enforced on both `keyup` and `keydown`: truncates to 150 characters
- **"Save"** button stores comment in model and navigates to Preview
- **"Cancel"** button returns to Landing Page without saving comment

### 3.5 Preview View (templatePreviewReview)

Read-only summary of the review before submission. Shows:
- Book cover image (left 150px)
- Title + Author
- Star rating rendered as static `star-on.png` / `star-off.png` images (35px each) with label text
- Selected feedback tags as a bulleted list
- "My Comments" heading with the comment text (or "No comments available.")

Two buttons:
- **"Submit"** (`#btnSubmit`) -- saves to server, marks as reviewed, returns to Landing Page
- **"Cancel"** (`#btnCancel`) -- returns to Landing Page without saving

**Submit behavior:**
- Button gets `active` class to prevent double-submit
- Calls `SaveBookReviewFeedback(ItemID, Rating, Comments, CSVFeedbackTags)`
- On success, sets `is_reviewed = "Y"` and re-renders landing page
- Focus returns to "Done" button after 2s timeout
- Fires Google Analytics event `'S-RTO-SUB'`

---

## 4. Data Model

### Review Data Object (per book)

```typescript
interface BookReviewData {
  book_id: string;          // Matches library book ID
  book_title: string;
  author_name: string;
  book_image: string;       // Full URL to cover image
  is_reviewed: "Y" | "N";
  rating: string;           // "1"-"5" or "" if unrated
  comments: string;         // Free text, max 150 chars, URI-encoded for storage
  csv_feedback_tags: string; // Comma-separated codes, e.g. "C7,C11,C4"
}
```

### Star Ratings

```typescript
const StarRatings: Record<string, string> = {
  "1": "Did not like it",
  "2": "It was okay",
  "3": "Liked it",
  "4": "Really liked it",
  "5": "It was awesome"
};
```

### Predefined Comment Codes (C1-C26)

```typescript
const PredefinedCommentCodes: Record<string, string> = {
  "C1":  "It sucked",
  "C2":  "I liked it",
  "C3":  "I didn't like it",
  "C4":  "I learned a lot",
  "C5":  "It was too hard to read",
  "C6":  "I didn't understand it",
  "C7":  "It was exciting",
  "C8":  "It was boring",
  "C9":  "I liked the setting",
  "C10": "I liked the characters",
  "C11": "I related to the characters",
  "C12": "It was funny",
  "C13": "It was sad",
  "C14": "It was scary",
  "C15": "It was suspenseful",
  "C16": "It changed my point of view",
  "C17": "It changed my views",
  "C18": "I couldn't put it down",
  "C19": "I couldn't get into it",
  "C20": "I couldn't relate to the characters",
  "C21": "It inspired me",
  "C22": "It captured my imagination",
  "C23": "I enjoyed author's style",
  "C24": "Thought about when not reading it",
  "C25": "It was so exciting",
  "C26": "It was so boring"
};
```

### Grade-Band Comment Sets

Comments are filtered by grade band. Each band shows a different subset of the 26 codes:

| Band ID | Grades | Comment Codes |
|---|---|---|
| `gbp` | gk, g1, g2 | C1 |
| `gbe` | g3, g4, g5 | C2, C3, C4, C5, C6, C7, C8, C9, C10, C11, C12, C13, C14, C15, C16 |
| `gbm` | g6, g7, g8 | C7, C8, C4, C9, C11, C9, C15, C17, C18, C19, C20, C21, C12, C13, C22 |
| `gbh` | g9, g10, g11, g12 | C18, C19, C11, C20, C25, C26, C4, C17, C9, C23, C21, C24, C22, C12, C15 |

**For I-LIT (grades 4-8):** Use the `gbe` set (grades 3-5) and `gbm` set (grades 6-8). The grade is determined from `objLibraryJsonData.gradeId`.

### Service API Calls

| Service | Parameters | Purpose |
|---|---|---|
| `GetLibraryInfo()` | none | Returns library metadata (grade, media paths, JS paths) |
| `GetLibraryProgressSummary()` | none | Returns `BookCompletedItemIDs[]` -- list of finished book IDs |
| `GetBookReviewFeedback(itemIds)` | array of book IDs | Returns existing reviews: `{ItemID, Rating, Comments, FeebackTags}` |
| `SaveBookReviewFeedback(itemId, rating, comments, csvTags)` | single book | Persists a review |

---

## 5. Color Palette

| Element | Color | Hex |
|---|---|---|
| Page background | Dark gray | `#585858` |
| Modal header (gold) | Amber/gold | `#eeb01c` |
| Modal header text | White | `#fff` |
| Modal body background | White | `#fff` |
| Header bar background | Black | `#000000` |
| Header bar text | White | `#fff` |
| "Done" button (active) | White bg, dark text | `#fff` / `#252629` |
| "Done" button (inactive) | Dark bg, white text | `#26282b` / `#fff` |
| Book slider background | Medium gray | `#bfbfbf` |
| Selected book border | White | `#fff` |
| Unreviewed badge | Red circle | `red` (#ff0000) |
| Feedback tag (active) | Dark bg, white text | `#333` / `#fff` |
| Feedback tag border | Light gray | `#ccc` (container), `#ddd` (items) |
| Action buttons | Black bg, white text | `#000` / `#fff` |
| Body text | Dark gray | `#4e4e4e` |
| Scrollbar thumb | Translucent gray | `rgba(187, 185, 185, 0.5)` |
| Scrollbar track | Light gray | `#E6E4E4` |
| Scrollbar thumb border | Gray | `#CFCDCD` |

---

## 6. Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Body default | Helvetica, Arial, sans-serif | 16px | normal |
| Body line-height | -- | 24px | -- |
| Modal header | -- | 18px | bold |
| Book title (h2) | -- | 18px | bold (value), normal (label) |
| Author name (h3) | -- | 15px | bold (value), normal (label) |
| Star rating label | -- | 14px | bold |
| Feedback list title | -- | 16px | bold |
| Action buttons | -- | 13px | 600, uppercase |
| Character limit label | -- | 12px | normal |
| "Done" button | -- | 15px | normal |

---

## 7. Measurements Summary

| Element | Value |
|---|---|
| Modal max-width | 600px |
| Modal margin-top | 20px |
| Modal head padding | 7px 15px |
| Modal head border-radius | 5px 5px 0 0 |
| Modal foot padding | 10px 15px |
| Modal foot border-radius | 0 0 5px 5px |
| Block padding | 10px |
| Book thumbnail | 60px x 91px |
| Book thumbnail margin | 6px |
| Book thumbnail border | 5px solid (transparent or white) |
| Book cover image (in form) | 150px width |
| Slider padding | 10px 35px |
| Slider container width | 500px |
| Star image width | 35px |
| Nav arrow size | 30px x 30px |
| Unreviewed badge | 20px x 20px, border-radius 50px |
| Feedback list max-height | 150px (scrollable) |
| Feedback item padding | 5px (+ 30px right for checkmark) |
| Checkmark sprite | 25px x 25px |
| Textarea min-height | 150px |
| Button padding | 7px 10px |
| Button border-radius | 4px |
| Scrollbar width (iOS) | 30px |

---

## 8. Keyboard and Accessibility

### Focus Management
- On initial render, focus goes to "Done" button
- After returning from comment/preview, focus restores to last active element (`#addComment` or `#btnDetail`)
- After submit, focus returns to "Done" button after 2s
- Tab order cycles within the current view (header "Done" -> book items -> rating stars -> feedback tags -> buttons)

### Star Rating Keyboard
- `tabindex="0"` on the rating container (disabled when `is_reviewed == "Y"`)
- Each star image gets `tabindex="0"`
- Arrow Left/Right: navigate between stars
- Enter/Space: select current star
- Focus triggers mouseover (visual hover)
- Blur triggers mouseout

### Book Thumbnails Keyboard
- Each `.bookItem` has `tabindex="0"`
- Enter/Space: select book (triggers click)
- Focus adds `.active` class
- Tab at last book item wraps to "Done" if rating is disabled

### Screen Reader
- `#dynamicTextForSR` with `aria-live="assertive"` announces:
  - Book selection: "[book_title] has been selected"
  - Star hover: "rating N out of 5"
  - Star selection: "You have selected N out of 5, which means [label]"
  - Feedback tag toggle: "You have selected/unselected [tag text]"
- Comment textarea has `role="dialog"` with `aria-labelledby` and `aria-modal="true"`
- Rating container has `aria-label="Rate [book_title] Book"`
- Feedback list title has `aria-label="Please Choose review option"`

---

## 9. State Machine

```
[Loading]
  |
  v
[No Books] ------> (Done) ------> [Close]
  |
[Landing Page] --> select book --> re-render form
  |
  |-- (Add Comments) --> [Comment View]
  |     |-- (Save) ---------> [Preview View]
  |     |-- (Cancel) -------> [Landing Page]
  |
  |-- (Next) ------------> [Preview View]
  |     |-- (Submit) -------> save to server --> [Landing Page] (book marked reviewed)
  |     |-- (Cancel) -------> [Landing Page]
  |
  |-- (Done) ------------> [Close]
```

### Validation Gates
- "Add Comments" and "Next" both require: rating > 0 AND at least 1 feedback tag selected
- Alert on failure: `"Please provide Rating & choose Option(s)."`
- "Submit" prevents double-click via `.active` class check

---

## 10. Implementation Notes for Modern Stack

### Next.js + React Architecture

The Review page maps to `app/dashboard/review/page.tsx`. Unlike the original (which is a separate iframe-loaded HTML page), this should be a standard Next.js route within the dashboard layout.

### State Management

Use React `useState` for:
- `currentBookIndex: number` -- which book is selected in the slider
- `viewState: 'landing' | 'comment' | 'preview'` -- current screen
- `reviews: BookReviewData[]` -- all completed books with review state
- `pendingRating: number` -- star rating before submit
- `pendingTags: string[]` -- selected feedback codes (max 3)
- `pendingComment: string` -- free-text comment (max 150 chars)

### Star Rating Component

Replace jQuery Raty with a custom React component:
- 5 star icons (filled/empty SVGs or Lucide icons)
- Click to rate, hover to preview
- Read-only mode for submitted reviews
- Accessible with keyboard arrows + Enter

### Book Slider

Replace Swiper with a simple paginated list:
- 5 books per page
- Left/Right arrow buttons
- Selected book highlighted with white border
- Unreviewed books show red dot badge
- Consider using `framer-motion` for page transitions

### Feedback Tag Selector

Simple `<ul>` with toggle behavior:
- Track selected tags in state as `Set<string>` or `string[]`
- Max 3 enforced: on 4th selection, remove the oldest
- Active state: dark background + white text
- Show checkmark icon on selected items

### Comment Textarea

Standard `<textarea>` with:
- `maxLength={150}` attribute
- Character count display
- Auto-focus on mount

### Predefined Comments for I-LIT

Since I-LIT targets grades 4-8, use these two sets:

**Grades 4-5 (`gbe`):** "I liked it", "I didn't like it", "I learned a lot", "It was too hard to read", "I didn't understand it", "It was exciting", "It was boring", "I liked the setting", "I liked the characters", "I related to the characters", "It was funny", "It was sad", "It was scary", "It was suspenseful", "It changed my point of view"

**Grades 6-8 (`gbm`):** "It was exciting", "It was boring", "I learned a lot", "I liked the setting", "I related to the characters", "I liked the setting", "It was suspenseful", "It changed my views", "I couldn't put it down", "I couldn't get into it", "I couldn't relate to the characters", "It inspired me", "It was funny", "It was sad", "It captured my imagination"

For our static implementation (no grade detection), use the `gbe` set as the default since it is the most broadly applicable to grades 4-8.

### Data Persistence

The original uses server APIs. For our static app:
- Store reviews in `localStorage` keyed by book ID
- Structure: `{ [bookId]: { rating, tags, comment, timestamp } }`
- Mark books as reviewed in local state
- Consider syncing to a simple API later (LTI integration)

### Visual Design Adjustments

Keep the original's visual language:
- Gold header bar (`#eeb01c`)
- Dark page background (`#585858`)
- White modal body
- Black action buttons
- White-bordered active book thumbnail

The original design is functional but dated. For our version:
- Use Tailwind utility classes instead of raw CSS
- Replace sprite-based checkmarks with Lucide icons
- Use `framer-motion` `AnimatePresence` for screen transitions
- Consider making the star rating more visually prominent (larger touch targets for tablet use)
