export class MenuUI {
  setDifficulty(level) {
    document
      .querySelectorAll(".difficultyBox")
      .forEach((button) => button.classList.remove("selected"));
    document.getElementById(`diff-${level}`)?.classList.add("selected");
  }

  setMusicIcon(iconName) {
    const icon = document.getElementById("musicIcon");
    if (icon) icon.textContent = iconName;
  }

  showScreen(screenId) {
    ["screen1", "screen2", "screen3"].forEach((id) => {
      const screen = document.getElementById(id);
      if (screen) screen.style.display = id === screenId ? "block" : "none";
    });
  }

  clearDifficultySelection() {
    document
      .querySelectorAll(".difficultyBox")
      .forEach((button) => button.classList.remove("selected"));
  }

  selectPlayerCount(value) {
    document
      .querySelectorAll("#screen1 .choose .selectBox")
      .forEach((button, index) => {
        button.classList.toggle("selected", index === value - 2);
      });
  }

  showProfilePlayers(playersCount) {
    for (let index = 1; index <= 4; index++) {
      const card = document.getElementById(`card${index}`);
      if (card) card.style.display = index <= playersCount ? "flex" : "none";
    }
  }

  resetProfilePlayers() {
    for (let index = 1; index <= 4; index++) {
      const card = document.getElementById(`card${index}`);
      if (card) card.style.display = "flex";
    }
  }

  showGamePlayers(playersCount) {
    for (let index = 1; index <= 4; index++) {
      const card = document.getElementById(`playerCard${index}`);
      if (card) card.style.display = index <= playersCount ? "flex" : "none";
    }
  }

  adjustPlayerLayout(playersCount) {
    const isDesktop = window.innerWidth > 768;

    for (let index = 1; index <= 4; index++) {
      const card = document.getElementById(`playerCard${index}`);
      if (!card) continue;

      if (playersCount === 4 && isDesktop) {
        if (index === 1) card.style.order = "1";
        if (index === 2) card.style.order = "2";
        if (index === 4) card.style.order = "3";
        if (index === 3) card.style.order = "4";
        card.style.flex = "0 1 45%";
      } else {
        card.style.order = index.toString();
        card.style.flex = isDesktop ? "0 1 45%" : "1 1 100%";
        if (playersCount <= 2 && isDesktop) {
          card.style.flex = "0 1 45%";
        }
      }
    }
  }

  updateProfileImage(playerNumber, imageIndex) {
    const image = document.getElementById(`profile${playerNumber}`);
    if (image) image.src = `images/avatars/${imageIndex}.png`;
  }

  updatePlayerDisplay(players, playersCount, truncateName) {
    for (let index = 1; index <= playersCount; index++) {
      const player = players[index - 1];
      const name = document.getElementById(`displayName${index}`);
      const avatar = document.getElementById(`avatar${index}`);

      if (name) name.textContent = truncateName(player.name, 12);
      if (avatar) avatar.src = `images/avatars/${player.image}.png`;
    }
  }

  readPlayerName(playerNumber) {
    return document.getElementById(`name${playerNumber}`)?.value;
  }

  setPlayerTurn(playerNumber) {
    for (let index = 1; index <= 4; index++) {
      document
        .getElementById(`playerCard${index}`)
        ?.classList.remove("current-turn");
    }
    document
      .getElementById(`playerCard${playerNumber}`)
      ?.classList.add("current-turn");
  }
}
