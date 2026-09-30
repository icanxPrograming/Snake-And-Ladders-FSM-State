export class DiceSystem {
  roll(diceValues, random = Math.random) {
    return diceValues[Math.floor(random() * diceValues.length)];
  }
}
