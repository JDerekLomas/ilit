# Savvas I-LIT Library Feature: Complete Implementation Spec

> Extracted from the production ClassView source code. This document contains every UX-relevant detail needed to implement the library feature without reading the original source files.

**Source files analyzed:**
- `library.html` (935 lines)
- `js/libraryview.js` (~4800 lines)
- `js/ilit_book_shelf_rounder.js` (906 lines)
- `js/fetchbooklist.js` (844KB, book data JSON)
- `css/library.css` (~900 lines)
- `css/library_dev.css` (~760 lines)
- `css/library.3dflow.css` (35 lines)
- `css/ILITBookShelfRounder.css` (139 lines)
- `js/constants.js` (LIBRARY constant block, lines 949-1028)

---

## 1. DOM Structure

### Page-Level Containers

```
<body>
  <header id="LibraryHeaderAreaContainer">
    <!-- Rendered from LibraryHeaderAreaTemplate -->
  </header>

  <section>
    <div id="mainCarouselArea">
      <!-- Rendered from CarouselLibraryAreaTemplate (carousel view)
           OR ListLibraryAreaTemplate (grid/list view) -->
    </div>
  </section>

  <div id="BookPopupAreaContainer">
    <!-- Rendered from BookPopupAreaTemplate when a book is selected -->
  </div>

  <div id="InventoryPopupContainer">
    <!-- Interest Inventory form, shown on first login -->
  </div>

  <div id="dialog-message" title="Under Construction" class="Ilit_alert_box"></div>
  <div id="dialog-message-network" title="Alert!" class="Ilit_alert_box"></div>
</body>
```

Source: `library.html` lines 1-935

### Template IDs (Underscore.js `<script type="text/template">`)

| Template ID | Purpose | HTML Line |
|---|---|---|
| `LibraryHeaderAreaTemplate` | Top bar: view toggle, filter tabs, search | ~207 |
| `CarouselLibraryAreaTemplate` | Carousel view: 3D book carousel + info bar | ~265 |
| `studentInformationAreaTemplate` | Student stats panel (words/pages/books/lexile) | ~410 |
| `teacherInformationAreaTemplate` | Teacher view panel (class/conference info) | ~327 |
| `ListLibraryAreaTemplate` | Grid/list view of books | ~555 |
| `BookPopupAreaTemplate` | Book detail popup (full-screen modal) | ~580 |
| `InventoryTemplate` | Interest inventory wrapper | ~667 |
| `InventorySwiper` | Interest inventory swiper slides | ~683 |
| `inventorySlideTemplate0-3` | Individual inventory slides | ~707-903 |
| `tplFacetList` | Draggable interest area items | ~906 |
| `tplUserFacets` | Drop targets for interest areas (5 slots) | ~914 |

### Key Container Constants (from `constants.js` line 949)

```js
LIBRARY.c_s_MAIN_CONTAINER = "mainCarouselArea"
LIBRARY.c_s_HEADER_CONTAINER = "LibraryHeaderAreaContainer"
LIBRARY.c_s_BOOK_POPUP_CONTAINER = "BookPopupAreaContainer"
LIBRARY.c_s_HEADER_TEMPLATE = "LibraryHeaderAreaTemplate"
LIBRARY.c_s_CAROUSEL_TEMPLATE = "CarouselLibraryAreaTemplate"
LIBRARY.c_s_LIST_TEMPLATE = "ListLibraryAreaTemplate"
LIBRARY.c_s_BOOK_POPUP_TEMPLATE = "BookPopupAreaTemplate"
```

### Carousel View Inner Structure

```
div.sliderWrap                    <!-- Background: book_bg.jpg texture -->
  div.curoselContainer            <!-- height: 190px, padding-top: 45px -->
    div.ILITBookShelfRounderWrapper   <!-- width: 960px, height: 211px -->
      div.iLithorizon             <!-- Created dynamically by carousel engine -->
        div.bookElement           <!-- Each book cover, absolutely positioned -->
          img                     <!-- Book cover image, 160x220px with 4px white border -->

div.sliderText                    <!-- Background: bg2.png -->
  span#bookName                   <!-- Current book title -->
  span#authorName                 <!-- Current book author -->

div.bookBoxWrap_out               <!-- Below carousel: book info + stats -->
  div.bookBoxContainer            <!-- max-width: 903px, display: flex -->
    div.currentReadingWrapper     <!-- 160x195px, left side: current reading cover -->
    div.middleBookInfoWrap        <!-- Center: RATA button + stats -->
      div.middleBookInfoMain      <!-- background: #121313, border-radius: 5px -->
        div.bookInnerHead         <!-- "Progress" header -->
        div.bookcontRow           <!-- Stats: Total Words, Total Pages, Total Books, IR Lexile -->
```

