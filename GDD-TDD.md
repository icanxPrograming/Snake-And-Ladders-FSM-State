# GDD-TDD: Snakes & Ladders Mathematics Edition

Dokumen ini memisahkan **Game Design Document (GDD)** dari **Technical Design Document (TDD)**. GDD menjelaskan pengalaman dan aturan yang dirancang; TDD menjelaskan cara source mengimplementasikannya. Status fitur berarti keberadaan implementasi, bukan jaminan bahwa seluruh interaksi sudah lolos uji browser.

Dokumen terkait: [README.md](README.md) untuk pengantar, [ARCHITECTURE.md](ARCHITECTURE.md) untuk tanggung jawab modul, [flow-and-requirement.md](flow-and-requirement.md) untuk diagram alur/FSM, dan [test.md](test.md) untuk bukti serta cakupan pengujian.

# Bagian I — Game Design Document (GDD)

## 1. Ringkasan permainan

| Elemen | Deskripsi |
|---|---|
| Judul | Snakes & Ladders Mathematics Edition / Petualangan Probabilitas |
| Genre | Board game edukasi, turn-based |
| Platform | Web browser, static frontend |
| Jumlah pemain | Local multiplayer 2–4 pemain pada satu perangkat |
| Materi utama | Matematika: peluang, ruang sampel, frekuensi harapan dan konsep terkait yang ada di bank soal |
| Tujuan sesi | Menjadi pemain pertama yang mencapai posisi 100; melihat leaderboard dan sertifikat hasil sesi |
| Target pengguna | Pemain/pelajar yang mempelajari peluang. Kelompok usia/jenjang spesifik belum dinyatakan di source. |

## 2. Pilar desain

1. **Belajar melalui keputusan:** pemain menjawab soal saat mendarat pada tile khusus.
2. **Kompetisi lokal yang mudah dimulai:** pemain berbagi satu board dan bergiliran.
3. **Variasi kejadian peluang:** dadu, pilihan kartu, simulasi koin, reward misteri, dan Probability Storm memberi konteks probabilitas yang berbeda.
4. **Umpan balik langsung:** jawaban dapat menampilkan penjelasan dan memengaruhi gerak/statistik.

Pilar ini menggambarkan tujuan produk; efektivitas pedagogis seluruh soal belum dievaluasi secara formal.

## 3. Sesi dan pengalaman pemain

1. Pemain memilih jumlah pemain (2–4), nama/avatar, dan kesulitan.
2. Board dan special tile disiapkan; pemain pertama mendapat giliran.
3. Pemain melempar dadu, menyelesaikan kartu, gerakan atau subgame, lalu tile/soal terkait.
4. Giliran berpindah; Probability Storm dapat menyela saat kondisi permainan dianggap aman.
5. Pemain yang mencapai finish memicu layar leaderboard dan sertifikat.

Game memiliki menu/panduan, profil pemain, board, modal question/result, card/coin, Storm indicator, leaderboard, dan certificate view. Kontrol dan alur layar aktual dijabarkan di [guide.md](guide.md).

## 4. Aturan permainan

### 4.1 Dadu, gerak, dan finish

- Nilai dadu adalah 1–6.
- Board memiliki posisi 1–100; pemain mulai dari posisi 0 sesuai data player system.
- Gerak yang melewati 100 dipantulkan kembali dari posisi 100 sejauh kelebihannya; gerak di bawah 0 dibatasi ke 0.
- Kondisi menang memeriksa posisi tepat 100. Aturan bounce dan finish memiliki system test terpilih.

### 4.2 Kesulitan dan special tiles

Kesulitan global yang dapat dipilih adalah `easy`, `standard`, dan `hard`. Setiap sesi membangkitkan tile `easy`, `standard`, `hard`, dan `mystery` dengan distribusi berbeda menurut mode. Mystery adalah kategori tile/soal, bukan pilihan kesulitan di menu. Tile biasa tidak memicu question.

### 4.3 Soal tile dan Guardian

