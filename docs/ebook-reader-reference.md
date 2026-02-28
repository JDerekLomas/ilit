# eBook Reader (Player) -- Source Code Reference

This document describes the Savvas I-LIT eBook Reader as implemented in the ClassView codebase. It is intended for AI agents implementing a replica. All line references are from the original source files.

---

## Source Files

| File | Path | Purpose |
|------|------|---------|
| `player.html` | `docs/classview/Webclient/App/ebookplayer/player.html` | HTML shell (457 lines) |
| `common.js` | `docs/classview/Webclient/App/ebookplayer/script/common.js` | Main application logic (~3683 lines) |
| `style.css` | `docs/reference-source/ebookplayer/style.css` | Primary CSS (710 lines) |
| `util.js` | `docs/classview/Webclient/App/js/util.js` | Shared utilities (includes `setPosTextHelp`) |
| `lib.js` | `docs/classview/Webclient/App/ebookplayer/script/lib.js` | jQuery, Hammer.js, other libs (~43k tokens, not fully documented) |
| `utility.js` | `docs/classview/Webclient/App/ebookplayer/script/utility.js` | Trivial JSON printer (9 lines) |
| `PlayerTemp.html` | `docs/classview/Webclient/App/ebookplayer/PlayerTemp.html` | Redirect stub to player.html (13 lines) |
| `ebookplayer_dev.css` | `docs/classview/Webclient/App/css/ebookplayer_dev.css` | Dev CSS overrides (111 lines) |

### Script Load Order (player.html lines 272-289)

1. `lib.js` -- jQuery core + plugins bundled
2. `jquery-ui-1.10.4.custom.js` -- jQuery UI (slider, dialog, tooltip)
3. `jquery.ui.touch-punch.js` -- Touch support for jQuery UI
4. `modernizr.js` -- Feature detection
5. `jquery.nicescroll.min.js` -- Custom scrollbars
6. `jquery.hammer-full.min.js` -- Touch gestures (tap, doubletap, swipe/drag)
7. `underscore-min.js` -- Utility library
8. `constants.js` -- Error codes, messages
9. `iSeriesBase.js` -- Base class (provides `_alert`)
10. `a11y.js` -- Accessibility helpers
11. `common.js` -- Main eBook logic
12. `util.js` -- Shared utilities (includes `setPosTextHelp`)
13. `client_native_communication.js` -- Native bridge API
14. `chromeapp_communication.js` -- Chrome App messaging
15. SpeechStream 3.9.5 (external CDN, line 455): `https://toolbar.speechstream.net/SpeechStream/3.9.5/speechstream.js`

---

## 1. Player Shell HTML Structure

**File:** `player.html`

The page is a single HTML document with `<body class="t2">` (default medium font size).

### Top-level structure:

```
<body class="t2">
  <div id="dynamicTextForSR" aria-live="assertive">     <!-- Screen reader announcements (line 31) -->
  <div id="msTextHelp">                                  <!-- Hidden text store for SpeechStream (line 32) -->
  <header id="eBookHeaderContainer">                     <!-- Toolbar header (lines 33-146) -->
  <div id="wrapper" class="ebook_container_content">     <!-- Main content area (lines 147-228) -->
  <div id="popup-overlay3"> + <div id="loaderWrap">      <!-- Loader overlay (lines 230-235) -->
  <div id="overlay"> + <div id="notesModal">             <!-- Notes modal (lines 238-265) -->
  <div id="dialog-message">                              <!-- Alert dialog (line 266) -->
  <div id="collect-highlight-dialog">                    <!-- Collected highlights dialog (line 270) -->
  <script>...</script>                                   <!-- Initialization logic (lines 280-454) -->
  <script src="speechstream.js">                         <!-- SpeechStream CDN (line 455) -->
</body>
```

### URL Hash Parameters (player.html lines 367-401)

Book data is passed entirely via the URL hash, pipe-separated with `|||`:

```
player.html#bookid|||title|||type|||totalWords|||source|||format|||totalPages|||context|||productCode|||lexile|||classStartDate|||displayModel|||chromeApp
```

| Index | Variable | Example | Notes |
|-------|----------|---------|-------|
| 0 | `bookid` | `"9780328905607"` | Used to load `{bookid}.js` content file |
| 1 | `bookTitle` | `"Turn It Down!"` | URI-decoded |
| 2 | `bookType` | `"rata"` or other | Maps to `"RATA"` or `"Time To Read"` |
| 3 | `totalWordInBook` | `12000` | Integer |
| 4 | `source` | `"library"` / `"broadcast"` / `"assignment"` / `"notebook"` | Determines back-button behavior |
| 5 | `bookFormat` | | |
| 6 | `totalPages` | `137` | |
| 7 | `context` | | Parsed with `.split("context=")[1]` |
| 8 | `productCode` | `"ilit20..."` | Determines word count timing (10s vs 30s) |
| 9 | `bookLexileLevel` | `"780"` | |
| 10 | `classStartDate` | `"2024-01-15"` | Used for weekly progress tracking |
| 11 | `DisplayEPubModel` | `"ExtenedPageLevelSupport"` or `""` | Enables `PageWiseLayout` |
| 12 | `chromeApp` | `"chromeApp"` or absent | Chrome App mode flag |

### Boot Sequence (player.html lines 302-407)

