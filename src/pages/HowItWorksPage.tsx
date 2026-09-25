import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Search,
  FileCheck2,
  Cpu,
  ShieldCheck,
  ArrowRight,
  Clock,
  Phone,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { COMPANY } from '../content/company';
import { getGeneralWhatsAppUrl } from '../lib/whatsapp';
import { updateDocumentSeo, getFAQJsonLd } from '../lib/seo';
import { FAQItem } from '../types';

export const HowItWorksPage: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    updateDocumentSeo({
      title: 'Como Funciona o Processo de Assistência Técnica | Ama Tec',
      description:
        'Conheça as 5 etapas transparentes de reparação da Ama Tec em Luanda: do pedido inicial e diagnóstico à reparação e garantia.',
      canonicalPath: '/como-funciona',
    });
  }, []);

  const steps = [
    {
      num: '01',
      title: 'Contacto & Registo do Equipamento',
      icon: MessageSquare,
      desc: 'Inicia o processo enviando os dados do seu aparelho através do formulário do site ou pelo WhatsApp oficial. O seu pedido fica imediatamente registado na nossa base de dados.',
      details: [
        'Indicação da marca e modelo do aparelho',
        'Descrição sucinta dos sintomas ou avaria',
        'Localização em Luanda para agendamento',
      ],
    },
    {
      num: '02',
      title: 'Triagem & Entrada na Oficina',
      icon: Search,
      desc: 'O aparelho dá entrada na oficina Ama Tec (Golf 2, Rua dos Príncipes) com emissão de guia técnica de receção e registo fotográfico do estado físico.',
      details: [
        'Registo de integridade e acessórios',
        'Atribuição de número único de processo',
        'Alocação à bancada técnica especializada',
      ],
    },
    {
      num: '03',
      title: 'Diagnóstico & Orçamento Transparente',
      icon: FileCheck2,
      desc: 'Os nossos técnicos inspecionam os circuitos de alimentação, semicondutores e periféricos para identificar a causa raiz. Apresentamos orçamento antes de qualquer intervenção.',
      details: [
        'Discriminação exata das peças a substituir',
        'Valor da mão-de-obra e prazos previstos',
        'Aprovação obrigatória do cliente antes de avançar',
      ],
    },
    {
      num: '04',
      title: 'Intervenção Técnica & Testes de Carga',
      icon: Cpu,
      desc: 'Substituição dos componentes danificados com soldadura de precisão, aplicação de pasta térmica e higienização interna. Segue-se um teste contínuo de estresse térmico.',
      details: [
        'Soldadura SMD/BGA com equipamento regulado',
        'Ensaio térmico sob tensão real',
        'Verificação de isolamento e segurança elétrica',
      ],
    },
    {
      num: '05',
      title: 'Entrega com Garantia Técnica',
      icon: ShieldCheck,
      desc: 'O cliente é notificado para levantamento ou entrega do equipamento, acompanhado de relatório de intervenção e garantia técnica escrita sobre o serviço executado.',
      details: [
        'Demonstração de funcionamento no ato da entrega',
        'Garantia oficial sobre o serviço',
        'Suporte pós-reparação direto com a equipa',
      ],
    },
  ];

  const faqs: FAQItem[] = [
    {
      question: 'Como é realizado o diagnóstico técnico na oficina da Ama Tec?',
      answer:
        'O diagnóstico é efetuado nas nossas bancadas equipadas no Golf 2, em Luanda. Conectamos o aparelho a instrumentos de precisão (multímetros True-RMS, osciloscópios e fontes de bancada com limitação de corrente) para isolar o bloco em falha: fonte primária, estágio PWM, microcontrolador ou periféricos mecânicos. Não fazemos suposições; identificamos com rigor a causa raiz da avaria.',
    },
    {
      question: 'Quanto tempo demora habitualmente a emissão do diagnóstico e orçamento?',
      answer:
        'Para a maioria dos eletrodomésticos, televisores e sistemas comerciais, o diagnóstico é concluído entre 24 a 48 horas úteis após a receção física do aparelho. Avarias intermitentes ou placas que sofreram sobretensão grave podem requerer monitorização térmica adicional em bancada.',
    },
    {
      question: 'Como funciona a garantia dos serviços prestados?',
      answer:
        'Todas as reparações efetuadas pela Ama Tec contam com garantia técnica escrita sobre as peças novas aplicadas e sobre a mão-de-obra executada. A garantia cobre qualquer anomalia diretamente relacionada com a intervenção efetuada durante o período estipulado na guia de entrega.',
    },
    {
      question: 'O que está excluído da garantia técnica?',
      answer:
        'A garantia não cobre avarias decorrentes de fatores externos posteriores à entrega, designadamente: quedas físicas, entrada de líquidos, queima por picos severos de tensão na rede elétrica externa da habitação, ou violação dos selos de garantia por terceiros não autorizados.',
    },
    {
      question: 'O diagnóstico tem custos se eu optar por não avançar com a reparação?',
      answer:
        'Apresentamos sempre o orçamento de forma transparente antes de iniciar a substituição de qualquer peça. Se o cliente aprovar a intervenção, o valor do diagnóstico fica totalmente integrado no serviço de reparação. Em caso de recusa após desmontagem e análise exaustiva em bancada, aplica-se apenas a taxa de triagem e diagnóstico técnico acordada no ato de receção.',
    },
    {
      question: 'Como é formalizada a aprovação do orçamento?',
      answer:
        'Assim que os nossos técnicos concluem as medições, enviamos a discriminação das peças e do tempo de bancada diretamente por WhatsApp ou email oficial (geral@amatec.ao). A reparação só avança após confirmação expressa do cliente.',
    },
  ];

  const faqSchema = getFAQJsonLd(faqs);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Schema.org FAQPage structured data */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
          Método de Atendimento
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Como Funciona a Assistência Técnica
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Sem surpresas, sem custos ocultos. Conheça as 5 fases rigorosas que garantem a segurança do seu equipamento desde o diagnóstico até à entrega na Ama Tec.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:border-sky-300 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-1 flex items-center md:flex-col gap-2">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-sky-600">
                    {step.num}
                  </span>
                </div>

                <div className="md:col-span-6 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{step.title}</h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                    Garantias desta fase:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {step.details.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-sky-500 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ SECTION (ACCORDION INTERFACE) */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 lg:p-12 space-y-8">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <span>Perguntas Frequentes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dúvidas sobre Diagnóstico & Garantias
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Respostas transparentes sobre prazos de análise, critérios de garantia técnica e condições de orçamento na Ama Tec.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            const contentId = `faq-content-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all hover:border-slate-300"
              >
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-900 hover:text-sky-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-sky-600 shrink-0">
                      0{index + 1}
                    </span>
                    <span className="leading-snug">{faq.question}</span>
                  </span>
                  <div
                    className={`p-1.5 rounded-full bg-slate-100 text-slate-500 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 bg-sky-50 text-sky-600' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={contentId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 pt-1 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pl-11">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Conversion Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h3 className="text-2xl font-bold">Pronto para agendar o diagnóstico do seu aparelho?</h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Preencha o formulário online ou envie mensagem pelo WhatsApp para início imediato.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Link
            to="/solicitar-assistencia"
            className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-colors"
          >
            Solicitar Assistência Online
          </Link>
          <a
            href={getGeneralWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

