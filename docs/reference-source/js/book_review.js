function BookReview (poConfig) {
	var oSelf = this;
	oSelf.CONSTANTS = {
		"c_s_LOADING_TXT": "Loading...",
	};
	oSelf.StarRatings = {
		"1":"Did not like it",
		"2":"It was okay",
		"3":"Liked it",
		"4":"Really liked it",
		"5":"It was awesome"
	};
	oSelf.PredefinedCommentCodes = {
		"C1":	"It sucked",
		"C2":	"I liked it",
		"C3":	"I didn't like it",
		"C4":	"I learned a lot",
		"C5":	"It was too hard to read",
		"C6":	"I didn't understand it",
		"C7":	"It was exciting",
		"C8":	"It was boring",
		"C9":	"I liked the setting",
		"C10":	"I liked the characters",
		"C11":	"I related to the characters",
		"C12":	"It was funny",
		"C13":	"It was sad",
		"C14":	"It was scary",
		"C15":	"It was suspenseful",
		"C16":	"It changed my point of view",	
		"C17":	"It changed my views",
		"C18":	"I couldn't put it down",
		"C19":	"I couldn't get into it",
		"C20":	"I couldn't relate to the characters",
		"C21":	"It inspired me",															
		"C22":	"It captured my imagination",
		"C23":	"I enjoyed author's style",										
		"C24":	"Thought about when not reading it",
		"C25":	"It was so exciting",
		"C26":	"It was so boring"
	};
	oSelf.PredefinedComments = {
		"gbp": {
			"targetCodes": "gk,g1,g2",
			"comments": [
				"C1"
			]
		},
		"gbe": {
			"targetCodes": "g3,g4,g5",
			"comments": [
				"C2",
				"C3",
				"C4",
				"C5",
				"C6",
				"C7",
				"C8",
				"C9",
				"C10",
				"C11",
				"C12",
				"C13",
				"C14",
				"C15",
				"C16"
			]
		},
		"gbm": {
			"targetCodes": "g6,g7,g8",
			"comments": [
				"C7",
				"C8",
				"C4",
				"C9",
				"C11",
				"C9",
				"C15",
				"C17",
				"C18",
				"C19",
				"C20",
				"C21",
				"C12",
				"C13",
				"C22"
			]
		},
		"gbh": {
			"targetCodes": "g9,g10,g11,g12",
			"comments": [
				"C18",
				"C19",
				"C11",
				"C20",
				"C25",
				"C26",
				"C4",
				"C17",
				"C9",
				"C23",
				"C21",
				"C24",
				"C22",
				"C12",
				"C15"
			]
		}
	};
	oSelf.model = {};
	oSelf.serviceHadler = new (function() {
		var $this = this;
		// Get Library JSON from Native
		$this.importLibraryInfo = function(fCallBack){
			if (typeof fCallBack != 'function') {
				fCallBack = jQuery.noop;
			}
			objLibraryJsonData = null;
			GetLibraryInfo();
			setTimeout(function () {
				$this.importGradeItem(fCallBack)
			}, 200);
									
		};
		
		// Load grade_item.js file
		$this.importGradeItem = function (fCallBack) {
			if (objLibraryJsonData != null) {
				loadJS(objLibraryJsonData.gradeItemjsPath, function(){
					$this.importLibraryBooks(fCallBack);
				});
				//ILIT-5825 - On chrome app if loader then show message
				(function() {					
					if (location.hash === "#chromeApp") {
						chromeServerNotStartedPopup('BookReview');
					} 
				})();
			}
			else{
				setTimeout(function () {
					$this.importGradeItem(fCallBack)
				}, 200);
			}
		};
		
		// Load [GRADE]_library.js file for all books
		$this.importLibraryBooks = function (fCallBack) {
			if (
				typeof objGradeItemsData != "undefined" && 
				objGradeItemsData != null
			)  {
				loadJS(objLibraryJsonData.jsPath, function(){
					$this.importLibraryProgress(fCallBack);
				});
			}
			else{
				$this.importLibraryBooks(fCallBack);
			}
		};
		
		// To get the Completed Book IDs
		$this.importLibraryProgress = function (fCallBack) {
			objLibraryProgressSummary = null;
			GetLibraryProgressSummary();
			setTimeout(function () {
				$this.checkLibraryProgress(fCallBack);
			}, 200);			
		};
		
		// Callback methods for GetLibraryProgressSummary() service
		$this.checkLibraryProgress = function(fCallBack) {
			setTimeout(function () {
				if(objLibraryProgressSummary == null) {
					setTimeout(function () {
						$this.checkLibraryProgress(fCallBack);
					}, 200);
				}
				else{
					try {
						if (objLibraryProgressSummary.Status == "200" || objLibraryProgressSummary.Status == 200) {
							$this.importGetBookReviewFeedback(fCallBack);
						}
						else {
							throw(objLibraryProgressSummary.Error);
						}
					}
					catch (err){
                                         	if (err.ErrorCode != "U1065") {
							oSelf._alert({
								divId:		'dialog-message',
								title:		'Error!',
								message:	err.ErrorUserDescription
							});
						}
					}
				}
			}, 1000);
		};
		
		// Get data from GetBookReviewFeedback() service
		$this.importGetBookReviewFeedback = function (fCallBack) {
			if(objLibraryProgressSummary.Content.BookCompletedItemIDs.length > 0) {
				objGetBookReviewFeedbackData = 0;
				GetBookReviewFeedback(objLibraryProgressSummary.Content.BookCompletedItemIDs);
				setTimeout(function () {
					$this.checkGetBookReviewFeedback(fCallBack);
				}, 200);				
			}
			else {
				$this.prepareModel4BookReview(fCallBack);
			}
		};
		
		// Callback method for GetBookReviewFeedback() service
		$this.checkGetBookReviewFeedback = function (fCallBack) {
			setTimeout(function () {
				if(objGetBookReviewFeedbackData == 0) {
					setTimeout(function () {
						$this.checkGetBookReviewFeedback(fCallBack);
					}, 200);
				}
				else {
					try {
						if (parseInt(objGetBookReviewFeedbackData.Status) == 200) {
							$this.prepareModel4BookReview(fCallBack);
						}
						else { 
							throw(objGetBookReviewFeedbackData.Error);
						}
					}
					catch (err) {
						if (err.ErrorCode != "U1065") {
							oSelf._alert({
								divId:		'dialog-message',
								title:		'Error!',
								message:	err.ErrorUserDescription
							});
						}
					}
				}
			}, 1000);
		};
		
		$this.prepareModel4BookReview = function (fCallBack) {
			var aMasterData = [];
			
			// Get completed read book ids from objLibraryProgressSummary
			for (var iCnt = 0; iCnt < objLibraryProgressSummary.Content.BookCompletedItemIDs.length; iCnt++){
				
				var sItemId = objLibraryProgressSummary.Content.BookCompletedItemIDs[iCnt],
					oRecord = _.where(objBookList.bookset[0], {book_id: sItemId}),
					oData = {
						"book_id"			: sItemId,
						"book_title"		: oRecord[0].book_title,
						"author_name"		: oRecord[0].author_name,
						"book_image"		: objLibraryJsonData.mediaPath + oRecord[0].book_image,
						"is_reviewed" 		: "N",
						"rating" 			: "",
						"comments" 			: "",
						"csv_feedback_tags"	: ""
					},
					oReviewFeedbackData = (objGetBookReviewFeedbackData != 0) ? 
											_.where(objGetBookReviewFeedbackData.Content, {ItemID: sItemId}) : [];
					
					if (oReviewFeedbackData.length > 0) {
						oData["is_reviewed"] = "Y";
						oData["rating"] = oReviewFeedbackData[0]["Rating"];
						oData["comments"] = decodeURIComponent(oReviewFeedbackData[0]["Comments"]);
						oData["csv_feedback_tags"] = oReviewFeedbackData[0]["FeebackTags"];
					}
				aMasterData.push(oData);
			}
			
			/* ILIT-1667 : changes for wtw : 'g4' for objLibraryJsonData.gradeId will be considered for wtw**/
			var gradeId = (objLibraryJsonData.gradeId.toLowerCase() == GENERAL.c_s_WTW_GRADE_CODE.toLowerCase()) ? 'g4' : objLibraryJsonData.gradeId;
			
			oSelf.model["reviewData"] = aMasterData;	
			oSelf.model["predefinedComments"] = ((objLibraryJsonData.productCode.match(GENERAL.c_s_ILIT_20)) ? 
					oSelf.PredefinedComments[gradeId].comments : 
						_.filter(oSelf.PredefinedComments, function (obj) {
							return obj.targetCodes.indexOf(gradeId) > -1 ; 
					})[0].comments);
			oSelf.model["predefinedCommentCodes"] = oSelf.PredefinedCommentCodes;
			oSelf.model["starRatings"] = oSelf.StarRatings;
			fCallBack.call(oSelf);
		};
		
		// Send data to SaveBookReviewFeedback() service
		$this.exportSaveBookReviewFeedback = function (fCallBack, iIdx) {
			
			objSaveBookReviewFeedbackData = 0;			
			var oData 			= oSelf.model.reviewData[iIdx]
				ItemID 			= oData["book_id"],
				Rating 			= oData["rating"],
				Comments 		= fixedEncodeURIComponent(oData["comments"]),
				CSVFeedbackTags 	= oData["csv_feedback_tags"];
			SaveBookReviewFeedback(ItemID, Rating, Comments, CSVFeedbackTags);
			$this.checkSaveBookReviewFeedback(fCallBack, iIdx);
		};
		
		// Callback method for SaveBookReviewFeedback() service
		$this.checkSaveBookReviewFeedback = function (fCallBack, iIdx) {
			setTimeout(function () {
				if(objSaveBookReviewFeedbackData == 0) {
					$this.checkSaveBookReviewFeedback(fCallBack);
				}
				else {
					try {
						if (parseInt(objSaveBookReviewFeedbackData.Status) == 200) {
							oSelf.model.reviewData[iIdx].is_reviewed = "Y";
							fCallBack.call(oSelf);
						}
						else {
							throw(objSaveBookReviewFeedbackData.Error);
						}
					}
					catch (err) {
						if(typeof err.ErrorCode != "undefined") {
								if (err.ErrorCode != "U1065") {
									oSelf._alert({
										divId:		'dialog-message',
										title:		'Error!',
										message:	err.ErrorUserDescription
									});
								}
							}
							fCallBack.call(oSelf);
						
					}
				}
			}, 2000);
		};
		
	});
	oSelf.showLoader();
	oSelf.init();	
};

