# RFC-007 — Saga orquestrada pelo OS Service

- Estado: aceita
- Data: 2026-11-07

## Contexto

A jornada da OS atravessa criação, orçamento, aprovação, execução e pagamento.
Cada serviço confirma transações em seu próprio banco; rollback local não
reverte efeitos já confirmados em outros serviços.

## Decisão

Adotar Saga orquestrada pelo OS Service. O orquestrador persiste o estado,
publica comandos por SQS, recebe eventos, controla timeout/retry e inicia
compensações. Comunicação do caminho crítico será assíncrona.

## Por que o OS Service

- a jornada nasce e termina na ordem de serviço;
- ele mantém o estado global e o histórico apresentado ao usuário;
- centraliza visibilidade da Saga sem acessar bancos participantes;
- facilita demonstrar falha e compensação;
- evita um quarto serviço de coordenação nesta fase.

## Alternativas consideradas

### Coreografia pura

Rejeitada para o fluxo principal. Reduz o componente central, mas dispersa as
regras de avanço/compensação e dificulta visualizar a jornada acadêmica.

### AWS Step Functions

Adiada. É tecnicamente válida, porém amplia dependência de permissões do Learner
Lab e cria diferença maior entre execução local e cloud.

### Orquestrador dedicado

Adiado. Pode ser extraído no futuro se o ciclo crescer, mas adicionaria serviço,
banco e pipeline sem benefício proporcional agora.

## Consistência e entrega

- transações locais;
- Transactional Outbox;
- entrega pelo menos uma vez;
- consumidores idempotentes;
- retry exponencial e DLQ;
- compensações idempotentes;
- estado da Saga auditável.

## Consequências

O OS Service fica crítico para o progresso de novas etapas, mas participantes
continuam processando mensagens já recebidas. HPA, PDB, múltiplas réplicas,
Outbox e retomada por estado reduzem o risco. O orquestrador não contém regras
internas de orçamento, execução ou pagamento.

## Critérios de aceite

- caminho feliz completo;
- falha transitória recuperada;
- falha definitiva com compensação real;
- mensagem duplicada sem duplicar efeito;
- timeout e DLQ observáveis;
- consulta do estado/histórico da Saga.
