(function () {
    function initPlayer(root) {
        var video = root.querySelector("video");
        var cover = root.querySelector("[data-player-cover]");
        var button = root.querySelector("[data-player-button]");
        if (!video) {
            return;
        }
        var sourceElement = video.querySelector("source");
        var source = sourceElement ? sourceElement.getAttribute("src") : video.getAttribute("src");
        var ready = false;
        var hls = null;

        function prepare() {
            if (ready || !source) {
                return;
            }
            var nativeType = video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
            if (nativeType) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            ready = true;
        }

        function start() {
            prepare();
            video.controls = true;
            root.classList.add("is-playing");
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {
                    root.classList.remove("is-playing");
                });
            }
        }

        function toggle() {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                start();
            });
        }
        video.addEventListener("click", toggle);
        video.addEventListener("play", function () {
            root.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime > 0 && !video.ended) {
                root.classList.remove("is-playing");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll("[data-player]").forEach(initPlayer);
    });
})();
