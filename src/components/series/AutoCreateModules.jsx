import { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Layers, Loader2, CheckCircle2, AlertCircle, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AutoCreateModules({ seriesId, estruturaModulos, isOpen, onClose, onComplete }) {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [results, setResults] = useState({
    units: 0,
    components: 0,
    objetivos: 0,
    errors: []
  });

  const createStructure = async () => {
    if (!estruturaModulos || estruturaModulos.length === 0) {
      alert('Estrutura de módulos não encontrada');
      onClose();
      return;
    }

    setIsCreating(true);
    setProgress(5);
    setCurrentStep('Iniciando criação de módulos...');

    try {
      const totalSteps = estruturaModulos.length;
      let currentStepNum = 0;

      const createdUnits = [];
      const createdComponents = [];
      const errors = [];
      let totalObjetivos = 0;

      // Create Units and Components
      for (const modulo of estruturaModulos) {
        currentStepNum++;
        setCurrentStep(`Criando módulo: ${modulo.nome}...`);
        setProgress(10 + (currentStepNum / totalSteps) * 70);

        try {
          // Count objectives
          if (modulo.objetivos) {
            totalObjetivos += modulo.objetivos.length;
          }

          // Build description with objectives and topics
          let descricaoCompleta = '';
          
          if (modulo.objetivos && modulo.objetivos.length > 0) {
            descricaoCompleta += '**Objetivos:**\n' + 
              modulo.objetivos.map((obj, idx) => `${idx + 1}. ${obj}`).join('\n');
          }
          
          if (modulo.topicos && modulo.topicos.length > 0) {
            descricaoCompleta += '\n\n**Tópicos:**\n' + 
              modulo.topicos.map(t => `• ${t}`).join('\n');
          }

          // Create Unit
          const unit = await base44.entities.Unit.create({
            series_id: seriesId,
            nome: modulo.nome,
            sequence_order: currentStepNum,
            duracao_estimada_horas: modulo.duracao_horas || 4,
            descricao: descricaoCompleta || undefined,
            objetivos: modulo.objetivos || []
          });
          createdUnits.push(unit);

          // Create suggested Components for this Unit
          if (modulo.componentes_sugeridos && modulo.componentes_sugeridos.length > 0) {
            for (let i = 0; i < modulo.componentes_sugeridos.length; i++) {
              const comp = modulo.componentes_sugeridos[i];
              
              try {
                const component = await base44.entities.Component.create({
                  unit_id: unit.id,
                  nome: comp.nome,
                  tipo: comp.tipo || 'texto',
                  sequence_order: i + 1,
                  descricao: comp.descricao || '',
                  obrigatorio: true,
                  progression_rule: 'sequencial'
                });
                createdComponents.push(component);
              } catch (error) {
                errors.push(`Erro ao criar componente "${comp.nome}": ${error.message}`);
              }
            }
          }
        } catch (error) {
          errors.push(`Erro ao criar módulo "${modulo.nome}": ${error.message}`);
        }
      }

      setProgress(95);
      setCurrentStep('Finalizando...');

      setResults({
        units: createdUnits.length,
        components: createdComponents.length,
        objetivos: totalObjetivos,
        errors
      });

      setProgress(100);
      setCurrentStep('Módulos criados com sucesso!');

      setTimeout(() => {
        onComplete({
          units: createdUnits.length,
          components: createdComponents.length
        });
      }, 1500);

    } catch (error) {
      console.error('Erro ao criar módulos:', error);
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
        units: 0,
        components: 0,
        objetivos: 0,
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            Criando Módulos Automaticamente
          </DialogTitle>
          <DialogDescription>
            Criando módulos e componentes sugeridos pela IA.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {progress < 100 ? (
            <>
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-600 to-amber-600 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <p className="font-semibold text-slate-900">Criando módulos...</p>
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
                <p className="font-semibold text-slate-900 text-lg">Módulos criados!</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Módulos criados:</span>
                  <span className="font-semibold text-slate-900">{results.units}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Componentes criados:</span>
                  <span className="font-semibold text-slate-900">{results.components}</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-700 mb-2">Elementos Pedagógicos:</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-green-600" />
                    Objetivos de aprendizagem:
                  </span>
                  <span className="font-semibold text-green-700">{results.objetivos}</span>
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
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600"
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