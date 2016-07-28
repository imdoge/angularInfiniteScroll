angular.module('ngInfiniteScroll', [])
    .directive('infiniteScroll', ['$window', '$timeout', function ($window, $timeout) {
        return {
            link: function (scope, element, attrs) {
                var windowEl = angular.element($window),
                    bindToWindow = scope.$eval(attrs.window),
                    elm = bindToWindow ? windowEl : element,
                    container = bindToWindow ? document.body : element[0],
                    checkBounds = throttle(checkInfiniteBounds, +attrs.wait || 300);
                
                elm.on('scroll', checkBounds);
                
                scope.$on('$destroy', function() {
                    elm.off('scroll', checkBounds);
                });

                if (attrs.immediateCheck != null && scope.$eval(attrs.immediateCheck)) {
                    $timeout(function () { checkBounds(); });
                }
                
                function throttle(fn, wait) {
                    var last,
                        deferTimer;
                    return function () {
                        var context = this;
    
                        var now = +new Date(),
                            args = arguments;
                        if (last && now < last + wait) {
                            clearTimeout(deferTimer);
                            deferTimer = setTimeout(function () {
                                last = now;
                                fn.apply(context, args);
                            }, wait);
                        } else {
                            last = now;
                            fn.apply(context, args);
                        }
                    };
                }
    
                function checkInfiniteBounds() {
                    var disabled = scope.$eval(attrs.infiniteScrollDisabled);
                    if (disabled) { return; }
                    
                    var maxScroll = getMaxScroll(container.scrollHeight);
                    var clientHeight = bindToWindow ? window.innerHeight || document.documentElement.clientHeight : container.clientHeight;
                    
                    if (container.scrollTop + clientHeight >= maxScroll) {
                        scope.$apply(attrs.infiniteScroll || '');
                    }
                }
    
                function getMaxScroll(maximum) {
                    var distance = (attrs.distance || '2.5%').trim();
                    var isPercent = distance.indexOf('%') > -1;
                    return isPercent
                            ? maximum * (1 - parseFloat(distance) / 100)
                            : maximum - parseFloat(distance);
                }
            }
        }
    }]);
