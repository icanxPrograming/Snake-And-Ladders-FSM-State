const createStats = () => ({
  correct: 0,
  wrong: 0,
  ladders: 0,
  snakes: 0,
  currentStreak: 0,
  maxStreak: 0,
  totalMoves: 0,
  stormWins: 0,
  mysterySolved: 0,
});

export class PlayerSystem {
  createPlayer(name, image) {
    return {
      name,
      image,
      score: 0,
      stats: createStats(),
    };
  }

  createDefaultPlayers() {
    return [
      this.createPlayer("Player1", 1),
      this.createPlayer("Player2", 0),
      this.createPlayer("Player3", 3),
      this.createPlayer("Player4", 4),
    ];
  }

  reset(player) {
    player.score = 0;
    player.stats = createStats();
  }
}
