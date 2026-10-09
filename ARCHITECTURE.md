# Arsitektur Project

Dokumen ini menjelaskan implementasi yang ditemukan di repository. `script.js`, `core/Game.js`, state handlers, system, UI, data JSON, dan `index.html` menjadi bukti utama. Diagram transisi detail dan kebutuhan ada di [flow-and-requirement.md](flow-and-requirement.md); desain produk dan batas test ada di [GDD-TDD.md](GDD-TDD.md) dan [test.md](test.md).

## Gambaran struktur

Project adalah frontend statis berbasis HTML, CSS, dan JavaScript ES modules; tidak ditemukan bundler, backend, maupun framework.

| Path | Tanggung jawab aktual |
|---|---|
| `index.html`, `style.css` | Halaman, DOM/modal, stylesheet, inline handler, dan pemuatan module serta library eksternal. |
| `script.js` | Entry point dan composition root: membuat system/UI/Game, memuat JSON, memegang state global, menghubungkan callback, gameplay, timer, animasi, audio, dan inline API pada `window`. |
| `core/` | Kernel flow game: registry/facade game, state machine, state constants, dan shared context/action/event. Rincian ada di bawah. |
| `states/` | Handler lifecycle tipis yang menerima context/event dan mendelegasikan aksi; termasuk card dan coin states. |
| `systems/` | Logika pemain, giliran, dadu, gerakan/tile, soal, skor, kondisi menang, kartu, dan koin. |
| `ui/` | Adapter presentasi DOM: board, menu, dadu, game, modal, soal, kartu, koin, sertifikat. |
| `question/`, `subgame/goals.json` | Bank soal dan sasaran subgame koin yang dimuat melalui `fetch`. |
| `tests/` | Test Node untuk system, FSM/state, serta lifecycle kartu/koin. Bukan suite browser end-to-end. |
| `images/`, `audio/` | Aset visual dan suara yang dirujuk runtime. |

## Modul inti dan batas tanggung jawab

### `core/`: modul inti game

| File | Tanggung jawab |
|---|---|
| `core/Game.js` | Menyediakan facade `start()`/`transition()`, membuat registry handler untuk semua `GameState`, menetapkan peta transisi yang diizinkan, dan menyalin event sebelum handler menerimanya. Ini sumber otoritatif daftar edge FSM. |
| `core/StateMachine.js` | Menyimpan state sekarang/sebelumnya, memeriksa state/edge valid, memanggil `exit` state lama dan `enter` state baru. Tidak menghitung aturan gerak atau merender UI. |
| `core/GameState.js` | Konstanta nama state agar ejaan state seragam di controller, FSM, dan handler. |
| `core/GameContext.js` | Wadah `data`, `actions`, `event`, dan `gameStatus` yang dipakai untuk dependency/action passing ke state. Tidak menjadi store persisten. |

### `states/`: modul penanganan status

Setiap class state mengimplementasikan lifecycle `enter(context)` (dan tidak memiliki kalkulasi gameplay mandiri). `MenuState`, `PlayerSelectionState`, dan `GameSetupState` meminta tampilan/setup; `PlayingState`, `RollingDiceState`, `MovingPlayerState`, dan `TurnTransitionState` meneruskan loop turn; `QuestionState`, `MysteryState`, `QuestionResultState`, dan `ProbabilityStormState` menangani alur soal/event; `CardDrawState`, `CardResultState`, `CoinDrawState`, dan `CoinResultState` menangani lifecycle kartu/koin; `GameOverState` dan `CertificateState` meneruskan hasil akhir. Handler mendelegasikan lewat `context.actions`; detail efek yang dipicu masing-masing handler berada di `script.js`.

### `systems/`: aturan dan data permainan

- `PlayerSystem`, `TurnSystem`, `DiceSystem`: buat/reset pemain, rotasi giliran, dan angka dadu.
- `MovementSystem`, `WinConditionSystem`: kalkulasi destinasi/bounce, tile, ular/tangga dan kondisi finish.
- `QuestionSystem`, `ScoreSystem`: pemilihan/evaluasi soal dan statistik/streak.
- `CardSystem`, `CoinSystem`: deck/efek kartu serta hasil/progress goal koin.

System tidak memiliki tanggung jawab rendering DOM. Controller memanggil system yang relevan lalu mengirim hasilnya ke UI atau state selanjutnya.

### `ui/`: presentasi dan interaksi DOM

`MenuUI`, `BoardUI`, `DiceUI`, `GameUI`, `ModalUI`, `QuestionUI`, `CardUI`, `CoinUI`, dan `CertificateUI` mengakses elemen halaman untuk menampilkan data, state visual, dan callback aksi. UI bukan otoritas untuk aturan gerak/skor. Sejumlah HTML inline callback tetap terhubung ke fungsi global yang dipasang oleh `script.js`.

### `script.js`: composition root dan controller

`script.js` menginstansiasi semua system/UI, membuat context dan `Game`, mendaftarkan action callbacks, memuat question/goal JSON, serta mengatur variabel sesi. Controller juga masih menjalankan timer, animasi, audio, pemilihan tile question, dan percabangan hasil. Jadi batas modul ada, tetapi orkestrasi runtime belum seluruhnya dipindah ke state/system khusus.

## Inisialisasi dan komposisi runtime

`index.html` memuat `script.js` sebagai module. Script membuat instance system/UI, data pemain, `GameContext`, action callbacks, lalu `Game` dengan handler semua state. `initialState()` memulai FSM ke `MENU`, menggambar board, menampilkan layar awal, dan menjadwalkan pesan status pemuatan soal. `loadQuestions()` memuat empat JSON secara paralel; kegagalan per file memakai fallback. `CoinSystem.loadGoals()` memuat `subgame/goals.json`; kegagalannya ditangani dengan mempertahankan goal bawaan. Runtime sebaiknya disajikan via HTTP lokal agar module dan `fetch` dapat bekerja.

