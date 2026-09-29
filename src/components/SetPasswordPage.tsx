import React,{useEffect,useState} from 'react';
import {Lock,Eye,EyeOff} from 'lucide-react';
import {supabase} from '../lib/supabase';

export const SetPasswordPage:React.FC=()=>{
 const [password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[checking,setChecking]=useState(true),[authorized,setAuthorized]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');

 useEffect(()=>{
  if(!supabase){setError('Supabase belum dikonfigurasi.');setChecking(false);return}
  let alive=true;
  const verify=async()=>{
   const {data,error}=await supabase.auth.getSession();
   if(!alive)return;
   if(error||!data.session){setAuthorized(false);setError('Tautan atur ulang sandi tidak valid atau sudah kedaluwarsa.');setChecking(false);return}
   setAuthorized(true);setChecking(false);
  };
  void verify();
  const {data:listener}=supabase.auth.onAuthStateChange((_event,session)=>{
   if(!alive)return;
   if(!session){setAuthorized(false);setChecking(false)}
  });
  return()=>{alive=false;listener.subscription.unsubscribe()};
 },[]);

 const submit=async(e:React.FormEvent)=>{
  e.preventDefault();setError('');setMessage('');
  if(!authorized){setError('Tautan atur ulang sandi tidak valid atau sudah kedaluwarsa.');return}
  if(password.length<8){setError('Kata sandi minimal 8 karakter.');return}
  if(password!==confirm){setError('Konfirmasi kata sandi tidak sama.');return}
  if(!supabase){setError('Supabase belum dikonfigurasi.');return}
  setBusy(true);
  const {data:sessionData,error:sessionError}=await supabase.auth.getSession();
  if(sessionError||!sessionData.session){setBusy(false);setAuthorized(false);setError('Sesi atur ulang sandi sudah kedaluwarsa. Silakan minta tautan baru.');return}
  const {error:updateError}=await supabase.auth.updateUser({password});
  setBusy(false);
  if(updateError){setError(updateError.message);return}
  setMessage('Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru.');
  setAuthorized(false);
  await supabase.auth.signOut();
 };

 if(checking)return <main className="min-h-screen bg-[#F5F5F3] flex items-center justify-center p-4"><p className="text-sm text-black/50">Memverifikasi tautan...</p></main>;

 return <main className="min-h-screen bg-[#F5F5F3] flex items-center justify-center p-4"><section className="w-full max-w-md bg-white border border-black/10 rounded-3xl p-6 sm:p-8 shadow-sm"><div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center mb-5"><Lock size={20}/></div><h1 className="text-2xl font-extrabold">Atur Kata Sandi</h1><p className="text-sm text-black/50 mt-2 mb-6">Buat kata sandi baru untuk akun Portal Nuzultrip.</p>{message&&<div className="mb-4 rounded-xl bg-black/[.04] p-3 text-sm">{message}</div>}{error&&<div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}{authorized&&!message&&<form onSubmit={submit} className="space-y-4"><label className="block"><span className="text-xs font-bold">Kata Sandi Baru</span><div className="relative mt-1"><input required minLength={8} type={show?'text':'password'} className="w-full border rounded-xl px-3 py-2.5 pr-10" value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40">{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label><label className="block"><span className="text-xs font-bold">Konfirmasi Kata Sandi</span><input required minLength={8} type={show?'text':'password'} className="w-full border rounded-xl px-3 py-2.5 mt-1" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><button disabled={busy} className="w-full bg-black text-white rounded-xl py-3 font-bold text-sm disabled:opacity-60">{busy?'Menyimpan...':'Simpan Kata Sandi Baru'}</button></form>}<button onClick={()=>{window.history.replaceState({},'', '/');window.location.reload()}} className="w-full mt-3 border rounded-xl py-3 font-bold text-sm">Kembali ke Portal</button></section></main>
};