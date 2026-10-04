/**
 * ERP Ama Tec 365 (Bukulo Geste) — Proxy Seguro Server-Side de Pedidos
 * 
 * Mapeamento Exato para Coleção "bookings":
 * - clientName: name
 * - clientPhone: cleanPhone
 * - clientWhatsapp: cleanPhone (idêntico ao telefone)
 * - clientEmail: email || ''
 * - deviceType: equipment / deviceType
 * - deviceBrand: brand / deviceBrand || ''
 * - deviceModel: model / deviceModel || ''
 * - serviceType: serviceType || 'Reparação'
 * - deviceProblem: problem / deviceProblem
 * - description: resumo descritivo (deviceProblem)
 * - locationType: 'residence' (default do formulário público)
 * - address: location / address || ''
 * - scheduledDate: scheduledDate || null
 * - status: 'pendente'
 * - source: 'site'
 * - channel: 'site'
 * - createdAt: ISO 8601 timestamp
 * - bookingNumber: docRef.id (Document ID real do Firestore)
 */

import type { IncomingMessage, ServerResponse } from 'http';
import 'dotenv/config';
import { getFirestoreDb, disableFirestoreOnAuthError } from '../src/lib/serverless-db';
import { getErpFirebaseConfig, getErpFirestoreDb } from '../src/lib/erp-firebase';

// ============================================================================
// GESTÃO DE IDEMPOTÊNCIA & RATE LIMITING NO FIRESTORE DO SITE (NÃO NO ERP)
// ============================================================================

interface IdempotencyRecord {
  status: number;
  data: any;
  expiresAt: number;
}

interface RateLimitRecord {
  count: number;
  lastTime: number;
  expiresAt: number;
}

const memoryIdempotency = new Map<string, IdempotencyRecord>();
const memoryRateLimits = new Map<string, RateLimitRecord>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of memoryIdempotency.entries()) {
    if (now > val.expiresAt) memoryIdempotency.delete(key);
  }
  for (const [key, val] of memoryRateLimits.entries()) {
    if (now > val.expiresAt) memoryRateLimits.delete(key);
  }
}, 3600000).unref?.();

/**
 * Consulta registo de idempotência no Firestore do SITE (ou memória se site sem Firestore)
 */
async function getIdempotencyRecord(key: string): Promise<IdempotencyRecord | null> {
  const now = Date.now();
  const siteDb = getFirestoreDb(); // Firestore do SITE

  if (siteDb) {
    try {
      const doc = await siteDb.collection('_idempotency').doc(key).get();
      if (doc.exists) {
        const d = doc.data() as any;
        if (d && d.expiresAt > now) {
          const rec: IdempotencyRecord = { status: d.status, data: d.data, expiresAt: d.expiresAt };
          memoryIdempotency.set(key, rec);
          return rec;
        }
      }
    } catch (err: any) {
      disableFirestoreOnAuthError(err);
      if (err?.code !== 7 && err?.code !== 16 && !err?.message?.includes('PERMISSION_DENIED')) {
        console.warn('[Site Firestore] Leitura em _idempotency falhou, fallback em memória:', err?.message || err);
      }
    }
  }

  const mem = memoryIdempotency.get(key);
  if (mem) {
    if (now < mem.expiresAt) return mem;
    memoryIdempotency.delete(key);
  }
  return null;
}

/**
 * Persiste registo de idempotência no Firestore do SITE (TTL de 24h)
 */
