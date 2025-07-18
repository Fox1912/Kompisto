// navbar.js
const searchInput = document.getElementById('searchInput');
const soundDefault = document.getElementById('sound-default');
const soundSpace = document.getElementById('sound-space');
const soundDelete = document.getElementById('sound-delete');

searchInput.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    soundSpace.currentTime = 0;
    soundSpace.play();
  } else if (e.key === 'Backspace' || e.key === 'Delete') {
    soundDelete.currentTime = 0;
    soundDelete.play();
  } else if (e.key.length === 1) {
    soundDefault.currentTime = 0;
    soundDefault.play();
  }
});
