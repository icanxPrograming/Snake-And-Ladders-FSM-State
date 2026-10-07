import { Game } from "./core/Game.js";
import { GameContext } from "./core/GameContext.js";
import { GameState } from "./core/GameState.js";
import { CardSystem } from "./systems/CardSystem.js";
import { CoinSystem } from "./systems/CoinSystem.js";
import { DiceSystem } from "./systems/DiceSystem.js";
import { MovementSystem } from "./systems/MovementSystem.js";
import { PlayerSystem } from "./systems/PlayerSystem.js";
import { QuestionSystem } from "./systems/QuestionSystem.js";
import { ScoreSystem } from "./systems/ScoreSystem.js";
import { TurnSystem } from "./systems/TurnSystem.js";
import { WinConditionSystem } from "./systems/WinConditionSystem.js";
import { BoardUI } from "./ui/BoardUI.js";
import { CardUI } from "./ui/CardUI.js";
import { CoinUI } from "./ui/CoinUI.js";
import { CertificateUI } from "./ui/CertificateUI.js";
import { DiceUI } from "./ui/DiceUI.js";
import { GameUI } from "./ui/GameUI.js";
import { MenuUI } from "./ui/MenuUI.js";
import { ModalUI } from "./ui/ModalUI.js";
import { QuestionUI } from "./ui/QuestionUI.js";
import { CardDrawState } from "./states/CardDrawState.js";
import { CardResultState } from "./states/CardResultState.js";
import { CoinDrawState } from "./states/CoinDrawState.js";
import { CoinResultState } from "./states/CoinResultState.js";
import { GameSetupState } from "./states/GameSetupState.js";
import { CertificateState } from "./states/CertificateState.js";
import { GameOverState } from "./states/GameOverState.js";
import { MenuState } from "./states/MenuState.js";
import { MovingPlayerState } from "./states/MovingPlayerState.js";
import { PlayerSelectionState } from "./states/PlayerSelectionState.js";
import { PlayingState } from "./states/PlayingState.js";
import { ProbabilityStormState } from "./states/ProbabilityStormState.js";
import { MysteryState } from "./states/MysteryState.js";
import { QuestionState } from "./states/QuestionState.js";
import { QuestionResultState } from "./states/QuestionResultState.js";
import { RollingDiceState } from "./states/RollingDiceState.js";
import { TurnTransitionState } from "./states/TurnTransitionState.js";

let game;
const cardSystem = new CardSystem();
const coinSystem = new CoinSystem();
const diceSystem = new DiceSystem();
const movementSystem = new MovementSystem();
const playerSystem = new PlayerSystem();
const questionSystem = new QuestionSystem();
const scoreSystem = new ScoreSystem();
const turnSystem = new TurnSystem();
const winConditionSystem = new WinConditionSystem();
const boardUI = new BoardUI();
const cardUI = new CardUI();
const coinUI = new CoinUI();
const certificateUI = new CertificateUI();
const diceUI = new DiceUI();
const gameUI = new GameUI();
const menuUI = new MenuUI();
const modalUI = new ModalUI();
const questionUI = new QuestionUI();

const transitionGame = (nextState, event = null) => {
  game.context.data = {
    players,
    playersCount,
    currentTurnPlayer,
    difficulty: globalGameDifficulty,
    currentQuestion,
    stormActive: isStormActive,
  };
  return game.transition(nextState, event);
};

let globalGameDifficulty = "standard"; // Default
let specialTiles = {
  easy: [],
  standard: [],
  hard: [],
  mystery: [],
};

let pendingFate = null; // Menyimpan data nasib (ular/tangga)

// ===== Variabel Probability Storm =====
let isStormActive = false;
let stormTimer = null;
let stormPlayerIndex = 0; // Untuk melacak siapa yang sedang menjawab di dalam Storm
let stormQueue = []; // Antrean pemain dalam Storm

// Fungsi untuk memilih tingkat kesulitan (Memperbaiki tombol yang tidak bisa diklik)
const setGameDifficulty = (level) => {
  // 1. Simpan ke variabel global
  globalGameDifficulty = level;
  console.log("Memilih kesulitan:", level);

  menuUI.setDifficulty(level);
};

// Membuka info kesulitan
const openDifficultyInfo = () => {
  modalUI.show("difficultyInfoModal");
};

// Menutup info kesulitan
const closeDifficultyInfo = () => {
  modalUI.hide("difficultyInfoModal");
};

// Fungsi untuk mengatur urutan visual kartu pemain
const adjustPlayerLayout = () => {
  menuUI.adjustPlayerLayout(playersCount);
};

// Jalankan saat resize
window.addEventListener("resize", adjustPlayerLayout);

const generateSpecialTiles = () => {
  // 1. Bagi zona papan
  const z1 = Array.from({ length: 29 }, (_, i) => i + 2).sort(
    () => 0.5 - Math.random(),
  ); // 2-30
  const z2 = Array.from({ length: 30 }, (_, i) => i + 31).sort(
    () => 0.5 - Math.random(),
  ); // 31-60
  const z3 = Array.from({ length: 39 }, (_, i) => i + 61).sort(
    () => 0.5 - Math.random(),
  ); // 61-99

  // Reset semua tiles
  specialTiles.easy = [];
  specialTiles.standard = [];
  specialTiles.hard = [];
  specialTiles.mystery = [];

  // Helper filter 10 kotak pertama (2-11) untuk keamanan Standard Mode
  const first10 = z1.filter((n) => n <= 11);
  const restOfZ1 = z1.filter((n) => n > 11);

  if (globalGameDifficulty === "easy") {
    // TAHAP AWAL (Dominan Easy, tapi ada 1-2 kejutan)
    specialTiles.easy.push(...z1.slice(0, 12));
    specialTiles.standard.push(z1[12]);
    specialTiles.hard.push(z1[13]); // Ada 1 hard agar tetap waspada
    specialTiles.mystery.push(z1[14]);

    // TAHAP TENGAH (Easy & Standard seimbang)
    specialTiles.easy.push(...z2.slice(0, 8));
    specialTiles.standard.push(...z2.slice(8, 14));
    specialTiles.hard.push(...z2.slice(14, 16)); // Mulai ada 2 hard
    specialTiles.mystery.push(...z2.slice(16, 18));

    // TAHAP AKHIR (Lengkap, tapi tetap bersahabat)
    specialTiles.easy.push(...z3.slice(0, 10));
    specialTiles.standard.push(...z3.slice(10, 16));
    specialTiles.hard.push(...z3.slice(16, 20)); // Ada 4 hard di akhir
    specialTiles.mystery.push(...z3.slice(20, 23));
  } else if (globalGameDifficulty === "standard") {
    // TAHAP AWAL (10 Pertama aman, sisanya mulai campur)
    specialTiles.easy.push(...first10.slice(0, 5));
    specialTiles.easy.push(...restOfZ1.slice(0, 4));
    specialTiles.standard.push(...restOfZ1.slice(4, 7));
    specialTiles.hard.push(restOfZ1[7]);
    specialTiles.mystery.push(restOfZ1[8]);

    // TAHAP TENGAH (Standard mendominasi)
    specialTiles.easy.push(...z2.slice(0, 4));
    specialTiles.standard.push(...z2.slice(4, 15));
    specialTiles.hard.push(...z2.slice(15, 20)); // Hard mulai terasa
    specialTiles.mystery.push(...z2.slice(20, 23));

    // TAHAP AKHIR (Hard & Standard kuat, Easy tipis)
    specialTiles.easy.push(...z3.slice(0, 2)); // Tetap ada 2 easy sebagai bonus
    specialTiles.standard.push(...z3.slice(2, 12));
    specialTiles.hard.push(...z3.slice(12, 25)); // Dominasi Hard
    specialTiles.mystery.push(...z3.slice(25, 30));
  } else if (globalGameDifficulty === "hard") {
    // TAHAP AWAL (Sudah mulai panas)
    specialTiles.easy.push(...z1.slice(0, 4));
    specialTiles.standard.push(...z1.slice(4, 9));
    specialTiles.hard.push(...z1.slice(9, 14)); // 5 Hard di awal!
    specialTiles.mystery.push(...z1.slice(14, 16));

    // TAHAP TENGAH (Hard & Mystery mendominasi)
    specialTiles.easy.push(z2[0]); // Hanya 1 Easy
    specialTiles.standard.push(...z2.slice(1, 8));
    specialTiles.hard.push(...z2.slice(8, 20));
    specialTiles.mystery.push(...z2.slice(20, 25));

    // TAHAP AKHIR (Ujian sesungguhnya)
    specialTiles.easy.push(z3[0]); // Tetap 1 easy (keajaiban)
    specialTiles.standard.push(...z3.slice(1, 6));
    specialTiles.hard.push(...z3.slice(6, 28)); // Sangat banyak Hard
    specialTiles.mystery.push(...z3.slice(28, 36));
  }
};

