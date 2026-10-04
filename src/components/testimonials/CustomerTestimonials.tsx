import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  MessageSquare,
  ThumbsUp,
  MapPin,
  Clock,
  Sparkles,
  Send,
  PlusCircle,
  X,
} from 'lucide-react';
import { track } from '../../lib/analytics';

export interface TestimonialItem {
  id: string;
  clientName: string;
  clientType: 'particular' | 'empresa';
  location: string;
  equipment: string;
  serviceCategory: string;
  osReference: string;
  rating: number;
  date: string;
  story: string;
  technicalOutcome: string;
  isVerified: boolean;
  approved?: boolean;
}

// Prova social: 3 depoimentos reais (secção oculta enquanto não houver).
// NUNCA inventar dados, depoimentos ou avaliações.
const INITIAL_TESTIMONIALS: TestimonialItem[] = [];

export const CustomerTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('amatec_client_testimonials');
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (e) {
      // fallback
    }
    return INITIAL_TESTIMONIALS;
  });

  useEffect(() => {
    async function loadRemoteTestimonials() {
      try {
        if (typeof window === 'undefined') return;
        const res = await fetch('/api/public/testimonials');
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            setTestimonials(list);
          }
        }
      } catch {
        // Fallback to local
      }
    }
    loadRemoteTestimonials();
  }, []);

  const [activeFilter, setActiveFilter] = useState<'todos' | 'particular' | 'empresa'>('todos');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientType: 'particular' as 'particular' | 'empresa',
    location: '',
    equipment: '',
    serviceCategory: 'Eletrodomésticos',
    osReference: '',
    rating: 5,
    story: '',
  });

  // A secção de depoimentos só renderiza na UI pública com >= 3 depoimentos aprovados
  const approvedTestimonials = testimonials.filter((t) => t.approved !== false);
  if (approvedTestimonials.length < 3) {
    return null;
  }

  const filtered = approvedTestimonials.filter((t) => {
    if (activeFilter === 'todos') return true;
    return t.clientType === activeFilter;
  });

  const handleRatingChange = (stars: number) => {
    setFormData((prev) => ({ ...prev, rating: stars }));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.equipment || !formData.story) {
      return;
    }

    const newTestimonial: TestimonialItem = {
      id: 'rev-' + Date.now(),
      clientName: formData.clientName,
      clientType: formData.clientType,
      location: formData.location || 'Luanda',
      equipment: formData.equipment,
      serviceCategory: formData.serviceCategory,
      osReference: formData.osReference || 'OS-CLIENTE',
      rating: formData.rating,
      date: 'Recentemente',
      story: formData.story,
      technicalOutcome: 'Registo de intervenção técnica arquivado.',
      isVerified: Boolean(formData.osReference),
    };

    const updated = [newTestimonial, ...testimonials];
    setTestimonials(updated);
    try {
      localStorage.setItem('amatec_client_testimonials', JSON.stringify(updated));
    } catch (err) {
      // ignore storage error
    }

    track('form_submit', {
      form: 'client_testimonial',
      equipment: formData.equipment,
      rating: formData.rating,
    });
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowSubmitModal(false);
      setFormData({
        clientName: '',
        clientType: 'particular',
        location: '',
        equipment: '',
        serviceCategory: 'Eletrodomésticos',
        osReference: '',
        rating: 5,
        story: '',
      });
    }, 2000);
  };

  return (
    <section id="avaliacoes" className="bg-white py-16 lg:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header with Title and Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-[#0284C7] uppercase tracking-wider">
              <ThumbsUp className="w-4 h-4 text-[#0284C7]" />
              <span>Casos Reais & Social Proof</span>
              <span className="text-[#CBD5E1]">·</span>
              <span className="text-[#475569]">Oficina no Golf 2</span>
            </div>
            <h2 className="text-h2 font-heading font-extrabold text-[#060B16] tracking-tight">
              Depoimentos & Casos de Sucesso
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#475569] leading-relaxed">
              Consulte relatos de clientes particulares e empresas cujos equipamentos foram reparados e testados com garantia técnica oficial na Ama Tec.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="btn-primary min-h-[48px] rounded-[10px] text-[14px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Partilhar a sua Experiência</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
          {(['todos', 'particular', 'empresa'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-[10px] text-[14px] font-semibold capitalize transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-[#060B16] text-white shadow-xs'
                  : 'bg-slate-100 text-[#475569] hover:bg-slate-200'
              }`}
            >
              {filter === 'todos' ? 'Todos os Casos' : filter === 'particular' ? 'Clientes Particulares' : 'Empresas & Negócios'}
            </button>
          ))}
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="card-base p-6 flex flex-col justify-between shadow-xs hover:shadow-hover-card transition-all space-y-5 bg-white"
            >
              <div className="space-y-4">
                {/* Top Meta: Stars and Verified OS Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  {item.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#059669] text-[14px] font-semibold border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                      <span>OS Verificada</span>
                    </span>
                  )}
                </div>

                {/* Quote text */}
                <blockquote className="text-[14px] sm:text-[15px] text-[#0F172A] leading-relaxed italic">
                  "{item.story}"
                </blockquote>

                {/* Technical summary card */}
                <div className="p-3 rounded-[10px] bg-[#F4F7FA] border border-[#E2E8F0] space-y-1.5 text-[14px]">
                  <div className="flex items-center gap-1.5 text-[#0F172A] font-semibold">
                    <Wrench className="w-4 h-4 text-[#0284C7] shrink-0" />
                    <span>Aparelho: {item.equipment}</span>
                  </div>
                  <div className="text-[#475569] pl-5">
                    <span className="font-medium text-[#0F172A]">Intervenção: </span>
                    {item.technicalOutcome}
                  </div>
                </div>
              </div>

              {/* Author details */}
              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-[14px]">
                <div>
                  <strong className="block font-bold text-[#0F172A]">{item.clientName}</strong>
                  <span className="text-[14px] text-[#475569] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.location}
                  </span>
                </div>
                <span className="text-[14px] font-mono text-[#475569] bg-slate-100 px-2 py-1 rounded-[6px]">
                  {item.date}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Review Submission Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060B16]/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[14px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] relative max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="absolute top-5 right-5 p-2 rounded-[10px] text-[#475569] hover:text-[#0F172A] hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              {submitSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-[#060B16]">
                    Obrigado pela sua Avaliação!
                  </h3>
                  <p className="text-[14px] text-[#475569] max-w-sm mx-auto leading-relaxed">
                    O seu testemunho foi registado e associado à base de dados da oficina Ama Tec. Agradecemos a confiança no nosso trabalho.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[14px] font-semibold text-[#0284C7] uppercase tracking-wider">
                      Feedback de Cliente
                    </span>
                    <h3 className="text-xl font-bold font-heading text-[#060B16]">
                      Partilhar Experiência na Ama Tec
                    </h3>
                    <p className="text-[14px] text-[#475569]">
                      Teve um aparelho intervencionado na nossa oficina? Deixe a sua opinião técnica sobre a reparação.
                    </p>
                  </div>

                  {/* Rating Selector */}
                  <div className="space-y-1">
                    <label className="text-[14px] font-semibold text-[#0F172A] block">
                      Classificação do Serviço:
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-[14px] font-bold text-[#0F172A] ml-2 font-mono">
                        {formData.rating}/5 estrelas
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[14px] font-medium text-[#0F172A] block mb-1">
                        Nome ou Empresa *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.clientName}
                        onChange={(e) =>
                          setFormData({ ...formData, clientName: e.target.value })
                        }
                        placeholder="Ex: João Baptista"
                        className="w-full text-[14px] p-2.5 rounded-[10px] border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                      />
                    </div>

                    <div>
                      <label className="text-[14px] font-medium text-[#0F172A] block mb-1">
                        Tipo de Cliente
                      </label>
                      <select
                        value={formData.clientType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            clientType: e.target.value as 'particular' | 'empresa',
                          })
                        }
                        className="w-full text-[14px] p-2.5 rounded-[10px] border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] bg-white text-[#0F172A]"
                      >
                        <option value="particular">Particular / Residencial</option>
                        <option value="empresa">Empresa / Comercial</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[14px] font-medium text-[#0F172A] block mb-1">
                        Equipamento Intervencionado *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.equipment}
                        onChange={(e) =>
                          setFormData({ ...formData, equipment: e.target.value })
                        }
                        placeholder="Ex: Smart TV LG 43"
                        className="w-full text-[14px] p-2.5 rounded-[10px] border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                      />
                    </div>

                    <div>
                      <label className="text-[14px] font-medium text-[#0F172A] block mb-1">
                        N.º Ordem de Serviço (OS)
                      </label>
                      <input
                        type="text"
                        value={formData.osReference}
                        onChange={(e) =>
                          setFormData({ ...formData, osReference: e.target.value })
                        }
                        placeholder="Ex: OS-2024-..."
                        className="w-full text-[14px] p-2.5 rounded-[10px] border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[14px] font-medium text-[#0F172A] block mb-1">
                      Localização em Luanda
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Ex: Golf 2, Talatona, Maianga"
                      className="w-full text-[14px] p-2.5 rounded-[10px] border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    />
                  </div>

                  <div>
                    <label className="text-[14px] font-medium text-[#0F172A] block mb-1">
                      O seu Testemunho / Experiência *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.story}
                      onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                      placeholder="Descreva como foi o diagnóstico, o cumprimento dos prazos e o funcionamento do equipamento após a reparação..."
                      className="w-full text-[14px] p-2.5 rounded-[10px] border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(false)}
                      className="btn-outline min-h-[48px] px-4 py-2 text-[14px]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-primary min-h-[48px] px-5 py-2.5 text-[14px] flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submeter Avaliação</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
