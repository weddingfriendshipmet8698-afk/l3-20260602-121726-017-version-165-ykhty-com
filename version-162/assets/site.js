(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilters();
    setupPlayers();
    setupGlobalSearch();
  });

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length === 0) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
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
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupLocalFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var root = scope.parentElement || document;
      var input = scope.querySelector('[data-filter-input]');
      var region = scope.querySelector('[data-filter-region]');
      var type = scope.querySelector('[data-filter-type]');
      var year = scope.querySelector('[data-filter-year]');
      var grid = root.querySelector('[data-filter-grid]');
      var count = root.querySelector('[data-filter-count]');
      if (!grid) {
        return;
      }
      var items = Array.prototype.slice.call(grid.children);

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : '';
        var selectedRegion = region ? region.value : '';
        var selectedType = type ? type.value : '';
        var selectedYear = year ? Number(year.value || 0) : 0;
        var visible = 0;
        items.forEach(function (item) {
          var haystack = [
            item.getAttribute('data-title') || '',
            item.getAttribute('data-region') || '',
            item.getAttribute('data-type') || '',
            item.getAttribute('data-genre') || '',
            item.getAttribute('data-year') || ''
          ].join(' ').toLowerCase();
          var itemYear = Number(item.getAttribute('data-year') || 0);
          var matches = true;
          if (q && haystack.indexOf(q) === -1) {
            matches = false;
          }
          if (selectedRegion && item.getAttribute('data-region') !== selectedRegion) {
            matches = false;
          }
          if (selectedType && item.getAttribute('data-type') !== selectedType) {
            matches = false;
          }
          if (selectedYear && itemYear < selectedYear) {
            matches = false;
          }
          item.style.display = matches ? '' : 'none';
          if (matches) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = '显示 ' + visible + ' 部影片';
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (card) {
      var video = card.querySelector('video');
      var button = card.querySelector('[data-play-button]');
      var src = card.getAttribute('data-src');
      if (!video || !button || !src) {
        return;
      }
      button.addEventListener('click', function () {
        initializePlayer(card, video, src);
      });
    });
  }

  function initializePlayer(card, video, src) {
    if (card.getAttribute('data-ready') === '1') {
      video.play();
      card.classList.add('is-playing');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
      card.hlsInstance = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', function () {
        video.play();
      }, { once: true });
    } else {
      video.src = src;
      video.play().catch(function () {
        card.classList.remove('is-playing');
      });
    }

    card.setAttribute('data-ready', '1');
    card.classList.add('is-playing');
  }

  function setupGlobalSearch() {
    var input = document.querySelector('[data-global-search]');
    var button = document.querySelector('[data-global-search-button]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');
    if (!input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function render(query) {
      var q = query.trim().toLowerCase();
      if (!q) {
        results.innerHTML = '';
        if (count) {
          count.textContent = '输入关键词开始搜索';
        }
        return;
      }
      var matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        return movie.searchText.indexOf(q) !== -1;
      }).slice(0, 240);
      results.innerHTML = matches.map(renderSearchCard).join('');
      if (count) {
        count.textContent = '找到 ' + matches.length + ' 部影片' + (matches.length >= 240 ? '（仅显示前 240 条）' : '');
      }
    }

    function doSearch() {
      render(input.value);
      var next = new URL(window.location.href);
      if (input.value.trim()) {
        next.searchParams.set('q', input.value.trim());
      } else {
        next.searchParams.delete('q');
      }
      window.history.replaceState(null, '', next.toString());
    }

    input.addEventListener('input', doSearch);
    if (button) {
      button.addEventListener('click', doSearch);
    }
    document.querySelectorAll('[data-quick]').forEach(function (item) {
      item.addEventListener('click', function () {
        input.value = item.getAttribute('data-quick') || '';
        doSearch();
      });
    });
    render(initialQuery);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearchCard(movie) {
    return '' +
      '<article class="movie-card">' +
        '<a class="poster-wrap" href="' + escapeHtml(movie.url) + '">' +
          '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" class="poster-img" loading="lazy" onerror="this.classList.add(\'is-missing\'); this.removeAttribute(\'src\');">' +
          '<span class="poster-badge">' + escapeHtml(movie.category) + '</span>' +
          '<span class="poster-play">▶</span>' +
        '</a>' +
        '<div class="movie-body">' +
          '<a class="card-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>' +
          '<p class="card-desc">' + escapeHtml(movie.description) + '</p>' +
          '<div class="card-meta">' +
            '<span>' + escapeHtml(movie.year) + '</span>' +
            '<span>' + escapeHtml(movie.region) + '</span>' +
            '<span>' + escapeHtml(movie.type) + '</span>' +
          '</div>' +
        '</div>' +
      '</article>';
  }
})();