1. `window.onload` parses the hash (line 367)
2. `addNativeBridge()` detects platform (iOS/ChromeApp/web) and calls `GetEbookInfo(bookid, isBroadcast)` (line 302)
3. `scheduleCheck()` polls until `objEbookJsonData` is populated (line 328), then calls `loadJS(bookPath + bookid + ".js", callback)` (line 356)
4. On book JS load, calls `GetLibraryProgress(undefined, bookid)` (line 357)
5. `GetLibraryProgressCallback` restores saved font size, word count, and page state, then calls `init()` (common.js line 2765)

---

## 2. Two-Page Spread Layout

**File:** `player.html` lines 158-201, `style.css` lines 212-274

### HTML Structure

```html
<div id="viewArea" class="ebook_box_notes">          <!-- Outer frame with texture -->
  <div class="ebook_box_notes_grid4">                <!-- Inner white panel -->
    <div class="ebook_content_block_middle">
      <div class="ebook_content_block">              <!-- Main content row -->
        <div class="ebook_container_block left_ebook">
          <div class="ebook_text_content">
            <div class="notes_content_bl">
              <div id="imgNotes" class="notesIcon">  <!-- Notes icon -->
              <div id="leftPageWrap" class="Book_Notes_content">  <!-- LEFT PAGE -->
            </div>
          </div>
        </div>
        <div class="ebook_container_block right_ebook">
          <div class="ebook_text_content">
            <div class="notes_content_bl">
              <div id="rightPageWrap" class="Book_Notes_content">  <!-- RIGHT PAGE -->
              <div id="rightPageWrapTOC" class="Book_Notes_content"> <!-- RIGHT PAGE (TOC mode) -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### CSS Details

**Outer frame** (`.ebook_box_notes`, style.css line 261):
- `background: url(../media/background_bg.png) repeat 0 0` -- wooden/textured background tile
- `border-radius: 15px`
- `border: 2px solid #24789d` -- cyan border
- `box-shadow: 0 0 5px 0 #536269`
- `padding: 10px`

**Inner panel** (`.ebook_box_notes_grid4`, style.css line 266):
- `background: #fff`
- `box-shadow: 0 0 6px rgba(0,0,0,0.5)`
- `border-radius: 5px`

**Content area** (`.ebook_container_content`, style.css line 212):
- `margin: 20px 10%` (desktop)
- At `max-width: 1024px`: `margin: 20px 55px` (style.css line 537-544)
- `position: relative` (needed for absolutely-positioned prev/next buttons)

**Page content** (`.Book_Notes_content`, style.css line 295):
- `max-height: 270px` -- pages are height-constrained
- `padding: 0`
- `position: relative`

**Left page padding** (`.ebook_container_block.left_ebook .ebook_text_content`, style.css line 322):
- `padding: 2% 6% 5% 1%`

**Right page padding** (`.ebook_text_content`, style.css line 274):
- `padding: 2% 1% 2% 6%`

### Body Background (style.css lines 28-39)

```css
body {
  font-family: "Times New Roman", Times, serif;
  font-size: 16px;
  line-height: 22px;
  color: #4e4e4e;
  background: url(../image/background.jpg) no-repeat;
  background-size: cover;
  overflow: hidden;
}
```

---

## 3. Toolbar Buttons

**File:** `player.html` lines 33-146, `style.css` lines 139-167, 324-396

### Header Bar

```css
.header_innerin {
  background: #292c30;
  border-bottom: 1px solid #353637;
  padding: 5px 15px 5px 10px;
  color: #fff;
  font-size: 18px;
  line-height: 30px;
}
```

### Button Layout (left to right)

| Button | ID | Class | HTML Line | CSS Details |
|--------|----|-------|-----------|-------------|
| Back to Library | `BackToLibrary` | `sld_lft sprite left` | 39 | 30x30px sprite, calls `setLibraryProgress()` |
| Table of Contents | `btnTOC` | `toc_icn left sprite` | 40 | 40x40px sprite at `-28px -1px` |
| Book Title | `<h1>` | `middle` | 41 | Uppercase, centered, `width: 570px`, `margin-left: 15%` |
| Accessibility Info | `infoBtn` | -- | 47 | 36x36px, white bg, `border-radius: 50%`, `accessibility.png` icon |
| Screen Mask | `btnScreenMask` | -- | 67 | 36x36px, white bg, `border-radius: 50%`, `screen-mask.png` icon |
| Annotation Pen | `btnTextHighlight` | -- | 75 | 36x36px, white bg, `border-radius: 50%`, `marker-pen.png` icon |
| Font Resize (Aa) | `btnFontResize` | `button9` | 106 | Text button, `bg: #26282b`, `border: 1px solid #fff`, `border-radius: 5px` |
| Translate | `btnLanguage` | `button9 margin_none` | 125 | Same as Font Resize styling |

### button9 Style (style.css lines 155-167)

```css
button.button9 {
  background: #26282b;
  border: 0 none;
  color: #FFFFFF;
  font-size: 15px;
  padding: 4px 20px;
  border: 1px solid #fff;
  border-radius: 5px;
}
button.button9.active {
  background: #fff;
  color: #252629;
}
```

### Round Icon Buttons (style.css lines 386-395)

```css
#btnTextHighlight, #btnScreenMask {
  cursor: pointer;
  font-size: 15px;
  border: none;
  color: #000000;
  border-radius: 50%;
  background-color: white !important;
  height: 36px;
  width: 36px;
}
```

---

## 4. Annotation Pen Dropdown

**File:** `player.html` lines 72-101, `common.js` lines 339-684, `style.css` lines 353-379

