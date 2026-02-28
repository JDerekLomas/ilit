// student.js

var STATUSINTERVALOBJ;
var STATUSCALLTIME = 5000;
var CLASSSTATUSOBJ = {};
var surveyQuesID = '';
var surveyQuesInfo = '';
var surveyQuesAction = 'Attempt';
var broadcastImage = '', broadcastEbookID = '', broadcastAssignment = '';
var broadcastVisible = false, broadcastEbookVisible = false;
var selectedOptionAlphabetHexStart = 97;
var currEventTimeStamp,loginVerbVal, startTime, endTime;
var bookInfoPDFBroadcastObj = {};
var sameCurrentPDFBroadcastPDF = false;
var GENERAL = {
	"c_s_DIST_DDL_LABEL": "Select Organization",
	"c_s_PROD_TYPE_MYELD": "myeld",
	"c_s_PROD_TYPE_ILIT": "ilit",
	"c_s_PROD_TYPE_WTW": "wtw"
};
var distListCount = 0; 

var DisableElements;
var lastActiveElm;
var DisableElementsAriaHidden;

//constants for ARIA LABEL
var ARIA_LBL = {
	"ORG_SELECT_DDL" : "Select Organization dropdown"
};

//constants for assistive text
var ARIA_ASSISTIVE_TEXT = {
	"EXPANDED" : "Expanded",
	"COLLAPSED" : " Collapsed ",
	"PRESSED" : "Pressed",
	"BUTTON" : "Button",
	"SELECTED" : "Selected",
	"NOT_SELECTED" : "Not Selected",
	"DDL_INSTRUCTION" : "Use up & down arrow keys to navigate the options",
	"HIDE_BTN_DESC" : "Hide class name",
	"CLASS_LIST_DESC" : "",
	"CLASS_DIALOG_DESC" : "",
	"SELECT_CLASS_BTN_DEC" : "",
	"ENABLED" : "Enabled",
	"DISABLED" : "Disabled"
};

//constant for class selection popup coloumn count
var ARIA_CLASS_SELECT_POPUP = {	
    "CLASS_COL_COUNT": 3
};

var MSG_FORCE_LOGOUT = "You will be logged out now due to inactivity.";

//ILIT-5391
var isBroadServeyStarted = true;

$(window).resize(function() {
	resize();
	if($('.broadcastOverlay').is(':visible')) {
		resizeBroadcastFrame();
	}
});

$(window).ready(function() {
	var loginDone = getSessionStorageItem('loginDone');
	if(getLocalStorageItem('TOKENID') != null) {
		TOKENID = getLocalStorageItem('TOKENID');
		//afterTokenCallBack();
	}
	if(loginDone == null) {
		var postObj = {
					AppType: APPTYPE,
					AppVersionNumber: APPVERNUM,
					PassCode: '1234',
					LastTokenID: TOKENID
				};
		var url = SERVICEBASEURL + "GetServiceTokenID";
		AjaxCall(url, "POST", postObj, sp_GetServiceTokenID);
		checkInternetConnection();
	} else {
		afterTokenCallBack();
	}
	//$('.footer_container .verNo').html('Ver. '+APPVERNUM);
	bindClassSelectBtnForStud();
	rumbaLoginForStudent();
});

//ILIT-5334
function fCallLogUserActivity(event){
	if(event && event.target && event.currentTarget){
		var verbId = $(event.target).attr("data-verbid") ? $(event.target).attr("data-verbid") : $(event.currentTarget).attr("data-verbid") ? $(event.currentTarget).attr("data-verbid") : '',
		eventType = event.type ?  event.type : '';
	}
	else{
		var verbId = '',
		eventType = '';
	}
	  
		
	var oUserActivity = new Object;
		oUserActivity.VerbValue = '',//vVal;
		oUserActivity.ActivityID = '',//activityID;
		oUserActivity.EventTimeStamp = getCurrentTimestamp(),//eventTimeStamp;
		oUserActivity.CallerUserID = '',//getSessionStorageItem("userID");
		oUserActivity.EventType = eventType ? eventType : '',//getSessionStorageItem("eventType"); // event need to define ? or actual UI event
		oUserActivity.VerbID  = verbId ? verbId : '',//vID; // it will be unique attribute of the element which is generating the event
		oUserActivity.CallerClassID = '',//getSessionStorageItem("classID");
		oUserActivity.OtherKeysAndValues  = '';
		
		aUserActivities.push(oUserActivity);
		
			
}

//ILIT-5572
function removeFromEventArray(){
	for(var i = 0;i<aUserActivities.length;i++){
		if(aUserActivities[i].EventType == "broastcast_servey"){
			var tempArray= aUserActivities.slice(0,i-1);
			aUserActivities = tempArray.concat(aUserActivities.slice(i+1,aUserActivities.length - 1));
			
		}
	}
}

function getFooterButton() {
	var sProductCode = getSessionStorageItem('productCode') || '';
	$('#footer-btn-cont').html(
		_.template(
			$('#footer-buttons-student').html(),
			{
				'productCode':	sProductCode
			}
		)
	).css('visibility', 'visible');
};

function sp_GetServiceTokenID(data) {
	internetCheckIntervalStart = true;
	window.clearTimeout(internetCheckInterval);
	if(data != null) {
		var jsonObj = JSON.parse(data);
		if(jsonObj.Status == '200') {
			TOKENID = $.trim(jsonObj.Content.TokenID);
			setLocalStorageItem('TOKENID', TOKENID);
			setLocalStorageItem('LASTTOKENACCESSDATE', getTimeInMs());
			afterTokenCallBack();
		} else {
			alert(jsonObj.Error.ErrorUserDescription);
		}
	}
}

function afterTokenCallBack() {
	var loginDone = getSessionStorageItem('loginDone');
	var userRole = getSessionStorageItem('userRole');
	if(loginDone == null || userRole != USERROLE) {
		clearSessionStorage();
		//load login template based on product
		switch(PRODTYPE){
			case PRODTYPE_CONSTANT.c_s_PROD_TYPE_ILIT:
			case PRODTYPE_CONSTANT.c_s_PROD_TYPE_MYELD:
				$(".wrapper").prepend(_.template($("#tplLoginWrapper").html()));
			break;
			
			case PRODTYPE_CONSTANT.c_s_PROD_TYPE_WTW:
				$(".wrapper").prepend(_.template($("#tplLoginWrapperWTW").html()));
				$("body").addClass("student");
			break;
		}
		
		//set version number
		$('.footer_container .verNo').html('Ver. '+APPVERNUM);
				
		$('.afterLoginWrapper').hide();
		bindLoginContinue();
		/*== start for district dropdown ==*/
		getDistrictList();
		/*== end for district dropdown ==*/
	} else if(loginDone != null) {
		$('.loginWrapper, .gradeSelect').remove();
		$('.afterLoginWrapper').show();
		init();
	}
}

/*== start for district dropdown ==*/
//fetch district list
function getDistrictList(){	
	//show loader
	$('.loader.districtList').show();
	var postObj = {
					TokenID: TOKENID,
					DeviceTimeStamp: getCurrentTimestamp(),	
					ProductType:PRODTYPE
				};
	var url = SERVICEBASEURL + "GetDistrictList";
	AjaxCall(url, "POST", postObj, getDistrictListCallBack);
}

function triggerAssignmentTOCPage(){
	$('.footer_in .Assignments').trigger('click', true);
}

/*== ref: https://jqueryui.com/autocomplete/#combobox ==*/
function searchableComboInit(pOElemSelect){

	//auto select last district 
	selectLastDistrictAndUser();
	
    $.widget( "custom.combobox", {
      _create: function() {
        this.wrapper = $( "<span>" )
          .addClass( "custom-combobox" )
          .insertAfter( this.element );
 
        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
      },
 
      _createAutocomplete: function() {
        var selected = this.element.children( ":selected" ),
          value = selected.val() ? selected.text() : "",
		  label = this.element.children().eq(0).html().trim(); // for dropdown placeholder text
        this.input = $( "<input>" )
          .appendTo( this.wrapper )
          .val( value )
          .attr( "title", "" )
		  .attr("placeholder",label)
		  .attr("aria-label", ARIA_LBL.ORG_SELECT_DDL+ARIA_ASSISTIVE_TEXT.COLLAPSED+(this.element.children().length -1)+"results found "+ARIA_ASSISTIVE_TEXT.DDL_INSTRUCTION)
		  .attr("tabindex","0")
          .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
          .autocomplete({
            delay: 0,
            minLength: 0,
            source: $.proxy( this, "_source" )
          })
          .tooltip({
            tooltipClass: "ui-state-highlight"
          });
 
        this._on( this.input, {
          autocompleteselect: function( event, ui ) {
            ui.item.option.selected = true;
			readThis(ui.item.option.text+", "+ARIA_ASSISTIVE_TEXT.SELECTED+", "+ARIA_LBL.ORG_SELECT_DDL+ARIA_ASSISTIVE_TEXT.COLLAPSED); //ILIT-3498
			//readThis(ARIA_LBL.ORG_SELECT_DDL+ARIA_ASSISTIVE_TEXT.COLLAPSED+($(target).children().length)+"results found "+ARIA_ASSISTIVE_TEXT.DDL_INSTRUCTION);	
            this._trigger( "select", event, {
              item: ui.item.option
            });
          },
 
          autocompletechange: "_removeIfInvalid"
        });
      },
 
      _createShowAllButton: function() {
        var input = this.input,
          wasOpen = false;
 
        $( "<a>" )
          .attr( "tabIndex", -1 )
		  .attr( "aria-label", ARIA_LBL.ORG_SELECT_DDL+ARIA_ASSISTIVE_TEXT.BUTTON)
          /* .attr( "title", "Show All Items" )
          .tooltip() */
          .appendTo( this.wrapper )
          .button({
            icons: {
              primary: "ui-icon-triangle-1-s"
            },
            text: false
          })
          .removeClass( "ui-corner-all" )
          .addClass( "custom-combobox-toggle ui-corner-right" )
          .mousedown(function() {
            wasOpen = input.autocomplete( "widget" ).is( ":visible" );
          })
          .click(function() {
            input.focus();
 
            // Close if already visible
            if ( wasOpen ) {
              return;
            }
 
            // Pass empty string as value to search for, displaying all results
            input.autocomplete( "search", "" );
          })
		  .keydown(function(e){
			  triggerClickOnThisElem(e, this)
		  });
      },
 
      _source: function( request, response ) {
        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
        response( this.element.children( "option" ).map(function() {
          var text = $( this ).text().trim(); // trim() to fix for extra space in input 
          if ( this.value && ( !request.term || matcher.test(text) ) )
            return {
              label: text,
              value: text,
              option: this
            };
        }) );
      },
 
      _removeIfInvalid: function( event, ui ) {
 
        // Selected an item, nothing to do
        if ( ui.item ) {
          return;
        }
 
        // Search for a match (case-insensitive)
        var value = this.input.val(),
          valueLowerCase = value.toLowerCase(),
          valid = false;
        this.element.children( "option" ).each(function() {
          if ( $( this ).text().toLowerCase() === valueLowerCase ) {
            this.selected = valid = true;
            return false;
          }
        });
 
        // Found a match, nothing to do
        if ( valid ) {
          return;
        }
 
        // Remove invalid value
        this.input
          .val( "" )
         /* .attr( "title", value + " didn't match any item" )
          .tooltip( "open" ); */
        this.element.val( "" );
       /* this._delay(function() {
          this.input.tooltip( "close" ).attr( "title", "" );
        }, 2500 ); */
       /* this.input.autocomplete( "instance" ).term = ""; */
	   
	    /* rectified above line in order to fix error - no such method 'instance' for autocomplete widget instance 
		ref : https://forum.jquery.com/topic/issue-with-jquery-ui-selectmenu-no-such-method-instance */
		this.input.data( "ui-autocomplete" ).term = ""; 
      },
 
      _destroy: function() {
        this.wrapper.remove();
        this.element.show();
      }
    });
  
    pOElemSelect.combobox();
    $( "#toggle" ).click(function() {
      pOElemSelect.toggle();
    });  
}

