import jwt from "jsonwebtoken";

import { authenticate } from "./authenticate";

describe("authenticate", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      JWT_SECRET: "test-secret"
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("rejeita requisicao sem bearer token", () => {
    const request = { headers: {} };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    authenticate(request as never, response as never, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: "Token JWT obrigatorio" });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejeita token invalido", () => {
    const request = { headers: { authorization: "Bearer invalido" } };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    authenticate(request as never, response as never, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: "Token JWT invalido" });
    expect(next).not.toHaveBeenCalled();
  });

  it("aceita token valido", () => {
    const token = jwt.sign({ sub: "admin" }, "test-secret");
    const request = { headers: { authorization: `Bearer ${token}` } };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    authenticate(request as never, response as never, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});

