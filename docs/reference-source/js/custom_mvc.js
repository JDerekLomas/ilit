/**
 * @author LearningMate
 * @date 20130521
 * @objectives
 * @revision
 20130521 - Initial Version -
 */

//Bok Object For Bookshelf And
var Book = {
    //Runs The Object So That Components Get Initialized
    run: function() {
        //Member Variables
        this.booklist = {};
        this.id = -1;
        this.path = null;
        this.page = null;
        this.fullpage = null;
        this.solutionId = null;
        this.isparsed = null;
        this.passedId = null;
        this.list = {};
	this.currentSrc = null;
        this.headerpanelview = new this.HeaderPanelView();
        this.bookview = new this.BookView();
        this.tocview = new this.TOCView();
        this.footerpanelview = new this.FooterPanelView();
        this.bookcollection = new this.BookCollection();
        this.router = new this.Router();

        //Initiate Backbone MVC
        Backbone.history.start();

        //Navigation Logic
        if (window.location.hash === '') {
        } else {
            var hash = window.location.hash;
            var bookid = hash.replace("#", "");            
            Book.router.navigate(bookid);
        }

        //JQuery Mobile Add Ups
        //Hide JQuery Mobile Default Loader
        $(".ui-loader").hide();
        //Remove Page Heignt From Page Div Added By JQM
        $(".ui-page").css({
            "min-height": ""
        });
        //Show Loader
        if (!$("#loader").hasClass("ui_elem_hidden")) {
            //toggleLoader(true, Loader.c_s_TEXT_LOADING);
        }
    }
};

//Router Object For Navigating
Book.Router = Backbone.Router.extend({
    //Initialize Router
    initialize: function() {
        //Route For Bookview
        this.route(/(.*)/, 'render');
    },
	
    //Route To BookView
    /*
     * Parameters:
     * id - int - Auto Generated Id From Table To Be Passed In The List JSON
     */
    render: function(id) {
        //Variables
        var excpMsg;

        //Initialization
        excpMsg = "Within Book.Router.render: ";

        //Excpetion Handler Block
        try {
            //Set Passed Id To Book Object
            Book.passedId = id;
            //get BookList
            Book.bookcollection.getList();
        } catch (excp) {
            //Write To Console
            console.log(excpMsg + excp);
        }
    },
    
    //Get Book Details
    getBookDetails: function () {
        //Variables
        var excpMsg;

        //Initialization
        excpMsg = "Within Book.Router.getBookDetails: ";        
        //Excpetion Handler Block
        try {
            //Set To Id
            id = Book.passedId;
            //Create Book Collection; Traverse Through the Response And Push Into list Array
            $.each(Book.booklist, function() {
                //Book.list.push(this);
                Book.list[this[Books.c_s_SOLUTION_ID_KEY]] = this;
            });

            //Create Book Configuratons If id Is Not Null i.e. For Specific Book
            //Will Not Be Executed For Bookshelf View
            if (id != null && id != "") {
                    $("#bookTitle").text(Book.list[id][LIBRARY.c_s_BOOK_LIST_JSON_KEY.BOOK_TITLE])
                    Book.solutionId = Book.list[id][Books.c_s_SOLUTION_ID_KEY];//Set Url
                    //Book.isparsed = Book.list[id][Books.c_s_PARSED_KEY];//Set Parsed Flag
                    Book.id = id;//Set Id
                    //Book.path = resolveURL(Book.list[id][Books.c_s_BOOK_PATH_KEY] + Books.c_s_BOOKFOLDER_PREFIX + id + "/", document.URL);//Set Url
                    //Book.path = resolveURL(objLibraryJsonData.bookPath + "/" + Books.c_s_BOOKFOLDER_PREFIX + id + "/", document.URL);//Set Url                
					Book.path = resolveURL(objLibraryJsonData.bookPath);
					    					
                    Book.page = null;//Set Current Page To Null

                    //Display Tooltip Blocked Message If Book.isparsed Equals 0
                    /*if (Book.isparsed prev== "0") {
                            $(Book.bookview.msgEl).show();
                    }*/

                    Book.bookview.render();//Call render For Book
            }
        } catch (excp) {
            //Write To Console
            console.log(excpMsg + excp);
        }
    }
});

