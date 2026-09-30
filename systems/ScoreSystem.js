export class ScoreSystem {
  recordMove(player) {
    player.stats.totalMoves++;
  }

  recordAnswer(player, question, isCorrect) {
    if (isCorrect) {
      player.stats.correct++;
      if (question?.tileType === "mystery") {
        player.stats.mysterySolved = (player.stats.mysterySolved || 0) + 1;
      }
      player.stats.currentStreak++;
      if (player.stats.currentStreak > player.stats.maxStreak) {
        player.stats.maxStreak = player.stats.currentStreak;
      }
      return;
    }

    player.stats.wrong++;
    player.stats.currentStreak = 0;
  }

  recordTimeout(player, question) {
    this.recordAnswer(player, question, false);
  }

  recordLadder(player) {
    player.stats.ladders++;
  }

  recordSnake(player) {
    player.stats.snakes++;
  }

  recordStormWin(player) {
    player.stats.stormWins++;
  }
}
