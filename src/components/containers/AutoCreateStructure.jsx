import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Network, Loader2, CheckCircle2, AlertCircle, Target, Link2, ClipboardCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AutoCreateStructure({ containerId, estruturaCompleta, isOpen, onClose, onComplete }) {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [results, setResults] = useState({
    pathways: 0,
    series: 0,
    units: 0,
    objetivos: 0,
    prerequisitos: 0,
    avaliacoes: 0,
    errors: []
  });

  const createStructure = async () => {
    if (!estruturaCompleta?.periodos) {
      alert('Estrutura curricular não encontrada');
      onClose();
      return;
    }

    setIsCreating(true);
    setProgress(5);
    setCurrentStep('Iniciando criação da estrutura...');

    try {
      const periodos = estruturaCompleta.periodos;
      const totalSteps = periodos.length;
      let currentStepNum = 0;

      const createdPathways = [];
      const createdSeries = [];
      const createdUnits = [];
      const errors = [];
      
      // Track for statistics
      let totalObjetivos = 0;
      let totalPrerequisitos = 0;
      let totalAvaliacoes = 0;

      // Map to store series codes -> series IDs for prerequisite resolution
      const seriesCodeToIdMap = {};

      // Create Pathways and their content
      for (const periodo of periodos) {
        currentStepNum++;
        setCurrentStep(`Criando ${periodo.nome}...`);
        setProgress(10 + (currentStepNum / totalSteps) * 70);

        try {
          // Count objectives for the pathway
          if (periodo.objetivos) {
            totalObjetivos += periodo.objetivos.length;
          }

          // Create Pathway
          const pathway = await base44.entities.Pathway.create({
            container_id: containerId,
            nome: periodo.nome,
            sequence_order: currentStepNum,
            tipo: 'obrigatorio',
            duracao_meses: periodo.duracao_meses || 6,
            descricao: periodo.descricao || `${periodo.nome} do curso${periodo.objetivos ? '\n\nObjetivos:\n' + periodo.objetivos.map((obj, i) => `${i + 1}. ${obj}`).join('\n') : ''}`
          });
          createdPathways.push(pathway);

          // Create Series (Disciplinas) for this Pathway
          if (periodo.disciplinas && periodo.disciplinas.length > 0) {
            for (let i = 0; i < periodo.disciplinas.length; i++) {
              const disciplina = periodo.disciplinas[i];
              
              try {
                // Count objectives for the series
                if (disciplina.objetivos) {
                  totalObjetivos += disciplina.objetivos.length;
                }

                // Count assessment types
                if (disciplina.tipos_avaliacao) {
                  totalAvaliacoes += disciplina.tipos_avaliacao.length;
                }

                // Build ementa with objectives and assessment info
                let ementaCompleta = disciplina.ementa || '';
                
                if (disciplina.objetivos && disciplina.objetivos.length > 0) {
                  ementaCompleta += '\n\n**Objetivos de Aprendizagem:**\n' + 
                    disciplina.objetivos.map((obj, idx) => `${idx + 1}. ${obj}`).join('\n');
                }
                
                if (disciplina.tipos_avaliacao && disciplina.tipos_avaliacao.length > 0) {
                  ementaCompleta += '\n\n**Tipos de Avaliação Recomendados:**\n' + 
                    disciplina.tipos_avaliacao.map(tipo => `• ${tipo.replace(/_/g, ' ').toUpperCase()}`).join('\n');
                }

                // Create the series (we'll update prerequisites later)
                const series = await base44.entities.Series.create({
                  pathway_id: pathway.id,
                  nome: disciplina.nome,
                  codigo_unico: disciplina.codigo || `${disciplina.nome.substring(0, 3).toUpperCase()}-${currentStepNum}${i}`,
                  sequence_order: i + 1,
                  duracao_horas: disciplina.carga_horaria || 60,
                  oferavel: true,
                  reutilizavel: true,
                  independente: false,
                  nota_maxima: 10,
                  nota_minima_aprovacao: 7,
                  assiduidade_minima: 75,
                  ementa: ementaCompleta
                });
                
                createdSeries.push(series);
                
                // Store the mapping of code -> ID for prerequisite resolution
                seriesCodeToIdMap[disciplina.codigo] = series.id;

                // Create Units (Módulos) for this Series
                if (disciplina.modulos && disciplina.modulos.length > 0) {
                  for (let j = 0; j < disciplina.modulos.length; j++) {
                    const modulo = disciplina.modulos[j];
                    
                    try {
                      // Count module objectives
                      if (modulo.objetivos) {
                        totalObjetivos += modulo.objetivos.length;
                      }

                      // Build description with objectives
                      let descricaoCompleta = '';
                      if (modulo.objetivos && modulo.objetivos.length > 0) {
                        descricaoCompleta = 'Objetivos:\n' + 
                          modulo.objetivos.map((obj, idx) => `${idx + 1}. ${obj}`).join('\n');
                      }

                      const unit = await base44.entities.Unit.create({
                        series_id: series.id,
                        nome: typeof modulo === 'string' ? modulo : modulo.nome,
                        sequence_order: j + 1,
                        duracao_estimada_horas: Math.ceil((disciplina.carga_horaria || 60) / disciplina.modulos.length),
                        descricao: descricaoCompleta || undefined
                      });
                      createdUnits.push(unit);
                    } catch (error) {
                      errors.push(`Erro ao criar unidade "${typeof modulo === 'string' ? modulo : modulo.nome}": ${error.message}`);
                    }
                  }
                }
              } catch (error) {
                errors.push(`Erro ao criar disciplina "${disciplina.nome}": ${error.message}`);
              }
            }
          }
        } catch (error) {
          errors.push(`Erro ao criar período "${periodo.nome}": ${error.message}`);
        }
      }

      // Second pass: Update prerequisites now that all series are created
      setProgress(85);
      setCurrentStep('Configurando pré-requisitos...');
      
      for (const periodo of periodos) {
        if (periodo.disciplinas) {
          for (const disciplina of periodo.disciplinas) {
            if (disciplina.pre_requisitos && disciplina.pre_requisitos.length > 0) {
              try {
                const seriesId = seriesCodeToIdMap[disciplina.codigo];
                if (seriesId) {
                  // Convert prerequisite codes to IDs
                  const prerequisiteIds = disciplina.pre_requisitos
                    .map(code => seriesCodeToIdMap[code])
                    .filter(id => id !== undefined);
                  
                  if (prerequisiteIds.length > 0) {
                    await base44.entities.Series.update(seriesId, {
                      pre_requisitos: prerequisiteIds
                    });
                    totalPrerequisitos += prerequisiteIds.length;
                  }
                }
              } catch (error) {
                errors.push(`Erro ao configurar pré-requisitos para "${disciplina.nome}": ${error.message}`);
              }
            }
          }
        }
      }

      setProgress(95);
      setCurrentStep('Finalizando...');

      setResults({
        pathways: createdPathways.length,
        series: createdSeries.length,
        units: createdUnits.length,
        objetivos: totalObjetivos,
        prerequisitos: totalPrerequisitos,
        avaliacoes: totalAvaliacoes,
        errors
      });

      setProgress(100);
      setCurrentStep('Estrutura criada com sucesso!');

      setTimeout(() => {
        onComplete({
          pathways: createdPathways.length,
          series: createdSeries.length,
          units: createdUnits.length
        });
      }, 1500);

    } catch (error) {
      console.error('Erro ao criar estrutura:', error);
      setResults(prev => ({
        ...prev,
        errors: [...prev.errors, `Erro geral: ${error.message}`]
      }));
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (isOpen && !isCreating && progress === 0) {
      createStructure();
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!isCreating) {
      setIsCreating(false);
      setProgress(0);
      setCurrentStep('');
      setResults({
        pathways: 0,
        series: 0,
        units: 0,
        objetivos: 0,
        prerequisitos: 0,
        avaliacoes: 0,
        errors: []
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            Criando Estrutura Completa
          </DialogTitle>
          <DialogDescription>
            Criando automaticamente toda a hierarquia curricular com objetivos, pré-requisitos e avaliações.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {progress < 100 ? (
            <>
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <p className="font-semibold text-slate-900">Criando estrutura...</p>
                  <p className="text-sm text-slate-600">{currentStep}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-slate-500">{Math.round(progress)}%</p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <p className="font-semibold text-slate-900 text-lg">Estrutura criada!</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Pathways criados:</span>
                  <span className="font-semibold text-slate-900">{results.pathways}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Disciplinas criadas:</span>
                  <span className="font-semibold text-slate-900">{results.series}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Módulos criados:</span>
                  <span className="font-semibold text-slate-900">{results.units}</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-700 mb-2">Elementos Pedagógicos:</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-purple-600" />
                    Objetivos de aprendizagem:
                  </span>
                  <span className="font-semibold text-purple-700">{results.objetivos}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-blue-600" />
                    Pré-requisitos configurados:
                  </span>
                  <span className="font-semibold text-blue-700">{results.prerequisitos}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    <ClipboardCheck className="w-3.5 h-3.5 text-green-600" />
                    Tipos de avaliação sugeridos:
                  </span>
                  <span className="font-semibold text-green-700">{results.avaliacoes}</span>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                    <p className="text-sm font-medium text-orange-900">
                      {results.errors.length} avisos durante a criação
                    </p>
                  </div>
                  <div className="max-h-32 overflow-y-auto text-xs text-orange-800 space-y-1">
                    {results.errors.map((error, i) => (
                      <p key={i}>• {error}</p>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
              >
                Concluir
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}