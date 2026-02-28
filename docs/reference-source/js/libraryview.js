//  ###########################
//  Library Header View: To Display Header Area Of Student Libray
//  ###########################

/* 
 * Student Library Header View JS
 */
function LibraryHeaderView() {

}

LibraryHeaderView.model = null;
LibraryHeaderView.template = null;
LibraryHeaderView.SearchKeyText = null;
LibraryCarouselView.pageLoad = true;
LibraryCarouselView.setCarouselFocus = false; //holds flag to allow focus on middle book
LibraryCarouselView.arrCategory = null;
LibraryCarouselView.ActiveTab = 'all';
LibraryCarouselView.reviewActiveTab = "allStudent";
LibraryCarouselView.libraryProgress = null;
LibraryHeaderView.mainContainerHtml = null;
LibraryHeaderView.reserveBook = [];/*resrveBook List*/
LibraryHeaderView.confirmationPopUp = new ISeriesBase();/*alert popup object*/
LibraryHeaderView.shuffleFlag = true;
LibraryHeaderView.booksLoadCarousel = 0;
LibraryHeaderView.booksLoadCarouselDirection = "";
LibraryCarouselView.middlePointer = 8;
LibraryCarouselView.middlePointerIndex = 0;
LibraryCarouselView.initialLoad = 0;
LibraryCarouselView.currrentView='gridView';
LibraryCarouselView.myLevelBooks = {};
LibraryCarouselView.bookReviewComments = {
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
LibraryCarouselView.refreshAfterCrouselMove = false;
LibraryCarouselView.prevFocusedElement = '';

//constants for ARIA LABEL
var ARIA_LBL = {
    "SLIDER_HEADER_BOY":"Welcome to iLit - Reader Survey, iLit would like to know more about you in order to provide books best suited to your individual interests. Reading is to the mind what exercise is to the body - Joseph Addison.",
    "SLIDER_HEADER_MOY":"Just checking in - Reader Survey, iLit is following up to see how your reading interests may have changed so far this year . The more you read the more you know. The More you know the smarter you grow. - Dr. Seuss",
    "SLIDER_HEADER_EOY":"Final check - Reader Survey, iLit is following up to see how your reading interests may have changed throughout the year . Write to be understood, speak to be heard, Read to grow. - Lawrence Clark Powell",
    "SLIDER_NEXT_BUTTON_2":"NEXT.",
    "SLIDER_NEXT_BUTTON_3":"Click enter to go into next slide.",  
    "SLIDER_4DROPPED":"Click enter to move into interest area",
    "DROPPED":"DROPPED"  
};

var ARIA_ASSISTIVE_TEXT = {
	"ENABLED" : "Enabled",
	"DISABLED" : "Disabled",
	"PRESSED" : "Pressed",
	"BUTTON" : "Button",
	"SELECTED" : "Selected",
	"BOOK_BY_AUTHOR" : "Book by Author",
	"CAROUSEL_TITLE" : "Library Carousel"
}

/**
 * Library Header init
 * @param {Object} model 
 */
LibraryHeaderView.init = function (model) {
    this.arrCategory = [
        {
            category_id: 13,
            category_name: 'Mystery',
            category_name_singular: 'Mystery'
        },
        {
            category_id: 7,
            category_name: 'Fiction',
            category_name_singular: 'Fiction'
        },
        {
            category_id: 1,
            category_name: 'Action and Adventure',
            category_name_singular: 'Action and Adventure'
        },
        {
            category_id: 2,
            category_name: 'Adapted Texts',
            category_name_singular: 'Adapted Text'
        },
        {
            category_id: 3,
            category_name: 'Animals',
            category_name_singular: 'Animal'
        },
        {
            category_id: 4,
            category_name: 'Biographies',
            category_name_singular: 'Biography'
        },
        {
            category_id: 5,
            category_name: 'Cultures',
            category_name_singular: 'Culture'
        },
        {
            category_id: 6,
            category_name: 'Drama',
            category_name_singular: 'Drama'
        },
        {
            category_id: 8,
            category_name: 'Food',
            category_name_singular: 'Food'
        },
        {
            category_id: 9,
            category_name: 'History',
            category_name_singular: 'History'
        },
        {
            category_id: 10,
            category_name: 'Horror',
            category_name_singular: 'Horror'
        },
        {
            category_id: 11,
            category_name: 'Humor',
            category_name_singular: 'Humor'
        },
        {
            category_id: 12,
            category_name: 'Music',
            category_name_singular: 'Music'
        },
        {
            category_id: 14,
            category_name: 'Nonfiction',
            category_name_singular: 'Nonfiction'
        },
        {
            category_id: 15,
            category_name: 'Picture Texts',
            category_name_singular: 'Picture Text'
        },
        {
            category_id: 16,
            category_name: 'Poetry',
            category_name_singular: 'Poetry'
        },
        {
            category_id: 17,
            category_name: 'Romance',
            category_name_singular: 'Romance'
        },
        {
            category_id: 18,
            category_name: 'Science',
            category_name_singular: 'Science'
        },
        {
            category_id: 19,
            category_name: 'Science Fiction',
            category_name_singular: 'Science Fiction'
        },
        {
            category_id: 20,
            category_name: 'Space',
            category_name_singular: 'Space'
        },
        {
            category_id: 21,
            category_name: 'Sports',
            category_name_singular: 'Sport'
        },
        {
            category_id: 22,
            category_name: 'Thrillers',
            category_name_singular: 'Thriller'
        },
        {
            category_id: 23,
            category_name: 'Travel',
            category_name_singular: 'Travel'
        }
    ];

    var $model = {arrCategory: _(this.arrCategory).sortBy("category_name"), 'activeTab': LibraryCarouselView.ActiveTab, 'reviewActiveTab': LibraryCarouselView.reviewActiveTab, searchText: LibraryHeaderView.SearchKeyText, 'viewType': objLibraryJsonData.viewType, 'productCode': objLibraryJsonData.productCode ? objLibraryJsonData.productCode : GENERAL.c_s_SPECIAL_CHARACTERS_BLANK};
    //LibraryHeaderView.model = typeof model === 'undefined' ? $model : model;//model;
    LibraryHeaderView.model = $model;//model;


    LibraryHeaderView.template = _.template($("#" + LIBRARY.c_s_HEADER_TEMPLATE).html());

    LibraryHeaderView.render();
    LibraryHeaderView.bindEvent();

   //ILIT-1247 : disable browser back button 
	disableBrowserBackButton();
};

/**
 *switch constants based upon product environment
 *ILIT-1094
 */
LibraryHeaderView.switchEnvConst = function(){

	//switch Interest Inventory Constants for MOY and EOY timeframe and Interest Inventory draggable Items for QA
	$.nativeCall({
		'method': 'GetAppProductDetailsInfo',
		'globalResource': 'objProductDetailJsonData',
		'checkSuccess':	function (poServiceResponse) {
			return poServiceResponse.productCode != undefined;
		},
		'onComplete': function () {
			if(objProductDetailJsonData.environment == "Q"){
				LIBRARY.c_s_INTEREST_INVENTORY_DRAGABLE.ITEMS
					.push.apply(LIBRARY.c_s_INTEREST_INVENTORY_DRAGABLE.ITEMS, LIBRARY.c_s_INTEREST_INVENTORY_DRAGABLE_QA.ITEMS);
				LIBRARY.c_i_MOY_TIMEFRAME = LIBRARY.c_i_MOY_TIMEFRAME_QA;
				LIBRARY.c_i_EOY_TIMEFRAME = LIBRARY.c_i_EOY_TIMEFRAME_QA;
			}
		}
	});
	
}


/**
 * Library GetUserSettings Call 
 */

LibraryHeaderView.getInterestInventoryInfoStatus = function () {
   /* if (LibraryCarouselView.libraryProgressSummary.Content["InterestInventoryInfoProvided"] == "Y") {
        return;
    }
   */
	LibraryHeaderView.switchEnvConst();
	//new changes to above for insterest inventory
	if (LibraryCarouselView.libraryProgressSummary.Content["InterestInventoryInfoProvided"] == "E") {
        return;
    }
	 InventoryView.init();
}

/**
 * Library Header render 
 */
LibraryHeaderView.render = function () {

    $("#" + LIBRARY.c_s_HEADER_CONTAINER).html(LibraryHeaderView.template(LibraryHeaderView.model));
    if (LibraryHeaderView.SearchKeyText === null) {
        //  Hide Search Dropdown
        $(".search_bar").hide();
    } else {
        $('#searchBox').val(LibraryHeaderView.SearchKeyText);
        $(".search_bar").show();
    }

    if ($(".sliderWrap").length) {
        $('#changeView').addClass('list_view').removeClass('grid_view');
    } else {
        $('#changeView').addClass('grid_view').removeClass('list_view');
    }

    $(".category_suggestion").hide();
    // CLAS-1074 start accessibility
	$(parent.document).find("#wrapperFrame").attr({ //Frames must have title or aria-label attribute
		// "aria-label" : "Library",
	 	"title" : "Library"
	});
	// CLAS-1074 end accessibility

};

/**
 * Bind Necessary Header Events
 * 
 */
LibraryHeaderView.bindEvent = function () {


    //---------------------------ILIT-5334---------------------------//   
   
    //searchbox typing
    // $('#searchBox').off('change').on('change', function (e){
    //     //ILIT-5334
    //     if($(e.target).hasClass("valid-activity")){
    //         callLogUserActivity(e);
    //     }
    // }) 

    /******** ILIT-5334 && ILIT-5569 ********/
	var updateLayout = _.debounce(function(e) {
		//ILIT-5334 && ILIT-5569
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
        }
    },2000); 
    
    $("#searchBox").on('keydown',updateLayout);


    /******** ILIT-5334 ********/

     //scrolling
    $('.slider_thums').scroll(function(e) {
        clearTimeout($.data(this, 'scrollTimer'));
        $.data(this, 'scrollTimer', setTimeout(function() {

            //ILIT-5334        
            if($(e.target).hasClass("valid-activity")){
                callLogUserActivity(e);
            }
          
        }, 250));
    });
    
  //--------------------------- END ILIT-5334---------------------------// 


    // Display Search Box
    $('.search')
            .off('click')
            .on('click', function () {

                $(".category_suggestion").hide(1);
                if ($("#popDropDown").hasClass('active')) {
                    $("#popDropDown").removeClass('active');
                }

                if ($(".search_bar").is(':visible')) {
                    $(".search_bar").slideUp();
                } else {
                    $(".search_bar").slideDown();
					$("#searchBox").focus();
                }
//        if($(".search_bar").is(':visible')) {
//           $(".search_bar").slideUp(200, function () {
//                $(".category_suggestion").slideUp();
//           });
//        } else {
//            $(".search_bar").slideDown(100, function () {
//                $(".category_suggestion").slideDown();
//            });
//        }
            });

    //  Poplate Category List
    $('#popDropDown').off('click').on('click', function (e) {
        
        //ILIT-5334
			if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
				callLogUserActivity(e); 
			}

        if ($(".category_suggestion").is(':visible')) {
            $('#popDropDown').removeClass('active');
            $(".category_suggestion").slideUp();
        } else {
            $('#popDropDown').addClass('active');
            $(".category_suggestion").slideDown();
        }
    });

    // Toggle List/Carousel View
    $('#changeView')
            .off('click')
            .on('click', function (e) {

                LibraryHeaderView.SearchKeyText = null; //  Set Any Search Keyword To Null If View Change

                if ($(".search_bar").is(':visible')) {
                    $(".search_bar").slideUp(1);
                }

                if ($(this).hasClass('list_view')) {
                    //updateLibraryView(LIBRARY.c_s_LIST_VIEW);
                    Application.init(VIEWTYPE.c_s_LISTVIEW);
                    $('#changeView').addClass('grid_view').removeClass('list_view');
                } else if ($(this).hasClass('grid_view')) {
                    //updateLibraryView(LIBRARY.c_s_CAROUSEL_VIEW);
                    Application.init(VIEWTYPE.c_s_CAROUSEL);
                    $('#changeView').addClass('list_view').removeClass('grid_view');
                }

                LibraryCarouselView.resize();

                //ILIT-5334
                if($(e.target).hasClass("valid-activity")){
                    callLogUserActivity(e);                   
                }
            });

    /**
     * Tab Change
     */
    $(".tabbing button").off('click').on('click', function (e) {
     if (!$(this).hasClass('active')) {

        //ILIT-5334
        if($(e.target).hasClass("valid-activity")){
            callLogUserActivity(e);
       
        }


          //  oUtility.hideCustomLoader();
            oUtility.showLoader({
                'message': '<img src="media/loader.gif" alt="" />',
                'background-color': '#fff',
                'click-to-hide': false,
                'opacity': 0.5
            });
            $(".tabbing button").removeClass('active').attr("aria-pressed",false);
            $(this).addClass('active').attr("aria-pressed",true);
            var _lastActiveButton = LibraryCarouselView.ActiveTab;
            LibraryCarouselView.ActiveTab = $(this).attr('data-text');
            if (LibraryCarouselView.ActiveTab === 'myLevel') {
                LibraryCarouselView.getMyLevel();
            }
            else if (LibraryCarouselView.ActiveTab === 'myRead') {
                LibraryCarouselView.getMyRead(_lastActiveButton);
            }
            else if ((LibraryCarouselView.ActiveTab === 'recommended')) {
                   $.nativeCall({
                    'method': 'GetRecommendedBooks',
                    'globalResource': 'objrecommendationListData',
                    'onComplete': function () {
                         LibraryCarouselView.init();
                    }
                });
             }
             else if ((LibraryCarouselView.ActiveTab === 'reviewed')) {
                 $.nativeCall({
                    'method': 'GetUserFeedbackforAllBooks',
                    'globalResource': 'objGetUserFeedbackforAllBooksData',
                    'onComplete': function () {
                         LibraryCarouselView.init();
                    }
                });
             }
            else if ((LibraryCarouselView.ActiveTab === 'reserved')) {
                objReserveListData = null;
                $.nativeCall({
                    'method': 'GetListOfReservedBooks',
                    'globalResource': 'objReserveListData',
                    'onComplete': function () {
                        LibraryHeaderView.reserveBook = objReserveListData.Content;
                        LibraryCarouselView.init();
                    }
                });
            }
            else if (LibraryCarouselView.ActiveTab === 'all') {
                if ($(".search_bar").is(':visible')) {
                    var _searchText = $.trim($("#searchBox").val());
                    if (_searchText != '') {
                        var isCategory = _.filter(LibraryHeaderView.arrCategory, function (obj) {
                            if (obj.category_name == _searchText || obj.category_name_singular == _searchText) {
                                return obj;
                            }
                        });

                        if (isCategory.length) {
                            $(".suggestion_drop[data-id='" + isCategory[0].category_id + "']").trigger('click');
                        } else {
                            var evnt = $.Event("keypress");
                            evnt.which = 13;
                            evnt.keyCode = 13;
                            $("#searchBox").trigger(evnt);
                        }
                        return false;
                    }
                }

                if ($("#changeView").hasClass('list_view')) {
                    LibraryCarouselView.init();
                } else if ($("#changeView").hasClass('grid_view')) {
                    LibraryListView.init();
                }
            }
        }
    });
	
	//allows left right arrow keys to navigate on tabs
	$(".tabbing button").off('keydown').on('keydown', function (e) {
		 var keyCode = e.keyCode || e.which,
		  arrow = {right:39, left:37};
		 
		 var aTabs = [];
		 $(".tabbing button").each(function(){
			 aTabs.push(this);
		 });
		 var currentIndex = aTabs.indexOf(this);
		 switch (keyCode) {
		  case arrow.left:
		  if(currentIndex < 0){ return}
			var prevItem = aTabs[currentIndex-1];
			$(prevItem).focus();
		  break;
		  
		  case arrow.right:
		   if(currentIndex > aTabs.length){ return}
			var nextItem = aTabs[currentIndex+1];
			$(nextItem).focus();
		  break;
		 }
	});

    $(".slider_text_conta ul li").off('click').on('click', function () {
        LibraryCarouselView.reviewActiveTab = $(this).attr('data-text');
        LibraryCarouselView.init();
    });
	
	 $(".slider_text_conta ul li").off('keydown').on('keyup', function (e) {
        triggerClickOnThisElemApp(e, $(this));
    });

    //  Search Option Selection    
    LibraryCarouselView.filterBooks();
};


//  ###########################
//  Library Carousel View: To Display List of Books in carousel mode
//  ###########################

/* 
 * Library Carousel View JS
 */
function LibraryCarouselView() {

}

LibraryCarouselView.model = null;
LibraryCarouselView.template = null;
LibraryCarouselView.arrAllBooks = null;
LibraryCarouselView.arrEpub = null;
LibraryCarouselView.arrPdf = null;
LibraryCarouselView.metaData = null;
LibraryCarouselView.iBookLength = null;
LibraryCarouselView.currentReading = '';
LibraryCarouselView.StudentRataBook = '';
LibraryCarouselView.isAnimationInProgress = false;


/**
 * Library Carousel init
 * @param {type} model
 * @returns {LibraryCarouselView.init}
 */
LibraryCarouselView.preInit = function (model) {
    this.bPageLaunched = true;
    this.myLevelClicked = true;
    this.metaData = _.pluck(objBookList.bookset, 'categorylist')[0];
    this.arrAllBooks = _.values(_.omit(objBookList.bookset[0], 'categorylist')); //, {file_type: "epub"}
    
    //CLAS-821
    if (typeof objSupressBookTitle !== 'undefined') {
        this.arrAllBooks = this.arrAllBooks.filter(book => !objSupressBookTitle.includes(book.book_id));
    }
    //End of CLAS-821
    
    //this.arrEpub = _.where(this.arrAllBooks, { file_type: "epub" });
    this.iBookLength = Object.keys(this.arrAllBooks).length;
   
	//ILIT-5099[firefox issue]
    this.arrEpub = [];  
    for(var k in this.arrAllBooks){
        if(this.arrAllBooks[k] && this.arrAllBooks[k].file_type == 'epub'){	     
            this.arrEpub.push(this.arrAllBooks[k]);				   
        }
    }
  
    /* if (objLibraryJsonData.productCode.match(GENERAL.c_s_ILIT_20)) { */
    // if (LibraryHeaderView.shuffleFlag) {
    // this.arrAllBooks = (this.iBookLength > 0) ? _.shuffle(this.arrAllBooks) : this.arrAllBooks;
    //LibraryHeaderView.shuffleFlag = false;
    //}

    /* } */
}
LibraryCarouselView.init = function (model) {  
    // CLAS-1062 start 
    var base = window.parent.document.title.split(" - ")[0];
    window.parent.document.title = base+" - Library";
    // CLAS-1062 end
    if (!oPlatform.isAndroid()) {
        HideNativeBottomBar(false);
    }
    var searchText = null;
    if (typeof model == 'undefined') {

        if (LibraryCarouselView.ActiveTab == 'all') {
             arrTotalBooks = this.arrAllBooks.slice(LibraryHeaderView.booksLoadCarousel, LibraryHeaderView.booksLoadCarousel + 15);
        } else if (LibraryCarouselView.ActiveTab == 'myRead') {
            arrTotalBooks = LibraryCarouselView.myReadFilter();
        }
        else if (LibraryCarouselView.ActiveTab == 'reserved') {
            arrTotalBooks = LibraryCarouselView.getReservedBooks();
        }
        else if (LibraryCarouselView.ActiveTab == 'reviewed') {
            arrTotalBooks = LibraryCarouselView.getReviewedBooks(this.reviewActiveTab);
        }
        else if (LibraryCarouselView.ActiveTab == 'recommended') {
            arrTotalBooks = LibraryCarouselView.getRecommendedBooks();
        }
        else if (LibraryCarouselView.ActiveTab == 'myLevel') {
            var iCnt = 0;
            arrTotalBooks = [];//_.where(this.arrAllBooks, {lexile_level: objUserLevel.Content.LexileLevel});
            var _books = this.arrAllBooks;   //  , {file_type: "epub"}
			
			/* changes for wtw */
			var bProductIsWTW = false,
				userLexileLevelForWTW = 0;
			if(objLibraryJsonData.productCode.match(GENERAL.c_s_PROD_TYPE_WTW)) {
				bProductIsWTW = true;
				userLexileLevelForWTW = (parseInt(objUserLevel.Content.LexileLevel)===0) ? 640 : parseInt(objUserLevel.Content.LexileLevel);
            
			}
			/* end changes for wtw */
			
			//var _books =  LibraryCarouselView.myLevelBooks;
            /*  _.filter(_books, function (obj) {                //LibraryCarouselView.arrAllBooks//
             if (obj.lexile_level !== null && obj.lexile_level >= (parseInt(objUserLevel.Content.LexileLevel) - 25) && obj.lexile_level <= (parseInt(objUserLevel.Content.LexileLevel) + 25)) {
             arrTotalBooks[iCnt++] = obj;
             }
             }); */
			 //console.log(this.arrAllBooks);
			
			for (var iI in _books) {
				/* changes for wtw incorporated into 'if' condition for userLexileLevelForWTW if product is wtw*/
                if (
					_books[iI].lexile_level !== null && 
					_books[iI].lexile_level >= ((bProductIsWTW ? userLexileLevelForWTW : parseInt(objUserLevel.Content.LexileLevel)) - 25) && 
					_books[iI].lexile_level <= ((bProductIsWTW ? userLexileLevelForWTW : parseInt(objUserLevel.Content.LexileLevel)) + 25)
				) {
                    arrTotalBooks[iCnt++] = _books[iI];
                }
            }
        }

        var cnt = 0;
        searchText = ($.trim($("#searchBox").val()) == '') ? null : $.trim($("#searchBox").val());
        if (searchText != null) {
            var arrBooks = {};
            var toLowerSearchText = searchText.toLowerCase();
            var objSingularTermSearchKey = _.where(LibraryHeaderView.arrCategory, {category_name: searchText});
            var singularTermSearchKey = (objSingularTermSearchKey.length != 0) ? objSingularTermSearchKey[0].category_name_singular.toLowerCase() : null;

            for (var iI in arrTotalBooks) {

                _temp = 0;
                var _bookGenre = (typeof arrTotalBooks[iI].book_genre == 'undefined') ? null : arrTotalBooks[iI].book_genre.toLowerCase();
                var _bookCategoryName = (typeof arrTotalBooks[iI].category_name == 'undefined') ? null : arrTotalBooks[iI].category_name.toLowerCase();
                var _authorName = (typeof arrTotalBooks[iI].author_name == 'undefined') ? null : arrTotalBooks[iI].author_name.toLowerCase();
                var _bookTitle = (typeof arrTotalBooks[iI].book_title == 'undefined') ? null : arrTotalBooks[iI].book_title.toLowerCase();

                if (_bookGenre !== null && _bookGenre.indexOf(toLowerSearchText) >= 0) {
                    arrBooks[cnt++] = arrTotalBooks[iI];
                    _temp = 1;
                } else if (_bookCategoryName !== null && _bookCategoryName.indexOf(toLowerSearchText) >= 0) {
                    arrBooks[cnt++] = arrTotalBooks[iI];
                    _temp = 1;
                } else if (_authorName !== null && _authorName.indexOf(toLowerSearchText) >= 0) {
                    arrBooks[cnt++] = arrTotalBooks[iI];
                    _temp = 1;
                } else if (_bookTitle !== null && _bookTitle.indexOf(toLowerSearchText) >= 0) {
                    arrBooks[cnt++] = arrTotalBooks[iI];
                    _temp = 1;
                }


                //  Search For Singular Term
                if (singularTermSearchKey != null && toLowerSearchText != singularTermSearchKey && _temp == 0) {
                    if (_bookGenre !== null && _bookGenre.indexOf(singularTermSearchKey) >= 0) {
                        arrBooks[cnt++] = arrTotalBooks[iI];
                    } else if (_bookCategoryName !== null && _bookCategoryName.indexOf(singularTermSearchKey) >= 0) {
                        arrBooks[cnt++] = arrTotalBooks[iI];
                    } else if (_authorName !== null && _authorName.indexOf(singularTermSearchKey) >= 0) {
                        arrBooks[cnt++] = arrTotalBooks[iI];
                    } else if (_bookTitle !== null && _bookTitle.indexOf(singularTermSearchKey) >= 0) {
                        arrBooks[cnt++] = arrTotalBooks[iI];
                    }
                }

            }
        } else {
            arrBooks = arrTotalBooks;
        }

        LibraryHeaderView.SearchKeyText = searchText;
    }


    LibraryCarouselView.model = typeof model === 'undefined' ? {arrBooks: arrBooks, 'activeTab': LibraryCarouselView.ActiveTab, 'LibraryHeaderView.reserveBook': LibraryHeaderView.reserveBook, 'reviewActiveTab': LibraryCarouselView.reviewActiveTab} : {arrBooks: model, 'activeTab': LibraryCarouselView.ActiveTab, 'LibraryHeaderView.reserveBook': LibraryHeaderView.reserveBook, 'reviewActiveTab': LibraryCarouselView.reviewActiveTab};


    GetCurrentBookForStudent();
    setTimeout(function () {
        LibraryCarouselView.getCurrentReading();
    }, 400);
};

