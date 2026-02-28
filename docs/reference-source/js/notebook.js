/**
 *  notebook.js - JavaScript document for Student Notebook View
 *  (c) 2014-2015 iLit. All rights reserved. 
 *
 * @author LearningMate Solutions Private Limited 
 * @version 
 * @license 
 */
 var iClickCnt = 0;
 // Declare NotebookView object 
 
function NotebookView () {}

// Notebook properties
NotebookView.model = null;
NotebookView.tabType = null;

NotebookView.noteId = null;
NotebookView.noteRefId = null;
NotebookView.refUnitNumber = null;
NotebookView.refEbookclick = 0;
NotebookView.oAttemptInfo = null;
//NotebookView.noteprevTitle = null;
//NotebookView.noteprevText = null;
NotebookView.refOtherData = null;
NotebookView.shortNoteText = null;

/*Incremental Save declaration starts */
//NotebookView.bEnabledIncrementalSave = false;
NotebookView.saveAttemptDataTimer = null;
NotebookView.iSaveAttemptDataTimerInterval = null;
NotebookView.bIncrementalSaveTimerStarted = false; //used for preventing multiple calls of incrementalSave() method. 
NotebookView.oPrevJournalViewAttemptData = {};  // used to identify any attempt change for incremental save
NotebookView.oJournalViewAttemptData = {}; //hold the note attempt data 
NotebookView.sPrevNoteId = '';
NotebookView.sPrevSavingNoteId = null;
NotebookView.sPrevTitle = '';
NotebookView.sPrevText = '';
/*Incremental Save declaration ends */
	
NotebookView.counter = 0; //for ILIT-6006. maintains a counter of how many times saveData is called

/**
* @method: init 
* @uses  : for initialize the object of NotebookView
* @return void;
*/
NotebookView.init = function (model) {
	// CLAS-1062 start 
	var base = window.parent.document.title.split(" - ")[0];
	window.parent.document.title = base +" - Notebook";
	// CLAS-1062 end 
	var oSelf = this;
	oSelf.model = model;
	if (
		($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_NOTEBOOK && NotebookView.refEbookclick == 0) ||
		$_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR
	) {
		HideNativeBottomBar(true);
		oSelf.showView();
	}
	else {
		oSelf.render(oSelf);
	}
	
	//ILIT-1247 : disable browser back button 
	disableBrowserBackButton();
};

/**
* @method: render 
* @uses  : for render the notebook's initial View
* @return void;
*/
 
NotebookView.render = function (oSelf) {
	//render the landing page
	$("#" + NOTEBOOK.c_s_NOTEBOOK_WRAPPER).empty().html(_.template($('#notesLandingPage').html()));
	//$("#notes_wrapper").hide();
	oSelf.bindEvents(oSelf);
	oSelf.resize();
   setTimeout(function(){
		$("#" + NOTEBOOK.c_s_NOTEBOOK_IMAGE_THUMB).focus();	
	}, 500);
	// CLAS-1074 start accessibility
	$(parent.document).find("#wrapperFrame").attr({ //Frames must have title or aria-label attribute
		// "aria-label" : "Nootebook",
	 	"title" : "Notebook"
	});
	// CLAS-1074 end accessibility
	
}

/**
* @method: resize 
* @uses  : resizing the document
* @return void;
*/

NotebookView.resize = function () {
	var windowHeight = $(window).height();
	var notesLandingPadding = parseInt($(".notes_landing").css("padding-top")) + parseInt($(".notes_landing").css("padding-bottom"));
	var actualHeight = windowHeight - notesLandingPadding;
	$(".notes_book_icon").height(actualHeight);
};

/**
* @method: bindEvents 
* @uses  : for binding events of NotebookVIew
* @return void;
*/

NotebookView.bindEvents = function (oSelf) {
	$("#" + NOTEBOOK.c_s_NOTEBOOK_IMAGE_THUMB).focus();
	$("#" + NOTEBOOK.c_s_NOTEBOOK_IMAGE_THUMB)
		.off("click")
	   .on("click", function(e) {
			$(this).attr('aria-pressed','true');
			$(this).attr('aria-label','');
			oSelf.showView();
		   //ILIT-5334
		   if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		   }
		});
	$("#" + NOTEBOOK.c_s_NOTEBOOK_IMAGE_THUMB).off("keydown").on("keydown", function(e) {
			console.log('keydown')
			triggerClickOnThisElemApp(e,this);
	});
};
/**
* @method: showView 
* @uses: for getting current unit, week and lession and redirect user to gotoTabs
* @return void;
*/
NotebookView.showView = function () {
	var oSelf = this;
	
	$.nativeCall({
		'method':			'GetUnitWeekDetails',
		'globalResource':	'objCurrentUnitDetails',
		'beforeSend':		function () {
			$('body').css({'background-color': '#FFF'});
			$('.wrapper').hide();
			$("#loaderContainer").show();
		},
		'interval':			200,
		'breakAfter':		1000,
		'checkSuccess':		function () {
			return (typeof objCurrentUnitDetails.currentUnit != 'undefined');
		},
		'onComplete':		function () {
			NotebookView.refUnitNumber = objCurrentUnitDetails.currentUnit;
			NotebookView.sProductCode = objCurrentUnitDetails.productCode;
			//NotebookView.goToTabs(NOTEBOOK_TABS[0].c_s_CODE);
			if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) !== POPUP_VIEW.c_s_MODE_INSTRUCTOR) {			
				SetGoogleAnalytic(NOTEBOOK.c_s_THUMB_VERBID);
			}
			var gradeInfoDetailJSPath = objCurrentUnitDetails.gradeInfoDetailJSPath || ""; // blank string added to fix ILIT-1895
			if (gradeInfoDetailJSPath && NotebookView.sProductCode.match(GENERAL.c_s_PROD_TYPE_WTW)) {
				loadJS(gradeInfoDetailJSPath, function(){
					NotebookView.UnitNameArray = objPlannerData.unitsets.units;
					NotebookView.goToTabs(NOTEBOOK_TABS[0].c_s_CODE);
				});
			}
			else {
				NotebookView.goToTabs(NOTEBOOK_TABS[0].c_s_CODE);
			}
			//incremental save : fetch incremental save timer config
			NotebookView.fetchIncrementalSaveTimerConfig();

		},
		'onError':			function () {
			objCurrentUnitDetails = {"currentLesson":"","currentUnit":"","currentWeek":"","productCode":""};
				
			NotebookView.refUnitNumber = objCurrentUnitDetails.currentUnit;
			NotebookView.sProductCode = objCurrentUnitDetails.productCode;
			NotebookView.goToTabs(NOTEBOOK_TABS[0].c_s_CODE);
			if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) !== POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
				SetGoogleAnalytic(NOTEBOOK.c_s_THUMB_VERBID);
			}
		}
	});
};

/**
* @method: goToTabs 
* @param: {String} tabType 
* @uses: for getting Notebook json with respect to tabType
* @return void;
*/
NotebookView.goToTabs = function (tabType) {
	var oSelf = this;
	oSelf.tabType = tabType;
	objNoteBookData = null;
	NotebookView.noteId = null;
	$(".tabs_s").attr('aria-selected','false');
	switch (oSelf.tabType) {
		case NOTEBOOK.c_s_TAB_PORTFOLIO:
		case NOTEBOOK.c_s_TAB_MY_WORK:
		case NOTEBOOK.c_s_TAB_RESOURCES:
			/*==== We have used global loader ====*/
			$('body').css({'opacity':'1'});
			$('.notbookoverlay').remove();
			/*== End We have used global loader ==*/
			oUtility.showLoader({
				'click-to-hide': 	false,
				'message':    		'<img src="media/loader.gif" alt="' + NOTEBOOK.c_s_NOTEBOOK_LOADING_TXT + '" />\
<p style="font-size:13px; margin-top:-8px; color:#555555;">' + NOTEBOOK.c_s_NOTEBOOK_LOADING_TXT + '</p>',
				'foreground-color':	'none',
				'background-color':	'#FFFFFF',
				'opacity':			0.5,
				'box-style':		{
					'height':			'80px',
					'width':			'80px',
					'line-height':		'25px',
					'opacity':			0.5,
					'user-select':		'none',
					'-moz-user-select':	'none'
				}
			});
			objNoteBookData = {};
			setTimeout(function () {
				Application.viewType = VIEWTYPE.c_s_NOTEBOOK_TABS;
				Application.view = NotebookTabsView;
				Application.callView();
				var tab = _.where(NOTEBOOK_TABS, {"c_s_CODE": oSelf.tabType});
				if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) !== POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
					SetGoogleAnalytic(tab[0].c_s_VERBID);
				}
			}, 2000);
		break;
		case NOTEBOOK.c_s_TAB_JOURNAL:
		case NOTEBOOK.c_s_TAB_WORDBANK:
		case NOTEBOOK.c_s_TAB_CLASSNOTES:
		default:
			var sServiceRequest = 'GetNotelistV2',
				aInputParams = [oSelf.tabType];
			
			if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
				sServiceRequest = 'GetNotelistForInstructorV2';
				aInputParams.push(null);
				aInputParams.push($_GET(POPUP_VIEW.c_s_QUERY_PARAM_STUDENT_ID));
			}
			$.nativeCall({
				'method':			sServiceRequest,
				'globalResource':	'objNoteBookData',
				'inputParams':		aInputParams,
				'beforeSend':		function () {
					$("#loaderContainer").hide();
					$('body').css({'opacity':'0.3'});
					$("body").append('<div class="notbookoverlay" style="font-size: 13px;">\
						<img src="media/loader.gif" alt="' + NOTEBOOK.c_s_NOTEBOOK_LOADING_TXT + '" />\
						<p>' + NOTEBOOK.c_s_NOTEBOOK_LOADING_TXT + '</p>\
					</div>');
				},
				'interval':			500,
				'onComplete':		function (poGetNoteListResponse) {
					if (oSelf.tabType !== NOTEBOOK.c_s_TAB_JOURNAL) {
						$('body').css({'opacity':'1'});
						$('.notbookoverlay').remove();
						Application.viewType = VIEWTYPE.c_s_NOTEBOOK_TABS;
						Application.view = NotebookTabsView;
						Application.callView();
						var tab = _.where(NOTEBOOK_TABS, {"c_s_CODE": oSelf.tabType});
						if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) !== POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
							SetGoogleAnalytic(tab[0].c_s_VERBID);
						}
						return;
					}
					// CLAS-821
					// $.nativeCall({
					// 	'method':			'GetCurrentBookForStudent',
					// 	'globalResource':	'objCurrentBookForStudent',
					// 	'inputParams':		[$_GET(POPUP_VIEW.c_s_QUERY_PARAM_STUDENT_ID)], // $_GET is returns <<BLANK>> when search parameter is absent
					// 	'onComplete':		function (poGetCurrentBookResponse) {
					// 		NotebookTabsView.CheckForCurrentBook();
					// 	}
					// });
					GetiPortal_GetHideBookData(function(objSupressBookTitle) {
					objNoteBookData.Content.Data = objNoteBookData.Content.Data.filter(book => !objSupressBookTitle.includes(book.NoteRefID))

						// Only execute the $.nativeCall if objSupressBookTitle is not null
						if (objSupressBookTitle !== null) {
							$.nativeCall({
								'method':			'GetCurrentBookForStudent',
								'globalResource':	'objCurrentBookForStudent',
								'inputParams':		[$_GET(POPUP_VIEW.c_s_QUERY_PARAM_STUDENT_ID)], // $_GET is returns <<BLANK>> when search parameter is absent
								'onComplete':		function (poGetCurrentBookResponse) {
									NotebookTabsView.CheckForCurrentBook();
								}
							});
						}
					});
					// End of CLAS-821
				},
				'onError':			function (poGetNoteListResponse) {
					$('body').css({'opacity':'1'});
					$('.notbookoverlay').remove();
					if (poGetNoteListResponse.ErrorCode) {
						if (poGetNoteListResponse.ErrorCode !== "U1065") {
							NotebookView._alert({
								divId:		'dialog-message',
								title : 	'Alert!',
								message:	poGetNoteListResponse.ErrorUserDescription
							}, function () {
								Application.viewType = VIEWTYPE.c_s_NOTEBOOK_TABS;
								Application.view = NotebookTabsView;
								Application.callView();
								var tab = _.where(NOTEBOOK_TABS, {"c_s_CODE": oSelf.tabType});
								if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) !== POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
									SetGoogleAnalytic(tab[0].c_s_VERBID);
								}
							});
							return;
						}
					}
					
					Application.viewType = VIEWTYPE.c_s_NOTEBOOK_TABS;
					Application.view = NotebookTabsView;
					Application.callView();
					var tab = _.where(NOTEBOOK_TABS, {"c_s_CODE": oSelf.tabType});
					if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) !== POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
						SetGoogleAnalytic(tab[0].c_s_VERBID);
					}
				}
			});
		break;
	}
	$("#"+oSelf.tabType).attr('aria-selected','true');	
};
NotebookView._alert =  ISeriesBase.prototype._alert;

/**
* @method: fetchIncrementalSaveTimerConfig
* @param: null
* @uses: initialize the incremental save timer configurations
* @return void;
*/
NotebookView.fetchIncrementalSaveTimerConfig = function () {

	NotebookView.iSaveAttemptDataTimerInterval = (
														objCurrentUnitDetails["IncrementalSaveDuration"] && 
														!isNaN(parseInt(objCurrentUnitDetails["IncrementalSaveDuration"]))
													) ? 
													parseInt(objCurrentUnitDetails["IncrementalSaveDuration"])*1000 : 
													0; //ms
	NotebookView.iSaveAttemptDataTimerInterval = (
														NotebookView.iSaveAttemptDataTimerInterval > 0 && 
														NotebookView.iSaveAttemptDataTimerInterval < 30000
													) ? 
													30000 : 
													NotebookView.iSaveAttemptDataTimerInterval;		
};

/* Incremental Save - method to call saveAttemptData in specified interval */
NotebookView.incrementalSave = function () {
	if (['Journal', 'Wordbank', 'Classnotes'].indexOf(NotebookView.tabType) == -1) { return; }

	NotebookView.bIncrementalSaveTimerStarted = true;
	var fCallBack = NotebookView.incrementalSaveCallback;
			
	//get data for saveNote method parameters 
	var oParamsForSaveData = NotebookTabsView.getParamsForSaveData(NotebookView.tabType);
	
	//if title not blank and any chnages has been made
	if(
		oParamsForSaveData.title !== "" && oParamsForSaveData.title !== encodeURIComponent(NOTEBOOK.c_s_NOTEBOOK_EMPTY_TITLE_TXT) && 
		(NotebookView.sPrevNoteId != NotebookView.noteId || NotebookView.sPrevTitle != oParamsForSaveData.title || NotebookView.sPrevText != oParamsForSaveData.content)
	){
		NotebookView.noteId ? console.log('edit') : console.log('add');
		NotebookTabsView.saveData(oParamsForSaveData.title, oParamsForSaveData.content, '', '', '', fCallBack);  // shall be called after 30 sec 
		window.clearInterval(NotebookView.saveAttemptDataTimer);
		NotebookView.saveAttemptDataTimer = null;
	}
	else {
		window.clearInterval(NotebookView.saveAttemptDataTimer);
		NotebookView.saveAttemptDataTimer = null;
		fCallBack();
	}	
};

/* Incremental Save - callback method for incrementalSave */
NotebookView.incrementalSaveCallback = function () {	
	NotebookView.saveAttemptDataTimer = window.setInterval(function() { 
			NotebookView.incrementalSave(); console.log('timer called');
		}, NotebookView.iSaveAttemptDataTimerInterval);
	
};

/* Incremental Save - method to clear the incremental save timer data 
 * param: {boolean} pbEnabledIncrementalSave TRUE if Incrementa Save is enabled for current the slide
*/
NotebookView.clearIncrementalSaveTimerData = function (pbEnabledIncrementalSave) {
	clearInterval(NotebookView.saveAttemptDataTimer);
	NotebookView.saveAttemptDataTimer = null;
	NotebookView.bEnabledIncrementalSave = pbEnabledIncrementalSave? pbEnabledIncrementalSave : false;
	NotebookView.bIncrementalSaveTimerStarted = false;	
}

// Declare NotebookTabsView object 
NotebookTabsView = {
	// Notebook properties
	'model': null
};

//Defining NotebookTabsView vars
NotebookTabsView.saveTimer = null; //timer to repeat saveNote calls in case of internet disconnection
NotebookTabsView.networkErrorFlag = false; //can be used to ensure that alert has displayed once in case of internet disconnection, used for closing popup

/**
* @method: init
* @param: {object} model 
* @uses: for initialize the object
* @return void;
*/

NotebookTabsView.init = function (model) { 
	var oSelf = this;
	oSelf.model = model;
	switch (NotebookView.tabType){
		case NOTEBOOK.c_s_TAB_JOURNAL:
			JournalView.init(model);
		break;
		case NOTEBOOK.c_s_TAB_PORTFOLIO:
		case NOTEBOOK.c_s_TAB_MY_WORK:
		case NOTEBOOK.c_s_TAB_RESOURCES:
			PortfolioView.init(model);
		break;
		case NOTEBOOK.c_s_TAB_WORDBANK: 
			WordBankView.init(model);
		break;
		default:
			ClassNotesView.init(model);
		break;
	}
	
	if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
		$(".Portfolio").hide();
		/*==== My Work and Resources tabs should not be visible at Teacher end ====*/
		$(".my_work").hide();
		$(".resources").hide();
		/*== End My Work and Resources tabs should not be visible at Teacher end ==*/
	}
	oSelf.bindEvents();
	oSelf.resize();
}

/**
* @method: bindEvents 
* @uses: for binding events of NotebookTabsView
* @return void;
*/

