/* 
 * Contains All The Constants And Macros
 */ 
 
var c_i_ENTER_KEY_CODE=13,
	c_i_SPACE_KEY_CODE=32,
	c_i_CONTROL_KEY_CODE=17,
	c_i_TAB_KEY_CODE=9,
	c_i_B_KEY_CODE=66,
	c_i_M_KEY_CODE=77,
	c_i_RIGHT_ARROW_KEY_CODE=39,
	c_i_LEFT_ARROW_KEY_CODE=37,
	c_i_Q_KEY_CODE=81,
	c_i_E_KEY_CODE=69,
	c_i_SHIFT_KEY_CODE=16;	

var c_s_VOICE_TRANSLATE_UNAVAIBLE = "Speech translation is not available for this language.";
	
var c_b_HideNativeBottomBar = false;

// Epic-4
var selectedDueDate = '';
var callfromDueDateSendbutton = false;
// End of Epic-4

// CLAS-60
var objSavedFeedback = '';
var objbtnFeedbackClickedFrom = '';

var objbtnFeedbackCancelClicked = false;
// End of CLAS-60

// Epic-4 - Partial Score
var callFromPartialScorebutton = false;
// End of Epic-4 - Partial Score


// Epic-4 - ReScore
var callFromReScorebutton = false;
// End of Epic-4 - ReScore

//Epic-4 - Reassign
var callFromPracticeSubmit = false;
//End of Epic-4 - Reassign

// CLAS-568
var SelectedBookItemIDForReviewPop ="";
var Select_StudentIDForReviewPop ="";
// End of CLAS-568

// ILIT-6594
var boolIsSaveGlobally = 0;

var IsCalledFromSaveGlobally = "n";
// End of ILIT-6594

var c_s_APP_UPDATE_ALERT = "An older version of the app has been detected. Please update your app with the latest version in the app store.";
var c_s_PRIOR_BTS2020_APP_VERSION = "9.1.6";

var c_s_CHROME_SERVER_NOT_STARTED_TITLE = "Chrome Loader Issue";
var c_s_CHROME_SERVER_NOT_STARTED_MESSAGE = "Please tap \"Logout\" and try again. If the issue persists then allow 2 to 3 minutes before logging in again.";

var infoPhonicTxt = '<div class="info active" id="infophonic" style="display:none; z-index:2000; position: absolute; right: 9px; top: 9px; width: 39px;"><button tabindex="0" title="Information button" aria-label="Information" id="infoBtnPhonic" class="active valid-activity" role="button" aria-expanded="true" aria-haspopup="true" style="cursor: pointer;font-size: 15px;border: none;font-color: #000000;border-radius: 50%;background-color: white !important;height: 36px;width: 36px;" data-verbid="S-ABC" class="valid-activity"><img src="./media/accessibility.png" alt="" style="min-width: 27px;margin-top: 3px;" class="informationButtonImage"></img></button><div id="InfoContentPhonic" class="tooltip_tools tooltip_wrap_inner" style="display: block; position: absolute; width: 500px; height:500px; border-radius:5px; padding:0 0 0 10px; overflow-y:scroll;background:#fff;"><div id="contentArea" class="InfoContentArea" style="font-family:Helvetica, Arial, sans-serif;padding:15px;" aria-live="polite"><h2 style="text-align:center; text-decoration: underline;">Accessibility Instructions </h2>To attempt practice slide using keyboard, follow these instructions.<ul class="instructionList"><li><b>1.</b> Use tab key to navigate to the next word, use shift+tab to navigate to the previous word.</li><li><b>2.</b> Use space to select the word on which you are currently. Now press space to drop the word to the right panel.</li><li><b>3.</b> Use right arrow key to go directly from left panel to right panel and left arrow key to go directly from right panel to left panel.</li><li><b>4.</b> When the focus is on pagination use right or left arrow key to move to next or previous slide.</li><li><br>To attempt comprehension slide using keyboard, follow these instructions.</li><li><b>1.</b> Use tab or up/down arrow key to navigate to the Multiple Choice Question options.</li><li><b>2.</b> Use tab or up/down arrow key to navigate to the Multiple Choice Question options.</li></ul></div></div></div>';

var infoWordSlam = '<div class="info active" id="info_wordslam" style="display:none; z-index:2000; position: absolute; right: 68px; top: 9px; width: 39px;"><button tabindex="0" title="Information button" aria-label="Information" id="info_wordslam_btn" class="active valid-activity" role="button"  aria-haspopup="true" style="cursor: pointer;font-size: 15px;border: none;font-color: #000000;border-radius: 50%;background-color: white !important;height: 36px;width: 36px;" data-verbid="S-ABC" class="valid-activity"><img src="./media/accessibility.png" alt="" style="min-width: 27px;margin-top: 3px;" class="informationButtonImage"></img></button><div id="ui-tooltip-info" role="tooltip" class="ui-tooltip ui-widget ui-corner-all ui-widget-content" style="top: 60px; right: 10px; display: none;"><div class="ui-tooltip-content">Information Button</div>\
</div>\<div id="info_wordslam_content" role="region" class="tooltip_tools tooltip_wrap_inner" style="display: block; position: absolute; right: 12px; width: 350px; height: 450px; border-radius:5px; padding:0 0 0 10px; overflow-y:scroll"><div id="contentArea" class="InfoContentArea" aria-live="polite"><h2 style="text-align:center; text-decoration: underline;">Accessibility Instructions </h2>To attempt practice slide using keyboard/touch, follow these instructions.<ul class="instructionList"><li>1. Use tab key/swipe horizontally(left to right) to navigate to the next item, use shift+tab/swipe horizontally(right to left) to navigate to the previous item.</li><li><br>2. Use space/double tap to select the drag or drop box on which your focus is currently.</li><li><br>3. After selecting drop box Use Ctrl + M/double tap to drop your selected drag box from right panel</li><li><br>4. After selecting drop box Use Backspace/double tap to cancel your answer</li><li><br>5. Use right arrow key to go directly from left panel to right panel and left arrow key to go directly from right right panel to left panel</li><li><br>6. When the focus is on pagination use right or left arrow key or double tap to next or previous slide</li></ul></div></div></div>';

//Epic-3
// var infoIWTTxt = '<div class="info active" id="infoIWT" style="display:none; z-index:2000; position: absolute; right: 59px; top: 9px; width: 39px;"><button tabindex="0" title="Information button" aria-label="Information" id="infoBtnIWT" class="active valid-activity" role="button" aria-expanded="true" aria-haspopup="true" style="cursor: pointer;font-size: 15px;border: none;font-color: #000000;border-radius: 50%;background-color: white !important;height: 36px;width: 36px;" data-verbid="S-ABC" class="valid-activity"><img src="./media/accessibility.png" alt="" style="min-width: 27px;margin-top: 3px;" class="informationButtonImage"></img></button><div id="InfoContentIWT" class="tooltip_tools tooltip_wrap_inner" style="display: block; position: absolute; width: 500px; height: 500px; border-radius:5px; padding:0 0 0 10px; overflow-y:scroll;background:#fff;"><div id="contentArea" class="InfoContentArea" style="font-family:Helvetica, Arial, sans-serif;padding:15px;" aria-live="polite"><h2 style="text-align:center; text-decoration: underline;">Accessibility Instructions </h2>To attempt highlight slide, follow these instructions:<ul class="instructionList" ><li><b>1.</b> Use tab/swipe to navigate the markers & eraser. </li><li><b>2.</b> Press Space or Enter/double tap to select the markers or eraser.</li><li><b>3.</b> Use tab/swipe to navigate the sentences.</li><li><b>4.</b> Press Space or Enter/double tap to select the sentence.</li></ul><br>To attempt Drag & Drop slide, follow these instructions:<ul class="instructionList"><li><b>1.</b> Use tab/swipe to navigate the words.</li><li><b>2.</b> Press Space or Enter/double tap to drop the word.</li><li><b>3.</b> Use Alt + Right arrow to move to the right panel and Alt + Left key to move back to the left panel.</li></ul></div></div></div>';
var infoIWTTxt = '<div class="info active" id="infoIWT" style="display:none; z-index:2000; position: absolute; right: 296px; top: 9px; width: 39px;"><button tabindex="0" title="Information button" aria-label="Information" id="infoBtnIWT" class="active valid-activity" role="button" aria-expanded="true" aria-haspopup="true" style="cursor: pointer;font-size: 15px;border: none;font-color: #000000;border-radius: 50%;background-color: white !important;height: 36px;width: 36px;" data-verbid="S-ABC" class="valid-activity"><img src="./media/accessibility.png" alt="" style="min-width: 27px;margin-top: 3px;" class="informationButtonImage"></img></button><div id="InfoContentIWT" class="tooltip_tools tooltip_wrap_inner" style="display: block; position: absolute; width: 500px; height: 500px; border-radius:5px; padding:0 0 0 10px; overflow-y:scroll;background:#fff;"><div id="contentArea" class="InfoContentArea" style="font-family:Helvetica, Arial, sans-serif;padding:15px;" aria-live="polite"><h2 style="text-align:center; text-decoration: underline;">Accessibility Instructions </h2>To attempt highlight slide, follow these instructions:<ul class="instructionList" ><li><b>1.</b> Use tab/swipe to navigate the markers & eraser. </li><li><b>2.</b> Press Space or Enter/double tap to select the markers or eraser.</li><li><b>3.</b> Use tab/swipe to navigate the sentences.</li><li><b>4.</b> Press Space or Enter/double tap to select the sentence.</li></ul><br>To attempt Drag & Drop slide, follow these instructions:<ul class="instructionList"><li><b>1.</b> Use tab/swipe to navigate the words.</li><li><b>2.</b> Press Space or Enter/double tap to drop the word.</li><li><b>3.</b> Use Alt + Right arrow to move to the right panel and Alt + Left key to move back to the left panel.</li></ul></div></div></div>';
//End of Epic-3

var wordAssignment = '<div class="info active" id="info_wordAssignment" style="display:none; z-index:2000; position: absolute; right: 30px; top: 9px; width: 39px;">\
<button tabindex="0" title="Information button" aria-label="Information" id="info_wordAssignment_btn" class="active valid-activity" role="button"  aria-haspopup="true" style="cursor: pointer;font-size: 15px;border: none;font-color: #000000;border-radius: 50%;background-color: white !important;height: 36px;width: 36px;" data-verbid="S-ABC" class="valid-activity"><img src="./media/accessibility.png" alt="" style="min-width: 27px;margin-top: 3px;" class="informationButtonImage"></img></button>\
<div id="ui-tooltip-info" role="tooltip" aria-hidden="true" tabindex="-1" class="ui-tooltip ui-widget ui-corner-all ui-widget-content" style="top: 50px; right: 5px; display: none;"><div class="ui-tooltip-content">Information Button</div>\
</div>\
<div id="info_wordAssignment_content" role="region" class="tooltip_tools tooltip_wrap_inner" style="display: block; position: absolute; width: 350px; height: 450px; border-radius:5px; padding:0 0 0 10px; overflow-y:scroll">\
<div id="contentArea" class="InfoContentArea" aria-live="polite"><h2 style="text-align:center; text-decoration: underline;">Accessibility Instructions </h2>To attempt practice slide using keyboard/touch, follow these instructions.<ul class="instructionList"><li>1. Use tab key/swipe horizontally(left to right) to navigate to the next item, use shift+tab/swipe horizontally(right to left) to navigate to the previous item.</li><li><br>2. Use space/double tap to select the drag or drop box on which your focus is currently.</li><li><br>3. After selecting drop box Use Ctrl + M/double tap to drop your selected drag box from right panel</li><li><br>4. After selecting drop box Use Backspace/double tap to cancel your answer</li><li><br>5. Use right arrow key to go directly from left panel to right panel and left arrow key to go directly from right right panel to left panel</li></ul></div></div></div>';

var infoIpractice = '<div class="info active" id="info_ipractice" style="display:none; position: absolute; right: 240px; top: 10px; width: 39px;z-index:2000;">\
<button tabindex="0" aria-label="Information" id="info_ipractice_btn"  role="button"  aria-haspopup="true" style="cursor: pointer;font-size: 15px;border: none;font-color: #000000;border-radius: 50%;background-color: white !important;height: 36px;width: 36px;" data-verbid="S-ABC" class="valid-activity"><img src="./media/accessibility.png" alt="" style="min-width: 27px;margin-top: 3px;" class="informationButtonImage"></img></button>\
<div id="ui-tooltip-info" role="tooltip" aria-hidden="true" class="ui-tooltip ui-widget ui-corner-all ui-widget-content" style="top: 36px; right: -16px; display: none;"><div class="ui-tooltip-content">Information</div>\
</div>\
<div id="info_ipractice_content" role="region" class="tooltip_tools tooltip_wrap_inner" style="display: block; position: absolute; width: 350px; height: 450px; border-radius:5px; padding:0 0 0 10px; overflow-y:scroll">\
<div id="contentArea" class="InfoContentArea" aria-live="polite"><h2 style="text-align:center; text-decoration: underline;">Accessibility Instructions </h2>To read the content using your keyboard, follow these instructions.<ul class="instructionList"><li>1. You can switch between paragraphs/sentences using the TAB key.</li><li><br>2. Once you press TAB and the paragraph/sentence has been selected, you can press W. This will take you to the first word of that paragraph/sentence.</li><li><br>3. You can use Left or Right Arrow keys to move between words in that paragraph/sentence.</li><li><br>4. Once you have clicked W and are on a word, the TAB key will not work.</li><li><br>5. If you want to go to the another sentence/paragraph, first press P. This will select the sentence/paragraph that you are currently reading from word. Then click TAB to go to the next sentence/paragraph. Clicking Shift+Tab will take you to the previous sentence/paragraph.</li><li><br>6. Pressing space will highlight the paragraph/sentence/word and open texthelp options.</li></ul></div></div></div>';

var rotatingListInfo = '<div class="info active" id="infoRotatingSlide" style="display: none; z-index: 2000; position: absolute; right: 9px; top: 9px; width: 39px;"><button title="Information button" aria-label="Information" id="infoBtnRotating" class="active" role="button" aria-expanded="false" aria-haspopup="true"  tabindex="0" style="cursor: pointer;font-size: 15px;border: none;font-color: #000000;border-radius: 50%;background-color: white !important;height: 36px;width: 36px;" data-verbid="S-ABC" class="valid-activity"><img src="./media/accessibility.png" alt="" style="min-width: 27px;margin-top: 3px;" class="informationButtonImage"></img></button><div id="ui-tooltip-info" role="tooltip" aria-hidden="true" tabindex="-1" class="ui-tooltip ui-widget ui-corner-all ui-widget-content" style="top: 50px; right: 5px; display: none;"><div class="ui-tooltip-content">Information Button</div></div><div id="InfoContentRotating" class="tooltip_tools tooltip_wrap_inner" style="display: none;  position: absolute; width: 350px; height: 450px; border-radius:5px; padding:0 0 0 10px; overflow-y:scroll;"><div id="contentArea" class="InfoContentArea" style="font-family: Helvetica, Arial, sans-serif; padding: 15px;" aria-live="polite"><h2 style="text-align: center; text-decoration: underline;">Accessibility Instructions</h2>To attempt rotating slide using keyboard, follow these instructions.<ul class="instructionList"><li><br/>1. Use tab key/swipe horizontally(left to right) to navigate to the next item, use shift+tab/swipe horizontally(right to left) to navigate to the previous item.</li><li><br/>2. Use up or down key/double tap to select any option from the list on which your focus is currently.</li></ul></div></div></div>';

//ILIT-5334
var TRACK_EVENT = [
  //Library Tab
  {//0
    "c_s_NAME": "LibraryBook",
    "c_s_VERBID": "S-LBO"
  },
  {//1
    "c_s_NAME": "LibraryPopupButtonClick",
    "c_s_VERBID": "S-LPBC"
  },
  {//2
    "c_s_NAME": "LibraryViewChange",
    "c_s_VERBID": "S-LBVC"
  },
 //note-book
  {//3
    "Notebook" : {
      "noteBookOpen" : {
        "c_s_NAME": "noteBookOpen",
        "c_s_VERBID": "S-NTO",
      },
      "noteBookThumbPrintOpen" : {
        "c_s_NAME": "noteBookThumbPrintOpen",
        "c_s_VERBID": "S-NTO-TMP",
      },
      "noteBookClose" : {
        "c_s_NAME": "noteBookClose",
        "c_s_VERBID": "S-NBC" 
      },
      "Journal": {
        "c_s_NAME": "NoteBookJournalClick",
        "c_s_VERBID": "S-NTO-JO" 
      },
      "Wordbank":{
        "c_s_NAME": "NoteBookWordbankClick",
        "c_s_VERBID": "S-NTO-WBO" 
      },
      "Classnotes":{
        "c_s_NAME": "NoteBookClassnotesClick",
        "c_s_VERBID": "S-NTO-CNO" 
      }, 
      "Mywork":{
        "c_s_NAME": "NoteBookMyworkClick",
        "c_s_VERBID": "S-NTO-PO" 
      },
      "Resources":{
        "c_s_NAME": "NoteBookResourcesClick",
        "c_s_VERBID": "S-NBRC" 
      },
      "noteBookLeft" : {
        "c_s_NAME": "noteBookLeft",
        "c_s_VERBID": "S-NBLC" 
      },
      "noteBookRight" : {
        "c_s_NAME": "noteBookRight",
        "c_s_VERBID": "S-NBRC" 
      }
  }
},
  //connect tab
  {//4
    "connect" : {
      "connectTabRefresh":{
        "c_s_NAME": "connectTabRefresh",
        "c_s_VERBID": "S-NBBC" 
      }
    }
    
  },
  //Assignment Tab
  {//5
    "Assignment" : {
      "openAssignment":{
        "c_s_NAME": "openAssignment",
        "c_s_VERBID": "S-OA"
      },
      "paginationClick" : {
        "c_s_NAME": "paginationClick",
        "c_s_VERBID": "S-PC" 
      },
      "AssignmentButtonClick" : {
        "c_s_NAME": "AssignmentButtonClick",
        "c_s_VERBID": "S-ABC" 
      },
      "AssignmentClose":{
        "c_s_NAME": "AssignmentClose",
        "c_s_VERBID": "S-AC" 
      },
      "AssignmentCurrentBookOpen" : {
        "c_s_NAME": "AssignmentCurrentBookOpen",
        "c_s_VERBID": "S-ACCBO" 
      },
      "Typing" : {
        "c_s_NAME": "Typing",
        "c_s_VERBID": "S-AT" 
      },
      "SlideChange" : {
        "c_s_NAME": "SlideChange",
        "c_s_VERBID": "S-CH" 
      },
      "Videoplayed" : {
        "c_s_NAME": "Videoplayed",
        "c_s_VERBID": "S-VPLAY" 
      },
      "Audioplayed" : {
        "c_s_NAME": "Audioplayed",
        "c_s_VERBID": "S-APLAY" 
      },
      "AssignmentAnswerSelect" : {
        "c_s_NAME": "AssignmentAnswerSelect",
        "c_s_VERBID": "S-ASELECT" 
      },
      "DragAndDrop":{
        "c_s_NAME": "DragAndDrop",
        "c_s_VERBID": "S-DND" 
      },
      "Rotating":{
        "c_s_NAME": "Rotating",
        "c_s_VERBID": "S-RO" 
      },


    }
  },
  //e-book
  {//6
    "eBook":{
      "prevButton" :{
        "c_s_NAME": "prevButton",
        "c_s_VERBID": "S-PBC"
      },
      "nextButton" :{
        "c_s_NAME": "nextButton",
        "c_s_VERBID": "S-NBC"
      },
      "headerButton" :{
        "c_s_NAME": "headerButton",
        "c_s_VERBID": "S-HBC"
      },
      "textHelpButton" :{
        "c_s_NAME": "textHelpButton",
        "c_s_VERBID": "S-THBC"
      }
    }

  }
  


]

