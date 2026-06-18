(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
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
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalizeText(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var input = form.querySelector("input");
      var grid = document.querySelector(".filter-grid");
      if (!input || !grid) {
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (query) {
        input.value = query;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function apply() {
        var term = normalizeText(input.value);
        cards.forEach(function (card) {
          var text = normalizeText(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region"));
          card.classList.toggle("hidden-by-filter", term && text.indexOf(term) === -1);
        });
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      input.addEventListener("input", apply);
      apply();
    });
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", callback, { once: true });
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", callback, { once: true });
    document.head.appendChild(script);
  }

  window.initMoviePlayer = function (videoId, buttonId, playUrl) {
    ready(function () {
      var video = document.getElementById(videoId);
      var button = document.getElementById(buttonId);
      if (!video || !button || !playUrl) {
        return;
      }

      var started = false;
      var hlsInstance = null;

      function begin() {
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        button.classList.add("hidden");
        video.setAttribute("controls", "controls");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = playUrl;
          video.play().catch(function () {});
          return;
        }

        loadHls(function () {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              maxBufferLength: 30,
              enableWorker: true
            });
            hlsInstance.loadSource(playUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = playUrl;
            video.play().catch(function () {});
          }
        });
      }

      button.addEventListener("click", begin);
      video.addEventListener("click", function () {
        if (!started) {
          begin();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
