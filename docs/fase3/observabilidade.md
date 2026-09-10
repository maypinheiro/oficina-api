# Observabilidade

Datadog consolida métricas, logs e traces da API, EKS e Functions. CloudWatch recebe sinais do Gateway, Lambda e RDS e serve como contingência. Tags `service`, `env`, `version` e `correlationId` cruzam os sinais.

| Área | Sinais obrigatórios |
|---|---|
| API | taxa, 5xx, p95, healthcheck e pods disponíveis |
| Kubernetes | CPU, memória, restarts, pods pendentes e HPA |
| Autenticação | sucesso, negação, erro e latência |
| Banco | CPU, storage livre, conexões e erros |
| Negócio | OS por status, tempo por etapa e falhas de processamento |

Há dashboards versionados para API, Kubernetes e negócio. Alertas apontam ao runbook e nunca incluem CPF/payload. O Gateway gera `requestId`; a aplicação aceita ou gera `x-correlation-id` e emite JSON correlacionado.

No Learner Lab, a retenção do Gateway é 3 dias em `hml` e 14 em `prod`, limitando custo. A entrega está observável quando health responde, Datadog mostra serviço/pods, uma requisição é localizada pela correlação e monitores não ficam em `No Data` inesperado.