var TRACK_EVENT_INT = [
  {// 0 planner tab
    "planner" : {
      "suplimentLesson" : {
        "c_s_NAME": "suplimentLesson",
        "c_s_VERBID": "T-SL"
      },
      "grade" : {
        "c_s_NAME": "grade",
        "c_s_VERBID": "T-G"
      },
      "selectFromDropDown" : {
        "c_s_NAME": "selectFromDropDown",
        "c_s_VERBID": "T-SFDD"
      },
      "plannerButton" : {
        "c_s_NAME": "plannerButton",
        "c_s_VERBID": "T-PB"
      }
    }
  },
  {//1 library
    "library" : {
      "libraryBookChange" : {
        "c_s_NAME": "libraryBookChange",
        "c_s_VERBID": "T-LBC"
      }
    }
  },
  {//2 group
    "group" : {
      "groupButtonClick" : {
        "c_s_NAME": "groupButtonClick",
        "c_s_VERBID": "T-GBC"
      },
      "selectFromDropDown" : {
        "c_s_NAME": "selectFromDropDown",
        "c_s_VERBID": "T-SFDD"
      }
    }
  },
  {//3 lesson tab sourish
    "lesson" : {
      "LessonButtonClick" : {
        "c_s_NAME": "LessonButtonClick",
        "c_s_VERBID": "T-LEBC"
      }
    }
  },
  {//4 settings
    "settings" : {
      "settingsButtonClick" : {
        "c_s_NAME": "settingsButtonClick",
        "c_s_VERBID": "T-SBC"
      },
      "toggleButton" : {
        "c_s_NAME": "toggleButton",
        "c_s_VERBID": "T-TB"
      },
      "slideRead" : {
        "c_s_NAME": "slideRead",
        "c_s_VERBID": "T-SR"
      },
      "selectColor" : {
        "c_s_NAME": "selectColor",
        "c_s_VERBID": "T-SC"
      }
    }
  },
  {//5 lesson tab sourish
    "Performance" : {
      "PerformanceButtonClick" : {
        "c_s_NAME": "PerformanceButtonClick",
        "c_s_VERBID": "PE-BC"
      }
    }
  },
  {//6 Assignment tab sourish
    "Assignment" : {
      "AssignmentButtonClick" : {
        "c_s_NAME": "AssignmentButtonClick",
        "c_s_VERBID": "AE-BC"
      }
    }
  },
  {//7 Progress tab sourish
    "Progress" : {
      "ProgressButtonClick" : {
        "c_s_NAME": "ProgressButtonClick",
        "c_s_VERBID": "PR-BC"
      }
    }
  },
  {//8 organizer
    "organizer" : {
      "organizerClick" : {
        "c_s_NAME": "organizerClick",
        "c_s_VERBID": "T-OC"
      }
    }
  }
]

var GENERAL = {
  "c_i_SCREEN_METADATA_CALLTIME":3000,
  "c_i_SERVICE_RECALL_INTERVAL": 2000,
    "c_i_CHECK_RESPONSE_MAX_ATTEMPT":		5,
	"c_s_UNDER_CONSTRUCTION_TXT": 			"Under Construction.",
    "c_a_SPECIAL_CHARACTERS":				['.',';',',','!','?',':'],
	"c_s_SPECIAL_CHARACTERS_BLANK":			'',
	"c_s_CHARACTER_ZERO": 					'0',
    "c_a_SPECIAL_CHARACTERS_URI_ENCODE":	['%E2%80%9C','%E2%80%9D','%22'],
	"c_a_SPECIAL_WORDS":					['Dr.','U.S.','U.S.A.','Mr.','Mrs.'],
    "c_s_ALPHABET_ORDER":					['A','B','C','D','E'],
    "c_s_SMALL_ALPHABET_ORDER":				['(a)','(b)','(c)','(d)','(e)'],
	"c_s_PAGE_TYPE_LESSON":					"Lesson",
	"c_s_PAGE_TYPE_ASSIGNMENT":				"Assignment",
	"c_s_PAGE_TYPE_PLANNER":				"Planner",
	"c_s_PAGE_TYPE_ASSIGNMENT_GRID":		"Assignment_Instructor",
	"c_s_PAGE_TYPE_LIBRARY":				"Library",	
	"c_s_PAGE_TYPE_ASSIGNMENT_INSTRUCTOR":	"Assignment_Instructor",
	"c_s_PAGE_TYPE_ORGANIZER":				"Organizer",
	"c_s_PAGE_TYPE_INSTRUCTOR_MESSAGE":		"Instructor_Message",
	"c_s_CLASSROOM_CONFERENCE": 			"Class_Conference",
	"c_s_SMALL_GROUP_CONFERENCE" : 			"Small_Group_Conference",
	"c_s_PAGE_TYPE_EBOOK":					"Ebook",
	"c_s_PAGE_TYPE_NOTEBOOK":				"Notebook",
	"c_s_ASSIGNMENT_SLIDE_LOADED":			"AssignmentSlide",
	"c_s_DEFAULT_ANIMATE_TIME":				350,
	"c_a_SPECIAL_CHAR_HTML": ['&#8211;','&#8212;','&#161;','&#191;','&#8220;','&#8221;','&#39;','&#8216;','&#8217;','&#171;','&#187;','&#38;','&#162;','&#169;','&#247;','&#181;','&#183;','&#182;','&#177;','&#8364;','&#163;','&#174;','&#167;','&#153;','&#165;','&#225;','&#193;','&#224;','&#192;','&#226;','&#194;','&#229;','&#197;','&#227;','&#195;','&#228;', '&#196;', '&#230;', '&#198;', '&#231;', '&#199;', '&#233;', '&#201;', '&#232;', '&#200;','&#234;','&#202;','&#235;', '&#203;', '&#237;', '&#205;', '&#236;', '&#204;', '&#238;', '&#206;','&#239;', '&#207;', '&#241;', '&#209;', '&#243;', '&#211;', '&#242;', '&#210;', '&#244;', '&#212;', '&#180;', '&#96;', '&#255;', '&#220;', '&#252;', '&#219;', '&#251;', '&#217;', '&#249;', '&#218;', '&#250;', '&#223;', '&#214;', '&#246;', '&#213;', '&#245;'],
	"c_a_SPECIAL_CHAR_SYMBOL": ['–','—','¡','¿','“','”','\'','‘','’','«','»','&[^#]','¢','©','÷','µ','·','¶','±','€','£','®','§','™','¥','á', 'Á', 'à', 'À', 'â', 'Â', 'å', 'Å', 'ã', 'Ã', 'ä', 'Ä', 'æ', 'Æ', 'ç', 'Ç', 'é', 'É', 'è', 'È','ê', 'Ê', 'ë', 'Ë', 'í', 'Í', 'ì', 'Ì', 'î', 'Î', 'ï', 'Ï', 'ñ', 'Ñ', 'ó', 'Ó', 'ò', 'Ò', 'ô', 'Ô', '´', '`', 'ÿ', 'Ü', 'ü', 'Û', 'û', 'Ù', 'ù', 'Ú', 'ú', 'ß', 'Ö', 'ö', 'Õ', 'õ'],
	"c_s_TXT_SCORESUMMARY":					'scoresummary',
	"c_s_TXT_SCOREDETAILS":					'scoredetails',
	"c_i_ESSAY_CHAR_LIMIT":					1500,
	"c_i_PARA_CHAR_LIMIT":					1500,
	"c_i_DA_CHAR_LIMIT":					1500,
	"c_i_SUMMARY_CHAR_LIMIT":				1500,
	"c_i_READ_CRITICALLY_CHAR_LIMIT":		1500,
	"c_i_ESSAY_WHOLE_CHAR_LIMIT":			4500,
	"c_s_MAX_SIZE_EXCEED_MSSG":				"Oops, something is not right, try to shorten your writing and try again.",
	"c_s_MAX_SIZE_EXCEED_MSSG_INTRO":		"Oops, something is not right, try to shorten your writing in Intro and try again.",
	"c_s_MAX_SIZE_EXCEED_MSSG_BODY":		"Oops, something is not right, try to shorten your writing in Body and try again.",
	"c_s_MAX_SIZE_EXCEED_MSSG_CONCLUSION":	"Oops, something is not right, try to shorten your writing in Conclusion and try again.",
	"c_s_DATA_STRUCTURE_NOT_UPDATED":		"Data structure not updated.",
	
	"c_s_ILIT_20" : /^ilit20/,
	"c_s_PROD_TYPE_MYELD": "myeld",
	"c_s_PROD_TYPE_ILIT": "ilit",
	"c_s_PROD_TYPE_WTW": "wtw",
  "c_s_USER_TYPE_CO_TEACHER": "CT",
  "c_s_USER_ROLE_LEAD_TEACHER": "i",
	
	"c_s_GRADE_BOY": "boy",
	"c_s_GRADE_SCORE_LEVEL": 2.5,
	"c_a_SAVE_SERVICES": [
		"SaveAttemptDataForGradeableItem", 
		"paragraphfeedbackRequest", 
		"summaryFeedbackRequest", 
		"essayScoreRequest", 
		"essayFeedbackRequest",
	    "scoreSummaryRequest",
	    "GetGradebookForStudent",
	    "GetGradebookAttemptDataForStudApp"
	],
	"c_a_SAVE_SERVICES_SYNC": [
		"SaveNote",
		"SaveLibraryProgress"
	],
	"c_s_OFFLINE_ERROR":"You are currently offline!",
	"C_S_RETRY_BUTTON_TEXT" : "Retry",
	"c_s_WTW_GRADE_CODE" : "wtwg4",
	"c_s_NO_INTERNET_MSG" :  "Your device appears to have lost internet connection. Notify your teacher because data may be lost. Please wait while your device attempts to reconnect."
};


var KEYCODE = {
  "c_s_SPACEBAR" : "32",
  "c_s_TAB" : "9",
  "c_s_RIGHT_ARROW" : "39",
  "c_s_LEFT_ARROW" : "37",
  "c_s_BACKSPACE" : "8"
}

var ARIA_LABEL_TEXT = {
  "c_s_left_col_selected" : "left pannel selected",
  "c_s_right_col_selected" : "right pannel selected",
  "c_s_right_col_focus" : " the focus is on right pannel"
}

var NETWORK_ERR_CODES = {
	"c_i_CODE_09":	"N1009"
};

var NETWORK_ERR_DESC = {	
	"N1009":	"You have lost your Internet connection. Please notify your teacher."
}

var ABBREVIATION = {
    "ASGMT": "assignment",
    "AST": "assessment",
    "GRA": "grade",
    "assignment": "ASGMT",
    "assessment": "AST",
    "grade": "GRA"
};


var VIEWTYPE = {
    "c_s_PLANNER": "planner",
    "c_s_PLANNER_UNIT": "unit",
    "c_s_PLANNER_WEEK": "week",
    "c_s_PLANNER_YEAR": "year",
    "c_s_CAROUSEL": "studentCarousel",
    "c_s_LIBRARYHEADER": "libraryHeader",
    "c_s_LISTVIEW": "studentList",
    "c_s_BOOKPOPUPVIEW": "bookPopup",
    "c_s_ASSIGNMENT_TOC": "assignment_toc",
    "c_s_ASSIGNMENT_SLIDES": "assignment_slides",
    "c_s_LESSON": "lesson",
    "c_s_ASSIGNMENT_GRID": "assignment_grid",
    "c_s_ASSIGNMENT_INSTRUCTOR": "assignment_instructor",
    "c_s_INSTRUCTOR_MESSAGE": "instructor_message",
    "c_s_NOTEBOOK": "notebook",
    "c_s_NOTEBOOK_TABS": "notebook_tabs",
    "c_s_PERFORMANCE": "performance",
    "c_s_CLASSROOM_CONFERENCE": "class_conference",
    "c_s_SMALLGROUP_CONFERENCE": "small_group_conference",
    "c_s_CONNECT": "connect",
    "c_s_STUDENT_CONNECT": "student_connect",
	"c_s_TEACHER_SNAPSHOT" : "teacher_snapshot"
};
var PLANNER = {
    "c_s_STUDENT_OBJECTIVES": "STUDENT OBJECTIVES",
    "c_s_LESSON_OVERVIEW": "LESSON OVERVIEW",
    "c_s_COMMON_CORE_STATE_STANDARDS": "STANDARDS",
    "c_s_WEEK_TXT": "Week",
    "c_s_LESSONS_TXT": "Lessons",
    "c_s_SUPPLEMENTAL_LESSONS_TXT": "Supplemental Lessons",
    "c_s_LESSON_TXT": "Lesson",
    "c_s_LESSON_NOT_FOUND_TXT": "Lesson not found.",
    "c_s_UNIT_BTTN": "Unit",
    "c_s_LESSON_BTTN": "Lesson",
    "c_s_EMAIL_BTTN": "Email",
    "c_s_PRINT_BTTN": "Print",
    "c_s_TEACH_BTTN": "TEACH",
    "c_s_DID_YOU_KNOW": "Did You Know?",
    "c_s_APP_UPDATE": "App Update",
    "c_s_OVERVIEW_RATA": "RATA",
    "c_s_ALL_TXT": "All",
    "c_s_UNITS_TXT": "Units",
    "c_s_OVERVIEW_TXT": "OVERVIEW",
    "c_s_TXT_TEXT_TO_READ": "TEXT TO READ",
    "c_a_SL_TYPE_TXT": {
        "bookclub": "Book Club",
        "phonologicalawareness": "Phonological Awareness",
        /* "supplementalrata":"Supplemental RATA", */
        "supplementalrata": "Read Aloud",
        "routinecards": "Routine Cards"
    },
};


