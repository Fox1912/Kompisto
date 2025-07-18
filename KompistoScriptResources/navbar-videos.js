document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');

  function normalize(text) {
    return text.toLowerCase().trim();
  }

function filterVideos(query) {
  const searchTerms = query.toLowerCase().trim().split(/\s+/); // split by spaces
  const videoCards = document.querySelectorAll('.video-card');

  videoCards.forEach(card => {
    const title = card.querySelector('.video-title')?.textContent.toLowerCase() || '';
    const channel = card.querySelector('.video-channel-name')?.textContent.toLowerCase() || '';
    const description = card.querySelector('.video-description')?.textContent.toLowerCase() || '';

    // Check if every search term is found in ANY of the 3 fields
    const matches = searchTerms.every(term =>
      title.includes(term) || channel.includes(term) || description.includes(term)
    );

    card.style.display = matches ? 'flex' : 'none';
  });
}

  searchInput.addEventListener('input', (e) => {
    filterVideos(e.target.value);
  });

  searchInput.addEventListener('blur', () => {
    if (!searchInput.value.trim()) {
      const videoCards = document.querySelectorAll('.video-card');
      videoCards.forEach(card => card.style.display = 'flex');
    }
  });
});