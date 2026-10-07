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

  resolvePostMove({ position, source, specialTiles, ladders, snakes }) {
    const tileType = this.getTileDifficulty(position, specialTiles);
    const ladderIndex = this.findLadderIndices(position, ladders)[0] ?? -1;
    const snakeIndex = this.findSnakeIndices(position, snakes)[0] ?? -1;

    if (tileType && (ladderIndex !== -1 || snakeIndex !== -1)) {
      return {
        action: "guardian",
        index: ladderIndex !== -1 ? ladderIndex : snakeIndex,
        tileType,
      };
    }

    if (tileType && source === "storm") {
      return { action: "question", tileType };
    }

    if (tileType && source !== "mysteryBonus" && source !== "question") {
      return { action: "question", tileType };
    }

    if (tileType) {
      return { action: "turn", tileType };
    }

    if (ladderIndex !== -1) {
      return { action: "ladder", index: ladderIndex };
    }

    if (snakeIndex !== -1) {
      return { action: "snake", index: snakeIndex };
    }

    return { action: "turn", tileType: null };
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
