/**
 * cat-movement.js
 * Handles all cat position, velocity, state machine, and collision logic.
 * Exported as CatMovement module.
 */

export const CatMovement = (() => {
  /* ---- Config ---- */
  const CAT_SIZE   = 80;   // px
  const MARGIN     = 10;   // px from viewport edge

  const SPEED = { walk: 1.4, run: 3.2 };

  const STATE_DURATION = {
    walk: [3000,  7000],
    run:  [1500,  4000],
    rest: [2000,  5000],
  };

  const STATES = ['walk', 'run', 'rest'];

  const REACTIONS = [
    'にゃ～ん♪', '꾹!', '냐옹~', 'zZz...', '뭐야?!',
    '배고파', '같이 놀자!', '*골골*', '훗!', '냐냐냐!',
  ];

  /* ---- State ---- */
  let el        = null;
  let x         = 100;
  let y         = 100;
  let vx        = SPEED.walk;
  let vy        = SPEED.walk * 0.6;
  let state     = 'walk';
  let rafId     = null;
  let stateTimer = null;
  let onStateChange = null;  // callback(state)
  let onLogEntry    = null;  // callback(message)

  /* ---- Helpers ---- */
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  function viewportBounds() {
    return {
      maxX: window.innerWidth  - CAT_SIZE - MARGIN,
      maxY: window.innerHeight - CAT_SIZE - MARGIN,
    };
  }

  function applyState(newState) {
    if (!el) return;
    STATES.forEach(s => el.classList.remove(`state-${s}`));
    el.classList.add(`state-${newState}`);
    state = newState;

    // Rescale velocity to match new state speed
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
    const delay = randInt(min, max);
    stateTimer = setTimeout(() => {
      const next = STATES[randInt(0, STATES.length - 1)];
      applyState(next);
    }, delay);
  }

  function chooseRandomVelocity(currentSpeed) {
    const angle = rand(0, Math.PI * 2);
    return {
      vx: Math.cos(angle) * currentSpeed,
      vy: Math.sin(angle) * currentSpeed,
    };
  }

  /* ---- Click reaction ---- */
  function showReaction() {
    const existing = el.querySelector('.thought-bubble');
    if (existing) existing.remove();

    const bubble = document.createElement('div');
    bubble.className = 'thought-bubble';
    bubble.textContent = REACTIONS[randInt(0, REACTIONS.length - 1)];
    el.appendChild(bubble);

    bubble.addEventListener('animationend', () => bubble.remove(), { once: true });

    // Briefly switch to run after click
    applyState('run');
    if (onLogEntry) onLogEntry('클릭에 깜짝! 도망간다~');
  }

  /* ---- Animation loop ---- */
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

    if (x <= MARGIN) {
      x = MARGIN;
      vx = Math.abs(vx);
      bounced = true;
    } else if (x >= maxX) {
      x = maxX;
      vx = -Math.abs(vx);
      bounced = true;
    }

    if (y <= MARGIN) {
      y = MARGIN;
      vy = Math.abs(vy);
      bounced = true;
    } else if (y >= maxY) {
      y = maxY;
      vy = -Math.abs(vy);
      bounced = true;
    }

    if (bounced) {
      // Small random angle tweak on bounce to prevent ping-pong loops
      const tweak = rand(-0.3, 0.3);
      const len   = Math.hypot(vx, vy);
      const angle = Math.atan2(vy, vx) + tweak;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    }

    // Facing direction
    if (vx < 0) {
      el.classList.add('facing-left');
    } else {
      el.classList.remove('facing-left');
    }

    el.style.left = `${x}px`;
    el.style.top  = `${y}px`;

    rafId = requestAnimationFrame(tick);
  }

  /* ---- Public API ---- */
  function init(catElement, { onStateChange: osc, onLogEntry: ole } = {}) {
    el = catElement;
    onStateChange = osc;
    onLogEntry    = ole;

    // Start at random position
    const { maxX, maxY } = viewportBounds();
    x = rand(MARGIN, maxX * 0.6);
    y = rand(MARGIN, maxY * 0.6);

    const initialVel = chooseRandomVelocity(SPEED.walk);
    vx = initialVel.vx;
    vy = initialVel.vy;

    el.addEventListener('click', showReaction);

    applyState('walk');
    rafId = requestAnimationFrame(tick);
  }

  function destroy() {
    cancelAnimationFrame(rafId);
    clearTimeout(stateTimer);
    if (el) el.removeEventListener('click', showReaction);
  }

  function getState() { return state; }

  return { init, destroy, getState };
})();
