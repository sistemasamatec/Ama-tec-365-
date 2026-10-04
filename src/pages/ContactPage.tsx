import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, MessageSquare, Clock, Map, Copy, Check, Navigation, ExternalLink, Shield } from 'lucide-react';
import { getGeneralWhatsAppUrl } from '../lib/whatsapp';
import { updateDocumentSeo } from '../lib/seo';
import { AssistanceForm } from '../components/forms/AssistanceForm';
import { track } from '../lib/analytics';
import { useSettings } from '../context/SettingsContext';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const company = settings.company;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    updateDocumentSeo({
      title: 'Contactos & Localização | Ama Tec Luanda',
      description:
        'Fale com a assistência técnica da Ama Tec em Luanda (Golf 2, Rua dos Príncipes). Contacto telefónico, WhatsApp, direções no Google Maps e formulário de assistência.',
      canonicalPath: '/contactos',
    });
  }, []);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const mapEmbedUrl = settings.googleMaps?.embedUrl;
  const mapLink = settings.googleMaps?.mapLink || `https://maps.google.com/?q=${settings.googleMaps?.coordinates?.lat || -8.8893},${settings.googleMaps?.coordinates?.lng || 13.2384}`;
  const wazeLink = `https://waze.com/ul?ll=${settings.googleMaps?.coordinates?.lat || -8.8893},${settings.googleMaps?.coordinates?.lng || 13.2384}&navigate=yes`;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-[14px] font-semibold text-[#0284C7] uppercase tracking-wider">
          Canais Oficiais
        </div>
        <h1 className="text-h1 font-heading font-extrabold text-[#060B16] tracking-tight">
          Contactos & Localização
        </h1>
        <p className="text-[16px] text-[#475569] leading-relaxed">
          Estamos localizados em Luanda, no Golf 2 (Rua dos Príncipes). Contacte a nossa equipa para dúvidas sobre avarias, orçamentos ou para agendar a entrega do seu equipamento.
        </p>
      </div>

      {/* Grid: Direct Contact Cards + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Official Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-base bg-white p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-lg font-bold font-heading text-[#060B16] border-b border-[#E2E8F0] pb-3 flex items-center justify-between">
              <span>Informações Oficiais</span>
              <span className="text-[14px] font-normal text-[#475569]">NIF: {company.nif}</span>
            </h2>

            <div className="space-y-4 text-[14px]">
              {/* Morada */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-[10px] bg-sky-50 text-[#0284C7] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#0F172A] block">Morada da Oficina</span>
                    <p className="text-[#475569]">{company.address}</p>
                    <p className="text-[#475569] text-[14px]">{company.city}, {company.country}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`${company.address}, ${company.city}, ${company.country}`, 'morada')}
                  className="p-1.5 text-slate-400 hover:text-[#0284C7] rounded-[8px] hover:bg-slate-50 transition-colors"
                  title="Copiar morada"
                >
                  {copiedField === 'morada' ? <Check className="w-4 h-4 text-[#059669]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* NIF */}
              <div className="flex items-start justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-[10px] bg-sky-50 text-[#0284C7] shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#0F172A] block">NIF da Empresa</span>
                    <span className="font-mono text-[#060B16] text-[14px] font-bold">{company.nif}</span>
                    <p className="text-[#475569] text-[14px]">{company.legalName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(company.nif, 'nif')}
                  className="p-1.5 text-slate-400 hover:text-[#0284C7] rounded-[8px] hover:bg-slate-50 transition-colors"
                  title="Copiar NIF"
                >
                  {copiedField === 'nif' ? <Check className="w-4 h-4 text-[#059669]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Telefone */}
              <div className="flex items-start justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-[10px] bg-sky-50 text-[#0284C7] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#0F172A] block">Telefone Principal</span>
                    <a
                      href={`tel:${company.phone}`}
                      onClick={() => track('phone_click', { source: 'contacts_page' })}
                      className="text-[#0284C7] hover:underline font-mono text-[14px] font-medium"
                    >
                      {company.phoneDisplay}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(company.phone, 'telefone')}
                  className="p-1.5 text-slate-400 hover:text-[#0284C7] rounded-[8px] hover:bg-slate-50 transition-colors"
                  title="Copiar telefone"
                >
                  {copiedField === 'telefone' ? <Check className="w-4 h-4 text-[#059669]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-[10px] bg-emerald-50 text-[#059669] shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#0F172A] block">WhatsApp Técnico</span>
                    <a
                      href={getGeneralWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track('whatsapp_click', { source: 'contacts_page' })}
                      className="text-[#059669] hover:underline font-mono text-[14px] font-semibold"
                    >
                      {company.whatsappDisplay}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(company.whatsapp, 'whatsapp')}
                  className="p-1.5 text-slate-400 hover:text-[#059669] rounded-[8px] hover:bg-slate-50 transition-colors"
                  title="Copiar WhatsApp"
                >
                  {copiedField === 'whatsapp' ? <Check className="w-4 h-4 text-[#059669]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Email */}
              <div className="flex items-start justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-[10px] bg-sky-50 text-[#0284C7] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#0F172A] block">Email Institucional</span>
                    <a
                      href={`mailto:${company.email}`}
                      onClick={() => track('email_click', { source: 'contacts_page' })}
                      className="text-[#0284C7] hover:underline text-[14px]"
                    >
                      {company.email}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(company.email, 'email')}
                  className="p-1.5 text-slate-400 hover:text-[#0284C7] rounded-[8px] hover:bg-slate-50 transition-colors"
                  title="Copiar email"
                >
                  {copiedField === 'email' ? <Check className="w-4 h-4 text-[#059669]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Horário de Funcionamento */}
              <div className="flex items-start gap-3 pt-2 border-t border-[#E2E8F0]">
                <div className="p-2 rounded-[10px] bg-amber-50 text-amber-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-[#0F172A] block">Horário de Funcionamento</span>
                  <div className="text-[14px] text-[#475569] space-y-0.5">
                    <div>{settings.businessHours.weekdays}</div>
                    <div>{settings.businessHours.saturday}</div>
                    <div className="text-[#475569]">{settings.businessHours.sunday}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa Interativo Google Maps & Como Chegar */}
          <div className="card-base bg-white overflow-hidden shadow-xs space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold font-heading text-[#060B16] text-[14px]">
                <Map className="w-4 h-4 text-[#0284C7]" />
                <span>Oficina Ama Tec no Golf 2</span>
              </div>
              <span className="text-[14px] text-[#475569]">Luanda, Angola</span>
            </div>

            {/* Iframe do Google Maps */}
            <div className="relative w-full h-56 rounded-[12px] overflow-hidden border border-[#E2E8F0] bg-[#F4F7FA]">
              <iframe
                title="Localização da Ama Tec no Golf 2"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>

            {/* Botões Como Chegar */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary min-h-[48px] inline-flex items-center justify-center gap-1.5 text-[14px]"
              >
                <Navigation className="w-4 h-4" />
                <span>Google Maps</span>
              </a>

              <a
                href={wazeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline min-h-[48px] inline-flex items-center justify-center gap-1.5 text-[14px]"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir no Waze</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7">
          <AssistanceForm />
        </div>
      </div>
    </div>
  );
};
