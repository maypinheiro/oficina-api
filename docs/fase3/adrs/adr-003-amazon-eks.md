# ADR-003 — Amazon EKS

## Contexto
A fase exige Kubernetes gerenciado, escalabilidade e alta disponibilidade na nuvem escolhida.

## Decisão
Executar a API stateless no EKS em `us-east-1`, com duas réplicas, PDB, HPA e imagens no ECR. Homologação e produção mantêm configuração e state separados.

## Alternativas
ECS não atende diretamente ao requisito Kubernetes; Kubernetes autogerenciado aumenta operação; AKS/GKE conflitam com a escolha AWS.

## Consequências
Há integração nativa e maior custo/complexidade. Quotas, `LabRole`, saldo e duração do Learner Lab podem limitar o ambiente; a contingência é cluster temporário com namespaces separados.
