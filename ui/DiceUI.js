const DICE_ICONS = [
  "fa-dice-one",
  "fa-dice-two",
  "fa-dice-three",
  "fa-dice-four",
  "fa-dice-five",
  "fa-dice-six",
];

export class DiceUI {
  setTurn(playerNumber) {
    for (let index = 1; index <= 4; index++) {
      const dice = document.getElementById(`dice${index}`);
      if (dice) dice.style.opacity = index === playerNumber ? "1" : "0.3";
    }
  }

  disableAll() {
    for (let index = 1; index <= 4; index++) {
      const dice = document.getElementById(`dice${index}`);
      if (!dice) continue;
      dice.classList.add("disabled");
      dice.style.cursor = "not-allowed";
      dice.style.pointerEvents = "none";
      dice.style.opacity = "0.3";
    }
  }

  enablePlayer(playerNumber) {
    for (let index = 1; index <= 4; index++) {
      const dice = document.getElementById(`dice${index}`);
      if (!dice) continue;

      const isCurrent = index === playerNumber;
      dice.classList.toggle("disabled", !isCurrent);
      dice.style.cursor = isCurrent ? "pointer" : "not-allowed";
      dice.style.pointerEvents = isCurrent ? "auto" : "none";
      dice.style.opacity = isCurrent ? "1" : "0.3";
    }
  }

  startRoll(playerNumber) {
    document
      .getElementById(`dice${playerNumber}`)
      ?.classList.add("dice-rolling");
  }

  showRoll(playerNumber, value) {
    const dice = document.getElementById(`dice${playerNumber}`);
    if (!dice) return;
    dice.innerHTML = `<i class="diceImg fas ${DICE_ICONS[value - 1]}"></i>`;
    dice.classList.remove("dice-rolling");
  }
}
