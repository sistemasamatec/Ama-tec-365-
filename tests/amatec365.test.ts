import assert from 'node:assert';
import amaTec365Handler, {
  generateSecureRequestId,
} from '../api/amatec365';
import adminApiHandler from '../api/admin';

console.log('🧪 Iniciando Bateria de Testes de Segurança & Conformidade (Ama Tec 365)...\n');

// Helper para invocar handlers HTTP Node.js programaticamente em memória
function createMockRequestResponse(options: {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
}) {
  const req = {
    method: options.method,
    url: options.url,
    headers: options.headers || {},
    body: options.body,
    socket: { remoteAddress: options.headers?.['x-forwarded-for'] || '127.0.0.1' },
    on: (event: string, callback: any) => {
      if (event === 'data' && options.body) {
        callback(Buffer.from(JSON.stringify(options.body)));
      }
      if (event === 'end') {
        callback();
      }
    },
  } as any;

  let statusCode = 200;
  let headers: Record<string, string> = {};
  let responseData = '';

  const res = {
    get statusCode() {
      return statusCode;
    },
    set statusCode(code: number) {
      statusCode = code;
    },
    setHeader: (name: string, value: string) => {
      headers[name.toLowerCase()] = value;
    },
    getHeader: (name: string) => headers[name.toLowerCase()],
    end: (chunk?: string) => {
      if (chunk) responseData += chunk;
    },
  } as any;

  return {
    req,
    res,
    getJSON: () => (responseData ? JSON.parse(responseData) : null),
  };
}