Source: `library.html` lines 265-560, `library_dev.css` lines 82-200

### Flat Carousel Fallback

When there are fewer books than `defaultLength` (15), the 3D carousel is replaced with a flat layout:

```
div.flatCarousel
  div.bookElement    <!-- Inline flow instead of absolute positioning -->
    img              <!-- Book cover -->
```

Source: `libraryview.js` line 1570

---

## 2. Filter Tabs

### Tab Bar Structure

```html
<div class="top_navbar">
  <div class="tabbing">
    <button class="button8 active" data-text="all">All Titles</button>
    <button class="button8" data-text="myLevel">My Level</button>
    <button class="button8" data-text="myRead">My Books</button>
    <button class="button8" data-text="recommended">Recommended</button>
    <button class="button8" data-text="reviewed">Reviewed</button>
    <button class="button8" data-text="reserved">Reserved</button>
  </div>
</div>
```

Source: `library.html` lines 220-233

### Tab Data Attributes and API Behavior

| Tab Label | `data-text` | Filtering Logic | Source Line |
|---|---|---|---|
| All Titles | `all` | Shows all books from `objBookList.bookset[0]`, loads first 15 into carousel | libraryview.js:613 |
| My Level | `myLevel` | Filters by `lexile_level` within +/- 25 of student's level | libraryview.js:651-658, 2356-2408 |
| My Books | `myRead` | Shows books the student has read (from `libraryProgressSummary.Content.BookItemIDs`) | libraryview.js:2184-2307 |
| Recommended | `recommended` | API call to get recommended books | libraryview.js:416 |
| Reviewed | `reviewed` | API call to get reviewed books; shows star ratings | libraryview.js:416, 1503-1529 |
| Reserved | `reserved` | API call to get reserved books; shows X remove button | libraryview.js:416, 1532-1534 |

### Tab State Management

```js
LibraryCarouselView.ActiveTab = 'all';  // Default (line 18)
```

Tab click handler (`libraryview.js` line 416):
1. Removes `.active` from all buttons
2. Adds `.active` to clicked button
3. Sets `LibraryCarouselView.ActiveTab` to the button's `data-text` value
4. For `myLevel`, `myRead`: filters locally from loaded book data
5. For `recommended`, `reviewed`, `reserved`: makes API calls via `$.nativeCall()`

### Tab CSS

```css
/* Inactive tab */
button.button8 {
  background: none;
  padding: 4px 20px;
  color: #fff;
  border: none;
  cursor: pointer;
}

/* Active tab */
button.button8.active {
  background: #fff;
  color: #000;
  border-radius: 3px;
}

/* Tab container */
.tabbing {
  border: 1px solid #fff;
  border-radius: 5px;
  display: inline-block;
}

/* Top navbar */
.top_navbar {
  background: #2a2b2d;
  border-bottom: 1px solid #353637;
  padding: 5px 10px;
}
```

Source: `library.css` lines 597-625

### Reviewed Sub-Tabs

When the "Reviewed" tab is active, three sub-tabs appear:

```js
LibraryCarouselView.reviewActiveTab  // "allStudent", "myLevel", or "myGrade"
```

These filter reviews by: all students, books at student's level, or by grade level. Source: `libraryview.js` lines 1503-1527

### My Level Filtering Formula

```js
// Student's lexile level +/- 25
obj.lexile_level >= (parseInt(objUserLevel.Content.LexileLevel) - 25) &&
obj.lexile_level <= (parseInt(objUserLevel.Content.LexileLevel) + 25)
```

Source: `libraryview.js` lines 2401-2405

---

## 3. 3D Carousel Engine

### Plugin: ILITBookShelfRounder

jQuery plugin defined in `ilit_book_shelf_rounder.js`. Attaches to a container element and manages a horizontal carousel of absolutely-positioned book cover elements.

### Constants (`ilit_book_shelf_rounder.js` lines 1-20)

```js
PERSPECTIVE_3D: 1500        // CSS perspective for 3D mode
PERSPECTIVE_2D: 500         // CSS perspective for 2D mode
BOOK_SCALE_DIFFERENCE_COEFF: 110
CARD_SHOW_COEFF: 8          // Number of visible book cards on each side
MAX_Z_INDEX: 800
MINIMUM_H_MOVE_DISTANCE: 300
BASIC_STANDARD_TIME: 1000/60  // ~16.67ms (60fps target)
```

### Default Configuration (`ilit_book_shelf_rounder.js` line 274)

```js
{
  centerBookIndex: 0,
  nonstopOccurrence: true,
  gapAtNormalEnvironment: 200,
  gapAt3DEnvironment: 200,
  floorLine: "top:48%",
  itemAlign: "middle",
  animationSmoothCoeff: 20,
  fadeEdgeItems: true,
  autoChangeDelay: 4000
}
```

