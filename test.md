# Catatan Pengujian

Dokumen ini memisahkan hasil yang pernah dilaporkan dari pemeriksaan source saat sinkronisasi dokumentasi. **Test suite tidak dijalankan ulang dalam pembaruan dokumentasi ini.** Adanya test case atau implementasi tidak otomatis membuktikan fitur browser PASS.

## Status dan aturan bukti

- `PASS`: test dijalankan dan hasil aktual sesuai ekspektasi, dengan bukti run.
- `FAIL`: test dijalankan dan perilaku aktual gagal.
- `PARTIAL`: sebagian cakupan berhasil, namun syarat/varian penting belum tercakup.
- `BLOCKED`: eksekusi tidak dapat dilanjutkan karena hambatan yang tercatat.
- `NOT TESTED`: belum ada bukti eksekusi yang bisa dipastikan.

Jenis validasi dibedakan menjadi unit/system (Node), FSM/state (Node), dan browser integration/acceptance. Test Node tidak membuktikan DOM, audio, CDN, timer real-time, atau unduhan browser.

## Bukti historis yang tercatat

| Sumber historis | Klaim dalam dokumen | Penilaian audit |
|---|---|---|
| Versi dokumen `test.md` sebelum sinkronisasi | 15 skenario black-box U-01–U-15 semuanya `Valid`; bukti pendukung menyebut `11 pass, 0 fail`. | Klaim historis dipertahankan sebagai catatan, bukan hasil yang tervalidasi ulang. Tidak ada log/run detail; tabel black-box tidak membuktikan 15 interaksi browser benar-benar dijalankan. |
| `DEVELOPMENT_REPORT.md` / `DEVELOPMENT_STATUS.md` | `node --test tests/*.test.mjs`: 25 pass, 0 fail; report menyebut sekitar 90 ms. | Laporan historis terbaru yang ditemukan, tetapi output test mentah dan tanggal run tidak tersedia dalam dokumen; tidak dijalankan ulang di audit ini. |
| Catatan browser historis `DEVELOPMENT_REPORT.md` | Halaman aktif mencapai `document.readyState === "complete"` dan shell game tampil. | Smoke-load saja; tidak membuktikan game penuh, aset eksternal, atau semua interaksi. Report juga menyatakan full browser interaction/cross-browser masih perlu. |

Angka `11` dan `25` tidak konsisten sebagai hasil suite. Inventaris source test yang dibaca saat sinkronisasi berisi 28 deklarasi `test()` di tiga file (14 system, 10 state/FSM, 4 coin). Jumlah deklarasi bukan bukti jumlah test yang lulus. Status run terkini: **NOT TESTED**.

## Inventaris coverage otomatis yang tersedia

| File | Coverage yang didefinisikan | Status pada pembaruan ini |
|---|---|---|
| `tests/game-systems.test.mjs` | Reset pemain; rentang dadu/rotasi giliran; bounce dan tile precedence; resolusi post-move; evaluasi soal/feedback; statistik, timeout, win; probability/draw/effect kartu; deck unik; goal koin. | NOT TESTED ulang. Source test tersedia; laporan historis menyatakan suite lulus, tanpa output mentah di repository. |
| `tests/game-states.test.mjs` | Lifecycle menu/setup; payload dadu/gerak; Storm result/resume; card/coin state flow; payload immutability; coin continuation. | NOT TESTED ulang. FSM lifecycle teruji di unit test, bukan browser. |
| `tests/game-coin.test.mjs` | Hasil coin deterministik, konfigurasi probability, coin state event delivery. | NOT TESTED ulang. |

Perintah yang dicatat dalam laporan sebelumnya:

```bash
node --test tests/*.test.mjs
```

Tidak ada hasil baru yang dilaporkan dari perintah tersebut dalam sinkronisasi ini.

## Matriks skenario fungsional

Tabel berikut adalah kebutuhan uji dan status bukti saat ini, bukan klaim bahwa semua langkah sudah dieksekusi. Uji browser perlu merekam hasil aktual per skenario.

