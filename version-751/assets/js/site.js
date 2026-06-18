(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    selectAll('[data-global-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            var target = './search.html';
            if (query) {
                target += '?q=' + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    });

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupCardFilters() {
        var form = document.querySelector('[data-card-filter]');
        var cardList = document.querySelector('[data-card-list]');
        if (!form || !cardList) {
            return;
        }

        var input = form.querySelector('input[name="keyword"]');
        var emptyState = document.querySelector('[data-empty-state]');
        var buttons = selectAll('[data-filter-value]');
        var activeValue = 'all';
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function applyFilter() {
            var query = normalize(input ? input.value : '');
            var visible = 0;
            selectAll('.js-movie-card', cardList).forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-keywords')
                ].join(' '));
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesButton = activeValue === 'all' || haystack.indexOf(normalize(activeValue)) !== -1;
                var show = matchesQuery && matchesButton;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                activeValue = button.getAttribute('data-filter-value') || 'all';
                applyFilter();
            });
        });

        applyFilter();
    }

    function setupHero() {
        var hero = document.querySelector('.js-hero');
        if (!hero) {
            return;
        }

        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(nextIndex) {
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
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
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
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById('movieVideo');
        var playButton = document.getElementById('moviePlayButton');
        if (!video || !playButton || !streamUrl) {
            return;
        }

        var loaded = false;
        var hlsInstance = null;

        function attachStream() {
            if (loaded) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            loaded = true;
        }

        function beginPlayback() {
            attachStream();
            playButton.classList.add('is-hidden');
            video.controls = true;
            var playAttempt = video.play();
            if (playAttempt && typeof playAttempt.catch === 'function') {
                playAttempt.catch(function () {});
            }
        }

        playButton.addEventListener('click', beginPlayback);
        video.addEventListener('click', function () {
            if (video.paused) {
                beginPlayback();
            }
        });
        video.addEventListener('play', function () {
            playButton.classList.add('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    setupHero();
    setupCardFilters();
})();