function getDistrictListCallBack(data){
	if (data != null) {
		$('.loader.districtList').hide();
		data = JSON.parse(data);
		if(data.Status == '200') {
			$("#districtList").html(_.template($("#districtListTpl").html(), {"districtList" : data.Content}));
			searchableComboInit($("#districtDDL"));
			bindDistrictEvents();
			distListCount = data.Content.length;
			//set initial focus to district dropdown
			$("#districtList").find("input").focus();
			
			//set event for disctrict dropdown UI visibility for aria expand collapse
			var target = document.getElementsByClassName('ui-autocomplete')[0];
			var observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutationRecord) {
					if($('.ui-autocomplete').is(":visible")){
						readThis(ARIA_LBL.ORG_SELECT_DDL+ARIA_ASSISTIVE_TEXT.EXPANDED+($(target).children().length)+"results found "+ARIA_ASSISTIVE_TEXT.DDL_INSTRUCTION);	
					}
					else{
						if($("#districtDDL").length > 0){
							if($("#districtDDL").val().trim().length == 0){
								readThis(ARIA_LBL.ORG_SELECT_DDL+ARIA_ASSISTIVE_TEXT.COLLAPSED);	
							}
						}
					}
				});    
			});
			observer.observe(target, { attributes : true, attributeFilter : ['style'] });
			
		}else {
			alert(data.Error.ErrorUserDescription+" Fetchng District List ");
			getDistrictList();
		}
	}
	$("[role='status']").attr("aria-hidden", "true"); //hide from focus on cursor mode
	var idleTimeinsec = localStorage.getItem('iForcedLogoutIdleTimeLimitStudent')?localStorage.getItem('iForcedLogoutIdleTimeLimitStudent'):30*60 ;
	if( localStorage.getItem('ExpiryErrCode') && localStorage.getItem('ExpiryErrCode') == 'U1167'){
		_alert({
				divId:		'dialog-message',
				title:		'Alert!',
				message:	"You have been logged out due to "+idleTimeinsec/60+" minutes of inactivity. Please log back in to continue."
			}, function(){
				
		});
		localStorage.removeItem("ExpiryErrCode");
		localStorage.removeItem("iForcedLogoutIdleTimeLimitStudent");
		localStorage.removeItem("bForcedLogoutEnabled");
	}	
}
/*== end for district dropdown ==*/

/* function to execute initial function */
function init() {
	$('.loader').show();
	readThis("loading");
	//initAudioRecorder();
	USERID = getSessionStorageItem('userID');
	CLASSID = getSessionStorageItem('classID');
	CACHEDSTATUSSTUDENTKEYNAME = 'UAI_CACHE_STATUS_S_' + CLASSID + '_' + USERID;
	GETRECOMMENDEDCACHESTUDENTKEYNAME = CLASSID + '_' + USERID + '_RECOMMENDEDBOOKS' ; //initialize value for the key
	if(_Browser.isSafari) {
		INDEXEDDBSUPPORT = false;
	}
	initAudioPlayingObject();
	initInfoStorage();
	resize();
	checkClassStatus();
}

function initInfoStorage() {
	var classID = getSessionStorageItem("classID");
	var userID = getSessionStorageItem("userID");
	var productGradeID = getSessionStorageItem("productGradeID");
	var postObj = {
					TokenID: TOKENID,
					DeviceTimeStamp: getCurrentTimestamp(),
					ProductGradeID : productGradeID,
                    CallerClassID : classID,
                    CallerUserID : userID

				};
	var url = SERVICEBASEURL + "GetGradeInfoInDetail";
	AjaxCall(url, "POST", postObj, GetGradeInfoInDetailCallBack);
}

function GetGradeInfoInDetailCallBack(data) {
	if (data != null) {
		data = JSON.parse(data);
		if(data.Status == '200') {
			PRODUCTCODE = getSessionStorageItem('productCode');
			var contentBaseURL = data.Content.ContentBaseURL.trim();
			var gradeCode = data.Content.GradeCode.trim();
			var assignmentPath = contentBaseURL + data.Content.assignmentPath.trim() + '/' + gradeCode + '/';
			var libraryMidPath = data.Content.libraryPath.trim();
			var gradePath = contentBaseURL + PRODUCTCODE + '/curriculum/' + gradeCode + '/';
			var libraryBookPath = contentBaseURL + libraryMidPath + '/';
			//var libraryBookPath = contentBaseURL + (PRODUCTCODE + '/curriculum/' + gradeCode) + '/',
			var	libraryPath = (
					(isiLit20() === true)?
					contentBaseURL + (PRODUCTCODE + '/curriculum/' + gradeCode) + '/':
					contentBaseURL + (PRODUCTCODE + '/curriculum/' + gradeCode) + '/'
				);			
			var totalUnits = data.Content.TotalUnits.trim();
			var totalWeeksWithInGrade = data.Content.TotalWeeksWithInGrade.trim();
			var totalLessonsWithInGrade = data.Content.TotalLessonsWithInGrade.trim();
			setSessionStorageItem('contentBaseURL', contentBaseURL);
			setSessionStorageItem('gradeDisplayName', data.Content.GradeDisplayName.trim());
			setSessionStorageItem('revisionNumber', data.Content.RevisionNumber.trim());
			setSessionStorageItem('gradeCode', gradeCode);
			setSessionStorageItem('gradePath', gradePath);
			setSessionStorageItem('assignmentPath', assignmentPath);
			setSessionStorageItem('libraryBookPath', libraryBookPath);
			setSessionStorageItem('libraryPath', libraryPath);
			setSessionStorageItem('totalUnits', totalUnits);
			setSessionStorageItem('totalWeeksWithInGrade', totalWeeksWithInGrade);
			setSessionStorageItem('totalLessonsWithInGrade', totalLessonsWithInGrade);
			setSessionStorageItem('unitsWeeksDetails', data.Content.UnitsWeeksDetails);
			
			afterInfoStorage();
			getFooterButton();
		} else {
			alert(data.Error.ErrorUserDescription);
		}
	}
}

function afterInfoStorage() {
	var gradePath = getSessionStorageItem('gradePath');
	var timeStmpCacheFlag = new Date().toUTCString().replace(/ /g, '').split(':')[0];
	var gradeItemPath = gradePath + 'grade_items.js?_='+timeStmpCacheFlag;
	$.ajax({
		url: gradeItemPath,
		dataType: "script",
		cache: true,
		success: function( data ) {
			getTOCItemsAndMap();
		}
	});
	setInfoBubbleDetails();
	bindHTML();
	bindPDFReaderBackBtn();
	trackCSLog();
}

// FUNCTION TO GET TOC ITEMS OF SERVICES DB AND MAP TO GRADE_ITEMS.JS DATA
function getTOCItemsAndMap() {
	var classID = getSessionStorageItem("classID");
	var userID = getSessionStorageItem("userID");
	var productGradeID = getSessionStorageItem("productGradeID");
	var postObj = {
		TokenID: TOKENID,
		DeviceTimeStamp: getCurrentTimestamp(),
		ProductGradeID : productGradeID,
		CallerClassID : classID,
		CallerUserID : userID

	};
	var url = SERVICEBASEURL + "GetTOCItems";
	AjaxCall(url, "POST", postObj, getTOCItemsAndMapCallBack);
	return false;
}

// CALLBACK FUNCTION FOR GetTOCItems SERVICEBASEURL
function getTOCItemsAndMapCallBack(response) {
	if(response != null ) {
		var resp = JSON.parse(response);
		if(resp.Status == '200') {
			var mapContent = resp.Content;
			for(var i = 0 ; i < mapContent.length; i++) {
				CMSIDsTOSERVCIDsMAPPING[mapContent[i].CMSItemID] = mapContent[i].ItemID;
				SERVCIDsTOCMSIDsMAPPING[mapContent[i].ItemID] = mapContent[i].CMSItemID;
			}
			mapCMSIDsToTOCIDs(CMSIDsTOSERVCIDsMAPPING);
			createAssignmentArray();
			bindFooterButton();
			checkCurrentTab();
			changeConnectStatus();
			$('.loader').hide();
		} else {
			alert(resp.Error.ErrorUserDescription);
		}
	} else {
		alert('Mapping data not available. Please check.');
	}
}