BookReview.prototype.init = function () {	
	var oSelf = this;
	HideNativeBottomBar(true);
	oSelf.serviceHadler.importLibraryInfo(function(){		
		oSelf.render();
	});
	// CLAS-1062 start
	var base = window.parent.document.title.split(" - ")[0];
	window.parent.document.title = base+" - Review";
	// CLAS-1062 end
	//ILIT-1247 : disable browser back button 
	disableBrowserBackButton();
};

BookReview.prototype.render = function (recIdx) {
	var oSelf = this,
		recIdx = recIdx || 0;
	if(oSelf.model["reviewData"].length > 0){
		$("#mainContainer").html(
			_.template(
				$("#templateLandingPage").html(), {
					"Data": oSelf.model,
					"RecordIndex": recIdx
				}
			)
		);
		oSelf.bindSlider(recIdx);
		oSelf.renderReviewForm(recIdx);		
	}else{
		$("#mainContainer").html(
			_.template(
				$("#templateNoRecord").html(), {}
			)
		);
		oSelf.resize();		
	}
	// for book review render book Review header
	$("#renderBookReviewHeaderArea").empty().html(
		_.template($("#bookreviewheaderTemplate").html(),
			{
				
			}
		)
	);
	//for book review
	oSelf.bindEventsForLanding();

	//for focus in button
	setTimeout(function() {
		if(oSelf.lastActiveElement){
			 if($(oSelf.lastActiveElement).is('#addComment')){
				$('#addComment').focus();
			}
			else if($(oSelf.lastActiveElement).is('#btnDetail')){
				$('#btnDetail').focus();
			}
				
			
			
		}
		else{
		$("#bookReviewDoneButton").focus();
		}
		
		HideNativeBottomBar(true);
		
		$('#bookReviewDoneButton').off('keydown').on('keydown',function(e){

			if($("#btnDetail").length > 0 && $("#btnDetail:visible")){
			handleTab(e,this,$('#bookReviewDoneButton'),$("#btnDetail"));
				
			}
			else{
				handleTab(e,this,$(this),$(".bookItem:last"));
				
			}
		})
	});
	

	
	
};

