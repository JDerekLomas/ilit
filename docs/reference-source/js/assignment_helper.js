function scheduleCheck () {
	if (objAssignmentTOCJsonData != null) {
		try {
			$("#loaderContainer").hide();
			$('body').css({'background-color': '#E0E1E1'});
			$('.wrapper').show();
			Application.init(VIEWTYPE.c_s_ASSIGNMENT_TOC);
			$('.wrapper').animate({'opacity' : '1'}, 800);
			if (!onPageLoadCompleteStatus) {
				onPageLoadCompleteStatus = true;
				onPageLoadComplete(GENERAL.c_s_PAGE_TYPE_ASSIGNMENT);
			}
		}
		catch (oException) {
			switch (objAssignmentTOCJsonData.Status) {
				case '500':
					if (objAssignmentTOCJsonData.Error.ErrorCode == 'U1019') {
						/*==== Accomodate Changes in Services ====*/
						objAssignmentTOCJsonData.Content = [];
						/*== End Accomodate Changes in Services ==*/
						
						$("#loaderContainer").hide();
						$('body').css({'background-color': '#E0E1E1'});
						$('.wrapper').show();
						Application.init(VIEWTYPE.c_s_ASSIGNMENT_TOC);
						$('.wrapper').animate({'opacity' : '1'}, 800);
						if(!onPageLoadCompleteStatus){
							onPageLoadCompleteStatus = true;
							onPageLoadComplete(GENERAL.c_s_PAGE_TYPE_ASSIGNMENT);
						}
					}
				break;
			}
		}
	}
	else {
		setTimeout(scheduleCheck, 100);
	}
}

function showLoader () {
	// Loader Image
	$('body').css({'background-color': '#FFF'});
	$('.wrapper').hide();
	$("#loaderContainer")
		.css({	
			'background-color':	'#FFF',
			'text-align':		'center',
			'top':				'45%',
			'left':				'50%',
			'position':			'absolute'
		})
		.html('<div style="font-size: 13px;">\
			<img src="media/loader.gif" style="margin-bottom: 15px;">\
			<br />LOADING\
		</div>');
}

function get1stHTMLTag (psContent) {
	psContent = psContent.replace(new RegExp('^\\s+|\\s+$', 'g'), '');
	
	var iIndex = 0,
		sTag = '';
	for (iIndex = 0; iIndex < psContent.length; iIndex++) {
		if (psContent.charAt(iIndex) == '<') {
			break;
		}
	}
	
	for (; iIndex < psContent.length && psContent.charAt(iIndex) != '>'; iIndex++) {
		sTag += psContent.charAt(iIndex);
	}
	
	if (iIndex == psContent.length) {
		throw "Unformatted HTML";
	}
	
	return (sTag + '>');
}

function chopEmptyElements (psContent) {
	psContent = psContent.replace(new RegExp('^\\s+|\\s+$', 'g'), '');
	
	var oDiv = $('<div/>'),
		oChildElement = null,
		aChildren = [],
		iIndex = 0;
		
	oDiv.html(psContent);
	aChildren = oDiv.children();
	
	for (var iIndex = 0; iIndex < aChildren.length; iIndex++) {
		oChildElement = aChildren.eq(iIndex);
		if ($.trim(oChildElement.text()).length == 0) {
			oChildElement.remove();
		}
	}
	
	return oDiv.html();
}

function fGetSPSubType (poAttemptData) {
	var sStudyPlanSubType = ASSIGNMENTS.c_s_ASSIGNMENT_PRETEST_TYPE,
		oStudentAttempt = poAttemptData;
	
	try {
		var oPostTestData = (((oStudentAttempt.itemSlides || [])[0] || {}).slideInputData || {}).posttest;
		if (_.keys(oPostTestData).length == 0) {
			sStudyPlanSubType = ASSIGNMENTS.c_s_ASSIGNMENT_PRETEST_TYPE;
		}
		else {
			sStudyPlanSubType = ASSIGNMENTS.c_s_ASSIGNMENT_POSTTEST_TYPE;
		}
	}
	catch (oException) {
		
	}
	
	return sStudyPlanSubType;
}

function getXPathRef (poObj, pmixValue) {
	var oChunk = null;
	
	if (
		(poObj === undefined) ||
		(poObj === null) ||
		(['string', 'number', 'boolean'].indexOf(typeof pmixValue) == -1)
	) {
		return null;
	}
	
	for (var sKey in poObj) {
		if (poObj[sKey] == pmixValue) {
			return {
				'ref':	poObj,
				'key':	sKey
			};
		}
		if (typeof poObj[sKey] == 'object' && poObj[sKey] != null) {
			if (oChunk = getXPathRef(poObj[sKey], pmixValue)) {
				return oChunk;
			}
		}
	}
	
	return null;
}

