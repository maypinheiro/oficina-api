# RFC-005 — Limitações do AWS Academy Learner Lab

- Status: aceita
- Data: 2026-09-08
- Conta: `982623100545`

## Contexto

A infraestrutura será implantada em uma conta AWS Academy Learner Lab fornecida
pela pós-graduação. A conta é acadêmica, temporária, possui saldo controlado e
pode restringir serviços, regiões, quotas e operações IAM. Essas condições não
são equivalentes a uma conta AWS corporativa administrada pelo grupo.

O número da conta identifica o ambiente, mas não é credencial. Access key,
secret access key e session token são segredos e nunca podem ser documentados,
commitados ou exibidos em logs.

## Decisões

1. Usar uma conta e manter `hml` e `prod` como ambientes lógicos.
2. Isolar ambientes por prefixo, tags, estado Terraform, secrets, banco e
   recursos independentes.
3. Usar `us-east-1`, sujeito às regiões liberadas pelo laboratório.
4. Priorizar homologação temporária para preservar créditos.
5. Não considerar o encerramento da sessão como mecanismo de destruição.
6. Criar somente recursos descritos em Terraform e removê-los após coletar as
   evidências da entrega.
7. Não publicar credenciais da Academy nos quatro repositórios.

## Limitações conhecidas ou a validar

- credenciais da sessão são temporárias e precisam ser renovadas;
- pode não haver permissão para criar users, policies, roles, OIDC providers ou
  service-linked roles;
- EKS, Cognito, RDS, Secrets Manager, NAT Gateway, load balancers, budgets ou
  determinadas classes podem estar bloqueados ou limitados;
- quotas podem impedir dois clusters, múltiplos bancos ou alta disponibilidade;
- o laboratório pode expirar ou não ter crédito para ambientes sempre ativos;
- Billing, Cost Explorer e Budgets podem ter acesso parcial;
- recursos podem consumir crédito mesmo com a sessão interativa encerrada;
- a conta não isola organizacionalmente homologação e produção.

Uma limitação só será marcada como confirmada depois de testada na sessão real.

## Matriz de validação

| Capacidade | Teste | Contingência |
|---|---|---|
| AWS CLI/STS | `aws sts get-caller-identity` retorna a conta esperada | renovar credenciais |
| Terraform state | criar/acessar bucket S3 | backend local apenas temporariamente |
| GitHub OIDC/IAM | criar provider e role mínima | secrets temporários por GitHub Environment |
| EKS | validar cluster, node role e node group | registrar bloqueio e alinhar alternativa com o professor |
| RDS | validar engine, classe, subnet group e SG | usar a menor classe permitida |
| Lambda | criar função e associar role | usar role acadêmica compatível |
| API Gateway | criar HTTP API, integração e Authorizer | REST API equivalente se necessário |
| Secrets Manager | criar e ler secret pela workload | SSM SecureString se permitido |
| Cognito | criar User Pool | autenticação administrativa separada e limitação documentada |
| Datadog | integrar AWS, EKS e Lambda | envio direto com API key armazenada como secret |
| Budgets | criar alertas | controle manual do saldo por sessão |

## CI/CD com credenciais temporárias

OIDC permanece como primeira opção. Se IAM/OIDC estiver bloqueado, os GitHub
Environments `homolog` e `production` armazenarão:

- `AWS_ACCESS_KEY_ID`;
- `AWS_SECRET_ACCESS_KEY`;
- `AWS_SESSION_TOKEN`;
- `AWS_REGION`;
- `AWS_ACCOUNT_ID` como variável não sensível.

As três credenciais devem ser secrets, renovadas a cada sessão e nunca impressas.
Produção deve exigir aprovação antes do job que usa as credenciais.

## Isolamento na conta única

Padrão de nomes:

```text
oficina-<componente>-<hml|prod>-us-east-1
```

Cada ambiente terá:

- backend key/estado Terraform próprio;
- secrets com caminhos distintos;
- banco distinto quando saldo e quotas permitirem;
- namespaces e service accounts separados;
- tags `Environment`, `Repository`, `ManagedBy` e `ExpiresAt`;
- pipelines e GitHub Environments separados.

## Critério de parada

Nenhum `terraform apply` será executado antes de confirmar identidade STS,
saldo, região e permissões mínimas. Se um serviço obrigatório estiver bloqueado,
o erro será registrado e o grupo pedirá orientação docente antes de substituir
o componente por algo que possa deixar de cumprir o enunciado.
