# Savvas I-LIT Interactive Reader — CSS & JS Reference

Extracted from `docs/reference-source/css/assignments.css`, `style.css`, and `assignments_frs.js`.

---

## 1. Global Foundations

### Base Typography & Colors
```css
body {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 21px;
  color: #4e4e4e;
  font-weight: normal;
  background-color: #E0E1E1;
  line-height: 1;
}

p { line-height: 28px; }

/* Highlight mark element */
mark {
  background-color: #ff9;
  color: #000;
  font-style: italic;
  font-family: Helvetica, Arial, sans-serif;
}
```

### User Selection Prevention (for drag-drop, highlighting checkpoints)
```css
.no_select_please {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Rangy selection re-enables text selection within no-select zones */
.no_select_please .rangySelection {
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
  user-select: text !important;
}
```

---

## 2. Slide Layout & Container

### Main Slider Wrapper (IR background frame)
```css
.slider_swiper_inner {
  position: absolute;
}

/* Reading content panel container */
.container_space {
  padding: 32px 9px 9px 9px;
  min-height: 100%;
  position: relative;
}

.container_space h2 {
  font-size: 30px;
  line-height: 43px;
  color: #fff;
  padding: 0 0 0 12px;
  font-weight: normal;
}

.container_space p {
  margin-bottom: 12px;
  font-size: 16px;
  line-height: 25px;
  color: #111;
}
```

### Content Box (white reading panel)
```css
.content_space {
  border-radius: 9px;
  background: #fff;
  padding: 22px 35px;
}

.continent_box_space {
  height: 400px;
  width: 550px;
}

.continent_box_inner {
  background: #fff;
  height: 100%;
  border-radius: 12px;
  z-index: 3;
  position: relative;
  border: rgba(0, 0, 0, 0.3) 6px solid;
  -moz-background-clip: padding;
  -webkit-background-clip: padding;
  background-clip: padding-box;
  overflow: hidden;
}

.continent_content_inner {
  padding: 20px 15px;
  max-height: 360px;
  overflow: auto;
}

.continent_content_inner p {
  margin-bottom: 30px;
  font-size: 17px;
  line-height: 30px;
}
```

### Passage Content Area
```css
.passage_slide_padding {
  padding: 15px 20px;
}

.contentMainInner {
  padding: 10px;
  font-size: 18px;
  line-height: 28px;
}

.contentMainInner p {
  margin-bottom: 20px;
}

/* Book-style reading page */
.mainpage_book {
  max-width: 625px;
  margin: 0 auto;
  font-family: Georgia, "Times New Roman", Times, serif;
}

.mainpage_book p {
  margin-bottom: 10px;
  font-size: 15px;
}

.mainpage_book_content {
  max-height: 440px;
  overflow: auto;
}

.mainpage_book_content p {
  font-size: 18px;
  line-height: 26px;
  margin-bottom: 15px;
}
```

### Background Images (slide backgrounds)
```css
.bg1 { background: url(../media/bg1.jpg) no-repeat center center; background-size: cover; }
.bg2 { background: url(../media/bg2.jpg) no-repeat center center; background-size: cover; }
.bg3 { background: url(../media/bg3.jpg) no-repeat center center; background-size: cover; }

/* Full-page fixed backgrounds (instructor parallax-style) */
.bg11 { background: url(../media/bg1.jpg) no-repeat center bottom; height: 100%; background-size: cover; }
.bg14 { background: url(../media/bg4.jpg) no-repeat center bottom; height: 100%; background-size: cover; }
```

---

## 3. Slide Navigation

### Navigation Dots (Slider Bullets)
```css
.slider_bullet {
  text-align: center;
  width: 100%;
  list-style: none;
  margin: 15px 0 0;
  padding: 0;
}

.slider_bullet li {
  display: inline-block;
  margin: 0 6px;
}

.slider_bullet li a {
  background: #fff;
  border: 2px solid #E7E7E7;
  border-radius: 20px;
  cursor: pointer;
  display: block;
  height: 6px;
  text-indent: -9999px;
  width: 6px;
}

.slider_bullet li a.active {
  background: rgba(0, 0, 0, 0.9);
  cursor: default;
}
```

