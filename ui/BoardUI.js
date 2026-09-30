const PLAYER_POT_COLORS = ["redPot", "bluePot", "greenPot", "yellowPot"];

export class BoardUI {
  renderTiles(specialTiles) {
    let content = "";
    let boxCount = 101;

    for (let row = 0; row < 10; row++) {
      for (let column = 0; column < 10; column++) {
        if (row % 2 === 0) boxCount--;

        let tileClass = "";
        if (specialTiles.easy.includes(boxCount)) tileClass = "tile-easy";
        else if (specialTiles.standard.includes(boxCount)) {
          tileClass = "tile-standard";
        } else if (specialTiles.hard.includes(boxCount)) {
          tileClass = "tile-hard";
        } else if (specialTiles.mystery.includes(boxCount)) {
          tileClass = "tile-mystery";
        }

        content += `<div class="box ${tileClass}" id="potBox${boxCount}">${boxCount}</div>`;
        if (row % 2 !== 0) boxCount++;
      }
      boxCount -= 10;
    }

    document.querySelector("#board").innerHTML = content;
  }

  renderPlayers(players, playersCount) {
    for (let position = 1; position <= 100; position++) {
      const tile = document.getElementById(`potBox${position}`);
      if (tile) tile.innerHTML = "";
    }

    for (let index = 0; index < playersCount; index++) {
      const position = players[index].score;
      if (position !== 0 && position <= 100) {
        const tile = document.getElementById(`potBox${position}`);
        if (tile) {
          tile.innerHTML += `<div class="pot ${PLAYER_POT_COLORS[index]}"></div>`;
        }
      }
    }
  }
}
