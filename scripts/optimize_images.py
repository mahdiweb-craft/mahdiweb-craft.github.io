from pathlib import Path
from PIL import Image

def optimize_images():
    img_dir = Path("images")
    if not img_dir.exists():
        print("UYARI: images/ klasörü yok, işlem atlandı.")
        return

    # Hem eski hem yeni Pillow sürümleriyle uyumlu
    try:
        resample_filter = Image.Resampling.LANCZOS
    except AttributeError:
        resample_filter = Image.LANCZOS

    for file_path in img_dir.glob("*"):
        if file_path.suffix.lower() in ['.jpg', '.jpeg', '.png']:
            try:
                with Image.open(file_path) as img:
                    if img.width > 1200:
                        ratio = 1200 / img.width
                        new_height = int(img.height * ratio)
                        img = img.resize((1200, new_height), resample_filter)

                    webp_path = file_path.with_suffix('.webp')
                    img.save(webp_path, format='WEBP', quality=80)
                    print(f"✅ Optimize edildi: {webp_path.name}")
                    # Orijinali silmek istersen aşağıdaki satırı aç:
                    # file_path.unlink()
            except Exception as e:
                print(f"❌ Hata: {file_path.name} -> {e}")

if __name__ == "__main__":
    optimize_images()