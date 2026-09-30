import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X } from 'lucide-react';
import { getGeneralWhatsAppUrl } from '../../lib/whatsapp';
import { track } from '../../lib/analytics';
import { useSettings } from '../../context/SettingsContext';

const SESSION_STORAGE_KEY = 'amatec_wa_bubble_dismissed';

export const WhatsAppFloating: React.FC = () => {
  const location = useLocation();
  const { settings } = useSettings();
  const [showBubble, setShowBubble] = useState(false);

  // 1. Ocultar obrigatoriamente em todas as rotas do painel administrativo
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdminRoute) return;

    // Se já foi dispensado nesta sessão do navegador, nunca mais reabre
    const alreadyDismissed = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
    if (alreadyDismissed) return;

    // Aparece 1x após 8 segundos
    const showTimer = setTimeout(() => {
      setShowBubble(true);

      // Fecha sozinho após 6 segundos
      const hideTimer = setTimeout(() => {
        setShowBubble(false);
      }, 6000);

      return () => clearTimeout(hideTimer);
    }, 8000);

    return () => clearTimeout(showTimer);
  }, [isAdminRoute]);

  const handleDismiss = () => {
    setShowBubble(false);
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    } catch {
      // Ignora erro se cookies/storage desativados
    }
  };

  if (isAdminRoute) {
    return null;
  }

  const customMessage =
    settings.visualIdentity?.whatsappMessage ||
    'Tem um aparelho com avaria? Fale connosco para triagem e agendamento rápido.';

  return (
    <div
      className="fixed right-4 z-40 flex flex-col items-end pointer-events-none select-none transition-all duration-300 bottom-[76px] md:bottom-4"
    >
      {/* Balão de texto automático (aparece após 8s, fecha após 6s, ou com X) */}
      {showBubble && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-auto mb-2.5 mr-1 bg-white text-slate-800 shadow-xl border border-slate-200/90 rounded-2xl p-3.5 max-w-[270px] relative animate-fade-in transition-all duration-300 transform scale-100 origin-bottom-right"
        >
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Fechar mensagem"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-2 mb-1.5 pr-5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900">Atendimento Técnico</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            {customMessage}
          </p>
        </div>
      )}

      {/* Botão Flutuante (Exatamente 56px = w-14 h-14) */}
      <a
        href={getGeneralWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('whatsapp_click', { source: 'floating_button' })}
        aria-label="Contactar a Ama Tec pelo WhatsApp oficial"
        className="pointer-events-auto group relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-300 shrink-0"
      >
        <span className="sr-only">Contactar via WhatsApp</span>
        <MessageSquare className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600 border-2 border-white" />
        </span>
      </a>
    </div>
  );
};
