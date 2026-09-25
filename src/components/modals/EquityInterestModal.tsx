import React, { useState } from 'react';
import { X, CheckCircle, Calculator, ShieldCheck, ArrowRight } from 'lucide-react';

interface EquityInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EquityInterestModal: React.FC<EquityInterestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [units, setUnits] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [investorType, setInvestorType] = useState<string>('Individu');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const pricePerUnit = 100000000; // Rp 100 Juta
  const totalInvestment = units * pricePerUnit;
  const totalOwnership = (units * 0.8).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
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
              Pengajuan Minat Diterima
            </h3>
            <p className="text-[14.5px] text-[#555555] leading-relaxed max-w-[420px] mx-auto mb-6">
              Terima kasih, <strong>{name}</strong>. Tim Investor Relations Nuzultrip akan menghubungi Anda melalui WhatsApp ({phone}) dalam waktu 1x24 jam untuk verifikasi dokumen dan pengiriman Memorandum Informasi resmi.
            </p>

            <div className="bg-white rounded-2xl p-5 border border-black/10 text-left mb-6 max-w-md mx-auto space-y-2 text-[14px]">
              <div className="flex justify-between">
                <span className="text-[#666666]">Unit Diminati:</span>
                <span className="font-bold text-[#111111]">{units} Unit ({totalOwnership}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Estimasi Investasi:</span>
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
                href={`https://wa.me/6281234567890?text=Halo%20Admin%20Nuzultrip,%20saya%20sudah%20mengisi%20pengajuan%20minat%20equity%20atas%20nama%20${encodeURIComponent(
                  name
                )}%20sejumlah%20${units}%20unit.`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 rounded-xl bg-[#090909] text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-[#222222]"
              >
                <span>Konfirmasi via WhatsApp</span>
                <ArrowRight size={15} />
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-5 rounded-xl border border-black/20 text-[#111111] font-semibold text-[14px] hover:bg-black/5"
              >
                Selesai
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 border border-black/10 text-[11px] font-bold uppercase tracking-[0.14em] text-[#555555] mb-2">
                <ShieldCheck size={13} />
                <span>Formulir Resmi Calon Investor</span>
              </div>
              <h3 className="text-[22px] sm:text-[26px] font-extrabold text-[#111111] tracking-tight">
                Ajukan Minat Equity
              </h3>
              <p className="text-[14px] text-[#666666] mt-1">
                Langkah awal pendaftaran kepemilikan unit equity Nuzultrip. Tanpa komitmen finansial di muka.
              </p>
            </div>

            {/* Interactive Calculator Box */}
            <div className="bg-white rounded-2xl p-5 border border-black/10 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#555555]">
                  <Calculator size={15} />
                  <span>Kalkulator Unit Equity</span>
                </div>
                <span className="text-[12px] text-[#888888]">1 Unit = Rp 100 Juta</span>
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
                      onClick={() => setUnits((prev) => Math.min(20, prev + 1))}
                      className="w-8 h-8 rounded-lg border border-black/20 font-bold flex items-center justify-center hover:bg-black/5"
                    >
                      +
                    </button>
                  </div>
                </div>

                <input
                  type="range"
                  min="1"
                  max="15"
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
              <div>
                <label className="block text-[13px] font-bold text-[#111111] mb-1">
                  Nama Lengkap Sesuai KTP *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ahmad Fadhil Pratama"
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-[14px] text-[#111111] placeholder:text-black/35 focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-[#111111] mb-1">
                    Nomor WhatsApp / HP *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-[14px] text-[#111111] placeholder:text-black/35 focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#111111] mb-1">
                    Email Aktif *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-[14px] text-[#111111] placeholder:text-black/35 focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#111111] mb-1">
                  Profil Calon Investor
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Individu', 'Badan Usaha', 'Komunitas'].map((type) => (
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
                  className="w-full py-3.5 px-6 rounded-xl bg-[#090909] text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#222222] active:scale-98 transition-all shadow-md cursor-pointer"
                >
                  <span>Kirim Pengajuan Minat</span>
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
