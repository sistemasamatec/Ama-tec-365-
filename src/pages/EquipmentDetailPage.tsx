import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Wrench, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { EQUIPMENT_CATALOG } from '../content/equipment';
import { SERVICES } from '../content/services';
import { getEquipmentWhatsAppUrl } from '../lib/whatsapp';
import { updateDocumentSeo } from '../lib/seo';
import { TodoNotice } from '../components/ui/TodoNotice';
import { track } from '../lib/analytics';
import { AssistanceForm } from '../components/forms/AssistanceForm';

export const EquipmentDetailPage: React.FC = () => {
  const { categoria, modelo } = useParams<{ categoria: string; modelo: string }>();

  const equipment = EQUIPMENT_CATALOG.find(
    (e) => e.slug === modelo || (e.category === categoria && e.slug === modelo)
  );

  const service = equipment
    ? SERVICES.find((s) => s.slug === equipment.serviceSlug)
    : null;

  useEffect(() => {
    if (equipment) {
      updateDocumentSeo({
        title: `Assistência ${equipment.name} (${equipment.brand}) | Ama Tec Luanda`,
        description: `Serviço de reparação e diagnóstico técnico para ${equipment.name}. Especificações e contacto da assistência técnica Ama Tec.`,
        canonicalPath: `/equipamentos/${equipment.category}/${equipment.slug}`,
      });
      track('equipment_open', { equipment_slug: equipment.slug, brand: equipment.brand });
    }
  }, [equipment]);

  if (!equipment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Equipamento não encontrado</h1>
        <p className="text-sm text-slate-600">
          O modelo pesquisado não consta atualmente no catálogo público da Ama Tec.
        </p>
        <Link
          to="/equipamentos"
          className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Catálogo de Equipamentos</span>
        </Link>
      </div>
    );
  }

  const relatedEquipment = EQUIPMENT_CATALOG.filter((e) =>
    equipment.relatedModels.includes(e.slug)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/equipamentos" className="hover:text-sky-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Catálogo de Equipamentos</span>
        </Link>
        <span>/</span>
        <span className="capitalize">{equipment.categoryName}</span>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate">{equipment.name}</span>
      </div>

      {/* Main Grid: Info + Image Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 uppercase tracking-wider">
              <span>{equipment.brand}</span>
              <span className="text-slate-400">·</span>
              <span>{equipment.categoryName}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {equipment.name}
            </h1>
            <p className="text-xs font-mono text-slate-500">
              Modelo Técnico: {equipment.model}
            </p>
          </div>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            {equipment.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#solicitar"
              className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              <span>Pedir Assistência para este Modelo</span>
            </a>

            <a
              href={getEquipmentWhatsAppUrl(equipment.name, equipment.brand, equipment.model)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track('whatsapp_click', {
                  source: 'equipment_detail',
                  equipment: equipment.slug,
                })
              }
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Técnico</span>
            </a>
          </div>

          {/* Especificações Técnicas */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Características & Especificações Técnicas
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {equipment.specifications.map((spec, i) => (
                <div key={i} className="bg-white p-3 rounded-lg border border-slate-200">
                  <dt className="text-slate-400 text-[11px] font-semibold uppercase">{spec.label}</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Serviço Associado */}
          {service && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6 space-y-2">
              <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider block">
                Serviço Técnico Recomendado
              </span>
              <h3 className="text-lg font-bold text-slate-900">{service.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {service.shortDescription}
              </p>
              <div className="pt-2">
                <Link
                  to={`/servicos/${service.slug}`}
                  className="text-xs font-bold text-sky-700 hover:text-sky-900 underline inline-flex items-center gap-1"
                >
                  <span>Ver página completa de {service.name} &rarr;</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Photo Placeholder and Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Registo Fotográfico do Equipamento
            </span>
            <TodoNotice label={equipment.photoPlaceholder} type="photo" />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Fotografia do modelo real aguarda carregamento pela equipa técnica da Ama Tec.
            </p>
          </div>

          <div id="solicitar">
            <AssistanceForm
              defaultEquipment={`${equipment.brand} ${equipment.name} (${equipment.model})`}
              defaultServiceCategory={equipment.category}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
