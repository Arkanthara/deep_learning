import {pathToFileURL} from 'node:url';
export function pagesConfig(repository, siteOverride='', baseOverride='') {
  if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) throw new Error('Expected owner/repository');
  const [owner,name]=repository.split('/');
  const site=siteOverride || `https://${owner.toLowerCase()}.github.io`;
  const base=baseOverride || (name.toLowerCase()===`${owner.toLowerCase()}.github.io`?'/':`/${name}`);
  const url=new URL(site);
  if(!['https:','http:'].includes(url.protocol)||url.pathname!=='/'||url.search||url.hash||/[\r\n]/.test(site+base)||!/^\/[A-Za-z0-9_./-]*$/.test(base)) throw new Error('SITE_URL must be an origin; BASE_PATH must be a path beginning with /.');
  return {SITE_URL:url.origin, BASE_PATH:base};
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
  const config=pagesConfig(process.env.REPOSITORY,process.env.CONFIGURED_SITE_URL,process.env.CONFIGURED_BASE_PATH);
  for(const [key,value] of Object.entries(config)) console.log(`${key}=${value}`);
}
