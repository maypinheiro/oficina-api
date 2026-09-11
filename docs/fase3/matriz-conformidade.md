# Matriz de conformidade - requisitos oficiais da Fase 3

Última auditoria: **11/09/2026**.

## Como ler esta matriz

- **Atendido**: existe implementação versionada e evidência verificável.
- **Parcial**: a implementação existe, mas falta automação, evidência executada ou parte do requisito.
- **Pendente**: depende de uma ação que ainda não foi concluída.
- **Não aplicável**: o documento oficial permite dispensa técnica, com justificativa.

Esta auditoria usa como fonte de verdade [`definicoesFase3.md`](../definicoesFase3.md) e [`explicacaoProfessorFase3.md`](../explicacaoProfessorFase3.md).

## 1. Autenticação e API Gateway

| Requisito oficial | Situação | Implementação | Evidência |
|---|---|---|---|
| API Gateway para controle e roteamento | Atendido | HTTP API, rotas públicas, `$default` protegido e integração privada em `oficina-auth-function/infra/api-gateway.tf` | [Execução E2E](https://github.com/maypinheiro/oficina-auth-function/actions/runs/34617351925) |
| Proteger rotas sensíveis | Atendido | Lambda Authorizer aplicado ao `$default`; matriz separa rotas públicas e privadas | [Matriz de rotas](matriz-rotas-permissoes.md) |
| Function Serverless de autenticação | Atendido | Duas Lambdas Node.js: autenticação e autorização | [`src/handlers`](https://github.com/maypinheiro/oficina-auth-function/tree/main/src/handlers) |
| Validar formato e dígitos do CPF | Atendido | Value Object rejeita comprimento, repetição e dígitos verificadores inválidos | [`cpf.ts`](https://github.com/maypinheiro/oficina-auth-function/blob/main/src/domain/cpf.ts) e testes |
| Consultar existência do cliente | Atendido | Repository PostgreSQL consulta por `cpfCnpj` normalizado | [`postgres-client-repository.ts`](https://github.com/maypinheiro/oficina-auth-function/blob/main/src/infrastructure/postgres-client-repository.ts) |
| Consultar status do cliente | Atendido | Token somente para status `ATIVO`; inexistente/inativo/bloqueado recebem resposta genérica | [RFC de autenticação](rfc-003-autenticacao.md) |
| Gerar JWT válido | Atendido | RS256, `iss`, `aud`, `sub`, `iat`, `exp`, TTL de 15 minutos e `keyId` | [ADR-001](adrs/adr-001-jwt-rs256.md) |
| Consumir API protegida com JWT | Atendido | Smoke E2E autentica e executa `GET /clientes` pelo Gateway/VPC Link/NLB | [Run 34617351925](https://github.com/maypinheiro/oficina-auth-function/actions/runs/34617351925) |

## 2. Quatro repositórios e CI/CD

| Requisito oficial | Situação | Implementação/evidência |
|---|---|---|
| Function em repositório separado | Atendido | [`oficina-auth-function`](https://github.com/maypinheiro/oficina-auth-function) |
| Infraestrutura Kubernetes/Terraform separada | Atendido | [`oficina-k8s-infra`](https://github.com/maypinheiro/oficina-k8s-infra) |
| Infraestrutura do banco/Terraform separada | Atendido | [`oficina-database-infra`](https://github.com/maypinheiro/oficina-database-infra) |
| Aplicação Kubernetes separada | Atendido | [`oficina-api`](https://github.com/maypinheiro/oficina-api) |
| CI funcional nos quatro | Atendido | Lint/testes/build/audit na aplicação/Function; fmt/validate/tfsec nas infraestruturas; checks `validate` obrigatórios |
| Main protegida e sem commit direto | Atendido | GitHub API confirmou PR obrigatório, branch atualizada, conversas resolvidas, force-push/delete bloqueados e enforcement para admins |
| Alterações por Pull Request | Atendido | Branch protection e histórico das PRs de implementação/documentação |
| Deploy automatizado de homologação | **Parcial** | Workflow aplica toda a entrega, mas o gatilho atual é `workflow_dispatch`; falta disparo automático após CI da branch `homolog` |
| Deploy automatizado de produção | **Parcial** | Workflow aceita `prod`, state/environment são isolados, mas falta disparo automático após CI da `main`; aprovação de environment pode ser mantida |
| Dockerfile quando aplicável | Atendido | A API possui Dockerfile multi-stage. Function é ZIP Lambda; repositórios Terraform não precisam de imagem, conforme orientação oficial |

### Lacuna crítica CI/CD

Os quatro arquivos `.github/workflows/cd.yml` estão funcionais e foram executados em homologação, porém somente de forma manual. Para aderência literal, adicionar `workflow_run` após CI bem-sucedido em `homolog` e `main`, derivando `hml`/`prod`, e manter `workflow_dispatch` como contingência. Produção deve continuar protegida pelo GitHub Environment.

## 3. Infraestrutura cloud obrigatória

| Requisito oficial | Situação | Implementação | Evidência |
|---|---|---|---|
| Provedor cloud | Atendido | AWS, conta acadêmica `982623100545`, região `us-east-1` | [RFC-001](rfc-001-aws.md) |
| Terraform | Atendido | Rede/EKS, RDS e Gateway/Lambdas mantidos em states independentes | CIs Terraform verdes |
| Cluster Kubernetes com escalabilidade | Atendido | EKS Managed Node Group, Metrics Server, HPA 2-6 e Cluster Autoscaler | [Provisionamento EKS](https://github.com/maypinheiro/oficina-k8s-infra/actions/runs/34616729840) |
| Banco gerenciado | Atendido | RDS PostgreSQL privado, criptografado, backups e secret | [RFC-002](rfc-002-postgresql-rds.md) |
| Function Serverless | Atendido | AWS Lambda em sub-redes privadas | [Arquitetura auth](https://github.com/maypinheiro/oficina-auth-function/blob/main/docs/arquitetura-e-decisoes.md) |
| API Gateway | Atendido | HTTP API com access logs, Authorizer e VPC Link | [Arquitetura integrada](entrega-tecnica.md) |
| Alta disponibilidade da aplicação | Atendido | Duas réplicas, duas AZs, PDB, rolling update e probes | [ADR-003](adrs/adr-003-amazon-eks.md) |
| Evidência visual da atuação do HPA | **Pendente** | HPA está implementado, mas ainda falta registrar carga e aumento real das réplicas para o vídeo | [ADR-004](adrs/adr-004-hpa.md) |

## 4. Monitoramento e observabilidade

| Requisito oficial | Situação | Implementação/evidência |
|---|---|---|
| Integração Datadog | Atendido | Agent/Cluster Agent no EKS, APM Node.js, Lambda Extension e provider Terraform |
| Latência das APIs | Atendido | Dashboard API com p95 de `trace.express.request.duration` e monitor de latência |
| CPU e memória Kubernetes | Atendido | Dashboard Kubernetes e monitores de CPU/memória |
| Healthchecks e uptime | Atendido | Probes `/health`, health check NLB, smoke tests e monitor de indisponibilidade |
| Alerta para falhas em OS | Atendido | Métrica `oficina.os.operation_errors` e monitor crítico acima de zero |
| Logs estruturados JSON | Atendido | Logger da API/Functions serializa JSON e remove campos sensíveis |
| Correlação entre requisições | Atendido | `x-correlation-id`, `correlationId`, `traceId`, requestId do Gateway e Datadog trace |
| Dashboard: volume diário de OS | Atendido | `oficina.os.volume_daily` no dashboard de negócio |
| Dashboard: tempo médio por status | Atendido | Diagnóstico, execução e finalização calculados do histórico da OS |
| Dashboard: erros/falhas de integração | Atendido | HTTP 5xx, erros de OS e `aws.lambda.errors` |
| Dashboards provisionados | Atendido | [API](https://app.datadoghq.com/dashboard/uhc-x7j-d3i), [Kubernetes](https://app.datadoghq.com/dashboard/cfp-bd3-ayn), [Negócio](https://app.datadoghq.com/dashboard/i9b-paf-7z5) |
| Evidência ao vivo de dashboards/logs/traces/alerta | **Pendente** | Infraestrutura está criada, mas as capturas/demonstração ao vivo precisam compor o vídeo final |

## 5. Documentação arquitetural

| Requisito oficial | Situação | Documento |
|---|---|---|
| Diagrama de componentes completo | Atendido | [Arquitetura-alvo](arquitetura-alvo.md) e [entrega técnica](entrega-tecnica.md) |
| Sequência de autenticação | Atendido | [Arquitetura-alvo](arquitetura-alvo.md) e documentação da Function |
| Sequência de abertura da OS | Atendido | [Arquitetura-alvo](arquitetura-alvo.md) e [entrega técnica](entrega-tecnica.md) |
| RFC da nuvem | Atendido | [RFC-001](rfc-001-aws.md) |
| RFC do banco | Atendido | [RFC-002](rfc-002-postgresql-rds.md) |
| RFC da autenticação | Atendido | [RFC-003](rfc-003-autenticacao.md) |
| RFC da observabilidade | Atendido | [RFC-004](rfc-004-observabilidade-datadog.md) |
| Limitações acadêmicas | Atendido | [RFC-005](rfc-005-aws-academy-learner-lab.md) |
| ADRs permanentes | Atendido | Oito ADRs: JWT, defesa em profundidade, EKS, HPA, logs, tracing, migrations e secrets |
| Justificativa formal do banco | Atendido | RFC-002 e [modelo de dados](modelo-dados.md) |
| Diagrama ER e relacionamentos | Atendido | [Modelo de dados](modelo-dados.md) |
| Consistência e performance | Atendido | FKs, unicidade, Decimal, status lógico e índices documentados/migrados |

## 6. READMEs e instruções

| Requisito oficial | Situação | Observação |
|---|---|---|
| Propósito em cada README | Atendido | Os quatro descrevem responsabilidade e limites |
| Tecnologias | Atendido | Seção própria nos quatro |
| Pré-requisitos | Atendido | Dependências locais/cloud e Learner Lab |
| Execução | Atendido | Aplicação/Function possuem comandos; infraestruturas documentam validação Terraform |
| Passos de deploy | Atendido | READMEs apontam para workflows/environments e guias específicos |
| Explicação da pipeline | Atendido | CI, CD, ordem, smoke tests e rollback |
| Diagrama específico | Atendido | Mermaid em cada README e documento detalhado |
| Swagger/Postman | Atendido | Swagger `hml` referenciado; infraestruturas marcam como link compartilhado/não aplicável a API própria |
| Links para deploy ativo | **Parcial** | URL está documentada, mas em 11/09/2026 retornou 503 após expiração/rotação da sessão Academy; precisa renovar controllers e revalidar antes da entrega |

## 7. Entrega final

| Requisito oficial | Situação | Evidência/ação |
|---|---|---|
| Vídeo YouTube/Vimeo até 15 minutos | **Pendente** | Gravar, publicar e informar URL |
| Demonstrar CPF, JWT e API protegida | Pronto para gravação | Fluxo E2E já validado; repetir visualmente |
| Demonstrar CI/CD e deploy | Pronto para gravação | Runs existentes; lacuna de gatilho automático deve ser corrigida |
| Demonstrar dashboards, logs, correlação e traces | Pronto para gravação | Dashboards provisionados; gerar tráfego antes da captura |
| PDF único com quatro repositórios | Atendido | PDF versionado no repositório da API |
| PDF com links das documentações | Atendido | Índice incluído, sujeito à atualização final |
| PDF com link do vídeo | **Pendente** | Atualizar depois da publicação |
| `soat-architecture` nos quatro repositórios | Atendido | GitHub API confirmou permissão `read` nos quatro em 11/09/2026 |
| Confirmação no PDF | **Pendente de atualização documental** | O PDF atual ainda trata a confirmação como pendência; regenerar com a evidência correta |

## Resumo executivo das lacunas

| Prioridade | Lacuna | Ação necessária |
|---|---|---|
| Crítica | CD apenas manual | Automatizar após CI de `homolog` e `main`, mantendo aprovação em `prod` |
| Crítica | Vídeo e URL | Gravar até 15 minutos, publicar e inserir URL no PDF |
| Alta | Evidência ao vivo | Registrar HPA, dashboards, logs correlacionados, trace e alerta durante o vídeo |
| Alta | Ambiente `hml` atualmente 503 | Renovar credenciais Academy dentro dos controllers e repetir E2E |
| Média | PDF desatualizado sobre colaborador | Regenerar informando que `soat-architecture` possui leitura nos quatro repos |

Não foi identificado requisito obrigatório para uma segunda Function de notificações. O texto inicial cita serverless para autenticação e notificações como objetivo do negócio, mas a lista obrigatória detalha somente a Function de autenticação. Notificações permanecem evolução possível e não devem ser apresentadas como implementadas.
