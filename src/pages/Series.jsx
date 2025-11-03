import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, BookOpen, Edit, Trash2, GitBranch, Code, Clock, Award, Layers, FileText, Sparkles, Network, Target, CheckCircle } from "lucide-react";
import AIGeneratorSeries from "../components/series/AIGenerator";
import AutoCreateModules from "../components/series/AutoCreateModules";

export default function Series() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isAutoCreateOpen, setIsAutoCreateOpen] = useState(false);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [selectedSeriesForModules, setSelectedSeriesForModules] = useState(null);
  const [expandedSeries, setExpandedSeries] = useState([]);
  
  const [formData, setFormData] = useState({
    pathway_id: "",
    nome: "",
    codigo_unico: "",
    sequence_order: 1,
    duracao_horas: 60,
    oferavel: true,
    independente: false,
    reutilizavel: true,
    nota_maxima: 10,
    nota_minima_aprovacao: 7,
    assiduidade_minima: 75,
    reaprovavel: true,
    microcertificacao: false,
    ementa: "",
    estrutura_modulos: null
  });

  const [unitFormData, setUnitFormData] = useState({
    series_id: "",
    nome: "",
    sequence_order: 1,
    descricao: "",
    duracao_estimada_horas: 4,
    progression_rule: "sequencial",
    unlock_conditions: {
      requires_previous_completion: true,
      minimum_score_previous: null,
      specific_units_required: [],
      unlock_after_days: null,
      unlock_date: null,
      requires_instructor_approval: false
    },
    is_locked: false
  });

  const queryClient = useQueryClient();

  const { data: series, isLoading } = useQuery({
    queryKey: ['series'],
    queryFn: () => base44.entities.Series.list('sequence_order'),
    initialData: [],
  });

  const { data: pathways } = useQuery({
    queryKey: ['pathways'],
    queryFn: () => base44.entities.Pathway.list(),
    initialData: [],
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list('sequence_order'),
    initialData: [],
  });

  const { data: components } = useQuery({
    queryKey: ['components'],
    queryFn: () => base44.entities.Component.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Series.create(data),
    onSuccess: (newSeries) => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      
      if (newSeries.estrutura_modulos) {
        setSelectedSeriesForModules({
          id: newSeries.id,
          modulos: newSeries.estrutura_modulos
        });
        setIsAutoCreateOpen(true);
      }
      
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Series.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Series.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: (data) => base44.entities.Unit.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setIsUnitDialogOpen(false);
      resetUnitForm();
    },
  });

  const updateUnitMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Unit.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setIsUnitDialogOpen(false);
      resetUnitForm();
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: (id) => base44.entities.Unit.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });

  const resetForm = () => {
    setFormData({
      pathway_id: "",
      nome: "",
      codigo_unico: "",
      sequence_order: 1,
      duracao_horas: 60,
      oferavel: true,
      independente: false,
      reutilizavel: true,
      nota_maxima: 10,
      nota_minima_aprovacao: 7,
      assiduidade_minima: 75,
      reaprovavel: true,
      microcertificacao: false,
      ementa: "",
      estrutura_modulos: null
    });
    setEditingSeries(null);
  };

  const resetUnitForm = () => {
    setUnitFormData({
      series_id: "",
      nome: "",
      sequence_order: 1,
      descricao: "",
      duracao_estimada_horas: 4,
      progression_rule: "sequencial",
      unlock_conditions: {
        requires_previous_completion: true,
        minimum_score_previous: null,
        specific_units_required: [],
        unlock_after_days: null,
        unlock_date: null,
        requires_instructor_approval: false
      },
      is_locked: false
    });
    setEditingUnit(null);
    setSelectedSeriesForUnit(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSeries) {
      updateMutation.mutate({ id: editingSeries.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleUnitSubmit = (e) => {
    e.preventDefault();
    // Ensure unlock_date is null if empty string
    const dataToSend = {
      ...unitFormData,
      unlock_conditions: {
        ...unitFormData.unlock_conditions,
        unlock_date: unitFormData.unlock_conditions?.unlock_date === "" ? null : unitFormData.unlock_conditions?.unlock_date
      }
    };

    if (editingUnit) {
      updateUnitMutation.mutate({ id: editingUnit.id, data: dataToSend });
    } else {
      createUnitMutation.mutate(dataToSend);
    }
  };

  const handleEdit = (s) => {
    setEditingSeries(s);
    setFormData(s);
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta disciplina?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddUnit = (seriesId) => {
    setSelectedSeriesForUnit(seriesId);
    const seriesUnits = units.filter(u => u.series_id === seriesId);
    setUnitFormData({
      series_id: seriesId,
      nome: "",
      sequence_order: seriesUnits.length + 1,
      descricao: "",
      duracao_estimada_horas: 4,
      progression_rule: "sequencial",
      unlock_conditions: {
        requires_previous_completion: true,
        minimum_score_previous: null,
        specific_units_required: [],
        unlock_after_days: null,
        unlock_date: null,
        requires_instructor_approval: false
      },
      is_locked: false
    });
    setIsUnitDialogOpen(true);
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setUnitFormData({
      ...unit,
      // Ensure unlock_conditions object exists and has default values if properties are missing
      unlock_conditions: unit.unlock_conditions ? {
        requires_previous_completion: unit.unlock_conditions.requires_previous_completion ?? true,
        minimum_score_previous: unit.unlock_conditions.minimum_score_previous ?? null,
        specific_units_required: unit.unlock_conditions.specific_units_required ?? [],
        unlock_after_days: unit.unlock_conditions.unlock_after_days ?? null,
        unlock_date: unit.unlock_conditions.unlock_date ?? null,
        requires_instructor_approval: unit.unlock_conditions.requires_instructor_approval ?? false
      } : {
        requires_previous_completion: true,
        minimum_score_previous: null,
        specific_units_required: [],
        unlock_after_days: null,
        unlock_date: null,
        requires_instructor_approval: false
      }
    });
    setSelectedSeriesForUnit(unit.series_id);
    setIsUnitDialogOpen(true);
  };

  const handleDeleteUnit = (id) => {
    if (confirm('Tem certeza que deseja excluir este módulo?')) {
      deleteUnitMutation.mutate(id);
    }
  };

  const handleAIGenerated = (data) => {
    setFormData(data);
    setIsAIDialogOpen(false); // Close AI generator dialog
    setIsDialogOpen(true); // Open the series form with generated data
  };

  const handleAutoCreateModules = (s) => {
    if (s.estrutura_modulos) {
      setSelectedSeriesForModules({
        id: s.id,
        modulos: s.estrutura_modulos
      });
      setIsAutoCreateOpen(true);
    }
  };

  const handleModulesComplete = () => {
    setIsAutoCreateOpen(false);
    setSelectedSeriesForModules(null);
    queryClient.invalidateQueries({ queryKey: ['units'] });
    queryClient.invalidateQueries({ queryKey: ['components'] });
  };

  const getPathwayName = (pathwayId) => {
    const pathway = pathways.find(p => p.id === pathwayId);
    return pathway?.nome || 'Não definido';
  };

  const getSeriesUnits = (seriesId) => {
    return units.filter(u => u.series_id === seriesId).sort((a, b) => a.sequence_order - b.sequence_order);
  };

  const getUnitComponents = (unitId) => {
    return components.filter(c => c.unit_id === unitId);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Disciplinas & Módulos
          </h1>
          <p className="text-slate-600 mt-1">
            Gerencie disciplinas e seus módulos de conteúdo
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAIDialogOpen(true)}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar com IA
          </Button>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Disciplina
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse h-32 bg-slate-200" />
          ))}
        </div>
      ) : series.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-300">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Nenhuma disciplina criada
            </h3>
            <p className="text-slate-500 text-center mb-6 max-w-md">
              Crie disciplinas com IA ou manualmente
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsAIDialogOpen(true)}
                className="bg-gradient-to-r from-green-600 to-teal-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar com IA
              </Button>
              <Button
                onClick={() => setIsDialogOpen(true)}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Manualmente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" value={expandedSeries} onValueChange={setExpandedSeries} className="space-y-4">
          <AnimatePresence>
            {series.map((s) => {
              const seriesUnits = getSeriesUnits(s.id);
              const hasEstrutura = s.estrutura_modulos && s.estrutura_modulos.length > 0;
              
              return (
                <AccordionItem key={s.id} value={s.id} className="border-0">
                  <Card className="overflow-hidden border-0 shadow-lg">
                    <AccordionTrigger className="hover:no-underline p-0">
                      <div className="w-full">
                        <div className="h-20 bg-gradient-to-br from-green-600 to-emerald-600 relative">
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute inset-0 flex items-center justify-between px-6">
                            <div className="flex-1 flex items-center gap-4">
                              <BookOpen className="w-8 h-8 text-white/80" />
                              <div className="text-left">
                                <h3 className="font-bold text-lg text-white mb-0.5">
                                  {s.nome}
                                </h3>
                                <div className="flex items-center gap-3 text-sm text-white/90">
                                  <span className="flex items-center gap-1">
                                    <Code className="w-3 h-3" />
                                    {s.codigo_unico}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <GitBranch className="w-3 h-3" />
                                    {getPathwayName(s.pathway_id)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {hasEstrutura && (
                                <Badge className="bg-gradient-to-r from-green-600 to-teal-600 text-white border-0">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  IA
                                </Badge>
                              )}
                              {s.microcertificacao && (
                                <Badge className="bg-yellow-100 text-yellow-700 border-0">
                                  <Award className="w-3 h-3 mr-1" />
                                  Micro
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-white/90 text-slate-700">
                                <Layers className="w-3 h-3 mr-1" />
                                {seriesUnits.length} módulos
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent>
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between pb-4 border-b">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap gap-2">
                              {s.duracao_horas && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {s.duracao_horas}h
                                </Badge>
                              )}
                              {s.independente && (
                                <Badge className="bg-purple-100 text-purple-700">
                                  Independente
                                </Badge>
                              )}
                              {s.reutilizavel && (
                                <Badge className="bg-blue-100 text-blue-700">
                                  Reutilizável
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between max-w-md">
                                <span className="text-slate-600">Nota mínima:</span>
                                <span className="font-semibold">{s.nota_minima_aprovacao}/{s.nota_maxima}</span>
                              </div>
                              <div className="flex justify-between max-w-md">
                                <span className="text-slate-600">Presença mínima:</span>
                                <span className="font-semibold">{s.assiduidade_minima}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {hasEstrutura && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAutoCreateModules(s)}
                                className="border-green-200 text-green-700 hover:bg-green-50"
                              >
                                <Network className="w-4 h-4 mr-1" />
                                Auto Criar
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(s)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(s.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                              <Layers className="w-4 h-4 text-orange-600" />
                              Módulos / Sessões
                            </h4>
                            <Button
                              size="sm"
                              onClick={() => handleAddUnit(s.id)}
                              className="bg-gradient-to-r from-orange-600 to-amber-600"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Adicionar Módulo
                            </Button>
                          </div>

                          {seriesUnits.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                              <p className="text-sm text-slate-500">Nenhum módulo criado</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                              {seriesUnits.map((unit) => {
                                const unitComponents = getUnitComponents(unit.id);
                                const hasProgressionRules = unit.progression_rule !== 'livre' || unit.is_locked;
                                
                                return (
                                  <Card key={unit.id} className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
                                    <CardContent className="p-4 space-y-3">
                                      <div className="flex items-start justify-between">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                                          {unit.sequence_order}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Layers className="w-4 h-4 text-orange-400" />
                                          {hasProgressionRules && (
                                            <Badge className="bg-purple-100 text-purple-700 text-xs px-1 py-0" title="Possui regras de progressão">
                                              🔒
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <h5 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                                          {unit.nome}
                                        </h5>
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                          <FileText className="w-3 h-3" />
                                          {unitComponents.length} componentes
                                        </div>
                                        {unit.progression_rule && unit.progression_rule !== 'livre' && (
                                          <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
                                            <Target className="w-3 h-3" />
                                            {unit.progression_rule === 'sequencial' && 'Sequencial'}
                                            {unit.progression_rule === 'condicional' && 'Condicional'}
                                          </div>
                                        )}
                                      </div>
                                      {unit.duracao_estimada_horas && (
                                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                          <Clock className="w-3 h-3" />
                                          {unit.duracao_estimada_horas}h
                                        </Badge>
                                      )}
                                      <div className="flex gap-1 pt-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEditUnit(unit)}
                                          className="flex-1 h-7 text-xs"
                                        >
                                          <Edit className="w-3 h-3 mr-1" />
                                          Editar
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteUnit(unit.id)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              );
            })}
          </AnimatePresence>
        </Accordion>
      )}

      {/* AI Generator Dialog */}
      <AIGeneratorSeries
        isOpen={isAIDialogOpen}
        onClose={() => setIsAIDialogOpen(false)}
        onDataGenerated={handleAIGenerated}
        pathways={pathways}
      />

      {/* Auto Create Modules Dialog */}
      {selectedSeriesForModules && (
        <AutoCreateModules
          seriesId={selectedSeriesForModules.id}
          estruturaModulos={selectedSeriesForModules.modulos}
          isOpen={isAutoCreateOpen}
          onClose={() => {
            setIsAutoCreateOpen(false);
            setSelectedSeriesForModules(null);
          }}
          onComplete={handleModulesComplete}
        />
      )}

      {/* Series Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-600" />
              {editingSeries ? 'Editar Disciplina' : 'Nova Disciplina'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="pathway_id">Pathway *</Label>
                <Select
                  value={formData.pathway_id}
                  onValueChange={(value) => setFormData({...formData, pathway_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o pathway" />
                  </SelectTrigger>
                  <SelectContent>
                    {pathways.map((pathway) => (
                      <SelectItem key={pathway.id} value={pathway.id}>
                        {pathway.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="nome">Nome da Disciplina *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Ex: Algoritmos e Estruturas de Dados"
                  required
                />
              </div>

              <div>
                <Label htmlFor="codigo_unico">Código Único *</Label>
                <Input
                  id="codigo_unico"
                  value={formData.codigo_unico}
                  onChange={(e) => setFormData({...formData, codigo_unico: e.target.value})}
                  placeholder="Ex: AED-101"
                  required
                />
              </div>

              <div>
                <Label htmlFor="sequence_order">Ordem</Label>
                <Input
                  id="sequence_order"
                  type="number"
                  value={formData.sequence_order}
                  onChange={(e) => setFormData({...formData, sequence_order: parseInt(e.target.value)})}
                />
              </div>

              <div>
                <Label htmlFor="duracao_horas">Carga Horária (h)</Label>
                <Input
                  id="duracao_horas"
                  type="number"
                  value={formData.duracao_horas}
                  onChange={(e) => setFormData({...formData, duracao_horas: parseInt(e.target.value)})}
                />
              </div>

              <div>
                <Label htmlFor="nota_maxima">Nota Máxima</Label>
                <Input
                  id="nota_maxima"
                  type="number"
                  value={formData.nota_maxima}
                  onChange={(e) => setFormData({...formData, nota_maxima: parseFloat(e.target.value)})}
                />
              </div>

              <div>
                <Label htmlFor="nota_minima_aprovacao">Nota Mínima</Label>
                <Input
                  id="nota_minima_aprovacao"
                  type="number"
                  value={formData.nota_minima_aprovacao}
                  onChange={(e) => setFormData({...formData, nota_minima_aprovacao: parseFloat(e.target.value)})}
                />
              </div>

              <div>
                <Label htmlFor="assiduidade_minima">Presença Mínima (%)</Label>
                <Input
                  id="assiduidade_minima"
                  type="number"
                  value={formData.assiduidade_minima}
                  onChange={(e) => setFormData({...formData, assiduidade_minima: parseInt(e.target.value)})}
                />
              </div>

              <div className="col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="oferavel">Oferável</Label>
                  <Switch
                    id="oferavel"
                    checked={formData.oferavel}
                    onCheckedChange={(checked) => setFormData({...formData, oferavel: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="independente">Independente</Label>
                  <Switch
                    id="independente"
                    checked={formData.independente}
                    onCheckedChange={(checked) => setFormData({...formData, independente: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reutilizavel">Reutilizável</Label>
                  <Switch
                    id="reutilizavel"
                    checked={formData.reutilizavel}
                    onCheckedChange={(checked) => setFormData({...formData, reutilizavel: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="microcertificacao">Microcertificação</Label>
                  <Switch
                    id="microcertificacao"
                    checked={formData.microcertificacao}
                    onCheckedChange={(checked) => setFormData({...formData, microcertificacao: checked})}
                  />
                </div>
              </div>

              <div className="col-span-2">
                <Label htmlFor="ementa">Ementa</Label>
                <Textarea
                  id="ementa"
                  value={formData.ementa}
                  onChange={(e) => setFormData({...formData, ementa: e.target.value})}
                  placeholder="Ementa da disciplina..."
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingSeries ? 'Atualizar' : 'Criar'} Disciplina
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Unit Create/Edit Dialog */}
      <Dialog open={isUnitDialogOpen} onOpenChange={(open) => {
        setIsUnitDialogOpen(open);
        if (!open) resetUnitForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-600" />
              {editingUnit ? 'Editar Módulo' : 'Novo Módulo'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUnitSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Informações Básicas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="unit_nome">Nome do Módulo *</Label>
                  <Input
                    id="unit_nome"
                    value={unitFormData.nome}
                    onChange={(e) => setUnitFormData({...unitFormData, nome: e.target.value})}
                    placeholder="Ex: Introdução aos Algoritmos"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="unit_sequence_order">Ordem</Label>
                  <Input
                    id="unit_sequence_order"
                    type="number"
                    value={unitFormData.sequence_order}
                    onChange={(e) => setUnitFormData({...unitFormData, sequence_order: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <Label htmlFor="duracao_estimada_horas">Duração (h)</Label>
                  <Input
                    id="duracao_estimada_horas"
                    type="number"
                    value={unitFormData.duracao_estimada_horas}
                    onChange={(e) => setUnitFormData({...unitFormData, duracao_estimada_horas: parseInt(e.target.value)})}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="unit_descricao">Descrição</Label>
                  <Textarea
                    id="unit_descricao"
                    value={unitFormData.descricao}
                    onChange={(e) => setUnitFormData({...unitFormData, descricao: e.target.value})}
                    placeholder="Descrição do módulo..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Progression Rules Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                Regras de Progressão
              </h3>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                <div>
                  <Label htmlFor="progression_rule">Tipo de Progressão</Label>
                  <Select
                    value={unitFormData.progression_rule}
                    onValueChange={(value) => setUnitFormData({...unitFormData, progression_rule: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="livre">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <div>
                            <div className="font-medium">Livre</div>
                            <div className="text-xs text-slate-500">Disponível imediatamente</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="sequencial">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <div>
                            <div className="font-medium">Sequencial</div>
                            <div className="text-xs text-slate-500">Requer completar módulo anterior</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="condicional">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                          <div>
                            <div className="font-medium">Condicional</div>
                            <div className="text-xs text-slate-500">Requer condições específicas</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {unitFormData.progression_rule !== 'livre' && (
                  <div className="space-y-4 border-t border-purple-200 pt-4">
                    <h4 className="text-xs font-semibold text-slate-700">Condições de Desbloqueio</h4>
                    
                    {unitFormData.progression_rule === 'sequencial' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="requires_previous" className="text-sm">
                            Requer completar módulo anterior
                          </Label>
                          <Switch
                            id="requires_previous"
                            checked={unitFormData.unlock_conditions?.requires_previous_completion ?? true}
                            onCheckedChange={(checked) => setUnitFormData({
                              ...unitFormData,
                              unlock_conditions: {
                                ...unitFormData.unlock_conditions,
                                requires_previous_completion: checked
                              }
                            })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="minimum_score" className="text-sm">
                            Nota mínima no módulo anterior (%)
                          </Label>
                          <Input
                            id="minimum_score"
                            type="number"
                            min="0"
                            max="100"
                            value={unitFormData.unlock_conditions?.minimum_score_previous || ''}
                            onChange={(e) => setUnitFormData({
                              ...unitFormData,
                              unlock_conditions: {
                                ...unitFormData.unlock_conditions,
                                minimum_score_previous: e.target.value ? parseInt(e.target.value) : null
                              }
                            })}
                            placeholder="Ex: 70"
                            className="mt-1"
                          />
                          <p className="text-xs text-slate-500 mt-1">Deixe vazio para não exigir nota mínima</p>
                        </div>
                      </div>
                    )}

                    {unitFormData.progression_rule === 'condicional' && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="unlock_after_days" className="text-sm">
                            Desbloquear após X dias da matrícula
                          </Label>
                          <Input
                            id="unlock_after_days"
                            type="number"
                            min="0"
                            value={unitFormData.unlock_conditions?.unlock_after_days || ''}
                            onChange={(e) => setUnitFormData({
                              ...unitFormData,
                              unlock_conditions: {
                                ...unitFormData.unlock_conditions,
                                unlock_after_days: e.target.value ? parseInt(e.target.value) : null
                              }
                            })}
                            placeholder="Ex: 7"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="unlock_date" className="text-sm">
                            Ou desbloquear em data específica
                          </Label>
                          <Input
                            id="unlock_date"
                            type="date"
                            value={unitFormData.unlock_conditions?.unlock_date || ''}
                            onChange={(e) => setUnitFormData({
                              ...unitFormData,
                              unlock_conditions: {
                                ...unitFormData.unlock_conditions,
                                unlock_date: e.target.value || null
                              }
                            })}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="minimum_score_cond" className="text-sm">
                            Nota mínima no módulo anterior (%)
                          </Label>
                          <Input
                            id="minimum_score_cond"
                            type="number"
                            min="0"
                            max="100"
                            value={unitFormData.unlock_conditions?.minimum_score_previous || ''}
                            onChange={(e) => setUnitFormData({
                              ...unitFormData,
                              unlock_conditions: {
                                ...unitFormData.unlock_conditions,
                                minimum_score_previous: e.target.value ? parseInt(e.target.value) : null
                              }
                            })}
                            placeholder="Ex: 70"
                            className="mt-1"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="instructor_approval" className="text-sm">
                            Requer aprovação do instrutor
                          </Label>
                          <Switch
                            id="instructor_approval"
                            checked={unitFormData.unlock_conditions?.requires_instructor_approval ?? false}
                            onCheckedChange={(checked) => setUnitFormData({
                              ...unitFormData,
                              unlock_conditions: {
                                ...unitFormData.unlock_conditions,
                                requires_instructor_approval: checked
                              }
                            })}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-purple-200 pt-3">
                      <Label htmlFor="is_locked" className="text-sm">
                        Módulo bloqueado por padrão
                      </Label>
                      <Switch
                        id="is_locked"
                        checked={unitFormData.is_locked ?? false}
                        onCheckedChange={(checked) => setUnitFormData({
                          ...unitFormData,
                          is_locked: checked
                        })}
                      />
                    </div>
                  </div>
                )}

                {unitFormData.progression_rule === 'livre' && (
                  <div className="text-sm text-slate-600 bg-green-50 border border-green-200 rounded p-3">
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Este módulo estará disponível imediatamente para todos os alunos.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsUnitDialogOpen(false);
                  resetUnitForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-orange-600 to-amber-600"
                disabled={createUnitMutation.isPending || updateUnitMutation.isPending}
              >
                {editingUnit ? 'Atualizar' : 'Criar'} Módulo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
