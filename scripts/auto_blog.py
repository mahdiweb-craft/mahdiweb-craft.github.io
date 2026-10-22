import os
import feedparser
import requests
from datetime import datetime
import re
import sys
import json
import random
import time

def get_latest_news():
    feeds = [
        "https://webrazzi.com/feed/",
        "https://www.shiftdelete.net/feed/"
    ]
    news_text = ""
    for url in feeds:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:3]:
                summary = re.sub('<[^<]+?>', '', entry.get('summary', ''))
                news_text += f"- {entry.title}: {summary}\n"
        except Exception as e:
            print(f"Haber çekme hatası: {e}")
    return news_text

def generate_unique_blog(news_data):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("HATA: API Anahtarı bulunamadı!")
        sys.exit(1)

    # MODEL ADI GÜNCEL SÜRÜMLE DEĞİŞTİRİLDİ
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    prompt = f"""
    Sen WebFlux adında profesyonel bir web tasarım ajansının uzman yazarısın.
    Aşağıda bugünün web tasarım, e-ticaret ve teknoloji haberleri var.
    
    HABERLER:
    {news_data}
    
    Görevin: Bu haberlerden ilham alarak, tamamen özgün, akıcı ve profesyonel bir blog yazısı yaz.
    İşletmelerin bu gelişmelerden nasıl faydalanabileceğine dair stratejik yorumlar ekle.
    
    Sadece ve sadece aşağıdaki formatta geçerli bir JSON objesi döndür. Başka hiçbir metin yazma, markdown kullanma:
    {{
      "title": "Blog Başlığı",
      "description": "Bu blog yazısı için 150-160 karakter arası, SEO uyumlu, dikkat çekici bir meta açıklama.",
      "content": "<p>HTML paragraf</p><h3>Alt Başlık</h3><p>Devamı...</p>",
      "image_query": "web design"
    }}
    """

    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"}
    }
    
    max_retries = 3
    retry_delays = [15, 30, 60] 

    for attempt in range(max_retries):
        try:
            print(f"Yapay zeka yazıyor... (Deneme {attempt + 1}/{max_retries})")
            response = requests.post(url, json=data)
            response_data = response.json()
            
            if "error" in response_data:
                error_code = response_data["error"].get("code")
                if error_code in [503, 429] and attempt < max_retries - 1:
                    wait_time = retry_delays[attempt]
                    print(f"⚠️ Gemini API şu an yanıt veremiyor (Hata {error_code}). {wait_time} saniye sonra tekrar denenecek...")
                    time.sleep(wait_time)
                    continue 
                else:
                    print(f"❌ Gemini API Hatası: {response_data}")
                    sys.exit(1)
            
            if "candidates" not in response_data:
                print("Beklenmeyen API Yanıtı:", response_data)
                sys.exit(1)
                
            result_text = response_data["candidates"][0]["content"]["parts"][0]["text"]
            
            try:
                post_data = json.loads(result_text)
                return {
                    "title": post_data.get("title", "Güncel Web Tasarım Haberleri"),
                    "description": post_data.get("description", "Web tasarım ve dijital dünyadaki en güncel gelişmeler."),
                    "content": post_data.get("content", "<p>İçerik yüklenemedi.</p>"),
                    "image_query": post_data.get("image_query", "technology"),
                    "date": datetime.now().strftime("%d.%m.%Y")
                }
            except json.JSONDecodeError:
                print("HATA: Yapay zeka geçerli bir JSON döndürmedi. Gelen yanıt:")
                print(result_text)
                sys.exit(1)
                
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                print(f"⚠️ Bağlantı hatası: {e}. Tekrar denenecek...")
                time.sleep(retry_delays[attempt])
                continue
            else:
                print(f"❌ İstek Hatası: {e}")
                sys.exit(1)
                
    return None

def notify_indexnow(url):
    api_key = "BURAYA_INDEXNOW_ANAHTARINIZI_YAZIN" 
    if api_key == "BURAYA_INDEXNOW_ANAHTARINIZI_YAZIN":
        print("⚠️ IndexNow anahtarı girilmedi, bildirim atlandı.")
        return

    key_location = f"https://webflux.com.tr/{api_key}.txt"
    payload = {
        "host": "webflux.com.tr",
        "key": api_key,
        "keyLocation": key_location,
        "urlList": [url]
    }
    try:
        response = requests.post("https://api.indexnow.org/indexnow", json=payload)
        if response.status_code == 200:
            print(f"✅ IndexNow bildirimi başarılı: {url}")
        else:
            print(f"⚠️ IndexNow hatası: {response.status_code}")
    except Exception as e:
        print(f"❌ IndexNow bağlantı hatası: {e}")

def add_to_blog_html(post):
    file_path = "blog.html"
    if not os.path.exists(file_path):
        print(f"HATA: {file_path} bulunamadı!")
        sys.exit(1)
        
    with open(file_path, "r", encoding="utf-8") as f:
        html = f.read()

    IMAGE_POOL = [
        "photo-1620712943543-bcc4688e7485", "photo-1512941937669-90a1b58e7e9c",
        "photo-1550751827-4bd374c3f58b", "photo-1451187580459-43490279c0fa",
        "photo-1518770660439-4636190af475", "photo-1526374965328-7f61d4dc18c5",
        "photo-1551288049-bebda4e38f71", "photo-1551434678-e076c223a692",
        "photo-1498050108023-c5249f4df085", "photo-1517180102446-f3ece451e9d8",
        "photo-1516321318423-f06f85e504b3", "photo-1522542550221-31fd19575a2d",
        "photo-1559028012-481c04fa702d", "photo-1551650975-87deedd944c3",
        "photo-1517245386807-bb43f82c33c4", "photo-1587620962725-abab7fe55159",
        "photo-1467232031835-1c6d5c5b1c9e", "photo-1504384308090-c894fdcc538d",
        "photo-1497366216548-37526070297c", "photo-1558494949-ef010cbdcc31",
        "photo-1544197150-b99a580bb7a8", "photo-1507238691740-187a5b1d37b8",
        "photo-1462826303086-329426d1aef5"
    ]
    img_id = random.choice(IMAGE_POOL)
    image_url = f"https://images.unsplash.com/{img_id}?q=80&w=800&auto=format&fit=crop"

    new_card = f'''
    <div class="blog-card card-3d" data-title="{post['title']}" data-description="{post['description']}" data-img="{image_url}" data-date="{post['date']}" data-author="WebFlux Ekibi" data-content="<h3>{post['title']}</h3>{post['content']}">
        <img src="{image_url}" alt="{post['title']}" style="width:100%;height:200px;object-fit:cover;border-radius:12px;margin-bottom:20px" loading="lazy">
        <h3>{post['title']}</h3>
        <p style="color:var(--text-muted);margin-bottom:15px">{post['description']}</p>
        <button class="project-link blog-read-more">Devamını Oku →</button>
    </div>
    '''

    marker = '<div class="grid-3">'
    if marker in html:
        html = html.replace(marker, marker + new_card, 1)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"✅ BAŞARILI: Yeni blog yazısı ve garantili görsel eklendi.")
        
        notify_indexnow("https://webflux.com.tr/blog.html")
    else:
        print("HATA: blog.html içinde '<div class=\"grid-3\">' etiketi bulunamadı!")
        sys.exit(1)

if __name__ == "__main__":
    print("Haberler toplanıyor...")
    news = get_latest_news()
    
    post = generate_unique_blog(news)
    
    if post:
        add_to_blog_html(post)