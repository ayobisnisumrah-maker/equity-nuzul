import investorStrategiImage from '../assets/images/regenerated_image_1790328525170.jpg';
import investorDokumenImage from '../assets/images/regenerated_image_1790328653051.jpg';
import investorHasilImage from '../assets/images/regenerated_image_1790328757781.jpg';

export interface StatisticItem {
  id: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  description?: string;
  customDisplay?: string; // for non-numeric like "Bulanan" or "2024"
  useGrouping?: boolean;
}

export interface ServiceItem {
  id: string;
  code: string;
  title: string;
  tagline: string;
  description: string;
  iconName: 'umroh' | 'land' | 'tour' | 'travel';
}

export interface NetworkItem {
  id: string;
  title: string;
  description: string;
  iconName: 'user' | 'handshake' | 'building';
}

export interface InvestorInfoItem {
  id: string;
  title: string;
  description: string;
  details: string;
  imageUrl: string;
}

export interface ArticleItem {
  id: string;
  category: string;
  title: string;
  description: string;
  readTime: string;
  imageUrl: string;
  date: string;
}

export const IMAGES = {
  // Perusahaan 5 interactive slices
  companySlices: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop', // 10+ Tahun: Tim yang sedang bekerja di kantor
    'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=1200&auto=format&fit=crop', // 4 Negara: Mecca
    'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1200&auto=format&fit=crop', // 1000+: Jamaah umrah sedang tour
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop', // 15 M: Omzet bisnis & pertumbuhan finansial
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop'  // Amanah: Wanita berhijab profesional
  ],
  // Jaringan: Muslim woman professional partner
  partnerPortrait: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop',
  // Quick Action background
  quickActionBg: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=1200&auto=format&fit=crop',
  // Articles
  articleEquity: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
  articleEcosystem: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop'
};

export const ABOUT_METRICS: StatisticItem[] = [
  {
    id: 'market-size',
    value: 70,
    suffix: ' JT+',
    label: 'Potensi Pasar Muslim Indonesia',
    description: 'Populasi Muslim terbesar dengan permintaan umroh dan halal travel yang terus meningkat secara konsisten.'
  },
  {
    id: 'year-founded',
    value: 2024,
    customDisplay: '2024',
    useGrouping: false,
    label: 'Nuzultrip Menjadi Bagian Anda',
    description: 'Didirikan dengan visi modernisasi layanan perjalanan ibadah berbasis teknologi.'
  },
  {
    id: 'growth-rate',
    value: 17.1,
    prefix: '+',
    suffix: '%',
    decimals: 1,
    label: 'Pertumbuhan Jamaah Umroh 2024–2026',
    description: 'Proyeksi kenaikan volume jamaah seiring kemudahan regulasi dan digitalisasi visa.'
  },
  {
    id: 'equity-units',
    value: 50,
    label: 'Total Unit Equity yang Tersedia',
    description: 'Unit penawaran terbatas untuk menjaga kualitas tata kelola dan kemitraan strategis.'
  },
  {
    id: 'total-equity',
    value: 40,
    suffix: '%',
    label: 'Total Equity yang Ditawarkan',
    description: 'Alokasi kepemilikan saham publik/mitra strategis untuk percepatan ekspansi ekosistem.'
  }
];

export const EQUITY_METRICS: StatisticItem[] = [
  {
    id: 'porsi-ditawarkan',
    value: 40,
    suffix: '%',
    label: 'Porsi kepemilikan yang ditawarkan'
  },
  {
    id: 'total-unit',
    value: 50,
    suffix: ' Unit',
    label: 'Total unit equity yang ditawarkan'
  },
  {
    id: 'porsi-per-unit',
    value: 0.8,
    suffix: '%',
    decimals: 1,
    label: 'Porsi kepemilikan per unit'
  },
  {
    id: 'nilai-per-unit',
    value: 100,
    prefix: 'Rp.',
    suffix: ' Juta',
    label: 'Nilai per unit equity'
  },
  {
    id: 'total-nilai',
    value: 5,
    prefix: 'Rp.',
    suffix: ' Miliar',
    label: 'Total Nilai Penawaran'
  },
  {
    id: 'periode-distribusi',
    value: 0,
    customDisplay: 'Bulanan',
    label: 'Periode distribusi hasil'
  }
];

