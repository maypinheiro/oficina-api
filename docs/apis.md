# Referência de APIs

## Base de acesso

- Local com Docker Compose: `http://localhost:3000`
- Local com Kind + port-forward: `http://localhost:3000`
- Health: `GET /health`
- Swagger: `GET /docs`

## Autenticação

- `POST /auth/login`
  - Gera o token usado para consumir as rotas protegidas.
  - No teste de escalabilidade, este endpoint é o alvo principal de carga.

## Clientes e veículos

- `POST /clientes`
  - Cadastra o cliente da oficina.
- `POST /veiculos`
  - Vincula o veículo ao cliente.

## Catálogo de serviços e peças

- `POST /servicos`
  - Cadastra um serviço executável pela oficina.
- `POST /pecas`
  - Cadastra uma peça usada no orçamento ou na ordem de serviço.

## Ordens de serviço

- `POST /ordens-servico`
  - Abre uma nova ordem de serviço.
  - Recebe cliente, veículo, serviços e peças no payload.
- `GET /ordens-servico`
  - Lista as ordens ativas.
  - Exclui os status `FINALIZADA` e `ENTREGUE`.
  - Ordena por prioridade de status e depois por mais antiga.
- `GET /ordens-servico/{numeroOs}`
  - Detalha uma ordem específica.
- `GET /ordens-servico/{numeroOs}/historico`
  - Exibe o histórico da ordem.

## Orçamentos

- `POST /orcamentos`
  - Cria o orçamento associado à ordem de serviço.
- `PATCH /orcamentos/{numeroOs}/aprovar`
  - Aprova o orçamento.
- `PATCH /orcamentos/{numeroOs}/rejeitar`
  - Rejeita o orçamento.
- `POST /public/orcamentos/notificacoes/aprovacao`
  - Simula uma notificação externa de aprovação.
  - Este endpoint é importante para o teste de integração exigido.

## Consulta pública

- `GET /public/ordens-servico/{numeroOs}/status`
  - Permite consultar o status da OS sem autenticação.

## Métricas

- `GET /metricas/tempo-medio`
  - Retorna a média geral de atendimento.
- `GET /metricas/tempo-medio-servicos`
  - Retorna a média por tipo de serviço.

## Fluxo recomendado de uso

1. Criar cliente.
2. Criar veículo.
3. Criar serviço e peça.
4. Abrir ordem de serviço com cliente, veículo, serviços e peças.
5. Registrar diagnóstico.
6. Criar orçamento.
7. Aprovar ou rejeitar o orçamento.
8. Finalizar a ordem.

## Pontos importantes para a demo

- O fluxo de escalabilidade usa `hey` contra `POST /auth/login`.
- Enquanto a carga sobe, acompanhe `kubectl get pods -n oficina -w`.
- Para observar a reação do HPA, use `kubectl get hpa -n oficina -w`.