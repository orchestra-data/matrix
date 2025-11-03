import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { Plus, GraduationCap, Edit, Trash2, Code, Clock, Sparkles, Network, GitBranch, BookOpen, ChevronRight } from "lucide-react";
import AIGenerator from "../components/containers/AIGenerator";
import AutoCreateStructure from "../components/containers/AutoCreateStructure";

export default function Containers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isAutoCreateOpen, setIsAutoCreateOpen] = useState(false);
  const [isPathwayDialogOpen, setIsPathwayDialogOpen] = useState(false); // New state for Pathway dialog
  const [editingContainer, setEditingContainer] = useState(null);
  const [editingPathway, setEditingPathway] = useState(null); // New state for editing pathway
  const [selectedContainerForStructure, setSelectedContainerForStructure] = useState(null);
  const [expandedContainers, setExpandedContainers] = useState([]); // New state for accordion expansion

  const [formData, setFormData] = useState({
    nome: "",
    codigo_unico: "",
    tipo: "graduacao",
    ementa: "",
    duracao_padrao_pathways: 6,
    certificacao_mestra: "",
    descricao: "",
    status: "rascunho",
    carga_horaria_total: 0,
    oferavel: true,
    reutilizavel: true,
    thumbnail_url: "",
    estrutura_completa: null
  });

  // New state for Pathway form data
  const [pathwayFormData, setPathwayFormData] = useState({
    container_id: "",
    nome: "",
    sequence_order: 1,
    tipo: "obrigatorio",
    limite_entrada_percentual: 20,
    duracao_meses: 6,
    descricao: ""
  });

  const queryClient = useQueryClient();

  const { data: containers, isLoading } = useQuery({
    queryKey: ['containers'],
    queryFn: () => base44.entities.Container.list('-created_date'),
    initialData: [],
  });

  // New query for Pathways
  const { data: pathways } = useQuery({
    queryKey: ['pathways'],
    queryFn: () => base44.entities.Pathway.list('sequence_order'),
    initialData: [],
  });

  // New query for Series (for counting series within pathways)
  const { data: series } = useQuery({
    queryKey: ['series'],
    queryFn: () => base44.entities.Series.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Container.create(data),
    onSuccess: (newContainer) => {
      queryClient.invalidateQueries({ queryKey: ['containers'] });

      // Check if container has estrutura_completa and auto-create structure
      if (newContainer.estrutura_completa) {
        setSelectedContainerForStructure({
          id: newContainer.id,
          estrutura: newContainer.estrutura_completa
        });
        setIsAutoCreateOpen(true);
      }

      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Container.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Container.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] });
    },
  });

  // New mutations for Pathways
  const createPathwayMutation = useMutation({
    mutationFn: (data) => base44.entities.Pathway.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pathways'] });
      setIsPathwayDialogOpen(false);
      resetPathwayForm();
    },
  });

  const updatePathwayMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Pathway.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pathways'] });
      setIsPathwayDialogOpen(false);
      resetPathwayForm();
    },
  });

  const deletePathwayMutation = useMutation({
    mutationFn: (id) => base44.entities.Pathway.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pathways'] });
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      codigo_unico: "",
      tipo: "graduacao",
      ementa: "",
      duracao_padrao_pathways: 6,
      certificacao_mestra: "",
      descricao: "",
      status: "rascunho",
      carga_horaria_total: 0,
      oferavel: true,
      reutilizavel: true,
      thumbnail_url: "",
      estrutura_completa: null
    });
    setEditingContainer(null);
  };

  // New function to reset Pathway form
  const resetPathwayForm = () => {
    setPathwayFormData({
      container_id: "",
      nome: "",
      sequence_order: 1,
      tipo: "obrigatorio",
      limite_entrada_percentual: 20,
      duracao_meses: 6,
      descricao: ""
    });
    setEditingPathway(null);
    setSelectedContainerForPathway(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingContainer) {
      updateMutation.mutate({ id: editingContainer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // New handler for Pathway form submission
  const handlePathwaySubmit = (e) => {
    e.preventDefault();
    if (editingPathway) {
      updatePathwayMutation.mutate({ id: editingPathway.id, data: pathwayFormData });
    } else {
      createPathwayMutation.mutate(pathwayFormData);
    }
  };

  const handleEdit = (container) => {
    setEditingContainer(container);
    setFormData(container);
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este container?')) {
      deleteMutation.mutate(id);
    }
  };

  // New handler for adding a pathway
  const handleAddPathway = (containerId) => {
    setSelectedContainerForPathway(containerId);
    const containerPathways = pathways.filter(p => p.container_id === containerId);
    setPathwayFormData({
      container_id: containerId,
      nome: "",
      sequence_order: containerPathways.length + 1, // Suggest next sequence order
      tipo: "obrigatorio",
      limite_entrada_percentual: 20,
      duracao_meses: 6,
      descricao: ""
    });
    setIsPathwayDialogOpen(true);
  };

  // New handler for editing a pathway
  const handleEditPathway = (pathway) => {
    setEditingPathway(pathway);
    setPathwayFormData(pathway);
    setSelectedContainerForPathway(pathway.container_id);
    setIsPathwayDialogOpen(true);
  };

  // New handler for deleting a pathway
  const handleDeletePathway = (id) => {
    if (confirm('Tem certeza que deseja excluir este pathway?')) {
      deletePathwayMutation.mutate(id);
    }
  };

  const handleAIGenerated = (data) => {
    setFormData(data);
    setIsDialogOpen(true);
  };

  const handleAutoCreateStructure = (container) => {
    // Parse estrutura_completa if it's a string
    let estrutura = container.estrutura_completa;
    if (typeof estrutura === 'string') {
      try {
        const parsed = JSON.parse(container.ementa); // Assuming ementa might contain structure
        estrutura = parsed.estrutura_curricular; // Adjust field name if needed
      } catch {
        alert('Estrutura curricular não encontrada ou inválida');
        return;
      }
    }

    setSelectedContainerForStructure({
      id: container.id,
      estrutura: estrutura
    });
    setIsAutoCreateOpen(true);
  };

  const handleStructureComplete = () => {
    setIsAutoCreateOpen(false);
    setSelectedContainerForStructure(null);
    queryClient.invalidateQueries({ queryKey: ['pathways'] });
    queryClient.invalidateQueries({ queryKey: ['series'] });
    queryClient.invalidateQueries({ queryKey: ['units'] });
  };

  // Helper to get pathways for a specific container
  const getContainerPathways = (containerId) => {
    return pathways.filter(p => p.container_id === containerId).sort((a, b) => a.sequence_order - b.sequence_order);
  };

  // Helper to get series for a specific pathway
  const getPathwaySeries = (pathwayId) => {
    return series.filter(s => s.pathway_id === pathwayId);
  };

  const tipoColors = {
    graduacao: "bg-purple-100 text-purple-700 border-purple-200",
    pos_graduacao: "bg-blue-100 text-blue-700 border-blue-200",
    extensao: "bg-green-100 text-green-700 border-green-200",
    livre: "bg-orange-100 text-orange-700 border-orange-200"
  };

  const statusColors = {
    rascunho: "bg-slate-100 text-slate-700",
    ativo: "bg-green-100 text-green-700",
    arquivado: "bg-red-100 text-red-700"
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Containers & Pathways {/* Updated title */}
          </h1>
          <p className="text-slate-600 mt-1">
            Gerencie cursos e suas trilhas de aprendizado {/* Updated description */}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAIDialogOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar com IA
          </Button>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Container
          </Button>
        </div>
      </div>

      {/* Containers List */}
      {isLoading ? (
        <div className="space-y-4"> {/* Changed to space-y-4 for Accordion-like loading */}
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-32 bg-slate-200" /> {/* Simulate header */}
              <CardContent className="space-y-3 pt-6"> {/* Simulate content */}
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : containers.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-300">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Nenhum container criado
            </h3>
            <p className="text-slate-500 text-center mb-6 max-w-md">
              Comece criando seu primeiro container com IA ou manualmente
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsAIDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
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
        <Accordion type="multiple" value={expandedContainers} onValueChange={setExpandedContainers} className="space-y-4">
          <AnimatePresence>
            {containers.map((container) => {
              const hasEstrutura = container.estrutura_completa || (container.ementa && container.ementa.includes('estrutura_curricular'));
              const containerPathways = getContainerPathways(container.id);

              return (
                <AccordionItem key={container.id} value={container.id} className="border-0">
                  <Card className="overflow-hidden border-0 shadow-lg">
                    <AccordionTrigger className="hover:no-underline p-0">
                      <div className="w-full">
                        <div
                          className="h-24 relative overflow-hidden"
                          style={{
                            backgroundImage: container.thumbnail_url
                              ? `url(${container.thumbnail_url})`
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <div className="absolute inset-0 bg-black/40" />
                          {!container.thumbnail_url && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <GraduationCap className="w-12 h-12 text-white/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-between px-6">
                            <div className="flex-1 text-left"> {/* Added text-left for alignment */}
                              <h3 className="font-bold text-xl text-white mb-1">
                                {container.nome}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-white/90">
                                <Code className="w-4 h-4" />
                                {container.codigo_unico}
                              </div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <Badge className={statusColors[container.status]}>
                                {container.status}
                              </Badge>
                              {hasEstrutura && (
                                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  IA
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-white/90 text-slate-700">
                                <GitBranch className="w-3 h-3 mr-1" />
                                {containerPathways.length} pathways
                              </Badge>
                              <ChevronRight className="w-5 h-5 text-white data-[state=open]:rotate-90 transition-transform duration-200" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      <div className="p-6 space-y-4">
                        {/* Container Info */}
                        <div className="flex items-start justify-between pb-4 border-b">
                          <div className="space-y-2 flex-1">
                            {container.descricao && (
                              <p className="text-sm text-slate-600">
                                {container.descricao}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <Badge className={`${tipoColors[container.tipo]} border`}>
                                {container.tipo.replace('_', ' ')}
                              </Badge>
                              {container.duracao_padrao_pathways && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {container.duracao_padrao_pathways} períodos
                                </Badge>
                              )}
                              {container.carga_horaria_total > 0 && (
                                <Badge variant="outline">
                                  {container.carga_horaria_total}h total
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {hasEstrutura && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAutoCreateStructure(container)}
                                className="border-purple-200 text-purple-700 hover:bg-purple-50"
                              >
                                <Network className="w-4 h-4 mr-1" />
                                Auto Criar
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(container)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(container.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Pathways Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                              <GitBranch className="w-4 h-4 text-blue-600" />
                              Pathways / Trilhas
                            </h4>
                            <Button
                              size="sm"
                              onClick={() => handleAddPathway(container.id)}
                              className="bg-gradient-to-r from-blue-600 to-cyan-600"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Adicionar Pathway
                            </Button>
                          </div>

                          {containerPathways.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                              <GitBranch className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                              <p className="text-sm text-slate-500">Nenhum pathway criado para este container.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {containerPathways.map((pathway) => {
                                const pathwaySeries = getPathwaySeries(pathway.id);
                                return (
                                  <Card key={pathway.id} className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
                                    <CardContent className="p-4 space-y-3">
                                      <div className="flex items-start justify-between">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                                          {pathway.sequence_order}
                                        </div>
                                        <Badge className={pathway.tipo === 'obrigatorio' ? 'bg-blue-600 text-white' : 'bg-orange-100 text-orange-700'}>
                                          {pathway.tipo}
                                        </Badge>
                                      </div>
                                      <div>
                                        <h5 className="font-semibold text-slate-900 mb-1">
                                          {pathway.nome}
                                        </h5>
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                          <BookOpen className="w-3 h-3" />
                                          {pathwaySeries.length} disciplinas
                                        </div>
                                      </div>
                                      {pathway.duracao_meses && (
                                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                          <Clock className="w-3 h-3" />
                                          {pathway.duracao_meses} meses
                                        </Badge>
                                      )}
                                      <div className="flex gap-1 pt-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEditPathway(pathway)}
                                          className="flex-1 h-7 text-xs"
                                        >
                                          <Edit className="w-3 h-3 mr-1" />
                                          Editar
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeletePathway(pathway.id)}
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
      <AIGenerator
        isOpen={isAIDialogOpen}
        onClose={() => setIsAIDialogOpen(false)}
        onDataGenerated={handleAIGenerated}
      />

      {/* Auto Create Structure Dialog */}
      {selectedContainerForStructure && (
        <AutoCreateStructure
          containerId={selectedContainerForStructure.id}
          estruturaCompleta={selectedContainerForStructure.estrutura}
          isOpen={isAutoCreateOpen}
          onClose={() => {
            setIsAutoCreateOpen(false);
            setSelectedContainerForStructure(null);
          }}
          onComplete={handleStructureComplete}
        />
      )}

      {/* Container Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              {editingContainer ? 'Editar Container' : 'Novo Container'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nome">Nome do Curso *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Bacharelado em Ciência da Computação"
                  required
                />
              </div>

              <div>
                <Label htmlFor="codigo_unico">Código Único *</Label>
                <Input
                  id="codigo_unico"
                  value={formData.codigo_unico}
                  onChange={(e) => setFormData({ ...formData, codigo_unico: e.target.value })}
                  placeholder="Ex: BCC-2024"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="graduacao">Graduação</SelectItem>
                    <SelectItem value="pos_graduacao">Pós-Graduação</SelectItem>
                    <SelectItem value="extensao">Extensão</SelectItem>
                    <SelectItem value="livre">Livre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duracao_padrao_pathways">Duração (períodos)</Label>
                <Input
                  id="duracao_padrao_pathways"
                  type="number"
                  value={formData.duracao_padrao_pathways}
                  onChange={(e) => setFormData({ ...formData, duracao_padrao_pathways: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="carga_horaria_total">Carga Horária Total (h)</Label>
                <Input
                  id="carga_horaria_total"
                  type="number"
                  value={formData.carga_horaria_total}
                  onChange={(e) => setFormData({ ...formData, carga_horaria_total: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="thumbnail_url">URL da Imagem de Capa</Label>
                <Input
                  id="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="certificacao_mestra">Certificação Mestra</Label>
                <Input
                  id="certificacao_mestra"
                  value={formData.certificacao_mestra}
                  onChange={(e) => setFormData({ ...formData, certificacao_mestra: e.target.value })}
                  placeholder="Ex: Diploma de Bacharel em Ciência da Computação"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição detalhada do curso..."
                  rows={3}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="ementa">Ementa</Label>
                <Textarea
                  id="ementa"
                  value={formData.ementa}
                  onChange={(e) => setFormData({ ...formData, ementa: e.target.value })}
                  placeholder="Ementa completa do curso..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="arquivado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
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
                className="bg-gradient-to-r from-purple-600 to-blue-600"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingContainer ? 'Atualizar' : 'Criar'} Container
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Pathway Create/Edit Dialog */}
      <Dialog open={isPathwayDialogOpen} onOpenChange={(open) => {
        setIsPathwayDialogOpen(open);
        if (!open) resetPathwayForm();
      }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-600" />
              {editingPathway ? 'Editar Pathway' : 'Novo Pathway'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePathwaySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="pathway_nome">Nome do Pathway *</Label>
                <Input
                  id="pathway_nome"
                  value={pathwayFormData.nome}
                  onChange={(e) => setPathwayFormData({ ...pathwayFormData, nome: e.target.value })}
                  placeholder="Ex: 1º Período"
                  required
                />
              </div>

              <div>
                <Label htmlFor="sequence_order">Ordem de Sequência *</Label>
                <Input
                  id="sequence_order"
                  type="number"
                  value={pathwayFormData.sequence_order}
                  onChange={(e) => setPathwayFormData({ ...pathwayFormData, sequence_order: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="pathway_tipo">Tipo *</Label>
                <Select
                  value={pathwayFormData.tipo}
                  onValueChange={(value) => setPathwayFormData({ ...pathwayFormData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="obrigatorio">Obrigatório</SelectItem>
                    <SelectItem value="optativo">Optativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duracao_meses">Duração (meses)</Label>
                <Input
                  id="duracao_meses"
                  type="number"
                  value={pathwayFormData.duracao_meses}
                  onChange={(e) => setPathwayFormData({ ...pathwayFormData, duracao_meses: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="limite_entrada_percentual">Limite de Entrada (%)</Label>
                <Input
                  id="limite_entrada_percentual"
                  type="number"
                  value={pathwayFormData.limite_entrada_percentual}
                  onChange={(e) => setPathwayFormData({ ...pathwayFormData, limite_entrada_percentual: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="pathway_descricao">Descrição</Label>
                <Textarea
                  id="pathway_descricao"
                  value={pathwayFormData.descricao}
                  onChange={(e) => setPathwayFormData({ ...pathwayFormData, descricao: e.target.value })}
                  placeholder="Descrição do pathway..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPathwayDialogOpen(false);
                  resetPathwayForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-cyan-600"
                disabled={createPathwayMutation.isPending || updatePathwayMutation.isPending}
              >
                {editingPathway ? 'Atualizar' : 'Criar'} Pathway
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