NotebookTabsView.bindEvents = function () {

	$('#closenotebook')
		.off('focus')
		.on('focus', function(){
		$('#ui-tooltip_closenotebook').show();
		$("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE).attr('tabindex','0');
		$("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE).attr('aria-expanded','false');
	   $("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE_TOOLTIP).find(".oragnic_tooltip li").attr('tabindex','-1');
		$("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE_TOOLTIP).hide();
	});

	$("." + NOTEBOOK.c_s_NOTEBOOK_TAB)
		.off("click tap")
	   .on("click tap", function (e) {
		   NotebookView.clearIncrementalSaveTimerData(); //clear incremental save timer on clicking of tabs
			$("."+NOTEBOOK.c_s_NOTEBOOK_TAB).removeClass('active');
			$(this).addClass('active');
			var tabType = $(this).attr("data-value");
			$("." + NOTEBOOK.c_s_NOTEBOOK_TAB).attr('aria-selected','false');
			$(this).attr('aria-selected','true');
			NotebookView.goToTabs(tabType);
		   //ILIT-5334
		  if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		  }
		});

	$("." + NOTEBOOK.c_s_NOTEBOOK_TAB)
		.off("keydown")
		.on("keydown", function (e) {
			triggerClickOnThisElemApp(e,this);
		});
		
	$("#" + NOTEBOOK.c_s_NOTEBOOK_CLOSE_NOTEBOOK_BTN)
		.off("click tap")
	   .on("click tap", function (e) {
		   NotebookView.clearIncrementalSaveTimerData(); //clear incremental save timer on clicking close button
			NotebookView.refEbookclick = 1;
			HideNativeBottomBar(false);
			if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
				if (oPlatform.isDevice()) {
					CloseWebView();
				}
				else {
					$('html, body').css({
						'overflow': 'auto',
						'height': '100%'
					});
					window.parent.document.getElementById('viewNotebookPopupArea').style.display = 'none';
				}
			}
			else {
				setTimeout(function () {
					NotebookView.init();
				}, 100);
			}

		   //ILIT-5334
		   if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		   }
		});
	
	if(oPlatform.isChromeApp()) {
		$("#" + NOTEBOOK.c_s_NOTEBOOK_CLOSE_NOTEBOOK_BTN)
	   		.off("keydown")
	   		.on("keydown", function (e) {
				triggerClickOnThisElemApp(e, this);
	   });
	}
   
	$("#" + NOTEBOOK.c_s_NOTEBOOK_CLOSE_NOTEBOOK_BTN).focusout(function(e){
		$('#ui-tooltip_closenotebook').hide();
	});
	
	$('#notebookdescription,#wordtitle,#worddefinition,#wordsentence,#editable')
		.off('keyup')
		//.off('contextmenu')
		.on('keyup', function (oEvent) {
			var iKeyStroke = oEvent.which? oEvent.which: oEvent.keyCode;
			if (iKeyStroke == 27) {
				$('#textToHelpMenu').hide();
			}
		})
		.on('contextmenu', function (e) {
			e.preventDefault();
			return false;
		})
		.on('click tap', function () {
			$('#textToHelpMenu').hide();
		});
	
	var tapped = false;
	$('#notebookdescription,#wordtitle,#worddefinition,#wordsentence,#editable')
		.off('contextmenu')
		.off('mouseup touchstart')
		.on('mouseup touchstart', function (oEvent) {
			if (!tapped){ //if tap is not set, set up single tap
				tapped = setTimeout(function () {
					tapped = null;
					$('#textToHelpMenu').hide();
					//insert things you want to do when single tapped
				}, 300); //wait 300ms then run single click code
			}
			else { //tapped within 300ms of last tap. double tap
				clearTimeout(tapped); //stop single tap callback
				tapped = null;
				oEvent.preventDefault();
				//insert things you want to do when double tapped
				GetData('clipboardText');
				//keyvalData = 'dssd';
				setTimeout(function () {
					if (typeof keyvalData != 'undefined' && keyvalData != '') {
						var currTxtAreaId = $(oEvent.target).attr('id'),
							textAreaTxt = $(oEvent.target).val(),
							startPos = $('#'+currTxtAreaId).get(0).selectionStart,
							endPos = $('#'+currTxtAreaId).get(0).selectionEnd,
							divTagType = $(oEvent.target).get(0).tagName,
							oMenuPosition = {
								'left':	parseInt(oEvent.originalEvent.pageX - Math.round($('#textToHelpMenu').width() / 2)) + 'px',
								'top':	(oEvent.originalEvent.pageY - $('#textToHelpMenu').height() - 10) + 'px' // 10: found by inspection
							};
						
						if (divTagType == 'DIV') {
							textAreaTxt =  $(oEvent.target).html();
						}
				
						$('#textToHelpMenu')
							.css(oMenuPosition)
							.show(0, function () {
								$('#textToHelpMenu > #tthPaste')
									.off('click tap')
									.on('click tap', function () {
										var oElement = this;
										if (divTagType == 'DIV') {
											$('#' + currTxtAreaId).empty();
											$('#' + currTxtAreaId).html(textAreaTxt.substring(0, startPos) + keyvalData);
										}
										else {
											$('#' + currTxtAreaId).val(
												textAreaTxt.substring(0, startPos) +
												keyvalData +
												textAreaTxt.substring(endPos, textAreaTxt.length)
											);
										}
										
										$('#textToHelpMenu').hide();
										setTimeout(function () {
											$(oElement).off('click tap');
										}, 100);
									});
							});
					}
				}, 500);
			}
		//oEvent.preventDefault()
		});
	$("#notebookdescription,#wordtitle,#worddefinition,#wordsentence,#editable")
		.bind('taphold', function(event) {
			event.preventDefault();
		});
	
	$(document.body)
		.off("click tap")
		.on("click tap", function (e) {
			$('#textToHelpMenu').hide();
		});
};

/**
* @method: saveData
* @param: {String} noteTitle
* @param: {String} noteText 
* @param: {object} pEventTarget event.target to indicate what event/button click triggered this call 
* @uses: for saving notes of different types
* @return void;
*/
NotebookTabsView.saveData = function (noteTitle, noteText,refOtherData,shortNoteText, pEventTarget, fCallBackIncrementalSave) {
	//ILIT-5832. Do not allow save if noteTitle or noteText is undefined
	if(
			typeof noteTitle == 'undefined' || 
			noteTitle == 'undefined' ||
			typeof noteText == 'undefined' ||
			noteText == 'undefined'
		)
	{
		NotebookView.clearIncrementalSaveTimerData();
		return false;
	} 
	
	var noteId = NotebookView.noteId,
		tabType = NotebookView.tabType,
		noteRefId = NotebookView.noteRefId,
		noteText = noteText.replace(/\n/gi, "<br>"),
		sNoteTitle = noteTitle;
		
	clearTimeout(NotebookTabsView.saveTimer);
	
	if (sNoteTitle == "" || stripHtmlTagsFromString(decodeURIComponent(sNoteTitle)) == "") {
		NotebookView._alert({
			divId:		'dialog-message',
			title:		'Alert!',
			message:	NOTEBOOK.c_s_NOTEBOOK_EMPTY_TITLE_ALERT_TXT
		});
		return false;
	}
	if (decodeURIComponent(sNoteTitle) == NOTEBOOK.c_s_NOTEBOOK_EMPTY_TITLE_TXT) {
		NotebookView._alert({
			divId:		'dialog-message',
			title :		'Alert!',
			message:	NOTEBOOK.c_s_NOTEBOOK_VALID_TITLE_TXT
		});
		return false;
	}
	
	/* fCallBack will be called on complete of  GetUnitWeekDetails so that it get latest refUnitNumber*/
	var fCallBack = function (sNoteTitle) {
		var refUnitNumber = NotebookView.refUnitNumber && parseInt(NotebookView.refUnitNumber) ? NotebookView.refUnitNumber : 1;		
		/* ILIT-5576 */
		var sNoteTitle = encodeURIComponent(stripHtmlTagsFromString(decodeURIComponent(sNoteTitle)));
	 
		if (
			(typeof refOtherData === 'object') &&
			(refOtherData !== null)
		) {
			refOtherData = JSON.stringify(JSON.stringify(refOtherData));
		}
		//ILIT-5637
		else if(typeof refOtherData === "string") {
			refOtherData = refOtherData;
		}
		else {
			refOtherData = "";
		}
		if(shortNoteText == undefined || shortNoteText == null){
			shortNoteText = "";
		}
		else {
			shortNoteText = JSON.stringify(shortNoteText);
		}
		
		refOtherData = refOtherData.trim('"');
		shortNoteText = shortNoteText.trim('"');
		
		// to avoid duplicate creation of notes from incremental save
		if (!noteId && NotebookView.sPrevSavingNoteId == noteId && NotebookView.sPrevTitle == sNoteTitle && NotebookView.sPrevText == noteText) {
			return;
		}
		
		NotebookView.counter++; //the number of times saveData got called as a result of multiple calls coming from incrementalSave() before actual time interval ie 30secs.
		if(NotebookView.counter > 1) { return;} //consider only 1 call in case of multiple calls. 
		
		//ILIT-5843
		var sSpinner = (pEventTarget && $(pEventTarget).attr('id') != "cancelnote") ? '<img src="media/loader.gif" alt="" />' : ''; //for Incremental Save dont show spinner
		
		$.nativeCall({
			'method':			'SaveNote',
			'globalResource':	'objSaveNoteResponse',
			'beforeSend':		function () {
				$('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).attr('disabled', true);
				if(!NotebookTabsView.networkErrorFlag) {
					oUtility.showLoader({
						opacity:			0.5,
						'click-to-hide': 	false,
						'message':    		sSpinner,
						'foreground-color':	'none',
						'background-color': 'none',
						'box-style':		{
							'height':			'80px',
							'width':			'80px'
						}
					});
				}
			},
			'inputParams':		[
				noteId, tabType, sNoteTitle,
				noteText, noteRefId, refUnitNumber,
				"", refOtherData, shortNoteText
			],
			'interval':			500,
			'onComplete':		function (poSaveNoteResponse) {
			NotebookView.counter = 0; //reset once the saveNote is successfully completed
				oUtility.hideLoader();
				// Incremental Save - store previous saved data & noteID created
				if (poSaveNoteResponse.Content) {		
					NotebookView.sPrevNoteId = objSaveNoteResponse.Content;
					NotebookView.sPrevSavingNoteId = noteId; // null if new note created
					NotebookView.sPrevTitle = sNoteTitle;
					NotebookView.sPrevText = noteText;					
				}
				// if save called on cancel button click to restore to previous state then no need to show message
				if (pEventTarget && $(pEventTarget).attr('id') == "cancelnote") {
					return;
				}
				//if save called by 'Save' button then clear timer
				if (pEventTarget && $(pEventTarget).attr('id') == "savenote") {
					NotebookView.clearIncrementalSaveTimerData();
				}				
				//if save called by incremental save timer and not from 'save'/'cancel' button 
				if(NotebookView.bIncrementalSaveTimerStarted && !pEventTarget) {
					$('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).attr('disabled', false);
					if (!noteId) { NotebookView.noteId = objSaveNoteResponse.Content; } //if created new note then save its id
					fCallBackIncrementalSave();
					return false;
				}
				//show alert only if its saved via  save button
				NotebookView._alert(
					{
						divId:		'dialog-message',
						title:		'Notice',
						message:	NOTEBOOK.c_s_NOTEBOOK_SAVE_RECORD_ALERT
					},
					function () {
						$("#loaderContainer").hide();
						$('body').css({'background-color': '#E0E1E1'});
						$('.wrapper').show();						
						NotebookView.goToTabs(tabType);						
					}
				);
				NotebookTabsView.networkErrorFlag = false;
			},
		'onError':			function (poSaveNoteResponse) {
			NotebookView.counter = 0; //reset in case of error. This will allow incrementalSave timer to continue in case of internet resumed after it got disconnect and network alert popup appeared.
				oUtility.hideLoader();			
				if (poSaveNoteResponse.Error) {
					if( poSaveNoteResponse.Error == NETWORK_ERR_CODES.c_i_CODE_09) {
						NotebookTabsView.networkErrorFlag = true;
						//ILIT-5608
							NotebookView._alert(
							{
								divId:		'dialog-message',
								title:		'Alert!',
								message:	GENERAL.c_s_NO_INTERNET_MSG
							},
							$.noop(),
							"null"
						);
						NotebookTabsView.saveTimer = setTimeout(function () {
								NotebookTabsView.saveData(sNoteTitle, noteText , refOtherData,shortNoteText, '', fCallBackIncrementalSave)
						}, 3000);
					}else{
						NotebookView._alert(
							{
								divId:		'dialog-message',
								title:		'Alert!',
								message:	poSaveNoteResponse.Error.ErrorUserDescription
							}/* , function () {
								if (poSaveNoteResponse.Error.ErrorCode !== 'U1082') {
									$("#loaderContainer").hide();
									$('body').css({'background-color': '#E0E1E1'});
									$('.wrapper').show();
									
									NotebookView.goToTabs(tabType);
								}
							} */
						);
					}
				}
				if(NotebookView.bIncrementalSaveTimerStarted && !pEventTarget) {
					fCallBackIncrementalSave();
				}
			}
		});
	};
	
	//if note is edited, retain the value of NotebookView.refUnitNumber, calling GetUnitWeekDetails is not required. 
	if (NotebookView.noteId !== null) { 
		fCallBack(sNoteTitle);
	} else {
		$.nativeCall({
			'method':			'GetUnitWeekDetails',
			'globalResource':	'objCurrentUnitDetails',
			'interval':			200,
			'breakAfter':		1000,
			'checkSuccess':		function () {
				return (typeof objCurrentUnitDetails.currentUnit != 'undefined');
			},
			'onComplete':		function () {
				NotebookView.refUnitNumber = objCurrentUnitDetails.currentUnit;
				fCallBack(sNoteTitle);
			},
			'onError':			function (e) {
				console.log(e);
				objCurrentUnitDetails = {"currentLesson":"","currentUnit":"","currentWeek":"","productCode":""};
				NotebookView.refUnitNumber = objCurrentUnitDetails.currentUnit;
				NotebookView.sProductCode = objCurrentUnitDetails.productCode;
				fCallBack(sNoteTitle);
			}
		});
		
	}
	
}

/**
* @method: saveDataCallback
* @param: {String} jDatastr
* @uses: for getting response after saving notes 
* @return void;
*/
NotebookTabsView.saveDataCallback = function (jDatastr) {
	objSaveNoteResponse = JSON.parse(jDatastr);	
};

/**
* @method: deleteDataCallback
* @param: {String} jDatastr
* @uses: for getting response after deleting notes
* @return void;
*/
NotebookTabsView.deleteDataCallback = function (jDatastr) {
	//Incremental Save
	if (NotebookTabsView.sDeleteEventName == 'event-cancel') {return;}
	
	//oSelf = this;
	setTimeout(function(){
		var jData = JSON.parse(jDatastr);
		if (jData != null) {
			try {
				$("#loaderContainer").hide();
				oUtility.hideLoader();
				$('body').css({'background-color': '#E0E1E1'});
				$('.wrapper').show();
				if (parseInt(jData.Status) == 200) {
					objNoteBookData = null;
				    GetNotelistV2(NotebookView.tabType);
					
					
					setTimeout(function(){
						if (objNoteBookData != null) {
							try {
								$("#loaderContainer").hide();
								$('body').css({'background-color': '#E0E1E1'});
								$('.wrapper').show();
								if (parseInt(objNoteBookData.Status) == 200) {
									NotebookView.noteId = null;
									Application.viewType = VIEWTYPE.c_s_NOTEBOOK_TABS;
									Application.view = NotebookTabsView;
									Application.callView();
								} 
								else {
									Application.viewType = VIEWTYPE.c_s_NOTEBOOK_TABS;
									Application.view = NotebookTabsView;
									Application.callView();
								}
							}
							catch(exp){
								if (exp.ErrorCode != "U1065") {
									NotebookView._alert({
										divId:		'dialog-message',
										title : 	'Alert!',
										message:	exp.ErrorUserDescription
									});
								}
							}
						}
						else {
							NotebookView.goToTabs(NotebookView.tabType);
						} 
					}, 900);

					setTimeout(function() {
						NotebookView._alert({
							divId:		'dialog-message',
							title : 	'Notice',
							message:	NOTEBOOK.c_s_NOTEBOOK_DELETE_RECORD_ALERT
						});
					}, 1200);
				} 
				else {
					Application.viewType = VIEWTYPE.c_s_NOTEBOOK_TABS;
					Application.view = NotebookTabsView;
					Application.callView();
				}
			}
			catch (exp) {
				return;
			}
		}
		else {
			NotebookView.goToTabs(NotebookView.tabType);
		} 
	}, 2000);
}

/**
* @method: resize 
* @uses: resizing the document
* @return void;
*/
NotebookTabsView.resize = function () { }

/**
* @method: deleteNote
* @param: {String} noteRefId
* @uses: for deleting notes of all types i.e Journal, Wordbank and Classnotes
* @return void;
*/
NotebookTabsView.deleteNote = function(noteRefId) {	
	if (NotebookTabsView.sDeleteEventName != "event-cancel") {
		//	show the loader
		oUtility.showLoader({
			opacity:			0.4,
			'click-to-hide': 	false,
			'message':    		'<img src="media/loader.gif" />',
			'foreground-color':	'none',
			'box-style':		{
				'height':			'80px',
				'width':			'80px'
			}
		});
	}
	DeleteNote(noteRefId);
}

/**
* @method: showhidemenupanel
* @uses: for leftside's Unit/Lesson slide up/down
* @return void;
*/
NotebookTabsView.showhidemenupanel = function() {
	$("." + NOTEBOOK.c_s_NOTEBOOK_LIST_WRAPPER +" li").off("click tap").on("click tap", function () {
		var tempThis = $(this);
		if (!tempThis.hasClass("active")) {
			tempThis.siblings().each(function(){
				$(this).removeClass("active")
				var tempStore=$(this).find("ul");
				if(tempStore.css("display")!="none"){
					tempStore.slideUp();
				}
			});
			tempThis.addClass("active").find("ul").slideDown();
		}
	});
	
	//List item navigation on 'up' and 'down' arrow
	$("." + NOTEBOOK.c_s_NOTEBOOK_LIST_WRAPPER +" li.active a").next('ul:visible')
	.off('keyup')
	.on('keyup', function(e){
		var listItems = $(this).children(),
			key = e.keyCode;
		e.preventDefault();
		e.stopPropagation();
		if ( key != 40 && key != 38 ){
			return false;
		}
		if (listItems.length) {
			var $selected = listItems.filter(function(index){
					return $(this).find('a').is(':focus');
				}),
				$current;
			listItems.find('a').blur();
		
			if ( key == 40 ) // Down key
			{
				if ( listItems.length <= 1 || $selected.is(':last-child') ) {
					$current = listItems.eq(0);
				}
				else {
					$current = $selected.next();
				}
			}
			else if ( key == 38 ) // Up key
			{
				if ( listItems.length <= 1 || $selected.is(':first-child') ) {
					$current = listItems.last();
				}
				else {
					$current = $selected.prev();
				}
			}
			$current.find('a').focus();
		}
	});
}


/**
* @method: CheckForCurrentBook
* @uses: for checking student's current reading book
* @return void;
*/

NotebookTabsView.CheckForCurrentBook = function(){
	if (objCurrentBookForStudent != null) {
		if (parseInt(objCurrentBookForStudent.Status) == 200) {
			GetLibraryInfo();
			HideNativeBottomBar(true);
			setTimeout(function(){
				NotebookTabsView.CheckLibraryDetails();
			}, 500);
		}
		else {
			//alert(objCurrentBookForStudent.Error.ErrorUserDescription);
		}
	} 
	else {
		setTimeout(function() {
			NotebookTabsView.CheckForCurrentBook();
		}, 500);
	}
}

/**
* @method: CheckLibraryDetails
* @uses: for or checking whether js files have been loaded or not
* @return void;
*/
 
NotebookTabsView.CheckLibraryDetails = function() {
	if (objLibraryJsonData != null) {
		loadJS(objLibraryJsonData.jsPath, NotebookTabsView.isLibraryLoaded);
		//ILIT-5825 - On chrome app if loader then show message
		(function() {					
			if (location.hash === "#chromeApp") {
				chromeServerNotStartedPopup('Notebook');
			} 
		})();
	}
	else {
		setTimeout(NotebookTabsView.CheckLibraryDetails, 500);
	}
}

/**
* @method: isLibraryLoaded
* @uses: for checking whether particular js variable i.e. library json has been loaded or not
* @return void;
*/

NotebookTabsView.isLibraryLoaded = function() {
    var oSelf = this;
	if (typeof objBookList != "undefined" && objBookList != null) {
		$('body').css({'opacity':'1'});
		$('.notbookoverlay').remove();
		$('body').css({'background-color': '#E0E1E1'});
		$('.wrapper').show();
		Application.viewType = VIEWTYPE.c_s_NOTEBOOK_TABS;
		Application.view = NotebookTabsView;
		Application.callView();
		var tab = _.where(NOTEBOOK_TABS, {"c_s_CODE": NotebookView.tabType});
		if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) !== POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
			SetGoogleAnalytic(tab[0].c_s_VERBID);
		}
	} else {
		setTimeout(isLoaded, 100);
	}
 }

/**
* @method: getParamsForSaveData
* @param: current tab (string)
* @uses: used for fetching data to be used as parameter for SaveData method
* @return object (title and content of note);
*/
NotebookTabsView.getParamsForSaveData = function (psTabType) {
	
	switch(psTabType) {
		case "Journal":
			return JournalView.onSave();
		break;
		
		case "Wordbank":
			return WordBankView.onSave();
		break;
		
		case "Classnotes":
			return ClassNotesView.onSave();
		break;
	}
	
}

// Declare JournalView object 
function JournalView () {}

// Jouranl properties
JournalView.model = null;

/**
* @method: init 
* @param: {object} model
* @uses: for initialize the object
* @return void;
*/

JournalView.init = function (model) {
	var oSelf = this;
	oSelf.model = model;
	oSelf.render(oSelf);
}


/**
* @method: render
* @uses: for populating the Journal Html
* @return void;
*/
 // Journal main container render
JournalView.render = function (oSelf) {
	$("#" + NOTEBOOK.c_s_NOTEBOOK_WRAPPER).html(_.template($('#journaltemplate').html(),{'objCurrentBook' : objCurrentBookForStudent,"objBookList" : objBookList  }));
	oSelf.rightPanelRender();
	oSelf.leftPanelRender();
}

/**
* @method: rightPanelRender
* @uses: for populating the Journal right panel 
* @return void;
*/

// Journal right panel render
JournalView.rightPanelRender = function () {
	var oSelf = this;
	$("#" + NOTEBOOK.c_s_JOURNAL_RIGHT_PANEL_CONTAINER).html(
		_.template(
			$("#" + NOTEBOOK.c_s_NOTEBOOK_RIGHT_PANEL).html(),
			{
				'tabData' : NOTEBOOK_TABS,
				'activeIdx': NotebookView.tabType,
			}
		)
	);
}

/**
* @method: leftPanelRender
* @uses: for populating the Journal left panel 
* @return void;
*/
// Journal left panel render
JournalView.leftPanelRender = function () {
	var oSelf = this;
	$("#" + NOTEBOOK.c_s_JOURNAL_LEFT_PANEL_CONTAINER).html(_.template($("#" + NOTEBOOK.c_s_NOTEBOOK_LEFT_PANEL).html(),{'journaldata' : oSelf.model}));
	
	var findLi = $("." + NOTEBOOK.c_s_NOTEBOOK_LIST_WRAPPER).find('li:first');
	
	
	if (objCurrentUnitDetails.currentUnit !="" && objCurrentUnitDetails.currentUnit > 1 && $(".notes_list_wrapper").find("ul").eq(objCurrentUnitDetails.currentUnit -1).parent("li").length > 0 ) {
		var findLishow = findLi.end().find("ul").eq(objCurrentUnitDetails.currentUnit -1 ).show();
		var findLi =  $(".notes_list_wrapper").find("ul").eq(objCurrentUnitDetails.currentUnit -1).parent("li");
		findLi.addClass('active');
	}else{
		findLi.addClass('active');
		var findLishow = findLi.end().find("ul").eq(0).show();
	}
	if(NotebookView.noteId == null){
	    findLishow.find('li:first').addClass('active');
		var journalId = findLishow.find('li:first').find('a').attr("note-id");
	}else {
		li_objects = ($('.' + NOTEBOOK.c_s_NOTEBOOK_LIST_WRAPPER).find('li').find('ul').find('li').find('a'));
		$( li_objects ).each(function( index ) {
			if($( this ).attr('note-id') == NotebookView.noteId) { 
			$( this ).parent('li').addClass('active');
			journalId = $( this ).attr('note-id'); 
		}
		});
	}
	if(typeof journalId!= 'undefined'){
		$('#'+NOTEBOOK.c_s_NOTEBOOK_DELETE_JOURNAL).show();
		NotebookView.noteId = journalId;
		NotebookView.noteRefId = findLishow.find('li:first').find('a').attr("ref-id");
		NotebookView.refUnitNumber = findLishow.find('li:first').find('a').attr("ref-unitno");
	}else{
		findLi.removeClass('active');
	}
	$('.notes_list_wrapper li, .notes_list_wrapper li a').on('focus',function() {
		if($("#" +NOTEBOOK.c_s_NOTEBOOK_CURRENTBOOK_TOOLTIP)!=null){
			$("#" +NOTEBOOK.c_s_NOTEBOOK_CURRENTBOOK_TOOLTIP).hide();
			$("#" +NOTEBOOK.c_s_NOTEBOOK_CURRENT_BOOK).attr('aria-expanded','false');
			$("#" +NOTEBOOK.c_s_NOTEBOOK_CURRENTBOOK_TOOLTIP).find(".oragnic_tooltip li a").attr('tabindex','-1');
		}
	})
	
	//NotebookView.getNoteDetails(journalId);
	oSelf.innnerPanelRenderV2(journalId);
	$('#closenotebook').focus();
}

/**
* @method: innnerPanelRender
* @params : {String} journalId 
* @uses: for populating the Journal inner panel 
* @return void;
*/
// Journal right panel render 
JournalView.innnerPanelRender = function (journalId) { 
	var oSelf = this;
	$("#innerDataContainer").html(
		_.template(
			$("#journalInnerTemplate").html(),{
				'journalData': _.where(oSelf.model, {NoteID : journalId})
			}
		)
	);
	$('#'+NOTEBOOK.c_s_JOURNAL_EDITOR_SAVE_CONTAINER).hide();
	$('#'+NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE).hide();
	$('#'+NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE).hide();
	oSelf.bindEvents();
	if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).attr("disabled","disabled");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).css("-webkit-text-fill-color","rgba(0, 0, 0, 1)");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).css("-webkit-opacity",1);
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).css("color","rgba(0, 0, 0, 1)");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).css("background","white");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).attr("disabled","disabled");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).css("-webkit-text-fill-color","rgba(0, 0, 0, 1)");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).css("-webkit-opacity",1);
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).css("color","rgba(0, 0, 0, 1)");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).css("background","white");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_DELETE_JOURNAL).hide();
		$("#"+NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_JOURNAL).hide();
		$("#"+NOTEBOOK.c_s_NOTEBOOK_CURRENT_BOOK).hide();
	}
	NotebookTabsView.bindEvents();
	oSelf.resize();
}

// Journal right panel render version 2
JournalView.innnerPanelRenderV2 = function (journalId) {
	var oSelf = this;

	$("#innerDataContainer").html(
		_.template(
			$("#journalInnerTemplateV2").html(),{
			}
		)
	);
	
	$('#'+NOTEBOOK.c_s_JOURNAL_EDITOR_SAVE_CONTAINER).hide();
	$('#'+NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE).hide();
	$('#'+NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE).hide();
	oSelf.bindEvents();
	if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).attr("disabled","disabled");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).css("-webkit-text-fill-color","rgba(0, 0, 0, 1)");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).css("-webkit-opacity",1);
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).css("color","rgba(0, 0, 0, 1)");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).css("background","white");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).attr("disabled","disabled");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).css("-webkit-text-fill-color","rgba(0, 0, 0, 1)");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).css("-webkit-opacity",1);
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).css("color","rgba(0, 0, 0, 1)");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).css("background","white");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_DELETE_JOURNAL).hide();
		$("#"+NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_JOURNAL).hide();
		$("#"+NOTEBOOK.c_s_NOTEBOOK_CURRENT_BOOK).hide();
	}
	NotebookTabsView.bindEvents();
	oSelf.resize();
	if (typeof journalId != 'undefined') {
	   //GetNoteInfo(journalId);
	   $.nativeCall({
		   'method':			'GetNoteInfo',
		   'globalResource':	'objNoteInfoData',
		   'beforeSend':		function () {	   
		   },
		   'inputParams':		[journalId],
		   'interval':			500,
		   'onComplete':		function (poSaveNoteResponse) {
			   oUtility.hideLoader();
			   fGetNoteCallback();
			   
		   },
		   'onError':			function (poSaveNoteResponse) {
		   }
	   });
	   
		$('#innerDataContainer').css({'opacity':'0.3'});
		$('#innerDataContainer').append("<div class='notbookoverlay' style ='font-size: 13px;'><img src='media/loader.gif'><p>"+NOTEBOOK.c_s_NOTEBOOK_LOADING_TXT+"</p></div>");
		$('#'+NOTEBOOK.c_s_JOURNAL_EDITOR_SAVE_CONTAINER).hide();
		$('#'+NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE).hide();
		$('#'+NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE).hide();
		if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) != POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
			$("#"+NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_JOURNAL).show();
		}
	   
	   
	   var fGetNoteCallback = function(){
		oSelf.bindEvents();		
		NotebookTabsView.bindEvents();
		oSelf.resize();
			try {
				$("#innerDataContainer").html(
					_.template(
						$("#journalInnerTemplateV2").html(),
						{
							'journalData': (objNoteInfoData.Content),
							'serviceVersion' : objCurrentUnitDetails.serviceVersion
						}
					)
				);
				try {
					NotebookView.refOtherData = JSON.parse(objNoteInfoData.Content.NoteOtherRefData);
					if (NotebookView.refOtherData === null) {
						NotebookView.refOtherData = "";
					}
				}
				catch (oException) {
					NotebookView.refOtherData = "";
				}
				
				if(objNoteInfoData.Content.ShortNoteText){
					NotebookView.shortNoteText = objNoteInfoData.Content.ShortNoteText;
				}else{
					NotebookView.shortNoteText = "";
				}
				
				$('#innerDataContainer').css({'opacity':'1'});
				$(".notbookoverlay").remove();
				 $('#'+NOTEBOOK.c_s_JOURNAL_EDITOR_SAVE_CONTAINER).hide();
				$('#'+NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE).hide();
				$('#'+NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE).hide(); 
				oSelf.bindEvents();
				if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
					$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).attr("disabled","disabled");
					$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).css("-webkit-text-fill-color","rgba(0, 0, 0, 1)");
					$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).css("-webkit-opacity",1);
					$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).css("color","rgba(0, 0, 0, 1)");
					$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).css("background","white");
					$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).attr("disabled","disabled");
					$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).css("-webkit-text-fill-color","rgba(0, 0, 0, 1)");
					$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).css("-webkit-opacity",1);
					$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).css("color","rgba(0, 0, 0, 1)");
					$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).css("background","white");
					$("#"+NOTEBOOK.c_s_NOTEBOOK_DELETE_JOURNAL).hide();
					$("#"+NOTEBOOK.c_s_NOTEBOOK_DELETE_JOURNAL).hide();
					$("#"+NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_JOURNAL).hide();
					$("#"+NOTEBOOK.c_s_NOTEBOOK_CURRENT_BOOK).hide();
				}
				NotebookTabsView.bindEvents();
				oSelf.resize();
				//Incremental Save on render of Journal Tab
				if (NotebookView.iSaveAttemptDataTimerInterval && NotebookView.bIncrementalSaveTimerStarted == false) {
					NotebookView.bIncrementalSaveTimerStarted = true;
					setTimeout(function() { 
						NotebookView.incrementalSave();
					}, NotebookView.iSaveAttemptDataTimerInterval);
				}
				
			}
			catch(exp){
				$('#innerDataContainer').css({'opacity':'1'});
				$(".notbookoverlay").remove();	
			}
	   };
	}
} 

