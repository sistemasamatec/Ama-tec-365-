/**
 * Configurações e URLs centrais da aplicação e ecossistema Ama Tec 365
 * 
 * Regra: CLIENT_PORTAL_URL sem valor por omissão inventado.
 * Se VITE_AMATEC365_PORTAL_URL não estiver configurada no ambiente real,
 * o valor permanece string vazia '' e uma falha visível é disparada na interface.
 */

const rawPortalUrl =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AMATEC365_PORTAL_URL) ||
  (typeof process !== 'undefined' &&
    ((process.env as any)?.VITE_AMATEC365_PORTAL_URL || (process.env as any)?.AMATEC365_PORTAL_URL)) ||
  '';

export const CLIENT_PORTAL_URL: string = typeof rawPortalUrl === 'string' ? rawPortalUrl.trim() : '';

export function isClientPortalConfigured(): boolean {
  return Boolean(CLIENT_PORTAL_URL && CLIENT_PORTAL_URL.length > 0);
}
