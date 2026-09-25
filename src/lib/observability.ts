/**
 * Camada de Observabilidade e Registo de Erros da Ama Tec.
 * Implementa adaptador "noop" seguro por defeito, com pontos de extensão para Sentry ou OpenTelemetry
 * sem instalar bibliotecas pesadas desnecessárias no bundle do cliente.
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  extra?: Record<string, unknown>;
}

export function captureException(error: unknown, context?: ErrorContext): void {
  // Em modo de desenvolvimento, regista para a consola com contexto
  if (process.env.NODE_ENV === 'development') {
    console.error('[Ama Tec Observability] Erro capturado:', error, context);
  }

  // Ponto de integração: Sentry client-side if window.Sentry exists
  if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { captureException: (e: unknown, ctx?: unknown) => void } }).Sentry) {
    (window as unknown as { Sentry: { captureException: (e: unknown, ctx?: unknown) => void } }).Sentry.captureException(error, { extra: context });
  }
}

export function logError(message: string, context?: ErrorContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[Ama Tec Warning] ${message}`, context);
  }
}
