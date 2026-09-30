export class StateMachine {
  constructor({ initialState, transitions, states, context }) {
    this.transitions = transitions;
    this.states = states;
    this.context = context;
    this.currentState = initialState;
    this.previousState = null;

    const initialHandler = this.states[initialState];
    if (!initialHandler) {
      throw new Error(`Unknown initial game state: ${initialState}`);
    }

    initialHandler.enter?.(this.context, null);
  }

  canTransition(nextState) {
    if (!this.states[nextState]) return false;
    if (nextState === this.currentState) return true;

    return (this.transitions[this.currentState] || []).includes(nextState);
  }

  transition(nextState) {
    if (!this.states[nextState]) {
      throw new Error(`Unknown game state: ${nextState}`);
    }

    if (nextState === this.currentState) return false;

    if (!this.canTransition(nextState)) {
      throw new Error(
        `Invalid game state transition: ${this.currentState} -> ${nextState}`,
      );
    }

    const previousState = this.currentState;
    this.states[previousState].exit?.(this.context, nextState);
    this.previousState = previousState;
    this.currentState = nextState;
    this.states[nextState].enter?.(this.context, previousState);
    return true;
  }
}
