# Assignments Feature: Complete UX Specification

Extracted from the Savvas I-LIT ClassView codebase. All line numbers reference the original source files.

**Source files:**
- `assignment.html` — HTML templates (~2000+ lines)
- `assignments.js` — View logic (~36K lines)
- `assignments.css` — Primary styles (~1960 lines)
- `assignments_dev.css` — Override/dev styles (~1400 lines)
- `constants.js` — Category and slide type constants

---

## 1. Category List View (TOC)

The main assignments page displays a modal overlay with a list of 7-9 assignment categories, each with a count badge.

### Layout and Positioning
The TOC is a fixed-position modal centered on screen:

```
.assignments_wrapper          (assignments.css:817)
  position: fixed
  top: 42%
  left: 50%
  transform: translateX(-50%) translateY(-50%)
  width: 50%
  max-width: 615px
  min-width: 615px
  z-index: 2000
  margin: 50px 0
```

Inner container:
```
.assignments_container        (assignments.css:818)
  background: #fff
  border-radius: 8px
  box-shadow: inset borders #ccd3dd
```

Dark overlay wrapper:
```
(inner wrapper)               (assignments.css:823)
  background: rgba(0, 0, 0, 0.4)
  border-radius: 8px
```

### Title
```
.assignment_title             (assignments.css:822)
  padding: 25px 5px
  color: #fff
  font-size: 30px
  text-align: center
```

Title text is "Assignments" (hardcoded in template `assignTOCTemplate`, assignment.html:519-528).

### Category List Items
Each category is rendered as an `<li class="actionshowview sectionLi">` (assignments.js:749):

```html
<li class="actionshowview sectionLi">
  <div class="actionshowview_inner">
    <span class="offline_flag left sprite" style="display:none"></span>
    <span class="sync_flag left sprite" style="display:none"></span>
    <span class="ar_rt left sprite"></span>
    <span class="assignment-count left COLOR-PLACEHOLDER">ASSIGNMENT-COUNT-PLACEHOLDER</span>
    <span class="middle">CATEGORY_DISPLAY_NAME</span>
    <ul class="sub_menu_parent">
      <!-- individual assignment items injected here -->
    </ul>
  </div>
</li>
```

List item styling:
```
.assignments_container li                 (assignments.css:1537)
  padding: 0
  border-bottom: 1px solid #c9c8cd

.assignments_container .actionshowview_inner  (assignments.css:1529)
  padding: 10px 15px
```

Category display names and their internal keys (constants.js:2719-2783):

| Display Name | Key | Alias |
|---|---|---|
| Interactive Reading | iwt | interactive_reading |
| Study Plan | studyplan | study_plan |
| Vocabulary, Word Study, and Reading Comprehension | (none) | vocabulary |
| iPractice | dailyassignment | ipractice |
| Writing | (none) | writing |
| Monitor Progress | (none) | monitor_progress |
| Information | nsa | information |
| Current Reading | cr | current_reading |
| Current RATA | crata | current_rata |

### Category Count Badge
The badge shows the number of pending assignments in each category.

Badge CSS (assignments.css:1834-1856):
```
.assignment-count
  width: 22px
  height: 22px
  border-radius: 50%          (circle)
  display: block
  text-align: center
  line-height: 22px
  margin-right: 0px

.assignment-count.red
  color: red
  border: 2px solid red
  font-weight: normal

.assignment-count.green
  color: green
  border: 2px solid green
  font-weight: normal
```

Badge logic (assignments.js:1104-1111):
- Count = number of `<li>` children in the category's `.sub_menu_parent`
- If count is 0: badge gets class `green`, parent `<li>` gets `disable-action`
- If count > 0: badge gets class `red`
- The count number is displayed inside the badge circle

### Rendering Flow
`AssignmentsTOCView.render()` (assignments.js:694-1161):
1. Iterates all assignment categories from `ASSIGNMENT_CATEGORY` constant array
2. For each category, builds placeholder HTML with `ASSIGNMENT-COUNT-PLACEHOLDER` and `COLOR-PLACEHOLDER`
3. Iterates all assignments from the server response, sorts by date (most recent first)
4. Pushes each assignment's HTML into the correct category bucket
5. After all assignments are placed, replaces placeholders with actual counts and colors
6. Injects final HTML into `assignTOCTemplate` via Underscore.js `_.template()`

