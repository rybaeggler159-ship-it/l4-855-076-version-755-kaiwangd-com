(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initSearchPage();
    });

    function initMobileMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var menu = document.getElementById('mobileMenu');

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
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

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function initFilters() {
        var list = document.querySelector('.filter-list');
        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var keyword = document.querySelector('.filter-input');
        var region = document.querySelector('.filter-region');
        var type = document.querySelector('.filter-type');
        var empty = document.querySelector('.empty-state');

        function getText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' ').toLowerCase();
        }

        function apply() {
            var q = keyword ? keyword.value.trim().toLowerCase() : '';
            var r = region ? region.value : '';
            var t = type ? type.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var matchKeyword = !q || getText(card).indexOf(q) !== -1;
                var matchRegion = !r || card.getAttribute('data-region') === r;
                var matchType = !t || card.getAttribute('data-type') === t;
                var show = matchKeyword && matchRegion && matchType;

                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [keyword, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    }

    function initSearchPage() {
        var results = document.getElementById('searchResults');
        var input = document.getElementById('searchInput');
        var title = document.getElementById('searchTitle');
        var hint = document.getElementById('searchHint');

        if (!results || !window.MOVIE_SEARCH_INDEX) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (input) {
            input.value = initialQuery;
            input.addEventListener('input', function () {
                render(input.value);
            });
        }

        render(initialQuery);

        function render(query) {
            var q = (query || '').trim().toLowerCase();
            var source = window.MOVIE_SEARCH_INDEX;
            var matched = q ? source.filter(function (movie) {
                return movie.searchText.indexOf(q) !== -1;
            }) : source.slice(0, 24);

            if (title) {
                title.textContent = q ? '搜索结果' : '精选影片';
            }

            if (hint) {
                hint.textContent = q ? '当前关键词：' + query : '可直接输入关键词筛选完整片库。';
            }

            results.innerHTML = matched.slice(0, 96).map(renderCard).join('');

            if (!matched.length) {
                results.innerHTML = '<p class="empty-state">没有匹配的影片，请换一个关键词。</p>';
            }
        }

        function renderCard(movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<a class="movie-card" href="' + movie.url + '" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-year="' + escapeHtml(movie.year) + '" data-genre="' + escapeHtml(movie.genre) + '">',
                '    <span class="card-media">',
                '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '        <span class="card-shade"></span>',
                '        <span class="play-bubble" aria-hidden="true"></span>',
                '        <span class="card-badge">' + escapeHtml(movie.category) + '</span>',
                '    </span>',
                '    <span class="card-body">',
                '        <strong class="card-title">' + escapeHtml(movie.title) + '</strong>',
                '        <span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>',
                '        <span class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></span>',
                '        <span class="tag-row">' + tags + '</span>',
                '    </span>',
                '</a>'
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
    }
})();
