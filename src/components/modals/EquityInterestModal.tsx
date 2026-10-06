import React, { useState } from 'react';
import { X, CheckCircle, Calculator, ShieldCheck, ArrowRight } from 'lucide-react';
import { usePortalContent } from '../../context/PortalContentContext';
import { submitEquityInterest } from '../../services/portalInquiry';

interface EquityInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EquityInterestModal: React.FC<EquityInterestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { content } = usePortalContent();
  const modalCms = content<Record<string, unknown>>('modals', {});
  const equityCms = content<Record<string, unknown>>('equity', {});
  const quickCms = content<Record<string, unknown>>('quick_action', {});
  const cfg = (modalCms.interestJson && typeof modalCms.interestJson === 'object' ? modalCms.interestJson : {}) as Record<string, unknown>;
  const pricePerUnit = typeof cfg.pricePerUnit === 'number' && cfg.pricePerUnit > 0 ? cfg.pricePerUnit : 100000000;
  const sharePercentPerUnit = typeof equityCms.sharePercentPerUnit === 'number' && equityCms.sharePercentPerUnit > 0 ? equityCms.sharePercentPerUnit : 0.8;
  const maxUnits = typeof cfg.maxUnits === 'number' && cfg.maxUnits > 0 ? Math.floor(cfg.maxUnits) : 50;
  const title = typeof cfg.title === 'string' ? cfg.title : 'Ajukan Minat Equity';
  const eyebrow = typeof cfg.eyebrow === 'string' ? cfg.eyebrow : 'Formulir Resmi Calon Investor';
  const description = typeof cfg.description === 'string' ? cfg.description : 'Langkah awal pendaftaran kepemilikan unit equity Nuzultrip. Tanpa komitmen finansial di muka.';
  const whatsappUrl = typeof cfg.whatsappUrl === 'string' ? cfg.whatsappUrl : (typeof quickCms.whatsappUrl === 'string' ? quickCms.whatsappUrl : '');
  const successTitle = typeof cfg.successTitle === 'string' ? cfg.successTitle : 'Pengajuan Minat Diterima';
  const successMessage = typeof cfg.successMessage === 'string' ? cfg.successMessage : 'Tim Investor Relations Nuzultrip akan menghubungi Anda melalui WhatsApp dalam waktu 1x24 jam untuk verifikasi dokumen dan pengiriman Memorandum Informasi resmi.';
  const calculatorLabel = typeof cfg.calculatorLabel === 'string' ? cfg.calculatorLabel : 'Kalkulator Unit Equity';
  const confirmWhatsappLabel = typeof cfg.confirmWhatsappLabel === 'string' ? cfg.confirmWhatsappLabel : 'Konfirmasi via WhatsApp';
  const doneLabel = typeof cfg.doneLabel === 'string' ? cfg.doneLabel : 'Selesai';
  const nameLabel = typeof cfg.nameLabel === 'string' ? cfg.nameLabel : 'Nama Lengkap';
  const namePlaceholder = typeof cfg.namePlaceholder === 'string' ? cfg.namePlaceholder : 'Contoh: Ahmad Fadhil Pratama';
  const phoneLabel = typeof cfg.phoneLabel === 'string' ? cfg.phoneLabel : 'Nomor WhatsApp';
  const phonePlaceholder = typeof cfg.phonePlaceholder === 'string' ? cfg.phonePlaceholder : '081234567890';
  const emailLabel = typeof cfg.emailLabel === 'string' ? cfg.emailLabel : 'Email';
  const emailPlaceholder = typeof cfg.emailPlaceholder === 'string' ? cfg.emailPlaceholder : 'nama@email.com';
  const investorTypeLabel = typeof cfg.investorTypeLabel === 'string' ? cfg.investorTypeLabel : 'Tipe Investor';
  const individualLabel = typeof cfg.individualLabel === 'string' ? cfg.individualLabel : 'Individu';
  const institutionLabel = typeof cfg.institutionLabel === 'string' ? cfg.institutionLabel : 'Badan Usaha';
  const communityLabel = typeof cfg.communityLabel === 'string' ? cfg.communityLabel : 'Komunitas';
  const investorTypeOptions = Array.isArray(cfg.investorTypeOptions) && cfg.investorTypeOptions.every(v=>typeof v==='string') && cfg.investorTypeOptions.length ? cfg.investorTypeOptions as string[] : [individualLabel,institutionLabel,communityLabel];
  const submitLabel = typeof cfg.submitLabel === 'string' ? cfg.submitLabel : 'Kirim Pengajuan Minat';
  const submittingLabel = typeof cfg.submittingLabel === 'string' ? cfg.submittingLabel : 'Mengirim...';
  const unitsLabel = typeof cfg.unitsLabel === 'string' ? cfg.unitsLabel : 'Jumlah Unit';
  const interestedUnitsLabel = typeof cfg.interestedUnitsLabel === 'string' ? cfg.interestedUnitsLabel : 'Unit Diminati';
  const investmentEstimateLabel = typeof cfg.investmentEstimateLabel === 'string' ? cfg.investmentEstimateLabel : 'Estimasi Investasi';
  const privacyNotice = typeof cfg.privacyNotice === 'string' ? cfg.privacyNotice : '{privacyNotice}';
  const [units, setUnits] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [investorType, setInvestorType] = useState<string>(investorTypeOptions[0]||'Individu');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting,setIsSubmitting]=useState(false);
  const [submitError,setSubmitError]=useState('');

  if (!isOpen) return null;

  const totalInvestment = units * pricePerUnit;
  const totalOwnership = (units * sharePercentPerUnit).toFixed(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setSubmitError('');
    try {
      await submitEquityInterest({name,email,phone,investorType,units,ownershipPercent:Number(totalOwnership),investmentValue:totalInvestment});
      setIsSubmitted(true);
    } catch(error) {
      setSubmitError(error instanceof Error ? error.message : 'Pengajuan belum berhasil dikirim. Silakan coba kembali.');
    } finally { setIsSubmitting(false); }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#F5F5F3] rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#666666] hover:text-[#090909] hover:bg-black/5 transition-colors focus-visible:outline-none"
          aria-label="Tutup form"
        >
          <X size={20} />
        </button>

        {isSubmitted ? (
          <div className="py-6 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-5">
              <CheckCircle size={36} />
            </div>
            <h3 className="text-[22px] sm:text-[24px] font-bold text-[#111111] mb-2">
              {successTitle}
            </h3>
            <p className="text-[14.5px] text-[#555555] leading-relaxed max-w-[420px] mx-auto mb-6">
              Terima kasih, <strong>{name}</strong>. {successMessage} ({phone})
            </p>

            <div className="bg-white rounded-2xl p-5 border border-black/10 text-left mb-6 max-w-md mx-auto space-y-2 text-[14px]">
              <div className="flex justify-between">
                <span className="text-[#666666]">{interestedUnitsLabel}:</span>
                <span className="font-bold text-[#111111]">{units} Unit ({totalOwnership}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">{investmentEstimateLabel}:</span>
                <span className="font-bold text-[#111111]">
                  Rp {(totalInvestment / 1000000).toLocaleString('id-ID')} Juta
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Tipe Investor:</span>
                <span className="font-semibold text-[#111111]">{investorType}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`${whatsappUrl}${whatsappUrl.includes('?')?'&':'?'}text=${encodeURIComponent(`Halo Admin Nuzultrip, saya sudah mengisi pengajuan minat equity atas nama ${name} sejumlah ${units} unit.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 rounded-xl bg-[#090909] text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-[#222222]"
              >
                <span>{confirmWhatsappLabel}</span>
                <ArrowRight size={15} />
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-5 rounded-xl border border-black/20 text-[#111111] font-semibold text-[14px] hover:bg-black/5"
              >
                {doneLabel}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 border border-black/10 text-[11px] font-bold uppercase tracking-[0.14em] text-[#555555] mb-2">
                <ShieldCheck size={13} />
                <span>{eyebrow}</span>
              </div>
              <h3 className="text-[22px] sm:text-[26px] font-extrabold text-[#111111] tracking-tight">
                {title}
              </h3>
              <p className="text-[14px] text-[#666666] mt-1">
                {description}
              </p>
            </div>

            {/* Interactive Calculator Box */}
            <div className="bg-white rounded-2xl p-5 border border-black/10 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#555555]">
                  <Calculator size={15} />
                  <span>{calculatorLabel}</span>
                </div>
                <span className="text-[12px] text-[#888888]">1 Unit = {new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(pricePerUnit)}</span>
              </div>

              {/* Slider & Counter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#333333]">
                    Jumlah Unit:
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setUnits((prev) => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-lg border border-black/20 font-bold flex items-center justify-center hover:bg-black/5"
                    >
                      -
                    </button>
                    <span className="text-[18px] font-extrabold w-10 text-center text-[#111111]">
                      {units}
                    </span>
                    <button
                      type="button"
                      onClick={() => setUnits((prev) => Math.min(maxUnits, prev + 1))}
                      className="w-8 h-8 rounded-lg border border-black/20 font-bold flex items-center justify-center hover:bg-black/5"
                    >
                      +
                    </button>
                  </div>
                </div>

                <input
                  type="range"
                  min="1"
                  max={maxUnits}
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  className="w-full h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#090909]"
                />

                {/* Calculation breakdown */}
                <div className="pt-3 border-t border-black/[0.06] grid grid-cols-2 gap-2 text-[13.5px]">
                  <div>
                    <span className="text-[#666666] block text-[12px]">Porsi Saham:</span>
                    <span className="font-bold text-[#111111]">{totalOwnership}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#666666] block text-[12px]">Nilai Investasi:</span>
                    <span className="font-bold text-[#111111] text-[15px]">
                      Rp {(totalInvestment / 1000000).toLocaleString('id-ID')} Juta
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError&&<div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[12px] text-red-700">{submitError}</div>}
              <div>
                <label className="block text-[13px] font-bold text-[#111111] mb-1">
                  {nameLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={namePlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-[14px] text-[#111111] placeholder:text-black/35 focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-[#111111] mb-1">
                    {phoneLabel} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={phonePlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-[14px] text-[#111111] placeholder:text-black/35 focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#111111] mb-1">
                    {emailLabel} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={emailPlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-[14px] text-[#111111] placeholder:text-black/35 focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#111111] mb-1">
                  {investorTypeLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {investorTypeOptions.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInvestorType(type)}
                      className={`py-2 text-[13px] font-medium rounded-xl border transition-all ${
                        investorType === type
                          ? 'border-black bg-[#090909] text-white'
                          : 'border-black/15 bg-white text-[#555555] hover:border-black/30'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#090909] text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#222222] active:scale-98 transition-all shadow-md cursor-pointer"
                >
                  <span>{isSubmitting?submittingLabel:submitLabel}</span>
                  <ArrowRight size={16} />
                </button>
                <p className="text-[11.5px] text-[#777777] text-center mt-2.5">
                  Data Anda dijaga kerahasiaannya dan hanya digunakan untuk keperluan komunikasi penawaran resmi Nuzultrip Equity.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