---

## 2. Category Expansion (Accordion)

Categories use a single-open accordion pattern — clicking one category closes all others.

### Click Handler (assignments.js:2155-2187)

```javascript
// Simplified from source
$('.sectionLi').on('click', function() {
    if ($(this).hasClass('active')) {
        // Close this category
        $(this).removeClass('active');
        $(this).find('ul.sub_menu_parent').slideUp('fast');
    } else {
        // Close all other categories first
        $('.sectionLi').removeClass('active');
        $('ul.sub_menu_parent').slideUp('fast');

        // Open this category
        $(this).addClass('active');
        $(this).find('ul.sub_menu_parent').slideDown('fast');
    }
});
```

### Animation
- **Expand**: jQuery `.slideDown('fast')` (~200ms)
- **Collapse**: jQuery `.slideUp('fast')` (~200ms)
- Default state: `ul.sub_menu_parent { display: none }` (assignments.css:1539)

### Active State Styling
```
.assignments_container .active .actionshowview_inner
  padding: 10px 15px
  border-bottom: 1px solid #c9c8cd

.assignments_container .active
  background: none
  padding: 0
```

Arrow indicator rotates on active:
```
.assignments_container .active .actionshowview_inner .ar_rt
  background-position: -472px -206px      (rotated arrow sprite)

.assignments_container .sub_menu li .ar_rt
  background-position: -124px -7px        (default arrow sprite)
```

### Individual Assignment Items
Each assignment within a category is rendered as (assignments.js:847-876):

```html
<li data-value="type___id___subtype">
  <div class="actionshowview_inner sub1">
    <span class="ar_rt left sprite"></span>
    <span class="middle">
      <span class="left assignment_date">MM/DD/YYYY</span>
      <span class="left comment_icon sprite" style="display:none"></span>
      <span>Assignment Name</span>
    </span>
  </div>
</li>
```

Sub-item styling:
```
.assignments_container .actionshowview_inner.sub1   (assignments.css:1545)
  color: #111
  padding-left: 25px
  border-bottom: 0

.sub_menu_parent li                                  (assignments.css:1540)
  font-weight: normal
```

### Assignment Item Click (assignments.js:2202-2370)
When a student clicks an assignment:
1. Extracts `data-value` attribute, splits by `___` to get `[type, id, subtype]`
2. Calls `GetAssignmentSlidesInfo` API service
3. On success, builds the slide container and initializes the Swiper engine

---

## 3. Assignment Card / Slide Container

When an assignment is opened, the TOC is replaced by a full-screen slide view.

### Slide Container Structure (assignments.js:3937-3954)
```html
<div class="swiper-container" style="height:100%; overflow:hidden;">
  <div id="slide_inner_container" class="swiper-wrapper slider_pager_sl">
    <!-- Individual slides injected here as .swiper-slide elements -->
  </div>
</div>
```

### Slider Wrapper
```
.assignment_slider_wrapper              (assignments.css:1609-1620)
  background: linear-gradient(to bottom, #6cbaf8 0%, #3a8ae1 100%)
```

This blue gradient is the background visible behind slides.

### Two-Panel Slide Layout
Most IWT (Interactive Writing Tool) slides use a two-panel layout:

Left panel:
```
.continent_box_space                    (assignments.css:283-288)
  height: 400px                         (base; overridden to 515px in _dev.css:199)
  width: 550px                          (base; overridden to 500px when bg image, _dev.css:537)
  background: #fff
  border-radius: 12px
  border: rgba(0,0,0,0.3) 6px solid     (assignments.css:290)
```

Right panel:
```
.continent_edit_box                     (assignments.css:328-336)
  float: left
  width: 400px                          (base; overridden to 350px when bg image, _dev.css:539)
  border: rgba(0,0,0,0.3) 6px solid
  background: #f7f9f9
  border-radius: 0 12px 12px 0
  height: 462px                         (assignments_dev.css:202)
```

### Slider Positioning
```
.slider_swiper_inner                    (assignments_dev.css:204-211)
  width: 100%
  margin-top: 70px
  margin-left: -475px
  left: 50%

.slider_swiper_inner.parallexIwt        (assignments_dev.css:213-227)
  left: 100%
  margin-left: 0
  .container_space { width: 1000px; margin: 0 auto }
```

