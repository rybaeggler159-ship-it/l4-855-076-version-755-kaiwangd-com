(function () {
  function initMoviePlayer(sourceUrl) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    var trigger = document.querySelector('[data-player-trigger]');
    var loaded = false;
    var hls = null;

    if (!video || !sourceUrl) {
      return;
    }

    function loadSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      video.controls = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = sourceUrl;
    }

    function startPlayer() {
      loadSource();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', startPlayer);
    }

    if (cover) {
      cover.addEventListener('click', startPlayer);
    }

    video.addEventListener('click', function () {
      if (!loaded) {
        startPlayer();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
}());
