/**
 * Instructor View Connect JS
 * @class ConnectView
 * @module Connect
 * @constructor
 */
readOnlyAccessForInPollCoTeacher = null,
readOnlyAccessInBuzzForCoTeacher = null;

var ConnectView = function () {	
	this.model = null;
	this.viewType = null;	
};

var studentBuzzIds = [{
	"buzzId": "",
	"studentId":""
}]

/**
 * Initialize Connect Model
 * @method init
 * @param {object} model
 * @return 
 */
ConnectView.init = function (model) {
	var oSelf = this;
    oSelf.model = model;
	
	if (oSelf.model.ConnectData == 'poll') {
		oSelf.viewType = new PollView(model);
		oSelf.viewType.init();
	}else{
		oSelf.viewType = new BuzzView(model);
		oSelf.viewType.init();
	}
	
	//ILIT-1247 : disable browser back button 
	disableBrowserBackButton();
};

/**
 * CloseWebView function called
 * @method closeConnectWindow
 * @return 
 */
ConnectView.closeConnectWindow = function (oSelf) {
	HideNativeBottomBar(false);
	if ( oPlatform.isDevice() || oPlatform.isChromeApp() ) {
		CloseWebView();
	}
	else {
		CloseConnectWindow();
	}
}


/**
 * View Type Poll
 * @class PollView
 * @module PollView
 * @constructor
 */
var PollView = function (model) {	
	this.model = model;
	this.sendPollView = null;
	this.bNextBttnEnabled = false;
};
PollView.prototype = new ISeriesBase();
/**
 * Initialize PollView
 * @method init 
 * @return 
 */
PollView.prototype.init = function () {
	var oSelf = this;
	  $.nativeCall({
        'method': 'GetAppProductDetailsInfo',
        'globalResource': 'objProductDetailJsonData',
        'checkSuccess': function (poServiceResponse) {
            return poServiceResponse.productCode != undefined;
        },
        'onComplete': function () {
            if (objProductDetailJsonData !== null) {
				/*== delete instance if any ==*/	
			if (oSelf.sendPollView != null) {
				oSelf.sendPollView = null;
				delete oSelf.sendPollView;
			}
			oSelf.bNextBttnEnabled = false;
			oSelf.getSessionGrp();
			
            }
        }
    });
	
}

/**
 * GetPollList Service Call PollView
 * @method getPollList
 * @return 
 */
 PollView.prototype.getSessionGrp = function () {
	var oSelf = this;
  	$.nativeCall({
    	'method': 'GetSessionGroup',
        'globalResource': 'objGetGroupJsonData',
		'interval':			500,
		'breakAfter':		125000,
		'debug':			false,
		'checkSuccess': function (oResponse) {
		if(oResponse){
			return true;
		};
		},
        'onComplete': function(result){
			
        oSelf.getPollList();	
        }
	});		
 
 }
 

			
			
PollView.prototype.getPollList = function () {
	var oSelf = this,
		oLoaderImg = '<div style=" font-size: 13px;"><img src="media/loader.gif" style="margin-bottom: 15px;"><br />LOADING</div>';
	
	objPollListData = null; // reset		
	
	/*== show loader ==*/
	$('body').css('background-color','#FFFFFF');
	Application.mainContainer.css({'text-align':'center', 'top' : '45%', 'left': '50%', 'position' : 'absolute'}).html(oLoaderImg);
				
	$.nativeCall({
		'method':			'GetPollList',
		'globalResource':	'objPollListData',
		'interval':			500,
		'breakAfter':		125000,
		'debug':			false,
		'onComplete':		function () {			
			/*== hide loader ==*/
			Application.mainContainer.removeAttr('style');
			Application.mainContainer.html(GENERAL.c_s_SPECIAL_CHARACTERS_BLANK);
			$('body').css('background-color','#E0E1E1');
					
			oSelf.render();
			oSelf.bindEvents();
		}
	});	
	
}

/**
 * Render PollView
 * @method render 
 * @return 
 */
PollView.prototype.render = function () {
	/**** Read-Only for Co-Teacher(ILIT-2849): Disable Poll for Co-Teacher ****/
	//readOnlyAccessForInPollCoTeacher = '';
	if (
		objProductDetailJsonData.userRoleInClass == GENERAL.c_s_USER_TYPE_CO_TEACHER && 
		(objGetGroupJsonData.groupId == "" || !objGetGroupJsonData || typeof objGetGroupJsonData.groupId == undefined)
	){
		readOnlyAccessForInPollCoTeacher = 'disabled';
	}
	else{
		readOnlyAccessForInPollCoTeacher = '';
	}
	
	
	
	var oSelf = this,
		oFormData = {
			"pollID": GENERAL.c_s_SPECIAL_CHARACTERS_BLANK
		};
	
	/*== render main template ==*/
	Application.mainContainer.html(_.template($("#pollMainTemplate").html()));
	
	/*== render header ==*/
	$("#headerpanel").html(
		_.template($("#pollHeaderTemplate").html())
	);
	
	/*== render poll list ==*/
	$("#pollList").html(
		_.template($("#pollListTemplate").html(),{
			data : objPollListData.Content
		})
	);
	
	/*== render poll form ==*/
	$("#pollForm").html(
		_.template($("#pollFormTemplate").html(),{
			data : oFormData
		})
	);
	
	setTimeout(function () {
		oSelf.resize();
	}, 100);
		
}

/**
 * Bind Events PollView
 * @method bindEvents 
 * @return 
 */
PollView.prototype.bindEvents = function () {
	var oSelf = this,
		sInputVal = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;

	$("#bttnCloseConnect").off("click tap").on("click tap", function (e) {
		//ILIT-5533
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		ConnectView.closeConnectWindow();
	});
	
	$("#cancelBttn").off("click tap").on("click tap", function (e) {
		//ILIT-5533
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		oSelf.cancelEdit.call(this, oSelf);
	});
	
	$("#questionBox").off("keyup input").on("keyup input", oSelf.submitEnable);
	
	//ILIT-5533
	$('#questionBox').donetyping(function(){
		if($(this.target).hasClass("valid-activity") || $(this.currentTarget).hasClass("valid-activity")){			
			callLogUserActivity(this);			
		}
		oSelf.submitEnable;
	},1000,null);
	
	$("input.poll-option").off("keyup input").on("keyup input", oSelf.submitEnable);
	
	//ILIT-5533
	$('input.poll-option').donetyping(function(){
		if($(this.target).hasClass("valid-activity") || $(this.currentTarget).hasClass("valid-activity")){			
			callLogUserActivity(this);			
		}
		oSelf.submitEnable;
	},1000,null);
	
	$(".addInputBox").off("click tap").on("click tap", function (e) {
		/**** Read-Only for Co-Teacher(ILIT-2849): Disable '+' button in Poll for Co-Teacher ****/
		if(readOnlyAccessForInPollCoTeacher =="disabled"){
			return;
		}
		//ILIT-5533
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		oSelf.appendInputBox.call(this, oSelf, sInputVal); 
	});
	
	$(".removeInputBox").off("click tap").on("click tap", function (e) {
		/**** Read-Only for Co-Teacher(ILIT-2849): Disable 'Remove' button in Poll for Co-Teacher ****/
		if(readOnlyAccessForInPollCoTeacher =="disabled"){
			return;
		}
		//ILIT-5533
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		oSelf.appendInputBox.call(this, oSelf, sInputVal); 
	});
	
	$(".poll-name").off("click tap").on("click tap", function (e) {
		//ILIT-5533
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		oSelf.getPollInfo.call(this, oSelf); 
	});
	
	$(".delete_icon").off("click tap").on("click tap", function (e) {
		//ILIT-5533
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		var oElem = this
		oSelf._confirm({		
			'title':	'Are you sure?',
			'divId':	'dialog-message',
			'message':	CONNECT.c_s_CONFIRM_DELETE_MSG,
			'yes': function(){
				oSelf.deletePollInfo.call(oElem, oSelf);
			}
		});		 
	});
	
	/*== Next Button Click ==*/
	$("#nextBttn").off('click').on('click', function (e) {
		/**** Read-Only for Co-Teacher(ILIT-2849): Removing the submit button action in Poll for Co-Teacher ****/
		if(readOnlyAccessForInPollCoTeacher =="disabled"){
				return;
		}
		//ILIT-5533
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		oSelf.submitPoll.call(this, oSelf);
	});
}