### Responsive Resize (assignments.js:162-309)
The resize handler dynamically adjusts panel heights:
```
actual_height = window_height - header_height
left_box_height = actual_height - 60px (margin)
right_box_height = left_box_height - 50px
margin_top = (actual_height - left_box_height) / 2
right_margin_top = (left_box_height - right_box_height) / 2 - 6 (border)
```

---

## 4. IWT Slide Navigation

Navigation between slides uses the Idangerous Swiper library (v2.1).

### Swiper Initialization (assignments.js:4620-4926)
```javascript
AssigmentSlides.slidingEngine = $('.swiper-container').swiper({
    height: '100%',
    scrollbar: {
        container: '.swiper-scrollbar',
        draggable: true,
        hide: true
    },
    pagination: (type == 'FRS') ? '.frs-main-pagination' : '',
    paginationClickable: (type == 'FRS') ? true : false,
    onFirstInit: function(swiper) { /* setup */ },
    onInit: function(swiper) { /* per-slide init */ },
    onSlideChangeEnd: function(swiper) { /* slide change handler */ }
});
```

### Prev/Next Navigation
Header buttons `#assignmentPrev` and `#assignmentNext` (cached in assignments.js:137-155) control navigation:

```javascript
// Prev button handler (assignments.js:9303)
AssigmentSlides.slidingEngine.swipePrev();

// Next button handler (assignments.js:9353)
AssigmentSlides.slidingEngine.swipeNext();
```

These are called with a 200ms `setTimeout` delay (assignments.js:9302, 9352) to allow UI updates to complete first.

### Swiping Prevention
For certain slide types (FRS, Phonic), swiping is disabled:
```javascript
AssigmentSlides.slidingEngine.params.noSwiping = true;
AssigmentSlides.slidingEngine.params.noSwipingClass = 'swiper-no-swiping';
```
(assignments.js:4724-4725)

### Slide Change Handler (assignments.js:4926)
`onSlideChangeEnd` fires after each transition and:
1. Stops any playing intro video
2. Logs user activity
3. Handles incremental save for FRS slides
4. Updates active tab indicators for assessments
5. Manages audio player states (pause all, reset)
6. Updates accessibility attributes (`aria-selected`, `tabindex`)

### Pagination Dots
```
.pagination_for_slider              (assignments.css:1709-1716)
  bottom: 2px
  left: 0
  position: absolute
  text-align: center
  width: 100%
  z-index: 1

.slider_switch                      (assignments.css:1725-1734)
  background: #666
  border: 1px solid #000
  border-radius: 10px
  cursor: pointer
  display: inline-block
  height: 9px
  width: 9px
  margin: 0 3px

.slider_switch.active               (assignments.css:1718-1724)
  background: #000
  border: 1px solid #999
  box-shadow: 0 3px 2px 0 rgba(0,0,0,0.3)
  height: 9px
  width: 9px
```

### Bullet-style Pagination (alternative)
```
.slider_bullet                      (assignments.css:207-210)
  text-align: center
  width: 100%
  margin: 15px 0 0
  padding: 0

.slider_bullet li a
  background: #fff
  border: 2px solid #E7E7E7
  border-radius: 20px
  cursor: pointer
  height: 6px
  width: 6px

.slider_bullet li a.active
  background: rgba(0,0,0,0.9)
```

---

## 5. Highlight Slide UI

Template: `iwthighlightslide` (assignment.html:1272-1366)

### Structure
```html
<div class="swiper-slide main_swiper_slide" data-slide-type="iwthighlightslide">
  <!-- Left Panel: Reading content -->
  <div class="continent_box_space left">
    <div class="new_assignment_view">
      <div class="new_assignment_irr scroll_content1">
        <div class="rangySelection">
          <%=data.interactive_text%>    <!-- Highlightable passage text -->
        </div>
      </div>
    </div>
  </div>

  <!-- Right Panel: Instructions + Highlight tools -->
  <div class="continent_edit_box left">
    <div class="heading_content"><%=data.question%></div>
    <div class="highlight_note">
      <!-- Highlight color buttons -->
      <span class="highlightYellow highlight_action"></span>
      <span class="highlightRed highlight_action"></span>
      <span class="eraser highlight_action"></span>
    </div>
    <div class="pass_text scroll_content2">
      <%=data.pass_text%>
    </div>
    <div class="pagination_footer">
      <button class="button save_continue">Save & Continue</button>
    </div>
  </div>
</div>
```