LibraryCarouselView.getReservedBooks = function () {

    var aBooksReserved = [];
    for (var iJ = 0; iJ < LibraryHeaderView.reserveBook.length; iJ++) {
        for (iK in objBookList.bookset[0]) {
            if (LibraryHeaderView.reserveBook[iJ] == objBookList.bookset[0][iK]['book_id']) {
                aBooksReserved.push(objBookList.bookset[0][iK]);
            }
        }
    }


    return aBooksReserved;
};
LibraryCarouselView.getRecommendedBooks = function () {

          if((typeof objrecommendationListData != "undefined") && (objrecommendationListData !== null)){
             var data = objrecommendationListData.Content;
            var oSelf = (data.length > 0) ? _.filter(LibraryCarouselView.arrAllBooks, function (val) {
                return _.some(this, function (val2) {
                    return val2.CMSItemID === val['book_id'];
                });
            }, data) : [];

            oSelf = _.reject(oSelf, function (val) {
                return (($.inArray(val['book_id'], objLibraryProgressSummary.Content.BookCompletedItemIDs) !== -1) || ((typeof LibraryCarouselView.currentReading[0] !== "undefined") ? val['book_id'] === LibraryCarouselView.currentReading[0].book_id : false) || ($.inArray(val['book_id'], LibraryHeaderView.reserveBook) !== -1));
            });

             return oSelf;
     }
  }
LibraryCarouselView.getReviewedBooks = function (val) {
    var data = objGetUserFeedbackforAllBooksData.Content;
    var arrBooks = [];
    var arrCount = 0;

    for (key in this.arrAllBooks) {
        for (var j = 0, arrData = data.length; j < arrData; j++) {
            if (data[j].CMSITemID === this.arrAllBooks[key]['book_id']) {
                arrBooks[arrCount] = this.arrAllBooks[key];
                arrBooks[arrCount]["gBanbdRate"] = data[j].GradeBandAvgRating;
                arrBooks[arrCount]["GradeLevelAvgRating"] = data[j].GradeLevelAvgRating;
                arrBooks[arrCount]["GlobalAvgRating"] = data[j].GlobalAvgRating;
                arrCount++;
            }
        }
    }


    var oSelf, filterBooks = [];
    switch (val) {
        case "myLevel":
            {
				/* changes for wtw */
				var bProductIsWTW = false,
					userLexileLevelForWTW = 0;
				/* end changes for wtw */
                if (objLibraryJsonData.productCode.match(GENERAL.c_s_ILIT_20)) {
                    oSelf = arrBooks.sort(function (a, b) {
                        return parseFloat(b.gBanbdRate) - parseFloat(a.gBanbdRate);
                    });
                }
				/* ILIT-1668 changes for wtw */
				else if(objLibraryJsonData.productCode.match(GENERAL.c_s_PROD_TYPE_WTW)) {
					bProductIsWTW = true;
					userLexileLevelForWTW = (parseInt(objUserLevel.Content.LexileLevel)===0) ? 640 : parseInt(objUserLevel.Content.LexileLevel);
					oSelf = arrBooks.sort(function (a, b) {
                        return parseFloat(b.GlobalAvgRating) - parseFloat(a.GlobalAvgRating);
                    });
				}
				/* end changes for wtw */
                else {
                    oSelf = arrBooks.sort(function (a, b) {
                        return parseFloat(b.GlobalAvgRating) - parseFloat(a.GlobalAvgRating);
                    });
                }
                /* oSelf = _.filter(oSelf, function (obj) {
                 return (obj.lexile_level !== null && obj.lexile_level >= (parseInt(objUserLevel.Content.LexileLevel) - 100) && obj.lexile_level <= (parseInt(objUserLevel.Content.LexileLevel) + 100));
                 }); */
				
				for (var iI = 0; iI < oSelf.length; iI++) {
					/* changes for wtw incorporated into 'if' condition for userLexileLevelForWTW if product is wtw*/
					if (
						oSelf[iI].lexile_level !== null && 
						oSelf[iI].lexile_level >= ((bProductIsWTW ? userLexileLevelForWTW : parseInt(objUserLevel.Content.LexileLevel)) - 100) && 
						oSelf[iI].lexile_level <= ((bProductIsWTW ? userLexileLevelForWTW : parseInt(objUserLevel.Content.LexileLevel)) + 100)
					) {
						filterBooks.push(oSelf[iI]);
					}
				}
				
                oSelf = filterBooks;
            }
            break;
        case "allStudent":
            {
                 if(objLibraryJsonData.productCode.match(GENERAL.c_s_ILIT_20)){
                        oSelf = arrBooks.sort(function (a, b) {
                            return parseFloat(b.gBanbdRate) - parseFloat(a.gBanbdRate);
                        });
            }
                else{
                    oSelf = arrBooks.sort(function (a, b) {
                    return parseFloat(b.GlobalAvgRating) - parseFloat(a.GlobalAvgRating);
                });
                }
            }
            break;
        case "myGrade":
            {
                if (objLibraryJsonData.productCode.match(GENERAL.c_s_ILIT_20)) {
                    oSelf = arrBooks.sort(function (a, b) {
                        return parseFloat(b.GradeLevelAvgRating[objLibraryJsonData.targetGradeCode]) - parseFloat(a.GradeLevelAvgRating[objLibraryJsonData.targetGradeCode]);
                    });
                    oSelf = oSelf.filter(function (el) {
                        return _.find(el.GradeLevelAvgRating, function (v, k) {
                            return (k == objLibraryJsonData.targetGradeCode && k != "");
                        });
                    });
                }
				/* ILIT-1668 changes for wtw : 'g4' for objLibraryJsonData.targetGradeCode will be considered for wtw*/
				else if(objLibraryJsonData.productCode.match(GENERAL.c_s_PROD_TYPE_WTW)) {
					oSelf = arrBooks.sort(function (a, b) {
                        return parseFloat(b.GradeLevelAvgRating['g4']) - parseFloat(a.GradeLevelAvgRating['g4']);
                    });
                    oSelf = oSelf.filter(function (el) {
                        return _.find(el.GradeLevelAvgRating, function (v, k) {
                            return (k == 'g4' && k != "");
                        });
                    });
				}
				/* end changes for wtw */
                else {
                    oSelf = arrBooks.sort(function (a, b) {
                        return parseFloat(b.GradeLevelAvgRating[objLibraryJsonData.gradeId]) - parseFloat(a.GradeLevelAvgRating[objLibraryJsonData.gradeId]);
                    });
                    oSelf = oSelf.filter(function (el) {
                        return _.find(el.GradeLevelAvgRating, function (v, k) {
                            return (k == objLibraryJsonData.gradeId && k != "");
                        });
                    });
                }

            }
            break;
    }
    ;
    oSelf = _.reject(oSelf, function (val) {
        return (($.inArray(val['book_id'], objLibraryProgressSummary.Content.BookCompletedItemIDs) !== -1) || ((typeof LibraryCarouselView.currentReading[0] !== "undefined") ? val['book_id'] === LibraryCarouselView.currentReading[0].book_id : false) || ($.inArray(val['book_id'], LibraryHeaderView.reserveBook) !== -1));
    });
    return oSelf.slice(0, 5);
};



LibraryCarouselView.getCurrentReading = function () {
    if (objCurrentBookForStudent != null) {
        var iCuttentBookId = (objCurrentBookForStudent.Content.mycurrent_book_item_Id == null) ? '' : objCurrentBookForStudent.Content.mycurrent_book_item_Id;
       
//ILIT-5099 [firfox issue]
        var currentBookReading = [],
            allBook = LibraryCarouselView.arrAllBooks;
        
    for(var m in allBook){
            if(allBook[m] && allBook[m].book_id == iCuttentBookId){	    
            currentBookReading.push(allBook[m]);	
    }
}

        

        LibraryCarouselView.currentReading = (typeof iCuttentBookId == "undefined" || iCuttentBookId == '') ? [] :currentBookReading ;//_.where(LibraryCarouselView.arrAllBooks, {book_id: iCuttentBookId});
        LibraryCarouselView.model["currentReading"] = LibraryCarouselView.currentReading;
        LibraryCarouselView.getStudentRataBook();
    } else {
        setTimeout(function () {
            LibraryCarouselView.getCurrentReading();
        }, 400);
    }
	//read current tab when seleted under reviewed tab
	readThis($(".slider_text_conta li.active").attr('aria-label')+ARIA_ASSISTIVE_TEXT.SELECTED);
};

LibraryCarouselView.getStudentRataBook = function () {

    if (objLibraryJsonData.viewType == 'teacher') {
        LibraryCarouselView.template = _.template($("#" + LIBRARY.c_s_CAROUSEL_TEMPLATE).html());
        LibraryCarouselView.render();
        LibraryCarouselView.bindEvent();
        return false;
    }

    if (objLibraryJsonData.viewType == 'student') {
        var iRataBookId = (objCurrentBookForStudent.Content.Ratabook_ItemID == null) ? '' : objCurrentBookForStudent.Content.Ratabook_ItemID;
        //@PDF

        //ILIT-5099 [firfox issue]
        var currentBookReading = [],
         allBook = LibraryCarouselView.arrAllBooks;
     
        for(var m in allBook){
            if(allBook[m] && allBook[m].book_id == iRataBookId){	    
                currentBookReading.push(allBook[m]);	
            }
        }
        LibraryCarouselView.StudentRataBook = (typeof iRataBookId == "undefined" || iRataBookId == '') ? [] : currentBookReading;//_.where(objBookList.bookset[0], {book_id: iRataBookId});
        LibraryCarouselView.model["StudentRataBook"] = LibraryCarouselView.StudentRataBook;

        GetUserLevel();
        LibraryCarouselView.checkForLevel();

    } else {
        setTimeout(function () {
            LibraryCarouselView.getStudentRataBook();
        }, 400);
    }
};

/* Library Carousel render */
LibraryCarouselView.render = function () {

    $("#" + LIBRARY.c_s_MAIN_CONTAINER).html(LibraryCarouselView.template(LibraryCarouselView.model));

    if (objLibraryJsonData.viewType == 'student') {
        $template = _.template($("#studentInformationAreaTemplate").html());
        setInterval(function () {
            LibraryCarouselView.autoUpdateRATABook();
        }, 10000);
    } else {
        $template = _.template($("#teacherInformationAreaTemplate").html());
        var gradedRATABooks = _.uniq(objGradeItemsData.item, function (obj, key, lessonratabookitemID) {
            return obj.lessonratabookitemID;
        });
        var arrGradedRATABooks = _.filter(gradedRATABooks, function (obj) {
            return obj.lessonratabookitemID != ''
        });
        var arrGradedRATABookInfo = [];

        for (var key = 0, j = 0; key < arrGradedRATABooks.length; key++, j++) {
           //objBookInfo = _.where(LibraryCarouselView.arrAllBooks, {book_id: arrGradedRATABooks[key].lessonratabookitemID});
           
           //ILIT-5099 [firefox issue]
            objBookInfo = [];
           for(var k in LibraryCarouselView.arrAllBooks){
               
               if(LibraryCarouselView.arrAllBooks[k] && LibraryCarouselView.arrAllBooks[k].book_id == arrGradedRATABooks[key].lessonratabookitemID){	     
                    objBookInfo.push(LibraryCarouselView.arrAllBooks[k]);				   
               }
           }
      

            if (objBookInfo.length) {
                objExtraBookInfo = {
                    book_title: objBookInfo[0].book_title,
                    book_id: objBookInfo[0].book_id,
                    book_image: objBookInfo[0].book_image,
                    file_type: objBookInfo[0].file_type,
                    book_type: 'R',
                    unitId: arrGradedRATABooks[j].unitNumber
                };
                arrGradedRATABookInfo.push(objExtraBookInfo);
            }
        }
        arrGradedRATABookInfo = _.sortBy(arrGradedRATABookInfo, function (obj) {
            return obj.unitId
        });
        LibraryCarouselView.model["gradedRATABooks"] = arrGradedRATABookInfo;
    }

    $(".bookBoxWrap_out").html($template(LibraryCarouselView.model));

    LibraryCarouselView.renderHeader();

    if(oPlatform.isDevice()){
        var backArrow = $('#backArrow'),
            nextArrow = $('#nextArrow');

            backArrow.attr('tabindex',0);
            backArrow.removeAttr('aria-hidden');
            backArrow.css('display','block');

            nextArrow.attr('tabindex',0);
            nextArrow.removeAttr('aria-hidden');
            nextArrow.css('display','block');
            $('#bookName').attr('tabindex',0); 
            $('#authorName').attr('tabindex',0);
    }
};

LibraryCarouselView.autoUpdateRATABook = function () {

    if (objCurrentRATABook != null) {
        var iRataBookId = (objCurrentRATABook.currentRATABookID == null) ? '' : objCurrentRATABook.currentRATABookID;

        if (typeof iRataBookId == "undefined" || iRataBookId == '') {
            return false;
        }

        //var objRataBook = _.where(objBookList.bookset[0], {book_id: iRataBookId})[0];
        
        //ILIT-5099 [firefox issue]
        for(var k in objBookList.bookset[0]){
            
            if(objBookList.bookset[0][k] && objBookList.bookset[0][k].book_id == iRataBookId){	     
                var objRataBook = objBookList.bookset[0][k];			   
            }
        }
   

        if (Object.keys(objRataBook).length == 0) {
            studentRataBookImg = "";
            studentRataBookId = '';
        }
        else if (typeof objRataBook.book_image == "undefined" || objRataBook.book_image == "") {
            studentRataBookImg = LIBRARY.c_s_NO_COVER_IMAGE;
            studentRataBookId = objRataBook.book_id;
        } else {
            studentRataBookImg = objLibraryJsonData.mediaPath + objRataBook.book_image;
            studentRataBookId = objRataBook.book_id;
        }

        $("#studentRataBook").data({id: studentRataBookId});
        if (objRataBook.book_image != '') {
            if ($("#studentRataBook").find("img").length == 0) {
                $("#wrapperRATA").html('<img src="' + studentRataBookImg + '" alt="Book" />')
            } else {
                $("#studentRataBook").find("img").css('opacity', 1);
                $("#studentRataBook").find("img").attr('src', studentRataBookImg);
            }
        } else {
            $("#studentRataBook").find("img").css('opacity', 0);
        }

        setTimeout(function () {
            LibraryCarouselView.bindPopUpEvent();
        }, 800);
    } else {
        setTimeout(function () {
            LibraryCarouselView.autoUpdateRATABook();
        }, 500);
    }

};

/**
 * Render The Header View 
 * Associate Related Logic Here
 */
LibraryCarouselView.renderHeader = function () {
    //Application.model = LibraryCarouselView.model;
    Application.init(VIEWTYPE.c_s_LIBRARYHEADER);
	
	$(".top_navbar .tabbing button").attr("aria-pressed", false);
	$(".top_navbar .tabbing button.active").attr("aria-pressed", true).focus(); // set initial focus to All titles tab
	/* readAllOnPage('body', function(){
		$(".top_navbar button.active").focus(); // set initial focus to All titles tab
	}); */
};

LibraryCarouselView.bindEvent = function () {

    // Bind Carousel
    LibraryCarouselView.ilitBookShelf();
    LibraryCarouselView.bindPopUpEvent();
    LibraryCarouselView.ExpandSlider();
    LibraryCarouselView.NavigateSlider();
    // Show Book Popup
    //LibraryCarouselView.ShowBookPopup();  
	
	//allow bookpopup open on bookName click / tap
	$("#bookName").off('click tap').on('click tap', function(e){
		LibraryCarouselView.ShowBookPopup(JSON.parse($(this).attr("data-additionalInfo")));
	})

    $('#bookName').off('focus').on('focus',function(){
        var bookName   =  $('#bookName').html();
        readThis("Book Name "+ bookName);
            
    })
    $('#authorName').off('focus').on('focus',function(){
        var authorName =  $('#authorName').html() ;
        readThis("Author Name "+ authorName);
    })
};

LibraryCarouselView.bindPopUpEvent = function () {

    $(".bookBox").off('click').on('click', function (e) {

        //ILIT-5334
        if($(e.target).hasClass("valid-activity")){
           callLogUserActivity(e);
        
        }

        var iBookId = $(this).data().id;

        if (iBookId == '') {
            return false;
        }

        if ($(this).attr('id') == 'currentReadingWrapper'/* || $(this).hasClass('ratabooks') */ /*ILIT-5575 */ ) {
            try {
                //var objBook = _.where(LibraryCarouselView.arrAllBooks, {book_id: iBookId})[0];
                
                //ILIT_5099 [firefox issue]
                for(var k in LibraryCarouselView.arrAllBooks){
                    if(LibraryCarouselView.arrAllBooks[k] && LibraryCarouselView.arrAllBooks[k].book_id == iBookId){	     
                        var objBook = LibraryCarouselView.arrAllBooks[k];				   
                    }
                }
              

                var iBookId = objBook["book_id"];
                var sBookTitle = LibraryCarouselView.removeMetaData(objBook);
				var _DisplayEpubModel = objBook["DisplayEpubModel"] ? objBook["DisplayEpubModel"] : ""; // virtual/physical
                var _BookType = ($(this).data().booktype == "" || typeof $(this).data().booktype == "undefined") ? ((objBook["book_type"] == "R") ? "rata" : "time_to_read") : $(this).data().booktype;
                var _wordCount = (objBook["word_count"] == null || typeof objBook["word_count"] == "undefined") ? 0 : objBook["word_count"];
                var isBroadCast = false;
                var eBookType = 'epub';
                //var _BookNumPage  =   (objBook["no_of_page"] == null || typeof objBook["no_of_page"] == "undefined") ? 0 : objBook["no_of_page"];                
                var _BookNumPage = (objBook[LIBRARY.c_s_BOOK_LIST_JSON_KEY.NUM_PAGE] == '' || objBook[LIBRARY.c_s_BOOK_LIST_JSON_KEY.NUM_PAGE] == null || typeof objBook[LIBRARY.c_s_BOOK_LIST_JSON_KEY.NUM_PAGE] == "undefined") ? 0 : objBook[LIBRARY.c_s_BOOK_LIST_JSON_KEY.NUM_PAGE];
                var _Context = '';
//                if(_BookNumPage == 0) {                    
//                    _BookNumPage   = objBook[LIBRARY.c_s_BOOK_LIST_JSON_KEY.WORD_COUNT] == '' || objBook[LIBRARY.c_s_BOOK_LIST_JSON_KEY.WORD_COUNT] == null ? 0 : (objBook[LIBRARY.c_s_BOOK_LIST_JSON_KEY.WORD_COUNT]/150).toFixed(0);
//                }                
                //SaveData('lastBookRead',iBookId);        
                if (objBook["file_type"] == 'pdf') {     //  If PDF:: Send Call to Native					
                    GetPDFInfo(iBookId, sBookTitle, _BookType, _wordCount, _BookNumPage, _Context, objBook["lexile_level"]);
                    return false;
                }
                //  If Epub::Redirect To Epub Reader
				if(location.hash === '#chromeApp'){
					location.href = LIBRARY.c_s_PLAYER_URL + iBookId + "|||" + sBookTitle + "|||" + _BookType + "|||" + _wordCount + "|||" + isBroadCast + "|||" + eBookType + "|||" + _BookNumPage + "|||" + _Context + "|||" + objLibraryJsonData.productCode + "|||" + objBook["lexile_level"] + "|||" + objLibraryJsonData.classStartDate + "|||"+ _DisplayEpubModel + "|||" + "chromeApp";
				}else{				
					location.href = LIBRARY.c_s_PLAYER_URL + iBookId + "|||" + sBookTitle + "|||" + _BookType + "|||" + _wordCount + "|||" + isBroadCast + "|||" + eBookType + "|||" + _BookNumPage + "|||" + _Context + "|||" + objLibraryJsonData.productCode + "|||" + objBook["lexile_level"] + "|||" + objLibraryJsonData.classStartDate + "|||" + _DisplayEpubModel;
				}
                return false;
            } catch (exp) {
                console.log('Error Occured:: ' + exp);
            }
        } else {
            var objData = {book_id: iBookId};
            LibraryCarouselView.ShowBookPopup(objData);
			LibraryCarouselView.prevFocusedElement = document.activeElement; // save last focussed element so that focus can be restored after popup close
        }
    });

    $(".library_book_cross_sign")
            .on('click tap pointerdown', function (e) {
                oUtility.showLoader({
                    'message': '<img src="media/loader.gif" alt="" />',
                    'background-color': '#fff',
                    'click-to-hide': false,
                    'opacity': 0.5
                });
                $.nativeCall({
                    'method': 'ReserveOrUnreserveBook',
                    'globalResource': 'objReserveUnreserveResponse',
                    'inputParams': [
                        $(this).attr('data-val'),
                        1
                    ],
                    'onComplete': function () {
                        unreserveFunction();
                    }
                });
                e.stopPropagation();
            });



};
var unreserveFunction = function () {
    objReserveListData = null;
    $.nativeCall({
        'method': 'GetListOfReservedBooks',
        'globalResource': 'objReserveListData',
        'onComplete': function () {
            LibraryHeaderView.reserveBook = ((objLibraryJsonData.viewType === 'student')) ? objReserveListData.Content || [] : [];
            oUtility.hideLoader();
            LibraryHeaderView.confirmationPopUp._alert({
                divId: 'dialog-message',
                message: "Book has been removed from Reserved list."
            }, function () {
                /**/
                if ($(".tabbing button.active").hasClass("change")) {
                    $(".tabbing button.active").removeClass("active").trigger("click");
                }
            });
        }
    });

};
LibraryCarouselView.ExpandSlider = function () {
    $(".iconbookpage").off('click').on('click', function (e) {
        //ILIT-5516
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
        //  Reset Navigation
        $(".bookSliderBoxMovable").css({'margin-left': '0px'});
        $(".book_leftarrow").css({'opacity': '0.5'});
        $(".book_rightarrow").css({'opacity': '1'});

        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $("#rataSlider").removeClass('active');
            $(".book_scroll_wrapper.new_book_page_wrap").removeClass("active");
            if ($("#rataSlider").hasClass('multipleRataSlides')) {
                $("#rataSlider").removeClass('multipleRataSlides');
            }
        } else {
            $(this).addClass('active');
            $("#rataSlider").addClass('active');
            $(".book_scroll_wrapper.new_book_page_wrap").addClass("active");

            if ($("#rataSlider").data().numbooks > 5) {
                $("#rataSlider").addClass('multipleRataSlides');
            }
        }
    });
};

LibraryCarouselView.getPreviousBook  = function(){
   var selecElem = LibraryCarouselView.getSelectedBook('prev');

}

LibraryCarouselView.getNextBook = function(){
    var selecElem = LibraryCarouselView.getSelectedBook('next');
    
}

LibraryCarouselView.getSelectedBook = function(type){
    
    var alBookElem =  $('.iLithorizon').find('.bookElement'), 
        iCounter = 0, 
        style='',
        transform='',
        mat='';
    for(var iCounter=0; iCounter<alBookElem.length; iCounter++){
        style = window.getComputedStyle($(alBookElem[iCounter])[0]);	
        transform = style.transform || style.webkitTransform || style.mozTransform,transArr=[];               
        var mat = transform.match(/^matrix\((.+)\)$/);   
            if(mat){                
                if(type=='prev'){                   
                    $(alBookElem[iCounter]).prev().trigger('click');
                }else if(type=='next'){                    
                    $(alBookElem[iCounter]).next().trigger('click'); 
                }               
            }            
    }
}

