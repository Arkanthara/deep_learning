import {test} from 'node:test';import assert from 'node:assert/strict';
import {parseProgress,toggleCompletion,recordScore,emptyProgress} from '../src/scripts/progress.mjs';
import {pagesConfig} from '../scripts/pages-env.mjs';
test('corrupted and obsolete saved progress never prevents loading',()=>{
  for(const raw of [null,'not json','null','[]','{"completed":5,"scores":false}'])assert.deepEqual(parseProgress(raw),emptyProgress());
  assert.deepEqual(parseProgress(JSON.stringify({completed:['1-1','1-1','bad'],scores:{'chapter-1':90,'<script>':100,'chapter-2':101},lastLesson:'../bad'})),{completed:['1-1'],scores:{'chapter-1':90},lastLesson:null});
});
test('completion is reversible and independent of language',()=>{
  const completed=toggleCompletion(emptyProgress(),'1-1');assert.deepEqual(completed.completed,['1-1']);
  assert.deepEqual(toggleCompletion(completed,'1-1'),emptyProgress());
});
test('a lower retry score does not erase the best score',()=>{
  const first=recordScore(emptyProgress(),'chapter-1',83);
  assert.equal(recordScore(first,'chapter-1',33).scores['chapter-1'],83);
  assert.equal(recordScore(first,'chapter-1',100).scores['chapter-1'],100);
});
test('GitHub Pages configuration supports repository sites, user sites and domains',()=>{
  assert.deepEqual(pagesConfig('Arkanthara/deep_learning'),{SITE_URL:'https://arkanthara.github.io',BASE_PATH:'/deep_learning'});
  assert.deepEqual(pagesConfig('Alice/alice.github.io'),{SITE_URL:'https://alice.github.io',BASE_PATH:'/'});
  assert.deepEqual(pagesConfig('Alice/course','https://learn.example.org','/'),{SITE_URL:'https://learn.example.org',BASE_PATH:'/'});
  assert.throws(()=>pagesConfig('bad'));assert.throws(()=>pagesConfig('Alice/course','https://example.org/path'));
  assert.throws(()=>pagesConfig('Alice/course','','/abc\nBAD=value'));
});
