# Savvas I-LIT eBook Reader: Complete Implementation Spec

> Extracted from the production ClassView source code. This document contains every UX-relevant detail needed to implement the eBook reader without reading the original source files.

**Source files analyzed:**
- `player.html` -- HTML shell (457 lines)
- `common.js` -- Main application logic (~3683 lines)
- `style.css` -- Primary CSS (710 lines)
- `ebookplayer_dev.css` -- Dev CSS overrides (111 lines)
- `util.js` -- Shared utilities (includes `setPosTextHelp`)
- `lib.js` -- jQuery, Hammer.js, other libs bundled (~43k tokens)

---

## 1. DOM Structure

### 1.1 Page-Level Containers

```
<body class="t2">                                         <!-- Default medium font size -->
  <div id="dynamicTextForSR" aria-live="assertive">       <!-- Screen reader announcements -->
  <div id="msTextHelp">                                   <!-- Hidden text store for SpeechStream -->
  <header id="eBookHeaderContainer">                      <!-- Toolbar header -->
    <div class="header_inner ebook">
      <div class="header_innerin">                        <!-- Dark toolbar bar -->
        [Back] [TOC] [Title] [Info] [ScreenMask] [Pen] [FontResize] [Translate]
      </div>
    </div>
  </header>
  <div id="wrapper" class="ebook_container_content">      <!-- Main content area -->
    <div id="previousPage" class="ebook_previous_button"> <!-- Left arrow -->
    <div id="viewArea" class="ebook_box_notes">           <!-- Outer textured frame -->
      <div class="ebook_box_notes_grid4">                 <!-- Inner white panel -->
        <div class="ebook_content_block_middle">
          <div class="ebook_content_block">               <!-- Two-page content row -->
            <div class="ebook_container_block left_ebook"> <!-- Left page column -->
              <div class="ebook_text_content">
                <div class="notes_content_bl">
                  <div id="imgNotes" class="notesIcon">   <!-- Notes icon -->
                  <div id="leftPageWrap" class="Book_Notes_content"> <!-- LEFT PAGE -->
            <div class="ebook_container_block right_ebook"> <!-- Right page column -->
              <div class="ebook_text_content">
                <div class="notes_content_bl">
                  <div id="rightPageWrap" class="Book_Notes_content"> <!-- RIGHT PAGE -->
                  <div id="rightPageWrapTOC" class="Book_Notes_content"> <!-- RIGHT PAGE (TOC mode) -->
    <div id="nextPage" class="ebook_next_button">         <!-- Right arrow -->
    <div class="pages_slider_conts">                      <!-- Page slider area -->
      <div id="slider-range-min" class="valid-activity">  <!-- jQuery UI slider -->
  <div id="popup-overlay3"> + <div id="loaderWrap">      <!-- Loader overlay -->
  <div id="overlay"> + <div id="notesModal">             <!-- Notes modal -->
  <div id="dialog-message">                               <!-- Alert dialog -->
  <div id="collect-highlight-dialog">                     <!-- Collected highlights dialog -->
  <div id="textToHelpMenu">                               <!-- TextHelp popup -->
</body>
```

Source: `player.html` lines 1-457

### 1.2 URL Hash Parameters

Book data is passed via URL hash, pipe-separated with `|||`:

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

### 1.3 Boot Sequence

1. `window.onload` parses the hash (player.html line 367)
2. `addNativeBridge()` detects platform (iOS/ChromeApp/web) and calls `GetEbookInfo(bookid, isBroadcast)` (line 302)
3. `scheduleCheck()` polls until `objEbookJsonData` is populated (line 328), then calls `loadJS(bookPath + bookid + ".js", callback)` (line 356)
4. On book JS load, calls `GetLibraryProgress(undefined, bookid)` (line 357)
5. `GetLibraryProgressCallback` restores saved font size, word count, and page state, then calls `init()` (common.js line 2765)

### 1.4 Script Load Order

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
15. SpeechStream 3.9.5 (external CDN): `https://toolbar.speechstream.net/SpeechStream/3.9.5/speechstream.js`

---

## 2. Two-Page Spread Layout

### 2.1 Body & Background

```css
body {
    font-family: "Times New Roman", Times, serif;
    font-size: 16px;
    line-height: 22px;
    color: #4e4e4e;
    background: url(../image/background.jpg) no-repeat;
    background-size: cover;
    overflow: hidden;
    touch-action: none !important;
}
```

The `background.jpg` is a dark, full-bleed image that fills the viewport behind the reader.

### 2.2 Content Wrapper

```css
.ebook_container_content {
    margin: 20px 10%;          /* Horizontal margins at 10% of viewport */
    position: relative;         /* Anchor for prev/next buttons */
}

/* Tablet breakpoint */
@media screen and (max-width: 1024px) {
    .ebook_container_content {
        margin: 20px 55px;     /* Fixed margins on smaller screens */
    }
}
```

### 2.3 Outer Frame (Textured Border)

```css
.ebook_box_notes {
    background: url(../media/background_bg.png) repeat 0 0;  /* Wooden texture tile */
    border-radius: 15px;
    border: 2px solid #24789d;                                 /* Cyan border */
    box-shadow: 0 0 5px 0 #536269;
    padding: 10px;
    overflow-y: hidden;
}
```

The `background_bg.png` is a repeating wood-grain texture that creates the bookshelf frame feel.

### 2.4 Inner White Panel

```css
.ebook_box_notes_grid4 {
    background: #fff;
    padding: 0 2px;
    box-shadow: 0 0 6px rgba(0,0,0,0.5);
    border-radius: 5px;
}
```

### 2.5 Content Block

```css
.ebook_content_block {
    padding: 2% 2%;
    color: black;
}
```

### 2.6 Page Padding

**Right page** (default for `.ebook_text_content`):
```css
.ebook_text_content {
    padding: 2% 1% 2% 6%;
}
```

**Left page** (override):
```css
.ebook_container_block.left_ebook .ebook_text_content {
    padding: 2% 6% 5% 1%;
}
```

### 2.7 Page Content Container

```css
.Book_Notes_content {
    max-height: 270px;
    padding: 0;
    position: relative;
}
```

The `max-height: 270px` is the key constraint that drives the pagination algorithm. Content that exceeds this height triggers a page break during `setPageInfo()`.

---

## 3. Toolbar

### 3.1 Header Bar

```css
header {
    position: relative;
    z-index: 1;
}

.header_innerin {
    background: #292c30;
    border-bottom: 1px solid #353637;
    padding: 5px 15px 5px 10px;
    color: #fff;
    font-size: 18px;
    line-height: 30px;
    text-align: center;
}
```