/* method to be called after save button click. or Save from incremental save timer */
JournalView.onSave = function (e) {
	var oSelf = this;
	var noteTitle = encodeURIComponent($('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).val()), 
		noteText = encodeURIComponent($('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).val()),
		find_dataset = _.where(oSelf.model, {RefUnitNumber : NotebookView.refUnitNumber, NoteTitle : noteTitle});

	if (NotebookView.noteId != null) {
		find_dataset = _.where(
			oSelf.model, {
				RefUnitNumber:	NotebookView.refUnitNumber,
				NoteTitle:		noteTitle,
				NoteID:			!(NotebookView.noteId)
			}
		);
	}

	if (!_.isEmpty(find_dataset)) {
		NotebookView._alert({
			divId:		'dialog-message',
			title : 	'Alert!',
			message:	NOTEBOOK.c_s_NOTEBOOK_DUPLICATE_TITLE
		});
		return false;
	}
	
	/* presence of e indicates there is event object since the method is called from Save button click*/
	if(e) {
		NotebookTabsView.saveData(noteTitle, noteText,NotebookView.refOtherData,NotebookView.shortNoteText, e.target);
		//ILIT-5334
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
	} else {
		return {'title':noteTitle, 'content':noteText}; //if called from incremental save
	}
};

/**
* @method: bindEvents
* @uses: bind events  for the Journal tab
* @return void;
*/
JournalView.bindEvents = function () {
	var oSelf = this;
	// left menu accordian effect
	NotebookTabsView.showhidemenupanel();
	if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) != POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
		// add operation
		$('#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_JOURNAL)
			.off("click tap")
			.on("click tap", function () {
				NotebookView.clearIncrementalSaveTimerData(); //clear incremental save timer
				
				$('#' + NOTEBOOK.c_s_JOURNAL_TITLE_PANEL_CONTAINER).removeAttr('style');
				$('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).val(GENERAL.c_s_SPECIAL_CHARACTERS_BLANK);
				$('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION).val(GENERAL.c_s_SPECIAL_CHARACTERS_BLANK);
				$('.textareaholder').show();
				$('#journal_empty_lebel').hide();
				$('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).focus();
				
				var iExistingNodeId = (NotebookView.noteId || '');
				$('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE).data('value', NOTEBOOK.c_s_NOTEBOOK_SAVE);
				$('#' + NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE_BTTN).data('note-id', iExistingNodeId);
				if (objCurrentUnitDetails.currentUnit !="") {
					NotebookView.refUnitNumber = objCurrentUnitDetails.currentUnit;
				}else{
					NotebookView.refUnitNumber = '1';
				}	
				NotebookView.noteRefId = null;
				NotebookView.noteId = null;
				NotebookView.refOtherData = null;
				NotebookView.shortNoteText = '';
					
				$('#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_JOURNAL).hide();
				$(this).hide();
				JournalView.resize();
				
				//Incremental Save - on journal add button click
				if (NotebookView.iSaveAttemptDataTimerInterval && NotebookView.bIncrementalSaveTimerStarted == false) {
					NotebookView.bIncrementalSaveTimerStarted = true;
					setTimeout(function() { 
						NotebookView.incrementalSave();
					}, NotebookView.iSaveAttemptDataTimerInterval);
				}
				
				// save and delete operation
				NotebookTabsView.bindEvents(oSelf);
			});
		
		$('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN)
			.off("click tap")
		   .on("click tap", function (e) {
				NotebookView.clearIncrementalSaveTimerData(); //clear incremental save timer
				JournalView.onSave(e);
			});
		
		//bind click event on title and description
		$('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE + ', #' + NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION)
			.off("click tap focus")
			.on("click tap focus", function () {
				$('#' + NOTEBOOK.c_s_JOURNAL_EDITOR_SAVE_CONTAINER).show();
				
				$('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).show();
				$('#' + NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE_BTTN).show();
				
				$("#" + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).attr('disabled', false);
				oSelf.resize();
			});
		//bind click event on cancel button
		$('#' + NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE_BTTN)
			.off("click tap")
			.on("click tap", function (e) {
				NotebookView.clearIncrementalSaveTimerData(); //Incremental Save - clear timer
				// hiding save & cancel button
				$('#' + NOTEBOOK.c_s_JOURNAL_EDITOR_SAVE_CONTAINER).hide();
								
				// delete if it is already saved (added) due to incremental save				
				if (NotebookView.sPrevNoteId == NotebookView.noteId && $('.notes_list_wrapper a[note-id='+NotebookView.noteId+']').length == 0) {
					oSelf.deleteNote(NotebookView.noteId, "event-cancel"); 
				} else if (NotebookView.sPrevNoteId == NotebookView.noteId && $('.notes_list_wrapper a[note-id='+NotebookView.noteId+']').length) {
					//revert/restore to previous state prior to incremental save (edit)
					NotebookTabsView.saveData(objNoteInfoData.Content.NoteTitle, objNoteInfoData.Content.NoteText,objNoteInfoData.Content.NoteOtherRefData,objNoteInfoData.Content.ShortNoteText, e.target);
				}
				var iLastNoteId = ($(this).data('note-id') || NotebookView.noteId) || -1;
				if (iLastNoteId === -1) {
					oSelf.innnerPanelRenderV2();
				}
				else {
					oSelf.innnerPanelRenderV2(iLastNoteId);	
					NotebookView.noteId = iLastNoteId;
				}				
				
				$('#' + NOTEBOOK.c_s_JOURNAL_TITLE_PANEL_CONTAINER).show();
				$('#' + NOTEBOOK.c_s_JOURNAL_EDITOR_PANEL_CONTAINER).show();
				$('.' + NOTEBOOK.c_s_NOTEBOOK_TEXT_AREA_HOLDER).show();
				$('#' + NOTEBOOK.c_s_NOTEBOOK_EMPTY_JOURNAL_LABEL).hide();
				$('#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_JOURNAL).show();
				$('#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_JOURNAL).focus();
				
				oSelf.resize();
			});

		$('#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_JOURNAL).on('focus',function(){
			if($("#" +NOTEBOOK.c_s_NOTEBOOK_CURRENTBOOK_TOOLTIP)!=null){
				$("#" +NOTEBOOK.c_s_NOTEBOOK_CURRENTBOOK_TOOLTIP).hide();
				$("#" +NOTEBOOK.c_s_NOTEBOOK_CURRENT_BOOK).attr('aria-expanded','false');
				$("#" +NOTEBOOK.c_s_NOTEBOOK_CURRENTBOOK_TOOLTIP).find(".oragnic_tooltip li a").attr('tabindex','-1');
			}
		});
		
		// delete operation
		$('#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_JOURNAL)
			.off("click tap")
			.on("click tap", function () {				
				NotebookView.clearIncrementalSaveTimerData(); //Incremental Save - clear timer
				oSelf.deleteNote(NotebookView.noteId);
			});
		
		if(oPlatform.isChromeApp()) {
			$('#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_JOURNAL + ', #' + NOTEBOOK.c_s_NOTEBOOK_DELETE_JOURNAL)
		   		.off("keydown")
		   		.on("keydown", function (e) {
			   		triggerClickOnThisElemApp(e, this);
			});
		}
	}
	// bind click operation on left menu's Journal title
   $('[id^=noteid_]').off('click').on('click',function(e){
	   NotebookView.clearIncrementalSaveTimerData(); //Incremental Save - clear timer
		var journalId = $(this).attr("note-id");
		NotebookView.noteId = journalId;
		NotebookView.refUnitNumber = $(this).attr('ref-unitno');
		NotebookView.noteRefId = $(this).attr('ref-id');
		
		oSelf.innnerPanelRenderV2(journalId);
		if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) != POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
			$('#'+NOTEBOOK.c_s_NOTEBOOK_DELETE_JOURNAL).show();
		}

	   //ILIT-5334
	   if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
		  callLogUserActivity(e); 
	   }

	});

	$('[id^=noteid_]')
		.off('keyup')
		.on('keyup', function (e) {
			var KeyID = e.keyCode;
			if(KeyID==32 || KeyID==13) {//'space' || 'enter'
				$(this).trigger("click");
				e.preventDefault();
				e.stopPropagation();
			}
		});
	
	// hide the current reading tooltip on document click
	$(".wrapper").off("click tap").on("click tap", function(e){
        $("#" +NOTEBOOK.c_s_NOTEBOOK_CURRENTBOOK_TOOLTIP).hide();
		$("#" +NOTEBOOK.c_s_NOTEBOOK_CURRENT_BOOK).attr('aria-expanded','false');
		$("#" +NOTEBOOK.c_s_NOTEBOOK_CURRENTBOOK_TOOLTIP).find(".oragnic_tooltip li a").attr('tabindex','-1');
	});
	// bind current reading tooptip
	$("#" +NOTEBOOK.c_s_NOTEBOOK_CURRENT_BOOK).off("click").on("click", function(e){
		e.stopPropagation();
		$("#" +NOTEBOOK.c_s_NOTEBOOK_CURRENTBOOK_TOOLTIP).toggle();
		if($("#" +NOTEBOOK.c_s_NOTEBOOK_CURRENTBOOK_TOOLTIP).is(':visible')) {
			$(this).attr('aria-expanded','true');
			$("#" +NOTEBOOK.c_s_NOTEBOOK_CURRENTBOOK_TOOLTIP).find(".oragnic_tooltip li a").attr('tabindex','0');
		}
		else {
			$(this).attr('aria-expanded','false');
			$("#" +NOTEBOOK.c_s_NOTEBOOK_CURRENTBOOK_TOOLTIP).find(".oragnic_tooltip li a").attr('tabindex','-1');
		}
	});
	// bind view current reading link
	
	$('[id^=' + NOTEBOOK.c_s_NOTEBOOK_VIEW_CURRENTREADING + '_]')
		.off("click tap")
		.on("click tap", function () {
			NotebookView.clearIncrementalSaveTimerData(); //clear incremental save timer
			var bookId = $(this).attr('book_id'),
				BookType =   $(this).attr('book_type'),
				wordCount =   $(this).attr('word_count'),
				bookTitle =   $(this).attr('book_title'),
				fileType =   $(this).attr('file_type'),
				isBroadCast =   "notebook",
				eBookType =   'epub',
				objBook = _.findWhere(objBookList.bookset[0], {book_id: bookId}) || {},
				BookNumPage = (
					isNaN(parseInt(objBook[LIBRARY.c_s_BOOK_LIST_JSON_KEY.NUM_PAGE]))?
					0:
					parseInt(objBook[LIBRARY.c_s_BOOK_LIST_JSON_KEY.NUM_PAGE])
				),
				context = 'notebook.html?' + POPUP_VIEW.c_s_QUERY_PARAM_MODE + '=' + POPUP_VIEW.c_s_MODE_NOTEBOOK;

			if (fileType == 'pdf') {
				context = 'notebook';
				GetPDFInfo(bookId, bookTitle, BookType, wordCount,BookNumPage,context);
				return false;
			}
			if(location.hash == "#chromeApp"){
				sIframeUrl = LIBRARY.c_s_PLAYER_URL + bookId + "|||" + bookTitle + "|||" + BookType + "|||" + wordCount + "|||" + isBroadCast + "|||" + eBookType + "|||" +  BookNumPage+"|||context="+context  + "|||" + "chromeApp";
			}else{
				sIframeUrl = LIBRARY.c_s_PLAYER_URL + bookId + "|||" + bookTitle + "|||" + BookType + "|||" + wordCount + "|||" + isBroadCast + "|||" + eBookType + "|||" +  BookNumPage+"|||context="+context;
			}
			//If Epub::Redirect To Epub Reader
			location.href = sIframeUrl;
			return false;
		});

		//tooltip on journal
		$('#ui-tooltip_currentbook, #ui-tooltip_deletejournal, #ui-tooltip_sentjournal, #ui-tooltip_addjournal').hide();
		$('#' + NOTEBOOK.c_s_NOTEBOOK_CURRENT_BOOK + ',#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_JOURNAL
			+ ',#' + NOTEBOOK.c_s_NOTEBOOK_SENT_JOURNAL + ',#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_JOURNAL).focus(function(e){
			if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_CURRENT_BOOK) {
				$('#ui-tooltip_currentbook').show();		
			} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_DELETE_JOURNAL) {
				$('#ui-tooltip_deletejournal').show();		
			} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_SENT_JOURNAL) {
				$('#ui-tooltip_sentjournal').show();		
			} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_JOURNAL) {
				$('#ui-tooltip_addjournal').show();
			}
		});
		$('#' + NOTEBOOK.c_s_NOTEBOOK_CURRENT_BOOK + ',#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_JOURNAL
			+ ',#' + NOTEBOOK.c_s_NOTEBOOK_SENT_JOURNAL + ',#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_JOURNAL).focusout(function(e){
				if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_CURRENT_BOOK) {
					$('#ui-tooltip_currentbook').hide();		
				} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_DELETE_JOURNAL) {
					$('#ui-tooltip_deletejournal').hide();		
				} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_SENT_JOURNAL) {
					$('#ui-tooltip_sentjournal').hide();		
				} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_JOURNAL) {
					$('#ui-tooltip_addjournal').hide();
				}
		});

	   $("#" + NOTEBOOK.c_s_TAB_JOURNAL).attr('aria-selected','true');

	   //ILIT-5334
	   $('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION+', #'+ NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).on('change',function(e){
		   if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			    callLogUserActivity(e); 
		    }
	   });

	    //5334 typing->track keypress, keyup, paste and blur 
		$('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_DESCRIPTION+', #'+ NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).donetyping(function(){
			if($(this.target).hasClass("valid-activity") || $(this.currentTarget).hasClass("valid-activity")){			
				callLogUserActivity(this);
			}
		},1000);
}

/**
* @method: resize 
* @uses: resizing the document
* @return void;
*/
JournalView.resize = function () {
	if ( oPlatform.isDevice()) {
		$(".notes_wrapper_content_inner").css('width','86%');
	}
	var notes_wrapper_padding = parseInt($(".notes_wrapper_right").css("padding-top")) + parseInt($(".notes_wrapper_right").css("padding-bottom")),
		notes_head_title_height = $(".notes_head_title2").outerHeight(),
		journal_titlepanel_container = $("#journalTitlePanelContainer").outerHeight(),
		save_panel_container = $("#journalSaveOperationContainer").outerHeight();
	
	if ($(".button_bar_wrapper").is(':visible') == false) {
		save_panel_container = 0;
	}
	if($("#journalTitlePanelContainer").is(':visible') == false) {
		journal_titlepanel_container = 0;
	}
	var editor_panel_container_padding = parseInt($("#journalEditorPanelContainer").css("padding-top")),
		editor_panel_container = parseInt($("#journalEditorPanelContainer").css("padding-bottom")),
		notesLandingPadding = (
			notes_wrapper_padding +
			notes_head_title_height +
			journal_titlepanel_container +
			save_panel_container +
			editor_panel_container_padding +
			editor_panel_container +
			1
		);
	
	$("#journalEditorPanelContainer").css({
		'overflow':	'hidden',
		'height':	(($(window).height())-(notesLandingPadding)) + 'px'
	});
	
	var notes_wrapper_left_padding_top = parseInt($(".notes_wrapper_left").css("padding-top")),
		notes_wrapper_left_padding_botom = parseInt($(".notes_wrapper_left").css("padding-bottom")),
		rightSideFixed = notes_wrapper_left_padding_top + notes_wrapper_left_padding_botom + 1;
	
	$(".notes_wrapper_left").css({
		'overflow-x':	'hidden',
		'overflow-y':	'auto',
		'height':		(($(window).height())-(rightSideFixed)) + 'px'
	});
	$('.' + NOTEBOOK.c_s_NOTEBOOK_LIST_WRAPPER).height($('#innerDataContainer').height());
}

JournalView._confirm  = ISeriesBase.prototype._confirm;

/**
* @method: deleteNote
* @param: {String} noteid 
* @uses: delete Journal notes
* @return void;
*/

JournalView.deleteNote = function(noteid, eventName) {
	NotebookTabsView.sDeleteEventName = eventName ? eventName : ''; // Incremental Save
	
	if (eventName != "event-cancel") {
		this._confirm({
			'divId':	'dialog-message',
			'title' : '',
			'message':	NOTEBOOK.c_s_NOTEBOOK_CONFIRM_JOURNAL_DELETE,
			'yes':		function () {
				NotebookTabsView.deleteNote(noteid);
			}
		});
	} else {
		NotebookTabsView.deleteNote(noteid);
	}
};

// Declare WordBankView object 
function WordBankView () {}

// WordBank properties
WordBankView.model = null;

/**
* @method: init 
* @param: {object} model
* @uses: for initialize the object of WordBankView
* @return void;
*/
// init
WordBankView.init = function (model) {
	var oSelf = this;
	oSelf.model = model;
	oSelf.render();
};
 
/**
* @method: render
* @uses: for populating the WordBankView Html
* @return void;
*/
WordBankView.render = function () { 
	var oSelf = this;
	$('#' + NOTEBOOK.c_s_NOTEBOOK_WRAPPER).html(
		_.template(
			$('#wordbanktemplate').html(),
			{}
		)
	);
	
	oSelf.rightPanelRender();
	oSelf.leftPanelRender();
};

/**
* @method: rightPanelRender
* @uses: for populating the Wordbank right panel 
* @return void;
*/
// Wordbank right panel render
WordBankView.rightPanelRender = function () {
	var oSelf = this;
	$('#' + NOTEBOOK.c_s_WORDBOOK_RIGHT_PANEL_CONTAINER).html(
		_.template(
			$('#' + NOTEBOOK.c_s_NOTEBOOK_RIGHT_PANEL).html(),
			{
				'tabData':		NOTEBOOK_TABS,
				'activeIdx':	NotebookView.tabType,
			}
		)
	);
};

/**
* @method: leftPanelRender
* @uses: for populating the Workbank left panel 
* @return void;
*/
// Wordbank left panel render
WordBankView.leftPanelRender = function () {
	var oSelf = this;
	$("#" + NOTEBOOK.c_s_WORDBOOK_LEFT_PANEL_CONTAINER).html(
		_.template(
			$("#" + NOTEBOOK.c_s_NOTEBOOK_LEFT_PANEL).html(),
			{
				'journaldata' : oSelf.model
			}
		)
	);
	
	var findLi = $('.' + NOTEBOOK.c_s_NOTEBOOK_LIST_WRAPPER).find('li:first');
		//findLishow = findLi.end().find("ul").eq(0).show();
	
	//findLi.addClass('active');
	
	if (objCurrentUnitDetails.currentUnit !="" && objCurrentUnitDetails.currentUnit > 1 && $(".notes_list_wrapper").find("ul").eq(objCurrentUnitDetails.currentUnit -1).parent("li").length > 0 ) {
		var findLishow = findLi.end().find("ul").eq(objCurrentUnitDetails.currentUnit -1 ).show();
		var findLi =  $(".notes_list_wrapper").find("ul").eq(objCurrentUnitDetails.currentUnit -1).parent("li");
		findLi.addClass('active');
	}else{
		findLi.addClass('active');
		var findLishow = findLi.end().find("ul").eq(0).show();
	}
	
	
	if (NotebookView.noteId == null) {
	    findLishow.find('li:first').addClass('active');
		var wordbankId = findLishow.find('li:first').find('a').attr("note-id");
	}
	else {
		li_objects = $('.' + NOTEBOOK.c_s_NOTEBOOK_LIST_WRAPPER).find('li').find('ul').find('li').find('a');
		$(li_objects).each(function (index) {
			if ($(this).attr('note-id') == NotebookView.noteId) {
				$(this).parent('li').addClass('active');
				wordbankId = $(this).attr('note-id');
			}
		});
	}
	if (typeof wordbankId!= 'undefined') {
		$('#'+NOTEBOOK.c_s_NOTEBOOK_DELETE_WORDBANK).show();
		NotebookView.noteId = wordbankId;
		NotebookView.noteRefId = findLishow.find('li:first').find('a').attr("ref-id");
		NotebookView.refUnitNumber = findLishow.find('li:first').find('a').attr("ref-unitno");
	}
	else {
		findLi.removeClass('active');
	}
	oSelf.innnerPanelRenderV2(wordbankId);
	$('#closenotebook').focus();
};

/**
* @method: innnerPanelRender
* @param: {String} wordbankId
* @uses: for populating the Wordbank inner panel 
* @return void;
*/
// Wordbank right panel render 
WordBankView.innnerPanelRender = function (wordbankId) {
	var oSelf = this;
	
	$("#innerWordbankDataContainer").html(
		_.template(
			$("#wordbankInnerTemplate").html(),
			{
				'wordbankData': _.where(oSelf.model, {NoteID : wordbankId})
			}
		)
	);
	$('.' + NOTEBOOK.c_s_EDITOR_SAVE_CONTAINER).hide();
	$('#'+NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE).hide();
	$('#'+NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE).hide();
	oSelf.bindEvents();
	if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
		$("#"+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_TITLE).attr("contenteditable","false");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_DESCRIPTION).attr("contenteditable","false");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_SENTENCE).attr("contenteditable","false");
		$("#" + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_WORDBANK).css("visibility","hidden");
		$("#" + NOTEBOOK.c_s_NOTEBOOK_DELETE_WORDBANK).css("visibility","hidden");
	}
	NotebookTabsView.bindEvents();
	oSelf.resize();
};

