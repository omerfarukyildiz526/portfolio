// /logs sayfasının Instagram-benzeri profil header'ı için içerik şeması.
// site-content.ts'teki { tr, en } pattern'iyle tutarlı.

export interface LogsProfileContent {
  avatarUrl: string;      // boşsa grid sayfası 📓 emoji fallback'ine düşer
  username: string;       // "@" olmadan, ör. "dev.omer.logs"
  displayName: string;    // IG'deki gibi kullanıcı adının altında görünen ad-soyad
  instagramUrl: string;
  followerCount: number;  // statik/manuel — gerçek takip sistemi yok, yalnızca görsel
  followingCount: number; // statik/manuel — gerçek takip sistemi yok, yalnızca görsel
  bio: { tr: string; en: string };
}

export const SEED_LOGS_PROFILE: LogsProfileContent = {
  avatarUrl: '',
  username: 'dev.omer.logs',
  displayName: 'Ömer Faruk YILDIZ',
  instagramUrl: 'https://instagram.com/dev.omer.logs',
  followerCount: 0,
  followingCount: 0,
  bio: {
    tr: 'Instagram’da paylaştığım kısa içeriklerin derinlemesine hali burada. Backend, otomasyon, sistem entegrasyonu.',
    en: 'The in-depth version of what I share on Instagram. Backend, automation, system integration.',
  },
};
