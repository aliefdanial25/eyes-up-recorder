# EYES UP! v1.0 — Laporan binaan akhir

30 September 2026 · Pendidikan Muzik Tahun 4 · tanpa micro:bit

Projek sedia ada dinaik taraf. Aliran Home → Know It → Finger It → Eyes Up → Live Practice → Assessment → Performance dan gaya kelas muzik 3D dikekalkan.

## 1. Fail yang diubah

| Fail | Perubahan |
|---|---|
| index.html | Manifest, metadata pemasangan/safe area, pautan fail baharu, status simpanan/luar talian, Reset Progress dan bantuan pemasangan dalam Settings |
| app.js | Memuat/menyimpan kemajuan, mengendalikan gangguan AudioContext, mengekalkan saiz skor panjang supaya boleh ditatal |
| ui.js | Prestasi terkumpul pada pelayar, keterangan simpanan, latihan cadangan berdasarkan not paling mencabar |
| ui/classroom.js | Memulihkan/menyimpan tiga tetapan dan mengendalikan pengesahan Reset Progress |
| ui/learning.css | Membuang pemaksaan lebar minimum yang mengecilkan skor panjang |
| README.md | Cara menjalankan, memasang, menggunakan luar talian dan menyediakan GitHub Pages |
| preview.png, design-*.png | Pratonton semasa diperbaharui |

style.css, ui/studio.css dan ui/classroom.css asal dikekalkan. Penyesuaian peranti berada dalam lapisan CSS tambahan.

## 2. Fail baharu

- storage.js — storan ringan berversi, semakan data, toleransi ralat dan reset.
- manifest.webmanifest — identiti aplikasi, start_url/scope relatif, standalone, warna dan ikon.
- service-worker.js — 19 sumber shell statik, cache mengikut versi/skop, kemas kini selamat.
- pwa.js — pendaftaran, status luar talian, pemasangan pilihan dan makluman kemas kini.
- ui/device.css — sentuhan, safe area, ukuran rekoder fleksibel dan susun atur peranti.
- assets/app-icon.svg serta icon-192.png, icon-512.png, icon-maskable-512.png dan apple-touch-icon.png — ikon aplikasi tempatan.
- serve.cjs dan Start-EYES-UP.cmd — pratonton tempatan pilihan dengan MIME yang betul; memerlukan Node.js.
- .nojekyll — fail sokongan penerbitan statik.
- v1-mobile-settings.png — pratonton telefon; V1-FINAL-REPORT.md — laporan ini.

## 3. Bug dan kekurangan yang dibaiki

- Kemajuan dan tetapan tidak lagi hilang setiap kali halaman dimuat semula.
- Data storan rosak atau tidak munasabah ditapis; sekatan storan/kuota tidak menghentikan latihan. Notis dipaparkan apabila simpanan gagal.
- Butang Settings pada kad pemain tidak lagi mengecil di bawah lebar sentuhan 44 px.
- Skor panjang mengekalkan lebar berdasarkan bilangan not, bukan dipaksa mengecil kepada 600 px. Not semasa masih ditatal ke ruang yang kelihatan.
- Gangguan audio oleh peranti menghentikan mikrofon dan gelungnya serta meminta pengguna menyambung semula.
- Kegagalan memasang kemas kini cache tidak memadam versi terdahulu yang masih boleh digunakan.

## 4. Responsive

Semakan pada 1920×1080, 1366×768, 1280×800, 1180×820, 1024×768, 820×1180 dan 390×844. Semua lapan mod disemak pada setiap saiz: tiada limpahan mendatar halaman, pertindihan panel skor/pengesan, ID berganda atau rekoder keluar panel. Skor panjang boleh ditatal di dalam panelnya. Teks besar turut diuji pada 390, 820 dan 1024 px.

SVG rekoder menggunakan viewBox sedia ada, width 100%, height auto, aspect ratio dan bekas dengan had lebar. Grid/flex, min(), minmax() dan clamp() digunakan; tiada susun atur desktop tunggal.

## 5. iPad / Safari dan sentuhan

- viewport-fit=cover dan env(safe-area-inset-*) ditambah.
- Apple touch icon, metadata aplikasi dan panduan Tambah ke Skrin Utama disediakan.
- Kawalan sentuhan sekurang-kurangnya 44×44 px; label nama not juga menjadi kawasan sentuhan.
- Tiada tindakan penting bergantung pada hover; pilihan teks besar dan reduced motion dikekalkan.
- AudioContext dibuka/disambung melalui tindakan pengguna; mikrofon tidak diminta ketika halaman dibuka.
- Tiada Web Serial, micro:bit atau API perkakasan desktop khusus.

Ujian sentuhan menggunakan emulasi Edge. Ini bukan pengesahan Safari/iPad fizikal. Enjin WebKit tidak tersedia dalam persekitaran ujian ini.

## 6. Mikrofon dan data muzik

Algoritma YIN, ambang pic, masa kestabilan, pengiraan cubaan dan data not/frequency/fingering disahkan tidak berubah melalui perbandingan kod serta ujian. Perubahan audio hanya menambah pemulihan apabila AudioContext terganggu.