//Backbone Model Update
Backbone.sync = function(method, model) {
    //Variables
    var excp;

    //Initialization
    excpMsg = "Within Backbone.sync: ";

    try {
        //Execute Logic If Book Collection Is read
        if (method === "read") {
            
            //Reset Collection So That New Structure Can Be Created
            Book.bookcollection.reset();
			//Get XML From Local Storage
			//var xml = localStorage.getItem(Book.path + Books.c_s_CONTAINER_XML_URL, xml);
			//$.getScript(Book.path + Books.c_s_CONTAINER_XML_URL);
                        
                        //@LM: Changes :: File Loaded Dynamically
//			loadJS(Book.path + Books.c_s_CONTAINER_XML_URL);
                        GetBookFileContent(Books.c_s_CONTAINER_XML_URL, Books.c_s_BOOKFOLDER_PREFIX + Book.solutionId);                  
			setTimeout(function () {
                                //@LM: Changes :: Get File Content Dynamically
//				var xml_string = eval("container" + Book.solutionId);
                                xml_string = bookFileContentData;
                                bookFileContentData =   '';
                                
                                //@LM: Changes :: Object Changed, Getting Entire object instead of 0th Key
//				var xml = $($(xml_string)[0]);console.log(xml)
				var xml = $($(xml_string));
				//Variables
				var opfPath, // Location of .opf file mentioned in container.xml
						opfRoot,
						opfRoot1,// Root directory where the .opf file is located
						$manifest = null, // <manifest> node in .opf
						$spine = null, // <spine> node in .opf
						tocPath = '', // toc filePath in <manifest> based on mimetype `application/x-dtbncx+xml`
						$tocNavMap = null, // <navMap> node in toc.ncx
						NSDictionary = {}, // a collection of child nodes of <manifest>
						ns = '', // a child node of <manifest> after lookup
						tocType = '';                                                    

				try {
					//Save Response Into localStorage
	//                    localStorage.setItem(Book.path + Books.c_s_CONTAINER_XML_URL, xml);
					//Get Values From XML
					opfPath = $(xml).find('rootfile[media-type="application/oebps-package+xml"]').attr('full-path');
					opfRoot = opfPath.substring(0, opfPath.lastIndexOf('/'));
					opfRoot1 = Book.path;
                                        
					//Modify OPF Path For Custom OPF
					//opfPath = opfRoot1 + "/" + Books.c_s_CUSTOM_OPF;
                                        
                                        //@LM: Changes :: Line Commented
					//opfPath = opfRoot1 + opfPath;
                                        
                                        //@LM: Changes :: Opf File Loaded
//					opfPath = opfPath.replace(".opf", ".js");
//					loadJS(opfPath);
                                        
                                        GetBookFileContent(opfPath, Books.c_s_BOOKFOLDER_PREFIX + Book.solutionId); 
                                        
					setTimeout(function () {
                                            
                                                //@LM: Changes:: Get File Content Dynamically
						//Get Opf From Local Storage
//						var opf_string = eval("opf" + Book.solutionId);
						var opf_string = bookFileContentData;
                                                bookFileContentData = "";
                                                
                                                //@LM: Changes :: Object Changed, Getting Entire object instead of 0th Key
//						var opf = $($(opf_string)[0]);
						var opf = $($(opf_string));
						//Execute Logic
						try {


							//Get Manifest Element
							$manifest = $(opf).find('manifest, opf\\:manifest');
							//Traverse Through The Chldren To Generate Collection
							$manifest.children().each(function() {
								NSDictionary[$(this).attr('id')] = $(this).attr('href');
							});                                                        

                                                        //Get The TOC Element
							/**
							 * Find The TOC Type
							 * Can Be
							 - ncx: Contains Navigation XML
							 - nav: Simple HTML For The TOC
							 */
							if ($manifest.children('item[media-type="application/x-dtbncx+xml"], opf\\:item[media-type="application/x-dtbncx+xml"]').length > 0) {
								//Contains Navigation XML For TOC
								tocPath = $manifest.children('item[media-type="application/x-dtbncx+xml"], opf\\:item[media-type="application/x-dtbncx+xml"]').attr('href');
								tocType = 'ncx';
							} else if ($manifest.children('item[properties="nav"], opf\\:item[properties="nav"]').length > 0) {
								//Contains Simple HTML For TOC
								tocPath = $manifest.children('item[properties="nav"], opf\\:item[properties="nav"]').attr('href');
								tocType = 'nav';
							}
                                                        
							//Get File For Generating TOC From Local Storage
                                                        //@LM: Changes :: Line Commented
//							var tocPath1 = Book.path + opfRoot + '/' + tocPath;
                                                        tocPath =  (opfRoot == '') ? tocPath : opfRoot + '/' + tocPath;
                                                        
                                                        //@LM: Changes :: TOC File Loaded
//                                                      tocPath1 = tocPath1.replace(".ncx", ".js");
//							loadJS(tocPath1);
                                                        GetBookFileContent(tocPath, Books.c_s_BOOKFOLDER_PREFIX + Book.solutionId); 
                                                        
							setTimeout(function () {
                                                                //@LM: Changes:: Get File Content Dynamically
//								var toc_string = eval("toc" + Book.solutionId);
								var toc_string = bookFileContentData;
                                                                bookFileContentData =   '';
                                                                
                                                                //@LM: Changes :: Object Changed, Getting Entire object instead of 0th Key
//								var toc = $("<doc>" + toc_string + "</doc>").children("navmap")[0];
								var toc = $($(toc_string)).children("navmap");
                                                                
								//Execute Logic
								try {
									//Get navmop Element
									$tocNavMap = toc;
                                                                        Book.bookcollection.create({
                                                                            'id': 0,
                                                                            'bookPath': "",
                                                                            'page': "toc-first",
                                                                            'opfRoot': ""
                                                                        });
									//Retrieve The Spine; The Page Order And Display Structure Of The Book
									$spine = $(opf).find('spine');
									//Traverse Through All The Children In The Spine And Create Collcetion
									$spine.children().each(function() {
										//Create Collection
										ns = NSDictionary[$(this).attr('idref')];
										if (ns !== '') {
											Book.bookcollection.create({
												'id': ns,
												'bookPath': Book.path,
												'page': ns,
												'opfRoot': opfRoot
											});
										}                                                                                
									});                                                                         
                                                                        
									/*
									 * If tocxType Is ncx, Create TOC From Navigation XML
									 * Else, Load The TOC HTML
									 */
									if (tocType === 'ncx') {//From Navigation XML
										//Get navmop Element
										$tocNavMap = toc;
										Book.tocview.tocHtml = $('<div/>');
										Book.tocview.tocHtml.attr("id", "toc");
										//Call Function To Parse NCX File To Create TOC
										Book.tocview.parseNCX($tocNavMap, "toc");
										Book.bookview.loadTOC(Book.tocview.tocHtml);
									} else if (tocType === 'nav') {//From HTML
										//Initialize TOC HTML
										Book.tocview.tocHtml = $('<div/>');
										Book.tocview.tocHtml.attr("id", "toc");
										if ($(toc).find('nav').length > 0) {
											tocHtml = $(toc).find('nav');
										} else {

											for (var idx = 0; idx < $(toc).length; idx++) {
												if ($(toc)[idx].id === "toc") {
													tocHtml = $(toc)[idx];
													break;
												}
											}

										}
										Book.tocview.parseHtml(tocHtml, "toc");
										Book.bookview.loadTOC(Book.tocview.tocHtml);
									}
									//Set Into Book Page
									Book.page = Book.page || Book.bookcollection.first().get('page');
									//Load Page
									Book.bookview.page(Book.page);
								} catch (excpTOCPath) {
									console.log(excpMsg + "getJSON(" + Book.path + "/" + opfRoot + "/" + tocPath + "): " + excpTOCPath);
								}
							}, 300);
						} catch (excpOpf) {
							console.log(excpMsg + "getJSON(" + Book.path + Books.c_s_CONTAINER_XML_URL + "): " + excpOpf);
							//Display Alert And Navigate To Dashboard
							alert(General.c_s_NONCACHED_BOOK_ALERT);
						}
					}, 300);
				} catch (excpContXML) {
					if (window.console) {
						console.log(excpMsg + "getJSON(" + Book.path + "/" + opfPath + "): " + excpContXML);
					}
				}
			}, 300);
        }
    } catch (excp) {
        //Write To Console
        console.log(excpMsg + excp);

    }
}

