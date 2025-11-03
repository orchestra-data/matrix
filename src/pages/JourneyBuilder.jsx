import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Settings,
  Save,
  Eye,
  Trash2,
  Search,
  BookOpen,
  Video,
  FileText,
  Layers,
  Sparkles,
  Clock,
  Target,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Play
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function JourneyBuilder() {
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('midia');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUnits, setExpandedUnits] = useState([]);
  const [isStudentView, setIsStudentView] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const queryClient = useQueryClient();

  const { data: series } = useQuery({
    queryKey: ['series'],
    queryFn: () => base44.entities.Series.list(),
    initialData: [],
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list('sequence_order'),
    initialData: [],
  });

  const { data: components } = useQuery({
    queryKey: ['components'],
    queryFn: () => base44.entities.Component.list('sequence_order'),
    initialData: [],
  });

  // Component templates
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
        icon: FileText,
        title: 'Texto Rico',
        description: 'Artigo ou conteúdo textual',
        tipo: 'texto',
        conteudo_tipo: 'texto_rico',
        color: 'green'
      }
    ],
    atividade: [
      {
        id: 'tarefa',
        icon: FileText,
        title: 'Tarefa',
        description: 'Atividade com entrega',
        tipo: 'atividade',
        conteudo_tipo: 'link',
        color: 'yellow'
      },
      {
        id: 'forum',
        icon: BookOpen,
        title: 'Fórum',
        description: 'Discussão em grupo',
        tipo: 'atividade',
        conteudo_tipo: 'link',
        color: 'orange'
      }
    ],
    avaliacao: [
      {
        id: 'prova',
        icon: CheckCircle2,
        title: 'Avaliação',
        description: 'Prova ou teste',
        tipo: 'avaliacao',
        conteudo_tipo: 'link',
        color: 'red'
      }
    ],
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
      }
    ]
  };

  const categories = [
    { id: 'midia', label: 'Mídia', icon: Video },
    { id: 'atividade', label: 'Atividades', icon: FileText },
    { id: 'avaliacao', label: 'Avaliações', icon: CheckCircle2 },
    { id: 'anexo', label: 'Anexos', icon: LinkIcon }
  ];

  // Mutations
  const updateComponentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Component.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      showNotification('Componente atualizado com sucesso!', 'success');
    },
  });

  const createComponentMutation = useMutation({
    mutationFn: (data) => base44.entities.Component.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      showNotification('Componente criado com sucesso!', 'success');
    },
  });

  const deleteComponentMutation = useMutation({
    mutationFn: (id) => base44.entities.Component.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      setSelectedComponent(null);
      showNotification('Componente removido!', 'success');
    },
  });

  useEffect(() => {
    if (series.length > 0 && !selectedSeries) {
      setSelectedSeries(series[0].id);
    }
  }, [series]);

  useEffect(() => {
    if (selectedSeries) {
      const seriesUnits = units.filter(u => u.series_id === selectedSeries);
      setExpandedUnits(seriesUnits.map(u => u.id));
    }
  }, [selectedSeries, units]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleExpand = (unitId) => {
    setExpandedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const getUnitComponents = (unitId) => {
    return components
      .filter(c => c.unit_id === unitId)
      .sort((a, b) => a.sequence_order - b.sequence_order);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Se for um template (novo componente)
    if (source.droppableId === 'templates') {
      const template = Object.values(componentTemplates)
        .flat()
        .find(t => t.id === draggableId);
      
      if (template) {
        const newComponent = {
          unit_id: destination.droppableId,
          nome: template.title,
          tipo: template.tipo,
          conteudo_tipo: template.conteudo_tipo,
          sequence_order: destination.index + 1,
          descricao: template.description,
          obrigatorio: true,
          progression_rule: 'sequencial',
          duracao_minutos: 30
        };

        await createComponentMutation.mutateAsync(newComponent);
      }
      return;
    }

    // Se for reordenação dentro da mesma lista
    if (source.droppableId === destination.droppableId) {
      const unitComponents = getUnitComponents(source.droppableId);
      const [movedComponent] = unitComponents.splice(source.index, 1);
      unitComponents.splice(destination.index, 0, movedComponent);

      // Atualizar sequence_order
      for (let i = 0; i < unitComponents.length; i++) {
        if (unitComponents[i].sequence_order !== i + 1) {
          await updateComponentMutation.mutateAsync({
            id: unitComponents[i].id,
            data: { sequence_order: i + 1 }
          });
        }
      }
    } else {
      // Mover entre listas diferentes
      const component = components.find(c => c.id === draggableId);
      if (component) {
        await updateComponentMutation.mutateAsync({
          id: component.id,
          data: {
            unit_id: destination.droppableId,
            sequence_order: destination.index + 1
          }
        });
      }
    }
  };

  const handleSaveConfiguration = async () => {
    if (!selectedComponent) return;

    setIsSaving(true);
    try {
      await updateComponentMutation.mutateAsync({
        id: selectedComponent.id,
        data: selectedComponent
      });
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

  const selectedSeriesData = series.find(s => s.id === selectedSeries);
  const seriesUnits = units.filter(u => u.series_id === selectedSeries);

  const filteredTemplates = componentTemplates[selectedCategory]?.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Construtor de Jornada</h1>
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
                    {series.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsStudentView(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Save className="w-4 h-4 mr-2" />
                  Publicar
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Component Templates */}
          <aside className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Matriz de Aprendizagem</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar componentes..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex border-b border-gray-200 px-2 overflow-x-auto">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-3 text-xs font-medium transition-colors relative whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <cat.icon className="w-4 h-4 inline mr-1" />
                  {cat.label}
                  {selectedCategory === cat.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Templates List */}
            <Droppable droppableId="templates" isDropDisabled={true}>
              {(provided) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 overflow-y-auto p-4 space-y-2"
                >
                  {filteredTemplates.map((template, index) => (
                    <Draggable key={template.id} draggableId={template.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-grab hover:shadow-md transition-all ${
                            snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400 opacity-80' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <template.icon className={`w-5 h-5 text-${template.color}-500 flex-shrink-0 mt-0.5`} />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 text-sm">{template.title}</h4>
                              <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </aside>

          {/* Center Panel - Journey Canvas */}
          <section className="flex-1 flex flex-col overflow-hidden p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Módulos & Componentes</h2>
                <p className="text-sm text-gray-500">Arraste componentes da esquerda para os módulos</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setExpandedUnits(seriesUnits.map(u => u.id))}
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Expandir Todos
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setExpandedUnits([])}
                >
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
                      Nenhum módulo encontrado
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Crie módulos na página de Disciplinas primeiro
                    </p>
                  </div>
                </div>
              ) : (
                seriesUnits.map(unit => {
                  const isExpanded = expandedUnits.includes(unit.id);
                  const unitComponents = getUnitComponents(unit.id);

                  return (
                    <Card key={unit.id} className="overflow-hidden border-0 shadow-md">
                      <div 
                        className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 cursor-pointer" 
                        onClick={() => toggleExpand(unit.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isExpanded ? 
                              <ChevronDown className="w-5 h-5 text-white" /> : 
                              <ChevronRight className="w-5 h-5 text-white" />
                            }
                            <GripVertical className="w-5 h-5 text-white/70" />
                            <div>
                              <h3 className="font-bold text-white">{unit.nome}</h3>
                              <p className="text-sm text-white/80">
                                {unitComponents.length} {unitComponents.length === 1 ? 'componente' : 'componentes'}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-white/20 text-white border-0">
                            Módulo {unit.sequence_order}
                          </Badge>
                        </div>
                      </div>

                      {isExpanded && (
                        <Droppable droppableId={unit.id} type="component">
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`p-4 min-h-[100px] bg-gray-50 space-y-2 transition-colors ${
                                snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''
                              }`}
                            >
                              {unitComponents.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">Arraste componentes aqui</p>
                                </div>
                              ) : (
                                unitComponents.map((component, index) => (
                                  <Draggable key={component.id} draggableId={component.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onClick={() => setSelectedComponent(component)}
                                        className={`p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
                                          selectedComponent?.id === component.id ? 'ring-2 ring-blue-500' : ''
                                        } ${snapshot.isDragging ? 'shadow-lg rotate-1 opacity-90' : ''}`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3 flex-1">
                                            <GripVertical className="w-4 h-4 text-gray-400" />
                                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center`}>
                                              <FileText className="w-4 h-4 text-white" />
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
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
                Configurações
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {selectedComponent ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-white" />
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
                        onChange={(e) => setSelectedComponent({...selectedComponent, nome: e.target.value})}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={selectedComponent.descricao || ''}
                        onChange={(e) => setSelectedComponent({...selectedComponent, descricao: e.target.value})}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="conteudo_url">URL do Conteúdo</Label>
                      <Input 
                        id="conteudo_url"
                        value={selectedComponent.conteudo_url || ''}
                        onChange={(e) => setSelectedComponent({...selectedComponent, conteudo_url: e.target.value})}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duracao_minutos">Duração (min)</Label>
                        <Input 
                          id="duracao_minutos"
                          type="number"
                          value={selectedComponent.duracao_minutos || ''}
                          onChange={(e) => setSelectedComponent({...selectedComponent, duracao_minutos: parseInt(e.target.value)})}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="peso">Peso (%)</Label>
                        <Input 
                          id="peso"
                          type="number"
                          value={selectedComponent.peso || 1}
                          onChange={(e) => setSelectedComponent({...selectedComponent, peso: parseFloat(e.target.value)})}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="progression_rule">Regra de Progressão</Label>
                      <Select
                        value={selectedComponent.progression_rule || 'livre'}
                        onValueChange={(value) => setSelectedComponent({...selectedComponent, progression_rule: value})}
                      >
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

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Sugestões da IA
                      </h4>
                      <p className="text-sm text-blue-700 mb-3">
                        Baseado no tipo de conteúdo, recomendamos:
                      </p>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li className="flex items-center gap-2">
                          <Target className="w-3 h-3" />
                          Definir objetivos de aprendizagem específicos
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Duração sugerida: {selectedComponent.duracao_minutos || 30} minutos
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Nenhum item selecionado</h3>
                  <p className="text-sm">Selecione um componente para configurar</p>
                </div>
              )}
            </div>

            {selectedComponent && (
              <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleSaveConfiguration}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDeleteComponent}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Componente
                </Button>
              </div>
            )}
          </aside>
        </div>

        {/* Student View Dialog */}
        <Dialog open={isStudentView} onOpenChange={setIsStudentView}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Visualização do Aluno - {selectedSeriesData?.nome}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Timeline Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">{selectedSeriesData?.nome}</h2>
                <p className="text-blue-100">
                  {seriesUnits.length} módulos • {components.filter(c => seriesUnits.some(u => u.id === c.unit_id)).length} componentes
                </p>
              </div>

              {/* Timeline */}
              <div className="relative">
                {seriesUnits.map((unit, unitIndex) => {
                  const unitComps = getUnitComponents(unit.id);
                  const isLastUnit = unitIndex === seriesUnits.length - 1;

                  return (
                    <div key={unit.id} className="relative">
                      {/* Timeline Line */}
                      {!isLastUnit && (
                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                      )}

                      {/* Unit Header */}
                      <div className="flex gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg z-10">
                          {unit.sequence_order}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{unit.nome}</h3>
                          <p className="text-sm text-gray-500">{unit.descricao}</p>
                        </div>
                      </div>

                      {/* Components */}
                      <div className="ml-16 space-y-3 mb-8">
                        {unitComps.map((comp) => (
                          <Card key={comp.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white">
                                {comp.tipo === 'midia' && <Video className="w-5 h-5" />}
                                {comp.tipo === 'atividade' && <FileText className="w-5 h-5" />}
                                {comp.tipo === 'avaliacao' && <CheckCircle2 className="w-5 h-5" />}
                                {comp.tipo === 'anexo' && <LinkIcon className="w-5 h-5" />}
                                {comp.tipo === 'texto' && <BookOpen className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{comp.nome}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {comp.tipo}
                                  </Badge>
                                  {comp.duracao_minutos && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {comp.duracao_minutos} min
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                                <Play className="w-4 h-4 mr-1" />
                                Iniciar
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setIsStudentView(false)}>
                Fechar Visualização
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Notification */}
        {notification && (
          <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
            notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}