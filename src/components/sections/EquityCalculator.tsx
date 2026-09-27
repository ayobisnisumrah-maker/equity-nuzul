import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { usePortalContent } from '../../context/PortalContentContext';

interface EquityCalculatorProps {
  onOpenInterest: () => void;
}

interface UnitOption {
  units: number;
  price: number;
  monthlyShare: number;
}

const UNIT_OPTIONS: UnitOption[] = [
  { units: 1, price: 100_000_000, monthlyShare: 1_583_333 },
  { units: 2, price: 200_000_000, monthlyShare: 3_166_666 },
  { units: 5, price: 500_000_000, monthlyShare: 7_916_665 },
  { units: 10, price: 1_000_000_000, monthlyShare: 15_833_330 },
  { units: 25, price: 2_500_000_000, monthlyShare: 39_583_325 },
];

const SHARE_PERCENT_PER_UNIT = 0.8; // 0.8% per unit

const formatRupiah = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

// Format persentase saham: jika bulat tampil 1 angka (4%, 8%, 20%), jika desimal gunakan koma (0,8%, 1,6%)
const formatPercentage = (num: number): string => {
  if (Number.isInteger(num)) {
    return `${num}%`;
  }
  const formatted = parseFloat(num.toFixed(2)).toString().replace('.', ',');
  return `${formatted}%`;
};

