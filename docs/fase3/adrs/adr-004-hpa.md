# ADR-004 — Horizontal Pod Autoscaler

## Contexto
A API deve responder a variações de carga sem dimensionamento manual.

## Decisão
Aplicar HPA `autoscaling/v2` somente à API, de 2 a 6 réplicas, com alvos de 70% de CPU e 75% de memória. Metrics Server fornece as métricas.

## Alternativas
Réplicas fixas não demonstram elasticidade; escalar PostgreSQL por HPA é inadequado.

## Consequências
A API deve ser stateless. Sem capacidade nos nodes, o HPA pode solicitar pods que ficam pendentes.
