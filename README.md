# 🐍 Petualangan Probabilitas: Ular & Tangga Matematika

Game edukasi berbasis web untuk 2–4 pemain lokal. Permainan menggabungkan board ular tangga dengan soal peluang, pilihan kartu, subgame koin, dan event Probability Storm. Project dibuat dengan HTML, CSS, JavaScript vanilla, dan berjalan sebagai frontend statis.

> Implementasi fitur dapat dilihat di source; validasi browser menyeluruh belum tercatat. Status pengujian historis dan keterbatasannya dijelaskan di [test.md](test.md).

## ✨ Fitur permainan

### 🎮 Mekanisme inti

- 🎲 **Setup dan giliran:** pilih 2–4 pemain, atur nama/avatar, pilih kesulitan, lalu bergiliran melempar dadu 1–6 pada board 1–100.
- 🧠 **Tile soal:** tile easy, standard, dan hard memberikan soal sesuai tingkatnya. Jawaban benar pada tile biasa memberi bonus satu langkah; jawaban salah atau timeout tidak memberi bonus.
- 🟣 **Mystery tile:** jawaban benar memberi reward acak 2–5 langkah; jawaban salah membuat pemain mundur satu langkah.
- 🐍 **Ular, tangga, dan Guardian:** posisi khusus dapat memicu perpindahan ular/tangga. Pada tile Guardian, jawaban menentukan apakah pemain dapat naik atau selamat.

### 🃏 Kartu dan subgame

- 🍀 **Fortune:** bergerak memakai nilai dadu saat itu.
- ⏭️ **Penalty:** mengakhiri giliran tanpa gerak.
- 🪙 **Game card:** membuka subgame koin. Selesaikan target sisi A atau G untuk bergerak sesuai nilai dadu.

### 🌪️ Event dan hasil permainan

- ⏱️ **Probability Storm:** event otomatis setiap 3 menit, menunggu sampai permainan aman untuk menyela. Pemain menjawab bergiliran dengan batas waktu 30 detik; jawaban benar memberi gerak 3 langkah.
- 🏆 **Statistik dan gelar:** sesi mencatat jawaban, streak, ular/tangga, Storm win, dan statistik lain untuk hasil akhir.
- 📜 **Leaderboard dan sertifikat:** tampilkan peringkat sesi dan ekspor sertifikat pemenang sebagai PNG melalui html2canvas.
- 🎶 **Nuansa Sunda:** musik dan efek suara lokal memberi identitas audio pada permainan.

## 🚀 Cara menjalankan

1. Clone repository:

   ```bash
   git clone https://github.com/icanxPrograming/Snake-And-Ladders-FSM-State.git
   ```

2. Buka folder project di editor.
3. Sajikan `index.html` melalui server HTTP lokal, misalnya ekstensi **Live Server** di VS Code.
4. Buka alamat lokal yang diberikan server pada browser.

Project tidak memiliki langkah build atau package manager yang terdeteksi. Server lokal disarankan karena game memuat ES module dan file JSON menggunakan `fetch`; membuka file langsung lewat `file://` dapat membatasi pemuatan tersebut. MathLive, html2canvas, Font Awesome, dan Google Fonts memakai CDN, jadi pemuatan library tersebut memerlukan akses jaringan. Audio browser mungkin baru dapat diputar setelah interaksi pengguna.

## 🕹️ Alur singkat bermain

1. Dari menu, mulai permainan; pilih jumlah pemain.
2. Atur nama/avatar dan tingkat kesulitan, lalu mulai sesi.
3. Pemain sesuai indikator giliran melempar dadu dan memilih kartu.
4. Selesaikan efek kartu dan gerak. Jika mendarat pada tile soal atau event khusus, ikuti modal yang tampil.
5. Giliran berpindah sampai seorang pemain mencapai posisi 100.
6. Lihat leaderboard/sertifikat; halaman dapat di-reload untuk memulai sesi baru.

> Tombol tutup pada modal soal saat ini berarti menyerah: sistem mengirim jawaban kosong dan menilainya salah. Sesi permainan tidak disimpan; hanya status tutorial yang menggunakan `localStorage`.

## 🗂️ Struktur project

