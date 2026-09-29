export type FieldKind='text'|'textarea'|'url'|'number'|'string-list'|'json-list'|'json-object';
export type PortalField={key:string;label:string;kind:FieldKind;value:string|number|string[]};
export type PortalSectionDefinition={key:string;label:string;description:string;fields:PortalField[]};

export const PORTAL_SECTION_DEFINITIONS:PortalSectionDefinition[]=[
 {key:'header',label:'Header & Pengumuman',description:'Navigasi, pengumuman, dan tombol masuk.',fields:[
  {key:'announcementBadge',label:'Label Pengumuman',kind:'text',value:'Pengumuman'},
  {key:'announcementTitle',label:'Judul Pengumuman',kind:'text',value:'RUPS Luar Biasa Kuartal 3'},
  {key:'announcementText',label:'Isi Pengumuman',kind:'textarea',value:'dijadwalkan pada 20 Oktober 2026. Laporan Triwulan II telah terbit.'},
  {key:'loginLabel',label:'Tombol Masuk',kind:'text',value:'Masuk'},
  {key:'announcementTooltip',label:'Tooltip Pengumuman',kind:'text',value:'Klik untuk melihat rincian pengumuman resmi'},
  {key:'announcementSchedule',label:'Jadwal Singkat Pengumuman',kind:'text',value:'Jadwal: 20 Okt 2026'},
  {key:'announcementDetailLabel',label:'Label Detail Pengumuman',kind:'text',value:'Detail'},
  {key:'announcementCloseLabel',label:'Label Tutup Pengumuman',kind:'text',value:'Tutup Pengumuman'},
  {key:'announcementOpenLabel',label:'Label Buka Pengumuman',kind:'text',value:'Buka Pengumuman RUPS'},
  {key:'logoUrl',label:'Logo Header',kind:'url',value:''},
  {key:'interestLabel',label:'CTA Minat Mobile',kind:'text',value:'Ajukan Minat Equity'},
  {key:'investorLoginLabel',label:'Tombol Login Investor Mobile',kind:'text',value:'Masuk Portal Investor'},
  {key:'navLabels',label:'Menu Navigasi',kind:'string-list',value:['Tentang','Peluang','Proses','Roadmap','Jaringan','Investor','Kontak']}
 ]},
 {key:'hero',label:'Hero',description:'Konten utama halaman.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'NUZULTRIP EQUITY'},
  {key:'headline',label:'Headline',kind:'text',value:'Berkembang Dalam Ekosistem Muslim'},
  {key:'headlineHighlight',label:'Headline Highlight',kind:'text',value:'Yang Terintegrasi'},
  {key:'description',label:'Deskripsi',kind:'textarea',value:'Nuzultrip membangun ekosistem perjalanan Muslim melalui layanan, jaringan, dan teknologi yang terintegrasi untuk mendukung pertumbuhan jangka panjang.'},
  {key:'primaryCta',label:'CTA Utama',kind:'text',value:'Ajukan Minat Equity'},
  {key:'secondaryCta',label:'CTA Pitchdeck',kind:'text',value:'Unduh Pitchdeck 2025'},
  {key:'highlightsLabel',label:'Label Sorotan',kind:'text',value:'SOROTAN EKOSISTEM NUZULTRIP'},
  {key:'heroImageUrl',label:'Gambar Hero',kind:'url',value:''},
  {key:'scrollLabel',label:'Label Scroll',kind:'text',value:'Scroll Eksplorasi'},
  {key:'highlights',label:'Daftar Sorotan',kind:'string-list',value:['40% Alokasi Equity','50 Unit Terbatas','Rp 100 Juta / Unit','Dividen Berkala','Jaringan 4 Negara','1000+ Jamaah Tahunan','Izin PPIU Kemenag Resmi','Kontrak Hotel Langsung Makkah-Madinah']}
 ]},
 {key:'about',label:'Tentang Kami',description:'Headline dan metrik Tentang Kami.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'TENTANG KAMI'},
  {key:'headline',label:'Headline',kind:'text',value:'Menghadirkan Inovasi Teknologi dengan Integrasi Berkelanjutan'},
  {key:'highlightWord',label:'Kata Highlight',kind:'text',value:'Berkelanjutan'},
  {key:'metricsJson',label:'Metrik Tentang Kami (JSON)',kind:'json-list',value:'[]'}
 ]},
 {key:'equity',label:'Peluang Equity',description:'Penawaran dan kalkulator equity.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'PELUANG EQUITY'},
  {key:'headline',label:'Headline',kind:'text',value:'Kesempatan Bertumbuh Bersama'},
  {key:'highlightWord',label:'Kata Highlight',kind:'text',value:'Bersama'},
  {key:'description',label:'Deskripsi',kind:'textarea',value:'Jadilah bagian dari perjalanan besar Nuzultrip dengan kepemilikan yang jelas, transparan, dan terstruktur.'},
  {key:'detailCta',label:'CTA Detail',kind:'text',value:'Lebih Detail Penawaran'},
  {key:'calculatorTitle',label:'Judul Kalkulator',kind:'text',value:'Simulasi Bagi Hasil'},
  {key:'unitSelectLabel',label:'Label Pilih Unit',kind:'text',value:'Pilih Jumlah Unit'},
  {key:'ownershipSuffix',label:'Label Kepemilikan',kind:'text',value:'Saham'},
  {key:'selectedUnitLabel',label:'Label Unit Dipilih',kind:'text',value:'Unit Dipilih'},
  {key:'investmentValueLabel',label:'Label Nilai Investasi',kind:'text',value:'Nilai Investasi'},
  {key:'monthlyShareLabel',label:'Label Bagi Hasil Bulanan',kind:'text',value:'Bagi Hasil per Bulan'},
  {key:'monthlySuffix',label:'Suffix Bulanan',kind:'text',value:'/bulan'},
  {key:'annualProjectionLabel',label:'Label Proyeksi Tahunan',kind:'text',value:'Proyeksi Tahunan'},
  {key:'yieldLabel',label:'Label Estimasi Yield',kind:'text',value:'Estimasi Yield'},
  {key:'calculatorNote',label:'Catatan Kalkulator',kind:'textarea',value:'*Pencairan dividen ditransfer bulanan sesuai pembukuan riil.'},
  {key:'calculatorCta',label:'CTA Kalkulator',kind:'text',value:'Ajukan Minat Equity'},
  {key:'sharePercentPerUnit',label:'Persentase per Unit',kind:'number',value:0.8},
  {key:'calculatorOptionsJson',label:'Opsi Unit Kalkulator (JSON)',kind:'json-list',value:'[]'},
  {key:'metricsJson',label:'Metrik Equity (JSON)',kind:'json-list',value:'[]'}
 ]},
 {key:'company',label:'Perusahaan',description:'Profil, galeri, metrik dan kredensial perusahaan.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'PERUSAHAAN'},
  {key:'headline',label:'Headline',kind:'text',value:'Perjalanan Muslim yang Bertumbuh'},
  {key:'highlightWord',label:'Kata Highlight',kind:'text',value:'Bertumbuh'},
  {key:'detailCta',label:'CTA Detail',kind:'text',value:'Lebih Detail Penawaran'},
  {key:'description',label:'Deskripsi',kind:'textarea',value:'Menghadirkan layanan perjalanan ibadah yang bermakna melalui layanan, jaringan, dan teknologi.'},
  {key:'credential',label:'Kredensial',kind:'text',value:'Amanah'},
  {key:'credentialDescription',label:'Deskripsi Kredensial',kind:'text',value:'Terverifikasi PPIU Kemenag'},
  {key:'imagesJson',label:'Galeri Perusahaan (JSON URL)',kind:'json-list',value:'[]'},
  {key:'metricsJson',label:'Metrik Perusahaan (JSON)',kind:'json-list',value:'[]'}
 ]},
 {key:'services',label:'Layanan Utama',description:'Judul, deskripsi, dan kartu layanan.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'LAYANAN UTAMA'},
  {key:'headline',label:'Headline',kind:'text',value:'Ekosistem Perjalanan Muslim Nuzultrip'},
  {key:'description',label:'Deskripsi',kind:'textarea',value:'Menghubungkan mitra, vendor layanan, dan jaringan distribusi dalam satu kesatuan sistem yang transparan dan terstandar.'},
  {key:'highlightWord',label:'Kata Highlight',kind:'text',value:'Nuzultrip'},
  {key:'moreCta',label:'CTA',kind:'text',value:'Layanan Lainnya'},
  {key:'itemsJson',label:'Daftar Layanan (JSON)',kind:'json-list',value:'[]'},
  {key:'detailMap',label:'Detail Layanan / Popup (JSON)',kind:'json-object',value:'{}'}
 ]},
 {key:'process',label:'Proses',description:'Tahapan dan informasi proses kepemilikan.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'ALUR & TAHAPAN INVESTASI'},
  {key:'headline',label:'Headline',kind:'text',value:'Langkah Mudah Menjadi Bagian dari Kami'},
  {key:'description',label:'Deskripsi',kind:'textarea',value:'Empat tahapan transparan dan berkepastian hukum untuk menjadi pemegang unit equity resmi ekosistem Nuzultrip.'},
  {key:'highlightWord',label:'Kata Highlight',kind:'text',value:'Kami'},
  {key:'estimateLabel',label:'Label Estimasi',kind:'text',value:'Estimasi'},
  {key:'outputLabel',label:'Label Output',kind:'text',value:'Output'},
  {key:'primaryCta',label:'CTA Utama',kind:'text',value:'Ajukan Minat Unit Equity'},
  {key:'secondaryCta',label:'CTA Detail',kind:'text',value:'Pelajari Prosedur Lengkap'},
  {key:'stepsJson',label:'Tahapan Proses (JSON)',kind:'json-list',value:'[]'}
 ]},
 {key:'roadmap',label:'Roadmap',description:'Judul, deskripsi, fase dan milestone roadmap.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'ROADMAP PERUSAHAAN'},
  {key:'headline',label:'Headline',kind:'text',value:'Peta Jalan Pertumbuhan Nuzultrip'},
  {key:'description',label:'Deskripsi',kind:'textarea',value:'Tahapan strategis pengembangan bisnis, platform teknologi, dan tata kelola investasi jangka panjang.'},
  {key:'highlightWord',label:'Kata Highlight',kind:'text',value:'Nuzultrip'},
  {key:'phaseLabel',label:'Label Fase',kind:'text',value:'Fase'},
  {key:'swipeLabel',label:'Petunjuk Swipe Mobile',kind:'text',value:'Geser card ke samping'},
  {key:'previousLabel',label:'Label Tombol Sebelumnya',kind:'text',value:'Sebelumnya'},
  {key:'phasesJson',label:'Fase Roadmap (JSON)',kind:'json-list',value:'[]'}
 ]},
 {key:'network',label:'Jaringan & Mitra',description:'Konten jaringan, mitra dan gambar.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'JARINGAN & MITRA'},
  {key:'headline',label:'Headline',kind:'text',value:'Tumbuh Bersama Dalam Jaringan yang Kuat'},
  {key:'highlightWord',label:'Kata Highlight',kind:'text',value:'Bersama'},
  {key:'imageHeadline',label:'Headline Overlay Gambar',kind:'text',value:'Jaringan yang Terus Bertumbuh'},
  {key:'description',label:'Deskripsi',kind:'textarea',value:'Menjadi bagian dari perjalanan bersama Nuzultrip melalui kepemilikan equity dan sinergi ekosistem.'},
  {key:'detailCta',label:'CTA Detail',kind:'text',value:'Pelajari Selengkapnya'},
  {key:'partnersJson',label:'Daftar Mitra (JSON)',kind:'json-list',value:'[]'},
  {key:'imageUrl',label:'Gambar Utama',kind:'url',value:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop'}
 ]},
 {key:'investor',label:'Informasi Investor',description:'Seluruh kartu informasi dan dokumen investor.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'INFORMASI INVESTOR'},
  {key:'headline',label:'Headline',kind:'text',value:'Informasi penting dalam satu tempat'},
  {key:'highlightWord',label:'Kata Highlight',kind:'text',value:'tempat'},
  {key:'moreLabel',label:'Label Detail',kind:'text',value:'Selengkapnya'},
  {key:'itemsJson',label:'Kartu Informasi Investor (JSON)',kind:'json-list',value:'[]'},
  {key:'detailMap',label:'Detail Informasi Investor / Popup (JSON)',kind:'json-object',value:'{}'}
 ]},
 {key:'quick_action',label:'Quick Action',description:'CTA penutup sebelum artikel.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'QUICK ACTION'},
  {key:'headline',label:'Headline',kind:'text',value:'Kenali. Pelajari. Tentukan Langkah Anda.'},
  {key:'description',label:'Deskripsi',kind:'textarea',value:'Tim Investor Relations kami siap memberikan pendampingan personal bagi calon mitra dan investor strategis.'},
  {key:'discussCta',label:'CTA Diskusi',kind:'text',value:'Diskusikan Peluang'},
  {key:'phone',label:'Nomor Investor Relations',kind:'text',value:'+62 812-3456-7890'},
  {key:'whatsappUrl',label:'WhatsApp URL',kind:'url',value:'https://wa.me/6281234567890'},
  {key:'invitationTitle',label:'Judul Invitation Card',kind:'text',value:'Siap Mengenal Nuzultrip Lebih Jauh?'},
  {key:'invitationDescription',label:'Deskripsi Invitation Card',kind:'textarea',value:'Dapatkan konsultasi eksklusif mengenai struktur kepemilikan dan skema bagi hasil.'},
  {key:'phoneLabel',label:'Label Kartu Telepon',kind:'text',value:'Investor Relations'},
  {key:'phoneTitle',label:'Judul Kartu Telepon',kind:'text',value:'Hubungi Tim'},
  {key:'documentLabel',label:'Label Kartu Dokumen',kind:'text',value:'Dokumen Investor'},
  {key:'documentTitle',label:'Judul Kartu Dokumen',kind:'text',value:'Unduh Pitchdeck'},
  {key:'documentDescription',label:'Deskripsi Kartu Dokumen',kind:'text',value:'Pelajari ringkasan model bisnis & proyeksi'},
  {key:'invitationLabel',label:'Label Invitation Card',kind:'text',value:'Langkah Awal Kemitraan'},
  {key:'invitationCta',label:'CTA Invitation Card',kind:'text',value:'Ajukan Minat Equity'},
  {key:'imageUrl',label:'Gambar',kind:'url',value:'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=1200&auto=format&fit=crop'}
 ]},
 {key:'articles',label:'Artikel & Berita',description:'Artikel, gambar, kategori dan metadata.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'ARTIKEL & BERITA'},
  {key:'headline',label:'Headline',kind:'text',value:'Pahami Peluang. Ambil Keputusan.'},
  {key:'description',label:'Deskripsi',kind:'textarea',value:'Analisis pasar, panduan investasi syariah, dan pembaruan strategis industri perjalanan ibadah Indonesia.'},
  {key:'highlightWord',label:'Kata Highlight',kind:'text',value:'Keputusan.'},
  {key:'moreCta',label:'CTA',kind:'text',value:'Lebih Artikel Lainnya'},
  {key:'readMore',label:'Label Baca Artikel',kind:'text',value:'Baca Selengkapnya'},
  {key:'itemsJson',label:'Daftar Artikel (JSON)',kind:'json-list',value:'[]'},
  {key:'detailMap',label:'Detail Artikel / Popup (JSON)',kind:'json-object',value:'{}'}
 ]},
 {key:'footer',label:'Footer',description:'Tagline, tautan, kontak, sosial media dan legal.',fields:[
  {key:'tagline',label:'Tagline',kind:'textarea',value:'Melayani perjalanan Muslim Indonesia dengan hati, profesionalisme, dan teknologi.'},
  {key:'contactTitle',label:'Judul Kontak',kind:'text',value:'BUTUH INFORMASI TERBARU?'},
  {key:'contactDescription',label:'Deskripsi Kontak',kind:'textarea',value:'Hubungi tim Investor Relations untuk informasi, dokumen, atau pembaruan resmi Nuzultrip Equity.'},
  {key:'contactCta',label:'CTA Kontak',kind:'text',value:'Hubungi Kami'},
  {key:'whatsappUrl',label:'WhatsApp URL',kind:'url',value:'https://wa.me/6281234567890?text=Halo%20Tim%20Nuzultrip%20Equity,%20saya%20membutuhkan%20informasi%20terbaru%20mengenai%20penawaran%20equity.'},
  {key:'instagramUrl',label:'Instagram URL',kind:'url',value:'https://instagram.com'},
  {key:'facebookUrl',label:'Facebook URL',kind:'url',value:'https://facebook.com'},
  {key:'tiktokUrl',label:'TikTok URL',kind:'url',value:'https://tiktok.com'},
  {key:'instagramAria',label:'Label Aksesibilitas Instagram',kind:'text',value:'Instagram Nuzultrip'},
  {key:'facebookAria',label:'Label Aksesibilitas Facebook',kind:'text',value:'Facebook Nuzultrip'},
  {key:'tiktokAria',label:'Label Aksesibilitas TikTok',kind:'text',value:'TikTok Nuzultrip'},
  {key:'copyright',label:'Copyright',kind:'text',value:'© 2026 Nuzultrip. All Rights Reserved.'},
  {key:'aboutTitle',label:'Judul Kolom Tentang',kind:'text',value:'TENTANG NUZULTRIP'},
  {key:'infoTitle',label:'Judul Kolom Informasi',kind:'text',value:'INFORMASI'},
  {key:'privacyLabel',label:'Label Kebijakan Privasi',kind:'text',value:'Kebijakan Privasi'},
  {key:'termsLabel',label:'Label Syarat Ketentuan',kind:'text',value:'Syarat dan Ketentuan'},
  {key:'logoUrl',label:'Logo Footer',kind:'url',value:''},
  {key:'aboutLinks',label:'Tautan Tentang',kind:'string-list',value:['Model Bisnis','Ekosistem Bisnis','Perkembangan','Agen dan Kemitraan','Informasi','Ringkasan Penawaran','Pemegang Equity']},
  {key:'infoLinks',label:'Tautan Informasi',kind:'string-list',value:['Penggunaan Dana','Tata Kelola','Faktor Risiko','Mekanisme Hasil','Legal','Risk Disclosure']},
  {key:'detailMap',label:'Detail Footer / Legal Popup (JSON)',kind:'json-object',value:'{}'}
 ]},
 {key:'modals',label:'Popup & Modal',description:'Isi popup pengumuman, detail, login, pitchdeck dan minat equity.',fields:[
  {key:'announcementJson',label:'Popup Pengumuman (JSON)',kind:'json-object',value:'{"title":"RUPS Luar Biasa Kuartal 3 & Laporan Triwulan II","category":"Pengumuman Resmi Pemegang Saham","content":"Pengumuman resmi kepada seluruh pemegang equity dan mitra Nuzultrip: Rapat Umum Pemegang Saham Luar Biasa (RUPSLB) Kuartal 3 dijadwalkan pada 20 Oktober 2026. Laporan Triwulan II telah terbit dan dapat diakses melalui portal investor.","detailsList":["Jadwal RUPSLB: Selasa, 20 Oktober 2026 pukul 09.30 WIB via Hybrid Portal","Agenda Utama: Evaluasi kinerja semester I dan pengesahan alokasi ekspansi operasional","Laporan Triwulan II: Dokumen lengkap dapat diunduh di dashboard investor","Hak Suara: Berlaku bagi seluruh pemegang unit equity terdaftar"]}'},
  {key:'equityDetailJson',label:'Popup Detail Equity (JSON)',kind:'json-object',value:'{"title":"Detail Penawaran Equity Nuzultrip","category":"Informasi Penawaran Resmi","content":"Penawaran Nuzultrip Equity memberikan kesempatan kepada investor dan mitra strategis untuk memiliki bagian dari ekosistem perjalanan ibadah. Struktur investasi dirancang secara proporsional dan transparan.","detailsList":["Total Alokasi Equity: 40% kepemilikan saham","Jumlah Unit Terbatas: 50 Unit kepemilikan (0,8% per unit)","Harga Penawaran: Rp 100.000.000 per unit","Distribusi Bagi Hasil: Pelaporan dan pembagian hasil operasional berkala","Hak Pemegang Unit: Akses portal investor dan hak sesuai dokumen kepemilikan"]}'},
  {key:'companyDetailJson',label:'Popup Detail Perusahaan (JSON)',kind:'json-object',value:'{"title":"Struktur dan Visi Perusahaan Nuzultrip","category":"Profil Korporasi","content":"Nuzultrip adalah ekosistem perjalanan Muslim yang mengintegrasikan layanan perjalanan ibadah dan layanan pendukung.","detailsList":["Jaringan mitra operasional","Layanan perjalanan ibadah","Kemitraan vendor dan penyedia layanan","Pengembangan sistem digital terintegrasi"]}'},
  {key:'processDetailJson',label:'Popup Detail Proses (JSON)',kind:'json-object',value:'{"title":"Prosedur dan Alur Kepemilikan Equity","category":"Tata Kelola & Kepatuhan","content":"Setiap calon investor melewati tahapan formal untuk memastikan transparansi dan keabsahan proses kepemilikan.","detailsList":["Pendaftaran minat dan data calon investor","Verifikasi dan konfirmasi alokasi unit","Perjanjian dan penyelesaian administrasi","Aktivasi akses portal investor"]}'},
  {key:'networkDetailJson',label:'Popup Detail Jaringan (JSON)',kind:'json-object',value:'{"title":"Jaringan Kemitraan Ekosistem Nuzultrip","category":"Sinergi & Kemitraan","content":"Nuzultrip membangun kemitraan dengan penyedia layanan dan jaringan distribusi untuk mendukung operasional perjalanan.","detailsList":["Mitra layanan perjalanan","Penyedia akomodasi dan transportasi","Jaringan agen dan kemitraan","Kolaborasi layanan pendukung"]}'},
  {key:'loginJson',label:'Popup Login (JSON)',kind:'json-object',value:'{"eyebrow":"Portal Resmi","title":"Masuk Portal","description":"Akses resmi untuk Admin dan Investor Nuzultrip yang telah terdaftar.","emailLabel":"Email Terdaftar","passwordLabel":"Kata Sandi","forgotLabel":"Lupa sandi?","submitLabel":"Masuk ke Akun","loadingLabel":"Memverifikasi Akses...","successTitle":"Autentikasi Berhasil","interestPrompt":"Belum terdaftar sebagai investor?","interestCta":"Ajukan Minat Equity Sekarang"}'},
  {key:'pitchdeckJson',label:'Popup Pitchdeck (JSON)',kind:'json-object',value:'{"eyebrow":"Dokumen Resmi","title":"Unduh Pitchdeck Resmi","description":"Dapatkan ringkasan eksekutif dan informasi resmi Nuzultrip Equity.","documentUrl":"","format":"PDF","version":"Versi terbaru","confidentiality":"Dokumen Investor"}'},
  {key:'interestJson',label:'Popup Minat Equity (JSON)',kind:'json-object',value:'{"title":"Ajukan Minat Equity","eyebrow":"Formulir Resmi Calon Investor","description":"Langkah awal pendaftaran kepemilikan unit equity Nuzultrip. Tanpa komitmen finansial di muka.","pricePerUnit":100000000,"maxUnits":50,"whatsappUrl":"","successTitle":"Pengajuan Minat Diterima","successMessage":"Tim Investor Relations Nuzultrip akan menghubungi Anda melalui WhatsApp untuk verifikasi lanjutan.","calculatorLabel":"Kalkulator Unit Equity","unitsLabel":"Jumlah Unit","nameLabel":"Nama Lengkap","namePlaceholder":"Contoh: Ahmad Fadhil Pratama","phoneLabel":"Nomor WhatsApp","phonePlaceholder":"081234567890","emailLabel":"Email","emailPlaceholder":"nama@email.com","investorTypeLabel":"Tipe Investor","individualLabel":"Individu","institutionLabel":"Badan Usaha","communityLabel":"Komunitas","investorTypeOptions":["Individu","Badan Usaha","Komunitas"],"submitLabel":"Kirim Pengajuan Minat","submittingLabel":"Mengirim...","confirmWhatsappLabel":"Konfirmasi via WhatsApp","doneLabel":"Selesai","interestedUnitsLabel":"Unit Diminati","investmentEstimateLabel":"Estimasi Investasi","privacyNotice":"Data Anda dijaga kerahasiaannya dan hanya digunakan untuk keperluan komunikasi penawaran resmi Nuzultrip Equity."}'}
 ]}
];
