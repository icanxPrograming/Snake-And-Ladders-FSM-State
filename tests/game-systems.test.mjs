import assert from "node:assert/strict";
import test from "node:test";
import { DiceSystem } from "../systems/DiceSystem.js";
import { MovementSystem } from "../systems/MovementSystem.js";
import { PlayerSystem } from "../systems/PlayerSystem.js";
import { QuestionSystem } from "../systems/QuestionSystem.js";
import { ScoreSystem } from "../systems/ScoreSystem.js";
import { TurnSystem } from "../systems/TurnSystem.js";
import { WinConditionSystem } from "../systems/WinConditionSystem.js";
import { CardSystem, CARD_CATEGORIES } from "../systems/CardSystem.js";
import {
  CoinSystem,
  COIN_GOALS,
  COIN_OUTCOMES,
} from "../systems/CoinSystem.js";

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

test("post-move resolution follows the requested tile and source rules", () => {
  const movementSystem = new MovementSystem();
  const specialTiles = {
    easy: [12],
    standard: [20, 25],
    hard: [30],
    mystery: [40],
  };
  const ladders = [
    [8, 18],
    [25, 35],
  ];
  const snakes = [
    [14, 4],
    [28, 8],
  ];

  assert.deepEqual(
    movementSystem.resolvePostMove({
      position: 12,
      source: "question",
      specialTiles,
      ladders,
      snakes,
    }),
    { action: "turn", tileType: "easy" },
  );
  assert.deepEqual(
    movementSystem.resolvePostMove({
      position: 20,
      source: "question",
      specialTiles,
      ladders,
      snakes,
    }),
    { action: "turn", tileType: "standard" },
  );
  assert.deepEqual(
    movementSystem.resolvePostMove({
      position: 8,
      source: "question",
      specialTiles,
      ladders,
      snakes,
    }),
    { action: "ladder", index: 0 },
  );
  assert.deepEqual(
    movementSystem.resolvePostMove({
      position: 25,
      source: "dice",
      specialTiles,
      ladders,
      snakes,
    }),
    { action: "guardian", index: 1, tileType: "standard" },
  );
  assert.deepEqual(
    movementSystem.resolvePostMove({
      position: 40,
      source: "mysteryBonus",
      specialTiles,
      ladders,
      snakes,
    }),
    { action: "turn", tileType: "mystery" },
  );
  assert.deepEqual(
    movementSystem.resolvePostMove({
      position: 40,
      source: "storm",
      specialTiles,
      ladders,
      snakes,
    }),
    { action: "question", tileType: "mystery" },
  );
  assert.deepEqual(
    movementSystem.resolvePostMove({
      position: 9,
      source: "storm",
      specialTiles,
      ladders,
      snakes,
    }),
    { action: "turn", tileType: null },
  );
});

test("question evaluation keeps choice, math, and invalid-answer behavior", () => {
  const questionSystem = new QuestionSystem();

  assert.deepEqual(
    questionSystem.evaluateAnswer({ type: "multiple_choice", answer: 1 }, 1),
    {
      correct: true,
      message: "Jawaban benar!",
      explanation: "Jawaban sesuai dengan aturan yang diberikan.",
    },
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
    explanation: "Soal tidak valid. Periksa kembali pertanyaan yang diminta.",
  });
});

