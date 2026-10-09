# Panduan Operasional dan Pengembangan

Panduan serah-terima untuk operator/pengajar dan pengembang yang melanjutkan project. Ini menjelaskan penggunaan dan pemeliharaan berdasarkan source saat ini; bukan jaminan bahwa seluruh browser atau semua interaksi sudah diuji. Untuk desain produk lihat [GDD-TDD.md](GDD-TDD.md), struktur modul [ARCHITECTURE.md](ARCHITECTURE.md), diagram alur [flow-and-requirement.md](flow-and-requirement.md), dan bukti uji [test.md](test.md).

## 1. Ringkasan operasional

Project adalah game web statis untuk 2–4 pemain yang bermain bergantian pada satu perangkat. Tidak memerlukan akun/server/backend untuk satu sesi. Progress sesi hanya berada di memori browser; status tutorial pernah dilihat disimpan di `localStorage`. Tidak ada panel admin untuk mengelola soal atau hasil.

## 2. Menjalankan game

### Kebutuhan

- Browser desktop modern dengan JavaScript aktif.
- Disarankan server HTTP lokal karena game menggunakan ES modules dan `fetch()` untuk soal/goal JSON.
- MathLive, html2canvas, Font Awesome, dan Google Fonts dirujuk dari CDN; koneksi internet diperlukan untuk memuat library eksternal tersebut.
- Audio memerlukan interaksi awal pengguna pada browser yang menerapkan autoplay policy.

### Menjalankan dari folder project

1. Buka folder project di editor.
2. Jalankan `index.html` dengan ekstensi server lokal seperti Live Server di VS Code.
3. Buka alamat HTTP lokal yang diberikan server pada browser.
4. Buka Developer Tools Console jika layar kosong atau konten/data eksternal tidak tampil; lihat troubleshooting di bawah.

Tidak ada command build atau package manager yang ditemukan. Hindari memindahkan `index.html` sendirian: path relatif ke `script.js`, `style.css`, question JSON, audio, gambar, dan ikon harus tetap valid.

### Alur memulai sesi

1. Pada menu utama tekan tombol untuk mulai.
2. Pilih jumlah pemain (2, 3, atau 4).
3. Atur nama/avatar pemain yang aktif dan pilih tingkat kesulitan easy, standard, atau hard.
4. Mulai game. Sesi mereset posisi/statistik pemain dan memilih special tile secara acak.
5. Gunakan tombol/area dadu untuk pemain yang mendapat giliran. Pion, indikator giliran, dan modal menunjukkan keadaan sesi.

Tombol tutorial/panduan dan info dalam game dapat digunakan untuk orientasi. Perubahan yang diterapkan pada pengaturan hanya berlaku pada sesi tersebut.

## 3. Cara bermain dan aturan yang perlu diketahui operator

- Pemain bergiliran melempar satu dadu bernilai 1–6.
- Setelah animasi dadu, pemain memilih satu kartu dari tiga kategori: fortune, penalty, atau game.
- Fortune bergerak memakai nilai dadu; penalty mengakhiri giliran tanpa gerak; kartu game membuka aktivitas lempar koin.
- Goal koin menentukan sisi target A/G dan jumlah keberhasilan. Sisi yang tidak sesuai tidak menambah progress; setelah target tercapai pion bergerak memakai nilai dadu giliran itu.
- Posisi tile khusus memunculkan soal. Jawaban benar pada tile biasa memberi bonus satu langkah; jawaban salah/timeout tidak memberi bonus. Mystery benar memberi reward acak 2–5 langkah; salah mundur satu langkah.
- Tile yang juga menjadi awal ular/tangga menerapkan Guardian: jawaban menentukan apakah pemain dapat naik/selamat.
- Probability Storm berjalan berkala (runtime 180 detik), jika permainan tidak sedang rolling/memproses jawaban. Setiap pemain dalam antrean mendapat soal Storm dengan batas waktu 30 detik; jawaban benar memberi gerak 3 langkah.
- Pemenang adalah pemain yang mencapai posisi 100. Board menggunakan aturan pantulan untuk gerakan yang melewati finish.
- Tombol tutup pada modal soal diperlakukan sebagai menyerah: jawaban kosong dinilai salah, lalu aturan penalti/giliran normal berlaku. Ini bukan tombol jeda.
- Reload memulai sesi baru. Tidak ada fitur lanjutkan sesi sebelumnya.

Aturan merupakan deskripsi kode saat ini. Jika ada perbedaan dengan instruksi in-game atau materi pembelajaran, catat dan klarifikasi dengan pemilik produk sebelum mengubah bank soal/aturan.

## 4. Struktur kerja untuk pengembang baru

