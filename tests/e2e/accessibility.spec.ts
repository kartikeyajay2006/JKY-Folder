import { test,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function check(page:import('@playwright/test').Page){const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(result.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))).toEqual([]);}
async function nav(page:import('@playwright/test').Page,label:string){if(await page.getByRole('button',{name:'Open navigation'}).isVisible())await page.getByRole('button',{name:'Open navigation'}).click();await page.getByRole('navigation',{name:'Workspace'}).getByRole('button',{name:label,exact:label!=='Requirements'}).click();}
test('automated accessibility of welcome, workspace views and review dialogs',async({page})=>{
 await page.goto('/');await check(page);await page.getByRole('button',{name:'Explore the demo'}).click();await page.getByRole('heading',{name:'Coming together.'}).waitFor();await check(page);
 await nav(page,'Requirements');await check(page);await page.getByRole('button',{name:'Edit application details'}).click();await page.getByRole('dialog').waitFor();await check(page);await page.keyboard.press('Escape');
 await page.getByRole('article').filter({has:page.getByRole('heading',{name:'Signature',exact:true})}).getByRole('button',{name:'Review evidence'}).click();await page.getByRole('dialog').waitFor();await check(page);await page.keyboard.press('Escape');
 await nav(page,'My documents');await check(page);await nav(page,'Readiness report');await check(page);
});