### 3.2 Button Layout (left to right)

| Button | ID | Class/Type | Size | Behavior |
|--------|----|------------|------|----------|
| Back to Library | `BackToLibrary` | `.sld_lft.sprite.left` | 30x30px | Calls `setLibraryProgress()`, navigates back |
| Table of Contents | `btnTOC` | `.toc_icn.left.sprite` | 40x40px | Toggles TOC panel |
| Book Title | `<h1>` | `.middle` | width: 570px | Uppercase, centered, `margin-left: 15%` |
| Accessibility Info | `infoBtn` | round icon | 36x36px | Shows keyboard instructions |
| Screen Mask | `btnScreenMask` | round icon | 36x36px | Toggles SpeechStream screen mask |
| Annotation Pen | `btnTextHighlight` | round icon | 36x36px | Opens highlight color dropdown |
| Font Resize (Aa) | `btnFontResize` | `button9` | auto | Opens font size dropdown |
| Translate | `btnLanguage` | `button9.margin_none` | auto | Opens language list dropdown |

### 3.3 button9 Style (Text Buttons)

```css
button.button9 {
    cursor: pointer;
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

### 3.4 Round Icon Buttons

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

The Info button uses the same visual pattern: 36x36px white circle with an icon image inside.

### 3.5 Sprite References

```css
.sld_lft { /* Back button */
    width: 30px; height: 30px;
    background-position: -173px -181px;
    margin-top: 7px !important;
}
.sld_lft.disabled {
    background-position: -370px -16px;
    cursor: auto;
}
.toc_icn { /* TOC button */
    width: 40px; height: 40px;
    background-position: -28px -1px;
}
```

### 3.6 Toolbar Button Positioning

The `.screenmask` and `.text-highlight` containers are floated left with 5px horizontal padding:
```css
.screenmask, .text-highlight {
    position: relative;
    float: left;
    padding-left: 5px;
    padding-right: 5px;
}
```

The `.info` container is floated left with `margin-left: 10% !important; padding-right: 5px !important`.

The `.language` container is floated left with `padding-left: 5px !important`.

The `.pagezoom` container is floated left.

---

## 4. Page Navigation

### 4.1 Prev/Next Buttons

```css
.ebook_previous_button {
    position: absolute;
    width: 40px;
    height: 40px;
    border: 2px solid #fff;
    border-radius: 50%;
    top: 50%;
    margin-top: -20px;
    left: -48px;
    background-image: url(../media/sprite_ratina.png);
    background-repeat: no-repeat;
    background-size: 500px 800px;
    background-position: -362px -698px;
    text-indent: -1000px;       /* Hide "prev" text */
    overflow: hidden;
    cursor: pointer;
}

.ebook_next_button {
    /* Same dimensions but mirrored: */
    right: -48px;
    background-position: -460px -698px;
}

.ebook_previous_button.disabled,
.ebook_next_button.disabled {
    cursor: auto;
    opacity: 0.5;
}
```

Both buttons positioned absolutely relative to `.ebook_container_content`, centered vertically at 50% with negative margin.

### 4.2 Navigation Logic

Source: `common.js` lines 3333-3569

Both buttons use click AND keydown (Space/Enter) handlers:

- **Previous:** `eBookEnvironment.currLandScapePageNo -= 2`, then calls `displayPage()` and updates slider. Disabled when `currLandScapePageNo <= 1`.
- **Next:** `eBookEnvironment.currLandScapePageNo += 2`, then calls `displayPage()` and updates slider. Disabled when `currLandScapePageNo >= maxLandScapePageNo`.

Pages always advance by 2 (two-page spread). Odd page numbers go to the left panel, even page numbers to the right.

### 4.3 Swipe Navigation

Source: `common.js` lines 999-1132

Uses Hammer.js `dragend` event on `.ebook_container_block`:
- **Swipe right** (`DIRECTION_RIGHT`): Goes back 2 pages
- **Swipe left** (`DIRECTION_LEFT`): Goes forward 2 pages

### 4.4 Page Slider

HTML:
```html
<div class="pages_slider_conts">
    <div id="slider-range-min" class="valid-activity"></div>
</div>
```

CSS:
```css
.pages_slider_conts {
    padding: 1% 0 1% 0;
    width: 100%;
    position: relative;
}

.ui-slider.ui-widget-content {
    box-shadow: inset 1px 5px 8px 1px rgba(0,0,0,0.3);
    border: 1px solid #19232a;
    border-bottom: 1px solid #96a1a6;
    background: none;
    border-radius: 10px;
}

.ui-slider .ui-slider-range {
    border-radius: 10px;
    background: none;
}

.pages_slider_conts .ui-slider .ui-slider-handle {
    background: #FFFFFF;
    border: 1px solid #FFFFFF;
    border-radius: 40px;
    box-shadow: 0 0 3px 0 #424242;
    color: #000000;
    font-size: 12px;
    height: 2.75em;
    line-height: 2.75em;
    margin-left: -2.5em;
    text-align: center;
    top: -0.9em;
    width: 5em;
}

.ui-slider-handle span {
    line-height: 3.1em;
    font-size: 12px;
    color: #111;
    font-family: sans-serif;
}
```

jQuery UI Slider initialization (common.js ~line 884):
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

### 4.5 Page Balloon (Tooltip During Slider Drag)

Dynamically generated above the slider handle during drag (common.js ~line 3366):

```javascript
var tempVal = '<div id="pageNoBallon" style="position:absolute;top:-3.5em;border-radius:12px;left:0px;background:#000;">' +
    '<div style="height:35px;line-height:35px;white-space:nowrap;padding:0 7px;color:#FFF;">' +
    pageNo + '-' + (pageNo+1) + ' of ' + maxPage +
    '</div>' +
    '<div style="border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid #000;bottom:-5px;..."></div>' +
