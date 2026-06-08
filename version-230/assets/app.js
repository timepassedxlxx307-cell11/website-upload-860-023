(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function getRoot() {
        return document.body.getAttribute('data-root') || './';
    }

    function setupMenu() {
        var button = document.querySelector('.mobile-toggle');
        var menu = document.querySelector('.mobile-nav');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var carousel = document.querySelector('.hero-carousel');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
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

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyListingFilter() {
        var grid = document.querySelector('.movie-listing');
        if (!grid) {
            return;
        }
        var input = document.querySelector('.filter-search');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var activeChip = document.querySelector('.chip.is-active');
        var query = normalize(input && input.value);
        var key = activeChip ? activeChip.getAttribute('data-filter-key') : '';
        var value = normalize(activeChip ? activeChip.getAttribute('data-filter-value') : '');
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' '));
            var matchesText = !query || haystack.indexOf(query) !== -1;
            var matchesChip = !key || normalize(card.getAttribute('data-' + key)).indexOf(value) !== -1;
            var show = matchesText && matchesChip;
            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        });

        var empty = document.querySelector('.empty-state');
        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    function setupFilters() {
        var grid = document.querySelector('.movie-listing');
        if (!grid) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var input = document.querySelector('.filter-search');
        if (input && params.get('q')) {
            input.value = params.get('q');
        }
        if (input) {
            input.addEventListener('input', applyListingFilter);
        }
        var form = document.querySelector('.page-search');
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                applyListingFilter();
            });
        }
        Array.prototype.slice.call(document.querySelectorAll('.chip')).forEach(function (chip) {
            chip.addEventListener('click', function () {
                Array.prototype.slice.call(document.querySelectorAll('.chip')).forEach(function (item) {
                    item.classList.remove('is-active');
                });
                chip.classList.add('is-active');
                applyListingFilter();
            });
        });
        applyListingFilter();
    }

    function setupSearchForms() {
        Array.prototype.slice.call(document.querySelectorAll('.nav-search, .mobile-search')).forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var listingInput = document.querySelector('.filter-search');
                if (listingInput) {
                    listingInput.value = query;
                    applyListingFilter();
                    listingInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (query) {
                    window.location.href = getRoot() + 'ranking.html?q=' + encodeURIComponent(query);
                } else {
                    window.location.href = getRoot() + 'ranking.html';
                }
            });
        });
    }

    window.initPlayer = function (src) {
        var video = document.querySelector('.watch-video');
        var cover = document.querySelector('.watch-cover');
        var hls = null;
        var attached = false;
        if (!video || !src) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function play() {
            attach();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchForms();
    });
})();
