import { test, expect } from '@playwright/test';
import { criarTreinoDoZero } from './helpers.js';

test('adicionar exercício via sugestões insere o exercício no treino', async ({ page }) => {
  await page.goto('/');
  await criarTreinoDoZero(page, 'Treino A');

  await expect(page.locator('.routine-meta:has-text("Sem exercícios ainda.")')).toBeVisible();

  await page.locator('#routines button:has-text("💡 Sugestões")').click();
  await expect(page.locator('.modal h3')).toHaveText(/Montar Treino A/);

  const primeiraSugestao = page.locator('.opt').first();
  const nomeExercicio = (await primeiraSugestao.locator('.o-name').innerText()).trim();
  await primeiraSugestao.click();

  await expect(page.locator('#toast')).toHaveText(new RegExp(`${nomeExercicio.split(' ')[0]}.*adicionado`));
  await page.locator('.modal-actions button:has-text("Concluir")').click();

  await expect(page.locator('.routine-meta:has-text("Sem exercícios ainda.")')).toHaveCount(0);
  await expect(page.locator('.row .name b')).toContainText(nomeExercicio.split(' ')[0]);
});
