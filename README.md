# EYES UP! v1.0
Smart Recorder Training System · Pendidikan Muzik Tahun 4

Web app statik dengan rekoder SVG, pengesanan pic setempat, simpanan kemajuan pada peranti dan PWA luar talian. Projek sedia ada dinaik taraf; tiada micro:bit, backend atau pakej pelayar tambahan.

## Buka aplikasi

- Laman awam: https://aliefdanial25.github.io/eyes-up-recorder/
- Pratonton komputer ini: http://127.0.0.1:4173/?v=1.0
- Windows: jika Node.js tersedia, klik dua kali **Start-EYES-UP.cmd**, kemudian buka pautan yang dipaparkan. Biarkan tetingkap pelayan terbuka.
- Windows / Mac: dengan Node.js, jalankan **node serve.cjs** dalam folder ini. Alternatif: Live Server.
- Untuk telefon dan tablet, gunakan laman HTTPS yang diterbitkan. Alamat 127.0.0.1 hanya merujuk kepada peranti yang membukanya; ia bukan pautan awam.
- Jangan jalankan dengan membuka index.html sebagai file:// untuk PWA atau mikrofon.

## Pasang dan guna luar talian

1. Buka aplikasi melalui HTTPS atau localhost semasa ada internet.
2. Buka Settings dan tunggu **Sedia digunakan luar talian pada peranti ini**.
3. Gunakan butang Pasang EYES UP! jika tersedia. Pada Safari iPhone/iPad, pilih Kongsi → Tambah ke Skrin Utama. Nama menu boleh berbeza mengikut pelayar.
4. Aplikasi yang telah dicache boleh membuka Know It, Finger It dan Eyes Up tanpa internet. Audio rujukan dan pengesanan pic diproses setempat; mikrofon masih memerlukan kebenaran pengguna dan sokongan pelayar.

Pemasangan tidak wajib. Cache boleh dibuang oleh pelayar atau sistem; buka semula dengan internet jika bahan luar talian tidak tersedia. Kemas kini menunggu semua tetingkap versi lama ditutup supaya latihan tidak terganggu.

## Kemajuan dan privasi

localStorage menyimpan XP, bilangan cubaan betul/salah setiap not, streak terbaik dan tiga pilihan paparan. Tiada nama murid, akaun, rakaman atau audio disimpan/dihantar. Rekod terikat kepada pelayar dan alamat aplikasi; tidak disegerakkan antara peranti. Gunakan satu tetingkap latihan pada satu masa. Mod peribadi / sekatan storan mungkin menjadikan rekod sementara; notis dipaparkan dalam Settings.

**Reset Progress** mengosongkan rekod latihan dan XP selepas pengesahan dalam aplikasi. Tetapan paparan dan cache aplikasi dikekalkan.

Ketepatan = cubaan betul ÷ semua cubaan pic stabil × 100. Not tepat pada cubaan pertama dipaparkan berasingan daripada not yang akhirnya diselesaikan. +10 XP untuk not tepat cubaan pertama. Prestasi ialah rekod cubaan, bukan pengesahan penguasaan muzik kekal.

## GitHub Pages

Laman diterbitkan melalui GitHub Pages daripada cawangan main, folder root. Gunakan pautan HTTPS di atas pada peranti lain.

1. Letakkan **kandungan** folder aplikasi di root repositori Pages atau folder docs yang dipilih dalam tetapan Pages.
2. Pastikan index.html, manifest.webmanifest, service-worker.js, semua CSS/JS, assets dan .nojekyll disertakan.
3. Aktifkan Pages pada sumber tersebut dan buka URL HTTPS yang diberikan GitHub.
4. Laluan aplikasi, start_url, scope dan cache adalah relatif; URL seperti https://nama.github.io/repositori/ disokong. Navigasi mod tidak menukar laluan pelayar.
5. Setiap kali fail aplikasi berubah, naikkan nilai RELEASE dalam service-worker.js sebelum menerbitkan. Jangan guna semula nombor cache untuk binaan berbeza.

Fail serve.cjs dan Start-EYES-UP.cmd hanya untuk pratonton setempat. GitHub Pages tidak memerlukannya. Fail PNG design-*.png dan laporan fasa lama ialah dokumentasi, bukan aset runtime.

## Data muzik yang dikekalkan

| Not | Hz | Lubang ditutup |
|---|---:|---|
| G | 783.99 | T, 1, 2, 3 |
| A | 880.00 | T, 1, 2 |
| B | 987.77 | T, 1 |
| C′ | 1046.50 | T, 2 |
| D′ | 1174.66 | 2; ibu jari terbuka |

Rekoder: lima lubang tunggal + dua pasangan berganda = sembilan bukaan hadapan; satu lubang ibu jari belakang. Labium bukan lubang jari.

## Ujian dan batas

Lihat [laporan v1.0](V1-FINAL-REPORT.md). Laporan fasa terdahulu ialah rekod sejarah; keterangan simpanan sesi sahaja dalam laporan lama telah digantikan oleh localStorage v1.0.

Uji lima not dengan rekoder sebenar, peralihan B–C′–D′, tiupan lembut/kuat, bunyi kelas, kebenaran mikrofon, hentian/gangguan audio, putaran skrin dan pemasangan luar talian pada peranti sasaran. Safari/iPad/iPhone fizikal, Android dan Mac belum disahkan secara langsung. Sistem menilai pic; bukan irama, postur atau arah pandangan mata sebenar.
