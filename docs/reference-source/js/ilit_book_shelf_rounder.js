window.ILIT_BOOKSHELF_CONST = {

    BOOK_CLASS: ".bookElement",
    ILIT_BENCH: '<div class="iLitBench"></div>',
    BASIC_STANDARD_TIME: 1E3 / 60,
    ENVIRONMENT_TEST_ID: "environment3DilitBSRTest",
    WEBKIT_MATRIX: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)",
	CARD_SHOW_COEFF:8,
    PERSPECTIVE_3D: 1500,
    PERSPECTIVE_2D: 500,
	BOOK_SCALE_DIFFERENCE_COEFF:110,
    ANIMATION_METHOD: null,
    MINIMUM_H_MOVE_DISTANCE: 300,
	MAX_Z_INDEX:800,
    WEBKIT_TEST: /webkit/.test(navigator.userAgent.toLowerCase()),
    PROHIBITED_EVENTS: "dragstart selectstart contextmenu MSHoldVisual",
    CUMULATIVE_MOUSE_EVENTS: "mousedown mousemove mouseout mouseup",
    CUMULATIVE_TOUCH_EVENTS: "touchmove touchstart touchend",
    RATIFIED_CLICK: "click.BookElementInvoke",
    CANVAS_STRING: "canvas",
    STYLE_PARAM: {
        WebkitTransform: "-webkit-transform",
        OTransform: "-o-transform",
        msTransform: "-ms-transform",
        MozTransform: "transform",
        Transform: "transform"
    },
    FRESH_CSS: {
        "-webkit-transform": "",
        "-moz-transform": "",
        "-ms-transform": "",
        left: "",
        top: "",
        opacity: 1
    },
    TOUCH_EVENT: {
        START: "touchstart",
        MOVE: "touchmove",
        END: "touchend",
        CANCEL: "touchcancel"
    },
    MOUSE_EVENT: {
        START: "mousedown",
        MOVE: "mousemove",
        END: "mouseup"
    },
    ANIM_EFFECT: {

        ROUND_FEEL: function (distance, widthOfContainer, tempWidth) { 
            var distance180 = Math.PI * distance;
            return -widthOfContainer / 2 * (Math.cos(distance180 / tempWidth) - 1);
        },

        FLAT_FEEL: function (distance, widthOfContainer, tempWidth) {
            return widthOfContainer * distance / tempWidth;
        }
    }

};