/**
 * DeletePollInfo Service Call PollView
 * @method deletePollInfo
 * @return 
 */
PollView.prototype.deletePollInfo = function (oSelf) {
	var oElem = this,
		sPollId = $(oElem).attr('data-id'), 
		sTitle = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK, 
		sQuestion = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK, 
		sAnswers = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK, 
		bDeletePoll = 1;
	
	objUpdatePollResponse = null; // reset	
				
	$.nativeCall({
		'method':			'UpdatePoll',
		'inputParams':		[sPollId, sTitle, sQuestion, sAnswers, bDeletePoll],
		'globalResource':	'objUpdatePollResponse',
		'interval':			500,
		'breakAfter':		125000,
		'debug':			false,
		'onComplete':		function () {			
			if ($("#pollID").val() == sPollId)	{
				oSelf.clearForm();
			}
			$(oElem).closest(".poll-list-cont").remove();
		}
	});	
}

/**
 * GetPollInfo Service Call PollView
 * @method getPollInfo
 * @return 
 */
PollView.prototype.getPollInfo = function (oSelf) {
	var oElem = this,
		sPollId = $(oElem).attr('id');
	
	objPollInfoData = null; // reset	
				
	$.nativeCall({
		'method':			'GetPollInfo',
		'inputParams':		[sPollId],
		'globalResource':	'objPollInfoData',
		'interval':			500,
		'breakAfter':		125000,
		'debug':			false,
		'beforeSend':		function () {
			oUtility.showLoader({
				'message': '<img src="media/loader.gif" alt="loading" />',
				'background-color': 'none',
				'click-to-hide': false,
				'opacity': 0.5
			});
		},
		'onComplete':		function () {
			oUtility.hideLoader();
			oSelf.clearForm();
			oSelf.populateForm();
		}
	});	
}

/**
 * Populate Poll Form with Data PollView
 * @method populateForm
 * @return 
 */
PollView.prototype.populateForm = function () {
	var oSelf = this,
		oData = objPollInfoData.Content,
		oChoices = JSON.parse(decodeURIComponent(oData.PollChoices));		
	
	$(".pollview-form h2").text(CONNECT.c_s_EDIT_POLL_TITLE);
	$("#cancelBttn").show();
	$("#pollID").val(oData.PollID);
	$("#questionBox").val(CodeToSpecialChar(decodeURIComponent(oData.PollQuestion)));
	
	$.each(oChoices, function (k, choice) {
		if ($(".poll-option:eq("+k+")").length) {
			$(".poll-option:eq("+k+")").val(CodeToSpecialChar(choice));
		}
		else {
			oSelf.appendInputBox(oSelf, CodeToSpecialChar(choice));
		}
	});

	/**** Read-Only for Co-Teacher(ILIT-2849): Disable Poll-Option input Box in Poll for Co-Teacher ****/
	if(readOnlyAccessForInPollCoTeacher =="disabled"){
		$(".poll-option").attr('disabled','disabled');
	}
	oSelf.submitEnable();
	oSelf.resize();
}

/**
 * Cancel Edit PollView
 * @method cancelEdit
 * @param oSelf 
 * @return 
 */
PollView.prototype.cancelEdit = function (oSelf) {
	var oElem = this;
	
	$(oElem).hide();
	oSelf.clearForm();
}

/**
 * Clear Form PollView
 * @method clearForm 
 * @return 
 */
PollView.prototype.clearForm = function () {
	var oSelf = this,
		oFormData = {
			"pollID": GENERAL.c_s_SPECIAL_CHARACTERS_BLANK
		};
		
	/*== render poll form ==*/
	$("#pollForm").html(
		_.template($("#pollFormTemplate").html(),{
			data : oFormData
		})
	);
	oSelf.bindEvents();
	oSelf.resize();
	oSelf.bNextBttnEnabled = false;
}

/**
 * Append/Remove Input Box PollView
 * @method appendInputBox 
 * @return 
 */
PollView.prototype.appendInputBox = function (oSelf, sInputVal) {
	var oElem = this,
		oInputBox = $(".poll-option"),
		oForm = $(".pollview-form"),
		oNewInputBox = null,
		oBoxCont = null,
		oDiv = null,
		oNewAddBttn = null,
		oNewRemoveBttn = null,
		oNewRemoveBttnTxt = null;
		
	if ($(oElem).hasClass('addInputBox') && oInputBox.length == CONNECT.c_s_MAX_INPUT) {
		return;
	}
	
	if ($(oElem).hasClass('addInputBox') || sInputVal) {
		oBoxCont = document.createElement("div");
		oBoxCont.setAttribute("class","input-box-cont");
		
		oDiv = document.createElement("div");
		oDiv.setAttribute("class","text_box_area text_box_area_ct");
			
		/*== Delete Button ==*/
		oNewRemoveBttn = document.createElement("div");
		oNewRemoveBttn.setAttribute("class","right removeInputBox valid-activity");
		oNewRemoveBttnTxt = document.createTextNode("-");		
		oNewRemoveBttn.appendChild(oNewRemoveBttnTxt);		
		oBoxCont.appendChild(oNewRemoveBttn);
		
		/*== Add Button ==*/
		if (oInputBox.length < 3) {
			oNewAddBttn = document.createElement("div");
			oNewAddBttn.setAttribute("class","right addInputBox");
			oNewAddBttnTxt = document.createTextNode("+");		
			oNewAddBttn.appendChild(oNewAddBttnTxt);
			oBoxCont.appendChild(oNewAddBttn);
		}
		
		oNewInputBox = document.createElement("input");
		oNewInputBox.setAttribute("class","poll-option");
		oNewInputBox.setAttribute("autocomplete","off");
		oNewInputBox.setAttribute("autocorrect","off");
		oNewInputBox.setAttribute("autocapitalize","off");
		oNewInputBox.setAttribute("spellcheck","off");
		oNewInputBox.setAttribute("value",sInputVal);
		oDiv.appendChild(oNewInputBox);
		oBoxCont.appendChild(oDiv);
		
		oForm.append(oBoxCont);
		oSelf.bindEvents();
	}	
	else if ($(oElem).hasClass('removeInputBox')) {
		$(oElem).closest('.input-box-cont').remove();
	}
}

/**
 * Render PollView
 * @method resize 
 * @return 
 */
PollView.prototype.resize = function () {
	var fWindowHeight = $(window).height(),
		fHeaderHeight = $(".top_navbar").outerHeight(),
		fGappingHeight = (parseInt($(".view_assignment").css('padding-top')) * 2) + parseInt($(".view_assignment_container_part").css('margin-top')),
		fBottomBarHeight = $(".bottom_button_area").outerHeight(),
		oPollForm = $(".pollview-form"),
		fPaddingHeight = parseInt(oPollForm.css('padding-top')) * 2,
		fReadingHeaderHeight = $(".outside_reading_heading").outerHeight(),
		fPollListHeight = fWindowHeight - (fHeaderHeight + fGappingHeight + fReadingHeaderHeight + 10);		
	
	$("body").css("overflow","hidden");
	$(".content_space").height(fWindowHeight - (fHeaderHeight + fGappingHeight + 10));
	oPollForm.css('height',fWindowHeight - (fHeaderHeight + fGappingHeight + fBottomBarHeight + fPaddingHeight + 10));
	$(".outside_reading_cont_inner4poll").height(fPollListHeight);
	$(".outside_reading_cont_inner4poll").css({"max-height": fPollListHeight, "overflow-y": "auto"});
}

/**
 * PollView Enable Next Button
 * @method bindEvents 
 * @return 
 */
