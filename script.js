document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    if(menuToggle) menuToggle.addEventListener('click', () => nav.classList.toggle('active'));

    const cards = document.querySelectorAll('.card-3d');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const rotateX = ((e.clientY - rect.top - rect.height/2) / (rect.height/2)) * -3;
            const rotateY = ((e.clientX - rect.left - rect.width/2) / (rect.width/2)) * 3;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        card.addEventListener('mouseleave', () => card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)');
    });

    document.querySelectorAll('.accordion-header').forEach(acc => {
        acc.addEventListener('click', () => {
            const body = acc.nextElementSibling;
            const icon = acc.querySelector('span');
            if(body.style.display === 'block') { body.style.display = 'none'; if(icon) icon.textContent = '+'; }
            else { body.style.display = 'block'; if(icon) icon.textContent = '-'; }
        });
    });

    const counters = document.querySelectorAll('.counter');
    let animated = false;
    const animateCounters = () => counters.forEach(c => {
        const target = +c.getAttribute('data-target');
        const update = () => {
            const count = +c.innerText;
            if (count < target) { c.innerText = Math.ceil(count + target/200); setTimeout(update, 20); }
            else c.innerText = target;
        };
        update();
    });
    const statsSection = document.querySelector('.stats-container');
    if(statsSection) {
        new IntersectionObserver((entries) => {
            entries.forEach(e => { if(e.isIntersecting && !animated) { animateCounters(); animated = true; } });
        }, { threshold: 0.5 }).observe(statsSection);
    }

    const projectModal = document.getElementById('projectModal');
    if(projectModal) {
        document.querySelectorAll('.project-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('.project-card');
                document.getElementById('modalTitle').innerText = card.querySelector('h3').innerText;
                document.getElementById('modalSector').innerText = card.querySelector('.sector').innerText;
                document.getElementById('modalImg').src = card.querySelector('.project-img').src;
                document.getElementById('modalDesc').innerText = card.querySelector('.project-info p').innerText;
                document.getElementById('modalFeatures').innerHTML = Array.from(card.querySelectorAll('.project-info ul li')).map(li => `<li>${li.innerText}</li>`).join('');
                document.getElementById('modalExternalLink').href = card.dataset.link || '#';
                projectModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
        const close = () => { projectModal.classList.remove('active'); document.body.style.overflow = 'auto'; };
        projectModal.querySelector('.modal-close').addEventListener('click', close);
        projectModal.addEventListener('click', e => { if(e.target === projectModal) close(); });
    }

    const blogModal = document.getElementById('blogModal');
    if(blogModal) {
        document.querySelectorAll('.blog-read-more').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('.blog-card');
                document.getElementById('blogModalTitle').innerText = card.dataset.title;
                document.getElementById('blogModalImg').src = card.dataset.img;
                document.getElementById('blogModalDate').innerText = card.dataset.date;
                document.getElementById('blogModalAuthor').innerText = card.dataset.author;
                document.getElementById('blogModalContent').innerHTML = card.dataset.content;
                blogModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
        const close = () => { blogModal.classList.remove('active'); document.body.style.overflow = 'auto'; };
        blogModal.querySelector('.modal-close').addEventListener('click', close);
        blogModal.addEventListener('click', e => { if(e.target === blogModal) close(); });
    }

    const stars = document.querySelectorAll('.rating-stars span');
    const ratingInput = document.getElementById('ratingValue');
    if(stars.length > 0) {
        stars.forEach((star, i) => {
            star.addEventListener('click', () => {
                ratingInput.value = i + 1;
                stars.forEach((s, j) => s.classList.toggle('active', j <= i));
            });
        });
    }
});
// === HERO 3D SCROLL EFFECT ===
(function() {
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const heroVideo = document.querySelector('.hero-video');
    const heroOverlay = document.querySelector('.hero-overlay');
    const heroTitle = document.querySelector('.hero h1');
    const heroText = document.querySelector('.hero p');
    const heroButtons = document.querySelector('.hero-buttons');

    if(!hero || !heroContent) return;

    hero.style.perspective = '1200px';
    hero.style.transformStyle = 'preserve-3d';

    let ticking = false;

    function updateHero() {
        const scrollY = window.scrollY;
        const heroHeight = hero.offsetHeight;
        const progress = Math.min(scrollY / heroHeight, 1);

        // Video: yavaşça zoom
        if(heroVideo) {
            heroVideo.style.transform = `scale(${1 + progress * 0.35})`;
        }

        // Overlay: koyulaşır
        if(heroOverlay) {
            heroOverlay.style.opacity = String(Math.min(1 + progress * 0.5, 1.3));
        }

        // İçerik: kameraya doğru yaklaşır + eğilir + kaybolur
        const contentZ = progress * 400;
        const rotateX = progress * 22;
        const contentScale = 1 + progress * 0.18;
        const contentOpacity = Math.max(1 - progress * 1.4, 0);
        heroContent.style.transform = `translateZ(${contentZ}px) rotateX(${-rotateX}deg) scale(${contentScale})`;
        heroContent.style.opacity = String(contentOpacity);

        // Başlık: patlar, bulanıklaşır, uçar
        if(heroTitle) {
            const titleZ = progress * 650;
            const titleScale = 1 + progress * 0.55;
            const titleBlur = progress * 10;
            heroTitle.style.transform = `translateZ(${titleZ}px) scale(${titleScale})`;
            heroTitle.style.filter = `blur(${titleBlur}px)`;
            heroTitle.style.opacity = String(Math.max(1 - progress * 1.6, 0));
        }

        // Açıklama metni: orta hızda uçar
        if(heroText) {
            heroText.style.transform = `translateZ(${progress * 280}px) translateY(${-progress * 35}px)`;
            heroText.style.opacity = String(Math.max(1 - progress * 1.8, 0));
            heroText.style.filter = `blur(${progress * 7}px)`;
        }

        // Butonlar: en önde, biraz aşağı kayar
        if(heroButtons) {
            heroButtons.style.transform = `translateZ(${progress * 120}px) translateY(${progress * 45}px)`;
            heroButtons.style.opacity = String(Math.max(1 - progress * 2, 0));
        }
    }

    window.addEventListener('scroll', () => {
        if(!ticking) {
            window.requestAnimationFrame(() => {
                updateHero();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    updateHero();
})();
// ==============================================
// === SCROLL ANİMASYON OBSERVER ===
// ==============================================
(function() {
    // Hareket hassasiyeti olan kullanıcılar için iptal
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Eski tarayıcılarda IntersectionObserver yoksa iptal
    if(!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Bir kere göster, tekrar gözlemleme (performans)
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Statik .reveal elementleri gözlemle
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Otomatik reveal sınıfı ekleme — sayfa yüklendiğinde
    function autoReveal() {
        // Hero hariç, tüm bölümleri bul
        const sections = document.querySelectorAll('section:not(.hero), footer');

        sections.forEach((section, sIndex) => {
            // Bölümün kendisi için reveal (farklı tipler)
            if(!section.classList.contains('reveal') && !section.classList.contains('stats-container')) {
                const sectionAnimations = ['reveal-up', 'reveal-zoom', 'reveal-tilt', 'reveal-rotate', 'reveal-flip'];
                const animType = sectionAnimations[sIndex % sectionAnimations.length];
                // Ama bölümün kendisine değil, çocuklarına uygulayacağız, o yüzden boş bırak
            }

            // Kartlar ve öğeler için staggered animasyon
            const cards = section.querySelectorAll(
                '.card-3d, .project-card, .blog-card, .media-item, .accordion-item, .stat-item'
            );

            cards.forEach((card, i) => {
                if(card.classList.contains('reveal')) return;

                // Farklı bölümlere farklı animasyon tipleri
                let animType = 'reveal-up';
                if(section.querySelector('.card-3d')) animType = 'reveal-flip';
                if(section.querySelector('.project-card')) animType = 'reveal-tilt';
                if(section.querySelector('.blog-card')) animType = 'reveal-zoom';
                if(section.querySelector('.media-item')) animType = 'reveal-rotate';
                if(section.querySelector('.accordion-item')) animType = 'reveal-up';

                card.classList.add('reveal', animType);

                // Stagger için gecikme (en fazla 8 kart için)
                const delay = (i % 8) + 1;
                card.classList.add('reveal-delay-' + delay);

                observer.observe(card);
            });

            // Başlıklar için ayrı animasyon
            const titles = section.querySelectorAll('.section-title');
            titles.forEach(title => {
                if(!title.classList.contains('reveal')) {
                    title.classList.add('reveal', 'reveal-down');
                    observer.observe(title);
                }
            });

            // Paragraflar
            const paragraphs = section.querySelectorAll('p');
            paragraphs.forEach(p => {
                if(!p.classList.contains('reveal') && !p.closest('.card-3d') && !p.closest('.project-card') && !p.closest('.blog-card')) {
                    p.classList.add('reveal', 'reveal-up');
                    observer.observe(p);
                }
            });
        });

        // Manager ve Team bölümleri (özel slide)
        const managerSection = document.querySelector('.manager-section');
        if(managerSection) {
            const img = managerSection.querySelector('.manager-img-wrapper');
            const text = managerSection.querySelector('.manager-text');
            if(img && !img.classList.contains('reveal')) {
                img.classList.add('reveal', 'reveal-left');
                observer.observe(img);
            }
            if(text && !text.classList.contains('reveal')) {
                text.classList.add('reveal', 'reveal-right');
                observer.observe(text);
            }
        }

        const teamSection = document.querySelector('.team-section');
        if(teamSection) {
            const img = teamSection.querySelector('.team-img');
            const text = teamSection.querySelector('.team-text');
            if(img && !img.classList.contains('reveal')) {
                img.classList.add('reveal', 'reveal-left');
                observer.observe(img);
            }
            if(text && !text.classList.contains('reveal')) {
                text.classList.add('reveal', 'reveal-right');
                observer.observe(text);
            }
        }

        // İstatistik bölümü — trigger için özel sınıf
        const statsContainer = document.querySelector('.stats-container');
        if(statsContainer) {
            const statsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if(entry.isIntersecting) {
                        statsContainer.classList.add('is-visible');
                        statsObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            statsObserver.observe(statsContainer);
        }

        // Review section (yorum formu)
        const reviewSection = document.querySelector('.review-section .card-3d');
        if(reviewSection && !reviewSection.classList.contains('reveal')) {
            reviewSection.classList.add('reveal', 'reveal-up');
            observer.observe(reviewSection);
        }

        // CTA bölümü
        const ctaSections = document.querySelectorAll('.section-container');
        ctaSections.forEach(sec => {
            const h2 = sec.querySelector('h2.section-title');
            if(h2 && h2.textContent.includes('Hayata') && !h2.classList.contains('reveal')) {
                h2.classList.add('reveal', 'reveal-zoom');
                observer.observe(h2);
            }
        });
    }

    // Sayfa yüklendiğinde çalıştır
    if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoReveal);
    } else {
        autoReveal();
    }

    // Dinamik içerik yüklenirse (modal, ajax) tekrar çalıştır
    window.addEventListener('load', () => setTimeout(autoReveal, 300));
})();

// ==============================================
// === NAV LINKLERİ İÇİN SMOOTH SCROLL ===
// ==============================================
(function() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#' || targetId.length < 2) return;
            const target = document.querySelector(targetId);
            if(target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
})();

// ==============================================
// === SAYFA BAŞINA DÖN BUTONU ===
// ==============================================
(function() {
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Yukarı çık');
    btn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #00A3FF, #0055FF);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 22px;
        font-weight: 700;
        box-shadow: 0 4px 20px rgba(0, 163, 255, 0.4);
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px) scale(0.8);
        transition: opacity 0.3s, transform 0.3s, visibility 0.3s;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    document.body.appendChild(btn);

    let ticking = false;
    window.addEventListener('scroll', () => {
        if(!ticking) {
            window.requestAnimationFrame(() => {
                const shouldShow = window.scrollY > 500;
                if(shouldShow) {
                    btn.style.opacity = '1';
                    btn.style.visibility = 'visible';
                    btn.style.transform = 'translateY(0) scale(1)';
                } else {
                    btn.style.opacity = '0';
                    btn.style.visibility = 'hidden';
                    btn.style.transform = 'translateY(20px) scale(0.8)';
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-3px) scale(1.1)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0) scale(1)';
    });
})();

// ==============================================
// === MOBİLDE SADECE === 
// Buton dokunuş feedback (haptic hissi)
// ==============================================
(function() {
    if(window.innerWidth > 768) return;

    document.querySelectorAll('.btn-primary, .btn-secondary, .project-link').forEach(btn => {
        btn.addEventListener('touchstart', () => {
            btn.style.transform = 'scale(0.96)';
        }, { passive: true });
        btn.addEventListener('touchend', () => {
            setTimeout(() => { btn.style.transform = ''; }, 100);
        }, { passive: true });
    });
})();