// for book review
BookReview.prototype.bindEventsForLanding = function() {
	var oSelf = this;
	// CLAS-1062 start 
	var base = window.parent.document.title.split("-")[0];
	window.parent.document.title = base+" - Review";
	// CLAS-1062 end
	$("#bookReviewDoneButton").off("click tap").on("click tap", function(e){
		HideNativeBottomBar(false);
		if ( oPlatform.isDevice()) {
			CloseWebView();
		}else if(location.hash === "#chromeApp"){
			CloseWebView();
		}
		else{
			CloseReviewWindow();
		}

		//ILIT-5334
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		// CLAS-1062 start 
		window.parent.document.title = originalLibraryTitle;
		// CLAS-1062 end
	});
};

BookReview.prototype.renderReviewForm = function (recIdx) { 
	var oSelf = this;
	$("#formContainer").html(
		_.template(
			$("#templateFormContent").html(), {
				"Data": oSelf.model,
				"RecordIndex": recIdx 
			}
		)
	);
	
	$("#buttonContainer").html(
		_.template(
			$("#templateButtonContent").html(), {
				"Data": oSelf.model,
				"RecordIndex": recIdx 
			}
		)
	);
	
	 $.fn.raty.defaults.path = 'media';
	$('#score-callback').raty({
		number: 5,
		hints : ['','',''],
		score: function() {
			return $(this).attr('data-score');
		},
		click: function(score, evt) { 
			
			$("#starRatingTxt").html(oSelf.model["starRatings"][score]);
			$('#dynamicTextForSR').text('You have selected '+ score +' out of 5 , which means '+ oSelf.model["starRatings"][score]);

			//ILIT-5334
			if($(evt.target).hasClass("valid-activity") || $(evt.currentTarget).hasClass("valid-activity") || $(this).hasClass('valid-activity')){
				callLogUserActivity(evt); 
			}
		},
		readOnly: function() {
			return (oSelf.model.reviewData[recIdx].is_reviewed == "Y");
		},
		mouseover : function(score){
			
			$('#dynamicTextForSR').text('rating '+ score +' out of 5');

		},

		mouseout : function(score){
			
		}
		
	});


	//written for set tabindex in review

	setTimeout(function(){
		$imageRatingDiv = $('#score-callback');

		if($imageRatingDiv.attr('tabindex') == '0'){
			$imageRatingDiv.children().attr('tabindex','0');

			
			
			
			$('#score-callback img').on({
				keydown: function(event) {
					
					  if(event.key == "Enter" ||  event.which == 13 || event.keyCode == 32){
						
							$(this).click();
						}
						else if(event.key == "ArrowRight" || event.keyCode == 39){
							
							$(this).next().focus();

						}
						else if(event.key == "ArrowLeft"  ||  event.keyCode == 37){

							if(!$(this).is('#score-callback img:first')){
								$(this).blur();							
								$(this).prev().focus();
							}
							
							
							
						}
						
				},
				focus: function(e) {
					$(this).mouseover();
				},
				blur: function(e){
					//console.log(e);
					$(this).mouseout();
				}

			  });


			
				
			
		}
		

		   
	},200);

	
	$("#btnSubmit").removeClass("active");
	oSelf.bindEvents();
	oSelf.resize();
};