PollView.prototype.submitEnable = function () {
	/**** Read-Only for Co-Teacher(ILIT-2849): To keep Submit button disabled in Poll for Co-Teacher ****/
	if(readOnlyAccessForInPollCoTeacher =="disabled"){
			return;
	}
	var oSelf = this,
		iOptionsCnt = 0;

	$("input.poll-option").each(function () {
		if ($.trim($(this).val()) != GENERAL.c_s_SPECIAL_CHARACTERS_BLANK) {
			iOptionsCnt++;
		}
	});
	
	if ($.trim($("#questionBox").val()) != GENERAL.c_s_SPECIAL_CHARACTERS_BLANK && 
		iOptionsCnt >= 2) {
		$("#nextBttn").removeClass('btndisabled disabled');
		oSelf.bNextBttnEnabled = true;
	}
	else {
		$("#nextBttn").addClass('btndisabled disabled');
		oSelf.bNextBttnEnabled = false;
	}
}

/**
 * PollView Submit
 * @method bindEvents 
 * @return 
 */
PollView.prototype.submitPoll = function (oSelf) {
	var oElem = this,
		oData = {},
		sQuestionTxt = $.trim($("#questionBox").val()), 
		sQuestionEncoded = SpecialCharToCode(encodeURIComponent(sQuestionTxt)),
		sAnswersEndoded = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
		oAnswers = {},
		oQuestion = {},
		sTitle = sQuestionTxt.substr(0,15),
		sPollId = $("#pollID").val(),
		bDeletePoll = 0;		

	if ($(oElem).hasClass('btndisabled') && !oSelf.bNextBttnEnabled) {
		return;
	}
	
	if (sQuestionTxt.length > CONNECT.c_i_POLL_QUES_CHAR_LIMIT) {
		oSelf._alert({
			divId:		'dialog-message',
			title:		'Alert!',
			message:	CONNECT.c_s_POLL_QUES_MAX_CHAR_ALERT
		});
		return;
	}
	
	$(".poll-option").each(function(k,val){
		if ($.trim($(this).val()).length > CONNECT.c_i_POLL_ANS_CHAR_LIMIT) {
			oSelf._alert({
				divId:		'dialog-message',
				title:		'Alert!',
				message:	CONNECT.c_s_POLL_ANS_MAX_CHAR_ALERT
			});
			return;
		}		
		oAnswers[k] = $.trim($(this).val());		
	});	
	sAnswersEndoded = SpecialCharToCode(encodeURIComponent(JSON.stringify(oAnswers)));
	
	oData = {			
		"question":	sQuestionEncoded,
		"answers":	sAnswersEndoded,
		"pollID": sPollId
	};
	
	sTitle += (sQuestionTxt.length > 15) ? "..." : "";	
	
	$.nativeCall({
		'method':			'UpdatePoll',
		'inputParams':		[sPollId, SpecialCharToCode(encodeURIComponent(sTitle)), sQuestionEncoded, sAnswersEndoded, bDeletePoll],
		'globalResource':	'objUpdatePollResponse',
		'interval':			500,
		'breakAfter':		125000,
		'debug':			false,
		'beforeSend':		function () {
			oUtility.showLoader({
				'message': '<img src="media/loader.gif" alt="loading" />',
				'background-color': 'none',
				'click-to-hide': false,
				'opacity': 0.5
			});
		},
		'onComplete':		function () {
			oUtility.hideLoader();
			oData.pollID = objUpdatePollResponse.Content.PollID;
			
			oSelf.sendPollView = new PollSendView(oData);	
			oSelf.sendPollView.init();			
		}
	});	
}

/**
 * View Type SendPoll Screen
 * @class PollSendView
 * @module PollSendView
 * @constructor
 */
var PollSendView = function (model) {	
	this.model = model;	
};

/**
 * Initialize PollSendView
 * @method init 
 * @return 
 */
PollSendView.prototype.init = function () {
	var oSelf = this;
	
	HideNativeBottomBar(true);
	oSelf.render();
	oSelf.bindEvents();
	oSelf.resize();
}

/**
 * Render PollSendView
 * @method render 
 * @return 
 */
PollSendView.prototype.render = function () {
	var oSelf = this;
	
	/*== render main template ==*/
	Application.mainContainer.html(_.template($("#pollslideTemplate").html(), {
		"data" : oSelf.model
	}));
	
	/*== render header ==*/
	$("#headerpanel").html(
		_.template($("#sendPollHeaderTemplate").html())
	);
}

/**
 * Bind Events PollSendView
 * @method bindEvents 
 * @return 
 */
PollSendView.prototype.bindEvents = function () {
	var oSelf = this;
	
	
	
	if(objProductDetailJsonData.userRoleInClass=='CT')
	{
	$("#projectPoll").css({"opacity":"0.3", "cursor":"default"});
	$("#projectPoll").attr('disabled','disabled');
	}
	
	
	
	$("#BtnBackToList").off("click tap").on("click tap", function (e) {
		//ILIT-5533
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		oSelf.backToPollList.call(this, oSelf);
	});
	
	$("#BtnBackToLesson").off("click tap").on("click tap", function (e) {
		//ILIT-5533
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		oSelf.closeConnect.call(this, oSelf);
	});
	
    $('#projectPoll').off("click tap").on("click tap",function(e){
		//ILIT-5533
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		oSelf.projectPoll.call(this, oSelf);		      
    });
	
	$('#sendPoll').off("click tap").on("click tap",function(e){
		//ILIT-5533
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		oSelf.sendPoll.call(this, oSelf);		      
    });
}

/**
 * Stop Project & Broadcast PollSendView
 * @method stopProjectNBroadcast 
 * @return 
 */
PollSendView.prototype.stopProjectNBroadcast = function () {
	var oSelf = this,
		oData = oSelf.model;
		sAction = LESSON.c_s_PROJECT_STOP,
		sContent = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
		sID = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
		sSurveyType = CONNECT.c_s_SURVEY_TYPE;
	
	if ($(".start_project").hasClass("active")) {
		SetProjectSlide(sSurveyType, sAction, oData.pollID, sContent);	
	}
	if ($(".start_survey").hasClass("active")) {
		var currentGroupId = objGetGroupJsonData.groupId;	
		SetSurvey(sID, oData.pollID, sAction, sContent, sSurveyType, currentGroupId);
	}
}

/**
 * Close Connect PollSendView
 * @method closeConnect 
 * @return 
 */
PollSendView.prototype.closeConnect = function (oSelf) {
	oSelf.stopProjectNBroadcast();	
	ConnectView.closeConnectWindow();
}

/**
 * Project Poll PollSendView
 * @method projectPoll 
 * @return 
 */
PollSendView.prototype.projectPoll = function (oSelf) {
	var oElem = this,
		oData = oSelf.model,
		sAction = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
		oChoices = JSON.parse(decodeURIComponent(oData.answers))
		oJsonData = {},
		aChoicesArray = {},
		oKeyVal = {};
		
	if ($(oElem).text() == CONNECT.c_s_STOP_PROJECT_TXT) {
		sAction = LESSON.c_s_PROJECT_STOP;
		$(this).text(CONNECT.c_s_PROJECT_TXT).removeClass('active');
	}
	else {
		sAction = LESSON.c_s_PROJECT_START;
		$(this).text(CONNECT.c_s_STOP_PROJECT_TXT).addClass('active');	
	}	
	
	$.each(oChoices, function(k, choice){		
		aChoicesArray[k] = choice;		
	});	
	
	oJsonData = {
		"poll": {
			"question": decodeURIComponent(oData.question),
			"choices": aChoicesArray,
			"poll-id": oData.pollID
		}
	};	
	SetProjectSlide(CONNECT.c_s_SURVEY_TYPE, sAction, oData.pollID, encodeURIComponent(JSON.stringify(oJsonData)));  
}

/**
 * Broadcast Poll PollSendView
 * @method sendPoll 
 * @return 
 */
