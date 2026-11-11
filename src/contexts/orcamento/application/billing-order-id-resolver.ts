export interface BillingOrderIdResolver {
  resolve(numeroOs: string): Promise<string>;
}