### Highlight Colors
```
.highlightYellow            (assignments_dev.css:123)
  background-color: #f4df76

.highlightRed               (assignments_dev.css:128)
  background-color: #f47676

.highlight_Y                (assignments.css:364)
  background: #ffff33       (applied to text spans after highlighting)

.highlight_R                (assignments.css:365)
  background: #f5a9a9       (applied to text spans after highlighting)
```

The highlight buttons are colored spans that act as tool selectors. Students click a color, then select text in the left panel. The `rangySelection` div enables text selection via the Rangy.js library.

### Text Selection
The `.rangySelection` div has user-select explicitly enabled:
```
.no_select_please .rangySelection       (assignments.css:135-142)
  -webkit-user-select: text !important
  user-select: text !important
```

---

## 6. Drag-and-Drop Slide UI

Template: `iwtdndslide` (assignment.html:1468-1547)

### Structure
```html
<div class="swiper-slide main_swiper_slide" data-slide-type="iwtdndslide">
  <!-- Left Panel: Draggable tiles -->
  <div class="continent_box_space left">
    <div class="new_assignment_view">
      <div class="draggable_area">
        <%=data.interactive_text%>     <!-- Contains draggable tile elements -->
      </div>
    </div>
  </div>

  <!-- Right Panel: Drop zone -->
  <div class="continent_edit_box left">
    <div class="heading_content"><%=data.dropbox_instrction%></div>
    <div class="dropbox">
      <!-- Drop targets rendered here -->
    </div>
    <div class="pagination_footer">
      <button class="button submit_btn">Submit</button>
    </div>
  </div>
</div>
```

### Drop Zone Styling
```
.dropbox                            (assignments_dev.css:53)
  border: 1px solid #808080
  font-size: 16px
  height: 30px
  line-height: 28px
  margin-bottom: 10px
  padding: 5px
  text-align: center
```

### Draggable Tile Styling
```
(UI dragging state)                 (assignments_dev.css:695-701)
  border-radius: 3px
  padding: 5px 3px
  background: #35484C
  color: #FFFFFF
  font-size: 18px
```

### Drag Content Area
```
.drag_content_area                  (assignments.css:1681)
  padding: 10px
  text-align: center

.drag_drop_content                  (assignments.css:1682-1684)
  height: 80px
  width: 80px
  display: inline-block
  border: 1px solid #ddd
  border-radius: 5px
  box-shadow: inset 0 0 5px 0 #707070

.drag_drop_content.right_drag       (assignments.css:1685)
  box-shadow: inset 0 0 5px 0 #1F8713
  border: 1px solid #1F8713         (green = correct)

.drag_drop_content.wrong_drag       (assignments.css:1686)
  box-shadow: inset 0 0 5px 0 #CC1426
  border: 1px solid #CC1426         (red = incorrect)
```

### Drag Area Text
```
.draggable_area span, p, div        (assignments_dev.css:244-255)
  font-size: 20px
```

Uses jQuery UI Draggable/Droppable with touch-punch for tablet support.

---

## 7. Text Answer Slide UI

Template: `iwttextanswerslide` (assignment.html:1370-1451)

### Structure
```html
<div class="swiper-slide main_swiper_slide" data-slide-type="iwttextanswerslide">
  <!-- Left Panel: Reading content or question -->
  <div class="continent_box_space left">
    <div class="new_assignment_view">
      <!-- One of three variants based on data: -->
      <!-- Variant A: static_text (read-only passage) -->
      <!-- Variant B: interactive_text (interactive passage) -->
      <!-- Variant C: question + textarea (short answer) -->
      <div class="text_box_area">
        <textarea></textarea>
      </div>
    </div>
  </div>

  <!-- Right Panel: Pass text / instructions -->
  <div class="continent_edit_box left">
    <div class="pass_text scroll_content2">
      <%=data.pass_text%>
    </div>
  </div>
</div>
```

### Text Box
```
.text_box_area                      (assignments_dev.css:237)
  height: 320px
  background: #fff

.text_box_area textarea             (assignments.css:1522)
  min-height: 126px
  font-size: 17px
```

---

## 8. Summary Slide UI

Template: `iwtsummaryslide` (assignment.html:605-707)

