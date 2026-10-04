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

    // Preenche credenciais do administrador inicial
    const e2eEmail = process.env.AMATEC_ADMIN_BOOTSTRAP_EMAIL || 'admin@amatec.ao';
    const e2ePassword = process.env.AMATEC_ADMIN_BOOTSTRAP_PASSWORD || 'E2ETestPassword16CharsMin!';
    await page.fill('input[type="email"]', e2eEmail);
    await page.fill('input[type="password"]', e2ePassword);
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

test.describe('Ama Tec — Menu de Navegação & Mega Menu de Serviços', () => {
  test('Desktop: Menu principal carrega estrutura completa e Mega Menu abre em 6 colunas', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const header = page.locator('header');
    await header.waitFor({ state: 'visible' });

    // Verifica todos os itens principais na ordem solicitada
    const desktopNav = header.locator('nav[aria-label="Navegação principal"]');
    await expect(desktopNav.locator('a:has-text("Início")')).toBeVisible();
    await expect(desktopNav.locator('a:has-text("Serviços")')).toBeVisible();
    await expect(desktopNav.locator('a:has-text("Equipamentos")')).toBeVisible();
    await expect(desktopNav.locator('a:has-text("Galeria")')).toBeVisible();
    await expect(desktopNav.locator('a:has-text("Sobre")')).toBeVisible();
    await expect(desktopNav.locator('a:has-text("Como Funciona")')).toBeVisible();
    await expect(desktopNav.locator('a:has-text("Contactos")')).toBeVisible();

    // Botão destacado "Solicitar Assistência" sempre visível
    const ctaButton = header.locator('a:has-text("Solicitar Assistência")');
    await expect(ctaButton).toBeVisible();

    // Abre o Mega Menu de Serviços
    const servicosTrigger = desktopNav.locator('button[aria-label="Expandir catálogo de serviços"]');
    await servicosTrigger.click();

    // Verifica presença do painel do mega menu e das 6 colunas
    const megaMenu = page.locator('div[role="region"][aria-label="Catálogo de Serviços em Colunas"]');
    await expect(megaMenu).toBeVisible();

    // Verifica cabeçalhos das 6 categorias com ícones
    await expect(megaMenu).toContainText('Doméstico');
    await expect(megaMenu).toContainText('Industrial e Comercial');
    await expect(megaMenu).toContainText('Elétrica');
    await expect(megaMenu).toContainText('Eletrónica');
    await expect(megaMenu).toContainText('Informática');
    await expect(megaMenu).toContainText('Manutenção');

    // Verifica itens técnicos dentro das colunas
    await expect(megaMenu.locator('a[href="/servicos/reparacao-de-televisores"]')).toBeVisible();
    await expect(megaMenu.locator('a[href="/servicos/reparacao-de-maquinas-de-lavar"]')).toBeVisible();
    await expect(megaMenu.locator('a[href="/servicos/cozinhas-industriais"]')).toBeVisible();
    await expect(megaMenu.locator('a[href="/servicos/reparacao-de-placas-eletronicas"]')).toBeVisible();

    // Verifica rodapé do mega menu: "Ver todos os serviços" e CTA WhatsApp
    await expect(megaMenu.locator('a[href="/servicos"]:has-text("Ver todos os serviços")')).toBeVisible();
    const notFoundWa = megaMenu.locator('a[href*="wa.me"]:has-text("Não encontrou o seu equipamento")');
    await expect(notFoundWa).toBeVisible();

    // Teste de acessibilidade por teclado: fechar com a tecla Escape
    await page.keyboard.press('Escape');
    await expect(megaMenu).not.toBeVisible();
  });

  test('Desktop: Navegação direta para página de serviço a partir do Mega Menu', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Abre mega menu e clica em Televisores
    await page.locator('header button[aria-label="Expandir catálogo de serviços"]').click();
    await page.locator('a[href="/servicos/reparacao-de-televisores"]').first().click();

    // Confirma chegada à página do serviço sem links partidos
    await page.waitForURL('**/servicos/reparacao-de-televisores');
    const h1 = page.locator('h1');
    await expect(h1).toContainText('Reparação de Televisores');
  });

  test('Mobile: Menu hambúrguer de ecrã inteiro, acordeão de serviços e alvos de toque ≥44px', async ({ page }) => {
    // Testa nas resoluções móveis chave: 360, 390 e 430
    const viewports = [
      { width: 360, height: 640, name: '360px' },
      { width: 390, height: 844, name: '390px' },
      { width: 430, height: 932, name: '430px' },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // Botão "Solicitar Assistência" sempre visível no cabeçalho
      const headerCta = page.locator('header a:has-text("Solicitar Assistência")');
      await expect(headerCta).toBeVisible();

      // Botão hambúrguer acessível
      const menuBtn = page.locator('header button[aria-label*="menu"]');
      await expect(menuBtn).toBeVisible();

      // Verifica altura mínima do alvo de toque (≥44px)
      const box = await menuBtn.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);

      // Abre menu mobile
      await menuBtn.click();
      const mobileDrawer = page.locator('div[role="dialog"][aria-label="Menu de Navegação Móvel"]');
      await expect(mobileDrawer).toBeVisible();

      // Verifica links principais no mobile
      await expect(mobileDrawer.locator('a:has-text("Início")')).toBeVisible();
      await expect(mobileDrawer.locator('a:has-text("Equipamentos")')).toBeVisible();
      await expect(mobileDrawer.locator('a:has-text("Galeria")')).toBeVisible();
      await expect(mobileDrawer.locator('a:has-text("Sobre")')).toBeVisible();
      await expect(mobileDrawer.locator('a:has-text("Como Funciona")')).toBeVisible();
      await expect(mobileDrawer.locator('a:has-text("Contactos")')).toBeVisible();

      // Verifica acordeão de Serviços
      const servicosAccordionBtn = mobileDrawer.locator('button:has-text("Serviços")');
      await expect(servicosAccordionBtn).toBeVisible();

      // Expande categoria "Industrial e Comercial"
      const industrialCatBtn = mobileDrawer.locator('button:has-text("Industrial e Comercial")');
      await industrialCatBtn.click();
      await expect(mobileDrawer.locator('a[href="/servicos/cozinhas-industriais"]')).toBeVisible();

      // Verifica que não existe scroll horizontal (responsividade estrita)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // Fecha o menu para a próxima iteração
      await page.locator('header button[aria-label*="Fechar"]').click();
      await expect(mobileDrawer).not.toBeVisible();
    }
  });

  test('Tablet: Responsividade sem overflow horizontal em 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Verifica ausência de scroll horizontal no tablet
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Header fixo visível
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});