BookReview.prototype.renderComment = function (recIdx) {
	var oSelf = this;
	
	$("#mainContainer").html(
		_.template(
			$("#templateAddComment").html(), {
				"Data": oSelf.model,
				"RecordIndex": recIdx 
			}
		)
	);
	oSelf.bindEvents4Comment();
	oSelf.resize();
};

BookReview.prototype.renderPreview = function (recIdx) {
	var oSelf = this;
	
	$("#mainContainer").html(
		_.template(
			$("#templatePreviewReview").html(), {
				"Data": oSelf.model,
				"RecordIndex": recIdx 
			}
		)
	);
	oSelf.bindEvents4Preview();
	oSelf.resize();
};

BookReview.prototype.resize = function () {
	
	var windowHeight = $(window).height(),
		wrapperHeight = $(".modal-wrapper").height()/*  - parseInt($(".modal-wrapper").css("margin-top")) */,
		headerHeight = $(".modal-head").height() + parseInt($(".modal-head").css("padding-top")) + parseInt($(".modal-head").css("padding-bottom")),
		footerHeight = $(".modal-foot").height() + parseInt($(".modal-foot").css("padding-top")) + parseInt($(".modal-foot").css("padding-bottom")),
		containerHeight = wrapperHeight - (headerHeight + footerHeight); 
	
//for book review	
	$("#bookReviewFrame", parent.document).css("overflow", "hidden");
	$(".bookReviewWrapper", parent.document).css("overflow", "hidden");
	//$(".modal-container").height(containerHeight);
	this.hideLoader();
};