// Wordbank right panel render 
WordBankView.innnerPanelRenderV2 = function (wordbankId) {  // for V2 services
	var oSelf = this;
	$("#innerWordbankDataContainer").html(
		_.template(
			$("#wordbankInnerTemplateV2").html(),
			{}
		)
	);
	
	$('.' + NOTEBOOK.c_s_EDITOR_SAVE_CONTAINER).hide();
	$('#'+NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE).hide();
	$('#'+NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE).hide(); 
	oSelf.bindEvents();
	if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
		$("#"+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_TITLE).attr("contenteditable","false");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_DESCRIPTION).attr("contenteditable","false");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_SENTENCE).attr("contenteditable","false");
		$("#" + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_WORDBANK).css("visibility","hidden");
		$("#" + NOTEBOOK.c_s_NOTEBOOK_DELETE_WORDBANK).css("visibility","hidden");
	}
	NotebookTabsView.bindEvents();
	oSelf.resize();
	
	if (wordbankId !== undefined) {
		$.nativeCall({
			'method':			'GetNoteInfo',
			'globalResource':	'objNoteInfoData',
			'inputParams':		[wordbankId],
			'beforeSend':		function () {
				$('#innerWordbankDataContainer')
					.css({'opacity':'0.3'})
					.append('<div class="notbookoverlay" style="font-size:13px;">\
						<img src="media/loader.gif" alt="" />\
						<p>' + NOTEBOOK.c_s_NOTEBOOK_LOADING_TXT + '</p>\
					</div>');
				
				$('#' + NOTEBOOK.c_s_JOURNAL_EDITOR_SAVE_CONTAINER).hide();
				$('.' + NOTEBOOK.c_s_EDITOR_SAVE_CONTAINER).hide();
				$('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE).hide();
				$('#' + NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE).hide();
				$('#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_WORDBANK).show();
				oSelf.bindEvents();
				NotebookTabsView.bindEvents();
				oSelf.resize();
			},
			'onComplete':		function (objGetNoteInfoResponse) {
				$("#innerWordbankDataContainer").html(
					_.template(
						$("#wordbankInnerTemplateV2").html(),
						{
							'wordbankData':		objGetNoteInfoResponse.Content,
							'serviceVersion':	objCurrentUnitDetails.serviceVersion
						}
					)
				);
				$('#innerWordbankDataContainer').css({'opacity':'1'});
				$(".notbookoverlay").remove();
				$('.' + NOTEBOOK.c_s_EDITOR_SAVE_CONTAINER).hide();
				$('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE).hide();
				$('#' + NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE).hide(); 
				oSelf.bindEvents();
				if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
					$('#' + NOTEBOOK.c_s_NOTEBOOK_WORDBANK_TITLE).attr('contenteditable','false');
					$('#' + NOTEBOOK.c_s_NOTEBOOK_WORDBANK_DESCRIPTION).attr('contenteditable','false');
					$('#' + NOTEBOOK.c_s_NOTEBOOK_WORDBANK_SENTENCE).attr('contenteditable','false');
					$('#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_WORDBANK).css('visibility','hidden');
					$('#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_WORDBANK).css('visibility','hidden');
				}
				NotebookTabsView.bindEvents();
				oSelf.resize();
				
				//Incremental Save : call on WordBank render
				if (NotebookView.iSaveAttemptDataTimerInterval && NotebookView.bIncrementalSaveTimerStarted == false) {
					NotebookView.bIncrementalSaveTimerStarted = true;
					setTimeout(function() { 
						NotebookView.incrementalSave();
					}, NotebookView.iSaveAttemptDataTimerInterval);
				}
			},
			'onError':			function (objGetNoteInfoResponse, oErrorThrown) {
				$('#innerWordbankDataContainer').css({'opacity':'1'});
				$(".notbookoverlay").remove();
			}
		});
	}
} 

/* method to be called after save button click. or Save from incremental save timer */
WordBankView.onSave = function (e) {
	var oSelf = this;
	 var noteTitle  = fixedEncodeURIComponent(stripHtmlTagsFromString($("#"+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_TITLE).text())), 
			definition = fixedEncodeURIComponent($("#"+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_DESCRIPTION).html()),
			sentence   = fixedEncodeURIComponent($("#"+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_SENTENCE).html());
		//var contents   = {\"datacontent\":[{\"Definition\":\""+definition+"\",\"Sentence\":\""+sentence+"\"}]};
		
		var contents   = "{\\\"datacontent\\\":[{\\\"Definition\\\":\\\""+definition+"\\\",\\\"Sentence\\\":\\\""+sentence+"\\\"}]}";
		
		if(NotebookView.noteId != null){
			var find_dataset = _.where(oSelf.model, {RefUnitNumber : NotebookView.refUnitNumber, NoteTitle : noteTitle,NoteID : !(NotebookView.noteId)});
		}else{
			var find_dataset = _.where(oSelf.model, {RefUnitNumber : NotebookView.refUnitNumber, NoteTitle : noteTitle});
		}
		
		if(_.isEmpty(find_dataset)){
			/* presence of e indicates there is event object since the method is called from Save button click*/
			if(e){
				NotebookTabsView.saveData(noteTitle, contents, '', '',  e.target); 
			} else {
				return {'title':noteTitle, 'content':contents}; //if called from incremental save
			}
			
		} else {
			NotebookView._alert({
						divId:		'dialog-message',
						title : 'Alert!',
						message:	NOTEBOOK.c_s_NOTEBOOK_DUPLICATE_TITLE
					});
		}

		//ILIT-5334
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
					callLogUserActivity(e); 
		}
}
/**
* @method: bindEvents
* @uses: bind events for the Workbank tab
* @return void;
*/
WordBankView.bindEvents = function (model) {
	var oSelf = this;
	// left menu accordian effect
	NotebookTabsView.showhidemenupanel();
	if($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) != POPUP_VIEW.c_s_MODE_INSTRUCTOR){
		// add operation
		$('#'+NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_WORDBANK).off("click tap").on("click tap", function(){
			NotebookView.clearIncrementalSaveTimerData(); //Incremental Save - clear timer
			NotebookView.noteId = null;
			if (objCurrentUnitDetails.currentUnit !="") {
				NotebookView.refUnitNumber = objCurrentUnitDetails.currentUnit;
			}else{
				NotebookView.refUnitNumber = '1';
			}
			
			NotebookView.noteRefId = null;
			NotebookView.refOtherData = null;
			NotebookView.shortNoteText = '';
			
			$("#" +NOTEBOOK.c_s_NOTEBOOK_EMPTY_WORDBANK_LABEL).hide();
			$('#'+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_TITLE).text(GENERAL.c_s_SPECIAL_CHARACTERS_BLANK);
			$('#'+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_DESCRIPTION).text(GENERAL.c_s_SPECIAL_CHARACTERS_BLANK);
			$('#'+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_SENTENCE).text(GENERAL.c_s_SPECIAL_CHARACTERS_BLANK);
			
			$('.' + NOTEBOOK.c_s_EDITOR_SAVE_CONTAINER).show();
			$('#'+NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).show();
			$('#'+NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE_BTTN).show();
			$('.notes_book_content').show();
			// render Journal Addview
			//WordBankView.addeditview();
			$('#'+NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE).attr('data-value',NOTEBOOK.c_s_NOTEBOOK_SAVE);
			$("#" +NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).attr('disabled',false);
			$('#'+NOTEBOOK.c_s_NOTEBOOK_DELETE_WORDBANK).hide();
			$(".notes_head_title2").css("height",$(".notes_head_title").height()+'px');
			$(this).hide();
			WordBankView.resize();
			
			//Incremental Save - on wordbank add button click
			if (NotebookView.iSaveAttemptDataTimerInterval && NotebookView.bIncrementalSaveTimerStarted == false) {
				NotebookView.bIncrementalSaveTimerStarted = true;
				setTimeout(function() { 
					NotebookView.incrementalSave();
				}, NotebookView.iSaveAttemptDataTimerInterval);
			}
			
			// save and delete operation
			NotebookTabsView.bindEvents(oSelf);
			$('#'+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_TITLE).focus();
		});
		// bind click event on save button
	   $('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).off("click tap").on("click tap", function(e){ 
			NotebookView.clearIncrementalSaveTimerData(); //clear incremental save timer
			WordBankView.onSave(e);
		});
		// bind click event on title, description, sentence
		$("#"+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_TITLE+", #"+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_DESCRIPTION+", #"+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_SENTENCE+"")
	   .off("click tap focus").on("click tap focus", function(e){ 
			$('.' + NOTEBOOK.c_s_EDITOR_SAVE_CONTAINER).show();
			$('#'+NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).show();
			$('#'+NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE_BTTN).show();
			$('#'+NOTEBOOK.c_s_NOTEBOOK_DELETE_WORDBANK).show();
			$("#" +NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).attr('disabled',false);
			oSelf.resize();
		   //ILIT-5334
		   if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			     callLogUserActivity(e); 
		   }
		});
		//bind click event on cancel button
		$('#' + NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE_BTTN).off("click tap").on("click tap", function(e){
			NotebookView.clearIncrementalSaveTimerData(); //Incremental Save - clear timer
			// hiding save & cancel button
			// $('.' + NOTEBOOK.c_s_EDITOR_SAVE_CONTAINER).hide();
			$('#' + NOTEBOOK.c_s_EDITOR_SAVE_CONTAINER).hide();
			$('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).hide();
			$('#' + NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE_BTTN).hide();
			
			// delete if it is already saved (added) due to incremental save
			if (NotebookView.sPrevNoteId == NotebookView.noteId && $('.notes_list_wrapper a[note-id='+NotebookView.noteId+']').length == 0) {
				oSelf.deleteNote(NotebookView.noteId, "event-cancel"); 
				oSelf.innnerPanelRenderV2()
			} else if (NotebookView.sPrevNoteId == NotebookView.noteId && $('.notes_list_wrapper a[note-id='+NotebookView.noteId+']').length) {
				//revert/restore to previous state prior to incremental save (edit)
				var definition = (JSON.parse(objNoteInfoData.Content.NoteText)).datacontent[0]['Definition'];
				var sentence   = (JSON.parse(objNoteInfoData.Content.NoteText)).datacontent[0]['Sentence'];				
				var contents   = "{\\\"datacontent\\\":[{\\\"Definition\\\":\\\""+definition+"\\\",\\\"Sentence\\\":\\\""+sentence+"\\\"}]}";
				
				NotebookTabsView.saveData(objNoteInfoData.Content.NoteTitle,contents,objNoteInfoData.Content.NoteOtherRefData,objNoteInfoData.Content.ShortNoteText, e.target);
				oSelf.innnerPanelRenderV2(($(this).data('note-id') || NotebookView.noteId || NotebookView.prevNoteId));
			}
			else {			
				oSelf.innnerPanelRenderV2(($(this).data('note-id') || NotebookView.noteId || NotebookView.prevNoteId))
			}
			
			$('.notes_book_content').show();
			$("#" +NOTEBOOK.c_s_NOTEBOOK_EMPTY_WORDBANK_LABEL).hide();
			$('#'+NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_WORDBANK).show();
			$('#'+NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_WORDBANK).focus();
			//
			//$('#wordtitle').html(NotebookView.noteprevTitle);
			//$('#worddefinition').html(NotebookView.noteprevText);
			oSelf.resize();
		});
		// delete operation
		$('#'+NOTEBOOK.c_s_NOTEBOOK_DELETE_WORDBANK).off("click tap").on("click tap", function(){
			NotebookView.clearIncrementalSaveTimerData(); //Incremental Save - clear timer
			oSelf.deleteNote(NotebookView.noteId);
	   });
			
	   if(oPlatform.isChromeApp()) {
			$('#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_WORDBANK + ', #' + NOTEBOOK.c_s_NOTEBOOK_DELETE_WORDBANK)
			   .off("keydown")
			   .on("keydown", function (e) {
				   triggerClickOnThisElemApp(e, this);
		});
		}
		
		// bind click event on wordbank's input
		$(".note_comments, .notes_book_title").off('click').on('click',function(){
			$(this).find(".middle").focus();
			$('.' + NOTEBOOK.c_s_EDITOR_SAVE_CONTAINER).show();
			$('#'+NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).show();
			$('#'+NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE_BTTN).show();
			$('#'+NOTEBOOK.c_s_NOTEBOOK_DELETE_WORDBANK).show();
			$("#" +NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).attr('disabled',false);
			oSelf.resize();
		});	
	
	}

	// bind click operation on wordbank's left menu
   $('[id^=noteid_]').off('click').on('click',function(e){ 
		NotebookView.clearIncrementalSaveTimerData(); //clear incremental save timer on wordbank left list item
		var wordbankId = $(this).attr("note-id");
		NotebookView.noteId = wordbankId;
		NotebookView.refUnitNumber = $(this).attr('ref-unitno');
		NotebookView.noteRefId = $(this).attr('ref-id');
		oSelf.innnerPanelRenderV2(wordbankId);
		$('#'+NOTEBOOK.c_s_NOTEBOOK_DELETE_WORDBANK).show();

	   //ILIT-5334
	   if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
		    callLogUserActivity(e); 
	   }
	});
	
	$('[id^=noteid_]')
		.off('keyup')
		.on('keyup', function (e) {
			var KeyID = e.keyCode;
			if(KeyID==32 || KeyID==13) {//'space' || 'enter'
				$(this).trigger("click");
				e.preventDefault();
				e.stopPropagation();
			}
		});

	//tooltip on wordbank
	$('#ui-tooltip_deleteword, #ui-tooltip_sendword, #ui-tooltip_addword').hide();
	$('#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_WORDBANK + ',#' + NOTEBOOK.c_s_NOTEBOOK_SEND_WORDBANK
		+ ',#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_WORDBANK).focus(function(e){
		if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_DELETE_WORDBANK) {
			$('#ui-tooltip_deleteword').show();		
		} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_SEND_WORDBANK) {
			$('#ui-tooltip_sendword').show();		
		} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_WORDBANK) {
			$('#ui-tooltip_addword').show();		
		}
	});
	$('#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_WORDBANK + ',#' + NOTEBOOK.c_s_NOTEBOOK_SEND_WORDBANK
		+ ',#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_WORDBANK).focusout(function(e){
		if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_DELETE_WORDBANK) {
			$('#ui-tooltip_deleteword').hide();		
		} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_SEND_WORDBANK) {
			$('#ui-tooltip_sendword').hide();		
		} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_WORDBANK) {
			$('#ui-tooltip_addword').hide();		
		}
	});
   $("#" + NOTEBOOK.c_s_TAB_WORDBANK).attr('aria-selected','true');


   //ILIT-5334
	var updateLayout = _.debounce(function(e) {
		//ILIT-5334
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		 }
	},2000); 
   $("#"+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_TITLE+", #"+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_DESCRIPTION+", #"+NOTEBOOK.c_s_NOTEBOOK_WORDBANK_SENTENCE+"").on('DOMSubtreeModified', updateLayout);
   


}

/**
* @method: resize 
* @uses: resizing the document
* @return void;
*/
WordBankView.resize = function () {
	/* $('.notes_wrapper_content_inner').css('min-height','450px');
	$('.notes_wrapper').height($(window).height()); */
	//$('.notes_wrapper_content_inner').css({"max-width":"500px","margin":"0 auto"});
	if ( oPlatform.isDevice()) {
		$(".notes_wrapper_content_inner").css('width','86%');
	}
	
	$(".notes_book_content").css({"max-width":"500px","margin":"0 auto"});
	var notes_wrapper_padding = parseInt($(".notes_wrapper_right").css("padding-top")) + parseInt($(".notes_wrapper_right").css("padding-bottom"))
	var notes_head_title_height = $(".notes_head_title2").outerHeight();
	var container_notes_wrapper_title = $(".container_notes_wrapper_title").outerHeight();
	var save_panel_container = $(".button_bar_wrapper").outerHeight();
	if($(".button_bar_wrapper").css('display')=="none"){
		save_panel_container=0;
	}
	var editor_panel_container_padding = parseInt($(".notes_wrapper_content_inner").css("padding-top")) ;
	var editor_panel_container = parseInt($(".notes_wrapper_content_inner").css("padding-bottom"));
	var notesLandingPadding = notes_wrapper_padding + notes_head_title_height +container_notes_wrapper_title+save_panel_container+editor_panel_container_padding+ editor_panel_container+1;
	
	$(".notes_wrapper_content_inner").height(($(window).height())-(notesLandingPadding)).css({"overflow-x":"hidden","overflow-y":"auto"});
	
	var notes_wrapper_left_padding_top =  parseInt($(".notes_wrapper_left").css("padding-top")) ;
	var notes_wrapper_left_padding_botom =parseInt($(".notes_wrapper_left").css("padding-bottom"))
	var rightSideFixed= notes_wrapper_left_padding_top+ notes_wrapper_left_padding_botom +1;
	$(".notes_wrapper_left").height(($(window).height())-(rightSideFixed)).css({"overflow-x":"hidden","overflow-y":"auto"});
	$("." +NOTEBOOK.c_s_NOTEBOOK_LIST_WRAPPER).height($("#innerWordbankDataContainer").height());
};

WordBankView._confirm = ISeriesBase.prototype._confirm;

/**
* @method: deleteNote
* @param: {String} noteid 
* @uses: for deleting Wordbank notes
* @return void;
*/
WordBankView.deleteNote = function(noteid, eventName){
	NotebookTabsView.sDeleteEventName = eventName ? eventName : ''; // Incremental Save
	
	if (eventName != "event-cancel") {
		this._confirm({
			'divId':	'dialog-message',
			'title':	'',
			'message':	NOTEBOOK.c_s_NOTEBOOK_CONFIRM_WORDBANK_DELETE,
			'yes':		function () {
				NotebookTabsView.deleteNote(noteid);
			}
		});
	} else {
		NotebookTabsView.deleteNote(noteid);
	}	
}

// Declare ClassNotesView object 
function ClassNotesView () {}

// ClassNotes properties
ClassNotesView.model = null;
ClassNotesView.inputFormats = null;
ClassNotesView.sLoadedNoteText = '';
 
/**
* @method: init 
* @param: {object} model
* @uses: for initialize the object
* @return void;
*/
 
// init
ClassNotesView.init = function (model) {
	var oSelf = this;
	oSelf.model = model;
	oSelf.render();
	oSelf.setInputFormats();
}

/**
* @method: render
* @uses: for populating the ClassNotesView Html
* @return void;
*/
 
ClassNotesView.render = function () {
	var oSelf = this;
	$("#" + NOTEBOOK.c_s_NOTEBOOK_WRAPPER).html(
		_.template($('#classnotestemplate').html(),{})
	);
	oSelf.rightPanelRender();
	oSelf.leftPanelRender();
};

/**
* @method: rightPanelRender
* @uses: for populating the Classnote's right panel 
* @return void;
*/
// Classnotes right panel render
ClassNotesView.rightPanelRender = function () {
	var oSelf = this;
	$("#" + NOTEBOOK.c_s_CLASSNOTES_RIGHT_PANEL_CONTAINER).html(
		_.template(
			$("#" + NOTEBOOK.c_s_NOTEBOOK_RIGHT_PANEL).html(),
			{
				'tabData':		NOTEBOOK_TABS,
				'activeIdx':	NotebookView.tabType
			}
		)
	);
};

/**
* @method: leftPanelRender
* @uses: for populating the Classnote's left panel 
* @return void;
*/
// Classnotes left panel render
ClassNotesView.leftPanelRender = function () {
	var oSelf = this;
	$("#" + NOTEBOOK.c_s_CLASSNOTES_LEFT_PANEL_CONTAINER).html(
		_.template(
			$("#" + NOTEBOOK.c_s_NOTEBOOK_LEFT_PANEL).html(),
			{
				'journaldata' : oSelf.model
			}
		)
	);
	
	var findLi = $("." + NOTEBOOK.c_s_NOTEBOOK_LIST_WRAPPER).find('li:first');
		//findLishow = findLi.end().find("ul").eq(0).show();
	
	//findLi.addClass('active');
	if (objCurrentUnitDetails.currentUnit !="" && objCurrentUnitDetails.currentUnit > 1 && $(".notes_list_wrapper").find("ul").eq(objCurrentUnitDetails.currentUnit -1).parent("li").length > 0 ) {
		var findLishow = findLi.end().find("ul").eq(objCurrentUnitDetails.currentUnit -1 ).show();
		var findLi =  $(".notes_list_wrapper").find("ul").eq(objCurrentUnitDetails.currentUnit -1).parent("li");
		findLi.addClass('active');
	}else{
		findLi.addClass('active');
		var findLishow = findLi.end().find("ul").eq(0).show();
	}
	
	if (NotebookView.noteId == null) {
	    findLishow.find('li:first').addClass('active');
		var classnotesId = findLishow.find('li:first').find('a').attr("note-id");
	}
	else {
		li_objects = ($('.' + NOTEBOOK.c_s_NOTEBOOK_LIST_WRAPPER).find('li').find('ul').find('li').find('a'));
		$(li_objects).each(function (index) {
			if ($(this).attr('note-id') == NotebookView.noteId) { 
				$(this).parent('li').addClass('active');
				classnotesId = $( this ).attr('note-id');
			}
		});
	}
	if (typeof classnotesId!= 'undefined') {
		if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) != POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
			$('#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_CLASSNOTE).show();
		}
		NotebookView.noteId = classnotesId;
		NotebookView.noteRefId = findLishow.find('li:first').find('a').attr("ref-id");
		NotebookView.refUnitNumber = findLishow.find('li:first').find('a').attr("ref-unitno");
	}
	else {
		findLi.removeClass('active');
		NotebookView.noteId = null;
		NotebookView.refUnitNumber = '1';
		NotebookView.noteRefId = null;
	}

	$('.notes_list_wrapper li, .notes_list_wrapper li a').off('focus').on('focus',function() {
		$("#" +NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE_TOOLTIP).hide();
		$("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE).attr('tabindex','0');
		$("#" +NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE).attr('aria-expanded','false');
		$("#" +NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE_TOOLTIP).find(".oragnic_tooltip li a").attr('tabindex','-1');
	})
	oSelf.innnerPanelRenderV2(classnotesId);
	$('#closenotebook').focus();
}

/**
* @method: innnerPanelRender
* @params : classnotesId
* @uses: for populating the Classnote's inner panel 
* @return void;
*/

// Classnotes right panel render 
ClassNotesView.innnerPanelRender = function (classnotesId) { 
	var oSelf = this;
	if(classnotesId !=null){ 
		$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).attr('contenteditable',true);
		classnoteText = _.where(oSelf.model, {NoteID : classnotesId});
		$("#hidclassvalue").html(decodeURIComponent(classnoteText[0].NoteTitle));
		$("#" +NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).val($("#hidclassvalue").html());
		if(classnoteText[0].NoteText != null) {
			try{ 
			classnoteText = ($.parseJSON(classnoteText[0].NoteText));
			classnotedateset = [];
			$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).html(GENERAL.c_s_SPECIAL_CHARACTERS_BLANK);
			$.each(classnoteText, function(key, value){
				
				 $.each(value,function (subkey,val){
					type = _.keys(val).toString();
					
					classnotedateset = [];
					
					switch (type){
						case NOTEBOOK.c_s_NOTEBOOK_EDITORPANEL_DATA:
						$.each(val.editorpaneldata[0],function(i,v){
							classnotedateset.push(v);
						});
						$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).append(decodeURIComponent(classnotedateset[0])+'<br>');
						
						break;
						
						case NOTEBOOK.c_s_NOTEBOOK_CAUSEEFFECT_DATA:
						$.each(val.causeandeffectdata[0],function(i,v){
							classnotedateset.push(v);
						});
						
						$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).append('<span class="portfoliograph"  contenteditable="false" data-value="'+NOTEBOOK.c_s_NOTEBOOK_CAUSEEFFECT_GRAPH+'" >'+_.template($('#causeneffecttemplate').html()+'</span><br>',{'classnotesdata' : classnotedateset}));
						break;
						
						case NOTEBOOK.c_s_NOTEBOOK_STEPBYSTEP_DATA:
						
						var stpbystpkey = Object.keys(val.stepbystepdata[0]),
							i, stpbystpkeylen = stpbystpkey.length;
							stpbystpkey.sort();
							for (i = 0; i < stpbystpkeylen; i++)
							{
								k = stpbystpkey[i];
								classnotedateset.push(val.stepbystepdata[0][k]);
							}
						/*	
						$.each(val.stepbystepdata[0],function(i,v){
							classnotedateset.push(v);
						});
						*/
						
						$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).append('<span class="portfoliograph" contenteditable="false" data-value="'+NOTEBOOK.c_s_NOTEBOOK_STEPBYSTEP_GRAPH+'" >'+_.template($('#stempbysteptemplate').html()+'</span><span contenteditable="false"><br></span>',{'classnotesdata' : classnotedateset}));	
						break;
						
						case NOTEBOOK.c_s_NOTEBOOK_STORYMAP_DATA:
						
						var storymapkey = Object.keys(val.storymapdata[0]),
							i, storymaplen = storymapkey.length;
							storymapkey.sort();
							for (i = 0; i < storymaplen; i++)
							{
								k = storymapkey[i];
								classnotedateset.push(val.storymapdata[0][k]);
							}
						
						/* $.each(val.storymapdata[0],function(i,v){
							classnotedateset.push(v);
						}); */
						$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).append('<span class="portfoliograph" contenteditable="false" data-value="'+NOTEBOOK.c_s_NOTEBOOK_STORYMAP_GRAPH+'">'+_.template($('#storymaptemplate').html()+'</span><br>',{'classnotesdata' : classnotedateset}));
							
						break;
						
						case NOTEBOOK.c_s_NOTEBOOK_THREECOLUMN_DATA: 
						
						/* $.each(val.threecolumndata[0],function(i,v){
							classnotedateset.push(v);
						});
						 */
						try{ 
						$.each(val.threecolumndata[0].threecolumntextdata[0],function(i,v){
								classnotedateset.push(v);
							});
						$.each(val.threecolumndata[1].threecolumnstepdata[0],function(i,v){
								classnotedateset.push(v);
							});	
						}catch(e){
							$.each(val.threecolumndata[0],function(i,v){
							classnotedateset.push(v);
							});
							for(var i= 0;i<3;i++){
							   step = (NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_STEP_TXT+(i+1));
								classnotedateset.push(step);
							}
						}
						
						$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).append('<span class="portfoliograph" contenteditable="false" data-value="'+NOTEBOOK.c_s_NOTEBOOK_THREECOLUMN_GRAPH+'">'+_.template($('#threecolumncharttemplate').html()+'</span><br>',{'classnotesdata' : classnotedateset}));	
						break;
						
						case NOTEBOOK.c_s_NOTEBOOK_TIMELINE_DATA:
							var timelinedatekey = Object.keys(val.timelinedata[0].timelinedateinput[0]),
							timelineeventkey =Object.keys(val.timelinedata[1].timelineeventinput[0]),
							i, timelinedatelen = timelinedatekey.length,timelineeventlen = timelineeventkey.length;
							timelinedatekey.sort();timelineeventkey.sort();
							
							for (i = 0; i < timelinedatelen; i++)
							{
								k = timelinedatekey[i];
								classnotedateset.push(val.timelinedata[0].timelinedateinput[0][k]);
							}
							for (i = 0; i < timelineeventlen; i++)
							{
								k = timelineeventkey[i];
								classnotedateset.push(val.timelinedata[1].timelineeventinput[0][k]);
							}
							
							/* $.each(val.timelinedata[0].timelinedateinput[0],function(i,v){
								classnotedateset.push(v);
							}); 
							$.each(val.timelinedata[1].timelineeventinput[0],function(i,v){
								classnotedateset.push(v);
							});
							*/
						$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).append('<span class="portfoliograph" contenteditable="false"  data-value="'+NOTEBOOK.c_s_NOTEBOOK_TIMELINE_GRAPH+'">'+_.template($('#timelineemplate').html()+'</span><br>',{'classnotesdata' : classnotedateset}));	
							
						break;
						
						case NOTEBOOK.c_s_NOTEBOOK_TWOCOLUMN_DATA:
						
						/* $.each(val.twocolumndata[0],function(i,v){
							classnotedateset.push(v);
						}); */
						
						
						try{ 
						$.each(val.twocolumndata[0].twocolumntextdata[0],function(i,v){
								classnotedateset.push(v);
							});
						$.each(val.twocolumndata[1].twocolumnstepdata[0],function(i,v){
								classnotedateset.push(v);
						});
						}catch(e){
						    
							$.each(val.twocolumndata[0],function(i,v){
							  classnotedateset.push(v);
							});
							for(var i= 0;i<2;i++){
							   step = (NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_STEP_TXT+(i+1));
								classnotedateset.push(step);
							}
						}
						$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).append('<span class="portfoliograph" contenteditable="false" data-value="'+NOTEBOOK.c_s_NOTEBOOK_TWOCOLUMN_GRAPH+'">'+_.template($('#twocolumncharttemplate').html()+'</span><br>',{'classnotesdata' : classnotedateset}));	
						break;
						
						default:
						$.each(val.vendiagramdata[0],function(i,v){
							classnotedateset.push(v);
						});
						$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).append('<span class="portfoliograph" contenteditable="false">'+_.template($('#vendiagramttemplate').html()+'</span><br>',{'classnotesdata' : classnotedateset}));
						break;
				  }
				 });
				 
				});
				}
				catch(e){
					try{
						$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).append(classnoteText[0].NoteText);
					}catch(e){
					    $("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).append(decodeURIComponent(classnoteText.datacontent[0].Definition)+"<BR>"+decodeURIComponent(classnoteText.datacontent[0].Sentence));
					}
				}
		}				
	   }else{
			//ILIT-6215
			if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) != POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
				$("#" +NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).val(NOTEBOOK.c_s_NOTEBOOK_EMPTY_TITLE_TXT);
			} else {
				$(".container_notes_wrapper_title, .notes_wrapper_content_inner").css("visibility","hidden");
			}
			$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).html(GENERAL.c_s_SPECIAL_CHARACTERS_BLANK);
	   }
	
	$('.' + NOTEBOOK.c_s_EDITOR_SAVE_CONTAINER).hide();
	$('#'+NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE).hide();
	$('#'+NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE).hide();
	
	if($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR){
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).attr("disabled","disabled");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).css("-webkit-text-fill-color","rgba(0, 0, 0, 1)");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).css("-webkit-opacity",1);
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).css("color","rgba(0, 0, 0, 1)");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).css("background","white");
		$("#"+NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).attr("contenteditable","false");
		$("#" + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_CLASSNOTE).hide();
		$("#" + NOTEBOOK.c_s_NOTEBOOK_DELETE_CLASSNOTE).css("visibility","hidden");
		$("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE).css("visibility","hidden");
		$("textarea").attr("disabled","disabled");
		$("textarea").css("-webkit-text-fill-color","rgba(0, 0, 0, 1)");
		$("textarea").css("-webkit-opacity",1);
		$("textarea").css("color","rgba(0, 0, 0, 1)");
		$("textarea").css("background","white");
	}else{	
		oSelf.showhideBtns();
	}
	
	oSelf.bindEvents();
	NotebookTabsView.bindEvents();
	oSelf.resize();
} 

