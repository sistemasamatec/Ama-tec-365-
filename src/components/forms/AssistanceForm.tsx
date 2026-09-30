import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, AlertTriangle, MessageSquare, Wrench, Shield, Loader2, ExternalLink } from 'lucide-react';
import { validateAssistanceForm, ValidationErrors } from '../../lib/validation';
import { getLeadWhatsAppFallbackUrl } from '../../lib/whatsapp';
import { track } from '../../lib/analytics';
import { CLIENT_PORTAL_URL } from '../../lib/config';
import { captureException } from '../../lib/observability';
import { amaTec365Service } from '../../services/api';

interface AssistanceFormProps {
  defaultServiceCategory?: string;
  defaultEquipment?: string;
  defaultServiceName?: string;
  className?: string;
  onSuccess?: (bookingId: string) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
    grecaptcha?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark';
        }
      ) => number;
      reset: (widgetId?: number) => void;
    };
  }
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
    brand: '',
    model: '',
    serviceType: 'Reparação',
    serviceCategory: defaultServiceCategory,
    problemDescription: '',
    location: '',
    scheduledDate: '',
    message: defaultServiceName ? `Referente ao serviço: ${defaultServiceName}` : '',
    honeypot: '',
    privacyConsent: false,
    idempotencyKey: '',
  });

  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successBookingNumber, setSuccessBookingNumber] = useState<string>('');
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);
  const [showOptionalFields, setShowOptionalFields] = useState<boolean>(false);

  const captchaContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  const turnstileSiteKey = (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY || '';
  const recaptchaSiteKey = (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY || '';
  const hasCaptchaConfigured = Boolean(turnstileSiteKey || recaptchaSiteKey);

  // Inicializa chave de idempotência única para esta sessão de submissão
  useEffect(() => {
    const key = `IDEMP-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
    setFormData((prev) => ({ ...prev, idempotencyKey: key }));
  }, []);

  // Preencher dados por defeito quando as props mudarem
  useEffect(() => {
    if (defaultEquipment && !formData.equipment) {
      setFormData((prev) => ({ ...prev, equipment: defaultEquipment }));
    }
    if (defaultServiceCategory) {
      setFormData((prev) => ({ ...prev, serviceCategory: defaultServiceCategory }));
    }
  }, [defaultEquipment, defaultServiceCategory]);

  // Carregar e inicializar Turnstile / reCAPTCHA se configurado
  useEffect(() => {
    if (!hasCaptchaConfigured || !captchaContainerRef.current) return;

    if (turnstileSiteKey) {
      const scriptId = 'turnstile-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const interval = setInterval(() => {
        if (window.turnstile && captchaContainerRef.current) {
          clearInterval(interval);
          try {
            captchaContainerRef.current.innerHTML = '';
            turnstileWidgetId.current = window.turnstile.render(captchaContainerRef.current, {
              sitekey: turnstileSiteKey,
              callback: (token: string) => setCaptchaToken(token),
              'expired-callback': () => setCaptchaToken(''),
              'error-callback': () => setCaptchaToken(''),
            });
          } catch (e) {
            console.debug('Turnstile render warning:', e);
          }
        }
      }, 200);

      return () => clearInterval(interval);
    }

    if (recaptchaSiteKey) {
      const scriptId = 'recaptcha-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const interval = setInterval(() => {
        if (window.grecaptcha && captchaContainerRef.current) {
          clearInterval(interval);
          try {
            captchaContainerRef.current.innerHTML = '';
            window.grecaptcha.render(captchaContainerRef.current, {
              sitekey: recaptchaSiteKey,
              callback: (token: string) => setCaptchaToken(token),
              'expired-callback': () => setCaptchaToken(''),
              'error-callback': () => setCaptchaToken(''),
            });
          } catch (e) {
            console.debug('reCAPTCHA render warning:', e);
          }
        }
      }, 200);

      return () => clearInterval(interval);
    }
  }, [turnstileSiteKey, recaptchaSiteKey, hasCaptchaConfigured]);

  const [hasStartedForm, setHasStartedForm] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!hasStartedForm) {
      setHasStartedForm(true);
      track('form_start', { serviceCategory: formData.serviceCategory });
    }

    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));

    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastSubmissionTime < 5000 && status === 'submitting') {
      return;
    }

    const payloadToValidate = {
      ...formData,
      location: formData.location.trim() || undefined,
      scheduledDate: formData.scheduledDate.trim() || undefined,
    };

    const validation = validateAssistanceForm(payloadToValidate);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstErrorField = Object.keys(validation.errors)[0];
      track('form_error', { field: firstErrorField });
      const el = document.getElementById(`field-${firstErrorField}`);
      if (el) el.focus();
      return;
    }

    if (hasCaptchaConfigured && !captchaToken) {
      setErrorMessage('Por favor conclua a verificação anti-spam antes de submeter.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setLastSubmissionTime(now);

    const utmSource = searchParams.get('utm_source') || undefined;

    try {
      // Grava EXCLUSIVAMENTE na coleção "bookings" do ERP Bukulo Geste
      const erpRes = await amaTec365Service.submitAssistance({
        name: formData.name,
        phone: formData.phone,
        email: formData.email.trim() || undefined,
        deviceType: formData.equipment.trim(),
        equipment: formData.equipment.trim(),
        deviceBrand: formData.brand.trim() || undefined,
        brand: formData.brand.trim() || undefined,
        deviceModel: formData.model.trim() || undefined,
        model: formData.model.trim() || undefined,
        serviceType: formData.serviceType || 'Reparação',
        deviceProblem: formData.problemDescription.trim(),
        problemDescription: formData.problemDescription.trim(),
        address: formData.location.trim() || undefined,
        location: formData.location.trim() || undefined,
        locationType: 'residence',
        scheduledDate: formData.scheduledDate.trim() || undefined,
        utmSource,
        honeypot: formData.honeypot,
        idempotencyKey: formData.idempotencyKey,
        privacyConsent: formData.privacyConsent,
        captchaToken: captchaToken || undefined,
      });

      if (!erpRes || !erpRes.success || !erpRes.bookingNumber) {
        throw new Error(erpRes?.message || 'Falha ao registar o agendamento no ERP.');
      }

      setSuccessBookingNumber(erpRes.bookingNumber);
      onSuccess?.(erpRes.bookingNumber);

      track('form_submit', {
        serviceCategory: formData.serviceCategory,
        hasEmail: Boolean(formData.email),
      });

      const newKey = `IDEMP-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
      setFormData((prev) => ({ ...prev, idempotencyKey: newKey }));

      setStatus('success');
    } catch (err: any) {
      captureException(err, { component: 'AssistanceForm', action: 'submit' });
      setErrorMessage(err.message || 'Ocorreu um erro ao comunicar com a base de dados do ERP.');
      setStatus('error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      equipment: '',
      brand: '',
      model: '',
      serviceType: 'Reparação',
      serviceCategory: 'domestico',
      problemDescription: '',
      location: '',
      scheduledDate: '',
      message: '',
      honeypot: '',
      privacyConsent: false,
      idempotencyKey: `IDEMP-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`,
    });
    setCaptchaToken('');
    setErrorMessage('');
    setErrors({});
    setStatus('idle');
    if (window.turnstile && turnstileWidgetId.current) {
      try {
        window.turnstile.reset(turnstileWidgetId.current);
      } catch (e) {
        console.debug('Turnstile reset:', e);
      }
    }
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
        {/* Estado: SUCESSO com Animação */}
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
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0.8 }}
                  animate={{ scale: [0.8, 1.4, 1.6], opacity: [0.5, 0.2, 0] }}
                  transition={{ duration: 1.6, ease: 'easeOut', repeat: 1, repeatDelay: 0.5 }}
                  className="absolute inset-0 rounded-full bg-emerald-400"
                  aria-hidden="true"
                />

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

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.18 }}
                className="space-y-3 max-w-md mx-auto"
              >
                <h4 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Pedido Registado com Sucesso!
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A sua solicitação foi registada na central com o identificador oficial{' '}
                  <strong className="inline-block text-sky-700 font-mono text-xs bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-md font-bold">
                    {successBookingNumber}
                  </strong>
                  . A nossa equipa entrará em contacto para o número indicado.
                </p>
                <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-left space-y-1">
                  <div className="font-semibold text-slate-800">Oficina no Golf 2, Luanda:</div>
                  <p className="text-[11px] text-slate-500">
                    A Ordem de Serviço física (OS) é formalizada aquando da entrada do equipamento em bancada.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3"
              >
                {CLIENT_PORTAL_URL ? (
                  <a
                    href={CLIENT_PORTAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('client_portal_from_form_success')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-md transition-all active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Consultar minha assistência</span>
                  </a>
                ) : null}

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
                  <span>Confirmar no WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors active:scale-95"
                >
                  Novo Pedido
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estado: ERRO COM MENSAGEM CLARA */}
        {status === 'error' && (
          <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm space-y-3" aria-live="assertive">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">{errorMessage || 'Ocorreu um erro ao processar a submissão.'}</strong>
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
              <span>Enviar via WhatsApp</span>
            </a>
          </div>
        )}

        {/* Formulário Principal */}
        {status !== 'success' && (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Honeypot field (armadilha invisível) */}
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

            {/* Grid: Nome e Telefone */}
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

            {/* Aparelho e Tipo de serviço */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="field-equipment"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Aparelho <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="field-equipment"
                  name="equipment"
                  required
                  placeholder="Ex: Televisor, Máquina de Lavar, Micro-ondas"
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

              <div>
                <label
                  htmlFor="field-serviceType"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Tipo de serviço
                </label>
                <select
                  id="field-serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Reparação">Reparação Técnica</option>
                  <option value="Manutenção Preventiva">Manutenção Preventiva</option>
                  <option value="Instalação">Instalação / Montagem</option>
                  <option value="Diagnóstico">Diagnóstico em Bancada</option>
                </select>
              </div>
            </div>

            {/* Marca e Modelo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="field-brand"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Marca <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                </label>
                <input
                  type="text"
                  id="field-brand"
                  name="brand"
                  placeholder="Ex: Samsung, LG, Philips, TCL"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label
                  htmlFor="field-model"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Modelo <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                </label>
                <input
                  type="text"
                  id="field-model"
                  name="model"
                  placeholder="Ex: 55Q60A, DirectDrive 9kg"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Avaria */}
            <div>
              <label
                htmlFor="field-problemDescription"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Avaria <span className="text-red-500">*</span>
              </label>
              <textarea
                id="field-problemDescription"
                name="problemDescription"
                required
                rows={2}
                placeholder="Descreva o que acontece: ex. 'Não liga o motor', 'Tem som mas não tem imagem'."
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

            {/* Toggle de Campos Opcionais: Localização (address), Data Preferencial, Email */}
            <div>
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 focus:outline-none inline-flex items-center gap-1.5 py-1 min-h-[36px] cursor-pointer"
              >
                <span>{showOptionalFields ? '− Ocultar dados adicionais' : '+ Adicionar localização, data preferencial ou email'}</span>
              </button>

              {showOptionalFields && (
                <div className="pt-3 pb-1 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="field-location"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Bairro / Endereço <span className="text-slate-400 font-normal lowercase">(opcional)</span>
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
                      htmlFor="field-scheduledDate"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Data Preferencial <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="field-scheduledDate"
                        name="scheduledDate"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.scheduledDate}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
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

            {/* Widget Turnstile / reCAPTCHA */}
            {hasCaptchaConfigured && (
              <div className="pt-1 flex flex-col items-center sm:items-start">
                <div ref={captchaContainerRef} className="min-h-[65px]" />
              </div>
            )}

            {/* Consentimento de Privacidade */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="field-privacyConsent"
                  name="privacyConsent"
                  required
                  checked={formData.privacyConsent}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 h-4 w-4 shrink-0"
                  aria-invalid={Boolean(errors.privacyConsent)}
                />
                <span className="text-xs text-slate-600 leading-tight">
                  Concordo com o tratamento dos meus dados para efeitos de diagnóstico e contacto técnico pela Ama Tec, nos termos da{' '}
                  <Link to="/privacidade" target="_blank" className="text-sky-600 underline font-medium hover:text-sky-700">
                    Política de Privacidade
                  </Link>. <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.privacyConsent && (
                <p id="error-privacyConsent" className="mt-1 text-xs text-red-600" role="alert">
                  {errors.privacyConsent}
                </p>
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
                    <span>A registar pedido no ERP...</span>
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
