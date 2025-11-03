import { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, BookOpen, Target, Layers, ClipboardCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AIGeneratorSeries({ isOpen, onClose, onDataGenerated, pathways }) {
  const [seriesName, setSeriesName] = useState('');
  const [pathwayId, setPathwayId] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const generateContent = async () => {
    if (!seriesName.trim() || !pathwayId) return;

    setIsGenerating(true);
    setProgress(10);
    setCurrentStep('Pesquisando informações na web...');

    try {
      const selectedPathway = pathways.find(p => p.id === pathwayId);
      
      setProgress(30);
      const seriesPrompt = `
Você é um especialista em design instrucional, pedagogia universitária e desenvolvimento curricular.

Crie uma disciplina/matéria COMPLETA, DETALHADA e PEDAGOGICAMENTE RICA chamada "${seriesName}".
${additionalInfo ? `Informações adicionais: ${additionalInfo}` : ''}
${selectedPathway ? `Esta disciplina faz parte de: ${selectedPathway.nome}` : ''}

A disciplina deve incluir:

1. **Ementa detalhada** (3-4 parágrafos explicando o conteúdo, relevância e aplicações práticas)

2. **Objetivos de aprendizagem da disciplina** (5-7 objetivos específicos e mensuráveis seguindo taxonomia de Bloom)
   - Use verbos de ação específicos (aplicar, analisar, avaliar, criar, etc.)
   - Cada objetivo deve ser claro e verificável

3. **Estrutura modular detalhada** (6-10 módulos/unidades):
   Para cada MÓDULO/UNIT:
   - Nome descritivo do módulo
   - Objetivos específicos do módulo (3-4 objetivos)
   - Tópicos principais abordados (3-5 tópicos)
   - Duração estimada em horas
   - Componentes sugeridos (tipos de conteúdo: vídeo-aulas, leituras, exercícios, projetos, etc.)

4. **Informações da disciplina:**
   - Carga horária total sugerida (em horas)
   - Código sugerido para a disciplina (formato: ABC-XXX)
   - Nível de dificuldade (inicial, intermediário, avançado)
   
5. **Avaliação sugerida:**
   - Tipos de avaliação recomendados (escolha 2-4):
     * "prova_objetiva" (múltipla escolha, V/F)
     * "prova_dissertativa" (questões abertas, ensaios)
     * "trabalho_pratico" (projetos, estudos de caso)
     * "apresentacao" (seminários, defesas)
     * "laboratorio" (práticas, experimentos)
     * "portfolio" (compilação de trabalhos)
     * "participacao" (fóruns, discussões)
     * "autoavaliacao" (reflexões críticas)
   - Peso sugerido para cada tipo de avaliação (soma 100%)

6. **Recursos e metodologias:**
   - Metodologias de ensino recomendadas
   - Recursos didáticos sugeridos
   - Ferramentas e tecnologias úteis

Seja específico, detalhado, pedagogicamente fundamentado e siga as melhores práticas educacionais.
`;

      const seriesResult = await base44.integrations.Core.InvokeLLM({
        prompt: seriesPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            ementa: { type: "string" },
            objetivos_disciplina: {
              type: "array",
              items: { type: "string" }
            },
            modulos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  nome: { type: "string" },
                  objetivos: {
                    type: "array",
                    items: { type: "string" }
                  },
                  topicos: {
                    type: "array",
                    items: { type: "string" }
                  },
                  duracao_horas: { type: "number" },
                  componentes_sugeridos: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        tipo: { 
                          type: "string",
                          enum: ["midia", "atividade", "avaliacao", "anexo", "texto"]
                        },
                        nome: { type: "string" },
                        descricao: { type: "string" }
                      }
                    }
                  }
                }
              }
            },
            carga_horaria_total: { type: "number" },
            codigo_sugerido: { type: "string" },
            nivel_dificuldade: {
              type: "string",
              enum: ["inicial", "intermediario", "avancado"]
            },
            avaliacoes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tipo: {
                    type: "string",
                    enum: [
                      "prova_objetiva",
                      "prova_dissertativa",
                      "trabalho_pratico",
                      "apresentacao",
                      "laboratorio",
                      "portfolio",
                      "participacao",
                      "autoavaliacao"
                    ]
                  },
                  peso_percentual: { type: "number" }
                }
              }
            },
            metodologias: {
              type: "array",
              items: { type: "string" }
            },
            recursos_sugeridos: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setProgress(90);
      setCurrentStep('Finalizando...');

      // Build complete ementa with objectives
      let ementaCompleta = seriesResult.ementa;
      
      if (seriesResult.objetivos_disciplina && seriesResult.objetivos_disciplina.length > 0) {
        ementaCompleta += '\n\n**Objetivos de Aprendizagem:**\n' + 
          seriesResult.objetivos_disciplina.map((obj, idx) => `${idx + 1}. ${obj}`).join('\n');
      }
      
      if (seriesResult.avaliacoes && seriesResult.avaliacoes.length > 0) {
        ementaCompleta += '\n\n**Avaliação:**\n' + 
          seriesResult.avaliacoes.map(av => `• ${av.tipo.replace(/_/g, ' ').toUpperCase()} (${av.peso_percentual}%)`).join('\n');
      }

      if (seriesResult.metodologias && seriesResult.metodologias.length > 0) {
        ementaCompleta += '\n\n**Metodologias:**\n' + 
          seriesResult.metodologias.map(m => `• ${m}`).join('\n');
      }

      // Format the data
      const generatedData = {
        pathway_id: pathwayId,
        nome: seriesName,
        codigo_unico: seriesResult.codigo_sugerido || `${seriesName.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`,
        duracao_horas: seriesResult.carga_horaria_total || 60,
        ementa: ementaCompleta,
        nota_maxima: 10,
        nota_minima_aprovacao: 7,
        assiduidade_minima: 75,
        oferavel: true,
        reutilizavel: true,
        independente: false,
        reaprovavel: true,
        microcertificacao: false,
        estrutura_modulos: seriesResult.modulos,
        metadata: {
          nivel_dificuldade: seriesResult.nivel_dificuldade,
          avaliacoes: seriesResult.avaliacoes,
          recursos: seriesResult.recursos_sugeridos
        }
      };

      setProgress(100);
      setCurrentStep('Concluído!');

      setTimeout(() => {
        onDataGenerated(generatedData);
        onClose();
        resetState();
      }, 500);

    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      alert('Erro ao gerar conteúdo com IA. Por favor, tente novamente.');
      setIsGenerating(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  const resetState = () => {
    setSeriesName('');
    setPathwayId('');
    setAdditionalInfo('');
    setIsGenerating(false);
    setProgress(0);
    setCurrentStep('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isGenerating) {
        onClose();
        resetState();
      }
    }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Gerador de Disciplina com IA
          </DialogTitle>
          <DialogDescription>
            A IA criará uma disciplina completa com ementa, objetivos, módulos e estrutura pedagógica.
          </DialogDescription>
        </DialogHeader>

        {!isGenerating ? (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="pathwayId">Pathway/Trilha *</Label>
              <Select value={pathwayId} onValueChange={setPathwayId}>
                <SelectTrigger className="mt-2">
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

            <div>
              <Label htmlFor="seriesName">Nome da Disciplina *</Label>
              <Input
                id="seriesName"
                value={seriesName}
                onChange={(e) => setSeriesName(e.target.value)}
                placeholder="Ex: Algoritmos e Estruturas de Dados"
                className="mt-2"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="additionalInfo">Informações Adicionais (Opcional)</Label>
              <Input
                id="additionalInfo"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Ex: Foco em aplicações práticas com Python"
                className="mt-2"
              />
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-600" />
                O que será gerado:
              </h4>
              <ul className="space-y-1.5 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Ementa detalhada com contexto e aplicações</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Objetivos de aprendizagem específicos e mensuráveis</span>
                </li>
                <li className="flex items-start gap-2">
                  <Layers className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Estrutura modular completa (6-10 módulos)</span>
                </li>
                <li className="flex items-start gap-2">
                  <ClipboardCheck className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <span>Sugestões de avaliação e metodologias</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 animate-pulse" />
                <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <p className="font-semibold text-slate-900">Gerando disciplina...</p>
                <p className="text-sm text-slate-600">{currentStep}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-slate-500">{progress}%</p>
            </div>
          </div>
        )}

        <DialogFooter>
          {!isGenerating && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  resetState();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={generateContent}
                disabled={!seriesName.trim() || !pathwayId}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar com IA
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}