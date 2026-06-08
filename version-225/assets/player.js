import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(player) {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-player-play]');
  const message = player.querySelector('[data-player-message]');
  const videoUrl = player.getAttribute('data-video-url');
  const poster = player.getAttribute('data-poster');
  let hlsInstance = null;
  let hasLoaded = false;

  if (!video || !button || !videoUrl) {
    if (message) {
      message.textContent = '当前播放线路暂不可用。';
    }
    return;
  }

  if (poster) {
    video.setAttribute('poster', poster);
  }

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function playVideo() {
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setMessage('播放器已加载，请使用视频控件继续播放。');
      });
    }
  }

  function loadVideo() {
    if (hasLoaded) {
      playVideo();
      return;
    }

    hasLoaded = true;
    setMessage('正在加载高清播放线路...');

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });

      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        setMessage('播放线路加载完成。');
        playVideo();
      });

      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage('视频加载失败，请稍后重试或切换浏览器。');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', function () {
        setMessage('播放线路加载完成。');
        playVideo();
      }, { once: true });
    } else {
      setMessage('当前浏览器不支持 HLS 播放，请更换支持的浏览器。');
    }
  }

  button.addEventListener('click', function () {
    button.classList.add('is-hidden');
    loadVideo();
  });

  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      return;
    }

    button.classList.remove('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.movie-player').forEach(setupPlayer);
});