### Structure
```html
<div class="swiper-slide main_swiper_slide" data-slide-type="iwtsummaryslide">
  <!-- Left Panel: Textarea + Get Feedback -->
  <div class="continent_box_space left">
    <div class="new_assignment_view">
      <div class="natural_box_space">
        <textarea id="txtSummary" class="text_box_area"></textarea>
      </div>
      <div class="pagination_footer">
        <button class="button get_feedback_btn">Get Feedback</button>
      </div>
    </div>
  </div>

  <!-- Right Panel: Instructions/Feedback tabs -->
  <div class="continent_edit_box left">
    <div id="essay_tabs">
      <ul>
        <li><a href="#instructions_tab">Instructions</a></li>
        <li><a href="#feedback_tab">Feedback</a></li>
      </ul>
      <div id="instructions_tab"><%=data.instructions%></div>
      <div id="feedback_tab">
        <img class="loader_img" src="media/loader.gif" style="display:none">
        <!-- Feedback content injected dynamically -->
      </div>
    </div>
  </div>
</div>
```

### Essay Tabs Styling
```
#essay_tabs                         (assignments.css:1516-1524)
  padding: 0
  border: 0

#essay_tabs .ui-tabs-nav
  padding: 0 !important
  position: relative
  z-index: 2

#essay_tabs .text_box_area
  border: 1px solid #D3D3D3
  border-radius: 0 4px 4px 4px
  margin-top: -1px
  height: 127px

#essay_tabs .text_box_area textarea
  min-height: 126px
  font-size: 17px
```

Uses jQuery UI Tabs for Instructions/Feedback switching.

### Summary Feedback Template (assignment.html:718-940)
The feedback view contains:

**Score Bar** — 13 color segments from red to green:
```
.box_over.color_1.active   { background: #ff0000 }    (assignments.css:1500)
.box_over.color_2.active   { background: #ff3300 }
.box_over.color_3.active   { background: #ff6600 }
.box_over.color_4.active   { background: #ff7517 }
.box_over.color_5.active   { background: #ff9214 }
.box_over.color_6.active   { background: #ffab17 }
.box_over.color_7.active   { background: #ffc31a }
.box_over.color_8.active   { background: #ffdc1c }
.box_over.color_9.active   { background: #e4f61f }
.box_over.color_10.active  { background: #c9f81f }
.box_over.color_11.active  { background: #affb1f }
.box_over.color_12.active  { background: #94fd1f }
.box_over.color_13.active  { background: #79ff1f }
```

**Section Scores** — sub-scores for:
- Redundancy
- Irrelevancy
- Copying
- Spelling

Each section has a drill-down container with detail items.

### Paragraph Slide Feedback (assignment.html:1046-1151)
For paragraph-type writing, feedback includes sub-scores for:
- Topic Focus
- Topic Development
- Organization
- Length
- Beginnings
- Structure
- Vague Adjectives
- Repeated Words
- Pronounce
- Spelling
- Grammar
- Repeated Ideas

---

## 9. Multiple Choice UI

### Standard Multiple Choice
Template: `multiplechoiceslide` (assignment.html:1550-1698)

```html
<div class="swiper-slide" data-slide-type="multiplechoiceslide">
  <div class="study_plain_container assignment_slider_wrapper">
    <div class="study_plain_title"><%=data.title%></div>
    <div class="new_assignment_irr">
      <!-- Question groups -->
      <div class="qurstion_group">
        <div class="question_part">
          <ul>
            <li data-value="A">
              <span class="answer_key left">A</span>
              <span class="correct sprite"></span>     <!-- green checkmark, hidden -->
              <span class="incorrect sprite"></span>   <!-- red X, hidden -->
              <span class="middle">Answer text</span>
            </li>
            <!-- B, C, D... -->
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Answer Key Styling
```
.answer_key                         (assignments.css:215)
  width: 30px
  height: 30px
  background: #e5e5e5
  line-height: 30px
  text-align: center
  border-radius: 3px
  margin-right: 5px
  font-size: 18px

(selected state)
.question_part li.active .answer_key    (assignments.css:1670-1673)
  background: #35484C
  color: #FFFFFF
```

### Radio Button (Sprite-based)
```
.radio                              (assignments.css:372-373)
  width: 31px
  height: 31px
  (sprite background)

.radio.active
  (different sprite position for filled radio)