### HTML Structure

```html
<div class="text-highlight active">
  <button id="btnTextHighlight" aria-expanded="false">
    <img src="./media/marker-pen.png">
  </button>
  <div id="menuTextHighlight" class="tooltip_tools" style="display:none">
    <div class="tools_tooltip">
      <div class="tooltip_arrow sprite"></div>
      <div class="tooltip_wrap_language">
        <div class="highlight_container">
          <div class="highlights strike">S</div>            <!-- Strikethrough -->
          <div class="highlights cyan">Cyan</div>            <!-- Cyan highlight -->
          <div class="highlights magenta active">Magenta</div> <!-- Magenta (default) -->
          <div class="highlights green">Green</div>          <!-- Green highlight -->
          <div class="highlights clear"><img src="clear.png"></div>   <!-- Remove highlight -->
          <div class="highlights collect"><img src="list.png"></div>  <!-- Collect all -->
        </div>
      </div>
    </div>
  </div>
</div>
```

### Highlight Colors (style.css lines 366-370)

```css
.cyan    { background-color: cyan !important; color: #000 !important; }
.magenta { background-color: magenta !important; color: #000 !important; }
.green   { background-color: rgb(69, 235, 83) !important; color: #000 !important; }
.strike  { text-decoration: line-through; }
.highlight { background: yellow !important; }  /* line 555, selection highlight */
```

### Highlight Behavior (common.js lines 339-684)

When a user taps a highlight color button while text has the `.highlight` class:

1. **Cyan/Magenta/Green:** Adds the color class AND `.annotation` class to the highlighted element. The `.annotation` class marks the element for persistence.
2. **Strike:** Adds `.strike` and `.annotation` classes.
3. **Clear:** Removes all color classes (`.cyan`, `.magenta`, `.green`, `.strike`) and `.annotation` from the highlighted element.
4. **Collect:** Gathers all elements with `.annotation` class and displays them in a jQuery UI dialog (`#collect-highlight-dialog`), grouped by color.

### Highlight Persistence (common.js lines 2632-2708)

- `SaveNewHighlights(chaptorNo, pageNo)` (line 2635): Serializes highlight data and calls the server API via `$.nativeCall({ method: 'SaveHighLight', ... })`.
- `GetHighlights()` (line 2690): Calls `GetHighLightInfo(bookid)` to fetch saved highlights.
- `ApplyHighLightData()` (line 2694): Iterates `book.orderList`, updates sentence objects with saved highlight classes.
- Highlights are stored in the `defaultHighlight` array and persisted per book.

---

## 5. Table of Contents Panel

**File:** `common.js` lines 1644-1871 (`generateTOC()`)

### Behavior

When `#btnTOC` is clicked:
1. The left page (`#leftPageWrap`) shows the book cover image
2. The right page is replaced by `#rightPageWrapTOC` which contains a tabbed panel

### TOC Panel Structure (generated in JS)

```
<div class="footer_bottom_block">
  <div class="notetab">
    <button id="btnTOCList" class="button8 active">Table of Contents</button>
    <button id="btnNotesList" class="button8">Book Notes</button>
  </div>
</div>
<ul id="tocList" class="ebook_list">
  <li class="chapterWrap" chapNo="0" sentNo="0">
    <div class="toc_name_row"><a>Chapter Title</a></div>
  </li>
  ...
</ul>
```

### TOC Data Source

The TOC is built from `book.orderList` (derived from `content.Toc`). Each chapter with `visibility == 1` gets a list item. Clicking a chapter:
1. Sets `eBookEnvironment.currLandScapePageNo` to the first page of that chapter
2. Calls `displayPage()` to render it
3. Hides the TOC panel and shows normal page content

### TOC Tab Styling (style.css lines 277-292)

```css
.notetab { border: 1px solid #38454e; border-radius: 5px; overflow: hidden; display: inline-block; }
.notetab button.button8 { background: none; color: #38454e; font-size: 15px; padding: 4px 5px; border: 0; width: 140px; }
.notetab button.button8.active { background: #38454e; color: #fff; }
```

### Footer block for TOC (style.css lines 457-462)

```css
.footer_bottom_block { background: #292c30; border-radius: 0 0 8px 8px; }
.footer_bottom_block .notetab button.button8 { color: #fff; }
.footer_bottom_block .notetab { border: 1px solid #fff; }
.footer_bottom_block .notetab button.button8.active { background: #fff; color: #292c30; }
```

---

## 6. Page Navigation

### Prev/Next Buttons

**File:** `player.html` lines 150-204, `common.js` lines 3333-3569

**HTML:**
```html
<div id="previousPage" class="ebook_previous_button" tabindex="0" role="button">prev</div>
<!-- ... viewArea ... -->
<div id="nextPage" class="ebook_next_button" tabindex="0" role="button">next</div>
```

**CSS (style.css lines 217-260):**
```css
.ebook_previous_button {
  position: absolute;
  width: 40px; height: 40px;
  border: 2px solid #fff;
  border-radius: 50%;
  top: 50%; margin-top: -20px;
  left: -48px;
  background-image: url(../media/sprite_ratina.png);
  background-size: 500px 800px;
  background-position: -362px -698px;
  text-indent: -1000px; overflow: hidden;  /* hide "prev" text */
}
.ebook_next_button {
  /* Same as above but: */
  right: -48px;
  background-position: -460px -698px;
}
.ebook_previous_button.disabled, .ebook_next_button.disabled {
  cursor: auto; opacity: 0.5;
}
```

