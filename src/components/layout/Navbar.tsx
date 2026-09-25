import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, MessageSquare, ChevronDown, Wrench, ShieldCheck, HelpCircle } from 'lucide-react';
import { CATEGORIES_CONFIG } from '../../content/services';
import { getGeneralWhatsAppUrl } from '../../lib/whatsapp';
import { track } from '../../lib/analytics';
import { useSettings } from '../../context/SettingsContext';

export const Navbar: React.FC = () => {
  const { settings } = useSettings();
  const company = settings.company;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Notice Bar with NAP details */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Oficina e Assistência Técnica em Luanda (Golf 2, Rua dos Príncipes)
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">NIF: {company.nif}</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${company.phone}`}
              onClick={() => track('phone_click', { source: 'topbar' })}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              <span>{company.phoneDisplay}</span>
            </a>
            <span className="text-slate-600">·</span>
            <a
              href={getGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('whatsapp_click', { source: 'topbar' })}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Direto</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Oficial */}
          <Link
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-3 shrink-0 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-lg p-1"
            aria-label="Ama Tec Início"
          >
            <img
              src={settings.visualIdentity?.logoUrl || '/brand/logo.svg'}
              alt="Ama Tec — Assistência Técnica de Equipamentos Eletrónicos"
              className="h-12 w-auto max-w-[240px] sm:max-w-[280px]"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-700">
            <Link
              to="/"
              className={`transition-colors hover:text-sky-600 ${
                isActive('/') && location.pathname === '/' ? 'text-sky-600 font-semibold' : ''
              }`}
            >
              Início
            </Link>

            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <Link
                to="/servicos"
                className={`flex items-center gap-1 transition-colors hover:text-sky-600 ${
                  isActive('/servicos') ? 'text-sky-600 font-semibold' : ''
                }`}
              >
                <span>Serviços</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </Link>

              {servicesDropdownOpen && (
                <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Categorias Técnicas
                  </div>
                  {CATEGORIES_CONFIG.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/servicos?categoria=${cat.id}`}
                      onClick={() => setServicesDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                    >
                      <div className="font-medium">{cat.name}</div>
                      <div className="text-xs text-slate-500 truncate">{cat.badge}</div>
                    </Link>
                  ))}
                  <div className="p-2 border-t border-slate-100 mt-1">
                    <Link
                      to="/servicos"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="block text-center text-xs font-semibold text-sky-600 hover:text-sky-800 py-1"
                    >
                      Ver todos os serviços &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/equipamentos"
              className={`transition-colors hover:text-sky-600 ${
                isActive('/equipamentos') ? 'text-sky-600 font-semibold' : ''
              }`}
            >
              Equipamentos
            </Link>

            <Link
              to="/galeria"
              className={`transition-colors hover:text-sky-600 ${
                isActive('/galeria') ? 'text-sky-600 font-semibold' : ''
              }`}
            >
              Galeria
            </Link>

            <Link
              to="/como-funciona"
              className={`transition-colors hover:text-sky-600 ${
                isActive('/como-funciona') ? 'text-sky-600 font-semibold' : ''
              }`}
            >
              Como Funciona
            </Link>

            <Link
              to="/sobre"
              className={`transition-colors hover:text-sky-600 ${
                isActive('/sobre') ? 'text-sky-600 font-semibold' : ''
              }`}
            >
              Sobre Nós
            </Link>

            <Link
              to="/faq"
              className={`transition-colors hover:text-sky-600 ${
                isActive('/faq') ? 'text-sky-600 font-semibold' : ''
              }`}
            >
              FAQ
            </Link>

            <Link
              to="/contactos"
              className={`transition-colors hover:text-sky-600 ${
                isActive('/contactos') ? 'text-sky-600 font-semibold' : ''
              }`}
            >
              Contactos
            </Link>
          </nav>

          {/* Right Header CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={getGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('whatsapp_click', { source: 'nav_button' })}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-sm font-medium transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            <Link
              to="/solicitar-assistencia"
              onClick={() => track('conversion', { step: 'nav_cta_click' })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 font-medium text-sm shadow-sm transition-all hover:shadow active:scale-95"
            >
              <Wrench className="w-4 h-4" />
              <span>Solicitar Assistência</span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              to="/solicitar-assistencia"
              className="text-xs bg-sky-600 text-white px-3 py-1.5 rounded-md font-medium"
            >
              Pedir Reparação
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2 text-base font-medium text-slate-800">
            <Link
              to="/"
              onClick={handleNavClick}
              className={`p-2 rounded-lg ${isActive('/') && location.pathname === '/' ? 'bg-sky-50 text-sky-700 font-semibold' : 'hover:bg-slate-50'}`}
            >
              Início
            </Link>
            <Link
              to="/servicos"
              onClick={handleNavClick}
              className={`p-2 rounded-lg ${isActive('/servicos') ? 'bg-sky-50 text-sky-700 font-semibold' : 'hover:bg-slate-50'}`}
            >
              Serviços Técnicos (6 Categorias)
            </Link>
            <Link
              to="/equipamentos"
              onClick={handleNavClick}
              className={`p-2 rounded-lg ${isActive('/equipamentos') ? 'bg-sky-50 text-sky-700 font-semibold' : 'hover:bg-slate-50'}`}
            >
              Catálogo de Equipamentos
            </Link>
            <Link
              to="/galeria"
              onClick={handleNavClick}
              className={`p-2 rounded-lg ${isActive('/galeria') ? 'bg-sky-50 text-sky-700 font-semibold' : 'hover:bg-slate-50'}`}
            >
              Galeria de Intervenções
            </Link>
            <Link
              to="/como-funciona"
              onClick={handleNavClick}
              className={`p-2 rounded-lg ${isActive('/como-funciona') ? 'bg-sky-50 text-sky-700 font-semibold' : 'hover:bg-slate-50'}`}
            >
              Como Funciona o Processo
            </Link>
            <Link
              to="/sobre"
              onClick={handleNavClick}
              className={`p-2 rounded-lg ${isActive('/sobre') ? 'bg-sky-50 text-sky-700 font-semibold' : 'hover:bg-slate-50'}`}
            >
              Sobre a Ama Tec
            </Link>
            <Link
              to="/faq"
              onClick={handleNavClick}
              className={`p-2 rounded-lg ${isActive('/faq') ? 'bg-sky-50 text-sky-700 font-semibold' : 'hover:bg-slate-50'}`}
            >
              Perguntas Frequentes (FAQ)
            </Link>
            <Link
              to="/contactos"
              onClick={handleNavClick}
              className={`p-2 rounded-lg ${isActive('/contactos') ? 'bg-sky-50 text-sky-700 font-semibold' : 'hover:bg-slate-50'}`}
            >
              Contactos & Localização
            </Link>
          </nav>

          <div className="pt-4 border-t border-slate-200 flex flex-col gap-2.5">
            <Link
              to="/solicitar-assistencia"
              onClick={handleNavClick}
              className="w-full py-3 bg-sky-600 text-white rounded-lg text-center font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <Wrench className="w-4 h-4" />
              <span>Solicitar Assistência Técnica</span>
            </Link>
            <a
              href={getGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                track('whatsapp_click', { source: 'mobile_menu' });
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-center font-medium text-sm flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Falar no WhatsApp ({company.whatsappDisplay})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
