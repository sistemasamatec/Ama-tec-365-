import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Phone, Mail, FileText, Wrench, ArrowRight } from 'lucide-react';
import { COMPANY } from '../content/company';
import { updateDocumentSeo } from '../lib/seo';
import { TodoNotice } from '../components/ui/TodoNotice';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    updateDocumentSeo({
      title: 'Sobre a Ama Tec | Assistência Técnica de Equipamentos Eletrónicos',
      description:
        'Conheça a Ama Tec: dados oficiais da empresa, compromisso técnico, bancadas de diagnóstico e localização em Luanda, Angola.',
      canonicalPath: '/sobre',
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Hero Header */}
      <div className="max-w-3xl space-y-4">
        <div className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
          A Nossa Identidade
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Sobre a Ama Tec
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          A <strong>Ama Tec</strong> é uma empresa angolana focada na excelência técnica, na transparência de diagnóstico e na recuperação funcional de equipamentos eletrónicos, eletrodomésticos e sistemas industriais.
        </p>
      </div>

      {/* Identificação Oficial & Dados Legais */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-600" />
          <span>Dados Oficiais de Registo da Empresa</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-semibold uppercase text-[11px] block">
              Nome da Marca
            </span>
            <span className="font-bold text-slate-900 text-base">{COMPANY.brand}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-semibold uppercase text-[11px] block">
              Razão Social
            </span>
            <span className="font-semibold text-slate-800">{COMPANY.legalName}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-semibold uppercase text-[11px] block">
              Número de Identificação Fiscal (NIF)
            </span>
            <span className="font-mono font-bold text-slate-900">{COMPANY.nif}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-semibold uppercase text-[11px] block">
              Descritor de Atividade
            </span>
            <span className="font-semibold text-slate-800">{COMPANY.descriptor}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-semibold uppercase text-[11px] block">
              Localização da Sede & Oficina
            </span>
            <span className="font-semibold text-slate-800">
              {COMPANY.address}, {COMPANY.city}, {COMPANY.country}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-semibold uppercase text-[11px] block">
              Contactos Oficiais
            </span>
            <span className="font-semibold text-slate-800 block">{COMPANY.phoneDisplay}</span>
            <span className="text-slate-500 text-xs block">{COMPANY.email}</span>
          </div>
        </div>
      </section>

      {/* Compromissos Técnicos */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Diagnóstico ao Nível de Componente
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Priorizamos a identificação do componente eletrónico falhado (MOSFETs, circuitos integrados, fontes de alimentação, condensadores) em vez da substituição cega de placas completas, tornando as reparações mais rápidas e acessíveis.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Garantia Técnica Escrita
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Cada intervenção realizada pela Ama Tec é acompanhada de garantia técnica clara sobre as peças substituídas e o trabalho executado, proporcionando tranquilidade total ao utilizador.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Orçamentos Transparentes
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Nenhuma reparação é executada sem a aprovação explícita prévia do cliente após apresentação do orçamento técnico discriminado.
          </p>
        </div>
      </section>

      {/* Nota Deontológica Sobre Depoimentos e Números */}
      <section className="bg-slate-100/80 border border-slate-200 rounded-2xl p-6 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
          Compromisso de Veracidade Ama Tec
        </h4>
        <p className="leading-relaxed">
          Em rigoroso cumprimento com as diretrizes da marca, não publicamos números fictícios de clientes, prémios ou estatísticas sem certificação verificada. A secção de avaliações públicas apenas apresentará depoimentos devidamente autorizados e autenticados pelos nossos clientes reais.
        </p>
      </section>

      {/* CTA final */}
      <div className="pt-4 flex items-center justify-between border-t border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Precisa de assistência técnica?</h3>
          <p className="text-xs text-slate-500">Registe o seu equipamento ou fale diretamente connosco.</p>
        </div>
        <Link
          to="/solicitar-assistencia"
          className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
        >
          Pedir Assistência &rarr;
        </Link>
      </div>
    </div>
  );
};