PollSendView.prototype.sendPoll = function (oSelf) {
	var oElem = this,
		oData = oSelf.model,
		sAction = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
		oChoices = JSON.parse(decodeURIComponent(oData.answers))
		oJsonData = {},
		aChoicesArray = [],
		oKeyVal = {},
		sID = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
		sSurveyType = CONNECT.c_s_SURVEY_TYPE;
		
	if ($(oElem).text() == CONNECT.c_s_END_POLL_TXT) {
		sAction = LESSON.c_s_PROJECT_STOP;
		$(this).text(CONNECT.c_s_SEND_POLL_TXT).removeClass('active');
		$(".survey_box .no_box").hide();
		$(".survey_box .bar-graph-cont div").css("width","0");
	}
	else {
		sAction = LESSON.c_s_PROJECT_START;
		$(this).text(CONNECT.c_s_END_POLL_TXT).addClass('active');	
	}	
	
	$.each(oChoices, function(k, choice){		
		aChoicesArray.push({"answer_text_html": choice});		
	});
	
	/* json structor kept same as survey */
	oJsonData = {
		"survey": {
			"content": decodeURIComponent(oData.question),
			"answers": aChoicesArray,
			"question_id": oData.pollID
		}
	};	
	
	
	var currentGroupId = objGetGroupJsonData.groupId;	
	
	
	
	
	SetSurvey(sID, oData.pollID, sAction, encodeURIComponent(JSON.stringify(oJsonData)), sSurveyType, currentGroupId);
	if (sAction == LESSON.c_s_PROJECT_START) {
		/* note: SetGoogleAnalytic() param - VERBID */
		SetGoogleAnalytic(CONNECT.c_s_POLL_SENT_VERBID, GENERAL.c_s_SPECIAL_CHARACTERS_BLANK);
	}
}

/**
 * Back To Poll List
 * @method backToPollList 
 * @return 
 */
PollSendView.prototype.backToPollList = function (oSelf) {
	var oPollView = ConnectView.viewType;
	
	oSelf.stopProjectNBroadcast();
	oPollView.init();
}

/**
 * Reflect Graph on Poll Screen 
 * @method updateResponse
 * @param {Object} myval
 * @return 
 */
PollSendView.prototype.updateResponse = function(){    
    
    var arrOptions = ['a', 'b', 'c', 'd' ,'e', 'f', 'g', 'h' ,'i', 'j', 'k', 'l'],
		sChar = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,		
		oJsonData = JSON.parse(objPollSurveyResponse).Content,
		aResult = [],
		oResult = {},
		fPercent = 0,
		fMaxVal = 0;
    
    for (key in arrOptions) {        
		if (parseInt(key) >=0 && parseInt(key) <= (arrOptions.length - 1)) {
			sChar = (arrOptions[key]).toUpperCase();
			//var val = $('#response_'+sChar).text();
			
			oResult   =   _.where(oJsonData, {UserResponseItemNo: arrOptions[key]});
			aResult.push({'val' : oResult.length, 'id' : 'response_'+sChar});   
			
			$('.survey_box').find('#response_'+sChar).text(oResult.length).show();   
		}
    }	
	fMaxVal = _.max(_.pluck(aResult, 'val'));
	
	if(fMaxVal > 0)
	{
		$.each(aResult, function(id,obj){
			
			if(obj.val == fMaxVal)
			{
				 $('.survey_box').find('#bar_'+obj.id).animate({'width':"100%"},100);
				 $('.survey_box .message').html('<div class="message_content">'+unescape($('.survey_box').find('#info_'+obj.id).val())+'</div>').addClass('message_active');
			}
			else
			{
				fPercent = obj.val/fMaxVal * 100;
				$('.survey_box').find('#bar_'+obj.id).animate({'width':fPercent+"%"},100);
			}
		}); 
	}
    
}

/**
 * Resize PollSendView
 * @method resize 
 * @return 
 */
PollSendView.prototype.resize = function () {
	var fWindowHeight = $(window).height(),
		fHeaderHeight = $(".top_navbar").outerHeight();		
		
	$(".content_space").height(fWindowHeight - fHeaderHeight - 53);
	//oPollForm.css('max-height',fWindowHeight - fHeaderHeight + fGappingHeight + fBottomBarHeight));
}

/**
 * View Type Buzz
 * @class BuzzView
 * @module BuzzView
 * @constructor
 */
var BuzzView = function (model) {
	this.model = model;
	this.currentGroupId = "";
	this.sCurrentUserRoleInClass = "";
	this.bSelectAllInCoTeacher = false;
};
BuzzView.prototype = new ISeriesBase();
/**
 * Initialize BuzzView
 * @method init 
 * @return 
 */
BuzzView.prototype.init = function () {
	var oSelf = this;
	$.nativeCall({
    	'method': 'GetSessionGroup',
        'globalResource': 'objGetGroupJsonData',
		'interval':			500,
		'breakAfter':		125000,
		'debug':			false,
		'beforeSend': function () {
			// reset data
			objGetGroupJsonData = null;
		},
		'checkSuccess':function(){
			return objGetGroupJsonData !== null;
		},
        'onComplete': function(){
            // process data
			fCallback();
        }
	});

	var fCallback = function(){
		
		HideNativeBottomBar(true);
		

		oSelf.sCurrentUserRoleInClass = objStudentListJsonData.userRoleInClass;
		
		oSelf.model.StudentData = objStudentListJsonData.Content;
		oSelf.model.BuzzCommentsnote = objBuzzCommentData;
		/**** Read-Only for Co-Teacher(ILIT-2849): To Disable Reset Buzz button in Buzz for Co-Teacher ****/
		if(
			objStudentListJsonData.userRoleInClass == GENERAL.c_s_USER_TYPE_CO_TEACHER && 
			(objGetGroupJsonData.groupId == "" || !objGetGroupJsonData || typeof objGetGroupJsonData.groupId == undefined)
		){
			
			readOnlyAccessInBuzzForCoTeacher = 'disabled';   
		}
		else{
			readOnlyAccessInBuzzForCoTeacher = '';
		}
		
		oSelf.render();
		disableBuzzAndPollBtnForCoTeacher(""+ CONNECT.c_s_RESET_BUZZ_BTN +",#"+ CONNECT.c_s_BUZZ_BTN +",#"+CONNECT.c_s_PRJBTN);
		
	}
}

/**
 * render BuzzView
 * @method render 
 * @return 
 */
BuzzView.prototype.render = function (){
	var oSelf = this;
	
	// render main template
	$("#main_container").empty().html(
		_.template($("#buzzMainTemplate").html(),
			{
				
			}
		)
	);
	// render buzz header
	$("#renderBuzzHeaderArea").empty().html(
		_.template($("#buzzheaderTemplate").html(),
			{
				
			}
		)
	);
	
	
	//oSelf.renderStudentList();  previous code
	
	oSelf.getData();
	
	// render comment area
	$("#renderCommentsArea").empty().html(
		_.template($("#commentsTemplate").html(),
			{
				
			}
		)
	);	
	// render personal comment area
	$("#renderPersonalCommentsArea").empty().html(
		_.template($("#personalCommentsTemplate").html(),
			{
				
			}
		)
	);
	// render buzz area and star rating
	$("#renderBuzzArea").empty().html(
		_.template($("#buzzTemplate").html(),
			{
				
			}
		)
	);

	disableBuzzAndPollStarsForCoTeacher();
	// render comments popup area
	$("#" +CONNECT.c_s_COMMENTS_POPUP_AREA).empty().html(
		_.template($("#commentsNotestemplate").html(),
			{
				'data' : oSelf.model.BuzzCommentsnote
			}
		)
	);
	
	//IPP-4724
	if($(oSelf.model.StudentData).length == 1){
		$("#" +CONNECT.c_s_BUZZ_BTN).addClass("disabledBtn");
		$("#" +CONNECT.c_s_PRJBTN).addClass("disabledBtn");
	}
	oSelf.resize();
}

/**** Read-Only for Co-Teacher(ILIT-2849): To Disable buttons in Buzz for Co-Teacher ****/
function disableBuzzAndPollBtnForCoTeacher(id){
if(readOnlyAccessInBuzzForCoTeacher == "disabled"){
	$("#" +id).css({"opacity":"0.3", "cursor":"default"});
	$("#" +id).attr('disabled','disabled');
}
}


/**** Read-Only for Co-Teacher(ILIT-2849): To Disable Stars in Buzz for Co-Teacher ****/
function disableBuzzAndPollStarsForCoTeacher(){
if(readOnlyAccessInBuzzForCoTeacher == "disabled"){
		$('#score-callback').raty({
				readOnly: true,
				number: 3,
				hints : ['','',''],
				score: function() {
				return $(this).attr('data-score');
			}
		});
}else{
	$('#score-callback').raty({
				number: 3,
				hints : ['','',''],
				score: function() {
				return $(this).attr('data-score');
			}
	});
}
}

