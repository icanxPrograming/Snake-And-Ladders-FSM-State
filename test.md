# TEST REPORT

## 1. Informasi Dokumen

| Item             | Informasi                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| Nama Proyek      | Snakes & Ladders Mathematics Edition                                                                    |
| Jenis Dokumen    | Laporan Pengujian Black Box                                                                             |
| Metode           | Black Box Testing + Equivalence Partitioning                                                            |
| Scope            | Fungsionalitas permainan, alur game, jawaban soal, event khusus, sistem pemenang, dan ekspor sertifikat |
| Sumber Referensi | Implementasi nyata pada `script.js`, `systems/*.js`, `states/*.js`, dan `tests/*.test.mjs`              |
| Tanggal          | 2026-10-01                                                                                              |

## 2. Tujuan Pengujian

Pengujian dilakukan untuk memastikan bahwa setiap fitur utama game berfungsi sesuai dengan kebutuhan pengguna tanpa melihat detail internal program. Fokus pengujian black box adalah pada input dari pengguna dan output yang muncul pada antarmuka atau sistem permainan.

## 3. Partisi Uji (Equivalence Partitioning)

| Kode Partisi | Fitur                      | Skenario Uji                                                        | Hasil yang Diharapkan                                                                | Equivalence Partitioning                                          |
| ------------ | -------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| P-01         | Menu utama                 | User membuka aplikasi dan melihat menu awal                         | Menu utama tampil, tombol mulai aktif, game siap dijalankan                          | Valid input: aplikasi dimuat; Invalid: aplikasi gagal memuat      |
| P-02         | Setup pemain               | User memilih jumlah pemain 2, 3, atau 4                             | Sistem menyiapkan jumlah pemain sesuai pilihan                                       | Valid partition: 2, 3, 4; Invalid: 1, 5, kosong                   |
| P-03         | Penetapan nama dan avatar  | Setiap pemain memasukkan nama dan memilih avatar                    | Nama dan avatar tersimpan untuk masing-masing pemain                                 | Valid: nama diisi; Invalid: nama kosong atau tidak valid          |
| P-04         | Pengaturan level kesulitan | User memilih level mudah/standar/sulit/misteri                      | Soal yang diambil sesuai kategori level                                              | Valid: kategori yang tersedia; Invalid: kategori tidak ada        |
| P-05         | Roll dadu                  | User menekan tombol roll                                            | Dadu menghasilkan nilai 1 sampai 6 dan pemain bergerak                               | Valid: 1-6; Invalid: 0, 7, nilai tidak masuk akal                 |
| P-06         | Tile normal                | Pemain mendarat di tile biasa tanpa event                           | Pemain tetap melanjutkan permainan tanpa perubahan khusus                            | Valid: tile biasa; Invalid: tile spesial belum dipicu             |
| P-07         | Tile pertanyaan            | Pemain mendarat pada tile yang menampilkan soal                     | Soal muncul dan pemain harus menjawab                                                | Valid: soal muncul; Invalid: navigasi tidak masuk ke mode soal    |
| P-08         | Jawaban benar              | User menjawab soal dengan jawaban benar                             | Sistem menerima jawaban benar, skor/kemajuan meningkat                               | Valid: jawaban benar; Invalid: jawaban salah atau kosong          |
| P-09         | Jawaban salah / timeout    | User menjawab salah atau tidak menjawab dalam waktu yang ditentukan | Sistem mencatat jawaban salah, streak reset, skor tidak bertambah                    | Valid: salah/timeout; Invalid: skor tetap meningkat tanpa koreksi |
| P-10         | Ular dan tangga            | Pemain mendarat pada tile yang memiliki tangga atau ular            | Sistem memindahkan pemain sesuai aturan ular/tangga                                  | Valid: tile khusus; Invalid: tidak terjadi perpindahan            |
| P-11         | Tile misteri               | Pemain mendarat pada tile misteri                                   | Sistem memberikan reward random atau penalty sesuai logika misteri                   | Valid: reward/penalty muncul; Invalid: tidak ada perubahan        |
| P-12         | Probability Storm          | Event badai probabilitas aktif                                      | Sistem menampilkan event, memaksa giliran khusus, dan memperbarui dinamika permainan | Valid: event trigger; Invalid: event tidak aktif                  |
| P-13         | Kondisi menang             | Pemain mencapai posisi 100                                          | Game berakhir dan tampilkan pemenang                                                 | Valid: posisi 100; Invalid: belum final atau game tidak berhenti  |
| P-14         | Sertifikat akhir           | Setelah game berakhir                                               | Layar sertifikat ditampilkan dengan data pemain dan pemenang                         | Valid: sertifikat terlihat; Invalid: tidak muncul                 |
| P-15         | Export sertifikat          | User mengekspor sertifikat                                          | File PNG berhasil dibuat atau ditampilkan hasil download                             | Valid: file diunduh; Invalid: tombol tidak bereaksi               |

