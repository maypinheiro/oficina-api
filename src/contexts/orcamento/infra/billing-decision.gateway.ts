import { ApplicationError } from "../../../shared/application/application-error";

export type BillingDecision = "approve" | "reject";
export type BillingDecisionResult = { status: "APPROVED" | "REJECTED"; event: "QuoteApproved" | "QuoteRejected" };

type Fetch = (input: string, init: RequestInit) => Promise<Pick<Response, "ok" | "status" | "json">>;

export class BillingDecisionGateway {
  constructor(private readonly baseUrl: string, private readonly fetchFn: Fetch = fetch) {}

  async decide(orderId: string, decision: BillingDecision): Promise<BillingDecisionResult> {
    const response = await this.fetchFn(`${this.baseUrl}/budgets/${encodeURIComponent(orderId)}/decision`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision })
    });
    if (!response.ok) {
      throw new ApplicationError(response.status >= 400 && response.status < 500 ? response.status : 502, "Billing Service indisponivel");
    }
    return response.json() as Promise<BillingDecisionResult>;
  }
}
