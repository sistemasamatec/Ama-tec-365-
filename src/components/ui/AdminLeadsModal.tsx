import React, { useState, useEffect } from 'react';
import { X, Database, Download, Phone, MessageSquare, Search, Filter, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { db } from '../../lib/database';
import { AssistanceRequest } from '../../types';
import { buildWhatsAppLink } from '../../lib/whatsapp';

interface AdminLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLeadsModal: React.FC<AdminLeadsModalProps> = ({ isOpen, onClose }) => {
  const [leads, setLeads] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<AssistanceRequest | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await db.getAllLeads();
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLeads = leads.filter((item) => {
    const matchesStatus = filterStatus === 'todos' || item.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.phone.toLowerCase().includes(query) ||
      item.equipment.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.problemDescription.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (id: string, newStatus: AssistanceRequest['status']) => {
    await db.updateLeadStatus(id, newStatus);
    await loadData();
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja eliminar este registo de pedido da base de dados?')) {
      await db.deleteLead(id);
      await loadData();
      if (selectedLead?.id === id) {
        setSelectedLead(null);
      }
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['ID', 'Data', 'Nome', 'Telefone', 'Email', 'Equipamento', 'Categoria', 'Localizacao', 'Problema', 'Estado', 'UTM_Source'];
    const rows = leads.map((l) => [
      l.id,
      l.createdAt,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email || ''}"`,
      `"${l.equipment.replace(/"/g, '""')}"`,
      `"${l.serviceCategory}"`,
      `"${l.location.replace(/"/g, '""')}"`,
      `"${l.problemDescription.replace(/"/g, '""')}"`,
      l.status,
      `"${l.utmSource || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `amatec_pedidos_assistencia_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-bold flex items-center gap-2">
                <span>Ama Tec — Base de Dados de Pedidos de Assistência</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-800 text-sky-300">
                  {leads.length} {leads.length === 1 ? 'registo' : 'registos'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Armazenamento local e persistente dos pedidos recebidos via formulário do site.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={leads.length === 0}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Fechar gestor de pedidos"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por cliente, telefone, equipamento, local..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-500 flex items-center gap-1 text-[11px] uppercase font-semibold">
              <Filter className="w-3 h-3" /> Estado:
            </span>
            {['todos', 'Pendente', 'Em contacto', 'Em diagnóstico', 'Concluído'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize text-xs transition-colors ${
                  filterStatus === status
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body: Split view (List & Details) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Leads Table / List */}
          <div className="md:col-span-7 lg:col-span-7 overflow-y-auto p-4 border-r border-slate-200 space-y-2">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">A carregar base de dados...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <Database className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-medium">Nenhum pedido de assistência encontrado.</p>
                <p className="text-xs text-slate-400">
                  Os pedidos submetidos através dos formulários do site serão guardados aqui de imediato.
                </p>
              </div>
            ) : (
              filteredLeads.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedLead(item)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedLead?.id === item.id
                      ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{item.name}</span>
                      <span className="text-slate-500 text-[11px]">
                        {new Date(item.createdAt).toLocaleString('pt-PT')} · {item.location}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        item.status === 'Pendente'
                          ? 'bg-amber-100 text-amber-800'
                          : item.status === 'Em contacto'
                          ? 'bg-sky-100 text-sky-800'
                          : item.status === 'Em diagnóstico'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium truncate mb-1">
                    Equipamento: <span className="text-sky-700">{item.equipment}</span>
                  </p>
                  <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
                    {item.problemDescription}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Details Panel */}
          <div className="md:col-span-5 lg:col-span-5 bg-slate-50/60 p-5 overflow-y-auto">
            {selectedLead ? (
              <div className="space-y-5 text-xs">
                <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{selectedLead.name}</h3>
                    <p className="text-slate-500 text-xs">ID: {selectedLead.id}</p>
                    <p className="text-slate-500 text-xs">
                      Data: {new Date(selectedLead.createdAt).toLocaleString('pt-PT')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedLead.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar pedido"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Direct Action Contacts */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Ligar</span>
                  </a>
                  <a
                    href={buildWhatsAppLink(
                      `Olá ${selectedLead.name}! Contactamos da Ama Tec referente ao seu pedido de assistência para o equipamento ${selectedLead.equipment}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {/* Detailed Fields */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Telefone
                    </span>
                    <span className="font-semibold text-slate-800">{selectedLead.phone}</span>
                  </div>

                  {selectedLead.email && (
                    <div>
                      <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                        Email
                      </span>
                      <span className="text-slate-700">{selectedLead.email}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Localização em Luanda
                    </span>
                    <span className="text-slate-700">{selectedLead.location}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Aparelho & Categoria
                    </span>
                    <span className="font-semibold text-sky-700">{selectedLead.equipment}</span>
                    <span className="text-slate-400 block text-[11px]">({selectedLead.serviceCategory})</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Descrição da Avaria
                    </span>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {selectedLead.problemDescription}
                    </p>
                  </div>

                  {selectedLead.message && (
                    <div>
                      <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                        Mensagem Adicional
                      </span>
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {selectedLead.message}
                      </p>
                    </div>
                  )}

                  {selectedLead.utmSource && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span className="font-medium">Origem do Anúncio (UTM):</span> {selectedLead.utmSource}{' '}
                      {selectedLead.utmCampaign && `· Campanha: ${selectedLead.utmCampaign}`}
                    </div>
                  )}
                </div>

                {/* Status Update Control */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
                    Atualizar Estado Operacional
                  </label>
                  <select
                    value={selectedLead.status}
                    onChange={(e) =>
                      handleStatusChange(selectedLead.id, e.target.value as AssistanceRequest['status'])
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Pendente">Pendente (Aguardando primeiro contacto)</option>
                    <option value="Em contacto">Em contacto (Conversação iniciada)</option>
                    <option value="Em diagnóstico">Em diagnóstico (Aparelho na bancada)</option>
                    <option value="Concluído">Concluído (Reparação efetuada e entregue)</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-6 text-slate-400 text-xs">
                Selecione um pedido na lista para visualizar todos os detalhes de contacto e histórico técnico.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
