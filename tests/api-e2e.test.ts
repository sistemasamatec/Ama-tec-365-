import assert from 'assert';
import http from 'http';
import apiDispatcher from '../api/index';

console.log('🧪 Iniciando Testes de Integração e Ciclo de Vida da API do Painel Admin...');

// Helper para simular pedidos HTTP reais através do dispatcher
function request(
  method: string,
  url: string,
  body?: any,
  cookies?: string
): Promise<{ status: number; headers: Record<string, string | string[]>; data: any; raw: string }> {
  return new Promise((resolve) => {
    const rawBody = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : '';

    const req: any = new http.IncomingMessage({} as any);
    req.method = method;
    req.url = url;
    req.headers = {
      host: 'localhost:3000',
      'user-agent': 'TestAgent/1.0',
      'x-forwarded-for': '127.0.0.1',
    };
    if (body) {
      req.headers['content-type'] = 'application/json';
      req.body = typeof body === 'object' ? body : JSON.parse(body);
    }
    if (cookies) {
      req.headers.cookie = cookies;
    }

    const resHeaders: Record<string, string | string[]> = {};
    let resData = '';

    const res: any = {
      statusCode: 200,
      setHeader: (name: string, value: string | string[]) => {
        resHeaders[name.toLowerCase()] = value;
      },
      getHeader: (name: string) => resHeaders[name.toLowerCase()],
      end: (chunk?: any) => {
        if (chunk) resData += chunk.toString();
        let parsed: any = null;
        try {
          parsed = JSON.parse(resData);
        } catch {
          parsed = resData;
        }
        resolve({
          status: res.statusCode,
          headers: resHeaders,
          data: parsed,
          raw: resData,
        });
      },
    };

    apiDispatcher(req, res);
  });
}

