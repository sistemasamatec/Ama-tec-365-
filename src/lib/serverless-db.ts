/**
 * Ama Tec — Motor de Base de Dados Serverless Unificado
 * 
 * Suporta em produção:
 * 1. Firebase Firestore via Firebase Admin SDK (Recomendado para Vercel / Cloud Run)
 *    Variáveis: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * 2. PostgreSQL (Vercel Postgres, Supabase, Neon, AWS RDS, Cloud SQL) via POSTGRES_URL / DATABASE_URL
 * 3. Turso / LibSQL (Serverless SQLite over HTTP) via TURSO_DATABASE_URL e TURSO_AUTH_TOKEN
 * 4. Fallback Resiliente a Serverless (armazenamento em /tmp/amatec-data com isolamento EROFS na Vercel quando sem credenciais de BD externa)
 * 
 * Preserva 100% da mesma estrutura de dados e contratos de APIs.
 * Coleções oficiais: leads, services, audit_log, backups, admin_settings, equipment, gallery, testimonials, users, sessions.
 */

import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, cert, type App as FirebaseAdminApp } from 'firebase-admin/app';
import { getFirestore, type Firestore as FirestoreDb } from 'firebase-admin/firestore';
import { Pool } from 'pg';
import { createClient as createTursoClient, Client as TursoClient } from '@libsql/client';

export type DatabaseEngineType = 'firestore' | 'postgres' | 'turso' | 'filesystem';

interface StoreRecord<T = any> {
  collection: string;
  id: string;
  data: T;
  updated_at: string;
}

// Global cached connection pool across serverless hot lambda invocations
declare global {
  var _amatecFirebaseApp: FirebaseAdminApp | undefined;
  var _amatecFirestoreDb: FirestoreDb | undefined;
  var _amatecPgPool: Pool | undefined;
  var _amatecTursoClient: TursoClient | undefined;
  var _amatecDbInitialized: boolean | undefined;
  var _amatecMemoryCache: Map<string, any> | undefined;
}

const memoryCache = (global._amatecMemoryCache = global._amatecMemoryCache || new Map<string, any>());

/**
 * Normaliza o nome da coleção para alinhamento com Firestore e outros sistemas da Ama Tec
 */
export function normalizeCollectionName(collectionName: string): string {
  if (collectionName === 'audit' || collectionName === 'audit_logs') return 'audit_log';
  if (collectionName === 'settings' || collectionName === 'site_settings') return 'admin_settings';
  return collectionName;
}

function isValidPrivateKey(key?: string): boolean {
  if (!key) return false;
  const formatted = key.replace(/\\n/g, '\n');
  return (
    formatted.includes('-----BEGIN PRIVATE KEY-----') &&
    formatted.includes('-----END PRIVATE KEY-----') &&
    formatted.length > 200
  );
}

export function getDatabaseEngineType(): DatabaseEngineType {
  if (process.env.FORCE_FIRESTORE === 'true') {
    return 'firestore';
  }

  // 1. Firebase Firestore (Prioridade de Produção)
  if (process.env.FIREBASE_PROJECT_ID) {
    if (
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      (process.env.FIREBASE_CLIENT_EMAIL && isValidPrivateKey(process.env.FIREBASE_PRIVATE_KEY))
    ) {
      return 'firestore';
    }
  }

  // 2. PostgreSQL
  const pgUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
  if (pgUrl && (pgUrl.startsWith('postgres://') || pgUrl.startsWith('postgresql://'))) {
    return 'postgres';
  }

  // 3. Turso
  if (process.env.TURSO_DATABASE_URL) {
    return 'turso';
  }

  // 4. Filesystem / tmp
  return 'filesystem';
}

/**
 * Obtém ou inicializa a instância do Firestore via Firebase Admin SDK
 */
