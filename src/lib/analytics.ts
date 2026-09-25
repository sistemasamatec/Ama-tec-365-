/**
 * Motor de Telemetria e Analytics da Ama Tec.
 * Respeita estritamente o consentimento de cookies e não envia dados pessoais (PII).
 */

export type AnalyticsEventType =
  | 'page_view'
  | 'service_view'
  | 'whatsapp_click'
  | 'phone_click'
  | 'email_click'
  | 'form_start'
  | 'form_submit'
  | 'form_error'
  | 'equipment_open'
  | 'search'
  | 'filter'
  | 'conversion';


interface AnalyticsPayload {
  [key: string]: string | number | boolean | undefined;
}

const COOKIE_CONSENT_KEY = 'amatec_cookie_consent_v1';

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed.analytics);
  } catch {
    return false;
  }
}

export function setAnalyticsConsent(consent: { necessary: boolean; analytics: boolean }): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  } catch {
    // Ignore
  }
}

/**
 * Regista evento anónimo sem PII.
 */
export function track(event: AnalyticsEventType, payload: AnalyticsPayload = {}): void {
  // Se não houver consentimento explícito do utilizador, não rastreia
  if (!hasAnalyticsConsent()) {
    return;
  }

  const cleanPayload = {
    event,
    timestamp: new Date().toISOString(),
    path: typeof window !== 'undefined' ? window.location.pathname : '',
    ...payload,
  };

  // Dispatch para GA4 / Meta / TikTok se configurados futuramente via env vars
  if (typeof window !== 'undefined') {
    // GA4 adapter stub
    if ((window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', event, payload);
    }

    // Meta Pixel adapter stub
    if ((window as unknown as { fbq?: (...args: unknown[]) => void }).fbq) {
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq('trackCustom', event, payload);
    }
  }

  // Registo para diagnóstico interno
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[Analytics Tracked] ${event}:`, cleanPayload);
  }
}
