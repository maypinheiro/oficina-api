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
  ADMIN_USERNAME: z.string().min(1).default("admin"),
  ADMIN_PASSWORD: z.string().min(1).default("admin"),
  CORS_ORIGIN: z.string().min(1).default("*")
});

export type Env = {
  nodeEnv: "development" | "test" | "production";
  port: number;
  databaseUrl?: string;
  jwtSecret: string;
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
    adminUsername: env.ADMIN_USERNAME,
    adminPassword: env.ADMIN_PASSWORD,
    corsOrigin: env.CORS_ORIGIN
  };
}