//for book review
BookReview.prototype.CloseReviewWindow = function (oSelf) {
	HideNativeBottomBar(false);
	if (oPlatform.isDevice()) {
		CloseWebView();
	}
	else {
		CloseReviewWindow();
	}
};

BookReview.prototype.bindEvents = function() {
	var oSelf = this;
	
	$(".bookItem").off("click  tap ").on("click  tap ",function (e) {
		$(".bookItem").removeClass("active");
		$(this).addClass("active");
		var recIdx = $(this).attr("data-recordIndex");
		

		oSelf.renderReviewForm(recIdx);		
		// var hasRating = oSelf.model.reviewData[recIdx].rating;	
		var bookname = oSelf.model.reviewData[recIdx].book_title;

		$('#dynamicTextForSR').text(bookname+' has been selected');

		//readThis(bookname+' has been selected');
		
		//ILIT-5334
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
	
	
 });


	$(".bookItem").off("focus blur keydown").on({

		"focus": function () {
					
					$(".bookItem").removeClass("active");
					$(this).addClass("active");
				},

	    "blur" : function(event){
					
				 },

		"keydown" : function(objEvent){

			objEvent = objEvent || window.event;
			var iKey = objEvent.keyCode;
			if (iKey == c_i_ENTER_KEY_CODE || iKey == c_i_SPACE_KEY_CODE) {				
				$(this).trigger('click');
				objEvent.preventDefault();
			}
			else if(iKey == c_i_TAB_KEY_CODE){
			  if ( $(this).is('.bookItem:last') && $('#score-callback').attr('tabindex') == '-1'){ 
		  			handleTab(objEvent, this, $('#bookReviewDoneButton'), $(this)); 					
		        }
					}
		}

		
	});
	
	/*== fix for ILIT-119 ==*/
	$("#listFeedback li").off("click tap").on("click tap", function (event) {
		
		if($(this).data("isReviewed") == "Y"){
			return;
		}
		if($(this).hasClass("active")) {
			$(this).removeClass("active");
			$('#dynamicTextForSR').text('You have unselected '+ $(this).text());
			return;
		}
		if($("#listFeedback li.active").length >= 3){
			$("#listFeedback li.active").eq(0).removeClass("active");
		}
		$(this).addClass("active");
		$('#dynamicTextForSR').text('You have selected '+ $(this).text());

		 //ILIT-5334
		 if($(event.target).hasClass("valid-activity") || $(event.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(event); 
		}
	});
	
	$("#listFeedback li").off('keydown').on('keydown',function(objEvent){
		objEvent = objEvent || window.event;
		var iKey = objEvent.keyCode;
		if (iKey == c_i_ENTER_KEY_CODE || iKey == c_i_SPACE_KEY_CODE) {
			
			$(this).trigger('click');
			objEvent.preventDefault();
		}
	});

	
	
	$("#addComment").off("click").on("click", function (e) {
		var recIdx = $(this).attr("data-recordIndex"),
			rating = $("input[name=score]").val(),
			csv_feedback_tags = $('#listFeedback li.active').map(	
									function(){
										return $(this).attr("data-idfeedback");
									}
								).get().join();
		
		if(
			csv_feedback_tags.length == 0  || 
			rating == ""
		){
			oSelf._alert({
				divId:		'dialog-message',
				title:		'Alert!',
				message:	'Please provide Rating & choose Option(s).'
			});
			return;
		}
		
		oSelf.lastActiveElement = document.activeElement;
		oSelf.model.reviewData[recIdx].rating = rating;
		oSelf.model.reviewData[recIdx].csv_feedback_tags = csv_feedback_tags;
		oSelf.renderComment(recIdx);

		 //ILIT-5334
		 if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
	});
	
	$("#btnDetail").off("click").on("click", function () {
		var recIdx = $(this).attr("data-recordIndex"),
			rating = $("input[name=score]").val(),
			csv_feedback_tags = $('#listFeedback li.active').map(	
									function(){
										return $(this).attr("data-idfeedback");
									}
								).get().join();
		
		if(
			csv_feedback_tags.length == 0  || 
			rating == ""
		){
			oSelf._alert({
				divId:		'dialog-message',
				title:		'Alert!',
				message:	'Please provide Rating & choose Option(s).'
			});
			return;
		}
		
		oSelf.lastActiveElement = document.activeElement;
		oSelf.model.reviewData[recIdx].rating = rating;
		oSelf.model.reviewData[recIdx].csv_feedback_tags = csv_feedback_tags;
		oSelf.renderPreview(recIdx);
	});


	$("#btnDetail").off("keydown").on("keydown", function (e) {
		handleTab(e,this,$('#bookReviewDoneButton'),$("#btnDetail"));
	});
	
};

BookReview.prototype.bindEvents4Comment = function() {
	var oSelf = this;

	

	$('#fldComment').focus();
	$("#fldComment").off("keyup keydown").on("keyup keydown", function(e){
		var sTextareaVal = $(this).val();
		sTextareaVal = (sTextareaVal.length > 150) ? sTextareaVal.substr(0, 150) : sTextareaVal;
		$(this).val(sTextareaVal);	
	});
	


	$("#btnSave").off("click").on("click", function (e) {
		var recIdx = $(this).attr("data-recordIndex");
		oSelf.model.reviewData[recIdx].comments = $("#fldComment").val();
		oSelf.renderPreview(recIdx);

		//ILIT-5334
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
	});

	$('#bookReviewDoneButton').off('keydown').on('keydown',function(e){
		handleTab(e,this,$(this),$("#btnCancel"));

	})
	
	$("#btnCancel").off("click keydown")
	.on("click", function () {
		var recIdx = $(this).attr("data-recordIndex");
		oSelf.render(recIdx);
	}).on('keydown',function(e){
		
		handleTab(e,this,$("#bookReviewDoneButton"),$("#btnCancel"));
	})

	//ILIT-5334
	$("#fldComment").off("chnage").on('change',function(e){
			
			if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
				callLogUserActivity(e); 
		    }
	})
};