/**** Read-Only for Co-Teacher(ILIT-2849): To Disable buttons in Buzz for Co-Teacher ****/


/**
* @method: bindEvents
* @uses: for binding events to the dom elements
* @return void;
*/

BuzzView.prototype.bindEvents = function (){
	var oSelf = this;
	isCommentForClass = 1;
	selectedstudentId = "";
	resetCommentforClass = 0;
	topstarStudentIDs = [];
	allStudentIDs = [];
	
	/* $(".student_shorting").find('li:gt(0)').each(function(i){
			allStudentIDs.push($(this).attr("data-student-id"));
	}); */
	
		
	$("#" +CONNECT.c_s_COMMENT_BTN).off("click tap").on("click tap", function(e){ 
		/**** Read-Only for Co-Teacher(ILIT-2849): To Disable Click on '+' buttons in Buzz for Co-Teacher ****/
		if(readOnlyAccessInBuzzForCoTeacher == "disabled"){
			return;
		}
		//ILIT-5533
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		$("#" +CONNECT.c_s_COMMENT_LIST).css({
				top: e.pageY-40,
				left: e.pageX+160
		}).toggle();
		e.stopPropagation();
	});
	
	$("#" +CONNECT.c_s_BUZZ_BTN).off("click tap").on("click tap", function(e){
		/**** Read-Only for Co-Teacher(ILIT-2849): To Disable Buzz buttons in Buzz for Co-Teacher ****/
		if(readOnlyAccessInBuzzForCoTeacher == "disabled"){
			return;
		}
		//ILIT-5533
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		if($(oSelf.model.StudentData).length > 1){
			if(allStudentIDs.length == 0){
				oSelf._alert({
					divId:		'dialog-message',
					title:		'Alert!',
					message:	CONNECT.c_s_SELECT_STUDENT_ALERT
					});
					return false;
			}
			resetCommentforClass = 0;
			//alert(isCommentForClass);
			var ratingScore = ($('[name="score"]').val() == "") ? 0 : $('[name="score"]').val();
			
			if(
			
					((( $.trim($("#" + CONNECT.c_s_COMMENT_AREA ).html().toString()).length == 0 ) && 
			
					($.trim($("#" + CONNECT.c_s_PERSONAL_COMMENT_AREA).val()).length == 0)
					) && 
					
					(ratingScore == 0))
				
			   ){
					oSelf._alert({
					divId:		'dialog-message',
					title:		'Alert!',
					message:	CONNECT.c_s_EMPTY_COMMENT_ALERT
					});
					return false;
				
				}
			var buzzCommentData = {};
			buzzCommentData.comments = notelist;
			buzzCommentData.personalComments = $("#"+CONNECT.c_s_PERSONAL_COMMENT_AREA).val();
			buzzCommentData.studentIDs = allStudentIDs;
			
			buzzCommentData = JSON.stringify(buzzCommentData);
			
			 if(notelist.length >0 && notelist.length > 3) {
					
					oSelf._alert({
					divId:		'dialog-message',
					title:		'Alert!',
					message:	CONNECT.c_s_PREAUTHORED_COMMNET_RESTICTION
					});
					return false;
				}
				
				
			if(( $.trim($("#" + CONNECT.c_s_COMMENT_AREA ).html().toString()).length> 0 ) && ($.trim($("#" + CONNECT.c_s_PERSONAL_COMMENT_AREA).val()).length>0)){
			   
				oSelf._alert({
					divId:		'dialog-message',
					title:		'Alert!',
					message:	CONNECT.c_s_WRONG_COMMENT_ALERT
				});

			}else{
				//console.log("saveBuzzData");
				var sCurrentGrpID;
				
				if(oSelf.bSelectAllInCoTeacher)
				{
				sCurrentGrpID = oSelf.currentGroupId;
				}
				else
				{
				sCurrentGrpID = "";
				
				}
				oSelf.saveBuzzData(resetCommentforClass,isCommentForClass,selectedstudentId,ratingScore,buzzCommentData,sCurrentGrpID);
			}
		}
	});
	
	// send buzz event
	
	$("#" +CONNECT.c_s_RESET_BUZZ_BTN).off("click tap").on("click tap", function(e){
		/**** Read-Only for Co-Teacher(ILIT-2849): To Disable Reset Buzz button in Buzz for Co-Teacher ****/
		if(readOnlyAccessInBuzzForCoTeacher == "disabled"){
			return;
		}
		//ILIT-5533
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		resetCommentforClass = 1;
		isCommentForClass = 1;
		selectedstudentId = 0;
		var ratingScore = 0;
		buzzCommentData = {};
		/*
		allStudentIDs.length = 0;
		
		$(".student_shorting").find('li:gt(0)').each(function(i){
			allStudentIDs.push($(this).attr("data-student-id"));
		});*/
		
		
		
		buzzCommentData.comments = CONNECT.c_s_BUZZ_DATA_RESET_TXT;
		buzzCommentData.studentIDs = allStudentIDs;
		buzzCommentData = JSON.stringify(buzzCommentData);
		
		/* oSelf._alert({
				divId:		'dialog-message',
				message:	CONNECT.c_s_BUZZ_SAVE_RECORD_ALERT
		}); */
		
		oSelf._confirm({
				divId:	'dialog-message',
				title:		'Alert!',
				message:	CONNECT.c_s_RESET_STARS_CONFIRM_TXT,
				yes:		function () {
					var sCurrentGrpID = oSelf.currentGroupId;
					
					// if(oSelf.bSelectAllInCoTeacher)
					// {
					// sCurrentGrpID = oSelf.currentGroupId;
					// }
					// else
					// {
					// sCurrentGrpID = "";
					
					// }
					oSelf.saveBuzzData(resetCommentforClass,isCommentForClass,selectedstudentId,ratingScore,buzzCommentData,sCurrentGrpID);
				}
	    });
	});
	
	$("#" +CONNECT.c_s_DONE_BUZZ_BTN).off("click tap").on("click tap", function(e){
		//ILIT-5533
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		HideNativeBottomBar(false);
		if ( oPlatform.isDevice() || oPlatform.isChromeApp() ) {
			CloseWebView();
		}else{
			CloseConnectWindow();
		}
	});
	
	
	// add default comment notes
	
	notelist = [];
	$(".notelist").off("click tap").on("click tap", function(e){
		//ILIT-5533
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		
	   if(($.inArray( $(this).text(), notelist)) == -1 && notelist.length < 3 ){
			//notelist.push($(this).attr('note_id'));
			notelist.push($(this).text());
			$("#" + CONNECT.c_s_COMMENT_AREA).append("<p><span class='text_remove sprite' id='noteid_"+$(this).attr('note_id')+"'></span>"+$(this).html()+"</p>");
			$(this).append('<div class="buzzcmtnotecheck sprite"></div>');
		}
		// remove  default comment notes
		$("#" + CONNECT.c_s_COMMENT_AREA + " .text_remove").off("click tap").on("click tap", function(){ 
				document.activeElement.blur();
                $("input").blur();
				var itemtoRemove = $(this).attr('id').split("_");
				var itemIndex    = notelist.indexOf($(this).parent().text());
				//alert(itemIndex);
				//alert($(this).parent().text());
				//notelist.splice($.inArray(itemtoRemove[1], notelist),1);
				notelist.splice(itemIndex,1);
				$(this).parent('p').remove();
				$(".notelist").each(function(i){
					if($(this).attr('note_id') == itemtoRemove[1]){
						$(this).find('.buzzcmtnotecheck').remove();
					}
				});
			});
	
		});
		
		
		
		// bind events for active student link with group id same as that for current session added by shamim
		

		var aStudArr = [],aActiveStudentIndexArr = [],sGroupID="",bActiveGroup = "N";
		
		aStudArr = $(".student_shorting").find('li');
		//console.log("aStudArr.length=="+aStudArr.length);
		
		for(var j=1;j<aStudArr.length;j++)
		{
			sGroupID = $(aStudArr[j]).attr('data-group-id');
			bActiveGroup = $(aStudArr[j]).attr('data-active-group');		
			
			if(oSelf.sCurrentUserRoleInClass=='CT')
			{
				// CT can select oly his active group students
				if((sGroupID==oSelf.currentGroupId)&&(sGroupID!="")) { aActiveStudentIndexArr.push(j);  }
			}		
			//CLASSVIEW-584
			// else if(oSelf.sCurrentUserRoleInClass=='I')
			else if(oSelf.sCurrentUserRoleInClass=='I' || oSelf.sCurrentUserRoleInClass=='ST')
			//=================
			{
				// LT can select students who do not belong to any active group
				if(bActiveGroup == 'N' || sGroupID == "") { aActiveStudentIndexArr.push(j);  }			
			}
		
		}
			
		
		$(".student_shorting").find('li:gt(0)').css('cursor','default');
		
		for(var j=0;j<aActiveStudentIndexArr.length;j++)
		{
		//console.log("aActiveStudentIndexArr[j]---"+aActiveStudentIndexArr[j]);
		
		
		
		$(".student_shorting").find('li:eq('+aActiveStudentIndexArr[j]+')').css('cursor','pointer');
		
		$(".student_shorting").find('li:eq('+aActiveStudentIndexArr[j]+')').off("click").on("click", function () {
		
		
		
			/**** Read-Only for Co-Teacher(ILIT-2849): To Disable Click on Student Name button in Buzz for Co-Teacher ****/
			if(readOnlyAccessInBuzzForCoTeacher == "disabled"){
				//console.log("readOnlyAccessInBuzzForCoTeacher");
				return;
			}

			
			if($(this).hasClass("active")){ //deselect student
				$(this).removeClass("active");
				return;
			}
			else{
				$(".student_shorting").find('li').removeClass("active");
				
				oSelf.bSelectAllInCoTeacher = false;
				
				$(this).addClass("active");
				isCommentForClass = 0;
				selectedstudentId = $(this).attr("data-student-id");
				allStudentIDs.length = 0;
				allStudentIDs.push($(this).attr("data-student-id"));
			}
		});
		
		
		}
		
		
		
		// bind events for Select All link
		
		oSelf.bSelectAllInCoTeacher = false;
		
		$("#" + CONNECT.c_s_ID_LINK_SELECT_ALL).off("click").on("click", function (e) {
			
			/**** Read-Only for Co-Teacher(ILIT-2849): To Disable Select All button in Buzz for Co-Teacher ****/
			
			if(readOnlyAccessInBuzzForCoTeacher == "disabled"){
				return;
			}
			//ILIT-5533
			if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
				callLogUserActivity(e); 
			}
			
			//deselect all
			if($("#" + CONNECT.c_s_ID_LINK_SELECT_ALL).hasClass("active")){
				$("#" + CONNECT.c_s_ID_LINK_SELECT_ALL).removeClass("active");
				for(var j=0;j<aActiveStudentIndexArr.length;j++)
				{
					$(".student_shorting").find('li:eq(0)').removeClass("active");
					$(".student_shorting").find('li:eq('+aActiveStudentIndexArr[j]+')').removeClass("active");		
				}
				return;
			}



			for(var j=0;j<aActiveStudentIndexArr.length;j++)
			{
				$(".student_shorting").find('li:eq(0)').addClass("active");
				$(".student_shorting").find('li:eq('+aActiveStudentIndexArr[j]+')').addClass("active");		
			}
			
			if(oSelf.sCurrentUserRoleInClass=='CT')
			{			
				oSelf.bSelectAllInCoTeacher = true;		
				
			}
			//CLASSVIEW-584
			// else if(oSelf.sCurrentUserRoleInClass=='I')
			else if(oSelf.sCurrentUserRoleInClass=='I' || oSelf.sCurrentUserRoleInClass=='ST')
			//==================
			{			
				oSelf.bSelectAllInCoTeacher = false;				
			}
			
			isCommentForClass = 1;
			selectedstudentId = "";
			allStudentIDs.length = 0;
			
			for(var k=0;k<aActiveStudentIndexArr.length;k++)
			{
			//console.log("aActiveStudentIndexArr[j]---"+aActiveStudentIndexArr[j]);
			
			allStudentIDs.push($(".student_shorting").find('li:eq('+aActiveStudentIndexArr[k]+')').attr("data-student-id"));
			
			}
		
		
			//allStudentIDs.length = 0;
			/*
			$(".student_shorting").find('li:gt(0)').each(function(i){
				allStudentIDs.push($(this).attr("data-student-id"));
			});*/
		});
		
		
		
		if(aActiveStudentIndexArr.length==0) //if no active links
		{
		disableBuzzAndPollBtnForCoTeacher(""+ CONNECT.c_s_RESET_BUZZ_BTN +",#"+ CONNECT.c_s_BUZZ_BTN +",#"+CONNECT.c_s_PRJBTN);
		
		if(oSelf.sCurrentUserRoleInClass=='CT') readOnlyAccessInBuzzForCoTeacher = "disabled";
		}
		
		// bind project top stars
		$("#"+CONNECT.c_s_PRJBTN).off("click").on("click", function (e) {
			/**** Read-Only for Co-Teacher(ILIT-2849): To Disable Project Top Star button in Buzz for Co-Teacher ****/
			if(readOnlyAccessInBuzzForCoTeacher == "disabled"){
				return;
			}
			//ILIT-5533
			if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
				callLogUserActivity(e); 
			}
			if($(oSelf.model.StudentData).length > 1){
				$("#projectTopStrPopup").show();
				oSelf.middleAlignPopup("projectTopStrPopup");
			}
		});
		
		// close top star close button
		
		$("#topstarPopUpCloseBtn").off("click").on("click", function (e) {
			//ILIT-5533
			if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
				callLogUserActivity(e); 
			}
			$("#projectTopStrPopup").hide();
			
			// IPP-4714
			$(".topstarstudent_shorting").find('li:gt(0)').each(function (i) {
				$(this).removeClass("active");
				
			});
			$("#"+CONNECT.c_s_STOP_PROJECTION).hide();
			$("#"+CONNECT.c_s_SEND_PROJECTION).show();
			var MediaType = 'Buzz',
					ActionType = 'Stop',
					MediaID = '',
					QuestionInformation = encodeURIComponent(
						JSON.stringify({
							'studentInfos':		topstarStudentIDs
						})
					),
					MediaFullURL = '',
					MediaActionType = '';
				
				SetProjectSlide(MediaType, ActionType, MediaID, QuestionInformation, MediaFullURL, MediaActionType);
		});
		
		// bind events for particular top star student lnik
		$(".topstarstudent_shorting").find('li:gt(0)').off("click").on("click", function (e) {
			
			//IPP-4725
			
			if($("#"+CONNECT.c_s_STOP_PROJECTION).is(':visible')){
				return false;
			}
			//ILIT-5533
			if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
				callLogUserActivity(e); 
			}
			$(this).toggleClass("active");
			/*//var sid = $(this).attr("data-student-id");
			
			var rtopstarStudentIDs = $.grep(topstarStudentIDs, function(e){ return e.sId == sid; });
			 				if($(this).hasClass("active")){
					if(rtopstarStudentIDs.length == 0){
						//alert(1);
						topstarStudentIDs.push(
							{
								"sId"     : $(this).attr("data-student-id"),
								"sName"   : $(this).attr("data-student-name"),	
								//"sRating" : $(this).attr("data-student-rating")
								"sRating" :$(this).find(".right").text()
							});
						}
					}else{
						$.each(topstarStudentIDs, function(i){
						if(topstarStudentIDs[i].sId === sid) {
							topstarStudentIDs.splice(i,1);
							return false;
						}
					});
						
					}
 */				
			if($(".topstarstudent_shorting").find('li.active').length > 10){
				
				$("#"+CONNECT.c_s_SEND_PROJECTION).hide();
				$("#"+CONNECT.c_s_STOP_PROJECTION).hide();
				return false;
			}	
				
			if($(".topstarstudent_shorting").find('li').hasClass('active') == false){ 
				$("#"+CONNECT.c_s_SEND_PROJECTION).hide();
				$("#"+CONNECT.c_s_STOP_PROJECTION).hide();
			}else{
				$("#"+CONNECT.c_s_SEND_PROJECTION).show();
				$("#"+CONNECT.c_s_STOP_PROJECTION).hide();
			} 
			
		});
		
		// send projection
		
		$("#"+CONNECT.c_s_SEND_PROJECTION).off("click").on("click", function (e) {
			//ILIT-5533
			if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
				callLogUserActivity(e); 
			}
				oSelf.filterTopStarsData ();
				$(this).hide();
				$("#"+CONNECT.c_s_STOP_PROJECTION).show();
				var MediaType = 'Buzz',
					ActionType = 'Start',
					MediaID = '',
					QuestionInformation = encodeURIComponent(
						JSON.stringify({
							'studentInfos':		topstarStudentIDs
						})
					),
					MediaFullURL = '',
					MediaActionType = '';
				
				//console.log(QuestionInformation);
				//console.log(topstarStudentIDs);
		
				SetProjectSlide(MediaType, ActionType, MediaID, QuestionInformation, MediaFullURL, MediaActionType);
		});
		
		// stop projection
		$("#"+CONNECT.c_s_STOP_PROJECTION).off("click").on("click", function (e) {
				//ILIT-5533
				if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
					callLogUserActivity(e); 
				}
				oSelf.filterTopStarsData ();
				$(this).hide();
				$("#"+CONNECT.c_s_SEND_PROJECTION).show();
				
				var MediaType = 'Buzz',
					ActionType = 'Stop',
					MediaID = '',
					QuestionInformation = encodeURIComponent(
						JSON.stringify({
							'studentInfos':		topstarStudentIDs
						})
					),
					MediaFullURL = '',
					MediaActionType = '';
				
				//console.log(QuestionInformation);
		
				SetProjectSlide(MediaType, ActionType, MediaID, QuestionInformation, MediaFullURL, MediaActionType);
		});
		
		// bind user to 250 charecters
		
		/* $("#" + CONNECT.c_s_PERSONAL_COMMENT_AREA)
			.on('keypress', function (poEvent) {
				var iMaxLength = $(this).data('maxlength');
				return ($(this).text().length <= iMaxLength);
			})
			.on('input', function () {
				var iMaxLength = $(this).data('maxlength');
				if ($(this).text().length > iMaxLength) {
					$(this).text($(this).text().substring(0, iMaxLength));
					// $(this).get(0).setSelectionRange(iMaxLength * 2, iMaxLength * 2);
					$(this).text($(this).text());
					return false;
				}
			})
			.on('focus', function () {
				this.selectionStart = this.selectionEnd = $(this).text().length;
			}); */
		//$("#"+CONNECT.c_s_PERSONAL_COMMENT_AREA).keyup(oSelf.validateMaxLength);
		
		
		// hide pre-defined Comments list
		
		$(document.body).off("click tap").on("click tap", function(e){ 
			if(e.target.className !== "notelist"){
				$("#" +CONNECT.c_s_COMMENT_LIST).hide();
				callLogUserActivity();
			}
		});

		$("#"+CONNECT.c_s_PERSONAL_COMMENT_AREA).donetyping(function(){

			if($(this.target).hasClass("valid-activity") || $(this.currentTarget).hasClass("valid-activity")){			
				callLogUserActivity(this);			
			}
			oSelf.submitEnable;
		},1000,null);
		

		
}
/**
* @method: resize
* @uses: for resizing
* @return void;
*/
BuzzView.prototype.resize = function (){
	
	$("#connectFrame", parent.document).css("overflow", "hidden");
	$(".connectWrapper", parent.document).css("overflow", "hidden");
	
}


