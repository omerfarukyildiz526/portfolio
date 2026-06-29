import 'server-only';
import { randomBytes } from 'crypto';
import { getDb } from './mongodb';
import { createPendingRequest } from './login-requests';

// Telegram bot ile giriş onayı. Yapılandırma DB'de (settings/_id:'telegram').
type TgDoc = { _id: string; botToken?: string; chatId?: string; webhookSecret?: string };

async function tgCol() { return (await getDb()).collection<TgDoc>('settings'); }
async function getDoc(): Promise<TgDoc | null> { return (await tgCol()).findOne({ _id: 'telegram' }); }

type TgResult<T = unknown> = { ok: boolean; result?: T; description?: string };

async function tgApi<T = unknown>(token: string, method: string, params?: Record<string, unknown>): Promise<TgResult<T>> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {}),
      cache: 'no-store',
    });
    return (await res.json()) as TgResult<T>;
  } catch (e) {
    return { ok: false, description: (e as Error).message };
  }
}

// Panel durumu (token sızdırmadan).
export async function getTelegramStatus(): Promise<{ configured: boolean; chatId?: string }> {
  const d = await getDoc();
  return { configured: !!(d?.botToken && d?.chatId && d?.webhookSecret), chatId: d?.chatId };
}

// Bota gönderilen son mesajdan chat id'yi bul (webhook'u geçici kaldırır).
export async function discoverChatId(token: string): Promise<{ chatId?: string; error?: string }> {
  await tgApi(token, 'deleteWebhook', {});
  const r = await tgApi<Array<{ message?: { chat?: { id?: number } } }>>(token, 'getUpdates', {});
  if (!r.ok) return { error: r.description || 'Bot token geçersiz olabilir.' };
  const updates = r.result || [];
  for (let i = updates.length - 1; i >= 0; i--) {
    const id = updates[i]?.message?.chat?.id;
    if (id != null) return { chatId: String(id) };
  }
  return { error: 'Mesaj bulunamadı — önce Telegram\'da botuna bir mesaj (örn. /start) gönder.' };
}

// Token + chatId kaydet, webhook kur, test mesajı gönder.
export async function activateTelegram(token: string, chatId: string, origin: string): Promise<{ ok: boolean; error?: string }> {
  const webhookSecret = randomBytes(24).toString('hex');
  const url = `${origin.replace(/\/+$/, '')}/api/admin/telegram/webhook`;
  const wh = await tgApi(token, 'setWebhook', { url, secret_token: webhookSecret, allowed_updates: ['callback_query'] });
  if (!wh.ok) return { ok: false, error: wh.description || 'Webhook kurulamadı.' };
  await (await tgCol()).replaceOne({ _id: 'telegram' }, { botToken: token, chatId, webhookSecret }, { upsert: true });
  const test = await tgApi(token, 'sendMessage', { chat_id: chatId, text: '✅ Telegram girişi etkinleştirildi. Artık giriş onayları buraya gelecek.' });
  if (!test.ok) return { ok: false, error: 'Webhook kuruldu ama test mesajı gönderilemedi: ' + (test.description || '') };
  return { ok: true };
}

export async function disableTelegram(): Promise<void> {
  const d = await getDoc();
  if (d?.botToken) await tgApi(d.botToken, 'deleteWebhook', {});
  await (await tgCol()).deleteOne({ _id: 'telegram' });
}

// Telegram kurulu mu? (yardımcı bildirimler için.)
export async function telegramReady(): Promise<boolean> {
  const d = await getDoc();
  return !!(d?.botToken && d?.chatId);
}

// Yapılandırılmış chat'e düz mesaj gönder (ör. ziyaretçi özeti). Kurulu değilse sessiz.
export async function sendTelegramMessage(text: string): Promise<boolean> {
  const d = await getDoc();
  if (!d?.botToken || !d?.chatId) return false;
  const r = await tgApi(d.botToken, 'sendMessage', { chat_id: d.chatId, text, disable_web_page_preview: true });
  return !!r.ok;
}

// Giriş onayı: bekleyen istek oluştur + Telegram'a onay/ret butonlu mesaj gönder.
export async function sendTelegramLoginRequest(ua: string): Promise<{ id: string } | null | 'unconfigured'> {
  const d = await getDoc();
  if (!d?.botToken || !d?.chatId) return 'unconfigured';
  const { id } = await createPendingRequest(ua);
  const text = `🔐 Admin giriş onayı\n\nCihaz: ${ua}\nSaat: ${new Date().toLocaleString('tr-TR')}\n\nGirişi onaylıyor musun?`;
  const r = await tgApi(d.botToken, 'sendMessage', {
    chat_id: d.chatId,
    text,
    reply_markup: { inline_keyboard: [[
      { text: '✅ Onayla', callback_data: `a:${id}` },
      { text: '❌ Reddet', callback_data: `d:${id}` },
    ]] },
  });
  if (!r.ok) return null;
  return { id };
}

// Webhook tarafının ihtiyaç duyduğu iç yapılandırma.
export async function getTelegramInternal(): Promise<{ botToken?: string; chatId?: string; webhookSecret?: string } | null> {
  return getDoc();
}

// Webhook: butona basınca mesajı sonuca göre güncelle + bildirimi kapat.
export async function telegramAnswer(token: string, callbackQueryId: string, chatId: string | number, messageId: number, approved: boolean): Promise<void> {
  await tgApi(token, 'answerCallbackQuery', { callback_query_id: callbackQueryId, text: approved ? 'Onaylandı ✅' : 'Reddedildi ❌' });
  await tgApi(token, 'editMessageText', {
    chat_id: chatId, message_id: messageId,
    text: approved ? '✅ Giriş onaylandı.' : '❌ Giriş reddedildi.',
  });
}
