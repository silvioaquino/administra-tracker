import { Bug, FlaskConical, ListChecks, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SprintProgressChart } from '@/components/dashboard/SprintProgressChart';
import { TestTypeChart } from '@/components/dashboard/TestTypeChart';
import { getDashboardStats, getMetrics } from '@/lib/data';
import { priorityMeta } from '@/lib/labels';

export const dynamic = 'force-dynamic';

const StatCard = ({
  title,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  hint?: string;
  icon: React.ElementType;
  accent: string;
}) => (
  <Card>
    <CardContent className="flex items-center gap-4 p-5">
      <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </CardContent>
  </Card>
);

const DashboardPage = async () => {
  const [stats, metrics] = await Promise.all([getDashboardStats(), getMetrics()]);

  const checklistPct = stats.checklist.total
    ? Math.round((stats.checklist.done / stats.checklist.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da qualidade e progresso do Administra.ai</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Testes passando"
          value={`${stats.tests.passRate}%`}
          hint={`${stats.tests.byStatus.PASSOU}/${stats.tests.total} testes`}
          icon={FlaskConical}
          accent="bg-green-100 text-green-700"
        />
        <StatCard
          title="Bugs abertos"
          value={`${stats.bugs.abertos}`}
          hint={`${stats.bugs.total} no total`}
          icon={Bug}
          accent="bg-amber-100 text-amber-700"
        />
        <StatCard
          title="Bugs críticos"
          value={`${stats.bugs.criticos}`}
          hint="prioridade alta em aberto"
          icon={ShieldAlert}
          accent="bg-red-100 text-red-700"
        />
        <StatCard
          title="Checklist produção"
          value={`${checklistPct}%`}
          hint={`${stats.checklist.done}/${stats.checklist.total} itens`}
          icon={ListChecks}
          accent="bg-blue-100 text-blue-700"
        />
      </div>

      {/* Indicadores gerais (métricas) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Indicadores Gerais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{m.label}</p>
                <p className="text-xs text-muted-foreground">Meta: {m.target}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{m.current}</span>
                <span className="text-lg">{m.status}</span>
              </div>
            </div>
          ))}
          {metrics.length === 0 && (
            <p className="text-sm text-muted-foreground">Sem métricas. Rode o seed do banco.</p>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Progresso de testes por sprint</CardTitle>
          </CardHeader>
          <CardContent>
            <SprintProgressChart data={stats.sprintProgress} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Testes por tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <TestTypeChart data={stats.tests.byType} />
          </CardContent>
        </Card>
      </div>

      {/* Bugs por prioridade */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bugs por prioridade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {priorityMeta &&
            (['ALTA', 'MEDIA', 'BAIXA'] as const).map((p) => {
              const count = stats.bugs.byPriority[p];
              const pct = stats.bugs.total ? Math.round((count / stats.bugs.total) * 100) : 0;
              return (
                <div key={p} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary" className={priorityMeta[p].className}>
                      {priorityMeta[p].emoji} {priorityMeta[p].label}
                    </Badge>
                    <span className="text-muted-foreground">{count} bugs</span>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
