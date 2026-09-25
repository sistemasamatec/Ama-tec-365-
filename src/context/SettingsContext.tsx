import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { COMPANY, SOCIAL_LINKS } from '../content/company';

export interface SiteSettingsData {
  company: {
    brand: string;
    legalName: string;
    descriptor: string;
    nif: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    phoneDisplay: string;
    whatsapp: string;
    whatsappDisplay: string;
    email: string;
    domain: string;
    siteUrl: string;
  };
  visualIdentity: {
    logoUrl: string;
    brandColor: string;
    logoHistory?: { url: string; uploadedAt: string; fileName: string }[];
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    whatsappBusiness?: string;
    tiktok?: string;
    linkedin?: string;
    youtube?: string;
  };
  googleMaps: {
    embedUrl?: string;
    mapLink?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  businessHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
    notes?: string;
  };
  googleReviewsUrl?: string;
  maintenanceMode: {
    enabled: boolean;
    message: string;
  };
}

const DEFAULT_SETTINGS: SiteSettingsData = {
  company: {
    brand: COMPANY.brand,
    legalName: COMPANY.legalName,
    descriptor: COMPANY.descriptor,
    nif: COMPANY.nif,
    address: COMPANY.address,
    city: COMPANY.city,
    country: COMPANY.country,
    phone: COMPANY.phone,
    phoneDisplay: COMPANY.phoneDisplay,
    whatsapp: COMPANY.whatsapp,
    whatsappDisplay: COMPANY.whatsappDisplay,
    email: COMPANY.email,
    domain: COMPANY.domain,
    siteUrl: COMPANY.siteUrl,
  },
  visualIdentity: {
    logoUrl: '/brand/logo.svg',
    brandColor: '#0284c7',
  },
  socialLinks: {
    facebook: '',
    instagram: '',
    whatsappBusiness: COMPANY.whatsapp,
    tiktok: '',
    linkedin: '',
    youtube: '',
  },
  googleMaps: {
    embedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3942.348618361735!2d13.2362!3d-8.8893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwNTMnMjEuNSJTIDEzwrAxNCcxMC4zIkU!5e0!3m2!1spt-PT!2sao!4v1700000000000!5m2!1spt-PT!2sao',
    mapLink: 'https://maps.google.com/?q=-8.8893,13.2384',
    coordinates: {
      lat: -8.8893,
      lng: 13.2384,
    },
  },
  businessHours: {
    weekdays: 'Segunda a Sexta: 08:00 – 18:00',
    saturday: 'Sábado: 08:00 – 13:00',
    sunday: 'Domingo: Encerrado (Apoio a Urgências via WhatsApp)',
    notes: 'Bancada técnica disponível para triagens no Golf 2 durante horário normal.',
  },
  googleReviewsUrl: '',
  maintenanceMode: {
    enabled: false,
    message:
      'O portal da Ama Tec encontra-se em atualização de infraestrutura. Para reparações imediatas, contacte o WhatsApp +244 930 372 597.',
  },
};

interface SettingsContextValue {
  settings: SiteSettingsData;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  refreshSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettingsData>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return;
      setIsLoading(true);
      const res = await fetch('/api/public/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({
          ...prev,
          ...data,
          company: { ...prev.company, ...(data.company || {}) },
          visualIdentity: { ...prev.visualIdentity, ...(data.visualIdentity || {}) },
          socialLinks: { ...prev.socialLinks, ...(data.socialLinks || {}) },
          googleMaps: { ...prev.googleMaps, ...(data.googleMaps || {}) },
          businessHours: { ...prev.businessHours, ...(data.businessHours || {}) },
          maintenanceMode: { ...prev.maintenanceMode, ...(data.maintenanceMode || {}) },
        }));

        // Aplica a cor primária dinâmica no elemento raiz do documento
        if (data.visualIdentity?.brandColor) {
          document.documentElement.style.setProperty('--brand-primary', data.visualIdentity.brandColor);
        }
      }
    } catch (err) {
      console.warn('[SettingsContext] Não foi possível carregar configurações remotas, mantendo padrão local:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
