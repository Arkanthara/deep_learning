import {readdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {parse} from 'yaml';
import katex from 'katex';
const root=new URL('../',import.meta.url);
const dir=new URL('src/content/lessons/',root);
const files=(await readdir(dir,{recursive:true})).filter(f=>f.endsWith('.md'));
const pdfs=(await readdir(new URL('handout/',root))).filter(f=>/^dlc-handout-\d+-\d+-.*\.pdf$/.test(f));
const byKey=new Map();
for(const file of files){
  const text=await readFile(new URL(file,dir),'utf8');
  const match=text.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]+)$/);
  assert(match,`${file}: missing YAML frontmatter or Markdown body`);
  const data=parse(match[1]); const body=match[2];
  const key=`${data.lang}/${data.lessonId}`;
  assert(!byKey.has(key),`${file}: duplicate translation ${key}`);byKey.set(key,data);
  assert(pdfs.includes(data.source),`${file}: unknown PDF ${data.source}`);
  assert(data.source.startsWith(`dlc-handout-${data.lessonId}-`),`${file}: wrong source lesson`);
  assert(file.replaceAll('\\','/')===`${data.lang}/${data.lessonId.split('-')[0].padStart(2,'0')}/${data.lessonId}.md`,`${file}: path must match language and lesson`);
  assert(data.sourcePages.every(p=>Number.isInteger(p)&&p>0&&p<=data.pdfPages),`${file}: invalid PDF page`);
  assert(data.summary.length>=3,`${file}: insufficient revision points`);
  assert(data.quiz.answer>=0&&data.quiz.answer<data.quiz.options.length,`${file}: invalid answer`);
  assert(new Set(data.quiz.options).size===data.quiz.options.length,`${file}: duplicate answer options`);
  assert(body.split(/\s+/).length>=140,`${file}: lesson too short`);
  assert((body.match(/^## /gm)||[]).length>=3,`${file}: missing structured explanation`);
  assert(body.includes('<details>')&&body.includes('<summary>'),`${file}: missing exercise with a revealable solution`);
  assert(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text),`${file}: unexpected control character`);
  assert(!/\b(?:TODO|TBD|Lorem ipsum)\b/.test(text),`${file}: unfinished content`);
  katex.renderToString(data.formula,{throwOnError:true,trust:false});
  for(const formula of body.matchAll(/\$\$\s*([\s\S]*?)\s*\$\$/g)) katex.renderToString(formula[1],{throwOnError:true,trust:false});
}
for(const pdf of pdfs){
  const id=pdf.match(/^dlc-handout-(\d+-\d+)-/)[1];
  const fr=byKey.get(`fr/${id}`),en=byKey.get(`en/${id}`);
  assert(fr&&en,`Missing FR/EN translation for ${pdf}`);
  for(const field of ['source','sourcePages','pdfPages'])assert.deepEqual(fr[field],en[field],`${id}: translation metadata differs (${field})`);
  assert.equal(fr.quiz.options.length,en.quiz.options.length,`${id}: quiz option counts differ`);
}
assert.equal(files.length,pdfs.length*2,'Exactly one FR/EN pair per numbered handout is required');
console.log(`✓ ${pdfs.length} source handouts, ${files.length} Markdown lessons, complete FR/EN pairs, valid sources and quizzes.`);
