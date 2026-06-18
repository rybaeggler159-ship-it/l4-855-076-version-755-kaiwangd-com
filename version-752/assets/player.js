(function() {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function setupPlayer() {
        var video = document.getElementById('movie-player');
        var cover = document.querySelector('.play-cover');
        if (!video || !cover) {
            return;
        }
        var sourceNode = video.querySelector('source');
        var url = sourceNode ? sourceNode.getAttribute('src') : '';
        var hls = null;
        var prepared = false;

        function prepare() {
            if (prepared || !url) {
                return;
            }
            prepared = true;
            if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function play() {
            prepare();
            cover.setAttribute('hidden', '');
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function() {
                    cover.removeAttribute('hidden');
                });
            }
        }

        cover.addEventListener('click', play);
        video.addEventListener('click', function() {
            if (video.paused && !prepared) {
                play();
            }
        });
        window.addEventListener('beforeunload', function() {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(setupPlayer);
})();
