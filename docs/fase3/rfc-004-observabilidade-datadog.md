# RFC-004 — Observabilidade com Datadog

- Status: aceita
- Data: 2026-09-08

## Contexto

A Fase 3 exige latência, CPU/memória, healthchecks, uptime, alertas de falhas em
ordens de serviço, logs JSON correlacionados, traces e dashboards de negócio.
O Metrics Server atual alimenta o HPA, mas não oferece observabilidade
persistente.

## Decisão

Usar Datadog como plataforma central:

- Datadog Agent via Helm no EKS;
- Cluster Agent para estado do Kubernetes;
- APM na API Node.js;
- Datadog Lambda Extension e tracing na Function;
- integração AWS para API Gateway, Lambda, RDS e métricas CloudWatch;
- logs JSON enviados com service, env e version;
- correlação de logs e traces por `trace_id` e `correlationId`;
- custom metrics ou eventos para indicadores de OS.

Tags unificadas obrigatórias:

```text
service:oficina-api | oficina-auth
env:hml | prod
version:<git-sha>
project:techchallenge-oficina
managed-by:terraform
```

## Dashboards

1. APIs: throughput, p50/p95/p99, 4xx, 5xx, disponibilidade e healthcheck.
2. Kubernetes: CPU, memória, réplicas, HPA, pods indisponíveis e restarts.
3. Ordens de serviço: volume diário, tempo médio em diagnóstico, execução e
   finalização, transições com falha e erros de integração.
4. Autenticação: sucesso/negação, latência, erro de banco e cold starts, sem
   dimensões que exponham CPF.

## Alertas mínimos

- uptime/healthcheck indisponível;
- taxa de 5xx acima do limite por cinco minutos;
- p95 de latência acima do objetivo;
- falha ao criar ou mudar status de OS;
- pod em CrashLoopBackOff ou reiniciando;
- CPU/memória sustentada e HPA no máximo;
- erros ou throttling da Lambda;
- conexões/armazenamento do RDS próximos do limite.

Os limites numéricos finais serão calibrados após testes de carga. Para a
primeira versão: disponibilidade de 99%, p95 menor que 1 segundo e erros 5xx
abaixo de 1% são objetivos iniciais, não SLAs contratuais.

## Controle de volume e custo

- não indexar healthchecks bem-sucedidos;
- excluir dados sensíveis no logger antes da transmissão;
- sampling de traces configurável por ambiente;
- retenção curta para a demonstração;
- métricas de negócio com cardinalidade limitada;
- alertas de consumo no Datadog e AWS Budgets.

## Alternativas consideradas

- somente CloudWatch: atende parte da infraestrutura, mas exigiria mais trabalho
  para uma visão unificada de Kubernetes, APM, logs e traces.
- Prometheus/Grafana/Loki/Tempo: reduz dependência SaaS, porém aumenta operação e
  diverge da escolha do grupo.

## Critérios de aceite

- uma requisição pode ser seguida do Gateway até API/Lambda e banco;
- dashboard mostra dados reais nos dois ambientes;
- falha controlada em uma OS produz log, trace e alerta;
- CPU/memória e atuação do HPA aparecem no Datadog;
- nenhuma telemetria contém CPF completo, token ou segredo.

## Referências

- https://www.datadoghq.com/pricing/
- https://docs.datadoghq.com/containers/kubernetes/
- https://docs.datadoghq.com/serverless/aws_lambda/

