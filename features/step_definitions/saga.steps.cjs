const assert = require("node:assert/strict");
const { Before, Given, When, Then } = require("@cucumber/cucumber");
const { transitionSaga } = require("../../dist/contexts/saga/application/saga-machine.js");

Before(function () {
  this.step = "OS_CREATED";
  this.commands = [];
});

function apply(world, event) {
  const result = transitionSaga(world.step, event);
  world.step = result.step;
  if (result.command) world.commands.push(result.command);
}

Given("uma nova ordem de serviço pronta para iniciar a Saga", function () {
  assert.equal(this.step, "OS_CREATED");
});

When("o OS Service solicitar a criação do orçamento", function () { apply(this, "StartSaga"); });
When("o Billing Service informar que o orçamento foi criado", function () { apply(this, "QuoteCreated"); });
When("o cliente aprovar o orçamento", function () { apply(this, "QuoteApproved"); });
When("o Execution Service iniciar e concluir o reparo", function () { apply(this, "ExecutionStarted"); apply(this, "ExecutionCompleted"); });
When("o Billing Service confirmar o pagamento", function () { apply(this, "PaymentConfirmed"); });

Given("uma ordem de serviço com orçamento aprovado e execução iniciada", function () {
  for (const event of ["StartSaga", "QuoteCreated", "QuoteApproved", "ExecutionStarted"]) apply(this, event);
  assert.equal(this.step, "IN_EXECUTION");
});

When("o Execution Service informar uma falha definitiva", function () { apply(this, "ExecutionFailed"); });
When("o Execution Service confirmar a liberação dos recursos", function () { apply(this, "ExecutionCancelled"); });
When("o Billing Service confirmar o cancelamento da aprovação", function () { apply(this, "QuoteApprovalCancelled"); });

Then("o OS Service deve solicitar o cancelamento da execução", function () { assert.equal(this.commands.at(-1), "CancelExecution"); });
Then("o OS Service deve solicitar o cancelamento da aprovação do orçamento", function () { assert.equal(this.commands.at(-1), "CancelQuoteApproval"); });
Then("a Saga deve terminar como {string}", function (expected) { assert.equal(this.step, expected); });
Then("os comandos do caminho feliz devem respeitar a ordem definida", function () { assert.deepEqual(this.commands, ["CreateQuote", "StartExecution", "RequestPayment"]); });
Then("os comandos compensatórios devem respeitar a ordem inversa", function () { assert.deepEqual(this.commands.slice(-2), ["CancelExecution", "CancelQuoteApproval"]); });
