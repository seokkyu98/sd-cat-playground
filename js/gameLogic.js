/**
 * gameLogic.js — 캣닢 생산 루프 및 가챠 확률 계산
 */

import { CONFIG } from './config.js';
import { gameState } from './state.js';

let _productionTimer = null;

/**
 * 캣닢 자동 생산 루프 시작.
 * onTick(total, produced) — 생산될 때마다 호출되는 콜백.
 */
export function startProductionLoop(onTick) {
  stopProductionLoop();

  _productionTimer = setInterval(() => {
    const produced = gameState.getProductionPer10s();
    if (produced <= 0) return;

    const total = gameState.addCatnip(produced);
    if (onTick) onTick(total, produced);
  }, CONFIG.PRODUCTION_INTERVAL);
}

export function stopProductionLoop() {
  if (_productionTimer) {
    clearInterval(_productionTimer);
    _productionTimer = null;
  }
}

/**
 * 가챠 랭크 추첨.
 * CONFIG.RANK_WEIGHTS 가중치에 따라 랭크 문자열(D~S)을 반환합니다.
 */
export function drawRank() {
  const weights = CONFIG.RANK_WEIGHTS;
  const total   = Object.values(weights).reduce((s, w) => s + w, 0);
  let roll = Math.random() * total;

  for (const [rank, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) return rank;
  }
  return 'D'; // fallback
}

/**
 * 해당 랭크의 이미지 경로를 무작위로 반환합니다.
 * 폴더 내 이미지가 여러 장이어도 RANK_IMAGES 배열만 채우면 대응됩니다.
 */
export function getRankImagePath(rank) {
  const files  = CONFIG.RANK_IMAGES[rank] ?? CONFIG.RANK_IMAGES['D'];
  const folder = CONFIG.RANK_ASSET_PATH[rank] ?? CONFIG.RANK_ASSET_PATH['D'];
  const file   = files[Math.floor(Math.random() * files.length)];
  return folder + file;
}
