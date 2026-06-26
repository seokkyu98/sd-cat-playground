/**
 * uiManager.js — UI 갱신, 렌더링, 이펙트 담당
 * 모든 DOM 조작은 이 모듈을 통해 이루어집니다.
 */

import { CONFIG } from './config.js';

const LOG_MAX = 20;

const STATE_LABELS = {
  walk: '🐾 산책 중',
  run:  '💨 달리는 중',
  rest: '😴 쉬는 중',
};

const RANK_LABELS = {
  D: 'D 랭크',
  C: 'C 랭크',
  B: 'B 랭크',
  A: 'A 랭크',
  S: '✨ S 랭크',
};

/* ── 캣닢 & 생산량 표시 ─────────────────────────── */

export function updateCatnipDisplay(total, ratePer10s) {
  const countEl = document.getElementById('catnip-count');
  const rateEl  = document.getElementById('catnip-rate');

  if (countEl) {
    countEl.textContent = total.toLocaleString();
    countEl.classList.remove('catnip-pop');
    void countEl.offsetWidth;
    countEl.classList.add('catnip-pop');
  }
  if (rateEl) rateEl.textContent = `+${ratePer10s} / 10초`;
}

export function updateCatCount(count) {
  const el = document.getElementById('cat-count');
  if (el) el.textContent = count;
}

/* ── 소환 버튼 활성/비활성 ───────────────────────── */

export function updateSummonButton(catnip) {
  const btn = document.getElementById('btn-summon');
  if (!btn) return;
  const canAfford = catnip >= CONFIG.SUMMON_COST;
  btn.disabled = !canAfford;
  btn.title    = canAfford
    ? '고양이를 소환합니다!'
    : `캣닢이 부족합니다 (${CONFIG.SUMMON_COST}개 필요)`;
}

/* ── 고양이 상태 텍스트 ─────────────────────────── */

export function updateStatusText(state) {
  const el = document.getElementById('status-text');
  if (el) el.textContent = STATE_LABELS[state] ?? state;
}

/* ── 활동 로그 ──────────────────────────────────── */

export function addLogEntry(message) {
  const log = document.getElementById('activity-log');
  if (!log) return;

  const li   = document.createElement('li');
  const time = new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  li.innerHTML = `<span class="log-time">${time}</span>${message}`;
  log.prepend(li);

  while (log.children.length > LOG_MAX) log.removeChild(log.lastChild);
}

/* ── 소환된 고양이 DOM 요소 생성 ────────────────── */

export function createCatElement(rank, imagePath) {
  const wrapper = document.createElement('div');
  wrapper.className = 'cat-image-character cat-summoned';
  wrapper.dataset.rank = rank;
  wrapper.setAttribute('role', 'img');
  wrapper.setAttribute('aria-label', `${rank} 랭크 고양이`);

  // 랭크 뱃지
  const badge = document.createElement('div');
  badge.className  = `cat-rank-badge rank-badge--${rank.toLowerCase()}`;
  badge.textContent = rank;
  wrapper.appendChild(badge);

  // 방향 전환 레이어 (scaleX)
  const flip = document.createElement('div');
  flip.className = 'cat-image-flip';

  // 바운스 레이어 (translateY)
  const bounce = document.createElement('div');
  bounce.className = 'cat-image-bounce';

  // 이미지 — 로드 실패 시 랭크 색상 플레이스홀더로 대체
  const img = document.createElement('img');
  img.alt    = '';
  img.width  = 80;
  img.height = 80;
  img.onerror = function () {
    this.style.display = 'none';
    bounce.classList.add('cat-img-fallback', `fallback-${rank.toLowerCase()}`);
  };
  // onerror 등록 후 src 설정 (일부 브라우저 타이밍 대응)
  img.src = imagePath;

  bounce.appendChild(img);
  flip.appendChild(bounce);
  wrapper.appendChild(flip);

  // 스폰 애니메이션 종료 후 클래스 제거 (transform 간섭 방지)
  wrapper.addEventListener('animationend', () => {
    wrapper.classList.remove('cat-summoned');
  }, { once: true });

  return wrapper;
}

/* ── 소환 오버레이 (랭크 연출) ──────────────────── */

export function showSummonOverlay(rank) {
  const overlay = document.createElement('div');
  overlay.className = `summon-overlay rank-overlay--${rank.toLowerCase()}`;
  overlay.setAttribute('aria-live', 'assertive');
  overlay.setAttribute('aria-label', `${RANK_LABELS[rank]} 고양이 소환!`);

  const content = document.createElement('div');
  content.className = 'summon-overlay__content';

  const rankEl = document.createElement('div');
  rankEl.className  = 'summon-overlay__rank';
  rankEl.textContent = rank;

  const textEl = document.createElement('div');
  textEl.className  = 'summon-overlay__text';
  textEl.textContent = `${RANK_LABELS[rank]} 고양이 등장!`;

  content.appendChild(rankEl);
  content.appendChild(textEl);
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  overlay.addEventListener('animationend', () => {
    if (overlay.parentNode) overlay.remove();
  }, { once: true });
}
