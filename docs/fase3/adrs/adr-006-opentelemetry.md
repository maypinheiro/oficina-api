# ADR-006 — OpenTelemetry com Datadog

## Contexto
Instrumentação proprietária aumenta acoplamento.

## Decisão
Usar APIs e convenções OpenTelemetry para traces na aplicação e exportar pelo Datadog Agent. A adoção é incremental; métricas e logs Datadog existentes permanecem.

## Alternativas
Somente SDK proprietário limita portabilidade; somente CloudWatch não oferece a visão unificada exigida.

## Consequências
Preserva portabilidade, mas exige versões compatíveis. Falha de telemetria não deve impedir a aplicação de iniciar.
