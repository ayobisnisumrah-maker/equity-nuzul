import React from 'react';
import { X, ArrowRight, Check } from 'lucide-react';

interface DetailInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category?: string;
  content: string;
  detailsList?: string[];
  onOpenInterest?: () => void;
}

export const DetailInfoModal: React.FC<DetailInfoModalProps> = ({
  isOpen,
  onClose,
  title,
  category = 'Informasi Resmi',
  content,
  detailsList,
  onOpenInterest,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#F5F5F3] rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#666666] hover:text-[#090909] hover:bg-black/5 transition-colors focus-visible:outline-none"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        <div className="mb-5">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#777777]">
            {category}
          </span>
          <h3 className="text-[22px] sm:text-[24px] font-extrabold text-[#111111] mt-1 tracking-tight">
            {title}
          </h3>
        </div>

        <div className="text-[15px] text-[#444444] leading-relaxed mb-6 space-y-3">
          <p>{content}</p>
        </div>

        {detailsList && detailsList.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-black/10 mb-6 space-y-2.5">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#333333] mb-2">
              Poin Kunci & Ketentuan
            </h4>
            {detailsList.map((point, index) => (
              <div key={index} className="flex items-start gap-2.5 text-[14px] text-[#555555]">
                <div className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center shrink-0 mt-0.5 text-black">
                  <Check size={12} />
                </div>
                <span>{point}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-black/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl border border-black/20 text-[#111111] font-semibold text-[14px] hover:bg-black/5"
          >
            Tutup
          </button>
          {onOpenInterest && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenInterest();
              }}
              className="py-2.5 px-5 rounded-xl bg-[#090909] text-white font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#222222]"
            >
              <span>Ajukan Minat Equity</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