| Path | Gunakan saat... |
|---|---|
| `index.html`, `style.css` | Mengubah struktur halaman, DOM ID/class, atau styling/responsive layout. |
| `script.js` | Mengubah wiring runtime, callback inline, bootstrap/fetch, timer, audio, atau alur controller. Periksa kemungkinan efek lintas fitur karena file ini memegang banyak global. |
| `core/` | Mengubah state constants, aturan transisi, lifecycle FSM, dan context/action/event contract. |
| `states/` | Menambahkan/mengubah tindakan saat masuk state. State sebaiknya tetap berupa lifecycle delegate, bukan tempat aturan DOM/game yang besar. |
| `systems/` | Mengubah perhitungan/aturan yang dapat diuji tanpa DOM: gerak, jawaban, scoring, card, coin, dan seterusnya. |
| `ui/` | Mengubah rendering DOM, input, dan callback presentation. Pertahankan selector yang dirujuk HTML. |
| `question/`, `subgame/goals.json` | Menambah atau memperbaiki konten JSON. Pertahankan schema yang dibaca system/UI. |
| `tests/` | Menambah regression test system dan FSM. Test Node yang ada tidak menggantikan uji browser. |
| `audio/`, `images/` | Mengelola aset. Periksa semua URL relatif yang menggunakannya. |

### Urutan memahami alur sebelum mengubah fitur

1. Baca peta FSM pada [flow-and-requirement.md](flow-and-requirement.md) dan pastikan edge terhadap `core/Game.js`.
2. Ikuti entry point `index.html` → `script.js` bootstrap → pembuatan `GameContext`/`Game` → state handler → actions → system/UI.
3. Cari pemanggil UI dan inline handler dengan pencarian nama fungsi/DOM ID, jangan hanya mengubah satu sisi.
4. Untuk aksi asynchronous, catat timer yang dibuat, state asal/tujuan, kondisi guard, dan cara membatalkan/menolak callback yang sudah usang.
5. Perbarui dokumentasi yang sesuai dan `test.md` hanya dari hasil test yang benar-benar dijalankan.

Tidak ada EventBus. State berkomunikasi lewat `Game.transition(state, event)` dan `GameContext.actions`; event diperlakukan sebagai payload transisi. Jangan menambah mekanisme komunikasi lain tanpa kebutuhan pemisahan yang jelas.

## 5. Mengelola konten soal

File bank soal:

- `question/easyQuestion.json`
- `question/standarQuestion.json` (nama file memang memakai ejaan `standar`)
- `question/hardQuestion.json`
- `question/mysteryQuestion.json`

Loader mengharapkan object level dengan array tipe soal seperti `multiple_choice`, `true_false`, `essay`, dan `what_if`. Bentuk record yang aman mengikuti data di file yang sama:

```json
{
  "id": "E-MC-99",
  "question": "Pertanyaan yang jelas",
  "options": ["Pilihan A", "Pilihan B", "Pilihan C"],
  "answer": 1,
  "explanation": "Penjelasan jawaban",
  "time_limit": 30
}
```

Pedoman per tipe:

- `multiple_choice`: sertakan `options`; `answer` adalah indeks pilihan berbasis nol (pilihan pertama `0`).
- `true_false`: `answer` harus JSON boolean `true` atau `false`.
- `essay`: isi `answer` dan `input_type` dengan `math`, `set`, atau `text` sesuai input yang ditampilkan UI.
- `what_if`: ikuti field `input_type` dan bentuk `answer` pada data what-if yang ada; UI mendukung input math atau text.
- `time_limit` memakai detik. `explanation` sangat disarankan meski ada record saat ini yang tidak memilikinya.
- Jaga setiap `id` unik dalam bank. Tinjau materi, jawaban, ejaan, dan penjelasan bersama pengajar.

Tambahkan soal pada array bertipe yang sesuai, pertahankan JSON valid, lalu verifikasi soal muncul dan bisa dijawab menggunakan server lokal. Fallback tersedia untuk kegagalan load file; fallback bukan pengganti validasi konten.

## 6. Mengelola goal subgame koin

`subgame/goals.json` adalah array. Setiap object menggunakan:

```json
{
  "id": "coin-11",
  "goal": "Lemparkan koin sampai mendapat sisi angka sebanyak 5 kali",
  "target": 5,
  "targetSide": "A",
  "explanation": "Jelaskan cara menghitung target."
}
```

`target` adalah jumlah keberhasilan yang dibutuhkan; `targetSide` harus `A` atau `G`. Pertahankan ID unik dan penjelasan yang konsisten dengan target. `CoinSystem` memiliki default goals di source jika file gagal dimuat. Jika mengubah schema, update loader, UI, fallback, dan test bersama-sama.

## 7. Mengubah gameplay atau memperkenalkan state

