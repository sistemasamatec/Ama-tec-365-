import type { IncomingMessage, ServerResponse } from 'http';
import {
  authenticateAdmin,
  validateSessionToken,
  destroySession,
  changeAdminPassword,
  getAllServicesFromDb,
  saveServiceToDb,
  archiveServiceInDb,
  deleteServiceFromDb,
  getSettingsFromDb,
  updateSettingsInDb,
  saveUploadedLogo,
  revertLogo,
  getAllLeadsFromServer,
  updateLeadStatusOnServer,
  deleteLeadFromServer,
  exportLeadsToCsv,
  getAllEquipmentFromDb,
  saveEquipmentToDb,
  deleteEquipmentFromDb,
  getAllTestimonialsFromDb,
  saveTestimonialToDb,
  deleteTestimonialFromDb,
  getAuditLogsFromDb,
  createFullBackup,
  listBackups,
  getBackupContent,
  AdminSession,
} from '../src/lib/server-storage';
import { getVercelDeployStatus, triggerVercelRebuild } from '../src/lib/vercel-deploy';
import { getDatabaseEngineType } from '../src/lib/serverless-db';

/* Helper para envio de respostas JSON padronizadas */
function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

/* Helper para leitura assíncrona do corpo do pedido (JSON) */
async function readBody(req: IncomingMessage & { body?: any }): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(raw.trim() ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

/* Extração de Cookie de Sessão httpOnly */
export function getSessionFromRequest(req: IncomingMessage): AdminSession | null {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/amatec_admin_session=([^;]+)/);
  if (!match || !match[1]) return null;
  return validateSessionToken(match[1]);
}

/**
 * Roteador Principal para `/api/admin/*`
 */
