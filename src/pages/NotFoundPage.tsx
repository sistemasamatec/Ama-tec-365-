import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Wrench, Laptop, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import { getGeneralWhatsAppUrl } from '../lib/whatsapp';
import { updateDocumentSeo } from '../lib/seo';
import { track } from '../lib/analytics';

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    updateDocumentSeo({
      title: '404 — Página Não Encontrada | Ama Tec',
      description: 'A página solicitada não existe ou foi transferida no site oficial da Ama Tec.',
      canonicalPath: '/404',
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-8">
      <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-3">
        <span className="text-xs font-mono font-bold text-sky-600 uppercase tracking-widest block">
          Erro 404
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Página Não Encontrada
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          O endereço acedido não existe no site oficial da Ama Tec ou pode ter sido alterado durante a atualização dos nossos serviços técnicos.
        </p>
      </div>

      {/* Recommended Navigation Links */}
      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 text-white font-medium text-xs shadow-sm hover:bg-sky-500 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </Link>

        <Link
          to="/servicos"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors"
        >
          <Wrench className="w-4 h-4 text-sky-600" />
          <span>Catálogo de Serviços</span>
        </Link>

        <Link
          to="/equipamentos"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors"
        >
          <Laptop className="w-4 h-4 text-sky-600" />
          <span>Equipamentos</span>
        </Link>

        <Link
          to="/contactos"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors"
        >
          <Phone className="w-4 h-4 text-sky-600" />
          <span>Contactos Oficiais</span>
        </Link>

        <a
          href={getGeneralWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('whatsapp_click', { source: '404_page' })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Ama Tec</span>
        </a>
      </div>
    </div>
  );
};