```text
.
├── index.html                 # Halaman dan DOM game; memuat script.js sebagai module
├── style.css                  # Tampilan dan layout
├── script.js                  # Entry point, composition root, controller, timer/audio
├── core/                      # Game, StateMachine, GameState, GameContext
├── states/                    # Lifecycle state menu, gameplay, question, event, hasil
├── systems/                   # Aturan pemain, gerak, soal, skor, kartu, koin, dan lainnya
├── ui/                        # Komponen DOM untuk board, modal, kartu, koin, sertifikat
├── question/                  # Bank soal easy, standard, hard, mystery (JSON)
├── subgame/goals.json         # Goal subgame koin
├── audio/                     # Musik dan efek suara
├── images/                    # Board, avatar, ikon
├── tests/                     # Test Node untuk system dan FSM/lifecycle tertentu
├── ARCHITECTURE.md            # Struktur dan tanggung jawab teknis
├── flow-and-requirement.md    # Flowchart, FSM, GDLC, use case, sequence, class diagram
├── GDD-TDD.md                 # Desain game dan technical design
├── guide.md                   # Panduan operasional dan pengembangan
└── test.md                    # Riwayat, cakupan, dan status bukti pengujian
```

## 📚 Bank soal dan goal koin

File soal berada di `question/`:

- `easyQuestion.json`
- `standarQuestion.json` (nama file memakai ejaan `standar`)
- `hardQuestion.json`
- `mysteryQuestion.json`

Bank soal memakai tipe `multiple_choice`, `true_false`, `essay`, dan `what_if`. Pilihan ganda menggunakan indeks jawaban mulai dari 0; benar/salah memakai boolean; essay/what-if menggunakan input type seperti math, set, atau text. `subgame/goals.json` menyimpan goal dengan target sisi `A` atau `G`. Loader soal menyediakan fallback jika file gagal dimuat; struktur data rinci dan cara mengubah konten ada di [guide.md](guide.md).

## 🧪 Pengembangan dan pengujian

Untuk menjalankan test otomatis yang tersedia, gunakan Node.js dari root project:

```bash
node --test tests/*.test.mjs
```

Test mencakup aturan system dan transisi/lifecycle tertentu. Test tersebut bukan pengganti uji browser untuk gameplay penuh, audio, MathLive/CDN, layout lintas perangkat, dan unduhan sertifikat. Angka hasil pengujian pada dokumen lama tidak konsisten; jangan menganggapnya sebagai hasil terbaru. Periksa [test.md](test.md) untuk status dan keterbatasan bukti.

## 📖 Dokumentasi

- [Panduan operasional dan pengembangan](guide.md)
- [Arsitektur project](ARCHITECTURE.md)
- [Alur dan kebutuhan sistem](flow-and-requirement.md)
- [Game Design Document dan Technical Design Document](GDD-TDD.md)
- [Catatan pengujian](test.md)
- [Development status](DEVELOPMENT_STATUS.md)
- [Development report](DEVELOPMENT_REPORT.md)

## 📝 Lisensi & Kredit

Project ini ditujukan untuk pembelajaran matematika. Project dikembangkan sebagai modifikasi dan pengembangan signifikan dari base project original milik **[Yashksaini](https://github.com/yashksaini)**. Atribusi kepada project asal tetap dipertahankan; repository ini tidak memuat file `LICENSE` tersendiri, sehingga ketentuan lisensi harus merujuk pada lisensi yang berlaku pada repository base/original.

### Perubahan besar dari base project original

Pengembangan pada repository ini mencakup perubahan dan penambahan berikut:

- Mengubah permainan ular tangga menjadi game edukasi peluang dengan bank soal JSON, pilihan tingkat kesulitan, evaluasi jawaban, timer, dan feedback penjelasan.
- Menambahkan aturan special tile, Mystery reward/penalty, dan mekanisme Guardian untuk interaksi soal dengan ular/tangga.
- Menambahkan **Probability Storm**: countdown berkala, antrean pemain, soal event, reward gerak, notifikasi, dan pergantian musik/efek audio.
- Menambahkan statistik permainan, streak, gelar dinamis, leaderboard lokal, serta ekspor sertifikat PNG.
- Menambahkan sistem pilihan kartu fortune/penalty/game beserta lifecycle subgame koin dan goal A/G berbasis JSON.
- Menata flow permainan dengan FSM (`core/`, `states/`), memisahkan aturan reusable ke `systems/`, dan presentasi ke `ui/`.
- Menyesuaikan UI/UX untuk profil beberapa pemain serta memasukkan tema audio/visual Sunda.
- Menambahkan test otomatis untuk sebagian system dan lifecycle FSM, serta dokumentasi desain, arsitektur, operasional, dan pengujian.

Daftar di atas merangkum perubahan yang terlihat pada implementasi repository; bukan klaim bahwa seluruh perilaku sudah tervalidasi pada semua browser.

---

Dibuat untuk membuat belajar matematika peluang lebih menyenangkan.
