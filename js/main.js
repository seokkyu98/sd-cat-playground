/**
 * main.js — 앱 엔트리포인트
 * 모듈을 조립하고 고양이를 초기화합니다.
 */

import { CatMovement, createCatController } from './cat-movement.js';
import { gameState }                         from './state.js';
import { startProductionLoop, drawRank, getRankImagePath } from './gameLogic.js';
import {
  updateCatnipDisplay,
  updateCatCount,
  updateSummonButton,
  updateStatusText,
  addLogEntry,
  createCatElement,
  showSummonOverlay,
} from './uiManager.js';
import { CONFIG } from './config.js';

document.addEventListener('DOMContentLoaded', () => {

  // ── CSS 고양이 ────────────────────────────────────
  const cat = document.getElementById('cat-character');
  if (cat) {
    CatMovement.init(cat, {
      onStateChange: updateStatusText,
      onLogEntry:    addLogEntry,
    });
    gameState.registerCat({ id: 'css-cat', element: cat, rank: 'default' });
    addLogEntry('냥이가 등장했다!');
  }

  // ── 이미지 고양이 (cat_sd_sample_clean.png) ───────
  const imgCat = document.getElementById('cat-sd-sample');
  if (imgCat) {
    const ctrl = createCatController(imgCat, { onLogEntry: addLogEntry });
    ctrl.init();
    gameState.registerCat({ id: 'img-cat', element: imgCat, rank: 'default' });
    addLogEntry('새로운 냥이가 나타났다! 🐱');
  }

  // ── UI 초기 렌더링 ────────────────────────────────
  updateCatCount(gameState.getCatCount());
  updateCatnipDisplay(gameState.catnip, gameState.getProductionPer10s());
  updateSummonButton(gameState.catnip);

  // ── 캣닢 자동 생산 루프 ───────────────────────────
  startProductionLoop((total, produced) => {
    updateCatnipDisplay(total, gameState.getProductionPer10s());
    updateSummonButton(total);
    addLogEntry(`🌿 캣닢 +${produced}개 획득! (총 ${total.toLocaleString()}개)`);
  });

  // ── 가챠 소환 버튼 ────────────────────────────────
  const btnSummon = document.getElementById('btn-summon');
  if (btnSummon) {
    btnSummon.addEventListener('click', () => {
      // 캣닢 부족 체크 (UI 방어 + 로직 방어 이중)
      if (!gameState.spendCatnip(CONFIG.SUMMON_COST)) {
        addLogEntry(`⚠️ 캣닢이 부족합니다. (${CONFIG.SUMMON_COST}개 필요)`);
        return;
      }

      // 랭크 추첨 및 이미지 경로 결정
      const rank      = drawRank();
      const imagePath = getRankImagePath(rank);

      // DOM 요소 생성 및 추가
      const catEl = createCatElement(rank, imagePath);
      document.body.appendChild(catEl);

      // 이동 컨트롤러 시작
      const ctrl = createCatController(catEl, { onLogEntry: addLogEntry });
      ctrl.init();

      // 게임 상태 등록
      gameState.registerCat({
        id:         `cat-${Date.now()}`,
        element:    catEl,
        rank,
        controller: ctrl,
      });

      // UI 갱신
      updateCatnipDisplay(gameState.catnip, gameState.getProductionPer10s());
      updateCatCount(gameState.getCatCount());
      updateSummonButton(gameState.catnip);

      // 소환 연출
      showSummonOverlay(rank);
      addLogEntry(`🎲 ${rank} 랭크 고양이 소환! (잔여 캣닢: ${gameState.catnip.toLocaleString()}개)`);
    });
  }

});
