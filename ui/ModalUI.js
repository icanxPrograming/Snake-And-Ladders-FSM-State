export class ModalUI {
  show(modalId) {
    document.getElementById(modalId)?.classList.remove("hide");
  }

  hide(modalId) {
    document.getElementById(modalId)?.classList.add("hide");
  }

  showAnswerResult(isCorrect, message, explanation = "") {
    const resultModal = document.getElementById("resultModal");
    const resultIcon = document.getElementById("resultIcon");
    const resultTitle = document.getElementById("resultTitle");
    const resultMessage = document.getElementById("resultMessage");
    const explanationElement = document.getElementById("explanation");
    const explanationText = document.getElementById("explanationText");

    if (!resultModal || !resultIcon || !resultTitle || !resultMessage) return;

    if (isCorrect) {
      resultIcon.textContent = "✓";
      resultIcon.style.color = "#2ecc71";
      resultTitle.textContent = "Benar!";
      resultTitle.style.color = "#2ecc71";
    } else {
      resultIcon.textContent = "✗";
      resultIcon.style.color = "#e74c3c";
      resultTitle.textContent = "Salah";
      resultTitle.style.color = "#e74c3c";
    }

    resultMessage.textContent = message;
    if (explanationElement && explanationText) {
      explanationText.textContent = explanation;
      explanationElement.style.display = explanation ? "block" : "none";
    }
    resultModal.classList.remove("hide");
  }

  setResultIcon(icon, color) {
    const resultIcon = document.getElementById("resultIcon");
    if (!resultIcon) return;
    resultIcon.innerHTML = icon;
    resultIcon.style.color = color;
  }
}