LibraryCarouselView.NavigateSlider = function () {

    $(".book_rightarrow").off('click').on('click', function (e) {

        if (LibraryCarouselView.isAnimationInProgress) {
            return false;
        }
        //ILIT-5516
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}


        LibraryCarouselView.isAnimationInProgress = true;

        $(".book_leftarrow").css({'opacity': '1'});

        if ($(".iconbookpage").hasClass('active')) {
            //  6 Images Displaying
            _numItemDisplaying = 5;
            _amountOfDisplacement = 146;
        } else {
            //  1 Image is Displaying
            _numItemDisplaying = 1;
            _amountOfDisplacement = 161;
        }

        var $left = parseInt($(".bookSliderBoxMovable").css('margin-left'));
        var boxSize = $(".bookSliderBoxWrapper .bookBox").length * _amountOfDisplacement;
        if (($left - (_amountOfDisplacement * _numItemDisplaying)) <= boxSize * -1) {
            //  Dont Let it Go Further
            LibraryCarouselView.isAnimationInProgress = false;
            return false;
        }

        var $calculatedLeft = $left - (_amountOfDisplacement * _numItemDisplaying);
        $(".bookSliderBoxMovable").animate({'margin-left': $calculatedLeft + 'px'}, function () {
            var $leftAtEnd = parseInt($(".bookSliderBoxMovable").css('margin-left'));
            LibraryCarouselView.isAnimationInProgress = false;
            if (($leftAtEnd - (_amountOfDisplacement * _numItemDisplaying)) <= boxSize * -1) {
                $(".book_rightarrow").css({'opacity': '0.5'});
                return false;
            }
        });
    });

    $(".book_leftarrow").off('click').on('click', function (e) {

        if (LibraryCarouselView.isAnimationInProgress) {
            return false;
        }

        //ILIT-5516
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}

        LibraryCarouselView.isAnimationInProgress = true;

        $(".book_rightarrow").css({'opacity': '1'});

        if ($(".iconbookpage").hasClass('active')) {
            //  6 Images Displaying
            _numItemDisplaying = 5;
            _amountOfDisplacement = 146;
        } else {
            //  1 Image is Displaying
            _numItemDisplaying = 1;
            _amountOfDisplacement = 161;
        }

        var $left = parseInt($(".bookSliderBoxMovable").css('margin-left'));

        if ($left == 0) {
            //  Dont Let it Go Further
            LibraryCarouselView.isAnimationInProgress = false;
            return false;
        }

        var $calculatedLeft = $left + (_amountOfDisplacement * _numItemDisplaying);
        $(".bookSliderBoxMovable").animate({'margin-left': $calculatedLeft + 'px'}, function () {
            var $leftAtEnd = parseInt($(".bookSliderBoxMovable").css('margin-left'));
            LibraryCarouselView.isAnimationInProgress = false;
            if ($leftAtEnd == 0) {
                $(".book_leftarrow").css({'opacity': '0.5'});
                return false;
            }
        });

    });
};


LibraryCarouselView.ilitBookShelf = function () {
    var container, ILITBookShelfRounderProperty = {}, bookElementClass = ILIT_BOOKSHELF_CONST.BOOK_CLASS.split(".")[1];


    ILITBookShelfRounderProperty = {
        width: 1000,
        gapAt3DEnvironment: 100,
        gapAtNormalEnvironment: 880,
        nonstopOccurrence: true,
        autoScale: 65,
        atMovementEnd: function () {
            var oMiddleBook = window.BookShelfRounder.getMiddleItem(),
				objData = oMiddleBook.attr("data-additionalInfo"),
				objDataJson = JSON.parse(objData);
				
			LibraryCarouselView.oMiddleBook = oMiddleBook;
			LibraryCarouselView.pageLoad = false;
			//set focus on middle book after crousel scroll ends
			if(!LibraryCarouselView.pageLoad && LibraryCarouselView.setCarouselFocus){			
				$(oMiddleBook).focus().off('keydown').on('keydown', function(e){
					triggerClickOnThisElemApp(e, this);
				}); 
			}
            LibraryCarouselView.showBookInformation(JSON.parse(objData));
			LibraryCarouselView.setCarouselFocus = true;
			
            //ILIT-5334
           var bookEvent = oMiddleBook[0].children;
           if($(bookEvent).hasClass("valid-activity")){
               callLogUserActivity(bookEvent);            
           }
			
			//for screen reader to read selected book
			//var bookInfo = objDataJson[LIBRARY.c_s_BOOK_LIST_JSON_KEY.BOOK_TITLE]+ARIA_ASSISTIVE_TEXT.BOOK_BY_AUTHOR+((objDataJson[LIBRARY.c_s_BOOK_LIST_JSON_KEY.AUTHOR_NAME] == '') ? CHARACTERS.c_s_BLANK : objDataJson[LIBRARY.c_s_BOOK_LIST_JSON_KEY.AUTHOR_NAME]);
			//readThis(bookInfo);
		},
        onBookAppend: function (obj) {
        },
        onEngineLoaded: function () {
			
            if ($('.slider_thumb_img').length) {
                return false;
            }
            if (void 0 != window.BookShelfRounder) {
				
                try {
					var oMiddleBook = window.BookShelfRounder.getMiddleItem();
                    var objData = oMiddleBook.attr("tabindex",0).attr("data-additionalInfo");
					//set focus on middle book after crousel updates. 
					if(!LibraryCarouselView.pageLoad && LibraryCarouselView.setCarouselFocus){			
						$(oMiddleBook).focus().off('keydown').on('keydown', function(e){
							triggerClickOnThisElemApp(e, this);
						}); 
					}  
				   LibraryCarouselView.showBookInformation(JSON.parse(objData));
				   //for screen reader to read selected book
					//var bookInfo = objDataJson[LIBRARY.c_s_BOOK_LIST_JSON_KEY.BOOK_TITLE]+ARIA_ASSISTIVE_TEXT.BOOK_BY_AUTHOR+((objDataJson[LIBRARY.c_s_BOOK_LIST_JSON_KEY.AUTHOR_NAME] == '') ? CHARACTERS.c_s_BLANK : objDataJson[LIBRARY.c_s_BOOK_LIST_JSON_KEY.AUTHOR_NAME]);
					//readThis(bookInfo);
                } catch (exp) {

                }
              }
        },
        onBookClicked: function (middleDiv) {
           //ILIT-5334
           var bookEvent = middleDiv[0].children;
            if($(bookEvent).hasClass("valid-activity")){
                callLogUserActivity(bookEvent);            
            }
            LibraryCarouselView.ShowBookPopup(JSON.parse(middleDiv.attr("data-additionalInfo")));
			LibraryCarouselView.prevFocusedElement = document.activeElement; // save last focussed element so that focus can be restored after popup close
        }
    };

      container = $('.ILITBookShelfRounderWrapper');

    function createBookShelfRounder() {
        window.BookShelfRounder = null;
        delete window.BookShelfRounder;
        container.ILITBookShelfRounder(ILITBookShelfRounderProperty);
        window.BookShelfRounder = container.data("ILITBookShelfRounder");
    }

    function createFlatBookShelfRounder() {
        container.ILITFlatBookShelfRounder({
            onAnimComplete: function (data) {
                LibraryCarouselView.showBookInformation(data);
            },
            onBookClicked: function (data) {
                LibraryCarouselView.ShowBookPopup(data);
				LibraryCarouselView.prevFocusedElement = document.activeElement; // save last focussed element so that focus can be restored after popup close
            }
        });

        window.FlatBookShelfRounder = container.data("ILITFlatBookShelfRounder");
        window.FlatBookShelfRounder.sendToMiddle(1);
        return window.FlatBookShelfRounder;
    }

    function loadLibrary() {
        // CLAS-1071 start accessibility issue
        $(".skip-link").focus();
        // CLAS-1071 end accessibility issue
        var i = 0, defaultLength = 5, relativePath, imageSrc, imageTitle, HTML_CONTENT = "";
        var BOOKSET = LibraryCarouselView.model.arrBooks;
		LibraryCarouselView.initialLoad = 1;
		//console.log(BOOKSET);
        var limit = 10000, stopCollecting, count = 0, star = 0;
//console.log(BOOKSET);
        relativePath = objLibraryJsonData.mediaPath;//LIBRARY.c_s_MEDIA_FOLDER_PATH;//"images/";        

        stopCollecting = false;
        for (jsonEl in  BOOKSET) {
            if (!stopCollecting) {    //   && typeof BOOKSET[jsonEl]['book_image'] != "undefined" && BOOKSET[jsonEl]['book_image']!= null && BOOKSET[jsonEl]['book_image'].length>0                                
                if (
                        BOOKSET[jsonEl] == null ||
                        typeof BOOKSET[jsonEl] == "undefined" ||
                        typeof BOOKSET[jsonEl]['book_image'] == "undefined"
                        ) {
                    continue;
                }

                imageSrc = BOOKSET[jsonEl]['book_image'];

                imageSrc = (imageSrc == "") ? LIBRARY.c_s_NO_COVER_IMAGE : relativePath + imageSrc;

                imageTitle = '';
                if (typeof BOOKSET[jsonEl]['book_title'] != "undefined") {
                    imageTitle = BOOKSET[jsonEl]['book_title'];
                }


                if ((LibraryCarouselView.ActiveTab === 'reviewed')) {
                    for (var i = 0; i < objGetUserFeedbackforAllBooksData.Content.length; i++) {
                        if (objGetUserFeedbackforAllBooksData.Content[i].CMSITemID === BOOKSET[jsonEl].book_id) {
                            if ((LibraryCarouselView.reviewActiveTab === "allStudent") || (LibraryCarouselView.reviewActiveTab === "myLevel")) {
                                if(objLibraryJsonData.productCode.match(GENERAL.c_s_ILIT_20)){
                                star = objGetUserFeedbackforAllBooksData.Content[i].GradeBandAvgRating;
                                }
                                else{
                                    star = objGetUserFeedbackforAllBooksData.Content[i].GlobalAvgRating;
                                }
                            }
                            else if (LibraryCarouselView.reviewActiveTab === "myGrade") {
                                if (objLibraryJsonData.productCode.match(GENERAL.c_s_ILIT_20)) {
                                    star = objGetUserFeedbackforAllBooksData.Content[i].GradeLevelAvgRating[objLibraryJsonData.targetGradeCode];
                                }
								/* ILIT-1668 changes for wtw : 'g4' for objLibraryJsonData.targetGradeCode will be considered for wtw*/
								else if (objLibraryJsonData.productCode.match(GENERAL.c_s_PROD_TYPE_WTW)){
                                    star = objGetUserFeedbackforAllBooksData.Content[i].GradeLevelAvgRating['g4'];
                                }
								/* end changes for wtw */
                                else {
                                    star = objGetUserFeedbackforAllBooksData.Content[i].GradeLevelAvgRating[objLibraryJsonData.gradeId];
                                }
                            }
                        }
                    }
                    HTML_CONTENT = "<div class='" + bookElementClass + " hideBook overshudle'><div class='bookElement1'><img class=' valid-activity' data-verbid = '"+TRACK_EVENT[0].c_s_VERBID+"' src='" + imageSrc + "' src='media/default_book_loader.gif' alt='" + imageTitle + "' aria-hidden='true' /></div><div style='display:" + ((LibraryCarouselView.ActiveTab !== 'reviewed') ? 'none' : 'block') + "'><div class='libbook-rating'><span class='meter'><span title='" + (star).toFixed(1) + "' style='width:" + (star * 23) + "px'>Rating: " + (star).toFixed(1) + "</span></span></div><div class='clear'></div><div class='libbook-title'>" + (star).toFixed(1) + "</div></div></div>";

                }
                else if ((LibraryCarouselView.ActiveTab === 'reserved')) {
                    HTML_CONTENT = "<div class='" + bookElementClass + " hideBook overshudle'><div class='bookElement1'><button type ='button' class='library_book_cross_sign' data-val=" + BOOKSET[jsonEl].book_id + " style='display:" + ((LibraryCarouselView.ActiveTab !== 'reserved') ? 'none' : 'block') + "'>X</button><img class='valid-activity' data-verbid = '"+TRACK_EVENT[0].c_s_VERBID+"' src='" + imageSrc + "' src='media/default_book_loader.gif' alt='" + imageTitle + "' aria-hidden='true' /></div></div>";
                }
                else {
                    HTML_CONTENT = "<div class='" + bookElementClass + " hideBook' book-details='" + BOOKSET[jsonEl].book_title + "~" + BOOKSET[jsonEl].author_name + "~" + BOOKSET[jsonEl].book_id + "'><img class='valid-activity' data-verbid = '"+TRACK_EVENT[0].c_s_VERBID+"' src='" + imageSrc + "' alt='" + imageTitle + "' aria-hidden='true' /></div>";

                }

                container.append(HTML_CONTENT);
                container.find(ILIT_BOOKSHELF_CONST.BOOK_CLASS + ":last").attr("data-additionalInfo", JSON.stringify(BOOKSET[jsonEl]));

                //container.find(ILIT_BOOKSHELF_CONST.BOOK_CLASS + ":last").attr({"book-id": BOOKSET[jsonEl].book_id, "author-name" : BOOKSET[jsonEl].author_name, "book-title" : BOOKSET[jsonEl].book_title});

                i++;
                if (limit > 0 && i == limit) {
                    stopCollecting = true;
                }

                count++;
            }

        }
        if (LibraryCarouselView.ActiveTab === 'reviewed') {
            $(".sliderWrap").addClass("review");
        }
        else {
            $(".sliderWrap").removeClass("review");
        }

        if (LibraryCarouselView.bPageLaunched && LibraryCarouselView.ActiveTab == 'all') {
            LibraryCarouselView.bPageLaunched = false;
         }
         oUtility.hideLoader();
        var BookShelfRounder, FlatBookShelfRounder;
        $('.' + bookElementClass).removeClass('hideBook');
        //		if (LibraryCarouselView.ActiveTab != 'reserved' && LibraryCarouselView.ActiveTab != 'reviewed' && LibraryCarouselView.ActiveTab != 'recommended') {
        if (count <= defaultLength) {
            //FlatBookShelfRounder = createFlatBookShelfRounder();
            $("#" + LIBRARY.c_s_MAIN_CONTAINER).find(".sliderWrap").html("<div class='flatCarousel'>" + container.html() + "</div>");
            $(".bookElement").css({"visibility": "visible"});
             $('#bookName').html("");
            $('#authorName').html("");
             //  If No Book... Then...
            if (!$(".flatCarousel .bookElement").length) {
                LibraryCarouselView.noBookMessage();
            }
			else{
				$(".flatCarousel .bookElement").attr("tabindex", 0);
			}
            $(".bookElement").off("click tap").on("click tap", function () {
                LibraryCarouselView.ShowBookPopup(JSON.parse($(this).attr("data-additionalInfo")));
				LibraryCarouselView.prevFocusedElement = document.activeElement; // save last focussed element so that focus can be restored after popup close
            });

        } else {
            BookShelfRounder = createBookShelfRounder();
        }
        //bind keydown event to book
		$(".bookElement").off('keydown').on('keydown', function(e){
			triggerClickOnThisElemApp(e, this);
		});
		
		//bind focus event to book 
		$(".bookElement").off('focus').on('focus', function(e){
			 var oBookInfo = JSON.parse($(this).attr("data-additionalInfo"));
			 var selectedBookTitle = oBookInfo.book_title,
				 authorName = oBookInfo.author_name,
				 curBookIndex = parseInt($(this).attr("ilit_box_uniq_id")),
				 totalBooks = Object.keys(objBookList.bookset[0]).length; //using the global bookset from gbe_library.js
				 
			 LibraryCarouselView.setCarouselFocus = false;
			var carouselInfo = ARIA_ASSISTIVE_TEXT.CAROUSEL_TITLE+selectedBookTitle+ARIA_ASSISTIVE_TEXT.BOOK_BY_AUTHOR+authorName+" "+curBookIndex+" "+" of "+totalBooks+" is Selected ";
			readThis(carouselInfo);
		});
		
//		}
//		else {
//                    $("#" + LIBRARY.c_s_MAIN_CONTAINER).find(".sliderWrap").html("<div class='flatCarousel'>"+container.html()+"</div>");
//			$(".bookElement").css({"visibility" : "visible"});
//			if (count == 0) {LibraryCarouselView.noBookMessage();}
//			$(".bookElement").off("click tap").on("click tap", function () {				
//				LibraryCarouselView.ShowBookPopup($(this).data('additionalInfo'));
//			})
//		}

        setTimeout(function () {
            var VrbIdType = '';
           if(LibraryCarouselView.ActiveTab == "recommended"){
                VrbIdType = GENERAL.c_s_PAGE_TYPE_LIBRARY+'-'+LIBRARY.c_s_STATIC_TEXT.c_s_HEADER_TAB_4;
            }
            else if(LibraryCarouselView.ActiveTab == "reviewed"){
                VrbIdType = GENERAL.c_s_PAGE_TYPE_LIBRARY+'-'+LIBRARY.c_s_STATIC_TEXT.c_s_HEADER_TAB_5;
            }
            else if(LibraryCarouselView.ActiveTab == "reserved"){
                VrbIdType = GENERAL.c_s_PAGE_TYPE_LIBRARY+'-'+LIBRARY.c_s_STATIC_TEXT.c_s_HEADER_TAB_6;
            }
            else{
                VrbIdType = GENERAL.c_s_PAGE_TYPE_LIBRARY;
            }
            onPageLoadComplete(VrbIdType);
        }, 200)

    }

    loadLibrary();
    LibraryCarouselView.resize();
    LibraryCarouselView.navigateBookShelfRounder();

};

LibraryCarouselView.updateCarousel = function(objBooks){
        var bookIndex = $.map(LibraryCarouselView.arrAllBooks, function (obj, index) {
        if (obj.book_id === JSON.parse((objBooks).attr("data-additionalInfo")).book_id) {
            return index;
        }
    });
   //
// oUtility.showCustomLoader({
//                'message': '<div style=" font-size: 13px;"><img src="media/loader.gif" style="margin-bottom: 15px;"></div>',
//                'background-color': '#fff',
//                'click-to-hide': false,
//                'opacity': 0.2
//            },".curoselContainer");
  //   console.log(bookIndex[0]+"===="+LibraryHeaderView.booksLoadCarousel+"=="+LibraryHeaderView.booksLoadCarouselDirection);
    if(LibraryHeaderView.booksLoadCarouselDirection === "left"){
    if(bookIndex[0] > LibraryHeaderView.booksLoadCarousel){
    if ((bookIndex[0] >= LibraryHeaderView.booksLoadCarousel + 5) && (bookIndex[0] <= LibraryHeaderView.booksLoadCarousel + 15)) {
    //   console.log("change");
        LibraryHeaderView.booksLoadCarousel = bookIndex[0];
          
            LibraryCarouselView.init();
       //  oUtility.hideCustomLoader();
    }
    }
        }

};

/* 
 * Method to handle crousel navigation for Accessibility
 */
LibraryCarouselView.navigateBookShelfRounder = function () {
    var VK_LEFT       = 37,
        VK_RIGHT      = 39,
		VK_TAB		  = 9;

    // on right/left arrow keypress on carousel swipe next/previous book
    $(".curoselContainer").on("keydown", function (e) {
   
        switch (e.keyCode) {
            case VK_RIGHT :
                window.BookShelfRounder.animateToRelativeItem(1);
				break;
            
			case VK_LEFT :
                window.BookShelfRounder.animateToRelativeItem(-1);
                break;
			
			case VK_TAB:
				LibraryCarouselView.setCarouselFocus = false;
				$(".bookElement").removeClass('focused').attr("tabindex",-1);// set all book tabindex -1 to fix tab going to other books after middle book
			break;
        }
    })

    $("#nextCarousel").off('click tap').on('click tap', function () {
        window.BookShelfRounder.animateToRelativeItem(1);        
    });

    $("#prevCarousel").off('click tap').on('click tap', function () {
        window.BookShelfRounder.animateToRelativeItem(-1);       
    });
	
	//reset LibraryCarouselView.setCarouselFocus so that tab can move to middle book
	$(".search").off("keydown").on("keydown", function(e){
		 switch (e.keyCode) {
			 case VK_TAB:
				//LibraryCarouselView.setCarouselFocus = true; //uncomment if carousel updates
			 break;
		 }
	});
};

LibraryCarouselView.noBookMessage = function () {

    var _msg = 'No results found. Please try using another keyword.';
    _width = '450px';
    _marginLeft = '-227px';
    if (LibraryCarouselView.ActiveTab == 'myLevel') {
        _msg = 'No Book Found!';
        _width = '350px';
        _marginLeft = '-179px';
    }
    else if (LibraryCarouselView.ActiveTab == 'reserved') {
        _msg = 'No Books Reserved!';
        _width = '350px';
        _marginLeft = '-179px';
    }
    else if (LibraryCarouselView.ActiveTab == 'reviewed') {
        _msg = 'No Books Reviewed!';
        _width = '350px';
        _marginLeft = '-179px';
    }
    else if (LibraryCarouselView.ActiveTab == 'recommended') {
        _msg = 'Check back tomorrow for recommended books.';
        _width = '350px';
        _marginLeft = '-179px';
    }

    $msgHtml = '<div tabindex="0" class="noBook"><div class="bookMsg">' + _msg + '</div></div>';

    if ($(".ILITBookShelfRounderWrapper.flatRounderPosition").length) {
        $(".ILITBookShelfRounderWrapper.flatRounderPosition").before($msgHtml);
    }

    if ($(".flatCarousel").length) {
        $(".flatCarousel").html($msgHtml);
    }

    if ($(".slider_thums").length) {
        $(".slider_thums").html($msgHtml);
    }

    $(".noBook").css({'width': _width, 'margin-left': _marginLeft}).fadeIn(1000);
};

/**
 * 
 * Display Book Information in Popup View 
 * @param {Object} objData
 * 
 */
LibraryCarouselView.ShowBookPopup = function (objData) {
     $("#" + LIBRARY.c_s_BOOK_POPUP_CONTAINER).attr('data-id', objData[LIBRARY.c_s_BOOK_LIST_JSON_KEY.BOOK_ID]);
    Application.init(VIEWTYPE.c_s_BOOKPOPUPVIEW);
    $(".md-content").css({'opacity': 0});
	//ARIA
	//set focus on dialog popup. Timeout is used to prevent Readthisbook button from getting triggered with click event.
	setTimeout(function(){
		$("#readBookBtn").focus()
	}, 2000);
	LibraryCarouselView.setCarouselFocus = false; // prevent focus going to middle book due to onEngineLoaded method call;
	
};

/**
 * 
 * @param {Object} pobjData
 * @returns {String} sBookTitle
 */
LibraryCarouselView.removeMetaData = function (pobjData) {

    try {
        var sBookTitle = pobjData[LIBRARY.c_s_BOOK_LIST_JSON_KEY.BOOK_TITLE];
        var pos = sBookTitle.lastIndexOf(",");
        //    var sCategory  =   $.trim(sBookTitle.substring(pos + 1, sBookTitle.length));
        //    
        //    if(_.find(LibraryCarouselView.metaData, function (val, key) {
        //        if(val.category_name === sCategory) {            
        //            sBookTitle  =   sBookTitle.substring(0, pos);
        //            return sCategory;
        //        }
        //    }));    

        if (pos > 0) {
            sBookTitle = $.trim(sBookTitle.substring(0, pos));
        }

        return sBookTitle;
    } catch (exp) {

    }
};

/**
 * Show Active Book information in Front
 * @param {Object} pobjData Front Book Index
 */
LibraryCarouselView.showBookInformation = function (pobjData) {

    var _sTitle = '';
    var _sAuthor = '';
    var _iTotalWords = '';
    var _iTotalPages = '';
    var _iTotalBooks = '';
    var _iLexileLevel = '';
    if ((pobjData !== null) && (pobjData !== undefined)) {
        try {
            _sTitle = pobjData[LIBRARY.c_s_BOOK_LIST_JSON_KEY.BOOK_TITLE];
            _sAuthor = (pobjData[LIBRARY.c_s_BOOK_LIST_JSON_KEY.AUTHOR_NAME] == '') ? CHARACTERS.c_s_BLANK : pobjData[LIBRARY.c_s_BOOK_LIST_JSON_KEY.AUTHOR_NAME];
            
			//pass book data to bookname element to make the data available upon clicking on bookname
			_sAdditionalInfo = JSON.stringify(pobjData);
            $('#bookName').attr("data-additionalInfo", _sAdditionalInfo);
            // For NVDA issue id : ILIT- 4071 ;
			if($('#bookName').html() != _sTitle || $('#authorName').html() != _sAuthor){
                $('#bookName').html(_sTitle);
                $('#authorName').html(_sAuthor);               
            }		
            
        } catch (exp) {
            console.log('Error Loading Carousel: ' + exp);
        }
    }


};

//Carousel View Resize Method
LibraryCarouselView.resize = function () {

    resize();

    if ($(".sliderWrap").length) {
        var carouselHeight = $(".sliderWrap").outerHeight();
        var middleBarHeight = $(".sliderText").outerHeight();
        var sectionheight = $('section').height();
        var variableHeight = $(".bookElement").length == 0 ? 0 : 7;
        $(".bookBoxWrap_out").height(sectionheight - (carouselHeight + middleBarHeight + variableHeight));
    }

    if ($('.slider_thums').length) {
        var $height = $('section').height() + $('header').height() - ($('.slider_thums').offset().top) - parseInt($('.slider_thums').css('padding-top'));
        $('.slider_thums').css({
            'height': $height
        });
    }
};


