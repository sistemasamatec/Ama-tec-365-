import { COMPANY } from '../content/company';

/**
 * Utilitários para criação de links do WhatsApp oficial da Ama Tec.
 * Garante mensagem contextualizada sem inventar dados, e com suporte a parâmetros UTM.
 */
export function buildWhatsAppLink(message: string): string {
  const cleanPhone = COMPANY.whatsapp.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function getGeneralWhatsAppUrl(): string {
  const message = `Olá Ama Tec! Gostaria de obter informações sobre assistência técnica para os meus equipamentos eletrónicos.`;
  return buildWhatsAppLink(message);
}

export function getServiceWhatsAppUrl(serviceName: string, utmSource?: string): string {
  let message = `Olá Ama Tec! Gostaria de solicitar assistência para o serviço: ${serviceName}.`;
  if (utmSource) {
    message += ` (Ref: ${utmSource})`;
  }
  return buildWhatsAppLink(message);
}

export function getEquipmentWhatsAppUrl(equipmentName: string, brand?: string, model?: string): string {
  const modelText = model ? ` (Modelo: ${model})` : '';
  const brandText = brand ? ` ${brand}` : '';
  const message = `Olá Ama Tec! Gostaria de assistência técnica para o meu equipamento:${brandText} ${equipmentName}${modelText}. Como posso proceder com o diagnóstico?`;
  return buildWhatsAppLink(message);
}

export function getLeadWhatsAppFallbackUrl(data: {
  name: string;
  equipment: string;
  problemDescription: string;
  location?: string;
}): string {
  const locText = data.location ? ` em ${data.location}` : '';
  const message = `Olá Ama Tec, o meu nome é ${data.name}. Gostaria de solicitar assistência para: ${data.equipment}${locText}.\n\nProblema detetado: ${data.problemDescription}`;
  return buildWhatsAppLink(message);
}
