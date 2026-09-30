export class QuestionUI {
  show(question, { badgeText, difficultyClass, onAnswer }) {
    this.currentQuestion = question;
    this.onAnswer = onAnswer;

    const modal = document.getElementById("questionModal");
    const badge = document.getElementById("difficultyBadge");
    const questionText = document.getElementById("questionText");
    if (badge) {
      badge.textContent = badgeText;
      badge.className = `difficulty-badge ${difficultyClass}`;
    }
    if (questionText) {
      questionText.textContent =
        question.question || "Pertanyaan tidak tersedia";
    }
    this.hideAnswerTypes();
    this.hideExplanation();
    modal?.classList.remove("hide");
    this.setupQuestionType(question);
  }

  setupQuestionType(question) {
    const essay = document.getElementById("essayInput");
    const mathField = document.getElementById("mathAnswerField");
    const textField = document.getElementById("textAnswerField");
    const leftBrace = document.getElementById("leftBrace");
    const rightBrace = document.getElementById("rightBrace");
    const instruction = document.getElementById("essayInstruction");

    this.hideAnswerTypes();

    if (question.type === "multiple_choice" && question.options) {
      const optionsContainer = document.getElementById("mcOptions");
      optionsContainer.style.display = "block";
      optionsContainer.querySelectorAll(".option").forEach((option, index) => {
        if (index < question.options.length) {
          option.style.display = "flex";
          const text = option.querySelector("span:nth-child(2)");
          if (text) text.textContent = question.options[index];
          option.onclick = () => this.onAnswer(index);
          option.classList.remove("selected");
        } else {
          option.style.display = "none";
        }
      });
    } else if (question.type === "true_false") {
      const options = document
        .getElementById("tfOptions")
        .querySelectorAll(".option");
      document.getElementById("tfOptions").style.display = "block";
      options[0].onclick = () => this.onAnswer(true);
      options[1].onclick = () => this.onAnswer(false);
      options.forEach((option) => option.classList.remove("selected"));
    } else if (question.type === "essay") {
      essay.style.display = "block";
      mathField.style.display = "none";
      textField.style.display = "none";
      leftBrace.style.display = "none";
      rightBrace.style.display = "none";

      if (question.input_type === "math" || question.input_type === "set") {
        mathField.style.display = "block";
        mathField.value = "";
        mathField.readOnly = false;
        instruction.textContent = "Tuliskan jawaban matematika Anda:";

        if (question.input_type === "set") {
          leftBrace.style.display = "block";
          rightBrace.style.display = "block";
          instruction.textContent = "Lengkapi isi himpunan berikut:";
        }

        setTimeout(() => mathField.focus(), 300);
      } else {
        textField.style.display = "block";
        textField.value = "";
        instruction.textContent = "Jelaskan jawaban Anda secara singkat:";
        setTimeout(() => textField.focus(), 300);
      }

      const submitButton = essay.querySelector(".submit-btn");
      if (submitButton) {
        submitButton.onclick = () => {
          const answer =
            question.input_type === "math" || question.input_type === "set"
              ? mathField.value.trim()
              : textField.value.trim();
          if (answer && this.currentQuestion) this.onAnswer(answer);
        };
      }
    } else if (question.type === "what_if") {
      const whatIf = document.getElementById("whatIfInput");
      const mathInput = document.getElementById("whatIfMathField");
      const textInput = document.getElementById("whatIfAnswer");
      const whatIfInstruction = document.getElementById("whatIfInstruction");

      whatIf.style.display = "block";
      mathInput.style.display = "none";
      textInput.style.display = "none";

      if (question.input_type === "math") {
        mathInput.style.display = "block";
        mathField.readOnly = false;
        mathInput.value = "";
        whatIfInstruction.textContent = "Berikan nilai peluang yang tepat:";
        setTimeout(() => mathInput.focus(), 300);
      } else {
        textInput.style.display = "block";
        textInput.value = "";
        whatIfInstruction.textContent = "Apa yang terjadi jika...";
        setTimeout(() => textInput.focus(), 300);
      }

      const submitButton = whatIf.querySelector(".submit-btn");
      if (submitButton) {
        submitButton.onclick = () => {
          const answer =
            question.input_type === "math"
              ? mathInput.value.trim()
              : textInput.value.trim();
          if (answer && this.currentQuestion) this.onAnswer(answer);
        };
      }
    }
  }

  hideAnswerTypes() {
    ["mcOptions", "tfOptions", "essayInput", "whatIfInput"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.style.display = "none";
    });
  }

  highlightAnswer(question, answer) {
    if (question.type === "multiple_choice") {
      document
        .querySelectorAll("#mcOptions .option")
        .forEach((option, index) => {
          option.classList.toggle("selected", index === answer);
        });
    } else if (question.type === "true_false") {
      document
        .querySelectorAll("#tfOptions .option")
        .forEach((option, index) => {
          option.classList.toggle(
            "selected",
            (index === 0 && answer === true) ||
              (index === 1 && answer === false),
          );
        });
    }
  }

  setTimer(value, warning = false) {
    const timer = document.getElementById("timer");
    if (!timer) return;
    timer.textContent = value;
    timer.classList.toggle("warning", warning);
  }

  showExplanation(explanation) {
    const container = document.getElementById("explanation");
    const text = document.getElementById("explanationText");
    if (!container || !text) return;
    text.textContent = explanation;
    container.style.display = "block";
  }

  hideExplanation() {
    const container = document.getElementById("explanation");
    const text = document.getElementById("explanationText");
    if (container) container.style.display = "none";
    if (text) text.textContent = "";
  }

  hide() {
    document.getElementById("questionModal")?.classList.add("hide");
  }

  getActiveAnswer(question) {
    if (!question) return "";

    if (question.type === "essay") {
      const inputId =
        question.input_type === "math" || question.input_type === "set"
          ? "mathAnswerField"
          : "textAnswerField";
      return document.getElementById(inputId)?.value || "";
    }

    if (question.type === "what_if") {
      const inputId =
        question.input_type === "math" ? "whatIfMathField" : "whatIfAnswer";
      return document.getElementById(inputId)?.value || "";
    }

    return "";
  }

  bindAnswerEvents({ getQuestion, isProcessing, submitAnswer }) {
    let isSubmitting = false;

    const debouncedSubmit = () => {
      if (isSubmitting || isProcessing()) return;
      isSubmitting = true;
      setTimeout(() => {
        isSubmitting = false;
      }, 1000);
      const question = getQuestion();
      const answer = this.getActiveAnswer(question);
      if (answer) submitAnswer(question, answer);
    };

    document
      .querySelector("#essayInput .submit-btn")
      ?.addEventListener("click", debouncedSubmit);
    document
      .querySelector("#whatIfInput .submit-btn")
      ?.addEventListener("click", debouncedSubmit);

    const handleEnterKey = (event) => {
      const question = getQuestion();
      if (event.key !== "Enter" || event.shiftKey || !question) return;
      if (isSubmitting || isProcessing()) return;

      const answer = this.getActiveAnswer(question);
      if (!answer) return;
      event.preventDefault();
      isSubmitting = true;
      setTimeout(() => {
        isSubmitting = false;
      }, 1000);
      submitAnswer(question, answer);
    };

    [
      "textAnswerField",
      "whatIfAnswer",
      "mathAnswerField",
      "whatIfMathField",
    ].forEach((id) => {
      document.getElementById(id)?.addEventListener("keypress", handleEnterKey);
    });
  }
}
