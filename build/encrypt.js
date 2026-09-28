/**
 * Belgeyi cevaplardan üretilen anahtarla şifreler ve index.html'e gömer.
 *
 * - Belge AES-256-GCM ile rastgele bir anahtar K ile şifrelenir.
 * - K, Shamir eşik paylaşımı ile N parçaya bölünür; EŞİK = N (tüm sorular gerekli).
 * - Her parça, o sorunun kabul edilen cevap(lar)ından türetilen anahtar(lar)la sarılır.
 *   (Bir soru birden çok doğru cevabı kabul edebilir; her biri aynı parçayı açar.)
 * - Sonuç: index.html içinde düz belge YOK, düz cevap YOK. Tüm sorular doğru → K → belge.
 *
 * Cevaplar build/answers.local.json içindedir (git'e girmez).
 * Kullanım: node build/encrypt.js  ["kaynak.xlsx"]
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.dirname(__dirname);
const HTML = path.join(ROOT, "index.html");
const ANSWERS = path.join(ROOT, "build", "answers.local.json");
// Kaynak: yerel kopya (G: kaldırılınca da çalışsın). İndirme adı orijinal isim.
const DEFAULT_SRC = path.join(ROOT, "document-source.xlsx");
const SRC = process.argv[2] || DEFAULT_SRC;
const DOWNLOAD_NAME = "GaziOyun_DersRaporu_Mezensefalon_8oyun_2026-09-25.xlsx";

const ITER = 200000;
const MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/* ---- Türkçe-duyarlı, yerelden bağımsız normalize (tarayıcıyla birebir aynı) ---- */
function norm(s){
  return (s||"")
    .replace(/İ/g,"i").replace(/I/g,"i").replace(/ı/g,"i")
    .replace(/Ş/g,"s").replace(/ş/g,"s")
    .replace(/Ç/g,"c").replace(/ç/g,"c")
    .replace(/Ğ/g,"g").replace(/ğ/g,"g")
    .replace(/Ü/g,"u").replace(/ü/g,"u")
    .replace(/Ö/g,"o").replace(/ö/g,"o")
    .toLowerCase().replace(/[^a-z0-9]/g,"");
}

/* ---- GF(256) (AES alanı, 0x11b) ---- */
const EXP = new Uint8Array(256), LOG = new Uint8Array(256);
(function(){ let a=1; for(let i=0;i<255;i++){ EXP[i]=a; LOG[a]=i;
  let aa=a, bb=3, pp=0;
  for(let k=0;k<8;k++){ if(bb&1)pp^=aa; const hi=aa&0x80; aa=(aa<<1)&0xff; if(hi)aa^=0x1b; bb>>=1; }
  a=pp;
} EXP[255]=EXP[0]; })();
const gmul=(a,b)=> (a===0||b===0)?0:EXP[(LOG[a]+LOG[b])%255];
const ginv=(a)=> EXP[(255-LOG[a])%255];
function gfeval(coeffs, x){ let r=0, xp=1; for(let k=0;k<coeffs.length;k++){ r^=gmul(coeffs[k],xp); xp=gmul(xp,x); } return r; }
function gfcombine(points){
  const len=points[0].y.length, out=new Uint8Array(len);
  for(let bp=0;bp<len;bp++){ let secret=0;
    for(let j=0;j<points.length;j++){ let num=1,den=1;
      for(let m=0;m<points.length;m++){ if(m===j)continue;
        num=gmul(num, points[m].x); den=gmul(den, points[j].x ^ points[m].x); }
      secret ^= gmul(points[j].y[bp], gmul(num, ginv(den)));
    } out[bp]=secret;
  } return out;
}

function wrap(shareBuf, answerStr){
  const salt = crypto.randomBytes(16);
  const W = crypto.pbkdf2Sync(Buffer.from(norm(answerStr),"utf8"), salt, ITER, 32, "sha256");
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", W, iv);
  const ct = Buffer.concat([c.update(shareBuf), c.final(), c.getAuthTag()]);
  return { salt:salt.toString("base64"), iv:iv.toString("base64"), ct:ct.toString("base64") };
}

function main(){
  const raw = JSON.parse(fs.readFileSync(ANSWERS, "utf8"));
  const answers = raw.map(a => Array.isArray(a) ? {accept:a} : a);
  const N = answers.length, T = N; // EŞİK = tüm sorular
  answers.forEach((a,i)=>{ if(!a.accept || !a.accept.length) throw new Error(`soru ${i}: accept boş`); });

  const doc = fs.readFileSync(SRC);
  const fileName = DOWNLOAD_NAME;
  console.log(`Kaynak: ${SRC} (${doc.length} bytes) · ${N} soru · eşik ${T}`);

  // 1) belgeyi K ile şifrele
  const K = crypto.randomBytes(32);
  const fileIv = crypto.randomBytes(12);
  const fc = crypto.createCipheriv("aes-256-gcm", K, fileIv);
  const fileCt = Buffer.concat([fc.update(doc), fc.final(), fc.getAuthTag()]);

  // 2) K'yı Shamir ile böl (eşik T = N -> tüm parçalar gerekli)
  const shareBytes = Array.from({length:N}, ()=>Buffer.alloc(32));
  for(let b=0;b<32;b++){
    const coeffs=[K[b], ...crypto.randomBytes(T-1)];
    for(let i=0;i<N;i++) shareBytes[i][b]=gfeval(coeffs, i+1);
  }

  // 3) her parçayı, o sorunun her kabul cevabıyla ayrı ayrı sar
  const shares = answers.map((a,i)=>({
    x: i+1,
    w: a.accept.map(ans => wrap(shareBytes[i], ans)),
  }));

  const SECURE = {
    v:2, kdfIter:ITER, mime:MIME, fileName,
    file:{ iv:fileIv.toString("base64"), ct:fileCt.toString("base64") },
    shares,
  };

  // 4) index.html'e göm
  let html = fs.readFileSync(HTML, "utf8");
  const block = "/*SECURE_START*/window.__SECURE__=" + JSON.stringify(SECURE) + ";/*SECURE_END*/";
  const nrep = (html.match(/\/\*SECURE_START\*\/[\s\S]*?\/\*SECURE_END\*\//g)||[]).length;
  if(nrep!==1) throw new Error(`SECURE işaretçisi ${nrep} kez bulundu (1 olmalı)`);
  html = html.replace(/\/\*SECURE_START\*\/[\s\S]*?\/\*SECURE_END\*\//, ()=>block);
  fs.writeFileSync(HTML, html);

  // 5) kendi kendine doğrulama: tüm N parça -> K -> belge çöz
  const pts = shareBytes.map((s,i)=>({ x:i+1, y:new Uint8Array(s) }));
  const K2 = Buffer.from(gfcombine(pts));
  if(!K2.equals(K)) throw new Error("Shamir doğrulaması başarısız (K != K2)");
  const d=crypto.createDecipheriv("aes-256-gcm", K2, fileIv);
  d.setAuthTag(fileCt.slice(fileCt.length-16));
  const dec = Buffer.concat([d.update(fileCt.slice(0,fileCt.length-16)), d.final()]);
  if(!dec.equals(doc)) throw new Error("Belge çözme doğrulaması başarısız");

  console.log(`OK ✓  belge şifrelendi, ${N} parça (${ITER} PBKDF2 iter)`);
  console.log(`Doğrulama: ${N} parça ile belge çözüldü (${dec.length} bytes, imza ${dec.slice(0,2)})`);
  console.log(`index.html -> ${fs.statSync(HTML).size} bytes`);
}

main();
