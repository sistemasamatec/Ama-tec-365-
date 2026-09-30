import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { WhatsAppFloating } from './components/layout/WhatsAppFloating';
import { MobileActionBar } from './components/layout/MobileActionBar';
import { CookieConsent } from './components/layout/CookieConsent';
import { AdminLeadsModal } from './components/ui/AdminLeadsModal';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { ServicesProvider } from './context/ServicesContext';
import { Wrench, Phone, MessageSquare, MapPin } from 'lucide-react';
import { getGeneralWhatsAppUrl } from './lib/whatsapp';

// HomePage carregada de imediato para LCP < 2.5s na página principal
import { HomePage } from './pages/HomePage';

// Code splitting por rota para reduzir o bundle inicial (Performance / Mobile 4G)
const ServicesPage = lazy(() => import('./pages/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage').then((m) => ({ default: m.ServiceDetailPage })));
const EquipmentPage = lazy(() => import('./pages/EquipmentPage').then((m) => ({ default: m.EquipmentPage })));
const EquipmentDetailPage = lazy(() => import('./pages/EquipmentDetailPage').then((m) => ({ default: m.EquipmentDetailPage })));
const GalleryPage = lazy(() => import('./pages/GalleryPage').then((m) => ({ default: m.GalleryPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const RequestAssistancePage = lazy(() => import('./pages/RequestAssistancePage').then((m) => ({ default: m.RequestAssistancePage })));
const FaqPage = lazy(() => import('./pages/FaqPage').then((m) => ({ default: m.FaqPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const CookiesPage = lazy(() => import('./pages/CookiesPage').then((m) => ({ default: m.CookiesPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
import { track } from './lib/analytics';

// Componente para rolar ao topo a cada mudança de rota
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    track('page_view', { path: pathname });
  }, [pathname]);

  return null;
}

function MainAppContent() {
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSettings();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Modo de Manutenção (Apenas afeta visitantes públicos; permite acesso ao /admin)
  if (settings.maintenanceMode?.enabled && !isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 text-center">
        <div className="max-w-md w-full space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Wrench className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Portal em Manutenção</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              {settings.maintenanceMode.message ||
                'A bancada técnica da Ama Tec está a atualizar os sistemas. Para reparações imediatas, contacte-nos diretamente.'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs text-left">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Phone className="w-4 h-4 text-sky-400 shrink-0" />
              <a href={`tel:${settings.company.phone}`} className="hover:text-white font-mono font-medium">
                {settings.company.phoneDisplay}
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              <a
                href={getGeneralWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-300 font-mono font-medium"
              >
                WhatsApp: {settings.company.whatsappDisplay}
              </a>
            </div>
            <div className="flex items-start gap-2.5 text-slate-400 text-[11px] pt-1 border-t border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>{settings.company.address}, {settings.company.city}</span>
            </div>
          </div>

          <div className="pt-4">
            <a
              href="/admin"
              className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
            >
              Área Técnica / Administração &rarr;
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Rota de Administração: Apresenta interface dedicada sem cabeçalho público
  if (isAdminRoute) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <AdminPage />
      </Suspense>
    );
  }

  // Rota Pública Normal do Website
  return (
    <>
      {/* Skip to Content acessível (WCAG 2.1 AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-sky-600 focus:text-white focus:rounded-xl focus:shadow-xl focus:text-sm focus:font-semibold"
      >
        Saltar para o conteúdo principal
      </a>

      <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-sky-500 selection:text-white antialiased">
        {/* Navbar Oficial */}
        <Navbar />

        {/* Conteúdo Principal com Rotas por Caminho Real (Proibido Hash) */}
        <main id="main-content" className="flex-1 pb-16 md:pb-0">
          <Suspense
            fallback={
              <div className="py-24 text-center space-y-3" role="status" aria-label="A carregar página">
                <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <span className="text-xs text-slate-500 font-medium">A carregar conteúdo técnico...</span>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/servicos" element={<ServicesPage />} />
              <Route path="/servicos/:slug" element={<ServiceDetailPage />} />
              <Route path="/equipamentos" element={<EquipmentPage />} />
              <Route
                path="/equipamentos/:categoria/:modelo"
                element={<EquipmentDetailPage />}
              />
              <Route path="/galeria" element={<GalleryPage />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/como-funciona" element={<HowItWorksPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/contactos" element={<ContactPage />} />
              <Route
                path="/solicitar-assistencia"
                element={<RequestAssistancePage />}
              />
              <Route path="/agendar" element={<RequestAssistancePage />} />
              <Route path="/privacidade" element={<PrivacyPage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>

        {/* Rodapé Oficial com Razão Social e NAP */}
        <Footer onOpenDatabaseManager={() => setIsDbModalOpen(true)} />

        {/* Botão Flutuante Global do WhatsApp (56px com balão inteligente e margem segura) */}
        <WhatsAppFloating />

        {/* Barra de Ações Fixa no Mobile (Ligar + WhatsApp + Solicitar) */}
        <MobileActionBar />

        {/* Banner de Consentimento de Cookies & Privacidade (Lei n.º 22/11 de Angola) */}
        <CookieConsent />

        {/* Modal de Gestão da Base de Dados de Pedidos (Ama Tec Database) */}
        <AdminLeadsModal
          isOpen={isDbModalOpen}
          onClose={() => setIsDbModalOpen(false)}
        />
      </div>
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <ServicesProvider>
        <BrowserRouter>
          <ScrollToTop />
          <MainAppContent />
        </BrowserRouter>
      </ServicesProvider>
    </SettingsProvider>
  );
}
