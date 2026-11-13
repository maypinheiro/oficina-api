import { loadEnv } from "./env";

describe("loadEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("carrega configuracoes normalizadas do ambiente", () => {
    process.env.NODE_ENV = "test";
    process.env.PORT = "3333";
    process.env.DATABASE_URL = "postgresql://localhost:5432/oficina";
    process.env.JWT_SECRET = "secret";
    process.env.JWT_PUBLIC_KEY_BASE64 = "public-key-base64";
    process.env.JWT_ISSUER = "issuer";
    process.env.JWT_AUDIENCE = "audience";
    process.env.ADMIN_USERNAME = "admin-user";
    process.env.ADMIN_PASSWORD = "admin-pass";
    process.env.CORS_ORIGIN = "http://localhost:3000";
    process.env.SAGA_ENABLED = "true";
    process.env.OS_EVENTS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/os-events";
    process.env.BILLING_COMMAND_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/billing";
    process.env.BILLING_SERVICE_URL = "http://billing.test";
    process.env.EXECUTION_COMMAND_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/execution";
    process.env.DD_ENV = "hml";

    expect(loadEnv()).toEqual({
      nodeEnv: "test",
      port: 3333,
      databaseUrl: "postgresql://localhost:5432/oficina",
      jwtSecret: "secret",
      jwtPublicKeyBase64: "public-key-base64",
      jwtIssuer: "issuer",
      jwtAudience: "audience",
      adminUsername: "admin-user",
      adminPassword: "admin-pass",
      corsOrigin: "http://localhost:3000",
      sagaEnabled: true,
      osEventsQueueUrl: "https://sqs.us-east-1.amazonaws.com/123/os-events",
      billingCommandQueueUrl: "https://sqs.us-east-1.amazonaws.com/123/billing",
      billingServiceUrl: "http://billing.test",
      executionCommandQueueUrl: "https://sqs.us-east-1.amazonaws.com/123/execution",
      sagaSimulationEnabled: true
    });
  });

  it("usa valores padrao quando variaveis opcionais nao existem", () => {
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_PUBLIC_KEY_BASE64;
    delete process.env.JWT_ISSUER;
    delete process.env.JWT_AUDIENCE;
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.CORS_ORIGIN;
    delete process.env.SAGA_ENABLED;
    delete process.env.OS_EVENTS_QUEUE_URL;
    delete process.env.BILLING_COMMAND_QUEUE_URL;
    delete process.env.BILLING_SERVICE_URL;
    delete process.env.EXECUTION_COMMAND_QUEUE_URL;
    delete process.env.DD_ENV;

    expect(loadEnv()).toEqual({
      nodeEnv: "development",
      port: 3000,
      databaseUrl: undefined,
      jwtSecret: "local-dev-secret",
      jwtPublicKeyBase64: undefined,
      jwtIssuer: "oficina-auth",
      jwtAudience: "oficina-api",
      adminUsername: "admin",
      adminPassword: "admin",
      corsOrigin: "*",
      sagaEnabled: false,
      osEventsQueueUrl: undefined,
      billingCommandQueueUrl: undefined,
      billingServiceUrl: "http://oficina-billing-service.oficina-billing.svc.cluster.local",
      executionCommandQueueUrl: undefined,
      sagaSimulationEnabled: false
    });
  });
});
