(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function bindNavigation() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("form[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var url = "./search.html";
        if (value) {
          url += "?q=" + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
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
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function updateGrid(grid) {
    if (!grid) {
      return;
    }

    var gridId = grid.id;
    var input = gridId ? document.querySelector("[data-filter-input='" + gridId + "']") : null;
    var term = normalize(input ? input.value : "");
    var active = normalize(grid.getAttribute("data-active-filter") || "all");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search"));
      var type = normalize(card.getAttribute("data-type"));
      var region = normalize(card.getAttribute("data-region"));
      var year = normalize(card.getAttribute("data-year"));
      var genre = normalize(card.getAttribute("data-genre"));
      var matchesTerm = !term || haystack.indexOf(term) !== -1;
      var matchesFilter = active === "all" || type.indexOf(active) !== -1 || region.indexOf(active) !== -1 || year.indexOf(active) !== -1 || genre.indexOf(active) !== -1 || haystack.indexOf(active) !== -1;
      var show = matchesTerm && matchesFilter;
      card.classList.toggle("is-hidden", !show);
      if (show) {
        visible += 1;
      }
    });

    if (gridId) {
      var empty = document.querySelector("[data-empty-state='" + gridId + "']");
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
  }

  function bindFilters() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var searchInput = document.getElementById("site-search-input");
    if (searchInput && query) {
      searchInput.value = query;
    }

    document.querySelectorAll("[data-filter-grid]").forEach(function (grid) {
      updateGrid(grid);
    });

    document.querySelectorAll(".local-search-input").forEach(function (input) {
      input.addEventListener("input", function () {
        var grid = document.getElementById(input.getAttribute("data-filter-input"));
        updateGrid(grid);
      });
    });

    document.querySelectorAll("[data-filter-chips]").forEach(function (group) {
      var gridId = group.getAttribute("data-filter-chips");
      var grid = document.getElementById(gridId);
      group.querySelectorAll(".filter-chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
          group.querySelectorAll(".filter-chip").forEach(function (item) {
            item.classList.remove("active");
          });
          chip.classList.add("active");
          if (grid) {
            grid.setAttribute("data-active-filter", chip.getAttribute("data-filter") || "all");
            updateGrid(grid);
          }
        });
      });
    });
  }

  function attachHls(video, source) {
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      video.src = source;
    }
  }

  window.setupPlayer = function (source) {
    ready(function () {
      var shell = document.querySelector("[data-player]");
      if (!shell) {
        return;
      }

      var video = shell.querySelector("video");
      var startButton = shell.querySelector("[data-player-start]");
      if (!video || !source) {
        return;
      }

      attachHls(video, source);

      function showPlayingState() {
        if (startButton) {
          startButton.classList.add("player-overlay-hide");
        }
      }

      function startPlayback() {
        showPlayingState();
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            if (startButton) {
              startButton.classList.remove("player-overlay-hide");
            }
          });
        }
      }

      if (startButton) {
        startButton.addEventListener("click", startPlayback);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });

      video.addEventListener("play", showPlayingState);
      video.addEventListener("playing", showPlayingState);
      video.addEventListener("pause", function () {
        if (startButton && video.currentTime === 0) {
          startButton.classList.remove("player-overlay-hide");
        }
      });
    });
  };

  ready(function () {
    bindNavigation();
    bindHero();
    bindFilters();
  });
})();