export default async function adminApiHandler(
  req: IncomingMessage & { body?: any },
  res: ServerResponse
) {
  const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname.replace(/\/$/, '');
  const method = req.method || 'GET';
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';

  // 1. ENDPOINT: LOGIN
  if (pathname === '/api/admin/login' && method === 'POST') {
    try {
      const body = await readBody(req);
      const auth = authenticateAdmin(body.email, body.password, clientIp, userAgent);

      if (!auth.success || !auth.session) {
        return sendJson(res, 401, { error: auth.error || 'Credenciais inválidas.' });
      }

      // Define cookie httpOnly seguro com 7 dias de validade
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieFlags = [
        `amatec_admin_session=${auth.session.token}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        'Max-Age=604800',
      ];
      if (isProduction) cookieFlags.push('Secure');
      res.setHeader('Set-Cookie', cookieFlags.join('; '));

      return sendJson(res, 200, {
        success: true,
        user: {
          id: auth.user?.id,
          name: auth.user?.name,
          email: auth.user?.email,
          role: auth.user?.role,
        },
      });
    } catch {
      return sendJson(res, 400, { error: 'Dados de login inválidos.' });
    }
  }

  // 2. ENDPOINT: LOGOUT
  if (pathname === '/api/admin/logout' && method === 'POST') {
    const session = getSessionFromRequest(req);
    if (session) {
      destroySession(session.token);
    }
    res.setHeader(
      'Set-Cookie',
      'amatec_admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    );
    return sendJson(res, 200, { success: true });
  }

  // 3. ENDPOINT: VERIFICAÇÃO DE SESSÃO ATUAL (/api/admin/me)
  if (pathname === '/api/admin/me' && method === 'GET') {
    const session = getSessionFromRequest(req);
    if (!session) {
      return sendJson(res, 401, { authenticated: false, error: 'Sessão inválida ou expirada.' });
    }
    return sendJson(res, 200, {
      authenticated: true,
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
      },
    });
  }

  // --- A PARTIR DAQUI TODAS AS ROTAS REQUEREM SESSÃO VÁLIDA ---
  const session = getSessionFromRequest(req);
  if (!session) {
    return sendJson(res, 401, { error: 'Acesso restrito. Faça login na área administrativa.' });
  }

  // 4. ALTERAÇÃO DE PALAVRA-PASSE
  if (pathname === '/api/admin/change-password' && method === 'POST') {
    try {
      const body = await readBody(req);
      const result = changeAdminPassword(
        session.userId,
        body.currentPassword,
        body.newPassword,
        session.email,
        clientIp
      );
      if (!result.success) {
        return sendJson(res, 400, { error: result.error });
      }
      return sendJson(res, 200, { success: true, message: 'Palavra-passe atualizada com sucesso.' });
    } catch {
      return sendJson(res, 400, { error: 'Erro ao alterar palavra-passe.' });
    }
  }

  // 5. GESTÃO DE SERVIÇOS (CRUD)
  if (pathname === '/api/admin/services') {
    if (method === 'GET') {
      const services = getAllServicesFromDb();
      return sendJson(res, 200, services);
    }
    if (method === 'POST') {
      try {
        const body = await readBody(req);
        if (!body.name || !body.name.trim()) {
          return sendJson(res, 400, { error: 'O nome do serviço é obrigatório.' });
        }
        const saved = saveServiceToDb(body, session.email);
        triggerVercelRebuild(`Serviço criado: ${saved.name}`).catch(() => {});
        return sendJson(res, 201, saved);
      } catch {
        return sendJson(res, 400, { error: 'Erro ao criar serviço.' });
      }
    }
  }

  if (pathname.startsWith('/api/admin/services/')) {
    const id = pathname.replace('/api/admin/services/', '');
    if (method === 'PUT') {
      try {
        const body = await readBody(req);
        const saved = saveServiceToDb({ ...body, id }, session.email);
        triggerVercelRebuild(`Serviço atualizado: ${saved.name}`).catch(() => {});
        return sendJson(res, 200, saved);
      } catch {
        return sendJson(res, 400, { error: 'Erro ao atualizar serviço.' });
      }
    }
    if (method === 'PATCH' && urlObj.searchParams.get('action') === 'archive') {
      const archived = archiveServiceInDb(id, session.email);
      if (archived) {
        triggerVercelRebuild(`Serviço arquivado: ${id}`).catch(() => {});
      }
      return sendJson(res, archived ? 200 : 404, { success: archived });
    }
    if (method === 'DELETE') {
      const deleted = deleteServiceFromDb(id, session.email);
      if (deleted) {
        triggerVercelRebuild(`Serviço eliminado: ${id}`).catch(() => {});
      }
      return sendJson(res, deleted ? 200 : 404, { success: deleted });
    }
  }

  // 6. GESTÃO DE CONFIGURAÇÕES & IDENTIDADE VISUAL
  if (pathname === '/api/admin/settings') {
    if (method === 'GET') {
      const settings = getSettingsFromDb();
      return sendJson(res, 200, settings);
    }
    if (method === 'PUT') {
      try {
        const body = await readBody(req);
        const updated = updateSettingsInDb(body, session.email);
        return sendJson(res, 200, updated);
      } catch {
        return sendJson(res, 400, { error: 'Erro ao gravar configurações.' });
      }
    }
  }

  // 7. UPLOAD DE LOGOTIPO
  if (pathname === '/api/admin/upload-logo' && method === 'POST') {
    try {
      const body = await readBody(req);
      if (!body.data || !body.mimeType || !body.fileName) {
        return sendJson(res, 400, { error: 'Ficheiro de logotipo não fornecido.' });
      }
      const result = saveUploadedLogo(body.data, body.mimeType, body.fileName, session.email);
      if (!result.success) {
        return sendJson(res, 400, { error: result.error });
      }
      return sendJson(res, 200, result);
    } catch {
      return sendJson(res, 500, { error: 'Erro ao processar ficheiro de imagem.' });
    }
  }

  // 8. REVERSÃO DE LOGOTIPO
  if (pathname === '/api/admin/revert-logo' && method === 'POST') {
    try {
      const body = await readBody(req);
      if (!body.targetUrl) {
        return sendJson(res, 400, { error: 'URL do logotipo de destino não fornecido.' });
      }
      const reverted = revertLogo(body.targetUrl, session.email);
      return sendJson(res, 200, { success: reverted });
    } catch {
      return sendJson(res, 500, { error: 'Erro ao reverter logotipo.' });
    }
  }

  // 9. GESTÃO DE LEADS (PEDIDOS)
  if (pathname === '/api/admin/leads') {
    if (method === 'GET') {
      const leads = getAllLeadsFromServer();
      return sendJson(res, 200, leads);
    }
  }

  if (pathname === '/api/admin/leads/export-csv' && method === 'GET') {
    const csvData = exportLeadsToCsv();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="amatec-leads-${new Date().toISOString().split('T')[0]}.csv"`
    );
    return res.end(csvData);
  }

  if (pathname.startsWith('/api/admin/leads/')) {
    const id = pathname.replace('/api/admin/leads/', '');
    if (method === 'PATCH') {
      try {
        const body = await readBody(req);
        const updated = updateLeadStatusOnServer(id, body.status, body.notes);
        return sendJson(res, updated ? 200 : 404, { success: updated });
      } catch {
        return sendJson(res, 400, { error: 'Erro ao atualizar pedido.' });
      }
    }
    if (method === 'DELETE') {
      const deleted = deleteLeadFromServer(id);
      return sendJson(res, deleted ? 200 : 404, { success: deleted });
    }
  }

  // 10. GESTÃO DE EQUIPAMENTOS
  if (pathname === '/api/admin/equipment') {
    if (method === 'GET') {
      return sendJson(res, 200, getAllEquipmentFromDb());
    }
    if (method === 'POST') {
      try {
        const body = await readBody(req);
        const saved = saveEquipmentToDb(body, session.email);
        return sendJson(res, 201, saved);
      } catch {
        return sendJson(res, 400, { error: 'Erro ao guardar equipamento.' });
      }
    }
  }

  if (pathname.startsWith('/api/admin/equipment/') && method === 'DELETE') {
    const id = pathname.replace('/api/admin/equipment/', '');
    const deleted = deleteEquipmentFromDb(id, session.email);
    return sendJson(res, deleted ? 200 : 404, { success: deleted });
  }

  // 11. GESTÃO DE DEPOIMENTOS
  if (pathname === '/api/admin/testimonials') {
    if (method === 'GET') {
      return sendJson(res, 200, getAllTestimonialsFromDb());
    }
    if (method === 'POST') {
      try {
        const body = await readBody(req);
        if (!body.name || !body.text) {
          return sendJson(res, 400, { error: 'Nome e texto do depoimento são obrigatórios.' });
        }
        const saved = saveTestimonialToDb(body, session.email);
        return sendJson(res, 201, saved);
      } catch {
        return sendJson(res, 400, { error: 'Erro ao guardar depoimento.' });
      }
    }
  }

  if (pathname.startsWith('/api/admin/testimonials/') && method === 'DELETE') {
    const id = pathname.replace('/api/admin/testimonials/', '');
    const deleted = deleteTestimonialFromDb(id, session.email);
    return sendJson(res, deleted ? 200 : 404, { success: deleted });
  }

  // 12. AUDITORIA E BACKUPS
  if (pathname === '/api/admin/audit' && method === 'GET') {
    return sendJson(res, 200, getAuditLogsFromDb(200));
  }

  if (pathname === '/api/admin/backups') {
    if (method === 'GET') {
      return sendJson(res, 200, listBackups());
    }
    if (method === 'POST') {
      const backup = createFullBackup(session.email);
      return sendJson(res, 201, backup);
    }
  }

  if (pathname.startsWith('/api/admin/backups/') && method === 'GET') {
    const filename = pathname.replace('/api/admin/backups/', '');
    const content = getBackupContent(filename);
    if (!content) {
      return sendJson(res, 404, { error: 'Ficheiro de cópia de segurança não encontrado.' });
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.end(content);
  }

  // 13. ESTADO DE DEPLOY & SERVERLESS DA VERCEL
  if (pathname === '/api/admin/deploy-status' && method === 'GET') {
    const deployStatus = getVercelDeployStatus();
    const dbEngine = getDatabaseEngineType();
    return sendJson(res, 200, {
      ...deployStatus,
      dbEngine,
      prerenderOnBuild: true,
      staticRoutesCount: 30,
    });
  }

  if (pathname === '/api/admin/trigger-rebuild' && method === 'POST') {
    const result = await triggerVercelRebuild('Rebuild manual solicitado pelo administrador');
    return sendJson(res, result.triggered ? 200 : 400, result);
  }

  // Rota não reconhecida
  return sendJson(res, 404, { error: 'Rota de administração não encontrada.' });
}
