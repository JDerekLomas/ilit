var ssAPI = null; //Speechstream API
var LANGUAGE_LIST_ARR = [];
window.addEventListener("speechToolbarLoaded", function(e) {
	ssAPI = e.detail;
	ssAPI.studyTools.clearHighlights(); 

	// load texthelp languages list
	loadLanguageList();	
}, false);

var book = {
	"orderList" : []
};

var dimension = {
	"portrait" : {"width" : 0,"height" : 0},	
	"landscape" : {"width" : 0,"height" : 0}
};

var eBookEnvironment = {
	"currLandScapePageNo" : 1,
	"currPortraitPageNo" : 1,
	"maxLandScapePageNo" : 1,
	"maxPortraitPageNo" : 1,
	"isCurrModePortrait" : false
};

var fontResize = {
	"8" : {
		"cssPath" : "f8",
		"isDefault" : false
	},
	"14" : {
		"cssPath" : "f14",
		"isDefault" : true
	},
	"20" : {
		"cssPath" : "f20",
		"isDefault" : false
	}
};
var eBookStylePath='';
var _lastFocusedElem=[];
//var excludeChapList = ['cover','cover1','title','ded','ded1','copy','toc']
var excludeChapList = ['ded','ded1','toc'], chapterStartIndex = -1;
var objScroll = {cursorcolor:"#000000",autohidemode:false,cursorborderradius:'0px',horizrailenabled:false};

var isShowingTOC = false;
var dblClick = false, tmpObj, firstClick = false;				//REPLICATE DOUBLE CLICK ON TOUCH DEVICE
var wordSelectionTimeOut;
var tmpScroll = false, tmpTouchStarted = false;

var objLibraryProgress = '';									//SAVES VALUE FOR STATE OF PAGE FONT-SIZE, PAGE NO.
var wordsPerPage = 150, wordCountTime = 30, wordCountTime4ilit20 = 10, wordCountTimeOut;	//WORD COUNT PER PAGE, TIME IN SECS TO INCREMENT COUNT, CLEAR TIME OUT VARIABLE
var totalWordsRead = 0;
var isFirstLoad = true;										//FLAG TO DISPLAY PAGE FOR FIRST TIME FIRST LOAD
var rootFolderPath_ios = "";										// for correct root folder path for ios; this is temporary solution
var isCorrectRootfolderpath=true;
var WordCountObj={};
var weekWiseWordCount = 0;
var timeSpentPerPage = 0;
var TOT_TIME_SPENT = 0;
var WEEKLY_TIME_SPENT = 0;
var maxTimePerPage = 60000; // 1 min
var OVERALL_SENTENCE_COUNT_ALL_CHAPTERS = 0, OVERALL_PAGE_NO_TO_RENDER = 0;
// CLAS-73
var defaultHighlight = [];
// CLAS-73 end

function loadLanguageList() {
	// populate language list
	var oLangList = ssAPI.textTools.getLanguageList();	
	
	LANGUAGE_LIST_ARR = ($.merge(oLangList["Lanaguages with a voice"], oLangList["Lanaguages without a voice"])).sort();
	
	var sLanguageList = '<li role="button" aria-pressed="true" tabindex="0" lang="Spanish" class="active"><div>Spanish</div> <span class="sprite signal"></span></li>';
	$.each(LANGUAGE_LIST_ARR, function(k,val) {
		if (val.toLowerCase() == "spanish" || val.toLowerCase() == "english") { return; }
		sLanguageList += '<li role="button" aria-pressed="true" tabindex="0" lang="'+val+'"><div>'+val+'</div> <span class="sprite signal"></span></li>';
	})
	$("#translateMenu").html(sLanguageList);
	ssAPI.textTools.setTranslateDestination("Spanish");

	// bind language list
	$('.tooltip_wrap_language li').off('click').on('click', function(){
		$('.tooltip_wrap_language li.active').removeClass('active').attr({'aria-pressed':'false'});
		$(this).addClass('active');
		$(this).attr({'aria-pressed':"true"});
		if(navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
			var _selectedLiInfo = $(this).text()+' pressed';
			readThis(_selectedLiInfo);
		}
		eba_translate_target = $(this).attr('lang');		
		ssAPI.textTools.setTranslateDestination(eba_translate_target);
	});

	$('.tooltip_wrap_language li').off('keydown').on('keydown', function(e){
		triggerClickOnThisElemApp(e,this);
	});
}

