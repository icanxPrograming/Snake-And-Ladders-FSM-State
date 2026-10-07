export const CARD_CATEGORIES = Object.freeze({
  FORTUNE: "fortune",
  PENALTY: "penalty",
  GAME: "game",
});

export const DEFAULT_CARD_PROBABILITIES = Object.freeze({
  [CARD_CATEGORIES.FORTUNE]: 1 / 3,
  [CARD_CATEGORIES.PENALTY]: 1 / 3,
  [CARD_CATEGORIES.GAME]: 1 / 3,
});

const CARD_DEFINITIONS = Object.freeze({
  [CARD_CATEGORIES.FORTUNE]: Object.freeze({
    name: "Kartu Keberuntungan",
    description: "Kamu mendapatkan kesempatan untuk maju sesuai nomor dadu.",
    effect: Object.freeze({ type: "move", value: 3 }),
  }),
  [CARD_CATEGORIES.PENALTY]: Object.freeze({
    name: "Kartu Hukuman",
    description:
      "Turn ini tidak memberikan gerakan. Efek hanya berlaku untuk turn tersebut.",
    effect: Object.freeze({ type: "skip", value: 0 }),
  }),
  [CARD_CATEGORIES.GAME]: Object.freeze({
    name: "Kartu Permainan",
    description: "Kamu membuka aktivitas probabilistik dengan koin.",
    effect: Object.freeze({ type: "coin", value: null }),
  }),
});

export class CardSystem {
  constructor({
    probabilities = DEFAULT_CARD_PROBABILITIES,
    random = Math.random,
  } = {}) {
    this.probabilities = this.normalizeProbabilities(probabilities);
    this.random = random;
    this.nextCardId = 0;
  }

  normalizeProbabilities(probabilities) {
    const categories = Object.values(CARD_CATEGORIES);
    if (
      !probabilities ||
      categories.some((category) => !(category in probabilities))
    ) {
      throw new Error(
        "Card probabilities must define all three card categories.",
      );
    }

    const values = categories.map((category) =>
      Number(probabilities[category]),
    );
    if (values.some((value) => !Number.isFinite(value) || value < 0)) {
      throw new Error(
        "Card probabilities must be finite, non-negative numbers.",
      );
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    if (Math.abs(total - 1) > Number.EPSILON) {
      throw new Error("Card probabilities must sum to 1.");
    }

    return Object.fromEntries(
      categories.map((category, index) => [category, values[index]]),
    );
  }

  getTotalProbability() {
    return Object.values(this.probabilities).reduce(
      (sum, value) => sum + value,
      0,
    );
  }

  draw() {
    const randomValue = Math.min(
      Math.max(Number(this.random()), 0),
      0.9999999999999999,
    );
    const categories = Object.values(CARD_CATEGORIES);
    let cumulative = 0;

    for (const category of categories) {
      cumulative += this.probabilities[category];
      if (randomValue < cumulative) {
        const definition = CARD_DEFINITIONS[category];
        return this.createCard(category, definition);
      }
    }

    const fallbackCategory = categories[categories.length - 1];
    const definition = CARD_DEFINITIONS[fallbackCategory];
    return this.createCard(fallbackCategory, definition);
  }

  createCard(category, definition) {
    this.nextCardId += 1;
    return {
      id: `${category}-${this.nextCardId}`,
      category,
      name: definition.name,
      description: definition.description,
      effect: { ...definition.effect },
      isHidden: true,
    };
  }

  revealCard(card) {
    return {
      ...card,
      isHidden: false,
    };
  }

  drawDeck(count = 3) {
    const deck = [];
    const selectedCategories = new Set();
    let attempts = 0;

    while (deck.length < count) {
      const card = this.draw();
      attempts += 1;

      if (!selectedCategories.has(card.category)) {
        selectedCategories.add(card.category);
        deck.push(card);
      }

      if (attempts > count * 100) {
        throw new Error(
          "Unable to create a deck containing every card category.",
        );
      }
    }
    return deck;
  }

  resolveEffect(card, currentPosition = 0, diceValue = 0) {
    const effect = card?.effect;
    if (!effect) {
      return { card, movement: 0, action: "none" };
    }

    if (effect.type === "move") {
      return {
        card,
        movement: Number.isFinite(Number(diceValue))
          ? Math.max(0, Math.floor(Number(diceValue)))
          : 0,
        action: "move",
      };
    }

    if (effect.type === "skip") {
      return { card, movement: 0, action: "skip" };
    }

    if (effect.type === "coin") {
      return { card, movement: 0, action: "coin", currentPosition };
    }

    return { card, movement: 0, action: "none" };
  }
}
