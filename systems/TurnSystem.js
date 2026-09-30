export class TurnSystem {
  nextPlayer(currentPlayer, playersCount) {
    return (currentPlayer % playersCount) + 1;
  }
}