/**
 * Filter Book Based On Condition
 * 
 */

LibraryCarouselView.filterBooks = function () {

    $(".suggestion_drop").off('click').on('click', function () {

        var sCategory = $.trim($(this).attr('data-cat'));
        var sCategorySingular = $.trim($(this).attr('data-cat-singular'));

        var stoLowerCategory = sCategory.toLowerCase();
        var stoLowerCategorySingular = sCategorySingular.toLowerCase();

        if (sCategory === 'View All') {
            LibraryListView.init();
            $('#searchBox').val('');
            $(".category_suggestion").hide();
            $(".search_bar").hide();
        } else {

            var _books = _.omit(objBookList.bookset[0], 'categorylist');   //  , {file_type: "epub"}
            if (LibraryCarouselView.ActiveTab == 'all') {
                arrTotalBooks = _books;
            } else if (LibraryCarouselView.ActiveTab == 'myRead') {
                arrTotalBooks = LibraryCarouselView.myReadFilter();
            } else {
                arrTotalBooks = {}; //_.where(_books, {lexile_level: objUserLevel.Content.LexileLevel});                
                cnt = 0;
				/* changes for wtw */
				var bProductIsWTW = false,
					userLexileLevelForWTW = 0;
				
				if(objLibraryJsonData.productCode.match(GENERAL.c_s_PROD_TYPE_WTW)) {
					bProductIsWTW = true;
					userLexileLevelForWTW = (parseInt(objUserLevel.Content.LexileLevel)===0) ? 640 : parseInt(objUserLevel.Content.LexileLevel);
				}
				/* end changes for wtw */
				
				/* changes for wtw incorporated into 'if' condition for userLexileLevelForWTW if product is wtw*/
                _.filter(_books, function (obj) {
                    if (
						obj.lexile_level !== null && 
						obj.lexile_level >= ((bProductIsWTW ? userLexileLevelForWTW : parseInt(objUserLevel.Content.LexileLevel)) - 25) && 
						obj.lexile_level <= ((bProductIsWTW ? userLexileLevelForWTW : parseInt(objUserLevel.Content.LexileLevel)) + 25)) {
                        arrTotalBooks[cnt++] = obj;
                    }
                });
            }

            var filteredModel = {};
            var cnt = 0;
//            _.filter(LibraryCarouselView.arrAllBooks, function (obj) {                
            _.filter(arrTotalBooks, function (obj) {

                var _bookCategoryName = (typeof obj.category_name == 'undefined') ? null : obj.category_name.toLowerCase();
                var _bookGenre = (typeof obj._bookGenre == 'undefined') ? null : obj._bookGenre.toLowerCase();

                /* if(obj.book_genre !== null && typeof obj.book_genre != 'undefined') {                      
                 _bookGenre  =   obj.book_genre.toLowerCase();
                 if(_bookGenre.indexOf(stoLowerCategory) >= 0) {
                 filteredModel[cnt++] = obj;
                 }else if(_bookGenre.indexOf(stoLowerCategorySingular) >= 0) {
                 filteredModel[cnt++] = obj;
                 }
                 }
                 */
                if (
                        (_bookGenre !== null && _bookGenre.indexOf(stoLowerCategory) >= 0) ||
                        (_bookCategoryName !== null && _bookCategoryName.indexOf(stoLowerCategory) >= 0)
                        ) {
                    filteredModel[cnt++] = obj;
                } else if (
                        (_bookGenre !== null && _bookGenre.indexOf(stoLowerCategorySingular) >= 0) ||
                        (_bookCategoryName !== null && _bookCategoryName.indexOf(stoLowerCategorySingular) >= 0)
                        ) {
                    filteredModel[cnt++] = obj;
                }
            });

            LibraryHeaderView.SearchKeyText = sCategory;

            if (filteredModel.length) {
                LibraryCarouselView.arrEpub = filteredModel;
            }

            searchModel = filteredModel;
            searchModel["currentReading"] = LibraryCarouselView.currentReading;

            if ($('.sliderWrap').length) {
                LibraryCarouselView.init(searchModel);
            } else {
                if (LibraryHeaderView.SearchKeyText === null) {
                    //  Hide Search Dropdown
                    $(".search_bar").hide();
                } else {
                    $('#searchBox').val(LibraryHeaderView.SearchKeyText);
                    $(".search_bar").show();
                }

                $(".category_suggestion").hide();
                LibraryListView.init(searchModel);
            }
        }
    });

//    $("#searchBox").off('focus').on('focus', function (event) {
//        $("#popDropDown").trigger('click');
//        event.stopPropagation();
//    });

    /**
     * Text Search
     */
    $("#searchBox").off('keypress').on('keypress', function (event) {

        var keyCode = (!event.which) ? event.keyCode : event.which;
        var searchText = $.trim($(this).val());
        var toLowerSearchText = $.trim($(this).val()).toLowerCase();
        //CLASSVIEW-1099
        if (toLowerSearchText !=''){
            toLowerSearchText = replaceChars(toLowerSearchText);
        }
        LibraryHeaderView.SearchKeyText = (searchText === '') ? null : searchText;

        if (keyCode == 13 && searchText == '') {
            $("#searchClose").trigger('click');
            return false;
        }

        // If Backspace Key Hit
        if (keyCode == 8) {
//            $("#searchClose").trigger('click');
//            return false;
        }

        // If Enter Key Pressed
        if (keyCode == 13) {
            var filteredModel = {};
            var cnt = 0;

            var _books = _.omit(objBookList.bookset[0], 'categorylist');   //  , {file_type: "epub"}

            if (LibraryCarouselView.ActiveTab == 'all') {
                objCurrentLevelBooks = _books;
            } else if (LibraryCarouselView.ActiveTab == 'myRead') {
                objCurrentLevelBooks = LibraryCarouselView.myReadFilter();
            } else {
                objCurrentLevelBooks = {};
                cnt = 0;
				/* changes for wtw */
				var bProductIsWTW = false,
					userLexileLevelForWTW = 0;
				
				if(objLibraryJsonData.productCode.match(GENERAL.c_s_PROD_TYPE_WTW)) {
					bProductIsWTW = true;
					userLexileLevelForWTW = (parseInt(objUserLevel.Content.LexileLevel)===0) ? 640 : parseInt(objUserLevel.Content.LexileLevel);
				}
				/* end changes for wtw */
				
				/* changes for wtw incorporated into 'if' condition for userLexileLevelForWTW if product is wtw*/
                _.filter(_books, function (obj) {
                    if (
						obj.lexile_level !== null && 
						obj.lexile_level >= ((bProductIsWTW ? userLexileLevelForWTW : parseInt(objUserLevel.Content.LexileLevel)) - 25) && 
						obj.lexile_level <= ((bProductIsWTW ? userLexileLevelForWTW : parseInt(objUserLevel.Content.LexileLevel)) + 25)
						) {
                        objCurrentLevelBooks[cnt++] = obj;
                    }
                });
            }

            cnt = 0;
            _.filter(objCurrentLevelBooks, function (obj) {

                var _bookGenre = (typeof obj.book_genre == 'undefined') ? null : obj.book_genre.toLowerCase();
                var _bookCategoryName = (typeof obj.category_name == 'undefined') ? null : obj.category_name.toLowerCase();
                var _authorName = (typeof obj.author_name == 'undefined') ? null : obj.author_name.toLowerCase();
                var _bookTitle = (typeof obj.book_title == 'undefined') ? null : obj.book_title.toLowerCase();

                //CLASSVIEW-1099
                if (_bookTitle !=''){
                    _bookTitle = _bookTitle.replace("&lsquo;","'").replace("&rsquo;","'");
                    _bookTitle= replaceChars(_bookTitle);
                }

                if (_bookGenre !== null && _bookGenre.indexOf(toLowerSearchText) >= 0) {
                    filteredModel[cnt++] = obj;
                } else if (_bookCategoryName !== null && _bookCategoryName.indexOf(toLowerSearchText) >= 0) {
                    filteredModel[cnt++] = obj;
                } else if (_authorName !== null && _authorName.indexOf(toLowerSearchText) >= 0) {
                    filteredModel[cnt++] = obj;
                } else if (_bookTitle !== null && _bookTitle.indexOf(toLowerSearchText) >= 0) {
                    filteredModel[cnt++] = obj;
                }
            });

            LibraryHeaderView.SearchKeyText = searchText;

            if (filteredModel.length) {
                LibraryCarouselView.arrEpub = filteredModel;
            }

            searchModel = filteredModel;
            searchModel["currentReading"] = LibraryCarouselView.currentReading;

            if ($('.sliderWrap').length) {
                LibraryCarouselView.init(searchModel);

                //CLASSVIEW-1099 & Additinal existing issue fixing . After Search Title and author name are now display properly.
                setTimeout(function () {
                    if(searchModel != null){
                        if(searchModel[0] !=null){
                            let _sTitle = "";
                            let _sAuthor = "";
                            if (searchModel[0].book_title !=''){
                                _sTitle = searchModel[0].book_title.replace("&lsquo;","'");
                                _sAuthor = searchModel[0].author_name.replace("&lsquo;","'");
                            }
                            $('#bookName').html(_sTitle);
                            $('#authorName').html(_sAuthor);  
                        }
                    }
                }, 450);

            } else {
                if (LibraryHeaderView.SearchKeyText === null) {
                    //  Hide Search Dropdown
                    $(".search_bar").hide();
                } else {
                    $('#searchBox').val(LibraryHeaderView.SearchKeyText);
                    $(".search_bar").show();
                }

                $(".category_suggestion").hide();
                LibraryListView.init(searchModel);
            }
        };
    });

    // Close Search Textbox
    $("#searchClose").off('click').on('click', function () {

//        if($("#searchBox").val() == '') {
//            $('.search').trigger('click');
//            return false;
//        }

        $("#searchBox").val('');
        LibraryHeaderView.SearchKeyText = null;

        if ($("#changeView").hasClass('list_view')) {
            Application.init(VIEWTYPE.c_s_CAROUSEL);
        } else if ($("#changeView").hasClass('grid_view')) {
            Application.init(VIEWTYPE.c_s_LISTVIEW);
        }
    });
};

/**
 * Load Carousel Images
 * 
 */
LibraryCarouselView.loadCarouselImages = function () {

    $('.swiper-slide-visible').each(function () {
        objImage = $(this).find('img');

        if (objImage.attr('img-load') === "false") {
            objImage.attr('src', objImage.attr('data-img-attr'));
            objImage.attr('img-load', "true");
        }
    });

    $('.swiper-slide-visible').nextAll("*:lt(15)").each(function () {
        objImage = $(this).find('img');
        if (objImage.attr('img-load') === "false") {
            objImage.attr('src', objImage.attr('data-img-attr'));
            objImage.attr('img-load', "true");
        }
    });

    $('.swiper-slide-visible').prevAll("*:gt(15)").each(function () {
        objImage = $(this).find('img');
        if (objImage.attr('img-load') === "false") {
            objImage.attr('src', objImage.attr('data-img-attr'));
            objImage.attr('img-load', "true");
        }
    });
};

LibraryCarouselView.checkForLevel = function () {

    if (objUserLevel != null) {
        GetLibraryProgressSummary();

        setTimeout(function () {
            LibraryCarouselView.checkForProgress();
        }, 400);

//		if (LibraryCarouselView.ActiveTab == 'reserved' || LibraryCarouselView.ActiveTab == 'reviewed' || LibraryCarouselView.ActiveTab === 'recommended') {
//			LibraryCarouselView.template = _.template($("#NormalLibraryAreaTemplate").html());
//		}
//		else {
        LibraryCarouselView.template = _.template($("#" + LIBRARY.c_s_CAROUSEL_TEMPLATE).html());
//		}		

        LibraryCarouselView.render();
        LibraryCarouselView.bindEvent();
    } else {
        setTimeout(function () {
            LibraryCarouselView.checkForLevel();
        }, 400);
    }
};

/**
 * What i Have Read
 * @param {String} lastActiveButton
 * @returns {Boolean}
 */
LibraryCarouselView.getMyRead = function (lastActiveButton) {

    if (LibraryCarouselView.libraryProgressSummary.Status == '200') {
        if (_.size(LibraryCarouselView.libraryProgressSummary.Content) > 0) {
            var arrIds = LibraryCarouselView.libraryProgressSummary.Content['BookItemIDs'];
            var objResultModel = {};
            for (var cnt = 0; cnt < arrIds.length; cnt++) {
                _sBookId = arrIds[cnt];
                //_arrMergedBookId=   _sMergedBookId.split("_");
                //_sBookId        =   _arrMergedBookId.length > 1 ? _arrMergedBookId[1] : '';
                /* if (_sBookId != '') {
                 objResultModel[cnt] = _.where(objBookList.bookset[0], {book_id: _sBookId})[0];
                 } */
                if (_sBookId != '') {
                    for (iI in objBookList.bookset[0]) {
                        if (objBookList.bookset[0][iI].book_id == _sBookId) {
                            objResultModel[cnt] = objBookList.bookset[0][iI];
                        }
                    }
                }
            }

            cnt = 0;
            /* if (LibraryHeaderView.SearchKeyText != null) {
             var arrBooks = {};
             var toLowerSearchText = LibraryHeaderView.SearchKeyText.toLowerCase();
             var objSingularTermSearchKey = _.where(LibraryHeaderView.arrCategory, {category_name: LibraryHeaderView.SearchKeyText});
             var singularTermSearchKey = (objSingularTermSearchKey.length != 0) ? objSingularTermSearchKey[0].category_name_singular.toLowerCase() : null;
             
             _.filter(objResultModel, function (obj) {
             
             var _bookGenre = (typeof obj.book_genre == 'undefined') ? null : obj.book_genre.toLowerCase();
             var _bookCategoryName = (typeof obj.category_name == 'undefined') ? null : obj.category_name.toLowerCase();
             var _authorName = (typeof obj.author_name == 'undefined') ? null : obj.author_name.toLowerCase();
             var _bookTitle = (typeof obj.book_title == 'undefined') ? null : obj.book_title.toLowerCase();
             
             if (_bookGenre !== null && _bookGenre.indexOf(toLowerSearchText) >= 0) {
             arrBooks[cnt++] = obj;
             } else if (_bookCategoryName !== null && _bookCategoryName.indexOf(toLowerSearchText) >= 0) {
             arrBooks[cnt++] = obj;
             } else if (_authorName !== null && _authorName.indexOf(toLowerSearchText) >= 0) {
             arrBooks[cnt++] = obj;
             } else if (_bookTitle !== null && _bookTitle.indexOf(toLowerSearchText) >= 0) {
             arrBooks[cnt++] = obj;
             }
             
             //  Search For Singular Term
             if (singularTermSearchKey != null && toLowerSearchText != singularTermSearchKey) {
             _isAlreadyExisted = _.where(arrBooks, {book_id: obj.book_id});
             if (_bookGenre !== null && _bookGenre.indexOf(singularTermSearchKey) >= 0 && _isAlreadyExisted.length == 0) {
             arrBooks[cnt++] = obj;
             } else if (_bookCategoryName !== null && _bookCategoryName.indexOf(singularTermSearchKey) >= 0 && _isAlreadyExisted.length == 0) {
             arrBooks[cnt++] = obj;
             } else if (_authorName !== null && _authorName.indexOf(singularTermSearchKey) >= 0 && _isAlreadyExisted.length == 0) {
             arrBooks[cnt++] = obj;
             } else if (_bookTitle !== null && _bookTitle.indexOf(singularTermSearchKey) >= 0 && _isAlreadyExisted.length == 0) {
             arrBooks[cnt++] = obj;
             }
             }
             });
             } else {
             arrBooks = objResultModel;
             } */

            if (LibraryHeaderView.SearchKeyText != null) {
                var arrBooks = {};
                var toLowerSearchText = LibraryHeaderView.SearchKeyText.toLowerCase();
                var objSingularTermSearchKey = _.where(LibraryHeaderView.arrCategory, {category_name: LibraryHeaderView.SearchKeyText});
                var singularTermSearchKey = (objSingularTermSearchKey.length != 0) ? objSingularTermSearchKey[0].category_name_singular.toLowerCase() : null;

                for (var iI in objResultModel) {

                    var _bookGenre = (typeof objResultModel[iI].book_genre == 'undefined') ? null : objResultModel[iI].book_genre.toLowerCase();
                    var _bookCategoryName = (typeof objResultModel[iI].category_name == 'undefined') ? null : objResultModel[iI].category_name.toLowerCase();
                    var _authorName = (typeof objResultModel[iI].author_name == 'undefined') ? null : objResultModel[iI].author_name.toLowerCase();
                    var _bookTitle = (typeof objResultModel[iI].book_title == 'undefined') ? null : objResultModel[iI].book_title.toLowerCase();

                    if (_bookGenre !== null && _bookGenre.indexOf(toLowerSearchText) >= 0) {
                        arrBooks[cnt++] = objResultModel[iI];
                    } else if (_bookCategoryName !== null && _bookCategoryName.indexOf(toLowerSearchText) >= 0) {
                        arrBooks[cnt++] = objResultModel[iI];
                    } else if (_authorName !== null && _authorName.indexOf(toLowerSearchText) >= 0) {
                        arrBooks[cnt++] = objResultModel[iI];
                    } else if (_bookTitle !== null && _bookTitle.indexOf(toLowerSearchText) >= 0) {
                        arrBooks[cnt++] = objResultModel[iI];
                    }

                    //  Search For Singular Term
                    if (singularTermSearchKey != null && toLowerSearchText != singularTermSearchKey) {
                        _isAlreadyExisted = [];
                        for (iK in arrBooks) {
                            if (arrBooks[iK].book_id == objResultModel[iI].book_id) {
                                _isAlreadyExisted.push(arrBooks[iK]);
                            }
                        }
                        if (_bookGenre !== null && _bookGenre.indexOf(singularTermSearchKey) >= 0 && _isAlreadyExisted.length == 0) {
                            arrBooks[cnt++] = objResultModel[iI];
                        } else if (_bookCategoryName !== null && _bookCategoryName.indexOf(singularTermSearchKey) >= 0 && _isAlreadyExisted.length == 0) {
                            arrBooks[cnt++] = objResultModel[iI];
                        } else if (_authorName !== null && _authorName.indexOf(singularTermSearchKey) >= 0 && _isAlreadyExisted.length == 0) {
                            arrBooks[cnt++] = objResultModel[iI];
                        } else if (_bookTitle !== null && _bookTitle.indexOf(singularTermSearchKey) >= 0 && _isAlreadyExisted.length == 0) {
                            arrBooks[cnt++] = objResultModel[iI];
                        }
                    }
                }
            } else {
                arrBooks = objResultModel;
            }



            if ($('.sliderWrap').length) {
                LibraryCarouselView.init(arrBooks);
            } else {
                LibraryListView.init(arrBooks);
            }
        } else {
            LibraryCarouselView.showMyReadMessage(lastActiveButton);
        }
    } else {
        LibraryCarouselView.showMyReadMessage(lastActiveButton);
    }
};

/**
 * 
 * @returns {Object}
 */
LibraryCarouselView.myReadFilter = function () {

    if (LibraryCarouselView.libraryProgressSummary.Status == 200) {
        if (_.size(LibraryCarouselView.libraryProgressSummary.Content) > 0) {
            var arrIds = LibraryCarouselView.libraryProgressSummary.Content['BookItemIDs'];
            var arrTotalBooks = {};
            for (var cnt = 0; cnt < arrIds.length; cnt++) {
                _sBookId = arrIds[cnt];
                //_arrMergedBookId=   _sMergedBookId.split("_");
                //_sBookId        =   _arrMergedBookId.length > 1 ? _arrMergedBookId[1] : '';
                if (_sBookId != '') {
                    for (iI in objBookList.bookset[0]) {
                        if (objBookList.bookset[0][iI].book_id == _sBookId) {
                            arrTotalBooks[cnt] = objBookList.bookset[0][iI];
                        }
                    }
                    //arrTotalBooks[cnt] = _.where(objBookList.bookset[0], {book_id: _sBookId})[0];
                }
            }
            return arrTotalBooks;
        } else {
            LibraryCarouselView.showMyReadMessage();
        }
    } else {
        LibraryCarouselView.showMyReadMessage();
    }
};

LibraryCarouselView.showMyReadMessage = function (lastActiveButton) {
//    $(".tabbing button").removeClass('active');
//    LibraryCarouselView.ActiveTab   =   lastActiveButton;
//    var lastButton  =   (lastActiveButton == 'all') ? 0 : 1;
//    $(".tabbing button:eq("+lastButton+")").addClass('active');
//    return false;
    var searchModel = {};
    if ($('.sliderWrap').length) {
        LibraryCarouselView.init(searchModel);
    } else {
        LibraryListView.init(searchModel);
    }

};

