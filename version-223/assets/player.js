(function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  shells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var trigger = shell.querySelector('[data-play]');

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var prepared = false;
    var instance = null;

    function prepare() {
      if (prepared || !stream) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({ enableWorker: true });
        instance.loadSource(stream);
        instance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      prepare();
      shell.classList.add('is-playing');
      var action = video.play();

      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    });
  });
})();
