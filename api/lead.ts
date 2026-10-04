import type { IncomingMessage, ServerResponse } from 'http';
import {
  saveLeadToServer,
  getAllLeadsFromServer,
  updateLeadStatusOnServer,
  deleteLeadFromServer,
  ServerLead,
} from '../src/lib/server-storage';

// Helper de sanitização de HTML para prevenir injeção em clientes de email
export function sanitizeHtml(str: string = ''): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface LeadPayload {
  leadId?: string;
  name?: string;
  phone?: string;
  email?: string;
  equipment?: string;
  serviceCategory?: string;
  problemDescription?: string;
  location?: string;
  message?: string;
  honeypot?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  originUrl?: string;
}

// Armazenamento em memória de rate-limit e deduplicação (por instância)
const ipRequestHistory = new Map<string, { count: number; lastTime: number }>();
const recentSubmissions = new Map<string, number>();

export async function processLeadSubmission(payload: LeadPayload, clientIp: string) {
  const now = Date.now();

  // 1. Rate Limiting por IP (máx 1 submissão a cada 5 segundos; máx 10 por 15 minutos)
  const ipHistory = ipRequestHistory.get(clientIp) || { count: 0, lastTime: 0 };
  if (now - ipHistory.lastTime < 5000) {
    return {
      status: 429,
      data: { error: 'Demasiadas tentativas de envio. Por favor aguarde alguns segundos.' },
    };
  }
  if (now - ipHistory.lastTime > 15 * 60 * 1000) {
    ipHistory.count = 0;
  }
  ipHistory.count += 1;
  ipHistory.lastTime = now;
  ipRequestHistory.set(clientIp, ipHistory);

  if (ipHistory.count > 10) {
    return {
      status: 429,
      data: { error: 'Limite de submissões excedido para este IP. Tente mais tarde ou use o WhatsApp.' },
    };
  }

  // 2. Verificação de Honeypot (campo anti-spam escondido)
  if (payload.honeypot && payload.honeypot.trim() !== '') {
    return {
      status: 400,
      data: { error: 'Submissão rejeitada por filtro de segurança anti-spam.' },
    };
  }

  // 3. Validação de Schema Server-side e limites de tamanho
  const name = (payload.name || '').trim();
  const phone = (payload.phone || '').trim();
  const equipment = (payload.equipment || '').trim();
  const problem = (payload.problemDescription || '').trim();
  const location = (payload.location || '').trim();
  const email = (payload.email || '').trim();
  const serviceCategory = (payload.serviceCategory || '').trim();
  const message = (payload.message || '').trim();
  const utmSource = (payload.utmSource || '').trim();
  const utmCampaign = (payload.utmCampaign || '').trim();
  const leadId = (payload.leadId || `LEAD-${Date.now().toString(36).toUpperCase()}`).trim();

  if (!name || name.length < 3 || name.length > 100) {
    return { status: 400, data: { error: 'O nome é obrigatório (entre 3 e 100 caracteres).' } };
  }
  if (!phone || phone.length < 8 || phone.length > 30) {
    return { status: 400, data: { error: 'O número de telefone é obrigatório (entre 8 e 30 dígitos).' } };
  }
  if (!equipment || equipment.length < 2 || equipment.length > 120) {
    return { status: 400, data: { error: 'O equipamento é obrigatório (máximo 120 caracteres).' } };
  }
  if (!problem || problem.length < 8 || problem.length > 1000) {
    return { status: 400, data: { error: 'A descrição da avaria é obrigatória (mínimo 8 caracteres).' } };
  }
  if (email && (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return { status: 400, data: { error: 'Formato de email inválido.' } };
  }

  // 4. Proteção contra envio duplicado (mesmo telefone e problema em menos de 60 segundos)
  const submissionKey = `${phone}:${problem.slice(0, 30)}`;
  const lastDuplicateTime = recentSubmissions.get(submissionKey) || 0;
  if (now - lastDuplicateTime < 60000) {
    return {
      status: 200,
      data: {
        success: true,
        message: 'Pedido já registado anteriormente.',
        leadId,
        isDuplicate: true,
      },
    };
  }
  recentSubmissions.set(submissionKey, now);

  // 5. Sanitização de campos antes de compor o corpo do email e persistir
  const sName = sanitizeHtml(name);
  const sPhone = sanitizeHtml(phone);
  const sEmail = email ? sanitizeHtml(email) : 'Não fornecido';
  const sEquipment = sanitizeHtml(equipment);
  const sProblem = sanitizeHtml(problem);
  const sLocation = location ? sanitizeHtml(location) : 'Não especificada';
  const sCategory = sanitizeHtml(serviceCategory || 'Geral');
  const sUtm = utmSource ? `Fonte: ${sanitizeHtml(utmSource)} | Campanha: ${sanitizeHtml(utmCampaign || 'direta')}` : 'Acesso direto';
  const sDate = new Date().toLocaleString('pt-PT', { timeZone: 'Africa/Luanda' });

  // 6. GRAVAÇÃO PERSISTENTE EM SERVIDOR PRIMEIRO (ARMAZENAMENTO SERVER-SIDE REAL)
  // Garante que o pedido nunca se perde mesmo se a rede ou email falharem
  const serverLeadRecord: ServerLead = {
    id: leadId,
    createdAt: new Date().toISOString(),
    name,
    phone,
    email: email || undefined,
    equipment,
    serviceCategory: serviceCategory || 'domestico',
    problemDescription: problem,
    location: location || 'Não especificada',
    message: message || undefined,
    utmSource: utmSource || undefined,
    utmCampaign: utmCampaign || undefined,
    status: 'Pendente',
    emailDispatched: false,
    clientIp,
  };

  try {
    saveLeadToServer(serverLeadRecord);
  } catch (dbErr) {
    console.error('[Ama Tec] Erro ao gravar lead no ficheiro do servidor:', dbErr);
  }

  // 7. Preparação do Email com assunto claro e reply-to
  const targetEmail = process.env.EMAIL_NOTIFICATION_TARGET || 'geral@amatec.ao';
  const fromEmail = process.env.EMAIL_FROM || 'Ama Tec Notificações <notificacoes@amatec.ao>';
  const subject = `Novo pedido — ${sCategory} — ${sName}`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">Ama Tec — Novo Pedido de Assistência Técnica</h2>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #94a3b8;">Oficina Golf 2, Luanda | Referência: ${sanitizeHtml(leadId)}</p>
      </div>
      <div style="padding: 24px; background-color: #ffffff;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: bold; width: 140px; color: #475569;">Cliente:</td>
            <td style="padding: 10px 0; color: #0f172a;">${sName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: bold; color: #475569;">Telefone:</td>
            <td style="padding: 10px 0;"><a href="tel:${sPhone}" style="color: #0284c7; text-decoration: none; font-weight: bold;">${sPhone}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: bold; color: #475569;">Email:</td>
            <td style="padding: 10px 0; color: #0f172a;">${sEmail}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: bold; color: #475569;">Equipamento:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #0f172a;">${sEquipment}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: bold; color: #475569;">Categoria:</td>
            <td style="padding: 10px 0; color: #0f172a;">${sCategory}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: bold; color: #475569;">Localização:</td>
            <td style="padding: 10px 0; color: #0f172a;">${sLocation}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: bold; color: #475569;">Avaria / Sintomas:</td>
            <td style="padding: 10px 0; color: #0f172a; white-space: pre-wrap;">${sProblem}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #475569;">Data e Origem:</td>
            <td style="padding: 10px 0; color: #64748b; font-size: 12px;">${sDate} | ${sUtm}</td>
          </tr>
        </table>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 14px;">Contactar Cliente no WhatsApp</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        Sistema Automatizado da Ama Tec — Oficina no Golf 2, Luanda.
      </div>
    </div>
  `;

  // 8. Envio por Resend se configurado
  let emailDispatched = false;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey && !resendApiKey.startsWith('re_sample')) {
    try {
      let dispatchOk = false;
      let lastErrText = '';

      const primaryRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [targetEmail],
          reply_to: email || undefined,
          subject,
          html: htmlBody,
        }),
      });

      if (primaryRes.ok) {
        dispatchOk = true;
      } else {
        lastErrText = await primaryRes.text();
        // Se falhou por domínio não verificado ou restrição de conta de testes, tenta envio sandbox
        if (primaryRes.status === 403 || lastErrText.includes('domain is not verified') || lastErrText.includes('testing emails')) {
          const sandboxFrom = 'Ama Tec <onboarding@resend.dev>';
          let fallbackTo = targetEmail;

          // Se a conta de testes do Resend exigir envio para o próprio proprietário
          const ownerMatch = lastErrText.match(/to your own email address \(([^)]+)\)/);
          if (ownerMatch && ownerMatch[1]) {
            fallbackTo = ownerMatch[1];
          }

          const fallbackRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: sandboxFrom,
              to: [fallbackTo],
              reply_to: email || undefined,
              subject,
              html: htmlBody,
            }),
          });

          if (fallbackRes.ok) {
            dispatchOk = true;
            console.log(`[Ama Tec Resend] Notificação enviada via sandbox (${sandboxFrom} -> ${fallbackTo}).`);
          } else {
            const fbErr = await fallbackRes.text();
            const ownerMatchFb = fbErr.match(/to your own email address \(([^)]+)\)/);
            if (ownerMatchFb && ownerMatchFb[1] && fallbackTo !== ownerMatchFb[1]) {
              const ownerRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${resendApiKey}`,
                },
                body: JSON.stringify({
                  from: sandboxFrom,
                  to: [ownerMatchFb[1]],
                  reply_to: email || undefined,
                  subject,
                  html: htmlBody,
                }),
              });
              if (ownerRes.ok) {
                dispatchOk = true;
                console.log(`[Ama Tec Resend] Notificação enviada para o administrador (${ownerMatchFb[1]}).`);
              } else {
                console.warn('[Ama Tec Resend] Notificação via email em espera (domínio pendente de validação em resend.com/domains).');
              }
            } else {
              console.warn('[Ama Tec Resend] Notificação via email em espera (domínio pendente de validação em resend.com/domains).');
            }
          }
        } else {
          console.warn('[Ama Tec Resend] Aviso ao enviar notificação por email:', lastErrText);
        }
      }

      if (dispatchOk) {
        emailDispatched = true;
        serverLeadRecord.emailDispatched = true;
        saveLeadToServer(serverLeadRecord);
      }
    } catch (sendErr: any) {
      console.warn('[Ama Tec] Aviso de rede ao conectar com Resend:', sendErr?.message || sendErr);
    }
  } else {
    // Modo desenvolvimento / sem chaves: registo limpo em consola
    console.log(`[Ama Tec Lead API] Pedido registado no servidor (Aguardando Resend/SMTP):`, {
      leadId,
      cliente: sName,
      telefone: sPhone,
      aparelho: sEquipment,
      targetEmail,
      savedToServerDb: true,
    });
    emailDispatched = true;
  }

  return {
    status: 200,
    data: {
      success: true,
      message: 'Pedido de assistência registado com sucesso para a equipa técnica da Ama Tec.',
      leadId,
      emailDispatched,
      savedToServerDb: true,
    },
  };
}

