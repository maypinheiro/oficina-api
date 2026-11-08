# RFC-006 — Divisão dos microsserviços

- Estado: aceita
- Data: 2026-11-07

## Contexto

O monólito atual reúne atendimento, OS, orçamento, estoque e execução no mesmo
processo e banco. A Fase 4 exige no mínimo três microsserviços independentes,
cada um com repositório, infraestrutura e banco próprios.

## Decisão

Separar em:

1. **OS Service**: abertura, consulta, histórico e coordenação da Saga;
2. **Billing Service**: orçamento, aprovação, cobrança e pagamento;
3. **Execution Service**: diagnóstico, fila, reparo, reservas e conclusão.

O repositório `oficina-api` será evoluído para OS Service. Billing e Execution
terão novos repositórios. Auth, infraestrutura e banco continuam auxiliares e
não são contabilizados como microsserviços de negócio.

## Alternativas consideradas

### Manter o monólito modular

Rejeitada porque não atende ao requisito de deploy e banco independentes.

### Criar um quarto serviço exclusivo para Saga

Adiada. Aumenta operação e coordenação sem necessidade acadêmica. O OS Service
já é autoridade do ciclo global da ordem e pode orquestrar sem absorver regras
internas dos participantes.

### Execution como simples orquestrador

Rejeitada. Execution possui responsabilidade de negócio própria; fazê-lo dono
do fluxo global confundiria execução técnica com ciclo completo da OS.

## Consequências

### Positivas

- ownership claro;
- deploy, testes e escala independentes;
- bancos isolados;
- falhas contidas e evolução por domínio.

### Negativas

- consistência eventual;
- contratos e observabilidade distribuídos;
- necessidade de idempotência, Outbox, DLQ e compensações;
- maior custo operacional.

## Critérios de aceite

- nenhuma conexão cross-database;
- repositório, pipeline, imagem e manifests por serviço;
- SQL e NoSQL presentes no conjunto;
- diagramas e contratos publicados;
- BDD atravessando os três serviços.