export function getFirestoreDb(): FirestoreDb | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId) return null;

  if (global._amatecFirestoreDb) {
    return global._amatecFirestoreDb;
  }

  try {
    const existingApps = getApps();
    if (!existingApps.length) {
      if (clientEmail && privateKey && isValidPrivateKey(privateKey)) {
        if (privateKey.includes('\\n')) {
          privateKey = privateKey.replace(/\\n/g, '\n');
        }
        global._amatecFirebaseApp = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } else {
        // Inicialização padrão por ADC (Application Default Credentials no Google Cloud / Cloud Run)
        global._amatecFirebaseApp = initializeApp({ projectId });
      }
    } else {
      global._amatecFirebaseApp = existingApps[0];
    }

    const db = getFirestore(global._amatecFirebaseApp);
    // Configurações de timeout do Firestore
    db.settings({ ignoreUndefinedProperties: true });
    global._amatecFirestoreDb = db;
    return global._amatecFirestoreDb ?? null;
  } catch (err) {
    console.error('[Ama Tec DB] Erro ao inicializar Firebase Admin Firestore:', err);
    return null;
  }
}

/**
 * Obtém ou inicializa o pool PostgreSQL
 */
function getPgPool(): Pool | null {
  const pgUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
  if (!pgUrl) return null;

  if (!global._amatecPgPool) {
    const isLocalhost = pgUrl.includes('localhost') || pgUrl.includes('127.0.0.1');
    global._amatecPgPool = new Pool({
      connectionString: pgUrl,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 10,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    });

    global._amatecPgPool.on('error', (err) => {
      console.error('[Ama Tec Serverless DB] Erro no pool PostgreSQL:', err);
    });
  }
  return global._amatecPgPool;
}

/**
 * Obtém ou inicializa o cliente Turso
 */
function getTursoClient(): TursoClient | null {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return null;

  if (!global._amatecTursoClient) {
    global._amatecTursoClient = createTursoClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });
  }
  return global._amatecTursoClient;
}

/**
 * Determina o diretório de dados em fallback de sistema de ficheiros
 * No ambiente Vercel Serverless, process.cwd() é read-only (/var/task),
 * por isso usamos /tmp/amatec-data de forma segura.
 */
export function getFallbackDataDir(): string {
  if (process.env.DATA_PATH) {
    return path.resolve(process.env.DATA_PATH);
  }
  // Usa sempre /tmp/amatec-data para garantir que nada é gravado no diretório data/ do repositório
  const tmpDir = path.join('/tmp', 'amatec-data');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  return tmpDir;
}

/**
 * Inicialização e migração de tabelas necessárias na base de dados
 */
export async function initializeDatabaseSchema(): Promise<void> {
  if (global._amatecDbInitialized) return;

  const engine = getDatabaseEngineType();

  if (engine === 'firestore') {
    // Firestore é schemaless e auto-indexado
    global._amatecDbInitialized = true;
    return;
  }

  if (engine === 'postgres') {
    const pool = getPgPool();
    if (!pool) return;

    try {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS amatec_store (
            collection VARCHAR(60) NOT NULL,
            id VARCHAR(160) NOT NULL,
            data JSONB NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            PRIMARY KEY (collection, id)
          );
          CREATE INDEX IF NOT EXISTS idx_amatec_store_col ON amatec_store (collection);
          CREATE INDEX IF NOT EXISTS idx_amatec_store_updated ON amatec_store (collection, updated_at DESC);
        `);
        console.log('[Ama Tec DB] Tabela PostgreSQL "amatec_store" inicializada com sucesso.');
      } finally {
        client.release();
      }
      global._amatecDbInitialized = true;
    } catch (err) {
      console.error('[Ama Tec DB] Erro ao criar schema PostgreSQL:', err);
    }
  } else if (engine === 'turso') {
    const client = getTursoClient();
    if (!client) return;

    try {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS amatec_store (
          collection TEXT NOT NULL,
          id TEXT NOT NULL,
          data TEXT NOT NULL,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (collection, id)
        );
      `);
      await client.execute(`
        CREATE INDEX IF NOT EXISTS idx_amatec_store_col ON amatec_store (collection);
      `);
      console.log('[Ama Tec DB] Tabela Turso "amatec_store" inicializada com sucesso.');
      global._amatecDbInitialized = true;
    } catch (err) {
      console.error('[Ama Tec DB] Erro ao criar schema Turso:', err);
    }
  } else {
    // Filesystem: assegura que o diretório existe e propaga sementes iniciais se em /tmp
    const targetDir = getFallbackDataDir();
    const sourceDir = path.resolve(process.cwd(), 'data');

    if (targetDir !== sourceDir && fs.existsSync(sourceDir)) {
      try {
        const files = fs.readdirSync(sourceDir);
        for (const file of files) {
          const srcFile = path.join(sourceDir, file);
          const destFile = path.join(targetDir, file);
          if (fs.statSync(srcFile).isFile() && !fs.existsSync(destFile)) {
            fs.copyFileSync(srcFile, destFile);
          }
        }
      } catch (err) {
        console.warn('[Ama Tec DB] Não foi possível copiar seeds para /tmp:', err);
      }
    }
    global._amatecDbInitialized = true;
  }
}

