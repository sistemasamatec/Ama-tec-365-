import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Clock, CreditCard, MapPin, MessageSquare, Phone } from 'lucide-react';
import { COMPANY } from '../content/company';
import { updateDocumentSeo } from '../lib/seo';
import { getGeneralWhatsAppUrl } from '../lib/whatsapp';

interface FAQCategory {
  title: string;
  icon: React.ElementType;
  items: { question: string; answer: string }[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: 'Prazos de Diagnóstico e Reparação',
    icon: Clock,
    items: [
      {
        question: 'Quanto tempo demora o diagnóstico técnico inicial?',
        answer:
          'O diagnóstico na bancada da oficina da Ama Tec no Golf 2 é efetuado habitualmente num prazo de 24 a 48 horas úteis. Em casos de avarias intermitentes ou danos complexos por descarga atmosférica/elétrica, efetuamos testes contínuos de estabilidade.',
      },
      {
        question: 'Qual é o prazo médio para a conclusão da reparação?',
        answer:
          'Após a aprovação do orçamento pelo cliente e havendo componentes em stock (fontes, barras LED, tirístores, sensores), a intervenção é concluída entre 24 a 72 horas. Se for necessária a importação de placa específica, o cliente é notificado imediatamente com a estimativa exata de chegada.',
      },
      {
        question: 'Posso levar o aparelho diretamente à oficina sem agendamento?',
        answer:
          'Sim, a nossa bancada no Golf 2 (Rua dos Príncipes) está aberta para receção de aparelhos de segunda a sexta-feira (08:00 às 18:00) e sábados (08:00 às 13:00). No entanto, recomendamos o preenchimento prévio do formulário no site ou envio de mensagem por WhatsApp para triagem prioritária.',
      },
    ],
  },
  {
    title: 'Garantia e Peças de Substituição',
    icon: ShieldCheck,
    items: [
      {
        question: 'As reparações da Ama Tec têm garantia por escrito?',
        answer:
          'Sim. Todas as intervenções técnicas efetuadas pela Ama Tec são acompanhadas por comprovativo escrito de garantia oficial de 90 dias sobre os componentes substituídos e a mão-de-obra executada.',
      },
      {
        question: 'As peças utilizadas são originais ou compatíveis de alta qualidade?',
        answer:
          'Trabalhamos exclusivamente com componentes novos, módulos originais dos fabricantes (Samsung, LG, Philips, Midea, Bosch, etc.) ou componentes eletrónicos de especificação industrial equivalente testados com osciloscópio e multímetro de precisão.',
      },
    ],
  },
  {
    title: 'Formas de Pagamento em Luanda',
    icon: CreditCard,
    items: [
      {
        question: 'Quais são as formas de pagamento aceites?',
        answer:
          'Aceitamos Multicaixa / TPA na oficina, Transferência Bancária Imediata (Multicaixa Express / BAI Directo / BFA Net / Standard Bank) e numerário (Kwanza - AOA). Para empresas, emitimos fatura proforma e fatura/recibo com NIF oficial 5001399837.',
      },
      {
        question: 'Tenho de pagar algum adiantamento antes do diagnóstico?',
        answer:
          'Não exigimos adiantamento para a triagem inicial do seu equipamento. O valor total só é liquidado após o teste presencial ou aprovação formal do orçamento discriminado de peças.',
      },
    ],
  },
  {
    title: 'Localização, Deslocações e Recolha',
    icon: MapPin,
    items: [
      {
        question: 'A Ama Tec faz reparações ao domicílio ou apenas na oficina?',
        answer:
          'Para equipamentos de grande porte ou de frio comercial (câmaras, vitrines industriais, quadros elétricos), disponibilizamos equipa técnica com viatura para deslocação em Luanda. Para televisores, micro-ondas e pequenos eletrodomésticos, a assistência é realizada na nossa bancada no Golf 2 para assegurar instrumentação controlada e testes de bancada.',
      },
      {
        question: 'Qual é a morada exata da oficina?',
        answer:
          'Estamos no Golf 2, Rua dos Príncipes, Luanda, Angola. Coordenadas e direções diretas via Google Maps ou Waze estão disponíveis na nossa página de Contactos.',
      },
    ],
  },
];

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<string | null>('0-0');

  useEffect(() => {
    updateDocumentSeo({
      title: 'Perguntas Frequentes (FAQ) | Ama Tec Luanda',
      description:
        'Respostas a dúvidas comuns sobre prazos médios de diagnóstico, garantia oficial de 90 dias por escrito, formas de pagamento aceites e localização da oficina no Golf 2.',
      canonicalPath: '/faq',
    });
  }, []);

  const toggleItem = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  // Schema.org FAQPage estruturado
  const allFaqs = FAQ_DATA.flatMap((cat) => cat.items);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
          <span>Esclarecimento Técnico Transparente</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Perguntas Frequentes (FAQ)
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Tire as suas dúvidas sobre o funcionamento da oficina da Ama Tec no Golf 2, prazos de diagnóstico, garantias e formas de pagamento.
        </p>
      </div>

      {/* FAQ Categories & Accordions */}
      <div className="space-y-8">
        {FAQ_DATA.map((category, catIdx) => {
          const Icon = category.icon;
          return (
            <div key={catIdx} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">{category.title}</h2>
              </div>

              <div className="divide-y divide-slate-100">
                {category.items.map((item, itemIdx) => {
                  const id = `${catIdx}-${itemIdx}`;
                  const isOpen = openIndex === id;
                  return (
                    <div key={itemIdx} className="py-3.5 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() => toggleItem(id)}
                        className="w-full flex items-center justify-between text-left gap-4 font-semibold text-xs sm:text-sm text-slate-900 hover:text-sky-600 transition-colors py-1 cursor-pointer"
                        aria-expanded={isOpen}
                      >
                        <span>{item.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-sky-600 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed animate-fade-in pr-6">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Contact Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
        <h3 className="text-lg font-bold">Ainda tem alguma dúvida específica?</h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Fale diretamente com os nossos técnicos de bancada pelo WhatsApp ou ligue para a nossa linha de apoio.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={getGeneralWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Técnico</span>
          </a>
          <a
            href={`tel:${COMPANY.phone}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider transition-colors border border-slate-700"
          >
            <Phone className="w-4 h-4 text-sky-400" />
            <span>Ligar {COMPANY.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
