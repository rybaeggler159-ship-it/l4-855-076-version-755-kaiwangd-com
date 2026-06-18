(function () {
  function query(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function queryAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = query('[data-menu-toggle]');
    var menu = query('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupSearchForms() {
    queryAll('.global-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = query('input[name="q"]', form);
        var value = input ? input.value.trim() : '';
        var target = new URL('search.html', window.location.href);
        if (value) {
          target.searchParams.set('q', value);
        }
        window.location.href = target.href;
      });
    });
  }

  function setupHero() {
    var carousel = query('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = queryAll('.hero-slide', carousel);
    var dots = queryAll('.hero-dot', carousel);
    var prev = query('[data-hero-prev]', carousel);
    var next = query('[data-hero-next]', carousel);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
        dot.setAttribute('aria-selected', dotIndex === index ? 'true' : 'false');
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
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    queryAll('[data-filter-scope]').forEach(function (scope) {
      var input = query('[data-filter-input]', scope);
      var region = query('[data-filter-region]', scope);
      var type = query('[data-filter-type]', scope);
      var genre = query('[data-filter-genre]', scope);
      var cards = queryAll('.movie-card, .rank-item', scope);
      var empty = query('.empty-state', scope);
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';

      if (input && initial) {
        input.value = initial;
      }

      function includes(value, expected) {
        return !expected || String(value || '').indexOf(expected) !== -1;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var selectedRegion = region ? region.value : '';
        var selectedType = type ? type.value : '';
        var selectedGenre = genre ? genre.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var search = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
          var matchesKeyword = !keyword || search.indexOf(keyword) !== -1;
          var matchesRegion = includes(card.getAttribute('data-region') || search, selectedRegion);
          var matchesType = includes(card.getAttribute('data-type') || search, selectedType);
          var matchesGenre = includes(card.getAttribute('data-genre') || search, selectedGenre);
          var ok = matchesKeyword && matchesRegion && matchesType && matchesGenre;
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, region, type, genre].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupImages() {
    queryAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupImages();
  });
}());
