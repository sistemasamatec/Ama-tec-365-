/**
 * Script para atribuir Custom User Claims a um utilizador Firebase Auth:
 * await admin.auth().setCustomUserClaims(UID_DO_ADMIN, { siteRole: 'admin' });
 * 
 * Uso:
 *   npx tsx scripts/set-admin-claim.ts <UID_DO_ADMIN> [admin|gestor]
 *   UID_DO_ADMIN=<uid> npx tsx scripts/set-admin-claim.ts
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const uid = process.argv[2] || process.env.UID_DO_ADMIN;
  const role = (process.argv[3] || process.env.SITE_ROLE || 'admin').toLowerCase();

  if (!uid) {
    console.error('❌ Erro: Forneça o UID do utilizador.');
    console.error('Uso: npx tsx scripts/set-admin-claim.ts <UID_DO_ADMIN> [admin|gestor]');
    process.exit(1);
  }

  if (!['admin', 'gestor'].includes(role)) {
    console.error(`❌ Erro: Papel inválido "${role}". Permitidos: "admin" ou "gestor".`);
    process.exit(1);
  }

  // Obter credenciais Firebase Admin
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.ERP_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.ERP_FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.ERP_FIREBASE_PRIVATE_KEY;

  if (process.env.ERP_FIREBASE_PRIVATE_KEY_B64) {
    try {
      privateKey = Buffer.from(process.env.ERP_FIREBASE_PRIVATE_KEY_B64, 'base64').toString('utf-8');
    } catch {
      // Ignora erro
    }
  }

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const app = getApps().length > 0 
    ? getApps()[0] 
    : initializeApp(
        projectId && clientEmail && privateKey
          ? {
              credential: cert({
                projectId,
                clientEmail,
                privateKey,
              }),
            }
          : {}
      );

  const auth = getAuth(app);

  try {
    console.log(`⏳ A definir custom user claim { siteRole: '${role}' } para o UID: ${uid}...`);
    await auth.setCustomUserClaims(uid, { siteRole: role });
    
    const user = await auth.getUser(uid);
    console.log(`✅ Sucesso! Custom claims atualizadas para ${user.email || uid}:`, user.customClaims);
  } catch (err: any) {
    console.error('❌ Falha ao atribuir custom claims:', err.message || err);
    process.exit(1);
  }
}

main();
