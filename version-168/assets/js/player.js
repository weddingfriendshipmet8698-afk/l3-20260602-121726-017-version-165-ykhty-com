(function () {
  window.createMoviePlayer = function (url) {
    var video = document.getElementById("movieVideo");
    var overlay = document.querySelector(".play-overlay");
    var loaded = false;
    var hls = null;

    if (!video || !url) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
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

      loaded = true;
      video.controls = true;
    }

    function start() {
      loadVideo();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var playTask = video.play();

      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
