# Catálogo de evidências — Fase 4

Atualização: 13/11/2026 (`America/Sao_Paulo`). Este documento registra identificadores e links que permitem reproduzir ou conferir a implementação. Tokens, senhas, chaves e credenciais temporárias não são evidências e não são armazenados aqui.

## Ambiente validado

| Item | Valor |
|---|---|
| AWS Academy Learner Lab | conta atual `533267045718` |
| Região | `us-east-1` |
| Cluster HML | `oficina-hml` |
| API Gateway HML | <https://1stuihvf8d.execute-api.us-east-1.amazonaws.com> |
| Swagger HML | <https://1stuihvf8d.execute-api.us-east-1.amazonaws.com/docs/> |

As credenciais STS expiram com a sessão do laboratório. O CD acadêmico injeta a sessão em Secrets do Kubernetes; em conta permanente, a arquitetura recomenda IRSA/EKS Pod Identity.

## Fluxo completo concluído

| Campo | Evidência |
|---|---|
| Ordem de serviço | `OS-1794614810227` |
| Saga ID | `b5dc030d-0150-4f07-ae62-d05a9a34f563` |
| Estado terminal | Saga `CONCLUIDA`, etapa `COMPLETED` |
| Correlation ID | `8e9bf4c2-3520-47f3-855d-3ec852104b65` |
| Finalização UTC | `2026-11-14T00:07:36.080Z` |
| Encadeamento | criar OS → criar/aprovar orçamento → iniciar/concluir execução → criar/confirmar pagamento |
| Pagamento | resultado HML `approved`, processado pelo mesmo caso de uso do webhook e publicado pela outbox do Billing |

Consulta reproduzível: `GET /ordens-servico/OS-1794614810227/saga`, com JWT administrativo válido.

## Fluxo compensado

| Campo | Evidência |
|---|---|
| Ordem de serviço | `OS-1794614898906` |
| Saga ID | `ee4a0f18-05d3-4a28-b760-e386632609bd` |
| Estado terminal | Saga `COMPENSADA`, etapa `COMPENSATED` |
| Correlation ID | `b3139cc9-39cb-46b2-892a-f8a7ebd4fe23` |
| Finalização UTC | `2026-11-14T00:08:31.789Z` |
| Encadeamento | `ExecutionFailed` → `CancelExecution` → `ExecutionCancelled` → `CancelQuoteApproval` → `QuoteApprovalCancelled` |
| Efeito | execução cancelada/liberada e aprovação do orçamento desfeita nos bancos proprietários |

A falha controlada foi iniciada pela rota HML protegida `POST /ordens-servico/{numeroOs}/saga/simulate-execution-failure`. Fora de `DD_ENV=hml`, a rota não é disponibilizada.

## Filas após os testes

Ao final dos fluxos, os atributos `ApproximateNumberOfMessages`, `ApproximateNumberOfMessagesNotVisible` e `ApproximateNumberOfMessagesDelayed` estavam zerados em:

- `oficina-billing-hml-commands` e `oficina-billing-hml-dlq`;
- `oficina-execution-hml-commands` e `oficina-execution-hml-dlq`;
- `os-service-hml-commands` e `os-service-hml-dlq`.

Essa é uma evidência pontual de que não ficaram mensagens presas ou mortas após o caminho feliz e a compensação; os contadores devem ser consultados novamente durante a demonstração.

## Qualidade reproduzida localmente

| Serviço | Testes | Linhas | Branches | Resultado |
|---|---:|---:|---:|---|
| OS Service | 125 | 89,82% | 80,95% | aprovado |
| Billing Service | 37 | 94,18% | 80,34% | aprovado |
| Execution Service | 15 | 95,68% | 80,83% | aprovado |

Comando em cada repositório: `npm run test:coverage`. Todos os gates mínimos são 80% para linhas, statements, funções e branches.

## CI/CD e proteção de produção

| Serviço | CI em `main` | CD automático aguardando `prod` | Resultado |
|---|---|---|---|
| OS Service | [run 43343523344](https://github.com/maypinheiro/oficina-api/actions/runs/43343523344) | [run 43343853403](https://github.com/maypinheiro/oficina-api/actions/runs/43343853403) | gate comprovado; execução cancelada sem deploy |
| Billing Service | [run 43344634732](https://github.com/maypinheiro/oficina-billing-service/actions/runs/43344634732) | [run 43344796938](https://github.com/maypinheiro/oficina-billing-service/actions/runs/43344796938) | gate comprovado; execução cancelada sem deploy |
| Execution Service | [run 43344648043](https://github.com/maypinheiro/oficina-execution-service/actions/runs/43344648043) | [run 43344772762](https://github.com/maypinheiro/oficina-execution-service/actions/runs/43344772762) | gate comprovado; execução cancelada sem deploy |

Os três environments `prod` exigem o revisor `maypinheiro` e aceitam apenas a branch `main`. As execuções pendentes foram deliberadamente canceladas: comprovam o encadeamento automático CI → CD e o gate, sem criar produção no Learner Lab.

Deploys HML relevantes:

- [OS Service — renovação da sessão e rollout](https://github.com/maypinheiro/oficina-api/actions/runs/43530502383);
- [Billing — renovação da sessão e rollout](https://github.com/maypinheiro/oficina-billing-service/actions/runs/43530510346);
- [Execution — rollout concluído; coleta final sofreu timeout de conectividade](https://github.com/maypinheiro/oficina-execution-service/actions/runs/43530519127);
- [OS Service — compensação controlada](https://github.com/maypinheiro/oficina-api/actions/runs/43341244847);
- [Billing — publicação da outbox e simulação de pagamento](https://github.com/maypinheiro/oficina-billing-service/actions/runs/43336017674);
- [Execution — conclusão operacional](https://github.com/maypinheiro/oficina-execution-service/actions/runs/43330064099).

## Datadog validado

| Visão | Link |
|---|---|
| API | <https://app.datadoghq.com/dashboard/tvf-tig-7k5> |
| Negócio | <https://app.datadoghq.com/dashboard/jk8-5k2-e5b> |
| Kubernetes/HPA | <https://app.datadoghq.com/dashboard/s9s-5yb-abz> |
| Saga distribuída | <https://app.datadoghq.com/dashboard/qzn-ptj-zm5> |

O provisionamento foi concluído pela
[execução 43528997327](https://github.com/maypinheiro/oficina-k8s-infra/actions/runs/43528997327).
Na conferência visual, o dashboard da Saga exibiu:

- Sagas concluídas e compensadas;
- transições `QuoteCreated`, `QuoteApproved`, `ExecutionStarted`,
  `ExecutionCompleted`, `PaymentCreated`, `PaymentConfirmed`,
  `ExecutionFailed`, `ExecutionCancelled` e `QuoteApprovalCancelled`;
- mensagens processadas por Billing e Execution;
- réplicas dos três Deployments;
- logs de OS, Billing e Execution.

A busca pela API de logs retornou 25 registros associados aos dois IDs abaixo,
abrangendo os três microsserviços:

```text
env:hml @correlationId:8e9bf4c2-3520-47f3-855d-3ec852104b65
env:hml @correlationId:b3139cc9-39cb-46b2-892a-f8a7ebd4fe23
```

Também é possível filtrar por
`service:(oficina-api OR oficina-billing-service OR oficina-execution-service)`.
