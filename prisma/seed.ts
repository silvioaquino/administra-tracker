// Seed da Central de Acompanhamento e Qualidade — Administra.ai
// Popula a base a partir do cronograma (template Notion KAIUP).
// Rode com: npm run db:seed

import { PrismaClient, type TestType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'admin123';

// ----------------------------------------------------------------------------
// Equipe (3 pessoas) — handles usados nas atribuições
// ----------------------------------------------------------------------------
const team = [
  {
    email: 'silvio.aquinodev@gmail.com',
    name: 'Silvio Aquino',
    handle: '@dev',
    role: 'DEV' as const,
  },
  {
    email: 'seguranca@administra.ai',
    name: 'Guilherme Tomaz',
    handle: '@seguranca',
    role: 'SEGURANCA' as const,
  },
  {
    email: 'usabilidade@administra.ai',
    name: 'Meiry Paiva',
    handle: '@usabilidade',
    role: 'USABILIDADE' as const,
  },
];

// ----------------------------------------------------------------------------
// Sprints (0 a 10)
// ----------------------------------------------------------------------------
const sprints = [
  { number: 0, title: 'Correções Imediatas', dayStart: 1, dayEnd: 2, status: 'EM_ANDAMENTO' as const, expectedBugs: null },
  { number: 1, title: 'Correções + Segurança', dayStart: 3, dayEnd: 9, status: 'NAO_INICIADO' as const, expectedBugs: 'BUG-001, BUG-002, BUG-003' },
  { number: 2, title: 'Melhorias Operacionais', dayStart: 10, dayEnd: 16, status: 'NAO_INICIADO' as const, expectedBugs: 'BUG-004, BUG-005, BUG-006, BUG-007' },
  { number: 3, title: 'Onboarding', dayStart: 17, dayEnd: 23, status: 'NAO_INICIADO' as const, expectedBugs: 'BUG-008, BUG-009, BUG-010' },
  { number: 4, title: 'Pré-Lançamento', dayStart: 24, dayEnd: 30, status: 'NAO_INICIADO' as const, expectedBugs: 'BUG-011, BUG-012, BUG-013' },
  { number: 5, title: 'Multi-Segmento', dayStart: 31, dayEnd: 40, status: 'NAO_INICIADO' as const, expectedBugs: 'BUG-014, BUG-015, BUG-016' },
  { number: 6, title: 'Salões', dayStart: 41, dayEnd: 50, status: 'NAO_INICIADO' as const, expectedBugs: 'BUG-017 a BUG-022' },
  { number: 7, title: 'Oficinas', dayStart: 51, dayEnd: 60, status: 'NAO_INICIADO' as const, expectedBugs: 'BUG-023 a BUG-027' },
  { number: 8, title: 'Limpeza', dayStart: 61, dayEnd: 70, status: 'NAO_INICIADO' as const, expectedBugs: 'BUG-028 a BUG-031' },
  { number: 9, title: 'Refinamento + Benchmark', dayStart: 71, dayEnd: 80, status: 'NAO_INICIADO' as const, expectedBugs: 'BUG-032, BUG-033, BUG-034' },
  { number: 10, title: 'Intelligence', dayStart: 81, dayEnd: 90, status: 'NAO_INICIADO' as const, expectedBugs: 'BUG-035, BUG-036, BUG-037' },
];

// ----------------------------------------------------------------------------
// Testes — tuplas: [code, type, title, scenario, expected, handleOriginal]
// ----------------------------------------------------------------------------
type Tuple = [string, TestType, string, string, string, '@dev' | '@qa'];

const testsBySprint: Record<number, Tuple[]> = {
  0: [
    ['T-001', 'SEGURANCA', 'Chave JWT exposta', 'Verificar se .env está no Git', 'Arquivo não trackeado', '@qa'],
    ['T-002', 'SEGURANCA', 'allowedDevOrigins', 'Acessar de IP externo', 'Bloquear requisição', '@qa'],
    ['T-003', 'SEGURANCA', 'Logs sensíveis', 'Executar login com email', 'Email não aparece em log', '@qa'],
    ['T-004', 'UNITARIO', 'Gerar nova secret', 'openssl rand -base64 32', 'String base64 válida', '@dev'],
    ['T-005', 'INTEGRACAO', 'Autenticação pós-patch', 'Login com credenciais válidas', 'Sucesso 200', '@qa'],
    ['T-006', 'INTEGRACAO', 'Recuperação de senha', 'Solicitar reset token', 'Email enviado sem token exposto', '@qa'],
  ],
  1: [
    ['T-007', 'UNITARIO', 'Rate Limiting - Redis', 'Conectar ao Upstash', 'Conexão bem-sucedida', '@dev'],
    ['T-008', 'INTEGRACAO', 'Rate Limit - Login', '6 tentativas em 1 min', '429 após 5', '@qa'],
    ['T-009', 'INTEGRACAO', 'Rate Limit - API', '101 requisições em 1 min', '429 após 100', '@qa'],
    ['T-010', 'PERFORMANCE', 'Rate Limit - Latência', 'Medir tempo resposta', '<50ms', '@dev'],
    ['T-011', 'UNITARIO', 'Zod - Schema Abertura', 'JSON válido', 'Passa validação', '@dev'],
    ['T-012', 'UNITARIO', 'Zod - Schema Inválido', 'JSON com campo faltando', 'Erro 400', '@dev'],
    ['T-013', 'INTEGRACAO', 'POST /api/caixa/abrir', 'Dados válidos', '200 + caixa criado', '@qa'],
    ['T-014', 'INTEGRACAO', 'POST /api/caixa/fechar', 'Caixa aberto', '200 + relatório', '@qa'],
    ['T-015', 'INTEGRACAO', 'Webhook Cardápio.ai', 'Payload real', '200 + venda criada', '@qa'],
    ['T-016', 'E2E', 'Fluxo Caixa Completo', 'Abrir → Vender → Fechar', 'Sucesso em todos steps', '@qa'],
    ['T-017', 'SEGURANCA', 'Anti-IDOR - Tentativa acesso', 'Acessar empresa diferente', '403 Forbidden', '@qa'],
    ['T-018', 'INTEGRACAO', 'GET /api/empresa', 'Com token válido', '200 + dados empresa', '@qa'],
    ['T-019', 'INTEGRACAO', 'GET /api/empresa', 'Sem token', '401 Unauthorized', '@qa'],
    ['T-020', 'SEGURANCA', 'CORS - Origem não permitida', 'curl de origem inválida', 'Bloquear', '@qa'],
    ['T-021', 'SEGURANCA', 'Headers de Segurança', 'Verificar response headers', 'HSTS, X-Frame-Options presentes', '@qa'],
  ],
  2: [
    ['T-022', 'UNITARIO', 'Busca Fuzzy - Produtos', 'Buscar "xburg" retorna "X-Burguer"', 'Relevância correta', '@dev'],
    ['T-023', 'PERFORMANCE', 'Busca - 1000 produtos', 'Tempo de resposta', '<200ms', '@dev'],
    ['T-024', 'UNITARIO', 'Split Pagamento', '50% PIX + 50% Cartão', 'Soma = total', '@dev'],
    ['T-025', 'INTEGRACAO', 'POST /api/vendas com split', 'Enviar array de pagamentos', '200 + salvo', '@qa'],
    ['T-026', 'INTEGRACAO', 'Validação split', 'Soma != total', '400 Bad Request', '@qa'],
    ['T-027', 'UNITARIO', 'Markup - Cálculo', 'Custo 10, Markup 3', 'Preço 30', '@dev'],
    ['T-028', 'INTEGRACAO', 'GET /api/precos/calcular', 'Produto ID válido', 'Retorna preço sugerido', '@qa'],
    ['T-029', 'INTEGRACAO', 'Desconto - Regras', 'Produto com 10% off', 'Valor correto', '@qa'],
    ['T-030', 'E2E', 'Cancelamento de Venda', 'Vender → Cancelar', 'Estoque restaurado', '@qa'],
    ['T-031', 'SEGURANCA', 'Logs - Eventos suspeitos', 'Tentativa de acesso inválido', 'Log registrado', '@qa'],
    ['T-032', 'UNITARIO', 'Gráfico - Vendas do dia', 'Mock de dados', 'Renderiza corretamente', '@dev'],
    ['T-033', 'INTEGRACAO', 'Sangria - Registrar', 'Valor R$100, motivo "troco"', 'Saldo reduzido', '@qa'],
    ['T-034', 'INTEGRACAO', 'Alertas - Brute force', '5 tentativas falhas', 'Notificação enviada', '@qa'],
    ['T-035', 'INTEGRACAO', 'Sentry - Error tracking', 'Forçar erro 500', 'Erro capturado', '@qa'],
    ['T-036', 'PERFORMANCE', 'Teste de Carga - k6', '100 usuários simultâneos', 'P95 < 500ms', '@dev'],
    ['T-037', 'PERFORMANCE', 'Teste de Carga - 500 usuários', 'Pico de carga', 'Sistema estável', '@dev'],
    ['T-038', 'SEGURANCA', 'npm audit', 'Verificar vulnerabilidades', '0 críticas', '@dev'],
  ],
  3: [
    ['T-039', 'USABILIDADE', 'Onboarding - 8 passos', 'Usuário novo completo', 'Conclui em <12min', '@qa'],
    ['T-040', 'USABILIDADE', 'Onboarding - Skip', 'Pular passos opcionais', 'Continua normalmente', '@qa'],
    ['T-041', 'INTEGRACAO', 'Salvamento parcial', 'Fechar no passo 3, reabrir', 'Retorna no passo 3', '@qa'],
    ['T-042', 'UI_UX', 'Vídeos tutoriais', 'Clicar no ícone de ajuda', 'Vídeo abre overlay', '@qa'],
    ['T-043', 'ACESSIBILIDADE', 'Legendas nos vídeos', 'Ativar legendas', 'Funciona', '@qa'],
    ['T-044', 'UI_UX', 'Guided Tour', 'Primeiro acesso ao caixa', 'Tour inicia automaticamente', '@qa'],
    ['T-045', 'UI_UX', 'Tooltips', 'Hover em campo complexo', 'Tooltip aparece', '@qa'],
    ['T-046', 'UNITARIO', 'CSV Import - Parse', 'Arquivo com 100 linhas', 'Importa todas', '@dev'],
    ['T-047', 'INTEGRACAO', 'CSV Import - Dados inválidos', 'Linha com preço texto', 'Pula linha, reporta erro', '@qa'],
    ['T-048', 'PERFORMANCE', 'CSV Import - 5000 produtos', 'Bulk insert', '<10 segundos', '@dev'],
    ['T-049', 'INTEGRACAO', 'Template - Hamburgueria', 'Selecionar template', 'Produtos criados', '@qa'],
    ['T-050', 'INTEGRACAO', 'Template - Pizzaria', 'Selecionar template', 'Produtos criados', '@qa'],
    ['T-051', 'UI_UX', 'FAQ - Busca', 'Digitar "preço"', 'Resultados relevantes', '@qa'],
    ['T-052', 'UI_UX', 'Base de conhecimento', 'Acessar docs.kaiup.com', 'Página carrega', '@qa'],
    ['T-053', 'INTEGRACAO', 'Crisp Chat', 'Enviar mensagem', 'Admin recebe notificação', '@qa'],
    ['T-054', 'SEGURANCA', 'Revisão Fase 2', 'Checklist completo', '100% ok', '@qa'],
  ],
  4: [
    ['T-055', 'INTEGRACAO', 'Backup automático', 'Disparar backup às 03:00', 'Arquivo criado', '@qa'],
    ['T-056', 'INTEGRACAO', 'Restore de backup', 'Restaurar em staging', 'Dados íntegros', '@qa'],
    ['T-057', 'SEGURANCA', 'Ofuscação - Build', 'npm run build', 'Bundle ofuscado', '@dev'],
    ['T-058', 'INTEGRACAO', 'Sentry - Error capture', 'Forçar erro', 'Erro no dashboard', '@qa'],
    ['T-059', 'SEGURANCA', 'Anti-Tamper - DevTools', 'Abrir F12', 'Funcionalidades desabilitadas', '@qa'],
    ['T-060', 'SEGURANCA', 'Anti-Tamper - Iframe', 'Carregar em iframe', 'Redireciona top', '@qa'],
    ['T-061', 'INTEGRACAO', 'Health Check', 'GET /api/health', '200 + status OK', '@qa'],
    ['T-062', 'INTEGRACAO', 'CI/CD - Push na main', 'Git push', 'Deploy automático', '@dev'],
    ['T-063', 'SEGURANCA', 'SQL Injection', "Input com ' OR '1'='1", 'Sanitizado', '@qa'],
    ['T-064', 'SEGURANCA', 'XSS', "Input com <script>alert('XSS')</script>", 'Escapado', '@qa'],
    ['T-065', 'SEGURANCA', 'Path Traversal', 'Input com ../../.env', 'Bloqueado', '@qa'],
    ['T-066', 'UI_UX', 'Landing page - Mobile', 'iPhone 12', 'Responsivo', '@qa'],
    ['T-067', 'UI_UX', 'Landing page - SEO', 'Verificar meta tags', 'Corretas', '@qa'],
    ['T-068', 'INTEGRACAO', 'Stripe - Checkout', 'Comprar plano teste', 'Redireciona Stripe', '@qa'],
    ['T-069', 'INTEGRACAO', 'Stripe - Webhook', 'Simular pagamento', 'Assinatura ativada', '@qa'],
    ['T-070', 'INTEGRACAO', 'Stripe - Cancelamento', 'Cancelar assinatura', 'Plano downgrade', '@qa'],
    ['T-071', 'E2E', 'Smoke Test - Pós lançamento', 'Todos fluxos principais', 'OK', '@qa'],
    ['T-072', 'PERFORMANCE', 'Monitoramento inicial', 'Verificar logs', 'Sem erros', '@qa'],
  ],
  5: [
    ['T-073', 'UNITARIO', 'Modelos - Segmento', 'CRUD completo', 'Funciona', '@dev'],
    ['T-074', 'UNITARIO', 'Modelos - Modulo', 'CRUD completo', 'Funciona', '@dev'],
    ['T-075', 'INTEGRACAO', 'GET /api/segmentos', 'Lista segmentos', '200 + array', '@qa'],
    ['T-076', 'INTEGRACAO', 'POST /api/empresa/segmento', 'Mudar segmento', '200 + atualizado', '@qa'],
    ['T-077', 'INTEGRACAO', 'Rota /[segmento]/dashboard', 'Acessar com food_service', 'Dashboard food', '@qa'],
    ['T-078', 'INTEGRACAO', 'Rota inválida /[invalido]/dashboard', 'Segmento não existe', '404 + redirect', '@qa'],
    ['T-079', 'UI_UX', 'Página escolha segmento', 'Novo cadastro', 'Cards exibidos', '@qa'],
    ['T-080', 'UI_UX', 'Escolha + redirecionamento', 'Escolher salão', 'Onboarding salão', '@qa'],
    ['T-081', 'INTEGRACAO', 'Onboarding dinâmico', '4 segmentos diferentes', 'Passos corretos', '@qa'],
    ['T-082', 'INTEGRACAO', 'Progresso onboarding', 'Completar 50%, sair', 'Retoma do passo', '@qa'],
    ['T-083', 'INTEGRACAO', 'Migração empresas antigas', 'Script de migração', 'Todas food_service', '@dev'],
    ['T-084', 'INTEGRACAO', 'Dados preservados', 'Antes/depois migração', 'Mesmos dados', '@qa'],
    ['T-085', 'SEGURANCA', 'Isolamento segmento', 'Empresa A vê dados B?', 'Bloqueado', '@qa'],
    ['T-086', 'SEGURANCA', 'RLS PostgreSQL', 'Testar row level security', 'Ativo', '@qa'],
    ['T-087', 'UI_UX', 'Documentação segmentos', 'docs.kaiup.com/segmentos', 'Conteúdo correto', '@qa'],
    ['T-088', 'INTEGRACAO', 'Preparação Salões - Models', 'Criar profissional', 'Salvo no banco', '@qa'],
    ['T-089', 'E2E', 'Review Sprint 5', 'Fluxo completo multi-segmento', 'OK', '@qa'],
  ],
  6: [
    ['T-090', 'UNITARIO', 'Modelos - Profissional', 'CRUD completo', 'Funciona', '@dev'],
    ['T-091', 'UNITARIO', 'Modelos - Servico', 'CRUD completo', 'Funciona', '@dev'],
    ['T-092', 'UNITARIO', 'Modelos - Agendamento', 'CRUD completo', 'Funciona', '@dev'],
    ['T-093', 'INTEGRACAO', 'GET /api/agendamentos', 'Listar do dia', 'Retorna array', '@qa'],
    ['T-094', 'UI_UX', 'FullCalendar - Mês', 'Visualizar calendário', 'Renderiza', '@qa'],
    ['T-095', 'UI_UX', 'Drag and drop', 'Reagendar evento', 'Atualiza no DB', '@qa'],
    ['T-096', 'UNITARIO', 'Comissão - Cálculo', 'Serviço R$100, comissão 30%', 'Profissional recebe R$30', '@dev'],
    ['T-097', 'INTEGRACAO', 'GET /api/comissoes/relatorio', 'Mês atual', 'CSV exportado', '@qa'],
    ['T-098', 'INTEGRACAO', 'CRUD Clientes', 'Criar, ler, editar, deletar', 'Funciona', '@qa'],
    ['T-099', 'INTEGRACAO', 'Histórico cliente', 'Agendamentos passados', 'Lista correta', '@qa'],
    ['T-100', 'INTEGRACAO', 'Venda com gorjeta', 'Venda R$100, gorjeta R$10', 'Total R$110', '@qa'],
    ['T-101', 'INTEGRACAO', 'Venda com profissional', 'Atribuir a João', 'Comissão calculada', '@qa'],
    ['T-102', 'INTEGRACAO', 'WhatsApp - Lembrete', 'Agendamento amanhã', 'Mensagem enviada', '@qa'],
    ['T-103', 'INTEGRACAO', 'WhatsApp - Confirmação', 'Cliente responde "SIM"', 'Status atualizado', '@qa'],
    ['T-104', 'UI_UX', 'Dashboard Salões', 'Métricas carregam', 'Dados corretos', '@qa'],
    ['T-105', 'INTEGRACAO', 'Ficha serviço', 'Adaptar de produto', 'Funciona', '@qa'],
    ['T-106', 'UNITARIO', 'Custo serviço', 'Serviço usa 2 produtos', 'Custo = soma', '@dev'],
    ['T-107', 'UI_UX', 'Onboarding Salões', '10 passos', 'Conclui em <10min', '@qa'],
    ['T-108', 'INTEGRACAO', 'Onboarding - Dados', 'Salvar passo a passo', 'DB atualizado', '@qa'],
    ['T-109', 'E2E', 'Fluxo Salões', 'Agendar → Atender → Vender → Comissão', 'Completo', '@qa'],
    ['T-110', 'PERFORMANCE', 'Agenda - 1000 agendamentos', 'Carregar mês', '<1 segundo', '@dev'],
  ],
  7: [
    ['T-111', 'UNITARIO', 'Modelos - OrdemServico', 'CRUD completo', 'Funciona', '@dev'],
    ['T-112', 'UNITARIO', 'Modelos - Veiculo', 'CRUD completo', 'Funciona', '@dev'],
    ['T-113', 'UNITARIO', 'Modelos - Peca', 'CRUD completo', 'Funciona', '@dev'],
    ['T-114', 'INTEGRACAO', 'Fluxo OS - Aberta', 'Criar OS', 'Status "aberta"', '@qa'],
    ['T-115', 'INTEGRACAO', 'Fluxo OS - Aprovação', 'Enviar link', 'Cliente aprova', '@qa'],
    ['T-116', 'INTEGRACAO', 'Fluxo OS - Execução', 'Iniciar serviço', 'Status "em_andamento"', '@qa'],
    ['T-117', 'INTEGRACAO', 'Fluxo OS - Conclusão', 'Finalizar OS', 'NF emitida, estoque baixado', '@qa'],
    ['T-118', 'INTEGRACAO', 'Orçamento - PDF', 'Gerar PDF', 'Arquivo criado', '@qa'],
    ['T-119', 'INTEGRACAO', 'Orçamento - Link aprovação', 'Cliente acessa', 'Página de aprovação', '@qa'],
    ['T-120', 'INTEGRACAO', 'Orçamento - Expirado', '8 dias sem ação', 'Status cancelado', '@qa'],
    ['T-121', 'INTEGRACAO', 'Garantia - Cálculo', 'Serviço + 90 dias', 'Data correta', '@qa'],
    ['T-122', 'INTEGRACAO', 'Garantia - Alerta', '7 dias antes', 'Notificação enviada', '@qa'],
    ['T-123', 'INTEGRACAO', 'Garantia - Acionamento', 'OS na garantia', 'Sem custo', '@qa'],
    ['T-124', 'INTEGRACAO', 'Estoque - Baixa', 'Concluir OS com peças', 'Estoque reduz', '@qa'],
    ['T-125', 'INTEGRACAO', 'Estoque - Reserva', 'Abrir OS com peças', 'Estoque reservado', '@qa'],
    ['T-126', 'INTEGRACAO', 'Estoque - Estorno', 'Cancelar OS', 'Estoque devolvido', '@qa'],
    ['T-127', 'INTEGRACAO', 'NF-e - Emissão', 'Concluir OS', 'NF-e gerada', '@qa'],
    ['T-128', 'INTEGRACAO', 'NF-e - Cancelamento', 'Cancelar OS', 'NF-e cancelada', '@qa'],
    ['T-129', 'INTEGRACAO', 'Relatório - OS por cliente', 'Cliente com 3 OS', 'Lista correta', '@qa'],
    ['T-130', 'INTEGRACAO', 'Relatório - Peças mais usadas', 'Exportar Excel', 'Arquivo válido', '@qa'],
    ['T-131', 'UI_UX', 'Dashboard Oficinas', 'Métricas carregam', 'Dados corretos', '@qa'],
    ['T-132', 'E2E', 'Fluxo Oficinas', 'OS → Aprovação → Execução → NF', 'Completo', '@qa'],
    ['T-133', 'PERFORMANCE', 'OS - 1000 OS por mês', 'Query relatório', '<2 segundos', '@dev'],
    ['T-134', 'E2E', 'Lançamento Beta', '2 oficinas reais', 'Feedback coletado', '@qa'],
  ],
  8: [
    ['T-135', 'UNITARIO', 'Modelos - Rota', 'CRUD completo', 'Funciona', '@dev'],
    ['T-136', 'UNITARIO', 'Modelos - Checklist', 'CRUD completo', 'Funciona', '@dev'],
    ['T-137', 'UNITARIO', 'Modelos - Recorrencia', 'CRUD completo', 'Funciona', '@dev'],
    ['T-138', 'UNITARIO', 'Otimização de rotas', '5 clientes', 'Ordem otimizada', '@dev'],
    ['T-139', 'PERFORMANCE', 'Rotas - 50 clientes', 'Algoritmo vizinho', '<1 segundo', '@dev'],
    ['T-140', 'UI_UX', 'PWA - Instalação', 'Adicionar à tela inicial', 'App instalável', '@qa'],
    ['T-141', 'UI_UX', 'PWA - Offline', 'Sem internet', 'Funciona offline', '@qa'],
    ['T-142', 'INTEGRACAO', 'PWA - Geolocalização', 'Check-in no cliente', 'Marca horário', '@qa'],
    ['T-143', 'INTEGRACAO', 'Checklist - Itens', 'Marcar 5 itens', 'Salva progresso', '@qa'],
    ['T-144', 'INTEGRACAO', 'Checklist - Obrigatórios', 'Pular item crítico', 'Alerta', '@qa'],
    ['T-145', 'INTEGRACAO', 'Recorrência - Semanal', 'Criar serviço semanal', 'Gera próximos', '@qa'],
    ['T-146', 'INTEGRACAO', 'Recorrência - Pausa', 'Pausar por 2 semanas', 'Não gera', '@qa'],
    ['T-147', 'INTEGRACAO', 'Fotos - Upload', 'Antes/depois', 'Salva no S3', '@qa'],
    ['T-148', 'SEGURANCA', 'Fotos - Acesso', 'URL assinada', 'Expira em 1h', '@qa'],
    ['T-149', 'INTEGRACAO', 'Avaliação - 5 estrelas', 'Cliente avalia', 'Média calculada', '@qa'],
    ['T-150', 'INTEGRACAO', 'Avaliação - Comentário', 'Feedback escrito', 'Salvo no DB', '@qa'],
    ['T-151', 'UI_UX', 'Dashboard Limpeza', 'Métricas carregam', 'Dados corretos', '@qa'],
    ['T-152', 'E2E', 'Fluxo Limpeza', 'Rota → Checklist → Fotos → Avaliação', 'Completo', '@qa'],
    ['T-153', 'PERFORMANCE', 'PWA - 100 check-ins simultâneos', 'Sync batch', '<5 segundos', '@dev'],
    ['T-154', 'E2E', 'Lançamento Beta', '2 empresas limpeza', 'Feedback coletado', '@qa'],
  ],
  9: [
    ['T-155', 'INTEGRACAO', 'Temas dinâmicos', 'Food = vermelho, Salão = roxo', 'Cor aplicada', '@qa'],
    ['T-156', 'INTEGRACAO', 'Mudança de tema', 'Trocar segmento', 'Tema troca', '@qa'],
    ['T-157', 'INTEGRACAO', 'Preços por segmento', 'Food R$97, Salão R$79', 'Valor correto', '@qa'],
    ['T-158', 'INTEGRACAO', 'Stripe - Checkout segmento', 'Comprar plano Salão', 'Redireciona correto', '@qa'],
    ['T-159', 'INTEGRACAO', 'Admin - Listar empresas', 'Todas segmentos', 'Filtros funcionam', '@qa'],
    ['T-160', 'INTEGRACAO', 'Admin - Mudar segmento', 'Forçar mudança', 'Log registrado', '@qa'],
    ['T-161', 'INTEGRACAO', 'Analytics - Evento', 'Segmento Salão', 'Trackeado', '@qa'],
    ['T-162', 'INTEGRACAO', 'Analytics - Funnel', 'Onboarding → Pago', 'Conversão rastreada', '@qa'],
    ['T-163', 'UI_UX', 'Docs API - Swagger', '/api/docs', 'Documentação interativa', '@qa'],
    ['T-164', 'INTEGRACAO', 'API Key - Gerar', 'Cliente Enterprise', 'Chave criada', '@qa'],
    ['T-165', 'PERFORMANCE', 'Query - Índices', 'EXPLAIN ANALYZE', 'Index scan', '@dev'],
    ['T-166', 'PERFORMANCE', 'Redis - Cache', 'Consulta repetida', 'Cache hit', '@dev'],
    ['T-167', 'SEGURANCA', 'CSP (Content Security Policy)', 'Injetar script inline', 'Bloqueado', '@qa'],
    ['T-168', 'SEGURANCA', 'SRI (Subresource Integrity)', 'CDN modificado', 'Bloqueado', '@qa'],
    ['T-169', 'PERFORMANCE', 'WAF - Regras', 'Tentativa SQLi', 'Bloqueado', '@qa'],
    ['T-170', 'SEGURANCA', 'Pentest - Básico', 'OWASP Top 10', 'Report gerado', '@qa'],
    ['T-171', 'E2E', 'Cross-segmento', 'Mudar de food para salão', 'Dados preservados?', '@qa'],
    ['T-172', 'E2E', 'Lançamento Multi-segmento', '4 segmentos ativos', 'Todos funcionam', '@qa'],
  ],
  10: [
    ['T-173', 'UNITARIO', 'Modelos - Insight', 'CRUD completo', 'Funciona', '@dev'],
    ['T-174', 'UNITARIO', 'Modelos - Benchmark', 'CRUD completo', 'Funciona', '@dev'],
    ['T-175', 'INTEGRACAO', 'ETL - Coleta dados', 'Extrair vendas 30 dias', 'Dados agregados', '@qa'],
    ['T-176', 'PERFORMANCE', 'ETL - 500 empresas', 'Job noturno', '<1 hora', '@dev'],
    ['T-177', 'INTEGRACAO', 'GET /api/estrategia/metrics', 'Dashboard', 'KPIs calculados', '@qa'],
    ['T-178', 'UNITARIO', 'Rentabilidade - Cálculo', 'Produto com custo 10, venda 20', 'Margem 50%', '@dev'],
    ['T-179', 'UNITARIO', 'Ponto Equilíbrio', 'Fixos 5000, margem 40%', 'Break-even 12500', '@dev'],
    ['T-180', 'UI_UX', 'Dashboard Estratégico', 'Cards e gráficos', 'Renderiza', '@qa'],
    ['T-181', 'INTEGRACAO', 'CMV - Cálculo', 'Receita 100k, custo 30k', 'CMV 30%', '@qa'],
    ['T-182', 'INTEGRACAO', 'LTV - Cálculo', 'Ticket 50, frequência 2x/mês, 12 meses', 'LTV 1200', '@qa'],
    ['T-183', 'INTEGRACAO', 'Alertas - CMV alto', 'CMV > 40%', 'Notificação', '@qa'],
    ['T-184', 'INTEGRACAO', 'Alertas - Ticket caindo', 'Queda >15%', 'Notificação', '@qa'],
    ['T-185', 'INTEGRACAO', 'Webhook - Segurança', 'Tentativa inválida', 'Bloqueado', '@qa'],
    ['T-186', 'INTEGRACAO', 'Discord - Alerta', 'CMV alto', 'Mensagem no canal', '@qa'],
    ['T-187', 'E2E', 'Beta Intelligence', '10 clientes reais', 'Feedback coletado', '@qa'],
    ['T-188', 'E2E', 'Lançamento Beta', 'Feature preview', 'Ativo', '@qa'],
  ],
};

// Resolve o handle real (equipe de 3) a partir do handle original do template
const resolveHandle = (raw: '@dev' | '@qa', type: TestType): string => {
  if (raw === '@dev') return '@dev';
  if (type === 'SEGURANCA') return '@seguranca';
  return '@usabilidade'; // QA funcional + usabilidade/UI/acessibilidade
};

// ----------------------------------------------------------------------------
// Bugs — [code, sprintRef, day, title, priority]
// ----------------------------------------------------------------------------
const bugs: [string, string, string, string, 'ALTA' | 'MEDIA' | 'BAIXA'][] = [
  ['BUG-001', 'S1', 'Dia 5', 'Webhook duplicando venda em timeout', 'MEDIA'],
  ['BUG-002', 'S1', 'Dia 6', 'Impressão térmica cortando última linha', 'BAIXA'],
  ['BUG-003', 'S1', 'Dia 7', 'Estoque negativo permitido em venda manual', 'ALTA'],
  ['BUG-004', 'S2', 'Dia 11', 'Split pagamento não aceita mais de 2 formas', 'MEDIA'],
  ['BUG-005', 'S2', 'Dia 13', 'Cancelamento não registra motivo', 'BAIXA'],
  ['BUG-006', 'S2', 'Dia 14', 'Gráfico não atualiza em tempo real', 'MEDIA'],
  ['BUG-007', 'S2', 'Dia 16', 'Teste de carga revelou leak de memória', 'ALTA'],
  ['BUG-008', 'S3', 'Dia 18', 'Vídeo não carrega no Safari', 'MEDIA'],
  ['BUG-009', 'S3', 'Dia 20', 'CSV com encoding UTF-8 com BOM falha', 'BAIXA'],
  ['BUG-010', 'S3', 'Dia 22', 'Busca na FAQ case-sensitive', 'BAIXA'],
  ['BUG-011', 'S4', 'Dia 27', 'XSS não bloqueado em campo de observação', 'ALTA'],
  ['BUG-012', 'S4', 'Dia 29', 'Webhook Stripe falha em ambiente produção', 'ALTA'],
  ['BUG-013', 'S4', 'Dia 30', 'Landing page não carrega imagens no mobile', 'MEDIA'],
  ['BUG-014', 'S5', 'Dia 33', 'Sidebar não atualiza segmento dinamicamente', 'MEDIA'],
  ['BUG-015', 'S5', 'Dia 35', 'Onboarding salão mostra passo de produto food', 'MEDIA'],
  ['BUG-016', 'S5', 'Dia 37', 'RLS bloqueando admin de ver todas empresas', 'ALTA'],
  ['BUG-017', 'S6', 'Dia 42', 'Conflito de horário não bloqueia', 'ALTA'],
  ['BUG-018', 'S6', 'Dia 43', 'Comissão calculada duas vezes', 'MEDIA'],
  ['BUG-019', 'S6', 'Dia 45', 'Gorjeta não aparece no relatório de caixa', 'MEDIA'],
  ['BUG-020', 'S6', 'Dia 46', 'WhatsApp falha em número com 9 dígitos', 'MEDIA'],
  ['BUG-021', 'S6', 'Dia 48', 'Custo do serviço não atualiza quando produto muda', 'BAIXA'],
  ['BUG-022', 'S6', 'Dia 49', 'Onboarding salão trava no passo 5', 'ALTA'],
  ['BUG-023', 'S7', 'Dia 52', 'Aprovação por link não registra IP', 'MEDIA'],
  ['BUG-024', 'S7', 'Dia 53', 'PDF do orçamento com formatação errada', 'BAIXA'],
  ['BUG-025', 'S7', 'Dia 55', 'Estoque reservado não libera após 7 dias', 'ALTA'],
  ['BUG-026', 'S7', 'Dia 56', 'NF-e falha quando SEFAZ offline', 'MEDIA'],
  ['BUG-027', 'S7', 'Dia 58', 'Dashboard mostra OS concluídas como "abertas"', 'MEDIA'],
  ['BUG-028', 'S8', 'Dia 62', 'Rota otimizada ignora horário de funcionamento', 'MEDIA'],
  ['BUG-029', 'S8', 'Dia 63', 'PWA não funciona no iOS', 'ALTA'],
  ['BUG-030', 'S8', 'Dia 66', 'Fotos não comprimem, muito grandes', 'MEDIA'],
  ['BUG-031', 'S8', 'Dia 68', 'Dashboard não atualiza após check-in', 'MEDIA'],
  ['BUG-032', 'S9', 'Dia 71', 'Tema não persiste após refresh', 'BAIXA'],
  ['BUG-033', 'S9', 'Dia 74', 'Analytics não trackeia webhook', 'MEDIA'],
  ['BUG-034', 'S9', 'Dia 77', 'CSP bloqueia fonte do Google Maps', 'MEDIA'],
  ['BUG-035', 'S10', 'Dia 82', 'ETL falha com dados de 2023', 'MEDIA'],
  ['BUG-036', 'S10', 'Dia 85', 'CMV não considera impostos', 'MEDIA'],
  ['BUG-037', 'S10', 'Dia 87', 'Alerta dispara múltiplas vezes', 'BAIXA'],
];

// ----------------------------------------------------------------------------
// Melhorias — [code, title, priority, sprintRef]
// ----------------------------------------------------------------------------
const improvements: [string, string, 'ALTA' | 'MEDIA' | 'BAIXA', string][] = [
  ['M-001', 'Adicionar dark mode', 'BAIXA', 'S9'],
  ['M-002', 'Exportar relatórios em múltiplos formatos', 'MEDIA', 'S4'],
  ['M-003', 'Integração com Google Calendar (salões)', 'MEDIA', 'S6'],
  ['M-004', 'Notificações push no PWA', 'MEDIA', 'S8'],
  ['M-005', 'Dashboard personalizável por widget', 'BAIXA', 'S9'],
];

// ----------------------------------------------------------------------------
// Métricas (Indicadores Gerais)
// ----------------------------------------------------------------------------
const metrics = [
  { key: 'testes_passando', label: 'Testes Passando', target: '95%', current: '0%', status: '🔴', order: 1 },
  { key: 'cobertura', label: 'Cobertura de Código', target: '80%', current: '0%', status: '🔴', order: 2 },
  { key: 'bugs_abertos', label: 'Bugs Abertos', target: '<10', current: '0', status: '🟢', order: 3 },
  { key: 'bugs_criticos', label: 'Bugs Críticos', target: '0', current: '0', status: '🟢', order: 4 },
  { key: 'uptime', label: 'Uptime', target: '99.9%', current: '100%', status: '🟢', order: 5 },
  { key: 'onboarding', label: 'Tempo Médio Onboarding', target: '<12min', current: '0min', status: '🔴', order: 6 },
];

// ----------------------------------------------------------------------------
// Checklist de produção
// ----------------------------------------------------------------------------
const checklist: Record<string, string[]> = {
  Semanal: [
    'Rodar testes automatizados',
    'Verificar logs de erro',
    'Revisar bugs novos',
    'Atualizar métricas',
    'Backup do banco',
    'Verificar uptime',
    'npm audit',
  ],
  Infraestrutura: [
    'Banco de dados NeonDB configurado (prod/dev branches)',
    'Domínios: kaiup.com + dev.kaiup.com',
    'SSL configurado',
    'Backup automático diário',
    'Monitoramento (Sentry + Logtail)',
    'Health check endpoint (/api/health)',
    'PM2 rodando duas instâncias',
    'Nginx configurado',
  ],
  Segurança: [
    'Fase 1 - Correções Imediatas (100%)',
    'Fase 2 - Proteção Backend (100%)',
    'Fase 3 - Proteção Frontend (100%)',
    'Fase 4 - Medidas Legais (100%)',
    'NEXTAUTH_SECRET gerada e segura',
    'Rate limiting configurado',
    'CORS restrito',
    'Headers de segurança (HSTS, X-Frame-Options)',
    'Anti-tamper ativo',
    'Watermarking implementado',
    'Termos de Uso atualizados',
    'Política de Privacidade LGPD',
    'Marca registrada no INPI',
  ],
  Testes: [
    'Testes unitários (cobertura >80%)',
    'Testes integração (cobertura >70%)',
    'Testes E2E (fluxos críticos)',
    'Testes segurança (pentest)',
    'Testes performance (carga 500 usuários)',
    'Testes usabilidade (onboarding <10min)',
    'Testes cross-browser (Chrome, Firefox, Safari)',
    'Testes mobile (iOS, Android)',
  ],
  Pagamentos: [
    'Stripe/Asaas configurado',
    'Webhooks funcionando',
    'Planos criados',
    'Básico R$49,90',
    'Profissional R$99,90',
    'Enterprise R$199,90',
  ],
  Documentação: [
    'README do projeto',
    'Termos de uso',
    'Política de privacidade',
    'FAQ',
    'API docs (Swagger)',
    'Guia do usuário',
    'Vídeos tutoriais',
  ],
  Lançamento: [
    'Landing pages por segmento',
    '500 clientes ativos',
    'MRR > R$50k',
    'NPS > 60',
    'Churn < 5%',
  ],
};

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpeza (ordem respeitando FKs)
  await prisma.test.deleteMany();
  await prisma.bug.deleteMany();
  await prisma.improvement.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.user.deleteMany();

  // Usuários
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const handleToId: Record<string, string> = {};
  for (const u of team) {
    const user = await prisma.user.create({
      data: { email: u.email, name: u.name, handle: u.handle, role: u.role, passwordHash },
    });
    handleToId[u.handle] = user.id;
  }
  console.log(`👥 ${team.length} usuários criados`);

  // Sprints
  const numberToSprintId: Record<number, string> = {};
  for (const s of sprints) {
    const sprint = await prisma.sprint.create({ data: s });
    numberToSprintId[s.number] = sprint.id;
  }
  console.log(`📦 ${sprints.length} sprints criadas`);

  // Testes
  let testCount = 0;
  for (const [num, tuples] of Object.entries(testsBySprint)) {
    const sprintId = numberToSprintId[Number(num)];
    for (const [code, type, title, scenario, expected, raw] of tuples) {
      const handle = resolveHandle(raw, type);
      await prisma.test.create({
        data: { code, type, title, scenario, expected, sprintId, assigneeId: handleToId[handle] },
      });
      testCount++;
    }
  }
  console.log(`🧪 ${testCount} testes criados`);

  // Bugs (responsável: @dev no template)
  for (const [code, sprintRef, day, title, priority] of bugs) {
    const sprintNumber = Number(sprintRef.replace('S', ''));
    await prisma.bug.create({
      data: {
        code,
        title,
        day,
        sprintRef,
        priority,
        sprintId: numberToSprintId[sprintNumber] ?? null,
        assigneeId: handleToId['@dev'],
      },
    });
  }
  console.log(`🐛 ${bugs.length} bugs criados`);

  // Melhorias
  for (const [code, title, priority, sprintRef] of improvements) {
    await prisma.improvement.create({
      data: { code, title, priority, sprintRef, assigneeId: handleToId['@dev'] },
    });
  }
  console.log(`💡 ${improvements.length} melhorias criadas`);

  // Métricas
  for (const m of metrics) {
    await prisma.metric.create({ data: m });
  }
  console.log(`📊 ${metrics.length} métricas criadas`);

  // Checklist
  let checklistCount = 0;
  for (const [category, items] of Object.entries(checklist)) {
    for (let i = 0; i < items.length; i++) {
      await prisma.checklistItem.create({ data: { category, label: items[i], order: i } });
      checklistCount++;
    }
  }
  console.log(`✅ ${checklistCount} itens de checklist criados`);

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
