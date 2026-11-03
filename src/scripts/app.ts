import { readProgress, writeProgress, toggleCompletion, emptyProgress } from './progress.mjs';
const lang = document.body.dataset.lang || 'fr';
const t=(fr:string,en:string)=>lang==='fr'?fr:en;
const base=document.body.dataset.base || '/';
function updateProgress() {
  const progress=readProgress();
  document.querySelectorAll('[data-completed-count]').forEach(el=>{el.textContent=String(progress.completed.length);});
  document.querySelectorAll('[data-xp]').forEach(el=>{el.textContent=String(progress.completed.length*20);});
  document.querySelectorAll<HTMLElement>('[data-lesson-ids]').forEach(card=>{
    const ids=card.dataset.lessonIds?.split(',').filter(Boolean) || [];
    const done=ids.filter(id=>progress.completed.includes(id)).length;
    const count=card.querySelector('[data-card-progress]'); if(count) count.textContent=`${done}/${ids.length}`;
    const bar=card.querySelector<HTMLElement>('[data-card-bar]'); if(bar) bar.style.width=`${ids.length?done/ids.length*100:0}%`;
    if(ids.length && done===ids.length) document.querySelector(`[data-chapter-done="${card.dataset.chapter}"]`)?.replaceChildren('✓');
    else document.querySelector(`[data-chapter-done="${card.dataset.chapter}"]`)?.replaceChildren();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-complete]').forEach(button=>{
    const done=progress.completed.includes(button.dataset.complete!);
    button.textContent=done?t('✓ Leçon terminée','✓ Lesson completed'):t('Marquer comme terminée','Mark as complete');
    button.classList.toggle('completed',done); button.setAttribute('aria-pressed',String(done));
  });
  document.querySelectorAll<HTMLElement>('[data-lesson-status]').forEach(el=>{
    el.textContent=progress.completed.includes(el.dataset.lessonStatus!)?'✓':'→';
    el.setAttribute('aria-label',progress.completed.includes(el.dataset.lessonStatus!)?t('Terminée','Completed'):t('À lire','To read'));
  });
  if(progress.lastLesson) document.querySelectorAll<HTMLAnchorElement>('[data-resume]').forEach(el=>{
    el.href=`${base}${lang}/lessons/${progress.lastLesson}/`;
    const label=el.querySelector('[data-resume-label]'); if(label) label.textContent=t('Reprendre le parcours','Continue learning');
  });
  document.querySelectorAll<HTMLElement>('[data-best-score]').forEach(el=>{
    const score=progress.scores[el.dataset.bestScore!]; el.textContent=score===undefined?t('Pas encore tenté','Not attempted yet'):`${t('Meilleur score','Best score')} : ${score}%`;
  });
}
const currentLesson=document.querySelector<HTMLElement>('[data-current-lesson]')?.dataset.currentLesson;
if(currentLesson) writeProgress({...readProgress(),lastLesson:currentLesson});
updateProgress();
document.addEventListener('progress-update',updateProgress);
window.addEventListener('storage',updateProgress);
document.querySelectorAll<HTMLButtonElement>('[data-complete]').forEach(button=>button.addEventListener('click',()=>writeProgress(toggleCompletion(readProgress(),button.dataset.complete!))));
const menu=document.querySelector<HTMLButtonElement>('.menu-toggle');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.querySelector('.sidebar')?.classList.toggle('open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){menu?.setAttribute('aria-expanded','false');document.querySelector('.sidebar')?.classList.remove('open');}});
document.addEventListener('click',event=>{if(menu?.getAttribute('aria-expanded')==='true' && event.target instanceof Node && !document.querySelector('.sidebar')?.contains(event.target) && !menu.contains(event.target)){menu.setAttribute('aria-expanded','false');document.querySelector('.sidebar')?.classList.remove('open');}});
const search=document.querySelector<HTMLInputElement>('#course-search');
const normalise=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
search?.addEventListener('input',()=>{
  const query=normalise(search.value.trim()); let count=0;
  document.querySelector<HTMLElement>('#chapter-grid')!.hidden=!!query;
  document.querySelector<HTMLElement>('#search-results')!.hidden=!query;
  document.querySelectorAll<HTMLElement>('[data-search]').forEach(el=>{const match=query.split(/\s+/).every(word=>normalise(el.dataset.search || '').includes(word));el.hidden=!match;if(match)count++;});
  const status=document.querySelector<HTMLElement>('#search-status')!;status.hidden=!query;
  status.textContent=count?`${count} ${t('leçon(s) trouvée(s)','lesson(s) found')}`:t('Aucune leçon trouvée. Essaie « gradient », « tenseur » ou « attention ».','No lessons found. Try “gradient”, “tensor” or “attention”.');
});
const chapterFilter=document.querySelector<HTMLSelectElement>('[data-chapter-filter]');
chapterFilter?.addEventListener('change',()=>{
  document.querySelectorAll<HTMLElement>('[data-filter-chapter]').forEach(el=>{el.hidden=chapterFilter.value!=='all'&&el.dataset.filterChapter!==chapterFilter.value;});
  const url=new URL(location.href);url.searchParams.set('chapter',chapterFilter.value);history.replaceState(null,'',url);syncLanguageLinks();
});
if(chapterFilter){const selected=new URLSearchParams(location.search).get('chapter');if(selected&&Array.from(chapterFilter.options).some(o=>o.value===selected)){chapterFilter.value=selected;chapterFilter.dispatchEvent(new Event('change'));}}
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
  const text=button.closest('.code-block')?.querySelector('code')?.textContent || '';
  try{await navigator.clipboard.writeText(text);button.textContent=t('Copié !','Copied!');}catch{button.textContent=t('Sélectionne le code pour le copier','Select the code to copy it');}
}));
document.querySelector('[data-reset-progress]')?.addEventListener('click',()=>{if(confirm(t('Effacer toutes les leçons terminées et tous les scores sur ce navigateur ?','Clear all completed lessons and scores in this browser?'))){writeProgress(emptyProgress());location.reload();}});

// Remember the chosen language and retain chapter filters when switching it.
try { localStorage.setItem('dl-quest.language.v1', lang); } catch { /* optional preference */ }
function syncLanguageLinks(){document.querySelectorAll<HTMLAnchorElement>('.language-switch a').forEach(link=>{
  const destination=new URL(link.href); destination.search=location.search;
  if (/^#[0-9]+-[0-9]+$/.test(location.hash)) destination.hash=location.hash;
  link.href=destination.href;
});}
syncLanguageLinks();
document.querySelectorAll<HTMLElement>('.markdown-body pre').forEach(pre=>{
  const wrapper=document.createElement('div');wrapper.className='code-block';
  const heading=document.createElement('div');heading.className='code-heading';
  const label=document.createElement('span');label.textContent='Python / PyTorch';
  const copy=document.createElement('button');copy.textContent=t('Copier','Copy');copy.type='button';
  copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pre.textContent||'');copy.textContent=t('Copié !','Copied!');}catch{copy.textContent=t('Sélectionne le code','Select the code');}});
  heading.append(label,copy);pre.before(wrapper);wrapper.append(heading,pre);
});

const mobileQuery=matchMedia('(max-width:700px)');
function syncMobileNavigation(){
  const sidebar=document.querySelector<HTMLElement>('.sidebar');
  if(sidebar) sidebar.inert=mobileQuery.matches && menu?.getAttribute('aria-expanded')!=='true';
}
syncMobileNavigation();mobileQuery.addEventListener('change',syncMobileNavigation);
if(menu) new MutationObserver(syncMobileNavigation).observe(menu,{attributes:true,attributeFilter:['aria-expanded']});
