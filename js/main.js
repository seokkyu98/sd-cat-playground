/**
 * main.js — App entry point
 * Initialises the cat and wires UI updates.
 */

import { CatMovement } from './cat-movement.js';

const STATE_LABELS = {
  walk: '🐾 산책 중',
  run:  '💨 달리는 중',
  rest: '😴 쉬는 중',
};

const LOG_MAX = 20;

function formatTime(d = new Date()) {
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function addLogEntry(message) {
  const log = document.getElementById('activity-log');
  if (!log) return;

  const li = document.createElement('li');
  li.innerHTML = `<span class="log-time">${formatTime()}</span>${message}`;
  log.prepend(li);

  // Keep list bounded
  while (log.children.length > LOG_MAX) {
    log.removeChild(log.lastChild);
  }
}

function updateStatusText(state) {
  const el = document.getElementById('status-text');
  if (el) el.textContent = STATE_LABELS[state] ?? state;
}

document.addEventListener('DOMContentLoaded', () => {
  const cat = document.getElementById('cat-character');
  if (!cat) return;

  CatMovement.init(cat, {
    onStateChange: (state) => {
      updateStatusText(state);
    },
    onLogEntry: (msg) => {
      addLogEntry(msg);
    },
  });

  addLogEntry('냥이가 등장했다!');
});
