/**
 * ERP Ama Tec 365 (Bukulo Geste) — Camada de Integração de Frontend
 * 
 * Regras estritas:
 * 1. NUNCA expõe chaves nem credenciais de serviço no frontend.
 * 2. As chamadas passam exclusivamente pelo proxy seguro do servidor (/api/amatec365/assistance).
 * 3. Se o ERP não estiver configurado no servidor, propaga o erro original ao utilizador.
 */

import {
  AssistanceRequestPayload,
  AssistanceRequestResponse,
} from './types';

export class AmaTec365Service {
  /**
   * Envia o Pedido de Assistência para a coleção "bookings" do ERP Bukulo Geste.
   */
  async submitAssistance(payload: AssistanceRequestPayload): Promise<AssistanceRequestResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (payload.idempotencyKey) {
      headers['Idempotency-Key'] = payload.idempotencyKey;
    }

    const response = await fetch('/api/amatec365/assistance', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Falha ao registar o agendamento no sistema central.');
    }

    return data;
  }
}

export const amaTec365Service = new AmaTec365Service();
