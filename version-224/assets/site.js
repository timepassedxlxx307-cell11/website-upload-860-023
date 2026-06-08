(function () {
    const ready = function (callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    };

    const normalize = function (value) {
        return String(value || "").toLowerCase().trim();
    };

    const openNavigation = function () {
        const toggle = document.querySelector(".nav-toggle");
        const nav = document.querySelector(".site-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
        });
    };

    const startHero = function () {
        const hero = document.querySelector(".hero-carousel");
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        let index = 0;
        let timer = null;
        const show = function (next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        };
        const play = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        };
        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                play();
            });
        });
        hero.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        hero.addEventListener("mouseleave", play);
        play();
    };

    const startFiltering = function () {
        const panels = Array.from(document.querySelectorAll(".filter-panel"));
        panels.forEach(function (panel) {
            const scopeSelector = panel.getAttribute("data-scope") || "body";
            const scope = document.querySelector(scopeSelector) || document;
            const cards = Array.from(scope.querySelectorAll(".movie-card"));
            const inputs = Array.from(panel.querySelectorAll("input, select"));
            const apply = function () {
                const queryInput = panel.querySelector("[data-filter='query']");
                const query = normalize(queryInput ? queryInput.value : "");
                const active = {};
                inputs.forEach(function (input) {
                    const key = input.getAttribute("data-filter");
                    if (key && key !== "query" && input.value) {
                        active[key] = normalize(input.value);
                    }
                });
                cards.forEach(function (card) {
                    const haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.textContent
                    ].join(" "));
                    let visible = !query || haystack.indexOf(query) !== -1;
                    Object.keys(active).forEach(function (key) {
                        const value = normalize(card.getAttribute("data-" + key));
                        if (active[key] && value !== active[key]) {
                            visible = false;
                        }
                    });
                    card.classList.toggle("is-filter-hidden", !visible);
                });
            };
            inputs.forEach(function (input) {
                input.addEventListener("input", apply);
                input.addEventListener("change", apply);
            });
        });
    };

    window.initVideoPlayer = function (source) {
        const video = document.querySelector(".player-video");
        const cover = document.querySelector(".player-cover");
        if (!video || !cover || !source) {
            return;
        }
        let attached = false;
        let hls = null;
        const attach = function () {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        };
        const play = function () {
            attach();
            cover.classList.add("is-hidden");
            video.controls = true;
            const request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {});
            }
        };
        cover.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };

    ready(function () {
        openNavigation();
        startHero();
        startFiltering();
    });
})();