// for logging class started data
function trackCSLog() {

	// for creating log of classStarted event
	endTime = getTimeInMs();
	var verbVal = endTime- getSessionStorageItem("eventStartTime");
	eventTimeStamp = getSessionStorageItem("eventTimeStamp");
	createLog(getSessionStorageItem("verbID"), verbVal, eventTimeStamp);
}

function checkCurrentTab()
{
	var tabIndex = getSessionStorageItem('currentTabIndex');
	$('.footer_in button').eq(parseInt(tabIndex)).trigger('click');
}

/* function to resize iframe according to browser window */
function resize()
{
	var winH = $(window).height();
	var topBarH = $('.footer_inner').height();
	var iFrameH = parseInt(winH - topBarH - 5);
	
	$('.iframeWrap').animate({ 'height' : iFrameH + 'px' }, 50);
	$('#wrapperFrame').animate({ 'height' : iFrameH + 'px' }, 50);
	
}

function resizeBroadcastFrame()
{
	var topBarH = 0;
	var winH = $(window).height();
	if($('.broadcastOverlay .topBar').is(':visible')) {
		topBarH = $('.broadcastOverlay .topBar').height();
	}
	$('.broadcastWrapper').animate({ 'height' : (winH - topBarH) + 'px' }, 50);
	$('#broadcastFrame').animate({ 'height' : (winH - topBarH) + 'px' }, 50);
	return false;
}

function bindHTML()
{
	$('body').bind('click', function(e) {
		try {
			var targetElem = $(e.target);
			//console.log(targetElem.attr('class'));
			var targetClass = targetElem.attr('class');
			if(targetClass.indexOf('logout_setting') == -1 && targetClass.indexOf('lesson_tooltip') == -1) {
				if($('#infoToolTip').is(':visible')) {
					$('#infoToolTip').fadeOut(100);
					$('.footer_inner button.logout_setting').removeClass('active');
				}
			}
		}
		catch(e) {}
		
	});
}

/* function to bind native button on the bottom */
function bindFooterButton()
{
	$('.footer_in button').off('click').on('click', function(e,triggered) {

		e.preventDefault();

		if (!navigator.onLine) {
			_NO_INTERNET_ALERT = true; 
			
			if (typeof window.frames["wrapperFrame"].networkErrorAlert == "function") {
				window.frames["wrapperFrame"].networkErrorAlert(false); // hide html alert			
			}
			
			_alert({
					divId:		'dialog-message',
					title:		'Alert!',
					message:	_c_s_NO_INTERNET_MSG
				}, function(){
					
			},"no-button");
			
			return;
		}

		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			
			fCallLogUserActivity(e); 
			
		}

		var htmlFileName = '';
		var buttonName = $.trim($(this).attr('class').toLowerCase());
		var tabIndex = $('.footer_in button').index($(this));		
		setSessionStorageItem('currentTabIndex', tabIndex);
		$('.footer_in button').removeClass('active');
		$(this).addClass('active');
		var cacheFreeValue = getTimeInMs();
		switch(true)
		{
			case (buttonName.indexOf('review') > -1):
				//$('#wrapperFrame').attr('src','App/book_review.html?_=' + cacheFreeValue);
				openPage({});
				setSessionStorageItem("currentTab",'review'); 
				setSessionStorageItem("verbID", "S-RTO"); // to log data
				createLog('S-RTO', 0 ,getCurrentTimestamp()); //send Log
				break;
			case (buttonName.indexOf('library') > -1):
				//$('#wrapperFrame').attr('src','App/library.html?_=' + cacheFreeValue);
				var ifr = document.getElementById("wrapperFrame");
				ifr.contentWindow.location.replace('App/library.html?_=' + cacheFreeValue);
				setSessionStorageItem("currentTab", "library"); 
				//setSessionStorageItem("verbID", "S-LBTO"); // to log data
				break;
			case (buttonName.indexOf('assignments') > -1):
				setSessionStorageItem("currentTab", "assignments");
				setSessionStorageItem("verbID", "S-ATO"); //to log data
				//$('#wrapperFrame').attr('src','App/assignment.html?_=' + cacheFreeValue);
				var ifr = document.getElementById("wrapperFrame");				
				if(triggered){
					ifr.contentWindow.location.replace('assignment.html?_=' + cacheFreeValue);
				}else{
					ifr.contentWindow.location.replace('App/assignment.html?_=' + cacheFreeValue);
				}
				
				break;
			case (buttonName.indexOf('notebooks') > -1):
				//$('#wrapperFrame').attr('src','App/notebook.html?_=' + cacheFreeValue);
				var ifr = document.getElementById("wrapperFrame");
				ifr.contentWindow.location.replace('App/notebook.html?_=' + cacheFreeValue);
				setSessionStorageItem("currentTab", "notebooks");
				setSessionStorageItem("verbID", "S-NTO"); //to log data
				createLog('S-NTO', 0 ,getCurrentTimestamp());//ILIT-5547
				window.top.sendGoogleEvents('Student - Notebook (tab)','Viewed Notebook','UserID:'+getSessionStorageItem("UserID"));
				break;
			case (buttonName.indexOf('connect') > -1):
				//$('#wrapperFrame').attr('src','App/student-connect.html?_=' + cacheFreeValue);
				var ifr = document.getElementById("wrapperFrame");
				ifr.contentWindow.location.replace('App/student-connect.html?_=' + cacheFreeValue);
				setSessionStorageItem("currentTab", "connect");
				setSessionStorageItem("verbID", "S-CTO"); //to log data
				createLog('S-CTO', 0 ,getCurrentTimestamp()); //send Log
				/*window.top.sendGoogleEvents('Student - Notebook (tab)','Viewed Notebook','UserID:'+getSessionStorageItem("UserID")); */
				break;
			case (buttonName.indexOf('dashboard') > -1):
				setSessionStorageItem("currentTab", "dashboard");
				setSessionStorageItem("verbID", "S-ATO"); //to log data
				//$('#wrapperFrame').attr('src','App/student_dashboard.html?_=' + cacheFreeValue);
				var ifr = document.getElementById("wrapperFrame");
				ifr.contentWindow.location.replace('App/student_dashboard.html?_=' + cacheFreeValue);
				//$('#wrapperFrame')[0].contentWindow.location.replace('App/student_dashboard.html?_=' + cacheFreeValue);
				break;
			default:
				alert('No Method Found!');
				break;
		}
		
		currEventTimeStamp = getCurrentTimestamp();
		setSessionStorageItem("eventStartTime", getTimeInMs());
		setSessionStorageItem("eventTimeStamp", currEventTimeStamp);
	});
	
	$('.footer_inner button.logout_setting').off('focus').on('focus',function(){
         if(!$('#infoToolTip').is(':visible')){
              $(this).attr('aria-expanded',false);
		 }
	});

	$('.footer_inner button.logout_setting').unbind('click').bind('click', function(e) {

		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			
			fCallLogUserActivity(e); 
			
			
		}

		$('#infoToolTip').fadeToggle(100);
		if($(this).hasClass('active')) {
			$(this).removeClass('active');
			$(this).focus();
			$(this).attr('aria-expanded',false);
			$('#infoToolTip').attr('aria-hidden',true);
		} else {
			$(this).addClass('active');
			$(this).attr('aria-expanded',true);	
			setTimeout(function(){
			   readThis('Tooltip');
			},300);			
			setTimeout(function(){				
				$('#infoToolTip').removeAttr('aria-hidden');
				if($('#btnSwitchClass').hasClass('disabledSwitch')){
					$('#btnLogout').focus();	
				}else{
                    $('#btnSwitchClass').focus();	
				}
							
			},500);					
			$('#btnSwitchClass').off('focus').on('focus',function(event){
				var selectedClass = $('#infoToolTip').find('.className').html();
				setTimeout(function(){
					readThis("popup button collapse, selected class is "+selectedClass);
				},2000);				
			});					
		}
	});
}

/* function to check class status after student login */
function checkClassStatus()
{
	var userID = getSessionStorageItem("userID");
	var classID = getSessionStorageItem("classID");
	var postObj = {
					TokenID: TOKENID,
					DeviceTimeStamp: getCurrentTimestamp(),
					CallerUserID: userID,
					CallerClassID: classID,
					GroupID: getSessionStorageItem("classGroupId")
				};
	var url = SERVICEBASEURL + "GetClassStatus";
	AjaxCall(url, "POST", postObj, checkClassStatusCallBack, "GetClassStatus"); checkInternetConnection(); // 1st call
	window.clearInterval(STATUSINTERVALOBJ);
}

