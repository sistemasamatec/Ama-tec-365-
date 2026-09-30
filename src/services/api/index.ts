/**
 * Ama Tec — Camada Unificada de Integração de Serviços (services/api)
 * 
 * Ponto de entrada oficial para integrações externas e com o sistema Ama Tec 365.
 */

export * from './types';
export * from './amatec365';
export { amaTec365Service as default } from './amatec365';