ClassNotesView.setInputFormats = function () {
	if ($GLOBALS.get('ClassNotesInputFormats') === undefined) {
		var fColumnarDataRenderer = function (paHeader, paText, sChartType) {
			var oHeader = ((paHeader || [])[0] || {}),
				oText = ((paText || [])[0] || {}),
				iMaxStep = (sChartType == 'twocolumn'? 2: 3),
				oTemplateData = {
					'header':		{},
					'text':			{},
					'chartType':	sChartType
				},
				sCurStepKey = '',
				sAltCurStepKey = '',
				sChartDataValue = NOTEBOOK['c_s_NOTEBOOK_' + sChartType.toUpperCase() + '_GRAPH'];
			
			for (var iStep = 1; iStep <= iMaxStep; iStep++) {
				sCurStepKey = 'step' + iStep;
				sAltCurStepKey = 'columnstep' + iStep;
				oTemplateData['header'][sCurStepKey] = (
					decodeURIComponent(
						oHeader[sCurStepKey] ||
						oHeader[sAltCurStepKey] ||
						(NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_STEP_TXT + iStep)
					) ||
					''
				);
				oTemplateData['text'][sCurStepKey] = (decodeURIComponent(oText[sCurStepKey] || oText[sAltCurStepKey] || '') || '');
			}
			
			return '<span class="portfoliograph" contenteditable="false" data-value="' + sChartDataValue + '">\
				' + _.template(
					$('#columncharttemplate').html(),
					{ 'data': oTemplateData }
				) + '\
			</span>';
		};
		$GLOBALS.set('ClassNotesInputFormats', {
			'editorpanel':	 	{
				'renderer':		function (paData) {
					paData = (paData instanceof Array)? paData: [];
					var sContent = ((paData.first() || {}).textcontent || '');
					
					return (sContent.length !== 0) ? decodeURIComponent(sContent) + '<br>' : decodeURIComponent(sContent);
				}
			},
			'causeandeffect':	{
				'renderer':		function (paData) {
					var oData = (
							(paData instanceof Array)?
							(paData.first() || {}):
							{}
						);
					
					if (typeof oData.causetext !== 'string') {
						oData.causetext = '';
					}
					if (typeof oData.effecttext !== 'string') {
						oData.effecttext = '';
					}
					return '<span class="portfoliograph" contenteditable="false" data-value="' + NOTEBOOK.c_s_NOTEBOOK_CAUSEEFFECT_GRAPH + '">\
						' + _.template(
							$('#causeneffecttemplate').html(),
							{
								'data' : oData
							}
						) + '\
					</span><br>';
				}
			},
			'stepbystep':		{
				'renderer':		function (paData) {
					var oData = (
							(paData instanceof Array)?
							(paData.first() || {}):
							{}
						),
						iMaxStep = 4,
						oTemplateDate = {},
						sCurStep = '';
					
					for (var iStep = 1; iStep <= iMaxStep; iStep++) {
						sCurStep = 'step' + iStep;
						oTemplateDate[sCurStep] = {
							'text':			decodeURIComponent(oData[sCurStep] || ''),
							'showArrow':	(iStep < iMaxStep)
						};
					}
					
					return '<span class="portfoliograph" contenteditable="false" data-value="' + NOTEBOOK.c_s_NOTEBOOK_STEPBYSTEP_GRAPH + '">\
						' + _.template(
							$('#stempbysteptemplate').html(),
							{ 'data': oTemplateDate }
						) + '\
					</span><br>';
				}
			},
			'storymap':			{
				'renderer':		function (paData) {
					var oData = (
							(paData instanceof Array)?
							(paData.first() || {}):
							{}
						),
						iMaxStep = 5,
						oTemplateDate = {},
						sCurStep = '',
						bHasData = false,
						aStepTitles = [
							NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_CHARACTERSLABEL_TXT,
							NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_SETTINGLABEL_TXT,
							NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_PROBLEMLABEL_TXT,
							NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_EVENTLABEL_TXT,
							NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_SOLUTIONLABEL_TXT
						];
					
					for (var iStep = 1; iStep <= iMaxStep; iStep++) {
						sCurStep = 'step' + iStep;
						oTemplateDate[sCurStep] = {
							'title':	(aStepTitles[iStep - 1] || ''),
							'text':		decodeURIComponent(oData[sCurStep] || '')
						};
					}
					
					return '<span class="portfoliograph" contenteditable="false" data-value="' + NOTEBOOK.c_s_NOTEBOOK_STORYMAP_GRAPH + '">' +
						_.template(
							$('#storymaptemplate').html(),
							{ 'data': oTemplateDate }
						) +
					'</span><br>';
				}
			},
			'threecolumn':		{ 'renderer':	fColumnarDataRenderer },
			'twocolumn':		{ 'renderer':	fColumnarDataRenderer },
			'timeline':			{
				'renderer':		function (paData) {
					var oDateInput = {},
						oEventInput = {},
						oTemplateData = {
							'date':		{},
							'event':	{}
						},
						iMaxSteps = 5,
						sCurStep = '';
					
					/*=== Extract Actual Data ===*/
					paData = (paData instanceof Array? paData: []);
					for (var iI = 0; iI < paData.length; iI++) {
						if (
							paData[iI].timelinedateinput !== undefined &&
							paData[iI].timelinedateinput instanceof Array
						) {
							oDateInput = paData[iI].timelinedateinput.first() || {};
						}
						if (
							paData[iI].timelineeventinput !== undefined &&
							paData[iI].timelineeventinput instanceof Array
						) {
							oEventInput = paData[iI].timelineeventinput.first() || {};
						}
					}
					/*= End Extract Actual Data =*/
					
					for (var iStep = 1; iStep <= iMaxSteps; iStep++) {
						sCurStep = 'step' + iStep;
						
						oTemplateData['date'][sCurStep] = decodeURIComponent(oDateInput[sCurStep] || '');
						oTemplateData['event'][sCurStep] = decodeURIComponent(oEventInput[sCurStep] || '');
					}
					
					return '<span class="portfoliograph" contenteditable="false" data-value="' + NOTEBOOK.c_s_NOTEBOOK_TIMELINE_GRAPH + '">\
					' + _.template(
						$('#timelineemplate').html(),
						{ 'data' : oTemplateData }
					) + '\
					</span><br>';
				}
			},
			'vendiagram':		{
				'renderer':		function (paData) {
					var oTemplateData = {},
						oVDData = (
							(paData instanceof Array)?
							paData.first():
							{}
						),
						iMaxSteps = 3,
						sCurStep = '';
					
					for (var iStep = 1; iStep <= iMaxSteps; iStep++) {
						sCurStep = 'step' + iStep;
						
						oTemplateData[sCurStep] = decodeURIComponent(oVDData[sCurStep] || '');
					}
					
					return '<span class="portfoliograph" contenteditable="false">\
						' + _.template(
							$('#vendiagramttemplate').html(),
							{ 'data' : oTemplateData }
						) + '\
					</span><br>';
				}
			}
		});
	}
	
	return $GLOBALS.get('ClassNotesInputFormats');
};

