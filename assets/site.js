const button = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');

button?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  button.setAttribute('aria-expanded', String(open));
  button.textContent = open ? '关闭' : '菜单';
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    button?.setAttribute('aria-expanded', 'false');
    if (button) button.textContent = '菜单';
  });
});

const copyButton = document.querySelector('.copy-button');
const copyStatus = document.querySelector('.copy-status');

copyButton?.addEventListener('click', async () => {
  const value = copyButton.dataset.copy;
  try {
    await navigator.clipboard.writeText(value);
    copyStatus.textContent = '微信号已复制';
  } catch {
    copyStatus.textContent = `微信号：${value}`;
  }
  window.setTimeout(() => { copyStatus.textContent = ''; }, 2400);
});

const videoDialog = document.querySelector('#video-dialog');
const videoPlayer = videoDialog?.querySelector('.video-player');
const videoStage = videoDialog?.querySelector('.video-stage');
const videoTitle = videoDialog?.querySelector('#video-title');
const videoClose = videoDialog?.querySelector('.dialog-close');
const videoLoading = videoDialog?.querySelector('.video-loading');
let activeLoadId = 0;
let activeLoadController = null;

document.querySelectorAll('[data-video-src]').forEach((trigger) => {
  trigger.addEventListener('click', async () => {
    if (!videoDialog || !videoPlayer) return;
    activeLoadController?.abort();
    const controller = new AbortController();
    activeLoadController = controller;
    const loadId = ++activeLoadId;
    const directSource = trigger.dataset.videoSrc;
    videoTitle.textContent = trigger.dataset.title || '作品播放';
    videoStage.classList.toggle('is-vertical', trigger.dataset.orientation === 'vertical');
    videoStage.classList.remove('is-ready');
    videoLoading.textContent = '正在准备视频…';
    videoPlayer.poster = trigger.dataset.poster || '';
    videoDialog.showModal();
    document.body.classList.add('modal-open');
    const isCurrent = () => loadId === activeLoadId && videoDialog.open && !controller.signal.aborted;
    videoPlayer.addEventListener('playing', () => {
      if (isCurrent()) videoStage.classList.add('is-ready');
    }, { signal: controller.signal });
    videoPlayer.addEventListener('error', () => {
      if (!isCurrent()) return;
      videoStage.classList.remove('is-ready');
      videoLoading.textContent = '视频载入失败，请关闭后重试';
    }, { signal: controller.signal });
    videoPlayer.src = directSource;
    videoPlayer.load();
    try {
      await videoPlayer.play();
    } catch (error) {
      if (isCurrent()) {
        videoLoading.textContent = error.name === 'NotAllowedError'
          ? '请点击播放器的播放按钮'
          : '视频载入失败，请关闭后重试';
      }
    }
  });
});

function closeVideo() {
  if (!videoDialog?.open) return;
  activeLoadController?.abort();
  videoDialog.close();
}

videoClose?.addEventListener('click', closeVideo);
videoDialog?.addEventListener('click', (event) => {
  if (event.target === videoDialog) closeVideo();
});
videoDialog?.addEventListener('close', () => {
  if (videoDialog.open) return;
  activeLoadController?.abort();
  activeLoadController = null;
  activeLoadId += 1;
  document.body.classList.remove('modal-open');
  videoStage.classList.remove('is-ready');
  videoPlayer.pause();
  videoPlayer.removeAttribute('src');
  videoPlayer.removeAttribute('poster');
  videoPlayer.load();
});