async function saveIdempotencyRecord(key: string, status: number, data: any): Promise<void> {
  const expiresAt = Date.now() + 86400000;
  const record: IdempotencyRecord = { status, data, expiresAt };
  memoryIdempotency.set(key, record);

  const siteDb = getFirestoreDb(); // Firestore do SITE
  if (siteDb) {
    try {
      await siteDb.collection('_idempotency').doc(key).set({
        key,
        status,
        data,
        expiresAt,
        ttl: new Date(expiresAt),
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      disableFirestoreOnAuthError(err);
      if (err?.code !== 7 && err?.code !== 16 && !err?.message?.includes('PERMISSION_DENIED')) {
        console.warn('[Site Firestore] Gravação em _idempotency falhou:', err?.message || err);
      }
    }
  }
}

/**
 * Verificação e incremento de Rate Limit no Firestore do SITE (transação atómica com TTL)
 */
async function checkIpRateLimit(clientIp: string): Promise<{ allowed: boolean; message?: string }> {
  const now = Date.now();
  const safeIp = clientIp.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const docKey = `rl_${safeIp}`;

  const siteDb = getFirestoreDb(); // Firestore do SITE
  if (siteDb) {
    try {
      const docRef = siteDb.collection('_rate_limits').doc(docKey);
      const result = await siteDb.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        const data = doc.data() as RateLimitRecord | undefined;

        if (!doc.exists || !data || now > data.expiresAt) {
          const newRecord: RateLimitRecord = {
            count: 1,
            lastTime: now,
            expiresAt: now + 600000,
          };
          transaction.set(docRef, {
            ip: clientIp,
            ...newRecord,
            ttl: new Date(newRecord.expiresAt),
            updatedAt: new Date().toISOString(),
          });
          return { allowed: true };
        }

        if (now - data.lastTime < 2500) {
          return { allowed: false, message: 'Demasiadas tentativas seguidas. Aguarde alguns segundos.' };
        }

        if (data.count >= 5) {
          return { allowed: false, message: 'Limite de submissões excedido para este IP. Por favor aguarde 10 minutos.' };
        }

        transaction.update(docRef, {
          count: data.count + 1,
          lastTime: now,
          updatedAt: new Date().toISOString(),
        });
        return { allowed: true };
      });
      return result;
    } catch (err: any) {
      disableFirestoreOnAuthError(err);
      if (err?.code !== 7 && err?.code !== 16 && !err?.message?.includes('PERMISSION_DENIED')) {
        console.warn('[Site Firestore] Rate limit falhou, fallback em memória:', err?.message || err);
      }
    }
  }

  const record = memoryRateLimits.get(safeIp) || { count: 0, lastTime: 0, expiresAt: now + 600000 };

  if (now - record.lastTime < 2500) {
    return { allowed: false, message: 'Demasiadas tentativas seguidas. Aguarde alguns segundos.' };
  }

  if (now > record.expiresAt) {
    record.count = 0;
    record.expiresAt = now + 600000;
  }

  record.count += 1;
  record.lastTime = now;
  memoryRateLimits.set(safeIp, record);

  if (record.count > 5) {
    return {
      allowed: false,
      message: 'Limite de submissões excedido para este IP. Por favor aguarde 10 minutos.',
    };
  }

  return { allowed: true };
}

function parseRequestBody(req: IncomingMessage & { body?: any }): Promise<any> {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res: ServerResponse, status: number, data: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

/**
 * Extrai o IP do cliente confiando APENAS nos cabeçalhos reais do proxy da plataforma.
 * Ignora cf-connecting-ip, true-client-ip e x-forwarded-for vindos do cliente.
 */
export function getTrustedClientIp(req: IncomingMessage): string {
  // 1. Vercel real proxy header
  const vercelForwarded = req.headers['x-vercel-forwarded-for'];
  if (vercelForwarded && typeof vercelForwarded === 'string') {
    const firstIp = vercelForwarded.split(',')[0]?.trim();
    if (firstIp && /^[0-9a-fA-F:.]+$/.test(firstIp)) {
      return firstIp;
    }
  }

  // 2. Real IP do proxy reverso de infraestrutura
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    const cleanIp = realIp.trim();
    if (/^[0-9a-fA-F:.]+$/.test(cleanIp)) {
      return cleanIp;
    }
  }

  // 3. Socket direto (sem cabeçalhos manipuláveis)
  return req.socket.remoteAddress || '127.0.0.1';
}

function normalizePhone(raw: string = ''): string {
  return raw.replace(/\D/g, '');
}

/**
 * Helper de compatibilidade mantido apenas para suíte de testes legada.
 * A API do ERP utiliza estritamente o Document ID real do Firestore.
 */