var ASSIGNMENTS = {
    "c_s_TOC_CONTAINER": "toc_container",
    "c_s_TOC_INNER_CONTAINER": "toc_inner_container",
    "c_s_SLIDE_CONTAINER": "slide_container",
    "c_s_SLIDE_INNER_CONTAINER": "slide_inner_container",
    "c_s_PREV": "assignmentPrev",
    "c_s_NEXT": "assignmentNext",
    "c_s_AUDIO": "btn-show-audio",
    "c_s_SHOW_COMMENT": "btn-show-comment",
    "c_s_COMMENT_BUTTON_CLASS": "comment_message",
    "c_s_HEADER": "headerTitle",
    "c_s_TOC_BLANK_MSG": "Nothing is assigned to you by your Teacher. <br />Please come back later.",
    "c_s_BOOK_ICON": "bookicon",
    "c_s_KEY_QUESTION_ID": "questionId",
    "c_s_KEY_SCORE": "score",
    "c_s_KEY_QUESTION_ID_4M_CMS": "question_id",
    // Audio Button Constants
    "c_s_AUDIO_PLAYER_ID": "audioPlayer",
    "c_s_AUDIO_PLAY_BTN_CLASS": "audio_play_btn",
    "c_s_AUDIO_PAUSE_BTN_CLASS": "audio_pause_btn",
    //TOC
    "c_s_ASSIGN_TEMPLATE_TOC": "assignTOCTemplate",
    "c_s_TOC_KEYS_TYPE": "type",
    "c_s_TOC_SLIDE_MAX_SCORE": "maxScore",
    "c_s_TOC_ITEM_ASSIGNED_DATE": "ItemAssignedDate",
    "c_s_TOC_ITEM_NAME": "ItemName",
    "c_s_TOC_KEYS_DISPLAYNAME": "title",
    "c_s_TOC_TITLE": "Table Of Contents",
    "c_s_USER_TYPE_INSTRUCTOR": "instructor",
    "c_s_USER_TYPE_STUDENT": "student",
    "c_s_ASSIGNMENT": "assignment",
    "c_s_ASSESSMENT": "assessment",
    "c_s_SHOW_COMMENT_DELAY": 3000,
    "c_s_ASSIGNMENT_DAILY_ASSIGNMENT": "dailyassignment",
    "c_s_ASSIGNMENT_DAILY_ASSIGNMENT_UPDATED": "dailyassignmentupdated",
    "c_s_ASSIGNMENT_DAYS": "days",
    "c_s_ASSIGNMENT_INTERACTIVE_SORT": "interactive_sort",
    "c_s_ASSIGNMENT_IWTS": "iwt",
    "c_s_ASSIGNMENT_PARAGRAPH": "paragraph",
    "c_s_ASSIGNMENT_ESSAY": "essay",
    "c_s_ASSIGNMENT_STUDY_PLANS": "studyplan",
    "c_s_ASSIGNMENT_STUDYPLAN": "studyplan",
    "c_s_ASSIGNMENT_WORD_SLAM": "word_slam",
	"c_s_ASSIGNMENT_WORD_THEIR_WAY": "interactive_sort",
    "c_s_ASSIGNMENT_SLIDES_KEY": "slides",
    "c_s_ASSIGNMENT_PARTS_KEY": "Parts",
    "c_s_ASSIGNMENT_PARTS_KEY_S": "parts",
    "c_s_ASSIGNMENT_QUESTION_ID_KEY": "question_id",
    "c_s_ASSIGNMENT_PROMPT_ID_KEY": "promptID",
    "c_s_ASSIGNMENT_PROMPT_ID_NO_SCORE": "PEARSON",
    "c_s_ASSIGNMENT_ROTATING_LISTS": "rotatinglists",
    "c_s_ASSIGNMENT_NS_ASSIGNMENT": "nsa",
    "c_s_UNIT_NUMBER": 1,
    "c_s_WEEK_NUMBER": 3,
    // Assgnment Sliding i.e. idangerours/Parallelex
    "c_s_ASSIGNMENT_PARALLELEX_SLLIDING": "Parallelex",
    "c_s_ASSIGNMENT_IDANGEROUS_SLLIDING": "Idangerous",
    // Assignment Template Type
    "c_s_TYPE_TPL_FILLABLEWORKSHEET": "fillableworksheet",
    "c_s_TYPE_TPL_NSA_FILLABLEWORKSHEET": "nsa_fillableworksheet",
    "c_s_TYPE_TPL_NEW_FILLABLEWORKSHEET": "fillableworksheet",
    "c_s_TYPE_TPL_IWTSUMMARYSLIDE": "iwtsummaryslide",
    "c_s_TYPE_TPL_IWTTEXTANSWERSLIDE": "iwttextanswerslide",
    "c_s_TYPE_TPL_IWTDNDSLIDE": "iwtdndslide",
    "c_s_TYPE_TPL_IWTHIGHLIGHTSLIDE": "iwthighlightslide",
    "c_s_TYPE_TPL_PARAGRAPH": "paragraph",
    "c_s_TYPE_TPL_ESSAY": "essay",
    "c_s_TYPE_TPL_PARAGRAPH_SLIDE": "paragraphslide",
    "c_s_TYPE_TPL_ESSAY_SLIDE": "essayslide",
    "c_s_TYPE_TPL_STUDY_PLAN_PRE_POST_SLIDE": "study_plan_pre_post_template",
    "c_s_TYPE_TPL_PHONICTEXTBASEDSLIDE": "phonictextbasedslide",
    "c_s_TYPE_TPL_EXTENDEDPHONIC": "extendedphonic",
    "c_s_TYPE_TPL_PLURALNOUNS": "pluralnouns",
    "c_s_TYPE_TPL_DIGRAPHS": "digraphs",
    "c_s_TYPE_TPL_WORD_FAMILIES": "word_families",
    "c_s_TYPE_TPL_SYLLABLES": "syllables",
    "c_s_TYPE_TPL_WORD_SORT": "word_sort",
    "c_s_TYPE_TPL_WORD_SLAM": "word_slam",
	 "c_s_TYPE_TPL_WORD_THEIR_WAY": "interactive_sort",
    "c_s_TYPE_TPL_ROTATING_LISTS": "rotatinglists",
    "c_s_TYPE_TPL_FRS": "frs",
    "c_s_TYPE_NON_FRS": "non-frs",
    "c_s_TYPE_TPL_STUDY_PLAN_PRACTICE_HEADER": "studyPlan_practice_header_tpl",
    "c_s_TYPE_CONTAINER_STUDY_PLAN_PRACTICE_HEADER": "studyPlan_practice_header_container",
    "c_s_TYPE_TPL_STUDY_PLAN_PRACTICE_MCQ_QUESTION": "studyPlan_practice_mcq_question_tpl",
    "c_s_TYPE_TPL_STUDY_PLAN_PRACTICE_POPUP": "studyPlan_practice_popup_tpl",
    "c_s_TYPE_TPL_STUDY_PLAN_PRACTICE_VIDEO": "studyPlan_practice_video_tpl",
    "c_s_TYPE_TPL_WORD_STUDY_PRACTICE_VIDEO": "word_study_practice_video_tpl",
    "c_s_TYPE_TPL_FRS_VIDEO": "frs_video_tpl",
    "c_s_TYPE_TPL_STUDY_PLAN_PRACTICE_MASTER": "studyPlan_practice_master_tpl",
    "c_s_TYPE_TPL_FRS_MASTER": "frs_master_tpl",
    "c_s_TYPE_TPL_STUDY_PLAN_PRACTICE_EXAMPLE_TXT": "examples",
    "c_s_TYPE_TPL_STUDY_PLAN_PRACTICE_DONE_TXT": "DONE",
    "c_s_TYPE_TPL_MULTIPLE_CHOICE_SLIDE": "multiplechoiceslide",
    "c_s_TYPE_TPL_MULTI_CHOICE_PASSAGES_SLIDE": "multichoicepassageslide",
	"c_s_TYPE_TPL_TEXT_SLIDE": "textslide",
	"c_s_TYPE_TPL_PROJECTOR_SLIDE": "projectorslide",
    "c_s_ASSIGNMENT_SLIDE_BACKGROUND_SOURCE_PATH": "grade8_iwts/image/",
    "c_s_SLIDE_SUBMIT_BTN_CNT_CHK_ATTR": "submit-counter-check",
    "c_s_ASSIGNMENT_ACTIVE_SLIDE": "swiper-slide-visible",
    //Type In
    "c_s_ASSIGN_TEMPLATE_TYPEIN": "typeinTemplate",
    "c_s_ASSIGN_TYPEIN_ELEM_SUBMITBTNID": "btnSubmit",
    "c_s_ASSIGN_TYPEIN_ELEM_FINISHBTNID": "btnFinish",
    "c_s_ASSIGN_TYPEIN_ELEM_PRINTBTNID": "btnPrint",
    "c_s_ASSIGN_TYPEIN_ELEM_TYPEAREA": "textTypeArea",
    "c_s_ASSIGN_TYPEIN_ELEM_INPUTBTNID": "btnInput",
    "c_s_ASSIGN_TYPEIN_SUCCESS_MSG": "Input Submitted Successfully.",
    "c_s_ASSIGN_IWT_TXT_ANSWER_SUBMIT_BTN_SELECTOR": "txtAnswerSubmitBtn",
    "c_s_TYPEIN_ANSWER_SUBMIT_CONTAINER_SELECTOR": "divTypeInAnswer",
    "c_s_ASSIGN_NSA_SUCCESS_MSG": "You have finished this assignment successfully.",
    "c_s_ASSIGN_NO_NOTES_MSG": "No Notes Saved!",
    //Highlight
    "c_s_ASSIGN_READ_CHKPNT_BTN_SELECTOR": "readChkPointBtn",
    "c_s_ASSIGN_SUMMARY_ELEM_TYPEAREA": "txtSummary",
    //IWTS Summary View
    "c_s_INSTRUCTION_TAB_TITLE": "Instruction",
    "c_s_FEEDBACK_TAB_TITLE": "Feedback",
    "c_s_INSTRUCTION_TABID": "instruction_tab",
    "c_s_FEEDBACK_TABID": "feedback_tab",
    "c_s_ASSIGN_SUMMARY_PRINT_BTN_ID": "btnprint_summary",
    "c_s_ASSIGN_SUMMARY_EMAIL_BTN_ID": "btnemail_summary",
    // Constants for Drag and Drop
    "c_s_DND_CONTINENT_CONTAINER": "continent_conts",
    "c_s_DND_DRAGGABLE_BOX_CONTAINER": "draggable_area",
    "c_s_DND_DROP_BOX_CONTAINER": "dropbox",
    "c_s_DND_SUBMIT_BTN": "dndSubmitButton",
    "c_s_DND_SUBMIT_COUNTER_CHECK": 0,
    "c_s_DND_DROP_BOX_FAIL_AGAIN_TXT": "dropbox_fail_again_text",
    "c_s_DND_DROP_BOX_FAIL_TXT": "dropbox_fail_text",
    "c_s_DND_DROP_BOX_PASS_TXT": "dropbox_pass_text",
    "c_s_DND_DROP_BOX_INSTRUCTION_TXT": "dropbox_instrction",
    "c_s_DND_DRAG_TXT_AREA_CONTAINER": "drag_text_area_container",
    "c_s_DND_DROPPABLE_DEFAULT_TEXT": "Drag Word Here",
    "c_s_SLIDE_SUBMIT_BTN_CORRECT_ANS_IDX": "correct-answer-index",
    "c_s_DND_FIRST_TRIAL_SCORE": "2",
    "c_s_DND_SECOND_TRIAL_SCORE": "1.5",
    // Constants for highlightSlide
    "c_s_RANGY_SELECTION_BOX": "rangySelection",
    "c_s_RANGY_REDMARKAR": "redMarkar",
    "c_s_RANGY_YELLOWMARKAR": "yellowMarkar",
    "c_s_RANGY_ERASER": "markarEraser",
    "c_s_RANGY_YELLOW_COLOR": "yellow",
    "c_s_RANGY_YELLOW_MARKER": "yellowMarkar",
    "c_s_RANGY_RED_COLOR": "red",
    "c_s_HIGHLIGHT_SUBMIT_BTN_SELECTOR": "highlightSubmitButton",
    "c_s_RANGY_RED_MARKER": "redMarkar",
    "c_s_HIGHLIGHT_FIRST_TRIAL_SCORE": "2",
    "c_s_HIGHLIGHT_SECOND_TRIAL_SCORE": "1.5",
    "c_s_SUBMIT_ANSWER_BTTN": "Submit Answer",
    "c_s_SAVE_N_CONT_BTTN": "Save & Continue",
	"c_s_SUBMIT_IWT_BTTN": "Submit",
    "c_s_BTN_STUDY_PLAN_SUBMIT_ANSWER_ID": "btnSubmitStudyPlan",
    "c_s_DIV_STUDY_PLAN_SHOW_SCORE_ID": "status-bar",
    "c_s_SUBMIT_TEST_BTTN": "Submit Test",
    "c_s_SUBMIT_TEST_BTTN_ID": "submit_assessment",
    "c_s_VIEW_UNATTEMPTED_ASSIGNMENT_BTTN": "View Unanswered", //CLAS-99
    "c_s_VIEW_UNATTEMPTED_ASSIGNMENT_BTTN_ID": "viewUnattempted", //CLAS-99
    "c_s_ENTER_CORRECT_ANSWER_TXT": "Enter number of correct answers",
    "c_s_OUT_OF_SCORE": "out of ",
    "c_s_VIEW_ASSESSMENT_ANSWERS_BTTN_ID": "view_all_answers",
    "c_s_VIEW_ASSESSMENT_SKILLS_BTTN_ID": "view_all_skills",
    "c_s_PRINT_BTTN": "Print",
    "c_s_VISUALIZE_TXT": "Visualize",
    "c_s_HEADER_RESPONSE_TXT": "Enter your responses. Be sure to number them.",
    "c_s_SUBMIT_SUMMARY_BTTN": "Submit Summary",
    "c_s_EMAIL_BTTN": "Email",
    "c_s_INPUT_ANSWER_BTTN" : "Input Answers",
    "c_s_READ_CHECKPOINT_BTN_TXT": "Reading Checkpoint",
    "c_s_EMAIL_PARAGRAPH_BTTN": "Email Paragraph",
    "c_s_PRINT_ASSIGNMENT_BTTN": "Print Assignment",
    "c_s_SUBMIT_GRADING_BTTN": "Submit for Grading",
    "c_s_PARAGRAPF_FEEDBACK_TXT": "<p>Tap the Get Feedback button to get feedback on your writing.</p>",
    "c_s_PARAGRAPH_PROMPT_HEADING": "Prompt",
    "c_s_ASSIGNMENT_PRE_BTTN": "Pre-Test",
    "c_s_ASSIGNMENT_PRACTICE_BTTN": "Practice",
    "c_s_ASSIGNMENT_POST_BTTN": "Post-Test",
    "c_s_ASSIGNMENT_PRETEST_TYPE": "pretest",
    "c_s_ASSIGNMENT_PRACTICE_TYPE": "practice",
    "c_s_ASSIGNMENT_POSTTEST_TYPE": "posttest",
    "c_s_SUBMIT_ANSWERS_BTTN": "Submit Answers",
    "c_s_SHOW_ANSWER_TXT": "Show Answer",
    "c_s_HIDE_ANSWER_TXT": "Hide Answer",
    "c_s_THE_ANSWER_IS_TXT": "The answer is:",
    "c_s_COMPLETED_STATUS": 1,
    "c_s_INCOMPLETED_STATUS": 0,
    "c_s_SAVE_ERROR_MESSAGE_TXT": "There is an error saving. Please try once more...",
    "c_s_PRETEST_COMPLETED_STATUS": "You have completed the pre-test.",
    "c_s_POSTTEST_COMPLETED_STATUS": "You have completed the post-test.",
    "c_s_ASSESSMENT_COMPLETED_STATUS": "You have completed the assessment.",
    "c_s_OUT_OF_TXT": "/",
    "c_s_DONE_CLASS": "done",
    "c_s_SAVE_AND_EXIT_CLASS": "save-exit", // IPP-5155


    // Summary slide feedback screen
    "c_s_FEEDBACK_SECTION_TXT": "Section",
    "c_s_FEEDBACK_TXT_BEFORE_TAB": "<p>Tap the Get Feedback button to get feedback on your writing.</p>",
    "c_s_FEEDBACK_WORK_TXT_FIRST": "Repeated Ideas",
    "c_s_UNRELATED_IDEAS_TXT": "Unrelated Ideas",
    "c_s_COPYING_TXT": "Copying",
    "c_s_FEEDBACK_WORK_TXT_FRTH": "Spelling",
    "c_s_REDUNDANCY_HIGHLIGHT": "yellow",
    "c_s_SPELLING_HIGHLIGHT": "red",
    "c_s_COPYING_HIGHLIGHT": "blue",
    "c_s_IRRELEVANT_HIGHLIGHT": "orange",
    "c_a_HIGHLIGHT_COLOR": ['yellow', 'orange', 'red', 'green', 'blue'],
    "c_s_SUBMIT_SUCCESS_MSG": "<p>Successfully submitted!</p>",
    // Paragraph slide feedback screen
    "c_s_TOPIC_FOCUS_TXT": "Topic Focus",
    "c_s_FEEDBACK_GOOD": "good",
    "c_s_FEEDBACK_FAIR": "fair",
    "c_s_FEEDBACK_POOR": "poor",
    "c_s_FEEDBACK_FEW_SENTENCES": "tooFewSentences",
    "c_s_TOPIC_DEV_TXT": "Topic Development",
    "c_s_FEEDBACK_FEW_IDEAS": "tooFewIdeas",
    "c_s_FEEDBACK_MANY_IDEAS": "tooManyIdeas",
    "c_s_FEEDBACK_RIGHT_IDEAS": "rightNumberOfIdeas",
    "c_s_FEEDBACK_ORGANIZATION": "Organization",
    "c_s_LENGTH_TXT": "Length",
    "c_s_BEGINNING_TXT": "Beginnings",
    "c_s_STRUCTURE_TXT": "Structure",
    "c_s_FEEDBACK_GOOD_VARIETY": "goodVariety",
    "c_s_FEEDBACK_POOR_VARIETY": "poorVariety",
    "c_s_CHECK_WORK_TXT" : "Check Your Work",
            "c_s_NO_MISTAKES_TXT": "No Mistakes",
    "c_s_VAGUE_ADJECTIVE": "Vague Adjectives",
    "c_s_REPEATED_WORDS": "Repeated Words",
    "c_s_PRONOUNS": "Pronouns / Antecedents",
    "c_s_SPELLING_TXT": "Spelling",
    "c_s_GRAMMAR_TXT": "Grammar",
    "c_s_REPEATED_IDEAS_TXT": "Repeated Ideas",
    "c_s_EDITING_TOOL_TXT": "Editing Tools",
    "c_s_WORD_CHOICE_TXT": "Word Choice",
    "c_s_SENTENCE_VARIETY_TXT": "Sentence Variety",
    "c_s_PARAGRAPH_TXT": "Paragraph",
    "c_s_FEEDBACK_FEW_SENTENCES_LBL" : "Too Few Sentences",
            "c_s_CONTENT_TEXT_LONG": "Your  summary / essay / writing does not meet the maximum length criteria. Your work has been saved. Please revise your writing to meet the maximum length and try again.",
    "c_s_CONTENT_TEXT_SHORT": "Your  summary / essay / writing does not meet the minimum length criteria. Your work has been saved. Please revise your writing to meet the minimum length and try again.",
    "c_s_CONTENT_TEXT_REPEAT": "Your essay cannot be graded because it contains too many repeated words or sentences. Your work has been saved. Please revise your writing so that it does not contain the same pattern of words or sentences.",
    "c_s_CONTENT_TEXT_CAPITAL": "<p>This writing cannot be graded due to an issue in your writing.</p><p>Please verify that your writing is not composed of just CAPITAL letters only. Your work has been saved. Please revise your writing so that it does not contain capital letters only.</p>",
    "c_s_CONTENT_TEXT_UNIQUE": "<p>This paragraph cannot be graded due to an issue in your writing. Please verify that your writing contains complete sentences, your paragraph is related to the topic and your paragraph does not contain unusual language.</p><p>It is also possible that your writing cannot be graded because it is highly creative or original. Please revise your work and try again.</p><p>If you continue to have this problem, please contact your teacher.</p>",
    "c_s_CONTENT_TEXT_UNUSUAL": "<p>This paragraph cannot be graded due to an issue in your writing. Please verify that your writing contains complete sentences, your paragraph is related to the topic and your paragraph does not contain unusual language.</p><p> It is also possible that your writing cannot be graded because it is highly creative or original. Please revise your work and try again.</p><p>If you continue to have this problem, please contact your teacher.</p>",
    "c_s_TRY_AGAIN_ALERT": "Your writing could not be graded, please change your work and click \"Get Feedback\".",
    "c_a_PARAGRAPH_FEEDBACK_ARRAY": ['repeatedWordsFeedback', 'vagueAdjectivesFeedback', 'pronounsFeedback', 'sentences', 'ideasFeedback', 'sentenceStructureFeedback', 'sentenceBeginningsFeedback', 'sentenceLengthFeedback', 'transitionsFeedback', 'supportForTopicFeedback', 'grammarFeedback', 'redundancyFeedback', 'spellingFeedback', 'paragraph'],
    // Essay View
    "c_s_TAB_INTRO_LABEL": "Intro",
    "c_s_TAB_BODY_LABEL": "Body",
    "c_s_TAB_CONCLUSION_LABEL": "Conclusion",
    "c_s_TAB_WHOLE_LABEL": "Whole Essay",
    "c_s_TRAITS_TXT": "Traits",
    //Practice
    "c_s_CSS_NOT_COMPLETED": "practiceMcqNotCompleted",
    //Phonic
    "c_s_SUBMIT_BTTN": "Submit",
    "c_s_SLIDE_TYPE_COMPREHENSION": "comprehension",
    "c_s_SLIDE_TYPE_PRACTICE": "practice",
    "c_s_SLIDE_TYPE_ORALFLUENCY": "oralfluency",
    "c_s_DROP_LABEL": "Drop Here",
    "c_s_GET_FEEDBACK_BTTN": "Get Feedback",
    "c_s_PROMPT_ID": "406.1",
    // FRS
    "c_s_FRS_SLIDE_MAX_SCORE": "maxScore",
    // Plural Nouns
    "c_s_PLURAL_NOUN_DROP_LABEL": "Drop Here",
    "c_s_DIV_PLURAL_NOUN_SHOW_SCORE_ID": "status-bar",
    "c_s_BTN_PLURAL_NOUN_SUBMIT_ANSWER_ID": "btnPluralNounSubmit",
    "c_s_PLURAL_NOUNS_COMPLETED_STATUS": "You've successfully completed %s",
	"c_s_BTN_LBL_NEXT": "Next",
	"c_s_BTN_LBL_SCORE": "Score",
    // Digraph
    "c_s_DIGRAPH_DROP_LABEL": "Drop Here",
    "c_s_DIV_DIGRAPH_SHOW_SCORE_ID": "status-bar",
    "c_s_BTN_DIGRAPH_SUBMIT_ANSWER_ID": "btnDigraphSubmit",
    "c_s_DIGRAPH_COMPLETED_STATUS": "You've successfully completed %s",
    // Word Families
    "c_s_WORD_FAMILIES_DROP_LABEL": "Drop Here",
    "c_s_DIV_WORD_FAMILIES_SHOW_SCORE_ID": "status-bar",
    "c_s_BTN_WORD_FAMILIES_SUBMIT_ANSWER_ID": "btnWordFamiliesSubmit",
    "c_s_WORD_FAMILIES_COMPLETED_STATUS": "You've successfully completed %s",
    "c_s_SUCCESS_COMPLETED_STATUS": "Successfully completed",
    "c_s_DIV_CORRECTED_ANSWERS_CONTAINER_ID": "word-families-result",
    // Syllables
    "c_s_SYLLABLES_DROP_LABEL": "Drop Here",
    "c_s_DIV_SYLLABLES_SHOW_SCORE_ID": "status-bar",
    "c_s_BTN_SYLLABLES_SUBMIT_ANSWER_ID": "btnSyllablesSubmit",
    "c_s_SYLLABLES_COMPLETED_STATUS": "You've successfully completed %s",
    // Word Sort
    "c_s_WORD_SORT_DROP_LABEL": "Drop Here",
    "c_s_DIV_WORD_SORT_SHOW_SCORE_ID": "status-bar",
    "c_s_BTN_WORD_SORT_SUBMIT_ANSWER_ID": "btnWordSortSubmit",
    "c_s_WORD_SORT_COMPLETED_STATUS": "You've successfully completed %s",
    // Word Slam
    "c_s_WORD_SLAM_DROP_LABEL": "Drop Here",
    "c_s_BTN_WORD_SLAM_SUBMIT_ANSWER_ID": "btnWordSlamSubmit",
    "c_s_WORD_SLAM_COMPLETED_STATUS": "You've successfully completed %s",
    "c_s_DIV_WORD_SLAM_SHOW_HINT_CONTAINER_ID": "div-word-slam-show-hint-container",
    "c_s_DIV_WORD_SLAM_SHOW_HINT_ID": "divWordSlamShowHint",
    "c_s_SHOW_HINT": "btnShowHint",
    "c_s_HINT_BUTTON_CLASS": "tocicons",
    // New Fillable Worksheet
    "c_s_STEM_TAG": "Stem",
    "c_s_DIRECTION_TAG": "direction",
    "c_s_QUESTION_TAG": "questions",
    "c_s_QTEXT_TAG": "qtext",
    "c_s_STEM_START": "STEMSTARTSHERE",
    "c_s_STEM_END": "STEMENDSHERE",
    "c_s_DIRECTION_START": "DIRECTIONSTARTSHERE",
    "c_s_DIRECTION_END": "DIRECTIONENDSHERE",
    "c_s_QUESTION_START": "QUESTIONSTARTSHERE",
    "c_s_QUESTION_END": "QUESTIONENDSHERE",
    "c_s_QTEXT_START": "SUBSECTION",
    "c_s_QTEXT_END": "SUBSECTIONENDS",
    "c_s_SUBMIT_SUCCESS": "Submitted Successfully!",
    // Rotating Lists
    "c_s_BTN_ROTATING_SUBMIT_ANSWER_ID": "btnRotatingSubmit",
    // Assessment
    "c_s_ASSESSMENT_PART": "Part",
            "c_s_ASSESSMENT_SUBTYPE_GRADE": "grade",
    "c_s_ASSESSMENT_SUBTYPE_UNITBENCHMARK": "unitbenchmark", // IPP-2701
    "c_s_ASSESSMENT_SUBTYPE_BENCHMARK": "benchmark",
            "c_s_ASSESSMENT_COMPLETED_STATUS_FOR_VIEW": "The assessment is completed.",
            "c_s_ASSESSMENT_NOTATTEMPTEDALL_TITLE": "Submit?",
    "c_s_ASSESSMENT_NOTATTEMPTEDALL_BODY": "All questions were not attempted. Are you sure that you want to submit?",
    "c_s_ASSESSMENT_SUBTYPE_WRC": "wrc",
    // Grade Assessment: Score Components [Rows]
    "c_s_ASSESSMENT_SENTENCE_COMPREHENSION": "grade-assessment-sentence-comprehension",
    "c_s_ASSESSMENT_PASSAGE_COMPREHENSION": "grade-assessment-passage-comprehension",
    "c_s_ASSESSMENT_COMPREHENSION_COMPOSITE": "grade-assessment-comprehension-composite",
    "c_s_ASSESSMENT_VOCABULARY": "grade-assessment-vocabulary",
    "c_s_ASSESSMENT_TOTAL_TEST": "grade-assessment-total-test",
    "c_s_ASSESSMENT_LISTENING_COMPREHENSION": "grade-assessment-listening-comprehension",
    // Grade Assessment: Score Components [Columns]
    "c_s_ASSESSMENT_RAW_SCORE": "grade-assessment-raw-score",
    "c_s_ASSESSMENT_STANINE": "grade-assessment-stanine-score",
    "c_s_ASSESSMENT_PERCENTILE": "grade-assessment-percentile-score",
    "c_s_ASSESSMENT_GRADE_EQUIVALENT": "grade-assessment-grade-equivalent-score",
    "c_s_ASSESSMENT_STANDARD_SCORE": "grade-assessment-standard-score",
    "c_s_ASSESSMENT_NORMAL_CURVE_EQUIVALENT": "grade-assessment-normal-curve-equivalent",
    "c_s_ASSESSMENT_GROWTH_SCALE_VALUE": "grade-assessment-growth-scale-value",
    /* 
     // Grade Assessment: Score Components [Rows]
     "c_s_ASSESSMENT_SENTENCE_COMPREHENSION": "ga-sentence-comprehension",
     "c_s_ASSESSMENT_PASSAGE_COMPREHENSION": "ga-passage-comprehension",
     "c_s_ASSESSMENT_COMPREHENSION_COMPOSITE": "ga-comprehension-composite",
     "c_s_ASSESSMENT_VOCABULARY": "ga-vocabulary",
     "c_s_ASSESSMENT_TOTAL_TEST": "ga-total-test",
     "c_s_ASSESSMENT_LISTENING_COMPREHENSION": "ga-listening-comprehension",
     // Grade Assessment: Score Components [Columns]
     "c_s_ASSESSMENT_RAW_SCORE": "ga-raw-score",
     "c_s_ASSESSMENT_STANINE": "ga-stanine-score",
     "c_s_ASSESSMENT_PERCENTILE": "ga-percentile-score",
     "c_s_ASSESSMENT_GRADE_EQUIVALENT": "ga-grade-equivalent-score",
     "c_s_ASSESSMENT_STANDARD_SCORE": "ga-standard-score",
     "c_s_ASSESSMENT_NORMAL_CURVE_EQUIVALENT": "ga-normal-curve-equivalent",
     "c_s_ASSESSMENT_GROWTH_SCALE_VALUE": "ga-growth-scale-value",
     */
    // Grade Assessment: Sessions
    "c_s_ASSESSMENT_SESSION_FALL": "fall",
    "c_s_ASSESSMENT_SESSION_SPRING": "spring",
    // Grade Assessment: Forms
    "c_s_ASSESSMENT_FORM_A": "form-a",
    "c_s_ASSESSMENT_FORM_B": "form-b",
    // Grade Assessment: Version
    "c_s_ASSESSMENT_VERSION": "version",
    "c_s_ASSESSMENT_CURRENT_VERSION": "1",
    "c_s_CONFIRM_SUBMIT_MSG": "Are you sure you want to submit?",
    "c_s_CONFIRM_RECORD_MSG": "Are you sure you want to re-record?",
    "c_s_CONFIRM_AUDIO_SAVED_MSG": "Your recording has not been saved, you will lose it if you leave the assignment. Are you sure you want to continue?",
    "c_s_CONFIRM_AUTOMATIC_STOP_MSG": "You can only record for 2 minutes. If you are not happy with your response, try recording again.",
    "c_s_CONFIRM_AUTOMATIC_STOP_MSG_EARLY": "You can only record for 2 minutes. If you are not happy with your response, try recording again.",
    "c_s_SUMMARY_SCORED_MSG": "Your summary has been scored. You may proceed to the next page.",
    "c_s_PARA_SCORED_MSG": "Your paragraph has been scored.",
    "c_s_ESSAY_SCORED_MSG": "Your essay has been scored.",
    "c_s_SERVICE_ERROR_TEXT": "An error has occurred. Please try again.",
    "c_s_SERVICE_UNAVAILABLE": "serviceUnavailable",
    "c_s_SERVICE_UNAVAILABLE_MSG": "Service is Unavailable. Please try again.",
    "c_s_GOOD_JOB_MSG": "Good Job!",
    // Epic-3
    // "c_s_RECORDING_DENIED_MSG_IPAD": "The device requires permission to record the audio, please ask your teacher to help you enable this from the settings.",
    // "c_s_RECORDING_DENIED_MSG_BROWSER": "The browser needs permission to record the audio, please ask your teacher to help you enable this setting.",
    "c_s_RECORDING_DENIED_MSG_IPAD": "The device requires permission to record the audio; please ask your teacher to help you enable this from the settings.",
    "c_s_RECORDING_DENIED_MSG_BROWSER": "The browser needs permission to record the audio; please ask your teacher to help you enable this setting.",
    //End of Epic-3
    "c_s_RECORDING_NOTSUPPORTED_MSG_BROWSER": "Oops! This feature is not available for your browser, please ask your teacher for help.",
    // Assignment Book icon Tool Tip
    "c_s_BOOK_TOOLTIP_TEMPLATE": "BookTooltipTemplate",
    "c_s_ASSIGNMENT_CURRENTBOOK_TOOLTIP": "currentBookTooltip",
    "c_s_ASSIGNMENT_VIEW_CURRENTREADING_AREA": "viewCurrentReadingPopupArea",
    "c_s_ASSIGNMENT_VIEW_CURRENTREADING": "viewCurrentReading",
    "c_s_ASSIGNMENT_CURRENT_BOOK_LABEL": "My Current Reading",
    "c_s_ASSIGNMENT_CURRENT_RATA_LABEL": "Read Aloud Think Aloud",
    "c_s_ASSIGNMENT_NOTEBOOK_LABEL": "Notebook",
    "c_s_ASSIGNMENT_VIEW_NOTEBOOK": "viewNotebook",
    "c_s_NATIVE_VERSION": "currentVersion",
    "c_s_LIBRARY_JS_PATH": "libraryJSPath",
    "c_s_FINISHED_BTTN": "Finished",
    // Extended Phonic
    "c_s_EXTENDED_PHONIC_BOOK_KEY": "book",
    "c_s_EXTENDED_PHONIC_BOOK_NAME": "book_cover_name",
    "c_s_EXTENDED_PHONIC_BOOK_PAGE_TEXT": "For this assignment, you need to read this book. Tap the book cover below to navigate to the book.",
    "c_s_RETURNED_FROM_EBOOK": "return4mebook",
    "c_s_DEFAULT_ASSIGNMENT_CATEGORY": "VOCABULARY, WORD STUDY, AND ACADEMIC TEXTS",
    "c_s_DECODABLE_READER_TEXT": "Decodable Reader",
    // IR VERB ID
    "c_s_IR_OPENED_VERBID": "S-ATO-IR-O",
    "c_s_IR_SWIPE_FORWARD_VERBID": "S-ATO-IR-F",
    "c_s_IR_SWIPE_BACKWARD_VERBID": "S-ATO-IR-B",
    "c_s_IR_AUDIO_START_VERBID": "S-ATO-IR-AS",
    "c_s_IR_AUDIO_STOP_VERBID": "S-ATO-IR-AP",
    "c_s_IR_READING_CHECK_ACCESS_VERBID": "S-ATO-IR-Q",
    "c_s_IR_DND_ANS_SELECTED_VERBID": "S-ATO-IR-DND-SEL",
    "c_s_IR_DND_ANS_SUBMITTED_VERBID": "S-ATO-IR-DND-SUB",
    "c_s_IR_HIGHLIGHT_ANS_SELECTED_VERBID": "S-ATO-IR-HL-SEL",
    "c_s_IR_HIGHLIGHT_ANS_SUBMITTED_VERBID": "S-ATO-IR-HL-SUB",
    "c_s_IR_SUMMARY_GETFEEDBACK_BTTN_VERBID": "S-ATO-IR-SW-SUB",
    "c_s_IR_SUMMARY_FEEDBACK_RECEIVED_VERBID": "S-ATO-IR-SW-FB-REC",
    "c_s_IR_SUMMARY_PKTCALLED_RECEIVED_VERBID_STUD" : "S-PKT-SCS",
    "c_s_IR_SUMMARY_PKTCALLED_RECEIVED_VERBID_INS" : "T-PKT-SCS",
    "c_s_IR_SUMMARY_FEEDBACK_DRILLED_VERBID": "S-ATO-IR-SW-FB-REC-O",
    "c_s_IR_SUMMARY_SUBMITTED_VERBID": "S-ATO-IR-T-SUB",
    "c_s_IR_READ_CRITICALLY_SUBMITTED_VERBID": "S-ATO-IR-CRTL-SUB",
    "c_s_IR_CLOSED_VERBID": "S-ATO-IR-CLO",
    "c_o_ORAL_FUENCY_SCORE": {
        "AC": "Accuracy (%)",
        "EX": "Expressiveness (0-10)",
        "WCPM": "WCPM"
    },
	"c_s_ASSIGNMENT_CATEGORY_LIBRESP": "libraryresponseprompt",
  "c_s_BROADCAST_ASSIGNMENT": "AssignmentOrAssessment",
  //PKT Limit Msg
  "c_s_ASSIGNMENT_PKT_MESSAGE": "You have only 1 attempt remaining to click \"Get Feedback\" for your work. Once you finish this attempt, your work will automatically be submitted for grading. Click Submit to submit your work for grading now, else edit your work for one final time and click Get Feedback.",
  "c_s_ASSIGNMENT_PKT_LAST_MESSAGE": "This is your last attempt to do Get Feedback. Once done, your work will automatically be submitted for grading.\nClick \"Yes\" to continue else click \"No\" to go back and edit your work.",

  //PKT Msg For Essay
  "c_s_ASSIGNMENT_ESSAY_PKT_MESSAGE": "You have only 1 attempt remaining to do \"Get Feedback\" on this section. After your last attempt is finished, you will no longer be able to click \"Get Feedback\" for this section. You can however continue to edit this section.",
  "c_s_ASSIGNMENT_WHOLE_ESSAY_PKT_MESSAGE" : "You have only 1 attempt remaining to click \"Get Feedback\". After your last attempt is finished, your work will automatically be submitted for Grading.",
  "c_s_ASSIGNMENT_WHOLE_ESSAY_PKT_LAST_MESSAGE": "Your work will be auto submitted after this, since you are using up your last attempt to Get Feedback. Click Yes to continue or No to go back and edit your work.",
  "c_s_DONE_BTN_TITLE": "Done button",
  "c_s_SAVE_EXIT_TITLE": "Save and Exit button",
  
  //Dashboard 
  "c_s_SORT_FNAME" : "fname",
  "c_s_SORT_LNAME" : "lname"
};

