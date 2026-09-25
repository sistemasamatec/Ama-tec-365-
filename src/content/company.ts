import { CompanyNAP } from '../types';

/**
 * DADOS OFICIAIS DA AMA TEC
 * Fonte única de verdade para toda a aplicação (NAP - Name, Address, Phone).
 * NUNCA inventar dados não fornecidos; usar TODO_CONTEUDO onde aplicável.
 */
export const COMPANY: CompanyNAP = {
  brand: 'Ama Tec',
  legalName: 'AMA TEC PRESTAÇÃO DE SERVIÇOS & COMÉRCIO GERAL (SU)',
  descriptor: 'Assistência Técnica de Equipamentos Eletrónicos',
  nif: '5001399837',
  address: 'Golf 2, Rua dos Príncipes',
  city: 'Luanda',
  country: 'Angola',
  phone: '+244930372597',
  phoneDisplay: '+244 930 372 597',
  whatsapp: '+244930372597',
  whatsappDisplay: '+244 930 372 597',
  email: 'geral@amatec.ao',
  domain: 'amatec.ao',
  siteUrl: 'https://amatec.ao',
  // Campos pendentes de fornecimento oficial pela empresa
  openingHours: 'TODO_CONTEUDO',
  googleMapsEmbedUrl: 'TODO_CONTEUDO',
  googleBusinessUrl: 'TODO_CONTEUDO',
};

export const SOCIAL_LINKS = {
  facebook: 'TODO_CONTEUDO',
  instagram: 'TODO_CONTEUDO',
  linkedin: 'TODO_CONTEUDO',
};