**Navigation Logic (common.js lines 3333-3569):**

Both buttons use click AND keydown (Space/Enter) handlers:

- **Previous:** `eBookEnvironment.currLandScapePageNo -= 2`, then calls `displayPage()` and updates slider. Disabled when `currLandScapePageNo <= 1`.
- **Next:** `eBookEnvironment.currLandScapePageNo += 2`, then calls `displayPage()` and updates slider. Disabled when `currLandScapePageNo >= maxLandScapePageNo`.

Pages always advance by 2 (two-page spread).

### Swipe Navigation (common.js lines 999-1132)

Uses Hammer.js `dragend` event:
- **Swipe right** (`DIRECTION_RIGHT`): Goes back 2 pages
- **Swipe left** (`DIRECTION_LEFT`): Goes forward 2 pages

### Page Slider

**File:** `player.html` line 207, `common.js` lines 884-978, `style.css` lines 297-315

```html
<div class="pages_slider_conts">
  <div id="slider-range-min" class="valid-activity"></div>
</div>
```

**jQuery UI Slider initialization (common.js ~line 884):**
```javascript
$('#slider-range-min').slider({
  range: "min",
  value: 1,
  min: 1,
  max: eBookEnvironment.maxLandScapePageNo,
  slide: function(event, ui) { /* update page balloon */ },
  stop: function(event, ui) { /* displayPage(ui.value) */ }
});
```

**Slider Handle Styling (style.css lines 301-315):**
```css
.pages_slider_conts .ui-slider .ui-slider-handle {
  background: #FFFFFF;
  border: 1px solid #FFFFFF;
  border-radius: 40px;
  box-shadow: 0 0 3px 0 #424242;
  color: #000000;
  font-size: 12px;
  height: 2.75em;
  line-height: 2.75em;
  width: 5em;
  top: -0.9em;
  text-align: center;
}
```

**Page Balloon** (dynamically generated, common.js ~line 3366):
A balloon tooltip appears above the slider handle during drag showing `"pageNo-(pageNo+1) of maxPage"`. It uses a black background with white text and a CSS triangle arrow pointing down:
```javascript
var tempVal = '<div id="pageNoBallon" style="position:absolute;top:-3.5em;border-radius:12px;left:0px;background:#000;">
  <div style="height:35px;line-height:35px;white-space:nowrap;padding:0 7px;color:#FFF;">
    ' + pageNo + '-' + (pageNo+1) + ' of ' + maxPage + '
  </div>
  <div style="border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid #000;bottom:-5px;..."></div>
</div>';
```

---

## 7. Word-Level Interaction

**File:** `common.js` lines 783-881

### Content Structure

Book content HTML uses custom `<z>` elements:
- `<z class="s">` -- Sentence wrapper (focusable via TAB for accessibility)
- `<z class="w">` -- Individual word wrapper (focusable after pressing W)

These elements are styled as `display: inline` (style.css line 565):
```css
z { display: inline; }
```

Word font size is inherited (style.css line 579-581):
```css
.w { font-size: inherit !important; }
```

### Touch Interaction (common.js lines 783-881)

**Double-tap on sentence** (Hammer.js `doubletap` on `.ebook_container_block`):
1. Finds the parent `.s` element of the tapped target
2. Adds `.highlight` class (yellow background)
3. Stores highlighted text in `#msTextHelp` hidden element
4. Shows partial TextHelp popup (Speak, Notes, Copy, Translate only -- no Dictionary/PicDictionary)
5. Calls `setPosTextHelp(offset, objWid)` to position the popup

**Single-tap on word** (Hammer.js `tap` on `.ebook_container_block`):
1. Finds the `.w` element
2. Adds `.highlight` class
3. Shows FULL TextHelp popup (all buttons including Dictionary and Picture Dictionary)
4. Calls `setPosTextHelp(offset, objWid)` to position the popup

### tabindex Assignment

During `displayPage()`, all `.s` and `.w` elements receive `tabindex="0"` to make them keyboard-focusable.

---

## 8. TextHelp Popup

**File:** `player.html` lines 214-227, `common.js` lines 3013-3114, `util.js` lines 2024-2036, `style.css` lines 561-563

### HTML Structure

```html
<div id="textToHelpMenu" role="region" aria-label="textHelp popup" style="position:absolute;display:none;background:#000;">
  <div id="tthSpeak" class="textToHelpMenuButtons" onclick="playText();">Speak</div>
  <div id="tthTransSep" class="sep"></div>
  <div id="tthDict" class="textToHelpMenuButtons" onclick="eventDic(event);">Dictionary</div>
  <div id="tthDictSep" class="sep"></div>
  <div id="tthPicDict" class="textToHelpMenuButtons" onclick="eventPicDic(event);">Picture Dictionary</div>
  <div id="tthPicDictSep" class="sep"></div>
  <div id="tthTrans" class="textToHelpMenuButtons" onclick="eventTrans(event);">Translate</div>
  <div id="tthNotesSep" class="sep"></div>
  <div id="tthNotes" class="textToHelpMenuButtons" onclick="createNote(event);">Notes</div>
  <div id="tthCopySep" class="sep"></div>
  <div id="tthCopy" class="textToHelpMenuButtons" onclick="copyText(event);">Copy</div>
  <div class="arrow-down" style="display:none;"></div>
</div>
```

### Styling (style.css lines 561-563)

