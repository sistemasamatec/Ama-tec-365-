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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
          Canais Oficiais
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Contactos & Localização
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Estamos localizados em Luanda, no Golf 2 (Rua dos Príncipes). Contacte a nossa equipa para dúvidas sobre avarias, orçamentos ou para agendar a entrega do seu equipamento.
        </p>
      </div>

      {/* Grid: Direct Contact Cards + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Official Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Informações Oficiais</span>
              <span className="text-[11px] font-normal text-slate-500">NIF: {company.nif}</span>
            </h2>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Morada */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-50 text-sky-600 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Morada da Oficina</span>
                    <p className="text-slate-600">{company.address}</p>
                    <p className="text-slate-500 text-xs">{company.city}, {company.country}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`${company.address}, ${company.city}, ${company.country}`, 'morada')}
                  className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Copiar morada"
                >
                  {copiedField === 'morada' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* NIF */}
              <div className="flex items-start justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-50 text-sky-600 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">NIF da Empresa</span>
                    <span className="font-mono text-slate-700 text-xs sm:text-sm">{company.nif}</span>
                    <p className="text-slate-400 text-[11px]">{company.legalName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(company.nif, 'nif')}
                  className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Copiar NIF"
                >
                  {copiedField === 'nif' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Telefone */}
              <div className="flex items-start justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-50 text-sky-600 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Telefone Principal</span>
                    <a
                      href={`tel:${company.phone}`}
                      onClick={() => track('phone_click', { source: 'contacts_page' })}
                      className="text-sky-600 hover:underline font-mono text-sm font-medium"
                    >
                      {company.phoneDisplay}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(company.phone, 'telefone')}
                  className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Copiar telefone"
                >
                  {copiedField === 'telefone' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">WhatsApp Técnico</span>
                    <a
                      href={getGeneralWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track('whatsapp_click', { source: 'contacts_page' })}
                      className="text-emerald-600 hover:underline font-mono text-sm font-medium"
                    >
                      {company.whatsappDisplay}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(company.whatsapp, 'whatsapp')}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Copiar WhatsApp"
                >
                  {copiedField === 'whatsapp' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Email */}
              <div className="flex items-start justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-50 text-sky-600 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Email Institucional</span>
                    <a
                      href={`mailto:${company.email}`}
                      onClick={() => track('email_click', { source: 'contacts_page' })}
                      className="text-sky-600 hover:underline text-xs sm:text-sm"
                    >
                      {company.email}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(company.email, 'email')}
                  className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Copiar email"
                >
                  {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Horário de Funcionamento */}
              <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-slate-900 block">Horário de Funcionamento</span>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <div>{settings.businessHours.weekdays}</div>
                    <div>{settings.businessHours.saturday}</div>
                    <div className="text-slate-500">{settings.businessHours.sunday}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa Interativo Google Maps & Como Chegar */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Map className="w-4 h-4 text-sky-600" />
                <span>Oficina Ama Tec no Golf 2</span>
              </div>
              <span className="text-[11px] text-slate-500">Luanda, Angola</span>
            </div>

            {/* Iframe do Google Maps */}
            <div className="relative w-full h-56 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
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
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Google Maps</span>
              </a>

              <a
                href={wazeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
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
