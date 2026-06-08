(function() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-nav-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function() {
      panel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function schedule() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        show(active + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(active - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(active + 1);
        schedule();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        schedule();
      });
    });

    show(0);
    schedule();
  }

  var filterScopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

  filterScopes.forEach(function(scope) {
    var container = scope.closest("section") || document;
    var input = container.querySelector("[data-filter-input]");
    var selects = Array.prototype.slice.call(container.querySelectorAll("[data-filter-select]"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var year = params.get("year") || "";

    if (input && query) {
      input.value = query;
    }

    selects.forEach(function(select) {
      var kind = select.getAttribute("data-filter-select");
      if (kind === "year" && year) {
        select.value = year;
      }
    });

    function apply() {
      var term = input ? input.value.trim().toLowerCase() : "";
      var options = {};
      selects.forEach(function(select) {
        options[select.getAttribute("data-filter-select")] = select.value.trim().toLowerCase();
      });

      cards.forEach(function(card) {
        var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
        var matchText = !term || text.indexOf(term) !== -1;
        var matchYear = !options.year || (card.getAttribute("data-year") || "").toLowerCase() === options.year;
        var matchRegion = !options.region || (card.getAttribute("data-region") || "").toLowerCase().indexOf(options.region) !== -1;
        var matchGenre = !options.genre || (card.getAttribute("data-genre") || "").toLowerCase().indexOf(options.genre) !== -1 || text.indexOf(options.genre) !== -1;
        card.classList.toggle("is-hidden", !(matchText && matchYear && matchRegion && matchGenre));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach(function(select) {
      select.addEventListener("change", apply);
    });

    apply();
  });
}());
