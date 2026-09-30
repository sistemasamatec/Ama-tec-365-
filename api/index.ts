import type { IncomingMessage, ServerResponse } from 'http';
import leadHandler from './lead';
import adminApiHandler from './admin';
import publicApiHandler from './public';
import amaTec365Handler from './amatec365';

export default async function apiDispatcher(
  req: IncomingMessage & { body?: any },
  res: ServerResponse
) {
  const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // 1. Rotas de Administração (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    return adminApiHandler(req, res);
  }

  // 2. Integração com Ama Tec 365 (/api/amatec365/*)
  if (pathname.startsWith('/api/amatec365')) {
    return amaTec365Handler(req, res);
  }

  // 3. Submissão e gestão de Leads (/api/lead e /api/leads)
  if (pathname === '/api/lead' || pathname === '/api/leads' || pathname.startsWith('/api/leads/')) {
    return leadHandler(req, res);
  }

  // 4. Conteúdo público do site (/api/content, /api/settings, /api/services, etc.)
  return publicApiHandler(req, res);
}