var LIBRARY = {
    "c_s_MAIN_CONTAINER": "mainCarouselArea",
    "c_s_HEADER_CONTAINER": "LibraryHeaderAreaContainer",
    "c_s_BOOK_POPUP_CONTAINER": "BookPopupAreaContainer",
    "c_s_HEADER_TEMPLATE": "LibraryHeaderAreaTemplate",
    "c_s_CAROUSEL_TEMPLATE": "CarouselLibraryAreaTemplate",
    "c_s_LIST_TEMPLATE": "ListLibraryAreaTemplate",
    "c_s_BOOK_POPUP_TEMPLATE": "BookPopupAreaTemplate",
    "c_s_MEDIA_FOLDER_PATH": "../Content/media/",
    "c_s_MEDIA_THUMB_COVER_PREFIX": "thumb_",
    "c_s_NO_COVER_IMAGE": "media/book_cover.jpg",
    "c_s_DEFAULT_COVER_IMAGE": "media/default_book_loader.gif",
    "c_s_PLAYER_URL": "./ebookplayer/player.html#",
    "c_s_CAROUSEL_VIEW": "carousel",
    "c_s_LIST_VIEW": "list",
    "c_s_BOOK_LIST_JSON_KEY": {
        "BOOK_ID": "book_id",
        "BOOK_TITLE": "book_title",
        "BOOK_TITLE_CHOPPED": "book_title_chopped",
        "AUTHOR_NAME": "author_name",
        "BOOK_IMAGE": "book_image",
        "BOOK_GENRE": "book_genre",
        "BOOK_PATH": "book_path",
        "NUM_PAGE": "no_of_page",
        "LEX_LEVEL": "lexile_level",
        "BOOK_DESC": "book_desc",
        "CAT_ID": "category_id",
        "CAT_NAME": "category_name",
        "BOOK_TYPE": "book_type",
        "FILE_TYPE": "file_type",
        "WORD_COUNT": "word_count"
    },
    "c_s_STATIC_TEXT": {
        "c_s_HEADER_TAB_1": "All Titles",
        "c_s_HEADER_TAB_2": "My Level",
        "c_s_HEADER_TAB_3": "My Books",
        "c_s_HEADER_TAB_4": "Recommended",
        "c_s_HEADER_TAB_5": "Reviewed",
        "c_s_HEADER_TAB_6": "Reserved",
        "c_s_DEMO_BOOK_BTN_TEXT": "Read Aloud Think Aloud",
        "c_s_TOP_RECOMMEND_BTN_TEXT": "Top Recommendation",
        "c_s_DEMO_BOOK_BTN_TEXT2": "My Current Reading",
        "c_s_MIDDLE_BOX_HEADER": "Progress",
        "c_s_MIDDLE_BOX_TOTAL_WORDS": "Total Words",
        "c_s_MIDDLE_BOX_TOTAL_PAGES": "Total Pages",
        "c_s_MIDDLE_BOX_TOTAL_BOOKS": "Total Books",
        "c_s_MIDDLE_BOX_LEXILE_LEVEL": "IR Lexile Level",
        "c_s_MIDDLE_BOX_DEMO_NUM": "253",
        "c_s_POPUP_GENRE": "Genre",
        "c_s_POPUP_PAGES": "Printed book page count",
        "c_s_POPUP_LEX_LVL": "Estimated Lexile Level",
        "c_s_POPUP_READ_BOOK": "Read This Book",
        "c_s_POPUP_ABT_BOOK": "About this book",
        "c_s_POPUP_BACK_LIBRARY": "Back to Library",
        "c_s_POPUP_RESERVE": "Reserve",
        "c_s_POPUP_REMOVE": "Remove",
        "c_s_POPUP_BOOK_READ": "Book Read",
        "c_s_POPUP_RATINGS": "Average Rating",
        "c_s_POPUP_COMMENTS": "User Comments",
        "c_s_AUTHORS": "Authors",
        "c_s_INVENTORY_INTRO": "iLit would like to know more about you in order to <br /> provide books best suited to your individual interests."
    },
    "c_s_INTEREST_INVENTORY_DRAGABLE": {
	  "ITEMS": [
		  {
			"c_s_NAME": "Action and Adventure",
			"c_s_CODE": "ACA"
		  },
		  {
			"c_s_NAME": "Animals",
			"c_s_CODE": "ANI"
		  },
		  {
			"c_s_NAME": "Art",
			"c_s_CODE": "ART"
		  },
		  {
			"c_s_NAME": "Autobiographies",
			"c_s_CODE": "AUTB"
		  },
		  {
			"c_s_NAME": "Biographies",
			"c_s_CODE": "BIOS"
		  },
		  {
			"c_s_NAME": "Cultures",
			"c_s_CODE": "CUL"
		  },
		  {
			"c_s_NAME": "Disasters and Tragedies",
			"c_s_CODE": "DAT"
		  },
		  {
			"c_s_NAME": "Dance",
			"c_s_CODE": "DAN"
		  },
		  {
			"c_s_NAME": "Drama and Plays",
			"c_s_CODE": "DRA"
		  },
		  {
			"c_s_NAME": "Fables and Folklore",
			"c_s_CODE": "FAB"
		  },
		  {
			"c_s_NAME": "Fairy Tales",
			"c_s_CODE": "FT"
		  },
		  {
			"c_s_NAME": "Fantasy",
			"c_s_CODE": "FANT"
		  },
		  {
			"c_s_NAME": "Fiction",
			"c_s_CODE": "FIC"
		  },
		  {
			"c_s_NAME": "Food",
			"c_s_CODE": "FOOD"
		  },
		  {
			"c_s_NAME": "Friendship and Family",
			"c_s_CODE": "FRND"
		  },
		  {
			"c_s_NAME": "Geography",
			"c_s_CODE": "GEO"
		  },
		  {
			"c_s_NAME": "Graphic Novels",
			"c_s_CODE": "GN"
		  },
		  {
			"c_s_NAME": "Historical Fiction",
			"c_s_CODE": "HFIC"
		  },
		  {
			"c_s_NAME": "History",
			"c_s_CODE": "HIS"
		  },
		  {
			"c_s_NAME": "Horror",
			"c_s_CODE": "HORR"
		  },
		  {
			"c_s_NAME": "Humor",
			"c_s_CODE": "HUM"
		  },
		  {
			"c_s_NAME": "Mythology and Legends",
			"c_s_CODE": "LEG"
		  },
		  {
			"c_s_NAME": "Music",
			"c_s_CODE": "MUS"
		  },
		  {
			"c_s_NAME": "Mysteries",
			"c_s_CODE": "MYS"
		  },
		  {
			"c_s_NAME": "Nature and Environment",
			"c_s_CODE": "NENV"
		  },
		  {
			"c_s_NAME": "News and Politics",
			"c_s_CODE": "NPOL"
		  },
		  {
			"c_s_NAME": "Nonfiction",
			"c_s_CODE": "NONF"
		  },
		  {
			"c_s_NAME": "Novels",
			"c_s_CODE": "NOV"
		  },
		  {
			"c_s_NAME": "Picture Books",
			"c_s_CODE": "PICB"
		  },
		  {
			"c_s_NAME": "Poetry",
			"c_s_CODE": "POET"
		  },
		  {
			"c_s_NAME": "Realistic Fiction",
			"c_s_CODE": "RFIC"
		  },
		  {
			"c_s_NAME": "Romances",
			"c_s_CODE": "ROM"
		  },
		  {
			"c_s_NAME": "Science",
			"c_s_CODE": "SC"
		  },
		  {
			"c_s_NAME": "Science Fiction",
			"c_s_CODE": "SCF"
		  },
		  {
			"c_s_NAME": "Short Stories",
			"c_s_CODE": "SS"
		  },
		  {
			"c_s_NAME": "Space",
			"c_s_CODE": "SPA"
		  },
		  {
			"c_s_NAME": "Sports",
			"c_s_CODE": "SPO"
		  },
		  {
			"c_s_NAME": "Supernatural",
			"c_s_CODE": "SUP"
		  },
		  {
			"c_s_NAME": "Technology",
			"c_s_CODE": "TECH"
		  },
		  {
			"c_s_NAME": "Thrillers",
			"c_s_CODE": "THR"
		  },
		  {
			"c_s_NAME": "Transportation",
			"c_s_CODE": "TRAN"
		  },
		  {
			"c_s_NAME": "Travel",
			"c_s_CODE": "TRA"
		  }
		]
	},
	
	/* 	ILIT-1094 for QA Environment */
	"c_s_INTEREST_INVENTORY_DRAGABLE_QA":{
	  "ITEMS": [
		  {
			"c_s_NAME": "ZEST 11",
			"c_s_CODE": "Z11"
		  },
		  {
			"c_s_NAME": "ZEST 12",
			"c_s_CODE": "Z12"
		  },
		  {
			"c_s_NAME": "ZEST 13",
			"c_s_CODE": "Z13"
		  },
		  {
			"c_s_NAME": "ZEST 14",
			"c_s_CODE": "Z14"
		  },
		  {
			"c_s_NAME": "ZEST 15",
			"c_s_CODE": "Z15"
		  },
		  {
			"c_s_NAME": "ZEST 16",
			"c_s_CODE": "Z16"
		  }
	]},
	
    "c_s_ALERT_INTEREST_INVENTORY_EMPTY_FIELD": "Please ensure non of the fields are blank",
	"c_o_INTEREST_INVENTORY_DATA":{
	  "BOY": {
		"LandingPageImage": "iLit20_Sproto_Interest_Inventory_Initial.jpg",
		"Questions" : [
			 {
			  "Q": "Do you enjoy reading?",
			  "A": [
				{
				  "val": "Y",
				  "display": "Yes"
				},
				{
				  "val": "N",
				  "display": "No"
				}
			  ],
			  "FieldName": "enjoyReading"
			},
			{
			  "Q": "How many books have you read in the last year?",
			  "A": [
				{
				  "val": "NON",
				  "display": "0"
				},
				{
				  "val": "1",
				  "display": "1"
				},
				{
				  "val": "2",
				  "display": "2"
				},
				{
				  "val": "3",
				  "display": "3"
				},
				{
				  "val": "4",
				  "display": "4"
				},
				{
				  "val": "5",
				  "display": "5"
				},
				{
				  "val": "MT5",
				  "display": "More"
				}
			  ],
			  "FieldName": "booksReadLastYear"
			},
			 {
			  "Q": "Do people in your family like to read?",
			  "A": [
				{
				  "val": "Y",
				  "display": "Yes"
				},
				{
				  "val": "N",
				  "display": "No"
				}
			  ],
			  "FieldName": "familyLikeToRead"
			},
			 {
			  "Q": "How often do you read books?",
			  "A": [
				{
				  "val": "DAI",
				  "display": "Daily"
				},
				{
				  "val": "SUM",
				  "display": "Summer"
				},
				{
				  "val": "VAC",
				  "display": "Vacations"
				},
				{
				  "val": "OCC",
				  "display": "Occasionally"
				},
				{
				  "val": "WEND",
				  "display": "Weekends"
				},
				{
				  "val": "ONLS",
				  "display": "Only School"
				}
			  ],
			  "FieldName": "timeSpendReading"
			},
			 {
			  "Q": "Do you have access to a local library?",
			  "A": [
				{
				  "val": "Y",
				  "display": "Yes"
				},
				{
				  "val": "N",
				  "display": "No"
				}
			  ],
			  "FieldName": "accessToLocalLibrary"
			},
			 {
			  "Q": "Which of the following do you read? Select all that apply.",
			  "A": [
				{
				  "val": "INTA",
				  "display": "Internet Articles"
				},
				{
				  "val": "SM",
				  "display": "Social Media"
				},
				{
				  "val": "MAG",
				  "display": "Magazines"
				},
				{
				  "val": "BOOK",
				  "display": "Books"
				}
			  ],
			  "FieldName": "whatYouRead"
			},
			 {
			  "Q": "What format do you like to read? Select all that apply.",
			  "A": [
				{
				  "val": "ONM",
				  "display": "Phone"
				},
				{
				  "val": "ONT",
				  "display": "Tablet"
				},
				{
				  "val": "ONC",
				  "display": "Computer"
				},
				{
				  "val": "PB",
				  "display": "Print Book"
				}
			  ],
			  "FieldName": "howYouRead"
			}
		]
	  },
	  "MOY": {
		"LandingPageImage": "iLit20_Sproto_Interest_Inventory_MidYear.jpg",
		"Questions":[
			 {
			  "Q": "Are you enjoying the iLit experience?",
			   "A": [
				{
				  "val": "Y",
				  "display": "Yes"
				},
				{
				  "val": "N",
				  "display": "No"
				}
			  ],
			   "FieldName": "enjoyIlitExp"
			},
			{
			  "Q": "Do you enjoy reading?",
			  "A": [
				{
				  "val": "Y",
				  "display": "Yes"
				},
				{
				  "val": "N",
				  "display": "No"
				}
			  ],
			  "FieldName": "enjoyReading"
			},
			{
			  "Q": "How many books have you read in the last year?",
			  "A": [
				{
				  "val": "NON",
				  "display": "0"
				},
				{
				  "val": "1",
				  "display": "1"
				},
				{
				  "val": "2",
				  "display": "2"
				},
				{
				  "val": "3",
				  "display": "3"
				},
				{
				  "val": "4",
				  "display": "4"
				},
				{
				  "val": "5",
				  "display": "5"
				},
				{
				  "val": "MT5",
				  "display": "More"
				}
			  ],
			  "FieldName": "booksReadLastYear"
			},
			 {
			  "Q": "Do people in your family like to read?",
			  "A": [
				{
				  "val": "Y",
				  "display": "Yes"
				},
				{
				  "val": "N",
				  "display": "No"
				}
			  ],
			  "FieldName": "familyLikeToRead"
			},
			 {
			  "Q": "How often do you read books?",
			  "A": [
				{
				  "val": "DAI",
				  "display": "Daily"
				},
				{
				  "val": "SUM",
				  "display": "Summer"
				},
				{
				  "val": "VAC",
				  "display": "Vacations"
				},
				{
				  "val": "OCC",
				  "display": "Occasionally"
				},
				{
				  "val": "WEND",
				  "display": "Weekends"
				},
				{
				  "val": "ONLS",
				  "display": "Only School"
				}
			  ],
			  "FieldName": "timeSpendReading"
			},
			 {
			  "Q": "Do you have access to a local library?",
			  "A": [
				{
				  "val": "Y",
				  "display": "Yes"
				},
				{
				  "val": "N",
				  "display": "No"
				}
			  ],
			  "FieldName": "accessToLocalLibrary"
			},
			 {
			  "Q": "Which of the following do you read? Select all that apply.",
			  "A": [
				{
				  "val": "INTA",
				  "display": "Internet Articles"
				},
				{
				  "val": "SM",
				  "display": "Social Media"
				},
				{
				  "val": "MAG",
				  "display": "Magazines"
				},
				{
				  "val": "BOOK",
				  "display": "Books"
				}
			  ],
			  "FieldName": "whatYouRead"
			},
			 {
			  "Q": "What format do you like to read? Select all that apply.",
			  "A": [
				{
				  "val": "ONM",
				  "display": "Phone"
				},
				{
				  "val": "ONT",
				  "display": "Tablet"
				},
				{
				  "val": "ONC",
				  "display": "Computer"
				},
				{
				  "val": "PB",
				  "display": "Print Book"
				}
			  ],
			  "FieldName": "howYouRead"
			}
		]
	  },
	  "EOY": {
		"LandingPageImage": "iLit20_Sproto_Interest_Inventory_Final.jpg",
		"Questions":[
			 {
			  "Q": "Are you enjoying the iLit experience?",
			  "A": [
				{
				  "val": "Y",
				  "display": "Yes"
				},
				{
				  "val": "N",
				  "display": "No"
				}
			  ],
			   "FieldName": "enjoyIlitExp"
			},
			{
			  "Q": "Do you enjoy reading?",
			  "A": [
				{
				  "val": "Y",
				  "display": "Yes"
				},
				{
				  "val": "N",
				  "display": "No"
				}
			  ],
			  "FieldName": "enjoyReading"
			},
			{
			  "Q": "How many books have you read in the last year?",
			  "A": [
				{
				  "val": "NON",
				  "display": "0"
				},
				{
				  "val": "1",
				  "display": "1"
				},
				{
				  "val": "2",
				  "display": "2"
				},
				{
				  "val": "3",
				  "display": "3"
				},
				{
				  "val": "4",
				  "display": "4"
				},
				{
				  "val": "5",
				  "display": "5"
				},
				{
				  "val": "MT5",
				  "display": "More"
				}
			  ],
			  "FieldName": "booksReadLastYear"
			},
			 {
			  "Q": "Do people in your family like to read?",
			  "A": [
				{
				  "val": "Y",
				  "display": "Yes"
				},
				{
				  "val": "N",
				  "display": "No"
				}
			  ],
			  "FieldName": "familyLikeToRead"
			},
			 {
			  "Q": "How often do you read books?",
			  "A": [
				{
				  "val": "DAI",
				  "display": "Daily"
				},
				{
				  "val": "SUM",
				  "display": "Summer"
				},
				{
				  "val": "VAC",
				  "display": "Vacations"
				},
				{
				  "val": "OCC",
				  "display": "Occasionally"
				},
				{
				  "val": "WEND",
				  "display": "Weekends"
				},
				{
				  "val": "ONLS",
				  "display": "Only School"
				}
			  ],
			  "FieldName": "timeSpendReading"
			},
			 {
			  "Q": "Do you have access to a local library?",
			  "A": [
				{
				  "val": "Y",
				  "display": "Yes"
				},
				{
				  "val": "N",
				  "display": "No"
				}
			  ],
			  "FieldName": "accessToLocalLibrary"
			},
			 {
			  "Q": "Which of the following do you read? Select all that apply.",
			  "A": [
				{
				  "val": "INTA",
				  "display": "Internet Articles"
				},
				{
				  "val": "SM",
				  "display": "Social Media"
				},
				{
				  "val": "MAG",
				  "display": "Magazines"
				},
				{
				  "val": "BOOK",
				  "display": "Books"
				}
			  ],
			  "FieldName": "whatYouRead"
			},
			 {
			  "Q": "What format do you like to read? Select all that apply.",
			  "A": [
				{
				  "val": "ONM",
				  "display": "Phone"
				},
				{
				  "val": "ONT",
				  "display": "Tablet"
				},
				{
				  "val": "ONC",
				  "display": "Computer"
				},
				{
				  "val": "PB",
				  "display": "Print Book"
				}
			  ],
			  "FieldName": "howYouRead"
			}
		  ]
	  }
	},
	c_i_MOY_TIMEFRAME: 90, /* actual should be 90 */
	c_i_EOY_TIMEFRAME: 210, /* actual should be 210 */
	
	c_i_MOY_TIMEFRAME_QA: 1, /* ILIT-1094 for QA Environment */
	c_i_EOY_TIMEFRAME_QA: 2 /* ILIT-1094 for QA Environment */
};

