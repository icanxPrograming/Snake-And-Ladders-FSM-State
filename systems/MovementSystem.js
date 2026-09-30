export class MovementSystem {
  calculateDestination(startPosition, movement, finishPosition = 100) {
    const targetPosition = startPosition + movement;
    const isBouncing = targetPosition > finishPosition;
    let finalPosition = isBouncing
      ? finishPosition - (targetPosition - finishPosition)
      : targetPosition;

    if (finalPosition < 0) finalPosition = 0;

    return { targetPosition, isBouncing, finalPosition };
  }

  getTileDifficulty(position, specialTiles) {
    if (specialTiles.easy.includes(position)) return "easy";
    if (specialTiles.standard.includes(position)) return "standard";
    if (specialTiles.hard.includes(position)) return "hard";
    if (specialTiles.mystery.includes(position)) return "mystery";
    return null;
  }

  findLadderIndices(position, ladders) {
    return ladders.reduce((indices, ladder, index) => {
      if (ladder[0] === position) indices.push(index);
      return indices;
    }, []);
  }

  findSnakeIndices(position, snakes) {
    return snakes.reduce((indices, snake, index) => {
      if (snake[0] === position) indices.push(index);
      return indices;
    }, []);
  }
}
