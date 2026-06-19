(function () {
    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initSearchForms() {
        var forms = document.querySelectorAll("[data-search-form]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var url = form.getAttribute("action") || "./search.html";
                window.location.href = query ? url + "?q=" + encodeURIComponent(query) : url;
            });
        });
    }

    function filterList(input, forcedValue) {
        var targetSelector = input.getAttribute("data-target");
        var list = targetSelector ? document.querySelector(targetSelector) : null;
        if (!list) {
            return;
        }
        var term = normalize(forcedValue !== undefined ? forcedValue : input.value);
        var cards = list.querySelectorAll(".movie-card, .rank-row");
        var visible = 0;
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search-text") || card.textContent);
            var matched = !term || text.indexOf(term) !== -1;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });
        var empty = document.querySelector("[data-empty-for='" + list.id + "']");
        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    function initLiveSearch() {
        var inputs = document.querySelectorAll("[data-live-search]");
        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                filterList(input);
            });
        });
        var searchInput = document.getElementById("site-search-input");
        if (searchInput) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (query) {
                searchInput.value = query;
                filterList(searchInput);
            }
        }
    }

    function initFilterButtons() {
        var scopes = document.querySelectorAll("[data-filter-scope]");
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-live-search]");
            var buttons = scope.querySelectorAll("[data-filter-button]");
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    buttons.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    var value = button.getAttribute("data-filter-value") || "";
                    if (input) {
                        input.value = value;
                        filterList(input, value);
                    }
                });
            });
        });
    }

    function initHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, current) {
            dot.addEventListener("click", function () {
                show(current);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initSearchForms();
        initLiveSearch();
        initFilterButtons();
        initHeroCarousel();
    });
})();