### Actual Configuration Used (`libraryview.js` lines 1375-1443)

```js
$(".ILITBookShelfRounderWrapper").ILITBookShelfRounder({
  width: 1000,
  gapAt3DEnvironment: 100,
  gapAtNormalEnvironment: 880,
  autoScale: 65,
  centerBookIndex: LibraryCarouselView.middlePointer,  // default: 8
  nonstopOccurrence: true,
  atMovementEnd: function(middleIndex) {
    // Updates book title and author display
    LibraryCarouselView.showBookInformation(bookData);
  },
  onBookClicked: function(bookData) {
    LibraryCarouselView.ShowBookPopup(bookData);
  }
});
```

### 3D Transform Math

**Easing function** - `ROUND_FEEL` (`ilit_book_shelf_rounder.js` lines 49-52):

```js
// easeInOutSine curve
position = -widthOfContainer/2 * (Math.cos(PI * distance / tempWidth) - 1)
```

**Book positioning** - `makeRounderFrame3D` (`ilit_book_shelf_rounder.js` line 813):

For each book element at distance `g` from center:
```js
// Z-index: center book gets highest, falls off with distance
z_index = Math.floor(500 - 10 * g)    // where g = abs distance percentage

// 3D transform
translateZ = 5 * -g                     // pushes side books back
translateY = calculated from easeInOutSine
translateX = calculated from position on curve
```

**Container scaling** (`ilit_book_shelf_rounder.js` line 783):
```js
// Container is scaled to 0.9x in decideToImpound
transform: scale(0.9)
```

### Animation Loop

Uses `requestAnimationFrame` with smooth interpolation:

```js
// Animation smooth coefficient (higher = slower/smoother)
animationSmoothCoeff: 20

// Frame calculation
BASIC_STANDARD_TIME = 1000/60  // 16.67ms per frame
// Moves position incrementally each frame toward target
```

Source: `ilit_book_shelf_rounder.js` lines 735-830

### Swipe/Touch Handling

**Touch events** (`ilit_book_shelf_rounder.js` lines 400-500):
- `touchstart`: Records start X/Y position
- `touchmove`: Calculates X displacement, moves carousel proportionally
- `touchend`: Calls `keenAdjustment()` to snap to nearest book

**Mouse events**: Same pattern with `mousedown`/`mousemove`/`mouseup`

**Keyboard navigation** (`libraryview.js` lines 1673-1713):
```js
VK_LEFT (37): window.BookShelfRounder.animateToRelativeItem(-1)
VK_RIGHT (39): window.BookShelfRounder.animateToRelativeItem(1)
VK_TAB (9): Remove focus from carousel books
```

**Prev/Next buttons**:
```js
$("#nextCarousel").on('click tap', function() {
  window.BookShelfRounder.animateToRelativeItem(1);
});
$("#prevCarousel").on('click tap', function() {
  window.BookShelfRounder.animateToRelativeItem(-1);
});
```

Source: `libraryview.js` lines 1697-1703

### Key Methods

| Method | Purpose | Line |
|---|---|---|
| `sendToMiddle(index)` | Centers a specific book | ilit_book_shelf_rounder.js |
| `animateToRelativeItem(delta)` | Move N items left/right | ilit_book_shelf_rounder.js |
| `keenAdjustment()` | Snap to nearest book after swipe | ilit_book_shelf_rounder.js |
| `makeRounderFrame3D()` | Position all books with 3D transforms | ilit_book_shelf_rounder.js:813 |
| `getMiddleItem()` | Returns the centered book element | ilit_book_shelf_rounder.js |

### Lazy Image Loading

Books use lazy loading via `targetsrc` attribute:
```js
// On append, reads 'targetsrc' and sets 'src'
$(element).attr('src', $(element).attr('targetsrc'));
```

Source: `ilit_book_shelf_rounder.js` line 689

### Carousel vs Flat Switch

If there are 15 or fewer books (`count <= defaultLength`), the carousel switches to a simple flat grid layout instead of the 3D carousel:

```js
if (count <= defaultLength) {
  // Flat carousel - no 3D transforms
  $("#mainCarouselArea").find(".sliderWrap").html(
    "<div class='flatCarousel'>" + container.html() + "</div>"
  );
} else {
  // 3D carousel
  BookShelfRounder = createBookShelfRounder();
}
```

Source: `libraryview.js` lines 1568-1588

---

## 4. Book Detail Panel

### Below-Carousel Info Panel

When a book is centered in the carousel, its info appears below:

**Title/Author bar** (`.sliderText` area):
```html
<span id="bookName"><!-- Book title --></span>
<span id="authorName"><!-- Author name --></span>
```

