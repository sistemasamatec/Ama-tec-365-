import fs from 'fs';
import path from 'path';
import { SERVICES } from '../src/content/services';
import { EQUIPMENT_CATALOG } from '../src/content/equipment';
import { COMPANY } from '../src/content/company';
import { getServiceJsonLd, getFAQJsonLd, getBreadcrumbJsonLd, getLocalBusinessJsonLd } from '../src/lib/seo';
import { renderRoute } from '../src/prerender-entry';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

interface RouteMeta {
  url: string;
  title: string;
  description: string;
  jsonLd?: object[];
}

function buildRoutesList(): RouteMeta[] {
  const routes: RouteMeta[] = [
    {
      url: '/',
      title: 'Ama Tec — Assistência Técnica de Equipamentos Eletrónicos em Luanda',
      description: 'Oficina especializada em reparação de televisores, máquinas de lavar, eletrodomésticos e eletrónica industrial no Golf 2, Luanda. Orçamentos transparentes e garantia por escrito.',
      jsonLd: [getLocalBusinessJsonLd()],
    },
    {
      url: '/servicos',
      title: 'Catálogo de Serviços Técnicos | Ama Tec Luanda',
      description: 'Conheça todos os serviços de assistência técnica da Ama Tec: televisores, eletrodomésticos, frio, climatização e placas eletrónicas no Golf 2.',
      jsonLd: [
        getLocalBusinessJsonLd(),
        getBreadcrumbJsonLd([
          { name: 'Início', url: '/' },
          { name: 'Serviços', url: '/servicos' },
        ]),
      ],
    },
    {
      url: '/equipamentos',
      title: 'Catálogo de Equipamentos e Marcas Atendidas | Ama Tec',
      description: 'Consulte os equipamentos que reparamos habitualmente: Samsung, LG, Philips, Midea, Bosch e equipamentos industriais.',
      jsonLd: [
        getBreadcrumbJsonLd([
          { name: 'Início', url: '/' },
          { name: 'Equipamentos', url: '/equipamentos' },
        ]),
      ],
    },
    {
      url: '/sobre',
      title: 'Sobre a Ama Tec — Oficina Técnica Especializada no Golf 2',
      description: 'Conheça a história, compromisso de transparência e infraestrutura técnica da oficina Ama Tec em Luanda, Angola.',
      jsonLd: [
        getLocalBusinessJsonLd(),
        getBreadcrumbJsonLd([
          { name: 'Início', url: '/' },
          { name: 'Sobre', url: '/sobre' },
        ]),
      ],
    },
    {
      url: '/como-funciona',
      title: 'Como Funciona a Assistência Técnica | Ama Tec',
      description: 'Entenda o nosso fluxo de atendimento em 4 passos: contacto, triagem e orçamento, reparação em bancada e testes com garantia oficial.',
      jsonLd: [
        getBreadcrumbJsonLd([
          { name: 'Início', url: '/' },
          { name: 'Como Funciona', url: '/como-funciona' },
        ]),
      ],
    },
    {
      url: '/contactos',
      title: 'Contactos e Localização da Oficina no Golf 2 | Ama Tec',
      description: 'Localização, telefone +244 930 372 597, WhatsApp e direções para a oficina técnica da Ama Tec no Golf 2, Luanda.',
      jsonLd: [
        getLocalBusinessJsonLd(),
        getBreadcrumbJsonLd([
          { name: 'Início', url: '/' },
          { name: 'Contactos', url: '/contactos' },
        ]),
      ],
    },
    {
      url: '/solicitar-assistencia',
      title: 'Solicitar Assistência Técnica Online | Ama Tec Luanda',
      description: 'Preencha o formulário rápido para agendar triagem técnica ou reparação do seu televisor ou eletrodoméstico na oficina da Ama Tec.',
      jsonLd: [
        getBreadcrumbJsonLd([
          { name: 'Início', url: '/' },
          { name: 'Solicitar Assistência', url: '/solicitar-assistencia' },
        ]),
      ],
    },
    {
      url: '/faq',
      title: 'Perguntas Frequentes (FAQ) | Ama Tec Luanda',
      description: 'Respostas a dúvidas comuns sobre prazos médios de diagnóstico, garantia oficial de 90 dias por escrito, formas de pagamento aceites e localização da oficina no Golf 2.',
      jsonLd: [
        getBreadcrumbJsonLd([
          { name: 'Início', url: '/' },
          { name: 'Perguntas Frequentes', url: '/faq' },
        ]),
      ],
    },
    {
      url: '/galeria',
      title: 'Galeria e Bancadas de Diagnóstico | Ama Tec Luanda',
      description: 'Conheça o espaço físico, instrumentação de teste e processos de bancada da oficina da Ama Tec no Golf 2.',
    },
    {
      url: '/privacidade',
      title: 'Política de Privacidade e Proteção de Dados | Ama Tec',
      description: 'Informações sobre tratamento transparente de dados de acordo com a Lei de Proteção de Dados de Angola (Lei n.º 22/11).',
    },
    {
      url: '/cookies',
      title: 'Política de Cookies | Ama Tec',
      description: 'Esclarecimento sobre a utilização mínima de cookies técnicos e analíticos estritamente consentidos.',
    },
    {
      url: '/404',
      title: 'Página Não Encontrada (404) | Ama Tec',
      description: 'A página procurada não existe ou foi movida. Consulte os nossos serviços ou contacte a oficina Ama Tec.',
    },
  ];

  // Adicionar todas as 10 páginas de serviço
  for (const service of SERVICES) {
    const serviceJsonLds: object[] = [
      getServiceJsonLd(service),
      getBreadcrumbJsonLd([
        { name: 'Início', url: '/' },
        { name: 'Serviços', url: '/servicos' },
        { name: service.name, url: `/servicos/${service.slug}` },
      ]),
    ];
    const faqLd = getFAQJsonLd(service.faqs);
    if (faqLd) {
      serviceJsonLds.push(faqLd);
    }

    routes.push({
      url: `/servicos/${service.slug}`,
      title: `${service.name} em Luanda | Ama Tec Oficina Golf 2`,
      description: service.shortDescription,
      jsonLd: serviceJsonLds,
    });
  }

  // Adicionar todas as páginas de equipamentos
  for (const item of EQUIPMENT_CATALOG) {
    routes.push({
      url: `/equipamentos/${item.category}/${item.slug}`,
      title: `${item.name} — Assistência Técnica Oficial | Ama Tec`,
      description: item.description,
      jsonLd: [
        getBreadcrumbJsonLd([
          { name: 'Início', url: '/' },
          { name: 'Equipamentos', url: '/equipamentos' },
          { name: item.name, url: `/equipamentos/${item.category}/${item.slug}` },
        ]),
      ],
    });
  }

  return routes;
}