export const EquityCalculator: React.FC<EquityCalculatorProps> = ({ onOpenInterest }) => {
  const { content } = usePortalContent();
  const cms = content('equity', {} as Record<string, unknown>);
  const calculatorTitle = typeof cms.calculatorTitle === 'string' ? cms.calculatorTitle : 'Simulasi Bagi Hasil';
  const calculatorNote = typeof cms.calculatorNote === 'string' ? cms.calculatorNote : '*Pencairan dividen ditransfer bulanan sesuai pembukuan riil.';
  const calculatorCta = typeof cms.calculatorCta === 'string' ? cms.calculatorCta : 'Ajukan Minat Equity';
  const configuredOptions = Array.isArray(cms.calculatorOptionsJson) ? cms.calculatorOptionsJson.filter((v): v is UnitOption => Boolean(v) && typeof v === 'object' && Number.isFinite((v as UnitOption).units) && Number.isFinite((v as UnitOption).price) && Number.isFinite((v as UnitOption).monthlyShare)) : [];
  const unitOptions = configuredOptions.length >= 2 ? configuredOptions : UNIT_OPTIONS;
  const sharePercentPerUnit = typeof cms.sharePercentPerUnit === 'number' && cms.sharePercentPerUnit > 0 ? cms.sharePercentPerUnit : SHARE_PERCENT_PER_UNIT;
  const [stepIndex, setStepIndex] = useState<number>(0);

  const safeStepIndex = Math.min(stepIndex, unitOptions.length - 1);
  const currentOption = unitOptions[safeStepIndex];
  const totalInvestment = currentOption.price;
  const ownershipPercentage = currentOption.units * sharePercentPerUnit;
  const monthlyShare = currentOption.monthlyShare;
  const annualShare = monthlyShare * 12;
  const yieldRoi = ((annualShare / totalInvestment) * 100).toFixed(1);

  return (
    <div className="w-full h-full min-h-[420px] sm:min-h-[480px] bg-white rounded-2xl border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-7 flex flex-col justify-between">
      {/* Header Bersih */}
      <div className="pb-3 sm:pb-4">
        <h3 className="text-[20px] sm:text-[22px] font-bold text-[#111111] tracking-tight">
          {calculatorTitle}
        </h3>
      </div>

      {/* Kontrol Slider & 1 Frame Informasi Unit */}
      <div className="my-auto pt-5 pb-5 sm:pt-5.5 sm:pb-5.5 border-y border-black/[0.08] space-y-4">
        {/* Label & Frame Persentase Saham */}
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-bold text-[#666666] uppercase tracking-wider">
            Pilih Jumlah Unit
          </span>
          <span className="text-[12px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shrink-0">
            {formatPercentage(ownershipPercentage)} Saham
          </span>
        </div>

        {/* Slider 1, 2, 5, 10, 25 dengan Thumb Rata Tengah terhadap Angka di Bawahnya */}
        <div className="relative pt-2 pb-1 px-2.5">
          {/* Track container */}
          <div className="relative h-2 bg-gray-200 rounded-full">
            {/* Active filled track */}
            <div
              className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-150"
              style={{ width: `${(stepIndex / (unitOptions.length - 1)) * 100}%` }}
            />

            {/* Native range input overlaid for drag, touch, and accessibility */}
            <input
              id="unit-equity-slider"
              type="range"
              min="0"
              max={unitOptions.length - 1}
              step="1"
              value={stepIndex}
              onChange={(e) => setStepIndex(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              aria-label="Slider Unit Equity"
            />

            {/* Thumb Bulat Hijau: Rata Tengah Sempurna */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-emerald-600 border-2 border-white shadow-md pointer-events-none transition-all duration-150 z-10"
              style={{ left: `${(stepIndex / (unitOptions.length - 1)) * 100}%` }}
            />
          </div>

          {/* Angka Ticks 1, 2, 5, 10, 25: Rata Tengah dengan Thumb */}
          <div className="relative w-full mt-2.5 h-5">
            {unitOptions.map((opt, idx) => {
              const pct = (idx / (unitOptions.length - 1)) * 100;
              const isSelected = stepIndex === idx;
              return (
                <button
                  key={opt.units}
                  type="button"
                  onClick={() => setStepIndex(idx)}
                  className={`absolute -translate-x-1/2 text-center cursor-pointer transition-all duration-150 select-none ${
                    isSelected
                      ? 'text-emerald-700 font-extrabold text-[13px] scale-110'
                      : 'text-[#777777] font-bold text-[12px] hover:text-[#111111]'
                  }`}
                  style={{ left: `${pct}%` }}
                >
                  {opt.units}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1 Frame Informasi Unit yang Dipilih (Bersih tanpa badge saham ganda) */}
        <div className="bg-[#F8F9FA] rounded-xl p-3.5 border border-black/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block">
              Unit Dipilih
            </span>
            <div className="mt-0.5">
              <span className="text-[18px] sm:text-[19px] font-extrabold text-[#111111]">
                {currentOption.units} Unit
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block">
              Nilai Investasi
            </span>
            <span className="text-[15px] sm:text-[16px] font-bold text-[#111111] mt-0.5 block">
              {formatRupiah(totalInvestment)}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Result Box: Bagi Hasil per Bulan & Tahunan */}
      <div className="bg-[#F8F9FA] rounded-xl p-4 border border-black/[0.06] space-y-2.5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block">
            Bagi Hasil per Bulan
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-[23px] sm:text-[25px] font-extrabold text-emerald-700 tracking-tight leading-none">
              {formatRupiah(monthlyShare)}
            </span>
            <span className="text-[12px] font-semibold text-[#666666]">
              /bulan
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between text-[12px]">
          <div>
            <span className="text-[#777777] block text-[11px]">Proyeksi Tahunan</span>
            <span className="font-bold text-[#111111]">
              {formatRupiah(annualShare)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[#777777] block text-[11px]">Estimasi Yield</span>
            <span className="font-bold text-emerald-700">
              ~{yieldRoi}% p.a.
            </span>
          </div>
        </div>
      </div>

      {/* Tombol CTA & Catatan di Atas Tombol */}
      <div className="pt-3">
        <span className="text-[11px] text-[#777777] text-center block mb-2 leading-relaxed">
          {calculatorNote}
        </span>
        <button
          type="button"
          onClick={onOpenInterest}
          className="w-full py-3.5 px-4 rounded-xl bg-[#111111] hover:bg-emerald-600 active:scale-98 text-white font-bold text-[13.5px] flex items-center justify-center gap-2 transition-all duration-200 shadow-sm group cursor-pointer"
        >
          <span>{calculatorCta}</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
