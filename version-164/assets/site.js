(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var mobile = document.querySelector(".mobile-nav");
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobile.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector(".js-hero");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle("is-active", pos === index);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle("is-active", pos === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, pos) {
      dot.addEventListener("click", function () {
        show(pos);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initHeroSearch() {
    var form = document.querySelector(".js-hero-search");
    if (!form) {
      return;
    }
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      if (!value) {
        event.preventDefault();
        window.location.href = "./search.html";
      }
    });
  }

  function initFilters() {
    var input = document.querySelector(".js-search-input");
    var year = document.querySelector(".js-year-filter");
    var type = document.querySelector(".js-type-filter");
    var category = document.querySelector(".js-category-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".js-movie-card"));
    if (!cards.length || (!input && !year && !type && !category)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && input) {
      input.value = query;
    }

    function matches(card) {
      var q = normalize(input && input.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      var c = normalize(category && category.value);
      var text = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.category
      ].join(" "));
      if (q && text.indexOf(q) === -1) {
        return false;
      }
      if (y && normalize(card.dataset.year).indexOf(y) === -1) {
        return false;
      }
      if (t && normalize(card.dataset.type).indexOf(t) === -1) {
        return false;
      }
      if (c && normalize(card.dataset.category) !== c) {
        return false;
      }
      return true;
    }

    function apply() {
      cards.forEach(function (card) {
        card.classList.toggle("is-hidden", !matches(card));
      });
    }

    [input, year, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  window.initMoviePlayer = function (videoId, overlayId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var button = document.getElementById(buttonId);
    if (!video || !overlay || !sourceUrl) {
      return;
    }
    var started = false;
    var hls = null;

    function showVideo() {
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    function attachAndPlay() {
      if (started) {
        showVideo();
        playVideo();
        return;
      }
      started = true;
      showVideo();

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function () {
          if (!video.src) {
            video.src = sourceUrl;
          }
        });
        return;
      }

      video.src = sourceUrl;
      playVideo();
    }

    overlay.addEventListener("click", attachAndPlay);
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        attachAndPlay();
      });
    }
    video.addEventListener("click", function () {
      if (!started) {
        attachAndPlay();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initNavigation();
    initHero();
    initHeroSearch();
    initFilters();
  });
})();
