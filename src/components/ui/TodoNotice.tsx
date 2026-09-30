import React from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';

interface TodoNoticeProps {
  label: string;
  type?: 'photo' | 'info' | 'map';
  className?: string;
}

export const TodoNotice: React.FC<TodoNoticeProps> = ({
  label,
  type = 'photo',
  className = '',
}) => {
  // Remove qualquer prefixo interno ou técnico
  const cleanLabel = label.replace(/^TODO_CONTEUDO:\s*/i, '').trim();

  return (
    <div
      className={`border border-dashed border-slate-300 bg-slate-50/80 p-4 rounded-xl text-slate-700 flex items-center gap-3 text-xs md:text-sm font-medium ${className}`}
      role="status"
    >
      <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 shrink-0 border border-sky-100">
        <Camera className="w-4 h-4" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <span className="font-semibold text-slate-800 text-[11px] block uppercase tracking-wider">
          Registo de Intervenção Técnica
        </span>
        <span className="text-slate-500 text-xs">{cleanLabel}</span>
      </div>
    </div>
  );
};