Updated by `showBookInformation()` at `libraryview.js` line 1810.

**Stats panel** (`.middleBookInfoMain`):
```html
<div class="middleBookInfoMain">
  <div class="bookInnerHead">Progress</div>
  <div class="bookcontRow">
    <span>Total Words</span>: <span id="totalWords">-</span>
  </div>
  <div class="bookcontRow">
    <span>Total Pages</span>: <span id="totalPages">-</span>
  </div>
  <div class="bookcontRow">
    <span>Total Books</span>: <span id="totalBooks">-</span>
  </div>
  <div class="bookcontRow">
    <span>IR Lexile Level</span>: <span id="lexileLevel">-</span>
  </div>
</div>
```

Source: `library.html` lines 498-527

Stats are populated by `checkForProgress()` at `libraryview.js` lines 2504-2597:
```js
$('#totalWords').text(totalwords);     // formatted with thousands separators
$('#totalPages').text(totalpages);
$('#totalBooks').text(totalBook);
$('#lexileLevel').text(lexileLevel);   // "-" if 0
```

**Current Reading button**:
```html
<button class="button7">My Current Reading</button>
```

**RATA button** (Read Aloud Think Aloud):
```html
<button class="button7">Read Aloud Think Aloud</button>
```

Visible only for books with `book_type === "R"`.

### Book Popup Modal (BookPopupAreaTemplate)

Triggered by clicking a book cover. Full-screen modal overlay.

Source: `library.html` lines 580-664

**Structure:**
```html
<div id="bookPopup" class="md-modal md-effect-13 md-show bookReadPopup"
     role="dialog" aria-modal="true">
  <div class="md-content">

    <!-- Left: Cover image + Read button -->
    <div class="img_boxeas right">
      <div class="img_boxeas_box">
        <img src="[cover image]" />
      </div>
      <button class="button7 btn" id="readBookBtn">Read This Book</button>
    </div>

    <!-- Center: Book metadata -->
    <div class="middle">
      <h3>[Book Title]</h3>
      <div class="title_bg">[Author Name]</div>
      <div class="book_desp">
        <p><strong>Genre</strong>: [genre]</p>
        <p><strong>Printed book page count</strong>: [pages]</p>
        <p><strong>Estimated Lexile Level</strong>: [lexile]</p>
        <p><strong>Average Rating</strong>:
          <div class="startRateContainer">
            <div class="offStar"></div>
            <div class="onStar" style="width:[rating*24.2]px"></div>
            <div class="ratingNumber">([rating])</div>
          </div>
        </p>
        <p><strong>User Comments</strong>: [comma-separated feedback phrases]</p>
      </div>
    </div>

    <!-- About this book (if description exists) -->
    <div class="about_book">
      <div class="about_book_title">About this book:</div>
      <div class="about_book_content">[description]</div>
    </div>

    <!-- Action buttons -->
    <div class="button_place">
      <button class="button7 btn" id="closeBookPopup">Back to Library</button>
      <!-- Student-only buttons: -->
      <button class="button7 btn book_reserve_btn">Reserve</button>
      <!-- OR if already reserved: -->
      <button class="button7 btn book_remove_btn">Remove</button>
      <!-- If auto-read enabled: -->
      <button class="button7 btn book_read_btn" id="autoReadBook">Book Read</button>
    </div>
  </div>
  <div class="md-overlay"></div>
</div>
```

### Book Popup Data Assembly (`libraryview.js` lines 4397-4448)

The popup model is an array:
```js
selectedBook[0] = bookObject;              // Full book data object
selectedBook[1] = LibraryCarouselView.ActiveTab;  // Current tab name
selectedBook[2] = globalAvgRating;         // Number (e.g., 3.5)
selectedBook[3] = [feedback phrases];      // Array of strings from bookReviewComments
```

### Star Rating Calculation

```js
// Rating display width in popup
width = ratingValue * 24.2  // pixels per star

// Rating display in carousel (reviewed tab)
width = star * 23           // pixels per star
```

Source: `library.html` line 617, `libraryview.js` line 1529

### Book Reserve Limits

- Maximum 5 books can be reserved at a time
- Error message: "The maximum of 5 books have been reserved."
- Source: `libraryview.js` line 4498

### Predefined Book Review Comments (`libraryview.js` lines 32-59)

26 available feedback phrases, indexed 1-26:
```
1: "I couldn't put this book down"
2: "It changed my view of the world"
3: "It was really boring"
4: "The characters were relatable"
5: "I cried while reading it"
6: "The images were really good"
7: "I couldn't relate to the characters"
8: "It was interesting"
9: "I laughed while reading it"
10: "The descriptions made me feel like I was there"
11: "It made me want to know more about the topic"
12: "I want to read something else by this author"
13: "I couldn't stop reading this book"
14: "The story reminded me of my own life"
15: "It taught me a lot"
16: "I was confused the whole time"
17: "My favorite character was..."
18: "It was too hard for me"
19: "It was too easy for me"
20: "I would recommend this to a friend"
21: "The topic wasn't interesting to me"
22: "I liked the topic of this book"
23: "I want to read more about this topic"
24: "It was not what I expected"
25: "I thought the ending was good"
26: "I liked the author's writing style"
```

