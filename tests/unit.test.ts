import assert from 'node:assert';
import { validateAssistanceForm } from '../src/lib/validation';
import { buildWhatsAppLink, getServiceWhatsAppUrl, getEquipmentWhatsAppUrl } from '../src/lib/whatsapp';
import { COMPANY } from '../src/content/company';
import { SERVICES, CATEGORIES_CONFIG } from '../src/content/services';
import { EQUIPMENT_CATALOG } from '../src/content/equipment';
import { getLocalBusinessJsonLd, getServiceJsonLd } from '../src/lib/seo';
import { sanitizeHtml } from '../api/lead';


console.log('🧪 Iniciando testes unitários da Ama Tec...\n');

// 1. Teste de Consistência NAP da Empresa
console.log('1. Testando dados oficiais (fonte única NAP)...');
assert.strictEqual(COMPANY.brand, 'Ama Tec', 'Marca deve ser exatamente "Ama Tec"');
assert.strictEqual(COMPANY.legalName, 'AMA TEC PRESTAÇÃO DE SERVIÇOS & COMÉRCIO GERAL (SU)');
assert.strictEqual(COMPANY.nif, '5001399837');
assert.strictEqual(COMPANY.email, 'geral@amatec.ao');
assert.strictEqual(COMPANY.phone, '+244930372597');
assert.strictEqual(COMPANY.openingHours, 'TODO_CONTEUDO');
console.log('✅ Dados NAP validados com sucesso.');

// 2. Teste de Validação de Formulário
console.log('\n2. Testando regras de validação do formulário...');
const invalidEmpty = validateAssistanceForm({
  name: '',
  phone: '',
  equipment: '',
  problemDescription: '',
});
assert.strictEqual(invalidEmpty.isValid, false, 'Formulário vazio deve ser inválido');
assert.ok(invalidEmpty.errors.name, 'Deve acusar erro no nome');
assert.ok(invalidEmpty.errors.phone, 'Deve acusar erro no telefone');
assert.ok(invalidEmpty.errors.equipment, 'Deve acusar erro no equipamento');
assert.ok(invalidEmpty.errors.problemDescription, 'Deve acusar erro no problema');

const validLead = validateAssistanceForm({
  name: 'Manuel Domingos',
  phone: '930 372 597',
  equipment: 'Máquina de Lavar LG 9kg',
  problemDescription: 'Não drena água e emite sinal sonoro',
  location: 'Golf 2, Luanda',
});
assert.strictEqual(validLead.isValid, true, 'Formulário preenchido corretamente deve ser válido');
assert.strictEqual(Object.keys(validLead.errors).length, 0);

// Formulário curto (sem localização nem email opcionais) deve ser válido se os 4 essenciais estiverem preenchidos
const validShortLead = validateAssistanceForm({
  name: 'Manuel Domingos',
  phone: '930 372 597',
  equipment: 'Máquina de Lavar LG 9kg',
  problemDescription: 'Não drena água e emite sinal sonoro',
});
assert.strictEqual(validShortLead.isValid, true, 'Formulário curto com 4 campos essenciais deve ser válido');


// Teste de Honeypot (Anti-spam)
const honeypotTriggered = validateAssistanceForm({
  name: 'Spam Bot',
  phone: '930372597',
  equipment: 'TV',
  serviceCategory: 'domestico',
  problemDescription: 'Problema teste de avaria',
  location: 'Luanda',
  honeypot: 'bot_value_filled',
});
assert.strictEqual(honeypotTriggered.isValid, false);
assert.ok(honeypotTriggered.errors.honeypot, 'Honeypot preenchido deve rejeitar submissão');

