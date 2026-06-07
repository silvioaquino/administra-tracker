'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestDTO } from './SprintsView';
import { toast } from 'sonner';

interface TestEditDialogProps {
  test: TestDTO | null;
  sprintId: string;
  users: Array<{ id: string; name: string; handle: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function TestEditDialog({ test, sprintId, users, open, onOpenChange, onSave }: TestEditDialogProps) {
  const [formData, setFormData] = useState({
    code: '',
    type: '',
    title: '',
    scenario: '',
    expected: '',
    status: 'PENDENTE',
    assigneeId: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sincroniza o formulário quando o teste em edição muda (padrão intencional).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(
      test
        ? {
            code: test.code,
            type: test.type,
            title: test.title,
            scenario: test.scenario,
            expected: test.expected,
            status: test.status,
            assigneeId: test.assignee?.id || 'none',
          }
        : {
            code: '',
            type: '',
            title: '',
            scenario: '',
            expected: '',
            status: 'PENDENTE',
            assigneeId: 'none',
          },
    );
  }, [test]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      assigneeId: formData.assigneeId === 'none' ? null : formData.assigneeId,
    };

    try {
      let response;
      if (test) {
        // Update existente
        response = await fetch(`/api/tests/${test.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Criar novo
        response = await fetch(`/api/sprints/${sprintId}/tests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error('Erro ao salvar teste');

      toast.success(test ? 'Teste atualizado com sucesso!' : 'Teste criado com sucesso!');
      onSave();
      onOpenChange(false);
    } catch {
      toast.error('Erro ao salvar teste');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!test) return;
    if (!confirm('Tem certeza que deseja excluir este teste?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tests/${test.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir teste');

      toast.success('Teste excluído com sucesso!');
      onSave();
      onOpenChange(false);
    } catch {
      toast.error('Erro ao excluir teste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{test ? `Editar Teste ${test.code}` : 'Novo Teste'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value ?? '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEGURANCA">Segurança</SelectItem>
                    <SelectItem value="UNITARIO">Unitário</SelectItem>
                    <SelectItem value="INTEGRACAO">Integração</SelectItem>
                    <SelectItem value="E2E">E2E</SelectItem>
                    <SelectItem value="USABILIDADE">Usabilidade</SelectItem>
                    <SelectItem value="PERFORMANCE">Performance</SelectItem>
                    <SelectItem value="UI_UX">UI/UX</SelectItem>
                    <SelectItem value="ACESSIBILIDADE">Acessibilidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <div>
              <Label htmlFor="scenario">Cenário</Label>
              <Textarea
                id="scenario"
                rows={3}
                value={formData.scenario}
                onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="expected">Resultado Esperado</Label>
              <Textarea
                id="expected"
                rows={3}
                value={formData.expected}
                onChange={(e) => setFormData({ ...formData, expected: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value ?? '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDENTE">Pendente</SelectItem>
                    <SelectItem value="EXECUTANDO">Executando</SelectItem>
                    <SelectItem value="PASSOU">Passou</SelectItem>
                    <SelectItem value="FALHOU">Falhou</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assigneeId">Responsável</Label>
                <Select value={formData.assigneeId} onValueChange={(value) => setFormData({ ...formData, assigneeId: value ?? 'none' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não atribuído</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} (@{user.handle})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            {test && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                Excluir Teste
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