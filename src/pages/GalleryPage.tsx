import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, ChevronLeft, ChevronRight, Image as ImageIcon, Camera, Wrench } from 'lucide-react';
import { GALLERY_CATEGORIES, GALLERY_ITEMS } from '../content/gallery';
import { GalleryItem } from '../types';
import { updateDocumentSeo } from '../lib/seo';
import { TodoNotice } from '../components/ui/TodoNotice';
import { track } from '../lib/analytics';

export const GalleryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('categoria') || 'todas';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    updateDocumentSeo({
      title: 'Galeria de Intervenções Técnicas | Ama Tec Luanda',
      description:
        'Registo fotográfico de reparações efetuadas pela Ama Tec em Luanda: televisores, máquinas de lavar, placas eletrónicas e cozinhas industriais.',
      canonicalPath: '/galeria',
    });
  }, []);

  const handleCategorySelect = (category: string) => {
    if (category === 'todas') {
      searchParams.delete('categoria');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ categoria: category });
    }
    track('filter', { type: 'gallery_category', value: category });
  };

  const filteredItems = GALLERY_ITEMS.filter((item) => {
    const matchesCategory =
      currentCategory === 'todas' || item.category === currentCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.equipment.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') {
        setActiveLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % filteredItems.length : 0
        );
      } else if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, filteredItems.length]);

  const activeItem: GalleryItem | null =
    activeLightboxIndex !== null && filteredItems[activeLightboxIndex]
      ? filteredItems[activeLightboxIndex]
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
          Bancadas & Intervenções
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Galeria de Trabalhos Ama Tec
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Transparência técnica: visualização de reparações reais executadas na nossa oficina. Em cumprimento com as regras deontológicas da empresa, não exibimos fotografias de arquivo não realizadas pela nossa equipa.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
        {/* Search Input */}
        <div className="relative max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar intervenção por equipamento ou componente..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
          <button
            type="button"
            onClick={() => handleCategorySelect('todas')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              currentCategory === 'todas'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Todas ({GALLERY_ITEMS.length})
          </button>
          {GALLERY_CATEGORIES.map((cat) => {
            const count = GALLERY_ITEMS.filter((g) => g.category === cat).length;
            const isSelected = currentCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <Camera className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            Nenhuma intervenção encontrada nesta categoria
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            A equipa da Ama Tec carrega novos registos reais à medida que as reparações são concluídas.
          </p>
          <button
            onClick={() => handleCategorySelect('todas')}
            className="text-xs font-semibold text-sky-600 hover:underline"
          >
            Ver todas as categorias
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setActiveLightboxIndex(index)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-sky-600">{item.category}</span>
                  <span className="font-mono text-[11px]">Bancada Ama Tec</span>
                </div>

                {/* Photo box with compliance notice */}
                <div className="bg-slate-100 rounded-xl p-4 flex flex-col items-center justify-center min-h-[160px] text-center border border-dashed border-slate-300 group-hover:border-sky-300 transition-colors">
                  <Camera className="w-8 h-8 text-slate-400 mb-2 group-hover:text-sky-500 transition-colors" />
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                    TODO_CONTEUDO
                  </span>
                  <span className="text-xs text-slate-600 max-w-xs">
                    {item.photoUrl}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Equipamento: {item.equipment}</span>
                <span className="font-semibold text-sky-600 group-hover:underline">
                  Ver detalhes &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accessible Lightbox Modal */}
      {activeItem && activeLightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setActiveLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
            aria-label="Fechar visualização"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev button */}
          <button
            type="button"
            onClick={() =>
              setActiveLightboxIndex((activeLightboxIndex - 1 + filteredItems.length) % filteredItems.length)
            }
            className="absolute left-4 p-2 text-slate-300 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors hidden sm:block"
            aria-label="Fotografia anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next button */}
          <button
            type="button"
            onClick={() =>
              setActiveLightboxIndex((activeLightboxIndex + 1) % filteredItems.length)
            }
            className="absolute right-4 p-2 text-slate-300 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors hidden sm:block"
            aria-label="Próxima fotografia"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Modal Container */}
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-3">
              <span className="font-bold text-sky-600 uppercase tracking-wider">{activeItem.category}</span>
              <span>{activeLightboxIndex + 1} de {filteredItems.length}</span>
            </div>

            <div className="bg-slate-50 border border-dashed border-amber-300 rounded-xl p-6 text-center space-y-2">
              <Camera className="w-10 h-10 text-amber-600 mx-auto" />
              <TodoNotice label={activeItem.photoUrl} type="photo" />
              <p className="text-xs text-slate-500">
                A foto real correspondente a esta reparação na oficina da Ama Tec será associada em atualização de conteúdo.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">{activeItem.title}</h2>
              <p className="text-xs font-semibold text-slate-500">
                Aparelho: <span className="text-slate-800">{activeItem.equipment}</span>
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeItem.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/solicitar-assistencia"
                onClick={() => setActiveLightboxIndex(null)}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
              >
                Solicitar Assistência Semelhante
              </Link>
              <button
                type="button"
                onClick={() => setActiveLightboxIndex(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