| ID | Skenario / input utama | Hasil yang diharapkan | Hasil aktual / status bukti |
|---|---|---|---|
| B-01 | Muat aplikasi pada HTTP lokal | Menu tampil; module dan JSON dimuat atau fallback digunakan. | Smoke-load historis dilaporkan; fetch detail NOT TESTED. |
| B-02 | Pilih 2, 3, 4 pemain; isi nama/avatar | Profil sesuai pilihan dan dapat memulai sesi. | Source UI tersedia; browser acceptance NOT TESTED. |
| B-03 | Pilih easy/standard/hard | Board/tile/question difficulty mengikuti pilihan. | Source ada; browser acceptance NOT TESTED. |
| B-04 | Lempar dadu | Hasil 1–6 dan urutan card/movement sesuai state. | System dice test tercatat dalam source; full flow NOT TESTED. |
| B-05 | Pilih setiap kategori kartu | Fortune bergerak sesuai dadu; penalty melewatkan gerak; game membuka goal koin. | System/FSM coverage sebagian; integrasi modal NOT TESTED. |
| B-06 | Toss koin sampai goal selesai | Progress sisi A/G terakumulasi; gerak terjadi sesudah goal selesai. | System/FSM coverage tersedia; browser flow NOT TESTED. |
| B-07 | Tile biasa/pertanyaan; jawaban benar dan salah | Feedback, stats, gerakan, giliran sesuai aturan. | Evaluasi/system test tersedia; browser path NOT TESTED. |
| B-08 | Timeout soal dan menutup modal soal | Timeout/submit kosong diperlakukan salah dan alur FSM tetap dapat melanjutkan. | Timeout system test historis; perilaku tombol tutup berubah pada source dan belum dites ulang. |
| B-09 | Mystery benar/salah | Reward 2–5 atau penalti mundur satu; giliran konsisten. | Source tersedia; tidak ada bukti browser khusus. |
| B-10 | Guardian pada start ular/tangga | Jawaban menentukan naik/selamat atau gagal/turun. | Source tersedia; NOT TESTED browser. |
| B-11 | Timer Storm mencapai nol saat game aman | Antrean pemain, timer soal 30 detik, reward gerak 3, resume dan audio berakhir benar. | Source dan test FSM resume tersedia; timer/audio E2E NOT TESTED. |
| B-12 | Mencapai posisi 100 / overshoot | Pemenang diumumkan pada posisi 100; overshoot mengikuti bounce. | Unit movement/win test tersedia; end-to-end NOT TESTED. |
| B-13 | Tampilkan leaderboard/sertifikat dan unduh PNG | Data sesuai pemain/pemenang dan file terunduh. | Source `CertificateUI` ada; browser/download NOT TESTED. |
| B-14 | Reload/simpan progres | Hanya status tutorial diingat; progres/leaderboard tidak persisten. | Source menunjukkan localStorage tutorial; skenario persistence tidak diuji. |

## Temuan regresi / bug yang perlu diuji

| Temuan | Bukti source | Status test |
|---|---|---|
| Menutup soal sebelumnya menyembunyikan modal dan mengaktifkan dadu tanpa pindah dari state `QUESTION`/`MYSTERY`, sehingga state dan kontrol dapat tidak sinkron. | Perubahan ada pada handler `closeQuestionModal()` di `script.js`; FSM hanya mengizinkan transisi tertentu pada `core/Game.js`. Handler kini memanggil `submitAnswer(currentQuestion, "")`, menyembunyikan modal, dan mengembalikan audio. | Perbaikan source telah dibuat; regression test dan browser validation NOT TESTED. Perilaku tutup sekarang berarti menyerah/salah. |
| Evaluasi teks menerima substring yang cukup dekat, berpotensi menerima jawaban parsial. | `systems/QuestionSystem.js`, cabang input `text`. | Test untuk batas false-positive NOT TESTED / belum ditemukan. |
| Controller memiliki banyak `setTimeout`/`setInterval`; callback bisa beradu dengan pergantian state. | `script.js` untuk soal, gerakan, Storm, audio. | Race/timing coverage browser NOT TESTED. |
| Efek fortune punya `effect.value: 3`, sementara resolver menggerakkan berdasarkan dadu. | `systems/CardSystem.js` definition dan `resolveEffect()`. | System test mengharapkan gerak sama dengan nilai dadu; konsistensi pesan/aturan browser NOT TESTED. |

## Pengujian yang masih diperlukan

1. Jalankan ulang Node test suite dan simpan output aktual (tanggal, Node version, pass/fail, durasi).
2. Tambahkan regression test untuk menutup soal dari `QUESTION` dan `MYSTERY`; pastikan submit kosong hanya diproses sekali serta state/turn sesuai.
3. Jalankan satu sesi browser penuh dan catat card→coin, soal, Guardian, Storm, menang, sertifikat, serta unduhan PNG.
4. Verifikasi fetch JSON, fallback, MathLive, autoplay/audio, dan CDN melalui server lokal.
5. Uji Chromium/Edge/Firefox/Safari yang tersedia, viewport desktop/tablet/mobile, keyboard/focus, serta skenario timeout/callback bersaing.

Belum ada status `FAIL` terbaru yang dapat dipastikan karena suite tidak dijalankan ulang. Ketiadaan bukti bukan PASS; semua hasil yang belum diverifikasi tetap `NOT TESTED` atau `PARTIAL` sebagaimana tabel di atas.
