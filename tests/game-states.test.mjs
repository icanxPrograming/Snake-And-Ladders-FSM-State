import assert from "node:assert/strict";
import test from "node:test";
import { Game } from "../core/Game.js";
import { GameContext } from "../core/GameContext.js";
import { GameState } from "../core/GameState.js";
import { MenuState } from "../states/MenuState.js";
import { PlayerSelectionState } from "../states/PlayerSelectionState.js";
import { GameSetupState } from "../states/GameSetupState.js";
import { CertificateState } from "../states/CertificateState.js";
import { GameOverState } from "../states/GameOverState.js";
import { ProbabilityStormState } from "../states/ProbabilityStormState.js";
import { QuestionResultState } from "../states/QuestionResultState.js";
import { RollingDiceState } from "../states/RollingDiceState.js";
import { MovingPlayerState } from "../states/MovingPlayerState.js";

test("menu and player setup lifecycle actions run on entry", () => {
  const entered = [];
  const context = new GameContext();
  context.actions.showMenu = () => entered.push("menu");
  context.actions.showPlayerSetup = () => entered.push("player-setup");
  const game = new Game({
    context,
    stateHandlers: {
      [GameState.MENU]: new MenuState(),
      [GameState.PLAYER_SETUP]: new PlayerSelectionState(),
    },
  });

  game.start();
  game.transition(GameState.PLAYER_SETUP);

  assert.deepEqual(entered, ["menu", "player-setup"]);
  assert.equal(context.gameStatus, GameState.PLAYER_SETUP);
});

test("setup action may complete by transitioning to playing", () => {
  const context = new GameContext();
  let game;
  context.actions.setupGame = () => game.transition(GameState.PLAYING);
  game = new Game({
    context,
    stateHandlers: {
      [GameState.GAME_SETUP]: new GameSetupState(),
    },
  });

  game.start();
  game.transition(GameState.PLAYER_SETUP);
  game.transition(GameState.GAME_SETUP);

  assert.equal(game.stateMachine.currentState, GameState.PLAYING);
  assert.equal(context.gameStatus, GameState.PLAYING);
});

test("dice and movement event payloads are delivered to state actions", () => {
  const received = [];
  const context = new GameContext();
  context.actions.rollDice = (playerNumber) => received.push(playerNumber);
  context.actions.movePlayer = (event) => received.push(event);
  const game = new Game({
    context,
    stateHandlers: {
      [GameState.ROLLING_DICE]: new RollingDiceState(),
      [GameState.MOVING_PLAYER]: new MovingPlayerState(),
    },
  });

  game.start();
  game.transition(GameState.PLAYER_SETUP);
  game.transition(GameState.GAME_SETUP);
  game.transition(GameState.PLAYING);
  game.transition(GameState.ROLLING_DICE, { playerNumber: 3 });
  game.transition(GameState.MOVING_PLAYER, {
    kind: "move",
    playerNumber: 3,
    value: 4,
    isBonusMove: false,
  });

  assert.equal(received[0], 3);
  assert.deepEqual(received[1], {
    kind: "move",
    playerNumber: 3,
    value: 4,
    isBonusMove: false,
  });
});

test("storm result and game finish payloads reach their state actions", () => {
  const received = [];
  const context = new GameContext();
  context.actions.beginProbabilityStorm = () => received.push("storm");
  context.actions.showQuestionResult = (result) => received.push(result);
  context.actions.onGameOver = (winner) => received.push(winner);
  context.actions.showCertificate = (winner) =>
    received.push(`certificate:${winner}`);
  const game = new Game({
    context,
    stateHandlers: {
      [GameState.PROBABILITY_STORM]: new ProbabilityStormState(),
      [GameState.QUESTION_RESULT]: new QuestionResultState(),
      [GameState.GAME_OVER]: new GameOverState(),
      [GameState.CERTIFICATE]: new CertificateState(),
    },
  });

  game.start();
  game.transition(GameState.PLAYER_SETUP);
  game.transition(GameState.GAME_SETUP);
  game.transition(GameState.PLAYING);
  game.transition(GameState.PROBABILITY_STORM);
  game.transition(GameState.QUESTION_RESULT, {
    correct: true,
    message: "Jawaban benar!",
  });
  game.transition(GameState.GAME_OVER, { winner: "Ari" });
  game.transition(GameState.CERTIFICATE, { winner: "Ari" });

  assert.deepEqual(received, [
    "storm",
    { correct: true, message: "Jawaban benar!" },
    "Ari",
    "certificate:Ari",
  ]);
});

test("resuming Probability Storm presents the next player without restarting the event", () => {
  let startCount = 0;
  let nextPlayerPresentationCount = 0;
  const context = new GameContext();
  context.actions.beginProbabilityStorm = () => startCount++;
  context.actions.presentNextStormPlayer = () => nextPlayerPresentationCount++;
  const game = new Game({
    context,
    stateHandlers: {
      [GameState.PROBABILITY_STORM]: new ProbabilityStormState(),
    },
  });

  game.start();
  game.transition(GameState.PLAYER_SETUP);
  game.transition(GameState.GAME_SETUP);
  game.transition(GameState.PLAYING);
  game.transition(GameState.PROBABILITY_STORM);
  game.transition(GameState.QUESTION_RESULT, {
    correct: false,
    message: "Jawaban salah!",
  });
  game.transition(GameState.PROBABILITY_STORM, { resume: true });

  assert.equal(startCount, 1);
  assert.equal(nextPlayerPresentationCount, 1);
});