LibraryCarouselView.getMyLevel = function (iLevel) {

    if (objUserLevel.Status == 500) {
        $(".tabbing button[data-text='all']").addClass('active');
        $(".tabbing button[data-text='myLevel']").removeClass('active');
        return false;
    }

//        var iLevel  =   objUserLevel.Content.LexileLevel;
    var objMyModel = {};
    var cnt = 0;
    var _books = _.omit(objBookList.bookset[0], 'categorylist');
    
    // CLAS-821 //My Level TAB
    books_ = Object.fromEntries(
        Object.entries(_books).filter(([key, book]) => {
          if (book.book_id) {
            console.log(`Filtering book with ID: ${book.book_id}`);
            return !objSupressBookTitle.includes(book.book_id);
          } else {
            console.log("Skipping book without book_id:", book);
            return false;
          }
        })
      );
    // End of CLAS-821
    
    //  , {file_type: "epub"}
    /*  _.filter(_books, function (obj) {                //LibraryCarouselView.arrAllBooks//
     if (obj.lexile_level !== null && obj.lexile_level >= (parseInt(objUserLevel.Content.LexileLevel) - 25) && obj.lexile_level <= (parseInt(objUserLevel.Content.LexileLevel) + 25)) {
     objMyModel[cnt++] = obj;
     }
     }); */
	/* changes for wtw */
	var bProductIsWTW = false,
		userLexileLevelForWTW = 0;
	
	if(objLibraryJsonData.productCode.match(GENERAL.c_s_PROD_TYPE_WTW)) {
		bProductIsWTW = true;
		userLexileLevelForWTW = (parseInt(objUserLevel.Content.LexileLevel)===0) ? 640 : parseInt(objUserLevel.Content.LexileLevel);
	}
	/* end changes for wtw */
	
    for (iI in _books) {
		/* changes for wtw incorporated into 'if' condition for userLexileLevelForWTW if product is wtw*/
        if (
			_books[iI].lexile_level !== null && 
			_books[iI].lexile_level >= ((bProductIsWTW ? userLexileLevelForWTW : parseInt(objUserLevel.Content.LexileLevel)) - 25) && 
			_books[iI].lexile_level <= ((bProductIsWTW ? userLexileLevelForWTW : parseInt(objUserLevel.Content.LexileLevel)) + 25)
		) {
            objMyModel[cnt++] = _books[iI];
        }
    }
    cnt = 0;
    if (LibraryHeaderView.SearchKeyText != null) {
        var arrBooks = {};
        var toLowerSearchText = LibraryHeaderView.SearchKeyText.toLowerCase();
        var objSingularTermSearchKey = _.where(LibraryHeaderView.arrCategory, {category_name: LibraryHeaderView.SearchKeyText});
        var singularTermSearchKey = (objSingularTermSearchKey.length != 0) ? objSingularTermSearchKey[0].category_name_singular.toLowerCase() : null;

        /* _.filter(objMyModel, function (obj) {
         
         var _bookGenre = (typeof obj.book_genre == 'undefined') ? null : obj.book_genre.toLowerCase();
         var _bookCategoryName = (typeof obj.category_name == 'undefined') ? null : obj.category_name.toLowerCase();
         var _authorName = (typeof obj.author_name == 'undefined') ? null : obj.author_name.toLowerCase();
         var _bookTitle = (typeof obj.book_title == 'undefined') ? null : obj.book_title.toLowerCase();
         
         if (_bookGenre !== null && _bookGenre.indexOf(toLowerSearchText) >= 0) {
         arrBooks[cnt++] = obj;
         } else if (_bookCategoryName !== null && _bookCategoryName.indexOf(toLowerSearchText) >= 0) {
         arrBooks[cnt++] = obj;
         }
         else if (_authorName !== null && _authorName.indexOf(toLowerSearchText) >= 0) {
         arrBooks[cnt++] = obj;
         } else if (_bookTitle !== null && _bookTitle.indexOf(toLowerSearchText) >= 0) {
         arrBooks[cnt++] = obj;
         }
         
         //  Search For Singular Term
         if (singularTermSearchKey != null && toLowerSearchText != singularTermSearchKey) {
         _isAlreadyExisted = _.where(arrBooks, {book_id: obj.book_id});
         if (_bookGenre !== null && _bookGenre.indexOf(singularTermSearchKey) >= 0 && _isAlreadyExisted.length == 0) {
         arrBooks[cnt++] = obj;
         } else if (_bookCategoryName !== null && _bookCategoryName.indexOf(singularTermSearchKey) >= 0 && _isAlreadyExisted.length == 0) {
         arrBooks[cnt++] = obj;
         } else if (_authorName !== null && _authorName.indexOf(singularTermSearchKey) >= 0 && _isAlreadyExisted.length == 0) {
         arrBooks[cnt++] = obj;
         } else if (_bookTitle !== null && _bookTitle.indexOf(singularTermSearchKey) >= 0 && _isAlreadyExisted.length == 0) {
         arrBooks[cnt++] = obj;
         }
         }
         }); */

        for (iI in objMyModel) {
            var _bookGenre = (typeof objMyModel[iI].book_genre == 'undefined') ? null : objMyModel[iI].book_genre.toLowerCase();
            var _bookCategoryName = (typeof objMyModel[iI].category_name == 'undefined') ? null : objMyModel[iI].category_name.toLowerCase();
            var _authorName = (typeof objMyModel[iI].author_name == 'undefined') ? null : objMyModel[iI].author_name.toLowerCase();
            var _bookTitle = (typeof objMyModel[iI].book_title == 'undefined') ? null : objMyModel[iI].book_title.toLowerCase();

            if (_bookGenre !== null && _bookGenre.indexOf(toLowerSearchText) >= 0) {
                arrBooks[cnt++] = objMyModel[iI];
            } else if (_bookCategoryName !== null && _bookCategoryName.indexOf(toLowerSearchText) >= 0) {
                arrBooks[cnt++] = objMyModel[iI];
            }
            else if (_authorName !== null && _authorName.indexOf(toLowerSearchText) >= 0) {
                arrBooks[cnt++] = objMyModel[iI];
            } else if (_bookTitle !== null && _bookTitle.indexOf(toLowerSearchText) >= 0) {
                arrBooks[cnt++] = objMyModel[iI];
            }

            //  Search For Singular Term
            if (singularTermSearchKey != null && toLowerSearchText != singularTermSearchKey) {
                _isAlreadyExisted = [];
                for (iK in arrBooks) {
                    if (arrBooks[iK].book_id == objMyModel[iI].book_id) {
                        _isAlreadyExisted.push(arrBooks[iK]);
                    }
                }
                if (_bookGenre !== null && _bookGenre.indexOf(singularTermSearchKey) >= 0 && _isAlreadyExisted.length == 0) {
                    arrBooks[cnt++] = objMyModel[iI];
                } else if (_bookCategoryName !== null && _bookCategoryName.indexOf(singularTermSearchKey) >= 0 && _isAlreadyExisted.length == 0) {
                    arrBooks[cnt++] = objMyModel[iI];
                } else if (_authorName !== null && _authorName.indexOf(singularTermSearchKey) >= 0 && _isAlreadyExisted.length == 0) {
                    arrBooks[cnt++] = objMyModel[iI];
                } else if (_bookTitle !== null && _bookTitle.indexOf(singularTermSearchKey) >= 0 && _isAlreadyExisted.length == 0) {
                    arrBooks[cnt++] = objMyModel[iI];
                }
            }
        }

    } else {
        arrBooks = objMyModel;
    }

    if (Object.keys(arrBooks).length) {
        LibraryCarouselView.arrEpub = arrBooks;
    }

    searchModel = arrBooks;
    searchModel["currentReading"] = LibraryCarouselView.currentReading;

    if ($('.sliderWrap').length) {
        LibraryCarouselView.init(searchModel);
    } else {
        LibraryListView.init(searchModel);
    }
};

LibraryCarouselView.checkForProgress = function () {

    if (LibraryCarouselView.libraryProgressSummary != null) {

        var objLibraryStatus = LibraryCarouselView.libraryProgressSummary;

        if (objLibraryStatus.Status == 200) {

            var objStatus = {};

            _totalBook = 0;
            _totalpages = 0;
            _totalwords = 0;

            if (_.size(objLibraryStatus.Content) > 0) {
                /* for(var key = 0; key < objLibraryStatus.Content.length; key++) {                    
                 _ProgressDataSummary    =   objLibraryStatus.Content[key].ProgressDataSummary;                                
                 _objProgressDataSummary	=	null;
                 try {
                 _objProgressDataSummary =   JSON.parse(_ProgressDataSummary);
                 } catch (exp) {
                 
                 }
                 
                 //------------------ Here For IOS PROBLEM -----------------
                 if(_objProgressDataSummary != null && typeof _objProgressDataSummary.bookCompleted == "string") {
                 if(_objProgressDataSummary.bookCompleted == "true") {
                 _objProgressDataSummary.bookCompleted = true;
                 }
                 if(_objProgressDataSummary.bookCompleted == "false") {
                 _objProgressDataSummary.bookCompleted = false;
                 }
                 }
                 //------------------ Here For IOS PROBLEM -----------------
                 
                 if(_objProgressDataSummary != null && _objProgressDataSummary.bookCompleted && typeof _objProgressDataSummary.bookCompleted == "boolean") {                    
                 _totalBook++;                        
                 }
                 _totalwords +=  objLibraryStatus.Content[key].NumberOfWordsRead;
                 } */

                _totalwords = (objLibraryStatus.Content.TotalNumberOfWordsRead) ? objLibraryStatus.Content.TotalNumberOfWordsRead : 0;
                _totalBook = (objLibraryStatus.Content.TotalBooksCompleted) ? objLibraryStatus.Content.TotalBooksCompleted : 0;
                _totalpages = (objLibraryStatus.Content.TotalNumberOfPagesRead) ? objLibraryStatus.Content.TotalNumberOfPagesRead : 0;                 

                _totalpages = parseInt(_totalpages.toFixed(0));
                objStatus = {
                    totalBook: (_totalBook == 0) ? "-" : _totalBook.format(0, 3),
                    totalpages: (_totalpages == 0) ? "-" : _totalpages.format(0, 3),
                    totalwords: (_totalwords == 0) ? "-" : _totalwords.format(0, 3)
                }

                //$('#totalWords').text(objStatus.totalwords)
                $('#totalPages').text(objStatus.totalpages);
                $('#totalBooks').text(objStatus.totalBook);

                // For Interest Inventory Form
                //if (objLibraryJsonData.productCode.match(GENERAL.c_s_ILIT_20) && objLibraryJsonData.viewType == 'student') {
                    if (objLibraryJsonData.viewType == 'student') {
                    LibraryHeaderView.getInterestInventoryInfoStatus();
                }
            }

            var objGradeBookStudent = null;
            if (typeof objLibraryJsonData.currentVersion != "undefined" && objLibraryJsonData.currentVersion != null) {
                objGradeBookStudent = oIWTTotalWordCount.Content;
                _totalwords += (objGradeBookStudent.TotalWordCount == '') ? 0 : parseInt(objGradeBookStudent.TotalWordCount);
            } else {
                objGradeBookStudent = objNoteBookData.Content;
                var objWordCountSum = _.where(objGradeBookStudent, {ItemCompletionStatus: 'scored', ItemSubType: 'iwt'});
                for (var cntWc = 0; cntWc < objWordCountSum.length; cntWc++) {
                    _totalwords += objWordCountSum[cntWc].WordCount;
                }
            }

            totalwords = (_totalwords == 0) ? "-" : _totalwords.format(0, 3);
            $('#totalWords').text(totalwords);

        }

        try {
            var _lexileLevel = (objUserLevel.Status == 200) ? ((objUserLevel.Content.LexileLevel == 0) ? "-" : objUserLevel.Content.LexileLevel) : "-";
            $('#lexileLevel').text(_lexileLevel)
        } catch (exp) {

        }
        $(".middleBookInfoMain").fadeIn(500);
    } else {
        setTimeout(function () {
            LibraryCarouselView.checkForProgress();
        }, 400);
    }

};

//  ###########################
//  Library List View: To Display List of Books in list mode
//  ###########################


/* 
 * Library List View JS
 */
function LibraryListView() {
}
;

LibraryListView.model = null;
LibraryListView.template = null;

/* Library List init  */
LibraryListView.init = function (model) {

    LibraryCarouselView.arrAllBooks = _.omit(objBookList.bookset[0], 'categorylist');  // , {file_type: "epub"} //_.omit(objBookList.bookset[0], 'categorylist');    
    LibraryCarouselView.arrEpub = _.where(LibraryCarouselView.arrAllBooks, {file_type: "epub"});   //_.where(this.arrAllBooks, {file_type: "epub"});
    LibraryCarouselView.iBookLength = Object.keys(LibraryCarouselView.arrAllBooks).length; //Object.keys(this.arrAllBooks).length;
    var searchText = null;

    if (typeof model == 'undefined') {
        if (LibraryCarouselView.ActiveTab == 'all') {
            arrTotalBooks = LibraryCarouselView.arrAllBooks;
        } else if (LibraryCarouselView.ActiveTab == 'myRead') {
            arrTotalBooks = LibraryCarouselView.myReadFilter();
        }
        else if (LibraryCarouselView.ActiveTab == 'myLevel') {
            //            arrTotalBooks   =   _.where(LibraryCarouselView.arrAllBooks, {lexile_level: objUserLevel.Content.LexileLevel});
            var iCnt = 0;
            var arrTotalBooks = [];
            var _books = LibraryCarouselView.arrAllBooks;
			/* ILIT-1668 changes for wtw */
			var bProductIsWTW = false,
				userLexileLevelForWTW = 0;

			if(objLibraryJsonData.productCode.match(GENERAL.c_s_PROD_TYPE_WTW)) {
				bProductIsWTW = true;
				userLexileLevelForWTW = (parseInt(objUserLevel.Content.LexileLevel)===0) ? 640 : parseInt(objUserLevel.Content.LexileLevel);
			}
			/* end changes for wtw */
			
			/* ILIT-1668 changes for wtw incorporated into 'if' condition for userLexileLevelForWTW if product is wtw*/
            _.filter(_books, function (obj) {                /*LibraryCarouselView.arrAllBooks*/
                if (
					obj.lexile_level !== null && 
					obj.lexile_level >= ((bProductIsWTW ? userLexileLevelForWTW : parseInt(objUserLevel.Content.LexileLevel)) - 25) && 
					obj.lexile_level <= ((bProductIsWTW ? userLexileLevelForWTW : parseInt(objUserLevel.Content.LexileLevel)) + 25)) {
                    arrTotalBooks[iCnt++] = obj;
                }
            });
        }

        var cnt = 0;
        searchText = ($.trim($("#searchBox").val()) == '') ? null : $.trim($("#searchBox").val());
        if (searchText != null) {
            var arrBooks = {};
            var toLowerSearchText = searchText.toLowerCase();
            //CLASSVIEW-1099
            if (toLowerSearchText !=''){
                toLowerSearchText = replaceChars(toLowerSearchText);
            }
            var objSingularTermSearchKey = _.where(LibraryHeaderView.arrCategory, {category_name: searchText});
            var singularTermSearchKey = (objSingularTermSearchKey.length != 0) ? objSingularTermSearchKey[0].category_name_singular.toLowerCase() : null;
            _.filter(arrTotalBooks, function (obj) {
                _temp = 0;
                var _bookGenre = (typeof obj.book_genre == 'undefined') ? null : obj.book_genre.toLowerCase();
                var _bookCategoryName = (typeof obj.category_name == 'undefined') ? null : obj.category_name.toLowerCase();
                var _authorName = (typeof obj.author_name == 'undefined') ? null : obj.author_name.toLowerCase();
                var _bookTitle = (typeof obj.book_title == 'undefined') ? null : obj.book_title.toLowerCase();

                //CLASSVIEW-1099
                if (_bookTitle !=''){
                    _bookTitle = _bookTitle.replace("&lsquo;","'").replace("&rsquo;","'");
                    _bookTitle= replaceChars(_bookTitle);
                }

                if (_bookGenre !== null && _bookGenre.indexOf(toLowerSearchText) >= 0) {
                    arrBooks[cnt++] = obj;
                    _temp = 1;
                } else if (_bookCategoryName !== null && _bookCategoryName.indexOf(toLowerSearchText) >= 0) {
                    arrBooks[cnt++] = obj;
                    _temp = 1;
                } else if (_authorName !== null && _authorName.indexOf(toLowerSearchText) >= 0) {
                    arrBooks[cnt++] = obj;
                    _temp = 1;
                } else if (_bookTitle !== null && _bookTitle.indexOf(toLowerSearchText) >= 0) {
                    arrBooks[cnt++] = obj;
                    _temp = 1;
                }

                //  Search For Singular Term
                if (singularTermSearchKey != null && toLowerSearchText != singularTermSearchKey && _temp == 0) {
                    if (_bookGenre !== null && _bookGenre.indexOf(singularTermSearchKey) >= 0) {
                        arrBooks[cnt++] = obj;
                    } else if (_bookCategoryName !== null && _bookCategoryName.indexOf(singularTermSearchKey) >= 0) {
                        arrBooks[cnt++] = obj;
                    } else if (_authorName !== null && _authorName.indexOf(singularTermSearchKey) >= 0) {
                        arrBooks[cnt++] = obj;
                    } else if (_bookTitle !== null && _bookTitle.indexOf(singularTermSearchKey) >= 0) {
                        arrBooks[cnt++] = obj;
                    }
                }
            });
        } else {
            arrBooks = arrTotalBooks;
        }

        LibraryHeaderView.SearchKeyText = searchText;
    }

    LibraryListView.model = typeof model === 'undefined' ? {bookset: arrBooks} : {bookset: model};//model;    
    LibraryListView.template = _.template($("#" + LIBRARY.c_s_LIST_TEMPLATE).html());

    LibraryListView.render();
    LibraryListView.bindEvent();

    if (!$(".slider_thums .slider_thumb_img").length) {
        LibraryCarouselView.noBookMessage();
    }

};

/* Library List render */
LibraryListView.render = function () {

    $("#" + LIBRARY.c_s_MAIN_CONTAINER).html(LibraryListView.template(LibraryListView.model));
    oUtility.hideLoader();
    LibraryCarouselView.renderHeader();
    //  Call Resize To Adjust Window Width/Height
    LibraryCarouselView.resize();
};

LibraryListView.bindEvent = function () {

    LibraryListView.attachLazyLoader();
    LibraryListView.showBookPopup();
    LibraryListView.closeSuggestionDropDown();
};

LibraryListView.attachLazyLoader = function () {
    $('img.lazy').lazyload({
        effect: "fadeIn",
        container: ".slider_thums"
    });
}

LibraryListView.closeSuggestionDropDown = function () {
    $("section").off("click tap").on("click tap", function () {
        if ($(".search_bar").is(':visible') && $.trim($("#searchBox").val()) === '') {
            $(".search_bar").slideUp()
        }
    });

    $(document).off('click tap').on('click tap', '.ui-dialog-titlebar-close', function () {
        $('.slider_thums').css('overflow', 'auto');
        $("section").trigger('tap');
    });
};

LibraryListView.showBookPopup = function () {
    $(".slider_thumb_img img")
            .off('click')
            .on('click', function (e) {
                //ILIT-5334
                if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
                    callLogUserActivity(e); 
                }
                $('.slider_thums').css('overflow', 'hidden');
                $("#" + LIBRARY.c_s_BOOK_POPUP_CONTAINER).attr('data-id', $(this).parent().attr('data-id'));
                Application.init(VIEWTYPE.c_s_BOOKPOPUPVIEW);
                $(".md-content").css({'opacity': 0});
				//ARIA
				//set focus on dialog popup. Timeout is used to prevent Readthisbook button from getting triggered with click event.
				setTimeout(function(){
					$("#readBookBtn").focus()
				}, 2000);
				//LibraryCarouselView.setCarouselFocus = false; // prevent focus going to middle book due to onEngineLoaded method call;
				LibraryCarouselView.prevFocusedElement = document.activeElement; // save last focussed element so that focus can be restored after popup close
			});

	$(".slider_thumb_img").off("keydown").on("keydown", function(e){
        //ILIT-5334
		if($(e.target).hasClass("valid-activity") || $(e.currentTarget).hasClass("valid-activity")){
			callLogUserActivity(e); 
		}
		triggerClickOnThisElemApp(e, $(this).find("img"));
	})

}

//  ###########################
//  Interest Inventory Popup View: To display popup on Login for first time
//  ###########################

/* 
 * Interest Inventory View
 */
function InventoryView() {
 
}

InventoryView.model = null;
InventoryView.template = null;

/* Inventory Popup init  */
InventoryView.init = function () {
    DisableNativeBottomBar(true);
    InventoryView.iSlides = 4;
    InventoryView.mySwiper = null;
    InventoryView.rightDraggedElem = '';
	InventoryView.qno = 0;
	InventoryView.currentTerm = '';
	
	InventoryView.render();
    InventoryView.bindEvents();
	InventoryView.currentSwiperPage = 0;
    InventoryView.facetListDOM = '';
    InventoryView.firstCurrentElem = null ;
};
Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + parseInt(days));
    return this;
};
/* Inventory Popup render */
InventoryView.render = function () {

	var fCallback = function (currentDate) {
		
		var iDates = JSON.parse(LibraryCarouselView.libraryProgressSummary.Content["InterestInventoryInfoProvidedDates"]);	

		if(LibraryCarouselView.libraryProgressSummary.Content["InterestInventoryInfoProvided"] == 'None'){
			
			//alert("entered in None");
			InventoryView.currentTerm = "BOY";
			
		}
		else if(LibraryCarouselView.libraryProgressSummary.Content.InterestInventoryInfoProvided == 'B' && iDates.B_DT != ''){
			
			//alert("entered in B");
			
			var lastInventorySubmitDate  = new Date(iDates.B_DT.replace(/-/g, "/"));
			var lastInventorySubmitDate2  = new Date(iDates.B_DT.replace(/-/g, "/"));
			var lastDateWithBOYTimeFrame = lastInventorySubmitDate.addDays(LIBRARY.c_i_MOY_TIMEFRAME);
			
			//alert(currentDate.split(" ")[0]+" :::: "+iDates.B_DT);
			
			//alert(new Date(currentDate.replace(/-/g, "/"))+"  >= "+lastDateWithBOYTimeFrame);
			
			if (new Date(currentDate.replace(/-/g, "/"))  >= lastDateWithBOYTimeFrame){
				
				//alert("to show MOY");
				
				InventoryView.currentTerm = "MOY";
				
			}
			else{
			
				//alert("to show nothing after moy condition");
				
				//alert(new Date(currentDate.replace(/-/g, "/"))+"  >= "+lastDateWithBOYTimeFrame);
				
				DisableNativeBottomBar(false);
				return;
				
			}
		}
		else if(LibraryCarouselView.libraryProgressSummary.Content.InterestInventoryInfoProvided == 'M' && iDates.B_DT != ''){
			
			//alert("entered in M");
			
			var lastInventorySubmitDate  = new Date(iDates.B_DT.replace(/-/g, "/"));
			
			//alert(lastInventorySubmitDate);
			
			//alert(new Date(currentDate.replace(/-/g, "/")) +" >= "+lastInventorySubmitDate.addDays(LIBRARY.c_i_EOY_TIMEFRAME));
			
			if(new Date(currentDate.replace(/-/g, "/")) >= lastInventorySubmitDate.addDays(LIBRARY.c_i_EOY_TIMEFRAME)){
				
				//alert("to show EOY");
				
				InventoryView.currentTerm = "EOY";
				
			}
			else{
			
				//alert("to show nothing after eoy condition");
				
				DisableNativeBottomBar(false);
				return;
				
			}
		}
		else{
			
			//alert("No condition met");
			
			DisableNativeBottomBar(false);
			return;
			
		}

		LibraryHeaderView.mainContainerHtml = Application.mainContainer.html();
		$("#InventoryPopupContainer").html(_.template($("#InventoryTemplate").html()));
		
		var sGrade = InventoryView.currentTerm; 
		var InterestInventoryData = '';
		switch(sGrade){
			case "BOY":
            InterestInventoryData = LIBRARY.c_o_INTEREST_INVENTORY_DATA.BOY;            
            readThis(ARIA_LBL.SLIDER_HEADER_BOY);			
			break;
			
			case "MOY":
			InterestInventoryData = LIBRARY.c_o_INTEREST_INVENTORY_DATA.MOY;
			InventoryView.iSlides = 3; // For mid and end of year Interest Inventory, remove the Areas of Interest.
            readThis(ARIA_LBL.SLIDER_HEADER_MOY);
            break;
			
			case "EOY":
			InterestInventoryData = LIBRARY.c_o_INTEREST_INVENTORY_DATA.EOY;
			InventoryView.iSlides = 3; // For mid and end of year Interest Inventory, remove the Areas of Interest.
            readThis(ARIA_LBL.SLIDER_HEADER_EOY);
            break;
			
			default:
			InterestInventoryData = LIBRARY.c_o_INTEREST_INVENTORY_DATA.BOY;
			
		}
		
		//set bg
		$(".md-content.interestInventory").css("background-image","url(media/"+InterestInventoryData.LandingPageImage+")")
		
		var cnt = -1;
		$("#inventoryform").html(
				_.template($("#InventorySwiper").html())
				);

		for (var i = 0; i < InventoryView.iSlides; i++) {
			var qcounter = $("#qcounter").attr("value");
			var iqcounter = $("#iqcounter").attr("value");
			$("#inventorySlide" + i).html(
					_.template($("#inventorySlideTemplate" + i).html(),{"data":InterestInventoryData, "cnt":cnt, "gtype":sGrade, "scnt":qcounter, "iqcounter":iqcounter})
					);
					
		}
		
		$("#facetList").html(
					_.template($("#tplFacetList").html(),{})
					);
		
		//keep it to reset the list ILIT-788
		InventoryView.facetListDOM = $("#facetList").html();
		
		$("#userFacets").html(
					_.template($("#tplUserFacets").html(),{})
					);			
         
        var elem = document.getElementById("nxtButton");
		setTimeout(function () {  
            /* Start for A11y */
            elem.focus();           
            elem.setAttribute('tabindex','0');    
            elem.setAttribute('aria-label',ARIA_LBL.SLIDER_NEXT_BUTTON_2);   
            elem.addEventListener('keydown',handleNextbtnEvent ,false);
            elem.addEventListener('click',handleNextbtnClickEvent ,false);     
            //$('#userFacets').find('li').attr('data-draggable','targets');  
            /* End for A11y */   

            //nextButton.handleTab();    
			InventoryView.initSwiper();
			InventoryView.initDragDrop();
			InventoryView.bindEvents();
        }, 100);
        /* Start for A11y (Handle Event) */
        function handleNextbtnEvent(event){
            handleTab(event,event.target,event.target,event.target);                           
            if(event.keyCode == 32 || event.keyCode == 13){                
                elem.removeEventListener('keydown',handleNextbtnEvent,false);               
            }
        }
        function handleNextbtnClickEvent(event){           
           elem.removeEventListener('keydown',handleNextbtnEvent,false);  
           elem.removeEventListener('click',handleNextbtnClickEvent,false);                 
        }
        /* End for A11y (Handle Event) */   


		$("body").css({overflow: "hidden"}); // protect background scroll
		
		//adjust question 
		if(sGrade == "BOY"){
			$("#inventorySlide1 .pollview-form").append(
				$("#inventorySlide2").find(".question").first()
			);
		}
		
		
	}
	
	$.nativeCall({
		'method': 'getCurrentDeviceTimestamp',
		'globalResource': 'objGetCurrentDeviceTimestamp',
		'checkSuccess': function (oResponse) {
			return oResponse != null;
		   },
		'onComplete': function () {
		   var currentDate = objGetCurrentDeviceTimestamp.currentDeviceTimestamp;
		    //alert(objGetCurrentDeviceTimestamp);
		   fCallback(currentDate);
		}
	});
};

