const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMenu() {
    const button = qs('.menu-toggle');
    const nav = qs('.mobile-nav');
    if (!button || !nav) {
        return;
    }
    button.addEventListener('click', () => {
        nav.classList.toggle('open');
    });
}

function setupHero() {
    const root = qs('.hero-carousel');
    if (!root) {
        return;
    }
    const slides = qsa('.hero-slide', root);
    const thumbs = qsa('.hero-thumb', root);
    const prev = qs('.hero-prev', root);
    const next = qs('.hero-next', root);
    let index = 0;
    let timer = null;

    const show = (target) => {
        index = (target + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        thumbs.forEach((thumb, i) => thumb.classList.toggle('active', i === index));
    };

    const restart = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => show(index + 1), 5200);
    };

    thumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
            show(Number(thumb.dataset.goSlide || 0));
            restart();
        });
    });

    prev && prev.addEventListener('click', () => {
        show(index - 1);
        restart();
    });

    next && next.addEventListener('click', () => {
        show(index + 1);
        restart();
    });

    restart();
}

function setupFilters() {
    const input = qs('.filter-input');
    const sort = qs('.sort-select');
    const grid = qs('.movie-grid');
    if (!input || !grid) {
        return;
    }
    const cards = qsa('.movie-card', grid);
    const original = cards.slice();

    const apply = () => {
        const term = input.value.trim().toLowerCase();
        cards.forEach((card) => {
            const haystack = [
                card.dataset.title,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.region
            ].join(' ').toLowerCase();
            card.hidden = term.length > 0 && !haystack.includes(term);
        });

        const visible = cards.filter((card) => !card.hidden);
        const mode = sort ? sort.value : 'default';
        if (mode === 'year-desc') {
            visible.sort((a, b) => Number(b.dataset.year) - Number(a.dataset.year));
        } else if (mode === 'year-asc') {
            visible.sort((a, b) => Number(a.dataset.year) - Number(b.dataset.year));
        } else if (mode === 'heat-desc') {
            visible.sort((a, b) => Number(b.dataset.heat) - Number(a.dataset.heat));
        } else {
            visible.sort((a, b) => original.indexOf(a) - original.indexOf(b));
        }
        visible.forEach((card) => grid.appendChild(card));
    };

    input.addEventListener('input', apply);
    sort && sort.addEventListener('change', apply);
}

async function loadHls(video, src) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return true;
    }
    try {
        const module = await import('./hls-vendor.js');
        const Hls = module.H;
        if (Hls && Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hls = hls;
            return true;
        }
    } catch (error) {
        video.src = src;
        return true;
    }
    video.src = src;
    return true;
}

function setupPlayers() {
    qsa('[data-player]').forEach((box) => {
        const video = qs('video', box);
        const overlay = qs('.play-overlay', box);
        const src = box.dataset.stream;
        let loaded = false;

        const start = async () => {
            if (!video || !src) {
                return;
            }
            if (!loaded) {
                loaded = await loadHls(video, src);
            }
            box.classList.add('ready');
            try {
                await video.play();
            } catch (error) {
                video.controls = true;
            }
        };

        overlay && overlay.addEventListener('click', start);
        video && video.addEventListener('click', () => {
            if (!loaded) {
                start();
            }
        });
    });
}

function resultCard(movie) {
    const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `
        <article class="movie-card" data-title="${escapeHtml(movie.title)}" data-year="${movie.year}" data-genre="${escapeHtml(movie.genre)}" data-region="${escapeHtml(movie.region)}" data-heat="${movie.heat}">
            <a class="poster" href="./${movie.file}" aria-label="${escapeHtml(movie.title)}">
                <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
                <span class="play-dot">▶</span>
            </a>
            <div class="card-body">
                <div class="card-meta">
                    <span>${movie.year}</span>
                    <span>${escapeHtml(movie.type)}</span>
                    <span>${escapeHtml(movie.region)}</span>
                </div>
                <h3><a href="./${movie.file}">${escapeHtml(movie.title)}</a></h3>
                <p>${escapeHtml(movie.one_line)}</p>
                <div class="mini-tags">${tags}</div>
            </div>
        </article>`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

async function setupGlobalSearch() {
    const container = qs('[data-search-results]');
    const input = qs('.global-search-input');
    if (!container || !input) {
        return;
    }
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';
    input.value = initial;

    let movies = Array.isArray(window.MOVIE_INDEX) ? window.MOVIE_INDEX : [];
    if (!movies.length) {
        try {
            const response = await fetch('./assets/movie-index.json');
            movies = await response.json();
        } catch (error) {
            container.innerHTML = '<div class="empty-results">搜索索引暂时无法加载。</div>';
            return;
        }
    }

    const render = () => {
        const term = input.value.trim().toLowerCase();
        if (!term) {
            container.innerHTML = movies.slice(0, 36).map(resultCard).join('');
            return;
        }
        const results = movies.filter((movie) => {
            return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags.join(' '), movie.one_line]
                .join(' ')
                .toLowerCase()
                .includes(term);
        }).slice(0, 120);
        container.innerHTML = results.length ? results.map(resultCard).join('') : '<div class="empty-results">没有找到匹配影片。</div>';
    };

    input.addEventListener('input', render);
    render();
}

setupMenu();
setupHero();
setupFilters();
setupPlayers();
setupGlobalSearch();