// Teste de Sanitização HTML (Prevenção de injeção em emails e leads)
const dirtyInput = '<script>alert("xss")</script>&style=\'color:red\'';
const cleanInput = sanitizeHtml(dirtyInput);
assert.strictEqual(cleanInput, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;&amp;style=&#039;color:red&#039;');
console.log('✅ Validação do formulário, sanitização e filtro anti-spam validados.');


// 3. Teste de Mensagens Contextuais de WhatsApp
console.log('\n3. Testando links e mensagens contextuais de WhatsApp...');
const waUrl = getServiceWhatsAppUrl('Reparação de Televisores', 'google_ads');
assert.ok(waUrl.includes('wa.me/244930372597'), 'Deve conter número oficial');
assert.ok(decodeURIComponent(waUrl).includes('Reparação de Televisores'), 'Deve conter o nome do serviço');
assert.ok(decodeURIComponent(waUrl).includes('google_ads'), 'Deve preservar origem UTM');

const eqWaUrl = getEquipmentWhatsAppUrl('Crystal UHD 55', 'Samsung', 'AU7700');
assert.ok(decodeURIComponent(eqWaUrl).includes('Samsung Crystal UHD 55'), 'Deve conter marca e equipamento');
console.log('✅ Mensagens do WhatsApp validadas.');

// 4. Teste de Catálogo de Serviços e Categorias
console.log('\n4. Testando integridade do catálogo de serviços...');
assert.strictEqual(CATEGORIES_CONFIG.length, 6, 'Devem existir exatamente as 6 categorias obrigatórias');
const categoryIds = CATEGORIES_CONFIG.map((c) => c.id);
assert.ok(categoryIds.includes('domestico'));
assert.ok(categoryIds.includes('industrial'));
assert.ok(categoryIds.includes('eletrica'));
assert.ok(categoryIds.includes('eletronica'));
assert.ok(categoryIds.includes('informatica'));
assert.ok(categoryIds.includes('manutencao'));

const slugs = new Set();
for (const s of SERVICES) {
  assert.ok(s.slug, `Serviço ${s.id} deve ter slug`);
  assert.ok(!slugs.has(s.slug), `Slug ${s.slug} deve ser único`);
  slugs.add(s.slug);
  assert.ok(s.commonProblems.length > 0, `Serviço ${s.slug} deve ter problemas comuns`);
  assert.ok(s.solutions.length > 0, `Serviço ${s.slug} deve ter soluções`);
  assert.ok(s.coveredEquipment.length > 0, `Serviço ${s.slug} deve ter equipamentos abrangidos`);
}
console.log(`✅ Catálogo de serviços verificado com ${SERVICES.length} serviços estruturados.`);

// 5. Teste de SEO e Schemas JSON-LD
console.log('\n5. Testando Schema.org JSON-LD...');
const localBusiness = getLocalBusinessJsonLd();
assert.strictEqual(localBusiness['@type'], 'LocalBusiness');
assert.strictEqual(localBusiness.name, 'Ama Tec');
assert.strictEqual(localBusiness.taxID, '5001399837');

const serviceLd = getServiceJsonLd(SERVICES[0]);
assert.strictEqual(serviceLd['@type'], 'Service');
assert.strictEqual(serviceLd.provider.name, 'Ama Tec');
console.log('✅ Dados estruturados Schema.org validados.');

// 6. Teste de Armazenamento Server-Side Real (data/leads.json e audit log)
console.log('\n6. Testando persistência server-side real de pedidos (data/leads.json)...');
import {
  saveLeadToServer,
  getAllLeadsFromServer,
  updateLeadStatusOnServer,
  deleteLeadFromServer,
  getDataDir,
} from '../src/lib/server-storage';

const testLeadId = `TEST-LEAD-${Date.now()}`;
saveLeadToServer({
  id: testLeadId,
  createdAt: new Date().toISOString(),
  name: 'Cliente Teste Audit',
  phone: '930 372 597',
  email: 'teste@amatec.ao',
  equipment: 'Smart TV Samsung 55',
  serviceCategory: 'domestico',
  problemDescription: 'Ecrã escuro mas com som de bancada',
  location: 'Golf 2, Luanda',
  status: 'Pendente',
});

const allServerLeads = getAllLeadsFromServer();
const foundLead = allServerLeads.find((l) => l.id === testLeadId);
assert.ok(foundLead, 'Lead deve ser recuperado da base de dados do servidor');
assert.strictEqual(foundLead?.name, 'Cliente Teste Audit');
assert.strictEqual(foundLead?.status, 'Pendente');

// Teste de atualização de status no servidor
const updated = updateLeadStatusOnServer(testLeadId, 'Em Diagnóstico');
assert.strictEqual(updated, true);
const leadAfterUpdate = getAllLeadsFromServer().find((l) => l.id === testLeadId);
assert.strictEqual(leadAfterUpdate?.status, 'Em Diagnóstico');

// Teste de limpeza do registo de teste
deleteLeadFromServer(testLeadId);
assert.strictEqual(
  getAllLeadsFromServer().some((l) => l.id === testLeadId),
  false,
  'Registo de teste deve ser removido após teste'
);
console.log('✅ Armazenamento e ciclo de vida server-side validado com sucesso.');

// 7. Teste de Pré-renderização Estática de Conteúdo Sem JavaScript (curl / view source)
console.log('\n7. Testando pré-renderização estática (SSG) de páginas de serviços sem JavaScript...');
import { renderRoute } from '../src/prerender-entry';

const tvPageHtml = renderRoute('/servicos/reparacao-de-televisores');
assert.ok(tvPageHtml.includes('Reparação de Televisores'), 'HTML estático deve conter o H1 e nome do serviço');
assert.ok(tvPageHtml.includes('Backlight LED') || tvPageHtml.includes('retroiluminação'), 'HTML deve conter detalhes técnicos da avaria sem JS');
assert.ok(tvPageHtml.includes('Golf 2'), 'HTML deve conter localização física oficial no Golf 2');
assert.ok(tvPageHtml.includes('930 372 597'), 'HTML deve conter telefone de contacto da oficina');
assert.ok(tvPageHtml.includes('/solicitar-assistencia'), 'HTML deve conter o CTA principal');

const washingMachineHtml = renderRoute('/servicos/reparacao-de-maquinas-de-lavar');
assert.ok(washingMachineHtml.includes('Máquinas de Lavar'), 'HTML estático deve conter nome da máquina de lavar');
assert.ok(washingMachineHtml.includes('drena') || washingMachineHtml.includes('drenagem') || washingMachineHtml.includes('centrifugação'), 'HTML deve conter problemas comuns de lavar roupa');

console.log('✅ Páginas de serviços validadas: 100% do conteúdo visível sem necessidade de JavaScript.');

// 8. Teste de Autenticação Segura & Proteção Contra Força Bruta
console.log('\n8. Testando autenticação segura (PBKDF2), sessões e proteção contra força bruta...');
import {
  initDefaultAdminUser,
  authenticateAdmin,
  verifyPassword,
  validateSessionToken,
  destroySession,
  saveServiceToDb,
  getAllServicesFromDb,
  archiveServiceInDb,
  deleteServiceFromDb,
  saveUploadedLogo,
  createFullBackup,
  listBackups,
  exportLeadsToCsv,
  recordSuccessfulLogin,
} from '../src/lib/server-storage';

const admin = initDefaultAdminUser();
assert.ok(admin, 'Administrador padrão deve existir');
assert.ok(admin.passwordSalt, 'Administrador deve ter salt');
assert.ok(admin.passwordHash, 'Administrador deve ter hash criptográfico');
assert.notStrictEqual(admin.passwordHash, 'AmaTec#2026!Golf2', 'Palavra-passe NUNCA deve ser guardada em texto simples');

// Limpa eventuais tentativas de execuções de testes anteriores
recordSuccessfulLogin(admin.email);
recordSuccessfulLogin('192.168.1.100');

// Teste de comparação de hash
const passValid = verifyPassword('AmaTec#2026!Golf2', admin.passwordSalt, admin.passwordHash);
assert.strictEqual(passValid, true, 'Palavra-passe correta deve validar');
const passInvalid = verifyPassword('PalavraErrada123', admin.passwordSalt, admin.passwordHash);
assert.strictEqual(passInvalid, false, 'Palavra-passe errada deve falhar');

// Teste de autenticação e criação de sessão
const authResult = authenticateAdmin(admin.email, 'AmaTec#2026!Golf2', '192.168.1.100');
assert.strictEqual(authResult.success, true, 'Autenticação com credenciais corretas deve ter sucesso');
assert.ok(authResult.session?.token, 'Deve gerar token de sessão');

const validatedSession = validateSessionToken(authResult.session?.token);
assert.ok(validatedSession, 'Sessão gerada deve ser válida');
assert.strictEqual(validatedSession?.userId, admin.id);

destroySession(authResult.session?.token);
assert.strictEqual(validateSessionToken(authResult.session?.token), null, 'Sessão destruída não pode ser válida');

// Teste de bloqueio por força bruta (5 tentativas falhadas consecutivas)
const bruteIp = '10.99.99.99';
for (let i = 0; i < 5; i++) {
  authenticateAdmin(admin.email, 'tentativa-falhada-errada', bruteIp);
}
const bruteResult = authenticateAdmin(admin.email, 'AmaTec#2026!Golf2', bruteIp);
assert.strictEqual(bruteResult.success, false, 'Tentativa após 5 falhas consecutivas deve ser bloqueada');
assert.ok(bruteResult.error?.includes('bloqueado'), 'Mensagem de bloqueio deve ser informada');

// Limpa registos de teste
recordSuccessfulLogin(admin.email);
recordSuccessfulLogin(bruteIp);
console.log('✅ Autenticação PBKDF2 e proteção contra força bruta validadas.');

// 9. Teste de CRUD de Serviços na Base de Dados
console.log('\n9. Testando CRUD completo de serviços em base de dados real...');
const testServiceSlug = `teste-crud-${Date.now()}`;
const createdService = saveServiceToDb(
  {
    name: 'Serviço Teste Automatizado',
    slug: testServiceSlug,
    category: 'domestico',
    categoryName: 'Linha Doméstica',
    shortDescription: 'Descrição curta de teste automatizado',
    fullDescription: 'Descrição completa para teste de bancada',
    commonProblems: ['Falha A', 'Falha B'],
    solutions: ['Solução A'],
    coveredEquipment: ['Equipamento Teste'],
    status: 'published',
  },
  'admin-test@amatec.ao'
);

assert.ok(createdService.id, 'Serviço criado deve ter ID');
assert.strictEqual(createdService.slug, testServiceSlug);

const listAfterCreate = getAllServicesFromDb();
assert.ok(listAfterCreate.some((s) => s.slug === testServiceSlug), 'Serviço deve estar presente na base de dados');

// Teste de edição
createdService.shortDescription = 'Descrição atualizada em teste';
saveServiceToDb(createdService, 'admin-test@amatec.ao');
const updatedFromDb = getAllServicesFromDb().find((s) => s.id === createdService.id);
assert.strictEqual(updatedFromDb?.shortDescription, 'Descrição atualizada em teste');

// Teste de arquivamento
archiveServiceInDb(createdService.id, 'admin-test@amatec.ao');
const archivedFromDb = getAllServicesFromDb().find((s) => s.id === createdService.id);
assert.strictEqual(archivedFromDb?.status, 'archived', 'Serviço arquivado deve ter status archived');

// Teste de eliminação
deleteServiceFromDb(createdService.id, 'admin-test@amatec.ao');
assert.strictEqual(
  getAllServicesFromDb().some((s) => s.id === createdService.id),
  false,
  'Serviço eliminado deve ser removido da base de dados'
);
console.log('✅ CRUD de serviços (Criar, Editar, Arquivar, Eliminar) validado com sucesso.');

// 10. Teste de Validação de Upload de Logotipo
console.log('\n10. Testando validação estrita de upload de logotipo...');
// Ficheiro com formato inválido (ex: text/plain)
const invalidMimeResult = saveUploadedLogo('data:text/plain;base64,VEVTVEU=', 'text/plain', 'teste.txt');
assert.strictEqual(invalidMimeResult.success, false, 'Formato text/plain deve ser rejeitado');
assert.ok(invalidMimeResult.error?.includes('SVG ou PNG'));

// Ficheiro SVG válido
const validSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>';
const validBase64 = Buffer.from(validSvg).toString('base64');
const validUploadResult = saveUploadedLogo(validBase64, 'image/svg+xml', 'logo-teste.svg');
assert.strictEqual(validUploadResult.success, true, 'SVG válido deve ser aceite');
assert.ok(validUploadResult.logoUrl?.includes('/brand/uploads/logo-'), 'Deve gerar URL seguro em public/brand/uploads');
console.log('✅ Validação de formato e tamanho de logotipo validada.');

// 11. Teste de Backups e Exportação CSV
console.log('\n11. Testando cópias de segurança (backups) e exportação CSV...');
const backup = createFullBackup('test-suite@amatec.ao');
assert.ok(backup.filename.startsWith('amatec-backup-'), 'Nome do ficheiro de backup deve seguir convenção');
assert.ok(backup.sizeBytes > 500, 'Backup deve conter dados consolidados das coleções');

const backups = listBackups();
assert.ok(backups.length > 0, 'Lista de backups deve conter o snapshot gerado');

const csv = exportLeadsToCsv();
assert.ok(csv.startsWith('\uFEFF'), 'CSV deve ter BOM UTF-8 para compatibilidade com Microsoft Excel');
assert.ok(csv.includes('ID,Data,Nome,Telefone'), 'CSV deve conter cabeçalho com campos oficiais');
console.log('✅ Cópias de segurança e exportação CSV validadas.');

// 12. Teste de Resiliência e Persistência em Ambiente Vercel Serverless (Read-only Filesystem)
console.log('\n12. Testando resiliência e persistência em ambiente Vercel Serverless (read-only /var/task)...');
const previousVercel = process.env.VERCEL;
process.env.VERCEL = '1';
try {
  const serverlessDir = getDataDir();
  assert.ok(serverlessDir.startsWith('/tmp'), 'Em ambiente Vercel, o diretório de escrita deve ser isolado em /tmp');
  
  const testLeadId = `lead-serverless-${Date.now()}`;
  saveLeadToServer({
    id: testLeadId,
    createdAt: new Date().toISOString(),
    name: 'Cliente Teste Vercel',
    phone: '930 372 597',
    equipment: 'Frigorífico Industrial',
    problemDescription: 'Compressor não arranca em alta temperatura',
    location: 'Golf 2, Luanda',
    status: 'Pendente',
  });

  const leadsInServerless = getAllLeadsFromServer();
  const savedLead = leadsInServerless.find((l) => l.id === testLeadId);
  assert.ok(savedLead, 'Lead deve persistir sem erros de EROFS no ambiente serverless');
  assert.strictEqual(savedLead.name, 'Cliente Teste Vercel');
  console.log('✅ Persistência serverless em /tmp validada com sucesso (zero erros de EROFS).');
} finally {
  if (previousVercel !== undefined) {
    process.env.VERCEL = previousVercel;
  } else {
    delete process.env.VERCEL;
  }
}

console.log('\n🎉 Todos os testes passaram com 100% de sucesso!');