```css
div#textToHelpMenu div.textToHelpMenuButtons {
  background: #000; color: #FFF; font-size: 14px;
  padding: 10px; cursor: pointer;
  float: left;
  user-select: none;
}
div#textToHelpMenu div.sep {
  height: 41px; margin: 0 2px;
  float: left;
  border-right: 1px dotted #FFF;
}
div#textToHelpMenu div.arrow-down {
  width: 0; height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #000;
  position: absolute; bottom: -5px;
  left: 0; right: 0;
  margin-left: auto; margin-right: auto;
}
```

### Positioning Logic (`setPosTextHelp`, util.js lines 2024-2036)

```javascript
function setPosTextHelp(offset, objWid) {
  var calLeft = (offset.left + (objWid / 2)) - ($('#textToHelpMenu').width() / 2);
  // Arrow centering
  $('#textToHelpMenu .arrow-down').css('right', 0).css('left', 0);
  // Clamp to viewport
  if (calLeft < 0) {
    calLeft = 20;
    // Adjust arrow to point at word
    $('#textToHelpMenu .arrow-down').css('left', offset.left + (objWid / 2) - 25);
  } else if (calLeft + menuWidth > windowWidth) {
    // Shift left and adjust arrow
    calLeft -= (rightDiff + 20);
  }
  // Position 45px above the word
  $('#textToHelpMenu').css('left', calLeft).css('top', offset.top - 45).show();
}
```

### Button Functions

| Button | Function | Source | Behavior |
|--------|----------|--------|----------|
| Speak | `playText()` | common.js line 3101 | Sets voice speed to 50, calls `ssAPI.speechTools.speakById('tempID')` on highlighted text |
| Dictionary | `eventDic(e)` | common.js line 3014 | Calls `ssAPI.textTools.dictionaryLookup(text)` -- opens SpeechStream dictionary popup |
| Picture Dictionary | `eventPicDic(e)` | common.js line 3032 | Calls `ssAPI.textTools.pictureDictionaryLookupWord(text)` -- visual dictionary |
| Translate | `eventTrans(e)` | common.js line 3048 | Calls `ssAPI.textTools.translateRequest(text)` -- translates to selected language |
| Notes | `createNote(e)` | common.js (shows notes modal) | Opens `#notesModal` with textarea for note entry |
| Copy | `copyText()` | common.js line 2628 | Calls `SaveData('clipboardText', text)` -- saves to app clipboard |

### Contextual Button Visibility

- **Word tap** (single `.w` element): All buttons shown (`$('#textToHelpMenu .textToHelpMenuButtons, #textToHelpMenu .sep').show()`)
- **Sentence double-tap** (`.s` element): Only Speak, Notes, Copy, Translate shown. Dictionary and Picture Dictionary are hidden.

---

## 9. Screen Mask

**File:** `player.html` lines 64-71, `common.js` lines 724-726

### Implementation

The Screen Mask is entirely delegated to the SpeechStream API:

```javascript
// common.js line ~724-726
$('#btnScreenMask').on('click', function() {
  ssAPI.studyTools.toggleScreenMask();
});
```

The SpeechStream SDK handles all rendering and interaction. The button is a simple toggle.

### Button HTML (player.html lines 64-71)

```html
<div class="screenmask active">
  <button id="btnScreenMask" aria-label="Screen mask" title="Screen mask">
    <img src="./media/screen-mask.png" style="min-width:16px;margin-top:3px;margin-left:-2px;">
  </button>
</div>
```

### Button CSS (style.css lines 381-395)

```css
#btnScreenMask img { border-top: 3px solid black; border-bottom: 3px solid black; }
#btnScreenMask {
  cursor: pointer; font-size: 15px; border: none;
  border-radius: 50%;
  background-color: white !important;
  height: 36px; width: 36px;
}
```

---

## 10. Translation

**File:** `player.html` lines 122-139, `common.js` lines 70-99 and 3048-3085

### Language List Population (common.js lines 70-99)

On SpeechStream load, `loadLanguageList()` runs:
1. Gets languages from `ssAPI.textTools.getLanguageList()` which returns `{ "Lanaguages with a voice": [...], "Lanaguages without a voice": [...] }`
2. Merges and sorts the arrays
3. Builds `<li>` elements into `#translateMenu`
4. **Spanish is pre-selected** as the default language
5. Sets default destination: `ssAPI.textTools.setTranslateDestination("Spanish")`

### Language Selection UI

```html
<div class="language active">
  <button id="btnLanguage" class="button9 margin_none" aria-expanded="false">Translate</button>
  <div id="menuLanguage" class="tooltip_tools" style="display:none;">
    <div class="tools_tooltip">
      <div class="tooltip_arrow sprite"></div>
      <div class="tooltip_wrap"><h2>Select Language</h2></div>
      <div id="languagesList" class="tooltip_wrap_language languagesList">
        <ul id="translateMenu">
          <!-- Dynamically populated -->
        </ul>
      </div>
    </div>
  </div>
</div>
```

### Language List Styling (style.css lines 329-348)

```css
.languagesList { height: 500px; overflow-y: scroll; -webkit-overflow-scrolling: touch; }
.tooltip_wrap_language li { padding: 4px 8px 4px 20px; font-size: 16px; border-bottom: 1px solid #ddd; position: relative; }
.tooltip_wrap_language li div { inline-size: 150px; overflow-wrap: break-word; }
.signal { width: 16px; height: 16px; background-position: -73px -46px; position: absolute; right: 10px; top: 50%; margin-top: -8px; }
.tooltip_wrap_language li.active .signal { background-position: -73px -77px; }
```

