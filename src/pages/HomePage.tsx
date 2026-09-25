import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      <section className="relative overflow-hidden bg-slate-950 text-white pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800">
        {/* Subtle engineering grid background */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span>Assistência Técnica Oficial em Luanda</span>
                <span className="text-slate-600">·</span>
                <span>Golf 2, Rua dos Príncipes</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                Reparação precisa de equipamentos eletrónicos com garantia.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                A <strong>Ama Tec</strong> é o centro técnico em Luanda dedicado ao diagnóstico rigoroso e reparação de eletrodomésticos, televisores, placas eletrónicas ao nível de componentes e equipamentos industriais.
              </p>

              {/* Primary Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to="/solicitar-assistencia"
                  onClick={() => track('conversion', { location: 'hero_primary' })}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-base font-semibold shadow-lg shadow-sky-950/50 transition-all active:scale-95"
                >
                  <Wrench className="w-5 h-5" />
                  <span>Solicitar Assistência</span>
                </Link>

                <a
                  href={getGeneralWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('whatsapp_click', { location: 'hero_whatsapp' })}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-base font-semibold border border-emerald-500/40 transition-all"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-300" />
                  <span>Falar com Técnico no WhatsApp</span>
                </a>
              </div>

              {/* Unboxed Metadata Trust Pillars (Zero-pill discipline) */}
              <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-slate-400">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Garantia sobre Peças e Mão-de-Obra</span>
                </div>
                <span className="text-slate-700 hidden sm:inline" aria-hidden="true">·</span>
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  <span>Reparação ao Nível de Componentes SMD</span>
                </div>
                <span className="text-slate-700 hidden sm:inline" aria-hidden="true">·</span>
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>Diagnóstico Técnico Transparente</span>
                </div>
              </div>
            </div>

            {/* Right Card: Quick Assist / Featured Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <img
                      src="/brand/logo-symbol.svg"
                      alt="Ama Tec"
                      className="w-7 h-7"
                    />
                    <span className="font-bold text-white text-sm">Oficina Ama Tec</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Atendimento Ativo
                  </span>
                </div>

                <div className="py-5 space-y-4">
                  <h3 className="text-lg font-bold text-white">
                    Equipamentos Mais Atendidos
                  </h3>

                  <ul className="space-y-3 text-xs text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <Tv className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Smart TVs LED e OLED:</strong> Troca de réguas LED e reparação de fontes de alimentação comutadas.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Wrench className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Máquinas de Lavar e Secar:</strong> Desbloqueio de bombas, substituição de rolamentos e reprogramação de placas.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Flame className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Air Fryers e Micro-ondas:</strong> Testes térmicos, magnetrões e substituição de fusíveis térmicos calibrados.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <UtensilsCrossed className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Cozinhas e Comércio:</strong> Fornos convector, fritadeiras industriais trifásicas e balanças POS.
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
                  <Link
                    to="/servicos"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    <span>Explorar Catálogo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/servicos#simulador-orcamento"
                    className="flex items-center justify-center gap-1.5 py-3 px-3.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-colors"
                  >
                    <span>Simular Preço</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AS 6 CATEGORIAS TÉCNICAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
            Especialidades Oficiais
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Cobertura Completa em 6 Categorias
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Estrutura técnica com bancadas equipadas para intervenção desde pequenos aparelhos domésticos até grandes linhas de frio e restauração comercial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES_CONFIG.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-sky-700">{category.badge}</span>
                  <span className="font-mono text-slate-400">Ama Tec</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{category.name}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {category.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/servicos?categoria=${category.id}`}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1.5 transition-colors"
                >
                  <span>Ver serviços desta categoria</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVIÇOS EM DESTAQUE (Com páginas dedicadas e rotas reais) */}
      <section className="bg-slate-50 py-16 sm:py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
                Catálogo de Intervenções
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Serviços com Atendimento Imediato
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                Cada serviço possui bancada dedicada, protocolo de diagnóstico prévio e garantia técnica discriminada.
              </p>
            </div>
            <Link
              to="/servicos"
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 shrink-0"
            >
              <span>Ver todos os serviços</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="text-sky-600 font-medium">{service.categoryName}</span>
                    <span className="font-mono text-slate-400">Oficina Luanda</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {service.name}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {service.shortDescription}
                  </p>

                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                      Problemas frequentes resolvidos:
                    </span>
                    <ul className="text-[11px] text-slate-500 space-y-1">
                      {service.commonProblems.slice(0, 2).map((prob, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 truncate">
                          <span className="text-sky-500 shrink-0">✓</span>
                          <span className="truncate">{prob}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    to={`/servicos/${service.slug}`}
                    className="font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                  >
                    <span>Ver detalhes do serviço</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to={`/solicitar-assistencia?servico=${service.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-500 font-medium transition-colors"
                  >
                    Pedir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA O PROCESSO DE ASSISTÊNCIA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
            Transparência & Método
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Como Funciona o Nosso Atendimento
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
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
              className="bg-white rounded-2xl border border-slate-200 p-6 relative flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="text-3xl font-black text-sky-200 block font-mono">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DEPOIMENTOS DE CLIENTES & CASOS DE SUCESSO */}
      <CustomerTestimonials />

      {/* SEÇÃO PRINCIPAL DE CONVERSÃO / FORMULÁRIO */}
      <section id="pedido" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
                Atendimento em Luanda
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Peça o seu Diagnóstico Técnico
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Preencha o formulário para registar o seu equipamento na base de dados da Ama Tec. A nossa equipa entrará em contacto para agendamento da entrega ou recolha.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-center gap-2.5 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Contacto telefónico rápido após submissão</span>
              </div>
              <div className="flex items-center gap-2.5 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Registo garantido na base de dados interna</span>
              </div>
              <div className="flex items-center gap-2.5 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Garantia oficial sobre o serviço efetuado</span>
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Prefere falar diretamente no WhatsApp?</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Pode enviar fotos ou vídeos do aparelho com avaria diretamente para o técnico responsável de plantão.
              </p>
              <a
                href={getGeneralWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('whatsapp_click', { location: 'home_lead_callout' })}
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
              >
                Abrir WhatsApp ({COMPANY.whatsappDisplay}) &rarr;
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <AssistanceForm />
          </div>
        </div>
      </section>
    </div>
  );
};
