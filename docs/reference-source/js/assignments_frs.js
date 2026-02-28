/*==== Foundational Reading Skills ====*/
function FoundationalRS (piSlideIdx, poModel) {
	// private:
	var oHandler = {
			'model':	null,
			'slides':	{}
		},
		oMetaData = {
			ItemType:		this.c_s_ASSIGNMENT,
			ItemSubType:	this.c_s_TYPE_TPL_FRS
		},
		aParts = ['part1', 'part2'],
		aPartIds = [],
		iCurrentPartId = 0,
		dBenchmarkScore = 80.0,
		oSelf = this;
	
	this.oralFluencyData = [];
	this.PKTOralFluencyScore = [];
	this.bCheckMicStatus = true;
	this.aRejectedQIds = [];
	this.aRejectedSlideDomId = [];
	this.dataSet4NoScorePromptID = null;
	this.iCntVideoSlide = 0 ; 
	/*==== IPP-3743 ====*/
	this.c_s_SUBMIT_ANSWERS_BTTN = "Score";
	/*== End IPP-3743 ==*/
		
	for (iIndex = 0; iIndex < aParts.length; iIndex++) {
		iPartId = parseInt((aParts[iIndex].match(/Part([0-9]+)/i) || []).fetch(1) || 0);
		
		if (iPartId == 0) {
			continue;
		}
		
		aPartIds.push(iPartId);
	}
	
	// public:
	this.getModel = function (psKey) {
		if (typeof psKey != 'string') {
			psKey = '';
		}
		
		if (typeof oHandler['model'] == 'undefined') {
			return null;
		}
		if (typeof oHandler['model'][psKey] != 'undefined') {
			return oHandler['model'][psKey];
		}
		
		return oHandler['model'];
	};
	this.Alert = function (psTitle, pMixMessage, fCallback) {
		AssigmentSlides._alert({
			divId:		'dialog-message',
			title:		(psTitle || 'Alert!'),
			message:	pMixMessage
		}, fCallback);
	};
	this.getFirstSlideIdByPart = function (piPartId) {
		var iMinSlideId = NaN,
			iSlideId = NaN;
		
		for (var sPS in oHandler['slides']) {
			if (sPS.startsWith(piPartId + '-')) {
				iSlideId = parseInt(sPS.split('-').fetch(1) || 0);
				if (iSlideId != 0) {
					if (isNaN(iMinSlideId) || iMinSlideId > iSlideId) {
						iMinSlideId = iSlideId;
					}
				}
			}
		}
		
		return (isNaN(iMinSlideId)? -1: iMinSlideId);
	};
	this.getLastSlideIdByPart = function (piPartId) {
		var oFirstSlide = null,
			iMaxSlideId = NaN,
			iSlideId = NaN;
		
		for (var sPS in oHandler['slides']) {
			if (sPS.startsWith(piPartId + '-')) {
				iSlideId = parseInt(sPS.split('-').fetch(1) || 0);
				if (iSlideId != 0) {
					if (isNaN(iMaxSlideId) || iMaxSlideId < iSlideId) {
						iMaxSlideId = iSlideId;
					}
				}
			}
		}
		
		return (isNaN(iMaxSlideId)? -1: iMaxSlideId);
	};
	this.getSlides = function (piPartId, piSlideId, pbDebug) {
		piPartId = parseInt(piPartId) || 0;
		piSlideId = parseInt(piSlideId) || 0;
		
		var psSlideId = piPartId + '-' + piSlideId;
		
		if (typeof oHandler['slides'][psSlideId] != 'undefined') {
			return oHandler['slides'][psSlideId];
		}
		
		if (piSlideId == 0) {
			var aSlides = [];
			
			for (var sPS in oHandler['slides']) {
				if (sPS.startsWith(piPartId + '-')) {
					aSlides.push(oHandler['slides'][sPS]);
				}
			}
			
			return aSlides;
		}
		
		return _.values(oHandler['slides']);
	};
	this.getLastPartId = function () {
		var iPartId = NaN,
			iMaxPartId = NaN;
			
		for (var sPS in oHandler['slides']) {
			iPartId = sPS.split('-').first();
			
			if (isNaN(iMaxPartId) || iMaxPartId < iPartId) {
				iMaxPartId = iPartId;
			}
		}
		
		return (isNaN(iMaxPartId)? -1: iMaxPartId);
	};
	this.getFirstPartId = function () {
		var iPartId = NaN,
			iMinPartId = NaN;
			
		for (var sPS in oHandler['slides']) {
			iPartId = sPS.split('-').first();
			
			if (isNaN(iMinPartId) || iMinPartId > iPartId) {
				iMinPartId = iPartId;
			}
		}
		
		return (isNaN(iMinPartId)? -1: iMinPartId);
	};
	this.init = function (piSlideIdx, poModel) {
		var $me = this,
			sAssignmentId = (AssignmentsView.slideDataValue.split('___') || []).fetch(1),
			i1stPartId = -1,
			i1stSlideId = -1,
			iLastSlideId = -1,
			bIsPartComplete = false,
			bScoredLow = false;
		
		oSelf.dataSet4NoScorePromptID = null; // reset
		
		addMeta('ItemId', sAssignmentId);
		loadModel(poModel);
		
		/*==== Empty Global References ====*/
		AssigmentSlides.slidingEngine = null;
		AssigmentSlides.studentAttemptData = null;
		AssigmentSlides.studentAttemptSummary = {};
		/*== End Empty Global References ==*/
		
		loadSlides();
		
		/*==== Load Student Attempt Data ====*/
		var oAttemptData4GradableItem = AssigmentSlides.getStudentAttemptForGradableItem();
		oSelf.oralFluencyData = [];
		if (oAttemptData4GradableItem !== null) {
			AssigmentSlides.studentAttemptData = oAttemptData4GradableItem;
			if (oAttemptData4GradableItem.oralFluencyData && oAttemptData4GradableItem.oralFluencyData.length > 0) {
				try {					
					oSelf.oralFluencyData = JSON.parse(decodeURIComponent(oAttemptData4GradableItem.oralFluencyData));
				}
				catch (e) {
					console.log(e);					
				}
			}
		}
		
		oSelf.PKTOralFluencyScore = [];
		try {
			oSelf.PKTOralFluencyScore = (AssigmentSlides.getAttemptDataForGradeableItem.Content[0].PKTOralFluencyScore) ? 
									JSON.parse(decodeURIComponent(AssigmentSlides.getAttemptDataForGradeableItem.Content[0].PKTOralFluencyScore)) :
									[];  
		}
		catch (e) {
			oSelf.PKTOralFluencyScore = [];
		}
									
		/*== check if any audio is rejected and reassigned by teacher ==*/
		oSelf.aRejectedQIds = [];
		oSelf.aRejectedSlideDomId = [];
		$.each(oSelf.PKTOralFluencyScore, function (key, oQuestion) {
			if (typeof oQuestion.AC != 'undefined' && oQuestion.AC == -1 &&
				typeof oQuestion.WCPM != 'undefined' && oQuestion.WCPM == -1 &&
				typeof oQuestion.WC != 'undefined' && oQuestion.WC == -1 &&
				typeof oQuestion.EX != 'undefined' && oQuestion.EX == -1 ) {				
				oSelf.aRejectedQIds.push(oQuestion.QID);
			}
		});							
		/*== End Load Student Attempt Data ==*/
		
		$('#' + ASSIGNMENTS.c_s_SLIDE_CONTAINER)
			.empty()
			.html(
				_.template(
					$('#' + ASSIGNMENTS.c_s_TYPE_TPL_FRS_MASTER).html(), {
						'pageTitle':	'',
						'aParts':		aParts
					}
				)
			);
		
		i1stPartId = this.getFirstPartId();
		bIsPartComplete = isPartComplete(i1stPartId);
		
		if (
			bIsPartComplete !== true &&
			$_GET(POPUP_VIEW.c_s_QUERY_PARAM_ACTION) != POPUP_VIEW.c_s_ACTION_VIEW
		) {
			i1stSlideId = this.getFirstSlideIdByPart(i1stPartId);
			iLastSlideId = this.getLastSlideIdByPart(i1stPartId);
			bIsPartComplete = true; // Being optimistic
			
			for (var iI = i1stSlideId; iI < iLastSlideId; iI++) {
				if (typeof oHandler['slides'][i1stPartId + '-' + iI] === 'undefined') {
					continue;
				}
				bIsPartComplete = bIsPartComplete && oHandler['slides'][i1stPartId + '-' + iI].getIsComplete();
			}
		}
		
		bScoredLow = ($me.getScorePercentByPartId(i1stPartId) < dBenchmarkScore);
		bIsPartComplete = bIsPartComplete && bScoredLow;
		
		renderSlidesByPart(i1stPartId, bIsPartComplete);
		
		/*==== Check if we have to load further parts ====*/
		var aItemSlides4mAttemptData = ((AssigmentSlides.studentAttemptData || {}).itemSlides || []);
		if (!(aItemSlides4mAttemptData instanceof Array)) {
			aItemSlides4mAttemptData = [];
		}
		
		for (var iIndex = 1; iIndex < aPartIds.length; iIndex++) {
			iPrtId = aPartIds[iIndex];
			if (
				(
					_.find(
						aItemSlides4mAttemptData,
						function (poSlideInfo) {
							return poSlideInfo.slideID.toString().startsWith(iPrtId.toString());
						}
					) !== undefined
				) ||
				isPartComplete(aPartIds[iIndex - 1]) === true
			) {
				bIsPartComplete = isPartComplete(iPrtId);
				if (
					bIsPartComplete !== true &&
					$_GET(POPUP_VIEW.c_s_QUERY_PARAM_ACTION) != POPUP_VIEW.c_s_ACTION_VIEW
				) {
					i1stSlideId = this.getFirstSlideIdByPart(iPrtId);
					iLastSlideId = this.getLastSlideIdByPart(iPrtId);
					bIsPartComplete = true; // Being optimistic
					
					for (var iI = i1stSlideId; iI < iLastSlideId; iI++) {
						if (typeof oHandler['slides'][iPrtId + '-' + iI] === 'undefined') {
							continue;
						}
						bIsPartComplete = bIsPartComplete && oHandler['slides'][iPrtId + '-' + iI].getIsComplete();
					}
				}
				
				bScoredLow = ($me.getScorePercentByPartId(iPrtId) < dBenchmarkScore);
				bIsPartComplete = bIsPartComplete && bScoredLow;
				
				renderSlidesByPart(iPrtId, bIsPartComplete);
			}
		}
		/*== End Check if we have to load further parts ==*/
		
		frsResize();
		
		$.monitor({
			'if':	function () {
				return (AssigmentSlides.slidingEngine != null);
			},
			'then':	function () {				
				AssigmentSlides.slidingEngine.resizeFix();
				if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_ACTION) == '') {
					var oLastVisited = $me.getLastVisitedSlide(),
						sSlideId = '',
						iSwipeTo = -1;
					
					/*== if any rejected audio exist then swipe to that slide ==*/
					if (oSelf.aRejectedSlideDomId.length > 0) {
						iSwipeTo = $('#slide_inner_container').children().index($('#' + oSelf.aRejectedSlideDomId[0]));						
						if (iSwipeTo > -1) {
							AssigmentSlides.slidingEngine.swipeTo(iSwipeTo);
						}						
					}
					else if (typeof oLastVisited.getData == 'function') {
						if ((sSlideId = oLastVisited.getData('slideDomId')) != null) {
							iSwipeTo = $('#slide_inner_container').children().index($('#' + sSlideId));
							if (iSwipeTo > -1) {
								AssigmentSlides.slidingEngine.swipeTo(iSwipeTo);
							}
						}
					}
					else if (oLastVisited.getSlideType() == 'projectorslide') {						
						if ((sSlideId = oLastVisited.getSlideDomId()) != null) {							
							iSwipeTo = $('#slide_inner_container').children().index($('#' + sSlideId));
							if (iSwipeTo > -1) {
								AssigmentSlides.slidingEngine.swipeTo(iSwipeTo);
							}
						}					
					}
				}
				if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_ACTION) == POPUP_VIEW.c_s_ACTION_VIEW) {
					$me.prepare4View();
				}
			}
		});
		
		bindEvents();
		
		/*== check if mic is enabled ==*/
		if (oSelf.bCheckMicStatus && 
			$_GET(POPUP_VIEW.c_s_QUERY_PARAM_ACTION) != POPUP_VIEW.c_s_ACTION_VIEW &&
			$_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) != POPUP_VIEW.c_s_MODE_INSTRUCTOR &&
			$_GET(POPUP_VIEW.c_s_QUERY_PARAM_ACTION) != POPUP_VIEW.c_s_ACTION_PLAY) {
			
			$.monitor({
				'if':	function () {					
					return (objMicStatusResponse != null);
				},
				'beforeStart':	function () {
					CheckMicStatus();
				},
				'interval':		500,
				'then':	function () {					
					/* if mic disabled */
					if (objMicStatusResponse.micstatus == "denied") {						
						oSelf.Alert(
							null,
							(
								oPlatform.isIOS()?
								ASSIGNMENTS.c_s_RECORDING_DENIED_MSG_IPAD:
								ASSIGNMENTS.c_s_RECORDING_DENIED_MSG_BROWSER
							),
							function () {
								AssignmentsView.loadAssignmentList();
							}
						);
					}
					else if (objMicStatusResponse.micstatus == "notsupported") {						
						oSelf.Alert(
							null,
							ASSIGNMENTS.c_s_RECORDING_NOTSUPPORTED_MSG_BROWSER,
							function () {
								AssignmentsView.loadAssignmentList();
							}
						);
					}
				}
			});	
		}
	};
	this.prepare4View = function () {
		if (AssigmentSlides.slidingEngine) {
			var iActiveSlideIndex = AssigmentSlides.slidingEngine.activeIndex || 0,
				sSlideId = AssigmentSlides.slidingEngine.slides[iActiveSlideIndex].id,
				oCurrentSlide = this.getSlideByDomID(sSlideId);
			
			if (
				typeof oCurrentSlide === 'object' &&
				oCurrentSlide !== null &&
					typeof oCurrentSlide.prepare4View === 'function'
			) {
				oCurrentSlide.prepare4View();
			}
		}
	};
	this.getSlideByDomID = function (psSlideDomId) {
		var sSlideId = '',
			iPartId = -1;
			
		for (var sKey in oHandler['slides']) {
			if (typeof oHandler['slides'][sKey].getSlideDomId == 'function') {
				sSlideId = oHandler['slides'][sKey].getSlideDomId();
				if (sSlideId == psSlideDomId) {
					iPartId = oHandler['slides'][sKey].getMeta('part');
					return oHandler['slides'][sKey];
				}
			}
		}
		return null;
	};
	this.getLastVisitedSlide = function () {
		var aSlides4mData = (AssigmentSlides.getStudentAttemptForGradableItem() || {}).itemSlides || [],
			oSlideInfo = {},
			aSlides = [],
			iSlideId = -1,
			iCurPartId = -1,
			iPrevPartId = -1,
			iSlideCnt = 0,
			bScoredLow = true;
			
		if (!(aSlides4mData instanceof Array)) {
			aSlides4mData = [];
		}
		
		for (var iI = 0; iI < aPartIds.length; iI++) {
			iCurPartId = aPartIds[iI];
			if (iPrevPartId == -1) {
				iPrevPartId = iCurPartId;
			}
			aSlides = this.getSlides(iCurPartId);

			bScoredLow = (this.getScorePercentByPartId(iCurPartId) < dBenchmarkScore); // if less than 80%
			
			for (var iJ = 0; iJ < aSlides.length; iJ++) {
				if (bScoredLow == false && (iSlideCnt + 1) % 4 == 0) {
					continue; // skip oral fuency slide
				}
				iSlideCnt++;

				iSlideId = (
					typeof aSlides[iJ].getData == 'function'?
					aSlides[iJ].getData('slideId'):
					(
						typeof aSlides[iJ].getMeta == 'function'?
						aSlides[iJ].getMeta('part') + '' + aSlides[iJ].getMeta('slide'):
						''
					)
				);
				
				if ((oSlideInfo = _.findWhere(aSlides4mData, { slideID: iSlideId })) === undefined) {
					if (iJ == 0) {
						var oSlide = this.getSlides(iPrevPartId, this['get' + ((iPrevPartId == 0)? 'First': 'Last') + 'SlideIdByPart'].call(this, iCurPartId));
						return oSlide;
					}
					if (iSlideCnt < aSlides4mData.length) {
						continue;
					}
					return aSlides[iJ - 1];
				}
				
				if (oSlideInfo.slideIsCorrect == false) {
					return aSlides[iJ];
				}
				
				if (iSlideCnt == aSlides4mData.length) {				
					return aSlides[iJ];
				}
			}
			iPrevPartId = iCurPartId;
		}
		
		return this.getSlides(iCurPartId, this.getLastSlideIdByPart(iCurPartId));
	};
	this.initSlide = function (piPartId, piSlideId) {
		var oSelf = this,
			iPartId = parseInt(piPartId),
			iSlideId = parseInt(piSlideId);
			
		if (
			isNaN(iPartId) ||
			(aPartIds.indexOf(iPartId) == -1)
		) {
			throw "Init Slide: Invalid Part ID or Part ID not set";
		}
			
		var oSlide = oSelf.getSlides(iPartId, iSlideId),
			sSlideType = oSlide.getSlideType();
		
		switch (sSlideType) {
			case 'projectorslide':
				oSlide.init();
				break;
			case oSelf.c_s_TYPE_TPL_PHONICTEXTBASEDSLIDE:
			case oSelf.c_s_TYPE_TPL_SYLLABLES:
			case oSelf.c_s_TYPE_TPL_WORD_SORT:
			case oSelf.c_s_TYPE_TPL_WORD_FAMILIES:
			case oSelf.c_s_TYPE_TPL_DIGRAPHS:
			case oSelf.c_s_TYPE_TPL_PLURALNOUNS:
			case oSelf.c_s_TYPE_TPL_ROTATING_LISTS:
				oSlide.init(iPartId + '' + iSlideId, oSlide.getData('model')['1']);
				break;
		}
	};
	this.getScorePercentByPartId = function (piPartId) {
		var aSlides = [],
			dTotalPartScore = 0,
			dTotalMaxScore = 0,
			sSlideDomId = '',
			sSlideId = '',
			fPercentScore = 0,
			aItemSlides = ((AssigmentSlides.studentAttemptData || {}).itemSlides || []),
			dSlideScore = 0;
		
		if (!(aItemSlides instanceof Array)) {
			aItemSlides = [];
		}
		
		aSlides = this.getSlides(piPartId);
		
		for (var iIndex = 0; iIndex < aSlides.length; iIndex++) {
			if (typeof aSlides[iIndex].getData != 'function') {
				continue;
			}
			iSlideId = aSlides[iIndex].getData('slideId') || -1;
			dMaxScore = 0;
			try {
				dMaxScore = parseFloat(aSlides[iIndex].getMeta('maxScore'));
			}
			catch (oException) {
				
			}
			dTotalMaxScore += (isNaN(dMaxScore)? 0: dMaxScore);
			dSlideScore = (parseFloat(((_.findWhere(aItemSlides, { slideID: iSlideId }) || {}) || {}).slideScore) || 0);
			dTotalPartScore += dSlideScore;
		}
		fPercentScore = parseFloat(((dTotalPartScore / dTotalMaxScore) * 100).toFixed(2));
		return fPercentScore;
	};
	
	this.getTotMaxScore = function () {
	  var aSlides = [],
	   dTotalMaxScore = 0;   
	  
	  for (var iI = 0; iI < aPartIds.length; iI++) {
	   piPartId = aPartIds[iI];  
	   aSlides = this.getSlides(piPartId);
	   
	   for (var iIndex = 0; iIndex < aSlides.length; iIndex++) {
		if (typeof aSlides[iIndex].getData != 'function') {
		 continue;
		}    
		dMaxScore = 0;
		try {
		 dMaxScore = parseFloat(aSlides[iIndex].getMeta('maxScore'));
		}
		catch (oException) {
		 
		}
		dTotalMaxScore += (isNaN(dMaxScore)? 0: dMaxScore);    
	   }   
	  }
	  return dTotalMaxScore;
	 };
 
	// private:
	function locate (psNeedle, poHayStack) {
		var mixVal = null;
		
		if (typeof poHayStack == 'undefined' || poHayStack == null) {        
		   return mixVal;
		}
		if (typeof poHayStack != 'object') {
		   return mixVal;
		}
		
		if (psNeedle in poHayStack) {
		   return poHayStack[psNeedle];
		}
		
		if (poHayStack instanceof Array) {
			for (var key = 0; key < poHayStack.length; key++) {
			   if ((mixVal = this.digJson(poHayStack[key], psNeedle)) != null) {
				   return mixVal;
			   }
			}
		}
		else {    
			for (var key in poHayStack) {
			   if ((mixVal = this.digJson(poHayStack[key], psNeedle)) != null) {
				   return mixVal;
			   }
			}
		}
		return mixVal;
	}
	function loadSlides () {
		var sSlideType = '',
			oSlideInfo = null,
			sSlideQuestionId = null,
			iSlideCount = 0,
			bEvaluateSlide = false,
			oPartInfo = oSelf.getModel(oSelf.c_s_ASSIGNMENT_PARTS_KEY);
			
		for (var iIndex = 0; iIndex < aParts.length; iIndex++) {
			var iPartId = ((aParts[iIndex].match(/Part([0-9]+)/i) || []).fetch(1) || 0);
				
			if (iPartId == 0) {
				continue;
			}
			
			iSlideCount = 0;
			for (var iSlideId in oPartInfo[aParts[iIndex]]) {
				iSlideCount++;				
				oSlideInfo = oPartInfo[aParts[iIndex]][iSlideId];
				sSlideType = ((oSlideInfo[oSelf.c_s_TOC_KEYS_TYPE] || oSlideInfo['assignmentType']) || '');
				sSlideQuestionId = (
					(oSlideInfo[oSelf.c_s_KEY_QUESTION_ID_4M_CMS] || oSlideInfo['assignmentID']) ||
					oSlideInfo['_id']
				);
				bEvaluateSlide = false;
				
				switch (sSlideType) {
					case 'projectorslide':
						oHandler['slides'][iPartId + '-' + iSlideId] = new (function (poSlideInfo, piPartId, piSlideId) {
							var svideoccPath='', 
								svideoADPath ='';
								if(poSlideInfo.video_cc_file!=null)
									svideoccPath = poSlideInfo.video_cc_file;
								if(poSlideInfo.video_description_file!=null)
									svideoADPath = poSlideInfo.video_description_file;
							var oInfo =	{
									'video':		poSlideInfo.video,
									'pageTitle':	poSlideInfo.page_title,
									'slideTitle':	poSlideInfo.slide_title,
									'part':			piPartId,
									'slide':		piSlideId,
									'slideDomId':	AssigmentSlides.referenceKey + '___' + piPartId + '' + piSlideId,
									'videoccPath' :     svideoccPath,
									'videoADPath' :     svideoADPath,
								};
								
							this.prepareTemplate = function () {
								var sMediaPath = AssigmentSlides.videoPath,
									sAssignmentId = getMeta('ItemId');
									
								if ((aItemIdChunks = sAssignmentId.split('_')).length > 1) {
									var sProdGradeId = aItemIdChunks.first();
									
									sMediaPath = sMediaPath.replace(sProdGradeId + '_', '');
								}								
								this.iCntVideoSlide = Math.floor(Math.random() * 100) + 1 ; // ILIT- 4938
								oInfo['template'] = _.template(
									$("#" + oSelf.c_s_TYPE_TPL_FRS_VIDEO).html(), {
										'video':			oInfo.video,
										'header': 			oInfo.pageTitle,
										'partId':			piPartId,
										'slideId':			piSlideId,
										'mediaPath': 		sMediaPath,
										'referenceKey': 	AssigmentSlides.referenceKey,
										'videoccPath' :     oInfo.videoccPath,
										'videoADPath' :     oInfo.videoADPath,
										'iCntVideoSlide':   this.iCntVideoSlide
									}
								);
								$('#' + ASSIGNMENTS.c_s_PREV).focus();
								$('#assignmentPrev, .video_container button, #prevPagingBtn, #nextPagingBtn,.vjs-volume-bar').tooltip();
							};
							this.getTemplate = function () {
								this.prepareTemplate();
								
								return oInfo['template'];
							};
							this.toString = function () {
								return JSON.stringify(oInfo);
							};
							this.getSlideType = function () {
								return 'projectorslide';
							};
							this.init = function () {
								$("#" + oSelf.c_s_SLIDE_INNER_CONTAINER).append(this.getTemplate());
								this.captionTrack = $('#captionsTrack').attr('src');
								this.DescriptionTrack = $('#ADTrack').attr('src');
								this.bindEvents();
								this.resize();
							};
							this.bindEvents = function(){
							     //ILIT-5334
								if($('.studyPlan_practice_video_wrapper').length > 0 && $('.studyPlan_practice_video_wrapper').hasClass('frs_container')){
									$('.studyPlan_practice_video_wrapper  video').on('play',function(e){
							
										if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity") || $(this).parent().hasClass('valid-activity')){
											callLogUserActivity(e); 
										}
									})
								}
							};
							this.resize = function () {
								var iWindowHeight = $(window).height(),
									iHeaderHeight = $("header").outerHeight(),
									iPaginationHeight = 30,
									iActualHeight = iWindowHeight - iHeaderHeight - iPaginationHeight,
									iBoxHeight = iActualHeight - 60, // margin top bottom 30px
									iTopBottomGap =  iActualHeight - iBoxHeight,
									fMarginTop = iTopBottomGap/2,
									sSlideId = this.getSlideDomId(),
									iBoxInnerHeight = 0;
								
								$("#"+sSlideId+" .frs_container.studyPlan_practice_video_wrapper").css("height",iBoxHeight+'px');
								$("#"+sSlideId+" .frs_container.studyPlan_practice_video_wrapper").css('margin-top',fMarginTop+'px');
								
								iBoxInnerHeight = iBoxHeight - (
										parseFloat($("#"+sSlideId+" .new_assignment_irr.new_assignment_irr_sp_video").css('padding-top').replace('px', '')) + 
										parseFloat($("#"+sSlideId+" .new_assignment_irr.new_assignment_irr_sp_video").css('padding-bottom').replace('px', ''))
										);
														
								$("#"+sSlideId+" .new_assignment_irr.new_assignment_irr_sp_video").css("height",iBoxInnerHeight+'px');
								$("#"+sSlideId+" .page_container_video").css("height",iBoxInnerHeight+'px');
							};
							this.getIsComplete = function () {
								return true;
							};
							this.getSlideDomId = function () {
								return oInfo['slideDomId'];
							};
							this.getMeta = function (psKey) {
								if (['part', 'slide'].indexOf(psKey) == -1) {
									throw "Invalid meta information is sought";
								}
								
								return oInfo[psKey];
							};
							this.setVisited = function () {
								var iSlideId = this.getMeta('part') + '' + this.getMeta('slide'),
									sSlideType = 'projectorslide',
									iSlideAttempt = 1,
									oSlideInfo = {},
									iIndex = 0,
									aItemSlides = (
										(AssigmentSlides.studentAttemptData || {}).itemSlides || []
									);
								
								for (iIndex = 0; iIndex < aItemSlides.length; iIndex++) {
									if (aItemSlides[iIndex].slideID == iSlideId) {
										oSlideInfo = aItemSlides[iIndex];
										break;
									}
								}
								
								oSlideInfo = {
									"slideID":			iSlideId,
									"slideType":		sSlideType,
									"slideAttempt":		iSlideAttempt,
									"slideIsCorrect":	true,
									"slideScore":		(
										(isNaN(parseFloat(oSlideInfo.slideScore)) === false)?
										parseFloat(oSlideInfo.slideScore):
										GENERAL.c_s_SPECIAL_CHARACTERS_BLANK
									),
									"slideInputData":	(
										oSlideInfo.slideInputData !== undefined?
										oSlideInfo.slideInputData:
										{}
									)
								};
								
								if (iIndex < aItemSlides.length) {
									aItemSlides[iIndex] = oSlideInfo;
								}
								else {
									aItemSlides.push(oSlideInfo);
								}
								
								AssigmentSlides.studentAttemptData = {
									"itemId": 			(AssignmentsView.slideDataValue.split('___') || []).fetch(1),
									"itemSlides": 		aItemSlides,
									'submitStatus':		GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'reAssignedStatus':	GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'itemType':			ASSIGNMENTS.c_s_TYPE_TPL_FRS,
									'oralFluencyData': (oSelf.oralFluencyData.length > 0) ? encodeURIComponent(JSON.stringify(oSelf.oralFluencyData)) : []
								};
							};
						})(oSlideInfo, iPartId, iSlideId);
						break;
						
					case oSelf.c_s_TYPE_TPL_PHONICTEXTBASEDSLIDE:
					case oSelf.c_s_TYPE_TPL_SYLLABLES:
					case oSelf.c_s_TYPE_TPL_WORD_SORT:
					case oSelf.c_s_TYPE_TPL_WORD_FAMILIES:
					case oSelf.c_s_TYPE_TPL_DIGRAPHS:
					case oSelf.c_s_TYPE_TPL_PLURALNOUNS:
					case oSelf.c_s_TYPE_TPL_ROTATING_LISTS:						
						FRSPhonicHandler = function (poSuper) {
							var $this = this,
								oData = {},
								oMethods = {},
								oSuper = {};
								
							function _extends (poSuper) {
								oSuper = $.extend({}, oSuper, poSuper);
							}
							
							/*==== Override Common Methods ====*/
							this.getConstantsRef = function () {
								return oSelf;
							};
							this.prepare4View = function () {
								var sMethodName = 'prepare4View4' + this.getSlideType().camelize();
								if (typeof oMethods[sMethodName] == 'function') {
									oMethods[sMethodName].call(this);
									return;
								}
								
								oSuper.prepare4View.call(this);
							};
							this.bindEvents = function () {
								var sMethodName = 'bindEvents4' + this.getSlideType().camelize();
								if (typeof oMethods[sMethodName] == 'function') {
									oMethods[sMethodName].call($this);
									return;
								}
								
								oSuper.bindEvents.call($this);
							};
							this.resize = function () {
								var sMethodName = 'resize4' + this.getSlideType().camelize();
								if (typeof oMethods[sMethodName] == 'function') {
									oMethods[sMethodName].call($this);
									return;
								}
								
								oSuper.resize.call($this);
							};
							this.render = function () {
								var sMethodName = 'render4' + this.getSlideType().camelize();
								if (typeof oMethods[sMethodName] == 'function') {
									oMethods[sMethodName].call($this);
									$('#' + this.getSlideDomId()).attr('data-allow-swipe-next', String(this.getIsComplete()));
									return;
								}
								
								oSuper.render.call($this);
								$('#' + this.getSlideDomId()).attr('data-allow-swipe-next', String(this.getIsComplete()));
							};						
							this.practiceSubmit = function () {
								var sMethodName = 'practiceSubmit4' + this.getSlideType().camelize();
								if (typeof oMethods[sMethodName] == 'function') {
									oMethods[sMethodName].call($this);
									return;
								}
								
								oSuper.practiceSubmit.call($this);
							};
							this.comprehensionSubmit = function () {
								var sMethodName = 'comprehensionSubmit4' + this.getSlideType().camelize();
								if (typeof oMethods[sMethodName] == 'function') {
									oMethods[sMethodName].call($this);
									return;
								}
								
								oSuper.comprehensionSubmit.call($this);
							};
							this.submitAnswer = function () {
								var sMethodName = 'submitAnswer4' + this.getSlideType().camelize();
								if (typeof oMethods[sMethodName] == 'function') {
									oMethods[sMethodName].call($this);
									return;
								}
								
								oSuper.submitAnswer.call($this);
							};
							this.fetchAttemptData = function () {
								var sMethodName = 'fetchAttemptData4' + this.getSlideType().camelize();
								if (typeof oMethods[sMethodName] == 'function') {
									return oMethods[sMethodName].call($this);
								}
								
								return oSuper.fetchAttemptData.call($this);
							};
							/*== End Override Common Methods ==*/
							
							this.setVisited = function () {
								var iSlideId = this.getData('slideId'),
									sSlideType = this.getSlideType(),
									iSlideAttempt = 1,
									oSlideInfo = {},
									iIndex = 0,
									aItemSlides = (
										(AssigmentSlides.studentAttemptData || {}).itemSlides || []
									);
								
								for (iIndex = 0; iIndex < aItemSlides.length; iIndex++) {
									if (aItemSlides[iIndex].slideID == iSlideId) {
										oSlideInfo = aItemSlides[iIndex];
										break;
									}
								}
									
								oSlideInfo = {
									"slideID":			iSlideId,
									"slideType":		sSlideType,
									"slideAttempt":		iSlideAttempt,
									"slideIsCorrect":	(oSlideInfo.slideIsCorrect === true)? true: false,
									"slideScore":		(
										(isNaN(parseFloat(oSlideInfo.slideScore)) === false)?
										parseFloat(oSlideInfo.slideScore):
										GENERAL.c_s_SPECIAL_CHARACTERS_BLANK
									),
									"slideInputData":	(
										oSlideInfo.slideInputData !== undefined?
										oSlideInfo.slideInputData:
										{}
									)
								};
								
								if (iIndex == aItemSlides.length) {
									aItemSlides.push(oSlideInfo);
								}
								else {
									aItemSlides[iIndex] = oSlideInfo;
								}
								
								AssigmentSlides.studentAttemptData = {
									"itemId": 			(AssignmentsView.slideDataValue.split('___') || []).fetch(1),
									"itemSlides": 		aItemSlides,
									'submitStatus':		GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'reAssignedStatus':	GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'itemType':			ASSIGNMENTS.c_s_TYPE_TPL_FRS,
									'oralFluencyData': (oSelf.oralFluencyData.length > 0) ? encodeURIComponent(JSON.stringify(oSelf.oralFluencyData)) : []
								};
							};
							this.getOverrides = function () {
								return oMethods;
							}
							this.getSuper = function () {
								return oSuper;
							};
							this.toString = function () {
								return JSON.stringify(oData);
							};
							this.setData = function (psKey, mixValue) {
								if (typeof psKey != 'string') {									
									throw "Invalid data to set";
								}
								else if (psKey.length == 0) {
									throw "Invalid data to set";
								}
								else if (psKey.toLowerCase() == 'meta') {
									throw "Please use 'addMeta'";
								}
								
								oData[psKey] = mixValue;
																
								return oData[psKey];
							};
							this.getData = function (psKey) {
								if (
									typeof psKey != 'string' ||
									typeof oData[psKey] == 'undefined'
								) {
									return null;
								}
								
								if (psKey == 'meta') { // Does not return meta object
									return null;
								}
								
								return oData[psKey];
							};
							this.getMeta = function (psKey) {
								if (
									typeof psKey != 'string' ||
									typeof oData['meta'] == 'undefined' ||
									typeof oData['meta'][psKey] == 'undefined'
								) {
									return null;
								}
								
								return oData['meta'][psKey];
							};
							this.addMeta = function (pmixKey, mixValue) {
								if (typeof pmixKey != 'string') {								
									if (typeof pmixKey == 'object') {
										if (pmixKey instanceof Array) {
											throw "Invalid meta-data to set";
										}
										
										oData['meta'] = $.extend(true, {}, pmixKey);
										return oData['meta'];
									}
									
									throw "Invalid meta-data to set";
								}
								if (pmixKey.length == 0) {
									throw "Invalid meta-data to set";
								}
								
								if (typeof oData['meta'] == 'undefined') {
									oData['meta'] = {};
								}
								
								if (typeof oData[pmixKey] == 'undefined') {
									oData['meta'][pmixKey] = mixValue;
								}
								
								return oData['meta'][pmixKey];
							};
							this.getSlideType = function () {
								return this.getData('type');
							};
							this.getSlideDomId = function () {
								return this.getData('slideDomId');
							};
							this.getIsComplete = function () {
								var aItemSlides = [],
									oSlideInputData = {},
									iSlideId = this.getData('slideId'),
									sSlideType = this.getData('type');
									
								try {
									aItemSlides = (
										(AssigmentSlides.studentAttemptData || {}).itemSlides || []
									);
									oSlideInputData = (
										(
											_.findWhere(
												(aItemSlides || []),
												{ slideID: iSlideId }
											) ||
											{}
										) ||
										{}
									);
								}
								catch (oException) {
									oSlideInputData = {};
								}
								return (oSlideInputData.slideIsCorrect === true);
							};
							
							/*==== Changed Render for Different Assignment Types ====*/
							oMethods.render4Phonictextbasedslide = function () {
								var $this = this,
									sSlideId = $this.getData('slideDomId'),
									iSlideId = $this.getData('slideId'),
									iSlideNo = $this.getMeta('slide'),
									iPartId = $this.getMeta('part'),
									oCurrentSlide = oSelf.getSlides(iPartId, iSlideNo),
									sAssignmentId = (AssignmentsView.slideDataValue.split('___') || []).fetch(1),
									sOralFluencyPromptId = oCurrentSlide.getMeta('promptID'),
									sMediaPath = AssigmentSlides.mediaPath,
									sSubmitLabel = '',
									iSlideLength = 0,
									sLastSlideId = '',
									oLastSlide = {},
									sActualLastSlideId = '',
									bDisableIcons = false,
									bRejected = false,
									bDisplayScore = false,
									aOralFluencyData = [],
									iOralFluencySlideIndex = null;
									
								if ((aItemIdChunks = sAssignmentId.split('_')).length > 1) {
									var sProdGradeId = aItemIdChunks.first();
									
									sMediaPath = sMediaPath.replace(sProdGradeId + '_', '');
								}
								
								$this.studentAttemptSlideData = $this.fetchAttemptData();
								
								$('#' + ASSIGNMENTS.c_s_SLIDE_INNER_CONTAINER).append(
									_.template(
										$('#' + ASSIGNMENTS.c_s_TYPE_TPL_PHONICTEXTBASEDSLIDE).html(),
										{
											'data':	$this.model,
											'mediaPath': sMediaPath,
											'referenceKey':	sSlideId,				
											'slideType': $this.model.type
										}
									)
								);
								AssignmentsView.hideMainLoader();	
								
								/* put the slider template in the main template container */
								$('#' + sSlideId + ' #phonic_slides')
									.empty()
									.html(
										_.template(
											$('#phonic_slider_template').html(),
											{
												'slides' : $this.model.questions
											}
										)
									);
									
								try {	
									var oCurSlideData = (
										_.findWhere(
											((AssigmentSlides.getStudentAttemptForGradableItem() || {}).itemSlides || []),
											{ slideID: iSlideId }
										) || {}
									);
								}
								catch (oException) {
									
								}
								
								sSubmitLabel = $this.getSubmitLabel();
								
								if (sSubmitLabel == 'Submit') {
									iSlideLength = $('#' + sSlideId + ' #phonic_slides').find('.swiper-slide').length;
									sLastSlideId = $('#' + sSlideId + ' #phonic_slides .swiper-slide').eq(iSlideLength - 1).attr('id').replace('slide_','');
									oLastSlide = $this.model.questions[sLastSlideId];
									sActualLastSlideId = (oLastSlide.type == ASSIGNMENTS.c_s_SLIDE_TYPE_ORALFLUENCY) ?
													$('#' + sSlideId + ' #phonic_slides .swiper-slide').eq(iSlideLength - 2).attr('id').replace('slide_','') :
													sLastSlideId;									
								}
								
								$('#' + sSlideId + ' #phonic_slides').find('.swiper-slide').each(function () {
									var slide_id = $(this).attr('id').replace('slide_',''),
										slides = $this.model.questions[slide_id],
										tempSlidesData = $this.studentAttemptSlideData;
									
									var subSlideData = (
										(
											(oCurSlideData.slideInputData || {}).subSlides || []
										).fetch(slide_id) || ''
									);
									
									if (slides.type == ASSIGNMENTS.c_s_SLIDE_TYPE_COMPREHENSION) {
										$(this).empty().html(
											_.template(
												$('#phonic_comprehension_template').html(),
												{
													'data' : slides,
													'studentAttemptData':	subSlideData,
													'buttonLabel':	(slide_id == sActualLastSlideId) ? sSubmitLabel : "Score",
													'sAssignmentType': ASSIGNMENTS.c_s_TYPE_TPL_FRS
												}
											)
										);
									}
									else if (slides.type == ASSIGNMENTS.c_s_SLIDE_TYPE_PRACTICE) {
										var correctAnsArr = [],
											oInteractiveText = $this.model.interactive_text || {},
											sNewInteractiveText = '',
											sCorrectAns = '';
										
										if (typeof oInteractiveText == 'object') {										
											$.each(oInteractiveText, function(k,oCont){
								
												var _sImageAltText ='';
												if(oCont.image_alternative_text!=null && oCont.image_alternative_text!='undefined')
													_sImageAltText = oCont.image_alternative_text;

												sNewInteractiveText += (oCont.content_type == 'text') ? oCont.content : '<br><img src="media/'+oCont.content+'" alt="'+_sImageAltText+'"><br>';
											});	
										}
										else {
											sNewInteractiveText = oInteractiveText
										}

										$.each(slides.answers, function(k,ans){
											sCorrectAns = stripHtmlTagsFromString(sNewInteractiveText);				
											sCorrectAns = sCorrectAns.substr(ans.index, ans.length);
											correctAnsArr.push(sCorrectAns);
										});
										$this.correctAnswers[slide_id] = correctAnsArr;
										$this.maxScore[slide_id] = slides.max_score;
										$this.totMaxScore += slides.max_score;
										
										$(this).empty().html(
											_.template(
												$('#phonic_practice_template').html(),
												{
													'data':					slides,
													'studentAttemptData':	subSlideData,
													'slideId':				slide_id,
													'oSelf':				$this,
													'buttonLabel':			(slide_id == sActualLastSlideId) ? sSubmitLabel : "Score",
													'sAssignmentType': 		ASSIGNMENTS.c_s_TYPE_TPL_FRS
												}
											)
										);
									}
									else if (slides.type == ASSIGNMENTS.c_s_SLIDE_TYPE_ORALFLUENCY) {
										if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_ACTION) == POPUP_VIEW.c_s_ACTION_VIEW ||
											$_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR ||
											$_GET(POPUP_VIEW.c_s_QUERY_PARAM_ACTION) == POPUP_VIEW.c_s_ACTION_PLAY) {
												bDisableIcons = true;					
										}
										else {
											/*== check if this audio is rejected by teacher ==*/
											if ($.inArray(slides.question_id, oSelf.aRejectedQIds) != -1) {
												bRejected = true;
											}											
										}
										
										if (oSelf.PKTOralFluencyScore.length > 0 && 
											($_GET(POPUP_VIEW.c_s_QUERY_PARAM_ACTION) == POPUP_VIEW.c_s_ACTION_VIEW ||
											$_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR ||
											$_GET(POPUP_VIEW.c_s_QUERY_PARAM_ACTION) == POPUP_VIEW.c_s_ACTION_PLAY)
											) {
											bDisplayScore = true;				
										}
										
										try {
											aOralFluencyData = (AssigmentSlides.studentAttemptData && AssigmentSlides.studentAttemptData.oralFluencyData) ? 
														_.where(JSON.parse(decodeURIComponent(AssigmentSlides.studentAttemptData.oralFluencyData)), {'question_id' : slides.question_id}) :
														[];
										}
										catch (e) {
											aOralFluencyData = [];
										}
										
										$(this)
											.empty()
											.html(
												_.template(
													$("#phonic_oralfluency_template").html(),
													{
														"data":					slides,
														"studentAttemptData":	subSlideData,
														"slideId":				slide_id,
														"frsSlideId": 			$this.getMeta('slide'),
														"bDisableIcons": 		bDisableIcons,
														"bRejected" : 			bRejected,
														"buttonLabel":			(sSubmitLabel != 'Submit') ? "Save & Next" : sSubmitLabel,
														"oralFluencyPromptId" :	sOralFluencyPromptId,
														"bDisplayScore":		bDisplayScore,
														"objScore":				_.where(oSelf.PKTOralFluencyScore, {'QID' : slides.question_id}),
														"aOralFluencyData":		aOralFluencyData
													}
												)
											);										
										
										iOralFluencySlideIndex = $(this).attr("data-slidecount");										
										
										/*== if this is a rejected slide and yet not attempted by user ==*/									
										if (bRejected && (typeof subSlideData.isRejectedAttempted == 'undefined' || !subSlideData.isRejectedAttempted)) {
											oSelf.aRejectedSlideDomId.push(sSlideId); // add to rejected slideDomId list
										}										
									}
								});
												
								$this.wrapText();
								
								/*==== Hide 'Input Answer' Button & show right box ====*/
								$('#' + sSlideId + ' .continent_edit_box').css({
									'opacity': '1',
									'left': '0'
								});								
								
								var iContentInnerHeight = $('#' + sSlideId).find('.continent_content_inner_iscroll').height(),
									iEditBoxTitleHeight = $('#' + sSlideId).find('.edit_box_title').height(),
									iEditBoxPaddingTop = parseInt($('#' + sSlideId).find('.edit_box_title').css('padding-top')),
									iEditBoxPaddingBottom = parseInt($('#' + sSlideId).find('.edit_box_title').css('padding-bottom')),
									iContinentBoxInner = $('#' + sSlideId + ' .continent_box_inner'),
									iHeight = iContentInnerHeight + iEditBoxTitleHeight + iEditBoxPaddingTop  + iEditBoxPaddingBottom;
								
								/* if (iHeight < iContinentBoxInner.height() - 10) {									
									$('#' + sSlideId + ' .continent_content_inner_iscroll').css({'max-height':iHeight+'px'});
								} */
								$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_ASSIGN_TYPEIN_ELEM_INPUTBTNID).parent().hide();
								/*== End Hide 'Input Answer' Button ==*/
								
								$this.resize();
								$this.initSwiper();
								$this.loadControls();
								$this.saveDataInitially = true;
								
								// $this.updateAttemptData();
									
								if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_ACTION) == POPUP_VIEW.c_s_ACTION_VIEW) {
									var oCurrentSlide = $('#' + sSlideId);
									AssigmentSlides.prepare4View(oCurrentSlide);
								}
								
								$('#' + sSlideId + ' .continent_box_space').addClass('swiper-no-swiping');
								
								setTimeout(function(){
									$this.swiperFirstInit();
									$this.resize();
									$this.initIScroll();
									
									// swipe to rejected slide
									if (bRejected && iOralFluencySlideIndex != null && iOralFluencySlideIndex > 1) {
										$this.mySwiper.swipeTo(iOralFluencySlideIndex - 1);
									}
								}, 100);
							};
							/*== End Changed Render for Different Assignment Types ==*/

							/*==== Changed Update Attempt Data for Different Assignment Types ====*/
							oMethods.updateAttemptData4WordFamilies = function (poParent, bIsSubmitted) {
								var $this = this,
									sQuestionId = $this.getMeta('assignmentId'),
									iSlideAttempt = 1,
									iSlideId = $this.getData('slideId'),
									oSlideInputData = {},
									sSlideId = $this.getData('slideDomId'),
									iCorrectAnswers = 0,
									sDropBoxSelector = '#' + sSlideId + ' .col1_right .dropbox .myButtoninner',
									oCorrectedAnswers = {},
									oSelectedAnswers = {},
									oSlideInfo = {},
									aItemSlides = (AssigmentSlides.studentAttemptData || {}).itemSlides || [];
									
								if (!(aItemSlides instanceof Array)) {
									aItemSlides = [];
								}
									
								if (typeof bIsSubmitted != 'boolean') {
									bIsSubmitted = false;
								}
								
								for (var iIndex = 0; iIndex < $('' + sDropBoxSelector).length; iIndex++) {
									var oDropBox = $('' + sDropBoxSelector).eq(iIndex),
										sSelectedAnswer = oDropBox.text().trim(),
										iAnswerIndex = oDropBox.data('index'),
										sFamily = $('#' + sSlideId + ' #result-' + iAnswerIndex + ' .wordtext_answer').text().trim(),
										aCorrectAnswers = $this.correctAnswers[sFamily];
										
									if (sSelectedAnswer.toLowerCase() == ASSIGNMENTS.c_s_WORD_FAMILIES_DROP_LABEL.toLowerCase()) {
										continue;
									}
									
									var sWord = oDropBox.text().trim().toLowerCase() + sFamily.toLowerCase(),
										bCorrectness = ($.inArray(sWord, aCorrectAnswers) > -1);
										
									oSlideInputData[iIndex.toString()] = {
										'answer':		sSelectedAnswer,
										'correctness':	bCorrectness
									};
									if (bIsSubmitted === true) {
										$('#' + sSlideId + ' #result-' + iAnswerIndex).find('[class^="answer_"]').hide();
										$('#' + sSlideId + ' #result-' + iAnswerIndex).find('.answer_' + ((bCorrectness === true)? 'rt': 'wg')).show();
										if (bCorrectness) {
											iCorrectAnswers++;
										}
										/*==== Populate Selected Answers ====*/
										if (
											typeof oSelectedAnswers[sFamily] == 'undefined' ||
											!(oSelectedAnswers[sFamily] instanceof Array)
										) {
											oSelectedAnswers[sFamily] = new Array ();
										}
										oSelectedAnswers[sFamily].push(oDropBox.text().trim().toLowerCase() + sFamily.toLowerCase());
										/*== End Populate Selected Answers ==*/
									}
								}
								
								/*==== Put Question ID to Facilitate Skill-Based Reporting ====*/
								oSlideInputData[poParent.c_s_KEY_QUESTION_ID] = sQuestionId;
								/*== End Put Question ID to Facilitate Skill-Based Reporting ==*/
								
								oSlideInfo = {
									"slideID":			iSlideId,
									"slideType":		poParent.c_s_TYPE_TPL_WORD_FAMILIES,
									"slideAttempt":		iSlideAttempt,
									"slideIsCorrect":	(bIsSubmitted === true),
									"slideScore":		(
										(bIsSubmitted === true)?
										iCorrectAnswers * $this.weightPerQuestion:
										GENERAL.c_s_SPECIAL_CHARACTERS_BLANK
									),
									"slideInputData":	oSlideInputData
								};
								
								var iIndex = 0;
								for (; iIndex < aItemSlides.length; iIndex++) {
									if (aItemSlides[iIndex].slideID == iSlideId) {
										oSlideInfo['slideIsCorrect'] = (
											(bIsSubmitted === true)?
											true:
											(
												typeof aItemSlides[iIndex].slideIsCorrect === 'boolean'?
												aItemSlides[iIndex].slideIsCorrect:
												GENERAL.c_s_SPECIAL_CHARACTERS_BLANK
											)
										);
										aItemSlides[iIndex] = oSlideInfo;
										break;
									}
								}
								
								if (iIndex == aItemSlides.length) {
									aItemSlides.push(oSlideInfo);
								}
								
								AssigmentSlides.studentAttemptData = {
									"itemId": 			(AssignmentsView.slideDataValue.split('___') || []).fetch(1),
									"itemSlides": 		aItemSlides,
									'submitStatus':		GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'reAssignedStatus':	GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'itemType':			poParent.c_s_TYPE_TPL_FRS,
									'oralFluencyData': (oSelf.oralFluencyData.length > 0) ? encodeURIComponent(JSON.stringify(oSelf.oralFluencyData)) : []
								};

								AssigmentSlides.systemScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;
								AssigmentSlides.finalScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;	
								AssigmentSlides.itemComplete = poParent.c_s_INCOMPLETED_STATUS;	
								
								if (bIsSubmitted === true) {
									$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_WORD_FAMILIES_SUBMIT_ANSWER_ID).text(ASSIGNMENTS.c_s_BTN_LBL_NEXT);
									
									try {
										var sDragBoxSelector = '#' + sSlideId + ' .draggable_box',
											sDropBoxSelector = '#' + sSlideId + ' .col1_right .dropbox .myButtoninner';
										oDragAndDrop.removeDroppable(sDropBoxSelector);
										oDragAndDrop.removeDraggable(sDragBoxSelector);
									}
									catch (oException) {};
									
									$('#' + sSlideId).attr('data-allow-swipe-next', 'true');
									
									if ($this.getData('bEvaluateSlide') === true) {
										$this.evaluate();
									}
								}
							};
							oMethods.updateAttemptData4WordSort = function (poParent, bIsSubmitted) {
								var $this = this,
									sQuestionId = $this.getMeta('questionId'),
									iSlideId = $this.getData('slideId'),
									sSlideId = $this.getData('slideDomId'),
									sItemId = (AssignmentsView.slideDataValue.split('___') || []).fetch(1),
									iSlideAttempt = 1,
									oSlideInputData = {},
									iCorrectAnswers = 0,
									sDropBoxSelector = '#' + sSlideId + ' .col1_right .dropbox .myButtoninner',
									iTotalDropBoxes = $('' + sDropBoxSelector).length,
									oCorrectedAnswers = {},
									oSelectedAnswers = {},
									aItemSlides = (AssigmentSlides.studentAttemptData || {}).itemSlides || [];
									
								if (!(aItemSlides instanceof Array)) {
									aItemSlides = [];
								}
									
								if (typeof bIsSubmitted != 'boolean') {
									bIsSubmitted = false;
								}
								
								for (var iIndex = 0; iIndex < $('' + sDropBoxSelector).length; iIndex++) {
									var oDropBox = $('' + sDropBoxSelector).eq(iIndex),
										sSelectedAnswer = oDropBox.text().trim(),
										iAnswerIndex = oDropBox.data('index'),
										sFamily = oDropBox.data('family').trim(),
										aCorrectAnswers = $this.correctAnswers[sFamily];
										
									if (sSelectedAnswer == ASSIGNMENTS.c_s_WORD_SORT_DROP_LABEL) {
										continue;
									}
									
									var sWord = oDropBox.text().trim().toLowerCase(),
										bCorrectness = (jQuery.inArray(sWord, aCorrectAnswers) > -1);
										
									oSlideInputData[iIndex.toString()] = {
										'answer':		sSelectedAnswer,
										'correctness':	bCorrectness
									};
									if (bIsSubmitted === true) {
										$('#' + sSlideId + ' #result-' + iAnswerIndex).find('[class^="answer_"]').hide();
										$('#' + sSlideId + ' #result-' + iAnswerIndex).find('.answer_' + ((bCorrectness === true)? 'rt': 'wg')).show();
										if (bCorrectness) {
											iCorrectAnswers++;
										}
										/*==== Populate Selected Answers ====*/
										if (
											typeof oSelectedAnswers[sFamily] == 'undefined' ||
											!(oSelectedAnswers[sFamily] instanceof Array)
										) {
											oSelectedAnswers[sFamily] = new Array ();
										}
										oSelectedAnswers[sFamily].push(oDropBox.text().trim().toLowerCase());
										/*== End Populate Selected Answers ==*/
									}
								}
								
								/*==== Put Question ID to Facilitate Skill-Based Reporting ====*/
								oSlideInputData[ASSIGNMENTS.c_s_KEY_QUESTION_ID] = sQuestionId;
								/*== End Put Question ID to Facilitate Skill-Based Reporting ==*/
								
								var oSlideInfo = {
									"slideID":			iSlideId,
									"slideType":		poParent.c_s_TYPE_TPL_WORD_SORT,
									"slideAttempt":		iSlideAttempt,
									"slideIsCorrect":	(bIsSubmitted === true),
									"slideScore":		(
										(bIsSubmitted === true)?
										iCorrectAnswers * $this.weightPerQuestion:
										GENERAL.c_s_SPECIAL_CHARACTERS_BLANK
									),
									"slideInputData":	oSlideInputData
								};
								
								var iIndex = 0;
								for (; iIndex < aItemSlides.length; iIndex++) {
									if (aItemSlides[iIndex].slideID == iSlideId) {
										oSlideInfo['slideIsCorrect'] = (
											(bIsSubmitted === true)?
											true:
											(
												typeof aItemSlides[iIndex].slideIsCorrect === 'boolean'?
												aItemSlides[iIndex].slideIsCorrect:
												GENERAL.c_s_SPECIAL_CHARACTERS_BLANK
											)
										);
										aItemSlides[iIndex] = oSlideInfo;
										break;
									}
								}
								
								if (iIndex == aItemSlides.length) {
									aItemSlides.push(oSlideInfo);
								}
								
								AssigmentSlides.studentAttemptData = {
									"itemId": 			(AssignmentsView.slideDataValue.split('___') || []).fetch(1),
									"itemSlides": 		aItemSlides,
									'submitStatus':		GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'reAssignedStatus':	GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'itemType':			poParent.c_s_TYPE_TPL_FRS,
									'oralFluencyData': (oSelf.oralFluencyData.length > 0) ? encodeURIComponent(JSON.stringify(oSelf.oralFluencyData)) : []
								};

								AssigmentSlides.systemScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;
								AssigmentSlides.finalScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;	
								AssigmentSlides.itemComplete = poParent.c_s_INCOMPLETED_STATUS;	
								
								if (bIsSubmitted === true) {						
									$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_WORD_SORT_SUBMIT_ANSWER_ID).text(ASSIGNMENTS.c_s_BTN_LBL_NEXT);
									
									try {
										var sDragBoxSelector = '#' + sSlideId + ' .draggable_box',
											sDropBoxSelector = '#' + sSlideId + ' .col1_right .dropbox .myButtoninner';
										oDragAndDrop.removeDroppable(sDropBoxSelector);
										oDragAndDrop.removeDraggable(sDragBoxSelector);
									}
									catch (oException) {};
									
									$('#' + sSlideId).attr('data-allow-swipe-next', 'true');
									
									if ($this.getData('bEvaluateSlide') === true) {
										$this.evaluate();
									}
								}
							};
							oMethods.updateAttemptData4Syllables = function (poParent, bIsSubmitted) {
								var sQuestionId = this.getMeta('questionId'),
									iSlideAttempt = 1,
									oSlideInputData = {},
									iCorrectAnswers = 0,
									sSlideId = this.getData('slideDomId'),
									iSlideId = this.getData('slideId'),
									sDropBoxSelector = '#' + sSlideId + ' .col1_right .dropbox .myButtoninner',
									iTotalQuestions = $('#' + sSlideId + ' [id^="syllables-drop-area-"]').length,
									oCorrectedAnswers = {},
									oSelectedAnswers = {},
									oModel = (this.getData('model') || {})['1'] || {},
									aItemSlides = (AssigmentSlides.studentAttemptData || {}).itemSlides || [];
									
								if (!(aItemSlides instanceof Array)) {
									aItemSlides = [];
								}
									
								if (typeof bIsSubmitted != 'boolean') {
									bIsSubmitted = false;
								}
								
								if (typeof oModel.questions == 'object') {
									for (var iQIndex in oModel.questions) {
										for (var iIndex = 0; iIndex < oModel.questions[iQIndex].drop_options.length; iIndex++) {
											var aSelectedAnswer = [],
												bCorrectness = true,
												iAnswerIndex = iIndex,
												aCorrectAnswers = [];
											
											/*==== Compute Correctness ====*/
											for (var iJ = 0; iJ < oModel.questions[iQIndex].drop_options[iIndex].answer.length; iJ++) {
												var sSelectedAnswer = $('#' + sSlideId + ' #syllables-drop-area-' + iIndex + ' .myButtoninner').eq(iJ).text().trim();
												/*==== Gather Selected Answers ====*/
												if (sSelectedAnswer.toLowerCase() === ASSIGNMENTS.c_s_SYLLABLES_DROP_LABEL.toLowerCase()) {
													sSelectedAnswer = '';
												}
												aSelectedAnswer.push(sSelectedAnswer);
												/*== End Gather Selected Answers ==*/
												
												/*==== Gather Correct Answers ====*/
												aCorrectAnswers.push(oModel.questions[iQIndex].drop_options[iIndex].answer[iJ]);
												/*== End Gather Correct Answers ==*/
												
												if (
													sSelectedAnswer.toLowerCase() != oModel.questions[iQIndex].drop_options[iIndex].answer[iJ].toLowerCase()
												) {
													if (bCorrectness === true) {
														bCorrectness = false;
													}
												}
											}
											/*== End Compute Correctness ==*/
											
											oSlideInputData[iIndex.toString()] = {
												'answer':		aSelectedAnswer,
												'correctness':	bCorrectness
											};
											
											if (bIsSubmitted === true) {
												$('#' + sSlideId + ' #result-' + iAnswerIndex).find('[class^="answer_"]').hide();
												$('#' + sSlideId + ' #result-' + iAnswerIndex).find('.answer_' + ((bCorrectness === true)? 'rt': 'wg')).show();
												if (bCorrectness) {
													iCorrectAnswers++;
												}
												else {
													$('#' + sSlideId + ' #result-' + iAnswerIndex + ' .wordtext_answer').html('<span class="wrg_ans">\
															' + aSelectedAnswer.join('/') + '\
														</span>\
														' + aCorrectAnswers.join('/')
													);
												}
											}
										}
									}
								}
								
								/*==== Put Question ID to Facilitate Skill-Based Reporting ====*/
								oSlideInputData[poParent.c_s_KEY_QUESTION_ID] = sQuestionId;
								/*== End Put Question ID to Facilitate Skill-Based Reporting ==*/
								
								oSlideInfo = {
									"slideID":			iSlideId,
									"slideType":		ASSIGNMENTS.c_s_TYPE_TPL_SYLLABLES,
									"slideAttempt":		iSlideAttempt,
									"slideIsCorrect":	(bIsSubmitted === true),
									"slideScore":		(
										(bIsSubmitted === true)?
										iCorrectAnswers * $this.weightPerQuestion:
										GENERAL.c_s_SPECIAL_CHARACTERS_BLANK
									),
									"slideInputData":	oSlideInputData
								};
								var iIndex = 0;
								for (; iIndex < aItemSlides.length; iIndex++) {
									if (aItemSlides[iIndex].slideID == iSlideId) {
										oSlideInfo['slideIsCorrect'] = (
											(bIsSubmitted === true)?
											true:
											(
												typeof aItemSlides[iIndex].slideIsCorrect === 'boolean'?
												aItemSlides[iIndex].slideIsCorrect:
												GENERAL.c_s_SPECIAL_CHARACTERS_BLANK
											)
										);
										aItemSlides[iIndex] = oSlideInfo;
										break;
									}
								}
								
								if (iIndex == aItemSlides.length) {
									aItemSlides.push(oSlideInfo);
								}
								
								AssigmentSlides.studentAttemptData = {
									"itemId": 			(AssignmentsView.slideDataValue.split('___') || []).fetch(1),
									"itemSlides": 		aItemSlides,
									'submitStatus':		GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'reAssignedStatus':	GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'itemType':			ASSIGNMENTS.c_s_TYPE_TPL_FRS,
									'oralFluencyData': (oSelf.oralFluencyData.length > 0) ? encodeURIComponent(JSON.stringify(oSelf.oralFluencyData)) : []
								};

								AssigmentSlides.systemScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;
								AssigmentSlides.finalScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;	
								AssigmentSlides.itemComplete = ASSIGNMENTS.c_s_INCOMPLETED_STATUS;	
								
								if (bIsSubmitted === true) {
									$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_SYLLABLES_SUBMIT_ANSWER_ID).text(ASSIGNMENTS.c_s_BTN_LBL_NEXT);
									
									try {
										var sDragBoxSelector = '#' + sSlideId + ' .draggable_box',
											sDropBoxSelector = '#' + sSlideId + ' .col1_right .dropbox .myButtoninner';
										oDragAndDrop.removeDroppable(sDropBoxSelector);
										oDragAndDrop.removeDraggable(sDragBoxSelector);
									}
									catch (oException) {};
									
									$('#' + sSlideId).attr('data-allow-swipe-next', 'true');
									
									if ($this.getData('bEvaluateSlide') === true) {
										$this.evaluate();
									}
								}
							};
							oMethods.updateAttemptData4Pluralnouns = function (poParent, bIsSubmitted) {
								var sSlideId = this.getData('slideDomId'),
									iSlideId = this.getData('slideId'),
									sQuestionId = this.getMeta('questionId'),
									iSlideAttempt = 1,
									oSlideInputData = {},
									iCorrectAnswers = 0,
									aItemSlides = (AssigmentSlides.studentAttemptData || {}).itemSlides || [];
									
								if (!(aItemSlides instanceof Array)) {
									aItemSlides = [];
								}
								
								if (typeof bIsSubmitted != 'boolean') {
									bIsSubmitted = false;
								}
								
								for (var iIndex = 0; iIndex < $('#' + sSlideId + ' .matching_container_answer .dropbox').length; iIndex++) {
									var oDropBox = $('#' + sSlideId + ' .matching_container_answer .dropbox').eq(iIndex),
										iTotalDropBoxes = $('#' + sSlideId + ' .matching_container_answer .dropbox').length,
										sSelectedAnswer = oDropBox.text().trim();
									if (sSelectedAnswer == ASSIGNMENTS.c_s_DROP_LABEL) {
										continue;
									}
									var bCorrectness = (
										oDropBox.parent().next().find('.wordtext_inner').text().trim().toLowerCase() == oDropBox.parent().prev().text().trim().pluralize().toLowerCase()
									);
									oSlideInputData[iIndex.toString()] = {
										'answer':		sSelectedAnswer,
										'correctness':	bCorrectness
									};
									if (bIsSubmitted === true) {
										oDropBox.parent().next().find('.word_text').find('[class^="answer_"]').hide();
										oDropBox.parent().next().find('.word_text').find('.answer_' + ((bCorrectness === true)? 'rt': 'wg')).show();
										if (bCorrectness) {
											iCorrectAnswers++;
										}
										else {
											var sCorrectAnswer = oDropBox.parent().prev().text().trim().pluralize(),
												sSelectedAnswer = oDropBox.parent().next().find('.wordtext_inner').text().trim();
											oDropBox.parent().next().find('.word_text').find('.wordtext_answer').html('<span class="wrg_ans">\
												' + sSelectedAnswer + '\
											</span>' + sCorrectAnswer);
										}
									}
								}
								
								/*==== Put Question ID to Facilitate Skill-Based Reporting ====*/
								oSlideInputData[poParent.c_s_KEY_QUESTION_ID] = sQuestionId;
								/*== End Put Question ID to Facilitate Skill-Based Reporting ==*/
								
								oSlideInfo = {
									"slideID":			iSlideId,
									"slideType":		ASSIGNMENTS.c_s_TYPE_TPL_SYLLABLES,
									"slideAttempt":		iSlideAttempt,
									"slideIsCorrect":	(bIsSubmitted === true),
									"slideScore":		(
										(bIsSubmitted === true)?
										iCorrectAnswers * $this.weightPerQuestion:
										GENERAL.c_s_SPECIAL_CHARACTERS_BLANK
									),
									"slideInputData":	oSlideInputData
								};
								var iIndex = 0;
								for (; iIndex < aItemSlides.length; iIndex++) {
									if (aItemSlides[iIndex].slideID == iSlideId) {
										oSlideInfo['slideIsCorrect'] = (
											(bIsSubmitted === true)?
											true:
											(
												typeof aItemSlides[iIndex].slideIsCorrect === 'boolean'?
												aItemSlides[iIndex].slideIsCorrect:
												GENERAL.c_s_SPECIAL_CHARACTERS_BLANK
											)
										);
										aItemSlides[iIndex] = oSlideInfo;
										break;
									}
								}
								
								if (iIndex == aItemSlides.length) {
									aItemSlides.push(oSlideInfo);
								}
								
								AssigmentSlides.studentAttemptData = {
									"itemId": 			(AssignmentsView.slideDataValue.split('___') || []).fetch(1),
									"itemSlides": 		aItemSlides,
									'submitStatus':		GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'reAssignedStatus':	GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'itemType':			ASSIGNMENTS.c_s_TYPE_TPL_FRS,
									'oralFluencyData': (oSelf.oralFluencyData.length > 0) ? encodeURIComponent(JSON.stringify(oSelf.oralFluencyData)) : []
								};
								
								AssigmentSlides.systemScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;
								AssigmentSlides.finalScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;	
								AssigmentSlides.itemComplete = ASSIGNMENTS.c_s_INCOMPLETED_STATUS;	
								
								if (bIsSubmitted === true) {
									$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_PLURAL_NOUN_SUBMIT_ANSWER_ID).text(ASSIGNMENTS.c_s_BTN_LBL_NEXT);
									
									try {
										var sDragBoxSelector = '#' + sSlideId + ' .draggable_box',
											sDropBoxSelector = '#' + sSlideId + ' .col1_right .dropbox .myButtoninner';
										oDragAndDrop.removeDroppable(sDropBoxSelector);
										oDragAndDrop.removeDraggable(sDragBoxSelector);
									}
									catch (oException) {};
									
									$('#' + sSlideId).attr('data-allow-swipe-next', 'true');
									
									if ($this.getData('bEvaluateSlide') === true) {
										$this.evaluate();
									}
								}
							};
							oMethods.updateAttemptData4Digraphs = function (poParent, bIsSubmitted) {
								var $this = this,	
									iSlideId = $this.getData('slideId'),
									sSlideId = $this.getData('slideDomId'),
									sQuestionId = $this.getMeta('questionId'),
									iSlideAttempt = 1,
									oSlideInputData = {},
									iCorrectAnswers = 0,
									sDropBoxSelector = '#' + sSlideId + ' .matching_container_answer .dropbox .myButtoninner',
									aItemSlides = (AssigmentSlides.studentAttemptData || {}).itemSlides || [];
								
								if (!(aItemSlides instanceof Array)) {
									aItemSlides = [];
								}
									
								if (typeof bIsSubmitted != 'boolean') {
									bIsSubmitted = false;
								}
								
								for (var iIndex = 0; iIndex < $('' + sDropBoxSelector).length; iIndex++) {
									var oDropBox = $('' + sDropBoxSelector).eq(iIndex),
										iDropIndex = oDropBox.parent().parent().parent().data('drop-index'),
										sSelectedAnswer = oDropBox.text().trim(),
										sPrefix = $this.model.questions['0'].drop_options[iDropIndex].prefix,
										sSuffix = $this.model.questions['0'].drop_options[iDropIndex].suffix,
										sCorrectAnswer = '';
										
									try {
										sCorrectAnswer = $this.correctAnswers[iIndex];
									}
									catch (oException) {
										
									}

									if (
										sSelectedAnswer == ASSIGNMENTS.c_s_DIGRAPH_DROP_LABEL ||
										sCorrectAnswer.length == 0
									) {
										continue;
									}
									var bCorrectness = (
										oDropBox.text().trim().toLowerCase() == sCorrectAnswer.toLowerCase()
									);
									oSlideInputData[iIndex.toString()] = {
										'answer':		sSelectedAnswer,
										'correctness':	bCorrectness
									};
									if (bIsSubmitted === true) {
										oDropBox.parent().parent().next().next().find('[class^="answer_"]').hide();
										oDropBox.parent().parent().next().next().find('.answer_' + ((bCorrectness === true)? 'rt': 'wg')).show();
										if (bCorrectness) {
											iCorrectAnswers++;
										}
										else {
											var sCorrectPhrase = sPrefix + sCorrectAnswer + sSuffix,
												sSelectedPhrase = sPrefix + sSelectedAnswer + sSuffix;
											
											oDropBox.parent().parent().next().next().find('.wordtext_answer').html('<span class="wrg_ans">\
												' + sSelectedPhrase + '\
											</span>' + sCorrectPhrase);
										}
									}
								}
								
								if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_ASSIGNMENT_COMPLETION_STATUS) === ASSIGNMENT_INSTRUCTOR.c_i_SCORED_STATUS) {
									// ToDo
								}
								
								/*==== Put Question ID to Facilitate Skill-Based Reporting ====*/
								oSlideInputData[poParent.c_s_KEY_QUESTION_ID] = sQuestionId;
								/*== End Put Question ID to Facilitate Skill-Based Reporting ==*/
								
								oSlideInfo = {
									"slideID":			iSlideId,
									"slideType":		ASSIGNMENTS.c_s_TYPE_TPL_DIGRAPHS,
									"slideAttempt":		iSlideAttempt,
									"slideIsCorrect":	(bIsSubmitted === true),
									"slideScore":		(
										(bIsSubmitted === true)?
										iCorrectAnswers * $this.weightPerQuestion:
										GENERAL.c_s_SPECIAL_CHARACTERS_BLANK
									),
									"slideInputData":	oSlideInputData
								};
								var iIndex = 0;
								for (; iIndex < aItemSlides.length; iIndex++) {
									if (aItemSlides[iIndex].slideID == iSlideId) {
										oSlideInfo['slideIsCorrect'] = (
											(bIsSubmitted === true)?
											true:
											(
												typeof aItemSlides[iIndex].slideIsCorrect === 'boolean'?
												aItemSlides[iIndex].slideIsCorrect:
												GENERAL.c_s_SPECIAL_CHARACTERS_BLANK
											)
										);
										aItemSlides[iIndex] = oSlideInfo;
										break;
									}
								}
								
								if (iIndex == aItemSlides.length) {
									aItemSlides.push(oSlideInfo);
								}
								
								AssigmentSlides.studentAttemptData = {
									"itemId": 			(AssignmentsView.slideDataValue.split('___') || []).fetch(1),
									"itemSlides": 		aItemSlides,
									'submitStatus':		GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'reAssignedStatus':	GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'itemType':			ASSIGNMENTS.c_s_TYPE_TPL_FRS,
									'oralFluencyData': (oSelf.oralFluencyData.length > 0) ? encodeURIComponent(JSON.stringify(oSelf.oralFluencyData)) : []
								};

								AssigmentSlides.systemScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;
								AssigmentSlides.finalScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;	
								AssigmentSlides.itemComplete = ASSIGNMENTS.c_s_INCOMPLETED_STATUS;
								
								if (bIsSubmitted === true) {
									$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_DIGRAPH_SUBMIT_ANSWER_ID).text(ASSIGNMENTS.c_s_BTN_LBL_NEXT);
									
									try {
										var sDragBoxSelector = '#' + sSlideId + ' .draggable_box',
											sDropBoxSelector = '#' + sSlideId + ' .col1_right .dropbox .myButtoninner';
										oDragAndDrop.removeDroppable(sDropBoxSelector);
										oDragAndDrop.removeDraggable(sDragBoxSelector);
									}
									catch (oException) {};
									
									$('#' + sSlideId).attr('data-allow-swipe-next', 'true');
									
									if ($this.getData('bEvaluateSlide') === true) {
										$this.evaluate();
									}
								}
							};
							oMethods.updateAttemptData4Phonictextbasedslide = function (poParent, bIsSubmitted) {
								var $this = this,
									oSlideInputData = $this.collectAttemptData(),
									iSlideId = $this.getData('slideId'),
									sSlideId = $this.getData('slideDomId'),
									sQuestionId = $this.getMeta('questionId'),
									itemType = $this.getSlideType(),
									oSlideInfo = {},
									aItemSlides = (AssigmentSlides.studentAttemptData || {}).itemSlides || [],
									iSlideAttempt = 1,
									oExistingInfo = {},
									bRejected = false;
								
								if (!(aItemSlides instanceof Array)) {
									aItemSlides = [];
								}
								
								oExistingInfo = (
									_.findWhere(
										aItemSlides,
										{ slideID: iSlideId }
									) ||
									{}
								);
								
								iSlideAttempt = oExistingInfo.slideAttempt || 1;
								
								oSlideInputData = $.extend(true, oSlideInputData, {"questionId" : sQuestionId});
								oSlideInfo = {
									"slideID":			iSlideId,
									"slideType":		ASSIGNMENTS.c_s_TYPE_TPL_PHONICTEXTBASEDSLIDE,
									"slideAttempt":		iSlideAttempt,
									"slideIsCorrect":	(bIsSubmitted === true),
									"slideScore":		(
										!isNaN(parseInt($this.score))?
										parseInt($this.score):
										(
											isNaN(parseInt(oExistingInfo.slideScore))?
											GENERAL.c_s_SPECIAL_CHARACTERS_BLANK:
											parseInt(oExistingInfo.slideScore)
										)
									),
									"slideInputData":	oSlideInputData
								};								
								
								var iIndex = 0;
								for (; iIndex < aItemSlides.length; iIndex++) {
									if (aItemSlides[iIndex].slideID == iSlideId) {
										oSlideInfo['slideIsCorrect'] = (
											(bIsSubmitted === true)?
											true:
											(
												typeof aItemSlides[iIndex].slideIsCorrect === 'boolean'?
												aItemSlides[iIndex].slideIsCorrect:
												GENERAL.c_s_SPECIAL_CHARACTERS_BLANK
											)
										);
										aItemSlides[iIndex] = oSlideInfo;
										break;
									}
								}
								
								if (iIndex == aItemSlides.length) {
									aItemSlides.push(oSlideInfo);
								}
								
								/*== check if this audio is rejected by teacher ==*/
								if ($.inArray(sSlideId, oSelf.aRejectedSlideDomId) != -1) {
									bRejected = true;
								}
								
								AssigmentSlides.studentAttemptData = {
									"itemId": 			(AssignmentsView.slideDataValue.split('___') || []).fetch(1),
									"itemSlides": 		aItemSlides,
									'submitStatus':		GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'reAssignedStatus':	GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'itemType':			ASSIGNMENTS.c_s_TYPE_TPL_FRS
								};
								
								if (oSelf.oralFluencyData.length > 0) {
									AssigmentSlides.studentAttemptData.oralFluencyData = encodeURIComponent(JSON.stringify(oSelf.oralFluencyData));
								}
								else if (
									$this.studentAttemptDataObj.oralFluencyData && 
									$this.studentAttemptDataObj.oralFluencyData.length > 0 && 
									!bRejected
									) {
									AssigmentSlides.studentAttemptData.oralFluencyData = $this.studentAttemptDataObj.oralFluencyData;
									
									AssigmentSlides.bAudioExists = true;
								}								
	
								AssigmentSlides.systemScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;
								AssigmentSlides.finalScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;	
								AssigmentSlides.itemComplete = ASSIGNMENTS.c_s_INCOMPLETED_STATUS;
								
								if (bIsSubmitted === true) {
									$('#' + sSlideId).attr('data-allow-swipe-next', 'true');
									if ($this.getData('bEvaluateSlide') === true) {
										$this.evaluate();
									}
								}
							};
							oMethods.updateAttemptData4Rotatinglists = function (poParent, bIsSubmitted) {
								var oSlideInputData = $this.collectAttemptData(),
									iSlideAttempt = 1,
									iSlideId = $this.getData('slideId'),
									sQuestionId = $this.getMeta('questionId'),
									oSlideInfo = {},
									oExistingInfo = {};
								
								oExistingInfo = (
									_.findWhere(
										((AssigmentSlides.studentAttemptData || {}).itemSlides || []),
										{ slideID: iSlideId }
									) ||
									{}
								);
								
								iSlideAttempt = (
									isNaN(parseInt(oExistingInfo.slideAttempt))?
									1:
									parseInt(oExistingInfo.slideAttempt)
								);
								
								oSlideInputData = $.extend(true, oSlideInputData, {"questionId" : sQuestionId});
								oSlideInfo = {
									"slideID":			iSlideId,
									"slideType":		ASSIGNMENTS.c_s_TYPE_TPL_ROTATING_LISTS,
									"slideAttempt":		iSlideAttempt,
									"slideIsCorrect":	(bIsSubmitted === true),
									"slideScore":		(
										!isNaN(parseInt($this.score))?
										parseInt($this.score):
										(
											isNaN(parseInt(oExistingInfo.slideScore))?
											GENERAL.c_s_SPECIAL_CHARACTERS_BLANK:
											parseInt(oExistingInfo.slideScore)
										)
									),
									"slideInputData":	oSlideInputData
								};								
								
								var iIndex = 0;
								for (; iIndex < aItemSlides.length; iIndex++) {
									if (aItemSlides[iIndex].slideID == iSlideId) {
										oSlideInfo['slideIsCorrect'] = (
											(bIsSubmitted === true)?
											true:
											(
												typeof aItemSlides[iIndex].slideIsCorrect === 'boolean'?
												aItemSlides[iIndex].slideIsCorrect:
												GENERAL.c_s_SPECIAL_CHARACTERS_BLANK
											)
										);
										aItemSlides[iIndex] = oSlideInfo;
										break;
									}
								}
								
								if (iIndex == aItemSlides.length) {
									aItemSlides.push(oSlideInfo);
								}
								
								AssigmentSlides.studentAttemptData = {
									"itemId": 			(AssignmentsView.slideDataValue.split('___') || []).fetch(1),
									"itemSlides": 		aItemSlides,
									'submitStatus':		GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'reAssignedStatus':	GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
									'itemType':			ASSIGNMENTS.c_s_TYPE_TPL_FRS,
									'oralFluencyData': (oSelf.oralFluencyData.length > 0) ? encodeURIComponent(JSON.stringify(oSelf.oralFluencyData)) : []
								};

								AssigmentSlides.systemScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;
								AssigmentSlides.finalScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;	
								AssigmentSlides.itemComplete = ASSIGNMENTS.c_s_INCOMPLETED_STATUS;
								
								if (bIsSubmitted === true) {
									$('#' + sSlideId).attr('data-allow-swipe-next', 'true');
									if ($this.getData('bEvaluateSlide') === true) {
										$this.evaluate();
									}
								}
							};
							/*== End Changed Update Attempt Data for Different Assignment Types ==*/

							/*==== Changed Resize for Different Assignment Types ====*/
							oMethods.resize4Syllables = function () {
								var sSlideId = $this.getData('slideDomId');
								
								var dScreenHeight = document.documentElement.clientHeight,
									dTopTitleBarHeight = (
										$('#frs-pager').length > 0?
										(
											$('#frs-pager').height() +
											parseFloat($('#frs-pager').css('padding-top').replace('px', '')) +
											parseFloat($('#frs-pager').css('padding-bottom').replace('px', ''))
										):
										0
									),
									dHeaderHeight = (
										$('header').height() +
										parseFloat($('header').css('padding-top').replace('px', '')) +
										parseFloat($('header').css('padding-bottom').replace('px', ''))
									),
									dDirectionBarHeight = (
										$('#' + sSlideId + ' .phonicstext_content').length > 0?
										(
											$('#' + sSlideId + ' .phonicstext_content').height() +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('padding-top').replace('px', '')) +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('padding-bottom').replace('px', '')) +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('border-top-width').replace('px', '')) +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('border-bottom-width').replace('px', ''))
										):
										0
									),
									dPagerBarHeight = (
										$('.ui_slide_tabs').length > 0 ? 
										(
											parseFloat($('.ui_slide_tabs').height()) +
											parseFloat($('.ui_slide_tabs').css('padding-top').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('padding-bottom').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('margin-top').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('margin-bottom').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('border-top-width').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('border-bottom-width').replace('px', ''))
										):
										0
									),
									iPaginationHeight = 30,
									dSlideHeight = (
										dScreenHeight -
										dPagerBarHeight -
										dTopTitleBarHeight -
										dHeaderHeight -
										iPaginationHeight -
										dDirectionBarHeight - 10 // Found by inspection
									);
								
								$this.layout.setBaseHeight(dSlideHeight);
								oSuper.resize.call($this);
								
								/*==== Manage Height of Activity Areas from Both Sides ====*/
								$('#' + sSlideId + ' [id^="syllables-drop-area-"]').each(function (iIndex) {
									var oDragElem = $('#' + sSlideId + ' #syllable-bank-' + iIndex),
										dDragAreaAddlHeight = (
											parseFloat(oDragElem.css('padding-top').replace('px', '')) +
											parseFloat(oDragElem.css('border-top-width').replace('px', '')) +
											parseFloat(oDragElem.css('padding-bottom').replace('px', '')) +
											parseFloat(oDragElem.css('border-bottom-width').replace('px', ''))
										),
										dDragAreaHeight = (
											parseFloat(oDragElem.css('height').replace('px', '')) +
											dDragAreaAddlHeight
										),
										oDropElem = $(this),
										dDropAreaAddlHeight = (
											parseFloat(oDropElem.css('padding-top').replace('px', '')) +
											parseFloat(oDropElem.css('border-top-width').replace('px', '')) +
											parseFloat(oDropElem.css('padding-bottom').replace('px', '')) +
											parseFloat(oDropElem.css('border-bottom-width').replace('px', ''))
										),
										dDropAreaHeight = (
											parseFloat(oDropElem.css('height').replace('px', '')) +
											dDropAreaAddlHeight
										),
										dResHeight = Math.max(dDragAreaHeight, dDropAreaHeight);
									
									oDragElem.css('height', (dResHeight - dDragAreaAddlHeight).toFixed(2) + 'px');
									oDropElem.css('height', (dResHeight - dDropAreaAddlHeight).toFixed(2) + 'px');
								});
								/*== End Manage Height of Activity Areas from Both Sides ==*/
							};
							oMethods.resize4Pluralnouns = function () {
								var sSlideId = $this.getData('slideDomId'),
									dScreenHeight = document.documentElement.clientHeight,
									dTopTitleBarHeight = (
										$('#frs-pager').length > 0?
										(
											$('#frs-pager').height() +
											parseFloat($('#frs-pager').css('padding-top').replace('px', '')) +
											parseFloat($('#frs-pager').css('padding-bottom').replace('px', ''))
										):
										0
									),
									dHeaderHeight = (
										$('header').height() +
										parseFloat($('header').css('padding-top').replace('px', '')) +
										parseFloat($('header').css('padding-bottom').replace('px', ''))
									),
									dDirectionBarHeight = (
										$('#' + sSlideId + ' .phonicstext_content').length > 0?
										(
											$('#' + sSlideId + ' .phonicstext_content').height() +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('padding-top').replace('px', '')) +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('padding-bottom').replace('px', '')) +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('border-top-width').replace('px', '')) +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('border-bottom-width').replace('px', ''))
										):
										0
									),
									dPagerBarHeight = (
										$('.ui_slide_tabs').length > 0 ?
										(
											parseFloat($('.ui_slide_tabs').height()) +
											parseFloat($('.ui_slide_tabs').css('padding-top').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('padding-bottom').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('margin-top').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('margin-bottom').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('border-top-width').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('border-bottom-width').replace('px', ''))
										):
										0
									),
									iPaginationHeight = 30,
									dSlideHeight = (
										dScreenHeight -
										dPagerBarHeight -
										dTopTitleBarHeight -
										dHeaderHeight -
										iPaginationHeight -
										dDirectionBarHeight - 10 // Found by inspection
									);
								
								$this.layout.setBaseHeight(dSlideHeight);
								oSuper.resize.call($this);
							};
							oMethods.resize4WordFamilies = function () {
								var $this = this,
									sSlideId = $this.getData('slideDomId'),
									dScreenHeight = document.documentElement.clientHeight,
									dTopTitleBarHeight = (
										$('#frs-pager').length > 0?
										(
											$('#frs-pager').height() +
											parseFloat($('#frs-pager').css('padding-top').replace('px', '')) +
											parseFloat($('#frs-pager').css('padding-bottom').replace('px', ''))
										):
										0										
									),
									dHeaderHeight = (
										$('header').height() +
										parseFloat($('header').css('padding-top').replace('px', '')) +
										parseFloat($('header').css('padding-bottom').replace('px', ''))
									),
									dDirectionBarHeight = (
										$('#' + sSlideId + ' .phonicstext_content').length > 0?
										(
											$('#' + sSlideId + ' .phonicstext_content').height() +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('padding-top').replace('px', '')) +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('padding-bottom').replace('px', '')) +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('border-top-width').replace('px', '')) +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('border-bottom-width').replace('px', ''))
										):
										0
									),
									dPagerBarHeight = (
										$('.ui_slide_tabs').length > 0 ?
										(
											parseFloat($('.ui_slide_tabs').height()) +
											parseFloat($('.ui_slide_tabs').css('padding-top').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('padding-bottom').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('margin-top').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('margin-bottom').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('border-top-width').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('border-bottom-width').replace('px', ''))
										):
										0
									),
									iPaginationHeight = 30,
									dSlideHeight = (
										dScreenHeight -
										dPagerBarHeight -
										dTopTitleBarHeight -
										dHeaderHeight -
										iPaginationHeight -
										dDirectionBarHeight - 10 // Found by inspection
									);
								
								$this.layout.setBaseHeight(dSlideHeight);
								oSuper.resize.call($this);
							};
							oMethods.resize4Digraphs = function () {
								var $this = this,
									sSlideId = $this.getData('slideDomId');
									
								var dScreenHeight = document.documentElement.clientHeight,
									dTopTitleBarHeight = (
										$('#frs-pager').length > 0?
										(
											$('#frs-pager').height() +
											parseFloat($('#frs-pager').css('padding-top').replace('px', '')) +
											parseFloat($('#frs-pager').css('padding-bottom').replace('px', ''))
										):
										0
									),
									dHeaderHeight = (
										$('header').height() +
										parseFloat($('header').css('padding-top').replace('px', '')) +
										parseFloat($('header').css('padding-bottom').replace('px', ''))
									),
									dDirectionBarHeight = (
										$('#' + sSlideId + ' .phonicstext_content').length > 0?
										(
											$('#' + sSlideId + ' .phonicstext_content').height() +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('padding-top').replace('px', '')) +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('padding-bottom').replace('px', '')) +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('border-top-width').replace('px', '')) +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('border-bottom-width').replace('px', ''))
										):
										0
									),
									dPagerBarHeight = (
										$('.ui_slide_tabs').length > 0 ?
										(
											parseFloat($('.ui_slide_tabs').height()) +
											parseFloat($('.ui_slide_tabs').css('padding-top').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('padding-bottom').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('margin-top').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('margin-bottom').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('border-top-width').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('border-bottom-width').replace('px', ''))
										):
										0
									),
									iPaginationHeight = 30,
									dSlideHeight = (
										dScreenHeight -
										dPagerBarHeight -
										dTopTitleBarHeight -
										dHeaderHeight -
										iPaginationHeight -
										dDirectionBarHeight - 10 // Found by inspection
									);
								
								$this.layout.setBaseHeight(dSlideHeight);
								oSuper.resize.call($this);
							};
							oMethods.resize4WordSort = function () {
								var $this = this,
									sSlideId = $this.getData('slideDomId');
								
								var dScreenHeight = document.documentElement.clientHeight,
									dTopTitleBarHeight = (
										$('#frs-pager').length > 0?
										(
											$('#frs-pager').height() +
											parseFloat($('#frs-pager').css('padding-top').replace('px', '')) +
											parseFloat($('#frs-pager').css('padding-bottom').replace('px', ''))
										):
										0
									),
									dHeaderHeight = (
										$('header').height() +
										parseFloat($('header').css('padding-top').replace('px', '')) +
										parseFloat($('header').css('padding-bottom').replace('px', ''))
									),
									dDirectionBarHeight = (
										$('#' + sSlideId + ' .phonicstext_content').length > 0?
										(
											$('#' + sSlideId + ' .phonicstext_content').height() +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('padding-top').replace('px', '')) +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('padding-bottom').replace('px', '')) +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('border-top-width').replace('px', '')) +
											parseFloat($('#' + sSlideId + ' .phonicstext_content').css('border-bottom-width').replace('px', ''))
										):
										0
									),
									dPagerBarHeight = (
										$('.ui_slide_tabs').length > 0 ?
										(
											parseFloat($('.ui_slide_tabs').height()) +
											parseFloat($('.ui_slide_tabs').css('padding-top').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('padding-bottom').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('margin-top').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('margin-bottom').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('border-top-width').replace('px', '')) +
											parseFloat($('.ui_slide_tabs').css('border-bottom-width').replace('px', ''))
										):
										0
									),
									iPaginationHeight = 30,
									dSlideHeight = (
										dScreenHeight -
										dPagerBarHeight -
										dTopTitleBarHeight -
										dHeaderHeight -
										iPaginationHeight -
										dDirectionBarHeight - 10 // Found by inspection
									);
								
								$this.layout.setBaseHeight(dSlideHeight);
								oSuper.resize.call($this);
							};
							oMethods.resize4Rotatinglists = function () {
								var $this = this,
									sSlideId = $this.getData('slideDomId'),
									window_height = $(window).height(),
									header = $("header").outerHeight(),
									iPaginationHeight = 30,
									actual_height = window_height - header - iPaginationHeight;
									
								var phonicstext_direction_height = $('#'+ sSlideId +' .phonicstext_content').outerHeight();
								var frs_heading_height = ($(".study_plain_heading").length) ? $(".study_plain_heading").outerHeight() : 0;
								var frs_ui_tabs_height = ($(".ui_slide_tabs").length) ? $(".ui_slide_tabs").outerHeight() : 0;
										
								var left_box_height = actual_height - (phonicstext_direction_height + frs_heading_height + frs_ui_tabs_height + 60);// margin top bottom 30px	
								
								$('#'+ sSlideId +' .WordSlam_container').css("height",left_box_height+'px');			
								
								var top_bottom_gap =  65;
								var margin_top = top_bottom_gap / 2;		
								$('#'+ sSlideId +' .WordSlam_container').css('margin-top', margin_top + 'px');
								
								oSuper.resize.call($this);
							};
							/*== End Changed Resize for Different Assignment Types ==*/

							/*==== Changed Bind Events for Different Assignment Types ====*/
							oMethods.bindEvents4Phonictextbasedslide = function () {
								var sSlideId = $this.getData('slideDomId');
								
								$('#' + sSlideId + '.main_swiper_slide.swiper-slide-visible .continent_box_space')
									.on('touchstart mousedown', function () {
										AssigmentSlides.slidingEngine.params.noSwiping = true;
										// $('#' + sSlideId + '.main_swiper_slide.swiper-slide-visible').addClass('swiper-no-swiping');
									});
								
								$('#' + sSlideId + ' .main_swiper_slide.swiper-slide-visible .continent_edit_box')
									.on('touchstart mousedown', function () {	
										AssigmentSlides.slidingEngine.params.noSwiping = true;
										// $('#' + sSlideId + ' .main_swiper_slide.swiper-slide-visible').addClass('swiper-no-swiping');
									});
								
								oSuper.bindEvents.call($this);
							};
							oMethods.bindEvents4Digraphs = function () {
								var $this = this,
									sSlideId = $this.getSlideDomId();
									
								oSuper.bindEvents.call($this);
								
								$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_DIGRAPH_SUBMIT_ANSWER_ID)
									.off('click tap')
									.on('click tap', function () {
										if ($(this).text() == ASSIGNMENTS.c_s_BTN_LBL_NEXT) { 
											$("#nextPagingBtn").trigger('click'); 
											return;
										}
										$this.updateAttemptData(true); // bIsSubmitted = true
									});
							};
							oMethods.bindEvents4Syllables = function () {
								var $this = this,
									sSlideId = $this.getSlideDomId();
									
								oSuper.bindEvents.call($this);
								
								$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_SYLLABLES_SUBMIT_ANSWER_ID)
									.off('click tap')
									.on('click tap', function () {
										if ($(this).text() == ASSIGNMENTS.c_s_BTN_LBL_NEXT) { 
											$("#nextPagingBtn").trigger('click'); 
											return;
										}
										$this.updateAttemptData(true); // bIsSubmitted = true
									});
							};
							oMethods.bindEvents4WordSort = function () {
								var $this = this,
									sSlideId = $this.getSlideDomId();
									
								oSuper.bindEvents.call($this);
								
								$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_WORD_SORT_SUBMIT_ANSWER_ID)
									.off('click tap')
									.on('click tap', function () {
										if ($(this).text() == ASSIGNMENTS.c_s_BTN_LBL_NEXT) { 
											$("#nextPagingBtn").trigger('click'); 
											return;
										}
										$this.updateAttemptData(true); // bIsSubmitted = true
									});
							};
							oMethods.bindEvents4WordFamilies = function () {
								var $this = this,
									sSlideId = $this.getSlideDomId();
									
								oSuper.bindEvents.call($this);
								
								$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_WORD_FAMILIES_SUBMIT_ANSWER_ID)
									.off('click tap')
									.on('click tap', function () {
										if ($(this).text() == ASSIGNMENTS.c_s_BTN_LBL_NEXT) { 
											$("#nextPagingBtn").trigger('click'); 
											return;
										}
										$this.updateAttemptData(true); // bIsSubmitted = true
									});
							};
							oMethods.bindEvents4Pluralnouns = function () {
								var $this = this,
									sSlideId = $this.getSlideDomId();
									
								oSuper.bindEvents.call($this);
								
								$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_PLURAL_NOUN_SUBMIT_ANSWER_ID)
									.off('click tap')
									.on('click tap', function () {
										if ($(this).text() == ASSIGNMENTS.c_s_BTN_LBL_NEXT) { 
											$("#nextPagingBtn").trigger('click'); 
											return;
										}
										$this.updateAttemptData(true); // bIsSubmitted = true
									});
							};
							/*== End Changed Bind Events for Different Assignment Types ==*/

							/*==== Change Practice Submit for Phonic Text-Based Assignments ====*/
							oMethods.practiceSubmit4Phonictextbasedslide = function() {
								oSuper.practiceSubmit.call(this);
								
								if ($('#'+ this.getSlideDomId() +' .swiper-nested1 .swiper-slide-visible .practice_submit').text() == ASSIGNMENTS.c_s_BTN_LBL_NEXT) { 
									$("#"+ this.getSlideDomId() +" #phonic_slides .pagination .swiper-visible-switch").next().trigger('click'); 
									return;
								}								
								if (this.finalSubmit === true) {
									this.updateAttemptData(true);
								}
																		
								var oSwiperVisible = $("#"+ this.getSlideDomId() +" #phonic_slides .swiper-slide-visible"),
									oUl = $(oSwiperVisible).find(".phonic_dropbox"),
									oLi = $(oUl).find(".text_search");	
								
								if (oLi.length > 0) {				
									$('.swiper-nested1 .swiper-slide-visible .practice_submit').removeClass('disabled btndisabled')
										.prop('disabled', false)
										.text(ASSIGNMENTS.c_s_BTN_LBL_NEXT);
								}	
							};
							oMethods.comprehensionSubmit4Phonictextbasedslide = function() {
								oSuper.comprehensionSubmit.call(this);
								
								if ($('#'+ this.getSlideDomId() +' .swiper-nested1 .swiper-slide-visible .comprehension_submit').text() == ASSIGNMENTS.c_s_BTN_LBL_NEXT) { 
									$("#"+ this.getSlideDomId() +" #phonic_slides .pagination .swiper-visible-switch").next().trigger('click'); 
									return;
								}
								if (this.finalSubmit === true) {
									this.updateAttemptData(true);
								}
								
								var oSwiperVisible = $("#"+ this.getSlideDomId() +" #phonic_slides .swiper-slide-visible"),
									oLi = $(oSwiperVisible).find("ul.question_part > li.active"),
									oUl = $(oSwiperVisible).find("ul.question_part");
								
								if (oLi.length > 0) {				
									$('.swiper-nested1 .swiper-slide-visible .comprehension_submit').removeClass('disabled btndisabled')
										.prop('disabled', false)
										.text(ASSIGNMENTS.c_s_BTN_LBL_NEXT);
								}								
							};
							/*== End Change Practice Submit for Phonic Text-Based Assignments ==*/

							/*==== Change Fetch Attempt Data for Different Assignment Types ====*/
							oMethods.fetchAttemptData4Phonictextbasedslide = function () {
								var $this = this,
									oStudentAttempt = {},
									oSlideInputData = {},
									iSlideId = $this.getData('slideId');
									
								$this.studentAttemptDataObj = {
									itemSlides:	[]
								};
								
								if ((oStudentAttempt = AssigmentSlides.studentAttemptData) !== null) {
									oSlideInputData = (
										(
											_.findWhere(
												(oStudentAttempt.itemSlides || []),
												{ slideID: iSlideId }
											) ||
											{}
										).slideInputData ||
										{}
									);
									$this.studentAttemptDataObj = oStudentAttempt;
								}
								return oSlideInputData;
							};
							oMethods.fetchAttemptData4WordSort = function () {
								var $this = this,
									oStudentAttempt = {},
									oSavedData = {},
									iSlideId = $this.getData('slideId'),
									oSlideInputData = {};
								
								if ((oStudentAttempt = AssigmentSlides.studentAttemptData) !== null) {
									oSlideInputData = (
										(
											_.findWhere(
												(oStudentAttempt.itemSlides || []),
												{ slideID: iSlideId }
											) ||
											{}
										).slideInputData ||
										{}
									);
									for (var mixKey in oSlideInputData) {
										/*==== Handle Question ID in Slide Input Data ====*/
										if (mixKey == ASSIGNMENTS.c_s_KEY_QUESTION_ID) {
											continue;
										}
										/*== End Handle Question ID in Slide Input Data ==*/
										var iKey = mixKey;
										oSavedData[iKey] = oSlideInputData[iKey].answer;
									}
								}
									
								return oSavedData;
							};
							oMethods.fetchAttemptData4WordFamilies = function () {
								var $this = this,
									oStudentAttempt = {},
									oSavedData = {},
									iSlideId = $this.getData('slideId'),
									oSlideInputData = {};
								
								if ((oStudentAttempt = AssigmentSlides.studentAttemptData) !== null) {
									oSlideInputData = (
										(
											_.findWhere(
												(oStudentAttempt.itemSlides || []),
												{ slideID: iSlideId }
											) ||
											{}
										).slideInputData ||
										{}
									);
									for (var mixKey in oSlideInputData) {
										/*==== Handle Question ID in Slide Input Data ====*/
										if (mixKey == ASSIGNMENTS.c_s_KEY_QUESTION_ID) {
											continue;
										}
										/*== End Handle Question ID in Slide Input Data ==*/
										var iKey = mixKey;
										oSavedData[iKey] = oSlideInputData[iKey].answer;
									}
								}
								return oSavedData;
							};
							oMethods.fetchAttemptData4Digraphs = function () {
								var oSavedData = {},
									oStudentAttempt = {},
									iSlideId = this.getData('slideId'),
									oSlideInputData = {};
								
								if ((oStudentAttempt = AssigmentSlides.studentAttemptData) !== null) {
									oSlideInputData = (
										(
											_.findWhere(
												(oStudentAttempt.itemSlides || []),
												{ slideID: iSlideId }
											) ||
											{}
										).slideInputData ||
										{}
									);
									for (var mixKey in oSlideInputData) {
										/*==== Handle Question ID in Slide Input Data ====*/
										if (mixKey == ASSIGNMENTS.c_s_KEY_QUESTION_ID) {
											continue;
										}
										/*== End Handle Question ID in Slide Input Data ==*/
										var iKey = mixKey;
										oSavedData[iKey] = oSlideInputData[iKey].answer;
									}
								}
								
								return oSavedData;
							};
							oMethods.fetchAttemptData4Pluralnouns = function () {
								var oSavedData = {},
									oStudentAttempt = {},
									iSlideId = this.getData('slideId'),
									oSlideInputData = {};
								
								if ((oStudentAttempt = AssigmentSlides.studentAttemptData) !== null) {
									oSlideInputData = (
										(
											_.findWhere(
												(oStudentAttempt.itemSlides || []),
												{ slideID: iSlideId }
											) ||
											{}
										).slideInputData ||
										{}
									);
									for (var mixKey in oSlideInputData) {
										/*==== Handle Question ID in Slide Input Data ====*/
										if (mixKey == ASSIGNMENTS.c_s_KEY_QUESTION_ID) {
											continue;
										}
										/*== End Handle Question ID in Slide Input Data ==*/
										var iKey = mixKey;
										oSavedData[iKey] = oSlideInputData[iKey].answer;
									}
								}
								
								return oSavedData;
							};
							oMethods.fetchAttemptData4Syllables = function () {
								var oSavedData = {},
									oStudentAttempt = {},
									oSlideInputData = {},
									iSlideId = this.getData('slideId');
									
								if ((oStudentAttempt = AssigmentSlides.studentAttemptData) !== null) {
									oSavedData = {};
									oSlideInputData = (
										(
											_.findWhere(
												(oStudentAttempt.itemSlides || []),
												{ slideID: iSlideId }
											) ||
											{}
										).slideInputData ||
										{}
									);
									
									for (var mixKey in oSlideInputData) {
										/*==== Handle Question ID in Slide Input Data ====*/
										if (mixKey == ASSIGNMENTS.c_s_KEY_QUESTION_ID) {
											continue;
										}
										/*== End Handle Question ID in Slide Input Data ==*/
										var iKey = mixKey;
										oSavedData[iKey] = [];
										for (var iIdx = 0; iIdx < oSlideInputData[iKey].answer.length; iIdx++) {
											oSavedData[iKey].push(oSlideInputData[iKey].answer[iIdx]);
										}
									}
								}
								return oSavedData;
							};
							oMethods.fetchAttemptData4Rotatinglists = function () {
								var $this = this,
									oStudentAttempt = {},
									oSlideInputData = {},
									iSlideId = $this.getData('slideId');
									
								$this.studentAttemptDataObj = {
									itemSlides:	[]
								};
								
								if ((oStudentAttempt = AssigmentSlides.studentAttemptData) !== null) {
									oSlideInputData = (
										(
											_.findWhere(
												(oStudentAttempt.itemSlides || []),
												{ slideID: iSlideId }
											) ||
											{}
										).slideInputData ||
										{}
									);
									
									$this.studentAttemptDataObj = oStudentAttempt;
								}
									
								return oSlideInputData;
							};
							/*== End Change Fetch Attempt Data for Different Assignment Types ==*/

							/*==== Change prepare4View for Different Assignment Types ====*/
							oMethods.prepare4View4Pluralnouns = function () {
								var sSlideId = this.getSlideDomId(),
									sDragBoxSelector = '#' + sSlideId + ' .draggable_box',
									bCorrectness = false,
									bIsSlideComplete = this.getIsComplete();
									
								if (
									$_GET(POPUP_VIEW.c_s_QUERY_PARAM_ASSIGNMENT_COMPLETION_STATUS) === ASSIGNMENT_INSTRUCTOR.c_i_SCORED_STATUS ||
									bIsSlideComplete === true
								) {
									var oSlideInputData = $.extend(
											{},
											(
												(
													_.findWhere(
														(AssigmentSlides.getStudentAttemptForGradableItem() || {}).itemSlides || [],
														{ slideID: iSlideId }
													) || {}
												).slideInputData || {}
											)
										),
										sCorrectAnswer = '',
										sSelectedAnswer = '',
										oDropBox = null;
										
									if (bIsSlideComplete === true) {
										oSlideInputData = $.extend(
											{},
											(
												(
													_.findWhere(
														(AssigmentSlides.studentAttemptData || {}).itemSlides || [],
														{ slideID: iSlideId }
													) || {}
												).slideInputData || {}
											)
										);
									}
									
									delete oSlideInputData[oSelf.c_s_KEY_QUESTION_ID];
									
									for (var iIndex = 0; iIndex < $('#' + sSlideId + ' .matching_container_answer .dropbox').length; iIndex++) {
										oDropBox = $('#' + sSlideId + ' .matching_container_answer .dropbox').eq(iIndex);
										sSelectedAnswer = oDropBox.text().trim();
										bCorrectness = (oSlideInputData[iIndex] || {}).correctness || false;
										
										oDropBox.parent().next().find('.word_text').find('[class^="answer_"]').hide();
										oDropBox.parent().next().find('.word_text').find('.answer_' + ((bCorrectness === true)? 'rt': 'wg')).show();
										if (bCorrectness !== true) {
											if (oDropBox.parent().next().find('.word_text').find('.wordtext_answer').find('.wrg_ans').length == 0) {
												sCorrectAnswer = oDropBox.parent().prev().text().trim().pluralize();
												sSelectedAnswer = oDropBox.parent().next().find('.wordtext_inner').text().trim();
												
												oDropBox.parent().next().find('.word_text').find('.wordtext_answer').html('<span class="wrg_ans">\
													' + sSelectedAnswer + '\
												</span>' + sCorrectAnswer);
											}
										}
									}
									
									/*== ILIT-960  ==*/
									$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_PLURAL_NOUN_SUBMIT_ANSWER_ID)
										.text(ASSIGNMENTS.c_s_BTN_LBL_NEXT)
										.removeClass('btndisabled disabled')
										.attr('disabled', false);
								}
								else {
									$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_PLURAL_NOUN_SUBMIT_ANSWER_ID)
										.off('click tap')
										.attr('disabled', true)
										.addClass('btndisabled disabled');
								}
								
								oDragAndDrop.removeDraggable(sDragBoxSelector);
							};
							oMethods.prepare4View4Syllables = function () {
								var iSlideId = this.getData('slideId'),
									sSlideId = this.getSlideDomId(),
									bIsSlideComplete = this.getIsComplete();
									
								/*==== IPP-2144 ====*/
								if (
									$_GET(POPUP_VIEW.c_s_QUERY_PARAM_ASSIGNMENT_COMPLETION_STATUS) === ASSIGNMENT_INSTRUCTOR.c_i_SCORED_STATUS ||
									bIsSlideComplete === true
								) {
									var oSlideInputData = $.extend(
											{},
											(
												(
													_.findWhere(
														(AssigmentSlides.getStudentAttemptForGradableItem() || {}).itemSlides || [],
														{ slideID: iSlideId }
													) || {}
												).slideInputData || {}
											)
										),
										aCorrectAnswers = this.getCorrectAnswers(),
										bCorrectness = false;
										
									if (bIsSlideComplete === true) {
										oSlideInputData = $.extend(
											{},
											(
												(
													_.findWhere(
														(AssigmentSlides.studentAttemptData || {}).itemSlides || [],
														{ slideID: iSlideId }
													) || {}
												).slideInputData || {}
											)
										);
									}
									
									delete oSlideInputData[oSelf.c_s_KEY_QUESTION_ID];
									
									for (var iAnswerIndex in oSlideInputData) {
										bCorrectness = oSlideInputData[iAnswerIndex].correctness;
										$('#' + sSlideId + ' #result-' + iAnswerIndex).find('[class^="answer_"]').hide();
										$('#' + sSlideId + ' #result-' + iAnswerIndex).find('.answer_' + ((bCorrectness === true)? 'rt': 'wg')).show();
										if (bCorrectness !== true) {
											$('#' + sSlideId + ' #result-' + iAnswerIndex + ' .wordtext_answer').html('<span class="wrg_ans">\
													' + oSlideInputData[iAnswerIndex].answer.join('/') + '\
												</span>\
												' + aCorrectAnswers[iAnswerIndex]
											);
										}
									}
									
									/*== ILIT-960 ==*/
									$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_SYLLABLES_SUBMIT_ANSWER_ID)
									.text(ASSIGNMENTS.c_s_BTN_LBL_NEXT)
									.removeClass('btndisabled disabled')
									.attr('disabled', false);
								
								}
								else {
									/*== End IPP-2144 ==*/
									$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_SYLLABLES_SUBMIT_ANSWER_ID)
										.off('click tap')
										.addClass('btndisabled disabled')
										.attr('disabled', true);
								}
									
								oDragAndDrop.removeDraggable('#' + sSlideId + ' .draggable_box');
							};
							oMethods.prepare4View4WordSort = function () {
								var sSlideId = this.getSlideDomId(),
									sDragBoxSelector = '#' + sSlideId + ' .draggable_box',
									sDropBoxSelector = '#' + sSlideId + ' .col1_right .dropbox .myButtoninner',
									bCorrectness = false,
									sAnswer = '',
									bIsSlideComplete = this.getIsComplete(),
									iSlideId = this.getData('slideId');
									
								if (
									$_GET(POPUP_VIEW.c_s_QUERY_PARAM_ASSIGNMENT_COMPLETION_STATUS) === ASSIGNMENT_INSTRUCTOR.c_i_SCORED_STATUS ||
									bIsSlideComplete === true
								) {
									var oSlideInputData = $.extend(
											{},
											(
												(
													_.findWhere(
														(AssigmentSlides.getStudentAttemptForGradableItem() || {}).itemSlides || [],
														{ slideID: iSlideId }
													) || {}
												).slideInputData || {}
											)
										),
										sCorrectAnswer = '',
										sSelectedAnswer = '',
										oDropBox = null;
										
									if (bIsSlideComplete === true) {
										oSlideInputData = $.extend(
											{},
											(
												(
													_.findWhere(
														(AssigmentSlides.studentAttemptData || {}).itemSlides || [],
														{ slideID: iSlideId }
													) || {}
												).slideInputData || {}
											)
										);
									}
									
									delete oSlideInputData[oSelf.c_s_KEY_QUESTION_ID];
									
									for (var iIndex = 0; iIndex < $('' + sDropBoxSelector).length; iIndex++) {
										$('#' + sSlideId + ' #result-' + iIndex).find('[class^="answer_"]').hide();
										bCorrectness = ((oSlideInputData[iIndex.toString()] || {}).correctness || false);
										sAnswer = ((oSlideInputData[iIndex.toString()] || {}).answer || '');
										if (sAnswer.length == 0) {
											continue;
										}
										$('#' + sSlideId + ' #result-' + iIndex + ' .answer_' + ((bCorrectness === true)? 'rt': 'wg')).show();
									}
									
									/*== ILIT-960  ==*/
									$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_WORD_SORT_SUBMIT_ANSWER_ID)
									.text(ASSIGNMENTS.c_s_BTN_LBL_NEXT)
									.removeClass('btndisabled disabled')
									.attr('disabled', false);
								}
								else {
									$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_WORD_SORT_SUBMIT_ANSWER_ID)
										.off('click tap')
										.attr('disabled', true)
										.addClass('btndisabled disabled');
								}
								
								oDragAndDrop.removeDraggable(sDragBoxSelector);
							};
							oMethods.prepare4View4WordFamilies = function () {};
							oMethods.prepare4View4Digraphs = function () {
								var sSlideId = this.getSlideDomId(),
									sDragBoxSelector = '#' + sSlideId + ' .draggable_box',
									sDropBoxSelector = '#' + sSlideId + ' .matching_container_answer .dropbox .myButtoninner',
									bIsSlideComplete = this.getIsComplete();
									
								if ($_GET(POPUP_VIEW.c_s_QUERY_PARAM_ASSIGNMENT_COMPLETION_STATUS) === ASSIGNMENT_INSTRUCTOR.c_i_SCORED_STATUS) {
									var oSlideInputData = $.extend(
											{},
											(
												(
													_.findWhere(
														(AssigmentSlides.getStudentAttemptForGradableItem() || {}).itemSlides || [],
														{ slideID: iSlideId }
													) || {}
												).slideInputData || {}
											)
										),
										bCorrectness = false,
										oDropBox = null,
										iDropIndex = -1,
										sSelectedAnswer = '',
										sPrefix = '',
										sSuffix = '',
										sCorrectAnswer = '';
										
									if (bIsSlideComplete === true) {
										oSlideInputData = $.extend(
											{},
											(
												(
													_.findWhere(
														(AssigmentSlides.studentAttemptData || {}).itemSlides || [],
														{ slideID: iSlideId }
													) || {}
												).slideInputData || {}
											)
										);
									}
										
									delete oSlideInputData[oSelf.c_s_KEY_QUESTION_ID];
									
									for (var iIndex = 0; iIndex < $('' + sDropBoxSelector).length; iIndex++) {
										oDropBox = $('' + sDropBoxSelector).eq(iIndex);
										iDropIndex = oDropBox.parent().parent().parent().data('drop-index');
										sSelectedAnswer = oDropBox.text().trim();
										sPrefix = this.model.questions['0'].drop_options[iDropIndex].prefix;
										sSuffix = this.model.questions['0'].drop_options[iDropIndex].suffix;
										sCorrectAnswer = '';
											
										try {
											sCorrectAnswer = this.correctAnswers[iIndex];
										}
										catch (oException) {
											
										}

										if (sCorrectAnswer.length == 0) {
											continue;
										}
										bCorrectness = (oSlideInputData[iIndex] || {}).correctness || false;
																				
										oDropBox.parent().parent().next().next().find('[class^="answer_"]').hide();
										oDropBox.parent().parent().next().next().find('.answer_' + ((bCorrectness === true)? 'rt': 'wg')).show();
										if (bCorrectness !== true) {
											var sCorrectPhrase = sPrefix + sCorrectAnswer + sSuffix,
												sSelectedPhrase = sPrefix + sSelectedAnswer + sSuffix;
											
											oDropBox.parent().parent().next().next().find('.wordtext_answer').html('<span class="wrg_ans">\
												' + sSelectedPhrase + '\
											</span>' + sCorrectPhrase);
										}
									}
									
									/*== ILIT-960  ==*/
									$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_DIGRAPH_SUBMIT_ANSWER_ID)
										.text(ASSIGNMENTS.c_s_BTN_LBL_NEXT)
										.removeClass('btndisabled disabled')
										.attr('disabled', false);
								}
								else {
									$('#' + sSlideId + ' #' + ASSIGNMENTS.c_s_BTN_DIGRAPH_SUBMIT_ANSWER_ID)
										.off('click tap')
										.attr('disabled', true)
										.addClass('btndisabled disabled');
								}
								
								oDragAndDrop.removeDraggable(sDragBoxSelector);
							};
							/*== End Change prepare4View for Different Assignment Types ==*/
							_extends(poSuper);
						};
						
						FRSPhonicHandler.prototype = AssigmentSlides.getResponsibleObject(sSlideType);
						FRSPhonicHandler.prototype.constructor = FRSPhonicHandler;
						
						FRSPhonicHandler.prototype.updateAttemptData = function (bIsSubmitted) {
							if (typeof this.getMeta != 'function') {
								return;
							}
							if (typeof bIsSubmitted != 'boolean') {
								bIsSubmitted = false;
							}
							/*==== Manage Final Submit ====*/
							var $this = this,
								bIsPartComplete = true,
								iPartId = $this.getMeta('part'),
								aSiblings = oSelf.getSlides(iPartId),
								oSlide = {},
								iMySlideId = $this.getData('slideId'),
								iCurSlideId = iMySlideId,
								oSuper = $this.getSuper(),
								oMethods = $this.getOverrides();
								
							for (var iIndex = 0; iIndex < (aSiblings.length - 1); iIndex++) { // not considering the last slide
								oSlide = aSiblings[iIndex];
								
								if (typeof oSlide.getData != 'function') { // projecterslide
									continue;
								}
								
								iCurSlideId = oSlide.getData('slideId');
								if (iCurSlideId == iMySlideId) {
									bIsPartComplete = bIsPartComplete && bIsSubmitted;
									continue;
								}
								bIsPartComplete = bIsPartComplete && oSlide.getIsComplete();
							}
								
							this.setData('bEvaluateSlide', bIsPartComplete);								
							/*== End Manage Final Submit ==*/
							
							var sMethodName = 'updateAttemptData4' + this.getSlideType().camelize();
							if (typeof oMethods[sMethodName] == 'function') {
								oMethods[sMethodName].call($this, oSelf, bIsSubmitted);
								return;
							}
							
							oSuper.updateAttemptData.call($this, bIsSubmitted);
						};
						
						if (sSlideType == oSelf.c_s_TYPE_TPL_SYLLABLES) {
							FRSPhonicHandler.prototype.getCorrectAnswers = function() {
								var oQuestions = (
										((this.getData('model') || {})['1'] || {}).questions ||
										{}
									),
									aCorrectAnswers = [];
								
								for (var iQIndex in oQuestions) {
									for (var iIndex = 0; iIndex < oQuestions[iQIndex].drop_options.length; iIndex++) {
										aCorrectAnswers.push(oQuestions[iQIndex].drop_options[iIndex].answer.join('/'));
									}
								}
								
								return aCorrectAnswers;
							};
						}
						else if (sSlideType == oSelf.c_s_TYPE_TPL_PLURALNOUNS) {}
						else if (sSlideType == oSelf.c_s_TYPE_TPL_PHONICTEXTBASEDSLIDE) {
							FRSPhonicHandler.prototype.getSubmitLabel = function() {
								 var $this = this,
									iPartId = $this.getMeta('part'),
									aSiblings = oSelf.getSlides(iPartId),
									oLastSlide = {},
									iLastIndex = aSiblings.length,
									iMySlideId = $this.getData('slideId'),
									iLastSlideId = null,
									iLastPartId = oSelf.getLastPartId();									
									
									oLastSlide = aSiblings[iLastIndex - 1]; 
									iLastSlideId = oLastSlide.getData('slideId');
								
								return (iPartId == iLastPartId && iMySlideId == iLastSlideId) ? "Submit" : "Score";
							};
							FRSPhonicHandler.prototype.oralfluencyReservationCall = function(sPromptId, sAudioFileName, sAudioPath) {
								var $this = this,
									sTestInstanceId = '';
								
								$.monitor({
									'if':	function () {
										return (objOralfluencyReservationResponse != null);
									},
									'beforeStart':	function () {
										OralfluencyReservation();
									},
									'interval':		500,
									'then':	function () {			
										switch (objOralfluencyReservationResponse.responseHeader.status) {
											case 'SUCCESS':
												sTestInstanceId = objOralfluencyReservationResponse.testInstanceId;					
												$this.oralfluencySubmitScoreRequestCall(sPromptId, sAudioFileName, sAudioPath, sTestInstanceId);					
												break;					
											default:
												throw (objOralfluencyReservationResponse.Error);
										}			
									}
								});	
								
							}
							FRSPhonicHandler.prototype.oralfluencySubmitScoreRequestCall = function(sPromptId, sAudioFileName, sAudioPath, sTestInstanceId) {
								
								var $this = this,
									slide_id = $this.getSlideDomId(),
									iPartId = parseInt($this.getMeta('part')),
									oSwiperVisible = $("#"+ slide_id +" #phonic_slides .swiper-slide-visible"),
									oDiv = $(oSwiperVisible).find(".phonic_oralfluency_conts"),		
									sQuestionId = $(oDiv).attr('data-question-id'),
									aNewOralFluencyData = [];
								
								$.monitor({
									'if':	function () {
										return (objOralfluencySubmitScoreResponse != null);
									},
									'beforeStart':	function () {
										oSelf.bIsDataReady = false;
										OralfluencySubmitScoreRequest(sPromptId, sAudioFileName, sAudioPath, sTestInstanceId);
									},
									'interval':		500,
									'then':	function () {			
										switch (objOralfluencySubmitScoreResponse.responseHeader.status) {
											case 'SUCCESS':									
													$this.setOFDataNSave4FRS(sQuestionId, sAudioPath, sPromptId, sTestInstanceId);		
												break;					
											default:
												//throw (objOralfluencySubmitScoreResponse.responseHeader.failDetails.errorDetails);
												oUtility.hideLoader();
												$this._alert({
													divId:		'dialog-message',
													title:		'Alert!',
													message:	objOralfluencySubmitScoreResponse.responseHeader.failDetails.errorDetails
												});
										}			
									}
								});
								
							}
							FRSPhonicHandler.prototype.setOFDataNSave4FRS = function(sQuestionId, sAudioPath, sPromptId, sTestInstanceId) {
								var $this = this,
									iPartId = parseInt($this.getMeta('part')),									
									aNewOralFluencyData = [];
									
								/*== if rejected ==*/		

								//Epic-4 - Reassign
								if (! (AssignmentsView.productCode || '').startsWith("ilit20")){
									if (oSelf.oralFluencyData.length > 0){
										if(oSelf.oralFluencyData[0].question_id === sQuestionId && ($('.main_swiper_slide').find(".swiper-nested1 .phonic_oralfluency_conts").attr("data-rejected") == 'false')){
											oSelf.oralFluencyData.splice(0,1);
										}
									}
									
								}
								//End of Epic-4 -  Reassign

								if (oSelf.oralFluencyData.length > 0 && oSelf.PKTOralFluencyScore.length > 0) {
									$.each(oSelf.oralFluencyData, function (key, val) {
										if (val.question_id != sQuestionId) {
											aNewOralFluencyData[key] = val;
										}
										else {
											aNewOralFluencyData[key] = {
												"question_id": sQuestionId,
												"audiopath": sAudioPath,
												"promptid": sPromptId,
												"testInstanceId": sTestInstanceId,
												"parts": iPartId,
												"displayText": ASSIGNMENTS.c_s_DECODABLE_READER_TEXT
											}
										}
									});
									oSelf.oralFluencyData = aNewOralFluencyData;
								}
								else {
									oSelf.oralFluencyData.push({
												"question_id": sQuestionId,
												"audiopath": sAudioPath,
												"promptid": sPromptId,
												"testInstanceId": sTestInstanceId,
												"parts": iPartId,
												"displayText": ASSIGNMENTS.c_s_DECODABLE_READER_TEXT
											});
								}
								oSelf.dataSet4NoScorePromptID = true;
								$this.updateAttemptData();
							}					
							
							FRSPhonicHandler.prototype.oralSubmit = function(oElem) {
								var $this = this,
									sQuestionId = $this.getMeta('questionId'),
									iPartId = parseInt($this.getMeta('part')),
									iSlideId = parseInt($this.getMeta('slide')),
									sSlideId = $this.getData('slideDomId'),
									iPartSlideId = $this.getData('slideId');
									oSwiperVisible = $("#"+ sSlideId +" #phonic_slides .swiper-slide-visible"),
									oDiv = $(oSwiperVisible).find(".phonic_oralfluency_conts"),
									sSubSlideId = $(oSwiperVisible).attr('id').replace('slide_',''),
									sSubSlideType = $(oSwiperVisible).find('.Phinics_question').data('type'),
									isVisited = $(oSwiperVisible).hasClass('visited') ? true : false,
									sAssignmentId = AssigmentSlides.oAssignmentKeyData['assignmentId'],									
									sPromptId = $(oDiv).attr('data-prompt-id'),
									//sPromptId = ASSIGNMENTS.c_s_PROMPT_ID,
									sQId = $(oDiv).attr('data-question-id'),									
									sAudioPath = null,	
									oSlideInputData = {},
									aItemSlides = (
										(AssigmentSlides.studentAttemptData || {}).itemSlides || []
									),
									objOralFluencySlideData = {},
									sRejectedAttempted = "false",
									oExistingInfo = {},
									sTestInstanceId = -1;
									
								oExistingInfo = (
													_.findWhere(
														((AssigmentSlides.studentAttemptData || {}).itemSlides || []),
														{ slideID: iPartSlideId }
													) ||
													{}
												);

								oSlideInputData = $.extend(
											{},
											(
												(
													_.findWhere(
														(AssigmentSlides.studentAttemptData || {}).itemSlides || [],
														{ slideID: iPartSlideId }
													) || {}
												).slideInputData || {}
											)
										);
									
								if($(oElem).hasClass('btndisabled') || oDiv.hasClass('locked')) {				
									return;
								}
									
								if ($this.getIsComplete() === true && oDiv.attr('data-rejected') != "true") {
									return;
								}
								
								var score = 0;	
								$(oDiv).addClass($this.lockedClass);
								$('#' + sSlideId + ' .microphone').addClass('inactive');
								//$('#' + sSlideId + ' .speaker').addClass('inactive');
								$(oElem).addClass('disabled btndisabled').prop('disabled', true);
								$(oSwiperVisible).find(".Phinics_question").attr('data-score',score);
								
								/*== Save Audio Native Calls ==*/
								objSaveAudioResponse = null;
								objOralfluencyReservationResponse = null;
								objOralfluencySubmitScoreResponse = null;
								oSelf.dataSet4NoScorePromptID = null;								
								
								if (
										$_GET(POPUP_VIEW.c_s_QUERY_PARAM_ACTION) != POPUP_VIEW.c_s_ACTION_VIEW &&
										$_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) != POPUP_VIEW.c_s_MODE_INSTRUCTOR &&
										$_GET(POPUP_VIEW.c_s_QUERY_PARAM_ACTION) != POPUP_VIEW.c_s_ACTION_PLAY
									) {
									/*== Save Audio Call ==*/
									$.monitor({
										'if':	function () {
											return (objSaveAudioResponse != null);
										},
										'beforeStart':	function () {				
											oUtility.showLoader({
											  'message': '<img src="media/loader.gif" alt="" />',
											  'background-color': 'none',
											  'click-to-hide': false,
											  'opacity': 0.5
											});			
											SaveAudio(sAssignmentId, sQId);
										},
										'interval':		500,
										'then':	function () {			
											switch (objSaveAudioResponse.Status) {
												case '200':
													sAudioPath = objSaveAudioResponse.Content;					
													sAudioFileName = sAudioPath.split('/').last();
													$("#"+ sSlideId +" .speaker").attr('data-audio',sAudioPath);
													AssigmentSlides.bAudioSaved = true;							
													// OF Rubric - for any OF assignments no need to call PKT as per BTS2019 new requirement
													if (true) {
														// set the sPromptId and sTestInstanceId blank instead of "PEARSON" & "-1"  
														if(sPromptId != ASSIGNMENTS.c_s_ASSIGNMENT_PROMPT_ID_NO_SCORE){
															sPromptId ="";
															sTestInstanceId="" ;
														}
														$this.setOFDataNSave4FRS(sQId, sAudioPath, sPromptId, sTestInstanceId);
													}
													else {
														// calling PK services (was used prior to BTS2019)
														$this.oralfluencyReservationCall(sPromptId, sAudioFileName, sAudioPath);
													}													
													break;					
												default:
													throw (objSaveAudioResponse.Error);
											}			
										}
									});											
								}								
								
								/*== After Save Audio Native Call is Successful ==*/
								$.monitor({
									'if':	function () {
										//we have checked three condition here
										// if this is new assignment then we are checking promptID "blank"
										// if this is demo assignment then we are checking promptId "Pearson"
										// if this is an old assignment then we are checking  objOralfluencySubmitScoreResponse response
										return (objOralfluencySubmitScoreResponse != null || 							(sPromptId=="" && oSelf.dataSet4NoScorePromptID != null) || 
												(sPromptId == ASSIGNMENTS.c_s_ASSIGNMENT_PROMPT_ID_NO_SCORE && 
												oSelf.dataSet4NoScorePromptID != null));
									},
									'interval':		500,
									'then':	function () {			
										if (
											(objOralfluencySubmitScoreResponse != null && 
											objOralfluencySubmitScoreResponse.responseHeader.status == 'SUCCESS') || (sPromptId=="" && oSelf.dataSet4NoScorePromptID != null) ||
											(sPromptId == ASSIGNMENTS.c_s_ASSIGNMENT_PROMPT_ID_NO_SCORE && 
											oSelf.dataSet4NoScorePromptID != null)
											) {
												oSelf.dataSet4NoScorePromptID = null;
												oUtility.hideLoader();												
												
												/*== if not last slide and not rejected slide ==*/
												if (iSlideId != oSelf.getLastSlideIdByPart(iPartId) && oDiv.attr('data-rejected') != "true") {
													if ($this.finalSubmit === true) {
														$this.updateAttemptData(true);
													}
												}
												else {
													/*==== Mark as completed ====*/
													/*==== Put Question ID to Facilitate Skill-Based Reporting ====*/
													objOralFluencySlideData = {
														"subSlideID": sSubSlideId,
														"subSlideType": sSubSlideType,				
														"subSlideSelectedAnswer": null,
														"subSlideDroppedAnswer": [],
														"subSlideSubmitted": true,
														"subSlideScore": 1,
														"isVisited": isVisited,
														"isRejectedAttempted": (oDiv.attr('data-rejected') == "true") ? true : false 
													};
													
													sRejectedAttempted = (oDiv.attr('data-rejected') == "true") ? "true" : "false";
													oDiv.attr('data-rejected-attempted', sRejectedAttempted);
													
													if (oSlideInputData.subSlides) {
														var iSubSlideLen = 0;
														$.each(oSlideInputData.subSlides, function (key, val) {
															if (val.subSlideID == sSubSlideId) {							
																oSlideInputData.subSlides[key] = objOralFluencySlideData;
															}
															else {
																iSubSlideLen++;																
															}
														});
														
														if (iSubSlideLen == oSlideInputData.subSlides.length) {
															oSlideInputData.subSlides.push(objOralFluencySlideData);
														}
													}
													else {
														oSlideInputData["subSlides"] = [objOralFluencySlideData];
													}
													oSlideInputData[oSelf.c_s_KEY_QUESTION_ID] = sQuestionId;
													/*== End Put Question ID to Facilitate Skill-Based Reporting ==*/
													
													oSlideInfo = {
														"slideID":			iPartId + '' + iSlideId,
														"slideType":		oSelf.c_s_TYPE_TPL_PHONICTEXTBASEDSLIDE,
														"slideAttempt":		1,
														"slideIsCorrect":	true,
														"slideScore":		(
																				!isNaN(parseInt($this.score))?
																				parseInt($this.score):
																				(
																					isNaN(parseInt(oExistingInfo.slideScore))?
																					GENERAL.c_s_SPECIAL_CHARACTERS_BLANK:
																					parseInt(oExistingInfo.slideScore)
																				)
																			),
														"slideInputData":	oSlideInputData
													};
													
													var iIndex = 0;
													for (; iIndex < aItemSlides.length; iIndex++) {
														if (aItemSlides[iIndex].slideID == iPartId + '' + iSlideId) {
															aItemSlides[iIndex] = oSlideInfo;
															break;
														}
													}
													
													if (iIndex == aItemSlides.length) {
														aItemSlides.push(oSlideInfo);
													}
													
													AssigmentSlides.studentAttemptData = {
														"itemId": 			(AssignmentsView.slideDataValue.split('___') || []).fetch(1),
														"itemSlides": 		aItemSlides,
														'submitStatus':		GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
														'reAssignedStatus':	GENERAL.c_s_SPECIAL_CHARACTERS_BLANK,
														'itemType':			oSelf.c_s_TYPE_TPL_FRS,
														'oralFluencyData': (oSelf.oralFluencyData.length > 0) ? encodeURIComponent(JSON.stringify(oSelf.oralFluencyData)) : []
													};
													
													AssigmentSlides.systemScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;
													AssigmentSlides.finalScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;	
													AssigmentSlides.itemComplete = oSelf.c_s_INCOMPLETED_STATUS;
													$('#' + sSlideId).attr('data-allow-swipe-next', 'true');
													/*== End Mark as completed ==*/														
													$this.prepare4View();
													
													/*== if this is a rejected slide ==*/
													if (oDiv.attr('data-rejected') == "true") {
														// remove slide from rejected array once attempted													
														oSelf.aRejectedSlideDomId = _.without(oSelf.aRejectedSlideDomId, sSlideId);
														// if any further rejected slide then swipe to that slide
														if (oSelf.aRejectedSlideDomId.length > 0) {
															iSwipeTo = $('#slide_inner_container').children().index($('#' + oSelf.aRejectedSlideDomId[0]));					
															if (iSwipeTo > -1) {
																AssigmentSlides.slidingEngine.swipeTo(iSwipeTo);
															}						
														}
														else { // Last slide has been submitted															
															submitAssignment();		
														}
													}
													/*== if not last part ==*/
													else if (iPartId < oSelf.getLastPartId()) {
														iPartId = parseInt(iPartId);
														if (isPartRendered(iPartId + 1) === false) {
															renderSlidesByPart(iPartId + 1);
															frsResize();	// Resize of PhonicTextBasedView to be done
															bindEvents();	// "Input Answer" button fails to work without this
															AssigmentSlides.slidingEngine.reInit();
															$("#prevPagingBtn").show();
															$("#nextPagingBtn").show();
														}
													}
													/*== if last part & last slide ==*/
													else { // Last slide has been submitted
														submitAssignment();
													}
												}		
												
										}			
									}
								});								
								
							};
						}
						else if (sSlideType == oSelf.c_s_TYPE_TPL_WORD_SORT) {}
						else if (sSlideType == oSelf.c_s_TYPE_TPL_WORD_FAMILIES) {}
						else if (sSlideType == oSelf.c_s_TYPE_TPL_ROTATING_LISTS) {
							FRSPhonicHandler.prototype.submitAnswer = function () {
								var oSuper = this.getSuper();
								oSuper.submitAnswer.call(this);
								
								if (this.finalSubmit) {
									this.updateAttemptData(true);
								}
							}
						}
						
						FRSPhonicHandler.prototype.evaluate = function () {
							var $this = this,
								iPartId = $this.getMeta('part') + '',
								fPercentScore = 0,
								oFirstSlide = {},
								aItemSlides = (
									(AssigmentSlides.studentAttemptData || {}).itemSlides || []
								),
								oSlideInfo = {},
								dTotalPartScore = 0.0,
								dTotalMaxScore = 0.0,
								dMaxScore = 0.0,
								iActiveSlideIndex = 0;
								
							if (!(aItemSlides instanceof Array)) {
								aItemSlides = [];
							}
							
							/*== get total score of the part ==*/
							for (var iIndex = 0; iIndex < aItemSlides.length; iIndex++) {
								oSlideInfo = aItemSlides[iIndex];
								
								if (oSlideInfo.slideID.startsWith(iPartId)) {
									dTotalPartScore += (
										!isNaN(parseFloat(oSlideInfo.slideScore))?
										parseFloat(oSlideInfo.slideScore):
										0
									);
								}
							}
							
							/*== get total max score of the part ==*/
							aSlides = oSelf.getSlides(iPartId);
							for (var iIndex = 0; iIndex < aSlides.length; iIndex++) {
								if (typeof aSlides[iIndex].getMeta == 'function') {
									dMaxScore = 0;
									try {
										dMaxScore = parseFloat(aSlides[iIndex].getMeta('maxScore'))
									}
									catch (oException) {
										
									}
									dTotalMaxScore += (isNaN(dMaxScore)? 0: dMaxScore);
								}
							}
							
							/*== get percentage score of part ==*/
							fPercentScore = parseFloat(((dTotalPartScore / dTotalMaxScore) * 100).toFixed(2));
							
							/*== if percentage score of part is less than benchmark score then add two more slides ==*/
							if (fPercentScore < dBenchmarkScore) {
								var iFirstSlideId = -1;
								
								if ((iFirstSlideId = oSelf.getFirstSlideIdByPart(iPartId)) !== -1) {
									oSelf.initSlide(iPartId, iFirstSlideId);
								}
								
								var iLastSlideId = -1;
								if ((iLastSlideId = oSelf.getLastSlideIdByPart(iPartId)) !== -1) {
									oSelf.initSlide(iPartId, iLastSlideId);
								}
								$("#nextPagingBtn").show();
								$("#prevPagingBtn").show();
								frsResize();	// Resize of PhonicTextBasedView to be done
								bindEvents();	// "Input Answer" button fails to work without this
								AssigmentSlides.slidingEngine.reInit();
							}
							else {
								/*== else render next part if any  ==*/
								if (iPartId < oSelf.getLastPartId()) {
									iPartId = parseInt(iPartId);
									if (isPartRendered(iPartId + 1) === false) {
										iActiveSlideIndex = AssigmentSlides.slidingEngine.activeIndex;
										AssigmentSlides.slidingEngine.destroy();
										renderSlidesByPart(iPartId + 1);
										frsResize();	// Resize of PhonicTextBasedView to be done
										bindEvents();	// "Input Answer" button fails to work without this
										$('#slide_inner_container').attr('style', '');
										//AssigmentSlides.slidingEngine.reInit();										
										
										AssigmentSlides.slidingIdangerousEngine();
										$.monitor({
											'if':	function () {
												return (AssigmentSlides.slidingEngine != null);
											},
											'then':	function () {												
												AssigmentSlides.slidingEngine.swipeTo(iActiveSlideIndex,1);															
											}
										});
									}
									$("#nextPagingBtn").show();
									$("#prevPagingBtn").show();
								}
								/*== final submit if no more part to render ==*/
								else {
									submitAssignment();
								}
							}
							
						};
						
						oHandler['slides'][iPartId + '-' + iSlideId] = new FRSPhonicHandler(AssigmentSlides.getResponsibleObject(sSlideType));
						
						oCurrentSlide = oSelf.getSlides(iPartId, iSlideId);
						oCurrentSlide.setData('model', oSlideInfo[oSelf.c_s_ASSIGNMENT_SLIDES_KEY]);
						oCurrentSlide.setData('type', sSlideType);
						oCurrentSlide.setData('assignmentId', oSlideInfo['assignmentID']);
						oCurrentSlide.setData('slideId', iPartId + '' + iSlideId);
						oCurrentSlide.addMeta({ // Read-only information
							'part':			iPartId,
							'slide':		iSlideId,
							'maxScore':		oSlideInfo[oSelf.c_s_FRS_SLIDE_MAX_SCORE],
							'questionId':	sSlideQuestionId,
							'assignmentId':	oSlideInfo['assignmentID'],
							'promptID':	oSlideInfo['promptID'] ? oSlideInfo['promptID'] : null
						});
						oCurrentSlide.setData('slideDomId', AssigmentSlides.referenceKey + '___' + oCurrentSlide.getData('slideId'));
						break;
				}
			}
		}
	}
	function isPartRendered (piPartId) {
		piPartId = parseInt(piPartId);
			
		if (
			!(
				typeof piPartId == 'number' &&
				!isNaN(piPartId) &&
				((iPartPos = aPartIds.indexOf(piPartId)) != -1)
			)
		) {
			throw "Invalid part ID";
		}
		var bIsSlidesRendered = true;
		
		for (var sPS in oHandler['slides']) {
			if (sPS.startsWith(piPartId + '-')) {
				iSlideId = parseInt(sPS.split('-').fetch(1) || 0);
				if (iSlideId != 0) {
					// assignment___54a22690-3ae3-4267-bcdd-a7886591ce31_a87bad1ff9594537b14dcc85f251169e___frs___13
					bIsSlidesRendered = (
						bIsSlidesRendered &&
						($('[id$="' + '___' + oSelf.c_s_TYPE_TPL_FRS + '___' + piPartId + '' + iSlideId + '"]').length > 0)
					);
				}
			}
		}
		
		return bIsSlidesRendered;
	}
	function renderSlidesByPart (piPartId, pbRenderLastSlide) {
		var oSlideInfo = null,
			oSlide = null,
			sSlideType = '',
			oPartInfo = oSelf.getModel(oSelf.c_s_ASSIGNMENT_PARTS_KEY),
			iPartId = 0,
			iPartPos = -1,
			iLastSlideId = -1,
			iFirstSlideId = -1;
			
		if (typeof pbRenderLastSlide != 'boolean') {
			pbRenderLastSlide = false;
		}
			
		piPartId = parseInt(piPartId);
			
		if (
			!(
				typeof piPartId == 'number' &&
				!isNaN(piPartId) &&
				((iPartPos = aPartIds.indexOf(piPartId)) != -1)
			)
		) {
			throw "Render Slides: Invalid Part ID or Part ID not set";
		}
			
		iPartId = piPartId;
		iLastSlideId = oSelf.getLastSlideIdByPart(iPartId);
		for (var iSlideId in oPartInfo[aParts[iPartPos]]) {
			try {
				if (pbRenderLastSlide === false && iLastSlideId == iSlideId) {
					continue;
				}
				
				if (iSlideId == iLastSlideId) {
					iFirstSlideId = -1;									
					if ((iFirstSlideId = oSelf.getFirstSlideIdByPart(iPartId)) !== -1) {
						oSelf.initSlide(iPartId, iFirstSlideId);
					} 
				}
				
				oSelf.initSlide(iPartId, iSlideId);
			}
			catch (oException) {
				
			}
		}
	}
	function renderSlides () {
		var oSlideInfo = null,
			oSlide = null,
			sSlideType = '',
			oPartInfo = oSelf.getModel(oSelf.c_s_ASSIGNMENT_PARTS_KEY),
			bIsSlidesRendered = false;
			
		for (var iIndex = 0; iIndex < aParts.length; iIndex++) {
			var iPartId = parseInt((aParts[iIndex].match(/Part([0-9]+)/i) || []).fetch(1) || 0);
			
			if (iPartId == 0) {
				continue;
			}
			
			try {
				renderSlidesByPart(iPartId);
				bIsSlidesRendered = true;
			}
			catch (oException) {
				
			}
		}
		
		return bIsSlidesRendered;
	}
	function updateTabs () {
		// ToDo
	}
	function frsResize () {
		var window_height = $(window).height(),
			header = $("header").outerHeight(),
			actual_height = window_height - header,									
			ui_slide_tabs_height = (
				$(".ui_slide_tabs").length > 0?
				$(".ui_slide_tabs").outerHeight():
				0
			),
			study_plain_container_contents_height = (
				actual_height - (
					ui_slide_tabs_height + parseInt($(".study_plain_container_slide").css("padding-bottom"))
				)
			),
			study_plain_heading_height = $(".study_plain_heading").outerHeight(),
			slider_pager_content_outer_height = study_plain_container_contents_height - study_plain_heading_height,
			slide_inner_container_padding = (
				parseInt($("#slide_inner_container").css("padding-bottom")) + parseInt($("#slide_inner_container").css("padding-top"))
			);
			
		$(".study_plain_container").height(actual_height);
		$(".study_plain_container_contents").height(study_plain_container_contents_height);
		$(".slider_pager_content_outer").height(slider_pager_content_outer_height);
		$(".slider_pager_content").css("max-height",slider_pager_content_outer_height+"px");
		$(".swiper-container").height(slider_pager_content_outer_height);
		$("#slide_inner_container").height(slider_pager_content_outer_height - slide_inner_container_padding);
		
		var study_question_title_padding = (
				parseInt($(".study_question_title").css("padding-bottom")) +
				parseInt($(".study_question_title").css("padding-top"))
			),
			study_question_mcq_content_padding = (
				parseInt($(".study_question_mcq_content").css("padding-bottom")) +
				parseInt($(".study_question_mcq_content").css("padding-top"))
			),
			new_assignment_irr_padding = (
				parseInt($(".new_assignment_irr").css("padding-bottom")) +
				parseInt($(".new_assignment_irr").css("padding-top"))
			),
			new_assignment_irr_sp_video_height = (
				slider_pager_content_outer_height -
				(
					slide_inner_container_padding  +
					new_assignment_irr_padding + 1
				)
			);
		
		/*==== Make the slide acquire full avaialable width ====*/
		var dAvailableWidth = $('.slider_pager_content_outer').outerWidth(),
			dButtonWidth = 0;
		
		// dButtonWidth = $("#prevPagingBtn").width() + $("#nextPagingBtn").width();
		
		var dUsableWidth = dAvailableWidth - dButtonWidth;
			
		$('.slider_pager_content')
			.width(dUsableWidth)
			.css({
				'max-width':	dUsableWidth + 'px',
				'z-index':		499
			});
		/*== End Make the slide acquire full avaialable width ==*/
	}
	function bindEvents () {

		$("#nextPagingBtn").off('keydown').on('keydown',function(e){
		 	if(e.shiftKey){
		 		if(e.keyCode == 9){
			 		if($('.vjs-big-play-button').is(':visible'))
			 			$('.vjs-big-play-button').focus();
			 		else
			 			$('.vjs-fullscreen-control').focus();
			 	}
		 	}else{
			 	if(e.keyCode == 9){
			 		window.focus();
			 		//$('#assignmentPrev').focus();
			 	}
		 	}
		 });
			
		$("#prevPagingBtn")
			.off('click ' + sWindowsEventType)
			.on('click ' + sWindowsEventType, function() {
				AssigmentSlides.slidingEngine.swipePrev();
			});
			
		$("#nextPagingBtn")
			.off('click ' + sWindowsEventType)
			.on('click ' + sWindowsEventType, function() {
				var iActiveSlideIndex = AssigmentSlides.slidingEngine.activeIndex,
					oCurSlide = AssigmentSlides.slidingEngine.slides[iActiveSlideIndex],
					oCurrentSlide = null;
				
				if (oCurrentSlide = oSelf.getSlideByDomID(oCurSlide.id)) {
					if (typeof oCurrentSlide.getIsComplete == 'function') {
						if (oCurrentSlide.getIsComplete() === false) {
							return false;
						}
					}
				}
				AssigmentSlides.slidingEngine.swipeNext();
			});
		
		$('.' + ASSIGNMENTS.c_s_ASSIGN_READ_CHKPNT_BTN_SELECTOR)
			.off('click ' + sWindowsEventType)
			.on('click ' + sWindowsEventType, AssigmentSlides.inputAnswer);
	}
	function submitAssignment () {
		var oScoreSumary = {},
			oTemplate = {},
			dSystemScore = 0.0,
			oItemSlideVal = {};
		
		oScoreSumary[GENERAL.c_s_TXT_SCORESUMMARY] = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;
		oScoreSumary[GENERAL.c_s_TXT_SCOREDETAILS] = [];
		
		/*==== Compute Score ====*/
		for (
			var iSlideIndex = 0, aItemSlides = AssigmentSlides.studentAttemptData.itemSlides;
			iSlideIndex < aItemSlides.length;
			iSlideIndex++
		) {
			var oItemSlide = aItemSlides[iSlideIndex],
				dSlideScore = 0,
				oSlideInputData = ((oItemSlide || {}).slideInputData || {});
				
			/*== clear isRejectedAttempted before submit, for next time when reassigned ==*/			
			oItemSlideVal = AssigmentSlides.studentAttemptData.itemSlides[iSlideIndex];
			if (oItemSlideVal.slideType == "phonictextbasedslide") {
				$.each(oItemSlideVal.slideInputData.subSlides, function (k,oSlideInputVal) {
					if (oSlideInputVal.subSlideType == "oralfluency") {
						AssigmentSlides.studentAttemptData.itemSlides[iSlideIndex].slideInputData.subSlides[k].isRejectedAttempted = false;
					}
				});
			}		
			
				
			if (
				typeof oItemSlide['slideScore'] != 'undefined' &&
				oItemSlide['slideScore'] != null &&
				oItemSlide['slideScore'] != '' &&
				!isNaN(parseFloat(oItemSlide['slideScore']))
			) {
				dSlideScore = parseFloat(oItemSlide['slideScore']);
			}
			dSlideScore = isNaN(dSlideScore)? 0: dSlideScore;
			dSystemScore += dSlideScore;
			/*==== Alter ITEM_ATTEMPT_SUMMARY to Facilitate Skill-Based Reporting ====*/
			if (typeof oSlideInputData[oSelf.c_s_KEY_QUESTION_ID] != 'undefined') {
				oScoreSumary[GENERAL.c_s_TXT_SCOREDETAILS].push(
					JSON.parse('{\
						"' + oSelf.c_s_KEY_QUESTION_ID + '": "' + oSlideInputData[oSelf.c_s_KEY_QUESTION_ID] + '",\
						"' + oSelf.c_s_KEY_SCORE + '": ' + dSlideScore.toString() + '\
					}')
				);
			}
			/*== End Alter ITEM_ATTEMPT_SUMMARY to Facilitate Skill-Based Reporting ==*/
		}
		/*== End Compute Score ==*/
		
		AssigmentSlides.studentAttemptSummary = oScoreSumary;
		
		AssigmentSlides.systemScore = dSystemScore;
		//OF Rubric - Final score should be blank so that its not auto scored
		AssigmentSlides.finalScore = GENERAL.c_s_SPECIAL_CHARACTERS_BLANK;	
		AssigmentSlides.itemComplete = ASSIGNMENTS.c_s_COMPLETED_STATUS;
		
		//** Start - If iLit20 & OR is Off **//
		
		if (
			((AssignmentsView.productCode || '').startsWith("ilit20")) &&
			objSettingsData.Content.AcceptOralFluencyScore == '0'		
		){
			AssigmentSlides.OralFluencyData = AssigmentSlides.studentAttemptData.oralFluencyData;
			//AssigmentSlides.MaxScore = oSelf.getTotMaxScore();
			AssigmentSlides.IsStudentScored = "1";
		}
		//** End - If iLit20 & OR is Off **//		
		
		$.monitor({
			'if':			function () {					
				return (
					(
						typeof objStudentAttemptDataResponse != 'undefined' && 
						objStudentAttemptDataResponse != null && 
						objStudentAttemptDataResponse != 0
					) ||
					(
						$_GET(POPUP_VIEW.c_s_QUERY_PARAM_ACTION) == POPUP_VIEW.c_s_ACTION_VIEW ||
						$_GET(POPUP_VIEW.c_s_QUERY_PARAM_MODE) == POPUP_VIEW.c_s_MODE_INSTRUCTOR ||
						$_GET(POPUP_VIEW.c_s_QUERY_PARAM_ACTION) == POPUP_VIEW.c_s_ACTION_PLAY
					)
				);
			},
			'beforeStart':	function () {
				objStudentAttemptDataResponse = 0;
				AssigmentSlides.setAttemptData();
			},
			'interval':		500,
			'then':			function () {				
				if (
					typeof objStudentAttemptDataResponse.Error == 'undefined' || 
					objStudentAttemptDataResponse.Error == null
				) {
					var iActiveSlideIndex = AssigmentSlides.slidingEngine.activeIndex,
						oCurSlide = AssigmentSlides.slidingEngine.slides[iActiveSlideIndex],
						sSlideId = $(oCurSlide).attr('id');
			
					$('#' + sSlideId + ' .microphone_grading_submit').attr('disabled', 'disabled')
						.addClass('btndisabled')
						.addClass('disabled').off('click');
					
					AssignmentsView.prev.addClass(ASSIGNMENTS.c_s_DONE_CLASS).attr('title', ASSIGNMENTS.c_s_DONE_BTN_TITLE).focus();					
				}
				else {					
					AssigmentSlides.itemComplete = ASSIGNMENTS.c_s_INCOMPLETED_STATUS;			
					AssigmentSlides.studentAttemptSummary = {};
				}
			}
		});
	}
	function addMeta (psProp, mixVal) {
		if (typeof oMetaData[psProp] == 'undefined') {
			oMetaData[psProp] = mixVal;
		}
	}
	function getMeta (psProp) {
		if (typeof oMetaData[psProp] == 'undefined') {
			return;
		}
		return oMetaData[psProp];
	}
	function loadModel (poModel) {
		if (oHandler['model'] == null) {
			oHandler['model'] = {};
		}
		if (
			typeof oMetaData['ItemId'] == 'undefined' ||
			oMetaData['ItemId'] === null ||
			typeof oMetaData['ItemId'].length == 'undefined' ||
			oMetaData['ItemId'].length == 0
		) {
			throw "Invalid Item ID or Item ID not set";
		}
		oHandler['model'] = poModel;
	}
	function isPartComplete (piPartId) {
		var iPartId = parseInt(piPartId),
			bIsComplete = true,
			oSlide = null;
			
		if (
			isNaN(iPartId) ||
			(aPartIds.indexOf(iPartId) == -1)
		) {
			return false;
		}
		
		bScoredLow = (oSelf.getScorePercentByPartId(iPartId) < dBenchmarkScore); // if less than 80%
		
		var iSlideCnt = 0;
		for (var sPS in oHandler['slides']) {
			iSlideCnt++;
			if (sPS.startsWith(iPartId + '-')) {
				oSlide = oHandler['slides'][sPS];
				
				if (
					typeof oSlide.getData != 'function'	||		// projecterslide
					typeof oSlide.getIsComplete != 'function' ||
					(iSlideCnt % 4 == 0 && bScoredLow == false) // skip oral fluency screen
				) {					
					continue;
				}
				bIsComplete = bIsComplete && oSlide.getIsComplete();
			}
		}
		
		return bIsComplete;
	}
}
FoundationalRS.prototype = ASSIGNMENTS; // Inherits constants
FoundationalRS.prototype.constructor = FoundationalRS;
/*== End Foundational Reading Skills ==*/