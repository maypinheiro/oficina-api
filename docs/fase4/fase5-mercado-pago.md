# Fase 5 — Integração Mercado Pago

## Decisão

O Billing Service encapsula o provedor atrás de `PaymentGateway`. O domínio não depende do SDK nem dos formatos externos. Existem dois adaptadores:

- `MockPaymentGateway`, padrão para desenvolvimento, CI e demonstração sem movimentação financeira;
- `MercadoPagoGateway`, habilitado explicitamente por `PAYMENT_PROVIDER=mercado-pago`.

## Fluxo

1. `RequestPayment` chega ao Billing com `sagaId` e `correlationId`.
2. O serviço localiza o orçamento e cria uma cobrança Pix com referência externa da OS.
3. A chave estável `payment:<orderId>` é enviada em `X-Idempotency-Key` e persistida no PostgreSQL.
4. O QR Code e os identificadores são retornados no evento `PaymentCreated`.
5. O Mercado Pago chama `POST /webhooks/mercado-pago`.
6. O Billing valida `x-signature` com HMAC-SHA256 e comparação em tempo constante.
7. O serviço consulta o pagamento diretamente na API do provedor; não confia apenas no corpo do webhook.
8. Atualização do pagamento, deduplicação da notificação e evento `PaymentConfirmed`/`PaymentFailed` são gravados atomicamente.

## Segurança

`MERCADO_PAGO_ACCESS_TOKEN` e `MERCADO_PAGO_WEBHOOK_SECRET` são segredos de runtime e não entram no Git, em mensagens ou logs. O endpoint real exige HTTPS. A assinatura segue o manifesto oficial `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`.

## Operações compensatórias

- pagamento pendente: `PUT /v1/payments/{id}` com status `cancelled`;
- pagamento confirmado: `POST /v1/payments/{id}/refunds`, com chave `refund:<orderId>`;
- retries de criação e estorno reutilizam a mesma chave de idempotência.

Referências oficiais: [API do Mercado Pago](https://www.mercadopago.com.br/developers/pt/reference), [criação de pagamento Pix](https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/payment-brick/payment-submission/pix), [validação de Webhooks](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/additional-content/your-integrations/notifications/webhooks) e [reembolsos](https://www.mercadopago.com.br/developers/pt/reference/online-payments/checkout-api-payments/create-refund/post).

## Limitação do ambiente acadêmico

Nenhuma cobrança real foi criada nesta etapa, pois não foram fornecidas credenciais Sandbox do Mercado Pago. O adaptador real está coberto por testes HTTP determinísticos; o aceite externo deverá usar credenciais de teste e usuário de teste, nunca dados reais.
