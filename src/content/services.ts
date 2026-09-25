import { ServiceCategory, ServiceItem } from '../types';

export const CATEGORIES_CONFIG: {
  id: ServiceCategory;
  name: string;
  description: string;
  badge: string;
}[] = [
  {
    id: 'domestico',
    name: 'Linha Doméstica',
    description: 'Assistência técnica especializada em eletrodomésticos essenciais para o seu lar.',
    badge: 'Eletrodomésticos',
  },
  {
    id: 'industrial',
    name: 'Industrial e Comercial',
    description: 'Soluções de reparação e continuidade para equipamentos de restauração, hotelaria e indústria.',
    badge: 'Comércio & Indústria',
  },
  {
    id: 'eletrica',
    name: 'Instalações & Elétrica',
    description: 'Quadros elétricos, diagnóstico de curto-circuitos, proteção e circuitos dedicados.',
    badge: 'Instalações Elétricas',
  },
  {
    id: 'eletronica',
    name: 'Eletrónica Avançada',
    description: 'Reparação ao nível de micro-componentes, placas eletrónicas, fontes e semicondutores.',
    badge: 'Component Level',
  },
  {
    id: 'informatica',
    name: 'Informática & TI',
    description: 'Reparação de computadores, portáteis, fontes e diagnóstico de hardware.',
    badge: 'Sistemas & Hardware',
  },
  {
    id: 'manutencao',
    name: 'Planos de Manutenção',
    description: 'Manutenção preventiva, corretiva e auditoria operacional para empresas e residências.',
    badge: 'Manutenção Técnica',
  },
];

