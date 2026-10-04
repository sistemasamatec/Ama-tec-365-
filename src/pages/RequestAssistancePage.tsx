import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AssistanceForm } from '../components/forms/AssistanceForm';
import { updateDocumentSeo } from '../lib/seo';
import { ShieldCheck, MessageSquare, Clock, CheckCircle2, CheckCircle, ArrowRight } from 'lucide-react';
import { COMPANY } from '../content/company';
import { getGeneralWhatsAppUrl } from '../lib/whatsapp';
import { track } from '../lib/analytics';

export const RequestAssistancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const servicoParam = searchParams.get('servico') || '';
  const equipamentoParam = searchParams.get('equipamento') || '';
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);

  useEffect(() => {
    updateDocumentSeo({
      title: 'Solicitar Assistência Técnica Online | Ama Tec Luanda',
      description:
        'Registe o seu pedido de assistência técnica para equipamentos eletrónicos, eletrodomésticos e industriais em Luanda com a equipa da Ama Tec.',
      canonicalPath: '/solicitar-assistencia',
    });
  }, []);

  const handleFormSuccess = (leadId: string) => {
    setSubmittedLeadId(leadId);
    // Rola suavemente para o topo para garantir feedback visual imediato
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-10">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-[14px] font-semibold text-[#0284C7] uppercase tracking-wider">
          Canal Direto de Pedidos
        </div>
        <h1 className="text-h1 font-heading font-extrabold text-[#060B16] tracking-tight">
          Solicitar Assistência Técnica
        </h1>
        <p className="text-[16px] text-[#475569] leading-relaxed">
          Preencha os detalhes do seu equipamento. O seu pedido será de imediato guardado na base de dados da Ama Tec para avaliação e contacto pelo nosso corpo técnico em Luanda.
        </p>
      </div>

      {/* Banner de Feedback Imediato com Animação Framer Motion */}
      <AnimatePresence>
        {submittedLeadId && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="p-4 sm:p-5 rounded-[14px] bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-300 text-[#0F172A] shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 18,
                    delay: 0.15,
                  }}
                  className="w-10 h-10 rounded-[10px] bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-xs"
                >
                  <CheckCircle2 className="w-6 h-6" />
                </motion.div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-bold text-[#060B16]">
                      Pedido Registado na Oficina Ama Tec!
                    </span>
                    <span className="font-mono text-[14px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-[6px]">
                      {submittedLeadId}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#475569]">
                    A equipa técnica no Golf 2, Luanda, já recebeu a sua notificação e iniciou a triagem.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-emerald-100/90 text-emerald-800 text-[14px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                  Passo 1 Concluído
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Information Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-base bg-[#F4F7FA] border border-[#E2E8F0] p-6 sm:p-8 space-y-6">
            <h3 className="font-bold font-heading text-[#060B16] text-base">
              O que acontece após o envio?
            </h3>

            <ol className="space-y-4 text-[14px] text-[#475569]">
              {/* Etapa 1 - com animação de concluído quando submetido */}
              <li className={`flex items-start gap-3 p-2 rounded-[10px] transition-colors ${submittedLeadId ? 'bg-emerald-50/80 border border-emerald-200' : ''}`}>
                {submittedLeadId ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-6 h-6 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 mt-0.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <span className="w-6 h-6 rounded-full bg-[#0284C7] text-white font-mono font-bold text-[14px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                )}
                <div>
                  <strong className="text-[#060B16] block font-semibold">
                    {submittedLeadId ? '1. Registo Concluído na Base de Dados' : '1. Registo na Base de Dados'}
                  </strong>
                  <span className="text-[#475569] text-[14px]">
                    {submittedLeadId ? `Referência técnica ${submittedLeadId} atribuída ao processo.` : 'Geração de referência técnica única para acompanhamento do processo.'}
                  </span>
                </div>
              </li>

              {/* Etapa 2 */}
              <li className={`flex items-start gap-3 p-2 rounded-[10px] transition-colors ${submittedLeadId ? 'bg-sky-50/70 border border-sky-200' : ''}`}>
                <span className={`w-6 h-6 rounded-full font-mono font-bold text-[14px] flex items-center justify-center shrink-0 mt-0.5 ${submittedLeadId ? 'bg-[#0284C7] text-white animate-pulse' : 'bg-slate-300 text-slate-700'}`}>
                  2
                </span>
                <div>
                  <strong className="text-[#060B16] block font-semibold">
                    2. Contacto Inicial pelo Técnico
                  </strong>
                  <span className="text-[#475569] text-[14px]">
                    {submittedLeadId ? 'Aguarde o contacto telefónico ou WhatsApp da nossa equipa.' : 'Um técnico responsável entra em contacto pelo telefone ou WhatsApp indicado.'}
                  </span>
                </div>
              </li>

              {/* Etapa 3 */}
              <li className="flex items-start gap-3 p-2">
                <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 font-mono font-bold text-[14px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-[#060B16] block font-semibold">
                    3. Diagnóstico & Orçamento
                  </strong>
                  <span className="text-[#475569] text-[14px]">
                    Entrada na oficina para medições com orçamento discriminado prévio.
                  </span>
                </div>
              </li>
            </ol>
          </div>

          <div className="card-base bg-emerald-50 border border-emerald-200 p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-[15px]">
              <MessageSquare className="w-5 h-5 text-[#059669]" />
              <span>Canal WhatsApp Alternativo</span>
            </div>
            <p className="text-[14px] text-emerald-800 leading-relaxed">
              Caso prefira enviar um vídeo demonstrativo do som ou avaria do seu aparelho, pode falar agora mesmo connosco via WhatsApp.
            </p>
            <a
              href={getGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('whatsapp_click', { source: 'request_page_box' })}
              className="inline-flex items-center gap-2 text-[14px] font-bold text-[#059669] hover:text-[#10B981] underline"
            >
              Abrir WhatsApp ({COMPANY.whatsappDisplay}) &rarr;
            </a>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7">
          <AssistanceForm
            defaultServiceName={servicoParam}
            defaultEquipment={equipamentoParam}
            onSuccess={handleFormSuccess}
          />
        </div>
      </div>
    </div>
  );
};

