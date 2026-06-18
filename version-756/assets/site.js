(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-button]');
  var mobilePanel = qs('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  qsa('[data-hero-carousel]').forEach(function (carousel) {
    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var prev = qs('[data-hero-prev]', carousel);
    var next = qs('[data-hero-next]', carousel);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function run() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        run();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        run();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        run();
      });
    });

    show(0);
    run();
  });

  qsa('[data-filter-list]').forEach(function (list) {
    var input = qs('[data-filter-input]');
    var year = qs('[data-filter-year]');
    var cards = qsa('[data-title]', list);

    if (input && input.getAttribute('data-url-query')) {
      var params = new URLSearchParams(window.location.search);
      var queryName = input.getAttribute('data-url-query');
      var queryValue = params.get(queryName);
      if (queryValue) {
        input.value = queryValue;
      }
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
        card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (year) {
      year.addEventListener('change', apply);
    }

    apply();
  });

  qsa('.player-box').forEach(function (box) {
    var video = qs('video', box);
    var trigger = qs('.play-trigger', box);
    var stream = box.getAttribute('data-stream');
    var attached = false;

    function attach() {
      if (!video || !stream || attached) {
        return;
      }
      attached = true;
      video.controls = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }
      video.src = stream;
      video.play().catch(function () {});
    }

    function start() {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      attach();
      if (video) {
        video.play().catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
    }
  });
})();