var CONNECT = {
    "c_s_MAIN_CONTAINER": "main_container",
    "c_s_SCREEN_TYPE": "screentype",
    "c_s_MAX_INPUT": 4,
    "c_s_COMMENT_BTN": "btn_cmt",
    "c_s_COMMENT_AREA": "cmt_area",
    "c_s_COMMENT_TITLE": "Comments",
    "c_s_PERSONAL_COMMENT_AREA": "personal_cmt_area",
    "c_s_PERSONAL_COMMENT_TITLE": "Teacher Comments",
    "c_s_STUDENT_LIST_TITLE": "Student List",
    "c_s_BUZZ_TITLE": "BUZZ!",
    "c_s_BUZZ_BTN": "buzzbtn",
    "c_s_ALL_STUDENTS_TXT": "Select All Students",
    "c_s_RESET_BUZZ_BTN": "resetbuzzbtn",
    "c_s_RESET_BUZZ_BTN_TXT": "Reset Stars",
    "c_s_DONE_BUZZ_BTN": "donebuzzbtn",
    "c_s_DONE_BUZZ_BTN_TXT": "Done",
    "c_s_COMMENT_LIST": "comment_list",
    "c_s_COMMENTS_POPUP_AREA": "commentspopuparea",
    "c_s_ID_LINK_SELECT_ALL": "linkSelectAll",
    "c_s_BUZZ_SAVE_RECORD_ALERT": "BUZZ! sent successfully!",
    "c_s_BUZZ_RESET_RECORD_ALERT": "Stars reset successfully.",
    "c_s_BUZZ_DATA_RESET_TXT": "I have reset the stars for the class. Let's start again. Good luck.",
    "c_s_PRJBTN_TXT": "Project Top Stars",
    "c_s_PRJBTN": "prjbtn",
    "c_s_SEND_PROJECTION": "sendprjbtn",
    "c_s_WRONG_COMMENT_ALERT": "Please select either the Comments or Teacher Comments. Both message types can't be sent.",
    "c_s_PREAUTHORED_COMMNET_RESTICTION": "Max 3 pre-authored comments can be selected at one time.",
    "c_s_RESET_STARS_CONFIRM_TXT": "Reset will remove all stars. Do you want to continue?",
    "c_s_CREATE_POLL_TITLE": "Create Poll",
    "c_s_EDIT_POLL_TITLE": "Edit Poll",
    "c_s_CONFIRM_DELETE_MSG": "Are you sure you want to delete?",
    "c_s_STOP_PROJECT_TXT": "Stop Project",
    "c_s_PROJECT_TXT": "Project",
    "c_s_SEND_POLL_TXT": "Send Poll",
    "c_s_END_POLL_TXT": "End Poll",
    "c_s_STOP_PROJECTION": "stopprjbtn",
    "c_s_SURVEY_TYPE": "AdHocPoll",
    "c_s_SELECT_STUDENT_ALERT": "Please select student(s)",
    "c_s_EMPTY_COMMENT_ALERT": "Please add a comment or send a star to the student",
    "c_s_PERSONALCMT_CHAR_LIMIT": 500,
    "c_i_POLL_QUES_CHAR_LIMIT": 250,
    "c_i_POLL_ANS_CHAR_LIMIT": 100,
    "c_s_POLL_QUES_MAX_CHAR_ALERT": "Oops, something is not right, try to shorten the question and try again.",
    "c_s_POLL_ANS_MAX_CHAR_ALERT": "Oops, something is not right, try to shorten the options and try again.",
    "c_s_QUESTION_TXT": "Question",
    "c_s_OPTIONS_TXT": "Options",
    "c_s_SAVE_NEXT_TXT": "Save & Next",
    "c_s_CANCEL_TXT": "Cancel",
    "c_s_LIST_POLLS_TXT": "List of Polls",
    "c_s_POLL_SENT_VERBID": "T-SS-AH"

}
var STUDENT_CONNECT = {
    "c_s_MAIN_CONTAINER": "main_wrapper",
    "c_s_CONNECT_REFRESH": "buttonConnectRefresh"
}
var LESSON = {
    "c_s_MAIN_CONTAINER": "main_container",
    "c_s_LESSON": "lesson",
    "c_s_PROJECT_BTTN": "Project",
    "c_s_START_PROJECT_BTTN": "Project",
    "c_s_END_PROJECT_BTTN": "Stop Projection",
    "c_s_EXPAND_BTTN": "Expand",
    "c_s_BROADCAST_BTTN": "Broadcast",
    "c_s_ASSIGNMENTS_BTTN": "Assignments",
    "c_s_SURVEY_BTTN": "Send Survey",
    "c_s_END_SURVEY_BTTN": "End Survey",
    "c_s_READ_BTTN": "Read This Book",
    "c_s_ABT_BOOK_BTTN": "Summary",
    "c_s_VIEW_BTTN_TXT": "View",
    "c_s_BACK_TXT_BTTN": "Back To Text",
    "c_s_BUTTON_AREA_TEXT": "If Students...",
    "c_s_BOOK_TAB": "RATA",
    "c_s_PLAY": "Play",
    "c_s_PAUSE": "Pause",
    "c_s_ICONS": {
        "app_tip": "App-Tip-Button.png",
        "ell_note": "ELL-Button.png",
        "pd_note": "PD-Button.png",
        "forty_five_note": "45-Minute-Button.png",
        "comn_core_state_std": "CCSS-Standards-Button.png",
        "ca_state_std": "CA-Standards-Button.png",
        "eng_lang_prof": "ELP-Button.png",
        "cust_inst": "Customize-Instruction-Button.png",
        "l1_cons": "L1-Considerations-Button.png",
        "ua": "Universal-Access-Button.png"
    },
    "c_s_BUTTONS": {
        "button1_label": "button1_text",
        "button2_label": "button2_text",
        "button3_label": "button3_text",
        "button4_label": "button4_text",
        "button5_label": "button5_text",
        "button6_label": "button6_text",
        "button7_label": "button7_text",
        "button8_label": "button8_text",
        "button9_label": "button9_text",
        "button10_label": "button10_text",
        "button11_label": "button11_text",
        "button12_label": "button12_text",
        "button13_label": "button13_text",
        "button14_label": "button14_text",
        "button15_label": "button15_text",
        "button16_label": "button16_text"
    },
    "c_obj_TOOLTIP_SETTINGS": {
        animation: 'fade',
        delay: 50,
        theme: ".tooltip_black",
        touchDevices: true,
        trigger: 'click',
        maxWidth: 200,
        maxHeight: 400,
        position: 'bottom',
        right: '25px',
        functionAfter: function () {
            $("div[data-tooltip]").attr("data-tooltipvisible", "false");
            $("button[data-tooltip]").attr("data-tooltipvisible", "false");
        }
    },
    "c_s_MEDIA_FOLDER_PATH": "../Content/ilit/curriculum/grade8/unit1/lesson11/",
    "c_s_IMAGES_PATH": "images/",
    "c_s_AUDIO_PATH": "audio/",
    "c_s_VIDEO_PATH": "video/",
    "c_s_POLL_BTTN": "Polls",
    "c_s_MEDIA_PATH": "media/",
    "c_s_TIME_TO_READ_AREA": "timetoReadConferencingArea",
    "c_s_PROCESS_ENG_LABEL": "Process & Engagement",
    "c_s_SPEAKING_LABEL": "Speaking",
    "c_s_LISTENING_LABEL": "Listening",
    "c_s_ADDITIONAL_NOTES_LABEL": "Additional Notes",
    "c_s_GUIDING_QUESTIONS_LABEL": "Guiding Questions",
    "c_s_HISTORY_BTN_TXT": "History",
    "c_s_DONE_BTN_TXT": "Done",
    "c_s_SUBMIT_BTN_TXT": "Submit",
    "c_s_EDIT_BTN_TXT": "Edit",
    "c_s_CURRENT_READING_TXT": "Current Reading :",
    "c_s_COMPREHENSION_LEVEL_TXT": "Comprehension Level",
    "c_s_PARTICIPATION_LEVEL_TXT": "Overall Participation",
    "c_s_OUTSIDE_READING_TXT": "Add Outside Reading",
    "c_s_STUDENT_FEEDBACK_TITLE_TXT": "Student Feedback",
    "c_s_STUDENT_FEEDBACK_TXT": "When you conference with students, give feedback about how they are doing during Classroom Conversation.  Access the history of the evaluation forms to share your observations and recommendations for improvement.",
    "c_s_BOOK_COMPLETE_TXT": "Book Complete",
    "c_s_SLIDER": "slider-range-min",
    "c_s_COMPREHENTION_ALERT_TXT": "Score has not been recorded for the current Comprehension Level",
    "c_s_ADD_OUTSIDEREADING_DONE_BTN": "BtnAddOutDone",
    "c_s_ADD_OUTSIDEREADING_HISTORY_BTN": "BtnAddOutHistory",
    "c_s_ADD_OUTSIDEREADING_BOOKTITLE_INPUT": "booktitle",
    "c_s_ADD_OUTSIDEREADING_NOOFPAGES_INPUT": "noofpages",
    "c_s_ADD_OUTSIDEREADING_COMPLETEBOOK_INPUT": "bookcomplete",
    "c_s_ADD_OUTSIDEREADING_BOOKTITLE_TXT": "New Book Title",
    "c_s_ADD_OUTSIDEREADING_NOOFPAGES_TXT": "No. Of Pages",
    "c_s_SUBMIT_BTN": "addoutsidereadingbtn",
    "c_s_PROCESS_ADD_BTN": "processengbtn",
    "c_s_SPEAK_ADD_BTN": "speakNoteAddBttn",
    "c_s_LISTEN_ADD_BTN": "listenNoteAddBttn",
    "c_s_PROCESS_ENGMENT_LIST": "process_engagement_list",
    "c_s_SPEAKING_LIST": "speaking_list",
    "c_s_LISTENING_LIST": "listening_list",
    "c_s_CONFERENCE_HISTORY_LIST": "conference_history_list",
    "c_s_BTN_ADDIONAL_TXT": "btnAdditiontxt",
    "c_s_INPUT_ADDITIONAL_TXT": "inputAdditionaltxt",
    "c_s_STUDENT_BOOK_COVER": "book_cover_image_wrap",
    "c_s_CONFERENCE_VIEW_BOOKS_AREA": "viewBooksPopupArea",
    "c_s_CONFERENCE_POPUP_CLOSE_BTN": "bookspopup_close_btn",
    "c_s_CONFERENCE_ASSIGNMENT_PROGRESS_LABEL": "Assignment Progress",
    "c_s_CONFERENCE_STUDENT_TODOLIST_LABEL": "Student's To-Do List Status",
    "c_s_ASSIGNMENT_PROGRESS_INPUT": "assignment_progress_input",
    "c_s_CONFERENCE_SAVE_CONFIRM_ALERT": "Do you want to save the information?",
    "c_s_OUTSIDEREADING_NOOFPAGES_INPUT_ALERT": "No Of Pages field value should be numeric!",
    "c_s_CONFERENCE_STUDENT_POPUP_LABEL": "Student List",
    "c_s_CONFERENCE_STUDENT_POPUP_CANCEL_LABEL": "Cancel",
    "c_s_CONFERENCE_STUDENTLIST": "studentListPopup",
    "c_s_CONFERENCE_STUDENTLIST_CANCEL_BTN": "studentCancelBtn",
    "c_s_CONFERENCE_STUDENTLIST_EDIT_BTN": "studentEditBtn",
    "c_s_MAIN_WRAPPER_CLASS": "wrapper",
    "c_s_OVERLAY_CLASS": "overley",
    "c_s_VIEW_CONFERENCE_AREA": "viewConferencePopupArea",
    "c_s_POPUP_STUDENT_NAME": "student_name",
    "c_s_POPUP_STUDENT_ID": "student_id",
    "c_s_POPUP_ITEMDISPLAY_NAME": "itemdisplayname",
    "c_s_POPUP_CONFERENCE_TYPE": "conference_type",
    "c_s_PROCESS_ENGAGEMENT_NOTES": "process_engagement_notes",
    "c_s_SPEAKING_NOTES": "speaking_notes",
    "c_s_LISTENING_NOTES": "listening_notes",
    "c_s_CONFERENCE_HEADER_PANEL": "headerpanel",
    "c_s_OUSIDE_READING_PANEL": "outsidereadingpanel",
    "c_s_STUDENT_FEEDBACK_PANEL": "studentfeedbackpanel",
    "c_s_COMPREHENSION_PANEL": "comprehensionpanel",
    "c_s_CLASS_ROOM_PARTICIPATION_PANEL": "classroomparticipationpanel",
    "c_s_INSTRUCTOR_INPUT_PANEL": "instructorinputpanel",
    "c_s_CLASS_ROOM_INPUT_PANEL": "classroominputpanel",
    "c_s_NOTE_POPUP_AREA": "notpopuparea",
    "c_s_SPEAKING_POPUP_AREA": "speakingpopuparea",
    "c_s_LISTENING_POPUP_AREA": "listeningpopuparea",
    "c_s_STUDENT_NOTELIST_PANEL": "studenttodolistpanel",
    "c_s_STUDENT_NOTES_PANEL": "studentnotespanel",
    "c_s_CLASS_CONFERENCE": "classconference",
    "c_s_CLASS_ROOM_CONFERENCE": "classroomconference",
    "c_s_GROUP_CONFERENCE": "groupconference",
    "c_s_POPUP_LESSON_ID": "lesson_id",
    "c_s_CONFERENCE_SAVE_RECORD_ALERT": "Your data was saved!",
    "c_s_CONFERENCE_ALERT_TXT": "Comments / remarks not been recorded, do you want to save the information?",
    "c_s_LIBRARY_SAVE_RECORD_ALERT": "Your data was saved!",
    "c_s_POPUP_CURRENT_READING_ID": "current_reading_id",
    "c_s_POPUP_CURRENT_LEVEL": "current_level",
    "c_s_BOOKLIST_PREVIOUS_LINK": "bookListPrevious",
    "c_s_BOOKLIST_NEXT_LINK": "bookListNext",
    "c_s_TXT_UNIT": "Unit",
    "c_s_TXT_LESSON": "Lesson",
    "c_s_TXT_WORD_PER_PAGE": "words per page",
    "c_s_ADD_OUTSIDEREADING_WORDS_PERPAGES_INPUT": "wordsperpage",
    "c_s_VIEW_CONFERENCE_IFRAME": "viewConferencePopupIframe",
    "c_i_ASSIGN_STATUS": 'assigned',
    "c_i_SCORED_STATUS": 'scored',
    "c_i_SCORE_STATUS": 'score',
    "c_i_COMPLETE_STATUS": 'completed',
    "c_i_PROGRESS_STATUS": 'in progress',
    "c_s_LIBRARY_PROGRESS_EMPTY_LABEL": "No booklist to display.",
    "c_s_POPUP_UNIT_NO": "unit_no",
    "c_s_POPUP_WEEK_NO": "week_no",
	"c_s_USER_ROLE_IN_CLASS_FOR_CONFERENCING":"user_role_in_class_conferencing",
    "c_s_UNIT_WEEK_DETAILS": "unit_week_details",
    "c_s_STUDENTLIST_POPUP_AREA": "studentlistpopuparea",
    "c_s_CONFERENCE_STUDENTLIST_SAVE_BTN": "studentSaveBtn",
    "c_s_CONFERENCE_STUDENT_POPUP_SAVE_LABEL": "Save",
    "c_s_CONFERENCE_EMPTY_HISTORY_TXT": "No history available",
    "c_s_CONFERENCE_CURRENT_EDITING": "Current",
    "c_s_CONFERENCE_STUDENTLIST_REFRESH_BTN": "studentRefreshBtn",
    "c_s_REFRESH_BTN_TXT": "Refresh",
    "c_s_POPUP_SERVICE_VERSION": "serviceVersion",
    // VERB IDS
    "c_s_SURVEY_SENT_VERBID": "T-SS",
    "c_s_SURVEY_FINISHED_VERBID": "T-SF",
    "c_s_BROADACAST_SENT_VERBID": "T-SB",
    "c_s_EXPAND_SCRIBBLE_VERBID": "T-LTO-MS",
    "c_s_PROJECT_START_VERBID": "AP",
    // PROJECT
    "c_s_PROJECT_TEXTNAUDIO": "TextNAudio",
    "c_s_MEDIA_ACTION_TYPE_PLAY": "Play",
    "c_s_MEDIA_ACTION_TYPE_PAUSE": "Pause",
    "c_s_MEDIA_ACTION_TYPE_STOP": "Stop",
    "c_s_MEDIA_ACTION_TYPE_SEEK": "Seek",
    "c_s_PROJECT_START": "Start",
    "c_s_PROJECT_STOP": "Stop",
    "c_s_BROADCAST_EBOOK": "eBook",
    // NO ACTIVITIES
    "c_s_NO_ACTIVITIES": "Oops, current lesson has no activities!",
};