BookReview.prototype.bindEvents4Preview = function() {
	var oSelf = this;
	$('#btnSubmit').focus();
	 $("#btnSubmit").off("click").on("click", function (e) {

            if(!$(this).hasClass("active")){
 		var recIdx = $(this).attr("data-recordIndex");
                $(this).addClass("active");
		oSelf.serviceHadler.exportSaveBookReviewFeedback(function(){
			oSelf.render(recIdx);
		}, recIdx);
			
			setTimeout(function(){
				$('#bookReviewDoneButton').focus();
			},2000);

			SetGoogleAnalytic('S-RTO-SUB'); //send LRS event For Student - Book Review Submitted
            }
	});

	$('#bookReviewDoneButton').off('keydown').on('keydown',function(e){
		handleTab(e,this,$(this),$("#btnCancel"));
	})
	
	$("#btnCancel").off("click keydown").on("click", function () {
		var recIdx = $(this).attr("data-recordIndex");
		oSelf.render(recIdx);
	})
	.on('keydown',function(e){
		console.log('this is coming here',e);
		handleTab(e,this, $("#bookReviewDoneButton"),$("#btnCancel"));
	})
};

BookReview.prototype.bindSlider = function(recIdx) {
	var oSelf = this,
		oSwiper = $('.swiper-container').swiper(
			{
				height: 'auto', 
				noSwiping: true,
				queueEndCallbacks:true,
				onSlideChangeEnd: function(swiper) {
					oSelf.sliderButtonVisibility(swiper.activeIndex, swiper.slides.length);
					
					$(".swiper-slide").find("div.bookItem").removeClass("active");
					$(".swiper-slide-active").find("div.bookItem").first().addClass("active");
					
					var iIdx = $(".swiper-slide-active").find("div.bookItem").first().attr("data-recordIndex");
					oSelf.renderReviewForm(iIdx);

					//ILIT-5334
					callLogUserActivity(); 
				}
			}
		);
	
	var iSwipeIndex = 0,
		divider = (recIdx / 5), 
		reminder = (recIdx % 5);
	if( divider != 0) {
		iSwipeIndex = divider;
		if(reminder != 0){
			iSwipeIndex++;
		}
	}
	iSwipeIndex = ((iSwipeIndex - 1) < 0) ? 0 : (iSwipeIndex - 1);
	oSwiper.swipeTo(iSwipeIndex, 200);
	
	
	$(".swiper-wrapper").height("auto").children().height("auto");
	oSelf.sliderButtonVisibility(oSwiper.activeIndex, oSwiper.slides.length);
	
	$('#prevPagingBtn').off('click tap').on('click tap', function () {
		oSwiper.swipePrev();
	});
	
	$('#nextPagingBtn').off('click tap').on('click tap', function () {
		oSwiper.swipeNext();
	});
};

