import type {
  BugStatus,
  ImprovementStatus,
  Priority,
  Role,
  SprintStatus,
  TestStatus,
  TestType,
} from '@prisma/client';

type Meta = { label: string; emoji: string; className: string };

export const testTypeMeta: Record<TestType, Meta> = {
  SEGURANCA: { label: 'Segurança', emoji: '🔐', className: 'bg-red-100 text-red-700' },
  UNITARIO: { label: 'Unitário', emoji: '🧩', className: 'bg-blue-100 text-blue-700' },
  INTEGRACAO: { label: 'Integração', emoji: '🔗', className: 'bg-indigo-100 text-indigo-700' },
  E2E: { label: 'E2E', emoji: '🔄', className: 'bg-purple-100 text-purple-700' },
  USABILIDADE: { label: 'Usabilidade', emoji: '🧭', className: 'bg-teal-100 text-teal-700' },
  PERFORMANCE: { label: 'Performance', emoji: '⚡', className: 'bg-amber-100 text-amber-700' },
  UI_UX: { label: 'UI/UX', emoji: '🎨', className: 'bg-pink-100 text-pink-700' },
  ACESSIBILIDADE: { label: 'Acessibilidade', emoji: '♿', className: 'bg-cyan-100 text-cyan-700' },
};

export const testStatusMeta: Record<TestStatus, Meta> = {
  PENDENTE: { label: 'Pendente', emoji: '⬜', className: 'bg-muted text-muted-foreground' },
  EXECUTANDO: { label: 'Executando', emoji: '🟡', className: 'bg-amber-100 text-amber-700' },
  PASSOU: { label: 'Passou', emoji: '✅', className: 'bg-green-100 text-green-700' },
  FALHOU: { label: 'Falhou', emoji: '❌', className: 'bg-red-100 text-red-700' },
};

export const priorityMeta: Record<Priority, Meta> = {
  ALTA: { label: 'Alta', emoji: '🔴', className: 'bg-red-100 text-red-700' },
  MEDIA: { label: 'Média', emoji: '🟠', className: 'bg-amber-100 text-amber-700' },
  BAIXA: { label: 'Baixa', emoji: '🟢', className: 'bg-green-100 text-green-700' },
};

export const bugStatusMeta: Record<BugStatus, Meta> = {
  PENDENTE: { label: 'Pendente', emoji: '⬜', className: 'bg-muted text-muted-foreground' },
  CORRIGINDO: { label: 'Corrigindo', emoji: '🔄', className: 'bg-amber-100 text-amber-700' },
  DEPLOYADO: { label: 'Deployado', emoji: '🔧', className: 'bg-blue-100 text-blue-700' },
  FECHADO: { label: 'Fechado', emoji: '✅', className: 'bg-green-100 text-green-700' },
};

export const improvementStatusMeta: Record<ImprovementStatus, Meta> = {
  PENDENTE: { label: 'Pendente', emoji: '📝', className: 'bg-muted text-muted-foreground' },
  EM_ANALISE: { label: 'Em análise', emoji: '🔍', className: 'bg-amber-100 text-amber-700' },
  IMPLEMENTADO: { label: 'Implementado', emoji: '🚀', className: 'bg-green-100 text-green-700' },
};

export const sprintStatusMeta: Record<SprintStatus, Meta> = {
  NAO_INICIADO: { label: 'Não iniciado', emoji: '⬜', className: 'bg-muted text-muted-foreground' },
  EM_ANDAMENTO: { label: 'Em andamento', emoji: '🟡', className: 'bg-amber-100 text-amber-700' },
  CONCLUIDO: { label: 'Concluído', emoji: '✅', className: 'bg-green-100 text-green-700' },
};

export const roleMeta: Record<Role, Meta> = {
  DEV: { label: 'Desenvolvimento', emoji: '💻', className: 'bg-blue-100 text-blue-700' },
  SEGURANCA: { label: 'Segurança', emoji: '🔐', className: 'bg-red-100 text-red-700' },
  USABILIDADE: { label: 'Usabilidade / QA', emoji: '🧭', className: 'bg-teal-100 text-teal-700' },
  PM: { label: 'Produto', emoji: '📊', className: 'bg-purple-100 text-purple-700' },
  ADMIN: { label: 'Admin', emoji: '⭐', className: 'bg-amber-100 text-amber-700' },
};

export const testStatusOrder: TestStatus[] = ['PENDENTE', 'EXECUTANDO', 'PASSOU', 'FALHOU'];
export const bugStatusOrder: BugStatus[] = ['PENDENTE', 'CORRIGINDO', 'DEPLOYADO', 'FECHADO'];
export const priorityOrder: Priority[] = ['ALTA', 'MEDIA', 'BAIXA'];
