'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ImprovementStatus, Priority } from '@prisma/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Edit, Plus, Search, X, Filter } from 'lucide-react';
import { improvementStatusMeta, priorityMeta, priorityOrder } from '@/lib/labels';

export type ImprovementDTO = {
  id: string;
  code: string;
  title: string;
  description?: string;
  priority: Priority;
  status: ImprovementStatus;
  sprintRef: string | null;
  sprintId?: string | null;
  assignee: { id?: string; handle: string; name?: string } | null;
};

const statusOrder: ImprovementStatus[] = ['PENDENTE', 'EM_ANALISE', 'IMPLEMENTADO'];

export const ImprovementsView = ({ improvements: initialImprovements }: { improvements: ImprovementDTO[] }) => {
  const [improvements, setImprovements] = useState<ImprovementDTO[]>(initialImprovements);
  
  // Estados de edição/criação
  const [editingImprovement, setEditingImprovement] = useState<ImprovementDTO | null>(null);
  const [isImprovementDialogOpen, setIsImprovementDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ImprovementStatus | 'ALL'>('ALL');
  const [filterPriority, setFilterPriority] = useState<Priority | 'ALL'>('ALL');
  const [users, setUsers] = useState<Array<{ id: string; name: string; handle: string }>>([]);
  const [sprints, setSprints] = useState<Array<{ id: string; number: number; title: string }>>([]);
  
  // Formulário de melhoria
  const [improvementForm, setImprovementForm] = useState({
    code: '',
    title: '',
    description: '',
    priority: 'MEDIA' as Priority,
    status: 'PENDENTE' as ImprovementStatus,
    sprintId: '',
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

  const updateStatus = async (id: string, status: ImprovementStatus) => {
    const previous = improvements.find((i) => i.id === id);
    setImprovements((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      const res = await fetch(`/api/improvements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success('Melhoria atualizada');
    } catch {
      if (previous) setImprovements((prev) => prev.map((i) => (i.id === id ? previous : i)));
      toast.error('Não foi possível atualizar');
    }
  };

  const handleNewImprovement = () => {
    setImprovementForm({
      code: '',
      title: '',
      description: '',
      priority: 'MEDIA',
      status: 'PENDENTE',
      sprintId: '',
      assigneeId: '',
    });
    setEditingImprovement(null);
    setIsImprovementDialogOpen(true);
  };

  const handleEditImprovement = (improvement: ImprovementDTO) => {
    setImprovementForm({
      code: improvement.code,
      title: improvement.title,
      description: improvement.description || '',
      priority: improvement.priority,
      status: improvement.status,
      sprintId: improvement.sprintId || '',
      assigneeId: improvement.assignee?.id || '',
    });
    setEditingImprovement(improvement);
    setIsImprovementDialogOpen(true);
  };

  const saveImprovement = async () => {
    if (!improvementForm.code || !improvementForm.title) {
      toast.error('Código e título são obrigatórios');
      return;
    }

    setLoading(true);

    const payload = {
      code: improvementForm.code,
      title: improvementForm.title,
      description: improvementForm.description || null,
      priority: improvementForm.priority,
      status: improvementForm.status,
      sprintId: improvementForm.sprintId || null,
      assigneeId: improvementForm.assigneeId || null,
    };

    try {
      let response;
      if (editingImprovement) {
        response = await fetch(`/api/improvements/${editingImprovement.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/improvements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error();

      const savedImprovement = await response.json();

      if (editingImprovement) {
        setImprovements(prev => prev.map(i => i.id === savedImprovement.id ? savedImprovement : i));
        toast.success('Melhoria atualizada com sucesso!');
      } else {
        setImprovements(prev => [savedImprovement, ...prev]);
        toast.success('Melhoria criada com sucesso!');
      }

      setIsImprovementDialogOpen(false);
    } catch {
      toast.error(editingImprovement ? 'Erro ao atualizar melhoria' : 'Erro ao criar melhoria');
    } finally {
      setLoading(false);
    }
  };

  const deleteImprovement = async () => {
    if (!editingImprovement) return;
    if (!confirm('Tem certeza que deseja excluir esta melhoria?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/improvements/${editingImprovement.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error();
      
      setImprovements(prev => prev.filter(i => i.id !== editingImprovement.id));
      toast.success('Melhoria excluída com sucesso!');
      setIsImprovementDialogOpen(false);
    } catch {
      toast.error('Erro ao excluir melhoria');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar melhorias
  const filteredImprovements = useMemo(() => {
    let filtered = improvements;

    // Filtro por status
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(i => i.status === filterStatus);
    }

    // Filtro por prioridade
    if (filterPriority !== 'ALL') {
      filtered = filtered.filter(i => i.priority === filterPriority);
    }

    // Busca textual
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(i => 
        i.code.toLowerCase().includes(searchLower) ||
        i.title.toLowerCase().includes(searchLower) ||
        (i.description && i.description.toLowerCase().includes(searchLower)) ||
        (i.sprintRef && i.sprintRef.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [improvements, filterStatus, filterPriority, searchTerm]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('ALL');
    setFilterPriority('ALL');
  };

  const hasActiveFilters = searchTerm !== '' || filterStatus !== 'ALL' || filterPriority !== 'ALL';

  // Estatísticas
  const stats = useMemo(() => ({
    total: improvements.length,
    pendente: improvements.filter(i => i.status === 'PENDENTE').length,
    emAnalise: improvements.filter(i => i.status === 'EM_ANALISE').length,
    implementado: improvements.filter(i => i.status === 'IMPLEMENTADO').length,
    alta: improvements.filter(i => i.priority === 'ALTA').length,
    media: improvements.filter(i => i.priority === 'MEDIA').length,
    baixa: improvements.filter(i => i.priority === 'BAIXA').length,
  }), [improvements]);

  return (
    <>
      <div className="space-y-4">
        {/* Cabeçalho com botão de nova melhoria */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button onClick={handleNewImprovement}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Melhoria
            </Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pendente}</p>
            <p className="text-xs text-muted-foreground">Pendente</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.emAnalise}</p>
            <p className="text-xs text-muted-foreground">Em Análise</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.implementado}</p>
            <p className="text-xs text-muted-foreground">Implementado</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.alta}</p>
            <p className="text-xs text-muted-foreground">Alta Prioridade</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold">{stats.media + stats.baixa}</p>
            <p className="text-xs text-muted-foreground">Média/Baixa</p>
          </Card>
        </div>

        {/* Filtros */}
        {(showFilters || hasActiveFilters) && (
          <Card className="p-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar melhorias por código, título ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Select value={filterStatus} onValueChange={(v) => setFilterStatus((v ?? 'ALL') as ImprovementStatus | 'ALL')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status da melhoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos os status</SelectItem>
                      {statusOrder.map(st => (
                        <SelectItem key={st} value={st}>
                          {improvementStatusMeta[st].emoji} {improvementStatusMeta[st].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterPriority} onValueChange={(v) => setFilterPriority((v ?? 'ALL') as Priority | 'ALL')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todas as prioridades</SelectItem>
                      {priorityOrder.map(p => (
                        <SelectItem key={p} value={p}>
                          {priorityMeta[p].emoji} {priorityMeta[p].label}
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
                  Mostrando {filteredImprovements.length} de {improvements.length} melhorias
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Lista de melhorias */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredImprovements.map((i) => (
            <Card key={i.id} className="hover:shadow-md transition-shadow">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-muted-foreground">{i.code}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleEditImprovement(i)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-medium mt-1">{i.title}</p>
                    {i.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {i.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className={improvementStatusMeta[i.status].className}>
                    {improvementStatusMeta[i.status].emoji} {improvementStatusMeta[i.status].label}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className={priorityMeta[i.priority].className}>
                    {priorityMeta[i.priority].emoji} {priorityMeta[i.priority].label}
                  </Badge>
                  {i.sprintRef && (
                    <span className="flex items-center gap-1">
                      📋 Sprint {i.sprintRef}
                    </span>
                  )}
                  {i.assignee && (
                    <span className="flex items-center gap-1">
                      👤 {i.assignee.name || i.assignee.handle}
                    </span>
                  )}
                </div>
                <Select value={i.status} onValueChange={(v) => updateStatus(i.id, v as ImprovementStatus)}>
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOrder.map((st) => (
                      <SelectItem key={st} value={st}>
                        {improvementStatusMeta[st].emoji} {improvementStatusMeta[st].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredImprovements.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            Nenhuma melhoria encontrada.
          </Card>
        )}
      </div>

      {/* Dialog de Criação/Edição de Melhoria */}
      <Dialog open={isImprovementDialogOpen} onOpenChange={setIsImprovementDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingImprovement ? 'Editar Melhoria' : 'Nova Melhoria'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={improvementForm.code}
                  onChange={(e) => setImprovementForm({ ...improvementForm, code: e.target.value })}
                  placeholder="Ex: IMP-001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sprintId">Sprint (opcional)</Label>
                <Select
                  value={improvementForm.sprintId || 'none'}
                  onValueChange={(v) => setImprovementForm({ ...improvementForm, sprintId: v === 'none' ? '' : (v ?? '') })}
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
                value={improvementForm.title}
                onChange={(e) => setImprovementForm({ ...improvementForm, title: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                rows={4}
                value={improvementForm.description}
                onChange={(e) => setImprovementForm({ ...improvementForm, description: e.target.value })}
                placeholder="Descreva a melhoria, benefícios esperados, etc."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={improvementForm.priority} onValueChange={(v) => setImprovementForm({ ...improvementForm, priority: v as Priority })}>
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
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={improvementForm.status} onValueChange={(v) => setImprovementForm({ ...improvementForm, status: v as ImprovementStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOrder.map(st => (
                      <SelectItem key={st} value={st}>
                        {improvementStatusMeta[st].emoji} {improvementStatusMeta[st].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="assigneeId">Responsável</Label>
              <Select
                value={improvementForm.assigneeId || 'none'}
                onValueChange={(v) => setImprovementForm({ ...improvementForm, assigneeId: v === 'none' ? '' : (v ?? '') })}
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
          <DialogFooter className="gap-2">
            {editingImprovement && (
              <Button variant="destructive" onClick={deleteImprovement} disabled={loading}>
                Excluir
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsImprovementDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveImprovement} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};