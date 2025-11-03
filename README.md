# Matrix - Base44 Application

[![CI](https://github.com/orchestra-data/matrix/actions/workflows/ci.yml/badge.svg)](https://github.com/orchestra-data/matrix/actions/workflows/ci.yml)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Security](https://img.shields.io/badge/security-0%20vulnerabilities-brightgreen)
![Bundle Size](https://img.shields.io/badge/bundle-840%20kB-blue)

Esta aplicação foi criada automaticamente pelo Base44. É um aplicativo Vite+React que se comunica com a API Base44.

## 📊 Status do Projeto

| Aspecto | Status |
|---------|--------|
| **Build** | ✅ Passando |
| **Segurança** | ✅ 0 vulnerabilidades |
| **CI/CD** | ✅ Automático |
| **Code Quality** | ✅ ESLint configurado |
| **Node.js** | ✅ 18.x, 20.x |

## 🚀 Funcionalidades

- **Gestão de Containers** - Crie e gerencie containers educacionais
- **Gerenciamento de Séries** - Organize disciplinas e unidades
- **Componentes Interativos** - Biblioteca rica de componentes UI
- **Journey Builder** - Construtor visual de jornadas de aprendizado
- **Gerador AI** - Criação automática de estruturas com IA
- **Drag & Drop** - Interface intuitiva com arrastar e soltar
- **Dashboard Analytics** - Visualização de métricas e progresso

## 🛠️ Tecnologias

### Frontend
- **React 18.2** - Biblioteca UI moderna
- **Vite 6.1** - Build tool ultra-rápido
- **React Router 7.2** - Roteamento
- **TanStack Query 5.90** - Gerenciamento de estado server-side

### UI Components
- **Radix UI** - Componentes acessíveis e sem estilo
- **Tailwind CSS 3.4** - Framework CSS utility-first
- **Lucide React** - Ícones SVG
- **Framer Motion 12.4** - Animações

### Formulários & Validação
- **React Hook Form 7.54** - Gerenciamento de formulários
- **Zod 3.24** - Validação de schemas

### Outras Bibliotecas
- **@hello-pangea/dnd** - Drag and drop
- **react-quill** - Editor de texto rico
- **recharts** - Gráficos e visualizações
- **date-fns** - Manipulação de datas

## 📦 Instalação

### Pré-requisitos

- Node.js 18.x ou 20.x
- npm ou yarn

### Passos

```bash
# Clone o repositório
git clone https://github.com/orchestra-data/matrix.git

# Entre no diretório
cd matrix

# Instale as dependências
npm install

# Configure as variáveis de ambiente (se necessário)
cp .env.example .env
```

## 🚀 Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Acesse no navegador
# http://localhost:5173
```

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Cria build de produção |
| `npm run preview` | Visualiza build de produção |
| `npm run lint` | Executa ESLint |
| `npm test` | Executa testes (placeholder) |

## 🏗️ Build para Produção

```bash
# Criar build otimizado
npm run build

# Os arquivos estarão em: dist/
# - dist/index.html
# - dist/assets/*.js
# - dist/assets/*.css
```

### Estatísticas do Build

- **Bundle JS:** 840 kB (255 kB gzip)
- **Bundle CSS:** 103 kB (16.5 kB gzip)
- **Modules:** 3,021
- **Tempo de build:** ~13s

## 📁 Estrutura do Projeto

```
matrix/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
├── src/
│   ├── api/                    # Clients e integrações API
│   │   ├── base44Client.js
│   │   ├── entities.js
│   │   └── integrations.js
│   ├── components/
│   │   ├── containers/         # Componentes de containers
│   │   ├── series/             # Componentes de séries
│   │   └── ui/                 # Biblioteca UI (Shadcn)
│   ├── hooks/                  # React hooks customizados
│   ├── pages/                  # Páginas da aplicação
│   │   ├── Dashboard.jsx
│   │   ├── Containers.jsx
│   │   ├── Series.jsx
│   │   ├── Components.jsx
│   │   ├── JourneyBuilder.jsx
│   │   └── Layout.jsx
│   ├── lib/                    # Utilitários
│   ├── utils/                  # Funções auxiliares
│   ├── App.jsx                 # Componente raiz
│   ├── main.jsx               # Entry point
│   └── index.css              # Estilos globais
├── package.json
├── vite.config.js             # Configuração Vite
├── tailwind.config.js         # Configuração Tailwind
├── eslint.config.js           # Configuração ESLint
└── README.md
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_BASE44_API_URL=https://api.base44.com
VITE_API_KEY=your_api_key_here
```

### ESLint

O projeto usa ESLint 9 com configuração flat config:

```javascript
// eslint.config.js
export default [
  { ignores: ['dist', 'node_modules'] },
  // ... configurações
]
```

## 🧪 Testes

```bash
# Executar testes (quando implementados)
npm test

# Com coverage
npm run test:coverage
```

**Nota:** Testes unitários serão adicionados em versões futuras.

## 🔒 Segurança

- ✅ **0 vulnerabilidades conhecidas**
- ✅ Dependências atualizadas
- ✅ Quill 2.0.3 (XSS corrigido)
- ✅ Sem secrets no código

### Auditoria de Segurança

```bash
npm audit
```

## 🤝 CI/CD

### GitHub Actions

Pipeline automática que executa em cada push/PR:

1. ✅ **Lint** - Verifica qualidade do código
2. ✅ **Build** - Compila o projeto
3. ✅ **Multi-version** - Testa em Node 18.x e 20.x

**Tempo médio:** ~43 segundos

Ver: [.github/workflows/ci.yml](.github/workflows/ci.yml)

## 🐛 Problemas Conhecidos

- Prop-types validation warnings (não crítico)
- Bundle size pode ser otimizado com code-splitting
- Alguns useEffect dependencies podem ser melhorados

## 🗺️ Roadmap

- [ ] Adicionar testes unitários (Vitest)
- [ ] Implementar code-splitting
- [ ] Adicionar E2E tests (Playwright)
- [ ] Migrar para TypeScript
- [ ] Implementar PWA
- [ ] Adicionar i18n (internacionalização)

## 📄 Licença

Este projeto é proprietário da Base44.

## 📧 Suporte

Para mais informações e suporte, entre em contato:

- **Email:** app@base44.com
- **Website:** https://base44.com

---

**Desenvolvido com ❤️ pela equipe Orchestra Data**

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?logo=react)](https://reactjs.org/)
[![Powered by Vite](https://img.shields.io/badge/Powered%20by-Vite-646CFF?logo=vite)](https://vitejs.dev/)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