---

## 5. Book Data Model

### Fields (from `fetchbooklist.js` and `constants.js` lines 964-979)

| Field | JSON Key | Type | Example | Notes |
|---|---|---|---|---|
| Book ID | `book_id` | string (UUID) | `"f47ac10b-58cc-..."` | Primary identifier |
| Title | `book_title` | string | `"Bomb Dogs, Canine Heroes"` | May contain metadata after last comma |
| Title (chopped) | `book_title_chopped` | string | `"Bomb Dogs"` | Title with metadata stripped (computed) |
| Author | `author_name` | string | `"Jane Smith"` | Empty string if unknown |
| Cover Image | `book_image` | string | `"bomb_dogs.jpg"` | Filename only; prefix with media path |
| Genre | `book_genre` | string | `"Nonfiction,Animals"` | Comma-separated |
| Book Path | `book_path` | string | | Path to epub/pdf content |
| Page Count | `no_of_page` | number or null | `137` | |
| Lexile Level | `lexile_level` | number or null | `650` | |
| Description | `book_desc` | string | | Full text description |
| Category ID | `category_id` | string | | |
| Category Name | `category_name` | string | `"Mystery"` | |
| Book Type | `book_type` | string | `"R"` | "R" = RATA (Read Aloud Think Aloud) |
| File Type | `file_type` | string | `"epub"` or `"pdf"` | |
| Word Count | `word_count` | number or null | `15000` | |

### Image Path Construction

```js
// Cover image URL
coverSrc = LIBRARY.c_s_MEDIA_FOLDER_PATH + book.book_image
// = "../Content/media/" + "bomb_dogs.jpg"

// Thumbnail prefix
thumbSrc = LIBRARY.c_s_MEDIA_FOLDER_PATH + LIBRARY.c_s_MEDIA_THUMB_COVER_PREFIX + book.book_image
// = "../Content/media/thumb_" + "bomb_dogs.jpg"

// Fallback images
LIBRARY.c_s_NO_COVER_IMAGE = "media/book_cover.jpg"
LIBRARY.c_s_DEFAULT_COVER_IMAGE = "media/default_book_loader.gif"
```

Source: `constants.js` lines 957-960

### Book Data Storage

Books are stored globally in `objBookList.bookset[0]` as an object (not array) with numeric string keys:
```js
objBookList.bookset[0] = {
  "0": { book_id: "...", book_title: "...", ... },
  "1": { book_id: "...", book_title: "...", ... },
  ...
  "categorylist": [...]  // Must be omitted when filtering
}
```

Filtering always uses `_.omit(objBookList.bookset[0], 'categorylist')` to exclude the category list.

### Categories (23 total, from `libraryview.js` lines 89-205)

```
Mystery, Fiction, Action and Adventure, Animals, Art, Autobiographies,
Biographies, Comedies, Coming of Age, Fairy Tales/Folktales/Fables,
Fantasy, Graphic Novels, Historical Fiction, Horror, Informational,
Myths and Legends, Poetry, Realistic Fiction, Romance, Science Fiction,
Sports, Dystopia, Plays
```

Each has `category_name` and `category_name_singular` for search matching.

---

## 6. Responsive Behavior

### Media Queries for Carousel Navigation Arrows

```css
/* library_dev.css lines 421-432 */
@media (min-width: 1024px) {
  .prevButton, .nextButton { margin: 0 50px; }
}
@media (min-width: 1280px) {
  .prevButton, .nextButton { margin: 0 180px; }
}
@media (min-width: 1500px) {
  .prevButton, .nextButton { margin: 0 250px; }
}
@media (min-width: 1920px) {
  .prevButton, .nextButton { margin: 0 450px; }
}
```

### Resize Handler (`libraryview.js` lines 1841-1858)

```js
LibraryCarouselView.resize = function() {
  // Calculate available height for book detail area
  var carouselHeight = $(".sliderWrap").outerHeight();
  var middleBarHeight = $(".sliderText").outerHeight();
  var sectionHeight = $('section').height();
  var variableHeight = $(".bookElement").length == 0 ? 0 : 7;

  $(".bookBoxWrap_out").height(
    sectionHeight - (carouselHeight + middleBarHeight + variableHeight)
  );

  // Grid view height calculation
  if ($('.slider_thums').length) {
    var $height = $('section').height() + $('header').height()
      - ($('.slider_thums').offset().top)
      - parseInt($('.slider_thums').css('padding-top'));
    $('.slider_thums').css({ height: $height });
  }
};
```

