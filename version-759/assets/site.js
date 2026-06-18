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

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function bindNavigation() {
    var toggle = qs('[data-nav-toggle]');
    var menu = qs('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function bindHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function bindFilters() {
    qsa('[data-filter-list]').forEach(function (list) {
      var scope = list.closest('main') || document;
      var input = qs('[data-filter-input]', scope);
      var select = qs('[data-filter-select]', scope);
      var cards = qsa('.movie-card', list);
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = '没有匹配的影片。';

      function apply() {
        var term = normalize(input ? input.value : '');
        var genre = normalize(select ? select.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.textContent
          ].join(' '));
          var cardGenre = normalize(card.getAttribute('data-genre'));
          var ok = (!term || haystack.indexOf(term) !== -1) && (!genre || cardGenre.indexOf(genre) !== -1);
          card.classList.toggle('is-filtered-out', !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (!visible && !empty.parentNode) {
          list.appendChild(empty);
        }
        if (visible && empty.parentNode) {
          empty.parentNode.removeChild(empty);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (select) {
        select.addEventListener('change', apply);
      }
    });
  }

  function bindSearchPage() {
    var target = qs('#searchResults');
    if (!target || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get('q'));
    var title = qs('#searchTitle');
    var summary = qs('#searchSummary');
    var source = window.SEARCH_MOVIES;
    var results = query
      ? source.filter(function (movie) {
          return normalize([
            movie.title,
            movie.description,
            movie.genre,
            movie.region,
            movie.year,
            movie.category,
            movie.tags
          ].join(' ')).indexOf(query) !== -1;
        })
      : source.slice(0, 48);

    if (title) {
      title.textContent = query ? '搜索结果' : '精选推荐';
    }
    if (summary) {
      summary.textContent = query ? '关键词：' + params.get('q') + '，相关内容如下。' : '可直接浏览以下精选内容，或输入关键词继续搜索。';
    }
    if (!results.length) {
      target.innerHTML = '<div class="empty-state">没有匹配的影片。</div>';
      return;
    }
    target.innerHTML = results.slice(0, 240).map(function (movie) {
      return [
        '<article class="movie-card">',
        '<a href="' + escapeHtml(movie.url) + '">',
        '<div class="movie-cover">',
        '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
        '<span class="cover-badge">' + escapeHtml(movie.category) + '</span>',
        '<span class="cover-duration">' + escapeHtml(movie.duration) + '</span>',
        '</div>',
        '<div class="movie-body">',
        '<h3>' + escapeHtml(movie.title) + '</h3>',
        '<p>' + escapeHtml(movie.description) + '</p>',
        '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '<div class="movie-tags">' + escapeHtml(movie.tags) + '</div>',
        '</div>',
        '</a>',
        '</article>'
      ].join('');
    }).join('');
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movie-player');
    var cover = document.querySelector('.player-cover');
    var hlsInstance = null;
    var ready = false;

    if (!video || !source) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      prepare();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      if (cover) {
        cover.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindNavigation();
    bindHero();
    bindFilters();
    bindSearchPage();
  });
})();
