/**
 * Ama Tec — Motor de Base de Dados Serverless Unificado
 * 
 * Suporta em produção na Vercel:
 * 1. PostgreSQL (Vercel Postgres, Supabase, Neon, AWS RDS, Cloud SQL) via POSTGRES_URL / DATABASE_URL
 * 2. Turso / LibSQL (Serverless SQLite over HTTP) via TURSO_DATABASE_URL e TURSO_AUTH_TOKEN
 * 3. Fallback Resiliente a Serverless (armazenamento em /tmp/amatec-data com isolamento EROFS na Vercel quando sem credenciais de BD externa)
 * 
 * Preserva 100% da mesma estrutura de dados e contratos de APIs.
 */

import fs from 'fs';
import path from 'path';
import { Pool, PoolClient } from 'pg';
import { createClient as createTursoClient, Client as TursoClient } from '@libsql/client';

export type DatabaseEngineType = 'postgres' | 'turso' | 'filesystem';

interface StoreRecord<T = any> {
  collection: string;
  id: string;
  data: T;
  updated_at: string;
}

// Global cached connection pool across serverless hot lambda invocations
declare global {
  var _amatecPgPool: Pool | undefined;
  var _amatecTursoClient: TursoClient | undefined;
  var _amatecDbInitialized: boolean | undefined;
  var _amatecMemoryCache: Map<string, any> | undefined;
}

const memoryCache = (global._amatecMemoryCache = global._amatecMemoryCache || new Map<string, any>());

export function getDatabaseEngineType(): DatabaseEngineType {
  const pgUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
  if (pgUrl && (pgUrl.startsWith('postgres://') || pgUrl.startsWith('postgresql://'))) {
    return 'postgres';
  }
  if (process.env.TURSO_DATABASE_URL) {
    return 'turso';
  }
  return 'filesystem';
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
  const isVercelServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (isVercelServerless) {
    const tmpDir = path.join('/tmp', 'amatec-data');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return tmpDir;
  }

  // Verifica se o diretório local data/ é gravável
  const localDir = path.resolve(process.cwd(), 'data');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.accessSync(localDir, fs.constants.W_OK);
    return localDir;
  } catch {
    // Se read-only, faz fallback gracioso para /tmp
    const tmpDir = path.join('/tmp', 'amatec-data');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return tmpDir;
  }
}

/**
 * Inicialização e migração de tabelas necessárias na base de dados
 */
export async function initializeDatabaseSchema(): Promise<void> {
  if (global._amatecDbInitialized) return;

  const engine = getDatabaseEngineType();

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

  // 1. PostgreSQL (Vercel Postgres, Supabase, Neon)
  if (engine === 'postgres') {
    const pool = getPgPool();
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT data FROM amatec_store WHERE collection = $1 ORDER BY updated_at DESC`,
          [collectionName]
        );
        if (res.rows.length > 0) {
          const items = res.rows.map((r) => r.data as T);
          memoryCache.set(`col:${collectionName}`, items);
          return items;
        }
        // Se a base de dados remota ainda estiver vazia, carrega semente inicial
        return fallback;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao ler coleção ${collectionName} no Postgres:`, err);
      }
    }
  }

  // 2. Turso / LibSQL
  if (engine === 'turso') {
    const client = getTursoClient();
    if (client) {
      try {
        const res = await client.execute({
          sql: `SELECT data FROM amatec_store WHERE collection = ? ORDER BY updated_at DESC`,
          args: [collectionName],
        });
        if (res.rows.length > 0) {
          const items = res.rows.map((r) => JSON.parse(r.data as string) as T);
          memoryCache.set(`col:${collectionName}`, items);
          return items;
        }
        return fallback;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao ler coleção ${collectionName} no Turso:`, err);
      }
    }
  }

  // 3. Filesystem Fallback (Local ou /tmp no Serverless)
  const dir = getFallbackDataDir();
  const filePath = path.join(dir, `${collectionName}.json`);
  if (!fs.existsSync(filePath)) {
    // Tenta também no diretório base se diferente
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
  memoryCache.set(`col:${collectionName}`, items);

  // 1. PostgreSQL
  if (engine === 'postgres') {
    const pool = getPgPool();
    if (pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // Elimina itens obsoletos da coleção para manter sincronizado
        await client.query('DELETE FROM amatec_store WHERE collection = $1', [collectionName]);

        for (const item of items) {
          const docId = item.id || item.slug || `item-${Math.random().toString(36).slice(2, 9)}`;
          await client.query(
            `INSERT INTO amatec_store (collection, id, data, updated_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
            [collectionName, docId, JSON.stringify(item)]
          );
        }
        await client.query('COMMIT');
        return;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[Ama Tec DB] Erro ao gravar coleção ${collectionName} no Postgres:`, err);
      } finally {
        client.release();
      }
    }
  }

  // 2. Turso
  if (engine === 'turso') {
    const client = getTursoClient();
    if (client) {
      try {
        await client.execute({
          sql: 'DELETE FROM amatec_store WHERE collection = ?',
          args: [collectionName],
        });
        for (const item of items) {
          const docId = item.id || item.slug || `item-${Math.random().toString(36).slice(2, 9)}`;
          await client.execute({
            sql: `INSERT INTO amatec_store (collection, id, data, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            args: [collectionName, docId, JSON.stringify(item)],
          });
        }
        return;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao gravar coleção ${collectionName} no Turso:`, err);
      }
    }
  }

  // 3. Filesystem
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

  // 1. PostgreSQL
  if (engine === 'postgres') {
    const pool = getPgPool();
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO amatec_store (collection, id, data, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
          [collectionName, id, JSON.stringify(doc)]
        );
        return;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao upsert documento ${id} em ${collectionName} no Postgres:`, err);
      }
    }
  }

  // 2. Turso
  if (engine === 'turso') {
    const client = getTursoClient();
    if (client) {
      try {
        await client.execute({
          sql: `INSERT OR REPLACE INTO amatec_store (collection, id, data, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
          args: [collectionName, id, JSON.stringify(doc)],
        });
        return;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao upsert documento ${id} em ${collectionName} no Turso:`, err);
      }
    }
  }

  // 3. Filesystem fallback: atualiza a lista e grava
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

  if (engine === 'postgres') {
    const pool = getPgPool();
    if (pool) {
      try {
        const res = await pool.query(
          `DELETE FROM amatec_store WHERE collection = $1 AND id = $2`,
          [collectionName, id]
        );
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao apagar ${id} em ${collectionName} no Postgres:`, err);
      }
    }
  }

  if (engine === 'turso') {
    const client = getTursoClient();
    if (client) {
      try {
        const res = await client.execute({
          sql: `DELETE FROM amatec_store WHERE collection = ? AND id = ?`,
          args: [collectionName, id],
        });
        return res.rowsAffected > 0;
      } catch (err) {
        console.error(`[Ama Tec DB] Erro ao apagar ${id} em ${collectionName} no Turso:`, err);
      }
    }
  }

  // Filesystem fallback
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

  // Filesystem fallback
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

  // Filesystem fallback
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