BookReview.prototype.sliderButtonVisibility = function (currentIdx, sliderLength) {
	var oSelf = this,
		counter = parseInt(currentIdx) + 1;
	if (sliderLength == 1) {
		$('#prevPagingBtn').hide();
		$('#nextPagingBtn').hide();
	}
	else{
		if(counter == 1){
			$('#prevPagingBtn').hide();
			$('#nextPagingBtn').show();
		}
		else if(counter >= sliderLength){ 
			$('#nextPagingBtn').hide();
			$('#prevPagingBtn').show();
		}
		else{ 
			$('#prevPagingBtn').show();
			$('#nextPagingBtn').show();
		}
	}
};


BookReview.prototype.hideLoader = function () { oUtility.hideLoader(); };
BookReview.prototype.showLoader = function (pdOpacity) {
	var dOpacity = parseFloat(pdOpacity) || 1;
	
	if (!(dOpacity >= 0 && dOpacity <= 1)) { dOpacity = 1; }
	oUtility.showLoader({
		'click-to-hide': 	false,
		'message':    		'<img src="media/loader.gif" alt="' + this.CONSTANTS.c_s_LOADING_TXT + '" />\
<p style="font-size:13px; margin-top:-8px; color:#555555;">' + this.CONSTANTS.c_s_LOADING_TXT + '</p>',
		'foreground-color':	'none',
		'background-color':	'#FFFFFF',
		'opacity':			dOpacity,
		'box-style':		{
			'height':			'80px',
			'width':			'80px',
			'line-height':		'25px',
			'opacity':			dOpacity,
			'user-select':		'none',
			'-moz-user-select':	'none'
		}
	});
};

// triggered from native
function BookReviewShowNetworkErrorAlert(bNetworkErr){	
	if(bNetworkErr) {
		// show popup
		if($('#dialog-message-network').text() != GENERAL.c_s_NO_INTERNET_MSG) {
			BookReview.prototype._alert(
				{
					divId:		'dialog-message-network',
					title:		'Alert!',
					message:	GENERAL.c_s_NO_INTERNET_MSG
				},
				$.noop(),
				"null"
			);
		}
	} else if(!bNetworkErr) {
		// hide popup
		if($('#dialog-message-network').text() == GENERAL.c_s_NO_INTERNET_MSG) {	
			$('#dialog-message-network').text("");
			$('#dialog-message-network').dialog('close');
		}
	}
}

BookReview.prototype._alert = ISeriesBase.prototype._alert;

var $bookReview;
$(document).ready(function () {

	if (oPlatform.isIOS()) {
		loadJS('js/NativeBridge.js', function () {
			$bookReview = new BookReview ({});
		});					
	}else if(location.hash === "#chromeApp") {
		if(window.top.appOrigin){
			window.appOrigin = window.top.appOrigin;
			$bookReview = new BookReview ({});
			return;
		}
		window.addEventListener('message', onMessage);
		function onMessage(e) {
			window.appWindow = e.source;
			window.appOrigin = e.origin;
			$bookReview = new BookReview ({});
		}
		if(typeof chrome.runtime.id !== 'undefined'){
			$bookReview = new BookReview ({});
		}
	}
	else {
		$bookReview = new BookReview ({});
	}
});