### Alternative Pagination Dots (slider_switch)
```css
.slider_switch {
  background: #666;
  border: 1px solid #000;
  border-radius: 10px;
  cursor: pointer;
  display: inline-block;
  height: 9px;
  margin: 0 3px;
  width: 9px;
}

.slider_switch.active {
  background: #000;
  border: 1px solid #999;
  box-shadow: 0 3px 2px 0 rgba(0, 0, 0, 0.3);
  height: 9px;
  width: 9px;
}

.pagination_for_slider {
  bottom: 2px;
  left: 0;
  position: absolute;
  text-align: center;
  width: 100%;
  z-index: 1;
}
```

### IR Next/Prev Arrows
```css
/* Main circular arrow buttons */
.nxtprev {
  width: 60px;
  height: 60px;
  cursor: pointer;
  background-image: url(../media/sprite4_ratina.png);
  border: 2px solid #fff;
  border-radius: 50%;
  position: absolute;
  top: 291px;
}

#prevBtn {
  left: 20px;
  background-position: -350px -363px;
}

#nextBtn {
  right: 30px;
  background-position: -341px -464px;
}

.nxtprev.dimmed {
  opacity: 0.3;
}

/* Older arrow style */
.left_arrow {
  background-image: url(../media/sprite4_ratina.png);
  border: 2px solid #fff;
  border-radius: 50%;
  width: 58px;
  height: 58px;
  background-position: -160px -168px;
  position: absolute;
  left: 0;
  top: 11px;
  cursor: pointer;
}

.right_arrow {
  background-image: url(../media/sprite4_ratina.png);
  border: 2px solid #fff;
  border-radius: 50%;
  width: 58px;
  height: 58px;
  background-position: -157px -219px;
  position: absolute;
  right: 0;
  top: 11px;
  cursor: pointer;
  margin-right: 15px;
}

/* Pager arrows (within slide sets) */
.slider_pager_left {
  position: absolute;
  left: 10px;
  top: 50%;
  height: 50px;
  width: 50px;
  background-position: -411px -156px;
  border: 0;
  cursor: pointer;
  margin-top: -25px;
}

.slider_pager_right {
  position: absolute;
  right: 10px;
  top: 50%;
  height: 50px;
  width: 50px;
  background-position: -410px -105px;
  border: 0;
  cursor: pointer;
  margin-top: -25px;
}
```

### Back Button (Save & Exit)
```css
#assignmentPrev {
  width: 100px;
  height: 35px;
  background-color: #4053d2;
  border-radius: 17px;
  color: white;
  border: 2px solid white;
  font-family: inherit;
  font-weight: bold;
  margin-top: 3px;
}
```

---

## 4. Top Navbar (Slide Header)

```css
.top_navbar {
  background: linear-gradient(to bottom, #303238 0%, #28292d 50%, #222325 100%);
  border-bottom: 1px solid #353636;
  padding: 0 15px;
  text-align: center;
}

.top_navbar .slider_bullet {
  float: right;
  width: inherit;
  margin-top: 17px;
}

.top_navbar .slider_bullet li a {
  background: #fff;
}

.top_navbar .slider_bullet li {
  margin: 0 2px;
}

/* Inner header bar */
.header_innerin {
  border-bottom: 1px solid #353637;
  background: #2a2b2d;
  text-align: center;
  padding: 5px 10px;
  color: #fff;
  font-size: 18px;
  line-height: 30px;
}

/* Slide left/right in header */
.sld_lft { width: 40px; height: 40px; background-position: -167px -175px; cursor: pointer; border: 0; }
.sld_rgt { width: 40px; height: 40px; background-position: -171px -231px; cursor: pointer; border: 0; }
```

