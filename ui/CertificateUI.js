export class CertificateUI {
  render(players, winner, truncateName, getAchievementTitle) {
    const statsBody = document.getElementById("allPlayersStatsBody");
    statsBody.replaceChildren();

    const sortedPlayers = [...players].sort(
      (first, second) => second.score - first.score,
    );
    sortedPlayers.forEach((player) => {
      const isWinner = player.name === winner.name;
      const row = document.createElement("tr");
      row.style.borderBottom = "1px solid #eee";
      if (isWinner) row.style.background = "#fff9c4";

      const values = [
        `${isWinner ? "👑 " : ""}${player.name}`,
        player.score,
        player.stats.correct,
        player.stats.maxStreak,
        `🪜${player.stats.ladders} / 🐍${player.stats.snakes}`,
      ];

      values.forEach((value) => {
        const cell = document.createElement("td");
        cell.style.padding = "12px";
        cell.textContent = value;
        row.appendChild(cell);
      });

      statsBody.appendChild(row);
    });

    document.getElementById("certName").textContent = truncateName(
      winner.name,
      25,
    );
    document.getElementById("certTitle").textContent =
      getAchievementTitle(winner);
    document.getElementById("winnerCorrect").textContent = winner.stats.correct;
    document.getElementById("winnerStreak").textContent =
      winner.stats.maxStreak;
    document.getElementById("winnerLadders").textContent = winner.stats.ladders;
    document.getElementById("winnerSnakes").textContent = winner.stats.snakes;

    this.showLeaderboard();
    document.getElementById("certificateModal").classList.remove("hide");
  }

  showCertificate() {
    document.getElementById("leaderboardSection").classList.add("hide");
    document.getElementById("certificateSection").classList.remove("hide");
  }

  showLeaderboard() {
    document.getElementById("certificateSection").classList.add("hide");
    document.getElementById("leaderboardSection").classList.remove("hide");
  }

  download() {
    const element = document.getElementById("certificateExportArea");
    const playerName =
      document.getElementById("certName").textContent || "Player";

    return html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `Sertifikat_MathGame_${playerName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      console.log("Certificate downloaded successfully!");
    });
  }
}
