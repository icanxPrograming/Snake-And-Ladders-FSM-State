export class QuestionState {
  enter(context) {
    context.actions.presentTileQuestion(context.event?.tileType);
  }
}
