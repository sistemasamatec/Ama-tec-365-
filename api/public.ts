import type { IncomingMessage, ServerResponse } from 'http';
import {
  getPublicServicesFromDb,
  getServiceBySlugFromDb,
  getSettingsFromDb,
  getAllTestimonialsFromDb,
  getAllEquipmentFromDb,
} from '../src/lib/server-storage.js';

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
  res.end(JSON.stringify(data));
}

/**
 * Endpoints públicos do site da Ama Tec
 * Permite que a interface pública leia os dados atualizados a partir da base de dados central
 */
export default async function publicApiHandler(
  req: IncomingMessage,
  res: ServerResponse
) {
  const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname.replace(/\/$/, '');

  // 1. Configurações gerais (identidade visual, cores, redes sociais, horário, mapa)
  if (pathname === '/api/public/settings' || pathname === '/api/settings') {
    const settings = getSettingsFromDb();
    // Omite dados sensíveis se houver
    return sendJson(res, 200, {
      company: settings.company,
      visualIdentity: {
        logoUrl: settings.visualIdentity.logoUrl,
        brandColor: settings.visualIdentity.brandColor,
      },
      socialLinks: settings.socialLinks,
      googleMaps: settings.googleMaps,
      businessHours: settings.businessHours,
      googleReviewsUrl: settings.googleReviewsUrl,
      maintenanceMode: settings.maintenanceMode,
    });
  }

  // 2. Serviços Públicos (Apenas publicados)
  if (pathname === '/api/public/services' || pathname === '/api/services') {
    const services = getPublicServicesFromDb();
    return sendJson(res, 200, services);
  }

  // 3. Serviço por Slug
  if (pathname.startsWith('/api/public/services/')) {
    const slug = pathname.replace('/api/public/services/', '');
    const service = getServiceBySlugFromDb(slug);
    if (!service || service.status === 'archived') {
      return sendJson(res, 404, { error: 'Serviço não encontrado.' });
    }
    return sendJson(res, 200, service);
  }

  // 4. Depoimentos Verificados
  if (pathname === '/api/public/testimonials' || pathname === '/api/testimonials') {
    const testimonials = getAllTestimonialsFromDb();
    return sendJson(res, 200, testimonials);
  }

  // 5. Catálogo de Equipamentos
  if (pathname === '/api/public/equipment') {
    const equipment = getAllEquipmentFromDb();
    return sendJson(res, 200, equipment);
  }

  // 6. Pacote Completo de Inicialização (Batch Content) para arranque ultrarrápido
  if (pathname === '/api/public/content' || pathname === '/api/content') {
    const settings = getSettingsFromDb();
    const services = getPublicServicesFromDb();
    const testimonials = getAllTestimonialsFromDb();
    const equipment = getAllEquipmentFromDb();

    return sendJson(res, 200, {
      settings: {
        company: settings.company,
        visualIdentity: {
          logoUrl: settings.visualIdentity.logoUrl,
          brandColor: settings.visualIdentity.brandColor,
        },
        socialLinks: settings.socialLinks,
        googleMaps: settings.googleMaps,
        businessHours: settings.businessHours,
        googleReviewsUrl: settings.googleReviewsUrl,
        maintenanceMode: settings.maintenanceMode,
      },
      services,
      testimonials,
      equipment,
    });
  }

  sendJson(res, 404, { error: 'Endpoint público não encontrado.' });
}
