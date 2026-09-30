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
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 pb-24">
      {/* Upper Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand & NAP */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <BrandLogo variant="footer" />
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Centro técnico especializado na reparação, diagnóstico e manutenção de equipamentos eletrónicos, eletrodomésticos, instalações industriais e sistemas informáticos no Golf 2, Luanda.
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  {company.address}, {company.city}, {company.country}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <a
                  href={`tel:${company.phone}`}
                  onClick={() => track('phone_click', { source: 'footer' })}
                  className="hover:text-white transition-colors"
                >
                  {company.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a
                  href={`mailto:${company.email}`}
                  onClick={() => track('email_click', { source: 'footer' })}
                  className="hover:text-white transition-colors"
                >
                  {company.email}
                </a>
              </div>
              <div className="flex items-start gap-2.5 text-slate-400">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div>{settings.businessHours.weekdays}</div>
                  <div className="text-[11px] text-slate-400">{settings.businessHours.saturday}</div>
                  <div className="text-[11px] text-slate-500">{settings.businessHours.sunday || 'Domingos e Feriados: Fechado'}</div>
                </div>
              </div>
            </div>

            {/* Redes Sociais Dinâmicas */}
            {activeSocials.length > 0 && (
              <div className="pt-3 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Redes Oficiais
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeSocials.map((item) => (
                    <a
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-800 transition-colors inline-flex items-center gap-1.5"
                      aria-label={item.label}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                      <span>{item.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Categorias de Serviços */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase">
              Categorias de Serviços
            </h4>
            <ul className="space-y-2 text-sm">
              {CATEGORIES_CONFIG.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/servicos?categoria=${cat.id}`}
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-xs" aria-hidden="true">
                      {cat.icon}
                    </span>
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/servicos"
                  className="text-sky-400 hover:text-sky-300 font-medium inline-block pt-1"
                >
                  Ver todos os serviços &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Links Institucionais Principais */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase">
              Navegação
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/servicos" className="hover:text-white transition-colors">
                  Serviços Técnicos
                </Link>
              </li>
              <li>
                <Link to="/equipamentos" className="hover:text-white transition-colors">
                  Equipamentos
                </Link>
              </li>
              <li>
                <Link to="/galeria" className="hover:text-white transition-colors">
                  Galeria de Intervenções
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="hover:text-white transition-colors">
                  Sobre a Ama Tec
                </Link>
              </li>
              <li>
                <Link to="/como-funciona" className="hover:text-white transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link to="/contactos" className="hover:text-white transition-colors">
                  Contactos & Localização
                </Link>
              </li>
              <li>
                <Link
                  to="/solicitar-assistencia"
                  className="hover:text-white text-sky-400 font-medium transition-colors"
                >
                  Solicitar Assistência
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contacto Rápido & Futuro Ama Tec 365 */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase">
              Atendimento Direto
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Precisa de reparação urgente? Envie os detalhes do seu aparelho pelo WhatsApp para triagem imediata.
            </p>
            <a
              href={getGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('whatsapp_click', { source: 'footer_cta' })}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Técnico</span>
            </a>

            <div className="border border-slate-800 bg-slate-900/60 p-3 rounded-lg text-xs space-y-2">
              <div>
                <span className="text-sky-400 font-semibold block">Ama Tec 365</span>
                <p className="text-slate-400 text-[11px]">
                  Plataforma integrada de assistência contínua e planos de manutenção em preparação.
                </p>
              </div>
              {CLIENT_PORTAL_URL ? (
                <a
                  href={CLIENT_PORTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('client_portal_footer_click')}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Consultar minha assistência</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left space-y-1">
            <p className="text-slate-400">
              © {new Date().getFullYear()} <strong className="text-slate-200">Ama Tec</strong>. Todos os direitos reservados.
            </p>
            <p className="text-[11px] text-slate-500">
              Razão Social: <span className="font-medium text-slate-400">{company.legalName}</span> | NIF: <span className="font-medium text-slate-400">{company.nif}</span>
              <span className="mx-2 text-slate-700">·</span>
              <Link to="/admin" className="text-slate-700 hover:text-slate-400 transition-colors inline-flex items-center gap-1 text-[11px]" title="Área restrita de gestão">
                <Lock className="w-2.5 h-2.5" />
                <span>Gestão</span>
              </Link>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link to="/privacidade" className="hover:text-slate-300 transition-colors">
              Política de Privacidade
            </Link>
            <span>·</span>
            <Link to="/cookies" className="hover:text-slate-300 transition-colors">
              Cookies & Consentimento
            </Link>
            <span>·</span>
            <Link to="/faq" className="hover:text-slate-300 transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
