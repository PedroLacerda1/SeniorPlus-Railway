SeniorPlus

O SeniorPlus é um sistema completo voltado para gestão de cuidados, interação entre cuidadores e idosos, programação de lembretes, dashboards, comunicação, segurança e automação.
O projeto é composto por Frontend (React), Backend (Spring Boot) e uma pasta dedicada a testes de performance e segurança, além de toda infraestrutura DevOps com Docker, Railway e Nixpacks.

📌 Sumário

Visão Geral

Arquitetura do Projeto

Tecnologias — Frontend

Tecnologias — Backend

Tecnologias — Testes e Segurança

Infraestrutura, Deploy e DevOps

Estrutura do Repositório

🚀 Visão Geral

O SeniorPlus combina uma arquitetura moderna e escalável usando:

React 19 no frontend

Spring Boot + Spring Security + JWT no backend

Docker (multistage com Node + Nginx)

Testes automatizados (Jest, JUnit, scripts JS, scans de segurança)

Deploy via Railway/Nixpacks

Múltiplos contextos React, APIs integradas e suporte a PWA

🏗 Arquitetura do Projeto
frontend/      → SPA em React (telas: auth, cuidador, idoso, landing)
backend/       → API REST com Spring Boot
tests/         → Testes de segurança, performance e validações
docker/        → Arquivos Docker + nginx.conf
infra/         → railway.json, nixpacks.toml, scripts de build
🎨 Tecnologias — Frontend
📚 Linguagens e Frameworks

React 19

Evidência: package.json

Uso: ReactDOM.createRoot

React Router v7

Evidência: react-router-dom no package.json

Uso: BrowserRouter

Create React App / react-scripts

Scripts no package.json

Estrutura do CRA: public/index.html

Node.js 20 (Docker)

Evidência: Dockerfile

🧰 Ferramentas e Configurações

npm

package-lock.json, scripts e uso no Docker

ESLint

Config: .eslintrc.json

Jest + Testing Library

Dependências: package.json

Teste exemplo: App.test.js

PWA

Arquivo: manifest.json

Variáveis de ambiente / API

REACT_APP_API_URL

Arquivos: .env, .env.production

Endpoint centralizado: api.js

🎨 Estilos

CSS modular por componente (styles/*.css)

Ex.: LoadingSpinner.css

CSS global: main.css

🧩 Bibliotecas de UI / Utilidades

uuid

react-icons, lucide-react

emoji-picker-react

react-calendar

date-fns

web-vitals

🔌 Contextos e Hooks

Presentes em: AuthContext.jsx, ToastContext.jsx, ThemeContext.jsx, ChatContext.jsx

Incluem:

Autenticação

Dark mode

Notificações Toast

Chat integrado

🗂 Estrutura modular do frontend

tela-auth/

tela-cuidador/

tela-idoso/

tela-landing/

Componentes reutilizáveis (components/)

Exemplo: Dashboard.jsx

🔧 Tecnologias — Backend
🖥 Principal stack

Java + Spring Boot

Evidência: pom.xml, SeniorplusApplication.java

Spring MVC

Controllers em controller/

Spring Security + JWT

Evidência: security/, JwtProperties.java

🗄 Persistência e Banco de Dados

Flyway (migrações SQL)

src/main/resources/db/migration/*.sql

Spring Data JPA

Repositórios e modelos em /model e /repository

Configuração por properties/env

application.properties

.env

📬 Integrações externas

WhatsApp

WhatsAppController.java

ZapWhatsAppProperties.java

Envio de e-mail (Java Mail)

TestMailConfig.java

🧪 Testes Backend

JUnit + Spring Test

src/test/java/.../SeniorplusApplicationTests.java

🛡 Tecnologias — Testes e Segurança

Local: /tests

📌 JavaScript para testes de performance/segurança

Arquivos:

perf/login-smoke.js

security/filter-audit.js

security/jwt-validate.js

Uso provável:

k6

Node scripts personalizados

🔒 Auditorias

dependency-scan.sh

Shell script para análise de vulnerabilidades

🧱 Infraestrutura, Deploy e DevOps
🐳 Docker

Dockerfile do frontend (Node → build → Nginx)

Dockerfile do backend

.dockerignore

🚀 Deploy

Railway

Arquivo: railway.json

Nixpacks

Config: nixpacks.toml

📜 Scripts

build.sh

start.sh

run_with_env.ps1

backend_env.err

backend.err

📁 Estrutura do Repositório (resumo)
/frontend
  package.json
  src/
  public/
  .env / .env.production
  Dockerfile
  nginx.conf

/backend
  pom.xml
  src/main/java
  src/main/resources/application.properties
  Dockerfile
  scripts (build, start)

/tests
  perf/
  security/
  dependency-scan.sh

railway.json
nixpacks.toml
.dockerignore
.gitignore
📄 Licença

Disponível no arquivo LICENSE (se aplicável).

🤝 Contribuições

Pull requests são bem-vindos!

📬 Contato

Caso queira suporte, sugestões ou melhorias na documentação, fique à vontade para abrir uma issue ou PR.
