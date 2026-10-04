import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, MessageSquare, Clock, Database, Lock, HelpCircle, ExternalLink } from 'lucide-react';
import { CATEGORIES_CONFIG } from '../../content/services';
import { getGeneralWhatsAppUrl } from '../../lib/whatsapp';
import { track } from '../../lib/analytics';
import { CLIENT_PORTAL_URL } from '../../lib/config';
import { useSettings } from '../../context/SettingsContext';
import { BrandLogo } from '../ui/BrandLogo';

interface FooterProps {
  onOpenDatabaseManager?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDatabaseManager }) => {
  const { settings } = useSettings();
  const company = settings.company;
  const social = settings.socialLinks;

  // Filtra apenas redes sociais com link definido pelo administrador
  const activeSocials = [
    { name: 'Facebook', url: social.facebook, label: 'Facebook Oficial' },
    { name: 'Instagram', url: social.instagram, label: 'Instagram Oficial' },
    { name: 'WhatsApp Business', url: social.whatsappBusiness ? `https://wa.me/${social.whatsappBusiness.replace(/\D/g, '')}` : '', label: 'WhatsApp Oficial' },
    { name: 'TikTok', url: social.tiktok, label: 'TikTok Oficial' },
    { name: 'LinkedIn', url: social.linkedin, label: 'LinkedIn Oficial' },
    { name: 'YouTube', url: social.youtube, label: 'Canal YouTube' },
  ].filter((s) => Boolean(s.url && s.url.trim()));

  return (
    <footer className="bg-[#060B16] text-[#CBD5E1] border-t border-[#111B2E] pb-24">
      {/* Upper Main Footer */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand & NAP */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block" aria-label="Ama Tec — Início">
              <BrandLogo variant="footer" />
            </Link>
            <p className="text-[14px] text-[#CBD5E1] leading-relaxed max-w-sm">
              Centro técnico especializado na reparação, diagnóstico e manutenção de equipamentos eletrónicos, eletrodomésticos, instalações industriais e sistemas informáticos no Golf 2, Luanda.
            </p>

            <div className="pt-2 space-y-2.5 text-[14px] text-[#CBD5E1]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0EA5E9] shrink-0 mt-0.5" />
                <span>
                  {company.address}, {company.city}, {company.country}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#0EA5E9] shrink-0" />
                <a
                  href={`tel:${company.phone}`}
                  onClick={() => track('phone_click', { source: 'footer' })}
                  className="hover:text-white transition-colors"
                >
                  {company.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#0EA5E9] shrink-0" />
                <a
                  href={`mailto:${company.email}`}
                  onClick={() => track('email_click', { source: 'footer' })}
                  className="hover:text-white transition-colors"
                >
                  {company.email}
                </a>
              </div>
              <div className="flex items-start gap-2.5 text-[#CBD5E1]">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div>{settings.businessHours.weekdays}</div>
                  <div className="text-[14px] text-[#94A3B8]">{settings.businessHours.saturday}</div>
                  <div className="text-[14px] text-[#94A3B8]">{settings.businessHours.sunday || 'Domingos e Feriados: Fechado'}</div>
                </div>
              </div>
            </div>

            {/* Redes Sociais Dinâmicas */}
            {activeSocials.length > 0 && (
              <div className="pt-3 space-y-2">
                <span className="text-[14px] font-semibold uppercase tracking-wider text-[#94A3B8] block">
                  Redes Oficiais
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeSocials.map((item) => (
                    <a
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-[10px] bg-[#111B2E] hover:bg-[#1B2A44] text-[#E6EDF7] hover:text-white text-[14px] border border-[#1B2A44] transition-colors inline-flex items-center gap-2"
                      aria-label={item.label}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#0EA5E9]"></span>
                      <span>{item.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Categorias de Serviços */}
          <div className="space-y-3">
            <h4 className="text-white text-[15px] font-bold font-heading tracking-wider uppercase">
              Categorias de Serviços
            </h4>
            <ul className="space-y-2.5 text-[14px]">
              {CATEGORIES_CONFIG.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/servicos?categoria=${cat.id}`}
                    className="hover:text-[#0EA5E9] text-[#CBD5E1] transition-colors flex items-center gap-2"
                  >
                    <span className="text-base" aria-hidden="true">
                      {cat.icon}
                    </span>
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/servicos"
                  className="text-[#0EA5E9] hover:text-[#38BDF8] font-semibold inline-block pt-1"
                >
                  Ver todos os serviços &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Links Institucionais Principais */}
          <div className="space-y-3">
            <h4 className="text-white text-[15px] font-bold font-heading tracking-wider uppercase">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <Link to="/" className="hover:text-[#0EA5E9] text-[#CBD5E1] transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/servicos" className="hover:text-[#0EA5E9] text-[#CBD5E1] transition-colors">
                  Serviços Técnicos
                </Link>
              </li>
              <li>
                <Link to="/equipamentos" className="hover:text-[#0EA5E9] text-[#CBD5E1] transition-colors">
                  Equipamentos
                </Link>
              </li>
              <li>
                <Link to="/galeria" className="hover:text-[#0EA5E9] text-[#CBD5E1] transition-colors">
                  Galeria de Intervenções
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="hover:text-[#0EA5E9] text-[#CBD5E1] transition-colors">
                  Sobre a Ama Tec
                </Link>
              </li>
              <li>
                <Link to="/como-funciona" className="hover:text-[#0EA5E9] text-[#CBD5E1] transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link to="/contactos" className="hover:text-[#0EA5E9] text-[#CBD5E1] transition-colors">
                  Contactos & Localização
                </Link>
              </li>
              <li>
                <Link
                  to="/solicitar-assistencia"
                  className="hover:text-[#38BDF8] text-[#0EA5E9] font-semibold transition-colors"
                >
                  Solicitar Assistência
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contacto Rápido & Futuro Ama Tec 365 */}
          <div className="space-y-4">
            <h4 className="text-white text-[15px] font-bold font-heading tracking-wider uppercase">
              Atendimento Direto
            </h4>
            <p className="text-[14px] text-[#CBD5E1] leading-relaxed">
              Precisa de reparação urgente? Envie os detalhes do seu aparelho pelo WhatsApp para triagem imediata.
            </p>
            <a
              href={getGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('whatsapp_click', { source: 'footer_cta' })}
              className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] px-4 py-2.5 rounded-[10px] bg-[#059669] hover:bg-[#10B981] text-white text-[14px] font-semibold uppercase tracking-wider transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:outline-none cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Técnico</span>
            </a>

            <div className="border border-[#111B2E] bg-[#0B1220] p-4 rounded-[14px] text-[14px] space-y-2.5">
              <div>
                <span className="text-[#0EA5E9] font-bold block">Ama Tec 365</span>
                <p className="text-[#94A3B8] text-[14px] leading-snug">
                  Plataforma integrada de assistência contínua e planos de manutenção em preparação.
                </p>
              </div>
              {CLIENT_PORTAL_URL ? (
                <a
                  href={CLIENT_PORTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('client_portal_footer_click')}
                  className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] px-3 py-2 rounded-[10px] bg-[#111B2E] hover:bg-[#1B2A44] text-[#E6EDF7] text-[14px] font-medium border border-[#1B2A44] transition-colors focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
                >
                  <ExternalLink className="w-4 h-4 text-[#0EA5E9]" />
                  <span>Consultar minha assistência</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-[#111B2E] bg-[#040810] py-6 px-4 sm:px-6 lg:px-8 text-[14px] text-[#94A3B8]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left space-y-1">
            <p className="text-[#CBD5E1]">
              © {new Date().getFullYear()} <strong className="text-white">Ama Tec</strong>. Todos os direitos reservados.
            </p>
            <p className="text-[14px] text-[#94A3B8]">
              Razão Social: <span className="font-medium text-[#CBD5E1]">{company.legalName}</span> | NIF: <span className="font-medium text-[#CBD5E1]">{company.nif}</span>
              <span className="mx-2 text-[#475569]">·</span>
              <Link to="/admin" className="text-[#94A3B8] hover:text-white transition-colors inline-flex items-center gap-1 text-[14px]" title="Área restrita de gestão">
                <Lock className="w-3.5 h-3.5" />
                <span>Gestão</span>
              </Link>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[14px]">
            <Link to="/privacidade" className="hover:text-white transition-colors">
              Política de Privacidade
            </Link>
            <span>·</span>
            <Link to="/cookies" className="hover:text-white transition-colors">
              Cookies & Consentimento
            </Link>
            <span>·</span>
            <Link to="/faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
