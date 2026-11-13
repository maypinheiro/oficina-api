import { BillingDecisionGateway } from "./billing-decision.gateway";

describe("BillingDecisionGateway", () => {
  it("forwards an approval to the Billing Service", async () => {
    const fetchFn = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ status: "APPROVED", event: "QuoteApproved" }) });
    const result = await new BillingDecisionGateway("http://billing", fetchFn).decide("OS 1", "approve");
    expect(fetchFn).toHaveBeenCalledWith("http://billing/budgets/OS%201/decision", expect.objectContaining({ method: "POST", body: '{"decision":"approve"}' }));
    expect(result.event).toBe("QuoteApproved");
  });

  it("maps upstream failures to a safe gateway error", async () => {
    const fetchFn = jest.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    await expect(new BillingDecisionGateway("http://billing", fetchFn).decide("OS-1", "reject")).rejects.toMatchObject({ statusCode: 502 });
  });

  it("simulates an approved payment through the internal Billing endpoint", async () => {
    const fetchFn = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ paymentId: "pay-1", externalPaymentId: "mock-1", status: "approved", result: "processed" }) });
    const result = await new BillingDecisionGateway("http://billing", fetchFn).simulatePayment("OS 1", "approved");
    expect(fetchFn).toHaveBeenCalledWith("http://billing/payments/OS%201/simulate", expect.objectContaining({ method: "POST", body: '{"status":"approved"}' }));
    expect(result).toMatchObject({ status: "approved", result: "processed" });
  });

  it("maps payment simulation infrastructure errors to 502", async () => {
    const fetchFn = jest.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    await expect(new BillingDecisionGateway("http://billing", fetchFn).simulatePayment("OS-1", "rejected")).rejects.toMatchObject({ statusCode: 502 });
  });
});
