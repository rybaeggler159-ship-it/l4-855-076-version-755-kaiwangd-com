(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var players = document.querySelectorAll('[data-player]');
        players.forEach(initPlayer);
    });

    function initPlayer(wrapper) {
        var video = wrapper.querySelector('video');
        var button = wrapper.querySelector('.play-trigger');
        var status = wrapper.querySelector('.player-status');
        var source = wrapper.getAttribute('data-src');
        var hlsInstance = null;
        var attached = false;

        if (!video || !button) {
            return;
        }

        button.addEventListener('click', function () {
            startPlayback();
        });

        video.addEventListener('playing', function () {
            wrapper.classList.remove('is-loading');
            wrapper.classList.add('is-playing');
            updateStatus('正在播放');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                wrapper.classList.remove('is-playing');
                updateStatus('已暂停，点击视频继续播放');
            }
        });

        video.addEventListener('error', function () {
            wrapper.classList.remove('is-loading');
            wrapper.classList.remove('is-playing');
            updateStatus('播放源加载失败，请稍后重试');
        });

        function startPlayback() {
            if (!source) {
                updateStatus('当前影片暂未绑定播放源');
                return;
            }

            wrapper.classList.add('is-loading');
            updateStatus('正在加载播放源...');

            if (!attached) {
                attachSource();
                attached = true;
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    wrapper.classList.remove('is-loading');
                    updateStatus('浏览器阻止了自动播放，请再次点击播放');
                });
            }
        }

        function attachSource() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.controls = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                video.controls = true;

                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                        updateStatus('网络波动，正在重新连接...');
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                        updateStatus('媒体解码恢复中...');
                    } else {
                        hlsInstance.destroy();
                        updateStatus('播放初始化失败，请刷新页面重试');
                    }
                });
                return;
            }

            video.src = source;
            video.controls = true;
            updateStatus('当前浏览器可能不支持 HLS 播放');
        }

        function updateStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }
    }
})();