### Fixed Widths

- Carousel wrapper: `960px` (ILITBookShelfRounder.css line 1)
- Book container max-width: `903px` (library_dev.css line 82)
- Carousel engine width config: `1000px` (libraryview.js line 1375)
- 3D flow container: `974px` (library.3dflow.css line 1)

### Book Element Sizing

```css
/* Carousel mode */
.bookElement { width: 160px; height: 220px; }  /* ILITBookShelfRounder.css line 53 */
.bookElement img { width: 160px; }              /* ILITBookShelfRounder.css line 97 */

/* Grid/List mode */
.slider_thumb_img img { height: 164px; width: 114px; }  /* library_dev.css line 28 */

/* Current reading thumbnail */
.currentReadingWrapper { width: 160px; height: 195px; }  /* library_dev.css line 198 */

/* 3D flow mode */
.swiper-slide .imageBox { width: 105px; height: 161px; }  /* library.3dflow.css line 17 */
```

---

## 7. Colors and Gradients

### Background Colors

| Element | Color | Source |
|---|---|---|
| Carousel background | `book_bg.jpg` texture image | library.css:349 |
| Carousel border-bottom | `#222224` 25px solid | library.css:349 |
| Reviewed carousel border-bottom | `#222224` 50px solid | ILITBookShelfRounder.css:137 |
| Book info panel | `#121313` | library.css:371 |
| Book title bar (carousel) | `#0b0c0c` | library.css:369 |
| Book inner header | `#0b0c0c` with `2px solid #000` bottom border | library.css:375 |
| Book main image area | `#121313` with 5px border-radius top | library.css:367 |
| Top navbar | `#2a2b2d` with `1px solid #353637` bottom border | library.css:597 |
| Book popup cover area | `#3444ad` (blue) | library.css:674 |
| About book section | `#f6f6f6` bg, `1px solid #d6d6d6` border | library.css:690 |
| No-book overlay | `rgba(0,0,0,0.3)` with `2px solid #dedede` | library_dev.css:204 |
| Body pattern | `noFlicking` class adds background pattern | libraryview.js |

### Text Colors

| Element | Color | Source |
|---|---|---|
| Book title (carousel) | `#fff` | library.css:369 |
| Book stats text | `#fff` | library.css:376 |
| Active tab text | `#000` (on white bg) | library.css:623 |
| Inactive tab text | `#fff` | library.css:618 |
| Grid view active item | `#fff`, font-weight 700 | library_dev.css:512-514 |
| Grid view inactive item | `#666` | library_dev.css:504 |
| Body default | `#4e4e4e` | library.css (body) |
| Carousel book title | `#fff`, font-weight bold, 14px | ILITBookShelfRounder.css:135 |

### Button Colors

```css
button.button7 {
  background: #3444ad;    /* Blue */
}
```

Source: library.css line ~674

### Footer Gradient

```css
/* library.css line 644 */
background: linear-gradient(#404246, #28292b);
```

### Book Element Border/Shadow

```css
.bookElement {
  border: 4px solid #fff;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0px 2px 13px rgba(50, 50, 50, 0.86);
}

/* When in reviewed/reserved mode (overshudle class) */
.bookElement.overshudle {
  border: none;
  box-shadow: none;
  background: transparent;
}
```

Source: ILITBookShelfRounder.css lines 53-83

### Search Bar

```css
.search_bar {
  background: #eee;
  position: absolute;
  z-index: 1;
}
```

Source: library.css line 634

---

## 8. Animations and Transitions

### Carousel Animation

**Engine animation loop** (`ilit_book_shelf_rounder.js`):
- Uses `requestAnimationFrame` at 60fps target
- Smooth coefficient: `20` (higher = smoother but slower)
- Each frame moves position incrementally toward target position
- Uses easeInOutSine easing: `-(w/2) * (cos(PI * d / tw) - 1)`

### Page Load Animation

```js
// Main carousel area fades in
$("#mainCarouselArea").fadeIn(800);
```

Source: `libraryview.js` (carousel render)

### Stats Panel Fade In

```js
$(".middleBookInfoMain").fadeIn(500);
```

Source: `libraryview.js` line 2590

### No-Book Message Fade In

```js
$(".noBook").fadeIn(1000);
```

Source: `libraryview.js` line 1755

### Book Popup Opacity

```js
// Popup content starts invisible, then animates
$(".md-content").css({'opacity': 0});
// CSS class md-effect-13 handles the animation
```

Source: `libraryview.js` lines 1767, 2772

### Lazy Load Effect

