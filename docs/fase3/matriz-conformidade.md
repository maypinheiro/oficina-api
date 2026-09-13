# Matriz de conformidade — requisitos oficiais da Fase 3

Última auditoria: **13/09/2026**.

Fontes: [definições oficiais](../definicoesFase3.md) e [esclarecimentos do professor](../explicacaoProfessorFase3.md). A situação considera código versionado, infraestrutura implantada, pipelines executados e validações realizadas em `hml`.

## Critérios

- **Atendido**: implementação e evidência verificável disponíveis.
- **Atendido com limitação acadêmica**: requisito implementado, mas disponibilidade contínua é condicionada ao AWS Academy Learner Lab.
- **Pendente de submissão**: ação manual posterior à implementação, como regenerar o PDF final.
- **Não aplicável**: dispensa técnica permitida pelo enunciado e justificada.

## 1. Autenticação e API Gateway

| Requisito | Situação | Implementação e evidência |
|---|---|---|
| API Gateway para controle e roteamento | Atendido | Amazon API Gateway HTTP API, access logs, rotas públicas e `$default` protegido; integração privada por VPC Link e NLB. |
| Proteger rotas sensíveis por CPF | Atendido | Cliente autentica por CPF na Lambda e recebe JWT de escopo `cliente`; Lambda Authorizer valida o token antes da API. |
| Validar formato e dígitos do CPF | Atendido | Value Object valida tamanho, repetições e dígitos verificadores; testes automatizados no repositório da Function. |
| Consultar existência do cliente | Atendido | Repository PostgreSQL consulta `cpfCnpj` normalizado no RDS privado. |
| Consultar status do cliente | Atendido | Token emitido apenas para cliente `ATIVO`; inexistente, inativo e bloqueado recebem resposta genérica. |
| Gerar JWT válido | Atendido | Cliente: RS256 com `iss`, `aud`, `sub`, `scope`, `iat` e `exp`; administração: fluxo separado compatível com JWT HS256 e papel `admin`. |
| Consumir API protegida | Atendido | Fluxos sem token, com token cliente e com token administrativo validados pelo Gateway e Authorizer. Swagger ativo em `hml`. |
| Function Serverless | Atendido | Lambdas Node.js independentes para autenticação e autorização, implantadas via Terraform. |

Documentos: [RFC de autenticação](rfc-003-autenticacao.md), [ADR de JWT](adrs/adr-001-jwt-rs256.md) e [matriz de permissões](matriz-rotas-permissoes.md).

## 2. Repositórios, governança e CI/CD

