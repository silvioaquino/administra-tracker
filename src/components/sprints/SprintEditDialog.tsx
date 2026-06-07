'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SprintDTO } from './SprintsView';
import { toast } from 'sonner';

interface SprintEditDialogProps {
  sprint: SprintDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function SprintEditDialog({ sprint, open, onOpenChange, onSave }: SprintEditDialogProps) {
  const [formData, setFormData] = useState({
    number: 0,
    title: '',
    dayStart: 0,
    dayEnd: 0,
    status: 'NAO_INICIADO',
    expectedBugs: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sprint) {
      // Sincroniza o formulário quando a sprint em edição muda (padrão intencional).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        number: sprint.number,
        title: sprint.title,
        dayStart: sprint.dayStart,
        dayEnd: sprint.dayEnd,
        status: sprint.status,
        expectedBugs: sprint.expectedBugs ?? '',
      });
    }
  }, [sprint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprint) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/sprints/${sprint.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, expectedBugs: formData.expectedBugs.trim() || null }),
      });

      if (!response.ok) throw new Error('Erro ao salvar sprint');

      toast.success('Sprint atualizada com sucesso!');
      onSave();
      onOpenChange(false);
    } catch {
      toast.error('Erro ao salvar sprint');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!sprint) return;
    if (!confirm('Tem certeza que deseja excluir esta sprint? Todos os testes associados também serão excluídos.')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/sprints/${sprint.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir sprint');

      toast.success('Sprint excluída com sucesso!');
      onSave();
      onOpenChange(false);
    } catch {
      toast.error('Erro ao excluir sprint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Sprint #{sprint?.number}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="number">Número da Sprint</Label>
              <Input
                id="number"
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dayStart">Dia Início</Label>
                <Input
                  id="dayStart"
                  type="number"
                  value={formData.dayStart}
                  onChange={(e) => setFormData({ ...formData, dayStart: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dayEnd">Dia Fim</Label>
                <Input
                  id="dayEnd"
                  type="number"
                  value={formData.dayEnd}
                  onChange={(e) => setFormData({ ...formData, dayEnd: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value ?? '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NAO_INICIADO">Não iniciado</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
                  <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expectedBugs">Bugs Esperados</Label>
              <Input
                id="expectedBugs"
                placeholder="Ex: BUG-001, BUG-002"
                value={formData.expectedBugs}
                onChange={(e) => setFormData({ ...formData, expectedBugs: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            {sprint && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                Excluir Sprint
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}