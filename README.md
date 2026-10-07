# 🐍 Petualangan Probabilitas: Ular & Tangga (Math Edition)

Sebuah permainan edukasi interaktif berbasis web yang menggabungkan mekanisme klasik Ular Tangga dengan tantangan Matematika (Materi Peluang) serta sentuhan budaya lokal. Proyek ini dirancang untuk membuat belajar probabilitas menjadi lebih seru, kompetitif, dan memiliki identitas visual serta auditori yang unik.

## 📋 Status Pengembangan

Proyek saat ini berada pada **Phase 8 — Finalisasi Dokumentasi dan Development Report**. Implementasi utama, card/coin lifecycle, educational feedback, dan regression testing telah selesai. Validasi otomatis mencatat **25 test lulus** dengan **0 kegagalan**.

Lihat [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md) untuk status lengkap, list tugas, risikon, dan hasil validasi. Lihat [DEVELOPMENT_REPORT.md](DEVELOPMENT_REPORT.md) untuk laporan pekerjaan dan catatan release readiness.

## ✨ Fitur Utama

### 🎮 Mekanisme Inti

- **Tantangan Matematika Tematik**: Pemain wajib menjawab soal peluang berdasarkan warna kotak tempat mereka mendarat.
- 🟢 **Kotak Hijau (Mudah)**: Maju 1 langkah.
- 🟡 **Kotak Kuning (Standar)**: Maju 1 langkah.
- 🔴 **Kotak Merah (Sulit)**: Maju 1 langkah.
- 🟣 **Kotak Misteri (Analisis)**: Benar mendapat **Random Reward** (Maju 2-5 langkah secara acak), salah mundur 1 langkah.
- ⚪ **Kotak Free**: Kotak aman tanpa tantangan soal.

### 🌪️ Probability Storm (Badai Probabilitas)

Event otomatis berkala (Default: 3 Menit) yang memicu kompetisi antar semua pemain secara bergantian.

- **Audio Immersif**: Countdown tegang di 30 detik terakhir, diikuti suara sirine saat badai dimulai.
- **Transisi Musik**: Musik latar berubah secara _smooth_ (Fade In/Out) dari nuansa santai ke musik kompetitif.

### 🏆 Achievement & Gamifikasi

- **Guardian Gate**: Mekanisme perlindungan di mana pemain bisa naik tangga atau selamat dari ular hanya jika berhasil menjawab soal.
- **Sistem Statistik & Gelar Dinamis**: Gelar diberikan di akhir permainan berdasarkan gaya main (Contoh: _Sang Arsitek Angka_, _Sang Pemecah Misteri_, _Penyintas Ular_, dll).
- **Sertifikat Digital**: Pemenang mendapatkan sertifikat HD yang memuat statistik detail dan gelar unik, dapat diunduh langsung dalam format PNG.

### 🎶 Nuansa Lokal & Audio Ducking

- **Kultur Sunda**: Integrasi musik instrumen Sunda sebagai identitas permainan.
- **Dynamic Audio Switching**: Transisi otomatis antara musik santai (BGM Utama) dan musik semangat (Event Badai).
- **Smart Ducking**: Volume musik otomatis mengecil (_Duck_) saat modal soal muncul agar pemain tetap fokus pada perhitungan.

## 🛠️ Teknologi yang Digunakan

- **HTML5 & CSS3**: Struktur dan desain responsif menggunakan Flexbox/Grid.
- **JavaScript (Vanilla)**: Logika _Randomized Algorithm_ untuk soal, sistem statistik, dan manajemen audio.
- **MathLive**: Library interaktif untuk pengetikan notasi matematika (LaTeX) yang ramah pengguna.
- **html2canvas**: Teknologi untuk melakukan _render_ DOM ke gambar (Ekspor Sertifikat).
- **Web Audio API Logic**: Sistem _fading_ dan transisi audio kustom untuk pengalaman bermain yang lebih halus.

## 🚀 Cara Menjalankan

1. _Clone_ repository ini:

```bash
git clone https://github.com/icanxPrograming/snake-and-ladders-ATMVersion.git

```

2. Buka folder project.
3. Jalankan file `index.html` di browser pilihan Anda.

- _Sangat disarankan menggunakan ekstensi **Live Server** di VS Code agar fitur fetch JSON soal dan transisi audio berjalan tanpa kendala keamanan browser._

## 📂 Struktur Soal (JSON)

Soal dimuat secara dinamis untuk memudahkan kustomisasi materi:

- `question/easyQuestion.json`: Peluang dasar dan ruang sampel sederhana.
- `question/standarQuestion.json`: Frekuensi harapan dan peluang kejadian tunggal.
- `question/hardQuestion.json`: Kejadian majemuk, saling lepas, dan independen.
- `question/mysteryQuestion.json`: Soal analisis tingkat tinggi (HOTS).

Dokumentasi FSM dan pembagian tanggung jawab modul tersedia di [ARCHITECTURE.md](ARCHITECTURE.md).

## 📜 Lisensi & Kredit

Proyek ini dikembangkan untuk tujuan edukasi dan peningkatan minat belajar Matematika.

### 🙏 Kredit & Modifikasi

Proyek ini merupakan hasil modifikasi dan pengembangan signifikan dari _base project_ original milik **[Yashksaini](https://github.com/yashksaini)**.

**Perubahan besar yang dilakukan:**

- Implementasi mekanisme kuis Matematika di setiap langkah.
- Penambahan sistem _Probability Storm_ dengan manajemen audio kompleks.
- Sistem statistik pemain, gelar (Achievements), dan ekspor sertifikat.
- Optimalisasi UI/UX untuk kebutuhan pembelajaran di kelas.
- Integrasi tema budaya (Sunda) melalui instrumen audio dan visual.

---

**Dibuat dengan ❤️ untuk pendidikan Matematika yang lebih menyenangkan.**

---
