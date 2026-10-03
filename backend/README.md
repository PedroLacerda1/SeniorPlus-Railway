# 🧓 SeniorPlus API

**API RESTful para gerenciamento de idosos, cuidadores, medicamentos, consultas e exames.**
*Segurança com JWT • MongoDB • Documentação com Swagger*

---

## 🚀 Tecnologias Utilizadas

| Tecnologia               | Descrição                           |
|--------------------------|-------------------------------------|
| 🌐 Spring Boot           | Framework principal                 |
| 🍃 Spring Data MongoDB   | Integração com MongoDB              |
| 🔐 Spring Security + JWT | Segurança e autenticação            |
| 📩 Spring Mail + Thymeleaf | Reset de senha por email         |
| ✅ Bean Validation        | Validação de dados                  |
| 🦾 Lombok                | Redução de boilerplate              |
| 📘 Swagger UI            | Documentação interativa             |

🔗 Veja todas as dependências no [`pom.xml`](pom.xml)

---

## 🔐 Autenticação & Segurança

- ✅ Autenticação via **JWT**
- 🔐 Endpoints protegidos com Spring Security
- 🔓 Rotas públicas:
  - `/api/v1/auth/**`
  - `/api/v1/reset-senha/**`
  - Swagger UI

## ⏰ Lembretes de Medicamentos

No Docker Compose, o agendador publica lembretes na fila durável `seniorplus.medication-reminders`. O consumidor envia pelo WhatsApp; falhas são tentadas até três vezes e, depois, encaminhadas para `seniorplus.medication-reminders.dlq`. A tabela `medication_reminder_deliveries` registra chaves já entregues para evitar reenvio em redelivery.

Para habilitar fora do Compose, configure `APP_REMINDERS_RABBITMQ_ENABLED=true` e as variáveis `SPRING_RABBITMQ_HOST`, `SPRING_RABBITMQ_PORT`, `SPRING_RABBITMQ_USERNAME` e `SPRING_RABBITMQ_PASSWORD`. Com a flag desativada, o backend mantém o envio direto como fallback.

---

## 📬 Principais Endpoints REST

### 🔑 Autenticação

POST /api/v1/auth/register     → Registro de usuário<br>
POST /api/v1/auth/login        → Login com retorno de JWT<br>

---

### 🔁 Reset de Senha

POST /api/v1/reset-senha/solicitar  → Solicita redefinição de senha<br>
POST /api/v1/reset-senha/resetar    → Redefine senha com token<br>

---

### 👵 Idoso

GET    /api/v1/idoso<br>
GET    /api/v1/idoso/{cpf}<br>
POST   /api/v1/idoso<br>
DELETE /api/v1/idoso/{cpf}<br>

---

### 🧑‍⚕️ Cuidador

GET    /api/v1/cuidador<br>
GET    /api/v1/cuidador/{cpf}<br>
POST   /api/v1/cuidador<br>
PUT    /api/v1/cuidador/{cpf}<br>
DELETE /api/v1/cuidador/{cpf}<br>

---

### 💊 Medicamento

GET    /api/v1/medicamentos<br>
GET    /api/v1/medicamentos/{cpf}<br>
POST   /api/v1/medicamentos<br>
PUT    /api/v1/medicamentos/{cpf}<br>
DELETE /api/v1/medicamentos/{cpf}<br>

---

### 📅 Consulta

GET    /api/v1/consulta<br>
GET    /api/v1/consulta/{cpf}<br>
POST   /api/v1/consulta<br>
PUT    /api/v1/consulta/{cpf}<br>
DELETE /api/v1/consulta/{cpf}<br>

---

### 🧪 Exame Médico

GET    /api/v1/exame<br>
GET    /api/v1/exame/{cpf}<br>
POST   /api/v1/exame<br>
PUT    /api/v1/exame/{cpf}<br>
DELETE /api/v1/exame/{cpf}<br>

---

### 📍 Endereço

GET    /endereco<br>
GET    /endereco/{cpf}<br>
POST   /endereco<br>
DELETE /endereco/{cpf}<br>
