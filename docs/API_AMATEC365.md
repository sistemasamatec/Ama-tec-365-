# Ama Tec 365 — Documentação da API de Integração Técnica

## 1. Visão Geral da Arquitetura & Correção

O ecossistema **Ama Tec 365** (ERP / Software Central de Assistência Técnica) já dispõe de um **Portal do Cliente com autenticação própria** para consulta de Ordens de Serviço (OS), relatórios de diagnóstico e faturas.

Deste modo, o website institucional cumpre estritamente o papel de:
1. **Ponto de Entrada e Triagem**: Submissão de novas solicitações de assistência técnica ao módulo de **Pedidos de Serviço / Agendamento** do ERP (gravados na coleção canónica `leads` do Firestore).
2. **Encaminhamento Seguro**: Encaminhamento dos clientes para o Portal do Cliente oficial através do botão **"Consultar minha assistência"**, apontando para o URL configurado via variável de ambiente (`VITE_AMATEC365_PORTAL_URL="https://cliente.amatec365.ao"`).
3. **Isolamento de Segurança**: O website público não expõe credenciais de ERP, não implementa whitelist paralela de estados e não efetua consultas de OS diretas.

---

## 2. Especificação do Endpoint de Submissão

### 2.1 Submissão de Solicitação de Assistência
- **Rota**: `POST /api/amatec365/assistance`
- **Cabeçalhos Suportados**:
  - `Content-Type: application/json`
  - `Idempotency-Key: <string>` (Chave única gerada pelo cliente para evitar pedidos duplicados em conexões móveis instáveis).
- **Corpo da Requisição (JSON)**:
  ```json
  {
    "name": "João Manuel da Silva",
    "phone": "930372597",
    "email": "joao.silva@exemplo.ao",
    "equipment": "Televisor Samsung 55 UHD 4K",
    "serviceCategory": "domestico",
    "problemDescription": "O aparelho liga, emite áudio normal, mas o painel permanece totalmente escuro.",
    "location": "Golf 2, Luanda",
    "honeypot": "",
    "privacyConsent": true,
    "idempotencyKey": "IDEMP-2026-X9K2P3",
    "captchaToken": "optional_turnstile_or_recaptcha_token"
  }
  ```
- **Resposta de Sucesso (`HTTP 200 OK`)**:
  ```json
  {
    "success": true,
    "requestId": "SOL-2026-8F1A4C",
    "type": "solicitacao_pendente",
    "status": "Pendente",
    "message": "Solicitação de assistência registada com sucesso na equipa técnica da Ama Tec. Aguarde o contacto para agendamento.",
    "isMock": false,
    "estimatedContactHours": 2
  }
  ```
- **Respostas de Erro**:
  - `HTTP 400 Bad Request`: Dados obrigatórios em falta, telefone inválido, consentimento ausente ou filtro honeypot ativado.
  - `HTTP 429 Too Many Requests`: Limite de submissões excedido pelo endereço IP (> 5 submissões por 10 minutos).
  - `HTTP 500 Internal Server Error`: Falha de comunicação ou persistência no Firestore central (mensagem transparente sem mascaramento).

---

## 3. Persistência & Reutilização da Coleção do ERP

- **Coleção Oficial**: Todas as solicitações são gravadas diretamente na coleção `leads` do Firestore (módulo de Pedidos de Serviço do Ama Tec 365). Não são criadas coleções paralelas ou redundantes.
- **Gravação com `await` Estrito**: A persistência no Firestore é aguardada atomicamente. Caso o Firestore esteja indisponível, o sistema responde com erro `HTTP 500` explicativo, sem gravar falsamente em `/tmp` em ambiente de produção.
- **Identificador Público Imprevisível**: Cada solicitação recebe um ID único gerado com entropia criptográfica (`SOL-2026-[HEX6]`), garantindo que não é sequencial nem passível de enumeração por terceiros.

---

## 4. Idempotência & Rate Limiting com TTL

1. **Idempotency-Key**:
   - O formulário gera uma nova chave única a cada sessão de submissão.
   - O servidor verifica a existência da chave no armazenamento partilhado (`_idempotency` com TTL de 24 horas).
   - Se o cliente repetir o envio da mesma requisição, o servidor responde de imediato com a resposta cacheada e o indicador `idempotentReplay: true`, sem gravar duplicados na base de dados.
   - Após sucesso, o formulário regenera a chave para uma submissão subsequente.
2. **Rate Limiting por IP**:
   - Máximo de 5 submissões por IP em janela deslizante de 10 minutos.
   - Intervalo mínimo de segurança de 2,5 segundos entre envios sucessivos para mitigar ataques de rajada.

---

## 5. Proteção Anti-Spam & Validação

- **Honeypot**: Campo oculto posicionado fora da área visível (`tabIndex={-1}`, `aria-hidden="true"`). Robôs automáticos que preencham o campo são imediatamente rejeitados com `HTTP 400`.
- **Captcha / App Check**: Suporte pronto para Cloudflare Turnstile (`TURNSTILE_SECRET_KEY`), Google reCAPTCHA (`RECAPTCHA_SECRET_KEY`) ou Firebase App Check.
- **Upload de Ficheiros**: O formulário público não inclui upload de fotos para preservar a rapidez e a segurança em redes móveis; eventuais fotografias da avaria podem ser anexadas no WhatsApp ou no Portal do Cliente.
- **Consentimento de Privacidade**: Em estrita conformidade com a Lei n.º 22/11 de Proteção de Dados Pessoais de Angola, a submissão requer aceitação explícita (`privacyConsent: true`), validada tanto no frontend como no backend.
