import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, Laptop, Wrench, Filter } from 'lucide-react';
import { EQUIPMENT_CATALOG } from '../content/equipment';
import { CATEGORIES_CONFIG } from '../content/services';
import { updateDocumentSeo } from '../lib/seo';
import { TodoNotice } from '../components/ui/TodoNotice';
import { track } from '../lib/analytics';

export const EquipmentPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('categoria') || 'todas';
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    updateDocumentSeo({
      title: 'Equipamentos Atendidos pela Ama Tec | Catálogo Oficial',
      description:
        'Consulte os modelos de televisores, máquinas de lavar, fritadeiras Air Fryer, fornos e balanças atendidos na oficina Ama Tec em Luanda.',
      canonicalPath: '/equipamentos',
    });
  }, []);

  const handleCategoryChange = (catId: string) => {
    if (catId === 'todas') {
      searchParams.delete('categoria');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ categoria: catId });
    }
  };

  const filteredEquipment = EQUIPMENT_CATALOG.filter((eq) => {
    const matchesCategory =
      activeCategory === 'todas' || eq.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      eq.name.toLowerCase().includes(q) ||
      eq.brand.toLowerCase().includes(q) ||
      eq.model.toLowerCase().includes(q) ||
      eq.description.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
          Equipamentos Frequentes
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Catálogo de Equipamentos
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Consulte especificações técnicas e serviços disponíveis para aparelhos residenciais, comerciais e eletrónicos com assistência técnica garantida em Luanda.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="relative max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por marca, modelo ou aparelho (ex: Samsung, LG, Airfryer)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

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
            Todos os Equipamentos ({EQUIPMENT_CATALOG.length})
          </button>
          {CATEGORIES_CONFIG.map((cat) => {
            const count = EQUIPMENT_CATALOG.filter((e) => e.category === cat.id).length;
            if (count === 0) return null;
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-sky-600 uppercase tracking-wider text-[11px]">
                    {item.brand}
                  </span>
                  <span className="text-slate-400">{item.categoryName}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {item.name}
                </h2>
                <p className="text-xs text-slate-500 font-mono">{item.model}</p>
              </div>

              {/* Photo placeholder strictly with TODO_CONTEUDO */}
              <div className="my-2">
                <TodoNotice label={item.photoPlaceholder} type="photo" />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {item.description}
              </p>

              {/* Specifications preview */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-[11px]">
                {item.specifications.slice(0, 2).map((spec, i) => (
                  <div key={i} className="flex justify-between gap-2">
                    <span className="text-slate-500">{spec.label}:</span>
                    <span className="font-medium text-slate-800 text-right truncate">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link
                to={`/equipamentos/${item.category}/${item.slug}`}
                onClick={() => track('equipment_open', { equipment: item.slug })}
                className="font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
              >
                <span>Ficha técnica & assistência</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
