import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';

let cached: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (cached) return cached;
  const host = process.env.SMTP_SERVER;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null; // SMTP yapılandırılmamış
  cached = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 → SSL, 587 → STARTTLS
    auth: { user, pass },
  });
  return cached;
}

/** SMTP yapılandırılmışsa true döner (e-posta gönderimi aktif mi?). */
export function mailerConfigured(): boolean {
  return Boolean(process.env.SMTP_SERVER && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/** E-posta gönderir. SMTP yoksa false; gönderim hatasında exception fırlatır. */
export async function sendMail(opts: { to: string; subject: string; text: string; html?: string }): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  await t.sendMail({ from, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html });
  return true;
}