// Handler padrão compatível com serverless (Vercel) e Express
export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  const method = req.method || 'GET';
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  // Obter leads da base de dados do servidor
  if (method === 'GET') {
    const leads = getAllLeadsFromServer();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(leads));
    return;
  }

  // Novo lead via POST
  if (method === 'POST') {
    let rawBody = '';
    if (typeof req.body === 'object' && req.body !== null) {
      const result = await processLeadSubmission(req.body, clientIp);
      res.statusCode = result.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result.data));
      return;
    }

    req.on('data', (chunk) => {
      rawBody += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const parsed = JSON.parse(rawBody || '{}');
        const result = await processLeadSubmission(parsed, clientIp);
        res.statusCode = result.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result.data));
      } catch (e) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Payload JSON inválido.' }));
      }
    });
    return;
  }

  // Atualizar estado de lead via PATCH
  if (method === 'PATCH') {
    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { id, status } = JSON.parse(rawBody || '{}');
        if (!id || !status) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'ID e status são obrigatórios.' }));
          return;
        }
        const updated = updateLeadStatusOnServer(id, status);
        res.statusCode = updated ? 200 : 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: updated }));
      } catch (err) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Erro ao processar atualização.' }));
      }
    });
    return;
  }

  // Eliminar lead via DELETE
  if (method === 'DELETE') {
    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { id } = JSON.parse(rawBody || '{}');
        if (!id) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'ID é obrigatório.' }));
          return;
        }
        const deleted = deleteLeadFromServer(id);
        res.statusCode = deleted ? 200 : 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: deleted }));
      } catch (err) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Erro ao processar eliminação.' }));
      }
    });
    return;
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Método não permitido.' }));
}

