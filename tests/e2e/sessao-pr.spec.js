import { test, expect } from '@playwright/test';
import { criarTreinoDoZero } from './helpers.js';

test('registrar sessão de treino com carga cria um PR visível em Conquistas', async ({ page }) => {
  await page.goto('/');
  await criarTreinoDoZero(page, 'Treino A');

  // adiciona um exercício qualquer via sugestões
  await page.locator('#routines button:has-text("💡 Sugestões")').click();
  const primeiraSugestao = page.locator('.opt').first();
  const nomeExercicio = (await primeiraSugestao.locator('.o-name').innerText()).trim();
  await primeiraSugestao.click();
  await page.locator('.modal-actions button:has-text("Concluir")').click();

  // registra o treino de hoje com carga
  await page.locator('button:has-text("▶️ Registrar treino")').click();
  await page.locator('.opt:has-text("Treino A")').click();
  await page.locator('#lo-0').fill('60');
  await page.locator('#re-0').fill('8');
  await page.locator('.modal-actions button:has-text("Salvar treino")').click();

  await expect(page.locator('#toast')).toHaveText(/Treino registrado/);

  await page.locator('#tab-recordes').click();
  const cardRecorde = page.locator('#rec-body .card').filter({ hasText: nomeExercicio.split(' ')[0] }).filter({ hasText: '🏆' });
  await expect(cardRecorde).toBeVisible();
  await expect(cardRecorde).toContainText('60');
});
