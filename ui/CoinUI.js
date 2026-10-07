export class CoinUI {
  constructor() {
    this.tossCount = 0;
  }

  show(playerNumber, goal) {
    const modal = document.getElementById("coinModal");
    const playerName = document.getElementById("coinPlayerName");
    const resultTitle = document.getElementById("coinResultTitle");
    const coin = document.getElementById("coinFace");
    const tossCount = document.getElementById("coinTossCount");
    const tossButton = document.getElementById("coinTossButton");
    const continueButton = document.getElementById("coinContinueButton");

    if (
      !modal ||
      !playerName ||
      !resultTitle ||
      !coin ||
      !tossCount ||
      !tossButton ||
      !continueButton
    )
      return;

    this.tossCount = 0;
    playerName.textContent = `Pemain ${playerNumber}`;
    resultTitle.textContent = "Subgame Koin";
    coin.textContent = "?";
    coin.dataset.outcome = "pending";
    this.renderTossCount();
    this.renderGoal(goal);
    tossButton.textContent = "Lempar Koin";
    tossButton.classList.remove("hide");
    continueButton.classList.add("hide");
    modal.classList.remove("hide");
  }

  recordToss() {
    this.tossCount += 1;
    this.renderTossCount();
  }

  renderTossCount() {
    const tossCount = document.getElementById("coinTossCount");
    if (tossCount) {
      tossCount.textContent = `Total Lemparan Koin: ${this.tossCount}`;
    }
  }

  renderGoal(goal) {
    const goalElement = document.getElementById("coinGoal");
    const progressElement = document.getElementById("coinProgress");
    const explanationElement = document.getElementById("coinExplanation");
    const progress = goal?.progress ?? 0;
    const target = goal?.target ?? 0;

    goalElement.textContent = goal?.goal ?? "Goal belum tersedia";
    progressElement.textContent = `${progress} / ${target} · ${goal?.targetSide ?? "A/G"}`;
    explanationElement.textContent = goal?.explanation ?? "";
  }

  showResult(result) {
    const modal = document.getElementById("coinModal");
    const title = document.getElementById("coinResultTitle");
    const description = document.getElementById("coinResultDescription");
    const coin = document.getElementById("coinFace");
    const tossButton = document.getElementById("coinTossButton");
    const continueButton = document.getElementById("coinContinueButton");

    if (
      !modal ||
      !title ||
      !description ||
      !coin ||
      !tossButton ||
      !continueButton
    )
      return;

    this.renderTossCount();
    title.textContent = result.goalComplete
      ? "Goal tercapai!"
      : result.outcome === "heads"
        ? "Kepala — A"
        : "Gambar — G";
    description.textContent = result.goalComplete
      ? "Target tercapai. Pion dapat bergerak sesuai angka dadu."
      : result.description;
    coin.textContent = result.label;
    coin.dataset.outcome = result.outcome;
    this.renderGoal(result.goal);

    const isComplete = Boolean(result.goalComplete);
    tossButton.classList.toggle("hide", isComplete);
    tossButton.textContent = isComplete ? "Lempar Koin" : "Lempar Lagi";
    continueButton.classList.toggle("hide", !isComplete);
    continueButton.textContent = isComplete ? "Maju" : "Lanjut";
  }

  hide() {
    document.getElementById("coinModal")?.classList.add("hide");
  }
}
