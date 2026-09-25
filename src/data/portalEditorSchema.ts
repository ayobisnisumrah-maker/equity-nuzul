export type FieldKind='text'|'textarea'|'url'|'number'|'string-list'|'json-list'|'json-object';
export type PortalField={key:string;label:string;kind:FieldKind;value:string|number|string[]};
export type PortalSectionDefinition={key:string;label:string;description:string;fields:PortalField[]};

export const PORTAL_SECTION_DEFINITIONS:PortalSectionDefinition[]=[
 {key:'header',label:'Header & Pengumuman',description:'Navigasi, pengumuman, dan tombol masuk.',fields:[
  {key:'announcementBadge',label:'Label Pengumuman',kind:'text',value:'Pengumuman'},
  {key:'announcementTitle',label:'Judul Pengumuman',kind:'text',value:'RUPS Luar Biasa Kuartal 3'},
  {key:'announcementText',label:'Isi Pengumuman',kind:'textarea',value:'dijadwalkan pada 20 Oktober 2026. Laporan Triwulan II telah terbit.'},
  {key:'loginLabel',label:'Tombol Masuk',kind:'text',value:'Masuk'},
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
  {key:'highlights',label:'Daftar Sorotan',kind:'string-list',value:['40% Alokasi Equity','50 Unit Terbatas','Rp 100 Juta / Unit','Dividen Berkala','Jaringan 4 Negara','1000+ Jamaah Tahunan','Izin PPIU Kemenag Resmi','Kontrak Hotel Langsung Makkah-Madinah']}
 ]},
 {key:'about',label:'Tentang Kami',description:'Headline dan metrik Tentang Kami.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'TENTANG KAMI'},
  {key:'headline',label:'Headline',kind:'text',value:'Menghadirkan Inovasi Teknologi dengan Integrasi Berkelanjutan'},
  {key:'metricsJson',label:'Metrik Tentang Kami (JSON)',kind:'json-list',value:'[]'}
 ]},
 {key:'equity',label:'Peluang Equity',description:'Penawaran dan kalkulator equity.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'PELUANG EQUITY'},
  {key:'headline',label:'Headline',kind:'text',value:'Kesempatan Bertumbuh Bersama'},
  {key:'description',label:'Deskripsi',kind:'textarea',value:'Jadilah bagian dari perjalanan besar Nuzultrip dengan kepemilikan yang jelas, transparan, dan terstruktur.'},
  {key:'detailCta',label:'CTA Detail',kind:'text',value:'Lebih Detail Penawaran'},
  {key:'calculatorTitle',label:'Judul Kalkulator',kind:'text',value:'Simulasi Bagi Hasil'},
  {key:'calculatorNote',label:'Catatan Kalkulator',kind:'textarea',value:'*Pencairan dividen ditransfer bulanan sesuai pembukuan riil.'},
  {key:'metricsJson',label:'Metrik Equity (JSON)',kind:'json-list',value:'[]'}
 ]},
 {key:'company',label:'Perusahaan',description:'Profil, galeri, metrik dan kredensial perusahaan.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'PERUSAHAAN'},
  {key:'headline',label:'Headline',kind:'text',value:'Perjalanan Muslim yang Bertumbuh'},
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
  {key:'moreCta',label:'CTA',kind:'text',value:'Layanan Lainnya'},
  {key:'itemsJson',label:'Daftar Layanan (JSON)',kind:'json-list',value:'[]'},
  {key:'detailMap',label:'Detail Layanan / Popup (JSON)',kind:'json-object',value:'{}'}
 ]},
 {key:'process',label:'Proses',description:'Tahapan dan informasi proses kepemilikan.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'ALUR & TAHAPAN INVESTASI'},
  {key:'headline',label:'Headline',kind:'text',value:'Langkah Mudah Menjadi Bagian dari Kami'},
  {key:'description',label:'Deskripsi',kind:'textarea',value:'Empat tahapan transparan dan berkepastian hukum untuk menjadi pemegang unit equity resmi ekosistem Nuzultrip.'},
  {key:'primaryCta',label:'CTA Utama',kind:'text',value:'Ajukan Minat Unit Equity'},
  {key:'secondaryCta',label:'CTA Detail',kind:'text',value:'Pelajari Prosedur Lengkap'},
  {key:'stepsJson',label:'Tahapan Proses (JSON)',kind:'json-list',value:'[]'}
 ]},
 {key:'roadmap',label:'Roadmap',description:'Judul, deskripsi, fase dan milestone roadmap.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'ROADMAP PERUSAHAAN'},
  {key:'headline',label:'Headline',kind:'text',value:'Peta Jalan Pertumbuhan Nuzultrip'},
  {key:'description',label:'Deskripsi',kind:'textarea',value:'Tahapan strategis pengembangan bisnis, platform teknologi, dan tata kelola investasi jangka panjang.'},
  {key:'phasesJson',label:'Fase Roadmap (JSON)',kind:'json-list',value:'[]'}
 ]},
 {key:'network',label:'Jaringan & Mitra',description:'Konten jaringan, mitra dan gambar.',fields:[
  {key:'partnersJson',label:'Daftar Mitra (JSON)',kind:'json-list',value:'[]'},
  {key:'portraitUrl',label:'Gambar Utama',kind:'url',value:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop'}
 ]},
 {key:'investor',label:'Informasi Investor',description:'Seluruh kartu informasi dan dokumen investor.',fields:[
  {key:'itemsJson',label:'Kartu Informasi Investor (JSON)',kind:'json-list',value:'[]'},
  {key:'detailMap',label:'Detail Informasi Investor / Popup (JSON)',kind:'json-object',value:'{}'}
 ]},
 {key:'quick_action',label:'Quick Action',description:'CTA penutup sebelum artikel.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'Langkah Awal Kemitraan'},
  {key:'headline',label:'Headline',kind:'text',value:'Siap Mengenal Nuzultrip Lebih Jauh?'},
  {key:'description',label:'Deskripsi',kind:'textarea',value:'Dapatkan konsultasi eksklusif mengenai struktur kepemilikan dan skema bagi hasil.'},
  {key:'primaryCta',label:'CTA Utama',kind:'text',value:'Ajukan Minat Equity'},
  {key:'imageUrl',label:'Gambar',kind:'url',value:'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=1200&auto=format&fit=crop'}
 ]},
 {key:'articles',label:'Artikel & Berita',description:'Artikel, gambar, kategori dan metadata.',fields:[
  {key:'eyebrow',label:'Eyebrow',kind:'text',value:'ARTIKEL & BERITA'},
  {key:'headline',label:'Headline',kind:'text',value:'Pahami Peluang. Ambil Keputusan.'},
  {key:'description',label:'Deskripsi',kind:'textarea',value:'Analisis pasar, panduan investasi syariah, dan pembaruan strategis industri perjalanan ibadah Indonesia.'},
  {key:'moreCta',label:'CTA',kind:'text',value:'Lebih Artikel Lainnya'},
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
  {key:'copyright',label:'Copyright',kind:'text',value:'© 2026 Nuzultrip. All Rights Reserved.'},
  {key:'logoUrl',label:'Logo Footer',kind:'url',value:''},
  {key:'aboutLinks',label:'Tautan Tentang',kind:'string-list',value:['Model Bisnis','Ekosistem Bisnis','Perkembangan','Agen dan Kemitraan','Informasi','Ringkasan Penawaran','Pemegang Equity']},
  {key:'infoLinks',label:'Tautan Informasi',kind:'string-list',value:['Penggunaan Dana','Tata Kelola','Faktor Risiko','Mekanisme Hasil','Legal','Risk Disclosure']},
  {key:'detailMap',label:'Detail Footer / Legal Popup (JSON)',kind:'json-object',value:'{}'}
 ]},
 {key:'modals',label:'Popup & Modal',description:'Isi popup pengumuman, detail, login, pitchdeck dan minat equity.',fields:[
  {key:'announcementJson',label:'Popup Pengumuman (JSON)',kind:'json-object',value:'{}'},
  {key:'equityDetailJson',label:'Popup Detail Equity (JSON)',kind:'json-object',value:'{}'},
  {key:'companyDetailJson',label:'Popup Detail Perusahaan (JSON)',kind:'json-object',value:'{}'},
  {key:'processDetailJson',label:'Popup Detail Proses (JSON)',kind:'json-object',value:'{}'},
  {key:'networkDetailJson',label:'Popup Detail Jaringan (JSON)',kind:'json-object',value:'{}'}
 ]}
];
