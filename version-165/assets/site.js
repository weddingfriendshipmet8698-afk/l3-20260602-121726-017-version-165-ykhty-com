(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileLinks = document.querySelector('.mobile-links');
  if (menuButton && mobileLinks) {
    menuButton.addEventListener('click', function () {
      mobileLinks.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dots button'));
  let current = 0;
  function showSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  const searchInput = document.querySelector('[data-search-input]');
  const regionSelect = document.querySelector('[data-region-filter]');
  const categorySelect = document.querySelector('[data-category-filter]');
  const yearSelect = document.querySelector('[data-year-filter]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  function runFilter() {
    const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const region = regionSelect ? regionSelect.value : '';
    const category = categorySelect ? categorySelect.value : '';
    const year = yearSelect ? yearSelect.value : '';
    let visible = 0;
    cards.forEach(function (card) {
      const text = (card.dataset.text || '').toLowerCase();
      const title = (card.dataset.title || '').toLowerCase();
      const okTerm = !term || text.indexOf(term) > -1 || title.indexOf(term) > -1;
      const okRegion = !region || card.dataset.region === region;
      const okCategory = !category || card.dataset.category === category;
      const okYear = !year || String(card.dataset.year) === year;
      const ok = okTerm && okRegion && okCategory && okYear;
      card.style.display = ok ? '' : 'none';
      if (ok) visible += 1;
    });
    document.body.classList.toggle('no-results', cards.length > 0 && visible === 0);
  }
  [searchInput, regionSelect, categorySelect, yearSelect].forEach(function (el) {
    if (el) {
      el.addEventListener('input', runFilter);
      el.addEventListener('change', runFilter);
    }
  });
})();