function checkClassStatusCallBack(jsonData) {
	window.clearInterval(STATUSINTERVALOBJ); //ILIT-5911. Preventing creation of multiple timers in case it got created
	STATUSINTERVALOBJ = window.setInterval(function() { checkClassStatus(); }, STATUSCALLTIME);
	if (jsonData != "Error") {
		internetCheckIntervalStart = true;
		// ILIT-5628
		if (typeof window.frames["wrapperFrame"].networkErrorAlert == "function" && _NO_INTERNET_ALERT == true) {
			window.frames["wrapperFrame"].networkErrorAlert(false); // hide html alert			
		}		
		if (_NO_INTERNET_ALERT == true) {
			// hiding native alert if visible
			if ($('#dialog-message').text() == _c_s_NO_INTERNET_MSG) {	
				$('#dialog-message').dialog('close');
			}
			_NO_INTERNET_ALERT = false;
		}
	}	
	
	if(jsonData != null && jsonData != "Error") {
		var jsonObj = JSON.parse(jsonData);
		if(jsonObj.Status == '200' && jsonObj.Content != null && jsonObj.Error == null) {
			CLASSSTATUSOBJ = jsonData;
			var curRATABookID = jsonObj.Content.ClassCurrentActivities == null ? '' : JSON.stringify({ currentRATABookID : (jsonObj.Content.ClassCurrentActivities.CurrentRATABookID == '') ? '' : SERVCIDsTOCMSIDsMAPPING[jsonObj.Content.ClassCurrentActivities.CurrentRATABookID] });
			try { window.frames["wrapperFrame"].GetCurrentRATACallback(curRATABookID); } catch(e) {}
			if (
				jsonObj.Content.CurrentAction != null &&
				(
					jsonObj.Content.CurrentAction.toLowerCase().trim() == 'S'.toLowerCase() ||
					jsonObj.Content.CurrentAction.toLowerCase().trim() == 'AP'.toLowerCase()
				)
			) {
				// if currentAction is Survey or Poll
				broadcastEbookVisible = false; //temp
				broadcastEbookID = ''; //temp
				retainEbookBroadcast();
				var surveyON = true;
				closeBroadcast(surveyON);
				var currentActionData = JSON.parse(jsonObj.Content.CurrentActionData);
				var surveyJSON = JSON.parse(decodeURIComponent(currentActionData.QuestionInfo));
				var surveyType = "LessonSurvey";
				if (jsonObj.Content.CurrentAction.toLowerCase().trim() == 'AP'.toLowerCase()) {
					surveyType = "AdHocPoll";
				}
				if(surveyQuesID != surveyJSON.survey.question_id) {
					try { window.frames["wrapperFrame"].stopTextHelpSpeak(); } catch(e) {}
					$('.submitSurveyMsg').hide();
					$('.surveyOverlay .question_box_space #btnSurveySubmit').show();
					showSurvey(surveyJSON.survey, surveyType);
					$('.surveyOverlay').slideDown(300);					
					bindSurveyScreen(surveyType);
					surveyQuesID = surveyJSON.survey.question_id;
					//var tmpSurveyObj = { "survey": JSON.stringify(surveyJSON.survey)  };
					surveyQuesInfo = JSON.stringify(currentActionData.QuestionInfo);
				}
				//ILIT-5391
				if(isBroadServeyStarted){					
					var oUserActivity = new Object;
						oUserActivity.VerbValue = '',
						oUserActivity.ActivityID = '',
						oUserActivity.EventTimeStamp = getCurrentTimestamp(),
						oUserActivity.CallerUserID = '',
						oUserActivity.EventType = "broastcast_servey",
						oUserActivity.VerbID  = '', 
						oUserActivity.CallerClassID = '',
						oUserActivity.OtherKeysAndValues  = '';							
						aUserActivities.push(oUserActivity); //ILIT-5470 no need to extend session. instead will show popup 
						isBroadServeyStarted = false ; 
				}
				
			} else if(jsonObj.Content.CurrentAction == null) {
				//ILIT-5572
				removeFromEventArray(); 
				closeSurvey();
				closeBroadcast();
				closeBuzz();
				if(getSessionStorageItem('isPdfOpen') && getSessionStorageItem('isPdfOpen') == 'Y'){
					//ILIT-5391				
					var oUserActivity = new Object;
						oUserActivity.VerbValue = '',
						oUserActivity.ActivityID = '',
						oUserActivity.EventTimeStamp = getCurrentTimestamp(),
						oUserActivity.CallerUserID = '',
						oUserActivity.EventType = "pdf_open",
						oUserActivity.VerbID  = '', 
						oUserActivity.CallerClassID = '',
						oUserActivity.OtherKeysAndValues  = '';
								
					     aUserActivities.push(oUserActivity); //ILIT-5470 no need to extend session. instead will show popup 
	
				}
			} else if(jsonObj.Content.CurrentAction != null && jsonObj.Content.CurrentAction.toLowerCase().trim() == 'P'.toLowerCase()) {
				// if currentAction is projection
				closeSurvey();
				closeBroadcast();
				closeBuzz();
				//ILIT-5572
				removeFromEventArray();
			} else if(jsonObj.Content.CurrentAction != null && (jsonObj.Content.CurrentAction.toLowerCase().trim() == 'B'.toLowerCase())) {
				// if currentAction is broadcast

				//ILIT-5391
				if(isBroadServeyStarted){
					// excute if activity is broadcast or Rata broadcast.
					var oUserActivity = new Object;
						oUserActivity.VerbValue = '',
						oUserActivity.ActivityID = '',
						oUserActivity.EventTimeStamp = getCurrentTimestamp(),
						oUserActivity.CallerUserID = '',
						oUserActivity.EventType = "broastcast_servey",
						oUserActivity.VerbID  = '', 
						oUserActivity.CallerClassID = '',
						oUserActivity.OtherKeysAndValues  = '';
							
					aUserActivities.push(oUserActivity); //ILIT-5470 no need to extend session. instead will show popup 
					isBroadServeyStarted = false ; 
				}

				var currentActionData = JSON.parse(jsonObj.Content.CurrentActionData);
				if(currentActionData.MediaType.toLowerCase() == 'ebook') {
					var fullURLArr = currentActionData.MediaFullURL.split('|||');
					var bookFormat = fullURLArr[5];
					if(bookFormat.toLowerCase() == 'pdf') {
						if(bookInfoPDFObj.bookID != undefined && bookInfoPDFObj.bookID == currentActionData.MediaID.trim()) {
							if($('.pdfReaderOverlay').is(':visible')) {
								$('#pdfReaderBackBtn').prop('disabled', true);
								broadcastEbookVisible = true, sameCurrentPDFBroadcastPDF = true;
							}
						} else {
							if(broadcastEbookID != currentActionData.MediaID.trim()) {
								try { window.frames["wrapperFrame"].stopTextHelpSpeak(); } catch(e) {}
								var bookName = fullURLArr[1];
								var bookType = fullURLArr[2];
								var wordCount = (isNaN(parseInt(fullURLArr[3]))) ? 0 : parseInt(fullURLArr[3]);
								var bookNumPage = (isNaN(parseInt(fullURLArr[6]))) ? 0 : parseInt(fullURLArr[6]);
								var classStatusJson = JSON.parse(CLASSSTATUSOBJ);
								var currentUnit = (classStatusJson.Content.ClassCurrentActivities == null) ? '' : classStatusJson.Content.ClassCurrentActivities.CurrentLessonUnit;
								var currentWeek = (classStatusJson.Content.ClassCurrentActivities == null) ? '' : classStatusJson.Content.ClassCurrentActivities.CurrentLessonWeek;
								currentRataBookId = (classStatusJson.Content.ClassCurrentActivities == null) ? '' : ((classStatusJson.Content.ClassCurrentActivities.CurrentRATABookID == '') ? '' : SERVCIDsTOCMSIDsMAPPING[classStatusJson.Content.ClassCurrentActivities.CurrentRATABookID]);
								var bookID = currentActionData.MediaID.trim();
								var libraryPath = getSessionStorageItem("libraryPath");
								var libraryBookPath = getSessionStorageItem("libraryBookPath");
								var bookPath = libraryBookPath + bookID + '/' + bookID + '.pdf';
								var jsonStr = '{ "bookID" : "' + bookID + '", "bookPath" : "' + bookPath + '", "bookName" : "' + bookName + '", "bookType" : "' + bookType + '", "wordCount" : "' + wordCount + '", "bookNumPage" : "' + bookNumPage + '", "currentUnit" : "' + currentUnit + '", "currentWeek" : "' + currentWeek + '", "currentRataBookId" : "' + currentRataBookId + '" }';
								bookInfoPDFBroadcastObj = JSON.parse(jsonStr);
								$('.broadcastOverlay .topBar').show();
								$('.broadcastOverlay .topBar #broadcastBackBtn').prop('disabled',true);
								$('.broadcastOverlay .topBar .middle').html(bookName);
								closeSurvey();
								closeBuzz();
								retainPdfBroadcast(jsonData);
								broadcastEbookVisible = true;
								$('.broadcastOverlay #broadcastFrame').attr('src' , '');
								if($('.pdfReaderOverlay').is(':visible')) {
									$('#pdfReaderBackBtn').trigger('click');
								}
								setSessionStorageItem('BookID', bookID);
								setTimeout(function() { 
									$('.broadcastOverlay').slideDown(300, function() {
										resizeBroadcastFrame();
										$('.broadcastOverlay #broadcastFrame').attr('src' , bookPath);
										setPDFReaderVariables(bookInfoPDFBroadcastObj);
									});
								}, 200);
								var currEventTimeStamp = getCurrentTimestamp();
								createLog('IL', 0, currEventTimeStamp,'pdf');
							} else {
								if(!$('.broadcastOverlay .topBar #broadcastBackBtn').is(':disabled')) {
									$('.broadcastOverlay .topBar #broadcastBackBtn').prop('disabled',true);
								}
							}	
						}
						broadcastEbookID = currentActionData.MediaID.trim();
					} else {
						$('.broadcastOverlay .topBar').hide();
						if(broadcastEbookID != currentActionData.MediaID.trim()) {
							try { window.frames["wrapperFrame"].stopTextHelpSpeak(); } catch(e) {}
							closeSurvey();
							closeBuzz();
							resizeBroadcastFrame();
							broadcastEbookVisible = true;
							var ebookFullURL = currentActionData.MediaFullURL.trim();
							currEventTimeStamp = getCurrentTimestamp();
							setSessionStorageItem("eventStartTime", getTimeInMs());
							setSessionStorageItem("eventTimeStamp", currEventTimeStamp);
							setSessionStorageItem("verbID", "IL");
							setTimeout(function() { 
								$('.broadcastOverlay').slideDown(300, function() {
									$('.broadcastOverlay #broadcastFrame').attr('src' , 'App/ebookplayer/'+ebookFullURL);
								});
							}, 200);
							broadcastEbookID = currentActionData.MediaID.trim();
						} else {
							try { window.frames["broadcastFrame"].onBroadcastStart(); } catch(e) {}
						}
					}
				} else {
					// if image is broadcast
					if(broadcastImage != currentActionData.MediaFullURL.trim()) {
						// if new image is broadcast
						$('.broadcastOverlay .topBar').hide();
						try { window.frames["wrapperFrame"].stopTextHelpSpeak(); } catch(e) {}
						closeSurvey();
						closeBuzz();
						broadcastEbookID = '';
						broadcastEbookVisible = false;
						resizeBroadcastFrame();
						$('.broadcastOverlay').slideDown(300, function() {						
							retainEbookBroadcast();	// retain previous eBook broadcast if any					
							$('.broadcastOverlay #broadcastFrame').attr('src', 'App/broadcast.html').load(function() {							
								broadcastVisible = true;
								var jsonBroadcast = jsonObj;
								var broadcastCurrentActionData = JSON.parse(jsonBroadcast.Content.CurrentActionData);
								var imgName = broadcastCurrentActionData.MediaFullURL.trim();
								jsonBroadcast.MediaFullUrl = getSessionStorageItem("gradePath").trim() + 'projection/' + imgName;
								jsonBroadcast.currentVersion = APPVERNUM;
								jsonBroadcast.appPlatform = APPTYPE;
								try { window.frames["broadcastFrame"].GetBroadcastInfoCallback(JSON.stringify(jsonBroadcast)); } catch(e) {}
								$(this).unbind();
							});
						});
						broadcastImage = currentActionData.MediaFullURL.trim();
					}
					if(broadcastVisible) {
						var jsonBroadcastV = jsonObj;
						var broadcastCurrentActionDataV = JSON.parse(jsonBroadcastV.Content.CurrentActionData);
						var imgName = broadcastCurrentActionDataV.MediaFullURL.trim();
						jsonBroadcastV.MediaFullUrl = getSessionStorageItem("gradePath").trim() + 'projection/' + imgName;
						jsonBroadcastV.currentVersion = APPVERNUM;
						jsonBroadcastV.appPlatform = APPTYPE;
						try { window.frames["broadcastFrame"].GetBroadcastInfoCallback(JSON.stringify(jsonBroadcastV)); } catch(e) {}
					}
				}
			} else if(jsonObj.Content.CurrentAction != null && (jsonObj.Content.CurrentAction.toLowerCase().trim() == 'AA'.toLowerCase())) {
				// if currentAction is Assignment or Assessment broadcast
				var currentActionData = JSON.parse(jsonObj.Content.CurrentActionData);
				try {
					setSessionStorageItem('isAssignmentBroadcastON', 'Y');
					setSessionStorageItem('screenMetaData', currentActionData.ScreenMetadata);				
				} catch (e) {}

				// if new assignment is broadcast
				if (currentActionData && broadcastAssignment != currentActionData.MediaID.trim()) {
					$('.broadcastOverlay .topBar').hide();
					try { window.frames["wrapperFrame"].stopTextHelpSpeak(); } catch(e) {}
					closeSurvey();
					closeBuzz();
					broadcastEbookID = '';
					broadcastEbookVisible = false;
					resizeBroadcastFrame();

					var jsonBroadcast = jsonObj,
						broadcastCurrentActionData = JSON.parse(jsonBroadcast.Content.CurrentActionData),
						sAssignmentUrl = broadcastCurrentActionData.MediaFullURL.trim();
					$('.broadcastOverlay').slideDown(300, function() {						
						retainEbookBroadcast();	// retain previous eBook broadcast if any					
						$('.broadcastOverlay #broadcastFrame').attr('src', 'App/'+sAssignmentUrl).load(function() {
							broadcastVisible = true;							
							jsonBroadcast.MediaFullUrl = getSessionStorageItem("gradePath").trim() + 'projection/' + imgName;
							jsonBroadcast.currentVersion = APPVERNUM;
							jsonBroadcast.appPlatform = APPTYPE;
							try { window.frames["broadcastFrame"].GetBroadcastInfoCallback(JSON.stringify(jsonBroadcast)); } catch(e) {}
							$(this).unbind();
						});
					});
					broadcastAssignment = currentActionData.MediaID.trim();
				}
			}			
			else if (jsonObj.Content.CurrentAction.toLowerCase().trim() == 'bz') { // IPP-4099
				// if currentAction is buzz
				try {
					//ILIT-5572
					removeFromEventArray();

					var oCurrentActionData = JSON.parse(jsonObj.Content.CurrentActionData),
						oQuestionInfo = JSON.parse(decodeURIComponent(oCurrentActionData.QuestionInfo || '{}')),
						studentBuzz = oQuestionInfo.students,
						UserID = getSessionStorageItem("userID"),
						iBuzzId = "";
					
					for( i=0; i<studentBuzz.length; i++){
						if(studentBuzz[i].studentId == UserID){
							iBuzzId = studentBuzz[i].buzzId;
						}
					}
					
					var aStudentIds = [],
						//iBuzzId = oQuestionInfo.buzzId || -1,
						iStarCount = parseInt(oQuestionInfo.startCount) || 0,
						sCommentText = '',
						sStarHtml = ''
						iExistingBuzzId = (localStorage.getItem('buzzId') || $('#btnCloseBuzz').data('buzz-id')) || 0,
						oClosedBuzzList = JSON.parse(localStorage.getItem('closedBuzzList') || '{}'),
						iStudentId = getSessionStorageItem("userID"),
						iMaxStarCount = 3,
						dStartContWidth = (iMaxStarCount * 48 + 195),
						sRightOffset = ((435 - dStartContWidth) / 2).toFixed(2),
						oCommentInfo = {},
						sResetMessage = 'I have reset the stars for the class. Let\'s start again. Good luck.';
						
					try {
						oCommentInfo = JSON.parse(oQuestionInfo.comment);
						aStudentIds = oCommentInfo.studentIDs || [];
					}
					catch (oException) {
						
					}
					
					if (iBuzzId === -1) {
						objUtility.hidePopUp();
						return;
					}
					if (oClosedBuzzList[iStudentId] === iBuzzId) {
						objUtility.hidePopUp();
						return;
					}
					if (aStudentIds.length > 0 && aStudentIds.indexOf(iStudentId.toString()) === -1) {
						objUtility.hidePopUp();
						return;
					}
					if (typeof oCommentInfo.comments === 'string') { // Reset Class
						if (oCommentInfo.comments == sResetMessage) {
							objUtility.hidePopUp();
							return;
						}
					}
					if (iExistingBuzzId !== iBuzzId) {
						objUtility.hidePopUp();
					}
				
					if (!$.isEmptyObject(oCommentInfo)) {
						if (oCommentInfo.comments instanceof Array) {
							for (var iI = 0; iI < oCommentInfo.comments.length; iI++) {
								if (oCommentInfo.comments[iI] !== undefined) {
									sCommentText += (sCommentText.length > 0? '<br />': '') + oCommentInfo.comments[iI];
								}
							}
						}
						
						if (typeof oCommentInfo.personalComments === 'string') {
							sCommentText += (sCommentText.length > 0? '<br />': '') + oCommentInfo.personalComments;
						}
					}

					
					
					for (var iI = 1; iI <= iStarCount; iI++) {
						if (iI === 1) {
							sStarHtml = '<ul style="list-style:none; width:' + dStartContWidth + 'px; position:absolute; right:' + sRightOffset + 'px; bottom:10px;">' +
							'\n\t<li style="float:left; padding:4px; font-size:21px; height:40px; line-height:40px;"> You have received: </li>';
							// 40: width of star + 8: padding
						}
						sStarHtml += '\n\t<li style="float:left; padding:4px;" role="presentation"> <img src="media/star-on.png" alt="'+iI+' start" width="40" /> </li>';
						if (iI === iStarCount) {
							for (var iJ = iStarCount + 1; iJ <= iMaxStarCount; iJ++) {
								
								sStarHtml += '\n\t<li style="float:left; padding:4px;"> <img src="media/star-off.png" alt="'+iJ+'" width="40" /> </li>';
							}
							sStarHtml += '\n</ul>';
						}
					}
					
					objUtility.showPopUp({
						'click-to-hide': 	false,
						'message':'<div class="popup_yellow_content">\
							<div class="popup_yellow_inner" tabindex="0" role="dialog" aria-describedby="dialog-message" aria-labelledby="ui-id-1">\
								<div onclick="closeBuzz(\'' + iBuzzId + '\');" class="close_yew sprite-buzz" id="btnCloseBuzz" data-buzz-id="' + iBuzzId + '" role="button" aria-disabled="false" tabindex="0" aria-label="Close Button">\
								</div>\
								<div class="pop_title"><div class="pop_title_inn" id="ui-id-1">BUZZ<em>!</em></div></div>\
								<div class="popup_content_yellow">\
									<div class="popup_content_yellow_text">' + sCommentText + '</div>\
									<br clear="all" />\
									<div class="popup_content_yellow_stars">' + sStarHtml + '</div>\
								</div>\
							</div>\
						</div>',
						'foreground-color':	'none',
						'background-color':	'#FFFFFF',
						'after-load':		function (sLoaderId) {
							
							localStorage.setItem('buzzId', iBuzzId + '');
							objUtility.Popupsiblings = $('#'+sLoaderId).siblings('div:not([aria-hidden])');
							console.log('after load',objUtility.Popupsiblings);
							objUtility.Popupsiblings.each(function(){
								 $(this).attr('aria-hidden','true');
							 })
						
							var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
							if(isSafari){
								$('#dynamicTextForSR').attr('aria-hidden',false);
							}
							lastFocusedElement = document.activeElement;

							setTimeout(function(){
								
								$('#btnCloseBuzz').focus();
							})


							$('#btnCloseBuzz').off('keydown focus blur').on({
							    'keydown': function(objEvent){
										objEvent = objEvent || window.event;
										var iKey = objEvent.keyCode;
										if (iKey == 13 || iKey == 32) {
											$(this).trigger('click');
											
											setTimeout(function(){
												lastFocusedElement.focus();
											},200)
										}
										else if(objEvent.shiftKey && iKey == 9){
											objEvent.preventDefault();
																		
										}
										else if(iKey == 9){
											objEvent.preventDefault();
											
										}
										
									},

								'focus' : function(){
										$('#dynamicTextForSR').attr('aria-live','polite');
										setTimeout(function(){
											$('#dynamicTextForSR').text('You have received '+iStarCount+ ' star');
										},200)
								},

								'blur' : function(){
									   $('#dynamicTextForSR').attr('aria-live','assertive');
								}
							})
							
							

						
						},
						'opacity':			0.3,
						'box-style':		{
							'height':			'300px',
							'width':			'475px',
							'line-height':		'25px',
							'opacity':			1,
							'user-select':		'none',
							'-moz-user-select':	'none'
						}
					});
					delete oClosedBuzzList[iStudentId];
					localStorage.setItem('closedBuzzList', JSON.stringify(oClosedBuzzList));

					
				}
				catch (oException) {
					
				}
			}
		}// else if(jsonObj.Status != '200' && jsonObj.Content == null && jsonObj.Error != null) {
		else if( jsonObj.Status != '200' && jsonObj.Content == null && jsonObj.Error != null) {
			//alert(jsonObj.Error.ErrorUserDescription); //commented temporarily
			if(localStorage.getItem('bForcedLogoutEnabled') == "true" || 
				jsonObj.Error.ErrorCode == 'U1168' || 
				jsonObj.Error.ErrorCode == 'U1167'
			){
				
				/* force logout */
				//check for specific error code and either call logout OR extend session depending upon error code
				//if error code is for extend session, call method extend session 
				if(jsonObj.Error.ErrorCode == 'U1168'){
					if(!isBroadServeyStarted){
						isBroadServeyStarted = true;
					}
					
					extendSession();
				}
				// if error code is for logout due to inactivity
				else if(jsonObj.Error.ErrorCode == 'U1167') {
					//show popup
					/* _alert({
						divId:		'dialog-message',
						title:		'Alert!',
						message:	MSG_FORCE_LOGOUT
					}, function(){
						
					}); */
					//save values for later use
					setLocalStorageItem("LoggedOutOfUserInactivity", true); //for showing popup on login screen
					setSessionStorageItem("GetClassStatusErrorCode", jsonObj.Error.ErrorCode);
					var sCurTab = getSessionStorageItem("currentTab");
					
					switch (sCurTab.toLowerCase()) {
						case 'library':
							try{ document.getElementById('wrapperFrame').contentWindow.SaveLibraryBeforeLogout();}catch(e){}
						break;
						case 'notebooks':
					 		try{ 
							   document.getElementById('wrapperFrame').contentWindow.SaveLibraryBeforeLogout();
							}
							catch(e){}
						break;
						case 'assignments':
					 		try{ 
							   document.getElementById('wrapperFrame').contentWindow.SaveAssignmentBeforeLogout();
							}
							catch(e){}
						break;
						default :
						callLogout();
					}
				}
				else {
					alert(jsonObj.Error.ErrorUserDescription);
				}
			}else{
				alert(jsonObj.Error.ErrorUserDescription);
			}
			/* end force logout */
		}
	}
}

