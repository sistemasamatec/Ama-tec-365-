import { createClient } from '@libsql/client';
import { getFirestoreDb } from '../src/lib/serverless-db';

export default async function handler(req: any, res: any) {
  const send = (code: number, body: any) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
  };
  const key = process.env.MIGRA_KEY;
  const given = new URL(req.url, 'http://x').searchParams.get('key');
  if (!key || given !== key) return send(401, { error: 'Acesso negado' });

  const fs = getFirestoreDb();
  if (!fs) return send(500, { error: 'Firestore indisponível' });

  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
  });
  const { rows } = await turso.execute('SELECT collection, id, data, updated_at FROM amatec_store');

  const skip = new Set(['sessions', '_rate_limits', '_idempotency']);
  const grouped: Record<string, any[]> = {};
  for (const r of rows) {
    const col = String(r.collection);
    if (skip.has(col)) continue;
    (grouped[col] ||= []).push(r);
  }

  const summary: Record<string, any> = {};
  const skippedLarge: any[] = [];
  for (const [col, items] of Object.entries(grouped)) {
    summary[col] = { turso: items.length, firestore: 0, ok: false };
    for (let i = 0; i < items.length; i += 400) {
      const batch = fs.batch();
      for (const r of items.slice(i, i + 400)) {
        const dataStr = String(r.data);
        if (Buffer.byteLength(dataStr) > 900 * 1024) {
          skippedLarge.push({ collection: col, id: String(r.id) });
          continue;
        }
        let parsed: any;
        try { parsed = JSON.parse(dataStr); } catch { parsed = dataStr; }
        const id = String(r.id).replace(/\//g, '_');
        batch.set(fs.collection(col).doc(id), {
          collection: col,
          id: String(r.id),
          data: parsed,
          updated_at: String(r.updated_at),
        });
      }
      await batch.commit();
    }
    const n = (await fs.collection(col).count().get()).data().count;
    summary[col].firestore = n;
    summary[col].ok = n === items.length;
  }
  return send(200, { summary, skippedLarge });
      }