/**
* @method: renderStudentList
* @uses: for listing student list
* @return void;
*/

BuzzView.prototype.getData = function () {

	var oSelf = this;

	
	fScheduleCheck = function () {
			// check if all data received successfully
			if ((objGetListOfClassGroupsJsonData)&&(objGetGroupJsonData)){
				oSelf.renderStudentList();
				oUtility.hideLoader();
			} else {
				setTimeout(fScheduleCheck, 100);
			}
		};
		
		
	$.nativeCall({
			'method': 'GetListOfClassGroups',
			'globalResource': 'objGetListOfClassGroupsJsonData',
			'interval': 500,
			'breakAfter': 125000,
			'debug': false,
			'beforeSend': function () {
				// reset data
				objGetListOfClassGroupsJsonData = null;
				//show loader initially
				oUtility.showLoader({
					'message': '<img src="media/loader.gif" alt="" />',
					'background-color': '#fff',
					'click-to-hide': false,
					'opacity': 0.5
				});
			},
			'onComplete': function () {
				// process data			
			}
		});
		
		
		
	// $.nativeCall({
    // 	'method': 'GetSessionGroup',
    //     'globalResource': 'objGetGroupJsonData',
	// 	'interval':			500,
	// 	'breakAfter':		125000,
	// 	'debug':			false,
	// 	'beforeSend': function () {
	// 		// reset data
	// 		objGetGroupJsonData = null;
	// 	},
    //     'onComplete': function(){
    //         // process data
    //     }
	// });
			
		
	// check for response from services
	fScheduleCheck();
}