Soal dipilih dari pool yang sesuai tile. Untuk tile biasa, jawaban benar memberi bonus satu langkah; jawaban salah atau timeout tidak memberi bonus dan giliran berakhir. Mystery benar memberi reward acak 2–5 langkah; salah memundurkan satu langkah. Bila posisi khusus beririsan dengan start ular/tangga, Guardian meminta jawaban: benar mengizinkan naik/bertahan, salah menggagalkan naik atau menjatuhkan pemain melalui ular.

### 4.4 Kartu dan koin

Sesudah animasi dadu, pemain memilih satu dari tiga kartu tersembunyi yang mewakili kategori fortune, penalty, dan game (setiap deck memiliki tiga kategori unik):

| Kategori | Dampak yang dijalankan |
|---|---|
| Fortune | Menggerakkan pemain dengan nilai dadu saat ini, kemudian menyelesaikan tile. `CardSystem` definisinya menyimpan `effect.value: 3`, tetapi resolver aktual menggunakan nilai dadu; definisi ini perlu diselaraskan. |
| Penalty | Tidak bergerak dan giliran berpindah. |
| Game | Memulai goal subgame koin. Goal selesai ketika sisi target tercapai sejumlah 4, 6, 8, 10, atau 12 kali; gerakan sesudahnya memakai nilai dadu saat ini. |

Goal meminta sisi angka `A` atau sisi gambar `G`. Setiap lemparan menambah progress hanya jika hasil cocok dengan target side.

### 4.5 Probability Storm

Countdown runtime adalah 180 detik. Saat waktunya habis, event menunggu pemain tidak sedang rolling atau memproses jawaban, lalu pemain dalam queue menjawab question Storm dengan batas 30 detik. Jawaban benar memberi statistik storm win dan gerak 3 langkah. Queue, timer, notifikasi, dan audio diorkestrasi controller. Perilaku source belum membuktikan timing/audio browser berjalan andal pada semua perangkat.

### 4.6 Statistik, gelar, dan akhir sesi

Stat pemain meliputi benar/salah, current/max streak, jumlah gerak, ladder/snake, Storm win, dan mystery solved. Gelar dihitung dari statistik saat certificate dibuat. Leaderboard lokal merangking pemain dalam sesi. Tidak ada leaderboard server atau riwayat sesi persisten.

## 5. Desain pembelajaran dan konten

Bank soal memiliki empat tingkat/pool: easy, standard, hard, mystery. Jenis soal yang didukung source/UI: `multiple_choice`, `true_false`, `essay`, `what_if`. Soal dapat berisi explanation dan time limit. Bentuk matematika/himpunan memakai MathLive; jawaban teks memakai pemeriksaan string yang saat ini dapat menerima kecocokan parsial.

Pedoman konten yang disarankan:

- Pastikan `answer` sesuai dengan indeks opsi atau tipe jawaban yang dibaca UI.
- Tulis penjelasan singkat yang memperlihatkan alasan matematis, bukan hanya menyebut benar/salah.
- Minta review pengajar untuk kebenaran, kesesuaian jenjang, bahasa, dan tingkat kesulitan.
- Uji setiap format jawaban melalui UI; validitas JSON saja tidak menjamin jawaban dapat dinilai sebagaimana dimaksud.

## 6. Ruang lingkup dan status desain

| Fitur | Status |
|---|---|
| Local multiplayer 2–4 pemain, board, dadu, ular/tangga, tile soal | IMPLEMENTED pada source |
| Mystery, Guardian, statistik, gelar | IMPLEMENTED pada source; jalur browser lengkap belum tervalidasi |
| Card/coin lifecycle | IMPLEMENTED pada source dan sebagian tercakup test system/FSM |
| Probability Storm dan pergantian audio | IMPLEMENTED pada source; validasi timing/audio parsial |
| Sertifikat PNG | IMPLEMENTED pada source; download browser belum terverifikasi penuh |
| Tutorial seen flag | IMPLEMENTED menggunakan localStorage |
| Progres tersimpan/leaderboard permanen, multiplayer online, backend | PLANNED / NOT IMPLEMENTED |
| AI/NPC, duel, subject/class selection | PLANNED / NOT IN SCOPE |

