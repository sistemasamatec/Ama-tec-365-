import { test, expect } from '@playwright/test';

test.describe('Ama Tec — Auditoria E2E e Conversão', () => {
  test('Página Inicial carrega com H1 oficial, NAP e garantia', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Aguarda montagem dos componentes React após compilação inicial do Vite
    const h1 = page.locator('h1').first();
    await h1.waitFor({ state: 'visible', timeout: 15000 });
    await expect(h1).toContainText('Reparação precisa de equipamentos eletrónicos com garantia');

    // Verifica presença do NAP consistente (Golf 2, Luanda)
    await expect(page.locator('body')).toContainText('Golf 2');
    await expect(page.locator('body')).toContainText('930 372 597');

    // Verifica se os links do WhatsApp possuem wa.me
    const waLinks = page.locator('a[href*="wa.me"]');
    await expect(waLinks.first()).toBeVisible();
  });

  test('Página de Serviço possui CTA de conversão sem scroll e detalhes técnicos', async ({ page }) => {
    await page.goto('/servicos/reparacao-de-televisores');

    // Título H1 do serviço
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Reparação de Televisores');

    // CTA principal
    const ctaAssistencia = page.locator('a[href*="formulario-pedido"], a[href*="/solicitar-assistencia"]');
    await expect(ctaAssistencia.first()).toBeVisible();

    // Verificação de avarias comuns do equipamento
    await expect(page.locator('body')).toContainText(/backlight/i);
    await expect(page.locator('body')).toContainText(/fonte de alimentação/i);
  });

  test('Página de FAQ Institucional carrega perguntas e acordeão', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.locator('h1')).toContainText('Perguntas Frequentes');
    await expect(page.locator('body')).toContainText('Prazos de Diagnóstico');
    await expect(page.locator('body')).toContainText('Garantia');
    await expect(page.locator('body')).toContainText('Formas de Pagamento');
  });

  test('Página de Contactos exibe morada, mapa e botões de copiar', async ({ page }) => {
    await page.goto('/contactos');
    await expect(page.locator('h1')).toContainText('Contactos & Localização');
    await expect(page.locator('body')).toContainText('5001399837');
    await expect(page.locator('iframe[title*="Golf 2"]')).toBeVisible();
    await expect(page.locator('a:has-text("Google Maps")')).toBeVisible();
  });

  test('Barra de Ações Mobile está visível em viewport móvel', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const actionBar = page.locator('nav[aria-label="Ações rápidas móveis"]');
    await actionBar.waitFor({ state: 'visible', timeout: 15000 });
    await expect(actionBar).toBeVisible();

    await expect(actionBar.locator('a[href^="tel:"]')).toBeVisible();
    await expect(actionBar.locator('a[href*="wa.me"]')).toBeVisible();
    await expect(actionBar.locator('a[href="/solicitar-assistencia"]')).toBeVisible();
  });
});

test.describe('Ama Tec — Painel de Administração & CRUD de Serviços', () => {
  test('Autenticação no /admin e ciclo de vida CRUD de serviços', async ({ page }) => {
    await page.goto('/admin');

    // 1. Ecrã de Login
    await expect(page.locator('h2')).toContainText('Área de Administração');

    // Preenche credenciais do administrador inicial (Josué)
    await page.fill('input[type="email"]', 'josuefranciscojaime@gmail.com');
    await page.fill('input[type="password"]', 'AmaTec#2026!Golf2');
    await page.click('button[type="submit"]');

    // 2. Confirmação de Entrada no Painel
    await expect(page.locator('h1')).toContainText('Ama Tec — Painel de Controlo');
    await expect(page.locator('body')).toContainText('Josué Jaime');

    // 3. CRIAR novo serviço
    const testServiceName = `E2E Serviço Especial ${Date.now()}`;
    await page.click('button:has-text("Criar Novo Serviço")');

    // Preenche formulário modal de serviço
    await page.fill('input[placeholder*="Máquinas de Gelo"]', testServiceName);
    await page.fill('textarea[placeholder*="Diagnóstico detalhado"]', 'Resumo de teste automatizado para certificação E2E.');
    await page.fill('textarea[placeholder*="Detalhes completos"]', 'Descrição técnica completa de bancada executada no Golf 2.');
    await page.click('button:has-text("Criar e Publicar")');

    // 4. VERIFICAR publicação
    await expect(page.locator('body')).toContainText(testServiceName);

    // 5. EDITAR serviço criado
    const serviceCard = page.locator('div.bg-slate-950', { hasText: testServiceName }).first();
    await serviceCard.locator('button[title="Editar serviço"]').click();

    // Altera resumo curto
    const updatedDesc = 'Resumo editado com sucesso via teste E2E.';
    await page.fill('textarea[placeholder*="Diagnóstico detalhado"]', updatedDesc);
    await page.click('button:has-text("Atualizar Serviço")');

    // Verifica que foi atualizado
    await expect(page.locator('body')).toContainText(updatedDesc);

    // 6. ARQUIVAR serviço
    // Regista handler para o diálogo de confirmação do browser
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    const updatedCard = page.locator('div.bg-slate-950', { hasText: testServiceName }).first();
    await updatedCard.locator('button:has-text("Arquivar")').click();

    // Confirma estado arquivado
    await expect(page.locator('body')).toContainText('Arquivado');
  });
});

