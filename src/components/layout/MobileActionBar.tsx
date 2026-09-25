import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Phone, Wrench } from 'lucide-react';
import { COMPANY } from '../../content/company';
import { getGeneralWhatsAppUrl } from '../../lib/whatsapp';
import { track } from '../../lib/analytics';

export const MobileActionBar: React.FC = () => {
  const location = useLocation();

  // Se já estiver na página de solicitar assistência, não duplica o CTA de solicitar
  const isRequestPage = location.pathname === '/solicitar-assistencia';

  return (
    <nav
      aria-label="Ações rápidas móveis"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 flex items-center justify-around gap-2 shadow-lg md:hidden"
    >
      {/* Botão de Ligar via tel: */}
      <a
        href={`tel:${COMPANY.phone}`}
        onClick={() => track('phone_click', { source: 'mobile_action_bar' })}
        className="flex-1 min-h-[44px] flex flex-col items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold transition-colors active:scale-95"
        aria-label="Ligar para a oficina Ama Tec (+244 930 372 597)"
      >
        <Phone className="w-4 h-4 text-sky-600 mb-0.5" />
        <span>Ligar</span>
      </a>

      {/* Botão WhatsApp via wa.me */}
      <a
        href={getGeneralWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('whatsapp_click', { source: 'mobile_action_bar' })}
        className="flex-1 min-h-[44px] flex flex-col items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold transition-colors active:scale-95 shadow-xs"
        aria-label="Abrir conversa no WhatsApp oficial da Ama Tec"
      >
        <MessageSquare className="w-4 h-4 text-white mb-0.5" />
        <span>WhatsApp</span>
      </a>

      {/* Botão Solicitar Assistência */}
      <Link
        to="/solicitar-assistencia"
        onClick={() => track('conversion', { step: 'mobile_action_bar_click' })}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center rounded-xl text-[11px] font-semibold transition-colors active:scale-95 shadow-xs ${
          isRequestPage
            ? 'bg-sky-700 text-white ring-2 ring-sky-300'
            : 'bg-sky-600 hover:bg-sky-500 text-white'
        }`}
        aria-label="Formulário para solicitar assistência técnica"
      >
        <Wrench className="w-4 h-4 text-white mb-0.5" />
        <span>Solicitar</span>
      </Link>
    </nav>
  );
};