# Bagian II — Technical Design Document (TDD)

## 7. Stack dan runtime

- HTML/CSS dan vanilla JavaScript dengan ES modules.
- `index.html` memuat `script.js`; project tidak menunjukkan bundler/build pipeline atau backend.
- `fetch()` mengambil question banks dan `subgame/goals.json`; jalankan melalui HTTP lokal (mis. VS Code Live Server), bukan mengandalkan pembukaan `file://`.
- MathLive 0.98.5 dan html2canvas 1.4.1 dirujuk dari CDN; Font Awesome/Google Fonts juga eksternal. Aset audio/image disimpan lokal.
- Node.js diperlukan untuk menjalankan test Node; tidak diperlukan untuk runtime browser statis.

## 8. Struktur teknis dan tanggung jawab

| Modul | Tanggung jawab |
|---|---|
| `core/Game.js` | Handler registry, transition map, event clone dan `transition()` facade. |
| `core/StateMachine.js` | Validasi edge dan lifecycle `enter/exit`; menyimpan current/previous state. |
| `core/GameState.js`, `GameContext.js` | State constants serta context `data/actions/event/gameStatus`. |
| `states/` | Lifecycle delegates untuk menu/setup/play, dice/movement, question/result, Storm, card/coin, turn, game-over/certificate. |
| `systems/` | Player, turn, dice, movement, question, score, win, card, coin logic. |
| `ui/` | DOM modules untuk menu, board, dice, game, question, modal, card, coin, certificate. |
| `script.js` | Composition root/controller; menghubungkan semua modul, state data global, callbacks, timer, animasi, audio, dan sebagian aturan flow. |
| `question/*.json`, `subgame/goals.json` | Konten soal dan goal koin. |

Tanggung jawab file lebih terperinci dijelaskan pada [ARCHITECTURE.md](ARCHITECTURE.md). Diagram class/module dan FSM ada di [flow-and-requirement.md](flow-and-requirement.md).

## 9. Alur teknis dan state

`script.js` membuat system/UI → membangun `GameContext` dan action callbacks → membuat `Game` dengan handler per state → memulai `MENU`. UI callback/timer meminta transisi lewat controller. FSM memvalidasi edge lalu menjalankan handler state; handler memanggil actions pada context. System menghitung aturan, UI menampilkan hasil, controller menentukan transisi lanjutan.

State names: `BOOT`, `MENU`, `PLAYER_SETUP`, `GAME_SETUP`, `PLAYING`, `ROLLING_DICE`, `CARD_DRAW`, `CARD_RESULT`, `COIN_DRAW`, `COIN_RESULT`, `MOVING_PLAYER`, `QUESTION`, `MYSTERY`, `QUESTION_RESULT`, `PROBABILITY_STORM`, `TURN_TRANSITION`, `GAME_OVER`, `CERTIFICATE`. Daftar transisi kanonik ada di `core/Game.js` dan digambarkan pada flow-requirement. Transisi berulang ke state yang sama no-op; invalid transition melempar error.

Tidak ada EventBus. Pesan lintas state disampaikan melalui `Game.transition(state, event)`/`GameContext.event`, dan state action callbacks. Sebagian callback asynchronous/timer tetap di luar kendali lifecycle FSM.

## 10. Data contract

### Question bank

Setiap file level berupa object dengan `difficulty` dan array berdasarkan tipe. Contoh record:

```json
{
  "id": "E-MC-01",
  "question": "Teks soal",
  "options": ["A", "B", "C"],
  "answer": 1,
  "explanation": "Alasan jawaban",
  "time_limit": 30
}
```

