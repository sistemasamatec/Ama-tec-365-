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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-[14px] font-semibold text-[#0284C7] uppercase tracking-wider">
          Equipamentos Frequentes
        </div>
        <h1 className="text-h1 font-heading font-extrabold text-[#060B16] tracking-tight">
          Catálogo de Equipamentos
        </h1>
        <p className="text-[16px] text-[#475569] leading-relaxed">
          Consulte especificações técnicas e serviços disponíveis para aparelhos residenciais, comerciais e eletrónicos com assistência técnica garantida em Luanda.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#F4F7FA] border border-[#E2E8F0] rounded-[14px] p-4 sm:p-6 space-y-4">
        <div className="relative max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por marca, modelo ou aparelho (ex: Samsung, LG, Airfryer)..."
            className="w-full pl-10 pr-4 py-2.5 text-[14px] rounded-[10px] border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 text-[14px]">
          <button
            type="button"
            onClick={() => handleCategoryChange('todas')}
            className={`px-3.5 py-2 min-h-[44px] rounded-[10px] font-medium transition-colors shrink-0 ${
              activeCategory === 'todas'
                ? 'bg-[#0284C7] text-white shadow-xs'
                : 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-slate-100'
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
                className={`px-3.5 py-2 min-h-[44px] rounded-[10px] font-medium transition-colors shrink-0 ${
                  isCurrent
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-slate-100'
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
            className="card-base bg-white overflow-hidden shadow-xs hover:shadow-hover-card transition-all flex flex-col justify-between"
          >
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[14px] text-[#475569]">
                  <span className="font-semibold text-[#0284C7] uppercase tracking-wider">
                    {item.brand}
                  </span>
                  <span className="text-[#475569]">{item.categoryName}</span>
                </div>
                <h2 className="text-lg font-bold font-heading text-[#060B16] leading-snug">
                  {item.name}
                </h2>
                <p className="text-[14px] text-[#475569] font-mono">{item.model}</p>
              </div>

              {/* Photo placeholder strictly with TODO_CONTEUDO */}
              <div className="my-2">
                <TodoNotice label={item.photoPlaceholder} type="photo" />
              </div>

              <p className="text-[14px] text-[#475569] leading-relaxed line-clamp-3">
                {item.description}
              </p>

              {/* Specifications preview */}
              <div className="bg-[#F4F7FA] p-3 rounded-[10px] border border-[#E2E8F0] space-y-1 text-[14px]">
                {item.specifications.slice(0, 2).map((spec, i) => (
                  <div key={i} className="flex justify-between gap-2">
                    <span className="text-[#475569]">{spec.label}:</span>
                    <span className="font-medium text-[#0F172A] text-right truncate">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#F4F7FA] border-t border-[#E2E8F0] flex items-center justify-between text-[14px]">
              <Link
                to={`/equipamentos/${item.category}/${item.slug}`}
                onClick={() => track('equipment_open', { equipment: item.slug })}
                className="font-semibold text-[#0284C7] hover:text-[#0EA5E9] flex items-center gap-1"
              >
                <span>Ficha técnica & assistência</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
