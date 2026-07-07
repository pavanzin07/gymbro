import { test, expect } from '@playwright/test';
import { criarPerfil } from './helpers.js';

test('criar perfil calcula metas e elas aparecem na aba Dieta', async ({ page }) => {
  await criarPerfil(page, { weight: '80', height: '175' });

  await expect(page.locator('#perfil-sub')).toHaveText(/Ganhar massa · 80 kg/);
  const appliedNote = page.locator('.applied-note');
  await expect(appliedNote).toBeVisible();
  const notaTexto = await appliedNote.textContent();
  const kcalMatch = notaTexto.match(/(\d+) kcal/);
  expect(kcalMatch).not.toBeNull();
  const metaKcal = kcalMatch[1];

  await page.locator('#tab-dieta').click();
  await expect(page.locator('#dieta-sub')).toHaveText(new RegExp(`/ ${metaKcal} kcal hoje`));
  await expect(page.locator('.macro-box.kcal .val')).toContainText(`/${metaKcal}`);
});

test('trocar a opção de calorias recalcula a meta aplicada e a Dieta reflete na hora', async ({ page }) => {
  await criarPerfil(page, { weight: '80', height: '175' });

  // opção "c" (terceira) de calorias
  await page.locator('.sug-block').first().locator('.opt').nth(2).click();
  const appliedNote = page.locator('.applied-note');
  const novaMeta = (await appliedNote.textContent()).match(/(\d+) kcal/)[1];

  await page.locator('#tab-dieta').click();
  await expect(page.locator('#dieta-sub')).toHaveText(new RegExp(`/ ${novaMeta} kcal hoje`));
});
