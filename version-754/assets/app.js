(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.hasAttribute("hidden");
      if (open) {
        menu.removeAttribute("hidden");
      } else {
        menu.setAttribute("hidden", "");
      }
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    start();
  }

  function setupFilters() {
    var input = document.querySelector(".filter-input");
    var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-list .movie-card"));
    if (!cards.length) {
      return;
    }
    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }
    function apply() {
      var term = normalize(input ? input.value : "");
      var filters = {};
      selects.forEach(function (select) {
        filters[select.getAttribute("data-filter")] = normalize(select.value);
      });
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matched = !term || text.indexOf(term) !== -1;
        Object.keys(filters).forEach(function (key) {
          if (filters[key] && normalize(card.getAttribute("data-" + key)) !== filters[key]) {
            matched = false;
          }
        });
        card.style.display = matched ? "" : "none";
      });
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
  }

  function setupPlayer() {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var mask = player.querySelector(".play-mask");
    var loaded = false;
    function stream() {
      if (typeof pageStreamUrl === "undefined") {
        return "";
      }
      return pageStreamUrl;
    }
    function bind() {
      if (loaded || !video || !stream()) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream();
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream());
        hls.attachMedia(video);
      } else {
        video.src = stream();
      }
      video.setAttribute("controls", "controls");
    }
    function play() {
      bind();
      if (mask) {
        mask.setAttribute("hidden", "");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          if (mask) {
            mask.removeAttribute("hidden");
          }
        });
      }
    }
    if (mask) {
      mask.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!loaded) {
          play();
        }
      });
    }
  }

  function movieCard(item) {
    var tags = (item.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"movie-cover\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"观看 " + escapeHtml(item.title) + "\">",
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "<span class=\"play-icon\">▶</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<div class=\"movie-meta\">" + escapeHtml(item.meta) + "</div>",
      "<h2><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h2>",
      "<p>" + escapeHtml(item.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function setupSearchPage() {
    var container = document.getElementById("search-results");
    if (!container || !window.SEARCH_ITEMS) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = document.getElementById("search-page-input");
    if (input) {
      input.value = query;
    }
    var normalized = query.toLowerCase().trim();
    var items = window.SEARCH_ITEMS.filter(function (item) {
      if (!normalized) {
        return true;
      }
      return [item.title, item.meta, item.oneLine, (item.tags || []).join(" ")].join(" ").toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 120);
    if (!items.length) {
      container.innerHTML = "<div class=\"no-result\">没有找到匹配影片。</div>";
      return;
    }
    container.innerHTML = items.map(movieCard).join("");
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
    setupSearchPage();
  });
})();