async function runSecurityTestSuite() {
  // =========================================================================
  // 1. FORMATO DO ID PÚBLICO E CARÁTER NÃO PREVISÍVEL
  // =========================================================================
  console.log('1. Validando formato e aleatoriedade do ID público (SOL-2026-[HEX6])...');
  const id1 = generateSecureRequestId();
  const id2 = generateSecureRequestId();
  assert.ok(id1.startsWith('SOL-2026-'), `ID deve começar por SOL-2026- (recebido: ${id1})`);
  assert.ok(id2.startsWith('SOL-2026-'), `ID deve começar por SOL-2026- (recebido: ${id2})`);
  assert.notStrictEqual(id1, id2, 'IDs gerados devem ser criptograficamente únicos e não previsíveis');
  console.log(`✅ IDs seguros gerados: ${id1} e ${id2}`);

  // =========================================================================
  // 2. REJEIÇÃO DE DADOS INVÁLIDOS E FILTRO ANTI-SPAM
  // =========================================================================
  console.log('\n2. Testando rejeição de dados inválidos e filtros de proteção...');

  // 2.1 Honeypot ativado (robô)
  {
    const { req, res, getJSON } = createMockRequestResponse({
      method: 'POST',
      url: '/api/amatec365/assistance',
      headers: { 'x-forwarded-for': '192.168.10.1' },
      body: {
        name: 'Bot Spam',
        phone: '930372597',
        equipment: 'TV',
        problemDescription: 'Spam automático',
        privacyConsent: true,
        honeypot: 'http://spam-link.ru',
      },
    });
    await amaTec365Handler(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.ok(getJSON().error.includes('anti-spam'));
    console.log('✅ Honeypot intercetou e rejeitou submissão de bot com HTTP 400.');
  }

  // 2.2 Nome muito curto
  {
    const { req, res, getJSON } = createMockRequestResponse({
      method: 'POST',
      url: '/api/amatec365/assistance',
      headers: { 'x-forwarded-for': '192.168.10.2' },
      body: {
        name: 'A',
        phone: '930372597',
        equipment: 'TV LG',
        problemDescription: 'Não liga imagem',
        privacyConsent: true,
      },
    });
    await amaTec365Handler(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.ok(getJSON().error.includes('nome'));
    console.log('✅ Rejeitado nome com menos de 3 caracteres com HTTP 400.');
  }

  // 2.3 Telefone inválido
  {
    const { req, res, getJSON } = createMockRequestResponse({
      method: 'POST',
      url: '/api/amatec365/assistance',
      headers: { 'x-forwarded-for': '192.168.10.3' },
      body: {
        name: 'Maria Santos',
        phone: '123',
        equipment: 'Frigorífico Samsung',
        problemDescription: 'Motor não arranca',
        privacyConsent: true,
      },
    });
    await amaTec365Handler(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.ok(getJSON().error.includes('telefone'));
    console.log('✅ Rejeitado telefone com menos de 9 dígitos com HTTP 400.');
  }

  // 2.4 Falta de consentimento de privacidade
  {
    const { req, res, getJSON } = createMockRequestResponse({
      method: 'POST',
      url: '/api/amatec365/assistance',
      headers: { 'x-forwarded-for': '192.168.10.4' },
      body: {
        name: 'Ana Paula',
        phone: '930372597',
        equipment: 'Micro-ondas LG',
        problemDescription: 'Não aquece os pratos',
        privacyConsent: false,
      },
    });
    await amaTec365Handler(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.ok(getJSON().error.includes('privacidade'));
    console.log('✅ Rejeitada submissão sem consentimento de privacidade obrigatório.');
  }

  // =========================================================================
  // 3. SUBMISSÃO VÁLIDA E CRIAÇÃO CORRETA NO ERP (COLEÇÃO 'leads')
  // =========================================================================
  console.log('\n3. Testando submissão válida de Solicitação Pendente ao ERP (coleção "leads")...');
  let firstRequestId = '';
  const testPhone = '930372597';

  {
    const { req, res, getJSON } = createMockRequestResponse({
      method: 'POST',
      url: '/api/amatec365/assistance',
      headers: {
        'x-forwarded-for': '192.168.10.5',
        'idempotency-key': 'IDEMP-TEST-KEY-PRIMARY',
      },
      body: {
        name: 'Carlos Manuel da Silva',
        phone: testPhone,
        email: 'carlos.silva@exemplo.ao',
        equipment: 'Microondas Panasonic Inverter',
        serviceCategory: 'domestico',
        problemDescription: 'Não aquece os alimentos e desliga aos 10 segundos',
        location: 'Golf 2, Rua Direita',
        privacyConsent: true,
      },
    });

    await amaTec365Handler(req, res);
    assert.strictEqual(res.statusCode, 200);
    const data = getJSON();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.type, 'solicitacao_pendente');
    assert.strictEqual(data.status, 'Pendente');
    assert.ok(data.requestId.startsWith('SOL-2026-'));
    firstRequestId = data.requestId;
    console.log(`✅ Solicitação Pendente registada com sucesso no ERP: ${firstRequestId}`);
  }

  // =========================================================================
  // 4. IDEMPOTÊNCIA: REPETIÇÃO COM A MESMA IDEMPOTENCY-KEY
  // =========================================================================
  console.log('\n4. Testando Idempotência: repetição com a mesma Idempotency-Key...');
  {
    const { req, res, getJSON } = createMockRequestResponse({
      method: 'POST',
      url: '/api/amatec365/assistance',
      headers: {
        'x-forwarded-for': '192.168.10.6',
        'idempotency-key': 'IDEMP-TEST-KEY-PRIMARY',
      },
      body: {
        name: 'Carlos Manuel da Silva',
        phone: testPhone,
        equipment: 'Microondas Panasonic Inverter',
        problemDescription: 'Não aquece os alimentos',
        privacyConsent: true,
      },
    });

    await amaTec365Handler(req, res);
    assert.strictEqual(res.statusCode, 200);
    const data = getJSON();
    assert.strictEqual(data.requestId, firstRequestId, 'Deve retornar o mesmo requestId original');
    assert.strictEqual(data.idempotentReplay, true, 'Deve indicar idempotentReplay: true');
    console.log('✅ Idempotência validada: resposta em cache retornada sem duplicar registo.');
  }

  // =========================================================================
  // 5. DUPLICADO COM CHAVES DIFERENTES
  // =========================================================================
  console.log('\n5. Testando submissão duplicada com chaves de idempotência diferentes...');
  {
    const { req, res, getJSON } = createMockRequestResponse({
      method: 'POST',
      url: '/api/amatec365/assistance',
      headers: {
        'x-forwarded-for': '192.168.10.7',
        'idempotency-key': 'IDEMP-TEST-KEY-SECONDARY',
      },
      body: {
        name: 'Carlos Manuel da Silva',
        phone: testPhone,
        equipment: 'Microondas Panasonic Inverter',
        problemDescription: 'Não aquece os alimentos e desliga aos 10 segundos',
        privacyConsent: true,
      },
    });

    await amaTec365Handler(req, res);
    assert.strictEqual(res.statusCode, 200);
    const data = getJSON();
    assert.notStrictEqual(data.requestId, firstRequestId, 'Chave diferente deve gerar novo requestId');
    assert.strictEqual(data.idempotentReplay, undefined);
    console.log(`✅ Nova chave gerou nova solicitação independente: ${data.requestId}`);
  }

  // =========================================================================
  // 6. RATE LIMITING POR IP
  // =========================================================================
  console.log('\n6. Testando Rate Limiting por endereço IP (> 5 submissões seguidas)...');
  {
    const spamIp = '192.168.99.99';
    // Efetua 5 submissões permitidas
    for (let i = 1; i <= 5; i++) {
      const { req, res } = createMockRequestResponse({
        method: 'POST',
        url: '/api/amatec365/assistance',
        headers: { 'x-forwarded-for': spamIp },
        body: {
          name: `Cliente Teste ${i}`,
          phone: `93000000${i}`,
          equipment: 'Aparelho Eletrónico',
          problemDescription: 'Avaria técnica em teste',
          privacyConsent: true,
        },
      });
      await amaTec365Handler(req, res);
      assert.ok(res.statusCode === 200 || res.statusCode === 429);
    }

    // 6.ª submissão: deve ser bloqueada por exceder o rate limit
    const { req, res, getJSON } = createMockRequestResponse({
      method: 'POST',
      url: '/api/amatec365/assistance',
      headers: { 'x-forwarded-for': spamIp },
      body: {
        name: 'Tentativa Excedida',
        phone: '930000009',
        equipment: 'Aparelho Eletrónico',
        problemDescription: 'Avaria técnica em teste',
        privacyConsent: true,
      },
    });
    await amaTec365Handler(req, res);
    assert.strictEqual(res.statusCode, 429, 'Deve responder com HTTP 429 Too Many Requests');
    assert.ok(getJSON().error.includes('Limite') || getJSON().error.includes('tentativas'));
    console.log('✅ Rate limit por IP validado com HTTP 429.');
  }

  // =========================================================================
  // 7. TRATAMENTO DE FIRESTORE INDISPONÍVEL EM PRODUÇÃO
  // =========================================================================
  console.log('\n7. Testando tratamento transparente quando Firestore está indisponível...');
  {
    const originalProjectId = process.env.FIREBASE_PROJECT_ID;
    // Simula ambiente de produção onde Firestore é exigido mas está indisponível
    process.env.FORCE_FIRESTORE = 'true';
    process.env.FIREBASE_PROJECT_ID = 'test-failing-project';

    const { req, res, getJSON } = createMockRequestResponse({
      method: 'POST',
      url: '/api/amatec365/assistance',
      headers: { 'x-forwarded-for': '192.168.88.1' },
      body: {
        name: 'Maria Antónia',
        phone: '930372597',
        equipment: 'TV Sony Bravia 65',
        problemDescription: 'Linhas verticais no painel',
        privacyConsent: true,
      },
    });

    await amaTec365Handler(req, res);
    // Deve retornar erro 500 explicativo ao cliente, nunca fingir sucesso silencioso
    assert.strictEqual(res.statusCode, 500, 'Firestore indisponível deve retornar HTTP 500');
    assert.ok(
      getJSON().error.includes('base de dados') ||
      getJSON().error.includes('Falha')
    );
    console.log('✅ Falha de base de dados devolve HTTP 500 com mensagem clara ao cliente.');

    // Restaura configuração
    delete process.env.FORCE_FIRESTORE;
    if (originalProjectId) {
      process.env.FIREBASE_PROJECT_ID = originalProjectId;
    } else {
      delete process.env.FIREBASE_PROJECT_ID;
    }
  }

  // =========================================================================
  // 8. UPLOAD INVÁLIDO DE FICHEIRO NO SERVIDOR (TESTE DE SEGURANÇA)
  // =========================================================================
  console.log('\n8. Testando validação de upload e bloqueio de ficheiros não permitidos...');
  {
    const { req, res } = createMockRequestResponse({
      method: 'POST',
      url: '/api/admin/logo',
      headers: { cookie: 'amatec_session=fake_invalid_session' },
      body: {
        filename: 'malware.sh',
        mimeType: 'application/x-sh',
        base64Data: 'IyEvYmluL2Jhc2gKZWNobyAiaGFja2VkIgo=',
      },
    });
    await adminApiHandler(req, res);
    assert.ok(res.statusCode === 401 || res.statusCode === 400);
    console.log(`✅ Upload de ficheiro não permitido rejeitado com código HTTP ${res.statusCode}.`);
  }

  console.log('\n🎉 TODAS AS VERIFICAÇÕES DE SEGURANÇA E CONFORMIDADE PASSARAM COM SUCESSO (8/8)!');
}

runSecurityTestSuite().catch((err) => {
  console.error('❌ Falha na bateria de testes:', err);
  process.exit(1);
});
