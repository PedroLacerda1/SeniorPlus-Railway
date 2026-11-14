# Senior+

O **Senior+** é um sistema completo voltado para gestão de cuidados, interação entre cuidadores e idosos, programação de lembretes, dashboards, comunicação, segurança e automação.

O projeto é composto por:
- **Frontend (React 19)**
- **Backend (Spring Boot + Security + JWT)**
- **Pasta dedicada a testes de performance e segurança**
- **Infraestrutura completa com Docker, Railway e Nixpacks**

---

## 📌 Sumário
- [Visão Geral](#-visão-geral)
- [Arquitetura do Projeto](#-arquitetura-do-projeto)
- [Tecnologias — Frontend](#-tecnologias--frontend)
- [Tecnologias — Backend](#-tecnologias--backend)
- [Tecnologias — Testes e Segurança](#-tecnologias--testes-e-segurança)
- [Infraestrutura, Deploy e DevOps](#-infraestrutura-deploy-e-devops)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Licença](#-licença)
- [Contribuições](#-contribuições)
- [Contato](#-contato)

---

## 🚀 Visão Geral

O SeniorPlus combina uma arquitetura escalável e moderna utilizando:

- **React 19** no frontend  
- **Spring Boot 3 + Spring Security + JWT** no backend  
- **Docker multistage** (Node → Build → Nginx)  
- **Testes automatizados** (Jest, JUnit, scripts JS)  
- **Scans de segurança e scripts especializados**  
- **Deploy via Railway / Nixpacks**  
- **Contextos React, API centralizada e suporte PWA**

---

## 🏗 Arquitetura do Projeto

```
frontend/   → SPA em React (auth, cuidador, idoso, landing)
backend/    → API REST com Spring Boot + Security
tests/      → Testes de performance, segurança e validações
docker/     → Arquivos Docker + nginx.conf
infra/      → railway.json, nixpacks.toml, scripts de build e execução
```

---

## 🎨 Tecnologias — Frontend

### 📚 Linguagens e Frameworks
- **React 19**  
  - Evidência: `package.json`, `ReactDOM.createRoot`
- **React Router v7**
  - BrowserRouter em `src/main.jsx`
- **Create React App / react-scripts**
- **Node.js 20** (via Dockerfile)

### 🧰 Ferramentas e Configurações
- **npm** (scripts, lockfile)
- **ESLint** (`.eslintrc.json`)
- **Jest + Testing Library**
- **PWA**
  - `manifest.json`
- **Variáveis de ambiente**
  - `REACT_APP_API_URL`
  - Arquivos: `.env`, `.env.production`

### 🎨 Estilos
- CSS modular por componente (`styles/*.css`)
- CSS global (`main.css`)

### 🧩 Bibliotecas
- uuid  
- react-icons / lucide-react  
- emoji-picker-react  
- react-calendar  
- date-fns  
- web-vitals  

### 🔌 Contextos e Hooks
Presentes em `/contexts`:
- `AuthContext.jsx`
- `ToastContext.jsx`
- `ThemeContext.jsx`
- `ChatContext.jsx`

Funções principais:
- Autenticação + JWT
- Dark mode
- Toasts
- Chat

### 🗂 Estrutura do frontend
```
/tela-auth
/tela-cuidador
/tela-idoso
/tela-landing
/components
```

---

## 🔧 Tecnologias — Backend

### 🖥 Stack Principal
- **Java + Spring Boot**
- **Spring MVC** (controllers)
- **Spring Security + JWT**
  - `security/`, `JwtProperties.java`

### 🗄 Persistência e Banco
- **Flyway** (migrações SQL)
  - `/resources/db/migration/*.sql`
- **Spring Data JPA**
- Configuração via:
  - `application.properties`
  - `.env`

### 📬 Integrações Externas
- **WhatsApp**
  - `WhatsAppController.java`
- **Envio de e-mail** (Java Mail)

### 🧪 Testes Backend
- JUnit + Spring Test  
  - `SeniorplusApplicationTests.java`

---

## 🛡 Tecnologias — Testes e Segurança

Local: `/tests`

### 📌 Scripts JS (security/perf)
- `perf/login-smoke.js`
- `security/filter-audit.js`
- `security/jwt-validate.js`

### 🔒 Auditorias
- `dependency-scan.sh`  
  Script para análise de vulnerabilidades.

---

## 🧱 Infraestrutura, Deploy e DevOps

### 🐳 Docker
- Dockerfile do frontend (multistage)
- Dockerfile do backend
- `.dockerignore`

### 🚀 Deploy
- **Railway** (`railway.json`)
- **Nixpacks** (`nixpacks.toml`)

### 🛡️ Área administrativa
- Acesse `/admin` com uma conta `ROLE_ADMIN`. A API também protege `/api/v1/admin/**`; esconder a rota na interface não é a barreira de segurança.
- O bootstrap opcional cria o primeiro administrador quando `ADMIN_BOOTSTRAP_PASSWORD` estiver configurada e ainda não existir nenhuma conta administrativa. O e-mail padrão é `adm@seniorplus.com`; pode ser sobrescrito por `ADMIN_BOOTSTRAP_EMAIL`.
- Configure `ADMIN_BOOTSTRAP_PASSWORD` como variável secreta no serviço backend do Railway ou no `.env` local (não a grave no Git). O valor precisa ter pelo menos 12 caracteres. Opcionalmente, defina `ADMIN_BOOTSTRAP_NAME`.
- Depois do primeiro boot, remova a variável `ADMIN_BOOTSTRAP_PASSWORD` do ambiente. O bootstrap não altera contas existentes nem cria outro administrador se já houver um.
- Usuários comuns podem ser desativados pelo painel para preservar dados de saúde e vínculos; contas desativadas não conseguem autenticar.

### 📜 Scripts do projeto
- `build.sh`
- `start.sh`
- `run_with_env.ps1`
- Logs e configs de ambiente

---

## 📁 Estrutura do Repositório (resumo)

```
/frontend
  package.json
  src/
  public/
  .env / .env.production
  Dockerfile
  nginx.conf

/backend
  pom.xml
  src/main/java/
  src/main/resources/application.properties
  Dockerfile

/tests
  perf/
  security/
  dependency-scan.sh

railway.json
nixpacks.toml
.dockerignore
.gitignore
```
## 📬 Contato
Caso queira suporte, sugestões ou melhorias na documentação, abra uma **issue** ou envie um **PR**.