'</div>';
```

Black background, white text, CSS triangle arrow pointing down.

---

## 5. Word-Level Interaction

### 5.1 Content Structure

Book content HTML uses custom `<z>` elements:
- `<z class="s">` -- Sentence wrapper (focusable via TAB for accessibility)
- `<z class="w">` -- Individual word wrapper (focusable after pressing W)

CSS:
```css
z { display: inline; }
.w { font-size: inherit !important; }
```

### 5.2 Touch Interaction

Source: `common.js` lines 783-881

**Single-tap on word** (Hammer.js `tap` on `.ebook_container_block`):
1. Finds the `.w` element
2. Adds `.highlight` class (yellow background)
3. Shows FULL TextHelp popup (all 6 buttons: Speak, Dictionary, Picture Dictionary, Translate, Notes, Copy)
4. Calls `setPosTextHelp(offset, objWid)` to position the popup

**Double-tap on sentence** (Hammer.js `doubletap` on `.ebook_container_block`):
1. Finds the parent `.s` element of the tapped target
2. Adds `.highlight` class
3. Stores highlighted text in `#msTextHelp` hidden element
4. Shows PARTIAL TextHelp popup (only Speak, Translate, Notes, Copy -- hides Dictionary and Picture Dictionary)
5. Calls `setPosTextHelp(offset, objWid)` to position the popup

### 5.3 Selection Highlight

```css
.highlight { background: yellow !important; }

::selection { background: rgba(255, 255, 255, 0.8); color: #000; }
::-moz-selection { background: rgba(255, 255, 255, 0.1); color: #000; }
```

### 5.4 tabindex Assignment

During `displayPage()`, all `.s` and `.w` elements receive `tabindex="0"` to make them keyboard-focusable.

---

## 6. TextHelp Popup

### 6.1 HTML Structure

```html
<div id="textToHelpMenu" role="region" aria-label="textHelp popup"
     style="position:absolute;display:none;background:#000;">
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

### 6.2 CSS

```css
div#textToHelpMenu div.textToHelpMenuButtons {
    background: #000;
    color: #FFF;
    font-size: 14px;             /* Note: CSS has a typo "font:size" in source */
    padding: 10px;
    cursor: pointer;
    user-select: none;
    float: left;
}

div#textToHelpMenu div.sep {
    height: 41px;
    margin: 0 2px;
    float: left;
    border-right: 1px dotted #FFF;
}

div#textToHelpMenu div.arrow-down {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #000;
    position: absolute;
    bottom: -5px;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
}
```

### 6.3 Positioning Logic

Source: `util.js` lines 2024-2036 (`setPosTextHelp`)

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

Key behavior: popup centered above the tapped word, 45px gap. Clamped to viewport edges with arrow adjustment.

### 6.4 Button Functions

| Button | Function | Behavior |
|--------|----------|----------|
| Speak | `playText()` | Sets voice speed to 50, calls `ssAPI.speechTools.speakById('tempID')` |
| Dictionary | `eventDic(e)` | Calls `ssAPI.textTools.dictionaryLookup(text)` |
| Picture Dictionary | `eventPicDic(e)` | Calls `ssAPI.textTools.pictureDictionaryLookupWord(text)` |
| Translate | `eventTrans(e)` | Calls `ssAPI.textTools.translateRequest(text)` |
| Notes | `createNote(e)` | Opens `#notesModal` with textarea |
| Copy | `copyText()` | Calls `SaveData('clipboardText', text)` |

### 6.5 Contextual Button Visibility

- **Word tap** (`.w`): All 6 buttons shown
- **Sentence double-tap** (`.s`): Only Speak, Translate, Notes, Copy. Dictionary and Picture Dictionary hidden.

---

## 7. Annotation Pen

### 7.1 Dropdown HTML

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
                    <div class="highlights strike">S</div>
                    <div class="highlights cyan">Cyan</div>
                    <div class="highlights magenta active">Magenta</div>
                    <div class="highlights green">Green</div>
                    <div class="highlights clear"><img src="clear.png"></div>
                    <div class="highlights collect"><img src="list.png"></div>
                </div>
            </div>
        </div>
    </div>
</div>
```

### 7.2 Dropdown Positioning

```css
.tooltip_tools {
    position: absolute;
    right: 0px;
    top: 50px;
    color: #000000;
    display: inline-block;
    font-size: 18px;
    text-align: left;
    vertical-align: middle;
}

.tools_tooltip {
    background: #FFFFFF;
    border: 1px solid #666666;
    border-radius: 9px;
    box-shadow: 0 2px 5px 1px #999;
    display: none;
    width: 250px;       /* General tooltip width */
    z-index: 5;
}

.text-highlight .tools_tooltip {
    width: 346px;       /* Wider for highlight options */
}

.tooltip_arrow {
    background-position: -7px -67px;    /* Sprite arrow */
    height: 17px;
    left: 75%;                           /* Default position */
    position: absolute;
    top: -15px;
    width: 31px;
}

