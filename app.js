const playlistEl = document.getElementById('playlist');
const playerContainer = document.getElementById('playerContainer');
const chordTimelineEl = document.getElementById('chordTimeline');
const chordDiagramEl = document.getElementById('chordDiagram');

const state = {
  songs: [],
  currentSongId: null,
  mode: 'manual',
  chordsBySong: {}
};

const SHAPES = {
  'Am': 'Am\nE|-0-\nB|-1-(1)\nG|-2-(2)\nD|-2-(3)\nA|-0-\nE|---',
  'C': 'C\nE|-0-\nB|-1-(1)\nG|-0-\nD|-2-(2)\nA|-3-(3)\nE|---',
  'G': 'G\nE|-3-(4)\nB|-0-\nG|-0-\nD|-0-\nA|-2-(1)\nE|-3-(2)',
  'F': 'F (barré)\nE|-1-(1)\nB|-1-(1)\nG|-2-(2)\nD|-3-(4)\nA|-3-(3)\nE|-1-(1)'
};

function parseYouTubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function timeToSeconds(mmss) {
  const [m, s] = mmss.split(':').map(Number);
  if (Number.isNaN(m) || Number.isNaN(s)) return null;
  return m * 60 + s;
}

function renderPlayer() {
  const song = state.songs.find(s => s.id === state.currentSongId);
  if (!song) {
    playerContainer.innerHTML = '<p>Aucune vidéo sélectionnée.</p>';
    return;
  }
  playerContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${song.youtubeId}?enablejsapi=1" allowfullscreen></iframe>`;
}

function renderPlaylist() {
  playlistEl.innerHTML = '';
  state.songs.forEach(song => {
    const li = document.createElement('li');
    li.className = `item ${song.id === state.currentSongId ? 'active' : ''}`;
    li.innerHTML = `<span class="label">${song.title}</span><button data-del="${song.id}">Supprimer</button>`;

    li.querySelector('.label').onclick = () => {
      state.currentSongId = song.id;
      renderPlayer();
      renderPlaylist();
      renderTimeline();
    };

    li.querySelector('button').onclick = () => {
      state.songs = state.songs.filter(s => s.id !== song.id);
      if (state.currentSongId === song.id) state.currentSongId = state.songs[0]?.id || null;
      renderPlayer();
      renderPlaylist();
      renderTimeline();
    };

    playlistEl.appendChild(li);
  });
}

function getCurrentChords() {
  return state.chordsBySong[state.currentSongId] || [];
}

function renderTimeline() {
  chordTimelineEl.innerHTML = '';
  const chords = getCurrentChords().sort((a, b) => a.sec - b.sec);
  if (!state.currentSongId) {
    chordTimelineEl.innerHTML = '<li class="item">Sélectionne un morceau.</li>';
    return;
  }
  chords.forEach((c, idx) => {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `<span class="label">${c.timecode} | ${c.chord} ${c.auto ? '(auto)' : ''}</span><button data-i="${idx}">X</button>`;
    li.querySelector('.label').onclick = () => {
      chordDiagramEl.textContent = SHAPES[c.chord] || `Pas de diagramme pour ${c.chord}`;
    };
    li.querySelector('button').onclick = () => {
      const arr = getCurrentChords();
      arr.splice(idx, 1);
      state.chordsBySong[state.currentSongId] = arr;
      renderTimeline();
    };
    chordTimelineEl.appendChild(li);
  });
}

function addSong() {
  const url = document.getElementById('youtubeUrl').value.trim();
  const youtubeId = parseYouTubeId(url);
  if (!youtubeId) return alert('Lien YouTube invalide');

  const song = { id: crypto.randomUUID(), youtubeId, title: `Morceau ${state.songs.length + 1}` };
  state.songs.push(song);
  state.currentSongId = song.id;
  state.chordsBySong[song.id] = [];

  renderPlayer();
  renderPlaylist();
  renderTimeline();
}

function addChord() {
  if (!state.currentSongId) return alert('Ajoute/sélectionne un morceau');

  const timecode = document.getElementById('timecodeInput').value.trim();
  const chord = document.getElementById('chordInput').value.trim();
  const sec = timeToSeconds(timecode);
  if (sec === null || !chord) return alert('Format attendu: mm:ss + accord');

  const arr = getCurrentChords();
  arr.push({ timecode, chord, sec, auto: state.mode === 'auto' });
  state.chordsBySong[state.currentSongId] = arr;
  renderTimeline();
}

document.getElementById('addSongBtn').onclick = addSong;
document.getElementById('addChordBtn').onclick = addChord;
document.getElementById('manualModeBtn').onclick = () => setMode('manual');
document.getElementById('autoModeBtn').onclick = () => setMode('auto');

function setMode(mode) {
  state.mode = mode;
  document.getElementById('manualModeBtn').classList.toggle('active', mode === 'manual');
  document.getElementById('autoModeBtn').classList.toggle('active', mode === 'auto');

  if (mode === 'auto' && state.currentSongId && getCurrentChords().length === 0) {
    state.chordsBySong[state.currentSongId] = [
      { timecode: '00:10', chord: 'Am', sec: 10, auto: true },
      { timecode: '00:25', chord: 'F', sec: 25, auto: true },
      { timecode: '00:40', chord: 'C', sec: 40, auto: true },
      { timecode: '00:55', chord: 'G', sec: 55, auto: true }
    ];
    renderTimeline();
  }
}

renderPlayer();
renderPlaylist();
renderTimeline();