/* =========================================================================
   OPERAÇÕES CRUD UNIFICADAS (COLEÇÃO & DOCUMENTO)
========================================================================= */

/**
 * Lê toda a coleção da base de dados
 */
export async function dbGetCollection<T = any>(collectionName: string, fallback: T[] = []): Promise<T[]> {
  await initializeDatabaseSchema();
  const engine = getDatabaseEngineType();
  const normalizedName = normalizeCollectionName(collectionName);

  // 1. Firebase Firestore (Produção)
  if (engine === 'firestore') {
    const firestore = getFirestoreDb();
    if (firestore) {
      try {
        const snapshot = await firestore
          .collection(normalizedName)
          .orderBy('updated_at', 'desc')
          .get();

        if (!snapshot.empty) {
          const items: T[] = [];
          snapshot.forEach((doc) => {
            const docData = doc.data();
            items.push((docData.data !== undefined ? docData.data : docData) as T);
          });
          memoryCache.set(`col:${normalizedName}`, items);
          return items;
        }
        return fallback;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao ler coleção ${normalizedName} no Firestore:`, err);
      }
    }
  }

  // 2. PostgreSQL (Vercel Postgres, Supabase, Neon)
  if (engine === 'postgres') {
    const pool = getPgPool();
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT data FROM amatec_store WHERE collection = $1 ORDER BY updated_at DESC`,
          [normalizedName]
        );
        if (res.rows.length > 0) {
          const items = res.rows.map((r) => r.data as T);
          memoryCache.set(`col:${normalizedName}`, items);
          return items;
        }
        return fallback;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao ler coleção ${normalizedName} no Postgres:`, err);
      }
    }
  }

  // 3. Turso / LibSQL
  if (engine === 'turso') {
    const client = getTursoClient();
    if (client) {
      try {
        const res = await client.execute({
          sql: `SELECT data FROM amatec_store WHERE collection = ? ORDER BY updated_at DESC`,
          args: [normalizedName],
        });
        if (res.rows.length > 0) {
          const items = res.rows.map((r) => JSON.parse(r.data as string) as T);
          memoryCache.set(`col:${normalizedName}`, items);
          return items;
        }
        return fallback;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao ler coleção ${normalizedName} no Turso:`, err);
      }
    }
  }

  // 4. Filesystem Fallback (Local ou /tmp no Serverless)
  const dir = getFallbackDataDir();
  const filePath = path.join(dir, `${collectionName}.json`);
  if (!fs.existsSync(filePath)) {
    const baseFile = path.resolve(process.cwd(), 'data', `${collectionName}.json`);
    if (fs.existsSync(baseFile)) {
      try {
        const raw = fs.readFileSync(baseFile, 'utf-8');
        return JSON.parse(raw);
      } catch {
        return fallback;
      }
    }
    return fallback;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[Ama Tec DB] Erro ao ler ficheiro ${filePath}:`, err);
    return fallback;
  }
}

/**
 * Grava toda a coleção na base de dados
 */
export async function dbSaveCollection<T extends { id?: string; slug?: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  await initializeDatabaseSchema();
  const engine = getDatabaseEngineType();
  const normalizedName = normalizeCollectionName(collectionName);
  memoryCache.set(`col:${normalizedName}`, items);

  // 1. Firebase Firestore
  if (engine === 'firestore') {
    const firestore = getFirestoreDb();
    if (firestore) {
      try {
        const batch = firestore.batch();
        const collectionRef = firestore.collection(normalizedName);

        // Limpa itens antigos ou sobrescreve atomicamente
        const existingDocs = await collectionRef.limit(500).get();
        existingDocs.forEach((doc) => batch.delete(doc.ref));

        const now = new Date().toISOString();
        for (const item of items) {
          const docId = String(item.id || item.slug || `item-${Math.random().toString(36).slice(2, 9)}`);
          const docRef = collectionRef.doc(docId);
          batch.set(docRef, {
            collection: normalizedName,
            id: docId,
            data: item,
            updated_at: now,
          });
        }
        await batch.commit();
        return;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao gravar coleção ${normalizedName} no Firestore:`, err);
      }
    }
  }

  // 2. PostgreSQL
  if (engine === 'postgres') {
    const pool = getPgPool();
    if (pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM amatec_store WHERE collection = $1', [normalizedName]);

        for (const item of items) {
          const docId = item.id || item.slug || `item-${Math.random().toString(36).slice(2, 9)}`;
          await client.query(
            `INSERT INTO amatec_store (collection, id, data, updated_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
            [normalizedName, docId, JSON.stringify(item)]
          );
        }
        await client.query('COMMIT');
        return;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[Ama Tec DB] Erro ao gravar coleção ${normalizedName} no Postgres:`, err);
      } finally {
        client.release();
      }
    }
  }

  // 3. Turso
  if (engine === 'turso') {
    const client = getTursoClient();
    if (client) {
      try {
        await client.execute({
          sql: 'DELETE FROM amatec_store WHERE collection = ?',
          args: [normalizedName],
        });
        for (const item of items) {
          const docId = item.id || item.slug || `item-${Math.random().toString(36).slice(2, 9)}`;
          await client.execute({
            sql: `INSERT INTO amatec_store (collection, id, data, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            args: [normalizedName, docId, JSON.stringify(item)],
          });
        }
        return;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao gravar coleção ${normalizedName} no Turso:`, err);
      }
    }
  }

  // 4. Filesystem
  const dir = getFallbackDataDir();
  const filePath = path.join(dir, `${collectionName}.json`);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempFile = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(items, null, 2), 'utf-8');
    fs.renameSync(tempFile, filePath);
  } catch (err) {
    console.error(`[Ama Tec DB] Erro ao gravar ficheiro ${filePath}:`, err);
  }
}

