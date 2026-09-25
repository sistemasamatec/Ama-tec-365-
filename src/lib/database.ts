import { AssistanceRequest } from '../types';

const DB_NAME = 'amatec_database_v1';
const STORE_LEADS = 'assistance_leads';
const DB_VERSION = 1;

/**
 * Interface com a Base de Dados da Ama Tec.
 * Fonte primária: Armazenamento persistente no servidor (/api/leads e /api/lead).
 * Fonte secundária: IndexedDB / LocalStorage para suporte offline e resiliência.
 * Garante que todos os pedidos de assistência dos clientes ficam armazenados de forma centralizada
 * e acessível por toda a equipa técnica em qualquer dispositivo.
 */
class AmaTecDatabase {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase | null> | null = null;

  private async openDB(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return null;
    }

    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_LEADS)) {
            const store = db.createObjectStore(STORE_LEADS, { keyPath: 'id' });
            store.createIndex('createdAt', 'createdAt', { unique: false });
            store.createIndex('status', 'status', { unique: false });
          }
        };

        request.onsuccess = () => {
          this.db = request.result;
          resolve(this.db);
        };

        request.onerror = (err) => {
          console.warn('Erro ao abrir IndexedDB da Ama Tec, recorrendo a fallback:', err);
          resolve(null);
        };
      } catch (err) {
        console.warn('Exceção ao inicializar base de dados:', err);
        resolve(null);
      }
    });

    return this.initPromise;
  }

  /**
   * Grava um novo pedido de assistência técnica na base de dados do servidor
   */
  async saveLead(lead: Omit<AssistanceRequest, 'id' | 'createdAt' | 'status'> & { id?: string; createdAt?: string }): Promise<AssistanceRequest> {
    const fullLead: AssistanceRequest = {
      id: lead.id || `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: lead.createdAt || new Date().toISOString(),
      name: lead.name.trim(),
      phone: lead.phone.trim(),
      email: lead.email?.trim() || '',
      equipment: lead.equipment.trim(),
      serviceCategory: lead.serviceCategory || 'domestico',
      problemDescription: lead.problemDescription.trim(),
      location: lead.location.trim(),
      message: lead.message?.trim() || '',
      utmSource: lead.utmSource || '',
      utmMedium: lead.utmMedium || '',
      utmCampaign: lead.utmCampaign || '',
      utmTerm: lead.utmTerm || '',
      utmContent: lead.utmContent || '',
      status: 'Pendente',
    };

    // 1. Guardar no servidor via API REST persistente
    try {
      if (typeof window !== 'undefined') {
        const response = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...fullLead,
            leadId: fullLead.id,
          }),
        });
        if (response.ok) {
          const result = await response.json();
          if (result.leadId) {
            fullLead.id = result.leadId;
          }
        }
      }
    } catch (err) {
      console.warn('[Ama Tec DB] Servidor indisponível no momento, gravando cópia local resiliente:', err);
    }

    // 2. Cache local em IndexedDB para resiliência offline
    try {
      const db = await this.openDB();
      if (db) {
        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction([STORE_LEADS], 'readwrite');
          const store = transaction.objectStore(STORE_LEADS);
          const req = store.put(fullLead);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      }
    } catch (e) {
      console.warn('Falha ao escrever em IndexedDB:', e);
    }

    // 3. Fallback espelho no LocalStorage
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('amatec_leads_backup');
        const list: AssistanceRequest[] = stored ? JSON.parse(stored) : [];
        list.unshift(fullLead);
        localStorage.setItem('amatec_leads_backup', JSON.stringify(list.slice(0, 100)));
      }
    } catch {
      // LocalStorage quota handling
    }

    return fullLead;
  }

  /**
   * Recupera todos os pedidos de assistência gravados no servidor central
   */
  async getAllLeads(): Promise<AssistanceRequest[]> {
    // 1. Tentar ler da base de dados central no servidor
    try {
      if (typeof window !== 'undefined') {
        const response = await fetch('/api/leads');
        if (response.ok) {
          const serverLeads: AssistanceRequest[] = await response.json();
          if (Array.isArray(serverLeads) && serverLeads.length > 0) {
            // Atualizar cache local
            try {
              localStorage.setItem('amatec_leads_backup', JSON.stringify(serverLeads));
            } catch {
              // Ignore
            }
            return serverLeads;
          }
        }
      }
    } catch (err) {
      console.warn('[Ama Tec DB] Não foi possível consultar o servidor central, usando cópia offline:', err);
    }

    // 2. Fallback para IndexedDB
    try {
      const db = await this.openDB();
      if (db) {
        const results = await new Promise<AssistanceRequest[]>((resolve) => {
          const transaction = db.transaction([STORE_LEADS], 'readonly');
          const store = transaction.objectStore(STORE_LEADS);
          const req = store.getAll();
          req.onsuccess = () => {
            const list: AssistanceRequest[] = req.result || [];
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            resolve(list);
          };
          req.onerror = () => resolve([]);
        });
        if (results.length > 0) return results;
      }
    } catch {
      // Fallback
    }

    // 3. Fallback para LocalStorage
    return this.getFallbackLeads();
  }

  private getFallbackLeads(): AssistanceRequest[] {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('amatec_leads_backup');
        return stored ? JSON.parse(stored) : [];
      }
    } catch {
      // Ignorar erro
    }
    return [];
  }

  /**
   * Atualiza o estado de um pedido no servidor central e na cache local
   */
  async updateLeadStatus(id: string, status: AssistanceRequest['status'], notes?: string): Promise<boolean> {
    let serverUpdated = false;

    // 1. Atualizar no servidor central
    try {
      if (typeof window !== 'undefined') {
        const response = await fetch('/api/leads', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status, notes }),
        });
        if (response.ok) {
          serverUpdated = true;
        }
      }
    } catch (err) {
      console.warn('[Ama Tec DB] Erro de rede ao atualizar status no servidor:', err);
    }

    // 2. Atualizar cópia local
    const leads = await this.getAllLeads();
    const target = leads.find((l) => l.id === id);
    if (target) {
      target.status = status;
      if (notes !== undefined) {
        target.notes = notes;
      }

      try {
        const db = await this.openDB();
        if (db) {
          await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction([STORE_LEADS], 'readwrite');
            const store = transaction.objectStore(STORE_LEADS);
            const req = store.put(target);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
          });
        }
      } catch {
        // Ignore
      }

      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('amatec_leads_backup', JSON.stringify(leads));
        }
      } catch {
        // Ignore
      }
    }

    return serverUpdated || Boolean(target);
  }

  /**
   * Elimina um registo da base de dados do servidor e da cache local
   */
  async deleteLead(id: string): Promise<boolean> {
    let serverDeleted = false;

    // 1. Eliminar no servidor central
    try {
      if (typeof window !== 'undefined') {
        const response = await fetch('/api/leads', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (response.ok) {
          serverDeleted = true;
        }
      }
    } catch (err) {
      console.warn('[Ama Tec DB] Erro ao eliminar lead no servidor:', err);
    }

    // 2. Eliminar da cache local
    try {
      const db = await this.openDB();
      if (db) {
        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction([STORE_LEADS], 'readwrite');
          const store = transaction.objectStore(STORE_LEADS);
          const req = store.delete(id);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      }
    } catch {
      // Ignore
    }

    try {
      if (typeof window !== 'undefined') {
        const leads = this.getFallbackLeads().filter((l) => l.id !== id);
        localStorage.setItem('amatec_leads_backup', JSON.stringify(leads));
      }
    } catch {
      // Ignore
    }

    return serverDeleted;
  }
}

export const db = new AmaTecDatabase();