Grid view images use jQuery lazyload with fade-in:
```js
$('img.lazy').lazyload({
  effect: "fadeIn",
  container: ".slider_thums"
});
```

Source: `libraryview.js` line 2742

### Search Dropdown Animation

```js
$(".search_bar").slideUp();   // Close animation
$(".search_bar").show();      // Open (instant)
```

Source: `libraryview.js` lines 2751, 1959

### Post-Search Title Update Delay

After search, book title/author update has a 450ms delay:
```js
setTimeout(function() {
  $('#bookName').html(_sTitle);
  $('#authorName').html(_sAuthor);
}, 450);
```

Source: `libraryview.js` lines 2073-2086

### Book Popup Focus Delay

After opening popup, focus moves to "Read This Book" button after 2 seconds:
```js
setTimeout(function(){
  $("#readBookBtn").focus()
}, 2000);
```

Source: `libraryview.js` lines 1770-1772

---

## 9. Application States

### Loading State

```js
oUtility.showLoader({
  'message': '<img src="media/loader.gif" alt="" />',
  'background-color': '#fff',
  'click-to-hide': false,
  'opacity': 0.5
});
```

- Shows `loader.gif` centered with semi-transparent white overlay
- Body gets class `noFlicking` which adds a background pattern
- Hidden with `oUtility.hideLoader()` after books render

Source: `libraryview.js` line 1564

### Empty States (No Books Found)

Different messages per tab (`libraryview.js` lines 1715-1756):

| Tab | Message | Container Width |
|---|---|---|
| Default/Search | "No results found. Please try using another keyword." | 450px |
| myLevel | "No Book Found!" | 350px |
| reserved | "No Books Reserved!" | 350px |
| reviewed | "No Books Reviewed!" | 350px |
| recommended | "Check back tomorrow for recommended books." | 350px |

Empty state HTML:
```html
<div class="noBook">
  <div class="bookMsg">[message]</div>
</div>
```

CSS for no-book message:
```css
.noBook {
  position: absolute;
  /* centered horizontally */
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #dedede;
}
```

Source: `library_dev.css` line 204

### Error States

- Level API failure (500): Falls back to "All Titles" tab
  ```js
  if (objUserLevel.Status == 500) {
    $(".tabbing button[data-text='all']").addClass('active');
    $(".tabbing button[data-text='myLevel']").removeClass('active');
    return false;
  }
  ```
  Source: `libraryview.js` lines 2357-2362

- Reserve error: "This book is currently reserved." dialog
  Source: `libraryview.js` line 4533

- Reserve limit: "The maximum of 5 books have been reserved." dialog
  Source: `libraryview.js` line 4546

### Polling/Retry States

Two functions poll for data readiness with 400ms intervals:

```js
// Poll until user level data loads
LibraryCarouselView.checkForLevel = function() {
  if (objUserLevel != null) {
    // proceed
  } else {
    setTimeout(function() {
      LibraryCarouselView.checkForLevel();
    }, 400);
  }
};

// Poll until progress summary loads
LibraryCarouselView.checkForProgress = function() {
  if (LibraryCarouselView.libraryProgressSummary != null) {
    // proceed
  } else {
    setTimeout(function() {
      LibraryCarouselView.checkForProgress();
    }, 400);
  }
};
```

Source: `libraryview.js` lines 2154-2177, 2504-2597

### Interest Inventory State

Shown as a full-screen modal on first login. Three terms:
- **BOY** (Beginning of Year): Full survey with 4 slides + drag-and-drop interests
- **MOY** (Middle of Year): 3 slides, triggered after BOY timeframe expires
- **EOY** (End of Year): 3 slides, triggered after EOY timeframe expires

Source: `libraryview.js` lines 2828-2930

---

## 10. Key CSS Measurements

### Carousel Container

```css
.ILITBookShelfRounderWrapper {
  width: 960px;
  height: 211px;
  position: relative;
  overflow: hidden;
}

.curoselContainer {
  height: 190px;
  padding-top: 45px;
}

.sliderWrap {
  background: url('book_bg.jpg');
  border-bottom: 25px solid #222224;
}
```

Sources: ILITBookShelfRounder.css:1-21, library.css:349-350

### Book Elements

```css
/* Carousel book */
.bookElement {
  position: absolute;
  width: 160px;
  height: 220px;
  border: 4px solid #fff;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0px 2px 13px rgba(50, 50, 50, 0.86);
  cursor: pointer;
}

.bookElement img {
  width: 160px;
}

/* Grid/list book */
.slider_thumb_img img {
  height: 164px;
  width: 114px;
}

/* Flat carousel */
.flatCarousel {
  height: 210px;
  padding-top: 25px;
}
```

Sources: ILITBookShelfRounder.css:53-97, library_dev.css:28, library_dev.css:597

