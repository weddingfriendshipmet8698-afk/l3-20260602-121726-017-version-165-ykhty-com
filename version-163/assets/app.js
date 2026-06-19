(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showHero(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showHero(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showHero(current + 1);
            }, 5200);
        }
    }

    var filterRoots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));

    filterRoots.forEach(function (root) {
        var input = root.querySelector('[data-search-input]');
        var year = root.querySelector('[data-filter-year]');
        var type = root.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && input) {
            input.value = query;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var selectedYear = normalize(year ? year.value : '');
            var selectedType = normalize(type ? type.value : '');

            cards.forEach(function (card) {
                var title = normalize(card.getAttribute('data-title'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardType = normalize(card.getAttribute('data-type'));
                var region = normalize(card.getAttribute('data-region'));
                var genre = normalize(card.getAttribute('data-genre'));
                var text = normalize(card.textContent);
                var keywordMatch = !keyword || title.indexOf(keyword) > -1 || region.indexOf(keyword) > -1 || genre.indexOf(keyword) > -1 || text.indexOf(keyword) > -1;
                var yearMatch = !selectedYear || cardYear === selectedYear;
                var typeMatch = !selectedType || cardType === selectedType;

                card.classList.toggle('is-hidden', !(keywordMatch && yearMatch && typeMatch));
            });
        }

        [input, year, type].forEach(function (field) {
            if (field) {
                field.addEventListener('input', applyFilter);
                field.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    });

    var player = document.querySelector('[data-player]');

    if (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var source = player.getAttribute('data-play-url');
        var hlsReady = false;

        function beginPlay() {
            if (!video || !source) {
                return;
            }

            player.classList.add('is-playing');

            if (!hlsReady) {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().catch(function () {});
                    }, { once: true });
                } else {
                    video.src = source;
                    video.play().catch(function () {});
                }

                hlsReady = true;
            } else {
                video.play().catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', beginPlay);
        }

        player.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }
            beginPlay();
        });
    }
})();
