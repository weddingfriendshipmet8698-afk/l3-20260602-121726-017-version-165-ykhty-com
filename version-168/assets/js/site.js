(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".menu-toggle");

  if (header && toggle) {
    toggle.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;
  var timer = null;

  function setHero(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }

    timer = window.setInterval(function () {
      setHero(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var target = Number(dot.getAttribute("data-hero-target") || "0");
      window.clearInterval(timer);
      setHero(target);
      startHero();
    });
  });

  startHero();

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll(".page-filter"));
  var targets = Array.prototype.slice.call(document.querySelectorAll(".filter-targets .movie-card"));

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilter(value) {
    var query = normalize(value);

    targets.forEach(function (card) {
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" "));

      card.classList.toggle("is-filter-hidden", query && text.indexOf(query) === -1);
    });
  }

  filterInputs.forEach(function (input) {
    input.addEventListener("input", function () {
      applyFilter(input.value);
    });
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get("q") || "";
  var searchPageInput = document.querySelector(".search-page-input");
  var globalFilter = document.querySelector(".global-search-filter");

  if (searchPageInput && q) {
    searchPageInput.value = q;
  }

  if (globalFilter && q) {
    globalFilter.value = q;
    applyFilter(q);
  }

  var sortSelect = document.querySelector(".year-sort");
  var grid = document.querySelector(".filter-targets.movie-grid");

  if (sortSelect && grid) {
    sortSelect.addEventListener("change", function () {
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var direction = sortSelect.value === "asc" ? 1 : -1;

      cards.sort(function (a, b) {
        var ay = Number(a.getAttribute("data-year") || "0");
        var by = Number(b.getAttribute("data-year") || "0");
        return (ay - by) * direction;
      });

      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    });
  }
})();