BuzzView.prototype.renderStudentList = function (){
		var oSelf = this;
		oSelf.currentGroupId = objGetGroupJsonData.groupId;
		
		var topStudents = [],
		studentList = oSelf.generateUserLastName(oSelf.model.StudentData);
		
	$("#renderStudentsArea").empty().html(
		_.template($("#studentListTemplate").html(),
			{
				'studentList' : studentList
			}
		)
	);
	oSelf.renderTopStars();
	oSelf.bindEvents();
	
	
	}
/**
* @method: renderTopStars
* @uses: for listing top star student list
* @return void;
*/
BuzzView.prototype.renderTopStars = function (){
	var oSelf = this;
	topStudents = _.sortBy(oSelf.model.StudentData, 'UserStarCount');
	topStudents = topStudents.reverse();
	$("#projectTopStrPopup").empty().html(
		_.template($("#projectTopstarTemplate").html(),
			{
				'studentList' : topStudents
			}
		)
	);
}

/**
* @method: saveBuzzData
* @params : {String} resetCommentforClass
* @params : {String} isCommentForClass
* @params : {String} selectedstudentId
* @params : {Ineger} ratingScore
* @params : {Ineger} buzzCommentData 
* @uses: for saving buzz data
* @return void;
*/

BuzzView.prototype.saveBuzzData = function (resetCommentforClass,isCommentForClass,selectedstudentId,ratingScore,buzzCommentData,currGroupID) {
	var oSelf = this;	
	$.nativeCall({
		'method':			'SetBuzzComment',
		'inputParams':		[resetCommentforClass, isCommentForClass, selectedstudentId, ratingScore, buzzCommentData,currGroupID],
		'globalResource':	'objBuzzData',
		'interval':			500,
		'breakAfter':		2500,
		'beforeSend':		function () {
			oUtility.showLoader({
				'message': '<img src="media/loader.gif" alt="loading" />',
				'background-color': 'none',
				'click-to-hide': false,
				'opacity': 0.5
			});
		},
		'onComplete':		function (poSetBuzzCommentResponse) {
			
			// update rating of selected students
			$(".student_shorting").find('li:gt(0)').each(function(i){
				if (resetCommentforClass == 1) {
						$(this).find(".right").text("0");
				}else{	
					if($(this).hasClass("active")){
						var cRating = parseInt($(this).find(".right").text()) ;
						$(this).find(".right").text(cRating + parseInt(ratingScore));
						}
				}
			});
			for(var i=0; i<= allStudentIDs.length - 1;i++){
				var cRating = parseInt($("#star_"+allStudentIDs[i]).text()) ;
				if (resetCommentforClass == 1) {
						$("[id^=star_]").text("0");
						//$("#star_"+allStudentIDs[i]).text("0");
				}else{
					$("#star_"+allStudentIDs[i]).text(cRating + parseInt(ratingScore));
				}
				
			}
			var oSortStudents = {},
				aSortStudents = [];
				$(oSelf.model.StudentData).each(function(i,v){
						oSortStudents = {};
						oSortStudents['UserCurrentLexileLevel'] = v.UserCurrentLexileLevel;
						oSortStudents['UserCurrentReadingBookID'] = v.UserCurrentReadingBookID;
						oSortStudents['UserCurrentReadingLevel'] = v.UserCurrentReadingLevel;
						oSortStudents['UserDisplayName'] = v.UserDisplayName;
						oSortStudents['UserID'] = v.UserID;
						oSortStudents['UserInLiveSession'] = v.UserInLiveSession;
						oSortStudents['UserRole'] = v.UserRole;
						oSortStudents['UserStarCount'] = v.UserStarCount;
						if (resetCommentforClass == 1) {
							oSortStudents['UserStarCount'] = 0;
						}else{
							for(var j=0; j<= allStudentIDs.length - 1;j++){
								if(v.UserID == allStudentIDs[j]){
									oSortStudents['UserStarCount'] = v.UserStarCount + parseInt(ratingScore);
								}
							}
						}	
						//console.log(v.UserCurrentLexileLevel);
					aSortStudents.push(oSortStudents);
				});
			oSelf.model.StudentData = aSortStudents;	
			oSelf.renderTopStars();
			oSelf.bindEvents();
			$(".student_shorting").find('li').removeClass("active");
			
			oUtility.hideLoader();
			if (resetCommentforClass == 1) {
					oSelf.resetBuzzDataCallback();
			}
			else {
					oSelf.saveBuzzDataCallback();
			}
			//create studentid buzzid json structure for QuestionInformation
			var aStudentBuzzIds = poSetBuzzCommentResponse.Content;
			studentBuzzIds = [{
				"buzzId": "",
				"studentId":""
			}]; 
			
			
			for( i=0; i<aStudentBuzzIds.length; i++ ){
				studentBuzzIds[i] = {
					"buzzId": aStudentBuzzIds[i].BuzzId,
					"studentId": aStudentBuzzIds[i].StudentId
				}
			}
			
			var MediaType = 'Buzz',
				ActionType = 'Start',
				MediaID = '',
				QuestionInformation = encodeURIComponent(
					JSON.stringify({
						'startCount':	ratingScore,
						'comment':		buzzCommentData,
						'students':		studentBuzzIds
					})
				),
				MediaFullURL = '',
				MediaActionType = '';
		
		
			//SetBroadcastSlide(type, action, mediaId, pquestionInfo, pmediaFullURL, pmediaActionType, pstudentIds,pscreenMetaData,GroupId) 
			
			SetBroadcastSlide(MediaType, ActionType, MediaID, QuestionInformation, MediaFullURL, MediaActionType,"","",oSelf.currentGroupId);
			
			notelist.length  = 0;
			$("#"+CONNECT.c_s_COMMENT_AREA).empty();
			$("#"+CONNECT.c_s_PERSONAL_COMMENT_AREA).val("");
			$('[name="score"]').val(0);

			disableBuzzAndPollStarsForCoTeacher();
			allStudentIDs.length = 0;
			selectedstudentId = 0;
			isCommentForClass = 1;
			resetCommentforClass = 1;
			$(".notelist div").remove();
			/* resetCommentforClass = 1;
			isCommentForClass = 1;
			selectedstudentId = 0;
			var ratingScore = 0;
			buzzCommentData = {};

			allStudentIDs.length = 0;	 */
			},
		'onError':			function (poSetBuzzCommentResponse, poException) {
			oUtility.hideLoader();
			oSelf._alert({
				divId:		'dialog-message',
				title:		'Alert!',
				message:	((poSetBuzzCommentResponse.Error || {}).ErrorUserDescription || (poException + ''))
			});
		}
		
	});

}