InventoryView.initSwiper = function (e) {
    var inputs = $(document).find('select, input, textarea, button, a').filter(':visible');   
    $(inputs).each(function(){
       var tbindex=$(this).attr("tabindex");
       $(this).attr("data-index",tbindex);
       $(this).attr("tabindex",-1);
    });   
    $('#mainCarouselArea').attr('aria-hidden',true);
    $('#LibraryHeaderAreaContainer').attr('aria-hidden',true);
    $('#mainCarouselArea').css('display','none');
    $('#slide1').attr("aria-hidden",'true');
    $('#slide2').attr("aria-hidden",'true');
    $('#slide3').attr("aria-hidden",'true');

    
    if(oPlatform.isDevice()){
      $('#dynamicTextForSR').attr("aria-hidden",'true');  
      $('#inventoryform .button_area').attr('style', 'top: 50px !important');  
      $('#inventoryform .swiper-container').attr('style', 'bottom: -76px !important');
      if(InventoryView.currentTerm =='BOY'){
        $('#nxtButton').attr('aria-label',ARIA_LBL.SLIDER_HEADER_BOY+" Next");
      }else if(InventoryView.currentTerm =='MOY'){
        $('#nxtButton').attr('aria-label',ARIA_LBL.SLIDER_HEADER_MOY+" Next");
      }else if(InventoryView.currentTerm =='EOY'){
        $('#nxtButton').attr('aria-label',ARIA_LBL.SLIDER_HEADER_EOY+" Next");
      }      
    }else if(oPlatform.isChromeApp()){
		
	}
    else{
        if (typeof window.parent != "undefined"){
            outerElement = window.parent.document.getElementById("footer-btn-cont");
            outerElement.setAttribute('aria-hidden',true);
        }
    }

    $('#nxtButton').attr("tabindex",0); 
    $('#backButton').attr("tabindex",0);
    $('#resetInventory').attr("tabindex",0);
    //$('#submitInventory').attr("tabindex",0);
    
    if (typeof e !== 'undefined' && (e.target.id == 'resetInventory')) {
        $(".modal-head").css({visibility: 'visible'});
    } else {
        $(".modal-head").css({visibility: 'hidden'});
    }

    InventoryView.mySwiper = new Swiper('#inventoryform .swiper-container', {
        pagination: '.inventory-popup .swiper-pagination',
        slidesPerView: 1,
        noSwiping: true,
        paginationClickable: false,
        onSlideChangeEnd: function (swiperHere) {
			$(".md-content").css("background-image", "none");
            var swiperPage = InventoryView.mySwiper.activeIndex;
			InventoryView.currentSwiperPage = swiperPage; // For mid and end of year Interest Inventory, remove the Areas of Interest.
			//alert(swiperPage);
            if (swiperPage > 0) {
                $(".modal-head").css({visibility: 'visible'});
                //$("#inventorySlide" + swiperPage).find(".nextBtn").attr("disabled",!InventoryView.isValidSlideData(swiperPage));
                $("#nxtButton").attr("disabled",!InventoryView.isValidSlideData(swiperPage));
				
            } else {
                $(".modal-head").css({visibility: 'hidden'});
				
            }
            if (swiperPage == '3') {
				 $("#nxtButton").hide();
                $("#submitInventory").show().attr("disabled", !InventoryView.isValidSlideData(swiperPage));
				$("#resetInventory").show();
            }
            //set swiper pagination dot IPP-5920
            /* $(".swiper-pagination span").removeClass();
             for(var iI=0; iI<swiperPage; iI++){
             $(".swiper-pagination span").eq(iI).addClass('swiper-active-switch');
             } */
			if (swiperPage <= 1) {
				$("#backButton").hide();
			}else{
				$("#backButton").show();
			}
			if (swiperPage != 3) {
				$("#resetInventory").hide();
				 $("#submitInventory").hide();
				  $("#nxtButton").show();
			}	 
			
			// For mid and end of year Interest Inventory, remove the Areas of Interest.
			//show submit in 3rd slide in case 4th slide is now shown
			if(InventoryView.iSlides == 3 && swiperPage == 2){
				$("#nxtButton").hide();
				$("#submitInventory").attr("disabled",!InventoryView.isValidSlideData(2)).show();
			}
			// End For mid and end of year Interest Inventory, remove the Areas of Interest.
		
			//ILIT-1077
			$(".interestInventoryForm[id != 'interestInventoryFormSlide"+swiperPage+"']").find('input, select')
				.prop("tabindex","-1")
				.promise().done(function(){
					$(".interestInventoryForm[id = 'interestInventoryFormSlide"+swiperPage+"']").find('input, select').removeAttr("tabindex");
            });
            // Webaccessbility for Inventory section
            InventoryView.a11yInventory(swiperPage);			
        }
    });
    setTimeout(function(){
		InventoryView.swiperResize();
	},200);
};

/* Start to handle accessibility on interest inventory tab focus */

// Handle tabindexing for third slide first element

InventoryView.TabIndexing = function(formElemId){
    var inputs = $('#'+formElemId).find('select, input, textarea, button, a').filter(':visible');  
    $(inputs).each(function(){       
       $(this).attr("tabindex",0);
    });
}

InventoryView.TabThirdSlideFirstElement = function(){
    
    var resetInventory   =  document.getElementById('resetInventory'), submitInventory = document.getElementById('submitInventory'), firstIndex =  document.querySelector('.facet'), bckbtnElem     =  document.getElementById('backButton');
    //firstIndex.focus();
    //InventoryView.firstCurrentElem = firstIndex ;
    firstIndex.addEventListener('keydown',function(event){
         if(submitInventory.disabled){
             handleTab(event,event.target,event.target,resetInventory);
         }else{
             handleTab(event,event.target,event.target,submitInventory);
         }
                 
     });   
             
     resetInventory.addEventListener('keydown',function(event){
         if(submitInventory.disabled){                            
             handleTab(event,event.target,firstIndex,event.target);
          }else{                           
             submitInventory.addEventListener('keydown',function(event){
                 handleTab(event,event.target,firstIndex,event.target); 
             });                            
          }
     });
     bckbtnElem.addEventListener('keydown',function(event){            
         handleTab(event,event.target,firstIndex,resetInventory);
     });
     submitInventory.addEventListener('keydown',function(event){
        handleTab(event,event.target,firstIndex,event.target); 
    });

}

InventoryView.a11yInventory = function (swiperPage){    
    var dragdropElem   =  document.getElementById('facetList') ;    
    var items = document.querySelectorAll('.draggable_box') ;    
    var sGrade = InventoryView.currentTerm ;

    if(swiperPage == 1){   
        $('#slide0').attr("aria-hidden",'true');
        $('#slide1').attr("aria-hidden",'false');
        $('#slide2').attr("aria-hidden",'true');    
        $('#slide3').attr("aria-hidden",'true'); 
        $('#nxtButton').attr("aria-hidden",'false');       
        InventoryView.TabIndexing('interestInventoryFormSlide1');        
        dragdropElem.removeAttribute('tabindex');
        // CLAS-1069 start for survey page accessibility
        $("#facetList").attr("tabindex","-1");
        // CLAS-1069 end for survey page accessibility
        $('#nxtButton').attr('aria-label',ARIA_LBL.SLIDER_NEXT_BUTTON_2);
        for(var i=0; i<items.length; i++){
            items[i].removeAttribute('tabindex');
        }

        var enjRadiobtnByname ;        
        if(sGrade == "BOY"){
            enjRadiobtnByname  = document.getElementsByName("enjoyReading")
        }else if(sGrade == "MOY"){
            enjRadiobtnByname  = document.getElementsByName("enjoyIlitExp")
        }else if(sGrade == "EOY"){
            enjRadiobtnByname  = document.getElementsByName("enjoyIlitExp")
        }        

        var enjReadingRadioButtons = document.getElementById("enjoyRead_Y"); 
        var endTag = document.getElementById("timeSpendingReading");   
        var nextBtnElm = document.getElementById('nxtButton') ;   
        

        if(oPlatform.isDevice()){
            $('#readerSurvey').attr("tabindex",-1).focus();            
            $('#interestInventoryFormSlide1').css('margin-top','32px');
            $('#nxtButton').attr("aria-hidden",'false');
            if($('#nxtButton').attr('disabled')){
               $('#nxtButton').attr("aria-hidden",'true'); 
            }   
            $('#backButton').attr("aria-hidden",'true');      
            
            if(sGrade == "BOY"){
                    var familyLikeToRead = document.getElementsByName("familyLikeToRead");
                    for(var i=0; i<familyLikeToRead.length; i++){                        
                        var ariLabelText1 = familyLikeToRead[0].nextSibling.innerHTML;
                        familyLikeToRead[0].setAttribute('aria-label',$('#radio_grp_label_4').html()+" "+ariLabelText1);  
                        break ;             
                    }                       
                    for(var i=0; i<enjRadiobtnByname.length; i++){                        
                        var ariLabelText = enjRadiobtnByname[0].nextSibling.innerHTML;
                        enjRadiobtnByname[0].setAttribute('aria-label',$('#radio_grp_label_1').html()+" "+ariLabelText); 
                        break ;              
                    }
                    
            }
            
            

        }else{      
            $('#interestInventoryFormSlide1 :input:enabled:visible:first').focus();          
            InventoryView.a11ySelectInventory('booksReadLastYear'); 
            InventoryView.a11ySelectInventory('timeSpendingReading');                    
            for(var i=0; i<enjRadiobtnByname.length; i++){
                enjRadiobtnByname[i].addEventListener('keydown',function(event){                        
                    if(nextBtnElm.disabled){
                        handleTab(event,event.target,event.target,endTag);
                    }else{
                        handleTab(event,event.target,event.target,nextBtnElm);
                    }              
                
                }); 
            }                              
        
            endTag.addEventListener('keydown',function(event){
                    if(nextBtnElm.disabled){                            
                        handleTab(event,event.target,enjReadingRadioButtons,event.target);
                    }else{                           
                        nextBtnElm.addEventListener('keydown',function(event){                            
                            handleTab(event,event.target,enjReadingRadioButtons,event.target); 
                        });                            
                    }
                    
            });
        }
       
               
    }else if(swiperPage == 2){
        $('#slide0').attr("aria-hidden",'true');
        $('#slide1').attr("aria-hidden",'true');
        $('#slide2').attr("aria-hidden",'false');    
        $('#slide3').attr("aria-hidden",'true');
        $('#nxtButton').attr("aria-hidden",'false'); 
         
        InventoryView.TabIndexing('interestInventoryFormSlide2'); 
        dragdropElem.removeAttribute('tabindex');
        // CLAS-1069 start for survey page accessibility
        $("#facetList").attr("tabindex","-1");
        // CLAS-1069 end for survey page accessibility
        $('#nxtButton').attr('aria-label',ARIA_LBL.SLIDER_NEXT_BUTTON_2);
        for(var i=0; i<items.length; i++){
            items[i].removeAttribute('tabindex');
        }
        
        var accessToLocalLibraryRadio ;
        if(sGrade=="BOY"){
            accessToLocalLibraryRadio = document.getElementsByName('accessToLocalLibrary'); 
        }else if(sGrade=="MOY"){
            accessToLocalLibraryRadio = document.getElementsByName('timeSpendReading'); 
        }else if(sGrade=="EOY"){
            accessToLocalLibraryRadio = document.getElementsByName('timeSpendReading'); 
        }            
        var backBtnElem               = document.getElementById('backButton');
        var nextBtnElm                = document.getElementById('nxtButton') ;
         
        if(oPlatform.isDevice()){
            $('#readerSurvey').attr("tabindex",-1).focus();            
            $('#interestInventoryFormSlide2').css('margin-top','32px');
            $('#nxtButton').attr("aria-hidden",'false'); 
            if($('#nxtButton').attr('disabled')){
              $('#nxtButton').attr("aria-hidden",'true'); 
            }
            $('#backButton').attr("aria-hidden",'false');  
            

            if(sGrade == "BOY"){                                      
                for(var i=0; i<accessToLocalLibraryRadio.length; i++){
                    var ariLabelText = accessToLocalLibraryRadio[0].nextSibling.innerHTML;
                    accessToLocalLibraryRadio[0].setAttribute('aria-label',$('#radio_grp_slide3_label_1').html()+" "+ariLabelText); 
                    break ;              
                }
                


            }
        }else{                    
            $('#interestInventoryFormSlide2 :input:enabled:visible:first').focus();
            for(var i=0; i<accessToLocalLibraryRadio.length; i++){
                accessToLocalLibraryRadio[i].addEventListener('keydown',function(event){
                    if(nextBtnElm.disabled){
                        handleTab(event,event.target,event.target,backBtnElem);
                    }else{
                        handleTab(event,event.target,event.target,nextBtnElm);
                    }
                })
            }
            backBtnElem.addEventListener('keydown',handlebckBtn,false);
            nextBtnElm.addEventListener('keydown',handleNxtBtn,false);            
            function handlebckBtn(event){                        
                if(nextBtnElm.disabled){                            
                    handleTab(event,event.target,accessToLocalLibraryRadio[0],event.target);
                    if(event.keyCode == 32 || event.keyCode == 13){                        
                        backBtnElem.removeEventListener('keydown',handlebckBtn,false); 
                        nextBtnElm.removeEventListener('keydown',handleNxtBtn,false);               
                    }
                }else{                           
                    nextBtnElm.addEventListener('keydown',function(event){
                        handleTab(event,event.target,accessToLocalLibraryRadio[0],event.target); 
                        if(event.keyCode == 32 || event.keyCode == 13){                        
                            backBtnElem.removeEventListener('keydown',handlebckBtn,false);               
                        }
                    });                            
                }
            }
            function handleNxtBtn(event){
                if(event.keyCode == 32 || event.keyCode == 13){                        
                    backBtnElem.removeEventListener('keydown',handlebckBtn,false); 
                    nextBtnElm.removeEventListener('keydown',handleNxtBtn,false);               
                } 
            }
        }


    }else if(swiperPage == 3){
        $('#nxtButton').attr("aria-hidden",'true');
        $('#slide0').attr("aria-hidden",'true');
        $('#slide1').attr("aria-hidden",'true');
        $('#slide2').attr("aria-hidden",'true');    
        $('#slide3').attr("aria-hidden",'false');  
        
        InventoryView.TabIndexing('interestInventoryFormSlide3');       
        if(oPlatform.isDevice()){
            $('#resetInventory').attr("aria-hidden",'false');  
            $('#submitInventory').attr("aria-hidden",'false'); 
            $('#interestInventoryFormSlide3').css('margin-top','32px');
        }else{
            dragdropElem.setAttribute('role','list');
        }       
        InventoryView.TabThirdSlideFirstElement();    
        InventoryView.DragDropByKeyboardLeft();
        InventoryView.DragDropByKeyboardRight();
        var firstIndex =  document.querySelector('.facet');
        if(oPlatform.isDevice()){
            $('#readerSurvey').attr("tabindex",-1).focus();            
        }else{
            firstIndex.focus();	
        }
    }
};

/* Start Drag & Drop by keyboard for leftside */
InventoryView.getElementByClassName = function(objElement, strTagName, strClassName){

    var objCollection = objElement.getElementsByTagName(strTagName);
	var arReturn = [];
	var strClass, arClass, iClass, iCounter;

	for(iCounter=0; iCounter<objCollection.length; iCounter++)
	{
		strClass = objCollection[iCounter].className;
		if (strClass)
		{
			arClass = strClass.split(' ');
			for (iClass=0; iClass<arClass.length; iClass++)
			{
				if (arClass[iClass] == strClassName)
				{
					arReturn.push(objCollection[iCounter]);
					break;
				}
			}
		}
	}

	objCollection = null;
	return (arReturn);

}

InventoryView.dragBykeyboard = {
    objCurrent : null,
    arTargets : ['dropbox_0', 'dropbox_1', 'dropbox_2', 'dropbox_3', 'dropbox_4'],
    arTargetsName : ['Priority Box 1', 'Priority Box 2', 'Priority Box 3', 'Priority Box 4', 'Priority Box 5'],
    initialise : function(objNode)
	{
		// Add event handlers
        objNode.onmousedown = InventoryView.dragBykeyboard.start;
        if(oPlatform.isDevice()){
            objNode.onclick   = InventoryView.dragBykeyboard.keyboardDragDrop ;
        }else if(oPlatform.isChromeApp()){
            objNode.onclick   = InventoryView.dragBykeyboard.keyboardDragDrop;
            objNode.onkeydown = InventoryView.dragBykeyboard.keyboardDragDrop;
        }else{
           objNode.onkeydown = InventoryView.dragBykeyboard.keyboardDragDrop;           
        }     
	
	},

	keyboardDragDrop : function(objEvent)
	{        
		objEvent = objEvent || window.event;
		InventoryView.dragBykeyboard.objCurrent = this;
		var arChoices = ['Priority Box 1', 'Priority Box 2', 'Priority Box 3', 'Priority Box 4', 'Priority Box 5'], iKey = objEvent.keyCode, objItem = InventoryView.dragBykeyboard.objCurrent,strExisting = objItem.parentNode.getAttribute('id'),objMenu, objChoice, iCounter;
			if (iKey == 32 || iKey == 13 || objEvent.type=='click')
			{
                //alert(objEvent.type);
                objEvent.preventDefault();
				document.onkeydown = function(){return objEvent.keyCode==38 || objEvent.keyCode==40 ? false : true;};
				// Set ARIA properties
				InventoryView.dragBykeyboard.objCurrent.setAttribute('aria-grabbed', 'true');
                InventoryView.dragBykeyboard.objCurrent.setAttribute('aria-owns', 'popup');
                //InventoryView.dragBykeyboard.objCurrent.setAttribute('tabindex', '-1');
				// Build context menu
                objMenu = document.createElement('ul');
                if(oPlatform.isDevice() || oPlatform.isChromeApp()){
                    objMenu.setAttribute('id', 'popupdevice');
                }else{
                    objMenu.setAttribute('id', 'popup');
                }				
                objMenu.setAttribute('role', 'menu');
                //objMenu.setAttribute('aria-hidden', 'false');
                // $('#facetList').attr('aria-hidden',true);
				for (iCounter=0; iCounter<arChoices.length; iCounter++)
				{
					if (InventoryView.dragBykeyboard.arTargets[iCounter] != strExisting)
					{
						objChoice = document.createElement('li');
						objChoice.appendChild(document.createTextNode(arChoices[iCounter]));
                        objChoice.tabIndex = 0;
                        objChoice.setAttribute('style', 'cursor:pointer');
                        if(oPlatform.isDevice()){
                            objChoice.setAttribute('role', 'button');
                        }else{
                            objChoice.setAttribute('role', 'listitem');
                        }  
                        objChoice.setAttribute('aria-live', 'assertive');                        
                        objChoice.setAttribute('aria-label', 'Click enter to move into '+arChoices[iCounter]);
                        
                        if(oPlatform.isDevice()){
                            objChoice.onmousedown = function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                InventoryView.dragBykeyboard.dropObject(this.firstChild.data.slice(-1));
                                InventoryView.dragBykeyboard.objCurrent.setAttribute('tabindex', '0');                        
                            }; 
                        }else if(oPlatform.isChromeApp()){
                            objChoice.onkeydown = InventoryView.dragBykeyboard.handleContext;
                            objChoice.onmousedown = function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                InventoryView.dragBykeyboard.dropObject(this.firstChild.data.slice(-1));
                                InventoryView.dragBykeyboard.objCurrent.setAttribute('tabindex', '0');                        
                            };
                        }else{
                            objChoice.onkeydown = InventoryView.dragBykeyboard.handleContext;         
                        }                        						
						objMenu.appendChild(objChoice);
					}
                }
                if(oPlatform.isDevice() || oPlatform.isChromeApp()){
                    var id = InventoryView.dragBykeyboard.objCurrent.getAttribute('id');                    
                    $(objMenu).insertAfter($("#"+id));
                }else{
                    objItem.appendChild(objMenu);
                }
                
				objMenu.firstChild.focus();
				objMenu.firstChild.className = 'focus';
                InventoryView.dragBykeyboard.identifyTargets(true);
                if(oPlatform.isDevice() || oPlatform.isChromeApp()){
                InventoryView.ControlTabIndexForAllSlide(document,'div', 'draggable_box','remove');
                InventoryView.ControlTabIndexForAllSlide(document,'li', 'cet','remove');
                }
                
			}
	},

	removePopup : function()
	{
		document.onkeydown = null;
        if(oPlatform.isDevice() || oPlatform.isChromeApp()){ 
            var objContext = document.getElementById('popupdevice');
        }else{
            var objContext = document.getElementById('popup');
        }
		
		if (objContext)
		{
			objContext.parentNode.removeChild(objContext);
		}
	},

	handleContext : function(objEvent)
	{
        
		objEvent = objEvent || window.event;
		var objItem = objEvent.target || objEvent.srcElement;
		var iKey = objEvent.keyCode;
        var objFocus, objList, strTarget, iCounter;
        InventoryView.dragBykeyboard.objCurrent.setAttribute('tabindex',0);
		// Cancel default behaviour
		if (objEvent.stopPropagation)
		{
			objEvent.stopPropagation();
		}
		else if (objEvent.cancelBubble)
		{
			objEvent.cancelBubble = true;
		}
		if (objEvent.preventDefault)
		{   
			objEvent.preventDefault();
		}
		else if (objEvent.returnValue)
		{
			objEvent.returnValue = false;
		}

		switch (iKey)
		{
            case 40 : // down arrow             
                objFocus = objItem.nextSibling;                               
				if (objFocus)
				{
                    //objFocus = objItem.previousSibling;
                    objItem.className = '';
				    objFocus.focus();
			    	objFocus.className = 'focus';
				}
				
				break;
			case 38 : // up arrow
                objFocus = objItem.previousSibling;                              
				if (objFocus)
				{
                    //objFocus = objItem.nextSibling;
                    objItem.className = '';
				    objFocus.focus();
			    	objFocus.className = 'focus';
				}
				
				break;
            case 13 : // Enter                
                strTarget = objItem.firstChild.data.slice(-1);                
				InventoryView.dragBykeyboard.dropObject(strTarget);
				break;
			case 27 : // Escape
			case 9  : // Tab
                InventoryView.dragBykeyboard.objCurrent.removeAttribute('aria-owns');
				InventoryView.dragBykeyboard.objCurrent.removeChild(objItem.parentNode);
                InventoryView.dragBykeyboard.objCurrent.focus();
                
				for (iCounter=0; iCounter<InventoryView.dragBykeyboard.arTargets.length; iCounter++)
				{
					objList = document.getElementById(InventoryView.dragBykeyboard.arTargets[iCounter]);
					InventoryView.dragBykeyboard.objCurrent.setAttribute('aria-grabbed', 'false');
					objList.removeAttribute('aria-dropeffect');
					//objList.className = '';
				}
				break;
		}
	},

	start : function(objEvent)
	{
		objEvent = objEvent || window.event;
		InventoryView.dragBykeyboard.removePopup();
		// Initialise properties
		InventoryView.dragBykeyboard.objCurrent = this;
		InventoryView.dragBykeyboard.objCurrent.lastX = objEvent.clientX;
		InventoryView.dragBykeyboard.objCurrent.lastY = objEvent.clientY;
		//InventoryView.dragBykeyboard.objCurrent.style.zIndex = '2';
		InventoryView.dragBykeyboard.objCurrent.setAttribute('aria-grabbed', 'true');		
		InventoryView.dragBykeyboard.identifyTargets(true);
		return false;
	},

	drag : function(objEvent)
	{
		objEvent = objEvent || window.event;

		// Calculate new position
		var iCurrentY = objEvent.clientY;
		var iCurrentX = objEvent.clientX;
		var iYPos = parseInt(InventoryView.dragBykeyboard.objCurrent.style.top, 10);
		var iXPos = parseInt(InventoryView.dragBykeyboard.objCurrent.style.left, 10);
		var iNewX, iNewY;

		iNewX = iXPos + iCurrentX - InventoryView.dragBykeyboard.objCurrent.lastX;
		iNewY = iYPos + iCurrentY - InventoryView.dragBykeyboard.objCurrent.lastY;

		InventoryView.dragBykeyboard.objCurrent.style.left = iNewX + 'px';
		InventoryView.dragBykeyboard.objCurrent.style.top = iNewY + 'px';
		InventoryView.dragBykeyboard.objCurrent.lastX = iCurrentX;
		InventoryView.dragBykeyboard.objCurrent.lastY = iCurrentY;

		return false;
	},

	calculatePosition : function (objElement, strOffset)
	{
		var iOffset = 0;

		// Get offset position in relation to parent nodes
		if (objElement.offsetParent)
		{
			do 
			{
				iOffset += objElement[strOffset];
				objElement = objElement.offsetParent;
			} while (objElement);
		}

		return iOffset;
	},

	identifyTargets : function (bHighlight)
	{
        var strExisting = InventoryView.dragBykeyboard.objCurrent.parentNode.getAttribute('id');
		var objList, iCounter;
		// Highlight the targets for the current drag item
		for (iCounter=0; iCounter<InventoryView.dragBykeyboard.arTargets.length; iCounter++)
		{
			objList = document.getElementById(InventoryView.dragBykeyboard.arTargets[iCounter]);
			if (bHighlight && InventoryView.dragBykeyboard.arTargets[iCounter] != strExisting)
			{
				//objList.className = 'highlight';
				objList.setAttribute('aria-dropeffect', 'move');
			}
			else
			{
				//objList.className = '';
				objList.removeAttribute('aria-dropeffect');
			}
		}
	},

	getTarget : function()
	{
		var strExisting  =  InventoryView.dragBykeyboard.objCurrent.parentNode.getAttribute('id');
		var iCurrentLeft =  InventoryView.dragBykeyboard.calculatePosition(drag.objCurrent, 'offsetLeft');
		var iCurrentTop  =  InventoryView.dragBykeyboard.calculatePosition(drag.objCurrent, 'offsetTop');
		var iTolerance   =  40;
		var objList, iLeft, iRight, iTop, iBottom, iCounter;

		for (iCounter=0; iCounter<InventoryView.dragBykeyboard.arTargets.length; iCounter++)
		{
			if (InventoryView.dragBykeyboard.arTargets[iCounter] != strExisting)
			{
				// Get position of the list
				objList = document.getElementById(InventoryView.dragBykeyboard.arTargets[iCounter]);
				iLeft = InventoryView.dragBykeyboard.calculatePosition(objList, 'offsetLeft') - iTolerance;
				iRight = iLeft + objList.offsetWidth + iTolerance;
				iTop = InventoryView.dragBykeyboard.calculatePosition(objList, 'offsetTop') - iTolerance;
				iBottom = iTop + objList.offsetHeight + iTolerance;

				// Determine if current object is over the target
				if (iCurrentLeft > iLeft && iCurrentLeft < iRight && iCurrentTop > iTop && iCurrentTop < iBottom)
				{
					return InventoryView.dragBykeyboard.arTargets[iCounter];
				}
			}
		}

		// Current object is not over a target
		return '';
	},

	dropObject : function(strTarget)
	{
		var objClone, objOriginal, objTarget, objEmpty, objBands, objItem , objText, objAttr;

		InventoryView.dragBykeyboard.removePopup();
        $('#facetList').attr('aria-hidden',false);
		if (strTarget.length > 0)
		{
			// Copy node to new target
			objOriginal = InventoryView.dragBykeyboard.objCurrent.parentNode;
            objClone = InventoryView.dragBykeyboard.objCurrent.cloneNode(true);
            objText =  InventoryView.dragBykeyboard.objCurrent.innerHTML ;
            objAttr =  InventoryView.dragBykeyboard.objCurrent.getAttribute('data-item-code') ;            ;
            readThis(objText+" dropped");
			// Remove previous attributes
			 objClone.removeAttribute('style');
			//objClone.className = objClone.className.replace(/\s*focused/, '');
			//objClone.className = objClone.className.replace(/\s*hover/, '');
			// Add focus indicators
			//objClone.onfocus = function() {this.className += ' focused'; };
			//objClone.onblur = function() {this.className = this.className.replace(/\s*focused/, '');};
            
            objTarget = document.getElementById('dropbox_'+(Number(strTarget)-1));
            if(objTarget.innerText){                             
             InventoryView.dragBykeyboard.objCurrent.innerHTML = objTarget.innerText ;
             InventoryView.dragBykeyboard.objCurrent.setAttribute('data-item-code',objTarget.getAttribute('data-item-code')); 
             InventoryView.dragBykeyboard.objCurrent.focus();   

            }else{               
             var ObjFocusNext,ObjFocuPrevious ;
             ObjFocusNext    = InventoryView.dragBykeyboard.objCurrent.nextElementSibling ;  
             ObjFocuPrevious = InventoryView.dragBykeyboard.objCurrent.previousElementSibling ; 
             if(ObjFocusNext != null){
                ObjFocusNext.focus();
             }else if(ObjFocuPrevious != null){
                ObjFocuPrevious.focus();
             }        
             objOriginal.removeChild(InventoryView.dragBykeyboard.objCurrent);
            }			
            objTarget.innerHTML  =  objText;
            objTarget.tabIndex   =  0 ;            
            var arilLabelText = objTarget.getAttribute('aria-label');
                arilLabelText = arilLabelText.substr(0, 14);
            objTarget.setAttribute('data-item-code',objAttr);  
            objTarget.setAttribute('aria-label',arilLabelText+" "+objText);  
            InventoryView.dragBykeyboard.objCurrent = objClone;
            $("#submitInventory").attr("disabled", !InventoryView.isValidSlideData(3));
            InventoryView.TabThirdSlideFirstElement();
			//InventoryView.dragBykeyboard.initialise(objClone);

			
            if(oPlatform.isDevice() || oPlatform.isChromeApp()){              
                InventoryView.ControlTabIndexForAllSlide(document,'div', 'draggable_box','add');
                InventoryView.ControlTabIndexForAllSlide(document,'li', 'cet','add');
            }
		}            
            //InventoryView.dragBykeyboard.identifyTargets(false);
	},

	end : function()
	{
		var strTarget = InventoryView.dragBykeyboard.getTarget();

		InventoryView.dragBykeyboard.dropObject(strTarget);

		//document.onmousemove = null;
		//document.onmouseup   = null;
		InventoryView.dragBykeyboard.objCurrent = null;
	}

}

