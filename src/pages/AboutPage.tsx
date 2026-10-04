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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-16">
      {/* Hero Header */}
      <div className="max-w-3xl space-y-4">
        <div className="text-[14px] font-semibold text-[#0284C7] uppercase tracking-wider">
          A Nossa Identidade
        </div>
        <h1 className="text-h1 font-heading font-extrabold text-[#060B16] tracking-tight">
          Sobre a Ama Tec
        </h1>
        <p className="text-[16px] text-[#475569] leading-relaxed">
          A <strong>Ama Tec</strong> é uma empresa angolana focada na excelência técnica, na transparência de diagnóstico e na recuperação funcional de equipamentos eletrónicos, eletrodomésticos e sistemas industriais.
        </p>
      </div>

      {/* Identificação Oficial & Dados Legais */}
      <section className="bg-[#F4F7FA] border border-[#E2E8F0] rounded-[14px] p-6 sm:p-10 space-y-6">
        <h2 className="text-xl font-bold font-heading text-[#060B16] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#0284C7]" />
          <span>Dados Oficiais de Registo da Empresa</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-[14px]">
          <div className="card-base bg-white p-4 space-y-1">
            <span className="text-[#475569] font-semibold uppercase text-[14px] block">
              Nome da Marca
            </span>
            <span className="font-bold text-[#060B16] text-[16px]">{COMPANY.brand}</span>
          </div>

          <div className="card-base bg-white p-4 space-y-1">
            <span className="text-[#475569] font-semibold uppercase text-[14px] block">
              Razão Social
            </span>
            <span className="font-semibold text-[#0F172A]">{COMPANY.legalName}</span>
          </div>

          <div className="card-base bg-white p-4 space-y-1">
            <span className="text-[#475569] font-semibold uppercase text-[14px] block">
              Número de Identificação Fiscal (NIF)
            </span>
            <span className="font-mono font-bold text-[#060B16]">{COMPANY.nif}</span>
          </div>

          <div className="card-base bg-white p-4 space-y-1">
            <span className="text-[#475569] font-semibold uppercase text-[14px] block">
              Descritor de Atividade
            </span>
            <span className="font-semibold text-[#0F172A]">{COMPANY.descriptor}</span>
          </div>

          <div className="card-base bg-white p-4 space-y-1">
            <span className="text-[#475569] font-semibold uppercase text-[14px] block">
              Localização da Sede & Oficina
            </span>
            <span className="font-semibold text-[#0F172A]">
              {COMPANY.address}, {COMPANY.city}, {COMPANY.country}
            </span>
          </div>

          <div className="card-base bg-white p-4 space-y-1">
            <span className="text-[#475569] font-semibold uppercase text-[14px] block">
              Contactos Oficiais
            </span>
            <span className="font-semibold text-[#0F172A] block">{COMPANY.phoneDisplay}</span>
            <span className="text-[#475569] text-[14px] block">{COMPANY.email}</span>
          </div>
        </div>
      </section>

      {/* Compromissos Técnicos */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card-base bg-white p-6 sm:p-8 space-y-3 shadow-xs hover:shadow-hover-card transition-all duration-300">
          <div className="w-10 h-10 rounded-[10px] bg-sky-50 text-[#0284C7] flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-heading text-[#060B16]">
            Diagnóstico ao Nível de Componente
          </h3>
          <p className="text-[14px] text-[#475569] leading-relaxed">
            Priorizamos a identificação do componente eletrónico falhado (MOSFETs, circuitos integrados, fontes de alimentação, condensadores) em vez da substituição cega de placas completas, tornando as reparações mais rápidas e acessíveis.
          </p>
        </div>

        <div className="card-base bg-white p-6 sm:p-8 space-y-3 shadow-xs hover:shadow-hover-card transition-all duration-300">
          <div className="w-10 h-10 rounded-[10px] bg-emerald-50 text-[#059669] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-heading text-[#060B16]">
            Garantia Técnica Escrita
          </h3>
          <p className="text-[14px] text-[#475569] leading-relaxed">
            Cada intervenção realizada pela Ama Tec é acompanhada de garantia técnica clara sobre as peças substituídas e o trabalho executado, proporcionando tranquilidade total ao utilizador.
          </p>
        </div>

        <div className="card-base bg-white p-6 sm:p-8 space-y-3 shadow-xs hover:shadow-hover-card transition-all duration-300">
          <div className="w-10 h-10 rounded-[10px] bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-heading text-[#060B16]">
            Orçamentos Transparentes
          </h3>
          <p className="text-[14px] text-[#475569] leading-relaxed">
            Nenhuma reparação é executada sem a aprovação explícita prévia do cliente após apresentação do orçamento técnico discriminado.
          </p>
        </div>
      </section>

      {/* Nota Deontológica Sobre Depoimentos e Números */}
      <section className="bg-[#F4F7FA] border border-[#E2E8F0] rounded-[14px] p-6 text-[14px] text-[#475569] space-y-2">
        <h4 className="font-bold text-[#060B16] uppercase tracking-wider text-[14px]">
          Compromisso de Veracidade Ama Tec
        </h4>
        <p className="leading-relaxed">
          Em rigoroso cumprimento com as diretrizes da marca, não publicamos números fictícios de clientes, prémios ou estatísticas sem certificação verificada. A secção de avaliações públicas apenas apresentará depoimentos devidamente autorizados e autenticados pelos nossos clientes reais.
        </p>
      </section>

      {/* CTA final */}
      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E2E8F0]">
        <div>
          <h3 className="text-lg font-bold font-heading text-[#060B16]">Precisa de assistência técnica?</h3>
          <p className="text-[14px] text-[#475569]">Registe o seu equipamento ou fale diretamente connosco.</p>
        </div>
        <Link
          to="/solicitar-assistencia"
          className="btn-primary min-h-[48px] px-6 text-[14px] inline-flex items-center justify-center gap-2"
        >
          <span>Pedir Assistência</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
