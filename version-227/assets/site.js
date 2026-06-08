(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('.nav-toggle');
    var nav = qs('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dot');
    if (!slides.length || !dots.length) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-slide') || 0));
        start();
      });
    });
    start();
  }

  function setupListingFilter() {
    var keyword = qs('#page-filter');
    var year = qs('#year-filter');
    var genre = qs('#genre-filter');
    var cards = qsa('#movie-list .movie-card');
    if (!cards.length) {
      return;
    }
    function apply() {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var g = genre ? genre.value : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardGenre = card.getAttribute('data-genre') || '';
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (y && cardYear !== y) {
          ok = false;
        }
        if (g && cardGenre !== g) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
      });
    }
    [keyword, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card compact-card">' +
      '<a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">' +
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span>' +
      '<span class="poster-badge">' + escapeHtml(item.type) + '</span>' +
      '</a>' +
      '<div class="card-content">' +
      '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
      '<p class="card-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.genre) + '</p>' +
      '<p class="card-desc">' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="mini-tags">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupSearchPage() {
    var results = qs('#search-results');
    var status = qs('#search-status');
    var input = qs('#search-input');
    if (!results || !status || !input || !window.HKG_MOVIES_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    input.value = q;
    function render(query) {
      var key = query.trim().toLowerCase();
      if (!key) {
        results.innerHTML = '';
        status.textContent = '请输入关键词开始搜索。';
        return;
      }
      var matched = window.HKG_MOVIES_INDEX.filter(function (item) {
        return item.searchText.toLowerCase().indexOf(key) !== -1;
      }).slice(0, 120);
      if (!matched.length) {
        results.innerHTML = '';
        status.textContent = '没有找到匹配影片，请尝试其他关键词。';
        return;
      }
      status.textContent = '搜索结果';
      results.innerHTML = matched.map(cardTemplate).join('');
    }
    render(q);
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  function setupPlayer() {
    var video = qs('#movie-player');
    var cover = qs('.player-cover');
    if (!video) {
      return;
    }
    var url = video.getAttribute('data-play-url');
    var ready = false;
    var hls = null;
    function attach() {
      if (ready || !url) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        ready = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        ready = true;
        return;
      }
      video.src = url;
      ready = true;
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
      if (!ready || video.paused) {
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
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupListingFilter();
    setupSearchPage();
    setupPlayer();
  });
})();
