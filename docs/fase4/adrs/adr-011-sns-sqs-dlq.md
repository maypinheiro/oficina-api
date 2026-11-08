# ADR-011 — SNS/SQS com DLQ

- Estado: aceita
- Data: 2026-11-07

## Decisão

SNS distribui eventos e SQS isola o consumo. Cada fila possui DLQ. Comandos são
endereçados à fila do participante; eventos podem ter múltiplas assinaturas.

## Consequências

Há desacoplamento, buffering e replay, com semântica de entrega pelo menos uma
vez. A solução exige idempotência, políticas IAM, alarmes de idade/backlog e
procedimento auditável de redrive.
