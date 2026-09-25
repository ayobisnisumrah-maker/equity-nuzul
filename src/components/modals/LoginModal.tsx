import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { signInPortal, type PortalRole } from '../../services/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInterest: () => void;
  onAuthenticated: (role: PortalRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenInterest,
  onAuthenticated,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [investorId, setInvestorId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authenticatedRole,setAuthenticatedRole]=useState<PortalRole>('investor');
  const [loginError,setLoginError]=useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoggingIn(true); setLoginError('');
    try { const result=await signInPortal(investorId,password); setAuthenticatedRole(result.role); setIsSuccess(true); }
    catch(error){ setLoginError(error instanceof Error?error.message:'Gagal masuk.'); }
    finally { setIsLoggingIn(false); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#F5F5F3] rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/10 max-h-[90vh] overflow-y-auto"
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

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-black text-white mx-auto flex items-center justify-center mb-4">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-[20px] font-bold text-[#111111] mb-2">
              Autentikasi Berhasil
            </h3>
            <p className="text-[14px] text-[#555555] leading-relaxed mb-6">
              {authenticatedRole==='admin'?'Akses Admin Nuzultrip berhasil diverifikasi.':'Selamat datang di Portal Investor Nuzultrip. Sesi Anda telah aktif.'}
            </p>
            <button
              type="button"
              onClick={()=>onAuthenticated(authenticatedRole)}
              className="w-full py-3 px-5 rounded-xl bg-[#090909] text-white font-bold text-[14px]"
            >
              {authenticatedRole==='admin'?'Masuk Dashboard Admin':'Masuk Dashboard Investor'}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-[#090909] text-white flex items-center justify-center">
                <Lock size={20} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#888888]">
                  Portal Resmi
                </span>
                <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#111111]">
                  Masuk Portal Investor
                </h3>
              </div>
            </div>

            <p className="text-[13.5px] text-[#666666] leading-relaxed mb-6">
              Khusus bagi pemegang unit equity terdaftar dan mitra strategis Nuzultrip.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginError&&<div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[12px] text-red-700">{loginError}</div>}
              <div>
                <label className="block text-[13px] font-bold text-[#111111] mb-1">
                  ID Investor / Email Terdaftar
                </label>
                <input
                  type="text"
                  required
                  value={investorId}
                  onChange={(e) => setInvestorId(e.target.value)}
                  placeholder="Contoh: NZ-INV-2024-001"
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-[14px] text-[#111111] placeholder:text-black/35 focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[13px] font-bold text-[#111111]">
                    Kata Sandi
                  </label>
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Admin%20Nuzultrip,%20saya%20membutuhkan%20bantuan%20reset%20kata%20sandi%20portal%20investor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-[#666666] hover:text-black"
                  >
                    Lupa sandi?
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-[14px] text-[#111111] placeholder:text-black/35 focus:border-black focus:ring-1 focus:ring-black outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/80"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 px-5 rounded-xl bg-[#090909] text-white font-bold text-[14.5px] flex items-center justify-center gap-2 hover:bg-[#222222] active:scale-98 transition-all cursor-pointer disabled:opacity-70"
                >
                  {isLoggingIn ? (
                    <span>Memverifikasi Akses...</span>
                  ) : (
                    <>
                      <span>Masuk ke Akun</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-3 border-t border-black/[0.08] text-center">
                <p className="text-[13px] text-[#666666]">
                  Belum memiliki akun investor?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenInterest();
                    }}
                    className="font-bold text-[#111111] hover:underline"
                  >
                    Ajukan Minat Equity Sekarang
                  </button>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