#menuTextHighlight .tooltip_arrow {
    left: 88%;                           /* Shifted right for pen dropdown */
}
```

### 7.3 Highlight Colors

```css
.cyan    { background-color: cyan !important; color: #000 !important; }
.magenta { background-color: magenta !important; color: #000 !important; }
.green   { background-color: rgb(69, 235, 83) !important; color: #000 !important; }
.strike  { text-decoration: line-through; }
```

### 7.4 Highlight/Collect Button Styles

```css
.zooms, .highlights {
    display: inline-block;
    margin: 5px 5px;
    min-height: 30px;
    min-width: 40px;
    border-radius: 6px;
    border: 1px solid #38454e;
    line-height: 30px;
    font-size: 26px;
    vertical-align: top;
    color: #38454e;
    cursor: pointer;
}

.highlights { font-size: 10px; }
.highlights.strike { font-size: 20px; }
.highlights.clear, .highlights.collect { line-height: 21px; }
.highlights.clear img { height: 19px; margin-top: 4px; }
.highlights.collect img { margin-top: 4px; }

.zoom_container, .highlight_container {
    padding: 5px;
    text-align: center;
}
```

### 7.5 Highlight Behavior

Source: `common.js` lines 339-684

When a user taps a highlight color button while text has the `.highlight` class:

1. **Cyan/Magenta/Green:** Adds the color class AND `.annotation` class to the highlighted element
2. **Strike:** Adds `.strike` and `.annotation` classes
3. **Clear:** Removes all color classes and `.annotation` from the highlighted element
4. **Collect:** Gathers all elements with `.annotation` class, displays in a jQuery UI dialog grouped by color

### 7.6 Collected Highlights Dialog

```css
#collect-highlight-dialog {
    font-size: 14px !important;
    font-family: "Open Sans", Arial, sans-serif !important;
    padding: 25px !important;
    max-height: 395px !important;
}

#collect-highlight-dialog ul,
#collect-highlight-dialog li {
    list-style: decimal;
    margin-bottom: 20px;
}
```

### 7.7 Highlight Persistence

Source: `common.js` lines 2632-2708

- `SaveNewHighlights(chaptorNo, pageNo)` (line 2635): Serializes and calls server API via `$.nativeCall({ method: 'SaveHighLight', ... })`
- `GetHighlights()` (line 2690): Calls `GetHighLightInfo(bookid)` to fetch saved highlights
- `ApplyHighLightData()` (line 2694): Iterates `book.orderList`, updates sentence objects with saved highlight classes
- Highlights stored in `defaultHighlight` array, persisted per book

---

## 8. Table of Contents Panel

### 8.1 Behavior

Source: `common.js` lines 1644-1871 (`generateTOC()`)

When `#btnTOC` is clicked:
1. Left page (`#leftPageWrap`) shows the book cover image
2. Right page is replaced by `#rightPageWrapTOC` which contains a tabbed panel

### 8.2 Generated Structure

```html
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

### 8.3 TOC Tab Styling

**Default (white background) context:**
```css
.notetab {
    border: 1px solid #38454e;
    border-radius: 5px;
    overflow: hidden;
    display: inline-block;
    margin: 2% 0 5%;
}

.notetab button.button8 {
    background: none;
    color: #38454e;
    font-size: 15px;
    padding: 4px 5px;
    border: 0;
    width: 140px;
    cursor: pointer;
    margin: 0;
}

.notetab button.button8.active {
    background: #38454e;
    color: #fff;
    cursor: default;
}
```

**Dark background (footer) context:**
```css
.footer_bottom_block {
    background: #292c30;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 -5px 5px -2px rgba(0,0,0,0.2);
}

.footer_bottom_block .notetab {
    border: 1px solid #fff;
    margin: 3% 0 2%;
}

.footer_bottom_block .notetab button.button8 {
    width: 78px;
    color: #fff;
}

.footer_bottom_block .notetab button.button8.active {
    background: #fff;
    color: #292c30;
}
```

### 8.4 TOC List Styling

```css
.ebook_list {
    margin-left: 0px;
    padding: 0;
}

.ebook_list li {
    list-style: none;
    cursor: pointer;
}

.toc_name_row a {
    line-height: 35px;
    display: block;
    text-decoration: none;
    color: #4E4E4E;
}

/* Notes list (numbered) */
#notesOrderedList.ebook_list li {
    list-style: decimal;
    padding-top: 1px;
    cursor: pointer;
    font-size: 16px;
    line-height: 35px;
    display: block;
}
```

### 8.5 TOC Data Source

Built from `book.orderList` (derived from `content.Toc`). Each chapter with `visibility == 1` gets a list item. Clicking a chapter:
1. Sets `eBookEnvironment.currLandScapePageNo` to the first page of that chapter
2. Calls `displayPage()` to render it
3. Hides the TOC panel and shows normal page content

---

## 9. Font Resize

### 9.1 Three Font Levels

| Level | Body Class | Size for `<p>` | Size for `<div>` |
|-------|-----------|---------------|-----------------|
| Small | `t1` | `1.125em` | `0.875em` |
| Medium (default) | `t2` | `1.30em` | `1.125em` |
| Large | `t3` | `1.60em` | `1.250em` |

### 9.2 CSS Rules

```css
/* Small */
.t1 .Book_Notes_content p, .t1 z p { font-size: 1.125em; line-height: 1.75; }
.t1 .Book_Notes_content:not(#tocList):not(#rightPageWrapTOC) > div, .t1 z div {
    font-size: 0.875em; line-height: 1.75;
}

/* Medium (default) */
.t2 .Book_Notes_content p, .t2 z p { font-size: 1.30em !important; line-height: 1.75; }
.t2 .Book_Notes_content:not(#tocList):not(#rightPageWrapTOC) > div, .t2 z div {
    font-size: 1.125em; line-height: 1.75;
}

/* Large */
.t3 .Book_Notes_content p, .t3 z p { font-size: 1.60em; line-height: 1.75; }
.t3 .Book_Notes_content:not(#tocList):not(#rightPageWrapTOC) > div, .t3 z div {
    font-size: 1.250em; line-height: 1.75;
}

/* Paragraph bottom margin at all sizes */
.t1 .Book_Notes_content p { margin-bottom: 20px; }
.t2 .Book_Notes_content p { margin-bottom: 20px; }
.t3 .Book_Notes_content p { margin-bottom: 20px; }

/* Override to prevent margin issues */
.Book_Notes_content p { margin-top: 0 !important; }
```

### 9.3 Per-Page Fallback Classes (Auto Font Reduction)

Applied directly to `#leftPageWrap` or `#rightPageWrap` when content overflows:

```css
#rightPageWrap.t0, #leftPageWrap.t0 { font-size: 0.775em; line-height: 1.75; }
#rightPageWrap.t1, #leftPageWrap.t1 { font-size: 0.875em; line-height: 1.75; }
#rightPageWrap.t2, #leftPageWrap.t2 { font-size: 1.125em; line-height: 1.75; }
#rightPageWrap.t3, #leftPageWrap.t3 { font-size: 1.250em; line-height: 1.75; }
```

### 9.4 Dropdown Structure

```html
<div class="pagezoom">
    <button id="btnFontResize" class="button9">Aa</button>
    <div id="menuFontResize" class="tooltip_tools" style="display:none;">
        <div class="tools_tooltip">
            <div class="tooltip_arrow sprite"></div>
            <div class="zoom_container">
                <div class="zooms zoom1" cssPath="t1">A</div>
                <div class="zooms zoom2 active" cssPath="t2">A</div>
                <div class="zooms" cssPath="t3">A</div>
            </div>
        </div>
    </div>
</div>
```

CSS for size options:
```css
.pagezoom .tools_tooltip { width: 180px; }
.zooms.active { color: #fff; background: #38454e; }
.zoom2.zooms { font-size: 22px; }
.zoom1.zooms { font-size: 16px; }
/* Default .zooms font-size is 26px */
```

### 9.5 Font Resize Behavior

Source: `common.js` lines 686-721

```javascript
$('#btnFontResize').on('click', function() {
    $('#menuFontResize').toggle();
});

$('.zooms').on('click', function() {
    $('.zooms.active').removeClass('active');
    $(this).addClass('active');
    loadCSS($(this).attr('cssPath'));  // Sets body class
});
```

`loadCSS()` (common.js lines 2275-2282):
```javascript
function loadCSS(path) {
    $('body').attr('class', path);  // Replaces entire body class
}
```

### 9.6 Auto Font-Size Reduction (FitTextInPage)

Source: `common.js` lines 2217-2241

If content overflows the page container after rendering, the font size is stepped down:

