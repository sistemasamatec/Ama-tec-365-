import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Wrench,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { CATEGORIES_CONFIG } from '../../content/services';
import { getGeneralWhatsAppUrl } from '../../lib/whatsapp';
import { track } from '../../lib/analytics';
import { CLIENT_PORTAL_URL } from '../../lib/config';
import { useSettings } from '../../context/SettingsContext';
import { useServices } from '../../context/ServicesContext';
import { ServiceCategory } from '../../types';

import { BrandLogo } from '../ui/BrandLogo';

export const Navbar: React.FC = () => {
  const { settings } = useSettings();
  const { services } = useServices();
  const company = settings.company;
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileServicesExpanded, setMobileServicesExpanded] = useState(true);
  const [openMobileCat, setOpenMobileCat] = useState<ServiceCategory | null>('domestico');
  const [isScrolled, setIsScrolled] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const megaMenuContainerRef = useRef<HTMLDivElement>(null);
  const megaMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMouseEnterTime = useRef<number>(0);

  // Monitoriza scroll para reforçar visual de cabeçalho fixo (sticky) com fundo sólido
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fecha menus automaticamente ao mudar de rota
  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  }, [location.pathname]);

  // Bloqueia scroll do body ao abrir o menu mobile em ecrã inteiro
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Acessibilidade por teclado (ESC fecha o menu ativo) e clique fora
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (megaMenuOpen) {
          setMegaMenuOpen(false);
          megaMenuButtonRef.current?.focus();
        }
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          mobileButtonRef.current?.focus();
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        megaMenuContainerRef.current &&
        !megaMenuContainerRef.current.contains(e.target as Node)
      ) {
        setMegaMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [megaMenuOpen, mobileMenuOpen]);

  // Gestão de hover com tolerância de tempo para evitar fechos indesejados
  const handleMouseEnter = () => {
    lastMouseEnterTime.current = Date.now();
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 220);
  };

  const toggleMegaMenu = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      const elapsed = Date.now() - lastMouseEnterTime.current;
      if (elapsed < 350 && !megaMenuOpen) {
        setMegaMenuOpen(true);
        return;
      }
    }
    setMegaMenuOpen((prev) => !prev);
  };

  // Acordeão Mobile: uma categoria aberta de cada vez (sem scroll infinito)
  const toggleMobileCat = (catId: ServiceCategory) => {
    setOpenMobileCat((prev) => (prev === catId ? null : catId));
  };

  // Verificação de rota ativa para destaque visual no menu
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Filtra serviços da categoria ativa excluindo itens arquivados ou ocultos
  const getCategoryServices = useCallback(
    (catId: ServiceCategory) => {
      return services.filter(
        (s) => s.category === catId && s.status !== 'archived' && !s.menuHidden
      );
    },
    [services]
  );

  // Link preenchido de WhatsApp para quem não encontra o equipamento no mega menu
  const cleanWhatsappNumber = (company.whatsapp || '+244930372597').replace(/\D/g, '');
  const notFoundWhatsAppUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
    'Olá Ama Tec! Não encontrei o meu equipamento na lista de serviços do site e gostaria de saber se realizam a reparação.'
  )}`;

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 relative transition-all duration-200 bg-white ${
        isScrolled
          ? 'shadow-md border-b border-slate-200 bg-white'
          : 'border-b border-slate-200 bg-white'
      }`}
    >
      {/* 1. Barra de Topo com dados NAP Oficiais (Desktop) */}
      <div className="bg-[#0B1220] text-[#E6EDF7] text-[14px] py-2 px-4 hidden md:block border-b border-[#111B2E]">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[#E6EDF7]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Oficina e Assistência Técnica no Golf 2, Luanda</span>
            </span>
            <span className="text-[#475569]">|</span>
            <span className="text-[#CBD5E1]">NIF: {company.nif}</span>
            <span className="text-[#475569]">|</span>
            <span className="text-[#CBD5E1]">
              {settings.businessHours.weekdays} · {settings.businessHours.saturday}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${company.phone}`}
              onClick={() => track('phone_click', { source: 'topbar' })}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#0EA5E9]" />
              <span>{company.phoneDisplay}</span>
            </a>
            {CLIENT_PORTAL_URL ? (
              <>
                <span className="text-[#475569]">·</span>
                <a
                  href={CLIENT_PORTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('client_portal_topbar_click')}
                  className="hidden sm:inline-flex items-center gap-1.5 text-[#0EA5E9] hover:text-[#38BDF8] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Consultar minha assistência</span>
                </a>
              </>
            ) : null}
            <span className="text-[#475569] hidden sm:inline">·</span>
            <a
              href={getGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('whatsapp_click', { source: 'topbar' })}
              className="flex items-center gap-1.5 text-[#10B981] hover:text-[#34D399] transition-colors font-medium"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Direto</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Barra Principal de Navegação */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 xl:gap-4">
          {/* Logo Oficial à Esquerda com link para '/' */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg p-1"
            aria-label="Ama Tec — Início"
          >
            <BrandLogo variant="navbar" />
          </Link>

          {/* Navegação Principal Desktop (≥1024px) */}
          <nav
            aria-label="Navegação principal"
            className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 text-xs xl:text-sm font-medium text-slate-700"
          >
            {/* 1. Início */}
            <Link
              to="/"
              className={`px-2 xl:px-3 py-2 rounded-lg transition-colors hover:text-sky-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 whitespace-nowrap ${
                location.pathname === '/'
                  ? 'text-sky-600 font-semibold bg-sky-50'
                  : ''
              }`}
            >
              Início
            </Link>

            {/* 2. Serviços ▾ (Mega Menu) */}
            <div
              ref={megaMenuContainerRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                ref={megaMenuButtonRef}
                type="button"
                onClick={toggleMegaMenu}
                aria-expanded={megaMenuOpen}
                aria-haspopup="true"
                aria-controls="desktop-services-megamenu"
                aria-label="Menu de Serviços — expandir catálogo"
                className={`inline-flex items-center gap-1 xl:gap-1.5 px-2 xl:px-3 py-2 rounded-lg transition-colors hover:text-sky-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 whitespace-nowrap ${
                  isActive('/servicos') || megaMenuOpen
                    ? 'text-sky-600 font-semibold bg-sky-50'
                    : ''
                }`}
              >
                <span>Serviços</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 xl:w-4 xl:h-4 transition-transform duration-200 ${
                    megaMenuOpen ? 'rotate-180 text-sky-600' : 'text-slate-400'
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* PAINEL DO MEGA MENU DESKTOP */}
              {megaMenuOpen && (
                <div
                  id="desktop-services-megamenu"
                  role="region"
                  aria-label="Catálogo de Serviços em Colunas"
                  className="absolute left-4 right-4 xl:left-1/2 xl:-translate-x-1/2 xl:w-[1240px] top-full mt-1.5 max-h-[80vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 p-6 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3"
                >
                  {/* Grid de Colunas por Categoria Técnica (6 colunas em xl, 3x2 em lg) */}
                  <nav aria-label="Catálogo de Categorias de Serviços">
                    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-x-5 gap-y-6">
                      {CATEGORIES_CONFIG.map((cat) => {
                        const catServices = getCategoryServices(cat.id);
                        return (
                          <li key={cat.id} className="space-y-3">
                            {/* Cabeçalho da Categoria com Ícone/Emoji */}
                            <Link
                              to={`/servicos?categoria=${cat.id}`}
                              onClick={() => setMegaMenuOpen(false)}
                              className="group flex items-center gap-1.5 pb-2 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-sky-600 transition-colors"
                            >
                              <span className="text-base" aria-hidden="true">
                                {cat.icon}
                              </span>
                              <span className="truncate">{cat.name}</span>
                            </Link>

                            {/* Lista de Serviços da Categoria */}
                            <ul className="space-y-1 text-xs">
                              {catServices.map((srv) => {
                                const isCurrentService =
                                  location.pathname === `/servicos/${srv.slug}`;
                                return (
                                  <li key={srv.id || srv.slug}>
                                    <Link
                                      to={`/servicos/${srv.slug}`}
                                      onClick={() => setMegaMenuOpen(false)}
                                      className={`block py-1.5 px-2 rounded transition-all duration-150 line-clamp-1 ${
                                        isCurrentService
                                          ? 'text-sky-600 font-semibold bg-sky-50'
                                          : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50 hover:translate-x-0.5'
                                      }`}
                                      title={srv.name}
                                    >
                                      {srv.menuLabel || srv.name}
                                    </Link>
                                  </li>
                                );
                              })}
                              {catServices.length === 0 && (
                                <li className="text-slate-400 italic text-[11px] py-1">
                                  Sem serviços cadastrados
                                </li>
                              )}
                            </ul>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  {/* Rodapé do Mega Menu com CTAs Estratégicos */}
                  <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <Link
                      to="/servicos"
                      onClick={() => setMegaMenuOpen(false)}
                      className="inline-flex items-center gap-1.5 font-semibold text-sky-600 hover:text-sky-800 transition-colors py-2 px-3 rounded-lg hover:bg-sky-50 focus-visible:ring-2 focus-visible:ring-sky-500"
                    >
                      <span>Ver todos os serviços</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <a
                      href={notFoundWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        track('whatsapp_click', { source: 'megamenu_not_found' });
                        setMegaMenuOpen(false);
                      }}
                      className="inline-flex items-center gap-2 font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 py-2 px-3.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Não encontrou o seu equipamento? Fale connosco no WhatsApp &rarr;
                      </span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Equipamentos */}
            <Link
              to="/equipamentos"
              className={`px-2 xl:px-3 py-2 rounded-lg transition-colors hover:text-sky-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 whitespace-nowrap ${
                isActive('/equipamentos')
                  ? 'text-sky-600 font-semibold bg-sky-50'
                  : ''
              }`}
            >
              Equipamentos
            </Link>

            {/* 4. Galeria */}
            <Link
              to="/galeria"
              className={`px-2 xl:px-3 py-2 rounded-lg transition-colors hover:text-sky-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 whitespace-nowrap ${
                isActive('/galeria')
                  ? 'text-sky-600 font-semibold bg-sky-50'
                  : ''
              }`}
            >
              Galeria
            </Link>

            {/* 5. Sobre */}
            <Link
              to="/sobre"
              className={`px-2 xl:px-3 py-2 rounded-lg transition-colors hover:text-sky-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 whitespace-nowrap ${
                isActive('/sobre')
                  ? 'text-sky-600 font-semibold bg-sky-50'
                  : ''
              }`}
            >
              Sobre
            </Link>

            {/* 6. Como Funciona */}
            <Link
              to="/como-funciona"
              className={`px-2 xl:px-3 py-2 rounded-lg transition-colors hover:text-sky-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 whitespace-nowrap ${
                isActive('/como-funciona')
                  ? 'text-sky-600 font-semibold bg-sky-50'
                  : ''
              }`}
            >
              Como Funciona
            </Link>

            {/* 7. Contactos */}
            <Link
              to="/contactos"
              className={`px-2 xl:px-3 py-2 rounded-lg transition-colors hover:text-sky-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 whitespace-nowrap ${
                isActive('/contactos')
                  ? 'text-sky-600 font-semibold bg-sky-50'
                  : ''
              }`}
            >
              Contactos
            </Link>
          </nav>

          {/* Área de Ações à Direita: Botão "Solicitar Assistência" SEMPRE VISÍVEL */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Botão de WhatsApp Rápido (Desktop xl) */}
            <a
              href={getGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('whatsapp_click', { source: 'nav_button' })}
              className="hidden xl:inline-flex items-center gap-2 min-h-[48px] px-4 py-2.5 rounded-[10px] text-white bg-[#059669] hover:bg-[#10B981] text-[14px] font-semibold transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:outline-none"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>WhatsApp</span>
            </a>

            {/* [Solicitar Assistência] ← Botão destacado, sempre visível (desktop e mobile) */}
            <Link
              to="/solicitar-assistencia"
              onClick={() => track('conversion', { step: 'nav_cta_click' })}
              className="inline-flex items-center gap-2 min-h-[48px] px-3.5 sm:px-5 py-2.5 rounded-[10px] bg-[#0284C7] hover:bg-[#0EA5E9] text-white font-semibold text-[14px] sm:text-[15px] transition-all hover:shadow-[0_16px_40px_rgba(2,132,199,0.16)] active:scale-95 shrink-0 focus-visible:ring-2 focus-visible:ring-[#0EA5E9] focus-visible:outline-none whitespace-nowrap"
              aria-label="Solicitar Assistência Técnica"
            >
              <Wrench className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline sm:inline">Solicitar Assistência</span>
              <span className="inline xs:hidden sm:hidden">Assistência</span>
            </Link>

            {/* Botão Hambúrguer Mobile (<1024px) */}
            <button
              ref={mobileButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-800" />
              ) : (
                <Menu className="w-6 h-6 text-slate-800" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MENU MOBILE (<1024px): Ecrã Inteiro / Drawer Acordeão */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu de Navegação Móvel"
          className="lg:hidden fixed inset-x-0 top-20 bottom-0 bg-white z-50 overflow-y-auto border-t border-slate-200 flex flex-col justify-between animate-in fade-in duration-150"
        >
          <div className="p-4 space-y-2">
            <nav aria-label="Navegação mobile" className="space-y-1 text-base font-medium text-slate-800">
              {/* 1. Início */}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between min-h-[44px] px-3.5 py-2.5 rounded-xl transition-colors ${
                  location.pathname === '/'
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span>Início</span>
              </Link>

              {/* 2. Serviços ▾ (Acordeão por Categoria Técnica) */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobileServicesExpanded(!mobileServicesExpanded)}
                  className={`w-full flex items-center justify-between min-h-[48px] px-3.5 py-2.5 text-left transition-colors ${
                    isActive('/servicos')
                      ? 'bg-sky-50/70 text-sky-700 font-semibold'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                  aria-expanded={mobileServicesExpanded}
                >
                  <span className="flex items-center gap-2">
                    <span>Serviços</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-normal">
                      6 Categorias
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      mobileServicesExpanded ? 'rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>

                {/* Sub-acordeão das 6 Categorias (1 aberta de cada vez para evitar scroll infinito) */}
                {mobileServicesExpanded && (
                  <div className="bg-slate-50/50 border-t border-slate-200 divide-y divide-slate-200/80">
                    {CATEGORIES_CONFIG.map((cat) => {
                      const isCatOpen = openMobileCat === cat.id;
                      const catServices = getCategoryServices(cat.id);

                      return (
                        <div key={cat.id} className="overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleMobileCat(cat.id)}
                            className="w-full flex items-center justify-between min-h-[44px] px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-sky-600 hover:bg-slate-100 transition-colors uppercase tracking-wider"
                            aria-expanded={isCatOpen}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-sm" aria-hidden="true">
                                {cat.icon}
                              </span>
                              <span>{cat.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({catServices.length})
                              </span>
                            </span>
                            <ChevronRight
                              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                isCatOpen ? 'rotate-90 text-sky-600' : ''
                              }`}
                            />
                          </button>

                          {/* Lista de Serviços Expandida da Categoria Atual */}
                          {isCatOpen && (
                            <ul className="bg-white px-3 py-2 space-y-1 border-t border-slate-200/60 animate-in fade-in duration-100">
                              {catServices.map((srv) => (
                                <li key={srv.id || srv.slug}>
                                  <Link
                                    to={`/servicos/${srv.slug}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center min-h-[44px] px-3 py-2 rounded-lg text-sm transition-colors ${
                                      location.pathname === `/servicos/${srv.slug}`
                                        ? 'text-sky-600 font-semibold bg-sky-50'
                                        : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span>{srv.menuLabel || srv.name}</span>
                                  </Link>
                                </li>
                              ))}
                              {catServices.length === 0 && (
                                <li className="px-3 py-2 text-xs text-slate-400 italic">
                                  Nenhum serviço registado nesta categoria.
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                      );
                    })}

                    {/* Rodapé do Acordeão Mobile */}
                    <div className="p-3 bg-white space-y-2">
                      <Link
                        to="/servicos"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between min-h-[44px] px-3 py-2 text-xs font-semibold text-sky-600 hover:text-sky-800 rounded-lg hover:bg-sky-50"
                      >
                        <span>Ver catálogo completo de serviços</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <a
                        href={notFoundWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          track('whatsapp_click', { source: 'mobile_megamenu_not_found' });
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-2 min-h-[44px] px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Não encontrou o seu equipamento? WhatsApp &rarr;</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Equipamentos */}
              <Link
                to="/equipamentos"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between min-h-[44px] px-3.5 py-2.5 rounded-xl transition-colors ${
                  isActive('/equipamentos')
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span>Equipamentos</span>
              </Link>

              {/* 4. Galeria */}
              <Link
                to="/galeria"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between min-h-[44px] px-3.5 py-2.5 rounded-xl transition-colors ${
                  isActive('/galeria')
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span>Galeria</span>
              </Link>

              {/* 5. Sobre */}
              <Link
                to="/sobre"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between min-h-[44px] px-3.5 py-2.5 rounded-xl transition-colors ${
                  isActive('/sobre')
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span>Sobre</span>
              </Link>

              {/* 6. Como Funciona */}
              <Link
                to="/como-funciona"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between min-h-[44px] px-3.5 py-2.5 rounded-xl transition-colors ${
                  isActive('/como-funciona')
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span>Como Funciona</span>
              </Link>

              {/* 7. Contactos */}
              <Link
                to="/contactos"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between min-h-[44px] px-3.5 py-2.5 rounded-xl transition-colors ${
                  isActive('/contactos')
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span>Contactos</span>
              </Link>
            </nav>
          </div>

          {/* Ações Inferiores do Menu Mobile */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2.5 shrink-0">
            <Link
              to="/solicitar-assistencia"
              onClick={() => {
                track('conversion', { step: 'mobile_menu_cta' });
                setMobileMenuOpen(false);
              }}
              className="w-full min-h-[48px] py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-center font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-98"
            >
              <Wrench className="w-4 h-4" />
              <span>Solicitar Assistência Técnica</span>
            </Link>

            {CLIENT_PORTAL_URL ? (
              <a
                href={CLIENT_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  track('client_portal_mobile_click');
                  setMobileMenuOpen(false);
                }}
                className="w-full min-h-[44px] py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-center font-medium text-sm flex items-center justify-center gap-2 transition-colors active:scale-98"
              >
                <ExternalLink className="w-4 h-4 text-sky-600" />
                <span>Consultar minha assistência</span>
              </a>
            ) : null}

            <a
              href={getGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                track('whatsapp_click', { source: 'mobile_menu_direct' });
                setMobileMenuOpen(false);
              }}
              className="w-full min-h-[48px] py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-center font-medium text-sm flex items-center justify-center gap-2 transition-colors active:scale-98"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Falar no WhatsApp ({company.whatsappDisplay})</span>
            </a>

            <div className="pt-2 text-center text-xs text-slate-500">
              <span>Oficina no Golf 2, Luanda · Bancada Técnica Especializada</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
