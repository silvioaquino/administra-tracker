import { ChecklistView, type ChecklistDTO } from '@/components/checklist/ChecklistView';
import { getChecklist } from '@/lib/data';

export const dynamic = 'force-dynamic';

const ChecklistPage = async () => {
  const items = await getChecklist();

  const dto: ChecklistDTO[] = items.map((i) => ({
    id: i.id,
    category: i.category,
    label: i.label,
    done: i.done,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Checklist de Produção</h1>
        <p className="text-sm text-muted-foreground">Pré-requisitos para o lançamento do Administra.ai</p>
      </div>
      {dto.length === 0 ? (
        <p className="text-sm text-muted-foreground">Checklist vazio. Configure o banco e rode o seed.</p>
      ) : (
        <ChecklistView items={dto} />
      )}
    </div>
  );
};

export default ChecklistPage;
