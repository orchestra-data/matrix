
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Settings,
  Save,
  Trash2,
  Search,
  BookOpen,
  Video,
  FileText,
  Layers,
  Clock,
  Target,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  AlignLeft,
  Paperclip,
  FileCheck,
  X,
  Edit
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Components() {
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('midia');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUnits, setExpandedUnits] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [newObjective, setNewObjective] = useState('');
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  const [unitFormData, setUnitFormData] = useState({
    series_id: "",
    nome: "",
    sequence_order: 1,
    descricao: "",
    duracao_estimada_horas: 4
  });

  const queryClient = useQueryClient();

  const { data: series } = useQuery({
    queryKey: ['series'],
    queryFn: () => base44.entities.Series.list(),
    initialData: []
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list('sequence_order'),
    initialData: []
  });

  // CRITICAL FIX: Garantir que components sempre venha do cache atualizado
  const { data: components = [] } = useQuery({
    queryKey: ['components'],
    queryFn: () => base44.entities.Component.list('sequence_order'),
    initialData: [],
    // Força re-render quando o cache muda
    refetchOnMount: false,
    staleTime: 0
  });

  // Component templates - EXPANDED
  const componentTemplates = {
    midia: [
      {
        id: 'video',
        icon: Video,
        title: 'Vídeo-aula',
        description: 'Vídeo educacional',
        tipo: 'midia',
        conteudo_tipo: 'video',
        color: 'blue'
      },
      {
        id: 'audio',
        icon: FileText,
        title: 'Podcast/Áudio',
        description: 'Conteúdo em áudio',
        tipo: 'midia',
        conteudo_tipo: 'audio',
        color: 'purple'
      },
      {
        id: 'texto',
        icon: AlignLeft,
        title: 'Texto Rico',
        description: 'Artigo ou conteúdo textual',
        tipo: 'texto',
        conteudo_tipo: 'texto_rico',
        color: 'green'
      }],

    atividade: [
      {
        id: 'tarefa',
        icon: FileCheck,
        title: 'Tarefa',
        description: 'Atividade com entrega',
        tipo: 'atividade',
        conteudo_tipo: 'link',
        color: 'yellow'
      },
      {
        id: 'forum',
        icon: BookOpen,
        title: 'Fórum de Discussão',
        description: 'Discussão colaborativa',
        tipo: 'atividade',
        conteudo_tipo: 'forum',
        color: 'orange'
      },
      {
        id: 'drag_drop',
        icon: Target,
        title: 'Arraste e Solte',
        description: 'Exercício de correspondência',
        tipo: 'atividade',
        conteudo_tipo: 'drag_drop_exercise',
        color: 'cyan'
      },
      {
        id: 'fill_blanks',
        icon: AlignLeft,
        title: 'Preencha Lacunas',
        description: 'Complete o texto',
        tipo: 'atividade',
        conteudo_tipo: 'fill_blanks',
        color: 'teal'
      }],

    avaliacao: [
      {
        id: 'quiz_multipla',
        icon: CheckCircle2,
        title: 'Quiz - Múltipla Escolha',
        description: 'Questões de múltipla escolha',
        tipo: 'avaliacao',
        conteudo_tipo: 'quiz_multiple_choice',
        color: 'red'
      },
      {
        id: 'quiz_vf',
        icon: CheckCircle2,
        title: 'Quiz - Verdadeiro/Falso',
        description: 'Questões V ou F',
        tipo: 'avaliacao',
        conteudo_tipo: 'quiz_true_false',
        color: 'rose'
      },
      {
        id: 'quiz_curta',
        icon: FileText,
        title: 'Quiz - Resposta Curta',
        description: 'Questões dissertativas curtas',
        tipo: 'avaliacao',
        conteudo_tipo: 'quiz_short_answer',
        color: 'pink'
      },
      {
        id: 'prova',
        icon: CheckCircle2,
        title: 'Avaliação Formal',
        description: 'Prova ou teste completo',
        tipo: 'avaliacao',
        conteudo_tipo: 'link',
        color: 'red'
      }],

    anexo: [
      {
        id: 'pdf',
        icon: FileText,
        title: 'Documento PDF',
        description: 'Arquivo PDF para download',
        tipo: 'anexo',
        conteudo_tipo: 'pdf',
        color: 'indigo'
      },
      {
        id: 'link',
        icon: LinkIcon,
        title: 'Link Externo',
        description: 'Recurso externo',
        tipo: 'anexo',
        conteudo_tipo: 'link',
        color: 'cyan'
      }]

  };

  const categories = [
    { id: 'midia', label: 'Mídia', icon: Video },
    { id: 'atividade', label: 'Atividades', icon: FileCheck },
    { id: 'avaliacao', label: 'Avaliações', icon: CheckCircle2 },
    { id: 'anexo', label: 'Anexos', icon: LinkIcon }];


  // Mutations
  const updateComponentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Component.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      showNotification('Componente atualizado!', 'success');
    },
    onError: (error) => {
      console.error('❌ Erro ao atualizar componente:', error);
      showNotification('Erro ao atualizar componente.', 'error');
    }
  });

  const createComponentMutation = useMutation({
    mutationFn: (data) => base44.entities.Component.create(data),
    onSuccess: (newComponent) => {
      // Adiciona o novo componente ao cache imediatamente
      queryClient.setQueryData(['components'], (oldData) => {
        if (!oldData) return [newComponent];
        return [...oldData, newComponent];
      });
      showNotification('Componente criado com sucesso!', 'success');
    },
    onError: (error) => {
      console.error('❌ Erro ao criar componente:', error);
      showNotification('Erro ao criar componente. Tente novamente.', 'error');
      // Recarrega em caso de erro
      queryClient.invalidateQueries({ queryKey: ['components'] });
    }
  });

  const deleteComponentMutation = useMutation({
    mutationFn: (id) => base44.entities.Component.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      setSelectedComponent(null);
      showNotification('Componente removido!', 'success');
    },
    onError: (error) => {
      console.error('❌ Erro ao excluir componente:', error);
      showNotification('Erro ao excluir componente.', 'error');
    }
  });

  const createUnitMutation = useMutation({
    mutationFn: (data) => base44.entities.Unit.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setIsUnitDialogOpen(false);
      resetUnitForm();
      showNotification('Unit criado!', 'success');
    },
    onError: (error) => {
      console.error('❌ Erro ao criar unit:', error);
      showNotification('Erro ao criar unit.', 'error');
    }
  });

  const updateUnitMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Unit.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setIsUnitDialogOpen(false);
      resetUnitForm();
      showNotification('Unit atualizado!', 'success');
    },
    onError: (error) => {
      console.error('❌ Erro ao atualizar unit:', error);
      showNotification('Erro ao atualizar unit.', 'error');
    }
  });

  const deleteUnitMutation = useMutation({
    mutationFn: (id) => base44.entities.Unit.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      showNotification('Unit removido!', 'success');
    },
    onError: (error) => {
      console.error('❌ Erro ao excluir unit:', error);
      showNotification('Erro ao excluir unit.', 'error');
    }
  });

  useEffect(() => {
    if (series.length > 0 && !selectedSeries) {
      setSelectedSeries(series[0].id);
    }
  }, [series]);

  useEffect(() => {
    if (selectedSeries) {
      const seriesUnits = units.filter((u) => u.series_id === selectedSeries);
      setExpandedUnits(seriesUnits.map((u) => u.id));
    }
  }, [selectedSeries, units]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleExpand = (unitId) => {
    setExpandedUnits((prev) =>
      prev.includes(unitId) ?
        prev.filter((id) => id !== unitId) :
        [...prev, unitId]
    );
  };

  // CRITICAL FIX: Função que SEMPRE lê do cache mais recente
  const getUnitComponents = (unitId) => {
    // Lê direto do cache do React Query para garantir dados mais recentes
    const currentComponents = queryClient.getQueryData(['components']) || [];
    return currentComponents.
      filter((c) => c.unit_id === unitId).
      sort((a, b) => a.sequence_order - b.sequence_order);
  };

  const resetUnitForm = () => {
    setUnitFormData({
      series_id: "",
      nome: "",
      sequence_order: 1,
      descricao: "",
      duracao_estimada_horas: 4
    });
    setEditingUnit(null);
  };

  const handleAddUnit = () => {
    if (!selectedSeries) {
      alert('Selecione uma disciplina primeiro');
      return;
    }
    const seriesUnits = units.filter((u) => u.series_id === selectedSeries);
    setUnitFormData({
      series_id: selectedSeries,
      nome: "",
      sequence_order: seriesUnits.length + 1,
      descricao: "",
      duracao_estimada_horas: 4
    });
    setIsUnitDialogOpen(true);
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setUnitFormData(unit);
    setIsUnitDialogOpen(true);
  };

  const handleDeleteUnit = (unitId) => {
    if (confirm('Tem certeza que deseja excluir esta unit?')) {
      deleteUnitMutation.mutate(unitId);
    }
  };

  const handleUnitSubmit = (e) => {
    e.preventDefault();
    if (editingUnit) {
      updateUnitMutation.mutate({ id: editingUnit.id, data: unitFormData });
    } else {
      createUnitMutation.mutate(unitFormData);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;

    // Se soltou no mesmo lugar, não faz nada
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    try {
      // ===== CASO 1: CRIAR NOVO COMPONENTE (arrastar do painel de templates) =====
      if (source.droppableId === 'templates') {
        const template = Object.values(componentTemplates)
          .flat()
          .find((t) => t.id === draggableId);

        if (!template) {
          console.error('Template não encontrado:', draggableId);
          return;
        }

        // 1. Criar o componente no backend
        const newComponent = await createComponentMutation.mutateAsync({
          unit_id: destination.droppableId,
          nome: template.title,
          tipo: template.tipo,
          conteudo_tipo: template.conteudo_tipo,
          sequence_order: destination.index + 1,
          descricao: template.description,
          obrigatorio: true,
          progression_rule: 'livre',
          duracao_minutos: 30,
          objetivos_aprendizagem: [],
          conteudo_url: '',
          conteudo_texto: '',
          peso: 1
        });

        // 2. Recarregar todos os componentes do backend
        await queryClient.invalidateQueries({ queryKey: ['components'] });
        
        // 3. Aguardar um pouco para garantir que o refetch completou
        await new Promise(resolve => setTimeout(resolve, 300));

        // 4. Agora resequenciar com base no estado mais recente
        const freshComponents = queryClient.getQueryData(['components']) || [];
        const unitComponents = freshComponents
          .filter(c => c.unit_id === destination.droppableId)
          .sort((a, b) => a.sequence_order - b.sequence_order);

        // Resequenciar em batch
        const updates = [];
        unitComponents.forEach((comp, idx) => {
          const correctOrder = idx + 1;
          if (comp.sequence_order !== correctOrder) {
            updates.push(
              updateComponentMutation.mutateAsync({
                id: comp.id,
                data: { sequence_order: correctOrder }
              })
            );
          }
        });

        if (updates.length > 0) {
          await Promise.all(updates);
          await queryClient.invalidateQueries({ queryKey: ['components'] });
        }

        // 5. Selecionar o novo componente
        setSelectedComponent(newComponent);
        return;
      }

      // ===== CASO 2: MOVER/REORDENAR COMPONENTE EXISTENTE =====
      const movedComponent = components.find((c) => String(c.id) === String(draggableId));

      if (!movedComponent) {
        console.error('Componente não encontrado:', draggableId);
        return;
      }

      const oldUnitId = movedComponent.unit_id;
      const newUnitId = destination.droppableId;

      // Se moveu para a mesma unit e mesma posição, ignora
      // (oldSequenceOrder is not reliably available from 'movedComponent' after a refetch,
      // so we compare source.index to destination.index only if oldUnitId === newUnitId).
      // If we're relying on fresh data, the sequence_order might have been adjusted already.
      // A more robust check for "no effective change" would be to compare actual
      // sequence_order from the source unit before any updates.
      // For now, simpler check based on dnd indices for same unit:
      if (oldUnitId === newUnitId && source.index === destination.index) {
        return;
      }

      // 1. Mover o componente para a nova unit e nova posição
      await updateComponentMutation.mutateAsync({
        id: movedComponent.id,
        data: {
          unit_id: newUnitId,
          sequence_order: destination.index + 1
        }
      });

      // 2. Recarregar componentes
      await queryClient.invalidateQueries({ queryKey: ['components'] });
      await new Promise(resolve => setTimeout(resolve, 300));

      // 3. Resequenciar as units afetadas
      const freshComponents = queryClient.getQueryData(['components']) || [];
      
      const updates = [];

      // Se mudou de unit, resequenciar a unit antiga
      if (oldUnitId !== newUnitId) {
        const oldUnitComponents = freshComponents
          .filter(c => c.unit_id === oldUnitId)
          .sort((a, b) => a.sequence_order - b.sequence_order);

        oldUnitComponents.forEach((comp, idx) => {
          const correctOrder = idx + 1;
          if (comp.sequence_order !== correctOrder) {
            updates.push(
              updateComponentMutation.mutateAsync({
                id: comp.id,
                data: { sequence_order: correctOrder }
              })
            );
          }
        });
      }

      // Resequenciar a unit de destino
      const newUnitComponents = freshComponents
        .filter(c => c.unit_id === newUnitId)
        .sort((a, b) => a.sequence_order - b.sequence_order);

      newUnitComponents.forEach((comp, idx) => {
        const correctOrder = idx + 1;
        if (comp.sequence_order !== correctOrder) {
          updates.push(
            updateComponentMutation.mutateAsync({
              id: comp.id,
              data: { sequence_order: correctOrder }
            })
          );
        }
      });

      if (updates.length > 0) {
        await Promise.all(updates);
        await queryClient.invalidateQueries({ queryKey: ['components'] });
      }

    } catch (error) {
      console.error('❌ ERRO no drag and drop:', error);
      showNotification('Erro ao mover componente. Recarregando...', 'error');
      // Em caso de erro, força recarregamento completo
      queryClient.invalidateQueries({ queryKey: ['components'] });
    }
  };

  const handleSaveConfiguration = async () => {
    if (!selectedComponent) return;

    setIsSaving(true);
    try {
      await updateComponentMutation.mutateAsync({
        id: selectedComponent.id,
        // Only send fields that can be updated from the config panel
        data: {
          nome: selectedComponent.nome,
          descricao: selectedComponent.descricao,
          conteudo_url: selectedComponent.conteudo_url,
          conteudo_texto: selectedComponent.conteudo_texto,
          duracao_minutos: selectedComponent.duracao_minutos,
          peso: selectedComponent.peso,
          progression_rule: selectedComponent.progression_rule,
          objetivos_aprendizagem: selectedComponent.objetivos_aprendizagem
        }
      });
      // After successful save, ensure the selectedComponent state reflects the backend state
      // (This will be handled by queryClient.invalidateQueries in onSuccess triggering a refetch)
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteComponent = async () => {
    if (!selectedComponent) return;
    if (confirm('Tem certeza que deseja excluir este componente?')) {
      await deleteComponentMutation.mutateAsync(selectedComponent.id);
    }
  };

  const addObjective = () => {
    if (newObjective.trim() && selectedComponent) {
      setSelectedComponent({
        ...selectedComponent,
        objetivos_aprendizagem: [...(selectedComponent.objetivos_aprendizagem || []), newObjective.trim()]
      });
      setNewObjective('');
    }
  };

  const removeObjective = (index) => {
    if (selectedComponent) {
      setSelectedComponent({
        ...selectedComponent,
        objetivos_aprendizagem: selectedComponent.objetivos_aprendizagem.filter((_, i) => i !== index)
      });
    }
  };

  const selectedSeriesData = series.find((s) => s.id === selectedSeries);
  const seriesUnits = units.filter((u) => u.series_id === selectedSeries);

  const filteredTemplates = componentTemplates[selectedCategory]?.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image', 'video'],
      ['clean']]

  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Componentes</h1>
                  <p className="text-sm text-gray-500">
                    {selectedSeriesData ? selectedSeriesData.nome : 'Selecione uma disciplina'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Select value={selectedSeries || ''} onValueChange={setSelectedSeries}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Selecione uma disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {series.map((s) =>
                      <SelectItem key={s.id} value={s.id}>
                        {s.nome}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - 3 Columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Component Templates */}
          <aside className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Componentes</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar componentes..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} />

              </div>
              <p className="text-xs text-gray-500 mt-2">
                {filteredTemplates.length} componentes encontrados
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex border-b border-gray-200 px-2 overflow-x-auto">
              {categories.map((cat) =>
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-3 text-xs font-medium transition-colors relative whitespace-nowrap ${
                    selectedCategory === cat.id ?
                      'text-pink-600' :
                      'text-gray-500 hover:text-gray-700'
                  }`}
                >

                  <cat.icon className="w-4 h-4 inline mr-1" />
                  {cat.label}
                  {selectedCategory === cat.id &&
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600" />
                  }
                </button>
              )}
            </div >

            {/* Templates List */}
            <Droppable droppableId="templates" isDropDisabled={true}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 overflow-y-auto p-4 space-y-2"
                >
                  {filteredTemplates.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum componente encontrado</p>
                    </div>
                  ) : (
                    filteredTemplates.map((template, index) => (
                      <Draggable key={template.id} draggableId={template.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 bg-white rounded-lg cursor-grab hover:shadow-md transition-all ${
                              snapshot.isDragging
                                ? 'shadow-2xl ring-4 ring-pink-400 opacity-90 scale-105 border-pink-300'
                                : 'border border-gray-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-${template.color}-500 to-${template.color}-600 flex items-center justify-center flex-shrink-0`}>
                                <template.icon className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-800 text-sm">{template.title}</h4>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </aside>

          {/* Center Panel - Modules Canvas */}
          <section className="flex-1 flex flex-col overflow-hidden p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Jornada </h2>
                <p className="text-sm text-gray-500">Arraste componentes da esquerda para organizar o conteúdo</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddUnit}
                  disabled={!selectedSeries}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700 border-0">

                  <Plus className="w-4 h-4 mr-2" />
                  Nova Unit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedUnits(seriesUnits.map((u) => u.id))}>

                  <ChevronDown className="w-4 h-4 mr-2" />
                  Expandir Todos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedUnits([])}>

                  <ChevronRight className="w-4 h-4 mr-2" />
                  Recolher Todos
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {!selectedSeries ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Selecione uma disciplina
                    </h3>
                    <p className="text-gray-500">
                      Escolha uma disciplina no menu superior para começar
                    </p>
                  </div>
                </div>
              ) : seriesUnits.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhuma unit encontrada
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Crie sua primeira unit para começar a organizar conteúdo
                    </p>
                    <Button
                      onClick={handleAddUnit}
                      className="bg-gradient-to-r from-orange-600 to-amber-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeira Unit
                    </Button>
                  </div>
                </div>
              ) : (
                seriesUnits.map((unit) => {
                  const isExpanded = expandedUnits.includes(unit.id);
                  const unitComponents = getUnitComponents(unit.id);
                  const hasProgressionRules = unit.progression_rule !== 'livre' || unit.is_locked;

                  let lockIcon = null;
                  let lockTooltip = '';

                  if (unit.is_locked) {
                    lockIcon = '🔒';
                    lockTooltip = 'Módulo bloqueado';
                  } else if (unit.progression_rule === 'sequencial') {
                    lockIcon = '📋';
                    lockTooltip = 'Progressão sequencial';
                  } else if (unit.progression_rule === 'condicional') {
                    lockIcon = '⚙️';
                    lockTooltip = 'Progressão condicional';
                  }

                  return (
                    <Card key={unit.id} className="overflow-hidden border-0 shadow-md">
                      <div
                        className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 cursor-pointer"
                        onClick={() => toggleExpand(unit.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-white" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-white" />
                            )}
                            <GripVertical className="w-5 h-5 text-white/70" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-white">{unit.nome}</h3>
                                {lockIcon && (
                                  <span className="text-sm" title={lockTooltip}>{lockIcon}</span>
                                )}
                              </div>
                              <p className="text-sm text-white/80">
                                {unitComponents.length} {unitComponents.length === 1 ? 'componente' : 'componentes'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-white/20 text-white border-0">
                              Unit {unit.sequence_order}
                            </Badge>
                            {hasProgressionRules && (
                              <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                                <Target className="w-3 h-3 mr-1" />
                                {unit.progression_rule === 'sequencial' ? 'Seq' : unit.progression_rule === 'condicional' ? 'Cond' : 'Regras'}
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditUnit(unit);
                              }}
                              className="text-white hover:bg-white/20 h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUnit(unit.id);
                              }}
                              className="text-white hover:bg-red-500/50 h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Show unlock conditions summary when expanded */}
                        {isExpanded && hasProgressionRules && (
                          <div className="mt-3 pt-3 border-t border-white/20">
                            <div className="flex flex-wrap gap-2 text-xs text-white/90">
                              {unit.progression_rule === 'sequencial' && (
                                <>
                                  {unit.unlock_conditions?.requires_previous_completion && (
                                    <Badge className="bg-white/10 text-white border-white/20 text-xs">
                                      Requer módulo anterior
                                    </Badge>
                                  )}
                                  {unit.unlock_conditions?.minimum_score_previous && (
                                    <Badge className="bg-white/10 text-white border-white/20 text-xs">
                                      Nota mín: {unit.unlock_conditions.minimum_score_previous}%
                                    </Badge>
                                  )}
                                </>
                              )}
                              {unit.progression_rule === 'condicional' && (
                                <>
                                  {unit.unlock_conditions?.unlock_after_days && (
                                    <Badge className="bg-white/10 text-white border-white/20 text-xs">
                                      Após {unit.unlock_conditions.unlock_after_days} dias
                                    </Badge>
                                  )}
                                  {unit.unlock_conditions?.unlock_date && (
                                    <Badge className="bg-white/10 text-white border-white/20 text-xs">
                                      Data: {new Date(unit.unlock_conditions.unlock_date).toLocaleDateString()}
                                    </Badge>
                                  )}
                                  {unit.unlock_conditions?.minimum_score_previous && (
                                    <Badge className="bg-white/10 text-white border-white/20 text-xs">
                                      Nota mín: {unit.unlock_conditions.minimum_score_previous}%
                                    </Badge>
                                  )}
                                  {unit.unlock_conditions?.requires_instructor_approval && (
                                    <Badge className="bg-white/10 text-white border-white/20 text-xs">
                                      Aprovação do instrutor
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {isExpanded && (
                        <Droppable droppableId={unit.id} type="component">
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`p-4 min-h-[100px] bg-gray-50 space-y-2 transition-colors ${
                                snapshot.isDraggingOver ? 'bg-pink-50 ring-2 ring-pink-300' : ''
                              }`}
                            >
                              {unitComponents.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">Arraste componentes aqui</p>
                                </div>
                              ) : (
                                unitComponents.map((component, index) => (
                                  <Draggable
                                    key={String(component.id)}
                                    draggableId={String(component.id)}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onClick={() => setSelectedComponent(component)}
                                        className={`p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
                                          selectedComponent?.id === component.id ? 'ring-2 ring-pink-500' : ''
                                        } ${snapshot.isDragging ? 'shadow-lg rotate-1 opacity-90' : ''}
                                        `}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3 flex-1">
                                            <GripVertical className="w-4 h-4 text-gray-400" />
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                                              {component.tipo === 'midia' && <Video className="w-4 h-4 text-white" />}
                                              {component.tipo === 'atividade' && <FileCheck className="w-4 h-4 text-white" />}
                                              {component.tipo === 'avaliacao' && <CheckCircle2 className="w-4 h-4 text-white" />}
                                              {component.tipo === 'anexo' && <Paperclip className="w-4 h-4 text-white" />}
                                              {component.tipo === 'texto' && <AlignLeft className="w-4 h-4 text-white" />}
                                            </div>
                                            <div className="flex-1">
                                              <h4 className="font-medium text-gray-800 text-sm">{component.nome}</h4>
                                              <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                  {component.tipo}
                                                </Badge>
                                                {component.duracao_minutos && (
                                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {component.duracao_minutos}min
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteComponentMutation.mutate(component.id);
                                            }}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          </section>

          {/* Right Panel - Configuration */}
          <aside className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Parâmetros do Componente
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {selectedComponent ?
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      {selectedComponent.tipo === 'midia' && <Video className="w-8 h-8 text-white" />}
                      {selectedComponent.tipo === 'atividade' && <FileCheck className="w-8 h-8 text-white" />}
                      {selectedComponent.tipo === 'avaliacao' && <CheckCircle2 className="w-8 h-8 text-white" />}
                      {selectedComponent.tipo === 'anexo' && <Paperclip className="w-8 h-8 text-white" />}
                      {selectedComponent.tipo === 'texto' && <AlignLeft className="w-8 h-8 text-white" />}
                    </div>
                    <h3 className="font-semibold text-gray-900">{selectedComponent.nome}</h3>
                    <Badge className="mt-2">{selectedComponent.tipo}</Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Título *</Label>
                      <Input
                        id="nome"
                        value={selectedComponent.nome || ''}
                        onChange={(e) => setSelectedComponent({ ...selectedComponent, nome: e.target.value })}
                        className="mt-1" />

                    </div>

                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={selectedComponent.descricao || ''}
                        onChange={(e) => setSelectedComponent({ ...selectedComponent, descricao: e.target.value })}
                        className="mt-1"
                        rows={2} />

                    </div>

                    {selectedComponent.conteudo_tipo === 'texto_rico' ?
                      <div>
                        <Label htmlFor="conteudo_texto">Conteúdo</Label>
                        <div className="mt-1 border rounded-lg overflow-hidden">
                          <ReactQuill
                            theme="snow"
                            value={selectedComponent.conteudo_texto || ''}
                            onChange={(value) => setSelectedComponent({ ...selectedComponent, conteudo_texto: value })}
                            modules={quillModules}
                            placeholder="Digite o conteúdo..."
                            className="bg-white" />

                        </div>
                      </div> :

                      <div>
                        <Label htmlFor="conteudo_url">URL do Conteúdo</Label>
                        <Input
                          id="conteudo_url"
                          value={selectedComponent.conteudo_url || ''}
                          onChange={(e) => setSelectedComponent({ ...selectedComponent, conteudo_url: e.target.value })}
                          placeholder="https://..."
                          className="mt-1" />

                      </div>
                    }

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duracao_minutos">Duração (min)</Label>
                        <Input
                          id="duracao_minutos"
                          type="number"
                          value={selectedComponent.duracao_minutos || ''}
                          onChange={(e) => setSelectedComponent({ ...selectedComponent, duracao_minutos: parseInt(e.target.value) })}
                          className="mt-1" />

                      </div>

                      <div>
                        <Label htmlFor="peso">Peso (%)</Label>
                        <Input
                          id="peso"
                          type="number"
                          value={selectedComponent.peso || 1}
                          onChange={(e) => setSelectedComponent({ ...selectedComponent, peso: parseFloat(e.target.value) })}
                          className="mt-1" />

                      </div>
                    </div>

                    <div>
                      <Label htmlFor="progression_rule">Regra de Progressão</Label>
                      <Select
                        value={selectedComponent.progression_rule || 'livre'}
                        onValueChange={(value) => setSelectedComponent({ ...selectedComponent, progression_rule: value })}>

                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="livre">Livre</SelectItem>
                          <SelectItem value="sequencial">Sequencial</SelectItem>
                          <SelectItem value="condicional">Condicional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Objetivos de Aprendizagem */}
                    <div className="border-t pt-4">
                      <Label className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-purple-600" />
                        Objetivos de Aprendizagem
                      </Label>

                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={newObjective}
                            onChange={(e) => setNewObjective(e.target.value)}
                            placeholder="Adicionar objetivo..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addObjective();
                              }
                            }} />

                          <Button type="button" onClick={addObjective} variant="outline" size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {selectedComponent.objetivos_aprendizagem && selectedComponent.objetivos_aprendizagem.length > 0 &&
                          <div className="space-y-2">
                            {selectedComponent.objetivos_aprendizagem.map((objetivo, index) =>
                              <div key={index} className="flex items-start gap-2 p-2 bg-purple-50 rounded-lg group">
                                <Target className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                <span className="flex-1 text-xs text-slate-700">{objetivo}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeObjective(index)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0">

                                  <X className="w-3 h-3 text-red-600" />
                                </Button>
                              </div>
                            )}
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div> :

                <div className="text-center py-12 text-gray-400">
                  <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Nenhum item selecionado</h3>
                  <p className="text-sm">Selecione um componente para configurar</p>
                </div>
              }
            </div>

            {selectedComponent &&
              <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
                <Button
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  onClick={handleSaveConfiguration}
                  disabled={isSaving}>

                  {isSaving ?
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </> :

                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </>
                  }
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDeleteComponent}>

                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Componente
                </Button>
              </div>
            }
          </aside>
        </div>

        {/* Unit Create/Edit Dialog */}
        <Dialog open={isUnitDialogOpen} onOpenChange={(open) => {
          setIsUnitDialogOpen(open);
          if (!open) resetUnitForm();
        }}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-orange-600" />
                {editingUnit ? 'Editar Unit' : 'Nova Unit'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUnitSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="unit_nome">Nome da Unit *</Label>
                  <Input
                    id="unit_nome"
                    value={unitFormData.nome}
                    onChange={(e) => setUnitFormData({ ...unitFormData, nome: e.target.value })}
                    placeholder="Ex: Introdução aos Algoritmos"
                    required />

                </div>

                <div>
                  <Label htmlFor="unit_sequence_order">Ordem</Label>
                  <Input
                    id="unit_sequence_order"
                    type="number"
                    value={unitFormData.sequence_order}
                    onChange={(e) => setUnitFormData({ ...unitFormData, sequence_order: parseInt(e.target.value) })} />

                </div>

                <div>
                  <Label htmlFor="duracao_estimada_horas">Duração (h)</Label>
                  <Input
                    id="duracao_estimada_horas"
                    type="number"
                    value={unitFormData.duracao_estimada_horas}
                    onChange={(e) => setUnitFormData({ ...unitFormData, duracao_estimada_horas: parseInt(e.target.value) })} />

                </div>

                <div className="col-span-2">
                  <Label htmlFor="unit_descricao">Descrição</Label>
                  <Textarea
                    id="unit_descricao"
                    value={unitFormData.descricao}
                    onChange={(e) => setUnitFormData({ ...unitFormData, descricao: e.target.value })}
                    placeholder="Descrição da unit..."
                    rows={3} />

                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsUnitDialogOpen(false);
                    resetUnitForm();
                  }}>

                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-orange-600 to-amber-600"
                  disabled={createUnitMutation.isPending || updateUnitMutation.isPending}>

                  {editingUnit ? 'Atualizar' : 'Criar'} Unit
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Notification */}
        {notification &&
          <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
            notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {notification.type === 'success' ?
              <CheckCircle2 className="w-5 h-5" /> :

              <AlertCircle className="w-5 h-5" />
            }
            <span>{notification.message}</span>
          </div>
        }
      </div>
    </DragDropContext>
  );
}
