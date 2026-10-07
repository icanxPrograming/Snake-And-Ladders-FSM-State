export class CardUI {
  showDeck(playerNumber, deck) {
    const modal = document.getElementById("cardModal");
    const title = document.getElementById("cardTitle");
    const description = document.getElementById("cardDescription");
    const icon = document.getElementById("cardIcon");
    const deckContainer = document.getElementById("cardDeck");

    if (!modal || !title || !description || !icon || !deckContainer) return;

    title.textContent = `Pilih kartu peluang — Player ${playerNumber}`;
    description.textContent =
      "Tiga kartu berbeda akan muncul. Kartu belum diketahui, jadi setiap pilihan adalah peluang.";
    icon.textContent = "?";
    deckContainer.classList.remove("is-revealed");
    deckContainer.innerHTML = deck
      .map(
        (card, index) => `
          <button class="card-choice card-choice-hidden" type="button" onclick="selectCard(${index})" aria-label="Pilih kartu tersembunyi">
            <span class="card-choice-icon">?</span>
            <strong>Kartu Rahasia</strong>
            <span> Klik untuk melihat hasil peluang</span>
          </button>`,
      )
      .join("");
    modal.classList.remove("hide");
  }

  showResult(card) {
    const modal = document.getElementById("cardModal");
    const title = document.getElementById("cardTitle");
    const description = document.getElementById("cardDescription");
    const icon = document.getElementById("cardIcon");
    const deckContainer = document.getElementById("cardDeck");

    if (!modal || !title || !description || !icon || !deckContainer) return;

    const categoryIcons = {
      fortune: "✦",
      penalty: "×",
      game: "◆",
    };
    const categoryLabels = {
      fortune: "Kartu Keberuntungan",
      penalty: "Kartu Hukuman",
      game: "Kartu Permainan",
    };

    title.textContent = card.name;
    description.textContent = card.description;
    icon.textContent = categoryIcons[card.category] ?? "✦";
    deckContainer.classList.add("is-revealed");
    deckContainer.innerHTML = `
      <div class="card-revealed">
        <span class="card-revealed-icon">${categoryIcons[card.category] ?? "✦"}</span>
        <strong>${categoryLabels[card.category] ?? card.name}</strong>
        <span class="card-revealed-description">${card.description}</span>
      </div>`;
    document.getElementById("cardContinue")?.classList.remove("hide");
    modal.classList.remove("hide");
  }

  hide() {
    document.getElementById("cardModal")?.classList.add("hide");
    document.getElementById("cardContinue")?.classList.add("hide");
  }
}