/**
 * Insere ou atualiza um único documento atomicamente
 */
export async function dbUpsertDocument<T extends { id?: string; slug?: string }>(
  collectionName: string,
  id: string,
  doc: T
): Promise<void> {
  await initializeDatabaseSchema();
  const engine = getDatabaseEngineType();
  const normalizedName = normalizeCollectionName(collectionName);

  // 1. Firebase Firestore
  if (engine === 'firestore') {
    const firestore = getFirestoreDb();
    if (firestore) {
      try {
        const docRef = firestore.collection(normalizedName).doc(String(id));
        await docRef.set(
          {
            collection: normalizedName,
            id: String(id),
            data: doc,
            updated_at: new Date().toISOString(),
          },
          { merge: true }
        );
        return;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao upsert documento ${id} em ${normalizedName} no Firestore:`, err);
      }
    }
  }

  // 2. PostgreSQL
  if (engine === 'postgres') {
    const pool = getPgPool();
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO amatec_store (collection, id, data, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
          [normalizedName, id, JSON.stringify(doc)]
        );
        return;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao upsert documento ${id} em ${normalizedName} no Postgres:`, err);
      }
    }
  }

  // 3. Turso
  if (engine === 'turso') {
    const client = getTursoClient();
    if (client) {
      try {
        await client.execute({
          sql: `INSERT OR REPLACE INTO amatec_store (collection, id, data, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
          args: [normalizedName, id, JSON.stringify(doc)],
        });
        return;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao upsert documento ${id} em ${normalizedName} no Turso:`, err);
      }
    }
  }

  // 4. Filesystem fallback: atualiza a lista e grava
  const items = await dbGetCollection<T>(collectionName, []);
  const index = items.findIndex((item) => (item.id || item.slug) === id);
  if (index >= 0) {
    items[index] = doc;
  } else {
    items.unshift(doc);
  }
  await dbSaveCollection(collectionName, items);
}

/**
 * Elimina um documento por ID
 */
