import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, Cookie } from 'lucide-react';
import { updateDocumentSeo } from '../lib/seo';
import { hasAnalyticsConsent, setAnalyticsConsent } from '../lib/analytics';

export const CookiesPage: React.FC = () => {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  useEffect(() => {
    updateDocumentSeo({
      title: 'Política de Cookies & Preferências | Ama Tec',
      description:
        'Informação sobre os cookies utilizados no site oficial da Ama Tec e gestão do seu consentimento de privacidade.',
      canonicalPath: '/cookies',
    });
    setAnalyticsEnabled(hasAnalyticsConsent());
  }, []);

  const handleSave = () => {
    setAnalyticsConsent({ necessary: true, analytics: analyticsEnabled });
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div className="space-y-3">
        <div className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
          Transparência Digital
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Política de Cookies e Gestão de Consentimento
        </h1>
        <p className="text-xs text-slate-500">
          Gerencie como os dados de navegação e desempenho são tratados durante a sua visita à Ama Tec.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">O que são Cookies?</h2>
          <p>
            Cookies são pequenos ficheiros de texto guardados no seu navegador que permitem memorizar o estado das suas sessões e preferências fundamentais do website.
          </p>
        </section>

        {/* Gestor Interativo de Preferências */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Cookie className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">Configuração das Suas Preferências</h2>
          </div>

          <div className="space-y-4">
            {/* Categoria 1: Necessários */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 block">1. Cookies Estritamente Necessários</span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Essenciais para a navegação básica, persistência local de pedidos de assistência e funcionamento seguro da aplicação. Não podem ser desativados.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-md shrink-0">
                Sempre Ativos
              </span>
            </div>

            {/* Categoria 2: Analíticos / Métricas */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 block">2. Cookies Analíticos e de Desempenho</span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Recolhem métricas anónimas agregadas (páginas mais consultadas, tempos de carregamento e taxas de conversão) para nos ajudar a otimizar a rapidez dos serviços da Ama Tec.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-sm transition-colors"
            >
              Guardar Preferências
            </button>

            {savedNotification && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 animate-fade-in">
                <Check className="w-4 h-4" />
                <span>Preferências guardadas com sucesso!</span>
              </span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
