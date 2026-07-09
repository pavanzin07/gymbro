import { test, expect } from '@playwright/test';
import { criarPerfil } from './helpers.js';

test('wizard de dieta gera o dia completo mirando as metas e aplica', async ({ page }) => {
  await page.goto('/');
  await criarPerfil(page);

  await page.locator('#tab-dieta').click();
  await page.locator('button:has-text("🧬 Montar meu dia")').click();

  // wizard com as 2 escolhas pré-marcadas
  await expect(page.locator('#modal')).toContainText('Montar meu dia alimentar');
  await expect(page.locator('#modal .opt.on')).toHaveCount(2);

  await page.locator('#modal button:has-text("🧬 Gerar meu dia")').click();

  // preview: totais vs metas + refeições + evidências
  await expect(page.locator('#modal h3')).toContainText('Seu dia alimentar');
  await expect(page.locator('#modal .pill').first()).toContainText('kcal');
  await expect(page.locator('#modal')).toContainText('A ciência por trás');
  await expect(page.locator('#modal')).toContainText('PubMed');

  await page.locator('#modal button:has-text("✅ Usar este dia")').click();
  await expect(page.locator('#toast')).toHaveText(/Dia alimentar montado/);

  // refeições aplicadas no diário de hoje
  await expect(page.locator('#meals')).toContainText('Almoço');
  await expect(page.locator('#meals')).toContainText('Jantar');
});
