(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var siteNav = document.querySelector('[data-site-nav]');

    if (menuButton && siteNav) {
        menuButton.addEventListener('click', function () {
            siteNav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === index);
            });
        }

        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener('click', function () {
                show(itemIndex);
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
            });
        }

        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5600);
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

        scopes.forEach(function (scope) {
            var queryInput = scope.querySelector('[data-filter-query]');
            var regionSelect = scope.querySelector('[data-filter-region]');
            var yearSelect = scope.querySelector('[data-filter-year]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

            function valueOf(node) {
                return node ? node.value.trim().toLowerCase() : '';
            }

            function apply() {
                var query = valueOf(queryInput);
                var region = valueOf(regionSelect);
                var year = valueOf(yearSelect);

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre')
                    ].join(' ').toLowerCase();
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchRegion = !region || (card.getAttribute('data-region') || '').toLowerCase() === region;
                    var matchYear = !year || (card.getAttribute('data-year') || '') === year;
                    card.hidden = !(matchQuery && matchRegion && matchYear);
                });
            }

            [queryInput, regionSelect, yearSelect].forEach(function (node) {
                if (node) {
                    node.addEventListener('input', apply);
                    node.addEventListener('change', apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var urlQuery = params.get('q');
            if (queryInput && urlQuery) {
                queryInput.value = urlQuery;
                apply();
            }
        });
    }

    function initVideo() {
        var video = document.querySelector('video[data-src]');
        if (!video) {
            return;
        }

        var src = video.getAttribute('data-src');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            return;
        }

        if (window.Hls) {
            var hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHero();
        initFilters();
        initVideo();
    });
})();
