jQuery.fn.ILITFlatBookShelfRounder = function (settings) {
	
    var containerObj = this;
    var allowMove = false;
    var ANIM_POSITION = [];
	var ANIM_MIDDLE_POSITION = [];
	var CARD_CAPACITY_LOWER_MARGIN=3;
    var allowAnim = false;
    var config = {
        gap2D: 20,
        bookWidth: 160,
        animInterval: 550,
		floatBookContainer:'<div id="floatBookContainer"></div>',
        prohibitedEvents: "dragstart selectstart contextmenu MSHoldVisual",
        carouselWrapper: containerObj,
		bookElements:null,
        enginePos: {
            x: 0,
            y: 0
        },
		onAnimComplete:function(){},
		onBookClicked:function(){}
		
    };
	
	var publicBunch = {
		sendToMiddle : function(n){ sendToMiddle(n);}
	
	}

    function ping(msg) {
        $('#rox').length == 0 && ($('body').append('<p id="rox"><ol>loading...</ol></p>'));
        $('#rox').append("<p>"+msg+"</p>");
    }
	

    function clubConfig() {
        config = $.extend({}, config, settings);
    }

    /*ANIMATION STRATEGY CHOOSER:START*/
    function setAnimationChooser() {
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
    }
    /*ANIMATION STRATEGY CHOOSER:END*/

    function integrateHTML5Style(boxElement, transformCSSSuffix, cssVal) {
        var browserMixCSSObject = {};
        browserMixCSSObject["-webkit-" + transformCSSSuffix] = cssVal;
        browserMixCSSObject["-moz-" + transformCSSSuffix] = cssVal;
        browserMixCSSObject["-o-" + transformCSSSuffix] = cssVal;
        browserMixCSSObject["-ms-" + transformCSSSuffix] = cssVal;
        boxElement.css(browserMixCSSObject);
    }
	
	function sendToMiddle(n){            
            var targetData=null;
            allowMove = false;
            config.floatBookContainer.animate({left:(parseInt(ANIM_MIDDLE_POSITION[n])) + 'px'},800,function(){
            config.onAnimComplete(config.bookElements.eq(n).data('additionalInfo'));
            allowMove = false;
            $('[centralItem="1"]').removeAttr('centralItem');
            config.bookElements.eq(n).attr('centralItem','1');;
            });
	}
	
	function optimizeForLesserNumberOfCards(){
		
		var currentlyCreatedBook,allowCopyOfData=true,toadd,bookCount=0,totalNumberOfCard = containerObj.find('.bookElement').length;
		
		if(totalNumberOfCard<CARD_CAPACITY_LOWER_MARGIN){
			toadd = CARD_CAPACITY_LOWER_MARGIN-totalNumberOfCard;
			
			for(var i=0;i<toadd;i++){
			 currentlyCreatedBook = containerObj.find('.bookElement').eq(bookCount).clone(allowCopyOfData).addClass('notVisible').appendTo(containerObj);
			 currentlyCreatedBook.attr('pseudosource',bookCount);
			 
			 bookCount++;
			 if(bookCount==totalNumberOfCard){
			 bookCount=0;
			 }
			}
		}
	}

    function initEmbelishments() {
        var xval = 0,
            gap = config.gap2D,
            wx = config.bookWidth;
        optimizeForLesserNumberOfCards();
		containerObj.addClass('flatRounderPosition');
		containerObj.find('h4.preloader').remove();
		containerObj.prepend(config.floatBookContainer);
		containerObj.data('ILITFlatBookShelfRounder',publicBunch);
		
		config.floatBookContainer = $('#floatBookContainer:first');
		config.bookElements = containerObj.find('.bookElement');
		config.floatBookContainer.parent().css('overflow','hidden');
		config.floatBookContainer.parent().css('height','auto');
		
		        
        containerObj.find('.bookElement').each(function (n) {
			xval = (gap + wx) * n;
			ANIM_POSITION.push(xval);
            var targetSRC = $(this).children('img:first').attr('targetsrc');
			$(this).css('cursor','pointer');
            $(this).attr('data-key',n);
            $(this).children('img:first').css('opacity', 0);
            $(this).children('img:first').attr('src', targetSRC);

            $(this).children('img:first').bind('load', function () {
                var parentWidth = $(this).parent().width();
                var thisWidth = $(this).width();

                if (thisWidth > parentWidth) {
                    var imageXval = (thisWidth - parentWidth) / 2;
                    integrateHTML5Style($(this), 'transform', 'translate(-' + imageXval + 'px,0px)');
                }
                $(this).animate({
                    opacity: 1
                }, 560);
            })

            $(this).css('visibility', 'visible');
			$(this).appendTo(config.floatBookContainer);
			
			$(this).click(function(){
			sendToMiddle(n);
			if(typeof $(this).attr('centralitem')!='undefined'){
				config.onBookClicked($(this).data('additionalInfo'))
			}
			})

        });
		
		
		
		var capcacity = Math.round(parseInt(containerObj.css('width')) / (wx + gap));
                var mid = Math.ceil(capcacity / 2);
		
		config.enginePos.centerX = ANIM_POSITION[mid - 1];
		
		
		var i=0;
		_.each(ANIM_POSITION,function(n){
		ANIM_MIDDLE_POSITION.push(config.enginePos.centerX - (i*(wx + gap)))
		i++;
		})
		
		
		/*POSITION TESTING BLOCK:START*/
			if(false){
			 var HTML_TEST_STR='';
			 HTML_TEST_STR = HTML_TEST_STR+'<style>';
			 HTML_TEST_STR = HTML_TEST_STR+'#TEST_POS{ opacity:0.8; z-index:0; background:#fc0000; width:'+config.bookWidth+'px; height:290px; position:absolute; left:360px; top:0px;}';
			 HTML_TEST_STR = HTML_TEST_STR+'</style>';
			 HTML_TEST_STR = HTML_TEST_STR+"<div id='TEST_POS'><div>";
			 containerObj.append(HTML_TEST_STR);
			 }
		/*POSITION TESTING BLOCK:END*/
		
    }

    function checkProximity() {
		var centralIndex,currentLeftVal = parseInt(config.floatBookContainer.css('left'));
		var diff=[];
		_.each(ANIM_MIDDLE_POSITION,function(n){
			diff.push(Math.abs(n-currentLeftVal));
		});
		centralIndex = diff.indexOf(_.min(diff));
		
		config.floatBookContainer.animate({left:ANIM_MIDDLE_POSITION[centralIndex]},100);
    }

    function eventBinder() {

        containerObj.bind(config.prohibitedEvents, function (e) {
            e.preventDefault();
            return false;
        })

        $('body').bind('mouseup', function (e){
            allowMove = false;
			checkProximity();
        });

        /*MOUSE EVENT HANDLER:START*/
        containerObj.bind('mouseup mousemove mousedown', function (e) {
            switch (e.type) {

            case "mousedown":
                allowMove = true;
                config.enginePos.currentX = e.pageX;
                break;

            case "mouseup":
                allowMove = false;
                checkProximity();
                //config.enginePos.currentX = e.pageX;
                break;

            case "mousemove":
                if (allowMove) {
                    generalMoveHandler(e);
                }
                break;
            }
        });
        /*MOUSE EVENT HANDLER:END*/

        /*TOUCH EVENT HANDLER:START*/
        containerObj.bind('touchstart touchend', function (event) {

            var originalEvent = event.originalEvent,
                touch = originalEvent.touches[0];

            switch (event.type) {
            case "touchstart":
                allowMove = true;
                config.enginePos.currentX = touch.pageX;
                break;

            case "touchend":
                allowMove = false;
                checkProximity();                
                break;

            }
        })
		
		
		
		containerObj.bind('touchmove',function(event){
			generalMoveHandler(event.originalEvent.touches[0]);
			return false;			
		});
        /*TOUCH EVENT HANDLER:END*/

    }

    function generalMoveHandler(moveEvent) {
		
		//ping(config.floatBookContainer.parent().offset().left);
		//config.floatBookContainer.css('left',moveEvent.pageX-config.floatBookContainer.parent().offset().left);
		 var distanceToMove, targetDistance, initX, offsetX;
        targetDistance = moveEvent.pageX - config.enginePos.currentX;
        config.enginePos.currentX = moveEvent.pageX;
		var tempDistance = parseInt(config.floatBookContainer.css('left'))+targetDistance
		config.floatBookContainer.css('left',tempDistance);
		/*
        containerObj.find('.bookElement').each(function () {
            var tempDistance = getXvalue($(this)) + targetDistance;
            $(this).data('targetPoint', tempDistance);
			
            moveBooks($(this));
        });
		ping(moveEvent.pageX); */
    }


    function moveBooks(bookElement) {
        //containerObj.find('.bookElement').each(function (n) {
            targetPoint = bookElement.data('targetPoint');
            integrateHTML5Style(bookElement, 'transform', 'translate(' + targetPoint + 'px,0px)');
        //});
    }

    function getXvalue(div) {

        var xval, matrix =
                (getComputedStyle(div.get(0), null)["transform"]) ||
                (getComputedStyle(div.get(0), null)["-webkit-transform"]) ||
                (getComputedStyle(div.get(0), null)["-moz-transform"]) ||
                (getComputedStyle(div.get(0), null)["-o-transform"]) ||
                (getComputedStyle(div.get(0), null)["-ms-transform"]);

        matrix = eval('new Array' + matrix.split('matrix')[1]);

        return matrix[matrix.length - 2];
    }

    function init() {
        config.enginePos = {
            x: containerObj.offset().left,
            y: containerObj.offset().top,
            currentX: 0
        };
        clubConfig();
        initEmbelishments();
        eventBinder();
        //setAnimationChooser();
    }

    init();

};