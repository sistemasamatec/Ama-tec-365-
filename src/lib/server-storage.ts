import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { SERVICES } from '../content/services';
import { EQUIPMENT_CATALOG } from '../content/equipment';
import { COMPANY, SOCIAL_LINKS } from '../content/company';
import { ServiceItem, EquipmentItem, GalleryItem, FAQItem } from '../types';

/* =========================================================================
   INTERFACES & MODELOS DE DADOS
========================================================================= */

export interface ServerLead {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  equipment: string;
  serviceCategory?: string;
  problemDescription: string;
  location: string;
  message?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  status: 'Pendente' | 'Contactado' | 'Em Diagnóstico' | 'Concluído' | 'Cancelado';
  notes?: string;
  emailDispatched?: boolean;
  clientIp?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminSession {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  createdAt: string;
  expiresAt: string;
  ip: string;
  userAgent?: string;
}

export interface LoginAttempt {
  identifier: string; // ip ou email
  failedCount: number;
  lastAttemptAt: string;
  lockedUntil?: string;
}

export interface SiteSettings {
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
    logoHistory: { url: string; uploadedAt: string; fileName: string }[];
    brandColor: string; // Hex, ex: #0284c7
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

export interface TestimonialItem {
  id: string;
  name: string;
  location: string;
  equipment: string;
  serviceCategory: string;
  text: string;
  rating: number;
  date: string;
  isRealVerified: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  target: string;
  ip: string;
  details?: Record<string, any>;
}

/* =========================================================================
   DIRETÓRIOS E FICHEIROS PERSISTENTES
========================================================================= */

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'brand', 'uploads');

const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const LEADS_LOG = path.join(DATA_DIR, 'leads.log');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const LOGIN_ATTEMPTS_FILE = path.join(DATA_DIR, 'login-attempts.json');
const SERVICES_FILE = path.join(DATA_DIR, 'services.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const EQUIPMENT_FILE = path.join(DATA_DIR, 'equipment.json');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');
const TESTIMONIALS_FILE = path.join(DATA_DIR, 'testimonials.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit.json');

/* =========================================================================
   UTILITÁRIOS DE SEGURANÇA E ARQUIVO
========================================================================= */

function ensureDirectories(): void {
  for (const dir of [DATA_DIR, BACKUPS_DIR, UPLOADS_DIR]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

function safeReadJson<T>(filePath: string, fallback: T): T {
  try {
    ensureDirectories();
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[Ama Tec DB] Erro ao ler ficheiro ${filePath}:`, err);
    return fallback;
  }
}

function safeWriteJson<T>(filePath: string, data: T): void {
  try {
    ensureDirectories();
    const tempFile = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, filePath);
  } catch (err) {
    console.error(`[Ama Tec DB] Erro ao gravar ficheiro ${filePath}:`, err);
    throw err;
  }
}

/**
 * Hash seguro de palavra-passe usando PBKDF2 (SHA-512, 100.000 iterações)
 * Nunca guarda palavras-passe em texto simples!
 */
export function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, generatedSalt, 100000, 64, 'sha512')
    .toString('hex');
  return { salt: generatedSalt, hash };
}

export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  try {
    const computedHash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex');
    const computedBuffer = Buffer.from(computedHash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');
    if (computedBuffer.length !== storedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(computedBuffer, storedBuffer);
  } catch {
    return false;
  }
}

/* =========================================================================
   AUDITORIA (AUDIT LOG)
========================================================================= */

export function logAudit(
  action: string,
  target: string,
  userEmail: string = 'sistema',
  ip: string = '127.0.0.1',
  details?: Record<string, any>
): void {
  try {
    const logs = safeReadJson<AuditLogEntry[]>(AUDIT_FILE, []);
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      userEmail,
      action,
      target,
      ip,
      details,
    };
    logs.unshift(entry);
    // Guarda os últimos 1000 registos de auditoria
    safeWriteJson(AUDIT_FILE, logs.slice(0, 1000));
  } catch (err) {
    console.error('[Ama Tec DB] Erro ao registar auditoria:', err);
  }
}

export function getAuditLogsFromDb(limit: number = 100): AuditLogEntry[] {
  const logs = safeReadJson<AuditLogEntry[]>(AUDIT_FILE, []);
  return logs.slice(0, limit);
}

/* =========================================================================
   GESTÃO DE UTILIZADORES E AUTENTICAÇÃO
========================================================================= */

const DEFAULT_ADMIN_PASSWORD_INITIAL = 'AmaTec#2026!Golf2';

export function initDefaultAdminUser(): AdminUser {
  const users = safeReadJson<AdminUser[]>(USERS_FILE, []);
  const existing = users.find(
    (u) =>
      u.email.toLowerCase() === 'josuefranciscojaime@gmail.com' ||
      u.email.toLowerCase() === 'admin@amatec.ao'
  );

  if (existing) {
    return existing;
  }

  // Cria utilizador administrador inicial (Josué)
  const { salt, hash } = hashPassword(DEFAULT_ADMIN_PASSWORD_INITIAL);
  const adminUser: AdminUser = {
    id: 'user-admin-josue',
    email: 'josuefranciscojaime@gmail.com',
    name: 'Josué Jaime (Administrador)',
    role: 'admin',
    passwordSalt: salt,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };

  users.push(adminUser);
  safeWriteJson(USERS_FILE, users);
  logAudit('USER_INIT', 'adminUser', 'sistema', '127.0.0.1', {
    email: adminUser.email,
    role: adminUser.role,
  });

  return adminUser;
}

export function checkBruteForceLockout(identifier: string): { locked: boolean; remainingSeconds: number } {
  const attempts = safeReadJson<LoginAttempt[]>(LOGIN_ATTEMPTS_FILE, []);
  const record = attempts.find((a) => a.identifier === identifier);
  if (!record || !record.lockedUntil) {
    return { locked: false, remainingSeconds: 0 };
  }

  const lockedTime = new Date(record.lockedUntil).getTime();
  const now = Date.now();
  if (lockedTime > now) {
    const remainingSeconds = Math.ceil((lockedTime - now) / 1000);
    return { locked: true, remainingSeconds };
  }

  return { locked: false, remainingSeconds: 0 };
}

export function recordFailedLogin(identifier: string): void {
  const attempts = safeReadJson<LoginAttempt[]>(LOGIN_ATTEMPTS_FILE, []);
  const now = new Date();
  let record = attempts.find((a) => a.identifier === identifier);

  if (!record) {
    record = {
      identifier,
      failedCount: 1,
      lastAttemptAt: now.toISOString(),
    };
    attempts.push(record);
  } else {
    // Se a última tentativa foi há mais de 15 minutos, reinicia contagem
    const lastTime = new Date(record.lastAttemptAt).getTime();
    if (now.getTime() - lastTime > 15 * 60 * 1000) {
      record.failedCount = 1;
    } else {
      record.failedCount += 1;
    }
    record.lastAttemptAt = now.toISOString();
  }

  // Limite de 5 tentativas consecutivas falhadas = bloqueio temporário de 15 minutos
  if (record.failedCount >= 5) {
    const lockUntil = new Date(now.getTime() + 15 * 60 * 1000);
    record.lockedUntil = lockUntil.toISOString();
  }

  safeWriteJson(LOGIN_ATTEMPTS_FILE, attempts);
}

export function recordSuccessfulLogin(identifier: string): void {
  const attempts = safeReadJson<LoginAttempt[]>(LOGIN_ATTEMPTS_FILE, []);
  const filtered = attempts.filter((a) => a.identifier !== identifier);
  safeWriteJson(LOGIN_ATTEMPTS_FILE, filtered);
}

export function authenticateAdmin(
  emailInput: string,
  passwordInput: string,
  clientIp: string = '127.0.0.1',
  userAgent?: string
): { success: boolean; user?: AdminUser; session?: AdminSession; error?: string } {
  initDefaultAdminUser();

  const cleanEmail = (emailInput || '').trim().toLowerCase();
  if (!cleanEmail || !passwordInput) {
    return { success: false, error: 'Por favor, insira o email e a palavra-passe.' };
  }

  // 1. Verificação de Bloqueio por Força Bruta (por IP e por Email)
  const ipLock = checkBruteForceLockout(clientIp);
  if (ipLock.locked) {
    return {
      success: false,
      error: `Acesso temporariamente bloqueado por motivos de segurança. Tente novamente em ${ipLock.remainingSeconds} segundos.`,
    };
  }

  const emailLock = checkBruteForceLockout(cleanEmail);
  if (emailLock.locked) {
    return {
      success: false,
      error: `Esta conta está temporariamente bloqueada. Tente novamente em ${emailLock.remainingSeconds} segundos.`,
    };
  }

  // 2. Consulta de utilizador
  const users = safeReadJson<AdminUser[]>(USERS_FILE, []);
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === cleanEmail ||
      (cleanEmail === 'admin@amatec.ao' && u.role === 'admin')
  );

  if (!user) {
    recordFailedLogin(clientIp);
    recordFailedLogin(cleanEmail);
    logAudit('LOGIN_FAILED', cleanEmail, cleanEmail, clientIp, { reason: 'Utilizador não encontrado' });
    return { success: false, error: 'Credenciais de acesso incorretas.' };
  }

  // 3. Validação de Hash de Palavra-passe
  const isValid = verifyPassword(passwordInput, user.passwordSalt, user.passwordHash);
  if (!isValid) {
    recordFailedLogin(clientIp);
    recordFailedLogin(cleanEmail);
    logAudit('LOGIN_FAILED', user.email, user.email, clientIp, { reason: 'Palavra-passe errada' });
    return { success: false, error: 'Credenciais de acesso incorretas.' };
  }

  // 4. Sucesso: Limpar tentativas e criar Sessão Segura
  recordSuccessfulLogin(clientIp);
  recordSuccessfulLogin(cleanEmail);

  user.lastLoginAt = new Date().toISOString();
  safeWriteJson(USERS_FILE, users);

  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 dias

  const session: AdminSession = {
    token,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: now.toISOString(),
    expiresAt,
    ip: clientIp,
    userAgent,
  };

  const sessions = safeReadJson<AdminSession[]>(SESSIONS_FILE, []);
  sessions.push(session);
  safeWriteJson(SESSIONS_FILE, sessions);

  logAudit('LOGIN_SUCCESS', user.email, user.email, clientIp, { role: user.role });

  return { success: true, user, session };
}

export function validateSessionToken(token?: string): AdminSession | null {
  if (!token) return null;
  const sessions = safeReadJson<AdminSession[]>(SESSIONS_FILE, []);
  const session = sessions.find((s) => s.token === token);
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    // Sessão expirada
    destroySession(token);
    return null;
  }

  return session;
}

export function destroySession(token?: string): void {
  if (!token) return;
  const sessions = safeReadJson<AdminSession[]>(SESSIONS_FILE, []);
  const filtered = sessions.filter((s) => s.token !== token);
  safeWriteJson(SESSIONS_FILE, filtered);
}

export function changeAdminPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  userEmail: string,
  ip: string
): { success: boolean; error?: string } {
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'A nova palavra-passe deve ter pelo menos 8 caracteres.' };
  }

  const users = safeReadJson<AdminUser[]>(USERS_FILE, []);
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return { success: false, error: 'Utilizador não encontrado.' };
  }

  if (!verifyPassword(currentPassword, user.passwordSalt, user.passwordHash)) {
    return { success: false, error: 'A palavra-passe atual está incorreta.' };
  }

  const { salt, hash } = hashPassword(newPassword);
  user.passwordSalt = salt;
  user.passwordHash = hash;
  safeWriteJson(USERS_FILE, users);

  logAudit('PASSWORD_CHANGED', user.email, userEmail, ip);
  return { success: true };
}

/* =========================================================================
   CONFIGURAÇÕES GERAIS DO SITE (LOGO, MAPA, REDES SOCIAIS, CORES)
========================================================================= */

export function getDefaultSettings(): SiteSettings {
  return {
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
      logoHistory: [],
      brandColor: '#0284c7', // Sky-600 oficial da Ama Tec
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
      message: 'O portal da Ama Tec encontra-se em atualização de infraestrutura. Para reparações imediatas, contacte o WhatsApp +244 930 372 597.',
    },
  };
}

export function getSettingsFromDb(): SiteSettings {
  const settings = safeReadJson<SiteSettings | null>(SETTINGS_FILE, null);
  if (!settings) {
    const defaults = getDefaultSettings();
    safeWriteJson(SETTINGS_FILE, defaults);
    return defaults;
  }
  return settings;
}

export function updateSettingsInDb(newSettings: Partial<SiteSettings>, userEmail: string = 'admin'): SiteSettings {
  const current = getSettingsFromDb();
  const merged: SiteSettings = {
    ...current,
    ...newSettings,
    company: { ...current.company, ...(newSettings.company || {}) },
    visualIdentity: { ...current.visualIdentity, ...(newSettings.visualIdentity || {}) },
    socialLinks: { ...current.socialLinks, ...(newSettings.socialLinks || {}) },
    googleMaps: { ...current.googleMaps, ...(newSettings.googleMaps || {}) },
    businessHours: { ...current.businessHours, ...(newSettings.businessHours || {}) },
    maintenanceMode: { ...current.maintenanceMode, ...(newSettings.maintenanceMode || {}) },
  };

  safeWriteJson(SETTINGS_FILE, merged);
  logAudit('SETTINGS_UPDATED', 'settings', userEmail, '127.0.0.1');
  return merged;
}

/**
 * Upload seguro de Logotipo (validação de formato SVG/PNG e tamanho máx 2MB)
 * Mantém histórico completo para permitir reversão imediata!
 */
export function saveUploadedLogo(
  base64Data: string,
  mimeType: string,
  fileName: string,
  userEmail: string = 'admin'
): { success: boolean; logoUrl?: string; error?: string } {
  ensureDirectories();

  // Validação estrita de formato
  const allowedMime = ['image/svg+xml', 'image/png'];
  if (!allowedMime.includes(mimeType)) {
    return { success: false, error: 'Formato inválido. Apenas ficheiros SVG ou PNG são permitidos.' };
  }

  // Validação de tamanho: máx 2MB
  const buffer = Buffer.from(base64Data.replace(/^data:image\/[a-z+]+;base64,/, ''), 'base64');
  if (buffer.length > 2 * 1024 * 1024) {
    return { success: false, error: 'O ficheiro excede o tamanho máximo de 2MB.' };
  }

  const ext = mimeType === 'image/svg+xml' ? 'svg' : 'png';
  const newFileName = `logo-${Date.now()}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, newFileName);
  fs.writeFileSync(filePath, buffer);

  const newUrl = `/brand/uploads/${newFileName}`;
  const settings = getSettingsFromDb();

  // Adiciona logotipo anterior ao histórico
  if (settings.visualIdentity.logoUrl && settings.visualIdentity.logoUrl !== newUrl) {
    settings.visualIdentity.logoHistory.unshift({
      url: settings.visualIdentity.logoUrl,
      uploadedAt: new Date().toISOString(),
      fileName: path.basename(settings.visualIdentity.logoUrl),
    });
  }

  settings.visualIdentity.logoUrl = newUrl;
  safeWriteJson(SETTINGS_FILE, settings);
  logAudit('LOGO_UPLOADED', newUrl, userEmail, '127.0.0.1', { fileName, size: buffer.length });

  return { success: true, logoUrl: newUrl };
}

export function revertLogo(targetUrl: string, userEmail: string = 'admin'): boolean {
  const settings = getSettingsFromDb();
  if (settings.visualIdentity.logoUrl === targetUrl) return true;

  // Move logotipo atual para o histórico e restaura o alvo
  settings.visualIdentity.logoHistory.unshift({
    url: settings.visualIdentity.logoUrl,
    uploadedAt: new Date().toISOString(),
    fileName: path.basename(settings.visualIdentity.logoUrl),
  });

  settings.visualIdentity.logoUrl = targetUrl;
  safeWriteJson(SETTINGS_FILE, settings);
  logAudit('LOGO_REVERTED', targetUrl, userEmail, '127.0.0.1');
  return true;
}

/* =========================================================================
   GESTÃO DE SERVIÇOS (CRUD COMPLETO NA BASE DE DADOS)
========================================================================= */

export interface DbServiceItem extends ServiceItem {
  status?: 'published' | 'draft' | 'archived';
  updatedAt?: string;
}

export function getAllServicesFromDb(): DbServiceItem[] {
  let services = safeReadJson<DbServiceItem[] | null>(SERVICES_FILE, null);
  if (!services || !Array.isArray(services) || services.length === 0) {
    // Semeia base de dados a partir dos dados estruturados iniciais
    services = SERVICES.map((s) => ({
      ...s,
      status: 'published',
      updatedAt: new Date().toISOString(),
    }));
    safeWriteJson(SERVICES_FILE, services);
    logAudit('SERVICES_SEEDED', `${services.length} serviços`, 'sistema', '127.0.0.1');
  }
  return services;
}

export function getPublicServicesFromDb(): DbServiceItem[] {
  const all = getAllServicesFromDb();
  return all.filter((s) => s.status !== 'archived' && s.status !== 'draft');
}

export function getServiceBySlugFromDb(slug: string): DbServiceItem | null {
  const all = getAllServicesFromDb();
  return all.find((s) => s.slug === slug) || null;
}

export function saveServiceToDb(service: Partial<DbServiceItem> & { name: string }, userEmail: string = 'admin'): DbServiceItem {
  const services = getAllServicesFromDb();
  const now = new Date().toISOString();

  // Geração automática de slug limpo se não fornecido
  let slug = service.slug;
  if (!slug) {
    slug = service.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  const existingIndex = services.findIndex((s) => s.id === service.id || s.slug === slug);

  const fullService: DbServiceItem = {
    id: service.id || `srv-${Date.now()}`,
    slug,
    name: service.name,
    category: service.category || 'domestico',
    categoryName: service.categoryName || 'Linha Doméstica',
    shortDescription: service.shortDescription || '',
    fullDescription: service.fullDescription || '',
    commonProblems: Array.isArray(service.commonProblems) ? service.commonProblems : [],
    solutions: Array.isArray(service.solutions) ? service.solutions : [],
    coveredEquipment: Array.isArray(service.coveredEquipment) ? service.coveredEquipment : [],
    processSteps: Array.isArray(service.processSteps) ? service.processSteps : [
      { title: 'Triagem e Inspeção', detail: 'Diagnóstico dos circuitos e fontes em bancada técnica.' },
      { title: 'Orçamento Transparente', detail: 'Apresentação formal prévia com custo de peças e mão-de-obra.' },
      { title: 'Reparação e Testes', detail: 'Substituição de componentes e teste de estabilidade de 24 horas.' },
      { title: 'Entrega com Garantia', detail: 'Emissão de comprovativo escrito de garantia oficial Ama Tec.' },
    ],
    faqs: Array.isArray(service.faqs) ? service.faqs : [],
    imagePlaceholder: service.imagePlaceholder || '/images/hero/workshop-bench.webp',
    relatedServiceSlugs: Array.isArray(service.relatedServiceSlugs) ? service.relatedServiceSlugs : [],
    seoTitle: service.seoTitle || `${service.name} em Luanda | Ama Tec Golf 2`,
    seoDescription: service.seoDescription || service.shortDescription || 'Assistência técnica especializada na oficina da Ama Tec.',
    status: service.status || 'published',
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    services[existingIndex] = { ...services[existingIndex], ...fullService };
    logAudit('SERVICE_UPDATED', fullService.name, userEmail, '127.0.0.1', { slug: fullService.slug });
  } else {
    services.unshift(fullService);
    logAudit('SERVICE_CREATED', fullService.name, userEmail, '127.0.0.1', { slug: fullService.slug });
  }

  safeWriteJson(SERVICES_FILE, services);
  return fullService;
}

export function archiveServiceInDb(id: string, userEmail: string = 'admin'): boolean {
  const services = getAllServicesFromDb();
  const target = services.find((s) => s.id === id);
  if (!target) return false;

  target.status = 'archived';
  target.updatedAt = new Date().toISOString();
  safeWriteJson(SERVICES_FILE, services);
  logAudit('SERVICE_ARCHIVED', target.name, userEmail, '127.0.0.1', { id });
  return true;
}

export function deleteServiceFromDb(id: string, userEmail: string = 'admin'): boolean {
  const services = getAllServicesFromDb();
  const filtered = services.filter((s) => s.id !== id);
  if (filtered.length === services.length) return false;

  safeWriteJson(SERVICES_FILE, filtered);
  logAudit('SERVICE_DELETED', id, userEmail, '127.0.0.1', { id });
  return true;
}

/* =========================================================================
   GESTÃO DE PEDIDOS (LEADS)
========================================================================= */

export function getAllLeadsFromServer(): ServerLead[] {
  return safeReadJson<ServerLead[]>(LEADS_FILE, []);
}

export function saveLeadToServer(lead: ServerLead): void {
  const leads = getAllLeadsFromServer();
  const existingIndex = leads.findIndex((l) => l.id === lead.id);
  if (existingIndex >= 0) {
    leads[existingIndex] = { ...leads[existingIndex], ...lead };
  } else {
    leads.unshift(lead);
  }
  safeWriteJson(LEADS_FILE, leads);

  const logLine = `[${new Date().toISOString()}] LEAD_SAVED | id=${lead.id} | name=${lead.name} | phone=${lead.phone} | eq=${lead.equipment} | status=${lead.status}\n`;
  ensureDirectories();
  fs.appendFileSync(LEADS_LOG, logLine, 'utf-8');
}

export function updateLeadStatusOnServer(id: string, status: ServerLead['status'], notes?: string): boolean {
  const leads = getAllLeadsFromServer();
  const target = leads.find((l) => l.id === id);
  if (!target) return false;

  target.status = status;
  if (notes !== undefined) {
    target.notes = notes;
  }
  safeWriteJson(LEADS_FILE, leads);

  const logLine = `[${new Date().toISOString()}] STATUS_UPDATED | id=${id} | newStatus=${status}\n`;
  ensureDirectories();
  fs.appendFileSync(LEADS_LOG, logLine, 'utf-8');
  return true;
}

export function deleteLeadFromServer(id: string): boolean {
  const leads = getAllLeadsFromServer();
  const filtered = leads.filter((l) => l.id !== id);
  if (filtered.length === leads.length) return false;

  safeWriteJson(LEADS_FILE, filtered);
  const logLine = `[${new Date().toISOString()}] LEAD_DELETED | id=${id}\n`;
  ensureDirectories();
  fs.appendFileSync(LEADS_LOG, logLine, 'utf-8');
  return true;
}

export function exportLeadsToCsv(): string {
  const leads = getAllLeadsFromServer();
  // Cabeçalho CSV com BOM para Excel reconhecer acentos em UTF-8
  const header = ['ID', 'Data', 'Nome', 'Telefone', 'Email', 'Equipamento', 'Categoria', 'Localização', 'Estado', 'Problema', 'Notas'];
  const rows = leads.map((l) => [
    l.id,
    new Date(l.createdAt).toLocaleDateString('pt-PT'),
    `"${(l.name || '').replace(/"/g, '""')}"`,
    `"${(l.phone || '').replace(/"/g, '""')}"`,
    `"${(l.email || '').replace(/"/g, '""')}"`,
    `"${(l.equipment || '').replace(/"/g, '""')}"`,
    `"${(l.serviceCategory || '').replace(/"/g, '""')}"`,
    `"${(l.location || '').replace(/"/g, '""')}"`,
    `"${(l.status || '').replace(/"/g, '""')}"`,
    `"${(l.problemDescription || '').replace(/"/g, '""')}"`,
    `"${(l.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return csvContent;
}

/* =========================================================================
   EQUIPAMENTOS, GALERIA E DEPOIMENTOS
========================================================================= */

export function getAllEquipmentFromDb(): EquipmentItem[] {
  let list = safeReadJson<EquipmentItem[] | null>(EQUIPMENT_FILE, null);
  if (!list || !Array.isArray(list) || list.length === 0) {
    list = EQUIPMENT_CATALOG;
    safeWriteJson(EQUIPMENT_FILE, list);
  }
  return list;
}

export function saveEquipmentToDb(item: EquipmentItem, userEmail: string = 'admin'): EquipmentItem {
  const list = getAllEquipmentFromDb();
  const index = list.findIndex((e) => e.id === item.id);
  if (index >= 0) {
    list[index] = { ...list[index], ...item };
  } else {
    list.unshift(item);
  }
  safeWriteJson(EQUIPMENT_FILE, list);
  logAudit('EQUIPMENT_SAVED', item.name, userEmail, '127.0.0.1');
  return item;
}

export function deleteEquipmentFromDb(id: string, userEmail: string = 'admin'): boolean {
  const list = getAllEquipmentFromDb();
  const filtered = list.filter((e) => e.id !== id);
  if (filtered.length === list.length) return false;
  safeWriteJson(EQUIPMENT_FILE, filtered);
  logAudit('EQUIPMENT_DELETED', id, userEmail, '127.0.0.1');
  return true;
}

export function getAllTestimonialsFromDb(): TestimonialItem[] {
  return safeReadJson<TestimonialItem[]>(TESTIMONIALS_FILE, []);
}

export function saveTestimonialToDb(item: Partial<TestimonialItem> & { name: string; text: string }, userEmail: string = 'admin'): TestimonialItem {
  const list = getAllTestimonialsFromDb();
  const fullItem: TestimonialItem = {
    id: item.id || `test-${Date.now()}`,
    name: item.name,
    location: item.location || 'Luanda',
    equipment: item.equipment || 'Equipamento Eletrónico',
    serviceCategory: item.serviceCategory || 'domestico',
    text: item.text,
    rating: item.rating || 5,
    date: item.date || new Date().toISOString().split('T')[0],
    isRealVerified: true,
  };

  const index = list.findIndex((t) => t.id === fullItem.id);
  if (index >= 0) {
    list[index] = fullItem;
  } else {
    list.unshift(fullItem);
  }

  safeWriteJson(TESTIMONIALS_FILE, list);
  logAudit('TESTIMONIAL_SAVED', fullItem.name, userEmail, '127.0.0.1');
  return fullItem;
}

export function deleteTestimonialFromDb(id: string, userEmail: string = 'admin'): boolean {
  const list = getAllTestimonialsFromDb();
  const filtered = list.filter((t) => t.id !== id);
  if (filtered.length === list.length) return false;
  safeWriteJson(TESTIMONIALS_FILE, filtered);
  logAudit('TESTIMONIAL_DELETED', id, userEmail, '127.0.0.1');
  return true;
}

/* =========================================================================
   CÓPIAS DE SEGURANÇA (BACKUPS)
========================================================================= */

export function createFullBackup(userEmail: string = 'admin'): { filename: string; timestamp: string; sizeBytes: number } {
  ensureDirectories();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `amatec-backup-${timestamp}.json`;
  const backupPath = path.join(BACKUPS_DIR, filename);

  const payload = {
    createdAt: new Date().toISOString(),
    createdBy: userEmail,
    version: '1.0',
    data: {
      services: getAllServicesFromDb(),
      leads: getAllLeadsFromServer(),
      settings: getSettingsFromDb(),
      equipment: getAllEquipmentFromDb(),
      testimonials: getAllTestimonialsFromDb(),
      audit: getAuditLogsFromDb(500),
    },
  };

  const raw = JSON.stringify(payload, null, 2);
  fs.writeFileSync(backupPath, raw, 'utf-8');
  logAudit('BACKUP_CREATED', filename, userEmail, '127.0.0.1', { sizeBytes: Buffer.byteLength(raw) });

  return {
    filename,
    timestamp: payload.createdAt,
    sizeBytes: Buffer.byteLength(raw),
  };
}

export function listBackups(): { filename: string; sizeBytes: number; createdAt: string }[] {
  ensureDirectories();
  if (!fs.existsSync(BACKUPS_DIR)) return [];
  const files = fs.readdirSync(BACKUPS_DIR).filter((f) => f.endsWith('.json'));

  return files
    .map((f) => {
      const fullPath = path.join(BACKUPS_DIR, f);
      const stat = fs.statSync(fullPath);
      return {
        filename: f,
        sizeBytes: stat.size,
        createdAt: stat.mtime.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getBackupContent(filename: string): string | null {
  const safeName = path.basename(filename);
  const fullPath = path.join(BACKUPS_DIR, safeName);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf-8');
}
