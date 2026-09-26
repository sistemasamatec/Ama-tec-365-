export type ServiceCategory =
  | 'domestico'
  | 'industrial'
  | 'eletrica'
  | 'eletronica'
  | 'informatica'
  | 'manutencao';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  menuLabel?: string;
  menuHidden?: boolean;
  category: ServiceCategory;
  categoryName: string;
  shortDescription: string;
  fullDescription: string;
  commonProblems: string[];
  solutions: string[];
  coveredEquipment: string[];
  processSteps: { title: string; detail: string }[];
  faqs: FAQItem[];
  imagePlaceholder: string;
  relatedServiceSlugs: string[];
  seoTitle: string;
  seoDescription: string;
  status?: 'published' | 'draft' | 'archived';
  updatedAt?: string;
}

export interface EquipmentItem {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  category: ServiceCategory;
  categoryName: string;
  serviceSlug: string;
  description: string;
  specifications: { label: string; value: string }[];
  photoPlaceholder: string;
  relatedModels: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category:
    | 'Televisores'
    | 'Máquinas de lavar'
    | 'Secadoras'
    | 'Micro-ondas'
    | 'Fornos'
    | 'Fogões'
    | 'Air Fryer'
    | 'Exaustores'
    | 'Máquinas de café'
    | 'Equipamentos industriais'
    | 'Eletrónica'
    | 'Informática'
    | 'Outros';
  equipment: string;
  description: string;
  photoUrl: string;
  isRealAmaTecPhoto: boolean;
  date?: string;
}

export interface AssistanceRequest {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  equipment: string;
  serviceCategory: string;
  problemDescription: string;
  location: string;
  message?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  honeypot?: string;
  status: 'Pendente' | 'Em contacto' | 'Em diagnóstico' | 'Concluído' | 'Cancelado';
  notes?: string;
}

export interface CompanyNAP {
  brand: string;
  legalName: string;
  descriptor: string;
  nif: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  whatsappDisplay: string;
  email: string;
  domain: string;
  siteUrl: string;
  openingHours: string; // "TODO_CONTEUDO"
  googleMapsEmbedUrl: string; // "TODO_CONTEUDO"
  googleBusinessUrl: string; // "TODO_CONTEUDO"
}
