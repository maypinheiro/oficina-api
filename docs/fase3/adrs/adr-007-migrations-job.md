# ADR-007 — Migrations por Job Kubernetes

## Contexto
Executar migrations em cada réplica causa concorrência e mistura inicialização com mudança de schema.

## Decisão
O CD executa Job versionado com `prisma migrate deploy` antes do rollout. Falha interrompe o deploy; seed não faz parte do Job de produção.

## Alternativas
Migration no startup cria concorrência; alteração manual perde rastreabilidade.

## Consequências
Deploys são auditáveis. Mudanças destrutivas exigem expand/contract e backup; rollback de imagem não reverte o banco.