/* 
  * ILIT-657
  * save previous frame  
*/
function retainEbookBroadcast() {	
	if (
		$('.broadcastOverlay #broadcastFrame').attr('src').indexOf('ebookplayer') > -1		 
	){
		sessionStorage.removeItem('PdfBroadcastJson');
		if(typeof document.getElementById('broadcastFrame').contentWindow.setLibraryProgress == 'function'){
			setSessionStorageItem('EBookPlayerSrc', $('.broadcastOverlay #broadcastFrame').attr('src'));
			try { window.frames["broadcastFrame"].setLibraryProgress(); } catch(e) { console.log(e); }
		}
	}
}

/* 
  * ILIT-657
  * save previous frame for pdf
*/
function retainPdfBroadcast(oPdfBroadcast) {
	try {
		var currentActionData = JSON.parse((JSON.parse(oPdfBroadcast)).Content.CurrentActionData),
			fullURLArr = currentActionData.MediaFullURL.split('|||'),
			bookFormat = fullURLArr[5];
		
		if (bookFormat.toLowerCase() == 'pdf') {
			sessionStorage.removeItem('EBookPlayerSrc');
			setSessionStorageItem('PdfBroadcastJson', oPdfBroadcast);	
		}
	} catch (e) { console.log(e); }
}

/* function for accessibility in survey */

