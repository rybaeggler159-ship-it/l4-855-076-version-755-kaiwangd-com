(function() {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function() {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
                button.setAttribute('aria-expanded', 'true');
            } else {
                panel.setAttribute('hidden', '');
                button.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function(dot, i) {
            dot.addEventListener('click', function() {
                show(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function() {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function() {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function setupFilters() {
        var input = document.querySelector('.page-filter');
        var list = document.querySelector('.searchable-list');
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (initial) {
            input.value = initial;
        }

        function applyFilter() {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function(card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-type') || ''
                ].join(' ').toLowerCase();
                card.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
            });
        }

        input.addEventListener('input', applyFilter);
        applyFilter();
    }

    ready(function() {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
