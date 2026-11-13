# Catálogo de evidências — Fase 4

Atualização: 12/11/2026 (`America/Sao_Paulo`). Este documento registra identificadores e links que permitem reproduzir ou conferir a implementação. Tokens, senhas, chaves e credenciais temporárias não são evidências e não são armazenados aqui.

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
| Ordem de serviço | `OS-1794527890365` |
| Estado terminal | Saga `CONCLUIDA`, etapa `COMPLETED` |
| Correlation ID | `85959a80-1dde-4949-89f4-89a26d27e217` |
| Encadeamento | criar OS → criar/aprovar orçamento → iniciar/concluir execução → criar/confirmar pagamento |
| Pagamento | resultado HML `approved`, processado pelo mesmo caso de uso do webhook e publicado pela outbox do Billing |

Consulta reproduzível: `GET /ordens-servico/OS-1794527890365/saga`, com JWT administrativo válido.

## Fluxo compensado

| Campo | Evidência |
|---|---|
| Ordem de serviço | `OS-1794531894048` |
| Estado terminal | Saga `COMPENSATED`, etapa `COMPENSADA` |
| Correlation ID | `d1cdbb8e-fe2f-4650-937c-81787a7baded` |
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

- [OS Service — compensação controlada](https://github.com/maypinheiro/oficina-api/actions/runs/43341244847);
- [Billing — publicação da outbox e simulação de pagamento](https://github.com/maypinheiro/oficina-billing-service/actions/runs/43336017674);
- [Execution — conclusão operacional](https://github.com/maypinheiro/oficina-execution-service/actions/runs/43330064099).

## Consultas Datadog para a conferência final

```text
env:hml @correlationId:85959a80-1dde-4949-89f4-89a26d27e217
env:hml @correlationId:d1cdbb8e-fe2f-4650-937c-81787a7baded
```

Também filtrar por `service:(oficina-api OR oficina-billing-service OR oficina-execution-service)`. A evidência visual ainda deve ser confirmada em uma sessão autenticada; este documento não declara como visto aquilo que ainda depende desse acesso.
