import React, { useEffect } from 'react';
import { Shield, FileText, Lock, CheckCircle2 } from 'lucide-react';
import { COMPANY } from '../content/company';
import { updateDocumentSeo } from '../lib/seo';

export const PrivacyPage: React.FC = () => {
  useEffect(() => {
    updateDocumentSeo({
      title: 'Política de Privacidade | Ama Tec',
      description:
        'Termos de proteção de dados pessoais e tratamento de informação técnica da Ama Tec em conformidade com a legislação de Angola.',
      canonicalPath: '/privacidade',
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div className="space-y-3">
        <div className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
          Enquadramento Legal & Proteção de Dados
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Política de Privacidade da Ama Tec
        </h1>
        <p className="text-xs text-slate-500">
          Última atualização: Setembro de 2026 · Aplicável a todos os utilizadores de {COMPANY.domain}
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs text-sky-900 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
          <span>
            <strong>Enquadramento Jurídico:</strong> A presente política rege-se pelos princípios da Lei de Proteção de Dados Pessoais de Angola (Lei n.º 22/11 de 17 de Junho) e pelas boas práticas de transparência digital. <em>(Texto sujeito a validação final pela gerência da Ama Tec / consultoria jurídica).</em>
          </span>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Entidade Responsável pelo Tratamento</h2>
          <p>
            A entidade responsável pelo tratamento dos dados recolhidos através deste sítio web é a{' '}
            <strong>{COMPANY.legalName}</strong> (designada comercialmente por <strong>{COMPANY.brand}</strong>), titular do NIF <strong>{COMPANY.nif}</strong>, com sede em {COMPANY.address}, {COMPANY.city}, Angola, e com o endereço de correio eletrónico {COMPANY.email}.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Dados Pessoais Recolhidos</h2>
          <p>
            Recolhemos unicamente os dados estritamente necessários para a prestação dos serviços de assistência técnica solicitados:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Nome completo:</strong> para identificação do cliente e emissão de guias técnicas de receção;</li>
            <li><strong>Número de telefone / WhatsApp:</strong> para contacto operacional sobre o estado do diagnóstico, aprovação de orçamentos e notificação de entrega;</li>
            <li><strong>Endereço de email (opcional):</strong> para envio de orçamentos e relatórios técnicos em formato digital;</li>
            <li><strong>Localização aproximada em Luanda:</strong> para planeamento logístico de recolha ou entrega de aparelhos;</li>
            <li><strong>Dados do equipamento e sintoma:</strong> para pré-diagnóstico na bancada técnica.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Finalidade e Base Legal do Tratamento</h2>
          <p>
            O tratamento destes dados tem por fundamento a execução de diligências pré-contratuais e contratuais a pedido do titular dos dados (artigo 14.º da Lei n.º 22/11). Em caso algum os seus dados serão comercializados ou cedidos a terceiros para campanhas publicitárias externas.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Armazenamento e Base de Dados</h2>
          <p>
            Os pedidos submetidos são armazenados na base de dados técnica da Ama Tec com recurso a padrões modernos de segurança física e lógica, sendo o acesso restrito aos técnicos e administrativos responsáveis pela gestão das ordens de reparação.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. Direitos do Titular dos Dados</h2>
          <p>
            Ao abrigo da legislação aplicável, o utilizador tem o direito de solicitar o acesso, retificação, atualização ou eliminação dos seus dados pessoais dos nossos registos. Para exercer estes direitos, contacte-nos através de <a href={`mailto:${COMPANY.email}`} className="text-sky-600 underline">{COMPANY.email}</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