`transitionGame()` menyalin data permainan global ke `context.data`, lalu meminta transisi. Event disalin dengan `structuredClone` pada facade game dan saat diberikan ke handler. State handler memanggil fungsi yang disuntikkan melalui `context.actions`. Aturan sistem/UI tidak dipanggil dari class state secara langsung.

## FSM

`core/Game.js` adalah sumber kebenaran untuk transisi. `StateMachine` memvalidasi state dan memanggil hook lifecycle. Transisi ke state yang sama no-op; state/transisi tidak valid melempar error. Diagram lengkap ada di [flow-and-requirement.md](flow-and-requirement.md). FSM mengatur batas alur, tetapi banyak timer, animasi, serta perubahan variabel global tetap dimiliki `script.js`; karena itu tidak semua pekerjaan asinkron dibatalkan otomatis ketika state berubah.

## Aliran gameplay dan komunikasi

```mermaid
flowchart TD
  HTML[index.html + user action] --> CTRL[script.js controller]
  CTRL --> GAME[Game.transition(state, event)]
  GAME --> FSM[StateMachine validates + lifecycle]
  FSM --> ACTION[GameContext.actions]
  ACTION --> SYS[systems: deterministic rules]
  ACTION --> UI[ui: DOM presentation]
  DATA[(question JSON / coin goals)] --> CTRL
  SYS --> CTRL
  UI -->|callbacks| CTRL
  CTRL --> GAME
```

Main dice path: `PLAYING → ROLLING_DICE → CARD_DRAW → CARD_RESULT`. A fortune card requests a movement using the current dice value; penalty ends the turn; game card opens the coin goal lifecycle. Movement resolves finish/bounce, then special tile, Guardian, snake/ladder, turn, or game-over paths. Koin tracks A/G progress toward a loaded goal; completion moves by the current dice value. Tile question selection is in `script.js`; Storm question selection uses `QuestionSystem`. `QuestionSystem` evaluates answers, `ScoreSystem` records outcomes, and controller callbacks decide resulting movement or turn.

`Probability Storm` countdown/queue/audio are controller logic activated by state entry. On a correct Storm answer, controller awards its stat and moves the player; other players are processed through resume transitions. Certificate rendering and export are delegated to `CertificateUI` and `html2canvas`.

## Data dan penyimpanan

Pemain dan statistik berada di memori. `localStorage` hanya digunakan untuk flag tutorial (`snares-and-ladders-tutorial-seen`); tidak ada penyimpanan progres, leaderboard permanen, atau `sessionStorage`. Question banks dan goal koin berasal dari JSON statis. Randomisasi dadu, soal, kartu, koin, serta tile sebagian memakai `Math.random`; beberapa system menerima random function untuk test deterministik. Pengacakan special tiles di controller memakai `sort(() => 0.5 - Math.random())`, bukan shuffle seragam.

Tidak ada EventBus. Komunikasi utama adalah transisi eksplisit berisi event, action callbacks yang diinjeksi, dan event DOM/callback UI. Inline HTML handler masih bergantung pada nama yang dipasang ke `window` oleh `script.js`.

## Dependensi dan integrasi

- Runtime browser dengan ES modules, DOM, `fetch`, timer, media/audio, dan `localStorage` untuk flag tutorial.
- MathLive digunakan oleh field jawaban matematika; `html2canvas` digunakan untuk ekspor sertifikat. Keduanya dirujuk dari HTML eksternal.
- Font Awesome dan aset audio/gambar juga dirujuk oleh halaman.
- Tidak ada manifest dependency/build yang terlihat dalam struktur project.

## Batas implementasi dan risiko arsitektur

- **IMPLEMENTED:** pembagian core/state/system/UI, FSM, gameplay lokal, soal, kartu/koin, Storm, skor, sertifikat dalam source.
- **PARTIALLY IMPLEMENTED:** pengujian interaksi browser, aksesibilitas, lintas browser, responsivitas aktual, dan ketahanan callback/timer; bukti lengkap tidak tersedia.
- **PLANNED / NOT IN SCOPE:** AI, online multiplayer, class/subject selection, backend/persistent leaderboard.
- Controller adalah pusat coupling: globals, callback, timer, audio, dan aturan integrasi terkonsentrasi di `script.js`.
- Timer interval dan `setTimeout` tidak memakai satu scheduler atau lifecycle cancellation FSM. Callback lama berpotensi berjalan setelah alur berpindah.
- Penutupan modal soal kini diproses sebagai jawaban kosong/salah melalui `submitAnswer`; perubahan source tersebut belum memiliki bukti test browser khusus.
- `ARCHITECTURE.md` sebelumnya menyebut tidak ada storage; faktanya flag tutorial memakai `localStorage`.

## Aturan pengembangan

1. Tambah state ke `GameState`, peta transisi `Game`, handler `states/`, wiring action di `script.js`, dan coverage FSM.
2. Tempatkan kalkulasi deterministik di `systems/`; DOM tetap di `ui/`.
3. Pertahankan nama JSON, DOM IDs, dan inline handler kecuali seluruh call site dimigrasikan.
4. Saat menambah alur asinkron, tentukan siapa memiliki timer, kapan timer dibatalkan, serta state yang sah untuk callback.
5. Status validasi dan cakupan bukti harus dicatat di `test.md`; keberadaan kode saja bukan bukti lulus browser.