// for conference
var DEFAULT_UNIT_WEEK_DETAILS = [[1, 0], [2, 0]];

var LESSON_TAB_VIEW = [{
        "c_s_TABTYPE": "time_to_read",
        "c_s_TABNAME": "Time to Read",
        "c_s_TABORDER": "1",
        "c_s_VERBID": "T-LTO-TTR"
    }, {
        "c_s_TABTYPE": "vocab",
        "c_s_TABNAME": "Vocabulary",
        "c_s_TABORDER": "2",
        "c_s_VERBID": "T-LTO-VO"
    }, {
        "c_s_TABTYPE": "RATA",
        "c_s_TABNAME": "Read Aloud, Think Aloud",
        "c_s_TABORDER": "3",
        "c_s_VERBID": "T-LTO-RT"
    }, {
        "c_s_TABTYPE": "classroom_conversations",
        "c_s_TABNAME": "Classroom Conversation",
        "c_s_TABORDER": "4",
        "c_s_VERBID": "T-LTO-CC"
    }, {
        "c_s_TABTYPE": "whole_group",
        "c_s_TABNAME": "Whole Group",
        "c_s_TABORDER": "5",
        "c_s_VERBID": "T-LTO-WG"
    }, {
        "c_s_TABTYPE": "work_time",
        "c_s_TABNAME": "Work Time",
        "c_s_TABORDER": "6",
        "c_s_VERBID": "T-LTO-WT"
    }, {
        "c_s_TABTYPE": "wrap_up",
        "c_s_TABNAME": "Wrap Up",
        "c_s_TABORDER": "7",
        "c_s_VERBID": "T-LTO-WU"
    }];

var LESSON_TAB_VIEW_WTW = [{
        "c_s_TABTYPE": "time_to_read",
        "c_s_TABNAME": "Introduce",
        "c_s_TABORDER": "1",
        "c_s_VERBID": "T-LTO-TTR"
    }, {
        "c_s_TABTYPE": "vocab",
        "c_s_TABNAME": "Practice",
        "c_s_TABORDER": "2",
        "c_s_VERBID": "T-LTO-VO"
    }, {
        "c_s_TABTYPE": "RATA",
        "c_s_TABNAME": "Read Aloud, Think Aloud",
        "c_s_TABORDER": "3",
        "c_s_VERBID": "T-LTO-RT"
    }, {
        "c_s_TABTYPE": "classroom_conversations",
        "c_s_TABNAME": "Apply",
        "c_s_TABORDER": "4",
        "c_s_VERBID": "T-LTO-CC"
    }, {
        "c_s_TABTYPE": "whole_group",
        "c_s_TABNAME": "Extend",
        "c_s_TABORDER": "5",
        "c_s_VERBID": "T-LTO-WG"
    }, {
        "c_s_TABTYPE": "work_time",
        "c_s_TABNAME": "Work Time",
        "c_s_TABORDER": "6",
        "c_s_VERBID": "T-LTO-WT"
    }, {
        "c_s_TABTYPE": "wrap_up",
        "c_s_TABNAME": "Wrap Up",
        "c_s_TABORDER": "7",
        "c_s_VERBID": "T-LTO-WU"
    }];

var CONFERENCE_TYPES = {
    "c_s_TTR": "time_to_read",
    "c_s_CLASSROOM_CONVERSATION": "classroom_conversations",
    "c_s_ASSIGNMENT": "assignment",
    "c_s_STRATEGY": "strategy",
    "c_s_INDIVIDUALS": "individuals",
};

var CHARACTERS = {
    "c_s_BLANK": "&nbsp;",
    "c_s_BREAK": "<br />",
};

var ASSIGNMENT_INSTRUCTOR = {
    "c_s_SEND_ASSIGNMENT_TXT": "Send",
    "c_s_SENT_ASSIGNMENT_TXT": "Sent",
    "c_s_SENT_COMPLETED_TXT": "Score",
    "c_s_SCORE_ASSIGNMENT_TXT": "Score",
    "c_s_SCORED_ASSIGNMENT_TXT": "Scored",
    "c_s_PROGRESS_ASSIGNMENT_TXT": "In Progress",
    "c_i_FULL_GRADE": 1,
    "c_i_GRIDCAPACITY": 7,
    "c_i_INTERACTIVE_READING": "INTERACTIVE READING",
    "c_i_STUDY_PLAN": "STUDY PLAN",
    "c_i_WEEKLY_WRITING": "Weekly Writing",
    "c_i_DAILY_ASSIGNMENT": "Daily Assignment",
    "c_i_DEFAULT_SELECTED_UNIT": "Unit 1",
    "c_i_DEFAULT_SELECTED_LESSON": "Lessons 1-5",
    "c_i_DEFAULT_SELECTED_UNIT_ID": 1,
    "c_i_DEFAULT_SELECTED_IRLEVEL": 5,
    "c_i_DEFAULT_SELECTED_LESSON_ID": 1,
    "c_i_SELECT_BUTTON": 'Select',
    "c_i_SELECT_ACTIVE_BUTTON": 'Send Selected',
    "c_i_SEND_ALL": 'Send All',
    "c_i_CANCEL_BUTTON": 'Cancel',
    "c_i_VIEW_BUTTON": 'View',
    "c_i_MODAL_BUTTON": 'Model',
    "c_i_WITHDRAW_BUTTON": 'Withdraw',
    //Epic-4 - Partial Score
    "c_i_PARTIAL_SCORE_BUTTON": 'Partial Score',
    //End of Epic-4 - Partial Score
    //Epic-4 - Rescore
    "c_i_RESCORE_BUTTON": 'Rescore',
    //End of Epic-4 - Rescore
    //Epic-4 - Reassign
    "c_i_REASSIGN_BUTTON": 'Reassign',
    //End of Epic-4 - Reassign
    "c_i_SEND_CLASS_BUTTON": 'Send to class',
    "c_i_ASSIGN_STATUS": 'assigned',
    "c_i_ASSIGN_Deleted": 'deleted',
    "c_i_SCORED_STATUS": 'scored',
    "c_i_SCORE_STATUS": 'score',
    "c_i_COMPLETE_STATUS": 'completed',
    "c_s_DELETED_STATUS": 'deleted',
    "c_i_PROGRESS_STATUS": 'in progress',
    "c_s_FINISHED_STATUS": 'Finished',
    "GLE": {
        "SENTENCE_COMP_STANINE": "Sentence Comp. Stanine",
        "PASSAGE_COMP_STANINE": "Passage Comp. Stanine",
        "COMP_COMP_STANINE": "Comp. Composite Stanine",
        "COMP_COMP_GLE": "Comp. Composite GLE",
        "VOCAB_STANINE": "Vocab Stanine",
        "VOCAB_GLE": "Vocab<br />GLE",
        "TOT_STANINE": "Total (Stanine)",
        "TOT_GLE": "Total<br />GLE",
        "LIST_COMP": "List.<br />Comp"
    },
    "c_s_LOADING_TXT": "Loading",
    //Epic-4 - Reassign
    // "c_RETURN_BUTTON":'Return',
    "c_RETURN_BUTTON":'Reassign',
    //End of Epic-4 - Reassign
    "c_SCORE_BUTTON": "Score"
};

var ASSIGNMENT_KEYS = {
    "V2": {
        "SID": "SID",
        "IID": "IID",
        "ICS": "ICS",
        "FS": "FS",
        "IAS": "IAS",
        "IS": "IS",
        "ISR": "ISR",
        "WC": "WC",
        "IMS": "IMS",
        "ISIP": "ISIP",
        "RAC": "RAC",
        "Cmt": "Cmt",
        "IAID": "IAID"
        // Epic-4
        ,"IDD": "IDD"
        ,"IASUBDT": "IASUBDT"
        // End of Epic-4
        //CLAS-99
        ,"NOQA": "NOQA"
    },
    "PREV2": {
        "SID": "StudentID",
        "IID": "ItemID",
        "ICS": "ItemCompletionStatus",
        "FS": "FinalScore",
        "IAS": "ItemAttemptSummary",
        "IS": "InstructorScore",
        "ISR": "InstructorScoreRubric",
        "WC": "WordCount",
        "IMS": "ItemMaxScore",
        "ISIP": "ItemScoreInPercentage",
        "RAC": "ReAssignCount",
        "Cmt": "Comment"
        // Epic-4
        ,"IDD": "ItemDuedate"
        ,"IASUBDT": "ItemAssignmentSubmittedDate"
        // End of Epic-4
    }
};

var ASSIGNMENT_INSTRUCTOR_SCORE = {
    'buttons': {
        'c_s_LABEL_REASSIGN_TO_STUDENT': 'Reassign to Student',
        'c_s_LABEL_SCORE': 'Score',
        'c_s_LABEL_RESCORE': 'Re-score',
        'c_s_LABEL_ACCEPT_SCORE': 'Accept Score',
        'c_s_LABEL_VIEW_LOG': 'View Log',
        'c_s_LABEL_REASSIGN': 'Reassign',
        // CLAS-60
        'c_s_LABEL_Feedback': 'Save & Continue',
        // End of CLAS-60
        'c_s_LABEL_SUBMIT': 'Submit',
        'c_s_LABEL_SCORING_RUBRIC_CRITERIA': 'Scoring Rubric Criteria',
        'c_s_LABEL_CANCEL': 'Cancel',
        'c_s_LABEL_DONE': 'Done',
        //Epic-4 - Reassign
        'c_s_LABEL_REASSIGN_COMPLETELY': 'Reassign Complete Assignment'
        //End of Epic-4 - Reassign
        //CLAS-113
        ,'c_s_LABEL_FULL_SCORE': 'Full Score'
        //End of CLAS-113
    },
    'headings': {
        'c_s_LABEL_REASSIGN_TO_STUDENT': 'Reassign to Student',
        // CLAS-60
        'c_s_LABEL_FEEDBACK_TO_STUDENT': 'Feedback to Student',
        // End of CLAS-60
        'c_s_LABEL_PROMPT': 'Prompt',
        'c_s_LABEL_STUDENT_RESPONSE': 'Student Response'
    },
    'labels': {
        'c_s_LABEL_ADD_COMMENTS': 'Add Comments',
        // CLAS-60
        'c_s_LABEL_ADD_FEEDBACK': 'Add Feedback (Optional)',
        // End of CLAS-60
        'c_s_LABEL_INEFFECTIVE': 'Ineffective',
        'c_s_LABEL_VERY_EFFECTIVE': 'Very Effective',
        'c_s_LABEL_RUBRIC': 'Rubric'
    },
    'scoreLevel': {
        "0": {
            "c_s_RUBRIC_LABEL": "IDEAS",
            "c_s_RUBRIC_TEXT": "Ideas"
        },
        "1": {
            "c_s_RUBRIC_LABEL": "ORG",
            "c_s_RUBRIC_TEXT": "Organization"
        },
        "2": {
            "c_s_RUBRIC_LABEL": "VOICE",
            "c_s_RUBRIC_TEXT": "Voice"
        },
        "3": {
            "c_s_RUBRIC_LABEL": "WC",
            "c_s_RUBRIC_TEXT": "Word Choice"
        },
        "4": {
            "c_s_RUBRIC_LABEL": "FLUENCY",
            "c_s_RUBRIC_TEXT": "Sentence Fluency"
        },
        "5": {
            "c_s_RUBRIC_LABEL": "CONV",
            "c_s_RUBRIC_TEXT": "Conventions"
        },
        "6": {
            "c_s_RUBRIC_LABEL": "Overall",
            "c_s_RUBRIC_TEXT": "OVERALL"
        }
    },
    // "c_s_OFPKT_SCORE_WAITING_MSG" : "<p style=\"color:red;\">The scores are not available yet, please check back in some time.</p>",
    "c_s_OFPKT_SCORE_WAITING_MSG": "<p style=\"color:red;\">The scores are not available yet, please check back later.</p>", // IPP-5089
    "c_s_OFPKT_AUDIO_ERROR_PROCESS_MSG": "<p>The audio clip could not be processed because of some errors, please reassign the assignment to the student and ask them to re record the audio clip.</p>",
	"c_s_DIR_SPEAKER" : "Tap the green play button to listen to the audio and begin the timer.",
  //CLASSVIEW-518
	// "c_s_DIR_READ" : "Read along with the audio, marking any miscues or errors by tapping on the word in the text below. Tap the word again to deselect it.",
	"c_s_DIR_READ" : "Read along with the audio, marking any miscues or errors by tapping on the word in the text below. Tap the word again to deselect it. To calculate the total number of words in the selected passage, use the \"FW\" (First Word) and \"LW\" (Last Word) buttons. First, click \"FW\", then click on the first word of the selected passage. Next, click \"LW\", then click on the last word of the selected passage. To reset and clear the selections, click on \"R\" (Reset).",
	"c_s_DIR_TAP_INS" : "If the student inserts a word that does not belong, tap <label style='font-size: 22px;vertical-align: bottom;'>+</label> on Insertions to the right.",
	"c_s_DIR_TAP_STOP" : "When the audio is complete, hover over or tap on the last word read and input the total Words Read in the box on the right. If you do tap on the word, be sure to deselect it so it is not counted as an error. Students should only be scored for the portion of the passage they have read.",
	"c_s_DIR_SCORE_EXP": "Use the slider to score Expression.",
	"c_s_OF_SCORE_CONFIMR_MSG": "Are you sure you want to score the Oral Fluency Audio?",
	"c_s_OFPKT_HEADING" : "Tap Score to assess the student's oral reading fluency.</p><p>To reassign an oral fluency section to student, select Reassign.",
	"c_s_OFRUB_DIR_HEADING" : "Directions",
	"c_s_OFRUB_NOTE": "<strong>Note:</strong> Self-corrections do not count as actual errors. If the student makes the same error more than once, such as mispronouncing the same word multiple times, count it as one error.",
	"verbIds": {
		"c_s_OF_SCO_SCORE_BTN":"OF-RUB-OPEN-BTN",
		"c_s_OF_SCO_REASSGN":"OF-REASSGN",
		"c_s_OF_SCO_DONE_BTN":"OF-SCORE-DONE-BTN",
		"c_s_OF_SCO_CANCEL_BTN":"OF-SCORE-CANCEL-BTN",
		"c_s_OF_RUB_STOP_AUD":"OF-RUB-STOP-AUD",
		"c_s_OF_RUB_PLAYPAUSE_AUD":"OF-RUB-PLAYPAUSE-AUD",
		"c_s_OF_RUB_INS_SUB":"OF-RUB-INS-SUB",
		"c_s_OF_RUB_INS_ADD":"OF-RUB-INS-ADD",
		"c_s_OF_RUB_WORDSREAD":"OF-RUB-WORDSREAD",
		"c_s_OF_RUB_EXP":"OF-RUB-EXP",
		"c_s_OF_RUB_SCORE_BTN":"OF-RUB-SCORE-BTN",
		"c_s_OF_RUB_CANCEL_BTN":"OF-RUB-CANCEL-BTN"	
	}
	
};

var MESSAGE_INSTRUCTOR = {
    "c_s_ALERT_TAB_TXT": "ALERTS",
    "c_s_APP_UPDATE_TAB_TXT": "APP UPDATES",
    "c_s_DID_YOU_KNOW_TAB_TXT": "DID YOU KNOW?",
    "c_s_NOTES_TAB_TXT": "NOTES",
    "c_s_MESSAGE_CONTAINER_ID": "messageContainer",
    "c_s_ALERT_MESSAGE_CONTAINER_ID": "alertMessageContainer",
    "c_s_APP_MESSAGE_CONTAINER_ID": "appMessageContainer",
    "c_s_DYK_MESSAGE_CONTAINER_ID": "dykMessageContainer",
    "c_s_NOTES_MESSAGE_CONTAINER_ID": "notesMessageContainer",
    "c_s_MESSAGE_TEMPLATE_ID": "messageTemplate",
    "c_s_MESSAGE_LIST_TEMPLATE_ID": "messageListTemplate",
    "c_s_MESSAGE_DETAIL_TEMPLATE_ID": "messageDetailTemplate",
    "c_s_MESSAGE_TABS": "messageTabs",
    "c_s_MESSAGE_CLOSE_BUTTON": "messageCloseBtn",
    "c_s_MESSAGE_APP_TYPE": "AppUpdate",
    "c_s_MESSAGE_ALERT_TYPE": "Alert",
    "c_s_MESSAGE_DYK_TYPE": "Didyouknow",
    "c_s_MESSAGE_NOTES_TYPE": "Notes",
    "c_s_MESSAGE_WEBCLIENT_TYPE": "webclient",
    "c_s_MESSAGE_APP_VER_TXT": "App Ver",
    "c_s_MESSAGE_APP_VERBID": "T-MO-AU",
    "c_s_MESSAGE_ALERT_VERBID": "T-MO-A",
    "c_s_MESSAGE_NOTES_VERBID": "T-MO-N"
};


