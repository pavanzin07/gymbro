import { test, expect } from '@playwright/test';

test('onboarding completo: perfil → treino gerado → dieta gerada → personagem', async ({ page }) => {
  await page.goto('/');

  // 1. perfil
  await page.locator('.profile-cta button:has-text("Começar questionário")').click();
  await page.locator('#p-height').fill('175');
  await page.locator('#p-weight').fill('80');
  await page.locator('[data-g="goal"][data-k="massa"]').click();
  await page.locator('[data-g="level"][data-k="ini"]').click();
  await page.locator('[data-g="life"][data-k="lev"]').click();
  await page.locator('.modal-actions button:has-text("Salvar perfil")').click();

  // 2. esteira emenda no gerador de treino
  await expect(page.locator('#modal')).toContainText('Perfil pronto');
  await page.locator('#modal button:has-text("🧬 Montar meu treino")').click();
  await expect(page.locator('#modal')).toContainText('Já deixei tudo marcado');
  await page.locator('#modal button:has-text("🧬 Gerar meu treino")').click();
  await page.locator('#modal button:has-text("✅ Usar este treino")').click();

  // 3. esteira emenda na dieta
  await expect(page.locator('#modal')).toContainText('Treino pronto');
  await page.locator('#modal button:has-text("🍽️ Montar minha dieta")').click();
  await page.locator('#modal button:has-text("🧬 Gerar meu dia")').click();
  await page.locator('#modal button:has-text("✅ Usar este dia")').click();

  // 4. esteira fecha no personagem
  await expect(page.locator('#modal')).toContainText('Tudo pronto');
  await page.locator('#modal button:has-text("🦾 Criar meu Bro")').click();
  await page.locator('#ch-name').fill('Bro do Onboarding');
  await page.locator('.modal-actions button:has-text("Criar Bro")').click();

  // resultado final: tudo montado
  await expect(page.locator('#bro-body')).toContainText('Bro do Onboarding');
  await page.locator('#tab-treino').click();
  await expect(page.locator('.routine-head h3').first()).toContainText('Full Body');
  await page.locator('#tab-dieta').click();
  await expect(page.locator('#meals')).toContainText('Almoço');
});
