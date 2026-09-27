import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'

type EmailData = {
  token: string
  token_hash: string
  redirect_to: string
  email_action_type: string
}

type HookPayload = {
  user: { email?: string }
  email_data: EmailData
}

const subjects: Record<string, string> = {
  signup: 'Konfirmasi email Nuzultrip Equity',
  recovery: 'Atur ulang kata sandi Nuzultrip Equity',
  invite: 'Undangan Nuzultrip Equity',
  magiclink: 'Tautan masuk Nuzultrip Equity',
  email_change: 'Konfirmasi perubahan email Nuzultrip Equity',
  email_change_new: 'Konfirmasi email baru Nuzultrip Equity',
  reauthentication: 'Kode verifikasi Nuzultrip Equity',
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]!)
}

function buildVerifyUrl(data: EmailData) {
  const base = `${Deno.env.get('SUPABASE_URL') ?? ''}/auth/v1/verify`
  const params = new URLSearchParams({
    token: data.token_hash,
    type: data.email_action_type,
    redirect_to: data.redirect_to,
  })
  return `${base}?${params.toString()}`
}

function template(data: EmailData) {
  const action = data.email_action_type
  if (action === 'reauthentication') {
    return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111"><h2>Nuzultrip Equity</h2><p>Kode verifikasi Anda:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px">${escapeHtml(data.token)}</p><p>Jika Anda tidak meminta kode ini, abaikan email ini.</p></div>`
  }
  const labels: Record<string, string> = {
    signup: 'Konfirmasi Email',
    recovery: 'Atur Ulang Kata Sandi',
    invite: 'Terima Undangan',
    magiclink: 'Masuk ke Portal',
    email_change: 'Konfirmasi Perubahan Email',
    email_change_new: 'Konfirmasi Email Baru',
  }
  const url = escapeHtml(buildVerifyUrl(data))
  const label = labels[action] ?? 'Lanjutkan'
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111"><h2>Nuzultrip Equity</h2><p>Gunakan tombol berikut untuk melanjutkan proses akun Anda.</p><p><a href="${url}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px">${label}</a></p><p>Jika Anda tidak melakukan permintaan ini, abaikan email ini.</p></div>`
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const apiKey = Deno.env.get('RESEND_API_KEY')
  const rawHookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')
  const from = Deno.env.get('RESEND_FROM_EMAIL') ?? 'Nuzultrip Equity <no-reply@nuzultrip.click>'
  if (!apiKey || !rawHookSecret) {
    return Response.json({ error: 'email_hook_not_configured' }, { status: 500 })
  }

  try {
    const payload = await req.text()
    const secret = rawHookSecret.replace('v1,whsec_', '')
    const wh = new Webhook(secret)
    const { user, email_data } = wh.verify(payload, Object.fromEntries(req.headers)) as HookPayload
    if (!user.email) return Response.json({ error: 'recipient_missing' }, { status: 400 })

    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from,
      to: [user.email],
      subject: subjects[email_data.email_action_type] ?? 'Nuzultrip Equity',
      html: template(email_data),
    })
    if (error) throw error

    return Response.json({})
  } catch (error) {
    console.error('send-email hook failed', error instanceof Error ? error.message : 'unknown')
    return Response.json({ error: 'email_delivery_failed' }, { status: 401 })
  }
})