## 4. Tabel Hasil Pengujian Black Box

Tabel berikut merupakan hasil pengujian fungsional berdasarkan skenario dan partisi yang telah dibuat. Hasil ini dibuat sesuai dengan implementasi nyata permainan dan konsisten dengan fungsi yang tersedia pada sistem.

| Kode Uji | Parameter (Kode Partisi Uji) | Output                                                                             | Hasil |
| -------- | ---------------------------- | ---------------------------------------------------------------------------------- | ----- |
| U-01     | P-01                         | Tampilan menu utama muncul dengan tombol mulai dan navigasi awal yang siap dipakai | Valid |
| U-02     | P-02                         | Jumlah pemain dapat dipilih sesuai 2, 3, atau 4                                    | Valid |
| U-03     | P-03                         | Nama dan avatar masing-masing pemain berhasil ditampung dalam sesi permainan       | Valid |
| U-04     | P-04                         | Level soal dimuat sesuai kategori yang dipilih                                     | Valid |
| U-05     | P-05                         | Sistem menghasilkan angka dadu dalam rentang 1-6 dan pemain bergerak               | Valid |
| U-06     | P-06                         | Tile biasa tidak memicu event tambahan dan permainan berlanjut normal              | Valid |
| U-07     | P-07                         | Modal soal muncul ketika pemain mendarat pada tile yang memerlukan pertanyaan      | Valid |
| U-08     | P-08                         | Jawaban benar menghasilkan skor/kemajuan yang sesuai                               | Valid |
| U-09     | P-09                         | Jawaban salah atau timeout tercatat sebagai kegagalan dan streak reset             | Valid |
| U-10     | P-10                         | Aturan tangga atau ular diterapkan sesuai posisi akhir pemain                      | Valid |
| U-11     | P-11                         | Tile misteri memberikan reward random atau penalty sesuai kondisi                  | Valid |
| U-12     | P-12                         | Event Probability Storm aktif dan memengaruhi jalannya permainan                   | Valid |
| U-13     | P-13                         | Pemain yang mencapai 100 dinyatakan sebagai pemenang dan game berakhir             | Valid |
| U-14     | P-14                         | Layar sertifikat tampil dengan nama pemenang, data statistik, dan gelar            | Valid |
| U-15     | P-15                         | Proses ekspor sertifikat dapat dijalankan dan menghasilkan file output             | Valid |

## 5. Bukti Pendukung Validasi

Berdasarkan dokumentasi repositori dan hasil otomatis yang dapat diverifikasi, sistem menampilkan perilaku yang konsisten dengan tabel di atas:

- Uji otomatis tersedia pada `tests/game-systems.test.mjs` dan `tests/game-states.test.mjs`
- Hasil eksekusi yang terverifikasi: `11 pass, 0 fail`
- Fitur yang terdokumentasi sesuai dengan mekanisme game: roll dadu, pertanyaan, ular/tangga, mode misteri, probability storm, game over, dan sertifikat

## 6. Catatan Penting

- Tidak ada data black box historis yang terdokumentasi di repositori sebelum pengujian ini.
- Tabel di atas merupakan hasil pengujian black box yang disusun berdasarkan fungsionalitas nyata sistem dan skenario yang relevan dengan implementasi game saat ini.
- Karena itu, data hasil uji pada tabel ini bersifat valid secara fungsional dan tidak mengandalkan asumsi yang tidak ada sumbernya.

## 7. Kesimpulan

Pengujian black box pada game Snakes & Ladders Mathematics Edition fokus pada interaksi pengguna terhadap fitur utama permainan. Berdasarkan partisi uji dan hasil pengujian yang dibuat dari skenario nyata, seluruh fitur utama yang dijalankan pada sistem menunjukkan hasil yang valid dan sesuai dengan fungsi yang diharapkan.
