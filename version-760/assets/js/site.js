(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");
    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var open = mobilePanel.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
        var current = 0;
        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });
        setInterval(function () {
            showSlide(current + 1);
        }, 5800);
    }

    var filterGrid = document.querySelector(".filter-grid");
    if (filterGrid) {
        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll(".movie-card"));
        var keywordInput = document.querySelector(".js-filter-input");
        var yearSelect = document.querySelector(".js-year-filter");
        var sortSelect = document.querySelector(".js-sort-select");
        var applyFilters = function () {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            cards.forEach(function (card) {
                var title = (card.getAttribute("data-title") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var matchKeyword = !keyword || title.indexOf(keyword) !== -1;
                var matchYear = !year || cardYear === year;
                card.classList.toggle("hidden", !(matchKeyword && matchYear));
            });
        };
        var applySort = function () {
            if (!sortSelect) {
                return;
            }
            var mode = sortSelect.value;
            var sorted = cards.slice().sort(function (a, b) {
                var ay = Number(a.getAttribute("data-year") || 0);
                var by = Number(b.getAttribute("data-year") || 0);
                var ah = Number(a.getAttribute("data-hot") || 0);
                var bh = Number(b.getAttribute("data-hot") || 0);
                if (mode === "hot") {
                    return bh - ah;
                }
                if (mode === "title") {
                    return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                }
                return by - ay;
            });
            sorted.forEach(function (card) {
                filterGrid.appendChild(card);
            });
            cards = sorted;
            applyFilters();
        };
        if (keywordInput) {
            keywordInput.addEventListener("input", applyFilters);
        }
        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilters);
        }
        if (sortSelect) {
            sortSelect.addEventListener("change", applySort);
        }
        applySort();
    }

    var searchPage = document.querySelector(".search-page");
    if (searchPage && window.SiteMovieIndex) {
        var searchInput = document.querySelector(".js-site-search");
        var searchButton = document.querySelector(".js-site-search-button");
        var resultBox = document.querySelector(".search-results");
        var emptyTip = document.querySelector(".empty-tip");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (searchInput) {
            searchInput.value = initial;
        }
        var render = function () {
            if (!resultBox) {
                return;
            }
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            resultBox.innerHTML = "";
            if (!keyword) {
                if (emptyTip) {
                    emptyTip.classList.remove("hidden");
                }
                return;
            }
            var matches = window.SiteMovieIndex.filter(function (item) {
                return item.text.indexOf(keyword) !== -1;
            }).slice(0, 120);
            if (emptyTip) {
                emptyTip.classList.toggle("hidden", matches.length > 0);
            }
            matches.forEach(function (item) {
                var article = document.createElement("article");
                article.className = "movie-card";
                article.innerHTML = [
                    '<a class="poster-wrap" href="./' + item.url + '">',
                    '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
                    '<span class="poster-badge">' + item.genre + '</span>',
                    '<span class="poster-play">▶</span>',
                    '</a>',
                    '<div class="movie-card-body">',
                    '<h3><a href="./' + item.url + '">' + item.title + '</a></h3>',
                    '<p>' + item.desc + '</p>',
                    '<div class="movie-meta"><span>' + item.year + '</span><span>' + item.region + '</span></div>',
                    '</div>'
                ].join("");
                resultBox.appendChild(article);
            });
        };
        if (searchButton) {
            searchButton.addEventListener("click", render);
        }
        if (searchInput) {
            searchInput.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    render();
                }
            });
            searchInput.addEventListener("input", render);
        }
        render();
    }
})();