export const COMPANY_METRICS: StatisticItem[] = [
  {
    id: 'experience',
    value: 10,
    suffix: '+ Tahun',
    label: 'Pengalaman tim di bidang umroh'
  },
  {
    id: 'countries',
    value: 4,
    suffix: ' Negara',
    label: 'Jaringan vendor layanan terpercaya'
  },
  {
    id: 'jamaah-count',
    value: 1000,
    suffix: '+',
    label: 'Total jamaah telah diberangkatkan'
  },
  {
    id: 'cumulative-revenue',
    value: 15,
    prefix: 'Rp.',
    suffix: ' M+',
    label: 'Omzet kumulatif periode 2024–2026'
  }
];

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'umroh',
    code: 'UMRAH',
    title: 'Umrah',
    tagline: 'Memperluas akses perjalanan umrah melalui ekosistem terpercaya.',
    description: 'Memperluas akses perjalanan umrah melalui ekosistem terpercaya.',
    iconName: 'umroh'
  },
  {
    id: 'land-arrangement',
    code: 'LAND ARRANGEMENT',
    title: 'Land Arrangement',
    tagline: 'Menguatkan jaringan destinasi melalui layanan darat terintegrasi.',
    description: 'Menguatkan jaringan destinasi melalui layanan darat terintegrasi.',
    iconName: 'land'
  },
  {
    id: 'halal-tour',
    code: 'HALAL TOUR',
    title: 'Halal Tour',
    tagline: 'Mengembangkan destinasi halal melalui pengalaman perjalanan terkurasi.',
    description: 'Mengembangkan destinasi halal melalui pengalaman perjalanan terkurasi.',
    iconName: 'tour'
  },
  {
    id: 'travel-muslim',
    code: 'MUSLIM TRAVEL',
    title: 'Muslim Travel',
    tagline: 'Membangun ekosistem perjalanan Muslim yang terhubung dan scalable.',
    description: 'Membangun ekosistem perjalanan Muslim yang terhubung dan scalable.',
    iconName: 'travel'
  }
];

export const NETWORK_PARTNERS: NetworkItem[] = [
  {
    id: 'agen',
    title: 'Agen Nuzultrip',
    description: 'Mendukung setiap agen terstruktur dan efisien dengan teknologi penjualan cerdas.',
    iconName: 'user'
  },
  {
    id: 'mitra',
    title: 'Mitra Travel',
    description: 'Jalinan kemitraan untuk layanan umrah lebih optimal dengan standarisasi bersama.',
    iconName: 'handshake'
  },
  {
    id: 'vendor',
    title: 'Vendor Layanan',
    description: 'Partner layanan terpercaya untuk kebutuhan ibadah mulai maskapai, hotel, hingga handling.',
    iconName: 'building'
  }
];

export const INVESTOR_INFO_LIST: InvestorInfoItem[] = [
  {
    id: 'strategi',
    title: 'Strategi Pertumbuhan',
    description: 'Pertumbuhan melalui penguatan layanan, sistem dan jaringan.',
    details: 'Fokus pada tiga pilar utama: penetrasi agen di 34 provinsi, automasi pengadaan kamar hotel & tiket pesawat grup, serta ekspansi vertikal paket umroh korporat dan keluarga.',
    imageUrl: investorStrategiImage
  },
  {
    id: 'risiko',
    title: 'Manajemen Risiko',
    description: 'Risiko utama dan pendekatan mitigasi dalam kepemilikan equity.',
    details: 'Mitigasi fluktuasi kurs mata uang SAR/USD melalui hedging strategis, kepastian kuota visa dengan kemitraan resmi muassasah berlisensi, dan diversifikasi portofolio layanan.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'modal',
    title: 'Penggunaan Modal',
    description: 'Alokasi modal pada empat prioritas strategis pengembangan Nuzultrip.',
    details: 'Alokasi: 40% Penguatan modal kerja Land Arrangement & kuota tiket; 25% Pengembangan platform teknologi agen; 20% Ekspansi pemasaran & akuisisi mitra; 15% Cadangan kas operasional.',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'dokumen',
    title: 'Dokumen dan Informasi',
    description: 'Akses dokumen dan informasi penting secara terstruktur.',
    details: 'Calon investor mendapatkan akses penuh ke Akta Pendirian, SK Kemenkumham, Izin PPIU, Laporan Keuangan Historis yang diaudit, serta Dokumen Term Sheet & Perjanjian Pemegang Saham.',
    imageUrl: investorDokumenImage
  },
  {
    id: 'keunggulan',
    title: 'Keunggulan Kompetitif',
    description: 'Nilai strategis yang mendukung pertumbuhan dan kepemilikan equity.',
    details: 'Model hybrid offline-online, jaringan langsung ke penyedia di Saudi tanpa perantara bertingkat, serta retensi jamaah tinggi berkat kepuasan layanan yang terjaga.',
    imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'hasil',
    title: 'Mekanisme Hasil & Pelaporan',
    description: 'Distribusi hasil dengan pelaporan berkala dan transparan.',
    details: 'Dividen didistribusikan setiap periode secara proporsional sesuai kepemilikan unit, didukung laporan berkala bulanan dan RUPS tahunan melalui portal investor online.',
    imageUrl: investorHasilImage
  }
];

export const ARTICLES_LIST: ArticleItem[] = [
  {
    id: 'art-01',
    category: 'Artikel • Informasi Equity',
    title: 'Memahami Struktur Kepemilikan Equity',
    description: 'Panduan komprehensif bagi calon investor mengenai hak dividen, transparansi tata kelola, dan likuiditas kepemilikan saham di Nuzultrip.',
    readTime: '4 min baca',
    imageUrl: IMAGES.articleEquity,
    date: 'Februari 2025'
  },
  {
    id: 'art-02',
    category: 'Artikel • Wawasan Nuzultrip',
    title: 'Mengenal Ekosistem Perjalanan Muslim',
    description: 'Bagaimana integrasi teknologi dan jaringan rantai pasok Makkah-Madinah menciptakan efisiensi operasional dan margin usaha yang solid.',
    readTime: '5 min baca',
    imageUrl: IMAGES.articleEcosystem,
    date: 'Januari 2025'
  }
];
