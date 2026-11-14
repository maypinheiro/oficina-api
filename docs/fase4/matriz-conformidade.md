# Matriz de conformidade — Fase 4

Atualização: 13/11/2026 (`America/Sao_Paulo`). Esta matriz relaciona cada requisito oficial à implementação, à evidência reproduzível e às limitações do AWS Academy Learner Lab.

## Microsserviços e dados

| Requisito | Estado | Implementação e evidência |
|---|---|---|
| No mínimo três microsserviços independentes | Atendido | [OS Service](https://github.com/maypinheiro/oficina-api), [Billing Service](https://github.com/maypinheiro/oficina-billing-service) e [Execution Service](https://github.com/maypinheiro/oficina-execution-service), cada um com repositório, Dockerfile, manifests, CI/CD e infraestrutura próprios. |
| OS: abertura, status e histórico | Atendido | O OS Service mantém a API pública, o histórico e a projeção global da OS e expõe a consulta da Saga. |
| Billing: orçamento, aprovação e pagamento | Atendido | Billing possui banco PostgreSQL próprio, decisão de orçamento, adapter Mercado Pago, webhook assinado e mock acadêmico. |
| Execution: fila, diagnóstico, reparo e conclusão | Atendido | Execution persiste o ciclo operacional no DynamoDB e processa `StartExecution`, `CompleteExecution` e `CancelExecution`. |
| Banco próprio por serviço | Atendido | OS e Billing usam PostgreSQL separados; Execution usa tabela DynamoDB própria. Consulte [ownership de dados](ownership-dados.md). |
| Ao menos um SQL e um NoSQL | Atendido | PostgreSQL atende o requisito relacional e DynamoDB atende o não relacional. |
| Nenhum acesso direto ao banco de outro serviço | Atendido | A integração de domínio ocorre por SNS/SQS; cada repositório contém apenas o adaptador de sua persistência. |

## Comunicação e Saga

| Requisito | Estado | Implementação e evidência |
|---|---|---|
| REST síncrono quando necessário | Atendido | API pública e fachadas no OS Service; webhook e decisão de orçamento no Billing; health checks nos três serviços. |
| Mensageria assíncrona | Atendido | SNS para eventos, uma fila SQS de comandos por participante, fila do orquestrador e DLQ por consumidor. Contratos em [catálogo de mensagens](catalogo-mensagens.md). |
| Saga Pattern | Atendido | Saga orquestrada pelo OS Service, com estado persistido e transações locais. Decisão formal na [RFC-007](rfc-007-saga-orquestrada.md) e no [ADR-009](adrs/adr-009-os-orquestrador.md). |
| Rollback/compensação | Atendido e validado em HML | `ExecutionFailed → CancelExecution → ExecutionCancelled → CancelQuoteApproval → QuoteApprovalCancelled → COMPENSATED`. Evidência no [catálogo de evidências](catalogo-evidencias.md). |
| Consistência e idempotência | Atendido | Transactional Outbox, inbox, chaves idempotentes, controle otimista, entrega *at-least-once*, retry e DLQ. |
| Integração Mercado Pago | Atendido com modo acadêmico | Adapter HTTP, chave de idempotência, reembolso e validação HMAC do webhook implementados e testados. A demonstração HML usa `mock`; nenhuma transação financeira real foi executada. |

## Testes, qualidade e entrega

| Requisito | Estado | Implementação e evidência |
|---|---|---|
| Testes unitários em todos os serviços | Atendido | Execução local validada: OS 125, Billing 37 e Execution 15 testes aprovados. |
| Um fluxo completo em BDD | Atendido | Cucumber executa caminho feliz e compensação; detalhes em [BDD da Saga](fase6-bdd-saga.md). |
| Cobertura mínima de 80% por serviço | Atendido | OS: 89,82% linhas/80,95% branches; Billing: 94,18%/80,34%; Execution: 95,68%/80,83%. |
| SonarQube ou similar no CI | Atendido | SonarCloud integra os workflows; o quality gate é checagem obrigatória antes do merge. |
| Pipeline independente de build, testes, qualidade e deploy Kubernetes | Atendido | Cada repositório possui CI e CD. `workflow_run` inicia CD após CI em `homolog`/`main`; `workflow_dispatch` é contingência. |
| `main` protegida por PR e checagens | Atendido | Proteção aplicada com administração incluída, revisão de PR habilitada, branches atualizadas descartando revisão anterior e checks obrigatórios `validate` (OS) ou `quality` (Billing/Execution). Como o projeto tem uma única participante, a quantidade mínima de aprovações é zero. |
| Deploy Kubernetes automatizado | Atendido em HML | Imagem imutável, manifests, rollout, probes, recursos, HPA e PDB. Produção é protegida pelo GitHub Environment e não foi executada. |
| Observabilidade da Fase 3 | Atendido e validado em HML | Datadog Agent compartilhado, APM, logs JSON, DogStatsD e IDs de correlação estão configurados. Dashboard e monitores distribuídos foram aplicados pela [execução 43528997327](https://github.com/maypinheiro/oficina-k8s-infra/actions/runs/43528997327). A conferência visual confirmou métricas, transições, réplicas e logs dos três microsserviços; a API de logs retornou 25 registros para os dois `correlationId` atuais. |

## Entregáveis

| Entregável | Estado | Localização |
|---|---|---|
| Código, Dockerfile, Kubernetes e CI/CD por serviço | Atendido | Raiz de cada um dos três repositórios. |
| Evidência de cobertura | Atendido | Comando `npm run test:coverage`, gates dos workflows e números reproduzidos nesta matriz. |
| Documentação da arquitetura | Atendido | [Arquitetura final](arquitetura-alvo.md), [Saga](saga-orquestrada.md), RFCs, ADRs e documentação específica nos READMEs. |
| Swagger ou collection Postman atualizada | Atendido | [Swagger do OS Service](https://1stuihvf8d.execute-api.us-east-1.amazonaws.com/docs/), [OpenAPI do Billing](https://github.com/maypinheiro/oficina-billing-service/blob/main/docs/openapi.yaml) e [OpenAPI do Execution](https://github.com/maypinheiro/oficina-execution-service/blob/main/docs/openapi.yaml). |
| Vídeo de até 15 minutos | Pendente da Fase 4 | Deve demonstrar fluxo completo, compensação, deploy automatizado e rastreamento distribuído. O vídeo da Fase 3 não substitui este entregável. |
| PDF final do portal | Pendente de fechamento | Deve reunir participantes, links dos três repositórios, vídeo, arquitetura, estratégia Saga e justificativas. O conteúdo técnico já está organizado neste diretório. |

## Pendências reais para encerramento

1. gravar e publicar o vídeo da Fase 4 em YouTube ou Vimeo;
2. gerar o PDF final com os links definitivos do vídeo e dos repositórios;
3. opcionalmente executar Mercado Pago Sandbox se forem disponibilizadas credenciais acadêmicas; o adapter e seus testes já atendem ao contrato técnico.
