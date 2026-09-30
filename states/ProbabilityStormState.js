export class ProbabilityStormState {
  enter(context) {
    if (context.event?.resume) {
      context.actions.presentNextStormPlayer();
      return;
    }

    context.actions.beginProbabilityStorm();
  }
}
