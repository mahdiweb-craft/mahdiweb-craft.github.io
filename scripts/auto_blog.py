import os
import feedparser
import requests
from datetime import datetime
import re
import sys
import json
import random

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

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={api_key}"
    
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
    
    try:
        response = requests.post(url, json=data)
        response_data = response.json()
        
        if "candidates" not in response_data:
            print("Gemini API Hatası Döndürdü:", response_data)
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
            
    except Exception as e:
        print(f"İstek Hatası: {e}")
        sys.exit(1)
    return None

def notify_indexnow(url):
    """Bing, Yandex ve diğerlerine yeni URL'yi bildirir."""
    # BURAYA KENDİ INDEXNOW ANAHTARINI YAZ (örn: a1b2c3d4e5f6...)
    api_key = "d8b10f2231f84e2b830824e11230e2f6" 
    
    if api_key == "d8b10f2231f84e2b830824e11230e2f6":
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
            print(f"⚠️ IndexNow hatası: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ IndexNow bağlantı hatası: {e}")

def add_to_blog_html(post):
    file_path = "blog.html"
    if not os.path.exists(file_path):
        print(f"HATA: {file_path} bulunamadı!")
        sys.exit(1)
        
    with open(file_path, "r", encoding="utf-8") as f:
        html = f.read()

    query = post['image_query'].replace(' ', ',')
    random_id = random.randint(1, 999999)
    image_url = f"https://loremflickr.com/800/400/{query}?lock={random_id}"

    # Yeni data-description özelliği eklendi
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
        print(f"✅ BAŞARILI: Yeni blog yazısı ve özgün görsel eklendi. (Görsel Kaynağı: {query})")
        
        # Blog eklendikten sonra IndexNow'a bildir
        notify_indexnow("https://webflux.com.tr/blog.html")
    else:
        print("HATA: blog.html içinde '<div class=\"grid-3\">' etiketi bulunamadı!")
        sys.exit(1)

if __name__ == "__main__":
    print("Haberler toplanıyor...")
    news = get_latest_news()
    
    print("Yapay zeka yazıyor...")
    post = generate_unique_blog(news)
    
    if post:
        add_to_blog_html(post)