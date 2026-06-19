(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".slider-dots button"));
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    if (!input && !select) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var year = select ? select.value : "";
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region")
        ].join(" ").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !year || cardYear === year;
        card.classList.toggle("hidden-by-filter", !(matchedKeyword && matchedYear));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    apply();
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
    script.onload = callback;
    script.onerror = callback;
    document.head.appendChild(script);
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-box"));
    if (!players.length) {
      return;
    }

    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".player-play");
      if (!video || !button) {
        return;
      }
      var src = video.getAttribute("data-video-src") || "";
      var hlsReady = false;

      function attach() {
        if (!src || hlsReady) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          hlsReady = true;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          hlsReady = true;
        } else {
          video.src = src;
          hlsReady = true;
        }
      }

      function play() {
        attach();
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
        box.classList.add("is-playing");
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
          box.classList.remove("is-playing");
        }
      });
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        box.classList.remove("is-playing");
      });
    });
  }

  ready(function () {
    initMenu();
    initHeroSlider();
    initFilters();
    loadHls(initPlayers);
  });
})();