### Info Panel

```css
.bookBoxContainer {
  max-width: 903px;
  display: flex;
  justify-content: space-between;
}

.middleBookInfoWrap {
  padding: 30px 0 5px;
}

.middleBookInfoMain {
  background: #121313;
  width: 250px;
  border-radius: 5px;
}

.bookInnerHead {
  color: #fff;
  font-size: 18px;
  background: #0b0c0c;
  border-bottom: 2px solid #000;
}

.bookcontRow {
  padding: 10px;
  font-size: 15px;
  color: #fff;
}

.currentReadingWrapper {
  width: 160px;
  height: 195px;
}
```

Sources: library_dev.css:82-200, library.css:371-376

### Title/Author Bar

```css
.bookTitle {
  background: #0b0c0c;
  font-size: 13px;
  color: #fff;
  border-radius: 0 0 5px 5px;
}

.bookMainImg {
  background: #121313;
  border-radius: 5px 5px 0 0;
  padding: 5px;
}
```

Source: library.css:367-369

### Tab Bar

```css
.top_navbar {
  background: #2a2b2d;
  border-bottom: 1px solid #353637;
  padding: 5px 10px;
}

.tabbing {
  border: 1px solid #fff;
  border-radius: 5px;
  display: inline-block;
}

button.button8 {
  background: none;
  padding: 4px 20px;
  color: #fff;
  border: none;
}

button.button8.active {
  background: #fff;
  color: #000;
  border-radius: 3px;
}
```

Source: library.css:597-625

### Book Popup

```css
.img_title_bx {
  background: #3444ad;
}

.about_book_title {
  font-size: 16px;
  font-weight: bold;
}

.about_book {
  background: #f6f6f6;
  border: 1px solid #d6d6d6;
}
```

Source: library.css:674-690

### Star Rating

```css
/* Uses star.png sprite sheet */
.libbook-rating .meter {
  width: 115px;
  /* Background: star.png */
}

/* Popup star rating */
.startRateContainer .onStar {
  width: [rating * 24.2]px;  /* Calculated inline */
}
```

Sources: ILITBookShelfRounder.css:113-134, library.html:617

### 3D Flow (alternate carousel)

```css
.swiper-container {
  width: 974px;
  bottom: 35px;
}

.swiper-slide .imageBox {
  width: 105px;
  height: 161px;
  border: 1px solid #C7C8C8;
  padding: 3px;
}

.curoselContainer img {
  height: 159px;
}
```

Source: library.3dflow.css lines 1-35

### Typography

```css
body {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 21px;
  color: #4e4e4e;
}

.libbook-title {
  font-weight: bold;
  color: #fff;
  font-size: 14px;
}
```

Sources: library.css (body), ILITBookShelfRounder.css:135

---

## View Architecture Summary

Three main views, all static constructors (not instantiated):

| View | Purpose | Init Method |
|---|---|---|
| `LibraryHeaderView` | Top bar with tabs, search, view toggle | `LibraryHeaderView.init()` |
| `LibraryCarouselView` | 3D carousel of book covers | `LibraryCarouselView.init(model?)` |
| `LibraryListView` | Grid/list view of books | `LibraryListView.init(model?)` |
| `LibraryPopupView` | Book detail popup modal | `LibraryPopupView.init()` |
| `InventoryView` | Interest inventory survey | `InventoryView.init()` |

Each view follows the pattern: `init()` -> `render()` -> `bindEvent()`

The `Application` object routes between views based on `VIEWTYPE`:
```js
VIEWTYPE.c_s_CAROUSEL     -> LibraryCarouselView
VIEWTYPE.c_s_LISTVIEW     -> LibraryListView
VIEWTYPE.c_s_BOOKPOPUPVIEW -> LibraryPopupView
```

Source: `application.js` lines 51-58

### View Toggle

The header contains a view toggle button (`#changeView`) that switches between:
- `.list_view` class: Shows carousel (switch to list triggers `Application.init(VIEWTYPE.c_s_LISTVIEW)`)
- `.grid_view` class: Shows list (switch to carousel triggers `Application.init(VIEWTYPE.c_s_CAROUSEL)`)

### Search Behavior

Text search (`libraryview.js` lines 1977-2101):
1. Triggered on Enter key press in `#searchBox`
2. Searches across 4 fields: `book_genre`, `category_name`, `author_name`, `book_title`
3. Also searches singular form of category names
4. Search respects current tab filter (all/myLevel/myRead)
5. Results passed to either `LibraryCarouselView.init(searchModel)` or `LibraryListView.init(searchModel)`

Category suggestion search (`libraryview.js` lines 1867-1967):
1. Clicking a category suggestion filters by `category_name` and `book_genre`
2. "View All" resets to full list view