function GetAssignmentTOCInfoV2CallBack (poResponse) {
	objAssignmentTOCJsonData = poResponse;
}

function ScrollBars () {
	var oScrollBars = {};
	
	this._getScrollBars = function () {
		return oScrollBars;
	};
}
ScrollBars.prototype.getInstance = function (psSelector) {
	var oScrollBars = this._getScrollBars();
	
	this.setInstance(psSelector);
	return oScrollBars[psSelector] || null;
};
ScrollBars.prototype.setInstance = function (psSelector) {
	var oScrollBars = this._getScrollBars();
	
	if (oScrollBars[psSelector] === null) {
		oScrollBars[psSelector] = $(psSelector).mCustomScrollbar({
			theme:			'dark',
			scrollButtons:	{
				enable:		false
			}
		});
	}
};
ScrollBars.prototype.push = function (psSelector, poInstance) {
	var oScrollBars = this._getScrollBars();
	
	if (poInstance === undefined) {
		poInstance = null;
	}
	if (oScrollBars[psSelector] === undefined) {
		oScrollBars[psSelector] = poInstance;
	}
};
ScrollBars.prototype.exists = function (psSelector) {
	var iI = 0,
		oScrollBars = this._getScrollBars();
	
	if (oScrollBars[psSelector] !== undefined) {
		return true;
	}
	return false;
};
ScrollBars.prototype.getScrollBars = function () {
	return Object.keys(this._getScrollBars());
};
ScrollBars.prototype.toString = function () {
	var sStr = '',
		oScrollBars = this._getScrollBars();
	for (var sSelector in oScrollBars) {
		sStr += ((sStr.length? ',\n    "': '\n    "') + sSelector + '"');
	}
	return '[' + sStr + (sStr.length? '\n': '') + ']';
};

function loadAssignment () {
	AssignmentsTOCView.model = {};
    AssignmentsTOCView.template = _.template($("#" + ASSIGNMENTS.c_s_ASSIGN_TEMPLATE_TOC).html());
    AssignmentsView.init({});
	AssignmentsView.userType = ASSIGNMENTS.c_s_USER_TYPE_STUDENT;

	var sAssignmentType = $_GET(POPUP_VIEW.c_s_QUERY_PARAM_ASSIGNMENT_TYPE),
		sAssignmentSubType = $_GET(POPUP_VIEW.c_s_QUERY_PARAM_ASSIGNMENT_SUB_TYPE),
		sItemAttemptId = $_GET(POPUP_VIEW.c_s_QUERY_PARAM_ITEM_ATTEMPT_ID),
		sAssignmentId = $_GET(POPUP_VIEW.c_s_QUERY_PARAM_ASSIGNMENT_ID),
		sSlideHeader = unescape($_GET(POPUP_VIEW.c_s_QUERY_PARAM_HEADER_TITLE)),
		sComment = decodeURIComponent($_GET('comment')),
		sTargetGradeCode = decodeURIComponent($_GET('target-grade-code')),
		iReassignCount = 0,
		fCallback = function () {
			AssignmentsView.loadAssignment(
				sAssignmentType,
				sAssignmentSubType,
				sAssignmentId,
				sItemAttemptId,
				sSlideHeader,
				iReassignCount,
				sComment,
				sTargetGradeCode
			);
			AssignmentsView.prev.hide();
			AssignmentsView.next.hide();
			AssignmentsView.audio.hide();
			AssignmentsView.bookicon.hide();
			AssignmentsView.header.text(ASSIGNMENTS.c_s_TOC_TITLE);
			
			AssignmentsTOCView.resize();
		};
		
	/* needed for passing data to eBook */
	AssigmentSlides.oAssignmentKeyData = {
		"assignmentId" : sAssignmentId,
		"itemAttemptId" : sItemAttemptId,
		"assignmentType" : sAssignmentType,
		"assignmentSubType" : sAssignmentSubType,
		"headerTitle" : decodeURIComponent(sSlideHeader),
		'reassignCount' : $_GET('reassignCount')
	};
	
	// check if GetAppProductDetailsInfo is defined for backward compatibility
	if (typeof GetAppProductDetailsInfo == 'function') {
		// get unit details
		$.nativeCall({
			'method':			'GetAppProductDetailsInfo',
			'globalResource':	'objProductDetailJsonData',
			'interval':			500,
			'breakAfter':		125000,
			'debug':			false,
			'checkSuccess':		function (poServiceResponse) {
				return poServiceResponse.productCode != undefined;
			},
			'onComplete':		function () {
				AssignmentsView.productCode = objProductDetailJsonData.productCode;
				fCallback();			
			}
		});
	}
	else {
		fCallback();		
	}
}