# Belge Hazinesi 🗝️

Ailenize özel, Apple tarzı tasarımlı küçük bir bilmece oyunu. Havuzdaki sorulardan
rastgele **6 tanesi** gelir (aynı soru bir turda iki kez sorulmaz); hepsini doğru
bilen kişi ödül olarak belgeleri indirir. Tek yanlışta oyun biter ve baştan başlanır.
Açık/koyu mod destekli.

## Nasıl çalışır?
`index.html` dosyasını herhangi bir tarayıcıda aç (çift tıkla — sunucu gerekmez).
Belgeler dosyanın **içine gömülü** olduğu için oyunu kazanınca dört belge de doğrudan
inilebilir. Tek dosya kendi kendine yeter; başka bir bilgisayarda da çalışır.

## ⚠️ Gizlilik notu
Bu depo **öğrenci belgesi, SGK tescil/hizmet dökümü, SPAS ve vukuatlı nüfus kayıt
örneği** belgelerini `index.html` içine gömülü (base64) olarak barındırır. Bunlar
kimlik ve sağlık verisi içerir; depoya erişebilen herkes bu belgeleri çıkarabilir.
Depoyu paylaşırken bunu göz önünde bulundurun; gerekiyorsa GitHub'da
**Settings → Change visibility → Private** ile depoyu özel yapın.

## Belgeleri güncellemek
Yeni PDF'leri klasöre koyup `build/embed.py` betiğini çalıştırın; betik dört PDF'i
tekrar base64'e çevirip `index.html` içindeki veri bloğunu günceller.
