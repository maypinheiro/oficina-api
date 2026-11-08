# Fase 6 — BDD ponta a ponta da Saga

## Objetivo

O requisito de pelo menos um fluxo completo em BDD é atendido por uma especificação Gherkin executável com Cucumber. O texto usa linguagem de negócio em português e os steps carregam a máquina de estados compilada da aplicação; não existe uma implementação paralela apenas para o teste.

Arquivo: `features/saga-ordem-servico.feature`.

## Cenários automatizados

### Caminho feliz

1. OS Service inicia a Saga e emite `CreateQuote`;
2. Billing responde `QuoteCreated`;
3. aprovação gera `StartExecution`;
4. Execution inicia e conclui o reparo;
5. OS emite `RequestPayment`;
6. Billing confirma pagamento;
7. estado terminal esperado: `COMPLETED`.

O cenário também verifica a ordem exata dos comandos: `CreateQuote`, `StartExecution`, `RequestPayment`.

### Falha e compensação

1. a execução já foi iniciada após aprovação do orçamento;
2. Execution informa falha definitiva;
3. OS emite `CancelExecution`;
4. após `ExecutionCancelled`, OS emite `CancelQuoteApproval`;
5. Billing confirma `QuoteApprovalCancelled`;
6. estado terminal esperado: `COMPENSATED`.

O teste verifica que os comandos compensatórios seguem a ordem inversa dos efeitos confirmados.

## Execução e evidência

```bash
npm run test:bdd
```

Resultado esperado: `2 scenarios (2 passed)` e `18 steps (18 passed)`. O workflow `.github/workflows/ci.yml` executa esse comando obrigatoriamente em cada pull request para `develop`, `homolog` ou `main`; portanto uma regressão no fluxo bloqueia o merge.

O BDD é determinístico e não movimenta dinheiro nem depende de AWS/Mercado Pago. Testes integrados com infraestrutura real serão uma camada adicional, não substituta.
