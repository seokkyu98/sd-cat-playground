/**
 * state.js — 전역 게임 상태
 * gameState 싱글턴을 import해서 사용합니다.
 */

import { CONFIG } from './config.js';

class GameState {
  constructor() {
    this.catnip = 0;
    this.cats   = []; // { id, element, rank, controller }
  }

  addCatnip(amount) {
    this.catnip += amount;
    return this.catnip;
  }

  spendCatnip(amount) {
    if (this.catnip < amount) return false;
    this.catnip -= amount;
    return true;
  }

  registerCat(catObj) {
    this.cats.push(catObj);
  }

  getCatCount()        { return this.cats.length; }
  getProductionPer10s() { return this.cats.length * CONFIG.CATNIP_PER_CAT; }
}

export const gameState = new GameState();
