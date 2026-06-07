'use client';

import { useMemo, useState } from 'react';
import { Check, Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type ChecklistDTO = {
  id: string;
  category: string;
  label: string;
  done: boolean;
};

export const ChecklistView = ({ items: initialItems }: { items: ChecklistDTO[] }) => {
  const [items, setItems] = useState<ChecklistDTO[]>(initialItems);
  
  // Estados de edição/criação
  const [editingItem, setEditingItem] = useState<ChecklistDTO | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // Formulário de item
  const [itemForm, setItemForm] = useState({
    category: '',
    label: '',
  });
  
  // Formulário de nova categoria
  const [newCategory, setNewCategory] = useState('');
  
  // Categorias disponíveis
  const categories = useMemo(() => {
    const cats = new Set(items.map(i => i.category));
    return Array.from(cats).sort();
  }, [items]);

  const toggle = async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const done = !target.done;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done } : i)));
    try {
      const res = await fetch(`/api/checklist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done }),
      });
      if (!res.ok) throw new Error();
      toast.success(done ? 'Item marcado como concluído' : 'Item desmarcado');
    } catch {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !done } : i)));
      toast.error('Não foi possível salvar');
    }
  };

  const handleNewItem = () => {
    setItemForm({
      category: categories[0] || '',
      label: '',
    });
    setEditingItem(null);
    setIsItemDialogOpen(true);
  };

  const handleEditItem = (item: ChecklistDTO) => {
    setItemForm({
      category: item.category,
      label: item.label,
    });
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };

  const saveItem = async () => {
    if (!itemForm.category || !itemForm.label) {
      toast.error('Categoria e descrição são obrigatórios');
      return;
    }

    setLoading(true);
    
    try {
      let response;
      if (editingItem) {
        response = await fetch(`/api/checklist/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemForm),
        });
      } else {
        response = await fetch('/api/checklist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemForm),
        });
      }
      
      if (!response.ok) throw new Error();
      
      const savedItem = await response.json();
      
      if (editingItem) {
        setItems(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
        toast.success('Item atualizado com sucesso!');
      } else {
        setItems(prev => [...prev, savedItem]);
        toast.success('Item criado com sucesso!');
      }
      
      setIsItemDialogOpen(false);
    } catch {
      toast.error(editingItem ? 'Erro ao atualizar item' : 'Erro ao criar item');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    if (!editingItem) return;
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/checklist/${editingItem.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error();
      
      setItems(prev => prev.filter(i => i.id !== editingItem.id));
      toast.success('Item excluído com sucesso!');
      setIsItemDialogOpen(false);
    } catch {
      toast.error('Erro ao excluir item');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/checklist/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory }),
      });
      
      if (!response.ok) throw new Error();
      
      toast.success('Categoria criada! Você pode adicionar itens agora.');
      setNewCategory('');
      setIsCategoryDialogOpen(false);
      
      // Recarregar itens para mostrar a nova categoria
      const refreshResponse = await fetch('/api/checklist');
      const refreshedItems = await refreshResponse.json();
      setItems(refreshedItems);
    } catch {
      toast.error('Erro ao criar categoria');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryToDelete: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${categoryToDelete}" e todos os seus itens?`)) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/checklist/categories?category=${encodeURIComponent(categoryToDelete)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error();
      
      setItems(prev => prev.filter(i => i.category !== categoryToDelete));
      if (selectedCategory === categoryToDelete) {
        setSelectedCategory('ALL');
      }
      toast.success('Categoria excluída com sucesso!');
    } catch {
      toast.error('Erro ao excluir categoria');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar itens
  const filteredItems = useMemo(() => {
    let filtered = items;
    
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(i => i.category === selectedCategory);
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(i => 
        i.label.toLowerCase().includes(searchLower) ||
        i.category.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [items, selectedCategory, searchTerm]);

  // Agrupar por categoria após filtro
  const grouped = useMemo(() => {
    const map = new Map<string, ChecklistDTO[]>();
    for (const item of filteredItems) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredItems]);

  const totalItems = items.length;
  const totalDone = items.filter(i => i.done).length;
  const totalPct = totalItems ? Math.round((totalDone / totalItems) * 100) : 0;

  return (
    <>
      <div className="space-y-6">
        {/* Cabeçalho com estatísticas */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-2xl font-bold">{totalDone}/{totalItems}</p>
                <p className="text-xs text-muted-foreground">Total concluído</p>
              </div>
              <div className="flex-1 max-w-xs">
                <Progress value={totalPct} />
                <p className="text-xs text-muted-foreground mt-1">{totalPct}% completo</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewItem}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar itens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v ?? 'ALL')}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas categorias</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {searchTerm && (
            <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
              <X className="h-4 w-4 mr-2" />
              Limpar busca
            </Button>
          )}
        </div>

        {/* Lista de categorias e itens - Mantido alinhado à esquerda */}
        {grouped.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {searchTerm || selectedCategory !== 'ALL' 
              ? 'Nenhum item encontrado com os filtros aplicados.'
              : 'Nenhum item no checklist. Clique em "Novo Item" para começar!'}
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {grouped.map(([category, catItems]) => {
              const done = catItems.filter((i) => i.done).length;
              const pct = Math.round((done / catItems.length) * 100);
              return (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{category}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => deleteCategory(category)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {done}/{catItems.length}
                      </span>
                    </div>
                    <Progress value={pct} />
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {catItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted group"
                      >
                        <button
                          onClick={() => toggle(item.id)}
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                          <span
                            className={cn(
                              'flex size-5 shrink-0 items-center justify-center rounded border',
                              item.done ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
                            )}
                          >
                            {item.done && <Check className="size-3.5" />}
                          </span>
                          <span className={cn(item.done && 'text-muted-foreground line-through', 'flex-1')}>
                            {item.label}
                          </span>
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog de Criação/Edição de Item */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={itemForm.category} onValueChange={(v) => setItemForm({ ...itemForm, category: v ?? '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="label">Descrição *</Label>
              <Input
                id="label"
                value={itemForm.label}
                onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                placeholder="Ex: Configurar variáveis de ambiente"
                required
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            {editingItem && (
              <Button variant="destructive" onClick={deleteItem} disabled={loading}>
                Excluir
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveItem} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Nova Categoria */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newCategory">Nome da Categoria *</Label>
              <Input
                id="newCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Ex: Infraestrutura, Segurança, Testes"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Após criar a categoria, você poderá adicionar itens a ela.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createCategory} disabled={loading}>
              {loading ? 'Criando...' : 'Criar Categoria'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};