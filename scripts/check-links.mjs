import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,relative,sep} from 'node:path';
import assert from 'node:assert/strict';

const root=resolve('dist');
const base=(process.env.BASE_PATH||'/deep_learning').replace(/\/$/,'');
const origin=new URL(process.env.SITE_URL||'https://arkanthara.github.io').origin;
const files=(await readdir(root,{recursive:true})).filter(f=>f.endsWith('.html'));
let links=0;
for(const file of files){
  const html=await readFile(resolve(root,file),'utf8');
  const page=new URL(`${base}/${file.replace(/index\.html$/,'')}`,origin);
  for(const match of html.matchAll(/(?:href|src)="([^"<>]+)"/g)){
    const url=new URL(match[1].replaceAll('&amp;','&'),page);
    if(url.origin!==origin) continue;
    assert(!base||url.pathname===base||url.pathname.startsWith(`${base}/`),`${file}: link escapes base: ${url.pathname}`);
    const target=resolve(root,`.${decodeURIComponent(url.pathname.slice(base.length))}`);
    assert(!relative(root,target).split(sep).includes('..'),`${file}: invalid path`);
    let info;try{info=await stat(target);}catch{assert.fail(`${file}: broken link ${match[1]}`);}
    if(info.isDirectory())await stat(resolve(target,'index.html'));
    links++;
  }
}
console.log(`✓ ${links} local links and assets checked across ${files.length} HTML pages.`);
