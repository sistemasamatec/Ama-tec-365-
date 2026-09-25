import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { WhatsAppFloating } from './components/layout/WhatsAppFloating';
import { MobileActionBar } from './components/layout/MobileActionBar';
import { SettingsProvider } from './context/SettingsContext';
import { ServicesProvider } from './context/ServicesContext';

// Importação síncrona dos componentes de página para renderização estática completa no build (SSG)
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { EquipmentDetailPage } from './pages/EquipmentDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';
import { RequestAssistancePage } from './pages/RequestAssistancePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { CookiesPage } from './pages/CookiesPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function renderRoute(url: string): string {
  return renderToString(
    <SettingsProvider>
      <ServicesProvider>
        <MemoryRouter initialEntries={[url]}>
          {/* Skip to content para acessibilidade */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-sky-600 focus:text-white focus:rounded-xl focus:shadow-xl focus:text-sm focus:font-semibold"
          >
            Saltar para o conteúdo principal
          </a>
          <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-sky-500 selection:text-white antialiased">
            <Navbar />
            <main id="main-content" className="flex-1 pb-16 md:pb-0">
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
                <Route path="/privacidade" element={<PrivacyPage />} />
                <Route path="/cookies" element={<CookiesPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer onOpenDatabaseManager={() => {}} />
            <div className="hidden md:block">
              <WhatsAppFloating />
            </div>
            <MobileActionBar />
          </div>
        </MemoryRouter>
      </ServicesProvider>
    </SettingsProvider>
  );
}
