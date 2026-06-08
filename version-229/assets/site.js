document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;

    var show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-scroll-target]').forEach(function (button) {
    button.addEventListener('click', function () {
      var target = document.querySelector(button.getAttribute('data-scroll-target'));
      var direction = button.getAttribute('data-scroll-direction') === 'left' ? -1 : 1;
      if (target) {
        target.scrollBy({ left: direction * 360, behavior: 'smooth' });
      }
    });
  });

  var homeTabs = Array.prototype.slice.call(document.querySelectorAll('[data-home-filter]'));
  var homeGroups = Array.prototype.slice.call(document.querySelectorAll('[data-home-group]'));

  homeTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var key = tab.getAttribute('data-home-filter');
      homeTabs.forEach(function (item) {
        item.classList.toggle('active', item === tab);
      });
      homeGroups.forEach(function (group) {
        group.classList.toggle('active', group.getAttribute('data-home-group') === key);
      });
    });
  });

  var searchForms = Array.prototype.slice.call(document.querySelectorAll('.search-form'));

  searchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      if (document.querySelector('[data-search-page]') || document.querySelector('[data-list-page]')) {
        event.preventDefault();
        filterCards();
      } else if (value) {
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      }
    });
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  var searchInput = document.querySelector('[data-filter-input]');

  if (query) {
    document.querySelectorAll('[data-filter-input]').forEach(function (input) {
      input.value = query;
    });
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input], [data-filter-select]'));

  filterInputs.forEach(function (input) {
    input.addEventListener('input', filterCards);
    input.addEventListener('change', filterCards);
  });

  if (filterInputs.length) {
    filterCards();
  }

  function filterCards() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    var typeSelect = document.querySelector('[data-filter-type]');
    var categorySelect = document.querySelector('[data-filter-category]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var empty = document.querySelector('.empty-state');
    var keyword = '';
    inputs.some(function (input) {
      keyword = input.value.trim().toLowerCase();
      return Boolean(keyword);
    });
    var type = typeSelect ? typeSelect.value : '';
    var category = categorySelect ? categorySelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var cardType = card.getAttribute('data-type') || '';
      var cardCategory = card.getAttribute('data-category') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var ok = true;

      if (keyword && text.indexOf(keyword) === -1) {
        ok = false;
      }

      if (type && cardType !== type) {
        ok = false;
      }

      if (category && cardCategory !== category) {
        ok = false;
      }

      if (year && cardYear !== year) {
        ok = false;
      }

      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  var video = document.querySelector('.video-player');

  if (video) {
    var url = video.getAttribute('data-video-url');
    var overlay = document.querySelector('.play-overlay');

    if (url) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      }
    }

    var startVideo = function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    };

    if (overlay) {
      overlay.addEventListener('click', startVideo);
    }

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });
  }
});
