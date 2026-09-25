import { GalleryItem } from '../types';

export const GALLERY_CATEGORIES: GalleryItem['category'][] = [
  'Televisores',
  'Máquinas de lavar',
  'Secadoras',
  'Micro-ondas',
  'Fornos',
  'Fogões',
  'Air Fryer',
  'Exaustores',
  'Máquinas de café',
  'Equipamentos industriais',
  'Eletrónica',
  'Informática',
  'Outros',
];

/**
 * GALERIA DE INTERVENÇÕES TÉCNICAS AMA TEC
 * Nota de conformidade com as regras da marca:
 * Apenas fotografias reais efetuadas pela equipa da Ama Tec são consideradas válidas.
 * Não são utilizadas fotos genéricas ou bancos de imagem como sendo trabalhos reais.
 * As entradas abaixo indicam a estrutura pronta com marcadores TODO_CONTEUDO para inserção de fotos reais.
 */
export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-01',
    title: 'Substituição de réguas LED de retroiluminação em Smart TV 55"',
    category: 'Televisores',
    equipment: 'Smart TV LED 55 Polegadas',
    description: 'Bancada técnica: desmonte cuidadoso do painel difusor e substituição integral do kit de retroiluminação LED com teste de consumo e balanceamento de corrente.',
    photoUrl: 'TODO_CONTEUDO: /public/images/galeria/reparacao-led-tv-55.jpg',
    isRealAmaTecPhoto: false, // Marcado como falso até upload da foto real
  },
  {
    id: 'gal-02',
    title: 'Desobstrução e troca de bomba em máquina de lavar roupa',
    category: 'Máquinas de lavar',
    equipment: 'Máquina de Lavar Automática 8kg',
    description: 'Diagnóstico de erro de drenagem de água. Remoção de corpos estranhos no filtro e instalação de nova bomba magnética de evacuação.',
    photoUrl: 'TODO_CONTEUDO: /public/images/galeria/bomba-lavar-roupa.jpg',
    isRealAmaTecPhoto: false,
  },
  {
    id: 'gal-03',
    title: 'Reparação de placa eletrónica de potência com microscópio',
    category: 'Eletrónica',
    equipment: 'Placa de comando Inverter',
    description: 'Intervenção ao nível de componentes SMD: substituição de MOSFET em curto e reconstrução de pista de circuito impresso danificada por pico de corrente.',
    photoUrl: 'TODO_CONTEUDO: /public/images/galeria/soldadura-smd-placa.jpg',
    isRealAmaTecPhoto: false,
  },
  {
    id: 'gal-04',
    title: 'Substituição de fusível térmico e termóstato de segurança em Air Fryer',
    category: 'Air Fryer',
    equipment: 'Fritadeira de Ar Quente Digital',
    description: 'Desmontagem técnica, higienização do ventilador de ar e substituição de fusível térmico de 240°C após sobreaquecimento.',
    photoUrl: 'TODO_CONTEUDO: /public/images/galeria/air-fryer-fusivel.jpg',
    isRealAmaTecPhoto: false,
  },
  {
    id: 'gal-05',
    title: 'Revisão de forno micro-ondas e teste de estanqueidade eletromagnética',
    category: 'Micro-ondas',
    equipment: 'Micro-ondas Inox 30L',
    description: 'Troca de magnetrão defeituoso e ensaio final com medidor de emissão de micro-ondas comprovando segurança total para o utilizador.',
    photoUrl: 'TODO_CONTEUDO: /public/images/galeria/microondas-magnetrao.jpg',
    isRealAmaTecPhoto: false,
  },
  {
    id: 'gal-06',
    title: 'Manutenção de contactores e resistências em cozinha industrial',
    category: 'Equipamentos industriais',
    equipment: 'Forno Convector Industrial Trifásico',
    description: 'Substituição de bloco de contactores auxiliares e revisão de cablagem com isolamento térmico de fibra de vidro.',
    photoUrl: 'TODO_CONTEUDO: /public/images/galeria/forno-industrial-quadro.jpg',
    isRealAmaTecPhoto: false,
  },
  {
    id: 'gal-07',
    title: 'Limpeza térmica profunda e troca de pasta térmica em computador portátil',
    category: 'Informática',
    equipment: 'Portátil de Engenharia',
    description: 'Desobstrução do bloco de dissipação de calor de cobre e aplicação de composto térmico de alto rendimento térmico.',
    photoUrl: 'TODO_CONTEUDO: /public/images/galeria/portatil-limpeza-termica.jpg',
    isRealAmaTecPhoto: false,
  },
];
