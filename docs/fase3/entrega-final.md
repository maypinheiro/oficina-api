# Entrega final — Tech Challenge Fase 3

Este documento é o ponto de entrada da submissão. Ele reúne os links dos quatro repositórios, do ambiente demonstrável, da documentação arquitetural, das evidências e do vídeo.

## Resultado executivo

A solução foi implantada e validada em homologação na AWS. Os requisitos técnicos obrigatórios da Fase 3 estão atendidos: API Gateway, autenticação serverless por CPF, JWT, rotas protegidas, aplicação no EKS com escalabilidade, PostgreSQL gerenciado, Terraform, quatro repositórios com CI/CD, observabilidade Datadog e documentação arquitetural.

O vídeo foi gravado, disponibilizado e validado. Resta somente regenerar o PDF para incorporar a versão atual desta documentação.

## Repositórios da entrega

| Componente | Repositório | Responsabilidade |
|---|---|---|
| Aplicação | [oficina-api](https://github.com/maypinheiro/oficina-api) | API Express, domínio, Prisma, Swagger, métricas e imagem Docker |
| Autenticação | [oficina-auth-function](https://github.com/maypinheiro/oficina-auth-function) | Lambda de autenticação, Lambda Authorizer, JWT e API Gateway |
| Kubernetes | [oficina-k8s-infra](https://github.com/maypinheiro/oficina-k8s-infra) | VPC, EKS, ECR, HPA, manifests, Datadog e dashboards |
| Banco | [oficina-database-infra](https://github.com/maypinheiro/oficina-database-infra) | RDS PostgreSQL, rede privada, segredos, backups e alarmes |

O usuário `soat-architecture` possui permissão `read` nos quatro repositórios, verificada pela API do GitHub em 13/09/2026.

## Vídeo de demonstração

- Situação: **gravado, disponibilizado e validado**.
- Vídeo: [Demonstração da Fase 3](https://drive.google.com/file/d/1VsoOGimcLsAt68aPV-AQLgvy2HKe_6Qb/view?usp=sharing).
- Duração: validada pela equipe dentro do limite da entrega.

## Ambiente de homologação

| Item | Valor |
|---|---|
| Ambiente | `hml` |
| Provedor/região | AWS / `us-east-1` |
| Conta acadêmica | AWS Academy Learner Lab `982623100545` |
| API Gateway | <https://9o7vnq3io0.execute-api.us-east-1.amazonaws.com> |
| Swagger | <https://9o7vnq3io0.execute-api.us-east-1.amazonaws.com/docs/> |
| Dashboard da API | <https://app.datadoghq.com/dashboard/uhc-x7j-d3i> |
| Dashboard Kubernetes | <https://app.datadoghq.com/dashboard/cfp-bd3-ayn> |
| Dashboard de negócio | <https://app.datadoghq.com/dashboard/i9b-paf-7z5> |

Em 13/09/2026, `/health` e `/docs/` responderam HTTP 200. O Datadog Agent foi validado com dois Agents prontos e recebimento de métricas DogStatsD. Por ser um Learner Lab, o endpoint pode ficar indisponível quando a sessão acadêmica expira; isso é uma limitação do ambiente, não do desenho de produção.

## Arquitetura e decisões

- [Entrega técnica e arquitetura integrada](entrega-tecnica.md)
- [Arquitetura-alvo e diagramas de sequência](arquitetura-alvo.md)
- [Matriz de conformidade oficial](matriz-conformidade.md)
- [Catálogo de evidências](catalogo-evidencias.md)
- [Modelo relacional e diagrama ER](modelo-dados.md)
- [Matriz de rotas e permissões](matriz-rotas-permissoes.md)
- [RFCs e ADRs](README.md)
- [Segurança](seguranca.md)
- [Observabilidade](observabilidade.md)
- [Runbook operacional](runbook.md)
- [Estimativa de custos](estimativa-custos.md)

## Evidências principais

- EKS, controllers e Datadog: [run 34776527610](https://github.com/maypinheiro/oficina-k8s-infra/actions/runs/34776527610).
- JWT, Authorizer, Gateway, VPC Link e rota protegida: [run 34617351925](https://github.com/maypinheiro/oficina-auth-function/actions/runs/34617351925).
- CI/CD automático: workflows acionados por `workflow_run` após CI verde em `homolog` e `main`, com `workflow_dispatch` preservado como contingência.
- Observabilidade: dashboards provisionados por Terraform, logs JSON correlacionados, métricas técnicas e de negócio e monitores versionados.

## Pendências para envio ao Portal do Aluno

1. Regenerar e revisar o PDF único com o link do vídeo.
2. Abrir todos os links do PDF em janela anônima antes da submissão.

Não há lacuna técnica obrigatória identificada na auditoria de 13/09/2026.