var ASSIGNMENT_ESSAY_TRAITS = [{
        "c_s_CODE": "CONV",
        "c_s_NAME": "Conventions"
    }, {
        "c_s_CODE": "FLUENCY",
        "c_s_NAME": "Fluency"
    }, {
        "c_s_CODE": "IDEAS",
        "c_s_NAME": "Ideas"
    }, {
        "c_s_CODE": "ORG",
        "c_s_NAME": "Organization"
    }, {
        "c_s_CODE": "VOICE",
        "c_s_NAME": "Voice"
    }, {
        "c_s_CODE": "WC",
        "c_s_NAME": "Word Choice"
    }, {
        "c_s_CODE": "CONV",
        "c_s_NAME": "Conventions"
    }];

var NOTEBOOK = {
    // for notebook related constants

    "c_s_TAB_JOURNAL": "Journal",
    "c_s_TAB_WORDBANK": "Wordbank",
    "c_s_TAB_CLASSNOTES": "Classnotes",
    /*==== IPP-3499 ====*/
    "c_s_TAB_RESOURCES": "Resources",
    "c_s_TAB_MY_WORK": "Mywork",
    /*== End IPP-3499 ==*/

    "c_s_NOTEBOOK_WRAPPER": "noteBookWrapper",
    "c_s_NOTEBOOK_LEFT_PANEL": "noteBookLeftPanel",
    "c_s_NOTEBOOK_RIGHT_PANEL": "noteBookRightPanel",
    "c_s_JOURNAL_LEFT_PANEL_CONTAINER": "journalLeftPanelContainer",
    "c_s_JOURNAL_RIGHT_PANEL_CONTAINER": "journalRightPanelContainer",
    "c_s_WORDBOOK_LEFT_PANEL_CONTAINER": "wordbookLeftPanelContainer",
    "c_s_WORDBOOK_RIGHT_PANEL_CONTAINER": "wordbookRightPanelContainer",
    "c_s_CLASSNOTES_LEFT_PANEL_CONTAINER": "classnotesLeftPanelContainer",
    "c_s_CLASSNOTES_RIGHT_PANEL_CONTAINER": "classnotesRightPanelContainer",
    "c_s_PORTFOLIO_LEFT_PANEL_CONTAINER": "portfolioLeftPanelContainer",
    "c_s_PORTFOLIO_RIGHT_PANEL_CONTAINER": "portfolioRightPanelContainer",
    "c_s_WORDBOOK_EDITOR_PANEL_CONTAINER": "wordbookEditorPanelContainer",
    "c_s_WORDBOOK_EDITOR_SAVE_CONTAINER": "wordbookSaveOperationContainer",
    "c_s_EDITOR_SAVE_CONTAINER": "button_bar_wrapper",
    "c_s_JOURNAL_TITLE_PANEL_CONTAINER": "journalTitlePanelContainer",
    "c_s_JOURNAL_EDITOR_PANEL_CONTAINER": "journalEditorPanelContainer",
    "c_s_JOURNAL_EDITOR_SAVE_CONTAINER": "journalSaveOperationContainer",
    "c_s_JOURNAL_TEACHER_COMMENT_CONTAINER": "journalTeacherCommentContainer",
    "c_s_JOURNAL_TEACHER_COMMENT_BOX_CONTAINER": "journal-comment-box-container",
    "c_s_JOURNAL_TEACHER_COMMENT_BOX": "notebook-comment",
    "c_s_NOTEBOOK_IMAGE_CONTAINER": "notes_book_icon",
    "c_s_NOTEBOOK_IMAGE_THUMB": "notebook_thumb",
    "c_s_NOTEBOOK_TAB": "tabs_s",
    "c_s_NOTEBOOK_LIST_WRAPPER": "notes_list_wrapper",
    "c_s_NOTEBOOK_ADD_NEW_JOURNAL": "addjnote",
    "c_s_NOTEBOOK_SENT_JOURNAL": "sendjnote",
    "c_s_NOTEBOOK_DELETE_JOURNAL": "deletejnote",
    "c_s_NOTEBOOK_ORGANIZE_JOURNAL": "organizejnote",
    "c_s_NOTEBOOK_SAVE_NOTE_BTTN": "savenote",
    "c_s_NOTEBOOK_CANCEL_NOTE_BTTN": "cancelnote",
    "c_s_NOTEBOOK_NOTE_TITLE": "notetitle",
    "c_s_NOTEBOOK_NOTE_DESCRIPTION": "notebookdescription",
    "c_s_NOTEBOOK_ADD_NEW_WORDBANK": "addwdnote",
    "c_s_NOTEBOOK_SEND_WORDBANK": "sendwdnote",
    "c_s_NOTEBOOK_DELETE_WORDBANK": "deletewdnote",
    "c_s_NOTEBOOK_ORGANIZE_WORDBANK": "organizewdnote",
    "c_s_NOTEBOOK_ADD_NEW_CLASSNOTE": "addclassnote",
    "c_s_NOTEBOOK_SEND_CLASSNOTE": "sendclassnote",
    "c_s_NOTEBOOK_DELETE_CLASSNOTE": "deleteclassnote",
    "c_s_NOTEBOOK_ORGANIZE_CLASSNOTE": "organizeclassnote",
    "c_s_NOTEBOOK_ADD_NEW_PORTFOLIO": "addportfolio",
    "c_s_NOTEBOOK_SEND_PORTFOLIO": "sendportfolio",
    "c_s_NOTEBOOK_DELETE_PORTFOLIO": "deleteportfolio",
    "c_s_NOTEBOOK_ORGANIZE_PORTFOLIO": "organizeportfolio",
    "c_s_NOTEBOOK_WORDBANK_TITLE": "wordtitle",
    "c_s_NOTEBOOK_WORDBANK_DESCRIPTION": "worddefinition",
    "c_s_NOTEBOOK_WORDBANK_SENTENCE": "wordsentence",
    "c_s_NOTEBOOK_MENU_NAME": "Notes",
    "c_s_NOTEBOOK_WORDBANK_WORD_TXT": "Word:",
    "c_s_NOTEBOOK_WORDBANK_WORD_TITLE": "Title:",
    "c_s_NOTEBOOK_WORDBANK_WORD_DEFINITITION": "Definition:",
    "c_s_NOTEBOOK_WORDBANK_WORD_SENTENCE": "Sentence:",
    "c_s_NOTEBOOK_WORDBANK_SAVE_TEXT": "Save Note",
    "c_s_NOTEBOOK_WORDBANK_SAVE_COMMENT_TEXT": "Save Comment", // IPP-4460
    "c_s_NOTEBOOK_WORDBANK_CANCEL_TEXT": "Cancel",
    "c_s_NOTEBOOK_TOOLTIP_CAUSE_TEXT": "Cause & Effect",
    "c_s_NOTEBOOK_TOOLTIP_STEP_TEXT": "Step By Step",
    "c_s_NOTEBOOK_TOOLTIP_STORYMAP_TEXT": "Storymap",
    "c_s_NOTEBOOK_TOOLTIP_THREECOLCHART_TEXT": "Three-Column Chart",
    "c_s_NOTEBOOK_TOOLTIP_TIMELINE_TEXT": "Timeline",
    "c_s_NOTEBOOK_TOOLTIP_TWOCOLCHART_TEXT": "Two-Column Chart",
    "c_s_NOTEBOOK_TOOLTIP_VENNDIAGRAM_TEXT": "Venn Diagram",
    "c_s_NOTEBOOK_SAVE": "Add",
    "c_s_NOTEBOOK_EDIT": "Edit",
    "c_s_NOTEBOOK_DELETE": "Delete",
    "c_s_NOTEBOOK_DEFAULT_SELECTED_UNIT": "Unit1",
    "c_s_NOTEBOOK_TEXT_AREA_HOLDER": "textareaholder",
    "c_s_NOTEBOOK_DUPLICATE_TITLE": "Duplicate Title Found!",
    "c_s_NOTEBOOK_SAVE_RECORD_ALERT": "Your data was saved!",
    "c_s_NOTEBOOK_DELETE_RECORD_ALERT": "Record deleted successfully!",
    "c_s_NOTEBOOK_PORTFOLIO_TABS": "tabs_notes",
    "c_s_NOTEBOOK_VIEW_ASSIGNMENT_AREA": "viewAssignmentPopupArea",
    "c_s_NOTEBOOK_PORTFOLIO_LEFT_PANEL": "noteBookLeftPanelPortfolio",
    "c_s_NOTEBOOK_PORTFOLIO_LEFT_PANEL_CA": "notebook-portfolio-left",
    "c_s_NOTEBOOK_LESSION_LABEL": "Lesson",
    "c_s_NOTEBOOK_PORTFOLIO_RECORD_EMPTY_TEXT": "No My Work Data Found Yet. <br />Please come back later.",
    "c_s_NOTEBOOK_VIEW_RESOURCE_AREA": "viewResourcePopupArea",
    "c_s_NOTEBOOK_VIEW_RESOURCE_BACK_BTN": "resourcebackbtn",
    "c_s_NOTEBOOK_CLOSE_NOTEBOOK_BTN": "closenotebook",
    "c_s_NOTEBOOK_ORGANIZE_CLASSNOTE_TOOLTIP": "notebook_organize_classnote_tooltip",
    "c_s_RESOURCE_CLOSE_BTN": "resource_close_btn",
    "c_s_NOTEBOOK_JOURNAL_RECORD_EMPTY_TEXT": "No Journal Created Yet!",
    "c_s_NOTEBOOK_WORDBANK_RECORD_EMPTY_TEXT": "No Word bank Created Yet!",
    "c_s_NOTEBOOK_CONFIRM_JOURNAL_DELETE": "Do you really want to delete this Journal?",
    "c_s_NOTEBOOK_CONFIRM_WORDBANK_DELETE": "Do you really want to delete this Wordbank?",
    "c_s_NOTEBOOK_LOADING_TXT": "Loading",
    "c_s_NOTEBOOK_CLASSNOTES_CAUSE_EFFECT": "actioncauseeffect",
    "c_s_NOTEBOOK_CLASSNOTES_STEP_BYSTEP": "actionstepbystep",
    "c_s_NOTEBOOK_CLASSNOTES_STORY_MAP": "actionstorymap",
    "c_s_NOTEBOOK_CLASSNOTES_THREE_COLUMN_CHART": "actionthreecolumnchart",
    "c_s_NOTEBOOK_CLASSNOTES_TIME_LINE": "actiontimeline",
    "c_s_NOTEBOOK_CLASSNOTES_TWO_COLUMN_CHART": "actiontwocolumnchart",
    "c_s_NOTEBOOK_CLASSNOTES_VEN_DIAGRAM": "actionvendiagram",
    "c_s_NOTEBOOK_TIMELINE_DATELABEL_TXT": "Date",
    "c_s_NOTEBOOK_TIMELINE_EVENTLABEL_TXT": "Event",
    "c_s_NOTEBOOK_CLASSNOTES_STEP_TXT": "Step",
    "c_s_NOTEBOOK_CLASSNOTES_CHARACTERSLABEL_TXT": "Characters",
    "c_s_NOTEBOOK_CLASSNOTES_SETTINGLABEL_TXT": "Setting",
    "c_s_NOTEBOOK_CLASSNOTES_PROBLEMLABEL_TXT": "Problem",
    "c_s_NOTEBOOK_CLASSNOTES_EVENTLABEL_TXT": "Events",
    "c_s_NOTEBOOK_CLASSNOTES_SOLUTIONLABEL_TXT": "Solution",
    "c_s_NOTEBOOK_CLASSNOTES_SAVE_TEXT": "Save Note",
    "c_s_NOTEBOOK_CLASSNOTES_CANCEL_TEXT": "Cancel",
    "c_s_NOTEBOOK_CAUSEEFFECT_GRAPH": "causeandeffect",
    "c_s_NOTEBOOK_STEPBYSTEP_GRAPH": "stepbystepgraph",
    "c_s_NOTEBOOK_STORYMAP_GRAPH": "storymapgraph",
    "c_s_NOTEBOOK_THREECOLUMN_GRAPH": "threecolumngraph",
    "c_s_NOTEBOOK_TIMELINE_GRAPH": "timelinegraph",
    "c_s_NOTEBOOK_TWOCOLUMN_GRAPH": "twocolumngraph",
    "c_s_NOTEBOOK_VENDIAGRAM_GRAPH": "vendiagramgraph",
    "c_s_NOTEBOOK_EDITORPANEL_DATA": "editorpaneldata",
    "c_s_NOTEBOOK_CAUSEEFFECT_DATA": "causeandeffectdata",
    "c_s_NOTEBOOK_STEPBYSTEP_DATA": "stepbystepdata",
    "c_s_NOTEBOOK_STORYMAP_DATA": "storymapdata",
    "c_s_NOTEBOOK_THREECOLUMN_DATA": "threecolumndata",
    "c_s_NOTEBOOK_TIMELINE_DATA": "timelinedata",
    "c_s_NOTEBOOK_TWOCOLUMN_DATA": "twocolumndata",
    "c_s_NOTEBOOK_VENDIAGRAM_DATA": "vendiagramdata",
    "c_s_NOTEBOOK_CLASSNOTES_TITLE_TXT": "Title:",
    "c_s_NOTEBOOK_CLASSNOTES_EDITOR_PANEL": "classnoteseditorpanel",
    "c_s_NOTEBOOK_CLASSNOTES_CLOSE_ICON": "closebtn",
    "c_s_NOTEBOOK_CLASSNOTES_CONTAINER_BORDER": "cotainerborder",
    "c_s_NOTEBOOK_CONFIRM_CLASSNOTES_DELETE": "Do you really want to delete this Classnote?",
    "c_s_NOTEBOOK_CONFIRM_CLASSNOTE_SECTION_DELETE": "Do you really want to delete this section?",
    "c_s_NOTEBOOK_SAVE_CANCEL_CONTAINER": "button_bar_wrapper",
    "c_s_NOTEBOOK_MAIN_CONTAINER": "editable",
    "c_s_NOTEBOOK_EMPTY_JOURNAL_LABEL": "journal_empty_lebel",
    "c_s_NOTEBOOK_EMPTY_WORDBANK_LABEL": "wordbank_empty_lebel",
    "c_s_NOTEBOOK_EMPTY_TITLE_ALERT_TXT": "The note title cannot be empty",
    "c_s_NOTEBOOK_EMPTY_TITLE_TXT": "Insert Title Here",
    "c_s_NOTEBOOK_CLASSSNOTES_MENU_NAME": "Saved Notes",
    "c_s_THUMB_VERBID": "S-NTO-TMP",
    "c_s_BENCHMARK_ASSEMENT": "Benchmark Assessment(s)",
    "c_s_PORTFOLIO_LESSION_LABEL": "Lessons",
    "c_s_NOTEBOOK_CURRENT_BOOK": "currentbook",
    "c_s_NOTEBOOK_CREATE_NOTE_COMMENT": "add-note-comment",
    "c_s_NOTEBOOK_CURRENT_BOOK_LABEL": "My Current Reading",
    "c_s_NOTEBOOK_CURRENTBOOK_TOOLTIP": "notebook_organize_currentbook_tooltip",
    "c_s_NOTEBOOK_VIEW_CURRENTREADING_AREA": "viewCurrentReadingPopupArea",
    "c_s_NOTEBOOK_VIEW_CURRENTREADING": "viewCurrentReading",
    "c_s_NOTEBOOK_VIEW_MENU_TXT_LENGTH": 25,
    "c_s_NOTEBOOK_VALID_TITLE_TXT": "Insert a Valid Title",
    "c_s_NOTEBOOK_WHOLE_GROUP_RESOURCE_TXT": "Whole Group",
    "c_s_NOTEBOOK_VOCABULARY_RESOURCE_TXT": "Vocabulary",
    "c_s_WRC_ASSEMENT": "Weekly Reading Check(s)",
    "c_s_NOTEBOOK_RATA_BOOK_LABEL": "Read Aloud Think Aloud",
    "c_s_NOTEBOOK_GRADE_ASSEMENT": "Grade Assessment(s)",
    "c_s_MESSAGES": {
        "c_s_DATASET_EMPTY": "No records found for Unit %d.",
        "c_s_INVALID_DATA_STRUCTURE": "Data structure not updated for %s."
    },
    "c_s_TOTUNITS": 1
};

var NOTEBOOK_TABS = [
    {
        "c_s_CODE": "Journal",
        "c_s_NAME": "Journal",
        "c_s_CSS": "journal",
        "c_s_VERBID": "S-NTO-JO"
    }, {
        "c_s_CODE": "Wordbank",
        "c_s_NAME": "Word Bank",
        "c_s_CSS": "WordBank",
        "c_s_VERBID": "S-NTO-WBO"
    }, {
        "c_s_CODE": "Classnotes",
        "c_s_NAME": "Class Notes",
        "c_s_CSS": "ClassNotes",
        "c_s_VERBID": "S-NTO-CNO"
    }, {
        "c_s_CODE": "Mywork",
        "c_s_NAME": "My Work",
        "c_s_CSS": "my_work",
        "c_s_VERBID": "S-NTO-PO"
    }, {
        "c_s_CODE": "Resources",
        "c_s_NAME": "Resources",
        "c_s_CSS": "resources",
        "c_s_VERBID": "S-NTO-PO"
    }
];

var NOTEBOOK_PORTFOLIO_TABS = [{
        "c_s_CODE": "Mywork",
        "c_s_NAME": "My Work",
        "c_s_VERBID": "S-NTO-PO"
    }/* ,
     {	
     "c_s_CODE": "Resources",
     "c_s_NAME" : "Resources",
     "c_s_VERBID": "S-NTO-PO"
     } */];

var POPUP_VIEW = {
    'c_s_BROADCAST_STUD_LIST': 'studList',
    'c_s_QUERY_PARAM_ACTION': 'action',
    'c_s_QUERY_PARAM_ACTION_MODAL': 'action_modal',
    'c_s_QUERY_PARAM_MODE': 'mode',
    'c_s_QUERY_PARAM_ASSIGNMENT_ID': 'assignment-id',
    'c_s_QUERY_PARAM_ITEM_ATTEMPT_ID': 'item-attempt-id',
    'c_s_QUERY_PARAM_ASSIGNMENT_COMPLETION_STATUS': 'assignment-completion-status',
    'c_s_QUERY_PARAM_STUDENT_ID': 'student-id',
    'c_s_QUERY_PARAM_ASSIGNMENT_TYPE': 'assignment-type',
    'c_s_QUERY_PARAM_ASSIGNMENT_SUB_TYPE': 'assignment-sub-type',
    'c_s_QUERY_PARAM_STUDYPLAN_SUB_TYPE': 'study-plan-sub-type',
    'c_s_QUERY_PARAM_HEADER_TITLE': 'header-title',
    'c_s_QUERY_PARAM_OPENED_FROM': 'opened-from',
    'c_s_QUERY_PARAM_TARGET_GRADE_CODE': 'target-grade-code',
    'c_s_ACTION_PLAY': 'play',
    'c_s_ACTION_VIEW': 'view',
    'c_s_ACTION_MODAL': 'modal',
    'c_s_MODE_INSTRUCTOR': 'instructor',
    'c_s_MODE_STUDENT': 'student',
    'c_s_EBOOK_RETURN': 'ebookReturn',
    'c_s_MODE_NOTEBOOK': 'journal',
    'c_s_QUERY_PARAM_ACTION_MODAL_PROJECT': 'action_project',
    'c_s_ACTION_MODAL_PROJECT': 'action_project',
};

