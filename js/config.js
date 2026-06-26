/**
 * config.js — 게임 전역 상수
 * 이 파일의 값만 바꾸면 게임 밸런스 전체를 조정할 수 있습니다.
 */

export const CONFIG = Object.freeze({

  // ── 캣닢 생산 ──────────────────────────────────
  CATNIP_PER_CAT:      5,      // 고양이 한 마리가 인터벌마다 생산하는 캣닢
  PRODUCTION_INTERVAL: 10000,  // 생산 인터벌 (ms) — 10초

  // ── 가챠 ────────────────────────────────────────
  SUMMON_COST: 100,            // 소환 한 번에 필요한 캣닢

  // 랭크 가중치 (합산 100)
  RANK_WEIGHTS: Object.freeze({
    D: 30,
    C: 30,
    B: 20,
    A: 10,
    S: 10,
  }),

  // 랭크별 이미지 파일 목록 (나중에 실제 파일명으로 채워 넣으세요)
  RANK_IMAGES: Object.freeze({
    D: ['placeholder_D.png'],
    C: ['placeholder_C.png'],
    B: ['placeholder_B.png'],
    A: ['placeholder_A.png'],
    S: ['placeholder_S.png'],
  }),

  // 랭크별 이미지 폴더 경로
  RANK_ASSET_PATH: Object.freeze({
    D: 'assets/D_rank/',
    C: 'assets/C_rank/',
    B: 'assets/B_rank/',
    A: 'assets/A_rank/',
    S: 'assets/S_rank/',
  }),

});