//Book Model With Structure
Book.BookModel = Backbone.Model.extend({
    defaults: {
        id: null, // id is same as page. Used to fetch model by id from a collection
        bookPath: null,
        page: null,
        opfRoot: null
    }
});

//Book Collection Object
Book.BookCollection = Backbone.Collection.extend({
    //Initialize Model
    model: Book.BookModel,
    //Search Function With Specific Value Search
    search: function(query) {
        //Create Pattern From The Query String
        var pattern = new RegExp($.trim(query) + '$', "i"),
                //Return Variable
                searchedModel = false;

        //Traverse Through The Collection To Search Model
        Book.bookcollection.each(function(model) {
            _(model.attributes).any(function(attr, key) {
                if (!pattern.test(attr))
                    return false;
                searchedModel = model;
            });
        });

        //Return
        return searchedModel;
    },
    //Gets Page Number
    pagenum: function(page) {
        //Returns Page Number
        return Book.bookcollection.indexOf(Book.bookcollection.search(page)) + 1;
    },
    getList: function () {        
        loadJS(Books.c_s_BOOKLIST_URL);        
        setTimeout(Book.bookcollection.booklistloaded, 100);
    },
    booklistloaded: function () {
        var booklistcollection = null;
        if (window.booklistLoaded && booklistLoaded == 1) {
            booklistcollection = booklist.bookset;
            booklistcollection = _.omit(booklistcollection, Books.c_s_BOOKLIST_KEY_CATEGORY);
            Book.booklist = _.values(booklistcollection[0]);
            Book.router.getBookDetails();
        } else {
            setTimeout(Book.bookcollection.booklistloaded, 100);
        }
    }
});

//Header Panel View; Controls All The Elements In Header Panel And Executes The Events
Book.HeaderPanelView = Backbone.View.extend({
    //Member Variables
    el: 'div.header_black_panel', //Element
    //Populate Title
    title: function(text) {
        $('#pageTitle').text(text);
    }
});

//Footer Panel View; Controls All The Elements In Footer Panel And Executes The Events
Book.FooterPanelView = Backbone.View.extend({
    //Member Variables
    el: 'div.footer_panel', //Element
    elPrev: '#prev',//Previious
    elNext: '#next',//Previious

    //Attach Events With The Buttons In Bookview
    events: {
        'click #prev': 'prev', //Previous Button Event
        'click #next': 'next'//Next Button Event
    },
    //Prev Button Event
    prev: function() {
    	 Book.bookview.prev();
    },
    //Next Button Event
    next: function() {
        //Call Book Views Next Event If Scheduler Is Not Running
    	 Book.bookview.next();
    },
    //Populate Page Number
    pagenumber: function() {
        //Variables
        var currPageNum;
        var totalPages;
        var pageNumFormat;
        var elem;
        var excpMsg;

        //Initializes
        excpMsg = "Book.FooterPanelView.pagenumber: ";

        try {
            //Element
            elem = ".ftr_middle";

            //Get Current Page Number
            currPageNum = Book.bookcollection.pagenum(Book.page);
            //Get Total Page Number
            totalPages = Book.bookcollection.length;

            //Remove Hover State In iPad
            $("#next").trigger("mouseleave");

            //Populate Pagenumber Text
            //Get Format First
            pageNumFormat = General.c_s_PAGE_NUMBER_TEXT;
            //Populate Current Page
            pageNumFormat = pageNumFormat.replace(General.c_s_PAGE_NUMBER_CURRENT, currPageNum);
            //Populate Total Length
            pageNumFormat = pageNumFormat.replace(General.c_s_PAGE_NUMBER_LENGTH, totalPages);
            
            //Populate In Page
            $(elem).text(pageNumFormat);
        } catch (excp) {
            //Write To Console
            console.log(excpMsg + excp);
        }
    }
});


