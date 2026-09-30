# Ama Tec — Site Institucional & Plataforma Técnica

Website oficial da **Ama Tec** (AMA TEC PRESTAÇÃO DE SERVIÇOS & COMÉRCIO GERAL SU), assistência técnica de equipamentos eletrónicos, eletrodomésticos, informática e industriais em Luanda, Angola.

---

## 📋 Comandos Disponíveis (Scripts npm)

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite (com backend `/api/*` embutido) na porta 3000. |
| `npm run build` | Compila a aplicação Vite e executa a pré-renderização estática (SSG) de todas as 72 rotas para SEO. |
| `npm run preview` | Pré-visualiza o build de produção localmente na porta 3000. |
| `npm run prerender` | Executa isoladamente a geração estática das rotas em `dist/`. |
| `npm run clean` | Remove os artefactos de compilação (`dist`, `server.js`, `.vite`). |
| `npm run typecheck` | Validação estrita de tipos TypeScript (`tsc --noEmit`). |
| `npm run lint` | Verificação de integridade e tipos do código fonte. |
| `npm run format` | Formata todo o código fonte usando o Biome (`biome format --write .`). |
| `npm run format:check`| Verifica se o código cumpre as diretrizes de formatação sem alterar ficheiros. |
| `npm run check` | Análise estática combinada com Biome linter e TypeScript compiler. |
| `npm test` | Executa o conjunto completo de 12 testes unitários (`tests/unit.test.ts`). |
| `npm run test:unit` | Alias explícito para os testes unitários da aplicação. |
| `npm run test:api` | Executa os testes de integração e ciclo de vida da API REST do painel Admin (`tests/api-e2e.test.ts`). |
| `npm run test:365` | Validação de segurança, persistência e conformidade da **Integração Ama Tec 365** (`tests/amatec365.test.ts`). |
| `npm run test:all` | Executa a suite completa: testes unitários + testes de integração de API + testes Ama Tec 365. |
| `npm run test:e2e` | Executa testes ponta a ponta com Playwright. |
| `npm run test:nav` | Executa especificamente a validação do menu de navegação e mega menu com Playwright. |

---

## ⚡ Integração Ama Tec 365 (ERP & Portal do Cliente)

A arquitetura de integração com o sistema central **Ama Tec 365** assenta em dois pilares:

1. **Submissão de Solicitação de Assistência (`submitAssistance`)**:
   - O formulário público (`/solicitar-assistencia` / `/agendar`) submete os dados do cliente e equipamento para o endpoint seguro `/api/amatec365/assistance`.
   - Grava diretamente na coleção canónica `leads` do Firestore (módulo de Pedidos de Serviço / Agendamento do ERP).
   - Gera um identificador imprevisível (`SOL-2026-[HEX6]`) com controlo de idempotência (TTL 24h) e proteção anti-spam multicamada.

2. **Portal do Cliente Oficial (Autenticação Própria)**:
   - O acompanhamento de Ordens de Serviço, orçamentos e relatórios técnicos é centralizado no Portal do Cliente do Ama Tec 365 (`VITE_AMATEC365_PORTAL_URL`).
   - O website disponibiliza o botão **"Consultar minha assistência"** na barra de topo, menu mobile, rodapé e ecrã de confirmação.

---

## 🗄️ Persistência de Dados & Firestore

A plataforma suporta múltiplos motores de dados unificados:
- **Produção:** Firebase Firestore (via **Firebase Admin SDK** no backend `/api/*`).
- **Desenvolvimento / CI:** Filesystem resiliente com isolamento de diretório `/tmp` para ambientes serverless (Vercel / Cloud Run).

### Variáveis de Ambiente (`.env`)

```env
# Firebase Admin SDK (Firestore de Produção)
FIREBASE_PROJECT_ID="amatec-ao-prod"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@amatec-ao-prod.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Notificações de Pedidos
EMAIL_NOTIFICATION_TARGET="geral@amatec.ao"
RESEND_API_KEY="re_sample_key"
```

### Regras de Segurança do Firestore (`firestore.rules`)

O acesso direto do frontend via cliente Web SDK é estritamente bloqueado por `firestore.rules`. Todas as leituras e escritas são intermediadas pelo backend com o Firebase Admin SDK.
