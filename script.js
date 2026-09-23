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