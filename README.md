# Nuzultrip Equity

Portal dan dashboard dalam repository `ayobisnisumrah-maker/equity-nuzul`.

## Menjalankan aplikasi

Node.js 22.12+ dan npm 11:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dengan URL dan publishable/anon key proyek yang benar. Jangan memasukkan service-role key ke aplikasi browser.

```sh
npm run lint
npm test
npm run build
```

## Integrasi dashboard

- Masuk memakai email akun Supabase Auth terdaftar. Peran dibaca dari `portal_admins` atau `investor_profiles` yang berstatus `approved`; data dan mutasi tetap dilindungi RLS.
- Tombol Masuk membuka dashboard kembali jika sesi yang sah masih aktif. Keluar atau sesi yang tidak valid menutup dashboard.
- **Portal**: Simpan Draft tidak mengubah konten publik. Publish menyimpan nilai editor terbaru lalu menerbitkannya. Portal membaca `portal_content.content`, memperbarui setelah publish/rollback, saat koneksi pulih, serta melalui Realtime atau polling 30 detik.
- Editor mengatur teks, galeri, metrik, kartu, roadmap, navigasi, footer, dan popup. Layout portal tetap berasal dari komponen yang sama. Konten bawaan source tetap menjadi fallback sebelum ada konten CMS.
- **Investor → Pengajuan Minat Equity**: formulir publik masuk ke `equity_inquiries`; admin dengan izin investor dapat menindaklanjuti status. Permintaan tidak otomatis membuat akun atau mengalokasikan unit.
- **Dokumen Portal**: unggah PDF dengan kategori `Pitchdeck`, audiens `public`, dan status published. Tombol unduh mengambil PDF tersebut; tidak membuat dokumen contoh atau mengirim email.

## Database sebelum aktivasi

Migrasi `supabase/migrations` mengharapkan skema milik repository ini, antara lain:

- `portal_content(key,label,content,published,sort_order,...)`
- `portal_admins(user_id,full_name,role,permissions,...)`
- `investor_profiles(user_id,full_name,status,...)`
- `portal_documents`, tabel operasional, dan fungsi permission.

Pada proyek yang sudah menggunakan skema ini, terapkan migrasi yang belum dijalankan sesuai urutan; tambahan integrasi ini adalah `20260925210000_equity_inquiries.sql`. Inisialisasi admin harus dilakukan oleh pengelola proyek menggunakan ID akun Auth yang benar, bukan melalui form publik.

**Hasil pemeriksaan 25 September 2026:** proyek Supabase yang tersedia bernama Nuzul-invest (`ersqtpypizmykmbazmis`) mempunyai `portal_content(page,section,title,slug,status,...)`, serta tidak mempunyai `portal_admins` dan `investor_profiles`. Itu adalah skema berbeda. Migrasi repository ini belum diterapkan ke proyek tersebut dan data yang ada tidak diubah. Tentukan proyek tujuan atau rencana adaptasi skema sebelum aktivasi production.

## Verifikasi

Tes integrasi komponen memakai respons layanan yang dikendalikan untuk memeriksa pembaruan CMS, daftar kosong, publish setelah penyimpanan, kegagalan penyimpanan, idempotensi permintaan dari modal, dan kegagalan unduhan. Tes ini tidak mengklaim autentikasi atau transaksi production telah diuji. Uji akun admin/investor, RLS dan PDF aktual diperlukan setelah database tujuan tersedia.
