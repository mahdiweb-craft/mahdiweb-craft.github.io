import os
import feedparser
import requests
from datetime import datetime
import re
import sys

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

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    prompt = f"""
    Sen WebFlux adında profesyonel bir web tasarım ajansının uzman yazarısın.
    Aşağıda bugünün web tasarım, e-ticaret ve teknoloji haberleri var.
    
    HABERLER:
    {news_data}
    
    Görevin: Bu haberlerden ilham alarak, tamamen özgün, akıcı ve profesyonel bir blog yazısı yaz.
    Yazı en az 600 kelime olmalı. İşletmelerin bu gelişmelerden nasıl faydalanabileceğine dair stratejik yorumlar ekle.
    
    Çıktıyı SADECE şu formatta ver, başka hiçbir şey yazma:
    TITLE: [Başlık]
    CONTENT: [HTML formatında paragraflar ve listeler içeren içerik]
    IMAGE_QUERY: [Görsel arama terimi, örn: web design]
    """

    data = {"contents": [{"parts": [{"text": prompt}]}]}
    
    try:
        response = requests.post(url, json=data)
        response_data = response.json()
        
        if "candidates" not in response_data:
            print("Gemini API Hatası Döndürdü:", response_data)
            sys.exit(1)
            
        result = response_data["candidates"][0]["content"]["parts"][0]["text"]
        
        title_match = re.search(r"TITLE:\s*(.*)", result)
        content_match = re.search(r"CONTENT:\s*(.*?)(?=IMAGE_QUERY:|$)", result, re.DOTALL)
        image_match = re.search(r"IMAGE_QUERY:\s*(.*)", result)

        if title_match and content_match and image_match:
            return {
                "title": title_match.group(1).strip(),
                "content": content_match.group(1).strip(),
                "image_query": image_match.group(1).strip(),
                "date": datetime.now().strftime("%d.%m.%Y")
            }
        else:
            print("HATA: Yapay zeka istenen formatta yanıt vermedi. Gelen yanıt:")
            print(result)
            sys.exit(1)
            
    except Exception as e:
        print(f"İstek Hatası: {e}")
        sys.exit(1)
    return None

def add_to_blog_html(post):
    file_path = "blog.html"
    if not os.path.exists(file_path):
        print(f"HATA: {file_path} bulunamadı!")
        sys.exit(1)
        
    with open(file_path, "r", encoding="utf-8") as f:
        html = f.read()

    # Sabit bir yedek görsel
    image_url = f"https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"

    new_card = f'''
    <div class="blog-card card-3d" data-title="{post['title']}" data-img="{image_url}" data-date="{post['date']}" data-author="WebFlux Ekibi" data-content="<h3>{post['title']}</h3>{post['content']}">
        <img src="{image_url}" alt="{post['title']}" style="width:100%;height:200px;object-fit:cover;border-radius:12px;margin-bottom:20px">
        <h3>{post['title']}</h3>
        <p style="color:var(--text-muted);margin-bottom:15px">Web tasarım ve dijital dünyadaki en güncel gelişmeler.</p>
        <button class="project-link blog-read-more">Devamını Oku →</button>
    </div>
    '''

    marker = '<div class="grid-3">'
    if marker in html:
        html = html.replace(marker, marker + new_card, 1)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html)
        print("✅ BAŞARILI: Yeni blog yazısı siteye eklendi.")
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