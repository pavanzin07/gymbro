import { test, expect } from '@playwright/test';

test('diário alimentar: copiar modelo do dia e navegar entre datas', async ({ page }) => {
  await page.goto('/');
  await page.locator('#tab-dieta').click();

  // dia novo começa vazio, com botão de copiar o modelo
  const copiar = page.locator('button:has-text("📋 Copiar modelo")');
  await expect(copiar).toBeVisible();
  await copiar.click();

  // refeições do modelo aparecem
  await expect(page.locator('#meals')).toContainText('Café da manhã');
  await expect(page.locator('#meals')).toContainText('Almoço');
  await expect(copiar).toHaveCount(0);

  // dia anterior está vazio (botão de copiar volta a aparecer)
  await page.locator('button:has-text("← Anterior")').click();
  await expect(page.locator('button:has-text("📋 Copiar modelo")')).toBeVisible();

  // voltar pra hoje mantém as refeições copiadas
  await page.locator('button:has-text("Próxima →")').click();
  await expect(page.locator('#meals')).toContainText('Almoço');
});
