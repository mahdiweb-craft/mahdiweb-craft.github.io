import re
from datetime import datetime
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

def generate_feeds():
    blog_path = Path("blog.html")
    if not blog_path.exists():
        print("HATA: blog.html bulunamadı.")
        return

    content = blog_path.read_text(encoding="utf-8")
    pattern = re.compile(r'data-title="([^"]+)".*?data-date="([^"]+)"', re.DOTALL)
    matches = pattern.findall(content)

    posts = []
    for title, date_str in matches:
        try:
            date_obj = datetime.strptime(date_str, "%d.%m.%Y")
            posts.append({"title": title, "date": date_obj})
        except ValueError:
            continue
    posts.sort(key=lambda x: x["date"], reverse=True)

    # --- SITEMAP.XML ---
    urlset = Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    pages = ["", "hizmetler.html", "projeler.html", "hakkimizda.html",
             "blog.html", "iletisim.html", "sss.html", "kvkk.html"]
    for page in pages:
        url = SubElement(urlset, "url")
        SubElement(url, "loc").text = f"https://webflux.com.tr/{page}"
        SubElement(url, "lastmod").text = datetime.now().strftime("%Y-%m-%d")
        SubElement(url, "changefreq").text = "weekly" if page == "blog.html" else "monthly"

    sitemap_xml = minidom.parseString(tostring(urlset)).toprettyxml(indent="  ")
    Path("sitemap.xml").write_text(sitemap_xml, encoding="utf-8")
    print("✅ sitemap.xml güncellendi.")

    # --- RSS FEED ---
    rss = Element("rss", version="2.0")
    channel = SubElement(rss, "channel")
    SubElement(channel, "title").text = "WebFlux Blog"
    SubElement(channel, "link").text = "https://webflux.com.tr/blog.html"
    SubElement(channel, "description").text = "Web tasarım, SEO ve dijital pazarlama hakkında güncel yazılar."
    SubElement(channel, "language").text = "tr"

    for post in posts[:20]:
        item = SubElement(channel, "item")
        SubElement(item, "title").text = post["title"]
        SubElement(item, "link").text = "https://webflux.com.tr/blog.html"
        SubElement(item, "pubDate").text = post["date"].strftime("%a, %d %b %Y %H:%M:%S +0300")
        SubElement(item, "guid").text = f"https://webflux.com.tr/blog.html#{post['date'].strftime('%Y%m%d')}"

    rss_xml = minidom.parseString(tostring(rss)).toprettyxml(indent="  ")
    Path("feed.xml").write_text(rss_xml, encoding="utf-8")
    print(f"✅ feed.xml oluşturuldu ({len(posts[:20])} yazı ile).")

if __name__ == "__main__":
    generate_feeds()