test("learning feedback explains both correct and incorrect answers", () => {
  const questionSystem = new QuestionSystem();
  const question = {
    id: "M-MC-02",
    type: "multiple_choice",
    answer: 0,
    explanation: "Peluang minimal satu gambar dari dua koin adalah 3/4.",
  };

  assert.equal(
    questionSystem.evaluateAnswer(question, 0).explanation,
    question.explanation,
  );
  assert.equal(
    questionSystem.evaluateAnswer(question, 1).explanation,
    "Jawaban salah. Peluang minimal satu gambar dari dua koin adalah 3/4.",
  );
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

test("card probability configuration is valid and uses the configured weights", () => {
  const cardSystem = new CardSystem({
    probabilities: {
      [CARD_CATEGORIES.FORTUNE]: 0.5,
      [CARD_CATEGORIES.PENALTY]: 0.25,
      [CARD_CATEGORIES.GAME]: 0.25,
    },
    random: () => 0.49,
  });

  assert.equal(cardSystem.draw().category, CARD_CATEGORIES.FORTUNE);
  assert.equal(cardSystem.getTotalProbability(), 1);
});

test("card draw is deterministic and returns a valid card definition", () => {
  const cardSystem = new CardSystem({ random: () => 0.999 });
  const card = cardSystem.draw();

  assert.equal(card.category, CARD_CATEGORIES.GAME);
  assert.equal(card.effect.type, "coin");
  assert.ok(card.name);
  assert.ok(card.description);
});

test("card effects are resolved without mutating the card definition", () => {
  const cardSystem = new CardSystem({ random: () => 0 });
  const fortune = cardSystem.draw();
  const penalty = new CardSystem({ random: () => 0.34 }).draw();
  const game = new CardSystem({ random: () => 0.68 }).draw();

  assert.equal(fortune.effect.type, "move");
  assert.equal(penalty.effect.type, "skip");
  assert.equal(game.effect.type, "coin");
  assert.deepEqual(cardSystem.resolveEffect(fortune, 12, 4), {
    card: fortune,
    movement: 4,
    action: "move",
  });
  assert.deepEqual(cardSystem.resolveEffect(penalty, 12, 4), {
    card: penalty,
    movement: 0,
    action: "skip",
  });
  assert.equal(cardSystem.resolveEffect(game, 12, 4).action, "coin");
  assert.equal(fortune.effect.value, 3);
});

test("card deck contains three unique cards in a fresh randomized order", () => {
  const values = [0, 0.2, 0.4, 0.6, 0.8];
  let index = 0;
  const cardSystem = new CardSystem({
    random: () => values[index++ % values.length],
  });

  const deck = cardSystem.drawDeck(3);

  assert.equal(deck.length, 3);
  assert.equal(new Set(deck.map((card) => card.id)).size, 3);
  assert.equal(
    deck.every((card) => card.isHidden),
    true,
  );
  assert.deepEqual(
    new Set(deck.map((card) => card.category)),
    new Set(["fortune", "penalty", "game"]),
  );
});

test("invalid card probability configuration is rejected", () => {
  assert.throws(
    () => new CardSystem({ probabilities: { fortune: 0.2, penalty: 0.2 } }),
    /probabilities/i,
  );
});

test("coin system tracks A and G counts until the JSON goal is complete", () => {
  const values = [0, 0, 0, 0];
  let index = 0;
  const coinSystem = new CoinSystem({
    random: () => values[index++] ?? 0,
    goals: [
      {
        id: "coin-test",
        goal: "Lemparkan koin sampai mendapat sisi angka sebanyak 4 kali",
        target: 4,
        targetSide: "A",
        explanation: "Hitung setiap hasil angka A.",
      },
    ],
  });
  const goal = coinSystem.startGoal();

  assert.equal(COIN_GOALS.length, 10);
  assert.equal(new Set(COIN_GOALS.map((item) => item.id)).size, 10);
  assert.equal(goal.target, 4);
  assert.equal(goal.progress, 0);
  assert.equal(goal.remaining, 4);
  assert.ok(goal.explanation.length > 10);

  const first = coinSystem.toss(goal);
  const second = coinSystem.toss(goal);
  const third = coinSystem.toss(goal);
  const fourth = coinSystem.toss(goal);

  assert.equal(first.outcome, COIN_OUTCOMES.HEADS);
  assert.equal(first.goalComplete, false);
  assert.equal(fourth.goalComplete, true);
  assert.equal(fourth.progress, 4);
  assert.equal(fourth.remaining, 0);
  assert.equal(second.progress, 2);
  assert.equal(third.progress, 3);
  assert.equal(fourth.progress, 4);
});