Field `options` digunakan multiple choice dan `answer` adalah indeks 0-based; true/false menggunakan boolean. Essay memakai `answer` string dan `input_type` (`math`, `set`, atau `text`); `what_if` juga memakai input type sesuai data/UI. `explanation` tidak wajib ada pada semua record, tetapi disarankan. Loader menambahkan/melengkapi array tipe kosong dan memakai fallback bila fetch file gagal. Source tidak menunjukkan schema validation formal.

### Coin goal

Goal JSON adalah array object dengan `id`, `goal`, `target` (angka positif), `targetSide` (`A`/`G`), dan `explanation`. Source menyalin array JSON ke CoinSystem; validasi schema formal tidak terlihat. Goal default berada di `systems/CoinSystem.js` sebagai fallback.

### Player/session/storage

Player memiliki `name`, `image`, `score`, `stats`. Posisi, stats, current turn, question, dan event berada di memori. `localStorage` hanya menyimpan flag tutorial `snares-and-ladders-tutorial-seen`; tidak ada session/progress persistence.

## 11. Randomness dan aturan deterministik

DiceSystem, CardSystem, CoinSystem menerima random function (default `Math.random`) sehingga dapat dikontrol dalam test. Question selection dan special tile generation di controller juga menggunakan `Math.random`. Special tiles diacak memakai random comparator `Array.sort`, sehingga distribusinya tidak seragam dan tidak mudah diuji deterministik. Bila mengubah aturan, pertahankan reproducibility dengan dependency random yang diinjeksi.

## 12. Integrasi UI, aset, dan error behavior

- UI modules mencari elemen dengan DOM ID/class; inline HTML handler dipasang pada `window` oleh controller. Perubahan ID/handler perlu perubahan sinkron pada semua pemanggil.
- Library eksternal/CDN memerlukan akses jaringan; MathLive, audio autoplay policy, dan html2canvas perlu browser interaction validation.
- Question fetch punya fallback per-file; coin goal fetch ditangani di bootstrap dengan goal bawaan tetap tersedia.
- `downloadCertificate()` bergantung pada global `html2canvas` dan area DOM certificate yang tersedia.
- Audio play dapat ditolak browser sebelum interaksi pengguna; controller memakai beberapa `.catch()`, tetapi tidak ada bukti matriks browser.

## 13. Testing, batas, dan technical debt

Automated test berada di `tests/` dan mencakup system rules terpilih serta lifecycle FSM/card/coin. Hasil historis dan batas pengujian dilacak pada [test.md](test.md); jangan menganggap hasil historis sebagai run terbaru. Belum terbukti secara formal: end-to-end gameplay, seluruh modal, audio, CDN, MathLive, cross-browser/responsive, accessibility, serta file download.

Risiko teknis yang perlu diprioritaskan:

1. Pemusatan orkestrasi dan asynchronous timers di `script.js` memungkinkan callback lama/duplikat mengubah state.
2. Evaluasi input text menerima substring; dapat menghasilkan false positive.
3. Definisi fortune menyimpan nilai 3 sementara resolver menggunakan nilai dadu.
4. Tile shuffle memakai comparator acak, bukan Fisher–Yates.
5. Penutupan soal kini merupakan submit kosong/salah agar state/turn berjalan melalui jalur normal; regression/browser test khusus belum tercatat.

## 14. Panduan perubahan dan prioritas

1. Sebelum menambah fitur, cek status fitur/aturan pada GDD dan transisi di `core/Game.js`.
2. Letakkan kalkulasi murni di `systems/`, DOM di `ui/`, lifecycle tipis di `states/`, wiring di `script.js`.
3. Untuk perubahan schema soal/goal, sinkronkan loader, UI, fallback, dan test.
4. Setiap transisi asynchronous harus punya state yang sah, guard duplikasi, dan strategi membatalkan timer.
5. Tambahkan test fokus, jalankan `node --test tests/*.test.mjs`, lalu catat output nyata di `test.md`.
6. Jalankan acceptance browser untuk alur yang tersentuh. Release belum dapat dinyatakan siap tanpa bukti tersebut.

Status release/version formal: UNKNOWN; repository tidak menunjukkan tag/release record yang dapat diverifikasi.