export async function prerenderAllRoutes() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`[Prerender] Erro: Ficheiro template ${TEMPLATE_PATH} não encontrado. Execute 'vite build' primeiro.`);
    process.exit(1);
  }

  const templateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const routes = buildRoutesList();

  console.log(`\n🚀 Iniciando Pré-renderização Estática (SSG) de ${routes.length} rotas para SEO e crawlers...`);

  let renderedCount = 0;

  for (const routeMeta of routes) {
    try {
      // 1. Renderiza o DOM completo em HTML estático
      const bodyHtml = renderRoute(routeMeta.url);

      // 2. Personaliza o cabeçalho HTML com metatags únicas e Schema.org
      let pageHtml = templateHtml;

      // Injeta o conteúdo no elemento #root
      pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);

      // Atualiza Title
      pageHtml = pageHtml.replace(/<title>.*?<\/title>/, `<title>${routeMeta.title}</title>`);

      // Atualiza Meta Description
      pageHtml = pageHtml.replace(
        /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
        `<meta name="description" content="${routeMeta.description.replace(/"/g, '&quot;')}" />`
      );

      // Atualiza Canonical
      const canonicalUrl = `${COMPANY.siteUrl}${routeMeta.url === '/' ? '' : routeMeta.url}`;
      pageHtml = pageHtml.replace(
        /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
        `<link rel="canonical" href="${canonicalUrl}" />`
      );

      // Atualiza OpenGraph Title & Description
      pageHtml = pageHtml.replace(
        /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
        `<meta property="og:title" content="${routeMeta.title.replace(/"/g, '&quot;')}" />`
      );
      pageHtml = pageHtml.replace(
        /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
        `<meta property="og:description" content="${routeMeta.description.replace(/"/g, '&quot;')}" />`
      );

      // Injeta Scripts JSON-LD
      if (routeMeta.jsonLd && routeMeta.jsonLd.length > 0) {
        const jsonLdScripts = routeMeta.jsonLd
          .map((data) => `  <script type="application/ld+json">${JSON.stringify(data)}</script>`)
          .join('\n');
        pageHtml = pageHtml.replace('</head>', `${jsonLdScripts}\n  </head>`);
      }

      // 3. Grava o ficheiro estático correspondente na pasta dist
      if (routeMeta.url === '/') {
        fs.writeFileSync(path.join(DIST_DIR, 'index.html'), pageHtml, 'utf-8');
      } else if (routeMeta.url === '/404') {
        fs.writeFileSync(path.join(DIST_DIR, '404.html'), pageHtml, 'utf-8');
      } else {
        // Ex: /servicos/reparacao-de-televisores -> dist/servicos/reparacao-de-televisores/index.html
        const relativePath = routeMeta.url.replace(/^\//, '');
        const targetDir = path.join(DIST_DIR, relativePath);
        fs.mkdirSync(targetDir, { recursive: true });
        fs.writeFileSync(path.join(targetDir, 'index.html'), pageHtml, 'utf-8');
      }

      renderedCount++;
    } catch (err) {
      console.error(`[Prerender] Erro ao renderizar rota '${routeMeta.url}':`, err);
    }
  }

  console.log(`✅ Pré-renderização SSG concluída: ${renderedCount}/${routes.length} ficheiros HTML completos gerados em dist/`);
}

// Execução direta via tsx
if (import.meta.url === `file://${process.argv[1]}`) {
  prerenderAllRoutes().catch((err) => {
    console.error('[Prerender] Erro fatal:', err);
    process.exit(1);
  });
}
