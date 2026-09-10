# Estimativa inicial de custos

- Data-base: 2026-09-08
- Moeda: USD por mês, sem impostos
- Natureza: estimativa preliminar; preços variam por região, uso e câmbio

## Premissas

- uma conta AWS Academy Learner Lab com crédito e duração limitados;
- dois ambientes lógicos (`hml` e `prod`) na mesma conta;
- um cluster EKS por ambiente, em versão com suporte padrão;
- dois nodes pequenos por cluster para demonstrar disponibilidade e HPA;
- um RDS PostgreSQL pequeno Single-AZ por ambiente;
- um load balancer e um NAT Gateway por ambiente;
- baixo volume acadêmico de API Gateway, Lambda, ECR e logs;
- Datadog com poucos hosts, APM, containers, logs e uma Function;
- sem tráfego externo significativo.

## Faixa mensal

| Componente | Faixa mensal estimada |
|---|---:|
| Dois control planes EKS | US$ 146 |
| Nodes EC2/EBS dos dois clusters | US$ 120–220 |
| Dois RDS PostgreSQL pequenos + storage | US$ 45–100 |
| Load balancers | US$ 35–60 |
| NAT Gateways e processamento mínimo | US$ 65–100 |
| API Gateway, Lambda, ECR, Secrets Manager e DNS | US$ 5–25 |
| CloudWatch e transferência | US$ 10–40 |
| Datadog | US$ 80–220 |
| **Total esperado** | **US$ 506–911/mês** |

A taxa fixa do EKS é relevante: cada cluster em suporte padrão custa US$ 0,10
por hora, aproximadamente US$ 73 por mês considerando 730 horas. Datadog varia
principalmente por hosts/APM e volume indexado. Lambda tende a ser residual no
volume acadêmico e possui franquia gratuita, se elegível.

## Perfil acadêmico econômico

Sem alterar a arquitetura lógica, o grupo pode reduzir a janela de execução:

- desligar nodes de homologação fora das demonstrações;
- criar e destruir o ambiente de homologação por pipeline;
- manter apenas produção ativa durante o período de avaliação;
- limitar retenção e indexação de logs;
- limpar imagens antigas no ECR;
- evitar RDS Proxy e Multi-AZ durante a entrega;
- remover NAT Gateways e clusters imediatamente após o prazo, via Terraform.

Esse perfil pode reduzir o desembolso do mês da entrega para aproximadamente
US$ 250–500, dependendo do número de horas ativas e do trial/plano Datadog. Um
único cluster compartilhado seria ainda mais barato, mas não é a recomendação
arquitetural por reduzir isolamento.

Na conta Learner Lab, a estimativa deve ser comparada ao saldo antes de cada
`terraform apply`. Recursos podem continuar consumindo crédito quando a sessão
interativa estiver encerrada; encerrar a sessão não substitui `terraform destroy`.

## Guardrails obrigatórios

1. AWS Budget com alertas em 50%, 80% e 100%, se permitido pela Academy.
2. Anomaly Detection de custo, se disponível para a role do laboratório.
3. Tags de custo em todos os recursos.
4. TTL ou data de expiração registrada para recursos acadêmicos.
5. Lifecycle policy no ECR.
6. Retenção limitada no CloudWatch e Datadog.
7. `terraform plan` revisado antes de todo apply de produção.
8. Procedimento documentado de `terraform destroy` após avaliação, preservando
   previamente evidências e backups necessários.
9. Conferência manual do saldo no início e no fim de cada sessão.

## Referências de preço

- EKS: https://aws.amazon.com/eks/pricing/
- RDS PostgreSQL: https://aws.amazon.com/rds/postgresql/pricing/
- API Gateway: https://aws.amazon.com/api-gateway/pricing/
- Lambda: https://aws.amazon.com/lambda/pricing/
- Secrets Manager: https://aws.amazon.com/secrets-manager/pricing/
- ECR: https://aws.amazon.com/ecr/pricing/
- Datadog: https://www.datadoghq.com/pricing/list/

Antes do provisionamento, os valores devem ser refeitos no AWS Pricing
Calculator com região, classes e horas efetivamente escolhidas.
