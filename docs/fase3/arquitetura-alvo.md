# Arquitetura-alvo da Fase 3

## Componentes

```mermaid
flowchart LR
  User["Cliente"] --> APIGW["API Gateway HTTP API"]
  Staff["Funcionário"] --> Cognito["Amazon Cognito"]
  Cognito --> APIGW

  APIGW -->|"POST /auth/clientes"| Auth["Lambda Auth CPF"]
  APIGW -->|"Bearer JWT"| Authorizer["Lambda Authorizer"]
  Authorizer --> APIGW
  APIGW --> Link["VPC Link"]
  Link --> LB["Load Balancer interno"]
  LB --> API["Oficina API no EKS"]

  Auth --> RDS["RDS PostgreSQL privado"]
  API --> RDS
  Auth --> Secrets["Secrets Manager"]
  API --> Secrets

  API --> DD["Datadog"]
  Auth --> DD
  APIGW --> CW["CloudWatch"]
  RDS --> CW
  CW --> DD
  EKS["EKS + HPA + PDB"] --> API
  EKS --> DD

  GHA["GitHub Actions via OIDC"] --> ECR["Amazon ECR"]
  GHA --> TF["Terraform"]
  ECR --> EKS
  TF --> APIGW
  TF --> EKS
  TF --> RDS
```

O mesmo desenho existe nas contas de homologação e produção, sem banco,
segredos ou estado Terraform compartilhados.

## Sequência de autenticação do cliente

```mermaid
sequenceDiagram
  actor Cliente
  participant GW as API Gateway
  participant Auth as Lambda Auth
  participant DB as RDS PostgreSQL
  participant SM as Secrets Manager
  participant DD as Datadog

  Cliente->>GW: POST /auth/clientes {cpf}
  GW->>Auth: evento + correlationId
  Auth->>Auth: normaliza e valida CPF
  Auth->>DB: busca cliente pelo CPF
  DB-->>Auth: id e status
  alt cliente ativo
    Auth->>SM: obtém chave privada RS256
    SM-->>Auth: chave
    Auth->>Auth: emite JWT de 15 min
    Auth->>DD: log/trace sem CPF completo
    Auth-->>GW: 200 + token
    GW-->>Cliente: JWT
  else inválido, inexistente ou inativo
    Auth->>DD: evento de acesso negado mascarado
    Auth-->>GW: resposta genérica 401
    GW-->>Cliente: 401
  end
```

## Sequência de API protegida

```mermaid
sequenceDiagram
  actor Cliente
  participant GW as API Gateway
  participant AZ as Lambda Authorizer
  participant API as API no EKS
  participant DB as RDS PostgreSQL
  participant DD as Datadog

  Cliente->>GW: requisição + Bearer JWT
  GW->>AZ: token
  AZ->>AZ: valida assinatura, iss, aud, exp e scope
  AZ-->>GW: allow/deny + contexto
  alt autorizado
    GW->>API: request + identidade + correlationId
    API->>API: valida autorização de negócio
    API->>DB: operação
    DB-->>API: resultado
    API->>DD: métrica, log e trace correlacionados
    API-->>GW: resposta
    GW-->>Cliente: resposta
  else negado
    GW-->>Cliente: 401/403
  end
```

## Fronteiras dos quatro repositórios

| Repositório | Responsabilidade principal |
|---|---|
| `oficina-auth-function` | Lambda de CPF, Authorizer e infraestrutura serverless/API Gateway acordada |
| `oficina-k8s-infra` | VPC/EKS, nodes, addons, HPA e base Kubernetes |
| `oficina-database-infra` | RDS, subnets, Security Groups, backups e secrets do banco |
| `oficina-api` | código da API, imagem, migrations, manifests/Helm e deploy da aplicação |

Dependências entre repositórios devem ocorrer por outputs publicados e
parâmetros/segredos bem definidos, nunca por cópia manual de credenciais.

## Naming e tags

Formato de nomes:

```text
oficina-<componente>-<ambiente>-<regiao>
```

Exemplos:

```text
oficina-eks-hml-us-east-1
oficina-db-prod-us-east-1
oficina-auth-hml-us-east-1
```

Tags obrigatórias:

| Tag | Valor/exemplo |
|---|---|
| `Project` | `techchallenge-oficina` |
| `Environment` | `hml` ou `prod` |
| `ManagedBy` | `terraform` |
| `Owner` | nome/identificador do grupo |
| `CostCenter` | `fiap-fase3` |
| `Repository` | nome do repositório responsável |
| `DataClassification` | `personal` quando alcançar dados de cliente |
| `ExpiresAt` | data de remoção do recurso acadêmico, quando aplicável |