---

## 5. Checkpoint Styles

### Question Container
```css
.question_box_space {
  background: #fff;
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: none;
  font-size: 16px;
}

.question_box_space .question_part {
  margin: 0;
  border-radius: 8px;
  border: 2px solid #ddd;
  overflow: hidden;
}

.question_box_space .question_part li {
  font-size: 18px;
  cursor: pointer;
  padding: 5px 0 5px 5px;
  border-bottom: 1px solid #ddd;
  margin-bottom: 0;
  position: relative;
}
```

### Answer Key Labels (A, B, C, D)
```css
.answer_key {
  width: 30px;
  height: 30px;
  background: #e5e5e5;
  line-height: 30px;
  text-align: center;
  border-radius: 3px;
  margin-right: 5px;
  font-size: 18px;
  top: 50%;
  margin-top: -15px;
  position: absolute;
  left: 43px;
}

/* Active/selected answer key */
.question_box_space .question_part li.active .answer_key {
  background: #35484c;
  color: #fff;
}
```

### Multiple Choice Checkboxes (sprite-based)
```css
.question_part li .check_box_view {
  font-size: 18px;
  height: 30px;
  line-height: 30px;
  margin-right: 5px;
  text-align: center;
  width: 30px;
  top: 50%;
  margin-top: -15px;
  position: absolute;
  background-position: -370px -67px;  /* unchecked */
}

.question_part li:hover .check_box_view {
  background-position: -370px -116px;  /* hover */
}

.question_part li.active .check_box_view {
  background-position: -370px -167px;  /* checked/selected */
}
```

### Answer Text Area
```css
.question_part .middle {
  padding-left: 80px;
  padding-right: 45px;
  font-size: 16px;
}

.question_box_space li .middle {
  line-height: 30px;
  overflow: hidden;
}
```

### Correct/Incorrect Icons
```css
.correct {
  background-position: -301px -211px;  /* green check sprite */
  height: 30px;
  width: 30px;
  margin-top: -15px;
  top: 50%;
  right: 1%;
  position: absolute;
}

.incorrect {
  background-position: -301px -272px;  /* red X sprite */
  height: 30px;
  width: 30px;
  margin-top: -15px;
  top: 50%;
  right: 1%;
  position: absolute;
}
```

### Question Title Bar
```css
.new_assignment_title {
  background: #F6F6F6;
  border-bottom: 1px solid #ccc;
  margin-bottom: 0px;
  padding: 10px;
  border-radius: 8px 8px 0 0;
  font-weight: normal;
  font-size: 18px;
  position: relative;
}

/* Alternate darker title */
.new_assignment_title {
  background: #DDDDDD;  /* in pre_post_test view */
}

/* Inner reading response area */
.new_assignment_irr {
  padding: 10px;
  box-shadow: inset 0 1px 3px 0 #C2C2C2;
}
```

### Direction/Instructions Bar
```css
.direction_title {
  padding: 10px 15px;
  background: #eee;
  font-size: 14px;
  color: #000;
  line-height: 20px;
  border-bottom: 1px solid #d1d1d1;
  border-radius: 9px 9px 0 0;
}
```

---

## 6. Highlighting (Text Annotation in Checkpoints)

```css
/* Yellow highlight */
.highlight_Y {
  background: #ffff33;
}

/* Red/pink highlight */
.highlight_R {
  background: #f5a9a9;
}

/* Highlighter tool buttons (sprite positions) */
.yellow       { background-position: -274px -40px; }   /* yellow pen icon */
.red          { background-position: -206px -40px; }   /* red pen icon */
.eraser       { background-position: -139px -40px; }   /* eraser icon */

.yellow.active { background-position: -274px -101px; }  /* yellow pen active */
.red.active    { background-position: -206px -101px; }  /* red pen active */
.eraser.active { background-position: -139px -101px; }  /* eraser active */

/* Tool icon button container */
.icon_edit {
  width: 39px;
  height: 39px;
  margin-right: 3px;
  border: 0;
  cursor: pointer;
}
```

