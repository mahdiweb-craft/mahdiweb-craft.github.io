
/* WEBFLUX / interactions — no external dependencies */
document.addEventListener('DOMContentLoaded',()=>{
 const q=(s,el=document)=>el.querySelector(s), qa=(s,el=document)=>Array.from(el.querySelectorAll(s));
 // Preserve existing image URLs; use local artwork when a remote image fails.
 document.addEventListener('error',e=>{const img=e.target;if(img instanceof HTMLImageElement&&img.closest('main,.modal')&&!img.dataset.localFallback){if(img.getAttribute('onerror')&&img.onerror)return;img.dataset.localFallback='1';img.src='images/image-fallback.svg'}},true);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const translationsUI={
 tr:{search:'Blog yazılarında ara…',all:'Tümü',more:'Daha fazla yazı',none:'Aramanıza uygun sonuç bulunamadı.',close:'Kapat',count:'sonuç',top:'Yukarı çık'},
 en:{search:'Search articles…',all:'All',more:'Load more articles',none:'No matching results.',close:'Close',count:'results',top:'Back to top'},
 fa:{search:'جستجوی مقالات…',all:'همه',more:'مقالات بیشتر',none:'نتیجه‌ای یافت نشد.',close:'بستن',count:'نتیجه',top:'بازگشت به بالا'},
 ar:{search:'ابحث في المقالات…',all:'الكل',more:'عرض المزيد',none:'لا توجد نتائج مطابقة.',close:'إغلاق',count:'نتائج',top:'العودة للأعلى'},
 ru:{search:'Поиск статей…',all:'Все',more:'Показать ещё',none:'Ничего не найдено.',close:'Закрыть',count:'результатов',top:'Наверх'}
 };
 const ui=()=>translationsUI[document.documentElement.lang]||translationsUI.tr;
 const nav=q('nav'),toggle=q('.menu-toggle');
 const closeNav=()=>{nav?.classList.remove('active');toggle?.setAttribute('aria-expanded','false')};
 toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('active');toggle.setAttribute('aria-expanded',String(open))});
 qa('nav a').forEach(a=>a.addEventListener('click',closeNav));
 document.addEventListener('click',e=>{if(!e.target.closest('header'))closeNav()});
 matchMedia('(min-width:791px)').addEventListener('change',closeNav);
 const langToggle=q('#langToggle'),langDropdown=q('#langDropdown');
 if(langToggle&&langDropdown)new MutationObserver(()=>langToggle.setAttribute('aria-expanded',String(langDropdown.classList.contains('active')))).observe(langDropdown,{attributes:true,attributeFilter:['class']});
 // Native accordion buttons with proper state.
 qa('.accordion-header').forEach((button,i)=>{
   const body=button.nextElementSibling;if(!body)return;
   button.id=button.id||`faq-button-${i}`;body.id=body.id||`faq-answer-${i}`;
   body.hidden=true;button.setAttribute('aria-controls',body.id);
   body.setAttribute('aria-labelledby',button.id);body.setAttribute('role','region');
   button.addEventListener('click',()=>{const opening=body.hidden;body.hidden=!opening;button.setAttribute('aria-expanded',String(opening));const span=q('span',button);if(span)span.textContent=opening?'−':'+'});
 });
 // Shared accessible dialog for service, project, and gallery details.
 let modal=q('#infoModal');
 if(!modal){modal=document.createElement('div');modal.className='modal';modal.id='infoModal';modal.innerHTML='<div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="infoModalTitle" tabindex="-1"><button class="modal-close" type="button">×</button><h2 id="infoModalTitle"></h2><img id="infoModalImg" alt="" hidden><div class="blog-content-text" id="infoModalDesc"></div><a class="btn-primary" id="infoModalLink" target="_blank" rel="noopener noreferrer" hidden>↗</a></div>';document.body.append(modal)}
 let active=null,previous=null;
 const focusables=el=>qa('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex="0"]',el).filter(x=>!x.hidden&&x.getClientRects().length);
 function openDialog(el,trigger){
   if(active)closeDialog(false);previous=trigger||document.activeElement;active=el;
   el.classList.add('active');el.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
   const panel=q('.modal-content',el);panel?.setAttribute('role','dialog');panel?.setAttribute('aria-modal','true');panel?.setAttribute('tabindex','-1');
   if(panel){const heading=q('h2',panel);if(heading){heading.id=heading.id||'dialog-title';panel.setAttribute('aria-labelledby',heading.id)}}
   const close=q('.modal-close',el);if(close){close.setAttribute('aria-label',ui().close);close.focus()}else panel?.focus();
 }
 function closeDialog(restore=true){if(!active)return;active.classList.remove('active');active.setAttribute('aria-hidden','true');document.body.style.overflow='';active=null;if(restore)previous?.focus()}
 qa('.modal').forEach(el=>{el.setAttribute('aria-hidden','true');q('.modal-close',el)?.addEventListener('click',()=>closeDialog());el.addEventListener('click',e=>{if(e.target===el)closeDialog()})});
 document.addEventListener('keydown',e=>{
   if(e.key==='Escape'){if(active){closeDialog();return}closeNav();langDropdown?.classList.remove('active')}
   if(e.key==='Tab'&&active){const f=focusables(active);if(!f.length){e.preventDefault();return}if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===f.at(-1)){e.preventDefault();f[0].focus()}}
 });
 // Parse article markup in a detached document and allow content tags only.
 function safeContent(node,markup){
   const parsed=new DOMParser().parseFromString(markup||'','text/html');
   const allowed=new Set(['P','H2','H3','H4','H5','UL','OL','LI','STRONG','B','EM','I','BR','BLOCKQUOTE','CODE','PRE','A','HR']);
   function convert(src){if(src.nodeType===3)return document.createTextNode(src.textContent);if(src.nodeType!==1||['SCRIPT','STYLE','IFRAME','OBJECT','SVG'].includes(src.tagName))return document.createDocumentFragment();const out=allowed.has(src.tagName)?document.createElement(src.tagName.toLowerCase()):document.createDocumentFragment();if(src.tagName==='A'){try{const u=new URL(src.getAttribute('href'),location.href);if(['http:','https:','mailto:'].includes(u.protocol)){out.href=u.href;out.target='_blank';out.rel='noopener noreferrer'}}catch{}}for(const child of src.childNodes)out.append(convert(child));return out}
   node.replaceChildren(...Array.from(parsed.body.childNodes,convert));
 }
 function info(title,description,src,trigger,link){
   q('#infoModalTitle').textContent=title;const image=q('#infoModalImg');image.hidden=!src;if(src)image.src=src;image.alt=title;
   safeContent(q('#infoModalDesc'),description);const action=q('#infoModalLink');action.hidden=!link;if(link){action.href=link;action.textContent=(document.documentElement.lang==='tr'?'Siteyi ziyaret et':'Visit website')+' ↗'}openDialog(modal,trigger);
 }
 qa('.card-3d[data-info-title],.media-item[data-gallery-title]').forEach(card=>{
   card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-haspopup','dialog');
   const show=()=>info(card.dataset.infoTitle||card.dataset.galleryTitle,card.dataset.infoDesc||card.dataset.galleryDesc,card.dataset.infoImg||card.dataset.galleryImg||q('img',card)?.src,card);
   card.addEventListener('click',e=>{if(!e.target.closest('a,button'))show()});card.addEventListener('keydown',e=>{if(e.target===card&&['Enter',' '].includes(e.key)){e.preventDefault();show()}});
 });
 qa('.project-details').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('.project-card');const desc=document.createElement('div');desc.append(q('.project-info p',card).cloneNode(true),q('.project-info ul',card).cloneNode(true));info(q('h3',card).textContent,desc.innerHTML,q('.project-img',card).src,btn,card.dataset.link)}));
 const blogModal=q('#blogModal');
 if(blogModal)qa('.blog-read-more').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();const card=btn.closest('.blog-card');q('#blogModalTitle').textContent=card.dataset.title;q('#blogModalImg').src=card.dataset.img;q('#blogModalImg').alt=card.dataset.title;q('#blogModalDate').textContent=card.dataset.date;q('#blogModalAuthor').textContent=card.dataset.author;safeContent(q('#blogModalContent'),card.dataset.content);openDialog(blogModal,btn)}));
 // Search and progressive disclosure for the blog.
 const blogCards=qa('.page-blog .blog-card');
 let refreshBlog=()=>{};
 if(blogCards.length){
   const grid=blogCards[0].parentElement;const bar=document.createElement('div');bar.className='filter-bar';bar.innerHTML='<input class="filter-input" type="search"><span class="filter-count" aria-live="polite"></span>';grid.before(bar);
   const search=q('input',bar),count=q('.filter-count',bar),more=document.createElement('button'),empty=document.createElement('p');more.type='button';more.className='btn-secondary load-more';empty.className='filter-empty';grid.after(empty,more);
   blogCards.forEach(c=>{const date=document.createElement('div');date.className='blog-date';date.textContent=c.dataset.date||'';q('h3',c)?.before(date)});
   let limit=9;const norm=s=>String(s||'').toLocaleLowerCase('tr').normalize('NFKD').replace(/\p{Diacritic}/gu,'');
   refreshBlog=()=>{search.placeholder=ui().search;search.setAttribute('aria-label',ui().search);more.textContent=ui().more;empty.textContent=ui().none;let n=0;const query=norm(search.value.trim());blogCards.forEach(c=>{const match=norm([c.dataset.title,c.dataset.description,c.dataset.content].join(' ')).includes(query);if(match)n++;c.hidden=!match||n>limit});count.textContent=`${Math.min(n,limit)} / ${n} ${ui().count}`;empty.hidden=n!==0;more.hidden=n<=limit};
   search.addEventListener('input',()=>{limit=9;refreshBlog()});more.addEventListener('click',()=>{limit+=9;refreshBlog()});refreshBlog();
 }
 // Filter by actual portfolio sectors.
 const projects=qa('.page-projeler .project-card');let refreshProjects=()=>{};
 if(projects.length){const grid=projects[0].parentElement;const bar=document.createElement('div');bar.className='filter-bar';const group=document.createElement('div');group.className='filter-buttons';const count=document.createElement('span');count.className='filter-count';count.setAttribute('aria-live','polite');bar.append(group,count);grid.before(bar);const sectors=[...new Set(projects.map(c=>q('.sector',c).textContent.trim()))];let activeSector='';const buttons=['',...sectors].map(sector=>{const b=document.createElement('button');b.type='button';b.className='filter-button';b.textContent=sector||ui().all;b.addEventListener('click',()=>{activeSector=sector;refreshProjects()});group.append(b);return b});
 refreshProjects=()=>{buttons[0].textContent=ui().all;let n=0;projects.forEach(c=>{c.hidden=!!activeSector&&q('.sector',c).textContent.trim()!==activeSector;if(!c.hidden)n++});buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String((i===0?'':sectors[i-1])===activeSector)));count.textContent=`${n} / ${projects.length} ${ui().count}`};refreshProjects()}
 // Carry selected package into existing contact form.
 const form=q('#contactForm');if(form){const packageName=new URLSearchParams(location.search).get('paket');const subject=q('input[name=subject]:not([type=hidden])',form);if(packageName&&subject)subject.value=packageName.slice(0,150);const check=q('#kvkkOnay',form);form.addEventListener('formdata',e=>{e.formData.set('subject',subject?.value.trim()||'WebFlux Sitesinden Yeni Mesaj')});form.addEventListener('submit',e=>{if(check&&!check.checked){e.preventDefault();check.reportValidity();check.focus()}})}
 // Pause moving media when offscreen and respect reduced motion.
 const videos=qa('main video');
 if(reduced){videos.forEach(v=>{v.autoplay=false;v.pause();v.removeAttribute('autoplay')})}
 else if('IntersectionObserver' in window){const videoObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.play().catch(()=>{});else e.target.pause()}),{threshold:.15});videos.forEach(v=>videoObserver.observe(v))}
 // Lightweight entrance motion, no aggressive 3D scrolling.
 if(!reduced&&'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.06});qa('.page-index .section-title,.page-index .card-3d,.page-index .media-item,.page-index .manager-section,.page-index .pricing-item').forEach(el=>{el.classList.add('reveal');observer.observe(el)});document.body.classList.add('motion-ready')}
 const top=document.createElement('button');top.className='back-to-top';top.type='button';top.textContent='↑';top.setAttribute('aria-label',ui().top);top.addEventListener('click',()=>scrollTo({top:0,behavior:reduced?'instant':'smooth'}));document.body.append(top);
 const progress=document.createElement('div');progress.className='scroll-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
 let ticking=false;const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=`${max>0?Math.min(100,scrollY/max*100):0}%`;top.classList.toggle('visible',scrollY>600);ticking=false};addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});update();
 new MutationObserver(()=>{refreshBlog();refreshProjects();top.setAttribute('aria-label',ui().top)}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
});
