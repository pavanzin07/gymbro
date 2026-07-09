import { test, expect } from '@playwright/test';
import { criarPerfil } from './helpers.js';

test('wizard gera programa completo com evidências e aplica na aba Treino', async ({ page }) => {
  await page.goto('/');
  await criarPerfil(page);

  await page.locator('#tab-treino').click();
  await page.locator('#routines button:has-text("🧬 Montar meu treino")').click();

  // wizard abre com as 3 escolhas pré-marcadas pelo perfil
  await expect(page.locator('#modal')).toContainText('Já deixei tudo marcado');
  await expect(page.locator('#modal .opt.on')).toHaveCount(3);

  // trocar uma opção mantém o fluxo (impressão de escolha)
  await page.locator('#modal button:has-text("🏋️ Força")').click();
  await expect(page.locator('#modal button:has-text("🏋️ Força")')).toHaveClass(/on/);

  await page.locator('#modal button:has-text("🧬 Gerar meu treino")').click();

  // preview: programa completo + referências do PubMed
  await expect(page.locator('#modal h3')).toContainText('Seu programa');
  await expect(page.locator('#modal')).toContainText('séries/sem');
  await expect(page.locator('#modal')).toContainText('A ciência por trás');
  await expect(page.locator('#modal')).toContainText('PubMed');

  await page.locator('#modal button:has-text("✅ Usar este treino")').click();
  await expect(page.locator('#toast')).toHaveText(/Programa criado/);

  // rotinas aplicadas com exercícios preenchidos (sets×reps)
  await expect(page.locator('.routine-head h3').first()).toContainText('Full Body');
  const exercicios = page.locator('#routines .row .name b');
  expect(await exercicios.count()).toBeGreaterThan(5);
  // foco força: compostos 4×4-6
  await expect(page.locator('#routines .pill:has-text("4×4-6")').first()).toBeVisible();
});