InventoryView.ControlTabIndexForAllSlide = function(objElement, strTagName, strClassName, type){
    var objItems = InventoryView.getElementByClassName(objElement,strTagName,strClassName), objItem, iCounter ;
    for(iCounter = 0; iCounter<objItems.length ; iCounter++){   
        if(type=='remove'){
            objItems[iCounter].tabIndex =  -1 ;
            objItems[iCounter].setAttribute('aria-hidden',true);
        }else if(type=='add'){
            objItems[iCounter].tabIndex =  0 ;
            objItems[iCounter].setAttribute('aria-hidden',false);
        }        
    }
    if(type=='remove'){
        $('#backButton').attr('tabindex','-1');
        $('#backButton').attr('aria-hidden',true);
        $('#resetInventory').attr('tabindex','-1');
        $('#resetInventory').attr('aria-hidden',true);
        $('#submitInventory').attr('tabindex','-1')
        $('#submitInventory').attr('aria-hidden',true);
    }else{
        $('#backButton').attr('tabindex','0');
        $('#backButton').attr('aria-hidden',false);
        $('#resetInventory').attr('tabindex','0');
        $('#resetInventory').attr('aria-hidden',false);
        $('#submitInventory').attr('tabindex','0')
        $('#submitInventory').attr('aria-hidden',false);
    }
    
}
InventoryView.DragDropByKeyboardLeft = function(){
    var objItems  = InventoryView.getElementByClassName(document, 'div', 'draggable_box'), objItem, iCounter ;      
    for(iCounter=0; iCounter<objItems.length; iCounter++){        
        objItems[iCounter].tabIndex =  0 ; 
        //  Set Aria attributes for left side draggble items
        //objItems[iCounter].setAttribute('aria-grabbed', 'false');
        objItems[iCounter].setAttribute('aria-haspopup', 'true');
        objItems[iCounter].setAttribute('role', 'button');        
        //Provide a focus indicator  

        if(oPlatform.isDevice()){
            objItems[iCounter].onfocus = function(event){  
             //setVoiceOverFocus(event.target); 
             //alert("on Focus");           
             var element = event.target;
             //element.scrollIntoView();
            };            
        }
       // objItems[iCounter].onblur  = function(){ this.className = this.className.replace(/\s*focused/, ''); };
        InventoryView.dragBykeyboard.initialise(objItems[iCounter]); 
    } 
    // Set ARIA properties on the drag and drop list, and set role of this region to application
    for(iCounter=0; iCounter<InventoryView.dragBykeyboard.arTargets.length; iCounter++){
        objItem = document.getElementById(InventoryView.dragBykeyboard.arTargets[iCounter]);        
        if(objItem.getAttribute('aria-label')=='' || objItem.getAttribute('aria-label')=='undefined' || objItem.getAttribute('aria-label')==null){
            objItem.setAttribute('aria-label', InventoryView.dragBykeyboard.arTargetsName[iCounter]);
        }
		//objItem.setAttribute('role', 'list');
    }
    objItems = null ;  

}
/* End Drag & Drop by keyboard for leftside */

/* Start Drag & Drop by keyboard for rightside */

InventoryView.dragBykeyboardRightSide = {
    objCurrent : null ,
    initialise : function(objNode)
	{              
      if(oPlatform.isDevice()){ 
       objNode.onclick   = InventoryView.dragBykeyboardRightSide.deviceDragDrop ;
       objNode.onfocus   = InventoryView.dragBykeyboardRightSide.focusDragDrop ;
      }else if(oPlatform.isChromeApp()){
        objNode.onkeydown = InventoryView.dragBykeyboardRightSide.keyboardDragDrop;
        objNode.onclick   = InventoryView.dragBykeyboardRightSide.deviceDragDrop ;
        objNode.onfocus   = InventoryView.dragBykeyboardRightSide.focusDragDrop ;
      }else{
        objNode.onkeydown = InventoryView.dragBykeyboardRightSide.keyboardDragDrop;
      }		
    },
    keyboardDragDrop :function(objEvent){
      objEvent = objEvent || window.event ;        
      InventoryView.dragBykeyboardRightSide.objCurrent = this ; 
      var iKey = objEvent.keyCode ; 
      //If space button is pressed
      if(iKey == 32){
        addClass(InventoryView.dragBykeyboardRightSide.objCurrent,'selected_right'); 
        InventoryView.dragBykeyboardRightSide.objCurrent.setAttribute('aria-selected','true');
        readThis(ARIA_LBL.SLIDER_4DROPPED);
      }
      //If tab button is pressed
      /*if(objEvent.shiftKey && iKey == 9){
        var objText = InventoryView.dragBykeyboardRightSide.objCurrent.innerText ;
        InventoryView.dragBykeyboardRightSide.objCurrent.setAttribute('aria-label',arilLabelText+" "+objText);
      }*/


      if(iKey == 9){
        removeClass(InventoryView.dragBykeyboardRightSide.objCurrent,'selected_right');
        InventoryView.dragBykeyboardRightSide.objCurrent.setAttribute('aria-selected','false');
        var arilLabelText = InventoryView.dragBykeyboardRightSide.objCurrent.getAttribute('aria-label');
        arilLabelText = arilLabelText.substr(0, 14);
        //console.log(arilLabelText);
        var objText = InventoryView.dragBykeyboardRightSide.objCurrent.innerText ;
        InventoryView.dragBykeyboardRightSide.objCurrent.setAttribute('aria-label',arilLabelText+" "+objText);
      }
      //If enter button is pressed
      if(iKey == 13){
        if(hasClass(InventoryView.dragBykeyboardRightSide.objCurrent,'selected_right')){
            readThis(ARIA_LBL.DROPPED);           
            removeClass(InventoryView.dragBykeyboardRightSide.objCurrent,'selected_right');
            var dataItemCode = InventoryView.dragBykeyboardRightSide.objCurrent.getAttribute('data-item-code') ,selectedText = InventoryView.dragBykeyboardRightSide.objCurrent.innerText, sourceElem = document.getElementById('facetList');
            var staticElement = '<div class="facet dropbox draggable_box swiper-no-swiping ui-draggable" data-item-code="'+dataItemCode+'" id="drop'+dataItemCode+'" tabindex="0" aria-grabbed="false" aria-haspopup="true" role="listitem" style="top: 0px; left: 0px; z-index: auto;">'+selectedText+'</div>' ;           
            $('#facetList').append(staticElement);
            InventoryView.dragBykeyboardRightSide.objCurrent.innerHTML = '';
            InventoryView.dragBykeyboardRightSide.objCurrent.setAttribute('data-item-code','');
            InventoryView.dragBykeyboardRightSide.objCurrent.removeAttribute('tabindex');
            InventoryView.dragBykeyboardRightSide.objCurrent.removeAttribute('aria-selected');
            InventoryView.dragBykeyboardRightSide.objCurrent.setAttribute('aria-label','');
            InventoryView.DragDropByKeyboardLeft();
            $("#submitInventory").attr("disabled", !InventoryView.isValidSlideData(3));
            InventoryView.initDragDrop();
            
        }else{
            removeClass(InventoryView.dragBykeyboardRightSide.objCurrent,'selected_right'); 
        } 
      }      
    },
    deviceDragDrop:function(objEvent){       
        if(InventoryView.dragBykeyboardRightSide.objCurrent !=null && InventoryView.dragBykeyboardRightSide.objCurrent.getAttribute('data-item-code')!=''){
        //removeClass(InventoryView.dragBykeyboardRightSide.objCurrent,'selected_right');
        InventoryView.dragBykeyboardRightSide.objCurrent.setAttribute('aria-selected','true');
        var dataItemCode = InventoryView.dragBykeyboardRightSide.objCurrent.getAttribute('data-item-code') ,selectedText = InventoryView.dragBykeyboardRightSide.objCurrent.innerText, sourceElem = document.getElementById('facetList');
        var staticElement = '<div class="facet dropbox draggable_box swiper-no-swiping ui-draggable" data-item-code="'+dataItemCode+'" id="drop'+dataItemCode+'" tabindex="0" aria-grabbed="false" aria-haspopup="true" role="listitem" style="top: 0px; left: 0px; z-index: auto;">'+selectedText+'</div>' ;           
        $('#facetList').append(staticElement);
        InventoryView.dragBykeyboardRightSide.objCurrent.innerHTML = '';
        InventoryView.dragBykeyboardRightSide.objCurrent.setAttribute('data-item-code','');
        InventoryView.dragBykeyboardRightSide.objCurrent.removeAttribute('tabindex');
        InventoryView.dragBykeyboardRightSide.objCurrent.removeAttribute('aria-selected');
        InventoryView.dragBykeyboardRightSide.objCurrent.setAttribute('aria-label','');        
        InventoryView.DragDropByKeyboardLeft();        
        $("#submitInventory").attr("disabled", !InventoryView.isValidSlideData(3));
        InventoryView.initDragDrop();
        }

    },
    focusDragDrop:function(objEvent){
    InventoryView.dragBykeyboardRightSide.objCurrent = this ;
    //   objEvent = objEvent || window.event ;
    //   if(InventoryView.dragBykeyboardRightSide.objCurrent != null){
    //     removeClass(InventoryView.dragBykeyboardRightSide.objCurrent,'selected_right');
    //   }
      
    //   if(InventoryView.dragBykeyboardRightSide.objCurrent.getAttribute('data-item-code')!=''){
    //     addClass(InventoryView.dragBykeyboardRightSide.objCurrent,'selected_right');
    //   }
    }
}

InventoryView.DragDropByKeyboardRight = function(){
    var objItems = InventoryView.getElementByClassName(document, 'li', 'cet'), objItem, iCounter ;
    
    for(iCounter = 0; iCounter<objItems.length ; iCounter++){
        // Put the list items into the keyboard tab order 
        //objItems[iCounter].tabIndex =  0 ;
        if(objItems[iCounter].getAttribute('data-item-code') != ''){
            objItems[iCounter].tabIndex =  0 ;
        }
        if(oPlatform.isDevice()){
            objItems[iCounter].setAttribute('role','button') ;            
        }
        InventoryView.dragBykeyboardRightSide.initialise(objItems[iCounter]); 
    }
}
/* End Drag & Drop by keyboard for rightside  */
InventoryView.a11ySelectInventory = function(id){
    if(id){        
       var drpdown = document.getElementById(id);
       //drpdown.addEventListener('keypress', InventoryView.listboxActionHandler);
       //drpdown.addEventListener('change', InventoryView.listboxChangeHandler);
       //drpdown.addEventListener('focus', InventoryView.listboxFocusHandler);
       //drpdown.addEventListener('blur', InventoryView.listboxBlurHandler);       
    }
}
InventoryView.listboxActionHandler = function(event){
   
  var type   = event.type ;
  var target = event.target ;  
    if(type == 'keydown'){
      // if space is pressed
       if(event.keyCode == 32){
         target.setAttribute('aria-expanded',false);
         target.size = 0;
       }
      // if enter is pressed
      if(event.keyCode == 13){
        target.setAttribute('aria-expanded',false);
        target.size = 0;
      }
    } 

}
InventoryView.listboxChangeHandler = function(event){
    //alert("call change event");   
    var target = event.target;
    var value  = event.target.value;    
    /*if (value) {
        target.setAttribute('aria-expanded', true);
    } else {
        target.setAttribute('aria-expanded', false);
    }*/
    // if (value) {
    //     target.setAttribute('aria-selected', true);
    // } else {
    //     target.setAttribute('aria-selected', false);
    // }
    //event.preventDefault();    
}
InventoryView.listboxFocusHandler = function(event){      
    var target = event.target,length = target.options.length,currentTerm = InventoryView.currentTerm; //'BOY';
    if(currentTerm=='BOY'){
        target.size = length-2;
    }else{
        target.size = length ;
    }    
    target.setAttribute('aria-expanded', true);
    
}
InventoryView.listboxBlurHandler = function(event){
    var target = event.target;
    target.size = 0;
    target.setAttribute('aria-expanded', false);
    
}
/*  End  A11Y */
InventoryView.swiperResize = function () {
    var _iWindowHeight = parseInt($(window).height(), 10),
            _iTotPadding = 200,
            _iRestrictedHeight = _iWindowHeight - _iTotPadding,
            _iContentHeight = _iRestrictedHeight - 80;
    _iListHeight = _iContentHeight - 70;

    $('#inventoryform .swiper-wrapper').css('height', _iRestrictedHeight + 'px');
    $('#inventoryform .swiper-slide').css('height', _iRestrictedHeight + 'px');
    
    $(".pollview-form").css('height', _iContentHeight + 'px');
    $(".facet-list").css('height', _iListHeight + 'px');
    $(".cet-list").css('height', _iListHeight + 'px');
	
	//set dynamic size for question for flexible spacing
	var maxNoOfQPerSlide = 4;
	var qHeight = Math.floor(parseInt
	(
		$(".pollview-form").height() - ( 
			parseInt($(".pollview-form").css('padding-top')) + 
			parseInt($(".pollview-form").css('padding-bottom')) 
		)
	)/maxNoOfQPerSlide);


	$(".question").css('height', qHeight);

	var isAndroid = /(android)/i.test(navigator.userAgent);
	var mq = window.matchMedia( "(min-device-width: 1600px) and (max-device-width: 2560px) and (orientation:landscape)" );
	if (mq.matches && isAndroid) {
	  $(".md-content.interestInventory").css("background-size", "100% 91%");
	} else {
	  $(".md-content.interestInventory").css("background-size", "100% 89%");
	} 
};

InventoryView.initDragDrop = function () {

    $(".facet").draggable({
        appendTo: "body",
        revertDuration: 100,
        refreshPositions: true,
        revert: 'invalid',
        zIndex: 9999,
        scroll: true,
        helper: function () {
            var oClone = $(this).clone(true);
            oClone.css({
                'margin-top': '2%',
                'margin-left': '8px',
                'font-size': '15px'
            });
            return oClone;
        }
    }).css('-ms-touch-action', 'none');
    $(".facet-list").droppable({
        tolerance: "touch",
        accept: ".cet",
        drop: function (event, ui) {
            
            if (ui.draggable.html().trim().length != 0) {
                var newElem = $(".facet").last().clone();
                newElem.attr("data-item-code", ui.draggable[0].dataset.itemCode);
                newElem.html(ui.draggable.html());
                newElem.attr("style", "");
                newElem.draggable({
                    revertDuration: 100,
                    refreshPositions: true,
                    revert: 'invalid',
                    zIndex: 9999,
                    scroll: true,
                    helper: function () {
                        var oClone = $(this).clone(true);
                        oClone.css({
                            'margin-top': '2%',
                            'margin-left': '8px',
                            'font-size': '15px',
                            'border': 'none',
                            'background': 'transparent',
                            'width': 'auto'
                        });
                        return oClone;
                    }
                }).css('-ms-touch-action', 'none');
                $(this).append(newElem);

                //remove content from dragged cet
                $(".cet").eq(InventoryView.rightDraggedElem).html('');
                $(".cet").eq(InventoryView.rightDraggedElem).attr('data-item-code', '');
            }
            $("#submitInventory").attr("disabled", !InventoryView.isValidSlideData(3));
        }
    });
    $(".cet").droppable({
        tolerance: "touch",
        accept: ".facet",
        drop: function (event, ui) {
            
            var oDragBox = ui.draggable,
                    sWord = oDragBox.text();

            /*=== Code for swap ===*/
            if ($(this).attr("data-item-code").trim().length > 0) {
                var tempThisText = $(this).text(),
                        tempThisItemCode = $(this).attr("data-item-code");

                $(this).text(sWord);
                $(this).attr("data-item-code", oDragBox[0].dataset.itemCode);
                oDragBox[0].innerHTML = tempThisText;
                oDragBox[0].dataset.itemCode = tempThisItemCode;
            } else {
                $(this).text(sWord);
                $(this).attr("data-item-code", oDragBox[0].dataset.itemCode);
                oDragBox.remove();
            }
            /*=== End Code for swap ===*/

            $("#submitInventory").attr("disabled", !InventoryView.isValidSlideData(3));
        }
    }).draggable({
        appendTo: "body",
        revertDuration: 100,
        refreshPositions: true,
        revert: 'invalid',
        zIndex: 9999,
        scroll: true,
        helper: function () {
            var oClone = $(this).clone(true);
            oClone.css({
                'margin-top': '2%',
                'margin-left': '8px',
                'font-size': '15px',
                'border': 'none',
                'background': 'transparent',
                'list-style-type': 'none'
            });

            return oClone;
        },
        start: function (event, ui) {
            InventoryView.rightDraggedElem = $(this).index();
        }
    }).css('-ms-touch-action', 'none');
};

InventoryView.bindEvents = function () {
    $("#submitInventory").off("click").on("click", function () {

        /*=== Check all slides are valid ===*/
		var slidesToCheck = 3; // For mid and end of year Interest Inventory, remove the Areas of Interest.
		if(InventoryView.iSlides == 3){
			slidesToCheck = 2;
			
		}
        for (var iI = 1; iI <= slidesToCheck; iI++) {
            if (!InventoryView.isValidSlideData(iI)) {
                alert(LIBRARY.c_s_ALERT_INTEREST_INVENTORY_EMPTY_FIELD);
                return;
            }
        }
        /*=== Check all slides are valid ===*/

        // Save data
        InventoryView.saveInterestForm();
        $("#InventoryPopupContainer").html('');
        Application.mainContainer.removeAttr('data-id');
        $('.slider_thums').css('overflow', 'auto');

        $("body").css({overflow: "initial"}); // reset for protect background scroll
        var inputs = $(document).find('select, input, textarea, button, a').filter(':visible');
            $(inputs).each(function(){
            var tbindex=$(this).data("index");                       
            $(this).attr("tabindex",tbindex);            
        });
        $('#mainCarouselArea').attr('aria-hidden',false);
        $('#mainCarouselArea').css('display','block');
        $('#LibraryHeaderAreaContainer').attr('aria-hidden',false);
        if(!oPlatform.isDevice() && !oPlatform.isChromeApp()){
            if (typeof window.parent != "undefined"){
                outerElement = window.parent.document.getElementById("footer-btn-cont");
                outerElement.setAttribute('aria-hidden',false);
            }
        }
        
    });

    $("#resetInventory").off("click").on("click", function (e) {
		var qcounter = $("#qcounter").attr("value");
		var iqcounter = $("#iqcounter").attr("value");

		$("#facetList").html(InventoryView.facetListDOM);
		$("#userFacets").html(
					_.template($("#tplUserFacets").html(),{})
					);	
        //InventoryView.initSwiper(e);
        InventoryView.initDragDrop();
        InventoryView.bindEvents();
        //InventoryView.mySwiper.swipeTo(3);
        $(".swiper-pagination-switch").removeClass("swiper-active-switch").eq(3).addClass("swiper-active-switch");
        $("#submitInventory").attr("disabled", !InventoryView.isValidSlideData(3));
        InventoryView.a11yInventory(3);

		
    });

    $(".nextBtn").off("click").on("click", function () {
		if(oPlatform.isDevice()){
		   $('#readerSurvey').attr("tabindex",-1).focus(); 
		}
        readThis("Slide change");
        InventoryView.mySwiper.swipeNext();
		
    });

    $(".prevBtn").off("click").on("click", function () {
        readThis('Slide change');
        var iActiveIndex = InventoryView.mySwiper.activeIndex;
        if (iActiveIndex == 0) {
            InventoryView.mySwiper.swipeTo(2);
        }
        InventoryView.mySwiper.swipeTo(iActiveIndex - 1);
    })

    $('#inventoryform .facet')
            .on('touchstart mousedown', function () {
                $('#inventoryform .swiper-slide-visible').addClass('swiper-no-swiping');
            });

    $(".interestInventoryForm input").off("click").on("click", function () {
		//$(this).parents().find('form').siblings(".button_area").find(".nextBtn").attr("disabled",!InventoryView.isValidSlideData($(this).closest("form").data('form-slide-num')));
		$("#nxtButton").attr("disabled",!InventoryView.isValidSlideData($(this).closest("form").data('form-slide-num')));
		if(InventoryView.isValidSlideData($(this).closest("form").data('form-slide-num'))){
            $('#nxtButton').attr('aria-hidden',false);
        }else{
            $('#nxtButton').attr('aria-hidden',true);
        }
		// For mid and end of year Interest Inventory, remove the Areas of Interest.
		if(InventoryView.iSlides == 3 && InventoryView.currentSwiperPage == 2){
				$("#nxtButton").hide();
				$("#submitInventory").attr("disabled",!InventoryView.isValidSlideData(2));
		}
		// End For mid and end of year Interest Inventory, remove the Areas of Interest.

    });
    $(".interestInventoryForm select").off("change").on("change", function () {
       // $(this).parents().find('form').siblings(".button_area").find(".nextBtn").attr("disabled",!InventoryView.isValidSlideData($(this).closest("form").data('form-slide-num')));
        $("#nxtButton").attr("disabled",!InventoryView.isValidSlideData($(this).closest("form").data('form-slide-num')));
        if(InventoryView.isValidSlideData($(this).closest("form").data('form-slide-num'))){
            $('#nxtButton').attr('aria-hidden',false);
        }else{
            $('#nxtButton').attr('aria-hidden',true);
        }		
		// For mid and end of year Interest Inventory, remove the Areas of Interest.
		if(InventoryView.iSlides == 3 && InventoryView.currentSwiperPage == 2){
				$("#nxtButton").hide();
				$("#submitInventory").attr("disabled",!InventoryView.isValidSlideData(2));
		}
		// End For mid and end of year Interest Inventory, remove the Areas of Interest.
    });

    $(".inventory-popup").off("click").on("click", function () {

        $(".inventory-popup").removeClass("md-effect-13");
    })



}; 

