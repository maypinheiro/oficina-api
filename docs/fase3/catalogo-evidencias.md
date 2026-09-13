# Catálogo de evidências da Fase 3

Este documento indica onde uma pessoa ou avaliador automatizado encontra a prova de cada capacidade sem precisar inferir a arquitetura a partir do código.

## Evidências executadas

| Evidência | Resultado comprovado | Link |
|---|---|---|
| Provisionamento EKS `hml` | Terraform aplicado, cluster pronto, nodes acessíveis, controllers instalados e outputs publicados | [Run 34616729840](https://github.com/maypinheiro/oficina-k8s-infra/actions/runs/34616729840) |
| Deploy da API `hml` | Imagem ECR, migration, rollout, seed, health interno e NLB | [Run 34616114022](https://github.com/maypinheiro/oficina-api/actions/runs/34616114022) |
| Autenticação E2E | CPF ativo, JWT, Authorizer, Gateway, VPC Link, NLB, health e rota `/clientes` | [Run 34617351925](https://github.com/maypinheiro/oficina-auth-function/actions/runs/34617351925) |
| CI final da API | Migration em PostgreSQL de teste, lint, typecheck, cobertura, integração, build, audit e Docker | [Run 34652430361](https://github.com/maypinheiro/oficina-api/actions/runs/34652430361) |
| CI final da Function | Código, testes, pacote ZIP, audit e Terraform | [Run 34652432268](https://github.com/maypinheiro/oficina-auth-function/actions/runs/34652432268) |
| CI final do EKS | Terraform fmt/init/validate e análise de segurança | [Run 34652437249](https://github.com/maypinheiro/oficina-k8s-infra/actions/runs/34652437249) |
| CI final do banco | Terraform fmt/init/validate e análise de segurança | [Run 34652441536](https://github.com/maypinheiro/oficina-database-infra/actions/runs/34652441536) |
| CD automático por `workflow_run` | CI verde em `homolog` iniciou o provisionamento de `hml` sem despacho manual | [Run 34776527610](https://github.com/maypinheiro/oficina-k8s-infra/actions/runs/34776527610) |
| Correção da ingestão Datadog | DogStatsD exposto em UDP 8125 no host; dois Agents prontos e métricas da API recebidas | [PR 60](https://github.com/maypinheiro/oficina-k8s-infra/pull/60) e [PR 61](https://github.com/maypinheiro/oficina-k8s-infra/pull/61) |

## Evidências do GitHub

Em 13/09/2026, a API do GitHub confirmou nos quatro repositórios:

- `main` protegida;
- check obrigatório `validate` e branch estritamente atualizada;
- alterações por Pull Request;
- conversas obrigatoriamente resolvidas;
- force-push e exclusão da branch bloqueados;
- regras aplicadas aos administradores;
- usuário `soat-architecture` com permissão `read`.

Repositórios: [API](https://github.com/maypinheiro/oficina-api), [Function](https://github.com/maypinheiro/oficina-auth-function), [EKS](https://github.com/maypinheiro/oficina-k8s-infra) e [RDS](https://github.com/maypinheiro/oficina-database-infra).

## Dashboards

- [Operação da API](https://app.datadoghq.com/dashboard/uhc-x7j-d3i): latência p95, throughput, 5xx e réplicas disponíveis.
- [Kubernetes](https://app.datadoghq.com/dashboard/cfp-bd3-ayn): CPU, memória, réplicas, restarts e HPA.
- [Ordens de serviço](https://app.datadoghq.com/dashboard/i9b-paf-7z5): volume diário, tempos de diagnóstico/execução/finalização e falhas.

Os dashboards exigem sessão na organização Datadog do grupo. As definições reproduzíveis estão em `oficina-k8s-infra/infra/dashboards/`.

## Rastreabilidade no código

| Capacidade | Arquivo principal |
|---|---|
| CPF | `oficina-auth-function/src/domain/cpf.ts` |
| Consulta de cliente/status | `oficina-auth-function/src/infrastructure/postgres-client-repository.ts` |
| JWT RS256 | `oficina-auth-function/src/infrastructure/jwt.ts` |
| Lambda de autenticação | `oficina-auth-function/src/handlers/authenticate.ts` |
| Lambda Authorizer | `oficina-auth-function/src/handlers/authorize.ts` |
| API Gateway/VPC Link | `oficina-auth-function/infra/api-gateway.tf` |
| Modelo relacional | `oficina-api/prisma/schema.prisma` |
| Migration da Fase 3 | `oficina-api/prisma/migrations/20260908010000_add_cliente_status_and_indexes/migration.sql` |
| Fluxo da OS | `oficina-api/src/contexts/atendimento/application/fluxo-ordem-servico.ts` |
| Logs/correlação | `oficina-api/src/presentation/http/middlewares/observability.ts` |
| Métricas Datadog | `oficina-api/src/shared/observability/telemetry.ts` |
| EKS/rede | `oficina-k8s-infra/infra/cluster.tf` e `network.tf` |
| HPA/PDB | `oficina-k8s-infra/k8s/hpa.yaml` e `api-pdb.yaml` |
| Dashboards/monitores | `oficina-k8s-infra/infra/dashboards.tf` e `observability.tf` |
| RDS/Secrets Manager | `oficina-database-infra/main.tf` |
| Alarmes RDS | `oficina-database-infra/monitoring.tf` |

## Validações finais de 13/09/2026

- `/health` e `/docs/` responderam HTTP 200 pelo API Gateway.
- Login administrativo, JWT e rota protegida `/servicos` responderam corretamente.
- Os dashboards de API, Kubernetes e negócio foram populados.
- O DaemonSet Datadog foi observado com `2/2` Agents prontos.
- O status dos Agents registrou milhares de amostras DogStatsD e nenhum erro de parsing.
- Foram publicadas métricas de volume e tempos médios de diagnóstico, execução e finalização.

## Evidência audiovisual

O vídeo foi gravado e validado pela equipe: [Demonstração da Fase 3](https://drive.google.com/file/d/1VsoOGimcLsAt68aPV-AQLgvy2HKe_6Qb/view?usp=sharing).
