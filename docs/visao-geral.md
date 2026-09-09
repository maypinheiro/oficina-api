# APIs principais

## Fluxo da oficina

1. Criar cliente.
2. Criar veículo.
3. Criar serviço.
4. Criar peça.
5. Abrir ordem de serviço com cliente, veículo, serviços e peças.
6. Registrar diagnóstico.
7. Criar orçamento.
8. Aprovar ou rejeitar o orçamento.
9. Finalizar e entregar a OS.

## Rotas principais

- `GET /health`
- `POST /auth/login`
- `POST /clientes`
- `POST /veiculos`
- `POST /servicos`
- `POST /pecas`
- `POST /ordens-servico`
- `GET /ordens-servico`
- `GET /ordens-servico/{numeroOs}`
- `GET /ordens-servico/{numeroOs}/historico`
- `POST /orcamentos`
- `PATCH /orcamentos/{numeroOs}/aprovar`
- `PATCH /orcamentos/{numeroOs}/rejeitar`
- `POST /public/orcamentos/notificacoes/aprovacao`
- `GET /public/ordens-servico/{numeroOs}/status`
- `GET /metricas/tempo-medio`
- `GET /metricas/tempo-medio-servicos`

## Regras importantes

- A OS recebe `cliente`, `veiculo`, `servicos` e `pecas` no payload.
- O endpoint público simula notificação externa.
- A lista de OS exclui `FINALIZADA` e `ENTREGUE`.
- A fila prioriza `EM_EXECUCAO > AGUARDANDO_APROVACAO > EM_DIAGNOSTICO > RECEBIDA`.
- A demonstração de escalabilidade usa `port-forward`, `hey`, `kubectl get pods -w` e `kubectl get hpa -w`.
- A consulta pública do status é feita sem autenticação.