```javascript
function FitTextInPage(containerID) {
    if ($(containerID)[0].scrollHeight > $(containerID).height()) {
        var currentClass = $('body').attr('class');
        if (currentClass == 't3') $(containerID).addClass('t2');
        else if (currentClass == 't2') $(containerID).addClass('t1');
        else $(containerID).addClass('t0');  // Emergency smallest
    }
}
```

Cascade: `t3` -> `t2` -> `t1` -> `t0`. Applied per-page independently.

---

## 10. Translation

### 10.1 Language List Population

Source: `common.js` lines 70-99

On SpeechStream load, `loadLanguageList()` runs:
1. Gets languages from `ssAPI.textTools.getLanguageList()` which returns `{ "Lanaguages with a voice": [...], "Lanaguages without a voice": [...] }`
2. Merges and sorts the arrays alphabetically
3. Builds `<li>` elements into `#translateMenu`
4. **Spanish is pre-selected** as the default language
5. Sets default destination: `ssAPI.textTools.setTranslateDestination("Spanish")`

### 10.2 Language Selection UI

```html
<div class="language active">
    <button id="btnLanguage" class="button9 margin_none" aria-expanded="false">Translate</button>
    <div id="menuLanguage" class="tooltip_tools" style="display:none;">
        <div class="tools_tooltip">
            <div class="tooltip_arrow sprite"></div>
            <div class="tooltip_wrap"><h2>Select Language</h2></div>
            <div id="languagesList" class="tooltip_wrap_language languagesList">
                <ul id="translateMenu">
                    <!-- Dynamically populated with 100+ languages -->
                </ul>
            </div>
        </div>
    </div>
</div>
```

### 10.3 Language List CSS

```css
.languagesList {
    height: 500px;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    margin: 3px 2px 3px 0px;
}

.tooltip_wrap_language li {
    padding: 4px 8px 4px 20px;
    font-size: 16px;
    border-bottom: 1px solid #ddd;
    position: relative;
    cursor: pointer;
}

.tooltip_wrap_language li div {
    inline-size: 150px;
    overflow-wrap: break-word;
}

.tooltip_wrap_language li:last-child {
    border-bottom: 0;
}

/* Active language checkmark indicator */
.signal {
    width: 16px;
    height: 16px;
    background-position: -73px -46px;
    position: absolute;
    right: 10px;
    top: 50%;
    margin-top: -8px;
}

.tooltip_wrap_language li.active .signal {
    background-position: -73px -77px;
}
```

### 10.4 Translation Execution

Source: `common.js` lines 3048-3085

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

### 10.5 Tooltip Header

```css
.tooltip_wrap {
    box-shadow: 0 1px 2px 0px rgba(0, 0, 0, 0.2);
}

.tooltip_wrap_inner {
    background: #EEEEEE;
    padding: 2%;
    text-align: left;
    border-radius: 9px 9px 0 0;
}
```

---

## 11. Screen Mask

### 11.1 Implementation

Entirely delegated to SpeechStream API (common.js lines 724-726):

```javascript
$('#btnScreenMask').on('click', function() {
    ssAPI.studyTools.toggleScreenMask();
});
```

### 11.2 Button HTML

```html
<div class="screenmask active">
    <button id="btnScreenMask" aria-label="Screen mask" title="Screen mask">
        <img src="./media/screen-mask.png" style="min-width:16px;margin-top:3px;margin-left:-2px;">
    </button>
</div>
```

### 11.3 Button CSS

```css
#btnScreenMask img {
    border-top: 3px solid black;
    border-bottom: 3px solid black;
}

#btnScreenMask {
    cursor: pointer;
    font-size: 15px;
    border: none;
    border-radius: 50%;
    background-color: white !important;
    height: 36px;
    width: 36px;
}
```

---

## 12. Notes Modal

### 12.1 HTML

```html
<div id="overlay" class="overley"></div>
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

### 12.2 Overlay CSS

```css
.overley {
    display: none;
    background-color: #000000;
    border: medium none;
    cursor: default;
    height: 100%;
    left: 0;
    margin: 0;
    opacity: 0.6;
    padding: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 99999;
}
```

### 12.3 Modal CSS

```css
.modal {
    display: none;
    height: 400px;
    left: 50%;
    margin-left: -300px;
    margin-top: -200px;
    position: absolute;
    top: 50%;
    width: 600px;
    z-index: 999999;
}

.actiavtion_wrapper {
    background-color: #FFFFFF;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    background-clip: padding-box;
    border: rgba(0, 0, 0, 0.3) 4px solid;
}

.acces_top_nav {
    background: url("../media/activate_top_bg.png") repeat-x scroll 0 0;
    border-radius: 8px;
    color: #666;
    padding: 20px 15px;
    font-size: 24px;
    text-align: left;
}

.inside_access {
    padding: 5px 15px 0;
}

.inside_access p {
    font-size: 16px;
    margin-bottom: 10px;
}

.btm_navs {
    background: #EEEEEE;
    border-top: 1px solid #DDDDDD;
    margin-top: 15px;
    padding: 10px 15px;
}

.textarea_content textarea {
    background: none;
    width: 100%;
    border: 0;
    resize: none;
    height: 200px;
    font-size: 14px;
    overflow-y: scroll;
}
```

### 12.4 Note Saving

Source: `common.js` lines 2486-2581

`saveNewNotes()` constructs a JSON reference `{chapNo, sentNo}` linking the note to the current sentence, then calls `SaveNote()` via `$.nativeCall()`.

---

## 13. Accessibility Info Panel

### 13.1 Info Panel CSS

```css
#InfoContent {
    border-radius: 9px;
    width: 700px;
    height: 500px;
    overflow: auto;
    background: #fff;
    padding: 15px;
    box-shadow: 0 0 15px #000;
}

.InfoContentArea {
    margin-left: 10px;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 18px;
    height: 500px;
    overflow: auto;
}

.instructionList {
    padding-top: 10px;
    padding-bottom: 20px;
}
```

### 13.2 Keyboard Navigation Commands

Displayed when clicking the `infoBtn` (i) button:

| Key | Action | Source |
|-----|--------|--------|
| TAB | Switch between paragraphs (`.s` elements) | common.js lines 3299-3303 |
| W | From a selected paragraph, move focus to its first word (`.w` element) | lines 3204-3211 |
| Left/Right Arrow | Navigate between words within a paragraph | lines 3222-3296 |
| P | From a word, select the parent paragraph | lines 3213-3220 |
| SPACE | Highlight the focused paragraph/word and open TextHelp popup | lines 3145-3193 |
| A | Open the annotation pen (triggers `#btnTextHighlight` click) | lines 3320-3328 |
| ESC | Dismiss highlights and close all popups | lines 3196-3201 |

