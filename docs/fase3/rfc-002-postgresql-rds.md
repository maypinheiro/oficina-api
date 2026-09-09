# RFC-002 — PostgreSQL gerenciado no Amazon RDS

- Status: aceita
- Data: 2026-09-08

## Contexto

A aplicação já usa PostgreSQL com Prisma e possui modelo relacional, migrations
e testes de integração. A Fase 3 exige banco gerenciado, consistência,
performance e documentação do modelo.

## Decisão

Manter PostgreSQL e usar Amazon RDS for PostgreSQL. O RDS ficará em sub-redes
privadas, criptografado, com backup automatizado e conexão TLS.

Configuração inicial sugerida:

| Ambiente | Configuração inicial |
|---|---|
| Homologação | Single-AZ, classe burstable pequena, 20 GiB gp3, retenção de backup de 1 dia |
| Produção | Single-AZ durante a entrega acadêmica, classe burstable pequena, 20 GiB gp3, retenção de 7 dias e proteção contra exclusão |

Multi-AZ é a escolha adequada para produção corporativa, mas poderá ser ativado
depois da demonstração devido ao custo. Esse desvio deve ficar explícito na
entrega, caso a produção acadêmica permaneça Single-AZ.

## Acesso

- EKS acessa o RDS a partir do Security Group dos nodes/pods;
- Lambda entra nas sub-redes privadas e acessa o RDS pelo seu Security Group;
- o Security Group do RDS aceita TCP/5432 apenas dessas duas origens;
- credencial do banco fica no Secrets Manager;
- aplicações obtêm o segredo por IAM, sem valor versionado;
- acesso administrativo ocorre por mecanismo controlado, sem tornar o banco
  público.

No baixo volume acadêmico, a Lambda pode abrir conexão direta com timeout curto
e reutilização do client fora do handler. RDS Proxy fica como evolução caso
cold starts ou concorrência esgotem conexões.

## Modelo e performance

Além das constraints existentes, a implementação deve avaliar:

- `Cliente.status`, necessário para autorizar o CPF;
- índice único de `Cliente.cpfCnpj`, já existente;
- índices compostos para OS por `status` e datas;
- histórico de status suficiente para medir diagnóstico, execução e finalização;
- integridade referencial e política explícita de exclusão;
- unicidade de placa conforme a regra de negócio.

Migrations serão executadas por job dedicado antes do rollout da API. Nenhuma
pipeline de infraestrutura deverá apagar o banco automaticamente.

## Alternativas consideradas

- PostgreSQL dentro do EKS: descartado por não ser banco gerenciado e aumentar a
  responsabilidade operacional.
- DynamoDB: descartado porque o domínio atual é relacional e transacional, e a
  migração não traz benefício proporcional.
- Aurora PostgreSQL: tecnicamente adequado, porém mais caro e desnecessário para
  o volume da entrega.

## Consequências

- alto reaproveitamento do Prisma e das migrations;
- custo fixo mesmo com pouco tráfego;
- Lambda precisa de configuração VPC e gestão cuidadosa de conexões;
- restauração de backup deve ser testada antes da entrega.

## Referências

- https://aws.amazon.com/rds/postgresql/pricing/
- https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html