export async function dbDeleteDocument(collectionName: string, id: string): Promise<boolean> {
  await initializeDatabaseSchema();
  const engine = getDatabaseEngineType();
  const normalizedName = normalizeCollectionName(collectionName);

  // 1. Firebase Firestore
  if (engine === 'firestore') {
    const firestore = getFirestoreDb();
    if (firestore) {
      try {
        await firestore.collection(normalizedName).doc(String(id)).delete();
        return true;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao apagar ${id} em ${normalizedName} no Firestore:`, err);
        return false;
      }
    }
  }

  // 2. PostgreSQL
  if (engine === 'postgres') {
    const pool = getPgPool();
    if (pool) {
      try {
        const res = await pool.query(
          `DELETE FROM amatec_store WHERE collection = $1 AND id = $2`,
          [normalizedName, id]
        );
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao apagar ${id} em ${normalizedName} no Postgres:`, err);
      }
    }
  }

  // 3. Turso
  if (engine === 'turso') {
    const client = getTursoClient();
    if (client) {
      try {
        const res = await client.execute({
          sql: `DELETE FROM amatec_store WHERE collection = ? AND id = ?`,
          args: [normalizedName, id],
        });
        return res.rowsAffected > 0;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao apagar ${id} em ${normalizedName} no Turso:`, err);
      }
    }
  }

  // 4. Filesystem fallback
  const items = await dbGetCollection<any>(collectionName, []);
  const filtered = items.filter((item) => (item.id || item.slug) !== id);
  await dbSaveCollection(collectionName, filtered);
  return filtered.length < items.length;
}

/**
 * Guarda o snapshot de backup
 */
export async function dbSaveBackup(filename: string, data: any): Promise<void> {
  await initializeDatabaseSchema();
  const engine = getDatabaseEngineType();

  // 1. Firebase Firestore
  if (engine === 'firestore') {
    const firestore = getFirestoreDb();
    if (firestore) {
      try {
        const sizeBytes = Buffer.byteLength(JSON.stringify(data), 'utf-8');
        await firestore.collection('backups').doc(filename).set({
          collection: 'backups',
          id: filename,
          filename,
          createdAt: new Date().toISOString(),
          sizeBytes,
          data,
          updated_at: new Date().toISOString(),
        });
        return;
      } catch (err) {
        console.error('[Ama Tec DB] Erro ao gravar backup no Firestore:', err);
      }
    }
  }

  // 2. PostgreSQL
  if (engine === 'postgres') {
    const pool = getPgPool();
    if (pool) {
      try {
        const sizeBytes = Buffer.byteLength(JSON.stringify(data), 'utf-8');
        await pool.query(
          `INSERT INTO amatec_store (collection, id, data, updated_at)
           VALUES ('backups', $1, $2, NOW())
           ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
          [filename, JSON.stringify({ filename, createdAt: new Date().toISOString(), sizeBytes, data })]
        );
        return;
      } catch (err) {
        console.error('[Ama Tec DB] Erro ao gravar backup no Postgres:', err);
      }
    }
  }

  // 3. Filesystem fallback
  const dir = path.join(getFallbackDataDir(), 'backups');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Obtém os dados de backup por nome de ficheiro
 */
export async function dbGetBackup(filename: string): Promise<any | null> {
  await initializeDatabaseSchema();
  const engine = getDatabaseEngineType();

  // 1. Firebase Firestore
  if (engine === 'firestore') {
    const firestore = getFirestoreDb();
    if (firestore) {
      try {
        const doc = await firestore.collection('backups').doc(filename).get();
        if (doc.exists) {
          const docData = doc.data();
          return docData?.data?.data || docData?.data || docData;
        }
      } catch (err) {
        console.error('[Ama Tec DB] Erro ao ler backup no Firestore:', err);
      }
    }
  }

  // 2. PostgreSQL
  if (engine === 'postgres') {
    const pool = getPgPool();
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT data FROM amatec_store WHERE collection = 'backups' AND id = $1`,
          [filename]
        );
        if (res.rows.length > 0) {
          return res.rows[0].data?.data || res.rows[0].data;
        }
      } catch (err) {
        console.error('[Ama Tec DB] Erro ao ler backup no Postgres:', err);
      }
    }
  }

  // 3. Filesystem fallback
  const dir = path.join(getFallbackDataDir(), 'backups');
  const filePath = path.join(dir, filename);
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}
