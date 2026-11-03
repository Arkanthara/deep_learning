import { mkdir, readdir, copyFile } from 'node:fs/promises';
const source = new URL('../handout/', import.meta.url);
const target = new URL('../public/handout/', import.meta.url);
await mkdir(target, { recursive: true });
for (const name of await readdir(source)) {
  if (name.endsWith('.pdf') || name === 'by-nc-sa-4.0.txt') {
    await copyFile(new URL(name, source), new URL(name, target));
  }
}
console.log('Original handouts and their license copied to public/handout.');
