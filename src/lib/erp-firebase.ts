/**
 * ERP Ama Tec 365 / Bukulo Geste — Ligação Firebase Admin Server-Side
 * 
 * Regras:
 * 1. SEGUNDA app Firebase Admin nomeada 'erp', exclusivamente server-side.
 * 2. Variáveis de ambiente lidas de process.env:
 *    - ERP_FIREBASE_PROJECT_ID
 *    - ERP_FIREBASE_CLIENT_EMAIL
 *    - ERP_FIREBASE_PRIVATE_KEY (converte \n em quebras de linha reais)
 *    - ERP_FIRESTORE_DATABASE_ID
 * 3. Usa getFirestore(erpApp, ERP_FIRESTORE_DATABASE_ID).
 * 4. NÃO altera nem remove a ligação Firebase atual do site (mantida em serverless-db.ts).
 * 5. Se alguma das 4 variáveis faltar ou a chave for inválida, retorna erro claro.
 */

import { initializeApp, getApps, cert, type App as FirebaseAdminApp } from 'firebase-admin/app';
import { getFirestore, type Firestore as FirestoreDb } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

// Garante o carregamento de variáveis locais do .env
dotenv.config();

declare global {
  var _amatecErpFirebaseApp: FirebaseAdminApp | undefined;
  var _amatecErpFirestoreDb: FirestoreDb | undefined;
}

export interface ErpFirebaseConfig {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
  databaseId?: string;
  missingVars: string[];
  keyFormatError?: string;
}

export function getErpFirebaseConfig(): ErpFirebaseConfig {
  const projectId = process.env.ERP_FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.ERP_FIREBASE_CLIENT_EMAIL?.trim();
  const b64Key = process.env.ERP_FIREBASE_PRIVATE_KEY_B64?.trim();
  let rawKey: string | undefined;
  if (b64Key) {
    try {
      rawKey = Buffer.from(b64Key, 'base64').toString('utf-8').trim();
    } catch {
      rawKey = undefined;
    }
  } else {
    rawKey = process.env.ERP_FIREBASE_PRIVATE_KEY?.trim();
  }
  const databaseId = process.env.ERP_FIRESTORE_DATABASE_ID?.trim();

  const missingVars: string[] = [];
  if (!projectId) missingVars.push('ERP_FIREBASE_PROJECT_ID');
  if (!clientEmail) missingVars.push('ERP_FIREBASE_CLIENT_EMAIL');
  if (!rawKey) missingVars.push('ERP_FIREBASE_PRIVATE_KEY');
  if (!databaseId) missingVars.push('ERP_FIRESTORE_DATABASE_ID');

  let keyFormatError: string | undefined;
  if (rawKey && !rawKey.includes('BEGIN PRIVATE KEY')) {
    keyFormatError =
      "A variável de chave privada foi configurada com o 'private_key_id' (40 caracteres hex) em vez da chave privada RSA PEM. No ficheiro JSON da Service Account, copie o valor do campo 'private_key' (começa com '-----BEGIN PRIVATE KEY-----' e termina com '-----END PRIVATE KEY-----').";
  }

  // Converte sequências literais '\n' em quebras de linha reais e corrige eventual tradução do footer
  const privateKey = rawKey
    ? rawKey
        .replace(/\\n/g, '\n')
        .replace('-----FIM DA CHAVE PRIVADA-----', '-----END PRIVATE KEY-----')
        .trim()
    : undefined;

  return {
    projectId,
    clientEmail,
    privateKey,
    databaseId,
    missingVars,
    keyFormatError,
  };
}

/**
 * Obtém ou instancia a base de dados Firestore da app Firebase Admin 'erp'
 */
export function getErpFirestoreDb(): FirestoreDb {
  const { projectId, clientEmail, privateKey, databaseId, missingVars, keyFormatError } = getErpFirebaseConfig();

  if (missingVars.length > 0) {
    throw new Error(
      `Variáveis de ambiente do ERP ausentes no servidor: ${missingVars.join(', ')}.`
    );
  }

  if (keyFormatError) {
    throw new Error(keyFormatError);
  }

  if (global._amatecErpFirestoreDb) {
    return global._amatecErpFirestoreDb;
  }

  // Verifica se a app 'erp' já foi inicializada entre invocações hot do runtime
  const existingApps = getApps();
  let erpApp = existingApps.find((app) => app.name === 'erp');

  if (!erpApp) {
    erpApp = initializeApp(
      {
        credential: cert({
          projectId: projectId!,
          clientEmail: clientEmail!,
          privateKey: privateKey!,
        }),
      },
      'erp'
    );
    global._amatecErpFirebaseApp = erpApp;
  }

  // Instancia Firestore para a base de dados nomeada ERP_FIRESTORE_DATABASE_ID
  const db = getFirestore(erpApp, databaseId!);
  global._amatecErpFirestoreDb = db;
  return db;
}
