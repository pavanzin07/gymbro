import { test, expect } from '@playwright/test';
import { criarPersonagem } from './helpers.js';

test('check-in diário de treino faz as moedas do personagem subirem', async ({ page }) => {
  await page.goto('/');
  await criarPersonagem(page, 'Meu Bro');

  const coins = page.locator('.coins').first();
  await expect(coins).toHaveText('🪙 0');

  await page.locator('#tab-progresso').click();
  await page.locator('.htog:has-text("Treino")').click();
  await expect(page.locator('#toast')).toHaveText(/Treino concluído/);

  await page.locator('#tab-bro').click();
  await expect(coins).not.toHaveText('🪙 0');
  const texto = await coins.textContent();
  const valor = parseInt(texto.replace(/\D/g, ''), 10);
  expect(valor).toBeGreaterThan(0);
});