function init(){
	var objSent, tmpStr = '';

	//CLASSVIEW-1002
	if(bookTitle.length>50){
		document.getElementById("wrapper").classList.remove("ebook_container_content");
		document.getElementById("wrapper").classList.add("ebook_container_content_ForLength50");
	}

	showLoader();

	$('body').attr('class',$('.zooms.active').attr('cssPath'));
	$('#BackToLibrary,#btnTOC,#infoBtn,#btnFontResize,#btnLanguage','#btnTextHighlight').tooltip();
	$('.header_inner.ebook .middle').html('<div id="booktitle">' + bookTitle + '</div>');
	$('#backBtn,#nextBtn').hide();
	// CLAS-1062 start
	if(window.parent){
		originalLibraryTitle = window.parent.document.title;
		window.parent.document.title = originalLibraryTitle+" - "+bookTitle;
		window.parent.$("#wrapperFrame").attr("title","Library Book :"+bookTitle);
	}
  	// CLAS-1062 end
  	
	$(".ebook_content_block").css({'overflow-y':'hidden'}); 
	//$(".ebook_content_block").css({'overflow-y':'auto'}); //allow vertical scroll on page
	$(".ebook_container_block").css({'width':'50%','float':'left'}); 
	//$(".ebook_content_block_middle").css('background','url(media/midlle_bg_ebook.png) repeat-y 50% top'); 
	$(".ebook_content_block_middle").css({'background':'none'}); //remove the middle book page divider
	$(".ebook_container_block right_ebook").show();
	$('.pages_slider_conts').css('width','100%');
	$('#btnLanguage').prop('disabled',false);
	$('#btnLanguage').removeClass('disabledBtn');
	

	// CLAS-73 
	GetHighlights();
	// CLAS-73 end
	//SET PAGE VALUE
	setOrientation();

	//SORT CONTENT AND ASSIGN IT TO OBJECT 'BOOK'
	calculatePageOrder();

	//CALCULATE START INDEX
	chapterStartIndex = 0;

	//Replacing anchor tag's href values for 'toc' content of a book :- ILIT-5103
	for (var i=0;i<book.orderList.length;i++) {
		if ((book.orderList[i].name).toLowerCase() == 'toc'.toLowerCase()) {
			var bookContent = content.Pages[book.orderList[i].name].sentences;
			content.Pages[book.orderList[i].name].sentences = (replaceHrefValues(bookContent) != null) ? replaceHrefValues(bookContent) : content.Pages[book.orderList[i].name].sentences;
			break;
		}
	}

	// CLAS-73
	for (var i=0;i<book.orderList.length;i++) {
		var bookContent = content.Pages[book.orderList[i].name].sentences;
		if(bookContent == undefined){
			for (var j=0; j<content.Pages[book.orderList[i].name].Pages.length; j++){
				bookContent = content.Pages[book.orderList[i].name].Pages[j].sentences;
				content.Pages[book.orderList[i].name].Pages[j].sentences = updateSentences(bookContent,book.orderList[i].name, book.orderList[i].order);
			}
		}else{
			content.Pages[book.orderList[i].name].sentences = updateSentences(bookContent,book.orderList[i].name, book.orderList[i].order);
		}
	}
	// CLAS-73 end 

	for (var i=0;i<book.orderList.length;i++)
	{
		var isMatchFound = false;
		for (var j=0;j<excludeChapList.length;j++)
		{
			if ((book.orderList[i].name).toLowerCase() == excludeChapList[j].toLowerCase())
			{
				chapterStartIndex = i + 1;
				j = excludeChapList.length;
				isMatchFound = true;
			}
		}
		if (!isMatchFound)
			i = book.orderList.length;
	}

	if(PageWiseLayout){
		$('#btnFontResize').prop('disabled',true);
		$('#btnFontResize').css('opacity','0.5');
	}else{
		$('#btnFontResize').prop('disabled',false);
		$('#btnFontResize').css('opacity','1');
	}


	//CALCULATE PAGES AND ASSIGN PAGE NUMBERS TO SENTENCES & SET WORDS PER PAGE
	setPageInfo();

	try
	{
		if ((objLibraryProgress != '') && (objLibraryProgress.chapNo != -1) && (objLibraryProgress.sentNo != -1))
		{
			eBookEnvironment.currLandScapePageNo = book.orderList[objLibraryProgress.chapNo].sentences[objLibraryProgress.sentNo].landScapePageNo;
			//Page Load time Right & Left Button display status
			if(eBookEnvironment.currLandScapePageNo + 1 >= eBookEnvironment.maxLandScapePageNo){
				$(".ebook_next_button").addClass("disabled");
				// CLAS-1090 start
				$(".ebook_next_button").attr("aria-disabled","true");
				// CLAS-1090 end
			}
			if(eBookEnvironment.currLandScapePageNo <= 1){
				$(".ebook_previous_button").addClass("disabled");
				// CLAS-1090 start
				$(".ebook_previous_button").attr("aria-disabled","true");
				// CLAS-1090 end
			}
		}	
	}
	catch (e){}

	window.onresize = function(){
		setOrientation();
	};

	window.addEventListener("orientationchange", setOrientation);
	
	//disable prev button on load
	if(eBookEnvironment.currLandScapePageNo == 1){
		$(".ebook_previous_button").addClass("disabled")
		// CLAS-1090 start
		$(".ebook_previous_button").attr("aria-disabled","true");
		// CLAS-1090 end
	}

	setTimeout(function(){
		$('.t2 #BackToLibrary').off('keydown').on('keydown', function(objEvent){	
			handleTab( objEvent, $(this),$(this), $('.ui-slider-handle') );	   
		});	       
		$('#slider-range-min').off('keydown').on('keydown', function(objEvent){
            handleTab( objEvent, $(this), $('#BackToLibrary'), $(this));	   
        });
	},100);
	

	$(document).off('click').on('click', function(e) {
		//ILIT-5334
        if($(e.target).hasClass("valid-activity")){
			callLogUserActivity(e);        }

		$(".ebook_container_block").css({'width':'50%','float':'left'});

		if(!$(e.target).is($('div.zooms'))){
			$("#menuFontResize").hide();
			$('.zooms').attr('aria-hidden',"true" ).hide();
			$('#btnFontResize').attr({'aria-expanded':"false"}).removeClass('active');
		}		
		if(!$(e.target).is($('li'))){
			$("#menuLanguage").hide();
			$('#btnLanguage,#infoBtn').attr({'aria-expanded':"false"}).removeClass('active');
		}
		if(!$(e.target).is($('.w')) && !$(e.target).is($('.s')))
			$("#textToHelpMenu").hide();
		$('#infoBtn').attr({'aria-expanded':"false"}).removeClass('active');	
		
		//console.log($(e.target));
		/*if(!$(e.target).is($('.thss-dialog-toolbarPopup .thss-dialog-speakercontent'))){
			$(".thss-dialog-toolbarPopup").hide();
		}*/

		$("#InfoContent").hide();
		$("#menuTextHighlight").hide();
		/*if(!$(e.target).is($('.textToHelpMenuButtons'))){
			if(_lastFocusedElem.length > 0){
				_lastFocusedElem.focus();
			}
		}*/
		if($(e.target).is($('.thss-dialog-popupClose'))){
			setTimeout(function() {
				if(_lastFocusedElem.length > 0){
					_lastFocusedElem.focus();
				}
			}, 500);
		}
	});

	$('#btnTOC').off('click').on('click',function(event){
		//ILIT-5334
        if($(event.target).hasClass("valid-activity")){
			callLogUserActivity(event);			

        }
		generateTOC();
  		var tempVal = "1-1";

		$(".ui-slider-handle").html(tempVal);
		$( "#slider-range-min" ).slider('value',1);
		$(".ui-slider-handle").attr('tabindex','0');
		$(".ui-slider-handle").attr({'aria-valuetext':"Page Number "+tempVal,"aria-valuenow":tempVal});
		$(this).focus();

		//disable prev button
		$(".ebook_previous_button").addClass("disabled");
		// CLAS-1090 start
		$(".ebook_previous_button").attr("aria-disabled","true");
		// CLAS-1090 end
		// CLASSVIEW-902   CLASSVIEW-897   CLASSVIEW-908
		// CLASSVIEW-903   CLASSVIEW-899   CLASSVIEW-909	
		//enable next button after TOC click
		if($(".ebook_next_button").hasClass("disabled")){
			$(".ebook_next_button").removeClass("disabled");
			// CLAS-1090 start
			$(".ebook_next_button").removeAttr("aria-disabled");
			// CLAS-1090 end
		}
	});

	//Highlighter menu
	$('#btnTextHighlight').off('click').on('click',function(event){
		if ($('#menuTextHighlight').is(":visible")) {
			$("#menuTextHighlight").hide();
			$(this).removeClass('active');
			$("#btnTextHighlight").attr({'aria-expanded':"false"});
			$('.highlights').attr("aria-hidden","true" ).hide();
		} else {
			$("#menuTextHighlight").show();
			$(this).addClass('active');
			$("#btnTextHighlight").attr({'aria-expanded':"true"});
			$(".highlights.strike").focus();
			_lastFocusedElem = this;
			$('.highlights').attr('aria-hidden',"false" ).show();
		}

		$("#menuLanguage").hide();
		$('#btnLanguage').removeClass('active');
		event.stopPropagation();

	});

	$('.highlights').off('click').on('click',function(){
		ssAPI.speechTools.stop();
		$('.highlights.active').removeClass('active').attr({'aria-selected':'false'});
		$(this).addClass('active').attr({'aria-selected':'true'});

		$("#rangeText").removeClass("highlight");
		$("#rangeText").focus();
		
		//window.getSelection().removeAllRanges();
		//window.getSelection().addRange(range);

		if ($(this).hasClass("cyan")) {
			//CLAS-73
			//$("#rangeText").addClass("cyan annotation").removeClass("magenta green");
			$("#rangeText").addClass("cyan annotation").removeClass("magenta green strike");
			//ssAPI.studyTools.highlightCyan();
			if(($("#rangeText").attr("class") == "s cyan annotation")||($("#rangeText").attr("class") == "s annotation cyan"))
				{
					var paragraphIndex =$("#rangeText").closest("p").attr("paragraphindex");
					var chaptorNo =$("#rangeText").closest("p").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("h1").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("div").attr("chaptorno");
					paragraphIndex ??= $("#rangeText").closest("div").attr("paragraphindex");
					paragraphIndex ??= $("#rangeText").closest("h1").attr("paragraphindex");
					var pageNo = eBookEnvironment.currLandScapePageNo;
					var targetHighlight = {paragraphindex: paragraphIndex, color :"s cyan annotation"};
					updateDefaultHighlight(targetHighlight);
					SaveNewHighlights(chaptorNo,pageNo);
				}
				else{
					var wordIndex =$("#rangeText").attr("wordindex");
					var paragraphIndex =$("#rangeText").closest("p").attr("paragraphindex");
					var chaptorNo =$("#rangeText").closest("p").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("h1").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("div").attr("chaptorno");
					paragraphIndex ??= $("#rangeText").closest("div").attr("paragraphindex");
					paragraphIndex ??= $("#rangeText").closest("h1").attr("paragraphindex");
					var pageNo = eBookEnvironment.currLandScapePageNo;
					if (typeof paragraphIndex === "undefined") var headingIndex =$("#rangeText").closest("h1").attr("headingindex");
					var targetHighlight = {paragraphindex: paragraphIndex, wordindex: wordIndex, color :"w cyan annotation"};
					updateDefaultHighlight(targetHighlight);
					SaveNewHighlights(chaptorNo,pageNo);
				}
			//CLAS-73end
		} else if ($(this).hasClass("magenta")) {
			// CLAS-73
			//$("#rangeText").addClass("magenta annotation").removeClass("cyan green");
			$("#rangeText").addClass("magenta annotation").removeClass("cyan green strike");
			//ssAPI.studyTools.highlightMagenta();
			if(($("#rangeText").attr("class") == "s magenta annotation")||($("#rangeText").attr("class") == "s annotation magenta"))
				{
					var paragraphIndex =$("#rangeText").closest("p").attr("paragraphindex");
					var chaptorNo =$("#rangeText").closest("p").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("h1").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("div").attr("chaptorno");
					paragraphIndex ??= $("#rangeText").closest("div").attr("paragraphindex");
					paragraphIndex ??= $("#rangeText").closest("h1").attr("paragraphindex");
					var pageNo = eBookEnvironment.currLandScapePageNo;
					var targetHighlight = {paragraphindex: paragraphIndex, color :"s magenta annotation"};
					updateDefaultHighlight(targetHighlight);
					SaveNewHighlights(chaptorNo,pageNo);
				}
				else{
					var wordIndex =$("#rangeText").attr("wordindex");
					var paragraphIndex =$("#rangeText").closest("p").attr("paragraphindex");
					var chaptorNo =$("#rangeText").closest("p").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("h1").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("div").attr("chaptorno");
					paragraphIndex ??= $("#rangeText").closest("div").attr("paragraphindex");
					paragraphIndex ??= $("#rangeText").closest("h1").attr("paragraphindex");
					var pageNo = eBookEnvironment.currLandScapePageNo;
					var targetHighlight = {paragraphindex: paragraphIndex, wordindex: wordIndex, color :"w magenta annotation"};
					updateDefaultHighlight(targetHighlight);
					SaveNewHighlights(chaptorNo,pageNo);
				}
				// CLAS-73 end
		} else if ($(this).hasClass("green")) {
			// CLAS-73
			//$("#rangeText").addClass("green annotation").removeClass("cyan magenta");
			$("#rangeText").addClass("green annotation").removeClass("cyan magenta strike");
			//ssAPI.studyTools.highlightGreen();
			if(($("#rangeText").attr("class") == "s green annotation")||($("#rangeText").attr("class") == "s annotation green"))
				{
					var paragraphIndex =$("#rangeText").closest("p").attr("paragraphindex");
					var chaptorNo =$("#rangeText").closest("p").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("h1").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("div").attr("chaptorno");
					paragraphIndex ??= $("#rangeText").closest("div").attr("paragraphindex");
					paragraphIndex ??= $("#rangeText").closest("h1").attr("paragraphindex");
					var pageNo = eBookEnvironment.currLandScapePageNo;
					var targetHighlight = {paragraphindex: paragraphIndex, color :"s green annotation"};
					updateDefaultHighlight(targetHighlight);
					SaveNewHighlights(chaptorNo,pageNo);
				}
				else{
					var wordIndex =$("#rangeText").attr("wordindex");
					var paragraphIndex =$("#rangeText").closest("p").attr("paragraphindex");
					var chaptorNo =$("#rangeText").closest("p").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("h1").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("div").attr("chaptorno");
					paragraphIndex ??= $("#rangeText").closest("div").attr("paragraphindex");
					paragraphIndex ??= $("#rangeText").closest("h1").attr("paragraphindex");
					var pageNo = eBookEnvironment.currLandScapePageNo;
					var targetHighlight = {paragraphindex: paragraphIndex, wordindex: wordIndex, color :"w green annotation"};
					updateDefaultHighlight(targetHighlight);
					SaveNewHighlights(chaptorNo,pageNo);
				}
				// CLAS-73 end
		} else if ($(this).hasClass("clear")) 
		{
			// CLAS-73
			// $(".ebook_text_content .green").removeClass("green annotation");
			// $(".ebook_text_content .cyan").removeClass("cyan annotation");
			// $(".ebook_text_content .magenta").removeClass("magenta annotation");
			// $(".ebook_text_content .strike").removeClass("strike annotation");
			//ssAPI.studyTools.clearHighlights();
			if($("#rangeText").hasClass("cyan"))
				{
				$("#rangeText").removeClass("cyan annotation");
				if($("#rangeText").attr("class").startsWith("s"))
				{
					var paragraphIndex =$("#rangeText").closest("p").attr("paragraphindex");
					var chaptorNo =$("#rangeText").closest("p").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("h1").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("div").attr("chaptorno");
					paragraphIndex ??= $("#rangeText").closest("div").attr("paragraphindex");
					paragraphIndex ??= $("#rangeText").closest("h1").attr("paragraphindex");
					var pageNo = eBookEnvironment.currLandScapePageNo;
					var removeFlag = true;
					var targetHighlight = { paragraphindex: paragraphIndex, color :"s cyan annotation",removeFlag:removeFlag};
					updateDefaultHighlight(targetHighlight);
					SaveNewHighlights(chaptorNo, pageNo);
				}
				else{
					var wordIndex =$("#rangeText").attr("wordindex");
					var paragraphIndex =$("#rangeText").closest("p").attr("paragraphindex");
					var chaptorNo =$("#rangeText").closest("p").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("h1").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("div").attr("chaptorno");
					paragraphIndex ??= $("#rangeText").closest("div").attr("paragraphindex");
					paragraphIndex ??= $("#rangeText").closest("h1").attr("paragraphindex");
					var pageNo = eBookEnvironment.currLandScapePageNo;
					var removeFlag = true;
					var targetHighlight = {paragraphindex: paragraphIndex, wordindex: wordIndex, color :"w cyan annotation", removeFlag:removeFlag};
					updateDefaultHighlight(targetHighlight);
					SaveNewHighlights(chaptorNo, pageNo);
				}
			}
			if($("#rangeText").hasClass("green"))
				{
				$("#rangeText").removeClass("green annotation");
				if($("#rangeText").attr("class").startsWith("s"))
				{
					var paragraphIndex =$("#rangeText").closest("p").attr("paragraphindex");
					var chaptorNo =$("#rangeText").closest("p").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("h1").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("div").attr("chaptorno");
					paragraphIndex ??= $("#rangeText").closest("div").attr("paragraphindex");
					paragraphIndex ??= $("#rangeText").closest("h1").attr("paragraphindex");
					var pageNo = eBookEnvironment.currLandScapePageNo;
					var removeFlag = true;
					var targetHighlight = { paragraphindex: paragraphIndex, color :"s green annotation",removeFlag:removeFlag};
					updateDefaultHighlight(targetHighlight);
					SaveNewHighlights(chaptorNo, pageNo);
				}
				else{
					var wordIndex =$("#rangeText").attr("wordindex");
					var paragraphIndex =$("#rangeText").closest("p").attr("paragraphindex");
					var chaptorNo =$("#rangeText").closest("p").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("h1").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("div").attr("chaptorno");
					paragraphIndex ??= $("#rangeText").closest("div").attr("paragraphindex");
					paragraphIndex ??= $("#rangeText").closest("h1").attr("paragraphindex");
					var pageNo = eBookEnvironment.currLandScapePageNo;
					var removeFlag = true;
					var targetHighlight = {paragraphindex: paragraphIndex, wordindex: wordIndex, color :"w green annotation", removeFlag:removeFlag};
					updateDefaultHighlight(targetHighlight);
					SaveNewHighlights(chaptorNo, pageNo);
				}
				}
			if($("#rangeText").hasClass("magenta"))
				{
				$("#rangeText").removeClass("magenta annotation");
				if($("#rangeText").attr("class").startsWith("s"))
				{
					var paragraphIndex =$("#rangeText").closest("p").attr("paragraphindex");
					var chaptorNo =$("#rangeText").closest("p").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("h1").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("div").attr("chaptorno");
					paragraphIndex ??= $("#rangeText").closest("div").attr("paragraphindex");
					paragraphIndex ??= $("#rangeText").closest("h1").attr("paragraphindex");
					var pageNo = eBookEnvironment.currLandScapePageNo;
					var removeFlag = true;
					var targetHighlight = { paragraphindex: paragraphIndex, color :"s magenta annotation",removeFlag:removeFlag};
					updateDefaultHighlight(targetHighlight);
					SaveNewHighlights(chaptorNo, pageNo);
				}
				else{
					var wordIndex =$("#rangeText").attr("wordindex");
					var paragraphIndex =$("#rangeText").closest("p").attr("paragraphindex");
					var chaptorNo =$("#rangeText").closest("p").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("h1").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("div").attr("chaptorno");
					paragraphIndex ??= $("#rangeText").closest("div").attr("paragraphindex");
					paragraphIndex ??= $("#rangeText").closest("h1").attr("paragraphindex");
					var pageNo = eBookEnvironment.currLandScapePageNo;
					var removeFlag = true;
					var targetHighlight = {paragraphindex: paragraphIndex, wordindex: wordIndex, color :"w magenta annotation", removeFlag:removeFlag};
					updateDefaultHighlight(targetHighlight);
					SaveNewHighlights(chaptorNo, pageNo);
				}
				}
			if($("#rangeText").hasClass("strike"))
				{
				$("#rangeText").removeClass("strike annotation");
				if($("#rangeText").attr("class").startsWith("s"))
				{
					var paragraphIndex =$("#rangeText").closest("p").attr("paragraphindex");
					var chaptorNo =$("#rangeText").closest("p").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("h1").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("div").attr("chaptorno");
					paragraphIndex ??= $("#rangeText").closest("div").attr("paragraphindex");
					paragraphIndex ??= $("#rangeText").closest("h1").attr("paragraphindex");
					var pageNo = eBookEnvironment.currLandScapePageNo;
					var removeFlag = true;
					var targetHighlight = { paragraphindex: paragraphIndex, color :"s strike annotation",removeFlag:removeFlag};
					updateDefaultHighlight(targetHighlight);
					SaveNewHighlights(chaptorNo, pageNo);
				}
				else{
					var wordIndex =$("#rangeText").attr("wordindex");
					var paragraphIndex =$("#rangeText").closest("p").attr("paragraphindex");
					var chaptorNo =$("#rangeText").closest("p").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("h1").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("div").attr("chaptorno");
					paragraphIndex ??= $("#rangeText").closest("div").attr("paragraphindex");
					paragraphIndex ??= $("#rangeText").closest("h1").attr("paragraphindex");
					var pageNo = eBookEnvironment.currLandScapePageNo;
					var removeFlag = true;
					var targetHighlight = {paragraphindex: paragraphIndex, wordindex: wordIndex, color :"w strike annotation", removeFlag:removeFlag};
					updateDefaultHighlight(targetHighlight);
					SaveNewHighlights(chaptorNo, pageNo);
				}
				}
			// CLAS-73 end
		} else if ($(this).hasClass("strike")) {
			// $("#rangeText").addClass("strike annotation");
			$("#rangeText").addClass("strike annotation").removeClass("cyan green magenta");;
			// CLAS-73
			if(($("#rangeText").attr("class") == "s strike annotation") ||($("#rangeText").attr("class") == "s annotation strike"))
				{
					var paragraphIndex =$("#rangeText").closest("p").attr("paragraphindex");
					var chaptorNo =$("#rangeText").closest("p").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("h1").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("div").attr("chaptorno");
					paragraphIndex ??= $("#rangeText").closest("div").attr("paragraphindex");
					paragraphIndex ??= $("#rangeText").closest("h1").attr("paragraphindex");
					var targetHighlight = {paragraphindex: paragraphIndex, color :"s strike annotation"};
					updateDefaultHighlight(targetHighlight);
					SaveNewHighlights(chaptorNo, pageNo);
				}
				else{
					var wordIndex =$("#rangeText").attr("wordindex");
					var paragraphIndex =$("#rangeText").closest("p").attr("paragraphindex");
					var chaptorNo =$("#rangeText").closest("p").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("h1").attr("chaptorno");
					chaptorNo ??= $("#rangeText").closest("div").attr("chaptorno");
					paragraphIndex ??= $("#rangeText").closest("div").attr("paragraphindex");
					paragraphIndex ??= $("#rangeText").closest("h1").attr("paragraphindex");
					var pageNo = eBookEnvironment.currLandScapePageNo;
					var targetHighlight = {paragraphindex: paragraphIndex, wordindex: wordIndex, color :"w strike annotation",};
					updateDefaultHighlight(targetHighlight);
					SaveNewHighlights(chaptorNo, pageNo);
				}
			// CLAS-73 end
		} else if ($(this).hasClass("collect")) {
			var msg = '';
			if (!($(".ebook_text_content .green").length ||  
				$(".ebook_text_content .cyan").length ||
				$(".ebook_text_content .magenta").length ||
				$(".ebook_text_content .strike").length)
			) {
				msg = "There are no highlights to display."
			}

			var highlightedText = "<ul>",
				sClass = "";

			// collect all annotations
			// $(".ebook_text_content .annotation").each(function(){
			// 	sClass = $(this).attr("class");
			// 	highlightedText +="<li class='"+sClass+"'>"+$(this).html()+"</li>";
			// })
			// CLAS-73
			if(eBookEnvironment.currLandScapePageNo === -1){
				msg = "There are no highlights to display."
			}else{
				// collect all annotations
				$(".ebook_text_content .annotation").each(function(){
					sClass = $(this).attr("class");
					highlightedText +="<li class='"+sClass+"'>"+$(this).html()+"</li>";
				})
			}
			// CLAS-73 end

			highlightedText += "</ul>";
			highlightedText = msg ? msg : highlightedText;

			EbookPlayerView._alert(
				{
					divId:		'collect-highlight-dialog',
					title:		'Collect Highlights',
					message:	highlightedText
				},
				$.noop(),
				"null"
			);
			
			$(".Ilit_alert_box.ui-dialog .ui-dialog-titlebar .ui-dialog-titlebar-close").show();

			$("#collect-highlight-dialog").parent(".ui-dialog").css({
				"border-radius": "3px",
				"top": "0",
				"left": "0",
				"transform": "translate(19px, 80px)",
				"width": "500px"
			});
			$("#collect-highlight-dialog").siblings(".ui-dialog-titlebar").css({
				"border-radius": "3px",
				"color": "#484848 !important",
				"font-size": "16px",
				"font-family": "'Open Sans', Arial, sans-serif !important",
				"font-weight": "600 !important",
				"background-color": "#EDEDED !important",
				"border-bottom": "0 !important"
			});
			$("#collect-highlight-dialog").siblings(".ui-dialog-titlebar .ui-dialog-title").css({
				"color": "#484848 !important",
				"font-size": "16px",
				"font-family": "Open Sans, Arial, sans-serif !important",
				"font-weight": "600 !important"
			});			
			
		}
		$('#rangeText').removeAttr('id');
	});

	$('#btnFontResize').off('click').on('click',function(event){

		//ILIT-5334
        if($(event.target).hasClass("valid-activity")){
           callLogUserActivity(event);
			
		}
		
		if ($('#menuFontResize').is(":visible")) {
			$("#menuFontResize").hide();
			$(this).removeClass('active');
			$("#btnFontResize").attr({'aria-expanded':"false"});
			$('.zooms').attr("aria-hidden","true" ).hide();
		} else {
			$("#menuFontResize").show();
			$(this).addClass('active');
			$("#btnFontResize").attr({'aria-expanded':"true"});
			_lastFocusedElem = this;
			$('.zooms').attr('aria-hidden',"false" ).show();
		}

		$("#menuLanguage").hide();
		$('#btnLanguage').removeClass('active');
		event.stopPropagation();
	});

	$('.zooms').off('click').on('click',function(){
		showLoader();
		$('#btnFontResize').trigger('click');
		ssAPI.speechTools.stop();
		$('.zooms.active').removeClass('active').attr({'aria-selected':'false'});
		$(this).addClass('active').attr({'aria-selected':'true'});
		setTimeout(function(){
			loadCSS($('.zooms.active').attr('cssPath'), afterCSSLoad);
		},500);
	});

	//screen-masking
	$('#btnScreenMask').off('click').on('click',function(){
		ssAPI.studyTools.toggleScreenMask();		
	});

	$('#btnLanguage').off('click').on('click',function(event){
		//ILIT-5334
        if($(event.target).hasClass("valid-activity")){
            callLogUserActivity(event);
		}
		if ($('#menuLanguage').is(":visible")){
			$("#menuLanguage").hide();
			$(this).removeClass('active');
			$('#btnLanguage').attr({'aria-expanded':"false"});
		} else {
			$("#menuLanguage").show();
			$(this).addClass('active');
			$('#btnLanguage').attr({'aria-expanded':"true"});
			_lastFocusedElem = this;
		}
		$("#menuFontResize").hide();
		$('.zooms').attr('aria-hidden',"true" ).hide();
		$('#btnFontResize').removeClass('active');
		event.stopPropagation();
	});

	$('#infoBtn').off('click').on('click',function(event){
		//ILIT-5334
        if($(event.target).hasClass("valid-activity")){
		    callLogUserActivity(event);
			
        }
		if ($('#InfoContent').is(":visible")){
			$("#InfoContent").hide();
			$(this).removeClass('active');
			$('#infoBtn').attr({'aria-expanded':"false"});
			$('#infoBtn').focus();
		} else {
			$("#InfoContent").show();
			$(this).addClass('active');
			$('#infoBtn').attr({'aria-expanded':"true"});
			_lastFocusedElem = this;
		}
		$("#menuFontResize,#menuLanguage").hide();
		$('.zooms').attr('aria-hidden',"true" ).hide();
		$('#btnLanguage,#btnFontResize').removeClass('active');
		event.stopPropagation();
	});

	//PREVENT DEFAULT SCROLL ON IPAD EXCEPT FOR NOTES POPUP AND TRANSLATE LANGUAGE POPUP
	document.ontouchmove  = function(e){ 
	  e = e || window.event;
	  var _targetElem = e.target || e.srcElement;
	  if (_targetElem.id == "txtAreaListNote" || _targetElem.parentNode.parentNode.id == 'languagesList' || $('#rwDict').css('visibility') != 'hidden' || $('#rwTrans').css('visibility') != 'hidden') {
		return true;
	   }
	  e.preventDefault(); 
	};
	
	var range = new Range();
	Hammer($('.ebook_container_block')).on('doubletap',function(event){
		event.preventDefault();
		event.stopPropagation();
		//ILIT-5001
		//$('.ebook_container_block').attr('style','');

		$('.highlight').removeClass('highlight');
		$('#textToHelpMenu').hide();
		$('#textToHelpMenu .textToHelpMenuButtons,#textToHelpMenu .sep').hide();

		if($(event.target).parents('.s').length) {
			clearTimeout(wordSelectionTimeOut);
			setTimeout(function () {

				_lastFocusedElem = $(event.target);
			    //if (isWinRT) {
			        $('.highlight').removeClass('highlight');
			        $(event.target).parents('.s').addClass('highlight');
					$('#rangeText').removeAttr('id');					
					var sHighlight = ($('.highlight').text()).toString();
					$('#msTextHelp').text(sHighlight);
			        $('#msTextHelp').selectText();

			        $(event.target).parents('.s').addClass('highlight').attr("id","rangeText");
						
					//range.selectNode(rangeText);	
					//range.setStart(rangeText, 0);
  					//range.setEnd(rangeText, 20);										
					//console.log(range);
			    //} else
			    //    $(event.target).parents('.s').selectText();

				
				$('#tthSpeak, #tthNotesSep, #tthNotes, #tthCopySep, #tthCopy, #tthTransSep, #tthTrans').show();

				var offset = $(event.target).parents('.s').offset();
				var objWid = $(event.target).parents('.s').width();
				setPosTextHelp(offset,objWid);
				setTimeout(function(){ 
						$('#tthSpeak').focus();	 
					}, 3000);
				$('.thss-dialog-toolbarPopup').attr({'aria-live':'polite'});
				$('.thss-dialog-popupContent').attr('tabindex',"0");
				$('.thss-dialog-popupClose').attr({'tabindex':"0",'aria-label':'close button'});		
			},300);			
			dblClick = true;
		}
		return false;
	});

	Hammer($('.ebook_container_block')).on('tap',function(event){
		event.preventDefault();
		event.stopPropagation();
		//ILIT-5001
		//$('.ebook_container_block').attr('style','');
		$('.highlight').removeClass('highlight');
		$('#textToHelpMenu').hide();
		$('#textToHelpMenu .textToHelpMenuButtons,#textToHelpMenu .sep').hide();
		
		if($(event.target).hasClass("w") || $(event.target).parents('.w').length) {
			tmpObj = $(event.target);
			_lastFocusedElem = tmpObj;
			wordSelectionTimeOut = setTimeout(function(){
			    if (!dblClick) {
			        //if (isWinRT) {
			            $('.highlight').removeClass('highlight');
						$('#rangeText').removeAttr('id');
						
			            tmpObj.addClass('highlight');

						var sHighlight = ($('.highlight').text()).toString();
						$('#msTextHelp').text(sHighlight);			            
			            $('#msTextHelp').selectText();

			            tmpObj.addClass('highlight').attr("id","rangeText");
						
						//range.selectNode(rangeText);											
						//console.log(range);
			        //} else
					//    tmpObj.selectText();
					
					$('#textToHelpMenu .textToHelpMenuButtons,#textToHelpMenu .sep').show();

					$('#textToHelpMenu').css('left',0).css('top',0).show();
					var offset = $(tmpObj).offset();
					var objWid = $(tmpObj).width();
					setPosTextHelp(offset,objWid);
					setTimeout(function(){ 
						$('#tthSpeak').focus();	 
					}, 3000);
					$('.thss-dialog-toolbarPopup').attr({'aria-live':'polite'});
					$('.thss-dialog-popupContent').attr('tabindex',"0");
					$('.thss-dialog-popupClose').attr({'tabindex':"0",'aria-label':'close button'});	
				}
				tmpTxt = '';
				dblClick = false;
			},400);
		}
	});


	$( "#slider-range-min" ).slider({
		range: "min",
		value: 0,
		min: 1,
		max:  eBookEnvironment.maxLandScapePageNo,
		slide: function( event, ui ) {			
			/* Time spent per page */			
			var timeSpent = timeSpentPerPage ? Date.now() - timeSpentPerPage : 0;			
			TOT_TIME_SPENT += timeSpent > maxTimePerPage ? maxTimePerPage : timeSpent;			
			WEEKLY_TIME_SPENT += timeSpent > maxTimePerPage ? maxTimePerPage : timeSpent;			
			timeSpentPerPage = 0;
			
			
			var tempVal = '<div id="pageNoBallon" style="position:absolute;top:-3.5em;border-radius: 12px;left:0px;background:#000;"><div tabindex="0" style="height:35px;line-height:35px;white-space:nowrap;padding:0 7px;color:#FFF;">' + ui.value+ '-' + (ui.value+1) + ' of ' + eBookEnvironment.maxLandScapePageNo + '</div><div style="border-left: 5px solid transparent;border-right: 5px solid transparent;border-top: 5px solid #000000;bottom: -5px;height: 0;left: 0;margin-left: auto;margin-right: auto;position: absolute;right: 0;width: 0;"></div></div>' + ui.value+ '-' + (ui.value+1) + '';
			var _tempValue = ui.value+ '-' + (ui.value+1);
			
			
			$(".ui-slider-handle").html(tempVal);
			$(".ui-slider-handle").attr("tabindex","0");
			$(".ui-slider-handle").attr({'aria-valuetext':"Page Number "+_tempValue,"aria-valuenow":_tempValue});
			$('#pageNoBallon').css('left',($('.ui-slider-handle').width() / 2) - ($('#pageNoBallon').width() / 2) );			
			
			//ILIT-5334	
			if($(event.target).hasClass('valid-activity')){
				callLogUserActivity(event);
			}
			
					
		},
		stop: function( event, ui ){
			eBookEnvironment.currLandScapePageNo = parseInt(ui.value);
			
			if (eBookEnvironment.currLandScapePageNo % 2 == 0) eBookEnvironment.currLandScapePageNo--;
				displayPage(eBookEnvironment.currLandScapePageNo, true);
			var tempVal = '' + eBookEnvironment.currLandScapePageNo + '-' + (eBookEnvironment.currLandScapePageNo+1) + '';
			
			$(".ui-slider-handle").html(tempVal);
			$(".ui-slider-handle").attr({"tabindex":"0","aria-valuenow":tempVal});
			$(".ui-slider-handle").attr('aria-valuetext',"Page Number "+tempVal);

			ssAPI.speechTools.stop();
			//enable previous button
			if($(".ebook_previous_button").hasClass("disabled")){
				$(".ebook_previous_button").removeClass("disabled");
				// CLAS-1090 start
				$(".ebook_previous_button").removeAttr("aria-disabled");
				// CLAS-1090 end
			}
			
			//enable next button
			if($(".ebook_next_button").hasClass("disabled")){
				$(".ebook_next_button").removeClass("disabled");
				// CLAS-1090 start
				$(".ebook_next_button").removeAttr("aria-disabled");
				// CLAS-1090 end
			}

			//disable prev and next button
			var maxPage = (eBookEnvironment.maxLandScapePageNo - 1)
			if(eBookEnvironment.currLandScapePageNo == maxPage){
				$(".ebook_next_button").addClass("disabled")
				// CLAS-1090 start
				$(".ebook_next_button").attr("aria-disabled","true");
				// CLAS-1090 end
			}
			// CLASSVIEW-902   CLASSVIEW-897   CLASSVIEW-908	
			// CLASSVIEW-903   CLASSVIEW-899   CLASSVIEW-909
			//Few times max page number logic facing issue due to font size effects.
			if(eBookEnvironment.currLandScapePageNo == eBookEnvironment.maxLandScapePageNo){
				$(".ebook_next_button").addClass("disabled")
				// CLAS-1090 start
				$(".ebook_next_button").attr("aria-disabled","true");
				// CLAS-1090 end
			}
			if(eBookEnvironment.currLandScapePageNo == 1){
				$(".ebook_previous_button").addClass("disabled")
				// CLAS-1090 start
				$(".ebook_previous_button").attr("aria-disabled","true");
				// CLAS-1090 end
			}

			//ILIT-5334		
			if($(event.target).hasClass('valid-activity')){
				callLogUserActivity(event);
			}
			
		}
	});
	
	$( "#amount" ).val( "1-" + $( "#slider-range-min" ).slider( "value" ) );
	var tempVal = ""+"1-" + $( "#slider-range-min" ).slider( "value" ) +"";
	
	
	$(".ui-slider-handle").html(tempVal);
	$(".ui-slider-handle").attr({'role':'slider', 'title':'Slider','aria-valuetext':"Page Number "+tempVal,'aria-valuemin':"1",'aria-valuemax':eBookEnvironment.maxLandScapePageNo});
	$('.ui-slider-handle').tooltip();


	//COVER AND TOC
	if (eBookEnvironment.currLandScapePageNo == 0){
		generateTOC();
	}
	else {
		displayPage(eBookEnvironment.currLandScapePageNo, true);
		$( "#slider-range-min" ).slider('value',eBookEnvironment.currLandScapePageNo);
		
		var tmp = (eBookEnvironment.currLandScapePageNo % 2 == 0? eBookEnvironment.currLandScapePageNo - 1 : eBookEnvironment.currLandScapePageNo);	
		var tempVal = tmp+ "-" + (tmp+1);
		
		$(".ui-slider-handle").html(tempVal);
		$(".ui-slider-handle").attr({'aria-valuetext':"Page Number "+tempVal,"aria-valuenow":tempVal});
	}
	//COVER AND TOC END

	//Swipe functionality
	$('.ebook_container_block').hammer({ drag_lock_to_axis: true }).off("dragstart").on("dragstart", function(event) {
		// Time spent per page 		
		var timeSpent = timeSpentPerPage ? Date.now() - timeSpentPerPage : 0;		
		TOT_TIME_SPENT += timeSpent > maxTimePerPage ? maxTimePerPage : timeSpent;		
		WEEKLY_TIME_SPENT += timeSpent > maxTimePerPage ? maxTimePerPage : timeSpent;		
		timeSpentPerPage = 0;
		//ILIT-5334			
		callLogUserActivity(event);
		
	});

	$('.ebook_container_block').hammer({ drag_lock_to_axis: true }).off("dragend").on("dragend", function(event) {
		//ILIT-5334			
		callLogUserActivity(event);
		
		
		//$('.ebook_container_block').off('dragend');
		if (event.gesture.direction == Hammer.DIRECTION_RIGHT){
			//disable prev button
			if(eBookEnvironment.currLandScapePageNo <= 1){
				$(".ebook_previous_button").addClass("disabled");
				// CLAS-1090 start
				$(".ebook_previous_button").attr("aria-disabled","true");
				// CLAS-1090 end
			}
			//enable next button
			if($(".ebook_next_button").hasClass("disabled")){
				$(".ebook_next_button").removeClass("disabled");
				// CLAS-1090 start
				$(".ebook_next_button").removeAttr("aria-disabled");
				// CLAS-1090 end
			}
			if (eBookEnvironment.currLandScapePageNo != -1 ) {
				eBookEnvironment.currLandScapePageNo -= 2;
				displayPage(eBookEnvironment.currLandScapePageNo, true);
			
				if($('#rightPageWrap p').length > 0){
					if( $('#rightPageWrap .s img').length == 0){
						if(navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
							$('#rightPageWrap .w:first').focus();
						}else
							$('#rightPageWrap .s:first').focus();
					}
					else{
						if(navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
							$('#leftPageWrap .w:first').focus();
						}else
							$('#leftPageWrap .s:first').focus();
					}
				}else{
						if(navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
							$('#rightPageWrap .w:first').focus();
						}else
							$('#rightPageWrap .s:first').focus();
				}
				
			}

			//Right to Left screen move time previous button display status
			if(eBookEnvironment.currLandScapePageNo <= 1){
				$(".ebook_previous_button").addClass("disabled");
				// CLAS-1090 start
				$(".ebook_previous_button").attr("aria-disabled","true");
				// CLAS-1090 end
			}

		} else if (event.gesture.direction == Hammer.DIRECTION_LEFT) {
			//disable prev button
			if(eBookEnvironment.currLandScapePageNo + 1 >= eBookEnvironment.maxLandScapePageNo){
				$(".ebook_next_button").addClass("disabled");
				// CLAS-1090 start
				$(".ebook_next_button").attr("aria-disabled","true");
				// CLAS-1090 end
			}
			//enable next button
			if($(".ebook_previous_button").hasClass("disabled")){
				$(".ebook_previous_button").removeClass("disabled");
				// CLAS-1090 start
				$(".ebook_previous_button").removeAttr("aria-disabled");
				// CLAS-1090 end
			}
			if (eBookEnvironment.currLandScapePageNo + 1 < eBookEnvironment.maxLandScapePageNo) {
				eBookEnvironment.currLandScapePageNo += 2
				displayPage(eBookEnvironment.currLandScapePageNo, true);
				if($('#leftPageWrap p').length > 0){
					if($('#leftPageWrap .s img').length == 0){
						if(navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
							$('#leftPageWrap .w:first').focus();
						}else
							$('#leftPageWrap .s:first').focus();
					}
					else{
						if(navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
							$('#rightPageWrap .w:first').focus();
						}else
							$('#rightPageWrap .s:first').focus();
						
					}
				}else{
					if(navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
						$('#leftPageWrap .w:first').focus();
					}else
						$('#leftPageWrap .s:first').focus();
				}
			}

			//Left to Right screen move time previous button display status
			if(eBookEnvironment.currLandScapePageNo + 1 >= eBookEnvironment.maxLandScapePageNo){
				$(".ebook_next_button").addClass("disabled");
				// CLAS-1090 start
				$(".ebook_next_button").attr("aria-disabled","true");
				// CLAS-1090 end
			}
			if(eBookEnvironment.currLandScapePageNo <= 1){
				$(".ebook_previous_button").addClass("disabled");
				// CLAS-1090 start
				$(".ebook_previous_button").attr("aria-disabled","true");
				// CLAS-1090 end
			}
		}

		$( "#slider-range-min" ).slider('value',eBookEnvironment.currLandScapePageNo);
		var tmp = (eBookEnvironment.currLandScapePageNo % 2 == 0? eBookEnvironment.currLandScapePageNo - 1 : eBookEnvironment.currLandScapePageNo);
		
		var tempVal;
		if (eBookEnvironment.currLandScapePageNo == -1){
			tempVal = "1-1";
		}
		else{
			tempVal = "" + tmp+ "-" + (tmp+1) + "";
		}
		$(".ui-slider-handle").html(tempVal);
    	$(".ui-slider-handle").attr({'aria-valuetext':"Page Number "+tempVal,"aria-valuenow":tempVal});
	});
	

	if (isFirstLoad) {
		onPageLoadComplete("Ebook");
		isFirstLoad = false;
	}


	//hideLoader();
	generateNotes();
	
	//ILIT-1247 : disable browser back button 
	disableBrowserBackButton();
	setTimeout(function(){ 
		$('#BackToLibrary').focus(); 
	}, 3000);
}

