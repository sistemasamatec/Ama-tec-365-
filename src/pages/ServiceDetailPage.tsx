import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  Wrench,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  AlertCircle,
  MapPin,
  Clock,
} from 'lucide-react';
import { SERVICES } from '../content/services';
import { COMPANY } from '../content/company';
import { getServiceWhatsAppUrl } from '../lib/whatsapp';
import {
  updateDocumentSeo,
  getServiceJsonLd,
  getFAQJsonLd,
  getBreadcrumbJsonLd,
} from '../lib/seo';
import { AssistanceForm } from '../components/forms/AssistanceForm';
import { TodoNotice } from '../components/ui/TodoNotice';
import { track } from '../lib/analytics';
import { useServices } from '../context/ServicesContext';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const utmSource = searchParams.get('utm_source') || undefined;
  const { getServiceBySlug, isLoading } = useServices();

  const service = getServiceBySlug(slug || '') || SERVICES.find((s) => s.slug === slug);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (service) {
      updateDocumentSeo({
        title: service.seoTitle,
        description: service.seoDescription,
        canonicalPath: `/servicos/${service.slug}`,
      });
      track('service_view', { service_slug: service.slug, category: service.category });
    }
  }, [service]);

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Serviço não encontrado</h1>
        <p className="text-sm text-slate-600">
          O serviço técnico solicitado não se encontra no catálogo oficial da Ama Tec.
        </p>
        <Link
          to="/servicos"
          className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Catálogo de Serviços</span>
        </Link>
      </div>
    );
  }

  const relatedServices = SERVICES.filter((s) =>
    service.relatedServiceSlugs.includes(s.slug)
  );

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getServiceJsonLd(service)) }}
      />
      {service.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getFAQJsonLd(service.faqs)) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbJsonLd([
              { name: 'Início', url: '/' },
              { name: 'Serviços', url: '/servicos' },
              { name: service.name, url: `/servicos/${service.slug}` },
            ])
          ),
        }}
      />

      {/* Top Breadcrumb & Back Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/servicos" className="hover:text-sky-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Todos os Serviços</span>
          </Link>
          <span>/</span>
          <span>{service.categoryName}</span>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate">{service.name}</span>
        </div>
      </div>

      {/* SERVICE HERO & AD LANDING HEADER */}
      <section className="bg-slate-950 text-white py-12 sm:py-16 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span>{service.categoryName}</span>
                <span className="text-slate-600">·</span>
                <span>Assistência Técnica em Luanda</span>
              </div>

              {/* H1 Exclusivo */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {service.name}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                {service.fullDescription}
              </p>

              {/* Primary Direct CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="#formulario-pedido"
                  className="px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-md transition-all active:scale-95"
                >
                  Solicitar Diagnóstico Técnico
                </a>
                <a
                  href={getServiceWhatsAppUrl(service.name, utmSource)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    track('whatsapp_click', {
                      source: 'service_detail_hero',
                      service: service.slug,
                    })
                  }
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Contextual</span>
                </a>
              </div>
            </div>

            {/* Photo Placeholder strictly flagged with TODO_CONTEUDO */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
                <TodoNotice
                  label={`${service.imagePlaceholder}`}
                  type="photo"
                />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Em estrita conformidade com as regras da Ama Tec, não são usadas fotografias genéricas. Aguarda fotografia real de intervenção técnica na bancada da Ama Tec.
                </p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-sky-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Garantia oficial sobre o serviço</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORPO DO SERVIÇO: PROBLEMAS COMUNS E SOLUÇÕES TÉCNICAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problemas Comuns */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span>Sintomas e Problemas Comuns</span>
            </h2>
            <p className="text-xs text-slate-500">
              Falhas frequentes diagnosticadas e reparadas nesta categoria de equipamento:
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
              {service.commonProblems.map((prob, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                  <span className="leading-relaxed">{prob}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Soluções Técnicas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-sky-600" />
              <span>Soluções & Procedimentos Técnicos</span>
            </h2>
            <p className="text-xs text-slate-500">
              Intervenções técnicas executadas com instrumentos de precisão:
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
              {service.solutions.map((sol, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{sol}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* EQUIPAMENTOS ABRANGIDOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Equipamentos Abrangidos neste Serviço
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {service.coveredEquipment.map((eq, i) => (
              <div
                key={i}
                className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>{eq}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESSO DE ATENDIMENTO DETALHADO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            Etapas do Processo de Assistência
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Desde a receção na nossa oficina em Luanda até ao teste de estresse e entrega.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {service.processSteps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2 relative"
            >
              <span className="text-xs font-mono font-bold text-sky-600 block">
                FASE 0{idx + 1}
              </span>
              <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PERGUNTAS FREQUENTES (FAQ) */}
      {service.faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Perguntas Frequentes sobre {service.name}
            </h2>
            <p className="text-xs text-slate-500">
              Respostas diretas da nossa equipa técnica.
            </p>
          </div>

          <div className="space-y-3">
            {service.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 hover:text-sky-600 transition-colors"
                  aria-expanded={openFaqIndex === idx}
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      openFaqIndex === idx ? 'rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FORMULÁRIO DE PEDIDO CONTEXTUALIZADO */}
      <section id="formulario-pedido" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AssistanceForm
          defaultServiceName={service.name}
          defaultServiceCategory={service.category}
          defaultEquipment={service.coveredEquipment[0] || ''}
        />
      </section>

      {/* SERVIÇOS RELACIONADOS */}
      {relatedServices.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-200">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900">
              Serviços Técnicos Relacionados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedServices.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/servicos/${rel.slug}`}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all space-y-2 block"
                >
                  <span className="text-xs text-sky-600 font-semibold">{rel.categoryName}</span>
                  <h4 className="text-base font-bold text-slate-900">{rel.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {rel.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
