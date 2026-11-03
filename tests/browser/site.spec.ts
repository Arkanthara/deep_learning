import {test,expect} from '@playwright/test';

test('language chooser, course coverage and chapter order',async({page})=>{
  await page.goto('./');await expect(page.getByRole('link',{name:'Français',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'English',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('lang','en');
  const cards=page.locator('.chapter-card');await expect(cards).toHaveCount(13);
  await expect(cards.nth(9).locator('.chapter-badge')).toHaveText('10');
  await expect(page.locator('body')).toHaveAttribute('data-total','62');
  await cards.last().click();await expect(page.getByRole('heading',{level:1})).toHaveText('Attention & Transformers');
  await expect(page.locator('.lesson-list>a')).toHaveCount(3);
  await page.goto('./');await expect(page).toHaveURL(/\/en\/$/);
});

test('Markdown, formulas, code and source PDF are available',async({page,request})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('fr/lessons/1-4/');
  await expect(page.locator('.markdown-body h2')).toHaveCount(6);
  await expect(page.locator('.markdown-body .katex').first()).toBeVisible();
  await expect(page.locator('.markdown-body pre')).toContainText('torch.linalg.lstsq');
  await page.locator('.markdown-body details summary').click();await expect(page.locator('.markdown-body details')).toHaveAttribute('open','');
  const pdf=page.locator('.source-links>a');const response=await request.get((await pdf.getAttribute('href'))!);expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('pdf');
  expect(errors).toEqual([]);
});

test('completion persists through reload and language change',async({page})=>{
  await page.goto('fr/lessons/2-1/');const complete=page.locator('[data-complete]');await complete.click();await expect(complete).toHaveAttribute('aria-pressed','true');
  await page.reload();await expect(complete).toHaveAttribute('aria-pressed','true');
  await page.locator('.language-switch a[lang=en]').click();await expect(page).toHaveURL(/\/en\/lessons\/2-1\/$/);await expect(complete).toHaveText('✓ Lesson completed');
  await expect(page.locator('[data-xp]')).toHaveText('20');await complete.click();await expect(page.locator('[data-xp]')).toHaveText('0');
});

test('quiz feedback, results, retry and persisted best score',async({page})=>{
  await page.goto('en/lessons/1-1/');const quiz=page.locator('.quiz');
  await quiz.getByRole('radio').nth(1).check();await quiz.getByRole('button',{name:'Check answer'}).click();
  await expect(quiz.getByRole('status')).toContainText('Correct answer:');
  await quiz.getByRole('button',{name:'See results'}).click();await expect(quiz.locator('.score')).toHaveText('0 / 1');
  await expect(quiz.locator('.quiz-review a')).toHaveAttribute('href',/en\/lessons\/1-1/);
  await quiz.getByRole('button',{name:'Try again'}).click();await quiz.getByRole('radio').first().check();await quiz.getByRole('button',{name:'Check answer'}).click();await quiz.getByRole('button',{name:'See results'}).click();
  await expect(quiz.locator('.score')).toHaveText('1 / 1');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('dl-quest.progress.v1')!));expect(saved.scores['lesson-1-1']).toBe(100);
});

test('all chapter quiz questions work and scores survive lower retries',async({page})=>{
  await page.goto('en/quiz/?chapter=10');const root=page.locator('[data-filter-chapter="10"]');await expect(root).toBeVisible();
  for(let i=0;i<3;i++){await root.getByRole('radio').nth(i).check();await root.getByRole('button',{name:'Check answer'}).click();await root.getByRole('button',{name:i===2?'See results':'Next question →',exact:true}).click();}
  await expect(root.locator('.score')).toHaveText('3 / 3');await expect(root.locator('[data-best-score]')).toHaveText('Best score : 100%');
  await page.reload();await expect(root.locator('[data-best-score]')).toHaveText('Best score : 100%');
});

test('search handles accents and empty results; revision filter survives language switch',async({page})=>{
  await page.goto('fr/');const search=page.getByRole('searchbox');await search.fill('retropropagation');await expect(page.locator('#search-results>a:visible')).not.toHaveCount(0);
  await search.fill('zzzzunmatched');await expect(page.locator('#search-status')).toContainText('Aucune leçon');await search.fill('');await expect(page.locator('#chapter-grid')).toBeVisible();
  await page.goto('fr/review/');await page.locator('[data-chapter-filter]').selectOption('13');await expect(page.locator('.revision-card:visible')).toHaveCount(3);
  await page.locator('.language-switch a[lang=en]').click();await expect(page.locator('[data-chapter-filter]')).toHaveValue('13');await expect(page.locator('.revision-card:visible')).toHaveCount(3);
});

test('mobile navigation and representative pages have no horizontal overflow',async({page,isMobile})=>{
  for(const route of ['fr/','en/lessons/13-2/','fr/review/','en/quiz/']){
    await page.goto(route);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBeTruthy();
  }
  if(isMobile){const menu=page.getByRole('button',{name:'Open menu'});await menu.click();await expect(menu).toHaveAttribute('aria-expanded','true');await page.locator('.main-nav').getByRole('link',{name:'Learning path'}).click();await expect(page).toHaveURL(/\/en\/$/);}
});

test('lessons remain readable without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false,baseURL});const page=await context.newPage();await page.goto('en/lessons/7-4/');
  await expect(page.locator('.markdown-body')).toContainText('ELBO');await expect(page.locator('.quiz-noscript')).toContainText('Enable JavaScript');await context.close();
});

test('blocked local storage does not break learning or quizzes',async({page})=>{
  await page.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new DOMException('blocked','SecurityError');};Storage.prototype.setItem=()=>{throw new DOMException('blocked','SecurityError');};});
  await page.goto('en/lessons/1-1/');await page.locator('[data-complete]').click();await expect(page.locator('[data-complete]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('.storage-notice')).toBeVisible();
  await page.getByRole('radio').first().check();await page.getByRole('button',{name:'Check answer'}).click();await expect(page.getByRole('status').filter({hasText:'Well done'})).toBeVisible();
});
