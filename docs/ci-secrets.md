# GitHub Actions Secrets para o pipeline CI/CD

Configure os seguintes segredos no repositório (`Settings` ▶ `Secrets and variables` ▶ `Actions`):

| Segredo | Descrição | Exemplo |
| --- | --- | --- |
| `RAILWAY_TOKEN` | Token gerado pelo `railway login --browserless` para permitir que o CLI publique deploys. | `rw_XXXXXXXXXXXXXXXXXXXX` |
| `RAILWAY_PROJECT_ID` | ID do projeto Railway (obtido com `railway status`). | `12345678-90ab-cdef-1234-567890abcdef` |
| `RAILWAY_BACKEND_SERVICE` | Nome ou ID do serviço backend dentro do projeto. | `seniorplus-backend` |
| `RAILWAY_FRONTEND_SERVICE` | Nome ou ID do serviço frontend dentro do projeto. | `seniorplus-frontend` |
| `BACKEND_HEALTH_URL` | Endpoint usado no smoke final para monitoramento. | `https://seniorplus-backend.up.railway.app/health` |
| `FRONTEND_BASE_URL` | URL pública do frontend para validação pós-deploy. | `https://seniorplus-frontend.up.railway.app` |
| `BACKEND_BASE_URL` (opcional) | Base usada pelo teste de performance k6. Caso não seja informado, o script usa a URL padrão embutida. | `https://seniorplus-backend.up.railway.app` |

> Dica: se preferir, mantenha os serviços (backend/frontend) referenciados por ID para evitar problemas quando o nome do serviço muda.
