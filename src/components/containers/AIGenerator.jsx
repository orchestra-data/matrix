import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, CheckCircle, Image, FileText, Target, Link2, ClipboardCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AIGenerator({ isOpen, onClose, onDataGenerated }) {
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const generateContent = async () => {
    if (!courseName.trim()) return;

    setIsGenerating(true);
    setProgress(10);
    setCurrentStep('Pesquisando informações na web...');

    try {
      // Step 1: Generate comprehensive ementa using LLM with web context
      setProgress(30);
      const ementaPrompt = `
Você é um especialista em design instrucional, pedagogia universitária e avaliação de aprendizagem.

Crie uma ementa COMPLETA, DETALHADA e PEDAGOGICAMENTE RICA para um curso chamado "${courseName}".
${courseDescription ? `Descrição adicional: ${courseDescription}` : ''}

A ementa deve incluir:

1. **Descrição geral do curso** (2-3 parágrafos detalhados)

2. **Objetivos de aprendizagem do curso** (5-8 objetivos gerais mensuráveis seguindo taxonomia de Bloom)

3. **Estrutura curricular organizada hierarquicamente:**
   
   Para cada PERÍODO/TRILHA (Pathway):
   - Nome do período (ex: "1º Período", "Módulo Introdutório")
   - Duração em meses
   - Objetivos de aprendizagem específicos do período (3-5 objetivos)
   - Descrição do que será aprendido neste período
   
   Para cada DISCIPLINA (Series) dentro do período:
   - Nome completo da disciplina
   - Código sugerido (formato: ABC-XXX)
   - Carga horária estimada
   - Objetivos de aprendizagem específicos da disciplina (3-5 objetivos mensuráveis)
   - Ementa resumida da disciplina
   - **Pré-requisitos**: Liste códigos de disciplinas que devem ser cursadas antes (podem ser de períodos anteriores). Use códigos gerados anteriormente.
   - **Tipos de avaliação recomendados**: Sugira 2-4 tipos específicos de avaliação apropriados para esta disciplina, escolhendo entre:
     * "prova_objetiva" (múltipla escolha, V/F)
     * "prova_dissertativa" (questões abertas, ensaios)
     * "trabalho_pratico" (projetos, estudos de caso)
     * "apresentacao" (seminários, defesas)
     * "laboratorio" (práticas, experimentos)
     * "portfolio" (compilação de trabalhos)
     * "participacao" (fóruns, discussões)
     * "autoavaliacao" (reflexões críticas)
   
   Para cada disciplina, liste os MÓDULOS/TÓPICOS principais (3-6 módulos por disciplina):
   - Nome do módulo/tópico
   - Objetivos de aprendizagem específicos do módulo (2-3 objetivos)

4. **Carga horária total** estimada do curso

5. **Tipo de certificação** recomendada

6. **Duração total** em meses

7. **Tipo do curso** (graduacao, pos_graduacao, extensao, ou livre)

**IMPORTANTE sobre pré-requisitos:**
- Seja realista e criterioso ao definir pré-requisitos
- Disciplinas de períodos iniciais normalmente não têm pré-requisitos
- Disciplinas avançadas devem listar pré-requisitos lógicos (ex: Cálculo II requer Cálculo I)
- Use os códigos das disciplinas já definidas anteriormente na estrutura

**IMPORTANTE sobre avaliações:**
- Escolha tipos de avaliação que façam sentido para o conteúdo da disciplina
- Disciplinas teóricas: provas dissertativas, trabalhos práticos, apresentações
- Disciplinas práticas: laboratório, trabalhos práticos, portfolio
- Disciplinas de humanas: ensaios, apresentações, participação, autoavaliação
- Disciplinas exatas: provas objetivas, laboratório, trabalhos práticos
- Combine diferentes tipos para avaliação formativa e somativa

Seja específico, detalhado, pedagogicamente fundamentado e siga as melhores práticas para educação superior.
`;

      const ementaResult = await base44.integrations.Core.InvokeLLM({
        prompt: ementaPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            descricao: { type: "string" },
            objetivos_curso: {
              type: "array",
              items: { type: "string" }
            },
            estrutura_curricular: {
              type: "object",
              properties: {
                periodos: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      nome: { type: "string" },
                      duracao_meses: { type: "number" },
                      objetivos: {
                        type: "array",
                        items: { type: "string" }
                      },
                      descricao: { type: "string" },
                      disciplinas: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            nome: { type: "string" },
                            codigo: { type: "string" },
                            carga_horaria: { type: "number" },
                            objetivos: {
                              type: "array",
                              items: { type: "string" }
                            },
                            ementa: { type: "string" },
                            pre_requisitos: {
                              type: "array",
                              items: { type: "string" },
                              description: "Códigos das disciplinas pré-requisito"
                            },
                            tipos_avaliacao: {
                              type: "array",
                              items: {
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
                              }
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
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            carga_horaria_total: { type: "number" },
            certificacao_recomendada: { type: "string" },
            duracao_total_meses: { type: "number" },
            tipo_curso: {
              type: "string",
              enum: ["graduacao", "pos_graduacao", "extensao", "livre"]
            }
          }
        }
      });

      setProgress(60);
      setCurrentStep('Gerando imagem de capa com IA...');

      // Step 2: Generate thumbnail
      const thumbnailPrompt = `Professional and modern course cover image for "${courseName}". 
Academic style, clean design, featuring abstract educational elements like books, graduation cap, or knowledge symbols. 
Professional photography style, minimalist, inspiring, suitable for university catalog. 
Color palette: purple, blue, white. High quality, 16:9 aspect ratio.`;

      const thumbnailResult = await base44.integrations.Core.GenerateImage({
        prompt: thumbnailPrompt
      });

      setProgress(90);
      setCurrentStep('Finalizando...');

      // Step 3: Format the data
      const generatedData = {
        nome: courseName,
        codigo_unico: `${courseName.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}`,
        descricao: ementaResult.descricao,
        ementa: JSON.stringify(ementaResult, null, 2),
        thumbnail_url: thumbnailResult.url,
        carga_horaria_total: ementaResult.carga_horaria_total,
        certificacao_mestra: ementaResult.certificacao_recomendada,
        duracao_padrao_pathways: Math.ceil(ementaResult.duracao_total_meses / 6), // Convert to semesters
        tipo: ementaResult.tipo_curso,
        status: 'rascunho',
        estrutura_completa: ementaResult.estrutura_curricular
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
    setCourseName('');
    setCourseDescription('');
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Gerador de Conteúdo com IA Avançado
          </DialogTitle>
          <DialogDescription>
            A IA irá criar uma ementa pedagógica completa com objetivos de aprendizagem, pré-requisitos e tipos de avaliação.
          </DialogDescription>
        </DialogHeader>

        {!isGenerating ? (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="courseName">Nome do Curso *</Label>
              <Input
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Ex: Bacharelado em Ciência da Computação"
                className="mt-2"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="courseDescription">Descrição Adicional (Opcional)</Label>
              <Input
                id="courseDescription"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                placeholder="Ex: Foco em Inteligência Artificial e Machine Learning"
                className="mt-2"
              />
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                O que será gerado:
              </h4>
              <ul className="space-y-1.5 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Objetivos de aprendizagem para curso, períodos e disciplinas</span>
                </li>
                <li className="flex items-start gap-2">
                  <Link2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Mapeamento de pré-requisitos entre disciplinas</span>
                </li>
                <li className="flex items-start gap-2">
                  <ClipboardCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Sugestões de tipos de avaliação por disciplina</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>Estrutura curricular completa e detalhada</span>
                </li>
                <li className="flex items-start gap-2">
                  <Image className="w-4 h-4 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span>Imagem de capa profissional gerada por IA</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 animate-pulse" />
                <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <p className="font-semibold text-slate-900">Gerando conteúdo...</p>
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
                disabled={!courseName.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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