export const SERVICES: ServiceItem[] = [
  // --- DOMÉSTICO ---
  {
    id: 'srv-tv',
    slug: 'reparacao-de-televisores',
    name: 'Reparação de Televisores',
    category: 'domestico',
    categoryName: 'Linha Doméstica',
    shortDescription: 'Diagnóstico e reparação de ecrãs LED, OLED, QLED e Smart TVs. Resolução de falhas de imagem, som e alimentação.',
    fullDescription: 'A Ama Tec disponibiliza técnicos qualificados para assistência de televisores de todas as principais marcas em Luanda. Realizamos diagnósticos minuciosos aos circuitos de retroiluminação (backlight), fontes de alimentação, placas principais (main board) e placas T-Con, assegurando reparações precisas e com componentes adequados.',
    commonProblems: [
      'Tem som mas o ecrã fica totalmente preto (falha típica de backlight LED)',
      'A TV não liga nem o LED de standby acende',
      'LED de standby pisca de forma intermitente sem arrancar',
      'Linhas verticais ou horizontais no ecrã após pico de tensão',
      'Desliga-se repentinamente após alguns minutos de funcionamento',
      'Portas HDMI ou ligação Wi-Fi não reconhecidas',
    ],
    solutions: [
      'Substituição e calibração de réguas de retroiluminação LED originais',
      'Reparação de circuitos integrados e transístores da fonte de alimentação',
      'Reprogramação de chips de memória SPI/NAND e atualização de firmware',
      'Substituição de condensadores degradados e filtros de filtragem de sinal',
      'Testes de tensão e estresse térmico em bancada de ensaio',
    ],
    coveredEquipment: [
      'Smart TVs LED, QLED e OLED',
      'Televisores LCD e monitores de alta definição',
      'Sistemas de home cinema associados',
    ],
    processSteps: [
      { title: '1. Receção e Triagem', detail: 'Registo do equipamento com relatório fotográfico do estado físico e registo dos sintomas descritos.' },
      { title: '2. Diagnóstico em Bancada', detail: 'Medição de tensões secundárias, testes de osciloscópio e identificação do componente defeituoso.' },
      { title: '3. Apresentação do Orçamento', detail: 'Envio de orçamento discriminado e transparente para aprovação do cliente.' },
      { title: '4. Reparação e Teste Prolongado', detail: 'Troca do componente, limpeza térmica e teste de funcionamento contínuo durante pelo menos 4 horas.' },
    ],
    faqs: [
      {
        question: 'Vale a pena reparar uma TV sem imagem mas com som?',
        answer: 'Na grande maioria dos casos sim. Este sintoma corresponde habitualmente a uma falha das réguas LED de retroiluminação, cuja reparação tem um custo substancialmente inferior à aquisição de um televisor novo.',
      },
      {
        question: 'Reparam ecrãs com o vidro fisicamente partido?',
        answer: 'Se o painel LCD/OLED estiver estalado internamente por impacto físico, a substituição do painel completo geralmente não é viável economicamente devido ao custo do vidro de reposição. Avaliamos cada caso no diagnóstico inicial.',
      },
      {
        question: 'Dão garantia sobre a intervenção?',
        answer: 'Sim, todas as reparações efetuadas pela Ama Tec incluem garantia sobre os componentes substituídos e mão-de-obra executada.',
      },
    ],
    imagePlaceholder: 'TODO_CONTEUDO: /public/images/servicos/reparacao-televisores.jpg (Fotografia real Ama Tec pendente)',
    relatedServiceSlugs: ['reparacao-de-placas-eletronicas', 'reparacao-de-micro-ondas'],
    seoTitle: 'Reparação de Televisores em Luanda | Ama Tec Assistência Técnica',
    seoDescription: 'Assistência técnica especializada em televisores Smart TV, LED e OLED em Luanda. Diagnóstico de imagem, som e fonte pela Ama Tec.',
  },
  {
    id: 'srv-lavar-roupa',
    slug: 'reparacao-de-maquinas-de-lavar',
    name: 'Reparação de Máquinas de Lavar Roupa',
    category: 'domestico',
    categoryName: 'Linha Doméstica',
    shortDescription: 'Assistência a máquinas de lavar roupa automáticas e semiautomáticas. Reparação de rolamentos, bombas, motores e placas.',
    fullDescription: 'As máquinas de lavar roupa estão sujeitas a desgaste mecânico contínuo e flutuações elétricas comuns. Na Ama Tec efetuamos diagnóstico completo, substituindo componentes de desgaste como eletroválvulas, blocos de porta, amortecedores, e reparamos placas eletrónicas de comando com técnicos experientes.',
    commonProblems: [
      'A máquina não drena a água e para a meio do ciclo',
      'Faz barulho excessivo ou vibra com violência durante a centrifugação',
      'Código de erro piscando no visor digital ou LEDs indicadores',
      'Não roda o tambor apesar do motor arrancar',
      'A porta permanece trancada após o término do programa',
      'Fuga de água pela gaveta de detergente ou pela base',
    ],
    solutions: [
      'Substituição e desobstrução de bomba de drenagem e mangueiras',
      'Troca de rolamentos, vedantes (retentores) e cruzetas de tambor',
      'Reparação e desoxidação de módulos e placas de controlo eletrónico',
      'Substituição de escovas de carvão de motor ou sensores de efeito Hall',
      'Calibração de pressostatos e válvulas de admissão de água',
    ],
    coveredEquipment: [
      'Máquinas de lavar roupa de carregamento frontal e superior',
      'Máquinas de lavar e secar conjugadas (Lava e Seca)',
      'Máquinas de lavar loiça residenciais',
    ],
    processSteps: [
      { title: '1. Diagnóstico do Código de Erro', detail: 'Leitura técnica de falhas da centralina e inspeção visual de componentes mecânicos.' },
      { title: '2. Teste de Periféricos', detail: 'Medição de resistência de aquecimento, motor de acionamento e bomba de drenagem.' },
      { title: '3. Orçamento e Reparação', detail: 'Apresentação formal da proposta e montagem de componentes certificados.' },
      { title: '4. Teste de Ciclo Hidráulico', detail: 'Ensaio com carga de água para comprovar estanqueidade e centrifugação sem ruídos.' },
    ],
    faqs: [
      {
        question: 'A máquina faz muito barulho ao centrifugar, o que pode ser?',
        answer: 'Normalmente indica desgaste acentuado nos rolamentos do tambor. Recomenda-se a reparação atempada para evitar danos permanentes na cruzeta ou na cuba da máquina.',
      },
      {
        question: 'Reparam máquinas Lava e Seca?',
        answer: 'Sim, a equipa da Ama Tec tem experiência na reparação quer da parte de lavagem, quer do sistema de secagem térmica e condensação.',
      },
    ],
    imagePlaceholder: 'TODO_CONTEUDO: /public/images/servicos/reparacao-maquinas-lavar.jpg (Fotografia real Ama Tec pendente)',
    relatedServiceSlugs: ['reparacao-de-placas-eletronicas', 'manutencao-preventiva-corretiva'],
    seoTitle: 'Reparação de Máquinas de Lavar Roupa | Ama Tec Luanda',
    seoDescription: 'Serviço de assistência técnica a máquinas de lavar roupa e loiça em Luanda. Diagnóstico de motores, bombas e placas pela Ama Tec.',
  },
  {
    id: 'srv-air-fryer',
    slug: 'reparacao-de-air-fryer',
    name: 'Reparação de Air Fryer (Fritadeiras sem Óleo)',
    category: 'domestico',
    categoryName: 'Linha Doméstica',
    shortDescription: 'Assistência técnica para Air Fryers de todas as capacidades. Reparação de resistências, termóstatos, fusíveis e placas.',
    fullDescription: 'As fritadeiras de ar quente (Air Fryer) são aparelhos de uso intensivo diário que combinam alta potência térmica com circulação de ar de precisão. Falhas comuns como não aquecer, ventoinha travada ou visor desligado são resolvidas com rapidez e segurança elétrica na oficina da Ama Tec.',
    commonProblems: [
      'A ventoinha gira mas a resistência não aquece os alimentos',
      'O aparelho não dá qualquer sinal elétrico (fusível térmico interrompido)',
      'O display digital não responde ao toque ou apresenta códigos de erro',
      'Cheiro a plástico queimado ou fumo durante a utilização',
      'O cesto não fecha corretamente ou o sensor de fecho não aciona',
      'Desliga-se subitamente após 2 ou 3 minutos de cozedura',
    ],
    solutions: [
      'Substituição de fusíveis térmicos calibrados e termóstatos de segurança',
      'Substituição ou reparação de resistências de aquecimento de alta potência',
      'Desmontagem, limpeza técnica de gordura acumulada no motor do ventilador',
      'Reparação da placa controladora de comandos touch e potenciómetros',
      'Substituição do microinterruptor de segurança do cesto de gaveta',
    ],
    coveredEquipment: [
      'Air Fryers manuais de botão rotativo',
      'Air Fryers digitais com painel tátil e programas predefinidos',
      'Fornos Air Fryer de grande capacidade (tipo estufa)',
    ],
    processSteps: [
      { title: '1. Inspeção de Segurança', detail: 'Verificação da integridade do isolamento elétrico e testes de continuidade térmica.' },
      { title: '2. Deteção da Anomalia', detail: 'Identificação precisa entre falha de fusível, resistência rompida ou avaria na placa lógica.' },
      { title: '3. Reparação e Higienização Técnica', detail: 'Troca de peças e remoção de resíduos inflamáveis acumulados nas condutas de ar.' },
      { title: '4. Teste Térmico de Potência', detail: 'Aferição com termómetro digital a 200°C garantindo curvas de temperatura seguras.' },
    ],
    faqs: [
      {
        question: 'A minha Air Fryer desligou e nunca mais ligou. Tem arranjo?',
        answer: 'Sim, na grande maioria das ocorrências o fusível térmico de segurança disparou para proteger a sua habitação de um sobreaquecimento. Substituímos o componente e diagnosticamos a causa original da subida de temperatura.',
      },
    ],
    imagePlaceholder: 'TODO_CONTEUDO: /public/images/servicos/reparacao-air-fryer.jpg (Fotografia real Ama Tec pendente)',
    relatedServiceSlugs: ['reparacao-de-micro-ondas', 'reparacao-de-placas-eletronicas'],
    seoTitle: 'Reparação de Air Fryer em Luanda | Ama Tec',
    seoDescription: 'Assistência técnica para Air Fryer e fornos elétricos em Luanda. Diagnóstico de resistências e circuitos pela equipa Ama Tec.',
  },
  {
    id: 'srv-micro-ondas',
    slug: 'reparacao-de-micro-ondas',
    name: 'Reparação de Micro-ondas e Fornos Elétricos',
    category: 'domestico',
    categoryName: 'Linha Doméstica',
    shortDescription: 'Reparação de alta tensão em fornos micro-ondas e fornos de embutir. Substituição de magnetrões, condensadores e teclados.',
    fullDescription: 'Os aparelhos micro-ondas trabalham com circuitos de alta tensão extremamente perigosos e exigem intervenção exclusivamente por técnicos certificados. A Ama Tec realiza reparações com estrito protocolo de blindagem e teste de fuga de radiação eletromagnética.',
    commonProblems: [
      'Trabalha normalmente e gira o prato mas não aquece nada',
      'Faz faíscas intensas dentro da cavidade durante o aquecimento',
      'Queima o fusível geral da casa logo ao carregar em Iniciar',
      'Teclado de membrana não responde ou apenas algumas teclas funcionam',
      'O prato giratório não roda',
      'A porta não tranca ou a luz interna não desliga',
    ],
    solutions: [
      'Substituição do magnetrão e do díodo retificador de alta tensão',
      'Troca do condensador de alta tensão e fusível cerâmico dedicado',
      'Substituição da placa de mica protetora de guia de ondas',
      'Reparação de microswitches da fechadura e do motor de acionamento do prato',
      'Substituição ou reconstrução de pistas no painel de membrana',
    ],
    coveredEquipment: [
      'Micro-ondas de bancada mecânicos e eletrónicos',
      'Micro-ondas e fornos combinados de encastrar',
      'Fornos elétricos de convecção residenciais',
    ],
    processSteps: [
      { title: '1. Descarregamento Seguro', detail: 'Procedimento técnico obrigatório de descarga do condensador de alta voltagem.' },
      { title: '2. Ensaio de Alta Tensão', detail: 'Medição da emissão do magnetrão e transformador com instrumentos apropriados.' },
      { title: '3. Reparação e Vedação', detail: 'Substituição das peças afetadas e conferência do fecho hermético da porta.' },
      { title: '4. Teste de Fuga com Detetor', detail: 'Medição com aparelho de deteção de fugas de micro-ondas assegurando proteção total.' },
    ],
    faqs: [
      {
        question: 'O micro-ondas faz faíscas dentro. Posso continuar a usar?',
        answer: 'Não. Deve desligar imediatamente da tomada. Geralmente deve-se à queima da folha de mica protetora do guia de ondas. A sua substituição rápida evita a queima irreversível do magnetrão.',
      },
    ],
    imagePlaceholder: 'TODO_CONTEUDO: /public/images/servicos/reparacao-micro-ondas.jpg (Fotografia real Ama Tec pendente)',
    relatedServiceSlugs: ['reparacao-de-air-fryer', 'reparacao-de-placas-eletronicas'],
    seoTitle: 'Reparação de Micro-ondas e Fornos em Luanda | Ama Tec',
    seoDescription: 'Assistência a fornos micro-ondas e fornos elétricos em Luanda com testes de segurança eletromagnética pela Ama Tec.',
  },

  // --- INDUSTRIAL E COMERCIAL ---
  {
    id: 'srv-cozinhas-ind',
    slug: 'cozinhas-industriais',
    name: 'Assistência a Cozinhas Industriais & Restauração',
    category: 'industrial',
    categoryName: 'Industrial e Comercial',
    shortDescription: 'Manutenção de fornos combinados, fritadeiras industriais, fogões e equipamentos de restauração e hotelaria.',
    fullDescription: 'Uma paragem na linha de confeção de um restaurante ou hotel gera perdas financeiras imediatas. A Ama Tec presta assistência prioritária a equipamentos de restauração comercial e hoteleira em Luanda, assegurando continuidade operacional com componentes industriais de elevada fiabilidade.',
    commonProblems: [
      'Fornos combinados e convector não atingem a temperatura programada',
      'Falha na injeção de vapor ou descalcificação de caldeiras industriais',
      'Fritadeiras elétricas industriais com termóstato de segurança desarmado',
      'Chapas de grelhar com desbalanceamento de fases e queima repetida de resistências',
      'Painéis eletromecânicos de comando com contactores colados',
    ],
    solutions: [
      'Substituição de resistências trifásicas blindadas em aço inoxidável',
      'Instalação de contactores industriais, relés térmicos e disjuntores motor',
      'Reparação de placas eletrónicas de controlo de fornos de convecção',
      'Desobstrução e substituição de eletroválvulas solenoides de água e vapor',
      'Limpeza técnica de turbinas de ventilação e lubrificação de chumaceiras',
    ],
    coveredEquipment: [
      'Fornos combinados de restauração',
      'Fritadeiras industriais trifásicas e monofásicas',
      'Chapas quentes, banho-maria e marmitas industriais',
      'Máquinas de lavar loiça industriais de cúpula e túnel',
    ],
    processSteps: [
      { title: '1. Diagnóstico no Local ou Oficina', detail: 'Avaliação técnica das condições de alimentação trifásica e sintomas da máquina.' },
      { title: '2. Isolamento do Circuito', detail: 'Garantia de corte seguro e teste de isolamento com megóhmetro.' },
      { title: '3. Reparação Industrial', detail: 'Substituição por componentes com especificações de resistência térmica elevada.' },
      { title: '4. Teste em Carga Real', detail: 'Validação sob regime de trabalho contínuo para evitar retornos.' },
    ],
    faqs: [
      {
        question: 'Fazem assistência no estabelecimento comercial?',
        answer: 'Para equipamentos pesados e fixos de restauração, avaliamos o atendimento no local na área de Luanda. Contacte a nossa equipa para agendamento.',
      },
    ],
    imagePlaceholder: 'TODO_CONTEUDO: /public/images/servicos/cozinhas-industriais.jpg (Fotografia real Ama Tec pendente)',
    relatedServiceSlugs: ['reparacao-de-placas-eletronicas', 'instalacoes-eletricas-diagnostico'],
    seoTitle: 'Cozinhas Industriais e Equipamentos de Restauração | Ama Tec Luanda',
    seoDescription: 'Manutenção de fornos industriais, fritadeiras e lavandaria comercial em Luanda pela Ama Tec. Assistência profissional.',
  },
  {
    id: 'srv-pos-balancas',
    slug: 'balancas-pos-comercial',
    name: 'Balanças Eletrónicas, POS & Impressoras Térmicas',
    category: 'industrial',
    categoryName: 'Industrial e Comercial',
    shortDescription: 'Reparação de terminais POS, balanças de precisão comerciais, impressoras de talões e leitores de código.',
    fullDescription: 'Os sistemas do ponto de venda são o coração da faturação do retalho. A Ama Tec diagnostica avarias em balanças eletrónicas de pesagem, terminais de ponto de venda (POS), impressoras térmicas de recibos e leitores de código de barras.',
    commonProblems: [
      'Balança eletrónica não calibra ou peso oscila sem estabilizar',
      'Impressora térmica não puxa o papel ou imprime caracteres desbotados',
      'Terminal POS com ecrã tátil descalibrado ou que não liga após corte de energia',
      'Portas de comunicação série (RS-232) ou USB danificadas',
    ],
    solutions: [
      'Substituição e calibração de células de carga de pesagem',
      'Troca de cabeças térmicas de impressão e mecanismos de corte de papel (guilhotinas)',
      'Reparação de placas controladoras internas e fontes de alimentação chaveadas',
      'Substituição de ecrãs resistivos e capacitivos de terminais de faturação',
    ],
    coveredEquipment: [
      'Balanças de checkout e de etiquetagem comercial',
      'Impressoras de talões térmicas (58mm e 80mm)',
      'Terminais POS All-in-One e monitores táteis de caixa',
      'Scanners leitores de código de barras 1D e 2D',
    ],
    processSteps: [
      { title: '1. Diagnóstico de Comunicação e Hardware', detail: 'Testes de interface, sensibilidade do sensor e integridade da alimentação.' },
      { title: '2. Reparação Eletrónica', detail: 'Substituição das peças mecânicas ou eletrónicas com soldadura de precisão.' },
      { title: '3. Aferição de Padrão', detail: 'Testes com massas padrão (no caso de balanças) e impressões de teste contínuo.' },
    ],
    faqs: [
      {
        question: 'A minha impressora de talões imprime em branco. Tem solução?',
        answer: 'Pode ser a cabeça térmica danificada ou o mecanismo de pressão do rolo. Diagnosticamos na Ama Tec e reparamos o mecanismo ou substituímos a cabeça.',
      },
    ],
    imagePlaceholder: 'TODO_CONTEUDO: /public/images/servicos/pos-balancas.jpg (Fotografia real Ama Tec pendente)',
    relatedServiceSlugs: ['reparacao-de-placas-eletronicas', 'assistencia-informatica-portateis'],
    seoTitle: 'Reparação de POS, Balanças e Impressoras Térmicas | Ama Tec',
    seoDescription: 'Assistência a balanças comerciais, terminais POS e impressoras de talão em Luanda com a Ama Tec.',
  },

  // --- ELETRÓNICA AVANÇADA ---
  {
    id: 'srv-placas',
    slug: 'reparacao-de-placas-eletronicas',
    name: 'Reparação de Placas Eletrónicas ao Nível de Componente',
    category: 'eletronica',
    categoryName: 'Eletrónica Avançada',
    shortDescription: 'Diagnóstico microscópico e substituição de MOSFETs, circuitos integrados, fontes chaveadas e pistas rompidas.',
    fullDescription: 'Substituir uma placa eletrónica completa nem sempre é possível ou viável economicamente devido à indisponibilidade de peças importadas em Angola. A Ama Tec é pioneira no reparo ao nível de componente (component-level repair), recuperando placas de ar condicionado, eletrodomésticos, máquinas industriais e automóveis.',
    commonProblems: [
      'Placa em curto-circuito total fazendo disparar o disjuntor',
      'Fontes de alimentação comutadas (SMPS) queimadas por sobretensão na rede elétrica',
      'Pistas de circuito impresso rompidas por corrosão ou sobreaquecimento',
      'Transístores MOSFET e pontes retificadoras em curto',
      'Circuito integrado de controlo PWM com furo ou estalado',
      'Condensadores eletrolíticos estufados ou com ESR fora de tolerância',
    ],
    solutions: [
      'Inspeção visual com microscópio estereoscópico de alta definição',
      'Deteção de curtos através de câmara térmica e injeção de tensão controlada',
      'Dessoldagem e soldadura SMD/BGA com estação de ar quente e ferros termocontrolados',
      'Reconstrução de trilhas e vias de cobre com fio de cobre esmaltado e verniz UV',
      'Substituição de drivers de potência (IGBTs, MOSFETs, pontes retificadoras)',
    ],
    coveredEquipment: [
      'Placas de máquinas de lavar e frigoríficos inverter',
      'Placas de ar condicionado split e centrais VRF',
      'Placas principais de equipamentos industriais e automação',
      'Fontes de alimentação de servidores e UPS',
    ],
    processSteps: [
      { title: '1. Inspeção Óptica e Térmica', detail: 'Localização dos pontos com aquecimento anómalo ou marcas de queima com microscópio.' },
      { title: '2. Dessoldagem Cirúrgica', detail: 'Extração limpa do semicondutor sem danificar as ilhas de solda da placa.' },
      { title: '3. Soldadura de Componente Original', detail: 'Instalação de componente com especificações elétricas idênticas ou reforçadas.' },
      { title: '4. Ensaio com Carga Simulada', detail: 'Alimentação gradual da placa com fonte de laboratório e lâmpada em série para proteção.' },
    ],
    faqs: [
      {
        question: 'Porque reparar a placa em vez de comprar uma nova?',
        answer: 'Reparar ao nível de componente poupa habitualmente entre 60% a 80% do valor de uma placa nova, além de reduzir drasticamente o tempo de espera por encomendas internacionais.',
      },
      {
        question: 'Dão garantia na reparação de placas?',
        answer: 'Sim, garantimos o serviço realizado e a linha de circuito intervencionada.',
      },
    ],
    imagePlaceholder: 'TODO_CONTEUDO: /public/images/servicos/reparacao-placas.jpg (Fotografia real Ama Tec pendente)',
    relatedServiceSlugs: ['reparacao-de-televisores', 'instalacoes-eletricas-diagnostico'],
    seoTitle: 'Reparação de Placas Eletrónicas em Luanda | Ama Tec Component Level',
    seoDescription: 'Reparação de placas eletrónicas de ar condicionado, eletrodomésticos e máquinas industriais em Luanda. Soldadura SMD pela Ama Tec.',
  },

  // --- ELÉTRICA ---
  {
    id: 'srv-eletrica',
    slug: 'instalacoes-eletricas-diagnostico',
    name: 'Instalações Elétricas & Diagnóstico de Avarias',
    category: 'eletrica',
    categoryName: 'Instalações & Elétrica',
    shortDescription: 'Instalação de quadros, proteção contra picos de tensão, diagnóstico de curto-circuitos e circuitos dedicados.',
    fullDescription: 'Uma instalação elétrica deficiente danifica irremediavelmente aparelhos eletrónicos sensíveis. A Ama Tec fornece serviços elétricos focados na proteção de equipamentos: quadros elétricos de distribuição, descarregadores de sobretensão (DPS), estabilizadores e equilíbrio de fases.',
    commonProblems: [
      'Disjuntor diferencial a disparar aleatoriamente sem causa evidente',
      'Picos de tensão constantes queimando aparelhos em casa ou no escritório',
      'Cheiro a queimado em caixas de derivação ou tomadas sobreaquecidas',
      'Tensão instável entre neutro e terra provocando choques na carcaça de aparelhos',
    ],
    solutions: [
      'Instalação de dispositivos de proteção contra sobretensões transitórias (DPS)',
      'Equilibrio de cargas entre fases em quadros trifásicos',
      'Deteção de fugas de corrente à terra através de pinça amperimétrica de precisão',
      'Instalação de circuitos dedicados com secção de cabo adequada para ar condicionado e fornos',
    ],
    coveredEquipment: [
      'Quadros elétricos residenciais e terciários',
      'Linhas de alimentação dedicada para aparelhos de alta potência',
      'Sistemas de proteção com descarregadores e disjuntores diferenciais',
    ],
    processSteps: [
      { title: '1. Medição das Grandezas Elétricas', detail: 'Registo de voltagens Fase-Neutro, Fase-Fase e Neutro-Terra com multímetro True-RMS.' },
      { title: '2. Rastreio de Circuitos', detail: 'Identificação dos circuitos com fuga ou sobreaquecimento com câmara termográfica.' },
      { title: '3. Execução Técnica Segura', detail: 'Instalação conforme as regras técnicas de instalações elétricas.' },
    ],
    faqs: [
      {
        question: 'Os meus aparelhos estão sempre a queimar. Podem ajudar?',
        answer: 'Sim. Efetuamos auditoria de tensão no quadro e instalamos módulos de proteção que desligam automaticamente as cargas perante picos ou quebras anómalas de energia.',
      },
    ],
    imagePlaceholder: 'TODO_CONTEUDO: /public/images/servicos/eletrica.jpg (Fotografia real Ama Tec pendente)',
    relatedServiceSlugs: ['reparacao-de-placas-eletronicas', 'manutencao-preventiva-corretiva'],
    seoTitle: 'Instalações Elétricas e Diagnóstico em Luanda | Ama Tec',
    seoDescription: 'Proteção contra picos de tensão, quadros elétricos e resolução de curto-circuitos em Luanda com a equipa técnica da Ama Tec.',
  },

  // --- INFORMÁTICA ---
  {
    id: 'srv-informatica',
    slug: 'assistencia-informatica-portateis',
    name: 'Assistência a Computadores & Portáteis',
    category: 'informatica',
    categoryName: 'Informática & TI',
    shortDescription: 'Reparação de hardware de computadores desktop e portáteis. Substituição de ecrãs, baterias, teclados e placas-mãe.',
    fullDescription: 'Seja para trabalho de escritório ou computação profissional, garantimos diagnósticos rápidos para computadores que não ligam, sobreaquecem ou sofreram derrame de líquidos. Substituição de memórias, discos SSD ultrarrápidos e limpeza térmica profunda.',
    commonProblems: [
      'Portátil não liga nem acende luzes ao ligar o carregador',
      'Sobreaquecimento severo com desligamento automático ao abrir programas pesados',
      'Ecrã partido, com linhas verticais ou sem luz de retroiluminação',
      'Teclado com teclas travadas após derrame de líquido ou desgaste',
      'Porta USB-C ou conector de carga (DC Jack) partido ou com mau contacto',
    ],
    solutions: [
      'Substituição de pasta térmica por compostos de alto rendimento e desobstrução de ventoinhas',
      'Reparação de circuitos de carga e conector de alimentação na placa-mãe',
      'Substituição de painéis de ecrã LED IPS originais',
      'Substituição de baterias internas e teclados mecânicos/membrana',
      'Migração de sistema para SSD de alta velocidade sem perda de dados',
    ],
    coveredEquipment: [
      'Portáteis empresariais e de uso pessoal',
      'Computadores desktop (torres de trabalho e escritório)',
      'Monitores de computador e fontes de alimentação ATX',
    ],
    processSteps: [
      { title: '1. Diagnóstico de Bancada', detail: 'Testes de bateria, memória RAM, integridade do disco e consumo na fonte DC.' },
      { title: '2. Limpeza Ultrassónica de Oxidação', detail: 'Tratamento de placas que sofreram humidade com cuba de ultrassons e álcool isopropílico.' },
      { title: '3. Substituição e Montagem', detail: 'Aplicação de componentes compatíveis e montagem rigorosa.' },
      { title: '4. Stress Test de Temperatura', detail: 'Monitorização de curvas térmicas sob 100% de carga de CPU/GPU.' },
    ],
    faqs: [
      {
        question: 'Derramei água no meu portátil. O que devo fazer imediatamente?',
        answer: 'Desligue-o imediatamente da corrente, não tente ligá-lo e remova a bateria se for amovível. Leve-o logo à Ama Tec para desoxidação antes que as pistas de cobre sofram corrosão galvânica irreversível.',
      },
    ],
    imagePlaceholder: 'TODO_CONTEUDO: /public/images/servicos/informatica.jpg (Fotografia real Ama Tec pendente)',
    relatedServiceSlugs: ['reparacao-de-placas-eletronicas', 'balancas-pos-comercial'],
    seoTitle: 'Reparação de Portáteis e Computadores em Luanda | Ama Tec',
    seoDescription: 'Assistência informática especializada em Luanda. Diagnóstico de hardware de portáteis e desktops pela Ama Tec.',
  },

  // --- MANUTENÇÃO ---
  {
    id: 'srv-manutencao',
    slug: 'manutencao-preventiva-corretiva',
    name: 'Manutenção Preventiva & Auditoria Técnica',
    category: 'manutencao',
    categoryName: 'Planos de Manutenção',
    shortDescription: 'Planos de inspeção periódica, limpeza técnica especializada e testes de carga para residências e empresas.',
    fullDescription: 'A manutenção preventiva reduz as avarias catastróficas em mais de 70%. Na Ama Tec criamos rotinas técnicas de inspeção, verificação de apertos elétricos, despoeiramento de equipamentos e monitorização contínua através do futuro ecossistema Ama Tec 365.',
    commonProblems: [
      'Acumulação de poeiras industriais e humidade gerando arcos elétricos',
      'Falta de lubrificação mecânica originando queima de motores',
      'Desgaste silencioso de rolamentos e condensadores que param a operação sem aviso',
    ],
    solutions: [
      'Protocolos de despoeiramento com ar comprimido seco e produtos dielétricos',
      'Inspeção termográfica periódica a quadros e pontos de consumo crítico',
      'Substituição proativa de componentes sujeitos a desgaste térmico',
      'Emissão de relatórios técnicos de estado e recomendações para gestores de instalações',
    ],
    coveredEquipment: [
      'Parques de eletrodomésticos em residências e condomínios',
      'Equipamentos de restauração e lavandaria em operação diária',
      'Sistemas de ar condicionado e ventilação técnica',
    ],
    processSteps: [
      { title: '1. Levantamento Cadastral', detail: 'Inventariação de todos os equipamentos com identificador único e histórico.' },
      { title: '2. Inspeção Periódica Agendada', detail: 'Deslocação da equipa com checklist técnica detalhada.' },
      { title: '3. Limpeza e Reapertos', detail: 'Manutenção física preventiva em todos os pontos de contacto elétrico e mecânico.' },
      { title: '4. Relatório Técnico Digital', detail: 'Disponibilização do estado de saúde dos aparelhos e alertas de intervenção.' },
    ],
    faqs: [
      {
        question: 'O que é o programa Ama Tec 365?',
        answer: 'É a nossa solução em desenvolvimento de acompanhamento e assistência contínua 365 dias por ano para clientes residenciais e corporativos.',
      },
    ],
    imagePlaceholder: 'TODO_CONTEUDO: /public/images/servicos/manutencao.jpg (Fotografia real Ama Tec pendente)',
    relatedServiceSlugs: ['cozinhas-industriais', 'instalacoes-eletricas-diagnostico'],
    seoTitle: 'Manutenção Preventiva de Equipamentos em Luanda | Ama Tec',
    seoDescription: 'Planos de manutenção preventiva e corretiva para empresas e residências em Luanda. Conheça as soluções da Ama Tec.',
  },
];
