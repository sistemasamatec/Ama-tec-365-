import React from 'react';
import { AlertCircle, Image as ImageIcon } from 'lucide-react';

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
  return (
    <div
      className={`border border-dashed border-amber-300/80 bg-amber-50/50 p-4 rounded-xl text-amber-900 flex items-center gap-3 text-xs md:text-sm font-medium ${className}`}
      role="status"
    >
      {type === 'photo' ? (
        <ImageIcon className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
      )}
      <div className="flex-1">
        <span className="font-semibold text-amber-800 uppercase tracking-wider text-[11px] block">
          TODO_CONTEUDO
        </span>
        <span className="text-slate-600">{label}</span>
      </div>
    </div>
  );
};
