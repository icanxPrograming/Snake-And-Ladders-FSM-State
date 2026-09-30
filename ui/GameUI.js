export class GameUI {
  updateStormTimer(timeRemaining, totalTime) {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const timerText = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    const timerDisplay = document.getElementById("stormCountdown");
    if (timerDisplay) timerDisplay.textContent = timerText;

    const progressBar = document.getElementById("stormProgressBar");
    if (progressBar) {
      progressBar.style.width = `${(timeRemaining / totalTime) * 100}%`;
    }

    const container = document.getElementById("stormTimerContainer");
    if (container) {
      container.classList.toggle(
        "storm-warning",
        timeRemaining <= 30 && timeRemaining > 0,
      );
    }
  }

  clearStormWarning() {
    document
      .getElementById("stormTimerContainer")
      ?.classList.remove("storm-warning");
  }
}
