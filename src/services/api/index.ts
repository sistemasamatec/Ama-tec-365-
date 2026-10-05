import type { IncomingMessage, ServerResponse } from 'http';
import leadHandler from './lead.js';
import adminApiHandler from './admin.js';
import publicApiHandler from './public.js';
import amaTec365Handler from './amatec365.js';

export default async function apiDispatcher(
  req: IncomingMessage & { body?: any },
  res: ServerResponse
) {
  const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  if (pathname.startsWith('/api/admin')) {
    return adminApiHandler(req, res);
  }

  if (pathname.startsWith('/api/amatec365')) {
    return amaTec365Handler(req, res);
  }

  if (pathname === '/api/lead' || pathname === '/api/leads' || pathname.startsWith('/api/leads/')) {
    return leadHandler(req, res);
  }

  return publicApiHandler(req, res);
}