### 13.3 Implementation Details

Source: `common.js` lines 3129-3646

**SPACE (keyCode 32):**
- If target is `.s`: highlights it, shows partial TextHelp (Speak, Notes, Copy, Translate)
- If target is `.w`: highlights it, shows full TextHelp (all buttons)

**ESC (keyCode 27):**
- Removes `.highlight` class from all elements
- Returns focus to `_lastFocusedElem`
- Hides TextHelp popup and SpeechStream popups

**W (keyCode 87):**
- If focused on `.s`, moves focus to its first `.w` child

**P (keyCode 80):**
- If focused on `.w`, moves focus to its parent `.s`

**Right Arrow (keyCode 39):**
- Navigates to next `.w` sibling
- Handles inline formatting elements (`<b>`, `<span>`, `<em>`, `<strong>`) by drilling into them
- Skips `<br>` elements

**Left Arrow (keyCode 37):**
- Navigates to previous `.w` sibling
- Same inline element handling

**TAB (keyCode 9):**
- Prevented when focused on a `.w` element (forces arrows for word nav)

**A (keyCode 65) -- document level:**
- If text is selected (`#rangeText` exists), triggers `#btnTextHighlight` click
- Does nothing if notes modal is visible

### 13.4 Document-Level ESC

Also handles ESC at the document level (common.js lines 3307-3317):
- Hides `#menuLanguage`, `#menuFontResize`, `.thss-dialog-toolbarPopup`, `#InfoContent`
- Resets `aria-expanded` on toolbar buttons

### 13.5 Focus Management

- Toolbar buttons auto-close unrelated dropdowns (lines 3607-3640)
- Font resize dropdown closes when focus moves to language or info buttons
- Language dropdown closes when focus moves to font resize or left page

### 13.6 ARIA Attributes

- Prev/next buttons: `aria-disabled="true"` when disabled
- Slider handle: `aria-valuetext="Page Number X-Y"`, `aria-valuenow="X-Y"`
- TextHelp popup: `role="region"`, `aria-label="textHelp popup"`
- Screen reader announcements: `#dynamicTextForSR` with `aria-live="assertive"`

---

## 14. Page Rendering Pipeline

### 14.1 Content Data Format

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
        // ... or nested with sub-pages:
        "chapter_name": {
            Pages: [
                { sentences: [...] },
                { sentences: [...] }
            ]
        }
    }
};
```

### 14.2 Page Calculation Pipeline

**Step 1: `setOrientation()`** (common.js lines 1305-1323)

```javascript
// Calculate available content height
viewAreaHeight = windowHeight - 52 (header) - 48 (footer) - 46 (padding);
```

**Step 2: `calculatePageOrder()`** (common.js lines 1326-1342)

- Reads `content.Toc`, creates sorted `book.orderList` array
- Each entry has: `name`, `order`, `title`, `visibility`, `sentences[]`

**Step 3: `setPageInfo()`** (common.js lines 1344-1476)

- Creates a hidden `#dummyText` div to measure content
- For each sentence in each chapter:
  - Appends `sentence_text` HTML to `#dummyText`
  - Checks if `scrollHeight > containerHeight`
  - If overflow, increments landscape page number
  - Assigns `landScapePageNo` to each sentence
- Images are resized via `resizeImage()` to fit container
- Result: every sentence gets a `landScapePageNo` property

### 14.3 Page Display

Source: `common.js` lines 1922-2212

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

### 14.4 Image Resizing

Source: `common.js` lines 2244-2272

`resizeImage()` proportionally scales images to fit within the container dimensions while maintaining aspect ratio. Default image CSS:

```css
img { max-width: 100%; height: auto; }
```

### 14.5 Word Count / Reading Progress

- Default: 150 words per page (common.js line 54)
- Timer: 30 seconds per page for standard, 10 seconds for ilit20 (common.js line 54)
- `setLibraryProgress()` (common.js lines 2782-2897) saves: bookType, mode, chapNo, sentNo, font-size, WordCountObj, totalWordsRead, timeSpent
- Book completion: 50% of words read (standard) or 70% (ilit20, line 392)

---

## 15. Colors Reference

### 15.1 Background & Frame

| Element | Value | CSS Source |
|---------|-------|------------|
| Body background | `url(../image/background.jpg) no-repeat; background-size: cover` | style.css line 36 |
| Body text color | `#4e4e4e` | style.css line 33 |
| Header bar bg | `#292c30` | style.css line 146 |
| Header border | `1px solid #353637` | style.css line 146 |
| Outer frame bg | `url(../media/background_bg.png) repeat` (wood texture) | style.css line 261 |
| Frame border | `2px solid #24789d` (cyan) | style.css line 261 |
| Frame shadow | `0 0 5px 0 #536269` | style.css line 261 |
| Inner panel bg | `#fff` | style.css line 266 |
| Inner panel shadow | `0 0 6px rgba(0,0,0,0.5)` | style.css line 266 |

### 15.2 Typography

| Element | Value | CSS Source |
|---------|-------|------------|
| Body font | `"Times New Roman", Times, serif` | style.css line 30 |
| Body font size | `16px` | style.css line 31 |
| Body line-height | `22px` | style.css line 32 |
| UI font | `Helvetica, Arial, sans-serif` | style.css line 133 |
| Header font size | `18px` | style.css line 149 |
| Header line-height | `30px` | style.css line 149 |
| Header text color | `#fff` | style.css line 149 |

### 15.3 Highlights

| Class | Color | CSS Source |
|-------|-------|------------|
| `.highlight` (selection) | `yellow !important` | style.css line 555 |
| `.cyan` | `cyan !important; color: #000` | style.css line 366 |
| `.magenta` | `magenta !important; color: #000` | style.css line 367 |
| `.green` | `rgb(69, 235, 83) !important; color: #000` | style.css line 368 |
| `.strike` | `text-decoration: line-through` | style.css line 370 |

### 15.4 Buttons & Controls