### Highlight Toolbar (edit_box_title)
```css
.edit_box_title {
  padding: 2%;
  border-radius: 0 0 6px 0;
  background: #eeeeee;
  text-align: center;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.2);
}
```

---

## 7. Drag-and-Drop Checkpoints

### Drop Targets
```css
.drag_drop_content {
  height: 80px;
  width: 80px;
  display: inline-block;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: inset 0 0 5px 0 #707070;
}

.drag_drop_content.inactive {
  box-shadow: inherit;
}

/* Correct drop */
.drag_drop_content.right_drag {
  box-shadow: inset 0 0 5px 0 #1F8713;
  border: 1px solid #1F8713;
}

/* Incorrect drop */
.drag_drop_content.wrong_drag {
  box-shadow: inset 0 0 5px 0 #CC1426;
  border: 1px solid #CC1426;
}

.drag_drop_inner {
  text-align: center;
  vertical-align: middle;
  display: table-cell;
  height: 80px;
  width: 80px;
}

.drag_content_area {
  padding: 10px;
  text-align: center;
}

.drag_content_area_droppable {
  padding: 10px;
}

.drappable_area {
  margin-bottom: 15px;
}
```

### Drag Word Container
```css
.drag_word_container {
  border: 1px solid #333;
  height: 45px;
}

.drag_word_container .middle {
  overflow: hidden;
  text-align: center;
  line-height: 45px;
  color: #aaa;
}

.fill_word {
  border-bottom: 2px solid #ddd;
  min-width: 130px;
  display: inline-block;
}
```

### Drag-Drop Practice Area
```css
.practice_drag_drop.text_box_area {
  height: 225px;
}
```

---

## 8. Summary Writing / Free Response

### Text Area
```css
.text_box_area {
  position: relative;
  z-index: 5555;
  padding: 5px;
  border: 1px solid #cccccc;
  border-radius: 5px;
  margin-bottom: 20px;
  background: none;
}

.text_box_area textarea {
  min-height: 130px;
  width: 100%;
  height: 100%;
  border: 0;
  background: none;
  resize: none;
  font-size: 17px;
  font-family: inherit;
  line-height: 20px;
}

/* Essay tab variant */
#essay_tabs .text_box_area {
  border: 1px solid #D3D3D3;
  border-radius: 0 4px 4px 4px;
  margin-top: -1px;
  height: 127px;
}

#essay_tabs .text_box_area textarea {
  min-height: 126px;
  font-size: 17px;
}

/* Daily assignment variant */
.daily_assignment_content .text_box_area {
  margin-bottom: 25px;
  margin-top: 15px;
}
```

### Get Feedback Button
```css
.get_feedback.button7 {
  width: 100% !important;
  margin: 7px 0 0;
  padding: 15px 20px;
}
```

### Summary Right Box (side panel for writing)
```css
.continent_edit_box {
  float: left;
  height: 330px;
  margin: 0px 0 0px -12px;
  width: 400px;
  border: rgba(0, 0, 0, 0.3) 6px solid;
  background: #f7f9f9;
  border-radius: 0 12px 12px 0;
  -moz-background-clip: padding;
  -webkit-background-clip: padding;
  background-clip: padding-box;
  position: relative;
  overflow: hidden;
}

.continent_edit_box.new_tab_space.left_conts_place.summary_right_box {
  background: none;
}

.continent_wrap_box {
  padding: 10px 15px 0 20px;
}

.continent_conts h3 {
  color: #000;
  font-size: 16px;
  line-height: 27px;
  margin: 0 0 5px;
  font-weight: bold;
}
```

---

## 9. Audio Player

### Audio Button
```css
.audio_btn {
  border: 0 none;
  cursor: pointer;
  height: 40px;
  width: 40px;
}

.play { background-position: -156px -409px; }  /* play icon sprite */
.stop { background-position: -202px -409px; }  /* stop icon sprite */
```

