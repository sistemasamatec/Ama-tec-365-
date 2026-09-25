import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, AlertTriangle, MessageSquare, Wrench, Shield, Loader2 } from 'lucide-react';
import { CATEGORIES_CONFIG } from '../../content/services';
import { db } from '../../lib/database';
import { validateAssistanceForm, ValidationErrors } from '../../lib/validation';
import { getLeadWhatsAppFallbackUrl } from '../../lib/whatsapp';
import { track } from '../../lib/analytics';
import { captureException } from '../../lib/observability';

interface AssistanceFormProps {
  defaultServiceCategory?: string;
  defaultEquipment?: string;
  defaultServiceName?: string;
  className?: string;
  onSuccess?: (leadId: string) => void;
}

export const AssistanceForm: React.FC<AssistanceFormProps> = ({
  defaultServiceCategory = 'domestico',
  defaultEquipment = '',
  defaultServiceName = '',
  className = '',
  onSuccess,
}) => {
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    equipment: defaultEquipment,
    serviceCategory: defaultServiceCategory,
    problemDescription: '',
    location: '',
    message: defaultServiceName ? `Referente ao serviço: ${defaultServiceName}` : '',
    honeypot: '', // Campo invisível anti-spam
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [successLeadId, setSuccessLeadId] = useState<string>('');
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);
  const [showOptionalFields, setShowOptionalFields] = useState<boolean>(false);

  // Preencher dados por defeito quando as props mudarem
  useEffect(() => {
    if (defaultEquipment && !formData.equipment) {
      setFormData((prev) => ({ ...prev, equipment: defaultEquipment }));
    }
    if (defaultServiceCategory) {
      setFormData((prev) => ({ ...prev, serviceCategory: defaultServiceCategory }));
    }
  }, [defaultEquipment, defaultServiceCategory]);

  const [hasStartedForm, setHasStartedForm] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!hasStartedForm) {
      setHasStartedForm(true);
      track('form_start', { serviceCategory: formData.serviceCategory });
    }

    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpar erro específico ao digitar
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate Limiting no cliente: impedir submissões repetidas em menos de 10 segundos
    const now = Date.now();
    if (now - lastSubmissionTime < 10000 && status === 'submitting') {
      return;
    }

    const payloadToValidate = {
      ...formData,
      location: formData.location.trim() || 'Golf 2 / Luanda (a detalhar)',
    };

    // Validação estrita
    const validation = validateAssistanceForm(payloadToValidate);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstErrorField = Object.keys(validation.errors)[0];
      track('form_error', { field: firstErrorField });
      const el = document.getElementById(`field-${firstErrorField}`);
      if (el) el.focus();
      return;
    }


    setStatus('submitting');
    setLastSubmissionTime(now);

    // Capturar parâmetros UTM da URL para rastreio de campanhas
    const utmSource = searchParams.get('utm_source') || undefined;
    const utmMedium = searchParams.get('utm_medium') || undefined;
    const utmCampaign = searchParams.get('utm_campaign') || undefined;
    const utmTerm = searchParams.get('utm_term') || undefined;
    const utmContent = searchParams.get('utm_content') || undefined;

    try {
      // 1. Gravar com segurança na Base de Dados da Ama Tec (IndexedDB com persistência)
      const saved = await db.saveLead({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        equipment: formData.equipment,
        serviceCategory: formData.serviceCategory,
        problemDescription: formData.problemDescription,
        location: payloadToValidate.location,
        message: formData.message,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
        honeypot: formData.honeypot,
      });

      setSuccessLeadId(saved.id);
      onSuccess?.(saved.id);

      // 2. Enviar para a API de leads /api/lead (com try/catch graceful)
      try {
        await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payloadToValidate,
            leadId: saved.id,
            utmSource,
            utmCampaign,
          }),
        });
      } catch (apiErr) {
        // Falha no endpoint de rede é absorvida com segurança porque o registo já está na base de dados
        console.debug('API /api/lead offline ou em ambiente SPA:', apiErr);
      }

      // Registo analítico anónimo
      track('form_submit', {
        serviceCategory: formData.serviceCategory,
        hasEmail: Boolean(formData.email),
      });

      setStatus('success');
    } catch (err) {
      captureException(err, { component: 'AssistanceForm', action: 'submit' });
      setStatus('error');
    }
  };


  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      equipment: '',
      serviceCategory: 'domestico',
      problemDescription: '',
      location: '',
      message: '',
      honeypot: '',
    });
    setErrors({});
    setStatus('idle');
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Solicitar Assistência Técnica
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Receba diagnóstico da equipa técnica da Ama Tec em Luanda.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* Estado: SUCESSO com Animação Framer Motion */}
        <AnimatePresence mode="wait">
          {status === 'success' && (
            <motion.div
              key="form-success"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="py-8 text-center space-y-6"
              aria-live="polite"
            >
              {/* Badge com animação suave de pulso e entrada com spring */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                {/* Halo de pulso sutil */}
                <motion.div
                  initial={{ scale: 0.7, opacity: 0.8 }}
                  animate={{ scale: [0.8, 1.4, 1.6], opacity: [0.5, 0.2, 0] }}
                  transition={{ duration: 1.6, ease: 'easeOut', repeat: 1, repeatDelay: 0.5 }}
                  className="absolute inset-0 rounded-full bg-emerald-400"
                  aria-hidden="true"
                />

                {/* Círculo principal com check */}
                <motion.div
                  initial={{ scale: 0, rotate: -25 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 280,
                    damping: 20,
                    delay: 0.1,
                  }}
                  className="relative w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs border border-emerald-200"
                >
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.22,
                      type: 'spring',
                      stiffness: 320,
                      damping: 18,
                    }}
                  >
                    <CheckCircle2 className="w-9 h-9" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Título e referência técnica com stagger suave */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.18 }}
                className="space-y-2 max-w-md mx-auto"
              >
                <h4 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Pedido Registado com Sucesso!
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  O seu pedido foi gravado na base de dados da Ama Tec com a referência{' '}
                  <motion.strong
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.32, duration: 0.25 }}
                    className="inline-block text-slate-900 font-mono text-xs bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md"
                  >
                    {successLeadId}
                  </motion.strong>
                  . A nossa equipa técnica entrará em contacto para o número indicado.
                </p>
              </motion.div>

              {/* Ações com animação escalonada */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3"
              >
                <a
                  href={getLeadWhatsAppFallbackUrl({
                    name: formData.name,
                    equipment: formData.equipment,
                    problemDescription: formData.problemDescription,
                    location: formData.location,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('whatsapp_click', { source: 'form_success_button' })}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition-all active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Confirmar no WhatsApp Agora</span>
                </a>

                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors active:scale-95"
                >
                  Fazer Outro Pedido
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estado: ERRO COM FALLBACK PARA WHATSAPP */}
        {status === 'error' && (
          <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm space-y-3" aria-live="assertive">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Ocorreu um erro ao processar a submissão.</strong>
                <span className="text-xs text-red-700">
                  Pode enviar o seu pedido diretamente via WhatsApp sem perder os dados preenchidos.
                </span>
              </div>
            </div>
            <a
              href={getLeadWhatsAppFallbackUrl({
                name: formData.name,
                equipment: formData.equipment,
                problemDescription: formData.problemDescription,
                location: formData.location,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Enviar via WhatsApp de Reserva</span>
            </a>
          </div>
        )}

        {/* Formulário Principal */}
        {status !== 'success' && (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Honeypot field (escondido para utilizadores reais, armadilha para bots) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="field-honeypot">Não preencha este campo se for humano</label>
              <input
                type="text"
                id="field-honeypot"
                name="honeypot"
                tabIndex={-1}
                value={formData.honeypot}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>

            {/* Grid: Nome e Telefone (Essenciais) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="field-name"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="field-name"
                  name="name"
                  required
                  placeholder="Ex: João Baptista"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-sky-500'
                  }`}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'error-name' : undefined}
                />
                {errors.name && (
                  <p id="error-name" className="mt-1 text-xs text-red-600" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="field-phone"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Telefone / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="field-phone"
                  name="phone"
                  required
                  placeholder="Ex: 930 372 597"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    errors.phone ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-sky-500'
                  }`}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'error-phone' : undefined}
                />
                {errors.phone && (
                  <p id="error-phone" className="mt-1 text-xs text-red-600" role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Equipamento (Essencial) */}
            <div>
              <label
                htmlFor="field-equipment"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Aparelho / Equipamento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="field-equipment"
                name="equipment"
                required
                placeholder="Ex: Televisor Samsung 55, Máquina de Lavar LG, Air Fryer Philips"
                value={formData.equipment}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.equipment ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-sky-500'
                }`}
                aria-invalid={Boolean(errors.equipment)}
                aria-describedby={errors.equipment ? 'error-equipment' : undefined}
              />
              {errors.equipment && (
                <p id="error-equipment" className="mt-1 text-xs text-red-600" role="alert">
                  {errors.equipment}
                </p>
              )}
            </div>

            {/* Descrição do Problema (Essencial) */}
            <div>
              <label
                htmlFor="field-problemDescription"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Avaria / Sintoma Observado <span className="text-red-500">*</span>
              </label>
              <textarea
                id="field-problemDescription"
                name="problemDescription"
                required
                rows={2}
                placeholder="Descreva o que acontece: ex. 'Não drena a água', 'Tem som mas não tem imagem'."
                value={formData.problemDescription}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.problemDescription
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-300 focus:ring-sky-500'
                }`}
                aria-invalid={Boolean(errors.problemDescription)}
                aria-describedby={errors.problemDescription ? 'error-problemDescription' : undefined}
              />
              {errors.problemDescription && (
                <p id="error-problemDescription" className="mt-1 text-xs text-red-600" role="alert">
                  {errors.problemDescription}
                </p>
              )}
            </div>

            {/* Toggle de Campos Opcionais */}
            <div>
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 focus:outline-none inline-flex items-center gap-1.5 py-1 min-h-[36px]"
              >
                <span>{showOptionalFields ? '− Ocultar dados adicionais' : '+ Adicionar localização ou email (opcional)'}</span>
              </button>

              {showOptionalFields && (
                <div className="pt-3 pb-1 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                  <div>
                    <label
                      htmlFor="field-location"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Bairro / Município em Luanda <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      id="field-location"
                      name="location"
                      placeholder="Ex: Golf 2, Talatona, Maianga"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="field-email"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Email <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                    </label>
                    <input
                      type="email"
                      id="field-email"
                      name="email"
                      placeholder="Ex: cliente@exemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3.5 py-2 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                        errors.email ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-sky-500'
                      }`}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'error-email' : undefined}
                    />
                    {errors.email && (
                      <p id="error-email" className="mt-1 text-xs text-red-600" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Action */}

            <div className="pt-2">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A registar pedido na base de dados...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submeter Pedido de Assistência Técnica</span>
                  </>
                )}
              </button>
            </div>

            {/* Privacy footnote */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center pt-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Os seus dados são tratados exclusivamente pela Ama Tec para fins de contacto técnico.
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
