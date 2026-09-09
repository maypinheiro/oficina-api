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
    process.env.ADMIN_USERNAME = "admin-user";
    process.env.ADMIN_PASSWORD = "admin-pass";
    process.env.CORS_ORIGIN = "http://localhost:3000";

    expect(loadEnv()).toEqual({
      nodeEnv: "test",
      port: 3333,
      databaseUrl: "postgresql://localhost:5432/oficina",
      jwtSecret: "secret",
      adminUsername: "admin-user",
      adminPassword: "admin-pass",
      corsOrigin: "http://localhost:3000"
    });
  });

  it("usa valores padrao quando variaveis opcionais nao existem", () => {
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.CORS_ORIGIN;

    expect(loadEnv()).toEqual({
      nodeEnv: "development",
      port: 3000,
      databaseUrl: undefined,
      jwtSecret: "local-dev-secret",
      adminUsername: "admin",
      adminPassword: "admin",
      corsOrigin: "*"
    });
  });
});