```

### Correct/Incorrect Indicators
```
.correct                            (assignments.css:219)
  background-position: -301px -211px    (green checkmark sprite)

.incorrect
  background-position: (red X sprite position)
```

Both are hidden by default and shown after submission via JS.

### Selected Answer State
```
.study_plain_container .question_part li.active     (assignments.css:1554)
  background: #f0f0f0

.study_plain_container .question_part li.active .answer_key    (assignments.css:1555)
  background: #35484c
  color: #fff
```

### Multi-Choice with Passage
Template: `multichoicepassageslide` (assignment.html:1702-1844)

Split layout with passage on the left panel and questions on the right panel. Uses the same answer_key and question_part patterns but within the two-panel `continent_box_space` / `continent_edit_box` layout.

### Study Plan Title
```
.study_plain_title                  (assignments.css:1551)
  box-shadow: 0px 2px 4px -1px #9E9E9E
  background: #fff
  padding: 20px
  font-weight: bold
  font-size: 22px
```

### Question Detail
```
.question_det                       (assignments.css:1823)
  font-size: 15px
  line-height: 24px
  border-bottom: 1px solid #ddd
  padding: 6px 15px
  margin-bottom: 20px
```

---

## 10. Colors and Gradients

### Primary Backgrounds

**Slide wrapper gradient** (assignments.css:1609-1619):
```
background: linear-gradient(to bottom, #6cbaf8 0%, #3a8ae1 100%)
```

### Button Colors

**Blue (default)** — `button.button` (assignments.css:161-173):
```
background: linear-gradient(to bottom, #1c8ed5 0%, #79bde6 3%, #1c8ed5 5%, #1c8ed5 95%, #025e97 100%)
box-shadow: 0 1px 0 0 #025e97, inset 0 -2px 0 0 #025e97, inset 0 0 0 1px #025e97
color: #fff
font-size: 20px
min-width: 140px
padding: 5px 10px
border-radius: 5px
text-shadow: 1px 2px 0 #0a61bc (on .assignment buttons, :200)
```

**Green (active/complete)** — `button.button.active` (assignments.css:175-186):
```
background: linear-gradient(to bottom, #48c05d 0%, #42d059 3%, #10c42e 5%, #18c835 95%, #007b14 100%)
box-shadow: 0 1px 0 0 #007b14, inset 0 -2px 0 0 #007b14, inset 0 0 0 1px #007b14
```

**Gray (inactive/disabled)** — `button.button.inactive` (assignments.css:187-199):
```
background: linear-gradient(to bottom, #71797e 0%, #8d9498 3%, #71797e 5%, #727a7f 95%, #3c4246 100%)
box-shadow: 0 1px 0 0 #3c4246, inset 0 -2px 0 0 #3c4246, inset 0 0 0 1px #3c4246
```

**Dark button** — `button.button9` (assignments.css:1653-1665):
```
background: #26282b
color: #FFFFFF
font-size: 15px
padding: 4px 20px
border: 1px solid #fff
border-radius: 5px

button.button9.active
  background: #fff
  color: #252629
```

### Assessment Tab Colors
```
.part_btn                           (assignments.css:1627-1637)
  background: none
  border: 1px solid #fff
  border-bottom: 0
  border-radius: 4px 4px 0 0
  color: #fff
  font-size: 18px
  width: 100px
  padding: 10px

.part_btn.active
  background: #fff
  color: #3A8AE1
```

### Panel Colors
```
Left panel (.continent_box_space):    background: #fff
Right panel (.continent_edit_box):    background: #f7f9f9
Header bar:                          background: #2a2b2d (assignments.css:851)
Header border-bottom:                #353637
```

### Category Badge Colors
```
Pending (has assignments):           red border, red text
Complete (0 assignments):            green border, green text
```

### Feedback Score Bar Colors (red to green, 13 segments)
```
#ff0000, #ff3300, #ff6600, #ff7517, #ff9214,
#ffab17, #ffc31a, #ffdc1c, #e4f61f, #c9f81f,
#affb1f, #94fd1f, #79ff1f
```

### Highlight Colors
```
Yellow button: #f4df76          Applied to text: #ffff33
Red button:    #f47676          Applied to text: #f5a9a9
```

### Drag-and-Drop Feedback Colors
```
Correct drop:   border #1F8713, inset shadow #1F8713 (green)
Incorrect drop: border #CC1426, inset shadow #CC1426 (red)
Drag tile bg:   #35484C (dark teal)
```

### Answer Key Colors
```
Default:  background #e5e5e5, color (inherit black)
Selected: background #35484c, color #fff
```

---

## 11. Key Measurements

### TOC Modal
```
Width:            615px (min and max)
Position:         fixed, centered (top:42%, left:50%, transform translate)
Title padding:    25px 5px
Title font-size:  30px
List item padding: 10px 15px
List font-size:   17px (from assignments.css:826)
List border:      1px solid #dfdee1 (between items)
Badge:            22x22px circle
```

### Header Bar
```
Height:           52px (assignments.css:145)
Background:       #2a2b2d
Border-bottom:    1px solid #353637
Padding:          5px 10px
Color:            #fff
Font-size:        18px
Line-height:      30px
```

### Left Panel (continent_box_space)
```
Base:             550w x 400h px (assignments.css:283-288)
Dev override:     height 515px (assignments_dev.css:199)
With bg image:    500w px (assignments_dev.css:537)
Border:           6px solid rgba(0,0,0,0.3)
Border-radius:    12px
Background:       #fff
```

### Right Panel (continent_edit_box)
```
Base:             400w px (assignments.css:328-336)
Dev override:     height 462px (assignments_dev.css:202)
With bg image:    350w px (assignments_dev.css:539)
Border:           6px solid rgba(0,0,0,0.3)
Border-radius:    0 12px 12px 0
Background:       #f7f9f9
```

### Combined Panel Width
```
Standard:         550 + 400 = 950px (+ 12px border each side = ~974px)
With bg image:    500 + 350 = 850px (+ borders)
Container width:  1000px (assignments_dev.css:227)
```

### Slider Positioning
```
margin-top:       70px (assignments_dev.css:204)
margin-left:      -475px (center offset)
left:             50%
```

### Button Dimensions
```
button.button:      min-width 140px, padding 5px 10px, font-size 20px
button.assignment:  min-width 180px, font-size 20px
button.button6:     font-size 15px
button.button9:     padding 4px 20px, font-size 15px
```

### Text Sizes
```
Container h2:       30px
Container h3:       20px
Container p:        16px, line-height 25px
Content theme:      max-height 165px (scroll)
Question text:      font-size 18px (.middle in question items)
Drag area text:     font-size 20px
Study plain title:  font-size 22px
Textarea:           font-size 17px
```

### Pagination Dots
```
Dot size:           9x9px, border-radius 10px (circle)
Dot margin:         0 3px
Dot color:          #666 (inactive), #000 (active)
Active shadow:      0 3px 2px 0 rgba(0,0,0,0.3)
```

### Answer Key Block
```
Size:               30x30px
Border-radius:      3px
Background:         #e5e5e5 (default), #35484c (selected)
Font-size:          18px
Line-height:        30px
```

### Drop Zone
```
Height:             30px
Line-height:        28px
Border:             1px solid #808080
Margin-bottom:      10px
Padding:            5px
Font-size:          16px
```

---

## 12. Transitions and Animations

### Accordion
- **Expand/Collapse**: jQuery `.slideDown('fast')` / `.slideUp('fast')` — approximately 200ms ease
- Applied to: `ul.sub_menu_parent` elements

### Modal Entry (3D Slit Effect)
```css
/* assignments.css:1468-1492 */
.md-effect-13.md-modal {
  perspective: 1300px;
}

.md-effect-13 .md-content {
  transform-style: preserve-3d;
  transform: translateZ(-3000px) rotateY(90deg);
  opacity: 0;
}

.md-show.md-effect-13 .md-content {
  animation: slit 0.7s forwards ease-out;
}

@keyframes slit {                   /* assignments.css:1942-1945 */
  50% {
    transform: translateZ(-250px) rotateY(89deg);
    opacity: 1;
    animation-timing-function: ease-in;
  }
  100% {
    transform: translateZ(0) rotateY(0deg);
    opacity: 1;
  }
}
```

This creates a 3D "slit" opening effect where the modal appears to rotate in from the side through a narrow slit in 3D space, taking 0.7 seconds.

### Slide Transitions
Swiper handles slide transitions internally with its default horizontal sliding animation. The swiper is configured with `height: '100%'` and no custom transition duration override, so it uses the Idangerous Swiper 2.1 default transition speed.

Navigation buttons call `swipePrev()` / `swipeNext()` with a 200ms setTimeout wrapper:
```javascript
setTimeout(function(){
    AssigmentSlides.slidingEngine.swipePrev();  // or swipeNext()
}, 200);
```
(assignments.js:9302-9303, 9352-9353)

### Feedback Score Bar
The 13-segment color bar (`.box_over.color_N`) uses class toggling to fill segments from left to right. The `.active` class is added to segments up to the score level. There is no CSS animation on these — they appear instantly when feedback is loaded.

### Speaker Icon Hover
```css
.speakerForIOS span:before              (assignments.css:1909)
  transition: all 0.2s ease-out

.speakerForIOS:hover span:before        (assignments.css:1912)
  transform: scale(0.8) translate(-3px, 0) rotate(42deg)

.speakerForIOS.mute span:before         (assignments.css:1914-1916)
  transform: scale(0.5) translate(-15px, 0) rotate(36deg)
  opacity: 0
```

### Button Press
Button `:active` states have commented-out transform and box-shadow changes (assignments.css:621-622), suggesting these were removed. Currently no visual press animation on buttons.

### Overlay
```
.overley                                (assignments.css:1352-1363)
  background-color: #000
  opacity: 0.6
  position: fixed
  height: 100%
  width: 100%
  z-index: 0
```

The dark overlay behind modals has no transition — it appears/disappears instantly.

---

## Appendix: Template IDs

All `<script type="text/template">` blocks in assignment.html:

| Template ID | Line | Purpose |
|---|---|---|
| `assignTOCTemplate` | 519 | Category list wrapper |
| `old_fillableworksheet` | 530 | Two-panel fillable worksheet |
| `iwtsummaryslide` | 605 | Summary writing slide |
| `iwtsummaryfeedback` | 718 | Summary feedback with score bar |
| `paragraphslide` | 944 | Paragraph writing slide |
| `paragraphfeedback` | 1046 | Paragraph feedback with sub-scores |
| `iwthighlightslide` | 1272 | Highlight slide |
| `iwttextanswerslide` | 1370 | Text answer slide |
| `iwtdndslide` | 1468 | Drag-and-drop slide |
| `multiplechoiceslide` | 1550 | Multiple choice (full-width) |
| `multichoicepassageslide` | 1702 | Multiple choice with passage |
| `study_plan_pre_post_template` | 1848 | Study plan pre/post test |

## Appendix: Slide Type Constants

From constants.js:561-599:

| Constant | Value |
|---|---|
| `c_s_TYPE_TPL_FILLABLEWORKSHEET` | `fillableworksheet` |
| `c_s_TYPE_TPL_IWTSUMMARYSLIDE` | `iwtsummaryslide` |
| `c_s_TYPE_TPL_IWTTEXTANSWERSLIDE` | `iwttextanswerslide` |
| `c_s_TYPE_TPL_IWTDNDSLIDE` | `iwtdndslide` |
| `c_s_TYPE_TPL_IWTHIGHLIGHTSLIDE` | `iwthighlightslide` |
| `c_s_TYPE_TPL_PARAGRAPH` | `paragraph` |
| `c_s_TYPE_TPL_ESSAY` | `essay` |
| `c_s_TYPE_TPL_MULTIPLECHOICESLIDE` | `multiplechoiceslide` |
| `c_s_TYPE_TPL_MULTICHOICEPASSAGESLIDE` | `multichoicepassageslide` |
| `c_s_TYPE_TPL_PHONICTEXTBASEDSLIDE` | `phonictextbasedslide` |

## Appendix: Key JS Object References

```
AssignmentsView          — TOC rendering, resize, init
AssigmentSlides          — Slide engine, navigation, attempt data
AssignmentsTOCView       — Category list builder (.render method)
Assessment               — Assessment-specific logic (tab management, GRADE data)
StudyPlanPracticeView    — Study plan skill tracking
PhonicTextBasedView      — Phonic slide initialization
GradeIntroAnimationView  — Intro video management
```

Cached jQuery selectors (assignments.js:137-155):
```javascript
$('#assignmentPrev')     // Prev slide button
$('#assignmentNext')     // Next slide button
$('#popupAudio_new')     // Audio control
$('#headerTitle')        // Header title text
```
