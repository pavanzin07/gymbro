import { test, expect } from '@playwright/test';
import { criarTreinoDoZero } from './helpers.js';

test('registrar carga dispara o timer de descanso; +15s não duplica; Pronto fecha', async ({ page }) => {
  await page.goto('/');
  await criarTreinoDoZero(page, 'Treino A');

  // adiciona um exercício via sugestões
  await page.locator('#routines button:has-text("💡 Sugestões")').click();
  await page.locator('.opt').first().click();
  await page.locator('.modal-actions button:has-text("Concluir")').click();

  // registra carga pelo botão 📈
  await page.locator('.row-actions button[title="Registrar carga"]').first().click();
  await page.locator('#ls-load').fill('60');
  await page.locator('.modal-actions button:has-text("Salvar")').click();

  // timer aparece
  const timer = page.locator('#rest-timer-card');
  await expect(timer).toBeVisible();
  await expect(timer).toContainText('Descanso');

  // +15s substitui o card em vez de duplicar
  await timer.locator('button:has-text("+15s")').click();
  await expect(page.locator('#rest-timer-card')).toHaveCount(1);

  // Pronto fecha o timer
  await page.locator('#rest-timer-card button:has-text("Pronto")').click();
  await expect(page.locator('#rest-timer-card')).toHaveCount(0);
});
