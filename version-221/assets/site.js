(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var toggle = $('[data-mobile-toggle]');
    var menu = $('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slides = $all('[data-hero-slide]');
    var thumbs = $all('[data-hero-thumb]');
    if (slides.length === 0) {
      return;
    }
    var current = 0;
    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      thumbs.forEach(function (thumb, idx) {
        thumb.classList.toggle('is-active', idx === current);
      });
    }
    thumbs.forEach(function (thumb, idx) {
      thumb.addEventListener('mouseenter', function () {
        activate(idx);
      });
      thumb.addEventListener('focus', function () {
        activate(idx);
      });
    });
    activate(0);
    window.setInterval(function () {
      activate(current + 1);
    }, 5200);
  }

  function initNavSearch() {
    $all('[data-nav-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = $('input', form);
        var keyword = input ? input.value.trim() : '';
        if (keyword) {
          window.location.href = 'search.html?q=' + encodeURIComponent(keyword);
        } else {
          window.location.href = 'search.html';
        }
      });
    });
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function initSearchPanels() {
    var panels = $all('[data-search-panel]');
    panels.forEach(function (panel) {
      var input = $('[data-search-input]', panel);
      var rootSelector = panel.getAttribute('data-search-root') || 'body';
      var root = document.querySelector(rootSelector) || document;
      var cards = $all('[data-search-text]', root);
      var count = $('[data-search-count]', panel);
      var empty = $('[data-empty-state]', root) || $('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search-text'));
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = visible + ' 部';
        }
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input && query) {
        input.value = query;
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      apply();
    });
  }

  function initPlayers() {
    $all('[data-player]').forEach(function (shell) {
      var video = $('video', shell);
      var source = shell.getAttribute('data-source') || '';
      var startButton = $('[data-player-start]', shell);
      var status = $('[data-player-status]', shell);
      var hlsInstance = null;
      var loaded = false;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function loadSource() {
        if (!video || !source || loaded) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          setStatus('播放源已加载');
        } else {
          video.src = source;
          setStatus('使用浏览器原生播放能力');
        }
      }

      function play() {
        loadSource();
        if (!video) {
          return;
        }
        shell.classList.add('is-ready');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setStatus('请再次点击播放按钮开始播放');
            shell.classList.remove('is-playing');
          });
        }
      }

      if (startButton) {
        startButton.addEventListener('click', function (event) {
          event.preventDefault();
          play();
        });
      }

      shell.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        if (event.target.closest('[data-player-start]')) {
          return;
        }
        play();
      });

      if (video) {
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
          shell.classList.add('is-ready');
          setStatus('正在播放');
        });
        video.addEventListener('pause', function () {
          shell.classList.remove('is-playing');
          if (video.currentTime > 0) {
            setStatus('已暂停');
          }
        });
        video.addEventListener('error', function () {
          setStatus('播放源暂时无法加载，请切换网络后重试');
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initNavSearch();
    initSearchPanels();
    initPlayers();
  });
})();
