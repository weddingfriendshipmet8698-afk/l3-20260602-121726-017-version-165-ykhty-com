(() => {
    const menuButton = document.querySelector('[data-mobile-menu-button]');
    const menu = document.querySelector('[data-mobile-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', () => {
            menu.classList.toggle('is-open');
        });
    }

    const bindSearch = () => {
        document.querySelectorAll('[data-search-input]').forEach((input) => {
            const targetSelector = input.getAttribute('data-search-target');
            const target = targetSelector ? document.querySelector(targetSelector) : null;
            if (!target) {
                return;
            }

            const cards = Array.from(target.querySelectorAll('.movie-card'));
            input.addEventListener('input', () => {
                const keyword = input.value.trim().toLowerCase();
                cards.forEach((card) => {
                    const haystack = [
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.category,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(' ').toLowerCase();

                    if (!keyword || haystack.includes(keyword)) {
                        card.classList.remove('is-filter-hidden');
                    } else {
                        card.classList.add('is-filter-hidden');
                    }
                });
            });
        });
    };

    const bindHero = () => {
        const hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let active = 0;

        const show = (index) => {
            active = (index + slides.length) % slides.length;
            slides.forEach((slide, idx) => slide.classList.toggle('is-active', idx === active));
            dots.forEach((dot, idx) => dot.classList.toggle('is-active', idx === active));
        };

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                show(Number(dot.dataset.heroDot || '0'));
            });
        });

        if (slides.length > 1) {
            window.setInterval(() => show(active + 1), 5200);
        }
    };

    const loadScript = (src) => new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            existing.addEventListener('load', resolve, { once: true });
            existing.addEventListener('error', reject, { once: true });
            if (window.Hls) {
                resolve();
            }
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });

    const setupVideo = async (video, url) => {
        if (!video || !url) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            await video.play().catch(() => {});
            return;
        }

        await loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest');
        if (window.Hls && window.Hls.isSupported()) {
            if (video._hlsInstance) {
                video._hlsInstance.destroy();
            }
            const hls = new window.Hls({ enableWorker: true });
            video._hlsInstance = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {});
            });
        } else {
            video.src = url;
            await video.play().catch(() => {});
        }
    };

    const bindPlayer = () => {
        const video = document.getElementById('movie-video');
        const playButton = document.querySelector('[data-play-video]');
        const sourceButtons = Array.from(document.querySelectorAll('[data-video-source]'));

        if (!video) {
            return;
        }

        const playCurrent = async () => {
            const url = video.dataset.videoUrl;
            if (playButton) {
                playButton.classList.add('is-hidden');
            }
            await setupVideo(video, url);
        };

        if (playButton) {
            playButton.addEventListener('click', playCurrent);
        }

        sourceButtons.forEach((button) => {
            button.addEventListener('click', async () => {
                sourceButtons.forEach((item) => item.classList.remove('is-active'));
                button.classList.add('is-active');
                video.dataset.videoUrl = button.dataset.videoSource || video.dataset.videoUrl;
                if (playButton) {
                    playButton.classList.add('is-hidden');
                }
                await setupVideo(video, video.dataset.videoUrl);
            });
        });
    };

    bindSearch();
    bindHero();
    bindPlayer();
})();