| Element | Value | CSS Source |
|---------|-------|------------|
| `button9` bg | `#26282b` | style.css line 156 |
| `button9` text | `#FFFFFF` | style.css line 158 |
| `button9` border | `1px solid #fff`, radius `5px` | style.css line 161 |
| `button9.active` bg | `#fff` | style.css line 167 |
| `button9.active` text | `#252629` | style.css line 167 |
| Round icon buttons bg | `white !important` | style.css line 392 |
| Round icon buttons size | `36px x 36px`, radius `50%` | style.css line 393-394 |
| TextHelp popup bg | `#000` | style.css line 561 |
| TextHelp popup text | `#FFF`, font-size `14px` | style.css line 561 |
| TextHelp separators | `1px dotted #FFF` | style.css line 562 |
| `button7` (modal btn) bg | `#3444ad` | style.css line 172 |
| `button7` shadow | `0 1px 0px 0 #1a2b96` | style.css line 183 |
| `button7` hover | `#3d57b4` | style.css line 185 |
| TOC tabs border | `1px solid #38454e` | style.css line 278 |
| TOC tabs active bg | `#38454e` | style.css line 289 |
| Slider handle bg | `#fff`, shadow `0 0 3px #424242` | style.css line 301-305 |
| Slider track | `inset 1px 5px 8px 1px rgba(0,0,0,0.3)`, border `1px solid #19232a` | style.css line 299 |
| Page balloon | bg `#000`, text `#FFF` | common.js line 3366 |
| Prev/Next buttons | `2px solid #fff`, disabled `opacity: 0.5` | style.css lines 217-260 |

### 15.5 Overlays & Modals

| Element | Value | CSS Source |
|---------|-------|------------|
| Overlay bg | `#000`, opacity `0.6` | style.css line 583 |
| Modal border | `rgba(0,0,0,0.3) 4px solid` | style.css line 585 |
| Modal bg | `#fff`, border-radius `8px` | style.css line 585 |
| Modal header bg | `url("activate_top_bg.png")`, text `#666` | style.css line 586 |
| Modal footer bg | `#eee`, border-top `1px solid #ddd` | style.css line 589 |
| Loader bg | `#fff`, text `#1b588a` | style.css lines 549-551 |
| Loader overlay | opacity `0.9`, fixed, z-index `10000002` | style.css line 549 |
| Dialog title bg | `#eeeeee` | style.css line 608 |
| Dialog title border | `1px solid #ddd`, shadow `0 1px 3px rgba(0,0,0,0.2)` | style.css line 608 |
| Dialog buttons bg | `#3444ad` | style.css line 619-631 |

---

## 16. Key CSS Measurements

### 16.1 Content Layout

| Property | Value | Selector |
|----------|-------|----------|
| Content margin (desktop) | `20px 10%` | `.ebook_container_content` |
| Content margin (tablet) | `20px 55px` | `.ebook_container_content` at `max-width: 1024px` |
| Frame border-radius | `15px` | `.ebook_box_notes` |
| Frame padding | `10px` | `.ebook_box_notes` |
| Inner panel border-radius | `5px` | `.ebook_box_notes_grid4` |
| Content block padding | `2% 2%` | `.ebook_content_block` |
| Left page padding | `2% 6% 5% 1%` | `.left_ebook .ebook_text_content` |
| Right page padding | `2% 1% 2% 6%` | `.ebook_text_content` |
| Page max-height | `270px` | `.Book_Notes_content` |

### 16.2 Navigation

| Property | Value | Selector |
|----------|-------|----------|
| Prev/Next button size | `40px x 40px` | `.ebook_previous_button`, `.ebook_next_button` |
| Prev/Next border | `2px solid #fff`, `border-radius: 50%` | |
| Prev button position | `left: -48px; top: 50%; margin-top: -20px` | `.ebook_previous_button` |
| Next button position | `right: -48px; top: 50%; margin-top: -20px` | `.ebook_next_button` |
| Sprite bg-size | `500px 800px` | Both nav buttons |
| Prev sprite position | `-362px -698px` | `.ebook_previous_button` |
| Next sprite position | `-460px -698px` | `.ebook_next_button` |
| Slider padding | `1% 0 1% 0` | `.pages_slider_conts` |
| Slider handle size | `5em x 2.75em` | `.ui-slider .ui-slider-handle` |
| Slider handle border-radius | `40px` | `.ui-slider .ui-slider-handle` |
| Slider track border | `1px solid #19232a` | `.ui-slider.ui-widget-content` |

### 16.3 Toolbar

| Property | Value | Selector |
|----------|-------|----------|
| Header padding | `5px 15px 5px 10px` | `.header_innerin` |
| Back button size | `30px x 30px` | `.sld_lft` |
| TOC button size | `40px x 40px` | `.toc_icn` |
| Title width | `570px` | `.header_inner.ebook .middle` |
| Title margin-left | `15%` | `.header_inner.ebook .middle` |
| `button9` padding | `4px 20px` | `button.button9` |
| `button9` font-size | `15px` | `button.button9` |
| Icon button size | `36px x 36px` | `#btnTextHighlight`, `#btnScreenMask` |
| `button9` top margin | `6px` | `.header_inner.ebook .button9` |

### 16.4 Dropdowns

| Property | Value | Selector |
|----------|-------|----------|
| Tooltip border-radius | `9px` | `.tools_tooltip` |
| Tooltip border | `1px solid #666666` | `.tools_tooltip` |
| Tooltip shadow | `0 2px 5px 1px #999` | `.tools_tooltip` |
| Tooltip top | `50px` from button | `.tooltip_tools` |
| Language list height | `500px` (scrollable) | `.languagesList` |
| Language item padding | `4px 8px 4px 20px` | `.tooltip_wrap_language li` |
| Language item font-size | `16px` | `.tooltip_wrap_language li` |
| Language item border | `1px solid #ddd` | `.tooltip_wrap_language li` |
| Language name width | `150px` (with `overflow-wrap: break-word`) | `.tooltip_wrap_language li div` |
| Highlight tooltip width | `346px` | `.text-highlight .tools_tooltip` |
| Font tooltip width | `180px` | `.pagezoom .tools_tooltip` |
| General tooltip width | `250px` | `.tools_tooltip` |

### 16.5 TextHelp Popup

| Property | Value | Selector |
|----------|-------|----------|
| Button bg | `#000` | `div#textToHelpMenu div.textToHelpMenuButtons` |
| Button text | `#FFF`, `14px` | `div#textToHelpMenu div.textToHelpMenuButtons` |
| Button padding | `10px` | `div#textToHelpMenu div.textToHelpMenuButtons` |
| Separator height | `41px` | `div#textToHelpMenu div.sep` |
| Separator border | `1px dotted #FFF` | `div#textToHelpMenu div.sep` |
| Arrow size | `5px` borders | `div#textToHelpMenu div.arrow-down` |
| Position above word | `45px` gap | `setPosTextHelp()` in util.js |

### 16.6 Modal