InventoryView.saveInterestForm = function () {
	
	//set InventoryTerm
	switch(InventoryView.currentTerm){
		case "BOY":
		sInventoryTerm = "B";
		break;
		
		case "EOY":
		sInventoryTerm = "E";
		break;
		
		case "MOY":
		sInventoryTerm = "M";
		break;
	}
	
    var aInterestFormData = [
        $("#interestInventoryFormSlide1").serializeArray(),
        $("#interestInventoryFormSlide2").serializeArray()
    ],
            aSurveyResponse = {
                enjoyIlitExp: '',
                enjoyReading: '',
                booksReadLastYear: '',
                familyLikeToRead: '',
                timeSpendReading: '',
                accessToLocalLibrary: '',
                whatYouRead: [],
                howYouRead: []
            },
    aStudenInterestInventory = {},
            aElemName = ["whatYouRead", "howYouRead"],
            aDroppedElem = $("#userFacets").children();

    $.each(aInterestFormData, function (key, obj) {
        $.each(obj, function (k, oElem) {
            if (aElemName.indexOf(oElem.name) != -1) {
                if (typeof aSurveyResponse[oElem.name] == 'undefined') {
                    aSurveyResponse[oElem.name] = [];
                }
                aSurveyResponse[oElem.name].push(oElem.value);
            }
            else {
                aSurveyResponse[oElem.name] = oElem.value;
            }

        });
    });

    $("#userFacets .cet").each(function () {
        if (typeof aStudenInterestInventory['interestAreas'] == 'undefined') {
            aStudenInterestInventory['interestAreas'] = [];
        }
        if (typeof $(this).data('item-code') !== 'undefined' && $(this).data('item-code').trim().length != 0) {
            aStudenInterestInventory['interestAreas'].push($(this).data('item-code'));
        }

    })
    
	//ILIT-685
	var pStudenInterestInventory = "";
	if(_.isEmpty(aStudenInterestInventory)){
		pStudenInterestInventory = "";
	}else{
		pStudenInterestInventory = encodeURIComponent(JSON.stringify(aStudenInterestInventory))
	}
	//new changes for interest inventory
	//send parameter for what type of grade saved.
    //call service
    $.nativeCall({
        'method': 'SaveInterestInventory',
        'globalResource': 'objSaveInterestInventoryResponse',
        'inputParams': [
            encodeURIComponent(JSON.stringify(aSurveyResponse)),
            pStudenInterestInventory,
			sInventoryTerm
        ],
        'onComplete': function (poServiceResponse) {
            DisableNativeBottomBar(false);
            // fix for popup displaying upon clicking reserve button even if the interest inventory form is submitted
            $("#InventoryPopupContainer").remove();
        }
    });
}
InventoryView.isValidSlideData = function (piSlideIndex) {
    if (piSlideIndex == '3') {
        return ($("#interestInventoryFormSlide3 #userFacets").find(".cet[data-item-code !='']").length >= 3);
    }
    var aInputNames = $("#interestInventoryFormSlide" + piSlideIndex + " :input[name!='']").not(':button,:hidden').map(function () {
        return this.name
    }).get(),
            aInputUnique = $.grep(aInputNames, function (v, i) {
                return $.inArray(v, aInputNames) === i
            }),
            formFilteredArray = $.grep($("#interestInventoryFormSlide" + piSlideIndex).serializeArray(), function (v, i) {
                return v.value != '';
            }),
            formFilteredArray2 = [];
    $.each(formFilteredArray, function (k, oElem) {
        if (formFilteredArray2.indexOf(oElem.name) != -1) {
            if (typeof formFilteredArray2[oElem.name] == 'undefined') {
                formFilteredArray2[oElem.name] = [];
            }
            formFilteredArray2[oElem.name].push(oElem.value);
        }
        else {
            formFilteredArray2[oElem.name] = oElem.value;
        }

    });
    if (Object.keys(formFilteredArray2).length >= aInputUnique.length) {
        return true;
    }
    return false;
}


//  ###########################
//  Library Popup View: To Display Popup When Clicked on Books
//  ###########################


/* 
 * Library Popup View
 */
function LibraryPopupView() {

}

LibraryPopupView.model = null;
LibraryPopupView.template = null;

/* Library Popup init  */
LibraryPopupView.init = function (model) {

//    var selectedBook = _.where(LibraryCarouselView.arrAllBooks, {book_id: $("#" + LIBRARY.c_s_BOOK_POPUP_CONTAINER).attr('data-id')});
    //@PDF
   
    //var selectedBook = _.where(objBookList.bookset[0], {book_id: $("#" + LIBRARY.c_s_BOOK_POPUP_CONTAINER).attr('data-id')});
    
    //ILIT-5099 [firefox issue]
    var selectedBook = [];  
    for(var k in objBookList.bookset[0]){
        
        if(objBookList.bookset[0][k] && objBookList.bookset[0][k].book_id == $("#" + LIBRARY.c_s_BOOK_POPUP_CONTAINER).attr('data-id')){	     
            selectedBook.push(objBookList.bookset[0][k]);				   
        }
    }
  

    var objData = selectedBook[0];
    var feedback = "";

    try {
        objData[LIBRARY.c_s_BOOK_LIST_JSON_KEY.BOOK_TITLE_CHOPPED] = LibraryCarouselView.removeMetaData(objData);
    } catch (exp) {
        //objData[LIBRARY.c_s_BOOK_LIST_JSON_KEY.BOOK_TITLE_CHOPPED] = '';    
    }

    selectedBook[0] = objData;
    selectedBook[1] = LibraryCarouselView.ActiveTab;
    selectedBook[3] = [];
    if(objGetUserFeedbackforAllBooksData !== null){
    for (var i = 0; i < objGetUserFeedbackforAllBooksData.Content.length; i++) {
        if (objGetUserFeedbackforAllBooksData.Content[i].CMSITemID === $("#" + LIBRARY.c_s_BOOK_POPUP_CONTAINER).attr('data-id')) {
            selectedBook[2] = objGetUserFeedbackforAllBooksData.Content[i].GlobalAvgRating;
            feedback = (objGetUserFeedbackforAllBooksData.Content[i].CSVFeedbackItems !== "") ? objGetUserFeedbackforAllBooksData.Content[i].CSVFeedbackItems : "";
        }

    }


    if (feedback !== "") {
        for (var i = 0; i < feedback.split(",").length; i++) {
            if (LibraryCarouselView.bookReviewComments[feedback.split(",")[i]] !== undefined) {
                selectedBook[3][i] = LibraryCarouselView.bookReviewComments[feedback.split(",")[i]];
            }
        }
    }
    }
    LibraryPopupView.model = selectedBook;//model;
    LibraryPopupView.template = _.template($("#" + LIBRARY.c_s_BOOK_POPUP_TEMPLATE).html());

    LibraryPopupView.render();
    LibraryPopupView.bindEvent();
};

/* Library Popup render */
LibraryPopupView.render = function () {
    Application.mainContainer.html(LibraryPopupView.template({data: LibraryPopupView.model}));
};

/**
 * Bind Popup Events Here 
 */
LibraryPopupView.bindEvent = function () {
    $('#closeBookPopup')
        .on('click tap pointerdown', function (event) {
            //ILIT-5334
            if($(event.target).hasClass("valid-activity")){
                callLogUserActivity(event);            
            }
            //Application.mainContainer.html('');
            //Application.mainContainer.removeAttr('data-id');
			$(".bookReadPopup").parent().html('');
			$(".bookReadPopup").parent().removeAttr('data-id');
		
            $('.slider_thums').css('overflow', 'auto');
            //        $('body').unbind('touchmove');
            //        $('.md-overlay').remove();
			
			//restore focus to previous item if its rotating carousel
			var middleBook = window.BookShelfRounder.getMiddleItem();
			if(middleBook && $(".ILITBookShelfRounderWrapper .bookElement").length){
				$(middleBook).focus(); 
			}
			
			//restore focus to previous item if its flat carousel
			if($(".flatCarousel .bookElement").length){
				$(LibraryCarouselView.prevFocusedElement).focus();
			}
			
			//restore focus to previous item if its book list view
			if($(".slider_thumb_img").length){
				$(LibraryCarouselView.prevFocusedElement).focus();
			}
        });

    /*reserve button click event*/
    $(".book_reserve_btn").on("click tap pointerdown", function (event) {
        if($(event.target).hasClass("valid-activity")){
            callLogUserActivity(event);            
        }
         if (objLibraryJsonData.viewType == 'student') {
            if (LibraryHeaderView.reserveBook.length < 5) {
                oUtility.showLoader({
                    'message': '<img src="media/loader.gif" alt="" />',
                    'background-color': 'none',
                    'click-to-hide': false,
                    'opacity': 0.5
                });
                //LibraryHeaderView.reserveBook.push({book_id: $("#" + LIBRARY.c_s_BOOK_POPUP_CONTAINER).attr('data-id')});
                //LibraryHeaderView.reserveBook = _.uniq(LibraryHeaderView.reserveBook);
                //call service
                $.nativeCall({
                    'method': 'ReserveOrUnreserveBook',
                    'globalResource': 'objReserveUnreserveResponse',
                    'inputParams': [
                        $("#" + LIBRARY.c_s_BOOK_POPUP_CONTAINER).attr('data-id'),
                        0
                    ],
                    'onComplete': function () {
                           fGetListOfReservedBooks();
                        $('#closeBookPopup').trigger("click");
//                        LibraryHeaderView.confirmationPopUp._alert({
//                            divId: 'dialog-message',
//                            message: "The book has been reserved."
//                        }, function () {
                            /**/
                              if ($(".tabbing button.active").hasClass("change")) {
                                $(".tabbing button.active").removeClass("active").trigger("click");
                            }
                     //   });
                        oUtility.hideLoader();
                    },
                    'onError': function () {
                        $('#closeBookPopup').trigger("click");
                        LibraryHeaderView.confirmationPopUp._alert({
                            divId: 'dialog-message',
                            message: "This book is currently reserved."
                        }, function () {
                            /**/
                        });
                        oUtility.hideLoader();
                    }
                });

            }
            else {
                $('#closeBookPopup').trigger("click");
                LibraryHeaderView.confirmationPopUp._alert({
                    divId: 'dialog-message',
                    message: "The maximum of 5 books have been reserved."
                });
            }
        }
    });


    $(".book_remove_btn").on("click tap pointerdown", function (event) {
        //ILIT-5334
        if($(event.target).hasClass("valid-activity")){
            callLogUserActivity(event);            
        }
        if (objLibraryJsonData.viewType == 'student') {
            // console.log($("#" + LIBRARY.c_s_BOOK_POPUP_CONTAINER).attr('data-id'))
            //console.log(LibraryHeaderView.reserveBook);

            //LibraryHeaderView.reserveBook = _.reject(LibraryHeaderView.reserveBook, function (arrItem) {
            //      return (arrItem.book_id === $("#" + LIBRARY.c_s_BOOK_POPUP_CONTAINER).attr('data-id'));
            //  });

            oUtility.showLoader({
                'message': '<img src="media/loader.gif" alt="" />',
                'background-color': 'none',
                'click-to-hide': false,
                'opacity': 0.5
            });

            $.nativeCall({
                'method': 'ReserveOrUnreserveBook',
                'globalResource': 'objReserveUnreserveResponse',
                'inputParams': [
                    $("#" + LIBRARY.c_s_BOOK_POPUP_CONTAINER).attr('data-id'),
                    1
                ],
                'onComplete': function () {
                    fGetListOfReservedBooks();
                    $('#closeBookPopup').trigger("click");
                    LibraryHeaderView.confirmationPopUp._alert({
                        divId: 'dialog-message',
                        message: "Book has been removed from Reserved list."
                    }, function () {
                          /**/
                         if ($(".tabbing button.active").hasClass("change")) {
                            $(".tabbing button.active").removeClass("active").trigger("click");
                        }
                    });
                    oUtility.hideLoader();
                },
                'onError': function () {
                    LibraryHeaderView.confirmationPopUp._alert({
                        divId: 'dialog-message',
                        message: "This book already Removed."
                    }, function () {
                        /**/
                    });
                    oUtility.hideLoader();
                }
            });

        }
    });


    //ILIT-6412 & ILIT-6414 - Right Click Off
    $("#readBookBtn").on("contextmenu",function(e){
        if (objLibraryJsonData.viewType == 'student') {
            e.preventDefault();
        }
     });

    $("#readBookBtn")
            .on('click tap', function (event) { //ILIT-6412   - click tap pointerdown
                //ILIT-5334
                if($(event.target).hasClass("valid-activity")){
                    callLogUserActivity(event);
               
                }

                var iBookId = $("#" + LIBRARY.c_s_BOOK_POPUP_CONTAINER).attr('data-id');
                var _BookLexileLevel = LibraryPopupView.model[0]["lexile_level"];
                var _DisplayEpubModel = LibraryPopupView.model[0]["DisplayEpubModel"] ? LibraryPopupView.model[0]["DisplayEpubModel"] : ""; // virtual/physical
                var _wordCount = (LibraryPopupView.model[0]["word_count"] == null || typeof LibraryPopupView.model[0]["word_count"] == "undefined") ? 0 : LibraryPopupView.model[0]["word_count"];
                var _BookTitle = LibraryPopupView.model[0][LIBRARY.c_s_BOOK_LIST_JSON_KEY.BOOK_TITLE_CHOPPED];
                //var _BookNumPage  =   LibraryPopupView.model[0][LIBRARY.c_s_BOOK_LIST_JSON_KEY.NUM_PAGE];
                var _BookNumPage = LibraryPopupView.model[0][LIBRARY.c_s_BOOK_LIST_JSON_KEY.NUM_PAGE] == '' || LibraryPopupView.model[0][LIBRARY.c_s_BOOK_LIST_JSON_KEY.NUM_PAGE] == null ? 0 : LibraryPopupView.model[0][LIBRARY.c_s_BOOK_LIST_JSON_KEY.NUM_PAGE].format(0);
//        if(_BookNumPage == 0) {                    
//            _BookNumPage   = LibraryPopupView.model[0][LIBRARY.c_s_BOOK_LIST_JSON_KEY.WORD_COUNT] == '' || LibraryPopupView.model[0][LIBRARY.c_s_BOOK_LIST_JSON_KEY.WORD_COUNT] == null ? 0 : (LibraryPopupView.model[0][LIBRARY.c_s_BOOK_LIST_JSON_KEY.WORD_COUNT]/150).toFixed(0);
//        }
                var isBroadCast = false;
                var eBookType = 'epub';

                if (objLibraryJsonData.viewType == 'teacher') {
                    var isRata = _.where(LibraryCarouselView.model.gradedRATABooks, {book_id: iBookId});
                } else {
//            var RataBookStr  =   (objCurrentRATABook == null) ? '' : objCurrentRATABook.currentRATABookID;
//            var arrRataBook  =   RataBookStr.split("_");
                    var iRataBookId = $("#studentRataBook").attr('data-id'); //arrRataBook[1]; 

                    if (typeof iRataBookId == "undefined" || iRataBookId == '' || iBookId != iRataBookId) {
                        var isRata = [];
                    } else {
                        var isRata = _.where(LibraryCarouselView.model.arrBooks, {book_id: iBookId});
                    }
                    $.nativeCall({
                        'method': 'ReserveOrUnreserveBook',
                        'globalResource': 'objReserveUnreserveResponse',
                        'inputParams': [
                            $("#" + LIBRARY.c_s_BOOK_POPUP_CONTAINER).attr('data-id'),
                            1
                        ],
                        'onComplete': function () {
                            fGetListOfReservedBooks();
                        }
                    });
                }
                var _BookType = (isRata.length == 0) ? "time_to_read" : "rata";
                var _Context = '';

                if (LibraryPopupView.model[0].file_type == 'pdf') {                    
                    GetPDFInfo(iBookId, _BookTitle, _BookType, _wordCount, _BookNumPage, _Context, _BookLexileLevel);
					//prevent user click twice incase pdf takes time to open in chromeApp
					$(this).addClass('disabledButton').prop('disabled', true); 
					/* ILIT-5575 if */
                    //if (isRata.length == 0) {
                        SetCurrentBookForStudent(iBookId);
                    //}
                    return false;
                }
                //  For Epub
				/* ILIT-5575 if */
               // if (isRata.length == 0) {
                    SetCurrentBookForStudent(iBookId);
               // }

                $(this).addClass('disabledButton').prop('disabled', true);				
				
                setTimeout(function () {
				if(location.hash === '#chromeApp'){
					location.href = LIBRARY.c_s_PLAYER_URL + iBookId + "|||" + _BookTitle + "|||" + _BookType + "|||" + _wordCount + "|||" + isBroadCast + "|||" + eBookType + "|||" + _BookNumPage + "|||" + _Context + "|||" + objLibraryJsonData.productCode + "|||" + _BookLexileLevel + "|||" + objLibraryJsonData.classStartDate + "|||"+ _DisplayEpubModel + "|||" + "chromeApp";
				}else{	
                    location.href = LIBRARY.c_s_PLAYER_URL + iBookId + "|||" + _BookTitle + "|||" + _BookType + "|||" + _wordCount + "|||" + isBroadCast + "|||" + eBookType + "|||" + _BookNumPage + "|||" + _Context + "|||" + objLibraryJsonData.productCode + "|||" + _BookLexileLevel + "|||" + objLibraryJsonData.classStartDate + "|||"+ _DisplayEpubModel;
                }
				}, 1000);

            });

    /* AUTO BOOK READ */
    $("#autoReadBook").off("click tap").on("click tap", function (event) {
        //ILIT-5334
        if($(event.target).hasClass("valid-activity")){
            callLogUserActivity(event);
       
        }
        oUtility.showLoader({
            'message': '<img src="media/loader.gif" alt="" />',
            'background-color': 'none',
            'click-to-hide': false,
            'opacity': 0.5
        });
        saveAutoBookRead();
    });

	//bind events for managing keyboard trap
	$("#bookPopup").find("button:first").off("keydown").on("keydown", function(e){
		handleTab(e, this, this, $("#bookPopup").find("button:last"));
	});
	
	$("#bookPopup").find("button:last").off("keydown").on("keydown", function(e){
		handleTab(e, this, $("#bookPopup").find("button:first"), this);
	})

};

function fGetListOfReservedBooks() {
    objReserveListData = null;
    $.nativeCall({
        'method': 'GetListOfReservedBooks',
        'globalResource': 'objReserveListData',
        'onComplete': function () {
            LibraryHeaderView.reserveBook = ((objLibraryJsonData.viewType === 'student')) ? objReserveListData.Content || [] : [];
        }
    });
}

/**
 * SaveLibraryProgress called for auto book read
 * @method saveAutoBookRead
 * @param 
 * @return 
 */
function saveAutoBookRead() {
    var sBookType = "Time To Read", /* for iLit20 its static as no RATA available */
            sBookID = $("#BookPopupAreaContainer").attr("data-id"),
            sCurrentBookType = sBookType == 'Time To Read' ? 'TTR' : 'RATA',
            iChapterStartIndex = -1,
            iChapNo = 1,
            iSentNo = 1,
            oWordCount = {},
            aWordCount = [],
            objLibraryProgress = {},
            objLibraryDetails = {},
            iCurrentUnit = iCurrentWeek = 1,
            bBookReadEnd = true,
            bBroadcast = false,
            iTotalWordsInBook = LibraryPopupView.model[0]["word_count"] ? LibraryPopupView.model[0]["word_count"] : 0,
            iBookLexileLevel = LibraryPopupView.model[0]["lexile_level"] ? LibraryPopupView.model[0]["lexile_level"] : 0,
            iTotTimeSpentInSec = 60,
            fCallback = function () {
                SetCurrentBookForStudent(sBookID);
                // un-reserve Book
                $.nativeCall({
                    'method': 'ReserveOrUnreserveBook',
                    'globalResource': 'objReserveUnreserveResponse',
                    'inputParams': [sBookID, 1],
                    'onComplete': function () {
                    }
                });
                // get updated summary
                $.nativeCall({
                    'method': 'GetLibraryProgressSummary',
                    'globalResource': 'objLibraryProgressSummary',
                    'onComplete': function () {
                        $('#closeBookPopup').trigger("click");
                        if ($(".tabbing button.active").hasClass("change")) {
                            $(".tabbing button.active").removeClass("active").trigger("click");
                        }
                        oUtility.hideLoader();
                        removeBooks();
                    }
                });
            };

    oWordCount[iCurrentUnit + '.' + iCurrentWeek + '.' + sCurrentBookType] = iTotalWordsInBook+"|"+iTotTimeSpentInSec;
    aWordCount[0] = JSON.stringify(oWordCount).replace(/"/g, '\\"');

    objLibraryProgress = '{' +
            '\\"bookType\\":\\"' + sBookType + '\\",' +
            '\\"mode\\":\\"landscape\\",' +
            '\\"chapNo\\":' + iChapNo + ',' +
            '\\"sentNo\\":' + iSentNo + ',' +
            '\\"font-size\\":\\"t2\\",' +
            '\\"WordCountObj\\":' + aWordCount +
            '}';

    objLibraryDetails = '{' +
            '\\"bookType\\":\\"' + sBookType + '\\",' +
            '\\"totalWords\\":' + iTotalWordsInBook + ',' +
            '\\"bookCompleted\\":' + bBookReadEnd + ',' +
            '\\"currentUnit\\":' + iCurrentUnit + ',' +
            '\\"currentWeek\\":' + iCurrentWeek +
            '}';

    $.nativeCall({
        'method': 'SaveLibraryProgress',
        'globalResource': 'objSaveLibraryProgressResponse',
        'inputParams': [undefined, sBookID, objLibraryDetails, objLibraryProgress, iTotalWordsInBook, bBroadcast, iTotTimeSpentInSec, iBookLexileLevel],
        'onComplete': function () {
            fCallback();
        }
    });
}


///*native call functions with three param*/
//
//function nativeCallData(method, globalresource, oncomplete) {
//    $.nativeCall({
//        'method': method,
//        'globalResource': globalresource,
//        'onComplete': oncomplete || function () {/*do something*/
//        }
//    });
//}


/**
 * Library Progress Callback :: From Native
 * @method GetLibraryProgressCallback
 * @param {Object} pobjLibraryProgress
 * @return 
 */
function GetLibraryProgressCallback(pobjLibraryProgress) {
    if (pobjLibraryProgress !== null)
        LibraryCarouselView.libraryProgress = JSON.parse(pobjLibraryProgress);
    else
        LibraryCarouselView.libraryProgress = null;
}
;




