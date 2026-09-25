import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SERVICES } from '../content/services';
import { ServiceItem } from '../types';

export interface DynamicServiceItem extends ServiceItem {
  status?: 'published' | 'draft' | 'archived';
  updatedAt?: string;
}

interface ServicesContextValue {
  services: DynamicServiceItem[];
  isLoading: boolean;
  getServiceBySlug: (slug: string) => DynamicServiceItem | undefined;
  refreshServices: () => Promise<void>;
}

const ServicesContext = createContext<ServicesContextValue>({
  services: SERVICES,
  isLoading: false,
  getServiceBySlug: () => undefined,
  refreshServices: async () => {},
});

export const ServicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<DynamicServiceItem[]>(SERVICES);
  const [isLoading, setIsLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return;
      setIsLoading(true);
      const res = await fetch('/api/public/services');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        }
      }
    } catch (err) {
      console.warn('[ServicesContext] Erro ao carregar serviços da API, usando dados estáticos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const getServiceBySlug = (slug: string) => {
    return services.find((s) => s.slug === slug);
  };

  return (
    <ServicesContext.Provider value={{ services, isLoading, getServiceBySlug, refreshServices: fetchServices }}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => useContext(ServicesContext);
