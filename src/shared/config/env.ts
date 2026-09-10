import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(1).default("local-dev-secret"),
  JWT_PUBLIC_KEY_BASE64: z.string().min(1).optional(),
  JWT_ISSUER: z.string().min(1).default("oficina-auth"),
  JWT_AUDIENCE: z.string().min(1).default("oficina-api"),
  ADMIN_USERNAME: z.string().min(1).default("admin"),
  ADMIN_PASSWORD: z.string().min(1).default("admin"),
  CORS_ORIGIN: z.string().min(1).default("*")
});

export type Env = {
  nodeEnv: "development" | "test" | "production";
  port: number;
  databaseUrl?: string;
  jwtSecret: string;
  jwtPublicKeyBase64?: string;
  jwtIssuer: string;
  jwtAudience: string;
  adminUsername: string;
  adminPassword: string;
  corsOrigin: string;
};

export function loadEnv(): Env {
  const env = envSchema.parse(process.env);

  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    databaseUrl: env.DATABASE_URL,
    jwtSecret: env.JWT_SECRET,
    jwtPublicKeyBase64: env.JWT_PUBLIC_KEY_BASE64,
    jwtIssuer: env.JWT_ISSUER,
    jwtAudience: env.JWT_AUDIENCE,
    adminUsername: env.ADMIN_USERNAME,
    adminPassword: env.ADMIN_PASSWORD,
    corsOrigin: env.CORS_ORIGIN
  };
}