function surveyAccessibility(){
	
	DisableElements ='';
	DisableElementsAriaHidden='';
	
	var firstitem = $('.surveyOverlay .question_box_space .question_part li:first');
	var last = $('.surveyOverlay .question_box_space .question_part li:last');
	var buttonSubmit =  $('.surveyOverlay .question_box_space #btnSurveySubmit');
	var firsttime = true;

	var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
	
		var wrapperBody = $('#wrapperFrame').contents().find('body');

		 DisableElements = $(wrapperBody).find(':not([aria-hidden="true"])');
		 DisableElementsAriaHidden = $(wrapperBody).find('[aria-hidden="false"]');
		$.each(DisableElements, function(index, item) {
			$(item).attr('aria-hidden',true);
		});

		

		$('.wrapper').find('footer').attr('aria-hidden',true);

		if(isSafari){
			$('#dynamicTextForSR').attr('aria-hidden',false); 
			$('#dynamicTextForSR').attr('aria-live','assertive');
			
	
		}

		setTimeout(function(){
			$('.surveyOverlay .question_box_space .question_part li:first').focus();
			
		},1000)
	

	$('.surveyOverlay .question_box_space .question_part li').on({

	'keydown':function(objEvent){
		objEvent = objEvent || window.event;
		var iKey = objEvent.keyCode;

			if (iKey == 32 || iKey == 13){
				$(this).trigger('click');
			}
		 },
	'focus' : function(){
		if(($(this) !== firstitem) && $(this).hasClass('active')){
			var optiontext ='';
			if(isSafari) {
				 
				if($(this).text()){
					optiontext = $(this).text().slice(0, 1)+' '+$(this).text().slice(1);
				}	
				
			}
			else{
				$('#dynamicTextForSR').attr('aria-live','polite');
			}
			
			setTimeout(function(){
				$('#dynamicTextForSR').text(optiontext+' already Selected');  //ILIT-5088
			},500)
		}
	}

	})

	$('.surveyOverlay .question_box_space .question_part li:first').off('focus blur').on({
	
	'focus':function(){
		var optiontext ='';
		var onlyforSafari ='';
		
		if(isSafari) {
			// $('#dynamicTextForSR').attr('aria-live','assertive');
			if($(this).text()){
				optiontext = $(this).text().slice(0, 1)+' '+$(this).text().slice(1);
			}
			
			if(firsttime){
				onlyforSafari = 'Enter '+ $('.surveyOverlay .surveyInner .surveyHeader').text() +' Dialog , ';
				console.log('header name',onlyforSafari);
				firsttime =false;
			}
			
		}
		else{
			$('#dynamicTextForSR').attr('aria-live','polite');
		}
		
		var read = $('.surveyOverlay .question_box_space .new_assignment_title').text();
		var active='';
		if($(this).hasClass('active')){
			active = 'already Selected';
		}
		

		setTimeout(function(){
			$('#dynamicTextForSR').text(onlyforSafari+''+optiontext +' '+active+' Question is '+read);  //ILIT-5088
		},1000)
	  },

	'blur' : function(){
		// $('#dynamicTextForSR').attr('aria-live','assertive');
	 },

	 'keydown' : function(objEvent){
		objEvent = objEvent || window.event;
		var iKey = objEvent.keyCode;
		
		if(objEvent.shiftKey && iKey == 9){   
				console.log('focus in first element');
				if($('.submitSurveyMsg').is('visible')){
					if(typeof handleTab  !== "undefined"){
						handleTab(objEvent,$(this),$(this),$(last));
			        }
			    }
				else{
					if(typeof handleTab  !== "undefined"){

					   handleTab(objEvent,$(this),$(this),$(buttonSubmit));
					
				   }
				}
			   
			
	     	}
     	}
   })


   
   $('.surveyOverlay .question_box_space #btnSurveySubmit').on('keydown',function(e){
			if(typeof handleTab  !== "undefined"){
				handleTab(e,$(this),firstitem,$(this));
			}
    })   

	
}

/* function to show survey question */
function showSurvey(json, surveyType)
{
	$('.surveyOverlay .question_box_space .question_part').html('');
	var actionDataJson = json;
	var alphabetHex = 65;

	 lastActiveElm = document.activeElement;
	
	$('.surveyOverlay .question_box_space .new_assignment_title').html(actionDataJson.content.trim()); // Question
	$('.surveyOverlay .surveyInner .surveyHeader').text('Survey');
	if (surveyType == "AdHocPoll") {
		$('.surveyOverlay .surveyInner .surveyHeader').text('Poll');
	}

	var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

	if(!isSafari){
	    $('.surveyOverlay .surveyInner').attr('role','dialog');
	}
	
	for(var j = 0; j < actionDataJson.answers.length; j++)
	{
		var answersJson = actionDataJson.answers[j];
		var ansHTML = '<li isCorrect="' + answersJson.is_correct + '" tabindex="0" role="menuitem">';  //ILIT-5094 && ILIT-5095
			ansHTML+= '<div class="check_box_view sprite left"></div>';
			ansHTML+= '<div class="answer_key left">&#' + alphabetHex + ';</div>';
			ansHTML+= '<div class="middle">' + answersJson.answer_text_html + '</div>';
			ansHTML+= '<div class="clear"></div>';
			ansHTML+= '</li>';
			
			$('.surveyOverlay .question_box_space .question_part').append(ansHTML);
			alphabetHex++;
	}
}

/* function to bind submit button on survey screen */
function bindSurveyScreen(surveyType)
{
	
	$('.surveyOverlay .question_box_space .question_part li').unbind('click').bind('click', function(e){
		$('.surveyOverlay .question_box_space #btnSurveySubmit').removeClass('inactive');
		$('.surveyOverlay .question_box_space .question_part li').removeClass('active');
		$(this).addClass('active');
		$('#dynamicTextForSR').attr('aria-live','assertive');
		var optiontext ='';
		if($(this).text()){
			optiontext = $(this).text().slice(0, 1)+' '+$(this).text().slice(1);
		}
		setTimeout(function(){
			$('#dynamicTextForSR').text(optiontext+' list item has been selected');
		},200)

		//send Activity for Click
		fCallLogUserActivity(e);		
		
	});

	$('.surveyOverlay .question_box_space #btnSurveySubmit').addClass('inactive');

	$('.surveyOverlay .question_box_space #btnSurveySubmit').unbind('click').bind('click', function(e) {
		
		//ILIT-5334
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			fCallLogUserActivity(e); 
		}

		if($(this).hasClass('inactive')) {
			alert('Please select at least one option');	
		} else {
			var checkBoxIndex = parseInt($('.surveyOverlay .question_box_space .question_part li').index($('.surveyOverlay .question_box_space .question_part li.active')));
			var selectedOption = String.fromCharCode(parseInt(selectedOptionAlphabetHexStart + checkBoxIndex));
			$('.surveyOverlay .question_box_space .question_part li').unbind('click')
			                                                         .attr({'aria-disabled':true,'disabled':true});
			$('.surveyOverlay .question_box_space #btnSurveySubmit').unbind('click');
			var groupId = getSessionStorageItem("classGroupId");
			try { window.frames["wrapperFrame"].SetSurveyForStudent(surveyQuesID,surveyQuesAction,surveyQuesInfo,selectedOption,surveyType,groupId); } catch(e) { console.log(e); }
			$('.surveyOverlay .question_box_space #btnSurveySubmit').hide();
			$('.submitSurveyMsg').show();
			$('#dynamicTextForSR').attr('aria-live','assertive');
			$('#dynamicTextForSR').text('submitted successfully');
			var firstitem = $('.surveyOverlay .question_box_space .question_part li:first');
			var last = $('.surveyOverlay .question_box_space .question_part li:last');
			setTimeout(function(){			
				$(firstitem).focus();		
			},500)

			$(last).on('keydown',function(e){
				handleTab(e, $(this), firstitem,last);
			})
			
			
		}
	});

	surveyAccessibility();

	$('.wrapper').attr("role", "main")
	
}