| Requisito | Situação | Implementação e evidência |
|---|---|---|
| Quatro repositórios separados | Atendido | [API](https://github.com/maypinheiro/oficina-api), [Function](https://github.com/maypinheiro/oficina-auth-function), [Kubernetes](https://github.com/maypinheiro/oficina-k8s-infra) e [Banco](https://github.com/maypinheiro/oficina-database-infra). |
| CI funcional nos quatro | Atendido | Aplicação/Function: lint, tipos, testes, build, audit e análise; infra: `fmt`, `init`, `validate`, tfsec e SonarCloud. |
| CD para nuvem nos quatro | Atendido | Deploy/provisionamento parametrizado por ambiente, com artefatos imutáveis e smoke tests aplicáveis. |
| Deploy automático de homologação | Atendido | CI verde em `homolog` dispara `workflow_run`, deriva `hml` e usa exatamente o SHA validado. |
| Deploy automático de produção | Atendido | CI verde em `main` deriva `prod`; GitHub Environment mantém aprovação obrigatória. |
| Execução manual de contingência | Atendido | `workflow_dispatch` preservado sem substituir o gatilho automático. |
| Branch principal protegida | Atendido | PR, check `validate`, branch atualizada, conversas resolvidas, force-push/delete bloqueados e enforcement administrativo. |
| Alterações somente por PR | Atendido | Estratégia `feature → develop → homolog → main`, comprovada pelo histórico de PRs. |
| Dockerfile quando aplicável | Atendido | API possui Dockerfile; Lambda usa pacote ZIP; repositórios exclusivamente Terraform não criam imagens sem finalidade. |

## 3. Infraestrutura cloud

| Requisito | Situação | Implementação e evidência |
|---|---|---|
| Provedor cloud | Atendido com limitação acadêmica | AWS, conta Learner Lab `982623100545`, região `us-east-1`; decisões e limitações nas RFCs 001 e 005. |
| Terraform | Atendido | States remotos separados para rede/EKS, RDS e Functions/Gateway, com S3 e lock DynamoDB. |
| Kubernetes com escalabilidade | Atendido | Amazon EKS, Managed Node Group, Metrics Server, HPA de 2 a 6 réplicas e Cluster Autoscaler. |
| Alta disponibilidade da aplicação | Atendido | Duas réplicas em múltiplos nós/AZs, rolling update, probes e Pod Disruption Budget. |
| Banco gerenciado | Atendido | RDS PostgreSQL privado, criptografado, com backup, secret e regras de acesso por Security Group. |
| Function Serverless | Atendido | AWS Lambda conectada às sub-redes privadas para consultar o RDS. |
| API Gateway | Atendido | HTTP API, Authorizer, VPC Link, NLB interno e logs de acesso. |
| Segredos | Atendido | AWS Secrets Manager e External Secrets; nenhum segredo é versionado. |

## 4. Monitoramento e observabilidade

| Requisito | Situação | Implementação e evidência |
|---|---|---|
| Integração Datadog | Atendido | Agent como DaemonSet, Cluster Agent, DogStatsD com UDP 8125 no host, APM Node.js, logs e provider Terraform. |
| Latência das APIs | Atendido | `oficina.http.request.duration_ms`, p95 por rota e monitor acima de 2.000 ms. |
| CPU e memória do Kubernetes | Atendido | Dashboard Kubernetes com métricas por pod e monitores de CPU/memória. |
| Healthchecks e uptime | Atendido | `/health`, probes do Kubernetes, health check do NLB, smoke tests e monitor de réplicas. |
| Alertas de falhas em OS | Atendido | `oficina.os.operation_errors` e monitor crítico; falhas HTTP, Lambda, RDS e restarts também monitorados. |
| Logs estruturados JSON | Atendido | Logs com serviço, ambiente, rota, método, status, duração e filtragem de dados sensíveis. |
| Correlação | Atendido | `x-correlation-id`, `correlationId`, `traceId` e request ID do Gateway. |
| Volume diário de OS | Atendido | Gauge `oficina.os.volume_daily` no dashboard de negócio. |
| Tempo médio por etapa | Atendido | Gauges de diagnóstico, execução e finalização calculados pelo histórico das ordens. |
| Erros e integrações | Atendido | Painéis para HTTP 5xx, erros de operação de OS e erros da Lambda. |
| Dashboards populados | Atendido | [API](https://app.datadoghq.com/dashboard/uhc-x7j-d3i), [Kubernetes](https://app.datadoghq.com/dashboard/cfp-bd3-ayn) e [Negócio](https://app.datadoghq.com/dashboard/i9b-paf-7z5). Em 13/09, Agents `2/2` e milhares de amostras DogStatsD foram verificados. |

## 5. Documentação arquitetural e dados

| Requisito | Situação | Documento/evidência |
|---|---|---|
| Diagrama de componentes cloud | Atendido | [Arquitetura-alvo](arquitetura-alvo.md) e [entrega técnica](entrega-tecnica.md). |
| Sequência de autenticação | Atendido | Diagramas na arquitetura-alvo e documentação da Function. |
| Sequência de abertura da OS | Atendido | Diagramas na arquitetura-alvo e entrega técnica. |
| RFCs relevantes | Atendido | AWS, PostgreSQL/RDS, autenticação, Datadog e Learner Lab. |
| ADRs permanentes | Atendido | JWT, defesa em profundidade, EKS, HPA, logs, tracing, migrations e segredos. |
| Justificativa do banco | Atendido | PostgreSQL/RDS justificado em [RFC-002](rfc-002-postgresql-rds.md). |
| Modelo relacional e ER | Atendido | [Modelo de dados](modelo-dados.md), schema Prisma e migrations. |
| Consistência e desempenho | Atendido | FKs, unicidade, tipos decimais, histórico de status e índices documentados e migrados. |

## 6. Conteúdo obrigatório dos READMEs

| Requisito | Situação | Evidência |
|---|---|---|
| Propósito e limites | Atendido | Seção “O que este repositório entrega” nos quatro READMEs. |
| Tecnologias e pré-requisitos | Atendido | Seções específicas nos quatro repositórios. |
| Execução e deploy | Atendido | Comandos locais, workflows, environments e ordem operacional documentados. |
| Explicação da pipeline | Atendido | CI, CD, promoções, smoke tests e rollback descritos. |
| Diagrama específico | Atendido | Mermaid em cada README e documentos detalhados. |
| Swagger/Postman | Atendido | Swagger compartilhado referenciado; marcado como não aplicável onde não existe API HTTP própria. |
| Links de deploy | Atendido com limitação acadêmica | `/health` e `/docs/` responderam 200 em 13/09/2026; disponibilidade depende da sessão temporária Academy. |

## 7. Vídeo e submissão

| Requisito | Situação | Evidência/ação |
|---|---|---|
| Vídeo de até 15 minutos | Atendido | [Vídeo da demonstração](https://drive.google.com/file/d/1VsoOGimcLsAt68aPV-AQLgvy2HKe_6Qb/view?usp=sharing), informado como validado pela equipe. |
| Demonstrar CPF, JWT e API protegida | Atendido | Fluxo técnico validado e demonstração registrada no vídeo. |
| Demonstrar CI/CD e deploy | Atendido | Pipelines executados e demonstração registrada no vídeo. |
| Demonstrar dashboards ao vivo | Atendido | Dashboards populados e demonstração registrada no vídeo. |
| Demonstrar logs, correlação e traces | Atendido | Instrumentação validada e demonstração registrada no vídeo. |
| PDF único com links | Pendente de submissão | PDF existe, mas precisa receber a URL do vídeo e ser regenerado. |
| `soat-architecture` nos quatro repositórios | Atendido | Permissão `read` confirmada pela API do GitHub em 13/09/2026. |

## Conclusão da auditoria

Não foi identificada lacuna técnica obrigatória. Permanecem estas ações de submissão:

1. regenerar o PDF único com a documentação e o link do vídeo atualizados;
2. conferir todos os links do PDF antes da submissão.

Notificações serverless aparecem como objetivo geral, mas a lista obrigatória detalha apenas a Function de autenticação. Uma Function de notificações é evolução possível e não é apresentada como implementada.
