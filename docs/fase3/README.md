# Fase 3 — Arquitetura, implementação e entrega

Status: **implementada e validada em homologação**
Última revisão: 2026-09-11

Este diretório consolida requisitos, decisões, arquitetura, operação e evidências
da Fase 3. O enunciado está em `../definicoesFase3.md`, complementado por
`../explicacaoProfessorFase3.md`. A visão do que foi efetivamente entregue está
em [entrega-tecnica.md](entrega-tecnica.md).

## Decisões consolidadas

| Tema | Decisão |
|---|---|
| Nuvem | AWS |
| Conta | AWS Academy Learner Lab (`982623100545`), conta única e temporária |
| Região primária | `us-east-1` (N. Virginia), por custo e disponibilidade de serviços |
| Observabilidade | Datadog, integrado a EKS, Lambda, API Gateway e PostgreSQL/RDS |
| Homologação | Recursos `hml`, preferencialmente temporários, com deploy da branch `homolog` |
| Produção | Recursos `prod`, deploy da branch `main` e aprovação do environment |
| Entrada HTTP | Amazon API Gateway HTTP API |
| Autenticação do cliente | CPF validado por AWS Lambda, consulta ao RDS e emissão de JWT |
| Validação do JWT | Lambda Authorizer no API Gateway, com cache curto |
| Assinatura | JWT assimétrico `RS256`; chave privada no Secrets Manager e chave pública disponível ao Authorizer |
| Funcionários | Autenticação administrativa separada; Cognito é evolução recomendada, não implantada |
| Banco | Amazon RDS for PostgreSQL, privado e fora do EKS |
| Acesso ao banco | Lambda e EKS na VPC; Security Groups aceitam PostgreSQL somente dessas origens |
| Kubernetes | Amazon EKS com Managed Node Groups e HPA |
| Segredos | AWS Secrets Manager; configurações não sensíveis em Parameter Store/ConfigMap |
| Imagens | Amazon ECR, com tags imutáveis pelo SHA do commit |
| IaC | Terraform com estado remoto S3 e locking em DynamoDB |

## Ambientes e promoção

```text
feature/* -> develop -> homolog -> main
                    |          |
                    |          +-> deploy em produção
                    +------------> deploy em homologação
```

- Pull Requests e checks obrigatórios em todas as promoções.
- `homolog` aplica no ambiente lógico de homologação da conta Learner Lab.
- `main` inicia o CD de produção; o GitHub Environment `production` exige
  aprovação e, depois dela, o restante do deploy é automático.
- Produção e homologação usam nomes, tags, estados Terraform, secrets e bancos
  distintos dentro da mesma conta. Não há compartilhamento de dados pessoais.
- Homologação usa dados sintéticos e pode ter recursos desligados fora da janela
  de trabalho para redução de custo.

## Autorização

As identidades são separadas:

- cliente: autenticação por CPF conforme requisito acadêmico, com escopos
  limitados às operações do próprio cliente;
- funcionário: Cognito User Pool, credencial individual e grupos como
  `atendimento`, `mecanico` e `admin`;
- serviço: em uma conta regular seriam usados IRSA/OIDC e roles dedicadas. No
  Learner Lab, controllers e pipelines usam `LabRole` e credenciais STS
  temporárias, nunca versionadas.

O fato de conhecer um CPF não representa autenticação forte em uma solução
real. O risco é aceito exclusivamente para cumprir o enunciado e está registrado
na RFC de autenticação. CPF completo e JWT nunca devem aparecer nos logs.

## Documentos desta etapa

- `entrega-tecnica.md`: objetivos, escopo entregue, mapa integrado e evidências;
- `rfc-001-aws.md`: escolha da nuvem e topologia dos ambientes;
- `rfc-002-postgresql-rds.md`: banco e acesso privado;
- `rfc-003-autenticacao.md`: CPF, JWT, Authorizer e funcionários;
- `rfc-004-observabilidade-datadog.md`: métricas, logs, traces e alertas;
- `adrs/`: decisões permanentes com contexto, alternativas e consequências;
- `seguranca.md`: controles, riscos e resposta a incidente;
- `observabilidade.md`: sinais, correlação e critérios operacionais;
- `runbook.md`: implantação, diagnóstico, rollback e encerramento;
- `matriz-rotas-permissoes.md`: exposição e autenticação das rotas;
- `estimativa-custos.md`: estimativa inicial e mecanismos de controle;
- `arquitetura-alvo.md`: visão de componentes e fluxos principais.
- `modelo-dados.md`: modelo ER, índices, integridade e justificativa relacional.
- `rfc-005-aws-academy-learner-lab.md`: limitações da conta acadêmica e contingências.
- `roteiro-video-final.md`: roteiro cronometrado da demonstração de até 15 minutos;
- `entrega-final.md`: índice para o PDF e submissão final.

## Evidências atuais

- EKS e controllers: <https://github.com/maypinheiro/oficina-k8s-infra/actions/runs/34616729840>
- autenticação e integração privada: <https://github.com/maypinheiro/oficina-auth-function/actions/runs/34617351925>
- API Gateway de homologação: <https://9o7vnq3io0.execute-api.us-east-1.amazonaws.com>
- Swagger: <https://9o7vnq3io0.execute-api.us-east-1.amazonaws.com/docs>

Os endpoints dependem de uma sessão ativa do Learner Lab. Antes de uma nova
demonstração, renove os secrets dos GitHub Environments e execute o
provisionamento dos controllers para atualizar a sessão utilizada dentro do EKS.