### Translation Execution (common.js lines 3048-3085)

```javascript
var eventTrans = function(e) {
  e.preventDefault();
  $('#msTextHelp').selectText();
  ssAPI.textTools.translateRequest($('#msTextHelp').text());
  $('#textToHelpMenu').hide();
  // Wait for SpeechStream dialog to appear, then:
  // - Add accessibility attributes
  // - Show "No Speech Available" message if applicable
};
```

---

## 11. Font Resize

**File:** `player.html` lines 103-120, `common.js` lines 686-721, `style.css` lines 567-602

### Three Font Levels

| Level | Body Class | `cssPath` Attr | player.html Line | Size for `<p>` | Size for `<div>` |
|-------|-----------|---------------|-------------------|---------------|-----------------|
| Small | `t1` | `t1` | 112 | `1.125em` | `0.875em` |
| Medium (default) | `t2` | `t2` | 113 | `1.30em` | `1.125em` |
| Large | `t3` | `t3` | 114 | `1.60em` | `1.250em` |

### CSS Rules (style.css lines 567-602)

```css
.t1 .Book_Notes_content p, .t1 z p { font-size: 1.125em; line-height: 1.75; }
.t1 .Book_Notes_content:not(#tocList):not(#rightPageWrapTOC) > div { font-size: 0.875em; line-height: 1.75; }
.t2 .Book_Notes_content p, .t2 z p { font-size: 1.30em !important; line-height: 1.75; }
.t2 .Book_Notes_content:not(#tocList):not(#rightPageWrapTOC) > div { font-size: 1.125em; line-height: 1.75; }
.t3 .Book_Notes_content p, .t3 z p { font-size: 1.60em; line-height: 1.75; }
.t3 .Book_Notes_content:not(#tocList):not(#rightPageWrapTOC) > div { font-size: 1.250em; line-height: 1.75; }
```

**Per-page fallback classes** (style.css lines 599-602):
```css
#rightPageWrap.t0, #leftPageWrap.t0 { font-size: 0.775em; line-height: 1.75; }
#rightPageWrap.t1, #leftPageWrap.t1 { font-size: 0.875em; line-height: 1.75; }
#rightPageWrap.t2, #leftPageWrap.t2 { font-size: 1.125em; line-height: 1.75; }
#rightPageWrap.t3, #leftPageWrap.t3 { font-size: 1.250em; line-height: 1.75; }
```

### Font Resize Behavior (common.js lines 686-721)

```javascript
// Toggle dropdown visibility
$('#btnFontResize').on('click', function() {
  $('#menuFontResize').toggle();
  // ...
});

// Apply font size
$('.zooms').on('click', function() {
  $('.zooms.active').removeClass('active');
  $(this).addClass('active');
  loadCSS($(this).attr('cssPath'));  // Sets body class
});
```

**`loadCSS()` function** (common.js lines 2275-2282):
```javascript
function loadCSS(path) {
  $('body').attr('class', path);
}
```

### Auto Font-Size Reduction (`FitTextInPage`, common.js lines 2217-2241)

If content overflows the page container after rendering, the font size is stepped down:
- `t3` -> `t2` -> `t1` -> `t0`
- Applied per-page via adding class to `#leftPageWrap` / `#rightPageWrap` directly
- `t0` is the smallest emergency size: `0.775em`

---

## 12. Color Reference

### Background & Frame
| Element | Color/Value | Source |
|---------|-------------|--------|
| Body background | `url(../image/background.jpg) no-repeat; background-size: cover` | style.css line 36-39 |
| Header bar | `#292c30` | style.css line 146 |
| Header border | `1px solid #353637` | style.css line 146 |
| Outer frame bg | `url(../media/background_bg.png) repeat` | style.css line 261 |
| Frame border | `2px solid #24789d` | style.css line 261 |
| Frame shadow | `0 0 5px 0 #536269` | style.css line 261-262 |
| Inner panel bg | `#fff` | style.css line 266 |
| Inner panel shadow | `0 0 6px rgba(0,0,0,0.5)` | style.css line 266 |

### Text
| Element | Color/Value | Source |
|---------|-------------|--------|
| Body text | `#4e4e4e` | style.css line 33 |
| Header text | `#fff` | style.css line 149 |
| Font family | `"Times New Roman", Times, serif` | style.css line 30 |
| UI font | `Helvetica, Arial, sans-serif` | style.css line 133 |

### Highlights
| Class | Color | Source |
|-------|-------|--------|
| `.highlight` (selection) | `yellow !important` | style.css line 555 |
| `.cyan` | `cyan !important; color: #000` | style.css line 366 |
| `.magenta` | `magenta !important; color: #000` | style.css line 367 |
| `.green` | `rgb(69, 235, 83) !important; color: #000` | style.css line 368 |

