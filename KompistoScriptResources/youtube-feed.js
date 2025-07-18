const YOUTUBE_API_KEY = 'AIzaSyCCLd5FO4-Jhvb26T0v85taApcH22Hd5sk';
const youtubeChannelIds = [
  'UCKbHbzggsqawKcLvsSJ43_w',
  'UCXHYeIWjU9g56uLc7zvtJHw',
  'UC_7JailFVnAHJZ2Xht9k9og'
];

function fetchVideosFromChannel(channelId) {
  const playlistId = 'UU' + channelId.slice(2);
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=10&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`;
  return fetch(url)
    .then(res => res.json())
    .then(data => data.items || []);
}

function fetchVideoStats(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
  return fetch(url)
    .then(res => res.json())
    .then(data => (data.items && data.items[0]) ? data.items[0].statistics : {});
}

function fetchChannelThumbnail(channelId) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`;
  return fetch(url)
    .then(res => res.json())
    .then(data => data.items?.[0]?.snippet?.thumbnails?.default?.url || '');
}

function createVideoCard(video) {
  const videoId = video.contentDetails.videoId;
  const title = video.snippet.title;
  const channelTitle = video.snippet.channelTitle;
  const thumbnailUrl = video.snippet.thumbnails.high.url;
  const publishedAt = new Date(video.snippet.publishedAt).toLocaleDateString();
  const description = video.snippet.description;
  const channelId = video.snippet.channelId;

  const card = document.createElement('div');
  card.className = 'video-card';

  const img = document.createElement('img');
  img.className = 'video-card-thumbnail';
  img.src = thumbnailUrl;
  img.alt = title;

  const info = document.createElement('div');
  info.className = 'video-info';
  info.innerHTML = `
    <div class="video-title">${title}</div>
    <div class="video-channel-name">${channelTitle}</div>
    <div class="upload-date">${publishedAt}</div>
    <div class="video-stats">Loading stats...</div>
  `;
  
  const descriptionEl = document.createElement('div');
  descriptionEl.className = 'video-description';
  descriptionEl.style.display = 'none'; // make it invisible
  descriptionEl.textContent = description;
  info.appendChild(descriptionEl);

  card.appendChild(img);
  card.appendChild(info);

  fetchVideoStats(videoId).then(stats => {
    const statsDiv = info.querySelector('.video-stats');
    statsDiv.innerText = `${stats.viewCount || 0} views | ${stats.likeCount || 0} likes`;
  });

  card.addEventListener('click', () => {
    openModal({
      videoId,
      title,
      description,
      channelTitle,
      channelId
    });
  });

  return card;
}

Promise.all(youtubeChannelIds.map(fetchVideosFromChannel))
  .then(results => {
    const allVideos = results.flat().sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
    const container = document.querySelector('.video-feed-container');
    allVideos.forEach(video => {
      const card = createVideoCard(video);
      container.appendChild(card);
    });
    bindVideoCardSounds(); // <- call here after cards added
  })
  .catch(error => console.error('Error loading YouTube videos:', error));

// Modal logic
function openModal({ videoId, title, description, channelTitle, channelId }) {
  const modal = document.getElementById('video-modal');
  const iframe = document.getElementById('modal-video-iframe');
  const titleEl = document.getElementById('modal-video-title');
  const descEl = document.getElementById('modal-video-description');
  const statsEl = document.getElementById('modal-video-stats');
  const channelLink = document.getElementById('modal-channel-link');
  const pfpEl = document.getElementById('modal-channel-pfp');
  const ytBtn = document.getElementById('modal-youtube-button');

  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  titleEl.textContent = title;

  const MAX_CHARS = 80;
  let isExpanded = false;

  if (description.length > MAX_CHARS) {
    const truncated = description.slice(0, MAX_CHARS).trim() + '...';

    // Set truncated description as clickable text
    descEl.textContent = truncated;
    descEl.style.cursor = 'pointer';

    descEl.onclick = () => {
      if (!isExpanded) {
        descEl.textContent = description;
        descEl.style.cursor = 'default';
      } else {
        descEl.textContent = truncated;
        descEl.style.cursor = 'pointer';
      }
      isExpanded = !isExpanded;
    };
  } else {
    descEl.textContent = description;
    descEl.style.cursor = 'default';
    descEl.onclick = null;
  }

  channelLink.textContent = channelTitle;
  channelLink.href = `https://www.youtube.com/channel/${channelId}`;
  ytBtn.onclick = () => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');

  statsEl.textContent = 'Loading stats...';
  fetchVideoStats(videoId).then(stats => {
    statsEl.textContent = `${stats.viewCount || 0} views | ${stats.likeCount || 0} likes`;
  });

  fetchChannelThumbnail(channelId).then(url => {
    pfpEl.src = url || '';
  });

  modal.classList.remove('hidden');
  modal.classList.add('show');
  modal.classList.remove('hide');
}

function closeModal() {
  const modal = document.getElementById('video-modal');
  const iframe = document.getElementById('modal-video-iframe');

  modal.classList.add('hide');
  modal.classList.remove('show');

  setTimeout(() => {
    modal.classList.add('hidden');
    iframe.src = '';
  }, 300); // match transition duration
}

// 🧠 This waits until the DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.modal-close').addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.video-feed-container');
  const hoverSound = document.getElementById('sound-hover');
  const clickSound = document.getElementById('sound-click');

  function playSound(audioElement) {
    if (!audioElement) return;
    audioElement.currentTime = 0;
    audioElement.play().catch(() => {});
  }

  // Use event delegation for hover and click sounds
  container.addEventListener('mouseover', (event) => {
    const card = event.target.closest('.video-card');
    if (!card) return;

    const related = event.relatedTarget;
    // Play sound only if coming from outside the card
    if (!related || !card.contains(related)) {
      playSound(hoverSound);
    }
  });

  container.addEventListener('click', (event) => {
    const card = event.target.closest('.video-card');
    if (!card) return;

    playSound(clickSound);
  });
});