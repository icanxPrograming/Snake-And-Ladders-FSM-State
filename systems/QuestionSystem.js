export class QuestionSystem {
  getRandomQuestion(questionPool, questionsLoaded, getFallbackQuestions) {
    if (!questionsLoaded) {
      console.log("Questions not loaded yet, using fallback");
      const fallback = getFallbackQuestions("easy");
      return {
        ...fallback.multiple_choice[0],
        type: "multiple_choice",
        difficulty: "easy",
      };
    }

    const rand = Math.random();
    let difficulty = "easy";
    if (rand < 0.05) difficulty = "mystery";
    else if (rand < 0.4) difficulty = "hard";
    else if (rand < 0.7) difficulty = "standard";

    const pool = questionPool[difficulty];
    if (!pool) {
      console.error(`No pool for difficulty: ${difficulty}`);
      const fallback = getFallbackQuestions("easy");
      return {
        ...fallback.multiple_choice[0],
        type: "multiple_choice",
        difficulty: "easy",
      };
    }

    const availableTypes = Object.keys(pool).filter(
      (type) => pool[type] && pool[type].length > 0,
    );

    if (availableTypes.length === 0) {
      console.error(`No questions available for ${difficulty}`);
      const fallback = getFallbackQuestions("easy");
      return {
        ...fallback.multiple_choice[0],
        type: "multiple_choice",
        difficulty: "easy",
      };
    }

    const selectedType =
      availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const questions = pool[selectedType];

    if (!questions || questions.length === 0) {
      console.error(`No questions of type ${selectedType} for ${difficulty}`);
      const fallback = getFallbackQuestions("easy");
      return {
        ...fallback.multiple_choice[0],
        type: "multiple_choice",
        difficulty: "easy",
      };
    }

    const question = questions[Math.floor(Math.random() * questions.length)];

    return {
      ...question,
      type: selectedType,
      difficulty,
    };
  }

  evaluateAnswer(question, answer) {
    let correct = false;
    let message = "";

    if (!question) {
      message = "Soal tidak valid";
    } else if (
      question.type === "multiple_choice" ||
      question.type === "true_false"
    ) {
      correct = answer === question.answer;
      message = correct ? "Jawaban benar!" : "Jawaban salah!";
    } else if (question.type === "essay" || question.type === "what_if") {
      correct = this.checkEssayAnswer(
        answer,
        question.answer,
        question.input_type,
      );
      message = correct ? "Jawaban benar!" : "Jawaban kurang tepat!";
    }

    const explanation = !question
      ? "Soal tidak valid. Periksa kembali pertanyaan yang diminta."
      : question.explanation
        ? correct
          ? question.explanation
          : `Jawaban salah. ${question.explanation}`
        : correct
          ? "Jawaban sesuai dengan aturan yang diberikan."
          : "Jawaban tidak sesuai. Periksa kembali aturan dan coba jelaskan pemikiran Anda.";

    return { correct, message, explanation };
  }

  checkEssayAnswer(userAnswer, correctAnswer, type) {
    if (!userAnswer || !correctAnswer) return false;

    const clean = (value) =>
      value
        .toString()
        .toLowerCase()
        .replace(/[\s\\{}()]/g, "")
        .replace(/n\(s\)=/g, "")
        .replace(/p=/g, "")
        .replace(/fh=/g, "")
        .replace(/frac/g, "")
        .replace(/times/g, "x")
        .replace(/×/g, "x")
        .replace(/=/g, "")
        .trim();

    const normalizedUserAnswer = clean(userAnswer);
    const normalizedCorrectAnswer = clean(correctAnswer);

    if (normalizedUserAnswer === "") return false;

    if (type === "math" || type === "set") {
      if (normalizedUserAnswer === normalizedCorrectAnswer) return true;

      if (correctAnswer.includes("=")) {
        const parts = correctAnswer.split("=").map((part) => clean(part));
        return parts.some(
          (part) =>
            part === normalizedUserAnswer && normalizedUserAnswer !== "",
        );
      }

      return normalizedUserAnswer === normalizedCorrectAnswer;
    }

    if (type === "text") {
      if (normalizedUserAnswer.length < 3) {
        return normalizedUserAnswer === normalizedCorrectAnswer;
      }

      return (
        (normalizedCorrectAnswer.includes(normalizedUserAnswer) ||
          normalizedUserAnswer.includes(normalizedCorrectAnswer)) &&
        Math.abs(normalizedUserAnswer.length - normalizedCorrectAnswer.length) <
          20
      );
    }

    return normalizedUserAnswer === normalizedCorrectAnswer;
  }
}