### Audio Control (Assignment-level)
```css
.assignment_audio_control_lookNfeel {
  z-index: 100;
  display: none;
  border: 0 none;
  cursor: pointer;
  height: 40px;
  width: 280px;
  position: absolute;
  right: 10px;
  top: 7px;
}

audio:focus {
  outline-width: 3px !important;
  outline-color: Highlight !important;
  outline-style: dotted !important;
  outline-offset: -2px;
}
```

### iOS Speaker Icon (Mute/Unmute)
```css
.MuteUnmuteControlForIOS {
  position: absolute;
  right: 9px;
  top: 10px;
  border: 0;
  cursor: pointer;
  z-index: 100000;
  display: none;
  border-radius: 0px 10px 10px 0px;
}

.speakerForIOS {
  height: 24px;
  width: 30px;
  position: relative;
  overflow: hidden;
  display: inline-block;
  z-index: 1000000;
}

.speakerForIOS span {
  display: block;
  width: 4px;
  height: 6px;
  margin: 12px 0 0 4px;
  background-color: #e1e1e1;
}
```

---

## 10. Buttons

### Primary Action Button (button7 / "Submit", "Get Feedback", "Check")
```css
button.button7 {
  background: #3444ad;
  background: linear-gradient(to bottom, #3444ad 0%, #3444ad 100%);
  border: 0;
  border-radius: 5px;
  box-shadow: 0 1px 0px 0 #1a2b96, inset 0 -2px 0 0 #1a2b96, inset 0 0 0 1px #3444ad;
  font-size: 15px;
  padding: 10px 20px;
  color: #fff;
  text-decoration: none;
  min-width: 90px;
  margin-right: 3px;
  font-weight: bold;
  width: 140px;
  cursor: pointer;
}

.button7:hover {
  color: white;
  background: #3d57b4;
}
```

### Primary Blue Button (button / "Begin", "Next")
```css
button.button {
  background: #1c8ed5;
  background: linear-gradient(to bottom, #1c8ed5 0%, #79bde6 3%, #1c8ed5 5%, #1c8ed5 95%, #025e97 100%);
  border: 0;
  border-radius: 5px;
  box-shadow: 0 1px 0px 0 #025e97, inset 0 -2px 0 0 #025e97, inset 0 0 0 1px #025e97;
  display: inline-block;
  padding: 5px 10px;
  color: #fff;
  text-decoration: none;
  font-size: 20px;
  min-width: 140px;
}

/* Active/completed state (green) */
button.button.active {
  background: #48c05d;
  background: linear-gradient(to bottom, #48c05d 0%, #42d059 3%, #10c42e 5%, #18c835 95%, #007b14 100%);
  box-shadow: 0 1px 0px 0 #007b14, inset 0 -2px 0 0 #007b14, inset 0 0 0 1px #007b14;
}

/* Inactive/disabled state (gray) */
button.button.inactive {
  background: #71797e;
  background: linear-gradient(to bottom, #71797e 0%, #8d9498 3%, #71797e 5%, #727a7f 95%, #3c4246 100%);
  box-shadow: 0 1px 0px 0 #3c4246, inset 0 -2px 0 0 #3c4246, inset 0 0 0 1px #3c4246;
}
```

### Green "Done" Button (button2)
```css
button.button2 {
  background: #1bb053;
  background: linear-gradient(to bottom, #1bb053 0%, #83e0a7 2%, #2cca69 4%, #1bb053 97%, #27814b 100%);
  box-shadow: 0 1px 0px 0 #007b14, inset 0 -2px 0 0 #007b14, inset 0 0 0 1px #007b14;
  border: 0;
  border-radius: 5px;
  display: inline-block;
  padding: 8px 10px;
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  min-width: 150px;
  font-family: Helvetica, Arial, sans-serif;
  text-shadow: 0px -2px 1px #27814b;
}
```

