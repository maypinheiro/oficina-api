# Desenhos adicionais

Este arquivo complementa `app/docs/arquitetura.md`

## 1. Contexto da solução

```mermaid
flowchart LR
  Cliente["Cliente / Mecânica"] --> API["Oficina API"]
  Operador["Atendente / Usuário interno"] --> API
  Externo["Sistema externo / Webhook"] --> API
  API --> DB["PostgreSQL"]
  API --> Docs["Swagger / /docs"]
```

## 2. Fluxo funcional da ordem de serviço

```mermaid
flowchart LR
  A["Cadastrar cliente"] --> B["Cadastrar veículo"]
  B --> C["Cadastrar serviço"]
  C --> D["Cadastrar peça"]
  D --> E["Abrir OS"]
  E --> F["Diagnóstico"]
  F --> G["Orçamento"]
  G --> H["Aprovação / Rejeição"]
  H --> I["Execução"]
  I --> J["Finalização"]
  J --> K["Entrega"]
  H --> L["Consulta pública do status"]
```

## 3. Atualização externa de orçamento

```mermaid
sequenceDiagram
  participant E as Sistema externo
  participant A as Controller HTTP
  participant U as Use Case
  participant R as Repository
  participant P as PostgreSQL

  E->>A: POST /public/orcamentos/notificacoes/aprovacao
  A->>U: Executar decisão externa
  U->>R: Atualizar orçamento / OS
  R->>P: Persistir mudança
  P-->>R: OK
  R-->>U: Resultado
  U-->>A: Resposta
  A-->>E: 200 OK
```

## 4. Escalabilidade com HPA

```mermaid
flowchart LR
  Load["Carga com hey"] --> API["API em Kubernetes"]
  API --> Metrics["Metrics Server"]
  Metrics --> HPA["HPA"]
  HPA --> Pods["Mais réplicas da API"]
```