/**
* @method: saveBuzzDataCallback
* @uses: for saving buzz data alert box
* @return void;
*/
BuzzView.prototype.saveBuzzDataCallback = function(){
	var oSelf = this;
	/* oSelf._alert({
		divId:		'dialog-message',
		message:	CONNECT.c_s_BUZZ_SAVE_RECORD_ALERT
	}); */
}

/**
* @method: resetBuzzDataCallback
* @uses: for saving buzz data alert box
* @return void;
*/
BuzzView.prototype.resetBuzzDataCallback = function(){
	var oSelf = this;
	oSelf._alert({
		divId:		'dialog-message',
		title:		'Alert!',
		message:	CONNECT.c_s_BUZZ_RESET_RECORD_ALERT
	});
};

/**
* @method: middleAlignPopup
* @uses: for middle align top project popup
*/
BuzzView.prototype.middleAlignPopup = function(modalID) {
        var marginTop = ($(window).height() - $('#' + modalID).find(".popup_yellow_content").height()) / 2;
        $('#' + modalID).css('margin-top', marginTop + 'px');
}

/**
* @method: validateMaxLength
* @uses: for validate max input length of personal comment
*/
BuzzView.prototype.validateMaxLength = function (e)
{
        
var text = $(this).html();
        var maxlength = CONNECT.c_s_PERSONALCMT_CHAR_LIMIT;

        if(maxlength > 0)  
        {
                $(this).html(text.substr(0, maxlength)); 
        }
}
/**
* @method: filterTopStarsData
* @uses: for filter top star data
*/
BuzzView.prototype.filterTopStarsData = function ()
{
		topstarStudentIDs.length = 0;
		$(".topstarstudent_shorting").find("li").each(function(i) {
		if(i> 0){
			var sid = $(this).attr("data-student-id");
			var rtopstarStudentIDs = $.grep(topstarStudentIDs, function(e){ return e.sId == sid; });
			if($(this).hasClass("active")){
			if(rtopstarStudentIDs.length == 0){
				//alert(1);
			topstarStudentIDs.push(
				{
					"sId"     : $(this).attr("data-student-id"),
					"sName"   : $(this).attr("data-student-name"),	
					//"sRating" : $(this).attr("data-student-rating")
					"sRating" :$(this).find(".right").text()
				});
				}
			}else{
				$.each(topstarStudentIDs, function(i){
					if(topstarStudentIDs[i].sId === sid) {
						topstarStudentIDs.splice(i,1);
						return false;
					}
				});
			}
		}

		});	
	
	//console.log(topstarStudentIDs);	
}

/**
* @method: generateUserLastName
* @uses: for generate last name from student display name
*/



BuzzView.prototype.generateUserLastName =  function(oUserList){


			
			var oSelf = this, aUserList = [];
				
			$.each(oUserList,function(idx,valx){
				oUser = {};
				oUser.UserCurrentLexileLevel = valx.UserCurrentLexileLevel;
				oUser.UserCurrentReadingBookID = valx.UserCurrentReadingBookID;
				oUser.UserCurrentReadingLevel = valx.UserCurrentReadingLevel;
				oUser.UserDisplayName =valx.UserDisplayName;
				oUser.UserID = valx.UserID;
				oUser.UserInLiveSession = valx.UserInLiveSession;
				oUser.UserRole = valx.UserRole;
				oUser.UserStarCount =valx.UserStarCount;
				oUser.GroupID = "";
				oUser.ActiveGroup = "N";
				
				var fullName = valx.UserDisplayName.split(' ');
					lastName = fullName[fullName.length - 1];
					oUser.firstName = fullName[0];
					oUser.lastName = lastName;
					aUserList.push(oUser);
					
					
				for(var j=0;j<objGetListOfClassGroupsJsonData.Content.length;j++)
				
				{
					if(objGetListOfClassGroupsJsonData.Content[j]["StudentIds"].indexOf(valx.UserID)!=-1)
					{
						oUser.GroupID = objGetListOfClassGroupsJsonData.Content[j]["GroupId"];
						oUser.ActiveGroup = objGetListOfClassGroupsJsonData.Content[j]["Active"];
						//console.log("oUser.GroupID---->"+oUser.GroupID);
					}
				
				}
			});
			
			aUserList.sort(oSelf.compareUserLastName);
			return aUserList;
			
			}
/**
* @method: compareUserLastName
* @uses: for sorting user list
*/

BuzzView.prototype.compareUserLastName = function(a,b) {
  if (a.lastName < b.lastName)
     return -1;
  if (a.lastName > b.lastName)
    return 1;
  return 0;
}

