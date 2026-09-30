import assert from "node:assert/strict";
import test from "node:test";
import { DiceSystem } from "../systems/DiceSystem.js";
import { MovementSystem } from "../systems/MovementSystem.js";
import { PlayerSystem } from "../systems/PlayerSystem.js";
import { QuestionSystem } from "../systems/QuestionSystem.js";
import { ScoreSystem } from "../systems/ScoreSystem.js";
import { TurnSystem } from "../systems/TurnSystem.js";
import { WinConditionSystem } from "../systems/WinConditionSystem.js";

test("player reset preserves identity and clears game statistics", () => {
  const playerSystem = new PlayerSystem();
  const player = playerSystem.createPlayer("Ari", 3);
  player.score = 42;
  player.stats.correct = 4;

  playerSystem.reset(player);

  assert.equal(player.name, "Ari");
  assert.equal(player.image, 3);
  assert.equal(player.score, 0);
  assert.equal(player.stats.correct, 0);
  assert.equal(player.stats.stormWins, 0);
});

test("dice values and turn rotation retain their current bounds", () => {
  const diceSystem = new DiceSystem();
  const turnSystem = new TurnSystem();

  assert.equal(
    diceSystem.roll([1, 2, 3, 4, 5, 6], () => 0),
    1,
  );
  assert.equal(
    diceSystem.roll([1, 2, 3, 4, 5, 6], () => 0.999),
    6,
  );
  assert.equal(turnSystem.nextPlayer(4, 4), 1);
  assert.equal(turnSystem.nextPlayer(2, 4), 3);
});

test("movement preserves finish bounce and tile precedence", () => {
  const movementSystem = new MovementSystem();
  const tiles = {
    easy: [8],
    standard: [8],
    hard: [],
    mystery: [],
  };

  assert.deepEqual(movementSystem.calculateDestination(97, 5), {
    targetPosition: 102,
    isBouncing: true,
    finalPosition: 98,
  });
  assert.equal(movementSystem.calculateDestination(1, -3).finalPosition, 0);
  assert.equal(movementSystem.getTileDifficulty(8, tiles), "easy");
  assert.equal(movementSystem.getTileDifficulty(9, tiles), null);
});

test("question evaluation keeps choice, math, and invalid-answer behavior", () => {
  const questionSystem = new QuestionSystem();

  assert.deepEqual(
    questionSystem.evaluateAnswer({ type: "multiple_choice", answer: 1 }, 1),
    { correct: true, message: "Jawaban benar!" },
  );
  assert.equal(
    questionSystem.evaluateAnswer(
      { type: "essay", input_type: "math", answer: "1/2" },
      "1/2",
    ).correct,
    true,
  );
  assert.deepEqual(questionSystem.evaluateAnswer(null, ""), {
    correct: false,
    message: "Soal tidak valid",
  });
});

test("scores update streaks and the win system recognizes tile 100", () => {
  const playerSystem = new PlayerSystem();
  const scoreSystem = new ScoreSystem();
  const winConditionSystem = new WinConditionSystem();
  const player = playerSystem.createPlayer("Dewi", 1);

  scoreSystem.recordMove(player);
  scoreSystem.recordAnswer(player, { tileType: "mystery" }, true);
  scoreSystem.recordAnswer(player, {}, true);
  scoreSystem.recordAnswer(player, {}, false);
  scoreSystem.recordLadder(player);
  scoreSystem.recordSnake(player);
  scoreSystem.recordStormWin(player);

  assert.equal(player.stats.correct, 2);
  assert.equal(player.stats.wrong, 1);
  assert.equal(player.stats.currentStreak, 0);
  assert.equal(player.stats.maxStreak, 2);
  assert.equal(player.stats.totalMoves, 1);
  assert.equal(player.stats.mysterySolved, 1);
  assert.equal(player.stats.ladders, 1);
  assert.equal(player.stats.snakes, 1);
  assert.equal(player.stats.stormWins, 1);
  player.score = 100;
  assert.equal(winConditionSystem.hasWon(player), true);
});

test("timed-out questions count as wrong and break the current streak", () => {
  const player = new PlayerSystem().createPlayer("Nia", 2);
  const scoreSystem = new ScoreSystem();
  player.stats.currentStreak = 4;
  player.stats.maxStreak = 4;

  scoreSystem.recordTimeout(player, { tileType: "mystery" });

  assert.equal(player.stats.wrong, 1);
  assert.equal(player.stats.currentStreak, 0);
  assert.equal(player.stats.maxStreak, 4);
  assert.equal(player.stats.mysterySolved, 0);
});
