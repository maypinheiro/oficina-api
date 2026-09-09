# Infraestrutura

## Visão geral

A infraestrutura roda em Kubernetes local usando Kind. O fluxo foi desenhado para funcionar tanto localmente quanto no GitHub Actions, onde o cluster é descartável e nasce durante o CD.

## Terraform

Os recursos em `infra/` provisionam:

- cluster Kind;
- namespace `oficina`;
- ConfigMap e Secret da API;
- PostgreSQL com PVC, probes e recursos;
- Metrics Server;
- API com Service, Deployment e rolling update;
- PodDisruptionBudget;
- HPA da API.

O Terraform aplica os manifests Kubernetes versionados em `k8s/` por meio do provider `kubectl`.

## Kubernetes

Os manifests ficam em `k8s/`:

- `namespace.yaml`;
- `configmap.yaml`;
- `secret.yaml`;
- `postgres.yaml`;
- `metrics-server.yaml`;
- `prisma-job.yaml`;
- `api.yaml`;
- `api-pdb.yaml`;
- `hpa.yaml`.

Pontos relevantes:

- a API roda com usuário não-root;
- o Deployment restringe privilege escalation e capabilities;
- o rollout usa estratégia sem indisponibilidade voluntária;
- o banco usa PVC para persistência;
- o HPA escala apenas a API.

## CI/CD

- `ci-feature.yml` valida branches de feature e abre PR para `develop`;
- `ci.yml` valida `develop`, `homolog` e `main`;
- `cd.yml` aplica o deploy no cluster efêmero do runner;
- o SonarCloud fica restrito ao fluxo `develop -> homolog`.

## Execução local

Para ambiente local:

- `docker compose` sobe API e PostgreSQL;
- `kind` é usado para demonstrar o deploy e a escalabilidade;
- `prisma migrate deploy` é executado pelo job `prisma-migrate` antes da API atender;
- `db:seed:ts` é opcional para popular dados depois das migrations concluídas.

## Validação do HPA

Depois do deploy:

```bash
kubectl top nodes
kubectl top pods -n oficina
kubectl -n oficina get hpa
kubectl -n oficina get pods -w
```

Use carga na API e acompanhe as réplicas subindo conforme o HPA reage.
