import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { COMPANY } from '../../content/company';
import { getGeneralWhatsAppUrl } from '../../lib/whatsapp';
import { track } from '../../lib/analytics';

export const WhatsAppFloating: React.FC = () => {
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Contextual Bubble / Tooltip */}
      {!tooltipDismissed && (
        <div className="pointer-events-auto mb-2 bg-white text-slate-800 shadow-xl border border-slate-200 rounded-2xl p-3 max-w-[260px] relative animate-fade-in">
          <button
            onClick={() => setTooltipDismissed(true)}
            className="absolute top-1.5 right-1.5 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            aria-label="Fechar mensagem"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-slate-900">Ama Tec WhatsApp</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Tem um equipamento com avaria? Fale connosco para triagem e assistência rápida.
          </p>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={getGeneralWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('whatsapp_click', { source: 'floating_button' })}
        aria-label="Contactar a Ama Tec pelo WhatsApp oficial (+244 930 372 597)"
        className="pointer-events-auto group relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-300"
      >
        <span className="sr-only">Contactar via WhatsApp</span>
        <MessageSquare className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600 border-2 border-white"></span>
        </span>
      </a>
    </div>
  );
};