1. Sebelum menambah fitur, cek status fitur/aturan pada GDD dan transisi di `core/Game.js`.
2. Jika ada state baru, tambahkan constant pada `core/GameState.js`, incoming/outgoing edges pada `core/Game.js`, handler di `states/`, action wiring di `script.js`, dan FSM tests.
3. Letakkan aturan deterministik pada system; masukkan sumber random sebagai dependency bila hasil perlu deterministic test.
4. Letakkan tampilan/input pada UI module; jaga HTML ID dan global callback tetap cocok sampai semua call site dimigrasikan.
5. Lindungi submit/klik ganda dan async callback dengan guard. Pertimbangkan bahwa timer question, movement, Storm, dan audio tersebar di controller.
6. Perbarui GDD/TDD, flow, architecture, dan test report hanya pada bagian yang berubah.

## 8. Pengujian dan penerimaan perubahan

Perintah test Node yang tercatat:

```bash
node --test tests/*.test.mjs
```

Jalankan dari root project. Catat output aktual dan waktu run; jangan menyalin jumlah historis seolah hasil baru. Setelah test system/FSM, lakukan uji browser untuk alur yang disentuh—khususnya interaksi modal, timer, pemuatan JSON, audio/CDN, dan download sertifikat bila relevan. Daftar coverage serta status historis ada di [test.md](test.md).

Checklist acceptance minimal untuk perubahan gameplay:

- Alur normal, jawaban benar/salah, timeout, serta pergantian pemain.
- Klik cepat/duplikat dan penutupan modal.
- Special tile, ladder/snake/Guardian dan finish bila perubahan menyentuh movement.
- Card/coin/Storm jika perubahan berpotensi berinteraksi dengan event tersebut.
- Tidak ada error console atau fetch yang gagal tanpa fallback yang diharapkan.
- Layout dan kontrol tetap dapat dipakai pada ukuran layar target.

Checklist ini adalah prosedur yang disarankan, bukan hasil test yang sudah terjadi.

## 9. Troubleshooting

| Gejala | Pemeriksaan awal |
|---|---|
| Halaman kosong atau module error | Pastikan dijalankan via HTTP server lokal; periksa Console dan path relatif `script.js`. |
| Soal/goal tidak muncul | Periksa Network tab untuk `question/*.json` dan `subgame/goals.json`, status HTTP, JSON syntax, serta nama file `standarQuestion.json`. Loader question punya fallback; coin system memakai goal default. |
| Math field/keyboard tidak tampil | Periksa koneksi CDN MathLive, Console, dan apakah script external berhasil dimuat. |
| Audio tidak berbunyi | Interaksikan dulu dengan halaman, cek Console/Network dan path `audio/`; autoplay dapat diblokir browser. |
| Tombol inline tidak berfungsi | Pastikan nama handler masih diekspor melalui `Object.assign(window, ...)` pada `script.js` dan selector/element benar. |
| Transition error | Catat current state, target state, event payload; bandingkan dengan `TRANSITIONS` di `core/Game.js`. Jangan menutupi error dengan memaksa state langsung. |
| Certificate tidak terunduh | Periksa global `html2canvas`, elemen `certificateExportArea`, akses CDN, dan Console. Browser test diperlukan untuk memastikan file benar-benar terunduh. |
| Tutorial selalu tampil lagi | Periksa izin/availability `localStorage` dan key `snares-and-ladders-tutorial-seen`; storage yang ditolak browser ditangani sebagai belum pernah melihat. |

## 10. Operasi, rilis, dan serah-terima

- Tidak ada backend, database, build pipeline, deployment workflow, atau release tag formal yang teridentifikasi. Host sebagai static site dengan seluruh struktur path dipertahankan.
- Sebelum rilis, jalankan test suite, uji browser penuh, periksa CDN/asset, responsivitas, aksesibilitas, dan ekspor sertifikat. Simpan versi commit dan bukti hasil.
- Untuk sesi kelas, siapkan satu perangkat per grup pemain, browser dengan akses aset/CDN yang diperlukan, dan rencana jika audio diblokir. Hasil permainan tidak akan tersimpan setelah reload.
- Hindari menaruh data siswa pribadi pada nama pemain jika perangkat/browser dipakai bersama; nama/avatar adalah data lokal yang tampak di sesi/sertifikat.
- Saat serah-terima, catat pemilik konten soal, versi source, browser yang diuji, hasil aktual, dependensi CDN, dan isu yang masih terbuka. Tidak ditemukan data pemilik/jenjang kurikulum maupun kebijakan privasi formal di repository; klarifikasi sebelum penggunaan institusional.

## 11. Daftar informasi yang belum terkonfirmasi

- Jenjang pendidikan, standar kurikulum, dan pemilik persetujuan bank soal.
- Browser/perangkat minimum dan dukungan offline.
- Proses deployment, versioning, backup, dan rollback.
- Kriteria resmi release dan prosedur acceptance.
- Kebijakan aksesibilitas/privasi untuk penggunaan kelas.

Jika informasi diperlukan sebelum perubahan berisiko, tandai sebagai `UNKNOWN` dan minta keputusan product owner; jangan mengarang aturan baru dari nama file atau komentar.
