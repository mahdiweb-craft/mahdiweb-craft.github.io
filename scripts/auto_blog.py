import os
import feedparser
import requests
from datetime import datetime
import re

def get_latest_news():
    feeds = [
        "https://webrazzi.com/feed/",
        "https://www.shiftdelete.net/feed/",
        "https://news.google.com/rss/search?q=web+tasar%C4%B1m+seo+e-ticaret&hl=tr&gl=TR&ceid=TR:tr"
    ]
    news_text = ""
    for url in feeds:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:3]:
                summary = re.sub('<[^<]+?>', '', entry.get('summary', ''))
                news_text += f"- {entry.title}: {summary}\n"
        except Exception:
            pass
    return news_text

def generate_unique_blog(news_data):
    api_key = os.environ.get("GEMINI_API_KEY")
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
        result = response.json()["candidates"][0]["content"]["parts"][0]["text"]
        
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
    except Exception as e:
        print(f"Hata: {e}")
    return None

def add_to_blog_html(post):
    if not os.path.exists("blog.html"): return
    with open("blog.html", "r", encoding="utf-8") as f:
        html = f.read()

    image_url = f"https://source.unsplash.com/800x400/?{post['image_query'].replace(' ', ',')}"

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
        with open("blog.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("Blog eklendi.")

if __name__ == "__main__":
    news = get_latest_news()
    post = generate_unique_blog(news)
    if post:
        add_to_blog_html(post)