(function (bookSelfJquery) {

    /*FUNCTION ilitBookShelfRounderManager : START */
    function ilitBookShelfRounderManager(carouselWrapper, config) {

        this.id = "" + boxElementPropertyArranger.id++;
        this.serial = 0;
        this.assignedWidth = carouselWrapper.width();
        this.documentWidth = bookSelfJquery(document).width();
        this.viewPortWidth = false;
        this.settings = config;
        var inheritedConfig = bookSelfJquery.extend({}, ilitBookShelfRounderManager.defaultProperties, config);
        this.nonstopOccurrence = inheritedConfig.nonstopOccurrence;
        this.assignedScale = false;
        this.halfOfNaturalWidth = 0;
        this.initialClasses = "";
        this.ILITBookShelfRounderINDEX = -1;
        this.itemAlignment = "";
        this.assignedBooks = [];
        this.removalIndex = 0;
        this.movingBoxElements = [];
        this.containerEnvironment = bookSelfJquery('<div class="iLithorizon"></div>');
        this.enginePacket = carouselWrapper;
        carouselWrapper.append(this.containerEnvironment);
        this.widthOfContainer = this.containerEnvironment.width();
        this.compWidthOnLoadAndRefresh = -1;
        this.containerEnvironment.height();
        this.currentTouchMoveDistanceY = 0;
        this.currentTouchMoveDistanceX = 0;
        this.scrollPosition = 0;
        this.distanceToMove = 0;
        this.accurateDistanceTraveled = 0;
        this.numOfElementsAtHalfCircle = 0;
        this.excessUndividedSpace = 0;
        this.needAccurateCoordinates = false;
        this.nowTime = 0;
        this.enginePosition = {
            x: 0,
            y: 0
        };
        this.touchStarted = false;
        this.timeStamp = 0;
        
        this.isMovementEnd = true;

        this.movementController = null;
		carouselWrapper.append(this.containerEnvironment);
		/*carouselWrapper.parent().css('overflow','hidden');*/
		
        if ("undefined" === typeof inheritedConfig.profiles) {
            inheritedConfig.profiles = [inheritedConfig];
        }

        var totalProfile = inheritedConfig.profiles.length;
        this.configuration = inheritedConfig;
        for (var profileCouneter = 0; profileCouneter < totalProfile; profileCouneter++) {

            this.initialClasses += inheritedConfig.profiles[profileCouneter].cssClass + " ";

        }

        var currentBookShelfManager = this;
        this.scale = 1;
        

        carouselWrapper.bind(ILIT_BOOKSHELF_CONST.PROHIBITED_EVENTS, function () {
            return false;
        });

        
        carouselWrapper.bind(ILIT_BOOKSHELF_CONST.CUMULATIVE_MOUSE_EVENTS, function (event) {
            currentBookShelfManager.mouseEventManager(event);
        });


        carouselWrapper.bind(ILIT_BOOKSHELF_CONST.CUMULATIVE_TOUCH_EVENTS, function (touchEvent) {
            currentBookShelfManager.touchEventManager(touchEvent);
            return Math.abs(currentBookShelfManager.currentTouchMoveDistanceY) > Math.abs(currentBookShelfManager.currentTouchMoveDistanceX) ? true : ILIT_BOOKSHELF_CONST.TOUCH_EVENT.MOVE === touchEvent.type ? false : true;
        });

        this.boxElementPropertyConfig(bookSelfJquery(ILIT_BOOKSHELF_CONST.BOOK_CLASS, carouselWrapper));
        this.compWidthOnLoadAndRefresh = 0;
        ilitBookShelfRounderManager.canvasCreation();
        this.setProperScaleValue(this.documentWidth, "ilitBookShelfRounderManager");
        this.fixPosition(true);
        this.sendToMiddle(inheritedConfig.centerBookIndex);
        this.fixPosition(false);
        ilitBookShelfRounderManager.list[this.id] = this;
    }

    /* FUNCTION ilitBookShelfRounderManager: END */

    function boxElementPropertyArranger(imageContainerDiv, currentILITBookShelfRounder) {
		
		this.visible = false;
        this.removalIndex = this.decidedBoxHeight = this.insideDivWidth = this.height = this.width = this.index = 0;
        this.thsILITBookShelfRounder = currentILITBookShelfRounder;
        
        this.currentCenterIndex = -1;
        this.boxElement = imageContainerDiv;
        this.uniqueId = boxElementPropertyArranger.id++;
        boxElementPropertyArranger.keyWiseList[this.uniqueId] = this;
        this.boxElement.attr("ILIT_BOX_UNIQ_ID", this.uniqueId);
        currentILITBookShelfRounder.integrateHTML5Style(this.boxElement, "transform-style", "preserve-3d")
    }


    Date.now || (Date.now = function () {
        return (new Date).getTime();
    });

    /*ANIMATION STRATEGY CHOOSER:START*/
    window.animationMethodChooser = function () {
        ILIT_BOOKSHELF_CONST.ANIMATION_METHOD = (

            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (functionToFireAtInterval) {
                window.setTimeout(functionToFireAtInterval, ILIT_BOOKSHELF_CONST.BASIC_STANDARD_TIME)
            }

        );

        return ILIT_BOOKSHELF_CONST.ANIMATION_METHOD;
    }();
    /*ANIMATION STRATEGY CHOOSER:END*/

    boxElementPropertyArranger.id = 0;
    boxElementPropertyArranger.keyWiseList = {};


    /*boxElementPropertyArranger PROTOTYPE : START*/
    boxElementPropertyArranger.prototype = {

        clickEventAttacher: function () {
            var boxElement = this,
                thsILITBookShelfRounder = boxElement.thsILITBookShelfRounder;

           this.boxElement.unbind(ILIT_BOOKSHELF_CONST.RATIFIED_CLICK + this.uniqueId);
            this.boxElement.bind(ILIT_BOOKSHELF_CONST.RATIFIED_CLICK + this.uniqueId, function (bookElementClickEvent) {
				
				var thisUniqId,centerUniqId = thsILITBookShelfRounder.getMiddleItem().attr('ilit_box_uniq_id');
				thisUniqId = $(this).attr('ilit_box_uniq_id');
				if(thisUniqId==centerUniqId){
				thsILITBookShelfRounder.configuration.onBookClicked($(this));
				}
                if (thsILITBookShelfRounder.getCenterBookIndex() != boxElement.index) {

                    bookSelfJquery(bookElementClickEvent.target).trigger("focus");
                    thsILITBookShelfRounder.inBetweenGap3d < thsILITBookShelfRounder.tempWidth && thsILITBookShelfRounder.sendToMiddle(boxElement.index);
                    bookElementClickEvent.preventDefault();
                    return false;
                }
            })
        },
        clickEventRemover: function () {
            this.boxElement.unbind(ILIT_BOOKSHELF_CONST.RATIFIED_CLICK + this.uniqueId)
        }
    };
    /*boxElementPropertyArranger PROTOTYPE : END*/


    ilitBookShelfRounderManager.run = function () {
        var availableBookShelfInPage = ilitBookShelfRounderManager.list,
            i;

        for (i in availableBookShelfInPage) {
            var hasProp = availableBookShelfInPage.hasOwnProperty(i);

            if (hasProp) {

                availableBookShelfInPage[i].playFrame();

                for (var c = 0; c < availableBookShelfInPage[i].assignedBooks.length; c++) {
                    availableBookShelfInPage[i].assignedBooks[c].boxElement.css("visibility", "visible");
                }
                availableBookShelfInPage[i].containerEnvironment.css("visibility", "visible");
            }
        }
		
		
    };
    bookSelfJquery(window).resize(function () {

/* 
        var availableBookShelfInPage = ilitBookShelfRounderManager.list,
            i = null;

        for (i in availableBookShelfInPage) {
            if (availableBookShelfInPage.hasOwnProperty(i)) {
                availableBookShelfInPage[i].viewPortWidth = true;
            }
        } */

    });



    bookSelfJquery(window).load(function () {
        function firstRound() {
            ilitBookShelfRounderManager.run();
            window.animationMethodChooser(firstRound);
			
			
        }
        firstRound();
    });



    ilitBookShelfRounderManager.defaultProperties = {
        
        centerBookIndex: 0,
        nonstopOccurrence: true,
        minWidth: 0,
        maximumW: Number.POSITIVE_INFINITY,
        scale: 100,
        gapAtNormalEnvironment: 200,
        gapAt3DEnvironment: 200,
        floorLine: "top:48%",
        itemAlign: "middle",
        renderer3d: "makeRounderFrame3D",
        
        perspective3d: 0,
        fadeEdgeItems: true,
        cssClass: "",
        autoChangeDirection: 0,
        autoChangeDelay: 4E3,
        rootPerspective: "50% 0px",
        animationSmoothCoeff: 20,
        atEachMovement: function () {},
        atMovementStart: function () {},
        atMovementEnd: function () {},
        onBookAppend: function () {},
        onBookRemove: function () {},
	onEngineLoaded: function () {}
    };
    ilitBookShelfRounderManager.hasFocus = true;
    ilitBookShelfRounderManager.ableToRun3D = false;
    ilitBookShelfRounderManager.canvasAbility = false;
    ilitBookShelfRounderManager.list = {};
    ilitBookShelfRounderManager.id = 0;

    ilitBookShelfRounderManager.testingOf3DEnvironment = function () {

        var div = document.createElement("div"),
            styleElement, styleOutput, styleParams = ILIT_BOOKSHELF_CONST.STYLE_PARAM;
        div.id = ILIT_BOOKSHELF_CONST.ENVIRONMENT_TEST_ID;
        document.body.insertBefore(div, document.body.lastChild);

        for (styleElement in styleParams) {
            if (void 0 !== div.style[styleElement]) {
                div.style[styleParams[styleElement]] = ILIT_BOOKSHELF_CONST.WEBKIT_MATRIX;
                styleOutput = window.getComputedStyle(div).getPropertyValue(styleParams[styleElement]);
            }
        }
        bookSelfJquery("#" + ILIT_BOOKSHELF_CONST.ENVIRONMENT_TEST_ID).remove();

        if (void 0 !== styleOutput) {
            styleOutput = ("none" !== styleOutput);
        } else {
            styleOutput = false;
        }

        return styleOutput;

    };

    ilitBookShelfRounderManager.canvasCreation = function () {

        var canvasElement;
        ilitBookShelfRounderManager.browser = {};
        ilitBookShelfRounderManager.browser.webkit = ILIT_BOOKSHELF_CONST.WEBKIT_TEST;
        ilitBookShelfRounderManager.ableToRun3D = ilitBookShelfRounderManager.testingOf3DEnvironment();
        canvasElement = document.createElement(ILIT_BOOKSHELF_CONST.CANVAS_STRING);
        ilitBookShelfRounderManager.canvasAbility = !(!canvasElement.getContext || !canvasElement.getContext("2d"));
    };


    /*Animation Ease functions : START*/
    easeInOutSine = function (a, b, c) {
        return -b / 2 * (Math.cos(Math.PI * a / c) - 1) + 0
    };

    linearTween = function (a, b, c) {
        return b * a / c + 0
    };
    /*Animation Ease functions : END*/


    /*
	ilitBookShelfRounderManager.prototype: 
	appending functions to ilitBookShelfRounderManager: START
	*/

    ilitBookShelfRounderManager.prototype = {
        boxElementInsertion: function (boxElement) {
            this.assignedBooks.push(boxElement);
            boxElement.index = this.assignedBooks.length - 1;
        },
        boxElementPropertyConfig: function (imageContainerDiv) {
            var thisILITBookShelfRounder = this;
            imageContainerDiv.each(function () {
                var a = new boxElementPropertyArranger(bookSelfJquery(this), thisILITBookShelfRounder);
                thisILITBookShelfRounder.boxElementInsertion(a)
            })
        },
       
        fixPosition: function (fixPositionFlag) {
            this.needAccurateCoordinates = fixPositionFlag;
        },

        keenAdjustment: function (givenDistance) {
            
            var distance, remainingGap = null;
            distance = givenDistance - this.excessUndividedSpace;
            var halfOfGap = this.inBetweenGap3d / 2;
            remainingGap = distance % this.inBetweenGap3d;

            if (0 > remainingGap) {
                distance = remainingGap >= -halfOfGap ? distance - remainingGap : distance - (this.inBetweenGap3d + remainingGap)
            } else {
                0 < remainingGap && (distance = remainingGap >= halfOfGap ? distance + (this.inBetweenGap3d - remainingGap) : distance - remainingGap)
            }
            return distance + this.excessUndividedSpace;
        },
        generalMoveHandler: function (moveEvent) {
		
		
            var anyOneSideMoved = false,
                movedMinimum = false,
                displacementH, displacementV, targetDistanceToMove, absH = null,
                absV = null;

            if (this.touchStarted) {
                displacementH = moveEvent.pageX - this.enginePosition.x
                displacementV = moveEvent.pageY - this.enginePosition.y;
				
                this.currentTouchMoveDistanceX = displacementH;
                this.currentTouchMoveDistanceY = displacementV;

                displacementH = displacementH / this.scale;
                absH = Math.abs(1 * displacementH);
                absV = Math.abs(1 * displacementV);

                if (0 < absH || 0 < absV) {
                    anyOneSideMoved = true;
                }

                if (ILIT_BOOKSHELF_CONST.MINIMUM_H_MOVE_DISTANCE < absH) {
                    movedMinimum = true;
                }

                if (anyOneSideMoved) {

                    if (!movedMinimum) {
                        targetDistanceToMove = this.distanceToMove + displacementH;
                        this.driveBookShelf(targetDistanceToMove);
                        this.enginePosition = {
                            x: moveEvent.pageX,
                            y: moveEvent.pageY
                        }
                    }

                }
            }
		
        },
        touchEventManager: function (event) {

            var originalEvent = event.originalEvent,
                touch = originalEvent.touches[0];
            switch (event.type) {
            case ILIT_BOOKSHELF_CONST.TOUCH_EVENT.MOVE:
                this.generalMoveHandler(touch);
                break;
            case ILIT_BOOKSHELF_CONST.TOUCH_EVENT.START:
                this.enginePosition = {
                    x: touch.pageX,
                    y: touch.pageY
                };
                this.touchStarted = true;

                this.timeStamp = Date.now();
                this.currentTouchMoveDistanceX = 0;
                break;
            case ILIT_BOOKSHELF_CONST.TOUCH_EVENT.CANCEL:
            case ILIT_BOOKSHELF_CONST.TOUCH_EVENT.END:
                this.touchStarted = false;
				this.driveBookShelf(this.keenAdjustment(this.distanceToMove ));
				
            }
        },
        mouseEventManager: function (mouseEvent) {
            switch (mouseEvent.type) {

            case "mousedown":
                this.enginePosition = {
                    x: mouseEvent.pageX,
                    y: mouseEvent.pageY
                };
                this.touchStarted = true;

                this.timeStamp = Date.now();
                this.currentTouchMoveDistanceX = 0;
                break;

            case "mousemove":
                if (!this.touchStarted) break;
                this.generalMoveHandler(mouseEvent);
                break;

            case "mouseup":
                this.touchStarted = false, this.driveBookShelf(this.keenAdjustment(this.distanceToMove ));
            }
        },
        
        
		driveBookShelf: function (distanceToMove) {
			
			this.distanceToMove  = distanceToMove;
            if(this.needAccurateCoordinates){
				this.accurateDistanceTraveled = distanceToMove;
			}
        },

        setProperScaleValue: function (deducedComponentWidth) {
			
            var b, c = this.configuration.profiles;

            for (e = 0; e < c.length; e++) {
                b = c[e];
                b = bookSelfJquery.extend({}, ilitBookShelfRounderManager.defaultProperties, this.settings, b)
                if (b, deducedComponentWidth >= b.minWidth && deducedComponentWidth <= b.maximumW) {
					
                    if (e !== this.ILITBookShelfRounderINDEX) {
                        deducedComponentWidth = this.getCenterBookIndex();

                        if (isNaN(deducedComponentWidth)) {
                            deducedComponentWidth = 0
                        }

                        this.configuration = b;
                        
                        
                        this.ILITBookShelfRounderINDEX = e;
                        this.enginePacket.removeClass(this.initialClasses).addClass(b.cssClass);
                        this.containerEnvironment.attr("style", "position:absolute;" + b.floorLine);
                        this.itemAlignment = b.itemAlign;
                        this.scale = b.scale / 100;

                        if (ilitBookShelfRounderManager.ableToRun3D && b.renderer3d) {
                            if (b.autoScale3d) {
                                this.assignedScale = b.autoScale3d;
                            } else {
                                this.assignedScale = b.autoScale;
                            }
                        } else {
                            if (b.autoScale2d) {
                                this.assignedScale = b.autoScale2d;
                            } else {
                                this.assignedScale = b.autoScale;
                            }
                        }

                        this.assignedScale = this.assignedScale / 100;

                        if (ilitBookShelfRounderManager.ableToRun3D && b.renderer3d) {
                            if (b.width3d) {
                                this.tempWidth = b.width3d;
                            } else {
                                this.tempWidth = b.width;
                            }

                        } else {
                            if (b.width2d) {
                                this.tempWidth = b.width2d;
                            } else {
                                this.tempWidth = b.width;
                            }
                        }

                        this.halfOfNaturalWidth = this.tempWidth / 2;

                        ilitBookShelfRounderManager.ableToRun3D && b.renderer3d ? (this.containerEnvironment.width(this.tempWidth), this.inBetweenGap3d = b.gapAt3DEnvironment) : (this.containerEnvironment.width(this.tempWidth * this.scale),
                            this.inBetweenGap3d = b.gapAtNormalEnvironment);
                        this.numOfElementsAtHalfCircle = Math.floor(this.halfOfNaturalWidth / this.inBetweenGap3d);
                        this.t = this.halfOfNaturalWidth % this.inBetweenGap3d;
                        b = this.containerEnvironment, e = b.parent(), (c = this.configuration.perspective3d) || (c = "makeRounderFrame3D" === this.configuration.renderer3d ? 1500 : 500), ilitBookShelfRounderManager.ableToRun3D && this.configuration.renderer3d ? (ilitBookShelfRounderManager.browser.webkit && (c *= 2, this.integrateHTML5Style(e, "perspective", c + "px")), this.integrateHTML5Style(b, "perspective", c + "px"), this.integrateHTML5Style(b, "transform-style", "preserve-3d"), this.integrateHTML5Style(b, "perspective-origin", this.configuration.rootPerspective)) : (this.integrateHTML5Style(e, "transform", ""), ilitBookShelfRounderManager.ableToRun3D && b.css("-webkit-transform", "translateZ(0px)")), this.updateScreen(), this.playFrame(), this.fixPosition(true), this.sendToMiddle(deducedComponentWidth), this.fixPosition(false)
						
						
                       

                    }
						
						


                    break
                }
            }
        },

        
        playFrame: function () {       
 if(this.distanceToMove < 0){
		LibraryHeaderView.booksLoadCarouselDirection = "left";
            }
            else{
                LibraryHeaderView.booksLoadCarouselDirection = null;
            }
             var a, nowTime = null,
                diffTime = null,
                fractionDistance = 0.00;
            var distanceDiffActual;

            if (this.currentCenterIndex != this.getCenterBookIndex()) {
                this.currentCenterIndex = this.getCenterBookIndex();
            }

            if (this.viewPortWidth) {
                this.viewPortWidth = false;
                this.assignedWidth = this.enginePacket.width();
                this.documentWidth = bookSelfJquery(document).width();
            }

            a = this.assignedWidth;

            if (this.compWidthOnLoadAndRefresh !== this.documentWidth) {
                this.setProperScaleValue(this.documentWidth, "playFrame");

                if (ilitBookShelfRounderManager.ableToRun3D && this.configuration.renderer3d) {

                    if (this.assignedScale) {
                        this.scale = a / (this.tempWidth / this.assignedScale);
                        this.updateScreen();
                    }
                    this.containerEnvironment.width(this.tempWidth);
                    this.containerEnvironment.css("left", (a - this.tempWidth) / 2);

                } else {
                    if (this.assignedScale) {
                        this.containerEnvironment.width(a * this.assignedScale);
                        this.scale = this.containerEnvironment.width() / this.tempWidth, this.updateScreen();
                    }
                    this.containerEnvironment.css("left", (a - this.tempWidth * this.scale) / 2);
                }
                this.compWidthOnLoadAndRefresh = this.documentWidth;
            }

            nowTime = Date.now();

            diffTime = (nowTime - this.nowTime) / (ILIT_BOOKSHELF_CONST.BASIC_STANDARD_TIME);

            if (2 < diffTime) {
                diffTime = 2;
            }

            this.nowTime = nowTime;

            fractionDistance = (this.distanceToMove - this.accurateDistanceTraveled) / (this.configuration.animationSmoothCoeff / diffTime);
            this.accurateDistanceTraveled += fractionDistance;
            this.scrollPosition += fractionDistance;
            fractionDistance = 0.5;

            ilitBookShelfRounderManager.ableToRun3D && (fractionDistance = 0.1);


            distanceDiffActual = Math.abs(+this.distanceToMove - this.accurateDistanceTraveled);
            if (distanceDiffActual <= fractionDistance) {
                this.accurateDistanceTraveled = this.distanceToMove;
                if (!this.isMovementEnd) {
                      this.configuration.atMovementEnd({
                        carousel: this,
                        frontItem: this.assignedBooks[this.getCenterBookIndex()]
                    });
                     if(typeof window.BookShelfRounder !== "undefined"){
                         //console.log(5555);
                       LibraryCarouselView.updateCarousel(window.BookShelfRounder.getMiddleItem());
                  }
                  
                  
                 }
                      this.isMovementEnd = true;
            } else {
               
                this.isMovementEnd = false;
            }
            ilitBookShelfRounderManager.ableToRun3D && this.configuration.renderer3d ? this.decideToImpound(this.accurateDistanceTraveled, this.configuration.renderer3d) : this.decideToImpound(thisthis.accurateDistanceTraveled, this.configuration.renderer2d);
			
			
			var instance = this;
			var className = ILIT_BOOKSHELF_CONST.BOOK_CLASS.split('.')[1];
			var numOfDiv = document.getElementsByClassName(className).length;
			if (numOfDiv > 3) {
				setTimeout(instance.configuration.onEngineLoaded, 1E1);
			}
       
	 },
		
        impoundBookElement: function (boxElements) {
            for (var i = 0; i < boxElements.length; i++) {
                if (boxElements[i].removalIndex != this.removalIndex) {
                    var bookIsTouched = boxElements[i].boxElement.hasClass("bookIsTouched");
                    if (!bookIsTouched) {
                        boxElements[i].boxElement.detach();
                        boxElements[i].visible = false;
                        boxElements[i].clickEventRemover();
                    }
                }
            }
            this.removalIndex++;			
        },
		
        animateToRelativeItem: function (mouseWheelDistance) {
            this.driveBookShelf((Math.floor((this.distanceToMove  - this.t) / this.inBetweenGap3d) - mouseWheelDistance) * this.inBetweenGap3d + this.t)
        },
		
        dimensionConfigureForElement: function (currentElement) {
            var div,actualImageSource;
            div = currentElement.boxElement;
            var c, e;
            if(!currentElement.visible){
				
				this.containerEnvironment.append(currentElement.boxElement);
actualImageSource = currentElement.boxElement.children('img:first').attr('targetsrc');
				currentElement.boxElement.children('img:first').attr('src',actualImageSource);
				currentElement.visible = true;
				currentElement.clickEventAttacher();
				this.configuration.onBookAppend({
										carousel: this,
										item: currentElement
										});
			
			}
			
			if(!currentElement.width){			
				if(currentElement.insideDivWidth){
					c = currentElement.insideDivWidth;
					e = currentElement.decidedBoxHeight;
					div.width(c);
					div.height(e);				
				}else{
					currentElement.insideDivWidth = c = div.width();
					currentElement.decidedBoxHeight = e = div.height();
				}
				currentElement.width = c;
				currentElement.height = e;				
			}
        },
        
		getMiddleItem: function(){
			var bookElement,index_highest=0;
			this.containerEnvironment.find(ILIT_BOOKSHELF_CONST.BOOK_CLASS).each(function(n){
				var index_current = parseInt($(this).css("zIndex"), 10);
				if(index_current > index_highest) {
					index_highest = index_current;
					bookElement = $(this);
				}
			});
                       	return bookElement;
		},
		
		getCenterBookIndex: function () {
			indexes = this.getTravelUpdateObject(this.distanceToMove , true);
            return Math.floor((indexes.ea + this.numOfElementsAtHalfCircle + 1) % this.assignedBooks.length);
        },
        
		
		
		sendToMiddle: function (bookNumber) {			

            var distance, totalGap3D = null;
            if (this.nonstopOccurrence) {
                var totalGap3D = this.assignedBooks.length * this.inBetweenGap3d,

                    distance = this.halfOfNaturalWidth - this.distanceToMove - bookNumber * this.inBetweenGap3d;
                distance < -(totalGap3D / 2) ? distance += totalGap3D : distance > (totalGap3D / 2) && (distance -= totalGap3D);
                this.driveBookShelf(this.distanceToMove + distance);
            }

			
        },
		
        getBoxElementAtIndex: function (a) {
            return this.assignedBooks[a].boxElement
        },
		
        getTravelUpdateObject: function (a, b) {
			
            var c = this.inBetweenGap3d,
                e;
            if (b) return a %= this.assignedBooks.length * c, 0 > a && (a += this.assignedBooks.length * c), e = -Math.floor(a / c) - 1, 0 > e && (e += this.assignedBooks.length), c = e + (Math.floor(this.tempWidth / c) + 2) - e, {
                ea: e,
                count: c,
                x: a
            };
            e = -Math.floor(a / c) - 1;
            0 > e && (e = 0);
            c = e + Math.floor(this.tempWidth / c) + 2;
            c > this.assignedBooks.length - 1 && (c = this.assignedBooks.length - 1);
            return {
                ea: e,
                count: c - e,
                x: a
            }
        },
        decideToImpound: function (a, b) {

            var c;
            c = this.getTravelUpdateObject(a, this.nonstopOccurrence);
            var e = c.ea,
                d = c.count,
                g, f = this.movingBoxElements;
            this.movingBoxElements = [];
            var m, l;
            a = c.x;
            m = this.nonstopOccurrence ? -this.inBetweenGap3d + a % this.inBetweenGap3d : e * this.inBetweenGap3d + a;
            var currentSpecialScale = 0.9;
			ilitBookShelfRounderManager.ableToRun3D && this.configuration.renderer3d && this.integrateHTML5Style(this.containerEnvironment, "transform", "scaleX(" + currentSpecialScale + ") scaleY(" + currentSpecialScale + ") ");
			
            for (c = 0; c <= d; c++) e %= this.assignedBooks.length, g = this.assignedBooks[e], e++, l = m, m += this.inBetweenGap3d, l < 0 - this.inBetweenGap3d || l > this.tempWidth + this.inBetweenGap3d || (this.dimensionConfigureForElement(g), this[b](g, l, this), this.movingBoxElements.push(g), g.removalIndex = this.removalIndex);
            this.impoundBookElement(f)
        },

       
        integrateHTML5Style: function (boxElement, transformCSSSuffix, cssVal) {
            var browserMixCSSObject = {};
            browserMixCSSObject["-webkit-" + transformCSSSuffix] = cssVal;
            browserMixCSSObject["-moz-" + transformCSSSuffix] = cssVal;
            browserMixCSSObject["-o-" + transformCSSSuffix] = cssVal;
            browserMixCSSObject["-ms-" + transformCSSSuffix] = cssVal;
            boxElement.css(browserMixCSSObject);
        },
        
        manageVerticalLocation: function (currentElement) {
            var currentHeight, currentScale = this.scale;
            ilitBookShelfRounderManager.ableToRun3D && this.configuration.renderer3d && (currentScale = 1);
            currentHeight = currentElement.height;
            currentScale = (currentHeight * currentScale - currentHeight) / 2;
            return "bottom" == this.itemAlignment ? -currentHeight - currentScale : "top" == this.itemAlignment ? currentScale : -currentHeight / 2;
        },
        getNaturalWidth: function () {
            return this.tempWidth
        },
        getScale: function () {
            return this.scale
        },
        
        makeRounderFrame3D: function (a, b, c) {
            var d = a.boxElement,
                f = easeInOutSine(b, c.widthOfContainer, c.tempWidth);
            b = a.thsILITBookShelfRounder.halfOfNaturalWidth - b;
            b = b / c.tempWidth * 100;
            var g = Math.abs(b),
                h = 5 * -g,
                k = c.manageVerticalLocation(a),
                f = f - a.width / 2;
            d.css({
                zIndex: Math.floor(500 - 10 * g),
                width: a.width,
                height: a.height
            });

            c.integrateHTML5Style(d, "transform", "translateY(" + k + "px) translateZ(" + h + "px) translateX(" + f + "px) rotateY( " + 0.95 * 0 + "deg) rotateX(0deg)")
            //c.integrateHTML5Style(d, "transform", "translateY(" + k + "px) translateZ(" + h + "px) translateX(" + f + "px) rotateY( " + 0.75 * -b + "deg) rotateX(" + -(g / 3) + "deg)")
        },
        


        updateScreen: function () {
            var currentElement;
            this.widthOfContainer = this.containerEnvironment.width();
            this.enginePacket.height();
            for (var b = 0; b < this.assignedBooks.length; b++) {
                currentElement = this.assignedBooks[b];
                currentElement.visible = false;
                currentElement.boxElement.css({
                    "-webkit-transform": "",
                    "-moz-transform": "",
                    "-ms-transform": "",
                    left: "",
                    top: "",
                    opacity: 1
                });
                currentElement.width = 0;
                currentElement.boxElement.detach();
            }
        },


        stopBookShelf: function () {
            this.movementController && this.configuration.autoChangeDirection && (clearInterval(this.movementController), this.movementController = 0)
        }
        
    };

    /*
	ilitBookShelfRounderManager.prototype: 
	appending functions to ilitBookShelfRounderManager: END
	*/
	
    /*Creating basic interface of ilitBookShelfRounderManager: START */
    var instance;
    instance = ilitBookShelfRounderManager.prototype;
    instance.getMiddleItem = instance.getMiddleItem;
    instance = boxElementPropertyArranger.prototype;

    /*Creating basic interface of ilitBookShelfRounderManager: END */


    window.ILITBookShelfRounder = ilitBookShelfRounderManager;
    window.ILITBookShelfRounderItem = boxElementPropertyArranger;



    /*ILITBookShelfRounder main window blur handler:START*/
    bookSelfJquery(window).bind("blur", function () {
        ilitBookShelfRounderManager.hasFocus = false;
    });
    /*ILITBookShelfRounder main window blur handler:END*/



    /*ILITBookShelfRounder main focus handler:START*/
    bookSelfJquery(window).bind("focus", function () {
        ilitBookShelfRounderManager.hasFocus = true;
    });
    /*ILITBookShelfRounder main focus handler END*/



    /*ILITBookShelfRounder plugin starter:START*/
    bookSelfJquery.fn.ILITBookShelfRounder = function (config) {

        return this.each(function () {
            bookSelfJquery(this).data("ILITBookShelfRounder", new ilitBookShelfRounderManager(bookSelfJquery(this), config))
        })
    }
    /*ILITBookShelfRounder plugin starter:END*/


})(jQuery);