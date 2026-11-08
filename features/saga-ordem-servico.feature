# language: pt
Funcionalidade: Saga distribuída da ordem de serviço
  Como responsável pela operação nacional da oficina
  Quero coordenar orçamento, execução e pagamento
  Para concluir a OS ou desfazer efeitos confirmados quando ocorrer uma falha

  Cenário: Concluir uma ordem de serviço pelo caminho feliz
    Dado uma nova ordem de serviço pronta para iniciar a Saga
    Quando o OS Service solicitar a criação do orçamento
    E o Billing Service informar que o orçamento foi criado
    E o cliente aprovar o orçamento
    E o Execution Service iniciar e concluir o reparo
    E o Billing Service confirmar o pagamento
    Então a Saga deve terminar como "COMPLETED"
    E os comandos do caminho feliz devem respeitar a ordem definida

  Cenário: Compensar orçamento e recursos após falha na execução
    Dado uma ordem de serviço com orçamento aprovado e execução iniciada
    Quando o Execution Service informar uma falha definitiva
    Então o OS Service deve solicitar o cancelamento da execução
    Quando o Execution Service confirmar a liberação dos recursos
    Então o OS Service deve solicitar o cancelamento da aprovação do orçamento
    Quando o Billing Service confirmar o cancelamento da aprovação
    Então a Saga deve terminar como "COMPENSATED"
    E os comandos compensatórios devem respeitar a ordem inversa
