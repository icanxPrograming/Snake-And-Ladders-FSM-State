import { GameContext } from "./GameContext.js";
import { GameState } from "./GameState.js";
import { StateMachine } from "./StateMachine.js";

const TRANSITIONS = Object.freeze({
  [GameState.BOOT]: [GameState.MENU],
  [GameState.MENU]: [GameState.PLAYER_SETUP],
  [GameState.PLAYER_SETUP]: [GameState.MENU, GameState.GAME_SETUP],
  [GameState.GAME_SETUP]: [GameState.PLAYING],
  [GameState.PLAYING]: [
    GameState.ROLLING_DICE,
    GameState.QUESTION,
    GameState.PROBABILITY_STORM,
  ],
  [GameState.ROLLING_DICE]: [GameState.MOVING_PLAYER, GameState.PLAYING],
  [GameState.MOVING_PLAYER]: [
    GameState.MOVING_PLAYER,
    GameState.QUESTION,
    GameState.MYSTERY,
    GameState.TURN_TRANSITION,
    GameState.GAME_OVER,
  ],
  [GameState.QUESTION]: [
    GameState.QUESTION_RESULT,
    GameState.MOVING_PLAYER,
    GameState.TURN_TRANSITION,
    GameState.PLAYING,
  ],
  [GameState.MYSTERY]: [
    GameState.QUESTION_RESULT,
    GameState.MOVING_PLAYER,
    GameState.TURN_TRANSITION,
    GameState.PLAYING,
  ],
  [GameState.QUESTION_RESULT]: [
    GameState.MOVING_PLAYER,
    GameState.TURN_TRANSITION,
    GameState.PROBABILITY_STORM,
    GameState.PLAYING,
    GameState.GAME_OVER,
  ],
  [GameState.PROBABILITY_STORM]: [
    GameState.QUESTION_RESULT,
    GameState.MOVING_PLAYER,
    GameState.PLAYING,
  ],
  [GameState.TURN_TRANSITION]: [GameState.PLAYING],
  [GameState.GAME_OVER]: [GameState.CERTIFICATE],
  [GameState.CERTIFICATE]: [],
});

export class Game {
  constructor({ context = new GameContext(), stateHandlers = {} } = {}) {
    this.context = context;
    const states = Object.fromEntries(
      Object.values(GameState).map((state) => [
        state,
        {
          enter: (gameContext, previousState) => {
            gameContext.gameStatus = state;
            stateHandlers[state]?.enter?.(gameContext, previousState);
          },
          exit: (gameContext, nextState) => {
            stateHandlers[state]?.exit?.(gameContext, nextState);
          },
        },
      ]),
    );

    this.stateMachine = new StateMachine({
      initialState: GameState.BOOT,
      transitions: TRANSITIONS,
      states,
      context: this.context,
    });
  }

  start() {
    this.transition(GameState.MENU);
  }

  transition(nextState, event = null) {
    this.context.event = event;
    return this.stateMachine.transition(nextState);
  }
}
