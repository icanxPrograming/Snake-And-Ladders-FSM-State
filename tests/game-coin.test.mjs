import assert from "node:assert/strict";
import test from "node:test";
import { Game } from "../core/Game.js";
import { GameContext } from "../core/GameContext.js";
import { GameState } from "../core/GameState.js";
import { CoinSystem, COIN_OUTCOMES } from "../systems/CoinSystem.js";
import { CardDrawState } from "../states/CardDrawState.js";
import { CardResultState } from "../states/CardResultState.js";
import { CoinDrawState } from "../states/CoinDrawState.js";
import { CoinResultState } from "../states/CoinResultState.js";

test("coin toss is deterministic and returns a valid outcome", () => {
  const coinSystem = new CoinSystem({ random: () => 0.1 });

  const result = coinSystem.toss();
  assert.equal(result.outcome, COIN_OUTCOMES.HEADS);
  assert.equal(result.side, "A");
  assert.equal(result.description.includes("angka A"), true);
  assert.equal(result.progress, 0);
});

test("coin toss supports a deterministic tails outcome", () => {
  const coinSystem = new CoinSystem({ random: () => 0.9 });

  const result = coinSystem.toss();
  assert.equal(result.outcome, COIN_OUTCOMES.TAILS);
  assert.equal(result.side, "G");
  assert.equal(result.description.includes("gambar G"), true);
});

test("coin outcomes do not mutate the system configuration", () => {
  const coinSystem = new CoinSystem({ probability: 0.5 });
  coinSystem.toss();

  assert.equal(coinSystem.probability, 0.5);
  assert.equal(coinSystem.getProbability(), 0.5);
});

test("coin draw and result states deliver coin events", () => {
  const received = [];
  const context = new GameContext();
  context.actions.presentCard = (event) =>
    received.push(`card:${event.outcome}`);
  context.actions.presentCardResult = (event) =>
    received.push(`card-result:${event.outcome}`);
  context.actions.presentCoin = (event) =>
    received.push(`coin:${event.outcome}`);
  context.actions.presentCoinResult = (event) =>
    received.push(`coin-result:${event.outcome}`);
  const game = new Game({
    context,
    stateHandlers: {
      [GameState.CARD_DRAW]: new CardDrawState(),
      [GameState.CARD_RESULT]: new CardResultState(),
      [GameState.COIN_DRAW]: new CoinDrawState(),
      [GameState.COIN_RESULT]: new CoinResultState(),
    },
  });

  game.start();
  game.transition(GameState.PLAYER_SETUP);
  game.transition(GameState.GAME_SETUP);
  game.transition(GameState.PLAYING);
  game.transition(GameState.ROLLING_DICE, { playerNumber: 1 });
  game.transition(GameState.CARD_DRAW, { outcome: COIN_OUTCOMES.HEADS });
  game.transition(GameState.CARD_RESULT, { outcome: COIN_OUTCOMES.HEADS });
  game.transition(GameState.COIN_DRAW, { outcome: COIN_OUTCOMES.HEADS });
  game.transition(GameState.COIN_RESULT, { outcome: COIN_OUTCOMES.HEADS });

  assert.deepEqual(received, [
    "card:heads",
    "card-result:heads",
    "coin:heads",
    "coin-result:heads",
  ]);
  assert.equal(context.gameStatus, GameState.COIN_RESULT);
});