async function runApiTests() {
  // 1. Teste de Acesso Sem Autenticação
  console.log('1. Testando proteção de rotas restritas sem sessão...');
  const unauthMe = await request('GET', '/api/admin/me');
  assert.strictEqual(unauthMe.status, 401, 'Rota /api/admin/me sem cookie deve retornar 401');

  const unauthServices = await request('GET', '/api/admin/services');
  assert.strictEqual(unauthServices.status, 401, 'Rota /api/admin/services sem cookie deve retornar 401');

  // 2. Teste de Login Inválido
  console.log('2. Testando tentativa de login com credenciais incorretas...');
  const wrongLogin = await request('POST', '/api/admin/login', {
    email: 'josuefranciscojaime@gmail.com',
    password: 'PalavraPasseCompletamenteErrada',
  });
  assert.strictEqual(wrongLogin.status, 401, 'Login errado deve retornar 401');

  // 3. Teste de Login Válido e Cookie httpOnly
  console.log('3. Testando login oficial do administrador (Josué) e geração de cookie...');
  const validLogin = await request('POST', '/api/admin/login', {
    email: 'josuefranciscojaime@gmail.com',
    password: 'AmaTec#2026!Golf2',
  });
  assert.strictEqual(validLogin.status, 200, 'Login correto deve retornar 200');
  assert.ok(validLogin.data.success, 'Resposta de login deve indicar sucesso');

  const setCookie = validLogin.headers['set-cookie'];
  assert.ok(setCookie, 'Deve definir cabeçalho Set-Cookie');
  const cookieString = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
  assert.ok(cookieString.includes('HttpOnly'), 'Cookie deve ter flag HttpOnly');
  assert.ok(cookieString.includes('amatec_admin_session='), 'Cookie deve conter token de sessão');

  const sessionMatch = cookieString.match(/amatec_admin_session=([^;]+)/);
  const sessionCookie = sessionMatch ? `amatec_admin_session=${sessionMatch[1]}` : '';

  // 4. Teste de Verificação de Sessão (/api/admin/me) com Cookie
  console.log('4. Testando validação de sessão ativa (/api/admin/me)...');
  const authMe = await request('GET', '/api/admin/me', null, sessionCookie);
  assert.strictEqual(authMe.status, 200);
  assert.strictEqual(authMe.data.authenticated, true);
  assert.strictEqual(authMe.data.user.email, 'josuefranciscojaime@gmail.com');
  assert.strictEqual(authMe.data.user.role, 'admin');

  // 5. Teste de CRUD de Serviços via API
  console.log('5. Testando ciclo completo de CRUD de serviços (Criar, Editar, Publicar, Arquivar)...');
  const testServiceName = `Serviço Integração API ${Date.now()}`;
  const createServiceRes = await request(
    'POST',
    '/api/admin/services',
    {
      name: testServiceName,
      category: 'industrial',
      categoryName: 'Industrial e Comercial',
      shortDescription: 'Reparação de motores elétricos e quadros',
      fullDescription: 'Intervenção técnica realizada no Golf 2.',
      status: 'published',
    },
    sessionCookie
  );
  assert.strictEqual(createServiceRes.status, 201, 'Criação de serviço deve retornar 201');
  const createdId = createServiceRes.data.id;
  assert.ok(createdId, 'Serviço criado deve conter ID');

  // Consulta da lista de serviços no admin
  const adminServices = await request('GET', '/api/admin/services', null, sessionCookie);
  assert.strictEqual(adminServices.status, 200);
  assert.ok(adminServices.data.some((s: any) => s.id === createdId));

  // Edição do serviço
  const editServiceRes = await request(
    'PUT',
    `/api/admin/services/${createdId}`,
    {
      ...createServiceRes.data,
      shortDescription: 'Descrição editada via API REST',
    },
    sessionCookie
  );
  assert.strictEqual(editServiceRes.status, 200);
  assert.strictEqual(editServiceRes.data.shortDescription, 'Descrição editada via API REST');

  // Arquivamento do serviço
  const archiveServiceRes = await request(
    'PATCH',
    `/api/admin/services/${createdId}?action=archive`,
    null,
    sessionCookie
  );
  assert.strictEqual(archiveServiceRes.status, 200);

  // Verificação na rota pública (serviço arquivado não deve aparecer publicamente)
  const publicServices = await request('GET', '/api/public/services');
  assert.strictEqual(publicServices.status, 200);
  assert.strictEqual(
    publicServices.data.some((s: any) => s.id === createdId),
    false,
    'Serviço arquivado não pode ser retornado na API pública'
  );

  // 6. Teste de Configurações, Redes Sociais e Google Maps
  console.log('6. Testando atualização de configurações, redes sociais e Google Maps...');
  const updateSettingsRes = await request(
    'PUT',
    '/api/admin/settings',
    {
      socialLinks: {
        facebook: 'https://facebook.com/amatec.ao',
        instagram: 'https://instagram.com/amatec.ao',
        whatsappBusiness: '+244930372597',
      },
      googleMaps: {
        embedUrl: 'https://www.google.com/maps/embed?pb=teste',
        mapLink: 'https://maps.google.com/?q=-8.8893,13.2384',
        coordinates: { lat: -8.8893, lng: 13.2384 },
      },
      visualIdentity: {
        brandColor: '#0284c7',
      },
    },
    sessionCookie
  );
  assert.strictEqual(updateSettingsRes.status, 200);

  const publicSettings = await request('GET', '/api/public/settings');
  assert.strictEqual(publicSettings.status, 200);
  assert.strictEqual(publicSettings.data.socialLinks.facebook, 'https://facebook.com/amatec.ao');
  assert.strictEqual(publicSettings.data.googleMaps.coordinates.lat, -8.8893);

  // 7. Teste de Upload e Reversão de Logotipo
  console.log('7. Testando upload com validação e reversão de logotipo...');
  const validSvg = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="50" height="50"/></svg>';
  const uploadRes = await request(
    'POST',
    '/api/admin/upload-logo',
    {
      data: Buffer.from(validSvg).toString('base64'),
      mimeType: 'image/svg+xml',
      fileName: 'novo-logo.svg',
    },
    sessionCookie
  );
  assert.strictEqual(uploadRes.status, 200);
  assert.ok(uploadRes.data.logoUrl.startsWith('/brand/uploads/logo-'));

  // Reversão para logotipo original
  const revertRes = await request(
    'POST',
    '/api/admin/revert-logo',
    { targetUrl: '/brand/logo.svg' },
    sessionCookie
  );
  assert.strictEqual(revertRes.status, 200);

  // 8. Teste de Gestão de Depoimentos Reais
  console.log('8. Testando adição de depoimento real de cliente...');
  const testTestimonialRes = await request(
    'POST',
    '/api/admin/testimonials',
    {
      name: 'Dr. Francisco Manuel',
      location: 'Golf 2, Luanda',
      equipment: 'Smart TV LG 65',
      text: 'Excelente atendimento em bancada e garantia escrita cumprida rigorosamente.',
      rating: 5,
    },
    sessionCookie
  );
  assert.strictEqual(testTestimonialRes.status, 201);

  const publicTestimonials = await request('GET', '/api/public/testimonials');
  assert.strictEqual(publicTestimonials.status, 200);
  assert.ok(publicTestimonials.data.some((t: any) => t.name === 'Dr. Francisco Manuel'));

  // 9. Teste de Exportação CSV e Backups
  console.log('9. Testando geração de cópia de segurança (backup) e exportação de CSV...');
  const backupRes = await request('POST', '/api/admin/backups', null, sessionCookie);
  assert.strictEqual(backupRes.status, 201);
  assert.ok(backupRes.data.filename.startsWith('amatec-backup-'));

  const csvRes = await request('GET', '/api/admin/leads/export-csv', null, sessionCookie);
  assert.strictEqual(csvRes.status, 200);
  assert.strictEqual(csvRes.headers['content-type'], 'text/csv; charset=utf-8');

  // 10. Teste de Logout
  console.log('10. Testando logout seguro e invalidação de sessão...');
  const logoutRes = await request('POST', '/api/admin/logout', null, sessionCookie);
  assert.strictEqual(logoutRes.status, 200);

  const meAfterLogout = await request('GET', '/api/admin/me', null, sessionCookie);
  assert.strictEqual(meAfterLogout.status, 401, 'Sessão após logout deve estar invalidada');

  console.log('\n🎉 TODOS OS TESTES DE INTEGRAÇÃO DA API PASSARAM COM SUCESSO (10/10)!');
}

runApiTests().catch((err) => {
  console.error('❌ Falha nos testes de integração da API:', err);
  process.exit(1);
});
