'use client';

import { useMemo, useState, useEffect } from 'react';
import type { BugStatus, Priority } from '@prisma/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Edit, Plus, Search, X, Filter } from 'lucide-react';
import { bugStatusMeta, bugStatusOrder, priorityMeta, priorityOrder } from '@/lib/labels';

export type BugDTO = {
  id: string;
  code: string;
  title: string;
  description?: string;
  day: string | null;
  sprintRef: string | null;
  priority: Priority;
  status: BugStatus;
  assignee: { id?: string; handle: string } | null;
  sprintId?: string | null;
};

type Filter = Priority | 'TODOS';

export const BugsView = ({ bugs: initialBugs }: { bugs: BugDTO[] }) => {
  const [bugs, setBugs] = useState<BugDTO[]>(initialBugs);
  const [filter, setFilter] = useState<Filter>('TODOS');
  
  // Estados de edição/criação
  const [editingBug, setEditingBug] = useState<BugDTO | null>(null);
  const [isBugDialogOpen, setIsBugDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<BugStatus | 'ALL'>('ALL');
  const [users, setUsers] = useState<Array<{ id: string; name: string; handle: string }>>([]);
  const [sprints, setSprints] = useState<Array<{ id: string; number: number; title: string }>>([]);
  
  // Formulário de bug
  const [bugForm, setBugForm] = useState({
    code: '',
    title: '',
    description: '',
    day: '',
    sprintId: '',
    priority: 'MEDIA' as Priority,
    status: 'PENDENTE' as BugStatus,
    assigneeId: '',
  });

  // Carregar usuários e sprints
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(console.error);
    
    fetch('/api/sprints/list')
      .then(res => res.json())
      .then(data => setSprints(data))
      .catch(console.error);
  }, []);

  const patch = async (id: string, data: Partial<Pick<BugDTO, 'status' | 'priority'>>) => {
    const previous = bugs.find((b) => b.id === id);
    setBugs((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
    try {
      const res = await fetch(`/api/bugs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success('Bug atualizado');
    } catch {
      if (previous) setBugs((prev) => prev.map((b) => (b.id === id ? previous : b)));
      toast.error('Não foi possível atualizar o bug');
    }
  };

  const handleNewBug = () => {
    setBugForm({
      code: '',
      title: '',
      description: '',
      day: '',
      sprintId: '',
      priority: 'MEDIA',
      status: 'PENDENTE',
      assigneeId: '',
    });
    setEditingBug(null);
    setIsBugDialogOpen(true);
  };

  const handleEditBug = (bug: BugDTO) => {
    setBugForm({
      code: bug.code,
      title: bug.title,
      description: bug.description || '',
      day: bug.day || '',
      sprintId: bug.sprintId || '',
      priority: bug.priority,
      status: bug.status,
      assigneeId: bug.assignee?.id || '',
    });
    setEditingBug(bug);
    setIsBugDialogOpen(true);
  };

  const saveBug = async () => {
    if (!bugForm.code || !bugForm.title) {
      toast.error('Código e título são obrigatórios');
      return;
    }

    setLoading(true);

    const payload = {
      code: bugForm.code,
      title: bugForm.title,
      description: bugForm.description || null,
      day: bugForm.day || null,
      sprintId: bugForm.sprintId || null,
      priority: bugForm.priority,
      status: bugForm.status,
      assigneeId: bugForm.assigneeId || null,
    };

    try {
      let response;
      if (editingBug) {
        response = await fetch(`/api/bugs/${editingBug.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/bugs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error();

      const savedBug = await response.json();

      if (editingBug) {
        setBugs(prev => prev.map(b => b.id === savedBug.id ? savedBug : b));
        toast.success('Bug atualizado com sucesso!');
      } else {
        setBugs(prev => [savedBug, ...prev]);
        toast.success('Bug criado com sucesso!');
      }

      setIsBugDialogOpen(false);
    } catch {
      toast.error(editingBug ? 'Erro ao atualizar bug' : 'Erro ao criar bug');
    } finally {
      setLoading(false);
    }
  };

  const deleteBug = async () => {
    if (!editingBug) return;
    if (!confirm('Tem certeza que deseja excluir este bug?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/bugs/${editingBug.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error();
      
      setBugs(prev => prev.filter(b => b.id !== editingBug.id));
      toast.success('Bug excluído com sucesso!');
      setIsBugDialogOpen(false);
    } catch {
      toast.error('Erro ao excluir bug');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar bugs
  const filteredBugs = useMemo(() => {
    let filtered = bugs;

    // Filtro por prioridade
    if (filter !== 'TODOS') {
      filtered = filtered.filter(b => b.priority === filter);
    }

    // Filtro por status
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }

    // Busca textual
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.code.toLowerCase().includes(searchLower) ||
        b.title.toLowerCase().includes(searchLower) ||
        (b.description && b.description.toLowerCase().includes(searchLower)) ||
        (b.sprintRef && b.sprintRef.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [bugs, filter, filterStatus, searchTerm]);

  const counts = useMemo(
    () => ({
      TODOS: bugs.length,
      ALTA: bugs.filter((b) => b.priority === 'ALTA').length,
      MEDIA: bugs.filter((b) => b.priority === 'MEDIA').length,
      BAIXA: bugs.filter((b) => b.priority === 'BAIXA').length,
    }),
    [bugs],
  );

  const clearFilters = () => {
    setSearchTerm('');
    setFilter('TODOS');
    setFilterStatus('ALL');
  };

  const hasActiveFilters = searchTerm !== '' || filter !== 'TODOS' || filterStatus !== 'ALL';

  return (
    <>
      <div className="space-y-4">
        {/* Cabeçalho com botão de novo bug */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button onClick={handleNewBug}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Bug
            </Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Filtros */}
        {(showFilters || hasActiveFilters) && (
          <Card className="p-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar bugs por código, título ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Select value={filterStatus} onValueChange={(v) => setFilterStatus((v ?? 'ALL') as BugStatus | 'ALL')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status do bug" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos os status</SelectItem>
                      {bugStatusOrder.map(st => (
                        <SelectItem key={st} value={st}>
                          {bugStatusMeta[st].emoji} {bugStatusMeta[st].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Limpar filtros
                </Button>
              )}
              
              {hasActiveFilters && (
                <p className="text-xs text-muted-foreground">
                  Mostrando {filteredBugs.length} de {bugs.length} bugs
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Filtros de prioridade */}
        <div className="flex flex-wrap gap-2">
          {(['TODOS', ...priorityOrder] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                filter === f ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              {f === 'TODOS' ? 'Todos' : `${priorityMeta[f].emoji} ${priorityMeta[f].label}`} ({counts[f]})
            </button>
          ))}
        </div>

        {/* Tabela de bugs */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Bug</TableHead>
                  <TableHead className="w-20">Sprint</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-24">Resp.</TableHead>
                  <TableHead className="w-36">Prioridade</TableHead>
                  <TableHead className="w-40">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBugs.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.code}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {b.sprintRef}
                      {b.day ? ` · ${b.day}` : ''}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{b.title}</div>
                      {b.description && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {b.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{b.assignee?.handle ?? '—'}</TableCell>
                    <TableCell>
                      <Select value={b.priority} onValueChange={(v) => patch(b.id, { priority: v as Priority })}>
                        <SelectTrigger size="sm" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOrder.map((p) => (
                            <SelectItem key={p} value={p}>
                              {priorityMeta[p].emoji} {priorityMeta[p].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select value={b.status} onValueChange={(v) => patch(b.id, { status: v as BugStatus })}>
                          <SelectTrigger size="sm" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {bugStatusOrder.map((st) => (
                              <SelectItem key={st} value={st}>
                                {bugStatusMeta[st].emoji} {bugStatusMeta[st].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBug(b)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredBugs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum bug encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Dialog de Criação/Edição de Bug */}
      <Dialog open={isBugDialogOpen} onOpenChange={setIsBugDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBug ? 'Editar Bug' : 'Novo Bug'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={bugForm.code}
                  onChange={(e) => setBugForm({ ...bugForm, code: e.target.value })}
                  placeholder="Ex: BUG-001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sprintId">Sprint (opcional)</Label>
                <Select
                  value={bugForm.sprintId || 'none'}
                  onValueChange={(v) => setBugForm({ ...bugForm, sprintId: v === 'none' ? '' : (v ?? '') })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma sprint" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {sprints.map(sprint => (
                      <SelectItem key={sprint.id} value={sprint.id}>
                        Sprint #{sprint.number}: {sprint.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={bugForm.title}
                onChange={(e) => setBugForm({ ...bugForm, title: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                rows={4}
                value={bugForm.description}
                onChange={(e) => setBugForm({ ...bugForm, description: e.target.value })}
                placeholder="Descreva o bug, passos para reproduzir, etc."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="day">Dia (opcional)</Label>
                <Input
                  id="day"
                  value={bugForm.day}
                  onChange={(e) => setBugForm({ ...bugForm, day: e.target.value })}
                  placeholder="Ex: Dia 15"
                />
              </div>
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={bugForm.priority} onValueChange={(v) => setBugForm({ ...bugForm, priority: v as Priority })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOrder.map(p => (
                      <SelectItem key={p} value={p}>
                        {priorityMeta[p].emoji} {priorityMeta[p].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={bugForm.status} onValueChange={(v) => setBugForm({ ...bugForm, status: v as BugStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bugStatusOrder.map(st => (
                      <SelectItem key={st} value={st}>
                        {bugStatusMeta[st].emoji} {bugStatusMeta[st].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assigneeId">Responsável</Label>
                <Select
                  value={bugForm.assigneeId || 'none'}
                  onValueChange={(v) => setBugForm({ ...bugForm, assigneeId: v === 'none' ? '' : (v ?? '') })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não atribuído</SelectItem>
                    {users.map(user => (
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
            {editingBug && (
              <Button variant="destructive" onClick={deleteBug} disabled={loading}>
                Excluir
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsBugDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveBug} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};