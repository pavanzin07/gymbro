import { test, expect } from '@playwright/test';

test('menu abre o modal de sincronização (não configurado) e Esc fecha', async ({ page }) => {
  await page.goto('/');

  // abre o menu ⚙️ e vai em Conta & Sincronização
  await page.locator('header button[onclick="openMenu()"]').click();
  await page.locator('#modal button:has-text("Conta & Sincronização")').click();

  // sem .env.local o modal explica que o sync não está configurado
  await expect(page.locator('#modal')).toContainText('Sincronização');
  await expect(page.locator('#modal')).toContainText('ainda não foi configurada');

  // Esc fecha o modal (acessibilidade)
  await page.keyboard.press('Escape');
  await expect(page.locator('#modal-bg')).not.toHaveClass(/show/);
});
