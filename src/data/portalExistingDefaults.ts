import { PORTAL_MODAL_DEFAULTS } from './portalModalDefaults';
import {ABOUT_METRICS,EQUITY_METRICS,COMPANY_METRICS,SERVICES_LIST,NETWORK_PARTNERS,INVESTOR_INFO_LIST,ARTICLES_LIST,IMAGES} from './landingData';

export const PORTAL_EXISTING_STRUCTURED_DEFAULTS:Record<string,Record<string,unknown>>={
 modals: PORTAL_MODAL_DEFAULTS,
 about:{metricsJson:ABOUT_METRICS},
 equity:{metricsJson:EQUITY_METRICS},
 company:{imagesJson:IMAGES.companySlices.map(imageUrl=>({imageUrl})),metricsJson:COMPANY_METRICS},
 services:{itemsJson:SERVICES_LIST},
 process:{stepsJson:[
  {id:'step-1',stepNumber:'01',title:'Pengisian Minat & Reservasi',description:'Pengisian formulir Letter of Intent (LOI) dan penentuan kuota 1 hingga 50 unit equity yang dikehendaki.',duration:'± 3 Menit',output:'Bukti Reservasi Unit'},
  {id:'step-2',stepNumber:'02',title:'Verifikasi & Due Diligence',description:'Akses prospektus penawaran, audit laporan keuangan historis, serta sesi konsultasi eksklusif bersama Direksi.',duration:'1 – 2 Hari Kerja',output:'Prospektus & NDA'},
  {id:'step-3',stepNumber:'03',title:'Akad Notaris & Penyetoran',description:'Penandatanganan Akta Perjanjian Pemegang Saham (SHA) resmi di hadapan Notaris rekanan berizin.',duration:'Jadwal Terjadwal',output:'Akta Notaris Resmi'},
  {id:'step-4',stepNumber:'04',title:'Penerbitan Saham & Portal',description:'Penyerahan Sertifikat Saham resmi dan aktivasi akun portal investor untuk memantau dividen bulanan.',duration:'Langsung Aktif',output:'Sertifikat & Portal Investor'}
 ]},
 roadmap:{phasesJson:[
  {step:'01',phaseNumber:1,period:'Jan – Jun 2024',title:'Fondasi & Legalitas PPIU Resmi',status:'completed',statusLabel:'Terlaksana',summary:'Pendirian legalitas PT Nuzul Tour & Travel, perizinan resmi PPIU Kemenag RI, dan standardisasi SOP operasional jamaah.',highlights:['Izin resmi PPIU Kemenag RI','Standardisasi SOP handling bandara & hotel','Kemitraan awal hotel Makkah & Madinah'],kpiLabel:'Kepatuhan Hukum',kpiValue:'100% Terverifikasi'},
  {step:'02',phaseNumber:2,period:'Jul – Des 2024',title:'Penguatan Rantai Pasok & Konsorsium',status:'completed',statusLabel:'Terlaksana',summary:'Pengamanan blok seat reguler maskapai Garuda Indonesia & Saudia Airlines, serta jaringan konsorsium dengan 15+ travel daerah.',highlights:['Blok seat maskapai terpercaya','Tim muthowif tersertifikasi di Saudi','Konsorsium 15+ biro travel daerah'],kpiLabel:'Jamaah Terlayani',kpiValue:'1.200+ Jamaah'},
  {step:'03',phaseNumber:3,period:'Jan – Des 2025',title:'Transformasi Platform Digital & Halal Tour',status:'development',statusLabel:'Pengembangan',summary:'Automasi portal investor real-time, peluncuran aplikasi jamaah dengan pelacak bagasi, serta perluasan rute Halal Tour mancanegara.',highlights:['Portal investor dividen otomatis','Aplikasi mobile & smart baggage tracker','Ekspansi rute Halal Tour global'],kpiLabel:'Pencapaian Jamaah',kpiValue:'4.500+ Jamaah'},
  {step:'04',phaseNumber:4,period:'Jan – Des 2026',title:'Peluang Equity 40% & Platform B2B',status:'active',statusLabel:'Proses',summary:'Pembukaan 50 unit equity strategis bagi investor dengan bagi hasil bulanan, serta peluncuran platform live booking B2B untuk mitra agen.',highlights:['Penawaran 50 unit equity (Rp.100 Juta/unit)','Skema bagi hasil bulanan transparan','Platform booking B2B inventori live'],kpiLabel:'Target Equity',kpiValue:'Rp.5 Miliar'},
  {step:'05',phaseNumber:5,period:'2027 – 2028',title:'Holding Ekosistem & Tata Kelola IPO',status:'upcoming',statusLabel:'Mendatang',summary:'Manajemen pengelolaan hotel di Tanah Suci, integrasi rantai pasok katering, penerapan standar GCG, dan persiapan go-public (IPO).',highlights:['Manajemen long-lease hotel di Saudi','Audit akuntan publik independen','Penyusunan tata kelola siap IPO'],kpiLabel:'Target Valuasi',kpiValue:'Rp.50+ Miliar'}
 ]},
 network:{partnersJson:NETWORK_PARTNERS,portraitUrl:IMAGES.partnerPortrait},
 investor:{itemsJson:INVESTOR_INFO_LIST},
 quick_action:{imageUrl:IMAGES.quickActionBg},
 articles:{itemsJson:ARTICLES_LIST}
};
