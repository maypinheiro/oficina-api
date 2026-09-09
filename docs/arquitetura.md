# Arquitetura

## Visão geral

A solução combina uma API Node.js em Clean Architecture com infraestrutura declarativa em Docker Compose, Kubernetes, Terraform e GitHub Actions.

## Componentes da aplicação

```mermaid
flowchart LR
  HTTP["HTTP / Swagger / Controllers"] --> APP["Application / Use Cases"]
  APP --> DOMAIN["Domain / Entidades e regras"]
  APP --> INFRA["Infra / Repositories Prisma"]
  INFRA --> DB["PostgreSQL"]
  HTTP --> PRESENTERS["Presenters"]
  PRESENTERS --> HTTP
```

## Desenho da infraestrutura

```mermaid
flowchart LR
  Dev["Desenvolvimento local"] --> Compose["docker compose up -d"]
  Compose --> LocalDB["PostgreSQL local"]
  Compose --> LocalAPI["API local"]
  Dev --> TF["Terraform /infra"]
  TF --> Kind["Cluster Kind oficina-local"]
  Kind --> NS["Namespace oficina"]
  NS --> Base["ConfigMap + Secret + PostgreSQL + Metrics Server"]
  NS --> Job["Job prisma migrate deploy"]
  NS --> App["API + Service + PDB + HPA"]
  Job --> DB["PostgreSQL"]
  App --> DB["PostgreSQL"]
  App --> MS["Metrics Server"]
  App --> EXPOSE["NodePort / port-forward"]
```

## Fluxo de branches e deploy

```mermaid
flowchart LR
  Feat["feature/*"] --> CI1["ci-feature.yml"]
  CI1 --> PRD["PR para develop"]
  PRD --> DEV["develop"]
  DEV --> CIC["CI completo"]
  CIC --> PRH["PR para homolog"]
  PRH --> HOM["homolog"]
  HOM --> CIH["CI completo"]
  CIH --> PRM["PR para main"]
  PRM --> MAIN["main"]
  MAIN --> CD["CD em Kind efêmero"]
```

## Pontos de leitura

- O Compose resolve a execução local simples com API + banco.
- O Terraform provisiona o cluster Kind e aplica os manifests como resources.
- O GitHub Actions valida as branches em etapas e cria a próxima PR quando tudo passa.
- O CD é disparado por `workflow_run` depois do CI da `main`.
- O Job de migração roda separado da API e antes do deploy final da aplicação.
- O HPA escala apenas a API, porque ela é a borda stateless da solução.
- O PostgreSQL roda como recurso separado no cluster para manter o fluxo reproduzível.
- A API é exposta via `port-forward` na demo, com `NodePort` opcional apenas quando houver `extraPortMappings` no Kind.