//TOC VIew Object; Populates TOC From Template
Book.TOCView = Backbone.View.extend({
    //Member Variables
    el: '#toc_container', //Element
    iconEl: '#tocBtn', //Icon Element
    toccontainerEl: '.toc_inner_wrapper', //TOC Container Element
    template: _.template($('#tocTemplate').html()), //Bookview Container
    tocHtml: null, //Toc HTML To Create,
    tocType: "", //Toc Type
    htmlElemId: 0, //Id For Elements When TOC Is Getting Generated From HTML
    listEl: '.toc_wrapper',//List Element    
        
    //Attach Events
    events: {
        'click li': 'navigate'//Bookmark Icon Click
    },    
    //Render TOC
    populate: function(data) {
        //Variables
        var xmlDoc;
        var excpMsg;
        
        //Initializes
        excpMsg = "Book.TOCView.populate: ";

        try {
            /*
             * Execute Different Logic For Different TOC Type
             * If Type = "nav", Convert To XML And Send Data
             * Else, Send As Object Format
             */
            if (this.tocType == TOC.c_s_NAV) {
                //Parse String To XML
                xmlDoc = $.parseXML(data);
                //Get XML DOM
                $xml = $(xmlDoc);

                //List Items In Template
                //Get Template Container Element
                elem = $(this.el);
                //Populate Template
                elem.html(this.template({data: data}));
            } else {
                //List Items In Template
                //Get Template Container Element
                elem = $(this.el);
                //Populate Template
                elem.html(this.template({data: this.tocHtml}));
            }

            //Set Active
            this.active();

            //Attach Scroll
            //this.scroll();
        } catch (excp) {
            //Write To Console
            console.log(excpMsg + excp);
        }
    },
    //Attach Scroll
    scroll: function() {
        $(this.listEl).niceScroll({
            autohidemode : false,
            cursorcolor:"#A4A4A4",
            cursorwidth: 8,
            zindex: 100
        });
    },
    //Displays On Top For Offline
    bringtotop: function () {
        //Bring TOC To TOp
        $(this.el).css({
            "z-index": 500
        });
    },
    //Navigate
    navigate: function(event) {
        //Variables
        var elem;
        var page;
        var excpMsg;     
        
        event.stopPropagation();
        
        //Initializes
        excpMsg = "Book.TOCView.navigate: ";
		
        try {
            //Stop Event Propagation For Nested Structure
            //event.stopPropagation();
            //Get Element
            elem = $(event.currentTarget);
            //Get Page For Navigation
            page = elem.attr("page");//alert(page);

            //Navigate To Page
            Book.bookview.page(page.replace(/\.\.\//g, ''));

            //Set Class To Active
            this.active(elem);

            //Trigger Click Event Of TOC Icon To Toggle TOC View
            this.hide();
        } catch (excp) {
            //Write To Console
            console.log(excpMsg + excp);
        }        
        
    },
    loadtocpage: function () {
        Book.bookview.page("toc-first");
    },
    //Hide
    hide: function() {
        //Initializes
        excpMsg = "Book.TOCView.hide: ";

        try {
            if ($(this.iconEl).hasClass("active")) {
                $(this.iconEl).trigger("click");
            }
        } catch (excp) {
            //Write To Console
            console.log(excpMsg + excp);
        }
    },
    //Active
    active: function(clickelem) {
        //Variables
        var elem;
        var elemActive;
        var page;
        var excpMsg;

        //Initializes
        excpMsg = "Book.TOCView.active: ";

        try {
            //If Passed Element Is Blank Or Undefined Set To Book Page Else Set To Passed Elements Page Attribute
            if (clickelem) {
                page = clickelem.attr("page");
            } else {
                page = (Book.fullpage == null || Book.fullpage == "") ? Book.page : Book.fullpage;
            }
            //Get Page Element To Make It Selected
            elem = $(this.toccontainerEl).contents().find("li[page='" + page + "']");
            //Get Currently Active Element
//            elemActive = $(this.toccontainerEl).contents().find("li[class='" + General.c_s_CLASS_TOGGLE_ACTIVE + "']");
            elemActive = $("li[class='" + General.c_s_CLASS_TOGGLE_ACTIVE + "']");elemActive.removeClass(General.c_s_CLASS_TOGGLE_ACTIVE);
            //Toggle Active To Current Element If Element Is Not ALready Selcted
            if (!elem.hasClass(General.c_s_CLASS_TOGGLE_ACTIVE)) {
                //Remove Active Class                
                
                
                //Add Class To Element
                elem.addClass(General.c_s_CLASS_TOGGLE_ACTIVE);
                elem.parent("ul").parent().addClass(General.c_s_CLASS_TOGGLE_ACTIVE);
                
            }
        } catch (excp) {
            //Write To Console
            console.log(excpMsg + excp);
        }
    },
    /**
     * Parse NCX File TO Generate TOC
     * Sample HTML Structure To Be Created
     <li>
     <span class="toc_page_no">2</span><span class="toc_headings">Neque porro quisquam</span>
     <div class="clear"></div>
     </li>
     * Sample "navpoint"
     <navPoint id="pg03" playOrder="3">
     <navLabel>
     <text>Neque porro quisquam</text>
     </navLabel>
     <content src="page.html"/>
     </navPoint>
     */
    parseNCX: function(xml, parentId, parentlevel) {
        //Variables
        var ul;
        var li;
        var spanPageNum;
        var spanText;
        var spanTextClass;
        var clearDiv;
        var id;
        var text;
        var level;
        var page;
        var excpMsg;

        //Initializes
        excpMsg = "Book.TOCView.parseNCX: ";

        try {
            //Set Level To 0 If parentlevel Not Passed; Else To parentlevel
            if (parentlevel == null) {
                level = 1;
            } else {
                level = parentlevel + 1;
            }
            //Parse NCX To Create The TOC
            $tocXml = $(xml);
            $tocHtml = $(this.tocHtml).contents().find("#" + parentId);

            //Create Clear Div
            //Create Div
            clearDiv = $("<div />");
            //Add Propety
            clearDiv.attr(TOC.c_s_CLASS, TOC.c_s_CLASS_CLEAR);

            //New "ul" For Each Iteration
            ul = $("<ul />");
            //Add Id For List
            ul.attr(TOC.c_s_ID, "toclist");

            //Traverse Through Each "navPoint" Element
            $tocXml.children(TOC.c_s_NAVPOINT).each(function() {
                //Get Id of The Current Element
                id = $(this).attr(TOC.c_s_ID);
                //Get Text Of Current Element
                text = $(this).children(TOC.c_s_NAVLABEL).children(TOC.c_s_TEXT).text();
                //Get Link For Current Element
                page = $(this).children(TOC.c_s_CONTENT).attr(TOC.c_s_SRC);

                /*
                 * For Each Children Create The Following
                 * li - For Link
                 * span - For Page Number
                 * span - For TOC Text
                 */
                li = $("<li />");
                spanPageNum = $("<span />");
                spanText = $("<span />");

                //Create "li"
                //Add Id To "li"
                li.attr(TOC.c_s_ID, id);
                //Add Level
                li.attr(TOC.c_s_LEVEL, level);
                //Add Page
                li.attr(TOC.c_s_PAGE_LINKED, page);
                //Add Tooltip
                li.attr(TOC.c_s_PAGE_TOC_NAME, text);

                //Create Span Properties For Page Number
                //Add Class
                spanPageNum.attr(TOC.c_s_CLASS, TOC.c_s_CLASS_PAGENUM);
                //Add Text
                spanPageNum.text($(this).attr(TOC.c_s_PLAYORDER));

                //Create Span Properties For TOC Text
                //Set TOC Heading Class
                spanTextClass = TOC.c_s_CLASS_TOCHEADING;
                //Add As Many "sub" Class As Level Value
                if (level > 1) {
                    //Add "sub" Class
                    spanTextClass += " " + TOC.c_s_CLASS_SUB;
                }
                //Add TOC Heading Class
                spanText.attr(TOC.c_s_CLASS, spanTextClass);
                //Add Text
                spanText.text(text);

                //Add Spans To "li"
                //li.append(spanPageNum);//Page Number
                li.append(spanText);//TOC Heading
                li.append(clearDiv);//TOC Heading
                //Add "li" To "ul"
                ul.append(li);

                //Add "ul" To TOC HTML
                if (parentId == "toc") {
                    $(Book.tocview.tocHtml).append(ul);
                } else {
                    $(Book.tocview.tocHtml).contents().find("#" + parentId).append(ul);
                }

                //If Current Element Has "navpoint" Children Call parseNCX Recursively
                if ($(this).children(TOC.c_s_NAVPOINT).length > 0) {
                    Book.tocview.parseNCX($(this), id, level);
                }
            });
        } catch (excp) {
            //Write To Console
            console.log(excpMsg + excp);
        }
    },
    /**
     * Parse HTML File TO Generate TOC
     * Sample HTML Structure To Be Created
     <li>
     <span class="toc_page_no">2</span><span class="toc_headings">Neque porro quisquam</span>
     <div class="clear"></div>
     </li>
     * Sample "ol" Or "ul"
     <ol>
     <li><a href="page.html">Neque porro quisquam</a></li>
     </ol>
     */
    parseHtml: function(xml, parentId, parentlevel) {
        //Variables
        var ul;
        var li;
        var spanPageNum;
        var spanText;
        var spanTextClass;
        var clearDiv;
        var id;
        var text;
        var level;
        var page;
        var lineElem;
        var excpMsg;

        //Initializes
        excpMsg = "Book.TOCView.parseHtml: ";

        try {
            //Set Level To 0 If parentlevel Not Passed; Else To parentlevel
            if (parentlevel == null) {
                level = 1;
            } else {
                level = parentlevel + 1;
            }

            //Parse NCX To Create The TOC
            $tocXml = $(xml);
            $tocHtml = $(this.tocHtml).contents().find("#" + parentId);

            /*
             * If Passed XML Contains "ul", Use "ul"; Else, Use "ol"
             * This Is For Line Elements In TOC XML Passed
             */
            if ($tocXml.children(TOC.c_s_UL).length > 0) {//UL
                lineElem = TOC.c_s_UL;
            } else {//OL
                lineElem = TOC.c_s_OL;
            }

            //Create Clear Div
            //Create Div
            clearDiv = $("<div />");
            //Add Propety
            clearDiv.attr(TOC.c_s_CLASS, TOC.c_s_CLASS_CLEAR);

            //New "ul" For Each Iteration
            ul = $("<ul />");
            //Add Id
            //ul.attr("id", "ul" + Book.tocview.htmlElemId);

            //Traverse Through Each "navPoint" Element
            $tocXml.children(lineElem).each(function() {
                $(this).children().each(function() {

                    if ($(this)[0].localName.toLowerCase() == TOC.c_s_LI) {
                        //Increment Id
                        Book.tocview.htmlElemId++;
                        //Get Id of The Current Element
                        id = lineElem + Book.tocview.htmlElemId;
                        //Get Text Of Current Element
                        text = $(this).find(TOC.c_s_ANCHOR).text();
                        //Get Link For Current Element
                        page = $(this).find(TOC.c_s_ANCHOR).attr(TOC.c_s_HREF);

                        /*
                        * For Each Children Create The Following
                        * li - For Link
                        * span - For Page Number
                        * span - For TOC Text
                        */
                        li = $("<li />");
                        spanPageNum = $("<span />");
                        spanText = $("<span />");

                        //Create "li"
                        //Add Id To "li"
                        li.attr(TOC.c_s_ID, id);
                        //Add Level
                        li.attr(TOC.c_s_LEVEL, level);
                        //Add Page
                        li.attr(TOC.c_s_PAGE_LINKED, page);
                        //Add Tooltip
                        li.attr(TOC.c_s_PAGE_TOC_NAME, text);

                        //Create Span Properties For Page Number
                        //Add Class
                        spanPageNum.attr(TOC.c_s_CLASS, TOC.c_s_CLASS_PAGENUM);
                        //Add Text
                        spanPageNum.text($(this).attr(TOC.c_s_PLAYORDER));

                        //Create Span Properties For TOC Text
                        //Set TOC Heading Class
                        spanTextClass = TOC.c_s_CLASS_TOCHEADING;
                        //Add As Many "sub" Class As Level Value
                        if (level > 1) {
                            //Add "sub" Class
                            spanTextClass += " " + TOC.c_s_CLASS_SUB;
                        }
                        //Add TOC Heading Class
                        spanText.attr(TOC.c_s_CLASS, spanTextClass);
                        //Add Text
                        spanText.text(text);

                        //Add Spans To "li"
                        //li.append(spanPageNum);//Page Number
                        li.append(spanText);//TOC Heading
                        li.append(clearDiv);//TOC Heading
                        //Add "li" To "ul"
                        ul.append(li);

                        //Add "ul" To TOC HTML
                        if (parentId == "toc") {
                            $(Book.tocview.tocHtml).append(ul);
                        } else {
                            //$(Book.tocview.tocHtml).contents().find("#" + parentId).append(ul);
                            $(Book.tocview.tocHtml).find("#" + parentId).append(ul);
                        }

                        //If Current Element Has "ul"/"ol" Children Call parseHTML Recursively
                        if ($(this).children(lineElem).length > 0) {
                            Book.tocview.parseHtml($(this), id, level);
                        }
                    } else if ($(this)[0].localName.toLowerCase() == lineElem) {
                        //Create A New Element TO Pass To Recursion
                        var dummyParent = $("<" + lineElem + "/>");
                        //Increment Id
                        Book.tocview.htmlElemId++;
                        //Get Id of The Current Element
                        id = lineElem + Book.tocview.htmlElemId;

                        //New "ul" For Each Iteration
                        li = $("<li />");

                        //Add Id To "li"
                        li.attr(TOC.c_s_ID, id);

                        //Add "li" To "ul"
                        ul.append(li);
                        //Add To Dummy Parent
                        dummyParent.append($(this)[0].outerHTML);

                        //Add "ul" To TOC HTML
                        if (parentId == "toc") {
                            $(Book.tocview.tocHtml).append(ul);
                        } else {
                            $(Book.tocview.tocHtml).contents().find("#" + parentId).append(ul);
                            //$(Book.tocview.tocHtml).find("#" + parentId).append(ul);
                        }



                        Book.tocview.parseHtml(dummyParent, id, level);
                    }
                });
            });
        } catch (excp) {
            //Write To Console
            console.log(excpMsg + excp);
        }
    }
});

//Book View Object; Displays Book With Specific Object
Book.BookView = Backbone.View.extend({
    msgEl: "#message",//Message Element
    initialize: function() {
        //Execute Bind All; This Will Invoke The Backbone.Sync Method
        _.bindAll(this, 'render', 'loadTOC', 'loadPage');
    },
    top: 0, //Book Page Scroll Top For Anchor Navigation
    hashMap: null,

    //Render Method For Bookview
    render: function() {
		//Add Loader
//        $loaderImg = $('<img />', {
//            src : '../media/loader.gif'                    
//        });
//        $loaderImg.css({'left':'280px', 'top' : '150px', 'position' : 'relative'});
        var $loaderImg = '<div style=" font-size: 13px; text-align:center; top: 45%; left: 50%; position : absolute;"><img src="../media/loader.gif" style="margin-bottom: 15px;"><br />LOADING</div>'
        $("#epubViewerWrapper").html($loaderImg);        
		
        //this.$el.html(this.mainTemplate());
        Book.bookcollection.fetch();
    },
    //Hide Message Element
    hideMessage: function () {
        $(this.msgEl).hide();
    },
    //Load TOC For Display
    loadTOC: function(tocData) {
        //Variables
        var xmlDoc;
        var xml;
        var tocJSON = {};
        var excpMsg;

        //Initializes
        excpMsg = "Book.BookView.loadTOC: ";

        try {
            //Execute Logic If TOC Data Is Not Null
            if (tocData === "") {//Hide
            } else {//Display
                //Populate Template */
                Book.tocview.populate(tocData);
            }
        } catch (excp) {
            //Write To Console
            console.log(excpMsg + excp);
        }
    },
    //Load Page For Book
    loadPage: function(page) {
        //Variables
        var src;
        var hashmap;
        var visitedPages = "";
        var excpMsg;
        
        //Initializes
        excpMsg = "Within Book.BookView.loadPage: ";
        
        try {
            //Hide Any Offline Loader First
            $("#offlineloader").hide();
            //Close TOC
            Book.tocview.hide();
            /*
             * If Book.fullpage Is Not Null Or Blank Set page = Book.fullpage;
             * Else Set page = Book.page
             * This Is For Anchor Navigation
             */
            if (Book.fullpage == null || Book.fullpage == "") {                
                //Set Page
                page = page || Book.bookmodel.get('page');
            } else {                
                //Set Page
                page = Book.fullpage;
            }
            
            if (page == "toc-first") {
                //$('#epubViewerWrapper').html(_.template($("#tocPageTemplate").html(), {"data" : "test"}));
                /*var tocpagehtml = _.template($('#tocPageTemplate').html(), {"data" : "test"});
                $('#epubViewerWrapper').html(tocpagehtml);
                return;*/				
                Book.bookview.renderTOCPage();			
		Book.footerpanelview.pagenumber();				
                return;
            }
            
            //Set Page Source Path
            src = Book.bookmodel.get('bookPath') + Book.bookmodel.get('opfRoot') + (page || Book.bookmodel.get('page'));
            //Create Hash Map For Loader
            hashmap = src.lastIndexOf('#') !== -1 ? src.substring(src.lastIndexOf('#') + 1) : null;
            
            //Set Hash Map
            Book.BookView.hashMap = hashmap;
            
            //Create New iFrame Object for Rendering Page
            
            //Set iFrame Attributes And Load
            /*$bookViewer.attr({
                'id': 'bookViewer',
                'scrolling': 'no',
                'frameborder': '0',
                'width': '100%',
				'height': '100%',
                'src': src
            }).load(function(response,status,xhr) {
                try {
                    //Active TOC Link
                    Book.tocview.active();
					//Display Frame
					displayFrame();
                } catch (loadExcp) {
                    //Write To Console
                    console.log("Load Page - Load Iframe Content : " + loadExcp);
                }
            });*/
            
			//Book.bookview.getPageHtml();
            /*var $bookViewer = $('<div/>');
            var currIdx = Book.bookcollection.indexOf(Book.bookmodel);
            pagehtmlModified = Book.bookview.modifyPath(pageHtml[currIdx - 1], page);
            $bookViewer.html(pagehtmlModified);
            resize();
            Book.footerpanelview.pagenumber();
            //Set HTML Into Wrapper
            $('#epubViewerWrapper').html($bookViewer);
            Book.tocview.active();*/
            Book.currentSrc = page;
            Book.bookview.getPageHtml();
            Book.footerpanelview.pagenumber();				
        } catch (excp) {
            //Write To Console
            console.log(excpMsg + excp);
        }
    },
    renderTOCPage: function () {	
            
            var details = _.filter(Book.booklist, function (book) {return book.book_id == Book.solutionId;})[0];            
            var objdetails = {};
            objdetails["book_title"] = details["book_title"];
			
            //@LM: For Native Only... Must Not Removed -- Start Here
//            var imgPath = objLibraryJsonData.mediaPath;
//            var arrImgPath = imgPath.split(/[\s/]+/);
//            var arrNewPath = arrImgPath.slice(0, arrImgPath.length - 1); 
//            var finalImgPath = arrNewPath.join("/") + "/" + "media/";
            //@LM: For Native Only... Must Not Removed -- Ends Here
			
            objdetails["book_image"] = objLibraryJsonData.mediaPath + details["book_image"];
            var tocpagehtml = _.template($('#tocPageTemplate').html(), objdetails);
            $('#epubViewerWrapper').html(tocpagehtml);		
			
            $("#epubViewerWrapper").css({'overflow' : 'auto'});
            $('.contentMainInner').animate({'opacity': '1'}, 400);
			
            /*setTimeout(function () {
                    $('.contentMainInner').animate({'opacity': '1'}, 400);
            }, 400);*/
			
            $("#toclist li").on("click tap", function (event) {
                Book.tocview.navigate(event);
            });
        },
	//Get Page HTML
    getPageHtml: function () {
        bookPageContentData = "";
        //GetBookPageContent(Book.page, Books.c_s_BOOKFOLDER_PREFIX + Book.id);
        GetBookPageContent(Book.bookmodel.get('opfRoot') + "/" +Book.page, Books.c_s_BOOKFOLDER_PREFIX + Book.id);
        setTimeout(Book.bookview.renderPage, 100);
    },
	
    //Render Page
    renderPage: function (page) {
        
        var excpMsg = "Within Book.BookView.renderPage: ";
        
        try {
            if (bookPageContentData != "") {
                var $bookViewer = $('<div/>', {class : 'ebookContentWrapper'});
                pagehtmlModified = Book.bookview.modifyPath(bookPageContentData);
                $bookViewer.html(pagehtmlModified);
                
                //  Set Epub Overflow To Hidden
//                $('#epubViewerWrapper').css({'overflow' : 'hidden'});
                
                var epubViewerHeight    = parseInt($('#epubViewerWrapper').height());
                var epubViewerPadding   = parseInt($('#epubViewerWrapper').css('padding-top')) + parseInt($('#epubViewerWrapper').css('padding-bottom'));
                var epubViewerBorder    = parseInt($('#epubViewerWrapper').css('border-top')) + parseInt($('#epubViewerWrapper').css('border-bottom'));
                
                var epubContentArea     = epubViewerHeight - epubViewerPadding;
                
                resize();
                Book.footerpanelview.pagenumber();					
                $('#epubViewerWrapper').html($bookViewer);                   
                
                if(Book.BookView.hashMap != null) {
                    $('#epubViewerWrapper').scrollTo("#" + Book.BookView.hashMap);
                } else {                    
                    $('#epubViewerWrapper').scrollTo(0);
                }
                
            } else {
                setTimeout(Book.bookview.renderPage, 100);
            }
        } catch (excp) {
                alert(excpMsg + excp);
        }
    },
        
    //Modify Path For Media
    modifyPath: function (html, src) {
            var ret = html;
            var pageContent = $(html);
            var pagesrc = "";
//            alert(objLibraryJsonData.mediaPath);
            //Image
            pagesrcLength = Book.currentSrc.split("/").length;
            pagesrc = Book.currentSrc.split("/")[0] + "/";          
            
            rootFolderSrc = (pagesrcLength > 1) ? pagesrc : '';
            
            pageContent.find("img").each(function (idx, image) {                
//                $(image).attr("src", Book.bookmodel.get('bookPath') + Book.bookmodel.get('opfRoot') + $(image).attr("src"));

                $(image).attr("src", Book.bookmodel.get('bookPath') + rootFolderSrc + $(image).attr("src"));
            });
            
            // For Svg
            pageContent.find("image").each(function (idx, image) {                
//                $(image).attr("xlink:href", Book.bookmodel.get('bookPath') + Book.bookmodel.get('opfRoot') + $(image).attr("xlink:href"));
                $(image).attr("xlink:href", Book.bookmodel.get('bookPath') + rootFolderSrc + $(image).attr("xlink:href"));
            });
            
            //For Css Files
//            pageContent.filter("link").each(function (idx, css) {                
//                $(css).attr("href", Book.bookmodel.get('bookPath') + Book.bookmodel.get('opfRoot') + "/" + $(css).attr("href"));
//            });

            //For Links And Anchors
            pageContent.find("a").each(function (idx, link) { 
                var linkPath = $(link).attr("href");
                $(link).attr("href", "");
                $(link).attr("onclick", "Book.bookview.page('" + linkPath + "')");
            });

            return pageContent;
    },
	
    //Page Function To Validate Page For Navigation
    page: function(id) {
        //Variables
        var page;
        var model;
        var excpMsg;

        //Initializes
        excpMsg = "Within Book.BookView.page: ";
        
        try {
            /*
             * If Page Link Coontains Anchor, Save Full Link In Book.fullpage And Remove From Book.Page
             * Else, Set Book.fullpage = "" And Page To Passed Page
             */
            if (id.indexOf("#") >= 0) {                
                //Save Into Book.fullpage
                Book.fullpage = id;
                //Set Page Without Anchor Tag
                page = id.substring(1, id.indexOf("#"));
            } else {
                //Save Blank Into Book.fullpage
                Book.fullpage = "";
                //Set Page To Passed Id
                page = id;
            }
                        
                       
            //Get Model
            model = Book.bookcollection.search(page);            
            /*
             * If Model Is Not Null, Initialize Page From Model And Load
             * Else, Call Method To Load Default Page
             */
            if (model !== false) {
                //Set Model
                Book.bookmodel = model;
                //Get Page
                Book.page = Book.bookmodel.get('page');
                //Call Load Page Method
                Book.bookview.loadPage(id);
            } else {
                //Call load Page Without Model; Loads Default/First Page
                Book.bookview.loadPage();
            }
        } catch (excp) {
            //Write To Console
            console.log(excpMsg + excp);
        }
    },
    //Page Move Functions
    //Move To Previous
    prev: function() {
        //Variables
        var currIdx;
        var excpMsg

        //Initializes
        excpMsg = "Within Book.BookView.prev: ";

        try {
			//Set Book.fullpage To Null For Proper Navigation
            Book.fullpage = "";

            //Get Current Page Index To Scroll Back
            currIdx = Book.bookcollection.indexOf(Book.bookmodel);
            //Stop If Currrent Index Is 0
            if (currIdx == 0) return;
            //Get Previous Book Model
            Book.bookmodel = Book.bookcollection.at(currIdx - 1);
            if (Book.bookmodel.get('page') == "toc-first") {				
                Book.bookview.renderTOCPage();
				$(".ftr_middle").html('Page 1 of '+ Book.bookcollection.length);
                return;
            }
            //Scroll To Page If Model Exists
            if (Book.bookmodel) {
                //Set To Previous Page
                Book.page = Book.bookmodel.get('page');
                //Call Method To Locad Page
                Book.bookview.loadPage();
            } else {
                //Previous Page does Not Exist; Load Same Page
                Book.bookmodel = Book.bookcollection.at(currIdx);
            }
        } catch (excp) {
            //Write To Console
            console.log(excpMsg + excp);
        }
    },
    //Move To Next
    next: function() {
        //Variables
        var currIdx;
        var excpMsg

        //Initializes
        excpMsg = "Within Book.BookView.next: ";

        try {
			//Set Book.fullpage To Null For Proper Navigation
            Book.fullpage = "";

            //Get Current Page Index To Scroll Back
            currIdx = Book.bookcollection.indexOf(Book.bookmodel);
            //Stop If Last Page
            if (Book.bookcollection.length == currIdx + 1) return;
            //Get Previous Book Model
            Book.bookmodel = Book.bookcollection.at(currIdx + 1);
            //Scroll To Page If Model Exists
            if (Book.bookmodel) {
                //Set To Previous Page
                Book.page = Book.bookmodel.get('page');
                //Call Method To Load Page
                Book.bookview.loadPage();
            } else {
                //Previous Page does Not Exist; Load Same Page
                Book.bookmodel = Book.bookcollection.at(currIdx);
            }
        } catch (excp) {
            //Write To Console
            console.log(excpMsg + excp);
        }
    },
	
	swipePage: function () {
		$("#bookContainer").on('swipeleft swiperight', function(event) {			
			switch (event.type) {
				case "swipeleft"://Swiped To Left
					//Go Next					
					Book.bookview.next();
					break;
				case "swiperight"://Swiped To Right
					//Go Prev
					Book.bookview.prev();
					break;
			}
		});
	}
});