### Dark Gray Button (button6 / navigation)
```css
button.button6 {
  width: 205px !important;
  background: #484d51;
  background: linear-gradient(to bottom, #484d51 0%, #3b4044 100%);
  border: 0;
  border-radius: 5px;
  box-shadow: 0 1px 0px 0 #1c1e22, inset 0 -2px 0 0 #1c1e22, inset 0 0 0 1px #3f4348;
  padding: 10px 50px;
  color: #fff;
  text-decoration: none;
  font-size: 15px;
  font-weight: bold;
  text-transform: uppercase;
}

/* Active orange variant */
button.button6.active {
  background: #f18811;
  background: linear-gradient(to bottom, #f18811 0%, #ec6b06 100%);
  box-shadow: 0 1px 0px 0 #b65407, inset 0 -2px 0 0 #b65407, inset 0 0 0 1px #ed7008;
  padding: 8px 10px;
  color: #fff;
  font-size: 15px;
  min-width: 145px;
  font-weight: bold;
  text-transform: uppercase;
}
```

---

## 11. Feedback Color Scale (Scoring Bars)

Used in rubric scoring UI, 13-step color gradient from red to green:

```css
.box_over {
  float: left;
  margin-right: 4.2px;
  width: 6.5%;
  height: 30px;
  border-radius: 4px;
  background: #c9c9c9;  /* inactive */
}

.box_over.color_1.active  { background: #ff0000; }  /* pure red */
.box_over.color_2.active  { background: #ff3300; }
.box_over.color_3.active  { background: #ff6600; }
.box_over.color_4.active  { background: #ff7517; }
.box_over.color_5.active  { background: #ff9214; }
.box_over.color_6.active  { background: #ffab17; }
.box_over.color_7.active  { background: #ffc31a; }
.box_over.color_8.active  { background: #ffdc1c; }
.box_over.color_9.active  { background: #e4f61f; }
.box_over.color_10.active { background: #c9f81f; }
.box_over.color_11.active { background: #affb1f; }
.box_over.color_12.active { background: #94fd1f; }
.box_over.color_13.active { background: #79ff1f; }  /* bright green */
```

---

## 12. Animations & Transitions

### 3D Slit Modal (Checkpoint Popup)
```css
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

@keyframes slit {
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

### Overlay (Background Dimming)
```css
.md-overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  visibility: hidden;
  top: 0;
  left: 0;
  z-index: 1000;
  opacity: 0;
  background: rgba(0, 0, 0, 0.8);
  transition: all 0.3s;
}

.md-show ~ .md-overlay {
  opacity: 1;
  visibility: visible;
}

.overley {  /* alternate overlay */
  background-color: #000;
  height: 100%;
  left: 0;
  opacity: 0.6;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 0;
}
```

### Drawer Transition (Unanswered Questions Panel)
```css
.drawer {
  z-index: 1000;
  position: fixed;
  top: 100px;
  visibility: hidden;
  padding: 15px;
  width: 350px;
  left: 450px;
  background: rgb(238, 238, 238);
  border-radius: 5px;
  transition: left 0.2s ease, right 0.2s ease, top 0.2s ease, bottom 0.2s ease, visibility 0.2s ease;
}
```

### Button Press Effect
```css
button.btn:active {
  transform: translate(0px, 2px);
}
```

---

## 13. Modal/Dialog Styles

```css
.md-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 50%;
  max-width: 400px;
  min-width: 400px;
  height: auto;
  z-index: 2000;
  visibility: hidden;
  backface-visibility: hidden;
  transform: translateX(-50%) translateY(-50%);
}

.md-show {
  visibility: visible;
}