Ujian meliputi start → stop → start, permintaan bertindih, kebenaran ditolak, peranti terputus, berpindah mod, tab disembunyikan, nada rujukan, bantuan sementara, selesai Assessment dan satu stream/satu gelung pengesan. Tiada audio direkod atau dihantar. Data prestasi dikemas kini selepas cubaan stabil, bukan setiap bingkai audio.

Rekoder kekal lima lubang tunggal + dua pasangan berganda = sembilan bukaan hadapan, serta satu lubang ibu jari belakang. Labium tidak dikira sebagai lubang jari.

## 7. PWA

Manifest menetapkan start_url ./, scope ./, display standalone, theme/background #10264A serta ikon 192, 512 dan maskable. Pemasangan pilihan tersedia apabila pelayar menawarkan beforeinstallprompt; panduan manual disediakan untuk Safari.

Semakan pemasangan melalui protokol pelayar Edge dalam profil biasa memulangkan installabilityErrors: []. Pemasangan OS sebenar belum dilakukan. Sesi ujian peribadi memulangkan sekatan in-incognito yang dijangka; ia bukan kesalahan manifest.

## 8. Luar talian dan kemas kini

Cache mengandungi HTML, semua CSS/JS runtime, manifest, ikon, kelas dan maskot. Rekoder/skor dibina daripada SVG dalam JavaScript yang dicache. Tiada audio sementara, stream, recording, API atau permintaan arbitrari dicache.

Know It, Finger It, Eyes Up, gambar, countdown, bantuan sementara dan reload index.html dengan query telah diuji tanpa rangkaian selepas pemasangan cache. Mikrofon simulasi juga boleh bermula setempat ketika luar talian.

Nama cache diasingkan mengikut alamat aplikasi dan versi. Kemas kini menunggu tetingkap lama ditutup; tidak memaksa reload ketika latihan. Cache aplikasi lain tidak dipadam. Cache baharu yang gagal dipasang dibuang dan cache terdahulu dikekalkan. Cache boleh dibuang oleh sistem/pelayar; muatan pertama tetap memerlukan internet.

## 9. GitHub Pages

Laluan aset, manifest, service worker dan scope adalah relatif. Pemasangan/cache diuji di subfolder /music-class/; ujian kestabilan turut menggunakan /repo/. Navigasi dalaman tidak mencipta laluan backend. Reload root aplikasi dan index.html berfungsi.

Sedia untuk penerbitan statik HTTPS; **belum diterbitkan** ke repositori/domain awam. Arahan terdapat dalam README.md. Naikkan RELEASE dalam service-worker.js apabila mana-mana sumber shell berubah.

## 10. Ujian yang dijalankan

| Kumpulan | Semakan lulus |
|---|---:|
| Regresi data not, DSP, mod, assessment dan audio simulasi | 66 |
| Kestabilan sumber, timer, listener, stream dan gelung | 132 |
| Pemeriksaan akhir resize, kehilangan peranti, visibility dan DOM | 13 |
| PWA, cache, offline, persistence/reset, kemas kini gagal, tujuh viewport dan teks besar | 254 |
| Sentuhan, audio melalui gesture, menu dan semakan manifest | 13 |
| Syarat pemasangan Edge dalam profil bukan peribadi | 1 |
| **Jumlah** | **479** |

Audit statik: tiada laluan aset hilang atau ID HTML berganda. Tiada pageerror/console error yang tidak dijangka dalam ujian normal. Ujian sengaja mensimulasikan kegagalan kebenaran, storan dan muat turun untuk mengesahkan pemulihan. Pemeriksaan visual dibuat pada pratonton laptop, tablet landscape dan Settings telefon.

Semakan audio/resize menunggu keadaan akhir dengan had masa, bukan andaian sela pendek yang tidak konsisten pada pelayar automatik. Masa latihan 3 saat, bantuan 2.5 saat dan auto-next 700 ms tidak diubah.

## 11. Perlu diuji dengan rekoder/peranti sebenar

1. Tiup G, A, B, C′ dan D′; bandingkan not dikesan dengan tuner/guru. Cuba peralihan B–C′–D′ serta jeda antara not.
2. Uji jarak mikrofon, tiupan lembut/kuat, kebocoran jari dan bunyi kelas. Jangan ubah data not yang disahkan semata-mata untuk menutup masalah mikrofon.
3. Uji Safari pada iPad/iPhone dan Mac, Chrome Android serta mikrofon Windows sebenar: kebenaran pertama, penolakan, sambung semula dan gangguan panggilan/audio.
4. Pasang ke Home Screen/desktop dan buka selepas peranti dimulakan semula, termasuk mod kapal terbang selepas cache tersedia.
5. Uji putaran portrait/landscape, safe area dan papan kekunci luaran pada tablet sebenar.
6. Selesaikan Assessment dan bandingkan cubaan, kesalahan, streak dan keputusan dengan pemerhatian guru.

Prestasi disimpan pada pelayar/alamat yang sama; tiada penyegerakan akaun. Gunakan satu tetingkap latihan pada satu masa. Sistem mengukur pic sahaja, bukan irama, postur atau sama ada mata benar-benar memandang skor.

## Rujukan platform

Keperluan secure context dan kitaran PWA disemak terhadap dokumentasi [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers), [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) dan [pemasangan PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable). Sokongan pemasangan tetap bergantung pada pelayar/peranti.