### Buttons & Controls
| Element | Color | Source |
|---------|-------|--------|
| Toolbar buttons (`button9`) | bg `#26282b`, text `#fff`, border `1px solid #fff` | style.css line 155-162 |
| Toolbar buttons active | bg `#fff`, text `#252629` | style.css line 167 |
| TextHelp popup | bg `#000`, text `#FFF` | style.css line 561 |
| TextHelp separators | `1px dotted #FFF` | style.css line 562 |
| Modal buttons (`button7`) | bg `#3444ad`, text `#fff` | style.css line 172-184 |
| TOC tabs | border `#38454e`, active bg `#38454e` | style.css line 278-292 |
| TOC tabs (dark bg) | border `#fff`, active bg `#fff`, text `#292c30` | style.css line 457-462 |
| Slider handle | bg `#fff`, shadow `0 0 3px #424242` | style.css lines 301-315 |
| Slider track | `inset 1px 5px 8px 1px rgba(0,0,0,0.3)`, border `1px solid #19232a` | style.css line 299 |
| Page balloon | bg `#000`, text `#FFF` | common.js line 3366 |
| Prev/Next buttons | `2px solid #fff`, disabled `opacity: 0.5` | style.css lines 217-260 |
| Disabled back button | sprite at `-370px -16px` | style.css line 152 |

### Overlays & Modals
| Element | Color | Source |
|---------|-------|--------|
| Overlay | bg `#000`, opacity `0.6` | style.css line 583 |
| Modal | bg `#fff`, border `rgba(0,0,0,0.3) 4px solid`, border-radius `8px` | style.css line 585 |
| Modal header | bg `url("activate_top_bg.png")`, text `#666` | style.css line 586 |
| Modal footer | bg `#eee`, border-top `1px solid #ddd` | style.css line 589 |
| Loader | bg `#fff`, text `#1b588a` | style.css lines 549-551 |

---

## 13. Page Rendering

**File:** `common.js` lines 1305-1476 (`setOrientation`, `calculatePageOrder`, `setPageInfo`), lines 1922-2272 (`displayPage`, `FitTextInPage`, `resizeImage`)

### Content Data Format

Each book loads a JS file (`{bookid}.js`) that defines a global `content` object:

```javascript
var content = {
  Toc: {
    "chapter_name": { order: 1, title: "Chapter 1", visibility: 1 },
    "chapter_name2": { order: 2, title: "Chapter 2", visibility: 1 },
    // ...
  },
  Pages: {
    "chapter_name": {
      sentences: [
        { sentence_text: "<p><z class='s'><z class='w'>Hello</z> <z class='w'>world</z></z></p>", ... },
        // ...
      ]
    },
    // ... or nested:
    "chapter_name": {
      Pages: [
        { sentences: [...] },
        { sentences: [...] }
      ]
    }
  }
};
```

### Page Calculation Pipeline

1. **`setOrientation()`** (common.js lines 1305-1323):
   ```javascript
   // Calculate available content height
   viewAreaHeight = windowHeight - 52 (header) - 48 (footer) - 46 (padding);
   ```

2. **`calculatePageOrder()`** (common.js lines 1326-1342):
   - Reads `content.Toc`, creates sorted `book.orderList` array
   - Each entry has: `name`, `order`, `title`, `visibility`, `sentences[]`

3. **`setPageInfo()`** (common.js lines 1344-1476):
   - Creates a hidden `#dummyText` div to measure content
   - For each sentence in each chapter:
     - Appends `sentence_text` HTML to `#dummyText`
     - Checks if `scrollHeight > containerHeight`
     - If overflow, increments landscape page number
     - Assigns `landScapePageNo` to each sentence
   - Images are resized via `resizeImage()` to fit container
   - Result: every sentence has a `landScapePageNo` property

### Page Display (`displayPage`, common.js lines 1922-2212)

```javascript
function displayPage(pageNo, isUserAction) {
  // Clear existing content
  $('#leftPageWrap').html('');
  $('#rightPageWrap').html('');

  // Iterate all chapters/sentences
  for (each chapter in book.orderList) {
    for (each sentence in chapter.sentences) {
      if (sentence.landScapePageNo == pageNo) {
        // Odd page -> left panel
        $('#leftPageWrap').append(sentence.sentence_text);
      }
      if (sentence.landScapePageNo == pageNo + 1) {
        // Even page -> right panel
        $('#rightPageWrap').append(sentence.sentence_text);
      }
    }
  }

  // Set tabindex on interactive elements
  $('.s, .w').attr('tabindex', '0');

  // Auto-reduce font if content overflows
  FitTextInPage('#leftPageWrap');
  FitTextInPage('#rightPageWrap');

  // Track word count for reading progress
  startWordCountTimer();
}
```

### Auto Font Reduction (`FitTextInPage`, common.js lines 2217-2241)

```javascript
function FitTextInPage(containerID) {
  // If content overflows the container:
  if ($(containerID)[0].scrollHeight > $(containerID).height()) {
    // Step down font size class on the container
    // t3 -> t2 -> t1 -> t0
    var currentClass = $('body').attr('class');
    if (currentClass == 't3') $(containerID).addClass('t2');
    else if (currentClass == 't2') $(containerID).addClass('t1');
    else $(containerID).addClass('t0');  // emergency smallest
  }
}
```

### Image Resizing (`resizeImage`, common.js lines 2244-2272)

Proportionally scales images to fit within the container dimensions while maintaining aspect ratio.

### Word Count / Reading Progress

- Default: 150 words per page (common.js line 54)
- Timer: 30 seconds per page for standard, 10 seconds for ilit20 (common.js line 54)
- `setLibraryProgress()` (common.js lines 2782-2897) saves: bookType, mode, chapNo, sentNo, font-size, WordCountObj, totalWordsRead, timeSpent
- Book completion: 50% of words read (standard) or 70% (ilit20, line 392)

---

## 14. Accessibility / Keyboard Navigation

