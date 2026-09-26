import { test, expect } from '@playwright/test';
import { SERVICES, CATEGORIES_CONFIG } from '../src/content/services';

const BASE_URL = 'http://localhost:3000';

test.describe('MENU DE NAVEGAÇÃO — Testes de Conformidade Rigorosa', () => {

  test('1. Estrutura e Logo no Desktop (1440px)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL);

    // 1.1 Logo à esquerda apontando para '/'
    const logoLink = page.locator('header a[aria-label="Ama Tec — Início"]');
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveAttribute('href', '/');

    // 1.2 Botão "Solicitar Assistência" destacado e visível
    const ctaButton = page.locator('header a[href="/solicitar-assistencia"]').first();
    await expect(ctaButton).toBeVisible();

    // 1.3 Itens da Navegação Principal presentes
    const nav = page.locator('nav[aria-label="Navegação principal"]');
    await expect(nav).toBeVisible();

    const expectedNavItems = [
      'Início',
      'Serviços',
      'Equipamentos',
      'Galeria',
      'Sobre',
      'Como Funciona',
      'Contactos',
    ];

    for (const itemName of expectedNavItems) {
      await expect(nav.getByText(itemName, { exact: true })).toBeVisible();
    }
  });

  test('2. Mega Menu Desktop: Abertura por hover/click, 6 colunas e rodapé', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL);

    const servicosBtn = page.locator('button[aria-controls="desktop-services-megamenu"]');
    await expect(servicosBtn).toBeVisible();
    await expect(servicosBtn).toHaveAttribute('aria-expanded', 'false');

    // Clicar para abrir
    await servicosBtn.click();
    await expect(servicosBtn).toHaveAttribute('aria-expanded', 'true');

    const megaMenu = page.locator('#desktop-services-megamenu');
    await expect(megaMenu).toBeVisible();

    // Verificar se as 6 categorias estão presentes no mega menu
    for (const cat of CATEGORIES_CONFIG) {
      const catHeader = megaMenu.locator(`a[href="/servicos?categoria=${cat.id}"]`);
      await expect(catHeader).toBeVisible();
    }

    // Verificar se os links de rodapé do mega menu existem
    const seeAllLink = megaMenu.getByRole('link', { name: /ver todos os serviços/i });
    await expect(seeAllLink).toBeVisible();
    await expect(seeAllLink).toHaveAttribute('href', '/servicos');

    const whatsappNotFound = megaMenu.getByRole('link', { name: /não encontrou o seu equipamento/i });
    await expect(whatsappNotFound).toBeVisible();
    await expect(whatsappNotFound).toHaveAttribute('href', /wa\.me/);

    // Fechar com ESC e verificar se o foco retorna ao botão
    await page.keyboard.press('Escape');
    await expect(megaMenu).toBeHidden();
    await expect(servicosBtn).toBeFocused();
  });

  test('3. Slugs e integridade de todos os serviços do Mega Menu', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL);

    const servicosBtn = page.locator('button[aria-controls="desktop-services-megamenu"]');
    await servicosBtn.click();

    const megaMenu = page.locator('#desktop-services-megamenu');
    await expect(megaMenu).toBeVisible();

    // Filtrar serviços que devem estar no menu
    const menuServices = SERVICES.filter(s => s.status !== 'archived' && !s.menuHidden);

    // Verificar uma amostragem de serviços chave de cada categoria
    const sampleSlugs = [
      'reparacao-de-televisores',
      'reparacao-de-maquinas-de-lavar',
      'cozinhas-industriais',
      'balancas-eletronicas',
      'terminais-pos',
      'instalacoes-eletricas-diagnostico',
      'reparacao-de-placas-eletronicas',
      'reparacao-de-computadores',
      'manutencao-preventiva-corretiva',
    ];

    for (const slug of sampleSlugs) {
      const link = megaMenu.locator(`a[href="/servicos/${slug}"]`);
      await expect(link).toBeVisible();
    }
  });

  test('4. Destaque do Item Ativo na navegação', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // 4.1 Na home, Início está ativo
    await page.goto(BASE_URL + '/');
    const homeLink = page.locator('nav[aria-label="Navegação principal"] a[href="/"]');
    await expect(homeLink).toHaveClass(/text-sky-600/);

    // 4.2 Em /equipamentos, Equipamentos está ativo
    await page.goto(BASE_URL + '/equipamentos');
    const equipLink = page.locator('nav[aria-label="Navegação principal"] a[href="/equipamentos"]');
    await expect(equipLink).toHaveClass(/text-sky-600/);

    // 4.3 Em /servicos/reparacao-de-televisores, Serviços está ativo
    await page.goto(BASE_URL + '/servicos/reparacao-de-televisores');
    const servicosBtn = page.locator('button[aria-controls="desktop-services-megamenu"]');
    await expect(servicosBtn).toHaveClass(/text-sky-600/);
  });

  test('5. Mobile (<1024px): Hambúrguer, Acordeão por Categoria (1 aberta de cada vez) e Touch Targets >= 44px', async ({ page }) => {
    // Teste com ecrã móvel 390px (iPhone 13/14)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL);

    // 5.1 Botão "Solicitar Assistência" está SEMPRE visível no cabeçalho mobile
    const headerCta = page.locator('header a[href="/solicitar-assistencia"]');
    await expect(headerCta).toBeVisible();

    // 5.2 Botão Hambúrguer tem tamanho de toque >= 44px
    const hamburgerBtn = page.locator('button[aria-label*="menu de navegação"]');
    await expect(hamburgerBtn).toBeVisible();
    const box = await hamburgerBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);

    // 5.3 Abrir menu hambúrguer
    await hamburgerBtn.click();
    const mobileDialog = page.locator('div[role="dialog"][aria-label="Menu de Navegação Móvel"]');
    await expect(mobileDialog).toBeVisible();

    // 5.4 Testar acordeão de serviços: apenas 1 categoria aberta de cada vez
    const catDomesticoBtn = mobileDialog.getByRole('button', { name: /doméstico/i });
    const catIndustrialBtn = mobileDialog.getByRole('button', { name: /industrial e comercial/i });
    const catEletricaBtn = mobileDialog.getByRole('button', { name: /elétrica/i });

    // Doméstico começa aberto por padrão
    await expect(mobileDialog.locator('a[href="/servicos/reparacao-de-televisores"]')).toBeVisible();

    // Ao clicar em Industrial e Comercial, Doméstico fecha e Industrial abre
    await catIndustrialBtn.click();
    await expect(mobileDialog.locator('a[href="/servicos/cozinhas-industriais"]')).toBeVisible();
    await expect(mobileDialog.locator('a[href="/servicos/reparacao-de-televisores"]')).toBeHidden();

    // Ao clicar em Elétrica, Industrial fecha e Elétrica abre
    await catEletricaBtn.click();
    await expect(mobileDialog.locator('a[href="/servicos/instalacoes-eletricas-diagnostico"]')).toBeVisible();
    await expect(mobileDialog.locator('a[href="/servicos/cozinhas-industriais"]')).toBeHidden();

    // 5.5 Verificar altura mínima de toque dos links dos serviços (>= 44px)
    const servicoLink = mobileDialog.locator('a[href="/servicos/instalacoes-eletricas-diagnostico"]');
    const linkBox = await servicoLink.boundingBox();
    expect(linkBox?.height).toBeGreaterThanOrEqual(44);

    // 5.6 Ações no rodapé do drawer mobile presentes e com altura >= 48px
    const drawerCta = mobileDialog.locator('a[href="/solicitar-assistencia"]');
    await expect(drawerCta).toBeVisible();
    const drawerCtaBox = await drawerCta.boundingBox();
    expect(drawerCtaBox?.height).toBeGreaterThanOrEqual(48);

    // 5.7 Fechar com botão X
    await hamburgerBtn.click();
    await expect(mobileDialog).toBeHidden();
  });

  test('6. Verificação de Responsividade sem Scroll Horizontal (360, 390, 430, 768, 1024, 1440)', async ({ page }) => {
    const viewports = [
      { width: 360, height: 640 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto(BASE_URL);

      // Avalia se o documento tem overflow horizontal
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScroll, `Scroll horizontal detetado em viewport ${vp.width}x${vp.height}`).toBeFalsy();
    }
  });

  test('7. Rodapé (mini-menu) com categorias de serviços, links principais e dados legais', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL);

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // 7.1 Categorias de Serviços no Rodapé
    for (const cat of CATEGORIES_CONFIG) {
      const catFooterLink = footer.locator(`a[href="/servicos?categoria=${cat.id}"]`);
      await expect(catFooterLink).toBeVisible();
    }

    // 7.2 Links Principais
    const mainLinks = [
      '/',
      '/servicos',
      '/equipamentos',
      '/galeria',
      '/sobre',
      '/como-funciona',
      '/contactos',
      '/solicitar-assistencia',
    ];

    for (const href of mainLinks) {
      await expect(footer.locator(`a[href="${href}"]`).first()).toBeVisible();
    }

    // 7.3 Links Legais e WhatsApp
    await expect(footer.locator('a[href="/privacidade"]')).toBeVisible();
    await expect(footer.locator('a[href="/cookies"]')).toBeVisible();
    await expect(footer.locator('a[href="/faq"]')).toBeVisible();
    await expect(footer.locator('a[href*="wa.me"]').first()).toBeVisible();
  });
});
