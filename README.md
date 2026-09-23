# Belge Hazinesi 🗝️

Ailenize özel, Apple tarzı tasarımlı küçük bir bilmece oyunu. Havuzdaki sorulardan
rastgele **6 tanesi** gelir; hepsini doğru bilen kişi ödül olarak belgeleri indirir.
Tek yanlışta oyun biter ve baştan başlanır. Açık/koyu mod destekli.

## Nasıl çalışır?
`index.html` dosyasını tarayıcıda aç (çift tıkla). Oyunu kazanınca aynı klasördeki
PDF belgeler indirilebilir hale gelir.

## ⚠️ Gizlilik notu
Belgeler (**öğrenci belgesi, SGK tescil/hizmet dökümü, SPAS, vukuatlı nüfus kayıt
örneği**) kimlik ve sağlık verisi içerdiği için **bilerek bu repoya dahil edilmedi**
(`.gitignore` ile hariç tutuldu). Site senin bilgisayarında çalışır çünkü PDF'ler
klasörde durur; git yalnızca onları takip etmez.

Oyunun indirme butonlarının çalışması için şu dosyaların `index.html` ile **aynı
klasörde** bulunması gerekir:

- `14635039854_Ogrenci.pdf`
- `Sosyal Güvenlik Kurumu - SGK Tescil ve Hizmet Dökümü _ İşyeri Ünvan Listesi.pdf`
- `SGK_SPASMustehaklikBelgesi.pdf`
- `nufus-kayit-ornegi.pdf`