.md-content {
  color: #000;
  background: #ffffff;
  position: relative;
  border-radius: 9px;
  margin: 0 auto;
  padding: 10px;
  overflow: hidden;
  border: rgba(0, 0, 0, 0.3) 4px solid;
}
```

---

## 14. Footer Navigation Bar

```css
footer {
  border-top: 1px solid #545659;
  position: relative;
  background: linear-gradient(to bottom, #404246 1%, #28292b 100%);
}

.footer_inner {
  text-align: center;
}

.footer_inner button.active {
  background-color: #17191a;
}

/* Tab buttons */
.Library     { width: 65px; height: 51px; background-position: 6px -184px; }
.Notebooks   { width: 65px; height: 51px; background-position: 6px -234px; }
.Assignments { width: 65px; height: 51px; background-position: 5px -279px; }

/* All tab button labels */
.Library span, .Notebooks span, .Assignments span {
  bottom: 5px;
  left: 0;
  position: absolute;
  width: 100%;
  font-size: 9px;
  color: #fff;
}
```

---

## 15. Assignment Count Badges

```css
.assignment-count {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: block;
  text-align: center;
  line-height: 22px;
  margin-right: 0px;
}

.assignment-count.red {
  color: red;
  border: 2px solid red;
  font-weight: normal;
}

.assignment-count.green {
  color: green;
  border: 2px solid green;
  font-weight: normal;
}
```

---

## 16. Complete Alert / Success Message

```css
.complete_alert {
  background: #e4fde8;
  border: 1px solid #08741a;
  padding: 10px;
  color: #08741a;
  position: relative;
  border-radius: 8px;
  font-size: 16px;
  padding-left: 50px;
  line-height: 22px;
}
```

---

## 17. Table of Contents (TOC) Tooltip

```css
.toc_tooltip {
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 9px;
  width: 250px;
  position: absolute;
  top: 48px;
  left: 0%;
  background: #fff;
  z-index: 5;
  box-shadow: 5px 8px 22px 8px #000;
  font-family: Georgia, "Times New Roman", Times, serif;
}

.table_name {
  text-align: center;
  font-size: 20px;
  font-family: Helvetica;
  margin-top: 20px;
  background: #f6f6f6;
  padding: 5px;
  box-shadow: 0 1px 2px 0 #bbb, 0 0px 0 0px #bbb inset;
}

.toc_tooltip li {
  margin-left: 30px;
  padding: 10px;
  border-bottom: 1px solid #d8d8d8;
  position: relative;
  cursor: pointer;
  font-size: 15px;
  font-family: Georgia, "Times New Roman", Times, serif;
}

.toc_tooltip li.active {
  color: #007AFF;
}

.toc_tooltip .toc_tooltip_middle {
  max-height: 450px;
  overflow: auto;
}
```

---

## 18. Phonics Word Matching (Golden Buttons)

```css
.myButton {
  box-shadow: 0px 4px 0px 0px #bc530d;
  background: linear-gradient(to bottom, #fcc85f 5%, #faae16 100%);
  background-color: #fcc85f;
  border-radius: 8px;
  border: 5px solid #ffde96;
  display: inline-block;
  cursor: pointer;
  color: #3c3c3c;
  font-family: arial;
  font-size: 80%;
  font-weight: bold;
  padding: 28px 20px;
  text-decoration: none;
  text-shadow: 0px 1px 0px #ffffff;
  margin: 5% 3% 3%;
}

.myButton:active {
  position: relative;
  top: 1px;
}

.myButton.blank {
  background: #e4f3fb;
  color: #333;
  text-shadow: 0 1px 0 #fff;
  border: 1px solid #c9dde6;
  box-shadow: inherit;
  padding: 30px 22px;
}
```

---

## 19. Validation Feedback Colors

```css
/* Text search input validation */
.okey  { border: 1px solid #2ac243; }  /* correct answer */
.wrong { border: 1px solid #ff0000; }  /* wrong answer */

/* Phonics search content */
.phonics_container .search_content { color: #2ac243; }

/* Correct/wrong sprite icons in search fields */
.okey .cross_icon  { background-position: -305px -215px; }  /* green check */
.wrong .cross_icon { background-position: -305px -276px; }  /* red X */
```

---

## 20. Key Color Palette Summary

| Purpose | Color | Hex |
|---------|-------|-----|
| Primary button (action) | Blue-purple | `#3444ad` |
| Primary button hover | Lighter blue | `#3d57b4` |
| Primary button shadow | Dark blue | `#1a2b96` |
| Navigation button | Blue | `#1c8ed5` |
| Navigation button shadow | Dark blue | `#025e97` |
| Success/complete button | Green | `#1bb053` |
| Active/orange button | Orange | `#f18811` to `#ec6b06` |
| Inactive/disabled button | Gray | `#71797e` to `#3c4246` |
| Dark nav button | Dark gray | `#484d51` to `#3b4044` |
| Highlight yellow | Yellow | `#ffff33` |
| Highlight red/pink | Light red | `#f5a9a9` |
| Correct drag border | Green | `#1F8713` |
| Wrong drag border | Red | `#CC1426` |
| Correct validation | Green | `#2ac243` |
| Wrong validation | Red | `#ff0000` |
| Complete alert bg | Light green | `#e4fde8` |
| Complete alert text | Dark green | `#08741a` |
| Active link/toc | iOS blue | `#007AFF` |
| Header bar bg | Near-black | `#303238` to `#222325` |
| Footer bar bg | Dark gray | `#404246` to `#28292b` |
| Body background | Light gray | `#E0E1E1` |
| Content background | White | `#fff` |
| Content panel border | Semi-transparent | `rgba(0,0,0,0.3)` |
| Body text | Dark gray | `#4e4e4e` |
| Content text | Near-black | `#111` |
| Disabled/muted | Medium gray | `#c9c9c9` |

---

## 21. JS: Foundational Reading Skills (assignments_frs.js)

The `FoundationalRS` class handles the FRS/IR checkpoint scoring engine:

- **Benchmark score threshold**: `80.0%` (students scoring below retake)
- **Parts structure**: Assignments split into `part1`, `part2` with IDs
- **Slide management**: Tracks slides by `partId-slideId` composite key
- **Student attempt data**: Loads from `AssigmentSlides.getStudentAttemptForGradableItem()`
- **Oral fluency data**: JSON-encoded, URI-encoded oral reading records
- **Score button label**: `"Score"` (const `c_s_SUBMIT_ANSWERS_BTTN`)
- **Rejected recordings**: Teacher can reject audio recordings (`AC == -1, WCPM == -1`), forcing student re-record
- **Video slide counter**: `iCntVideoSlide` tracks video-based slides
- **Model**: Configuration loaded via `loadModel()` with metadata `ItemType: ASSIGNMENT`, `ItemSubType: TYPE_TPL_FRS`

### Key Methods
- `getFirstSlideIdByPart(partId)` -- returns first slide index for a part
- `getLastSlideIdByPart(partId)` -- returns last slide index for a part
- `getSlides(partId, slideId)` -- retrieves slide(s) by part/slide composite key
- `Alert(title, message, callback)` -- displays checkpoint dialog via `AssigmentSlides._alert()`
- `init(slideIdx, model)` -- initializes the FRS engine, loads model, slides, and student attempt data

---

## 22. Responsive Breakpoints

```css
/* iPad / tablets <= 1024px */
@media only screen and (max-width: 1024px) {
  .slider_swiper_inner.parallexIwt .container_space { left: 100px; }
  .left_arrow, .right_arrow { width: 48px; height: 48px; }
}

/* Small screens */
@media screen and (max-width: 32em) {
  body { font-size: 75%; }
}

/* Retina displays */
@media only screen and (-webkit-min-device-pixel-ratio: 2) {
  .sprite  { background-image: url(../media/sprite_ratina.png);  background-size: 500px auto; }
  .sprite2 { background-image: url(../media/sprite2_ratina.png); background-size: 700px 400px; }
  .sprite3 { background-image: url(../media/sprite3_ratina.png); background-size: 500px 500px; }
}
```
