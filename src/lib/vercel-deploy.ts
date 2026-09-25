/**
 * Ama Tec — Utilitários de Integração Vercel e Pré-renderização Contínua
 * 
 * Esclarecimento Arquitetural (Pergunta 3):
 * 1. O script `scripts/prerender.ts` corre AUTOMATICAMENTE no comando `npm run build` da Vercel.
 *    Durante o deploy inicial na Vercel, todos os 30 ficheiros HTML estáticos são gerados no CDN.
 * 
 * 2. Em runtime (após o build ter terminado), criar ou editar um serviço no `/admin`
 *    não pode reescrever ficheiros estáticos diretamente no CDN da Vercel (o filesystem
 *    das funções serverless é read-only e efémero).
 * 
 * 3. Para resolver isso com 100% de automação:
 *    a) No frontend, o `ServicesContext` e o `ServiceDetailPage` fazem fallback dinâmico
 *       imediato via API (`/api/public/services`), permitindo que utilizadores vejam o novo
 *       serviço instantaneamente.
 *    b) Para motores de busca (SEO estático no CDN), fornecemos aqui a ativação de Deploy Hook
 *       da Vercel (`VERCEL_DEPLOY_HOOK_URL`). Sempre que um serviço for publicado ou alterado,
 *       a função serverless aciona o Deploy Hook da Vercel de forma assíncrona, despoletando
 *       um rebuild automático (~30s) que executa `scripts/prerender.ts` sem qualquer ação manual!
 */

export interface VercelDeployStatus {
  hasDeployHook: boolean;
  isVercelEnvironment: boolean;
  lastTriggeredAt?: string;
  message?: string;
}

declare global {
  var _lastVercelDeployTriggeredAt: string | undefined;
}

export function getVercelDeployStatus(): VercelDeployStatus {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
  return {
    hasDeployHook: Boolean(hookUrl),
    isVercelEnvironment: isVercel,
    lastTriggeredAt: global._lastVercelDeployTriggeredAt,
  };
}

/**
 * Aciona o Deploy Hook da Vercel se configurado
 */
export async function triggerVercelRebuild(reason: string = 'Atualização de Serviços via /admin'): Promise<{
  triggered: boolean;
  message: string;
}> {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hookUrl) {
    return {
      triggered: false,
      message:
        'VERCEL_DEPLOY_HOOK_URL não configurado. As alterações ficam imediatamente ativas via API dinâmica. Para reconstruir o HTML estático no CDN da Vercel automaticamente, adicione o Deploy Hook nas variáveis de ambiente da Vercel.',
    };
  }

  try {
    const res = await fetch(hookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, timestamp: new Date().toISOString() }),
    });

    if (res.ok) {
      global._lastVercelDeployTriggeredAt = new Date().toISOString();
      console.log(`[Vercel Deploy Hook] Acionado com sucesso: ${reason}`);
      return {
        triggered: true,
        message: 'Rebuild e pré-renderização estática da Vercel acionados com sucesso!',
      };
    }

    return {
      triggered: false,
      message: `Erro ao acionar Vercel Deploy Hook (HTTP ${res.status}).`,
    };
  } catch (err: any) {
    console.warn('[Vercel Deploy Hook] Erro ao contactar hook:', err);
    return {
      triggered: false,
      message: `Erro de conexão com o Vercel Deploy Hook: ${err?.message || err}`,
    };
  }
}
