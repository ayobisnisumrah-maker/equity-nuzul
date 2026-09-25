import { usePortalSection } from '../../context/PortalContentContext';
import React, { useState } from 'react';
import {
  FileText,
  SearchCheck,
  Scale,
  Award,
  ArrowRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Container } from '../layout/Container';
import { Eyebrow } from '../ui/Eyebrow';
import { StaggerText, StaggerHeading } from '../ui/LetterStagger';

interface ProcessSectionProps {
  onOpenDetail: () => void;
  onOpenInterest?: () => void;
}

interface StepItem {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  duration: string;
  output: string;
  icon: React.ReactNode;
}

const STEPS: StepItem[] = [
  {
    id: 'step-1',
    stepNumber: '01',
    title: 'Pengisian Minat & Reservasi',
    description:
      'Pengisian formulir Letter of Intent (LOI) dan penentuan kuota 1 hingga 50 unit equity yang dikehendaki.',
    duration: '± 3 Menit',
    output: 'Bukti Reservasi Unit',
    icon: <FileText size={20} className="text-emerald-400" />,
  },
  {
    id: 'step-2',
    stepNumber: '02',
    title: 'Verifikasi & Due Diligence',
    description:
      'Akses prospektus penawaran, audit laporan keuangan historis, serta sesi konsultasi eksklusif bersama Direksi.',
    duration: '1 – 2 Hari Kerja',
    output: 'Prospektus & NDA',
    icon: <SearchCheck size={20} className="text-emerald-400" />,
  },
  {
    id: 'step-3',
    stepNumber: '03',
    title: 'Akad Notaris & Penyetoran',
    description:
      'Penandatanganan Akta Perjanjian Pemegang Saham (SHA) resmi di hadapan Notaris rekanan berizin.',
    duration: 'Jadwal Terjadwal',
    output: 'Akta Notaris Resmi',
    icon: <Scale size={20} className="text-emerald-400" />,
  },
  {
    id: 'step-4',
    stepNumber: '04',
    title: 'Penerbitan Saham & Portal',
    description:
      'Penyerahan Sertifikat Saham resmi dan aktivasi akun portal investor untuk memantau dividen bulanan.',
    duration: 'Langsung Aktif',
    output: 'Sertifikat & Portal Investor',
    icon: <Award size={20} className="text-emerald-400" />,
  },
];

export const ProcessSection: React.FC<ProcessSectionProps> = ({
  onOpenDetail,
  onOpenInterest,
}) => {
  const field = usePortalSection('process');
  const cmsItems = field('stepsJson', STEPS).map((step, index) => ({ ...step, icon: STEPS[index % STEPS.length].icon }));
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <section
      id="proses"
      className="bg-[#131314] text-white py-16 sm:py-24 lg:py-28 relative overflow-hidden"
    >
      {/* Background ambient lighting - soft, non-intrusive */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/[0.04] rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <Container size="default">
        {/* Section Header - Clean & Focused */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 flex flex-col items-center px-4">
          <Eyebrow variant="dark">{field('eyebrow', 'ALUR & TAHAPAN INVESTASI')}</Eyebrow>
          <div className="mb-3 sm:mb-4 text-center">
            <StaggerHeading
              as="h2"
              text={field('headline', 'Langkah Mudah Menjadi Bagian dari Kami')}
              className="font-h2 font-bold text-white leading-[1.14] tracking-tight justify-center text-center"
              highlightWord="Kami"
              highlightClass="text-emerald-400"
            />
          </div>
          <p className="text-[15px] sm:text-[16px] text-white/70 leading-[1.6] max-w-lg">
            {field('description', 'Empat tahapan transparan dan berkepastian hukum untuk menjadi pemegang unit equity resmi ekosistem Nuzultrip.')}
          </p>
        </div>

        {/* Minimalist 4-Step Progressive Grid */}
        <div className="relative mb-12 sm:mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10">
            {cmsItems.map((step, index) => {
              const isSelected = activeStep === index;

              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`group relative rounded-2xl p-5 sm:p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between border overflow-hidden ${
                    isSelected
                      ? 'bg-[#1e1f20] border-emerald-400/70 shadow-[0_8px_30px_rgba(16,185,129,0.18)] -translate-y-1'
                      : 'bg-[#1e1f20]/60 border-white/10 hover:bg-[#1e1f20] hover:border-emerald-400/50 hover:shadow-[0_0_28px_rgba(16,185,129,0.18)] hover:-translate-y-1.5'
                  }`}
                >
                  {/* Signal Top Edge Pulse Beam on Hover */}
                  <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Ambient Signal Ripple Glow in Background */}
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/0 group-hover:bg-emerald-500/10 rounded-full blur-xl transition-colors duration-500 pointer-events-none" />

                  {/* Step Header: Step Number, Signal Indicator & Icon */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-[24px] sm:text-[26px] font-extrabold tracking-tight transition-colors ${
                            isSelected ? 'text-emerald-400' : 'text-white/50 group-hover:text-emerald-300'
                          }`}
                        >
                          {step.stepNumber}
                        </span>

                        {/* Interactive Signal Ping Beacon */}
                        <div className="relative flex items-center justify-center w-3 h-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-0 group-hover:opacity-90 duration-700" />
                          <span
                            className={`relative inline-flex rounded-full h-1.5 w-1.5 transition-all ${
                              isSelected
                                ? 'bg-emerald-400 ring-2 ring-emerald-400/40'
                                : 'bg-white/30 group-hover:bg-emerald-400 group-hover:ring-2 group-hover:ring-emerald-400/50'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Icon Container with Signal Ring Expansion */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative ${
                          isSelected
                            ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 ring-2 ring-emerald-400/20'
                            : 'bg-white/[0.05] border border-white/10 text-white/50 group-hover:text-emerald-300 group-hover:bg-emerald-500/15 group-hover:border-emerald-400/40 group-hover:ring-4 group-hover:ring-emerald-400/20 group-hover:scale-105'
                        }`}
                      >
                        {step.icon}
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-[17px] font-bold text-white tracking-tight mb-2.5 leading-snug">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-[13.5px] text-white/65 leading-relaxed mb-6">
                      {step.description}
                    </p>
                  </div>

                  {/* Step Footer: Duration & Output Badge */}
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} className="text-emerald-400/80" />
                        <span>Estimasi</span>
                      </span>
                      <span className="font-semibold text-white/80">{step.duration}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-white/50">
                        <ShieldCheck size={12} className="text-emerald-400/80" />
                        <span>Output</span>
                      </span>
                      <span className="font-medium text-emerald-300/90 truncate max-w-[150px]">
                        {step.output}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action & Consultation Bar - Clean, Centered */}
        <div className="max-w-xl mx-auto text-center flex flex-col sm:flex-row items-center justify-center gap-3.5 px-4">
          <button
            type="button"
            id="process-primary-cta"
            onClick={onOpenInterest || onOpenDetail}
            className="group w-full sm:w-auto px-7 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <StaggerText text={field('primaryCta', 'Ajukan Minat Unit Equity')} />
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          <button
            type="button"
            id="process-secondary-cta"
            onClick={onOpenDetail}
            className="group w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-medium text-sm transition-all duration-200 cursor-pointer text-center"
          >
            <StaggerText text={field('secondaryCta', 'Pelajari Prosedur Lengkap')} />
          </button>
        </div>
      </Container>
    </section>
  );
};