ClassNotesView.getInputFormats = function () {
	return $GLOBALS.get('ClassNotesInputFormats');
};
// Classnotes right panel render version 2
ClassNotesView.innnerPanelRenderV2 = function (classnotesId) {
	var oSelf = this;
	if (classnotesId == null) {
		//ILIT-6215
		if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) != POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
			$('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).val(NOTEBOOK.c_s_NOTEBOOK_EMPTY_TITLE_TXT);
		} else {
			$(".container_notes_wrapper_title, .notes_wrapper_content_inner").css("visibility","hidden");
		}
		$('#' + NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).html(GENERAL.c_s_SPECIAL_CHARACTERS_BLANK);
		$('.container_notes_wrapper').css({'opacity':'1'});
		$('.notbookoverlay').remove();
		
		$('.' + NOTEBOOK.c_s_EDITOR_SAVE_CONTAINER).hide();
		
		// $('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).hide();
		// $('#' + NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE_BTTN).hide();
		
		if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
			$('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE)
				.prop('disabled', true)
				.css({
					'-webkit-text-fill-color':	'rgba(0, 0, 0, 1)',
					'-webkit-opacity':			1,
					'color':					'rgba(0, 0, 0, 1)',
					'background':				'white'
				});
			
			$('#' + NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).attr('contenteditable','false');
			$('#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_CLASSNOTE).hide();
			$('#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_CLASSNOTE).css('visibility','hidden');
			$('#' + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE).css('visibility','hidden');
			$('textarea')
				.prop('disabled', true)
				.css({
					'-webkit-text-fill-color':	'rgba(0, 0, 0, 1)',
					'-webkit-opacity':			1,
					'color':					'rgba(0, 0, 0, 1)',
					'background':				'white'
				});
		}
		else {
			oSelf.showhideBtns();
		}
		
		oSelf.bindEvents();
		NotebookTabsView.bindEvents();
		oSelf.resize();
		
		return;
	}
	
	$.nativeCall({
		'method':			'GetNoteInfo',
		'globalResource':	'objNoteInfoData',
		'inputParams':		[classnotesId],
		'beforeSend':		function () {
			$('.container_notes_wrapper')
				.css({'opacity':'0.9'})
				.append('<div class="notbookoverlay" style="font-size:13px;">\
					<img src="media/loader.gif" alt="' + NOTEBOOK.c_s_NOTEBOOK_LOADING_TXT + '" />\
					<p>' + NOTEBOOK.c_s_NOTEBOOK_LOADING_TXT + '</p>\
				</div>');
			
			$('.' + NOTEBOOK.c_s_EDITOR_SAVE_CONTAINER).hide();
			// $('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).hide();
			// $('#' + NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE_BTTN).hide();
			$('#' +NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_CLASSNOTE).show();

			$('#' + NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE_BTTN).data('note-id', classnotesId);
			
			oSelf.bindEvents();
			NotebookTabsView.bindEvents();
			oSelf.resize();
		},
		'onComplete':		function (poGetNoteInfoResponse) {
			/*==== Hide Loader ====*/
			$('.container_notes_wrapper').css({'opacity':'1'});
			$('.notbookoverlay').remove();
			/*== End Hide Loader ==*/
			var oClassnoteInfo = poGetNoteInfoResponse.Content || {},
				sNoteTitle = decodeURIComponent(oClassnoteInfo.NoteTitle || ''),
				aNoteDetails = [],
				sHtml = '',
				oCurrentEntry = null,
				oInputFormats = oSelf.getInputFormats(),
				sCurrentHtml = '';
			
			try {
				oNoteDetails = JSON.parse(oClassnoteInfo.NoteText || '{}');
				aNoteDetails = (
					oNoteDetails.datacontent?
					oNoteDetails.datacontent:
					(
						(oNoteDetails instanceof Array)?
						oNoteDetails:
						[]
					)
				);
			}
			catch (oException) {
				
			}
			
			
			for (var iI = 0; iI < aNoteDetails.length; iI++) {
				oCurrentEntry = aNoteDetails[iI];
				for (var sKey in oCurrentEntry) {
					var sFormatKey = sKey.replace('data', ''),
						sColumnCount = 'two',
						oHeader = {},
						oText = {};
					if (oInputFormats[sFormatKey] !== undefined) {
						if (typeof oInputFormats[sFormatKey]['renderer'] == 'function') {
							switch (sKey) {
								case NOTEBOOK["c_s_NOTEBOOK_TWOCOLUMN_DATA"]:
								case NOTEBOOK["c_s_NOTEBOOK_THREECOLUMN_DATA"]:
									sColumnCount = (
										(sKey === NOTEBOOK["c_s_NOTEBOOK_TWOCOLUMN_DATA"])?
										'two':
										'three'
									);
									oHeader = {};
									oText = {};
									
									for (var iJ = 0; iJ < oCurrentEntry[sKey].length; iJ++) {
										if (oCurrentEntry[sKey][iJ][sColumnCount + 'columntextdata'] !== undefined) {
											oText = oCurrentEntry[sKey][iJ][sColumnCount + 'columntextdata'];
										}
										if (oCurrentEntry[sKey][iJ][sColumnCount + 'columnstepdata'] !== undefined) {
											oHeader = oCurrentEntry[sKey][iJ][sColumnCount + 'columnstepdata'];
										}
									}
									
									sHtml += oInputFormats[sFormatKey].renderer(oHeader, oText, sColumnCount + 'column');
								break;
								default:
									sHtml += oInputFormats[sFormatKey].renderer(oCurrentEntry[sKey]);
								break;
							}
						}
					}
				}
			}
			
			$('#hidclassvalue').html(sNoteTitle);
			$('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).val(sNoteTitle);
			$('#' + NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).attr('contenteditable', true);
			$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).html(sHtml);
			ClassNotesView.sLoadedNoteText = sHtml;
			
			if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
				$('#' + NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).attr('contenteditable', 'false');
				$('#'+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE)
					.prop('disabled', true)
					.css({
						'-webkit-text-fill-color':	'rgba(0, 0, 0, 1)',
						'-webkit-opacity':			1,
						'color':					'rgba(0, 0, 0, 1)',
						'background':				'white'
					});
				
				$('#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_CLASSNOTE).hide();
				$('#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_CLASSNOTE).css('visibility', 'hidden');
				$('#' + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE).css('visibility', 'hidden');
				$('textarea')
					.attr('disabled','disabled')
					.css({
						'-webkit-text-fill-color':	'rgba(0, 0, 0, 1)',
						'-webkit-opacity':			1,
						'color':					'rgba(0, 0, 0, 1)',
						'background':				'white'
					});
			}
			else {
				oSelf.showhideBtns();
			}
			
			//Incremental Save : call on ClassNotes render
			if (NotebookView.iSaveAttemptDataTimerInterval && NotebookView.bIncrementalSaveTimerStarted == false) {
				NotebookView.bIncrementalSaveTimerStarted = true;
				setTimeout(function() { 
					NotebookView.incrementalSave();
				}, NotebookView.iSaveAttemptDataTimerInterval);				
			}
		},
		'onError':			function (poGetNoteInfoResponse, oErrorThrown) {
			NotebookView._alert({
				divId:		'dialog-message',
				title:		'Alert!',
				message:	((poGetNoteInfoResponse.Error || {}).ErrorUserDescription || 'An error has occurred!!')
			}, function () {
				$('#hidclassvalue').html('');
				$('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).val('');
				$('#' + NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).attr('contenteditable', true);
				$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).html('');
				
				if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
					$('#' + NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).attr('contenteditable', 'false');
					$('#'+NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE)
						.prop('disabled', true)
						.css({
							'-webkit-text-fill-color':	'rgba(0, 0, 0, 1)',
							'-webkit-opacity':			1,
							'color':					'rgba(0, 0, 0, 1)',
							'background':				'white'
						});
					
					$('#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_CLASSNOTE).hide();
					$('#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_CLASSNOTE).css('visibility', 'hidden');
					$('#' + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE).css('visibility', 'hidden');
					$('textarea')
						.attr('disabled','disabled')
						.css({
							'-webkit-text-fill-color':	'rgba(0, 0, 0, 1)',
							'-webkit-opacity':			1,
							'color':					'rgba(0, 0, 0, 1)',
							'background':				'white'
						});
				}
				else {
					oSelf.showhideBtns();
				}
			});
		}
	});
};

/* method to be called after save button click. or Save from incremental save timer */
ClassNotesView.onSave = function (e) {
	var oSelf = this;
	var aChildren = $('#' + NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).get(0).childNodes;
			var str = null;
			var datacontent = [];
			var classnotes_type = null;	
			var total_count = null;
			for (var i = 0; i < aChildren.length; i++) {
				var oChild = aChildren[i];
			   var sTextContent = encodeURIComponent(oChild.textContent);
				if (oChild.nodeName == '#text') {
					
					if (sTextContent.trim().length) {
						str = "{\\\"editorpaneldata\\\":[{\\\"textcontent\\\":\\\""+sTextContent+"\\\"}]}";	
						datacontent.push(str);	
					}
				}
				else if (oChild.nodeName == ''){
					if (oChild.textContent == "BR") {
					   str = "{\\\"editorpaneldata\\\":[{\\\"textcontent\\\":\\\""+sTextContent+"\\\"}]}";	
						datacontent.push(str);	
					}
				}
				else { 
				    var portfolioDivClass =  $(oChild).hasClass('portfoliograph') || $(oChild).find('span').hasClass('portfoliograph');
						
					if(portfolioDivClass == false) {
					   str = "{\\\"editorpaneldata\\\":[{\\\"textcontent\\\":\\\""+sTextContent+"\\\"}]}";	
						datacontent.push(str);
					}else {
					
					//if ($(oChild).hasClass('portfoliograph')) {
						portfolioDiv = ($(oChild).hasClass('portfoliograph') == true) ? oChild : $(oChild).find('span');
						classnotes_type = $(portfolioDiv).attr('data-value');
						
						switch (classnotes_type) {
							case NOTEBOOK.c_s_NOTEBOOK_CAUSEEFFECT_GRAPH:
								str = "{\\\"causeandeffectdata\\\":[{\\\"causetext\\\":\\\""+encodeURIComponent($(portfolioDiv).find('.causetext').val())+"\\\",\\\"effecttext\\\":\\\""+encodeURIComponent($(portfolioDiv).find('.effecttext').val())+"\\\"}]}";
							break;
							
							case NOTEBOOK.c_s_NOTEBOOK_STEPBYSTEP_GRAPH:
								total_count = $(portfolioDiv).find('.stepbystep').size();
								str = "{\\\"stepbystepdata\\\":[{";
								$(portfolioDiv).find('.stepbystep').each(function (i) {
									str += "\\\"step" + (i + 1) + "\\\":\\\"" + encodeURIComponent($(this).val()) + "\\\"";
									if (i < (total_count -1)) {
										str += ",";
									}
								});
								str += "}]}";
							break;
							
							case NOTEBOOK.c_s_NOTEBOOK_STORYMAP_GRAPH:
								total_count = $(portfolioDiv).find('.storymapinput').size();
								str   = "{\\\"storymapdata\\\":[{";
								$(portfolioDiv).find('.storymapinput').each(function(i){
									str   += "\\\"step" + (i + 1) + "\\\":\\\"" + encodeURIComponent($(this).val()) + "\\\"";
									if (i < (total_count -1)) {
										str +=",";
									}
								});
								str += "}]}";
							break;
							
							case NOTEBOOK.c_s_NOTEBOOK_THREECOLUMN_GRAPH:
								total_count = $(portfolioDiv).find('.threecolumninput').size();
								str = "{\\\"threecolumndata\\\":[";
								str += "{\\\"threecolumntextdata\\\":[{";
								$(portfolioDiv).find('.threecolumninput').each(function(i){
									str   += "\\\"step"+(i+1)+"\\\":\\\""+encodeURIComponent($(this).val())+"\\\"";
									if(i < (total_count -1)){
										str   +=",";
									}
								});
								str += "}]},";
								
								str += "{\\\"threecolumnstepdata\\\":[{";
								$(portfolioDiv).find('.threecolumnstep').each(function(i){
									str   += "\\\"columnstep"+(i+1)+"\\\":\\\""+encodeURIComponent($(this).html())+"\\\"";
									if (i < (total_count -1)) {
										str += ",";
									}
								});
								str += "}]}";
								str += "]}";
							break;
							
							case NOTEBOOK.c_s_NOTEBOOK_TIMELINE_GRAPH:
								total_count = $(portfolioDiv).find('.timelinedateinput').size();
								str   = "{\\\"timelinedata\\\":[";
								str   += "{\\\"timelinedateinput\\\":[{";
								$(portfolioDiv).find('.timelinedateinput').each(function (i) {
									str   += "\\\"step"+(i+1)+"\\\":\\\""+encodeURIComponent($(this).val())+"\\\"";
									if (i < (total_count -1)) {
										str += ",";
									}
								});
								str += "}]},";
								str += "{\\\"timelineeventinput\\\":[{";
								$(portfolioDiv).find('.timelineeventinput').each(function (i) {
									str += "\\\"step"+(i+1)+"\\\":\\\"" + encodeURIComponent($(this).val()) + "\\\"";
									if (i < (total_count -1)) {
										str += ",";
									}
								});
								str += "}]}"; 
								str += "]}";
							break;
							
							case NOTEBOOK.c_s_NOTEBOOK_TWOCOLUMN_GRAPH:
								total_count = $(portfolioDiv).find('.twocolumninput').size();
								
								str   = "{\\\"twocolumndata\\\":[";
								str   += "{\\\"twocolumntextdata\\\":[{";
								$(portfolioDiv).find('.twocolumninput').each(function(i){
									str   += "\\\"step"+(i+1)+"\\\":\\\""+encodeURIComponent($(this).val())+"\\\"";
									if(i < (total_count -1)){
										str +=",";
									}
								});
								str   += "}]},";
								str   += "{\\\"twocolumnstepdata\\\":[{";
								$(oChild).find('.twocolumnstep').each(function(i){
									str   += "\\\"step"+(i+1)+"\\\":\\\""+encodeURIComponent($(this).html())+"\\\"";
									if(i < (total_count -1)){
										str +=",";
									}
								});
								str   += "}]}"; 
								str   += "]}";
								
							break;
							
							default:
								total_count = $(portfolioDiv).find('.vendiagraminput').size();
								str   = "{\\\"vendiagramdata\\\":[{";
								$(portfolioDiv).find('.vendiagraminput').each(function(i){
									str += "\\\"step"+(i+1)+"\\\":\\\""+encodeURIComponent($(this).val())+"\\\"";
									if(i < (total_count -1)){
										str += ",";
									}
								});
								str += "}]}";
							break;
						}
						datacontent.push(str);
					//}
					}
				}
			}
			
			datacontent = "{\\\"datacontent\\\":["+datacontent+"]}";
			
			var noteTitle = encodeURIComponent($('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).val());
			
			//ILIT - 664
			if ($(".notes_list_wrapper").find("ul").length == 0 &&
				objCurrentUnitDetails.currentUnit > NotebookView.refUnitNumber) {
					NotebookView.refUnitNumber = objCurrentUnitDetails.currentUnit;
				}
			//ILIT - 664
			
			if (NotebookView.noteId != null) {
				var find_dataset = _.where(oSelf.model, {RefUnitNumber : NotebookView.refUnitNumber, NoteTitle : noteTitle,NoteID : !(NotebookView.noteId)});
			}
			else {
				var find_dataset = _.where(oSelf.model, {RefUnitNumber : NotebookView.refUnitNumber, NoteTitle : noteTitle});
			}
			if (_.isEmpty(find_dataset)) {
				//On Save/Cancel button click event
				if(e) {
					NotebookTabsView.saveData(noteTitle, datacontent, '', '',  e.target);
				} else {
					return {'title':noteTitle, 'content':datacontent}; //if called from incremental save
				}
			}
			else {
				NotebookView._alert({
					divId:		'dialog-message',
					title : 'Alert!',
					message:	NOTEBOOK.c_s_NOTEBOOK_DUPLICATE_TITLE
				});
			}


		   //ILIT-5334
		   if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
	       }
}

ClassNotesView.bindEvents = function () {
	var oSelf = this;
	
	// left menu accordian effect
	NotebookTabsView.showhidemenupanel();

   //bind focus event on title and description
	$('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE + ', #' + NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER)
	.off("focus")
	.on("focus", function () {
		//ILIT-6110
		if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR) { return; }
		
	   $('.' + NOTEBOOK.c_s_NOTEBOOK_SAVE_CANCEL_CONTAINER).show();
		
		$('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).show();
		$('#' + NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE_BTTN).show();
		
		$("#" + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).attr('disabled', false);
		oSelf.resize();
	});
	
	//bind click event on Classnotes title
	$('[id^=noteid_]')
		.off('click')
	   .on('click',function (e) {
		   NotebookView.clearIncrementalSaveTimerData(); //clear incremental save timer call on click of left list item
			var classnotesId = $(this).attr("note-id");
			NotebookView.noteId = classnotesId;
			NotebookView.refUnitNumber = $(this).attr('ref-unitno');
			NotebookView.noteRefId = $(this).attr('ref-id');
			oSelf.innnerPanelRenderV2(classnotesId);
			$('#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_CLASSNOTE).show();
		   //ILIT-5334
		   if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			     callLogUserActivity(e); 
		    }
		});
	$('[id^=noteid_]')
		.off('keyup')
		.on('keyup', function (e) {
			var KeyID = e.keyCode;
			if(KeyID==32 || KeyID==13) {//'space' || 'enter'
				$(this).trigger("click");
				e.preventDefault();
				e.stopPropagation();
			}
		});
	
	//bind click event on Classnotes cancel button
	$('#' + NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE_BTTN)
		.off("click tap")
		.on("click tap", function (e) {
			var iNodeId = $(this).data('note-id');
			NotebookView.clearIncrementalSaveTimerData(); //Incremental Save - clear timer
			// delete if it is already saved (added) due to incremental save
			if (NotebookView.sPrevNoteId == NotebookView.noteId && $('.notes_list_wrapper a[note-id='+NotebookView.noteId+']').length == 0) {
				oSelf.deleteNote(NotebookView.noteId, "event-cancel"); 
				oSelf.innnerPanelRenderV2()
			} else if (NotebookView.sPrevNoteId == NotebookView.noteId && $('.notes_list_wrapper a[note-id='+NotebookView.noteId+']').length) {
				//revert/restore to previous state prior to incremental save (edit)
				$('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).val(decodeURIComponent(objNoteInfoData.Content.NoteTitle || ''));
				$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).html(ClassNotesView.sLoadedNoteText);
				ClassNotesView.onSave(e);
			} else {
				oSelf.innnerPanelRenderV2(iNodeId);
			}
			$('.button_bar_wrapper').hide();
			$('.' + NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_CLOSE_ICON).hide();
			$('#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_CLASSNOTE).show();
			$('#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_CLASSNOTE).focus();
			oSelf.resize();
		});
	
	// delete operation
	$('#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_CLASSNOTE)
		.off("click tap")
		.on("click tap", function () {
			NotebookView.clearIncrementalSaveTimerData(); //Incremental Save - clear timer
			oSelf.deleteNote(NotebookView.noteId);
		});
	
	// hide classnotes tooltip on document click
	$(document.body)
		.off("click tap")
		.on("click tap", function () {
			$("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE).attr('tabindex','0');
			$('#' + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE).attr('aria-exapnded','false');
		   $("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE_TOOLTIP).find(".oragnic_tooltip li").attr('tabindex','-1');
			$("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE_TOOLTIP).hide();
		});
	
	if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) === POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
		return;
	}

	$('div[contenteditable=true]')
		.keydown(function (e) {
			if (e.keyCode == 13) {
				if ($(e.target).is(':not(textarea)')) {
					$(this).focus();
					try {
						document.execCommand('insertHTML', false, '<br><br>');
						// prevent the default behaviour of return key pressed
					}
					catch (oException){
						if (document.selection) { // fallback for IE
							selRange = document.selection.createRange();
							selRange.select();
							selRange.pasteHTML('<br><br>');
						}
					}
					return false;
				}
			}
			$('.' + NOTEBOOK.c_s_NOTEBOOK_SAVE_CANCEL_CONTAINER).show();
			oSelf.resize();
		});
	
	$('div[contenteditable=true]')
		.off("click tap")
		.on("click tap", function(e) {
			$(e.target).focus();
			$('.' + NOTEBOOK.c_s_NOTEBOOK_SAVE_CANCEL_CONTAINER).show();
			oSelf.resize();
		});
   
	$(document)
		.off('keydown')
		.on('keydown', function (poEvent) {
			if (window.getSelection().rangeCount > 0) {
				var saveRange = window.getSelection().getRangeAt(0);
				var key = poEvent.keyCode || poEvent.charCode;
				if (key == 8) { // BACKSPACE
					if (
						(poEvent.target.nodeName == 'INPUT') ||
						(poEvent.target.nodeName == 'TEXTAREA')
					) {
						return true;
					}
					if (saveRange.commonAncestorContainer.nodeName != "#text") {
						return false;
					}
				}
			}
		});
   	
	var getCaretPixelPos = function ($node, offsetx, offsety) {
		offsetx = offsetx || 0;
		offsety = offsety || 0;

		var nodeLeft = 0,
		nodeTop = 0;
		if ($node) {
			nodeLeft = $node.offsetLeft;
			nodeTop = $node.offsetTop;
		}

		var pos = {left: 0, top: 0};

		if (document.selection) {
			var range = document.selection.createRange();
			pos.left = range.offsetLeft + offsetx - nodeLeft + 'px';
			pos.top = range.offsetTop + offsety - nodeTop + 'px';
		}
		else if (window.getSelection) {
			try {
				var sel = window.getSelection();
				var range = sel.getRangeAt(0).cloneRange();
				try {
					range.setStart(range.startContainer, range.startOffset-1);
				}
				catch (oException) {
				}
				var rect = range.getBoundingClientRect();
				if (range.endOffset == 0 || range.toString() === '') {
					// first char of line
					if (range.startContainer == $node){
						// empty div
						if (range.endOffset == 0){
							pos.top = '0px';
							pos.left = '0px';
						}
						else {
							// firefox need this
							var range2 = range.cloneRange();
							range2.setStart(range2.startContainer, 0);
							var rect2 = range2.getBoundingClientRect();
							pos.left = rect2.left + offsetx - nodeLeft + 'px';
							pos.top = rect2.top + rect2.height + offsety - nodeTop + 'px';
						}
					}
					else {
						pos.top = range.startContainer.offsetTop+'px';
						pos.left = range.startContainer.offsetLeft+'px';
					}
				}
				else {
					pos.left = rect.left + rect.width + offsetx - nodeLeft + 'px';
					pos.top = rect.top + offsety - nodeTop + 'px';
				}
			}
			catch (oException) {
			}
		}
		return pos;
	};
	
	$("#editable")
		.off('keydown')
		.on('keydown', function () {
			var pos = getCaretPixelPos($("#editable")[0]);
		
			//$(this).scrollTo(pos.top);
			if(typeof pos.top != 'undefined'){
			//$("#editable").css({"scrollTop": pos.top});
			//window.scrollTo(0, pos.top);
			}
		});

	$('#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_CLASSNOTE + ',#' + NOTEBOOK.c_s_NOTEBOOK_SEND_CLASSNOTE
		 + ',#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_CLASSNOTE)
		.off("focus")
		.on("focus", function(){
		$("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE).attr('tabindex','0');
		$("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE).attr('aria-expanded','false');
	   $("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE_TOOLTIP).find(".oragnic_tooltip li").attr('tabindex','-1');
		$("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE_TOOLTIP).hide();
	});
	
	// bind  new class notes 
	$("#" + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_CLASSNOTE)
		.off("click tap")
		.on("click tap", function () {
			NotebookView.clearIncrementalSaveTimerData(); //Incremental Save - clear timer
			NotebookView.noteId = null;
			if (objCurrentUnitDetails.currentUnit !="") {
				NotebookView.refUnitNumber = objCurrentUnitDetails.currentUnit;
			}
			else {
				NotebookView.refUnitNumber = '1';
			}
			NotebookView.noteRefId = null;
			NotebookView.refOtherData = null;
			NotebookView.shortNoteText = '';
			
			$('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).val('');
			if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) != POPUP_VIEW.c_s_MODE_INSTRUCTOR) {
				$('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).val(NOTEBOOK.c_s_NOTEBOOK_EMPTY_TITLE_TXT);
			}
			$('#' + NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).html(GENERAL.c_s_SPECIAL_CHARACTERS_BLANK);
			
			$('#' + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE_TOOLTIP).hide();
			$("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE).attr('tabindex','0');
			$('#' + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE).attr('aria-exapnded','false');
		   $("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE_TOOLTIP).find(".oragnic_tooltip li").attr('tabindex','-1');
			oSelf.showhideBtns();
			$('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).attr('disabled',false);
			$('#' + NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE_BTTN).data('note-id', null);
			$('#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_CLASSNOTE).hide();
			$(this).hide();
			$(".page_arrow").css("left","69%");
			$(".lesson_tooltip").css("margin-left","-210px");
			$('#' + NOTEBOOK.c_s_NOTEBOOK_NOTE_TITLE).focus();
			//Incremental Save - on classnotes add button click
			if (NotebookView.iSaveAttemptDataTimerInterval && NotebookView.bIncrementalSaveTimerStarted == false) {
				NotebookView.bIncrementalSaveTimerStarted = true;
				setTimeout(function() { 
					NotebookView.incrementalSave();
				}, NotebookView.iSaveAttemptDataTimerInterval);
			}
		});
		
	if(oPlatform.isChromeApp()) {
		$('#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_CLASSNOTE + ', #' + NOTEBOOK.c_s_NOTEBOOK_DELETE_CLASSNOTE)
		   .off("keydown")
		   .on("keydown", function (e) {
			   triggerClickOnThisElemApp(e, this);
		});
	}
	   
	//open popup menu
	$("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE)
		.off('click tap')
		.on('click tap', function (poEvent) {
			poEvent.stopPropagation();
			$("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE_TOOLTIP).toggle();
			if($('#' + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE_TOOLTIP).is(':visible')) {
				$(this).attr('tabindex','-1');
				$(this).attr('aria-expanded','true');
			   $("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE_TOOLTIP).find(".oragnic_tooltip li").attr('tabindex','0');
			}
			else {
				$(this).attr('tabindex','0');
				$(this).attr('aria-expanded','false');
			   $("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE_TOOLTIP).find(".oragnic_tooltip li").attr('tabindex','-1');
			}
		});
		

	$('#' + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE).off('keydown').on('keydown', function(e){
		triggerClickOnThisElemApp(e,this);
	}) ; 

	// bind  different classnotes frames
	$('#' +
		NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_CAUSE_EFFECT + ', #' +
		NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_STEP_BYSTEP + ', #' +
		NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_STORY_MAP + ', #' +
		NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_THREE_COLUMN_CHART + ', #' +
		NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_TIME_LINE + ', #' +
		NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_TWO_COLUMN_CHART + ', #' +
		NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_VEN_DIAGRAM +
	'')
		.off("click tap")
		.on("click tap", function () {
			var sTemplateType = $(this).attr('id'),
				sInputFormat = '',
				oInputFormats = oSelf.getInputFormats(),
				oTypeMapping = {};
			
			oTypeMapping[NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_CAUSE_EFFECT] = NOTEBOOK.c_s_NOTEBOOK_CAUSEEFFECT_GRAPH;
			oTypeMapping[NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_STEP_BYSTEP] = NOTEBOOK.c_s_NOTEBOOK_STEPBYSTEP_GRAPH;
			oTypeMapping[NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_STORY_MAP] = NOTEBOOK.c_s_NOTEBOOK_STORYMAP_GRAPH;
			oTypeMapping[NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_THREE_COLUMN_CHART] = NOTEBOOK.c_s_NOTEBOOK_THREECOLUMN_GRAPH;
			oTypeMapping[NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_TIME_LINE] = NOTEBOOK.c_s_NOTEBOOK_TIMELINE_GRAPH;
			oTypeMapping[NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_TWO_COLUMN_CHART] = NOTEBOOK.c_s_NOTEBOOK_TWOCOLUMN_GRAPH;
			oTypeMapping[NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_VEN_DIAGRAM] = NOTEBOOK.c_s_NOTEBOOK_VENDIAGRAM_GRAPH;
			
			sInputFormat = oTypeMapping[sTemplateType].replace('graph', '');
			
		   $("#" + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE).trigger("click");
			$('#' + NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).focus();
			oSelf.putHtmlAtCaret(
				(
					oInputFormats[sInputFormat] && (typeof oInputFormats[sInputFormat].renderer === 'function')?
					(
						['threecolumn', 'twocolumn'].indexOf(sInputFormat) !== -1?
						oInputFormats[sInputFormat].renderer(null, null, sInputFormat):
						oInputFormats[sInputFormat].renderer()
					):
					''
				),
				oTypeMapping[sTemplateType]
			);
			
			oSelf.showhideBtns();
			$('.' + NOTEBOOK.c_s_NOTEBOOK_SAVE_CANCEL_CONTAINER).show();
			$('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).attr('disabled', false);
			ClassNotesView.resize();
		});

	$('#' +
		NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_CAUSE_EFFECT + ', #' +
		NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_STEP_BYSTEP + ', #' +
		NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_STORY_MAP + ', #' +
		NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_THREE_COLUMN_CHART + ', #' +
		NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_TIME_LINE + ', #' +
		NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_TWO_COLUMN_CHART + ', #' +
		NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_VEN_DIAGRAM +
	'')
		.off("keydown")
		.on("keydown", function (e) {
			triggerClickOnThisElemApp(e,this);
		});
	
	//	render click event on Classnote's save button
	$('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN)
		.off('click tap')
	   .on('click tap', function (e) {
			NotebookView.clearIncrementalSaveTimerData(); //clear incremental save timer
			ClassNotesView.onSave(e);
		});
		
		$('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN)
		.off('keydown')
		.on('keydown', function (e) {
			triggerClickOnThisElemApp(e,this);
		});

	//tooltip on classnote
	$('#ui-tooltip_organizer, #ui-tooltip_deleteclass, #ui-tooltip_sendclass, #ui-tooltip_addclass').hide();
	$('#' + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE + ',#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_CLASSNOTE
		+ ',#' + NOTEBOOK.c_s_NOTEBOOK_SEND_CLASSNOTE + ',#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_CLASSNOTE).focus(function(e){
		if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE) {
			$('#ui-tooltip_organizer').show();		
		} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_DELETE_CLASSNOTE) {
			$('#ui-tooltip_deleteclass').show();		
		} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_SEND_CLASSNOTE) {
			$('#ui-tooltip_sendclass').show();		
		} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_CLASSNOTE) {
			$('#ui-tooltip_addclass').show();		
		}
	});
	$('#' + NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE + ',#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_CLASSNOTE
		+ ',#' + NOTEBOOK.c_s_NOTEBOOK_SEND_CLASSNOTE + ',#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_CLASSNOTE).focusout(function(e){
		if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_ORGANIZE_CLASSNOTE) {
			$('#ui-tooltip_organizer').hide();		
		} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_DELETE_CLASSNOTE) {
			$('#ui-tooltip_deleteclass').hide();		
		} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_SEND_CLASSNOTE) {
			$('#ui-tooltip_sendclass').hide();		
		} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_CLASSNOTE) {
			$('#ui-tooltip_addclass').hide();		
		}
	});

   $("#" + NOTEBOOK.c_s_TAB_CLASSNOTES).attr('aria-selected','true');

   //ILIT-5334
	var updateLayout = _.debounce(function(e) {
		//ILIT-5334
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		 }
	},2000); 
   $(".notes_wrapper_content_inner").on('DOMSubtreeModified', updateLayout);
   $('.classnotestitle,' + ' .classnotesdescription').on('change',updateLayout);
};

/**
* @method: bindEvents
* @params : {String} noteid
* @uses:  for deleting classnotes
* @return void;
*/

ClassNotesView.deleteNote = function (noteid, eventName) {
	NotebookTabsView.sDeleteEventName = eventName ? eventName : ''; // Incremental Save
	
	if (eventName != "event-cancel") {
		this._confirm({
			'divId':	'dialog-message',
			'title' : '',
			'message':	NOTEBOOK.c_s_NOTEBOOK_CONFIRM_CLASSNOTES_DELETE,
			'yes':		function () {
				NotebookTabsView.deleteNote(noteid);
			}
		});
	} else {
		NotebookTabsView.deleteNote(noteid);
	}
}
var savedRange;
var isInFocus = false;

/**
* @method: putHtmlAtCaret
* @params : {string} html
* @params : {string} data_value
* @uses:  for finding cursor position  functionlity in Classnotes tab
* @return void;
*/
ClassNotesView.putHtmlAtCaret = function(html,data_value) {
    var element = document.getElementById("editable");
	if (window.getSelection) {
        // IE9 and non-IE
	    var sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
			
            var range = sel.getRangeAt(0);
			
            range.deleteContents();
            var el = document.createElement("span");
			
			is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
		    is_safari = navigator.userAgent.indexOf("Safari") > -1;
		    if(is_chrome || is_safari) {
				el.innerHTML = '<span class="portfoliograph" contenteditable="false" data-value ="'+data_value+'">'+html+'</span>';
			}else{
				el.innerHTML = html;
			}
            
            var frag = document.createDocumentFragment(), node, lastNode;
            while (node = el.firstChild) {
                lastNode = frag.appendChild(node);
            }
			$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).focus();           
			ClassNotesView.restoreSelection();
			if (typeof savedRange != 'undefined') {
				if(savedRange.startContainer.id == NOTEBOOK.c_s_NOTEBOOK_WRAPPER){
					$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).append('<span class="portfoliograph" contenteditable="false" data-value ="'+data_value+'">'+html+'</span>');
				}
				else {
					savedRange.insertNode(frag);
				}
			}
			else {
				$("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).append('<span class="portfoliograph" contenteditable="false" data-value ="'+data_value+'">'+html+'</span>');
			}
            // Preserve the selection
        }
		else if (document.selection && document.selection.type != "Control") {
			// IE < 9
			document.selection.createRange().pasteHTML(html);
		}
	}
};


/**
* @method: saveSelection
* @uses:  save cursor position Selection
* @return void;
*/

ClassNotesView.saveSelection =function (e)
{  
    try{ 
		if(e.target.id == 'editable'){
			if(window.getSelection)//non IE Browsers
			{
				savedRange = window.getSelection().getRangeAt(0);
			}
			else if(document.selection)//IE
			{ 
				savedRange = document.selection.createRange();  
			}
		}
	}catch(e){
	}
}

/**
* @method: restoreSelection
* @uses:  restore cursor position selection
* @return void;
*/
 
ClassNotesView.restoreSelection =function () 
{    
    isInFocus = true;
    $("#"+ NOTEBOOK.c_s_NOTEBOOK_MAIN_CONTAINER).focus();
    if (savedRange != null) {
        if (window.getSelection)//non IE and there is already a selection
        {
            var s = window.getSelection();
            if (s.rangeCount > 0) 
                s.removeAllRanges();
            s.addRange(savedRange);
        }
        else if (document.createRange)//non IE and no selection
        {
            window.getSelection().addRange(savedRange);
        }
        else if (document.selection)//IE
        {
            savedRange.select();
        }
    }
}
//this part onwards is only needed if you want to restore selection onclick

ClassNotesView.onDivBlur = function ()
{
    isInFocus = false;
}

/**
* @method: cancelEvent
* @uses:  restore selection on onclick
* @return void;
*/

ClassNotesView.cancelEvent = function (e)
{
    if (isInFocus == false && savedRange != null) {
        if (e && e.preventDefault) {
            
            e.stopPropagation(); // DOM style (return false doesn't always work in FF)
            e.preventDefault();
        }
        else {
            window.event.cancelBubble = true;//IE stopPropagation
        }
        ClassNotesView.restoreSelection();
        return false; // false = IE style
    }
	ClassNotesView.resize();

   //ILIT-5334
   if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
	   callLogUserActivity(e); 
   }
}

/**
* @method: resize 
* @uses: resizing the document
* @return void;
*/
 
ClassNotesView.resize = function () {
	if ( oPlatform.isDevice()) {	
		$(".notes_wrapper_content_inner").css('width','86%');
		$(".event_put").css("width","150px");
		$(".dates_container").css("min-width","150px");
	}
	var notes_wrapper_padding = parseInt($(".notes_wrapper_right").css("padding-top")) + parseInt($(".notes_wrapper_right").css("padding-bottom"))
	var notes_head_title_height = $(".notes_head_title2").outerHeight();
	var container_notes_wrapper_title = $(".container_notes_wrapper_title").outerHeight();
	var save_panel_container = $(".button_bar_wrapper").outerHeight();
	if($(".button_bar_wrapper").css('display')=="none"){
		save_panel_container=0;
	}
	var editor_panel_container_padding = parseInt($(".notes_wrapper_content_inner").css("padding-top")) ;
	var editor_panel_container = parseInt($(".notes_wrapper_content_inner").css("padding-bottom"));
	var notesLandingPadding = notes_wrapper_padding + notes_head_title_height +container_notes_wrapper_title+save_panel_container+editor_panel_container_padding+ editor_panel_container+1;
	
	$(".notes_wrapper_content_inner").height(($(window).height())-(notesLandingPadding)).css({"overflow-x":"hidden","overflow-y":"auto"});
	
	var notes_wrapper_left_padding_top =  parseInt($(".notes_wrapper_left").css("padding-top")) ;
	var notes_wrapper_left_padding_botom =parseInt($(".notes_wrapper_left").css("padding-bottom"))
	var rightSideFixed= notes_wrapper_left_padding_top+ notes_wrapper_left_padding_botom +1;
	$(".notes_wrapper_left").height(($(window).height())-(rightSideFixed)).css({"overflow-x":"hidden","overflow-y":"auto"});
	$("." +NOTEBOOK.c_s_NOTEBOOK_LIST_WRAPPER).height($(".container_notes_wrapper").height());
	$('.twocolumnstep').width($('.twocolumninput').width());
	$('.twocolumnstep').css({"max-width":$('.twocolumninput').width()+'px',"word-wrap":"break-word"});
	$('.threecolumnstep').width($('.threecolumninput').width());
	$('.threecolumnstep').css({"max-width":$('.threecolumninput').width()+'px',"word-wrap":"break-word"});
	
	/*$(".container_notes_wrapper").height($("#classnotesLeftPanelContainer").height());
	if ( oPlatform.isDevice()) {
		$(".classnotestitle,.classnotesdescription,.causetext,.effecttext,.stepbystep,.storymapinput,.threecolumninput,.timelinedateinput,.timelineeventinput,.twocolumninput,.vendiagraminput").off("click tap").on("click tap", function() { //alert(1);
			$(".notes_wrapper_content_inner").height(200).css({"overflow-x":"hidden","overflow-y":"auto"});
			$(".container_notes_wrapper").height($(".notes_wrapper_left").height());
			$('.' + NOTEBOOK.c_s_EDITOR_SAVE_CONTAINER).show();
			$('#' + NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).show();
			$('#' + NOTEBOOK.c_s_NOTEBOOK_CANCEL_NOTE_BTTN).show();
		});
	}*/
	
}

ClassNotesView._confirm = ISeriesBase.prototype._confirm;

/**
* @method: showhideBtns 
* @uses: for show and hide diffrent DOM elements in Classnotes View
* @return void;
*/

ClassNotesView.showhideBtns = function () {
	$(
	    '.classnotestitle,' +
	    '.classnotesdescription,' +
		'.causetext,' +
		'.effecttext,' +
		'.stepbystep,' +
		'.storymapinput,' +
		'.threecolumninput,' +
		'.timelinedateinput,' +
		'.timelineeventinput,' +
		'.twocolumninput,' +
		'.vendiagraminput,' +
		'.cotainerborder'
	)
		.off('click tap focus')
		.on('click tap focus', function () {
			$("." + NOTEBOOK.c_s_NOTEBOOK_SAVE_CANCEL_CONTAINER).show();
			$("#" +NOTEBOOK.c_s_NOTEBOOK_SAVE_NOTE_BTTN).attr('disabled',false);
			ClassNotesView.resize();
			$("." + NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_CLOSE_ICON).hide();
			$(this)
				.parents('.' + NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_CONTAINER_BORDER)
					.find('.' + NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_CLOSE_ICON)
						.show();
		});


   $("." + NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_CLOSE_ICON)
		.off('keydown').on('keydown', function(e){
		triggerClickOnThisElemApp(e,this);
	});
	
	// remove graph  on click on close icon of a particular gragh
	$("." + NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_CLOSE_ICON)
		.off("click tap")
		.on("click tap", function () {
			var currentclsbtn = $(this);
			ClassNotesView._confirm({
				'divId':	'dialog-message',
				'title':	'Confirm ?',
				'message':	NOTEBOOK.c_s_NOTEBOOK_CONFIRM_CLASSNOTE_SECTION_DELETE,
				'yes':		function () {
					currentclsbtn.parents(".portfoliograph").remove();
					ClassNotesView.resize();
				}
			});
		});
	
	$("." +NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_CONTAINER_BORDER)
		.off("click tap")
		.on("click tap", function (e) {
			$("." + NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_CLOSE_ICON).hide();
			$(this).find("." + NOTEBOOK.c_s_NOTEBOOK_CLASSNOTES_CLOSE_ICON).show();
			$("." + NOTEBOOK.c_s_NOTEBOOK_SAVE_CANCEL_CONTAINER).show();
			e.stopPropagation();
			ClassNotesView.resize();
		});
};

// Declare PortfolioView object 
function PortfolioView () {}

// Portfolio properties
PortfolioView.model = null;
PortfolioView.tabType = null;
PortfolioView.resourceMediaPath = null;

// init
PortfolioView.init = function (model) {
	var oSelf = this;
	oSelf.model = model;
	objGradeResourceData = null;
	unitsection = null;
	myworkselection = null;
    resourceselection = null;
	
	GetUnitDetails();
	var objPortfolioMenu = objUnitDetails;
	setTimeout(function () {
		if (objPortfolioMenu != null) {
			try { 
				if (parseInt(objPortfolioMenu.Status) == 200) {
					oSelf.TotalUnits = NotebookView.sProductCode.match(GENERAL.c_s_ILIT_20) ? NOTEBOOK.c_s_TOTUNITS : objPortfolioMenu.Content.TotalUnits;
					// oSelf.goToTabs(NOTEBOOK_PORTFOLIO_TABS[0].c_s_CODE, 1);
					oSelf.goToTabs(NotebookView.tabType, 1);
				}		
			}
			catch (oException) {
				if (oException.ErrorCode != "U1065") {
					NotebookView._alert({
						divId:		'dialog-message',
						title : 	'Alert!',
						message:	oException.ErrorUserDescription
					});
				}
			}
		}
		else {
			NotebookView.goToTabs(NotebookView.tabType);
		} 
	}, 2000);	
};

PortfolioView.goToTabs = function (tabType, unitId) {
	var oSelf = this;
	oSelf.tabType = tabType;
	
	switch (oSelf.tabType) {
		case NOTEBOOK.c_s_TAB_RESOURCES:
			GetResourceInfo();
			setTimeout(function () {
				PortfolioView.scheduleCheckLoadJsSource(tabType, unitId)
			}, 100);
			/* End of coding for native*/
			try {
				objNoteBookData = objResourceJsonData['content'];  // resource data
			}
			catch (oException){
				
			}
		break;
		default:
			// native call
			oSelf.getPortfolioDataV2(unitId);
			/* if (objCurrentUnitDetails.hasOwnProperty('serviceVersion')) {
				oSelf.getPortfolioDataV2(unitId);
				return;
			}
		
			GetGradebookForStudent(unitId);
			setTimeout(function () {
				if (objNoteBookData != null) {
					try {
						if (parseInt(objNoteBookData.Status) == 200) {
							PortfolioView.model = objNoteBookData.Content;
							PortfolioView.render(unitId);
							NotebookTabsView.bindEvents();							
							
							var sVerbId = (
									(_.findWhere(NOTEBOOK_PORTFOLIO_TABS, {"c_s_CODE": oSelf.tabType}) || {}).c_s_VERBID ||
									"S-NTO-PO"
								);
							SetGoogleAnalytic(sVerbId);
						}
						else {
							PortfolioView.model = objNoteBookData.Content;
							PortfolioView.render(unitId);
							NotebookTabsView.bindEvents();
						}
					}
					catch (oException) {
						if (oException.ErrorCode != "U1065") {
							NotebookView._alert({
								divId:		'dialog-message',
								title : 	'',
								message:	oException.ErrorUserDescription
							});
						}
					}
					oUtility.hideLoader();
				}
			}, 2000); */
		break;
	}
};

PortfolioView.render = function (unitId) { 
	var oSelf = this;
	$("#" + NOTEBOOK.c_s_NOTEBOOK_WRAPPER).html(
		_.template(
			$('#portfoliotemplate').html(),
			{
				'portfolioTabData':	NOTEBOOK_PORTFOLIO_TABS,
				'activeIdx':		((oSelf.tabType == NOTEBOOK_PORTFOLIO_TABS[0].c_s_CODE)? 3: 4)
			}
		)
	);
	oSelf.rightPanelRender();
	/*==== Resize Fix for IPP-3499 ====*/
	var oCloseButton = $('#' + NOTEBOOK.c_s_NOTEBOOK_WRAPPER + ' #closenotebook'),
		oCloseButtonCont = $('#' + NOTEBOOK.c_s_NOTEBOOK_WRAPPER + ' #closenotebook').parent(),
	   oTabHead = $('#' + NOTEBOOK.c_s_NOTEBOOK_WRAPPER + ' .notes_head_title .tabs_notes'),
		dCloseButtonWidth = (
			parseFloat(oCloseButton.width()) +
			parseFloat(oCloseButton.css('padding-left').replace('px', '')) +
			parseFloat(oCloseButton.css('padding-right').replace('px', '')) +
			parseFloat(oCloseButton.css('border-left-width').replace('px', '')) +
			parseFloat(oCloseButton.css('border-right-width').replace('px', '')) +
			parseFloat(oCloseButton.css('margin-left').replace('px', '')) +
			parseFloat(oCloseButton.css('margin-right').replace('px', ''))
		),
		dParentWidth = (
			parseFloat(oCloseButtonCont.width()) +
			parseFloat(oCloseButtonCont.css('padding-left').replace('px', '')) +
			parseFloat(oCloseButtonCont.css('padding-right').replace('px', ''))
		),
		dSubtrahend = (
			parseFloat(oTabHead.css('padding-left').replace('px', '')) +
			parseFloat(oTabHead.css('padding-right').replace('px', '')) +
			parseFloat(oTabHead.css('border-right-width').replace('px', '')) +
			parseFloat(oTabHead.css('border-left-width').replace('px', ''))
		);
	oTabHead.width(dParentWidth - dCloseButtonWidth - dSubtrahend);
	/*== End Resize Fix for IPP-3499 ==*/
	oSelf.leftPanelRender(unitId);
};

// Portfolio right panel render
PortfolioView.rightPanelRender = function () {
	var oSelf = this;
	$('#' + NOTEBOOK.c_s_PORTFOLIO_RIGHT_PANEL_CONTAINER).html(
		_.template(
			$('#' + NOTEBOOK.c_s_NOTEBOOK_RIGHT_PANEL).html(),
			{
				'tabData':		NOTEBOOK_TABS,
				'activeIdx':	NotebookView.tabType,
			}
		)
	);
};

// PortfolioView left panel render
PortfolioView.leftPanelRender = function (unitId) {
	var oSelf = this;
	
	if (oSelf.tabType == NOTEBOOK_PORTFOLIO_TABS[0].c_s_CODE) { // my work tab
		var portfoliodata = oSelf.model;
		
		$('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER).html(
			_.template(
				$('#' + NOTEBOOK.c_s_NOTEBOOK_PORTFOLIO_LEFT_PANEL).html(),
				{
					'portfoliodata':	portfoliodata,
					'totalUnits':		oSelf.TotalUnits,
					'currentUnit':		objCurrentUnitDetails.currentUnit,
					'productCode':		NotebookView.sProductCode
				}
			)
		);
		$('#unitlessionlist_' + unitId).addClass('active');
		$('#lessionlist_' + unitId).find('li:first').addClass('active');
		$('#lessionlist_' + unitId).show();
		
		var weekNo = $('#lessionlist_' + unitId).find('li:first').find('a').attr("week-number"),
			lession_ref = $('#lessionlist_' + unitId).find('li:first').find('a').attr('lession-ref'),
			unitNo = $('#lessionlist_' + unitId).find('li:first').find('a').attr('unit-no');
		
		// for resource tab only (select current lesson's resource)
		if (
			oSelf.tabType != NOTEBOOK_PORTFOLIO_TABS[0].c_s_CODE &&
			objCurrentUnitDetails.currentWeek != "" &&
			unitNo == objCurrentUnitDetails.currentUnit
		) {
			weekNo = objCurrentUnitDetails.currentWeek;
			weekNo = weekNo.toString();
			$("#lessionlist_" + unitId).find('li:first').removeClass('active');
			$("#lessionlist_" + unitId + " > li a[week-number=" + weekNo + "]").parent("li").addClass('active');
			lession_ref = $("#lessionlist_" + unitId + " > li a[week-number=" + weekNo +"]").attr("lession-ref");
			unitNo = $("#lessionlist_" + unitId + " > li a[week-number=" + weekNo + "]").attr("unit-no");
		}
		oSelf.innnerPanelRender(unitNo,weekNo,lession_ref);
		$('#closenotebook').focus();
		return;
	}
	
	// Resources tab
	/*==== IPP-3727 ====*/
	var fSuccessCallback = function () {
		var oAvailableGroups = {
				'lessonScreen':	'Lesson Screens',
				'routineCards':	'Routine Cards',
				'bookClub':		'Book Club',
				'standards':	'Standards'
			},
			iInitialGroup = 0,
			iCurUnit = parseInt(objCurrentUnitDetails.currentUnit || "-1"),
			bDataExists = false,
			sInitialGroupKey = _.keys(oAvailableGroups).fetch(iInitialGroup);
		
		for (var sGroupKey in oSelf.model) {
			if (
				typeof oSelf.model[sGroupKey] == "object" &&
					typeof oSelf.model[sGroupKey]["resources"] == "object" &&
					oSelf.model[sGroupKey]["resources"] instanceof Array &&
						oSelf.model[sGroupKey]["resources"].length > 0
			) {
				switch (sGroupKey) {
					case 'lessonScreen':
						/*==== Remove Records with Blank SubType ====*/
						var aResources = [];
						for (var iI = 0; iI < oSelf.model[sGroupKey]["resources"].length; iI++) {
							if ($.trim(oSelf.model[sGroupKey]["resources"][iI].subType).length > 0) {
								aResources.push(oSelf.model[sGroupKey]["resources"][iI]);
							}
						}
						oSelf.model[sGroupKey]["resources"] = aResources;
						/*== End Remove Records with Blank SubType ==*/
						oSelf.model[sGroupKey]["resources"] = inSort(oSelf.model[sGroupKey]["resources"], ['subType', 'unitNumber', 'weekNumber', 'dayNumber']);
						break;
					case 'routineCards':
					case 'standards':
					case 'bookClub':
						oSelf.model[sGroupKey]["resources"] = inSort(oSelf.model[sGroupKey]["resources"], ['unitNumber', 'weekNumber', 'dayNumber']);
						break;
				}
				bDataExists = true;
			}
		}
		
		if (bDataExists === false) {
			var dWindowHeight = Math.min(parseFloat(window.outerHeight), parseFloat($(window).height()));
			$('#innerPortfolioDataContainer').height(dWindowHeight - 50 - 21); // 50: Right Title Bar height, 21: Found by inspection
			$("#" + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER).height(dWindowHeight - 50 - 21); // 50: Right Title Bar height, 21: Found by inspection
			
			if ( // Old data structure
				typeof oSelf.model["resource"] != 'undefined' &&
				oSelf.model["resource"] instanceof Array
			) {			
				NotebookView._alert(
					{
						divId:		'dialog-message',
						title:		'Alert!',
						message:	oUtility.printf(NOTEBOOK.c_s_MESSAGES.c_s_INVALID_DATA_STRUCTURE, 'Current Grade')
					}
				);
			}
			return;
		}
		
		$("#" + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER).html(
			_.template(
				$("#" + NOTEBOOK.c_s_NOTEBOOK_PORTFOLIO_LEFT_PANEL_CA).html(),
				{
					'resources':	oSelf.model,
					'totalUnits':	oSelf.TotalUnits,
					'currentUnit':	(
						iCurUnit == -1?
						1:
						(iCurUnit + 1)
					),
					'groups':		oAvailableGroups,
					'subTypes':		{
						'Vocab':	'Vocabulary',
						'WGI':		'Whole Group Instruction'
					}
				}
			)
		);
		
		oSelf.innerPanelRenderCA(sInitialGroupKey, objCurrentUnitDetails);
		setTimeout(function () {
			oSelf.bindEvents();
			var aGroupLinks = $('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .groups'),
				oVisibleGroupLink = aGroupLinks.eq(iInitialGroup),
				oVisibleGroupLinkCont = oVisibleGroupLink.parent(),
				sVisibleGroup = oVisibleGroupLink.data('group');
			
			aGroupLinks.each(function () {
				$(this).parent().removeClass('active');
			});
			oVisibleGroupLinkCont.addClass('active');
			oVisibleGroupLink.next('ul').show();
			oVisibleGroupLink.next('ul').children().each(function (iIdx) {
				if (iIdx == 0) {
					$(this).find('ul').show();
					$(this).children().filter('a').addClass('active'); // Sub-Group for Lesson Screens, Links for others
					if (sVisibleGroup == 'lessonScreen') {
						var iUnit = objCurrentUnitDetails.currentUnit || '1',
							iWeek = objCurrentUnitDetails.currentWeek || '1',
							oAnchor = null;
							
						if (
							(oAnchor = $('a.links')
											.filterByData('group', sVisibleGroup)
												.filterByData('sub-type', $(this).children().filter('a').data('index'))
													.filterByData('unit', iUnit)
														.filterByData('week', iWeek)).length > 0
						) {
							oAnchor.addClass('active');
						}
						else {
							$(this).find('ul').children().first().find('a.links').addClass('active');
						}
					}
				}
				else {
					$(this).find('ul').hide();
					$(this).children().filter('a').removeClass('active');
				}
			});
			
			oVisibleGroupLinkCont.siblings().each(function () {
				$(this).children().filter('ul').hide();
			});
		}, 300); // Just to delay the process a bit
	};
	$.nativeCall({
		'method':			'GetUnitWeekDetails',
		'globalResource':	'objCurrentUnitDetails',
		'interval':			500,
		'breakAfter':		2500,
		'checkSuccess':		function (poGetUnitWeekDetailsResponse) {
			return !isNaN(parseInt(poGetUnitWeekDetailsResponse.currentUnit));
		},
		'onComplete':		function (poGetUnitWeekDetailsResponse) {
			fSuccessCallback();
		},
		'onError':			function () {
			objCurrentUnitDetails = {
				'currentLesson':	'',
				'currentUnit':		'',
				'currentWeek':		''
			};
			fSuccessCallback();
		}
	});
	$('#closenotebook').focus();
	/*== End IPP-3727 ==*/
};

PortfolioView.innerPanelRenderCA = function (psSection, pmixIndex) {
	var oSelf = this,
		aAllowedSections = [ 'lessonScreen', 'routineCards', 'bookClub', 'standards' ],
		iI = 0,
		oTemplateData = {};
		
	for (iI = 0; iI < aAllowedSections.length; iI++) {
		if (aAllowedSections[iI].toUpperCase() == psSection.toUpperCase()) {
			psSection = aAllowedSections[iI];
			break;
		}
	}
	
	if (iI == aAllowedSections.length) {
		iI = 0;
		psSection = aAllowedSections.first();
	}
	
	var oDataStore = oSelf.model[psSection] || { 'resources': [] },
		aResources = (oDataStore.resources || []);
		
	if (psSection === 'lessonScreen') {
		var iUnit = parseInt(objCurrentUnitDetails.currentUnit),
			iWeek = parseInt(objCurrentUnitDetails.currentWeek),
			iDay = 1,
			sLesson = objCurrentUnitDetails.currentLesson,
			aDayList = [],
			sSubType = pmixIndex.subType || 'Vocab',
			aAllowedSubTypes = ['VOCAB', 'WGI'];
			
		if (typeof pmixIndex == 'object' && pmixIndex != null) {
			if (!isNaN(parseInt(pmixIndex.unitNumber))) {
				iUnit = parseInt(pmixIndex.unitNumber);
			}
			if (!isNaN(parseInt(pmixIndex.weekNumber))) {
				iWeek = parseInt(pmixIndex.weekNumber);
			}
		}
			
		if (isNaN(iUnit)) {
			var oFirstEntry = aResources.fetch(0);
			
			iUnit = parseInt(oFirstEntry.unitNumber);
			iWeek = parseInt(oFirstEntry.weekNumber);
			sSubType = oFirstEntry.subType;
		}
		
		if (aAllowedSubTypes.indexOf(sSubType.toUpperCase()) == -1) {
			sSubType = (
				(
					_.uniq(
						_.pluck(
							_.where(
								aResources,
								JSON.parse('{ "unitNumber": "' + iUnit + '", "weekNumber": "' + iWeek + '" }')
							),
							'subType'
						) || []
					) || []
				).first() ||
				"Vocab"
			);
		}
		
		var iMaxDay = iWeek * 5,
			iMinDay = iMaxDay - 4,
			sWord = '';
		
		sLesson = iMinDay + '-' + iMaxDay;
		
		oTemplateData = {
			'mediaPath':	oSelf.resourceMediaPath,
			'unit':			iUnit,
			'lesson':		sLesson,
			'week':			iWeek,
			'subType':		sSubType
		};
		oTemplateData['resources'] = _.where(
			aResources,
			JSON.parse('{ "subType": "' + sSubType + '", "unitNumber": "' + iUnit + '", "weekNumber": "' + iWeek + '" }')
		);
		
		if (oTemplateData['resources'].length == 0) {
			aResources = _.where(aResources, { 'subType': sSubType });
			oTemplateData['unit'] = iUnit = _.min(
				_.uniq(
					_.pluck(
						aResources,
						'unitNumber'
					)
				),
				function (iU) {
					return (isNaN(parseInt(iU))? 99999: parseInt(iU));
				}
			);
			oTemplateData['week'] = iWeek = _.min(
				_.uniq(
					_.pluck(
						_.where(aResources, { 'unitNumber': iUnit }),
						'weekNumber'
					)
				),
				function (iW) {
					return (isNaN(parseInt(iW))? 99999: parseInt(iW));
				}
			);
			
			oTemplateData['resources'] = _.where(
				aResources,
				JSON.parse('{ "subType": "' + sSubType + '", "unitNumber": "' + iUnit + '", "weekNumber": "' + iWeek + '" }')
			);
		}
		
		var iDayOfWeek = 0,
			iWGICounter = 0,
			aResourceList = [];
		
		for (var iJ = 0; iJ < oTemplateData['resources'].length; iJ++) {
			if (iDayOfWeek != oTemplateData['resources'][iJ].dayNumber) {
				iDayOfWeek = oTemplateData['resources'][iJ].dayNumber;
				iWGICounter = 1;
			}
			sWord = $.trim(oTemplateData['resources'][iJ].word);
			oTemplateData['resources'][iJ].word = (
				sSubType.toUpperCase() == 'VOCAB'?
				(
					/*ILIT-5979 - for vocab also now on instead of word will show numbers like Vocabulary 1, Vocabulary 2 ..*/
					sWord.length > 0?
					(
						!sWord.startsWith(NOTEBOOK.c_s_NOTEBOOK_VOCABULARY_RESOURCE_TXT + " ")?
						NOTEBOOK.c_s_NOTEBOOK_VOCABULARY_RESOURCE_TXT + " " + iWGICounter++:
						sWord
					):
					/*==== IPP-3871 ====*/
					'' // oTemplateData['resources'][iJ].itemDisplayName
					/*== End IPP-3871 ==*/
				):
				(
					sWord.length > 0?
					sWord:
					NOTEBOOK.c_s_NOTEBOOK_WHOLE_GROUP_RESOURCE_TXT + " " + iWGICounter++
				)
			);
			
			if (oTemplateData['resources'][iJ].word.length > 0) {
				aResourceList.push(oTemplateData['resources'][iJ]);
			}
		}
		oTemplateData['resources'] = aResourceList;
		oTemplateData['resources'] = inSort(oTemplateData['resources'], ['dayNumber', 'word']);
	}
	else {
		pmixIndex = parseInt(pmixIndex);	
		if (isNaN(pmixIndex) || pmixIndex < 0) {
			pmixIndex = 0;
		}
		oTemplateData = {
			'resources':	aResources,
			'title':		((aResources.fetch(pmixIndex) || {}).itemDisplayName || (aResources.fetch(pmixIndex) || {}).word || ''),
			'mediaPath':	oSelf.resourceMediaPath,
			'index':		pmixIndex
		};
	}
	
	$("#innerPortfolioDataContainer").html(
		_.template(
			$('#resoucesBody' + psSection.camelize()).html(),
			oTemplateData
		)
	);
	oSelf.resizeCA(psSection);
};

/**
* @method: innnerPanelRender
* @param: {String} unitNo
* @param: {String} weekNo    
* @param {String} lessionRef    
* @uses: for render inner panel html view in Portfolio view
* @return void;
*/
PortfolioView.innnerPanelRender = function (
	unitNo,
	weekNo,
	lessionRef,
	passesmentType
) {
	var oSelf = this;
	if (PortfolioView.tabType == NOTEBOOK_PORTFOLIO_TABS[0].c_s_CODE) { // My Work
		$("#innerPortfolioDataContainer").html(
			_.template(
				$("#portfolioInnerTemplate").html(),
				{
					assignmentsData:	_.where(
						oSelf.model,
						{
							ItemUnitNumber:			parseInt(unitNo),
							ItemWeekNumber:			parseInt(weekNo),
							ItemCompletionStatus:	"scored"
						}
					),
					LessionRef:			lessionRef,
					benchmarkData:		_.where(
						oSelf.model,
						{
							ItemUnitNumber:			parseInt(unitNo),
							ItemSubType:			'unitbenchmark',
							ItemCompletionStatus:	"scored"
						}
					),
					wrcData:			_.where(
						oSelf.model,
						{
							ItemUnitNumber:			parseInt(unitNo),
							ItemSubType:			'wrc',
							ItemCompletionStatus:	"scored"
						}
					),
					assesmentType:		passesmentType 
				}
			)
		);
		myworkselection = $('#lessionlist_' + unitNo).find('li.active').find('a').attr('id');
	}
	oSelf.bindEvents();
	oSelf.resize();
	oUtility.hideLoader();
};

PortfolioView.resizeCA = function (psSection) {
	var dWindowHeight = (
			geIOS(8)?
			(parseInt(screen.availHeight) - (parent.APPTYPE == 'webclient'? 90: 30)): // 90 / 30: Found by inspection
			Math.min(parseFloat(window.outerHeight), parseFloat($(window).height()))
		),
		dHeight = (
			dWindowHeight
			- 50 // Height of Close Button container
			- 12 - 12 // Top & Bottom gap
		),
		aAllowedSections = [ 'lessonScreen', 'routineCards', 'bookClub', 'standards' ],
		iI = -1;
	
	for (iI = 0; iI < aAllowedSections.length; iI++) {
		if (aAllowedSections[iI].toUpperCase() == psSection.toUpperCase()) {
			psSection = aAllowedSections[iI];
			break;
		}
	}
	
	if (iI == aAllowedSections.length) {
		psSection = aAllowedSections.first();
	}
	$('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER).height(dHeight);
	$('#' + psSection + '-cont').height(dHeight - 50 - 30 - 8); // 50: Header height, 30: padding (top + bottom), 8: Found by inspection
};

PortfolioView.bindEvents = function () {
	var oSelf = this;
	NotebookTabsView.showhidemenupanel();
	$("." + NOTEBOOK.c_s_NOTEBOOK_PORTFOLIO_TABS)
		.off("click tap")
		.on("click tap", function () {
			$("." + NOTEBOOK.c_s_NOTEBOOK_PORTFOLIO_TABS).removeClass('active');
			$(this).addClass('active');
			var tabType = $(this).attr("data-value");
			var defaultSelectedUnit = 1;
			if (objCurrentUnitDetails.currentUnit !="") {
				defaultSelectedUnit = objCurrentUnitDetails.currentUnit;
			}
			if (tabType ==  NOTEBOOK_PORTFOLIO_TABS[0].c_s_CODE) {
				if (myworkselection != null) {
					unitsection = myworkselection.split("_");
					PortfolioView.goToTabs(tabType,unitsection[1]);
				}
				else {
					PortfolioView.goToTabs(tabType,1);
				}
			}
			else {
				if (resourceselection != null) {
					unitsection = resourceselection.split("_");
					PortfolioView.goToTabs(tabType,unitsection[1]);
				}
				else {
					PortfolioView.goToTabs(tabType,defaultSelectedUnit);
				}
			}
		});
		
	// asignments
	$('.viewWorkData')
		.off('click tap')
		.on("click tap", function (e) {
			// var datval = $(this).attr('item_id').split('___');
			var aItemIdChunks = $(this).attr('item_id').split('___');
			

		    //ILIT-5334
			if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
				callLogUserActivity(e); 
			 }
			
			var assignmentType = aItemIdChunks.fetch(0),
				assignmentId = aItemIdChunks.fetch(1),
				assignmentSubType = aItemIdChunks.fetch(2),
				assignmentHeaderTitle = $(this).attr('item_display_name'),
				itemAttemptSummary = decodeURIComponent($(this).attr('item_attempt_summary')).trim('"'),
				itemAttemptId = $(this).data('item-attempt-id');
			
			
			if (oSelf.tabType ==  NOTEBOOK_PORTFOLIO_TABS[0].c_s_CODE) { // My Work tab
				var sIframeUrl = 'assignment.html?' +
					POPUP_VIEW.c_s_QUERY_PARAM_MODE + '=' + POPUP_VIEW.c_s_MODE_STUDENT + '&' +
					POPUP_VIEW.c_s_QUERY_PARAM_ACTION + '=' + POPUP_VIEW.c_s_ACTION_VIEW + '&' +
					POPUP_VIEW.c_s_QUERY_PARAM_ASSIGNMENT_ID + '=' + assignmentId + '&' +
					POPUP_VIEW.c_s_QUERY_PARAM_ITEM_ATTEMPT_ID + '=' + itemAttemptId + '&' +
					POPUP_VIEW.c_s_QUERY_PARAM_ASSIGNMENT_TYPE + '=' + assignmentType + '&' +
					POPUP_VIEW.c_s_QUERY_PARAM_ASSIGNMENT_SUB_TYPE + '=' + assignmentSubType + '&' +
					POPUP_VIEW.c_s_QUERY_PARAM_HEADER_TITLE + '=' + encodeURIComponent(unescape(assignmentHeaderTitle).specialChar2ASCII()) + '&'+ /* ILIT-5992 */
					POPUP_VIEW.c_s_QUERY_PARAM_ASSIGNMENT_COMPLETION_STATUS + '=' + ASSIGNMENT_INSTRUCTOR.c_i_SCORED_STATUS + '&' +
					POPUP_VIEW.c_s_QUERY_PARAM_OPENED_FROM + '=' + GENERAL.c_s_PAGE_TYPE_NOTEBOOK;
					
				if (oPlatform.isDevice()) {
					ShowWebView(sIframeUrl);
				}
				else {
					$('#' + NOTEBOOK.c_s_NOTEBOOK_VIEW_ASSIGNMENT_AREA).find('iframe').attr('src', sIframeUrl).load(function () {
						$('#' + NOTEBOOK.c_s_NOTEBOOK_VIEW_ASSIGNMENT_AREA).show();
						// back to Portfolio
						$(this).contents().find("#assignmentPrev").off('click').on("click tap", function(){
							$('#' + NOTEBOOK.c_s_NOTEBOOK_VIEW_ASSIGNMENT_AREA).find('iframe').attr('src','');
							setTimeout( function() {
								$('#' + NOTEBOOK.c_s_NOTEBOOK_VIEW_ASSIGNMENT_AREA).hide();
								$("#" + NOTEBOOK.c_s_NOTEBOOK_VIEW_ASSIGNMENT_AREA).css({'width': '', 'height': '', 'overflow' : ''});
							}, 100);				
						});
					});
				}
			}
			else {
				var datval = $(this).attr('item_id').split('___');
				$('#' + NOTEBOOK.c_s_NOTEBOOK_VIEW_RESOURCE_AREA).html(_.template($("#resourcePopup").html(),{'item_id' : datval[0] ,'filetype': datval[2], 'filename':datval[1],'pojectionurl' : oSelf.resourceMediaPath,'altText': datval[3]})).show();
					
				if(datval[2] == 'image'){ 
					$("#"+ datval[0]).load(function() { PortfolioView.resize(); });
				}else{
					PortfolioView.resize();
				}
			   $('#' + NOTEBOOK.c_s_NOTEBOOK_VIEW_RESOURCE_AREA).siblings('div').attr("aria-hidden", "true"); //For preventing focus from modal background
				$('#ui-tooltip_closeresource').hide();
				$("#" + NOTEBOOK.c_s_RESOURCE_CLOSE_BTN).off('click').on('click',function(ev){
					$('#' + NOTEBOOK.c_s_NOTEBOOK_VIEW_RESOURCE_AREA).attr("aria-hidden", "true");
					$('#' + NOTEBOOK.c_s_NOTEBOOK_VIEW_RESOURCE_AREA).attr("tabindex", "-1");
					$('.slide_upload_light_box.resource').attr("aria-hidden", "true");
				   $('#' + NOTEBOOK.c_s_NOTEBOOK_VIEW_RESOURCE_AREA).siblings('div[aria-hidden]').removeAttr('aria-hidden');
					$('#' + NOTEBOOK.c_s_NOTEBOOK_VIEW_RESOURCE_AREA).hide();
				   setTimeout(function() {
						$('.container_notes_column_content ul li').length ? $('.container_notes_column_content ul li:first-child a').focus() : $('.container_notes_column_content').focus();
				   }, 300);
				});
				$("#" + NOTEBOOK.c_s_RESOURCE_CLOSE_BTN).focus(function(){
					$('#ui-tooltip_closeresource').show();
				});
				$("#" + NOTEBOOK.c_s_RESOURCE_CLOSE_BTN).focusout(function(){
					$('#ui-tooltip_closeresource').hide();
				});
			}	
		});

	//bind keyboard 'space' and 'enter' key click
	$('.viewWorkData')
		.off('keyup')
		.on('keyup', function (e) {
			var KeyID = e.keyCode;
			if(KeyID==32 || KeyID==13) {//'space' || 'enter'
				$(this).trigger("click");
				e.preventDefault();
				e.stopPropagation();
			}
		});
	
	//Keep focus within resource popup
	$('#' + NOTEBOOK.c_s_NOTEBOOK_VIEW_RESOURCE_AREA).on('keydown', function (e) {
			var jqTarget = $(e.target);
			handleTab(e, jqTarget, $("#resource_close_btn"), $("#resource_close_btn"));
		});

	//bind click event on 'my work' tab's left menu items
   $('[id^=noteid_]').off('click').on('click',function(e) {
		var weekNumber = $(this).attr("week-number");
		var lession_ref = $(this).attr("lession-ref");
		var unit_no     = $(this).attr("unit-no");
		var assesmentType = $(this).attr("a-type");

		if (PortfolioView.tabType == NOTEBOOK_PORTFOLIO_TABS[0].c_s_CODE) {
			myworkselection = $(this).attr('id');
		}
		else {
			resourceselection = $(this).attr('id');
		}
		oSelf.innnerPanelRender(unit_no,weekNumber,lession_ref,assesmentType);

	   //ILIT-5334
	   if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
		callLogUserActivity(e); 
	   }
	});
	//bind keyboard 'space' and 'enter' key click
	$('[id^=noteid_]')
		.off('keyup')
		.on('keyup', function (e) {
			var KeyID = e.keyCode;
			if(KeyID==32 || KeyID==13) {//'space' || 'enter'
				$(this).trigger("click");
				e.preventDefault();
				e.stopPropagation();
			}
		});
	$('[id^=unitid_]')
		.off('click')
		.on('click',function() {
			var oAnchor = this;
			if ($(oAnchor).parent('li').hasClass('active')) {
				$(oAnchor).next('ul').filter(':visible').slideUp('slow', function () {
					$(oAnchor).parent('li').removeClass('active');
				});
				return false;
			}
			else {
				if ($(oAnchor).next('ul').length == 0) {
					var unitId = $(this).attr("data-value");
					oSelf.render(unitId);
					NotebookTabsView.bindEvents();
				}
				else {
					$(oAnchor).next('ul').not(':visible').slideDown('slow', function () {
						$(oAnchor).parent('li').addClass('active');
						$(this).children().first().find('a').trigger('click');
						$(this).children().first().find('a').focus();
					});
				}
			}
		});
	/*==== IPP-3499 ====*/
	$('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .groups').parent().off('click tap');
	$('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .groups')
		.off('click tap')
	   .on('click tap', function (e) {
			if ($(this).parent().hasClass('active')) {
				return false;
			}
				
		   //ILIT-5334
		   if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			    callLogUserActivity(e); 
		   }
			/*==== Handle Other Sub-Groups ====*/
			var aOtherGroups = $(this).parent().siblings();
				/*== Remove Active Class from Other Group Links ==*/
			aOtherGroups.each(function () {
				var oGroupCont = $(this),
					sGrp = $(this).children('a').data('group');
				
				oGroupCont.removeClass('active');
				oGroupCont.find('.sub-groups').each(function () {
					$(this).removeClass('active');
					$(this).next('ul').find('.links').removeClass('active');
					if ($(this).next('ul').is(':visible')) {
						$(this).next('ul').slideUp('slow');
					}
				});
				setTimeout(function () {
					oGroupCont.children('ul.sub-groups-cont').hide();
				}, 300)
				
				oGroupCont.find('.links-cont').each(function () {
					var oUl = $(this);
					
					oUl.find('a.links').removeClass('active');
					oUl.slideUp('slow');
				});
			});
				/* End Remove Active Class from Other Group Links */
			/*== End Handle Other Sub-Groups ==*/
			
			$(this).parent().addClass('active');
			$(this).next('ul').slideDown('slow', function () {
				var aSubGroups = $(this).children().first().find('a.sub-groups'),
					aLinks = $(this).children().first().find('a.links');
					
				if (aSubGroups.length > 0) {
					aSubGroups.first().trigger('click');
					aSubGroups.first().focus();
					return;
				}
				
				aLinks.first().trigger('click');
				aLinks.first().focus();
			});
		});

	//Parent list will be opened and closed on 'Enter' or 'Space' key pressed
	$('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .groups')
		.off('keydown')
		.on('keydown', function (e) {
			var KeyID = e.keyCode;
			if(KeyID==32 || KeyID==13) {//'space' || 'enter'
				$(this).trigger("click");
				e.preventDefault();
				e.stopPropagation();
			}
		});
	
	$('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .sub-groups').parent().off('click tap');
	$('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .sub-groups')
		.off('click tap')
		.on('click tap', function (oEvent) {
			if ($(this).hasClass('active')) {
				var oAnchor = this;
				$(this).next('ul').slideUp('slow', function () {
					$(oAnchor).removeClass('active');
				});
				return false;
			}
			var sGroup = $(this).data('group');
			/*==== Remove All Active Classes & Hide Corresponding Lists ====*/
			$('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .sub-groups').filterByData('group', sGroup).not($(this)).removeClass('active');
			$('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .sub-groups')
				.filterByData('group', sGroup)
					.not($(this))
						.next('ul').filter(':visible').slideUp('slow');
			/*== End Remove All Active Classes & Hide Corresponding Lists ==*/
			$(this).toggleClass('active');
			
			if ($(this).hasClass('active')) {
				$(this).next('ul').slideDown('slow', function () {
					$(this).children().first().find('a.links').first().removeClass('active');
					$(this).children().first().find('a.links').first().trigger('click');
					$(this).children().first().find('a.links').first().focus();
				});
			}
			else {
				$(this).next('ul').slideUp('slow');
			}

		   //ILIT-5334
		   if($(oEvent.target).hasClass("valid-activity") || $(oEvent.currentTarget).hasClass("valid-activity")){
			    callLogUserActivity(oEvent); 
		   }
		});
	
	//Child list will be opened and closed on 'Enter' or 'Space' key pressed
	$('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .sub-groups')
		.off('keydown')
		.on('keydown', function (e) {
			var KeyID = e.keyCode;
			if(KeyID==32 || KeyID==13) { //'space' || 'enter'
				$(this).trigger("click");
				e.preventDefault();
				e.stopPropagation();
			}
		});

	//List item navigation on 'up' and 'down' arrow
	$('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .sub-groups.active, #' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .groups').next('ul:visible')
	//$('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .groups').next('ul')
	.off('keyup')
	.on('keyup', function(e){
		var listItems,
			key = e.keyCode;
		e.preventDefault();
		e.stopPropagation();
		if ( key != 40 && key != 38 ){
			return false;
		}
		if ($('.sub-groups').hasClass('active')) {
			listItems = $('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .sub-groups.active').next('ul:visible').children();
		} else {
			listItems = $('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .groups').next('ul:visible').children();
		}
		if (listItems.length) {
			var $selected = listItems.filter(function(index){
					return $(this).find('a').is(':focus');
				}),
				$current;
			// $listItems.find('a.links').removeClass('active');
			listItems.find('a').blur();
		
			if ( key == 40 ) // Down key
			{
				if ( listItems.length <= 1 || $selected.is(':last-child') ) {
					$current = listItems.eq(0);
				}
				else {
					$current = $selected.next();
				}
			}
			else if ( key == 38 ) // Up key
			{
				if ( listItems.length <= 1 || $selected.is(':first-child') ) {
					$current = listItems.last();
				}
				else {
					$current = $selected.prev();
				}
			}
			// $current.find('a.links').addClass('active');
			$current.find('a').focus();
		}
	});

	$('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .links').parent().off('click tap keydown');
	$('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .links')
		.off('click tap')
	   .on('click tap', function (e) {

		 
			if ($(this).hasClass('active')) {
				return false;
			}
				
		  //ILIT-5334
		   if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			      callLogUserActivity(e); 
		   }
			   
			var sGroup = $(this).data('group'),
				iIndex = parseInt($(this).data('index')),
				oFilter = null;
				
			$('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .links').filterByData('group', sGroup).not($(this)).removeClass('active');
			$(this).addClass('active');
			
			if (sGroup == 'lessonScreen') {
				var sFilter = '{ "subType": "' + $(this).data('sub-type') + '", "unitNumber": "' + $(this).data('unit') + '", "weekNumber": "' + $(this).data('week') + '" }';
				oFilter = JSON.parse(sFilter);
				oSelf.innerPanelRenderCA(sGroup, oFilter);
				setTimeout(function () { oSelf.bindEvents(); }, 300);
				return false;
			}
			
			oSelf.innerPanelRenderCA(sGroup, iIndex);
			setTimeout(function () { oSelf.bindEvents(); }, 300);

			return false;
		});

		//List's links will be opened and closed on 'Enter' or 'Space' key pressed
		$('#' + NOTEBOOK.c_s_PORTFOLIO_LEFT_PANEL_CONTAINER + ' .links')
		.off('keydown')
		.on('keydown', function (e) {
			var KeyID = e.keyCode;
			if(KeyID==32 || KeyID==13) { //'space' || 'enter'
				$(this).trigger("click");
				e.preventDefault();
				e.stopPropagation();
			}
		});
	/*== End IPP-3499 ==*/
	
	function fGetSPSubType (poAttemptData) {
		var sStudyPlanSubType = ASSIGNMENTS.c_s_ASSIGNMENT_PRETEST_TYPE;
		try {
			switch (poAttemptData.Status) {
				case '200':
				case 200:
					var oStudentAttempt = JSON.parse(((poAttemptData.Content || [])[0] || {}).StudentAttemptData || '{}'),
						oPostTestData = (((oStudentAttempt.itemSlides || [])[0] || {}).slideInputData || {}).posttest;
					if (_.keys(oPostTestData).length == 0) {
						sStudyPlanSubType = ASSIGNMENTS.c_s_ASSIGNMENT_PRETEST_TYPE;
					}
					else {
						sStudyPlanSubType = ASSIGNMENTS.c_s_ASSIGNMENT_POSTTEST_TYPE;
					}
					break;
				case '500':
				case 500:
					break;
			}
		}
		catch (oException) {
			
		}
		
		return sStudyPlanSubType;
	}

	//tooltip on portfolio (Mywork and Resources)
	$('#ui-tooltip_deleteportfolio, #ui-tooltip_sendportfolio, #ui-tooltip_addportfolio').hide();
	$('#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_PORTFOLIO + ',#' + NOTEBOOK.c_s_NOTEBOOK_SEND_PORTFOLIO
		+ ',#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_PORTFOLIO).focus(function(e){
		if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_DELETE_PORTFOLIO) {
			$('#ui-tooltip_deleteportfolio').show();		
		} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_SEND_PORTFOLIO) {
			$('#ui-tooltip_sendportfolio').show();		
		} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_PORTFOLIO) {
			$('#ui-tooltip_addportfolio').show();		
		}
	});
	$('#' + NOTEBOOK.c_s_NOTEBOOK_DELETE_PORTFOLIO + ',#' + NOTEBOOK.c_s_NOTEBOOK_SEND_PORTFOLIO
		+ ',#' + NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_PORTFOLIO).focusout(function(e){
		if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_DELETE_PORTFOLIO) {
			$('#ui-tooltip_deleteportfolio').hide();		
		} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_SEND_PORTFOLIO) {
			$('#ui-tooltip_sendportfolio').hide();		
		} else if ($(e.target).attr("id") == NOTEBOOK.c_s_NOTEBOOK_ADD_NEW_PORTFOLIO) {
			$('#ui-tooltip_addportfolio').hide();		
		}
	});
   $("#" + PortfolioView.tabType).attr('aria-selected','true');
};

PortfolioView.resize = function () {
	var notesLandingPadding = (
			parseInt($(".notes_wrapper_right").css("padding-top")) +
			parseInt($(".notes_wrapper_right").css("padding-bottom")) +
			$(".notes_head_title2").innerHeight() +
			$(".container_notes_wrapper_title").outerHeight(true) +
			$(".note_title_head").outerHeight(true) +
			$(".button_bar_wrapper").outerHeight(true) +
			parseInt($(".container_notes_column").css("padding-bottom"))
		) + 1;
	
	$(".container_notes_column").height(($(window).height())-(notesLandingPadding)).css({"overflow-x":"hidden","overflow-y":"auto"});
	
	var rightSideFixed= parseInt($(".notes_wrapper_left").css("padding-top")) + parseInt($(".notes_wrapper_left").css("padding-bottom"))+1;
	$(".notes_wrapper_left").height(($(window).height())-(rightSideFixed)).css({"overflow-x":"hidden","overflow-y":"auto"});
	
	if ($("#viewResourcePopupArea").is(":visible")) {
		$("#viewResourcePopupArea").attr("aria-hidden", "false");
		$("#viewResourcePopupArea").attr("tabindex", "0");
		var main_container_width = (
				$('.slide_upload_light_box').width() -
				(
					parseInt($('.slide_upload_light_box').css("padding-left")) +
					parseInt($('.slide_upload_light_box').css("padding-right")) +
					(parseInt($('.slide_upload_light_box').css("border-left-width"), 10) * 2)
				)
			),
			main_container_height = $('.slide_upload_light_box').height();
		
		if ($(".video_container").is(":visible")) {
			$('.video_container').css('width', main_container_width + 'px');
			$('.video_container').css('height', main_container_height + 'px');
		}
		else {
			// $('.image_container').css('width', main_container_width + 'px');
			$('.image_container').css('height', main_container_height + 'px');
		}
		$('.slide_upload_light_box.resource').attr('aria-hidden', 'false');
	   setTimeout(function() {
			$("#" + NOTEBOOK.c_s_RESOURCE_CLOSE_BTN).focus();
	   }, 500);
	}
	
	$('.' + NOTEBOOK.c_s_NOTEBOOK_LIST_WRAPPER).height($('#innerPortfolioDataContainer').height());
};

/**
* @method: goToTabs
* @param: {String} tabType
* @param: {String} unitId 
* @uses:  for getting the particular json data depending on tab type i.e Mywork or Resource
* @return void;
*/
PortfolioView.scheduleCheckLoadJsSource = function (tabType, unitId) {
	if (objResourceJsonData != null) {
		loadJS(objResourceJsonData.jsPath, function () {
			PortfolioView.isResourceJSLoaded(tabType,unitId);
		});
	}
	else {
		setTimeout(function(){
			PortfolioView.scheduleCheckLoadJsSource(tabType,unitId);
		}, 500);
	}
}

/**
* @method: isResourceJSLoaded
* @param {String} tabType
* @param {String} unitId 
* @uses:  for checking whether particular js variable i.e. json has been loaded or not
* @return void;
*/
PortfolioView.isResourceJSLoaded = function (tabType, unitId) {	
	if (objResourceData != null) {
		objResourceJsonData['content'] = objResourceData;
		// PortfolioView.model = objResourceJsonData['content'].resource;
		PortfolioView.model = objResourceData;
		PortfolioView.resourceMediaPath = objResourceJsonData['mediaPath'];
		PortfolioView.render(unitId);
		NotebookTabsView.bindEvents();	
		
		var sVerbId = (
				(_.findWhere(NOTEBOOK_PORTFOLIO_TABS, {"c_s_CODE": tabType}) || {}).c_s_VERBID ||
				"S-NTO-PO"
			);
		SetGoogleAnalytic(sVerbId);
		
		$('.notbookoverlay').remove();
		$('body').css({'opacity':'1'});
		oUtility.hideLoader();
	}
	else {
		setTimeout(function () {
			PortfolioView.isResourceJSLoaded(tabType,unitId);
		}, 100);
	}
};

PortfolioView.getPortfolioDataV2 = function (piUnitId) {
	var aMasterData = $GLOBALS.get('MyWorkData') || [],
		fUpdateMasterData = function (poRecord, psKey) {
			var iM = 0;
			
			if ($GLOBALS.get('MyWorkData') === undefined) {
				$GLOBALS.set('MyWorkData', []);
			}
			
			for (iM = 0; iM < $GLOBALS.get('MyWorkData').length; iM++) {
				if ($GLOBALS.get('MyWorkData')[iM][psKey] === poRecord[psKey]) {
					$GLOBALS.get('MyWorkData')[iM] = $.extend({}, $GLOBALS.get('MyWorkData')[iM], poRecord);
					break;
				}
			}
			
			if (iM == $GLOBALS.get('MyWorkData').length) {
				$GLOBALS.get('MyWorkData').push(poRecord);
			}
		};
	
	$.monitor({
		'params':			{
			'currentUnit':	piUnitId,
			'dataList':		aMasterData,
			'pKey':			'IAID',
			'rKey':			'ARID'
		},
		'if':				function () {
			return (objNoteBookData != null);
		},
		'beforeStart':	function () {
			oUtility.showLoader({
				'click-to-hide': 	false,
				'message':    		'<img src="media/loader.gif" alt="' + NOTEBOOK.c_s_NOTEBOOK_LOADING_TXT + '" />\
<p style="font-size:13px; margin-top:-8px; color:#555555;">' + NOTEBOOK.c_s_NOTEBOOK_LOADING_TXT + '</p>',
				'foreground-color':	'none',
				'background-color':	'#FFFFFF',
				'opacity':			0.5,
				'box-style':		{
					'height':			'80px',
					'width':			'80px',
					'line-height':		'25px',
					'opacity':			0.5,
					'user-select':		'none',
					'-moz-user-select':	'none'
				}
			});
			objNoteBookData = null;
			GetGradebookForStudentV2();
		},
		'interval':			500,
		'then':				function (poParams) {
			if (parseInt(objNoteBookData.Status) !== 200) {
				PortfolioView.model = (objNoteBookData.Content || {}).GradeBookData || [];
				PortfolioView.render(poParams['currentUnit']);
				NotebookTabsView.bindEvents();
				return;
			}
			
			var aDataList = poParams['dataList'],
				sPKey = poParams['pKey'],
				sRevKey = poParams['rKey'],
				aRecords = (objNoteBookData.Content || {}).GradeBookData || [],
				aNewRecords = [],
				oElement = {},
				iI, iJ;
			
			for (iI = 0; iI < aRecords.length; iI++) {
				for (iJ = 0; iJ < aDataList.length; iJ++) {
					if (aRecords[iI][sPKey] == aDataList[iJ][sPKey]) {
						if (aRecords[iI][sRevKey] != aDataList[iJ][sRevKey]) {
							oElement = JSON.parse('{ "' + sPKey + '": "' + aRecords[iI][sPKey] + '", "' + sRevKey + '": "' + aRecords[iI][sRevKey] + '" }');
							aNewRecords.push(oElement);
							fUpdateMasterData(oElement, sPKey);
						}
						break;
					}
				}
				
				if (iJ == aDataList.length) {
					oElement = JSON.parse('{ "' + sPKey + '": "' + aRecords[iI][sPKey] + '", "' + sRevKey + '": "' + aRecords[iI][sRevKey] + '" }');
					aNewRecords.push(oElement);
					aDataList.push(oElement);
					fUpdateMasterData(oElement, sPKey);
				}
			}
			
			$.monitor({
				'params':			{
					'currentUnit':	poParams['currentUnit'],
					'dataList':		aDataList,
					'pKey':			sPKey,
					'rKey':			sRevKey
				},
				'interval':			500,
				'beforeStart':		function () {
					objGradebookAttemptDataForStudent = null;
					GetGradebookAttemptDataForStudApp(aNewRecords);
				},
				'if':				function () {
					return (objGradebookAttemptDataForStudent != null);
				},
				'then':				function (poParams) {
					if (typeof objGradebookAttemptDataForStudent.Content != 'undefined') {
						var aDetRecords = objGradebookAttemptDataForStudent.Content || [],
							aRecords = poParams['dataList'],
							iK, iL,
							sPKey = poParams['pKey'],
							sRKey = poParams['rKey'],
							oRecord = {},
							aFinalRecords = [];
							
						for (iL = 0; iL < aDetRecords.length; iL++) {
							if (
								aDetRecords[iL]['ICS'] == 'scored' &&
								!isNaN(parseInt(aDetRecords[iL]['FS']))
							) {
								oRecord = {};
								oRecord['StudentId'] = aDetRecords[iL]['SID'];
								oRecord['ItemAttemptId'] = aDetRecords[iL]['IAID'];
								oRecord['AssignedItemID'] = aDetRecords[iL]['CMSID'];
								oRecord['ItemDisplayName'] = aDetRecords[iL]['IDN'];
								oRecord['ItemSubject'] = aDetRecords[iL]['ISU'];
								oRecord['ItemUnitNumber'] = aDetRecords[iL]['IUN'];
								oRecord['ItemWeekNumber'] = aDetRecords[iL]['IWN'];
								
								if(oRecord['ItemWeekNumber'] == 0 && NotebookView.sProductCode.match(GENERAL.c_s_ILIT_20) != -1 && aDetRecords[iL]['WN'] != 0){
									oRecord['ItemWeekNumber'] = aDetRecords[iL]['WN'];
								}
								oRecord['ItemLessonNumber'] = aDetRecords[iL]['ILN'];
								oRecord['ItemCompletionStatus'] = aDetRecords[iL]['ICS'];
								oRecord['ItemAttemptDataSummary'] = aDetRecords[iL]['IADS'];
								oRecord['FinalScore'] = aDetRecords[iL]['FS'];
								oRecord['SystemScore'] = aDetRecords[iL]['SS'];
								oRecord['InstructorScoreData'] = aDetRecords[iL]['IS'];
								oRecord['ItemType'] = aDetRecords[iL]['IT'];
								oRecord['ItemSubType'] = aDetRecords[iL]['IST'];
							   // ILIT-5311 Oral removal fluency, showing fs/ims 
								oRecord['ItemMaxScore'] = (
									["phonictextbasedslide", "extendedphonic", "frs"].indexOf(oRecord['ItemSubType']) !== -1?
									(
										oRecord['ItemSubject'] === 'pktof'?
									   (oRecord['ItemAttemptDataSummary']==1?aDetRecords[iL]['IMS']:100):
										aDetRecords[iL]['IMS']
									):
									aDetRecords[iL]['IMS']
								);
								oRecord['ReAssignCount'] = aDetRecords[iL]['RAC'];
								oRecord['Comment'] = aDetRecords[iL]['Cmt'];

								// CLAS-60
								oRecord['SFB'] = aDetRecords[iL]['SFB'];
								// End of CLAS-60
								fUpdateMasterData(oRecord, sPKey);
								aFinalRecords.push(oRecord);
							}
						}
						PortfolioView.model = aFinalRecords; // $GLOBALS.get('MyWorkData');
						PortfolioView.render(poParams['currentUnit']);
						NotebookTabsView.bindEvents();
						
						return;
					}
					
					PortfolioView.model = poParams['dataList'];
					PortfolioView.render(poParams['currentUnit']);
					NotebookTabsView.bindEvents();
				}
			});
		}
	});
};