var PERFORMANCE = {
    // Constants for all mode view
    "c_s_MODE_PIE_CHART": "modePieChart",
    "c_s_MODE_LINE_GRAPH": "modeLineGraph",
    "c_s_MODE_DETAILED_VIEW": "modeDetailedView",
    "c_s_MODE_SKILL_REPORT": "modeSkillReport",
    // Constatants for All Containers
    "c_s_CONTAINER_LEFT_PANEL": "containerLeftPanel",
    "c_s_CONTAINER_MAIN_DROPDOWN": "containerMainDropDown",
    "c_s_CONTAINER_RIGHT_PANEL_HEADER": "containerRightPanelHeader",
    "c_s_CONTAINER_RIGHT_PANEL_INNER": "containerRightPanelInner",
    "c_s_CONTAINER_SLIDER": "containerSlider",
    "c_s_CONTAINER_STUDENT_LIST": "containerStudentList",
    "c_s_CONTAINER_BENCHMARK": "benchmarkContainer",
    "c_s_CONTAINER_CHART": "chart",
    "c_s_RIGHT_PANEL_FOR_NOTE_BENCHMARK": "rightPanel4NoteBenchmark",
    // Constatants for All Templates
    "c_s_TEMPLATE_LEFT_PANEL": "templateLeftPanel",
    "c_s_TEMPLATE_LINE_GRAPH_TYPE_DROPDOWN": "templateLGTypeDropDown",
    "c_s_TEMPLATE_SKILL_DROPDOWN": "templateSkillDropDown",
    "c_s_TEMPLATE_RIGHT_PANEL_HEADER": "templateRightPanelHeader",
    "c_s_TEMPLATE_SLIDER": "templateSlider",
    "c_s_TEMPLATE_LINE_GRAPH": "templateLineGraph",
    "c_s_TEMPLATE_WARNING": "templateWarning",
    "c_s_TEMPLATE_PERFORMANCE_INFO_BUBBLE": "templatePerformanceInfoBubble",
    "c_s_TEMPLATE_PERFORMANCE_DETAIL_VIEW": "templatePerformanceDetailView",
    "c_s_TEMPLATE_PERFORMANCE_SKILL_REPORT": "templatePerformanceSkillReport",
    "c_s_TEMPLATE_SKILL_REPORT_RIGHT_PANEL_HEADER": "templateSkillReportRightPanelHeader",
    // Constants for All Buttons
    "c_s_BTN_TAB_DESC": "buttonTabDesc",
    "c_s_BTN_TAB_REFRESH": "buttonTabRefresh",
    "c_s_BTN_TOP_MENU_CLASS": "buttonTopMenu",
    "c_s_BTN_DISP_STUD_LIST": "buttonDisplayStudentList",
    "c_s_BTN_ALL_STUD": "buttonAllStudent",
    "c_s_SLIDER": "slider-range",
    "c_s_WARNING_TAB": "warningTab",
    "c_s_WARNING_MODE": "warning",
    // Constants for All Text associated with Performance Tab
    "c_s_TXT_SUGGESTIONS": "SUGGESTIONS",
    "c_s_TXT_ALL_STUDENT": "ALL STUDENTS",
    "c_s_TXT_WARNINGS": "WARNINGS",
    "c_s_TXT_DISPLAY": "Students performing below target | Unit ",
    "c_s_TXT_PARTIAL_STUDENT": "PARTIAL CLASS",
    "c_s_TXT_UNIT": "Unit",
    "c_i_SCORED_STATUS": 'scored',
    // others
    "c_s_PERFORMANCE_NOTE_CONTENT": "performanceNoteContent",
    "c_s_PERFORMANCE_INFO_BUBBLE": "performanceInfoBubble",
    "c_s_RIGHT_PANEL_SUB_HEADER": "rightPanelSubHeader",
    "c_s_90_MINUTE_CLASS": "90 Minute Class",
    "c_s_UNIT_SCALE_CLASS": "unit-scale",
    // labels
    "c_s_LABEL_UNITS": "Units",
    "c_s_LABEL_LESSONS": "Lessons",
    "c_s_LABEL_MARKS": "Percentage Score",
    "c_s_LABEL_WORD_COUNT": "Word Count",
    "c_s_NOTEBOOK_VIEW_ASSIGNMENT_AREA": "viewAssignmentPopupArea",
    "c_s_LBL_READING_COMPREHENSION": "reading_comp",
    "c_s_LBL_IWT": "iwt",
    "c_s_LBL_IWT_HIGHTLIGHT_DND_SLIDE": "iwthighlightslide_iwtdndslide",
    "c_s_LBL_IWT_SUMMARY_SLIDE": "iwtsummaryslide",
    "c_s_LBL_IWT_TEXTANSWER_SLIDE": "iwttextanswerslide",
    "c_s_LBL_PARAGRAPH": "paragraph",
    "c_s_LBL_ESSAY": "essay",
    "c_s_LBL_WRITING": "writing",
    "c_s_LBL_WORD_COUNT": "word_count",
    "c_s_LBL_WORD_COUNT_IR": "word_count_ir",
    "c_s_LBL_WORD_COUNT_RATA": "word_count_rata",
    "c_s_LBL_WORD_COUNT_TTR": "word_count_ttr",
    "c_s_LBL_READING_LEVEL": "reading_level",
    "c_s_LBL_READING_LEVEL_YAXIS_TXT": "Level",
    "c_s_IR_MAX_SCORE": 100,
    "c_s_INSTRUCTOR_RUBRIC_MAX_PERCENT": 100,
    "c_s_SUMMARY_WRITING_MAX_SCORE": 100,
    "c_s_READING_CHECKPOINT_MAX_PERCENT": 100,
    "c_s_READING_CHECKPOINT_MAX_SCORE": 2,
    "c_a_GRAPFH_LINE_COLOR": ['#444444', '#3366cc', '#cc33cc'],
    // For Group
    "c_s_LBL_LINK_SELECT_ALL": "Select All",
    "c_s_LBL_LINK_DESELECT_ALL": "Deselect All",
    "c_s_LBL_BTN_FILTER": "Filter",
    "c_s_LBL_BTN_CANCEL": "Cancel",
    "c_s_NO_STUDENT_SELECT_TXT": "Please select at least one student.",
    "c_s_ID_LINK_SELECT_ALL": "linkSelectAll",
    "c_s_ID_LINK_DESELECT_ALL": "linkDeselectAll",
    "c_s_ID_BTN_FILTER": "btnFilter",
    "c_s_ID_BTN_CANCEL": "btnCancel",
    "c_s_APP_VER_SBR": "3.1.6", // SBR i.e. Skill Based Reporting will be available on greater version of iLit 3.1.6
	"c_s_LABEL_WEEKS": "Weeks",
	 "c_s_TXT_WEEKS": "Weeks",
	 "c_s_LBL_LIBRARY_RESPONSE_PROMPTS": "libraryresponseprompt",
	 
	 // for oral fluency
	"c_s_ORAL_FLUENCY": "oral_fluency",
	"c_s_WCPM": "wcpm",
	"c_s_WARNING_HEADER_DISPLAY": "Students performing below target | Week ",
	"c_s_WARNING_HEADER_TXT_DISPLAY": "Students performing below target",
  	// for ILIT45-ELL
  	"c_s_ILIT45_ELL": "ilit45eca",
  	"c_s_VOCABULARY_STUDY_PLAN": "Vocabulary Study Plan",
  
};
var CONFERENCE = {
    "c_s_ASSIGNMENT_TYPE": "assignment",
    "c_s_STRATEGY_TYPE": "strategy",
    "c_s_INDIVIDUAL_TYPE": "individuals",
    "c_s_TTR_CONFERENCING_VERBID": "T-LTO-TTR-C",
    "c_s_WT_CONFERENCING_VERBID": "T-LTO-WT-C",
};

var ITEM_SUB_TYPE = {
    "c_s_ASSESSMENT": ["unitbenchmark", "wrc", "grade"],
    "c_s_INTERACTIVE_READING": "INTERACTIVE READING",
    "c_s_iPRACTICE": "iPRACTICE",
    "c_s_WRITING": ["essay", "paragraph"],
    "c_s_STUDY_PLAN": "STUDY PLAN",
    "c_s_WORD_SLAM": "word_slam"
};

var TODO_LIST = {
    "c_s_ASSESSMENT": {
        "scored": [],
        "completed": [],
        "in progress": [],
        "assigned": [],
        "deleted": []
    },
    "c_s_INTERACTIVE_READING": {
        "scored": [],
        "completed": [],
        "in progress": [],
        "assigned": [],
        "deleted": []
    },
    "c_s_STUDY_PLAN": {
        "scored": [],
        "completed": [],
        "in progress": [],
        "assigned": [],
        "deleted": []
    },
    "c_s_iPRACTICE": {
        "scored": [],
        "completed": [],
        "in progress": [],
        "assigned": [],
        "deleted": []
    },
    "c_s_WRITING": {
        "scored": [],
        "completed": [],
        "in progress": [],
        "assigned": [],
        "deleted": []
    },
    "c_s_WORD_SLAM": {
        "scored": [],
        "completed": [],
        "in progress": [],
        "assigned": [],
        "deleted": []
    },
    "c_s_OTHERS": {
        "scored": [],
        "completed": [],
        "in progress": [],
        "assigned": [],
        "deleted": []
    }
};

var PERCENTILE = {
    "c_s_PERCENTILE": "percentile",
    "c_s_READING_CHECKPOINT": "reading-checkpoint",
    "c_s_SUMMARY": "summary"
};

var ASSIGNMENT_CATEGORY = [
    {
        "c_s_CATEGORY": "INTERACTIVE READING",
        "c_s_DISPLAY_NAME": "Interactive Reading",
        "c_s_ALIAS": "iwt"
    },
    {
        "c_s_CATEGORY": "STUDY PLAN",
        "c_s_DISPLAY_NAME": "Study Plan",
        "c_s_ALIAS": "studyplan"
    },
    {
        "c_s_CATEGORY": "VOCABULARY, WORD STUDY, AND ACADEMIC TEXTS",
        "c_s_DISPLAY_NAME": "Vocabulary, Word Study, and Reading Comprehension",
        "c_s_ALIAS": {
            "0": "phonictextbasedslide",
            "1": "pluralnouns",
            "2": "digraphs",
            "3": "word_families",
            "4": "syllables",
            "5": "word_sort",
            "6": "rotatinglists",
            "7": "extendedphonic",
            "8": "word_slam",
            "9": "frs"
        }
    },
    {
        "c_s_CATEGORY": "iPRACTICE",
        "c_s_DISPLAY_NAME": "iPractice",
        "c_s_ALIAS": "dailyassignment"
    },
    {
        "c_s_CATEGORY": "WRITING",
        "c_s_DISPLAY_NAME": "Writing",
        "c_s_ALIAS": {
            "0": "essay",
            "1": "paragraph"
        }
    },
    {
        "c_s_CATEGORY": "MONITOR PROGRESS",
        "c_s_DISPLAY_NAME": "Monitor Progress",
        "c_s_ALIAS": {
            "0": "unitbenchmark",
            "1": "wrc",
            "2": "grade"
        }
    },
    {
        "c_s_CATEGORY": "INFORMATION",
        "c_s_DISPLAY_NAME": "Information",
        "c_s_ALIAS": "nsa"
    },
	{
        "c_s_CATEGORY": "Current Reading",
        "c_s_DISPLAY_NAME": "Current Reading",
        "c_s_ALIAS": "cr"
    },
	{
        "c_s_CATEGORY": "Current Read Aloud Think Aloud",
        "c_s_DISPLAY_NAME": "Current Read Aloud Think Aloud",
        "c_s_ALIAS": "crata"
    }
];

var ASSIGNMENT_CATEGORY_20 = [
    {
        "c_s_CATEGORY": "INTERACTIVE READING",
        "c_s_DISPLAY_NAME": "Interactive Reading",
        "c_s_ALIAS": "iwt"
    },
    {
        "c_s_CATEGORY": "STUDY PLAN",
        "c_s_DISPLAY_NAME": "Study Plan",
        "c_s_ALIAS": "studyplan"
    },
    {
        "c_s_CATEGORY": "VOCABULARY, WORD STUDY, AND ACADEMIC TEXTS",
        "c_s_DISPLAY_NAME": "Vocabulary, Word Study, and Reading Comprehension",
        "c_s_ALIAS": {
            "0": "phonictextbasedslide",
            "1": "pluralnouns",
            "2": "digraphs",
            "3": "word_families",
            "4": "syllables",
            "5": "word_sort",
            "6": "rotatinglists",
            "7": "extendedphonic",
            "8": "word_slam",
			"9": "frs"
        }
    },    
    {
        "c_s_CATEGORY": "WRITING",
        "c_s_DISPLAY_NAME": "Writing",
        "c_s_ALIAS": {
            "0": "essay",
            "1": "paragraph"
        }
    },
    {
        "c_s_CATEGORY": "MONITOR PROGRESS",
        "c_s_DISPLAY_NAME": "Monitor Progress",
        "c_s_ALIAS": {
            "0": "unitbenchmark",
            "1": "wrc",
            "2": "grade"
        }
    },
	{
        "c_s_CATEGORY": "Current Reading",
        "c_s_DISPLAY_NAME": "Current Reading",
        "c_s_ALIAS": "cr"
    },
	{
        "c_s_CATEGORY": "Current Read Aloud Think Aloud",
        "c_s_DISPLAY_NAME": "Current Read Aloud Think Aloud",
        "c_s_ALIAS": "crata"
    }
];

var ASSIGNMENT_CATEGORY_WTW = [
	{
		"c_s_CATEGORY": "INTERACTIVE SORT",
		"c_s_DISPLAY_NAME": "Interactive Sort", 
		"c_s_ALIAS": "interactive_sort"
	},
	{
        "c_s_CATEGORY": "Current Reading",
        "c_s_DISPLAY_NAME": "Current Reading",
        "c_s_ALIAS": "cr"
    },
	{
        "c_s_CATEGORY": "Current Read Aloud Think Aloud",
        "c_s_DISPLAY_NAME": "Current Read Aloud Think Aloud",
        "c_s_ALIAS": "crata"
    }
];

var SETUP = {
    "c_s_HEADING_APP_CONFIG": "App Configuration Settings",
    "c_s_HEADING_ACADEMIC_CALENDAR": "Academic Calendar",
    "c_s_LBL_ASSIGNMENT_SEND_MODE": "Assignment Mode",
	"c_s_LBL_ASSIGNMENT_MANUAL_SCORE": "Manually Score?",
    "c_s_LBL_OF_SCORE": "Oral Fluency",
    "c_s_LBL_PS": "Show Global Starz",
    "c_s_LBL_CRITICAL_RESPONSE": "Critical Response",
	"c_s_LBL_LIBRARY_RESPONSE":"Library Response",
	"c_s_LBL_ESSAY_WRITING":"Essay Writing",
    "c_s_LBL_AL": "Avatar Library",
    "c_s_LBL_GRAPH_SNAP": "Class Graph View",
    "c_s_LBL_DEFAULT_STUD_DATA": "Student Data Default",
    "c_s_GRADE_POPUP_TITLE": "Send GRADE first?",
    "c_s_GRADE_POPUP_MESSAGE": "We recommend sending GRADE to the students before sending assignments. Sending GRADE will ensure that the assignments are properly leveled. Otherwise, default assignment levels will be sent. <br /><br /><b>Would you like to continue sending the assignments or send GRADE</b>",
    "c_s_ASM_INFO": "This selection allows teachers to manually send assignments each week or allows the iLit system to send each week's core assignments to each student based on individual student progress. Extra assignments (+ Assignments) can be sent manually by the teacher when in Automatic mode.",
    "c_s_AOFS_INFO": "Several activities evaluate students' ability to read aloud with fluency and their work is automatically scored using iLit's Versant Scoring services. The teacher may choose to review the scores and either accept or reassign the activity to the student, or may choose to have the scores automatically accepted. Turning this feature On will offer you an opportunity to review the audio, turning it Off will automatically accept the system's scores.",
    "c_s_SCR_INFO": "The Interactive Readers feature an activity called Critical Response, in which students write a response to the text they have read. This response must be manually scored by the teacher using a rubric which is provided. If you wish to include this writing activity in the Interactive Reader, select On. If you wish for this activity to be omitted, select Off. The other activities within the Interactive Reader will be retained if Off is selected.",
    "c_s_CGN_INFO": "The Snapshot view offers a quick view of student. The graphs at the top of the screen capture entire class data. You may choose to view only class data or you may choose to introduce additional spark lines to compare the class against other classes within the district, against all other users globally, or both.",
    "c_s_SDS_INFO": "The individual student data captured in the Snapshot view includes GLE, Lexile, Interactive Reading Level, Starz, or their score for this grading period. In order to highlight a specific datapoint, select which of these criteria is most important to you and therefore, your current default. Note, all criteria will be displayed by tapping on individual students.",
    "c_s_PS_INFO": "If you are connected to a projector in your classroom, you may wish to project student Starz count to the class. This data may be viewed for only your class or school / global users can be added to the display. Selecting On will enable school/global data to be projected.",
    "c_s_CALENDAR_INFO": "The Academic Calendar provides a visual calendar for grading periods which is helpful with the Organizer and Assignment dashboards. This is not required to utilize iLit 20 but is recommended.",
    "c_s_ASM_MANUAL": "manual",
    "c_s_ASM_AUTO": "auto",
	"c_s_ASM_MANUAL_DIST": "Manual",
    "c_s_ASM_AUTO_DIST": "Auto",
	"c_s_ASM_NONE_DIST": "None",
    "c_s_COLOR_TAB_LEN": 7,
    "c_s_WEEK_TAB_LEN": 30,
    "c_s_SAVED_SETTINGS_MSG": "Settings Saved Successfully.",
    "c_s_SAVED_CALENDAR_SETTINGS_MSG": "Calendar Saved Successfully.",
    "c_s_RESET_CALENDAR_SETTINGS_MSG": "Calendar Reset Successfully.",
    "c_s_RESET_CONFIRM_TXT": "Are you sure you want to reset? The currently selected period block as well as any other period blocks following it will be reset.",
    "c_s_NEED_TO_RESET_ALERT": "You need to reset this to modify",
    "c_s_BLANK_PERIOD_CONFIRM_TXT": "You need to add weeks to \"%d\". Click Cancel to go back and add weeks. If you click Continue, then \"%d\" will not be saved.",
    "c_s_SELECT_TAB_MSSG": "You need to select the period block to reset.",
    "c_s_LBL_DEFAULT_IR_LEVEL": "IR level",
	"c_s_DEFAULT_IR_INFO": "This selection allows the Lead Teacher to manually change the default reading level of the first Interactive Reader which will be sent to each student in the class. The default reading level is 5, but the teacher can update this to any value from 1 to 9, as she deems fit. This default reading level can be changed before either Week 1 assignments or GRADE is sent."
};

var SETUP_KEYS = {
    "c_s_ASM": {
        "c_s_ACTUAL_KEY": "ASSIGNMENT_SENDING_MODE",
        "c_s_KEY": "ASM",
        "c_s_DATA_TYPE": "NUMERIC"
    },
    "c_s_AOFS": {
        "c_s_ACTUAL_KEY": "ACCEPT_ORAL_FLUENCY_SCORE",
        "c_s_KEY": "AOFS",
        "c_s_DATA_TYPE": "NUMERIC"
    },
    "c_s_SCR": {
        "c_s_ACTUAL_KEY": "SHOW_CRITICAL_RESPONSE",
        "c_s_KEY": "SCR",
        "c_s_DATA_TYPE": "NUMERIC"
    },
    "c_s_CGN": {
        "c_s_ACTUAL_KEY": "CLASS_GRAPH_SNAPSHOT",
        "c_s_KEY": "CGN",
        "c_s_DATA_TYPE": "NUMERIC"
    },
    "c_s_SDS": {
        "c_s_ACTUAL_KEY": "STUDENT_DATA_SNAPSHOT",
        "c_s_KEY": "SDS",
        "c_s_DATA_TYPE": "NUMERIC"
    },
    "c_s_PS": {
        "c_s_ACTUAL_KEY": "PROJECT_SNAPSHOT",
        "c_s_KEY": "PS",
        "c_s_DATA_TYPE": "NUMERIC"
    },
    "c_s_AL": {
        "c_s_ACTUAL_KEY": "AVATAR_LIBRARY",
        "c_s_KEY": "AL",
        "c_s_DATA_TYPE": "NUMERIC"
    },
    "c_s_ACT": {
        "c_s_ACTUAL_KEY": "ACADEMIC_CALENDAR",
        "c_s_KEY": "ACT",
        "c_s_DATA_TYPE": "STRING"
    },
    "c_s_GPS": {
        "c_s_ACTUAL_KEY": "GRADE_PERIOD_START_DATE",
        "c_s_KEY": "GPS",
        "c_s_DATA_TYPE": "NUMERIC"
    }
};

var c_s_INCREMENTAL_SAVE_TEMPLATES = [
	"iwtsummaryslide",
	"iwttextanswerslide"	
]
var c_s_INCREMENTAL_SAVE_ASSIGNMENT_TYPES = [	
	"essay",
	"paragraph",
	"assessment",
	"pretest",
	"practice",
	"posttest",
	"dailyassignment",
	"word_slam",
	"rotatinglists",
	"digraphs",
	"word_sort",
	"syllables",
	"word_families",
	"pluralnouns",
	"interactive_sort",
	"frs"
]