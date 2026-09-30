import { GameState } from "./GameState.js";

export class GameContext {
  constructor(data = {}) {
    this.data = data;
    this.actions = {};
    this.event = null;
    this.gameStatus = GameState.BOOT;
  }
}