/* function to close survey question */
function closeSurvey()
{
	
	if(surveyQuesID != '' && surveyQuesInfo != ''){

		surveyQuesID = '';
		surveyQuesInfo = '';


		$.each(DisableElements, function(index, item) {
			$(item).removeAttr('aria-hidden');
		});

		if(DisableElementsAriaHidden != undefined && DisableElementsAriaHidden != ''){
			$.each(DisableElementsAriaHidden, function(index, item) {
				$(item).attr('aria-hidden',false);
			});
		}

		$('.wrapper').find('footer').removeAttr('aria-hidden');

		setTimeout(function(){
			$(lastActiveElm).focus();
		},1000)
		
		// log survey end activity for force logout
		logActivityForFL("survey-end");		
		
	}
	$('.surveyOverlay').slideUp(300);
}

/*
* Log activity in force logout array 
*/
function logActivityForFL(eventType) {
	var oUserActivity = new Object;
		oUserActivity.VerbValue = '',
		oUserActivity.ActivityID = '',
		oUserActivity.EventTimeStamp = getCurrentTimestamp(),
		oUserActivity.CallerUserID = '',
		oUserActivity.EventType = eventType,
		oUserActivity.VerbID  = '', 
		oUserActivity.CallerClassID = '',
		oUserActivity.OtherKeysAndValues  = '';
	
	aUserActivities.push(oUserActivity);		
}

function closeBuzz (piBuzzId) { // IPP-4099
	var iBuzzId = (piBuzzId || localStorage.getItem('buzzId')) || 0,
		iStudentId = getSessionStorageItem("userID"),
		oClosedBuzzList = JSON.parse(localStorage.getItem('closedBuzzList') || '{}');
	
	if (iBuzzId.length > 0) {
		if (oClosedBuzzList[iStudentId] === undefined) {
			oClosedBuzzList[iStudentId] = iBuzzId;
		}
		localStorage.setItem('closedBuzzList', JSON.stringify(oClosedBuzzList));
	}
	
	objUtility.hidePopUp();
	if(iBuzzId && objUtility.Popupsiblings != undefined && objUtility.Popupsiblings != null){
		
		objUtility.Popupsiblings.each(function(){
			$(this).removeAttr('aria-hidden');
		})

		objUtility.Popupsiblings=null;

	}

	$('#dynamicTextForSR').attr({'aria-live':'assertive','aria-hidden':true});
}

function closeBroadcast(bNonEbookOn)
{
	var bNonEbookOn = bNonEbookOn ? bNonEbookOn : false;
	
	if(!broadcastEbookVisible) {
		broadcastVisible = false;
		
		/* ILIT-657 reload previous ebookplayer or pdf */		 
		var eBookPlayerSrc = getSessionStorageItem('EBookPlayerSrc');
		var oPdfBroadcastJson = getSessionStorageItem('PdfBroadcastJson');
		
		// empty frame
		$('.broadcastOverlay').slideUp(300, function() {
			if ($('.broadcastOverlay #broadcastFrame').attr('src') != '') {
				$('.broadcastOverlay #broadcastFrame').attr('src' , '');
				// log broadcast end activity for force logout
				logActivityForFL("broadcast-end");				
			}
			broadcastImage = '';
			broadcastAssignment = '';
			setSessionStorageItem('isAssignmentBroadcastON', 'N');
		});
		
		// if eBook was open then reload it
		if (eBookPlayerSrc && !bNonEbookOn) {
			broadcastEbookVisible = true;
			$('.broadcastOverlay').slideDown(300, function() {
				$('.broadcastOverlay #broadcastFrame').attr('src' , eBookPlayerSrc).on('load',function(){
					if ($('#broadcastFrame').contents().find(".sld_lft").length > 0){
						$("#broadcastFrame .sld_lft").removeClass('disabled');
					}
				})
				broadcastImage = '';
				broadcastAssignment = '';
				setSessionStorageItem('isAssignmentBroadcastON', 'N');
			});
			
		}
		else if (oPdfBroadcastJson && !bNonEbookOn) {	
			broadcastEbookVisible = true;
			// if pdf was open then reload it
			checkClassStatusCallBack(oPdfBroadcastJson);			
		}
		
	} else {
		//when eBook broadacst ends the enable the back button at student end
		if($('#pdfReaderBackBtn').prop('disabled')) {
			$('#pdfReaderBackBtn').prop('disabled', false);
		}
		if($('.broadcastOverlay .topBar').is(':visible')) {
			$('.broadcastOverlay .topBar #broadcastBackBtn').prop('disabled',false);
		} else {
			try {
				window.frames["broadcastFrame"].onBroadcastEnd();
			} catch(e) {}
		}
	}
}

function bindPDFReaderBackBtn() {	
	$('#broadcastBackBtn').unbind('click').bind('click', function(e) {
		var bookPDFInfo = (getSessionStorageItem('bookInfoPDFObj') == null) ? '' : getSessionStorageItem('bookInfoPDFObj');
		setSessionStorageItem('BookID', bookInfoPDFBroadcastObj.bookID);
		bookInfoPDFBroadcastObj.isBroadCast = true;
		saveLibProgress(bookInfoPDFBroadcastObj);
		launchPDFReader(bookPDFInfo);
		$('.broadcastOverlay').slideUp(300, function() {
			broadcastEbookID = '';
			broadcastEbookVisible = false;
			$('.broadcastOverlay #broadcastFrame').attr('src' , '');
			$('.broadcastOverlay .topBar .middle').html('');
			bookInfoPDFBroadcastObj = {};
		});
	});
	
	$('#pdfReaderBackBtn').unbind('click').bind('click', function(e) {

		//ILIT-5957
		if (!navigator.onLine) {
			_NO_INTERNET_ALERT = true; 
			
			if (typeof window.frames["wrapperFrame"].networkErrorAlert == "function") {
				window.frames["wrapperFrame"].networkErrorAlert(false); // hide html alert			
			}
			
			_alert({
					divId:		'dialog-message',
					title:		'Alert!',
					message:	_c_s_NO_INTERNET_MSG
				}, function(){
					
			},"no-button");
			$(".ui-widget-overlay.ui-front").css("z-index", "1111");
			return;
		}
		//End ILIT-5957
		
		//ILIT-5334
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			fCallLogUserActivity(e); 
		}

		//ILIT-5391
		setSessionStorageItem('isPdfOpen','N');

		bookInfoPDFObj.isBroadCast = false;
		saveLibProgress(bookInfoPDFObj);
		if(bookInfoPDFObj.context == '') {
			/* (isiLit20() === true)?
			$('.footer_in button').eq(1).trigger('click'):
			$('.footer_in button').eq(0).trigger('click'); */
			$('.footer_in button').eq(1).trigger('click');
		}
		$('.pdfReaderOverlay').hide();
		$('.pdfReaderOverlay .pdfReaderWrapper #pdfReaderFrame').attr('src' , '');
		$('.pdfReaderOverlay .topBar .middle').html('');
		removeSessionStorageItem('bookInfoPDFObj');
		if(broadcastEbookVisible && !sameCurrentPDFBroadcastPDF) {
			setSessionStorageItem('bookInfoPDFObj', JSON.stringify(bookInfoPDFObj));
		}
		if(sameCurrentPDFBroadcastPDF) {
			removeSessionStorageItem('bookInfoPDFObj');
			broadcastEbookID = '';
			broadcastEbookVisible = false, sameCurrentPDFBroadcastPDF = false;
		}
		bookInfoPDFObj = {};
	});
}

function checkLogout() {
	_alert({
				divId:		'dialog-message',
				title:		'Alert!',
				message:	"Do you want to logout?"
			}, function(){
				$('.loader').show();	
				if(INDEXEDDBSUPPORT) {
					clearCachedData(STUDNTDBNAME,callLogout);
				} else {
					callLogout();
				}
			},
			'cancel-yes'
		);	
}
// CLAS-63 - ILIT-6561
// function callLogout(){
function callLogout(option = ''){
// End of CLAS-63 - ILIT-6561
	/* create log Start */
	//to log data
	currEventTimeStamp = getCurrentTimestamp();
	setSessionStorageItem("eventStartTime", getTimeInMs());
	setSessionStorageItem("eventTimeStamp", currEventTimeStamp);
	setSessionStorageItem("verbID", "LO");
	
	//setSessionStorageItem("connectStatus", "false");
	//changeConnectStatus();
	// for sending log 
	var endTime = getTimeInMs();
	var verbVal = endTime- getSessionStorageItem("eventStartTime");
	var eventTimeStamp = getSessionStorageItem("eventTimeStamp");
	var verbID = getSessionStorageItem("verbID");

	// CLAS-63 - ILIT-6561
	//createLog(verbID, verbVal, eventTimeStamp);
	if(option != 'ForcedLogoutIdleTimeLimitStudent'){
		createLog(verbID, verbVal, eventTimeStamp);
	}
	// End of CLAS-63 - ILIT-6561

	/* create log End */
	var classID = getSessionStorageItem("classID");
	var userID = getSessionStorageItem("userID");
	var postObj = {
					TokenID: TOKENID,
					DeviceTimeStamp: getCurrentTimestamp(),
					CallerUserID: userID,
					CallerClassID: classID
				};
	var url = SERVICEBASEURL + "Logout";
	AjaxCall(url, "POST", postObj, sp_callLogout);
}

