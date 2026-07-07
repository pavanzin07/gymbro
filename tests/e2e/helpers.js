export async function criarPerfil(page, { weight = '80', height = '175' } = {}) {
  await page.goto('/');
  await page.locator('.profile-cta button:has-text("Começar questionário")').click();
  await page.locator('#p-height').fill(height);
  await page.locator('#p-weight').fill(weight);
  await page.locator('[data-g="goal"][data-k="massa"]').click();
  await page.locator('[data-g="level"][data-k="ini"]').click();
  await page.locator('[data-g="life"][data-k="lev"]').click();
  await page.locator('.modal-actions button:has-text("Salvar perfil")').click();
}

export async function criarTreinoDoZero(page, nome = 'Treino A') {
  await page.locator('#tab-treino').click();
  await page.locator('button:has-text("＋ Treino")').click();
  await page.locator('#r-name').fill(nome);
  await page.locator('.modal-actions button:has-text("Salvar")').click();
}

export async function criarPersonagem(page, nome = 'Meu Bro') {
  await page.locator('#tab-bro').click();
  await page.locator('.profile-cta button:has-text("Criar personagem")').click();
  await page.locator('#ch-name').fill(nome);
  await page.locator('.modal-actions button:has-text("Criar Bro")').click();
}
