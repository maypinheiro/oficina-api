# Matriz de rotas e permissões

Reflete o API Gateway, `server.ts` e as rotas Express atuais. Público significa sem JWT, mas ainda sujeito a throttling e validação de entrada.

| Método e rota | Acesso | Finalidade |
|---|---|---|
| `POST /auth/clientes` | Público, Gateway → Lambda | JWT RS256 por CPF |
| `POST /auth/login` | Público, legado administrativo | JWT HS256 de funcionário |
| `GET /health` | Público | Healthcheck |
| `GET /docs`, `/docs/*` | Público | Swagger |
| `GET /public/ordens-servico/:numeroOs/status` | Público | Status da OS |
| `POST /public/orcamentos/notificacoes/aprovacao` | Público, integração | Decisão externa; assinatura é pendência |
| `/clientes...` | JWT | CRUD de clientes |
| `/veiculos...` | JWT | CRUD de veículos |
| `/servicos...`, `/pecas...` | JWT | Catálogo e peças |
| `/estoque...` | JWT | Consultas, ajustes, reservas e consumos |
| `POST, GET /ordens-servico...` | JWT | Abertura, listagem, consulta e histórico |
| `PATCH /ordens-servico/:numeroOs/iniciar-diagnostico` | JWT | Iniciar diagnóstico |
| `PATCH /ordens-servico/:numeroOs/registrar-problema` | JWT | Registrar problema |
| `PATCH /ordens-servico/:numeroOs/iniciar-execucao` | JWT | Iniciar execução |
| `PATCH /ordens-servico/:numeroOs/finalizar`, `/entregar` | JWT | Finalizar ou entregar |
| `POST /orcamentos` | JWT | Criar orçamento |
| `POST /orcamentos/notificacoes/aprovacao` | JWT | Decisão interna |
| `PATCH /orcamentos/:numeroOs/aprovar`, `/rejeitar` | JWT | Decidir orçamento |
| `GET /metricas/tempo-medio`, `/tempo-medio-servicos` | JWT | Métricas de negócio |

No Gateway, autenticação de cliente, health, docs e `/public/*` são exceções; `$default` exige Lambda Authorizer. Na API, famílias privadas usam middleware. RBAC administrativo granular ainda não foi implementado.