// Fungsi untuk membuka modal informasi
const openInfoModal = () => {
  modalUI.show("infoModal");
};

// Fungsi untuk menutup modal informasi
const closeInfoModal = () => {
  modalUI.hide("infoModal");
};

// Audio
const success = document.querySelector("#success");

// Ladders & Snakes
let ladders = [
  [4, 18, 24, 38],
  [13, 32],
  [44, 63],
  [53, 73],
  [56, 65, 75, 86, 95],
];
let snakes = [
  [36, 25, 26, 15, 27],
  [60, 42, 39, 22],
  [71, 69, 52, 68, 53],
  [99, 82, 83, 78, 77],
];

// Dice
const diceArray = [1, 2, 3, 4, 5, 6];
// Fungsi untuk memotong nama jika terlalu panjang
const truncateName = (name, limit = 12) => {
  if (name.length > limit) {
    // Memotong nama dan menambahkan titik-titik
    return name.substring(0, limit - 2) + "...";
  }
  return name;
};

// Players
let playersCount = 2;
const players = playerSystem.createDefaultPlayers();

const resetAllPlayerStats = () => {
  console.log("Resetting all players stats and game states...");

  players.forEach((player) => playerSystem.reset(player));

  // Reset State Global Game
  currentTurnPlayer = 1;
  isRolling = false;
  isProcessingAnswer = false;
  pendingFate = null;

  // Reset Probability Storm
  isStormActive = false;
  if (stormTimer) clearInterval(stormTimer);
  stormTimeRemaining = TOTAL_STORM_TIME;
};

const downloadCertificate = () => {
  return certificateUI.download();
};

// Fungsi membuka modal panduan
const TUTORIAL_STORAGE_KEY = "snares-and-ladders-tutorial-seen";

const hasSeenTutorial = () => {
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const markTutorialSeen = () => {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
  } catch {
    // The game remains playable when storage is unavailable.
  }
};

const openGuideModal = () => {
  modalUI.show("guideModal");
};

// Fungsi menutup modal panduan
const closeGuideModal = () => {
  markTutorialSeen();
  modalUI.hide("guideModal");
};

const toggleGameMenu = () => {
  const toggle = document.getElementById("gameMenuToggle");
  const dropdown = document.getElementById("gameMenuDropdown");
  if (!toggle || !dropdown) return;

  const isOpen = !dropdown.classList.contains("hide");
  dropdown.classList.toggle("hide", isOpen);
  toggle.setAttribute("aria-expanded", String(!isOpen));
  toggle.setAttribute(
    "aria-label",
    isOpen ? "Buka menu game" : "Tutup menu game",
  );
};

const closeGameMenu = () => {
  const toggle = document.getElementById("gameMenuToggle");
  const dropdown = document.getElementById("gameMenuDropdown");
  dropdown?.classList.add("hide");
  toggle?.setAttribute("aria-expanded", "false");
  toggle?.setAttribute("aria-label", "Buka menu game");
};

const menuToggle = document.getElementById("gameMenuToggle");
const guideMenuButton = document.getElementById("guideMenuButton");
const musicMenuButton = document.getElementById("musicMenuButton");
const infoMenuButton = document.getElementById("infoMenuButton");
const probabilityMenuButton = document.getElementById("probabilityMenuButton");

menuToggle?.addEventListener("click", toggleGameMenu);
guideMenuButton?.addEventListener("click", () => {
  openGuideModal();
  closeGameMenu();
});
musicMenuButton?.addEventListener("click", () => {
  toggleMusic();
  closeGameMenu();
});
infoMenuButton?.addEventListener("click", () => {
  openInfoModal();
  closeGameMenu();
});
probabilityMenuButton?.addEventListener("click", () => {
  openProbabilityInfo();
  closeGameMenu();
});

const openProbabilityInfo = () => {
  const panel = document.getElementById("probabilityPanel");
  const modal = document.getElementById("probabilityModal");
  const isCompact = window.matchMedia("(max-width: 1360px)").matches;

  if (!panel || !modal) return;
  if (isCompact) {
    modalUI.show("probabilityModal");
    return;
  }

  panel.scrollIntoView({ behavior: "smooth", block: "center" });
  panel.classList.add("is-highlighted");
  window.setTimeout(() => panel.classList.remove("is-highlighted"), 1200);
};

const closeProbabilityModal = () => {
  modalUI.hide("probabilityModal");
};

const probabilityModalClose = document.getElementById("probabilityModalClose");
const probabilityModalConfirm = document.getElementById(
  "probabilityModalConfirm",
);

probabilityModalClose?.addEventListener("click", closeProbabilityModal);
probabilityModalConfirm?.addEventListener("click", closeProbabilityModal);

// Ambil elemen BGM
const bgm = document.getElementById("bgmAudio");
const countdownAudio = document.getElementById("countdownAudio");
const sirineAudio = document.getElementById("sirineAudio");
let isMusicPlaying = false;

// Set volume rendah (0.1 atau 0.05 sesuai permintaan)
if (countdownAudio) countdownAudio.volume = 0.1;
if (sirineAudio) sirineAudio.volume = 0.1;
if (bgm) bgm.volume = 0.1;

const toggleMusic = () => {
  if (isMusicPlaying) {
    bgm.pause();
    menuUI.setMusicIcon("music_off");
  } else {
    bgm
      .play()
      .catch((error) => console.log("User interaction required to play audio"));
    menuUI.setMusicIcon("music_note");
  }
  isMusicPlaying = !isMusicPlaying;
};

// Fungsi untuk mengecilkan volume saat ada soal (Ducking)
const lowerBGM = () => {
  if (bgm) bgm.volume = 0.05;
};

// Fungsi untuk mengembalikan volume ke normal
const restoreBGM = () => {
  if (bgm) bgm.volume = 0.1;
};

