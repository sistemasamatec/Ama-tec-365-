import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Settings, Check } from 'lucide-react';
import { setAnalyticsConsent, hasAnalyticsConsent } from '../../lib/analytics';

const COOKIE_STORAGE_KEY = 'amatec_cookie_consent_v1';

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!stored) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    setAnalyticsConsent({ necessary: true, analytics: true });
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    setAnalyticsConsent({ necessary: true, analytics: false });
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    setAnalyticsConsent({ necessary: true, analytics: analyticsEnabled });
    setShowPreferences(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentimento de Cookies e Privacidade"
      className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-800 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 space-y-1.5 text-xs md:text-sm text-slate-300">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Respeito pela sua Privacidade na Ama Tec</span>
          </div>
          <p className="leading-relaxed text-slate-300">
            Utilizamos cookies essenciais para garantir o funcionamento do site e da base de dados de pedidos. Com o seu consentimento, recolhemos também métricas anónimas para melhorar a rapidez de resposta dos nossos serviços técnicos, em conformidade com as diretrizes da Lei de Proteção de Dados de Angola (Lei n.º 22/11).
          </p>
          <div className="flex gap-3 text-xs pt-1">
            <Link to="/privacidade" className="text-sky-400 hover:underline">
              Política de Privacidade
            </Link>
            <span className="text-slate-600">·</span>
            <Link to="/cookies" className="text-sky-400 hover:underline">
              Gerir Cookies
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={handleAcceptNecessary}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            Apenas Necessários
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Aceitar Todos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
