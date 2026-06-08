(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.textContent = open ? '×' : '☰';
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll('.site-search');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      });
    });
  }

  function setupHero() {
    var root = document.querySelector('.hero-carousel');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var prev = root.querySelector('.hero-prev');
    var next = root.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
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
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide') || 0));
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var inputs = document.querySelectorAll('.movie-filter-input');
    inputs.forEach(function (input) {
      var section = input.closest('main') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
      var empty = section.querySelector('.empty-state');
      input.addEventListener('input', function () {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
          var matched = !keyword || text.indexOf(keyword) !== -1;
          card.hidden = !matched;
          var previous = card.previousElementSibling;
          if (previous && previous.classList.contains('rank-number')) {
            previous.hidden = !matched;
          }
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      });
    });
  }

  function escapeText(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function renderSearch() {
    var results = document.getElementById('search-results');
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    var input = document.getElementById('search-page-input');
    var empty = document.getElementById('search-empty');
    if (input) {
      input.value = keyword;
    }
    if (!keyword) {
      results.innerHTML = '';
      if (empty) {
        empty.hidden = false;
      }
      return;
    }
    var lower = keyword.toLowerCase();
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      return movie.search.toLowerCase().indexOf(lower) !== -1;
    }).slice(0, 120);
    results.innerHTML = matched.map(function (movie) {
      return [
        '<article class="movie-card poster-card">',
        '  <a href="' + escapeText(movie.file) + '" class="poster-link">',
        '    <span class="poster-image">',
        '      <img src="' + escapeText(movie.cover) + '" alt="' + escapeText(movie.title) + '" loading="lazy">',
        '      <span class="poster-overlay"><span>▶</span></span>',
        '    </span>',
        '    <span class="poster-body">',
        '      <span class="movie-tags"><span>' + escapeText(movie.category) + '</span><span>' + escapeText(movie.type) + '</span></span>',
        '      <strong>' + escapeText(movie.title) + '</strong>',
        '      <em>' + escapeText(movie.oneLine) + '</em>',
        '      <span class="movie-meta"><span>' + escapeText(movie.year) + '</span><span>' + escapeText(movie.region) + '</span></span>',
        '    </span>',
        '  </a>',
        '</article>'
      ].join('');
    }).join('');
    if (empty) {
      empty.hidden = matched.length !== 0;
      if (!matched.length) {
        empty.textContent = '没有找到相关影片';
      }
    }
  }

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    renderSearch();
  });
}());
