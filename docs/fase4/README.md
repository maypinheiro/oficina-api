# Fase 4 — Arquitetura e Saga

Este diretório é a fonte central das decisões da Fase 4. A Fase 0 fecha a
arquitetura e o fluxo transacional antes da extração de código do monólito.

## Decisões fechadas

- [Fase 3 — mensageria básica e contratos](fase3-mensageria-basica.md)
- [Fase 4 — Saga orquestrada implementada](fase4-saga-implementada.md)
- [Fase 5 — integração Mercado Pago](fase5-mercado-pago.md)
- [Fase 6 — BDD ponta a ponta da Saga](fase6-bdd-saga.md)
- [Fase 10 — observabilidade distribuída](fase10-observabilidade-distribuida.md)
- [Matriz de conformidade com os requisitos oficiais](matriz-conformidade.md)
- [Catálogo de evidências de HML, testes e CI/CD](catalogo-evidencias.md)

| Tema | Decisão |
|---|---|
| Serviços de negócio | OS Service, Billing Service e Execution Service |
| Repositórios | Um repositório por serviço; `oficina-api` evolui para OS Service |
| Saga | Orquestrada pelo OS Service |
| Comunicação | REST nas bordas e SNS/SQS para comandos e eventos entre serviços |
| Persistência | PostgreSQL para OS/Billing e DynamoDB para Execution |
| Consistência | Transação local + Transactional Outbox + consumidores idempotentes |
| Entrega | Pelo menos uma vez, com retry, DLQ e replay auditável |
| Cluster | EKS compartilhado, com namespace e infraestrutura por serviço |
| Pagamento | Adapter Mercado Pago e mock acadêmico compatível |
| Observabilidade | Datadog, `correlationId`, `sagaId`, métricas e tracing distribuído |

## Documentos da Fase 0

- [Arquitetura-alvo](arquitetura-alvo.md)
- [Fluxo da Saga orquestrada](saga-orquestrada.md)
- [Catálogo inicial de comandos e eventos](catalogo-mensagens.md)
- [Ownership e isolamento dos dados](ownership-dados.md)
- [Matriz de decisões e critérios de saída](matriz-decisoes-fase0.md)
- [RFC-006 — Divisão dos microsserviços](rfc-006-divisao-microservicos.md)
- [RFC-007 — Saga orquestrada](rfc-007-saga-orquestrada.md)
- [ADRs da Fase 4](adrs/README.md)

## Mapa direto para avaliação dos requisitos

| Requisito obrigatório | Documento principal | Evidência de implementação |
|---|---|---|
| Três microsserviços independentes | [arquitetura-alvo](arquitetura-alvo.md) e [RFC-006](rfc-006-divisao-microservicos.md) | repositórios OS, Billing e Execution, cada um com Dockerfile, `infra/`, `k8s/` e workflows |
| Banco próprio por serviço; SQL e NoSQL | [ownership dos dados](ownership-dados.md) | PostgreSQL OS, PostgreSQL Billing e DynamoDB Execution |
| REST e mensageria assíncrona | [catálogo de mensagens](catalogo-mensagens.md) | API Gateway/REST nas bordas e SNS/SQS com fila/DLQ por consumidor |
| Nenhum acesso ao banco de outro serviço | [ownership dos dados](ownership-dados.md) | credenciais, adapters e infraestrutura isolados por repositório |
| Saga com rollback | [Saga orquestrada](saga-orquestrada.md), [RFC-007](rfc-007-saga-orquestrada.md) | caminho feliz e `ExecutionFailed` até `COMPENSATED` executados em HML |
| Mercado Pago | [integração de pagamento](fase5-mercado-pago.md) | porta/adapter, webhook assinado, idempotência e mock HML |
| Testes, BDD e 80% | [BDD da Saga](fase6-bdd-saga.md) | gates `test:coverage` por serviço e cenário Cucumber ponta a ponta |
| Qualidade no CI | [matriz de conformidade](matriz-conformidade.md) | build, testes, cobertura, auditoria e análise SonarCloud nos PRs |
| CI/CD e Kubernetes | [catálogo de evidências](catalogo-evidencias.md) | pipelines independentes, imagens imutáveis, Deployments, Services, HPA e PDB |
| Observabilidade | [observabilidade distribuída](fase10-observabilidade-distribuida.md) | dashboard Datadog, monitores e 25 logs correlacionados entre os três serviços |
| Swagger/OpenAPI | [matriz de conformidade](matriz-conformidade.md) | Swagger do OS e contratos OpenAPI de Billing e Execution |
| Vídeo de demonstração | [vídeo da Fase 4](https://drive.google.com/file/d/1Rdqxn5T4ZMjmfOuzQWMZcSsvI4G9O0c7/view?usp=drive_link) | fluxo completo, compensação, CI/CD e observabilidade distribuída demonstrados |
| PDF final | [matriz de conformidade](matriz-conformidade.md) e [catálogo de evidências](catalogo-evidencias.md) | documento final gerado e entregue no portal acadêmico |

### Repositórios avaliáveis

- [OS Service](https://github.com/maypinheiro/oficina-api)
- [Billing Service](https://github.com/maypinheiro/oficina-billing-service)
- [Execution Service](https://github.com/maypinheiro/oficina-execution-service)
- [Infraestrutura Kubernetes e observabilidade](https://github.com/maypinheiro/oficina-k8s-infra)
- [Infraestrutura do banco do OS](https://github.com/maypinheiro/oficina-database-infra)
- [Autenticação e API Gateway](https://github.com/maypinheiro/oficina-auth-function)

## Evolução da implementação

- [Fase 1 — preparação dos repositórios](fase1-preparacao-repositorios.md)
- [Fase 2 — separação dos dados](fase2-separacao-dados.md)

## Estado atual da entrega

Os três serviços, os bancos isolados, a mensageria, a Saga, as compensações,
os testes, o BDD e o CI/CD Kubernetes estão implementados. O caminho feliz e a
compensação foram executados em HML. Consulte a [matriz de
conformidade](matriz-conformidade.md) para a auditoria requisito a requisito e o
[catálogo de evidências](catalogo-evidencias.md) para ordens, correlações e runs.

O provisionamento e a confirmação visual na nova organização Datadog foram
concluídos em HML. O dashboard da Saga exibe transições, mensageria, latência,
réplicas e logs dos três serviços; os dois fluxos atuais estão registrados no
[catálogo de evidências](catalogo-evidencias.md). O
[vídeo da Fase 4](https://drive.google.com/file/d/1Rdqxn5T4ZMjmfOuzQWMZcSsvI4G9O0c7/view?usp=drive_link)
foi publicado, e o PDF final com a identificação da participante, os links dos
repositórios, a arquitetura, a estratégia da Saga e as justificativas técnicas
foi gerado e entregue no portal da faculdade. Assim, os entregáveis finais da
Fase 4 estão concluídos.

## Estado da Fase 0

As decisões arquiteturais e o fluxo da Saga estão fechados. Nenhum código de
negócio foi extraído nesta fase. Alterações futuras nas decisões aceitas devem
ser registradas por nova RFC/ADR, evitando mudanças silenciosas durante a
implementação.