**File:** `common.js` lines 3129-3646, `player.html` lines 48-62

### Accessibility Instructions (player.html lines 50-60)

Displayed when clicking the `infoBtn` (i) button:

1. **TAB** -- Switch between paragraphs (`.s` elements)
2. **W** -- From a selected paragraph, move focus to its first word (`.w` element)
3. **Left/Right Arrow** -- Navigate between words within a paragraph
4. **TAB** (while on a word) -- Disabled (prevented, line 3299-3303)
5. **P** -- From a word, select the parent paragraph (move focus back to `.s`)
6. **SPACE** -- Highlight the focused paragraph/word and open TextHelp popup
7. **A** -- Open the annotation pen (triggers `#btnTextHighlight` click)
8. **ESC** -- Dismiss highlights and close all popups

### Implementation (common.js lines 3129-3646)

The `accessibility` object binds keydown handlers on `.ebook_container_block`:

**SPACE (keyCode 32)** -- lines 3145-3193:
- If target is `.s` (sentence): highlights it, shows partial TextHelp (Speak, Notes, Copy, Translate)
- If target is `.w` (word): highlights it, shows full TextHelp (all buttons)
- Calls `setPosTextHelp(offset, objWid)` to position the popup

**ESC (keyCode 27)** -- lines 3196-3201:
- Removes `.highlight` class from all elements
- Returns focus to `_lastFocusedElem`
- Hides TextHelp popup and SpeechStream popups

**W (keyCode 87)** -- lines 3204-3211:
- If focused on `.s`, moves focus to its first `.w` child

**P (keyCode 80)** -- lines 3213-3220:
- If focused on `.w`, moves focus to its parent `.s`

**Right Arrow (keyCode 39)** -- lines 3222-3261:
- Navigates to next `.w` sibling
- Handles inline formatting elements (`<b>`, `<span>`, `<em>`, `<strong>`) by drilling into them
- Skips `<br>` elements

**Left Arrow (keyCode 37)** -- lines 3263-3296:
- Navigates to previous `.w` sibling
- Same inline element handling as Right Arrow

**TAB (keyCode 9)** -- lines 3299-3303:
- Prevented when focused on a `.w` element (forces use of arrows for word nav)

**A (keyCode 65)** -- lines 3320-3328 (document-level):
- If text is selected (`#rangeText` exists), triggers `#btnTextHighlight` click to open annotation pen
- Does nothing if notes modal is visible

### Document-Level ESC (common.js lines 3307-3317)

Also handles ESC at the document level to close all tool dropdowns:
- Hides `#menuLanguage`, `#menuFontResize`, `.thss-dialog-toolbarPopup`, `#InfoContent`
- Resets `aria-expanded` on toolbar buttons

### Focus Management

- Toolbar buttons handle focus to auto-close unrelated dropdowns (lines 3607-3640)
- Font resize dropdown closes when focus moves to language or info buttons
- Language dropdown closes when focus moves to font resize or left page

### ARIA Attributes

- Prev/next buttons: `aria-disabled="true"` when disabled (lines 3358, 3472)
- Slider handle: `aria-valuetext="Page Number X-Y"`, `aria-valuenow="X-Y"` (lines 3372, 3486)
- TextHelp popup: `role="region"`, `aria-label="textHelp popup"` (player.html line 214)
- Screen reader announcements: `#dynamicTextForSR` with `aria-live="assertive"` (player.html line 31)

---

## Notes Modal

**File:** `player.html` lines 238-265, `style.css` lines 398-591

### HTML

```html
<div id="overlay" class="overley"></div>  <!-- Semi-transparent overlay -->
<div id="notesModal" class="modal">
  <div class="actiavtion_wrapper">
    <div class="acces_top_nav">Notes</div>
    <div class="inside_access">
      <textarea id="txtAreaCreateNote" maxlength="1500"></textarea>
      <div id="txtAreaListNote" style="display:none;"></div>
    </div>
    <div class="btm_navs">
      <button id="cancelBtn" onclick="hideAddNotes();">Cancel</button>
      <button id="btnSaveNote" onclick="saveNewNotes();">Save Note</button>
    </div>
  </div>
</div>
```

### Note Saving (common.js lines 2486-2581)

`saveNewNotes()` constructs a JSON reference `{chapNo, sentNo}` linking the note to the current sentence, then calls `SaveNote()` via `$.nativeCall()`.

---

## Key Dependencies for Reimplementation

1. **SpeechStream API (ssAPI)** -- The entire TTS, dictionary, picture dictionary, translation, and screen mask functionality runs through this third-party API. For a replica, you would need to:
   - Use Web Speech API for text-to-speech
   - Build your own dictionary/translation UI (or use a different API)
   - Implement screen mask as a custom overlay

2. **Content format** -- Books are self-contained JS files defining a `content` object with `Toc` and `Pages`. The page calculation algorithm in `setPageInfo()` is the core pagination engine.

3. **jQuery / jQuery UI** -- The original uses jQuery for everything. A modern implementation would use React/Next.js state management instead, but the interaction patterns (highlight, popup positioning, slider) remain the same.

4. **Hammer.js** -- Touch gesture library. Modern equivalent: built-in pointer events or a library like `use-gesture`.

5. **Background assets** -- `background.jpg` (body), `background_bg.png` (frame texture), `sprite_ratina.png` (button icons), `activate_top_bg.png` (modal header). These are image-based textures, not CSS effects.
