export class QuestionResultState {
  enter(context) {
    const result = context.event;
    if (result) context.actions.showQuestionResult(result);
  }
}
