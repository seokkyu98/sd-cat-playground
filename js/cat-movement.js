/**
 * cat-movement.js
 * Factory that creates an autonomous movement controller for any cat element.
 * Call createCatController(el, opts) to get an independent { init, destroy, getState } per cat.
 * CatMovement is a backward-compatible singleton wrapper around the factory.
 */

const CAT_SIZE = 80;
const MARGIN   = 10;

const SPEED = { walk: 1.4, run: 3.2 };

const STATE_DURATION = {
  walk: [3000, 7000],
  run:  [1500, 4000],
  rest: [2000, 5000],
};

const STATES = ['walk', 'run', 'rest'];

const REACTIONS = [
  'にゃ～ん♪', '꾹!', '냐옹~', 'zZz...', '뭐야?!',
  '배고파', '같이 놀자!', '*골골*', '훗!', '냐냐냐!',
];

function rand(min, max)    { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

function viewportBounds() {
  return {
    maxX: window.innerWidth  - CAT_SIZE - MARGIN,
    maxY: window.innerHeight - CAT_SIZE - MARGIN,
  };
}

/**
 * createCatController(catElement, options)
 * Returns { init, destroy, getState } for one cat element.
 * Multiple calls create fully independent instances.
 */
export function createCatController(catElement, { onStateChange, onLogEntry } = {}) {
  let el         = catElement;
  let x          = 100;
  let y          = 100;
  let vx         = SPEED.walk;
  let vy         = SPEED.walk * 0.6;
  let state      = 'walk';
  let rafId      = null;
  let stateTimer = null;

  function applyState(newState) {
    if (!el) return;
    STATES.forEach(s => el.classList.remove(`state-${s}`));
    el.classList.add(`state-${newState}`);
    state = newState;

    if (newState !== 'rest') {
      const speed = SPEED[newState];
      const len   = Math.hypot(vx, vy) || 1;
      vx = (vx / len) * speed;
      vy = (vy / len) * speed;
    }

    if (onStateChange) onStateChange(state);

    const msgs = {
      walk: '슬슬 걷는 중...',
      run:  '냥! 달리는 중!',
      rest: '낮잠 자는 중... zz',
    };
    if (onLogEntry) onLogEntry(msgs[state]);

    scheduleNextState();
  }

  function scheduleNextState() {
    clearTimeout(stateTimer);
    const [min, max] = STATE_DURATION[state];
    stateTimer = setTimeout(() => {
      applyState(STATES[randInt(0, STATES.length - 1)]);
    }, randInt(min, max));
  }

  function showReaction() {
    const existing = el.querySelector('.thought-bubble');
    if (existing) existing.remove();

    const bubble = document.createElement('div');
    bubble.className  = 'thought-bubble';
    bubble.textContent = REACTIONS[randInt(0, REACTIONS.length - 1)];
    el.appendChild(bubble);
    bubble.addEventListener('animationend', () => bubble.remove(), { once: true });

    applyState('run');
    if (onLogEntry) onLogEntry('클릭에 깜짝! 도망간다~');
  }

  function tick() {
    if (state === 'rest') {
      rafId = requestAnimationFrame(tick);
      return;
    }

    const speed = SPEED[state] ?? SPEED.walk;
    const { maxX, maxY } = viewportBounds();

    x += vx;
    y += vy;

    let bounced = false;

    if (x <= MARGIN)      { x = MARGIN; vx =  Math.abs(vx); bounced = true; }
    else if (x >= maxX)   { x = maxX;   vx = -Math.abs(vx); bounced = true; }

    if (y <= MARGIN)      { y = MARGIN; vy =  Math.abs(vy); bounced = true; }
    else if (y >= maxY)   { y = maxY;   vy = -Math.abs(vy); bounced = true; }

    if (bounced) {
      const tweak = rand(-0.3, 0.3);
      const angle = Math.atan2(vy, vx) + tweak;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    }

    if (vx < 0) el.classList.add('facing-left');
    else         el.classList.remove('facing-left');

    el.style.left = `${x}px`;
    el.style.top  = `${y}px`;

    rafId = requestAnimationFrame(tick);
  }

  function init() {
    const { maxX, maxY } = viewportBounds();
    x = rand(MARGIN, maxX * 0.6);
    y = rand(MARGIN, maxY * 0.6);

    const angle = rand(0, Math.PI * 2);
    vx = Math.cos(angle) * SPEED.walk;
    vy = Math.sin(angle) * SPEED.walk;

    el.addEventListener('click', showReaction);
    applyState('walk');
    rafId = requestAnimationFrame(tick);
  }

  function destroy() {
    cancelAnimationFrame(rafId);
    clearTimeout(stateTimer);
    if (el) el.removeEventListener('click', showReaction);
  }

  return { init, destroy, getState: () => state };
}

// Backward-compatible singleton wrapper (existing main.js usage unchanged)
export const CatMovement = (() => {
  let _instance = null;
  return {
    init(el, opts) {
      _instance = createCatController(el, opts);
      _instance.init();
    },
    destroy()   { _instance?.destroy(); },
    getState()  { return _instance?.getState(); },
  };
})();
