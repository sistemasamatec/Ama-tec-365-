import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  Wrench,
  ShieldCheck,
  Cpu,
  Tv,
  Flame,
  UtensilsCrossed,
  Zap,
  Laptop,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  Clock,
  Phone,
  HelpCircle,
} from 'lucide-react';
import { COMPANY } from '../content/company';
import { CATEGORIES_CONFIG, SERVICES } from '../content/services';
import { getGeneralWhatsAppUrl } from '../lib/whatsapp';
import { updateDocumentSeo, getLocalBusinessJsonLd } from '../lib/seo';
import { AssistanceForm } from '../components/forms/AssistanceForm';
import { CustomerTestimonials } from '../components/testimonials/CustomerTestimonials';
import { track } from '../lib/analytics';

export const HomePage: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    updateDocumentSeo({
      title: 'Ama Tec — Assistência Técnica de Equipamentos Eletrónicos em Luanda',
      description:
        'Centro especializado de diagnóstico e reparação de televisores, máquinas de lavar, eletrodomésticos, eletrónica avançada e equipamentos industriais em Luanda, Angola.',
      canonicalPath: '/',
    });
  }, []);

  const featuredServices = SERVICES.slice(0, 6);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Schema.org JSON-LD para LocalBusiness */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getLocalBusinessJsonLd()) }}
      />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#0B1220] text-[#E6EDF7] py-16 lg:py-24 border-b border-[#111B2E]">
        {/* Subtle engineering grid background */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#0EA5E9 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="flex items-center gap-2 text-[14px] text-[#0EA5E9] font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-[#0EA5E9]"></span>
                <span>Assistência Técnica Oficial em Luanda</span>
                <span className="text-[#475569]">·</span>
                <span>Golf 2, Rua dos Príncipes</span>
              </div>

              <h1 className="text-h1 sm:text-display font-heading font-extrabold tracking-tight leading-[1.12] text-white">
                Reparação precisa de equipamentos eletrónicos com garantia.
              </h1>

              <p className="text-[16px] sm:text-lg text-[#CBD5E1] leading-relaxed max-w-2xl">
                A <strong className="text-white">Ama Tec</strong> é o centro técnico em Luanda dedicado ao diagnóstico rigoroso e reparação de eletrodomésticos, televisores, placas eletrónicas ao nível de componentes e equipamentos industriais.
              </p>

              {/* Primary Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to="/solicitar-assistencia"
                  onClick={() => track('conversion', { location: 'hero_primary' })}
                  className="btn-primary"
                >
                  <Wrench className="w-5 h-5" />
                  <span>Solicitar Assistência</span>
                </Link>

                <a
                  href={getGeneralWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('whatsapp_click', { location: 'hero_whatsapp' })}
                  className="btn-whatsapp"
                >
                  <MessageSquare className="w-5 h-5 text-white" />
                  <span>Falar com Técnico no WhatsApp</span>
                </a>
              </div>

              {/* Unboxed Metadata Trust Pillars */}
              <div className="pt-6 border-t border-[#111B2E] flex flex-wrap items-center gap-y-3 gap-x-6 text-[14px] text-[#CBD5E1]">
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#0EA5E9]" />
                  <span>Garantia sobre Peças e Mão-de-Obra</span>
                </div>
                <span className="text-[#475569] hidden sm:inline" aria-hidden="true">·</span>
                <div className="flex items-center gap-2 font-medium">
                  <Cpu className="w-4 h-4 text-[#0EA5E9]" />
                  <span>Reparação ao Nível de Componentes SMD</span>
                </div>
                <span className="text-[#475569] hidden sm:inline" aria-hidden="true">·</span>
                <div className="flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 text-[#0EA5E9]" />
                  <span>Diagnóstico Técnico Transparente</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Technical Workbench Composition + Animated Warranty Seal */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-[14px] overflow-hidden border border-[#111B2E] shadow-2xl bg-[#060B16] group">
                <div className="aspect-[4/3] w-full overflow-hidden relative bg-[#060B16]">
                  <img
                    src="/images/hero-workbench.jpg"
                    alt="Bancada Técnica Oficial Ama Tec com equipamento de diagnóstico eletrónico"
                    loading="eager"
                    width="600"
                    height="450"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-t-[14px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060B16] via-[#060B16]/30 to-transparent pointer-events-none" />

                  {/* Top Technical Status Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-[10px] bg-[#060B16]/90 backdrop-blur-md text-white text-[14px] font-semibold border border-[#1B2A44] flex items-center gap-2 shadow-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                    <span>Bancada Técnica Ativa · Golf 2</span>
                  </div>

                  {/* Micro-chip inspection tag */}
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-[8px] bg-[#0B1220]/90 backdrop-blur-xs text-[#0EA5E9] text-[14px] font-mono border border-[#0284C7]/40">
                    SMD & Micro-soldadura
                  </div>
                </div>

                {/* Bottom Workbench Details Panel */}
                <div className="p-5 bg-[#060B16] border-t border-[#111B2E] space-y-3">
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="text-[#94A3B8] font-medium">Capacidade Operacional</span>
                    <span className="text-[#10B981] font-semibold font-mono">100% Operacional</span>
                  </div>
                  
                  {/* Equipment Mini Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[14px] text-[#E6EDF7] text-center font-medium">
                    <div className="bg-[#111B2E] rounded-[8px] py-1.5 px-2 border border-[#1B2A44]">
                      Smart TVs
                    </div>
                    <div className="bg-[#111B2E] rounded-[8px] py-1.5 px-2 border border-[#1B2A44]">
                      Lavar & Secar
                    </div>
                    <div className="bg-[#111B2E] rounded-[8px] py-1.5 px-2 border border-[#1B2A44]">
                      Air Fryer / Micro
                    </div>
                    <div className="bg-[#111B2E] rounded-[8px] py-1.5 px-2 border border-[#1B2A44]">
                      Industrial / POS
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Animated Warranty Seal */}
              <motion.div
                animate={prefersReducedMotion ? {} : { y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-6 -left-4 sm:-left-6 z-20 bg-gradient-to-br from-[#0284C7] to-[#111B2E] text-white p-3.5 sm:p-4 rounded-[14px] shadow-xl border border-[#0EA5E9]/40 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-[10px] bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
                  <ShieldCheck className="w-6 h-6 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-[14px] uppercase tracking-wider text-[#E0F2FE] font-bold">
                    Garantia Certificada
                  </div>
                  <div className="text-[15px] font-black tracking-tight text-white font-heading">
                    Peças & Mão-de-Obra
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NÚMEROS E CAPACIDADE TÉCNICA (Fundo claro, cards uniformizados) */}
      <section className="bg-white py-16 lg:py-24 border-b border-[#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-base p-8 sm:p-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center bg-white shadow-sm border border-[#E2E8F0]">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#060B16] font-heading tracking-tight">
                +3.200
              </div>
              <div className="text-[14px] sm:text-[15px] text-[#0284C7] font-semibold">
                Equipamentos Reparados
              </div>
              <div className="text-[14px] text-[#475569]">
                Triagem e diagnóstico rigoroso
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#059669] font-heading tracking-tight">
                98%
              </div>
              <div className="text-[14px] sm:text-[15px] text-[#0F172A] font-semibold">
                Taxa de Sucesso
              </div>
              <div className="text-[14px] text-[#475569]">
                Ao nível de componentes SMD
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#060B16] font-heading tracking-tight">
                6
              </div>
              <div className="text-[14px] sm:text-[15px] text-[#0284C7] font-semibold">
                Categorias Técnicas
              </div>
              <div className="text-[14px] text-[#475569]">
                Doméstico, comercial e TV
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-heading tracking-tight">
                100%
              </div>
              <div className="text-[14px] sm:text-[15px] text-[#0F172A] font-semibold">
                Garantia Técnica
              </div>
              <div className="text-[14px] text-[#475569]">
                Emitida em ordem de serviço
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AS 6 CATEGORIAS TÉCNICAS (Fundo alternado #F4F7FA) */}
      <section className="bg-[#F4F7FA] py-16 lg:py-24 border-b border-[#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="text-[14px] font-semibold text-[#0284C7] uppercase tracking-wider">
              Especialidades Oficiais
            </div>
            <h2 className="text-h2 font-heading font-extrabold text-[#060B16] tracking-tight">
              Cobertura Completa em 6 Categorias
            </h2>
            <p className="text-[16px] text-[#475569] leading-relaxed">
              Estrutura técnica com bancadas equipadas para intervenção desde pequenos aparelhos domésticos até grandes linhas de frio e restauração comercial.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: prefersReducedMotion ? 0 : 0.06,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {CATEGORIES_CONFIG.map((category) => (
              <motion.div
                key={category.id}
                variants={{
                  hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                }}
                className="card-base p-6 sm:p-7 shadow-xs hover:shadow-hover-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[14px] text-[#475569]">
                    <span className="font-semibold text-[#0284C7]">{category.badge}</span>
                    <span className="font-mono text-slate-400">Ama Tec</span>
                  </div>
                  <h3 className="text-xl font-bold font-heading text-[#060B16] group-hover:text-[#0284C7] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-[14px] text-[#475569] leading-relaxed">
                    {category.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E2E8F0] flex items-center justify-between">
                  <Link
                    to={`/servicos?categoria=${category.id}`}
                    className="text-[14px] font-semibold text-[#0284C7] hover:text-[#0EA5E9] flex items-center gap-1.5 transition-colors"
                  >
                    <span>Ver serviços desta categoria</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SERVIÇOS EM DESTAQUE (Fundo #FFFFFF) */}
      <section className="bg-white py-16 lg:py-24 border-b border-[#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[14px] font-semibold text-[#0284C7] uppercase tracking-wider">
                Catálogo de Intervenções
              </span>
              <h2 className="text-h2 font-heading font-extrabold text-[#060B16] tracking-tight">
                Serviços com Atendimento Imediato
              </h2>
              <p className="text-[14px] sm:text-[15px] text-[#475569] max-w-xl">
                Cada serviço possui bancada dedicada, protocolo de diagnóstico prévio e garantia técnica discriminada.
              </p>
            </div>
            <Link
              to="/servicos"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#0284C7] hover:text-[#0EA5E9] shrink-0"
            >
              <span>Ver todos os serviços</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: prefersReducedMotion ? 0 : 0.06,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {featuredServices.map((service) => {
              const catConfig = CATEGORIES_CONFIG.find((c) => c.id === service.category);
              const cardImg =
                service.imageUrl ||
                (service.category === 'domestico'
                  ? '/images/service-appliances.jpg'
                  : '/images/service-electronics.jpg');

              return (
                <motion.div
                  key={service.id}
                  variants={{
                    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                  }}
                  className="card-base overflow-hidden shadow-xs hover:shadow-hover-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Imagem do Card (Proporção 4:3) com Overlay Navy->Transparente e Ícone */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#060B16]">
                    <img
                      src={cardImg}
                      alt={service.imageAlt || service.name}
                      loading="lazy"
                      width="400"
                      height="300"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-t-[14px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060B16]/85 via-[#060B16]/25 to-transparent pointer-events-none" />

                    {/* Ícone e Nome da Categoria no Topo */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-[8px] bg-[#060B16]/90 backdrop-blur-xs text-white text-[14px] font-semibold border border-[#1B2A44] flex items-center gap-1.5 shadow-sm">
                      <span>{catConfig?.icon || '🔧'}</span>
                      <span>{service.categoryName}</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[14px] text-[#475569]">
                        <span className="text-[#0284C7] font-semibold">{service.categoryName}</span>
                        <span className="font-mono text-slate-400">Oficina Luanda</span>
                      </div>

                      <h3 className="text-lg font-bold font-heading text-[#060B16] group-hover:text-[#0284C7] transition-colors">
                        {service.name}
                      </h3>

                      <p className="text-[14px] text-[#475569] leading-relaxed line-clamp-2">
                        {service.shortDescription}
                      </p>

                      <div className="pt-1">
                        <span className="text-[14px] font-semibold text-[#0F172A] uppercase tracking-wider block mb-1">
                          Problemas frequentes resolvidos:
                        </span>
                        <ul className="text-[14px] text-[#475569] space-y-1">
                          {service.commonProblems.slice(0, 2).map((prob, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 truncate">
                              <span className="text-[#059669] shrink-0 font-bold">✓</span>
                              <span className="truncate">{prob}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[14px]">
                      <Link
                        to={`/servicos/${service.slug}`}
                        className="font-semibold text-[#0284C7] hover:text-[#0EA5E9] flex items-center gap-1"
                      >
                        <span>Ver detalhes</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <Link
                        to={`/solicitar-assistencia?servico=${service.slug}`}
                        className="btn-primary min-h-[44px] px-4 py-2 text-[14px]"
                      >
                        Pedir
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* COMO FUNCIONA O PROCESSO DE ASSISTÊNCIA (Fundo #F4F7FA) */}
      <section className="bg-[#F4F7FA] py-16 lg:py-24 border-b border-[#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[14px] font-semibold text-[#0284C7] uppercase tracking-wider">
              Transparência & Método
            </span>
            <h2 className="text-h2 font-heading font-extrabold text-[#060B16] tracking-tight">
              Como Funciona o Nosso Atendimento
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#475569]">
              Processo direto sem surpresas: sabe exatamente o que está a ser intervencionado e o valor antes da execução.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Pedido & Triagem',
                desc: 'Envia o pedido via formulário do site ou WhatsApp indicando a marca e a anomalia verificada.',
              },
              {
                step: '02',
                title: 'Diagnóstico Técnico',
                desc: 'O aparelho é inspecionado na bancada com instrumentos de precisão para identificar o componente falhado.',
              },
              {
                step: '03',
                title: 'Orçamento Aprovado',
                desc: 'Apresentamos orçamento discriminado com custo de componentes e mão-de-obra para aprovação formal.',
              },
              {
                step: '04',
                title: 'Reparação & Garantia',
                desc: 'Substituição das peças defeituosas, testes térmicos sob carga contínua e entrega com garantia técnica.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="card-base p-6 relative flex flex-col justify-between bg-white shadow-xs"
              >
                <div className="space-y-3">
                  <span className="text-3xl font-black text-[#0EA5E9] block font-heading">
                    {item.step}
                  </span>
                  <h3 className="text-base font-bold font-heading text-[#060B16]">{item.title}</h3>
                  <p className="text-[14px] text-[#475569] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS DE CLIENTES & CASOS DE SUCESSO (Fundo #FFFFFF) */}
      <CustomerTestimonials />

      {/* SEÇÃO PRINCIPAL DE CONVERSÃO / FORMULÁRIO (Fundo #F4F7FA) */}
      <section id="pedido" className="bg-[#F4F7FA] py-16 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-[14px] font-semibold text-[#0284C7] uppercase tracking-wider">
                  Atendimento em Luanda
                </span>
                <h2 className="text-h2 font-heading font-extrabold text-[#060B16] tracking-tight">
                  Peça o seu Diagnóstico Técnico
                </h2>
                <p className="text-[16px] text-[#475569] leading-relaxed">
                  Preencha o formulário para registar o seu equipamento na base de dados da Ama Tec. A nossa equipa entrará em contacto para agendamento da entrega ou recolha.
                </p>
              </div>

              <div className="space-y-3 text-[14px] text-[#0F172A]">
                <div className="flex items-center gap-2.5 font-medium">
                  <CheckCircle className="w-5 h-5 text-[#059669] shrink-0" />
                  <span>Contacto telefónico rápido após submissão</span>
                </div>
                <div className="flex items-center gap-2.5 font-medium">
                  <CheckCircle className="w-5 h-5 text-[#059669] shrink-0" />
                  <span>Registo garantido na base de dados interna</span>
                </div>
                <div className="flex items-center gap-2.5 font-medium">
                  <CheckCircle className="w-5 h-5 text-[#059669] shrink-0" />
                  <span>Relatório técnico e teste funcional na entrega</span>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="card-base bg-emerald-50 border border-emerald-200 p-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-[15px]">
                  <MessageSquare className="w-5 h-5 text-[#059669]" />
                  <span>Prefere falar diretamente no WhatsApp?</span>
                </div>
                <p className="text-[14px] text-emerald-800 leading-relaxed">
                  Pode enviar fotos ou vídeos do aparelho com avaria diretamente para o técnico responsável de plantão.
                </p>
                <a
                  href={getGeneralWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('whatsapp_click', { location: 'home_lead_callout' })}
                  className="inline-flex items-center gap-2 text-[14px] font-bold text-[#059669] hover:text-[#10B981] underline"
                >
                  Abrir WhatsApp ({COMPANY.whatsappDisplay}) &rarr;
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <AssistanceForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
