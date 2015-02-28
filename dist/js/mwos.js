/*
 * @author		: loki
 * @version		: 1.0
 * @date		: 2015-02-15
 * @repository 	: https://github.com/loki951753/mobile-website-onepage-scroll
 */

;if (typeof Zepto === 'undefined') { throw new Error('mwos.js\'s script requires Zepto') }

(function($, window, document, undefined){
	'use strict';

	var startPos,           // 开始触摸点(X/Y坐标)
        endPos,             // 结束触摸点(X/Y坐标)
        offset,				// 移动距离

		options,

		curPageId = 0, 		// page 当前页id，初始化为0
        pageCount,          // page 数量
        
		$container,         // page 外部 container
        $pageArr,           // page 列表

        curPageIsEnd = false,//当前页的切换动画是否完毕
		nextPageIsEnd = false,//下一页的切换动画是否完毕
        touchDown = false,  // 手指已按下 (取消触摸移动时 transition 过渡)
        movePrevent = false;// 阻止滑动 (动画过程中阻止第二次滑动)



	$.fn.mwos = function(opts) {
		options = $.extend(true, {}, $.fn.mwos.defaults, opts);

		return this.each(function() {
			$container = $(this);
			$pageArr = $container.find('.page');

			init();
		})
	}

	// 默认配置选项
	$.fn.mwos.defaults = {
		pageTransition		: '',	// 页面切换动画
		navigation			: true,	// 导航指示
		arrow				: true, // 箭头
		music				: {
								src : '',
								autoplay : true,
								loop : true
							  },	// 背景音乐
		pageAnimation		: ''
	};

	function init() {
		pageCount   = $pageArr.length;           	// 获取 page 数量

		// 添加 data-id
		for (var i=0; i<pageCount; i++) {          
            $($pageArr[i]).attr('data-id', i+1);
        }
	};

	//触摸事件处理
	function onStart(e) {
		if (movePrevent === true) {
			event.preventDefault();
            return false;
		};

		touchDown = true;

		startPos = e.pageY;
		console.log('startPos = ' + startPos);
		//TODO:
		//这里可以添加一些中间态的代码，如滑页的拖拽效果
	}

	function onMove(e) {
		event.preventDefault();
		if (movePrevent === true || touchDown === false) {
			return false;
		}
	}

	function onEnd(e) {
		if (movePrevent === true) {
			return false;
		}

		touchDown = false;
		endPos = e.pageY;

		console.log('endPos = ' + endPos);

		offset = endPos - startPos;
		if (Math.abs(offset) < 50) {
			return false;
		}

		//最后一页向下滑和第一页向上滑都不作处理
		if ((offset < 0) && (curPageId === $pageArr.length-1)
			|| (offset > 0) && (curPageId === 0)) {
			return false;
		}

		scrollPage();
	}

	function scrollPage() {
		if (movePrevent === true) {
			return false;
		}

		var nextPageId = offset > 0 ? (curPageId-1) : (curPageId + 1);
		var direction = offset > 0 ? 'backward' : 'forward';
		var $curPage = $pageArr.eq(curPageId);
		var $nextPage = $pageArr.eq(nextPageId);
		var outClass = '', inClass = '';

		$nextPage.addClass('current');

		switch(options.pageAnimation.toLowerCase()) {
			case 'sides' :
				outClass = 'sidesOut';
				inClass = 'sidesIn';
				break;
			case 'slide' :
				outClass = 'slideOut';
				inClass = 'slideIn';
				break;
			case 'scaledowncenter' :
				outClass = 'scaleDownCenter';
				inClass = 'scaleUpCenter delay400';
				break;	
			default:
				break;
		}

		$curPage.addClass(direction).addClass(outClass);
		$nextPage.addClass(direction).addClass(inClass);

		if (options.navigation) {
            scrollNavigation(nextPageId);
        }

		//切换动画需要0.5秒到0.8秒左右，这里用定时器做临时解决方案
		setTimeout(function(){
			$curPage.removeClass(direction + ' ' + outClass + ' current');
			$nextPage.removeClass(direction + ' ' + inClass);
			curPageIsEnd = false;
			nextPageIsEnd = false;

			movePrevent = false;
			offset > 0 ? curPageId-- : curPageId++;//更新当前页id
		}, 700);

		//存在线程同步问题		
		// $curPage.addClass(direction).addClass(outClass).on('webkitAnimationEnd', function(){
		// 	$curPage.off('webkitAnimationEnd');
		// 	
		// 	curPageIsEnd = true;
		// 	if (nextPageIsEnd) {
		// 		onEndAnimation($curPage, $nextPage);
		// 	}
		// });

		// $nextPage.addClass(direction).addClass(inClass).on('webkitAnimationEnd', function(){
		// 	$nextPage.off('webkitAnimationEnd');
		// 	$nextPage.removeClass(direction);
		// 	nextPageIsEnd = true;
		// 	if (curPageIsEnd) {
		// 		onEndAnimation($curPage, $nextPage);
		// 	}
		// });
	}

	// function onEndAnimation($outPage, $inPage) {
	// 	curPageIsEnd = false;
	// 	nextPageIsEnd = false;

	// 	movePrevent = false;

	// 	$outPage.removeClass('current');
	// 	offset > 0 ? curPageId-- : curPageId++;//更新当前页id
	// }

	function scrollNavigation(targetId) {
		$($('ul.navigation li').removeClass('current').get(targetId)).addClass('current');
	}

	// 事件代理绑定
    $(document)
        .on('touchstart', '.page', function(e) {
            onStart(e.changedTouches[0]);
        })
        .on('touchmove', '.page', function(e) {
            onMove(e.changedTouches[0]);
        })
        .on('touchend', '.page', function(e) {
            onEnd(e.changedTouches[0]);
        });

    //DOM加载完成
    $(function(){
    	//按需加载箭头
        if (options.arrow) {
            $pageArr.append('<span class="mwos-arrow"></span>');
            $($pageArr[pageCount-1]).find('.mwos-arrow').remove();
        }

        //按需加载导航点
        if (options.navigation) {
        	var lists = '<ul class="navigation">';
        	for (var i=1; i<=pageCount; i++) {
        		lists += (i === 1 ? '<li class="current"></li>' : '<li></li>');
        	}
        	lists += '</ul>';
        	$('.container').append(lists);
        }
    });

    // 页面资源加载完成
    $(window).on("load", function() {
    	$('.loader').css('display', 'none');

    	//页面加载完后再加载音乐
    	if (options.music) {
            //生成代码片段
            var codeStr = '<div id="player"><div id="music-img"></div><audio></audio></div>';
            $('.container').before(codeStr);

            var myAudio = $('audio').get(0);
            if (options.music.src) {
                myAudio.src = options.music.src;
            } else {
                console.log("music source expected.");
            }

            if (options.music.autoplay) {
                myAudio.autoplay = options.music.autoplay;
            } else {
                console.log("audio init with not-autoplay");
            }

            if (options.music.loop) {
                myAudio.loop = options.music.loop;
            } else {
                console.log("audio init with not-loop");
            }

            myAudio.addEventListener("play", function(){
                $('#player').addClass('isPlaying');
            });

            myAudio.addEventListener("pause", function(){
                $('#player').removeClass('isPlaying');
            });

            $('#player').on('touchend', function(e){
                e.preventDefault();
                
                var isPaused = myAudio.paused;

                if (isPaused) {
                    $(this).addClass('isPlaying');//duplicated line 607 to fix bug in some mobile phone, replace it if you have better code
                    myAudio.play();
                } else {
                    $(this).removeClass('isPlaying');
                    myAudio.pause();
                }
            })
        }
    });
})(Zepto, window, document);