# Estrutura DDD

Este projeto usa uma separacao inicial por contextos do SSD:

- `cadastro`
- `atendimento`
- `orcamento`
- `execucao`
- `estoque`

Cada contexto deve concentrar regras de dominio e expor casos de uso na camada de aplicacao. A camada HTTP deve apenas validar entrada, chamar casos de uso e formatar respostas.