// Panggil fungsi ini di dalam fungsi next() agar musik mulai saat game dimulai
const startBGM = () => {
  if (!isMusicPlaying) {
    bgm
      .play()
      .then(() => {
        isMusicPlaying = true;
        menuUI.setMusicIcon("music_note");
      })
      .catch((e) => console.log("Menunggu interaksi user..."));
  }
};

// ===== Load pertanyaan dari JSON =====
let questionPool = {
  easy: { multiple_choice: [], true_false: [], essay: [] },
  standard: { multiple_choice: [], true_false: [], essay: [] },
  hard: { multiple_choice: [], true_false: [], essay: [] },
  mystery: { multiple_choice: [], true_false: [], what_if: [] },
};

let questionsLoaded = false;

const loadQuestions = async () => {
  try {
    const paths = {
      easy: "question/easyQuestion.json",
      standard: "question/standarQuestion.json",
      hard: "question/hardQuestion.json",
      mystery: "question/mysteryQuestion.json",
    };

    const loadPromises = Object.entries(paths).map(async ([key, path]) => {
      try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to load ${path}`);
        const data = await response.json();

        // Normalize data structure
        questionPool[key] = {
          multiple_choice: data.multiple_choice || [],
          true_false: data.true_false || [],
          essay: data.essay || [],
          what_if: data.what_if || [],
        };

        console.log(`Loaded ${key}:`, {
          mc: questionPool[key].multiple_choice.length,
          tf: questionPool[key].true_false.length,
          es: questionPool[key].essay.length,
          wi: questionPool[key].what_if?.length || 0,
        });
      } catch (error) {
        console.error(`Error loading ${key}:`, error);
        // Provide fallback questions if file fails to load
        questionPool[key] = getFallbackQuestions(key);
      }
    });

    await Promise.all(loadPromises);
    questionsLoaded = true;
    console.log("All questions loaded successfully");
  } catch (error) {
    console.error("Error loading questions:", error);
    // Initialize with fallback questions
    questionPool = {
      easy: getFallbackQuestions("easy"),
      standard: getFallbackQuestions("standard"),
      hard: getFallbackQuestions("hard"),
      mystery: getFallbackQuestions("mystery"),
    };
    questionsLoaded = true;
  }
};

// Fallback questions jika file tidak tersedia
const getFallbackQuestions = (difficulty) => {
  const fallbacks = {
    easy: {
      multiple_choice: [
        {
          question: "Banyak ruang sampel pelemparan satu dadu adalah...",
          options: ["3", "4", "6"],
          answer: 2,
          explanation: "Ruang sampel: {1,2,3,4,5,6}",
        },
      ],
      true_false: [
        {
          question: "Peluang muncul angka ganjil pada dadu adalah 1/2.",
          answer: true,
          explanation: "Angka ganjil {1,3,5} = 3/6",
        },
      ],
      essay: [
        {
          question: "Tuliskan ruang sampel pelemparan satu koin!",
          answer: "{angka, gambar}",
        },
      ],
    },
    standard: {
      multiple_choice: [
        {
          question: "Peluang muncul angka prima pada dadu adalah...",
          options: ["1/6", "1/3", "1/2"],
          answer: 2,
          explanation: "Bilangan prima {2,3,5} = 3/6",
        },
      ],
      true_false: [
        {
          question: "Frekuensi harapan selalu sama dengan hasil percobaan.",
          answer: false,
          explanation: "Frekuensi harapan hanya perkiraan",
        },
      ],
      essay: [
        {
          question: "Tuliskan ruang sampel pelemparan dua koin!",
          answer: "{AA, AG, GA, GG}",
        },
      ],
    },
    hard: {
      multiple_choice: [
        {
          question: "Dua dadu dilempar. Peluang jumlah mata dadu 9 adalah...",
          options: ["1/12", "1/9", "1/6"],
          answer: 0,
          explanation: "Pasangan: (3,6),(4,5),(5,4),(6,3) = 4/36",
        },
      ],
      true_false: [
        {
          question: "Pada dua dadu, kejadian jumlah 7 dan 11 saling lepas.",
          answer: true,
          explanation: "Tidak mungkin terjadi bersamaan",
        },
      ],
      essay: [
        {
          question: "Dua dadu dilempar. Tentukan peluang jumlah 8!",
          answer: "5/36",
        },
      ],
    },
    mystery: {
      multiple_choice: [
        {
          question: "Peluang TIDAK muncul angka genap pada dadu adalah...",
          options: ["1/6", "1/3", "1/2"],
          answer: 2,
          explanation: "Tidak genap = ganjil = 3/6",
        },
      ],
      true_false: [
        {
          question:
            "Dalam ruangan misteri, peluang muncul angka 7 pada dadu adalah 1/6.",
          answer: false,
          explanation: "Dadu tidak memiliki angka 7",
        },
      ],
      what_if: [
        {
          question:
            "Jika suatu kejadian tidak mustahil dan tidak pasti, nilai peluangnya...",
          answer: "0 < P < 1",
        },
      ],
    },
  };
  return fallbacks[difficulty] || fallbacks.easy;
};

// Panggil load questions saat awal
loadQuestions();
coinSystem.loadGoals().catch((error) => {
  console.warn("Coin goals fallback used:", error.message);
});

// ===== Random Question =====
const getRandomQuestion = () => {
  return questionSystem.getRandomQuestion(
    questionPool,
    questionsLoaded,
    getFallbackQuestions,
  );
};

// ===== Variabel global untuk soal aktif =====
let currentQuestion = null;
let currentPlayerTemp = 0;
let isRolling = false;
let questionTimer = null;
let currentTurnPlayer = 1;
let currentDiceValue = 0;
let currentCoinGoal = null;
let isProcessingAnswer = false; // Flag baru untuk mencegah double processing

const selectAnswer = (answerIndex) => {
  console.log(`selectAnswer: ${answerIndex}`);
  questionUI.highlightAnswer(currentQuestion, answerIndex);

  // Auto submit setelah 500ms
  setTimeout(() => {
    if (currentQuestion && !isProcessingAnswer) {
      submitAnswer(currentQuestion, answerIndex);
    }
  }, 500);
};

const handleQuestionAnswer = (answer) => {
  if (
    currentQuestion?.type === "multiple_choice" ||
    currentQuestion?.type === "true_false"
  ) {
    selectAnswer(answer);
  } else {
    submitAnswer(currentQuestion, answer);
  }
};

const handleTimeout = () => {
  console.log("handleTimeout called");

  if (currentQuestion) {
    scoreSystem.recordTimeout(players[currentPlayerTemp - 1], currentQuestion);
    transitionGame(GameState.QUESTION_RESULT, {
      correct: false,
      message: "Waktu habis!",
    });
    setTimeout(() => {
      if (!isProcessingAnswer) {
        handleMoveAfterQuestion(false);
        questionUI.hide();
      }
    }, 1500);
  } else {
    // Jika tidak ada soal, langsung lanjut
    console.log("No question on timeout, resetting state");
    isRolling = false;
    isProcessingAnswer = false;
    enableCurrentPlayerDice();
  }
};

const submitAnswer = (question, answer) => {
  console.log(`submitAnswer called, isProcessingAnswer: ${isProcessingAnswer}`);

  if (isProcessingAnswer) return;
  isProcessingAnswer = true;
  if (questionTimer) clearInterval(questionTimer);

  const { correct, message, explanation } = questionSystem.evaluateAnswer(
    question,
    answer,
  );
  transitionGame(GameState.QUESTION_RESULT, { correct, message, explanation });
  const pIdx = currentPlayerTemp - 1;
  scoreSystem.recordAnswer(players[pIdx], currentQuestion, correct);

  questionUI.showExplanation(explanation);

  setTimeout(() => {
    questionUI.hide();
    modalUI.hide("resultModal");

    if (currentQuestion && currentQuestion.isStorm) {
      if (correct) {
        // --- TAMBAHAN STATS ---
        scoreSystem.recordStormWin(players[currentPlayerTemp - 1]);
        // ----------------------
        showAnswerResult(
          true,
          `${players[currentPlayerTemp - 1].name} BERHASIL! Maju 3 Langkah.`,
        );
        // TRIGGER MUSIK: Beri jeda 100ms agar modal muncul dulu baru musik fade out
        setTimeout(() => {
          resetToSundaBGM();
        }, 100);
        isProcessingAnswer = true;
        setTimeout(() => {
          finishStorm(true);
          closeResultModal();
          movePot(3, currentPlayerTemp, true, false, "storm");
        }, 2000);
      } else {
        isProcessingAnswer = false;
        stormPlayerIndex++;
        processNextStormPlayer();
      }
    } else if (pendingFate) {
      const type = pendingFate.type;
      const idx = pendingFate.index;
      const pNo = pendingFate.playerNo;
      pendingFate = null;

      if (correct) {
        if (type === "LADDER") {
          showAnswerResult(true, "BENAR! Kamu berhak naik tangga!");
          setTimeout(() => {
            closeResultModal();
            specialMove(idx, pNo);
            // setTimeout(() => nextTurn(), 2500);
          }, 2000);
        } else {
          showAnswerResult(true, "BENAR! Kamu selamat dari ular!");
          setTimeout(() => {
            closeResultModal();
            nextTurn();
          }, 2000);
        }
      } else {
        if (type === "LADDER") {
          showAnswerResult(false, "SALAH! Kamu gagal naik tangga.");
          setTimeout(() => {
            closeResultModal();
            nextTurn();
          }, 2000);
        } else {
          showAnswerResult(false, "SALAH! Kamu gagal menyelamatkan diri!");
          setTimeout(() => {
            closeResultModal();
            specialMoveSnake(idx, pNo);
            // setTimeout(() => nextTurn(), 2500);
          }, 2000);
        }
      }
    } else {
      handleMoveAfterQuestion(correct);
    }
  }, 3000);
};

// Fungsi untuk menentukan gelar berdasarkan statistik
const getAchievementTitle = (player) => {
  const s = player.stats;
  const totalQuestions = s.correct + s.wrong;
  const accuracy = totalQuestions > 0 ? (s.correct / totalQuestions) * 100 : 0;

  // 1. Julukan Akurasi & Jenius
  if (accuracy === 100 && s.correct >= 10) return "Sang Arsitek Angka Sempurna";
  if (s.maxStreak >= 10) return "Legenda Matematika Tak Terhentikan";
  if (s.maxStreak >= 5) return "Pakar Logika Cerdas";

  // 2. Julukan Keberuntungan & Papan
  if (s.snakes >= 5) return "Penyintas Ular yang Tangguh";
  if (s.ladders >= 5) return "Penakluk Tangga Tertinggi";
  if (s.snakes === 0 && s.score === 100) return "Pembawa Hoki - Anti Ular";

  // 3. Julukan Kegigihan
  if (s.wrong > 10) return "Pejuang Angka yang Pantang Menyerah";
  if (s.correct > 15) return "Sang Profesor Probabilitas";

  // 4. Gelar Khusus: Pemecah Misteri (Gelar Keren)
  if (s.mysterySolved >= 5) return "Sang Pemecah Misteri Terhebat";

  // 5. Julukan Probability Storm
  if (s.stormWins >= 3) return "Sang Penakluk Badai Probabilitas";

  // Default
  return "Juara Ular Tangga";
};

// Fungsi utama menampilkan sertifikat
const showCertificate = (winner) => {
  transitionGame(GameState.CERTIFICATE, { winner });
};

const renderCertificate = (winner) => {
  certificateUI.render(
    players.slice(0, playersCount),
    winner,
    truncateName,
    getAchievementTitle,
  );
};

// Fungsi untuk pindah ke tampilan Sertifikat
const toggleToCertificate = () => {
  certificateUI.showCertificate();
};

// Fungsi untuk kembali ke tampilan Klasemen
const toggleToLeaderboard = () => {
  certificateUI.showLeaderboard();
};

// ===== Handle pergerakan setelah soal =====
const handleMoveAfterQuestion = (isCorrect) => {
  let moveValue = 0;
  const tileType = currentQuestion.tileType;

  if (tileType === "mystery") {
    if (isCorrect) {
      // --- LOGIKA RANDOM BONUS MISTERI ---
      const rewards = [
        { name: "Bonus 3 Langkah", value: 3 },
        { name: "Bonus 5 Langkah!", value: 5 },
        { name: "Lompatan Besar (4 Langkah)", value: 4 },
        { name: "Bonus 2 Langkah", value: 2 },
      ];

      const selectedReward =
        rewards[Math.floor(Math.random() * rewards.length)];

      // Tampilkan pesan hadiah khusus
      showAnswerResult(
        true,
        `Misteri Terpecahkan! \n Hadiah: ${selectedReward.name}`,
      );

      isProcessingAnswer = false;
      setTimeout(() => {
        closeResultModal();
        movePot(
          selectedReward.value,
          currentPlayerTemp,
          true,
          false,
          "mysteryBonus",
        );
      }, 2000);
      return; // Berhenti di sini agar tidak menjalankan movePot di bawah lagi
    } else {
      moveValue = -1; // Hukuman jika salah
      showAnswerResult(false, "Gagal memecahkan misteri. Mundur 1 langkah!");
    }
  } else {
    // Logika kotak biasa
    moveValue = isCorrect ? 1 : 0;
  }

  isProcessingAnswer = false;

  if (moveValue !== 0) {
    movePot(moveValue, currentPlayerTemp, true, false, "question");
  } else {
    finalizeTurn(currentPlayerTemp);
  }
};

// ===== Tampilkan hasil jawaban =====
const showAnswerResult = (isCorrect, message, explanation = "") => {
  modalUI.showAnswerResult(isCorrect, message, explanation);
};

const closeResultModal = () => {
  modalUI.hide("resultModal");
};

// ===== Tutup modal soal =====
const closeQuestionModal = () => {
  console.log("closeQuestionModal called");

  if (questionTimer) clearInterval(questionTimer);
  questionUI.hide();

  // Reset state
  isRolling = false;
  isProcessingAnswer = false;

  restoreBGM();

  // Kembalikan kontrol ke pemain yang sama
  enableCurrentPlayerDice();
};

// ===== Board =====
const drawBoard = () => {
  generateSpecialTiles(); // Acak kotak setiap mulai
  boardUI.renderTiles(specialTiles);
};

const updateBoard = () => {
  boardUI.renderPlayers(players, playersCount);
};

const checkTileTrigger = (currentScore, playerNo) => {
  const tileDifficulty = movementSystem.getTileDifficulty(
    currentScore,
    specialTiles,
  );

  if (tileDifficulty) {
    askQuestionOnTile(playerNo, tileDifficulty);
  } else {
    // Hanya ganti turn jika TIDAK ada ular/tangga yang tertunda
    if (!pendingFate) {
      checkSnakeAndLadder(currentScore, playerNo);
      setTimeout(() => nextTurn(), 800);
    }
  }
};

const drawCardForCurrentPlayer = (playerNo) => {
  const deck = cardSystem.drawDeck(3);
  const entered = transitionGame(GameState.CARD_DRAW, {
    deck,
    playerNumber: playerNo,
  });

  if (!entered) {
    cardUI.showDeck(playerNo, deck);
  }
};

const presentCard = ({ deck, playerNumber }) => {
  cardUI.showDeck(playerNumber, deck);
};

const selectCard = (index) => {
  const event = game?.context?.event;
  const card = event?.deck?.[index];
  if (!event?.playerNumber || !card) return;

  cardUI.hide();
  transitionGame(GameState.CARD_RESULT, {
    ...event,
    card,
    diceValue: currentDiceValue,
  });
};

const presentCardResult = ({ card, playerNumber, diceValue }) => {
  const player = players[playerNumber - 1];
  if (!player) return;

  const result = cardSystem.resolveEffect(card, player.score, diceValue);
  cardUI.showResult(card);

  if (result.action === "move") {
    showAnswerResult(
      true,
      `${card.name}: ${result.movement} langkah bergerak dari dadu ${diceValue}.`,
    );
    setTimeout(() => {
      closeResultModal();
      movePot(result.movement, playerNumber, false, false, "dice");
    }, 1600);
    return;
  }

  if (result.action === "coin") {
    currentCoinGoal = coinSystem.startGoal();
    showAnswerResult(true, `${card.name}: Buka subgame koin.`);
    setTimeout(() => {
      closeResultModal();
      transitionGame(GameState.COIN_DRAW, {
        playerNumber,
        goal: currentCoinGoal,
      });
    }, 1600);
    return;
  }

  showAnswerResult(false, `${card.name}: ${card.description}`);
  setTimeout(() => {
    closeResultModal();
    transitionGame(GameState.TURN_TRANSITION);
  }, 1600);
};

const closeCardModal = () => {
  cardUI.hide();
};

const presentCoin = ({ playerNumber, goal }) => {
  currentCoinGoal = goal;
  coinUI.show(playerNumber, goal);
};

const tossCoin = () => {
  const event = game?.context?.event;
  const currentState = game?.stateMachine?.currentState;
  if (
    currentState !== GameState.COIN_DRAW &&
    currentState !== GameState.COIN_RESULT
  )
    return;
  if (!event?.playerNumber || !currentCoinGoal) return;

  coinUI.recordToss();
  const result = coinSystem.toss(currentCoinGoal);
  const coinEvent = {
    ...event,
    ...result,
  };

  if (currentState === GameState.COIN_DRAW) {
    transitionGame(GameState.COIN_RESULT, coinEvent);
    return;
  }

  game.context.event = structuredClone(coinEvent);
  presentCoinResult(coinEvent);
};

const presentCoinResult = ({
  playerNumber,
  outcome,
  side,
  label,
  description,
  goalComplete,
  goal,
}) => {
  coinUI.showResult({
    outcome,
    side,
    label,
    description,
    goalComplete,
    goal,
  });
};

const continueCoin = () => {
  const event = game?.context?.event;
  if (!event?.playerNumber) return;

  const goalComplete = Boolean(currentCoinGoal?.goalComplete);
  if (!goalComplete) {
    coinUI.hide();
    transitionGame(GameState.COIN_DRAW, {
      playerNumber: event.playerNumber,
      goal: currentCoinGoal,
    });
    return;
  }

  coinUI.hide();
  const movement = currentDiceValue;
  currentCoinGoal = null;
  movePot(movement, event.playerNumber, false, false);
};

const coinTossButton = document.getElementById("coinTossButton");
const coinContinueButton = document.getElementById("coinContinueButton");

coinTossButton?.addEventListener("click", tossCoin);
coinContinueButton?.addEventListener("click", continueCoin);

const finalizeTurn = (playerNo) => {
  isRolling = false;
  isProcessingAnswer = false;
  nextTurn();
};

const checkSnakeAndLadder = (score, playerNo) => {
  checkLadder(score, playerNo);
  checkSnake(score, playerNo);
};

const askQuestionOnTile = (playerNo, tileType) => {
  // tileType adalah 'easy', 'standard', 'hard', atau 'mystery' (berasal dari warna kotak)

  isProcessingAnswer = false;
  currentPlayerTemp = playerNo;
  disableAllDices();

  // 2. Ambil soal LANGSUNG dari pool yang sesuai dengan warna kotak
  // Ini memastikan: Kotak Hijau = Soal Easy, Kotak Merah = Soal Hard, dst.
  const pool = questionPool[tileType];

  // Validasi jika pool soal tersedia
  const availableTypes = Object.keys(pool).filter(
    (type) => pool[type] && pool[type].length > 0,
  );

  if (availableTypes.length === 0) {
    console.error(`Pool soal untuk ${tileType} kosong!`);
    finalizeTurn(playerNo); // Skip jika tidak ada soal
    return;
  }

  // Pilih tipe soal acak (multiple_choice, essay, dll)
  const selectedType =
    availableTypes[Math.floor(Math.random() * availableTypes.length)];
  const questions = pool[selectedType];
  const q = questions[Math.floor(Math.random() * questions.length)];

  // Simpan data soal aktif
  currentQuestion = {
    ...q,
    difficulty: tileType, // Tingkat kesulitan soal disamakan dengan tipe kotak
    tileType: tileType, // Untuk menentukan bonus langkah nanti (3 langkah jika mystery)
    type: selectedType,
  };

  transitionGame(
    tileType === "mystery" ? GameState.MYSTERY : GameState.QUESTION,
    { tileType },
  );
};

const presentTileQuestion = (tileType) => {
  const question = currentQuestion;
  let timeLeft = question.time_limit || 30;
  questionUI.setTimer(timeLeft);

  if (questionTimer) clearInterval(questionTimer);
  questionTimer = setInterval(() => {
    timeLeft--;
    questionUI.setTimer(timeLeft, timeLeft <= 10);

    if (timeLeft <= 10) questionUI.setTimer(timeLeft, true);

    if (timeLeft <= 0) {
      clearInterval(questionTimer);
      handleTimeout();
    }
  }, 1000);

  lowerBGM();
  questionUI.show(question, {
    badgeText: `${tileType.toUpperCase()} TILE`,
    difficultyClass: tileType,
    onAnswer: (answer) => handleQuestionAnswer(answer),
  });
};

const movePot = (
  value,
  playerNumber,
  isBonusMove = false,
  drawCardAfterMove = true,
  source = isBonusMove ? "bonus" : "dice",
) => {
  console.log(`movePot START: Player ${playerNumber} moving ${value}`);
  if (playerNumber < 1 || playerNumber > playersCount) return;
  const event = {
    kind: "move",
    value,
    playerNumber,
    isBonusMove,
    drawCardAfterMove,
    source,
  };
  const entered = transitionGame(GameState.MOVING_PLAYER, event);
  if (!entered) performPlayerMove(event);
};

const performPlayerMove = ({
  value,
  playerNumber,
  isBonusMove,
  drawCardAfterMove,
  source,
}) => {
  let player = players[playerNumber - 1];
  let startScore = player.score;
  const destination = movementSystem.calculateDestination(startScore, value);
  const {
    targetPosition: targetScore,
    isBouncing,
    finalPosition: finalEnd,
  } = destination;

  let i = startScore;
  let phase = "forward";
  isRolling = true;

  const t = setInterval(() => {
    let moved = false;
    if (phase === "forward") {
      if (i < (isBouncing ? 100 : targetScore)) {
        i++;
        moved = true;
      } else {
        phase = isBouncing ? "backward" : "finish";
      }
    } else if (phase === "backward") {
      if (i > finalEnd) {
        i--;
        moved = true;
      } else {
        phase = "finish";
      }
    }

    if (moved) {
      player.score = i;
      if (drop) {
        drop.currentTime = 0;
        drop.play();
      }
      updateBoard();
    }

    if (phase === "finish") {
      clearInterval(t);
      player.score = finalEnd;
      updateBoard();

      // --- 1. CEK PEMENANG ---
      if (winConditionSystem.hasWon(player)) {
        transitionGame(GameState.GAME_OVER, { winner: player });
        return; // BERHENTI: Jangan cek tangga/ular lagi
      }

      // --- 2. DRAW KARTU SETELAH DICE DAN SEBELUM TILE RESOLUTION ---
      if (drawCardAfterMove) {
        drawCardForCurrentPlayer(playerNumber);
        return;
      }

      const postMove = movementSystem.resolvePostMove({
        position: player.score,
        source,
        specialTiles,
        ladders,
        snakes,
      });

      // --- 3. GUARDIAN/GATE: Kotak soal yang menghubungi ular/tangga ---
      if (postMove.action === "guardian") {
        pendingFate = {
          type:
            postMove.index ===
            ladders.findIndex((ladder) => ladder[0] === player.score)
              ? "LADDER"
              : "SNAKE",
          index: postMove.index,
          playerNo: playerNumber,
        };

        const msg =
          pendingFate.type === "LADDER"
            ? "KESEMPATAN EMAS! Jawab benar untuk naik tangga!"
            : "BAHAYA! Jawab benar untuk menyelamatkan diri dari ular!";

        showAnswerResult(true, msg);
        modalUI.setResultIcon(
          pendingFate.type === "LADDER" ? "🪜" : "🐍",
          "#2ecc71",
        );

        setTimeout(() => {
          closeResultModal();
          checkTileTrigger(player.score, playerNumber);
        }, 2000);
        return;
      }

      // --- 4. SOAL DARI PROBABILITY STORM SAJANA ---
      if (postMove.action === "question") {
        askQuestionOnTile(playerNumber, postMove.tileType);
        return;
      }

      // --- 5. ULAR/TANGGA BIASA ---
      if (postMove.action === "ladder") {
        pendingFate = null;
        checkLadder(player.score, playerNumber);
        return;
      }

      if (postMove.action === "snake") {
        pendingFate = null;
        checkSnake(player.score, playerNumber);
        return;
      }

      // --- 6. KOTAK BIASA ATAU PETAK SOAL DARI JAWABAN ---
      const actionDelay = 800;
      setTimeout(() => {
        if (isBonusMove && isStormActive) {
          finishStorm(true);
        } else {
          transitionGame(GameState.TURN_TRANSITION);
        }
      }, actionDelay);
    }
  }, 300);
};

const rollDice = (playerNo) => {
  // 1. Validasi giliran dan status jalan
  if (playerNo !== currentTurnPlayer || isRolling || isProcessingAnswer) {
    console.log("Blokir klik dadu: Sedang proses...");
    return;
  }
  transitionGame(GameState.ROLLING_DICE, { playerNumber: playerNo });
};

const performDiceRoll = (playerNo) => {
  // --- TAMBAHAN STATS ---
  scoreSystem.recordMove(players[playerNo - 1]);
  // ----------------------

  // 2. Kunci status agar tidak bisa diklik ganda
  isRolling = true;
  disableAllDices();

  if (diceAudio) {
    diceAudio.currentTime = 0;
    diceAudio.play();
  }

  diceUI.startRoll(playerNo);

  // Ambil angka dadu acak
  const diceNumber = diceSystem.roll(diceArray);
  currentDiceValue = diceNumber;

  // FASE 1: Selesaikan animasi putar dadu (500ms)
  setTimeout(() => {
    diceUI.showRoll(playerNo, diceNumber);

    // FASE 2: Beri jeda agar pemain bisa melihat angka dadu dengan jelas (1000ms)
    // Baru setelah jeda ini, kartu tiga pilihan muncul sebelum gerakan.
    setTimeout(() => {
      console.log(`Dadu berhenti di angka ${diceNumber}. Pion mulai jalan...`);
      drawCardForCurrentPlayer(playerNo);
    }, 1000);
  }, 500);
};

// ===== Manage turns =====
const nextTurn = () => {
  transitionGame(GameState.TURN_TRANSITION);
};

const advanceTurn = () => {
  const previousPlayer = currentTurnPlayer;

  // Reset semua flag status di awal perpindahan giliran
  isRolling = false;
  isProcessingAnswer = false;

  // Logika ganti pemain yang simpel dan aman
  currentTurnPlayer = turnSystem.nextPlayer(currentTurnPlayer, playersCount);

  console.log(
    `TURN CHANGE: Player ${previousPlayer} -> Player ${currentTurnPlayer}`,
  );

  // Update UI dan Aktifkan Dadu
  updateTurnIndicator();
  enableCurrentPlayerDice();
  transitionGame(GameState.PLAYING);
};

const updateTurnIndicator = () => {
  console.log(`Menyalakan indikator untuk Player: ${currentTurnPlayer}`);
  menuUI.setPlayerTurn(currentTurnPlayer);
  diceUI.setTurn(currentTurnPlayer);
  console.log(`Indikator menyala di ID: playerCard${currentTurnPlayer}`);
};

const disableAllDices = () => {
  console.log("Disabling all dices");
  isRolling = true;
  diceUI.disableAll();
};

const enableCurrentPlayerDice = () => {
  console.log(`Enabling dices for current player: ${currentTurnPlayer}`);
  isRolling = false;
  diceUI.enablePlayer(currentTurnPlayer);
};

// ===== Ladder & Snake =====
const checkLadder = (value, playerNumber) => {
  movementSystem
    .findLadderIndices(value, ladders)
    .forEach((idx) => specialMove(idx, playerNumber));
};

const checkSnake = (value, playerNumber) => {
  movementSystem
    .findSnakeIndices(value, snakes)
    .forEach((idx) => specialMoveSnake(idx, playerNumber));
};

const specialMove = (idx, playerNumber) => {
  const event = { kind: "ladder", index: idx, playerNumber };
  if (!transitionGame(GameState.MOVING_PLAYER, event)) {
    animateLadder(event);
  }
};

const animateLadder = ({ index, playerNumber }) => {
  let i = 0;
  if (ladder) {
    ladder.currentTime = 0;
    ladder.play();
  }
  scoreSystem.recordLadder(players[playerNumber - 1]);
  isRolling = true;

  const t = setInterval(() => {
    if (i < ladders[index].length) {
      players[playerNumber - 1].score = ladders[index][i];
      updateBoard();
      i++;
      if (drop) {
        drop.currentTime = 0;
        drop.play();
      }
    } else {
      clearInterval(t);
      const finalScore = ladders[index][ladders[index].length - 1];
      players[playerNumber - 1].score = finalScore;
      updateBoard();

      // KUNCI: Reset status dan pindah giliran
      isRolling = false;
      isProcessingAnswer = false;
      setTimeout(() => {
        nextTurn();
      }, 800);
    }
  }, 300);
};

const specialMoveSnake = (idx, playerNumber) => {
  const event = { kind: "snake", index: idx, playerNumber };
  if (!transitionGame(GameState.MOVING_PLAYER, event)) {
    animateSnake(event);
  }
};

const animateSnake = ({ index, playerNumber }) => {
  let i = 0;
  if (snake) {
    snake.currentTime = 0;
    snake.play();
  }
  scoreSystem.recordSnake(players[playerNumber - 1]);
  isRolling = true;

  const t = setInterval(() => {
    if (i < snakes[index].length) {
      players[playerNumber - 1].score = snakes[index][i];
      updateBoard();
      i++;
      if (drop) {
        drop.currentTime = 0;
        drop.play();
      }
    } else {
      clearInterval(t);
      const finalScore = snakes[index][snakes[index].length - 1];
      players[playerNumber - 1].score = finalScore;
      updateBoard();

      isRolling = false;
      isProcessingAnswer = false;
      setTimeout(() => {
        nextTurn();
      }, 800);
    }
  }, 300);
};

// ===== Player screens =====
const selectPlayers = (value) => {
  menuUI.selectPlayerCount(value);
  playersCount = value;
};

const start = () => {
  transitionGame(GameState.PLAYER_SETUP);
};

const back = () => {
  transitionGame(GameState.MENU);
};

const next = () => {
  transitionGame(GameState.GAME_SETUP);
};

const setupGame = () => {
  menuUI.showScreen("screen3");
  resetAllPlayerStats();
  startBGM();
  drawBoard();
  hideFinalPlayers();
  displayNames();
  // ATUR LAYOUT DI SINI
  adjustPlayerLayout();
  updateTurnIndicator();
  enableCurrentPlayerDice();
  updateBoard();

  startStormCountdown(); // MULAI COUNTDOWN BADAI DI SINI
  transitionGame(GameState.PLAYING);

  if (!hasSeenTutorial()) {
    setTimeout(() => openGuideModal(), 800);
  }

  console.log(
    `Game started with ${playersCount} players. First turn: Player ${currentTurnPlayer}`,
  );
};

const showPlayerSetup = () => {
  startBGM();
  menuUI.showScreen("screen2");
  setGameDifficulty("standard");
  hideUnwantedPlayers();
};

const showMenu = () => {
  menuUI.showScreen("screen1");
  menuUI.clearDifficultySelection();
  resetPlayersCount();
};

const resetPlayersCount = () => {
  menuUI.resetProfilePlayers();
};

const hideUnwantedPlayers = () => {
  menuUI.showProfilePlayers(playersCount);
};

const hideFinalPlayers = () => {
  menuUI.showGamePlayers(playersCount);
};

const displayNames = () => {
  menuUI.updatePlayerDisplay(players, playersCount, truncateName);
};

const updateUserProfile = (playerNo, value) => {
  if (playerNo < 1 || playerNo > 4) return;

  if (value === 1) {
    players[playerNo - 1].image = (players[playerNo - 1].image + 1) % 8;
  } else {
    players[playerNo - 1].image =
      players[playerNo - 1].image === 0 ? 7 : players[playerNo - 1].image - 1;
  }

  menuUI.updateProfileImage(playerNo, players[playerNo - 1].image);
};

const changeName = (playerNo) => {
  const name = menuUI.readPlayerName(playerNo)?.trim();
  players[playerNo - 1].name = name?.length > 0 ? name : `Player${playerNo}`;
};

// Fungsi yang hilang dari HTML
const updateValue = (playerNo) => {
  // Fungsi ini dipanggil dari HTML onblur
  changeName(playerNo);
};

// ===== Event Listeners dengan debouncing =====
questionUI.bindAnswerEvents({
  getQuestion: () => currentQuestion,
  isProcessing: () => isProcessingAnswer,
  submitAnswer,
});

// ===== Initial =====
const initialState = () => {
  console.log("Game initializing...");
  game.start();

  drawBoard();
  menuUI.showScreen("screen1");

  // Check if questions are loaded after a delay
  setTimeout(() => {
    if (!questionsLoaded) {
      console.warn("Questions still loading, using fallback...");
    } else {
      console.log("Questions loaded successfully");
    }
  }, 2000);

  console.log(
    `Initial state: playersCount=${playersCount}, currentTurnPlayer=${currentTurnPlayer}`,
  );
};

// Variabel tambahan untuk UI (Kembali ke durasi standar 3 menit)
let stormTimeRemaining = 180;
const TOTAL_STORM_TIME = 180; // 3 menit dalam detik (3 * 60)

const fadeAudio = (audioElement, targetVolume, duration = 1000) => {
  if (!audioElement) return;

  const startVolume = audioElement.volume;
  const diff = targetVolume - startVolume;
  const steps = 20; // Jumlah perubahan volume
  const stepTime = duration / steps;
  let currentStep = 0;

  const fadeInterval = setInterval(() => {
    currentStep++;
    audioElement.volume = startVolume + diff * (currentStep / steps);

    if (currentStep >= steps) {
      audioElement.volume = targetVolume;
      clearInterval(fadeInterval);
    }
  }, stepTime);
};

const startStormCountdown = () => {
  if (stormTimer) clearInterval(stormTimer);

  // Reset variabel waktu
  stormTimeRemaining = TOTAL_STORM_TIME;
  updateStormUI();

  stormTimer = setInterval(() => {
    // Jika badai sedang aktif, jangan kurangi waktu global
    if (isStormActive) return;

    stormTimeRemaining--;

    updateStormUI();

    if (stormTimeRemaining <= 0) {
      // Cek apakah pemain sedang sibuk (lagi jalan/lagi jawab soal biasa)
      // Jika sibuk, badai ditunda 1 detik sampai kondisi aman
      if (!isRolling && !isProcessingAnswer) {
        triggerProbabilityStorm();
        stormTimeRemaining = TOTAL_STORM_TIME; // Reset setelah badai dipicu
      } else {
        stormTimeRemaining = 1; // Tunggu 1 detik lagi
      }
    }
  }, 1000);
};

const updateStormUI = () => {
  gameUI.updateStormTimer(stormTimeRemaining, TOTAL_STORM_TIME);

  // Beri efek warning jika waktu < 30 detik
  if (stormTimeRemaining === 30 && !isStormActive) {
    if (countdownAudio && countdownAudio.paused) {
      countdownAudio.currentTime = 0;
      countdownAudio.play().catch((e) => console.log("Audio play blocked"));
    }
    if (bgm) bgm.volume = 0.03;
  }
};

const triggerProbabilityStorm = () => {
  console.log("PROBABILITY STORM STARTED!");
  transitionGame(GameState.PROBABILITY_STORM);
};

const beginProbabilityStorm = () => {
  isStormActive = true;
  disableAllDices();

  // Matikan countdown
  if (countdownAudio) {
    countdownAudio.pause();
    countdownAudio.currentTime = 0;
  }

  // 1. Mainkan Sirine (Volume 0.1)
  if (sirineAudio) {
    sirineAudio.volume = 0.1;
    sirineAudio.currentTime = 0;
    sirineAudio.play();

    // Buat sirine memudar (fade out) setelah 2 detik
    setTimeout(() => {
      fadeAudio(sirineAudio, 0, 1000);
    }, 2000);

    // Stop total sirine setelah 3 detik
    setTimeout(() => {
      sirineAudio.pause();
    }, 3000);
  }

  // 2. Mainkan Sabilulungan SETELAH sirine berjalan (delay 2 detik)
  if (bgm) {
    // Fade out lagu lama (Sunda)
    fadeAudio(bgm, 0, 500);

    setTimeout(() => {
      bgm.src = "audio/Sabilulungan.mp3";
      bgm.load();
      bgm.volume = 0; // Mulai dari 0
      bgm.play().catch((e) => console.log("Play blocked"));

      // Masuk perlahan (Fade In) tepat saat sirine meredup
      fadeAudio(bgm, 0.1, 1500);
    }, 2000); // Jeda 2 detik agar pas dengan sirine
  }

  // Buat antrean pemain (mulai dari player yang sedang giliran saat ini)
  stormQueue = [];
  for (let i = 0; i < playersCount; i++) {
    let pIdx = (currentTurnPlayer - 1 + i) % playersCount;
    stormQueue.push(pIdx + 1);
  }

  stormPlayerIndex = 0;
  showStormStartNotification();
};

const showStormStartNotification = () => {
  // Gunakan result modal untuk pemberitahuan
  showAnswerResult(
    true,
    "PROBABILITY STORM! Semua pemain bersiap menjawab secara bergantian!",
  );
  modalUI.setResultIcon("⚡", "#9b59b6");

  setTimeout(() => {
    closeResultModal();
    processNextStormPlayer();
  }, 3000);
};

const processNextStormPlayer = () => {
  if (game.stateMachine.currentState === GameState.PROBABILITY_STORM) {
    presentNextStormPlayer();
    return;
  }

  transitionGame(GameState.PROBABILITY_STORM, { resume: true });
};

const presentNextStormPlayer = () => {
  if (stormPlayerIndex >= stormQueue.length) {
    finishStorm(false);
    return;
  }

  const currentPlayerID = stormQueue[stormPlayerIndex];
  currentPlayerTemp = currentPlayerID;

  // RESET SEMUA STATE SEBELUM PLAYER MENJAWAB
  isProcessingAnswer = false;
  questionUI.hideExplanation();

  const q = getRandomQuestion();
  // Pastikan currentQuestion diupdate dengan tanda isStorm
  currentQuestion = { ...q, isStorm: true };

  lowerBGM();
  questionUI.show(currentQuestion, {
    badgeText: `STORM: ${truncateName(players[currentPlayerID - 1].name, 10)}`,
    difficultyClass: "mystery",
    onAnswer: (answer) => handleQuestionAnswer(answer),
  });

  startStormQuestionTimer();
};

const startStormQuestionTimer = () => {
  let timeLeft = 30; // Waktu lebih singkat untuk storm
  questionUI.setTimer(timeLeft);

  if (questionTimer) clearInterval(questionTimer);
  questionTimer = setInterval(() => {
    timeLeft--;
    questionUI.setTimer(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(questionTimer);
      handleStormTimeout();
    }
  }, 1000);
};

const handleStormTimeout = () => {
  if (questionTimer) clearInterval(questionTimer);

  scoreSystem.recordTimeout(players[currentPlayerTemp - 1], currentQuestion);
  const message = `Waktu ${players[stormQueue[stormPlayerIndex] - 1].name} habis!`;
  transitionGame(GameState.QUESTION_RESULT, { correct: false, message });
  questionUI.hide();

  // Pastikan status dipulihkan agar pemain berikutnya bisa menjawab
  isProcessingAnswer = false;

  setTimeout(() => {
    closeResultModal();
    stormPlayerIndex++;
    processNextStormPlayer();
  }, 2000);
};

const resetToSundaBGM = () => {
  if (bgm) {
    // 1. Fade Out Sabilulungan (600ms) - lebih terasa "melenyap"
    fadeAudio(bgm, 0, 600);

    setTimeout(() => {
      bgm.src = "audio/Sunda.mp3";
      bgm.load();
      bgm.volume = 0;
      bgm
        .play()
        .then(() => {
          // 2. Fade In Sunda (800ms) - masuk perlahan dengan cantik
          fadeAudio(bgm, 0.1, 800);
        })
        .catch((e) => console.log("Audio play blocked"));
    }, 650); // Jeda sedikit lebih lama dari durasi fade out
  }
};

const finishStorm = (isSuccess) => {
  isStormActive = false;
  isProcessingAnswer = false;
  isRolling = false;
  if (questionTimer) clearInterval(questionTimer);

  // Jika badai berakhir karena waktu habis atau semua salah, baru ganti musik di sini
  if (!isSuccess) {
    showAnswerResult(
      false,
      "Badai berakhir. Tidak ada yang berhasil menjawab.",
    );
    resetToSundaBGM();
  }

  gameUI.clearStormWarning();

  if (isSuccess) {
    stormTimeRemaining = TOTAL_STORM_TIME;
    return;
  }

  setTimeout(() => {
    closeResultModal();
    enableCurrentPlayerDice();
    stormTimeRemaining = TOTAL_STORM_TIME;
    transitionGame(GameState.PLAYING);
  }, 2000);
};

const handleGameOver = (winner) => {
  setTimeout(() => {
    if (success) success.play();
    showCertificate(winner);
  }, 500);
};

const gameContext = new GameContext({ players });
gameContext.actions = {
  showMenu,
  showPlayerSetup,
  setupGame,
  advanceTurn,
  rollDice: performDiceRoll,
  movePlayer: performPlayerMove,
  presentCard,
  presentCardResult,
  presentCoin,
  presentCoinResult,
  animateLadder,
  animateSnake,
  presentTileQuestion,
  presentNextStormPlayer,
  showQuestionResult: ({ correct, message, explanation }) =>
    showAnswerResult(correct, message, explanation),
  beginProbabilityStorm,
  onGameOver: handleGameOver,
  showCertificate: renderCertificate,
};

game = new Game({
  context: gameContext,
  stateHandlers: {
    [GameState.MENU]: new MenuState(),
    [GameState.PLAYER_SETUP]: new PlayerSelectionState(),
    [GameState.GAME_SETUP]: new GameSetupState(),
    [GameState.PLAYING]: new PlayingState(),
    [GameState.TURN_TRANSITION]: new TurnTransitionState(),
    [GameState.ROLLING_DICE]: new RollingDiceState(),
    [GameState.CARD_DRAW]: new CardDrawState(),
    [GameState.CARD_RESULT]: new CardResultState(),
    [GameState.COIN_DRAW]: new CoinDrawState(),
    [GameState.COIN_RESULT]: new CoinResultState(),
    [GameState.MOVING_PLAYER]: new MovingPlayerState(),
    [GameState.GAME_OVER]: new GameOverState(),
    [GameState.CERTIFICATE]: new CertificateState(),
    [GameState.QUESTION]: new QuestionState(),
    [GameState.MYSTERY]: new MysteryState(),
    [GameState.PROBABILITY_STORM]: new ProbabilityStormState(),
    [GameState.QUESTION_RESULT]: new QuestionResultState(),
  },
});

Object.assign(window, {
  toggleMusic,
  selectPlayers,
  start,
  openGuideModal,
  updateUserProfile,
  changeName,
  updateValue,
  openDifficultyInfo,
  setGameDifficulty,
  back,
  next,
  openInfoModal,
  rollDice,
  toggleToCertificate,
  downloadCertificate,
  toggleToLeaderboard,
  closeDifficultyInfo,
  closeGuideModal,
  closeInfoModal,
  closeQuestionModal,
  closeResultModal,
  closeCardModal,
  selectCard,
  tossCoin,
  continueCoin,
});

initialState();