export function generateSecureRequestId(): string {
  return `SOL-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

/**
 * Validação de token de verificação humana (Cloudflare Turnstile ou Google reCAPTCHA)
 */
async function verifyAntiSpamCaptcha(token: string, clientIp?: string): Promise<boolean> {
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || '';
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

  if (!turnstileSecret && !recaptchaSecret) {
    const isProduction =
      process.env.NODE_ENV === 'production' ||
      process.env.VERCEL_ENV === 'production';
    if (isProduction) {
      console.error('[Anti-Spam] Produção sem TURNSTILE_SECRET_KEY ou RECAPTCHA_SECRET_KEY configurada.');
      return false;
    }
    return true;
  }

  try {
    if (turnstileSecret) {
      const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: token,
          remoteip: clientIp || '',
        }),
      });
      const data = await res.json();
      return Boolean(data.success);
    }

    if (recaptchaSecret) {
      const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: recaptchaSecret,
          response: token,
          remoteip: clientIp || '',
        }),
      });
      const data = await res.json();
      return Boolean(data.success);
    }
  } catch (err) {
    console.error('[Ama Tec ERP Anti-Spam] Falha na verificação de Captcha:', err);
    return false;
  }

  return false;
}

// ============================================================================
// HANDLER PRINCIPAL HTTP (API AMATEC 365 / ERP)
// ============================================================================

export default async function amaTec365Handler(
  req: IncomingMessage & { body?: any },
  res: ServerResponse
) {
  const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const method = req.method || 'GET';
  const clientIp = getTrustedClientIp(req);

  // ==========================================================================
  // SUBMISSÃO DE PEDIDO DE ASSISTÊNCIA AO ERP (POST /api/amatec365/assistance)
  // ==========================================================================
  if (pathname === '/api/amatec365/assistance' && method === 'POST') {
    const body = await parseRequestBody(req);

    // 1. Verificação de Idempotency-Key no Firestore do SITE
    const idempotencyKey =
      (req.headers['idempotency-key'] as string) ||
      (req.headers['x-idempotency-key'] as string) ||
      body.idempotencyKey;

    if (idempotencyKey && typeof idempotencyKey === 'string') {
      const cached = await getIdempotencyRecord(idempotencyKey);
      if (cached) {
        return sendJson(res, cached.status, {
          ...cached.data,
          idempotentReplay: true,
        });
      }
    }

    // 2. Rate Limiting por IP no Firestore do SITE
    const rateCheck = await checkIpRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return sendJson(res, 429, { error: rateCheck.message });
    }

    // 3. Anti-Spam: Honeypot (campo armadilha invisível)
    if (body.honeypot && String(body.honeypot).trim() !== '') {
      return sendJson(res, 400, {
        error: 'Submissão rejeitada por filtro de segurança anti-spam.',
      });
    }

    // 4. Anti-Spam: Captcha Obrigatório em Produção (HTTP 400 sem token válido)
    const isProduction =
      process.env.NODE_ENV === 'production' ||
      process.env.VERCEL_ENV === 'production' ||
      process.env.ENVIRONMENT === 'production';

    const captchaToken = body.captchaToken;

    if (isProduction) {
      if (!captchaToken || typeof captchaToken !== 'string' || captchaToken.trim() === '') {
        return sendJson(res, 400, {
          error: 'Verificação de segurança anti-spam obrigatória. Token de captcha ausente.',
        });
      }
      const captchaOk = await verifyAntiSpamCaptcha(captchaToken, clientIp);
      if (!captchaOk) {
        return sendJson(res, 400, {
          error: 'Validação de segurança anti-spam (Captcha) falhou ou token inválido.',
        });
      }
    } else {
      if (captchaToken) {
        const captchaOk = await verifyAntiSpamCaptcha(captchaToken, clientIp);
        if (!captchaOk) {
          return sendJson(res, 400, {
            error: 'Validação de segurança anti-spam (Captcha) falhou ou token inválido.',
          });
        }
      }
    }

    // 5. Mapeamento e Validação rigorosa dos campos
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();

    // 1. equipment -> deviceType (não serviceType)
    const deviceType = String(body.deviceType || body.equipment || '').trim();

    // 2. brand -> deviceBrand, model -> deviceModel
    const deviceBrand = String(body.deviceBrand || body.brand || '').trim();
    const deviceModel = String(body.deviceModel || body.model || '').trim();

    // serviceType: serviço selecionado (ex.: "Reparação", "Manutenção Preventiva", etc.)
    const serviceType = String(body.serviceType || 'Reparação').trim();

    // 3. problem -> deviceProblem (mantém também em description)
    const deviceProblem = String(
      body.deviceProblem || body.problemDescription || body.problem || ''
    ).trim();
    const description = deviceProblem;

    // 4. location: separa em locationType ("residence" default) e address
    const address = String(body.address || body.location || '').trim();
    const locationType = String(body.locationType || 'residence').trim();

    const scheduledDate = body.scheduledDate ? String(body.scheduledDate).trim() : null;
    const privacyConsent = Boolean(body.privacyConsent);

    if (!name || name.length < 3) {
      return sendJson(res, 400, { error: 'O nome é obrigatório (mínimo 3 caracteres).' });
    }
    if (name.length > 100) {
      return sendJson(res, 400, { error: 'O nome não deve exceder 100 caracteres.' });
    }

    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 9) {
      return sendJson(res, 400, { error: 'Número de telefone de contacto inválido (mínimo 9 dígitos).' });
    }
    if (cleanPhone.length > 20) {
      return sendJson(res, 400, { error: 'Número de telefone demasiado longo.' });
    }

    if (email && email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length > 120) {
        return sendJson(res, 400, { error: 'Endereço de email inválido.' });
      }
    }

    if (!deviceType || deviceType.length < 2) {
      return sendJson(res, 400, { error: 'O tipo de aparelho/equipamento é obrigatório (mínimo 2 caracteres).' });
    }
    if (deviceType.length > 120) {
      return sendJson(res, 400, { error: 'O nome do aparelho não deve exceder 120 caracteres.' });
    }

    if (!deviceProblem || deviceProblem.length < 8) {
      return sendJson(res, 400, { error: 'Descrição da avaria obrigatória (mínimo 8 caracteres).' });
    }
    if (deviceProblem.length > 1000) {
      return sendJson(res, 400, { error: 'A descrição da avaria não deve exceder 1000 caracteres.' });
    }

    if (address && address.length > 200) {
      return sendJson(res, 400, { error: 'O endereço não deve exceder 200 caracteres.' });
    }

    // Consentimento de Privacidade OBRIGATÓRIO
    if (!privacyConsent) {
      return sendJson(res, 400, {
        error: 'O consentimento dos termos de privacidade é obrigatório para registar o pedido.',
      });
    }

    // 6. VERIFICAÇÃO DAS 4 VARIÁVEIS DE AMBIENTE DO ERP (SECRETS DO AI STUDIO)
    const erpConfig = getErpFirebaseConfig();
    if (erpConfig.missingVars.length > 0) {
      console.error(
        `[Ama Tec ERP] Submissão rejeitada: Variáveis do ERP ausentes no servidor (${erpConfig.missingVars.join(', ')}).`
      );
      return sendJson(res, 503, {
        success: false,
        error: `Configuração do ERP incompleta no servidor. Faltam as variáveis: ${erpConfig.missingVars.join(
          ', '
        )}. Adicione estas variáveis aos Secrets do AI Studio.`,
      });
    }

    if (erpConfig.keyFormatError) {
      console.error(`[Ama Tec ERP] Submissão rejeitada: ${erpConfig.keyFormatError}`);
      return sendJson(res, 500, {
        success: false,
        error: erpConfig.keyFormatError,
      });
    }

    // 7. GRAVAÇÃO EXCLUSIVA NA COLEÇÃO "bookings" DO ERP COM AWAIT
    try {
      const erpDb = getErpFirestoreDb();
      const bookingsCollection = erpDb.collection('bookings');
      const docRef = bookingsCollection.doc();
      const documentId = docRef.id;

      // Objeto exato com o schema exigido pelo ERP
      const bookingRecord = {
        bookingNumber: documentId,
        clientName: name,
        clientPhone: cleanPhone,
        clientWhatsapp: cleanPhone, // clientWhatsapp (= telefone)
        clientEmail: email || '',
        deviceType,
        deviceBrand: deviceBrand || '',
        deviceModel: deviceModel || '',
        serviceType: serviceType || 'Reparação',
        deviceProblem,
        description,
        locationType: locationType || 'residence',
        address: address || '',
        scheduledDate: scheduledDate || null,
        status: 'pendente', // status inicial pendente
        source: 'site',
        channel: 'site',
        createdAt: new Date().toISOString(),
      };

      // Gravação assíncrona com await no Firestore do ERP
      await docRef.set(bookingRecord);

      // Resposta ao cliente com o Document ID real
      const responsePayload = {
        success: true,
        documentId,
        bookingId: documentId,
        bookingNumber: documentId,
        status: 'pendente' as const,
        source: 'site' as const,
        channel: 'site' as const,
        message: 'Pedido registado com sucesso no ERP Bukulo Geste (Pedidos do Site).',
      };

      // Registo de idempotência no Firestore do SITE (não no ERP)
      if (idempotencyKey) {
        await saveIdempotencyRecord(idempotencyKey, 200, responsePayload);
      }

      return sendJson(res, 200, responsePayload);
    } catch (dbErr: any) {
      console.error('[Ama Tec ERP] Erro ao gravar agendamento em "bookings":', dbErr);
      return sendJson(res, 500, {
        success: false,
        error: `Falha ao gravar o pedido na coleção bookings do ERP: ${dbErr?.message || 'Erro de comunicação.'}`,
      });
    }
  }

  return sendJson(res, 404, { error: 'Endpoint da API Ama Tec 365 não encontrado.' });
}