function sp_callLogout(data)
{ 
	var jsonObj = JSON.parse(data);
	if(jsonObj.Status == 200)
	{	
		var GetClassStatusErrorCode = getSessionStorageItem("GetClassStatusErrorCode") ;
		localStorage.setItem('ExpiryErrCode',GetClassStatusErrorCode);	
		clearSessionStorage();
		//window.location.reload(true);
		if(getLocalStorageItem("rumbaTicketID")) {
			removeLocalStorageItem("rumbaTicketID");
			// CREATE NEW IMG ELEMENT AND PASS LOGOUT URL ONTO THE SOURCE.
			(function(){
				(new Image()).src = SSOLOGOUTURL + "?url=" + window.location.origin + window.location.pathname;
			})();
		}

		window.location.href = window.location.origin + window.location.pathname;		
	}
	else
	{
		alert(jsonObj.Error.ErrorUserDescription);
	}
	   
}

function changeConnectStatus() {
	if(sessionStorage.getItem("connectStatus") == 'true') {
		$('#connectStatus').addClass('active');
	} else {
		$('#connectStatus').removeClass('active');
	}
}

var objUtility = new (function () {
	var oSelf = this,
		sLoaderId = null,
		bLoaderShown = false;
	this.getRandomNumberBetween = function (iNumberFrom, iNumberTo) {
		return Math.floor(Math.random() * (iNumberTo - iNumberFrom + 1) + iNumberFrom);
	};
	this.getRandomNumber = function (iDigits) {
		var iRandom = 0;
		if (
			typeof iDigits == 'undefined' ||
			iDigits == null
		) {
			iDigits = 1;
		}
		do {
			iRandom = Math.round(Math.random() * Math.pow(10, iDigits));
		} while (iRandom < Math.pow(10, iDigits - 1));
		return iRandom;
	};
	this.showPopUp = function (oConfig) {
		if (bLoaderShown) {
			return false;
		}
		if (
			typeof sLoaderId == 'undefined' ||
			sLoaderId == null
		) {
			sLoaderId = 'custom-loader-' + this.getRandomNumber(4);
		}
		var oStyleInfo = {
				'height':		jQuery(window).height() + 'px',
				'width':		jQuery(window).width() + 'px',
				'position':		'fixed',
				'z-index':		99999,
				'display':		'none',
				'left':			'0px',
				'top':			'0px',
				'text-align':	'center'
			},
			sStyle = '',
			dHeight = 150,
			dWidth = 350,
			dTop = Math.ceil(($(window).height() - dHeight) / 2),
			dLeft = Math.ceil(($(window).width() - dWidth) / 2),
			sBoxStyle = '';
			
		if (
			typeof oConfig	== 'undefined' ||
			oConfig == null
		) {
			oConfig = {
				'message': 			'Loading. Please wait&hellip;',
				'background-color':	'CDCDCD',
				'foreground-color':	'CDCDCD',
				'click-to-hide':	true
			};
		}
		else {
			if (
				typeof oConfig['message'] == 'undefined' ||
				oConfig['message'] == null
			) {
				oConfig['message'] = 'Loading. Please wait&hellip;';
			}
			if (
				typeof oConfig['background-color'] == 'undefined' ||
				oConfig['background-color'] == null
			) {
				oConfig['background-color'] = 'CDCDCD';
			}
			else {
				var sRegex = /^#{0,}([A-F0-9a-f]{3,3}|[A-F0-9a-f]{6,6})$/;
				if (!sRegex.test(oConfig['background-color']) && oConfig['background-color'] != 'none') {
					oConfig['background-color'] = 'CDCDCD';
				}
			}
			
			if (
				typeof oConfig['foreground-color'] == 'undefined' ||
				oConfig['foreground-color'] == null
			) {
				oConfig['foreground-color'] = oConfig['background-color'];
			}
			else {
				var sRegex = /^#{0,}([A-F0-9a-f]{3,3}|[A-F0-9a-f]{6,6}|none|transparent)$/;
				if (!sRegex.test(oConfig['foreground-color'])) {
					oConfig['foreground-color'] = oConfig['background-color'];
				}
			}
			
			if (typeof oConfig['click-to-hide'] != 'boolean') {
				oConfig['click-to-hide'] = true;
			}
			if (typeof oConfig['opacity'] != 'number') {
				oConfig['opacity'] = 0.3;
			}
			else if (parseFloat(oConfig['opacity']) < 0 || parseFloat(oConfig['opacity']) > 1) {
				oConfig['opacity'] = 0.3;
			}
		}
		
		if (typeof oConfig['box-style'] == 'object') {
			for (var sProp in oConfig['box-style']) {
				if (sProp == 'height') {
					dHeight = oConfig['box-style'][sProp].replace('px', '');
					dTop = Math.ceil(($(window).height() - parseFloat(dHeight)) / 2);
					continue;
				}
				if (sProp == 'width') {
					dWidth = oConfig['box-style'][sProp].replace('px', '');
					dLeft = Math.ceil(($(window).width() - parseFloat(dWidth)) / 2);
					continue;
				}
				sBoxStyle = sBoxStyle + (sBoxStyle.length > 0? ' ': '') + sProp + ':' + oConfig['box-style'][sProp] + ';'
			}
			if (typeof oConfig['box-style']['background'] == 'undefined') {
				sBoxStyle = sBoxStyle + ' background-color:#' + oConfig['foreground-color'] + ';';
			}
			if (typeof oConfig['box-style']['border-radius'] == 'undefined') {
				sBoxStyle = sBoxStyle + ' border-radius:20px;';
			}
		}
		else {
			sBoxStyle = sBoxStyle + ' background-color:#' + oConfig['foreground-color'] + '; border-radius:20px;';
		}
		
		oConfig['background-color'] = oConfig['background-color'].replace('#', '');
		
		jQuery('.custom-loader').remove();
		for (var sProp in oStyleInfo) {
			sStyle = (sStyle.length? ' ': '') + sStyle + sProp + ':' + oStyleInfo[sProp] + ';';
		}
		sStyle = sStyle + ' opacity:' + oConfig['opacity'] + '; filter:alpha(opacity=' + (oConfig['opacity'] * 100) + ');';
		jQuery('body').append(
			'<div class="custom-loader" id="' + sLoaderId + '" style="background-color:#' + oConfig['background-color'] + '; ' + sStyle + '"></div>\
			<div style="text-align:center; color:#000; z-index:' + (oStyleInfo['z-index'] + 1) + '; position:fixed; left:' + dLeft + 'px; top:' + dTop + 'px; width:' + dWidth + 'px; height:' + dHeight + 'px; line-height:' + dHeight + 'px;' + sBoxStyle + '" id="' + sLoaderId + '-content">\
				' + oConfig['message'] + '\
			</div>'
		);
		jQuery('#' + sLoaderId).show();
		if (typeof oConfig['after-load'] == 'function') {
			oConfig['after-load'].call(oSelf,sLoaderId + '-content');
		}
		bLoaderShown = true;
		if (oConfig['click-to-hide']) {
			jQuery('#' + sLoaderId)
				.off('click tap')
				.on('click tap', function () {
					oSelf.hidePopUp();
				})
		}
		return false;
	};
	this.isLoaderShown = function () {
		return bLoaderShown;
	};
	this.hidePopUp = function () {
		if (jQuery('#' + sLoaderId).length > 0) {
			jQuery('#' + sLoaderId).fadeOut('fast', function () {
				jQuery(this).remove();
				jQuery('#' + sLoaderId + '-content').remove();
			});
			bLoaderShown = false;
		}
	};
})();

// for book review
function openPage (poElement) {
	//var $this = $(poElement),
		//sParam = $this.data('param'),
		var dWindowHeight = $(window).height() - 5; // 5: Found by inspection
	
	//$this.parent().parent().hide();
	
	/*==== Show Loader ====*/
//	$('.wrapper').hide();
	$('.bookReviewWrapper').css({
		'width':	'100%',
		'height':	dWindowHeight
	});
	$('.bookReviewWrapper .loader')
		.css({
			'width':		'100%',
			'height':		dWindowHeight,
			'line-height':	dWindowHeight + 'px',
			'text-align':	'center',
			'background':	'none',
			'display':		'block'
		})
		.html('<img src="media/ajax_loader_gray_512.gif" width="64" alt="" />');
	$('.bookReviewWrapper').show();
	/*== End Show Loader ==*/
	$('#bookReviewFrame')
		.css({
			'width':		'100%',
			'height':		dWindowHeight,
			'display':		'none'
		})
		.attr('src', 'App/book_review.html')
		.load(function () {
			$('.bookReviewWrapper .loader').removeAttr('style');
			$(this).show();
			
			// Resize IFrame
		});
		//add active class	
		var sCurTab = getSessionStorageItem("currentTab");
		if(sCurTab != "review"){
			$("#footer-btn-cont").find("."+sCurTab.charAt(0).toUpperCase() + sCurTab.slice(1)).addClass("active").trigger("click");
		}
		$("#footer-btn-cont .Review").removeClass("active");
}

function bindDistrictEvents(){
	$(".help").off("click tap").on("click tap", function(){
		if($(".tooltiptext").css('display') =='none'){
			$(".tooltiptext").show();
			$(this).attr({'aria-describedby':'tip', 'aria-expanded':true});
		}
		else{
			$(".tooltiptext").hide();
			$(this).attr('aria-expanded',false).removeAttr('aria-describedby');
		}
		
	});
	
	





	
	//hide information popup upon escape key
	 $(".help").off('keydown').on('keydown', function(e){
		 if(e.keyCode == '27' && $(".tooltiptext").css('display') !=='none'){
			$(".tooltiptext").hide();
			$(this).attr('aria-expanded',false).removeAttr('aria-describedby');
		 }
	})
}

function selectLastDistrictAndUser(){
	var oLastLoginDetailsForStud = JSON.parse(getLocalStorageItem("lastLoginDetailsForStud"));
	if(oLastLoginDetailsForStud !== null){
		$("#districtDDL option").each(function(){
			if($(this).attr("value") == oLastLoginDetailsForStud.lastDistrictID){
				$(this).prop("selected", true).html($(this).text().trim());
			}
		})
		//ILIT-373
		//$("#txt_UserName").attr("value", oLastLoginDetailsForStud.lastUser);
	}
}