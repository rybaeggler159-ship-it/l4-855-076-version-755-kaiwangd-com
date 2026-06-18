export function initMoviePlayer(videoUrl) {
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector(".play-overlay");
    if (!video || !videoUrl) {
        return;
    }

    var ready = false;
    var attach = function () {
        if (ready) {
            return;
        }
        ready = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
        } else {
            video.src = videoUrl;
        }
    };

    var play = function () {
        attach();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    };

    if (overlay) {
        overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });
}
