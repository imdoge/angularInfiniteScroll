angular.module('ngInfiniteScroll', [])
    .controller('InfiniteScrollCtrl', [
        '$scope',
        '$attrs',
        '$element',
        function($scope, $attrs, $element) {
            var self = this,
                container = $element[0];
            
            this.isLoading = false;
            this.checkBounds = throttle(checkInfiniteBounds, +$attrs.wait || 300);

            $scope.$on('infiniteScrollComplete', function() {
                self.isLoading = false;
            });

            $scope.$on('$destroy', function() {
                $element.off('scroll', self.checkBounds);
            });
            
            function onInfinite() {
                self.isLoading = true;
                $scope.$apply($attrs.infiniteScroll || '');
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
                var disabled = $scope.$eval($attrs.infiniteScrollDisabled);
                if (self.isLoading || disabled) { return; }
                var maxScroll = getMaxScroll();

                if (maxScroll !== -1 && container.scrollTop >= maxScroll - container.clientHeight) {
                    onInfinite();
                }
            }

            function getMaxScroll() {
                var computedStyle = window.getComputedStyle(container) || {};

                return container.scrollHeight &&
                        (computedStyle.overflowY === 'scroll' ||
                        computedStyle.overflowY === 'auto' ||
                        container.style['overflow-y'] === 'scroll' )
                        ? calculateMaxValue(container.scrollHeight)
                        : -1;
            }

            function calculateMaxValue(maximum) {
                var distance = ($attrs.distance || '2.5%').trim();
                var isPercent = distance.indexOf('%') > -1;
                return isPercent
                        ? maximum * (1 - parseFloat(distance) / 100)
                        : maximum - parseFloat(distance);
            }
        }])
    .directive('infiniteScroll', ['$timeout', function ($timeout) {
        return {
            require: 'infiniteScroll',
            controller: 'InfiniteScrollCtrl',
            link: function (scope, element, attrs, ctrl) {
                element.on('scroll', ctrl.checkBounds);

                if (attrs.immediateCheck != null) {
                    var immediateCheck = scope.$eval(attrs.immediateCheck);
                }
                immediateCheck && $timeout(function () { ctrl.checkBounds(); });
            }
        }
    }]);
