import type { IncomingMessage, ServerResponse } from 'http';
import leadHandler from './lead';
import adminApiHandler from './admin';
import publicApiHandler from './public';

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

  // 2. Submissão e gestão de Leads (/api/lead e /api/leads)
  if (pathname === '/api/lead' || pathname === '/api/leads' || pathname.startsWith('/api/leads/')) {
    return leadHandler(req, res);
  }

  // 3. Conteúdo público do site (/api/content, /api/settings, /api/services, etc.)
  return publicApiHandler(req, res);
}