// CLAS-73
function updateDefaultHighlight(newHighlight) {
    let isWordHighlight = newHighlight.wordindex !== undefined;
    let updated = false;

    if (newHighlight.paragraphindex !== undefined) {
        // Iterate through the current highlights in defaultHighlight
        defaultHighlight.forEach(item => {
            if (isWordHighlight) {
                // Update if both paragraphindex and wordindex match for word-level highlights
                if (item.paragraphindex === newHighlight.paragraphindex && item.wordindex === newHighlight.wordindex) {
                    Object.assign(item, newHighlight);
                    updated = true;
                }
            } else {
                // If no wordindex, just compare paragraphindex for paragraph-level highlights
                if (item.paragraphindex === newHighlight.paragraphindex && item.wordindex === undefined) {
                    // Update all attributes for the paragraph-level highlight
                    Object.assign(item, newHighlight);
                    updated = true;
                }
            }
        });
        // If no existing entry was updated, push the new highlight
        if (!updated) {
            defaultHighlight.push(newHighlight);
        }
    }
    if (newHighlight.headingindex !== undefined) {
        // Iterate through the current highlights in defaultHighlight
        defaultHighlight.forEach(item => {
            if (isWordHighlight) {
                // Update if both paragraphindex and wordindex match for word-level highlights
                if (item.headingindex === newHighlight.headingindex && item.wordindex === newHighlight.wordindex) {
                    Object.assign(item, newHighlight);
                    updated = true;
                }
            } else {
                // If no wordindex, just compare paragraphindex for paragraph-level highlights
                if (item.headingindex === newHighlight.headingindex && item.wordindex === undefined) {
                    // Update all attributes for the paragraph-level highlight
                    Object.assign(item, newHighlight);
                    updated = true;
                }
            }
        });
        // If no existing entry was updated, push the new highlight
        if (!updated) {
            defaultHighlight.push(newHighlight);
        }
    }
}

function updateSentences(sentences, chaptorNo) {
	if(sentences != undefined)
		{
    var wordHighlightMap = new Map();
    var paragraphHighlightMap = new Map();
    var headingHighlightMap = new Map();
    var defaultHighlights = defaultHighlight;

    if (defaultHighlights != null) {
        defaultHighlights.forEach(item => {
            if (item.wordindex) {
                wordHighlightMap.set(item.paragraphindex + "-" + item.wordindex, { 
                    className: item.color, 
                    removeFlag: item.removeFlag,
					highlightId: item.HighlightId
                });
            } else {
                paragraphHighlightMap.set(item.paragraphindex, { 
                    className: item.color, 
                    removeFlag: item.removeFlag,
					highlightId: item.HighlightId
                });
            }
			if (item.headingindex) {
                wordHighlightMap.set(item.headingindex + "-" + item.wordindex, { 
                    className: item.color, 
                    removeFlag: item.removeFlag,
					highlightId: item.HighlightId
                });
			}
        });
    }

    $.each(sentences, function (key, sentence) {
        let sentenceId = sentence.id;
        let $sentenceHTML = $(sentence.sentence_text);
        var $sentenceWrapper = $sentenceHTML.find("z.s");

        // Add paragraphIndex and chapterNo attributes
        $sentenceHTML.filter("p").attr("paragraphIndex", sentenceId);
        $sentenceHTML.filter("p").attr("chaptorNo", chaptorNo);
        $sentenceHTML.filter("h1").attr("paragraphIndex", sentenceId);
        $sentenceHTML.filter("h1").attr("chaptorNo", chaptorNo);
        $sentenceHTML.filter("div").attr("paragraphIndex", sentenceId);
        $sentenceHTML.filter("div").attr("chaptorNo", chaptorNo);
		

        // Assign index to each <z class="w">
        $sentenceHTML.find("z.w").each(function (index) {
            var wordIndex = index + 1;
            $(this).attr("wordIndex", wordIndex);
            var highlightKey = sentenceId + "-" + wordIndex;

            if (wordHighlightMap.has(highlightKey)) {
                let highlightData = wordHighlightMap.get(highlightKey);

                if (highlightData.removeFlag) {
                    // Remove only the specific highlight class
					$(this).attr("class", "w");
					$(this).removeAttr("highlightId");
                } else {
					$(this).attr("class", highlightData.className);
					$(this).attr("highlightId", highlightData.highlightId);
                }
            }
            if (headingHighlightMap.has(highlightKey)) {
                let highlightData = headingHighlightMap.get(highlightKey);

                if (highlightData.removeFlag) {
					$(this).attr("class", "w");
					$(this).removeAttr("highlightId");
                } else {
					$(this).attr("class", highlightData.className);
					$(this).attr("highlightId", highlightData.highlightId);
                }
            }
        });

        // Apply or remove paragraph-level highlight
        if (paragraphHighlightMap.has(sentenceId.toString())) {
            let paragraphHighlightData = paragraphHighlightMap.get(sentenceId.toString());
            if (paragraphHighlightData.removeFlag) {
                $sentenceWrapper.attr("class","s");
                $sentenceWrapper.removeAttr("highlightId");
            } else {
                $sentenceWrapper.attr("class",paragraphHighlightData.className);
                $sentenceWrapper.attr("highlightId",paragraphHighlightData.highlightId);
            }
        }

        // Convert back to string and update the sentence_text
        sentence.sentence_text = $("<div>").append($sentenceHTML).html();
    });

    return sentences;
}
}
// CLAS-73 End


//SET ORIENTATION
function setOrientation(){

	var winWid = $(window).width(), winHgt = $(window).height();
	$('#viewArea').height(winHgt - 52 - 48 - 46);				//52-Header, 78-Footer, 46-Padding
	
	var pageWrapHeight = $('#viewArea').height() - (($('.ebook_container_block.left_ebook').width() * 0.02) + ($('.ebook_content_block_middle').width() * 0.02) + ($('#leftPageWrap').width() * 0.02) + 36);
	$('#leftPageWrap, #rightPageWrap, #rightPageWrapTOC').css('max-height',pageWrapHeight).css('height',pageWrapHeight - $('.audio_block').outerHeight()); // removing audio height for POC
	$('#rightPageWrapTOC').css('overflow','hidden');	
	$('#tocList, #notesList').css('max-height',$('#leftPageWrap').height() - 140).css('height',$('#leftPageWrap').height() - 140);					//TOC WRAPPER
	

	if (winWid > winHgt){
		eBookEnvironment.isCurrModePortrait = false;
		//displayPage(eBookEnvironment.currLandScapePageNo, false);
	} else {
		eBookEnvironment.isCurrModePortrait = true;
		//displayPage(eBookEnvironment.currPortraitPageNo, false);
	}
}

//CALCULATE PAGE POSITION ORDER FOR ALL CHAPTERS
function calculatePageOrder(){
	var tmpNo = 0;
	
	//GET DATA IN ORDERLIST ARRAY
	for (var a in content.Toc) { 
		book.orderList.splice(tmpNo,0,{
			"name" : a,
			"order" : parseInt(content.Toc[a].order),
			"title" : content.Toc[a].title,
			"visibility" : content.Toc[a].visibility,
			"sentences" : []
		});
	}

	//SET ORDER OF CHAPTER NUMBER BY SORTING
	sortResults('order', true, book.orderList,'INT');
}

