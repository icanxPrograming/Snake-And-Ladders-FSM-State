export const COIN_OUTCOMES = Object.freeze({
  HEADS: "heads",
  TAILS: "tails",
});

export const DEFAULT_COIN_PROBABILITY = 0.5;

export const COIN_GOALS = Object.freeze([
  Object.freeze({
    id: "coin-1",
    goal: "Lemparkan koin sampai mendapat sisi angka sebanyak 4 kali",
    target: 4,
    targetSide: "A",
    explanation:
      "Setiap hasil sisi angka A menambah jumlah target. Hasil sisi gambar G tidak menghitung target tersebut.",
  }),
  Object.freeze({
    id: "coin-2",
    goal: "Lemparkan koin sampai mendapat sisi gambar sebanyak 4 kali",
    target: 4,
    targetSide: "G",
    explanation:
      "Setiap hasil sisi gambar G menambah jumlah target. Hasil sisi angka A tidak menghitung target tersebut.",
  }),
  Object.freeze({
    id: "coin-3",
    goal: "Lemparkan koin sampai mendapat sisi angka sebanyak 6 kali",
    target: 6,
    targetSide: "A",
    explanation:
      "Hasil A adalah satu langkah menuju tujuan. Jumlah A yang didapat akan terus dihitung sampai mencapai 6.",
  }),
  Object.freeze({
    id: "coin-4",
    goal: "Lemparkan koin sampai mendapat sisi gambar sebanyak 6 kali",
    target: 6,
    targetSide: "G",
    explanation:
      "Hasil G adalah satu langkah menuju tujuan. Jumlah G yang didapat akan terus dihitung sampai mencapai 6.",
  }),
  Object.freeze({
    id: "coin-5",
    goal: "Lemparkan koin sampai mendapat sisi angka sebanyak 8 kali",
    target: 8,
    targetSide: "A",
    explanation:
      "A akan bertambah setiap kali hasil angka muncul. Target tercapai pada hasil ke-8 A.",
  }),
  Object.freeze({
    id: "coin-6",
    goal: "Lemparkan koin sampai mendapat sisi gambar sebanyak 8 kali",
    target: 8,
    targetSide: "G",
    explanation:
      "G akan bertambah setiap kali hasil gambar muncul. Target tercapai pada hasil ke-8 G.",
  }),
  Object.freeze({
    id: "coin-7",
    goal: "Lemparkan koin sampai mendapat sisi angka sebanyak 10 kali",
    target: 10,
    targetSide: "A",
    explanation:
      "Hasil A menghitung kemajuan. Pelaksanaan berakhir ketika sudah 10 kali A diperoleh.",
  }),
  Object.freeze({
    id: "coin-8",
    goal: "Lemparkan koin sampai mendapat sisi gambar sebanyak 10 kali",
    target: 10,
    targetSide: "G",
    explanation:
      "Hasil G menghitung kemajuan. Pelaksanaan berakhir ketika sudah 10 kali G diperoleh.",
  }),
  Object.freeze({
    id: "coin-9",
    goal: "Lemparkan koin sampai mendapat sisi angka sebanyak 12 kali",
    target: 12,
    targetSide: "A",
    explanation:
      "Setiap hasil A menambah progress. Target selesai setelah 12 hasil A.",
  }),
  Object.freeze({
    id: "coin-10",
    goal: "Lemparkan koin sampai mendapat sisi gambar sebanyak 12 kali",
    target: 12,
    targetSide: "G",
    explanation:
      "Setiap hasil G menambah progress. Target selesai setelah 12 hasil G.",
  }),
]);

const COIN_DEFINITIONS = Object.freeze({
  [COIN_OUTCOMES.HEADS]: Object.freeze({
    label: "A",
    side: "A",
    description: "Kepala — sisi angka A.",
  }),
  [COIN_OUTCOMES.TAILS]: Object.freeze({
    label: "G",
    side: "G",
    description: "Gambar — sisi gambar G.",
  }),
});

export class CoinSystem {
  constructor({
    probability = DEFAULT_COIN_PROBABILITY,
    random = Math.random,
    goals = COIN_GOALS,
  } = {}) {
    this.probability = this.normalizeProbability(probability);
    this.random = random;
    this.goals = goals;
  }

  normalizeProbability(probability) {
    const value = Number(probability);
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error("Coin probability must be between 0 and 1.");
    }
    return value;
  }

  getProbability() {
    return this.probability;
  }

  startGoal() {
    const randomValue = Math.min(
      Math.max(Number(this.random()), 0),
      0.9999999999999999,
    );
    const goal = this.goals[Math.floor(randomValue * this.goals.length)];
    return {
      ...goal,
      progress: 0,
      remaining: goal.target,
      goalComplete: false,
    };
  }

  toss(goal) {
    const randomValue = Math.min(
      Math.max(Number(this.random()), 0),
      0.9999999999999999,
    );
    const outcome =
      randomValue < this.probability
        ? COIN_OUTCOMES.HEADS
        : COIN_OUTCOMES.TAILS;
    const definition = COIN_DEFINITIONS[outcome];

    if (goal) {
      if (goal.targetSide === definition.side) {
        goal.progress = Math.min(goal.target, goal.progress + 1);
      }
      goal.remaining = Math.max(0, goal.target - goal.progress);
      goal.goalComplete = goal.progress >= goal.target;
    }

    return {
      outcome,
      side: definition.side,
      label: definition.label,
      description: definition.description,
      progress: goal?.progress ?? 0,
      remaining: goal?.remaining ?? 0,
      goalComplete: Boolean(goal?.goalComplete),
      goal: goal ? { ...goal } : null,
    };
  }

  async loadGoals(path = "subgame/goals.json") {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    const data = await response.json();
    this.goals = data.map((goal) => ({ ...goal }));
    return this.goals;
  }
}