| Property | Value | Selector |
|----------|-------|----------|
| Modal width | `600px` | `.modal` |
| Modal height | `400px` | `.modal` |
| Modal position | `top: 50%; left: 50%; margin: -200px 0 0 -300px` | `.modal` |
| Wrapper border-radius | `8px` | `.actiavtion_wrapper` |
| Wrapper border | `rgba(0,0,0,0.3) 4px solid` | `.actiavtion_wrapper` |
| Header padding | `20px 15px` | `.acces_top_nav` |
| Header font-size | `24px` | `.acces_top_nav` |
| Footer bg | `#eee` | `.btm_navs` |
| Footer padding | `10px 15px` | `.btm_navs` |
| Textarea height | `200px` | `.textarea_content textarea` |

### 16.7 Info Panel

| Property | Value | Selector |
|----------|-------|----------|
| Width | `700px` | `#InfoContent` |
| Height | `500px` | `#InfoContent` |
| Padding | `15px` | `#InfoContent` |
| Shadow | `0 0 15px #000` | `#InfoContent` |
| Font | Helvetica, Arial, sans-serif at `18px` | `.InfoContentArea` |

---

## 17. Dev CSS Overrides

Source: `ebookplayer_dev.css` (111 lines)

Key overrides applied in the dev/production environment:

```css
/* Overlay for loading states */
.overlay-wrapper {
    height: 100%; width: 100%;
    position: absolute; left: 0; top: 0;
    background: rgba(0,0,0,0.3);
}

.loader_wrapper {
    height: 80px; width: 100px;
    position: absolute; left: 50%; top: 50%;
    margin-left: -50px; margin-top: -40px;
    text-align: center;
}

/* Scrollable areas with momentum scrolling */
.contentBoxRight { -webkit-overflow-scrolling: touch; }
.toc_tooltip .toc_tooltip_middle { -webkit-overflow-scrolling: touch; }

/* Content styling */
.contentMainInner {
    position: relative;
    opacity: 0;
    font-size: 17px !important;
    line-height: 30px !important;
}

/* EPub viewer wrapper */
#epubViewerWrapper {
    border: 6px solid rgba(0, 0, 0, 0.8);
    font-size: 17px !important;
    line-height: 30px !important;
    position: relative;
}

/* TOC active items */
.toc_tooltip li.active span { color: #fff; background: #007AFF; }
.toc_tooltip li.active ul li span { color: #000; background: none; }

/* Book title in nav */
.navBookTitle {
    color: #FFFFFF;
    font-weight: normal;
    overflow: hidden;
    padding-top: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
}
```

---

## 18. Media Assets

### 18.1 Background Images

| File | Used By | Purpose |
|------|---------|---------|
| `background.jpg` | `body` | Full-bleed dark background image |
| `background_bg.png` | `.ebook_box_notes` | Repeating wood-grain texture for frame |
| `activate_top_bg.png` | `.acces_top_nav` | Modal header gradient texture |
| `book_rol.png` | `.Book_Notes_rule_bg` | Ruled-line paper texture (optional) |

### 18.2 Button/Icon Images

| File | Used By | Purpose |
|------|---------|---------|
| `marker-pen.png` | `#btnTextHighlight` | Annotation pen icon |
| `screen-mask.png` | `#btnScreenMask` | Screen mask icon |
| `accessibility.png` | `#infoBtn` | Accessibility info icon |
| `clear.png` | `.highlights.clear` | Clear highlight icon |
| `list.png` | `.highlights.collect` | Collect highlights icon |
| `note.png` | `.notesIcon` | Notes icon (18x24px) |
| `loader.gif` | `#loaderWrap` | Loading spinner |

### 18.3 Sprite Sheets

| File | Class | Size | Purpose |
|------|-------|------|---------|
| `sprite.png` | `.sprite` | natural | Standard UI icons |
| `sprite_ratina.png` | `.sprite` (retina) | 500x800px scaled | Retina UI icons, nav arrows |
| `sprite2.png` / `sprite2_ratina.png` | `.sprite2` | 700x400px scaled | Secondary icons |

### 18.4 Retina Detection

```css
@media only screen and (-webkit-min-device-pixel-ratio: 2) {
    .sprite { background-image: url(../media/sprite_ratina.png); background-size: 500px 800px; }
    .sprite2 { background-image: url(../media/sprite2_ratina.png); background-size: 700px 400px; }
}
```

---

## 19. Implementation Notes for Modern Stack

### What to Keep

1. **Two-page spread layout** -- The left/right page layout with textured wood-grain frame is the defining visual. Use a CSS grid or flexbox with a repeating background pattern.
2. **Word-level interactivity** -- Each word wrapped in a tappable element. Map `<z class="w">` to `<span class="w" tabindex="0">` in React.
3. **TextHelp popup** -- Black floating toolbar above tapped word with contextual buttons. Replace SpeechStream calls with Web Speech API and a custom dictionary UI.
4. **Annotation colors** -- Cyan, magenta, green highlights plus strikethrough. Store in local state.
5. **Page slider with balloon** -- Custom slider showing current page range.
6. **Font resize with auto-reduction** -- Three user-selectable sizes plus automatic reduction when content overflows.
7. **Keyboard navigation** -- TAB between sentences, W to enter word mode, arrows between words, SPACE to select, P to go back to sentence, A for annotations, ESC to dismiss.

### What to Modernize

1. **No jQuery/jQuery UI** -- Use React state + Framer Motion for transitions, a custom slider component.
2. **No Hammer.js** -- Use pointer events or `@use-gesture/react` for swipe/tap handling.
3. **No SpeechStream** -- Implement TTS with Web Speech API, build custom dictionary/translation UIs, implement screen mask as a simple CSS overlay with a draggable viewport cutout.
4. **No sprite sheets** -- Use SVG icons or an icon library (Lucide, Heroicons).
5. **No native bridge** -- Replace `$.nativeCall` with local state or API calls.
6. **Responsive design** -- The original targets 1024px iPads. Make the two-page spread collapse to single-page on narrow viewports.
7. **Content format** -- Convert the `{bookid}.js` global variable pattern to JSON imports or a data loading pattern compatible with Next.js.
8. **Page calculation** -- The `setPageInfo()` measurement approach (hidden div, measure scrollHeight) works in React but needs to run after render. Use `useLayoutEffect` or a ref-based measurement approach.
9. **Background textures** -- `background.jpg` and `background_bg.png` are image-based. Either source similar textures or create CSS-only equivalents (e.g., CSS gradients for the wood grain effect).
