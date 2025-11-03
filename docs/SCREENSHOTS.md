# 📸 Guia de Screenshots

Este documento explica como capturar e adicionar screenshots ao projeto Matrix.

## 🎯 Screenshots Necessários

Para uma documentação completa, capture os seguintes screenshots:

### 1. Dashboard (dashboard.png)
**Rota:** `/` ou `/dashboard`
**Resolução recomendada:** 1920x1080
**Foco:** Visão geral com cards de métricas e estatísticas

**O que capturar:**
- Cards de estatísticas principais
- Gráficos de progresso
- Lista de containers/séries recentes
- Navegação lateral

### 2. Containers (containers.png)
**Rota:** `/containers`
**Resolução recomendada:** 1920x1080
**Foco:** Lista de containers com opções de gerenciamento

**O que capturar:**
- Lista de containers criados
- Botões de ação (criar, editar, deletar)
- Cards de containers com informações
- Estrutura curricular expandida

### 3. Séries/Disciplinas (series.png)
**Rota:** `/series`
**Resolução recomendada:** 1920x1080
**Foco:** Gerenciamento de séries e unidades

**O que capturar:**
- Lista de séries/disciplinas
- Unidades organizadas por série
- Opções de gerenciamento
- Accordion expandido mostrando conteúdo

### 4. Journey Builder (journey-builder.png)
**Rota:** `/journey-builder`
**Resolução recomendada:** 1920x1080
**Foco:** Interface de construção de jornadas

**O que capturar:**
- Área de drag & drop
- Templates de componentes
- Estrutura de unidades e componentes
- Preview de jornada completa

### 5. Componentes (components.png)
**Rota:** `/components`
**Resolução recomendada:** 1920x1080
**Foco:** Biblioteca de componentes

**O que capturar:**
- Lista de componentes disponíveis
- Cards com tipos de componentes
- Informações de cada componente
- Opções de edição

### 6. AI Generator (ai-generator.png)
**Modal/Dialog**
**Resolução recomendada:** 800x600 (modal)
**Foco:** Interface de geração com IA

**O que capturar:**
- Formulário de geração
- Progress bar em ação
- Resultado gerado
- Botões de ação

## 🛠️ Como Capturar Screenshots

### Método 1: Ferramentas do Sistema

#### Windows
1. Abra a aplicação: `npm run dev`
2. Navegue para a página desejada
3. Pressione `Win + Shift + S` para Snipping Tool
4. Selecione a área completa da janela
5. Salve como PNG em `docs/images/`

#### macOS
1. Abra a aplicação: `npm run dev`
2. Navegue para a página desejada
3. Pressione `Cmd + Shift + 4` depois `Space`
4. Clique na janela do navegador
5. Salve como PNG em `docs/images/`

#### Linux
1. Abra a aplicação: `npm run dev`
2. Navegue para a página desejada
3. Use `gnome-screenshot` ou `flameshot`
4. Salve como PNG em `docs/images/`

### Método 2: DevTools do Navegador

#### Chrome/Edge/Brave
1. Abra DevTools: `F12`
2. Pressione `Ctrl + Shift + P` (Windows) ou `Cmd + Shift + P` (Mac)
3. Digite "screenshot"
4. Selecione "Capture full size screenshot"
5. Salve em `docs/images/`

#### Firefox
1. Abra DevTools: `F12`
2. Clique no ícone de câmera na barra de ferramentas
3. Ou use a ferramenta screenshot: `Shift + F2` → `screenshot --fullpage`
4. Salve em `docs/images/`

### Método 3: Extensões do Navegador

**Recomendado: Awesome Screenshot**
- Chrome: https://chrome.google.com/webstore
- Firefox: https://addons.mozilla.org

**Recursos:**
- Captura de página completa
- Anotações
- Edição básica
- Blur de informações sensíveis

## 📏 Especificações Técnicas

### Formato
- **Extensão:** `.png` (preferencial) ou `.jpg`
- **Profundidade de cor:** 24-bit ou 32-bit
- **Compressão:** Otimizada (use TinyPNG ou similar)

### Resolução
- **Desktop:** 1920x1080 (Full HD)
- **Modals:** 800x600 ou tamanho real
- **Detalhes:** 1280x720 (HD) mínimo

### Tamanho do Arquivo
- **Máximo:** 500 KB por imagem
- **Recomendado:** 200-300 KB
- **Use:** https://tinypng.com/ para otimizar

### Nomenclatura
Use kebab-case e seja descritivo:
```
dashboard.png
containers-list.png
series-management.png
journey-builder-interface.png
components-library.png
ai-generator-modal.png
ai-generator-progress.png
ai-generator-result.png
```

## 🎨 Dicas de Qualidade

### Antes de Capturar
1. ✅ Limpe o cache do navegador
2. ✅ Use resolução 1920x1080 ou superior
3. ✅ Feche abas e extensões desnecessárias
4. ✅ Ajuste o zoom para 100%
5. ✅ Esconda informações sensíveis

### Durante a Captura
1. ✅ Capture em modo claro (light mode) por padrão
2. ✅ Inclua navegação e contexto
3. ✅ Mostre funcionalidades principais
4. ✅ Use dados de exemplo realistas
5. ✅ Evite informações pessoais/sensíveis

### Dados de Exemplo
Use nomes e informações fictícias mas realistas:
```
Container: "Desenvolvimento Web Completo"
Série: "JavaScript Moderno"
Unidade: "React e Hooks"
Componente: "Introdução ao useState"
```

### Após Capturar
1. ✅ Revise a imagem antes de salvar
2. ✅ Otimize o tamanho do arquivo
3. ✅ Verifique a qualidade
4. ✅ Nomeie corretamente
5. ✅ Coloque em `docs/images/`

## 📤 Adicionando ao Git

Depois de capturar os screenshots:

```bash
# Adicione as imagens
git add docs/images/*.png

# Faça commit
git commit -m "docs: Add screenshots to documentation"

# Push para GitHub
git push origin master
```

## 🖼️ Atualizando o README

O README já está preparado para receber os screenshots. Após adicionar as imagens, o GitHub renderizará automaticamente na seção de Screenshots.

Se precisar adicionar novos screenshots:

```markdown
### Nova Seção
![Descrição](docs/images/nome-do-arquivo.png)
*Legenda explicativa da imagem*
```

## 🔄 Screenshots em Dark Mode (Opcional)

Se desejar incluir versão dark mode:

1. Capture as mesmas telas em modo escuro
2. Nomeie com sufixo `-dark.png`
3. Adicione ambas versões no README:

```markdown
### Light Mode
![Dashboard Light](docs/images/dashboard.png)

### Dark Mode
![Dashboard Dark](docs/images/dashboard-dark.png)
```

## ✅ Checklist de Screenshots

- [ ] Dashboard (`dashboard.png`)
- [ ] Containers (`containers.png`)
- [ ] Séries (`series.png`)
- [ ] Journey Builder (`journey-builder.png`)
- [ ] Componentes (`components.png`)
- [ ] AI Generator (`ai-generator.png`)
- [ ] Todas imagens otimizadas (< 500 KB)
- [ ] Todas imagens em `docs/images/`
- [ ] Commit e push realizados
- [ ] README atualizado

## 📞 Dúvidas?

Se tiver dúvidas sobre screenshots, consulte:
- [GitHub: Adding images to README](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#images)
- [MDN: Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)

---

**Última atualização:** 2025-01-03
