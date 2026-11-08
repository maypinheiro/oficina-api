# Fase 10 — Observabilidade distribuída

## Objetivo e escopo

Esta etapa padroniza logs, métricas e traces para acompanhar uma ordem de serviço desde o OS Service, passando por Billing e Execution, até a conclusão ou compensação da Saga. A implementação reutiliza o Datadog Agent da Fase 3 e não registra CPF, tokens, credenciais ou strings de conexão.

## Correlação ponta a ponta

O envelope de mensageria transporta `correlationId`, `sagaId`, `messageId`, `causationId` e `aggregateId`. Os três serviços registram esses campos com os nomes `correlationId`, `sagaId`, `eventId` e `ordemServicoId`. Em HTTP, um `x-correlation-id` válido é preservado; quando ausente, o serviço gera um UUID e devolve o valor no response header.

Consultas recomendadas no Log Explorer:

```text
env:hml @correlationId:<CORRELATION_ID>
env:hml @sagaId:<SAGA_ID>
env:hml @ordemServicoId:<ID_DA_OS>
```

## Logs estruturados e segurança

Cada linha é JSON e contém `timestamp`, `level`, `service`, `environment`, `version` e `message`. Eventos da Saga incluem identificadores causais, tipo da mensagem, etapa e resultado. A allowlist operacional evita payloads completos; chaves relacionadas a autorização, CPF, token, senha, segredo e conexão são substituídas por `[REDACTED]`. Existem testes automatizados dessa redação nos três serviços.

## Métricas DogStatsD

Todas usam o prefixo `oficina.` e as tags de baixa cardinalidade `service` e `env`.

| Métrica | Tipo | Finalidade |
| --- | --- | --- |
| `oficina.http.requests` | count | Volume por método, rota e status |
| `oficina.http.request.duration_ms` | histogram | Latência HTTP |
| `oficina.http.errors` | count | Respostas HTTP 5xx |
| `oficina.saga.started` | count | Sagas iniciadas |
| `oficina.saga.transitions` | count | Transições por evento e etapa |
| `oficina.saga.completed` | count | Sagas concluídas |
| `oficina.saga.compensated` | count | Sagas compensadas |
| `oficina.saga.failed` | count | Falhas de início/processamento |
| `oficina.saga.messages.processed` | count | Comandos processados |
| `oficina.saga.messages.duplicate` | count | Duplicidades descartadas |
| `oficina.saga.messages.failed` | count | Falhas de consumidor |
| `oficina.saga.transition.duration_ms` | histogram | Tempo das transições no orquestrador |
| `oficina.saga.message.duration_ms` | histogram | Tempo de consumo em Billing/Execution |

`correlationId`, `sagaId`, `eventId` e número da OS não são tags de métrica para evitar alta cardinalidade; permanecem em logs e spans.

## Tracing

Os containers de Billing e Execution iniciam o processo com `dd-trace/initialize.mjs`. O Kubernetes injeta o IP do nó em `DD_AGENT_HOST`, habilita runtime metrics, log injection e propagação Datadog/W3C. Os processadores criam spans `messaging.command.process`; o orquestrador cria `saga.start` e `saga.event.consume`, com tags de correlação. As integrações automáticas do tracer cobrem HTTP e AWS SDK.

## Dashboards e monitores requeridos

O dashboard **[HML] Oficina — Saga distribuída** deve conter:

1. Sagas iniciadas, concluídas, compensadas e falhas;
2. p50/p95 de `saga.transition.duration_ms` e `saga.message.duration_ms` por serviço;
3. comandos processados, duplicados e falhos;
4. latência e erros HTTP por serviço;
5. réplicas disponíveis e reinícios dos três Deployments;
6. stream de logs filtrável por `correlationId` e `sagaId`.

Monitores mínimos:

- `oficina.saga.failed > 0` em 5 minutos;
- crescimento de mensagens em DLQ;
- ausência de consumidor/telemetria por 10 minutos;
- taxa de compensação acima do baseline acadêmico;
- Deployment sem réplicas disponíveis;
- p95 HTTP ou de consumo acima do limite definido durante homologação.

## Configuração Kubernetes

Billing e Execution definem `DD_SERVICE`, `DD_ENV`, `DD_VERSION`, `DD_AGENT_HOST`, portas APM/DogStatsD, runtime metrics, log injection e estilos de propagação. O OS Service mantém a configuração equivalente no repositório de infraestrutura Kubernetes da Fase 3. O Datadog Agent continua como DaemonSet compartilhado; nenhum serviço recebe `DD_API_KEY` diretamente.

## Evidências e gate

- Código, testes e manifests: concluídos nesta fase;
- testes locais: Billing 20/20, Execution 13/13 e OS Service 108/108;
- cobertura: Billing 97,87% de linhas e Execution 98,57%;
- dashboards, monitores e captura de um fluxo real: validar na Fase 11 com o Learner Lab ativo;
- aceite final: localizar a mesma OS nos três serviços pelo `correlationId`/`sagaId` e apresentar spans e métricas do caminho feliz e da compensação.
