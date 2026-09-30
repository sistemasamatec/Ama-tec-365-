/**
 * ERP Ama Tec 365 (Bukulo Geste) — Tipos Oficiais de Integração
 * 
 * Contrato oficial de dados para a submissão de solicitações de assistência
 * técnica à coleção "bookings" (menu "Pedidos do Site") do ERP.
 */

export interface AssistanceRequestPayload {
  name: string;
  phone: string;
  email?: string;
  equipment?: string;
  deviceType?: string;
  brand?: string;
  deviceBrand?: string;
  model?: string;
  deviceModel?: string;
  serviceType?: string;
  problemDescription?: string;
  deviceProblem?: string;
  problem?: string;
  location?: string;
  address?: string;
  locationType?: string;
  scheduledDate?: string;
  utmSource?: string;
  honeypot?: string;
  idempotencyKey?: string;
  privacyConsent?: boolean;
  captchaToken?: string;
}

export interface AssistanceRequestResponse {
  success: boolean;
  bookingId: string;
  bookingNumber: string;
  documentId?: string;
  requestId?: string;
  status: 'pendente';
  source: 'site';
  channel: 'site';
  message: string;
  idempotentReplay?: boolean;
  error?: string;
}
