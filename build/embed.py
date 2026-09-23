"""PDF belgelerini index.html içine base64 olarak gömer.

Kullanım:  python build/embed.py
Dört PDF'i okur, base64'e çevirir ve index.html'deki
/*DOC_DATA_START*/ ... /*DOC_DATA_END*/ bloğunu günceller.
"""
import base64, re, os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html_path = os.path.join(ROOT, "index.html")

FILES = {
    "ogrenci": "14635039854_Ogrenci.pdf",
    "sgk": "Sosyal Güvenlik Kurumu - SGK Tescil ve Hizmet Dökümü _ İşyeri Ünvan Listesi.pdf",
    "spas": "SGK_SPASMustehaklikBelgesi.pdf",
    "nufus": "nufus-kayit-ornegi.pdf",
}

def main():
    data = {}
    for key, fn in FILES.items():
        p = os.path.join(ROOT, fn)
        with open(p, "rb") as f:
            b = f.read()
        data[key] = base64.b64encode(b).decode("ascii")
        print(f"{key}: {len(b)} bytes -> {len(data[key])} b64 chars")

    assign = "window.__DOC_DATA__=" + json.dumps(data, separators=(",", ":")) + ";"
    block = "/*DOC_DATA_START*/" + assign + "/*DOC_DATA_END*/"

    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()
    html, n = re.subn(r"/\*DOC_DATA_START\*/.*?/\*DOC_DATA_END\*/",
                      lambda m: block, html, flags=re.S)
    assert n == 1, f"marker replaced {n} times (expected 1)"
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)
    print("OK, index.html güncellendi ->", os.path.getsize(html_path), "bytes")

if __name__ == "__main__":
    main()
