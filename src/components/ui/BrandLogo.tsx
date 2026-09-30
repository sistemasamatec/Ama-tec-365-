import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';

interface BrandLogoProps {
  className?: string;
  variant?: 'navbar' | 'footer' | 'admin' | 'symbol';
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'navbar',
  alt = 'Ama Tec — Assistência Técnica de Equipamentos Eletrónicos',
}) => {
  const { settings } = useSettings();
  const [hasError, setHasError] = useState(false);

  // Logo oficial em settings ou fallback padrão
  const customLogoUrl = settings.visualIdentity?.logoUrl?.trim();
  const defaultLogo = variant === 'footer' ? '/brand/logo-light.svg' : '/brand/logo.svg';
  const logoSrc = (!hasError && customLogoUrl) ? customLogoUrl : defaultLogo;

  // Fallback em texto elegante caso o ficheiro de imagem falhe ou demore a carregar
  if (hasError) {
    if (variant === 'footer') {
      return (
        <div className={`flex items-center gap-2.5 font-bold tracking-tight ${className}`}>
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 font-black text-sm">
            AT
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            Ama <span className="text-sky-400">Tec</span>
          </span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-2.5 font-bold tracking-tight ${className}`}>
        <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm font-black text-sm">
          AT
        </div>
        <span className="text-xl font-black text-slate-900 tracking-tight">
          Ama <span className="text-sky-600">Tec</span>
        </span>
      </div>
    );
  }

  // Classes de dimensão por variante
  let sizeClasses = 'h-9 sm:h-10 md:h-11 w-auto max-w-[150px] sm:max-w-[190px] xl:max-w-[240px] object-contain';
  if (variant === 'footer') {
    sizeClasses = 'h-10 sm:h-11 w-auto max-w-[220px] object-contain';
  } else if (variant === 'admin') {
    sizeClasses = 'h-8 sm:h-9 w-auto max-w-[180px] object-contain';
  } else if (variant === 'symbol') {
    sizeClasses = 'w-7 h-7 object-contain';
  }

  return (
    <img
      src={logoSrc}
      alt={alt}
      onError={() => setHasError(true)}
      className={`${sizeClasses} ${className}`}
      loading="eager"
      decoding="async"
    />
  );
};
