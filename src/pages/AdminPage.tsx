import React, { useState, useEffect, useId } from 'react';
import {
  Shield,
  Lock,
  Mail,
  LogOut,
  Wrench,
  Users,
  Settings,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Archive,
  Download,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Eye,
  Key,
  Clock,
  MapPin,
  Share2,
  Database,
  Search,
  Filter,
  X,
  Palette,
  Check,
  AlertCircle,
} from 'lucide-react';
import { CATEGORIES_CONFIG } from '../content/services';
import { ServiceCategory } from '../types';
import { useSettings } from '../context/SettingsContext';

interface AdminUserSession {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
}

interface ServiceFormData {
  id?: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  categoryName: string;
  shortDescription: string;
  fullDescription: string;
  commonProblems: string[];
  solutions: string[];
  coveredEquipment: string[];
  faqs: { question: string; answer: string }[];
  status: 'published' | 'draft' | 'archived';
}

export const AdminPage: React.FC = () => {
  const { settings, refreshSettings } = useSettings();

  // Estado de Autenticação
  const [currentUser, setCurrentUser] = useState<AdminUserSession | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginEmail, setLoginEmail] = useState('josuefranciscojaime@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Tabs do Painel de Administração
  type AdminTab = 'servicos' | 'leads' | 'identidade' | 'empresa' | 'depoimentos' | 'auditoria';
  const [activeTab, setActiveTab] = useState<AdminTab>('servicos');

  // Notificações e Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- DADOS DO PAINEL ---
  // 1. Serviços
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('todas');
  const [editingService, setEditingService] = useState<ServiceFormData | null>(null);
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [previewService, setPreviewService] = useState<ServiceFormData | null>(null);
  const [originalSlugBeforeEdit, setOriginalSlugBeforeEdit] = useState('');

  // 2. Leads (Pedidos)
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadStatusFilter, setLeadStatusFilter] = useState('todos');
  const [leadSearch, setLeadSearch] = useState('');
  const [selectedLeadForNotes, setSelectedLeadForNotes] = useState<any | null>(null);
  const [leadNotesText, setLeadNotesText] = useState('');

  // 3. Depoimentos
  const [testimonialsList, setTestimonialsList] = useState<any[]>([]);
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    location: 'Luanda',
    equipment: '',
    text: '',
    rating: 5,
  });

  // 4. Configurações Locais
  const [localSettings, setLocalSettings] = useState(settings);
  const [savingSettings, setSavingSettings] = useState(false);

  // 5. Auditoria & Backups
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [backupsList, setBackupsList] = useState<any[]>([]);

  // 6. Alteração de Palavra-passe
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ID seguro para formulário
  const emailInputId = useId();
  const passwordInputId = useId();

  // Sincronizar configurações locais quando chegarem do context
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Verificar sessão ao carregar a página
  const checkCurrentSession = async () => {
    try {
      setCheckingAuth(true);
      const res = await fetch('/api/admin/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkCurrentSession();
  }, []);

  // Carregar dados quando autenticado
  useEffect(() => {
    if (currentUser) {
      loadServices();
      loadLeads();
      loadTestimonials();
      loadAuditLogs();
      loadBackups();
    }
  }, [currentUser]);

  // --- REQUISIÇÕES DA API ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentUser(data.user);
        showToast('Sessão iniciada com sucesso. Bem-vindo ao painel!', 'success');
      } else {
        setLoginError(data.error || 'Credenciais de acesso incorretas.');
      }
    } catch {
      setLoginError('Erro de conexão ao servidor. Tente novamente.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      setCurrentUser(null);
      showToast('Sessão terminada.', 'success');
    }
  };

  const loadServices = async () => {
    try {
      setServicesLoading(true);
      const res = await fetch('/api/admin/services');
      if (res.ok) {
        const data = await res.json();
        setServicesList(data);
      }
    } catch {
      showToast('Falha ao carregar lista de serviços.', 'error');
    } finally {
      setServicesLoading(false);
    }
  };

  const loadLeads = async () => {
    try {
      setLeadsLoading(true);
      const res = await fetch('/api/admin/leads');
      if (res.ok) {
        const data = await res.json();
        setLeadsList(data);
      }
    } catch {
      showToast('Falha ao carregar pedidos.', 'error');
    } finally {
      setLeadsLoading(false);
    }
  };

  const loadTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/testimonials');
      if (res.ok) {
        const data = await res.json();
        setTestimonialsList(data);
      }
    } catch {
      // Ignore
    }
  };

  const loadAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch {
      // Ignore
    }
  };

  const loadBackups = async () => {
    try {
      const res = await fetch('/api/admin/backups');
      if (res.ok) {
        const data = await res.json();
        setBackupsList(data);
      }
    } catch {
      // Ignore
    }
  };

  // --- CRUD SERVIÇOS ---
  const handleSaveService = async (serviceData: ServiceFormData) => {
    try {
      const isEdit = Boolean(serviceData.id);
      const url = isEdit ? `/api/admin/services/${serviceData.id}` : '/api/admin/services';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData),
      });

      if (res.ok) {
        showToast(isEdit ? 'Serviço atualizado com sucesso!' : 'Serviço criado com sucesso!', 'success');
        setEditingService(null);
        setIsNewServiceModalOpen(false);
        loadServices();
        refreshSettings();
      } else {
        const err = await res.json();
        showToast(err.error || 'Erro ao gravar serviço.', 'error');
      }
    } catch {
      showToast('Erro de rede ao gravar serviço.', 'error');
    }
  };

  const handleArchiveService = async (id: string, name: string) => {
    if (!window.confirm(`Tem a certeza que deseja arquivar o serviço "${name}"? Ele deixará de estar visível para os clientes.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/services/${id}?action=archive`, { method: 'PATCH' });
      if (res.ok) {
        showToast(`Serviço "${name}" arquivado com sucesso.`, 'success');
        loadServices();
      }
    } catch {
      showToast('Erro ao arquivar serviço.', 'error');
    }
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (!window.confirm(`ATENÇÃO: Deseja apagar definitivamente o serviço "${name}" da base de dados? Esta ação não pode ser desfeita.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Serviço "${name}" eliminado.`, 'success');
        loadServices();
      }
    } catch {
      showToast('Erro ao eliminar serviço.', 'error');
    }
  };

  // --- GESTÃO DE LEADS ---
  const handleUpdateLeadStatus = async (id: string, status: string, notes?: string) => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        showToast('Estado do pedido atualizado!', 'success');
        loadLeads();
        if (selectedLeadForNotes && selectedLeadForNotes.id === id) {
          setSelectedLeadForNotes(null);
        }
      }
    } catch {
      showToast('Erro ao atualizar estado.', 'error');
    }
  };

  const handleSendWhatsAppStatusToClient = (lead: any) => {
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('244') ? cleanPhone : `244${cleanPhone}`;
    const text = encodeURIComponent(
      `Olá ${lead.name}, informamos que o seu pedido de assistência técnica para "${lead.equipment}" na oficina Ama Tec (Golf 2) encontra-se atualmente: *${lead.status}*.\n\nQualquer dúvida adicional estamos ao seu dispor!`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
  };

  // --- LOGO UPLOAD & REVERT ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/svg+xml', 'image/png'].includes(file.type)) {
      showToast('Apenas ficheiros SVG ou PNG são permitidos.', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('O ficheiro é demasiado grande (máximo 2MB).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch('/api/admin/upload-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: base64,
            mimeType: file.type,
            fileName: file.name,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          showToast('Novo logotipo carregado com sucesso!', 'success');
          await refreshSettings();
        } else {
          const err = await res.json();
          showToast(err.error || 'Erro ao carregar logotipo.', 'error');
        }
      } catch {
        showToast('Erro de rede ao carregar imagem.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRevertLogo = async (targetUrl: string) => {
    if (!window.confirm('Deseja restaurar este logotipo anterior?')) return;
    try {
      const res = await fetch('/api/admin/revert-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl }),
      });
      if (res.ok) {
        showToast('Logotipo anterior restaurado!', 'success');
        await refreshSettings();
      }
    } catch {
      showToast('Erro ao restaurar logotipo.', 'error');
    }
  };

  // --- GRAVAR CONFIGURAÇÕES GERAIS ---
  const handleSaveGeneralSettings = async () => {
    try {
      setSavingSettings(true);
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localSettings),
      });

      if (res.ok) {
        showToast('Configurações gravadas com sucesso na base de dados!', 'success');
        await refreshSettings();
      } else {
        showToast('Erro ao gravar configurações.', 'error');
      }
    } catch {
      showToast('Erro de rede ao gravar configurações.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // --- DEPOIMENTOS CRUD ---
  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.name || !newTestimonial.text) {
      showToast('Nome e texto do depoimento são obrigatórios.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTestimonial),
      });
      if (res.ok) {
        showToast('Depoimento real adicionado com sucesso! Secção ativa no site.', 'success');
        setNewTestimonial({ name: '', location: 'Luanda', equipment: '', text: '', rating: 5 });
        loadTestimonials();
      }
    } catch {
      showToast('Erro ao gravar depoimento.', 'error');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm('Deseja apagar este depoimento?')) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Depoimento removido.', 'success');
        loadTestimonials();
      }
    } catch {
      showToast('Erro ao remover depoimento.', 'error');
    }
  };

  // --- BACKUP MANUAL ---
  const handleCreateBackup = async () => {
    try {
      const res = await fetch('/api/admin/backups', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`Cópia de segurança criada com sucesso (${data.filename})!`, 'success');
        loadBackups();
      }
    } catch {
      showToast('Erro ao gerar cópia de segurança.', 'error');
    }
  };

  // --- ALTERAR PALAVRA-PASSE ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('A confirmação da palavra-passe não coincide.');
      return;
    }
    if (newPasswordInput.length < 8) {
      setPasswordError('A nova palavra-passe deve conter pelo menos 8 caracteres.');
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPasswordInput,
          newPassword: newPasswordInput,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Palavra-passe alterada com sucesso!', 'success');
        setIsPasswordModalOpen(false);
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
      } else {
        setPasswordError(data.error || 'Erro ao alterar palavra-passe.');
      }
    } catch {
      setPasswordError('Erro de rede.');
    }
  };

  // ----------------------------------------------------
  // RENDER: LOADING INICIAL DA SESSÃO
  // ----------------------------------------------------
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">A verificar autenticação segura...</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: TELA DE LOGIN (SE NÃO AUTENTICADO)
  // ----------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-600/10 border border-sky-500/20 text-sky-400 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Área de Administração
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Acesso restrito à gestão técnica da <span className="text-white font-medium">Ama Tec</span> (Golf 2, Luanda)
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-xl">
            {loginError && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor={emailInputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Email de Administrador
                </label>
                <div className="mt-1.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id={emailInputId}
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all placeholder:text-slate-600"
                    placeholder="josuefranciscojaime@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={passwordInputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Palavra-passe
                </label>
                <div className="mt-1.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id={passwordInputId}
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all placeholder:text-slate-600"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 text-xs"
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Protegido com cifra PBKDF2 e bloqueio contra força bruta</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full mt-2 flex items-center justify-center py-2.5 px-4 rounded-xl shadow-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-all duration-150 disabled:opacity-50 cursor-pointer"
              >
                {loginLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    A verificar credenciais...
                  </span>
                ) : (
                  'Entrar no Painel de Controlo'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800 text-center">
              <a
                href="/"
                className="text-xs text-slate-400 hover:text-sky-400 transition-colors inline-flex items-center gap-1"
              >
                &larr; Voltar à página pública do site
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: PAINEL DE ADMINISTRAÇÃO AUTENTICADO
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold transition-all border animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/50'
              : 'bg-red-950/90 text-red-200 border-red-700/50'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-sky-600/20 text-sky-400 font-bold border border-sky-500/30">
                AT
              </span>
              <div>
                <h1 className="text-sm font-bold text-white flex items-center gap-2">
                  Ama Tec — Painel de Controlo
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Base de Dados Ativa
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                  Sessão iniciada como: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.email})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Site Público</span>
              </a>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                title="Alterar Palavra-passe"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Segurança</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-medium border border-red-800/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto pb-2 scrollbar-none text-xs font-medium border-t border-slate-900 pt-2">
            {[
              { id: 'servicos', label: '1. Gestão de Serviços (CRUD)', icon: Wrench, count: servicesList.length },
              { id: 'leads', label: '2. Pedidos & Leads', icon: Users, count: leadsList.length },
              { id: 'identidade', label: '3. Logotipo & Visual', icon: Palette },
              { id: 'empresa', label: '4. Redes, Horário & Mapa', icon: MapPin },
              { id: 'depoimentos', label: '5. Depoimentos Reais', icon: MessageSquare, count: testimonialsList.length },
              { id: 'auditoria', label: '6. Auditoria & Backups', icon: Database },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive ? 'bg-sky-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* =========================================================================
            TAB 1: GESTÃO DE SERVIÇOS (CRUD)
        ========================================================================= */}
        {activeTab === 'servicos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-sky-400" />
                  Catálogo de Serviços Oficiais
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Crie, edite, publique ou arquive serviços diretamente na base de dados persistente. Sem tocar no código.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingService({
                    name: '',
                    slug: '',
                    category: 'domestico',
                    categoryName: 'Linha Doméstica',
                    shortDescription: '',
                    fullDescription: '',
                    commonProblems: [''],
                    solutions: [''],
                    coveredEquipment: [''],
                    faqs: [{ question: '', answer: '' }],
                    status: 'published',
                  });
                  setOriginalSlugBeforeEdit('');
                  setIsNewServiceModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Novo Serviço</span>
              </button>
            </div>

            {/* Filtros e Pesquisa */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Pesquisar serviço..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400">Categoria:</span>
                <select
                  value={serviceCategoryFilter}
                  onChange={(e) => setServiceCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="todas">Todas as Categorias</option>
                  {CATEGORIES_CONFIG.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lista de Serviços */}
            {servicesLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                A carregar serviços da base de dados...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servicesList
                  .filter((s) => {
                    const matchesCategory = serviceCategoryFilter === 'todas' || s.category === serviceCategoryFilter;
                    const matchesSearch =
                      !serviceSearch ||
                      s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                      s.shortDescription.toLowerCase().includes(serviceSearch.toLowerCase());
                    return matchesCategory && matchesSearch;
                  })
                  .map((service) => (
                    <div
                      key={service.id || service.slug}
                      className="bg-slate-950 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 uppercase tracking-wider">
                            {service.categoryName || service.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              service.status === 'published'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : service.status === 'draft'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {service.status === 'published' ? 'Publicado' : service.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white leading-snug">{service.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{service.shortDescription}</p>

                        <div className="text-[11px] font-mono text-slate-500 truncate">
                          /servicos/{service.slug}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`/servicos/${service.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Ver página pública"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingService(service);
                              setOriginalSlugBeforeEdit(service.slug);
                              setIsNewServiceModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900 text-sky-400 transition-colors cursor-pointer"
                            title="Editar serviço"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {service.status !== 'archived' && (
                            <button
                              type="button"
                              onClick={() => handleArchiveService(service.id, service.name)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                              title="Arquivar serviço (oculta sem apagar)"
                            >
                              Arquivar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteService(service.id, service.name)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors cursor-pointer"
                            title="Eliminar definitivamente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: GESTÃO DE LEADS (PEDIDOS DE CLIENTES)
        ========================================================================= */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  Pedidos de Assistência Recebidos (Leads)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Base de dados centralizada no servidor. Todos os pedidos são gravados com integridade e registo de auditoria.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/api/admin/leads/export-csv"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Exportar CSV (Excel)</span>
                </a>
                <button
                  type="button"
                  onClick={loadLeads}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="Atualizar lista"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filtros de Leads */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Pesquisar por cliente, telefone ou aparelho..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400">Estado:</span>
                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="todos">Todos os Estados</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Contactado">Contactado</option>
                  <option value="Em Diagnóstico">Em Diagnóstico</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            {/* Tabela de Leads */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Data / ID</th>
                      <th className="py-3 px-4">Cliente / Contacto</th>
                      <th className="py-3 px-4">Equipamento & Problema</th>
                      <th className="py-3 px-4">Localização</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Ações Técnicas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {leadsList
                      .filter((l) => {
                        const matchesStatus = leadStatusFilter === 'todos' || l.status === leadStatusFilter;
                        const matchesSearch =
                          !leadSearch ||
                          l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
                          l.phone.includes(leadSearch) ||
                          l.equipment.toLowerCase().includes(leadSearch.toLowerCase());
                        return matchesStatus && matchesSearch;
                      })
                      .map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <div className="font-semibold text-white">
                              {new Date(lead.createdAt).toLocaleDateString('pt-PT')}
                            </div>
                            <div className="text-slate-500 text-[10px]">{lead.id}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{lead.name}</div>
                            <a
                              href={`tel:${lead.phone}`}
                              className="text-sky-400 hover:underline font-mono text-[11px]"
                            >
                              {lead.phone}
                            </a>
                            {lead.email && <div className="text-slate-500 text-[10px] truncate max-w-[140px]">{lead.email}</div>}
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-medium text-slate-200">{lead.equipment}</div>
                            <div className="text-slate-400 text-[11px] line-clamp-2 mt-0.5">{lead.problemDescription}</div>
                            {lead.notes && (
                              <div className="mt-1 text-[10px] text-amber-400 bg-amber-500/10 p-1 rounded border border-amber-500/20">
                                <strong>Nota Técnica:</strong> {lead.notes}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {lead.location || 'Golf 2 / Luanda'}
                          </td>

                          <td className="py-3.5 px-4">
                            <select
                              value={lead.status}
                              onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                              className={`text-[11px] font-semibold rounded-lg px-2.5 py-1.5 border focus:outline-none cursor-pointer ${
                                lead.status === 'Pendente'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : lead.status === 'Contactado'
                                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                  : lead.status === 'Em Diagnóstico'
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                  : lead.status === 'Concluído'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              <option value="Pendente">Pendente</option>
                              <option value="Contactado">Contactado</option>
                              <option value="Em Diagnóstico">Em Diagnóstico</option>
                              <option value="Concluído">Concluído</option>
                              <option value="Cancelado">Cancelado</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleSendWhatsAppStatusToClient(lead)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/40 text-[11px] font-medium transition-colors cursor-pointer"
                              title="Avisar cliente do estado por WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLeadForNotes(lead);
                                setLeadNotesText(lead.notes || '');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                              title="Adicionar nota técnica interna"
                            >
                              Nota
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: LOGOTIPO & IDENTIDADE VISUAL
        ========================================================================= */}
        {activeTab === 'identidade' && (
          <div className="space-y-8 max-w-4xl">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-sky-400" />
                  Logotipo Oficial e Identidade Visual
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Atualize o logotipo da Ama Tec sem tocar em código. Suporta ficheiros SVG e PNG (máximo 2MB).
                  O sistema preserva histórico completo de versões anteriores para reversão segura.
                </p>
              </div>

              {/* Logotipo Atual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Logotipo em Produção</span>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 max-w-[280px]">
                    <img
                      src={settings.visualIdentity.logoUrl}
                      alt="Logotipo Atual Ama Tec"
                      className="h-12 w-auto max-w-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 break-all">{settings.visualIdentity.logoUrl}</span>
                </div>

                {/* Upload de Novo Logotipo */}
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-center space-y-4">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Carregar Novo Logotipo</span>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-xl cursor-pointer bg-slate-950/60 transition-colors">
                    <ImageIcon className="w-8 h-8 text-sky-400 mb-2" />
                    <span className="text-xs font-semibold text-slate-200">Clique para selecionar ficheiro</span>
                    <span className="text-[11px] text-slate-500 mt-1">SVG ou PNG até 2MB</span>
                    <input
                      type="file"
                      accept=".svg,.png"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Histórico de Logotipos para Reversão */}
              {settings.visualIdentity.logoHistory && settings.visualIdentity.logoHistory.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Histórico de Logotipos (Clique para reverter)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {settings.visualIdentity.logoHistory.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="truncate">
                          <div className="font-mono text-[11px] text-slate-300 truncate">{item.fileName}</div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(item.uploadedAt).toLocaleDateString('pt-PT')}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRevertLogo(item.url)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-sky-600 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          Restaurar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Seletor de Cor Primária da Marca */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-sky-400" />
                Cor Principal da Marca (Destaques e Botões)
              </h3>
              <p className="text-xs text-slate-400">
                Ajuste a tonalidade primária utilizada nos botões de conversão e elementos visuais em todo o website.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                {[
                  { name: 'Sky Ama Tec (Padrão)', hex: '#0284c7' },
                  { name: 'Azul Elétrico', hex: '#2563eb' },
                  { name: 'Ciano Técnico', hex: '#0891b2' },
                  { name: 'Verde Assistência', hex: '#059669' },
                  { name: 'Âmbar Oficina', hex: '#d97706' },
                ].map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => {
                      setLocalSettings({
                        ...localSettings,
                        visualIdentity: { ...localSettings.visualIdentity, brandColor: color.hex },
                      });
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      localSettings.visualIdentity.brandColor === color.hex
                        ? 'border-white bg-white/10 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: color.hex }} />
                    <span>{color.name}</span>
                  </button>
                ))}

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-slate-400">Personalizado:</span>
                  <input
                    type="color"
                    value={localSettings.visualIdentity.brandColor}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        visualIdentity: { ...localSettings.visualIdentity, brandColor: e.target.value },
                      })
                    }
                    className="w-8 h-8 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveGeneralSettings}
                  disabled={savingSettings}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                >
                  {savingSettings ? 'A guardar...' : 'Gravar Cor da Marca'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: REDES SOCIAIS, HORÁRIO E GOOGLE MAPS
        ========================================================================= */}
        {activeTab === 'empresa' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-400" />
                  Dados da Empresa, Redes Sociais e Mapa
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Estes campos são refletidos dinamicamente na página de contactos, no rodapé e nos dados estruturados Schema.org para reforço do SEO local em Luanda.
                </p>
              </div>

              {/* Redes Sociais */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  Redes Sociais Oficiais (Apenas as preenchidas aparecem no site)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Facebook</label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/amatec.ao"
                      value={localSettings.socialLinks.facebook || ''}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          socialLinks: { ...localSettings.socialLinks, facebook: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Instagram</label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/amatec.ao"
                      value={localSettings.socialLinks.instagram || ''}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          socialLinks: { ...localSettings.socialLinks, instagram: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">WhatsApp Business</label>
                    <input
                      type="text"
                      placeholder="+244930372597"
                      value={localSettings.socialLinks.whatsappBusiness || ''}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          socialLinks: { ...localSettings.socialLinks, whatsappBusiness: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">TikTok</label>
                    <input
                      type="url"
                      placeholder="https://tiktok.com/@amatec.ao"
                      value={localSettings.socialLinks.tiktok || ''}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          socialLinks: { ...localSettings.socialLinks, tiktok: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">LinkedIn</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/company/amatec-ao"
                      value={localSettings.socialLinks.linkedin || ''}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          socialLinks: { ...localSettings.socialLinks, linkedin: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">YouTube</label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/@amatecao"
                      value={localSettings.socialLinks.youtube || ''}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          socialLinks: { ...localSettings.socialLinks, youtube: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Google Maps & Coordenadas */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  Google Maps & Localização no Golf 2
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Link Embed do Google Maps (iframe src)</label>
                    <input
                      type="text"
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      value={localSettings.googleMaps.embedUrl || ''}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          googleMaps: { ...localSettings.googleMaps, embedUrl: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Link Direto "Como Chegar" (Google Maps/Waze)</label>
                      <input
                        type="url"
                        placeholder="https://maps.google.com/?q=-8.8893,13.2384"
                        value={localSettings.googleMaps.mapLink || ''}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            googleMaps: { ...localSettings.googleMaps, mapLink: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <label className="block text-slate-300 font-semibold mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={localSettings.googleMaps.coordinates?.lat || -8.8893}
                          onChange={(e) =>
                            setLocalSettings({
                              ...localSettings,
                              googleMaps: {
                                ...localSettings.googleMaps,
                                coordinates: {
                                  lat: parseFloat(e.target.value) || -8.8893,
                                  lng: localSettings.googleMaps.coordinates?.lng || 13.2384,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-slate-300 font-semibold mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={localSettings.googleMaps.coordinates?.lng || 13.2384}
                          onChange={(e) =>
                            setLocalSettings({
                              ...localSettings,
                              googleMaps: {
                                ...localSettings.googleMaps,
                                coordinates: {
                                  lat: localSettings.googleMaps.coordinates?.lat || -8.8893,
                                  lng: parseFloat(e.target.value) || 13.2384,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horário de Funcionamento */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Horário de Funcionamento da Oficina
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Segunda a Sexta-feira</label>
                    <input
                      type="text"
                      value={localSettings.businessHours.weekdays}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          businessHours: { ...localSettings.businessHours, weekdays: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Sábados</label>
                    <input
                      type="text"
                      value={localSettings.businessHours.saturday}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          businessHours: { ...localSettings.businessHours, saturday: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Domingos e Feriados</label>
                    <input
                      type="text"
                      value={localSettings.businessHours.sunday}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          businessHours: { ...localSettings.businessHours, sunday: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Botão Gravar Tudo */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveGeneralSettings}
                  disabled={savingSettings}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg transition-colors cursor-pointer"
                >
                  {savingSettings ? 'A gravar alterações...' : 'Gravar Todas as Configurações'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: DEPOIMENTOS REAIS
        ========================================================================= */}
        {activeTab === 'depoimentos' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  Gestão de Depoimentos Reais de Clientes
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Regra estrita de transparência: A secção de testemunhos no site só fica ativa se existir pelo menos 1 depoimento real verificado pela oficina.
                </p>
              </div>

              {/* Formulário para Adicionar Depoimento */}
              <form onSubmit={handleAddTestimonial} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">Adicionar Depoimento Real</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Nome do Cliente *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Engenheiro Carlos M."
                      value={newTestimonial.name}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Equipamento Reparado *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Smart TV Samsung 55 / Máquina LG"
                      value={newTestimonial.equipment}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, equipment: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Localização</label>
                    <input
                      type="text"
                      placeholder="Ex: Golf 2 / Talatona"
                      value={newTestimonial.location}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, location: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-slate-400 mb-1">Texto do Depoimento Real *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Palavras reais do cliente sobre a qualidade, clareza do orçamento e garantia da Ama Tec..."
                    value={newTestimonial.text}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Gravar e Ativar no Site
                  </button>
                </div>
              </form>

              {/* Lista de Depoimentos Ativos */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Depoimentos Ativos na Base de Dados ({testimonialsList.length})
                </h3>

                {testimonialsList.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                    Ainda não existem depoimentos gravados. Adicione o primeiro acima para ativar a secção na página inicial.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {testimonialsList.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{t.name}</span>
                            <span className="text-[10px] text-amber-400">★★★★★</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {t.equipment} · <span className="text-slate-500">{t.location}</span>
                          </div>
                          <p className="text-slate-300 text-xs italic mt-2">"{t.text}"</p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteTestimonial(t.id)}
                            className="text-red-400 hover:text-red-300 text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: AUDITORIA, BACKUPS E MODO DE MANUTENÇÃO
        ========================================================================= */}
        {activeTab === 'auditoria' && (
          <div className="space-y-6 max-w-4xl">
            {/* Modo de Manutenção */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Modo de Manutenção do Website
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Permite exibir um ecrã institucional informativo para visitantes enquanto a equipa técnica realiza intervenções no painel.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.maintenanceMode?.enabled || false}
                    onChange={(e) => {
                      const updated = {
                        ...localSettings,
                        maintenanceMode: {
                          ...localSettings.maintenanceMode,
                          enabled: e.target.checked,
                        },
                      };
                      setLocalSettings(updated);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {localSettings.maintenanceMode?.enabled && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs text-slate-300 font-semibold">Mensagem para os clientes:</label>
                  <textarea
                    rows={2}
                    value={localSettings.maintenanceMode.message}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        maintenanceMode: {
                          ...localSettings.maintenanceMode,
                          message: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveGeneralSettings}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Gravar Estado de Manutenção
                </button>
              </div>
            </div>

            {/* Cópias de Segurança (Backups) */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-sky-400" />
                    Cópias de Segurança da Base de Dados (Backups)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gere snapshots completos em ficheiro JSON contendo todos os serviços, leads, configurações e histórico.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCreateBackup}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Cópia Agora</span>
                </button>
              </div>

              {/* Lista de Backups */}
              <div className="space-y-2 pt-2">
                {backupsList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Nenhuma cópia gerada ainda.</p>
                ) : (
                  backupsList.map((b) => (
                    <div
                      key={b.filename}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono text-slate-200">{b.filename}</div>
                        <div className="text-[11px] text-slate-500">
                          {new Date(b.createdAt).toLocaleString('pt-PT')} · {(b.sizeBytes / 1024).toFixed(1)} KB
                        </div>
                      </div>

                      <a
                        href={`/api/admin/backups/${b.filename}`}
                        download
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descarregar</span>
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audit Log */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Registo de Auditoria em Tempo Real (Audit Log)
              </h3>
              <p className="text-xs text-slate-400">
                Histórico imutável de quem alterou o quê e quando no painel de administração.
              </p>

              <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-400">{log.action}</span>
                        <span className="text-slate-300 font-medium">{log.target}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Por: <span className="text-slate-400">{log.userEmail}</span> (IP: {log.ip})
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString('pt-PT')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL: CRIAR OU EDITAR SERVIÇO
      ========================================================================= */}
      {isNewServiceModalOpen && editingService && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-400" />
                {editingService.id ? `Editar Serviço: ${editingService.name}` : 'Criar Novo Serviço'}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewServiceModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveService(editingService);
              }}
              className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300"
            >
              {/* Título e Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Título do Serviço *</label>
                  <input
                    type="text"
                    required
                    value={editingService.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const autoSlug = name
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                      setEditingService({
                        ...editingService,
                        name,
                        slug: editingService.id ? editingService.slug : autoSlug,
                      });
                    }}
                    placeholder="Ex: Reparação de Máquinas de Gelo"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Slug URL (/servicos/slug) *</label>
                  <input
                    type="text"
                    required
                    value={editingService.slug}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  {originalSlugBeforeEdit && originalSlugBeforeEdit !== editingService.slug && (
                    <div className="mt-1 text-[11px] text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>Aviso: Mudar o slug de um serviço já publicado afeta URLs de campanhas e SEO!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Categoria e Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoria Técnica</label>
                  <select
                    value={editingService.category}
                    onChange={(e) => {
                      const cat = CATEGORIES_CONFIG.find((c) => c.id === e.target.value);
                      setEditingService({
                        ...editingService,
                        category: e.target.value as ServiceCategory,
                        categoryName: cat?.name || 'Linha Doméstica',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {CATEGORIES_CONFIG.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estado de Publicação</label>
                  <select
                    value={editingService.status}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        status: e.target.value as 'published' | 'draft' | 'archived',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="published">Publicado (Visível no site)</option>
                    <option value="draft">Rascunho (Apenas no painel)</option>
                    <option value="archived">Arquivado</option>
                  </select>
                </div>
              </div>

              {/* Descrições */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Resumo Curto (Apresentado nos cartões) *</label>
                <textarea
                  required
                  rows={2}
                  value={editingService.shortDescription}
                  onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                  placeholder="Diagnóstico detalhado dos circuitos de alimentação e substituição de componentes no Golf 2."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descrição Técnica Completa *</label>
                <textarea
                  required
                  rows={4}
                  value={editingService.fullDescription}
                  onChange={(e) => setEditingService({ ...editingService, fullDescription: e.target.value })}
                  placeholder="Detalhes completos sobre como a equipa da Ama Tec aborda esta reparação em bancada..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Problemas Comuns (1 por linha) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Avarias e Sintomas Comuns (Separe por ponto e vírgula ou quebra de linha)
                </label>
                <textarea
                  rows={3}
                  value={editingService.commonProblems.join('\n')}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      commonProblems: e.target.value.split('\n').filter((l) => l.trim()),
                    })
                  }
                  placeholder="Aparelho não liga&#10;Fumaça ou odor a queimado&#10;Ruído anormal durante o funcionamento"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Soluções Técnicas */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Soluções e Procedimentos Técnicos da Oficina
                </label>
                <textarea
                  rows={3}
                  value={editingService.solutions.join('\n')}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      solutions: e.target.value.split('\n').filter((l) => l.trim()),
                    })
                  }
                  placeholder="Substituição de condensadores e semicondutores&#10;Reparação de fontes comutadas&#10;Teste de isolamento elétrico"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsNewServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg transition-colors cursor-pointer"
                >
                  {editingService.id ? 'Atualizar Serviço' : 'Criar e Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: NOTAS TÉCNICAS DO PEDIDO (LEAD)
      ========================================================================= */}
      {selectedLeadForNotes && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                Nota Técnica: {selectedLeadForNotes.name} ({selectedLeadForNotes.equipment})
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLeadForNotes(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-400">
                Registo interno visível apenas aos técnicos (ex: peças encomendadas, orçamento comunicado, etc.):
              </p>
              <textarea
                rows={4}
                value={leadNotesText}
                onChange={(e) => setLeadNotesText(e.target.value)}
                placeholder="Ex: Cliente autorizou troca de barra LED. Aguarda entrega de peças para teste final."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLeadForNotes(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() =>
                  handleUpdateLeadStatus(selectedLeadForNotes.id, selectedLeadForNotes.status, leadNotesText)
                }
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer"
              >
                Gravar Nota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ALTERAÇÃO DE PALAVRA-PASSE
      ========================================================================= */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Segurança: Alterar Palavra-passe
              </h3>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Palavra-passe Atual</label>
                <input
                  type="password"
                  required
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nova Palavra-passe (Mínimo 8 caracteres)</label>
                <input
                  type="password"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Confirmar Nova Palavra-passe</label>
                <input
                  type="password"
                  required
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Atualizar Palavra-passe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
