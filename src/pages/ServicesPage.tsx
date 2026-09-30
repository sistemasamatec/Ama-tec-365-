import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowRight, Wrench, Shield, Filter, Calculator } from 'lucide-react';
import { CATEGORIES_CONFIG, SERVICES } from '../content/services';
import { ServiceCategory } from '../types';
import { updateDocumentSeo } from '../lib/seo';
import { track } from '../lib/analytics';
import { QuickBudgetSimulator } from '../components/calculator/QuickBudgetSimulator';
import { useServices } from '../context/ServicesContext';

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('categoria') || 'todas';
  const [searchQuery, setSearchQuery] = useState('');
  const { services } = useServices();
  const sourceServices = services.length > 0 ? services : SERVICES;

  useEffect(() => {
    updateDocumentSeo({
      title: 'Serviços de Assistência Técnica e Reparação | Ama Tec Luanda',
      description:
        'Catálogo de serviços técnicos da Ama Tec: reparação de eletrodomésticos, televisores, eletrónica de componentes, cozinhas industriais e instalações elétricas.',
      canonicalPath: '/servicos',
    });
  }, []);

  const handleCategoryChange = (catId: string) => {
    if (catId === 'todas') {
      searchParams.delete('categoria');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ categoria: catId });
    }
    track('filter', { type: 'services_category', value: catId });
  };

  const filteredServices = sourceServices.filter((service) => {
    if (service.status === 'archived') return false;
    const matchesCategory =
      activeCategory === 'todas' || service.category === (activeCategory as ServiceCategory);
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      service.name.toLowerCase().includes(query) ||
      service.shortDescription.toLowerCase().includes(query) ||
      service.coveredEquipment.some((eq) => eq.toLowerCase().includes(query)) ||
      service.commonProblems.some((prob) => prob.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
            Especialidades Técnicas Ama Tec
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Catálogo Oficial de Serviços
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Explore as nossas 6 categorias de assistência técnica com bancadas equipadas e técnicos especializados em Luanda. Cada serviço dispõe de protocolo próprio de diagnóstico e peças certificadas.
          </p>
        </div>

        <a
          href="#simulador-orcamento"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 font-semibold text-xs transition-colors shrink-0 shadow-sm border border-slate-800"
        >
          <Calculator className="w-4 h-4 text-sky-400" />
          <span>Simulador de Orçamento Rápido</span>
        </a>
      </div>

      {/* Simulador de Orçamento Rápido */}
      <QuickBudgetSimulator />

      {/* Filter and Search Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
        {/* Search */}
        <div className="relative max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por aparelho, avaria ou serviço (ex: TV, placa, Air Fryer, bomba)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
          />
        </div>

        {/* Categories Tab Bar (Segmented button control per zero-pill guidelines) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 text-xs">
          <button
            type="button"
            onClick={() => handleCategoryChange('todas')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-colors shrink-0 ${
              activeCategory === 'todas'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Todas as Categorias ({SERVICES.length})
          </button>
          {CATEGORIES_CONFIG.map((cat) => {
            const count = SERVICES.filter((s) => s.category === cat.id).length;
            const isCurrent = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3.5 py-2 rounded-lg font-medium transition-colors shrink-0 ${
                  isCurrent
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <Wrench className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            Nenhum serviço encontrado para estes critérios
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tente procurar por outro termo ou limpe os filtros para ver todos os serviços disponíveis na Ama Tec.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              handleCategoryChange('todas');
            }}
            className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
          >
            Limpar Filtros de Pesquisa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const catConfig = CATEGORIES_CONFIG.find((c) => c.id === service.category);
            const cardImg =
              service.imageUrl ||
              (service.category === 'domestico'
                ? '/images/service-appliances.jpg'
                : '/images/service-electronics.jpg');

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Imagem do Card (Proporção 4:3) com Overlay Navy->Transparente e Ícone */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                  <img
                    src={cardImg}
                    alt={service.imageAlt || service.name}
                    loading="lazy"
                    width="400"
                    height="300"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent pointer-events-none" />

                  {/* Ícone e Nome da Categoria no Topo */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-semibold border border-slate-700/60 flex items-center gap-1.5 shadow-sm">
                    <span>{catConfig?.icon || '🔧'}</span>
                    <span>{service.categoryName}</span>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-sky-600">{service.categoryName}</span>
                      <span className="text-slate-400 font-mono">Bancada Luanda</span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-sky-600 transition-colors">
                      {service.name}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {service.shortDescription}
                    </p>

                    {/* Covered Equipment list */}
                    <div className="pt-1">
                      <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                        Equipamentos abrangidos:
                      </span>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {service.coveredEquipment.slice(0, 3).map((eq, i) => (
                          <li key={i} className="flex items-center gap-1.5 truncate">
                            <span className="text-sky-500">·</span>
                            <span className="truncate">{eq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <Link
                      to={`/servicos/${service.slug}`}
                      className="font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                    >
                      <span>Detalhes completos</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to={`/solicitar-assistencia?servico=${service.slug}`}
                      className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors shadow-2xs"
                    >
                      Pedir
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
