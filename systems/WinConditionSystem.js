export class WinConditionSystem {
  hasWon(player, finishPosition = 100) {
    return player.score === finishPosition;
  }
}
