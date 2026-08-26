// "Konular" — kullanıcının elle oluşturduğu, gönderilerden bağımsız konu
// başlıkları (ör. "C# API"). Her gönderi (opsiyonel) bir konuya bağlanır;
// bu, gönderinin serbest `tags` alanından tamamen ayrı bir gruplamadır.
export interface Topic {
  slug: string;
  title: string;
  description?: string;
  cover?: string;
  symbol: string;
  gradient: [string, string];
  createdAt: string;
}
