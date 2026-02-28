/*
 * Swipe 2.0
 *
 * Brad Birdsall
 * Copyright 2013, MIT License
 *
 */

function Swipe(container, options) {

    var freezeIndex = null;
	var fromIndex = null;
	var visitedArray = [];
	var paginationBed = null;
	var currentPaginationButton=null;
	var swiperSlideVisible = "swiper-slide-visible";
	var paginationClass={button:"swiper-pagination-switch",selected:"swiper-active-switch"};
	/*==== To avoid multiple onInit call ====*/
	var bInitialized = false;
	/*== End To avoid multiple onInit call ==*/
	/*==== Reference to Current Object ====*/
	var oSelf = this;
	/*== End Reference to Current Object ==*/
	window.SWIPE_INTENTION_TIMESTAMP = new Date().getTime();
	window.SWIPE_INTENTION_TIMESTAMP_RESET_FLAG=true;
	
    var noop = function () {}; // simple no operation function
    var offloadFn = function (fn) {
        setTimeout(fn || noop, 0)
    }; // offload a functions execution
	
	
    // check browser capabilities
    var browser = {
        addEventListener: !! window.addEventListener,
        touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
        transitions: (function (temp) {
            var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
            for (var i in props)
                if (temp.style[props[i]] !== undefined) return true;
            return false;
        })(document.createElement('swipe'))
    };

    // quit if no root element
    if (!container) return;
    var element = container.children[0];
    var slides, slideBox, slideBoxDist, slidePos, width, length;
    options = options || {};
    var index = parseInt(options.startSlide, 10) || 0;
	var movementDirection=1;
    var speed = options.speed || 300;
    options.continuous = options.continuous !== undefined ? options.continuous : true;

    function setup() {
		
        // cache slides
        slides = element.children;
        length = slides.length;

        // set continuous to false if only one slide
        if (slides.length < 2) options.continuous = false;

        //special case if two slides
        if (browser.transitions && options.continuous && slides.length < 3) {
            element.appendChild(slides[0].cloneNode(true));
            element.appendChild(element.children[1].cloneNode(true));
            slides = element.children;
        }

        // create an array to store current positions of each slide
        slidePos = new Array(slides.length);
		createPagination(slides);
        // determine width of each slide
        width = container.getBoundingClientRect().width || container.offsetWidth;

        element.style.width = (slides.length * width) + 'px';

        // stack elements
        var pos = slides.length;
        //var bgleftPos = (pos-1) * width;
        while (pos--) {

            var slide = slides[pos];

            slide.style.width = width + 'px';
            //slide.style.backgroundPosition = '-'+ bgleftPos +'px 0px';
            slide.setAttribute('data-index', pos);

            if (browser.transitions) {
                slide.style.left = (pos * -width) + 'px';
                move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
            }
            //bgleftPos = bgleftPos - width;
        }

        // reposition elements before and after index
        if (options.continuous && browser.transitions) {
            move(circle(index - 1), -width, 0);
            move(circle(index + 1), width, 0);
        }

        if (!browser.transitions) element.style.left = (index * -width) + 'px';

        container.style.visibility = 'visible';
		
		if (
			bInitialized === false &&
			'onInit' in options &&
			typeof options['onInit'] != 'undefined' &&
			typeof options['onInit'] == 'function'
		) {
			setTimeout(function () {
				var box = slides[0].children[0];
				var box_style = box && box.style;
				speed = 900;
				box_style.webkitTransitionDuration =
				box_style.MozTransitionDuration =
				box_style.msTransitionDuration =
				box_style.OTransitionDuration =
				box_style.transitionDuration = speed + 'ms';
				//dist = -width + 150; 
				dist = -width;
				box_style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
				box_style.msTransform =
				box_style.MozTransform =
				box_style.OTransform = 'translateX(' + dist + 'px)';
			}, 2000);
			
			fWaitUntil(
				function () {
					for (var iSldIdx = 0; iSldIdx < slides.length; iSldIdx++) {
						if (slides[iSldIdx].className.indexOf(swiperSlideVisible) > -1) {
							break;
						}
					}
					return (
						(iSldIdx < slides.length) &&
						(bInitialized === false)
					);
				},
				function () {
					options['onInit'].call(options);
					bInitialized = true;
				}
			);
		}
    }
	
	function resize(){
		
		// determine width of each slide
        width = container.getBoundingClientRect().width || container.offsetWidth;

		//console.log(width);
        element.style.width = (length * width) + 'px';
		
		// stack elements
        var pos = length;
		
		while (pos--) {
			try {
				var slide = slides[pos];

				slide.style.width = width + 'px';
				//slide.style.backgroundPosition = '-'+ bgleftPos +'px 0px';
				//slide.setAttribute('data-index', pos);

				if (browser.transitions) {
					slide.style.left = (pos * -width) + 'px';
					move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
				}
				//bgleftPos = bgleftPos - width;
			}
			catch (oException) {
			}
        }
		
		// reposition elements before and after index
        if (options.continuous && browser.transitions) {
            move(circle(index - 1), -width, 0);
            move(circle(index + 1), width, 0);
        }

        if (!browser.transitions) element.style.left = (index * -width) + 'px';
		
	}
	/*endingSlideLock:START
	Function is created to resist unnecessary and void swipes for first and last slides. */
	function endingSlideLock(movementDirection){
		var allow=false,currentIndex = index;
		if (currentIndex == slides.length-1 && movementDirection<0){
			allow = true;			
		}
		if (currentIndex == 0 && movementDirection>0){
		   allow = true; 
		}
		
		return allow;
	}
	/*endingSlideLock:END*/
	
	/*isItTooQuickToSwipe:START
	isItTooQuickToSwipe Is created to restrict consecutive touch-start events within very tiny time difference. As a result user cannot move directly to the next to next slide by two quick swipes.*/
	
	function isItTooQuickToSwipe () {
		var standardTimeDifference,
			signal = false,
			timeDiff,
			currentTime = (new Date()).getTime(),
			graceTime = 100;
			
		standardTimeDifference = options.speed + graceTime;		
		timeDiff = (currentTime - window.SWIPE_INTENTION_TIMESTAMP);
		
		if (standardTimeDifference < timeDiff) {
			signal = true;
			window.SWIPE_INTENTION_TIMESTAMP_RESET_FLAG = true;
			window.SWIPE_INTENTION_TIMESTAMP = currentTime;
		}
		else {
			signal = false
			window.SWIPE_INTENTION_TIMESTAMP_RESET_FLAG = false;
		}
		return signal;
	}
	/*isItTooQuickToSwipe:END*/
	
	function highLightPaginationButton(paginationButton){
		if ( currentPaginationButton != null ) {
			currentPaginationButton.className = String(currentPaginationButton.className).split(paginationClass.selected).join(' ');
		}
		paginationButton.className = paginationButton.className+" "+paginationClass.selected;
		currentPaginationButton = paginationButton;
	}
	
	function paginationButtonAction(paginationButton){
		var signal = options.onPaginationButtonClick(paginationButton.getAttribute('data-key'),index,slides);
		if (signal) {
			var targetPos = paginationButton.getAttribute('data-key');
			if (freezeIndex != null && freezeIndex < targetPos) {
				//console.log("Not permitted: " + freezeIndex + " : " + targetPos);
			}
			else {
				highLightPaginationButton(paginationButton);
				options.onPaginationButtonClick(paginationButton.getAttribute('data-key'), index, slides);
				slide(targetPos, options.speed);
				currentPaginationButton = paginationButton;
			} 	
		}
	}
	
	function createPagination(slides){
		var span;
		window.PAGINATION_ASSIGNMENT_SPAN = [];
		if(typeof options.pagination != 'undefined'){
			paginationBed = document.getElementsByClassName(options.pagination.split('.')[1]);
			if(paginationBed.length>0){
			paginationBed = paginationBed[0];
			
			paginationBed.innerHTML="";
			for(var i=0;i<slides.length;i++){
				span = document.createElement('span');
				span.setAttribute('data-key',i);
				span.setAttribute('class',paginationClass.button);
				span.addEventListener('click',function(){
					paginationButtonAction(this);					
				});
				paginationBed.appendChild(span);	
				window.PAGINATION_ASSIGNMENT_SPAN.push(span);		
			}
			highLightPaginationButton(window.PAGINATION_ASSIGNMENT_SPAN[0]);
				
			}
		}
	}
	
	function anyOneOfSpecificClass(HTMLCollection,classNameTosearch){
		var found=false,i=0;
		
		while(i<HTMLCollection.length){
		if(typeof HTMLCollection[i].className !='undefined'){
			if(HTMLCollection[i].className.indexOf(classNameTosearch)!=-1){
			found = true;
			}
		}		
		i++;
		}
		
		return found;	
	}
	
	function getParents(el) {
		var parents = [];
		var p = el.parentNode;
		
		while (p !== null) {
			var o = p;
			parents.push(o);
			p = o.parentNode;
		}
		return parents; // returns an Array []
	}
	
	function modifyClass(mode,element,modClassName){
		var currentClassName = String(element.className);
        var classes=null;
		switch(mode){
			
			case "add":
			if(currentClassName.indexOf(modClassName)==-1){
                if(currentClassName.length==0){
                    currentClassName = modClassName;
                }else{
			currentClassName = currentClassName+" "+modClassName;
                }
			element.className = currentClassName;
			}
			break;
			
			case "remove":
			if(currentClassName.indexOf(modClassName)!=-1){
            classes = currentClassName.split(modClassName); 
                
                if(classes.length==2){
                   currentClassName = classes.join('');
                   currentClassName = currentClassName.split(' ').join('');
                }else{
                    currentClassName = classes.join(' ');
                }
			
			element.className = currentClassName;
			}
			break;		
		}	
	}

	function prev() {
		var modClassName = swiperSlideVisible;
		modifyClass("remove", slides[index], modClassName);

		if (options.continuous) {
			slide(index - 1);
		}
		else {
			if (index) {
				slide(index - 1);
				modifyClass("add", slides[index], modClassName);
			}
		}

	}

    function next() {		
		var modClassName = swiperSlideVisible;
		modifyClass("remove", slides[index], modClassName);

		if (options.continuous) {
			slide(index + 1);
		}
		else {
			if (index < slides.length - 1) {
				slide(index + 1);
				modifyClass("add", slides[index], modClassName);
			}
		}
	}

    function circle(index) {

        // a simple positive modulo using slides.length
        return (slides.length + (index % slides.length)) % slides.length;

    }

    function slide(to, slideSpeed, fCallBack) {
		if (
			typeof fCallBack == 'undefined' ||
			typeof fCallBack != 'function'
		) {
			fCallBack = function (iSlideIndex) {};
		}
        // do nothing if already on requested slide
        if (index == to) {
			fCallBack.call(oSelf, index);
			return;
		}
		
		// fromIndex = (index != fromIndex? index: fromIndex);
        if (browser.transitions) {

            var direction = Math.abs(index - to) / (index - to); // 1: backward, -1: forward
            // get the actual position of the slide
            if (options.continuous) {
                var natural_direction = direction;
                direction = -slidePos[circle(to)] / width;

                // if going forward but to < index, use to = slides.length + to
                // if going backward but to > index, use to = -slides.length + to
                if (direction !== natural_direction) to = -direction * slides.length + to;

            }

            var diff = Math.abs(index - to) - 1;

            // move all the slides between index and to in the right direction
            while (diff--) move_new(circle((to > index ? to : index) - diff - 1), width * direction, 0);

            to = circle(to);

            move_new(index, width * direction, slideSpeed || speed);
            move_new(to, 0, slideSpeed || speed);

            if (options.continuous) move_new(circle(to - direction), -(width * direction), 0); // we need to get the next in place

        }
		else {
            to = circle(to);
            animate(index * -width, to * -width, slideSpeed || speed);
            //no fallback for a circular continuous if the browser does not accept transitions
        }
		
		fromIndex = (index != fromIndex? index: fromIndex);
        index = to;
		setTimeout(function(){
			fWaitUntil(
				function () {
					return (bInitialized === true);
				},
				function () {
					var movementDirection = index - fromIndex;
					options.onSlideChangeEnd(null, index, slides[index], movementDirection);
					fCallBack.call(oSelf, index);
				}
			);
		}, slideSpeed || speed);
        offloadFn(options.callback && options.callback(index, slides[index]));
    }

    function move(index, dist, speed) {
        translate(index, dist, speed);
        slidePos[index] = dist;
    }
	 function move_new(index, dist, speed) {
		translate_new(index, dist, speed);
		slidePos[index] = dist;
	 }

    function translate(index, dist, speed) {
		
        var slide = slides[index];
        //box.style.background="#000";
        var style = slide && slide.style;
        /*var box_style = box && box.style;*/
		
		slideBoxDist = dist;

        if (!style) return;

        style.webkitTransitionDuration =
            style.MozTransitionDuration =
            style.msTransitionDuration =
            style.OTransitionDuration =
            style.transitionDuration = speed + 'ms';

        style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
        style.msTransform =
            style.MozTransform =
            style.OTransform = 'translateX(' + dist + 'px)';
    }
	
	function translate_new(index, dist, speed) {
		
        var slide = slides[index];
        //box.style.background="#000";
        var style = slide && slide.style;
		slideBoxDist = dist;

        if (!style) return;

        style.webkitTransitionDuration =
            style.MozTransitionDuration =
            style.msTransitionDuration =
            style.OTransitionDuration =
            style.transitionDuration = speed + 'ms';

        style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
        style.msTransform =
            style.MozTransform =
            style.OTransform = 'translateX(' + dist + 'px)';
    }

    function isNextAllowed(delta) {
        var result;
        ((index == freezeIndex) && (delta.x < 0)) ? result = false : result = true;

        return result;
    }

    function animate(from, to, speed) {
		// if not an animation, just reposition
        if (!speed) {

            element.style.left = to + 'px';
            return;

        }

        var start = +new Date;

        var timer = setInterval(function () {

            var timeElap = +new Date - start;

            if (timeElap > speed) {

                element.style.left = to + 'px';

                if (delay) begin();
				options.onSlideChangeEnd && options.onSlideChangeEnd.call(event, index, slides[index],movementDirection);

                clearInterval(timer);
                return;

            }

            element.style.left = (((to - from) * (Math.floor((timeElap / speed) * 100) / 100)) + from) + 'px';

        }, 4);

    }

    // setup auto slideshow
    var delay = options.auto || 0;
    var interval;

    function begin() {

        interval = setTimeout(next, delay);

    }

    function stop() {

        delay = 0;
        clearTimeout(interval);

    }


    // setup initial vars
    var start = {};
    var delta = {};
    var isScrolling;

    // setup event capturing
    var events = {

        handleEvent: function (event) {

            switch (event.type) {

            case 'mousedown':
				if (typeof options.onSlideChangeStart == 'function') {
					options.onSlideChangeStart.call(oSelf, event, index, slides[index], index - (fromIndex? fromIndex: -1));
				}
                this.start(event);
                break;
            case 'mousemove':
				this.move(event);
                break;
            case 'mouseup':
                offloadFn(this.end(event));
                break;

            case 'touchstart':
                if (typeof options.onSlideChangeStart == 'function') {
					options.onSlideChangeStart.call(oSelf, event, index, slides[index], index - (fromIndex? fromIndex: -1));
				}
                this.start(event);
                break;
            case 'touchmove':
				
                this.move(event);
                break;
            case 'touchend':
                offloadFn(this.end(event));
                break;
            case 'webkitTransitionEnd':
            case 'msTransitionEnd':
            case 'oTransitionEnd':
            case 'otransitionend':
            case 'transitionend':
                offloadFn(this.onSlideChangeEnd(event));
                break;
            case 'resize':
                offloadFn(resize.call());
                break;
            }

            if (options.stopPropagation) event.stopPropagation();

        },
        start: function (event) {
			if(!isItTooQuickToSwipe()){ return false; }
            if(anyOneOfSpecificClass(getParents(event.target),options.noScrollClass)){ return false; }
            if (event.type == 'mousedown') {

                // measure start values
                start = {
                    x: event.pageX,
                    y: event.pageY,
                    time: +new Date
                };
				
				// used for testing first move event
                isScrolling = undefined;

                // reset delta and end measurements
                delta = {};
                element.style.cursor = '-webkit-grabbing';
                // attach touchmove and touchend listeners
                element.addEventListener('mousemove', this, false);
                element.addEventListener('mouseup', this, false);

            }
			else if (event.type == 'touchstart') {
                var touches = event.touches[0];

                // measure start values
                start = {

                    // get initial touch coords
                    x: touches.pageX,
                    y: touches.pageY,

                    // store time to determine touch duration
                    time: +new Date

                };

                // used for testing first move event
                isScrolling = undefined;

                // reset delta and end measurements
                delta = {};

                // attach touchmove and touchend listeners
                element.addEventListener('touchmove', this, false);
                element.addEventListener('touchend', this, false);
            }
        },
        move: function (event) {

            if (event.type == 'mousemove') {
                if (options.disableScroll) {
					event.preventDefault();
				}
				// var touches = event.touches[0];

                // measure change in x and y
                delta = {
                    x: event.pageX - start.x,
                    y: event.pageY - start.y
                }
            }
			else if (event.type == 'touchmove') {
                // ensure swiping with one touch and not pinching
                if (event.touches.length > 1 || event.scale && event.scale !== 1) return

                if (options.disableScroll) event.preventDefault();

                var touches = event.touches[0];

                // measure change in x and y
                delta = {
                    x: touches.pageX - start.x,
                    y: touches.pageY - start.y
                }
            }
			
			if (endingSlideLock(delta.x)) {
				return false;
			}
            if (isNextAllowed(delta)) {
                // determine if scrolling test has run - one time test
                if (typeof isScrolling == 'undefined') {
					isScrolling = !! (isScrolling || Math.abs(delta.x) < Math.abs(delta.y));
                }
                // if user is not trying to scroll vertically
                if (!isScrolling) {
                    // prevent native scrolling 
                    event.preventDefault();
                    // stop slideshow
                    stop();
                    // increase resistance if first or last slide
                    if (options.continuous) { // we don't add resistance at the end

                        translate_new(circle(index - 1), delta.x + slidePos[circle(index - 1)], 0);
                        translate_new(index, delta.x + slidePos[index], 0);
                        translate_new(circle(index + 1), delta.x + slidePos[circle(index + 1)], 0);

                    }
					else {
                        delta.x =
                            delta.x /
                            ((!index && delta.x > 0 // if first slide and sliding left
                                || index == slides.length - 1 // or if last slide and sliding right
                                && delta.x < 0 // and if sliding at all
                            ) ?
                            (Math.abs(delta.x) / width + 1) // determine resistance level
                            : 1); // no resistance if false

                        // translate 1:1
                        translate_new(index - 1, delta.x + slidePos[index - 1], 0);
                        translate_new(index, delta.x + slidePos[index], 0);
                        translate_new(index + 1, delta.x + slidePos[index + 1], 0);
                    }
                }
            }
        },
        end: function (event) {
			// fromIndex = (index != fromIndex? index: fromIndex);
            if (isNextAllowed(delta)) {
                // measure duration
                var duration = +new Date - start.time;

                // determine if slide attempt triggers next/prev slide
                var isValidSlide =
                    Number(duration) < 250 // if slide duration is less than 250ms
                && Math.abs(delta.x) > 20 // and if slide amt is greater than 20px
                || Math.abs(delta.x) > width / 2; // or if slide amt is greater than half the width

                // determine if slide attempt is past start and end
                var isPastBounds = !index && delta.x > 0 // if first slide and slide amt is greater than 0
                || index == slides.length - 1 && delta.x < 0; // or if last slide and slide amt is less than 0

                if (options.continuous) {
					isPastBounds = false;
				}
                // determine direction of swipe (true:right, false:left)
                var direction = delta.x < 0;
                // if not scrolling vertically
                if (!isScrolling) {
                    if (isValidSlide && !isPastBounds) {
                        $(slides[index]).removeClass(swiperSlideVisible);
                        if (direction) {
                            if (options.continuous) { // we need to get the next in this direction in place
                                move_new(circle(index - 1), -width, 0);
                                move_new(circle(index + 2), width, 0);
                            }
							else {
                                move_new(index - 1, -width, 0);
                            }
                            move_new(index, slidePos[index] - width, speed);
                            move_new(circle(index + 1), slidePos[circle(index + 1)] - width, speed);
							fromIndex = (index != fromIndex? index: fromIndex);
                            index = circle(index + 1);
                        }
						else {
                            if (options.continuous) { // we need to get the next in this direction in place
                                move_new(circle(index + 1), width, 0);
                                move_new(circle(index - 2), -width, 0);
                            }
							else {
                                move_new(index + 1, width, 0);
                            }
                            move_new(index, slidePos[index] + width, speed);
                            move_new(circle(index - 1), slidePos[circle(index - 1)] + width, speed);
							fromIndex = (index != fromIndex? index: fromIndex);
                            index = circle(index - 1);
                        }
                        $(slides[index]).addClass(swiperSlideVisible);
                        // slidePos[index].addClass(swiperSlideVisible);
						//modifyClass('add',slidePos[index],swiperSlideVisible)
                        options.callback && options.callback(index, slides[index]);

                    }
					else {
						if (options.continuous) {
                            move_new(circle(index - 1), -width, speed);
                            move_new(index, 0, speed);
                            move_new(circle(index + 1), width, speed);
                        }
						else {
                            move_new(index - 1, -width, speed);
                            move_new(index, 0, speed);
                            move_new(index + 1, width, speed);
                        }
                    }
                }
				
				if (paginationBed != null) {
					if(currentPaginationButton!=null){
					currentPaginationButton.className = String(currentPaginationButton.className).split(paginationClass.selected).join(' ');
					}
					var span = paginationBed.getElementsByTagName('SPAN')[index];
					span.className = paginationClass.button+" "+paginationClass.selected;
					currentPaginationButton = span;
				}
            }
            element.style.cursor = '-webkit-grab';

            // kill touchmove and touchend event listeners until touchstart called again
            element.removeEventListener('mousemove', events, false);
            element.removeEventListener('mouseup', events, false);
            element.removeEventListener('touchmove', events, false);
            element.removeEventListener('touchend', events, false);
			
			
        },
        onSlideChangeEnd: function (event) {
			if (visitedArray[index] != 'visited') {
				var slide = slides[index],
					box = slide.children[0],
					box_style = box && box.style;
        
				box_style.webkitTransitionDuration =
					box_style.MozTransitionDuration =
					box_style.msTransitionDuration =
					box_style.OTransitionDuration =
					box_style.transitionDuration = 900 + 'ms';
					
					dist = slideBoxDist - width;
					

				setTimeout(function () {
					box_style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
					box_style.msTransform =
						box_style.MozTransform =
						box_style.OTransform = 'translateX(' + dist + 'px)';
				}, 1000);
			}
			
			movementDirection = index - fromIndex;
			visitedArray[index]='visited';
            if (parseInt(event.target.getAttribute('data-index'), 10) == index) {
                if (delay) {
					begin();
				}
				options.onSlideChangeEnd(event, index, slides[index],movementDirection);
            }
        }
    }

    // trigger setup
    setup();

    // start auto slideshow if applicable
    if (delay) begin();


    // add event listeners
    if (browser.addEventListener) {

        element.addEventListener('mousedown', events, false);
        // set touchstart event on element
        if (browser.touch) element.addEventListener('touchstart', events, false);

        if (browser.transitions) {
            element.addEventListener('webkitTransitionEnd', events, false);
            element.addEventListener('msTransitionEnd', events, false);
            element.addEventListener('oTransitionEnd', events, false);
            element.addEventListener('otransitionend', events, false);
            element.addEventListener('transitionend', events, false);
        }
        // set resize event on window
        window.addEventListener('resize', events, false);
    }
	else {
        window.onresize = function () {
            resize();
        }; // to play nice with old IE
    }
	
	// expose the Swipe API
    return {
        setup: function () {
            setup();
        },
        slide: function (to, speed) {
            // cancel slideshow
            stop();
            slide(to, speed);
        },
        prev: function () {
            // cancel slideshow
            stop();
            prev();
        },
        next: function () {
            // cancel slideshow
            stop();
            next();
        },
		getVisitedArray: function(){
			return visitedArray;			
		},
        getPos: function () {
            // return current index position
            return index;
        },
		setPos: function (iSlideTo) {
			/*==== Existing Code ====*
			stop();
            slide(iSlideTo, options.speed);
			modifyClass('add',slides[index],swiperSlideVisible);
			/*== End Existing Code ==*/
			slide(iSlideTo, options.speed, function (iSlideIndex) {
				var oPagingButton = jQuery('.' + paginationClass.button).eq(iSlideIndex).get(0);
				freezeIndex = iSlideIndex;
				highLightPaginationButton(oPagingButton);
				modifyClass('add', slides[iSlideIndex], swiperSlideVisible);
			});
        },
		getSlideSpeed:	function () {
			return options.speed || speed;
		},
		getFreezeIndex:	function () {
			return freezeIndex;
		},
		getFromIndex:	function () {
			return fromIndex;
		},
		getCurrentIndex:	function () {
			return index;
		},
        getNumSlides: function () {
            // return total number of slides
            return length;
        },
		getAllSlides: function(){
			return slides;
		},
		freezeAtSlide: function (to) {
		    freezeIndex = to;
		},
        freezeNextSlides: function () {
            freezeIndex = index;
        },
		unFreezeNextSlides: function(){
			freezeIndex = null;
		},
        kill: function () {
            // cancel slideshow
            stop();
            // reset element
            element.style.width = 'auto';
            element.style.left = 0;
            // reset slides
            var pos = slides.length;
            while (pos--) {
                var slide = slides[pos];
                slide.style.width = '100%';
                slide.style.left = 0;

                if (browser.transitions) {
					translate(pos, 0, 0);
				}
            }
            // removed event listeners
            if (browser.addEventListener) {
				// remove current event listeners
                element.removeEventListener('mousedown', events, false);
                element.removeEventListener('touchstart', events, false);
                element.removeEventListener('webkitTransitionEnd', events, false);
                element.removeEventListener('msTransitionEnd', events, false);
                element.removeEventListener('oTransitionEnd', events, false);
                element.removeEventListener('otransitionend', events, false);
                element.removeEventListener('transitionend', events, false);
                window.removeEventListener('resize', events, false);
            }
			else {
                window.onresize = null;
            }

        }
    }
}

if (window.jQuery || window.Zepto) {
    (function ($) {
        $.fn.Swipe = function (params) {
            return this.each(function () {
                $(this).data('Swipe', new Swipe($(this)[0], params));
            });
        }
    })(window.jQuery || window.Zepto)
}

if (typeof window.fWaitUntil != 'function') {
	window.fWaitUntil = function (fCondition, fAction) {
		if (!fCondition()) {
			setTimeout(function () {
				fWaitUntil(fCondition, fAction);
			}, 100);
		}
		else {
			fAction();
		}
	}
}