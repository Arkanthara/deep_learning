import {defineConfig,devices} from '@playwright/test';
const basePath=(process.env.BASE_PATH || '/deep_learning').replace(/\/$/,'');
export default defineConfig({
  testDir:'./tests/browser',
  fullyParallel:true,
  forbidOnly:!!process.env.CI,
  retries:process.env.CI?1:0,
  workers:process.env.CI?2:undefined,
  reporter:[['list'],['html',{open:'never'}]],
  use:{baseURL:`http://127.0.0.1:4321${basePath}/`,trace:'retain-on-failure',screenshot:'only-on-failure'},
  webServer:{command:'npm run preview -- --port 4321 --ignore-lock',url:`http://127.0.0.1:4321${basePath}/fr/`,reuseExistingServer:false,timeout:30000},
  projects:[{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['Pixel 7']}}],
});
