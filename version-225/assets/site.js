(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = qs('[data-mobile-menu-button]');
    var panel = qs('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = qs('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        activate(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function setupCardFiltering() {
    var cards = qsa('[data-movie-card]');

    if (!cards.length) {
      return;
    }

    var searchInput = qs('[data-card-search]');
    var yearSelect = qs('[data-card-year]');
    var typeSelect = qs('[data-card-type]');
    var count = qs('[data-filter-count]');

    function update() {
      var keyword = normalize(searchInput && searchInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' '));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchedType = !type || normalize(card.getAttribute('data-type')) === type;
        var matched = matchedKeyword && matchedYear && matchedType;

        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '显示 ' + visible + ' 部影片';
      }
    }

    [searchInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', update);
        control.addEventListener('change', update);
      }
    });

    update();
  }

  function setupSearchPage() {
    var page = qs('[data-search-page]');

    if (!page || !window.MOVIE_DATA) {
      return;
    }

    var form = qs('[data-live-search-form]', page);
    var input = qs('input[name="q"]', form);
    var category = qs('select[name="category"]', form);
    var results = qs('[data-search-results]', page);
    var count = qs('[data-search-count]', page);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function movieToCard(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-card__poster" href="' + movie.url + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '海报" loading="lazy">',
        '    <span class="movie-card__type">' + escapeHtml(movie.type) + '</span>',
        '    <span class="movie-card__score">' + movie.rating + '</span>',
        '  </a>',
        '  <div class="movie-card__body">',
        '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.one_line) + '</p>',
        '    <div class="movie-card__meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
        '    <div class="movie-card__tags">' + movie.genres.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function render() {
      var keyword = normalize(input && input.value);
      var selectedCategory = normalize(category && category.value);
      var matched = window.MOVIE_DATA.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.category,
          movie.genre_text,
          movie.tags_text,
          movie.one_line
        ].join(' '));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okCategory = !selectedCategory || normalize(movie.category) === selectedCategory;
        return okKeyword && okCategory;
      }).slice(0, 120);

      results.innerHTML = matched.map(movieToCard).join('');

      if (count) {
        count.textContent = matched.length
          ? '显示前 ' + matched.length + ' 条匹配结果'
          : '没有找到匹配影片，可以换一个关键词。';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    input.addEventListener('input', render);
    category.addEventListener('change', render);
    render();
  }

  function setupNavSearch() {
    qsa('[data-nav-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);

        if (input && input.value.trim()) {
          return;
        }

        event.preventDefault();
        window.location.href = form.getAttribute('action') || 'search.html';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroSlider();
    setupCardFiltering();
    setupSearchPage();
    setupNavSearch();
  });
})();
