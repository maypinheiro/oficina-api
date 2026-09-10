import jwt from "jsonwebtoken";
import { generateKeyPairSync } from "node:crypto";

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
    const token = jwt.sign({ sub: "admin" }, "test-secret", { algorithm: "HS256" });
    const request = { headers: { authorization: `Bearer ${token}` } };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    authenticate(request as never, response as never, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("aceita token RS256 de cliente com emissor e audiencia esperados", () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    process.env.JWT_PUBLIC_KEY_BASE64 = Buffer.from(
      publicKey.export({ type: "spki", format: "pem" })
    ).toString("base64");
    process.env.JWT_ISSUER = "oficina-auth";
    process.env.JWT_AUDIENCE = "oficina-api";
    const token = jwt.sign({ scope: "cliente" }, privateKey, {
      algorithm: "RS256",
      subject: "cliente-1",
      issuer: "oficina-auth",
      audience: "oficina-api"
    });
    const request = { headers: { authorization: `Bearer ${token}` } };
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authenticate(request as never, response as never, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("rejeita algoritmo diferente do configurado", () => {
    const token = jwt.sign({ sub: "admin" }, "test-secret", { algorithm: "HS384" });
    const request = { headers: { authorization: `Bearer ${token}` } };
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authenticate(request as never, response as never, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