//SET PAGE DETAILS
function setPageInfo(){
	var objSent, currHeight = 0, tmpObj;
	var screenH = window.screen.height, screenW = window.screen.width, diff = 0;
	
	OVERALL_PAGE_NO_TO_RENDER = 1;

	dimension.landscape.width = $('#leftPageWrap').width();
	dimension.landscape.height = $('#leftPageWrap').height();
	//LOGIC FOR PORTRAIT VIEW IS IN FILES ON ARISTOTLE
	
	if ($('#dummyText').length <= 0){
		
		$('body').append('<div id="dummyText" class="Book_Notes_content" style="max-height: none; height:auto !important; position:absolute;top:84px;left:136px;border:1px solid;"></div>');
	} 		
	else
		$('#dummyText').show();

	$('#leftPageWrap, #rightPageWrap').html('');

	//LANDSCAPE MODE
	//$('#dummyText').width(dimension.landscape.width).css('max-height',dimension.landscape.height).height(dimension.landscape.height);
	$('#dummyText').width(dimension.landscape.width);
	currHeight = dimension.landscape.height;

	//if ios, then call GetResourceInfo for correct rootfolderpath

    rootfolderpath = objEbookJsonData.rootFolderPath.split("/");
	if(navigator.userAgent.match(/iPhone|iPad|iPod/i) && rootfolderpath.length <= 1)
    {
        isCorrectRootfolderpath = false;
        GetResourceInfo();
    }
 
    eBookStylePath = bookid+"/media/"+content.Styles;
    if(eBookStylePath!=''){
		console.log('ebookStylePath: '+objEbookJsonData.rootFolderPath+ eBookStylePath);
	    if(!isCorrectRootfolderpath){
	    	var str = objResourceJsonData.jsPath.split("curriculum")[0];
			rootFolderPath_ios = str+"library/";
	    	$("<link/>", {rel: "stylesheet",type: "text/css",href: rootFolderPath_ios + eBookStylePath}).appendTo("head");
		}else{
			$("<link/>", {rel: "stylesheet",type: "text/css",href: objEbookJsonData.rootFolderPath + eBookStylePath}).appendTo("head");
		}
	}

	
	// CHAPTER STARTS
	for (var i=chapterStartIndex;i<book.orderList.length;i++) {
		book.orderList[i].sentences = [];
		
		// PAGES STARTS
		if (PageWiseLayout && content.Pages[book.orderList[i].name].Pages && book.orderList[i].name!='title' && book.orderList[i].name!='copy'  && book.orderList[i].name.indexOf('cover') == -1) {	
			var objPages = content.Pages[book.orderList[i].name].Pages || [];
			fPushPages(objPages, currHeight, i);			
		}
		else {
			 if (content.Pages[book.orderList[i].name].Pages) {
				objSent = content.Pages[book.orderList[i].name].Pages[0].sentences;					
				
			}else{
			// SENTENCES STARTS
				objSent = content.Pages[book.orderList[i].name].sentences;
			}
			for (var j=0;j<objSent.length;j++) {
			
				var iConsumedDummyTextHeight = 40; //$('#dummyText').height() + 40;			
				$('#dummyText').append((objSent[j].media_info != "" ? '<p>' : '') + objSent[j].sentence_text + (objSent[j].media_info != "" ? '</p>' : ''));
				
				//CHECK IF MEDIA FITS IN AVAILABLE AREA ELSE RESIZE
				if (objSent[j].media_info != "") {
					var objId = objSent[j].media_info.id;
					tmpObj = resizeImage(objSent[j].media_info.width, objSent[j].media_info.height, dimension.landscape.width, dimension.landscape.height - iConsumedDummyTextHeight)
					//$('#' + objId).parents("p:first").width(tmpObj.width).height(tmpObj.height).attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
					console.log(objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
					if(!isCorrectRootfolderpath)
					{   var str = objResourceJsonData.jsPath.split("curriculum")[0];
						rootFolderPath_ios = str+"library/";
						$('#' + objId).width(tmpObj.width).height(tmpObj.height).css('display','block').attr('src',rootFolderPath_ios + $('#' + objId).attr('src'));
						//$('#' + objId).css('display','block').attr('src',rootFolderPath_ios + $('#' + objId).attr('src'));
					}	
					else {
						$('#' + objId).width(tmpObj.width).height(tmpObj.height).css('display','block').attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
						//$('#' + objId).css('display','block').attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
					}

				}
				

			if (parseInt($("#dummyText")[0].scrollHeight) <= parseInt(currHeight)) {
					book.orderList[i].sentences.push({
						"sentenceNo" : j,
						"landScapePageNo" : OVERALL_PAGE_NO_TO_RENDER
					});
				} else {
					$('#dummyText').html(objSent[j].sentence_text);

					//CHECK IF MEDIA FITS IN AVAILABLE AREA ELSE RESIZE
					if (objSent[j].media_info != "") {
						var objId = objSent[j].media_info.id;
						tmpObj = resizeImage(objSent[j].media_info.width, objSent[j].media_info.height, dimension.landscape.width, dimension.landscape.height)
						//$('#' + objId).parents("p:first").width(tmpObj.width).height(tmpObj.height).attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
						//console.log(objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
						if(!isCorrectRootfolderpath) {
							$('#' + objId).width(tmpObj.width).height(tmpObj.height).css('display','block').attr('src',rootFolderPath_ios + $('#' + objId).attr('src'));
							//$('#' + objId).css('display','block').attr('src',rootFolderPath_ios + $('#' + objId).attr('src'));
						}
						else {
							//$('#' + objId).css('display','block').attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
							
							$('#' + objId).width(tmpObj.width).height(tmpObj.height).css('display','block').attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
						}
					}
					
					OVERALL_PAGE_NO_TO_RENDER++;
					book.orderList[i].sentences.push({
						"sentenceNo" : j,
						"landScapePageNo" : OVERALL_PAGE_NO_TO_RENDER
					});
				}
				
			}

			OVERALL_PAGE_NO_TO_RENDER++;
			$('#dummyText').html('');
			//console.log(book.orderList[i]);
		}
	}
	eBookEnvironment.maxLandScapePageNo = --OVERALL_PAGE_NO_TO_RENDER;	
	wordsPerPage = ((totalWordInBook==0 || eBookEnvironment.maxLandScapePageNo==0) ? 150 : Math.round(totalWordInBook/eBookEnvironment.maxLandScapePageNo));
	//console.log('wordsPerPage: '+wordsPerPage)
	$('#dummyText').html('').hide();
}

/* fPushPages() :  Push pages per chapter & sentences per page in an object for rendering
 *@Params : Pages object, screen height, i=current count in book.orderList, j=overall sentence count in book 
 */
function fPushPages (objPages, currHeight, i) {	
	var renderingNewDiv = 'Y', divStartedOnPage = 0, iLeftPageSpaceRemaining = 0,
		iMinPerSentenceHeight = 28, iFirstSentenceNoOnRightPage = null, iFirstSentenceNoInPage = null;
	
	OVERALL_SENTENCE_COUNT_ALL_CHAPTERS = OVERALL_SENTENCE_COUNT_ALL_CHAPTERS || 0; // overall sentence count in book
	
	
	// PAGES STARTS
	for (var p=0; p < objPages.length; p++) {		
		OVERALL_PAGE_NO_TO_RENDER = OVERALL_PAGE_NO_TO_RENDER % 2 > 0 ? OVERALL_PAGE_NO_TO_RENDER : OVERALL_PAGE_NO_TO_RENDER+1; // chapter shoud start on new screen
		iLeftPageSpaceRemaining = dimension.landscape.height; // full page space is available
		renderingNewDiv = 'Y';
		divStartedOnPage = OVERALL_PAGE_NO_TO_RENDER % 2 > 0 ? OVERALL_PAGE_NO_TO_RENDER : OVERALL_PAGE_NO_TO_RENDER+1;
		objSent = objPages[p].sentences;	
							
		for (s=0;s<objSent.length;s++) {			
			//console.log("sentence----"+OVERALL_SENTENCE_COUNT_ALL_CHAPTERS);
			var iConsumedDummyTextHeight = $('#dummyText').height() + 25;
			$('#dummyText').append((objSent[s].media_info != "" ? '<p>' : '') + objSent[s].sentence_text + (objSent[s].media_info != "" ? '</p>' : ''));

			//CHECK IF MEDIA FITS IN AVAILABLE AREA ELSE RESIZE
			if (objSent[s].media_info != "") {
				var objId = objSent[s].media_info.id;
				tmpObj = resizeImage(objSent[s].media_info.width, objSent[s].media_info.height, dimension.landscape.width, dimension.landscape.height - iConsumedDummyTextHeight)
				//$('#' + objId).parents("p:first").width(tmpObj.width).height(tmpObj.height).attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
				
				if(!isCorrectRootfolderpath)
				{   var str = objResourceJsonData.jsPath.split("curriculum")[0];
					rootFolderPath_ios = str+"library/";
					$('#' + objId).width(tmpObj.width).height(tmpObj.height).css('display','block').attr('src',rootFolderPath_ios + $('#' + objId).attr('src'));
					//$('#' + objId).css('display','block').attr('src',rootFolderPath_ios + $('#' + objId).attr('src'));
				}	
				else {
					$('#' + objId).width(tmpObj.width).height(tmpObj.height).css('display','block').attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
					//$('#' + objId).css('display','block').attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
				}

			}
			
			
				/*if this is right page && there is no more space remaining && there was some space in the left page THEN
				shift top (first) sentence of this page to left page. 
				*/
				if (
					OVERALL_PAGE_NO_TO_RENDER != divStartedOnPage && 
					(dimension.landscape.height - iConsumedDummyTextHeight) <= iMinPerSentenceHeight &&
					iLeftPageSpaceRemaining > iMinPerSentenceHeight
				) {					
					// alter the orderList object accordingly
					book.orderList[i].sentences = _.map(book.orderList[i].sentences, function(val, key) {
						if(val.sentenceNo == iFirstSentenceNoOnRightPage) {							
						  return {
								"sentenceNo" : iFirstSentenceNoOnRightPage,
								"sentenceNoInPage" : val.sentenceNoInPage,
								"landScapePageNo" : divStartedOnPage,
								"contentPageNo" : val.contentPageNo
							};							
						}
						else {
							return val
						}
					});
					//CHECK IF MEDIA FITS IN AVAILABLE AREA ELSE RESIZE
					if (objSent[iFirstSentenceNoInPage].media_info != "") {
						var objIdNew = objSent[iFirstSentenceNoInPage].media_info.id;
						var tmpObjNew = resizeImage(objSent[iFirstSentenceNoInPage].media_info.width, objSent[iFirstSentenceNoInPage].media_info.height, dimension.landscape.width, iLeftPageSpaceRemaining - 20)
						//$('#' + objIdNew).parents("p:first").width(tmpObjNew.width).height(tmpObjNew.height).attr('src',objEbookJsonData.rootFolderPath + $('#' + objIdNew).attr('src'));
						
						if(!isCorrectRootfolderpath)
						{   var str = objResourceJsonData.jsPath.split("curriculum")[0];
							rootFolderPath_ios = str+"library/";
							$('#' + objIdNew).width(tmpObjNew.width).height(tmpObjNew.height).css('display','block').attr('src',rootFolderPath_ios + $('#' + objIdNew).attr('src'));
							//$('#' + objIdNew).css('display','block').attr('src',rootFolderPath_ios + $('#' + objIdNew).attr('src'));
						}	
						else {							
							$('#' + objIdNew).width(tmpObjNew.width).height(tmpObjNew.height).css('display','block').attr('src',objEbookJsonData.rootFolderPath + $('#' + objIdNew).attr('src'));
							if (objId == "5_165_1") {
								console.log("new heigh----"+tmpObjNew.height);
							}
							//$('#' + objIdNew).css('display','block').attr('src',objEbookJsonData.rootFolderPath + $('#' + objIdNew).attr('src'));
						}
					}
					
				}

					
				/* if it is not (the last sentence of div & still in left page) // ensuring that right page not be blank AND
					if content fits in the page AND if image doesn't need to resize much OR if actual book content is not already in the right page 
					then CONTINUE IN SAME PAGE
				*/
				if (
					!(s > 0 && s == objSent.length -1 && OVERALL_PAGE_NO_TO_RENDER == divStartedOnPage) && 
					((
						parseInt($("#dummyText")[0].scrollHeight) <= parseInt(currHeight) && 
						(
							objSent[s].media_info == "" || 
							(objSent[s].media_info != "" && (dimension.landscape.height - iConsumedDummyTextHeight) > 0 && objSent[s].media_info.height/(dimension.landscape.height - iConsumedDummyTextHeight) < 5)
						)
					) ||  
					(
						renderingNewDiv == 'N' && OVERALL_PAGE_NO_TO_RENDER == divStartedOnPage + 1
					))					
				) {	
				
					book.orderList[i].sentences.push({
						"sentenceNo" : OVERALL_SENTENCE_COUNT_ALL_CHAPTERS,
						"sentenceNoInPage" : s,
						"landScapePageNo" : OVERALL_PAGE_NO_TO_RENDER,
						"contentPageNo" : p
					});					
				} else {
					/* if content of new div(page) starts OR (if image need to resize much && actual book content is not already in the right page 
						then CONTINUE IN NEW PAGE
					*/
					
					//track these data just when we are about to render the right page
					iLeftPageSpaceRemaining = (OVERALL_PAGE_NO_TO_RENDER == divStartedOnPage) ? (dimension.landscape.height - iConsumedDummyTextHeight) : iLeftPageSpaceRemaining;
					iFirstSentenceNoOnRightPage = (OVERALL_PAGE_NO_TO_RENDER == divStartedOnPage) ? OVERALL_SENTENCE_COUNT_ALL_CHAPTERS : iFirstSentenceNoOnRightPage; // overall sentence count. of the first sentence of the right page
					iFirstSentenceNoInPage = (OVERALL_PAGE_NO_TO_RENDER == divStartedOnPage) ? s : iFirstSentenceNoInPage; // sentence count as per the content of the first sentence of the right page
					
					$('#dummyText').html(objSent[s].sentence_text);

					//CHECK IF MEDIA FITS IN AVAILABLE AREA ELSE RESIZE
					if (objSent[s].media_info != "") {
						var objId = objSent[s].media_info.id;
						tmpObj = resizeImage(objSent[s].media_info.width, objSent[s].media_info.height, dimension.landscape.width, dimension.landscape.height)
						//$('#' + objId).parents("p:first").width(tmpObj.width).height(tmpObj.height).attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
						//console.log(objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
						if(!isCorrectRootfolderpath) {
							$('#' + objId).width(tmpObj.width).height(tmpObj.height).css('display','block').attr('src',rootFolderPath_ios + $('#' + objId).attr('src'));
							//$('#' + objId).css('display','block').attr('src',rootFolderPath_ios + $('#' + objId).attr('src'));
						}
						else {
							//$('#' + objId).css('display','block').attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
							
							$('#' + objId).width(tmpObj.width).height(tmpObj.height).css('display','block').attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
						}
					}
					
					// pushing content to right page
					OVERALL_PAGE_NO_TO_RENDER++;					
					
					book.orderList[i].sentences.push({
						"sentenceNo" : OVERALL_SENTENCE_COUNT_ALL_CHAPTERS,
						"sentenceNoInPage" : s,
						"landScapePageNo" : OVERALL_PAGE_NO_TO_RENDER,
						"contentPageNo" : p
					});
					renderingNewDiv = 'N';
				}
			
			
			OVERALL_SENTENCE_COUNT_ALL_CHAPTERS++; // overall sentence count in book
		}
		OVERALL_PAGE_NO_TO_RENDER++;		
		$('#dummyText').html('');
		//console.log(book.orderList[i]);
	}
	eBookEnvironment.maxLandScapePageNo = OVERALL_PAGE_NO_TO_RENDER - 1;	
	
}


//GENERATE TOC
function generateTOC(){
	var tmpStr = '';
	
	if (wordCountTimeOut != -1) clearTimeout(wordCountTimeOut);	
	
	$('#imgNotes').hide();

	if (content.Pages['cover'] != undefined )
	{
		if(!PageWiseLayout){
			if( content.Pages['cover'].sentences.length == 1){
				objSent = content.Pages['cover'].sentences[0];
				$('#leftPageWrap').html('<div style="text-align:center">' + objSent.sentence_text + '</div>');
				var objId = objSent.media_info.id;
				tmpObj = resizeImage(objSent.media_info.width, objSent.media_info.height, dimension.landscape.width, dimension.landscape.height)
				console.log(objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
				if(!isCorrectRootfolderpath)
					$('#' + objId).width(tmpObj.width).height(tmpObj.height).css('display','block').attr('src',rootFolderPath_ios + $('#' + objId).attr('src'));
				else
					$('#' + objId).width(tmpObj.width).height(tmpObj.height).attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
			}
			else{
				for(var i=0; i<content.Pages['cover'].sentences.length ;i++){
					objSent = content.Pages['cover'].sentences[i];
					$('#leftPageWrap').html('<div style="text-align:center">' + objSent.sentence_text + '</div>');
					var objId = objSent.media_info.id;
					tmpObj = resizeImage(objSent.media_info.width, objSent.media_info.height, dimension.landscape.width, dimension.landscape.height)
					console.log(objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
					if(!isCorrectRootfolderpath)
						$('#' + objId).width(tmpObj.width).height(tmpObj.height).css('display','block').attr('src',rootFolderPath_ios + $('#' + objId).attr('src'));
					else
						$('#' + objId).width(tmpObj.width).height(tmpObj.height).attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
				}
			}
		}else{
			if( content.Pages['cover'].Pages[0].sentences.length == 1){
				objSent = content.Pages['cover'].Pages[0].sentences[0];
				$('#leftPageWrap').html('<div style="text-align:center">' + objSent.sentence_text + '</div>');
				var objId = objSent.media_info.id;
				tmpObj = resizeImage(objSent.media_info.width, objSent.media_info.height, dimension.landscape.width, dimension.landscape.height)
				console.log(objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
				if(!isCorrectRootfolderpath)
					$('#' + objId).width(tmpObj.width).height(tmpObj.height).css('display','block').attr('src',rootFolderPath_ios + $('#' + objId).attr('src'));
				else
					$('#' + objId).width(tmpObj.width).height(tmpObj.height).attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
			}
			else{
				for(var i=0; i<content.Pages['cover'].Pages[0].sentences.length ;i++){
					objSent = content.Pages['cover'].Pages[0].sentences[i];
					$('#leftPageWrap').html('<div style="text-align:center">' + objSent.sentence_text + '</div>');
					var objId = objSent.media_info.id;
					tmpObj = resizeImage(objSent.media_info.width, objSent.media_info.height, dimension.landscape.width, dimension.landscape.height)
					console.log(objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
					if(!isCorrectRootfolderpath)
						$('#' + objId).width(tmpObj.width).height(tmpObj.height).css('display','block').attr('src',rootFolderPath_ios + $('#' + objId).attr('src'));
					else
						$('#' + objId).width(tmpObj.width).height(tmpObj.height).attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
				}
			}

		}
	}
	else
		$('#leftPageWrap').html("");
	
	if (content.Pages['cover1'] != undefined || content.Pages['cover2'] != undefined)
	{
			var objCover = content.Pages['cover1'] || content.Pages['cover2'];
			if(!PageWiseLayout)
				objSent = objCover.sentences[0];
			else
				objSent = objCover.Pages[0].sentences[0];

			$('#leftPageWrap').html('<div style="text-align:center">' + objSent.sentence_text + '</div>');
			var objId = objSent.media_info.id;
			tmpObj = resizeImage(objSent.media_info.width, objSent.media_info.height, dimension.landscape.width, dimension.landscape.height)
			console.log(objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
			if(!isCorrectRootfolderpath)
				$('#' + objId).width(tmpObj.width).height(tmpObj.height).css('display','block').attr('src',rootFolderPath_ios + $('#' + objId).attr('src'));
			else
				$('#' + objId).width(tmpObj.width).height(tmpObj.height).attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
	
	}
	else
		$('#leftPageWrap').html("");
		
	$('#textToHelpMenu, #rwPictureDictionary, #rwDict, #rwTrans').hide();

	if ($('#rightPageWrapTOC').html() == "")
	{
		tmpStr = '<div class="ebook_text_content"> <div class="center"> <div class="notetab"> <button  aria-label="Table of Content" tabindex="0" role="button" aria-pressed ="true" class="left button8 active" id="btnTOCList"  >Table of Contents</button><button class="left button8" id="btnNotesList"  tabindex="0"  aria-pressed="false"  role="button" aria-label="Book Notes" >Book Notes</button> </div> </div> <div class="notes_content_bl" id="notesListWrapper" style="display:none;"> <h3  class="notes_heading">Book Notes</h3> <div class="Book_Notes_content" id="notesList" style="overflow:auto;"> <div class="Book_Notes_rule_bg Book_Notes_toc"> <div class="toc_name_row"> <ol class="ebook_list" id="notesOrderedList"><li style="list-style:none;">Loading...</li></ol> </div> <div class="clear"></div> </div> <div class="clear"></div> </div> <div class="clear"></div> </div> <div class="notes_content_bl" id="tocListWrapper"> <h3 class="notes_heading"> Table of Contents </h3> <div class="Book_Notes_content" id="tocList" style="overflow:auto;"> <div class="Book_Notes_rule_bg Book_Notes_toc"> <div class="toc_name_row"> <ol class="ebook_list" id="tocOrderedList"></ol> </div> <div class="clear"></div> </div> <div class="clear"></div> </div> <div class="clear"></div> </div> <div class="clear"></div> </div> <div class="clear"></div>';
		$('#rightPageWrapTOC').html(tmpStr);
	

		$('.notetab button').off('click').on('click',function(){
			if ($(this).hasClass('active')) return;
			
			$('.notetab button').removeClass('active');
			$(this).addClass('active');
			if ($(this).attr('id') == 'btnTOCList'){
				$('#notesListWrapper').hide();
				$('#tocListWrapper').show();
				$('#tocList').getNiceScroll().show();
				$('#tocList').getNiceScroll().resize();
				$(this).attr({"aria-pressed":"true"});
				$("#btnNotesList").attr({"aria-pressed":"false"});
			} else if ($(this).attr('id') == 'btnNotesList'){
				$(window).trigger('resize');
				$('#notesListWrapper').show();
				$('#tocListWrapper').hide();
				$('#notesList').getNiceScroll().show();
				$('#notesList').getNiceScroll().resize();
				$(this).attr({"aria-pressed":"true"});
				$("#btnTOCList").attr({"aria-pressed":"false"});
			}
			if(navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
				var _selectedButtonInfo = $(this).text()+' pressed';
				readThis(_selectedButtonInfo);
			}
			refreshScroll();
		});

		$('#tocList').niceScroll(objScroll);
		$('#btnNotesList').trigger('click');
		$('#notesList').niceScroll(objScroll);
		$('#btnTOCList').trigger('click');

		var setScroll = function(i) {
			if($(i).length>0)
			$(i).niceScroll().updateScrollBar();
		} 

		$('#notesList').getNiceScroll().remove();
		setScroll('#notesList');
	}
		
	$('#rightPageWrapTOC').show();
	$('#rightPageWrap').hide();

	setOrientation();

	tmpStr = '';
	for (var i=chapterStartIndex;i<book.orderList.length;i++) {
		if (book.orderList[i].visibility == 1)
			tmpStr += '<li class="chapterWrap" pgNo="' + book.orderList[i].sentences[0][(eBookEnvironment.isCurrModePortrait ? "portraitPageNo" : "landScapePageNo")] + '"><a href="javascript:void(0);">' + book.orderList[i].title + '</a></li>'
	}
	$('#tocOrderedList').html(tmpStr);
	
	$('.chapterWrap').on('click touchend',function(){
		if (tmpScroll) return;
		eBookEnvironment.currLandScapePageNo = parseInt($(this).attr('pgNo'));
		//enable prev button
		if(eBookEnvironment.currLandScapePageNo > 2){
		
			if($(".ebook_previous_button").hasClass("disabled")){
				$(".ebook_previous_button").removeClass("disabled");
				// CLAS-1090 start
				$(".ebook_previous_button").removeAttr("aria-disabled");
				// CLAS-1090 end
			}
		}

		//enable next button
		if(eBookEnvironment.currLandScapePageNo >= eBookEnvironment.maxLandScapePageNo){
			if($(".ebook_next_button").hasClass("disabled")){
				$(".ebook_next_button").removeClass("disabled");
				// CLAS-1090 start
				$(".ebook_next_button").removeAttr("aria-disabled");
				// CLAS-1090 end
			}
		}

		if (eBookEnvironment.currLandScapePageNo % 2 == 0) eBookEnvironment.currLandScapePageNo--;
		displayPage(eBookEnvironment.currLandScapePageNo, true);
		$( "#slider-range-min" ).slider('value',eBookEnvironment.currLandScapePageNo);
		var tmp = (eBookEnvironment.currLandScapePageNo % 2 == 0? eBookEnvironment.currLandScapePageNo - 1 : eBookEnvironment.currLandScapePageNo);
		var tempVal = "" + tmp+ "-" + (tmp+1) + "";
		$(".ui-slider-handle").html(tempVal);
		$(".ui-slider-handle").attr({'aria-valuetext':"Page Number "+tempVal,"aria-valuenow":tempVal});
		$('#btnTOC').focus();
	});

	/*$('.chapterWrap').on('touchend',function(){
		$('.chapterWrap').trigger('click');
	});*/

	$('.chapterWrap').off('keydown').on('keydown',function(e){
		triggerClickOnThisElemApp(e,this)
	})

	setOrientation();
	$('#tocList').on('touchstart',function(){
		tmpTouchStarted = true;
	});
	$('#tocList').on('touchend',function(){
		tmpTouchStarted = false;
	});
	$('#tocList').on('scroll',function(event){
		event.preventDefault();
		event.stopPropagation();
		tmpScroll = true;
		setTimeout(function a(){
			if (tmpTouchStarted)
			{
				setTimeout(a,500);
				return;
			}
			tmpScroll=false;
		},500);
	});
		
	isShowingTOC = true;
	generateNotes();

	$('#tocList').getNiceScroll().show();
	$('#tocList').getNiceScroll().resize();
	eBookEnvironment.currLandScapePageNo = -1;
	setTimeout(function(){
		$(window).trigger('resize');
	},0);
	//$('.ebook_container_block').hammer({ drag_lock_to_axis: true }).off("dragend")
	$('#BackToLibrary').focus();

	$('#btnTOC').prop('disabled',true);
	$('#btnTOC').css({'cursor':'default','opacity':'0.5'});

}

//GENERATE NOTES
function generateNotes(){
 	hideLoader();
	GetNotelist('journal',bookid);
}

function getNoteListDraw(){
	var tmpStr = '';
	for (var i=0, obj;i<objNoteBookData.Content.Data.length;i++) {
		obj = JSON.parse(objNoteBookData.Content.Data[i].RefOtherData);
		//tmpStr += '<li chapNo="' + obj.chapNo + '" sentNo="' + obj.sentNo + '"><div class="notesLeftText">' + (i+1) + '.&nbsp;' + decodeURIComponent(objNoteBookData.Content[i].NoteText.replace(/<br>/gi, " ")) + '</div></li.
		if(objNoteBookData.Content.Data[i].ShortNoteText == null)
			objNoteBookData.Content.Data[i].ShortNoteText= '';
		tmpStr += '<li chapNo="' + obj.chapNo + '" sentNo="' + obj.sentNo + '"><div role="link" tabindex="0" class="notesLeftText">' + (i+1) + '.&nbsp;' + (decodeURIComponent(objNoteBookData.Content.Data[i].ShortNoteText)).replace(/<br>/gi, " ") + '</div></li>';
		
		book.orderList[obj.chapNo].sentences[obj.sentNo].hasBookNote = true;
		if (book.orderList[obj.chapNo].sentences[obj.sentNo].NoteID == undefined)
		{
			book.orderList[obj.chapNo].sentences[obj.sentNo].NoteID = [];
		}
		if (jQuery.inArray( objNoteBookData.Content.Data[i].NoteID , book.orderList[obj.chapNo].sentences[obj.sentNo].NoteID) == -1){
			book.orderList[obj.chapNo].sentences[obj.sentNo].NoteID.push(objNoteBookData.Content.Data[i].NoteID);
		}		
		if (((book.orderList[obj.chapNo].sentences[obj.sentNo].landScapePageNo == eBookEnvironment.currLandScapePageNo) || (book.orderList[obj.chapNo].sentences[obj.sentNo].landScapePageNo == eBookEnvironment.currLandScapePageNo + 1)) && !isShowingTOC)
			$('#imgNotes').show();
		
		
	}
	//tmpStr = '<li>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard</li> <li>dummy text ever since the 1500s, when an unknown printer took a galley of type</li> <li>and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</li>';
	$('#notesOrderedList').html(tmpStr);

	$('#notesOrderedList li').off('keydown').on('keydown',function(e){
		triggerClickOnThisElemApp(e,this);
	});
	$('#notesOrderedList li').off('click').on('click',function(){
		eBookEnvironment.currLandScapePageNo = book.orderList[$(this).attr('chapNo')].sentences[$(this).attr('sentNo')].landScapePageNo;
		eBookEnvironment.currLandScapePageNo = eBookEnvironment.currLandScapePageNo;
		displayPage(eBookEnvironment.currLandScapePageNo, true);
		$('#imgNotes').focus();
		$( "#slider-range-min" ).slider('value',eBookEnvironment.currLandScapePageNo);
		var tmp = eBookEnvironment.currLandScapePageNo;
		var tempVal = "" + tmp+ "-" + (tmp+1) + "";
		
		$(".ui-slider-handle").html(tempVal);
		$(".ui-slider-handle").attr({'aria-valuetext':"Page Number "+tempVal,"aria-valuenow":tempVal});
	});
}


//Display Content in Two Page format
function displayPage(pageNo, bIsTrue){
	
	$(".ebook_content_block").css({'overflow-y':'hidden'}); //allow vertical scroll on page
	//$(".ebook_content_block").css({'overflow-y':'auto'}); //allow vertical scroll on page
	$(".ebook_container_block").css({'width':'50%','float':'left'}); //expand the page container from 50% to 100%
	//$(".ebook_content_block_middle").css({'background':'url(media/midlle_bg_ebook.png) repeat-y 50% top'}); //remove the middle book page divider
	$(".ebook_content_block_middle").css({'background':'none'}); //remove the middle book page divider
	$(".ebook_container_block right_ebook").show();
	if(PageWiseLayout){
		$('#btnFontResize').prop('disabled',true);
		$('#btnFontResize').css('opacity','0.5');
	}else{
		$('#btnFontResize').prop('disabled',false);
		$('#btnFontResize').css('opacity','1');
	}
	$('#btnLanguage').prop('disabled',false);
	$('#btnLanguage').removeClass('disabledBtn');
	
	/*
		VALUE FOR UPDATECOUNTERPAGENO
		TRUE	-	SHOULD UPDATE PAGE NUMBER FOR COUNTER PAGE VIEW TYPE I.E. CURRENT PORTRAIT VIEW NUMBER FOR LANDSCAPE VIEW AND VICE VERSA
		FALSE	-	SHOULD NOT UPDATE PAGE NUMBER FOR COUNTER PAGE VIEW TYPE I.E. CURRENT PORTRAIT VIEW NUMBER FOR LANDSCAPE VIEW AND VICE VERSA
	*/
	var pageDrawn = 0, objCurrentSentence = {}, iConsumedPageHeight = 0, iElemHeight = 0;

	if (pageNo == -1)
	{
		generateTOC();
		return;
	}

	$('#leftPageWrap,#rightPageWrap').html('').show();
	$('#rightPageWrapTOC').hide();
	$('#textToHelpMenu, #rwPictureDictionary, #rwDict, #rwTrans').hide();
	$('#imgNotes').hide();
	try{$rw_stopSpeech()} catch (e){}
	
	if (wordCountTimeOut != -1) clearTimeout(wordCountTimeOut);	
	
	for (var i=chapterStartIndex;i<book.orderList.length;i++) {
		for (var j=0;j<book.orderList[i].sentences.length;j++) {
			if(book.orderList[i].sentences[j].landScapePageNo == eBookEnvironment.currLandScapePageNo) {
				// consumed height in left page
				iElemHeight = 0;
				$($('#leftPageWrap').children()).each(function(){
					iElemHeight += $(this).height();
				});
				iConsumedPageHeight = iElemHeight + 25;
				
				// if direct sentences found in case of virtual
				if (content.Pages[book.orderList[i].name].sentences || book.orderList[i].name=='copy' || book.orderList[i].name == 'title' || book.orderList[i].name.indexOf('cover') != -1) {
					if(content.Pages[book.orderList[i].name].Pages &&  (book.orderList[i].name=='copy' || book.orderList[i].name == 'title'  || book.orderList[i].name.indexOf('cover') != -1)){
						$('#leftPageWrap').append(content.Pages[book.orderList[i].name].Pages[0].sentences[j].sentence_text);
					}else
						$('#leftPageWrap').append(content.Pages[book.orderList[i].name].sentences[j].sentence_text);
				}
				else if (content.Pages[book.orderList[i].name].Pages &&  book.orderList[i].name!='copy' && book.orderList[i].name != 'title' && book.orderList[i].name.indexOf('cover') == -1) {
					// if direct pages found in case of physical
					var oSentenceDetail = book.orderList[i].sentences[j];
					
					$('#leftPageWrap').append(content.Pages[book.orderList[i].name].Pages[oSentenceDetail.contentPageNo].sentences[oSentenceDetail.sentenceNoInPage].sentence_text);
				}
				eBookEnvironment.currPortraitPageNo = book.orderList[i].sentences[j].portraitPageNo;
				pageDrawn = 1;
				$('#leftPageWrap').removeClass('t3 t2 t1 t0');
				FitTextInPage($('#leftPageWrap'));
				$('#leftPageWrap h1').attr('tabindex',"0");
				//$('#leftPageWrap p').attr('tabindex',"0");
				if(!$('#leftPageWrap .s').parents('p').hasClass('fig') && !$('#leftPageWrap .s').parents('p').hasClass('cover') && $('#leftPageWrap .s img').length == 0){
					$('#leftPageWrap .s').attr('tabindex',"0");
					$('#leftPageWrap .s span, #leftPageWrap .s b,#leftPageWrap .s em,#leftPageWrap .s strong, #leftPageWrap .s br').attr('tabindex',"-1");

					}	
				// CLAS-1079 start accessibility issue
                // $('#leftPageWrap .w').attr('tabindex',"-1");
                $('#leftPageWrap .s br').attr('aria-hidden', 'true');
                $('#leftPageWrap .w').each(function () {
                    var text = $(this).text().trim().replace(/\u00a0/g, ''); // Remove   and trim spaces
                    if (text === '') {
                      $(this).attr('tabindex', '-1').attr('aria-hidden', 'true'); // Hide empty or space-only .w
                    }else {
					  $(this).attr('tabindex', '-1').removeAttr('aria-hidden'); // Keep visible to screen reader
					}
					// CLAS-1086 start accessibility issue
					if (text.indexOf('___') !== -1) {
						$(this).attr('tabindex', '-1').attr('aria-hidden', 'true'); // Hide empty or space-only .w
					} 
					// CLAS-1086 end accessibility issue
					// CLAS-1087 start accessibility issue
					$(".title .s .w").removeAttr('tabindex');
					$(".author .s .w").removeAttr('tabindex');
					// CLAS-1087 end accessibility issue 
                  });
                // CLAS-1079 end accessibility issue
			//	console.log($('#leftPageWrap').html())
				//CHECK IF PAGE HAS NOTES THEN SHOW NOTESICON
				if (book.orderList[i].sentences[j].hasBookNote)
					$('#imgNotes').show();
				
				
			}
			if(book.orderList[i].sentences[j].landScapePageNo == eBookEnvironment.currLandScapePageNo + 1) {
				// consumed height in right page
				iElemHeight = 0;
				$($('#rightPageWrap').children()).each(function(){
					iElemHeight += $(this).height();
				});
				iConsumedPageHeight = iElemHeight + 25;
				
				// if direct sentences found in case of virtual
				if (content.Pages[book.orderList[i].name].sentences || book.orderList[i].name=='copy' || book.orderList[i].name == 'title' || book.orderList[i].name.indexOf('cover') != -1) {
					if(content.Pages[book.orderList[i].name].Pages &&  (book.orderList[i].name=='copy' || book.orderList[i].name == 'title'  || book.orderList[i].name.indexOf('cover') != -1)){
						$('#rightPageWrap').append(content.Pages[book.orderList[i].name].Pages[0].sentences[j].sentence_text);
					}
					else
						$('#rightPageWrap').append(content.Pages[book.orderList[i].name].sentences[j].sentence_text);
				}
				else if (content.Pages[book.orderList[i].name].Pages && book.orderList[i].name!='copy' && book.orderList[i].name!= 'title' && book.orderList[i].name.indexOf('cover') == -1) {
					// if direct pages found in case of physical
					var oSentenceDetail = book.orderList[i].sentences[j];
					$('#rightPageWrap').append(content.Pages[book.orderList[i].name].Pages[oSentenceDetail.contentPageNo].sentences[oSentenceDetail.sentenceNoInPage].sentence_text);
				}
				
				pageDrawn = 2;
				$('#rightPageWrap').removeClass('t3 t2 t1 t0');
				FitTextInPage($('#rightPageWrap'));
				$('#rightPageWrap h1').attr('tabindex',"0");
				//$('#rightPageWrap p').attr('tabindex',"0");
				if(!$('#rightPageWrap .s').parents('p').hasClass('fig') && !$('#rightPageWrap .s').parents('p').hasClass('cover') && $('#rightPageWrap .s img').length == 0){
					$('#rightPageWrap .s').attr('tabindex',"0");
					$('#rightPageWrap .s span, #rightPageWrap .s b,#rightPageWrap .s em, #rightPageWrap .s strong, #rightPageWrap .s br').attr('tabindex',"-1");
					// CLAS-1078/1081 start accessibility issue 
					$('#rightPageWrap .s br').attr('aria-hidden',"true");
					// CLAS-1078/1081 end accessibility issue 
					}	
					// CLAS-1079 start accessibility issue 
					// $('#rightPageWrap .w').attr('tabindex',"-1");
					$('#rightPageWrap .w').each(function () {
						var text = $(this).text().trim().replace(/\u00a0/g, ''); // Remove   and trim spaces
                    if (text === '') {
						$(this).attr('tabindex', '-1').attr('aria-hidden', 'true'); // Hide empty or space-only .w
                    }else {
						$(this).attr('tabindex', '-1').removeAttr('aria-hidden'); // Keep visible to screen reader
                    }
					// CLAS-1086 start accessibility issue
					if (text.indexOf('___') !== -1) {
						$(this).attr('tabindex', '-1').attr('aria-hidden', 'true'); // Hide empty or space-only .w
					}
					// CLAS-1086 end accessibility issue
					// CLAS-1087 start accessibility issue
					$(".title .s .w").removeAttr('tabindex');
					$(".author .s .w").removeAttr('tabindex');
					// CLAS-1087 end accessibility issue
				});
				// CLAS-1079 end accessibility issue 
				//CHECK IF PAGE HAS NOTES THEN SHOW NOTESICON
				if (book.orderList[i].sentences[j].hasBookNote)
					$('#imgNotes').show();					
				
			}
			
			//CHECK IF MEDIA FITS IN AVAILABLE AREA ELSE RESIZE
			if((book.orderList[i].sentences[j].landScapePageNo == eBookEnvironment.currLandScapePageNo) || (book.orderList[i].sentences[j].landScapePageNo == eBookEnvironment.currLandScapePageNo + 1)) {
				// if direct sentences found in case of virtual
				if (content.Pages[book.orderList[i].name].sentences || book.orderList[i].name=='copy' || book.orderList[i].name == 'title' || book.orderList[i].name.indexOf('cover') != -1) {
					if(content.Pages[book.orderList[i].name].Pages && (book.orderList[i].name=='copy' || book.orderList[i].name == 'title'  || book.orderList[i].name.indexOf('cover') != -1)){
						objSent = content.Pages[book.orderList[i].name].Pages[0].sentences;
						objCurrentSentence = objSent[j];
					}
					else{
						objSent = content.Pages[book.orderList[i].name].sentences;
						objCurrentSentence = objSent[j];
					}
				}
				else if (content.Pages[book.orderList[i].name].Pages && book.orderList[i].name!='copy' && book.orderList[i].name!= 'title' && book.orderList[i].name.indexOf('cover') == -1) {
					// if direct pages found in case of physical
					var oSentenceDetail = book.orderList[i].sentences[j];
					
					objSent = content.Pages[book.orderList[i].name].Pages[oSentenceDetail.contentPageNo].sentences;						
					objCurrentSentence = objSent[oSentenceDetail.sentenceNoInPage];
					
				}
				
				if (objCurrentSentence.media_info != "") {
					var objId = objCurrentSentence.media_info.id;
					
					tmpObj = resizeImage(objCurrentSentence.media_info.width, objCurrentSentence.media_info.height, dimension.landscape.width, dimension.landscape.height - iConsumedPageHeight);
					//console.log(rootFolderPath_ios + $('#' + objId).attr('src'));
					
					if(!isCorrectRootfolderpath) {
						$('#' + objId).width(tmpObj.width).height(tmpObj.height).css('display','block').attr('src',rootFolderPath_ios + $('#' + objId).attr('src'));
						//$('#' + objId).css('display','block').attr('src',rootFolderPath_ios + $('#' + objId).attr('src'));
					}
					else {
						$('#' + objId).width(tmpObj.width).height(tmpObj.height).attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
						//$('#' + objId).attr('src',objEbookJsonData.rootFolderPath + $('#' + objId).attr('src'));
					}
				}
			}			
			
		}
		if (pageDrawn == 2) i = book.orderList.length;
	}
	//$('#divPageNo').html(eBookEnvironment.currLandScapePageNo + ' / ' + eBookEnvironment.maxLandScapePageNo);

	isShowingTOC = false;
	$('#btnTOC').prop('disabled',false);
	$('#btnTOC').css({'cursor':'pointer','opacity':'1'});
	refreshScroll();

	//if (productCode.match(/^ilit20/)) {
		/* 10 seconds time limit added */

		if(!bookReadEnd){
			wordCountTimeOut = setTimeout(function(){
				totalWordsRead += wordsPerPage * 2;
				weekWiseWordCount += wordsPerPage * 2;	
				
				if (totalWordsRead >= (dBookCompletePercent/100) * totalWordInBook) {
					totalWordsRead = totalWordInBook;
					//weekWiseWordCount = totalWordInBook;
					bookReadEnd = true;
					if(JSON.stringify(WordCountObj) != '{}'){
					/** subtract the previous weekwisewordcount from the totalwordinbook and save it **/
						var prevWeekWordCount = 0;
						bookType = (bookid == objEbookJsonData.currentRataBookId ? 'RATA' : 'Time To Read' );
						var currentBookType = (bookType == 'Time To Read' ? 'TTR' : 'RATA' );
						var currentUnit = (objEbookJsonData.currentUnit == '' ? 1 : objEbookJsonData.currentUnit );
						var currentWeek = currentWeek ? currentWeek : (objEbookJsonData.currentWeek == '' ? 1 : objEbookJsonData.currentWeek );
						var regex = new RegExp(currentUnit+'.'+currentWeek+'.'+currentBookType);
						$.each(WordCountObj, function (k, val) {
							if(!k.match(regex))	{				
								if (typeof val == "string" && val.match(/\d*\|\d*/)) {
									prevWeekWordCount += parseInt(val.split("|")[0]);  // calculate previous weeks word count
								}
							}
						});
					
						weekWiseWordCount = totalWordInBook - prevWeekWordCount; // subtract previous ones from totalwordinbook (as weekwisewordcount > totalWordInBook)
					}else
						weekWiseWordCount = totalWordInBook;
				}
				wordCountTimeOut = -1;
			},wordCountTime4ilit20 * 1000);
		}
	//}
	/* else {
		wordCountTimeOut = setTimeout(function(){
			totalWordsRead += wordsPerPage * 2;
			weekWiseWordCount += wordsPerPage * 2;			
			
			if (totalWordsRead >= (dBookCompletePercent/100) * totalWordInBook) {
				totalWordsRead = totalWordInBook;
				weekWiseWordCount = totalWordInBook;
				bookReadEnd = true;
			}
			wordCountTimeOut = -1;
		},wordCountTime * 1000);
	}
 */
	// CLAS-1080 start accessibility issue
	$('#rightPageWrap h1.author').each(function () {
		const $h1 = $(this);
		const $p = $('<p class="author"></p>').html($h1.html());
		$h1.replaceWith($p);
		$.each(this.attributes, function () {
        if (this.name !== 'class') { // class already added
            $p.attr(this.name, this.value);
        }
    });
	});
	// CLAS-1080 end accessibility issue
	timeSpentPerPage = Date.now();	
	
	//Disable default behaviour of anchor tag in sentences
	if($('#leftPageWrap .s a, #rightPageWrap .s a').length > 0){
		$('#leftPageWrap .s a, #rightPageWrap .s a').addClass('anchorDisable').bind("click", function(e){ e.preventDefault(); });
		// CLAS-1064 start 
		$('#leftPageWrap .s:has(a[href="http://www.pearsonlearning.com"]), #rightPageWrap .s:has(a[href="http://www.pearsonlearning.com"])').css('display','none');
		// CLAS-1064 end
		$('#leftPageWrap .s a, #rightPageWrap .s a').attr('tabindex','-1');
	}
		hideLoader();

	if(eBookStylePath!=''){
		$('.t2 .Book_Notes_content p').css('margin-bottom','0px');
		$('.t2 .Book_Notes_content p,.t2 z p').css({'font-size':'inherit'}); /*,'line-height':'28px'*/
	}
	
}



//FUNCTION TO RESET THE FONT SIZE OF THE PAGE TEXT TO FIT WITHIN THE CONTAINER
function FitTextInPage(pgObj){
	var maxHeight = pgObj.css('max-height').split("p")[0];
	var currentHeight = pgObj.contents().height();
	if(currentHeight > maxHeight){
		if($('body').hasClass('t3')){
			pgObj.addClass('t2');
			if(pgObj.contents().height() > maxHeight){
				pgObj.removeClass('t2').addClass('t1');
				if(pgObj.contents().height() > maxHeight)
					pgObj.removeClass('t1').addClass('t0');	
			}
		}	
		else if($('body').hasClass('t2')){
			pgObj.addClass('t1');
			if(pgObj.contents().height() > maxHeight){
				pgObj.removeClass('t1').addClass('t0');
			}
		}
		else
			pgObj.addClass('t0');
	}
	else
		pgObj.removeClass('t3 t2 t1 t0');
	
}

//FUNCTION TO RESIZE IMAGE TO FIT WITHIN THE CONTAINER
function resizeImage(imgW, imgH, contW, contH){
	var state = 0;				// 1 - IMAGE WIDTH IS GREATER THEN CONTAINER WIDTH, 2 - IMAGE HEIGHT IS GREATER THEN CONTAINER HEIGHT, 3 - IMAGE WIDTH AND HEIGHT ARE GREATER THEN CONTAINER WIDTH AND HEIGHT
	var calW = imgW, calH = imgH;

	if (imgW > contW)
		state = 1;
	if (imgH > contH)
		state = 2;
	if (imgW > contW && imgH > contH)
		state = 3;

	switch (state)
	{
		case 1:
			calW = contW;
			calH = imgH * contW / imgW;
			break;
		case 2:
			calH = contH;
			calW = imgW * contH / imgH;
			break;
		case 3:
			calH = contH;
			calW = imgW * contH / imgH;
			break;
	}
	return {"width":calW,"height":calH};
	//return {"width":imgW,"height":imgH};
}

//FUNCTION TO LOAD CSS
function loadCSS( path, fn, scope ) {
   $('body').attr('class',path);
   if(eBookStylePath!=''){
		$('.t2 .Book_Notes_content p').css('margin-bottom','0px');
		$('.t2 .Book_Notes_content p,.t2 z p').css({'font-size':'inherit'}); // ,'line-height':'28px'
	}
   fn.call(window);
}

//AFTER CSS IS LOADED
function afterCSSLoad(){
	hideLoader();

	$('#backBtn,#nextBtn').hide();
	
	$(".ebook_content_block").css({'overflow-y':'hidden'}); 
	//$(".ebook_content_block").css({'overflow-y':'auto'}); //allow vertical scroll on page
	$(".ebook_container_block").css({'width':'50%','float':'left'}); 
	//$(".ebook_content_block_middle").css('background','url(media/midlle_bg_ebook.png) repeat-y 50% top');
	$(".ebook_content_block_middle").css({'background':'none'}); //remove the middle book page divider		
	$(".ebook_container_block right_ebook").show();
	$('.pages_slider_conts').css('width','100%');
	if(PageWiseLayout){
		$('#btnFontResize').prop('disabled',true);
		$('#btnFontResize').css('opacity','0.5');
	}else{
		$('#btnFontResize').prop('disabled',false);
		$('#btnFontResize').css('opacity','1');
	}
	$('#btnLanguage').prop('disabled',false);
	$('#btnLanguage').removeClass('disabledBtn');
	

	var currSentenceNo = {
		"portrait" : {
			"chapterNo" : 0,
			"sentenceNo" : 0
		},
		"landscape" : {
			"chapterNo" : 0,
			"sentenceNo" : 0
		}
	}

	for (var i=chapterStartIndex;i<book.orderList.length;i++) {
		for (var j=0;j<book.orderList[i].sentences.length;j++) {
			if(book.orderList[i].sentences[j].portraitPageNo == eBookEnvironment.currPortraitPageNo) {
				currSentenceNo.portrait.chapterNo = i;
				currSentenceNo.portrait.sentenceNo = j;
			}
			if(book.orderList[i].sentences[j].landScapePageNo == eBookEnvironment.currLandScapePageNo) {
				currSentenceNo.landscape.chapterNo = i;
				currSentenceNo.landscape.sentenceNo = j;
			}
			if (currSentenceNo.portrait.chapterNo != 0 && currSentenceNo.landscape.chapterNo != 0) {
				j = book.orderList[i].sentences.length;
			}
		}
	}

	setPageInfo();
	
	
	if (eBookEnvironment.isCurrModePortrait){
		if (currSentenceNo.portrait.chapterNo != 0)
			eBookEnvironment.currPortraitPageNo = book.orderList[currSentenceNo.portrait.chapterNo].sentences[currSentenceNo.portrait.sentenceNo].portraitPageNo;
	} else {
		if (currSentenceNo.landscape.chapterNo != 0) {
			eBookEnvironment.currLandScapePageNo = book.orderList[currSentenceNo.landscape.chapterNo].sentences[currSentenceNo.landscape.sentenceNo].landScapePageNo;
		}
	}

	if (!isShowingTOC)
	{
		
		if (eBookEnvironment.currLandScapePageNo % 2 == 0) eBookEnvironment.currLandScapePageNo--;
			displayPage(eBookEnvironment.currLandScapePageNo, true);

		var tempVal = "" + eBookEnvironment.currLandScapePageNo + "-" + (eBookEnvironment.currLandScapePageNo+1) + "";
		
		
		$( "#slider-range-min" ).slider("option", "max",eBookEnvironment.maxLandScapePageNo);
		$( "#slider-range-min" ).slider("value", eBookEnvironment.currLandScapePageNo);
		
		$(".ui-slider-handle").html(tempVal);
		$(".ui-slider-handle").attr({'aria-valuetext':"Page Number "+tempVal,"aria-valuenow":tempVal});
		getNoteListDraw();

	} else {
		generateTOC();
		
	}
	$('#btnFontResize').focus();
}

//SORT JSON
function sortResults(prop, asc, arr, type) {
	/*
		VALUE FOR TYPE
		DATE		-	FOR DATETIME
		INT			-	FOR NUMBER
		STR			-	FOR STRING (DEFAULT)
	*/
	var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
    arr = arr.sort(function(a, b) {
		switch (type)
		{
			case 'DATE':
				c = new Date(a[prop]);
				d = new Date(b[prop]);
				return (asc ? (c - d) : (d - c));
				break;
			case 'INT':
				c = parseInt(a[prop]);
				d = parseInt(b[prop]);
				return (asc ? (c - d) : (d - c));
				break;
			case 'STR':
				c = (a[prop]).toLowerCase();
				d = (b[prop]).toLowerCase();
				break;
		}
		
		if (isSafari || $.browser.msie)
		{
			if (c == d)
				return 0;
			if (c > d)
				return (asc ? 1 : -1);
			if (c < d)
				return (asc ? -1 : 1);
		} else {
			if (asc) 
				return (c > d);
			else 
				return (d > c)
		}
    });
    //return arr;
}

//SHOW LOADER
function showLoader(){
	$('#popup-overlay3').show();
	$('#loaderWrap').show();
}

//HIDE LOADER
function hideLoader(){
	$('#popup-overlay3').hide();
	$('#loaderWrap').hide();
}

//REFRESH NICESCROLL
function refreshScroll(){
	try
	{
		for (var i=0;i<$.nicescroll.length;i++)
		{
			$.nicescroll[i].onResize();
		}
	}
	catch (e){}
}

//SHOW ADD NOTES 
function showAddNotes(){
	$('#overlay, #notesModal').show();
	$('#txtAreaListNote').focus();
}

//HIDE ADD NOTES 
function hideAddNotes(){
	$('#overlay, #notesModal').hide();
	$('#imgNotes').focus();
}

//CREATE NOTES
function createNote(e){
	e.preventDefault();
	$('#txtAreaCreateNote').show();
	$('#txtAreaListNote').hide();
	$('#btnSaveNote').show();
	showAddNotes();
	$('#txtAreaCreateNote').attr("autofocus","autofocus").focus().val($('.Book_Notes_content .highlight').text());
	$('#txtAreaCreateNote').off('keydown').on('keydown',function(objEvent){
		handleTab(objEvent, $(this), $(this), $('#btnSaveNote'));
	 });
	$('#btnSaveNote').off('keydown').on('keydown',function(objEvent){
		handleTab(objEvent, $(this), $('#txtAreaCreateNote'), $(this));
	});

	//5334 typing->track keypress, keyup, paste and blur 
	$('#txtAreaCreateNote').donetyping(function(){
		callLogUserActivity(this);
	},1000);
}

function handleNoteAccessibility(){	
	$('#txtAreaListNote').off('keydown').on('keydown',function(objEvent){
		handleTab(objEvent, $(this), $(this), $('#cancelBtn'));
		});
	$('#cancelBtn').off('keydown').on('keydown',function(objEvent){
			handleTab(objEvent, $(this), $('#txtAreaListNote'), $(this));
	});	
}

function isHidden(el) {
	if(el != undefined){
		var style = window.getComputedStyle(el);
		if(style){
			return (style.display === 'none');
		}    
    }
}

var saveTimerNotes = null;
var networkErrorFlagNotes = false;
//FUNCTION TO SAVE NOTES
function saveNewNotes(){
	var oSelf = this;
    clearTimeout(saveTimerNotes);
	var parentID = '#rightPageWrap', sentIndex = -1, chapNo = -1, sentNo = -1, objNotes, currPageNo = eBookEnvironment.currLandScapePageNo + 1;
	hideAddNotes();
	if ($('.highlight').parents("#leftPageWrap").length > 0) {
		parentID = '#leftPageWrap';
		currPageNo--;
	}

	if ($('.highlight').hasClass('s'))
		sentIndex = $(parentID + " .s").index($(parentID + ' .highlight'));
	else
		sentIndex = $(parentID + " .s").index($(parentID + ' .highlight').parents('.s'));

	for (var i=chapterStartIndex, sentCount=-1;i<book.orderList.length;i++) {
		for (var j=0;j<book.orderList[i].sentences.length;j++) {
			if(book.orderList[i].sentences[j].landScapePageNo == currPageNo) {
				sentCount++;
				if (sentCount == sentIndex){
					chapNo = i;
					sentNo = j;
					j = book.orderList[i].sentences.length;
				}
			}
		}
		if (chapNo != -1) i = book.orderList.length;
	}
	
	objNotes = '{\\"chapNo\\":'+chapNo+',\\"sentNo\\":'+sentNo+'}';
	var shortNoteText = $('#txtAreaCreateNote').val().replace(/\n{1,}/gi, " ").substr(0, 50); //will replace 1 or more \n with single space.
 
	//ILIT-5619
	//show loader only when device is online. This is checked to prevent loader from appearing when internet is disconnected, hence prevent flickering effect.
	if(navigator.onLine) {
	showLoader();
    }
    
	//ILIT- 664
	var currentUnit = (objEbookJsonData.currentUnit == '' ? 1 : objEbookJsonData.currentUnit );
	
	$.nativeCall({
		'method': 'SaveNote',
		'globalResource': 'objNotesJsonData',
		'inputParams':["", 'journal', fixedEncodeURIComponent(bookTitle), fixedEncodeURIComponent($('#txtAreaCreateNote').val().replace(/\n/gi, "<br>")), bookid, currentUnit, 'ebook',objNotes,fixedEncodeURIComponent(shortNoteText)],
		'onComplete':function (){
			//close the popup when internet is back. networkErrorFlagNotes is set when alert has been initiated once, its checked to ensure that alert dialog's close method is available
			if(networkErrorFlagNotes) {
				$('#dialog-message').dialog('close');
				networkErrorFlagNotes = false;
			}
		},
		'onError': function () {
	if (
		objNotesJsonData != null && 
		objNotesJsonData.Error && 
		objNotesJsonData.Error == NETWORK_ERR_CODES.c_i_CODE_09
	) 
	{ 
		networkErrorFlagNotes = true;
		hideLoader();
		//ILIT-5608
		EbookPlayerView._alert(
			{
				divId:		'dialog-message',
				title:		'Alert!',
				message:	GENERAL.c_s_NO_INTERNET_MSG
			},
			$.noop(),
			"null"
		);
		if(!networkErrorFlagNotes) {
					showLoader();
		}
		saveTimerNotes = setTimeout(function () {
						oSelf.saveNewNotes();
		}, 3000);
			
			}
	}	
	});
	//SaveNote("", 'journal', fixedEncodeURIComponent(bookTitle), fixedEncodeURIComponent($('#txtAreaCreateNote').val().replace(/\n/gi, "<br>")), bookid, currentUnit, 'ebook',objNotes,fixedEncodeURIComponent(shortNoteText));
	
	$('#tthNotes').focus();
	var _notesInfo = 'Note is saved';
	readThis(_notesInfo);
	//generateNotes();
}

//DELETE NOTES
function deleteNotes(){
	//DeleteNote(noteId)
}

//LIST NOTES
function listNotes(){
	var tmpStr = '';
	for (var i=chapterStartIndex;i<book.orderList.length;i++) {
		for (var j=0;j<book.orderList[i].sentences.length;j++) {
			if((book.orderList[i].sentences[j].landScapePageNo == eBookEnvironment.currLandScapePageNo) || (book.orderList[i].sentences[j].landScapePageNo == eBookEnvironment.currLandScapePageNo + 1)) {
				if (book.orderList[i].sentences[j].hasBookNote != undefined)
				{
					for (var k=0;k<objNoteBookData.Content.Data.length;k++) {
						for (var l=0;l<book.orderList[i].sentences[j].NoteID.length;l++ )
						{
							if (objNoteBookData.Content.Data[k].NoteID == book.orderList[i].sentences[j].NoteID[l])
							{
								GetNoteInfo(objNoteBookData.Content.Data[k].NoteID);
								//tmpStr += decodeURIComponent(objNoteBookData.Content[k].NoteText) + '<br><br>';
							}	
						}											
					}
				} 
			}
		}
	}

	/* $('#txtAreaCreateNote').hide();
	$('#txtAreaListNote').html(tmpStr).show();
	$('#btnSaveNote').hide();
	showAddNotes(); */
}

function showNotesContent(){
	var tempStr='';
	tempStr += decodeURIComponent(objNoteInfoData.Content.NoteText) + '<br><br>';
	$('#txtAreaCreateNote').hide();
	$('#txtAreaListNote').html(tempStr).show();
	$('#btnSaveNote').hide();
	handleNoteAccessibility();
	showAddNotes();
}

//FUNCTION TO SAVE TEXT TO CLIPBOARD
function copyText(){
	SaveData('clipboardText',$('.Book_Notes_content .highlight').text());
}

// CLAS-73
var saveTimerHighlights = null;
var networkErrorFlagHighlights = false;
function SaveNewHighlights(chaptorNo, pageNo)
{
	if(content.Pages[chaptorNo].sentences != undefined){
		updateSentences(content.Pages[chaptorNo].sentences,chaptorNo);
	}else{
		for (let i = 0; i < content.Pages[chaptorNo].Pages.length; i++) {
			updateSentences(content.Pages[chaptorNo].Pages[i].sentences,chaptorNo);
		}
	}
	displayPage(pageNo,true);
	defaultHighlight = defaultHighlight.filter(function(item) {
		return !item.removeFlag; // Keep items where removeFlag is not true
	});
	var highLightJsonData = defaultHighlight;
	$.nativeCall({
		'method': 'SaveHighLight',
		'globalResource': 'objHighlightesJsonData',
		'inputParams':["book",fixedEncodeURIComponent(bookTitle), bookid, highLightJsonData],
		'onComplete':function (){
			//close the popup when internet is back. networkErrorFlagHighlights is set when alert has been initiated once, its checked to ensure that alert dialog's close method is available
			if(networkErrorFlagHighlights) {
				$('#dialog-message').dialog('close');
				networkErrorFlagHighlights = false;
			}
		},
		'onError': function () {
	if (
		objHighlightesJsonData != null && 
		objHighlightesJsonData.Error && 
		objHighlightesJsonData.Error == NETWORK_ERR_CODES.c_i_CODE_09
	) 
	{ 
		networkErrorFlagHighlights = true;
		hideLoader();
		EbookPlayerView._alert(
			{
				divId:		'dialog-message',
				title:		'Alert!',
				message:	GENERAL.c_s_NO_INTERNET_MSG
			},
			$.noop(),
			"null"
		);
		if(!networkErrorFlagHighlights) {
					showLoader();
		}
		saveTimerHighlights = setTimeout(function () {
						oSelf.SaveNewHighlights();
		}, 3000);
			
			}
	}
	})
}
// Get Highlight data
function GetHighlights() {
	GetHighLightInfo(bookid);
}

function ApplyHighLightData(){
	for (var i=0;i<book.orderList.length;i++) {
		var bookContent = content.Pages[book.orderList[i].name].sentences;
		if(bookContent == undefined){
			for (var j=0; j<content.Pages[book.orderList[i].name].Pages.length; j++){
				bookContent = content.Pages[book.orderList[i].name].Pages[j].sentences;
				content.Pages[book.orderList[i].name].Pages[j].sentences = updateSentences(bookContent,book.orderList[i].name, book.orderList[i].order);
			}
		}else{
			content.Pages[book.orderList[i].name].sentences = updateSentences(bookContent,book.orderList[i].name, book.orderList[i].order);
		}
	}
}

// CLAS-73 End

//GET LIBRARY PROGRESS CALL BACK
function GetLibraryProgressCallback(pobjlibraryProgressData) {	
	pobjlibraryProgressData = JSON.parse(pobjlibraryProgressData);
	if (pobjlibraryProgressData.Status == 200)
	{
		if (pobjlibraryProgressData.Content.length > 0) {
			if(pobjlibraryProgressData.Content[0].ProgressDataDetails!= "")
			{
				objLibraryProgress = JSON.parse(pobjlibraryProgressData.Content[0].ProgressDataDetails);
				$('body').attr('class',objLibraryProgress['font-size']);
				$('.zooms.active').removeClass('active');
				
				$('.zooms[cssPath="' + objLibraryProgress['font-size'] + '"]').addClass('active');
				//eBookEnvironment.currLandScapePageNo = objLibraryProgress.pageNo;
				if(objLibraryProgress.WordCountObj != null && objLibraryProgress.WordCountObj != 'undefined')
					WordCountObj = objLibraryProgress.WordCountObj; 
				else
					WordCountObj={};
			}else
				$('.zooms2').addClass('active');
				
			totalWordsRead = !isNaN(parseInt(pobjlibraryProgressData.Content[0].TotalNumberOfWordsRead)) ? parseInt(pobjlibraryProgressData.Content[0].TotalNumberOfWordsRead) : 0;

			if (totalWordInBook * (dBookCompletePercent/100) <= totalWordsRead) {
				bookReadEnd = true;
			}
			
			TOT_TIME_SPENT += parseInt(pobjlibraryProgressData.Content[0].TotalNumberOfSecondsSpent) ? parseInt(pobjlibraryProgressData.Content[0].TotalNumberOfSecondsSpent) * 1000 : 0;
			
			
			/* find current week time spent */
			var fCallback  = function (currentWeek) {
				var bookType = (bookid == objEbookJsonData.currentRataBookId ? 'RATA' : 'Time To Read' );
				var currentBookType = (bookType == 'Time To Read' ? 'TTR' : 'RATA' );
				var currentUnit = (objEbookJsonData.currentUnit == '' ? 1 : objEbookJsonData.currentUnit );
				var currentWeek = currentWeek ? currentWeek : (objEbookJsonData.currentWeek == '' ? 1 : objEbookJsonData.currentWeek);
				var regex = new RegExp(currentUnit+'.'+currentWeek+'.'+currentBookType);
				$.each(WordCountObj, function (k, val) {				
					if (k.match(regex) && typeof val == "string" && val.match(/\d*\|\d*/)) {
						WEEKLY_TIME_SPENT += parseInt(val.split("|")[1]) * 1000; 
					}
				});
			}
			if (productCode.match(/^ilit20/)) {
				getCurrentWeek(fCallback);		
			}
			else {	
				fCallback('');				
			}			
		}
	}

	// if totalWordInBook or totalPages is 0 then wordsPerPage will be 150 else calculated value
	//wordsPerPage = ((totalWordInBook==0 || eBookEnvironment.maxLandScapePageNo==0) ? 150 : Math.round(totalWordInBook/eBookEnvironment.maxLandScapePageNo));
	
	init();
	
	/* TexthelpSpeechStream.addToolbar("Tablet", "1"); */
	//hide new toolbar
	var fScheduleCheckBarLoaded = function(){
	if($("#thss-toolbar-modernToolbar").length > 0){
			 
			 window.texthelp.SpeechStream.ui.toolbar.toolbar.setVisibility(false);
			 clearInterval(checkBarInterval);
		}
	}
	var checkBarInterval = setInterval(fScheduleCheckBarLoaded, 10);
}

var saveTimer = null;
var networkErrorFlag = false;
//SAVE LIBRARY DATA
function setLibraryProgress(){
	clearTimeout(saveTimer);
	if ($('button.sld_lft').hasClass('disabled')) return;
	// CLAS-1062 start
	if(window.parent){
		window.parent.document.title = originalLibraryTitle;
	}
	// CLAS-1062 end
	var fCallback = function (currentWeek) {
		var chapNo = -1, sentNo = -1, objLibraryDetails;
		for (var i=chapterStartIndex;i<book.orderList.length;i++) {
			for (var j=0;j<book.orderList[i].sentences.length;j++) {
				if(book.orderList[i].sentences[j].landScapePageNo == eBookEnvironment.currLandScapePageNo) {
					chapNo = i;
					sentNo = j;
					j = book.orderList[i].sentences.length;
				}
			}
			if (chapNo != -1) i = book.orderList.length;
		}
		bookType = (bookid == objEbookJsonData.currentRataBookId ? 'RATA' : 'Time To Read' );
		var currentBookType = (bookType == 'Time To Read' ? 'TTR' : 'RATA' );
		var currentUnit = (objEbookJsonData.currentUnit == '' ? 1 : objEbookJsonData.currentUnit );
		var currentWeek = currentWeek ? currentWeek : (objEbookJsonData.currentWeek == '' ? 1 : objEbookJsonData.currentWeek );
		
		// total time spent per book
		var timeSpent = timeSpentPerPage ? Date.now() - timeSpentPerPage : 0;	
		TOT_TIME_SPENT += timeSpent > maxTimePerPage ? maxTimePerPage : timeSpent;	
		WEEKLY_TIME_SPENT += timeSpent > maxTimePerPage ? maxTimePerPage : timeSpent;	
		timeSpentPerPage = 0;		
		var totTimeSpentInSec = Math.round(TOT_TIME_SPENT/1000); // convert to seconds
		var weekWiseTimeSpent = Math.round(WEEKLY_TIME_SPENT/1000); // convert to seconds
		
		// total word count & time spent per week
		var isMatchingFound = false;
		if(currentUnit!=0 && currentWeek!=0){
			if(WordCountObj[currentUnit+'.'+currentWeek+'.'+currentBookType] != undefined) {
				weekWiseWordCount+= parseInt(WordCountObj[currentUnit+'.'+currentWeek+'.'+currentBookType]);
			}
			
			if(weekWiseWordCount > totalWordInBook) {
				if(JSON.stringify(WordCountObj) != '{}'){
					/** if weekWiseWordCount is greater than totalWordInBook , then subtract the previous weekwisewordcount from 
						the current weekWiseWordCount and save it **/
						var prevWeekWordCount = 0;
						var regex = new RegExp(currentUnit+'.'+currentWeek+'.'+currentBookType);
						$.each(WordCountObj, function (k, val) {
							if(!k.match(regex))	{				
								if (typeof val == "string" && val.match(/\d*\|\d*/)) {
									prevWeekWordCount += parseInt(val.split("|")[0]);  // calculate previous weeks word count
								}
							}
						});
					
						weekWiseWordCount = totalWordInBook - prevWeekWordCount; // subtract previous ones from totalwordinbook (as weekwisewordcount > totalWordInBook)
				}else
					weekWiseWordCount = totalWordInBook;
			}
			
			WordCountObj[currentUnit+'.'+currentWeek+'.'+currentBookType] = weekWiseWordCount+"|"+weekWiseTimeSpent;
		}
		else
			WordCountObj={};
			
		var _finalArr = [];
		_finalArr[0]=JSON.stringify(WordCountObj).replace(/"/g, '\\"');
		
		/* mark as book complete if 70% read */
		if (totalWordsRead >= totalWordInBook * (dBookCompletePercent/100)) {
			bookReadEnd = true;
		}			
		
		objLibraryProgress = '{\\"bookType\\":\\"' + bookType + '\\",\\"mode\\":\\"landscape\\",\\"chapNo\\":'+chapNo+',\\"sentNo\\":'+sentNo+',\\"font-size\\":\\"'+$('body').attr('class')+'\\"'+ ',\\"WordCountObj\\":' + _finalArr+'}';
		objLibraryDetails  = '{\\"bookType\\":\\"' + bookType + '\\",\\"totalWords\\":' + totalWordInBook + ',\\"bookCompleted\\":' + bookReadEnd + ',\\"currentUnit\\":' + currentUnit +  ',\\"currentWeek\\":' + currentWeek +'}';

		console.log(JSON.stringify(objLibraryProgress));
		
		objSaveLibraryProgressResponse = null; // response from SaveLibraryProgress will be stored here
		SaveLibraryProgress(undefined,bookid,objLibraryDetails,objLibraryProgress,totalWordsRead,isBroadcast,totTimeSpentInSec,bookLexileLevel); // 'isBroadcast' is added so that windows can detect whether 'savelibrary' call has been triggered from broadcasted window or main window (of eBook)
		
		setTimeout(function () {
			checkSave();
		}, 400);
		
		
		var pdfReaderFrameSrc = window.top.$('.pdfReaderOverlay .pdfReaderWrapper #pdfReaderFrame').attr("src"),
			broadcastFrameSrc = window.top.$('.broadcastOverlay .broadcastWrapper #broadcastFrame').attr("src");
			
		if (objEbookJsonData.appPlatform==null && objEbookJsonData.currentVersion ==null && source=='broadcast'){
			HideEbookBroadcast();
		}
		//ILIT-1082
		else if (
			source=='broadcast' && 
			pdfReaderFrameSrc.length > 0 &&
			broadcastFrameSrc.length > 0
		){
			HideEbookBroadcast();
		}
		else{
			if(!networkErrorFlag) {
			showLoader();
		}
	}
	}
	
	/* calculate current week */
	if (productCode.match(/^ilit20/)) {
		getCurrentWeek(fCallback);		
	}
	else {		
		fCallback('');
	}	

		
}

function getCurrentWeek(fCallback) {
	$.nativeCall({
			'method': 'getCurrentDeviceTimestamp',
			'globalResource': 'objGetCurrentDeviceTimestamp',
			'checkSuccess': function (oResponse) {
				return oResponse != null;
			},
			'onComplete': function () {
				var currentWeek = 1;
				if (classStartDate) {
					var sDate1 = classStartDate;					
					var sDate2 = objGetCurrentDeviceTimestamp.currentDeviceTimestamp;
					//var sDate2 = "2016-06-14 09:02:29";
					var d1 = new Date(sDate1).getTime();
					var d2 = new Date(sDate2).getTime();
					
					var daysPassed = ((((d2-d1)/1000)/60)/60)/24;
					currentWeek = Math.ceil(daysPassed/7);
				}
				if (typeof fCallback == "function") {
					fCallback(currentWeek);
				}
				else {
					return currentWeek;
				}
			}
		});
}

function checkSave() {
	if (objSaveLibraryProgressResponse != null) {
		if (objSaveLibraryProgressResponse.Error) {
				if( objSaveLibraryProgressResponse.Error == NETWORK_ERR_CODES.c_i_CODE_09) { 
					networkErrorFlag = true;
					hideLoader();
					//ILIT-5608
					EbookPlayerView._alert(
						{
							divId:		'dialog-message',
							title:		'Alert!',
							message:	GENERAL.c_s_NO_INTERNET_MSG
						},
						$.noop(),
						"null"
					);
					//after every alert in case of internet disconnection, and again start the callback method in order to execute saveLibraryProgress, so that if internet is back, it will execute successfully
					saveTimer = setTimeout(setLibraryProgress, 3000);
				}
		}else{		
			networkErrorFlag = false;
			try {			
				if (oPlatform.isDevice()) {
					CloseWebView()
				}			
				redirectFromEbook();			
			} catch(e) {
			}
		}
	}
	else {
		setTimeout(function () {
			checkSave();
		}, 400);
	}
}

function redirectFromEbook(){	
    hideLoader();
	var checkChrome =location.hash.split('|||').indexOf('chromeApp');
    if (source=='broadcast') {
		HideEbookBroadcast();
	} else if(source=='assignment' || source=='notebook'){
		//HideNativeBottomBar(false);
		if(location.hash.split('|||')[checkChrome] === 'chromeApp'){
			window.location.href='../'+context+'#chromeApp';
		}
		else{
			window.location.href='../'+context;
		}
	}
	else {
		if(location.hash.split('|||')[11] === 'chromeApp'){
			window.location.href='../library.html#chromeApp';
		}
		else{
			window.location.href='../library.html';
		}
	}
}

// triggered from native
function showNetworkErrorAlert(bNetworkErr){
	if(bNetworkErr) {
		// show popup
		if($('#dialog-message-network').text() != GENERAL.c_s_NO_INTERNET_MSG) {
			EbookPlayerView._alert(
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

// Text Help Dictionary
var eventDic = function (e) {
	e.preventDefault();
		
    try {
		$('#msTextHelp').selectText();		
		$('#textToHelpMenu').hide();
		ssAPI.textTools.dictionaryLookup($('#msTextHelp').text());
		setTimeout(function() {
			textHelpAccessibility();		
		
			var closeButton = document.querySelector("#__bs_entryDiv > div").shadowRoot.querySelector("div.browsealoud-dialog-th.react-draggable > div.ba-dialog-popupClose > button");
			$(closeButton).focus();
			
		}, 4000);
	}
	catch (e) { console.log(e); }
}
// Text Help Picture Dictionary
var eventPicDic = function (e) {
	e.preventDefault();
		
    try {
		$('#msTextHelp').selectText();		
		ssAPI.textTools.pictureDictionaryLookupWord($('#msTextHelp').text());
		
		$('#textToHelpMenu').hide();
		setTimeout(function() {
			textHelpAccessibility();
			$(".browsealoud-dialog-th-button").focus();
		}, 4000);
	}
	catch (e) { console.log(e); }
}
// Text Help Translater
var eventTrans = function (e) {
	e.preventDefault();
		
    try {
		$('#msTextHelp').selectText();	
		ssAPI.textTools.translateRequest($('#msTextHelp').text());
		
		$('#textToHelpMenu').hide();
		
		var myFunction = function() {
			var elem = document.querySelector("#__bs_entryDiv > div").shadowRoot.querySelector("#thss-dialog-content0 > button");				
			
			//elem2 is for single word translation
			var elem2 = document.querySelector("#__bs_entryDiv > div").shadowRoot.querySelector("#thss-dialog-content1 > button");

			if (!(elem || elem2)) {				
				setTimeout(myFunction, 1000);
				return;
			}
			textHelpAccessibility();

			// Show No Speech Available Message				
			if(
				(elem && $(elem).attr("aria-label") == "No Speech") || 
				(elem2 && $(elem2).attr("aria-label") == "No Speech")
			) {
				var str = '<div style="font-size: 14px;	padding-left:15px; font-family: "Open Sans", Arial, sans-serif !important;">'+c_s_VOICE_TRANSLATE_UNAVAIBLE+'</div>';
				var selector = document.querySelector("#__bs_entryDiv > div").shadowRoot.querySelector("div.browsealoud-dialog-th.react-draggable > div.mainContentContainer");

				$(str).insertAfter(selector);
			};			
		
		}
		setTimeout(myFunction, 2000);
		
	}
	catch (e) { console.log(e); }
}

//CALLBACK ON START OF READ OF TEXT HELP 
function textRead_speechStartedCallback(){
	var objID = '#rightAudioStop';
	if ($('.highlight').parents("#leftPageWrap").length > 0)
		objID = '#leftAudioStop';
	$(objID).css('visibility', 'visible');
}

//CALLBACK ON STOP OF READ OF TEXT HELP 
function textRead_completedCallback(){
	$('.audio_block').css('visibility', 'hidden');
}

var sTempIDTextWithHTMLTags = '';
function playText() {
    $('#tempID').removeAttr('id')
    $('.Book_Notes_content .highlight').attr('id', 'tempID');
	
	sTempIDTextWithHTMLTags = $('#tempID').html(); // original text with html tags
	$('#tempID').text($('#tempID').text())
	ssAPI.speechTools.setVoiceSpeed(50);
	ssAPI.speechTools.speakById('tempID');
	ssAPI.speechTools.setSpeechStoppedCallback( function(){
		$('#tempID').html(sTempIDTextWithHTMLTags);
		$("#tempID").focus();
	})
		
}

//DISABLE BUTTON ON BROADCAST END
function onBroadcastEnd(){
	$('button.sld_lft').removeClass('disabled');
}

//ENABLE BUTTON ON BROADCAST START
function onBroadcastStart(){
	$('button.sld_lft').addClass('disabled');
}
function EbookPlayerView () {}
EbookPlayerView._alert =  ISeriesBase.prototype._alert;


var accessibility={
	init: function(){
		accessibility.bindEvents();
	},
	bindEvents:function(){
		$(".ebook_container_block").keydown(function(e){

			/**if any key other than 'a' is pressed then only will remove highlight. 'a' will open annotation pen  */
			if(e.keyCode != 65){
				$('.highlight').removeClass('highlight');				
			}
			$('#textToHelpMenu,#textToHelpMenu .textToHelpMenuButtons,#textToHelpMenu .sep').hide();
			$('.thss-dialog-toolbarPopup').hide();
			

			/*paragraph/word highlight and texthelp popup visible on SPACEBAR*/
			if(e.keyCode == 32){ 	
				if( $(e.target).is($("p .s"))){
					tmpObj = $(e.target);
					_lastFocusedElem = tmpObj;
					tmpObj.addClass('highlight');
					var sHighlight = ($('.highlight').text()).toString();
					$('#msTextHelp').text(sHighlight);
					$('#msTextHelp').selectText();
					$('#rangeText').removeAttr('id');
					tmpObj.addClass('highlight').attr("id","rangeText");
					$('#tthSpeak, #tthNotesSep, #tthNotes, #tthCopySep, #tthCopy, #tthTransSep, #tthTrans').show();
					$('#textToHelpMenu').css('left',0).css('top',0).show();
					setTimeout(function(){ 
						$('#tthSpeak').focus();	 
					}, 3000);				
					var offset = $(tmpObj).offset();
					var objWid = $(tmpObj).width();
					setPosTextHelp(offset,objWid);
					$('.thss-dialog-toolbarPopup').attr({'aria-live':'polite'});
					$('.thss-dialog-popupContent').attr('tabindex',"0");
					$('.thss-dialog-popupClose').attr({'tabindex':"0",'aria-label':'close button'});
				}
				else if( $(e.target).is($("#leftPageWrap p .w")) || $(e.target).is($("#rightPageWrap p .w"))){
					tmpObj = $(e.target);
					_lastFocusedElem = tmpObj;
					tmpObj.addClass('highlight');
					var sHighlight = ($('.highlight').text()).toString();
					$('#msTextHelp').text(sHighlight);
					$('#msTextHelp').selectText();
					$('#rangeText').removeAttr('id');
					tmpObj.addClass('highlight').attr("id","rangeText");
					$('#textToHelpMenu .textToHelpMenuButtons,#textToHelpMenu .sep').show();
					$('#textToHelpMenu').css('left',0).css('top',0).show();
					setTimeout(function(){ 
						$('#tthSpeak').focus();	 
					}, 3000);				
					var offset = $(tmpObj).offset();
					var objWid = $(tmpObj).width();
					setPosTextHelp(offset,objWid);
					$('.thss-dialog-toolbarPopup').attr({'aria-live':'polite'});
					$('.thss-dialog-popupContent').attr('tabindex',"0");
					$('.thss-dialog-popupClose').attr({'tabindex':"0",'aria-label':'close button'});	
				}
				else{
					if($(e.target).is($('.chapterWrap'))){
						triggerClickOnThisElemApp(e, $(e.target));
					}
				}
			
			}
			/*remove highlight and hide texthelp popup when ESC is pressed*/
			if(e.keyCode == 27){  
				$('.highlight').removeClass('highlight');
				_lastFocusedElem.focus();
				$('#textToHelpMenu,#textToHelpMenu .textToHelpMenuButtons,#textToHelpMenu .sep').hide();
				$('.thss-dialog-toolbarPopup').hide();
				
			}
			/*key 'w' is used to focus the first word of the focused paragraph*/
			if(e.keyCode==87){ 
				if( $(e.target).is($(".s"))){
					var _tmp =  $(e.target);
					var elem = _tmp.find('.w').first();
					//console.log(elem);
					elem.focus();
				}
			}
			/*key'p' is used to focus the corresponding paragraph*/
			if(e.keyCode==80){ 
				if( $(e.target).is($(".w"))){
					var _tmp =  $(e.target);
					var elem = _tmp.parents('.s');
					//console.log(elem);
					elem.focus();
				}
			}
			/*right arrow for forward word traversing*/
			if(e.keyCode==39){
				
				if( $(e.target).is($(".w")) || $(e.target).is($(".s b")) || $(e.target).is($(".s span")) || $(e.target).is($(".s br"))){
					var _nElem = $(document.activeElement);
					//console.log($(_nElem).next());
					if($(_nElem).next().is($('b')) || $(_nElem).next().is($('span')) || $(_nElem).next().is($('em')) || $(_nElem).next().is($('strong'))){	
						$(_nElem).next().find('.w:eq(0)').focus();
						//console.log('focused element: '+$(_nElem).next().find('.w').html());
					}
					else{

						if($(_nElem).next().length>0){
							
							if($(_nElem).next().is($('br'))){
								$(_nElem).next().next().focus();
							}else{
								$(_nElem).next().focus();
							}
						}
						else{

							if($(_nElem).parents('b').length > 0)
								$(_nElem).parents('b').next().focus();
							else if($(_nElem).parents('span').length > 0)
								$(_nElem).parents('span').next().focus();
							else if($(_nElem).parents('em').length > 0)
								$(_nElem).parents('em').next().focus();
							else if($(_nElem).parents('strong').length > 0)
								$(_nElem).parents('strong').next().focus();
							else
								$(_nElem).parents().next().focus();
						
						//	console.log('in else,focused element1: '+$(_nElem).parents().next().html());	
						}
						//console.log('focused element1: '+$(_nElem).next().html() + '	parents: '+$(_nElem).parents('b').next().html());
					}
					
				}
				
			}
			/*left arrow for backward word traversing*/
			if(e.keyCode==37){ 

				if( $(e.target).is($(".w")) || $(e.target).is($(".s b")) || $(e.target).is($(".s span")) || $(e.target).is($(".s br")) ){
					var _nElem = $(document.activeElement);
					if($(_nElem).prev().is($('b')) || $(_nElem).prev().is($('span')) || $(_nElem).prev().is($('em')) || $(_nElem).prev().is($('strong')) ){	
						$(_nElem).prev().find('.w:last-child').focus();
						//console.log('focused element: '+$(_nElem).prev().find('.w').html());
					}
					else{
						if($(_nElem).prev().length>0){
							if($(_nElem).prev().is($('br'))){
								$(_nElem).prev().prev().focus();
							}else{
								$(_nElem).prev().focus();
							}
						}
						else{
							if($(_nElem).parents('b').length > 0)
								$(_nElem).parents('b').prev().focus();
							else if($(_nElem).parents('span').length > 0)
								$(_nElem).parents('span').prev().focus();
							else if($(_nElem).parents('em').length > 0)
								$(_nElem).parents('em').prev().focus();
							else if($(_nElem).parents('strong').length > 0)
								$(_nElem).parents('strong').prev().focus();
							else
								$(_nElem).parents().prev().focus();
							
						//console.log('focused element1: '+$(_nElem).prev().html() + '	parents: '+$(_nElem).parents('span').prev().html());
						}
					}
					
				}	
			}

			/*TAB key will not work if any word is focused inside a paragraph*/
			if(e.keyCode==9){
				if( $(e.target).is($(".w"))){
					e.preventDefault();
				}
			}			
		});	
		

		$(document).off('keydown').on('keydown', function(e){			
			/*remove any visible popup when ESC is pressed*/
			if(e.keyCode == 27){  
				$('.highlight').removeClass('highlight');
				if(_lastFocusedElem.length>0)
					_lastFocusedElem.focus();
				$('#textToHelpMenu,#textToHelpMenu .textToHelpMenuButtons,#textToHelpMenu .sep').hide();
				$('#menuLanguage,#menuFontResize,.thss-dialog-toolbarPopup,#InfoContent').hide();
				$('.zooms').attr('aria-hidden',"true" ).hide();
				$('#btnLanguage,#btnFontResize,#infoBtn').attr({'aria-expanded':"false"});
			}

			/*key 'a' is used to open the annotation pen if any paragraph/word is selected*/
			if(e.keyCode==65){
				//if note is open the nothing will happen CLASSVIEW-458
				if ($("#notesModal").is(':visible')) {return;}

				//if any paragraph/word is selected
				if($("#rangeText").length) {
					$("#btnTextHighlight").trigger("click");
				}
			}
			
		}); 
		

		//prev button click
		$(".ebook_previous_button").off().on({
			
			click: function(event){
				 //ILIT-5334
				 if($(event.target).hasClass("valid-activity")){
					callLogUserActivity(event);
				}
				//return if first page
				if($(".ebook_previous_button").hasClass("disabled")){
					return false;
				}
				else{
					ssAPI.speechTools.stop();
					//enable next button
					if($(".ebook_next_button").hasClass("disabled")){
						$(".ebook_next_button").removeClass("disabled");
						// CLAS-1090 start
						$(".ebook_next_button").removeAttr("aria-disabled");
						// CLAS-1090 end			
					}

					if(eBookEnvironment.currLandScapePageNo <= 1 || (eBookEnvironment.currLandScapePageNo - 2) < 1){
						$(".ebook_previous_button").addClass("disabled")
						// CLAS-1090 start
						$(".ebook_previous_button").attr("aria-disabled","true");
						// CLAS-1090 end
					}
					else{
						eBookEnvironment.currLandScapePageNo = (eBookEnvironment.currLandScapePageNo - 2)
						$( "#slider-range-min" ).slider('value',eBookEnvironment.currLandScapePageNo);					
						displayPage(eBookEnvironment.currLandScapePageNo, true);
						var pageNo = eBookEnvironment.currLandScapePageNo;
						var tempVal = '<div id="pageNoBallon" style="position:absolute;top:-3.5em;border-radius: 12px;left:0px;background:#000;"><div tabindex="0" style="height:35px;line-height:35px;white-space:nowrap;padding:0 7px;color:#FFF;">' + pageNo+ '-' + (pageNo+1) + ' of ' + eBookEnvironment.maxLandScapePageNo + '</div><div style="border-left: 5px solid transparent;border-right: 5px solid transparent;border-top: 5px solid #000000;bottom: -5px;height: 0;left: 0;margin-left: auto;margin-right: auto;position: absolute;right: 0;width: 0;"></div></div>' + pageNo+ '-' + (pageNo+1) + '';
						var _tempValue = pageNo+ '-' + (pageNo+1);
						
						
						$(".ui-slider-handle").html(tempVal);
						$(".ui-slider-handle").attr("tabindex","0");
						$(".ui-slider-handle").attr({'aria-valuetext':"Page Number "+_tempValue,"aria-valuenow":_tempValue});
						//$('#pageNoBallon').css('left',($('.ui-slider-handle').width() / 2) - ($('#pageNoBallon').width() / 2) );	
						$('#pageNoBallon').css("display","none");
						// CLASSVIEW-902   CLASSVIEW-897   CLASSVIEW-908
						// CLASSVIEW-903   CLASSVIEW-899   CLASSVIEW-909
						if(eBookEnvironment.currLandScapePageNo <= 1 || (eBookEnvironment.currLandScapePageNo - 2) < 1){
							$(".ebook_previous_button").addClass("disabled")
							// CLAS-1090 start
							$(".ebook_previous_button").attr("aria-disabled","true");
							// CLAS-1090 end
						}
					}
					
				}
		
			
			},
			keydown: function(event){
				 //ILIT-5334
				 if($(event.target).hasClass("valid-activity")){
					callLogUserActivity(event);
				}
				if(event.keyCode == "32" || event.keyCode == "13"){
					//return if first page
					if($(".ebook_previous_button").hasClass("disabled")){
						return false;
					}
					else{
						ssAPI.speechTools.stop();
						//enable next button
						if($(".ebook_next_button").hasClass("disabled")){
							$(".ebook_next_button").removeClass("disabled");
							// CLAS-1090 start
							$(".ebook_next_button").removeAttr("aria-disabled");
							// CLAS-1090 end
						}

						if(eBookEnvironment.currLandScapePageNo <= 1 || (eBookEnvironment.currLandScapePageNo - 2) < 1){
							$(".ebook_previous_button").addClass("disabled")
							// CLAS-1090 start
							$(".ebook_previous_button").attr("aria-disabled","true");
							// CLAS-1090 end			
						}
						else{
							eBookEnvironment.currLandScapePageNo = (eBookEnvironment.currLandScapePageNo - 2)
							$( "#slider-range-min" ).slider('value',eBookEnvironment.currLandScapePageNo);					
							displayPage(eBookEnvironment.currLandScapePageNo, true);
							var pageNo = eBookEnvironment.currLandScapePageNo;
							var tempVal = '<div id="pageNoBallon" style="position:absolute;top:-3.5em;border-radius: 12px;left:0px;background:#000;"><div tabindex="0" style="height:35px;line-height:35px;white-space:nowrap;padding:0 7px;color:#FFF;">' + pageNo+ '-' + (pageNo+1) + ' of ' + eBookEnvironment.maxLandScapePageNo + '</div><div style="border-left: 5px solid transparent;border-right: 5px solid transparent;border-top: 5px solid #000000;bottom: -5px;height: 0;left: 0;margin-left: auto;margin-right: auto;position: absolute;right: 0;width: 0;"></div></div>' + pageNo+ '-' + (pageNo+1) + '';
							var _tempValue = pageNo+ '-' + (pageNo+1);
							
							
							$(".ui-slider-handle").html(tempVal);
							$(".ui-slider-handle").attr("tabindex","0");
							$(".ui-slider-handle").attr({'aria-valuetext':"Page Number "+_tempValue,"aria-valuenow":_tempValue});
							//$('#pageNoBallon').css('left',($('.ui-slider-handle').width() / 2) - ($('#pageNoBallon').width() / 2) );	
							$('#pageNoBallon').css("display","none");	
							// CLASSVIEW-902   CLASSVIEW-897   CLASSVIEW-908
							// CLASSVIEW-903   CLASSVIEW-899   CLASSVIEW-909
							if(eBookEnvironment.currLandScapePageNo <= 1 || (eBookEnvironment.currLandScapePageNo - 2) < 1){
								$(".ebook_previous_button").addClass("disabled")
								// CLAS-1090 start
								$(".ebook_previous_button").attr("aria-disabled","true");
								// CLAS-1090 end
							}	
						}
						
					}
			
				}
			},
			focus: function(event){
				$('.ebook_previous_button').tooltip();
			}
		})

		//next button click
		$(".ebook_next_button").off().on({
			click: function(event){
				 //ILIT-5334
				 if($(event.target).hasClass("valid-activity")){
					callLogUserActivity(event);
				}
				//return if last page
				if($(".ebook_next_button").hasClass("disabled")){
					return false;
				}
				else{
					ssAPI.speechTools.stop();
					//enable previous button
					if($(".ebook_previous_button").hasClass("disabled")){
						$(".ebook_previous_button").removeClass("disabled");
						// CLAS-1090 start
						$(".ebook_previous_button").removeAttr("aria-disabled");
						// CLAS-1090 end
					}
					
					if(eBookEnvironment.currLandScapePageNo >=  eBookEnvironment.maxLandScapePageNo || (eBookEnvironment.currLandScapePageNo+2) > eBookEnvironment.maxLandScapePageNo  ){
						$(".ebook_next_button").addClass("disabled")
						// CLAS-1090 start
						$(".ebook_next_button").attr("aria-disabled","true");
						// CLAS-1090 end
					}
					else{
						eBookEnvironment.currLandScapePageNo = (eBookEnvironment.currLandScapePageNo + 2)
						$( "#slider-range-min" ).slider('value',eBookEnvironment.currLandScapePageNo);					
						displayPage(eBookEnvironment.currLandScapePageNo, true);
						var pageNo = eBookEnvironment.currLandScapePageNo;
						var tempVal = '<div id="pageNoBallon" style="position:absolute;top:-3.5em;border-radius: 12px;left:0px;background:#000;"><div tabindex="0" style="height:35px;line-height:35px;white-space:nowrap;padding:0 7px;color:#FFF;">' + pageNo+ '-' + (pageNo+1) + ' of ' + eBookEnvironment.maxLandScapePageNo + '</div><div style="border-left: 5px solid transparent;border-right: 5px solid transparent;border-top: 5px solid #000000;bottom: -5px;height: 0;left: 0;margin-left: auto;margin-right: auto;position: absolute;right: 0;width: 0;"></div></div>' + pageNo+ '-' + (pageNo+1) + '';
						var _tempValue = pageNo+ '-' + (pageNo+1);
						
						
						$(".ui-slider-handle").html(tempVal);
						$(".ui-slider-handle").attr("tabindex","0");
						$(".ui-slider-handle").attr({'aria-valuetext':"Page Number "+_tempValue,"aria-valuenow":_tempValue});
						//$('#pageNoBallon').css('left',($('.ui-slider-handle').width() / 2) - ($('#pageNoBallon').width() / 2) );			
						$('#pageNoBallon').css("display","none");	
						// CLASSVIEW-902   CLASSVIEW-897   CLASSVIEW-908
						// CLASSVIEW-903   CLASSVIEW-899   CLASSVIEW-909	
						if(eBookEnvironment.currLandScapePageNo >=  eBookEnvironment.maxLandScapePageNo || (eBookEnvironment.currLandScapePageNo+2) > eBookEnvironment.maxLandScapePageNo  ){
							$(".ebook_next_button").addClass("disabled")
							// CLAS-1090 start
							$(".ebook_next_button").attr("aria-disabled","true");
							// CLAS-1090 end
						}
						if(eBookEnvironment.currLandScapePageNo <= 1 || (eBookEnvironment.currLandScapePageNo - 2) < 1){
							$(".ebook_previous_button").addClass("disabled")
							// CLAS-1090 start
							$(".ebook_previous_button").attr("aria-disabled","true");
							// CLAS-1090 end
						}
					
					}
				}
			},
			keydown: function(event){
				//ILIT-5334
				if($(event.target).hasClass("valid-activity")){
					callLogUserActivity(event);
				}
				if(event.keyCode == "32" || event.keyCode == "13"){
					//return if last page
					if($(".ebook_next_button").hasClass("disabled")){
						return false;
					}
					else{
						ssAPI.speechTools.stop();
						//enable previous button
						if($(".ebook_previous_button").hasClass("disabled")){
							$(".ebook_previous_button").removeClass("disabled");
							// CLAS-1090 start
							$(".ebook_previous_button").removeAttr("aria-disabled");
							// CLAS-1090 end
						}
						
						if(eBookEnvironment.currLandScapePageNo >=  eBookEnvironment.maxLandScapePageNo || (eBookEnvironment.currLandScapePageNo+2) > eBookEnvironment.maxLandScapePageNo  ){
							$(".ebook_next_button").addClass("disabled")
							// CLAS-1090 start
							$(".ebook_next_button").attr("aria-disabled","true");
							// CLAS-1090 end
						}
						else{
							eBookEnvironment.currLandScapePageNo = (eBookEnvironment.currLandScapePageNo + 2)
							$( "#slider-range-min" ).slider('value',eBookEnvironment.currLandScapePageNo);					
							displayPage(eBookEnvironment.currLandScapePageNo, true);
							var pageNo = eBookEnvironment.currLandScapePageNo;
							var tempVal = '<div id="pageNoBallon" style="position:absolute;top:-3.5em;border-radius: 12px;left:0px;background:#000;"><div tabindex="0" style="height:35px;line-height:35px;white-space:nowrap;padding:0 7px;color:#FFF;">' + pageNo+ '-' + (pageNo+1) + ' of ' + eBookEnvironment.maxLandScapePageNo + '</div><div style="border-left: 5px solid transparent;border-right: 5px solid transparent;border-top: 5px solid #000000;bottom: -5px;height: 0;left: 0;margin-left: auto;margin-right: auto;position: absolute;right: 0;width: 0;"></div></div>' + pageNo+ '-' + (pageNo+1) + '';
							var _tempValue = pageNo+ '-' + (pageNo+1);
							
							
							$(".ui-slider-handle").html(tempVal);
							$(".ui-slider-handle").attr("tabindex","0");
							$(".ui-slider-handle").attr({'aria-valuetext':"Page Number "+_tempValue,"aria-valuenow":_tempValue});
							//$('#pageNoBallon').css('left',($('.ui-slider-handle').width() / 2) - ($('#pageNoBallon').width() / 2) );			
							$('#pageNoBallon').css("display","none");
							// CLASSVIEW-902   CLASSVIEW-897   CLASSVIEW-908
							// CLASSVIEW-903   CLASSVIEW-899   CLASSVIEW-909
							if(eBookEnvironment.currLandScapePageNo >=  eBookEnvironment.maxLandScapePageNo || (eBookEnvironment.currLandScapePageNo+2) > eBookEnvironment.maxLandScapePageNo  ){
								$(".ebook_next_button").addClass("disabled")
								// CLAS-1090 start
								$(".ebook_next_button").attr("aria-disabled","true");
								// CLAS-1090 end
							}	
							if(eBookEnvironment.currLandScapePageNo <= 1 || (eBookEnvironment.currLandScapePageNo - 2) < 1){
								$(".ebook_previous_button").addClass("disabled")
								// CLAS-1090 start
								$(".ebook_previous_button").attr("aria-disabled","true");
								// CLAS-1090 end
							}	
						
						}
					}
				}
			},
			focus: function(event){
				$('.ebook_next_button').tooltip();
			}
		})

		
		/* trigger click event on enter or space*/
		$('#BackToLibrary,#btnTOC,#btnFontResize,.highlights,.zoom1,.zoom2,.zoom3,#btnLanguage,#translateMenu li,#imgNotes,#leftAudioStop,.textToHelpMenuButtons,#btnSaveNote,#cancelBtn,#btnTOCList,#btnNotesList,#notesOrderedList li,.audio_block,.thss-dialog-popupClose').off('keydown').on('keydown', function(e){ 
			triggerClickOnThisElemApp(e, this);
			 //ILIT-5334
			 if($(e.target).hasClass("valid-activity")){
				callLogUserActivity(e);
			}
			if($(e.target).is($('.textToHelpMenuButtons'))){
				if($('.thss-dialog-toolbarPopup').is(':visible')){
						$('.thss-dialog-toolbarPopup .thss-dialog-popupClose').focus();
					}					
			
				/*key 'a' is used to open the annotation pen if any paragraph/word is selected*/
				if(e.keyCode==65){
					//if any paragraph/word is selected
					if($("#rangeText").length) {
						$("#btnTextHighlight").trigger("click");
					}
				}					
			}

			/*remove any visible popup when ESC is pressed*/
			if(e.keyCode == 27){  
				$('.highlight').removeClass('highlight');
				if(_lastFocusedElem.length>0)
					_lastFocusedElem.focus();
				$('#textToHelpMenu,#textToHelpMenu .textToHelpMenuButtons,#textToHelpMenu .sep').hide();
				$('#menuLanguage,#menuFontResize,.thss-dialog-toolbarPopup,#InfoContent').hide();
				$('.zooms').attr('aria-hidden',"true" ).hide();
				$('#btnLanguage,#btnFontResize,#infoBtn').attr({'aria-expanded':"false"});
			}
			
		}); 

		/*font resize popup closes when focus moves from Aa button and its various font buttons*/
		$('#btnLanguage, #infoBtn').on('focus',function(e){ 
			$('#menuFontResize').hide();
			$('.zooms').attr('aria-hidden',"true" ).hide();
			$('#btnFontResize').attr({'aria-expanded':"false"});
			$('#btnFontResize').removeClass('active');
		});
		/*Info popup closes when focus moves from i button*/
		$('#BackToLibrary,#btnTOC, #btnFontResize').on('focus',function(e){ 
			var _target = e.target;
			if(_target.id!='BackToLibrary'){
				$('#BackToLibrary').tooltip("close")
			}
			if(_target.id!='btnTOC'){
				$('#btnTOC').tooltip("close")
			}
			$('#InfoContent').hide();
			$('#infoBtn').attr({'aria-expanded':"false"});
		});

		/*Language popup closes when focus moves from translate button and its languages buttons*/
		$('#btnFontResize,#leftPageWrap').on('focus',function(e){
			$('#menuLanguage').hide();
			$('#btnLanguage').attr({'aria-expanded':"false"}).removeClass('active');	
		});

		$('#languagesList ul li:last').off('keydown').on('keydown',function(e){
			if(e.keyCode == 9){
				$('#menuLanguage').hide();
				$('#btnLanguage').attr({'aria-expanded':"false"}).removeClass('active');
			}
			if(e.shiftKey && e.keyCode == 9){
				$('#menuLanguage').show();
			}
		})

	}

}

accessibility.init();

//Accessibility for texthelp toolbar
var textHelpAccessibility = function() {
	$('.thss-dialog-toolbarPopup').attr({'aria-live':'polite', 'role':'dialog'});
	$('.thss-dialog-toolbarPopup').css({'z-index':'20000'});
	$('.thss-dialog-popupClose').attr({'tabindex':"0",'aria-label':'close','role':'button'});
	$('.thss-dialog-speakercontent').attr({'tabindex':"0",'aria-label':'play word','role':'button'});
	//ILIT-5457
	$('.thss-dialog-speakercontent').addClass('valid-activity');
	$('.thss-dialog-popupClose').addClass('valid-activity');
	var dialogCloseBtn = $(".thss-dialog-toolbarPopup:visible").find(".thss-dialog-popupClose"),
		endPlayBtn = $(".thss-dialog-toolbarPopup:visible").find(".thss-dialog-speakercontent").last() ;
		dialogCloseBtn.off('keydown').on('keydown',function(objEvent){
			handleTab(objEvent, $(this), $(this), endPlayBtn);
		});
		endPlayBtn.off('keydown').on('keydown',function(objEvent){
			handleTab(objEvent, $(this), dialogCloseBtn, $(this));
		});
}

/**
 * @param {JSON object} content
 * @returns {JSON object || null}
 */
//To replace href values of anchor(<a>) tag
function replaceHrefValues(content) {
	var str = null;
	try {
		str = JSON.stringify(content);
		str = str.replace(/href='(.*?)'/g, function() { return "href='#'";});
		str = JSON.parse(str);
	} catch (error) {
		console.log(error);
	} finally {
		return str;
	}
}