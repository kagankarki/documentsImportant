# Belge Hazinesi 🔒

Apple tarzı, tek dosyalık bir bilmece oyunu. Belge **cevaplardan üretilen anahtarla
şifreli** olarak `index.html` içine gömülüdür — kaynağı açıp kopyalamak işe yaramaz.
Yalnızca **tüm soruları** doğru bilen kişi belgeyi çözüp indirebilir. Açık/koyu tema,
açık uçlu ve çoktan seçmeli sorular desteklenir.

## Nasıl çalışır?
`index.html` dosyasını modern bir tarayıcıda aç (çift tıkla — sunucu gerekmez).
Açılışta tema seçilir, ardından sırayla tüm sorular sorulur. Hepsi doğru bilinince
belge tarayıcıda çözülür ve indirilir. Tek yanlışta oyun biter, baştan başlanır.

## Güvenlik nasıl sağlanıyor?
- Belge **AES-256-GCM** ile rastgele bir anahtar `K` ile şifrelenir.
- `K`, **Shamir eşik paylaşımıyla** parçalara bölünür; eşik = soru sayısı, yani **tüm
  sorular** gerekir. Her parça, o sorunun doğru cevabından (PBKDF2) türetilen anahtarla
  sarılır. Cevap doğrulaması bu şifre çözmeyle yapılır — sitede **düz cevap yoktur**.
- Sitede **düz belge de yoktur**; yalnızca şifreli veri ve sarılmış parçalar bulunur.
- Açık uçlu sorular (serbest metin) yüksek entropili olduğu için tahmin/deneme-yanılmayı
  ciddi biçimde zorlaştırır. Not: yalnızca çoktan seçmeli olsaydı, şıklar belli olduğu
  için kararlı bir saldırgan deneyebilirdi; açık uçlu sorular bu riski büyük ölçüde kapatır.
  Mutlak güvenlik için cevapların bir sunucuda doğrulanması gerekir.

## Belgeyi veya soruları güncellemek
1. Ham belgeyi `document-source.xlsx` olarak proje köküne koy (git'e girmez).
2. Doğru cevapları `build/answers.local.json` içine yaz (git'e girmez). Her madde:
   `{ "type": "mc"|"open", "accept": ["kabul edilen cevap", ...] }` — sıralama
   `index.html` içindeki `POOL` ile birebir aynı olmalı. Açık uçlu cevaplarda
   yazılan metnin bu ifadeyi **içermesi** yeterlidir; büyük/küçük harf ve Türkçe
   karakter önemsizdir.
3. `node build/encrypt.js` çalıştır — belgeyi şifreleyip `index.html`'e gömer ve
   kendi kendine doğrular.
